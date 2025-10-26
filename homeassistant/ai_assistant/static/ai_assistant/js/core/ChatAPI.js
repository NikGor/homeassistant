/**
 * ChatAPI - класс для работы с backend API
 * Отвечает за все HTTP запросы к серверу
 */
export class ChatAPI {
    constructor() {
        this.baseUrl = '/ai-assistant/api';
    }

    /**
     * Получить список всех бесед
     * @returns {Promise<Array>} Массив объектов бесед
     */
    async getConversations() {
        const response = await fetch(`${this.baseUrl}/conversations/`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Создать новую беседу
     * @param {string} title - Заголовок беседы
     * @returns {Promise<Object>} Объект созданной беседы
     */
    async createConversation(title = `Новый чат ${Date.now()}`) {
        const response = await fetch(`${this.baseUrl}/conversations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Получить сообщения беседы
     * @param {string} conversationId - ID беседы
     * @returns {Promise<Array>} Массив сообщений
     */
    async getMessages(conversationId) {
        const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages/`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Отправить сообщение
     * @param {Object} messageData - Данные сообщения
     * @returns {Promise<Object>} Ответ от сервера
     */
    async sendMessage(messageData) {
        const response = await fetch(`${this.baseUrl}/messages/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Удалить беседу
     * @param {string} conversationId - ID беседы для удаления
     * @returns {Promise<void>}
     */
    async deleteConversation(conversationId) {
        const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }

    /**
     * Проверить работоспособность API
     * @returns {Promise<boolean>} true если API работает
     */
    async testConnection() {
        try {
            await this.getConversations();
            return true;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}
