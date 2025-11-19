// UI Elements Components

const ChatButton = ({ button, onExecute }) => {
    const handleClick = () => {
        if (button.type === 'assistant_button') {
            onExecute(button.assistant_request);
        } else {
            // Handle frontend commands
            console.log('Frontend command:', button.command);
        }
    };

    return React.createElement('button', {
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

const ChatCardGrid = ({ cardGrid, onExecute }) => {
    const gridClass = cardGrid.grid_dimensions === '2_columns' 
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' 
        : 'grid grid-cols-1 gap-4 mb-4';

    return React.createElement('div', {
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
            }, card.buttons.map((button, buttonIndex) => 
                React.createElement(ChatButton, {
                    key: `button-${buttonIndex}`,
                    button: button,
                    onExecute: onExecute
                })
            ))
        ])
    ));
};

const ChatTable = ({ table }) => {
    return React.createElement('div', {
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

const ChatAdvancedAnswerItem = ({ item, onExecute }) => {
    switch (item.type) {
        case 'text_answer':
            return React.createElement('div', {
                className: 'prose prose-invert max-w-none mb-4',
                dangerouslySetInnerHTML: { __html: item.content.text }
            });
        
        case 'card_grid':
            return React.createElement(ChatCardGrid, {
                cardGrid: item.content,
                onExecute: onExecute
            });
        
        case 'table':
            return React.createElement(ChatTable, {
                table: item.content
            });
        
        case 'chart':
            return React.createElement(ChatChartComponent, {
                chart: item.content,
                order: item.order
            });
        
        default:
            return React.createElement('div', {
                className: 'text-white/70 mb-4'
            }, `Неподдерживаемый тип элемента: ${item.type}`);
    }
};

const ChatUIAnswer = ({ uiAnswer, onExecute }) => {
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
            }, React.createElement(ChatAdvancedAnswerItem, {
                item: item,
                onExecute: onExecute
            }))
        )),

        // Quick action buttons
        uiAnswer.quick_action_buttons && React.createElement('div', {
            key: 'quick-actions',
            className: 'flex flex-wrap gap-3 pt-4 border-t border-white/20'
        }, uiAnswer.quick_action_buttons.buttons.map((button, index) =>
            React.createElement(ChatButton, {
                key: `quick-${index}`,
                button: button,
                onExecute: onExecute
            })
        ))
    ]);
};

const ChatContent = ({ content, onExecute }) => {
    if (content.text) {
        // Simple text content
        return React.createElement('div', {
            className: 'prose prose-invert max-w-none',
            dangerouslySetInnerHTML: { __html: content.text }
        });
    }

    if (content.ui_answer) {
        return React.createElement(ChatUIAnswer, {
            uiAnswer: content.ui_answer,
            onExecute: onExecute
        });
    }

    return React.createElement('div', {
        className: 'text-white/70'
    }, 'Неподдерживаемый формат контента');
};

const ChatMessage = ({ message, onExecute }) => {
    const isUser = message.role === 'user';
    
    return React.createElement('div', {
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
                }, React.createElement(ChatContent, {
                    content: message.content,
                    onExecute: onExecute
                }))
            ])
        ])
    ]);
};
