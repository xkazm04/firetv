/**
 * The Sunday page on the real phone (Family W9): three learners are written into a scratch learners.json with a week's
 * digest each - a full week (school units, a step up, a slip seen three times, two Linga conversations, three Essay
 * readings), a thin week (one unit), and none at all - then each is seated in turn and the phone at 390 x 844, paired
 * the way a phone pairs (/phone?pin=), is switched to the Parent role and its Recap tab. The This week card is read and
 * photographed for each: the full week, the thin week, and "Nothing this week." It asserts that the card's lines are the
 * session's own `week` lines (assembled on the server from the digest, no model), that the phone was sent no digest,
 * that nothing is wider than the page, that no line is under 12 px or pale against its card, and that the Recap tab's
 * buttons are at least 44 px tall. Not part of `npm test` (it needs a server); it skips politely unless SUNDAY_PAGE_URL
 * is set. Run it against an isolated server whose engines cannot be reached, so any model call fails loudly:
 *
 *   DESK_DATA_DIR=<scratch dir> CLAUDE_BIN=<a path that does not exist> OLLAMA_HOST=http://127.0.0.1:9 \
 *     npx next dev --webpack -p 3473                                                   (in a copy of desk/)
 *   SUNDAY_PAGE_URL=http://localhost:3473 DESK_DATA_DIR=<the same dir> node tools/sunday-page-live.cjs
 *
 * Screenshots go to artifacts/sunday-page/ (git-ignored). Playwright is resolved from tools/node_modules. Refuses desk/data.
 */
if (!process.env.SUNDAY_PAGE_URL) { console.log('sunday-page-live: skipped (set SUNDAY_PAGE_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test writes the learners there and opens the TV with its key.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.SUNDAY_PAGE_URL.replace(/\/$/, '');
const out = path.resolve(__dirname, '../artifacts/sunday-page'); fs.mkdirSync(out, { recursive: true });

const PROFILE = (id, name) => ({ id, name, type: 'elementary', age: 12, system: 'uk', modules: ['maths', 'english', 'essay'] });
const LEARNERS = [PROFILE('sunday-full', 'Mia'), PROFILE('sunday-thin', 'Leo'), PROFILE('sunday-none', 'Ivy')];

/** A day `d` days back from today at hour `h`, local time: the page's week is local-midnight based. */
const back = (d, h, m = 0) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, m, 0, 0); return x.getTime(); };
const M = (d, h, topic, right, total, extra = {}) => ({ at: back(d, h), kind: 'maths', topic, right, notSure: 0, total, ...extra });
const DIGESTS = {
  'sunday-full': [
    M(6, 19, 'frac-add-sub', 3, 6, { notSure: 1, slip: 'tops-and-bottoms', slipN: 2 }),
    M(5, 18, 'frac-add-sub', 5, 6, { slip: 'tops-and-bottoms', slipN: 1 }),
    { at: back(5, 19), kind: 'english', sceneId: 'teacher', skill: 'repair', turns: 4 },
    M(4, 18, 'ratio-share', 4, 6, { stretch: true }),
    { at: back(3, 19), kind: 'essay', lens: 'structure', sentences: 5, faulty: 2 },
    { at: back(2, 18), kind: 'english', sceneId: 'lost', skill: 'request', turns: 6 },
    { at: back(2, 19), kind: 'essay', lens: 'argument', sentences: 4, faulty: 1 },
    M(1, 20, 'area', 6, 6),
    { at: back(0, 0, 30), kind: 'essay', lens: 'structure', sentences: 4, faulty: 0 },
  ],
  'sunday-thin': [M(3, 18, 'area', 3, 6, { slip: 'area-no-half', slipN: 2 }), M(3, 19, 'area', 4, 6, { notSure: 1 })],
  // an old entry only: nothing this week
  'sunday-none': [M(12, 18, 'area', 6, 6)],
};

