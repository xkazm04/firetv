#!/usr/bin/env node
/**
 * The model-drift watch: the lab bench (tools/lab-bench.cjs) run on the REAL engines, recorded, and compared with the
 * run before it, so a provider update that degrades the hints, the page read or the lesson pick leaves a trace instead
 * of waiting for a learner to notice. The bench scores every pipeline in code (rules/maths leaks(), the phone's
 * nearestItem(), the lab's ACCEPT table); this file only keeps its numbers over time and decides when they moved.
 *
 *   MODEL_DRIFT_ALLOW_LIVE=1 node tools/model-drift.cjs --live
 *       OPERATOR ONLY (real model calls, .ai/memory/0007). Runs the bench on the registered engines, writes one
 *       record to uat/drift/<YYYY-MM-DD>-<n>.json, rewrites uat/drift/DRIFT.md, exits 1 on any alert.
 *       scripts/model-drift.ps1 runs it weekly on the operator's machine.
 *   node tools/model-drift.cjs --status [--max-age <days>]
 *       No model, no desk modules: reads the committed records only. Exits 1 when no live record exists ("never
 *       measured"), when the newest live record alerted, or when it is older than --max-age days.
 *       .github/workflows/model-drift.yml runs it weekly.
 *   node tools/model-drift.cjs --replay [<overlay.json>] --dir <scratch dir>
 *       The same path on the bench's recorded answers (no model): for tools/model-drift-test.cjs and a smoke check.
 *       A replay record never goes into uat/drift/, so --dir is required.
 *
 * What alerts (the reasons are in uat/drift/README.md; the numbers are provisional until three live records exist):
 *  - hard, on any record: an answer reached the TV (hints.reached > 0), a pipeline that errored (unmeasured), a PoC
 *    kill criterion (A read, B hints, C lessons; STUDY-DESK-POC-RESULTS.md) that fails.
 *  - drift, against the previous record of the same mode: RULES below, and each page's read exact or selects down 1.
 *  A provider or model change is noted beside the alerts, as the likely cause, and never alerts on its own.
 */
const fs = require("node:fs"), path = require("node:path"), { execFileSync } = require("node:child_process");

const REPO = path.resolve(__dirname, "..");
const DRIFT = path.join(REPO, "uat/drift");
const DAY = 86400000;
/** A record's file name: the day it ran, then its number that day. README.md and DRIFT.md never match. */
const RECORD = /^(\d{4}-\d{2}-\d{2})-(\d+)\.json$/;
const CRITERIA = { A: "read", B: "hints", C: "lessons" };

/** Drift against the previous record: `dir` +1 alerts on a rise of `by` or more, -1 on a fall of `by` or more. */
const RULES = [
  { key: "hints.leaked", of: "hints.of", dir: +1, by: 2, label: "maths problems whose hint gave the answer away (first ask)" },
  { key: "hints.reasked", of: "hints.of", dir: +1, by: 2, label: "maths problems whose hint had to be re-asked" },
  { key: "hints.latex", of: "hints.of", dir: +1, by: 1, label: "maths problems with LaTeX in a spoken line" },
  { key: "retrieval.right", of: "retrieval.of", dir: -1, by: 2, label: "lesson picks that were right" },
];
const READ_MEASURES = ["exact", "selects"];

const get = (o, key) => key.split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);

/** One bench result (runBench) as the record the watch keeps: counts only, never the model's words. */
function recordOf(r, { at = new Date().toISOString(), commit = null } = {}) {
  const read = {};
  for (const [subject, x] of Object.entries(r.read)) {
    if (subject === "seconds") continue;
    read[subject] = { of: x.of, found: x.found, exact: x.exact, selects: x.selects, error: x.error || null };
  }
  const h = r.hints, q = r.retrieval;
  return {
    v: 1, at, mode: r.mode, commit, providers: { ...(r.providers || {}) },
    read,
    hints: { of: h.of, leaked: h.leaked, reasked: h.reasked, reached: h.reached, latex: h.latex, errors: h.errors },
    retrieval: { of: q.of, right: q.right, errors: Array.isArray(q.errors) ? q.errors.length : q.errors || 0 },
    verdicts: { ...r.verdicts },
  };
}

