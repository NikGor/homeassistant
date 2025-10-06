/**
 * main.js - точка входа в приложение
 * Импортирует и инициализирует все модули
 */

import { ChatAssistant } from './ChatAssistant.js';

/**
 * Инициализация приложения
 * Вызывается после загрузки DOM
 */
const initializeApp = () => {
    // Проверяем наличие контейнера
    const container = document.getElementById('chat-root');
    if (!container) {
        console.error('Не найден контейнер #chat-root для инициализации приложения');
        return;
    }

    // Проверяем наличие React
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React или ReactDOM не загружены');
        return;
    }

    try {
        // Создаем root для React 18
        const root = ReactDOM.createRoot(container);
        
        // Рендерим приложение
        root.render(React.createElement(ChatAssistant));
        
        console.log('✅ Archie Chat Assistant успешно инициализирован');
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
    }
};

/**
 * Автоматическая инициализация при загрузке DOM
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM уже загружен
    initializeApp();
}

// Экспортируем для использования в других местах
export { initializeApp };
