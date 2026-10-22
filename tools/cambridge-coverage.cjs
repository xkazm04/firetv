/**
 * The Cambridge coverage report (v2 L1): which A2 Key / B1 Preliminary for Schools Speaking descriptors an authored
 * Linga scene practises, for a learner of a given age. Prints a table; no model, no server.
 *   node tools/cambridge-coverage.cjs [age]        (default 12)
 */
// the rules suites' one loader (ts-load.cjs): the '@/' alias, .ts and .tsx hooks, and its disk cache of transpiles
const path = require('node:path'), { src } = require('./ts-load.cjs');
const C = require(path.join(src, 'lib/english/cambridge.ts'));
const age = Number(process.argv[2] ?? 12);
console.log(`Cambridge Speaking coverage for a learner of ${age} (authored scenes only; VERIFIED=${C.VERIFIED})\n`);
for (const exam of Object.keys(C.EXAMS)) {
  const c = C.coverage(exam, age);
  console.log(`${C.EXAMS[exam].name}: ${c.practised.length} of ${c.total} descriptors practised (${Math.round(c.share * 100)}%)`);
  for (const d of C.DESCRIPTORS.filter((x) => x.bands.includes(exam))) console.log(`  ${c.scenesFor[d.id].length ? 'yes' : 'GAP'}  ${d.can}  [${d.skills.join(', ')}]  ${c.scenesFor[d.id].join(', ')}`);
  for (const p of C.partPractice(exam)) console.log(`  part ${p.part} ${p.name}: ${p.scenes.length ? `practised by ${p.scenes.join(", ")}` : "NO PRACTICE"}`);
  console.log('');
}
console.log(`Claim allowed (verified and A2 Key at least ${C.CLAIM_FLOOR * 100}%): ${C.claimAllowed(age)}`);
