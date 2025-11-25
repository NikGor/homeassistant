// Static widget data for Light and Climate widgets

const STATIC_LIGHT_WIDGET = {
    type: "light_widget",
    title: "Свет",
    subtitle: "2 из 3 включены",
    on_count: 2,
    total_count: 3,
    devices: [
        {
            device_id: "light_1",
            name: "Торшер гостиная",
            room: "Гостиная",
            is_on: true,
            brightness: 75,
            color_mode: "temperature",
            color_temp: 2700,
            rgb_color: null,
            icon: "lamp",
            color: "yellow"
        },
        {
            device_id: "light_2",
            name: "Потолочная кухня",
            room: "Кухня",
            is_on: true,
            brightness: 60,
            color_mode: "color",
            color_temp: null,
            rgb_color: "#FF6B35",
            icon: "lightbulb",
            color: "orange"
        },
        {
            device_id: "light_3",
            name: "Лампа спальня",
            room: "Спальня",
            is_on: false,
            brightness: 100,
            color_mode: "temperature",
            color_temp: 4000,
            rgb_color: null,
            icon: "bed",
            color: "gray"
        }
    ],
    quick_actions: [
        {
            type: "assistant_button",
            text: "Включить все",
            style: "primary",
            icon: "power",
            assistant_request: "Включи весь свет"
        },
        {
            type: "assistant_button",
            text: "Выключить все",
            style: "secondary",
            icon: "power-off",
            assistant_request: "Выключи весь свет"
        }
    ]
};

const STATIC_CLIMATE_WIDGET = {
    type: "climate_widget",
    title: "Климат",
    subtitle: "средняя 21.8°C, влажность 48%",
    average_temp: 21.8,
    average_humidity: 48,
    radiators: [
        {
            device_id: "radiator_1",
            name: "Батарея гостиная",
            room: "Гостиная",
            is_on: true,
            target_temp: 22.0,
            current_temp: 22.1,
            mode: "heat",
            icon: "heater",
            color: "red"
        },
        {
            device_id: "radiator_2",
            name: "Батарея спальня",
            room: "Спальня",
            is_on: false,
            target_temp: 20.0,
            current_temp: 21.5,
            mode: "off",
            icon: "heater",
            color: "blue"
        }
    ],
    sensors: [
        {
            device_id: "sensor_1",
            name: "Датчик гостиная",
            room: "Гостиная",
            temperature: 22.1,
            humidity: 45,
            battery_level: 87,
            last_updated: "2 мин назад",
            icon: "thermometer",
            color: "green"
        },
        {
            device_id: "sensor_2",
            name: "Датчик спальня",
            room: "Спальня",
            temperature: 21.5,
            humidity: 51,
            battery_level: 62,
            last_updated: "5 мин назад",
            icon: "thermometer",
            color: "green"
        }
    ],
    quick_actions: [
        {
            type: "assistant_button",
            text: "Режим эко",
            style: "primary",
            icon: "leaf",
            assistant_request: "Включи эко режим отопления"
        },
        {
            type: "assistant_button",
            text: "Прогреть дом",
            style: "secondary",
            icon: "flame",
            assistant_request: "Прогрей весь дом до 23 градусов"
        }
    ]
};

