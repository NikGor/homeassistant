// Главное приложение чата - простое и понятное
class ChatApp {
    constructor() {
        this.api = new ChatAPI();
        this.ui = new ChatUI();
        this.conversationList = new ConversationList();
        this.currentConversationId = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadConversations();
    }

    setupEventListeners() {
        // Кнопки
        document.getElementById('newChatButton').addEventListener('click', () => this.createNewChat());
        document.getElementById('testApiButton').addEventListener('click', () => this.testAPI());
        document.getElementById('sendButton').addEventListener('click', () => this.sendMessage());
        
        // Enter для отправки
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Поиск чатов
        document.getElementById('chatSearch').addEventListener('input', (e) => {
            this.conversationList.filterChats(e.target.value);
        });

        // Выбор чата
        this.conversationList.setOnSelectCallback((conversationId) => {
            this.selectConversation(conversationId);
        });

        // Обработка кнопок в сообщениях
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ui-button') && e.target.dataset.command) {
                this.executeCommand(e.target.dataset.command);
            }
        });
    }

    async loadConversations() {
        try {
            const conversations = await this.api.getConversations();
            this.conversationList.updateConversations(conversations);
        } catch (error) {
            this.ui.showError(`Не удалось загрузить чаты: ${error.message}`);
        }
    }

    async selectConversation(conversationId) {
        this.currentConversationId = conversationId;
        
        // Обновляем заголовок
        document.getElementById('currentChatTitle').textContent = `Чат ${conversationId.split('-').pop()}`;
        
        // Включаем поле ввода
        this.ui.enableInput(true);

        // Загружаем сообщения
        try {
            const messages = await this.api.getMessages(conversationId);
            this.ui.renderMessages(messages);
        } catch (error) {
            this.ui.showError(`Не удалось загрузить сообщения: ${error.message}`);
        }
    }

    async sendMessage() {
        const text = this.ui.getInputValue();
        if (!text || !this.currentConversationId) return;

        this.ui.clearInput();
        this.ui.enableInput(false);
        this.ui.showTyping(true);

        try {
            // Добавляем сообщение пользователя
            const userMessage = {
                message_id: `temp-user-${Date.now()}`,
                role: 'user',
                text: text,
                text_format: 'html',
                created_at: new Date().toISOString(),
                metadata: null
            };
            this.ui.addMessage(userMessage);

            // Отправляем на сервер
            const messageData = {
                role: 'user',
                text: text,
                text_format: 'html',
                conversation_id: this.currentConversationId
            };

            const result = await this.api.sendMessage(messageData);

            // Добавляем ответ ассистента
            const assistantMessage = {
                message_id: result.message_id || `temp-assistant-${Date.now()}`,
                role: 'assistant',
                text: result.text,
                text_format: result.text_format,
                created_at: result.created_at || new Date().toISOString(),
                metadata: result.metadata
            };
            this.ui.addMessage(assistantMessage);

        } catch (error) {
            this.ui.showError(`Не удалось отправить сообщение: ${error.message}`);
        } finally {
            this.ui.showTyping(false);
            this.ui.enableInput(true);
        }
    }

    async executeCommand(command) {
        if (!this.currentConversationId) return;

        const messageData = {
            role: 'user',
            text: command,
            text_format: 'html',
            conversation_id: this.currentConversationId
        };

        this.ui.showTyping(true);

        try {
            const result = await this.api.sendMessage(messageData);
            
            const assistantMessage = {
                message_id: result.message_id || `temp-assistant-${Date.now()}`,
                role: 'assistant',
                text: result.text,
                text_format: result.text_format,
                created_at: result.created_at || new Date().toISOString(),
                metadata: result.metadata
            };
            this.ui.addMessage(assistantMessage);

        } catch (error) {
            this.ui.showError(`Ошибка выполнения команды: ${error.message}`);
        } finally {
            this.ui.showTyping(false);
        }
    }

    async createNewChat() {
        try {
            const result = await this.api.createConversation();
            
            const newConversation = {
                conversation_id: result.conversation_id,
                title: result.title,
                created_at: result.created_at
            };
            
            this.conversationList.addConversation(newConversation);
            this.conversationList.selectConversation(result.conversation_id);
            
        } catch (error) {
            this.ui.showError(`Не удалось создать новый чат: ${error.message}`);
        }
    }

    async testAPI() {
        try {
            const conversations = await this.api.getConversations();
            alert(`✅ API работает! Найдено ${conversations.length} чатов.`);
        } catch (error) {
            alert(`❌ Ошибка API: ${error.message}`);
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
