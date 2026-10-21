# Round-agent brief - /scan-sweep --optimize, 2026-10-21 (director-run fan-out)

You are a ROUND-AGENT. You own one round (one context, or a paired set) of a `--optimize` sweep.
The director owns every shared file and runs the integration gate. Read this whole brief first.

## Where you work

- Checkout: `C:/Users/kazda/kiro/firetv-sweep21` (a git worktree, branch `sweep/optimize-2026-10-21`).
  Up to three other round-agents commit into this SAME worktree at the same time, each in their own paths.
- NEVER write anything in `C:/Users/kazda/kiro/firetv` (the operator's main checkout; other sessions work there).
  Reading is fine.
- The method: `C:/Users/kazda/kiro/firetv/.claude/skills/scan-sweep/SKILL.md`. Read §3-§5, §7 and §9's
  finding object. You also need `references/lenses.md` (the lens prompts) and `references/evidence.md`
  (the evidence ladder), in the same skill folder.
- Overlay (repo law, gates): `C:/Users/kazda/kiro/firetv-sweep21/.claude/scan-sweep/config.md`. Its
  `## Repo law` and the `/spark` overlay's `## Repo law` (`.claude/spark/config.md`) bind every edit. Also read
  `AGENTS.md` (constraints) and the `.ai/memory/` entries whose scope covers your files.
- Your context's files: `context-map.json` at the worktree root, `file_paths` of your context(s). The map was
  remapped today (commit 68235b82): every tracked source and test file now has exactly one context. Stay inside
  your paths, plus any coupled doc, test or generated file the fix REQUIRES (§5 veto 1, name it in the commit body).

## Strategy: --optimize

Deep tier: bounty-hunter, parity-auditor, error-handler, observability-auditor, risk-assessor, code-optimizer,
ux-reviewer, visual-craft, state-coverage, copy-auditor, accessibility-checker, test-strategist, security-auditor,
PLUS tech-debt-tracker, dependency-auditor, devops-optimizer, documentation-auditor, mobile-specialist. Then the
lenses whose Match hits your context, then the rest as a lighter pass. Skip the `Group: challenge` pair.
About 70% of the budget goes to hardening, debt and coverage.
**Every hardening claim has a count**: duplicated sites, a version delta plus a green gate, a step count, or a
stated rule checked against code. "Cleaner" with no figure is `not-better` (churn), never `unmeasurable`.

- Budget: **16 findings** per context (a paired round gets 16 per context it holds). Deep tier ≤3 per lens,
  matched ≤2, remaining ≤1. Under 8 findings for a ≥10-file context, do §4.8's second pass before you stop.
- Hunt for pairs (§4.6): two implementations of one rule where only one was fixed. Interrogate every
  hand-maintained list (§4.7).
- Every finding is the §4.10 standard form (Summary / Description / Flow / Expected impact / Evaluation),
  with `file:line` anchors as repo-root-relative paths, exactly as `git ls-files` prints them.
- Dead or unused claims need a zero-consumer grep in the evidence.
- The ledger records only lenses POINTED AT A NAMED ARTEFACT (§4.9). A lens with no surface goes to
  `lens_no_surface`.

## Registry (§6)

`.ai/registry-map.json` exists but predates today's remap: a context created today (linga-scenes, linga-level,
maths-school, maths-calculus, writing, family-mode, stick-app, repo-governance) has no row. For a context with a
row, take the subject's `file` verbatim. Otherwise resolve through
`C:/Users/kazda/kiro/ai-registry/knowledge/software-engineering/index.json` -> `subjects["<slug>"].file`
(never build a path from a slug; grep the index's `use_when` triggers to pick the subject). Read the golden path,
then the techniques that touch your lenses, and name the technique in a finding when one applies. Do NOT write
`.ai/consults.jsonl` or `.ai/registry-leads.jsonl`; return those lines in your reply.

## Never re-propose

Already decided, open, or filed in Personas Approvals. Do not emit them again or rephrase them:
- essay-master: the rewriteStatus comment says the page inks from the status line
- vision-lab: a single factor root named alone still passes `leaks()`
- Linga has two 'adult' tests (owner); school.ts split into unit modules (Lane B, open)
- unused exports in desk/ (`.claude/scan-sweep/runs/lean-2026-10-10-desk/findings.jsonl`): in scope only when you
  prove a behaviour consequence, not just "unused"
- the 2026-10-13 cards in Approvals: companion pinch-zoom and 44 px controls; Explain's leak check is a per-kind
  subset of the hint's leaksLine; the worktree node_modules junction; device-rules-test needs tools/node_modules;
  calc-rules-test red once under parallel run-rules; vision retries without think on any failed status; an engines
  suite hung 25 min; lesson windows embedded with one role; the wrong-PIN lockout as a DoS lever; prototype loads
  Google Fonts; the TV credential never expires; any LAN client can dial the relay as the TV; tv-app clip plays after
  Home / LanTransport bind failure / link poll while stopped / overscan / pinned media3+Ktor+SDK 34 / paired dot
  semantics; the pointer ring is 5 px; every "the context map omits X" card (today's remap settled them).
- A new rules suite goes into `desk/package.json` `rulesSuites` just BEFORE `harness-rules-test.cjs`, which must
  stay last. `desk/package.json` is a shared surface: take the lock (below), edit, commit at once, release.

## Lanes (§5) - what you build

- **Lane A** (`better` at `gate` or `probe`, Gate none / policy-tighten with a test, XS/S or M with risk ≤3,
  inside your paths): BUILD it. Write the test or instrument first and watch it go red, then fix it and watch it go
  green. Re-measure After on the real change. One commit per finding.
- **Lane B** (simulation-only, M with risk ≥4, L, out-of-scope seams, in-tree contracts without a verifier):
  do not build. Write the card with an `instrument` field naming what would decide it.
- **Lane C** (direction, architecture, irreversible, policy-loosen, XL, external contracts, operator-only):
  write the card and name the escalation.
- `not-better`: rejected with both figures. Report it, never emit it.
- A file on the live surface (`node tools/model-drift-pr.cjs --surface` lists it: hint, read and pick pipelines, the
  rules they import, `desk/src/lib/engines/`, the lab bench) needs a live drift record the operator takes before it
  merges (`.ai/memory/0017`). You may still build a Lane A fix there, but say so under NOTES with the file.
- A change to what a TV screen DRAWS cannot be screenshot-verified in this run (no dev server). Prefer a
  server-side render or a rows test as the gate; name the owed capture under NOTES.

## Gates - assert the exit code, every time

Run each gate in its own invocation, `&&`-chained, with the output redirected to a file. Never pipe a gate into
`tail`/`head` before `&&`. Never use `;` before a commit. Scratch goes under
`C:/Users/kazda/AppData/Local/Temp/firetv-sweep21/<your context>/`, never in the tree.

- TypeScript (from `desk/`): `node node_modules/typescript/bin/tsc --noEmit > <tmp>/tsc.txt 2>&1 && echo OK`.
  `desk/node_modules` and `tools/node_modules` are junctions to the main checkout; never delete or rewrite them.
- Rules suites, from `desk/`: `node ../tools/<suite>.cjs > <tmp>/x.txt 2>&1 && echo OK`. Find the suites with
  `grep -l "<module path>" tools/*-test.cjs`. Do NOT run the whole `node ../tools/run-rules.cjs`; the director does.
- Desk layering, when you change what a `desk/src/` module imports or whether it writes a file:
  `node tools/desk-boundaries.cjs` from the worktree root.
- Kotlin (`core/`, `tv-app/`, `stick-app/`): from the worktree root through PowerShell:
  `cmd /c ".\gradlew.bat :core:test > <tmp>\g.txt 2>&1"` then check `$LASTEXITCODE`. Do NOT use
  `node tools/gradlew.cjs` here: it spawns a bare `gradlew.bat` and this harness sets
  `NoDefaultCurrentDirectoryInExePath=1`, so it fails before Gradle starts (repo-governance owns that fix).
  (`:tv-app:compileDebugKotlin :tv-app:testDebugUnitTest` for tv-app,
  `:stick-app:testDebugUnitTest` for stick-app). Only ONE gradle run at a time across agents: take the lock with
  `mkdir C:/Users/kazda/AppData/Local/Temp/firetv-sweep21-gradle.lock` (fails if held: retry after a minute) and
  `rmdir` it when done, even on failure. In PowerShell, `Remove-Item` on that path is refused by the harness;
  release it with `[System.IO.Directory]::Delete('C:\Users\kazda\AppData\Local\Temp\firetv-sweep21-gradle.lock')`
  in a `finally` block (or `rmdir` from bash).
- `uat/driver`: `node --check <file>`. Never run a live LT run.
- **A red whole-tree gate is probably not yours.** Another agent is mid-edit in the same tree. Compare the failing
  paths against your files before you treat a red as yours. If none are yours, say so, scope the check to your files.
- No dev servers, no end-to-end suites, no network, no live model calls (stub at the `provider` seam), no
  `*-live.cjs` or `*-probe` tool that spends calls. Never touch `desk/data/`. Tests set `DESK_DATA_DIR` to a temp dir.
- Author any pattern containing a backslash with the Edit or Write tool, never through a shell heredoc. After any
  edit to a checker, seed a violation and watch it go red. Strip comments before source-scanning (§7.8).
- Shared-surface lock (for `desk/package.json`, `CHANGELOG.md`): `mkdir C:/Users/kazda/AppData/Local/Temp/firetv-sweep21-shared.lock`,
  edit, commit immediately with a pathspec, `rmdir`.

## Commits

- Pathspec only: `git commit -q -F <msgfile> -- <path> <path>`. For a NEW file: `git add <file>` first, then the
  same pathspec commit. Never `git add -A` / `.` / `-u`, never `git stash`, `git reset`, `git checkout --` on any file
  you did not write in this round. Before each commit, `git diff --cached --name-only` must list only your files.
- Message: `fix(<context>): <finding title>`. The body names the lens and gives Before -> After, re-measured, plus
  the gates you ran with their exit codes. End with exactly:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- A fix that grows past its size class mid-flight: revert your own edit and emit the finding at its honest size.

## What you write, what you return

1. Your findings file: `.claude/scan-sweep/runs/optimize-2026-10-21/<context>.jsonl`, one §9 finding object per line
   for EVERY finding, built ones included. Extra fields: `"lane":"A|B|C"`, `"disposition":"built|carry|backlog"`,
   `"sha"` for built, and `"instrument"` for Lane B. Do not commit this file; the director does.
2. Your reply, in this shape and nothing longer:
   - `SNAPSHOT <context>`: the §10 JSON row, one per context, with `strategy:"optimize"`, `lens_keys` only for
     lenses pointed at a named artefact, and `lens_no_surface`.
   - `COVERAGE`: one line per lens in lens_keys, saying what it checked.
   - `BUILT`: `<sha> <title> - <re-measured Before -> After>`
   - `REJECTED`: `<title> - <Before> vs <After>`
   - `OPEN`: `<lane> <size> <title>` for each B/C card
   - `CONSULT`: the §6 consult JSON line
   - `LEADS`: the lead JSON lines, or `none`
   - `GATES`: each gate you ran, with its exit code; anything you could not run
   - `NOTES`: any behaviour change a gate would not show, any red that was not yours, any brief error, any owed
     capture or drift record
