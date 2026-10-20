// The Stick frame budget (perf/frame-budget.json) and its check (tools/frame-budget.mjs): a soak inside every
// ceiling passes, any regression fails with the scene and metric named, a summary that cannot be judged fails rather
// than passes, and the committed baseline soak holds the committed budget. Reads files only.
// Run: node tools/frame-budget-test.mjs (from deathride/) or node deathride/tools/frame-budget-test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { DEATHRIDE, loadBudget, judge, checkFile } from './frame-budget.mjs';

const budget = loadBudget();
const scene = (over = {}) => ({ count: 100, worstP95Ms: 22.4, maxMs: 37.5, p50RangeMs: [16.6, 16.7], stepWorstP95Ms: 3.4, ...over });
const soak = (over = {}) => ({ durationSeconds: 900, activeWindows: scene(), sixLiveWindows: scene(), ...over });
const metricsOf = (breaches) => breaches.map((b) => `${b.scene}.${b.metric}`).sort();

test('case 1: a soak like the accepted baseline holds the budget', () => {
  assert.deepEqual(judge(soak(), budget), []);
});

test('case 2: a slower worst-window p95 in the six-car scene fails, naming the scene, the metric and the delta', () => {
  const b = judge(soak({ sixLiveWindows: scene({ worstP95Ms: 25.1 }) }), budget);
  assert.deepEqual(metricsOf(b), ['sixLiveWindows.worstP95Ms']);
  assert.match(b[0].why, /over the 23\.5 ms ceiling/);
});

test('case 3: each metric is held: worst frame, median and simulation step', () => {
  assert.deepEqual(metricsOf(judge(soak({ activeWindows: scene({ maxMs: 80 }) }), budget)), ['activeWindows.maxMs']);
  assert.deepEqual(metricsOf(judge(soak({ activeWindows: scene({ p50RangeMs: [16.6, 19.2] }) }), budget)), ['activeWindows.p50RangeMs']);
  assert.deepEqual(metricsOf(judge(soak({ sixLiveWindows: scene({ stepWorstP95Ms: 6 }) }), budget)), ['sixLiveWindows.stepWorstP95Ms']);
});

test('case 4: a summary that cannot be judged fails instead of passing', () => {
  assert.deepEqual(metricsOf(judge({ frameMs: { worstActiveP95: 20 } }, budget)), ['(summary).shape'], 'an older summary shape is not silently passed');
  assert.deepEqual(metricsOf(judge(soak({ sixLiveWindows: undefined }), budget)), ['sixLiveWindows.scene']);
  assert.deepEqual(metricsOf(judge(soak({ activeWindows: scene({ count: 3 }) }), budget)), ['activeWindows.count']);
  assert.deepEqual(metricsOf(judge(soak({ durationSeconds: 60 }), budget)), ['(soak).durationSeconds']);
  assert.deepEqual(metricsOf(judge(soak({ activeWindows: scene({ maxMs: null }) }), budget)), ['activeWindows.maxMs']);
});

test('case 5: the budget is a ratchet over the baseline, and the target stays recorded but not gating', () => {
  assert.equal(budget.targets.gating, false);
  for (const [name, limit] of Object.entries(budget.scenes)) {
    const m = budget.baseline.measured[name];
    assert.ok(m, `the baseline records no ${name}`);
    for (const k of ['worstP95Ms', 'maxMs', 'p50MaxMs', 'stepWorstP95Ms']) {
      assert.ok(limit[k] >= m[k], `${name}.${k}: the ceiling ${limit[k]} is under the baseline's own ${m[k]}`);
    }
    assert.ok(limit.worstP95Ms <= m.worstP95Ms + 1.5, `${name}.worstP95Ms: the ceiling ${limit.worstP95Ms} gives away more than the stated tolerance`);
  }
});

test('case 6: every committed record exists, matches its hash and holds the budget; the baseline is one of them', () => {
  assert.ok(budget.records.some((r) => r.path === budget.baseline.path), 'the baseline soak is not a record');
  for (const r of budget.records) assert.deepEqual(checkFile(join(DEATHRIDE, r.path), budget, r.sourceSha256), [], r.path);
});

test('case 7: a record whose raw-data hash changed is a breach', () => {
  const r = budget.records[0];
  assert.deepEqual(metricsOf(checkFile(join(DEATHRIDE, r.path), budget, '0'.repeat(64))), ['(record).sourceSha256']);
});
