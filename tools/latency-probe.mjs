/**
 * Measures the half of the pen latency budget that this PoC can actually observe: phone -> TV
 * transport plus decode, while the pen is streaming at 60 Hz.
 *
 * What this does NOT measure is compositor-to-photons on the TV panel; that needs on-device
 * render instrumentation (design doc 6.2). Treat the number as a floor, not the whole budget.
 *
 * Usage: node latency-probe.mjs [--host 127.0.0.1:8765] [--seconds 6]
 */
import WebSocket from 'ws';

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith('--') ? [[a.slice(2), all[i + 1]]] : []))
);
const host = args.host ?? '127.0.0.1:8765';
const seconds = Number(args.seconds ?? 6);
// --idle measures the same socket with no pen traffic, to separate transport jitter from
// backpressure caused by the pen stream itself.
const idle = process.argv.includes('--idle');

const ws = new WebSocket(`ws://${host}/ws`);
const inflight = new Map();
const rtts = [];
let sentPenMsgs = 0;
let sentPoints = 0;

ws.on('error', (e) => {
  console.error('[latency] connection failed:', e.message);
  process.exit(2);
});

ws.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.type === 'pong' && inflight.has(m.id)) {
    rtts.push(Number(process.hrtime.bigint() - inflight.get(m.id)) / 1e6);
    inflight.delete(m.id);
  }
});

const pct = (a, p) => a[Math.min(a.length - 1, Math.floor((a.length * p) / 100))];

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'hello', pin: '0000', clientId: 'latency-probe' }));
  ws.send(JSON.stringify({ type: 'transport', cmd: 'pause' }));

  let id = 0;
  let tick = 0;

  // A finger drawing continuously: one batched pen message every 16 ms, 8 points each,
  // which is the worst sustained load the design doc's transport has to carry.
  const penTimer = setInterval(() => {
    if (idle) return;
    const pts = [];
    for (let i = 0; i < 8; i++) {
      pts.push([0.2 + 0.6 * Math.random(), 0.2 + 0.6 * Math.random(), 0.5, Date.now()]);
    }
    ws.send(
      JSON.stringify({
        type: 'pen',
        tool: 'freehand',
        phase: tick === 0 ? 'down' : 'move',
        color: '#FFD400',
        pts,
      })
    );
    sentPenMsgs++;
    sentPoints += pts.length;
    tick++;
  }, 16);

  // Probes ride the same socket, so they queue behind the pen traffic exactly as a real
  // message would.
  const pingTimer = setInterval(() => {
    const myId = ++id;
    inflight.set(myId, process.hrtime.bigint());
    ws.send(JSON.stringify({ type: 'ping', id: myId }));
  }, 50);

  setTimeout(() => {
    clearInterval(penTimer);
    clearInterval(pingTimer);
    ws.send(JSON.stringify({ type: 'pen', phase: 'up', tool: 'freehand', pts: [] }));

    setTimeout(() => {
      rtts.sort((a, b) => a - b);
      const lost = inflight.size;
      const f = (n) => n.toFixed(1).padStart(6);
      console.log(`\n  pen load     ${sentPenMsgs} messages / ${sentPoints} points over ${seconds}s ` +
        `(${(sentPenMsgs / seconds).toFixed(0)} msg/s)`);
      console.log(`  probes       ${rtts.length} answered, ${lost} unanswered`);
      console.log(`  rtt  min  ${f(rtts[0])} ms`);
      console.log(`  rtt  p50  ${f(pct(rtts, 50))} ms`);
      console.log(`  rtt  p95  ${f(pct(rtts, 95))} ms`);
      console.log(`  rtt  max  ${f(rtts.at(-1))} ms`);

      // Half the 35 ms typical budget from design doc 3.4, since this covers only one leg.
      const ok = lost === 0 && pct(rtts, 95) < 25;
      console.log(`\n  ${ok ? 'PASS' : 'FAIL'} (p95 under 25 ms, no dropped probes)`);
      ws.close();
      process.exit(ok ? 0 : 1);
    }, 1500);
  }, seconds * 1000);
});
