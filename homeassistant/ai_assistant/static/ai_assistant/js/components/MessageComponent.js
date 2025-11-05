/**
 * MessageComponent - компонент для отображения сообщений чата
 */

import { UserIcon, BotIcon, CopyIcon } from './Icons.js';
import { formatTime, copyToClipboard } from '../utils/Formatters.js';
import { WeatherWidget } from './WeatherWidget.js';

/**
 * Получает текст из структуры Content для копирования
 * @param {Object} content - Объект Content
 * @returns {string} Текст для копирования
 */
const getTextFromContent = (content) => {
    if (!content) return '';
    
    if (content.text) return content.text;
    
    if (content.ui_answer?.intro_text?.text) {
        return content.ui_answer.intro_text.text;
    }
    
    return 'Сообщение';
};

/**
 * Рендерит Lucide иконку или эмодзи
 * @param {string} iconName - Название иконки Lucide или эмодзи
 * @returns {ReactElement} Иконка
 */
const renderIcon = (iconName) => {
    if (!iconName) return null;

    // Если это эмодзи (содержит Unicode символы)
    if (iconName.length <= 2 && /[\u{1F000}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(iconName)) {
        return React.createElement('span', {
            className: 'text-base flex-shrink-0'
        }, iconName);
    }

    // Простые Lucide иконки
    const lucideIcons = {
        'map': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('polygon', { key: 'polygon1', points: "1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6" }),
            React.createElement('line', { key: 'line1', x1: "8", y1: "2", x2: "8", y2: "18" }),
            React.createElement('line', { key: 'line2', x1: "16", y1: "6", x2: "16", y2: "22" })
        ]),
        
        'book': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('path', { key: 'path', d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" })
        ]),
        
        'landmark': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('line', { key: 'line1', x1: "3", y1: "22", x2: "21", y2: "22" }),
            React.createElement('line', { key: 'line2', x1: "6", y1: "18", x2: "6", y2: "11" }),
            React.createElement('line', { key: 'line3', x1: "10", y1: "18", x2: "10", y2: "11" }),
            React.createElement('line', { key: 'line4', x1: "14", y1: "18", x2: "14", y2: "11" }),
            React.createElement('line', { key: 'line5', x1: "18", y1: "18", x2: "18", y2: "11" }),
            React.createElement('polygon', { key: 'polygon', points: "12,2 20,7 4,7" })
        ]),
        
        'navigation': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('polygon', { key: 'polygon', points: "3,11 22,2 13,21 11,13 3,11" })
        ]),
        
        'utensils': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('path', { key: 'path1', d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" }),
            React.createElement('path', { key: 'path2', d: "M7 2v20" }),
            React.createElement('path', { key: 'path3', d: "M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v0z" })
        ]),

        'calendar': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('rect', { key: 'rect', width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2" }),
            React.createElement('line', { key: 'line1', x1: "16", y1: "2", x2: "16", y2: "6" }),
            React.createElement('line', { key: 'line2', x1: "8", y1: "2", x2: "8", y2: "6" }),
            React.createElement('line', { key: 'line3', x1: "3", y1: "10", x2: "21", y2: "10" })
        ]),

        'building': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('rect', { key: 'rect', width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }),
            React.createElement('path', { key: 'path1', d: "M9 22v-4h6v4" }),
            React.createElement('path', { key: 'path2', d: "M8 6h.01" }),
            React.createElement('path', { key: 'path3', d: "M16 6h.01" }),
            React.createElement('path', { key: 'path4', d: "M12 6h.01" }),
            React.createElement('path', { key: 'path5', d: "M12 10h.01" }),
            React.createElement('path', { key: 'path6', d: "M12 14h.01" }),
            React.createElement('path', { key: 'path7', d: "M16 10h.01" }),
            React.createElement('path', { key: 'path8', d: "M16 14h.01" }),
            React.createElement('path', { key: 'path9', d: "M8 10h.01" }),
            React.createElement('path', { key: 'path10', d: "M8 14h.01" })
        ]),

        'clock': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
            React.createElement('polyline', { key: 'polyline', points: "12,6 12,12 16,14" })
        ]),

        'info': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
            React.createElement('path', { key: 'path1', d: "M12 16v-4" }),
            React.createElement('path', { key: 'path2', d: "M12 8h.01" })
        ]),

        'star': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('polygon', { key: 'polygon', points: "12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" })
        ]),

        'home': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('path', { key: 'path1', d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
            React.createElement('polyline', { key: 'polyline', points: "9,22 9,12 15,12 15,22" })
        ]),

        'phone': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('path', { key: 'path', d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" })
        ]),

        'mail': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('path', { key: 'path', d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }),
            React.createElement('polyline', { key: 'polyline', points: "22,6 12,13 2,6" })
        ]),

        'user': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('path', { key: 'path1', d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
            React.createElement('circle', { key: 'circle', cx: "12", cy: "7", r: "4" })
        ]),

        'settings': () => React.createElement('svg', {
            width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", 
            stroke: "currentColor", strokeWidth: "2", className: "flex-shrink-0"
        }, [
            React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "3" }),
            React.createElement('path', { key: 'path', d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })
        ])
    };

    const IconComponent = lucideIcons[iconName];
    if (IconComponent) {
        return IconComponent();
    }

    // Если иконка не найдена, возвращаем текст
    return React.createElement('span', {
        className: 'text-xs'
    }, iconName);
};

