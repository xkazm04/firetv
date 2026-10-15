# Round-agent brief - /scan-sweep --optimize, 2026-10-13 (director-run fan-out)

You are a ROUND-AGENT. You own one round (one context, or a paired set) of a `--optimize` sweep.
The director owns every shared file and runs the integration gate. Read this whole brief first.

## Where you work

- Checkout: `C:/Users/kazda/kiro/firetv-sweep` (a git worktree, branch `sweep/optimize-2026-10-13`).
  Other round-agents commit into this SAME worktree at the same time, each in their own paths.
- NEVER write anything in `C:/Users/kazda/kiro/firetv` (the operator's main checkout). Reading is fine.
- The method: `C:/Users/kazda/kiro/firetv/.claude/skills/scan-sweep/SKILL.md`. Read §3-§5, §7 and §9's
  finding object. You also need `references/lenses.md` (the lens prompts) and `references/evidence.md`
  (the evidence ladder). Both are in the same skill folder.
- Overlay (repo law, gates): `C:/Users/kazda/kiro/firetv-sweep/.claude/scan-sweep/config.md`. Its
  `## Repo law` and the `/spark` overlay's `## Repo law` (`.claude/spark/config.md`) bind every edit.
- Your context's files: `context-map.json` at the worktree root, `file_paths` of your context(s).
  Stay inside them, plus their tests and any coupled doc, test or generated file the fix REQUIRES (§5 veto 1).

## Strategy: --optimize

The deep tier is stabilize's thirteen (bounty-hunter, parity-auditor, error-handler, observability-auditor,
risk-assessor, code-optimizer, ux-reviewer, visual-craft, state-coverage, copy-auditor, accessibility-checker,
test-strategist, security-auditor) PLUS tech-debt-tracker, dependency-auditor, devops-optimizer,
documentation-auditor and mobile-specialist. Then the lenses whose Match hits your context, then the rest
as a lighter pass. Skip the `Group: challenge` pair. About 70% of the budget goes to hardening, debt and coverage.
**Every hardening claim has a count**: duplicated sites, a version delta plus a green gate, a step count,
or a stated rule checked against code. "Cleaner" with no figure is `not-better` (churn), never `unmeasurable`.

- Budget: **16 findings** per context (a paired round gets 16 per context it holds). Deep tier ≤3 per lens,
  matched ≤2, remaining ≤1. Under 8 findings for a ≥10-file context, do §4.8's second pass before you stop.
- Hunt for pairs (§4.6): two implementations of one rule where only one was fixed. Interrogate every
  hand-maintained list (§4.7).
- Every finding is the §4.10 standard form (Summary / Description / Flow / Expected impact / Evaluation),
  with `file:line` anchors given as repo-root-relative paths, exactly as `git ls-files` prints them.
- Dead or unused claims need a zero-consumer grep in the evidence.

## Registry (§6): declared, unmapped

There is no `.ai/registry-map.json`. Resolve the governing subject through
`C:/Users/kazda/kiro/ai-registry/knowledge/software-engineering/index.json` -> `subjects["<slug>"].file`
(take `file` verbatim; never build a path from a slug). Grep the index's `use_when` triggers to pick the
subject. Read the golden path, then the techniques that touch your lenses. Name the technique in a finding
when one applies. Do NOT write `.ai/consults.jsonl` or `.ai/registry-leads.jsonl`. Return those lines in your
reply; the director appends them.

## Never re-propose

These are already in open backlogs. Do not emit them again, and do not emit rephrasings of them:
- vision-lab: a single factor root named alone still passes `leaks()` (policy-tighten)
- essay-master: rewriteStatus comment says the page inks from the status line
- the context map omits landing's model.ts and themes, and linga's cert.ts and cert-rules-test.cjs
- Linga has two 'adult' tests; school.ts unit modules; the guest view allowlist (built); one test runner (built)
- unused exports in desk/ (274 listed in `.claude/scan-sweep/runs/lean-2026-10-10-desk/findings.jsonl`):
  an unused-export finding is in scope only when you prove a behaviour consequence, not just "unused".
