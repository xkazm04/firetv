/**
 * The lab's corpus, for the bench (tools/lab-bench.cjs). Read, never run, never written:
 *   prototype/data.json          the phone's sample pages with every item's printed text and photo-space centre,
 *                                and the 24 recorded maths hint stages (PoC B, 2026-09-07)
 *   vision/poc_ocr.py MATH       the printed maths items, cross-checked against data.json
 *   vision/poc_hints.py          PROBLEMS["math"]: the 12 hint problems, their answers and leak terms
 *   vision/poc_retrieval.py      QUERIES (the 9 retrieval problems) and ACCEPT (the lessons that teach each, [] = none)
 * The Python tables are parsed out of the source as text - their lines are JSON-literal - so no Python runs here.
 * RUN3 is a separate recorded answer set: PoC C's run-3 syllabus picks as STUDY-DESK-POC-RESULTS.md reports them.
 */
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");

const REPO = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(REPO, rel), "utf8");
const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex");

/** The text between `NAME = <open>` and the first line that is only its closer, from a Python source. */
function block(src, file, start, close) {
  const at = src.indexOf(start);
  if (at < 0) throw new Error(`lab corpus: ${start.trim()} is not in ${file}`);
  const from = at + start.length, end = src.indexOf(`\n${close}`, from);
  if (end < 0) throw new Error(`lab corpus: ${start.trim()} in ${file} has no closing ${close.trim()}`);
  return src.slice(from, end);
}
/** A Python list/dict literal written as JSON, give or take tuples and trailing commas. */
function literal(text, file, what) {
  const json = text.replace(/^(\s*)\((.*)\),\s*$/gm, "$1[$2],").replace(/,(\s*[\]}])/g, "$1").trim().replace(/,$/, "");
  try { return JSON.parse(json); } catch (e) { throw new Error(`lab corpus: ${what} in ${file} is no longer JSON-literal (${e.message})`); }
}

// ---- the pages the phone offers ----
const data = JSON.parse(read("prototype/data.json"));
const SAMPLE = { maths: { id: "math", file: "desk/public/samples/maths.jpg" }, essay: { id: "essay", file: "desk/public/samples/essay.jpg" } };
const pages = {};
for (const [subject, { id, file }] of Object.entries(SAMPLE)) {
  const p = data.pages.find((x) => x.id === id);
  if (!p) throw new Error(`lab corpus: prototype/data.json has no page ${id}`);
  const base64 = p.img.replace(/^data:image\/\w+;base64,/, "");
  let sample = null;
  try { sample = md5(fs.readFileSync(path.join(REPO, file))); } catch {}
  pages[subject] = { subject, title: p.title, w: p.w, h: p.h, base64, md5: md5(Buffer.from(base64, "base64")), sample: file,
    sampleMatches: sample === md5(Buffer.from(base64, "base64")), items: p.items.map(({ n, text, cx, cy }) => ({ n, text, cx, cy })) };
}
const MATH = literal(`[${block(read("vision/poc_ocr.py"), "vision/poc_ocr.py", "MATH = [", "]")}
]`, "vision/poc_ocr.py", "MATH");
if (JSON.stringify(MATH) !== JSON.stringify(pages.maths.items.map((i) => i.text)))
  throw new Error("lab corpus: prototype/data.json's maths page no longer holds vision/poc_ocr.py's MATH items");

// ---- hints: the 12 problems, and what the model said for each (24 stages) ----
const hintsPy = read("vision/poc_hints.py");
const PROBLEMS = literal(`[${block(hintsPy, "vision/poc_hints.py", '    "math": [', "    ],")}
]`, "vision/poc_hints.py", 'PROBLEMS["math"]');
const key = (s) => s.toLowerCase().replace(/²/g, "^2").replace(/³/g, "^3").replace(/[−–]/g, "-").replace(/\s+/g, "").replace(/[.:]+$/, "");
const problems = PROBLEMS.map((p) => {
  const h = data.hints[key(p.q)];
  if (!h || h.subject !== "math") throw new Error(`lab corpus: no recorded hints in prototype/data.json for ${p.q}`);
  return { q: p.q, answer: p.answer, leakTerms: p.leak_terms, hint1: h.hint1, hint2: h.hint2 };
});

// ---- retrieval: the lab's 9 queries and their acceptable lessons ----
const retrievalPy = read("vision/poc_retrieval.py");
const QUERIES = literal(`[${block(retrievalPy, "vision/poc_retrieval.py", "QUERIES = [", "]")}
]`, "vision/poc_retrieval.py", "QUERIES");
const ACCEPT = literal(`{${block(retrievalPy, "vision/poc_retrieval.py", "ACCEPT = {", "}")}
}`, "vision/poc_retrieval.py", "ACCEPT");
const queries = QUERIES.map(([q, expect]) => {
  if (!Array.isArray(ACCEPT[q])) throw new Error(`lab corpus: vision/poc_retrieval.py ACCEPT has no entry for ${q}`);
  return { q, expect, accept: ACCEPT[q] };
});

/**
 * PoC C run 3, "syllabus pick" (STUDY-DESK-POC-RESULTS.md, section C): every covered problem to the right and most
 * specific lesson (one-step equations for x/4 + 3 = 8), 'none' for the percentage, "Linear equations 1" for the
 * triangle. 8/9. The run's printout was not kept; this is the answer set that table records, one per query.
 */
const RUN3 = {
  "Solve for x: 3x - 7 = 11": "bAerID24QJ0",
  "Solve for x: 2x^2 - 5x - 3 = 0": "2ZzuZvz33X0",
  "Factor completely: x^2 + 7x + 12": "D3a8NnpQ2vU",
  "Solve the system: 2x + y = 7 and x - y = 2": "uzyd_mIJaoc",
  "Solve: x/4 + 3 = 8": "jWpiMu5LNdg",
  "Solve for x: 5(x - 2) = 3x + 8": "bAerID24QJ0",
  "Does 2x + 3 = 2x + 5 have a solution?": "qsL_5Y8uWPU",
  "What is 15% of 240?": "none",
  "The angles of a triangle are x, 2x and 3x. Find x.": "bAerID24QJ0",
};

/** The lab's figures, each with where it is written down. */
const BASELINE = {
  read: {
    found: { n: 10, of: 10, source: "STUDY-DESK-POC-RESULTS.md:30 maths items found, every level" },
    exact: { n: 10, of: 10, source: "STUDY-DESK-POC-RESULTS.md:31 maths equations character-exact, every level" },
    ring: { n: 16, of: 16, source: "STUDY-DESK-POC-RESULTS.md:34,48 circle selects the right item (maths + Spanish, mild + harsh)" },
  },
  hints: { leaked: { n: 0, of: 12, source: "STUDY-DESK-POC-RESULTS.md:66 final answer leaked" }, latex: { n: 3, of: 12, source: "STUDY-DESK-POC-RESULTS.md:82 LaTeX in the output; counted on the recorded stages in prototype/data.json (7 fields, 3 problems)" } },
  retrieval: { n: 8, of: 9, source: "STUDY-DESK-POC-RESULTS.md:154 syllabus pick" },
};

module.exports = { pages, problems, queries, run3: RUN3, baseline: BASELINE, key };
