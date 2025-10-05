// Core ArchieChat class - main chat functionality
class ArchieChat {
    constructor() {
        this.apiUrl = localStorage.getItem('archie_api_url') || 'http://localhost:8002';
        this.apiKey = localStorage.getItem('archie_api_key') || '';
        this.assistantName = localStorage.getItem('archie_assistant_name') || 'Archie';
        this.currentChatId = null;
        this.chats = JSON.parse(localStorage.getItem('archie_chats') || '[]');
        this.websocket = null;
        this.logger = new ChatLogger();
        
        this.logger.logSystemEvent('Chat application initialized', {
            apiUrl: this.apiUrl,
            assistantName: this.assistantName,
            existingChats: this.chats.length
        });
        
        this.initializeUI();
        this.loadChats();
    }

    initializeUI() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const chatSearch = document.getElementById('chatSearch');

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => this.sendMessage());
        chatSearch.addEventListener('input', (e) => this.filterChats(e.target.value));

        // Load settings into modal
        document.getElementById('apiUrl').value = this.apiUrl;
        document.getElementById('apiKey').value = this.apiKey;
        document.getElementById('assistantName').value = this.assistantName;
        
        // Load logging settings
        const logLevelSelect = document.getElementById('logLevel');
        if (logLevelSelect && this.logger) {
            logLevelSelect.value = this.logger.logLevel;
        }
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async sendMessage(customMessage = null) {
        const messageInput = document.getElementById('messageInput');
        const message = customMessage || messageInput.value.trim();
        
        if (!message || !this.currentChatId) return;

        // Create user message object
        const userMessage = {
            message_id: this.generateMessageId(),
            role: 'user',
            text: message,
            text_format: 'html',
            conversation_id: this.currentChatId
        };

        // Log outgoing message
        this.logger.logOutgoingMessage(message, userMessage.message_id, this.currentChatId);

        // Add user message to UI
        this.addMessage(userMessage, 'user');
        if (!customMessage) messageInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();

        const startTime = performance.now();
        
        try {
            console.log('Sending message to:', `${this.apiUrl}/chat`);
            console.log('Message data:', userMessage);

            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify(userMessage)
            });

            const responseTime = performance.now() - startTime;
            
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                
                // Log API error
                const error = new Error(`HTTP ${response.status}: ${errorText}`);
                this.logger.logApiError(error, userMessage.message_id, this.currentChatId, this.apiUrl);
                
                throw error;
            }

            const assistantMessage = await response.json();
            console.log('Assistant response:', assistantMessage);
            
            // Log incoming message and performance
            this.logger.logIncomingMessage(assistantMessage, userMessage.message_id, this.currentChatId);
            this.logger.logPerformance('API Request', responseTime, {
                messageId: userMessage.message_id,
                responseSize: JSON.stringify(assistantMessage).length
            });
            
            // Add assistant response directly
            this.addMessage(assistantMessage, 'assistant');
            this.hideTypingIndicator();
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            
            // Log error if not already logged
            if (!error.message.includes('HTTP')) {
                this.logger.logApiError(error, userMessage.message_id, this.currentChatId, this.apiUrl);
            }
            
            let errorMessage = 'Неизвестная ошибка';
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = `Не удается подключиться к API на ${this.apiUrl}. Проверьте, что сервис запущен.`;
            } else {
                errorMessage = error.message;
            }
            
            this.addMessage({
                text: `Извините, произошла ошибка: ${errorMessage}`,
                text_format: 'plain'
            }, 'assistant');
        }
    }

    showTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'block';
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    saveSettings() {
        this.apiUrl = document.getElementById('apiUrl').value;
        this.apiKey = document.getElementById('apiKey').value;
        this.assistantName = document.getElementById('assistantName').value;
        
        localStorage.setItem('archie_api_url', this.apiUrl);
        localStorage.setItem('archie_api_key', this.apiKey);
        localStorage.setItem('archie_assistant_name', this.assistantName);
        
        // Save logging settings
        const logLevel = document.getElementById('logLevel').value;
        if (this.logger && logLevel) {
            this.logger.setLogLevel(logLevel);
        }
        
        this.logger.logUserAction('save_settings', {
            apiUrl: this.apiUrl,
            assistantName: this.assistantName,
            logLevel: logLevel
        });
    }
}
