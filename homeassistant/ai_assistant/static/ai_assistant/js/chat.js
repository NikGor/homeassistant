class ChatApp {
    constructor() {
        // Используем относительные пути через Django proxy
        this.apiUrl = '/ai-assistant/api';
        this.currentConversationId = null;
        this.conversations = [];
        console.log('ChatApp initialized with API URL:', this.apiUrl);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConversations();
    }

    setupEventListeners() {
        // Новый чат
        document.getElementById('newChatButton').addEventListener('click', () => {
            this.createNewChat();
        });

        // Тест API
        document.getElementById('testApiButton').addEventListener('click', () => {
            this.testAPI();
        });

        // Отправка сообщения
        document.getElementById('sendButton').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter для отправки
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Поиск чатов
        document.getElementById('chatSearch').addEventListener('input', (e) => {
            this.filterChats(e.target.value);
        });
    }

    async loadConversations() {
        try {
            console.log('Loading conversations from:', `${this.apiUrl}/conversations/`);
            const response = await fetch(`${this.apiUrl}/conversations/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('Response status:', response.status);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to load conversations`);
            
            this.conversations = await response.json();
            console.log('Loaded conversations:', this.conversations.length);
            this.renderConversations();
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showError(`Не удалось загрузить чаты: ${error.message}`);
        }
    }

    renderConversations() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';

        this.conversations.forEach(conversation => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.conversationId = conversation.conversation_id;
            
            const date = new Date(conversation.created_at).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            chatItem.innerHTML = `
                <div class="chat-title">Чат ${conversation.conversation_id.split('-').pop()}</div>
                <div class="chat-date">${date}</div>
            `;

            chatItem.addEventListener('click', () => {
                this.selectConversation(conversation.conversation_id);
            });

            chatList.appendChild(chatItem);
        });
    }

    async selectConversation(conversationId) {
        // Убираем активный класс у всех чатов
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });

        // Добавляем активный класс к выбранному чату
        const selectedItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        this.currentConversationId = conversationId;
        
        // Обновляем заголовок
        document.getElementById('currentChatTitle').textContent = `Чат ${conversationId.split('-').pop()}`;
        
        // Включаем поле ввода
        document.getElementById('messageInput').disabled = false;
        document.getElementById('sendButton').disabled = false;

        // Загружаем сообщения
        await this.loadMessages(conversationId);
    }

    async loadMessages(conversationId) {
        try {
            console.log('Loading messages for conversation:', conversationId);
            const response = await fetch(`${this.apiUrl}/conversations/${conversationId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to load messages`);
            
            const conversation = await response.json();
            console.log('Loaded messages:', conversation.messages.length);
            this.renderMessages(conversation.messages);
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showError(`Не удалось загрузить сообщения: ${error.message}`);
        }
    }

    renderMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        if (messages.length === 0) {
            chatMessages.innerHTML = '<div class="empty-state"><i class="bi bi-chat-dots"></i><p>Начните разговор</p></div>';
            return;
        }

        // Сортируем сообщения по времени создания (самые старые сверху, новые внизу)
        const sortedMessages = messages.sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
        });

        sortedMessages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });

        // Прокручиваем к последнему сообщению
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Проверяем, содержит ли текст HTML теги
        const containsHTML = message.text.includes('<') && message.text.includes('>');
        
        console.log('Message text_format:', message.text_format);
        console.log('Contains HTML:', containsHTML);
        console.log('Message text preview:', message.text.substring(0, 100));
        
        if (message.text_format === 'html' || containsHTML) {
            console.log('Processing as HTML');
            // Безопасная обработка HTML контента
            bubble.innerHTML = this.sanitizeHTML(message.text);
        } else {
            console.log('Processing as plain text');
            bubble.textContent = message.text;
        }

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date(message.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.appendChild(bubble);
        messageDiv.appendChild(time);

        // Добавляем метаданные если есть
        if (message.metadata) {
            const metadataDiv = this.createMetadataElement(message.metadata);
            messageDiv.appendChild(metadataDiv);
        }

        return messageDiv;
    }

    createMetadataElement(metadata) {
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'metadata-cards';

        // Обработка карточек
        if (metadata.cards) {
            metadata.cards.forEach(card => {
                const cardElement = this.createCardElement(card);
                metadataDiv.appendChild(cardElement);
            });
        }

        // Обработка навигационной карточки
        if (metadata.navigation_card) {
            const navCard = this.createNavigationCard(metadata.navigation_card);
            metadataDiv.appendChild(navCard);
        }

        // Обработка UI элементов
        if (metadata.options) {
            const optionsElement = this.createOptionsElement(metadata.options);
            metadataDiv.appendChild(optionsElement);
        }

        return metadataDiv;
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        let cardContent = '';
        
        if (card.title || card.subtitle) {
            cardContent += '<div class="card-header">';
            if (card.title) {
                cardContent += `<h6 class="card-title">${card.title}</h6>`;
            }
            if (card.subtitle) {
                cardContent += `<p class="card-subtitle">${card.subtitle}</p>`;
            }
            cardContent += '</div>';
        }

        if (card.options) {
            cardContent += '<div class="card-body">';
            cardContent += this.createOptionsHTML(card.options);
            cardContent += '</div>';
        }

        cardDiv.innerHTML = cardContent;
        return cardDiv;
    }

    createNavigationCard(navCard) {
        const navDiv = document.createElement('div');
        navDiv.className = 'navigation-card';

        let navContent = `
            <div class="navigation-title">${navCard.title}</div>
        `;

        if (navCard.description) {
            navContent += `<div class="navigation-description">${navCard.description}</div>`;
        }

        if (navCard.url) {
            navContent += `<a href="${navCard.url}" target="_blank" class="navigation-url">Открыть на карте</a>`;
        }

        if (navCard.buttons) {
            navContent += '<div class="ui-buttons">';
            navCard.buttons.forEach(button => {
                navContent += `<button class="ui-button" data-command="${button.command}">${button.text}</button>`;
            });
            navContent += '</div>';
        }

        navDiv.innerHTML = navContent;
        
        // Добавляем обработчики кнопок
        navDiv.querySelectorAll('.ui-button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeCommand(btn.dataset.command);
            });
        });

        return navDiv;
    }

    createOptionsElement(options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.innerHTML = this.createOptionsHTML(options);
        return optionsDiv;
    }

    createOptionsHTML(options) {
        let html = '';

        // Дропдаун
        if (options.dropdown) {
            html += '<select class="ui-dropdown" data-type="dropdown">';
            html += '<option value="">Выберите вариант...</option>';
            options.dropdown.forEach(option => {
                html += `<option value="${option.value}" data-command="${option.command}">${option.label}</option>`;
            });
            html += '</select>';
        }

        // Кнопки
        if (options.buttons) {
            html += '<div class="ui-buttons">';
            options.buttons.forEach(button => {
                html += `<button class="ui-button" data-command="${button.command}">${button.text}</button>`;
            });
            html += '</div>';
        }

        // Чеклист
        if (options.checklist) {
            html += '<div class="ui-checklist">';
            options.checklist.forEach((item, index) => {
                html += `
                    <div class="checklist-item">
                        <input type="checkbox" id="check_${index}" ${item.checked ? 'checked' : ''} data-command="${item.command}" data-value="${item.value}">
                        <label for="check_${index}">${item.label}</label>
                    </div>
                `;
            });
            html += '</div>';
        }

        return html;
    }

    executeCommand(command) {
        if (!command) return;
        
        // Отправляем команду как сообщение
        this.sendCommandMessage(command);
    }

    async sendCommandMessage(command) {
        if (!this.currentConversationId) return;

        const messageData = {
            role: 'user',
            text: command,
            text_format: 'plain', 
            conversation_id: this.currentConversationId
        };

        await this.sendMessageToAPI(messageData);
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        
        if (!text) return;
        if (!this.currentConversationId) {
            this.showError('Выберите чат или создайте новый');
            return;
        }

        input.value = '';
        input.disabled = true;
        document.getElementById('sendButton').disabled = true;

        const messageData = {
            role: 'user',
            text: text,
            text_format: 'plain',
            conversation_id: this.currentConversationId
        };

        await this.sendMessageToAPI(messageData);
    }

    async sendMessageToAPI(messageData) {
        this.showTyping(true);

        try {
            console.log('Sending message:', messageData);
            const response = await fetch(`${this.apiUrl}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });

            console.log('Send response status:', response.status);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to send message`);
            
            const result = await response.json();
            console.log('Send result:', result);
            
            // Перезагружаем сообщения
            await this.loadMessages(this.currentConversationId);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError(`Не удалось отправить сообщение: ${error.message}`);
        } finally {
            this.showTyping(false);
            document.getElementById('messageInput').disabled = false;
            document.getElementById('sendButton').disabled = false;
            document.getElementById('messageInput').focus();
        }
    }

    async createNewChat() {
        try {
            console.log('Creating new chat...');
            const response = await fetch(`${this.apiUrl}/conversations/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Create chat response status:', response.status);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to create chat`);
            
            const result = await response.json();
            console.log('New chat created:', result);
            
            // Создаем объект нового чата для локального списка
            const newConversation = {
                conversation_id: result.conversation_id,
                messages: [],
                created_at: result.created_at,
                llm_trace: null
            };
            
            // Добавляем в начало списка
            this.conversations.unshift(newConversation);
            this.renderConversations();
            
            // Переходим к новому чату
            this.selectConversation(result.conversation_id);
            
        } catch (error) {
            console.error('Error creating new chat:', error);
            this.showError(`Не удалось создать новый чат: ${error.message}`);
        }
    }

    filterChats(searchTerm) {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-title').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm.toLowerCase());
            item.style.display = isVisible ? 'block' : 'none';
        });
    }

    showTyping(show) {
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = show ? 'flex' : 'none';
    }

    async testAPI() {
        console.log('Testing API connection to:', `${this.apiUrl}/conversations/`);
        
        try {
            const response = await fetch(`${this.apiUrl}/conversations/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('API response:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API Test Success:', data.length, 'conversations found');
                alert(`✅ API работает! Найдено ${data.length} чатов.`);
            } else {
                const errorText = await response.text();
                console.error('API Test Failed:', response.status, response.statusText, errorText);
                alert(`❌ API не работает: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('API Test Error:', error);
            alert(`❌ Ошибка подключения к API: ${error.message}`);
        }
    }

    convertLinksToHTML(text) {
        // Регулярные выражения для поиска ссылок
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const urlInParensRegex = /\(([^)]*https?:\/\/[^)]+)\)/g;
        const urlRegex = /(?<!href="|href=')https?:\/\/[^\s<>\)]+/g;
        
        // Сначала обрабатываем markdown ссылки [text](url)
        text = text.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Обрабатываем URL в скобках (url)
        text = text.replace(urlInParensRegex, '(<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>)');
        
        // Затем обрабатываем обычные URL, но избегаем уже обработанные
        text = text.replace(urlRegex, '<a href="$&" target="_blank" rel="noopener noreferrer">$&</a>');
        
        return text;
    }

    sanitizeHTML(html) {
        try {
            // Сначала преобразуем ссылки в HTML
            html = this.convertLinksToHTML(html);
            
            // Создаем временный элемент для обработки HTML
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Удаляем потенциально опасные элементы
            const dangerousElements = temp.querySelectorAll('script, style, iframe, object, embed, form, input, button');
            dangerousElements.forEach(el => el.remove());
            
            // Обрабатываем все ссылки для безопасности
            const links = temp.querySelectorAll('a');
            links.forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                // Удаляем потенциально опасные атрибуты
                link.removeAttribute('onclick');
                link.removeAttribute('onload');
            });
            
            // Удаляем опасные атрибуты из всех элементов
            const allElements = temp.querySelectorAll('*');
            allElements.forEach(el => {
                // Удаляем все on* атрибуты (onclick, onload, etc.)
                Array.from(el.attributes).forEach(attr => {
                    if (attr.name.startsWith('on')) {
                        el.removeAttribute(attr.name);
                    }
                });
            });
            
            return temp.innerHTML;
        } catch (error) {
            console.error('Error sanitizing HTML:', error);
            // В случае ошибки возвращаем текст как есть
            return html;
        }
    }

    showError(message) {
        console.error('Error:', message);
        alert(message); // Простая реализация, можно улучшить
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});

// Обработка нажатий кнопок UI элементов
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('ui-button') && e.target.dataset.command) {
        const app = window.chatApp || new ChatApp();
        app.executeCommand(e.target.dataset.command);
    }
});

// Обработка дропдаунов
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('ui-dropdown') && e.target.dataset.type === 'dropdown') {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const command = selectedOption.dataset.command;
        if (command) {
            const app = window.chatApp || new ChatApp();
            app.executeCommand(command);
        }
    }
});

// Обработка чекбоксов
document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' && e.target.dataset.command) {
        const app = window.chatApp || new ChatApp();
        app.executeCommand(e.target.dataset.command);
    }
});