/**
 * Основной компонент сообщения
 * @param {Object} message - Объект сообщения с новой структурой Content
 * @param {Function} executeCommand - Функция выполнения команд
 * @returns {ReactElement} Компонент сообщения
 */
export const MessageComponent = (message, executeCommand) => {
    const isUser = message.role === 'user';
    const hasSimpleTextOnly = message.content?.text && !message.content?.ui_answer;
    
    return React.createElement('div', {
        className: `mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`
    }, React.createElement('div', {
        className: `max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`
    }, [
        // MessageBubble только для пользователя или простого текста
        (isUser || hasSimpleTextOnly) ? React.createElement(MessageBubble, {
            key: 'bubble',
            message,
            isUser,
            onCopy: () => copyToClipboard(getTextFromContent(message.content))
        }) : null,
        
        // Рендерим новую структуру content
        message.content ? React.createElement(ContentRenderer, {
            key: 'content',
            content: message.content,
            executeCommand
        }) : null
    ].filter(Boolean)));
};

/**
 * Пузырь сообщения - только заголовок и простой текст (не UIAnswer)
 */
const MessageBubble = ({ message, isUser, onCopy }) => {
    const hasSimpleTextOnly = message.content?.text && !message.content?.ui_answer;
    
    return React.createElement('div', {
        className: `backdrop-blur-lg rounded-3xl p-6 border shadow-2xl relative group hover:border-white/40 ${
            isUser 
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500/30 hover:border-slate-400/50 text-white' 
                : 'bg-white/10 border-white/20 text-white'
        }`
    }, [
        // Заголовок сообщения - только для пользователя
        isUser ? React.createElement(MessageHeader, {
            key: 'header',
            isUser,
            createdAt: message.created_at
        }) : null,
        
        // Только простой текстовый контент (без UIAnswer)
        hasSimpleTextOnly ? React.createElement('div', {
            key: 'content',
            className: 'prose prose-invert max-w-none',
            dangerouslySetInnerHTML: { __html: message.content.text }
        }) : null,
        
        // Кнопка копирования
        React.createElement('button', {
            key: 'copy',
            onClick: onCopy,
            className: 'absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 opacity-0 group-hover:opacity-100'
        }, React.createElement(CopyIcon))
    ].filter(Boolean));
};

/**
 * Заголовок сообщения с иконкой и временем (только для пользователя)
 */
