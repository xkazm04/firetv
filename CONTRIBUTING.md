# Contributing to firetv

This repository holds three products (the Telestrator PoC, the Study Desk prototype and Death Ride),
and most changes are made by AI agents under a human owner. This file is the acceptance path: what
a change must show before it lands. The commands and the architecture map live in
[AGENTS.md](AGENTS.md), and this file does not repeat them.

## Before you write code

1. Read [AGENTS.md](AGENTS.md). It tells you which product you are in and which gate covers it.
2. Read the `.ai/memory/` entries whose `scope` covers the paths you will touch. They record decisions that are already settled (for example, sports analytics is closed, `desk/` is a prototype, and LT runs on codex). Do not reopen one without saying so in the PR.
3. If you are working through a skill (`/scan-sweep`, `/uat`, `/cx`, `/spark`, `/contest`, `/perfect`, `/leonardo`), read its overlay in `.claude/<skill>/config.md` or `uat/README.md`. The overlay adds procedure. It never relaxes a constraint in AGENTS.md.
4. If another session may share the checkout, work in a worktree.

## Development setup

| Product | One-time setup |
|---|---|
| Study Desk | Node 24, then `npm ci --prefix desk`. Engine keys go in `desk/.env.local` (gitignored, see `desk/README.md`). The gate needs no keys. |
| Telestrator | JDK 17, the Android SDK (`local.properties` with `sdk.dir`), and the fixture clip generated with ffmpeg (`fixtures/README.md`). `gradle.properties` pins the operator's JBR path; elsewhere, pass `-Dorg.gradle.java.home=<JDK 17>`. Live tests need `npm ci --prefix tools` and an emulator (`scripts/dev.ps1`). |
| Death Ride | See `deathride/README.md`. It is a separate Gradle build, run from `deathride/`. |

## The verification gate

Run the gate for every surface you touched and record its exit code. The table in AGENTS.md
("Which gate for which change") is the authority. In short:

| Touched | Gate |
|---|---|
| `desk/`, `tools/*-test.cjs` | `npm --prefix desk test` |
| `core/` | `node tools/gradlew.cjs :core:test` |
| `tv-app/`, `companion/` | `node tools/gradlew.cjs :core:test :tv-app:compileDebugKotlin` |
| a TV screen | the desk gate, plus a Playwright capture (or name the capture as owed) |
| `deathride/` | `:core:test :link:test` from `deathride/` |

`node .ai/doctor.mjs` checks the agent contract (`.ai/manifest.yaml`, memory, guidance). It runs on
every pull request in `.github/workflows/ai-conformance.yml`.

### Definition of Done

A change is done when **all** of these hold:

- [ ] The gate for every touched surface exits 0, run after the last edit, and the PR states the command and the exit code.
- [ ] A behaviour change has a test that fails without it (rules suites in `tools/`, unit tests in `core/`). A new desk suite is appended at the end of `test:rules`.
- [ ] Nothing in a gate calls a live model. Nothing reads or writes `desk/data/`. No secret, `.env*` or keystore is staged.
- [ ] A change to a TV surface either has a screenshot, or the PR names the capture that is still owed (device or Playwright) so it is not lost.
- [ ] Docs that describe the changed behaviour are updated in the same change (`AGENTS.md`, a product README, or `docs/`).
- [ ] A change a user or the owner would notice (a screen, a flow, a rule, a decision, a gate) adds one line under its product's `### Unreleased` in [CHANGELOG.md](CHANGELOG.md). `tools/changelog-test.cjs` checks the file's shape and links.
- [ ] A decision someone would otherwise reopen is recorded as a new `.ai/memory/NNNN-*.md` entry (append-only; use `supersedes` to replace an older one).
- [ ] Commits are pathspec-scoped and the history is honest: AI-written commits carry a `Co-Authored-By` trailer.

The pull request template (`.github/pull_request_template.md`) asks for each of these.

## AI-assisted contributions

- Agents are registered under `agents:` in `.ai/manifest.yaml`, each with the file it reads first.
- An agent self-certifies before proposing: it runs the gate, reports the exit code, and does not hand off a red chain. "It should pass" is not a result.
- A human approves every merge (`.ai/guardrails.yaml` `review.humanApproval: required`). Agents never push to `main` on their own.
- Live model runs (UAT LT, `tools/*-live.cjs`) spend real calls and are the owner's decision. Keep them out of the gate.
- When a session learns something durable (a gotcha, a failed approach), it writes a memory, not a paragraph in a chat log.

## Verifying a TV APK

`.github/workflows/supply-chain.yml` builds the telestrator debug APK on every push to `main`. It
publishes it as a workflow artifact with a `SHA256SUMS` file and a GitHub build-provenance
attestation. Before sideloading an APK, check that it came from this repository's CI:

```sh
gh attestation verify tv-app-debug.apk -R xkazm04/firetv
sha256sum -c SHA256SUMS
```

A file that fails either check did not come from this repo's CI. Do not install it.

## Licensing and the CLA

This repository has no licence file and takes no outside contributions, so there is no CLA. If
that changes, add the licence and a CLA here before accepting a pull request from outside the
owner's account.
