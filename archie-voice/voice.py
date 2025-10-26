import asyncio
import logging
import os
import tempfile
import time
import wave

import numpy as np
import requests
import simpleaudio as sa
import sounddevice as sd
from dotenv import load_dotenv

from .state import get_state

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# Load API key from .env
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Set OPENAI_API_KEY in .env")

PERSONA = (os.getenv("PERSONA") or "business").lower().strip()

API_BASE = "https://api.openai.com/v1"
STT_MODEL = "whisper-1"
TTS_MODEL = "tts-1"
VOICE = "alloy"
AUDIO_FORMAT = "mp3"

SAMPLE_RATE = 16000
CHANNELS = 1
DT_SECONDS = 4

# Initialize AI agent state
app_state = get_state(user_name="Николай", persona=PERSONA)


def test_microphone(device_id: int | None = None) -> bool:
    """Test microphone functionality for specific device."""
    print("🎤 Checking available microphones:")

    devices = sd.query_devices()
    input_devices = [d for d in devices if d["max_input_channels"] > 0]

    for i, device in enumerate(input_devices):
        device_idx = devices.index(device)
        status = "← SELECTED" if device_idx == device_id else ""
        print(
            f"  {i}: {device['name']} (channels: {device['max_input_channels']}) {status}"
        )

    # Test specific device
    try:
        device_name = "default"
        if device_id is not None:
            device_name = devices[device_id]["name"]

        print(f"\n🔊 Testing microphone: {device_name} (2 seconds, say something)...")

        test_audio = sd.rec(
            int(2 * SAMPLE_RATE),
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype="int16",
            device=device_id,
        )
        sd.wait()

        level = np.max(np.abs(test_audio))
        mean_level = np.mean(np.abs(test_audio))

        print(f"📊 Maximum level: {level}")
        print(f"📊 Average level: {mean_level:.1f}")

        if level < 100:
            print("⚠️  Microphone is too quiet or not working!")
            print("   Try:")
            print("   1. Check system sound settings")
            print("   2. Increase microphone volume")
            print("   3. Select a different microphone")
            print("   4. Speak louder during the test")
            return False
        elif level < 1000:
            print("⚠️  Microphone works, but signal is weak")
            print("   Recommended to increase volume")
            return True
        else:
            print("✅ Microphone works perfectly!")
            return True

    except Exception as e:
        logger.error(f"voice_error_007: Microphone test failed: \033[31m{e!s}\033[0m")
        print(f"❌ Microphone test error: {e}")
        return False


def select_microphone() -> int:
    """Allow user to select a microphone device."""
    devices = sd.query_devices()
    input_devices = [d for d in devices if d["max_input_channels"] > 0]

    print("\nSelect microphone:")
    for i, device in enumerate(input_devices):
        print(f"  {i}: {device['name']}")
    print(f"  {len(input_devices)}: Use default")

    while True:
        try:
            choice = input("Введите номер (Enter для умолчания): ").strip()
            if not choice or choice == str(len(input_devices)):
                device_id = None
                break

            device_idx = int(choice)
            if 0 <= device_idx < len(input_devices):
                selected_device = input_devices[device_idx]
                device_id = devices.index(selected_device)
                print(f"✅ Selected: {selected_device['name']}")
                break
            else:
                print("⚠️  Invalid number, try again")
                continue

        except (ValueError, IndexError):
            print("⚠️  Invalid input, try again")
            continue

    # Test selected microphone
    print(f"\n{'='*50}")
    if test_microphone(device_id):
        return device_id
    else:
        retry = input("\nПопробовать другой микрофон? (y/N): ").lower().strip()
        if retry in ["y", "yes", "да"]:
            return select_microphone()  # Recursive retry
        else:
            print("Continuing with current settings...")
            return device_id