const MessageHeader = ({ isUser, createdAt }) => {
    return React.createElement('div', {
        className: 'flex items-center gap-2 mb-3'
    }, [
        React.createElement(UserIcon, { key: 'icon' }),
        React.createElement('span', {
            key: 'name',
            className: 'text-sm opacity-70'
        }, 'Вы'),
        React.createElement('span', {
            key: 'time',
            className: 'text-xs opacity-50 ml-auto'
        }, formatTime(createdAt))
    ]);
};

/**
 * Рендерер новой структуры Content
 */
const ContentRenderer = ({ content, executeCommand }) => {
    if (!content) return null;

    // Если это простой текст, он уже отображается в MessageBubble
    if (content.text && !content.ui_answer) {
        return null;
    }

    // Рендерим UIAnswer
    if (content.ui_answer) {
        return React.createElement(UIAnswerRenderer, {
            uiAnswer: content.ui_answer,
            executeCommand
        });
    }

    return null;
};

/**
 * Рендерер UIAnswer структуры
 */
/**
 * Получает CSS класс для spacing
 */
const getSpacingClass = (spacing) => {
    switch (spacing) {
        case 'tight': return 'mb-2';
        case 'loose': return 'mb-8';
        default: return 'mb-4';
    }
};

/**
 * Получает CSS стили для кнопок
 */
const getButtonStyle = (style) => {
    switch (style) {
        case 'primary': return 'bg-indigo-600 hover:bg-indigo-500 text-white';
        case 'success': return 'bg-green-600 hover:bg-green-500 text-white';
        case 'warning': return 'bg-yellow-500 hover:bg-yellow-400 text-slate-900';
        case 'danger': return 'bg-red-600 hover:bg-red-500 text-white';
        default: return 'bg-slate-700 hover:bg-slate-600 text-white';
    }
};

/**
 * Рендерер отдельного элемента AdvancedAnswerItem
 */
const AdvancedAnswerItemRenderer = ({ item, executeCommand }) => {
    switch (item.type) {
        case 'text_answer':
            return React.createElement('div', {
                className: 'backdrop-blur-lg rounded-3xl p-6 border shadow-2xl bg-white/10 border-white/20 text-white'
            }, React.createElement('div', {
                className: 'prose prose-invert max-w-none',
                dangerouslySetInnerHTML: { __html: item.content.text }
            }));
            
        case 'card_grid':
            return React.createElement(NewCardGridRenderer, {
                cardGrid: item.content,
                executeCommand
            });
            
        case 'table':
            return React.createElement(NewTableRenderer, {
                table: item.content,
                executeCommand
            });
            
        case 'chart':
            return React.createElement(ChartRenderer, {
                chart: item.content
            });
            
        default:
            return React.createElement('div', {
                className: 'text-white/70 p-4 bg-red-600/20 rounded-lg border border-red-600/30'
            }, `Неподдерживаемый тип элемента: ${item.type}`);
    }
};

const UIAnswerRenderer = ({ uiAnswer, executeCommand }) => {
    const elements = [];

    // Intro text в отдельном стекломатовом фрейме
    if (uiAnswer.intro_text) {
        elements.push(React.createElement('div', {
            key: 'intro-text',
            className: 'backdrop-blur-lg rounded-3xl p-6 border shadow-2xl bg-white/10 border-white/20 text-white'
        }, React.createElement('div', {
            className: 'prose prose-invert max-w-none',
            dangerouslySetInnerHTML: { __html: uiAnswer.intro_text.text }
        })));
    }

    // Items - сортируем по order и рендерим
    if (uiAnswer.items && uiAnswer.items.length > 0) {
        const sortedItems = [...uiAnswer.items].sort((a, b) => a.order - b.order);
        
        sortedItems.forEach((item, index) => {
            const spacingClass = getSpacingClass(item.spacing);
            
            elements.push(React.createElement('div', {
                key: `item-${index}`,
                className: spacingClass
            }, React.createElement(AdvancedAnswerItemRenderer, {
                item,
                executeCommand
            })));
        });
    }

    // Quick action buttons
    if (uiAnswer.quick_action_buttons?.buttons?.length > 0) {
        elements.push(React.createElement('div', {
            key: 'quick-actions',
            className: 'flex flex-wrap gap-3 pt-4 border-t border-white/20 mt-6'
        }, uiAnswer.quick_action_buttons.buttons.map((button, index) =>
            React.createElement('button', {
                key: index,
                onClick: () => executeCommand('assistant_button', button.assistant_request),
                className: `inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold hover:border-white/40 ${getButtonStyle(button.style)}`
            }, [
                button.icon ? renderIcon(button.icon) : null,
                button.text
            ].filter(Boolean))
        )));
    }

    return elements.length > 0 ? React.createElement('div', {
        className: 'mt-4 space-y-6'
    }, elements) : null;
};

