"""Microphone helpers and audio playback."""

import logging
import subprocess

import numpy as np
import sounddevice as sd

from . import config

logger = logging.getLogger(__name__)


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
