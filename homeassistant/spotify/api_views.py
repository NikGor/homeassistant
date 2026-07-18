import json
import logging
import os

import requests
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from homeassistant.redis_client import redis_client

from .exceptions import SpotifyAuthError
from .services import token_store

logger = logging.getLogger(__name__)

AI_AGENT_URL = os.getenv("AI_AGENT_URL", "http://archie-ai-agent:8005")
CONTROL_ACTIONS = {
    "play",
    "pause",
    "next",
    "previous",
    "volume",
    "shuffle",
    "repeat",
    "seek",
    "favorite",
    "unfavorite",
    "play_track",
}


def _current_user_name(request) -> str:
    if request.user.is_authenticated:
        return request.user.profile.user_name
    return "Niko"


@method_decorator(csrf_exempt, name="dispatch")
class SpotifyTokenAPIView(View):
    def get(self, request, *args, **kwargs):
        try:
            access_token = token_store.get_valid_access_token()
        except SpotifyAuthError as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)
        return JsonResponse({"success": True, "access_token": access_token})


@method_decorator(csrf_exempt, name="dispatch")
class SpotifyStatusAPIView(View):
    def get(self, request, *args, **kwargs):
        return JsonResponse({"success": True, "connected": token_store.has_token()})


@method_decorator(csrf_exempt, name="dispatch")
class SpotifyNowPlayingAPIView(View):
    """Reports the account-wide playback state (any device), not just our SDK device."""

    def get(self, request, *args, **kwargs):
        try:
            access_token = token_store.get_valid_access_token()
        except SpotifyAuthError as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)

        try:
            response = requests.get(
                "https://api.spotify.com/v1/me/player",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )
        except Exception as e:
            logger.error(f"spotify_008: now-playing request failed: {e}")
            return JsonResponse({"success": False, "message": str(e)}, status=502)

        if response.status_code == 204 or not response.content:
            return JsonResponse({"success": True, "playback": None})
        if response.status_code != 200:
            logger.error(f"spotify_009: now-playing failed: {response.text}")
            return JsonResponse(
                {"success": False, "message": "Failed to fetch playback state"},
                status=502,
            )

        data = response.json()
        item = data.get("item")
        if not item:
            return JsonResponse({"success": True, "playback": None})

        images = item.get("album", {}).get("images") or []
        playback = {
            "is_playing": data.get("is_playing", False),
            "progress_seconds": (data.get("progress_ms") or 0) // 1000,
            "volume": (data.get("device") or {}).get("volume_percent"),
            "shuffle": data.get("shuffle_state", False),
            "repeat": data.get("repeat_state", "off"),
            "current_track": {
                "title": item.get("name"),
                "artist": ", ".join(a.get("name") for a in item.get("artists", [])),
                "album": item.get("album", {}).get("name"),
                "duration_seconds": (item.get("duration_ms") or 0) // 1000,
                "cover_url": images[0]["url"] if images else None,
            },
        }
        return JsonResponse({"success": True, "playback": playback})


@method_decorator(csrf_exempt, name="dispatch")
class SpotifyQueueAPIView(View):
    """Reports the upcoming tracks in the user's playback queue."""

    def get(self, request, *args, **kwargs):
        try:
            access_token = token_store.get_valid_access_token()
        except SpotifyAuthError as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)

        try:
            response = requests.get(
                "https://api.spotify.com/v1/me/player/queue",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )
        except Exception as e:
            logger.error(f"spotify_010: queue request failed: {e}")
            return JsonResponse({"success": False, "message": str(e)}, status=502)

        if response.status_code != 200:
            logger.error(f"spotify_011: queue fetch failed: {response.text}")
            return JsonResponse(
                {"success": False, "message": "Failed to fetch queue"}, status=502
            )

        data = response.json()
        queue = []
        for item in (data.get("queue") or [])[:5]:
            images = item.get("album", {}).get("images") or []
            queue.append(
                {
                    "title": item.get("name"),
                    "artist": ", ".join(a.get("name") for a in item.get("artists", [])),
                    "album": item.get("album", {}).get("name"),
                    "duration_seconds": (item.get("duration_ms") or 0) // 1000,
                    "cover_url": images[0]["url"] if images else None,
                }
            )
        return JsonResponse({"success": True, "queue": queue})


@method_decorator(csrf_exempt, name="dispatch")
class SpotifyDeviceAPIView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        device_id = data.get("device_id")
        if not device_id:
            return JsonResponse(
                {"success": False, "message": "device_id is required"}, status=400
            )

        user_name = _current_user_name(request)
        redis_client.set_user_field(user_name, "spotify_device_id", device_id)
        logger.info(f"spotify_006: registered device_id for {user_name}")
        return JsonResponse({"success": True})


@method_decorator(csrf_exempt, name="dispatch")
class SpotifyControlAPIView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        action = data.get("action")
        if action not in CONTROL_ACTIONS:
            return JsonResponse(
                {"success": False, "message": f"Unknown action: {action}"}, status=400
            )

        user_name = _current_user_name(request)
        device_id = redis_client.get_user_field(user_name, "spotify_device_id")
        if not device_id:
            return JsonResponse(
                {
                    "success": False,
                    "message": "No active Spotify Web Playback device registered",
                },
                status=400,
            )

        instruction = self._build_instruction(action, data.get("value"))
        ai_request = {
            "user_name": user_name,
            "response_format": "plain",
            "input": instruction,
            "device_id": device_id,
        }
        try:
            response = requests.post(
                f"{AI_AGENT_URL}/chat",
                json=ai_request,
                timeout=15,
            )
        except Exception as e:
            logger.error(f"spotify_007: control request failed: {e}")
            return JsonResponse({"success": False, "message": str(e)}, status=502)

        return JsonResponse({"success": response.status_code == 200})

    @staticmethod
    def _build_instruction(action: str, value) -> str:
        if action == "volume":
            return f"Установи громкость Spotify на {value}%"
        if action == "shuffle":
            return (
                "Включи перемешивание в Spotify"
                if value
                else "Выключи перемешивание в Spotify"
            )
        if action == "repeat":
            return {
                "off": "Выключи повтор в Spotify",
                "context": "Включи повтор плейлиста в Spotify",
                "track": "Включи повтор текущего трека в Spotify",
            }[value]
        if action == "seek":
            return f"Перемотай текущий трек в Spotify на {value} секунд"
        if action == "play_track":
            return f"Включи в Spotify: {value}"
        return {
            "play": "Продолжи воспроизведение в Spotify",
            "pause": "Поставь Spotify на паузу",
            "next": "Включи следующий трек в Spotify",
            "previous": "Включи предыдущий трек в Spotify",
            "favorite": "Добавь текущий трек в избранное в Spotify",
            "unfavorite": "Убери текущий трек из избранного в Spotify",
        }[action]
