# T1 — Track instruments

2026-10-04. Tooling only; no existing course, campaign, AI, weapon, obstacle definition or presentation data changed. T2/T3 remain gated. Research and authored targets are in [T0](T0-track-design-research.md).

## Deliverables and use

The offline [atlas](../../../deathride/tracks/atlas/index.html) contains 25 course cards and one explicitly shared Crown arena view, comparison metrics, six heatmap layers, grammar tags, detailed section tables, quality flags, and Keep/Maybe/Reject with notes. Copy Markdown follows the audio report's escaped table format, local persistence, no inferred choices, theme selection and clipboard fallback. It works directly from a file URL without a server or network.

The desktop [Track Lab](../../../deathride/tracks/lab/index.html) edits control points by dragging or numeric fields, interpolated width via node half-width, per-span surfaces, feature surface bands, obstacles, pickups and other spots. CSV text editors expose the existing data format, including removal and import by pasting. Undo/redo and reload original operate on the in-memory draft. Every valid edit calls the actual core bake and linter; invalid numbers/closure are rejected explicitly. A quick AI-only six-car race produces replay, lap/result time, pressure samples and heatmaps for the current draft. Editing invalidates the old race. ZIP export downloads existing-format CSV files plus validation and merge instructions; it never writes the repository.

This is the allowed **faithful desktop tool alternative** to a libGDX editor: a local browser canvas UI backed by the same JVM `Course`, `TrackLinter`, `World`, collision, AI, combat and surface implementations as the game. The browser does not implement a second spline or physics solver. This makes direct manipulation, CSV review and automated browser testing possible without changing the game renderer. The map and replay are diagnostic views, not claims about the final art, camera or sofa feel.

From `deathride`:

```powershell
.\gradlew.bat :core:trackQualityReport --console=plain
.\gradlew.bat :core:trackLab --console=plain
# Leave the service running, then open the file page or the printed localhost URL.
node tools/tracks-browser-check.mjs
```

The report defaults to 12 seeds ×6 identity rotations ×26 views = **1,872 AI-only six-car trials**. `-PtrackSeeds=N` controls samples (smaller reports explicitly fail the evidence sample gate). `-PtrackOutput=...` changes report output. `-PtrackLabPort=8794` changes the local HTTP service port; a file page uses the default port, while the served page uses its own origin. The service binds only to 127.0.0.1. It has catalog, analyze, race and download endpoints; no repository save endpoint.

## Measurement definitions

New tool-only Kotlin files live in `core/src/test/.../TrackQuality*.kt` and `TrackLabServer.kt`. Gameplay tables are read as authority. `tracks/quality-rules.csv` holds instrument parameters; `quality-thresholds.csv` holds diagnostic claims. Existing width/radius/straight limits are resolved from `TrackRules` at evaluation time, not independently tuned by the instrument. A missing measurement is `null`/unmeasured; it cannot pass a gate.

**Geometry.** All measurements consume the game's baked spline. Length and surface/curvature fractions use arc length. Full width doubles the stored half-width and divides by the widest roster body; radius divides by the longest. Cyclic connected runs preserve a corner or straight crossing the origin. Signed heading changes split turns left/right; changes under 10 degrees are ignored as corner noise. Radius-class entropy and cyclic transition entropy describe different aspects of the sequence. Hairpin/sweeper/kink, radius changes and compound/chicane/esses tags are algorithmic candidates, not claims that the owner authored those phrases. Complex shapes are still available as control points and maps.

**Passing zones.** For each significant corner, estimate a reference stock-car speed budget from curvature and surface grip. Require a ≥12% approach-to-apex reduction over an 8 L lookback and ≥5 W full width for 4 L beginning at the corner entrance. Publish width, length and speed drop. These are geometric candidates, not observed passes; the simulation measures passes separately. Existing obstacle lint remains the traversability authority. Compression is cyclic connected road below 4.2 W. Recovery candidates require asphalt, broad width and a canonical straight lasting ≥3 s at stock maximum speed; combat can still make them busy.

**Surface/obstacle load and rewards.** Surface share is by base ribbon arc length; feature bands and hazards are listed separately in course data. Obstacle footprint sums ellipse areas by NONE/DRAG/SOLID; it is not union area or fraction of traversable road blocked. Pickup access reports car-clearance and solid overlap at the pickup lane, with observed collections alongside it. Risk-line distance is measured along the authored offset lane and compared with centerline distance over the feature; lower grip is an explicit cost. Neither calculation proves a time saving or that the risk is worthwhile.

**Reference lap.** Actual Pro AI, one stock car at each of five tiers, five non-entered cars, combat disabled, two completed laps. Standing first-lap and flying second-lap times are distinct. A timeout yields no flying-lap time. The same named car per tier is used for comparison; this is a reference-driver result, not a tier-wide best lap. Pool-ineligible tiers are marked. Obstacles/surfaces remain enabled.

**Combat trials.** Actual World at 60 Hz, six nonhuman cars, eligible stock classes, Pro skill, six existing rival styles. Seeds change class offset and AI lane/noise. Each seed rotates class/style identities through all six slots. Standard report races use the core's three-lap default and a 180-second censoring limit; the Crown stress view uses elimination with a 360-second limit. The elimination reset applies the core's fixed rig in slot 0, and per-run assignments expose that. It does not model the actual campaign boss field or purchased upgrades. Actual campaign ids/lap counts are displayed; no three-lap measurement is presented as campaign duration acceptance.

