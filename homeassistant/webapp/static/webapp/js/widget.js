// Light Widget API Functions

async function fetchLightDevices() {
    try {
        const response = await fetch('/light/api/devices/status/');
        const data = await response.json();
        if (data.success) {
            return data.devices;
        }
        console.error('Failed to fetch light devices:', data.message);
        return [];
    } catch (error) {
        console.error('Error fetching light devices:', error);
        return [];
    }
}

async function toggleLight(deviceId) {
    try {
        const response = await fetch(`/light/api/device/${deviceId}/toggle/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error('Error toggling light:', error);
        return { success: false, message: error.message };
    }
}

async function setLightBrightness(deviceId, brightness) {
    try {
        const response = await fetch(`/light/api/device/${deviceId}/brightness/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brightness })
        });
        return await response.json();
    } catch (error) {
        console.error('Error setting brightness:', error);
        return { success: false, message: error.message };
    }
}

async function setLightColorTemp(deviceId, temperature) {
    try {
        const response = await fetch(`/light/api/device/${deviceId}/temperature/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ temperature })
        });
        return await response.json();
    } catch (error) {
        console.error('Error setting color temp:', error);
        return { success: false, message: error.message };
    }
}

async function setLightRGB(deviceId, red, green, blue) {
    try {
        const response = await fetch(`/light/api/device/${deviceId}/rgb/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ red, green, blue })
        });
        return await response.json();
    } catch (error) {
        console.error('Error setting RGB:', error);
        return { success: false, message: error.message };
    }
}

function transformApiDeviceToWidget(apiDevice) {
    const isOn = apiDevice.is_on;
    const hasRgbColor = apiDevice.rgb_color && apiDevice.rgb_color !== '#ffffff';
    return {
        device_id: apiDevice.id,
        name: apiDevice.name,
        room: apiDevice.model || 'Unknown',
        is_on: isOn,
        brightness: apiDevice.brightness || 100,
        color_mode: hasRgbColor ? 'color' : 'temperature',
        color_temp: apiDevice.color_temp || 4000,
        rgb_color: apiDevice.rgb_color || '#ffffff',
        icon: 'lightbulb',
        color: isOn ? 'yellow' : 'gray'
    };
}

