# URL Routes Reference

## Root dispatcher — `homeassistant/urls.py`

| Prefix | App |
|---|---|
| `/` | `webapp` |
| `/api/` | `api` |
| `/light/` | `light` |
| `/weather/` | `weather` |
| `/ai-assistant/` | `ai_assistant` |
| `/voice/` | `voice_assistant` |
| `/camera/` | `camera` |
| `/admin/` | Django admin |

## webapp

| URL | View | Notes |
|---|---|---|
| `/` | `IndexView` | Main dashboard (login required) |
| `/login/` | `LoginPageView` | |
| `/logout/` | `logout_view` | POST |
| `/api/profile/` | `get_user_profile` | GET |
| `/api/profile/update/` | `update_user_profile` | POST |
| `/api/profile/choices/` | `get_profile_choices` | GET |
| `/api/dashboard/` | `dashboard_initial` | GET, JSON |
| `/api/dashboard/action/` | `dashboard_action` | POST, JSON |

## api

| URL | View | Notes |
|---|---|---|
| `/api/chat` | `ChatView` | GET/POST |
| `/api/user/state/` | `UserStateView` | GET/PATCH, Redis |

## light

| URL | View | Notes |
|---|---|---|
| `/light/` | `LightDashboardView` | HTML |
| `/light/devices/` | `DeviceListView` | HTML |
| `/light/devices/<device_id>/` | `DeviceDetailView` | HTML |
| `/light/scan/` | `ScanDevicesView` | |
| `/light/api/device/<device_id>/toggle/` | `DeviceToggleAPIView` | POST |
| `/light/api/device/<device_id>/brightness/` | `DeviceBrightnessAPIView` | POST |
| `/light/api/device/<device_id>/temperature/` | `DeviceColorTempAPIView` | POST |
| `/light/api/device/<device_id>/rgb/` | `DeviceRGBColorAPIView` | POST |
| `/light/api/device/<device_id>/status/` | `DeviceStatusAPIView` | GET |
| `/light/api/devices/status/` | `AllDevicesStatusAPIView` | GET |
| `/light/api/devices/scan/` | `ScanDevicesView` | POST |

## weather

| URL | View | Notes |
|---|---|---|
| `/weather/` | `WeatherView` | HTML |
| `/weather/api/` | `WeatherAPIView` | GET, JSON |

## ai-assistant

| URL | View | Notes |
|---|---|---|
| `/ai-assistant/conversations/` | `proxy_conversations` | GET list / POST create |
| `/ai-assistant/conversations/<id>/` | `proxy_conversation_detail` | GET/DELETE |
| `/ai-assistant/conversations/<id>/messages/` | `proxy_conversation_messages` | GET |
| `/ai-assistant/send/` | `proxy_send_message` | POST, proxies to AI_AGENT_URL |
| `/ai-assistant/chat/` | `proxy_chat` | POST |
| `/ai-assistant/title/` | `generate_title` | POST |
| `/ai-assistant/title/<id>/` | `regenerate_title` | POST |
| `/ai-assistant/process-images/` | `process_images` | POST |
| `/ai-assistant/save-message/` | `save_message` | POST |

## Adding a new route

1. Add URL in `<app>/urls.py`
2. The app must already be included in the root `urls.py` — if it's a new app, add `path("<prefix>/", include("homeassistant.<app>.urls"))` there
3. Use `path()` with named parameters (`<str:id>`, `<int:pk>`) — never regex unless unavoidable
4. Name the URL (`name="..."`) so templates can use `{% url %}`