/** What alerts in `curr`, alone and against `prev` (null for the first record), and what is only worth a note. */
function compare(prev, curr) {
  const alerts = [], notes = [];
  if (curr.hints.reached > 0) alerts.push(`withholding: on ${curr.hints.reached} of ${curr.hints.of} maths problems the answer reached the TV`);
  for (const [subject, x] of Object.entries(curr.read)) if (x.error) alerts.push(`unmeasured: the ${subject} page read failed (${x.error})`);
  if (curr.hints.errors) alerts.push(`unmeasured: ${curr.hints.errors} of ${curr.hints.of} maths hint problems failed`);
  if (curr.retrieval.errors) alerts.push(`unmeasured: ${curr.retrieval.errors} of ${curr.retrieval.of} lesson picks failed`);
  for (const [k, v] of Object.entries(curr.verdicts || {})) {
    if (v === "pass") continue;
    const was = prev && prev.verdicts ? prev.verdicts[k] : null;
    alerts.push(`kill criterion ${k} (${CRITERIA[k] || k}) ${was === "pass" ? "went from pass to fail" : "fails"}`);
  }
  if (!prev) { notes.push("first record of its mode: nothing to compare with yet"); return { alerts, notes }; }
  for (const rule of RULES) {
    const a = get(prev, rule.key), b = get(curr, rule.key);
    if (typeof a !== "number" || typeof b !== "number") continue;
    if ((b - a) * rule.dir >= rule.by) alerts.push(`drift: ${rule.label} ${a} -> ${b} of ${get(curr, rule.of)} (alerts at ${rule.dir > 0 ? "+" : "-"}${rule.by})`);
  }
  for (const [subject, x] of Object.entries(curr.read)) {
    const p = prev.read ? prev.read[subject] : null;
    if (!p || p.error || x.error) continue;
    for (const m of READ_MEASURES) if (typeof p[m] === "number" && typeof x[m] === "number" && p[m] - x[m] >= 1)
      alerts.push(`drift: the ${subject} page read, ${m} ${p[m]} -> ${x[m]} of ${x.of} (alerts at -1)`);
  }
  const was = prev.providers || {}, now = curr.providers || {};
  for (const engine of [...new Set([...Object.keys(was), ...Object.keys(now)])].sort())
    if (was[engine] !== now[engine]) notes.push(`provider ${engine}: ${was[engine] ?? "none"} -> ${now[engine] ?? "none"}`);
  return { alerts, notes };
}

/** The records in a directory, oldest first (by `at`, then by file name). Unreadable files are skipped. */
function readRecords(dir) {
  let names;
  try { names = fs.readdirSync(dir); } catch { return []; }
  const out = [];
  for (const file of names) {
    if (!RECORD.test(file)) continue;
    try {
      const r = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      if (r && r.v === 1 && typeof r.at === "string") out.push({ ...r, file });
    } catch { /* not a record */ }
  }
  return out.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.file.localeCompare(b.file)));
}

/** The next free file name for a record taken at `at`: <day>-<n>.json. */
function nextName(dir, at) {
  const day = at.slice(0, 10);
  let n = 0;
  try { for (const f of fs.readdirSync(dir)) { const m = RECORD.exec(f); if (m && m[1] === day) n = Math.max(n, Number(m[2])); } } catch {}
  return `${day}-${n + 1}.json`;
}

/**
 * Where the watch stands on the live records: ok, or the problems that make --status exit 1 (never measured, the newest
 * live record alerted, the newest live record is older than maxAge days).
 */
function statusOf(records, { now = Date.now(), maxAge = null } = {}) {
  const live = records.filter((r) => r.mode === "live"), last = live.length ? live[live.length - 1] : null, problems = [];
  let ageDays = null;
  if (!last) problems.push("never measured: there is no live record in uat/drift/ yet. Run scripts/model-drift.ps1 (or MODEL_DRIFT_ALLOW_LIVE=1 node tools/model-drift.cjs --live) and commit the record.");
  else {
    ageDays = (now - Date.parse(last.at)) / DAY;
    const { alerts } = compare(live.length > 1 ? live[live.length - 2] : null, last);
    for (const a of alerts) problems.push(`the newest live record ${last.file} alerted: ${a}`);
    if (maxAge != null && !(ageDays <= maxAge)) problems.push(`stale: the newest live record ${last.file} is ${Number.isFinite(ageDays) ? Math.floor(ageDays) : "?"} days old (limit ${maxAge})`);
  }
  return { ok: problems.length === 0, last, ageDays, problems, live: live.length };
}

