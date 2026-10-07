// P13f: what the probe's own /stats reads allocate on the Stick, with nothing else changed.
// Pairs two phones as ability-stick-probe.mjs does (same hello, 30 Hz neutral inputs) and stays in the lobby. Then runs
// phases of equal length: quiet (no /stats), the probe's race loop (GET /stats, 160 ms pause, repeat), quiet again.
// Every 5 s it reads the app's runtime stats from /profile with cursors past the end (an empty trace) and records
// art.gc.bytes-allocated and art.gc.gc-count, so each phase's MB/s and GC rate are the app's own counters.
// Usage: node tools/perf-p13f-stats-load.mjs <base> <pin> <out.json> [phaseSeconds=60] [phases=quiet,stats,quiet]
import {writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import WebSocket from 'ws';
const [base, pin, output, phaseArg = '60', phaseList = 'quiet,stats,quiet'] = process.argv.slice(2);
const phaseSeconds = Number(phaseArg), phases = phaseList.split(',');
const pause = ms => new Promise(r => setTimeout(r, ms));
const fetchText = async path => { const r = await fetch(base + path, {signal: AbortSignal.timeout(5000)}); if (!r.ok) throw Error(path + ' ' + r.status); return r.text(); };
const clients = [];
async function join() {
  const c = {ws: new WebSocket(base.replace('http', 'ws') + '/ws'), slot: -1, q: 0};
  clients.push(c);
  c.send = m => { if (c.ws.readyState === WebSocket.OPEN) c.ws.send(JSON.stringify(m)); };
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(Error('pair timeout')), 8000);
    c.ws.on('error', reject);
    c.ws.on('open', () => c.send({t: 'hello', pin, profile: 'ability-probe-' + randomUUID(), hudDelta: 1}));
    c.ws.on('message', data => { const m = JSON.parse(data); if (m.t === 'welcome') { c.slot = m.slot; clearTimeout(t); resolve(); } if (m.t === 'error') { clearTimeout(t); reject(Error(m.message)); } });
  });
  return c;
}
const result = {startedUtc: new Date().toISOString(), base, phaseSeconds, phases: [], samples: []};
const sample = async (phase, index, second) => {
  const p = JSON.parse(await fetchText('/profile?frames=9000000000000000&inputs=9000000000000000'));
  result.samples.push({phase, index, second, utc: new Date().toISOString(), bytesAllocated: Number(p.runtime['art.gc.bytes-allocated']),
    gcCount: Number(p.runtime['art.gc.gc-count']), gcTimeMs: Number(p.runtime['art.gc.gc-time'])});
};
await join(); await join();
const pump = setInterval(() => { for (const c of clients) c.send({t: 'i', q: c.q++, ts: performance.now(), s: 0, a: 0, b: 0, h: 0, fire: 0, mine: 0, weapon: 0, ability: 0}); }, 1000 / 30);
const started = performance.now();
const now = () => (performance.now() - started) / 1000;
await pause(5000);
for (const [index, phase] of phases.entries()) {
  const begin = now(), stats = {requests: 0, bytes: 0, ms: 0};
  await sample(phase, index, begin);
  let nextSample = begin + 5;
  while (now() - begin < phaseSeconds) {
    if (phase === 'stats') {
      const t = performance.now(); const body = await fetchText('/stats'); stats.ms += performance.now() - t;
      stats.requests++; stats.bytes += Buffer.byteLength(body); await pause(160);
    } else await pause(100);
    if (now() >= nextSample) { await sample(phase, index, now()); nextSample += 5; }
  }
  await sample(phase, index, now());
  const s = result.samples.filter(x => x.index === index), a = s[0], b = s.at(-1), dt = b.second - a.second;
  result.phases.push({phase, index, fromSecond: a.second, toSecond: b.second, allocatedMB: (b.bytesAllocated - a.bytesAllocated) / 1e6,
    allocatedMBps: (b.bytesAllocated - a.bytesAllocated) / 1e6 / dt, gcs: b.gcCount - a.gcCount, gcPerMinute: (b.gcCount - a.gcCount) / dt * 60,
    statsRequests: stats.requests, statsPerSecond: stats.requests / dt, statsBodyBytesMean: stats.requests ? stats.bytes / stats.requests : null,
    statsRequestMsMean: stats.requests ? stats.ms / stats.requests : null});
  console.log(JSON.stringify(result.phases.at(-1)));
}
clearInterval(pump);
for (const c of clients) c.ws.close();
result.finishedUtc = new Date().toISOString();
result.unit = 'MB = 10^6 B; the /profile samples are counted in the quiet phases too (each a small reply)';
await writeFile(output, JSON.stringify(result, null, 1));
process.exit(0);
