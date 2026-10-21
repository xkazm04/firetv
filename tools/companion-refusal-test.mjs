/**
 * Companion refusal test: the phone page, a real headless browser, and a fake TV behind the
 * WebSocket. No device, no TV app, no network.
 *
 * The TV refuses a wrong PIN by sending `welcome{accepted:false, reason}` and then closing
 * (PenConversation.reject in core). A dropped line is a close with no refusal before it. The page
 * has to tell the two apart: a refusal is the TV's answer, so asking again with the same PIN is
 * refused again, every second, forever; a drop is the Wi-Fi, and the page should come back.
 *
 *   refuse   the page is opened with a PIN the fake TV does not hold. Counts the connections the
 *            page opens in the N seconds after the first refusal, and looks for a visible PIN
 *            input. Then types the right PIN into it and expects to pair.
 *   drop     the right PIN; the fake TV welcomes the first connection and drops it 300 ms later
 *            without a refusal. Expects the page to reconnect and pair again.
 *
 *   node tools/companion-refusal-test.mjs [--seconds 5]
 *
 * Needs Playwright's Chromium (tools/node_modules), so it is not part of desk's npm test.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { refusalShown } from './device.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE = pathToFileURL(path.join(here, '..', 'companion', 'index.html')).href;
const secIdx = process.argv.indexOf('--seconds');
const WINDOW_S = secIdx > 0 ? Number(process.argv[secIdx + 1]) : 5;
const TV_PIN = '4821';

/** Replaces window.WebSocket with a TV that holds [cfg.pin]. Runs inside the page. */
function fakeTv(cfg) {
  const log = (window.__tv = { opened: 0, refused: 0, welcomed: 0, firstRefusalAt: null, openedAt: [], urls: [], sent: [] });
  class FakeTvSocket {
    constructor(url) {
      this.url = url;
      log.urls.push(String(url));
      this.readyState = 0;
      this.n = ++log.opened;
      log.openedAt.push(performance.now());
      setTimeout(() => {
        // A TV that is gone: the connection never opens, it just fails.
        if (cfg.dead && !window.__tvAlive) return this.drop(1006, '');
        this.readyState = 1;
        if (this.onopen) this.onopen({});
      }, 10);
    }
    send(text) {
      const m = JSON.parse(text);
      if (this.readyState === 1) log.sent.push(m);
      if (m.type !== 'hello' || this.readyState !== 1) return;
      if (m.pin !== cfg.pin) {
        log.refused++;
        if (log.firstRefusalAt === null) log.firstRefusalAt = performance.now();
        // The TV's order: the refusal, then the close (VIOLATED_POLICY, as KtorPenChannel sends it).
        this.deliver({ type: 'welcome', sessionId: '', videoAspect: 1.7778, accepted: false, reason: cfg.reason || 'wrong PIN', retryAfterMs: cfg.retryAfterMs });
        setTimeout(() => this.drop(1008, cfg.reason || 'wrong PIN'), 5);
        return;
      }
      log.welcomed++;
      this.deliver({ type: 'welcome', sessionId: 's-' + this.n, videoAspect: 1.7778, accepted: true });
      // A heartbeat, as the TV's Heartbeat sends one: paused, with the clip's length and its playback rate.
      if (cfg.state) this.deliver({ type: 'state', t: 0, paused: true, rate: 1, annotationCount: 0, durationMs: 20000, marks: [], ...cfg.state });
      if (cfg.dropFirst && this.n === 1) setTimeout(() => this.drop(1006, ''), 300);
    }
    deliver(o) {
      setTimeout(() => {
        if (this.readyState === 1 && this.onmessage) this.onmessage({ data: JSON.stringify(o) });
      }, 0);
    }
    drop(code, reason) {
      if (this.readyState === 3) return;
      this.readyState = 3;
      if (this.onclose) this.onclose({ code, reason, wasClean: code !== 1006 });
    }
    close(code, reason) {
      this.drop(code || 1000, reason || '');
    }
  }
  window.WebSocket = FakeTvSocket;
}

/** A visible input that asks for the PIN, by what it says rather than by an id. */
async function pinPrompt(page) {
  for (const el of await page.locator('input').all()) {
    if (!(await el.isVisible())) continue;
    const says = [
      await el.getAttribute('placeholder'),
      await el.getAttribute('aria-label'),
      await el.getAttribute('name'),
      await el.getAttribute('id'),
    ].join(' ');
    if (/pin/i.test(says)) return el;
  }
  return null;
}

