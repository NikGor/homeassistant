"""Main orchestration loop: wake -> converse -> back to wake."""

import logging

from . import agent, audio, config, recorder, tts
from .stt import Transcriber
from .wake import WakeWord

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# Phrases Whisper commonly invents on silence/noise (Russian + English).
_HALLUCINATION_MARKERS = (
    "продолжение следует",
    "субтитр",
    "редактор субтитров",
    "dimatorzok",
    "спасибо за просмотр",
    "thanks for watching",
    "продолжение в следующем",
)


def _is_junk(text):
    t = text.strip().lower()
    if len(t) < 2:
        return True
    return any(marker in t for marker in _HALLUCINATION_MARKERS)


def _converse(transcriber):
    """One activated conversation: keep listening until the user goes silent."""
    conversation_id = agent.new_conversation_id()
    logger.info(f"session_002: conversation {conversation_id}")
    print("🔵 Activated. Speak your request.")

    while True:
        pcm = recorder.record_utterance()
        if pcm is None:
            print("… silence — ending session.")
            audio.beep_end()
            return
        audio.beep_received()  # finished capturing the user's message

        # "Thinking" cue loops while we transcribe + query the agent.
        audio.start_thinking()
        try:
            text = transcriber.transcribe(pcm)
            if _is_junk(text):
                print("⚠️  Didn't catch that.")
                continue
            print(f"👤 You: {text}")
            answer = agent.ask(text, conversation_id)
        except Exception as e:
            logger.error(f"session_error_001: request failed: {e}")
            print("⚠️  Agent is unavailable.")
            audio.beep_end()
            return
        finally:
            audio.stop_thinking()

        if answer:
            print(f"🤖 Archie: {answer}")
            tts.speak(answer)
        # Answer done — cue the user and listen for a follow-up.
        audio.beep_ready()


def run():
    print("=== Archie Voice (wake word) ===")
    print(f"user_name={config.USER_NAME}  api={config.API_BASE}")
    transcriber = Transcriber()
    wake = WakeWord()

    try:
        while True:
            wake.wait_for_wake()
            print("🎯 Wake word detected!")
            audio.beep_wake()  # audible "I heard you" cue
            _converse(transcriber)
    except KeyboardInterrupt:
        print("\n👋 Stopping.")
