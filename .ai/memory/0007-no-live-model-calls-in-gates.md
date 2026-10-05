---
id: 0007
kind: convention
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:desk/src/lib/engines/]
---

**No gate makes a live model call.** The rules suites in `desk/package.json` `test:rules` run with no
Claude CLI, codex, Ollama or ElevenLabs. A test that needs an engine stubs it at the `provider` seam in
`desk/src/lib/engines/`. Live checks (`tools/*-live.cjs`, `tools/linga-ui-test.cjs`, a UAT LT run) are
separate, opt-in and spend real calls, so they are the operator's decision. **Why:** a gate has to be
deterministic, free and runnable offline by any agent. Source: `.claude/scan-sweep/config.md` (Repo law).
