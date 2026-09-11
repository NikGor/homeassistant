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
            vad_filter=True,  # drop non-speech before decoding
            condition_on_previous_text=False,  # don't let prior text bias output
            no_speech_threshold=0.6,
            log_prob_threshold=-1.0,
            temperature=0.0,
        )
        # Keep only confident, speech-like segments to suppress hallucinations.
        parts = []
        for seg in segments:
            if getattr(seg, "no_speech_prob", 0.0) > 0.6:
                continue
            if getattr(seg, "avg_logprob", 0.0) < -1.0:
                continue
            parts.append(seg.text)
        text = " ".join(parts).strip()
        logger.info(f"stt_003: transcribed: '{text}'")
        return text
