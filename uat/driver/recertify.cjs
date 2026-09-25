/**
 * Recertify an LT run from its own data: which pairs to rerun, what changed, what confounds the change, and the
 * write-back into the ORIGINATING run (uat skill: re-run only the affected character x journey; artifacts and
 * resolutions live in the originating run's directory).
 *
 *   plan(run)                  -> { character: [journey, …] } with open non-strength findings
 *   openFindings(run, c, j)    -> the prior rows the judge is shown for one pair
 *   metricDelta(before, after) -> the rubric metrics of both runs, recomputed from the per-Character JSON
 *   confounds(before, after)   -> { confounds, notes }: a changed journey start, a new journey, a changed instrument
 *   priorStatuses(ids, rows)   -> the judge's answer per prior id; an id it left out is not-evaluable
 *   writeBack(prior, id, st)   -> stamps the originating findings.json (not-seen -> fixed, recurs -> recurrence + 1)
 *   renderRecertify(prior, r)  -> recertify.md beside the originating run; Regressed compares the code verdicts
 *                                 (verdict.cjs verdictOf), never the judge's own, so a changed judge mood is not a regression
 *   finish(prior, rerun)       -> writeBack + renderRecertify, from the rerun's own files
 *
 * A run is an id under uat/runs/ or a directory. A rerun lives inside its originating run as recert-<k>/.
 * LT never claims `resolved-verified`: that takes live L2 evidence. Nothing here calls a model.
 */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const RUNS = path.resolve(__dirname, '../runs'), UAT = path.resolve(__dirname, '..');
const V = require('./verdict.cjs');

const dirOf = run => path.isAbsolute(run) ? run : path.join(RUNS, run);
/** A run's id: its directory name, or `<originating>/recert-<k>` for a rerun. */
const runId = run => { const d = dirOf(run), b = path.basename(d); return /^recert-\d+$/.test(b) ? `${path.basename(path.dirname(d))}/${b}` : b; };
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const NOT_RESULTS = new Set(['findings.json', 'run.json']);
/** The per-Character result files of a run. */
const results = run => fs.readdirSync(dirOf(run)).filter(f => f.endsWith('.json') && !NOT_RESULTS.has(f)).sort().map(f => readJson(path.join(dirOf(run), f))).filter(r => r && r.character && Array.isArray(r.journeys));
const findings = run => readJson(path.join(dirOf(run), 'findings.json'));
const runJson = run => { try { return readJson(path.join(dirOf(run), 'run.json')); } catch { return null; } };
const isOpen = f => f.type !== 'strength' && f.resolution === 'open';
const jn = j => Number(String(j).replace(/\D/g, '')) || 0;

// ---------------------------------------------------------------- plan
/** The Character x journey pairs that still have an open non-strength finding. */
function plan(run) {
  const out = {};
  for (const f of findings(run)) if (isOpen(f)) (out[f.character] ??= new Set()).add(f.journey);
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)).map(([c, s]) => [c, [...s].sort((a, b) => jn(a) - jn(b))]));
}
/** What the judge of a recertify pair is shown: that pair's open findings, nothing else. */
function openFindings(run, character, journey) {
  return findings(run).filter(f => isOpen(f) && f.character === character && f.journey === journey)
    .map(({ id, type, dimension, title, expected, got, evidence, recurrence }) => ({ id, type, dimension, title, expected, got, evidence, recurrence: recurrence ?? 1 }));
}

