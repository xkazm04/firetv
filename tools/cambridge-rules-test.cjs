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
require('./ts-load.cjs');
process.env.DESK_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-cambridge-'));
const src = (f) => path.join(root, 'src', f);
const C = require(src('lib/english/cambridge.ts'));
const { ENGLISH_SKILLS, ENGLISH_SCENES, AUTHORED_SCENES, eligibleScenes, audienceAllowed, defaultPreferences } = require(src('lib/english/curriculum.ts'));
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
    for (const sc of AUTHORED_SCENES) assert.equal(allowed.has(sc.audience), audienceAllowed(p, defaultPreferences(p), sc.audience), `${age} ${sc.id}`);
  }
  const kid = C.coverage('a2-key-schools', 12);
  assert.equal(kid.practised.length + kid.gaps.length, kid.total);
  // L1 found the gap (no free scene narrates for a 12-year-old); L2's Speaking practice fills it, and only it does
  assert.deepEqual(kid.scenesFor['past-events'], ['sp-then-and-next'], 'past events at 12: the Speaking practice scene alone');
  assert(!kid.scenesFor['past-events'].includes('interview'), 'the interview is 15+, so it never counts for a child');
  assert(C.coverage('a2-key-schools', 16).scenesFor['past-events'].includes('interview'), 'at 16 the interview counts too');
  assert.deepEqual(C.coverage('b1-preliminary-schools', 12).gaps, [], 'B1 at 12: every descriptor has a scene (feelings by Speaking practice)');
  
});
test('the claim stays off while unverified, and no screen names Cambridge', () => {
  assert.equal(C.VERIFIED, false);
  assert.equal(C.claimAllowed(12), false); assert.equal(C.claimAllowed(16), false, 'even at 100% coverage');
  const screens = ['english/LingaTV.tsx', 'english/LingaPhone.tsx', 'lib/english/view.ts', 'app/english/print/page.tsx'].map(src).filter(f => fs.existsSync(f));
  assert(screens.length >= 3);
  for (const f of screens) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /Cambridge|Preliminary|A2 Key/, `${path.basename(f)} must not claim Cambridge`);
});

test('L2 Speaking practice: one scene per Speaking part, in that part\'s skills, for school age, never naming an exam', () => {
  const { SPEAKING_PRACTICE } = require(src('lib/english/speaking.ts'));
  for (const exam of Object.keys(C.EXAMS)) for (const p of C.partPractice(exam)) assert.equal(p.scenes.length, 1, `${exam} part ${p.part}`);
  assert.equal(SPEAKING_PRACTICE.length, C.SPEAKING_PARTS.length);
  const ids = AUTHORED_SCENES.map(s => s.id); assert.equal(new Set(ids).size, ids.length, 'no id shared with a free scene');
  for (const sc of SPEAKING_PRACTICE) {
    const part = C.SPEAKING_PARTS.find(p => p.exam === sc.practice.exam && p.part === sc.practice.part);
    assert(part, sc.id); assert(part.skills.includes(sc.skill), `${sc.id}: ${sc.skill} is one of the part's skills`);
    assert.equal(sc.audience, 'school');
    const words = JSON.stringify({ ...sc, practice: undefined });
    assert.doesNotMatch(words, /Cambridge|Preliminary|\bKey\b|\bPET\b|\bKET\b|A2|B1|mapped|certif|exam paper/i, `${sc.id} names no exam`);
    assert.match(sc.premise, /not an examiner|A partner, not an examiner/, `${sc.id}: practice only, no simulated examiner (S3)`);
    assert.match(sc.premise, /no timing|never time/i, `${sc.id}: no clock`);
    assert(sc.quiz.options.length === 2 && [0, 1].includes(sc.quiz.correct));
  }
  assert.deepEqual(ENGLISH_SCENES.map(s => s.id).filter(id => id.startsWith('sp-')), [], 'the free scenes are untouched');
  const kid = { id: 'k', name: 'K', type: 'elementary', age: 12, modules: [] }, adult = { id: 'a', name: 'A', type: 'other', modules: [] };
  assert.equal(eligibleScenes(kid, defaultPreferences(kid)).filter(s => s.practice).length, 6, 'a 12-year-old can start all six');
  assert.equal(eligibleScenes(adult, { ...defaultPreferences(adult), adultConfirmed: true }).filter(s => s.practice).length, 0, 'the For Schools shapes stay with school age');
});
