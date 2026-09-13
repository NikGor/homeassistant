// VoiceChat — real-time, hands-free voice assistant.
//
// Flow (one session == one saved conversation):
//   mic press -> listen (STT, ru-RU) -> send {input, response_format:"gemini_tts"}
//   to the agent -> receive a director's-note + transcript block -> feed the whole
//   block verbatim to the persona's Gemini voice (POST /ai-assistant/api/tts/,
//   browser speechSynthesis fallback), show only the transcript on screen ->
//   listen again. After 10s of silence, or on the cancel (X) button, the session
//   ends. Every turn is persisted to the same conversation.
//
// Audio cues are the real WAV samples the Pi assistant uses (start/received/
// ready/end + looped thinking), with synthesized tones as fallback. Persona voice
// resolves from the user's persona server-side (same mapping as archie-voice).

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
    const currentSourceRef = useRef(null); // active answer BufferSource, for stop()
    const cueBuffersRef = useRef({}); // cue type -> decoded AudioBuffer (cached)
    const thinkingSourceRef = useRef(null); // looping "thinking" cue source
    const micStreamRef = useRef(null); // getUserMedia stream for recording the user
    const recorderRef = useRef(null); // MediaRecorder for the current utterance
    const recChunksRef = useRef([]); // recorded chunks for the current utterance

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

    // Real WAV cue samples (same files the Pi assistant uses), resolved to
    // hashed static URLs in the template. Fetched + decoded once, then cached.
    const loadCueBuffer = async (type) => {
        if (cueBuffersRef.current[type]) return cueBuffersRef.current[type];
        const url = (window.VOICE_CUE_URLS || {})[type];
        const ctx = getAudioCtx();
        if (!url || !ctx) return null;
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`cue HTTP ${resp.status}`);
            const buf = await ctx.decodeAudioData(await resp.arrayBuffer());
            cueBuffersRef.current[type] = buf;
            return buf;
        } catch (e) {
            console.warn(`VoiceChat: cue "${type}" load failed, using tone`, e);
            return null;
        }
    };

    // Warm the cache on session start so cues fire without a decode delay.
    const preloadCues = () => {
        ['start', 'received', 'ready', 'end', 'thinking'].forEach(loadCueBuffer);
    };

    const playCueBuffer = (ctx, buffer, loop = false) => {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = loop;
        src.connect(ctx.destination);
        src.start();
        return src;
    };

    // Synthesized fallback for when a WAV cue has no URL (error) or fails to load.
    const TONE_CUES = {
        start: [[660, 0, 0.12], [880, 0.10, 0.14]],
        received: [[540, 0, 0.11]],
        ready: [[784, 0, 0.13]],
        end: [[540, 0, 0.11], [340, 0.10, 0.17]],
        error: [[220, 0, 0.28, 0.12]],
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

    const toneFallback = (type) => {
        const ctx = getAudioCtx();
        const seq = TONE_CUES[type];
        if (!ctx || !seq) return;
        const t0 = ctx.currentTime + 0.01;
        seq.forEach(([f, off, dur, peak]) => tone(ctx, f, t0 + off, dur, peak));
    };

    // Play a one-shot cue: prefer the WAV sample, fall back to a tone.
    const beep = (type) => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const buf = cueBuffersRef.current[type];
        if (buf) { playCueBuffer(ctx, buf); return; }
        if ((window.VOICE_CUE_URLS || {})[type]) {
            loadCueBuffer(type).then((b) => {
                const c = getAudioCtx();
                if (b && c) playCueBuffer(c, b);
                else toneFallback(type);
            });
            return;
        }
        toneFallback(type);
    };

    // Loop the "thinking" cue while waiting for the agent (matches the Pi).
    const startThinking = () => {
        stopThinking();
        const ctx = getAudioCtx();
        if (!ctx) return;
        const buf = cueBuffersRef.current['thinking'];
        if (buf) {
            thinkingSourceRef.current = playCueBuffer(ctx, buf, true);
            return;
        }
        loadCueBuffer('thinking').then((b) => {
            const c = getAudioCtx();
            if (b && c && sessionActiveRef.current && !thinkingSourceRef.current) {
                thinkingSourceRef.current = playCueBuffer(c, b, true);
            }
        });
    };

    const stopThinking = () => {
        try { thinkingSourceRef.current?.stop?.(); } catch (_) { /* noop */ }
        thinkingSourceRef.current = null;
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

    // gemini_tts marker separating the director's note from the spoken transcript.
    const TRANSCRIPT_RE = /##\s*Transcript:\s*/i;

    // What to feed the TTS engine: the whole gemini_tts block verbatim — the
    // director's note + [inline tags] IS the prompt (Gemini reads it as style and
    // speaks only the transcript). Mirrors archie-voice agent.for_tts().
    const forTts = (raw) => {
        if (!raw) return '';
        return decodeEntities(String(raw)).trim(); // keep note + tags, unescape only
    };

    // What to show/persist: the spoken words only — keep the "## Transcript:"
    // section, drop <tags> and [inline tags]. Mirrors agent.for_display().
    const forDisplay = (raw) => {
        if (!raw) return '';
        let text = String(raw);
        const parts = text.split(TRANSCRIPT_RE);
        if (parts.length >= 2) text = parts.slice(1).join(' ');
        text = text.replace(/<[^>]+>/g, ' ').replace(/\[[^\]]*\]/g, ' ');
        text = decodeEntities(text);
        return text.replace(/\s+/g, ' ').trim();
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
        stopThinking();
        try { currentSourceRef.current?.stop?.(); } catch (_) { /* noop */ }
        currentSourceRef.current = null;
        if (ttsSupported) {
            try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }
        }
    };

    // ── User audio recording (MediaRecorder alongside SpeechRecognition) ─────
    // SpeechRecognition yields only text, so to keep the user's actual recording
    // we capture the mic in parallel with a MediaRecorder, one clip per utterance.
    const ensureMicStream = async () => {
        if (micStreamRef.current) return micStreamRef.current;
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
            return null;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;
            return stream;
        } catch (e) {
            console.warn('VoiceChat: mic for recording unavailable', e);
            return null;
        }
    };

    const startUserRecording = async () => {
        // Wait for the mic stream so the first utterance is recorded too (getUserMedia
        // may still be resolving when the first recognition turn begins).
        const stream = await ensureMicStream();
        if (!stream || typeof MediaRecorder === 'undefined' || !sessionActiveRef.current) {
            return;
        }
        // Discard any previous recorder (e.g. a silent retry within the window).
        const prev = recorderRef.current;
        if (prev && prev.state !== 'inactive') {
            prev.onstop = null;
            try { prev.stop(); } catch (_) { /* noop */ }
        }
        try {
            const rec = new MediaRecorder(stream);
            recChunksRef.current = [];
            rec.ondataavailable = (e) => {
                if (e.data && e.data.size) recChunksRef.current.push(e.data);
            };
            rec.start();
            recorderRef.current = rec;
        } catch (e) {
            console.warn('VoiceChat: MediaRecorder start failed', e);
        }
    };

    // Stop the current recorder and resolve with its Blob (or null).
    const stopUserRecording = () => new Promise((resolve) => {
        const rec = recorderRef.current;
        recorderRef.current = null;
        if (!rec || rec.state === 'inactive') { resolve(null); return; }
        rec.onstop = () => {
            const chunks = recChunksRef.current;
            recChunksRef.current = [];
            resolve(chunks.length ? new Blob(chunks, { type: rec.mimeType || 'audio/webm' }) : null);
        };
        try { rec.stop(); } catch (_) { resolve(null); }
    });

    const releaseMicStream = () => {
        try { micStreamRef.current?.getTracks().forEach(t => t.stop()); } catch (_) { /* noop */ }
        micStreamRef.current = null;
    };

    // ── Persistence ────────────────────────────────────────────────────────
    // Save a message and return its id (so the caller can attach an audio clip).
    const saveMessage = useCallback(async (role, text) => {
        const messageId = genUUID();
        try {
            await fetch('/ai-assistant/api/save-message/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: conversationIdRef.current,
                    message: {
                        message_id: messageId,
                        role,
                        content: { content_format: 'plain', text }
                    }
                })
            });
        } catch (e) {
            console.error('VoiceChat: failed to save message', e);
        }
        return messageId;
    }, []);

    // Attach a voice recording (Blob) to a saved message.
    const uploadAudio = async (messageId, blob) => {
        if (!messageId || !blob || !blob.size) return;
        try {
            await fetch(`/ai-assistant/api/messages/${messageId}/audio/`, {
                method: 'POST',
                headers: { 'Content-Type': blob.type || 'audio/webm' },
                body: blob
            });
        } catch (e) {
            console.error('VoiceChat: audio upload failed', e);
        }
    };

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

    // Fetch persona-voice TTS as raw WAV bytes (for both playback and saving);
    // returns an ArrayBuffer, or null when the backend TTS is unavailable.
    const synthTts = async (text) => {
        if (!text) return null;
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
            return await resp.arrayBuffer();
        } catch (e) {
            console.warn('VoiceChat: persona TTS unavailable', e);
            return null;
        }
    };

    // Play WAV bytes through the AudioContext; returns true if playback started.
    const playWav = async (arrayBuffer, onDone) => {
        const ctx = getAudioCtx();
        if (!ctx || !arrayBuffer) return false;
        try {
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
            if (!sessionActiveRef.current) { onDone && onDone(); return true; }
            const src = ctx.createBufferSource();
            src.buffer = audioBuffer;
            src.connect(ctx.destination);
            src.onended = () => {
                if (currentSourceRef.current === src) currentSourceRef.current = null;
                onDone && onDone();
            };
            currentSourceRef.current = src;
            src.start();
            return true;
        } catch (e) {
            console.warn('VoiceChat: WAV playback failed', e);
            return false;
        }
    };

    // ── One user turn ──────────────────────────────────────────────────────
    const handleUserInput = useCallback(async (transcript) => {
        if (!sessionActiveRef.current) return;
        setStatus('thinking');
        startThinking();

        // Finish the user's recording, save the message, attach the clip.
        const userBlob = await stopUserRecording();
        const userMsgId = await saveMessage('user', transcript);
        if (userBlob) uploadAudio(userMsgId, userBlob);

        let spoken = '';   // verbatim gemini_tts block (note + tags) for the TTS
        let display = '';  // transcript only, for the screen + persistence
        try {
            const resp = await fetch('/ai-assistant/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: window.CURRENT_USER_NAME || 'guest',
                    input: transcript,
                    response_format: 'gemini_tts',
                    conversation_id: conversationIdRef.current
                })
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const raw = extractSsml(data);
            spoken = forTts(raw);
            display = forDisplay(raw);
        } catch (e) {
            console.error('VoiceChat: agent request failed', e);
            stopThinking();
            beep('error');
            setError('Voice assistant is unavailable');
            endSession(false);
            return;
        }

        // Synthesize the answer up front so we can both save and play the audio.
        const wavBuf = await synthTts(spoken || display);

        stopThinking();
        if (!sessionActiveRef.current) return;

        if (spoken || display) {
            beep('ready');
            if (display) setAnswer(display);
            const asstMsgId = await saveMessage('assistant', display || '');
            if (wavBuf) uploadAudio(asstMsgId, new Blob([wavBuf], { type: 'audio/wav' }));
        }

        // Speak the answer (director's note styles it), then listen for the next turn.
        setStatus('speaking');
        const onDone = () => { if (sessionActiveRef.current) startListening(); };
        const played = wavBuf ? await playWav(wavBuf, onDone) : false;
        if (!played) speakBrowser(display || '', onDone);
    }, [saveMessage]);

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
            startUserRecording(); // record this utterance in parallel with STT
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
        stopUserRecording();
        releaseMicStream();
        stopPlayback();
        if (cue && wasActive) beep('end');
        setStatus('idle');
        // Surface the freshly saved conversation in the sidebar chat list
        if (typeof window.loadChats === 'function') {
            try { window.loadChats(); } catch (_) { /* noop */ }
        }
    }, [ttsSupported]);

    const startSession = useCallback(async () => {
        if (sessionActiveRef.current) return;
        if (!supported) {
            setError('Voice chat is not supported in this browser');
            return;
        }
        setError(null);
        setAnswer('');
        conversationIdRef.current = genUUID();
        sessionActiveRef.current = true;
        preloadCues();  // unlocks the AudioContext on this user gesture + warms cache
        beep('start');
        // Acquire the mic up front so the first utterance is recorded (not just STT).
        await ensureMicStream();
        if (!sessionActiveRef.current) return; // cancelled during the permission prompt
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
