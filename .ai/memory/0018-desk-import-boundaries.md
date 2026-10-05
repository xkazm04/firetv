---
id: 0018
kind: convention
scope: path:desk/src/lib/
date: 2026-10-05
supersedes: null
refs: [path:tools/desk-boundaries.cjs, path:tools/desk-boundaries-test.cjs, path:tools/import-graph.cjs, path:.github/workflows/repo-guardrails.yml, 0003, 0007]
---

**The desk's layering is a failing check, not only a sentence.** `tools/desk-boundaries.cjs` reads every source file
under `desk/src/` and fails on five breaks:

- **engines-leaf.** `lib/engines/` loads nothing else in the desk.
- **engine-internal.** Outside the engines, only the entry modules are loaded: text, vision, embed, voice, listen,
  health, shape and types. `registry`, `call` and `codex` stay internal, and a new engine file is internal until it is
  listed.
- **rules-pure.** Nothing a rule loads at run time, followed through every import chain, reaches an engine or a Node
  built-in.
- **spawn-in-engines.** Only the engines start a process.
- **state-in-session.** Only `lib/session/` and `lib/engines/` write files. `WRITE_ALLOW` names each exception with
  its reason. Today the only one is `lib/library/lessons.ts`, which writes a derived embeddings cache. A stale entry is
  a failure too.

The check uses the import scanner the model-drift check uses, `tools/import-graph.cjs`. `import type` is free.

It runs in `.github/workflows/repo-guardrails.yml` on every pull request and on push to main. It is not in
`desk/package.json` `test:rules`, because that line was a gate surface for the autopilot cycle that added it. Appending
`node ../tools/desk-boundaries-test.cjs` there is the operator's call.

When it went in, the desk was clean against all five rules, so nothing had reached around the engine seam yet.

**Why:** "decisions stay in rules, engines stay behind engines, the session is the only state" is what keeps the gate
free of live calls (0007). It is also the shape the native Fire TV rebuild (0003) is meant to keep: rules as a pure
module like the telestrator's `core/`, engines behind one interface, and one state owner. An agent can break a sentence
without noticing, but it cannot merge past a red check.
