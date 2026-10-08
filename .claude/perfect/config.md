---
product: "Study Desk"
stack: "Next.js 16 (App Router, React 19, TypeScript) prototype in desk/; engines behind desk/src/lib/engines; one server-side session as the only state; Kotlin core/ + tv-app/ for the native TV"
vault: ["C:/Users/kazda/kiro/firetv/.perfect"]
vault_subdir: Perfect
base_branch: main
wave_size: 3
lot_caps: {}
pool_target: 10
round_shape: round
cooldown_rounds: 2
commit_format: "feat(<context>): <title>"
context_map: context-map.json
active_runs_ledger: ""
locale_count: 1
---

# /perfect overlay - firetv (Study Desk)

Adopted 2026-09-29 for the Math module (contexts `math-buddy` and the maths half of `desk-pipelines`,
plus the unmapped `desk/src/tv/marks.tsx` and `docs/DESIGN-MATH-BUDDY.md`). The skill is read from the
local ai-registry checkout (`C:\Users\kazda\kiro\ai-registry\skills\perfect`); it is not linked under
`.claude/skills/`. `.perfect/` is gitignored, like `.spark/` and `.cx/`.

## Gates

```
always: cd desk && npm test
when core/ changed: ./gradlew.bat :core:test (PowerShell, repo root), exit 0
when a TV screen changed: the always gate, plus a Playwright capture from tools/ against a second dev server (next dev --webpack, own seeded DESK_DATA_DIR, /tv?key= from pairing.json)
builder: cd desk && npm test
```

Each gate runs in its own invocation, `&&`-chained, exit code asserted. `npm test` is `tsc --noEmit` and then every
rules suite in `test:rules`; a new suite is appended at the END of `rulesSuites` in desk/package.json (run by `test:rules`, `node ../tools/run-rules.cjs`) (shared surface, one owner at a time).

## Class B

- `desk/package.json` `rulesSuites` list (append a suite at the end, anchored on the last one; run by `test:rules`, `node ../tools/run-rules.cjs`)
- `.claude/scan-history/*.jsonl`

## Class C

- `context-map.json`, the git index, `desk/data/**` (never touched), `.claude/perfect/config.md`

## Repo law

The `/spark` overlay's `## Repo law` (`.claude/spark/config.md`) binds every build, verbatim: On Air for every TV
surface (Math Buddy has its own language, Lamplight, `docs/DESIGN-MATH-BUDDY.md`), decisions stay in
`desk/src/lib/rules/`, engines stay behind `desk/src/lib/engines/`, the session is the only state, withholding is
the product (the answer is never put on screen), the TV never asks for typing, pathspec-scoped commits. Plus:

- **Never touch `desk/data/`** (the real learners Ema and Jakub); a builder that needs learner data sets
  `DESK_DATA_DIR` under the OS temp dir and a scratch learner id.
- **No live model calls in a gate**; a test that needs an engine stubs it at the `provider` seam.
- `docs/STUDY-DESK-SCREENS.md` and `docs/DESIGN-MATH-BUDDY.md` follow a screen change in the same commit.

## Context sources

`context-map.json` is the queue and the name source (written 2026-09-23, remapped 2026-09-25; it disagrees with the
tree in no path). Unmapped but Math-owned: `desk/src/tv/marks.tsx`, `docs/DESIGN-MATH-BUDDY.md`.

## Smoke

TV captures need `/tv?key=` from `<DESK_DATA_DIR>/pairing.json` and a phone paired through `/phone?pin=`. Second dev
server in a worktree or a temp copy of `desk/`; `next dev --webpack` (turbopack rejects the junctioned node_modules).

## Opportunity arcs

- Math Buddy redesign (Lamplight) landed 2026-09-25; the next arc is breadth of content the typesetter and the
  pipelines can carry (Calculus 1 baseline, 2026-09-29).

## Vetoes

- Nothing that moves a verdict into a prompt. Nothing that shows the answer.

## User taste

- Outcome-value over cosmetic churn; on the Study Desk television a verdict is a picture, prose only in the caption slot.

## Skill improvement log

- 2026-09-29: this repo hosts parallel sessions. Mid-wave a foreign session cut a branch (`desk-display`) off the wave branch, switched the shared checkout to it, and a builder's commit landed there; nothing was lost (the branch was fast-forwarded with `git branch -f`, never a checkout) but the wave lost an hour. Take ONE worktree for the wave up front (`git worktree add ../firetv-perfect <wave-branch>`; junction `tools/node_modules` for Playwright; `npm test` links `desk/node_modules` itself) instead of switching branches in the shared tree; tear the junctions down with `rmdir` BEFORE `git worktree remove`.
- 2026-09-29: the first live Calculus run reported 56 violations, 39 of them the instrument's own noise (cropped-by-design thumbnails, its empty voice stub, 1 px). Read one screenshot per violation kind and fix the instrument before briefing builders on the number; the 17 real ones then briefed themselves with file, selector and measured value. One live runner at a time (the server has one session), so give the live instrument to a single lot per wave.
- 2026-09-29: a test that derives structure from copy (`tools/phone-panel-test.cjs` reads the TV's "snap ... with the phone" sentences) turns red when a helper takes the sentence out of the TSX; keep scanned copy in the component and move only the variable part. `next dev` writes `desk/.next/dev/types`, and Next's generated route types reject `GET(req?: Request)` in the two session routes, so `npm test` is red in any tree a dev server has run in until that folder is deleted (backlog: session context, S).
- 2026-09-29: Director ran on Sonnet 5.5 (the skill names Fable 5 / Opus 5): the scout-to-slate-to-lots method held; every builder direction was written failing-first and every spot-check of a scout's evidence line held. Opus builders followed the harness's attribution over the brief's trailer, so commit trailers in history are mixed.
- 2026-09-29 (Calculus as a course path, 10 lots in one worktree, no collision): a model setting is decided by a side-by-side run on the real engine, not by argument. `thinking: false` on Calculus spec writing measured 62-90 s (two 90 s timeouts) against 7-14 s at the same yield, in a five-minute run because the yield probe (`tools/calc-model-yield.cjs`) already existed; for any pipeline that asks a model for structure, build the probe before the wiring.
- 2026-09-29: the Director broke its own rule once: `items.ts` got `thinking: false` after only the practice suite ran, and the full gate was red on a repo guard (tools/linga-rules-test.cjs pinned one caller). Run the whole `npm test` before every commit that touches a shared file, one-liners included; a guard that pins a policy is widened deliberately, with the measurement in its comment and a seeded violation proving it still bites.
- 2026-09-29: `desk/package.json`'s `test:rules` line is the one file every lot edits: two lots' suite lines rode into one `--only` commit and HEAD briefly named a test file that was not committed yet. Tell lots to leave a line naming an uncommitted test file alone (the briefs did from wave 6 on) or give registration to one owner.
