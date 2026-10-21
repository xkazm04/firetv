#!/usr/bin/env node
// tools/stick-perf/perf.mjs <name> <outdir> <steps...>: one measured run on the stick (docs/concepts/STICK-PERFORMANCE-2026-10-20.md).
// It resets gfxinfo, starts a DevTools trace of the stick's WebView, runs the steps, then saves the trace (gzipped),
// `gfxinfo framestats` and a summary of both: <outdir>/<name>.trace.json.gz, .gfxinfo.txt, .summary.json.
// Steps: K:<keyevent> (a remote key), W:<seconds>, E:<json> (post an event to the temp desk as its TV),
// C:<css> (an experiment: lay this CSS over the page, replacing the last C:), R: (reload the page, then wait 8 s).
// Env: DESK (http://localhost:3117), JAR (curl cookie jar holding the TV cookie). Node 22+ (global WebSocket).
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

const S = "10.0.0.139:5555", APP = "dev.studydesk.stick";
const DESK = process.env.DESK || "http://localhost:3117", JAR = process.env.JAR || "C:/tmp/deskperf-jar";
const [name, out, ...steps] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const adb = (...a) => execFileSync("adb", ["-s", S, ...a], { encoding: "utf8", env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pid = adb("shell", "pidof", APP).trim();
adb("forward", "tcp:9222", `localabstract:webview_devtools_remote_${pid}`);
const pages = await (await fetch("http://localhost:9222/json")).json();
const page = pages.find((p) => p.type === "page" && /\/tv/.test(p.url)) ?? pages[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const wait = new Map(), events = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait.has(d.id)) { wait.get(d.id)(d); wait.delete(d.id); } else events.push(d); };
const cdp = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

const CATS = [...(process.env.EXTRA_CATS ? process.env.EXTRA_CATS.split(",") : []), "devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "toplevel", "blink", "cc", "gpu", "viz", "benchmark", "rail", "loading", "v8.execute"];
await cdp("Tracing.start", { transferMode: "ReturnAsStream", traceConfig: { includedCategories: CATS, recordMode: "recordAsMuchAsPossible" } });
adb("shell", "dumpsys", "gfxinfo", APP, "reset");
const t0 = Date.now();
for (const s of steps) {
  const [k, v] = [s.slice(0, 1), s.slice(2)];
  if (k === "K") adb("shell", "input", "keyevent", v);
  else if (k === "W") await sleep(Number(v) * 1000);
  else if (k === "C") await cdp("Runtime.evaluate", { expression: `(()=>{let e=document.getElementById("perf-x");if(!e){e=document.createElement("style");e.id="perf-x";document.head.append(e)}e.textContent=${JSON.stringify(v)}})()` });
  else if (k === "R") { await cdp("Page.reload", {}); await sleep(8000); }
  else if (k === "E") execFileSync("curl", ["-s", "-o", "NUL", "-b", JAR, "-H", "Content-Type: application/json", "-d", v, `${DESK}/api/session`]);
}
const ms = Date.now() - t0;
const gfx = adb("shell", "dumpsys", "gfxinfo", APP, "framestats");
await cdp("Tracing.end");
let done; for (let i = 0; i < 600 && !(done = events.find((e) => e.method === "Tracing.tracingComplete")); i++) await sleep(100);
const stream = done.params.stream; let buf = "";
for (;;) { const r = (await cdp("IO.read", { handle: stream, size: 1 << 20 })).result; buf += r.base64Encoded ? Buffer.from(r.data, "base64").toString() : r.data; if (r.eof) break; }
await cdp("IO.close", { handle: stream }); ws.close();
writeFileSync(path.join(out, `${name}.trace.json.gz`), gzipSync(buf));
writeFileSync(path.join(out, `${name}.gfxinfo.txt`), gfx);
const summary = { name, steps, ms, gfx: gfxSummary(gfx), trace: traceSummary(JSON.parse(buf)) };
writeFileSync(path.join(out, `${name}.summary.json`), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ name, ms, gfx: summary.gfx, draw: summary.trace.draw, main: summary.trace.main.busyMs, long: summary.trace.main.long, raster: summary.trace.rasterMs, paint: summary.trace.paintMs }));

