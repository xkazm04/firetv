/**
 * Discriminates WHERE the loaded-latency tail comes from, by measuring two paths at once:
 *
 *   ws    the pen socket into our app, under the same 60 Hz load the probe uses
 *   tcp   repeated TCP connects to adbd on :5555 - a different process on the same device,
 *         over the same Wi-Fi. It never touches our app.
 *
 * Read it like this:
 *   both stall together        -> the radio / Wi-Fi link (power save, retries, airtime)
 *   only ws stalls, tcp flat   -> our app: dispatcher, GC, or per-connection TCP behaviour
 *
 * Stalls are printed with a wall-clock offset so they can be lined up against logcat.
 *
 * This is what found the Stick's pen-latency tail: it showed 0 of 48 app stalls coinciding with
 * a network stall, which ruled out Wi-Fi power save and the radio in one run and pointed at the
 * overlay's per-frame stroke refitting instead.
 *
 * Usage: node tail-diag.mjs [--host <ip>:8765] [--seconds 15] [--nopause]
 *   --nopause  leave the video playing. Worth running both ways: the render path only costs what
 *              it costs while frames are actually being produced.
 */
import WebSocket from 'ws';
import net from 'node:net';
import { TV_HOST } from './device.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith('--') ? [[a.slice(2), all[i + 1]]] : []))
);
const host = args.host ?? TV_HOST;
const ip = host.split(':')[0];
const seconds = Number(args.seconds ?? 15);
const STALL_MS = 100;

const t0 = process.hrtime.bigint();
const at = () => Number(process.hrtime.bigint() - t0) / 1e6;
const events = [];
const wsRtt = [];
const tcpRtt = [];

const pct = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor((a.length * p) / 100))] : NaN);
const stats = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return `n=${String(s.length).padStart(4)}  p50 ${pct(s, 50).toFixed(1).padStart(6)}  p95 ${pct(s, 95)
    .toFixed(1)
    .padStart(7)}  max ${(s.at(-1) ?? NaN).toFixed(1).padStart(7)} ms`;
};

// ---- tcp path: connect, measure, close. adbd, not our app. -------------------
let tcpStop = false;
async function tcpLoop() {
  while (!tcpStop) {
    const started = at();
    await new Promise((resolve) => {
      const sock = net.connect({ host: ip, port: 5555 });
      const done = (err) => {
        const ms = at() - started;
        if (!err) {
          tcpRtt.push(ms);
          if (ms > STALL_MS) events.push({ at: started, ms, who: 'tcp' });
        }
        sock.destroy();
        resolve();
      };
      sock.on('connect', () => done());
      sock.on('error', (e) => done(e));
      sock.setTimeout(3000, () => done(new Error('timeout')));
    });
    await new Promise((r) => setTimeout(r, 40));
  }
}

// ---- ws path: the real pen load -------------------------------------------
const pin = await fetch(`http://${host}/health`).then((r) => r.json()).then((h) => h.pin);
const ws = new WebSocket(`ws://${host}/ws`);
const inflight = new Map();

ws.on('error', (e) => {
  console.error('[diag] ws failed:', e.message);
  process.exit(2);
});

ws.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.type === 'welcome' && !m.accepted) {
    console.error('[diag] pairing rejected:', m.reason);
    process.exit(1);
  }
  if (m.type === 'pong' && inflight.has(m.id)) {
    const started = inflight.get(m.id);
    const ms = at() - started;
    wsRtt.push(ms);
    if (ms > STALL_MS) events.push({ at: started, ms, who: 'ws' });
    inflight.delete(m.id);
  }
});

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'hello', pin, clientId: 'tail-diag' }));
  if (!process.argv.includes('--nopause')) ws.send(JSON.stringify({ type: 'transport', cmd: 'pause' }));
  tcpLoop();

  let id = 0;
  let tick = 0;
  const penTimer = setInterval(() => {
    const pts = [];
    for (let i = 0; i < 8; i++) pts.push([0.2 + 0.6 * Math.random(), 0.2 + 0.6 * Math.random(), 0.5, Date.now()]);
    ws.send(JSON.stringify({ type: 'pen', tool: 'freehand', phase: tick === 0 ? 'down' : 'move', color: '#FFD400', pts }));
    tick++;
  }, 16);

  const pingTimer = setInterval(() => {
    const myId = ++id;
    inflight.set(myId, at());
    ws.send(JSON.stringify({ type: 'ping', id: myId }));
  }, 50);

  setTimeout(() => {
    clearInterval(penTimer);
    clearInterval(pingTimer);
    tcpStop = true;
    ws.send(JSON.stringify({ type: 'pen', phase: 'up', tool: 'freehand', pts: [] }));
    setTimeout(() => {
      console.log(`\n  ws  (our app, loaded)   ${stats(wsRtt)}`);
      console.log(`  tcp (adbd, same Wi-Fi)  ${stats(tcpRtt)}`);
      console.log(`  unanswered ws probes    ${inflight.size}`);

      const wsStalls = events.filter((e) => e.who === 'ws');
      const tcpStalls = events.filter((e) => e.who === 'tcp');
      console.log(`\n  stalls over ${STALL_MS} ms:  ws ${wsStalls.length}   tcp ${tcpStalls.length}`);
      for (const e of events.sort((a, b) => a.at - b.at)) {
        console.log(`    t+${(e.at / 1000).toFixed(2).padStart(6)}s  ${e.who.padEnd(3)}  ${e.ms.toFixed(0).padStart(4)} ms`);
      }

      // Did a tcp stall happen within 250 ms of each ws stall?
      const coincident = wsStalls.filter((w) =>
        tcpStalls.some((t) => Math.abs(t.at - w.at) < 250)
      ).length;
      if (wsStalls.length) {
        console.log(
          `\n  ${coincident}/${wsStalls.length} ws stalls coincide with a tcp stall -> ` +
            (coincident > wsStalls.length / 2 ? 'the LINK is stalling' : 'the APP is stalling')
        );
      }
      ws.close();
      process.exit(0);
    }, 1200);
  }, seconds * 1000);
});
