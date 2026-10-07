/**
 * The Cambridge map (v2 L1): lib/english/cambridge.ts.
 *   - every part and descriptor names real Linga skills and a source a person can check;
 *   - coverage is computed by code from the authored scenes and the audience gate, never asserted by hand;
 *   - the claim stays off while the table is unverified (the plan's kill criterion), and no screen says "Cambridge".
 * Run with npm test in desk/ (directly: node tools/cambridge-rules-test.cjs). No model is called.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
process.env.DESK_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-cambridge-'));
const src = (f) => path.join(root, 'src', f);
const C = require(src('lib/english/cambridge.ts'));
const { ENGLISH_SKILLS, ENGLISH_SCENES, audienceAllowed, defaultPreferences } = require(src('lib/english/curriculum.ts'));
const SKILLS = new Set(ENGLISH_SKILLS.map(s => s.id));

test('every part and descriptor names real skills and a checkable source; ids are unique', () => {
  for (const p of C.SPEAKING_PARTS) { assert(C.EXAMS[p.exam], p.name); assert(p.skills.length && p.skills.every(s => SKILLS.has(s)), p.name); assert(p.what && p.practice); }
  assert.deepEqual(C.SPEAKING_PARTS.filter(p => p.exam === 'a2-key-schools').map(p => p.part), [1, 2]);
  assert.deepEqual(C.SPEAKING_PARTS.filter(p => p.exam === 'b1-preliminary-schools').map(p => p.part), [1, 2, 3, 4]);
  const ids = C.DESCRIPTORS.map(d => d.id); assert.equal(new Set(ids).size, ids.length);
  for (const d of C.DESCRIPTORS) { assert(d.skills.length && d.skills.every(s => SKILLS.has(s)), d.id); assert(d.bands.length && d.bands.every(b => C.EXAMS[b]), d.id); assert.match(d.source, /Handbook/, d.id); }
  for (const e of Object.values(C.EXAMS)) assert.match(e.source, /Handbook for Teachers/);
  for (const c of C.CRITERIA) assert(C.EXAMS[c.exam]);
  assert(C.CRITERIA.some(c => c.id === 'pronunciation' && c.linga === null), 'what Linga cannot judge is said, not hidden');
});
test('coverage is computed from the authored scenes and the age gate, the same gate the scenes use', () => {
  for (const age of [9, 12, 13, 15, 17, 18, 40]) {
    const allowed = new Set(C.audiencesAt(age)), p = { id: 'x', name: 'X', type: age >= 18 ? 'other' : age >= 15 ? 'high-school' : 'elementary', age, modules: [] };
    for (const sc of ENGLISH_SCENES) assert.equal(allowed.has(sc.audience), audienceAllowed(p, defaultPreferences(p), sc.audience), `${age} ${sc.id}`);
  }
  const kid = C.coverage('a2-key-schools', 12);
  assert.equal(kid.practised.length + kid.gaps.length, kid.total);
  assert(kid.gaps.includes('past-events'), 'a 12-year-old has no authored scene that narrates: a real gap, for L2 to fill');
  assert(!kid.scenesFor['past-events'].includes('interview'), 'the interview is 15+, so it never counts for a child');
  assert(C.coverage('a2-key-schools', 16).practised.includes('past-events'), 'at 16 the interview counts');
  assert(C.coverage('b1-preliminary-schools', 12).share < 1);
});
test('the claim stays off while unverified, and no screen names Cambridge', () => {
  assert.equal(C.VERIFIED, false);
  assert.equal(C.claimAllowed(12), false); assert.equal(C.claimAllowed(16), false, 'even at 100% coverage');
  const screens = ['english/LingaTV.tsx', 'english/LingaPhone.tsx', 'lib/english/view.ts', 'app/english/print/page.tsx'].map(src).filter(f => fs.existsSync(f));
  assert(screens.length >= 3);
  for (const f of screens) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /Cambridge|Preliminary|A2 Key/, `${path.basename(f)} must not claim Cambridge`);
});
