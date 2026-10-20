#!/usr/bin/env node
// tools/stick-perf/window.mjs <dir>...: score each run's transitions from its trace (docs/concepts/STICK-PERFORMANCE-2026-10-20.md).
// A transition is the 1200 ms after a keydown reaches the page (the EventDispatch the stick's KeyBridge causes). In it:
// frames drawn (DrawFn_DrawGL on the app's RenderThread), the longest gap between two, and how many gaps passed 33.4 ms
// (two vsyncs). Writes <dir>/windows.json and prints one line per run.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";

const WIN = 1200;
for (const dir of process.argv.slice(2)) {
  const out = {};
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".trace.json.gz")).sort()) {
    const t = JSON.parse(gunzipSync(readFileSync(path.join(dir, f))).toString()), ev = t.traceEvents ?? t;
    const keys = ev.filter((e) => e.name === "EventDispatch" && e.args?.data?.type === "keydown").map((e) => e.ts).sort((a, b) => a - b);
    const draws = ev.filter((e) => e.ph === "X" && e.name === "DrawFn_DrawGL").map((e) => e.ts).sort((a, b) => a - b);
    if (!keys.length) continue;
    const per = keys.map((k) => {
      const d = draws.filter((x) => x >= k && x <= k + WIN * 1000), pts = [k, ...d, k + WIN * 1000];
      const gaps = pts.slice(1).map((x, i) => (x - pts[i]) / 1000);
      return { frames: d.length, fps: +(d.length / (WIN / 1000)).toFixed(1), maxGap: Math.round(Math.max(...gaps)), over33: gaps.filter((g) => g > 33.4).length };
    });
    const avg = (k) => +(per.reduce((s, p) => s + p[k], 0) / per.length).toFixed(1);
    out[f.replace(".trace.json.gz", "")] = { keys: per.length, fps: avg("fps"), maxGap: Math.max(...per.map((p) => p.maxGap)), over33: avg("over33"), per };
  }
  writeFileSync(path.join(dir, "windows.json"), JSON.stringify(out, null, 2));
  console.log(dir);
  for (const [k, v] of Object.entries(out)) console.log(`  ${k.padEnd(14)} keys ${v.keys}  fps ${String(v.fps).padStart(5)}  longest gap ${String(v.maxGap).padStart(4)} ms  gaps>33ms ${v.over33}`);
}
