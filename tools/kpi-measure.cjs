/**
 * Prints every one of the project's KPI readings. Run with `npm run measure` in desk/ (directly: node tools/kpi-measure.cjs).
 * Read-only: the suites it shells out to use their own scratch data dir, tsc runs with --noEmit and no build info,
 * and nothing here writes. `--json` prints the same readings as one JSON object, for a back-measurement that has to be compared.
 * A reading it could not take is null and says why — never a 0, because a 0 recorded as a measurement is a claim.
 */
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const { mainCheckout, same } = require("./checkout.cjs");
const root = path.resolve(__dirname, "..");
const desk = path.join(root, "desk");

/** Every .cjs/.mjs under tools/ is a candidate test file — except this tool and its own suite, which name modules without testing them. */
function testSources() {
  return fs.readdirSync(__dirname)
    .filter(f => /\.(cjs|mjs)$/.test(f) && !f.startsWith("kpi-measure"))
    .map(f => ({ file: `tools/${f}`, text: fs.readFileSync(path.join(__dirname, f), "utf8") }));
}
/**
 * The code of a source with its comments blanked out. Strings, template literals and regex literals are walked over
 * whole, so a `//` inside 'http://…' or a /\/\*…/ pattern is not taken for a comment. Newlines are kept.
 */
function stripComments(text) {
  let out = "", i = 0, last = "";
  const n = text.length;
  // a `/` starts a regex literal where an expression can begin; after a value it is division
  const regexCanStart = () => last === "" || /[(,=:[!&|?{};+\-*%<>~^]$/.test(last) || /\b(return|typeof|case|in|of|delete|void|throw|new|else|do|yield|await)$/.test(last);
  while (i < n) {
    const c = text[i], d = text[i + 1];
    if (c === "/" && d === "/") { while (i < n && text[i] !== "\n") i++; continue; }
    if (c === "/" && d === "*") {
      const end = text.indexOf("*/", i + 2), stop = end < 0 ? n : end + 2;
      out += text.slice(i, stop).replace(/[^\n]/g, " "); i = stop; continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      while (j < n && text[j] !== c) { if (text[j] === "\\") j++; else if (c !== "`" && text[j] === "\n") break; j++; }
      out += text.slice(i, j + 1); i = j + 1; last = c; continue;
    }
    if (c === "/" && regexCanStart()) {
      let j = i + 1, cls = false;
      while (j < n && text[j] !== "\n") {
        if (text[j] === "\\") { j += 2; continue; }
        if (text[j] === "[") cls = true; else if (text[j] === "]") cls = false; else if (text[j] === "/" && !cls) break;
        j++;
      }
      out += text.slice(i, j + 1); i = j + 1; last = "/"; continue;
    }
    out += c; i++;
    if (!/\s/.test(c)) last = /[\w$]/.test(c) ? (/[\w$]$/.test(last) ? last + c : c) : c;
  }
  return out;
}
/**
 * A module counts as covered when some file under tools/ loads it: a require() or a dynamic import() whose argument
 * names its path, or a static `import … from` of it (@/ aliases included). Named in a comment, or read as text, is not a load.
 */
function coveredBy(sources, modulePath) {
  const stem = modulePath.replace(/^src\//, "").replace(/\.ts$/, "");
  const loads = code => {
    const specs = [];
    for (const m of code.matchAll(/\b(?:require|import)\s*\(([^;\n]*)/g)) specs.push(m[1]);
    for (const m of code.matchAll(/\bimport\b[^;]*?\bfrom\s*(['"`])([^'"`\n]*)\1/g)) specs.push(m[2]);
    for (const m of code.matchAll(/\bimport\s*(['"`])([^'"`\n]*)\1/g)) specs.push(m[2]);
    return specs.some(s => s.includes(stem));
  };
  return sources.filter(s => loads(stripComments(s.text))).map(s => s.file);
}

// KPI 1 — Linga conversation-loop checks passing. The suite is the gate; parse its own count, never our own.
function lingaChecks() {
  const r = spawnSync(process.execPath, [path.join(__dirname, "linga-rules-test.cjs")], { encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const num = k => { const m = out.match(new RegExp(`^\\D*${k} (\\d+)$`, "m")); return m ? Number(m[1]) : null; };
  const pass = num("pass"), fail = num("fail");
  if (pass === null) return { pass: null, fail: null, note: r.status === 1 && out.includes("npm install") ? "suite could not run: desk/node_modules is empty — run npm install in desk/" : "suite produced no test count" };
  return { pass, fail, note: null };
}

// KPI 2 — Math Buddy deterministic core modules under automated test, of 4.
const MATHS_CORE = ["src/lib/desk/verify.ts", "src/lib/desk/items.ts", "src/lib/rules/maths.ts", "src/lib/library/syllabus.ts"];
// KPI 3 — Writing: the two stages that are mechanically checkable. Stages 1-5 (chooser, paste/dictate,
// split/stats, model verdicts, Forensic render) were verified by reading the code on 2026-09-14 and are
// taken as given here; 6 is persistence and 7 is coverage, and both are measured, not assumed.
const WRITING_STAGES_VERIFIED_BY_HAND = 5;
const ESSAY_CORE = ["src/lib/rules/essay.ts", "src/lib/desk/essay.ts"];

/**
 * Stage 6 as it landed: a writing episode is a history entry of kind "writing", and the essay reading
 * is what appends it. Both halves must hold — a kind nothing writes, or a write of a kind the record drops, is not persistence.
 */
function writingPersisted(deskDir = desk) {
  const read = f => { try { return fs.readFileSync(path.join(deskDir, f), "utf8"); } catch { return ""; } };
  const entry = read("src/lib/session/learners.ts").match(/export interface HistoryEntry \{[^}]*\}/);
  const kindDeclared = Boolean(entry && /\bkind\s*:[^;\n]*"writing"/.test(entry[0]));
  const essayWrites = /addHistory\(\s*\w+\s*,\s*\{[^}]*\bkind\s*:\s*"writing"/.test(read("src/lib/desk/essay.ts"));
  return { persisted: kindDeclared && essayWrites, kindDeclared, essayWrites };
}

// KPI 4 — TypeScript typecheck errors in desk/, from desk's own compiler. No compiler, no reading.
function typecheckErrors() {
  const tsc = path.join(desk, "node_modules/typescript/bin/tsc");
  if (!fs.existsSync(tsc)) return { errors: null, unresolved: null, note: "desk/node_modules has no typescript — run npm install in desk/ (in a worktree, link the operator's copy)" };
  const r = spawnSync(process.execPath, [tsc, "--noEmit", "--incremental", "false", "-p", path.join(desk, "tsconfig.json")], { cwd: desk, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  if (r.status !== 0 && !/error TS\d+/.test(out)) return { errors: null, unresolved: null, note: `tsc exited ${r.status} without a diagnostic` };
  const lines = out.split(/\r?\n/).filter(l => /error TS\d+/.test(l));
  // module-not-found errors are a missing dependency, not a type fault — counted in, and shown, so a dependency gap is visible
  return { errors: lines.length, unresolved: lines.filter(l => /error TS2307/.test(l)).length, note: null };
}

// The artefact: what the learners on this machine actually have. Code that exists proves nothing.
// mainCheckout and same come from tools/checkout.cjs, shared with the worktree preflight.

/**
 * Where the learner book is. DESK_DATA_DIR, when set, is the answer and nothing else is tried — it is what the app itself reads.
 * Otherwise this checkout's desk/data, then the main checkout's: an autopilot worktree never carries desk/data.
 */
function findLearnerBook({ env = process.env, checkout = root, main = mainCheckout(checkout) } = {}) {
  const candidates = env.DESK_DATA_DIR
    ? [{ dir: env.DESK_DATA_DIR, source: "DESK_DATA_DIR" }]
    : [{ dir: path.join(checkout, "desk/data"), source: "this checkout" },
       ...(main && !same(main, checkout) ? [{ dir: path.join(main, "desk/data"), source: "main checkout" }] : [])];
  const tried = candidates.map(c => path.join(c.dir, "learners.json"));
  const hit = candidates.find((c, i) => fs.existsSync(tried[i]));
  return hit ? { file: path.join(hit.dir, "learners.json"), source: hit.source, tried } : { file: null, source: null, tried };
}

/**
 * Three states, never two: no book found (reading null), a book that is not JSON (reading null), and a book
 * that was read — whose reading is its history entry count, and may honestly be 0.
 */
function learnerEvidence(where = findLearnerBook()) {
  const base = { found: Boolean(where.file), file: where.file, source: where.source, tried: where.tried };
  if (!where.file) return { ...base, readable: false, reading: null, learners: null, history: null, withEnglish: null, withWriting: null };
  let book;
  try { book = JSON.parse(fs.readFileSync(where.file, "utf8")); } catch { book = undefined; }
  if (!book || typeof book !== "object" || Array.isArray(book)) return { ...base, readable: false, reading: null, learners: null, history: null, withEnglish: null, withWriting: null };
  const all = Object.values(book).filter(l => l && typeof l === "object");
  const history = l => Array.isArray(l.history) ? l.history : [];
  const count = all.reduce((n, l) => n + history(l).length, 0);
  return {
    ...base, readable: true, reading: count,
    learners: all.length,
    history: count,
    withEnglish: all.filter(l => l.english && Object.keys(l.english).length).length,
    // a writing record is an episode in the history, not a field of its own
    withWriting: all.filter(l => history(l).some(h => h && h.kind === "writing")).length,
  };
}

function measure() {
  const sources = testSources();
  const linga = lingaChecks();
  const maths = MATHS_CORE.map(m => ({ module: m, by: coveredBy(sources, m) }));
  const essay = ESSAY_CORE.map(m => ({ module: m, by: coveredBy(sources, m) }));
  const writing = writingPersisted();
  const essayTested = essay.some(e => e.by.length);
  const learners = learnerEvidence();
  const typecheck = typecheckErrors();
  const writingStages = WRITING_STAGES_VERIFIED_BY_HAND + (writing.persisted ? 1 : 0) + (essayTested ? 1 : 0);
  return { linga, maths, essay, writing, essayTested, learners, typecheck, writingStages };
}

function print(r, asJson) {
  const { linga, maths, writing, essayTested, learners, typecheck, writingStages } = r;
  const mathsCovered = maths.filter(m => m.by.length).length;
  const rel = p => path.relative(root, p).replace(/\\/g, "/");
  if (asJson) {
    console.log(JSON.stringify({
      readings: {
        lingaChecksPassing: linga.pass, mathsCoreUnderTest: mathsCovered, writingStagesImplemented: writingStages,
        learnerHistoryEntries: learners.reading, typecheckErrors: typecheck.errors,
      },
      lingaChecksPassing: linga.pass, lingaChecksFailing: linga.fail, lingaNote: linga.note,
      mathsCoreUnderTest: mathsCovered, mathsCoreTotal: maths.length,
      mathsCore: Object.fromEntries(maths.map(m => [m.module, m.by])),
      writingStagesImplemented: writingStages, writingStagesTotal: 7,
      writingEpisodePersisted: writing.persisted, writingEpisode: writing, essayRulesUnderTest: essayTested,
      typecheck, learners,
    }, null, 2));
    return;
  }

  console.log("Study Desk — KPI readings");
  console.log(`  source: ${root}, ${spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim() || "unknown"}\n`);

  console.log("Linga — conversation-loop checks passing");
  console.log(linga.pass === null ? `  n/a — ${linga.note}\n` : `  ${linga.pass} passing, ${linga.fail} failing   (tools/linga-rules-test.cjs)\n`);

  console.log(`Math Buddy — deterministic core modules under automated test: ${mathsCovered} of ${maths.length}`);
  for (const m of maths) console.log(`  ${m.by.length ? "yes" : " no"}  ${m.module}${m.by.length ? `   (${m.by.join(", ")})` : ""}`);
  console.log();

  console.log(`Writing — essay end-to-end stages implemented: ${writingStages} of 7`);
  console.log(`  ${WRITING_STAGES_VERIFIED_BY_HAND} stages taken as given (chooser, paste/dictate, split+stats, verdicts, Forensic render)`);
  console.log(`  ${writing.persisted ? "yes" : " no"}  stage 6 — a writing episode on the learner's history: kind "writing" ${writing.kindDeclared ? "declared" : "NOT declared"} in src/lib/session/learners.ts, ${writing.essayWrites ? "appended" : "NOT appended"} by src/lib/desk/essay.ts`);
  console.log(`  ${essayTested ? "yes" : " no"}  stage 7 — essay rules under automated test (${ESSAY_CORE.join(", ")})`);
  console.log();

  console.log("Desk — TypeScript typecheck errors");
  console.log(typecheck.errors === null ? `  n/a — ${typecheck.note}` : `  ${typecheck.errors} error(s)${typecheck.unresolved ? `, ${typecheck.unresolved} of them a module that could not be resolved` : ""}   (tsc --noEmit in desk/)`);
  console.log();

  console.log("The artefact — learner history entries saved on this machine");
  if (!learners.found) {
    console.log("  n/a — no learner book found, so there is no reading (this is not a zero). Tried:");
    for (const t of learners.tried) console.log(`    ${t}`);
  } else if (!learners.readable) console.log(`  n/a — ${learners.file} is not a readable learner book`);
  else {
    console.log(`  ${learners.history} history entr(ies) across ${learners.learners} learner(s)`);
    console.log(`  ${learners.withEnglish} with an English record, ${learners.withWriting} with a writing episode`);
    console.log(`  read from ${learners.source === "this checkout" ? rel(learners.file) : learners.file} (${learners.source})`);
  }
}

module.exports = { findLearnerBook, learnerEvidence, writingPersisted, testSources, coveredBy, stripComments, mainCheckout, same };
if (require.main === module) print(measure(), process.argv.includes("--json"));
