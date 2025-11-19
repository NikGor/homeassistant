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

    const getCardStyle = (type) => {
        const baseStyle = 'backdrop-blur-lg bg-white/10 rounded-2xl p-4 shadow-xl transition-all duration-300';
        
        switch (type) {
            case 'location_card': 
                return `${baseStyle} border-2 border-emerald-500 hover:border-emerald-400 shadow-emerald-500/20`;
            case 'product_card': 
                return `${baseStyle} border-2 border-orange-500 hover:border-orange-400 shadow-orange-500/20`;
            case 'movie_card': 
            case 'series_card': 
                return `${baseStyle} border-2 border-violet-500 hover:border-violet-400 shadow-violet-500/20`;
            case 'music_card': 
                return `${baseStyle} border-2 border-pink-500 hover:border-pink-400 shadow-pink-500/20`;
            case 'article_card': 
                return `${baseStyle} border-2 border-sky-500 hover:border-sky-400 shadow-sky-500/20`;
            case 'shopping_list_card': 
                return `${baseStyle} border-2 border-yellow-500 hover:border-yellow-400 shadow-yellow-500/20`;
            case 'weather_card': 
                return `${baseStyle} border-2 border-cyan-500 hover:border-cyan-400 shadow-cyan-500/20`;
            case 'contact_card': 
                return `${baseStyle} border-2 border-indigo-500 hover:border-indigo-400 shadow-indigo-500/20`;
            case 'card':
            default: 
                return `${baseStyle} border border-white/20 hover:border-white/40`;
        }
    };

    const renderCardContent = (card) => {
        const elements = [];
        
        // Contact Card
        if (card.type === 'contact_card') {
            card.name && elements.push(React.createElement('h3', {
                key: 'name',
                className: 'font-semibold text-white mb-1'
            }, card.name));
            card.role && elements.push(React.createElement('p', {
                key: 'role',
                className: 'text-sm text-white/70 mb-1'
            }, card.role));
            card.company && elements.push(React.createElement('p', {
                key: 'company',
                className: 'text-xs text-white/60 mb-2'
            }, card.company));
            if (card.email || card.phone) {
                elements.push(React.createElement('div', {
                    key: 'contact-info',
                    className: 'text-sm text-white/80 mb-2 space-y-1'
                }, [
                    card.email && React.createElement('div', { key: 'email' }, `📧 ${card.email}`),
                    card.phone && React.createElement('div', { key: 'phone' }, `📞 ${card.phone}`)
                ]));
            }
            card.availability && elements.push(React.createElement('p', {
                key: 'availability',
                className: 'text-xs text-white/60 mb-3'
            }, card.availability));
        }
        // Location Card
        else if (card.type === 'location_card') {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white mb-2'
            }, card.title));
            card.description && elements.push(React.createElement('p', {
                key: 'description',
                className: 'text-sm text-white/80 mb-2'
            }, card.description));
            card.address && elements.push(React.createElement('p', {
                key: 'address',
                className: 'text-xs text-white/60 mb-3'
            }, card.address));
        }
        // Default: Generic Card
        else {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white mb-2'
            }, card.title));
            card.subtitle && elements.push(React.createElement('p', {
                key: 'subtitle',
                className: 'text-sm text-white/70 mb-2'
            }, card.subtitle));
            card.text && elements.push(React.createElement('div', {
                key: 'text',
                className: 'text-white/80 text-sm mb-3',
                dangerouslySetInnerHTML: { __html: card.text }
            }));
        }
        
        // Buttons (common for all types)
        if (card.buttons && card.buttons.length > 0) {
            elements.push(React.createElement('div', {
                key: 'buttons',
                className: 'flex flex-wrap gap-2 mt-3'
            }, card.buttons.map((button, buttonIndex) => 
                React.createElement(ChatButton, {
                    key: `button-${buttonIndex}`,
                    button: button,
                    onExecute: onExecute
                })
            )));
        }
        
        return elements;
    };

    return React.createElement('div', {
        className: gridClass
    }, cardGrid.cards.map((card, index) => 
        React.createElement('div', {
            key: `card-${index}`,
            className: getCardStyle(card.type)
        }, renderCardContent(card))
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
            const processedText = item.content.type === 'markdown' && typeof marked !== 'undefined'
                ? marked.parse(item.content.text)
                : item.content.text;
            
            return React.createElement('div', {
                className: 'prose prose-invert max-w-none mb-4',
                dangerouslySetInnerHTML: { __html: processedText }
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
    const processIntroText = (introText) => {
        if (!introText) return null;
        
        const processedText = introText.type === 'markdown' && typeof marked !== 'undefined'
            ? marked.parse(introText.text)
            : introText.text;
        
        return React.createElement('div', {
            key: 'intro',
            className: 'prose prose-invert max-w-none mb-4',
            dangerouslySetInnerHTML: { __html: processedText }
        });
    };

    return React.createElement('div', {
        className: 'space-y-6'
    }, [
        // Intro text
        processIntroText(uiAnswer.intro_text),

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
        // Simple text content - check if it needs markdown processing
        const processedText = content.content_format === 'markdown' && typeof marked !== 'undefined'
            ? marked.parse(content.text)
            : content.text;
        
        return React.createElement('div', {
            className: 'prose prose-invert max-w-none',
            dangerouslySetInnerHTML: { __html: processedText }
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
