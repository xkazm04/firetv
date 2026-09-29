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
rules suite in `test:rules`; a new suite is appended at the END of that chain (shared surface, one owner at a time).

## Class B

- `desk/package.json` `test:rules` chain (append a suite at the end, anchored on the last one)
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

(none yet)
