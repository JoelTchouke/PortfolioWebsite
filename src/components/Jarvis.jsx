import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import './../css/jarvis.css';

const SUGGESTIONS = [
  'What is Joel working on?',
  'What are his skills?',
  'Is he available for hire?',
];

const API = process.env.REACT_APP_API_URL || '';


function stripMarkdown(text) {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n{2,}/g, '. ')
    .trim();
}

export default function Jarvis() {
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [interim,       setInterim]       = useState('');   // live transcript preview
  const [loading,       setLoading]       = useState(false);
  const [voiceMode,     setVoiceMode]     = useState(false);
  const [speaking,      setSpeaking]      = useState(false);
  const [listening,     setListening]     = useState(false);
  const [showVoiceHint, setShowVoiceHint] = useState(false);

  const scrollRef      = useRef(null);   // messages scroll container
  const audioRef       = useRef(null);
  const recognitionRef = useRef(null);
  // Always-current refs to avoid stale closures inside speech callbacks
  const messagesLive   = useRef([]);
  const loadingLive    = useRef(false);
  const voiceLive      = useRef(false);

  useEffect(() => { messagesLive.current = messages; }, [messages]);
  useEffect(() => { loadingLive.current  = loading;  }, [loading]);
  useEffect(() => { voiceLive.current    = voiceMode; }, [voiceMode]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!voiceMode) {
      audioRef.current?.pause();
      setSpeaking(false);
      stopListening();
    }
  }, [voiceMode]);

  const speak = async (text) => {
    voiceLive.current = voiceMode; // sync before check
    if (!voiceLive.current) return;
    audioRef.current?.pause();
    setSpeaking(true);
    try {
      const res = await fetch(`${API}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: stripMarkdown(text) }),
      });
      if (!res.ok) throw new Error();

      // Stream audio: start playback as first chunks arrive instead of waiting for full download
      const mediaSource = new MediaSource();
      const url = URL.createObjectURL(mediaSource);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setSpeaking(false);

      await new Promise(resolve => mediaSource.addEventListener('sourceopen', resolve, { once: true }));
      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

      audio.play().catch(() => setSpeaking(false));

      const reader = res.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          if (!sourceBuffer.updating) mediaSource.endOfStream();
          else sourceBuffer.addEventListener('updateend', () => mediaSource.endOfStream(), { once: true });
          return;
        }
        if (sourceBuffer.updating)
          await new Promise(r => sourceBuffer.addEventListener('updateend', r, { once: true }));
        sourceBuffer.appendBuffer(value);
        await new Promise(r => sourceBuffer.addEventListener('updateend', r, { once: true }));
        await pump();
      };
      await pump();
    } catch {
      setSpeaking(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setListening(false);
    setInterim('');
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition is not supported in this browser. Try Chrome.'); return; }
    if (listening) { stopListening(); return; }

    audioRef.current?.pause();
    setSpeaking(false);

    const rec = new SR();
    rec.lang            = 'en-US';
    rec.continuous      = true;    // keep listening until user stops
    rec.interimResults  = true;    // show live preview

    rec.onresult = (e) => {
      let interimText = '';
      let finalText   = '';
      for (const result of e.results) {
        if (result.isFinal) finalText  += result[0].transcript;
        else                interimText += result[0].transcript;
      }
      setInterim(interimText);
      if (finalText.trim()) {
        stopListening();
        sendText(finalText.trim());
      }
    };

    rec.onerror = (e) => {
      console.warn('Speech error:', e.error);
      setListening(false);
      setInterim('');
      recognitionRef.current = null;
    };
    rec.onend = () => {
      // If still in listening state but no result yet, restart (handles browser auto-stop)
      if (recognitionRef.current) {
        try { rec.start(); } catch { /* already stopped */ }
      } else {
        setListening(false);
        setInterim('');
      }
    };

    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  // Use a stable function that reads from refs to avoid stale closures
  const sendText = async (userText) => {
    if (!userText || loadingLive.current) return;
    setInput('');
    setInterim('');

    const next = [...messagesLive.current, { role: 'user', content: userText }];
    messagesLive.current = next;
    setMessages(next);
    loadingLive.current = true;
    setLoading(true);

    try {
      const res  = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data  = await res.json();
      const reply = data.reply || data.error || 'No response received.';
      const updated = [...messagesLive.current, { role: 'assistant', content: reply }];
      messagesLive.current = updated;
      setMessages(updated);
      speak(reply);
    } catch {
      const err = 'Connection error. Try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: err }]);
    } finally {
      loadingLive.current = false;
      setLoading(false);
    }
  };

  const send = (text) => sendText(typeof text === 'string' && text ? text : input.trim());

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const toggleVoiceMode = () => {
    if (!voiceMode) setShowVoiceHint(true);
    setVoiceMode(v => !v);
  };

  return (
    <div className="jarvis">
      <div className="jarvis__header">
        <div className="jarvis__title-row">
          <span className="jarvis__label">Jarvis</span>
          <span className={`jarvis__dot${speaking ? ' jarvis__dot--speaking' : ''}`} />
          <button
            className={`jarvis__voice-toggle${voiceMode ? ' jarvis__voice-toggle--on' : ''}`}
            onClick={toggleVoiceMode}
            title={voiceMode ? 'Disable voice mode' : 'Enable voice mode — speak to Jarvis & hear responses'}
          >
            {voiceMode ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{voiceMode ? 'VOICE ON' : 'VOICE'}</span>
          </button>
        </div>

        {showVoiceHint && voiceMode && (
          <p className="jarvis__voice-hint" onClick={() => setShowVoiceHint(false)}>
            Voice mode active — Jarvis will speak responses. Use the mic button to talk.
          </p>
        )}

        <p className="jarvis__subtitle">Ask anything about Joel</p>
      </div>

      <div className="jarvis__messages" ref={scrollRef} onWheel={(e) => e.stopPropagation()}>
        {messages.length === 0 && (
          <div className="jarvis__empty">
            <p className="jarvis__empty-text">
              I'm Jarvis — I can tell you about Joel's background, work, and availability.
            </p>
            <div className="jarvis__suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="jarvis__suggestion" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`jarvis__msg jarvis__msg--${m.role}`}>
            {m.role === 'assistant' && <span className="jarvis__msg-label">Jarvis</span>}
            {m.role === 'assistant'
              ? <div className="jarvis__md"><ReactMarkdown>{m.content}</ReactMarkdown></div>
              : <p>{m.content}</p>
            }
          </div>
        ))}

        {/* Live speech transcript preview */}
        {interim && (
          <div className="jarvis__msg jarvis__msg--user jarvis__msg--interim">
            <p>{interim}<span className="jarvis__interim-cursor">|</span></p>
          </div>
        )}

        {loading && (
          <div className="jarvis__msg jarvis__msg--assistant">
            <span className="jarvis__msg-label">Jarvis</span>
            <div className="jarvis__typing">
              <span /><span /><span />
            </div>
          </div>
        )}

      </div>

      <div className="jarvis__input-row">
        {voiceMode && (
          <button
            className={`jarvis__mic${listening ? ' jarvis__mic--active' : ''}`}
            onClick={startListening}
            title={listening ? 'Listening… click to cancel' : 'Click to speak'}
            disabled={loading}
          >
            {listening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        )}
        <input
          className="jarvis__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={listening ? 'Listening — speak now…' : voiceMode ? 'Type or use mic…' : 'Ask me anything…'}
          disabled={loading || listening}
        />
        <button
          className="jarvis__send"
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
