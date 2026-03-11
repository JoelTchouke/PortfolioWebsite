import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import './../css/terminal.css';

export default function TerminalPage({ onNavigate }) {
  const containerRef = useRef(null);
  const termRef      = useRef(null);
  const socketRef    = useRef(null);
  const fitAddonRef  = useRef(null);

  useEffect(() => {
    // ── 1. Create xterm instance ──────────────────────────────────
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      theme: {
        background:      '#0a0a0a',
        foreground:      '#e8e8e8',
        cursor:          '#b41c10',
        cursorAccent:    '#0a0a0a',
        black:           '#1a1a1a',
        red:             '#b41c10',
        green:           '#4caf72',
        yellow:          '#e8b84b',
        blue:            '#4a8fd4',
        magenta:         '#9c6fb5',
        cyan:            '#4ab5b5',
        white:           '#e8e8e8',
        brightBlack:     '#444444',
        brightRed:       '#d42212',
        brightGreen:     '#5dcc88',
        brightYellow:    '#f0c960',
        brightBlue:      '#5a9fe4',
        brightMagenta:   '#b07fc5',
        brightCyan:      '#5ac5c5',
        brightWhite:     '#ffffff',
        selectionBackground: 'rgba(180,28,16,0.3)',
      },
      allowTransparency: true,
      scrollback: 5000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    
    fitAddon.fit();
    termRef.current    = term;
    fitAddonRef.current = fitAddon;

    // ── 2. Connect to WebSocket server ────────────────────────────
    const WS_URL = process.env.REACT_APP_TERMINAL_WS_URL || 'ws://localhost:3002';
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'resize',
        cols: term.cols,
        rows: term.rows,
      }));

      // Give the shell a moment to start then refit + focus
      setTimeout(() => {
        fitAddon.fit();
        term.focus();
      }, 300);
    };

    socket.onmessage = (event) => {
      // Data from the shell → write to terminal
      term.write(event.data);
    };

    socket.onclose = () => {
      term.write('\r\n\x1b[31mConnection closed.\x1b[0m\r\n');
    };

    socket.onerror = () => {
      term.write('\r\n\x1b[31mCould not connect to terminal server.\x1b[0m\r\n');
    };

    // ── 3. Terminal input → send to shell ─────────────────────────
    term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'input', data }));
      }
    });

    // ── 4. Terminal resize → notify shell ─────────────────────────
    term.onResize(({ cols, rows }) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    });

    // ── 5. Window resize → refit terminal ─────────────────────────
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    // Focus terminal
    term.focus();

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="terminalPage">
      {/* Top bar */}
      <div className="terminalPage__bar">
        <div className="terminalPage__bar-dots">
          <span className="tpDot tpDot--red"
            onClick={() => onNavigate && onNavigate('main')}
            title="Exit terminal"
          />
          <span className="tpDot tpDot--yellow" />
          <span className="tpDot tpDot--green" />
        </div>
        <span className="terminalPage__bar-title">
          bash — tchouke@portfolio
        </span>
        <button
          className="terminalPage__bar-back"
          onClick={() => onNavigate && onNavigate('main')}
        >
          ← BACK TO SITE
        </button>
      </div>

      {/* xterm mount point */}
      <div className="terminalPage__xterm" ref={containerRef} />
    </div>
  );
}