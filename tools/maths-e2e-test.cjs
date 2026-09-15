/**
 * Math Buddy, end to end, in a real browser: one full session from the landing screen to a marked set walked on the TV.
 * Run with npm test in desk/ (directly: node tools/maths-e2e-test.cjs, with desk/ and tools/ installed).
 *
 * What is real: the desk's own Next dev server, the TV page driven by its D-pad keys, the phone page joining with the
 * code the TV shows and snapping the sheet through a camera (Chromium's fake one), the session stream between them,
 * the substitution gate on the practice set, the marking re-check, and the learner book on disk.
 * What is stood in for: the two models. The claude CLI is tools/maths-e2e-claude.cjs, given as CLAUDE_BIN, and Ollama
 * is a server in this process, given as OLLAMA_HOST, marking the sheet the way a reader of the photo would. No voice
 * engine is configured, so the TV falls back to its own speech. Nothing leaves the machine; the data directory is a
 * scratch one under artifacts/, removed when the check passes and kept, with screenshots and the server log, when not.
 */
const fs = require("node:fs"), path = require("node:path"), http = require("node:http"), net = require("node:net");
const { spawn, spawnSync } = require("node:child_process");
const assert = require("node:assert/strict");
const { test, before, after } = require("node:test");
const { SET } = require("./maths-e2e-claude.cjs");

const root = path.resolve(__dirname, ".."), desk = path.join(root, "desk");
let chromium;
try { ({ chromium } = require("playwright")); } catch { console.error("The Math Buddy browser check drives Chromium with tools' own Playwright. Run `npm install` in tools/ first, then `npm test` from desk/."); process.exit(1); }
const nextBin = path.join(desk, "node_modules/next/dist/bin/next");
if (!fs.existsSync(nextBin)) { console.error("The Math Buddy browser check runs desk's own Next server. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }

const scratch = path.join(root, "artifacts/maths-e2e", String(Date.now()));
fs.mkdirSync(scratch, { recursive: true });
const TOPIC = "linear-one-step";

/**
 * How the stand-in reader marks the photo, item by item. Right items agree with the substitution; item 4 is wrong
 * with a slip from the topic's vocabulary; item 6 is a reader that says right about a value that does not satisfy
 * the equation, which the desk must refuse to decide. So the walk shows every verdict the TV can draw.
 */
const WROTE = { 1: "5", 2: "10", 3: "7", 4: "10", 5: "15", 6: "4" };
const SAID_RIGHT = { 1: true, 2: true, 3: true, 4: false, 5: true, 6: true };
const EXPECT = ["right", "right", "right", "wrong", "right", "unsure"];

let server, logFile, base, stub, browser, tv, phone;
const vision = [], pageErrors = [];
let broken = null, setup = null;
/** Each step leans on the one before; after a failure the rest say so instead of failing for the same reason again. */
const step = (name, fn) => test(name, async (t) => {
  if (broken) return t.skip(`an earlier step failed: ${broken}`);
  try { if (setup) throw setup; await fn(); } catch (e) { broken = setup ? "starting the desk and the browser" : name; await shoot(name); throw e; }
});
async function shoot(name) {
  const tag = name.replace(/[^a-z0-9]+/gi, "-").slice(0, 60);
  for (const [who, page] of [["tv", tv], ["phone", phone]]) if (page) await page.screenshot({ path: path.join(scratch, `${who}-${tag}.png`) }).catch(() => {});
}

async function session() { return (await fetch(base + "/api/session")).json(); }
/** Poll the server's session until it satisfies `ok`, so a key press is only followed once the desk has taken it. */
async function until(ok, label, ms = 60000) {
  const end = Date.now() + ms;
  let s;
  while (Date.now() < end) { s = await session(); if (ok(s)) return s; await new Promise((r) => setTimeout(r, 150)); }
  throw new Error(`timed out waiting for ${label}; the desk is on ${s?.screen}`);
}
const eyebrow = (page, text) => page.locator(".stage .eyebrow", { hasText: text }).first().waitFor();
async function press(key) { await tv.bringToFront(); await tv.keyboard.press(key); }

/** A port nobody holds right now. Next cannot be told to pick one itself. */
const freePort = () => new Promise((resolve, reject) => { const s = net.createServer(); s.unref(); s.on("error", reject); s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => resolve(port)); }); });

/** Ollama's /api/chat, as far as marking needs it: read the sheet out of the prompt, answer per WROTE. */
function startVision() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let body = "";
      req.on("data", (d) => (body += d));
      req.on("end", () => {
        const j = JSON.parse(body || "{}"), content = j.messages?.[0]?.content ?? "", image = j.messages?.[0]?.images?.[0] ?? "";
        vision.push({ image, content });
        const items = [...content.matchAll(/^(\d+)\. (.+)$/gm)].map(([, n, q]) => {
          const k = Number(n), known = SET.find((c) => c.question === q.trim());
          return { n: k, studentAnswer: WROTE[k] ?? "", studentWorking: "", verdict: SAID_RIGHT[k] ? "right" : "wrong", solution: known?.answer ?? "", slip: k === 4 ? "sign-lost-moving" : "unclear" };
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: { role: "assistant", content: JSON.stringify({ items }) } }));
      });
    });
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

