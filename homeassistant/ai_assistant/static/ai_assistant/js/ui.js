// UI модуль для отображения сообщений и карточек
class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // Инициализируем кнопку вставки
        this.initializePasteButton();
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

        // Добавляем иконку копирования для сообщения
        const copyIcon = document.createElement('button');
        copyIcon.className = 'copy-icon';
        copyIcon.innerHTML = '<i class="bi bi-copy"></i>';
        copyIcon.title = 'Копировать текст';
        
        copyIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyTextToClipboard(message.text);
        });
        
        bubble.appendChild(copyIcon);

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

        // Кнопки сообщения (сначала)
        let messageButtons = null;
        if (metadata.options && metadata.options.buttons) {
            messageButtons = this.createMessageButtons(metadata.options.buttons);
            metadataDiv.appendChild(messageButtons);
        }

        // Контейнер для карточек
        if (metadata.cards) {
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'cards-container';
            
            metadata.cards.forEach((card, index) => {
                const cardElement = this.createCard(card);
                // Задержка анимации для каждой карточки
                cardElement.style.animationDelay = `${index * 0.1}s`;
                cardsContainer.appendChild(cardElement);
            });
            
            metadataDiv.appendChild(cardsContainer);
        }

        // Остальные UI элементы (чеклисты, дропдауны)
        if (metadata.options && (metadata.options.checklist || metadata.options.dropdown)) {
            const optionsElement = this.createOptions(metadata.options);
            metadataDiv.appendChild(optionsElement);
        }

        // Навигационная карточка
        if (metadata.navigation_card) {
            const navigationElement = this.createNavigationCard(metadata.navigation_card);
            metadataDiv.appendChild(navigationElement);
        }

        // Таблица
        if (metadata.table) {
            const tableElement = this.createTable(metadata.table);
            metadataDiv.appendChild(tableElement);
        }

        // Контактная карточка
        if (metadata.contact_card) {
            const contactElement = this.createContactCard(metadata.contact_card);
            metadataDiv.appendChild(contactElement);
        }

        // Элементы (разные значения)
        if (metadata.elements) {
            const elementsElement = this.createElements(metadata.elements);
            metadataDiv.appendChild(elementsElement);
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
        
        // Основное содержимое карточки
        if (card.text) {
            content += `<div class="card-body"><div class="card-text">${this.sanitizeHTML(card.text)}</div>`;
            
            // Кнопки карточки внутри card-body
            if (card.options && card.options.buttons) {
                content += '<div class="ui-buttons" style="margin-top: 1rem;">';
                card.options.buttons.forEach((button, index) => {
                    content += `<button class="ui-button" data-command="${button.command}" style="animation-delay: ${index * 0.1}s">${button.text}</button>`;
                });
                content += '</div>';
            }
            
            content += '</div>';
        }

        cardDiv.innerHTML = content;

        // Добавляем иконку контекста
        const contextIcon = document.createElement('button');
        contextIcon.className = 'context-icon';
        contextIcon.innerHTML = '<i class="bi bi-plus-circle"></i>';
        contextIcon.title = '+ контекст';
        
        // Обработчик для иконки контекста
        contextIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleContextAction(card);
        });
        
        cardDiv.appendChild(contextIcon);

        // Добавляем иконку копирования для карточки
        const cardCopyIcon = document.createElement('button');
        cardCopyIcon.className = 'copy-icon';
        cardCopyIcon.innerHTML = '<i class="bi bi-copy"></i>';
        cardCopyIcon.title = 'Копировать текст карточки';
        
        cardCopyIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const cardText = this.extractCardText(card);
            this.copyTextToClipboard(cardText);
        });
        
        cardDiv.appendChild(cardCopyIcon);

        // Добавляем обработчики для кнопок карточки
        cardDiv.querySelectorAll('.ui-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const command = button.getAttribute('data-command');
                console.log(`Card button clicked: ${command}`);
                // Здесь можно добавить логику отправки команды
            });
        });

        // Добавляем остальные метаданные карточки (чеклисты, дропдауны)
        if (card.options && (card.options.checklist || card.options.dropdown)) {
            const cardOptionsElement = this.createOptions(card.options);
            cardDiv.appendChild(cardOptionsElement);
        }

        return cardDiv;
    }

    createMessageButtons(buttons) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'message-buttons';
        
        let html = '<div class="ui-buttons">';
        buttons.forEach((button, index) => {
            html += `<button class="ui-button" data-command="${button.command}" style="animation-delay: ${index * 0.1}s">${button.text}</button>`;
        });
        html += '</div>';
        
        buttonsDiv.innerHTML = html;
        return buttonsDiv;
    }

    createOptions(options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.style.marginTop = '1rem';
        let html = '';

        // Не создаем кнопки здесь - они создаются отдельно в createMessageButtons

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

        // Дропдауны
        if (options.dropdown) {
            html += '<div class="ui-dropdown-container">';
            html += '<select class="ui-dropdown">';
            html += '<option value="" disabled selected>Выберите вариант...</option>';
            options.dropdown.forEach(option => {
                html += `<option value="${option.command}" data-command="${option.command}">${option.label}</option>`;
            });
            html += '</select>';
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

        // Добавляем обработчики для выпадающих списков
        optionsDiv.querySelectorAll('.ui-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                const selectedOption = e.target.options[e.target.selectedIndex];
                const command = selectedOption.getAttribute('data-command') || selectedValue;
                
                if (command && command !== '') {
                    console.log(`Dropdown selected: ${command}`);
                    // Здесь можно добавить логику отправки команды на сервер
                    // Например: sendCommand(command);
                }
            });
        });
        
        return optionsDiv;
    }

    createNavigationCard(navigationCard) {
        const navDiv = document.createElement('div');
        navDiv.className = 'navigation-card';
        
        let html = `
            <div class="navigation-title">${navigationCard.title}</div>
            <div class="navigation-description">${navigationCard.description}</div>
        `;
        
        if (navigationCard.buttons) {
            html += '<div class="navigation-buttons">';
            navigationCard.buttons.forEach(button => {
                html += `<button class="navigation-button" data-url="${navigationCard.url}" data-command="${button.command}">${button.text}</button>`;
            });
            html += '</div>';
        }
        
        navDiv.innerHTML = html;
        
        // Добавляем обработчики для навигационных кнопок
        navDiv.querySelectorAll('.navigation-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const url = button.getAttribute('data-url');
                const command = button.getAttribute('data-command');
                
                if (command === 'show_on_map') {
                    // Просто открываем карту
                    window.open(url, '_blank');
                } else if (command === 'route') {
                    // Открываем карту с построением маршрута
                    window.open(url, '_blank');
                }
            });
        });
        
        return navDiv;
    }

    createTable(table) {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table-container';
        
        let html = '<div class="table-wrapper"><table class="data-table">';
        
        // Заголовки таблицы
        if (table.headers && table.headers.length > 0) {
            html += '<thead><tr>';
            table.headers.forEach(header => {
                html += `<th>${this.sanitizeHTML(header)}</th>`;
            });
            html += '</tr></thead>';
        }
        
        // Строки таблицы
        if (table.rows && table.rows.length > 0) {
            html += '<tbody>';
            table.rows.forEach(row => {
                html += '<tr>';
                row.forEach(cell => {
                    // Обрабатываем как объект с content или как строку
                    const cellContent = typeof cell === 'object' && cell.content ? cell.content : cell;
                    html += `<td>${this.sanitizeHTML(cellContent)}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';
        }
        
        html += '</table></div>';
        
        tableDiv.innerHTML = html;
        
        // Добавляем иконку копирования для таблицы
        const tableCopyIcon = document.createElement('button');
        tableCopyIcon.className = 'copy-icon table-copy';
        tableCopyIcon.innerHTML = '<i class="bi bi-copy"></i>';
        tableCopyIcon.title = 'Копировать таблицу как текст';
        
        tableCopyIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const tableText = this.extractTableText(table);
            this.copyTextToClipboard(tableText);
        });
        
        tableDiv.appendChild(tableCopyIcon);
        
        return tableDiv;
    }

    extractTableText(table) {
        let text = '';
        
        // Добавляем заголовки
        if (table.headers && table.headers.length > 0) {
            text += table.headers.join('\t') + '\n';
            text += table.headers.map(() => '---').join('\t') + '\n';
        }
        
        // Добавляем строки
        if (table.rows && table.rows.length > 0) {
            table.rows.forEach(row => {
                const rowData = row.map(cell => {
                    // Обрабатываем как объект с content или как строку
                    const cellContent = typeof cell === 'object' && cell.content ? cell.content : cell;
                    // Удаляем HTML теги для получения чистого текста
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = cellContent;
                    return (tempDiv.textContent || tempDiv.innerText || cellContent).replace(/\t/g, ' ');
                });
                text += rowData.join('\t') + '\n';
            });
        }
        
        return text.trim();
    }

    createContactCard(contactCard) {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-card';
        
        let html = `
            <div class="contact-header">
                <i class="bi bi-person-circle contact-icon"></i>
                <div class="contact-info">
                    <h6 class="contact-name">${this.sanitizeHTML(contactCard.name)}</h6>
                    <div class="contact-details">
        `;
        
        if (contactCard.phone) {
            html += `<div class="contact-detail"><i class="bi bi-telephone"></i> ${this.sanitizeHTML(contactCard.phone)}</div>`;
        }
        
        if (contactCard.email) {
            html += `<div class="contact-detail"><i class="bi bi-envelope"></i> ${this.sanitizeHTML(contactCard.email)}</div>`;
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        // Кнопки контактной карточки
        if (contactCard.buttons && contactCard.buttons.length > 0) {
            html += '<div class="contact-buttons">';
            contactCard.buttons.forEach((button, index) => {
                html += `<button class="contact-button" data-command="${button.command}" data-phone="${contactCard.phone}" data-email="${contactCard.email}" style="animation-delay: ${index * 0.1}s">${button.text}</button>`;
            });
            html += '</div>';
        }
        
        contactDiv.innerHTML = html;
        
        // Добавляем обработчики для кнопок контактной карточки
        contactDiv.querySelectorAll('.contact-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const command = button.getAttribute('data-command');
                const phone = button.getAttribute('data-phone');
                const email = button.getAttribute('data-email');
                
                this.handleContactAction(command, phone, email);
            });
        });
        
        // Добавляем иконку копирования для контактной карточки
        const contactCopyIcon = document.createElement('button');
        contactCopyIcon.className = 'copy-icon contact-copy';
        contactCopyIcon.innerHTML = '<i class="bi bi-copy"></i>';
        contactCopyIcon.title = 'Копировать контактную информацию';
        
        contactCopyIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const contactText = this.extractContactText(contactCard);
            this.copyTextToClipboard(contactText);
        });
        
        contactDiv.appendChild(contactCopyIcon);
        
        return contactDiv;
    }

    handleContactAction(command, phone, email) {
        switch (command) {
            case 'call':
                if (phone) {
                    // Удаляем все нецифровые символы кроме +
                    const cleanPhone = phone.replace(/[^\d+]/g, '');
                    window.open(`tel:${cleanPhone}`, '_self');
                }
                break;
            case 'email':
                if (email) {
                    window.open(`mailto:${email}`, '_self');
                }
                break;
            default:
                console.log(`Contact action: ${command}`);
        }
    }

    extractContactText(contactCard) {
        let text = '';
        
        if (contactCard.name) {
            text += contactCard.name + '\n';
        }
        
        if (contactCard.phone) {
            text += `📞 ${contactCard.phone}\n`;
        }
        
        if (contactCard.email) {
            text += `✉️ ${contactCard.email}\n`;
        }
        
        return text.trim();
    }

    createElements(elements) {
        const elementsDiv = document.createElement('div');
        elementsDiv.className = 'elements-container';
        
        const needsScroll = elements.items && elements.items.length > 3;
        
        let html = `
            <div class="elements-wrapper ${needsScroll ? 'scrollable' : ''}">
                <table class="elements-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Значение</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (elements.items && elements.items.length > 0) {
            elements.items.forEach((item, index) => {
                html += `
                    <tr class="elements-row" style="animation-delay: ${index * 0.1}s">
                        <td class="elements-title">${this.sanitizeHTML(item.title)}</td>
                        <td class="elements-value">${this.sanitizeHTML(item.value)}</td>
                        <td class="elements-actions">
                            <button class="copy-value-btn" data-value="${this.sanitizeHTML(item.value)}" title="Копировать значение">
                                <i class="bi bi-copy"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        elementsDiv.innerHTML = html;
        
        // Добавляем обработчики для кнопок копирования значений
        elementsDiv.querySelectorAll('.copy-value-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = button.getAttribute('data-value');
                this.copyTextToClipboard(value);
            });
        });
        
        return elementsDiv;
    }

    handleContextAction(card) {
        // Заглушка для действия с контекстом
        console.log('Context action clicked for card:', card);
        
        // Показываем информацию о карточке (временная заглушка)
        const cardInfo = {
            title: card.title || 'Без заголовка',
            text: card.text ? card.text.substring(0, 100) + '...' : 'Без текста',
            hasButtons: !!(card.options && card.options.buttons),
            hasChecklist: !!(card.options && card.options.checklist),
            hasDropdown: !!(card.options && card.options.dropdown)
        };
        
        // Временное уведомление (в будущем здесь будет реальная логика)
        alert(`Контекст карточки:\n\nЗаголовок: ${cardInfo.title}\nТекст: ${cardInfo.text}\nКнопки: ${cardInfo.hasButtons ? 'Есть' : 'Нет'}\nЧеклист: ${cardInfo.hasChecklist ? 'Есть' : 'Нет'}\nВыпадающий список: ${cardInfo.hasDropdown ? 'Есть' : 'Нет'}`);
        
        // TODO: Здесь будет реальная логика для работы с контекстом
        // Например:
        // - Отправка контекста карточки на сервер
        // - Добавление в историю контекстов
        // - Показ модального окна с деталями
        // - Копирование в буфер обмена
    }

    extractCardText(card) {
        let text = '';
        if (card.title) {
            text += card.title + '\n\n';
        }
        if (card.text) {
            // Удаляем HTML теги для получения чистого текста
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = card.text;
            text += tempDiv.textContent || tempDiv.innerText || '';
        }
        return text.trim();
    }

    async copyTextToClipboard(text) {
        try {
            // Удаляем HTML теги если они есть
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            const cleanText = tempDiv.textContent || tempDiv.innerText || text;
            
            await navigator.clipboard.writeText(cleanText);
            
            // Сохраняем в локальное хранилище как резерв
            localStorage.setItem('copiedText', cleanText);
            
            // Показываем уведомление
            this.showCopyNotification();
            
            // Активируем кнопку вставки
            this.enablePasteButton();
            
        } catch (err) {
            console.error('Ошибка копирования в буфер обмена:', err);
            // Фолбэк: сохраняем в localStorage
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            const cleanText = tempDiv.textContent || tempDiv.innerText || text;
            localStorage.setItem('copiedText', cleanText);
            this.enablePasteButton();
        }
    }

    showCopyNotification() {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = 'Текст скопирован!';
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => notification.style.opacity = '1', 10);
        
        // Удаление через 2 секунды
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }

    enablePasteButton() {
        const pasteButton = document.getElementById('pasteButton');
        if (pasteButton) {
            pasteButton.disabled = false;
        }
    }

    initializePasteButton() {
        const pasteButton = document.getElementById('pasteButton');
        const messageInput = document.getElementById('messageInput');
        
        if (pasteButton && messageInput) {
            pasteButton.addEventListener('click', () => {
                this.pasteAsQuote();
            });
            
            // Проверяем есть ли сохраненный текст при загрузке
            const savedText = localStorage.getItem('copiedText');
            if (savedText) {
                this.enablePasteButton();
            }
        }
    }

    async pasteAsQuote() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;
        
        try {
            let textToPaste = '';
            
            // Пытаемся получить из буфера обмена
            try {
                textToPaste = await navigator.clipboard.readText();
            } catch (err) {
                // Фолбэк: берем из localStorage
                textToPaste = localStorage.getItem('copiedText') || '';
            }
            
            if (textToPaste) {
                // Форматируем как цитату
                const quotedText = this.formatAsQuote(textToPaste);
                
                // Вставляем в поле ввода
                const currentValue = messageInput.value;
                const newValue = currentValue ? currentValue + '\n\n' + quotedText : quotedText;
                messageInput.value = newValue;
                
                // Фокусируемся на поле ввода
                messageInput.focus();
                
                // Перемещаем курсор в конец
                messageInput.setSelectionRange(newValue.length, newValue.length);
            }
        } catch (err) {
            console.error('Ошибка вставки:', err);
        }
    }

    formatAsQuote(text) {
        // Разбиваем текст на строки и добавляем > в начало каждой
        return text.split('\n')
            .map(line => `> ${line}`)
            .join('\n');
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
