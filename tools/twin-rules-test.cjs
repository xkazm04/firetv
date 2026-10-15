/**
 * The twin (v2 T2 and T5-lite): lib/twin/card.ts, lib/twin/state.ts, lib/twin/workroom.ts, /api/twin, /api/twin/card,
 * the Workroom's keys.
 *   - the portrait: channels by format, born at three pieces, exemplars newest first, cut at 500 characters, the
 *     learner's left-out pieces never among them;
 *   - the card: valid against the vendored Twin Card 1.0 schema (docs/standards/twin-card/1.0, a small validator here
 *     for the keywords it uses), each part's SHA-256 over its RFC 8785 form, the spec's own examples reproduced;
 *   - the routes: the card only for Adult mode, only once born, only to a phone or PC; the TV gets counts and level
 *     words and never a sentence; workroom.set is the desk's own (refused from a client); delete-all leaves nothing;
 *   - the keys: an adult opening Essay Master asks the desk for the Workroom; Up/Down/Right/Select/Back on it.
 * Run with npm test in desk/ (directly: node tools/twin-rules-test.cjs). No model is called; a disposable data dir.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test, after } = require('node:test');
const root = path.resolve(__dirname, '../desk');
require('./ts-load.cjs');
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-twin-')); process.env.DESK_DATA_DIR = data;
const src = (f) => path.join(root, 'src', f);
const C = require(src('lib/twin/card.ts'));
const T = require(src('lib/session/texts.ts'));
const { dispatch, getSession } = require(src('lib/session/store.ts'));
const twin = require(src('app/api/twin/route.ts')), cardRoute = require(src('app/api/twin/card/route.ts'));
const texts = require(src('app/api/texts/route.ts')), session = require(src('app/api/session/route.ts'));
const keys = require(src('tv/keys.ts'));
after(() => { if (globalThis.__desk?.ticker) clearInterval(globalThis.__desk.ticker); fs.rmSync(data, { recursive: true, force: true }); });
const STD = path.resolve(__dirname, '../docs/standards/twin-card/1.0');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(STD, 'twin-card.schema.json'), 'utf8'));

/** A small JSON Schema validator for the keywords the Twin Card schema uses; returns the list of failures. */
function validate(schema, v, at = '$', out = []) {
  if (schema.$ref) return validate(schema.$ref.split('/').slice(1).reduce((o, k) => o[k], SCHEMA), v, at, out);
  const typeOf = (x) => (x === null ? 'null' : Array.isArray(x) ? 'array' : Number.isInteger(x) ? 'integer' : typeof x);
  if (schema.type) { const ok = [].concat(schema.type).some((t) => t === typeOf(v) || (t === 'number' && typeof v === 'number')); if (!ok) { out.push(`${at}: ${typeOf(v)} is not ${schema.type}`); return out; } }
  if ('const' in schema && JSON.stringify(schema.const) !== JSON.stringify(v)) out.push(`${at}: not ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(v))) out.push(`${at}: ${JSON.stringify(v)} not in enum`);
  if (schema.oneOf) { const n = schema.oneOf.filter((s) => !validate(s, v, at).length).length; if (n !== 1) out.push(`${at}: matches ${n} of oneOf`); }
  if (typeof v === 'string') {
    if (schema.minLength !== undefined && [...v].length < schema.minLength) out.push(`${at}: shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && [...v].length > schema.maxLength) out.push(`${at}: longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(v)) out.push(`${at}: does not match ${schema.pattern}`);
    if (schema.format === 'date-time' && !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(Z|[+-]\d\d:\d\d)$/.test(v)) out.push(`${at}: not a date-time`);
  }
  if (typeof v === 'number') {
    if (schema.minimum !== undefined && v < schema.minimum) out.push(`${at}: below ${schema.minimum}`);
    if (schema.maximum !== undefined && v > schema.maximum) out.push(`${at}: above ${schema.maximum}`);
  }
  if (Array.isArray(v)) {
    if (schema.minItems !== undefined && v.length < schema.minItems) out.push(`${at}: fewer than ${schema.minItems}`);
    if (schema.maxItems !== undefined && v.length > schema.maxItems) out.push(`${at}: more than ${schema.maxItems}`);
    if (schema.uniqueItems && new Set(v.map((x) => JSON.stringify(x))).size !== v.length) out.push(`${at}: not unique`);
    if (schema.items) v.forEach((x, i) => validate(schema.items, x, `${at}[${i}]`, out));
  }
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const k of schema.required ?? []) if (!(k in v)) out.push(`${at}: ${k} is required`);
    for (const [k, x] of Object.entries(v)) {
      if (schema.propertyNames) validate(schema.propertyNames, k, `${at}{${k}}`, out);
      if (schema.properties?.[k]) validate(schema.properties[k], x, `${at}.${k}`, out);
      else if (schema.additionalProperties === false) out.push(`${at}: ${k} is not allowed`);
      else if (typeof schema.additionalProperties === 'object') validate(schema.additionalProperties, x, `${at}.${k}`, out);
    }
  }
  return out;
}
const integrityOk = (card) => Object.entries(card.integrity.parts).every(([k, h]) => C.sha256(C.canonical(card[k])) === h);

let clock = 1_000_000;
const piece = (id, format, ...versions) => ({ id, format, title: id, versions: versions.map((text) => ({ at: ++clock, source: 'paste', text })) });
const MSG = ['hey, running late, 10 min', 'ok see you at the pub — mine is a pint', 'cant make it tmrw, sorry. next week?', 'lol yes. bring the charger pls'];
const msgs = (n) => MSG.slice(0, n).map((t, i) => piece(`t-00000000000${i}`, 'message', t));

test('the portrait: channels by format, born at three, newest first, cut at 500, left-out pieces never exemplars', () => {
  assert.deepEqual(['email', 'message', 'essay', 'letter'].map(C.channelOf), ['email', 'chat', 'generic', 'generic']);
  const two = C.portraitOf(msgs(2));
  assert.equal(two.born, false); assert.equal(two.channels[0].pieces, 2); assert.equal(C.buildCard({ name: 'M', pieces: msgs(2), cardId: 'x', createdAt: 'x', exportedAt: 'x' }), null, 'no card before birth');
  const long = piece('t-0000000000ff', 'email', `Dear Ana, ${'word '.repeat(200)}`);
  const p = C.portraitOf([...msgs(3), long], new Set(['t-000000000001']));
  assert.deepEqual(p.channels.map((c) => [c.channel, c.pieces, c.born]), [['chat', 3, true], ['email', 1, false]]);
  assert.deepEqual(p.channels[0].exemplars.map((e) => e.pieceId), ['t-000000000002', 't-000000000000'], 'newest first, the left-out one gone');
  const cut = p.channels[1].exemplars[0].text; assert(cut.length <= C.EXEMPLAR_MAX && cut.endsWith('…') && !/wor…$/.test(cut), 'cut at a word');
  const v = piece('t-0000000000aa', 'message', 'first take', 'second take'); assert.equal(C.portraitOf([v]).channels[0].exemplars[0].text, 'second take', 'the latest version');
  assert.deepEqual(C.levelWords({ formality: 1, warmth: 3, humor: 2, energy: 1, length: 1, directness: 2, expressiveness: 2, detail: 1 }).slice(0, 2), [{ dim: 'formality', level: 1, word: 'intimate' }, { dim: 'warmth', level: 3, word: 'cordial' }]);
});
test('canonical JSON is RFC 8785 for card values, and the spec\'s own examples reproduce their hashes', () => {
  assert.equal(C.canonical({ b: [1, 'é', null], a: { d: true, c: '\u0007"' }, u: undefined }), '{"a":{"c":"\\u0007\\"","d":true},"b":[1,"é",null]}');
  assert.throws(() => C.canonical({ x: 0.5 }), /integers only/);
  for (const f of ['minimal.twin.json', 'full.twin.json']) {
    const ex = JSON.parse(fs.readFileSync(path.join(STD, 'examples', f), 'utf8'));
    assert.deepEqual(validate(SCHEMA, ex), [], `${f} is valid (the validator agrees with the spec)`);
    assert(integrityOk(ex), `${f}: every part's hash reproduces`);
  }
});
test('the card: schema-valid, hashes over each part, allowances from the person\'s own exemplars', () => {
  const card = C.buildCard({ name: 'Martin', pieces: [...msgs(4), piece('t-0000000000e0', 'email', 'Hi Ana, the files are attached. Martin')], excluded: new Set(['t-000000000003']), cardId: '6f1c1f39-5d4e-4c7b-9f43-0d8a7b3c2e11', createdAt: '2026-10-07T10:00:00Z', exportedAt: '2026-10-07T11:00:00Z' });
  assert.deepEqual(validate(SCHEMA, card), []);
  assert(integrityOk(card));
  assert.deepEqual(card.voice.channels.map((c) => c.channel), ['chat'], 'only born channels travel');
  assert.equal(card.voice.channels[0].exemplars.length, 3); assert(!JSON.stringify(card).includes('charger'), 'the left-out piece is not in the card');
  assert.equal(card.voice.quality_rules.dash_policy, 'allow', 'their own exemplar uses a clause dash');
  assert.equal(card.evidence.readiness_percent, 100);
  const bad = JSON.parse(JSON.stringify(card)); bad.voice.channels[0].style.dims.humor = 7; bad.voice.channels[0].exemplars[0].source = 'invented'; bad.surprise = 1;
  assert(validate(SCHEMA, bad).length >= 2, 'the validator rejects a broken card'); assert(!integrityOk(bad), 'and the hash no longer holds');
});

