#!/usr/bin/env node
/**
 * The pre-merge half of the model-drift watch (uat/drift/README.md, .ai/memory/0017). The weekly watch
 * (tools/model-drift.cjs --status) sees a live regression only after it merged. This check sees it before: a pull
 * request that changes what the lab bench runs on the real engines (the prompts, the engine seam, the rules the hint
 * writer and the lesson pick lean on) must carry its own live record, and that record is judged against the base
 * branch's newest live record with the watch's own compare(). The committed drift records are the baseline.
 *
 *   node tools/model-drift-pr.cjs --base <ref> [--head <ref>]
 *       No model, no key, no desk modules: git and the committed records only. When the pull request changes a file
 *       on the live surface, it exits 1 if
 *         - it adds no live record to uat/drift/,
 *         - its newest added live record alerts against the base's newest live record (or, with no baseline yet, on a
 *           hard alert alone), or
 *         - a surface file changed after the commit that record measured (the record measured other code).
 *       A pull request that rewrites or deletes a committed record also exits 1: the records are append-only.
 *       Anything else exits 0, and a pull request that leaves the surface alone owes no model call.
 *       .github/workflows/model-drift-pr.yml runs it on every pull request.
 *   node tools/model-drift-pr.cjs --surface
 *       The live surface, one path per line (a path ending in / is a whole directory).
 *
 * The live surface is derived, not listed: every desk module the bench loads (each load("...") in
 * tools/lab-bench.cjs), followed through its runtime imports (type-only imports change nothing a model is asked),
 * plus the whole engine seam and the bench itself. A new import in hint.ts widens it without anyone editing this file.
 *
 * The live run it asks for stays the operator's (.ai/memory/0007): scripts/model-drift.ps1 on the pull request's
 * branch, then commit the new record and DRIFT.md. The budget is one bench run per pull request that touches the
 * surface (12 maths hint problems asked at most twice each, two page reads, 9 lesson picks) and none for any other.
 */
const fs = require("node:fs"), path = require("node:path"), { execFileSync } = require("node:child_process");
const { compare } = require("./model-drift.cjs");
// The import scanner is shared with tools/desk-boundaries.cjs; this file still exports it for its suite.
const { importsOf, resolveSpec, closureOf } = require("./import-graph.cjs");

const REPO = path.resolve(__dirname, "..");
const LIB = "desk/src/lib/";
/** A drift record, as a repo path. README.md and DRIFT.md never match. */
const RECORD = /^uat\/drift\/(\d{4}-\d{2}-\d{2})-(\d+)\.json$/;
/** Always on the surface, whatever the import graph says: the engine seam, and the bench and its corpus parser. */
const FIXED = ["desk/src/lib/engines/", "tools/lab-bench.cjs", "tools/lab-corpus.cjs"];
const USAGE = "usage: node tools/model-drift-pr.cjs --base <ref> [--head <ref>] | --surface";

/** The desk modules the bench loads: every load("<f>") in tools/lab-bench.cjs's source, as repo paths. */
function benchEntries(src) {
  return [...src.matchAll(/\bload\(\s*["']([^"'\s]+)["']\s*\)/g)].map((m) => LIB + m[1]);
}

/** Whether a repo path is on the surface: equal to a listed file, or under a listed directory (ending in /). */
const onSurface = (file, surface) => surface.some((s) => (s.endsWith("/") ? file.startsWith(s) : file === s));

/** The live surface of the repo at `repo`: FIXED, then the bench's entries and everything they import. */
function surfaceOf(repo = REPO) {
  const abs = (f) => path.join(repo, f);
  const isFile = (f) => { try { return fs.statSync(abs(f)).isFile(); } catch { return false; } };
  const read = (f) => fs.readFileSync(abs(f), "utf8");
  const reached = closureOf(benchEntries(read("tools/lab-bench.cjs")), { read, isFile });
  return [...FIXED, ...reached.filter((f) => !onSurface(f, FIXED))];
}

/** Drift records from `{ file, text }` pairs (repo paths), oldest first, as tools/model-drift.cjs readRecords() orders them. */
function parseRecords(entries) {
  const out = [];
  for (const { file, text } of entries) {
    if (!RECORD.test(file)) continue;
    try {
      const r = JSON.parse(text);
      if (r && r.v === 1 && typeof r.at === "string") out.push({ ...r, file: path.posix.basename(file), path: file });
    } catch { /* not a record */ }
  }
  return out.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.file.localeCompare(b.file)));
}

const list = (xs) => (xs.length > 5 ? `${xs.slice(0, 5).join(", ")} and ${xs.length - 5} more` : xs.join(", "));

