// Global functions and utilities
class Utils {
    // Test API connection
    static async testConnection() {
        const statusDiv = document.getElementById('connectionStatus');
        const apiUrl = document.getElementById('apiUrl').value;
        const apiKey = document.getElementById('apiKey').value;
        
        statusDiv.innerHTML = '<div class="text-info"><i class="bi bi-hourglass-split"></i> Тестирование подключения...</div>';
        
        const startTime = performance.now();
        
        try {
            const testMessage = {
                message_id: 'test_' + Date.now(),
                role: 'user',
                text: 'Тест подключения',
                text_format: 'html'
            };

            const response = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
                },
                body: JSON.stringify(testMessage)
            });

            const responseTime = performance.now() - startTime;

            if (response.ok) {
                const data = await response.json();
                statusDiv.innerHTML = '<div class="text-success"><i class="bi bi-check-circle"></i> Подключение успешно! Ответ получен.</div>';
                
                // Log successful connection test
                if (window.archieChat && window.archieChat.logger) {
                    window.archieChat.logger.logConnectionTest(true, apiUrl, responseTime, response.status);
                }
            } else {
                statusDiv.innerHTML = `<div class="text-warning"><i class="bi bi-exclamation-triangle"></i> API отвечает с ошибкой: ${response.status}</div>`;
                
                // Log failed connection test
                if (window.archieChat && window.archieChat.logger) {
                    window.archieChat.logger.logConnectionTest(false, apiUrl, responseTime, response.status);
                }
            }
        } catch (error) {
            const responseTime = performance.now() - startTime;
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                statusDiv.innerHTML = `<div class="text-danger"><i class="bi bi-x-circle"></i> Не удается подключиться к ${apiUrl}. Проверьте, что сервис запущен.</div>`;
            } else {
                statusDiv.innerHTML = `<div class="text-danger"><i class="bi bi-x-circle"></i> Ошибка: ${error.message}</div>`;
            }
            
            // Log failed connection test
            if (window.archieChat && window.archieChat.logger) {
                window.archieChat.logger.logConnectionTest(false, apiUrl, responseTime);
            }
        }
    }

    // Save settings from modal
    static saveSettings() {
        window.archieChat.saveSettings();
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        modal.hide();
    }

    // Export chat data
    static exportChats() {
        const data = {
            chats: window.archieChat.chats,
            settings: {
                apiUrl: window.archieChat.apiUrl,
                assistantName: window.archieChat.assistantName
            },
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `archie_chats_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // Import chat data
    static importChats(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.chats && Array.isArray(data.chats)) {
                    window.archieChat.chats = data.chats;
                    ChatManager.saveChats(window.archieChat);
                    ChatManager.renderChats(window.archieChat);
                    alert('Чаты успешно импортированы!');
                } else {
                    throw new Error('Неверный формат файла');
                }
            } catch (error) {
                alert('Ошибка при импорте: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Clear all chats
    static clearAllChats() {
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            window.archieChat.chats = [];
            localStorage.removeItem('archie_chats');
            ChatManager.createNewChat(window.archieChat);
            alert('Все чаты были удалены.');
        }
    }

    // Format timestamp
    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;
        
        return date.toLocaleDateString('ru-RU');
    }

    // Generate unique ID
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Sanitize HTML content
    static sanitizeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Remove potentially dangerous elements
        const scripts = div.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        const links = div.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        return div.innerHTML;
    }

    // Debounce function for search
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Log management functions
    static showLogStats() {
        if (!window.archieChat || !window.archieChat.logger) {
            alert('Система логгирования не инициализирована');
            return;
        }

        const stats = window.archieChat.logger.getLogStats();
        const message = `
Статистика логов:
• Всего записей: ${stats.total}
• По уровням: ${Object.entries(stats.byLevel).map(([level, count]) => `${level}: ${count}`).join(', ')}
• По категориям: ${Object.entries(stats.byCategory).map(([cat, count]) => `${cat}: ${count}`).join(', ')}
• Период: ${stats.dateRange.oldest ? new Date(stats.dateRange.oldest).toLocaleString('ru-RU') : 'Нет данных'} - ${stats.dateRange.newest ? new Date(stats.dateRange.newest).toLocaleString('ru-RU') : 'Нет данных'}
        `;
        
        alert(message);
    }

    static exportLogs(format = 'json') {
        if (!window.archieChat || !window.archieChat.logger) {
            alert('Система логгирования не инициализирована');
            return;
        }

        window.archieChat.logger.exportLogs(format);
    }

    static clearLogs() {
        if (!window.archieChat || !window.archieChat.logger) {
            alert('Система логгирования не инициализирована');
            return;
        }

        if (confirm('Вы уверены, что хотите очистить все логи? Это действие нельзя отменить.')) {
            window.archieChat.logger.clearLogs();
            alert('Логи очищены');
        }
    }

    static setLogLevel(level) {
        if (!window.archieChat || !window.archieChat.logger) {
            alert('Система логгирования не инициализирована');
            return;
        }

        window.archieChat.logger.setLogLevel(level);
        alert(`Уровень логгирования установлен: ${level.toUpperCase()}`);
    }
}

// Legacy global functions for backward compatibility
function saveSettings() {
    Utils.saveSettings();
}

function testConnection() {
    Utils.testConnection();
}

// Log management global functions
function showLogStats() {
    Utils.showLogStats();
}

function exportLogs(format = 'json') {
    Utils.exportLogs(format);
}

function clearLogs() {
    Utils.clearLogs();
}

function setLogLevel(level) {
    Utils.setLogLevel(level);
}
