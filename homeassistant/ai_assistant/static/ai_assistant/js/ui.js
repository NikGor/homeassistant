// UI модуль для отображения сообщений и карточек
class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
    }

    renderMessages(messages) {
        this.chatMessages.innerHTML = '';

        if (messages.length === 0) {
            this.chatMessages.innerHTML = '<div class="empty-state"><i class="bi bi-chat-dots"></i><p>Начните разговор</p></div>';
            return;
        }

        // Сортируем по времени
        const sortedMessages = messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        sortedMessages.forEach(message => {
            this.addMessage(message);
        });

        this.scrollToBottom();
    }

    addMessage(message) {
        // Убираем empty state
        const emptyState = this.chatMessages.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const messageElement = this.createMessageElement(message);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Обрабатываем HTML если есть
        if (message.text_format === 'html' || this.containsHTML(message.text)) {
            bubble.innerHTML = this.sanitizeHTML(message.text);
        } else {
            bubble.textContent = message.text;
        }

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date(message.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit', minute: '2-digit'
        });

        messageDiv.appendChild(bubble);
        messageDiv.appendChild(time);

        // Добавляем метаданные (кнопки, карточки)
        if (message.metadata) {
            const metadataDiv = this.createMetadataElement(message.metadata);
            messageDiv.appendChild(metadataDiv);
        }

        return messageDiv;
    }

    createMetadataElement(metadata) {
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'metadata-cards';

        // Карточки
        if (metadata.cards) {
            metadata.cards.forEach((card, index) => {
                const cardElement = this.createCard(card);
                // Задержка анимации для каждой карточки
                cardElement.style.animationDelay = `${index * 0.1}s`;
                metadataDiv.appendChild(cardElement);
            });
        }

        // Кнопки и другие UI элементы
        if (metadata.options) {
            const optionsElement = this.createOptions(metadata.options);
            metadataDiv.appendChild(optionsElement);
        }

        return metadataDiv;
    }

    createCard(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        let content = '';
        if (card.title) {
            content += `<div class="card-header"><h6 class="card-title">${card.title}</h6></div>`;
        }
        if (card.text) {
            content += `<div class="card-body"><div class="card-text">${this.sanitizeHTML(card.text)}</div></div>`;
        }

        cardDiv.innerHTML = content;

        // Добавляем метаданные карточки (кнопки, опции)
        if (card.options) {
            const cardOptionsElement = this.createOptions(card.options);
            cardDiv.appendChild(cardOptionsElement);
        }

        return cardDiv;
    }

    createOptions(options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.style.marginTop = '1rem';
        let html = '';

        // Кнопки
        if (options.buttons) {
            html += '<div class="ui-buttons">';
            options.buttons.forEach((button, index) => {
                html += `<button class="ui-button" data-command="${button.command}" style="animation-delay: ${index * 0.1}s">${button.text}</button>`;
            });
            html += '</div>';
        }

        // Чеклисты
        if (options.checklist) {
            html += '<div class="ui-checklist">';
            options.checklist.forEach((item, index) => {
                const checked = item.checked ? 'checked' : '';
                const checkedClass = item.checked ? 'checked' : '';
                html += `
                    <div class="checklist-item ${checkedClass}" data-command="${item.command}">
                        <input type="checkbox" id="check_${index}" ${checked} data-command="${item.command}">
                        <label for="check_${index}">${item.label}</label>
                    </div>
                `;
            });
            html += '</div>';
        }

        optionsDiv.innerHTML = html;
        
        // Добавляем обработчики для чеклистов
        optionsDiv.querySelectorAll('.checklist-item').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const itemDiv = item;
            
            // Обработчик клика по всему элементу
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    checkbox.checked = !checkbox.checked;
                }
                
                // Обновляем визуальное состояние
                if (checkbox.checked) {
                    itemDiv.classList.add('checked');
                } else {
                    itemDiv.classList.remove('checked');
                }
                
                // Можно добавить обработку команды
                const command = checkbox.getAttribute('data-command');
                console.log(`Checklist item toggled: ${command}, checked: ${checkbox.checked}`);
            });
            
            // Обработчик изменения чекбокса
            checkbox.addEventListener('change', (e) => {
                if (checkbox.checked) {
                    itemDiv.classList.add('checked');
                } else {
                    itemDiv.classList.remove('checked');
                }
            });
        });
        
        return optionsDiv;
    }

    showTyping(show) {
        this.typingIndicator.style.display = show ? 'flex' : 'none';
    }

    enableInput(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        if (enabled) this.messageInput.focus();
    }

    clearInput() {
        this.messageInput.value = '';
    }

    getInputValue() {
        return this.messageInput.value.trim();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    containsHTML(text) {
        return text.includes('<') && text.includes('>');
    }

    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Удаляем опасные элементы
        temp.querySelectorAll('script, style, iframe').forEach(el => el.remove());
        
        // Безопасные ссылки
        temp.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        return temp.innerHTML;
    }

    showError(message) {
        alert(`Ошибка: ${message}`);
    }
}