const STATIC_MUSIC_WIDGET = {
    type: "music_widget",
    title: "Музыка",
    subtitle: "Воспроизводится: Daft Punk — Get Lucky",
    playback: {
        is_playing: true,
        current_track: {
            track_id: "track_2",
            title: "Get Lucky",
            artist: "Daft Punk",
            album: "Random Access Memories",
            duration_seconds: 369,
            cover_url: null,
            is_favorite: true
        },
        progress_seconds: 127,
        volume: 65,
        shuffle: false,
        repeat: "off"
    },
    playlist: [
        {
            track_id: "track_1",
            title: "Instant Crush",
            artist: "Daft Punk ft. Julian Casablancas",
            album: "Random Access Memories",
            duration_seconds: 337,
            cover_url: null,
            is_favorite: false
        },
        {
            track_id: "track_2",
            title: "Get Lucky",
            artist: "Daft Punk",
            album: "Random Access Memories",
            duration_seconds: 369,
            cover_url: null,
            is_favorite: true
        },
        {
            track_id: "track_3",
            title: "Lose Yourself to Dance",
            artist: "Daft Punk ft. Pharrell Williams",
            album: "Random Access Memories",
            duration_seconds: 353,
            cover_url: null,
            is_favorite: false
        },
        {
            track_id: "track_4",
            title: "Giorgio by Moroder",
            artist: "Daft Punk",
            album: "Random Access Memories",
            duration_seconds: 544,
            cover_url: null,
            is_favorite: true
        },
        {
            track_id: "track_5",
            title: "Touch",
            artist: "Daft Punk ft. Paul Williams",
            album: "Random Access Memories",
            duration_seconds: 498,
            cover_url: null,
            is_favorite: false
        }
    ],
    quick_actions: [
        {
            type: "assistant_button",
            text: "Мои плейлисты",
            style: "primary",
            icon: "list-music",
            assistant_request: "Покажи мои плейлисты"
        },
        {
            type: "assistant_button",
            text: "Рекомендации",
            style: "secondary",
            icon: "sparkles",
            assistant_request: "Порекомендуй музыку похожую на текущий трек"
        }
    ]
};

const STATIC_DOCUMENTS_WIDGET = {
    type: "documents_widget",
    title: "Документы",
    subtitle: "147 документов в архиве",
    total_documents: 147,
    last_sync: "сегодня, 14:32",
    current_query: null,
    categories: [
        { category: "insurance", label: "Страховки", count: 23, icon: "shield-check" },
        { category: "contract", label: "Договоры", count: 45, icon: "file-signature" },
        { category: "invoice", label: "Счета", count: 38, icon: "receipt" },
        { category: "tax", label: "Налоги", count: 12, icon: "landmark" },
        { category: "medical", label: "Медицина", count: 18, icon: "heart-pulse" },
        { category: "other", label: "Другое", count: 11, icon: "folder" }
    ],
    search_results: [],
    recent_documents: [
        {
            document_id: "doc_1",
            filename: "haftpflicht_2024.pdf",
            title: "Haftpflichtversicherung 2024",
            document_type: "insurance",
            match_snippet: "Privat-Haftpflichtversicherung, Versicherungsnummer: HP-2024-****",
            relevance_score: 1.0,
            page_number: 1,
            date: "15.01.2024",
            file_size: "1.2 MB",
            tags: ["страховка", "ответственность", "2024"]
        },
        {
            document_id: "doc_2",
            filename: "mietvertrag_wohnung.pdf",
            title: "Mietvertrag Hauptstraße 42",
            document_type: "contract",
            match_snippet: "Mietvertrag für die Wohnung in der Hauptstraße 42, 97980 Bad Mergentheim",
            relevance_score: 1.0,
            page_number: 1,
            date: "01.03.2023",
            file_size: "3.4 MB",
            tags: ["аренда", "квартира", "договор"]
        },
        {
            document_id: "doc_3",
            filename: "stromrechnung_nov_2024.pdf",
            title: "Stromabrechnung November 2024",
            document_type: "invoice",
            match_snippet: "EnBW Stromabrechnung für den Zeitraum 01.11.2024 - 30.11.2024",
            relevance_score: 1.0,
            page_number: 1,
            date: "01.12.2024",
            file_size: "0.8 MB",
            tags: ["электричество", "счет", "EnBW"]
        }
    ],
    quick_actions: [
        {
            type: "assistant_button",
            text: "Загрузить документ",
            style: "primary",
            icon: "upload",
            assistant_request: "Загрузить новый документ в архив"
        },
        {
            type: "assistant_button",
            text: "Все страховки",
            style: "secondary",
            icon: "shield-check",
            assistant_request: "Покажи все мои страховки"
        }
    ]
};

// Current active widget
let currentWidget = null;

