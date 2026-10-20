#!/usr/bin/env node
// Judges a `node .ai/doctor.mjs --run --json` output on the capability findings alone.
// Usage: node scripts/capability-proof.mjs <doctor-output-file>
//
// The doctor exits 1 on ANY fail, and this repo carries one deliberate, human-owned fail
// (control.prepush: no local hook yet; .ai/memory/0011). So the doctor's exit code cannot say whether
// the manifest commands work. This reads the JSON summary the doctor prints as its last stdout line
// and fails only when a `capability.<name>.run` finding failed, or when none ran at all (a doctor
// that did not --run has proven nothing). Writes a table to $GITHUB_STEP_SUMMARY when it is set.
// Policy: .ai/memory/0012-capabilities-proven-weekly.md.
import { readFileSync, appendFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/capability-proof.mjs <doctor-output-file>'); process.exit(2); }

const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim());
let summary = null;
for (let i = lines.length - 1; i >= 0 && !summary; i--) {
  if (!lines[i].startsWith('{')) continue;
  try { summary = JSON.parse(lines[i]); } catch { /* not the summary line */ }
}
if (!summary || !Array.isArray(summary.findings)) {
  console.error(`No doctor --json summary in ${file}: the doctor crashed before it reported.`);
  process.exit(1);
}

const runs = summary.findings.filter((f) => /^capability\..+\.run$/.test(f.check));
const failed = runs.filter((f) => f.level !== 'pass');
const rows = runs.map((f) => `| ${f.check.replace(/^capability\.|\.run$/g, '')} | ${f.level === 'pass' ? 'pass' : 'FAIL'} | ${f.msg.replace(/\|/g, '\\|')} |`);
const table = ['| Capability | Result | Detail |', '|---|---|---|', ...rows].join('\n');
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, '## Manifest capabilities (doctor --run)\n\n' + table + '\n');

if (runs.length === 0) {
  console.error('The doctor ran no capability: it was not given --run, or the manifest declares none.');
  process.exit(1);
}
if (failed.length) {
  console.error(`${failed.length} of ${runs.length} capabilities FAILED: ${failed.map((f) => f.check).join(', ')}`);
  process.exit(1);
}
console.log(`All ${runs.length} capabilities passed.`);
