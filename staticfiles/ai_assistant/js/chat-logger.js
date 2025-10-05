// Chat logging functionality
class ChatLogger {
    constructor() {
        this.logLevel = localStorage.getItem('archie_log_level') || 'info';
        this.enableConsoleLog = localStorage.getItem('archie_console_log') !== 'false';
        this.enableLocalStorage = localStorage.getItem('archie_local_storage_log') !== 'false';
        this.maxLogEntries = parseInt(localStorage.getItem('archie_max_log_entries')) || 1000;
        
        this.initLogger();
    }

    initLogger() {
        console.log(`[ChatLogger] Initialized with level: ${this.logLevel}, console: ${this.enableConsoleLog}, storage: ${this.enableLocalStorage}`);
    }

    // Main logging method
    log(level, category, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            category: category,
            message: message,
            data: data ? this.sanitizeData(data) : null,
            sessionId: this.getSessionId(),
            conversationId: window.archieChat?.currentChatId || null
        };

        // Console logging
        if (this.enableConsoleLog && this.shouldLog(level)) {
            this.logToConsole(logEntry);
        }

        // Local storage logging
        if (this.enableLocalStorage && this.shouldLog(level)) {
            this.logToStorage(logEntry);
        }

        return logEntry;
    }

    // Specific logging methods
    logOutgoingMessage(message, messageId, conversationId) {
        return this.log('info', 'MESSAGE_OUT', 'Sending message to API', {
            messageId: messageId,
            conversationId: conversationId,
            messageLength: message.length,
            messagePreview: this.truncateText(message, 100),
            apiUrl: window.archieChat?.apiUrl || 'unknown'
        });
    }

    logIncomingMessage(response, messageId, conversationId) {
        return this.log('info', 'MESSAGE_IN', 'Received response from API', {
            messageId: messageId,
            conversationId: conversationId,
            responseLength: response.text?.length || 0,
            responsePreview: this.truncateText(response.text || '', 100),
            hasMetadata: !!response.metadata,
            hasCards: !!(response.metadata?.cards?.length),
            hasUIElements: !!(response.metadata?.options)
        });
    }

    logApiError(error, messageId, conversationId, apiUrl) {
        return this.log('error', 'API_ERROR', 'API request failed', {
            messageId: messageId,
            conversationId: conversationId,
            apiUrl: apiUrl,
            errorType: error.name,
            errorMessage: error.message,
            errorStack: error.stack?.substring(0, 500)
        });
    }

    logConnectionTest(success, apiUrl, responseTime, statusCode = null) {
        const level = success ? 'info' : 'warn';
        const message = success ? 'Connection test successful' : 'Connection test failed';
        
        return this.log(level, 'CONNECTION_TEST', message, {
            apiUrl: apiUrl,
            success: success,
            responseTime: responseTime,
            statusCode: statusCode,
            timestamp: Date.now()
        });
    }

    logUserAction(action, details = null) {
        return this.log('debug', 'USER_ACTION', `User performed action: ${action}`, {
            action: action,
            details: details,
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100)
        });
    }

    logSystemEvent(event, details = null) {
        return this.log('info', 'SYSTEM_EVENT', event, details);
    }

    logPerformance(operation, duration, details = null) {
        return this.log('debug', 'PERFORMANCE', `${operation} took ${duration}ms`, {
            operation: operation,
            duration: duration,
            details: details
        });
    }

    // Utility methods
    shouldLog(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        return levels[level.toLowerCase()] >= levels[this.logLevel.toLowerCase()];
    }

    logToConsole(logEntry) {
        const prefix = `[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.category}]`;
        const style = this.getConsoleStyle(logEntry.level);
        
        if (logEntry.data) {
            console.groupCollapsed(`%c${prefix} ${logEntry.message}`, style);
            console.log('Data:', logEntry.data);
            console.groupEnd();
        } else {
            console.log(`%c${prefix} ${logEntry.message}`, style);
        }
    }

    logToStorage(logEntry) {
        try {
            const logs = this.getStoredLogs();
            logs.push(logEntry);
            
            // Keep only recent entries
            if (logs.length > this.maxLogEntries) {
                logs.splice(0, logs.length - this.maxLogEntries);
            }
            
            localStorage.setItem('archie_chat_logs', JSON.stringify(logs));
        } catch (error) {
            console.warn('[ChatLogger] Failed to store log entry:', error);
        }
    }

    getStoredLogs() {
        try {
            const stored = localStorage.getItem('archie_chat_logs');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('[ChatLogger] Failed to retrieve stored logs:', error);
            return [];
        }
    }

    getConsoleStyle(level) {
        const styles = {
            DEBUG: 'color: #666; font-size: 11px;',
            INFO: 'color: #0066cc; font-weight: bold;',
            WARN: 'color: #ff8800; font-weight: bold;',
            ERROR: 'color: #cc0000; font-weight: bold; background: #ffe6e6;'
        };
        return styles[level] || styles.INFO;
    }

    sanitizeData(data) {
        if (!data) return null;
        
        // Remove sensitive information
        const sanitized = JSON.parse(JSON.stringify(data));
        
        // Remove API keys, passwords, etc.
        const sensitiveKeys = ['apiKey', 'password', 'token', 'secret', 'key'];
        
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return obj;
            
            for (const key in obj) {
                if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                    obj[key] = '[REDACTED]';
                } else if (typeof obj[key] === 'object') {
                    sanitizeObject(obj[key]);
                }
            }
            return obj;
        };
        
        return sanitizeObject(sanitized);
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('archie_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('archie_session_id', sessionId);
        }
        return sessionId;
    }

    // Export logs
    exportLogs(format = 'json') {
        const logs = this.getStoredLogs();
        const timestamp = new Date().toISOString().split('T')[0];
        
        let content, mimeType, filename;
        
        if (format === 'json') {
            content = JSON.stringify(logs, null, 2);
            mimeType = 'application/json';
            filename = `archie_logs_${timestamp}.json`;
        } else if (format === 'csv') {
            content = this.logsToCSV(logs);
            mimeType = 'text/csv';
            filename = `archie_logs_${timestamp}.csv`;
        } else if (format === 'txt') {
            content = this.logsToText(logs);
            mimeType = 'text/plain';
            filename = `archie_logs_${timestamp}.txt`;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.log('info', 'EXPORT', `Logs exported as ${format.toUpperCase()}`, {
            format: format,
            filename: filename,
            entryCount: logs.length
        });
    }

    logsToCSV(logs) {
        if (logs.length === 0) return 'No logs available';
        
        const headers = ['timestamp', 'level', 'category', 'message', 'conversationId', 'sessionId'];
        const csvRows = [headers.join(',')];
        
        logs.forEach(log => {
            const row = headers.map(header => {
                let value = log[header] || '';
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    logsToText(logs) {
        if (logs.length === 0) return 'No logs available';
        
        return logs.map(log => {
            let text = `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}`;
            if (log.conversationId) text += ` (Chat: ${log.conversationId})`;
            if (log.data) text += `\n  Data: ${JSON.stringify(log.data)}`;
            return text;
        }).join('\n\n');
    }

    // Clear logs
    clearLogs() {
        localStorage.removeItem('archie_chat_logs');
        this.log('info', 'SYSTEM', 'Chat logs cleared');
    }

    // Get log statistics
    getLogStats() {
        const logs = this.getStoredLogs();
        const stats = {
            total: logs.length,
            byLevel: {},
            byCategory: {},
            dateRange: {
                oldest: null,
                newest: null
            }
        };
        
        logs.forEach(log => {
            // Count by level
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            
            // Count by category
            stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
            
            // Date range
            const logDate = new Date(log.timestamp);
            if (!stats.dateRange.oldest || logDate < new Date(stats.dateRange.oldest)) {
                stats.dateRange.oldest = log.timestamp;
            }
            if (!stats.dateRange.newest || logDate > new Date(stats.dateRange.newest)) {
                stats.dateRange.newest = log.timestamp;
            }
        });
        
        return stats;
    }

    // Configure logging
    setLogLevel(level) {
        if (['debug', 'info', 'warn', 'error'].includes(level.toLowerCase())) {
            this.logLevel = level.toLowerCase();
            localStorage.setItem('archie_log_level', this.logLevel);
            this.log('info', 'CONFIG', `Log level changed to: ${this.logLevel}`);
        }
    }

    setConsoleLogging(enabled) {
        this.enableConsoleLog = enabled;
        localStorage.setItem('archie_console_log', enabled.toString());
        this.log('info', 'CONFIG', `Console logging ${enabled ? 'enabled' : 'disabled'}`);
    }

    setStorageLogging(enabled) {
        this.enableLocalStorage = enabled;
        localStorage.setItem('archie_local_storage_log', enabled.toString());
        this.log('info', 'CONFIG', `Storage logging ${enabled ? 'enabled' : 'disabled'}`);
    }
}
