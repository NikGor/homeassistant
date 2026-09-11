"""Record a single spoken utterance, endpointed with WebRTC VAD.

Returns 16-bit PCM (numpy int16, 16 kHz mono), or None if the user stayed
silent past the timeout (used to end the session).
"""

import logging

import numpy as np
import sounddevice as sd
import webrtcvad

from . import config

logger = logging.getLogger(__name__)

# WebRTC VAD works on 10/20/30 ms frames. 30 ms @ 16 kHz = 480 samples.
FRAME_MS = 30
FRAME_SAMPLES = int(config.SAMPLE_RATE * FRAME_MS / 1000)


def record_utterance():
    """Capture one utterance. Returns np.int16 array or None on silence timeout."""
    vad = webrtcvad.Vad(3)  # aggressiveness 0..3 (3 = most aggressive)

    speech_started = False
    silence_run = 0.0
    elapsed = 0.0
    voiced_s = 0.0
    collected = []

    frame_s = FRAME_MS / 1000.0
    max_wait = config.SILENCE_TIMEOUT_S
    end_silence = config.END_OF_SPEECH_SILENCE_S
    max_len = config.MAX_UTTERANCE_S

    with sd.InputStream(
        samplerate=config.SAMPLE_RATE,
        channels=1,
        dtype="int16",
        blocksize=FRAME_SAMPLES,
        device=config.MIC_DEVICE,
    ) as stream:
        print("🎙️  Listening...")
        while True:
            data, _ = stream.read(FRAME_SAMPLES)
            frame = np.frombuffer(data, dtype=np.int16)
            elapsed += frame_s

            is_speech = vad.is_speech(frame.tobytes(), config.SAMPLE_RATE)

            if not speech_started:
                if is_speech:
                    speech_started = True
                    voiced_s += frame_s
                    collected.append(frame)
                elif elapsed >= max_wait:
                    # No speech at all within the window -> end session.
                    return None
            else:
                collected.append(frame)
                if is_speech:
                    silence_run = 0.0
                    voiced_s += frame_s
                else:
                    silence_run += frame_s
                    if silence_run >= end_silence:
                        break

                if elapsed >= max_len:
                    logger.info("rec_001: max utterance length reached")
                    break

    # Reject blips with too little actual speech (a common Whisper-hallucination
    # trigger): treat them as silence.
    if not collected or voiced_s < config.MIN_SPEECH_S:
        return None
    return np.concatenate(collected)
