#!/usr/bin/env node
// Judges a `node .ai/doctor.mjs --json` output so that its exit code means exactly one thing.
// Usage (from the repo root):
//   node scripts/doctor-gate.mjs <doctor-output>                         the contract gate
//   node scripts/doctor-gate.mjs <doctor-output> --claims <manifest>     the verified-flag claims check
//   node scripts/doctor-gate.mjs --waivers                               print the waiver map as JSON
//
// The contract gate. The doctor exits 1 on ANY fail, and this repo carries one deliberate,
// human-owned fail: control.prepush, because there is no local hook runner yet (.ai/memory/0011).
// So the doctor's own exit code is red on every PR and says nothing. This gate fails on every `fail`
// finding EXCEPT the ones in WAIVERS. Each waiver names the memory entry that owns it. When a waived
// check stops failing (the operator added the hook), the gate warns that the waiver is stale, so it
// gets deleted instead of silently hiding a future regression.
//
// The claims check. It runs after `node .ai/doctor.mjs --run --json` and takes the manifest as it was
// COMMITTED (copied before the doctor's write-back). A committed `verified: true` whose capability did
// not pass on this tree is a broken claim, and the check exits 1. A capability that passed while its
// committed flag is still false gets a notice: run the doctor's --run locally and commit its own
// write-back. Never hand-flip a flag. Policy: .ai/memory/0016-capabilities-proven-per-pr.md.
//
// Writes a table to $GITHUB_STEP_SUMMARY when it is set.
import { readFileSync, appendFileSync } from 'node:fs';

const WAIVERS = {
  'control.prepush': { memory: '0011', why: 'prePush controls are declared but no local hook runner exists yet; the operator adds it' },
};

const args = process.argv.slice(2);
if (args.includes('--waivers')) {
  console.log(JSON.stringify(WAIVERS));
  process.exit(0);
}
const ci = args.indexOf('--claims');
const claimsFile = ci >= 0 ? args[ci + 1] : null;
const file = args.find((a, i) => !a.startsWith('--') && !(ci >= 0 && i === ci + 1));
if (!file || (ci >= 0 && !claimsFile)) {
  console.error('usage: node scripts/doctor-gate.mjs <doctor-output> [--claims <committed-manifest>] | --waivers');
  process.exit(2);
}

// The doctor prints its human readout first and the --json summary as its last JSON line.
const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim());
let summary = null;
for (let i = lines.length - 1; i >= 0 && !summary; i--) {
  if (!lines[i].startsWith('{')) continue;
  try { summary = JSON.parse(lines[i]); } catch { /* not the summary line */ }
}
if (!summary || !Array.isArray(summary.findings)) {
  console.error(`No doctor --json summary in ${file}: the doctor crashed before it reported, or ran without --json.`);
  process.exit(1);
}

const cell = (s) => String(s).replace(/\|/g, '\\|');
const publish = (title, table) => {
  console.log(table);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## ${title}\n\n${table}\n`);
};

// The doctor's id slug (.ai/doctor.mjs, `slug`): a capability name becomes capability.<slug>.run.
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9._\/-]/g, '-').slice(0, 100);

/** The committed `verified` flag of every capability, read from the one-line-per-capability block. */
function committedFlags(text) {
  const rows = text.split(/\r?\n/);
  const start = rows.findIndex((l) => l.trimEnd() === 'capabilities:');
  const flags = {};
  if (start < 0) return flags;
  for (let i = start + 1; i < rows.length; i++) {
    if (/^[^\s#]/.test(rows[i])) break;
    const m = rows[i].match(/^ {2}([\w-]+):\s*\{.*[{,]\s*verified:\s*(true|false)\s*[,}]/);
    if (m) flags[m[1]] = m[2] === 'true';
  }
  return flags;
}

if (claimsFile) {
  const flags = committedFlags(readFileSync(claimsFile, 'utf8'));
  const runs = new Map(summary.findings.filter((f) => /^capability\..+\.run$/.test(f.check)).map((f) => [f.check, f.level]));
  if (runs.size === 0) {
    console.error('The doctor ran no capability: it was not given --run, so no claim can be checked.');
    process.exit(1);
  }
  const broken = [], unclaimed = [], rows = [];
  for (const [name, claimed] of Object.entries(flags)) {
    const level = runs.get('capability.' + slug(name) + '.run');
    const ran = level === undefined ? 'not run' : level === 'pass' ? 'pass' : 'FAIL';
    if (claimed && ran !== 'pass') broken.push(name);
    if (!claimed && ran === 'pass') unclaimed.push(name);
    rows.push(`| ${cell(name)} | ${claimed} | ${ran} |`);
  }
  publish('Committed verified flags vs this run', ['| Capability | Committed verified | This run |', '|---|---|---|', ...rows].join('\n'));
  for (const n of unclaimed) console.log(`::notice::"${n}" passed on this tree but is committed as verified: false. Run node .ai/doctor.mjs --run locally and commit its write-back.`);
  if (broken.length) {
    for (const n of broken) console.log(`::error::"${n}" is committed as verified: true but did not pass on this tree.`);
    console.error(`${broken.length} committed claim(s) broken: ${broken.join(', ')}`);
    process.exit(1);
  }
  console.log(`Every committed verified: true held on this tree (${Object.keys(flags).length} capabilities checked).`);
  process.exit(0);
}

const fails = summary.findings.filter((f) => f.level === 'fail');
const isWaived = (f) => Object.hasOwn(WAIVERS, f.check);
const blocking = fails.filter((f) => !isWaived(f));
const stale = Object.keys(WAIVERS).filter((c) => !fails.some((f) => f.check === c));
const rows = fails.map((f) => `| ${cell(f.check)} | ${isWaived(f) ? `waived (${WAIVERS[f.check].memory})` : 'BLOCKS'} | ${cell(f.msg)} |`);
publish('Agent contract (doctor)', fails.length
  ? ['| Check | Verdict | Detail |', '|---|---|---|', ...rows].join('\n')
  : 'No doctor finding failed.');
for (const c of stale) console.log(`::warning::The waiver for ${c} (.ai/memory/${WAIVERS[c].memory}) is stale: the check no longer fails. Delete it from WAIVERS in scripts/doctor-gate.mjs.`);
if (blocking.length) {
  console.error(`${blocking.length} doctor finding(s) failed outside the waivers: ${blocking.map((f) => f.check).join(', ')}`);
  process.exit(1);
}
console.log(`The agent contract holds: ${fails.length - blocking.length} waived fail(s), ${summary.warns ?? 0} warn(s).`);
