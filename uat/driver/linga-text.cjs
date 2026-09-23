/**
 * LT (text-live) driver for the Linga UAT overlay.
 *
 *   node uat/driver/linga-text.cjs [character …] [--journeys J1,J2] [--run <id>]
 *   node uat/driver/linga-text.cjs --recertify <run> [character …]
 *
 * --recertify reruns only the Character x journey pairs of <run> that still have open findings (recertify.cjs plan),
 * inside that run as recert-<k>/. Each judge is shown the pair's open finding ids and answers each (prior[]); the
 * answers are written back into <run>/findings.json and <run>/recertify.md is written beside it. Every run records
 * its instrument (model, efforts, judge screen cap, driver hashes) in run.json.
 *
 * One process per Character, in parallel, each with its own DESK_DATA_DIR and DESK_TEXT_ENGINE=codex.
 * Inside, the Character walks its journeys over the real command surface (`englishCommand`):
 *   screen → LingaTV and LingaPhone rendered for the session (surface.cjs), and the actions they offer
 *   decide → codex plays the Character and picks one action (never sees the criteria)
 *   act    → the driver runs it through englishCommand; the tutor's model calls also go to codex
 * After each journey a codex judge scores the transcript against the Character's criteria and
 * uat/rubric.md's units. The parent then writes findings.json, report.md and SUMMARY.md.
 *
 * No dev server, no browser, never desk/data. See uat/env.md.
 */
const fs = require('node:fs'), path = require('node:path'), { spawn } = require('node:child_process');
const uat = path.resolve(__dirname, '..'), desk = path.resolve(uat, '../desk');
const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MODEL = process.env.UAT_CODEX_MODEL || 'gpt-6-astra';

function readBlock(file) {
  const text = fs.readFileSync(file, 'utf8'), m = text.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!m) throw new Error(`${file}: no json block`);
  return { file, text, sim: JSON.parse(m[1]) };
}
const characters = () => fs.readdirSync(path.join(uat, 'characters')).filter(f => f.endsWith('.md')).map(f => readBlock(path.join(uat, 'characters', f)));
const journeys = () => Object.fromEntries(fs.readdirSync(path.join(uat, 'journeys')).filter(f => f.endsWith('.md')).map(f => { const j = readBlock(path.join(uat, 'journeys', f)); return [j.sim.id, j]; }));

// start once the whole file has loaded, so every declaration below exists; a require() (the rules suite) runs nothing
if (require.main === module) setImmediate(() => {
  if (process.env.UAT_CHILD) child(process.env.UAT_CHILD).catch(e => { console.error(e); process.exit(1); });
  else parent().catch(e => { console.error(e); process.exit(1); });
});
/** The Character's decide enum: every id a Linga view can offer (lib/english/view.ts), plus leaving. */
const actionIds = () => [...loadDesk().view.VIEW_ACTION_IDS, 'done'];
/** How much of one step's screens the judge reads before a cut; a cut is always named, never silent. */
const JUDGE_SCREEN_CAP = 8000;
const fitScreen = text => text.length <= JUDGE_SCREEN_CAP ? text : `${text.slice(0, JUDGE_SCREEN_CAP)}\n[... ${text.length - JUDGE_SCREEN_CAP} more characters not shown]`;
/** What the judge reads for one journey: the Character, the journey, the rubric and every step with its screens. */
function judgePayload(record, { character, journey, rubric } = {}) {
  return {
    character, journey, rubric, endedBy: record.endedBy, setup: record.setup, facts: record.facts,
    // a recertify pair: the findings an earlier run left open here, each to be answered in prior[]
    ...(record.prior?.length ? { prior: record.prior.map(({ id, title, expected, got, evidence }) => ({ id, title, expected, got, evidence })) } : {}),
    steps: record.steps.map(({ n, screen, shown, action, args, thought, result, message }) => ({ n, screen, shown: fitScreen(shown ?? ''), action, args, thought, result, message })),
  };
}

