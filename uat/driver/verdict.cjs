/**
 * The LT journey verdict, decided in code from named checks. The judge answers checks; it does not pick the verdict
 * (uat skill: judgement externalized into explicit, scored criteria; repo law: the model phrases, code decides).
 *
 *   doneChecks(journey)         -> [{ id: 'D1', text }, …] the journey's '## Definition of done' bullets, in order
 *   gatesOf(journey)            -> the metric gates in the journey's sim block (`gates`)
 *   contextOf(character, jid)   -> { character: sim, journey: text } read from uat/characters and uat/journeys
 *   doneStatuses(ids, rows)     -> per D id: the judge's row when answered exactly once with pass|fail|n-a, else not-evaluable
 *   verdictOf(record, ctx)      -> { verdict, why[], notes[], judgeVerdict, agrees }
 *   verdictCell(v)              -> the report's scorecard cell: the verdict and its reasons
 *
 * The order: not-reached (no judge, setup failed, the Character model failed) -> fail (ended before done, a boundary
 * breach, a failed BLOCKER criterion, a failed D check, a missed metric gate) -> conditional (a failed ordinary
 * criterion, a D check or gate that cannot be evaluated) -> pass. Each reason is { kind, id, level, text } with kind
 * one of ended | judge | breach | criterion | done | gate. The judge's own verdict is kept as judgeVerdict; `agrees`
 * says whether the recorded checks explain it. A journey the judge was never asked D rows for (runs before this
 * file) is read without them, with the note 'no definition-of-done rows'. Pure: reads files, calls no model.
 */
const fs = require('node:fs'), path = require('node:path');
const UAT = path.resolve(__dirname, '..');
const RESULTS = ['pass', 'fail', 'n-a'];
const NOT_REACHED = new Set(['setup-failed', 'character-model-failure']);
const LEVEL = { 'not-reached': 0, fail: 1, conditional: 2 };

/** A journey as text: its file's text when given a path, the text itself, or `.text` of a parsed journey. */
const textOf = j => typeof j !== 'string' ? String(j?.text ?? '') : !/[\r\n]/.test(j) && j.endsWith('.md') && fs.existsSync(j) ? fs.readFileSync(j, 'utf8') : j;
const simOf = text => { const m = text.match(/```json\s*\n([\s\S]*?)\n```/); try { return m ? JSON.parse(m[1]) : null; } catch { return null; } };