/**
 * UI кнопки
 */
const UIButtons = ({ buttons, executeCommand }) => {
    return React.createElement('div', {
        className: 'flex flex-wrap gap-2'
    }, buttons.map((button, index) => 
        React.createElement('button', {
            key: index,
            onClick: () => executeCommand(
                button.command || button.text, 
                button.assistant_request
            ),
            className: 'px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40'
        }, button.text)
    ));
};

/**
 * Рендерер обычных карточек
 */
const CardsRenderer = ({ cards, executeCommand }) => {
    return React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    }, cards.map((card, index) => 
        React.createElement(CardComponent, {
            key: index,
            card,
            executeCommand
        })
    ));
};

/**
 * Компонент отдельной карточки
 */
const CardComponent = ({ card, executeCommand }) => {
    const cardElements = [
        React.createElement('h3', {
            key: 'title',
            className: 'font-semibold text-white mb-2'
        }, card.title)
    ];

    if (card.subtitle) {
        cardElements.push(React.createElement('p', {
            key: 'subtitle',
            className: 'text-sm text-white/70 mb-2'
        }, card.subtitle));
    }

    cardElements.push(React.createElement('div', {
        key: 'content',
        className: 'text-white/80 text-sm prose prose-invert mb-3',
        dangerouslySetInnerHTML: { __html: card.text }
    }));

    // Кнопки карточки
    if (card.options?.buttons?.length > 0) {
        cardElements.push(React.createElement('div', {
            key: 'buttons',
            className: 'flex flex-wrap gap-2 mt-3'
        }, card.options.buttons.map((button, btnIndex) => 
            React.createElement('button', {
                key: btnIndex,
                onClick: () => executeCommand(
                    button.command || button.text, 
                    button.assistant_request
                ),
                className: 'px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-200 backdrop-blur-sm border border-blue-500/30'
            }, button.text)
        )));
    }

    // Кнопка копирования
    cardElements.push(React.createElement('button', {
        key: 'copy',
        onClick: () => copyToClipboard(card.text),
        className: 'absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100'
    }, React.createElement(CopyIcon)));

    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 shadow-xl hover:border-white/40 group relative'
    }, cardElements);
};

/**
 * Навигационные карточки
 */
const NavigationCards = ({ cards, executeCommand }) => {
    const handleNavigationClick = (button, navCard) => {
        const command = button.command || button.text;
        
        // Обработка навигационных команд - открываем URL напрямую
        if (command === 'show_on_map' && navCard.open_map_url) {
            window.open(navCard.open_map_url, '_blank');
            return;
        }
        
        if (command === 'route' && navCard.navigate_to_url) {
            window.open(navCard.navigate_to_url, '_blank');
            return;
        }
        
        // Для остальных команд используем стандартную обработку
        executeCommand(command, button.assistant_request);
    };

    return React.createElement('div', {
        className: 'space-y-4'
    }, cards.map((navCard, index) => 
        React.createElement('div', {
            key: index,
            className: 'backdrop-blur-lg bg-amber-600/20 rounded-2xl p-4 border border-amber-600/30 shadow-xl hover:border-amber-400/50'
        }, [
            React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-amber-200 mb-2'
            }, navCard.title),
            
            navCard.description ? React.createElement('p', {
                key: 'desc',
                className: 'text-white/80 mb-3'
            }, navCard.description) : null,
            
            navCard.buttons ? React.createElement('div', {
                key: 'buttons',
                className: 'flex flex-wrap gap-2'
            }, navCard.buttons.map((button, btnIndex) =>
                React.createElement('button', {
                    key: btnIndex,
                    onClick: () => handleNavigationClick(button, navCard),
                    className: 'px-3 py-2 rounded-full backdrop-blur-md bg-amber-600/20 border border-amber-600/30 text-amber-200 hover:bg-amber-600/40 hover:border-amber-400/50'
                }, button.text)
            )) : null
        ].filter(Boolean))
    ));
};