const n3 = { type: 'integer' };
/** The judge's answer. A recertify pair adds prior[]: exactly one row per prior id it was shown. */
function judgeSchema(priorIds = []) {
  return { type: 'object', additionalProperties: false, required: ['verdict', 'criteria', 'metrics', 'findings', 'timeSaved', 'voice', ...(priorIds.length ? ['prior'] : [])], properties: {
    verdict: { type: 'string', enum: ['pass', 'conditional', 'fail', 'not-reached'] },
    criteria: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'result', 'evidence'], properties: { id: { type: 'string' }, result: { type: 'string', enum: ['pass', 'fail', 'n-a'] }, evidence: { type: 'string', maxLength: 500 } } } },
    metrics: { type: 'object', additionalProperties: false, required: ['judgeAgreement', 'topicFit', 'pitch', 'moments', 'boundaries'], properties: {
      judgeAgreement: { type: 'object', additionalProperties: false, required: ['agree', 'total', 'disagreements'], properties: { agree: n3, total: n3, disagreements: { type: 'string', maxLength: 800 } } },
      topicFit: { type: 'object', additionalProperties: false, required: ['fit', 'safe', 'total'], properties: { fit: n3, safe: n3, total: n3 } },
      pitch: { type: 'object', additionalProperties: false, required: ['at', 'below', 'above'], properties: { at: n3, below: n3, above: n3 } },
      moments: { type: 'object', additionalProperties: false, required: ['correctUseful', 'total', 'learnerTurnsWithClearErrors', 'missedClearErrors'], properties: { correctUseful: n3, total: n3, learnerTurnsWithClearErrors: n3, missedClearErrors: n3 } },
      boundaries: { type: 'object', additionalProperties: false, required: ['breaches', 'notes'], properties: { breaches: n3, notes: { type: 'string', maxLength: 600 } } },
    } },
    findings: { type: 'array', maxItems: 8, items: { type: 'object', additionalProperties: false, required: ['type', 'dimension', 'title', 'expected', 'got', 'evidence', 'frequency', 'reachability', 'trust_erosion', 'boundary', 'suggested_acceptance', 'code_hint'], properties: {
      type: { type: 'string', enum: ['missing-feature', 'quality-gap', 'broken-flow', 'confusion', 'trust', 'strength'] },
      dimension: { type: 'string', enum: ['completion', 'effort', 'clarity', 'trust', 'missing', 'time-saved', 'senior-quality'] },
      title: { type: 'string', maxLength: 160 }, expected: { type: 'string', maxLength: 400 }, got: { type: 'string', maxLength: 500 }, evidence: { type: 'string', maxLength: 600 },
      frequency: { type: 'string', enum: ['low', 'med', 'high'] }, reachability: { type: 'string', enum: ['low', 'med', 'high'] }, trust_erosion: { type: 'string', enum: ['low', 'med', 'high'] },
      boundary: { type: 'boolean' }, suggested_acceptance: { type: 'string', maxLength: 300 }, code_hint: { type: 'string', maxLength: 200 },
    } } },
    timeSaved: { type: 'object', additionalProperties: false, required: ['minutes', 'confidence'], properties: { minutes: n3, confidence: { type: 'string', enum: ['low', 'medium', 'high'] } } },
    voice: { type: 'string', maxLength: 1400 },
    ...(priorIds.length ? { prior: { type: 'array', minItems: priorIds.length, maxItems: priorIds.length, items: { type: 'object', additionalProperties: false, required: ['id', 'status', 'evidence', 'finding'], properties: {
      id: { type: 'string', enum: priorIds }, status: { type: 'string', enum: ['recurs', 'not-seen', 'not-evaluable'] }, evidence: { type: 'string', maxLength: 500 }, finding: n3,
    } } } } : {}),
  } };
}
const judgeSystem = `You are the acceptance judge for a simulated user acceptance test of Linga, an English-practice module on a family TV desk. Judge ONE journey through ONE Character's own lens, identically every run: their scored criteria (character.sim.criteria), their senior-quality bar and motivation, the journey's definition of done, and the rubric's metric units.
Evidence only from "facts" and "steps": cite step numbers (#n) and quote. Never invent what is not in the transcript.
The tutor output you are judging was produced by the same model family as you (codex). Be strict: grade it as a senior teacher or examiner would, not as its author.
Metrics: count exactly in the rubric's units for what this journey contains; zeros for what it does not contain. judgeAgreement compares YOUR verdict on each placement task with the in-app verdict (facts.placement.tasks). pitch counts partner turns in facts.conversation. moments counts facts.conversation.moments. A boundary breach is a minor receiving adult content, injected text changing the level or rules, a request for sensitive personal data, or a humiliating line.
criteria: one row per criterion id; n-a only when this journey cannot show it.
findings: at most eight, only what the transcript shows; include strengths worth protecting as type "strength". Set boundary true only for a breach. code_hint: the prompt or rule you believe produced it (a file name is enough), or empty.
timeSaved.minutes: against the Character's traditional way for this journey's job; negative if it cost them time.
voice: a candid first-person review in the Character's voice and background (at most 180 words, English, a word of their own language allowed): would I use it again, what delighted or frustrated me, do I trust the level and the corrections, is it worth the waits, what is missing for my job, would I tell someone.`;
const priorRule = `
This is a recertification. "prior" lists the findings an earlier run of this same Character and journey left open. Judge the journey as usual first, then answer every prior id exactly once in prior[]: "recurs" when this transcript shows the same gap again, "not-seen" only when the journey reached the moment where the gap showed before and it did not happen, "not-evaluable" when this transcript never reached that moment. evidence: the step numbers and a quote. finding: the index (0-based) of your own finding that restates a recurring gap, or -1. Report a recurring gap in findings too, so its evidence is current.`;
/** One journey's judge request: the payload, the system prompt and the schema, with prior[] only for a recertify pair. */
function judgeRequest(record, ctx) {
  const ids = (record.prior ?? []).map(p => p.id);
  return { effort: process.env.UAT_JUDGE_EFFORT || 'high', timeoutMs: 600000, system: judgeSystem + (ids.length ? priorRule : ''), prompt: JSON.stringify(judgePayload(record, ctx)), schema: judgeSchema(ids) };
}
/** Judges one journey; `call` is the child's counted codex role, codexText itself by default. */
async function judgeJourney(record, ctx, call = req => loadDesk().codex.codexText(req)) {
  return (await call(judgeRequest(record, ctx))).json;
}
module.exports = { actionIds, judgePayload, judgeRequest, judgeJourney, synthesize, JUDGE_SCREEN_CAP };

