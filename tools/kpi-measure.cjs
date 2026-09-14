/**
 * Prints the project's KPI readings. Run with `npm run measure` in desk/ (directly: node tools/kpi-measure.cjs).
 * Read-only: it runs the test suite in its own scratch data dir and never writes to desk/data.
 * `--json` prints the same readings as one JSON object, for a back-measurement that has to be compared.
 */
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const desk = path.join(root, "desk");
const asJson = process.argv.includes("--json");

/** Every .cjs/.mjs under tools/ is a candidate test file; node_modules is not ours. */
function testSources() {
  return fs.readdirSync(__dirname)
    .filter(f => /\.(cjs|mjs)$/.test(f) && f !== path.basename(__filename))
    .map(f => ({ file: `tools/${f}`, text: fs.readFileSync(path.join(__dirname, f), "utf8") }));
}
/** A module counts as covered when some file under tools/ names its path. Requires and @/ imports both hit. */
function coveredBy(sources, modulePath) {
  const stem = modulePath.replace(/^src\//, "").replace(/\.ts$/, "");
  return sources.filter(s => s.text.includes(stem)).map(s => s.file);
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

function writingPersisted() {
  const learners = fs.readFileSync(path.join(desk, "src/lib/session/learners.ts"), "utf8");
  const shape = learners.match(/export interface Learner \{[^}]*\}/);
  return Boolean(shape && /\n\s*writing\??:/.test(shape[0]));
}

// The artefact: what the learners on this machine actually have. Code that exists proves nothing.
function learnerEvidence() {
  const file = path.join(process.env.DESK_DATA_DIR || path.join(desk, "data"), "learners.json");
  if (!fs.existsSync(file)) return { file, exists: false, learners: 0, history: 0, withEnglish: 0, withWriting: 0 };
  let book = {};
  try { book = JSON.parse(fs.readFileSync(file, "utf8")) || {}; } catch { return { file, exists: true, unreadable: true }; }
  const all = Object.values(book).filter(l => l && typeof l === "object");
  return {
    file, exists: true,
    learners: all.length,
    history: all.reduce((n, l) => n + (Array.isArray(l.history) ? l.history.length : 0), 0),
    withEnglish: all.filter(l => l.english && Object.keys(l.english).length).length,
    withWriting: all.filter(l => l.writing && Object.keys(l.writing).length).length,
  };
}

const sources = testSources();
const linga = lingaChecks();
const maths = MATHS_CORE.map(m => ({ module: m, by: coveredBy(sources, m) }));
const essay = ESSAY_CORE.map(m => ({ module: m, by: coveredBy(sources, m) }));
const persisted = writingPersisted();
const essayTested = essay.some(e => e.by.length);
const learners = learnerEvidence();
const writingStages = WRITING_STAGES_VERIFIED_BY_HAND + (persisted ? 1 : 0) + (essayTested ? 1 : 0);
const rel = p => path.relative(root, p).replace(/\\/g, "/");

if (asJson) {
  console.log(JSON.stringify({
    lingaChecksPassing: linga.pass, lingaChecksFailing: linga.fail, lingaNote: linga.note,
    mathsCoreUnderTest: maths.filter(m => m.by.length).length, mathsCoreTotal: maths.length,
    mathsCore: Object.fromEntries(maths.map(m => [m.module, m.by])),
    writingStagesImplemented: writingStages, writingStagesTotal: 7,
    writingEpisodePersisted: persisted, essayRulesUnderTest: essayTested,
    learners,
  }, null, 2));
  process.exit(0);
}

console.log("Study Desk — KPI readings");
console.log(`  source: ${root}, ${spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim() || "unknown"}\n`);

console.log("Linga — conversation-loop checks passing");
console.log(linga.pass === null ? `  n/a — ${linga.note}` : `  ${linga.pass} passing, ${linga.fail} failing   (tools/linga-rules-test.cjs)\n`);

console.log(`Math Buddy — deterministic core modules under automated test: ${maths.filter(m => m.by.length).length} of ${maths.length}`);
for (const m of maths) console.log(`  ${m.by.length ? "yes" : " no"}  ${m.module}${m.by.length ? `   (${m.by.join(", ")})` : ""}`);
console.log();

console.log(`Writing — essay end-to-end stages implemented: ${writingStages} of 7`);
console.log(`  ${WRITING_STAGES_VERIFIED_BY_HAND} stages taken as given (chooser, paste/dictate, split+stats, verdicts, Forensic render)`);
console.log(`  ${persisted ? "yes" : " no"}  stage 6 — a writing namespace on the persisted Learner (src/lib/session/learners.ts)`);
console.log(`  ${essayTested ? "yes" : " no"}  stage 7 — essay rules under automated test (${ESSAY_CORE.join(", ")})`);
console.log();

console.log("The artefact — what learners on this machine have actually completed");
if (!learners.exists) console.log(`   no  ${rel(learners.file)} does not exist — nothing has ever been saved here`);
else if (learners.unreadable) console.log(`   no  ${rel(learners.file)} is not readable JSON`);
else {
  console.log(`  ${learners.learners} learner(s), ${learners.history} history entr(ies)`);
  console.log(`  ${learners.withEnglish} with an English record, ${learners.withWriting} with a writing record`);
  console.log(`  read from ${rel(learners.file)}`);
}
