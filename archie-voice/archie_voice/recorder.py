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


# Consecutive voiced frames required to commit speech onset (debounce noise).
ONSET_FRAMES = 3


def record_utterance():
    """Capture one utterance. Returns np.int16 array, or None only after
    `SILENCE_TIMEOUT_S` of genuine silence. Short noise blips are discarded
    without ending the session."""
    vad = webrtcvad.Vad(2)  # aggressiveness 0..3

    frame_s = FRAME_MS / 1000.0
    max_wait = config.SILENCE_TIMEOUT_S
    end_silence = config.END_OF_SPEECH_SILENCE_S
    max_len = config.MAX_UTTERANCE_S
    min_speech = config.MIN_SPEECH_S

    with sd.InputStream(
        samplerate=config.SAMPLE_RATE,
        channels=1,
        dtype="int16",
        blocksize=FRAME_SAMPLES,
        device=config.MIC_DEVICE,
    ) as stream:
        print("🎙️  Listening...")
        waited = 0.0  # silent time with no committed speech
        while waited < max_wait:
            speaking = False
            onset = 0
            silence_run = 0.0
            voiced_s = 0.0
            length = 0.0
            collected = []

            while True:
                data, _ = stream.read(FRAME_SAMPLES)
                frame = np.frombuffer(data, dtype=np.int16)
                is_speech = vad.is_speech(frame.tobytes(), config.SAMPLE_RATE)

                if not speaking:
                    waited += frame_s
                    if is_speech:
                        onset += 1
                        collected.append(frame)
                        if onset >= ONSET_FRAMES:
                            speaking = True
                            voiced_s = onset * frame_s
                    else:
                        onset = 0
                        collected = []
                    if waited >= max_wait:
                        return None
                else:
                    collected.append(frame)
                    length += frame_s
                    if is_speech:
                        silence_run = 0.0
                        voiced_s += frame_s
                    else:
                        silence_run += frame_s
                        if silence_run >= end_silence:
                            break
                    if length >= max_len:
                        logger.info("rec_001: max utterance length reached")
                        break

            # Utterance finished. Accept if it has enough real speech, else keep
            # listening (a short blip must not end the session).
            if voiced_s >= min_speech:
                return np.concatenate(collected)
            logger.info(
                f"rec_002: discarded short blip ({voiced_s:.2f}s), still listening"
            )

    return None
