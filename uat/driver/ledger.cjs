/**
 * One open ledger across every LT run, derived from the runs' own files and never stored: what is open for Linga now,
 * which Character x journey holds it, and how long each gap has gone unasked.
 *
 *   ledger(runsDir)      -> { dir, runs, rows, gaps, open, byGid }
 *   statusOf(ledger)     -> the operator view (OPEN.md): open gaps by pair, highest rank first, the next command
 *   writeStatus(runsDir) -> writes <runsDir>/OPEN.md from a fresh ledger; returns { md, file }
 *
 * Runs are the directories under uat/runs/ with a findings.json, and each one's reruns (recert-<k>/). They are ordered
 * by run.json `started`, else by directory name; a recert-<k> always comes after its parent. A finding's id is
 * positional within its run (linga-text.cjs), so the ledger names each row by its run: the global id `<runId>/<id>`
 * (`2026-09-15-lt/LT-tomas-9-J3-3`, `2026-09-15-lt-recert2-goal/recert-1/LT-tomas-9-J4-1`). The committed files are
 * only read: global ids are derived here, never written back into them.
 *
 * A gap is a chain of rows joined by `recurs` links: a rerun's finding that restates an earlier one carries
 * `recurs: <id>` (a local id of the run it recertified, or a global id when the rerun came from the ledger). The gap is
 * named by its newest row and is open while that row is. `unasked` counts the later runs that ran the gap's pair and
 * did not show its judge the gap (in the record's prior[] or by a recertify stamp): a gap no rerun asks about ages here
 * instead of vanishing. Nothing here calls a model.
 */
const fs = require('node:fs'), path = require('node:path');
const UAT = path.resolve(__dirname, '..'), RUNS = path.join(UAT, 'runs'), INSIGHTS = path.resolve(UAT, '../docs/uat-insights');
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const isDir = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const isOpen = f => !!f && f.type !== 'strength' && f.resolution === 'open';
const NOT_RESULTS = new Set(['findings.json', 'run.json']);
const jn = j => Number(String(j).replace(/\D/g, '')) || 0;
const pairKey = (c, j) => `${c}|${j}`;
const startedOf = d => { try { const s = readJson(path.join(d, 'run.json')).started; return typeof s === 'string' && s ? s : null; } catch { return null; } };
const hasFindings = d => fs.existsSync(path.join(d, 'findings.json'));

/** The runs under a runs dir, in order: `started`, else the directory name, a recert-<k> after its parent. */
function runsOf(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const d = path.join(dir, name);
    if (!isDir(d) || !hasFindings(d)) continue;
    const key = startedOf(d) ?? name;
    out.push({ id: name, dir: d, parent: null, key });
    const kids = fs.readdirSync(d).filter(f => /^recert-\d+$/.test(f) && isDir(path.join(d, f)) && hasFindings(path.join(d, f))).sort((a, b) => jn(a) - jn(b));
    for (const kid of kids) {
      // never before its parent, whatever its own clock says
      const floor = `${key}/recert-${String(jn(kid)).padStart(4, '0')}`, own = startedOf(path.join(d, kid));
      out.push({ id: `${name}/${kid}`, dir: path.join(d, kid), parent: name, key: own && own > floor ? own : floor });
    }
  }
  return out.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).map((r, order) => ({ ...r, order }));
}
/** The per-Character result files of one run. */
const resultsOf = d => fs.readdirSync(d).filter(f => f.endsWith('.json') && !NOT_RESULTS.has(f)).sort()
  .map(f => { try { return readJson(path.join(d, f)); } catch { return null; } }).filter(r => r && r.character && Array.isArray(r.journeys));

/** A reference to a finding, read in the run that holds it: a global id as it is, a local id in the run it recertified. */
const resolveIn = (run, ref) => String(ref).includes('/') ? String(ref) : `${run.parent ?? run.id}/${ref}`;

