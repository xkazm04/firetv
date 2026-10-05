/**
 * The metric registry: the one place a metric of an LT journey is declared. The judge's schema, the journey gates
 * (verdict.cjs), the roll-up and the before/after delta (recertify.cjs) and the report lines (linga-text.cjs) are all
 * derived from it; nothing else lists the metric set (uat skill: units fixed in the rubric, never by a walker).
 *
 * An entry is { key, schema?, tally?, journey?, series[] }:
 *   key      the judge's key in `metrics` (and the key of its counters in a roll-up)
 *   schema   the JSON schema of that key, spliced into the judge's answer; an entry without one is not asked of the judge
 *   tally    placement-style entries only: (journeyRecord) -> a class counted by roll-up, over `journey`'s records
 *   series   what is read from the counters: { id, label, rubric, of, gateLabel?, bullet?, brief?, informative? }
 *              of(bag)      -> [numerator, denominator] (denominator null: a count). `bag` is one judge's `metrics`, or a
 *                              roll-up (the counters summed over records); a missing counter is NaN, not 0
 *              label        the delta and report name; gateLabel the name in a gate reason (default: label)
 *              rubric       the row of uat/rubric.md's Linga metrics table this series measures
 *              bullet       { name, text(roll) }: a line of report.md's Metrics section
 *              brief(m)     the series' words in a Character's own report line
 *              informative  not gated by the rubric: recertify never calls its fall a regression
 * A gate names a series id. Metrics the driver itself measures and that have no entry are listed in DRIVER_MEASURED.
 *
 *   register(entry) -> unregister()   add a metric (a test, or the next module's); unregister(key) also removes it
 *   entries() / series() / seriesOf(id)
 *   judgeMetrics()  -> { required, properties } for the judge's schema
 *   blankRoll() / addRecord(roll, record) / pair(bag, seriesOrId)
 * Pure: reads nothing, calls no model.
 */
const n3 = { type: 'integer' };
const obj = (required, properties) => ({ type: 'object', additionalProperties: false, required, properties });
const num = x => typeof x === 'number' && Number.isFinite(x) ? x : NaN;
const fin = x => Number.isFinite(x) ? x : 0;
const ratio = (a, b) => b ? `${a}/${b} (${Math.round(100 * a / b)}%)` : 'n/a';

/** The metrics the driver measures itself: in the rubric, in no judge answer, so in no registry entry. */
const DRIVER_MEASURED = ['check length', 'reliability'];

const entries_ = [
  { key: 'placement', tally: j => j.facts?.placement?.class ?? 'none', journey: 'J1', classes: ['exact', 'near', 'miss', 'none'], series: [{
    id: 'placement', label: 'placement exact', gateLabel: 'placement', rubric: 'placement',
    of: b => [num(b?.placement?.exact), num(b?.placement?.exact) + num(b?.placement?.near) + num(b?.placement?.miss)],
    bullet: { name: 'placement', text: r => `exact ${r.placement.exact} · near ${r.placement.near} · miss ${r.placement.miss}${r.placement.none ? ` · no placement ${r.placement.none}` : ''}` },
  }] },
  { key: 'judgeAgreement', schema: obj(['agree', 'total', 'disagreements'], { agree: n3, total: n3, disagreements: { type: 'string', maxLength: 800 } }), series: [{
    id: 'agreement', label: 'judge agreement', rubric: 'judge agreement',
    of: b => [num(b?.judgeAgreement?.agree), num(b?.judgeAgreement?.total)],
    bullet: { name: 'judge agreement', text: r => ratio(...pair(r, 'agreement')) },
    brief: m => `judge agreement ${m.judgeAgreement.agree}/${m.judgeAgreement.total}`,
  }] },
  { key: 'topicFit', schema: obj(['fit', 'safe', 'total'], { fit: n3, safe: n3, total: n3 }), series: [
    { id: 'topicFit', label: 'topic fit', rubric: 'topic fit', of: b => [num(b?.topicFit?.fit), num(b?.topicFit?.total)],
      bullet: { name: 'topic fit', text: r => `fit ${ratio(...pair(r, 'topicFit'))} · safe ${ratio(...pair(r, 'topicSafe'))}` },
      brief: m => `topic fit ${m.topicFit.fit}/${m.topicFit.total}, safe ${m.topicFit.safe}/${m.topicFit.total}` },
    { id: 'topicSafe', label: 'topic safe', rubric: 'topic fit', of: b => [num(b?.topicFit?.safe), num(b?.topicFit?.total)] },
  ] },
  { key: 'pitch', schema: obj(['at', 'below', 'above'], { at: n3, below: n3, above: n3 }), series: [{
    id: 'pitch', label: 'pitch at band', gateLabel: 'pitch', rubric: 'pitch',
    of: b => [num(b?.pitch?.at), num(b?.pitch?.at) + num(b?.pitch?.below) + num(b?.pitch?.above)],
    bullet: { name: 'pitch', text: r => `at band ${ratio(...pair(r, 'pitch'))} · below ${fin(r.pitch?.below)} · above ${fin(r.pitch?.above)}` },
    brief: m => `pitch at ${m.pitch.at}, below ${m.pitch.below}, above ${m.pitch.above}`,
  }] },
  { key: 'moments', schema: obj(['correctUseful', 'total', 'learnerTurnsWithClearErrors', 'missedClearErrors'], { correctUseful: n3, total: n3, learnerTurnsWithClearErrors: n3, missedClearErrors: n3 }), series: [
    { id: 'moments', label: 'moment precision', gateLabel: 'moments', rubric: 'moment precision', of: b => [num(b?.moments?.correctUseful), num(b?.moments?.total)],
      bullet: { name: 'moment precision', text: r => ratio(...pair(r, 'moments')) }, brief: m => `moments ${m.moments.correctUseful}/${m.moments.total}` },
    // learner turns with a clear error that got a moment, over those with one: the rubric says informative, not gated
    { id: 'recall', label: 'moment recall', rubric: 'moment recall', informative: true,
      of: b => [num(b?.moments?.learnerTurnsWithClearErrors) - num(b?.moments?.missedClearErrors), num(b?.moments?.learnerTurnsWithClearErrors)],
      bullet: { name: 'moment recall', text: r => ratio(...pair(r, 'recall')) }, brief: m => `moment recall ${ratio(...pair(m, 'recall'))}` },
  ] },
  { key: 'boundaries', schema: obj(['breaches', 'notes'], { breaches: n3, notes: { type: 'string', maxLength: 600 } }), series: [{
    id: 'breaches', label: 'boundary breaches', gateLabel: 'breaches', rubric: 'boundaries', of: b => [num(b?.boundaries?.breaches), null],
    bullet: { name: 'boundaries', text: r => `${fin(r.boundaries?.breaches)} breach(es)` },
    brief: m => `breaches ${m.boundaries.breaches}`,
  }] },
];

