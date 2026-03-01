import json
import logging

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)


def _get_fallback_dashboard():
    """Return fallback dashboard when Redis is empty"""
    return {
        "type": "dashboard",
        "light": {
            "type": "light",
            "title": "Light",
            "subtitle": "No devices",
            "icon": "lightbulb",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "climate": {
            "type": "climate",
            "title": "Climate",
            "subtitle": "No devices",
            "icon": "thermometer",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "music": {
            "type": "music",
            "title": "Music",
            "subtitle": "No playback",
            "icon": "music",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "documents": {
            "type": "documents",
            "title": "Documents",
            "subtitle": "No new documents",
            "icon": "file-search",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "apps": {
            "type": "apps",
            "title": "Apps",
            "subtitle": "AI-generated utilities",
            "icon": "grid-3x3",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "settings": {
            "type": "settings",
            "title": "Settings",
            "subtitle": "Configuration",
            "icon": "settings",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "quick_actions": [
            {
                "type": "assistant_button",
                "text": "Создать атмосферу джаз-бара",
                "style": "primary",
                "icon": "music",
                "assistant_request": "Создать атмосферу джазового бара",
            },
            {
                "type": "assistant_button",
                "text": "Спланировать завтрашний день",
                "style": "secondary",
                "icon": "calendar-days",
                "assistant_request": "Помоги спланировать завтрашний день",
            },
            {
                "type": "assistant_button",
                "text": "Результаты футбола сегодня",
                "style": "secondary",
                "icon": "trophy",
                "assistant_request": "Покажи результаты футбольных матчей сегодня",
            },
        ],
    }


def add_cors_headers(response):
    """Add CORS headers to response"""
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def dashboard_action(request):
    """
    Handle dashboard button clicks:
    1. Send request to AI agent
    2. Save full Dashboard response to Redis under smarthome_dashboard
    3. Return updated Dashboard to frontend
    """
    logger.info("dashboard_001: Processing dashboard action request")

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        data = json.loads(request.body)
        user_name = data.get("user_name", "Niko")
        assistant_request = data.get("assistant_request")

        if not assistant_request:
            raise ValueError("assistant_request is required")

        logger.info(
            f"dashboard_002: User \033[36m{user_name}\033[0m requested: \033[33m{assistant_request}\033[0m"
        )

        from homeassistant.ai_assistant.views import proxy_chat

        # Build ChatRequest for AI agent
        chat_request = {
            "user_name": user_name,
            "response_format": "dashboard",
            "input": assistant_request,
            "model": "gpt-4.1",
            "conversation_id": None,
            "previous_message_id": None,
        }

        from django.test import RequestFactory

        factory = RequestFactory()
        chat_request_obj = factory.post(
            "/ai-assistant/api/chat/",
            data=json.dumps(chat_request),
            content_type="application/json",
        )

        logger.info("dashboard_003: Proxying to ai_assistant.proxy_chat")
        response = proxy_chat(chat_request_obj)

        response_data = json.loads(response.content)
        content = response_data.get("content", {})
        dashboard = content.get("dashboard")

        if not dashboard:
            logger.error("dashboard_error_001: No dashboard in AI response")
            raise ValueError("AI agent did not return dashboard")

        # Save full Dashboard to Redis
        from homeassistant.redis_client import redis_client

        redis_client.update_user_state(
            user_name, {"smarthome_dashboard": dashboard}, ttl=None
        )
        logger.info(
            f"dashboard_004: Saved AI dashboard to Redis for user \033[36m{user_name}\033[0m"
        )

        json_response = JsonResponse(dashboard)
        return add_cors_headers(json_response)

    except Exception as e:
        logger.error(f"dashboard_error_002: Failed to process dashboard action: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def dashboard_initial(request):
    """
    Get dashboard state from Redis:
    1. If smarthome_dashboard exists (from AI) - use it with updated device states
    2. If not - build default dashboard from device states only
    """
    logger.info("dashboard_005: Fetching dashboard state from Redis")

    if request.method == "OPTIONS":
        response = HttpResponse()
        return add_cors_headers(response)

    try:
        user_name = request.GET.get("user_name", "Niko")

        from homeassistant.redis_client import redis_client

        user_state_obj = redis_client.get_user_state_by_name(user_name)

        if not user_state_obj:
            logger.warning(
                f"dashboard_warning_001: No user state in Redis for \033[36m{user_name}\033[0m, using fallback"
            )
            dashboard = _get_fallback_dashboard()
            json_response = JsonResponse(dashboard)
            return add_cors_headers(json_response)

        user_state = user_state_obj.model_dump()

        # Check if AI agent has saved a dashboard
        saved_dashboard = user_state.get("smarthome_dashboard")

        if saved_dashboard:
            # Update device states in saved dashboard
            logger.info(
                "dashboard_006: Using saved AI dashboard, updating device states"
            )
            dashboard = _update_dashboard_devices(saved_dashboard, user_state)
        else:
            # Build default dashboard from device states
            logger.info(
                "dashboard_006: No saved dashboard, building from device states"
            )
            dashboard = _build_dashboard_from_devices(user_state)

        logger.info(
            f"dashboard_007: Returning dashboard for user \033[36m{user_name}\033[0m"
        )
        json_response = JsonResponse(dashboard)
        return add_cors_headers(json_response)

    except Exception as e:
        logger.error(f"dashboard_error_004: Failed to get dashboard from Redis: {e}")
        error_response = JsonResponse({"error": str(e)}, status=500)
        return add_cors_headers(error_response)


def _update_dashboard_devices(dashboard: dict, user_state: dict) -> dict:
    """Update device lists in saved dashboard with current states from Redis"""
    light_aggregate = user_state.get("smarthome_light", {})
    climate_aggregate = user_state.get("smarthome_climate", {})

    # Update light devices and counts
    if light_aggregate and "devices" in light_aggregate:
        light_devices = []
        for device in light_aggregate.get("devices", []):
            is_on = device.get("is_on", False)
            light_devices.append(
                {
                    "name": device.get("name"),
                    "icon": device.get("icon", "lightbulb"),
                    "color": "yellow" if is_on else "gray",
                    "variant": "solid" if is_on else "outline",
                    "tooltip": _build_light_tooltip(device),
                }
            )
        dashboard["light"]["devices"] = light_devices if light_devices else None
        dashboard["light"][
            "subtitle"
        ] = f"{light_aggregate.get('on_count', 0)} of {light_aggregate.get('total_count', 0)} on"
        dashboard["light"]["status_color"] = (
            "orange" if light_aggregate.get("on_count", 0) > 0 else "gray"
        )

    # Update climate devices and temp
    if climate_aggregate and "devices" in climate_aggregate:
        climate_devices = []
        for device in climate_aggregate.get("devices", []):
            climate_devices.append(
                {
                    "name": device.get("name"),
                    "icon": device.get("icon", "thermometer"),
                    "color": device.get("color", "green"),
                    "variant": device.get("variant", "solid"),
                    "tooltip": device.get("tooltip", ""),
                }
            )
        dashboard["climate"]["devices"] = climate_devices if climate_devices else None
        avg_temp = climate_aggregate.get("average_temp", 0)
        dashboard["climate"]["subtitle"] = f"average home {avg_temp:.1f}°C"

    return dashboard


def _build_light_tooltip(device: dict) -> str:
    """Build tooltip string from light device state"""
    if not device.get("is_on", False):
        return "Выкл."
    parts = ["Вкл."]
    brightness = device.get("brightness")
    if brightness:
        parts.append(f"{brightness}%")
    color_temp = device.get("color_temp")
    if color_temp:
        parts.append(f"{color_temp}K")
    return ", ".join(parts)


def _build_dashboard_from_devices(user_state: dict) -> dict:
    """Build default dashboard structure from device states"""
    light_aggregate = user_state.get("smarthome_light", {})
    climate_aggregate = user_state.get("smarthome_climate", {})

    # Build light tile
    light_devices = []
    if light_aggregate and "devices" in light_aggregate:
        for device in light_aggregate.get("devices", []):
            is_on = device.get("is_on", False)
            light_devices.append(
                {
                    "name": device.get("name"),
                    "icon": device.get("icon", "lightbulb"),
                    "color": "yellow" if is_on else "gray",
                    "variant": "solid" if is_on else "outline",
                    "tooltip": _build_light_tooltip(device),
                }
            )

    light_on_count = light_aggregate.get("on_count", 0)
    light_total = light_aggregate.get("total_count", 0)

    # Build climate tile
    climate_devices = []
    avg_temp = 0
    if climate_aggregate and "devices" in climate_aggregate:
        for device in climate_aggregate.get("devices", []):
            climate_devices.append(
                {
                    "name": device.get("name"),
                    "icon": device.get("icon", "thermometer"),
                    "color": device.get("color", "green"),
                    "variant": device.get("variant", "solid"),
                    "tooltip": device.get("tooltip", ""),
                }
            )
        avg_temp = climate_aggregate.get("average_temp", 0)

    # Construct Dashboard
    return {
        "type": "dashboard",
        "light": {
            "type": "light",
            "title": "Light",
            "subtitle": f"{light_on_count} of {light_total} on",
            "icon": "lightbulb",
            "status_color": "orange" if light_on_count > 0 else "gray",
            "quick_actions": None,
            "devices": light_devices if light_devices else None,
        },
        "climate": {
            "type": "climate",
            "title": "Climate",
            "subtitle": f"average home {avg_temp:.1f}°C",
            "icon": "thermometer",
            "status_color": "green",
            "quick_actions": None,
            "devices": climate_devices if climate_devices else None,
        },
        "music": {
            "type": "music",
            "title": "Music",
            "subtitle": "No playback",
            "icon": "music",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "documents": {
            "type": "documents",
            "title": "Documents",
            "subtitle": "No new documents",
            "icon": "file-search",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "apps": {
            "type": "apps",
            "title": "Apps",
            "subtitle": "AI-generated utilities",
            "icon": "grid-3x3",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "settings": {
            "type": "settings",
            "title": "Settings",
            "subtitle": "Configuration",
            "icon": "settings",
            "status_color": "gray",
            "quick_actions": None,
            "devices": None,
        },
        "quick_actions": [
            {
                "type": "assistant_button",
                "text": "Создать атмосферу джаз-бара",
                "style": "primary",
                "icon": "music",
                "assistant_request": "Создать атмосферу джазового бара",
            },
            {
                "type": "assistant_button",
                "text": "Спланировать завтрашний день",
                "style": "secondary",
                "icon": "calendar-days",
                "assistant_request": "Помоги спланировать завтрашний день",
            },
            {
                "type": "assistant_button",
                "text": "Результаты футбола сегодня",
                "style": "secondary",
                "icon": "trophy",
                "assistant_request": "Покажи результаты футбольных матчей сегодня",
            },
        ],
    }
