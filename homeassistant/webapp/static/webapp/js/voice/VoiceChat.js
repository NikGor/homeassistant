// VoiceChat — real-time, hands-free voice assistant.
//
// Flow (one session == one saved conversation):
//   mic press -> listen (STT, ru-RU) -> send {input, response_format: "ssml"}
//   to the agent -> receive SSML -> strip tags -> speak via TTS + show on screen
//   -> listen again. After 10s of silence, or on the cancel (X) button, the
//   session ends. Every turn is persisted to the same conversation.

const VoiceChat = () => {
    const { useState, useRef, useEffect, useCallback } = React;

    const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(null);

    // Browser capability checks
    const SpeechRecognition = typeof window !== 'undefined'
        ? (window.SpeechRecognition || window.webkitSpeechRecognition)
        : undefined;
    const sttSupported = !!SpeechRecognition;
    const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const supported = sttSupported && ttsSupported;

    // Session refs (kept in refs so async callbacks always see fresh values)
    const sessionActiveRef = useRef(false);
    const conversationIdRef = useRef(null);
    const recognitionRef = useRef(null);
    const listenDeadlineRef = useRef(0);
    const turnGotResultRef = useRef(false);

    const LISTEN_WINDOW_MS = 10000; // end the session after 10s of silence

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
    const speak = useCallback((text, onDone) => {
        if (!text) { onDone && onDone(); return; }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        const voice = pickRuVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = () => onDone && onDone();
        utterance.onerror = () => onDone && onDone();
        setStatus('speaking');
        window.speechSynthesis.speak(utterance);
    }, []);

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
            setError('Voice assistant is unavailable');
            endSession();
            return;
        }

        if (!sessionActiveRef.current) return;

        if (cleaned) {
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
                handleUserInput(transcript);
            };

            recognition.onerror = (event) => {
                // "no-speech"/"aborted" are expected during silence — keep waiting
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setError('Microphone access is blocked');
                    endSession();
                }
            };

            recognition.onend = () => {
                if (!sessionActiveRef.current || turnGotResultRef.current) return;
                // Still within the listening window? keep listening. Otherwise end.
                if (Date.now() < listenDeadlineRef.current) {
                    beginRecognition();
                } else {
                    endSession();
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
    const endSession = useCallback(() => {
        sessionActiveRef.current = false;
        clearListenTimers();
        turnGotResultRef.current = true; // stop any pending onend restart
        try { recognitionRef.current?.abort?.(); } catch (_) { /* noop */ }
        if (ttsSupported) window.speechSynthesis.cancel();
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
        startListening();
    }, [supported, startListening]);

    // Allow external navigation (leaving the voice view) to stop the session
    useEffect(() => {
        window.stopVoiceSession = endSession;
        return () => {
            endSession();
            if (window.stopVoiceSession === endSession) delete window.stopVoiceSession;
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
                onClick: endSession,
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
