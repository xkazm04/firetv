# W6 Tracks, scale and procedural presentation — design first

2026-09-30. Implements section g before W4. Presets remain approved, without calibration. Resumed from the interrupted implementation; its spline bake, static scenery cache, fonts, course selection and motion pools are retained.

### Addendum sizing pass (written before the resumed implementation)

The owner's later addendum supersedes the dimensions below. Target dimensions: Needle 6.6 x 3.0 m, Line 7.8 x 3.75 m, Bastion 9.3 x 4.65 m, Comet 9.0 x 3.5 m, Trail 6.9 x 3.9 m. The mean length/width increase is about 47/48%; the compact and heavy ends deliberately spread farther apart. These are arcade world units. `car-shapes.csv` remains the dimensional authority for drawing and contact capsules. Increase the mass mapping spread, with the heavy car nearly three times the light car's mass; preserve the owner's approved input presets.

Keep the solo camera's 12.8-17 logical pixels/m so the larger cars actually occupy more screen, approximately 84-158 logical pixels long at 1280 x 720, or 126-237 physical pixels at 1080p. Do not zoom out to cancel the request. Shared framing may still widen for two separated players. Roads remain mostly 17-28 m across: about 3.6-6 widest-car widths instead of scaling the whole world equally and losing the desired contact density. Re-author insufficient corners and start rows. Grid lint uses oriented contact capsules so side-by-side cars are not incorrectly rejected as overlapping bounding circles. AI following/overtaking distances derive from physical car size plus data margins. Re-run every six-car completion case, deterministic/allocation tests, and Stick frame/input timing. Add content tests for size, camera readability, mass spread, grid clearance and actual race contacts.

## Scale contract (final addendum values)

Simulation dimensions are metres. `data/car-shapes.csv` owns each class's length, width and silhouette; collision capsules derive from those same dimensions. Needle is a narrow buggy, Line a compact coupe, Bastion a broad armored wagon, Comet a long wedge, Trail a short rally hatch. The longest body is 9.3 metres; the narrowest is three metres wide. These are deliberately readable arcade proportions, not a claim of real vehicle accuracy.

`data/presentation.csv` owns camera scale and budgets. The solo follow view targets roughly 13–17 logical pixels/metre (0.059–0.077 metres/pixel at 1280×720; physical pixel density scales with output). Thus a car is approximately 65–95 logical pixels long, instead of the previous 30–40. Speed adds sight distance. Two-player shared framing widens only as separation requires; a minimap and player markers remain visible. The full circuit overview in the lobby is explicitly a map, not the driving scale. Track widths are designed against the largest car, with a minimum of several car widths and radius clearance at every corner. The data linter owns the exact limits. The follow camera and minimap remain the Slipstream camera, not a replacement camera genre.

## Geometry and course sequence

Author closed centerline control points with width, surface and AI lane hints. Bake a deterministic closed spline into immutable segments at load, with arc-length sampling and nearest-segment projection. `Track` retains the original analytic stadium only for the existing movement benchmarks. The shipped game selects the authored courses. Width is interpolated; surfaces are discrete authored zones. Checkpoint fractions, six grid positions, pickup sites and local surface hazards are authored separately and validated. Pickups are marked sites until W4 gives them gameplay.

Five courses: Foundry Ring teaches a clean racing line; Switchback teaches braking for a hairpin; Redline teaches long fast approaches; Runoff teaches asphalt/gravel/wet transitions; Crucible teaches positioning on a tighter combat circuit. The track linter rejects broken closure, narrow ribbons, overlapping distant ribbon segments, unordered gates, invalid spots and intersecting grids. Pacing reports straight/corner fractions and minimum bend radius. Seeded six-car races must finish on every course; the tests also mutate good geometry to prove the linter rejects bad content.

## Presentation implementation