**Position changes and overtakes.** Position changes sum absolute rank movements for active cars. They include promotions when a rival wrecks, and are intentionally distinct from overtakes. A confirmed pass reverses a live, unfinished pair's unwrapped progress order by at least 0.3 L for 0.5 s. Dead/finished pairs reset the counter; small sign jitter does not count. Field laps are sum of positive maximum progress gained per car / course length /6; car laps omit the /6. This includes partial traversal at timeout.

**Contacts, wrecks, spins and stuck.** Contact episodes consume the core's presentation events, including wall/barrier impulses and car contacts. A sustained same-pair/material scrape is one episode until it separates for 0.5 s. Contact rate divides by total active-car distance in km; section rates divide by live-car exposure in minutes. Wrecks use explicit events; first-wreck times exclude and count right-censored no-wreck runs. Spin counts are entries from the actual drift model's counter. Stuck is a continuous ≥3 s below 1.2 m/s after a 5 s launch grace. Count once per episode, not per tick.

A contact with a wreck or finished car counts when the other car is still active; inert-only collisions do not. Damage and deaths are also attributed by the core's damage kind, and weapon shots/deployments are retained. Solid-obstacle solver contacts are explicitly a separate, non-debounced counter, never substituted for contact episodes.

**Heatmaps.** 48 equal arc sections; nine lateral bins spanning road half-width, with off-road samples clamped into edge bins. Live unfinished cars are sampled at 10 Hz. Occupancy is a count; speed is exposure-weighted. Empty exposure yields null, shown gray. Contact/wreck/spin map legends show per-car-minute rates; the line map shows samples. Maps scale within each course, so cross-course comparisons use matrix/table numbers. Every map has text values and an explicit denominator. Finished and wrecked cars do not inflate line/speed exposure.

**Fairness and traps.** Early lead wreck is AI slot 0 wrecking before its first completed lap. Identity rotation reduces a fixed class/style bias but does not simulate human skill. The Wilson interval is descriptive: rotations sharing a seed are correlated. Independent seed halves and per-rotation rates are shown, with differences and authored tolerances. A trap opportunity needs the current leader below 55% of stock max speed, recent damage/contact, a live rival fore and aft within 3 L and within 2 W laterally, sustained 0.5 s. It is a spatial/outcome proxy; explicit hunter plans do not exist on this base branch. No “hunters proved” claim is made before the AI merge.

**Pressure.** Per-trial evidence retains two-second samples of time, slot-0 health fraction, cumulative damage received, contact episodes and wreck count. The Lab shows health and incremental damage rather than collapsing them into an invented feel score. The raw terms support later tension/rhythm review.

## Proof and evidence

`tracks/atlas/data.json` and `data.js` hold the offline report, input content digest and parameters. `trials.ndjson.gz` preserves every trial's assignments, seed, rotation, state and trajectory hashes, outcomes, pressure and full heat arrays. `gate-proof.json` contains six planted bad courses (narrow, continuous circle, overly gentle, unreachable pickup, crossing ribbon, blocked obstacle) plus lower/upper boundary witnesses for every diagnostic threshold. Synthetic adverse outcome fixtures are explicitly labeled; they do not pretend that a shape inevitably produces an outcome.

Every course/view repeats its first trial and requires equal final state and sampled trajectory hashes. Different-seed trajectory diversity is measured. A 90-degree geometry rotation requires matching length/width/radius/straight/corner/entropy metrics; a separate actual reference-driver lap comparison reports a 3-second tolerance. Identity rotation and independent-seed-half differences are retained, including “investigate” when they exceed tolerance.

The initial report is diagnostic. Current courses legitimately flag sparse grammar, limited passing candidates, sustained compression and early lead-surrogate deaths. This is evidence for T2, not grounds to change today's course data or relax the thresholds. No owner picks are synthesized.

Final evidence: 1,872 trials; 25/25 planted-course/boundary witnesses fired; all 26 replay and geometry-rotation checks pass, and all reference rotations stay within 3 s. Early lead-surrogate wreck rate ranges from 18.1% to 48.6% across courses, with 24/25 over the authored 20% flag. Spillway exceeds the identity-rotation spread tolerance; no seed-half comparison exceeds its tolerance. The descriptive intervals and per-rotation counts remain visible. These results do not certify human fairness.

Required validation passed: 171 core, 8 link and 37 game tests (zero failed or skipped), `:app:assembleDebug` for `dev.deathride.tracks`, and the atlas/Lab browser suite at 1440 and 390 pixels. Browser evidence covers light/dark maps, choices/notes, persistence, storage and clipboard failure fallbacks, Markdown escaping, actual live lint, surfaces/obstacles/pickups, malformed input, drag editing, undo/redo, ZIP import/export equivalence, seeded race/replay, and clearing stale race evidence on edit. No Stick check was used.

## Export boundary and later work

The export uses `xM,yM,halfWidthM,surface,aiLaneM` for nodes; existing spot, feature and obstacle schemas are retained. Spots are relative to the starting fraction; features/obstacles are absolute lap fractions. The feature/obstacle CSVs contain only the selected course's rows, so the ZIP includes explicit instructions to replace those rows when later authorized, never overwrite the full shared table. Grid and checkpoint structure, theme vocabulary and existing pools stay visible to lint.

T2 must merge `deathride/ai-pacing` first, rerun this report, inspect changed AI/physics/content provenance and then author courses for the actual event duration targets. T3 owns owner driving/sofa review, the optional isolated Stick check and the registry knowledge draft. No device check or subjective feel claim is part of this T1 evidence.
