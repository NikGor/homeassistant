/**
 * WeatherWidget - компонент для отображения погодной информации
 */

import { 
    ThermometerIcon, DropletIcon, WindIcon, EyeIcon, CompassIcon, 
    SunriseIcon, SunsetIcon, RainIcon 
} from './WeatherIcons.js';
import { 
    getWeatherIcon, getWindDirection, convertMpsToKmh, 
    convertMetersToKm, formatTime 
} from '../utils/WeatherUtils.js';
import { formatTemperature } from '../utils/Formatters.js';

/**
 * Основной компонент погодного виджета
 * @param {Object} weather - Данные о погоде
 * @returns {ReactElement} Компонент погодного виджета
 */
export const WeatherWidget = (weather) => {
    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-gradient-to-br from-sky-600/20 to-blue-600/20 rounded-2xl p-6 border border-sky-600/30 shadow-xl hover:shadow-sky-500/30 transition-all duration-300'
    }, [
        // Header
        React.createElement(WeatherHeader, { key: 'header', location: weather.location }),
        
        // Current Weather
        React.createElement(CurrentWeather, { 
            key: 'current', 
            currentWeather: weather.current_weather 
        }),
        
        // Today Summary (если есть)
        weather.today ? React.createElement(TodaySummary, { 
            key: 'today', 
            today: weather.today 
        }) : null,
        
        // Forecast (если есть)
        weather.forecast && weather.forecast.length > 0 ? React.createElement(WeatherForecast, { 
            key: 'forecast', 
            forecast: weather.forecast 
        }) : null,
        
        // Footer
        React.createElement(WeatherFooter, { 
            key: 'footer', 
            dataSource: weather.data_source,
            lastUpdated: weather.last_updated 
        })
    ].filter(Boolean));
};

/**
 * Заголовок погодного виджета
 */
const WeatherHeader = ({ location }) => {
    return React.createElement('div', {
        className: 'flex items-center justify-between mb-4'
    }, [
        React.createElement('h3', {
            key: 'title',
            className: 'font-bold text-sky-200 text-xl'
        }, '🌤️ Погода'),
        React.createElement('div', {
            key: 'location',
            className: 'text-white/70 text-sm'
        }, location)
    ]);
};

/**
 * Текущая погода
 */
const CurrentWeather = ({ currentWeather }) => {
    return React.createElement('div', {
        className: 'bg-white/5 rounded-xl p-4 mb-4'
    }, [
        // Основная информация
        React.createElement('div', {
            key: 'main',
            className: 'flex items-center justify-between mb-3'
        }, [
            React.createElement('div', {
                key: 'temp-container',
                className: 'flex items-center gap-3'
            }, [
                getWeatherIcon(currentWeather.condition),
                React.createElement('div', {
                    key: 'temp-info'
                }, [
                    React.createElement('div', {
                        key: 'temp',
                        className: 'text-3xl font-bold text-white'
                    }, formatTemperature(currentWeather.temperature)),
                    React.createElement('div', {
                        key: 'description',
                        className: 'text-white/70 text-sm capitalize'
                    }, currentWeather.condition.description)
                ])
            ]),
            React.createElement('div', {
                key: 'feels-like',
                className: 'text-right'
            }, [
                React.createElement('div', {
                    key: 'feels-label',
                    className: 'text-white/50 text-xs'
                }, 'Ощущается'),
                React.createElement('div', {
                    key: 'feels-temp',
                    className: 'text-white font-semibold'
                }, formatTemperature(currentWeather.feels_like))
            ])
        ]),

        // Детали погоды
        React.createElement(WeatherDetails, { 
            key: 'details', 
            currentWeather 
        })
    ]);
};

/**
 * Детальная информация о погоде
 */
const WeatherDetails = ({ currentWeather }) => {
    const details = [
        {
            key: 'humidity',
            icon: DropletIcon,
            label: 'Влажность',
            value: `${currentWeather.humidity}%`
        },
        {
            key: 'wind',
            icon: WindIcon,
            label: 'Ветер',
            value: `${convertMpsToKmh(currentWeather.wind_speed)} км/ч ${
                currentWeather.wind_direction ? getWindDirection(currentWeather.wind_direction) : ''
            }`.trim()
        },
        {
            key: 'pressure',
            icon: CompassIcon,
            label: 'Давление',
            value: `${currentWeather.pressure} гПа`
        }
    ];

    // Добавить видимость если есть
    if (currentWeather.visibility) {
        details.push({
            key: 'visibility',
            icon: EyeIcon,
            label: 'Видимость',
            value: `${convertMetersToKm(currentWeather.visibility)} км`
        });
    }

    return React.createElement('div', {
        className: 'grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'
    }, details.map(detail => 
        React.createElement('div', {
            key: detail.key,
            className: 'flex items-center gap-2 bg-white/5 rounded-lg p-2'
        }, [
            React.createElement(detail.icon, { key: 'icon' }),
            React.createElement('div', {
                key: 'data'
            }, [
                React.createElement('div', {
                    key: 'label',
                    className: 'text-white/50 text-xs'
                }, detail.label),
                React.createElement('div', {
                    key: 'value',
                    className: 'text-white font-medium'
                }, detail.value)
            ])
        ])
    ));
};

