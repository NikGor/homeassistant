/**
 * ChatAssistant - главный компонент чат-приложения
 * Фасад, объединяющий все функциональности
 */

import { ChatAPI } from './core/ChatAPI.js';
import { MessageComponent } from './components/MessageComponent.js';
import { 
    SendIcon, MenuIcon, SearchIcon, PlusIcon, ArrowLeftIcon,
    UserIcon, BotIcon, MessageCircleIcon, CpuIcon, TrashIcon, XIcon, CheckIcon, MoreVerticalIcon
} from './components/Icons.js';
import { formatTime, formatDate } from './utils/Formatters.js';

/**
 * Главный компонент чат-приложения
 */
export const ChatAssistant = () => {
    // React hooks
    const { useState, useRef, useEffect } = React;
    
    // State
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedModel, setSelectedModel] = useState('gpt-4.1');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatListOpen, setIsChatListOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    // Refs
    const messagesEndRef = useRef(null);
    const api = useRef(new ChatAPI());

    // Effects
    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);

    // Обработка Escape с приоритетами
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (isChatListOpen) {
                    setIsChatListOpen(false);
                }
                // Модальные окна в header обрабатываются внутри AppHeader
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isChatListOpen]);

    // Функции
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const convos = await api.current.getConversations();
            setConversations(convos);
        } catch (err) {
            setError(`Не удалось загрузить чаты: ${err.message}`);
        }
    };

    const selectConversation = async (conversationId) => {
        setCurrentConversation(conversationId);
        
        // Если это временный чат, просто очищаем сообщения
        if (conversationId.startsWith('temp-')) {
            setMessages([]);
            return;
        }
        
        try {
            const msgs = await api.current.getMessages(conversationId);
            setMessages(msgs);
        } catch (err) {
            setError(`Не удалось загрузить сообщения: ${err.message}`);
        }
    };

    const createNewChat = () => {
        // Создаем временный чат без запроса к серверу
        const tempChatId = `temp-${Date.now()}`;
        const tempConvo = {
            conversation_id: tempChatId,
            title: 'Новый чат',
            created_at: new Date().toISOString(),
            is_temp: true
        };
        
        setConversations(prev => [tempConvo, ...prev]);
        setCurrentConversation(tempChatId);
        setMessages([]);
    };

    const sendMessage = async (messageText = inputValue) => {
        if (!messageText?.trim() || !currentConversation || isLoading) return;

        const userMessage = {
            message_id: `temp-user-${Date.now()}`,
            role: 'user',
            content: {
                content_format: 'plain',
                text: messageText
            },
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            let conversationId = currentConversation;
            
            // Если это временный чат, сначала создаем реальную беседу
            if (currentConversation.startsWith('temp-')) {
                const newConvo = await api.current.createConversation();
                conversationId = newConvo.conversation_id;
                
                // Обновляем список чатов - заменяем временный на реальный
                setConversations(prev => prev.map(conv => 
                    conv.conversation_id === currentConversation 
                        ? { ...newConvo, title: `Новый чат ${formatTime(new Date())}` }
                        : conv
                ));
                setCurrentConversation(conversationId);
            }

            // Находим последнее сообщение от assistant для previous_message_id
            const lastAssistantMessage = messages
                .filter(msg => msg.role === 'assistant')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            const result = await api.current.sendMessage({
                response_format: 'ui_answer',
                input: messageText,
                conversation_id: conversationId,
                previous_message_id: lastAssistantMessage?.message_id || null,
                model: selectedModel
            });

            const assistantMessage = {
                message_id: result.message_id || `temp-assistant-${Date.now()}`,
                role: 'assistant',
                content: result.content || {
                    content_format: 'ui_answer',
                    ui_answer: result.ui_answer
                },
                created_at: result.created_at || new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setError(`Не удалось отправить сообщение: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteConversation = async (conversationId) => {
        try {
            await api.current.deleteConversation(conversationId);
            setConversations(prev => prev.filter(conv => conv.conversation_id !== conversationId));
            
            // Если удаляем текущий чат, сбрасываем выбор
            if (currentConversation === conversationId) {
                setCurrentConversation(null);
                setMessages([]);
            }
            
            setDeleteConfirmId(null);
            setOpenMenuId(null);
        } catch (err) {
            setError(`Не удалось удалить чат: ${err.message}`);
        }
    };

    const executeCommand = async (command, assistantRequest) => {
        if (!currentConversation) return;
        
        // Специальная обработка для команд навигации
        if (command === 'show_on_map' || command === 'route') {
            if (assistantRequest && assistantRequest.startsWith('http')) {
                // Открываем URL в новой вкладке
                window.open(assistantRequest, '_blank');
                return;
            }
        }
        
        // Для assistant_button команд отправляем assistantRequest
        if (command === 'assistant_button' && assistantRequest) {
            await sendMessage(assistantRequest);
            return;
        }
        
        // Для остальных команд отправляем как сообщение
        await sendMessage(assistantRequest || command);
    };



    // Рендеринг
    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chatListClasses = `fixed top-0 right-0 bottom-0 w-80 backdrop-blur-lg bg-white/10 border-l border-white/20 shadow-2xl z-40 transform transition-transform duration-300 ${
        isChatListOpen ? 'translate-x-0' : 'translate-x-full'
    }`;

    const contentClasses = ``; // Убираем push-эффект, чтобы скроллбар оставался на месте

    const chatAreaClasses = `chat-area p-6 max-w-4xl mx-auto`; // Убираем изменение макета при открытии шторки
    const inputAreaClasses = 'input-fixed';

    return React.createElement('div', {
        className: 'layout-container'
    }, [
        // Контент с push-эффектом
        React.createElement('div', {
            key: 'content',
            className: contentClasses
        }, [
            // Header
            React.createElement(AppHeader, {
                key: 'header',
                selectedModel,
                onModelChange: setSelectedModel,
                onToggleChatList: () => setIsChatListOpen(!isChatListOpen),
                onCreateNewChat: createNewChat
            }),

            // Chat Area
            React.createElement(ChatArea, {
                key: 'chat-area',
                className: chatAreaClasses,
                currentConversation,
                messages,
                isLoading,
                messagesEndRef,
                executeCommand,
                onCreateNewChat: createNewChat,
                isChatListOpen: isChatListOpen
            }),

            // Input Area
            React.createElement(InputArea, {
                key: 'input-area',
                className: inputAreaClasses,
                inputValue,
                isLoading,
                currentConversation,
                onInputChange: setInputValue,
                onSendMessage: () => sendMessage(),
                onKeyPress: (e) => e.key === 'Enter' && sendMessage()
            })
        ]),

        // Боковая шторка чатов
        React.createElement(ChatListSidebar, {
            key: 'chat-list',
            className: chatListClasses,
            conversations: filteredConversations,
            currentConversation,
            searchQuery,
            openMenuId,
            deleteConfirmId,
            selectedModel,
            onSearchChange: setSearchQuery,
            onSelectConversation: selectConversation,
            onCreateNewChat: createNewChat,
            onDeleteConversation: deleteConversation,
            onToggleMenu: (id) => setOpenMenuId(openMenuId === id ? null : id),
            onConfirmDelete: setDeleteConfirmId,
            onCancelDelete: () => {
                setDeleteConfirmId(null);
                setOpenMenuId(null);
            },
            onClose: () => setIsChatListOpen(false),
            onModelChange: setSelectedModel
        }),

        // Error Toast
        error ? React.createElement(ErrorToast, {
            key: 'error',
            error,
            onClose: () => setError(null)
        }) : null
    ].filter(Boolean));
};

// Вспомогательные компоненты
const AppHeader = ({ selectedModel, onModelChange, onToggleChatList, onCreateNewChat }) => {
    const { useState, useEffect } = React;
    const [isModelDropdown, setIsModelDropdown] = useState(false);

    const availableModels = [
        { value: 'gpt-4.1', label: 'GPT-4.1' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' }
    ];

    // Обработка Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsModelDropdown(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Закрытие по клику снаружи
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isModelDropdown && !e.target.closest('.model-dropdown')) {
                setIsModelDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isModelDropdown]);

    const handleModelSelect = (modelValue) => {
        onModelChange(modelValue);
        setIsModelDropdown(false);
    };

    const handleSidebarToggle = () => {
        onToggleChatList();
    };

    return React.createElement('div', {
        className: 'fixed top-0 right-0 bottom-0 w-16 backdrop-blur-lg bg-white/10 border-l border-white/20 shadow-2xl z-30 flex flex-col',
        onClick: (e) => {
            // Если клик не по кнопкам - показываем шторку
            if (e.target === e.currentTarget) {
                handleSidebarToggle();
            }
        }
    }, [
        // Кнопка "Новый чат"
        React.createElement('button', {
            key: 'new-chat',
            onClick: (e) => {
                e.stopPropagation();
                onCreateNewChat();
            },
            className: 'h-16 flex items-center justify-center text-white hover:bg-white/10 border-b border-white/10'
        }, React.createElement(PlusIcon)),

        // Кнопка "Выбор модели" с dropdown
        React.createElement('div', {
            key: 'model-container',
            className: 'model-dropdown relative h-16'
        }, [
            React.createElement('button', {
                key: 'model-button',
                onClick: (e) => {
                    e.stopPropagation();
                    setIsModelDropdown(!isModelDropdown);
                },
                className: 'w-full h-full flex items-center justify-center text-white hover:bg-white/10 border-b border-white/10'
            }, React.createElement(CpuIcon)),

            // Выпадающее меню выбора модели
            isModelDropdown ? React.createElement('div', {
                key: 'model-dropdown-menu',
                className: 'absolute right-20 top-0 w-64 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden'
            }, availableModels.map(model =>
                React.createElement('button', {
                    key: model.value,
                    onClick: () => handleModelSelect(model.value),
                    className: `w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center justify-between border-b border-white/10 last:border-b-0 ${
                        selectedModel === model.value ? 'bg-white/10' : ''
                    }`
                }, [
                    React.createElement('span', { key: 'label' }, model.label),
                    selectedModel === model.value ? React.createElement(CheckIcon, {
                        key: 'check',
                        className: 'text-green-400'
                    }) : null
                ])
            )) : null
        ]),

        // Свободное место для клика (расширяется на всю оставшуюся высоту)
        React.createElement('div', {
            key: 'expandable-area',
            className: 'flex-1 cursor-pointer hover:bg-white/5 transition-all duration-200',
            onClick: (e) => {
                e.stopPropagation();
                handleSidebarToggle();
            }
        })
    ]);
};

const ChatListSidebar = ({ className, conversations, currentConversation, searchQuery, onSearchChange, onSelectConversation, onCreateNewChat, onDeleteConversation, openMenuId, onToggleMenu, deleteConfirmId, onConfirmDelete, onCancelDelete, onClose, selectedModel, onModelChange }) => {
    const { useState, useEffect } = React;
    const [isModelDropdown, setIsModelDropdown] = useState(false);

    const availableModels = [
        { value: 'gpt-4.1', label: 'GPT-4.1' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' }
    ];

    // Закрытие по клику снаружи
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isModelDropdown && !e.target.closest('.sidebar-model-dropdown')) {
                setIsModelDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isModelDropdown]);

    const handleModelSelect = (modelValue) => {
        onModelChange(modelValue);
        setIsModelDropdown(false);
    };

    return React.createElement('div', { className }, [
        // Верхняя часть - те же иконки на тех же местах, но в виде пунктов меню
        React.createElement('div', {
            key: 'header',
            className: 'border-b border-white/20'
        }, [
            // Кнопка закрытия в правом верхнем углу
            React.createElement('div', {
                key: 'close-bar',
                className: 'flex justify-end p-2'
            }, React.createElement('button', {
                key: 'close',
                onClick: onClose,
                className: 'p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
            }, React.createElement(XIcon))),

            // Меню с двумя пунктами на тех же местах, что и в узкой панели
            React.createElement('div', {
                key: 'menu-items',
                className: 'flex flex-col'
            }, [
                // Новый чат - на том же месте, что первая кнопка в узкой панели
                React.createElement('button', {
                    key: 'new-chat',
                    onClick: onCreateNewChat,
                    className: 'h-16 px-4 bg-white/10 hover:bg-white/20 font-semibold text-white flex items-center gap-3 border-b border-white/10'
                }, [React.createElement(PlusIcon, { key: 'icon' }), 'Новый чат']),
                
                // Выбор модели - на том же месте, что вторая кнопка в узкой панели
                React.createElement('div', {
                    key: 'model-container',
                    className: 'sidebar-model-dropdown relative h-16'
                }, [
                    React.createElement('button', {
                        key: 'model-button',
                        onClick: () => setIsModelDropdown(!isModelDropdown),
                        className: 'w-full h-full px-4 bg-white/10 hover:bg-white/20 font-semibold text-white flex items-center gap-3 border-b border-white/10'
                    }, [
                        React.createElement(CpuIcon, { key: 'icon' }),
                        React.createElement('div', { key: 'text', className: 'flex-1 text-left' }, [
                            React.createElement('div', { key: 'title' }, 'Выбор модели'),
                            React.createElement('div', {
                                key: 'subtitle',
                                className: 'text-xs text-white/60'
                            }, availableModels.find(m => m.value === selectedModel)?.label)
                        ])
                    ]),

                    // Выпадающее меню выбора модели
                    isModelDropdown ? React.createElement('div', {
                        key: 'model-dropdown-menu',
                        className: 'absolute left-4 right-4 top-full mt-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden'
                    }, availableModels.map(model =>
                        React.createElement('button', {
                            key: model.value,
                            onClick: () => handleModelSelect(model.value),
                            className: `w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center justify-between border-b border-white/10 last:border-b-0 ${
                                selectedModel === model.value ? 'bg-white/10' : ''
                            }`
                        }, [
                            React.createElement('span', { key: 'label' }, model.label),
                            selectedModel === model.value ? React.createElement(CheckIcon, {
                                key: 'check',
                                className: 'text-green-400'
                            }) : null
                        ])
                    )) : null
                ])
            ]),
            
            // Поиск под пунктами меню
            React.createElement('div', {
                key: 'search',
                className: 'relative p-4'
            }, [
                React.createElement('div', {
                    key: 'icon',
                    className: 'absolute left-7 top-7.5 text-white/60 pointer-events-none'
                }, React.createElement(SearchIcon)),
                React.createElement('input', {
                    key: 'input',
                    type: 'text',
                    placeholder: 'Поиск по чатам...',
                    value: searchQuery,
                    onChange: (e) => onSearchChange(e.target.value),
                    className: 'w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all'
                })
            ])
        ]),
        React.createElement('div', {
            key: 'list',
            className: 'flex-1 overflow-y-auto p-2 scrollbar-thin'
        }, conversations.map((conversation) =>
            React.createElement('div', {
                key: conversation.conversation_id,
                className: `relative w-full mb-2 rounded-2xl hover:border-white/40 ${
                    currentConversation === conversation.conversation_id
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                } ${conversation.is_temp ? 'border-2 border-dashed border-amber-500/50' : ''}`
            }, [
                React.createElement('button', {
                    key: 'main-button',
                    onClick: () => onSelectConversation(conversation.conversation_id),
                    className: 'w-full p-4 text-left rounded-2xl'
                }, [
                    React.createElement('div', {
                        key: 'title',
                        className: 'font-medium truncate flex items-center gap-2 pr-10'
                    }, [
                        conversation.title,
                        conversation.is_temp ? React.createElement('span', {
                            key: 'temp',
                            className: 'text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full'
                        }, 'не сохранен') : null
                    ]),
                    React.createElement('div', {
                        key: 'date',
                        className: 'text-sm opacity-60 mt-1'
                    }, conversation.is_temp ? 'Новый чат' : formatDate(conversation.created_at))
                ]),
                
                // Меню с тремя точками (только для несохраненных чатов)
                !conversation.is_temp ? React.createElement('div', {
                    key: 'menu-container',
                    className: 'absolute top-3 right-3'
                }, [
                    React.createElement('button', {
                        key: 'menu-button',
                        onClick: (e) => {
                            e.stopPropagation();
                            onToggleMenu(conversation.conversation_id);
                        },
                        className: 'p-1 rounded-full hover:bg-white/20 transition-all'
                    }, React.createElement(MoreVerticalIcon)),
                    
                    // Dropdown меню
                    openMenuId === conversation.conversation_id ? React.createElement('div', {
                        key: 'dropdown',
                        className: 'absolute right-0 top-8 z-50 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg shadow-xl min-w-[120px]'
                    }, React.createElement('button', {
                        onClick: (e) => {
                            e.stopPropagation();
                            onConfirmDelete(conversation.conversation_id);
                        },
                        className: 'w-full px-4 py-2 text-left text-red-300 hover:bg-red-600/20 rounded-lg transition-all flex items-center gap-2'
                    }, [React.createElement(TrashIcon, { key: 'icon' }), 'Удалить'])) : null
                ]) : null
            ])
        )),
        
        // Модальное окно подтверждения удаления
        deleteConfirmId ? React.createElement('div', {
            key: 'delete-modal',
            className: 'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50',
            onClick: onCancelDelete
        }, React.createElement('div', {
            className: 'backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md mx-4',
            onClick: (e) => e.stopPropagation()
        }, [
            React.createElement('div', {
                key: 'content',
                className: 'text-center'
            }, [
                React.createElement('div', {
                    key: 'icon',
                    className: 'w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4'
                }, React.createElement(TrashIcon, { className: 'w-8 h-8' })),
                React.createElement('h3', {
                    key: 'title',
                    className: 'text-xl font-bold text-white mb-2'
                }, 'Удалить чат?'),
                React.createElement('p', {
                    key: 'description',
                    className: 'text-white/70 mb-6'
                }, 'Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.'),
                React.createElement('div', {
                    key: 'buttons',
                    className: 'flex gap-3'
                }, [
                    React.createElement('button', {
                        key: 'cancel',
                        onClick: onCancelDelete,
                        className: 'flex-1 py-3 px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 hover:border-white/40'
                    }, 'Отмена'),
                    React.createElement('button', {
                        key: 'delete',
                        onClick: () => onDeleteConversation(deleteConfirmId),
                        className: 'flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-semibold hover:from-red-500 hover:to-red-600 border border-red-500/30 hover:border-red-400/50'
                    }, 'Удалить')
                ])
            ])
        ])) : null
    ]);
};

const ChatArea = ({ className, currentConversation, messages, isLoading, messagesEndRef, executeCommand, onCreateNewChat, isChatListOpen }) => {
    return React.createElement('div', { className }, 
        currentConversation ? [
            messages.length === 0 ? React.createElement(EmptyState, {
                key: 'empty'
            }) : React.createElement('div', {
                key: 'messages'
            }, 
                // Если шторка чатов открыта - показываем полный диалог, иначе только последнее сообщение
                isChatListOpen ? [
                    // Полный список сообщений
                    ...messages.map((message, index) => React.cloneElement(MessageComponent(message, executeCommand), { key: `message-${message.message_id || index}` })),
                    isLoading ? React.createElement(TypingIndicator, { key: 'typing' }) : null,
                    React.createElement('div', { key: 'end', ref: messagesEndRef })
                ].filter(Boolean) : [
                    // Только последнее сообщение
                    messages.length > 0 ? React.cloneElement(MessageComponent(messages[messages.length - 1], executeCommand), { key: `last-message-${messages[messages.length - 1].message_id}` }) : null,
                    isLoading ? React.createElement(TypingIndicator, { key: 'typing' }) : null,
                    React.createElement('div', { key: 'end', ref: messagesEndRef })
                ].filter(Boolean)
            )
        ].filter(Boolean) : React.createElement(WelcomeScreen, {
            key: 'welcome',
            onCreateNewChat
        })
    );
};

const InputArea = ({ className, inputValue, isLoading, currentConversation, onInputChange, onSendMessage, onKeyPress }) => {
    return React.createElement('div', { 
        className: `${className} flex items-center gap-3`
    }, [
        React.createElement('input', {
            key: 'input',
            type: 'text',
            value: inputValue,
            onChange: (e) => onInputChange(e.target.value),
            onKeyPress: onKeyPress,
            placeholder: 'Напишите сообщение...',
            disabled: isLoading,
            className: 'flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all'
        }),
        React.createElement('button', {
            key: 'send',
            onClick: onSendMessage,
            disabled: !inputValue?.trim() || isLoading || !currentConversation,
            className: 'w-12 h-12 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50 text-white border border-slate-500/30 hover:border-slate-400/50 flex items-center justify-center'
        }, React.createElement(SendIcon))
    ]);
};

const EmptyState = () => {
    return React.createElement('div', {
        className: 'flex items-center justify-center h-full'
    }, React.createElement('div', {
        className: 'text-center text-white/60'
    }, [
        React.createElement(MessageCircleIcon, { key: 'icon' }),
        React.createElement('p', {
            key: 'text',
            className: 'text-lg mt-4'
        }, 'Начните разговор с Archie')
    ]));
};

const WelcomeScreen = ({ onCreateNewChat }) => {
    return React.createElement('div', {
        className: 'flex items-center justify-center h-full'
    }, React.createElement('div', {
        className: 'text-center text-white/60'
    }, [
        React.createElement(MessageCircleIcon, { key: 'icon' }),
        React.createElement('h2', {
            key: 'title',
            className: 'text-2xl font-bold mb-2 mt-6'
        }, 'Добро пожаловать в Archie'),
        React.createElement('p', {
            key: 'subtitle',
            className: 'text-lg mb-6'
        }, 'Выберите чат или создайте новый для начала разговора'),
        React.createElement('button', {
            key: 'create',
            onClick: onCreateNewChat,
            className: 'px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-full font-semibold text-white border border-slate-500/30 hover:border-slate-400/50 flex items-center gap-2 mx-auto'
        }, [React.createElement(PlusIcon, { key: 'icon' }), 'Создать новый чат'])
    ]));
};

const TypingIndicator = () => {
    return React.createElement('div', {
        className: 'flex justify-start mb-6'
    }, React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'flex items-center gap-2'
        }, [
            React.createElement(BotIcon),
            React.createElement('span', {
                key: 'text',
                className: 'text-sm opacity-70'
            }, 'Archie печатает')
        ]),
        React.createElement('div', {
            key: 'dots',
            className: 'flex gap-1 mt-3'
        }, [
            React.createElement('div', {
                key: 'dot1',
                className: 'w-2 h-2 bg-white/60 rounded-full animate-pulse'
            }),
            React.createElement('div', {
                key: 'dot2',
                className: 'w-2 h-2 bg-white/60 rounded-full animate-pulse',
                style: { animationDelay: '0.2s' }
            }),
            React.createElement('div', {
                key: 'dot3',
                className: 'w-2 h-2 bg-white/60 rounded-full animate-pulse',
                style: { animationDelay: '0.4s' }
            })
        ])
    ]));
};

const ErrorToast = ({ error, onClose }) => {
    return React.createElement('div', {
        className: 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-md animate-pulse z-50'
    }, [
        error,
        React.createElement('button', {
            key: 'close',
            onClick: onClose,
            className: 'ml-3 text-white/80 hover:text-white transition-all'
        }, '×')
    ]);
};
