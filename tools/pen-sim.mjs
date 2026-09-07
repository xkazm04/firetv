/**
 * Headless "phone": speaks the pen protocol straight to the TV app's embedded WebSocket server.
 *
 * This is the fast inner-loop check — no browser, no touch emulation — that the transport, the
 * codec and the pen engine agree with each other on a real device.
 *
 * Usage: node pen-sim.mjs [--host <ip>:8765] [--shape arc|arrow|circle|spotlight]
 */
import WebSocket from 'ws';
import { TV_HOST } from './device.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith('--') ? [[a.slice(2), all[i + 1]]] : []))
);
const host = args.host ?? TV_HOST;
const shape = args.shape ?? 'arc';

const ws = new WebSocket(`ws://${host}/ws`);
const seen = { welcome: false, accepted: false, states: 0, lastState: null };

// The TV rotates a PIN per session and rejects a pen that cannot quote it, so read it from the
// same health endpoint a human would read off the QR card.
const pin = await fetch(`http://${host}/health`)
  .then((r) => r.json())
  .then((h) => h.pin)
  .catch(() => {
    console.error('[pen-sim] cannot reach the TV at', host);
    process.exit(2);
  });

const send = (o) => ws.send(JSON.stringify(o));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

ws.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.type === 'welcome') {
    seen.welcome = true;
    seen.accepted = m.accepted;
    if (!m.accepted) {
      console.error('[pen-sim] pairing rejected:', m.reason);
      process.exit(1);
    }
  }
  if (m.type === 'state') {
    seen.states++;
    seen.lastState = m;
  }
});

ws.on('error', (e) => {
  console.error('[pen-sim] connection failed:', e.message);
  process.exit(2);
});

ws.on('open', async () => {
  console.log(`[pen-sim] connected to ws://${host}/ws`);
  send({ type: 'hello', pin, clientId: 'pen-sim' });
  await sleep(300);

  // Pause first: telestration is a paused-frame activity, and a still frame makes the
  // screenshot assertion deterministic.
  send({ type: 'transport', cmd: 'pause' });
  await sleep(500);

  const t0 = Date.now();
  if (shape === 'arc') {
    // A big yellow arc across the middle of the picture, drawn the way a finger would:
    // one down, a run of batched moves, one up.
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const p = i / 40;
      pts.push([0.15 + 0.7 * p, 0.65 - 0.35 * Math.sin(Math.PI * p), 0.6, Date.now()]);
    }
    send({ type: 'pen', phase: 'down', tool: 'freehand', color: '#FFD400', pts: [pts[0]] });
    for (let i = 1; i < pts.length; i += 4) {
      send({ type: 'pen', phase: 'move', tool: 'freehand', color: '#FFD400', pts: pts.slice(i, i + 4) });
      await sleep(16);
    }
    send({ type: 'pen', phase: 'up', tool: 'freehand', color: '#FFD400', pts: [pts.at(-1)] });
  } else {
    send({ type: 'shape', tool: shape, from: [0.35, 0.45], to: [0.65, 0.6], color: '#FFD400' });
  }

  await sleep(1200);
  const rtt = Date.now() - t0;

  const ok = seen.accepted && seen.states > 0 && (seen.lastState?.annotationCount ?? 0) > 0;
  console.log(
    `[pen-sim] paired=${seen.accepted} states=${seen.states} ` +
      `ink=${seen.lastState?.annotationCount} paused=${seen.lastState?.paused} ` +
      `t=${seen.lastState?.t}ms roundtrip=${rtt}ms`
  );
  console.log(ok ? '[pen-sim] PASS' : '[pen-sim] FAIL');
  ws.close();
  process.exit(ok ? 0 : 1);
});