// Show widget view
function showWidgetView(widgetType) {
    const chatView = document.getElementById('chat-view');
    const dashboardView = document.getElementById('dashboard-view');
    const widgetView = document.getElementById('widget-view');
    const leftSidebar = document.getElementById('left-sidebar');

    chatView.classList.add('hidden');
    dashboardView.classList.add('hidden');
    widgetView.classList.remove('hidden');
    leftSidebar.classList.add('hidden');

    updateSidebarActiveState(widgetType);

    if (widgetType === 'light') {
        currentWidget = STATIC_LIGHT_WIDGET;
        renderLightWidget(STATIC_LIGHT_WIDGET);
    } else if (widgetType === 'climate') {
        currentWidget = STATIC_CLIMATE_WIDGET;
        renderClimateWidget(STATIC_CLIMATE_WIDGET);
    } else if (widgetType === 'music') {
        currentWidget = STATIC_MUSIC_WIDGET;
        renderMusicWidget(STATIC_MUSIC_WIDGET);
    } else if (widgetType === 'documents') {
        currentWidget = STATIC_DOCUMENTS_WIDGET;
        renderDocumentsWidget(STATIC_DOCUMENTS_WIDGET);
    }

    lucide.createIcons();
}

// Render Light Widget
function renderLightWidget(data) {
    const container = document.getElementById('widget-container');

    const devicesHtml = data.devices.map(device => {
        const isOn = device.is_on;
        const colorClass = getTailwindColorClass(device.color);
        const bgClass = isOn ? getTailwindBgColorClass(device.color) : '';
        const isColorMode = device.color_mode === 'color';
        
        // Status text
        let statusText;
        if (!isOn) {
            statusText = 'Выключено';
        } else if (isColorMode) {
            statusText = `${device.brightness}%, цвет`;
        } else {
            statusText = `${device.brightness}%, ${device.color_temp}K`;
        }

        // Controls row - all 3 in one line
        const controlsHtml = isOn ? `
            <div class="flex items-center gap-2 mt-3">
                <!-- Brightness -->
                <div class="flex items-center gap-1.5">
                    <i data-lucide="sun-dim" class="w-4 h-4 text-gray-400 shrink-0"></i>
                    <input type="range" min="1" max="100" value="${device.brightness}"
                           class="w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                           title="Яркость: ${device.brightness}%">
                    <span class="text-xs text-gray-500 w-8">${device.brightness}%</span>
                </div>
                
                <!-- Temperature (dimmed if color mode) -->
                <button class="mode-toggle flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${!isColorMode ? 'bg-orange-500/20 ring-1 ring-orange-500/50' : 'opacity-40 hover:opacity-70'}"
                        title="Режим температуры"
                        data-device="${device.device_id}" data-mode="temperature">
                    <i data-lucide="thermometer" class="w-3.5 h-3.5 ${!isColorMode ? 'text-orange-400' : 'text-gray-400'}"></i>
                    <input type="range" min="1700" max="6500" value="${device.color_temp || 4000}"
                           class="w-20 h-1.5 rounded-lg appearance-none cursor-pointer"
                           style="background: linear-gradient(to right, #ff8c00, #87ceeb);"
                           title="${device.color_temp || 4000}K"
                           ${isColorMode ? 'disabled' : ''}>
                    <span class="text-xs ${!isColorMode ? 'text-orange-300' : 'text-gray-500'} w-12">${device.color_temp || 4000}K</span>
                </button>
                
                <!-- Color (dimmed if temperature mode) -->
                <button class="mode-toggle flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${isColorMode ? 'bg-purple-500/20 ring-1 ring-purple-500/50' : 'opacity-40 hover:opacity-70'}"
                        title="Режим цвета"
                        data-device="${device.device_id}" data-mode="color">
                    <i data-lucide="palette" class="w-3.5 h-3.5 ${isColorMode ? 'text-purple-400' : 'text-gray-400'}"></i>
                    <input type="color" value="${device.rgb_color || '#FFFFFF'}"
                           class="w-8 h-5 rounded cursor-pointer border-0 bg-transparent"
                           title="Цвет: ${device.rgb_color || '#FFFFFF'}"
                           ${!isColorMode ? 'disabled' : ''}>
                </button>
            </div>
        ` : '';

        return `
            <div class="glass-tile rounded-xl p-4" data-device-card="${device.device_id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center ${isOn ? bgClass + ' bg-opacity-20' : 'bg-gray-800'}"
                             ${isOn && isColorMode && device.rgb_color ? `style="background-color: ${device.rgb_color}20;"` : ''}>
                            <i data-lucide="${device.icon}" class="w-6 h-6 ${colorClass}"
                               ${isOn && isColorMode && device.rgb_color ? `style="color: ${device.rgb_color};"` : ''}></i>
                        </div>
                        <div>
                            <div class="text-white font-medium">${device.name}</div>
                            <div class="text-gray-400 text-sm">${device.room} • ${statusText}</div>
                        </div>
                    </div>
                    <button class="w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOn ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'}"
                            title="${isOn ? 'Выключить' : 'Включить'}">
                        <i data-lucide="power" class="w-5 h-5"></i>
                    </button>
                </div>
                ${controlsHtml}
            </div>
        `;
    }).join('');

    const quickActionsHtml = data.quick_actions.map(action => {
        const styleClass = action.style === 'primary'
            ? 'bg-blue-600 hover:bg-blue-500'
            : 'bg-gray-700 hover:bg-gray-600';
        return `
            <button class="flex-1 px-4 py-3 ${styleClass} text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                <i data-lucide="${action.icon}" class="w-5 h-5"></i>
                ${action.text}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="glass-tile rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-white">${data.title}</h2>
                    <p class="text-gray-400">${data.subtitle}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-3xl font-bold text-yellow-500">${data.on_count}</span>
                    <span class="text-gray-500 text-lg">/ ${data.total_count}</span>
                </div>
            </div>

            <div class="space-y-3 mb-6">
                ${devicesHtml}
            </div>

            <div class="flex gap-3">
                ${quickActionsHtml}
            </div>
        </div>
    `;
    
    // Add click handlers for mode toggle buttons
    container.querySelectorAll('.mode-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Don't toggle if clicking on input itself
            if (e.target.tagName === 'INPUT') return;
            
            const deviceId = btn.dataset.device;
            const newMode = btn.dataset.mode;
            
            // Find device in data and update
            const device = data.devices.find(d => d.device_id === deviceId);
            if (device && device.color_mode !== newMode) {
                device.color_mode = newMode;
                // Re-render widget
                renderLightWidget(data);
                lucide.createIcons();
            }
        });
    });
}

