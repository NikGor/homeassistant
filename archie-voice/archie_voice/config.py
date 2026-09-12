"""Runtime configuration, loaded from environment / .env."""

import os

from dotenv import load_dotenv

load_dotenv()


def _as_int(value, default):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _as_float(value, default):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


# --- Identity / agent -------------------------------------------------------
# Must match the user_name whose state lives in Redis (user_state:name:<name>),
# so the agent applies persona/city/language/etc.
USER_NAME = os.getenv("ARCHIE_USER_NAME", "Niko")
# Base URL of the Django webapp that proxies to the agent and persists messages.
API_BASE = os.getenv("ARCHIE_API_BASE", "http://localhost:8000").rstrip("/")
RESPONSE_FORMAT = os.getenv("ARCHIE_RESPONSE_FORMAT", "ssml")

# --- Wake word (OpenWakeWord) ----------------------------------------------
# Stage 1 uses the pre-trained "hey_jarvis" model. Swap to a custom "hey_archie"
# model file once trained.
WAKE_MODEL = os.getenv("WAKE_MODEL", "hey_jarvis")
WAKE_THRESHOLD = _as_float(os.getenv("WAKE_THRESHOLD"), 0.6)
WAKE_INFERENCE = os.getenv("WAKE_INFERENCE_FRAMEWORK", "onnx")  # "onnx" | "tflite"

# --- STT (faster-whisper, offline) -----------------------------------------
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "large-v3-turbo")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
STT_LANGUAGE = os.getenv("STT_LANGUAGE", "ru")

# --- TTS (OpenRouter, OpenAI-compatible /audio/speech) ----------------------
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE = os.getenv("OPENROUTER_BASE", "https://openrouter.ai/api/v1").rstrip(
    "/"
)
# Safe default that is known to work; switch to Gemini once a valid voice id is set:
#   TTS_MODEL=google/gemini-3.1-flash-tts-preview  TTS_VOICE=<gemini_voice_id>
TTS_MODEL = os.getenv("TTS_MODEL", "google/gemini-3.1-flash-tts-preview")
TTS_VOICE = os.getenv("TTS_VOICE", "Kore")
# Gemini TTS only supports "pcm"; mp3-capable models (grok, kokoro) can use "mp3".
TTS_FORMAT = os.getenv("TTS_FORMAT", "pcm")
TTS_PCM_RATE = _as_int(os.getenv("TTS_PCM_RATE"), 24000)

# Assistant persona -> Gemini TTS voice (style-matched, male/female mix).
# Falls back to TTS_VOICE for unknown personas.
PERSONA_VOICES = {
    "business": "Achird",  # Friendly — professional
    "bro": "Puck",  # Upbeat — casual (male)
    "flirty": "Zephyr",  # Bright (female)
    "futurebot": "Charon",  # Informative — deep, techy (male)
    "butler": "Sadachbia",  # Lively
}

# --- Audio ------------------------------------------------------------------
SAMPLE_RATE = 16000
MIC_DEVICE = _as_int(os.getenv("MIC_DEVICE"), None)  # None -> system default

# --- Session timing ---------------------------------------------------------
# End the session if the user stays silent this long when we start listening.
SILENCE_TIMEOUT_S = _as_float(os.getenv("SILENCE_TIMEOUT_S"), 10.0)
# Trailing silence that marks the end of an utterance.
END_OF_SPEECH_SILENCE_S = _as_float(os.getenv("END_OF_SPEECH_SILENCE_S"), 1.5)
# Hard cap on a single utterance length.
MAX_UTTERANCE_S = _as_float(os.getenv("MAX_UTTERANCE_S"), 15.0)
# Minimum amount of *voiced* audio to accept an utterance (drops noise/silence
# blips that make Whisper hallucinate).
MIN_SPEECH_S = _as_float(os.getenv("MIN_SPEECH_S"), 0.5)
# Gap between "thinking" cue repeats while waiting for the agent.
THINKING_INTERVAL_S = _as_float(os.getenv("THINKING_INTERVAL_S"), 1.5)