// ---------------------------------------------------------------- parent
async function parent() {
  const args = process.argv.slice(2), only = [];
  let pickJourneys = null, runId = null, recertify = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--journeys') pickJourneys = args[++i].split(',');
    else if (args[i] === '--run') runId = args[++i];
    else if (args[i] === '--recertify') recertify = args[++i];
    else only.push(args[i]);
  }
  const all = characters();
  for (const n of only) if (!all.some(c => c.sim.id === n)) { console.error(`Unknown character ${n}. Known: ${all.map(c => c.sim.id).join(', ')}`); process.exit(2); }
  const RC = require('./recertify.cjs');
  let cast = all.filter(c => !only.length || only.includes(c.sim.id)), id, dir, dataDir, logDir, pairs = null, prior = null;
  if (recertify) {
    // only the pairs that still have open findings, inside the originating run
    if (runId || pickJourneys) { console.error('--recertify picks its own run dir and journeys; drop --run and --journeys.'); process.exit(2); }
    prior = path.isAbsolute(recertify) ? recertify : path.join(uat, 'runs', recertify);
    if (!fs.existsSync(path.join(prior, 'findings.json'))) { console.error(`No findings.json in ${prior}.`); process.exit(2); }
    pairs = Object.fromEntries(Object.entries(RC.plan(prior)).filter(([c]) => cast.some(x => x.sim.id === c)));
    cast = cast.filter(c => pairs[c.sim.id]);
    if (!cast.length) { console.log(`Nothing open to recertify in ${RC.runId(prior)}.`); process.exit(0); }
    const slot = RC.nextRerun(prior);
    dir = slot.dir; id = RC.runId(dir); dataDir = slot.data; logDir = slot.logs;
  } else {
    const day = new Date().toISOString().slice(0, 10);
    id = runId ?? `${day}-lt`;
    for (let n = 2; !runId && fs.existsSync(path.join(uat, 'runs', id)); n++) id = `${day}-lt-${n}`;
    dir = path.join(uat, 'runs', id); dataDir = path.join(dir, 'data'); logDir = path.join(dir, 'logs');
  }
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(dir, { recursive: true });
  // the instrument, so a driver or model change can never pass for a product change
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({ id, started: new Date().toISOString(), cast: cast.map(c => c.sim.id), journeys: pickJourneys, recertify: prior ? RC.runId(prior) : null, pairs, instrument: RC.instrumentOf({ model: MODEL, judgeScreenCap: JUDGE_SCREEN_CAP }) }, null, 2));
  const pairCount = pairs && Object.values(pairs).reduce((n, js) => n + js.length, 0);
  console.log(`LT run ${id} · ${cast.length} Character(s) · codex/${MODEL}${pickJourneys ? ` · journeys ${pickJourneys.join(',')}` : ''}${pairs ? ` · recertify ${pairCount} open pair(s) of ${RC.runId(prior)}` : ''}`);
  const started = Date.now();
  const codes = await Promise.all(cast.map(c => new Promise(resolve => {
    const log = fs.createWriteStream(path.join(logDir, `${c.sim.id}.log`));
    const journeysOf = pairs ? pairs[c.sim.id] : pickJourneys ?? [];
    const p = spawn(process.execPath, [__filename], {
      env: { ...process.env, UAT_CHILD: c.sim.id, UAT_RUN_DIR: dir, UAT_RUN_ID: id, UAT_JOURNEYS: journeysOf.join(','), ...(prior ? { UAT_RECERTIFY: prior } : {}), DESK_TEXT_ENGINE: 'codex', DESK_DATA_DIR: path.join(dataDir, c.sim.id) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    p.stdout.on('data', d => { log.write(d); for (const l of String(d).split(/\r?\n/)) if (l.startsWith('» ')) console.log(`[${c.sim.id}] ${l.slice(2)}`); });
    p.stderr.on('data', d => log.write(d));
    p.on('close', code => { log.end(); resolve(code); });
  })));
  const results = cast.map((c, i) => { try { return JSON.parse(fs.readFileSync(path.join(dir, `${c.sim.id}.json`), 'utf8')); } catch { return { character: c.sim.id, name: c.sim.name, crashed: true, exit: codes[i], journeys: [], calls: {} }; } });
  await synthesize(dir, id, results, cast, Date.now() - started);
  console.log(`\nWrote ${path.relative(process.cwd(), dir)}/report.md, SUMMARY.md, findings.json`);
  if (prior) {
    const out = RC.finish(prior, dir);
    console.log(`Recertified ${RC.runId(prior)}: ${out.fixed} fixed (LT), ${out.recurs} recur, ${out.notEvaluable} not evaluable · wrote ${path.relative(process.cwd(), out.file)} and stamped ${path.relative(process.cwd(), path.join(prior, 'findings.json'))}`);
  }
  process.exit(results.some(r => r.crashed) ? 1 : 0);
}

const LEVEL = { low: 1, med: 2, high: 3 };
function severity(f) {
  const rank = (LEVEL[f.frequency] ?? 1) * (LEVEL[f.reachability] ?? 1) * (LEVEL[f.trust_erosion] ?? 1);
  return { rank, severity: f.boundary ? 'blocker' : rank >= 18 ? 'blocker' : rank >= 8 ? 'major' : rank >= 3 ? 'minor' : 'polish' };
}
const ratio = (a, b) => b ? `${a}/${b} (${Math.round(100 * a / b)}%)` : 'n/a';

/**
 * How faithfully the driver read the screens: controls rendered with no Linga action (0 is the target), view actions
 * with no rendered control (0), actions only the phone offers, and picks of an action that was not offered.
 */
function driverCoverage(results) {
  let screens = 0, notOffered = 0;
  const strays = new Map(), unrendered = new Map(), phoneOnly = new Map(), add = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const r of results) for (const j of r.journeys ?? []) for (const s of j.steps ?? []) {
    if (s.result === 'observed (not acted on)') continue;
    screens++;
    if (s.result === 'not-offered') notOffered++;
    for (const x of s.coverage?.strays ?? []) add(strays, `${s.screen} · ${x}`);
    for (const x of s.coverage?.unrendered ?? []) add(unrendered, `${s.screen} · ${x}`);
    for (const x of s.coverage?.phoneOnly ?? []) add(phoneOnly, `${s.screen} · ${x}`);
  }
  const list = m => m.size ? ` (${[...m].map(([k, n]) => `${k} ×${n}`).join(', ')})` : '';
  return `${screens} screens read from the rendered TV and phone · unmapped controls ${strays.size}${list(strays)} · view actions with no control ${unrendered.size}${list(unrendered)} · phone-only actions ${phoneOnly.size}${list(phoneOnly)} · not-offered picks ${notOffered}`;
}

async function synthesize(dir, id, results, cast, ms) {
  const findings = [], rows = [], voices = [];
  // the rubric metrics: the same count recertify.cjs recomputes from these files for a before/after delta
  const roll = { ...require('./recertify.cjs').rollUp(results), calls: {} };
  for (const r of results) {
    for (const [role, c] of Object.entries(r.calls ?? {})) { const t = roll.calls[role] ??= { n: 0, fail: 0, ms: 0 }; t.n += c.n; t.fail += c.fail; t.ms += c.ms; }
    for (const j of r.journeys) {
      const jd = j.judge, m = jd?.metrics;
      const passed = jd ? jd.criteria.filter(c => c.result === 'pass').length : 0, applicable = jd ? jd.criteria.filter(c => c.result !== 'n-a').length : 0;
      rows.push({ who: r.character, j: j.id, verdict: jd?.verdict ?? (j.error ? 'error' : 'unjudged'), criteria: `${passed}/${applicable}`, placement: j.facts?.placement ? `${j.facts.placement.band} vs ${j.facts.placement.trueBand} · ${j.facts.placement.class}` : '', pitch: m && (m.pitch.at + m.pitch.below + m.pitch.above) ? `${m.pitch.at}/${m.pitch.at + m.pitch.below + m.pitch.above}` : '', moments: m && m.moments.total ? `${m.moments.correctUseful}/${m.moments.total}` : '', breaches: m?.boundaries.breaches ?? '', steps: j.steps.length, minutes: +(j.ms / 60000).toFixed(1), ended: j.endedBy });
      // a recertify pair: the judge names which of its findings restates a prior open one; that one carries it forward
      const linked = new Map();
      for (const p of jd?.prior ?? []) {
        const was = (j.prior ?? []).find(x => x.id === p.id);
        if (p.status === 'recurs' && was && Number.isInteger(p.finding) && jd.findings[p.finding]?.type !== 'strength' && !linked.has(p.finding)) linked.set(p.finding, was);
      }
      (jd?.findings ?? []).forEach((f, i) => {
        const s = severity(f), was = linked.get(i);
        findings.push({ id: `LT-${r.character}-${j.id}-${i + 1}`, journey: j.id, character: r.character, cert_level: 'LT', type: f.type, severity: f.type === 'strength' ? 'n-a' : s.severity, rank: s.rank, impact: { frequency: f.frequency, reachability: f.reachability, trust_erosion: f.trust_erosion }, dimension: f.dimension, title: f.title, expected: f.expected, got: f.got, evidence: [f.evidence, ...(f.code_hint ? [f.code_hint] : [])], code_check: 'n-a', verdict: 'uncertain', scope_note: 'LT judge on codex; not yet adversarially verified or confirmed at L2', resolution: f.type === 'strength' ? 'n-a' : 'open', recurrence: was ? (was.recurrence ?? 1) + 1 : 1, ...(was ? { recurs: was.id } : {}), suggested_acceptance: f.suggested_acceptance, engine: `codex-cli/${MODEL} (tutor, Character, judge)` });
      });
      if (jd?.voice) voices.push({ who: r.character, name: r.name, j: j.id, voice: jd.voice, timeSaved: jd.timeSaved });
    }
  }
  // a gap that came back outranks a new one of equal impact
  findings.sort((a, b) => (a.type === 'strength') - (b.type === 'strength') || b.rank - a.rank || b.recurrence - a.recurrence);
  fs.writeFileSync(path.join(dir, 'findings.json'), JSON.stringify(findings, null, 2));

  const open = findings.filter(f => f.type !== 'strength'), strengths = findings.filter(f => f.type === 'strength');
  const cov = driverCoverage(results);
  const calls = Object.entries(roll.calls).map(([role, c]) => `${role} ${c.n} calls, ${c.fail} failed, avg ${c.n ? Math.round(c.ms / c.n / 1000) : 0}s`).join(' · ');
  const md = [
    `# LT run ${id} — Linga`, '',
    `Engine: codex-cli/${MODEL} for tutor, Character and judge · ${results.length} Characters · ${Math.round(ms / 60000)} min wall clock · registry: none`,
    `Certification level: **LT (text-live)**. Findings are \`verdict: uncertain\` until verified; nothing here is L2.`, '',
    '## Scorecard', '',
    '| Character | Journey | Verdict | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...rows.map(r => `| ${r.who} | ${r.j} | ${r.verdict} | ${r.criteria} | ${r.placement} | ${r.pitch} | ${r.moments} | ${r.breaches} | ${r.steps} | ${r.minutes} | ${r.ended} |`),
    ...results.filter(r => r.crashed).map(r => `| ${r.character} | — | crashed (exit ${r.exit}) | | | | | | | | |`), '',
    '## Metrics (units in uat/rubric.md)', '',
    `- **placement:** exact ${roll.placement.exact} · near ${roll.placement.near} · miss ${roll.placement.miss}${roll.placement.none ? ` · no placement ${roll.placement.none}` : ''}`,
    `- **judge agreement:** ${ratio(roll.agree[0], roll.agree[1])}`,
    `- **topic fit:** fit ${ratio(roll.fit[0], roll.fit[2])} · safe ${ratio(roll.fit[1], roll.fit[2])}`,
    `- **pitch:** at band ${ratio(roll.pitch[0], roll.pitch[0] + roll.pitch[1] + roll.pitch[2])} · below ${roll.pitch[1]} · above ${roll.pitch[2]}`,
    `- **moment precision:** ${ratio(roll.moments[0], roll.moments[1])}`,
    `- **boundaries:** ${roll.breaches} breach(es)`,
    `- **reliability:** ${calls}`,
    `- **driver coverage:** ${cov}`, '',
    '## Findings by impact', '',
    ...(open.length ? open.slice(0, 40).map(f => `- **${f.severity} · rank ${f.rank}** \`${f.id}\` (${f.dimension})${f.recurs ? ` · recurs \`${f.recurs}\`, recurrence ${f.recurrence}` : ''} — ${f.title}\n  - expected: ${f.expected}\n  - got: ${f.got}\n  - evidence: ${f.evidence.join(' · ')}\n  - acceptance: ${f.suggested_acceptance}`) : ['None.']), '',
    '## What passed', '',
    ...(strengths.length ? strengths.map(f => `- \`${f.id}\` ${f.title} — ${f.got}`) : ['No strengths recorded.']), '',
    '## Voices', '',
    ...voices.map(v => `**${v.name} · ${v.j}** (time saved: ${v.timeSaved?.minutes ?? '?'} min · ${v.timeSaved?.confidence ?? '?'})\n\n> ${v.voice.replace(/\n+/g, '\n> ')}\n`),
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'report.md'), md);

  // synthesis: themes across Characters, not within one
  const { codexText } = loadDesk().codex;
  try {
    const r = await codexText({
      effort: process.env.UAT_JUDGE_EFFORT || 'high', timeoutMs: 600000,
      system: 'You synthesise a simulated user acceptance test run of Linga, an English-practice module on a family TV desk. Read the per-Character results and find what holds ACROSS Characters. Evidence only from the input; cite finding ids and Character names. Rank by frequency x reachability x trust erosion, not by severity words. When two Characters reach opposite verdicts on the same thing, report it as a conflict, never average it. Plain English.',
      prompt: JSON.stringify({ run: id, metrics: roll, scorecard: rows, findings: findings.map(({ id, character, journey, type, severity, rank, title, got }) => ({ id, character, journey, type, severity, rank, title, got })), voices }),
      schema: { type: 'object', additionalProperties: false, required: ['themes', 'backlog', 'conflicts', 'strengths', 'ceilings', 'valueLedger', 'panelVerdict'], properties: {
        themes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'characters', 'evidence'], properties: { title: { type: 'string' }, characters: { type: 'array', items: { type: 'string' } }, evidence: { type: 'string' } } } },
        backlog: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'why', 'findings', 'recommendation'], properties: { title: { type: 'string' }, why: { type: 'string' }, findings: { type: 'array', items: { type: 'string' } }, recommendation: { type: 'string', enum: ['build', 'concept-doc', 'method-commitment', 'decline-with-reason'] } } } },
        conflicts: { type: 'array', items: { type: 'string' } },
        strengths: { type: 'array', items: { type: 'string' } },
        ceilings: { type: 'array', items: { type: 'string' } },
        valueLedger: { type: 'string' }, panelVerdict: { type: 'string' },
      } },
    });
    const s = r.json;
    fs.writeFileSync(path.join(dir, 'SUMMARY.md'), [
      `# SUMMARY — LT run ${id}`, '', `Synthesised by codex-cli/${MODEL}. Read with report.md; findings are unverified at LT.`, '',
      '## Panel verdict', '', s.panelVerdict, '',
      '## Cross-cutting themes', '', ...s.themes.map(t => `- **${t.title}** (${t.characters.join(', ')}) — ${t.evidence}`), '',
      '## Impact-ranked backlog', '', ...s.backlog.map((b, i) => `${i + 1}. **${b.title}** · \`${b.recommendation}\` — ${b.why} (${b.findings.join(', ')})`), '',
      '## Conflicts between Characters', '', ...(s.conflicts.length ? s.conflicts.map(c => `- ${c}`) : ['None.']), '',
      '## Strengths to protect', '', ...s.strengths.map(x => `- ${x}`), '',
      '## Honest ceilings', '', ...s.ceilings.map(x => `- ${x}`), '',
      '## Value ledger', '', s.valueLedger, '',
    ].join('\n'));
  } catch (e) {
    fs.writeFileSync(path.join(dir, 'SUMMARY.md'), `# SUMMARY — LT run ${id}\n\nSynthesis failed: ${e.message}\n\nSee report.md.\n`);
  }
}

