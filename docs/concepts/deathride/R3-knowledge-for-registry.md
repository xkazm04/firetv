# Draft knowledge: combat-racer track authoring after an oval-library rejection

Draft only. Nothing was written to the registry. Evidence and final status belong to `R0-track-craft-research.md`, `R1-shape-instruments.md`, `R2-layout-composer.md` and `R3-candidate-library.md`.

## Shape is an independent design contract

Curvature entropy does not distinguish a road course from a rounded perimeter. Measure nonlocal use of the footprint: track length against convex-hull perimeter and area, antiparallel nearby passages, reversals, signed-turn sequences and explicit route topology. Plant circles, stretched ovals, rounded rectangles, plus blobs and transformed duplicates. A report without actual rejected witnesses is not a gate.

Even these measures need a visual rejection pass. The first R3 choices were non-ovals but repeated too many E and U silhouettes. Tightening the normalized outline distance and rejecting same-slot U siblings improved the choices. Family names do not prove different topology. Keep the rejected outlines and reasons so subsequent tuning cannot quietly restore them.

## Work in car units, then inspect the baked road

The current widest body is 4.65 m and the longest is 9.3 m. A 27 m road hides too much corner structure. Technical widths near four widest-car widths, with deliberate five-width passing releases, preserve an actual lane decision. A final needs more road and richer sequencing, not a uniformly larger ribbon or another lap.

Author-radius values are not the game spline's minimum radius. Equal-distance resampling and the final Catmull-Rom bake can tighten a nominally legal bend. Check the baked curvature and body clearance; the R2 nominal 2.7 L experiment failed at 1.68 L after baking. Tangent fillets with room on both adjacent edges, variable-width transitions and a clear launch straight provide a controllable starting point.

## Route topology must exist in simulation and presentation

An intersecting polyline is not a bridge. A declared junction needs passage identity, no checkpoint/lap jumps, clear approach warnings and collidable crossing traffic. A split needs a real alternative ribbon, joins, canonical progress, route-aware projection/containment and the same geometry in the renderer and minimap. Test several laps so every car traverses both branches. An explicitly unsupported bridge is better than a drawing that lies about collision.

The AI's chosen route must be reconciled with the ribbon physically under the car after a shallow fork or shove. Otherwise steering can aim across the gap while collision constrains the car to a different road. The R3 split regression first failed on lap two; a one-lap screenshot would have missed it.

## Recovery is spatial design

Two repair icons separated by seven metres were still one collection opportunity: the pickup trigger includes the car's body-circle radius. At 10.4 m separation they become separate lanes. That requires a genuinely wide patch and room outside the solid-obstacle footprint; moving the pair into a nearby wide recovery zone is preferable to violating the road-edge clearance rule. Preserve the actual placements in exported CSVs, not only the anchor recipe.

Tune grid, release width, hazards and reward positions against six-car outcomes. Keep vehicle, weapon, hunter and pickup-value balance unchanged while asking a track-design question. Increased pickup density is an authored tradeoff that the owner still needs to feel, not evidence that more repairs are universally better.

## Timeouts are not pacing evidence

A two-minute headless winner does not prove a three-minute six-car race, and a long headless run does not prove that the app's shorter watchdog will permit it. Use the same lap count and race budget in the draft, native preview, export and simulation. Report clean traversal, actual lap-win times, elimination instead of laps, tail finish distribution and unresolved cars separately. Lengthen the road for a short winner; do not add laps to disguise it.

Use several seeds and rotate car/style identities through every grid slot. An exact replay hash and a rotated-geometry reference catch different failures from statistical fairness. The lead-slot AI is a surrogate, not a measurement of human fairness. A three-second combat stall can end in recovery or a wreck; it is distinct from a clean car unable to complete the road.

Evidence cache keys must include the grid/start fraction and relevant simulation version as well as exported geometry. A layout's node CSV did not change when its launch moved; the old cache wrongly treated that experiment as already proved. Invalidate and rerun, then test the cache contract explicitly.

Re-run the shape contract after every pacing edit. Stretching two Foundry candidates made their baked corners lose the required hairpin classification even though physical lint and race timing passed. Restoring the tight returns and adding independent outward bays preserved both duration and distinctness. Proof and bundle tools now enforce shape gates themselves, before using cached evidence.

Separate arena traversal from the actual encounter. Six equal-tier cars completing laps establish a usable road; a supplied rig against one named boss is a different equipment and elimination contract. A six-car artificial elimination failure is not campaign evidence, and a six-car lap success cannot clear an actual duel timeout. Preserve both modes explicitly in the page, cache and export.

## Observe hunter intent explicitly

Nearby contacts and a slow leader are only a trap-opportunity proxy. The focused R3 evidence links actual `hunting=true`, a target matching the current leader, close corner perception, attributed HIT damage and sustained low-speed proximity. Ordinary hunters need not use boss-only tactic enums. This establishes an observed pressure episode; it does not prove that the hunter alone caused the slowdown without a counterfactual experiment.

The stricter active-block follow-up found zero qualifying episodes in 288 trials, despite three pursuit/compression observations in the earlier 216. Report that negative result. Intent plus damage and slow movement is not sufficient evidence that the runtime's deliberate corner-block command was active.

## Keep the owner decision intact

An outline sheet is evidence about shape; it is not a camera, sofa-readability or feel test. Preserve the one prior acceptance. Present proposed replacements with original stable event IDs, three alternatives, measurements, technical flags and no inferred Keep. The review must work offline, escape Markdown notes and export the exact data whose digest was proved. A busy shared Stick is a pending device check, not permission to stop another stream.