// ---------------------------------------------------------------- metrics
const ratio = (a, b) => b ? `${a}/${b} (${Math.round(100 * a / b)}%)` : 'n/a';
/** The rubric metrics over a run's per-Character results, as report.md counts them. `keep(result, journey)` filters. */
function rollUp(rs, keep = () => true) {
  const roll = { placement: { exact: 0, near: 0, miss: 0, none: 0 }, agree: [0, 0], fit: [0, 0, 0], pitch: [0, 0, 0], moments: [0, 0], breaches: 0 };
  for (const r of rs) for (const j of r.journeys ?? []) {
    if (!keep(r, j)) continue;
    const m = j.judge?.metrics;
    if (j.id === 'J1') { const cls = j.facts?.placement?.class ?? 'none'; roll.placement[cls]++; }
    if (!m) continue;
    roll.agree[0] += m.judgeAgreement.agree; roll.agree[1] += m.judgeAgreement.total;
    roll.fit[0] += m.topicFit.fit; roll.fit[1] += m.topicFit.safe; roll.fit[2] += m.topicFit.total;
    roll.pitch[0] += m.pitch.at; roll.pitch[1] += m.pitch.below; roll.pitch[2] += m.pitch.above;
    roll.moments[0] += m.moments.correctUseful; roll.moments[1] += m.moments.total;
    roll.breaches += m.boundaries.breaches;
  }
  return roll;
}
/** Each metric as a numerator over a denominator (breaches is a count: its denominator is null). */
const METRICS = [
  { key: 'placement', label: 'placement exact', of: r => [r.placement.exact, r.placement.exact + r.placement.near + r.placement.miss] },
  { key: 'agreement', label: 'judge agreement', of: r => [r.agree[0], r.agree[1]] },
  { key: 'topicFit', label: 'topic fit', of: r => [r.fit[0], r.fit[2]] },
  { key: 'topicSafe', label: 'topic safe', of: r => [r.fit[1], r.fit[2]] },
  { key: 'pitch', label: 'pitch at band', of: r => [r.pitch[0], r.pitch[0] + r.pitch[1] + r.pitch[2]] },
  { key: 'moments', label: 'moment precision', of: r => [r.moments[0], r.moments[1]] },
  { key: 'breaches', label: 'boundary breaches', of: r => [r.breaches, null] },
];
const pairKey = (c, j) => `${c}|${j}`;
const pairsOf = rs => new Set(rs.flatMap(r => r.journeys.map(j => pairKey(r.character, j.id))));
/**
 * The metrics of both runs, each run whole (as its report.md counts them). With { samePairs: true } `before` is read
 * over the pairs `after` ran, so a rerun of seven pairs is compared with those seven pairs, not with the whole
 * originating run: recertify.md reads it that way. Each metric names the journeys that feed it.
 */
function metricDelta(before, after, { samePairs = false } = {}) {
  const A = results(after), B = results(before), ran = pairsOf(A);
  const inAfter = (r, j) => !samePairs || ran.has(pairKey(r.character, j.id));
  const rb = rollUp(B, inAfter), ra = rollUp(A);
  const ids = [...new Set([...A, ...B].flatMap(r => r.journeys.map(j => j.id)))].sort((a, b) => jn(a) - jn(b));
  const out = {};
  for (const m of METRICS) {
    const from = m.of(rb), to = m.of(ra);
    const feeds = ids.filter(jid => [rollUp(B, (r, j) => j.id === jid && inAfter(r, j)), rollUp(A, (r, j) => j.id === jid)].some(x => { const [n, d] = m.of(x); return d === null ? n > 0 : d > 0; }));
    const text = ([n, d]) => d === null ? String(n) : ratio(n, d);
    const share = ([n, d]) => d ? 100 * n / d : null;
    const change = m.of(rb)[1] === null ? to[0] - from[0] : share(from) === null || share(to) === null ? null : Math.round(share(to) - share(from));
    out[m.key] = { label: m.label, before: text(from), after: text(to), from, to, change, journeys: feeds };
  }
  return out;
}

