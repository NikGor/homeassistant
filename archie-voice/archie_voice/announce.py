"""Speak scheduled announcements pushed over Redis pub/sub.

The wake-word loop only speaks when it hears "Archie". This module gives the
speaker a second inbound trigger: the agent's cron can publish a message on a
Redis channel and we synthesize + play it — e.g. a football-match reminder.

Message payload is JSON: {"prompt": str, "persona": str | null, "text": str}.
`prompt` is a topic we ask the agent to turn into a fresh spoken line; `text`
(optional) is an already-final line we speak verbatim.
"""

import json
import logging
import threading
import time

import redis

from . import agent, config, tts

logger = logging.getLogger(__name__)

# Serializes audio output so a scheduled announcement never plays on top of a
# live wake-word reply — two PortAudio streams at once crash sounddevice.
PLAYBACK_LOCK = threading.Lock()

_RECONNECT_DELAY_S = 5


def _handle(raw):
    """Turn one channel message into speech."""
    try:
        message = json.loads(raw)
    except (TypeError, ValueError):
        logger.error("announce_err_001: payload is not valid JSON, ignoring")
        return
    if not isinstance(message, dict):
        logger.error("announce_err_001: payload is not a JSON object, ignoring")
        return

    persona = message.get("persona") or agent.get_persona()
    voice = config.PERSONA_VOICES.get(persona or "", config.TTS_VOICE)

    text = message.get("text")
    prompt = message.get("prompt")
    if not text and prompt:
        text, _ = agent.ask(prompt, agent.new_conversation_id(), persona=persona)
    if not text:
        logger.error("announce_err_002: message has neither text nor prompt")
        return

    logger.info(
        f"announce_001: speaking ({len(str(text))} chars) persona={persona} "
        f"voice={voice}"
    )
    # Wait out any in-progress reply, then speak, so the two never overlap.
    with PLAYBACK_LOCK:
        tts.speak(agent.for_tts(text), voice=voice)


def _listen():
    """Subscribe and dispatch forever, reconnecting on Redis errors."""
    while True:
        try:
            client = redis.Redis(
                host=config.REDIS_HOST,
                port=config.REDIS_PORT,
                db=config.REDIS_DB,
                decode_responses=True,
            )
            pubsub = client.pubsub(ignore_subscribe_messages=True)
            pubsub.subscribe(config.ANNOUNCE_CHANNEL)
            logger.info(f"announce_002: listening on {config.ANNOUNCE_CHANNEL}")
            for message in pubsub.listen():
                if message.get("type") != "message":
                    continue
                try:
                    _handle(message.get("data"))
                except Exception as e:
                    logger.error(f"announce_err_003: handler failed: {e}")
        except redis.RedisError as e:
            logger.error(
                f"announce_err_004: Redis error, retrying in {_RECONNECT_DELAY_S}s: {e}"
            )
            time.sleep(_RECONNECT_DELAY_S)


def start_listener():
    """Start the announce listener in a daemon thread (no-op if disabled)."""
    if not config.ANNOUNCE_ENABLED:
        logger.info("announce_003: disabled via ANNOUNCE_ENABLED")
        return None
    thread = threading.Thread(target=_listen, name="archie-announce", daemon=True)
    thread.start()
    return thread
