// API модуль для работы с бэкендом
class ChatAPI {
    constructor() {
        this.baseUrl = '/ai-assistant/api';
    }

    async getConversations() {
        const response = await fetch(`${this.baseUrl}/conversations/`);
        if (!response.ok) throw new Error(`Failed to load conversations: ${response.status}`);
        return response.json();
    }

    async getMessages(conversationId) {
        const response = await fetch(`${this.baseUrl}/messages/?conversation_id=${conversationId}`);
        if (!response.ok) throw new Error(`Failed to load messages: ${response.status}`);
        return response.json();
    }

    async sendMessage(messageData) {
        const response = await fetch(`${this.baseUrl}/chat/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        if (!response.ok) throw new Error(`Failed to send message: ${response.status}`);
        return response.json();
    }

    async createConversation() {
        const response = await fetch(`${this.baseUrl}/conversations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to create conversation: ${response.status}`);
        return response.json();
    }
}
