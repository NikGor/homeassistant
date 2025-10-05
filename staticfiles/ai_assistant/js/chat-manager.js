// Chat management functionality
class ChatManager {
    static async loadChats(archieChat) {
        // For now, use local storage for chat management
        // In future versions, we can add server-side chat persistence
        console.log('Using local chats storage');
        
        if (archieChat.chats.length === 0) {
            ChatManager.createNewChat(archieChat);
        }
        
        ChatManager.renderChats(archieChat);
    }

    static renderChats(archieChat) {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        
        archieChat.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === archieChat.currentChatId ? 'active' : ''}`;
            chatItem.onclick = () => ChatManager.selectChat(archieChat, chat.id);
            
            chatItem.innerHTML = `
                <div class="chat-time">${new Date(chat.updated).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="chat-title">${chat.title}</div>
                <div class="chat-preview">${chat.preview || 'Новый чат'}</div>
            `;
            
            chatList.appendChild(chatItem);
        });
    }

    static async selectChat(archieChat, chatId) {
        archieChat.currentChatId = chatId;
        const chat = archieChat.chats.find(c => c.id === chatId);
        
        if (chat) {
            document.getElementById('currentChatTitle').textContent = chat.title;
            document.getElementById('messageInput').disabled = false;
            document.getElementById('sendButton').disabled = false;
            
            // Log chat selection
            archieChat.logger.logUserAction('select_chat', {
                chatId: chatId,
                chatTitle: chat.title,
                messageCount: chat.messages?.length || 0
            });
            
            // Load chat messages
            await ChatManager.loadChatMessages(archieChat, chatId);
        }
        
        ChatManager.renderChats(archieChat);
    }

    static async loadChatMessages(archieChat, chatId) {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
        
        // Load messages from local storage
        const chat = archieChat.chats.find(c => c.id === chatId);
        if (chat && chat.messages) {
            chat.messages.forEach(msg => {
                archieChat.addMessage(msg, msg.role, false); // false = don't update chat preview
            });
        }
    }

    static createNewChat(archieChat) {
        const chatId = 'chat_' + Date.now();
        const newChat = {
            id: chatId,
            title: 'Новый чат',
            preview: '',
            updated: new Date().toISOString(),
            messages: []
        };
        
        archieChat.chats.unshift(newChat);
        ChatManager.saveChats(archieChat);
        
        // Log new chat creation
        archieChat.logger.logUserAction('create_new_chat', {
            chatId: chatId,
            totalChats: archieChat.chats.length
        });
        
        ChatManager.selectChat(archieChat, chatId);
    }

    static updateChatPreview(archieChat, chatId, messageData, sender) {
        const chat = archieChat.chats.find(c => c.id === chatId);
        if (chat) {
            // Extract text content from structured message or use plain text
            let content;
            if (typeof messageData === 'object' && messageData.text) {
                content = messageData.text;
            } else {
                content = messageData;
            }
            
            // Remove HTML tags for preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const cleanText = tempDiv.textContent || tempDiv.innerText || '';
            
            chat.preview = cleanText.substring(0, 50) + (cleanText.length > 50 ? '...' : '');
            chat.updated = new Date().toISOString();
            
            if (chat.title === 'Новый чат' && sender === 'user') {
                chat.title = cleanText.substring(0, 30) + (cleanText.length > 30 ? '...' : '');
            }
            
            ChatManager.saveChats(archieChat);
            ChatManager.renderChats(archieChat);
        }
    }

    static filterChats(archieChat, query) {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-title').textContent.toLowerCase();
            const preview = item.querySelector('.chat-preview').textContent.toLowerCase();
            const matches = title.includes(query.toLowerCase()) || preview.includes(query.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    static saveChats(archieChat) {
        localStorage.setItem('archie_chats', JSON.stringify(archieChat.chats));
    }
}

// Add methods to ArchieChat prototype
ArchieChat.prototype.loadChats = function() {
    return ChatManager.loadChats(this);
};

ArchieChat.prototype.filterChats = function(query) {
    return ChatManager.filterChats(this, query);
};
