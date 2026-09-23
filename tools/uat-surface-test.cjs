/**
 * The LT driver reads the rendered TV and phone (uat/driver/surface.cjs), not a copy of them.
 * Run with npm test in desk/ (directly: node tools/uat-surface-test.cjs). Data in the OS temp dir, never desk/data;
 * the text engine is a registry stub that fails the suite if anything calls it.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk'), SURFACE = path.resolve(__dirname, '../uat/driver/surface.cjs'), DRIVER = path.resolve(__dirname, '../uat/driver/linga-text.cjs');
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'uat-surface-'));
process.env.DESK_DATA_DIR = data;
const surface = () => require(SURFACE);
// the same require hooks the driver uses: @/ into desk/src, TS and TSX through desk's typescript
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error('Run `npm install` in desk/ first.'); process.exit(1); }
const Module = require('node:module'), resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...rest) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...rest); };
require.extensions['.ts'] ??= (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);

let modelCalls = 0;
const registry = require(path.join(root, 'src/lib/engines/registry.ts'));
registry.useProvider('text', { name: 'stub', run: async () => { modelCalls++; throw new Error('no model call in this suite'); } });
const { emptyEnglish } = require(path.join(root, 'src/lib/english/types.ts'));
const { defaultPreferences, eligibleScenes } = require(path.join(root, 'src/lib/english/curriculum.ts'));
const { dispatch, getSession } = require(path.join(root, 'src/lib/session/store.ts'));
const V = require(path.join(root, 'src/lib/english/view.ts'));
after(() => { clearInterval(globalThis.__desk?.ticker); registry.resetProviders(); assert.equal(modelCalls, 0, 'no model was called'); fs.rmSync(data, { recursive: true, force: true }); });

// ---- fixtures: sessions the components render, as tools/linga-rules-test.cjs builds them
const topic = (title, skill = 'request') => ({ title, goal: 'Get it done.', why: 'You asked for it.', skill, audience: 'all', partner: 'Sam · Friend' });
const placed = (patch = {}) => ({ at: 1, band: 'B1', selfBand: null, confidence: 'medium', source: 'check', summary: 'You get by in everyday talk.', focus: 'Telling stories', tasks: [], ...patch });
const planned = (...ids) => ({ at: 1, band: 'B1', topics: ids.map(id => ({ id, ...topic('Topic ' + id) })) });
const convo = (patch = {}) => ({ id: 'c1', learnerId: 'ema', sceneId: 'booking', title: 'A booking', goal: 'Fix the booking.', partner: 'Robin · Receptionist', focusSkill: 'request', reviewSkill: 'repair', preferences: defaultPreferences(), turns: [{ id: 'p1', role: 'partner', text: 'Hello. How can I help?' }], coaching: null, moment: null, moments: [], phase: 'conversation', pending: null, error: '', paused: false, capture: false, captureAt: 0, audioNonce: 0, supported: false, cue: '', quizOpen: false, commands: [], evidence: [], startedAt: 1, ...patch });
const replied = [{ id: 'p1', role: 'partner', text: 'Hello. How can I help?' }, { id: 'l1', role: 'learner', text: 'I am work in hotel', mode: 'text' }, { id: 'p2', role: 'partner', text: 'Which hotel is it?' }];
const checkOf = (patch = {}) => ({ id: 'k1', learnerId: 'ema', stage: 'about', turns: [{ id: 'q1', role: 'tutor', text: 'Where do you use English in your life?' }], selfBand: null, goal: '', interest: '', read: '', task: null, tasks: [], placement: null, topics: [], pending: null, error: '', commands: [], audioNonce: 0, startedAt: 1, ...patch });
const chooseTask = { id: 't1', band: 'A2', kind: 'choose', prompt: 'A friend says hi. What do you say?', line: '', options: ['Hi! How are you?', 'Hi! I am fine yesterday.'], revealed: false };
const LINE = 'The train to Leeds leaves from platform four at ten past nine.';
const listenTask = revealed => ({ id: 't2', band: 'B1', kind: 'listen', prompt: 'Which platform does the train leave from?', line: LINE, options: [], revealed });
const MOMENTS = [
  { id: 'm1', kind: 'fix', said: 'I am work in hotel', better: 'I work in a hotel', why: 'Work is the verb here; no "am".', turnId: 'l1', at: 1 },
  { id: 'm2', kind: 'word', said: 'rezervace', better: 'reservation', why: 'The booking itself.', turnId: 'l2', at: 2 },
];
const TASKS = [
  { id: 'a', band: 'A2', kind: 'say', prompt: 'Tell me about your weekend.', line: '', options: [], response: 'I go to cinema with my brother.', mode: 'text', verdict: 'pass', quote: 'I go to cinema', note: 'Clear, with a missing article.' },
  { id: 'b', band: 'B1', kind: 'listen', prompt: 'Where is the meeting?', line: 'It moved to room six.', options: [], response: 'Room six', mode: 'text', verdict: 'pass', quote: 'Room six', note: 'Caught the change of room.' },
  { id: 'c', band: 'B2', kind: 'say', prompt: 'Argue for a four-day week.', line: '', options: [], response: 'It is better because people are more happy.', mode: 'text', verdict: 'partial', quote: 'more happy', note: 'A reason, but the comparative slips.' },
];
const fixture = (screen, { conversation = null, check = null, ...learning } = {}) => ({ screen, conversation, check, learning: { ...emptyEnglish(), ...learning } });
function sessionOf(fx) { dispatch({ type: 'reset' }); dispatch({ type: 'subject', subject: 'english' }); return { ...getSession(), screen: fx.screen, conversation: fx.conversation, check: fx.check, englishLearning: fx.learning }; }

/** The fifteen states of case 4, from a first visit to the recap. */
const STATES = {
  'first visit': fixture('linga'),
  'check about': fixture('linga-check', { check: checkOf() }),
  'choose task': fixture('linga-check', { check: checkOf({ stage: 'tasks', turns: [], task: chooseTask }) }),
  'listen unrevealed': fixture('linga-check', { check: checkOf({ stage: 'tasks', turns: [], task: listenTask(false) }) }),
  'listen revealed': fixture('linga-check', { check: checkOf({ stage: 'tasks', turns: [], task: listenTask(true) }) }),
  'verdict': fixture('linga-verdict', { check: checkOf({ stage: 'verdict', turns: [], placement: placed({ tasks: TASKS }) }) }),
  'plan ask-goal': fixture('linga-plan', { placement: placed(), check: checkOf({ stage: 'plan', turns: [], askGoal: true }) }),
  'plan topics': fixture('linga-plan', { placement: placed(), check: checkOf({ stage: 'plan', turns: [], topics: planned('p-a', 'p-b').topics }) }),
  'talk': fixture('linga-talk', { placement: placed(), conversation: convo({ turns: replied }) }),
  'talk quiz open': fixture('linga-talk', { placement: placed(), conversation: convo({ quizOpen: true, cue: 'Try: Could you check?' }) }),
  'paused': fixture('linga-talk', { placement: placed(), conversation: convo({ turns: replied, paused: true }) }),
  'moment': fixture('linga-moment', { placement: placed(), conversation: convo({ turns: replied, moment: MOMENTS[0] }) }),
  'coach': fixture('linga-coach', { placement: placed(), conversation: convo({ turns: replied, phase: 'coaching', coaching: { before: 'I am work in hotel', after: 'I work in a hotel', note: 'Say what you do with the verb alone.' } }) }),
  'recap': fixture('linga-recap', { placement: placed(), conversation: convo({ turns: replied, phase: 'finished', moments: MOMENTS }) }),
  'scenes': fixture('linga-scenes', { placement: placed() }),
};

