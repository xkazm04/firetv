/**
 * The adult-mode seam's rules (adult plan A1 safety half, A5; v2 decisions 2026-10-07 X4, V5).
 *   - audienceOf: the stricter of the model's label and the topic's words wins; the never-list refuses at every age.
 *     The table holds over 60 pitches, including the 2026-09-30 probe's romance labelled "all".
 *   - cleanTopic applies the gate, so a fresh proposal and a plan already on disk meet the same rule.
 *   - Linga plan commands (engine stubbed): a 13-year-old never receives an adult topic, whatever the label; a topic in
 *     the learner's own words is gated by those words; a never-list ask is refused before any model call.
 * Run with npm test in desk/ (directly: node tools/adult-rules-test.cjs). No model is called; a disposable data
 * directory under the OS temp dir, never desk/data.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-adult-')); process.env.DESK_DATA_DIR = data;
const src = (f) => path.join(root, 'src', f);
const { audienceOf, keywordAudience } = require(src('lib/english/gate.ts'));
const { cleanTopic } = require(src('lib/english/placement.ts'));
const engine = require(src('lib/engines/text.ts'));
let answer = async () => { throw new Error('no model call expected'); };
engine.text = (req) => answer(req);
const { englishCommand } = require(src('lib/english/conversation.ts'));
const { defaultPreferences } = require(src('lib/english/curriculum.ts'));
const { dispatch, getSession } = require(src('lib/session/store.ts'));
after(() => { if (globalThis.__desk?.ticker) clearInterval(globalThis.__desk.ticker); fs.rmSync(data, { recursive: true, force: true }); });

// ------------------------------------------------------------------ the keyword table
// [text, the model's label, expected audience (null = refused)]
const ROWS = [
  // the probe: romance labelled "all" must come out adult
  ['Asking your crush to the school dance, and what to say if they kiss you', 'all', 'adult'],
  ['A first date at an Italian restaurant', 'all', 'adult'],
  ['Going on a date with someone from your class', 'school', 'adult'],
  ['Ask her out after the concert', 'all', 'adult'],
  ['Talking with your girlfriend about the summer', 'all', 'adult'],
  ['A boyfriend who forgot your birthday', 'older', 'adult'],
  ['Flirting with the barista', 'all', 'adult'],
  ['A romantic dinner for two', 'all', 'adult'],
  ['Dating apps and first messages', 'older', 'adult'],
  ['Ordering a beer at the bar', 'all', 'adult'],
  ['Choosing a wine for dinner', 'all', 'adult'],
  ['Cocktails at a rooftop party', 'all', 'adult'],
  ['A night out at the nightclub', 'older', 'adult'],
  ['Meeting friends at the pub', 'all', 'adult'],
  ['Waiting at the bar for a friend', 'all', 'adult'],
  ['A bar crawl in Prague', 'all', 'adult'],
  ['Too drunk to get home', 'all', 'adult'],
  ['A hangover on Monday morning', 'all', 'adult'],
  ['A weekend at the casino', 'all', 'adult'],
  ['Gambling with friends online', 'older', 'adult'],
  ['Betting on the football match', 'all', 'adult'],
  ['A poker night with colleagues', 'all', 'adult'],
  ['Buying cigarettes at the kiosk', 'all', 'adult'],
  ['Smoking outside the office', 'all', 'adult'],
  ['Vaping behind the gym', 'school', 'adult'],
  ['Someone offers you drugs at a festival', 'older', 'adult'],
  ['A honeymoon in Greece', 'all', 'adult'],
  ['Booking a table for date night', 'all', 'adult'],
  // older: job and money trouble
  ['A job interview for a summer job', 'all', 'older'],
  ['An interview for the role of assistant', 'all', 'older'],
  ['Asking your boss for a pay rise', 'all', 'older'],
  ['Talking about salary in a new job', 'all', 'older'],
  ['Calling the landlord about a broken heater', 'all', 'older'],
  ['Your friend got fired from the cafe', 'all', 'older'],
  ['Explaining a layoff to your team', 'all', 'older'],
  // a label is never lowered by words
  ['Planning a trip to the mountains', 'adult', 'adult'],
  ['A disagreement with a neighbour', 'older', 'older'],
  ['The lost jacket', 'school', 'school'],
  // ordinary topics stay where they are: the words must not over-block a child's everyday English
  ['Gaming with friends', 'all', 'all'],
  ['Planning a trip to the seaside', 'all', 'all'],
  ['A bar of chocolate at the shop', 'all', 'all'],
  ['Reading a bar chart in maths class', 'school', 'school'],
  ['Fixing the date of your booking', 'all', 'all'],
  ['Choose a date for the school trip', 'school', 'school'],
  ['An update about the football team', 'all', 'all'],
  ['Ask your teacher to explain it out loud', 'school', 'school'],
  ['Interviewing a classmate for the school newspaper', 'school', 'school'],
  ['A public library card', 'all', 'all'],
  ['Making ginger biscuits with grandma', 'all', 'all'],
  ['The smoke alarm in the kitchen', 'all', 'all'],
  ['A drugstore without the medicine you need', 'all', 'all'],
  ['An argument with your little brother about the TV', 'all', 'all'],
  ['Weeding the garden with your dad', 'all', 'all'],
  ['A high score on the mountain level', 'all', 'all'],
  ['Essex or Kent for the holiday', 'all', 'all'],
  ['Ordering juice at a cafe', 'all', 'all'],
  ['The missing moon rover', 'all', 'all'],
  // the never-list refuses at every age and every label
  ['A sex scene in the film', 'adult', null],
  ['Naked photos sent by a stranger', 'adult', null],
  ['Talking someone out of suicide', 'adult', null],
  ['Ways to self-harm', 'older', null],
  ['A self harm diary', 'all', null],
  ['Torture in the cellar', 'adult', null],
  ['Porn on a shared laptop', 'adult', null],
  ['A rape scene', 'adult', null],
  ['Grooming a younger player online', 'all', null],
];

test(`audienceOf: the stricter of label and words, the never-list refuses (${ROWS.length} rows)`, () => {
  assert(ROWS.length >= 60, 'the plan asks for at least 60 pitches');
  for (const [text, label, want] of ROWS) assert.equal(audienceOf(text, label), want, `"${text}" labelled ${label}`);
});
test('keywordAudience reads the words alone', () => {
  assert.equal(keywordAudience('A first date'), 'adult');
  assert.equal(keywordAudience('A job interview'), 'older');
  assert.equal(keywordAudience('Gaming with friends'), 'all');
  assert.equal(keywordAudience('porn'), null);
  assert.equal(keywordAudience(''), 'all');
});

// ------------------------------------------------------------------ cleanTopic carries the gate
const topic = (patch) => ({ id: 'plan-x', title: 'Gaming with friends', goal: 'Talk about it.', why: 'You asked for it.', skill: 'describe', audience: 'all', partner: 'Sam · Friend', premise: 'A friendly chat.', cue: 'Try: I like…', quiz: { question: 'Which fits?', options: ['I like it.', 'Yesterday.'], correct: 0 }, ...patch });
test('cleanTopic raises the audience from any shown or played field, and drops a never-list topic', () => {
  assert.equal(cleanTopic(topic({})).audience, 'all');
  assert.equal(cleanTopic(topic({ premise: 'You meet your crush and they try to kiss you.' })).audience, 'adult', 'the premise the partner plays');
  assert.equal(cleanTopic(topic({ partner: 'Alex · Your date' , title: 'A first date' })).audience, 'adult');
  assert.equal(cleanTopic(topic({ cue: 'Try: Can I buy you a beer?' })).audience, 'adult', 'the cue shown on the TV');
  assert.equal(cleanTopic(topic({ goal: 'Prepare for a job interview.' })).audience, 'older');
  assert.equal(cleanTopic(topic({ why: 'You asked about naked selfies.' })), null);
  assert.equal(cleanTopic(topic({ audience: 'adult' })).audience, 'adult', 'a label is never lowered');
});

// ------------------------------------------------------------------ Linga plan commands, engine stubbed
let counter = 0;
const command = (action, extra = {}) => englishCommand({ action, learnerId: getSession().learner.id, commandId: `adult-${++counter}`, ...extra });
async function seat(id, patch) {
  dispatch({ type: 'reset' });
  dispatch({ type: 'profile.draft', patch: { id, name: id, modules: ['english'], ...patch } });
  dispatch({ type: 'profile.save' });
  dispatch({ type: 'learner.set', id });
  dispatch({ type: 'subject', subject: 'english' });
  const profile = getSession().profiles.find(p => p.id === id);
  // A known goal, so plan-propose asks the model at once (check.ts: no goal and no interest asks the learner first).
  await command('preferences', { preferences: { ...defaultPreferences(profile), goal: 'chat with friends', adultConfirmed: profile.type === 'other' }, notes: [] });
}
const proposing = (topics, onAsk) => { let calls = 0; answer = async (req) => { const p = JSON.parse(req.prompt); if (p.step !== 'plan') throw new Error('unexpected ' + p.step); calls++; if (onAsk) onAsk(p); return { json: { topics: topics.slice(0, p.count) }, provider: 'test', ms: 1 }; }; return () => calls; };
const plain = (title, audience, patch = {}) => { const { id, ...t } = topic({ title, audience, ...patch }); return t; };

test('a 13-year-old never receives an adult topic, whatever the model labels it', async () => {
  await seat('klara', { type: 'elementary', age: 13 });
  proposing([plain('Your crush at the dance', 'all', { premise: 'Ask your crush to dance; maybe a kiss.' }), plain('Planning a picnic', 'all'), plain('A first date', 'all'), plain('Board games night', 'all'), plain('Cocktails with friends', 'all'), plain('A job interview', 'all'), plain('The school library', 'all')]);
  await command('plan-propose');
  const titles = getSession().check.topics.map(t => t.title);
  assert.deepEqual(titles.filter(t => /crush|date|Cocktail|interview/.test(t)), [], `no adult or older topic reached the plan: ${titles.join(', ')}`);
  assert(titles.includes('Planning a picnic'));
  assert(getSession().check.topics.every(t => t.audience === 'all' || t.audience === 'school'));
});
test('a child\'s own adult ask is refused on its words; an adult topic the model invents is still filtered', async () => {
  await seat('klara', { type: 'elementary', age: 13 });
  proposing([plain('Planning a picnic', 'all'), plain('Board games night', 'all')]);
  await command('plan-propose');
  const k = getSession().check, before = k.topics.length;
  const calls = proposing([plain('Talking with a new friend', 'all')]);
  await assert.rejects(command('plan-add', { checkId: k.id, text: 'I want to practise asking my crush out on a date' }), e => e.status === 400 && /for older learners/.test(e.message));
  assert.equal(calls(), 0, 'refused on the words, before any model call');
  assert.equal(getSession().check.topics.length, before, 'nothing was added');
  // The backstop behind it: an innocent ask the model turns into an adult topic is still filtered by the topic's own words.
  proposing([plain('A first date', 'all', { premise: 'Your crush asks you out.' })]);
  await assert.rejects(command('plan-add', { checkId: k.id, text: 'meeting someone new' }), e => /no topic this learner can practise/.test(e.message));
  assert.equal(getSession().check.topics.length, before);
});
test('an adult\'s own ask keeps its adult audience', async () => {
  await seat('martin', { type: 'other', age: 45 });
  proposing([plain('Planning a picnic', 'all'), plain('Board games night', 'all')]);
  await command('plan-propose');
  const k = getSession().check;
  proposing([plain('Talking with a new friend', 'all')]);
  await command('plan-add', { checkId: k.id, text: 'Ordering wine on a first date' });
  assert.equal(getSession().check.topics.at(-1).audience, 'adult');
});
test('a never-list ask is refused before any model call, at any age', async () => {
  await seat('martin', { type: 'other', age: 45 });
  proposing([plain('Planning a picnic', 'all'), plain('Board games night', 'all')]);
  await command('plan-propose');
  const k = getSession().check, calls = proposing([plain('Anything', 'adult')]);
  await assert.rejects(command('plan-add', { checkId: k.id, text: 'a porn shoot' }), e => e.status === 400 && /can't practise/.test(e.message));
  assert.equal(calls(), 0);
});

// ------------------------------------------------------------------ A5: the Mode row and the 18+ gate
const { modeOf, adultAllowed } = require(src('lib/rules/mode.ts'));
const { profileRows, modeCells, locate, flat } = require(src('tv/profileRows.ts'));
const store = require(src('lib/session/store.ts'));
const { tvKey } = require(src('tv/keys.ts'));
const KEYS = { ev: () => {}, nav: () => {}, focus: () => {}, move: () => {} };

test('A5: adultAllowed is 18+, or "other" with no age; every school age under 18 is refused', () => {
  for (let age = 6; age <= 17; age++) for (const type of ['elementary', 'high-school', 'other']) assert.equal(adultAllowed({ age, type }), false, `${type} ${age}`);
  for (const age of [18, 19, 30, 70]) for (const type of ['elementary', 'high-school', 'other']) assert.equal(adultAllowed({ age, type }), true, `${type} ${age}`);
  assert.equal(adultAllowed({ type: 'other' }), true, '"other" with no age: the Mode row is the confirmation');
  assert.equal(adultAllowed({ type: 'high-school' }), false); assert.equal(adultAllowed({ type: 'elementary' }), false); assert.equal(adultAllowed(undefined), false);
});
test('A5: the profile shows the Mode row only where there is a choice (18+, or "other")', () => {
  const mode = (d) => profileRows(d).find(r => r.title === 'Mode')?.cells;
  assert.equal(mode({ type: 'elementary', age: 12, modules: [] }), undefined, 'under 18: no row, the mode is Family');
  assert.equal(mode({ type: 'high-school', age: 17, modules: [] }), undefined);
  assert.equal(mode(null), undefined, 'a fresh draft is a high-school learner with no age yet');
  assert.deepEqual(mode({ type: 'high-school', age: 18, modules: [] }).map(c => c.mode), ['family', 'adult']);
  assert.deepEqual(mode({ type: 'other', modules: [] }).map(c => c.mode), ['family', 'adult']);
  assert.match(modeCells({ type: 'elementary', age: 12 })[0].blurb, /18 and over/, 'the cells still say why, where they are used');
  assert.equal(profileRows({ type: 'other', modules: [] }).findIndex(r => r.title === 'Mode'), 1, 'right under the type (no age row for "other")');
  assert.deepEqual(modeCells({ type: 'other' }).map(c => c.label), ['Family', 'Adult (18+)']);
});
test('A5: Select on Adult drafts it; the age dropping under 18 takes it away, a saved adult reads as adult', () => {
  const s0 = { ...store.fresh(), learner: null, screen: 'profile' };
  let s = store.reduce(s0, { type: 'profile.draft', patch: { name: 'Ada', type: 'high-school', age: 19, modules: ['english'] } });
  const rows = profileRows(s.draft), r = rows.findIndex(x => x.title === 'Mode');
  const ev = tvKey({ ...s, focus: flat(rows, r, 1) }, 'select', KEYS).events.find(e => e.type === 'profile.draft');
  assert.deepEqual(ev.patch, { mode: 'adult' });
  s = store.reduce(s, ev); assert.equal(s.draft.mode, 'adult');
  assert.equal(store.reduce(s, { type: 'profile.draft', patch: { age: 16 } }).draft.mode, undefined, 'under 18: adult is gone');
  assert.equal(store.reduce(s, { type: 'profile.draft', patch: { type: 'elementary' } }).draft.mode, undefined, 'a school type with no age: gone');
  const saved = store.reduce(s, { type: 'profile.save' }).profiles.find(p => p.name === 'Ada');
  assert.equal(saved.mode, 'adult'); assert.equal(modeOf(saved), 'adult');
  const back = store.reduce(store.reduce(s, { type: 'profile.draft', patch: { mode: 'family' } }), { type: 'profile.save' }).profiles.find(p => p.name === 'Ada');
  assert.equal(modeOf(back), 'family', 'back to Family is always allowed');
});
test('A5: the Linga age gate is unchanged by the mode: Adult mode on a 16-year-old is impossible, and audienceAllowed reads age, not mode', () => {
  const { audienceAllowed } = require(src('lib/english/curriculum.ts'));
  const teen = { id: 't', name: 'T', type: 'high-school', age: 16, modules: ['english'], mode: 'adult' };
  assert.equal(modeOf(teen), 'family');
  assert.equal(audienceAllowed(teen, defaultPreferences(teen), 'adult'), false);
});
test('V2-O3: the profile\'s Adult (18+) is the one confirmation Linga needs; Family on the same profile is not', () => {
  const { audienceAllowed, eligibleScenes } = require(src('lib/english/curriculum.ts'));
  const other = { id: 'o', name: 'O', type: 'other', modules: ['english'] }, unticked = defaultPreferences(other);
  assert.equal(audienceAllowed(other, unticked, 'adult'), false, 'no confirmation anywhere: no adult scenes, as before');
  assert.equal(audienceAllowed({ ...other, mode: 'adult' }, unticked, 'adult'), true, 'Adult (18+) on the profile is enough');
  assert(eligibleScenes({ ...other, mode: 'adult' }, unticked).some(s => s.id === 'date'));
  assert.equal(audienceAllowed({ ...other, mode: 'family' }, unticked, 'adult'), false);
  assert.equal(audienceAllowed({ ...other, mode: 'adult', age: 16 }, unticked, 'adult'), false, 'an age always decides first');
  assert.equal(audienceAllowed({ id: 'h', name: 'H', type: 'high-school', mode: 'adult', modules: [] }, { ...unticked, adultConfirmed: true }, 'adult'), false, 'a school type with no age never');
});
