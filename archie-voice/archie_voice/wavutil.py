"""Wrap raw PCM16 in a WAV container so the browser can play saved recordings."""

import struct


def pcm_to_wav(pcm_bytes, sample_rate, channels=1, sample_width=2):
    """Prepend a 44-byte WAV header to little-endian PCM16 bytes."""
    data_size = len(pcm_bytes)
    byte_rate = sample_rate * channels * sample_width
    block_align = channels * sample_width
    header = b"RIFF" + struct.pack("<I", 36 + data_size) + b"WAVE"
    header += b"fmt " + struct.pack(
        "<IHHIIHH",
        16,
        1,  # PCM
        channels,
        sample_rate,
        byte_rate,
        block_align,
        sample_width * 8,
    )
    header += b"data" + struct.pack("<I", data_size)
    return header + pcm_bytes
