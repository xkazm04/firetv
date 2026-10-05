# firetv: agent guidance

This file is the **canonical** guidance for the whole repository (`guidance.canonical` in
`.ai/manifest.yaml`). Each separate build has an overlay that adds only what is specific to it and
defers to this file: `desk/AGENTS.md` for the Next.js app and `deathride/AGENTS.md` for the Death Ride
build (each read through its own `CLAUDE.md`). `tools/guidance-overlay-test.cjs` fails when a separate
build has no overlay. The `.claude/<skill>/config.md` overlays add per-skill
procedure on top. They never override the constraints below.

## What this repository is

One repository, three products for a TV in the living room, sharing a phone-as-input idea:

| Product | Where | What it is |
|---|---|---|
| **Telestrator** (the original PoC) | `core/`, `tv-app/`, `companion/`, `tools/` (live probes), `scripts/`, `fixtures/`, `vision/` | Android TV app: a phone draws on a paused video frame. Pure-JVM `core` + an Android `tv-app` with an embedded Ktor server. |
| **Study Desk** (Linga English, Math Buddy, Essay Master) | `desk/`, `tools/*-test.cjs`, `uat/`, `prototype/` | A Next.js functional prototype of a homework desk on the TV. It is a design document to be rebuilt natively on Fire TV, not the shipping app. |
| **Death Ride** | `deathride/` | A standalone Kotlin/libGDX combat racer for Fire TV. It is a **separate Gradle build** with its own wrapper and settings. |

Product docs live in `docs/` (index: [docs/README.md](docs/README.md)). Durable decisions live in
`.ai/memory/`. What changed in each product, by date, is in [CHANGELOG.md](CHANGELOG.md).

## Commands

Run from the repo root unless stated. `node tools/gradlew.cjs <tasks>` runs the root Gradle wrapper
the same way on Windows and Linux (it is `gradlew.bat` / `./gradlew` from the repo root).

| Need | Command | Notes |
|---|---|---|
| Install (desk) | `npm ci --prefix desk` | In an autopilot worktree, `npm test`'s pretest links `desk/node_modules` from the main checkout instead. |
| Install (live probes) | `npm ci --prefix tools` | Only for `tools/*.mjs` (Playwright, ws). The rules suites need nothing here. |
| Test: telestrator core | `node tools/gradlew.cjs :core:test` | Pure JVM, seconds, no device. |
| Test: Study Desk | `npm --prefix desk test` | `tsc --noEmit`, then every rules suite in `desk/package.json` `test:rules`. |
| Typecheck: Study Desk | `npm --prefix desk run test:types` | |
| Evals (AI output, deterministic) | the `evals` command in `.ai/manifest.yaml` | A subset of the desk gate: the maths judge and marking, withholding, and the UAT verdict, metrics, ledger and surface suites. Model roles are stubbed. See `docs/AI_HARNESS.md`. |
| Compile: tv-app | `node tools/gradlew.cjs :core:test :tv-app:compileDebugKotlin` | Needs `local.properties` (SDK path) and the generated `tv-app/src/main/res/raw/fixture_clip.mp4` (see `fixtures/README.md`). |
| Build: tv APK | `node tools/gradlew.cjs :tv-app:assembleDebug` | Same prerequisites. |
| Full telestrator cycle | `./scripts/dev.ps1` | Unit, build, emulator, deploy, live UI test (PowerShell, Windows). |
| Death Ride | `cd deathride` then `.\gradlew.bat :core:test`, `:link:test`, `:app:assembleDebug` | Its own build. Never run it through the root wrapper. Read `deathride/AGENTS.md` first (app id, gate, owner checks). |
| Desk layering | `node tools/desk-boundaries.cjs` | Fails when `desk/src/` breaks its layering: engines are a leaf behind their entry modules, rules load no engine or Node built-in, only engines spawn, only the session writes (`.ai/memory/0018`). Its suite is `node tools/desk-boundaries-test.cjs`. |
| Guidance overlays | `node tools/guidance-overlay-test.cjs` | Every separate build (`desk/`, `deathride/`) has an `AGENTS.md` + `CLAUDE.md` that defers to this file. |
| Commit provenance | `node tools/commit-provenance.cjs [<range>]` | The per-lane, per-agent authorship report, read from `Agent-Lane:` and `Co-Authored-By:` trailers. `--check <base>..<head>` lists AI commits that lack them (`.ai/memory/0019`). Its suite is `node tools/commit-provenance-test.cjs`. |
| Model drift (live quality over time) | `node tools/model-drift.cjs --status --max-age 21` (no model); the live run is `scripts/model-drift.ps1` | The live run spends real calls and is the operator's. Its suite is `node tools/model-drift-test.cjs`. The pre-merge check is `node tools/model-drift-pr.cjs --base origin/main`, and its suite is `node tools/model-drift-pr-test.cjs`. See `uat/drift/README.md`. |
| Changelog shape | `node tools/changelog-test.cjs` | A noticeable change adds a line under its product's `### Unreleased` in `CHANGELOG.md`. |
| Agent contract | `node .ai/doctor.mjs` (`--run` also executes every capability) | The doctor exits 1 on the waived `control.prepush` fail. The verdict is `node .ai/doctor.mjs --json > doctor.out` then `node scripts/doctor-gate.mjs doctor.out`. Its suite is `node tools/doctor-gate-test.cjs`. |
| Pin workflow actions | `node scripts/pin-actions.mjs` (`--check` works offline) | Needs network and a GitHub token. Never type a SHA (`.ai/memory/0013`). |

