"""Talk to the Archie agent through the Django proxy and clean SSML.

Uses /ai-assistant/api/messages/ which forwards to the agent AND persists both
the user and assistant messages to the conversation — so one session maps to
one saved chat.
"""

import html
import logging
import re
import uuid

import requests

from . import config

logger = logging.getLogger(__name__)

_TAG_RE = re.compile(r"<[^>]+>")
_BRACKET_RE = re.compile(r"\[[^\]]*\]")  # Gemini inline audio tags, e.g. [excited]
_TRANSCRIPT_RE = re.compile(r"##\s*Transcript:\s*", re.IGNORECASE)  # gemini_tts note
_WS_RE = re.compile(r"\s+")


def new_conversation_id():
    return str(uuid.uuid4())


def strip_ssml(raw):
    """Reduce SSML/XML markup to plain readable text."""
    if not raw:
        return ""
    text = _TAG_RE.sub(" ", str(raw))
    text = html.unescape(text)
    return _WS_RE.sub(" ", text).strip()


def _extract_ssml(data):
    """Pull the spoken text out of the agent response (shape-tolerant)."""
    if not data:
        return ""
    if isinstance(data, str):
        return data
    content = data.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, dict):
        for key in ("ssml", "text", "plain"):
            val = content.get(key)
            if isinstance(val, dict):
                val = val.get("text")
            if val:
                return val
    return data.get("ssml") or data.get("text") or ""


def get_persona():
    """Fetch the current assistant persona from the webapp (Redis user_state)."""
    try:
        resp = requests.get(
            f"{config.API_BASE}/api/user/state/",
            params={"user_name": config.USER_NAME},
            timeout=10,
        )
        if resp.ok:
            return (resp.json() or {}).get("persona")
    except Exception as e:
        logger.error(f"agent_err_002: failed to fetch persona: {e}")
    return None


def ask(user_input, conversation_id, persona=None):
    """Send the user's text to the agent; return the raw spoken text.

    Use for_tts() / for_display() on the result depending on the target.
    """
    url = f"{config.API_BASE}/ai-assistant/api/messages/"
    payload = {
        "user_name": config.USER_NAME,
        "input": user_input,
        "response_format": config.RESPONSE_FORMAT,
        "conversation_id": conversation_id,
    }
    if persona:
        payload["persona"] = persona
    resp = requests.post(url, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    raw = _extract_ssml(data)
    logger.info(f"agent_001: answer ({len(raw)} chars): '{for_display(raw)[:80]}'")
    return raw


def for_tts(raw):
    """Text to feed the TTS engine.

    In "gemini_tts" mode send the whole response verbatim — the director's note
    + [inline tags] IS the Gemini TTS prompt (it interprets the note as style and
    speaks only the transcript). Otherwise strip SSML <tags> (Gemini can't read
    them) and collapse whitespace.
    """
    if not raw:
        return ""
    if config.RESPONSE_FORMAT == "gemini_tts":
        return html.unescape(str(raw)).strip()  # keep note + tags + structure
    return strip_ssml(raw)


def for_display(raw):
    """Clean text for the screen/log: the spoken words only.

    In "gemini_tts" mode keep just the "## Transcript:" section (drop the
    director's note); always strip <tags> and [inline tags].
    """
    if not raw:
        return ""
    text = str(raw)
    if config.RESPONSE_FORMAT == "gemini_tts":
        parts = _TRANSCRIPT_RE.split(text, maxsplit=1)
        if len(parts) == 2:
            text = parts[1]
    text = _TAG_RE.sub(" ", text)
    text = _BRACKET_RE.sub(" ", text)
    text = html.unescape(text)
    return _WS_RE.sub(" ", text).strip()
