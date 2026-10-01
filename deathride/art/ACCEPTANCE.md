# Art acceptance evidence

P2, 2026-10-01. **The four named historical defects are caught. No asset is owner-accepted by this pipeline.** Threshold authority is `gates.json`; the numbers below are measured report excerpts, not additional configuration.

| Historical sample | Measurement | Failure |
|---|---|---|
| Trail | principal axis 21.7407 degrees; local models also observe three-quarter view | AXIS_NOT_X; semantic owner routing |
| Bastion | right margin 16/1024 pixels (0.015625) | CROPPED_OR_MARGIN |
| Asphalt | exported-tile autocorrelation peak 0.95569 at half-height shift | TILE_REPETITION |
| Oil | autocorrelation 0.41248; edge means x/y 0.08702/0.13933; peaks 0.63137/0.66275 | TILE_REPETITION, TILE_SEAM_MEAN, TILE_SEAM_PEAK |

`reports/owner-tests-deterministic.json` contains all five original cars and five original tiles. Source and exported-pixel metrics are separate. Raw sprite margin is checked before trimming; a cropped source cannot pass by adding transparent padding. PCA measures an axis, never nose direction or camera projection. `*-acceptance.json` combines current deterministic measurements with both actual local grader responses; `contact-sheets/*-owner.png` shows every failure code. `processed/*/*-repeat.png` provides real 2x2 tile previews.

Extraction records the measured border key, despills edges, preserves enclosed highlights on neutral backgrounds, trims to art, preserves aspect, scales from the W6 dimensions, records the art-derived pivot, and adds power-of-two cells and RGB extrusion under transparent gutters. No sprite is stretched to force its aspect into compliance. Palette distances use CIE Lab against the shared role colours and derived shades. Family palette/silhouette questions are a separate small VLM schema. Damage/frame pivot inheritance is a P3/P4 gate, not claimed from a single image.

## Calibration and grader limits

The seam diagnostic uses five manually inspected **agent-labelled** shipping-size 2x2 previews: asphalt/gravel have no clear seam but conspicuous repetition; ice, kerb and oil show seams. The fitted provisional threshold catches 3/3 labelled seams and falsely flags 0/2 labelled non-seams. This is training-set separation on five examples, **not held-out or human calibration**. Labels, source hashes, metrics and rates are in `calibration/seam-diagnostic.json`.

The semantic diagnostic has 30 images (28 natural images and two explicitly declared mutations). Four fixed categorical fields give 120 observations per model. Agent labels were frozen before grading. These are **not owner or human labels**; the plan's human-labelled calibration remains pending.

| Local model | Defect fields missed | Clean fields falsely flagged | Uncertain fields | Ungraded images |
|---|---:|---:|---:|---:|
| mimo-9b:q8-64k | 5/8 (62.5%) | 9/112 (8.04%) | 0 | 0 |
| qwen3.8:27b-64k | 1/8 (12.5%) | 12/112 (10.71%) | 5 | 0 |

These are field-level diagnostic false-clean/false-defect rates, not asset acceptance rates. Error rows are retained in `calibration/diagnostic-results.json`; human false-accept and false-reject rates are **not measured**. Both installed models report Qwen-family architecture, so they are not independent-family validation. They miss lettering, confuse applicable fields, and disagree about overhead views. High self-reported confidence does not repair that. Disagreement, low confidence, uncertainty, missing/schema-invalid output and missing human calibration all route to the owner. Agreement never produces acceptance.

The initial Qwen run emitted confidence=100 despite a 0..1 schema bound. Those outputs failed closed. The revised schema enumerates allowed fractional values, raw returned content is retained, and the full diagnostic was rerun. Initial reports remain under `reports/initial-schema-*`; a concrete failure is in `calibration/qwen-schema-probe.json`. Icon briefs were clarified from internal weapon names to visible objects before the final run; the pixel inputs and frozen labels stayed unchanged.

## Corrective generation

Six purposeful Grok calls in P2, with one-image proofs and visual inspection before siblings. Explicit empty-material language removed vehicle intrusion, but gravel and oil then showed repeated quadrants. A final single-unrepeated-tile instruction cured oil's repetition (0.84345 to 0.06462). Gravel still fails (0.86596 then 0.90128) and has exhausted three attempts across revision IDs. Its lower-score v2 remains the recorded best rejected candidate. No fourth attempt is authorized by the driver. Ice v2 and kerb v2 pass exported-pixel gates; aesthetic and owner acceptance remain pending.

The ledger is 22/180 image reservations for the week, including four interrupted reservations inherited by this session; 158 remain, zero videos, no quota error. P2 spends six of those reservations. `remedies.json` distinguishes measured keying from experimental prompt changes; rejected outputs stay in history and never silently become references.

Seventeen Python content/contract tests pass, including historical regressions, malformed/empty/cropped/vertical inputs, seam peaks, internal repetition, both grader schemas, disagreement and budget limits. Required `:core:test :link:test :app:assembleDebug` tasks are green (`p2-build.txt`). Stick memory, frame timing, heading appearance and owner quality are **not measured in P2**. Runtime integration is I1.