`gradle.properties` pins `org.gradle.java.home` to the operator's Android Studio JBR. On any
other machine, pass `-Dorg.gradle.java.home=<a JDK 17>` or remove that line locally.

There is no linter or formatter wired yet. Match the surrounding style. Kotlin follows
`kotlin.code.style=official`.

### Which gate for which change

| You touched | Run before proposing |
|---|---|
| anything under `desk/`, or a `tools/*-test.cjs` | `npm --prefix desk test` |
| a module under `desk/src/` that changes what it imports or whether it writes a file | the desk gate, plus `node tools/desk-boundaries-test.cjs` |
| `core/` | `node tools/gradlew.cjs :core:test` |
| `tv-app/` or `companion/` | `node tools/gradlew.cjs :core:test :tv-app:compileDebugKotlin` |
| a TV screen (`desk/src/tv`, `desk/src/app/tv`, `desk/src/english/LingaTV.tsx`) | the desk gate, plus a Playwright capture against a second dev server (`next dev --webpack`, its own seeded `DESK_DATA_DIR`) |
| `uat/driver` | `node --check uat/driver/linga-text.cjs` (a live LT run spends codex calls and is the operator's call) |
| a file on the live surface (`node tools/model-drift-pr.cjs --surface`: the hint, read and pick pipelines, the rules they import, `desk/src/lib/engines/`, the lab bench) | the desk gate, plus a live drift record the operator takes on the branch (`scripts/model-drift.ps1`) and commits in the PR. Ask for it; never run it yourself (`.ai/memory/0017`). |
| `deathride/` | that build's `:core:test :link:test` from `deathride/`, plus `:app:assembleDebug` when `app/` changed (`deathride/AGENTS.md`) |
| a build root's guidance (`AGENTS.md`, `CLAUDE.md`, a new top-level build) | `node tools/guidance-overlay-test.cjs` |

## Architecture map

**Telestrator.**
- `core/` is pure Kotlin/JVM: annotation schema and codec, timeline, letterbox mapping, pen engine, smoothing, hit-testing, undo history, the wire protocol and the transport plan.
- `tv-app/` (`dev.telestrator.tv`) is the Android app. It has the Media3 player, a Compose overlay, an embedded Ktor CIO server (LAN transport) and a Ktor client (relay transport), QR pairing and D-pad input.
- `companion/index.html` is the phone PWA. It is copied into the APK assets at build time (`syncCompanion`), so the TV serves the same file Playwright tests.

Data flow: phone → `ws://` (the TV listens) or a relay (the TV dials out) → `core` pen conversation →
annotation document anchored to the paused frame → Compose overlay. State is mirrored back to the
phone.

**Study Desk.** This is `desk/`, Next.js 16.
- `src/app/tv` and `src/app/phone` are the two surfaces. Every TV screen is in `src/tv/screens.tsx`.
- `src/lib/session/store.ts` is the only state: a reducer with SSE fan-out and JSON persistence. The TV renders it and the phone posts events to it.
- `src/proxy.ts` classifies every API caller as TV, phone or guest. Pairing is in `src/lib/session/pairing.ts`.
- `src/lib/rules/` holds the decisions made in code.
- `src/lib/engines/` holds the text, vision, voice and embed engines, each with a `provider` field.
- `src/lib/desk/` holds the pipelines.

The rules suites are `tools/*-test.cjs`. `uat/` is the Linga UAT overlay. `prototype/` holds static
design pages that `prototype/build.py` builds.

**Death Ride.**
- `deathride/` holds the modules `core` (pure JVM simulation), `link`, `game`, `app` (Android) and `desktop`.
- Its concept docs are in `docs/concepts/` and its evidence is in `deathride/evidence/`.

**Shared.**
- `vision/` holds the local vision-model client (Python) kept from the closed sports direction.
- `.claude/` holds the skill overlays (scan-sweep, uat, cx, spark, contest, perfect, leonardo).
- `.ai/` holds the agent contract (manifest, memory, doctor).

## Constraints (never break these)

- `core/` has **no Android imports**. It must stay testable on a plain JVM.
- `companion/` has one source of truth. Never copy it by hand into `tv-app`.
- In the desk:
  - Decisions stay in code (`desk/src/lib/rules/`). The model explains; it does not decide.
  - Engines stay behind `desk/src/lib/engines/`.
  - The session is the only state.
  - `tools/desk-boundaries.cjs` checks these three in `repo-guardrails.yml` (`.ai/memory/0018`).
  - Withholding is the product: nothing puts the answer on screen.
  - On Air (`docs/DESIGN-ON-AIR.md`) is law for every TV surface.
- **No live model calls in a gate.** The rules suites run with no Claude CLI, codex, Ollama or ElevenLabs. Stub at the `provider` seam.
- **Never touch `desk/data/`** (real learner records). Tests set `DESK_DATA_DIR` to a temp directory.
- The block between the `nextjs-agent-rules` markers in `desk/AGENTS.md` is written by `next dev`. Leave it as Next writes it.
- Secrets come from environment variables, set locally in the gitignored `desk/.env.local` (`ELEVENLABS_API_KEY`, ...). Never commit `.env*`, keys or keystores. `.ai/guardrails.yaml` hard-fails the doctor if one is tracked.
- `deathride/` is a separate build. Do not wire it into the root `settings.gradle.kts`.

## Working agreement (for agents)

- Start from the task's acceptance criteria and gates. A task filed with the agent-task issue form (`.github/ISSUE_TEMPLATE/agent-task.yml`) has both. For a free-form request, write them down before the first edit (CONTRIBUTING.md, "Handing work to an agent").
- Read this file, then the `.ai/memory/` entries whose `scope` covers what you will touch.
- Run the gate for what you touched (table above) and report its exit code. Never propose a diff with a red gate.
- Keep changes small and focused. Match the surrounding code's conventions. Use pathspec-scoped commits.
- Work in a worktree per wave when other sessions may share the checkout.
- AI-assisted commits carry a `Co-Authored-By` trailer that names the agent. A commit made by an unattended loop lane also carries `Agent-Lane: <lane branch>` (`.ai/memory/0019`). A human approves every merge.
- The full Definition of Done and the PR checklist are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Tooling in use

- The harness index is [docs/AI_HARNESS.md](docs/AI_HARNESS.md). It lists the evals (which ones gate and which are live), where prompts live, the runbooks and the review gate.
- Skills, with their overlays in `.claude/<skill>/config.md`:
  - `/scan-sweep` (quality sweeps and challenge runs)
  - `/uat` (Linga acceptance; LT runs on codex)
  - `/cx`, `/spark`, `/contest`, `/perfect`, `/leonardo`
- They are registered under `agents:` in `.ai/manifest.yaml`.
- CI (`.github/workflows/`):
  - `ai-conformance.yml` runs `.ai/doctor.mjs` (the agent contract check) on every PR. Its exit code is red by design because of the human-owned `control.prepush` finding (`.ai/memory/0011`).
  - `conformance-gate.yml` is the contract verdict to read on a PR. `scripts/doctor-gate.mjs` fails on any doctor fail except the waivers it lists, each owned by a memory entry (`.ai/memory/0016`).
  - `capabilities-pr.yml` runs every `.ai/manifest.yaml` capability through `node .ai/doctor.mjs --run` on each same-repo PR. It goes red when a capability fails, or when a committed `verified: true` did not hold. To set a flag, commit the write-back of a local `node .ai/doctor.mjs --run`; never hand-flip one (`.ai/memory/0016`).
  - `quality.yml` runs the desk gate and `:core:test` on every PR.
  - `supply-chain.yml` runs on main. It submits the Gradle dependency graph and builds and attests the debug APK.
  - `capabilities.yml` runs weekly and on dispatch. It executes every `.ai/manifest.yaml` capability through `node .ai/doctor.mjs --run` and goes red on any failure (`.ai/memory/0012`).
  - `model-drift.yml` runs its suite on every PR. Weekly, it goes red when the committed live-quality record in `uat/drift/` drifted, is missing, or is older than 21 days (`.ai/memory/0014`).
  - `model-drift-pr.yml` runs on every PR. A PR that touches the live surface goes red unless it adds a live record that measured its code and does not alert against the base branch's newest one (`.ai/memory/0017`).
  - `changelog.yml` checks `CHANGELOG.md`'s shape and links on every PR and push to main (`.ai/memory/0015`).
  - `repo-guardrails.yml` runs on every PR and push to main. It goes red when `desk/src/` breaks its layering or a separate build loses its guidance overlay. On a PR it also annotates every AI commit whose agent or lane is not in a trailer. That step warns until the operator adds `--strict` (`.ai/memory/0018`, `0019`).
- `.github/dependabot.yml` keeps Gradle, npm and the Actions current.

## Example of a good change

A rules change in the desk:
1. Edit one file in `desk/src/lib/rules/`.
2. Extend its `tools/<area>-rules-test.cjs` suite, or append a new suite at the end of `test:rules`.
3. Run `npm --prefix desk test` (exit 0).
4. Write one commit scoped to those paths, with the attribution trailer. If the change settled a question someone would otherwise reopen, add a `.ai/memory` entry.
