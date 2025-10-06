/**
 * ChatAssistant - главный компонент чат-приложения
 * Фасад, объединяющий все функциональности
 */

import { ChatAPI } from './core/ChatAPI.js';
import { MessageComponent } from './components/MessageComponent.js';
import { 
    SendIcon, MenuIcon, SearchIcon, PlusIcon, ArrowLeftIcon,
    UserIcon, BotIcon, MessageCircleIcon 
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    
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
            text: messageText,
            text_format: 'html',
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
                role: 'user',
                text: messageText,
                text_format: 'html',
                conversation_id: conversationId,
                previous_message_id: lastAssistantMessage?.message_id || null,
                model: selectedModel
            });

            const assistantMessage = {
                message_id: result.message_id || `temp-assistant-${Date.now()}`,
                role: 'assistant',
                text: result.text,
                text_format: result.text_format,
                created_at: result.created_at || new Date().toISOString(),
                metadata: result.metadata
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setError(`Не удалось отправить сообщение: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const executeCommand = async (command, assistantRequest) => {
        if (!currentConversation) return;
        await sendMessage(assistantRequest || command);
    };



    // Рендеринг
    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sidebarClasses = `sidebar-fixed backdrop-blur-md bg-white/10 border-r border-white/20 shadow-2xl flex flex-col ${
        !isSidebarOpen ? 'sidebar-hidden' : ''
    }`;

    const chatAreaClasses = `chat-area p-6 ${!isSidebarOpen ? 'chat-area-full' : ''}`;
    const inputAreaClasses = `input-fixed p-4 border-t border-white/20 backdrop-blur-md bg-white/5 flex items-center gap-3 ${
        !isSidebarOpen ? 'input-full' : ''
    }`;

    return React.createElement('div', {
        className: 'layout-container'
    }, [
        // Header
        React.createElement(AppHeader, {
            key: 'header',
            isSidebarOpen,
            selectedModel,
            onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
            onModelChange: setSelectedModel
        }),

        // Sidebar
        React.createElement(AppSidebar, {
            key: 'sidebar',
            className: sidebarClasses,
            conversations: filteredConversations,
            currentConversation,
            searchQuery,
            onSearchChange: setSearchQuery,
            onSelectConversation: selectConversation,
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
            onCreateNewChat: createNewChat
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
const AppHeader = ({ isSidebarOpen, selectedModel, onToggleSidebar, onModelChange }) => {
    const availableModels = [
        { value: 'gpt-4.1', label: 'GPT-4.1' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' }
    ];

    return React.createElement('header', {
        className: 'header-fixed backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-2xl flex items-center justify-between'
    }, [
        React.createElement('div', {
            key: 'left',
            className: 'flex items-center gap-4'
        }, [
            React.createElement('button', {
                key: 'menu',
                onClick: onToggleSidebar,
                className: 'p-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 transition-all duration-300 hover:scale-110 shadow-lg active:scale-95'
            }, React.createElement(MenuIcon)),
            React.createElement('h1', {
                key: 'title',
                className: 'text-2xl font-bold text-white'
            }, 'Archie AI')
        ]),
        React.createElement('div', {
            key: 'center',
            className: 'flex items-center gap-3'
        }, [
            React.createElement('div', {
                key: 'model-selector',
                className: 'flex items-center gap-2'
            }, [
                React.createElement('span', {
                    key: 'label',
                    className: 'text-white/80 text-sm font-medium'
                }, 'Модель:'),
                React.createElement('select', {
                    key: 'select',
                    value: selectedModel,
                    onChange: (e) => onModelChange(e.target.value),
                    className: 'px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all hover:bg-white/20'
                }, availableModels.map(model => 
                    React.createElement('option', {
                        key: model.value,
                        value: model.value,
                        className: 'bg-slate-800 text-white'
                    }, model.label)
                ))
            ])
        ]),
        React.createElement('div', {
            key: 'right',
            className: 'flex items-center gap-3'
        }, [
            React.createElement('button', {
                key: 'home',
                onClick: () => window.location.href = '/',
                className: 'px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-white/30'
            }, [React.createElement(ArrowLeftIcon), 'Главная'])
        ])
    ]);
};

const AppSidebar = ({ className, conversations, currentConversation, searchQuery, onSearchChange, onSelectConversation, onCreateNewChat }) => {
    return React.createElement('div', { className }, [
        React.createElement('div', {
            key: 'header',
            className: 'p-4 border-b border-white/20'
        }, [
            React.createElement('h2', {
                key: 'title',
                className: 'text-xl font-bold text-white mb-4'
            }, 'Чаты'),
            React.createElement('button', {
                key: 'new-chat',
                onClick: onCreateNewChat,
                className: 'w-full mb-4 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50'
            }, [React.createElement(PlusIcon), 'Новый чат']),
            React.createElement('div', {
                key: 'search',
                className: 'relative'
            }, [
                React.createElement('div', {
                    key: 'icon',
                    className: 'absolute left-3 top-3.5 text-white/60 pointer-events-none'
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
            className: 'flex-1 overflow-y-auto p-2'
        }, conversations.map((conversation) =>
            React.createElement('button', {
                key: conversation.conversation_id,
                onClick: () => onSelectConversation(conversation.conversation_id),
                className: `w-full p-4 mb-2 rounded-2xl text-left transition-all duration-300 hover:scale-105 ${
                    currentConversation === conversation.conversation_id
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                } ${conversation.is_temp ? 'border-2 border-dashed border-amber-500/50' : ''}`
            }, [
                React.createElement('div', {
                    key: 'title',
                    className: 'font-medium truncate flex items-center gap-2'
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
            ])
        ))
    ]);
};

const ChatArea = ({ className, currentConversation, messages, isLoading, messagesEndRef, executeCommand, onCreateNewChat }) => {
    return React.createElement('div', { className }, 
        currentConversation ? [
            messages.length === 0 ? React.createElement(EmptyState, {
                key: 'empty'
            }) : React.createElement('div', {
                key: 'messages'
            }, [
                ...messages.map(message => MessageComponent(message, executeCommand)),
                isLoading ? React.createElement(TypingIndicator, { key: 'typing' }) : null,
                React.createElement('div', { key: 'end', ref: messagesEndRef })
            ])
        ] : React.createElement(WelcomeScreen, {
            key: 'welcome',
            onCreateNewChat
        })
    );
};

const InputArea = ({ className, inputValue, isLoading, currentConversation, onInputChange, onSendMessage, onKeyPress }) => {
    return React.createElement('div', { className }, [
        React.createElement('div', {
            key: 'input-container',
            className: 'flex-1 relative'
        }, React.createElement('input', {
            type: 'text',
            value: inputValue,
            onChange: (e) => onInputChange(e.target.value),
            onKeyPress: onKeyPress,
            placeholder: 'Напишите сообщение...',
            disabled: isLoading,
            className: 'w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all'
        })),
        React.createElement('button', {
            key: 'send',
            onClick: onSendMessage,
            disabled: !inputValue?.trim() || isLoading || !currentConversation,
            className: 'p-4 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50 text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-slate-500/50'
        }, React.createElement(SendIcon))
    ]);
};

const EmptyState = () => {
    return React.createElement('div', {
        className: 'flex items-center justify-center h-full'
    }, React.createElement('div', {
        className: 'text-center text-white/60'
    }, [
        React.createElement(MessageCircleIcon),
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
        React.createElement(MessageCircleIcon),
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
            className: 'px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto shadow-lg hover:shadow-slate-500/50'
        }, [React.createElement(PlusIcon), 'Создать новый чат'])
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