const results = [];
function check(name, ok, figure) {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${figure})`);
}

const browser = await chromium.launch();
try {
  // ---- refuse ------------------------------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await page.goto(PAGE + '?pin=0000');
    await page.waitForFunction(() => window.__tv && window.__tv.refused > 0, null, { timeout: 5000 });
    await page.waitForTimeout(WINDOW_S * 1000);
    const tv = await page.evaluate(() => window.__tv);
    const retries = tv.openedAt.filter((t) => t > tv.firstRefusalAt).length;
    const status = await page.locator('#status').textContent();
    check(
      `refuse: no reconnect in ${WINDOW_S}s after the TV refused the PIN`,
      retries === 0,
      `${retries} reconnects, ${tv.refused} refusals, ${(retries / WINDOW_S * 60).toFixed(0)}/min`,
    );
    const prompt = await pinPrompt(page);
    check('refuse: the page asks for the PIN', prompt !== null, `status "${status}"`);
    // live-ui-test check 15 (a phone with the wrong PIN is refused) on the page's real refusal state.
    const intruder = await refusalShown(page, 1000);
    check('refuse: live-ui-test check 15 passes for a refused intruder', intruder.ok, `status "${intruder.status}", bad ${intruder.bad}, PIN input ${intruder.pinInput}`);
    if (prompt) {
      await prompt.fill(TV_PIN);
      await prompt.press('Enter');
      const paired = await page
        .waitForFunction(() => window.__pen.isConnected(), null, { timeout: 3000 })
        .then(() => true, () => false);
      const after = await page.evaluate(() => window.__tv);
      check('refuse: the right PIN typed into the prompt pairs', paired, `${after.welcomed} welcomed`);
    } else {
      check('refuse: the right PIN typed into the prompt pairs', false, 'no prompt to type into');
    }
    await page.close();
  }

  // ---- drop (guard) ------------------------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: true });
    await page.goto(PAGE + '?pin=' + TV_PIN);
    const back = await page
      .waitForFunction(() => window.__tv && window.__tv.welcomed >= 2 && window.__pen.isConnected(), null, {
        timeout: 4000,
      })
      .then(() => true, () => false);
    const tv = await page.evaluate(() => window.__tv);
    check('drop: a dropped line reconnects and pairs again', back, `${tv.opened} connections, ${tv.welcomed} welcomed`);
    await page.close();
  }

  // ---- drawing while not paired ------------------------------------------------------------
  // Nothing reaches the TV until it welcomes the pen, so ink under the finger then is a lie:
  // the pad must not echo it, and must say why.
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await page.goto(PAGE + '?pin=0000');
    await page.waitForFunction(() => window.__tv && window.__tv.refused > 0, null, { timeout: 5000 });
    const box = await page.locator('#pad').boundingBox();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width * (0.3 + i * 0.03), box.y + box.height * 0.5);
    const ink = await page.evaluate(() => {
      const c = document.getElementById('cv');
      const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < px.length; i += 4) if (px[i] > 0) n++;
      return n;
    });
    await page.mouse.up();
    const hint = await page.evaluate(() => {
      const h = document.getElementById('hint');
      return h.classList.contains('hide') ? '' : h.textContent;
    });
    check('unpaired: a stroke draws no ink and the pad says why', ink === 0 && /PIN|connect/i.test(hint), `${ink} ink pixels, hint "${hint}"`);
    await page.close();
  }

  // ---- locked (too many wrong PINs) ----------------------------------------------------------
  // During the TV's cooldown the right PIN is refused too, so "type the PIN" is a remedy that
  // cannot help yet: the page must say to wait.
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false, reason: 'too many wrong PINs' });
    await page.goto(PAGE + '?pin=0000');
    await page.waitForFunction(() => window.__tv && window.__tv.refused > 0, null, { timeout: 5000 });
    await page.waitForFunction(() => document.getElementById('status').classList.contains('bad'), null, { timeout: 2000 });
    const status = (await page.locator('#status').textContent()) ?? '';
    check('locked: the page says to wait, not to type the PIN now', /wait/i.test(status), `status "${status}"`);
    await page.close();
  }

  // ---- replaced by another phone -----------------------------------------------------------------
  // The TV tells a superseded pen once ("another pen took over") and hangs up. That is not a wrong
  // PIN: the dot goes red, the pad is blocked, and the page does not ask for the PIN again (two
  // phones typing it at each other would take the pen back and forth).
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false, reason: 'another pen took over' });
    await page.goto(PAGE + '?pin=0000');
    await page.waitForFunction(() => window.__tv && window.__tv.refused > 0, null, { timeout: 5000 });
    await page.waitForFunction(() => document.getElementById('status').classList.contains('bad'), null, { timeout: 2000 });
    const state = await page.evaluate(() => ({
      status: document.getElementById('status').textContent,
      dotOn: document.getElementById('dot').classList.contains('on'),
      promptShown: document.getElementById('pinbox').classList.contains('show'),
    }));
    const box = await page.locator('#pad').boundingBox();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
    await page.mouse.up();
    const hint = await page.evaluate(() => document.getElementById('hint').textContent);
    check(
      'replaced: the page says another phone has the pen, dot red, no PIN prompt, pad blocked',
      /another|took over/i.test(state.status) && !state.dotOn && !state.promptShown && !/type the PIN/i.test(hint),
      `status "${state.status}", dot ${state.dotOn ? 'on' : 'off'}, prompt ${state.promptShown}, hint "${hint}"`,
    );
    await page.close();
  }

  // ---- a lost TV ------------------------------------------------------------------------------
  // A closed TV app must not be redialled every second for as long as the tab lives: the page
  // backs off, stays quiet while its screen is hidden, and comes back at once when it is shown.
  {
    const page = await browser.newPage();
    await page.clock.install();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dead: true });
    await page.addInitScript(() => {
      window.__hidden = false;
      Object.defineProperty(document, 'hidden', { get: () => window.__hidden });
    });
    await page.goto(PAGE + '?pin=' + TV_PIN);
    await page.clock.runFor(60000);
    const dialled = await page.evaluate(() => window.__tv.opened);
    check('lost TV: connection attempts in 60 s with the TV gone', dialled <= 10, `${dialled} attempts (was ~60)`);

    // The screen goes dark: nothing is dialled while hidden.
    await page.evaluate(() => { window.__hidden = true; });
    const before = await page.evaluate(() => window.__tv.opened);
    await page.clock.runFor(60000);
    const hiddenDials = (await page.evaluate(() => window.__tv.opened)) - before;
    check('lost TV: nothing is dialled while the screen is hidden', hiddenDials <= 1, `${hiddenDials} attempts in 60 s hidden`);

    // The TV comes back and the phone is picked up: it dials at once, not after the backoff.
    await page.evaluate(() => { window.__tvAlive = true; window.__hidden = false; document.dispatchEvent(new Event('visibilitychange')); });
    await page.clock.runFor(2000);
    const back = await page.evaluate(() => window.__pen.isConnected());
    check('lost TV: showing the page again pairs within 2 s', back, `paired ${back}`);
    await page.close();
  }

  // ---- PIN in the fragment -------------------------------------------------------------------
  // A URL fragment never leaves the client, so a relay's access log cannot learn the PIN from
  // the request line. The QR carries #pin=; the page pairs from it, and a PIN typed after a
  // refusal is kept in the fragment too, never written back into the query.
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await page.goto(PAGE + '#pin=' + TV_PIN);
    const paired = await page
      .waitForFunction(() => window.__pen.isConnected(), null, { timeout: 3000 })
      .then(() => true, () => false);
    const search = await page.evaluate(() => location.search);
    check('fragment: a page opened at #pin=<right> pairs, and location.search has no pin', paired && !/pin/.test(search), `paired ${paired}, search "${search}"`);
    await page.close();

    const typed = await browser.newPage();
    await typed.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await typed.goto(PAGE + '#pin=0000');
    await typed.waitForFunction(() => window.__tv && window.__tv.refused > 0, null, { timeout: 5000 });
    const prompt = await pinPrompt(typed);
    if (prompt) {
      await prompt.fill(TV_PIN);
      await prompt.press('Enter');
      await typed.waitForFunction(() => window.__pen.isConnected(), null, { timeout: 3000 }).catch(() => {});
    }
    const where = await typed.evaluate(() => ({ search: location.search, hash: location.hash }));
    check(
      'fragment: a typed PIN is kept in the fragment, the query stays clean',
      !/pin/.test(where.search) && where.hash === '#pin=' + TV_PIN,
      `search "${where.search}", hash "${where.hash}"`,
    );
    await typed.close();

    // Old QR codes carry ?pin=; they keep working.
    const old = await browser.newPage();
    await old.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await old.goto(PAGE + '?pin=' + TV_PIN);
    const oldPaired = await old
      .waitForFunction(() => window.__pen.isConnected(), null, { timeout: 3000 })
      .then(() => true, () => false);
    check('fragment: an old ?pin= QR still pairs', oldPaired, `paired ${oldPaired}`);
    await old.close();
  }

  // ---- locked, with the TV's retry time ------------------------------------------------------------
  // The locked refusal carries retryAfterMs; the page counts it down and keeps Pair off until then.
  {
    const page = await browser.newPage();
    await page.clock.install();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false, reason: 'too many wrong PINs', retryAfterMs: 20000 });
    await page.goto(PAGE + '?pin=0000');
    await page.clock.runFor(500);
    const early = await page.evaluate(() => ({
      status: document.getElementById('status').textContent,
      pairOff: document.querySelector('#pinbox button').disabled,
    }));
    await page.clock.runFor(10000);
    const mid = await page.locator('#status').textContent();
    await page.clock.runFor(10500);
    const late = await page.evaluate(() => ({
      status: document.getElementById('status').textContent,
      pairOff: document.querySelector('#pinbox button').disabled,
    }));
    check(
      'locked+retry: the page counts the cooldown down and enables Pair at the end',
      /\b(19|20) s/.test(early.status) && early.pairOff && /\b(9|10) s/.test(mid) && !late.pairOff && /type the PIN/i.test(late.status),
      `start "${early.status}" pair ${early.pairOff ? 'off' : 'on'}; mid "${mid}"; end "${late.status}" pair ${late.pairOff ? 'off' : 'on'}`,
    );
    await page.close();
  }

  // ---- https (relay) -----------------------------------------------------------------------
  // The relay serves the page over https (RelayTransport: wss://relay.example/...). A page loaded
  // over https may not open a ws:// socket (mixed content), so the pen must dial wss://.
  // The origin is a route, fulfilled from the file: nothing leaves the machine.
  {
    const page = await browser.newPage();
    await page.route('https://relay.test/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', path: fileURLToPath(PAGE) }),
    );
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await page.goto('https://relay.test/?pin=' + TV_PIN);
    await page.waitForFunction(() => window.__tv && window.__tv.opened > 0, null, { timeout: 4000 }).catch(() => {});
    const tv = await page.evaluate(() => window.__tv);
    const url = (tv && tv.urls[0]) || '';
    check('https: a page served over https dials wss://', url.startsWith('wss://relay.test/'), url || 'no socket');
    await page.close();
  }

  // ---- file/http (LAN) guard ---------------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await page.goto(PAGE + '?pin=' + TV_PIN);
    await page.waitForFunction(() => window.__tv && window.__tv.opened > 0, null, { timeout: 4000 }).catch(() => {});
    const tv = await page.evaluate(() => window.__tv);
    const url = (tv && tv.urls[0]) || '';
    check('lan: a page served over http still dials ws://', url.startsWith('ws://'), url || 'no socket');

    // GUARD for the unpaired case: once welcomed, a stroke inks under the finger.
    await page.waitForFunction(() => window.__pen.isConnected(), null, { timeout: 3000 }).catch(() => {});
    const box = await page.locator('#pad').boundingBox();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width * (0.3 + i * 0.03), box.y + box.height * 0.5);
    const ink = await page.evaluate(() => {
      const c = document.getElementById('cv');
      const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < px.length; i += 4) if (px[i] > 0) n++;
      return n;
    });
    await page.mouse.up();
    check('paired: a stroke inks under the finger', ink > 0, `${ink} ink pixels`);

    // The TV floors a spotlight's radius at 0.03 of the picture width (PenEngine); the preview
    // under the finger must show the ring the TV will draw, not the 2 px the finger moved.
    await page.evaluate(() => window.__pen.setTool('spotlight'));
    const cx = box.x + box.width * 0.5, cy = box.y + box.height * 0.5;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 2, cy);
    const span = await page.evaluate(() => {
      const c = document.getElementById('cv');
      const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let lo = Infinity, hi = -Infinity;
      for (let i = 3; i < px.length; i += 4) {
        if (px[i] === 0) continue;
        const x = ((i - 3) / 4) % c.width;
        lo = Math.min(lo, x);
        hi = Math.max(hi, x);
      }
      return { ring: hi >= lo ? (hi - lo) / c.width : 0 };
    });
    await page.mouse.up();
    check(
      'spotlight: a short drag previews the floor-sized ring the TV draws',
      span.ring >= 0.055,
      `ring ${(span.ring * 100).toFixed(1)}% of the pad width, TV floor 6.0%`,
    );

    // ---- every control has a name a screen reader can say ---------------------------------
    // A name made only of symbols (a lone ✕) is read as the symbol, so it counts as unnamed.
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('button, input')]
        .filter((el) => {
          const name = (el.getAttribute('aria-label') || el.textContent || el.title || '').trim();
          return !/[\p{L}\p{N}]/u.test(name);
        })
        .map((el) => el.outerHTML.slice(0, 60)),
    );
    check('a11y: every button and input has a spoken name', unnamed.length === 0, `${unnamed.length} unnamed ${unnamed.join(' | ')}`);

    // WCAG 2.5.8: a pointer target is at least 24 x 24 CSS px. Measured on a phone-sized page.
    await page.setViewportSize({ width: 375, height: 667 });
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('nav button, nav input')]
        .filter((el) => el.offsetParent)
        .map((el) => [el.getAttribute('aria-label') || el.textContent.trim() || el.id, el.getBoundingClientRect()])
        .filter(([, r]) => Math.min(r.width, r.height) < 24)
        .map(([name, r]) => `${name} ${Math.round(r.width)}x${Math.round(r.height)}`),
    );
    check('a11y: every control is at least 24 px on a phone', small.length === 0, `${small.length} small ${small.join(' | ')}`);
    await page.close();
  }

  // ---- a second finger while drawing --------------------------------------------------------------
  // A palm or a second finger lands while the first is still drawing. That must not start a second
  // stroke over the first (the TV drops a live stroke on a new 'down') or leave a 60 Hz flush timer
  // running for as long as the tab lives. Real multi-touch through CDP, with intervals counted.
  {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 412, height: 800 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const live = (window.__intervals = new Set());
      const si = window.setInterval.bind(window), ci = window.clearInterval.bind(window);
      window.setInterval = (...a) => { const id = si(...a); live.add(id); return id; };
      window.clearInterval = (id) => { live.delete(id); return ci(id); };
    });
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false });
    await page.goto(PAGE + '#pin=' + TV_PIN);
    await page.waitForFunction(() => window.__pen.isConnected(), null, { timeout: 3000 });
    const box = await page.locator('#pad').boundingBox();
    const at = (fx, fy, id) => ({ x: box.x + box.width * fx, y: box.y + box.height * fy, id, radiusX: 6, radiusY: 6, force: 0.7 });
    const cdp = await context.newCDPSession(page);
    const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    await touch('touchStart', [at(0.2, 0.5, 1)]);
    await touch('touchMove', [at(0.3, 0.5, 1)]);
    await touch('touchStart', [at(0.3, 0.5, 1), at(0.7, 0.3, 2)]);
    await touch('touchMove', [at(0.4, 0.5, 1), at(0.72, 0.32, 2)]);
    await touch('touchEnd', []);
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => ({
      downs: window.__tv.sent.filter((m) => m.type === 'pen' && m.phase === 'down').length,
      ups: window.__tv.sent.filter((m) => m.type === 'pen' && m.phase === 'up').length,
      intervals: window.__intervals.size,
    }));
    check(
      'two fingers: one stroke reaches the TV and no flush timer outlives it',
      after.downs === 1 && after.ups === 1 && after.intervals === 0,
      `${after.downs} down, ${after.ups} up, ${after.intervals} intervals still running`,
    );
    await context.close();
  }

  // ---- the rate the TV is playing at --------------------------------------------------------------
  // The TV keeps its rate across phones (Session.rate). A phone that opens on a TV already in slow
  // motion must show the TV's rate pressed, not the 1x it was born with: state.rate is the truth.
  {
    const page = await browser.newPage();
    await page.addInitScript(fakeTv, { pin: TV_PIN, dropFirst: false, state: { rate: 0.25 } });
    await page.goto(PAGE + '#pin=' + TV_PIN);
    await page.waitForFunction(() => window.__pen.state() !== null, null, { timeout: 3000 }).catch(() => {});
    const pressed = await page.evaluate(() =>
      [...document.querySelectorAll('#rates [data-rate]')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.rate));
    check('rate: the pressed rate is the one the TV reports', pressed.length === 1 && pressed[0] === '0.25', `pressed [${pressed.join(',')}], TV at 0.25`);
    await page.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((ok) => !ok).length;
console.log(failed ? `${failed} of ${results.length} failed` : `all ${results.length} passed`);
process.exit(failed ? 1 : 0);
