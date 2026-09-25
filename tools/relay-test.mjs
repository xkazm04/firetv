/**
 * Proves the TV works with no listening socket of its own.
 *
 * The same APK is relaunched with `--es transport relay`, so instead of binding a port it dials
 * out to a relay and the phone meets it there. That is the only shape available on a platform
 * that will not let an app listen — which is the situation Vega OS most likely creates
 * (docs/PLATFORM-RISK.md). If this passes, a future port loses the transport and keeps the rest.
 *
 * Also measures what the extra hop costs, because "it works" and "it is usable" are different
 * claims and only one of them is interesting.
 *
 * Leaves the app back on the LAN transport so the normal dev cycle is unaffected.
 *
 * Usage: node relay-test.mjs [--out ../artifacts] [--port 9787] [--relay-host <this machine's IP>]
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import WebSocket from 'ws';

const here = path.dirname(fileURLToPath(import.meta.url));
import { makeAdb, TV_HOST, hostAddressForDevice, pinFromLogcat } from './device.mjs';
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith('--') ? [[a.slice(2), all[i + 1]]] : []))
);
const PORT = Number(args.port ?? 9787);
// How the TV addresses this machine. The emulator has a fixed host alias; a Stick on Wi-Fi has to
// be handed this machine's LAN address, or it dials into its own loopback and nothing happens.
const RELAY_HOST = args['relay-host'] ?? hostAddressForDevice();
const OUT = path.resolve(args.out ?? '../artifacts');
const PKG = 'dev.telestrator.tv';
mkdirSync(OUT, { recursive: true });

const adbBin = makeAdb();
const adb = (...a) => adbBin(...a).toString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const relayHealth = async () => (await fetch(`http://127.0.0.1:${PORT}/health`)).json();

function tvScreenshot(name) {
  adb('shell', 'screencap', '-p', '/sdcard/_relay.png');
  const dest = path.join(OUT, name);
  adb('pull', '/sdcard/_relay.png', dest);
  return PNG.sync.read(readFileSync(dest));
}

const isInk = (r, g, b) => r > 230 && g > 185 && g < 232 && b < 70;
function countInk(png) {
  const { width, height, data } = png;
  let n = 0;
  for (let y = 0; y < height * 0.94; y++) {
    for (let x = 0; x < width; x++) {
      if (x > width * 0.74 && y < height * 0.44) continue;
      const i = (width * y + x) << 2;
      if (isInk(data[i], data[i + 1], data[i + 2])) n++;
    }
  }
  return n;
}

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

async function waitFor(label, fn, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      if (await fn()) return true;
    } catch (e) {
      lastError = e;
    }
    await sleep(400);
  }
  // Swallowing the reason turns "the port was busy" into twenty minutes of guesswork.
  console.error(`timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ''}`);
  return false;
}

/** Round-trip through the relay, using the same ping the LAN probe uses. */
async function measureRelayRtt(pin, samples = 40) {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`);
    const rtts = [];
    const inflight = new Map();
    let id = 0;
    let timer = null;

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'hello', pin, clientId: 'relay-rtt' }));
      timer = setInterval(() => {
        if (rtts.length + inflight.size >= samples) return;
        const myId = ++id;
        inflight.set(myId, process.hrtime.bigint());
        ws.send(JSON.stringify({ type: 'ping', id: myId }));
      }, 50);
    });
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === 'pong' && inflight.has(m.id)) {
        rtts.push(Number(process.hrtime.bigint() - inflight.get(m.id)) / 1e6);
        inflight.delete(m.id);
      }
    });
    ws.on('error', () => resolve(null));

    setTimeout(() => {
      clearInterval(timer);
      ws.close();
      if (!rtts.length) return resolve(null);
      rtts.sort((a, b) => a - b);
      resolve({
        n: rtts.length,
        p50: rtts[Math.floor(rtts.length / 2)],
        p95: rtts[Math.min(rtts.length - 1, Math.floor(rtts.length * 0.95))],
      });
    }, samples * 50 + 2500);
  });
}

let relay = null;

const restoreLanTransport = () => {
  adb('shell', 'am', 'force-stop', PKG);
  adb('shell', `monkey -p ${PKG} -c android.intent.category.LEANBACK_LAUNCHER 1 >/dev/null 2>&1`);
};

const run = async () => {
  // ---- 1. the relay ---------------------------------------------------------
  relay = spawn(process.execPath, [path.join(here, 'relay-stub.mjs'), '--port', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  relay.stdout.on('data', (d) => process.stdout.write(`  ${d}`));
  relay.stderr.on('data', (d) => process.stderr.write(`  [relay stderr] ${d}`));
  relay.on('exit', (code) => code && console.error(`  [relay] exited with ${code}`));
  check('relay stub is up', await waitFor('relay', async () => (await relayHealth()).ok));

  // ---- 2. relaunch the TV with no listening socket --------------------------
  adb('shell', 'am', 'force-stop', PKG);
  adb('logcat', '-c');
  adb(
    'shell',
    'am',
    'start',
    '-n',
    `${PKG}/.MainActivity`,
    '--es', 'transport', 'relay',
    '--es', 'relay_url', `ws://${RELAY_HOST}:${PORT}/tv`,
    '--es', 'phone_url', `http://${RELAY_HOST}:${PORT}/`
  );

  check(
    'the TV dials out and reaches the relay',
    await waitFor('tv dial-in', async () => (await relayHealth()).tvConnected)
  );

  // The viewer would read the PIN off the QR card on screen; a script reads the same string
  // out of logcat.
  const line = adb('logcat', '-d', '-s', 'Telestrator:I');
  const pin = pinFromLogcat(line.toString());
  const via = /transport=(\w+)/.exec(line)?.[1];
  check('the app reports it is running on the relay transport', via === 'relay', `transport=${via}`);
  check('pairing details are available without a LAN server', !!pin, `pin=${pin}`);
  if (!pin) throw new Error('no PIN in logcat; cannot pair');

  // ---- 3. nothing is listening on the TV any more ---------------------------
  // Ask wherever the LAN transport would have served: the adb tunnel on the emulator, the
  // device's own address on hardware. If the app were still serving, this would answer.
  let lanAnswered = false;
  try {
    await fetch(`http://${TV_HOST}/health`, { signal: AbortSignal.timeout(2500) });
    lanAnswered = true;
  } catch {
    // Expected: the relay build binds nothing.
  }
  check('the TV is no longer serving anything on the LAN port', !lanAnswered);

  // ---- 4. the phone meets the TV at the relay -------------------------------
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  await page.goto(`http://127.0.0.1:${PORT}/?pin=${pin}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__pen && window.__pen.isConnected(), null, { timeout: 20000 });
  check('the phone loads the companion page from the relay and pairs through it', true);

  // ---- 5. drive the TV over the relay ---------------------------------------
  await waitFor('first state from the TV', async () => typeof (await relayHealth()).paused === 'boolean');
  const wasPaused = (await relayHealth()).paused;
  await page.click('#btn-playpause');
  await sleep(1200);
  let h = await relayHealth();
  check('transport control crosses the relay', h.paused === !wasPaused, `paused ${wasPaused} -> ${h.paused}`);
  if (!h.paused) {
    await page.click('#btn-playpause');
    await sleep(1200);
  }

  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_DOWN'); // clear
  await sleep(800);
  const inkBefore = countInk(tvScreenshot('relay-00-clean.png'));

  const pad = await page.locator('#pad').boundingBox();
  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 6, radiusY: 6, force: 0.7 }],
    });
  const at = (fx, fy) => [pad.x + pad.width * fx, pad.y + pad.height * fy];

  await touch('touchStart', ...at(0.15, 0.7));
  for (let i = 1; i <= 30; i++) {
    const p = i / 30;
    await touch('touchMove', ...at(0.15 + 0.7 * p, 0.7 - 0.45 * Math.sin(Math.PI * p)));
    await sleep(14);
  }
  await touch('touchEnd', ...at(0.85, 0.7));
  await sleep(1400);

  h = await relayHealth();
  check('a stroke drawn on the phone reaches the TV over the relay', h.annotationCount >= 1, `ink=${h.annotationCount}`);

  const inkAfter = countInk(tvScreenshot('relay-01-drawn.png'));
  check('and is rendered in the TV framebuffer', inkAfter > inkBefore + 1500, `ink px ${inkBefore} -> ${inkAfter}`);

  check('no uncaught errors on the phone page', consoleErrors.length === 0, consoleErrors.join('; '));

  // ---- 6. what the portable path costs --------------------------------------
  await browser.close();
  const rtt = await measureRelayRtt(pin);
  if (rtt) {
    console.log(`\n  relay round-trip: p50 ${rtt.p50.toFixed(1)} ms, p95 ${rtt.p95.toFixed(1)} ms over ${rtt.n} probes`);
    console.log('  This is NOT comparable to the LAN probe and is NOT the production cost. The');
    console.log('  relay here is a process on this same machine, so the number measures protocol');
    console.log('  overhead and nothing else - it will read faster than the LAN path, which goes');
    console.log('  through an adb tunnel. A hosted relay adds two internet legs: budget +100-200 ms');
    console.log('  and re-measure against the deployed relay before trusting freehand on this path.');
    // Asserts only that the extra hop introduces no pathological cost of its own.
    check('relay adds no protocol-level overhead of its own', rtt.p95 < 120, `p95 ${rtt.p95.toFixed(1)} ms`);
  } else {
    check('relay round-trip measured', false, 'no probes answered');
  }
};

run()
  .catch((e) => {
    console.error('relay-test crashed:', e);
    checks.push({ name: 'relay test completed', ok: false, detail: String(e) });
  })
  .finally(async () => {
    relay?.kill();
    // Put the app back the way the rest of the harness expects to find it.
    restoreLanTransport();

    const failed = checks.filter((c) => !c.ok);
    writeFileSync(
      path.join(OUT, 'relay-test.json'),
      JSON.stringify({ when: new Date().toISOString(), checks }, null, 2)
    );
    console.log(`\n${checks.length - failed.length}/${checks.length} checks passed.`);
    process.exit(failed.length ? 1 : 0);
  });
