/**
 * The GCSE Foundation coverage report (v2 M2a): which Pearson Edexcel 1MA1 Foundation statements the desk's school
 * topics touch, by area, and the gaps M2b fills. Run from desk/: node ../tools/gcse-coverage.cjs
 */
const path = require('node:path');
// the suites' one loader: the '@/' alias, the .ts hook and its transpile cache
const { src } = require('./ts-load.cjs');
const G = require(path.join(src, 'lib/library/gcse.ts'));
const c = G.gcseCoverage();
console.log(`${G.SPEC.board} ${G.SPEC.code} ${G.SPEC.tier}: ${c.touched.length} of ${c.total} statements touched by a school topic (${Math.round(c.share * 100)}%; VERIFIED=${G.VERIFIED})\n`);
for (const [k, v] of Object.entries(G.AREAS)) {
  console.log(`${v.name}: ${c.byArea[k].touched} of ${c.byArea[k].total}`);
  for (const st of G.FOUNDATION.filter((x) => x.area === k)) console.log(`  ${c.topics[st.code].length ? 'yes' : 'GAP'}  ${st.code.padEnd(4)} ${st.can}  ${c.topics[st.code].join(', ')}`);
  console.log('');
}
console.log(`Higher tier only (not mapped): ${G.STATEMENTS.filter((x) => !x.foundation && !G.HOST_ADDED.includes(x.code)).map((x) => x.code).join(', ')}`);
console.log(`Host additions, in no specification (not mapped): ${G.HOST_ADDED.join(', ')}`);
console.log(`Claim allowed: ${G.gcseClaimAllowed()}`);