// ---------------------------------------------------------------- confounds
/** A journey start that moved by more than this share of the cast (real earlier journey vs fixture) confounds it. */
const START_SHIFT = 0.25;
function journeyStarts() {
  const out = {};
  try {
    for (const f of fs.readdirSync(path.join(UAT, 'journeys')).filter(f => f.endsWith('.md'))) {
      const m = fs.readFileSync(path.join(UAT, 'journeys', f), 'utf8').match(/```json\s*\n([\s\S]*?)\n```/);
      if (m) { const s = JSON.parse(m[1]); out[s.id] = s.start; }
    }
  } catch { /* no journeys dir: the start source reads "an earlier journey" */ }
  return out;
}
const SOURCE = { placed: 'J1', planned: 'J2' };
const fixtureLabel = s => s.replace(/^fixture:\s*/, '').replace(/ to [A-C][12] /, ' ');
const flatten = (o, pre = '') => Object.entries(o ?? {}).flatMap(([k, v]) => v && typeof v === 'object' ? flatten(v, `${pre}${k}.`) : [[`${pre}${k}`, v]]);
/**
 * What makes a before/after difference unreadable as a product change: a journey that started from a fixture in one
 * run and after a real earlier journey in the other, a journey the earlier run never ran, or a different instrument.
 * A run with no run.json has no recorded instrument: that is a note, since nothing proves it changed.
 */
function confounds(before, after) {
  const A = results(after), B = results(before), ran = pairsOf(A), delta = metricDelta(before, after, { samePairs: true }), starts = journeyStarts();
  const cs = [], notes = [], name = { before: runId(before), after: runId(after) };
  const recs = (rs, jid, keep = () => true) => rs.flatMap(r => r.journeys.filter(j => j.id === jid && keep(r, j)));
  const covers = jid => Object.entries(delta).filter(([, d]) => d.journeys.includes(jid)).map(([k]) => k);
  const jids = [...new Set(A.flatMap(r => r.journeys.map(j => j.id)))].sort((a, b) => jn(a) - jn(b));
  for (const jid of jids) {
    const a = recs(A, jid), b = recs(B, jid, (r, j) => ran.has(pairKey(r.character, j.id)));
    if (!b.length) { cs.push({ kind: 'journeys', journey: jid, metrics: covers(jid), text: `${jid} was not run in ${name.before}: there is no before to compare` }); continue; }
    const real = xs => xs.filter(j => !(j.setup ?? []).some(s => s.startsWith('fixture:'))).length;
    const ra = real(a), rb = real(b);
    if (Math.abs(rb / b.length - ra / a.length) <= START_SHIFT) continue;
    const fixtures = [...new Set([...a, ...b].flatMap(j => (j.setup ?? []).filter(s => s.startsWith('fixture:')).map(fixtureLabel)))].join('; ');
    cs.push({ kind: 'start', journey: jid, metrics: covers(jid), text: `${jid} started after a real ${SOURCE[starts[jid]] ?? 'earlier journey'} for ${rb} of ${b.length} Characters before, ${ra} of ${a.length} after (fixture: ${fixtures})` });
  }
  const ib = runJson(before)?.instrument, ia = runJson(after)?.instrument;
  if (!ib || !ia) {
    const missing = [!ib && name.before, !ia && name.after].filter(Boolean);
    notes.push({ kind: 'instrument', text: `instrument not recorded (no run.json in ${missing.join(' or ')}): a driver, model or effort change cannot be ruled out` });
  } else {
    const fb = Object.fromEntries(flatten(ib)), fa = Object.fromEntries(flatten(ia));
    const diff = [...new Set([...Object.keys(fb), ...Object.keys(fa)])].sort().filter(k => fb[k] !== fa[k]).map(k => `${k} ${fb[k] ?? '(none)'} -> ${fa[k] ?? '(none)'}`);
    if (diff.length) cs.push({ kind: 'instrument', metrics: Object.keys(delta), text: `the instrument changed: ${diff.join('; ')}` });
  }
  return { confounds: cs, notes };
}

// ---------------------------------------------------------------- write-back
const STATUSES = ['recurs', 'not-seen', 'not-evaluable'];
/**
 * The judge's answer for each prior id it was shown, checked here rather than by the schema (linga-text.cjs judgeAccept):
 * every id must be answered exactly once. An id it left out, answered with a status outside the three, or answered
 * more than once is not-evaluable; an id it was never shown is dropped; a prior[] that is not an array answers nothing.
 * Code decides what counts as fixed: not-seen is only taken from a journey that reached its end
 * (endedBy 'done'); a journey that crashed, stalled or was abandoned never saw the moment, so it is not-evaluable.
 */