function ledger(dir = RUNS) {
  const runs = runsOf(dir), runById = new Map(runs.map(r => [r.id, r])), rows = [];
  const ran = new Map(), asked = new Map(); // run id -> Set(pair), run id -> Set(gid)
  for (const run of runs) {
    const rs = resultsOf(run.dir), mine = new Set(), shown = new Set();
    for (const r of rs) for (const j of r.journeys) {
      mine.add(pairKey(r.character, j.id));
      for (const p of Array.isArray(j.prior) ? j.prior : []) if (p?.id) shown.add(resolveIn(run, p.id));
    }
    ran.set(run.id, mine); asked.set(run.id, shown);
    let fs0 = [];
    try { fs0 = readJson(path.join(run.dir, 'findings.json')); } catch { fs0 = []; }
    (Array.isArray(fs0) ? fs0 : []).forEach((f, i) => { if (f && f.id) rows.push({ ...f, run: run.id, gid: `${run.id}/${f.id}`, order: run.order, at: i }); });
  }
  const byRow = new Map(rows.map(r => [r.gid, r]));
  // a recertify stamp asked about the row in the run it names
  for (const r of rows) if (r.recertify_run && asked.has(r.recertify_run)) asked.get(r.recertify_run).add(r.gid);

  // chains: union the rows a `recurs` link joins
  const up = new Map(rows.map(r => [r.gid, r.gid]));
  const find = g => { while (up.get(g) !== g) { up.set(g, up.get(up.get(g))); g = up.get(g); } return g; };
  for (const r of rows) {
    if (!r.recurs) continue;
    const to = resolveIn(runById.get(r.run), r.recurs);
    if (byRow.has(to)) up.set(find(r.gid), find(to));
  }
  const chains = new Map();
  for (const r of rows) { const k = find(r.gid); (chains.get(k) ?? chains.set(k, []).get(k)).push(r); }

  const gaps = [], byGid = new Map();
  for (const chain of chains.values()) {
    chain.sort((a, b) => a.order - b.order || a.at - b.at);
    const head = chain.at(-1), key = pairKey(head.character, head.journey), gids = new Set(chain.map(r => r.gid));
    const seen = [...chain.map(r => r.order), ...chain.filter(r => r.recertify_status === 'recurs' && runById.has(r.recertify_run)).map(r => runById.get(r.recertify_run).order)];
    const lastSeen = Math.max(...seen);
    const touched = runs.filter(run => [...asked.get(run.id)].some(g => gids.has(g))).map(run => run.order);
    const since = Math.max(lastSeen, ...touched);
    const later = runs.filter(run => run.order > since && ran.get(run.id).has(key));
    const gap = {
      id: head.gid, gids: chain.map(r => r.gid), rows: chain, head, character: head.character, journey: head.journey,
      type: head.type, severity: head.severity, rank: head.rank ?? 0, title: head.title,
      recurrence: Math.max(...chain.map(r => r.recurrence ?? 1)), firstSeen: chain[0].run, lastSeen: runs[lastSeen].id,
      open: isOpen(head), unasked: later.length, unaskedSince: later[0]?.id ?? null,
    };
    gaps.push(gap);
    for (const g of gap.gids) byGid.set(g, gap);
  }
  gaps.sort((a, b) => a.head.order - b.head.order || a.head.at - b.head.at);
  return { dir, runs, rows, gaps, open: gaps.filter(g => g.open), byGid };
}

// ---------------------------------------------------------------- the operator view
const one = s => String(s ?? '').replace(/\s*\n\s*/g, ' ');
/** OPEN.md: every open gap by Character x journey, the pair with the highest rank first. */
function statusOf(L, { insights = INSIGHTS } = {}) {
  const pairs = new Map();
  for (const g of L.open) { const k = pairKey(g.character, g.journey); (pairs.get(k) ?? pairs.set(k, []).get(k)).push(g); }
  const byRank = (a, b) => b.rank - a.rank || b.recurrence - a.recurrence || b.unasked - a.unasked || a.id.localeCompare(b.id);
  const sections = [...pairs.values()].map(gs => gs.sort(byRank)).sort((a, b) => b[0].rank - a[0].rank || b.length - a.length || a[0].character.localeCompare(b[0].character) || jn(a[0].journey) - jn(b[0].journey));
  const holding = new Set(L.open.flatMap(g => g.rows.map(r => r.run)));
  const top = L.runs.filter(r => !r.parent), drained = top.filter(r => fs.existsSync(path.join(insights, `${r.id}.md`)));
  const recurring = L.open.filter(g => g.recurrence > 1).length, unasked = L.open.filter(g => g.unasked > 0).length;
  const row = g => `- \`${g.id}\` ${g.severity} · rank ${g.rank} · ${one(g.title)}${g.recurrence > 1 ? ` · recurrence ${g.recurrence}, first seen ${g.firstSeen}` : ''}${g.unasked > 0 ? ` · unasked since ${g.unaskedSince} (${g.unasked} later run${g.unasked === 1 ? '' : 's'} of this pair)` : ''}`;
  return [
    '# Open LT findings — Linga', '',
    'Derived from every run under uat/runs/ by uat/driver/ledger.cjs (`node uat/driver/linga-text.cjs --status`), rewritten after every ledger recertify. Do not edit: the findings.json of each run is the record. Ids are run-qualified, `<run>/<id>`, since a finding id is positional within its run.', '',
    `${L.open.length} open in ${pairs.size} pairs across ${holding.size} runs`, '',
    `recurring ${recurring} · unasked by a later run of their pair ${unasked}`,
    `drained ${drained.length} of ${top.length} runs`,
    ...(top.length > drained.length ? [`undrained: ${top.filter(r => !drained.includes(r)).map(r => r.id).join(', ')} (home: docs/uat-insights/<run-id>.md, uat/README.md)`] : []), '',
    'Next: `node uat/driver/linga-text.cjs --recertify` reruns every pair below; each judge answers all of its pair\'s open rows, and each answer is stamped into the run that owns the row.', '',
    ...sections.flatMap(gs => [`## ${gs[0].character} ${gs[0].journey} · ${gs.length} open · top rank ${gs[0].rank}`, '', ...gs.map(row), '']),
  ].join('\n');
}
/** OPEN.md beside the runs, from a fresh ledger. */
function writeStatus(dir = RUNS, opts) {
  const md = statusOf(ledger(dir), opts), file = path.join(dir, 'OPEN.md');
  fs.writeFileSync(file, md);
  return { md, file };
}

module.exports = { RUNS, runsOf, ledger, statusOf, writeStatus, isOpen, pairKey };
