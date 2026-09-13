"""Text-to-speech via OpenRouter (OpenAI-compatible /audio/speech)."""

import logging
import os
import tempfile

import requests

from . import audio, config

logger = logging.getLogger(__name__)


def speak(text, voice=None):
    """Synthesize `text`, play it, and return the raw audio bytes (or None).

    The returned bytes let the caller persist the recording without a second TTS
    call. For PCM they are headerless PCM16 @ TTS_PCM_RATE; for mp3 they are the
    encoded file.
    """
    if not text:
        return None
    if not config.OPENROUTER_API_KEY:
        logger.error("tts_error_001: OPENROUTER_API_KEY is not set")
        return None

    url = f"{config.OPENROUTER_BASE}/audio/speech"
    headers = {
        "Authorization": f"Bearer {config.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": config.TTS_MODEL,
        "input": text,
        "voice": voice or config.TTS_VOICE,
        "response_format": config.TTS_FORMAT,
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=120)
        if resp.status_code >= 400:
            logger.error(
                f"tts_error_002: TTS {resp.status_code} for model={config.TTS_MODEL} "
                f"voice={config.TTS_VOICE}: {resp.text[:400]}"
            )
            return None
    except Exception as e:
        logger.error(f"tts_error_002: TTS request failed: {e}")
        return None

    # PCM: play the raw bytes directly. Otherwise (mp3): write a temp file + mpg123.
    if config.TTS_FORMAT == "pcm":
        audio.play_pcm(resp.content, config.TTS_PCM_RATE)
        return resp.content

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            f.write(resp.content)
            tmp_path = f.name
        audio.play_audio(tmp_path)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
    return resp.content
