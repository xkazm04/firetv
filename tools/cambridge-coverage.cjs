/**
 * The Cambridge coverage report (v2 L1): which A2 Key / B1 Preliminary for Schools Speaking descriptors an authored
 * Linga scene practises, for a learner of a given age. Prints a table; no model, no server.
 *   node tools/cambridge-coverage.cjs [age]        (default 12)
 */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const root = path.resolve(__dirname, '../desk');
const ts = require(path.join(root, 'node_modules/typescript'));
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const C = require(path.join(root, 'src/lib/english/cambridge.ts'));
const age = Number(process.argv[2] ?? 12);
console.log(`Cambridge Speaking coverage for a learner of ${age} (authored scenes only; VERIFIED=${C.VERIFIED})\n`);
for (const exam of Object.keys(C.EXAMS)) {
  const c = C.coverage(exam, age);
  console.log(`${C.EXAMS[exam].name}: ${c.practised.length} of ${c.total} descriptors practised (${Math.round(c.share * 100)}%)`);
  for (const d of C.DESCRIPTORS.filter((x) => x.bands.includes(exam))) console.log(`  ${c.scenesFor[d.id].length ? 'yes' : 'GAP'}  ${d.can}  [${d.skills.join(', ')}]  ${c.scenesFor[d.id].join(', ')}`);
  console.log('');
}
console.log(`Claim allowed (verified and A2 Key at least ${C.CLAIM_FLOOR * 100}%): ${C.claimAllowed(age)}`);
