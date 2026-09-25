#!/usr/bin/env node
/**
 * The lab bench: the lab's corpus (tools/lab-corpus.cjs) run through the PRODUCTION read, hint and lesson-pick
 * modules - desk's readPage, hint and pickLesson through the engines registry, never a copy - and scored with the
 * lab's rules: equations_intact (vision/poc_ocr.py), the one leak rule (rules/maths leaks(), which hint() already
 * gates on), the right/none tally against vision/poc_retrieval.py ACCEPT. One measure is new: `selects`, whether
 * the phone's tap at an item's TRUE centre selects that item, given the centres the model reported - judged with
 * the phone's own rule, nearestItem() in desk/src/lib/desk/select.ts. It prints the lab baseline beside this run
 * and a verdict per PoC kill criterion (STUDY-DESK-POC-RESULTS.md:7-9), and exits 1 on a fail.
 *
 *   npm run bench                         replay (the default): recorded answers at the provider seam, no model
 *   npm run bench -- --replay <file.json> replay with an answer set laid over the recorded one
 *   npm run bench -- --json               one JSON object: read, hints, retrieval, baseline, verdicts, providers
 *   npm run bench -- --live               OPERATOR ONLY: the registered engines (Ollama vision, claude-cli or
 *                                         codex with DESK_TEXT_ENGINE=codex) - real model calls, minutes of GPU
 *
 * The replay's read answers are the page's truth (a perfect reader): replay checks the harness, not a model; its
 * hints are the 24 recorded PoC B stages and its picks PoC C's run 3. Every run pins DESK_DATA_DIR to a fresh
 * directory under the OS temp dir (lessons.ts would write embeddings.json into desk/data otherwise); with no
 * lesson transcripts there, pickLesson scores the lesson id and never embeds. No Python runs here.
 */
const fs = require("node:fs"), os = require("node:os"), path = require("node:path"), crypto = require("node:crypto"), Module = require("node:module");
const corpus = require("./lab-corpus.cjs");

const DESK = path.resolve(__dirname, "../desk");
/** "A few" problems per page (kill criterion A), read as at most two. */
const FEW = 2;

// ---- the data directory and the desk's own modules ----
let dataDir = null;
function pinData() {
  if (dataDir) return dataDir;
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "desk-lab-bench-"));
  process.env.DESK_DATA_DIR = dataDir;
  const dir = dataDir;
  process.on("exit", () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} });
  return dataDir;
}
let mods = null;
/** desk's TypeScript, transpiled with desk's own compiler (the loader of the rules suites). */
function desk() {
  if (mods) return mods;
  pinData();
  let ts;
  try { ts = require(path.join(DESK, "node_modules/typescript")); }
  catch { throw new Error("The bench transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first."); }
  const resolve = Module._resolveFilename;
  Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith("@/") ? path.join(DESK, "src", id.slice(2)) : id, ...args); };
  if (!require.extensions[".ts"]) require.extensions[".ts"] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
  const load = (f) => require(path.join(DESK, "src/lib", f));
  mods = { reg: load("engines/registry.ts"), read: load("desk/read.ts"), hint: load("desk/hint.ts"), pick: load("desk/pick.ts"),
    select: load("desk/select.ts"), maths: load("rules/maths.ts") };
  return mods;
}

// ---- the lab's scorers, ported ----
const SUP = { "²": "^2", "³": "^3", "−": "-", "–": "-", "×": "*", "÷": "/" };
/** poc_ocr.py norm(). */
const norm = (s) => s.replace(/[²³−–×÷]/g, (c) => SUP[c]).toLowerCase().replace(/\s+/g, " ").replace(/^[ .]+|[ .]+$/g, "");
/** poc_ocr.py equations_intact(): every digit, variable, operator and exponent, in order. */
const equationsIntact = (truth, got) => { const keep = (s) => norm(s).replace(/[^0-9a-z+\-*/=^()]/g, ""); return keep(truth) === keep(got); };
/** Character similarity, 1 - edit distance / longer length, on normalised text. Not difflib's ratio (its autojunk
 *  heuristic distorts paragraphs of 200+ characters); used with the lab's 0.9 threshold for the essay page. */
function sim(a, b) {
  a = norm(a); b = norm(b);
  if (!a.length && !b.length) return 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length);
}
/** LaTeX in a line that will be spoken (STUDY-DESK-POC-RESULTS.md:82): $...$ or a backslash command. */
const latex = (s) => /\$[^$]+\$|\\[a-zA-Z]+/.test(s || "");

