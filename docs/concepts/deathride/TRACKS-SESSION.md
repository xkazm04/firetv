# Track design session

Branch `deathride/tracks`; worktree `C:/Users/kazda/kiro/firetv-deathride-tracks`. No pushes, paid generation or device use. T2/T3 remain gated until the AI/pacing merge and later owner review.

## T0 — 2026-10-04 — Research and design language

Read the master first, the named registry notes from their specified read-only roots, and the current geometry, simulation, combat and content. Researched public arcade/kart/combat-racer design and accessibility sources. `T0-track-design-research.md` records the source ledger, car-unit grammar, combat phrases, theme dialects, timing/rhythm proposals and measurement/evidence boundaries.

Found 25 layouts; the finale uses Crown, so T1 must expose an arena **mode view** rather than invent a 26th layout. Current shortcuts are lane bands, and consolidated campaign lap counts vary. No course or gameplay data changed.

Validation: `:core:test :link:test :game:test :app:assembleDebug` with `-PappId=dev.deathride.tracks`; offline audio index browser baseline at 1440 and 390 pixels (links, media, overflow, script errors and no remote requests). Evidence in `deathride/evidence/tracks/t0`. An initial PowerShell argument quoting error invoked an invalid Gradle task; quoted properties corrected the command before the successful run. No device install.

## T1 — 2026-10-04 — Instruments

Added a tool-only core quality runner, data-driven instrument rules and diagnostic gates, cyclic geometry/grammar metrics, five-tier actual reference laps, and 12 seeds ×6 identity rotations for each of 25 courses plus the Crown arena mode view: **1,872 six-car AI-only trials**. Per-trial assignments, state/trajectory hashes, heatmaps, pressure samples and outcomes are archived as gzip NDJSON. All 26 repeated-seed checks and 90-degree geometry checks pass; reference-driver rotations stay inside the authored tolerance. Six planted bad courses plus threshold boundary fixtures supply **25 gate witnesses**. Independent seed halves and identity rotations are cross-checked rather than assumed equivalent.

The atlas provides a comparison matrix, minimaps, contact/wreck/spin/speed/line/trap maps with numerical section tables, grammar tags, reference laps, reward access, obstacle/surface load and combat attribution. Keep/Maybe/Reject choices and notes persist locally; Copy Markdown follows the audio review format and has a tested clipboard fallback. No picks are prefilled.

Track Lab is the justified faithful desktop alternative: a browser editor backed by the actual JVM spline, linter and six-car World. It supports point dragging/insertion/removal, width and surface fields, CSV edits for surface features, obstacles and pickups, live lint, undo/redo, seeded quick races with replay/heatmaps/reference lap, and ZIP export in the existing CSV schemas. It never saves into course data. All 25 courses round-trip through its codec. Edits invalidate old simulation evidence.

Measured findings: **24/25 courses exceed the proposed 20% early lead-slot AI wreck threshold** (course range 18.1–48.6%). Spillway's identity rotation spread exceeds the authored tolerance; seed-half differences do not. These are stock Pro-AI surrogate findings, not human fairness or feel. Explicit hunter intent remains unavailable on this pre-merge branch, so trap locations are labeled proxies. Campaign duration acceptance remains for the AI merge/T2, because this instrument uses three laps and the existing campaign has variable lap counts. No course data or gameplay parameters were changed to remove flags.

Validation: **171 core +8 link +37 game tests, zero failures/errors/skips; `:app:assembleDebug` green** with `dev.deathride.tracks`. Browser checks passed at 1440 and 390 pixels, light/dark atlas, all map layers, filters, persistence, denied storage/clipboard, escaped Markdown, actual backend lint, point dragging, surface/pickup/obstacle edits, malformed feature rejection, undo/redo, ZIP round-trip, race/replay and evidence invalidation. Testing caught and fixed duplicate input history entries and long-schema mobile overflow; the final checks pass. Evidence is in `deathride/evidence/tracks/t1`; report artifacts in `deathride/tracks/atlas`. Existing gameplay data remains identical to base commit `ae0f41d2de3c661ad682fa98953020d6c2eda3e8` (Git tree `aaf93e5524ed7b9127a49730e1692918a4c219c0`).

No Stick, Grok, ElevenLabs, registry writes or push. T2/T3 remain gated. Start the Lab from `deathride` with `.\gradlew.bat :core:trackLab --console=plain`. Owner pages:

- file:///C:/Users/kazda/kiro/firetv-deathride-tracks/deathride/tracks/atlas/index.html
- file:///C:/Users/kazda/kiro/firetv-deathride-tracks/deathride/tracks/lab/index.html