test('case 1: the recap shows each moment\'s words, as the phone lists them, not a count', () => {
  const sf = surface().surfaceOf(sessionOf(STATES.recap));
  for (const m of MOMENTS) { assert(sf.shown.includes(m.said), `said: ${m.said}`); assert(sf.shown.includes(m.better), `better: ${m.better}`); }
  assert(sf.phone.includes('From this rehearsal'), 'read from the phone\'s own list');
});

test('case 2: a first visit offers the level check, the level picker and the phone\'s situation list; the TV names no situation', () => {
  const s = sessionOf(STATES['first visit']), sf = surface().surfaceOf(s);
  const ids = sf.offered.map(a => a.id);
  for (const id of ['find-level', 'pick-level', 'pick-situation']) assert(ids.includes(id), `${id} offered (got ${ids.join(', ')})`);
  const p = s.profiles.find(x => x.id === s.learner.id), scenes = eligibleScenes(p, defaultPreferences(p), s.englishLearning);
  assert(scenes.length > 2);
  for (const x of scenes) { assert(sf.phone.includes(x.name), `the phone names ${x.name}`); assert(!sf.tv.includes(x.name), `the TV does not name ${x.name}`); }
  const pick = sf.offered.find(a => a.id === 'pick-situation');
  assert.equal(pick.needs, 'sceneId'); assert.equal(pick.run.command.action, 'start'); assert.equal(pick.phoneOnly, true);
});

