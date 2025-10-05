// Message rendering and UI handling
class MessageRenderer {
    static addMessage(archieChat, messageData, sender, updatePreview = true) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        // Handle structured message data or plain text
        let content, metadata;
        if (typeof messageData === 'object' && messageData.text) {
            content = messageData.text;
            metadata = messageData.metadata;
        } else {
            content = messageData;
            metadata = null;
        }
        
        // Render main message content
        if (MessageRenderer.isHTMLContent(content)) {
            messageDiv.innerHTML = `
                <div class="message-content">${content}</div>
                <div class="message-time">${timeString}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${MessageRenderer.escapeHtml(content)}</div>
                <div class="message-time">${timeString}</div>
            `;
        }

        // Handle metadata UI elements
        if (metadata && metadata.options) {
            UIElementsRenderer.renderUIElements(messageDiv, metadata.options, archieChat);
        }

        // Handle cards
        if (metadata && metadata.cards) {
            metadata.cards.forEach(card => {
                CardRenderer.renderCard(messageDiv, card);
            });
        }

        // Handle navigation card
        if (metadata && metadata.navigation_card) {
            CardRenderer.renderNavigationCard(messageDiv, metadata.navigation_card);
        }

        // Handle tool cards
        if (metadata && metadata.tool_cards) {
            metadata.tool_cards.forEach(toolCard => {
                CardRenderer.renderToolCard(messageDiv, toolCard);
            });
        }

        // Legacy button pattern support
        const buttonPattern = /\[button:([^\]]+):([^\]]+)\]/g;
        let match;
        let hasButtons = false;
        const buttons = [];

        while ((match = buttonPattern.exec(content)) !== null) {
            hasButtons = true;
            buttons.push({ text: match[1], action: match[2] });
        }

        if (hasButtons) {
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'message-buttons';
            
            buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = 'message-btn';
                btn.textContent = button.text;
                btn.onclick = () => MessageRenderer.handleButtonClick(archieChat, button.action);
                buttonsDiv.appendChild(btn);
            });
            
            messageDiv.appendChild(buttonsDiv);
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store message in local storage
        if (updatePreview && archieChat.currentChatId) {
            const chat = archieChat.chats.find(c => c.id === archieChat.currentChatId);
            if (chat) {
                if (!chat.messages) chat.messages = [];
                chat.messages.push(messageData);
                ChatManager.saveChats(archieChat);
            }
        }
        
        // Update chat preview
        if (updatePreview) {
            ChatManager.updateChatPreview(archieChat, archieChat.currentChatId, messageData, sender);
        }
    }

    static isHTMLContent(content) {
        return content.includes('<') && content.includes('>') && 
               (content.includes('<div') || content.includes('<p') || content.includes('<h') || 
                content.includes('<card') || content.includes('<button'));
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static handleButtonClick(archieChat, action) {
        if (action.startsWith('send:')) {
            const message = action.substring(5);
            archieChat.sendMessage(message);
        } else if (action.startsWith('url:')) {
            const url = action.substring(4);
            window.open(url, '_blank');
        } else {
            // Custom action - send to API
            archieChat.sendMessage(`[action:${action}]`);
        }
    }
}

// Add the addMessage method to ArchieChat class
ArchieChat.prototype.addMessage = function(messageData, sender, updatePreview = true) {
    MessageRenderer.addMessage(this, messageData, sender, updatePreview);
};