// Render Climate Widget
function renderClimateWidget(data) {
    const container = document.getElementById('widget-container');

    const radiatorsHtml = data.radiators.map(radiator => {
        const isOn = radiator.is_on;
        const colorClass = getTailwindColorClass(radiator.color);
        const bgClass = getTailwindBgColorClass(radiator.color);
        const modeLabels = {
            heat: 'Нагрев',
            off: 'Выкл',
            auto: 'Авто',
            eco: 'Эко'
        };

        return `
            <div class="glass-tile rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center ${isOn ? bgClass + ' bg-opacity-20' : 'bg-gray-800'}">
                            <i data-lucide="${radiator.icon}" class="w-5 h-5 ${colorClass}"></i>
                        </div>
                        <div>
                            <div class="text-white font-medium">${radiator.name}</div>
                            <div class="text-gray-400 text-sm">${modeLabels[radiator.mode]}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${colorClass}">${radiator.target_temp}°C</div>
                        <div class="text-gray-500 text-xs">целевая</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-gray-700">
                        <i data-lucide="minus" class="w-4 h-4"></i>
                    </button>
                    <input type="range" min="5" max="35" value="${radiator.target_temp}" step="0.5"
                           class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500">
                    <button class="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-gray-700">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const sensorsHtml = data.sensors.map(sensor => {
        const colorClass = getTailwindColorClass(sensor.color);
        const batteryIcon = sensor.battery_level > 50 ? 'battery-full' : sensor.battery_level > 20 ? 'battery-medium' : 'battery-low';
        const batteryColor = sensor.battery_level > 50 ? 'text-green-500' : sensor.battery_level > 20 ? 'text-yellow-500' : 'text-red-500';

        return `
            <div class="glass-tile rounded-xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <i data-lucide="${sensor.icon}" class="w-5 h-5 ${colorClass}"></i>
                    </div>
                    <div>
                        <div class="text-white font-medium">${sensor.name}</div>
                        <div class="text-gray-400 text-sm">${sensor.room} • ${sensor.last_updated}</div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-center">
                        <div class="text-xl font-bold text-white">${sensor.temperature}°C</div>
                        <div class="text-gray-500 text-xs">темп.</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-blue-400">${sensor.humidity}%</div>
                        <div class="text-gray-500 text-xs">влаж.</div>
                    </div>
                    <div class="flex items-center gap-1 ${batteryColor}">
                        <i data-lucide="${batteryIcon}" class="w-4 h-4"></i>
                        <span class="text-xs">${sensor.battery_level}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const quickActionsHtml = data.quick_actions.map(action => {
        const styleClass = action.style === 'primary'
            ? 'bg-green-600 hover:bg-green-500'
            : 'bg-gray-700 hover:bg-gray-600';
        return `
            <button class="flex-1 px-4 py-3 ${styleClass} text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                <i data-lucide="${action.icon}" class="w-5 h-5"></i>
                ${action.text}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="glass-tile rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-white">${data.title}</h2>
                    <p class="text-gray-400">${data.subtitle}</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-500">${data.average_temp}°C</div>
                        <div class="text-gray-500 text-xs">средняя</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-400">${data.average_humidity}%</div>
                        <div class="text-gray-500 text-xs">влаж.</div>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <h3 class="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <i data-lucide="heater" class="w-4 h-4"></i>
                    Батареи отопления
                </h3>
                <div class="space-y-3">
                    ${radiatorsHtml}
                </div>
            </div>

            <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <i data-lucide="thermometer" class="w-4 h-4"></i>
                    Датчики
                </h3>
                <div class="space-y-3">
                    ${sensorsHtml}
                </div>
            </div>

            <div class="flex gap-3">
                ${quickActionsHtml}
            </div>
        </div>
    `;
}

// Helper: format seconds to mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Render Music Widget
function renderMusicWidget(data) {
    const container = document.getElementById('widget-container');
    const { playback, playlist } = data;
    const currentTrack = playback.current_track;
    const progressPercent = currentTrack ? (playback.progress_seconds / currentTrack.duration_seconds) * 100 : 0;

    // Current track display
    const nowPlayingHtml = currentTrack ? `
        <div class="glass-tile rounded-xl p-4 mb-4">
            <div class="flex items-center gap-4">
                <!-- Album art placeholder -->
                <div class="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shrink-0">
                    <i data-lucide="music" class="w-10 h-10 text-white/80"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-white font-semibold text-lg truncate">${currentTrack.title}</div>
                    <div class="text-gray-400 truncate">${currentTrack.artist}</div>
                    <div class="text-gray-500 text-sm truncate">${currentTrack.album || ''}</div>
                </div>
                <button class="p-2 text-gray-400 hover:text-pink-500 transition-colors" title="${currentTrack.is_favorite ? 'Убрать из избранного' : 'В избранное'}">
                    <i data-lucide="${currentTrack.is_favorite ? 'heart' : 'heart'}" class="w-6 h-6 ${currentTrack.is_favorite ? 'text-pink-500 fill-pink-500' : ''}"></i>
                </button>
            </div>
            
            <!-- Progress bar -->
            <div class="mt-4">
                <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden cursor-pointer">
                    <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                         style="width: ${progressPercent}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${formatTime(playback.progress_seconds)}</span>
                    <span>${formatTime(currentTrack.duration_seconds)}</span>
                </div>
            </div>
            
            <!-- Playback controls -->
            <div class="flex items-center justify-center gap-4 mt-4">
                <button class="p-2 text-gray-400 hover:text-white transition-colors ${playback.shuffle ? 'text-purple-500' : ''}" title="Перемешать">
                    <i data-lucide="shuffle" class="w-5 h-5"></i>
                </button>
                <button class="p-2 text-gray-400 hover:text-white transition-colors" title="Предыдущий">
                    <i data-lucide="skip-back" class="w-6 h-6"></i>
                </button>
                <button class="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform" title="${playback.is_playing ? 'Пауза' : 'Воспроизвести'}">
                    <i data-lucide="${playback.is_playing ? 'pause' : 'play'}" class="w-7 h-7 ${playback.is_playing ? '' : 'ml-1'}"></i>
                </button>
                <button class="p-2 text-gray-400 hover:text-white transition-colors" title="Следующий">
                    <i data-lucide="skip-forward" class="w-6 h-6"></i>
                </button>
                <button class="p-2 text-gray-400 hover:text-white transition-colors ${playback.repeat !== 'off' ? 'text-purple-500' : ''}" title="Повтор: ${playback.repeat}">
                    <i data-lucide="${playback.repeat === 'one' ? 'repeat-1' : 'repeat'}" class="w-5 h-5"></i>
                </button>
            </div>
            
            <!-- Volume control -->
            <div class="flex items-center gap-3 mt-4 px-4">
                <i data-lucide="${playback.volume === 0 ? 'volume-x' : playback.volume < 50 ? 'volume-1' : 'volume-2'}" class="w-5 h-5 text-gray-400"></i>
                <input type="range" min="0" max="100" value="${playback.volume}"
                       class="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500">
                <span class="text-xs text-gray-500 w-8">${playback.volume}%</span>
            </div>
        </div>
    ` : `
        <div class="glass-tile rounded-xl p-8 mb-4 text-center">
            <i data-lucide="music" class="w-16 h-16 text-gray-600 mx-auto mb-4"></i>
            <div class="text-gray-400">Ничего не воспроизводится</div>
        </div>
    `;

    // Playlist
    const playlistHtml = playlist.map((track, index) => {
        const isCurrentTrack = currentTrack && track.track_id === currentTrack.track_id;
        return `
            <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group ${isCurrentTrack ? 'bg-white/10' : ''}"
                 data-track-id="${track.track_id}">
                <div class="w-8 text-center text-gray-500 group-hover:hidden ${isCurrentTrack ? 'hidden' : ''}">
                    ${index + 1}
                </div>
                <div class="w-8 text-center hidden group-hover:block ${isCurrentTrack ? '!block' : ''}">
                    ${isCurrentTrack && playback.is_playing 
                        ? '<i data-lucide="pause" class="w-4 h-4 text-purple-500 mx-auto"></i>'
                        : '<i data-lucide="play" class="w-4 h-4 text-white mx-auto"></i>'
                    }
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-white truncate ${isCurrentTrack ? 'text-purple-400' : ''}">${track.title}</div>
                    <div class="text-gray-500 text-sm truncate">${track.artist}</div>
                </div>
                <button class="p-1.5 text-gray-500 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all">
                    <i data-lucide="heart" class="w-4 h-4 ${track.is_favorite ? 'text-pink-500 fill-pink-500 opacity-100' : ''}"></i>
                </button>
                <div class="text-gray-500 text-sm w-12 text-right">${formatTime(track.duration_seconds)}</div>
            </div>
        `;
    }).join('');

    // Quick actions
    const quickActionsHtml = data.quick_actions.map(action => {
        const styleClass = action.style === 'primary'
            ? 'bg-purple-600 hover:bg-purple-500'
            : 'bg-gray-700 hover:bg-gray-600';
        return `
            <button class="flex-1 px-4 py-3 ${styleClass} text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                <i data-lucide="${action.icon}" class="w-5 h-5"></i>
                ${action.text}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="glass-tile rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-2xl font-bold text-white">${data.title}</h2>
                    <p class="text-gray-400 text-sm">${data.subtitle}</p>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="music-2" class="w-8 h-8 text-purple-500"></i>
                </div>
            </div>

            ${nowPlayingHtml}

            <!-- Playlist section -->
            <div class="mb-4">
                <h3 class="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <i data-lucide="list-music" class="w-4 h-4"></i>
                    Очередь воспроизведения
                </h3>
                <div class="max-h-48 overflow-y-auto scrollbar-thin">
                    ${playlistHtml}
                </div>
            </div>

            <div class="flex gap-3">
                ${quickActionsHtml}
            </div>
        </div>
    `;
    
    // Add click handlers for playlist tracks
    container.querySelectorAll('[data-track-id]').forEach(trackEl => {
        trackEl.addEventListener('click', (e) => {
            if (e.target.closest('button')) return; // Don't trigger on heart button
            
            const trackId = trackEl.dataset.trackId;
            const track = playlist.find(t => t.track_id === trackId);
            
            if (track) {
                // Update playback state
                data.playback.current_track = track;
                data.playback.progress_seconds = 0;
                data.playback.is_playing = true;
                data.subtitle = `Воспроизводится: ${track.artist} — ${track.title}`;
                
                // Re-render
                renderMusicWidget(data);
                lucide.createIcons();
            }
        });
    });
}

// Document type icons and colors
const DOCUMENT_TYPE_CONFIG = {
    insurance: { icon: "shield-check", color: "text-green-500", bg: "bg-green-500/20", label: "Страховка" },
    contract: { icon: "file-signature", color: "text-blue-500", bg: "bg-blue-500/20", label: "Договор" },
    invoice: { icon: "receipt", color: "text-orange-500", bg: "bg-orange-500/20", label: "Счёт" },
    receipt: { icon: "file-check", color: "text-yellow-500", bg: "bg-yellow-500/20", label: "Квитанция" },
    tax: { icon: "landmark", color: "text-red-500", bg: "bg-red-500/20", label: "Налоги" },
    medical: { icon: "heart-pulse", color: "text-pink-500", bg: "bg-pink-500/20", label: "Медицина" },
    legal: { icon: "scale", color: "text-purple-500", bg: "bg-purple-500/20", label: "Юр. документ" },
    other: { icon: "folder", color: "text-gray-400", bg: "bg-gray-500/20", label: "Другое" }
};

// Render Documents Widget
function renderDocumentsWidget(data) {
    const container = document.getElementById('widget-container');
    const hasSearchResults = data.search_results && data.search_results.length > 0;
    const documentsToShow = hasSearchResults ? data.search_results : data.recent_documents;

    // Categories pills
    const categoriesHtml = data.categories.map(cat => `
        <button class="category-filter flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm"
                data-category="${cat.category}">
            <i data-lucide="${cat.icon}" class="w-3.5 h-3.5 text-gray-400"></i>
            <span class="text-gray-300">${cat.label}</span>
            <span class="text-gray-500">${cat.count}</span>
        </button>
    `).join('');

    // Document results
    const documentsHtml = documentsToShow.map(doc => {
        const typeConfig = DOCUMENT_TYPE_CONFIG[doc.document_type] || DOCUMENT_TYPE_CONFIG.other;
        const relevancePercent = Math.round(doc.relevance_score * 100);
        
        return `
            <div class="glass-tile rounded-xl p-4 hover:bg-white/5 cursor-pointer transition-colors group"
                 data-document-id="${doc.document_id}">
                <div class="flex items-start gap-4">
                    <!-- Document icon -->
                    <div class="w-12 h-12 rounded-lg ${typeConfig.bg} flex items-center justify-center shrink-0">
                        <i data-lucide="${typeConfig.icon}" class="w-6 h-6 ${typeConfig.color}"></i>
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-white font-medium truncate">${doc.title}</span>
                            ${hasSearchResults ? `
                                <span class="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">${relevancePercent}%</span>
                            ` : ''}
                        </div>
                        <div class="text-gray-500 text-sm truncate mb-2">${doc.filename}</div>
                        <div class="text-gray-400 text-sm line-clamp-2">${doc.match_snippet}</div>
                        
                        <!-- Meta info -->
                        <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            ${doc.date ? `<span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i>${doc.date}</span>` : ''}
                            ${doc.page_number ? `<span class="flex items-center gap-1"><i data-lucide="file-text" class="w-3 h-3"></i>стр. ${doc.page_number}</span>` : ''}
                            ${doc.file_size ? `<span>${doc.file_size}</span>` : ''}
                        </div>
                        
                        <!-- Tags -->
                        ${doc.tags && doc.tags.length > 0 ? `
                            <div class="flex flex-wrap gap-1 mt-2">
                                ${doc.tags.map(tag => `
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">${tag}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Открыть">
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                        </button>
                        <button class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Скачать">
                            <i data-lucide="download" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Quick actions
    const quickActionsHtml = data.quick_actions.map(action => {
        const styleClass = action.style === 'primary'
            ? 'bg-blue-600 hover:bg-blue-500'
            : 'bg-gray-700 hover:bg-gray-600';
        return `
            <button class="flex-1 px-4 py-3 ${styleClass} text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                <i data-lucide="${action.icon}" class="w-5 h-5"></i>
                ${action.text}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="glass-tile rounded-2xl p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-2xl font-bold text-white">${data.title}</h2>
                    <p class="text-gray-400 text-sm">${data.subtitle}</p>
                </div>
                <div class="flex items-center gap-2 text-gray-500 text-xs">
                    <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                    <span>${data.last_sync || 'не синхр.'}</span>
                </div>
            </div>
            
            <!-- Search input -->
            <div class="relative mb-4">
                <div class="absolute inset-0 bg-white/5 rounded-xl"></div>
                <div class="relative flex items-center">
                    <i data-lucide="search" class="w-5 h-5 text-gray-500 ml-4"></i>
                    <input type="text" 
                           id="document-search-input"
                           placeholder="Поиск по документам..." 
                           value="${data.current_query || ''}"
                           class="flex-1 bg-transparent text-white placeholder-gray-500 border-none outline-none p-4">
                    ${data.current_query ? `
                        <button id="clear-search-btn" class="p-2 mr-2 text-gray-500 hover:text-white transition-colors">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <!-- Categories -->
            <div class="flex flex-wrap gap-2 mb-4">
                ${categoriesHtml}
            </div>
            
            <!-- Results header -->
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <i data-lucide="${hasSearchResults ? 'search' : 'clock'}" class="w-4 h-4"></i>
                    ${hasSearchResults ? `Результаты поиска (${data.search_results.length})` : 'Недавние документы'}
                </h3>
            </div>
            
            <!-- Documents list -->
            <div class="space-y-3 mb-4 max-h-80 overflow-y-auto">
                ${documentsHtml.length > 0 ? documentsHtml : `
                    <div class="text-center py-8 text-gray-500">
                        <i data-lucide="file-search" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                        <p>Документы не найдены</p>
                    </div>
                `}
            </div>
            
            <!-- Quick actions -->
            <div class="flex gap-3">
                ${quickActionsHtml}
            </div>
        </div>
    `;
    
    // Search input handler
    const searchInput = container.querySelector('#document-search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    // Simulate search (in real app, this would call API)
                    data.current_query = query;
                    data.search_results = data.recent_documents.filter(doc => 
                        doc.title.toLowerCase().includes(query.toLowerCase()) ||
                        doc.match_snippet.toLowerCase().includes(query.toLowerCase()) ||
                        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
                    );
                    renderDocumentsWidget(data);
                    lucide.createIcons();
                }
            }
        });
    }
    
    // Clear search handler
    const clearBtn = container.querySelector('#clear-search-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            data.current_query = null;
            data.search_results = [];
            renderDocumentsWidget(data);
            lucide.createIcons();
        });
    }
    
    // Category filter handlers
    container.querySelectorAll('.category-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            data.current_query = DOCUMENT_TYPE_CONFIG[category]?.label || category;
            data.search_results = data.recent_documents.filter(doc => doc.document_type === category);
            renderDocumentsWidget(data);
            lucide.createIcons();
        });
    });
}

// Export functions to window
window.showWidgetView = showWidgetView;
window.renderLightWidget = renderLightWidget;
window.renderClimateWidget = renderClimateWidget;
window.renderMusicWidget = renderMusicWidget;
window.renderDocumentsWidget = renderDocumentsWidget;

// Initialize widget input form handler
document.addEventListener('DOMContentLoaded', () => {
    const widgetForm = document.getElementById('widget-input-form');
    const widgetInput = document.getElementById('widget-input-field');
    
    if (widgetForm && widgetInput) {
        widgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = widgetInput.value.trim();
            if (!message) return;
            
            // Send message to chat assistant if available
            if (window.chatAssistantAPI && typeof window.chatAssistantAPI.sendMessage === 'function') {
                // Switch to chat view first
                if (typeof showChatView === 'function') {
                    showChatView();
                }
                // Small delay to ensure view switch completes
                setTimeout(() => {
                    window.chatAssistantAPI.sendMessage(message);
                }, 100);
            }
            
            widgetInput.value = '';
        });
    }
});