/**
 * Рендерер универсальных элементов (ElementsItem с полями title и value)
 */
const ElementsRenderer = ({ elements, executeCommand }) => {
    return React.createElement('div', {
        className: 'space-y-3'
    }, elements.map((element, index) => {
        // ElementsItem structure: {title: string, value: string}
        return React.createElement('div', {
            key: `element-${index}`,
            className: 'flex justify-between items-center p-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20'
        }, [
            React.createElement('span', {
                key: 'title',
                className: 'text-white/80 font-medium'
            }, element.title),
            React.createElement('span', {
                key: 'value',
                className: 'text-white'
            }, element.value)
        ]);
    }));
};

/**
 * Рендерер инструментальных карточек
 */
const ToolCardsRenderer = ({ cards, executeCommand }) => {
    return React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
    }, cards.map((card, index) => 
        React.createElement('div', {
            key: index,
            className: 'backdrop-blur-lg bg-purple-600/20 rounded-2xl p-4 border border-purple-600/30 shadow-xl hover:border-purple-400/50'
        }, [
            React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-purple-200 mb-2'
            }, card.title),
            
            card.description ? React.createElement('p', {
                key: 'desc',
                className: 'text-white/80 mb-3'
            }, card.description) : null,
            
            card.actions ? React.createElement('div', {
                key: 'actions',
                className: 'flex flex-wrap gap-2'
            }, card.actions.map((action, actionIndex) =>
                React.createElement('button', {
                    key: actionIndex,
                    onClick: () => executeCommand(
                        action.command || action.text, 
                        action.assistant_request
                    ),
                    className: 'px-3 py-2 rounded-lg backdrop-blur-md bg-purple-600/30 border border-purple-600/40 text-purple-200 hover:bg-purple-600/50 hover:border-purple-400/60'
                }, action.text || action.label)
            )) : null
        ].filter(Boolean))
    ));
};

/**
 * Карточки контактов
 */
const ContactCards = ({ cards, executeCommand }) => {
    const handleContactClick = (button, card) => {
        const command = button.command || button.text;
        
        // Обработка команд контактов - заглушки
        if (command === 'call') {
            console.log(`Calling ${card.phone || 'unknown number'}`);
            // TODO: Реализовать функционал звонка
            return;
        }
        
        if (command === 'email') {
            console.log(`Emailing ${card.email || 'unknown email'}`);
            // TODO: Реализовать функционал отправки email
            return;
        }
        
        // Для остальных команд используем стандартную обработку
        executeCommand(command, button.assistant_request);
    };

    return React.createElement('div', {
        className: 'space-y-4'
    }, cards.map((card, index) => 
        React.createElement('div', {
            key: index,
            className: 'backdrop-blur-lg bg-green-600/20 rounded-2xl p-4 border border-green-600/30 shadow-xl hover:border-green-400/50'
        }, [
            React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-green-200 mb-2'
            }, card.name || card.title),
            
            card.phone ? React.createElement('p', {
                key: 'phone',
                className: 'text-white/80 mb-1'
            }, `📞 ${card.phone}`) : null,
            
            card.email ? React.createElement('p', {
                key: 'email',
                className: 'text-white/80 mb-1'
            }, `📧 ${card.email}`) : null,
            
            card.address ? React.createElement('p', {
                key: 'address',
                className: 'text-white/80 mb-3'
            }, `📍 ${card.address}`) : null,
            
            card.buttons ? React.createElement('div', {
                key: 'buttons',
                className: 'flex flex-wrap gap-2'
            }, card.buttons.map((button, btnIndex) =>
                React.createElement('button', {
                    key: btnIndex,
                    onClick: () => handleContactClick(button, card),
                    className: 'px-3 py-2 rounded-lg backdrop-blur-md bg-green-600/30 border border-green-600/40 text-green-200 hover:bg-green-600/50 hover:border-green-400/60'
                }, button.text)
            )) : null
        ].filter(Boolean))
    ));
};

