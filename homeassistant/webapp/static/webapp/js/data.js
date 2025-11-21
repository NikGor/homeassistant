// Данные из JSON для дашборда (fallback если API недоступен)
const dashboardData = {
    "type": "dashboard",
    "light": {
        "type": "light",
        "title": "Light",
        "subtitle": "2 of 3 on",
        "icon": "lightbulb",
        "status_color": "orange",
        "quick_actions": [
            { "type": "assistant_button", "text": "Evening Light", "style": "primary", "icon": "sunset", "assistant_request": "Включи вечерний свет" },
            { "type": "assistant_button", "text": "Turn Off All", "style": "secondary", "icon": "power-off", "assistant_request": "Выключи весь свет" }
        ],
        "devices": [
            { "name": "Торшер гостиная", "icon": "lamp", "color": "orange", "variant": "solid", "tooltip": "Вкл., 75%, 2700K" },
            { "name": "Потолочная кухня", "icon": "lightbulb", "color": "orange", "variant": "solid", "tooltip": "Вкл., 60%, 3000K" },
            { "name": "Спальня", "icon": "bed", "color": "gray", "variant": "outline", "tooltip": "Выкл." }
        ]
    },
    "climate": {
        "type": "climate",
        "title": "Climate",
        "subtitle": "average home 21.8°C",
        "icon": "thermometer",
        "status_color": "green",
        "quick_actions": [
            { "type": "assistant_button", "text": "Heat Bedroom", "style": "primary", "icon": "flame", "assistant_request": "Прогрей спальню" },
            { "type": "assistant_button", "text": "Night Mode", "style": "secondary", "icon": "moon", "assistant_request": "Включи ночной режим климата" }
        ],
        "devices": [
            { "name": "Гостиная", "icon": "thermometer", "color": "green", "variant": "solid", "tooltip": "22.1°C" },
            { "name": "Спальня", "icon": "thermometer", "color": "blue", "variant": "outline", "tooltip": "21.5°C" }
        ]
    },
    "music": {
        "type": "music",
        "title": "Music",
        "subtitle": "David Bowie – Space Oddity (1969)",
        "icon": "music",
        "status_color": "purple",
        "quick_actions": [
            { "type": "assistant_button", "text": "Evening Playlist", "style": "primary", "icon": "list-music", "assistant_request": "Включи вечерний плейлист" },
            { "type": "assistant_button", "text": "Album Details", "style": "secondary", "icon": "disc", "assistant_request": "Покажи детали альбома" }
        ],
        "devices": [
            { "name": "Пауза", "icon": "pause", "color": "purple", "variant": "solid", "tooltip": "Приостановить воспроизведение" },
            { "name": "Следующий", "icon": "skip-forward", "color": "purple", "variant": "outline", "tooltip": "Следующий трек" }
        ]
    },
    "documents": {
        "type": "documents",
        "title": "Documents",
        "subtitle": "new today: 2, source: Gmail",
        "icon": "file-search",
        "status_color": "blue",
        "quick_actions": [
            { "type": "assistant_button", "text": "Learn More", "style": "primary", "icon": "graduation-cap", "assistant_request": "Расскажи подробнее о новых документах" },
            { "type": "assistant_button", "text": "Find Document", "style": "secondary", "icon": "search", "assistant_request": "Найди документ" }
        ],
        "devices": null
    },
    "apps": {
        "type": "apps",
        "title": "Apps",
        "subtitle": "AI-generated utilities",
        "icon": "grid-3x3",
        "status_color": "green",
        "quick_actions": [
            { "type": "assistant_button", "text": "Start Pomodoro", "style": "primary", "icon": "timer", "assistant_request": "Запусти помодоро таймер" },
            { "type": "assistant_button", "text": "Markdown Render", "style": "secondary", "icon": "file-code", "assistant_request": "Открой markdown редактор" }
        ],
        "devices": null
    },
    "settings": {
        "type": "settings",
        "title": "Settings",
        "subtitle": "Configuration",
        "icon": "settings",
        "status_color": "gray",
        "quick_actions": [
            { "type": "assistant_button", "text": "Open Settings", "style": "primary", "icon": "settings-2", "assistant_request": "Открой настройки" },
            { "type": "assistant_button", "text": "Profile", "style": "secondary", "icon": "user", "assistant_request": "Покажи профиль" }
        ],
        "devices": null
    },
    "quick_actions": [
        { "type": "assistant_button", "text": "Создать атмосферу джаз-бара", "style": "primary", "icon": "music", "assistant_request": "Создать атмосферу джазового бара" },
        { "type": "assistant_button", "text": "Спланировать завтрашний день", "style": "secondary", "icon": "calendar-days", "assistant_request": "Помоги спланировать завтрашний день" },
        { "type": "assistant_button", "text": "Результаты футбола сегодня", "style": "secondary", "icon": "trophy", "assistant_request": "Покажи результаты футбольных матчей сегодня" }
    ]
};

// Export to window for global access
window.dashboardData = dashboardData;