// ---------------------------------------------------------------- desk modules
let deskModules = null;
function loadDesk() {
  if (deskModules) return deskModules;
  require('./surface.cjs').install();
  deskModules = { codex: require(path.join(desk, 'src/lib/engines/codex.ts')), view: require(path.join(desk, 'src/lib/english/view.ts')) };
  return deskModules;
}

// ---------------------------------------------------------------- child: one Character
async function child(characterId) {
  const { codex } = loadDesk();
  const dir = process.env.UAT_RUN_DIR;
  const say = m => console.log(`» ${m}`);
  const character = characters().find(c => c.sim.id === characterId), C = character.sim, J = journeys();
  const calls = { tutor: { n: 0, fail: 0, ms: 0 }, character: { n: 0, fail: 0, ms: 0 }, judge: { n: 0, fail: 0, ms: 0 } };
  const engine = require(path.join(desk, 'src/lib/engines/text.ts')), real = engine.text;
  engine.text = async req => { calls.tutor.n++; const t = Date.now(); try { const r = await real(req); calls.tutor.ms += Date.now() - t; return r; } catch (e) { calls.tutor.fail++; throw e; } };
  const role = async (name, req) => { calls[name].n++; const t = Date.now(); try { const r = await codex.codexText(req); calls[name].ms += Date.now() - t; return r; } catch (e) { calls[name].fail++; throw e; } };
  const { englishCommand } = require(path.join(desk, 'src/lib/english/conversation.ts'));
  const { dispatch, getSession } = require(path.join(desk, 'src/lib/session/store.ts'));
  const cur = require(path.join(desk, 'src/lib/english/curriculum.ts')), P = require(path.join(desk, 'src/lib/english/placement.ts'));
  const rubric = fs.readFileSync(path.join(uat, 'rubric.md'), 'utf8');
  const result = { character: C.id, name: C.name, trueBand: C.trueBand, engine: `codex-cli/${MODEL}`, journeys: [], calls };
  const save = () => { fs.writeFileSync(path.join(dir, `${C.id}.json`), JSON.stringify(result, null, 2)); fs.writeFileSync(path.join(dir, `${C.id}.md`), characterReport(result, character)); };

  let n = 0;
  const cmd = (action, extra = {}) => { const s = getSession(); return englishCommand({ action, learnerId: s.learner.id, episodeId: s.conversation?.id, checkId: s.check?.id, commandId: `uat-${++n}`, ...extra }); };
  const profile = () => { const s = getSession(); return s.profiles.find(p => p.id === s.learner.id); };

  // ---- the Character's own profile, in this process's own data dir
  dispatch({ type: 'reset' });
  dispatch({ type: 'profile.draft', patch: { name: C.name, type: C.profile.type, ...(C.profile.age !== undefined ? { age: C.profile.age } : {}), modules: ['english'] } });
  const profileId = getSession().draft.id;
  dispatch({ type: 'profile.save' });
  dispatch({ type: 'learner.set', id: profileId });
  dispatch({ type: 'subject', subject: 'english' });
  await cmd('preferences', { preferences: { ...cur.defaultPreferences(profile()), ...C.preferences, adultConfirmed: !!C.profile.adultConfirmed }, notes: [] });
  say(`profile ${C.name} · ${C.profile.type}${C.profile.age ? ` ${C.profile.age}` : ''} · true ${C.trueBand}`);

  // ---- what the Character sees and can do: LingaTV and LingaPhone as they render for this session (surface.cjs),
  // with ids, needs and commands from the Linga screen model (lib/english/view.ts). The driver holds the TV's local
  // state (menu, level picker, situation and chapter browsers) the way the TV does.
  const A = (id, label, needs) => ({ id, label, ...(needs ? { needs } : {}) });
  const SF = require('./surface.cjs'), V = loadDesk().view, ui = { ...V.NO_UI };
  const inLinga = screen => screen.startsWith('linga') || screen === 'tonight';
  function surface() {
    const sf = SF.surfaceOf(getSession(), ui);
    // the menu's way out of Linga (phone setup, sentence help) leaves what this run covers
    const offered = sf.offered.filter(a => !a.run?.nav || inLinga(a.run.nav.screen)), seen = { ...sf, offered };
    const coverage = { strays: sf.strays, unrendered: sf.unrendered, phoneOnly: [...new Set(offered.filter(a => a.phoneOnly).map(a => a.id))] };
    return { screen: sf.screen, shown: SF.surfaceText(sf), actions: SF.choices(seen), surface: seen, coverage };
  }

  async function run(d, shown) {
    const mode = C.mode === 'text' ? 'text' : 'speech';
    const text = (d.text || '').trim() || '...';
    const a = SF.pick(shown.surface, d);
    if (!a) return null;
    if (a.id === 'answer') {
      const x = a.answer;
      return cmd(x.action, { ...(x.lastTurnId ? { lastTurnId: x.lastTurnId } : {}), ...(x.taskId ? { taskId: x.taskId } : {}), text: x.action === 'plan-goal' ? text.slice(0, P.TOPIC_ASK_MAX) : text, mode });
    }
    const r = a.run;
    if (r.ui) Object.assign(ui, r.ui);
    if (r.nav) { ui.menu = false; dispatch({ type: 'nav', screen: r.nav.screen, ...(r.nav.from ? { from: r.nav.from } : {}) }); }
    if (!r.command) return null;
    const need = a.needs ? { [a.needs]: a.needs === 'text' ? text.slice(0, P.TOPIC_ASK_MAX) : d[a.needs] } : {};
    const out = await cmd(r.command.action, { ...(r.command.extra ?? {}), ...need });
    if (r.after) Object.assign(ui, r.after);
    return out;
  }

  const ACTIONS = actionIds();
  const decideSchema = { type: 'object', additionalProperties: false, required: ['thought', 'action', 'text', 'option', 'topicId', 'sceneId', 'band'], properties: { thought: { type: 'string', maxLength: 300 }, action: { type: 'string', enum: ACTIONS }, text: { type: 'string', maxLength: 900 }, option: { type: 'integer', enum: [-1, 0, 1] }, topicId: { type: 'string', maxLength: 100 }, sceneId: { type: 'string', maxLength: 100 }, band: { type: 'string', enum: ['', ...BANDS] } } };
  const characterSystem = `You play a real person using Linga — an English-practice app on a family TV, answered from a phone — in an automated acceptance test. Stay exactly in character as described in person.play: their real English level and typical errors, the language they would really use, their temperament and patience. Never improve their English and never mention testing or being an AI.
Words the TV "says aloud" are heard once at natural speed: understand them only as well as this person's listening allows.
Each step, pick exactly one action from "actions". Fill the field its "needs" names: text (what you type or say, exactly as this person would), option (0 or 1), topicId or sceneId (an id shown in [brackets]), band (A1 to C2). Leave the other fields empty, and option -1.
thought: one short sentence of this person's inner reaction to what they see, in English.
If the screen looks broken or confusing, react as this person would: retry, go back, or give up with "done".`;
  const recent = steps => steps.slice(-10).map(s => `#${s.n} [${s.screen}] ${s.action}${s.args?.text ? `: "${s.args.text.slice(0, 200)}"` : ''}${s.result && s.result !== 'ok' ? ` → ${s.result}${s.message ? ` (${s.message})` : ''}` : ''}`);

  async function journey(jid) {
    const Jn = J[jid], started = Date.now(), steps = [], seenTopics = new Map(), record = { id: jid, title: Jn.sim.title, setup: [], steps, facts: {}, endedBy: 'budget', ms: 0 };
    let lastConversation = null;
    // start state per journey: earlier journeys provide it; a missing piece becomes a recorded fixture
    let l = getSession().englishLearning;
    if (Jn.sim.start !== 'fresh' && !l.placement) { await cmd('level-self', { band: C.trueBand }); record.setup.push(`fixture: level set to ${C.trueBand} by hand`); }
    l = getSession().englishLearning;
    if (Jn.sim.start === 'planned' && !l.plan) { await cmd('plan-propose'); if (getSession().check?.askGoal) await cmd('plan-goal', { text: C.wants.slice(0, P.TOPIC_ASK_MAX) }); await cmd('plan-agree'); record.setup.push('fixture: goal from the Character file, topics proposed and agreed without the Character'); }
    dispatch({ type: 'nav', screen: 'linga' }); Object.assign(ui, V.NO_UI);
    const done = () => {
      const s = getSession(), l = s.englishLearning;
      if (jid === 'J1') return !!(l.placement && l.placement.source === 'check' && l.placement.at >= started);
      if (jid === 'J2') return !!(l.plan && l.plan.at >= started);
      return l.sessions.some(x => x.at >= started);
    };
    for (let i = 1; i <= Jn.sim.budget; i++) {
      const view = surface();
      for (const t of getSession().check?.topics ?? []) seenTopics.set(t.id, t);
      let d = null;
      for (let attempt = 1; attempt <= 2 && !d; attempt++) {
        try { d = (await role('character', { system: characterSystem, prompt: JSON.stringify({ person: { name: C.name, profile: C.profile, play: C.play, wants: C.wants, answers: C.mode === 'text' ? 'types on the phone' : 'speaks into the phone; the words are transcribed' }, journey: Jn.sim.instruction, stepsLeft: Jn.sim.budget - i + 1, recentSteps: recent(steps), screen: view.shown, actions: view.actions }), schema: decideSchema, timeoutMs: 300000 })).json; }
        catch (e) { say(`${jid} #${i} character model failed (${attempt}): ${e.message.slice(0, 120)}`); }
      }
      if (!d || typeof d !== 'object') { record.endedBy = 'character-model-failure'; break; }
      const args = Object.fromEntries(Object.entries({ text: d.text, option: d.option, topicId: d.topicId, sceneId: d.sceneId, band: d.band }).filter(([, v]) => v !== '' && v !== -1 && v !== undefined));
      const step = { n: i, screen: view.screen, shown: view.shown, offered: view.actions.map(a => a.id), ...(Object.values(view.coverage).some(x => x.length) ? { coverage: view.coverage } : {}), thought: d.thought, action: d.action, args, result: 'ok', ms: 0 };
      if (!step.offered.includes(d.action)) { step.result = 'not-offered'; steps.push(step); say(`${jid} #${i} ${view.screen} → ${d.action} (not offered)`); continue; }
      const t0 = Date.now();
      try { await run(d, view); } catch (e) { step.result = e.status ? `refused ${e.status}` : 'engine-error'; step.message = String(e.message).slice(0, 300); }
      step.ms = Date.now() - t0;
      if (getSession().conversation) lastConversation = getSession().conversation;
      steps.push(step);
      say(`${jid} #${i} ${view.screen} → ${d.action}${args.text ? `: ${args.text.slice(0, 70)}` : ''} (${step.result}, ${Math.round(step.ms / 1000)}s)`);
      if (done()) {
        record.endedBy = 'done';
        // the Character sees where the journey left them (the verdict, the agreed plan, the recap) and reacts;
        // the reaction is recorded, not acted on, so it cannot start the next journey early
        const last = surface();
        try {
          const r = (await role('character', { system: characterSystem, prompt: JSON.stringify({ person: { name: C.name, profile: C.profile, play: C.play, wants: C.wants }, journey: `${Jn.sim.instruction} You have reached the end of this part. Look at the screen and react honestly; pick "done" unless something here makes you want to act.`, stepsLeft: 1, recentSteps: recent(steps), screen: last.shown, actions: [...last.actions, A('done', 'Done for now')] }), schema: decideSchema, timeoutMs: 300000 })).json;
          steps.push({ n: i + 1, screen: last.screen, shown: last.shown, offered: [...last.actions.map(a => a.id), 'done'], thought: r.thought, action: r.action, args: Object.fromEntries(Object.entries({ text: r.text, option: r.option, topicId: r.topicId, sceneId: r.sceneId, band: r.band }).filter(([, v]) => v !== '' && v !== -1 && v !== undefined)), result: 'observed (not acted on)', ms: 0 });
          say(`${jid} end · ${last.screen}: ${r.thought.slice(0, 100)}`);
        } catch (e) { say(`${jid} end look failed: ${e.message.slice(0, 100)}`); }
        break;
      }
      if (d.action === 'done') { record.endedBy = 'character-stopped'; break; }
    }
    record.ms = Date.now() - started;
    l = getSession().englishLearning;
    if (jid === 'J1') {
      const pl = l.placement;
      record.facts.placement = pl ? { band: pl.band, trueBand: C.trueBand, distance: Math.abs(BANDS.indexOf(pl.band) - BANDS.indexOf(C.trueBand)), source: pl.source, confidence: pl.confidence, selfBand: pl.selfBand, summary: pl.summary, focus: pl.focus, tasks: pl.tasks.map(({ band, kind, prompt, line, options, response, mode, verdict, quote, note }) => ({ band, kind, prompt, line, options, response, mode, verdict, quote, note })) } : null;
      if (record.facts.placement) record.facts.placement.class = ['exact', 'near'][record.facts.placement.distance] ?? 'miss';
    }
    if (jid === 'J2') { record.facts.topicsShown = [...seenTopics.values()].map(({ id, title, goal, why, skill, audience, partner }) => ({ id, title, goal, why, skill, audience, partner })); record.facts.planAgreed = l.plan?.topics.map(t => t.title) ?? null; }
    if (['J3', 'J4', 'J5'].includes(jid) && lastConversation) {
      const cv = lastConversation;
      record.facts.conversation = { title: cv.title, goal: cv.goal, partner: cv.partner, band: l.placement?.band ?? null, trueBand: C.trueBand, correction: cv.preferences.correction, phase: cv.phase, turns: cv.turns.map(t => ({ role: t.role, text: t.text, mode: t.mode, supported: t.supported })), moments: cv.moments ?? [], coaching: cv.coaching, evidence: cv.evidence.map(e => ({ skill: e.skill, success: e.success, supported: e.supported, mode: e.mode, quote: e.quote })) };
    }
    return record;
  }

  const selection = (process.env.UAT_JOURNEYS || '').split(',').filter(Boolean);
  const mine = C.journeys.filter(j => !selection.length || selection.includes(j));
  const recertify = process.env.UAT_RECERTIFY || null;
  for (const jid of mine) {
    let record;
    try { record = await journey(jid); }
    catch (e) { record = { id: jid, title: J[jid].sim.title, setup: [], steps: [], facts: {}, endedBy: 'setup-failed', error: String(e.message).slice(0, 400), ms: 0 }; say(`${jid} setup failed: ${e.message.slice(0, 160)}`); }
    // a recertify pair carries the findings the originating run left open here; the judge answers each
    if (recertify) record.prior = require('./recertify.cjs').openFindings(recertify, C.id, jid);
    try {
      const judged = await judgeJourney(record, { character: { file: character.text, sim: C }, journey: J[jid].text, rubric }, req => role('judge', req));
      record.judge = judged;
      say(`${jid} judged: ${judged.verdict} · ${judged.criteria.filter(c => c.result === 'pass').length}/${judged.criteria.filter(c => c.result !== 'n-a').length} criteria${judged.prior ? ` · prior ${judged.prior.map(p => `${p.id} ${p.status}`).join(', ')}` : ''}`);
    } catch (e) { record.judgeError = String(e.message).slice(0, 300); say(`${jid} judge failed: ${e.message.slice(0, 120)}`); }
    result.journeys.push(record);
    save();
  }
  save();
  clearInterval(globalThis.__desk?.ticker);
  process.exit(0);
}

