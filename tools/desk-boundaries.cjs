#!/usr/bin/env node
/**
 * The desk's layering, held by code instead of by a sentence. desk/AGENTS.md and the root AGENTS.md say: decisions stay
 * in src/lib/rules/, engines stay behind src/lib/engines/, and the session is the only state. This check reads every
 * source file under desk/src/ and fails on the import that breaks one of those:
 *
 *   engines-leaf     src/lib/engines/ loads nothing else in the desk. An engine is a seam to a model, and knows no
 *                    rule, pipeline or session.
 *   engine-internal  Outside src/lib/engines/, only an engine's entry module is loaded (ENTRY below). The provider
 *                    registry, the deadline wrapper and the codex adapter stay internal, so a provider swap or a stub
 *                    at the `provider` seam never reaches a caller. A new engine file is internal until it is listed.
 *   rules-pure       Nothing a rule loads at run time, directly or through any import chain, reaches an engine or a
 *                    Node built-in. The model explains; it does not decide (.ai/memory/0007). A rule decides from
 *                    values, so a rules suite runs with no model, no disk and no network.
 *   spawn-in-engines Only src/lib/engines/ starts a process (node:child_process): the CLIs and binaries the desk drives
 *                    are engines.
 *   state-in-session Only src/lib/session/ and src/lib/engines/ write files (the engines write scratch files for a
 *                    CLI). Anything else that writes is a second store. WRITE_ALLOW names each exception and why, and an
 *                    exception that no longer writes is reported too, so the list cannot rot.
 *
 * OWED names the breaks main already carried when the check was wired: each is printed and does not fail until its
 * owner decision lands, and an entry whose break is gone fails, so the list only shrinks.
 *
 * Type-only imports are free: they load nothing at run time. The import graph comes from tools/import-graph.cjs, the
 * scanner the model-drift check uses. Reads files only: no model, no network, no desk install.
 *
 *   node tools/desk-boundaries.cjs     exit 0 when the desk keeps its layering, 1 with every break listed
 * Its suite is tools/desk-boundaries-test.cjs, run by .github/workflows/repo-guardrails.yml on every pull request.
 */
const fs = require("node:fs"), path = require("node:path"), { builtinModules } = require("node:module");
const { importsOf, resolveSpec } = require("./import-graph.cjs");

const REPO = path.resolve(__dirname, "..");
const SRC = "desk/src/";
const LIB = SRC + "lib/";
const ENGINES = LIB + "engines/";
const RULES = LIB + "rules/";
const SESSION = LIB + "session/";
/** The engine modules a caller may load. Everything else in src/lib/engines/ is internal to the seam. */
const ENTRY = ["text", "vision", "embed", "voice", "listen", "health", "shape", "types"].map((n) => `${ENGINES}${n}.ts`);
/** Files outside the session and the engines that may write, each with the reason a reviewer accepted. */
const WRITE_ALLOW = {
  "desk/src/lib/library/lessons.ts": "caches the lesson-window embeddings to <data>/embeddings.json, derived data that is rebuilt when missing, not learner state",
};
/**
 * Breaks main already carried when this check was wired into CI (it landed in fc866ead, 2026-10-20, on a desk that had
 * grown three since the check was written on 2026-10-05). Each is an open owner decision, not an acceptance: an owed
 * break is printed and does not fail, any OTHER break of the same file still fails, and an entry whose break no longer
 * fires fails too, so the list can only shrink. `detail` is a substring of the problem's detail.
 */
const OWED = [
  { rule: "engines-leaf", file: "desk/src/lib/engines/meter.ts", detail: "desk/src/lib/dataDir.ts", why: "the usage ledger (EC1, 2026-10-10) finds the data directory through the shared helper (de7361f2); whether a leaf helper may sit under the engine seam is open" },
  { rule: "state-in-session", file: "desk/src/lib/twin/state.ts", detail: "writes files", why: "writes twin.json, the Twin's own store (P4, 2026-10-07): a second store until it moves behind src/lib/session/ or gets a reasoned WRITE_ALLOW entry" },
];
const BUILTIN = new Set(builtinModules.flatMap((m) => [m, `node:${m}`]));
const isBuiltin = (spec) => spec.startsWith("node:") || BUILTIN.has(spec);
const isSpawn = (spec) => spec === "child_process" || spec === "node:child_process";
const FS = /^(?:node:)?fs(?:\/promises)?$/;
const WRITES = new Set(["writeFile", "writeFileSync", "appendFile", "appendFileSync", "mkdir", "mkdirSync", "mkdtemp", "mkdtempSync",
  "rename", "renameSync", "rm", "rmSync", "rmdir", "rmdirSync", "unlink", "unlinkSync", "copyFile", "copyFileSync", "cp", "cpSync",
  "createWriteStream", "truncate", "truncateSync", "symlink", "symlinkSync"]);
