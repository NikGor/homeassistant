// Данные из JSON для дашборда (fallback если API недоступен)
const dashboardData = {
    "type": "dashboard",
    "light": {
        "type": "light",
        "title": "Light",
        "subtitle": "2 of 3 on",
        "icon": "lightbulb",
        "status_color": "orange",
        "quick_actions": null,
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
        "quick_actions": null,
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
        "quick_actions": null,
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
        "quick_actions": null,
        "devices": null
    },
    "apps": {
        "type": "apps",
        "title": "Apps",
        "subtitle": "AI-generated utilities",
        "icon": "grid-3x3",
        "status_color": "green",
        "quick_actions": null,
        "devices": null
    },
    "settings": {
        "type": "settings",
        "title": "Settings",
        "subtitle": "Configuration",
        "icon": "settings",
        "status_color": "gray",
        "quick_actions": null,
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
