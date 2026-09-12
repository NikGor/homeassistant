# archie-voice

Hands-free wake-word voice assistant for Archie.

**Pipeline:** OpenWakeWord (wake) → VAD recording → faster-whisper (offline STT, ru)
→ Archie agent (HTTP, via Django proxy) → OpenRouter TTS → playback → loop.

Stage 1 uses the pre-trained **"hey jarvis"** wake word. A custom **"Hey Archie"**
model is trained later (OpenWakeWord training pipeline). See
`../docs/wake-word-hey-archie-plan.md`.

## Session flow

`IDLE (wait for wake) → wake detected → LISTEN (VAD) → agent → SPEAK (TTS) →
LISTEN follow-up … → 10s silence → IDLE`.

One activation = one saved conversation (persisted through
`/ai-assistant/api/messages/`).

## Setup

```bash
cd archie-voice
python -m venv .venv && source .venv/bin/activate

# system audio deps (Debian/Ubuntu):
sudo apt-get install -y portaudio19-dev libsndfile1 mpg123

# Python 3.12 (e.g. Raspberry Pi OS): openwakeword pins tflite-runtime which has
# no 3.12 wheel — install it without deps and let requirements.txt provide the rest:
pip install -r requirements.txt --no-deps openwakeword   # then:
pip install -r requirements.txt

cp .env.example .env    # then fill OPENROUTER_API_KEY
```

On Python ≤ 3.11 a plain `pip install -r requirements.txt` is enough.

## Run

```bash
python main.py --list-devices   # find your mic index
python main.py --test-mic       # verify the mic produces signal
python main.py                  # run the assistant (say "Hey Jarvis")
```

First run downloads the OpenWakeWord models and the faster-whisper model
(`large-v3-turbo`, ~1.5 GB) — allow a minute.

## Config

All knobs live in `.env` (see `.env.example`). Key ones:

| Var | Default | Notes |
|---|---|---|
| `ARCHIE_API_BASE` | `http://localhost:8000` | Django webapp base (agent proxy + persistence) |
| `WAKE_MODEL` | `hey_jarvis` | pretrained; swap to a trained `hey_archie` model path |
| `WHISPER_MODEL` | `large-v3-turbo` | offline STT; use `small`/`medium` if too slow |
| `TTS_MODEL` / `TTS_VOICE` | `openai/gpt-4o-mini-tts` / `alloy` | switch to Gemini TTS once a voice id is confirmed |
| `OPENROUTER_API_KEY` | — | required for TTS |

## Notes / TODO

- Requires a real microphone. On the Pi the BT-speaker mic is narrowband —
  a USB mic is recommended.
- `voice.py` (legacy OpenAI-cloud prototype) and `hey-archie_*.ppn` (Picovoice,
  account banned) are **superseded** and can be removed.
- Next: train custom "Hey Archie", tune threshold/VAD, package as a systemd
  service on the Pi.