/** The desk's dev server and everything it spawned. taskkill /T on Windows, where killing node leaves webpack's workers. */
function stopServer() {
  if (!server || server.exitCode !== null) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/F", "/T", "/PID", String(server.pid)], { stdio: "ignore" });
  else { try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill("SIGTERM"); } }
}

/** A setup that cannot finish is the first step's failure, said once, not every step's. */
before(async () => { try { await start(); } catch (e) { setup = e; } });
async function start() {
  stub = await startVision();
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  logFile = path.join(scratch, "next-dev.log");
  const log = fs.openSync(logFile, "w");
  // --webpack: Turbopack refuses a node_modules that is a link out of the project, which is how a worktree has one
  server = spawn(process.execPath, [nextBin, "dev", "--webpack", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: desk, windowsHide: true, detached: process.platform !== "win32", stdio: ["ignore", log, log],
    env: {
      // its own build directory, inside the ignored .next: a `next dev` the operator already has in desk/ holds .next/dev
      ...process.env, NEXT_TELEMETRY_DISABLED: "1", DESK_NEXT_DIST_DIR: ".next/e2e", DESK_DATA_DIR: scratch,
      CLAUDE_BIN: path.join(__dirname, "maths-e2e-claude.cjs"), OLLAMA_HOST: `http://127.0.0.1:${stub.address().port}`,
      PIPER_BIN: "", PIPER_VOICE: "", ELEVENLABS_API_KEY: "",
    },
  });
  fs.closeSync(log);   // the server holds its own copy; ours would keep the scratch directory from being removed
  const end = Date.now() + 120000;
  for (;;) {
    if (server.exitCode !== null) throw new Error(`the desk's dev server exited ${server.exitCode} before it was ready. Its log:\n${fs.readFileSync(logFile, "utf8").slice(-1500)}`);
    try { if ((await fetch(base + "/api/session")).ok) break; } catch { /* not listening yet */ }
    if (Date.now() > end) throw new Error(`the desk's dev server was not ready in two minutes. Its log:\n${fs.readFileSync(logFile, "utf8").slice(-1500)}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  try {
    browser = await chromium.launch({ headless: true, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
  } catch (e) {
    throw new Error(`Playwright could not start Chromium (${String(e.message).split("\n")[0]}). Run \`npx playwright install chromium\` in tools/, then \`npm test\`.`);
  }
  const tvContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await phoneContext.grantPermissions(["camera"], { origin: base });
  tv = await tvContext.newPage(); phone = await phoneContext.newPage();
  for (const [who, page] of [["tv", tv], ["phone", phone]]) { page.setDefaultTimeout(60000); page.on("pageerror", (e) => pageErrors.push(`${who}: ${e.message}`)); }
}

