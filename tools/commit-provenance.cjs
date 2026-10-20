#!/usr/bin/env node
/**
 * Who wrote what, read from commit trailers rather than from prose (.ai/memory/0019). An AI-written commit names its
 * agent in a `Co-Authored-By:` trailer, and a commit an unattended lane made names that lane in an `Agent-Lane:`
 * trailer (the lane's branch), next to the `Ascent-Resolves:` trailers the lane already writes. Trailers are what
 * `git interpret-trailers` and `git log --format=%(trailers)` can query; a sentence in the body is not.
 *
 *   node tools/commit-provenance.cjs [<range>]
 *       The authorship report: AI-marked commits grouped by lane and agent, and where each lane name came from
 *       (a trailer, or the legacy `Lane: cycle N on <branch>` sentence). Without a range: the last 200 commits.
 *   node tools/commit-provenance.cjs --check <base>..<head> [--strict]
 *       Lists every AI-marked commit in the range that lacks a structured trailer: no `Co-Authored-By:` naming an
 *       agent, or lane work (an `Ascent-Resolves:` trailer or a prose lane line) with no `Agent-Lane:` trailer. Each one
 *       is a GitHub warning annotation and the exit is 0. With --strict a finding exits 1. The operator turns --strict
 *       on in .github/workflows/repo-guardrails.yml once the lane writes both trailers.
 *
 * A commit is AI-marked when it carries any agent signal: an agent `Co-Authored-By:`, an `Agent-Lane:` or
 * `Ascent-Resolves:` trailer, a prose lane line, or an `Agent summary:` section. A human's commit carries none and is
 * never a finding. Merge commits are skipped. Needs git history only (fetch-depth: 0 in CI); no network, no model.
 */
const fs = require("node:fs"), path = require("node:path"), { execFileSync } = require("node:child_process");

const REPO = path.resolve(__dirname, "..");
const USAGE = "usage: node tools/commit-provenance.cjs [<range>] | --check <base>..<head> [--strict]";
/** A Co-Authored-By value that names a coding agent, not a person. */
const AGENT = /noreply@anthropic\.com|@openai\.com|\b(claude|codex|gpt|copilot|gemini|grok)\b/i;
const RS = "\x1e", US = "\x1f";
/** One record per commit: RS, then hash, subject and the full message separated by US. */
const FORMAT = "--format=%x1e%H%x1f%s%x1f%B";

/** The trailer block of a commit message: its last paragraph, when every line is `Key: value` or a continuation. */
function trailersOf(message) {
  const paras = message.replace(/\r\n/g, "\n").trim().split(/\n[ \t]*\n/);
  if (paras.length < 2) return [];
  const lines = paras[paras.length - 1].split("\n"), out = [];
  for (const line of lines) {
    const m = /^([A-Za-z0-9][A-Za-z0-9-]*):[ \t]*(\S.*)$/.exec(line);
    if (m) out.push({ key: m[1].toLowerCase(), value: m[2].trim() });
    else if (/^[ \t]+\S/.test(line) && out.length) out[out.length - 1].value += " " + line.trim();
    else return [];
  }
  return out;
}

/** One commit's provenance, from its hash, subject and full message. */
function commitOf({ sha, subject, message: raw }) {
  const message = raw.replace(/\r\n/g, "\n"), trailers = trailersOf(message);
  const values = (key) => trailers.filter((t) => t.key === key).map((t) => t.value);
  const coAuthors = values("co-authored-by");
  const agents = coAuthors.filter((v) => AGENT.test(v)).map((v) => v.replace(/\s*<[^>]*>\s*$/, "").trim());
  const lane = values("agent-lane")[0] || null;
  const prose = /^Lane:[ \t]*(.+?)[ \t]*$/m.exec(message);
  const proseLane = !lane && prose ? (/\bon\s+(\S+?)\.?$/.exec(prose[1]) || [null, prose[1].replace(/\.$/, "")])[1] : null;
  const resolves = values("ascent-resolves");
  const summary = /^Agent summary:/m.test(message);
  const laneWork = Boolean(lane || proseLane || resolves.length);
  return { sha, subject, agents, lane, proseLane, resolves, laneWork, aiMarked: Boolean(agents.length || laneWork || summary) };
}

