/**
 * School maths on the real TV (Family W5b): a 12-year-old UK learner walks Math Buddy's Tonight -> Teach me something
 * -> Topics (the ruler with four topics, "Add and subtract fractions" first, the needle on it, the SCHOOL tick drawn and
 * no gap line, the focused name whole) -> Select on the fractions unit -> the practice sheet, six questions the desk
 * wrote itself with NO model call, fractions stacked. Then Tonight's first-evening title for a fresh learner, and
 * Tonight and Topics for a learner with one-step equations secure (the needle stays on two-step equations). Measured at
 * 1920 x 1080 and 1280 x 720. Not part of `npm test` (it needs a server); it skips politely unless SCHOOL_FRACTIONS_URL
 * is set. Run it against an isolated server whose text engine cannot be reached, so any model call fails loudly:
 *
 *   DESK_DATA_DIR=<scratch dir> CLAUDE_BIN=<a path that does not exist> OLLAMA_HOST=http://127.0.0.1:9 \
 *     npx next dev --webpack -p 3461                                                              (in desk/)
 *   SCHOOL_FRACTIONS_URL=http://localhost:3461 DESK_DATA_DIR=<the same dir> node tools/school-fractions-live.cjs
 *
 * What it asserts: the practice route answers provider "code" and 0 tries; every piece of Math Buddy text sits inside
 * the 96 / 54 px safe zone of the 1920 x 1080 stage and none is under 28 px except uppercase labels of 20-22 px; the
 * question numerals (the stacked fractions' tops and bottoms) are at least 28 px; the six questions fit inside the
 * paper; no page error. The desk is built through the session's own events and a seeded learners.json in the scratch
 * directory (the desk keeps `secure` there). Screenshots go to artifacts/school-fractions/ (git-ignored). Playwright is
 * resolved from tools/node_modules.
 */
if (!process.env.SCHOOL_FRACTIONS_URL) { console.log('school-fractions-live: skipped (set SCHOOL_FRACTIONS_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.SCHOOL_FRACTIONS_URL.replace(/\/$/, '');
const out = path.resolve(__dirname, '../artifacts/school-fractions'); fs.mkdirSync(out, { recursive: true });

const FRESH = { id: 'fractions-fresh-live', name: 'Mia', type: 'elementary', age: 12, system: 'uk', modules: ['maths'] };
const LINEAR = { id: 'fractions-linear-live', name: 'Tom', type: 'elementary', age: 12, system: 'uk', modules: ['maths'] };
const NAMES = ['Add and subtract fractions', 'One-step equations', 'Two-step equations', 'Equations with brackets and x on both sides'];

let key = '', cookie = '';
async function asTheTV() {
  // the server writes pairing.json on its first request
  await fetch(base + '/api/session').catch(() => null);
  key = JSON.parse(fs.readFileSync(path.join(data, 'pairing.json'), 'utf8')).key;
  const r = await fetch(base + '/tv?key=' + encodeURIComponent(key), { redirect: 'manual' });
  cookie = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).filter((c) => c.startsWith('desk-tv=')).join('; ');
  assert.ok(cookie, 'the desk took its key');
}
async function event(b) {
  const r = await fetch(base + '/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(b) });
  assert.equal(r.status, 200, JSON.stringify(b));
  return r.json();
}
/** The learner book as the desk keeps it, seeded before the learner is seated (the store hydrates skills from it). */
function seedLearners(book) { fs.writeFileSync(path.join(data, 'learners.json'), JSON.stringify(book)); }
const secureRec = (topic) => ({ topic, seen: 6, right: 6, estimate: 1, secure: true, lastSeen: Date.now() - 86400000, slips: [] });
async function desk(who) {
  await event({ type: 'reset' });
  await event({ type: 'profile.draft', patch: who }); await event({ type: 'profile.save' });
  await event({ type: 'join' });
  await event({ type: 'subject', subject: 'maths' });
  await event({ type: 'nav', screen: 'tonight', focus: 0 });
}

/** Math Buddy's text on the stage: where it sits (1920 x 1080 stage px) and how big it is. */
async function measure(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.maths-tv'), st = document.querySelector('.stage'), stage = st.getBoundingClientRect(), k = stage.width / st.offsetWidth;
    const outside = [], small = [], seen = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.trim(), el = n.parentElement;
      if (!text || !el || el.closest('[aria-hidden="true"]')) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const b = range.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      const cs = getComputedStyle(el), size = parseFloat(cs.fontSize), upper = cs.textTransform === 'uppercase' || text === text.toUpperCase() && /[A-Z]/.test(text);
      const box = { x0: Math.round((b.left - stage.left) / k), x1: Math.round((b.right - stage.left) / k), y0: Math.round((b.top - stage.top) / k), y1: Math.round((b.bottom - stage.top) / k) };
      const row = `${el.className || el.tagName} "${text.slice(0, 32)}" ${size.toFixed(1)}px ${box.x0},${box.y0}-${box.x1},${box.y1}`;
      seen.push(row);
      if (box.x0 < 96 - 2 || box.x1 > 1824 + 2 || box.y0 < 54 - 2 || box.y1 > 1026 + 2) outside.push(row);
      if (size < 27.5 && !(upper && size >= 19.5 && size <= 22.5)) small.push(row);
    }
    const q = (sel) => document.querySelector(sel)?.textContent?.trim() ?? '';
    return { outside, small, seen, stageW: st.offsetWidth, title: q('[data-role="maths-title"]'), screen: root.getAttribute('data-screen') };
  });
}

