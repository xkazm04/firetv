# Death Ride (deathride/): what is specific here

The repo-wide authority is [../AGENTS.md](../AGENTS.md): constraints, the working agreement and the Definition of
Done. When the two disagree, that file wins. This file only holds what differs inside `deathride/`.

## It is a separate build

- `deathride/` has its own Gradle 9.8.1 wrapper, `settings.gradle.kts` (`:core`, `:link`, `:game`, `:app`,
  `:desktop`) and `gradle.properties` ([.ai/memory/0009](../.ai/memory/0009-deathride-standalone-build.md)).
- Run every task **from this directory** with this wrapper (`.\gradlew.bat` on Windows, `./gradlew` elsewhere).
  `node tools/gradlew.cjs`, the root `gradlew` and the `.ai/manifest.yaml` capabilities cover only the root build. A
  Death Ride task run through them fails or builds the Telestrator instead.
- Never add it to the root `settings.gradle.kts`, and never make a root module depend on it.
- Never run Gradle from two worktrees at once. The daemons hold files open.
- Unlike the root, `gradle.properties` here has no `org.gradle.java.home` pin. Any JDK 17 or newer works.

## Gate

| You touched | Run from `deathride/` before proposing |
|---|---|
| anything under `deathride/` | `.\gradlew.bat :core:test :link:test` |
| `app/` (Android) or a resource it packages | the above, plus `.\gradlew.bat :app:assembleDebug` |

Running `:desktop:run` (`--smoke`, `--keyboard-check`, `--soak`) is evidence, not the gate. A green desktop run or JVM
test does not prove Stick frame time, Wi-Fi delay or feel ([PITFALLS](docs/concepts/DEATH-RIDE-PITFALLS.md), "Scope of
truth").

## Stick frame budget

Frame time on the Stick is held to a committed budget, [perf/frame-budget.json](perf/frame-budget.json). Its ceilings
are the accepted P8 delivery soak plus a stated tolerance, so it is a regression ratchet and not the 16.7/33 ms target,
which stays open by owner decision ([.ai/memory/0020](../.ai/memory/0020-stick-frame-budget-is-a-ratchet.md)).

- A desktop soak is not a proxy for this budget. It runs vsync-capped on a far faster GPU. Only a Stick soak counts.
- After a Stick soak (`tools/integration-soak.mjs` or the perf probes, then `python tools/perf-summary.py <raw>`), run
  `node tools/frame-budget.mjs <summary.json>`. It exits 1 and names the scene, the metric and the delta for every
  ceiling the soak breaks.
- A soak that holds the budget and stands for the build joins the budget's `records` with its `sourceSha256`. When it
  beats a ceiling, tighten that ceiling. Never loosen one to let a change through.
- `node tools/frame-budget.mjs` with no argument re-checks every record, and `node tools/frame-budget-test.mjs` is the
  check's own suite. Both read files only and run in CI (`.github/workflows/harness-drills.yml`).

## Which app you are building

The application id and label come from, in order:

1. `-PappId` / `-PappLabel` on the command line.
2. `deathride/gradle.properties`. Today this is `dev.deathride.tracks` / `Death Ride Tracks` on race port 8774, the
   isolated track stream, which never installs over the integration app.
3. The fallback in `app/build.gradle.kts`.

To install over the reference build on the Stick (`dev.deathride.tv` / `Death Ride`), pass both properties. Quote the
whole argument in PowerShell: `.\gradlew.bat :app:assembleDebug '-PappId=dev.deathride.tv' '-PappLabel=Death Ride'`.
Check `gradle.properties` before any `adb install`. A wrong id installs a second app beside the one the owner tests.

## Layout and boundaries

- `core/` is the pure-JVM, deterministic 60 Hz simulation and has a zero-allocation gate. `link/` is the phone
  controller protocol. `game/` is the libGDX renderer and screens. `desktop/` is the dev host. Only `app/` imports
  `android.*`. Keep it that way, so `:core:test` and `:link:test` stay plain-JVM.
- Data the game loads (tracks, regions, campaign, narrative) lives in the top-level folders here. Generated proof
  goes to `evidence/`, not beside the source.

## Docs, decisions and owner gates

- Start at [docs/concepts/DEATH-RIDE-STATUS.md](../docs/concepts/DEATH-RIDE-STATUS.md). Owner rulings that bind are
  in the `DEATH-RIDE-OWNER-DECISIONS-*` logs next to it. Never re-litigate one in code.
- Feel, art and audio are certified only by the owner ([OWNER-CHECKS.md](OWNER-CHECKS.md)). Report them as pending,
  never as passed.
- A noticeable change adds a line under `## Death Ride` / `### Unreleased` in [CHANGELOG.md](../CHANGELOG.md).
