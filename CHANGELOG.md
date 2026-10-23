# Changelog

What changed in each of the two products in this repository, and in the harness around them, newest first. The
format is adapted from [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

- **Dated milestones, not versions.** Nothing here ships with a version yet:
  - the Telestrator APK is `0.1-poc` (`tv-app/build.gradle.kts`)
  - the desk is `0.1.0` (`desk/package.json`)

  So each entry is a dated milestone (`### YYYY-MM-DD: what landed`) that links the doc recording it. When a product
  starts shipping versions, its milestones become version headings.
- **How to add a line.** A change a user or the owner would notice (a screen, a flow, a rule, a decision, a gate) adds
  one line under its product's `### Unreleased` in the same pull request (CONTRIBUTING.md, Definition of Done). When a
  milestone closes, `Unreleased` is renamed to its date and a fresh `### Unreleased` goes on top.
- **Where the detail lives.** Every line links the design doc, plan or decision record that holds the detail. This file
  only routes to them.
- `tools/changelog-test.cjs` checks the shape: two product sections, each with `### Unreleased`, dates newest first,
  and every relative link resolving.

## Study Desk

`desk/` and `uat/`: the Next.js functional prototype of a homework desk on the TV (Linga English, Math Buddy, Essay Master).

### Unreleased
- Math Buddy's phone chip says Phone joined, or Phone not here when the paired phone is gone, as Essay Master's does, instead of a bare Phone ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- After the pairing page opened for a wish (a phone was needed and none was here), the screen it came from keeps its own Back: a paper opened from Math Buddy's home returns there once the phone joins or the wish is given up, instead of to Get ready for school ([docs/concepts/PHONE-BLOCKER-PAIRING-2026-10-22.md](docs/concepts/PHONE-BLOCKER-PAIRING-2026-10-22.md)).
- Linga's menu names its first door Close the menu when no scene is running (the welcome, the level picker, a finished scene) instead of Back to the scene ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- Math Buddy's A paper you sat: the caption stands beside Type a paper instead of under it, so the button no longer covers the line, and the empty paper's caption says what the phone does instead of repeating the screen's line ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- A pitched scene's sentence to take with you loses the model's wrapping straight quotes; an inner pair is curly and three dots are an ellipsis, as the authored cues are written ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- A pitched Linga scene set in a tavern, pub or restaurant draws the café table instead of the neutral way-in picture ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- Linga's level picker: with a level lit, Higher and Lower say where they go (Up to B2, Down to A2), so the caption is no longer read as the lit level ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- The Writing screen's caption sits on the stage's lower edge, as On Air's other captions do, so the prompt list and the chosen prompt no longer leave the lower half of the TV empty ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- Teach me something opens Topics on the first topic, where the Tonight ruler's needle stands, for a learner past the school path's end with nothing secure, instead of on Probability; Get ready for school still opens on the last topic ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- No em dash left in the TV's own lines: the lens-chosen status, the Reading caption's start line, the tense rule and the time-word question now use a colon, comma or semicolon (Essay Master's Structure lens promise is on the live surface and is left) ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- On the pair page, Right reaches Forget every phone and Left comes back to Pair another, as the two buttons stand side by side; Down and Up still work ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- The phone's paragraph panel has one send for a single paragraph, Analyse on the TV: the bottom bar no longer adds a second Read this beside it (several paragraphs keep Read all and This paragraph only) ([docs/concepts/STICK-WALK-2026-10-23.md](docs/concepts/STICK-WALK-2026-10-23.md)).
- The landing's pairing card (code and address) is smaller and stands right of the world's name, so it no longer covers "Math Buddy" or "Essay Master" while no phone is paired; the Select curtain covers the screen on its first frame instead of growing over the old landing; the ambient clock no longer flushes style on every tick, about 25 ms of the stick's main thread every 66 ms ([docs/concepts/STICK-PERFORMANCE-2026-10-22.md](docs/concepts/STICK-PERFORMANCE-2026-10-22.md)).
- On a lamp move the landing's old world is gone at once instead of sliding out while the new one slides in: the first-frame freeze on the Fire TV stick falls from 190-280 ms to about 175 ms ([docs/concepts/STICK-PERFORMANCE-2026-10-22.md](docs/concepts/STICK-PERFORMANCE-2026-10-22.md)).
- The landing's bottom bar no longer re-rasters the whole shelf on each lamp move: its pieces are their own layers and only transform and opacity animate (the tile's saturation and shadow and the Continue button's colour switch at once), so a move's GPU raster on the Fire TV stick falls from about 590 to about 320 ms ([docs/concepts/STICK-PERFORMANCE-2026-10-22.md](docs/concepts/STICK-PERFORMANCE-2026-10-22.md)).
- The landing's looping art (drifts, bobs, keys, bars, bell, motes) runs on one 15 Hz clock instead of 60 fps: on the Fire TV stick any running animation kept the whole scene drawing every frame, so idle render cost falls about 3x on every module (Math Buddy 243 to 81 ms/s, Linga 553 to 169, Essay Master 177 to 63), and the title no longer forces a layout pass on each lamp move ([docs/concepts/STICK-PERFORMANCE-2026-10-22.md](docs/concepts/STICK-PERFORMANCE-2026-10-22.md)).
- Essay Master's lens home has a door to Writing (Write from a prompt), so the screen has a way in again; Back from Writing returns there. A pair screen opened with a stale back of pair now leaves for the desk, and an empty maths page says what to do next. A new rules suite, tools/flow-audit-test.cjs, holds the keymap to no dead ends (Back leaves every screen, Back comes home, every screen has a door).
- The TV's waits are drawn in the look of the module the learner is in: the screen before the session arrives takes the last module this browser drew (else a neutral ground) and a page of Linga's or Essay Master's being read waits in that module's ground, instead of flashing On Air's grey grid ([LOADING-STATES-THEMING-2026-10-22.md](docs/concepts/LOADING-STATES-THEMING-2026-10-22.md)).
- A Select that needs the phone, with no phone live, now opens the pairing page for that wish instead of being ignored ([docs/concepts/PHONE-BLOCKER-PAIRING-2026-10-22.md](docs/concepts/PHONE-BLOCKER-PAIRING-2026-10-22.md)): the page says what the phone is for ("To paste or say your paragraph, pair your phone"), or that a paired phone is not here. When a phone joins or returns, the TV goes back to the same screen and lamp and runs the Select again; Back gives it up. New session field `pairFor` with events `pair.for` and `pair.clear` (TV only); the rule is `lib/rules/pairBlock.ts`, the suite `tools/phone-blocker-test.cjs`.
- TV sizing research and audit ([docs/concepts/TV-BREAKPOINTS-2026-10-22.md](docs/concepts/TV-BREAKPOINTS-2026-10-22.md)): the 1920x1080 stage fit and 5% safe area already match the Fire TV, Android TV and Tizen guidance at 720p, 1080p, 4K and ultrawide; the two Essay TV labels that sat at 18 px are now 22 px.
- Essay Master is the one writing tile on the landing: Writing is no longer a second tile beside it (it read as a duplicate). The Writing screen stays in code, off the desk, until it is folded into Essay Master.
- Writing: the finish step re-reads the revision with the same code that picked the coaching focus. A revision that only moves spaces or punctuation is refused, the episode stores whether the focus now holds, and the history line says so ("coached on evidence; the revision now gives evidence" or "still needs evidence") instead of claiming a revision it did not check.

- Faster module switching on the stick, passes 2 and 3: the stage is fitted with `zoom` again (landing GPU tiles 107 to 71 MB), and each world's sky, hills and side cliffs are drawn once into canvases instead of rastered on every move. A lamp move's longest frame gap fell from 641-669 ms to 271-283 ms and Back from 500-572 ms to 228-378 ms; the bitmaps stay resident inside a module (about 46 MB more GPU memory). See [STICK-PERFORMANCE-2026-10-21.md](docs/concepts/STICK-PERFORMANCE-2026-10-21.md).
- Writing on the TV: a Writing stop on the landing and a remote-driven Writing screen inside /tv (prompt list, chosen prompt, progress and the coaching note). The paragraph and the revision are typed on the phone through a named `writing` hand-off, and the episode is saved to the learner's record. No APK change. See [TV-WRITING-SCREEN-2026-10-21.md](docs/concepts/TV-WRITING-SCREEN-2026-10-21.md).
- An audio audition for the desk, not wired in: 24 button and moment effects in three material families and five calm module themes from ElevenLabs, triaged on [desk/audio/audition/index.html](desk/audio/audition/index.html). Generated by the guarded `tools/audio/` tool, with its own ledger.
- Math Buddy can read a photographed page without Ollama: `DESK_VISION_ENGINE=claude-cli` reads it with the Claude CLI on the subscription (the page goes in inline, the model gets no tool), and `codex` is wired too. Unset, the desk still reads with Ollama. See [Engines](desk/README.md#engines-all-local-all-swappable).
- The live model-drift watch: the lab bench on the real engines, recorded weekly in [uat/drift/](uat/drift/README.md). See the harness section.
- A degraded-engine drill ([engine-degraded-fixtures.json](tools/engine-degraded-fixtures.json)): prose, empty, wrong-typed, out-of-range and failed engine answers go through the real read, hint and lesson routes, and the TV's fallback is checked. Three gaps are recorded as todo: a blank hint card, an inverted page band and a blank page item ([AI_HARNESS.md](docs/AI_HARNESS.md)).
- Adult Linga is camera-ready: the TV says when a pitched scene is being shaped and when Cut is writing notes (not "the partner is preparing"), the conversation's four doors sit two by two so the partner's line stays on the stage, the tape of notes has its own layout with the Take Two branch under it, and a take no longer shows the scene's saved-fix count ([docs/concepts/ADULT-LINGA-FILM-BEATS.md](docs/concepts/ADULT-LINGA-FILM-BEATS.md)).

### 2026-09-30: Family Phase 1 complete, Adult mode chosen

- Family Phase 1, waves W1 to W10, is complete ([FAMILY-PHASE-1-PLAN.md](docs/FAMILY-PHASE-1-PLAN.md), "Phase 1 complete").
- The owner chose Adult mode "Take Two", and its implementation plan was written ([ADULT-MODE-TAKE-TWO.md](docs/concepts/ADULT-MODE-TAKE-TWO.md), [ADULT-MODE-IMPLEMENTATION-PLAN.md](docs/concepts/ADULT-MODE-IMPLEMENTATION-PLAN.md)).

### 2026-09-29: Calculus 1 course path, Family owner decisions, a new landing

- Calculus 1 became a Math Buddy course path. Its verdicts are decided in code ([MATH-COURSE-PATHS.md](docs/MATH-COURSE-PATHS.md), [CALCULUS-1-SYLLABUS.md](docs/CALCULUS-1-SYLLABUS.md)).
- The owner's decisions for Family Phase 1 were recorded ([FAMILY-PHASE-1-PLAN.md](docs/FAMILY-PHASE-1-PLAN.md), "Owner decisions, 2026-09-29").
- A new Study Desk landing replaced "Left on the Desk" ([DESIGN-STUDY-DESK.md](docs/DESIGN-STUDY-DESK.md)).

### 2026-09-25: Screen inventory re-read from code

- The screen inventory was re-read from the code on main ([STUDY-DESK-SCREENS.md](docs/STUDY-DESK-SCREENS.md)).

### 2026-09-24: Module landings chosen

- The Linga, Math Buddy and Essay Master landings were chosen in design contests ([DESIGN-LINGA.md](docs/DESIGN-LINGA.md), [DESIGN-MATH-BUDDY.md](docs/DESIGN-MATH-BUDDY.md), [DESIGN-ESSAY-MASTER.md](docs/DESIGN-ESSAY-MASTER.md)).

### 2026-09-15: UAT for Linga

- The `uat/` overlay was adopted for Linga, with the LT (text-live) level running on codex. The first five LT runs were recorded under `uat/runs/2026-09-15-*` ([uat/README.md](uat/README.md), [0008](.ai/memory/0008-uat-lt-runs-on-codex.md)).

### 2026-09-08: "Check my work" in scope

- "Check my work" was overturned from out of scope to in scope ([STUDY-DESK-SCOPE.md](docs/STUDY-DESK-SCOPE.md)).

### 2026-09-07: Direction, PoCs, identity and the M0 prototype

- The Study Desk direction was chosen ([STUDY-DESK-SCOPE.md](docs/STUDY-DESK-SCOPE.md)).
- Its feasibility PoCs were run against kill criteria set beforehand ([STUDY-DESK-POC-RESULTS.md](docs/STUDY-DESK-POC-RESULTS.md)).
- The On Air identity was chosen ([DESIGN-ON-AIR.md](docs/DESIGN-ON-AIR.md)).
- The M0 functional prototype was built ([DESK-PROTOTYPE-PLAN.md](docs/DESK-PROTOTYPE-PLAN.md), "Status — 2026-09-07").

## Telestrator

`core/`, `tv-app/` and `companion/`: the original PoC, where a phone draws on a paused video frame on the TV.

### Unreleased

- The TV makes sound: Select and Back, the phone joining, a hint card arriving, the walk's verdict (only as the card shows it) and the break each have a short effect, and a calm track plays on the desk home and the break, ducked under the voice. A Sound button on the bench turns it off. The owner's picks from [the audition](desk/audio/audition/index.html), levelled into `desk/public/audio`; the rule is `desk/src/lib/desk/sounds.ts`.
- A debug-only voice probe in `tv-app` (speaks six desk lines at two rates, tries the remote mic through `SpeechRecognizer`, writes `voice-probe.json`) and the native voice design it serves: [NATIVE-VOICE-STACK.md](docs/concepts/NATIVE-VOICE-STACK.md). The Stick run is the operator's.
- `tv-app` remote and transports: a held OK, Up or Down acts once (only the scrub keys follow a hold); a TV remote's separate Play and Pause keys work; a relay the TV cannot reach says so on the card instead of showing a QR; the pen socket drops any frame over 64 KiB unread; a release build ignores another app's relay launch extras.

### 2026-10-05: Relay pairing follows the socket

- The relay's pairing followed the pen instead of the socket. A relay channel's conversation is now shared: no hello deadline, and every hello is a (re)pairing. A late phone pairs, and a second phone is PIN-checked ([PLATFORM-RISK.md](docs/PLATFORM-RISK.md), Decisions).

### 2026-09-23: Pairing and heartbeat moved into core

- Pairing and the heartbeat (`PenConversation`, `Heartbeat`) moved into `core/` as a sans-IO state machine, covered by `:core:test` ([PLATFORM-RISK.md](docs/PLATFORM-RISK.md)).

### 2026-09-07: Hardware run, sports analytics closed

- The PoC ran on a Fire TV Stick 4K: hardware decode was proven and three bugs were found ([POC-FINDINGS.md](docs/POC-FINDINGS.md), §7).
- The sports-analytics direction was closed. The domain-neutral frame-analysis lessons were kept ([FRAME-ANALYSIS-LESSONS.md](docs/FRAME-ANALYSIS-LESSONS.md), [0002](.ai/memory/0002-sports-direction-closed.md)), and the fallback directions were scored ([USE-CASE-OPTIONS.md](docs/USE-CASE-OPTIONS.md)).

### 2026-09-06: PoC verdict: no blocker

- The whole slice built and ran, and the verdict was "no blocker. Go." ([POC-FINDINGS.md](docs/POC-FINDINGS.md)).
- The transport was put behind one interface with LAN and relay implementations ([PLATFORM-RISK.md](docs/PLATFORM-RISK.md), [0004](.ai/memory/0004-two-transports-one-interface.md)).

## Repo and agent harness

The agent contract, CI and the evals that cover every product.

### Unreleased

- Death Ride was cut from the repository (2026-10-22): it cannot be finished within the hackathon term. `deathride/`, its concept docs, its CI jobs and its Stick frame budget are gone from main; the game's history stays on the `deathride/main` branch and in git before this change ([0022](.ai/memory/0022-death-ride-cut.md)).

- Governance sweep (2026-10-21): `tools/gradlew.cjs` starts the wrapper by its absolute path (it failed before Gradle started under `NoDefaultCurrentDirectoryInExePath`); the desk layering check runs in `repo-guardrails.yml` again, its three breaks on main listed as owed; `quality.yml` also runs on main and runs the stick app's tests; the never-commit guardrail sees `desk/.env.local` and keystores; `SECURITY.md` ticks only what a workflow runs; `scripts/model-drift.ps1` survives an engine warning on stderr; every `tools/*-test.cjs` must run somewhere (`tools/suite-wiring-test.cjs`).
- CI repair after the ascent/runner harvest (issue #12): `supply-chain.yml` no longer has the dependency-graph job (the repository's dependency graph is off), `ai-conformance.yml` is the weekly report only (`conformance-gate.yml` is the per-PR verdict), `capabilities-pr.yml` runs by hand only (test-desk exceeds the doctor's 180 s budget), and the `quality.yml` desk job installs `tools/` dependencies; two Windows-only assumptions in `tools/maths-rules-test.cjs` and `tools/engines-rules-test.cjs` now hold on Linux too.
- A live model-drift watch:
  - `tools/model-drift.cjs` records each live lab-bench run in [uat/drift/](uat/drift/README.md) and compares it with the last one.
  - `scripts/model-drift.ps1` runs it weekly on the operator's machine.
  - `.github/workflows/model-drift.yml` goes red when the newest record drifted or is older than 21 days ([0014](.ai/memory/0014-model-drift-watched-weekly.md)).
- This changelog ([0015](.ai/memory/0015-one-changelog-dated-milestones.md)).
- Every same-repo PR now proves the manifest capabilities and holds committed `verified` flags to that run (`capabilities-pr.yml`). The agent-contract verdict now fails only outside documented waivers (`conformance-gate.yml`, `scripts/doctor-gate.mjs`) ([0016](.ai/memory/0016-capabilities-proven-per-pr.md)).
- A PR that changes a prompt, an engine or a rule the lab bench runs now carries a live drift record, held to the base's newest one before merge (`model-drift-pr.yml`, `tools/model-drift-pr.cjs`) ([0017](.ai/memory/0017-prompt-prs-carry-a-live-record.md)).
- An agent-task issue form: acceptance criteria and the gates per surface are required fields ([agent-task.yml](.github/ISSUE_TEMPLATE/agent-task.yml), [CONTRIBUTING.md](CONTRIBUTING.md)).
- `repo-guardrails.yml`, a new workflow:
  - The desk's layering is a failing check (`tools/desk-boundaries.cjs`): engines are a leaf behind their entry modules, rules reach no engine or Node built-in, only engines spawn, only the session writes ([0018](.ai/memory/0018-desk-import-boundaries.md)). It shares one import scanner with the model-drift check (`tools/import-graph.cjs`).
  - Every separate build has a guidance overlay (`tools/guidance-overlay-test.cjs`).
  - Agent authorship is read from `Co-Authored-By:` and `Agent-Lane:` trailers (`tools/commit-provenance.cjs`). PR commits that record it only in prose are annotated ([0019](.ai/memory/0019-commit-provenance-trailers.md)).
- A real [SECURITY.md](SECURITY.md): private vulnerability reporting, response times for a solo owner, the scope, and an honest guardrail list. `tools/security-policy-test.cjs` fails when it slips back to a template or ticks a guardrail no workflow runs.
- The TV APK carries a CycloneDX SBOM attested against the same APK (`sbom.yml`, `tools/gradle-sbom.cjs`), and the desk an `npm sbom` inventory ([CONTRIBUTING.md](CONTRIBUTING.md), [0021](.ai/memory/0021-apk-sbom-from-gradle-report.md)).
- `harness-drills.yml`, a new workflow: the security policy check, the SBOM converter suite, the Stick frame budget and the degraded-engine drill.

### 2026-10-05: The AI-native standard

- `.ai/` was adopted: the manifest, the doctor and the memory ([0001](.ai/memory/0001-adopt-ai-standard.md)).
- Decision records 0002 to 0013 were written.
- The agent guidance ([AGENTS.md](AGENTS.md)), the harness index ([AI_HARNESS.md](docs/AI_HARNESS.md)) and the Definition of Done ([CONTRIBUTING.md](CONTRIBUTING.md)) were written.
- The workflows were set up: quality, ai-conformance, weekly capabilities ([0012](.ai/memory/0012-capabilities-proven-weekly.md)) and supply-chain.