def record_wav(
    path: str, seconds: int = DT_SECONDS, device_id: int | None = None
) -> None:
    """Record microphone audio and save as 16-bit PCM WAV."""
    logger.info("=== STEP 3: Audio Recording ===")

    frames = int(seconds * SAMPLE_RATE)

    try:
        audio = sd.rec(
            frames,
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="int16",
            device=device_id,
        )
        sd.wait()

        # Check if recording has actual audio data
        audio_level = np.max(np.abs(audio))

        if audio_level < 100:
            logger.warning(
                f"voice_warn_001: Recording too quiet: \033[31m{audio_level}\033[0m"
            )

        # Write WAV header + PCM data
        with wave.open(path, "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(audio.tobytes())

    except Exception as e:
        logger.error(f"voice_error_001: Recording failed: \033[31m{e!s}\033[0m")
        raise


def transcribe_wav(path: str) -> str:
    """Send WAV to OpenAI STT and return transcribed text."""
    logger.info("=== STEP 4: Speech Recognition ===")

    # Check if file exists and has content
    if not os.path.exists(path):
        raise FileNotFoundError(f"Audio file not found: {path}")

    file_size = os.path.getsize(path)
    if file_size < 1000:  # Less than 1KB suggests empty recording
        logger.warning(
            f"voice_warn_002: Audio file too small: \033[31m{file_size}\033[0m bytes"
        )

    url = f"{API_BASE}/audio/transcriptions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}

    try:
        with open(path, "rb") as audio_file:
            files = {
                "file": ("speech.wav", audio_file, "audio/wav"),
            }
            data = {
                "model": STT_MODEL,
                "language": "ru",  # Explicitly set Russian language
                "response_format": "json",
            }

            resp = requests.post(
                url, headers=headers, files=files, data=data, timeout=120
            )
            resp.raise_for_status()

            payload = resp.json()
            transcribed_text = payload.get("text", "").strip()

            logger.info(f"voice_001: Transcribed: '\033[36m{transcribed_text}\033[0m'")

            return transcribed_text

    except Exception as e:
        logger.error(f"voice_error_002: Transcription failed: \033[31m{e!s}\033[0m")
        return f"Recognition error: {e}"


async def process_text_with_agent(user_text: str, conversation_history: list) -> str:
    """Process user text using the AI agent."""
    if not user_text:
        return "Я ничего не расслышал."

    try:
        logger.info("=== STEP 5: AI Processing ===")

        conversation_history.append({"role": "user", "content": user_text})

        # TODO: Fix undefined Runner and agent
        # result = await Runner.run(agent, conversation_history)
        result = {"final_output": "Voice processing not implemented"}

        assistant_reply = (
            result.final_output if hasattr(result, "final_output") else str(result)
        )
        conversation_history.append({"role": "assistant", "content": assistant_reply})

        logger.info(
            f"voice_002: AI response: \033[33m{len(assistant_reply)}\033[0m chars"
        )
        return assistant_reply
    except Exception as e:
        logger.error(f"voice_error_003: Agent processing failed: \033[31m{e!s}\033[0m")
        return f"Sorry, an error occurred while processing the request: {e}"


def tts_to_wav(text: str, out_path: str) -> None:
    """Synthesize speech from text and save to audio file."""
    logger.info("=== STEP 6: Text to Speech ===")

    url = f"{API_BASE}/audio/speech"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    json_data = {
        "model": TTS_MODEL,
        "voice": VOICE,
        "input": text,
        "response_format": AUDIO_FORMAT,
    }

    try:
        resp = requests.post(url, headers=headers, json=json_data, timeout=120)
        resp.raise_for_status()
        with open(out_path, "wb") as f:
            f.write(resp.content)
    except Exception as e:
        logger.error(f"voice_error_004: TTS failed: \033[31m{e!s}\033[0m")
        raise


def play_audio(path: str) -> None:
    """Play audio file. Handle MP3 format by converting to WAV first."""
    try:
        logger.info("=== STEP 7: Audio Playback ===")

        # For MP3 files, we need to use a different approach
        if path.endswith(".mp3"):
            # Use system command to play MP3
            import subprocess

            subprocess.run(["mpg123", "-q", path], check=True)
        else:
            # For WAV files, use simpleaudio
            wave_obj = sa.WaveObject.from_wave_file(path)
            play_obj = wave_obj.play()
            play_obj.wait_done()

    except FileNotFoundError:
        logger.error(
            "voice_error_005: mpg123 not found. Install it with: sudo apt-get install mpg123"
        )
        raise
    except Exception as e:
        logger.error(f"voice_error_006: Audio playback failed: \033[31m{e!s}\033[0m")
        raise


async def main() -> None:
    logger.info("=== STEP 1: Voice Assistant Init ===")

    print("=== Voice Assistant ===")

    # Let user select and test microphone
    logger.info("=== STEP 2: Microphone Setup ===")
    device_id = select_microphone()

    logger.info(f"voice_003: Active persona: \033[35m{PERSONA}\033[0m")
    print(f"\nActive persona: {PERSONA}")
    print("Говорите 'stop' для exitа\n")

    conversation_history = []

    with tempfile.TemporaryDirectory() as tmp:
        while True:
            wav_in = os.path.join(tmp, f"in_{int(time.time())}.wav")
            audio_out = os.path.join(tmp, f"out_{int(time.time())}.{AUDIO_FORMAT}")

            print("\n📼 Recording... (speak now)")
            record_wav(wav_in, DT_SECONDS, device_id)

            print("🎯 Recognizing speech...")
            user_text = transcribe_wav(wav_in)
            print(f"👤 You said: '{user_text}'")

            if user_text.lower().strip() in ["stop", "stop", "exit", "exit"]:
                print("👋 Goodbye!")
                break

            if (
                not user_text
                or user_text.lower().strip() in ["you"]
                or "редактор субтитров" in user_text.lower()
                or len(user_text.strip()) < 2
            ):
                print(
                    "⚠️  Failed to recognize speech. Try speaking louder and clearer."
                )
                continue

            print("🤖 Processing with AI agent...")
            result_text = await process_text_with_agent(user_text, conversation_history)
            print(f"🤖 Bot: {result_text}")

            print("🔊 Generating speech...")
            tts_to_wav(result_text, audio_out)
            play_audio(audio_out)


if __name__ == "__main__":
    asyncio.run(main())
