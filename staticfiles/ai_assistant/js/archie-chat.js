class ArchieChat {
    constructor() {
        this.apiUrl = 'http://localhost:8002/chat';
        this.messages = [];
        this.conversationId = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStoredMessages();
        this.testConnection();
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.connectionStatus = document.getElementById('connectionStatus');
    }

    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input change for send button state
        this.messageInput.addEventListener('input', () => {
            this.sendButton.disabled = this.messageInput.value.trim() === '';
        });
        
        // Settings modal events
        document.getElementById('settingsButton').addEventListener('click', () => {
            this.showSettings();
        });
        
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.getElementById('testConnection').addEventListener('click', () => {
            this.testConnection();
        });
    }

    async testConnection() {
        this.updateConnectionStatus('loading', 'Проверка соединения...');
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'test connection',
                    conversation_id: 'test'
                })
            });

            if (response.ok) {
                this.updateConnectionStatus('success', 'Соединение установлено');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            this.updateConnectionStatus('error', `Ошибка соединения: ${error.message}`);
        }
    }

    updateConnectionStatus(type, message) {
        this.connectionStatus.className = `connection-status ${type}`;
        this.connectionStatus.textContent = message;
        this.connectionStatus.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                this.connectionStatus.style.display = 'none';
            }, 3000);
        }
    }

    async sendMessage() {
        const messageText = this.messageInput.value.trim();
        if (!messageText) return;

        // Disable input and button
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;

        // Add user message to UI
        this.addMessage({
            role: 'user',
            text: messageText,
            timestamp: new Date().toISOString()
        });

        // Clear input
        this.messageInput.value = '';

        try {
            // Send to API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    conversation_id: this.conversationId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Update conversation ID if provided
            if (data.conversation_id) {
                this.conversationId = data.conversation_id;
            }

            // Add assistant response
            this.addMessage({
                role: 'assistant',
                text: data.response,
                timestamp: new Date().toISOString(),
                metadata: data.metadata || {},
                cards: data.cards || [],
                ui_elements: data.ui_elements || {}
            });

        } catch (error) {
            console.error('Send message error:', error);
            this.addMessage({
                role: 'assistant',
                text: `Извините, произошла ошибка при отправке сообщения: ${error.message}`,
                timestamp: new Date().toISOString(),
                metadata: { error: true }
            });
        } finally {
            // Re-enable input and button
            this.messageInput.disabled = false;
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
    }

    addMessage(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.saveMessages();
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role} fade-in`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = message.text;

        // Add timestamp
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(message.timestamp);

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        // Add UI elements if present
        if (message.ui_elements) {
            this.renderUIElements(contentDiv, message.ui_elements);
        }

        // Add cards if present
        if (message.cards && message.cards.length > 0) {
            this.renderCards(contentDiv, message.cards);
        }

        this.messagesContainer.appendChild(messageDiv);
    }

    renderUIElements(container, uiElements) {
        // Render buttons
        if (uiElements.buttons && uiElements.buttons.length > 0) {
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'message-buttons';
            
            uiElements.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `message-btn btn-${button.style || 'primary'}`;
                btn.textContent = button.text;
                btn.onclick = () => this.handleButtonClick(button);
                buttonsDiv.appendChild(btn);
            });
            
            container.appendChild(buttonsDiv);
        }

        // Render dropdown
        if (uiElements.dropdown) {
            const dropdownDiv = document.createElement('div');
            dropdownDiv.className = 'message-dropdown';
            
            const select = document.createElement('select');
            select.className = 'form-select';
            
            const defaultOption = document.createElement('option');
            defaultOption.textContent = uiElements.dropdown.placeholder || 'Выберите опцию';
            defaultOption.value = '';
            select.appendChild(defaultOption);
            
            uiElements.dropdown.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                select.appendChild(opt);
            });
            
            select.onchange = () => this.handleDropdownChange(uiElements.dropdown, select.value);
            dropdownDiv.appendChild(select);
            container.appendChild(dropdownDiv);
        }

        // Render checklist
        if (uiElements.checklist) {
            const checklistDiv = document.createElement('div');
            checklistDiv.className = 'message-checklist';
            
            uiElements.checklist.options.forEach((option, index) => {
                const checkDiv = document.createElement('div');
                checkDiv.className = 'form-check';
                
                const input = document.createElement('input');
                input.className = 'form-check-input';
                input.type = 'checkbox';
                input.id = `check_${Date.now()}_${index}`;
                input.value = option.value;
                input.onchange = () => this.handleChecklistChange(uiElements.checklist);
                
                const label = document.createElement('label');
                label.className = 'form-check-label';
                label.setAttribute('for', input.id);
                label.textContent = option.text;
                
                checkDiv.appendChild(input);
                checkDiv.appendChild(label);
                checklistDiv.appendChild(checkDiv);
            });
            
            container.appendChild(checklistDiv);
        }
    }

    renderCards(container, cards) {
        cards.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'chat-card mb-3';
            
            let cardHTML = '';
            
            if (card.title) {
                cardHTML += `<div class="card-header"><h5 class="card-title mb-0">${card.title}</h5></div>`;
            }
            
            cardHTML += '<div class="card-body">';
            
            if (card.content) {
                cardHTML += `<p class="card-text">${card.content}</p>`;
            }
            
            if (card.fields && card.fields.length > 0) {
                card.fields.forEach(field => {
                    cardHTML += `<p><strong>${field.name}:</strong> ${field.value}</p>`;
                });
            }
            
            cardHTML += '</div>';
            
            if (card.footer) {
                cardHTML += `<div class="card-footer text-muted">${card.footer}</div>`;
            }
            
            cardDiv.innerHTML = cardHTML;
            container.appendChild(cardDiv);
        });
    }

    handleButtonClick(button) {
        if (button.action) {
            // Send button action as a message
            this.messageInput.value = button.action;
            this.sendMessage();
        } else {
            // Send button text as a message
            this.messageInput.value = button.text;
            this.sendMessage();
        }
    }

    handleDropdownChange(dropdown, value) {
        if (value && dropdown.action) {
            this.messageInput.value = `${dropdown.action}: ${value}`;
            this.sendMessage();
        }
    }

    handleChecklistChange(checklist) {
        const container = event.target.closest('.message-checklist');
        const checked = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
            .map(input => input.value);
        
        if (checked.length > 0 && checklist.action) {
            this.messageInput.value = `${checklist.action}: ${checked.join(', ')}`;
            this.sendMessage();
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    saveMessages() {
        try {
            localStorage.setItem('archie_messages', JSON.stringify(this.messages));
            localStorage.setItem('archie_conversation_id', this.conversationId || '');
        } catch (error) {
            console.error('Failed to save messages:', error);
        }
    }

    loadStoredMessages() {
        try {
            const stored = localStorage.getItem('archie_messages');
            const storedConversationId = localStorage.getItem('archie_conversation_id');
            
            if (stored) {
                this.messages = JSON.parse(stored);
                this.messages.forEach(message => this.renderMessage(message));
                this.scrollToBottom();
            }
            
            if (storedConversationId) {
                this.conversationId = storedConversationId;
            }
        } catch (error) {
            console.error('Failed to load stored messages:', error);
            this.messages = [];
        }
    }

    clearHistory() {
        this.messages = [];
        this.conversationId = null;
        this.messagesContainer.innerHTML = '';
        
        try {
            localStorage.removeItem('archie_messages');
            localStorage.removeItem('archie_conversation_id');
        } catch (error) {
            console.error('Failed to clear stored messages:', error);
        }
        
        // Close settings modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        if (modal) {
            modal.hide();
        }
        
        // Show confirmation
        this.addMessage({
            role: 'assistant',
            text: 'История чата очищена.',
            timestamp: new Date().toISOString(),
            metadata: { system: true }
        });
    }

    showSettings() {
        // Update settings values from storage
        const apiUrl = localStorage.getItem('archie_api_url') || this.apiUrl;
        document.getElementById('apiUrl').value = apiUrl;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
    }

    saveSettings() {
        const apiUrl = document.getElementById('apiUrl').value.trim();
        
        if (apiUrl) {
            this.apiUrl = apiUrl;
            localStorage.setItem('archie_api_url', apiUrl);
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        if (modal) {
            modal.hide();
        }
        
        // Test new connection
        this.testConnection();
    }

    // Utility method to get current settings
    getSettings() {
        return {
            apiUrl: this.apiUrl,
            conversationId: this.conversationId,
            messageCount: this.messages.length
        };
    }

    // Method to export chat history
    exportHistory() {
        const data = {
            messages: this.messages,
            conversationId: this.conversationId,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `archie_chat_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.archieChat = new ArchieChat();
    
    // Add export functionality to settings
    if (document.getElementById('exportHistory')) {
        document.getElementById('exportHistory').addEventListener('click', () => {
            window.archieChat.exportHistory();
        });
    }
});