/** `git log` output in FORMAT, as commits. */
function parseLog(raw) {
  return raw.split(RS).filter((r) => r.trim()).map((r) => {
    const [sha, subject, ...rest] = r.split(US);
    return commitOf({ sha: sha.trim(), subject: (subject || "").trim(), message: rest.join(US) });
  });
}

/** The AI-marked commits that lack a structured trailer, each with what is missing. */
function findingsOf(commits) {
  const out = [];
  for (const c of commits) {
    if (!c.aiMarked) continue;
    const missing = [];
    if (!c.agents.length) missing.push("no Co-Authored-By trailer names the agent that wrote it");
    if (c.laneWork && !c.lane) missing.push(c.proseLane ? `its lane (${c.proseLane}) is only a prose line, not an Agent-Lane trailer` : "it is lane work (Ascent-Resolves) with no Agent-Lane trailer");
    if (missing.length) out.push({ sha: c.sha, subject: c.subject, missing });
  }
  return out;
}

/** The per-lane, per-agent authorship rows, most commits first. */
function reportOf(commits) {
  const rows = new Map();
  for (const c of commits) {
    if (!c.aiMarked) continue;
    const lane = c.lane || c.proseLane || "(no lane)";
    const source = c.lane ? "trailer" : c.proseLane ? "prose" : "-";
    const agent = c.agents.length ? c.agents.join(", ") : "(no agent trailer)";
    const key = [lane, agent, source].join(US);
    const row = rows.get(key) || { lane, agent, source, commits: 0 };
    row.commits++;
    rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) => b.commits - a.commits || a.lane.localeCompare(b.lane));
}

/** The CLI, with `logOf(range, max)` returning git log output in FORMAT. Returns { code, lines }. */
function run(argv, logOf) {
  const strict = argv.includes("--strict"), checkAt = argv.indexOf("--check");
  if (checkAt >= 0) {
    const range = argv[checkAt + 1];
    if (!range || range.startsWith("--")) return { code: 2, lines: [USAGE] };
    const commits = parseLog(logOf(range, null)), found = findingsOf(commits);
    const marked = commits.filter((c) => c.aiMarked).length;
    const lines = [`commit provenance · ${range} · ${commits.length} commit(s), ${marked} AI-marked, ${found.length} without a structured trailer${strict ? " (strict)" : ""}`];
    for (const f of found) lines.push(`${strict ? "::error" : "::warning"} title=Commit provenance::${f.sha.slice(0, 8)} ${f.subject}: ${f.missing.join("; ")}`);
    if (!found.length) lines.push("ok: every AI-marked commit names its agent, and every lane commit its lane, in trailers");
    return { code: strict && found.length ? 1 : 0, lines };
  }
  const range = argv.find((a) => !a.startsWith("--")) || null;
  const commits = parseLog(logOf(range, range ? null : 200)), rows = reportOf(commits);
  const marked = commits.filter((c) => c.aiMarked).length;
  const lines = [`commit provenance · ${range || "last 200 commits"} · ${commits.length} commit(s), ${marked} AI-marked`, "", "| Lane | Agent | Lane from | Commits |", "|---|---|---|---|"];
  for (const r of rows) lines.push(`| ${r.lane} | ${r.agent} | ${r.source} | ${r.commits} |`);
  return { code: 0, lines };
}

function gitLog(range, max) {
  const args = ["log", "--no-merges", "--no-color", FORMAT];
  if (max) args.push(`--max-count=${max}`);
  if (range) args.push(range);
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}

if (require.main === module) {
  try {
    const { code, lines } = run(process.argv.slice(2), gitLog);
    (code === 2 ? console.error : console.log)(lines.join("\n"));
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "## Commit provenance\n\n" + lines.filter((l) => !l.startsWith("::")).join("\n") + "\n");
    process.exitCode = code;
  } catch (e) {
    console.error(`commit provenance: git could not read the history (a shallow clone needs fetch-depth: 0). ${String(e.stderr || e.message).trim()}`);
    process.exitCode = 2;
  }
}

module.exports = { AGENT, FORMAT, trailersOf, commitOf, parseLog, findingsOf, reportOf, run };
