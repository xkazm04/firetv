/**
 * Linga's certificate on the real TV and phone (Family W10). Two 12-year-olds are written into a scratch learners.json:
 * Mia has earned A2 (a level check at A2 with high confidence, a plan of six topics in varied skills, and her own spoken
 * and typed replies for every required skill), with an earlier A1 certificate already opened and the A2 one issued by
 * the desk's own rules (lib/english/cert.ts issue) and not opened yet; Leo has the same check and plan but one required
 * skill only with help, so he holds no certificate and his plate is an outline with one open slot; Ana has two required
 * skills only with help (two open slots, linga-B: the certificate shows what it still needs); Sam picked his band by hand. At 1920 x 1080 and 1280 x 720 it photographs Mia's Linga home (the
 * "Your certificate" door lit first), the plate, the list of certificates and an earlier one; Leo's home and menu (no
 * door, no "My certificate"); and the phone's My map for Mia at 390 x 844.
 *
 * It asserts, on every TV screen: all text inside the 96 / 54 px safe zone of the 1920 x 1080 stage, nothing under
 * 28 px except uppercase labels of 20-22 px, exactly one focused action; on the plate: no digit anywhere but the band's.
 * Not part of `npm test` (it needs a server); it skips politely unless LINGA_CERT_URL is set. Run it against an isolated
 * server whose engines cannot be reached, so any model call fails loudly:
 *
 *   DESK_DATA_DIR=<scratch dir> CLAUDE_BIN=<a path that does not exist> OLLAMA_HOST=http://127.0.0.1:9 \
 *     npx next dev --webpack -p 3475                                                   (in a copy of desk/)
 *   LINGA_CERT_URL=http://localhost:3475 DESK_DATA_DIR=<the same dir> node tools/linga-cert-live.cjs
 *
 * Screenshots go to artifacts/linga-cert/ (git-ignored). Playwright is resolved from tools/node_modules. Refuses desk/data.
 */
if (!process.env.LINGA_CERT_URL) { console.log('linga-cert-live: skipped (set LINGA_CERT_URL to an isolated dev server, and DESK_DATA_DIR to its data directory)'); process.exit(0); }
const { chromium } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
if (!process.env.DESK_DATA_DIR) throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test writes the learners there and opens the TV with its key.');
const data = path.resolve(process.env.DESK_DATA_DIR), real = path.resolve(__dirname, '../desk/data');
if (data === real || data.startsWith(real + path.sep)) throw new Error('Refusing to run against desk/data: use a scratch DESK_DATA_DIR.');
const base = process.env.LINGA_CERT_URL.replace(/\/$/, '');
const out = path.resolve(__dirname, '../artifacts/linga-cert'); fs.mkdirSync(out, { recursive: true });

// the desk's own rules, transpiled as the rule suites do: the certificate is issued by cert.ts, not written by hand
const root = path.resolve(__dirname, '../desk'), ts = require(path.join(root, 'node_modules/typescript'));
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const { mergeEvidence } = require(path.join(root, 'src/lib/english/rules.ts'));
const C = require(path.join(root, 'src/lib/english/cert.ts'));
const { emptyEnglish } = require(path.join(root, 'src/lib/english/types.ts'));