const under = (dir) => (f) => f.startsWith(dir);
const inEngines = under(ENGINES), inRules = under(RULES), inSession = under(SESSION);

/** The fs functions a source can write with: named imports and requires, and calls through an fs namespace. */
function fsWritesOf(src) {
  const used = new Set(), spaces = [];
  const take = (clause) => {
    const braces = /\{([^}]*)\}/.exec(clause);
    if (braces) for (const part of braces[1].split(",")) {
      const s = part.trim();
      if (!s || /^type\s/.test(s)) continue;
      const [name, local] = s.split(/\s+as\s+/).map((x) => x.trim());
      if (name === "promises") spaces.push(local || name);
      else if (WRITES.has(name)) used.add(name);
    }
    const rest = clause.replace(/\{[^}]*\}/, "");
    for (const m of rest.matchAll(/(?:\*\s+as\s+)?\b([A-Za-z_$][\w$]*)\b/g)) if (m[1] !== "as") spaces.push(m[1]);
  };
  for (const m of src.matchAll(/(?:^|;)[ \t]*import\s+(?!type\s)([^"';]*?)\s+from\s+["']([^"'\s]+)["']/gm)) if (FS.test(m[2])) take(m[1]);
  for (const m of src.matchAll(/\b(?:const|let|var)\s+(\{[^}]*\}|[A-Za-z_$][\w$]*)\s*=\s*require\(\s*["']([^"'\s]+)["']\s*\)/g)) if (FS.test(m[2])) take(m[1].replace(/:/g, " as "));
  for (const ns of spaces) {
    const esc = ns.replace(/\$/g, "\\$");
    for (const m of src.matchAll(new RegExp(`\\b${esc}\\.(\\w+)\\s*\\(`, "g"))) if (WRITES.has(m[1])) used.add(m[1]);
  }
  return [...used].sort();
}

/** Every source file under desk/src/, as repo paths. */
function sourcesOf(repo) {
  const out = [], walk = (rel) => {
    for (const e of fs.readdirSync(path.join(repo, rel), { withFileTypes: true })) {
      const f = rel + e.name;
      if (e.isDirectory()) { if (e.name !== "node_modules" && !e.name.startsWith(".")) walk(f + "/"); }
      else if (/\.(ts|tsx|js|mjs|cjs)$/.test(e.name)) out.push(f);
    }
  };
  if (fs.existsSync(path.join(repo, SRC))) walk(SRC);
  return out.sort();
}

/**
 * The layering verdict for the desk at `repo`: `{ files, problems, owed }`, one problem per broken boundary, with the
 * breaks an `owed` entry names moved from `problems` to `owed`. `allow` is the write allow-list and `owed` the known
 * breaks (WRITE_ALLOW and OWED unless a caller, such as the suite's scratch trees, brings its own).
 */
function check(repo = REPO, { allow = WRITE_ALLOW, owed = OWED } = {}) {
  const raw = layering(repo, allow);
  const problems = [], known = [], used = new Set();
  for (const p of raw.problems) {
    const o = owed.find((e) => e.rule === p.rule && e.file === p.file && p.detail.includes(e.detail));
    if (o) { known.push(p); used.add(o); } else problems.push(p);
  }
  for (const o of owed) if (!used.has(o)) problems.push({ rule: o.rule, file: o.file, detail: `is OWED (${o.detail}) but that break no longer fires; delete its OWED entry` });
  return { files: raw.files, problems, owed: known };
}

/** Every broken boundary of the desk at `repo`, owed or not. */
function layering(repo, allow) {
  const abs = (f) => path.join(repo, f);
  const isFile = (f) => { try { return fs.statSync(abs(f)).isFile(); } catch { return false; } };
  const text = new Map();
  const read = (f) => { if (!text.has(f)) text.set(f, fs.readFileSync(abs(f), "utf8")); return text.get(f); };
  const files = sourcesOf(repo);
  const problems = [];
  const add = (rule, file, detail) => problems.push({ rule, file, detail });
  const edges = new Map();
  const edgesOf = (f) => {
    if (!edges.has(f)) edges.set(f, importsOf(read(f)).map((spec) => ({ spec, to: resolveSpec(f, spec, isFile) })));
    return edges.get(f);
  };

  for (const f of files) {
    for (const { spec, to } of edgesOf(f)) {
      if (inEngines(f) && to && !inEngines(to)) add("engines-leaf", f, `loads ${to}: an engine knows no rule, pipeline or session`);
      if (!inEngines(f) && to && inEngines(to) && !ENTRY.includes(to)) add("engine-internal", f, `loads ${to}, which is internal to the engine seam; load an entry module (${ENTRY.map((e) => path.posix.basename(e, ".ts")).join(", ")})`);
      if (!inEngines(f) && isSpawn(spec)) add("spawn-in-engines", f, `loads ${spec}: only an engine starts a process`);
    }
    if (!inSession(f) && !inEngines(f)) {
      const writes = fsWritesOf(read(f)), allowed = Object.prototype.hasOwnProperty.call(allow, f);
      if (writes.length && !allowed) add("state-in-session", f, `writes files (${writes.join(", ")}): the session is the only state; move the write behind src/lib/session/ or add a reasoned WRITE_ALLOW entry`);
      if (!writes.length && allowed) add("state-in-session", f, "is in WRITE_ALLOW but no longer writes a file; delete its entry");
    }
  }
  for (const f of Object.keys(allow)) if (!files.includes(f)) add("state-in-session", f, "is in WRITE_ALLOW but does not exist; delete its entry");

  // rules-pure: walk each rule's runtime imports, keeping the chain so the message names the path that leaks.
  for (const root of files.filter(inRules)) {
    const via = new Map([[root, null]]), queue = [root];
    while (queue.length) {
      const f = queue.shift();
      const chain = () => { const c = []; for (let x = f; x; x = via.get(x)) c.unshift(x); return c.join(" -> "); };
      for (const { spec, to } of edgesOf(f)) {
        if (to && inEngines(to)) add("rules-pure", root, `reaches the engine ${to} through ${chain()} -> ${to}`);
        else if (!to && isBuiltin(spec)) add("rules-pure", root, `reaches the Node built-in ${spec} through ${chain()}`);
        else if (to && !via.has(to) && /\.(ts|tsx|js|mjs|cjs)$/.test(to)) { via.set(to, f); queue.push(to); }
      }
    }
  }
  return { files: files.length, problems };
}

function main() {
  const { files, problems, owed } = check();
  const lines = [`desk boundaries · ${files} source file(s) under ${SRC} · ${problems.length} problem(s), ${owed.length} owed`];
  for (const p of problems) lines.push(`FAIL ${p.rule}: ${p.file} ${p.detail}`);
  for (const p of owed) lines.push(`OWED ${p.rule}: ${p.file} ${p.detail} (an open decision; see OWED in tools/desk-boundaries.cjs)`);
  if (!problems.length) lines.push(`ok: engines are a leaf behind their entry modules, rules load no engine or built-in, only engines spawn, only the session writes${owed.length ? `, beyond ${owed.length} owed break(s)` : ""}`);
  console.log(lines.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "## Desk boundaries (desk/src/lib/)\n\n" + lines.map((l) => `- ${l}`).join("\n") + "\n");
  return problems.length ? 1 : 0;
}

if (require.main === module) {
  try { process.exitCode = main(); }
  catch (e) { console.error(`desk boundaries: ${e.stack || e}`); process.exitCode = 2; }
}

module.exports = { ENTRY, WRITE_ALLOW, OWED, fsWritesOf, sourcesOf, check };
