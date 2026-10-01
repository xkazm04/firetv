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

## P4 final-export review, 2026-10-01

The final inventory has 73 review records: 69 technically selected assets, two seam-failed originals superseded by separately measured wrap derivatives, and two visually rejected ice exports. Every selected asset has two current hash-matched local-model observations and a specific direct-inspection note. The five animations additionally have two observations of their actual exported frames; source-sheet panels are never mistaken for final transparency. Export reviews retain a Qwen explosion false flag whose description itself enumerates the six requested phases. None of this supplies human calibration or owner approval.

Numeric edge gates missed the faint broad cross in ice v2, and ice v3 ignored the no-large-cracks brief. Both remain visually rejected with exact hashes in `manual-reviews.json`; report composition exposes those rejection codes. A fixed 768px centre crop of v2 removes the bright border lighting, passes unchanged edge/repetition gates, and was inspected as a real 2x2 repeat. All 768/512/256 crop trials remain available. This concrete miss limits the provisional seam calibration; edge numbers alone do not prove an aesthetically seamless field.

Heavy asphalt and concrete use eight-pixel opposite-edge blending, preserving their interiors; gravel uses the largest passing fixed source period after its generation cap. No threshold was loosened. Generated effect sheets required secondary key-panel removal, thin-edge despill and long white separator removal; actual frame occupancy, margins, key residue, differences and fixed pivots are tested. The single source-error quota incident was a numeric token-count false positive, recovered from its already successful image with no retry; the exact audit and regression tests distinguish that from a true quota stop.

Thirty pipeline tests pass. Four 1024-square atlases contain 172 regions, including 47 physical track-edge and 47 physical barrier cases; all 256 masks resolve. Five animations contain six frames each. Eleven wrapped ground textures and five separately loadable backdrops complete the 69-asset bundle. Declared residency is 30.75 MiB with one backdrop and two reserved car pages. libGDX 1.13.5 parses the atlases; that is a metadata check, not GL/gameplay validation. The existing 3072-square scenery target and other game allocations are excluded and must be addressed by I1/I2.

Final weekly ledger: 130/180 image reservations, 50 remaining, zero videos; 126 successful outputs and four inherited unknown-spend interruptions. This execution added 122 reservations, including 93 in P4. No actual quota error was observed. Unspent capacity is reported because the remaining 70 car state/livery jobs require owner reference approval and cannot fit the remaining 50-call budget in any case. Additional random variants would not resolve that dependency. Full-game Stick soak, integrated animation feel, human calibration and G2 remain not measured.

## V1 direction-choice evidence, 2026-10-01

The owner raised the cap to 350 and requested five comparable directions. Five seven-subject sets required 68 paid images including bounded corrections. All 68 attempts have unchanged deterministic gates and two hash-matched local observations: 136 actual responses, all schema-valid. The current 35 proofs have 28 owner-review verdicts and seven rejects; none is owner-accepted. Source margins, style hashes, export hashes, all attempts and direct observations are retained in `reports/v1-owner-review.json`, `reports/v1-attempts-deterministic.json` and `audits/v1-direct-review.json`.

Direct review rejected the Collage ground's white border even though its final edge/repetition arithmetic passes. The Hot Ink ground retains a framed crack motif; Soot Pulp retains a conspicuous patch. Three current cars fail source margins at the three-attempt ceiling. A pale Rust and Ink burst lost its centre during keying and was corrected with a magenta source; two incorrect double-ended wrench silhouettes were corrected. These are content corrections, not relaxed thresholds. Models grade source semantics; actual exported effects and 96px/32px reads were additionally inspected by the executing agent. Human calibration and taste remain pending.

The portable owner entry is `review/v2/index.html`, with one board per direction, a five-column subject comparison, v1/v2 pairs and all 68 attempts. Chrome headless loaded every image at desktop and mobile widths without page errors or horizontal overflow. 33 pipeline tests pass, required core/link/APK tasks pass, and the historical bundle still validates at 30.75 MiB. No production atlas was changed. Weekly ledger now 198/350, 152 remaining, zero videos, stop clear. V2/V4 wait for the owner choice; damage/livery approval remains a separate gate.

## V3 surface evidence, 2026-10-01

Sixteen switchable experiments have two clean AFTKM repetitions each. Forty-four clean runs include three ground styles and matched controls for three APK revisions. Twelve completed captures from an interrupted/concurrently changed window are retained as diagnostics and excluded from costs. Every accepted session preserves the integration installation. The final readback has `dev.deathride.tv` foreground in its lobby; only the lab package was installed or stopped by this executor.

The live painted-ground/edge/decal combination measures 16.68/17.74 ms p50/p95. The all-layer, restrained, narrow-band and cached graded stacks remain held on frame cost. Caching preserves exact Stick pixels and lowers CPU submission by 1.59 ms against its matched control, but 16.86 ms median is still above nominal 16.7 ms. No threshold was relaxed. The 4 MiB course bake exceeds present art headroom; a proposed live edge/decal allocation would total 31.75 MiB, subject to actual chosen-kit packing and integrated measurement. Existing bundle residency stays 30.75 MiB.

`reports/v3-evidence-validation.json` checks raw sample lengths and medians, warmup/resolution, paired binary identity, source hashes, cached pixel equality, periodic wear work and memory accounting. Browser tests exercise all sixteen modes, style availability and the comparison slider at desktop/mobile widths. The 33 existing pipeline tests, required core/link/APK tasks and standalone lab builds pass. Exact-byte Git attributes repair provenance portability without changing grades, approvals, counts or source gates. No human style acceptance, full-game soak or V4 production approval is supplied by these experiments. V3 spend is zero; weekly reservations remain 198/350 with 152 available and the stop latch clear.

## Fusion roster evidence, 2026-10-01

Ten new references and six portraits are delivered at `review/fusion/index.html`. All 34 attempts have deterministic reports and two schema-valid local observations (68 actual responses). Seven cars and all portraits pass pixel gates. Comet, Quill and Kestrel remain explicitly rejected on source margin/aspect at the three-attempt ceiling; no source padding or stretching grants a pass. The actual 96px board shows solid heavy versus skeletal light silhouettes. Owner taste and human calibration remain pending.

Nine returned images required an audited recovery because the CLI stripped one terminal ASCII space. Exact requested/actual strings and sidecar hashes are retained; the original false verbatim flag is not rewritten. No new call, refund, budget change or latch clearing occurred. Source snapshots are byte-exact. Ten approval entries remain false, and seventy derived jobs demonstrably refuse before reservation. The approval format is `V2-REFERENCE-APPROVAL.md`; no damage state or livery was generated. Browser desktop/mobile, 35 pipeline tests and core/link/APK checks pass.