/** The ruler as drawn: its topics, the focused one's name whole, the needle, the tick and the gap line. */
async function ruler(page) {
  return page.evaluate(() => {
    const r = document.querySelector('[data-role="maths-ruler"]');
    const names = [...r.querySelectorAll('.mb-topic .mb-tn')].map((x) => x.textContent.trim());
    const f = r.querySelector('.mb-topic[data-focused="true"] .mb-tn');
    const left = (sel) => { const e = r.querySelector(sel); return e ? parseFloat(e.style.left) : null; };
    return {
      names, focused: f?.textContent.trim() ?? null,
      whole: f ? f.scrollHeight <= f.clientHeight + parseFloat(getComputedStyle(f).fontSize) * 0.4 && f.scrollWidth <= f.clientWidth + 1 : false,
      needle: left('.mb-marker'), tick: left('.mb-flag'), tickWord: r.querySelector('.mb-flag .mc')?.textContent.trim() ?? null,
      gap: !!r.querySelector('.mb-gapline'), years: [...r.querySelectorAll('.mb-ty')].map((x) => x.textContent.trim()),
    };
  });
}

/** The practice sheet: six questions, each fraction's numerals at >= 28 px, every question inside the paper. */
async function sheet(page) {
  return page.evaluate(() => {
    const paper = document.querySelector('[data-role="maths-sheet"]'), pb = paper.getBoundingClientRect();
    const st = document.querySelector('.stage'), k = st.getBoundingClientRect().width / st.offsetWidth;
    const items = [...paper.querySelectorAll('.mb-item')];
    const rows = items.map((it) => {
      const b = it.getBoundingClientRect(), row = it.querySelector('.mb-row');
      const fr = [...it.querySelectorAll('[data-role="maths-frac"]')];
      const nums = [...it.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^\d+$/.test(e.textContent.trim()) && !e.closest('.num'));
      return {
        text: it.textContent.replace(/\s+/g, ' ').trim(),
        inside: b.left >= pb.left - 1 && b.right <= pb.right + 1 && b.top >= pb.top - 1 && b.bottom <= pb.bottom + 1,
        fits: row ? row.scrollWidth <= row.clientWidth + 1 : false,
        fracs: fr.length, numeralPx: nums.map((e) => parseFloat(getComputedStyle(e).fontSize)),
      };
    });
    return { rows, paperBottom: Math.round((pb.bottom - st.getBoundingClientRect().top) / k) };
  });
}