/**
 * The verdict on one pull request. `changed` is every path the pull request changes, `added` the records it adds,
 * `base` the records on the base branch, and `staleOf(commit)` the surface files changed between a commit and the
 * head (null when the history does not hold that commit).
 */
function prCheckOf({ surface, changed, added, base, staleOf }) {
  const problems = [], notes = [];
  const addedPaths = new Set(added.map((r) => r.path));
  const rewritten = changed.filter((f) => RECORD.test(f) && !addedPaths.has(f));
  if (rewritten.length) problems.push(`append-only: this pull request changes or deletes the committed record(s) ${list(rewritten)}. A record is never edited; a new run writes a new one.`);
  const touched = changed.filter((f) => onSurface(f, surface));
  if (!touched.length) return { ok: !problems.length, touched, record: null, baseline: null, problems, notes };

  const mine = added.filter((r) => r.mode === "live"), theirs = base.filter((r) => r.mode === "live");
  const record = mine.length ? mine[mine.length - 1] : null, baseline = theirs.length ? theirs[theirs.length - 1] : null;
  if (!record) {
    problems.push(`no live record: this pull request changes ${touched.length} file(s) the lab bench runs on the real engines (${list(touched)}) and adds no live record to uat/drift/. Run scripts/model-drift.ps1 on this branch, then commit the new record and DRIFT.md.`);
    return { ok: false, touched, record, baseline, problems, notes };
  }
  const judged = compare(baseline, record);
  notes.push(...judged.notes);
  const against = baseline ? `against the base's newest live record ${baseline.file}` : "with no baseline yet";
  for (const a of judged.alerts) problems.push(`the live record ${record.file} alerted ${against}: ${a}`);
  if (!record.commit) problems.push(`the live record ${record.file} names no commit, so nothing says it measured this branch's code`);
  else {
    const stale = staleOf(record.commit);
    if (stale == null) problems.push(`the live record ${record.file} measured ${record.commit}, which this history does not hold`);
    else if (stale.length) problems.push(`stale: ${list(stale)} changed after ${record.commit}, the commit ${record.file} measured. Run the bench again and commit the new record.`);
  }
  return { ok: !problems.length, touched, record, baseline, problems, notes };
}

function git(args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}
const linesOf = (s) => s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

function main(argv) {
  const has = (f) => argv.includes(f);
  const val = (f) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null; };
  if (has("--surface")) { console.log(surfaceOf().join("\n")); return 0; }
  const base = val("--base"), head = val("--head") || "HEAD";
  if (!base) { console.error(USAGE); return 2; }

  let changed, addedPaths, basePaths;
  try {
    changed = linesOf(git(["diff", "--name-only", "--no-renames", `${base}...${head}`]));
    addedPaths = linesOf(git(["diff", "--name-only", "--no-renames", "--diff-filter=A", `${base}...${head}`, "--", "uat/drift/"]));
    basePaths = linesOf(git(["ls-tree", "-r", "--name-only", base, "--", "uat/drift/"]));
  } catch (e) {
    console.error(`model drift (PR): git cannot compare ${base}...${head} (a shallow clone needs fetch-depth: 0). ${String(e.stderr || e.message).trim()}`);
    return 2;
  }
  const show = (ref) => (file) => { try { return { file, text: git(["show", `${ref}:${file}`]) }; } catch { return null; } };
  const added = parseRecords(addedPaths.map(show(head)).filter(Boolean));
  const baseRecords = parseRecords(basePaths.map(show(base)).filter(Boolean));
  const surface = surfaceOf();
  const staleOf = (commit) => {
    try { return linesOf(git(["diff", "--name-only", "--no-renames", commit, head])).filter((f) => onSurface(f, surface)); }
    catch { return null; }
  };
  const r = prCheckOf({ surface, changed, added, base: baseRecords, staleOf });

  const lines = [`model drift (PR) · ${base}...${head} · ${changed.length} changed file(s), ${r.touched.length} on the live surface`];
  if (!r.touched.length && r.ok) lines.push("ok: the live surface is untouched, no model call owed");
  else if (r.ok) lines.push(`ok: the live record ${r.record.file} measured this branch (${r.record.commit}) with no alert ${r.baseline ? `against ${r.baseline.file}` : "(the first live record)"}`);
  lines.push(...r.problems.map((p) => `FAIL ${p}`), ...r.notes.map((n) => `note: ${n}`));
  console.log(lines.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "## Model drift, this pull request (uat/drift/)\n\n" + lines.map((l) => `- ${l}`).join("\n") + "\n");
  return r.ok ? 0 : 1;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (e) { console.error(`model drift (PR): ${e.stack || e}`); process.exitCode = 2; }
}

module.exports = { FIXED, RECORD, benchEntries, importsOf, resolveSpec, closureOf, onSurface, surfaceOf, parseRecords, prCheckOf, main };