- `tools/engines-rules-test.cjs` case 23 was a wall-clock flake; wave 1 fixed it (28e1f42f). A red there now is real.
- A new rules suite goes into `desk/package.json` `rulesSuites` just BEFORE `harness-rules-test.cjs`, which must stay last (harness case 9).

## Lanes (§5) - what you build

- **Lane A** (`better` at `gate` or `probe`, Gate none / policy-tighten with a test, XS/S or M with risk ≤3,
  inside your paths): BUILD it. Write the test or instrument first and watch it go red, then fix it and watch it go green.
  Re-measure After on the real change. One commit per finding.
- **Lane B** (simulation-only, M with risk ≥4, L, out-of-scope seams, in-tree contracts without a verifier):
  do not build. Write the card with an `instrument` field naming what would decide it.
- **Lane C** (direction, architecture, irreversible, policy-loosen, XL, external contracts, operator-only):
  write the card and name the escalation.
- `not-better`: rejected with both figures. Report it, never emit it.

## Gates - assert the exit code, every time

Run each gate in its own invocation, `&&`-chained, with the output redirected to a file. Never pipe a gate
into `tail`/`head` before `&&`. Never use `;` before a commit.

- TypeScript (from `desk/`): `node node_modules/typescript/bin/tsc --noEmit > <tmp>/tsc.txt 2>&1 && echo OK`
  (`desk/node_modules` is a junction to the main checkout. Its `.bin` is missing, so `npm test` cannot find tsc.
  Call the compiler by path.)
- Rules suites: run the suites that cover what you touched, from `desk/`:
  `node ../tools/<suite>.cjs > <tmp>/x.txt 2>&1 && echo OK`. Find them with
  `grep -l "<module path>" tools/*-test.cjs`. Do NOT run the whole `node ../tools/run-rules.cjs`; the director runs it.
- Kotlin (`core/`, `tv-app/`): `./gradlew.bat :core:test` (plus `:tv-app:compileDebugKotlin` for tv-app),
  through PowerShell from the worktree root. Only ONE gradle run at a time across agents: take the lock with
  `mkdir C:/Users/kazda/AppData/Local/Temp/firetv-sweep-gradle.lock` (it fails if the lock is held, so retry
  after a minute), and `rmdir` it when done, even on failure.
- `uat/driver`: `node --check <file>`. Never run a live LT run (claude CLI subscription calls).
- **A red whole-tree gate is probably not yours.** Another agent is mid-edit in the same tree. Compare the
  failing paths against your files before you treat a red as yours. If none are yours, say so, scope the check
  to your own files, and do not commit into a red that is yours.
- No dev servers, no end-to-end suites, no network, no live model calls (stub at the `provider` seam).
  Caches and scratch go to `C:/Users/kazda/AppData/Local/Temp/`, never inside the tree. Never touch `desk/data/`.
- Author any pattern containing a backslash with the Edit or Write tool, never through a shell heredoc.
  After any edit to a checker, seed a violation and watch the checker go red. Strip comments before
  source-scanning (§7.8).

## Commits

- Pathspec only: `git commit -q -F <msgfile> -- <path> <path>`. For a NEW file: `git add <file>` first, then
  the same pathspec commit. Never `git add -A` / `.` / `-u`, never `git stash`, `git reset`, `git checkout --`
  on any file you did not write in this round.
- Message: `fix(<context>): <finding title>`. The body names the lens and gives Before -> After, re-measured,
  plus the gates you ran with their exit codes. End with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- A fix that grows past its size class mid-flight: revert your own edit and emit the finding at its honest size.

## What you write, what you return

1. Your findings file: `.claude/scan-sweep/runs/optimize-2026-10-13/<context>.jsonl`, one §9 finding object
   per line for EVERY finding, built ones included. Extra fields: `"lane":"A|B|C"`,
   `"disposition":"built|carry|backlog"`, `"sha"` for built, and `"instrument"` for Lane B. Do not commit this
   file; the director does.
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
   - `NOTES`: any behaviour change a gate would not show (§ skill-improvement log 2026-09-23), any red that was not yours, any brief error