const PROFILE = (id, name) => ({ id, name, type: 'elementary', age: 12, system: 'uk', modules: ['maths', 'english', 'essay'] });
const MIA = PROFILE('cert-mia', 'Mia'), LEO = PROFILE('cert-leo', 'Leo'), ANA = PROFILE('cert-ana', 'Ana'), SAM = PROFILE('cert-sam', 'Sam');
const day = (month, d, h = 18) => new Date(2026, month, d, h).getTime();
const topic = (id, skill, title) => ({ id, title, goal: 'Talk it through.', why: 'You chose it.', skill, audience: 'all', partner: 'Sam · Friend', premise: 'A friendly chat at school.', cue: 'Try: I think…', quiz: { question: 'Which fits?', options: ['I think so.', 'Yesterday.'], correct: 0 } });
const PLAN = { at: day(8, 14), band: 'A2', topics: [topic('p1', 'describe', 'My favourite games'), topic('p2', 'negotiate', 'Planning a class trip'), topic('p3', 'narrate', 'The day the bus broke down'), topic('p4', 'request', 'Asking at the library'), topic('p5', 'relate', 'A friend who likes other music'), topic('p6', 'repair', 'When the teacher talks fast')] };
const LINES = { contact: 'Hi, I am Mia and I like drawing.', repair: 'Sorry, could you say that again more slowly?', request: 'Could I borrow this book until Friday, please?', describe: 'I like football because it is fast and fun.', narrate: 'First the bus stopped, so we walked to school.', negotiate: 'How about we visit the museum in the morning?', relate: 'I see it differently, but I like your songs too.' };
const own = (skill, i, supported = false) => [
  { id: `${skill}-a`, episodeId: `ep-${i}`, turnId: `${skill}-t1`, sceneId: 'meet', skill, at: day(8, 16 + i, 18), mode: 'speech', supported, success: true, quote: LINES[skill], note: 'Said it clearly.' },
  { id: `${skill}-b`, episodeId: `ep-${i + 1}`, turnId: `${skill}-t2`, sceneId: 'lost', skill, at: day(8, 17 + i, 19), mode: i % 2 ? 'speech' : 'text', supported, success: true, quote: LINES[skill], note: 'Did it on their own.' },
];
const CHECK = { at: day(8, 12), band: 'A2', confidence: 'high', source: 'check', summary: 'You handle short, everyday exchanges well.' };
const PLACEMENT = { at: CHECK.at, band: 'A2', selfBand: 'A2', confidence: 'high', source: 'check', summary: CHECK.summary, focus: 'Telling what happened', tasks: [] };
const PREFS = { level: 'A2', interest: 'games and music', goal: 'talk with friends', creativity: 'playful', challenge: 'supportive', correction: 'as-needed', adultConfirmed: false };
function mia(seen) {
  const skills = Object.keys(LINES);
  let l = mergeEvidence({ ...emptyEnglish(), preferences: PREFS, placement: PLACEMENT, plan: PLAN, sessions: PLAN.topics.slice(0, 3).map((t, i) => ({ id: 's' + i, sceneId: t.id, title: t.title, at: day(8, 16 + i), turns: 5 })) }, skills.flatMap((s, i) => own(s, i)));
  const older = { id: 'cert-A1-june', at: day(5, 12), band: 'A1', topics: ['Meeting a new classmate', 'Asking for help'], skills: [{ skill: 'contact', mode: 'spoken', quote: 'Hello, my name is Mia.', at: day(5, 10) }, { skill: 'repair', mode: 'spoken', quote: 'Can you say it again?', at: day(5, 11) }, { skill: 'request', mode: 'written', quote: 'Can I have a pencil, please?', at: day(5, 11) }], checkAt: day(5, 1) };
  l = { ...l, placements: [{ at: day(5, 1), band: 'A1', confidence: 'medium', source: 'check', summary: 'You use simple words well.' }, CHECK], certificates: [older], seenIds: [older.id] };
  const got = C.withCertificate(l, day(8, 29, 19));
  assert.ok(got.cert, 'the desk\'s own rule issues the A2 certificate from this record');
  return { ...got.learning, seenIds: seen ? [older.id, got.cert.id] : [older.id] };
}
function leo() {
  const skills = Object.keys(LINES);
  const l = mergeEvidence({ ...emptyEnglish(), preferences: PREFS, placement: PLACEMENT, plan: PLAN, placements: [CHECK] }, skills.flatMap((s, i) => own(s, i, s === 'narrate')));
  assert.equal(C.issue(l, Date.now()), null, 'narrate only with help: no certificate');
  return l;
}
/** Ana: the same check and plan as Leo, but narrate and negotiate only with help, so two slots are open. */
function ana() {
  const skills = Object.keys(LINES);
  const l = mergeEvidence({ ...emptyEnglish(), preferences: PREFS, placement: PLACEMENT, plan: PLAN, placements: [CHECK] }, skills.flatMap((s, i) => own(s, i, s === 'narrate' || s === 'negotiate')));
  assert.equal(C.issue(l, Date.now()), null, 'two skills only with help: no certificate');
  assert.deepEqual(C.certGap(l).open, ['narrate', 'negotiate']);
  return l;
}
/** Sam: his level was picked by hand, so no certificate can rest on it. */
function sam() {
  const l = { ...leo(), placements: [{ at: CHECK.at, band: 'A2', confidence: 'low', source: 'self' }], placement: { ...PLACEMENT, source: 'self', confidence: 'low' } };
  assert.equal(C.certGap(l).blocker, 'self');
  return l;
}
function seed(seen = false) {
  const file = path.join(data, 'learners.json');
  const book = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8') || '{}') : {};
  book[MIA.id] = { id: MIA.id, english: mia(seen), skills: {}, writing: {}, memory: [], history: [], digest: [] };
  book[LEO.id] = { id: LEO.id, english: leo(), skills: {}, writing: {}, memory: [], history: [], digest: [] };
  book[ANA.id] = { id: ANA.id, english: ana(), skills: {}, writing: {}, memory: [], history: [], digest: [] };
  book[SAM.id] = { id: SAM.id, english: sam(), skills: {}, writing: {}, memory: [], history: [], digest: [] };
  fs.mkdirSync(data, { recursive: true }); fs.writeFileSync(file, JSON.stringify(book));
}

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

