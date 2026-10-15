---
product: "Study Desk"
stack: "Next.js 16 (App Router, React 19, TypeScript) prototype in desk/; engines behind desk/src/lib/engines; one server-side session as the only state; Kotlin core/ + tv-app/ for the native TV"
vault: ["C:/Users/kazda/kiro/firetv/.friend"]
vault_subdir: Friend
base_branch: main
worktree_dir: .claude/worktrees
active_runs_ledger: ""
context_taxonomy: context-map.json
context_outbox: ""
verify_url: ""
locale_count: 1
commit_types: "feat, polish"
---

# /friend overlay - firetv (Study Desk)

Adopted 2026-10-14. The skill is linked from the local ai-registry (`.claude/skills/friend`, declared in
`.ai/manifest.yaml`). `.friend/` is gitignored, like `.perfect/` and `.spark/`.

## Areas

| name | paths | entry points |
|---|---|---|
| linga | desk/src/english, desk/src/lib/english | LingaTV.tsx, LingaPhone.tsx, lib/english/view.ts |
| math | desk/src/maths, desk/src/tv/marks.tsx, desk/src/lib/rules/school.ts, desk/src/lib/rules/maths.ts, desk/src/lib/rules/calc*.ts, desk/src/lib/rules/stretch.ts, desk/src/lib/desk/items.ts | desk/src/maths, docs/DESIGN-MATH-BUDDY.md |
| essay | desk/src/essay | desk/src/essay |
| landing | desk/src/landing | desk/src/landing |
| tv | desk/src/tv, desk/src/app/tv | desk/src/app/tv |
| phone | desk/src/app/phone | desk/src/app/phone |
| platform | desk/src/lib/session, desk/src/lib/engines, desk/src/lib/library, desk/src/lib/desk | lib/session/store.ts |
| telestrator | core/src, tv-app/src, companion | companion/index.html, tv-app/src/main |

`desk/src/lib/rules/` and `desk/src/design/` are shared by every desk area: touch them only for the picked
direction, and say so.

## Gates

```
builder: cd desk && npm test          (tsc --noEmit, then every rules suite; exit code asserted)
when core/ changed: ./gradlew.bat :core:test (PowerShell, repo root), exit 0
integration: cd desk && npm test
```

A worktree has no `desk/node_modules`: junction the main checkout's in (`npm test` may do it itself) and
`rmdir` the junction at exit, before any `git worktree remove`. A new rules suite is appended at the END of
`rulesSuites` in desk/package.json. Delete `desk/.next/dev/types` if a dev server ran in the tree and tsc
turns red on route types.

## Repo law

The `/spark` overlay's `## Repo law` (`.claude/spark/config.md`) binds every cycle, verbatim: On Air
(`docs/DESIGN-ON-AIR.md`) for every TV surface (Math Buddy speaks Lamplight, `docs/DESIGN-MATH-BUDDY.md`;
Linga its Open Door, `docs/DESIGN-LINGA.md`); decisions stay in `desk/src/lib/rules/` - the model explains, it
does not decide; engines stay behind `desk/src/lib/engines/`; the session is the only state; withholding is the
product (never put the answer on screen); the TV never asks for typing; nothing under 28 px on the TV.
Plus:

- **Never touch `desk/data/`** (real learners). Anything that needs learner data uses a temp `DESK_DATA_DIR`.
- **No live model calls in a gate**; stub at the `provider` seam.
- On the TV a verdict is a picture; prose only in the caption slot.
- Pathspec-scoped commits; never stage `desk/data/`, `desk/.env.local`, vault PNGs.

## Codegen

None.

## Docs

- A TV/phone screen change -> `docs/STUDY-DESK-SCREENS.md` in the same commit.
- A Math surface change -> `docs/DESIGN-MATH-BUDDY.md`; a Linga surface change -> `docs/DESIGN-LINGA.md` when it changes the language.

## Verified mode

Not configured (`verify_url` empty): the TV needs `/tv?key=` from `<DESK_DATA_DIR>/pairing.json` and a paired
phone, and `next dev --webpack` in a worktree. Cycles end with a `To verify:` checklist.

## Context sources

`context-map.json` is the name source (groups -> contexts -> `file_paths`).

## Direction taste

- Outcome-value over cosmetic churn.

## Skill improvement log

- 2026-10-14: a worktree needs `tools/node_modules` junctioned as well as `desk/` (device-rules-test imports pngjs from tools/); the baseline gate is red without it. `rmdir` both before any `git worktree remove`.
- 2026-10-14: the math row first listed only the TV surface; all five directions lived in `lib/rules`, so the row now names the maths rules files. `docs/BACKLOG.md` is the richest evidence source here, but probe each row before proposing it: MB-B44 to MB-B47 were marked open after they had landed.