test('case 3: the verdict shows what Linga saw in each task: its response and its note', () => {
  const sf = surface().surfaceOf(sessionOf(STATES.verdict));
  for (const t of TASKS) { assert(sf.shown.includes(t.response), `response: ${t.response}`); assert(sf.shown.includes(t.note), `note: ${t.note}`); }
  assert.match(sf.phone, /What Linga saw \(collapsed; tap to open\)/);
});

test('case 4: in fifteen states every rendered control is a Linga view action and every view action has a control; strays 0', () => {
  const S = surface(), tally = [];
  for (const [name, fx] of Object.entries(STATES)) {
    const sf = S.surfaceOf(sessionOf(fx));
    assert.deepEqual(sf.strays, [], `${name}: rendered controls with no view action`);
    assert.deepEqual(sf.unrendered, [], `${name}: view actions with no rendered control`);
    for (const a of sf.offered) assert(V.VIEW_ACTION_IDS.includes(a.id), `${name}: ${a.id} is a view id`);
    for (const c of sf.controls.filter(c => !c.disabled)) assert(c.action || c.byDesign || !c.effect || !(c.effect.run || c.effect.post), `${name}: ${c.side} ${c.label}`);
    for (const c of sf.controls.filter(c => c.byDesign)) assert(Object.keys(S.BY_DESIGN_UNMAPPED).includes(c.label));
    assert(sf.offered.length > 0, `${name}: something to do`);
    tally.push(sf.controls.length);
  }
  // the TV's own state is rendered too: the menu and the level picker
  const menu = S.surfaceOf(sessionOf(STATES['first visit']), { menu: true });
  assert.deepEqual(menu.strays, []); assert.deepEqual(menu.unrendered, []);
  assert(menu.tv.includes('Select · My level'));
  const picker = S.surfaceOf(sessionOf(STATES['first visit']), { picking: 'B2' });
  assert.deepEqual(picker.unrendered, []); assert(picker.offered.some(a => a.id === 'this-is-my-level' && a.run.command.extra.band === 'B2'));
  assert(tally.reduce((a, b) => a + b) > 100, `controls read: ${tally.reduce((a, b) => a + b)}`);
});

test('case 5: a listening line is heard, not shown, until the learner asks for the words', () => {
  const S = surface();
  const hidden = S.surfaceOf(sessionOf(STATES['listen unrevealed']));
  assert.equal(hidden.heard, LINE);
  assert(!hidden.tv.includes(LINE) && !hidden.phone.includes(LINE) && !hidden.shown.includes(LINE), 'the line is on neither screen');
  assert(S.surfaceText(hidden).includes(`Heard from the TV: "${LINE}"`));
  assert(hidden.offered.some(a => a.id === 'show-words'));
  const shown = S.surfaceOf(sessionOf(STATES['listen revealed']));
  assert(shown.tv.includes(LINE), 'revealed, the TV shows it');
});

test('case 6: the judge reads a long screen whole, or with the cut named, never silently cut', () => {
  const { judgePayload, JUDGE_SCREEN_CAP } = require(DRIVER);
  const step = shown => ({ n: 1, screen: 'linga-talk', shown, action: 'answer', args: {}, thought: '', result: 'ok' });
  const record = shown => ({ endedBy: 'done', setup: [], facts: {}, steps: [step(shown)] });
  const five = 'x'.repeat(4999) + 'Z';
  const got = judgePayload(record(five)).steps[0].shown;
  assert(got === five || /\[\.\.\. \d+ more characters not shown\]$/.test(got), 'whole, or cut with a marker');
  assert.equal(got, five, '5,000 characters reach the judge whole');
  const long = 'y'.repeat(JUDGE_SCREEN_CAP + 1234);
  assert.match(judgePayload(record(long)).steps[0].shown, /\[\.\.\. 1234 more characters not shown\]$/);
});
