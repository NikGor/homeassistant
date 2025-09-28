// Модуль для управления списком чатов
class ConversationList {
    constructor() {
        this.chatList = document.getElementById('chatList');
        this.searchInput = document.getElementById('chatSearch');
        this.conversations = [];
        this.onSelectCallback = null;
    }

    setOnSelectCallback(callback) {
        this.onSelectCallback = callback;
    }

    updateConversations(conversations) {
        this.conversations = conversations;
        this.render();
    }

    addConversation(conversation) {
        this.conversations.unshift(conversation);
        this.render();
    }

    render() {
        this.chatList.innerHTML = '';

        this.conversations.forEach(conversation => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.conversationId = conversation.conversation_id;
            
            const date = new Date(conversation.created_at).toLocaleDateString('ru-RU', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });

            const title = conversation.title || `Чат ${conversation.conversation_id.split('-').pop()}`;
            
            chatItem.innerHTML = `
                <div class="chat-title">${title}</div>
                <div class="chat-date">${date}</div>
            `;

            chatItem.addEventListener('click', () => {
                this.selectConversation(conversation.conversation_id);
            });

            this.chatList.appendChild(chatItem);
        });
    }

    selectConversation(conversationId) {
        // Убираем активный класс
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });

        // Добавляем активный класс
        const selectedItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Вызываем callback
        if (this.onSelectCallback) {
            this.onSelectCallback(conversationId);
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
}
