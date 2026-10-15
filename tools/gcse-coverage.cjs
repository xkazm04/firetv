/**
 * The GCSE Foundation coverage report (v2 M2a): which Pearson Edexcel 1MA1 Foundation statements the desk's school
 * topics touch, by area, and the gaps M2b fills. Run from desk/: node ../tools/gcse-coverage.cjs
 */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const root = path.resolve(__dirname, '../desk');
const ts = require(path.join(root, 'node_modules/typescript'));
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const G = require(path.join(root, 'src/lib/library/gcse.ts'));
const c = G.gcseCoverage();
console.log(`${G.SPEC.board} ${G.SPEC.code} ${G.SPEC.tier}: ${c.touched.length} of ${c.total} statements touched by a school topic (${Math.round(c.share * 100)}%; VERIFIED=${G.VERIFIED})\n`);
for (const [k, v] of Object.entries(G.AREAS)) {
  console.log(`${v.name}: ${c.byArea[k].touched} of ${c.byArea[k].total}`);
  for (const st of G.FOUNDATION.filter((x) => x.area === k)) console.log(`  ${c.topics[st.code].length ? 'yes' : 'GAP'}  ${st.code.padEnd(4)} ${st.can}  ${c.topics[st.code].join(', ')}`);
  console.log('');
}
console.log(`Higher tier only (not mapped): ${G.STATEMENTS.filter((x) => !x.foundation).map((x) => x.code).join(', ')}`);
console.log(`Claim allowed: ${G.gcseClaimAllowed()}`);