/** Every run of text on the Linga stage: where it sits (1920 x 1080 stage pixels), its size; the focused actions; the plate's words. */
async function measure(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.linga-tv'), stage = document.querySelector('.stage').getBoundingClientRect(), k = stage.width / 1920;
    const outside = [], small = [], seen = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.trim(), el = n.parentElement;
      if (!text || !el || el.closest('[aria-hidden="true"], .lo-sr')) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const b = range.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      const cs = getComputedStyle(el), size = parseFloat(cs.fontSize) / k, upper = cs.textTransform === 'uppercase' || text === text.toUpperCase();
      const box = { x0: Math.round((b.left - stage.left) / k), x1: Math.round((b.right - stage.left) / k), y0: Math.round((b.top - stage.top) / k), y1: Math.round((b.bottom - stage.top) / k) };
      const row = `${el.className || el.tagName} "${text.slice(0, 32)}" ${size.toFixed(1)}px ${box.x0},${box.y0}-${box.x1},${box.y1}`;
      seen.push(row);
      if (box.x0 < 96 - 2 || box.x1 > 1824 + 2 || box.y0 < 54 - 2 || box.y1 > 1026 + 2) outside.push(row);
      if (size < 27.5 && !(upper && size >= 19.5 && size <= 22.5)) small.push(row);
    }
    const focused = [...root.querySelectorAll('.lo-action[data-focused="true"]')].map((b) => b.textContent.trim());
    const clipped = [...root.querySelectorAll('.lo-action')].filter((b) => b.scrollWidth > b.clientWidth + 1).map((b) => b.textContent.trim());
    const rest = [...root.querySelectorAll('.lo-action[data-rest="true"]')].map((b) => b.textContent.trim());
    const plate = root.querySelector('[data-role="linga-plate"]');
    // the words a viewer reads on the plate screen: everything on the stage but the footer's place tag and buttons
    const words = [...root.querySelectorAll('.lo-panel, .lo-arch .lo-tag, .lo-top')].map((x) => x.innerText).join('\n');
    const pr = plate?.getBoundingClientRect(), panel = root.querySelector('.lo-panel')?.getBoundingClientRect();
    return { outside, small, seen, focused, clipped, rest, view: root.dataset.view, fit: root.dataset.fit ?? '0', words, plate: pr ? { y0: Math.round((pr.top - stage.top) / k), y1: Math.round((pr.bottom - stage.top) / k) } : null, panelTop: panel ? Math.round((panel.top - stage.top) / k) : null,
      title: root.querySelector('[data-role="linga-title"]')?.textContent ?? '', actions: [...root.querySelectorAll('.lo-action')].map((b) => b.textContent.trim()) };
  });
}

