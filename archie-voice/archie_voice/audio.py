"""Microphone helpers and audio playback."""

import logging
import os
import subprocess
import threading
import wave

import numpy as np
import sounddevice as sd

from . import config

logger = logging.getLogger(__name__)

SAMPLES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "samples")


def list_input_devices():
    """Return a list of (index, name, channels) for input-capable devices."""
    devices = sd.query_devices()
    result = []
    for idx, dev in enumerate(devices):
        if dev["max_input_channels"] > 0:
            result.append((idx, dev["name"], dev["max_input_channels"]))
    return result


def print_input_devices(selected=None):
    print("🎤 Input devices:")
    for idx, name, channels in list_input_devices():
        mark = " ← SELECTED" if idx == selected else ""
        print(f"  {idx}: {name} (channels: {channels}){mark}")


def test_microphone(device_id=None, seconds=2):
    """Quick capture to confirm the mic produces a signal."""
    print(f"🔊 Testing microphone (say something, {seconds}s)...")
    audio = sd.rec(
        int(seconds * config.SAMPLE_RATE),
        samplerate=config.SAMPLE_RATE,
        channels=1,
        dtype="int16",
        device=device_id,
    )
    sd.wait()
    level = int(np.max(np.abs(audio)))
    print(f"📊 Peak level: {level}")
    if level < 100:
        print("⚠️  Microphone is too quiet or not working.")
        return False
    if level < 1000:
        print("⚠️  Microphone works but the signal is weak.")
    else:
        print("✅ Microphone works.")
    return True


def play_beep(freq=880, ms=140, rate=16000, volume=0.3):
    """Play a short confirmation beep (generated tone, no file needed)."""
    n = int(rate * ms / 1000)
    t = np.arange(n) / rate
    tone = np.sin(2 * np.pi * freq * t)
    # 10 ms fade in/out to avoid clicks
    fade = max(1, int(rate * 0.01))
    env = np.ones(n)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.linspace(1, 0, fade)
    samples = (tone * env * volume * 32767).astype(np.int16)
    try:
        sd.play(samples, samplerate=rate)
        sd.wait()
    except Exception as e:
        logger.error(f"audio_error_001: beep failed: {e}")


def play_wav(name, blocking=True, fallback_freq=880):
    """Play a WAV cue from samples/, normalized loud (~0.95 peak).
    Falls back to a generated tone if the file is missing/unreadable."""
    path = os.path.join(SAMPLES_DIR, name)
    try:
        with wave.open(path, "rb") as w:
            rate = w.getframerate()
            channels = w.getnchannels()
            frames = w.readframes(w.getnframes())
        data = np.frombuffer(frames, dtype=np.int16).astype(np.float32)
        peak = np.max(np.abs(data))
        if peak > 0:
            data = data * (0.95 * 32767 / peak)  # normalize to a high, consistent level
        data = data.astype(np.int16)
        if channels > 1:
            data = data.reshape(-1, channels)
        sd.play(data, samplerate=rate)
        if blocking:
            sd.wait()
    except Exception as e:
        logger.error(f"audio_error_001: play_wav {name} failed: {e}; using tone")
        play_beep(freq=fallback_freq)


# Distinct cues (real samples in samples/, tone fallback)
def beep_wake():
    """'I heard you' — right after the wake word."""
    play_wav("wake.wav", fallback_freq=880)


def beep_received():
    """'Got it, processing' — finished capturing the user's utterance.
    Non-blocking so it overlaps STT/agent latency instead of adding to it."""
    play_wav("received.wav", blocking=False, fallback_freq=1046)


def beep_ready():
    """'Your turn' — answer finished, listening again."""
    play_wav("ready.wav", fallback_freq=1318)


def beep_end():
    """'Session closed' — went back to waiting for the wake word."""
    play_wav("end.wav", fallback_freq=440)


# --- "Thinking" cue: repeat a sample while the agent is working ---------------
# Played via a separate `aplay` process (NOT sounddevice) so it can never race
# with the main process's PortAudio streams — calling sounddevice from a
# background thread caused "double free or corruption" crashes.
_thinking_stop = None
_thinking_thread = None
_thinking_proc = None


def start_thinking():
    """Loop the thinking cue in the background until stop_thinking()."""
    global _thinking_stop, _thinking_thread
    stop_thinking()  # ensure no previous loop is running
    stop = threading.Event()
    path = os.path.join(SAMPLES_DIR, "thinking.wav")

    def loop():
        global _thinking_proc
        # Wait first so the "received" cue can play, then pulse periodically.
        while not stop.wait(config.THINKING_INTERVAL_S):
            if not os.path.exists(path):
                break
            try:
                _thinking_proc = subprocess.Popen(
                    ["aplay", "-q", path],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                _thinking_proc.wait()
            except Exception as e:
                logger.error(f"audio_error_003: thinking cue failed: {e}")
                break
            finally:
                _thinking_proc = None

    t = threading.Thread(target=loop, daemon=True)
    _thinking_stop, _thinking_thread = stop, t
    t.start()


def stop_thinking():
    """Stop the thinking loop and any in-progress cue playback."""
    global _thinking_stop, _thinking_thread, _thinking_proc
    if _thinking_stop is not None:
        _thinking_stop.set()
        if _thinking_proc is not None:
            try:
                _thinking_proc.terminate()
            except Exception:
                pass
        if _thinking_thread is not None:
            _thinking_thread.join(timeout=2)
    _thinking_stop = None
    _thinking_thread = None
    _thinking_proc = None


def play_pcm(pcm_bytes, rate):
    """Play raw 16-bit little-endian mono PCM."""
    data = np.frombuffer(pcm_bytes, dtype=np.int16)
    sd.play(data, samplerate=rate)
    sd.wait()


def play_audio(path):
    """Play an audio file (mp3 via mpg123)."""
    try:
        subprocess.run(["mpg123", "-q", path], check=True)
    except FileNotFoundError:
        logger.error(
            "voice_error_005: mpg123 not found. Install: sudo apt-get install mpg123"
        )
        raise
    except Exception as e:
        logger.error(f"voice_error_006: playback failed: {e}")
        raise
