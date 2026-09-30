# W6 Tracks, scale and procedural presentation — design first

2026-09-30. Implements section g before W4. Presets remain approved, without calibration.

## Scale contract

Simulation dimensions are metres. `data/car-shapes.csv` owns each class's length, width and silhouette; collision capsules derive from those same dimensions. Needle is a narrow buggy, Line a compact coupe, Bastion a broad armored wagon, Comet a long wedge, Trail a short rally hatch. The longest body is about six metres; the narrowest about two metres wide. These are deliberately readable arcade proportions, not a claim of real vehicle accuracy.

`data/presentation.csv` owns camera scale and budgets. The solo follow view targets roughly 13–17 logical pixels/metre (0.059–0.077 metres/pixel at 1280×720; physical pixel density scales with output). Thus a car is approximately 65–95 logical pixels long, instead of the previous 30–40. Speed adds sight distance. Two-player shared framing widens only as separation requires; a minimap and player markers remain visible. The full circuit overview in the lobby is explicitly a map, not the driving scale. Track widths are designed against the largest car, with a minimum of several car widths and radius clearance at every corner. The data linter owns the exact limits. The follow camera and minimap remain the Slipstream camera, not a replacement camera genre.

## Geometry and course sequence

Author closed centerline control points with width, surface and AI lane hints. Bake a deterministic closed spline into immutable segments at load, with arc-length sampling and nearest-segment projection. `Track` retains the original analytic stadium only for the existing movement benchmarks. The shipped game selects the authored courses. Width is interpolated; surfaces are discrete authored zones. Checkpoint fractions, six grid positions, pickup sites and local surface hazards are authored separately and validated. Pickups are marked sites until W4 gives them gameplay.

Five courses: Foundry Ring teaches a clean racing line; Switchback teaches braking for a hairpin; Redline teaches long fast approaches; Runoff teaches asphalt/gravel/wet transitions; Crucible teaches positioning on a tighter combat circuit. The track linter rejects broken closure, narrow ribbons, overlapping distant ribbon segments, unordered gates, invalid spots and intersecting grids. Pacing reports straight/corner fractions and minimum bend radius. Seeded six-car races must finish on every course; the tests also mutate good geometry to prove the linter rejects bad content.

## Presentation implementation

Build a cached procedural circuit layer in code: terrain grain, asphalt grain, surface coloring, alternating kerbs, outer barriers, runoff, grid paint and directional markings. Draw distinct car bodies with chamfered noses, tires, windows, roof/hood highlights, lamps, bumpers and offset shadows. Fixed-capacity skid and dust/smoke pools show motion and surface changes. HUD hierarchy prioritizes position, lap, speed and player identity. Keep geometry batched; measure on the Stick, and reduce drawing cost if the W1 frame envelope regresses. No downloaded textures, sprites, audio or generated image assets.

## Research and limits

The [track-design analysis by Luke McMillan](https://www.gamedeveloper.com/design/a-rational-approach-to-racing-game-track-design) treats width and corner sequencing as gameplay variables. Here those become explicit geometry and pacing checks, rather than five rescaled ovals. [libGDX's rendering guidance](https://libgdx.com/news/2021/05/shape-drawer) identifies batch switches as a cost; static scenery will be cached and shape work grouped. Registry read: `_laws.md`, `pacing-linter-rules`, `data-driven-type-objects-over-subclass-growth`, `canon-as-single-source-of-thresholds`. CSV is the single authority requested by this project's wave rules.

Validation: core/link tests and APK build; deterministic/allocation checks; all-course finish report; controller course selection and remote selection on AFTKM; screenshots and frame timing under scripted LAN input. Owner sofa readability, driving enjoyment and physical-phone feel remain **not measured** until the owner tries them. This is still a procedural prototype and does not establish commercial-game quality.