(async () => {
  seed(false);
  await asTheTV();
  await event({ type: 'reset' });
  for (const p of [MIA, LEO, ANA, SAM]) { await event({ type: 'profile.draft', patch: p }); await event({ type: 'profile.save' }); }
  await event({ type: 'join' });
  const browser = await chromium.launch({ headless: true });
  const errors = [], report = [];
  const check = (label, m, { plate = false } = {}) => {
    assert.deepEqual(m.outside, [], `${label}: text inside the 96/54 px safe zone`);
    assert.deepEqual(m.small, [], `${label}: no text under 28 px (20-22 px uppercase labels excepted)`);
    assert.deepEqual(m.clipped, [], `${label}: every action's words fit its door`);
    assert.equal(m.focused.length + (m.focused.length ? 0 : m.rest.length), 1, `${label}: exactly one focused action (${m.focused.join(' | ')})`);
    if (plate) assert.doesNotMatch(m.words.split('A2').join('').split('A1').join(''), /\d/, `${label}: no digit on the plate but the band's:\n${m.words}`);
    report.push({ label, view: m.view, fit: m.fit, title: m.title, focused: m.focused, actions: m.actions, plate: m.plate, panelTop: m.panelTop });
  };
  try {
    for (const [W, H] of [[1920, 1080], [1280, 720]]) {
      seed(false);
      await event({ type: 'learner.set', id: MIA.id }); await event({ type: 'subject', subject: 'english' }); await event({ type: 'nav', screen: 'linga', focus: 0 });
      const ctx = await browser.newContext({ viewport: { width: W, height: H + 130 } }), page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      const shot = (name) => page.locator('.frame').screenshot({ path: path.join(out, `${name}-${W}x${H}.png`) });
      const at = async (view) => { await page.waitForSelector(`.linga-tv[data-view="${view}"]`, { timeout: 20000 }); await page.waitForTimeout(900); };
      await page.goto(base + '/tv?key=' + encodeURIComponent(key)); await at('linga');
      await page.locator('.stage').click({ position: { x: 4, y: 4 } });
      let m = await measure(page); await shot('01-mia-home');
      assert.equal(m.actions[0].replace(/\s+/g, ' ').startsWith('Your certificate'), true, `${W}: the certificate is home's first door (${m.actions.join(' | ')})`);
      check(`${W} mia home`, m);
      await page.keyboard.press('Enter'); await at('linga-cert');
      m = await measure(page); await shot('02-plate');
      assert.match(m.title, /^A2 Everyday basics$/);
      check(`${W} plate`, m, { plate: true });
      await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500);
      m = await measure(page); await shot('03-plate-earlier-focused'); check(`${W} plate, earlier focused`, m, { plate: true });
      await page.keyboard.press('Enter'); await at('linga-certs');
      m = await measure(page); await shot('04-list'); check(`${W} list`, m);
      await page.keyboard.press('ArrowDown'); await page.waitForTimeout(400);
      await page.keyboard.press('Enter'); await page.waitForFunction(() => document.querySelector('[data-role="linga-title"]')?.textContent === 'A1 First words', null, { timeout: 15000 }); await page.waitForTimeout(700);
      m = await measure(page); await shot('05-earlier-plate'); check(`${W} earlier plate`, m, { plate: true });
      await page.keyboard.press('Escape'); await at('linga');
      m = await measure(page); await shot('06-mia-home-after');
      assert.ok(!m.actions[0].startsWith('Your certificate'), `${W}: opened, the door is gone`);
      check(`${W} mia home after`, m);
      // Leo: the same check and plan, one required skill only with help: no door on home; the menu door (linga-B) opens the outline
      await event({ type: 'learner.set', id: LEO.id }); await event({ type: 'subject', subject: 'english' }); await event({ type: 'nav', screen: 'linga', focus: 0 });
      await page.waitForFunction(() => document.querySelector('.lo-learner')?.textContent.includes('Leo'), null, { timeout: 15000 }); await page.waitForTimeout(800);
      m = await measure(page); await shot('07-leo-home');
      assert.ok(!m.actions.some((a) => a.includes('certificate')), `${W}: Leo has no certificate door`);
      check(`${W} leo home`, m);
      await page.keyboard.press('m'); await page.waitForTimeout(600);
      m = await measure(page); await shot('08-leo-menu');
      assert.ok(m.actions.some((a) => /my certificate/i.test(a)), `${W}: Leo's menu opens the certificate outline (${m.actions.join(' | ')})`);
      check(`${W} leo menu`, m);
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      // Ana: two open slots. Menu, My certificate: the plate in outline, the open skills as dashed slots, no number
      await event({ type: 'learner.set', id: ANA.id }); await event({ type: 'subject', subject: 'english' }); await event({ type: 'nav', screen: 'linga', focus: 0 });
      await page.waitForFunction(() => document.querySelector('.lo-learner')?.textContent.includes('Ana'), null, { timeout: 15000 }); await page.waitForTimeout(800);
      await page.keyboard.press('m'); await page.waitForTimeout(600);
      for (let i = 0; i < 9 && !(await measure(page)).focused.some((f) => /my certificate/i.test(f)); i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(350); }
      m = await measure(page); await shot('10-ana-menu-door'); check(`${W} ana menu`, m);
      await page.keyboard.press('Enter'); await at('linga-cert');
      m = await measure(page); await shot('11-ana-outline');
      assert.match(m.title, /^A2 Everyday basics$/);
      assert.equal(await page.locator('.lo-plate-slot').count(), 2, `${W}: two open slots`);
      assert.equal(await page.locator('.lo-plate-quote').count(), 0, `${W}: no quote on an outline`);
      check(`${W} ana outline`, m, { plate: true });
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      // Sam: a band picked by hand, so the plate has no slots, one sentence, and Find my level
      await event({ type: 'learner.set', id: SAM.id }); await event({ type: 'subject', subject: 'english' }); await event({ type: 'nav', screen: 'linga-cert', focus: 0 });
      await page.waitForFunction(() => document.querySelector('.lo-learner')?.textContent.includes('Sam'), null, { timeout: 15000 }); await page.waitForTimeout(800);
      await at('linga-cert'); m = await measure(page); await shot('12-sam-find-level');
      assert.equal(await page.locator('.lo-plate-slot').count(), 0, `${W}: no slots for a hand-picked band`);
      assert.ok(m.actions[0].startsWith('Find my level'), `${W}: Find my level first (${m.actions.join(' | ')})`);
      check(`${W} sam`, m, { plate: true });
      await ctx.close();
    }
    // the phone: Mia's My map at 390 x 844
    await event({ type: 'learner.set', id: MIA.id }); await event({ type: 'subject', subject: 'english' }); await event({ type: 'nav', screen: 'linga', focus: 0 });
    const pin = (await current()).pin;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('phone: ' + e.message));
    await page.goto(base + '/phone?pin=' + pin);
    await page.waitForFunction(async () => (await (await fetch('/api/session')).json()).viewer === 'phone', null, { timeout: 20000 });
    await page.waitForFunction(() => document.querySelector('.ptop .link b')?.textContent === 'joined', null, { timeout: 20000 });
    await page.waitForTimeout(1200);
    await page.locator('.pnav').getByRole('button', { name: 'Linga', exact: true }).click();
    await page.getByRole('button', { name: 'My map', exact: true }).click();
    await page.waitForSelector('[data-role="linga-cert"]', { timeout: 15000 }); await page.waitForTimeout(500);
    const phone = await page.evaluate(() => {
      const card = document.querySelector('[data-role="linga-cert"]'), de = document.documentElement;
      return { text: card.innerText, over: de.scrollWidth - de.clientWidth, sizes: [...card.querySelectorAll('b, p, summary')].map((el) => parseFloat(getComputedStyle(el).fontSize)) };
    });
    await page.screenshot({ path: path.join(out, '09-phone-my-map.png'), fullPage: true });
    await page.locator('[data-role="linga-cert"]').screenshot({ path: path.join(out, '09-phone-my-map-card.png') });
    assert.equal(phone.over, 0, 'the phone page is no wider than the screen');
    assert.doesNotMatch(phone.text.split('A2').join('').split('A1').join(''), /\d/, `the phone's certificate words carry no count:\n${phone.text}`);
    assert.ok(Math.min(...phone.sizes) >= 12, 'no line under 12 px on the phone');
    report.push({ label: 'phone My map', text: phone.text });
    await ctx.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  assert.deepEqual(errors, [], 'no page errors');
  console.log('linga-cert-live: ok'); console.log(JSON.stringify(report, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
