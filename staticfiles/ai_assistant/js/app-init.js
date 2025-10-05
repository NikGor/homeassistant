// Application initialization and startup
class ArchieApp {
    static init() {
        // Initialize chat when page loads
        document.addEventListener('DOMContentLoaded', () => {
            window.archieChat = new ArchieChat();
            
            // Set up event listeners for additional functionality
            ArchieApp.setupEventListeners();
            
            // Initialize tooltips if Bootstrap is available
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            }
            
            console.log('Archie Chat application initialized');
        });
    }

    static setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const messageInput = document.getElementById('messageInput');
                if (messageInput && !messageInput.disabled) {
                    window.archieChat.sendMessage();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modal => {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                });
            }
        });

        // Handle visibility change to manage resources
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, pause any background processes
                console.log('Page hidden, pausing background processes');
            } else {
                // Page is visible, resume processes
                console.log('Page visible, resuming processes');
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            console.log('Connection restored');
            // Optionally show a notification or retry failed requests
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost');
            // Optionally show offline indicator
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', Utils.debounce(() => {
            // Scroll to bottom if chat is open
            if (window.archieChat && window.archieChat.currentChatId) {
                const messagesContainer = document.getElementById('chatMessages');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
        }, 250));

        // Add custom context menu for chat messages (optional)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.message')) {
                e.preventDefault();
                // Could implement custom context menu here
            }
        });
    }

    // Error handling and logging
    static handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly error message
        const errorMessage = ArchieApp.getUserFriendlyErrorMessage(error);
        
        // Could send error to logging service here
        // ArchieApp.logError(error, context);
        
        return errorMessage;
    }

    static getUserFriendlyErrorMessage(error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Проблема с подключением к серверу. Проверьте интернет-соединение.';
        }
        
        if (error.message.includes('JSON')) {
            return 'Получен некорректный ответ от сервера.';
        }
        
        if (error.message.includes('Network')) {
            return 'Ошибка сети. Попробуйте позже.';
        }
        
        return 'Произошла неожиданная ошибка. Попробуйте обновить страницу.';
    }

    // Performance monitoring
    static measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    // Local storage management
    static getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            used: total,
            remaining: 5242880 - total, // 5MB typical limit
            percentage: (total / 5242880) * 100
        };
    }

    static cleanupOldData() {
        const usage = ArchieApp.getStorageUsage();
        if (usage.percentage > 80) {
            console.log('Storage usage high, cleaning up old data');
            // Could implement cleanup logic here
        }
    }
}

// Initialize the application
ArchieApp.init();
