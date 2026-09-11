"""archie_voice — hands-free wake-word voice assistant for Archie.

Pipeline: OpenWakeWord (wake) → VAD recording → faster-whisper (STT, ru) →
Archie agent (HTTP) → OpenRouter TTS → playback → loop.
"""