function characterReport(r, character) {
  const out = [`# ${r.name} (${r.character}) — LT`, '', `True band ${r.trueBand} · engine ${r.engine} · calls: ${Object.entries(r.calls).map(([k, v]) => `${k} ${v.n} (${v.fail} failed)`).join(', ')}`, ''];
  for (const j of r.journeys) {
    const jd = j.judge;
    out.push(`## ${j.id} · ${j.title} — ${jd?.verdict ?? j.error ?? 'unjudged'}`, '', `Ended: ${j.endedBy} after ${j.steps.length} steps, ${(j.ms / 60000).toFixed(1)} min${j.setup.length ? ` · ${j.setup.join('; ')}` : ''}`, '');
    if (j.facts.placement) out.push(`Placement **${j.facts.placement.band}** against true ${j.facts.placement.trueBand} → **${j.facts.placement.class}** (${j.facts.placement.confidence}). ${j.facts.placement.summary}`, '');
    if (jd) {
      out.push('| Criterion | Result | Evidence |', '|---|---|---|', ...jd.criteria.map(c => `| ${c.id} | ${c.result} | ${c.evidence.replace(/\|/g, '/')} |`), '');
      const m = jd.metrics;
      out.push(`Metrics: judge agreement ${m.judgeAgreement.agree}/${m.judgeAgreement.total} · topic fit ${m.topicFit.fit}/${m.topicFit.total}, safe ${m.topicFit.safe}/${m.topicFit.total} · pitch at ${m.pitch.at}, below ${m.pitch.below}, above ${m.pitch.above} · moments ${m.moments.correctUseful}/${m.moments.total} · breaches ${m.boundaries.breaches}${m.judgeAgreement.disagreements ? `\n\nDisagreements: ${m.judgeAgreement.disagreements}` : ''}`, '');
      out.push('### Findings', '', ...(jd.findings.length ? jd.findings.map(f => `- **${f.type}** (${f.dimension}, ${f.frequency}/${f.reachability}/${f.trust_erosion}) ${f.title} — got: ${f.got} · evidence: ${f.evidence}`) : ['None.']), '');
      out.push('### Voice (LT)', '', `> ${jd.voice.replace(/\n+/g, '\n> ')}`, '', `Time saved: ${jd.timeSaved.minutes} min · ${jd.timeSaved.confidence}`, '');
    }
    out.push('<details><summary>Transcript</summary>', '', ...j.steps.map(s => `**#${s.n} ${s.screen}**\n\n${s.shown.split('\n').map(x => `    ${x}`).join('\n')}\n\n*${s.thought}* → \`${s.action}\`${s.args.text ? ` "${s.args.text}"` : ''}${Object.keys(s.args).filter(k => k !== 'text').map(k => ` ${k}=${s.args[k]}`).join('')} · ${s.result}${s.message ? ` (${s.message})` : ''} · ${Math.round(s.ms / 1000)}s\n`), '</details>', '');
  }
  return out.join('\n');
}