Build a cached procedural circuit layer in code: terrain grain, asphalt grain, surface coloring, alternating kerbs, outer barriers, runoff, grid paint and directional markings. Draw distinct car bodies with chamfered noses, tires, windows, roof/hood highlights, lamps, bumpers and offset shadows. Fixed-capacity skid and dust/smoke pools show motion and surface changes. HUD hierarchy prioritizes position, lap, speed and player identity. Keep geometry batched; measure on the Stick, and reduce drawing cost if the W1 frame envelope regresses. No downloaded textures, sprites, audio or generated image assets.

## Research and limits

The [track-design analysis by Luke McMillan](https://www.gamedeveloper.com/design/a-rational-approach-to-racing-game-track-design) treats width and corner sequencing as gameplay variables. Here those become explicit geometry and pacing checks, rather than five rescaled ovals. [libGDX's rendering guidance](https://libgdx.com/news/2021/05/shape-drawer) identifies batch switches as a cost; static scenery will be cached and shape work grouped. Registry read: `_laws.md`, `pacing-linter-rules`, `data-driven-type-objects-over-subclass-growth`, `canon-as-single-source-of-thresholds`. CSV is the single authority requested by this project's wave rules.

Validation: core/link tests and APK build; deterministic/allocation checks; all-course finish report; controller course selection and remote selection on AFTKM; screenshots and frame timing under scripted LAN input. Owner sofa readability, driving enjoyment and physical-phone feel remain **not measured** until the owner tries them. This is still a procedural prototype and does not establish commercial-game quality.


## Executed result, 2026-09-30

Retained the interrupted work and completed the owner addendum. Final physical dimensions are in the addendum table above; mass spans 830-2350 kg. Contact uses three overlapping circles, closing the middle gap in long silhouettes. Switchback's centerline expanded 20% to restore bend clearance; Crucible's start moved onto the straight so the enlarged rear grid row no longer overlaps on a bend. The follow camera retains the same pixels/metre and a larger terrain margin; the lobby now has a car preview and drawn stat bars.

`gradlew :core:test :link:test :app:assembleDebug`: **green**, 32 core and 3 link tests. Five-course lint, malformed-track rejection, sampling/gates, large-car side contact, size/mass/readability, determinism and zero-allocation tests pass. Twenty seeded authored races / 120 finishers: 67.45-115.57 simulated seconds, 8-37 damaging-contact steps/race (a step count, not unique impacts). All older movement/class/feel tests remain green. CSV: `deathride/evidence/phase1/w6-tracks.csv`.

AFTKM / Fire OS 8 / ARMv7 / 1920x1080 / Wi-Fi 2442 MHz. `tools/track-check.mjs` selected all five circuits, drove Bastion and checked release; remote MENU also selected Switchback. Browser was installed Chrome with CDP touch emulation, **not** the owner's phone. `tools/probe.mjs ... 60` on the final APK: 30.013 Hz, 1814 frames per slot. Last 10-second frame p50/p95/max 16.76/21.25/26.56 ms, n=600; worst p95 across six load windows 21.42 ms, worst frame 27.01 ms. This is inside the W1 load frame envelope; cold starts/course rebuilds are separate.

Final input-age p50/p95/max: P1 47.13/69.17/77.30 ms (n=601); P2 20.28/42.82/52.21 ms (n=601). Raw windows in `w6-probe.json`; corrected network ages are not optical latency. The probe uses a single clock-offset handshake per connection; differing estimates can shift each slot's entire age distribution. No sustained RTT tail growth appeared. Latest release identity installed, APK SHA256 `e05622b18e2af455eed2651b763315c4173bbd0ad93a4bb56d9eccb3a3451256`.

Truth: content exists/valid/wired; simulated racing and scripted on-Stick input **behave**. Owner sofa readability, physical-phone ergonomics, fun and optical latency **not measured**. There is no claim of commercial quality: scenery remains repetitive, motion lacks authored animation and audio, and combat/economy are still absent at W6. Next W4.