(async () => {
  await asTheTV();
  const browser = await chromium.launch({ headless: true });
  const errors = [], report = [];
  try {
    for (const [W, H] of [[1920, 1080], [1280, 720]]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: H + 130 } }), page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      // no voice engine runs for a capture: /api/speak is answered empty (as tools/maths-calculus-live.cjs does)
      await page.route('**/api/speak**', (r) => r.fulfill({ status: 204, body: '' }));
      const open = async (screen) => { await page.goto(base + '/tv?display=tv&key=' + encodeURIComponent(key)); await page.waitForSelector(`.maths-tv[data-screen="${screen}"]`); await page.waitForTimeout(1500); await page.locator('.stage').click({ position: { x: 4, y: 4 } }); };
      const shot = (name) => page.locator('.frame').screenshot({ path: path.join(out, `${name}-${W}x${H}.png`) });
      const press = async (k, ms = 700) => { await page.keyboard.press(k); await page.waitForTimeout(ms); };
      const clean = (m, label) => {
        assert.equal(m.stageW, 1920, `${label}: the TV stage`);
        assert.deepEqual(m.outside, [], `${W}: ${label} keeps its text inside the 96/54 px safe zone`);
        assert.deepEqual(m.small, [], `${W}: ${label} has no text under 28 px (20-22 px uppercase labels excepted)`);
      };

      // ---- a fresh 12-year-old: Tonight, Topics on fractions, Select -> six questions by code
      seedLearners({});
      await desk(FRESH); await open('tonight');
      let m = await measure(page);
      assert.equal(m.title, 'School maths, from the first step', `${W}: the first evening's title`);
      clean(m, 'Tonight (fresh)'); await shot('tonight-fresh');
      const tonightFresh = await ruler(page);
      assert.equal(tonightFresh.gap, false, 'Tonight: no gap line');
      await press('ArrowRight'); await press('Enter', 1500);
      m = await measure(page); assert.equal(m.screen, 'topics', `${W}: Teach me something opens Topics`);
      const topics = await ruler(page);
      assert.deepEqual(topics.names, NAMES, `${W}: four topics, fractions first`);
      assert.equal(topics.focused, NAMES[0], `${W}: the lamp on the fresh learner's frontier, fractions`);
      assert.ok(topics.whole, `${W}: the focused name is whole`);
      assert.equal(topics.tickWord, 'School', `${W}: the SCHOOL tick is drawn`);
      assert.equal(topics.gap, false, `${W}: no gap line (D2)`);
      assert.equal(topics.needle, 26, `${W}: the needle at the start, on fractions`);
      clean(m, 'Topics (fresh)'); await shot('topics-fresh');
      // every topic's name is whole when the lamp is on it (the fourth is fitted below 44 px in its 419 px slot)
      for (let i = 1; i < NAMES.length; i++) {
        await press('ArrowRight');
        const r = await ruler(page);
        assert.equal(r.focused, NAMES[i]); assert.ok(r.whole, `${W}: "${NAMES[i]}" whole when focused`);
        if (i === NAMES.length - 1) { clean(await measure(page), 'Topics (last focused)'); await shot('topics-last-focused'); }
      }
      for (let i = 1; i < NAMES.length; i++) await press('ArrowLeft');
      assert.equal((await ruler(page)).focused, NAMES[0]);
      const practiceAnswer = page.waitForResponse((r) => r.url().endsWith('/api/practice') && r.request().method() === 'POST', { timeout: 30000 });
      await press('Enter', 100);
      const resp = await practiceAnswer;
      const made = await resp.json();
      assert.equal(resp.status(), 200, JSON.stringify(made));
      assert.deepEqual({ provider: made.provider, tries: made.tries, items: made.items }, { provider: 'code', tries: 0, items: 6 }, `${W}: written by code, no model call`);
      await page.waitForSelector('.maths-tv[data-screen="practice"] [data-role="maths-sheet"] .mb-item:nth-child(7)', { timeout: 15000 }).catch(() => null);
      await page.waitForTimeout(1500);
      m = await measure(page); assert.equal(m.screen, 'practice');
      const sh = await sheet(page);
      assert.equal(sh.rows.length, 6, `${W}: six questions on the paper`);
      for (const r of sh.rows) {
        assert.match(r.text, /^\d?Work ?out/, r.text); // the item number, then the words (the typesetter spaces them with spacer spans)
        assert.ok(r.inside, `${W}: "${r.text}" inside the paper`);
        assert.ok(r.fits, `${W}: "${r.text}" fits its row`);
        assert.equal(r.fracs, 2, `${W}: "${r.text}" sets both operands as stacked fractions`);
        assert.ok(r.numeralPx.length >= 4 && r.numeralPx.every((px) => px >= 28), `${W}: "${r.text}" numerals ${r.numeralPx.join(',')} px`);
      }
      assert.ok(sh.paperBottom <= 1026 + 2, `${W}: the paper ends above the safe line (${sh.paperBottom})`);
      clean(m, 'Practice'); await shot('practice-fractions');
      report.push({ viewport: `${W}x${H}`, route: made, questions: sh.rows.map((r) => r.text), numeralPx: [...new Set(sh.rows.flatMap((r) => r.numeralPx))], topicsFresh: topics, tonightFreshTitle: 'School maths, from the first step' });

      // ---- a learner with one-step equations secure: the title counts one of four, the needle stays on two-step
      seedLearners({ [LINEAR.id]: { id: LINEAR.id, skills: { 'linear-one-step': secureRec('linear-one-step') }, writing: {}, memory: [], history: [] } });
      await desk(LINEAR); await open('tonight');
      m = await measure(page);
      assert.equal(m.title, 'One of 4 topics secure', `${W}: Tonight counts the secure topic`);
      clean(m, 'Tonight (one-step secure)'); await shot('tonight-linear-secure');
      const tonightLinear = await ruler(page);
      assert.equal(tonightLinear.gap, false);
      await press('ArrowRight'); await press('Enter', 1500);
      const t2 = await ruler(page);
      assert.equal(t2.focused, NAMES[2], `${W}: Topics opens on two-step equations, not back on fractions`);
      assert.ok(t2.needle > 26 + 2 * 400, `${W}: the needle on two-step equations (${t2.needle})`);
      assert.equal(t2.gap, false); assert.equal(t2.tickWord, 'School');
      m = await measure(page); clean(m, 'Topics (one-step secure)'); await shot('topics-linear-secure');
      report.push({ viewport: `${W}x${H}`, tonightLinearTitle: 'One of 4 topics secure', topicsLinear: t2, tonightLinearNeedle: tonightLinear.needle });
      await ctx.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('school-fractions-live: ok'); console.log(JSON.stringify(report, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
