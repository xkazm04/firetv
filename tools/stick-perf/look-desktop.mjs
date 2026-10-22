#!/usr/bin/env node
// tools/stick-perf/look-desktop.mjs <out dir> <name> <tv url>...: stills of each paper world on a desktop Chromium at the
// stick's geometry (960 x 540 CSS px at DPR 2), every animation, the motes and the intro frozen, for a PSNR between two
// builds (docs/concepts/STICK-PERFORMANCE-2026-10-21.md, "Pass 3"). Walks the lamp right from the first app to the last,
// then reports window.__ppStills (the bitmaps made, their bytes) when the build has them.
// Env: PW (a playwright package dir; default the operator checkout's tools/node_modules/playwright).
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || "C:/Users/kazda/kiro/firetv/tools/node_modules/playwright");
const [out, name, url] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
// every finite animation at its end, every endless one at its start, all paused: the same frame on both builds
const FREEZE = () => { for (const a of document.getAnimations()) { if (a.effect?.getComputedTiming().iterations === Infinity) a.currentTime = 0; else a.finish(); a.pause(); } };
const b = await chromium.launch({ args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 });
await p.goto(url); await p.waitForTimeout(6000);
const shot = async (tag) => {
  await p.evaluate(FREEZE); await p.addStyleTag({ content: ".pp-fx{visibility:hidden!important}" }); await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(out, `${name}-${tag}.png`) });
  await p.evaluate(() => { for (const a of document.getAnimations()) a.play(); });
};
for (let i = 0; i < 3; i++) await p.keyboard.press("ArrowLeft").then(() => p.waitForTimeout(1500));
await p.waitForTimeout(4000);
const apps = await p.evaluate(() => [...document.querySelectorAll(".pp-stamp")].map((e) => e.getAttribute("data-app")));
for (let i = 0; i < apps.length; i++) {
  if (i) { await p.keyboard.press("ArrowRight"); await p.waitForTimeout(4000); }
  await shot(apps[i]);
}
const stats = await p.evaluate(() => (window.__ppStills ? window.__ppStills() : null));
writeFileSync(path.join(out, `${name}-stills.json`), JSON.stringify({ apps, stats }, null, 2));
console.log(JSON.stringify({ apps, mb: stats ? +(stats.bytes / 1048576).toFixed(1) : null, baked: stats?.baked?.length }));
await b.close();
