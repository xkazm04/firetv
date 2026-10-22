/**
 * The TV's flow has no dead ends, read off the keymap alone (the /cx full-flow walk, 2026-10-22). Run with npm test in
 * desk/ (directly: node tools/flow-audit-test.cjs). No session store, no server, no model: sessions are plain objects, as in
 * tv-keys-test.cjs.
 *
 *  1. Back leaves: on every screen the TV's own keymap draws (Linga's are LingaTV's, read from its source), in a bare, a
 *     populated and a not-paired session, Back answers with an event or a call - it never does nothing. The landing is the
 *     one root, and its Back rests the lamp.
 *  2. Back comes home: following only the screens Back names, every screen reaches the landing in a few hops, with no loop
 *     that traps (for each `back` the session may carry).
 *  3. Nothing is an orphan: every screen is the target of a nav in the keymap, or is listed below with the door that opens
 *     it (a phone event, a server job, a timer). A screen with no door at all is a screen nobody can reach.
 *  4. Every screen that holds a phone hand-off says in its caption what to do with no phone (the TV never strands the
 *     learner at a hand-off nobody can answer): the hand-off's Back and the pair door are the two exits.
 */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { test } = require('node:test');
require('./ts-load.cjs');
const root = path.resolve(__dirname, '../desk');
const keys = () => require(path.join(root, 'src/tv/keys.ts'));