async function buildLightWidgetData() {
    const apiDevices = await fetchLightDevices();
    const devices = apiDevices.map(transformApiDeviceToWidget);
    const onCount = devices.filter(d => d.is_on).length;
    return {
        type: "light_widget",
        title: "Свет",
        subtitle: `${onCount} из ${devices.length} включены`,
        on_count: onCount,
        total_count: devices.length,
        devices: devices,
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
}

// Static fallback data for Light widget (used when API unavailable)
const STATIC_LIGHT_WIDGET = {
    type: "light_widget",
    title: "Свет",
    subtitle: "Загрузка...",
    on_count: 0,
    total_count: 0,
    devices: [],
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

const MUSIC_REPEAT_CYCLE = { off: 'context', context: 'track', track: 'off' };

const MUSIC_QUICK_ACTIONS = [
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
];

function musicSubtitleFor(playback) {
    return playback && playback.current_track
        ? `Воспроизводится: ${playback.current_track.artist} — ${playback.current_track.title}`
        : "Ничего не воспроизводится";
}

// Fetch account-wide playback state (whichever device is actually playing),
// not just our own Web Playback SDK device.
async function fetchSpotifyNowPlaying() {
    try {
        const response = await fetch('/spotify/api/now-playing/');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Spotify now-playing:', error);
        return { success: false, playback: null };
    }
}

async function fetchSpotifyQueue() {
    try {
        const response = await fetch('/spotify/api/queue/');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Spotify queue:', error);
        return { success: false, queue: [] };
    }
}

// Build Music widget data from real Spotify connection + playback state.
async function buildMusicWidgetData() {
    const status = await fetchSpotifyStatus();
    if (!status.connected) {
        return {
            type: "music_widget",
            connected: false,
            title: "Музыка",
            subtitle: "Spotify не подключён"
        };
    }
    const [nowPlaying, queueResult] = await Promise.all([
        fetchSpotifyNowPlaying(),
        fetchSpotifyQueue()
    ]);
    const playback = nowPlaying.success ? nowPlaying.playback : null;
    return {
        type: "music_widget",
        connected: true,
        title: "Музыка",
        subtitle: musicSubtitleFor(playback),
        playback,
        queue: queueResult.success ? queueResult.queue : [],
        quick_actions: MUSIC_QUICK_ACTIONS
    };
}

// Periodically refresh from the real Spotify API so the widget reflects
// playback started on any device (phone, desktop app, another browser tab) —
// the 'spotify:state' SDK event only covers our own registered device.
let musicPollIntervalId = null;

function stopMusicPolling() {
    if (musicPollIntervalId) {
        clearInterval(musicPollIntervalId);
        musicPollIntervalId = null;
    }
}

// Manual controls (shuffle/repeat/seek/favorite/...) are relayed through the
// AI agent as natural-language instructions, so they take a few seconds to
// actually land on Spotify's side. Suppress polling briefly after a manual
// action so its optimistic UI update isn't immediately clobbered by a poll
// tick that still reads the pre-command state.
let musicPollSuppressedUntil = 0;
function suppressMusicPolling(ms) {
    musicPollSuppressedUntil = Date.now() + ms;
}

function startMusicPolling() {
    stopMusicPolling();
    musicPollIntervalId = setInterval(async () => {
        const widgetView = document.getElementById('widget-view');
        if (!currentWidget || currentWidget.type !== 'music_widget' || widgetView.classList.contains('hidden')) {
            stopMusicPolling();
            return;
        }
        if (Date.now() < musicPollSuppressedUntil) return;
        const [nowPlaying, queueResult] = await Promise.all([
            fetchSpotifyNowPlaying(),
            fetchSpotifyQueue()
        ]);
        if (!nowPlaying.success || !currentWidget || currentWidget.type !== 'music_widget') return;
        currentWidget.playback = nowPlaying.playback;
        currentWidget.subtitle = musicSubtitleFor(nowPlaying.playback);
        if (queueResult.success) currentWidget.queue = queueResult.queue;
        renderMusicWidget(currentWidget);
        lucide.createIcons();
    }, 5000);
}

// Keep the music widget in sync with live playback state from our own SDK
// device instantly (polling above covers other devices, on a 5s delay).
let musicStateListenerAttached = false;
function ensureMusicStateListener() {
    if (musicStateListenerAttached) return;
    musicStateListenerAttached = true;
    window.addEventListener('spotify:state', (event) => {
        if (!currentWidget || currentWidget.type !== 'music_widget' || !currentWidget.connected) return;
        const state = event.detail;
        if (!state) return;

        const track = state.track_window && state.track_window.current_track;
        const prevPlayback = currentWidget.playback || {};
        currentWidget.playback = {
            is_playing: !state.paused,
            progress_seconds: Math.round(state.position / 1000),
            volume: prevPlayback.volume ?? 65,
            shuffle: typeof state.shuffle === 'boolean' ? state.shuffle : prevPlayback.shuffle,
            repeat: typeof state.repeat_mode === 'number'
                ? ['off', 'context', 'track'][state.repeat_mode]
                : prevPlayback.repeat,
            current_track: track ? {
                track_id: track.id,
                title: track.name,
                artist: (track.artists || []).map(a => a.name).join(', '),
                album: track.album ? track.album.name : null,
                duration_seconds: Math.round(state.duration / 1000),
                cover_url: track.album && track.album.images && track.album.images[0]
                    ? track.album.images[0].url : null,
                is_favorite: prevPlayback.current_track ? prevPlayback.current_track.is_favorite : false
            } : null
        };
        currentWidget.subtitle = musicSubtitleFor(currentWidget.playback);

        renderMusicWidget(currentWidget);
        lucide.createIcons();
    });
}

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
async function showWidgetView(widgetType) {
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
        // Load real data from API
        currentWidget = await buildLightWidgetData();
        renderLightWidget(currentWidget);
    } else if (widgetType === 'climate') {
        currentWidget = STATIC_CLIMATE_WIDGET;
        renderClimateWidget(STATIC_CLIMATE_WIDGET);
    } else if (widgetType === 'music') {
        ensureMusicStateListener();
        currentWidget = await buildMusicWidgetData();
        renderMusicWidget(currentWidget);
        startMusicPolling();
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
                           class="brightness-slider w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                           data-device-id="${device.device_id}"
                           title="Яркость: ${device.brightness}%">
                    <span class="brightness-value text-xs text-gray-500 w-8">${device.brightness}%</span>
                </div>
                
                <!-- Temperature (dimmed if color mode) -->
                <button class="mode-toggle flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${!isColorMode ? 'bg-orange-500/20 ring-1 ring-orange-500/50' : 'opacity-40 hover:opacity-70'}"
                        title="Режим температуры"
                        data-device="${device.device_id}" data-mode="temperature">
                    <i data-lucide="thermometer" class="w-3.5 h-3.5 ${!isColorMode ? 'text-orange-400' : 'text-gray-400'}"></i>
                    <input type="range" min="1700" max="6500" value="${device.color_temp || 4000}"
                           class="colortemp-slider w-20 h-1.5 rounded-lg appearance-none cursor-pointer"
                           data-device-id="${device.device_id}"
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
                           class="rgb-picker w-8 h-5 rounded cursor-pointer border-0 bg-transparent"
                           data-device-id="${device.device_id}"
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
                    <button class="device-toggle-btn w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOn ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'}"
                            data-device-id="${device.device_id}"
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
    
    // Add click handlers for power toggle buttons
    container.querySelectorAll('.device-toggle-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const deviceId = btn.dataset.deviceId;
            btn.disabled = true;
            btn.classList.add('opacity-50');
            
            const result = await toggleLight(deviceId);
            
            if (result.success) {
                // Refresh widget with new data
                const updatedData = await buildLightWidgetData();
                currentWidget = updatedData;
                renderLightWidget(updatedData);
                lucide.createIcons();
            } else {
                console.error('Toggle failed:', result.message);
                btn.disabled = false;
                btn.classList.remove('opacity-50');
            }
        });
    });
    
    // Add change handlers for brightness sliders
    container.querySelectorAll('.brightness-slider').forEach(slider => {
        let debounceTimer;
        slider.addEventListener('input', (e) => {
            // Update visual value immediately
            const valueSpan = slider.parentElement.querySelector('.brightness-value');
            if (valueSpan) valueSpan.textContent = `${slider.value}%`;
        });
        slider.addEventListener('change', async (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const deviceId = slider.dataset.deviceId;
                const brightness = parseInt(slider.value);
                
                const result = await setLightBrightness(deviceId, brightness);
                if (!result.success) {
                    console.error('Brightness change failed:', result.message);
                }
            }, 300);
        });
    });
    
    // Add change handlers for color temperature sliders
    container.querySelectorAll('.colortemp-slider').forEach(slider => {
        let debounceTimer;
        slider.addEventListener('change', async (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const deviceId = slider.dataset.deviceId;
                const temperature = parseInt(slider.value);
                
                const result = await setLightColorTemp(deviceId, temperature);
                if (!result.success) {
                    console.error('Color temp change failed:', result.message);
                }
            }, 300);
        });
    });
    
    // Add change handlers for RGB color pickers
    container.querySelectorAll('.rgb-picker').forEach(picker => {
        picker.addEventListener('change', async (e) => {
            const deviceId = picker.dataset.deviceId;
            const hexColor = picker.value;
            
            // Convert hex to RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            
            const result = await setLightRGB(deviceId, r, g, b);
            if (!result.success) {
                console.error('RGB change failed:', result.message);
            }
        });
    });
    
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
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Build the segmented VU-meter markup for a given fill percentage
function buildVuMeterHtml(percent, segmentCount) {
    const litCount = Math.round((percent / 100) * segmentCount);
    let html = '';
    for (let i = 0; i < segmentCount; i++) {
        html += `<div class="vu-meter__segment${i < litCount ? ' is-lit' : ''}"></div>`;
    }
    return html;
}