// ------------------------------------------------------------------ routes
const R = (url, method, body, role = 'phone') => new Request(`http://desk${url}`, { method, headers: role ? { 'x-desk-role': role } : {}, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
const makeProfile = (patch) => { dispatch({ type: 'profile.draft', patch }); dispatch({ type: 'profile.save' }); return getSession().learner.id; };
const keepAll = async (list) => { await texts.POST(R('/api/texts', 'POST', { notice: true })); for (const t of list) assert.equal((await texts.POST(R('/api/texts', 'POST', { text: t, format: 'message' }))).status, 200); };

test('routes: born at three, the card only for Adult mode on a phone or PC, the TV never gets a sentence', async () => {
  const kid = makeProfile({ id: 'kid', name: 'Ema', type: 'high-school', age: 13 });
  await keepAll(MSG.slice(0, 3));
  assert.equal((await cardRoute.GET(R('/api/twin/card', 'GET'))).status, 403, 'family mode: no card');
  const kidView = await (await twin.GET(R('/api/twin', 'GET'))).json(); assert.equal(kidView.adult, false); assert.equal(kidView.born, true);
  await texts.DELETE(R('/api/texts?all=1', 'DELETE'));

  const me = makeProfile({ id: 'martin', name: 'Martin Novák', type: 'other', mode: 'adult' });
  assert.equal(me, 'martin');
  await keepAll(MSG.slice(0, 2));
  assert.equal((await cardRoute.GET(R('/api/twin/card', 'GET'))).status, 409, 'not born yet');
  assert.equal(getSession().workroom.pieces.length, 2, 'the shelf change reached the Workroom');
  await keepAll(MSG.slice(2, 4));
  const view = await (await twin.GET(R('/api/twin', 'GET'))).json();
  assert.equal(view.adult, true); assert.equal(view.born, true); assert.equal(view.channels[0].exemplars.length, 4);
  assert.equal((await cardRoute.GET(R('/api/twin/card', 'GET', undefined, 'tv'))).status, 403, 'the TV never downloads the card');
  assert.equal((await cardRoute.GET(R('/api/twin/card', 'GET', undefined, 'guest'))).status, 403);
  const res = await cardRoute.GET(R('/api/twin/card', 'GET'));
  assert.equal(res.status, 200); assert.equal(res.headers.get('content-type'), 'application/vnd.twin-card+json');
  assert.match(res.headers.get('content-disposition'), /filename="martin-novak\.twin\.json"/);
  const card = await res.json(); assert.deepEqual(validate(SCHEMA, card), []); assert(integrityOk(card));
  const again = await (await cardRoute.GET(R('/api/twin/card', 'GET'))).json(); assert.equal(again.card_id, card.card_id, 'the card id is stable across exports');

  // the TV: counts and level words, never a sentence
  assert.equal((await twin.GET(R('/api/twin', 'GET', undefined, 'tv'))).status, 200);
  const s = getSession(); assert.equal(s.screen, 'workroom'); assert.equal(s.subject, 'essay');
  const onTv = JSON.stringify(s.workroom); for (const t of MSG) for (const w of t.split(/\W+/).filter((x) => x.length > 4)) assert(!onTv.includes(w), `"${w}" is not on the TV`);
  assert.equal((await twin.POST(R('/api/twin', 'POST', { exclude: 'x', on: true }, 'tv'))).status, 403, 'the TV cannot change the review');
});
test('routes: leave a piece out and put it back; the card follows; workroom.set from a client is refused', async () => {
  const view = await (await twin.GET(R('/api/twin', 'GET'))).json(), id = view.channels[0].exemplars[0].pieceId;
  assert.equal((await twin.POST(R('/api/twin', 'POST', { exclude: 't-ffffffffffff', on: true }))).status, 404);
  assert.equal((await twin.POST(R('/api/twin', 'POST', { exclude: id }))).status, 400);
  assert.deepEqual((await (await twin.POST(R('/api/twin', 'POST', { exclude: id, on: true }))).json()).excluded, [id]);
  const v2 = await (await twin.GET(R('/api/twin', 'GET'))).json();
  assert.equal(v2.channels[0].exemplars.find((e) => e.pieceId === id).included, false, 'still listed, so it can go back');
  const card = await (await cardRoute.GET(R('/api/twin/card', 'GET'))).json(); assert.equal(card.voice.channels[0].exemplars.length, 3);
  await twin.POST(R('/api/twin', 'POST', { exclude: id, on: false }));
  assert.equal((await (await cardRoute.GET(R('/api/twin/card', 'GET'))).json()).voice.channels[0].exemplars.length, 4);
  for (const role of ['phone', 'tv', 'guest']) {
    const r = await session.POST(R('/api/session', 'POST', { type: 'workroom.set', workroom: { owner: 'martin', pieces: [{ id: 'x', title: 'FAKE', format: 'message', versions: 1, paragraphs: 1, updated: 0, diff: null }], channels: [], born: false, need: 3 }, open: true }, role));
    assert.equal(r.status, 403, role);
  }
  assert(!JSON.stringify(getSession().workroom).includes('FAKE'));
  dispatch({ type: 'workroom.set', workroom: { owner: 'someone-else', pieces: [], channels: [], born: false, need: 3 } });
  assert.equal(getSession().workroom.owner, 'martin', 'another learner\'s Workroom never lands');
});
test('routes: delete-all leaves no file, the Workroom empties, and nobody seated is refused', async () => {
  await twin.POST(R('/api/twin', 'POST', { open: true }, 'tv'));
  await texts.DELETE(R('/api/texts?all=1', 'DELETE'));
  assert.equal(fs.existsSync(path.join(data, 'texts', 'martin')), false, 'no twin.json, no folder');
  assert.deepEqual(getSession().workroom.pieces, []); assert.equal(getSession().workroom.born, false);
  await twin.GET(R('/api/twin', 'GET'));
  assert.equal(fs.existsSync(path.join(data, 'texts', 'martin')), false, 'looking does not recreate it');
  dispatch({ type: 'learner.set', id: 'kid' }); assert.equal(getSession().workroom, null, 'a learner change clears it');
  dispatch({ type: 'reset' });
  assert.equal((await twin.GET(R('/api/twin', 'GET'))).status, 409); assert.equal((await cardRoute.GET(R('/api/twin/card', 'GET'))).status, 409);
});

// ------------------------------------------------------------------ keys
const LOCAL = { busy: false, table: false, hintInFlight: false };
const base = (patch) => ({ subject: 'essay', screen: 'landing', focus: 0, view: 'band', joined: true, pin: '1234', phoneUrl: '', awaiting: null, learner: { id: 'm', name: 'Martin' },
  profiles: [{ id: 'm', name: 'Martin', type: 'other', mode: 'adult', modules: ['maths', 'english', 'essay'] }], draft: null, timer: { running: false, left: 1500, phase: 'work' }, pages: [], pageIx: 0, itemIx: 0,
  reading: false, hint: null, lesson: null, lessonPaused: false, noLesson: false, english: null, essay: null, practice: null, topic: null, walkIx: 0, skills: {}, history: [], log: { started: false, minutes: 0, problems: [], hard: [], hints: 0 }, ...patch });
const WR = { owner: 'm', pieces: [{ id: 'a' }, { id: 'b' }], channels: [], born: false, need: 3 };
test('keys: the Workroom is Essay Master\'s; Up/Down walk the pieces, Right goes to the lenses, Back to the desk', () => {
  assert(keys.ESSAY_SCREENS.includes('workroom')); assert(keys.essayOwns(base({ screen: 'workroom' })));
  assert.equal(keys.isAdultHere(base()), true);
  assert.equal(keys.isAdultHere(base({ profiles: [{ id: 'm', name: 'M', type: 'high-school', age: 13, mode: 'adult', modules: [] }] })), false, 'a child is never adult');
  const s = base({ screen: 'workroom', workroom: WR });
  assert.deepEqual(keys.workroomStops(s), ['a', 'b', 'lenses']);
  const focus = (st) => st.events.filter((e) => e.type === 'focus').at(-1)?.focus;
  assert.equal(focus(keys.tvKey(s, 'down', LOCAL)), 1);
  assert.equal(focus(keys.tvKey(s, 'right', LOCAL)), 2);
  assert.equal(focus(keys.tvKey({ ...s, focus: 2 }, 'left', LOCAL)), 0);
  const nav = (st) => st.events.filter((e) => e.type === 'nav').at(-1)?.screen;
  assert.equal(nav(keys.tvKey({ ...s, focus: 2 }, 'select', LOCAL)), 'essaytype');
  assert.equal(nav(keys.tvKey(s, 'menu', LOCAL)), 'essaytype');
  assert.equal(nav(keys.tvKey(s, 'select', LOCAL)), undefined, 'Select on a piece does nothing yet');
  assert.equal(nav(keys.tvKey(s, 'back', LOCAL)), 'landing');
});