/** The '## Definition of done' bullets (J5's heading reads '## Definition of done (product)') as D1..Dn, derived, never copied. */
function doneChecks(journey) {
  const out = [];
  let inDone = false;
  for (const line of textOf(journey).split(/\r?\n/)) {
    if (/^##\s/.test(line)) { inDone = /^##\s+Definition of done\b/i.test(line); continue; }
    if (inDone && /^- /.test(line)) out.push({ id: `D${out.length + 1}`, text: line.slice(2).trim() });
  }
  return out;
}
/** The metric gates the journey's definition of done states, from its sim block. */
const gatesOf = journey => { const g = simOf(textOf(journey))?.gates; return Array.isArray(g) ? g : []; };

function readSims(dir) {
  try { return fs.readdirSync(path.join(UAT, dir)).filter(f => f.endsWith('.md')).map(f => { const text = fs.readFileSync(path.join(UAT, dir, f), 'utf8'); return { text, sim: simOf(text) }; }).filter(x => x.sim); }
  catch { return []; }
}
/** What verdictOf needs for one Character x journey, read from the overlay's own files; unknown ids give empty ones. */
function contextOf(characterId, journeyId) {
  return { character: readSims('characters').find(c => c.sim.id === characterId)?.sim ?? {}, journey: readSims('journeys').find(j => j.sim.id === journeyId)?.text ?? '' };
}

/**
 * The judge's done[] per D id it was asked, checked here rather than by the schema (linga-text.cjs judgeAccept):
 * an id answered exactly once with pass|fail|n-a stands; left out, answered twice or off the enum is not-evaluable;
 * an id never asked is dropped; a done[] that is not an array answers nothing.
 */
function doneStatuses(ids, rows) {
  const all = Array.isArray(rows) ? rows.filter(r => r && typeof r === 'object') : [], out = {};
  for (const id of ids) {
    const mine = all.filter(r => r.id === id);
    out[id] = mine.length > 1 ? { result: 'not-evaluable', evidence: `the judge answered it ${mine.length} times, not once` }
      : !mine.length ? { result: 'not-evaluable', evidence: 'the judge gave no row for it' }
      : !RESULTS.includes(mine[0].result) ? { result: 'not-evaluable', evidence: `the judge's result ${JSON.stringify(mine[0].result)} is not one of ${RESULTS.join('|')}` }
      : { result: mine[0].result, evidence: String(mine[0].evidence ?? '') };
  }
  return out;
}

// ---------------------------------------------------------------- metric gates
const num = x => typeof x === 'number' && Number.isFinite(x) ? x : NaN;
/** Each gateable metric: a label and [numerator, denominator] from the judge's metrics (placement: the driver's class). */
const METRICS = {
  placement: { label: 'placement' },
  topicFit: { label: 'topic fit', of: m => [num(m?.topicFit?.fit), num(m?.topicFit?.total)] },
  topicSafe: { label: 'topic safe', of: m => [num(m?.topicFit?.safe), num(m?.topicFit?.total)] },
  pitch: { label: 'pitch', of: m => [num(m?.pitch?.at), num(m?.pitch?.at) + num(m?.pitch?.below) + num(m?.pitch?.above)] },
  moments: { label: 'moments', of: m => [num(m?.moments?.correctUseful), num(m?.moments?.total)] },
  breaches: { label: 'breaches', of: m => [num(m?.boundaries?.breaches), null] },
};
const pct = (n, d) => `${Math.round(100 * n / d)}%`;
/**
 * One gate: { metric, in: [...] } (placement class), { metric, min: 0.8 | [4, 6] } (a ratio at least), { metric, all:
 * true } (every item), { metric, max: 0 } (a count at most). `none: "pass"` lets an empty denominator pass (no moments
 * shown is not an imprecise moment); otherwise nothing counted is not-evaluable. Returns a reason, or null when met.
 */
function gateReason(g, record) {
  const M = METRICS[g.metric], id = g.metric, reason = (level, text) => ({ kind: 'gate', id, level, text });
  if (!M) return reason('conditional', `gate ${id}: no such metric`);
  if (g.metric === 'placement') {
    const p = record.facts?.placement, cls = p?.class;
    if (!cls) return reason('conditional', 'placement not recorded');
    return (g.in ?? []).includes(cls) ? null : reason('fail', `placement ${cls} (${p.band} vs ${p.trueBand}), not ${(g.in ?? []).join(' or ')}`);
  }
  const [n, d] = M.of(record.judge?.metrics);
  if (Number.isNaN(n) || Number.isNaN(d)) return reason('conditional', `${M.label} not counted`);
  if (d === null) return typeof g.max === 'number' && n > g.max ? reason('fail', `${M.label} ${n}, more than ${g.max}`) : null;
  if (d === 0) return g.none === 'pass' ? null : reason('conditional', `${M.label}: nothing counted`);
  if (g.all) return n < d ? reason('fail', `${M.label} ${n}/${d}, not all`) : null;
  if (Array.isArray(g.min)) return n * g.min[1] < g.min[0] * d ? reason('fail', `${M.label} ${n}/${d} (${pct(n, d)}) under ${g.min[0]} of ${g.min[1]}`) : null;
  if (typeof g.min === 'number') return n / d < g.min - 1e-9 ? reason('fail', `${M.label} ${n}/${d} (${pct(n, d)}) under ${Math.round(100 * g.min)}%`) : null;
  return null;
}

// ---------------------------------------------------------------- the verdict
/**
 * The journey's verdict from its recorded checks. `ctx`: { character: sim | { sim }, journey: text | path | { text } }
 * (the judge's own ctx works as it is). `record.doneAsked` names the D ids the judge was asked; with none recorded,
 * a judge answer that carries `done` is read against the journey's D ids, and one that does not is a legacy answer.
 */
function verdictOf(record, ctx = {}) {
  const jd = record?.judge && typeof record.judge === 'object' ? record.judge : null;
  const judgeVerdict = typeof jd?.verdict === 'string' ? jd.verdict : null;
  const out = (verdict, why, notes = []) => ({ verdict, why, notes, judgeVerdict, agrees: judgeVerdict === null ? null : judgeVerdict === verdict });
  const endedBy = record?.endedBy;
  if (NOT_REACHED.has(endedBy)) return out('not-reached', [{ kind: 'ended', id: endedBy, level: 'not-reached', text: `ended ${endedBy}${record.error ? `: ${record.error}` : ''}` }]);
  if (!jd) return out('not-reached', [{ kind: 'judge', id: 'judge', level: 'not-reached', text: record?.judgeError ? `no judge: ${record.judgeError}` : 'not judged' }]);

  const sim = ctx.character?.sim ?? ctx.character ?? {}, why = [], notes = [];
  if (endedBy !== 'done') why.push({ kind: 'ended', id: String(endedBy ?? 'unknown'), level: 'fail', text: `ended ${endedBy ?? 'unknown'} before done` });

  const breaches = num(jd.metrics?.boundaries?.breaches), flagged = (Array.isArray(jd.findings) ? jd.findings : []).filter(f => f?.boundary === true);
  if (breaches > 0 || flagged.length) why.push({ kind: 'breach', id: 'breach', level: 'fail', text: `boundary breach: ${[...(breaches > 0 ? [`${breaches} counted`] : []), ...flagged.map(f => `"${f.title}" marked boundary`)].join('; ')}` });

  const blockers = new Set((Array.isArray(sim.criteria) ? sim.criteria : []).filter(c => /^BLOCKER:/.test(String(c.check ?? ''))).map(c => c.id));
  for (const c of Array.isArray(jd.criteria) ? jd.criteria : []) {
    if (!c || typeof c !== 'object') continue;
    if (c.result === 'fail') why.push({ kind: 'criterion', id: c.id, level: blockers.has(c.id) ? 'fail' : 'conditional', text: `${c.id}${blockers.has(c.id) ? ' (BLOCKER)' : ''} failed: ${String(c.evidence ?? '')}` });
    else if (!RESULTS.includes(c.result)) why.push({ kind: 'criterion', id: c.id, level: 'conditional', text: `${c.id} not evaluable: result ${JSON.stringify(c.result)} is not one of ${RESULTS.join('|')}` });
  }

  const checks = doneChecks(ctx.journey ?? ''), textFor = id => checks.find(c => c.id === id)?.text;
  const asked = Array.isArray(record.doneAsked) ? record.doneAsked : 'done' in jd ? checks.map(c => c.id) : [];
  if (!asked.length && checks.length) notes.push('no definition-of-done rows');
  for (const [id, s] of Object.entries(doneStatuses(asked, jd.done))) {
    if (s.result === 'fail') why.push({ kind: 'done', id, level: 'fail', text: `${id} failed: ${s.evidence}`, check: textFor(id) });
    else if (s.result === 'not-evaluable') why.push({ kind: 'done', id, level: 'conditional', text: `${id} not evaluable: ${s.evidence}`, check: textFor(id) });
  }

  for (const g of gatesOf(ctx.journey ?? '')) {
    if (g.metric === 'breaches' && why.some(w => w.kind === 'breach')) continue;
    const r = gateReason(g, record);
    if (r) why.push(r);
  }

  why.sort((a, b) => LEVEL[a.level] - LEVEL[b.level]);
  return out(why.some(w => w.level === 'fail') ? 'fail' : why.length ? 'conditional' : 'pass', why, notes);
}

const clip = (s, n) => s.length > n ? `${s.slice(0, n - 1)}…` : s;
/** The scorecard cell: 'fail - D2 failed: #6 …; pitch 1/4 (25%) under 80%', a pass with its notes in brackets. */
const verdictCell = v => `${v.verdict}${v.why.length ? ` - ${v.why.map(w => clip(String(w.text), 90)).join('; ')}` : ''}${v.notes.length ? ` (${v.notes.join('; ')})` : ''}`.replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ');

module.exports = { doneChecks, gatesOf, contextOf, doneStatuses, verdictOf, verdictCell, RESULTS };
