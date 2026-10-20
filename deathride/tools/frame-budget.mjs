#!/usr/bin/env node
// Holds Stick soak summaries to the committed frame-time budget (perf/frame-budget.json).
//
//   node tools/frame-budget.mjs                   check every soak listed under the budget's `records`
//   node tools/frame-budget.mjs <summary.json>... check these summaries (tools/perf-summary.py output)
//
// Run from deathride/ or from the repo root: the budget and its records resolve against deathride/, and a summary
// named on the command line against the current directory. Exits 1 when a scene breaks a ceiling (each breach is
// printed with its delta), when a scene is missing or too thin to judge, when the soak is too short, or when a
// listed record is missing or no longer matches its committed hash. Reads files only: no device, no network.
// The budget is a regression ratchet, not the 16.7/33 ms target (.ai/memory/0020).
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEATHRIDE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const BUDGET_PATH = join(DEATHRIDE, 'perf', 'frame-budget.json');

export const loadBudget = (path = BUDGET_PATH) => JSON.parse(readFileSync(path, 'utf8'));

/** The metrics a scene is held to: [summary field, budget field, how the summary value is read]. */
const METRICS = [
  ['worstP95Ms', 'worstP95Ms', (s) => s.worstP95Ms],
  ['maxMs', 'maxMs', (s) => s.maxMs],
  ['p50RangeMs', 'p50MaxMs', (s) => (Array.isArray(s.p50RangeMs) ? s.p50RangeMs[1] : undefined)],
  ['stepWorstP95Ms', 'stepWorstP95Ms', (s) => s.stepWorstP95Ms],
];

/**
 * Every place `summary` breaks `budget`, as { scene, metric, value, ceiling, why }. Empty when it holds.
 * A missing scene or metric is a breach, never a pass: a summary that cannot be judged has proven nothing.
 */
export function judge(summary, budget) {
  const out = [];
  if (!summary || typeof summary !== 'object' || !Object.keys(budget.scenes).some((k) => k in summary)) {
    return [{ scene: '(summary)', metric: 'shape', why: 'not a tools/perf-summary.py summary: none of ' + Object.keys(budget.scenes).join(', ') }];
  }
  if (typeof summary.durationSeconds !== 'number' || summary.durationSeconds < budget.minDurationSeconds) {
    out.push({ scene: '(soak)', metric: 'durationSeconds', value: summary.durationSeconds, ceiling: budget.minDurationSeconds,
      why: `the soak ran ${summary.durationSeconds ?? 'an unknown'} s, at least ${budget.minDurationSeconds} s is needed to judge it` });
  }
  for (const [scene, limit] of Object.entries(budget.scenes)) {
    const s = summary[scene];
    if (!s || typeof s !== 'object') { out.push({ scene, metric: 'scene', why: 'missing from the summary' }); continue; }
    if (typeof s.count !== 'number' || s.count < limit.minWindows) {
      out.push({ scene, metric: 'count', value: s.count, ceiling: limit.minWindows, why: `${s.count ?? 0} windows, at least ${limit.minWindows} are needed to judge it` });
      continue;
    }
    for (const [field, key, read] of METRICS) {
      const value = read(s), ceiling = limit[key];
      if (typeof ceiling !== 'number') continue;
      if (typeof value !== 'number' || !Number.isFinite(value)) { out.push({ scene, metric: field, value, ceiling, why: 'missing or not a number' }); continue; }
      if (value > ceiling) out.push({ scene, metric: field, value, ceiling, why: `${value.toFixed(3)} ms is ${(value - ceiling).toFixed(3)} ms over the ${ceiling} ms ceiling` });
    }
  }
  return out;
}

/** One summary file read and judged: its breaches, plus a hash breach when a committed record no longer matches. */
export function checkFile(path, budget, expectSha) {
  if (!existsSync(path)) return [{ scene: '(file)', metric: 'path', why: `${path} does not exist` }];
  const text = readFileSync(path, 'utf8');
  let summary;
  try { summary = JSON.parse(text); } catch (e) { return [{ scene: '(file)', metric: 'json', why: `${path} is not JSON: ${e.message}` }]; }
  const out = judge(summary, budget);
  if (expectSha && summary.sourceSha256 !== expectSha) {
    out.push({ scene: '(record)', metric: 'sourceSha256', why: `${path} measured raw data ${summary.sourceSha256}, the budget lists ${expectSha}` });
  }
  return out;
}

export function main(argv = process.argv.slice(2)) {
  const budget = loadBudget();
  const files = argv.length
    ? argv.map((p) => ({ path: resolve(p), sha: null }))
    : budget.records.map((r) => ({ path: join(DEATHRIDE, r.path), sha: r.sourceSha256 }));
  if (!files.length) { console.error('frame-budget: no summary to check (the budget lists no records)'); return 1; }
  let failed = 0;
  for (const f of files) {
    const breaches = checkFile(f.path, budget, f.sha);
    if (breaches.length) {
      failed++;
      console.error(`FAIL ${f.path}`);
      for (const b of breaches) console.error(`  ${b.scene} ${b.metric}: ${b.why}`);
    } else {
      console.log(`ok   ${f.path}`);
    }
  }
  console.log(failed
    ? `${failed} of ${files.length} soak(s) break the Stick frame budget (perf/frame-budget.json).`
    : `${files.length} soak(s) hold the Stick frame budget (device ${budget.device}; the ${budget.targets.frameP95Ms}/${budget.targets.frameMaxMs} ms target is not gating).`);
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = main();
