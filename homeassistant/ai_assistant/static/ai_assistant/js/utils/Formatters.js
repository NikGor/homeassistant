/**
 * Formatters - общие функции форматирования
 */

/**
 * Форматировать температуру
 * @param {number} temp - Температура в градусах Цельсия
 * @returns {string} Отформатированная температура (например: "15°C")
 */
export const formatTemperature = (temp) => {
    if (typeof temp !== 'number') return 'N/A';
    return `${Math.round(temp)}°C`;
};

/**
 * Форматировать время из ISO строки или объекта Date
 * @param {string|Date} dateInput - ISO строка или объект Date
 * @returns {string} Отформатированное время (HH:MM)
 */
export const formatTime = (dateInput) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

/**
 * Форматировать дату
 * @param {string|Date} dateInput - ISO строка или объект Date
 * @returns {string} Отформатированная дата (ДД.ММ.ГГГГ)
 */
export const formatDate = (dateInput) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('ru-RU');
};

/**
 * Форматировать полную дату и время
 * @param {string|Date} dateInput - ISO строка или объект Date
 * @returns {string} Отформатированная дата и время
 */
export const formatDateTime = (dateInput) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Обрезать текст до указанной длины
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанный текст с многоточием
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Скопировать текст в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} true если копирование успешно
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy text:', error);
        return false;
    }
};

/**
 * Форматировать число с разделителями тысяч
 * @param {number} num - Число
 * @returns {string} Отформатированное число
 */
export const formatNumber = (num) => {
    if (typeof num !== 'number') return 'N/A';
    return num.toLocaleString('ru-RU');
};

/**
 * Форматировать процент
 * @param {number} value - Значение (0-100)
 * @returns {string} Отформатированный процент
 */
export const formatPercentage = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return `${Math.round(value)}%`;
};

/**
 * Экранировать HTML в строке
 * @param {string} html - HTML строка
 * @returns {string} Экранированная строка
 */
export const escapeHtml = (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * Генерировать уникальный ID
 * @param {string} prefix - Префикс для ID
 * @returns {string} Уникальный ID
 */
export const generateId = (prefix = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
