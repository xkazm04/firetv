/**
 * The family/adult seam (Family mode, Phase 1, W4; owner decision D1: no parent lock in Phase 1, so the seam changes
 * nothing a learner can see). What this suite pins:
 *   - PARITY: audienceAllowed answers every (age, type, adultConfirmed, audience) exactly as the function did at git HEAD
 *     b2018db, before W4. The expected value is a frozen copy written out below; the live function is only the actual.
 *   - modeOf's table: an explicit "family" always wins; a stored "adult" is NOT honoured (Phase 1), so the mode is the
 *     derived value, "adult" exactly when isAdult holds.
 *   - modeChecked drops junk from session.json and from a profile.draft patch; a patch may set only "family", never
 *     "adult"; an edit-save (the keys.ts copy list) keeps a stored "family"; reset leaves the mode unset; a session.json
 *     with no mode field loads unchanged.
 * Run with npm test in desk/ (directly: node tools/mode-rules-test.cjs). No model is called; a disposable data directory
 * under the OS temp dir, never desk/data.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-mode-')); process.env.DESK_DATA_DIR = data;
const src = (f) => path.join(root, 'src', f);
const storeFile = src('lib/session/store.ts');
const { audienceAllowed, isAdult: isAdultViaCurriculum } = require(src('lib/english/curriculum.ts'));
const { modeOf, isAdult } = require(src('lib/rules/mode.ts'));
let store = require(storeFile);
const { tvKey } = require(src('tv/keys.ts'));
after(() => { if (globalThis.__desk?.ticker) clearInterval(globalThis.__desk.ticker); fs.rmSync(data, { recursive: true, force: true }); });

// ------------------------------------------------------------------ today's functions, frozen from git HEAD b2018db
const frozenIsAdult = (p, prefs) => p?.age !== undefined ? p.age >= 18 : p?.type === 'other' && prefs.adultConfirmed;
const frozenAllowed = (p, prefs, audience) => {
  if (audience === 'school') return p?.type !== 'other' && (p?.age !== undefined ? p.age < 18 : p?.type === 'elementary' || p?.type === 'high-school');
  return audience === 'adult' ? frozenIsAdult(p, prefs) : audience === 'older' ? (p?.age ?? 0) >= 15 || p?.type === 'other' : true;
};

const AGES = [undefined, 5, 9, 12, 13, 14, 15, 17, 18, 25], TYPES = ['elementary', 'high-school', 'other'], AUDIENCES = ['all', 'school', 'older', 'adult'];
const profile = (age, type, extra = {}) => ({ id: 'p', name: 'P', type, ...(age === undefined ? {} : { age }), modules: ['english'], ...extra });
const prefs = (adultConfirmed) => ({ level: 'A1', interest: '', goal: '', creativity: 'familiar', challenge: 'supportive', correction: 'as-needed', adultConfirmed });
const KEYS = { busy: false, table: false, hintInFlight: false };

test('parity: audienceAllowed answers every combination as it did before W4 (10 ages x 3 types x 2 boxes x 4 audiences = 240)', () => {
  let n = 0;
  for (const age of AGES) for (const type of TYPES) for (const adultConfirmed of [false, true]) for (const audience of AUDIENCES) {
    const p = profile(age, type), pf = prefs(adultConfirmed);
    assert.equal(audienceAllowed(p, pf, audience), frozenAllowed(p, pf, audience), JSON.stringify({ age, type, adultConfirmed, audience }));
    assert.equal(isAdult(p, pf), frozenIsAdult(p, pf), JSON.stringify({ age, type, adultConfirmed }));
    n++;
  }
  assert.equal(n, 240);
  // no profile at all, and the mode a profile carries does not move the answer either
  for (const adultConfirmed of [false, true]) for (const audience of AUDIENCES) assert.equal(audienceAllowed(undefined, prefs(adultConfirmed), audience), frozenAllowed(undefined, prefs(adultConfirmed), audience), 'no profile');
  for (const mode of ['family', 'adult']) for (const audience of AUDIENCES) assert.equal(audienceAllowed(profile(25, 'other', { mode }), prefs(false), audience), frozenAllowed(profile(25, 'other'), prefs(false), audience), `mode ${mode} is not read by audienceAllowed`);
});
test('isAdult is one function: curriculum re-exports the one in rules/mode', () => { assert.equal(isAdultViaCurriculum, isAdult); });

test('modeOf: the derived value for each row', () => {
  const rows = [ // [profile, adultConfirmed, mode]
    [profile(25, 'other'), false, 'adult'], [profile(18, 'high-school'), false, 'adult'], [profile(18, 'elementary'), false, 'adult'], [profile(30, 'other'), true, 'adult'],
    [profile(17, 'high-school'), false, 'family'], [profile(16, 'high-school'), false, 'family'], [profile(15, 'high-school'), false, 'family'],
    [profile(17, 'other'), true, 'family'], [profile(12, 'elementary'), false, 'family'], [profile(13, 'high-school'), false, 'family'], [profile(9, 'elementary'), false, 'family'],
    [profile(undefined, 'elementary'), false, 'family'], [profile(undefined, 'high-school'), false, 'family'], [profile(undefined, 'high-school'), true, 'family'],
    [profile(undefined, 'other'), false, 'family'], [profile(undefined, 'other'), true, 'adult'],
  ];
  for (const [p, c, want] of rows) assert.equal(modeOf(p, prefs(c)), want, JSON.stringify([p, c]));
  assert.equal(modeOf(undefined, prefs(false)), 'family', 'no profile');
  assert.equal(modeOf(profile(undefined, 'other')), 'family', 'no prefs: "other" is unconfirmed');
  assert.equal(modeOf(profile(20, 'other')), 'adult', 'no prefs, age known');
  for (const age of AGES) for (const type of TYPES) for (const c of [false, true]) assert.equal(modeOf(profile(age, type), prefs(c)), isAdult(profile(age, type), prefs(c)) ? 'adult' : 'family', 'derived = isAdult, everywhere');
});
// Slice A5 (v2 decisions 2026-10-07, O1 = 18+) revised these rows on purpose: a stored "adult" is honoured where
// rules/mode adultAllowed holds (18+, or "other" with no age, whose Mode row is the confirmation). It pinned "never" before.
test('modeOf: an explicit "family" always wins; an explicit "adult" counts only behind the 18+ gate (A5)', () => {
  assert.equal(modeOf(profile(30, 'other', { mode: 'family' }), prefs(true)), 'family', 'family at 30');
  assert.equal(modeOf(profile(18, 'high-school', { mode: 'family' }), prefs(false)), 'family');
  assert.equal(modeOf(profile(undefined, 'other', { mode: 'family' }), prefs(true)), 'family');
  assert.equal(modeOf(profile(12, 'elementary', { mode: 'adult' }), prefs(false)), 'family', '12 with a stored adult');
  assert.equal(modeOf(profile(16, 'high-school', { mode: 'adult' }), prefs(false)), 'family', '16 with a stored adult');
  assert.equal(modeOf(profile(undefined, 'other', { mode: 'adult' }), prefs(false)), 'adult', '"other" with no age: choosing Adult (18+) is the confirmation');
  assert.equal(modeOf(profile(undefined, 'high-school', { mode: 'adult' }), prefs(true)), 'family', 'no age, school type');
  for (const age of [18, 25, 60]) for (const type of TYPES) for (const c of [false, true]) assert.equal(modeOf(profile(age, type, { mode: 'adult' }), prefs(c)), modeOf(profile(age, type), prefs(c)), 'an 18+ with a stored adult equals the derived value');
  for (const bad of [1, 'ADULT', '', null, {}, [], true]) assert.equal(modeOf(profile(12, 'elementary', { mode: bad }), prefs(false)), 'family', `junk ${JSON.stringify(bad)}`);
});

test('modeChecked drops junk and keeps family; a draft patch may set adult only where the gate allows (A5)', () => {
  const { modeChecked } = store;
  for (const bad of [1, 0, 'ADULT', 'Family', '', null, {}, [], true, false]) assert.equal('mode' in modeChecked({ id: 'p', mode: bad }), false, `dropped: ${JSON.stringify(bad)}`);
  assert.equal(modeChecked({ mode: 'family' }).mode, 'family'); assert.equal(modeChecked({ mode: 'adult' }).mode, 'adult', 'a stored adult is kept as data on load');
  assert.equal('mode' in modeChecked({ mode: 'adult' }, false), false, 'a patch cannot set adult'); assert.equal(modeChecked({ mode: 'family' }, false).mode, 'family');
  const unset = { id: 'p' }; assert.equal(modeChecked(unset), unset, 'no mode: the same object');
  // through the reducer
  const s0 = { ...store.fresh() };
  let s = store.reduce(s0, { type: 'profile.draft', patch: { name: 'Mia', type: 'elementary', age: 12, mode: 'adult' } });
  assert.equal(s.draft.mode, undefined, 'adult patch dropped at 12'); assert.equal(s.draft.name, 'Mia', 'the rest of the patch is kept');
  assert.equal(store.reduce(s0, { type: 'profile.draft', patch: { name: 'Ada', type: 'other', mode: 'adult' } }).draft.mode, 'adult', 'an "other" may choose Adult');
  assert.equal(store.reduce(s0, { type: 'profile.draft', patch: { name: 'Leo', type: 'high-school', age: 18, mode: 'adult' } }).draft.mode, 'adult', '18 may choose Adult');
  s = store.reduce(s0, { type: 'profile.draft', patch: { name: 'Mia', type: 'elementary', age: 12, mode: 'family' } }); assert.equal(s.draft.mode, 'family');
  s = store.reduce(s, { type: 'profile.draft', patch: { mode: 'adult' } }); assert.equal(s.draft.mode, 'family', 'a dropped adult does not erase the family already drafted');
  for (const bad of [1, 'ADULT', '', null, {}]) { s = store.reduce(s0, { type: 'profile.draft', patch: { mode: bad } }); assert.equal(s.draft.mode, undefined, `junk ${JSON.stringify(bad)}`); }
  s = store.reduce(store.reduce(s0, { type: 'profile.draft', patch: { name: 'Mia', type: 'elementary', age: 12, mode: 'family' } }), { type: 'profile.save' });
  assert.equal(s.profiles.find(p => p.name === 'Mia').mode, 'family', 'family survives the save');
});

test('an edit-save copies mode through the keys.ts list', () => {
  const p = { id: 'mia', name: 'Mia', type: 'elementary', age: 12, system: 'uk', modules: ['maths'], mode: 'family' };
  const s = { ...store.fresh(), learner: null, profiles: [p], screen: 'learner', focus: 0 };
  const draftOf = (prof) => tvKey({ ...s, profiles: [prof] }, 'menu', KEYS).events.find(e => e.type === 'profile.draft');
  const saved = (prof) => store.reduce(store.reduce({ ...s, profiles: [prof] }, draftOf(prof)), { type: 'profile.save' }).profiles.find(x => x.id === 'mia');
  const ev = draftOf(p);
  assert.ok(ev, 'menu on a learner opens their profile for editing'); assert.equal(ev.patch.mode, 'family', 'the copy list carries mode');
  assert.equal(store.reduce(s, ev).draft.mode, 'family');
  assert.equal(saved(p).mode, 'family', 'edit-save kept the stored family');
  const q = { ...p }; delete q.mode;
  assert.equal(saved(q).mode, undefined, 'unset stays unset');
  // a stored "adult" at 12 does not survive the gate (A5): the edit-save returns the profile to the derived default
  assert.equal(saved({ ...p, mode: 'adult' }).mode, undefined);
});

test('reset leaves mode unset (the derived default)', () => {
  const p = { id: 'mia', name: 'Mia', type: 'elementary', age: 12, modules: ['maths'], mode: 'family' };
  const s = { ...store.fresh(), profiles: [p], draft: { ...p }, learner: { id: 'mia', name: 'Mia' } };
  const r = store.reduce(s, { type: 'reset' });
  assert.equal(r.draft, null); assert.ok(r.profiles.every(x => !('mode' in x)), 'no profile carries a mode after reset');
  assert.ok(store.fresh().profiles.every(x => !('mode' in x)), 'fresh()');
  assert.equal(store.reduce(r, { type: 'profile.draft', patch: {} }).draft.mode, undefined, 'a new draft starts unset');
});

test('session.json: a file with no mode field loads unchanged; junk modes are dropped, family and a stored adult are kept', () => {
  const profiles = [{ id: 'ema', name: 'Ema', type: 'high-school', age: 16, modules: ['maths', 'english', 'essay'] }, { id: 'jakub', name: 'Jakub', type: 'other', modules: ['english', 'essay'], mathPath: 'calc1' }];
  const reload = (ps) => {
    fs.writeFileSync(path.join(data, 'session.json'), JSON.stringify({ learner: null, profiles: ps }));
    clearInterval(globalThis.__desk.ticker); delete globalThis.__desk; delete require.cache[storeFile]; store = require(storeFile);
    return store.getSession().profiles;
  };
  assert.deepEqual(reload(profiles), profiles, 'no mode field: identical profiles');
  const got = reload([{ ...profiles[0], mode: 'family' }, { ...profiles[1], mode: 'adult' }, { id: 'a', name: 'A', type: 'elementary', age: 9, modules: [], mode: 'ADULT' }, { id: 'b', name: 'B', type: 'elementary', age: 9, modules: [], mode: 7 }, { id: 'c', name: 'C', type: 'elementary', age: 9, modules: [], mode: null }]);
  assert.deepEqual(got.map(p => p.mode), ['family', 'adult', undefined, undefined, undefined]);
  assert.ok(got.slice(2).every(p => !('mode' in p)), 'junk keys are gone, not just undefined');
  assert.equal(got[1].mathPath, 'calc1', 'pathChecked still applies');
  assert.equal(modeOf(got[1], prefs(false)), 'adult', 'a stored adult on an "other" with no age is honoured since A5');
  assert.equal(modeOf({ ...got[0], mode: 'adult' }, prefs(true)), 'family', 'a stored adult at 16 never is');
});