// ---- the replay: recorded answers at the provider seam ----
/** The recorded answer set, with `over` (a fixture) laid on top: read per page, hints per problem, picks per query. */
function answers(over) {
  const a = { read: {}, hints: {}, picks: { ...corpus.run3 } };
  for (const [subject, p] of Object.entries(corpus.pages)) a.read[subject] = p.items.map((t) => ({ number: t.n, text: t.text, x: t.cx / p.w, y: t.cy / p.h }));
  for (const p of corpus.problems) a.hints[p.q] = { hint1: p.hint1, hint2: p.hint2 };
  if (over && typeof over === "object") {
    Object.assign(a.read, over.read || {});
    for (const [q, h] of Object.entries(over.hints || {})) a.hints[q] = { ...a.hints[q], ...h };
    Object.assign(a.picks, over.picks || {});
  }
  return a;
}
const md5 = (b64) => crypto.createHash("md5").update(Buffer.from(b64, "base64")).digest("hex");
const problemOf = (prompt) => (/^Problem:[ \t]*\n?([^\n]*)/m.exec(prompt || "") || [])[1]?.trim();
function replayProviders(a) {
  const pages = Object.fromEntries(Object.values(corpus.pages).map((p) => [p.md5, p.subject]));
  const vision = { name: "replay", async run(req) {
    const subject = pages[md5(req.imageBase64)];
    if (!subject || !a.read[subject]) throw new Error("the replay has no recorded read for this image");
    return { raw: JSON.stringify({ items: a.read[subject] }) };
  } };
  const text = { name: "replay", async run(req) {
    const q = problemOf(req.prompt), props = (req.schema && req.schema.properties) || {};
    if ("lesson" in props) {
      if (!(q in a.picks)) throw new Error(`the replay has no recorded pick for ${q}`);
      return { raw: JSON.stringify({ lesson: a.picks[q], why: "recorded answer (replay)" }) };
    }
    if ("hint" in props) {
      const h = a.hints[q]; if (!h) throw new Error(`the replay has no recorded hint for ${q}`);
      const stage = /already had this hint/.test(req.prompt) ? 2 : 1, reask = /gave the answer away/.test(req.prompt);
      const said = (reask && h[`reask${stage}`]) || h[`hint${stage}`];
      if (!said) throw new Error(`the replay has no recorded stage ${stage} hint for ${q}`);
      return { raw: JSON.stringify(said) };
    }
    throw new Error("the replay has no answer for this request");
  } };
  const embed = { name: "replay", async run() { throw new Error("the replay does not embed"); } };
  return { vision, text, embed };
}
/** What the model said on each text call, whichever provider answered - the leak tally scores the model, not the gate. */
function recording(inner, calls) {
  return { name: inner.name, async run(req) {
    const out = await inner.run(req);
    let said = out.raw;
    if (typeof said === "string") { try { said = JSON.parse(said.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); } catch { said = { hint: said, what_to_try_next: "" }; } }
    calls.push({ q: problemOf(req.prompt), reask: /gave the answer away/.test(req.prompt), said: said || {} });
    return out;
  } };
}

// ---- the three pipelines ----
async function benchRead(m, providers) {
  const out = {}, t0 = Date.now();
  for (const [subject, page] of Object.entries(corpus.pages)) {
    const row = { found: 0, of: page.items.length, exact: 0, selects: 0, cyErr: null, issues: [], rule: "nearestItem (desk/src/lib/desk/select.ts)", sample: page.sample, sampleMatches: page.sampleMatches };
    try {
      const r = await m.read.readPage(page.base64, subject, page.w, page.h);
      providers.vision = r.provider;
      let err = 0;
      for (const t of page.items) {
        const got = r.items.find((i) => i.n === t.n);
        if (!got) { row.issues.push({ n: t.n, what: "missing" }); continue; }
        row.found++; err += Math.abs(got.cy - t.cy);
        const ok = subject === "maths" ? equationsIntact(t.text, got.text) : sim(t.text, got.text) >= 0.9;
        if (ok) row.exact++; else row.issues.push({ n: t.n, what: "text", got: got.text });
        // the phone's tap at the item's true centre, against the centres the model reported
        const ix = m.select.nearestItem(r.items, t.cy);
        if (r.items[ix] && r.items[ix].n === t.n) row.selects++; else row.issues.push({ n: t.n, what: "select", picked: r.items[ix] ? r.items[ix].n : null });
      }
      row.cyErr = row.found ? Math.round(err / row.found) : null;
    } catch (e) { row.error = String(e.message || e); }
    out[subject] = row;
  }
  out.seconds = (Date.now() - t0) / 1000;
  return out;
}