function priorStatuses(ids, rows = [], { endedBy } = {}) {
  const out = {}, all = Array.isArray(rows) ? rows.filter(r => r && typeof r === 'object') : [];
  for (const id of ids) {
    const mine = all.filter(r => r.id === id), row = mine.length === 1 && STATUSES.includes(mine[0].status) ? mine[0] : null;
    out[id] = mine.length > 1 ? { status: 'not-evaluable', evidence: `the judge answered this finding ${mine.length} times, not once`, finding: -1 }
      : !row ? { status: 'not-evaluable', evidence: mine.length ? `the judge's status ${JSON.stringify(mine[0].status)} is not one of ${STATUSES.join('|')}` : 'the judge gave no row for this finding', finding: -1 }
      : row.status === 'not-seen' && endedBy !== undefined && endedBy !== 'done' ? { status: 'not-evaluable', evidence: `the journey ended ${endedBy}, so not seeing it proves nothing; judge: ${String(row.evidence ?? '')}`, finding: -1 }
      : { status: row.status, evidence: String(row.evidence ?? ''), finding: Number.isInteger(row.finding) ? row.finding : -1 };
  }
  return out;
}
/**
 * Stamps the originating findings.json. not-seen -> resolution 'fixed' (LT evidence; never 'resolved-verified');
 * recurs -> stays open, recurrence + 1; not-evaluable -> stays open. Every stamped row names the rerun.
 */
function writeBack(prior, id, statuses) {
  const file = path.join(dirOf(prior), 'findings.json'), rows = readJson(file), count = { fixed: 0, recurs: 0, notEvaluable: 0 };
  for (const f of rows) {
    const s = statuses[f.id];
    if (!s || !isOpen(f)) continue;
    Object.assign(f, { recertify_run: id, recertify_status: s.status, recertify_evidence: s.evidence });
    if (s.status === 'not-seen') { f.resolution = 'fixed'; count.fixed++; }
    else if (s.status === 'recurs') { f.recurrence = (f.recurrence ?? 1) + 1; if (s.as) f.recurred_as = s.as; count.recurs++; }
    else count.notEvaluable++;
  }
  fs.writeFileSync(file, JSON.stringify(rows, null, 2));
  return count;
}