after(async () => {
  if (broken) await shoot("at-the-end");
  await browser?.close().catch(() => {});
  stopServer();
  await new Promise((r) => (stub ? stub.close(r) : r()));
  if (!broken) fs.rmSync(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  else console.error(`The Math Buddy browser check kept its screenshots, server log and desk data in ${scratch}`);
});

step("the TV opens on the landing screen and Math Buddy's home is one Select away", async () => {
  await tv.goto(base + "/tv");
  await tv.locator(".stage .card").first().waitFor();
  const s = await session();
  assert.equal(s.screen, "landing"); assert.equal(s.focus, 0, "Math Buddy is the first module on the landing row");
  await tv.locator(".stage").click({ position: { x: 20, y: 20 } });
  await press("Enter");
  await until((x) => x.screen === "tonight" && x.subject === "maths", "Math Buddy's home");
  await eyebrow(tv, "Math Buddy");
});

step("the phone joins with the code the TV shows, not one read off the server", async () => {
  await press("ArrowDown");
  await until((x) => x.screen === "pair", "the pairing screen");
  await eyebrow(tv, "Study Desk · pair a phone");
  const pin = (await tv.locator(".stage .lt .txt").textContent()).trim();
  assert.match(pin, /^\d{4}$/, "the TV shows a four-digit code");
  await phone.goto(base + "/phone");
  // four digits join by themselves, but only once the phone has the session to check them against
  await phone.getByText("The TV is showing the code.", { exact: false }).waitFor();
  await phone.getByPlaceholder("4-digit code").fill(pin);
  const s = await until((x) => x.joined, "the phone to join");
  assert.equal(s.pin, pin);
  await phone.getByRole("heading", { name: "On the desk" }).waitFor();
  await eyebrow(tv, "Paired");
  await press("Enter");
  await until((x) => x.screen === "tonight", "Math Buddy's home after pairing");
  await eyebrow(tv, "Math Buddy");
});

step("Teach me something, then the first topic: six verified questions land on the TV with no answer in the session", async () => {
  await press("ArrowRight");
  await until((x) => x.screen === "tonight" && x.focus === 1, "focus on Teach me something");
  await tv.locator('.stage .card[data-focused="true"]').filter({ hasText: /teach me something/i }).waitFor();
  await press("Enter");
  await until((x) => x.screen === "topics", "the topics screen");
  await eyebrow(tv, "Math Buddy · teach me something");
  await tv.locator('.stage .card[data-focused="true"]').first().waitFor();
  await press("Enter");
  const s = await until((x) => x.screen === "practice" && x.practice?.items?.length === 6, "the practice set", 90000);
  assert.equal(s.practice.topic, TOPIC);
  assert.deepEqual(s.practice.items.map((i) => i.question), SET.map((c) => c.question), "every stated answer passed the substitution gate");
  assert(!JSON.stringify(s.practice).includes('"answer"'), "no answer rides in the session the screens receive");
  assert.equal(await tv.locator(".stage .qs .q").count(), 6, "the TV shows all six");
  const calls = fs.readFileSync(path.join(scratch, "claude-calls.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  assert.equal(calls.length, 1, "one text call wrote the set"); assert(calls[0].argv.includes("--json-schema"), "with the structured-output contract the real CLI gets");
});

step("the phone snaps the worked sheet with its camera and sends it to be marked", async () => {
  await phone.getByRole("button", { name: "Practice", exact: true }).click();
  const snap = phone.getByRole("button", { name: "Snap the sheet", exact: true });
  await snap.waitFor();
  await phone.waitForFunction(() => { const v = document.querySelector(".cam video"); return !!v && v.videoWidth > 0; });
  await snap.click();
  await phone.getByAltText("the sheet you just snapped").waitFor();
  const marked = phone.waitForResponse((r) => r.url() === base + "/api/mark" && r.request().method() === "POST", { timeout: 90000 });
  await phone.getByRole("button", { name: "Send my working", exact: true }).click();
  const r = await marked;
  assert.equal(r.status(), 200, await r.text());
  assert.deepEqual(await r.json().then(({ right, wrong, unsure }) => ({ right, wrong, unsure })), { right: 4, wrong: 1, unsure: 1 });
  assert.equal(vision.length, 1, "one photo, one marking pass");
  assert.match(vision[0].image, /^\/9j\//, "what reached the reader is the phone's JPEG, without its data-URL prefix");
  for (const c of SET) assert(vision[0].content.includes(c.question), `the reader was shown ${c.question}`);
});

step("the marked result: the TV walks every item with its verdict, the phone gives the count, the book records it", async () => {
  const s = await until((x) => x.screen === "walk" && x.practice?.marked, "the walk");
  assert.deepEqual(s.practice.items.map((i) => i.verdict), EXPECT, "verdicts come from substitution, not from the reader's say-so");
  assert(!JSON.stringify(s.practice).includes('"solution"'), "the reader's own solution stays on the server");
  await eyebrow(tv, "Math Buddy · your sheet, marked");
  await phone.locator(".pscreen p", { hasText: /^4 right\. 2 to look at\.$/ }).waitFor();
  for (let ix = 0; ix < 6; ix++) {
    if (ix) { await press("ArrowRight"); await until((x) => x.walkIx === ix, `item ${ix + 1} of the walk`); }
    await tv.locator(".stage .clock", { hasText: new RegExp(`^${ix + 1}\\s*of 6$`) }).waitFor();
    assert.equal(await tv.locator(".stage .verdict").getAttribute("data-v"), EXPECT[ix], `item ${ix + 1} on the TV`);
    const said = (await tv.locator(".stage .cap-text").textContent()).trim();
    if (EXPECT[ix] === "right") assert.equal(said, `Number ${ix + 1} is right.`);
    if (EXPECT[ix] === "unsure") assert.equal(said, `I got something different for number ${ix + 1}. How did you get there?`);
    assert(!new RegExp(`(^|[^\\d-])${SET[ix].answer}(?!\\d)`).test(said), `item ${ix + 1}: what the desk says never carries the answer`);
    assert.equal(await tv.locator(".stage .slipname").count(), EXPECT[ix] === "wrong" ? 1 : 0, `item ${ix + 1}: a slip is named on the wrong item only`);
    if (EXPECT[ix] === "wrong") assert.match(await tv.locator(".stage .slipname").textContent(), /sign lost moving/);
  }
  const book = JSON.parse(fs.readFileSync(path.join(scratch, "learners.json"), "utf8"));
  const me = book[s.learner.id];
  assert(me?.skills?.[TOPIC], "the learner at the desk has the topic in the book");
  assert.equal(me.skills[TOPIC].seen, 5, "right and wrong items are attempts; an item the desk would not decide is not");
  assert.equal(me.skills[TOPIC].right, 4);
  assert.deepEqual(me.skills[TOPIC].slips, ["sign-lost-moving"], "only the named slip on the wrong item is kept");
  assert.equal(me.history.at(-1).detail, "4 of 6 right");
});

step("Select on the last item finishes the set and Math Buddy's home comes back, with nothing thrown on either page", async () => {
  await tv.locator(".stage .actions .btn", { hasText: "Finish the set" }).waitFor();
  await press("Enter");
  const s = await until((x) => x.screen === "tonight" && x.practice === null, "home after finishing");
  assert.equal(s.subject, "maths");
  await eyebrow(tv, "Math Buddy");
  assert.deepEqual(pageErrors, []);
});