function gfxSummary(t) {
  const g = (re) => { const m = t.match(re); return m ? Number(m[1]) : null; };
  return { frames: g(/Total frames rendered: (\d+)/), janky: g(/Janky frames: (\d+)/), jankPct: g(/Janky frames: \d+ \(([\d.]+)%\)/),
    p50: g(/50th percentile: (\d+)ms/), p90: g(/90th percentile: (\d+)ms/), p95: g(/95th percentile: (\d+)ms/), p99: g(/99th percentile: (\d+)ms/),
    slowUi: g(/Number Slow UI thread: (\d+)/), slowDraw: g(/Number Slow issue draw commands: (\d+)/), frameDeadlineMissed: g(/Number Frame deadline missed: (\d+)/) };
}
function traceSummary(tr) {
  const ev = tr.traceEvents ?? tr, names = new Map();
  for (const e of ev) if (e.ph === "M" && e.name === "thread_name") names.set(`${e.pid}:${e.tid}`, e.args.name);
  const thread = (e) => names.get(`${e.pid}:${e.tid}`) ?? "?";
  const byName = {}, by = (th, n, d) => { const k = `${th.replace(/\d+$/, "")}|${n}`; byName[k] = (byName[k] ?? 0) + d; };
  let busy = 0, long = 0, longMs = 0, raster = 0, paint = 0, maxTask = 0;
  const frames = { presented: 0, partial: 0, dropped: 0, noUpdate: 0 };
  for (const e of ev) {
    if (e.name === "PipelineReporter" && e.ph === "b") {
      const st = e.args?.chrome_frame_reporter?.state;
      if (st === "STATE_PRESENTED_ALL") frames.presented++; else if (st === "STATE_PRESENTED_PARTIAL") frames.partial++;
      else if (st === "STATE_DROPPED") frames.dropped++; else if (st === "STATE_NO_UPDATE_DESIRED") frames.noUpdate++;
    }
    if (e.ph !== "X" || !e.dur) continue;
    const th = thread(e), d = e.dur / 1000;
    by(th, e.name, d);
    if (th === "CrRendererMain" && (e.name === "ThreadControllerImpl::RunTask" || e.name === "RunTask")) { busy += d; maxTask = Math.max(maxTask, d); if (d > 50) { long++; longMs += d; } }
    if (e.name === "RasterTask") raster += d;
    if (e.name === "Paint" || e.name === "PaintArtifactCompositor::Update") paint += d;
  }
  const draws = ev.filter((e) => e.ph === "X" && e.name === "DrawFn_DrawGL").map((e) => e.dur / 1000).sort((a, b) => a - b);
  const ts = ev.filter((e) => e.ph === "X" && e.name === "DrawFn_DrawGL").map((e) => e.ts).sort((a, b) => a - b);
  const gaps = ts.slice(1).map((t, i) => (t - ts[i]) / 1000).sort((a, b) => a - b);
  const q = (a, p) => a.length ? Math.round(a[Math.min(a.length - 1, Math.floor(p * a.length))]) : null;
  const span = ts.length > 1 ? (ts[ts.length - 1] - ts[0]) / 1e6 : 0;
  const draw = { count: draws.length, fps: span ? +(draws.length / span).toFixed(1) : null, drawP50: q(draws, .5), drawP90: q(draws, .9),
    gapP50: q(gaps, .5), gapP90: q(gaps, .9), gapP99: q(gaps, .99), over33: gaps.filter((g) => g > 33.4).length, jankPct: gaps.length ? +(100 * gaps.filter((g) => g > 33.4).length / gaps.length).toFixed(1) : null };
  const shown = frames.presented + frames.partial + frames.dropped;
  const top = Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => [k, Math.round(v)]);
  return { draw, frames: { ...frames, droppedPct: shown ? +(100 * frames.dropped / shown).toFixed(1) : null }, main: { busyMs: Math.round(busy), long, longMs: Math.round(longMs), maxTaskMs: Math.round(maxTask) }, rasterMs: Math.round(raster), paintMs: Math.round(paint), top };
}