/**
 * Футбольный виджет
 */
const FootballWidget = ({ widget, executeCommand }) => {
    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-blue-600/20 rounded-2xl p-4 border border-blue-600/30 shadow-xl hover:border-blue-400/50'
    }, [
        React.createElement('h3', {
            key: 'title',
            className: 'font-semibold text-blue-200 mb-3'
        }, widget.title || 'Футбол'),
        
        widget.matches ? React.createElement('div', {
            key: 'matches',
            className: 'space-y-2'
        }, widget.matches.map((match, matchIndex) =>
            React.createElement('div', {
                key: matchIndex,
                className: 'bg-white/10 rounded-lg p-3'
            }, [
                React.createElement('div', {
                    key: 'teams',
                    className: 'flex justify-between items-center text-white'
                }, [
                    React.createElement('span', { key: 'home' }, match.home_team),
                    React.createElement('span', { key: 'score', className: 'font-bold' }, match.score || 'vs'),
                    React.createElement('span', { key: 'away' }, match.away_team)
                ]),
                match.time ? React.createElement('div', {
                    key: 'time',
                    className: 'text-white/60 text-sm mt-1'
                }, match.time) : null
            ].filter(Boolean))
        )) : null
    ].filter(Boolean));
};

/**
 * Рендерер таблиц (старый)
 */
const TableRenderer = ({ table, executeCommand }) => {
    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 shadow-xl overflow-hidden'
    }, [
        table.title ? React.createElement('h3', {
            key: 'title',
            className: 'font-semibold text-white mb-3'
        }, table.title) : null,
        
        React.createElement('div', {
            key: 'table-container',
            className: 'overflow-x-auto'
        }, React.createElement('table', {
            className: 'w-full text-white text-sm'
        }, [
            table.headers ? React.createElement('thead', {
                key: 'thead'
            }, React.createElement('tr', {
                className: 'border-b border-white/20'
            }, table.headers.map((header, headerIndex) =>
                React.createElement('th', {
                    key: `header-${headerIndex}`,
                    className: 'text-left p-2 font-medium text-white/80'
                }, header)
            ))) : null,
            
            table.rows ? React.createElement('tbody', {
                key: 'tbody'
            }, table.rows.map((row, rowIndex) =>
                React.createElement('tr', {
                    key: `row-${rowIndex}`,
                    className: 'border-b border-white/10 hover:bg-white/5'
                }, row.map((cell, cellIndex) =>
                    React.createElement('td', {
                        key: `cell-${rowIndex}-${cellIndex}`,
                        className: 'p-2 text-white/90'
                    }, cell?.content || cell || '')
                ))
            )) : null
        ].filter(Boolean)))
    ].filter(Boolean));
};

// ========== НОВЫЕ РЕНДЕРЕРЫ ДЛЯ СТРУКТУРЫ UI_ANSWER ==========

/**
 * Рендерер новой структуры CardGrid
 */
const NewCardGridRenderer = ({ cardGrid, executeCommand }) => {
    const gridClass = cardGrid.grid_dimensions === '2_columns' 
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
        : 'grid grid-cols-1 gap-4';

    return React.createElement('div', {
        className: gridClass
    }, cardGrid.cards.map((card, index) => 
        React.createElement(NewCardComponent, {
            key: index,
            card,
            executeCommand
        })
    ));
};

/**
 * Компонент новой карточки
 */
