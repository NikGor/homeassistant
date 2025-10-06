/**
 * WeatherUtils - вспомогательные функции для работы с погодными данными
 */

import { SunIcon, CloudIcon, RainIcon, SnowIcon } from '../components/WeatherIcons.js';

/**
 * Получить иконку погоды по состоянию
 * @param {Object} condition - Объект с описанием погодных условий
 * @returns {ReactElement} React компонент иконки
 */
export const getWeatherIcon = (condition) => {
    if (!condition?.main) return React.createElement(CloudIcon);
    
    switch (condition.main.toLowerCase()) {
        case 'clear': return React.createElement(SunIcon);
        case 'clouds': return React.createElement(CloudIcon);
        case 'rain':
        case 'drizzle': return React.createElement(RainIcon);
        case 'snow': return React.createElement(SnowIcon);
        case 'thunderstorm': return React.createElement(RainIcon);
        default: return React.createElement(CloudIcon);
    }
};

/**
 * Получить направление ветра в текстовом виде
 * @param {number} degrees - Направление в градусах (0-360)
 * @returns {string} Направление ветра (С, СВ, В, ЮВ, и т.д.)
 */
export const getWindDirection = (degrees) => {
    if (typeof degrees !== 'number' || degrees < 0 || degrees > 360) {
        return '';
    }
    
    const directions = [
        'С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ', 
        'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'
    ];
    return directions[Math.round(degrees / 22.5) % 16];
};

/**
 * Конвертировать м/с в км/ч
 * @param {number} mps - Скорость в м/с
 * @returns {number} Скорость в км/ч (округленная)
 */
export const convertMpsToKmh = (mps) => {
    return Math.round(mps * 3.6);
};

/**
 * Конвертировать метры в километры
 * @param {number} meters - Расстояние в метрах
 * @returns {number} Расстояние в километрах (округленное)
 */
export const convertMetersToKm = (meters) => {
    return Math.round(meters / 1000);
};

/**
 * Получить категорию UV индекса
 * @param {number} uvIndex - UV индекс
 * @returns {Object} Объект с категорией и цветом
 */
export const getUVCategory = (uvIndex) => {
    if (uvIndex <= 2) return { category: 'low', color: 'green' };
    if (uvIndex <= 5) return { category: 'moderate', color: 'yellow' };
    if (uvIndex <= 7) return { category: 'high', color: 'orange' };
    if (uvIndex <= 10) return { category: 'very_high', color: 'red' };
    return { category: 'extreme', color: 'violet' };
};

/**
 * Получить CSS класс для тренда давления
 * @param {string} trend - Тренд ('rising', 'steady', 'falling')
 * @returns {string} CSS класс с иконкой
 */
export const getPressureTrendIcon = (trend) => {
    switch (trend) {
        case 'rising': return '↗️';
        case 'falling': return '↘️';
        case 'steady': 
        default: return '→';
    }
};

/**
 * Форматировать время из ISO строки
 * @param {string} isoString - ISO строка времени
 * @returns {string} Отформатированное время (HH:MM)
 */
export const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

/**
 * Получить emoji для типа осадков
 * @param {string} precipitationType - Тип осадков
 * @returns {string} Emoji
 */
export const getPrecipitationEmoji = (precipitationType) => {
    switch (precipitationType) {
        case 'rain': return '🌧️';
        case 'snow': return '❄️';
        case 'sleet': return '🌨️';
        case 'hail': return '🧊';
        case 'mixed': return '🌦️';
        default: return '';
    }
};