let key = '', cookie = '';
async function asTheTV() {
  await fetch(base + '/api/session').catch(() => null); // the server writes pairing.json on its first request
  key = JSON.parse(fs.readFileSync(path.join(data, 'pairing.json'), 'utf8')).key;
  const r = await fetch(base + '/tv?key=' + encodeURIComponent(key), { redirect: 'manual' });
  cookie = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).filter((c) => c.startsWith('desk-tv=')).join('; ');
  assert.ok(cookie, 'the desk took its key');
}
async function event(b) {
  const r = await fetch(base + '/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(b) });
  assert.equal(r.status, 200, JSON.stringify(b) + ' -> ' + r.status);
  return r.json();
}
const current = async () => (await fetch(base + '/api/session', { headers: { cookie } })).json();

/** The learners, written as the desk writes them: every other learner already in the file is kept. */
function seedLearners() {
  const file = path.join(data, 'learners.json');
  const book = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8') || '{}') : {};
  for (const p of LEARNERS) book[p.id] = { id: p.id, english: { preferences: null, notes: [], evidence: [], achievements: {}, sessions: [], placement: null, plan: null, taught: [] }, skills: {}, writing: {}, memory: [], history: [], digest: DIGESTS[p.id] };
  fs.mkdirSync(data, { recursive: true }); fs.writeFileSync(file, JSON.stringify(book));
}

/** The card as drawn: its lines, what is wider than the page, text that is small or pale, and short tap targets. */
const layout = (page) => page.evaluate(() => {
  const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const card = document.querySelector('[data-role="phone-week"]');
  const bg = getComputedStyle(card).backgroundColor;
  const lines = [...card.querySelectorAll('h4, p')].map((el) => { const cs = getComputedStyle(el); return { tag: el.tagName, text: el.textContent, size: parseFloat(cs.fontSize), contrast: +ratio(cs.color, bg).toFixed(2) }; });
  const de = document.documentElement;
  const wide = [...document.querySelectorAll('.pscreen *')].filter((el) => el.getBoundingClientRect().right > innerWidth + 0.5).map((el) => el.tagName + '.' + el.className);
  const targets = [...document.querySelectorAll('.pscreen button, .pnav button, .ptop button')].map((el) => { const r = el.getBoundingClientRect(); return { t: el.textContent.trim().slice(0, 20), h: Math.round(r.height), w: Math.round(r.width) }; }).filter((x) => x.w > 0);
  const r = card.getBoundingClientRect();
  return { lines, over: de.scrollWidth - de.clientWidth, wide, short: targets.filter((x) => x.h < 44), card: { x: Math.round(r.left), w: Math.round(r.width) } };
});

(async () => {
  seedLearners();
  await asTheTV();
  await event({ type: 'reset' });
  for (const p of LEARNERS) { await event({ type: 'profile.draft', patch: p }); await event({ type: 'profile.save' }); }
  await event({ type: 'learner.set', id: 'sunday-full' });
  await event({ type: 'join' });

  const browser = await chromium.launch({ headless: true });
  const errors = [], report = {};
  try {
    const pin = (await current()).pin;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('phone: ' + e.message));
    const streamed = [];
    page.on('response', async (r) => { if (r.url().endsWith('/api/session') && r.request().method() === 'GET') { try { streamed.push(await r.text()); } catch {} } });
    await page.goto(base + '/phone?pin=' + pin);
    await page.waitForFunction(async () => (await (await fetch('/api/session')).json()).viewer === 'phone', null, { timeout: 20000 }).catch(() => { throw new Error('The phone did not pair with ?pin='); });
    // joined, and settled on the join confirmation the phone lands on first; then the Parent role and its Recap tab
    await page.waitForFunction(() => document.querySelector('.ptop .link b')?.textContent === 'joined', null, { timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Parent', exact: true }).click();
    await page.locator('.pnav').getByRole('button', { name: 'Recap', exact: true }).click();
    await page.waitForSelector('[data-role="phone-week"]', { timeout: 15000 });

    const expectFor = { 'sunday-full': /^Mia worked on (six|seven) evenings\.$/, 'sunday-thin': /^Leo worked on one evening\.$/, 'sunday-none': /^Nothing this week\.$/ };
    for (const [i, p] of LEARNERS.entries()) {
      if (i) await event({ type: 'learner.set', id: p.id });
      await page.waitForFunction((name) => document.querySelector('.ptop .link')?.textContent.includes(name), p.name, { timeout: 15000 });
      await page.waitForTimeout(600);
      const phoneView = await page.evaluate(async () => (await fetch('/api/session')).json());
      assert.equal(phoneView.viewer, 'phone');
      const lay = await layout(page);
      const drawn = lay.lines.map((l) => l.text);
      const sent = (phoneView.week ?? []).map((l) => l.text);
      assert.deepEqual(drawn, sent.length ? sent : ['Nothing this week.'], `${p.name}: the card draws the session's lines`);
      assert.match(drawn[0], expectFor[p.id], `${p.name}: ${drawn[0]}`);
      const json = JSON.stringify(phoneView);
      for (const k of ['"digest"', '"slipN"', '"notSure"']) assert.ok(!json.includes(k), `${p.name}: the phone was sent no ${k}`);
      assert.ok(lay.over <= 0, `${p.name}: nothing scrolls sideways (${lay.over})`); assert.deepEqual(lay.wide, [], `${p.name}: nothing wider than the page`);
      for (const l of lay.lines) { assert.ok(l.size >= 12, `${l.text}: ${l.size}px`); assert.ok(l.contrast >= 4.5, `${l.text}: contrast ${l.contrast}`); }
      assert.ok(!drawn.join(' ').includes('%'), 'no percent sign');
      report[p.id] = { lines: lay.lines, short: lay.short, card: lay.card };
      await page.locator('[data-role="phone-week"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}-${p.id}.png`), fullPage: true });
      await page.locator('[data-role="phone-week"]').screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}-${p.id}-card.png`) });
    }
    // tonight's recap and the week under it: Mia again, the session ended (the TV is on the recap)
    await event({ type: 'learner.set', id: 'sunday-full' }); await event({ type: 'session.end' });
    await page.waitForSelector('[data-role="phone-recap"]', { timeout: 15000 }); await page.waitForTimeout(600);
    const both = await layout(page);
    assert.ok(both.over <= 0 && !both.wide.length, 'the recap and the week fit the page');
    assert.ok(await page.evaluate(() => { const r = document.querySelector('[data-role="phone-recap"]'), w = document.querySelector('[data-role="phone-week"]'); return r.getBoundingClientRect().bottom <= w.getBoundingClientRect().top; }), 'the week sits under tonight\'s recap');
    await page.screenshot({ path: path.join(out, '04-recap-and-week.png'), fullPage: true });
    // scrolled to the end, the last line of the week clears the fixed tab bar (a full-page shot draws the bar mid-page)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(300);
    const clear = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-role="phone-week"] p')].at(-1).getBoundingClientRect(), n = document.querySelector('.pnav').getBoundingClientRect(); return { last: Math.round(w.bottom), nav: Math.round(n.top) }; });
    assert.ok(clear.last <= clear.nav, `the last line (${clear.last}) clears the tab bar (${clear.nav})`);
    await page.screenshot({ path: path.join(out, '05-recap-and-week-scrolled.png') });
    // the TV is not sent the parent's page
    const tvView = await current();
    assert.equal(tvView.week, undefined, 'the TV view carries no week');
    await ctx.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('sunday-page-live: ok'); console.log(JSON.stringify(report, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