const NewCardComponent = ({ card, executeCommand }) => {
    const handleButtonClick = (button) => {
        if (button.type === 'assistant_button') {
            executeCommand('assistant_button', button.assistant_request);
        } else if (button.type === 'frontend_button') {
            handleFrontendCommand(button.command);
        }
    };

    const cardElements = [];

    if (card.title) {
        cardElements.push(React.createElement('h3', {
            key: 'title',
            className: 'font-semibold text-white mb-2'
        }, card.title));
    }

    if (card.subtitle) {
        cardElements.push(React.createElement('p', {
            key: 'subtitle',
            className: 'text-sm text-white/70 mb-2'
        }, card.subtitle));
    }

    if (card.text) {
        cardElements.push(React.createElement('div', {
            key: 'content',
            className: 'text-white/80 text-sm prose prose-invert mb-3',
            dangerouslySetInnerHTML: { __html: card.text }
        }));
    }

    // Кнопки карточки
    if (card.buttons && card.buttons.length > 0) {
        cardElements.push(React.createElement('div', {
            key: 'buttons',
            className: 'flex flex-wrap gap-2 mt-3'
        }, card.buttons.map((button, btnIndex) => 
            React.createElement('button', {
                key: btnIndex,
                onClick: () => handleButtonClick(button),
                className: `inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold hover:border-white/40 ${getButtonStyle(button.style)}`
            }, [
                button.icon ? renderIcon(button.icon) : null,
                button.text
            ].filter(Boolean))
        )));
    }

    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 shadow-xl hover:border-white/40'
    }, cardElements);
};

/**
 * Обработчик frontend команд
 */
const handleFrontendCommand = (command) => {
    console.log('Frontend command:', command);
    
    switch (command) {
        case 'navigate_to':
            // TODO: Реализовать навигацию
            break;
        case 'open_map':
            // TODO: Открыть карту
            break;
        case 'call':
            // TODO: Инициировать звонок
            break;
        case 'email':
            // TODO: Открыть email
            break;
        default:
            console.log('Unhandled frontend command:', command);
    }
};

/**
 * Рендерер новых таблиц
 */
const NewTableRenderer = ({ table }) => {
    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-lg border border-white/20 shadow-xl overflow-hidden'
    }, [
        table.title ? React.createElement('div', {
            key: 'title-container',
            className: 'p-4 bg-slate-800/80 border-b border-slate-700/50'
        }, React.createElement('h3', {
            className: 'font-semibold text-white'
        }, table.title)) : null,
        
        React.createElement('div', {
            key: 'table-container',
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
                        key: index,
                        className: `px-4 py-3 text-left text-white font-semibold ${
                            table.highlight_column === index ? 'bg-indigo-600/30' : ''
                        }`
                    }, header)
                )
            )),
            
            React.createElement('tbody', {
                key: 'tbody'
            }, table.rows.map((row, rowIndex) =>
                React.createElement('tr', {
                    key: rowIndex,
                    className: 'border-t border-white/10 hover:bg-white/5'
                }, row.map((cell, cellIndex) =>
                    React.createElement('td', {
                        key: cellIndex,
                        className: `px-4 py-3 text-white/80 ${
                            table.highlight_column === cellIndex ? 'bg-indigo-600/10 font-semibold' : ''
                        }`
                    }, cell)
                ))
            ))
        ]))
    ].filter(Boolean));
};

/**
 * Рендерер графиков
 */
const ChartRenderer = ({ chart }) => {
    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl p-6 border border-white/20'
    }, [
        chart.title ? React.createElement('h3', {
            key: 'title',
            className: 'text-xl font-bold text-white mb-2'
        }, chart.title) : null,
        
        chart.description ? React.createElement('p', {
            key: 'description',
            className: 'text-white/70 mb-4'
        }, chart.description) : null,
        
        React.createElement('div', {
            key: 'chart-placeholder',
            className: 'text-white/50 flex items-center justify-center h-64 bg-slate-800/30 rounded-lg'
        }, `График (${chart.chart_type}) - Chart.js требует дополнительной настройки`)
    ].filter(Boolean));
};