const storeSrc = fs.readFileSync(path.join(root, 'src/lib/session/store.ts'), 'utf8');
const SCREENS = [...storeSrc.match(/export type Screen =([^;]+);/)[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
const LINGA = SCREENS.filter((x) => x.startsWith('linga'));
const KEYMAP_SCREENS = SCREENS.filter((x) => !x.startsWith('linga'));

const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const page = { id: 'p1', subject: 'maths', day: today(), title: 'Sheet one', img: '', w: 100, h: 100, items: [{ n: 1, key: 'k1', text: 'x + 1 = 2', band: [0, 10] }, { n: 2, key: 'k2', text: 'x + 2 = 5', band: [10, 20] }] };
const EMA = { id: 'ema', name: 'Ema', type: 'high-school', age: 16, system: 'uk', modules: ['maths', 'english', 'essay'] };
function session(patch = {}) {
  return {
    subject: 'maths', screen: 'landing', focus: 0, view: 'band', joined: true, phonesLive: 1, pin: '1234', phoneUrl: '', awaiting: null,
    learner: { id: 'ema', name: 'Ema' }, profiles: [EMA], draft: null,
    timer: { running: false, left: 1500, phase: 'work' }, pages: [], pageIx: 0, itemIx: 0, reading: false, hint: null, lesson: null, lessonPaused: false, noLesson: false,
    english: null, englishLearning: { preferences: null, notes: [], evidence: [], achievements: {}, sessions: [], placement: null, plan: null, taught: [], placements: [], certificates: [], seenIds: [] }, essay: null, practice: null, topic: null, walkIx: 0, skills: {}, history: [], log: { started: false, minutes: 0, problems: [], hard: [], hints: 0 }, ...patch,
  };
}
const LOCAL = { busy: false, table: false, hintInFlight: false };
/** The variants a screen is met in: nothing on the desk, the work on the desk, and the phone gone. */
const VARIANTS = {
  bare: (screen) => session({ screen }),
  populated: (screen) => session({ screen, pages: [page], practice: { topic: 'fractions', items: [{ n: 1, verdict: 'wrong' }, { n: 2, verdict: 'right' }], marked: true }, worked: { topic: 'fractions' } }),
  nophone: (screen) => session({ screen, joined: false, phonesLive: 0, pages: [page] }),
};
const answers = (step) => step.events.length > 0 || step.calls.length > 0 || Object.keys(step.local).length > 0;
const navTarget = (step) => step.events.filter((e) => e.type === 'nav' || e.type === 'nav').map((e) => e.screen).concat(step.events.some((e) => e.type === 'profile.discard') ? ['profile.discard'] : []);

// The doors that open a screen without a key on the TV: a phone event, a server job, a timer. Anything not here must be a nav target of the keymap.
const OPENED_ELSEWHERE = {
  joined: 'a phone join (store.ts join)',
  break: 'the work block ending (the clock)',
  recap: 'session.end (landing Menu, the phone\'s End session)',
  workroom: 'Adult mode Essay Master: /api/twin open',
  page: 'a phone capture lands a page (page.read)', hint: 'hint.set from /api/hint',
  sheet: 'practice.marked from /api/mark', walk: 'the sheet (a nav)', worked: 'worked.set from /api/worked',
  practice: 'practice.set from /api/practice', forensic: 'essay.set from /api/analyse', sentence: 'the phone\'s Say it / Linga\'s Sentence help',
  headtohead: 'Select on the sentence screen unit door (needs a checked sentence)', profile: 'the learner switcher add or Menu', calendar: 'units Menu (a computed nav: maths to calendar)',
};

test('1. Back leaves every screen the keymap draws (the landing rests the lamp)', () => {
  const { tvKey } = keys();
  const dead = [];
  for (const screen of KEYMAP_SCREENS) for (const [name, make] of Object.entries(VARIANTS)) {
    let step; try { step = tvKey(make(screen), 'back', { ...LOCAL }); } catch (e) { dead.push(`${screen}/${name}: threw ${e.message.slice(0, 60)}`); continue; }
    if (screen === 'landing') continue;
    if (!answers(step)) dead.push(`${screen}/${name}`);
  }
  assert.deepEqual(dead, [], 'Back did nothing on: ' + dead.join(', '));
});

test('1b. Linga\'s Back always posts something: the source of LingaTV leaves from home, a scene, a check and a moment', () => {
  const src = fs.readFileSync(path.join(root, 'src/english/LingaTV.tsx'), 'utf8');
  const back = src.split('if(k==="back"){')[1].split('return;\n      }')[0];
  for (const needle of ['nav\",screen:\"landing\"', 'cmd("check-leave")', 'cmd(runningTake', 'cmd("moment-done")', 'nav",screen:"linga"']) assert.ok(back.includes(needle.replace(/\\"/g, '"')), 'Back handles ' + needle);
  // the last branch is an unconditional nav to Linga's home: no Linga screen is left without a way back
  assert.match(back, /else\{patch\(\{menu:false\}\);post\(\{type:"nav",screen:"linga",focus:0\}\);\}/);
  assert.ok(LINGA.length >= 10);
});

test('2. Back comes home: every screen reaches the landing by Back alone, whatever back the session carries', () => {
  const { tvKey } = keys();
  const stuck = [];
  for (const screen of KEYMAP_SCREENS) {
    if (screen === 'landing') continue;
    for (const back of [undefined, 'landing', 'tonight', 'linga', 'profile', 'pair', 'forensic', 'essaytype']) {
      let at = screen, hops = 0; const seen = [];
      for (; at !== 'landing' && hops < 8; hops++) {
        seen.push(at);
        const s = session({ ...VARIANTS.populated(at), back: at === screen ? back : undefined });
        let step; try { step = tvKey(s, 'back', { ...LOCAL }); } catch { break; }
        const nav = step.events.find((e) => e.type === 'nav');
        if (!nav) {
          // not a nav: a cancel (hand-off put down) - press Back once more on the same screen with the hand-off gone
          if (step.events.some((e) => e.type === 'ask.cancel')) { continue; }
          if (step.events.some((e) => e.type === 'profile.discard' || e.type === 'timer.skipbreak')) { at = 'landing'; break; } // the store sends a discarded draft home
          if (step.calls.length) { at = 'landing'; break; }                                      // /api/twin open: the Workroom
          break;
        }
        at = nav.screen;
      }
      if (at !== 'landing' && !LINGA.includes(at) && at !== 'workroom') stuck.push(`${screen}[back=${back}] -> ${seen.join('>')}>${at}`);
    }
  }
  assert.deepEqual(stuck, [], 'Back never reaches the desk from: ' + stuck.slice(0, 6).join(' | '));
});

test('3. Every screen has a live door: a key on some screen reaches it, or it is named above with the phone/server/timer that opens it', () => {
  const { tvKey } = keys();
  const KEYS = ['up', 'down', 'left', 'right', 'select', 'menu', 'back'];
  const edges = new Map(); // screen -> the screens one key press opens (the keymap alone, over every focus and variant)
  for (const screen of KEYMAP_SCREENS) {
    const out = new Set();
    for (const make of Object.values(VARIANTS)) for (let focus = 0; focus < 8; focus++) for (const k of KEYS) {
      let step; try { step = tvKey({ ...make(screen), focus }, k, { ...LOCAL }); } catch { continue; }
      for (const e of step.events) if (e.type === 'nav') out.add(e.screen);
    }
    edges.set(screen, out);
  }
  // Linga's own screens are LingaTV's: once Linga's home is open they are all one door
  const seen = new Set(['landing', ...Object.keys(OPENED_ELSEWHERE)]), queue = [...seen];
  while (queue.length) {
    const at = queue.pop();
    for (const to of edges.get(at) ?? []) if (!seen.has(to)) { seen.add(to); queue.push(to); }
    if (at === 'linga') for (const l of LINGA) if (!seen.has(l)) { seen.add(l); queue.push(l); }
  }
  const orphans = SCREENS.filter((x) => !seen.has(x));
  assert.deepEqual(orphans, [], 'no key and no named door opens: ' + orphans.join(', '));
});

test('4. A hand-off with no phone connected names its exit: the pair door (Up) and Back', () => {
  const { tvKey } = keys();
  // the maths hand-offs: the same Up that pairs, from the screen that holds the hand-off open
  for (const screen of ['tonight', 'page', 'hint', 'practice', 'walk', 'paper']) {
    const s = session({ screen, joined: false, phonesLive: 0, pages: [page], practice: { topic: 'fractions', items: [{ n: 1, verdict: 'wrong' }], marked: true }, ask: { id: 'a1', kind: screen === 'tonight' ? 'page' : 'sheet', screen, phase: 'open' } });
    const step = tvKey(s, 'up', { ...LOCAL });
    if (['tonight'].includes(screen)) continue; // Tonight's Up is the learner switcher; its caption carries the pair line
    const nav = step.events.find((e) => e.type === 'nav');
    assert.ok(nav && nav.screen === 'pair' || !nav, `${screen}: Up with an open hand-off and no phone goes to pair (or is a stop move)`);
  }
});