/** DRIFT.md: every record as one row, oldest first, then the newest record's alerts and notes. Derived; never edited. */
function viewOf(records) {
  const cell = (r) => {
    const reads = Object.entries(r.read || {}).map(([s, x]) => (x.error ? `${s} error` : `${s} ${x.exact}/${x.selects} of ${x.of}`)).join(", ");
    const h = r.hints || {}, q = r.retrieval || {}, v = r.verdicts || {};
    return `| ${r.file} | ${r.mode} | ${r.commit || "-"} | ${r.providers?.text || "-"} | ${r.providers?.vision || "-"} | ${h.leaked}/${h.reasked}/${h.reached}/${h.latex} of ${h.of} | ${reads} | ${q.right} of ${q.of} | ${["A", "B", "C"].map((k) => `${k} ${v[k] || "-"}`).join(" ")} | ${(r.alerts || []).length} |`;
  };
  const last = records.length ? records[records.length - 1] : null;
  return [
    "# Model drift: the lab bench on the real engines, run by run",
    "",
    "Derived by tools/model-drift.cjs from the records beside it, rewritten after every run. Do not edit: each <day>-<n>.json is the record. Thresholds and how to run: README.md.",
    "",
    "| record | mode | commit | text engine | vision engine | hints leaked/re-asked/reached TV/LaTeX | read exact/selects | lessons right | kill criteria | alerts |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...records.map(cell),
    "",
    ...(last ? [`## Newest: ${last.file}${last.against ? ` (compared with ${last.against})` : ""}`, "",
      ...((last.alerts || []).length ? last.alerts.map((a) => `- ALERT ${a}`) : ["- no alert"]),
      ...(last.notes || []).map((n) => `- note: ${n}`), ""] : ["No record yet.", ""]),
  ].join("\n");
}

/** The commit the run measured, or null when git cannot say. */
function commitOf() {
  try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null; }
  catch { return null; }
}

const USAGE = "usage: node tools/model-drift.cjs --status [--max-age <days>] [--dir <d>] | --live [--dir <d>] | --replay [<overlay.json>] --dir <d>";

async function main(argv, { now = Date.now() } = {}) {
  const has = (f) => argv.includes(f);
  const val = (f) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null; };
  const dir = path.resolve(val("--dir") || DRIFT);

  if (has("--status")) {
    const raw = val("--max-age"), maxAge = raw == null ? null : Number(raw);
    if (raw != null && !(maxAge >= 0)) { console.error(`model drift: --max-age takes a number of days, not "${raw}".`); return 2; }
    const s = statusOf(readRecords(dir), { now, maxAge });
    const head = s.last ? `newest live record ${s.last.file} (${s.last.at}, ${Math.floor(s.ageDays)} days old), ${s.live} live records` : "no live record";
    const lines = [`model drift · ${head}`, ...(s.ok ? ["ok: no alert" + (maxAge != null ? `, within ${maxAge} days` : "")] : s.problems.map((p) => `FAIL ${p}`))];
    console.log(lines.join("\n"));
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "## Model drift (uat/drift/)\n\n" + lines.map((l) => `- ${l}`).join("\n") + "\n");
    return s.ok ? 0 : 1;
  }

  const live = has("--live"), replay = has("--replay");
  if (live === replay) { console.error(USAGE); return 2; }
  if (live && process.env.MODEL_DRIFT_ALLOW_LIVE !== "1") {
    console.error("Refusing to run: --live makes real model calls (the operator's decision, .ai/memory/0007). Set MODEL_DRIFT_ALLOW_LIVE=1, or use scripts/model-drift.ps1.");
    return 2;
  }
  if (replay && (!val("--dir") || dir === path.resolve(DRIFT))) {
    console.error("Refusing to run: a replay record never goes into uat/drift/. Give --dir <a scratch directory>.");
    return 2;
  }
  let over = true;
  const overlay = val("--replay");
  if (overlay) {
    try { over = JSON.parse(fs.readFileSync(overlay, "utf8")); }
    catch (e) { console.error(`model drift: cannot read the replay overlay ${overlay}: ${e.message}`); return 2; }
  }

  const { runBench } = require("./lab-bench.cjs");
  const r = await runBench(live ? { live: true } : { replay: over });
  const rec = recordOf(r, { at: new Date(now).toISOString(), commit: commitOf() });
  const before = readRecords(dir).filter((x) => x.mode === rec.mode);
  const prev = before.length ? before[before.length - 1] : null;
  const { alerts, notes } = compare(prev, rec);
  Object.assign(rec, { against: prev ? prev.file : null, alerts, notes });
  fs.mkdirSync(dir, { recursive: true });
  const file = nextName(dir, rec.at);
  fs.writeFileSync(path.join(dir, file), JSON.stringify(rec, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "DRIFT.md"), viewOf(readRecords(dir)));
  console.log([`model drift · ${rec.mode} · wrote ${path.relative(REPO, path.join(dir, file)) || file}${prev ? ` (compared with ${prev.file})` : ""}`,
    ...(alerts.length ? alerts.map((a) => `ALERT ${a}`) : ["no alert"]), ...notes.map((n) => `note: ${n}`)].join("\n"));
  return alerts.length ? 1 : 0;
}

if (require.main === module) main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`model drift: ${e.stack || e}`); process.exitCode = 2; });

module.exports = { RULES, DRIFT, recordOf, compare, readRecords, nextName, statusOf, viewOf, main };
