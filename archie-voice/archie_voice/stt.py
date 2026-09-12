"""Offline speech-to-text via faster-whisper."""

import logging

import numpy as np

from . import config

logger = logging.getLogger(__name__)


class Transcriber:
    def __init__(self):
        from faster_whisper import WhisperModel

        logger.info(
            f"stt_001: loading faster-whisper '{config.WHISPER_MODEL}' "
            f"({config.WHISPER_DEVICE}/{config.WHISPER_COMPUTE})..."
        )
        self.model = WhisperModel(
            config.WHISPER_MODEL,
            device=config.WHISPER_DEVICE,
            compute_type=config.WHISPER_COMPUTE,
        )
        logger.info("stt_002: model loaded")

    def transcribe(self, pcm_int16):
        """Transcribe int16 PCM (16 kHz mono) to text (Russian by default)."""
        # faster-whisper expects float32 in [-1, 1]
        audio = pcm_int16.astype(np.float32) / 32768.0
        segments, _info = self.model.transcribe(
            audio,
            language=config.STT_LANGUAGE,
            # Our webrtcvad recorder already gates on real speech; faster-whisper's
            # own Silero VAD over-filters the narrowband BT mic and drops whole
            # utterances (transcribes to ''), so keep it off.
            vad_filter=False,
            condition_on_previous_text=False,  # don't let prior text bias output
            no_speech_threshold=0.9,  # lenient: narrowband speech scores low
            temperature=0.0,
        )
        # Only drop segments the model is *very* sure are non-speech. (The webrtcvad
        # recorder + session blocklist already handle noise/hallucinations; strict
        # confidence filtering here was dropping real narrowband speech.)
        parts = []
        for seg in segments:
            nsp = getattr(seg, "no_speech_prob", 0.0)
            alp = getattr(seg, "avg_logprob", 0.0)
            logger.info(
                f"stt_seg: '{seg.text.strip()}' no_speech={nsp:.2f} avg_logprob={alp:.2f}"
            )
            if nsp > 0.85:
                continue
            parts.append(seg.text)
        text = " ".join(parts).strip()
        logger.info(f"stt_003: transcribed: '{text}'")
        return text
