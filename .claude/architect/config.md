---
product: "Study Desk"
stack: "Next.js 16 (App Router, React 19, TypeScript) prototype in desk/; engines behind desk/src/lib/engines; one server-side session as the only state; Kotlin core/ + tv-app/ + companion/ for the native telestrator"
vault: ["C:/Users/kazda/kiro/firetv/.architect"]
vault_subdir: Architect
context_map: context-map.json
base_branch: main
worktree_root: .claude/worktrees
active_runs_ledger: ""
knowledge_registry: ../ai-registry
knowledge_domains: [software-engineering, localization, llm-observability]
---

# /architect overlay - firetv (Study Desk)

Adopted 2026-10-14. The skill is linked from the registry lane (`.ai/manifest.yaml` `skills:`); the vault
`.architect/` is gitignored, like `.perfect/`, `.spark/` and `.cx/`.

## Context sources

1. `context-map.json` - file -> context authority, 7 groups / 20 contexts (remapped 2026-09-25).
2. `desk/CLAUDE.md` (and `desk/AGENTS.md`) - the desk's working rules.
3. `.ai/registry-map.json` - context -> registry subject join, with per-pair verdicts.
4. `docs/DESIGN-ON-AIR.md` - the TV design law; `docs/DESIGN-MATH-BUDDY.md` for Math (Lamplight).
5. `docs/STUDY-DESK-SCREENS.md` - the screen inventory.

## Area menu

1. desk-linga - the Linga language module
2. desk-subjects - desk-pipelines, math-buddy, essay-master
3. desk-surfaces - landing, tv-surface, phone-surface
4. desk-platform - engines, session, library
5. telestrator - pen-core, tv-app, companion, telestrator-harness (Kotlin)
6. tooling - uat, desk-tooling
7. lab - vision-lab, prototype

## Gates

```
baseline: cd desk && npm test
step: cd desk && npm test
final: cd desk && npm test
slow: ./gradlew.bat :core:test   # only when core/ changed (PowerShell, repo root)
```

`npm test` = `tsc --noEmit` then every rules suite (`test:rules` -> `node ../tools/run-rules.cjs`, the list is
`rulesSuites` in `desk/package.json`). A worktree has no `desk/node_modules`; `pretest` (`tools/worktree-preflight.cjs`)
links it. There is no linter in desk/.

## Repo law

The `/spark` overlay's `## Repo law` (`.claude/spark/config.md`) binds verbatim: On Air for every TV surface (Math has
Lamplight), decisions stay in `desk/src/lib/rules/` (the model explains, it does not decide), engines stay behind
`desk/src/lib/engines/` with a `provider` field, the session is the only state, withholding is the product, the TV never
asks for typing, pathspec-scoped commits. Plus:

- **Never touch `desk/data/`** (real learners); isolated runs seed `DESK_DATA_DIR` under the OS temp dir.
- **No live model calls in a gate**; stub at the `provider` seam.
- A screen change updates `docs/STUDY-DESK-SCREENS.md` (and `docs/DESIGN-MATH-BUDDY.md` for Math) in the same commit.

## Docs vehicles

- `desk/CLAUDE.md` - conventions a builder must follow in desk/.
- `docs/` design docs - only for the screen / design law they already own.

## Knowledge registry

`../ai-registry`, domains `software-engineering`, `localization`, `llm-observability`. Resolve subjects through
`knowledge/<domain>/index.json`; `.ai/registry-map.json` names the subjects per context.

## Lint vehicle

None - desk/ has no linter. A codification that would be a lint rule ships as a structural test guard instead.

## Test guard vehicle

A `tools/<name>-test.cjs` (plain node, exit code is the verdict) appended at the END of `rulesSuites` in
`desk/package.json`; that list is a shared surface - one owner at a time.

## Smoke

TV captures need `/tv?key=` from `<DESK_DATA_DIR>/pairing.json` and a phone paired through `/phone?pin=`. Second dev
server in a worktree or a temp copy of `desk/`; `next dev --webpack` (turbopack rejects the junctioned node_modules).

## Baseline exclusions

- `uat/runs/**` (run output), `desk/data/**`, Linga art (`desk/src/english/art/`).
- `deathride/` lives on its own worktree/branch - out of scope here.

## Skill improvement log
- 2026-10-15: a one-character reply ("all") to a menu whose option 2 read `all=2` was taken as execute-all and said so before the first edit; the method gives no reading for a bare `all` - say the reading in one line before Phase 7 rather than guess silently.
- 2026-10-15: desk-jobs-rules-test.cjs reloads the store module mid-file (case 7, HF4), so a test reading the store after them reads a different instance than the routes; place new store-reading cases before them. The worktree baseline has device-rules red (11 tests) for environmental reasons - compare red sets, not exit codes.
- 2026-10-15: a timing test that bounds elapsed ms a few tens above a deadline passes alone and flakes in the gate (engines 17d: 3/15 isolated; a lazy require or ledger write stalls the loop 100-190 ms). Put the bound halfway between the new and the old outcome (one whole deadline apart) and run the suite 15x before the commit, not after the gate finds it.
