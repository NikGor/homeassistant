// ChatAPI class - simplified version of the original
class ChatAPI {
    constructor() {
        this.baseUrl = '/ai-assistant/api';
    }

    async getConversations() {
        try {
            const response = await fetch(`${this.baseUrl}/conversations/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get conversations:', error);
            return [];
        }
    }

    async createConversation() {
        try {
            const response = await fetch(`${this.baseUrl}/conversations/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: `Новый чат ${Date.now()}` })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to create conversation:', error);
            return null;
        }
    }

    async getMessages(conversationId) {
        try {
            const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get messages:', error);
            return [];
        }
    }

    async sendMessage(messageData) {
        try {
            const response = await fetch(`${this.baseUrl}/messages/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    async deleteConversation(conversationId) {
        try {
            const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            throw error;
        }
    }
}

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

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // AI-driven UI rendering functions
    const getSpacingClass = (spacing) => {
        switch (spacing) {
            case 'tight': return 'space-y-2';
            case 'loose': return 'space-y-8';
            default: return 'space-y-4';
        }
    };

    const getButtonStyle = (style) => {
        switch (style) {
            case 'primary': return 'bg-indigo-600 hover:bg-indigo-500 text-white';
            case 'success': return 'bg-green-600 hover:bg-green-500 text-white';
            case 'warning': return 'bg-yellow-500 hover:bg-yellow-400 text-slate-900';
            case 'danger': return 'bg-red-600 hover:bg-red-500 text-white';
            default: return 'bg-slate-700 hover:bg-slate-600 text-white';
        }
    };

    const renderAdvancedAnswerItem = (item) => {
        switch (item.type) {
            case 'text_answer':
                return React.createElement('div', {
                    key: `text-${item.order}`,
                    className: 'prose prose-invert max-w-none mb-4',
                    dangerouslySetInnerHTML: { __html: item.content.text }
                });
            
            case 'card_grid':
                return renderCardGrid(item.content, item.order);
            
            case 'table':
                return renderTable(item.content, item.order);
            
            case 'chart':
                return renderChart(item.content, item.order);
            
            default:
                return React.createElement('div', {
                    key: `unknown-${item.order}`,
                    className: 'text-white/70 mb-4'
                }, `Неподдерживаемый тип элемента: ${item.type}`);
        }
    };

    const renderCardGrid = (cardGrid, order) => {
        const gridClass = cardGrid.grid_dimensions === '2_columns' 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' 
            : 'grid grid-cols-1 gap-4 mb-4';

        return React.createElement('div', {
            key: `card-grid-${order}`,
            className: gridClass
        }, cardGrid.cards.map((card, index) => 
            React.createElement('div', {
                key: `card-${index}`,
                className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 shadow-xl hover:border-white/40 transition-all duration-300'
            }, [
                card.title && React.createElement('h3', {
                    key: 'title',
                    className: 'font-semibold text-white mb-2'
                }, card.title),
                card.subtitle && React.createElement('p', {
                    key: 'subtitle',
                    className: 'text-sm text-white/70 mb-2'
                }, card.subtitle),
                card.text && React.createElement('div', {
                    key: 'text',
                    className: 'text-white/80 text-sm mb-3',
                    dangerouslySetInnerHTML: { __html: card.text }
                }),
                card.buttons && card.buttons.length > 0 && React.createElement('div', {
                    key: 'buttons',
                    className: 'flex flex-wrap gap-2 mt-3'
                }, card.buttons.map((button, buttonIndex) => renderButton(button, buttonIndex)))
            ])
        ));
    };

    const renderButton = (button, index) => {
        const handleClick = () => {
            if (button.type === 'assistant_button') {
                executeCommand(button.assistant_request);
            } else {
                // Handle frontend commands
                console.log('Frontend command:', button.command);
            }
        };

        return React.createElement('button', {
            key: `button-${index}`,
            onClick: handleClick,
            className: `px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${getButtonStyle(button.style)}`
        }, [
            button.icon && React.createElement('i', {
                key: 'icon',
                'data-lucide': button.icon,
                className: 'w-4 h-4 inline-block mr-2'
            }),
            React.createElement('span', {
                key: 'text'
            }, button.text)
        ]);
    };

    const renderTable = (table, order) => {
        return React.createElement('div', {
            key: `table-${order}`,
            className: 'backdrop-blur-lg bg-white/10 rounded-lg border border-white/20 shadow-xl overflow-hidden mb-4'
        }, [
            table.title && React.createElement('div', {
                key: 'table-header',
                className: 'p-4 bg-slate-800/80 border-b border-slate-700/50'
            }, React.createElement('h3', {
                className: 'font-semibold text-white'
            }, table.title)),
            React.createElement('div', {
                key: 'table-wrapper',
                className: 'overflow-x-auto'
            }, React.createElement('table', {
                className: 'w-full'
            }, [
                React.createElement('thead', {
                    key: 'thead',
                    className: 'bg-slate-800/50'
                }, React.createElement('tr', {}, 
                    table.headers.map((header, index) => 
                        React.createElement('th', {
                            key: `header-${index}`,
                            className: 'px-4 py-3 text-left text-white font-semibold'
                        }, header)
                    )
                )),
                React.createElement('tbody', {
                    key: 'tbody'
                }, table.rows.map((row, rowIndex) =>
                    React.createElement('tr', {
                        key: `row-${rowIndex}`,
                        className: 'border-t border-white/10 hover:bg-white/5'
                    }, row.map((cell, cellIndex) =>
                        React.createElement('td', {
                            key: `cell-${cellIndex}`,
                            className: 'px-4 py-3 text-white/80'
                        }, cell)
                    ))
                ))
            ]))
        ]);
    };

    // Chart component - separate component to use hooks properly
    const ChartComponent = ({ chart, order }) => {
        const { useEffect, useRef } = React;
        const canvasRef = useRef(null);
        const chartInstanceRef = useRef(null);
        
        useEffect(() => {
            if (!canvasRef.current) {
                console.log('ChartComponent: canvas ref not ready');
                return;
            }
            
            console.log('ChartComponent: Rendering chart', chart);
            
            const ctx = canvasRef.current.getContext('2d');
            
            // Destroy previous chart instance if exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            
            let chartConfig;

            // Robust parser for chart.chart_config
            function safeParseChartConfig(input) {
                console.log('safeParseChartConfig: input type:', typeof input);
                console.log('safeParseChartConfig: input value:', input);
                
                if (input === null || input === undefined) return null;
                
                // If it's already an object, return it directly
                if (typeof input === 'object') {
                    console.log('safeParseChartConfig: Already an object, returning as-is');
                    return input;
                }

                let s = String(input).trim();
                console.log('safeParseChartConfig: String to parse:', s.substring(0, 100) + '...');

                // If it's double-quoted JSON, unwrap and unescape inner quotes
                if (s.length >= 2 && ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'"))) {
                    s = s.slice(1, -1);
                    s = s.replace(/\\\"/g, '"').replace(/\\\'/g, "'");
                    console.log('safeParseChartConfig: After unwrapping quotes:', s.substring(0, 100) + '...');
                }

                // Extract first JSON object block if surrounding text exists
                const firstBrace = s.indexOf('{');
                const lastBrace = s.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    s = s.slice(firstBrace, lastBrace + 1);
                    console.log('safeParseChartConfig: After extracting JSON block:', s.substring(0, 100) + '...');
                }

                // Strip control chars
                s = s.replace(/[\u0000-\u001F\u007F]+/g, '');

                // Convert smart quotes to normal quotes
                s = s.replace(/[""]/g, '"').replace(/['']/g, "'");

                // Remove trailing commas before closing braces/brackets
                s = s.replace(/,\s*([}\]])/g, '$1');
                
                // Fix truncated JSON: if string ends with closing braces but JSON.parse fails,
                // try counting braces and adding missing ones
                const openBraces = (s.match(/\{/g) || []).length;
                const closeBraces = (s.match(/\}/g) || []).length;
                if (openBraces > closeBraces) {
                    console.log(`safeParseChartConfig: JSON has ${openBraces} opening braces but only ${closeBraces} closing braces. Adding ${openBraces - closeBraces} missing braces.`);
                    s = s + '}'.repeat(openBraces - closeBraces);
                }

                console.log('safeParseChartConfig: Final string before parse:', s.substring(0, 100) + '...');
                console.log('safeParseChartConfig: String length:', s.length);
                console.log('safeParseChartConfig: Character at position 378:', s.charCodeAt(378), 'char:', s.charAt(378));
                console.log('safeParseChartConfig: Context around 378:', s.substring(370, 390));

                try {
                    const parsed = JSON.parse(s);
                    console.log('safeParseChartConfig: Successfully parsed!');
                    return parsed;
                } catch (err) {
                    console.log('safeParseChartConfig: First parse failed:', err.message);
                    console.log('safeParseChartConfig: Full string:', s);
                    // Try unescaping escaped quotes and parse again
                    try {
                        const unescaped = s.replace(/\\"/g, '"');
                        const parsed = JSON.parse(unescaped);
                        console.log('safeParseChartConfig: Successfully parsed after unescaping!');
                        return parsed;
                    } catch (err2) {
                        console.log('safeParseChartConfig: Second parse failed:', err2.message);
                        return null;
                    }
                }
            }

            // Check if chart_config exists (as JSON string)
            if (chart.chart_config) {
                console.log('ChartComponent: Parsing chart_config');
                chartConfig = safeParseChartConfig(chart.chart_config);
                if (!chartConfig) {
                    console.error('ChartComponent: Failed to parse chart_config after multiple fallbacks');
                    return;
                }

                console.log('ChartComponent: Parsed config', chartConfig);

                // Apply dark theme styles to the parsed config
                chartConfig.options = chartConfig.options || {};
                chartConfig.options.responsive = true;
                chartConfig.options.maintainAspectRatio = false;

                // Dark theme for plugins
                chartConfig.options.plugins = chartConfig.options.plugins || {};
                chartConfig.options.plugins.legend = chartConfig.options.plugins.legend || {};
                chartConfig.options.plugins.legend.labels = chartConfig.options.plugins.legend.labels || {};
                chartConfig.options.plugins.legend.labels.color = 'rgba(255, 255, 255, 0.9)';

                chartConfig.options.plugins.tooltip = chartConfig.options.plugins.tooltip || {};
                chartConfig.options.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                chartConfig.options.plugins.tooltip.titleColor = 'rgba(255, 255, 255, 1)';
                chartConfig.options.plugins.tooltip.bodyColor = 'rgba(255, 255, 255, 0.9)';
                chartConfig.options.plugins.tooltip.borderColor = 'rgba(0, 191, 255, 0.5)';
                chartConfig.options.plugins.tooltip.borderWidth = 1;

                // Dark theme for scales
                chartConfig.options.scales = chartConfig.options.scales || {};
                if (chartConfig.options.scales.y) {
                    chartConfig.options.scales.y.grid = chartConfig.options.scales.y.grid || {};
                    chartConfig.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
                    chartConfig.options.scales.y.ticks = chartConfig.options.scales.y.ticks || {};
                    chartConfig.options.scales.y.ticks.color = 'rgba(255, 255, 255, 0.7)';
                }
                if (chartConfig.options.scales.x) {
                    chartConfig.options.scales.x.grid = chartConfig.options.scales.x.grid || {};
                    chartConfig.options.scales.x.grid.color = 'rgba(255, 255, 255, 0.1)';
                    chartConfig.options.scales.x.ticks = chartConfig.options.scales.x.ticks || {};
                    chartConfig.options.scales.x.ticks.color = 'rgba(255, 255, 255, 0.7)';
                }
            } else if (chart.data) {
                // Fallback: use chart.data if chart_config is not provided
                const chartData = {
                    labels: chart.data.labels || [],
                    datasets: (chart.data.datasets || []).map(dataset => ({
                        label: dataset.label || '',
                        data: dataset.data || [],
                        backgroundColor: dataset.background_color || 'rgba(0, 191, 255, 0.6)',
                        borderColor: dataset.border_color || 'rgba(0, 191, 255, 1)',
                        borderWidth: dataset.border_width || 2,
                        tension: dataset.tension || 0.4
                    }))
                };
                
                chartConfig = {
                    type: chart.chart_type,
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    font: {
                                        size: 12
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'rgba(255, 255, 255, 1)',
                                bodyColor: 'rgba(255, 255, 255, 0.9)',
                                borderColor: 'rgba(0, 191, 255, 0.5)',
                                borderWidth: 1
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                }
                            },
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                }
                            }
                        }
                    }
                };
            } else {
                // No data available
                console.error('ChartComponent: No chart_config or chart.data provided');
                return;
            }
            
            console.log('ChartComponent: Creating Chart instance with config', chartConfig);
            
            try {
                chartInstanceRef.current = new Chart(ctx, chartConfig);
                console.log('ChartComponent: Chart created successfully', chartInstanceRef.current);
            } catch (e) {
                console.error('ChartComponent: Failed to create chart:', e);
            }
            
            // Cleanup function
            return () => {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }
            };
        }, [chart]);
        
        return React.createElement('div', {
            className: 'backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl p-6 border border-white/20 mb-4'
        }, [
            chart.title && React.createElement('h3', {
                key: 'chart-title',
                className: 'text-xl font-bold text-white mb-2'
            }, chart.title),
            chart.description && React.createElement('p', {
                key: 'chart-description',
                className: 'text-white/70 mb-4'
            }, chart.description),
            React.createElement('div', {
                key: 'chart-container',
                style: { height: `${chart.height || 300}px`, position: 'relative' }
            }, React.createElement('canvas', {
                ref: canvasRef,
                style: { maxHeight: '100%' }
            }))
        ]);
    };

    const renderChart = (chart, order) => {
        return React.createElement(ChartComponent, {
            key: `chart-${order}`,
            chart: chart,
            order: order
        });
    };

    const renderUIAnswer = (uiAnswer) => {
        return React.createElement('div', {
            className: 'space-y-6'
        }, [
            // Intro text
            uiAnswer.intro_text && React.createElement('div', {
                key: 'intro',
                className: 'prose prose-invert max-w-none mb-4',
                dangerouslySetInnerHTML: { __html: uiAnswer.intro_text.text }
            }),

            // Items
            React.createElement('div', {
                key: 'items'
            }, uiAnswer.items.sort((a, b) => a.order - b.order).map((item, index) => 
                React.createElement('div', {
                    key: `item-${index}`,
                    className: getSpacingClass(item.spacing)
                }, renderAdvancedAnswerItem(item))
            )),

            // Quick action buttons
            uiAnswer.quick_action_buttons && React.createElement('div', {
                key: 'quick-actions',
                className: 'flex flex-wrap gap-3 pt-4 border-t border-white/20'
            }, uiAnswer.quick_action_buttons.buttons.map((button, index) =>
                React.createElement('button', {
                    key: `quick-${index}`,
                    onClick: () => executeCommand(button.assistant_request),
                    className: `px-4 py-2 rounded-full font-semibold transition-all duration-300 ${getButtonStyle(button.style)}`
                }, [
                    button.icon && React.createElement('i', {
                        key: 'icon',
                        'data-lucide': button.icon,
                        className: 'w-4 h-4 inline-block mr-2'
                    }),
                    React.createElement('span', {
                        key: 'text'
                    }, button.text)
                ])
            ))
        ]);
    };

    const renderContent = (content) => {
        if (content.text) {
            // Simple text content
            return React.createElement('div', {
                className: 'prose prose-invert max-w-none',
                dangerouslySetInnerHTML: { __html: content.text }
            });
        }

        if (content.ui_answer) {
            return renderUIAnswer(content.ui_answer);
        }

        return React.createElement('div', {
            className: 'text-white/70'
        }, 'Неподдерживаемый формат контента');
    };

    const renderMessage = (message) => {
        const isUser = message.role === 'user';
        
        return React.createElement('div', {
            key: message.message_id,
            className: `mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`
        }, [
            React.createElement('div', {
                key: 'message-container',
                className: `max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`
            }, [
                React.createElement('div', {
                    key: 'message-bubble',
                    className: `backdrop-blur-lg rounded-3xl p-6 border shadow-2xl relative group ${
                        isUser 
                            ? 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500/30 text-white' 
                            : 'bg-white/10 border-white/20 text-white'
                    }`
                }, [
                    React.createElement('div', {
                        key: 'message-header',
                        className: 'flex items-center gap-2 mb-3'
                    }, [
                        React.createElement('div', {
                            key: 'avatar',
                            className: `w-8 h-8 rounded-full flex items-center justify-center ${
                                isUser ? 'bg-slate-500' : 'bg-blue-500'
                            }`
                        }, [
                            React.createElement('i', {
                                key: 'avatar-icon',
                                'data-lucide': isUser ? 'user' : 'bot',
                                className: 'w-4 h-4'
                            })
                        ]),
                        React.createElement('span', {
                            key: 'role',
                            className: 'font-semibold'
                        }, isUser ? 'Вы' : 'Archie'),
                        React.createElement('span', {
                            key: 'time',
                            className: 'text-xs opacity-70'
                        }, formatTime(message.created_at))
                    ]),
                    React.createElement('div', {
                        key: 'message-content',
                        className: 'message-content'
                    }, renderContent(message.content))
                ])
            ])
        ]);
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
                    }, messagesToShow.map(renderMessage))
                ])
                : messagesToShow.map(renderMessage),
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

// Initialize AI Assistant
function initializeChatAssistant() {
    const chatContainer = document.getElementById('chat-assistant-root');
    if (!chatContainer) {
        console.error('Chat assistant container not found');
        return;
    }

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React or ReactDOM not loaded');
        return;
    }

    try {
        const root = ReactDOM.createRoot(chatContainer);
        root.render(React.createElement(IntegratedChatAssistant));
        
        // Re-initialize Lucide icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
        
        console.log('Integrated AI Assistant initialized successfully');
    } catch (error) {
        console.error('Failed to initialize AI Assistant:', error);
        chatContainer.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center text-white/60">
                    <p class="text-lg">AI Assistant загружается...</p>
                    <p class="text-sm mt-2">Если проблема не исчезает, обновите страницу</p>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeChatAssistant, 100);
});