const entries = () => entries_.slice();
const series = () => entries_.flatMap(e => e.series.map(s => ({ ...s, key: e.key })));
const seriesOf = id => series().find(s => s.id === id);

function register(entry) {
  if (!entry || typeof entry.key !== 'string' || !Array.isArray(entry.series)) throw new Error('a metric entry is { key, schema?, series: [{ id, label, of }] }');
  if (entries_.some(e => e.key === entry.key)) throw new Error(`metric ${entry.key} is already registered`);
  for (const s of entry.series) {
    if (typeof s?.id !== 'string' || typeof s.of !== 'function') throw new Error(`metric ${entry.key}: a series needs an id and of()`);
    if (seriesOf(s.id)) throw new Error(`series ${s.id} is already registered`);
  }
  entries_.push(entry);
  return () => unregister(entry.key);
}
function unregister(key) {
  const i = entries_.findIndex(e => e.key === key);
  if (i >= 0) entries_.splice(i, 1);
}

/** The metrics half of the judge's schema: every entry that has a schema, in registration order. */
function judgeMetrics() {
  const asked = entries_.filter(e => e.schema);
  return { required: asked.map(e => e.key), properties: Object.fromEntries(asked.map(e => [e.key, e.schema])) };
}

// ---------------------------------------------------------------- roll-up
/** A zeroed roll-up: class counts for a tally entry, the integer counters of a schema'd one (more appear as they are seen). */
function blankRoll() {
  const roll = {};
  for (const e of entries_) {
    if (e.tally) roll[e.key] = Object.fromEntries((e.classes ?? []).map(c => [c, 0]));
    else if (e.schema) roll[e.key] = Object.fromEntries(Object.entries(e.schema.properties ?? {}).filter(([, p]) => p?.type === 'integer').map(([k]) => [k, 0]));
  }
  return roll;
}
/** Adds one journey record (a result's journeys[] row) to a roll-up: its placement class, and every counter its judge gave. */
function addRecord(roll, record) {
  for (const e of entries_) if (e.tally && (!e.journey || record.id === e.journey)) { const c = e.tally(record); (roll[e.key] ??= {})[c] = (roll[e.key][c] ?? 0) + 1; }
  const m = record.judge?.metrics;
  if (!m) return roll;
  for (const e of entries_) {
    if (e.tally || !m[e.key] || typeof m[e.key] !== 'object') continue;
    const into = roll[e.key] ??= {};
    for (const [k, v] of Object.entries(m[e.key])) if (typeof v === 'number' && Number.isFinite(v)) into[k] = (into[k] ?? 0) + v;
  }
  return roll;
}
/** A series over a bag or roll-up as numbers: a missing counter reads 0, a count's denominator stays null. `s` is a series or its id. */
function pair(bag, s) {
  const [n, d] = (typeof s === 'string' ? seriesOf(s) : s).of(bag);
  return [fin(n), d === null ? null : fin(d)];
}

module.exports = { DRIVER_MEASURED, register, unregister, entries, series, seriesOf, judgeMetrics, blankRoll, addRecord, pair, ratio, num };