// ---------------------------------------------------------------- the rerun's place and its report
const reportName = k => k === 1 ? 'recertify.md' : `recertify-${k}.md`;
/** The next free rerun slot inside the originating run: recert-<k>/ and its report (recertify.md first). */
function nextRerun(prior) {
  const d = dirOf(prior);
  let k = 1;
  while (fs.existsSync(path.join(d, `recert-${k}`)) || fs.existsSync(path.join(d, reportName(k)))) k++;
  return { k, dir: path.join(d, `recert-${k}`), report: path.join(d, reportName(k)), data: path.join(d, 'data', `recert-${k}`), logs: path.join(d, 'logs', `recert-${k}`) };
}
const RANK = { 'not-reached': 0, fail: 1, conditional: 2, pass: 3 };
/** A share over fewer items than this is still reported when it falls, marked as weak evidence. */
const SMALL_BASE = 5;
const cite = (ids, max = 8) => ids.length > max ? `${ids.slice(0, max).join(', ')} and ${ids.length - max} more` : ids.join(', ');
const cell = s => String(s ?? '').replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ');
/** recertify.md beside the originating run, from its stamped findings.json and the rerun's files. */
function renderRecertify(prior, rerun) {
  const id = runId(rerun), P = runId(prior), pair = `${P} -> ${id}`, k = Number(path.basename(dirOf(rerun)).replace(/\D/g, '')) || 1;
  const stamped = findings(prior).filter(f => f.recertify_run === id), fresh = findings(rerun);
  const q = fid => `${id}/${fid}`;
  const A = results(rerun), B = results(prior), delta = metricDelta(prior, rerun, { samePairs: true }), cf = confounds(prior, rerun);
  const confounded = new Set(cf.confounds.flatMap(c => c.metrics ?? []));
  // a journey whose start moved, or any journey when the instrument changed, cannot show a regression either
  const whyNot = jid => cf.confounds.find(c => c.journey === jid || c.kind === 'instrument');
  const table = (head, rows) => rows.length ? [head, head.replace(/[^|]+/g, '---'), ...rows] : ['None.'];
  const fixed = stamped.filter(f => f.recertify_status === 'not-seen'), still = stamped.filter(f => f.recertify_status !== 'not-seen');
  const freshOf = (c, jids) => fresh.filter(f => f.type !== 'strength' && f.character === c && jids.includes(f.journey)).map(f => q(f.id));
  // regressions: a pair whose code verdict dropped (the checks behind it, not the judge's mood), and a metric that
  // fell 10 points or more, with nothing confounding either
  const regressed = [], masked = [];
  for (const r of A) for (const j of r.journeys) {
    const was = B.find(x => x.character === r.character)?.journeys.find(x => x.id === j.id);
    if (!was) continue;
    const ctx = V.contextOf(r.character, j.id), vb = V.verdictOf(was, ctx), va = V.verdictOf(j, ctx), b = vb.verdict, a = va.verdict;
    // a pair the judge never reached on either side shows no product change
    if (b === 'not-reached' || a === 'not-reached' || !(RANK[a] < RANK[b])) continue;
    // the checks that turned: reasons after that were not there before (all of them when none is new)
    const before = new Set(vb.why.map(w => `${w.kind}:${w.id}:${w.level}`)), turned = va.why.filter(w => !before.has(`${w.kind}:${w.id}:${w.level}`));
    const because = cell((turned.length ? turned : va.why).map(w => w.text).join('; '));
    const ids = cite(freshOf(r.character, [j.id])) || stamped.filter(f => f.character === r.character && f.journey === j.id).map(f => f.id).join(', '), c = whyNot(j.id);
    if (c) masked.push(`| ${r.character} ${j.id} verdict ${b} -> ${a}: ${because} (${ids}) | ${c.kind === 'instrument' ? 'instrument changed' : `${c.journey} ${c.kind}`} | ${pair} |`);
    else regressed.push(`| ${ids || '(no finding filed)'} | ${r.character} ${j.id} verdict ${b} -> ${a}: ${because} | ${pair} |`);
  }
  for (const [key, d] of Object.entries(delta)) {
    const fell = key === 'breaches' ? d.change > 0 : d.change !== null && d.change <= -10;
    if (!fell || confounded.has(key)) continue;
    const ids = A.flatMap(r => freshOf(r.character, d.journeys)), weak = d.from[1] !== null && d.from[1] < SMALL_BASE ? ` (a base of ${d.from[1]}: weak evidence)` : '';
    regressed.push(`| ${cite(ids) || '(no finding filed)'} | ${d.label} ${key === 'breaches' ? 'rose' : 'fell'} ${d.before} -> ${d.after}${weak} | ${pair} |`);
  }
  const md = [
    `# Recertify — LT run ${P}`, '',
    `Rerun: \`${id}\`: ${A.map(r => `${r.character} ${r.journeys.map(j => j.id).join(', ')}`).join(' · ') || 'no Character finished'}. Only the pairs with open findings were rerun; each judge was shown that pair's open finding ids and answered each one.`, '',
    `**Level reached: LT only.** The skill keeps \`resolved-verified\` for live L2 evidence, so a finding the rerun no longer shows is \`fixed\` in \`${P}/findings.json\`, with \`recertify_run\` and \`recertify_evidence\`. Rerun finding ids are positional, so they are written \`${id}/<id>\`.`, '',
    '## Fixed (LT evidence)', '',
    ...table('| Finding | Title | Rerun evidence | Run pair |', fixed.map(f => `| ${f.id} | ${cell(f.title)} | ${cell(f.recertify_evidence)} | ${pair} |`)), '',
    '## Still open', '',
    ...table('| Finding | Status | Title | Rerun evidence | Run pair |', still.map(f => `| ${f.id} | ${f.recertify_status === 'recurs' ? `recurs (recurrence ${f.recurrence}${f.recurred_as ? `, as ${q(f.recurred_as)}` : ''})` : 'not-evaluable'} | ${cell(f.title)} | ${cell(f.recertify_evidence)} | ${pair} |`)), '',
    '## Regressed', '',
    ...table('| Finding(s) | What | Run pair |', regressed), '',
    '## Metric deltas', '',
    `Before is ${P} over the pairs the rerun ran.`, '',
    ...table('| Metric | Before | After | Change | Run pair |', Object.values(delta).filter(d => d.journeys.length).map(d => `| ${d.label} | ${d.before} | ${d.after} | ${d.change === null ? 'n/a' : `${d.change > 0 ? '+' : ''}${d.change}${d.from[1] === null ? '' : ' pts'}`} | ${pair} |`)), '',
    '## Confounded - do not read as a regression', '',
    ...table('| Confound | Covers | Run pair |', [
      ...cf.confounds.map(c => `| ${cell(c.text)} | ${(c.metrics ?? []).filter(m => delta[m]?.journeys.length).map(m => `${delta[m].label} ${delta[m].before} -> ${delta[m].after}`).join(', ') || '-'} | ${pair} |`),
      ...masked,
      ...cf.notes.map(n => `| ${cell(n.text)} | note | ${pair} |`),
    ]), '',
    '## New findings for the next drain', '',
    ...table('| Finding | Severity | Title | Run pair |', fresh.filter(f => f.type !== 'strength' && !f.recurs).map(f => `| ${q(f.id)} | ${f.severity} · rank ${f.rank} | ${cell(f.title)} | ${pair} |`)), '',
  ].join('\n');
  const file = path.join(dirOf(prior), reportName(k));
  fs.writeFileSync(file, md);
  return file;
}

