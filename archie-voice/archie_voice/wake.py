"""Wake-word detection via OpenWakeWord."""

import logging

import numpy as np
import sounddevice as sd

from . import config

logger = logging.getLogger(__name__)

# 80 ms frames at 16 kHz — OpenWakeWord's recommended chunk size.
FRAME_SAMPLES = 1280


class WakeWord:
    def __init__(self):
        import openwakeword
        from openwakeword.model import Model

        # One-time download of the bundled pre-trained models (hey_jarvis, etc.).
        openwakeword.utils.download_models()

        self.model = Model(
            wakeword_models=[config.WAKE_MODEL],
            inference_framework=config.WAKE_INFERENCE,
        )
        self.target = config.WAKE_MODEL
        self.threshold = config.WAKE_THRESHOLD
        logger.info(
            f"wake_001: loaded model '{self.target}' "
            f"({config.WAKE_INFERENCE}), threshold={self.threshold}"
        )

    def _is_hit(self, prediction):
        """True if any loaded model whose name matches the target fires."""
        for name, score in prediction.items():
            if self.target in name and score >= self.threshold:
                logger.info(f"wake_002: '{name}' fired ({score:.3f})")
                return True
        return False

    def wait_for_wake(self):
        """Block until the wake word is detected. Returns when triggered."""
        self.model.reset()
        with sd.InputStream(
            samplerate=config.SAMPLE_RATE,
            channels=1,
            dtype="int16",
            blocksize=FRAME_SAMPLES,
            device=config.MIC_DEVICE,
        ) as stream:
            print("👂 Waiting for wake word... (say 'Hey Jarvis')")
            while True:
                data, _ = stream.read(FRAME_SAMPLES)
                frame = np.frombuffer(data, dtype=np.int16)
                prediction = self.model.predict(frame)
                if self._is_hit(prediction):
                    return
