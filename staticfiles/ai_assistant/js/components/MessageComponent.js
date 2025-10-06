/**
 * MessageComponent - компонент для отображения сообщений чата
 */

import { UserIcon, BotIcon, CopyIcon } from './Icons.js';
import { formatTime, copyToClipboard } from '../utils/Formatters.js';
import { WeatherWidget } from './WeatherWidget.js';

/**
 * Основной компонент сообщения
 * @param {Object} message - Объект сообщения
 * @param {Function} executeCommand - Функция выполнения команд
 * @returns {ReactElement} Компонент сообщения
 */
export const MessageComponent = (message, executeCommand) => {
    const isUser = message.role === 'user';
    
    return React.createElement('div', {
        className: `mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`
    }, React.createElement('div', {
        className: `max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`
    }, [
        React.createElement(MessageBubble, {
            key: 'bubble',
            message,
            isUser,
            onCopy: () => copyToClipboard(message.text)
        }),
        
        message.metadata ? React.createElement(MetadataRenderer, {
            key: 'metadata',
            metadata: message.metadata,
            executeCommand
        }) : null
    ].filter(Boolean)));
};

/**
 * Пузырь сообщения
 */
const MessageBubble = ({ message, isUser, onCopy }) => {
    return React.createElement('div', {
        className: `backdrop-blur-lg rounded-3xl p-6 border shadow-2xl relative group transition-all duration-300 hover:scale-[1.02] ${
            isUser 
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500/30 text-white' 
                : 'bg-white/10 border-white/20 text-white'
        }`
    }, [
        // Заголовок сообщения
        React.createElement(MessageHeader, {
            key: 'header',
            isUser,
            createdAt: message.created_at
        }),
        
        // Содержимое сообщения
        React.createElement('div', {
            key: 'content',
            className: 'prose prose-invert max-w-none',
            dangerouslySetInnerHTML: { __html: message.text }
        }),
        
        // Кнопка копирования
        React.createElement('button', {
            key: 'copy',
            onClick: onCopy,
            className: 'absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100 hover:scale-110'
        }, React.createElement(CopyIcon))
    ]);
};

/**
 * Заголовок сообщения с иконкой и временем
 */
const MessageHeader = ({ isUser, createdAt }) => {
    return React.createElement('div', {
        className: 'flex items-center gap-2 mb-3'
    }, [
        isUser ? React.createElement(UserIcon, { key: 'icon' }) : React.createElement(BotIcon, { key: 'icon' }),
        React.createElement('span', {
            key: 'name',
            className: 'text-sm opacity-70'
        }, isUser ? 'Вы' : 'Archie'),
        React.createElement('span', {
            key: 'time',
            className: 'text-xs opacity-50 ml-auto'
        }, formatTime(createdAt))
    ]);
};

/**
 * Рендерер метаданных сообщения
 */
const MetadataRenderer = ({ metadata, executeCommand }) => {
    if (!metadata) return null;

    const elements = [];

    // UI Buttons
    if (metadata.ui_elements?.length > 0) {
        elements.push(React.createElement(UIButtons, {
            key: 'ui-buttons',
            buttons: metadata.ui_elements,
            executeCommand
        }));
    }

    // Cards
    if (metadata.cards?.length > 0) {
        elements.push(React.createElement(CardsRenderer, {
            key: 'cards',
            cards: metadata.cards,
            executeCommand
        }));
    }

    // Navigation Cards
    if (metadata.navigation_card?.length > 0) {
        elements.push(React.createElement(NavigationCards, {
            key: 'nav-cards',
            cards: metadata.navigation_card,
            executeCommand
        }));
    }

    // Weather Widget
    if (metadata.weather_widget) {
        elements.push(React.createElement(WeatherWidget, {
            key: 'weather-widget',
            ...metadata.weather_widget
        }));
    }

    return elements.length > 0 ? React.createElement('div', {
        className: 'mt-4 space-y-4'
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
                button.command || button.label, 
                button.assistant_request
            ),
            className: 'px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-white/30'
        }, button.label)
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
        className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-slate-500/30 transition-all duration-300 hover:scale-105 group relative'
    }, cardElements);
};

/**
 * Навигационные карточки
 */
const NavigationCards = ({ cards, executeCommand }) => {
    return React.createElement('div', {
        className: 'space-y-4'
    }, cards.map((navCard, index) => 
        React.createElement('div', {
            key: index,
            className: 'backdrop-blur-lg bg-amber-600/20 rounded-2xl p-4 border border-amber-600/30 shadow-xl hover:shadow-amber-500/30 transition-all duration-300'
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
                    onClick: () => executeCommand(
                        button.command || button.text, 
                        button.assistant_request
                    ),
                    className: 'px-3 py-2 rounded-full backdrop-blur-md bg-amber-600/20 border border-amber-600/30 text-amber-200 hover:bg-amber-600/40 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/50'
                }, button.text)
            )) : null
        ].filter(Boolean))
    ));
};
