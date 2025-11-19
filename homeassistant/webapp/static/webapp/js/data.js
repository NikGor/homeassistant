// Данные из JSON для дашборда
const dashboardData = {
    "type": "tool_call",
    "voice_response": "Обновляю дашборд умного дома с актуальными данными.",
    "smarthome_dashboard": {
        "type": "smarthome_dashboard",
        "tiles": [
            { 
                "category": "light", 
                "title": "Свет", 
                "subtitle": "2 из 3 включены", 
                "icon": "lightbulb", 
                "status_color": "orange", 
                "quick_actions": ["Вечерний свет", "Выключить все"], 
                "devices": [
                    { "name": "Торшер гостиная", "icon": "lamp", "color": "orange", "variant": "solid", "tooltip": "Вкл., 75%, 2700K" }, 
                    { "name": "Потолочная кухня", "icon": "lightbulb", "color": "orange", "variant": "solid", "tooltip": "Вкл., 60%, 3000K" }, 
                    { "name": "Спальня", "icon": "bed", "color": "gray", "variant": "outline", "tooltip": "Выкл." }
                ] 
            },
            { 
                "category": "climate", 
                "title": "Климат", 
                "subtitle": "средняя дома 21.8°C", 
                "icon": "thermometer", 
                "status_color": "green", 
                "quick_actions": ["Прогреть спальню", "Ночной режим"], 
                "devices": [
                    { "name": "Гостиная", "icon": "thermometer", "color": "green", "variant": "solid", "tooltip": "22.1°C" }, 
                    { "name": "Спальня", "icon": "thermometer", "color": "blue", "variant": "outline", "tooltip": "21.5°C" }
                ] 
            },
            { 
                "category": "music", 
                "title": "Музыка", 
                "subtitle": "David Bowie – Space Oddity (1969)", 
                "icon": "music", 
                "status_color": "purple", 
                "quick_actions": ["Вечерний плейлист", "Подробнее про альбом"], 
                "devices": [
                    { "name": "Пауза", "icon": "pause", "color": "purple", "variant": "solid", "tooltip": "Приостановить воспроизведение" },
                    { "name": "Следующий", "icon": "skip-forward", "color": "purple", "variant": "outline", "tooltip": "Следующий трек" }
                ]
            },
            { 
                "category": "documents", 
                "title": "Документы", 
                "subtitle": "новых сегодня: 2, источник: Gmail", 
                "icon": "file-search", 
                "status_color": "blue", 
                "quick_actions": ["Узнать подробнее", "Найти документ"], 
                "devices": null 
            },
            { 
                "category": "apps", 
                "title": "Приложения", 
                "subtitle": "ai-генерируемые утилиты", 
                "icon": "grid-3x3", 
                "status_color": "green", 
                "quick_actions": ["Запустить помодоро-таймер", "Markdown рендер"], 
                "devices": null 
            },
            { 
                "category": "settings", 
                "title": "Настройки", 
                "subtitle": "Конфигурация", 
                "icon": "settings", 
                "status_color": "gray", 
                "quick_actions": ["Открыть настройки", "Профиль"], 
                "devices": null 
            }
        ],
        "quick_actions": [
            { "type": "assistant_button", "text": "Создать атмосферу джаз-бара", "style": "primary", "icon": "music", "assistant_request": "Создать атмосферу джазового бара" },
            { "type": "assistant_button", "text": "Спланировать завтрашний день", "style": "secondary", "icon": "calendar-days", "assistant_request": "Помоги спланировать завтрашний день" },
            { "type": "assistant_button", "text": "Результаты футбола сегодня", "style": "secondary", "icon": "trophy", "assistant_request": "Покажи результаты футбольных матчей сегодня" }
        ]
    }
};