async function benchHints(m, providers, calls) {
  const t0 = Date.now(), rows = [];
  for (const p of corpus.problems) {
    calls.length = 0;
    const row = { q: p.q };
    try {
      const h1 = await m.hint.hint("maths", p.q, {});
      const h2 = await m.hint.hint("maths", p.q, { previous: h1.hint });
      providers.text = h2.provider;
      const shown = [h1.hint, h1.next, h2.hint, h2.next];
      row.leaked = calls.some((c) => m.maths.leaks(p.q, String(c.said.hint || "")) || m.maths.leaks(p.q, String(c.said.what_to_try_next || "")));
      row.reached = shown.some((s) => m.maths.leaks(p.q, s));
      row.reasked = calls.some((c) => c.reask);
      row.latex = shown.some(latex);
    } catch (e) { row.error = String(e.message || e); }
    rows.push(row);
  }
  const n = (k) => rows.filter((r) => r[k]).length;
  return { leaked: n("leaked"), of: rows.length, latex: n("latex"), reasked: n("reasked"), reached: n("reached"), errors: n("error"),
    rule: "rules/maths leaks()", problems: rows.filter((r) => r.leaked || r.reached || r.reasked || r.latex || r.error), seconds: (Date.now() - t0) / 1000 };
}

async function benchRetrieval(m, providers) {
  const t0 = Date.now(), wrong = [], errors = [];
  let right = 0;
  for (const q of corpus.queries) {
    try {
      const l = await m.pick.pickLesson("maths", q.q);
      providers.text = providers.text || m.reg.activeProvider("text");
      const picked = l ? l.id : "none";
      if (q.accept.length ? q.accept.includes(picked) : picked === "none") right++;
      else wrong.push({ q: q.q, picked, accept: q.accept });
    } catch (e) { errors.push({ q: q.q, error: String(e.message || e) }); }
  }
  return { right, of: corpus.queries.length, wrong, errors, seconds: (Date.now() - t0) / 1000 };
}

/** Kill criteria as set before the PoCs ran (STUDY-DESK-POC-RESULTS.md:7-9). An error is never a pass. */
function verdicts(read, hints, retrieval) {
  const pages = Object.entries(read).filter(([k]) => k !== "seconds").map(([, r]) => r);
  const A = pages.every((r) => !r.error && r.of - r.exact <= FEW && r.of - r.selects <= FEW) ? "pass" : "fail";
  const B = !hints.errors && hints.leaked / hints.of <= 0.1 ? "pass" : "fail";
  const C = !retrieval.errors.length && retrieval.right >= retrieval.of - retrieval.right ? "pass" : "fail";
  return { A, B, C };
}

/**
 * One bench run. `replay`: true for the recorded answers, or an answer set laid over them ({read, hints, picks});
 * `live: true` runs the registered engines instead (operator only - real model calls).
 */
async function runBench({ replay = true, live = false } = {}) {
  const m = desk();
  const calls = [], providers = {};
  if (live) {
    m.reg.useProvider("text", recording(m.reg.provider("text"), calls));
  } else {
    const p = replayProviders(answers(replay));
    m.reg.useProvider("vision", p.vision);
    m.reg.useProvider("embed", p.embed);
    m.reg.useProvider("text", recording(p.text, calls));
  }
  try {
    const read = await benchRead(m, providers);
    const hints = await benchHints(m, providers, calls);
    const retrieval = await benchRetrieval(m, providers);
    return { mode: live ? "live" : "replay", dataDir, read, hints, retrieval, baseline: corpus.baseline, verdicts: verdicts(read, hints, retrieval), providers };
  } finally { m.reg.resetProviders(); }
}

