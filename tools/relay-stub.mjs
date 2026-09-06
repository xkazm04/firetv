/**
 * A development stand-in for the cloud relay.
 *
 * The TV dials in at `/tv`, the phone loads the companion page from `/` and connects at `/ws`,
 * and this forwards frames between them. That is the entire contract, and it is deliberately the
 * entire contract: the relay must stay dumb, because every piece of meaning it learns is a piece
 * of the viewer's session leaving their living room. The PIN check, the annotation document and
 * the video all stay on the TV.
 *
 * In production this is API Gateway WebSocket plus a Lambda that does the same forwarding. The TV
 * code does not change — only the URL does.
 *
 * Port 9787 by default. Avoid 9010: Logitech G HUB listens there, and Windows lets a second
 * process bind the same port without an error, so the symptom is not "address in use" but empty
 * responses from a server that looks like it started fine.
 *
 * Usage: node relay-stub.mjs [--port 9787]
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { WebSocketServer } from 'ws';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith('--') ? [[a.slice(2), all[i + 1]]] : []))
);
const PORT = Number(args.port ?? 9787);

// Served from the repo so the relay path exercises the same page the TV serves over LAN.
const COMPANION = path.join(here, '..', 'companion', 'index.html');

let tv = null;
let pen = null;
/** Last state message seen from the TV, so the harness has something to poll. */
let lastState = null;

const log = (...a) => console.log('[relay]', ...a);

const http = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        relay: true,
        tvConnected: !!tv,
        penConnected: !!pen,
        // Everything below is whatever the TV last told the phone. The relay does not compute it.
        ...(lastState ?? {}),
      })
    );
    return;
  }
  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(readFileSync(COMPANION));
    return;
  }
  res.writeHead(404).end('not found');
});

const wss = new WebSocketServer({ noServer: true });

http.on('upgrade', (req, socket, head) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  if (pathname !== '/tv' && pathname !== '/ws') {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => attach(ws, pathname === '/tv' ? 'tv' : 'pen'));
});

function attach(ws, role) {
  log(role, 'connected');
  if (role === 'tv') {
    tv?.close();
    tv = ws;
  } else {
    pen?.close();
    pen = ws;
  }

  ws.on('message', (raw) => {
    const text = raw.toString();

    if (role === 'tv') {
      // Peek only at state, and only to answer /health. Everything else is forwarded unread.
      try {
        const m = JSON.parse(text);
        if (m.type === 'state') {
          const { thumbnail, ...rest } = m;
          lastState = rest;
        }
      } catch {
        // Not our business if it does not parse; the TV and the phone share the schema, not us.
      }
    }

    const other = role === 'tv' ? pen : tv;
    if (other && other.readyState === other.OPEN) other.send(text);
  });

  ws.on('close', () => {
    log(role, 'disconnected');
    if (role === 'tv' && tv === ws) {
      tv = null;
      lastState = null;
    }
    if (role === 'pen' && pen === ws) pen = null;
  });

  ws.on('error', (e) => log(role, 'error', e.message));
}

http.on('error', (e) => {
  console.error(`[relay] cannot listen on ${PORT}: ${e.message}`);
  process.exit(1);
});

http.listen(PORT, '0.0.0.0', () => {
  log(`listening on http://0.0.0.0:${PORT}`);
  log(`  TV dials      ws://<host>:${PORT}/tv`);
  log(`  phone opens   http://<host>:${PORT}/`);
});
