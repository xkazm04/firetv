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

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE = pathToFileURL(path.join(here, '..', 'companion', 'index.html')).href;
const secIdx = process.argv.indexOf('--seconds');
const WINDOW_S = secIdx > 0 ? Number(process.argv[secIdx + 1]) : 5;
const TV_PIN = '4821';

/** Replaces window.WebSocket with a TV that holds [cfg.pin]. Runs inside the page. */
function fakeTv(cfg) {
  const log = (window.__tv = { opened: 0, refused: 0, welcomed: 0, firstRefusalAt: null, openedAt: [] });
  class FakeTvSocket {
    constructor(url) {
      this.url = url;
      this.readyState = 0;
      this.n = ++log.opened;
      log.openedAt.push(performance.now());
      setTimeout(() => {
        this.readyState = 1;
        if (this.onopen) this.onopen({});
      }, 10);
    }
    send(text) {
      const m = JSON.parse(text);
      if (m.type !== 'hello' || this.readyState !== 1) return;
      if (m.pin !== cfg.pin) {
        log.refused++;
        if (log.firstRefusalAt === null) log.firstRefusalAt = performance.now();
        // The TV's order: the refusal, then the close (VIOLATED_POLICY, as KtorPenChannel sends it).
        this.deliver({ type: 'welcome', sessionId: '', videoAspect: 1.7778, accepted: false, reason: 'wrong PIN' });
        setTimeout(() => this.drop(1008, 'wrong PIN'), 5);
        return;
      }
      log.welcomed++;
      this.deliver({ type: 'welcome', sessionId: 's-' + this.n, videoAspect: 1.7778, accepted: true });
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
} finally {
  await browser.close();
}

const failed = results.filter((ok) => !ok).length;
console.log(failed ? `${failed} of ${results.length} failed` : `all ${results.length} passed`);
process.exit(failed ? 1 : 0);