/**
 * Сводка на сегодня
 */
const TodaySummary = ({ today }) => {
    const todayItems = [];

    // Мин/макс температура
    if (today.temperature_min !== null && today.temperature_max !== null) {
        todayItems.push({
            key: 'minmax',
            icon: ThermometerIcon,
            label: 'Мин/Макс',
            value: `${formatTemperature(today.temperature_min)} / ${formatTemperature(today.temperature_max)}`
        });
    }

    // Восход
    if (today.sunrise) {
        todayItems.push({
            key: 'sunrise',
            icon: SunriseIcon,
            label: 'Восход',
            value: today.sunrise
        });
    }

    // Закат
    if (today.sunset) {
        todayItems.push({
            key: 'sunset',
            icon: SunsetIcon,
            label: 'Закат',
            value: today.sunset
        });
    }

    // Осадки
    if (today.precipitation_total_mm) {
        todayItems.push({
            key: 'precipitation',
            icon: RainIcon,
            label: 'Осадки',
            value: `${today.precipitation_total_mm} мм`
        });
    }

    if (todayItems.length === 0) return null;

    return React.createElement('div', {
        className: 'bg-white/5 rounded-xl p-4 mb-4'
    }, [
        React.createElement('h4', {
            key: 'title',
            className: 'font-semibold text-white mb-3'
        }, 'Сегодня'),
        React.createElement('div', {
            key: 'grid',
            className: 'grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'
        }, todayItems.map(item =>
            React.createElement('div', {
                key: item.key,
                className: 'flex items-center gap-2'
            }, [
                React.createElement(item.icon, { key: 'icon' }),
                React.createElement('div', {
                    key: 'data'
                }, [
                    React.createElement('div', {
                        key: 'label',
                        className: 'text-white/50 text-xs'
                    }, item.label),
                    React.createElement('div', {
                        key: 'value',
                        className: 'text-white font-medium'
                    }, item.value)
                ])
            ])
        ))
    ]);
};

/**
 * Прогноз погоды
 */
const WeatherForecast = ({ forecast }) => {
    return React.createElement('div', {
        className: 'bg-white/5 rounded-xl p-4 mb-4'
    }, [
        React.createElement('h4', {
            key: 'title',
            className: 'font-semibold text-white mb-3'
        }, 'Прогноз'),
        React.createElement('div', {
            key: 'list',
            className: 'space-y-2'
        }, forecast.slice(0, 5).map((item, index) =>
            React.createElement('div', {
                key: index,
                className: 'flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200'
            }, [
                React.createElement('div', {
                    key: 'left',
                    className: 'flex items-center gap-3'
                }, [
                    getWeatherIcon(item.condition),
                    React.createElement('div', {
                        key: 'info'
                    }, [
                        React.createElement('div', {
                            key: 'time',
                            className: 'text-white text-sm'
                        }, `${item.date} ${item.time}`),
                        React.createElement('div', {
                            key: 'desc',
                            className: 'text-white/60 text-xs capitalize'
                        }, item.condition.description)
                    ])
                ]),
                React.createElement('div', {
                    key: 'right',
                    className: 'flex items-center gap-3'
                }, [
                    React.createElement('div', {
                        key: 'temp',
                        className: 'text-white font-medium'
                    }, `${formatTemperature(item.temperature_min)} / ${formatTemperature(item.temperature_max)}`),
                    item.precipitation_chance ? React.createElement('div', {
                        key: 'precip',
                        className: 'text-sky-300 text-xs'
                    }, `${item.precipitation_chance}%`) : null
                ])
            ])
        ))
    ]);
};

/**
 * Подвал виджета с информацией об источнике
 */
const WeatherFooter = ({ dataSource, lastUpdated }) => {
    return React.createElement('div', {
        className: 'flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/50'
    }, [
        React.createElement('span', {
            key: 'source'
        }, dataSource || 'Источник: OpenWeather'),
        React.createElement('span', {
            key: 'updated'
        }, `Обновлено: ${formatTime(lastUpdated)}`)
    ]);
};
