/**
 * The tutor's moment field as the model returned it, kept per learner turn so a transcript can tell class B (the model
 * returned no moment) from a moment parseMoment or audienceSafe then dropped. Pure: no desk import, no model call.
 */
const clip = (s, n = 180) => (typeof s === 'string' ? s : '').slice(0, n);

/** A raw moment value as the reply carried it: absent/null stay so, an object is copied, anything else is kept as malformed. */
function rawMomentOf(json) {
  if (!json || typeof json !== 'object' || !('moment' in json) || json.moment === undefined) return { present: false, raw: null };
  const m = json.moment;
  if (m === null) return { present: false, raw: null };
  if (typeof m !== 'object' || Array.isArray(m)) return { present: true, malformed: true, raw: m };
  return { present: true, raw: { kind: m.kind, said: m.said, better: m.better, why: m.why } };
}

/** One record from a tutor request and reply, or null when the call was not a conversation turn. */
function recordOf(req, json, n) {
  if (!req || req.use !== 'linga-turn') return null;
  let reply = '';
  try { reply = String(JSON.parse(req.prompt).submittedReply ?? ''); } catch { /* the prompt is not ours to parse */ }
  return { n, reply, ...rawMomentOf(json) };
}

/** Raw records onto the learner turns, in order: each record takes the next unclaimed learner turn whose text is its reply. */
function keyToTurns(turns, records, moments = []) {
  const learner = (turns ?? []).map((t, i) => ({ t, i })).filter(x => x.t.role === 'learner' || x.t.role === 'user');
  let from = 0;
  return (records ?? []).map(r => {
    const k = learner.findIndex((x, j) => j >= from && String(x.t.text ?? '').trim() === r.reply.trim());
    if (k >= 0) from = k + 1;
    const turn = k >= 0 ? learner[k].i : null;
    const said = r.raw && typeof r.raw === 'object' ? r.raw.said : undefined;
    const shown = (moments ?? []).some(m => (turn !== null && turns[turn].id && m.turnId === turns[turn].id) || (said && m.said === said));
    return { turn, n: r.n, reply: r.reply, present: r.present, ...(r.malformed ? { malformed: true } : {}), raw: r.raw, shown };
  });
}

/** The per-turn line of the .md transcript: raw moment returned, moment shown. */
function lineOf(x) {
  if (!x) return '';
  const raw = x.malformed ? `malformed (${JSON.stringify(x.raw).slice(0, 80)})` : x.present && x.raw ? `yes${x.raw.kind === 'none' ? ' (kind none)' : ''} — said "${clip(x.raw.said, 80)}" / better "${clip(x.raw.better, 80)}"` : 'no';
  return `raw moment returned: ${raw} · moment shown: ${x.shown ? 'yes' : 'no'}`;
}

const heldCount = c => (Array.isArray(c?.heldFixes) ? c.heldFixes.length : 0);

module.exports = { rawMomentOf, recordOf, keyToTurns, lineOf, heldCount };
