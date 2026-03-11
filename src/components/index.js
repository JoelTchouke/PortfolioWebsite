const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const pty = require('node-pty');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');

const PORT = process.env.PORT || 3002;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
const DOCKER_IMAGE = process.env.DOCKER_IMAGE || 'tchouke-terminal';
const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS || '10', 10);

let activeSessions = 0;

const wss = new WebSocketServer({ port: PORT });

console.log(`[terminal-server] Listening on ws://0.0.0.0:${PORT}`);
console.log(`[terminal-server] Docker image: ${DOCKER_IMAGE}`);
console.log(`[terminal-server] Max sessions: ${MAX_SESSIONS}`);

function removeContainer(containerName) {
  return new Promise((resolve) => {
    execFile('docker', ['rm', '-f', containerName], (err, stdout, stderr) => {
      if (err) {
        // Not fatal. Container may already be gone.
        console.warn(`[terminal-server] docker rm -f ${containerName} -> ${err.message}`);
      } else {
        console.log(`[terminal-server] Removed container: ${containerName}`);
      }
      resolve();
    });
  });
}

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;

  if (ALLOWED_ORIGIN !== '*' && origin !== ALLOWED_ORIGIN) {
    console.warn(`[terminal-server] Rejected origin: ${origin}`);
    ws.close(1008, 'Origin not allowed');
    return;
  }

  if (activeSessions >= MAX_SESSIONS) {
    ws.send('\r\n\x1b[31mServer is busy. Try again in a moment.\x1b[0m\r\n');
    ws.close();
    return;
  }

  activeSessions++;

  const sessionId = crypto.randomUUID().slice(0, 8);
  const containerName = `terminal-${Date.now()}-${sessionId}`;

  console.log(
    `[terminal-server] New session ${containerName} from ${req.socket.remoteAddress} (${activeSessions}/${MAX_SESSIONS} active)`
  );

  const ptyProcess = pty.spawn(
    'docker',
    [
      'run',
      '--rm',
      '-i',
      '-t',
      '--name', containerName,
      '--label', 'app=tchouke-terminal',
      '--label', `session=${sessionId}`,
      '--network', 'none',
      '--memory', '64m',
      '--cpus', '0.5',
      '--pids-limit', '50',
      DOCKER_IMAGE,
      '/bin/bash',
      '--login',
    ],
    {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: os.homedir(),
      env: { ...process.env, TERM: 'xterm-256color' },
    }
  );

  let cleanedUp = false;

  const sessionTimer = setTimeout(async () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('\r\n\x1b[31mSession timeout (3 hours). Goodbye, investigator.\x1b[0m\r\n');
      ws.close();
    }
    await cleanup('timeout');
  }, 3 * 60 * 60 * 1000);

  async function cleanup(reason) {
    if (cleanedUp) return;
    cleanedUp = true;

    clearTimeout(sessionTimer);

    console.log(`[terminal-server] Cleaning up ${containerName} (${reason})`);

    try {
      ptyProcess.kill();
    } catch (_) {}

    await removeContainer(containerName);

    activeSessions = Math.max(0, activeSessions - 1);
    console.log(`[terminal-server] Session closed — ${activeSessions}/${MAX_SESSIONS} active`);
  }

  ptyProcess.onData((data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  ptyProcess.onExit(async ({ exitCode }) => {
    console.log(`[terminal-server] PTY exited for ${containerName} with code ${exitCode}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    await cleanup(`pty-exit:${exitCode}`);
  });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.type === 'input') {
        ptyProcess.write(msg.data);
      }

      if (msg.type === 'resize') {
        ptyProcess.resize(
          Math.max(1, Math.min(msg.cols, 300)),
          Math.max(1, Math.min(msg.rows, 100))
        );
      }
    } catch (_) {
      ptyProcess.write(raw.toString());
    }
  });

  ws.on('close', async () => {
    console.log(`[terminal-server] Client disconnected for ${containerName}`);
    await cleanup('ws-close');
  });

  ws.on('error', async (err) => {
    console.error(`[terminal-server] Error for ${containerName}:`, err.message);
    await cleanup('ws-error');
  });
});