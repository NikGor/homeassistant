// VoiceChat — real-time, hands-free voice assistant.
//
// Flow (one session == one saved conversation):
//   mic press -> listen (STT, ru-RU) -> send {input, response_format: "ssml"}
//   to the agent -> receive SSML -> strip tags -> speak in the persona's voice
//   (backend Gemini TTS, browser speechSynthesis fallback) + show on screen ->
//   listen again. After 10s of silence, or on the cancel (X) button, the session
//   ends. Every turn is persisted to the same conversation.
//
// Audio cues (Web Audio, synthesized — no files): start, received, ready, end,
// error. Persona voice comes from POST /ai-assistant/api/tts/ (resolves the
// Gemini voice from the user's persona server-side).

const VoiceChat = () => {
    const { useState, useRef, useEffect, useCallback } = React;

    const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(null);

    // Browser capability checks
    const SpeechRecognition = typeof window !== 'undefined'
        ? (window.SpeechRecognition || window.webkitSpeechRecognition)
        : undefined;
    const AudioCtx = typeof window !== 'undefined'
        ? (window.AudioContext || window.webkitAudioContext)
        : undefined;
    const sttSupported = !!SpeechRecognition;
    const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    // STT is essential; playback works through Web Audio (persona TTS) or the
    // browser fallback, so either audio path is enough.
    const supported = sttSupported && (!!AudioCtx || ttsSupported);

    // Session refs (kept in refs so async callbacks always see fresh values)
    const sessionActiveRef = useRef(false);
    const conversationIdRef = useRef(null);
    const recognitionRef = useRef(null);
    const listenDeadlineRef = useRef(0);
    const turnGotResultRef = useRef(false);
    const audioCtxRef = useRef(null);
    const currentSourceRef = useRef(null); // active WAV BufferSource, for stop()

    const LISTEN_WINDOW_MS = 10000; // end the session after 10s of silence

    // ── Web Audio: shared context + synthesized cues ────────────────────────
    const getAudioCtx = () => {
        if (!AudioCtx) return null;
        if (!audioCtxRef.current) {
            try { audioCtxRef.current = new AudioCtx(); } catch (_) { return null; }
        }
        const ctx = audioCtxRef.current;
        // Autoplay policy: unlock on the user gesture that starts the session.
        if (ctx.state === 'suspended') ctx.resume().catch(() => { /* noop */ });
        return ctx;
    };

    const tone = (ctx, freq, startAt, dur, peak = 0.14) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + dur + 0.03);
    };

    // [freq, offset (s), duration (s)] sequences — short, distinct tones
    const CUES = {
        start: [[660, 0, 0.12], [880, 0.10, 0.14]],   // rising: session opened
        received: [[540, 0, 0.11]],                    // single tick: got your words
        ready: [[784, 0, 0.13]],                       // bright: answer ready
        end: [[540, 0, 0.11], [340, 0.10, 0.17]],      // falling: session closed
        error: [[220, 0, 0.28, 0.12]],                 // low buzz
    };

    const beep = (type) => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const seq = CUES[type];
        if (!seq) return;
        const t0 = ctx.currentTime + 0.01;
        seq.forEach(([f, off, dur, peak]) => tone(ctx, f, t0 + off, dur, peak));
    };

    // ── Helpers ────────────────────────────────────────────────────────────
    const genUUID = () => {
        // crypto.randomUUID needs a secure context; fall back for plain-http LAN
        if (window.crypto?.randomUUID) {
            try { return window.crypto.randomUUID(); } catch (_) { /* fall through */ }
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    const decodeEntities = (s) => {
        const t = document.createElement('textarea');
        t.innerHTML = s;
        return t.value;
    };

    // Strip SSML/XML markup down to plain readable text (for both TTS and display)
    const stripSsml = (raw) => {
        if (!raw) return '';
        let s = String(raw);
        s = s.replace(/<[^>]+>/g, ' ');
        s = decodeEntities(s);
        return s.replace(/\s+/g, ' ').trim();
    };

    const extractSsml = (payload) => {
        if (!payload) return '';
        if (typeof payload === 'string') return payload;
        const c = payload.content;
        if (typeof c === 'string') return c;
        return c?.ssml || c?.text || payload?.ssml || payload?.text || c?.plain || '';
    };

    const pickRuVoice = () => {
        const voices = window.speechSynthesis.getVoices() || [];
        return voices.find(v => v.lang === 'ru-RU')
            || voices.find(v => v.lang?.toLowerCase().startsWith('ru'))
            || null;
    };

    const clearListenTimers = () => {
        listenDeadlineRef.current = 0;
    };

    const stopPlayback = () => {
        try { currentSourceRef.current?.stop?.(); } catch (_) { /* noop */ }
        currentSourceRef.current = null;
        if (ttsSupported) {
            try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }
        }
    };

    // ── Persistence ────────────────────────────────────────────────────────
    const saveMessage = useCallback(async (role, text) => {
        try {
            await fetch('/ai-assistant/api/save-message/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: conversationIdRef.current,
                    message: {
                        message_id: genUUID(),
                        role,
                        content: { content_format: 'plain', text }
                    }
                })
            });
        } catch (e) {
            console.error('VoiceChat: failed to save message', e);
        }
    }, []);

    // ── TTS ────────────────────────────────────────────────────────────────
    // Browser speechSynthesis — fallback when persona TTS is unavailable.
    const speakBrowser = (text, onDone) => {
        if (!ttsSupported) { onDone && onDone(); return; }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        const voice = pickRuVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = () => onDone && onDone();
        utterance.onerror = () => onDone && onDone();
        window.speechSynthesis.speak(utterance);
    };

    // Persona voice via backend Gemini TTS; falls back to the browser voice.
    const speak = useCallback(async (text, onDone) => {
        if (!text) { onDone && onDone(); return; }
        setStatus('speaking');

        const ctx = getAudioCtx();
        if (ctx) {
            try {
                const resp = await fetch('/ai-assistant/api/tts/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        user_name: window.CURRENT_USER_NAME || 'guest'
                    })
                });
                if (!resp.ok) throw new Error(`TTS HTTP ${resp.status}`);
                const buf = await resp.arrayBuffer();
                const audioBuffer = await ctx.decodeAudioData(buf);
                if (!sessionActiveRef.current) { onDone && onDone(); return; }
                const src = ctx.createBufferSource();
                src.buffer = audioBuffer;
                src.connect(ctx.destination);
                src.onended = () => {
                    if (currentSourceRef.current === src) currentSourceRef.current = null;
                    onDone && onDone();
                };
                currentSourceRef.current = src;
                src.start();
                return;
            } catch (e) {
                // 503 (not configured), network, or decode error -> browser voice
                console.warn('VoiceChat: persona TTS unavailable, using browser voice', e);
            }
        }
        speakBrowser(text, onDone);
    }, [ttsSupported]);

    // ── One user turn ──────────────────────────────────────────────────────
    const handleUserInput = useCallback(async (transcript) => {
        if (!sessionActiveRef.current) return;
        setStatus('thinking');

        await saveMessage('user', transcript);

        let cleaned = '';
        try {
            const resp = await fetch('/ai-assistant/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: window.CURRENT_USER_NAME || 'guest',
                    input: transcript,
                    response_format: 'ssml',
                    conversation_id: conversationIdRef.current
                })
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            cleaned = stripSsml(extractSsml(data));
        } catch (e) {
            console.error('VoiceChat: agent request failed', e);
            beep('error');
            setError('Voice assistant is unavailable');
            endSession(false);
            return;
        }

        if (!sessionActiveRef.current) return;

        if (cleaned) {
            beep('ready');
            setAnswer(cleaned);
            await saveMessage('assistant', cleaned);
        }

        // Speak the answer, then listen for the next turn
        speak(cleaned, () => {
            if (sessionActiveRef.current) startListening();
        });
    }, [saveMessage, speak]);

    // ── STT (one listening turn, auto-restarts until the 10s window closes) ──
    const startListening = useCallback(() => {
        if (!sessionActiveRef.current || !sttSupported) return;

        setStatus('listening');
        listenDeadlineRef.current = Date.now() + LISTEN_WINDOW_MS;
        turnGotResultRef.current = false;

        const beginRecognition = () => {
            if (!sessionActiveRef.current) return;
            const recognition = new SpeechRecognition();
            recognition.lang = 'ru-RU';
            recognition.interimResults = false;
            recognition.continuous = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(r => r[0]?.transcript || '')
                    .join(' ')
                    .trim();
                if (!transcript) return;
                turnGotResultRef.current = true;
                clearListenTimers();
                beep('received');
                handleUserInput(transcript);
            };

            recognition.onerror = (event) => {
                // "no-speech"/"aborted" are expected during silence — keep waiting
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    beep('error');
                    setError('Microphone access is blocked');
                    endSession(false);
                }
            };

            recognition.onend = () => {
                if (!sessionActiveRef.current || turnGotResultRef.current) return;
                // Still within the listening window? keep listening. Otherwise end.
                if (Date.now() < listenDeadlineRef.current) {
                    beginRecognition();
                } else {
                    endSession(true);
                }
            };

            recognitionRef.current = recognition;
            try {
                recognition.start();
            } catch (e) {
                console.error('VoiceChat: recognition.start failed', e);
            }
        };

        beginRecognition();
    }, [sttSupported, handleUserInput]);

    // ── Session lifecycle ────────────────────────────────────────────────────
    // cue=true plays the "session ended" tone (silence timeout / cancel button);
    // navigation-away and error paths pass false to stay silent.
    const endSession = useCallback((cue = false) => {
        const wasActive = sessionActiveRef.current;
        sessionActiveRef.current = false;
        clearListenTimers();
        turnGotResultRef.current = true; // stop any pending onend restart
        try { recognitionRef.current?.abort?.(); } catch (_) { /* noop */ }
        stopPlayback();
        if (cue && wasActive) beep('end');
        setStatus('idle');
        // Surface the freshly saved conversation in the sidebar chat list
        if (typeof window.loadChats === 'function') {
            try { window.loadChats(); } catch (_) { /* noop */ }
        }
    }, [ttsSupported]);

    const startSession = useCallback(() => {
        if (sessionActiveRef.current) return;
        if (!supported) {
            setError('Voice chat is not supported in this browser');
            return;
        }
        setError(null);
        setAnswer('');
        conversationIdRef.current = genUUID();
        sessionActiveRef.current = true;
        beep('start'); // also unlocks the AudioContext on this user gesture
        startListening();
    }, [supported, startListening]);

    // Allow external navigation (leaving the voice view) to stop the session
    useEffect(() => {
        window.stopVoiceSession = () => endSession(false);
        return () => {
            endSession(false);
            if (window.stopVoiceSession) delete window.stopVoiceSession;
        };
    }, [endSession]);

    // Refresh Lucide icons when the button icons change
    useEffect(() => {
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 0);
        }
    }, [status]);

    // ── Render ───────────────────────────────────────────────────────────────
    const isActive = status !== 'idle';
    const statusLabel = {
        idle: 'Press the microphone to start',
        listening: 'Listening…',
        thinking: 'Thinking…',
        speaking: 'Speaking…'
    }[status];

    if (!supported) {
        return React.createElement('div', {
            className: 'h-full w-full flex items-center justify-center text-center px-6'
        }, React.createElement('p', {
            className: 'text-white/70 max-w-md'
        }, 'Voice chat needs a browser with Speech Recognition and Speech Synthesis (Chrome or Edge), served over HTTPS or localhost.'));
    }

    const orbStateClass = status === 'listening'
        ? 'voice-orb--listening'
        : status === 'speaking' ? 'voice-orb--speaking' : '';

    return React.createElement('div', {
        className: 'relative h-full w-full overflow-hidden'
    }, [
        // Breathing planet — dead center of the view (never moves)
        React.createElement('div', {
            key: 'orb-wrap',
            className: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
        }, React.createElement('div', {
            className: `voice-orb ${orbStateClass}`
        })),

        // Status + answer text, centered horizontally above the planet
        React.createElement('div', {
            key: 'stage',
            className: 'absolute left-1/2 -translate-x-1/2 top-[16%] w-full max-w-2xl px-6 flex flex-col items-center gap-4 text-center pointer-events-none'
        }, [
            React.createElement('div', {
                key: 'status',
                className: `text-sm uppercase tracking-widest ${
                    isActive ? 'text-cyan-300/80' : 'text-white/40'
                }`
            }, statusLabel),
            answer && React.createElement('div', {
                key: 'answer',
                className: 'max-w-2xl text-xl md:text-2xl leading-relaxed text-white/90 bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4'
            }, answer),
            error && React.createElement('div', {
                key: 'error',
                className: 'text-red-400 text-sm'
            }, error)
        ]),

        // Bottom controls: microphone (left) + cancel (right)
        React.createElement('div', {
            key: 'controls',
            className: 'absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-md px-6 flex items-center justify-between'
        }, [
            React.createElement('button', {
                key: 'mic',
                type: 'button',
                onClick: startSession,
                disabled: isActive,
                title: 'Start voice chat',
                'aria-label': 'Start voice chat',
                className: `w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
                    isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 animate-pulse cursor-default'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`
            }, React.createElement('i', {
                'data-lucide': 'mic',
                className: 'w-6 h-6'
            })),
            React.createElement('button', {
                key: 'cancel',
                type: 'button',
                onClick: () => endSession(true),
                disabled: !isActive,
                title: 'Stop voice chat',
                'aria-label': 'Stop voice chat',
                className: `w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
                    isActive
                        ? 'bg-red-500/20 text-red-300 border-red-400/40 hover:bg-red-500/30'
                        : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                }`
            }, React.createElement('i', {
                'data-lucide': 'x',
                className: 'w-6 h-6'
            }))
        ])
    ]);
};

// Mount into the voice view root
document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('voice-assistant-root');
    if (el && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        try {
            ReactDOM.createRoot(el).render(React.createElement(VoiceChat));
        } catch (e) {
            console.error('Failed to initialize VoiceChat:', e);
        }
    }
});
