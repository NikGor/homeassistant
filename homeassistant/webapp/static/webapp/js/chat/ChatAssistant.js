// IntegratedChatAssistant - полноценный чат с AI-driven UI
const IntegratedChatAssistant = () => {
    const { useState, useRef, useEffect } = React;
    
    // State
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);
    const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
    
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

    const getWebSocketUrl = () => {
        const wsBaseUrl = window.AI_AGENT_WS_URL || 'ws://localhost:8005';
        return wsBaseUrl + '/ws_chat';
    };

    const buildChatHistory = (msgs) => {
        return msgs.map(msg => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            const content = msg.content;
            let text = '';
            if (typeof content === 'string') {
                text = content;
            } else if (content.text) {
                text = content.text;
            } else if (content.level2_answer?.text?.text) {
                text = content.level2_answer.text.text;
            } else if (content.level3_answer?.text?.text) {
                text = content.level3_answer.text.text;
            } else if (content.ui_answer?.text?.text) {
                text = content.ui_answer.text.text;
            }
            return text ? `${role}: ${text}` : null;
        }).filter(Boolean).join('\n');
    };

    const sendMessageViaWebSocket = (payload) => {
        return new Promise((resolve, reject) => {
            const wsUrl = getWebSocketUrl();
            console.log('ChatAssistant: Opening WebSocket to', wsUrl);
            const ws = new WebSocket(wsUrl);
            const pipelineSteps = [];
            let currentStep = null;
            let currentStepStart = null;
            ws.onopen = () => {
                console.log('ChatAssistant: WebSocket connected, sending payload', payload);
                ws.send(JSON.stringify(payload));
            };
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                const now = Date.now();
                console.log('ChatAssistant: WebSocket message', msg);
                switch (msg.type) {
                    case 'status':
                        if (currentStep !== null) {
                            pipelineSteps.push({
                                step: currentStep.step,
                                status: currentStep.status,
                                duration_ms: now - currentStepStart
                            });
                        }
                        currentStep = { step: msg.step || msg.message, status: msg.status || 'running' };
                        currentStepStart = now;
                        setStatusMessage(msg.message || `${msg.step}: ${msg.status}`);
                        break;
                    case 'final':
                        if (currentStep !== null) {
                            pipelineSteps.push({
                                step: currentStep.step,
                                status: currentStep.status,
                                duration_ms: now - currentStepStart
                            });
                        }
                        setStatusMessage('');
                        resolve({ result: msg.data, pipeline_steps: pipelineSteps });
                        break;
                    case 'error':
                        setStatusMessage('');
                        reject(new Error(msg.message || 'WebSocket error'));
                        break;
                }
            };
            ws.onerror = (error) => {
                console.error('ChatAssistant: WebSocket error', error);
                setStatusMessage('');
                reject(new Error('WebSocket connection failed'));
            };
            ws.onclose = (event) => {
                console.log('ChatAssistant: WebSocket closed', event.code, event.reason);
            };
        });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !currentConversation || isLoading) return;

        const messageText = inputValue.trim();
        const isFirstMessage = messages.length === 0;
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
            const selectedCommandModel = window.selectedCommandModel || localStorage.getItem('selectedCommandModel') || 'gpt-4.1-mini';
            const selectedFinalOutputModel = window.selectedFinalOutputModel || localStorage.getItem('selectedFinalOutputModel') || 'gpt-4.1';
            const selectedFormat = window.selectedResponseFormat || localStorage.getItem('selectedResponseFormat') || 'ui_answer';
            const demoMode = window.demoMode || localStorage.getItem('demoMode') === 'true';
            const userName = window.CURRENT_USER_NAME || "guest";
            
            // Map frontend format to backend format
            const formatMap = {
                'plain': 'plain',
                'formatted': 'level2_answer',
                'ui_answer': 'ui_answer'
            };
            const backendFormat = formatMap[selectedFormat] || selectedFormat;
            
            // Start title generation in parallel (but don't await yet)
            const titlePromise = isFirstMessage 
                ? api.current.generateTitle(messageText) 
                : Promise.resolve(null);
            
            // Save user message to DB
            await api.current.saveMessage(currentConversation, userMessage);
            
            // Find last assistant message for threading
            let previousMessageId = null;
            if (!isFirstMessage) {
                const assistantMessages = messages.filter(msg => msg.role === 'assistant');
                if (assistantMessages.length > 0) {
                    previousMessageId = assistantMessages[assistantMessages.length - 1].message_id;
                }
            }
            
            // Build chat history for context
            const chatHistory = buildChatHistory(messages);
            
            const { result, pipeline_steps } = await sendMessageViaWebSocket({
                user_name: userName,
                response_format: backendFormat,
                input: messageText,
                conversation_id: currentConversation,
                command_model: selectedCommandModel,
                final_output_model: selectedFinalOutputModel,
                previous_message_id: previousMessageId,
                chat_history: chatHistory || null,
                demo_mode: demoMode
            });

            console.log('ChatAssistant: WebSocket result', result);

            // Process images if ui_answer exists
            let assistantContent = result.content || {};
            let imageCost = 0;
            if (assistantContent.content_format === 'ui_answer' && assistantContent.ui_answer) {
                console.log('ChatAssistant: Processing images in ui_answer');
                setStatusMessage('Generating images');
                const imageGenStart = Date.now();
                const imageResult = await api.current.processImages(assistantContent.ui_answer);
                pipeline_steps.push({
                    step: 'image_generation',
                    status: 'done',
                    duration_ms: Date.now() - imageGenStart
                });
                assistantContent = {
                    ...assistantContent,
                    ui_answer: imageResult.ui_answer
                };
                imageCost = imageResult.imageCost || 0;
            }

            const llmTrace = result.llm_trace || {};
            llmTrace.total_cost = (llmTrace.total_cost || 0) + imageCost;

            const assistantMessage = {
                message_id: result.message_id || `temp-assistant-${Date.now()}`,
                role: 'assistant',
                content: assistantContent,
                created_at: result.created_at || new Date().toISOString(),
                llm_trace: llmTrace,
                pipeline_steps: pipeline_steps || []
            };

            console.log('ChatAssistant: assistantMessage', assistantMessage);

            // Save assistant message to DB
            await api.current.saveMessage(currentConversation, assistantMessage);

            setMessages(prev => [...prev, assistantMessage]);
            
            // Now that conversation exists in DB, update title if generated
            const title = await titlePromise;
            if (title) {
                try {
                    await api.current.updateConversationTitle(currentConversation, title);
                    setConversations(prev => prev.map(c => 
                        c.conversation_id === currentConversation 
                            ? { ...c, title } 
                            : c
                    ));
                } catch (e) {
                    console.error('Failed to update title:', e);
                }
            }
        } catch (err) {
            setError(`Не удалось отправить сообщение: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const executeCommand = async (assistantRequest) => {
        if (!currentConversation || isLoading) return;

        // Add user message to chat
        const userMessage = {
            message_id: `temp-user-${Date.now()}`,
            role: 'user',
            content: {
                content_format: 'plain',
                text: assistantRequest
            },
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const selectedCommandModel = window.selectedCommandModel || localStorage.getItem('selectedCommandModel') || 'gpt-4.1-mini';
            const selectedFinalOutputModel = window.selectedFinalOutputModel || localStorage.getItem('selectedFinalOutputModel') || 'gpt-4.1';
            const selectedFormat = window.selectedResponseFormat || localStorage.getItem('selectedResponseFormat') || 'ui_answer';
            const demoMode = window.demoMode || localStorage.getItem('demoMode') === 'true';
            const userName = window.CURRENT_USER_NAME || "guest";
            
            // Map frontend format to backend format
            const formatMap = {
                'plain': 'plain',
                'formatted': 'level2_answer',
                'ui_answer': 'ui_answer'
            };
            const backendFormat = formatMap[selectedFormat] || selectedFormat;
            
            // Save user message to DB
            await api.current.saveMessage(currentConversation, userMessage);
            
            // Find last assistant message for threading
            let prevMessageId = null;
            const assistantMsgs = messages.filter(msg => msg.role === 'assistant');
            if (assistantMsgs.length > 0) {
                prevMessageId = assistantMsgs[assistantMsgs.length - 1].message_id;
            }
            
            // Build chat history for context
            const chatHistoryForExecute = buildChatHistory(messages);
            
            const { result, pipeline_steps } = await sendMessageViaWebSocket({
                user_name: userName,
                response_format: backendFormat,
                input: assistantRequest,
                conversation_id: currentConversation,
                command_model: selectedCommandModel,
                final_output_model: selectedFinalOutputModel,
                previous_message_id: prevMessageId,
                chat_history: chatHistoryForExecute || null,
                demo_mode: demoMode
            });

            // Process images if ui_answer exists
            let assistantContent = result.content || {};
            let imageCost = 0;
            if (assistantContent.content_format === 'ui_answer' && assistantContent.ui_answer) {
                setStatusMessage('Generating images');
                const imageGenStart = Date.now();
                const imageResult = await api.current.processImages(assistantContent.ui_answer);
                pipeline_steps.push({
                    step: 'image_generation',
                    status: 'done',
                    duration_ms: Date.now() - imageGenStart
                });
                assistantContent = {
                    ...assistantContent,
                    ui_answer: imageResult.ui_answer
                };
                imageCost = imageResult.imageCost || 0;
            }

            const llmTrace = result.llm_trace || {};
            llmTrace.total_cost = (llmTrace.total_cost || 0) + imageCost;

            const assistantMessage = {
                message_id: result.message_id || `temp-assistant-${Date.now()}`,
                role: 'assistant',
                content: assistantContent,
                created_at: result.created_at || new Date().toISOString(),
                llm_trace: llmTrace,
                pipeline_steps: pipeline_steps || []
            };

            // Save assistant message to DB
            await api.current.saveMessage(currentConversation, assistantMessage);

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
            updateNavigationButtons,
            getCurrentConversationId: () => currentConversation?.conversation_id || null,
            sendMessage: (message) => {
                if (currentConversation) {
                    // Trigger sending message to current conversation
                    const inputElement = document.querySelector('textarea[placeholder*="Напишите сообщение"]');
                    if (inputElement) {
                        inputElement.value = message;
                        // Trigger form submission
                        const form = inputElement.closest('form');
                        if (form) {
                            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                        }
                    }
                }
            }
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
            // В свернутом режиме с одним сообщением — центрируем по вертикали
            !isLeftSidebarExpanded && messagesToShow.length === 1
                ? React.createElement('div', {
                    key: 'single-message-container',
                    className: 'min-h-full flex flex-col justify-center'
                }, [
                    React.createElement('div', {
                        key: 'centered-message',
                        className: 'w-full max-w-[60rem] mx-auto'
                    }, messagesToShow.map(message =>
                        React.createElement(ChatMessage, {
                            key: message.message_id,
                            message: message,
                            onExecute: executeCommand
                        })
                    ))
                ])
                : React.createElement('div', {
                    key: 'messages-container',
                    className: 'w-full max-w-[60rem] mx-auto'
                }, messagesToShow.map(message =>
                    React.createElement(ChatMessage, {
                        key: message.message_id,
                        message: message,
                        onExecute: executeCommand
                    })
                )),
            isLoading && React.createElement('div', {
                key: 'loading',
                className: 'w-full max-w-[60rem] mx-auto flex justify-start mb-6'
            }, [
                React.createElement('div', {
                    key: 'loading-bubble',
                    className: 'backdrop-blur-lg rounded-3xl px-6 py-4 bg-white/10 border border-white/20'
                }, [
                    React.createElement('span', {
                        key: 'loading-text',
                        className: 'text-white/60'
                    }, statusMessage || 'Thinking'),
                    React.createElement('span', {
                        key: 'loading-dots',
                        className: 'text-white/60 ml-1'
                    }, '...')
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
            React.createElement(ChatInput, {
                key: 'chat-input',
                value: inputValue,
                onChange: setInputValue,
                onSubmit: sendMessage,
                disabled: !currentConversation,
                isLoading: isLoading
            })
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