// Render Music Widget — retro hi-fi / vinyl lounge theme
function renderMusicWidget(data) {
    const container = document.getElementById('widget-container');

    if (!data.connected) {
        container.innerHTML = `
            <div class="vinyl-card rounded-2xl p-6">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <span class="vinyl-card__eyebrow"><span class="vinyl-card__eyebrow-dot"></span>Hi-Fi</span>
                        <h2 class="vinyl-card__title text-2xl text-[--vinyl-cream] mt-1" style="color: var(--vinyl-cream)">${data.title}</h2>
                    </div>
                    <i data-lucide="disc-3" class="w-7 h-7" style="color: var(--vinyl-amber)"></i>
                </div>
                <div class="rounded-xl p-8 text-center" style="background: rgba(0,0,0,0.25); border: 1px dashed rgba(232,169,79,0.3)">
                    <i data-lucide="music" class="w-14 h-14 mx-auto mb-4" style="color: var(--vinyl-copper)"></i>
                    <div class="mb-4" style="color: var(--vinyl-cream); opacity: 0.7">${data.subtitle}</div>
                    <a href="/spotify/authorize/" class="vinyl-btn vinyl-btn--play inline-flex items-center gap-2 px-5 py-3 font-medium" style="border-radius: 999px;">
                        <i data-lucide="plug-zap" class="w-5 h-5"></i>
                        Подключить Spotify
                    </a>
                </div>
            </div>
        `;
        return;
    }

    const playback = data.playback || {};
    const currentTrack = playback.current_track;
    const progressPercent = currentTrack ? (playback.progress_seconds / currentTrack.duration_seconds) * 100 : 0;
    const volume = playback.volume ?? 65;
    const isPlaying = !!playback.is_playing;
    const isFavorite = !!(currentTrack && currentTrack.is_favorite);
    const repeatMode = playback.repeat || 'off';

    const nowPlayingHtml = currentTrack ? `
        <div class="rounded-xl p-4 mb-4" style="background: rgba(0,0,0,0.22)">
            <div class="flex items-center gap-4">
                <div class="vinyl-disc-wrap">
                    <div class="vinyl-disc${isPlaying ? ' is-spinning' : ''}">
                        <div class="vinyl-disc__spindle"></div>
                        <div class="vinyl-disc__label">
                            ${currentTrack.cover_url
                                ? `<img src="${currentTrack.cover_url}">`
                                : `<i data-lucide="music" class="w-6 h-6" style="color: var(--vinyl-ink)"></i>`
                            }
                        </div>
                    </div>
                    <div class="vinyl-tonearm${isPlaying ? ' is-down' : ''}"></div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="vinyl-card__title text-lg truncate" style="color: var(--vinyl-cream)">${currentTrack.title}</div>
                    <div class="truncate text-sm mt-0.5" style="color: var(--vinyl-amber)">${currentTrack.artist}</div>
                    <div class="truncate text-xs mt-0.5" style="color: var(--vinyl-cream); opacity: 0.45">${currentTrack.album || ''}</div>
                </div>
                <button id="music-favorite-btn" title="${isFavorite ? 'Убрать из избранного' : 'В избранное'}"
                        style="color: ${isFavorite ? '#f472b6' : 'var(--vinyl-cream)'}; opacity: ${isFavorite ? '1' : '0.4'};">
                    <i data-lucide="heart" class="w-5 h-5${isFavorite ? ' fill-current' : ''}"></i>
                </button>
            </div>

            <!-- VU-meter progress (click to seek) -->
            <div class="mt-4">
                <div id="music-vu-meter" class="vu-meter" style="cursor: pointer;">${buildVuMeterHtml(progressPercent, 36)}</div>
                <div class="flex justify-between text-xs mt-1.5 font-mono" style="color: var(--vinyl-cream); opacity: 0.5">
                    <span>${formatDuration(playback.progress_seconds)}</span>
                    <span>${formatDuration(currentTrack.duration_seconds)}</span>
                </div>
            </div>

            <!-- Transport controls -->
            <div class="flex items-center justify-center gap-4 mt-5">
                <button id="music-shuffle-btn" class="vinyl-btn w-8 h-8" title="Перемешать"
                        style="color: ${playback.shuffle ? 'var(--vinyl-amber)' : 'var(--vinyl-cream)'}; opacity: ${playback.shuffle ? '1' : '0.5'};">
                    <i data-lucide="shuffle" class="w-4 h-4"></i>
                </button>
                <button id="music-prev-btn" class="vinyl-btn w-9 h-9" title="Предыдущий">
                    <i data-lucide="skip-back" class="w-4 h-4"></i>
                </button>
                <button id="music-play-btn" class="vinyl-btn vinyl-btn--play w-14 h-14" title="${isPlaying ? 'Пауза' : 'Воспроизвести'}">
                    <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-6 h-6 ${isPlaying ? '' : 'ml-0.5'}"></i>
                </button>
                <button id="music-next-btn" class="vinyl-btn w-9 h-9" title="Следующий">
                    <i data-lucide="skip-forward" class="w-4 h-4"></i>
                </button>
                <button id="music-repeat-btn" class="vinyl-btn w-8 h-8" title="Повтор: ${repeatMode}"
                        style="color: ${repeatMode !== 'off' ? 'var(--vinyl-amber)' : 'var(--vinyl-cream)'}; opacity: ${repeatMode !== 'off' ? '1' : '0.5'};">
                    <i data-lucide="${repeatMode === 'track' ? 'repeat-1' : 'repeat'}" class="w-4 h-4"></i>
                </button>
            </div>

            <!-- Volume fader -->
            <div class="flex items-center gap-3 mt-5 px-2">
                <i data-lucide="${volume === 0 ? 'volume-x' : volume < 50 ? 'volume-1' : 'volume-2'}" class="w-4 h-4" style="color: var(--vinyl-copper)"></i>
                <input id="music-volume-slider" type="range" min="0" max="100" value="${volume}"
                       class="vinyl-fader flex-1" style="--vinyl-fill: ${volume}%">
                <span id="music-volume-label" class="text-xs font-mono w-8" style="color: var(--vinyl-cream); opacity: 0.6">${volume}%</span>
            </div>
        </div>
    ` : `
        <div class="rounded-xl p-8 mb-4 text-center" style="background: rgba(0,0,0,0.22)">
            <div class="vinyl-disc mx-auto mb-4" style="width: 4.5rem; height: 4.5rem;">
                <div class="vinyl-disc__label"><i data-lucide="music" class="w-5 h-5" style="color: var(--vinyl-ink)"></i></div>
                <div class="vinyl-disc__spindle"></div>
            </div>
            <div style="color: var(--vinyl-cream); opacity: 0.6">Ничего не воспроизводится</div>
        </div>
    `;

    const queue = data.queue || [];
    const queueHtml = queue.length > 0 ? `
        <div class="mt-4 pt-4" style="border-top: 1px solid rgba(232,169,79,0.15);">
            <div class="text-xs uppercase tracking-wide mb-2" style="color: var(--vinyl-cream); opacity: 0.4;">Далее в очереди</div>
            ${queue.map((item, index) => `
                <button class="music-queue-item flex items-center gap-2 w-full text-left py-1.5 px-2 -mx-2 rounded-lg transition-colors"
                        data-index="${index}"
                        onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                    <span class="text-sm truncate flex-1" style="color: var(--vinyl-cream); opacity: 0.75;">${item.title} — ${item.artist}</span>
                    <span class="text-xs font-mono flex-shrink-0" style="color: var(--vinyl-cream); opacity: 0.35;">${formatDuration(item.duration_seconds)}</span>
                </button>
            `).join('')}
        </div>
    ` : '';

    const quickActionsHtml = (data.quick_actions || []).map((action, index) => `
        <button class="flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 rounded-lg transition-transform hover:scale-[1.02]"
                style="${index === 0
                    ? 'background: linear-gradient(135deg, var(--vinyl-amber), var(--vinyl-copper)); color: var(--vinyl-ink);'
                    : 'background: rgba(255,255,255,0.06); color: var(--vinyl-cream); border: 1px solid rgba(232,169,79,0.2);'}">
            <i data-lucide="${action.icon}" class="w-5 h-5"></i>
            ${action.text}
        </button>
    `).join('');

    container.innerHTML = `
        <div class="vinyl-card rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="vinyl-card__eyebrow"><span class="vinyl-card__eyebrow-dot${isPlaying ? ' is-live' : ''}"></span>${isPlaying ? 'Сейчас играет' : 'Hi-Fi'}</span>
                    <h2 class="vinyl-card__title text-2xl mt-1" style="color: var(--vinyl-cream)">${data.title}</h2>
                </div>
                <i data-lucide="disc-3" class="w-7 h-7" style="color: var(--vinyl-amber)"></i>
            </div>

            ${nowPlayingHtml}
            ${queueHtml}

            <div class="flex gap-3 mt-4">
                ${quickActionsHtml}
            </div>
        </div>
    `;

    queue.forEach((item, index) => {
        const el = container.querySelector(`.music-queue-item[data-index="${index}"]`);
        if (el) el.addEventListener('click', () => {
            suppressMusicPolling(8000);
            spotifyControl('play_track', `${item.title} — ${item.artist}`);
        });
    });

    if (!currentTrack) return;

    document.getElementById('music-prev-btn').addEventListener('click', () => {
        suppressMusicPolling(8000);
        spotifyControl('previous');
    });
    document.getElementById('music-next-btn').addEventListener('click', () => {
        suppressMusicPolling(8000);
        spotifyControl('next');
    });
    document.getElementById('music-play-btn').addEventListener('click', () => {
        suppressMusicPolling(8000);
        spotifyControl(isPlaying ? 'pause' : 'play');
    });
    document.getElementById('music-favorite-btn').addEventListener('click', () => {
        suppressMusicPolling(8000);
        spotifyControl(isFavorite ? 'unfavorite' : 'favorite');
        currentTrack.is_favorite = !isFavorite;
        renderMusicWidget(data);
        lucide.createIcons();
    });
    document.getElementById('music-shuffle-btn').addEventListener('click', () => {
        suppressMusicPolling(8000);
        const next = !playback.shuffle;
        spotifyControl('shuffle', next);
        playback.shuffle = next;
        renderMusicWidget(data);
        lucide.createIcons();
    });
    document.getElementById('music-repeat-btn').addEventListener('click', () => {
        suppressMusicPolling(8000);
        const next = MUSIC_REPEAT_CYCLE[repeatMode];
        spotifyControl('repeat', next);
        playback.repeat = next;
        renderMusicWidget(data);
        lucide.createIcons();
    });
    document.getElementById('music-vu-meter').addEventListener('click', (e) => {
        suppressMusicPolling(8000);
        const rect = e.currentTarget.getBoundingClientRect();
        const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const newProgress = Math.round(fraction * currentTrack.duration_seconds);
        spotifyControl('seek', newProgress);
        playback.progress_seconds = newProgress;
        renderMusicWidget(data);
        lucide.createIcons();
    });
    document.getElementById('music-volume-slider').addEventListener('input', (e) => {
        e.target.style.setProperty('--vinyl-fill', `${e.target.value}%`);
        document.getElementById('music-volume-label').textContent = `${e.target.value}%`;
    });
    document.getElementById('music-volume-slider').addEventListener('change', (e) => {
        suppressMusicPolling(8000);
        spotifyControl('volume', Number(e.target.value));
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
window.buildLightWidgetData = buildLightWidgetData;
window.fetchLightDevices = fetchLightDevices;
window.toggleLight = toggleLight;
window.setLightBrightness = setLightBrightness;
window.setLightColorTemp = setLightColorTemp;
window.setLightRGB = setLightRGB;

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
