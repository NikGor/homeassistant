// IntegratedChatAssistant - полноценный чат с AI-driven UI
const IntegratedChatAssistant = () => {
    const { useState, useRef, useEffect } = React;
    
    // State
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(-1); // Индекс текущего сообщения для навигации
    
    const messagesEndRef = useRef(null);
    const api = useRef(new ChatAPI());

    // Слушаем изменения состояния левого сайдбара
    useEffect(() => {
        const updateSidebarState = () => {
            setIsLeftSidebarExpanded(window.isLeftSidebarExpanded || false);
        };
        
        // Проверяем каждые 100мс
        const interval = setInterval(updateSidebarState, 100);
        return () => clearInterval(interval);
    }, []);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
        // Re-initialize Lucide icons after messages render
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }, [messages]);

    // Update navigation buttons when messages change or sidebar state changes
    useEffect(() => {
        const assistantMessages = messages.filter(msg => msg.role === 'assistant');
        const currentIndex = currentMessageIndex === -1 ? assistantMessages.length - 1 : currentMessageIndex;
        
        if (window.updateMessageNavigationButtons) {
            window.updateMessageNavigationButtons(currentIndex, assistantMessages.length);
        }
        
        // Если индекс не установлен и есть сообщения, показываем последнее
        if (currentMessageIndex === -1 && assistantMessages.length > 0) {
            setCurrentMessageIndex(assistantMessages.length - 1);
        }
        
        // Re-initialize Lucide icons when navigation state changes
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }, [messages, currentMessageIndex, isLeftSidebarExpanded]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const convos = await api.current.getConversations();
            setConversations(convos);
            
            // Auto-select first conversation if exists
            if (convos.length > 0 && !currentConversation) {
                selectConversation(convos[0].conversation_id);
            }
        } catch (err) {
            setError(`Не удалось загрузить чаты: ${err.message}`);
        }
    };

    const selectConversation = async (conversationId) => {
        setCurrentConversation(conversationId);
        setCurrentMessageIndex(-1); // Сбрасываем индекс при смене разговора
        
        try {
            const msgs = await api.current.getMessages(conversationId);
            setMessages(msgs);
        } catch (err) {
            setError(`Не удалось загрузить сообщения: ${err.message}`);
        }
    };

    const createNewChat = async () => {
        try {
            const newConvo = await api.current.createConversation();
            if (newConvo) {
                setConversations(prev => [newConvo, ...prev]);
                setCurrentConversation(newConvo.conversation_id);
                setMessages([]);
            }
        } catch (err) {
            setError(`Не удалось создать новый чат: ${err.message}`);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !currentConversation || isLoading) return;

        const userMessage = {
            message_id: `temp-user-${Date.now()}`,
            role: 'user',
            content: {
                content_format: 'plain',
                text: inputValue
            },
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await api.current.sendMessage({
                response_format: 'ui_answer',
                input: inputValue,
                conversation_id: currentConversation
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

    const executeCommand = async (assistantRequest) => {
        if (!currentConversation) return;

        setIsLoading(true);

        try {
            const result = await api.current.sendMessage({
                response_format: 'ui_answer',
                input: assistantRequest,
                conversation_id: currentConversation
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
            setError(`Ошибка выполнения команды: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateMessages = (direction) => {
        const assistantMessages = messages.filter(msg => msg.role === 'assistant');
        if (assistantMessages.length === 0) return;

        let newIndex = currentMessageIndex;
        
        if (direction === 'prev') {
            newIndex = Math.max(0, currentMessageIndex - 1);
        } else if (direction === 'next') {
            newIndex = Math.min(assistantMessages.length - 1, currentMessageIndex + 1);
        }

        if (newIndex !== currentMessageIndex) {
            setCurrentMessageIndex(newIndex);
        }
    };

    const updateNavigationButtons = () => {
        const assistantMessages = messages.filter(msg => msg.role === 'assistant');
        const currentIndex = currentMessageIndex === -1 ? assistantMessages.length - 1 : currentMessageIndex;
        
        if (window.updateMessageNavigationButtons) {
            window.updateMessageNavigationButtons(currentIndex, assistantMessages.length);
        }
    };

    // Expose functions globally for left sidebar integration
    useEffect(() => {
        window.chatAssistantAPI = {
            createNewChat,
            conversations,
            currentConversation,
            selectConversation,
            navigateMessages,
            updateNavigationButtons
        };
    }, [conversations, currentConversation, navigateMessages, updateNavigationButtons]);

    if (!currentConversation) {
        return React.createElement('div', {
            className: 'h-full flex flex-col items-center justify-center text-center'
        }, [
            React.createElement('div', {
                key: 'empty-state',
                className: 'text-white/60'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'message-circle',
                    className: 'w-16 h-16 mx-auto mb-4'
                }),
                React.createElement('h3', {
                    key: 'title',
                    className: 'text-xl font-semibold mb-2'
                }, 'Выберите чат'),
                React.createElement('p', {
                    key: 'description',
                    className: 'text-sm'
                }, 'Создайте новый чат или выберите существующий из левой панели'),
                React.createElement('button', {
                    key: 'create-button',
                    onClick: createNewChat,
                    className: 'mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors'
                }, 'Создать новый чат')
            ])
        ]);
    }

    // Определяем, что показывать: диалог или конкретное сообщение по индексу
    const messagesToShow = (() => {
        if (isLeftSidebarExpanded) {
            return messages; // Показываем все сообщения в развернутом режиме
        } else {
            // В свернутом режиме показываем только сообщения ассистента
            const assistantMessages = messages.filter(msg => msg.role === 'assistant');
            if (assistantMessages.length === 0) return [];
            
            // Показываем сообщение по currentMessageIndex или последнее
            const index = currentMessageIndex >= 0 && currentMessageIndex < assistantMessages.length 
                ? currentMessageIndex 
                : assistantMessages.length - 1;
            
            return [assistantMessages[index]];
        }
    })();

    return React.createElement('div', {
        className: 'h-full flex flex-col bg-transparent'
    }, [
        // Messages area
        React.createElement('div', {
            key: 'messages-area',
            className: `flex-1 overflow-y-auto px-4 ${!isLeftSidebarExpanded ? 'py-4' : 'py-4'}`
        }, [
            // В свернутом режиме оборачиваем в контейнер который центрирует только если контент меньше экрана
            !isLeftSidebarExpanded && messagesToShow.length === 1 
                ? React.createElement('div', {
                    key: 'single-message-container',
                    className: 'min-h-full flex flex-col justify-center'
                }, [
                    React.createElement('div', {
                        key: 'centered-message',
                        className: 'w-full max-w-4xl mx-auto'
                    }, messagesToShow.map(message => 
                        React.createElement(ChatMessage, {
                            key: message.message_id,
                            message: message,
                            onExecute: executeCommand
                        })
                    ))
                ])
                : messagesToShow.map(message => 
                    React.createElement(ChatMessage, {
                        key: message.message_id,
                        message: message,
                        onExecute: executeCommand
                    })
                ),
            isLoading && React.createElement('div', {
                key: 'loading',
                className: `flex ${!isLeftSidebarExpanded ? 'justify-center' : 'justify-start'} mb-6`
            }, [
                React.createElement('div', {
                    key: 'loading-bubble',
                    className: 'backdrop-blur-lg rounded-3xl p-6 bg-white/10 border border-white/20'
                }, [
                    React.createElement('div', {
                        key: 'loading-text',
                        className: 'text-white/60 mb-2'
                    }, 'Archie печатает'),
                    React.createElement('div', {
                        key: 'loading-dots',
                        className: 'flex gap-1'
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
                ])
            ]),
            React.createElement('div', {
                key: 'messages-end',
                ref: messagesEndRef
            })
        ]),
        
        // Input area
        React.createElement('div', {
            key: 'input-area',
            className: 'p-4'
        }, [
            React.createElement('div', {
                key: 'input-container',
                className: 'relative'
            }, [
                React.createElement('div', {
                    key: 'input-bg',
                    className: 'absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl'
                }),
                React.createElement('form', {
                    key: 'input-form',
                    className: 'relative flex items-center p-2',
                    onSubmit: sendMessage
                }, [
                    React.createElement('input', {
                        key: 'input-field',
                        type: 'text',
                        placeholder: 'Напишите что-нибудь...',
                        className: 'flex-1 bg-transparent text-white placeholder-gray-400 border-none outline-none focus:ring-0 p-3',
                        value: inputValue,
                        onChange: (e) => setInputValue(e.target.value),
                        disabled: isLoading || !currentConversation
                    }),
                    React.createElement('button', {
                        key: 'send-button',
                        type: 'submit',
                        disabled: !inputValue.trim() || isLoading || !currentConversation,
                        className: 'p-3 text-gray-400 hover:text-white transition-colors rounded-lg disabled:opacity-50'
                    }, React.createElement('i', {
                        'data-lucide': 'send',
                        className: 'w-6 h-6'
                    }))
                ])
            ])
        ]),

        // Error display
        error && React.createElement('div', {
            key: 'error',
            className: 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg'
        }, [
            React.createElement('span', { key: 'error-text' }, error),
            React.createElement('button', {
                key: 'error-close',
                onClick: () => setError(null),
                className: 'ml-3 text-white/80 hover:text-white'
            }, React.createElement('i', {
                'data-lucide': 'x',
                className: 'w-4 h-4'
            }))
        ])
    ]);
};