/** After a rerun: gather the judge's prior answers, stamp the originating run, write its recertify report. */
function finish(prior, rerun) {
  const id = runId(rerun), fresh = findings(rerun), statuses = {};
  for (const r of results(rerun)) for (const j of r.journeys) {
    if (!j.prior?.length) continue;
    for (const [fid, s] of Object.entries(priorStatuses(j.prior.map(p => p.id), j.judge?.prior, { endedBy: j.endedBy ?? 'unknown' }))) statuses[fid] = { ...s, ...(s.status === 'recurs' ? { as: fresh.find(f => f.recurs === fid)?.id } : {}) };
  }
  // a planned pair that never reached its judge (a crash) is not-evaluable, not silently skipped
  const planned = runJson(rerun)?.pairs ?? {};
  for (const [c, js] of Object.entries(planned)) for (const j of js) for (const f of openFindings(prior, c, j)) statuses[f.id] ??= { status: 'not-evaluable', evidence: 'the pair did not reach a judged end in the rerun', finding: -1 };
  const count = writeBack(prior, id, statuses);
  return { file: renderRecertify(prior, rerun), ...count };
}

/** What produced a run: every run writes this into run.json so a driver change cannot pass for a product change. */
function instrumentOf({ model, judgeScreenCap }) {
  const sha = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, f))).digest('hex').slice(0, 16);
  return {
    model, judgeScreenCap,
    efforts: { tutor: process.env.UAT_CODEX_EFFORT || 'medium', character: process.env.UAT_CODEX_EFFORT || 'medium', judge: process.env.UAT_JUDGE_EFFORT || 'high' },
    driver: Object.fromEntries(['linga-text.cjs', 'surface.cjs', 'recertify.cjs', 'verdict.cjs'].map(f => [f, sha(f)])),
  };
}

module.exports = { RUNS, runId, results, plan, openFindings, ratio, rollUp, metricDelta, confounds, priorStatuses, writeBack, nextRerun, renderRecertify, finish, instrumentOf, START_SHIFT };
