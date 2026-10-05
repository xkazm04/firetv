---
id: 0019
kind: convention
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:tools/commit-provenance.cjs, path:tools/commit-provenance-test.cjs, path:.github/workflows/repo-guardrails.yml, path:CONTRIBUTING.md]
---

**Agent authorship is recorded in commit trailers, not in prose.**

- An AI-written commit ends with `Co-Authored-By: <model> <noreply@...>`, which names the agent.
- A commit made by an unattended loop lane also carries `Agent-Lane: <lane branch>` next to its `Ascent-Resolves:`
  trailers.
- The older `Lane: cycle N on <branch>` sentence in the body is legacy. Tooling reads it, but reports it as prose.

What reads the trailers:

- `node tools/commit-provenance.cjs [<range>]` prints the per-lane, per-agent authorship table.
- `--check <base>..<head>` annotates every AI-marked commit that lacks either trailer. It runs on each pull request in
  `.github/workflows/repo-guardrails.yml`.

When it was added, every loop-lane commit had `Ascent-Resolves:` but no `Co-Authored-By:`, and its lane only as prose.
The check therefore warns and passes. The operator adds `--strict` to that workflow step once the lane writes both
trailers.

The reader is the operator at merge time. The table shows how much of a range one lane or model wrote, and so how
deeply to review it. `git log --format=%H --grep` cannot reliably select one lane's commits to revert; `Agent-Lane:`
can.

Signing commits and a branch rule that requires signed or trailered commits are the operator's acts, not an agent's.

The doctor does not check trailers. It reads the tree, while provenance lives in history, which a shallow CI checkout
does not hold. The pull-request job (`fetch-depth: 0`) is where it belongs.
