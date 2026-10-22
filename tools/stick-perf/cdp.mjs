#!/usr/bin/env node
// tools/stick-perf/cdp.mjs <expression>: evaluate one expression in the stick WebView's /tv page and print the value as
// JSON (an awaited promise too). Used by pass3.sh for the stills' stats (window.__ppStills) and to freeze the landing.
import { execFileSync } from "node:child_process";
const S = "10.0.0.139:5555", APP = "dev.studydesk.stick";
const adb = (...a) => execFileSync("adb", ["-s", S, ...a], { encoding: "utf8", env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
const pid = adb("shell", "pidof", APP).trim();
adb("forward", "tcp:9222", `localabstract:webview_devtools_remote_${pid}`);
const pages = await (await fetch("http://localhost:9222/json")).json();
const page = pages.find((p) => p.type === "page" && /\/tv/.test(p.url)) ?? pages[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result?.result?.value ?? d.result ?? d.error)); ws.close(); process.exit(0); } };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: process.argv[2], awaitPromise: true, returnByValue: true } }));
setTimeout(() => { console.error("cdp: no answer"); process.exit(1); }, 15000);
