# R2 — A composer for folded roads

The tool compiles a design sequence into the existing `TrackNode` centreline, then measures the **actual game spline**. The positive control is a 1,495 m folded road with three reversals, six turn-sign changes, five measured corner families, hull-perimeter ratio 1.36 and 42% fold-back proximity. Technical width is 3.8 widest-car widths (17.67 m); approaches expand to 5 W (23.25 m). It is a control for the authoring system, not a proposed opening-race duration.

## Design language and physical bake

`TrackComposer.kt` is tool-only. A recipe is CSV with `kind,a,b,c,widthW,surface`. Distances are longest-car lengths L = 9.3 m, full road width uses W = 4.65 m. These are full-roster conservative units, not the width of the smallest car.

| Primitive | a | b | c |
|---|---|---|---|
| start | x L | y L | heading degrees |
| straight | length L | unused | unused |
| corner / sweeper / kink | signed angle degrees | radius L | unused |
| hairpin / double-apex | total signed angle | radius L | intermediate straight L |
| chicane | first signed angle | radius L | straight between opposite turns L |
| esses | first signed angle | radius L | straight gaps; arcs are a, −2a, a |
| anchor | x L | y L | tangent-fillet radius L |
| junction | crossing x L | crossing y L | warning approach L |
| split | main start fraction | main end fraction | unused |
| rejoin | unused | unused | unused |

An anchor sketch is a convenience input, expanded into the same explicit straight/arc grammar; it does not smooth a polygon into a blob. Fillets consume their approaches, and an impossible fit is rejected with the anchor numbers and remaining distance. Coupled corners are named as chicane, hairpin or double-apex sequences. Open primitive sequences report position and heading closure errors. Width changes use smoothstep interpolation on straights. Surfaces must belong to the selected theme vocabulary. Equidistant control points keep line/arc boundaries stable in Catmull–Rom.

The spline check caught a real defect in a first positive control: a nominal 2.7 L radius could bake to 1.68 L at a transition. The retained control uses 3.6 L author radii and its measured minimum is 2.23 L. Authoring radius is therefore not substituted for the linter's baked-radius check. The existing 2 L hard floor and 3.6 W width floor remain.

The compiler locates a genuine straight long enough for all six oriented cars. Pickups use the current schemas; a theme landmark warns about a lower-grip inside band, where the existing risk-line validator permits it. Existing tyre and tree obstacles are placed only when obstacle lint preserves a usable road. These are existing art assets. Moving a grid to clear a split also revalidates obstacle placements.

## Real route semantics

An undeclared self-intersection still fails. `TrackJunctions` permits only an explicitly paired, coincident, substantially transverse crossing on straight approaches, with at least 45 m warning and no grid or feature conflict. Runtime projection uses the car's previous progress to preserve which passage it is traversing. The road renderer opens the barrier at the intersection. This is an **at-grade combat junction**, with car collisions; no elevation or bridge is implied.

A split block contains a complete alternative closed recipe, but only the declared interval is driven and rendered. Its ends must coincide with matching headings and widths. Alternative progress maps monotonically to the main checkpoint interval; it cannot add a checkpoint or lap. The main grid moves clear if necessary. AI cars alternate route choice by identity, seed and lap; this deterministic choice is a coverage policy, not an assertion that they strategically evaluate shortcut risk. Player projection selects the occupied ribbon. Sampling, surface, width, containment, AI aiming, minimap, browser preview, state hash and export understand the route. Invalid intervals, nested graphs, discontinuous joins, tight/narrow branches and overlaps with unrelated passages fail validation. Multiple independent sidecar routes are supported by the runtime; the recipe editor currently permits one split block. Bridges remain explicitly unsupported; the specified junction alternative is implemented.

Optional `-junctions.csv` and `-branches.csv` sidecars preserve the old node format and do not alter the 29 existing course resources. Branch node files use that same format. Their absence preserves existing course behavior and replay hashes.

## Lab and evidence

The Track Lab offers recipe editing, compilation, expanded primitive inspection, actual baked-road preview and the combined physical/shape gates. Existing control-point, width, surface, pickup and obstacle editing still works. Recipe changes invalidate race/export; a failed compile cannot quietly re-enable the previous draft. A ZIP includes node and route CSVs, the correct newly chosen start fraction, original recipe, validation, and a provenance note identifying node CSVs as authoritative after manual edits. Drafts stay in memory.

Meaningful controls cover closure/radius errors, the positive folded road, missing/false crossing declarations, passage continuity through both crossing directions, six AI cars completing two junction laps, split/rejoin canonical progress, all six cars using both alternatives over two laps, and codec equivalence including route nodes. Browser checks cover both desktop and phone widths, recipe compilation, invalidation, rejected recipes, split preview, export and a real seeded race. Raster outline evidence is inspected separately from numeric gates. R3 must still prove campaign-tier duration, combat fairness and the candidate library's mutual distinctness; these are not granted by a successful compile.

The first full regression found an obsolete seven-file ZIP assertion after adding the two route sidecars. The assertion now checks nine files and both sidecar schemas. The rejected compile/grid-obstacle case is also retained in the development evidence. These failures were corrected before the wave commit.

Visual inspection of the browser's actual raster controls confirms deep returns, a recognisable central fold and a separate alternative passage, rather than an oval. Slate on the browser map is an explicit route overlay, not a material assertion. The game uses each branch's actual surface material and draws the shared road union without an internal wall. These controls establish the system, not library-wide variety.

Validation evidence and final measured results: `deathride/evidence/tracks/r2-final-build.log`, `r2-routes.log`, and `r2/browser`. No production course, event, art or audio data was replaced in this wave. No stash, device, generation service, registry write or push.

Final validation: **193 core + 8 link + 37 game tests**, zero failures/errors; all required Gradle tasks green. The final barrier-rendering change was rebuilt with all required tasks (`r2-render-build.log`; core/link correctly up to date). Existing atlas/Lab, R1 shape atlas and R2 composer browser suites pass. The rebuilt R1 report still rejects all 29 old outlines, flags 81 similar pairs and proves all 15 gate witnesses. The approved Runoff source files and all 35 campaign rows remain byte-for-byte unchanged.