// ---- the command ----
const frac = (n, of) => (n == null ? "-" : `${n}/${of}`);
function table(r) {
  const b = r.baseline, rows = [["pipeline", "lab baseline", "this run", "provider", "seconds"]];
  for (const [subject, x] of Object.entries(r.read)) {
    if (subject === "seconds") continue;
    const lab = subject === "maths";
    rows.push([`read ${subject} · found`, lab ? frac(b.read.found.n, b.read.found.of) : "-", x.error ? "error" : frac(x.found, x.of), r.providers.vision || "-", r.read.seconds.toFixed(1)]);
    rows.push([`read ${subject} · exact`, lab ? frac(b.read.exact.n, b.read.exact.of) : "-", x.error ? "error" : frac(x.exact, x.of), "", ""]);
    rows.push([`read ${subject} · tap selects`, lab ? `${frac(b.read.ring.n, b.read.ring.of)} (ring)` : "-", x.error ? "error" : `${frac(x.selects, x.of)}  cy err ${x.cyErr ?? "-"} px`, "", ""]);
  }
  rows.push(["hints · leaked", frac(b.hints.leaked.n, b.hints.leaked.of), frac(r.hints.leaked, r.hints.of), r.providers.text || "-", r.hints.seconds.toFixed(1)]);
  rows.push(["hints · LaTeX spoken", frac(b.hints.latex.n, b.hints.latex.of), frac(r.hints.latex, r.hints.of), "", ""]);
  rows.push(["hints · re-asked / reached TV", "-", `${r.hints.reasked} / ${r.hints.reached}`, "", ""]);
  rows.push(["lessons · right", frac(b.retrieval.n, b.retrieval.of), frac(r.retrieval.right, r.retrieval.of), r.providers.text || "-", r.retrieval.seconds.toFixed(1)]);
  const w = rows[0].map((_, i) => Math.max(...rows.map((x) => String(x[i]).length)));
  const lines = rows.map((x) => x.map((c, i) => String(c).padEnd(w[i])).join("  ").trimEnd());
  lines.splice(1, 0, w.map((n) => "-".repeat(n)).join("  "));
  const notes = [];
  for (const [subject, x] of Object.entries(r.read)) {
    if (subject === "seconds") continue;
    if (x.error) notes.push(`read ${subject}: ${x.error}`);
    for (const i of x.issues || []) notes.push(`read ${subject} #${i.n}: ${i.what === "missing" ? "not read" : i.what === "text" ? `read as «${i.got}»` : `a tap on it selects #${i.picked}`}`);
  }
  for (const p of r.hints.problems) if (p.leaked || p.reached || p.error) notes.push(`hint «${p.q}»: ${p.error || [p.leaked && "the model gave the answer", p.reasked && "re-asked", p.reached && "it REACHED the TV"].filter(Boolean).join(", ")}`);
  for (const x of r.retrieval.wrong) notes.push(`lesson «${x.q}»: picked ${x.picked}, acceptable ${x.accept.length ? x.accept.join(" or ") : "none"}`);
  for (const x of r.retrieval.errors) notes.push(`lesson «${x.q}»: ${x.error}`);
  const v = r.verdicts;
  return [
    `lab bench · ${r.mode === "live" ? "live (registered engines)" : "replay (recorded answers, no model; the read replays the page's truth)"}`,
    "", ...lines, "", ...notes.map((n) => `  ${n}`), ...(notes.length ? [""] : []),
    `kill criteria: A read ${v.A} · B hints ${v.B} · C lessons ${v.C}`,
  ].join("\n");
}

async function main(argv) {
  const json = argv.includes("--json"), live = argv.includes("--live");
  const at = argv.indexOf("--replay");
  let replay = true;
  if (at >= 0 && argv[at + 1] && !argv[at + 1].startsWith("--")) {
    try { replay = JSON.parse(fs.readFileSync(argv[at + 1], "utf8")); }
    catch (e) { console.error(`lab bench: cannot read the replay file ${argv[at + 1]}: ${e.message}`); return 2; }
  }
  if (live && at >= 0) { console.error("lab bench: --live and --replay are two different runs; pick one."); return 2; }
  const r = await runBench({ replay, live });
  if (json) { const { read, hints, retrieval, baseline, verdicts: v, providers } = r; console.log(JSON.stringify({ read, hints, retrieval, baseline, verdicts: v, providers }, null, 1)); }
  else console.log(table(r));
  return Object.values(r.verdicts).includes("fail") ? 1 : 0;
}

if (require.main === module) main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`lab bench: ${e.stack || e}`); process.exitCode = 2; });

module.exports = { runBench, desk, main };
