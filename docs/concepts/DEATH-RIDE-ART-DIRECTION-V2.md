# Death Ride: art direction v2, raw and wasteland

Written 2026-10-01 from the owner's review of the first Grok batch (`deathride/art/review.html`).

> "I like the approach of 'digital hand drawn' artifacts, I think it has potential to look great without being complex like models in modern videogames. The theme looks too safe,
> most visible in characters and cars. If we manage to inspire from Mad Max and achieve more crazy rawness/roughness in the overall style we get instant bonus points from the visual feel.
> Tiles and surfaces overall degrade the visual game quality. This is an area we should learn about whether we can find a cheap trick to boost."

## a. What is kept, what changes

- **Kept:** the digital hand-drawn look (bold outlines, painted flat-to-soft shading, no 3D models), true top-down cars with neutral lighting, the pipeline, gates and budget guard.
- **Changes:** the mood. From tidy arcade toy cars to **post-apocalyptic wasteland vehicular carnage**: rusted, welded, spiked, patched, overloaded, sun-bleached, oil-black, dust-red.
  Cars look *built from scrap with intent*: armour plates bolted over doors, exhaust stacks, roll cages, tyre-stack bumpers, ram prows, spikes, mounted guns, stolen road signs as shields, mismatched panels, hand-painted war markings.
  Drivers and rivals (portraits, story cards) are **characters with menace and personality**: scars, goggles, masks, mohawks, welded shoulder armour, improvised war paint, each rival a distinct silhouette that matches their car archetype (Rook the bitter scavenger, Ox the heavy hauler, Vex the speed junkie, Mica the grip artist, Marrow the league boss).
- **Inspiration, not imitation:** draw on the *feeling* of 1970s-80s wasteland road-war cinema (desert palette, improvised armour, kinetic chaos). **Never reproduce any specific film character, vehicle, costume, logo, name or scene.** No named franchise terms in prompts. Original designs only; the owner decided IP is not a topic yet, but this rule keeps the work clean and keeps Grok from refusing or copying.

## b. Style levers (put into `style.json`, restated verbatim in every prompt)

1. **Palette**: sun-baked ochre, rust orange, dried-blood red, bleached bone, soot black, one toxic accent per faction (acid green, hazard yellow, bruise purple). Reject clean primaries.
2. **Line**: rough, uneven, ink-brush outline, slightly wobbly, thick on silhouettes, thin for panel seams; visible scratches and hatching for wear.
3. **Surface**: dents, rust bloom, chipped paint, soot streaks, bullet marks, patched metal, dirt in the seams. Wear is on every asset, never factory fresh.
4. **Silhouette first**: each class reads at 96 px from a sofa: the heavy is a spiked fortress, the light car a stripped-down rat-rod, the racer a lopsided dragster, the gunship a battle wagon with turrets. More extreme proportions than v1.
5. **Detail load**: more, but bounded by the sprite budget; cluster detail where the eye goes (front ram, guns, driver cage).
6. **Damage states** are part of the identity: crumple, missing panels, flames, smoke, wreck husk (burnt, black, still readable).
7. Keep the **flat neutral light** contract so in-engine rotation and tinting still work; bake wear, not directional shadow. Ground shadow is drawn by the engine.

## c. The tile and surface problem (research task, not a guess)

Owner finding: tiles and surfaces lower the perceived quality of the whole screen. The hypothesis space (to test with contact-sheet A/B, not assume):

- Plain repeated tiles look like wallpaper under moving cars, and they clash with the hand-drawn cars (photographic gravel and asphalt textures versus painted vehicles).
- **Candidate cheap tricks** to research and try:
  1. **Paint the ground in the same hand-drawn language as the cars** (flat colour fields, rough ink edges, scratch and crack linework, no photo noise).
  2. **Break repetition with a second, low-frequency layer**: a large grime/grunge overlay or macro-variation mask, drawn at 3-5x the tile period and scrolled independently, multiplied or overlaid on the tile.
  3. **Decal scatter** by deterministic seeded placement: cracks, oil, skid scars, tyre tracks, scorch, bones, scrap, tufts of dead grass, patches of sand, painted lines worn away. Decals do most of the visual work for the least texture memory.
  4. **Track as a hand-painted ribbon**: one baked strip texture per course (low resolution, linear filtered) generated from the spline with the tile as base plus seeded decals plus edge wear, instead of tiling a tile across the world.
  5. **Strong edge treatment**: kerbs, sand/dirt run-off fading, tyre walls, concrete barriers, painted warning stripes, cast shadow bands on the road beside barriers, a dark ink border where road meets dirt.
  6. **Colour grading and atmosphere**: a global warm grade, vignette, dust haze, heat shimmer, drifting dust particles and ground-level smoke, long speed-based streak lines; these lift every asset at near-zero texture cost.
  7. **Parallax and depth cues**: props with tall silhouettes (wrecks, pylons, rock spires) that overlap the road edge and sort over cars, subtle height from drop shadows, to turn the flat floor into a place.
  8. **Dynamic wear**: persistent skid marks and scorch decals drawn into a low-resolution render-to-texture layer as cars drive (cheap, and it makes every race leave its mark).
  9. **Stylisation filters**: posterise or palette-reduce the ground, outline pass, slight paper/grain overlay so cars and ground share one grain.
  10. Lower-detail ground with **higher contrast to the cars** so cars always pop (value separation: ground mid-dark, cars lighter and saturated, bright accents on weapons and pickups).
- Each trick gets a **cost line**: texture MB, extra draw calls or fill rate on the Stick (1.7 GB, weak GPU, 1080p), and a measured frame-time delta. Cut anything that breaks the budget.

## d. Work packages (art worktree, branch `deathride/art`, new commits on top of the delivered P1-P4)

| Id | Wave | Deliverable | Gate |
|---|---|---|---|
| V1 | Style v2 bible | Rewrite `STYLE.md`/`style.json` from this document (palette, line, wear, silhouette rules, negative prompts including no franchise names, no clean/new look); build a **style reference set** of 6-8 images the owner can accept; keep v1 for comparison | owner contact sheet v1 vs v2 |
| V2 | Characters and cars proof | Regenerate the **ten car references** and the **six rival portraits** in the v2 style; heavy and light archetypes must be clearly more extreme; run the existing deterministic gates and local-model grading; side-by-side with v1 | owner approval (blocks states and liveries) |
| V3 | Surface lab | Research the tile tricks above (web and the registry `media-generation` / `game-production` notes), then build a **surface lab**: one test course rendered in the real libGDX renderer or a faithful desktop mock, with a switchable stack of tricks, producing screenshot A/B contact sheets (baseline tiles, hand-drawn tiles, +macro grunge, +decals, +ribbon, +edge treatment, +grade/dust, all combined) and per-trick cost on the Stick (PSS and frame time) | owner picks the stack |
| V4 | World kit v2 | Regenerate or repaint the ground, barrier, prop, pickup, decal and effect kit in the chosen style and chosen trick stack, atlases revalidated, residency budget kept (30.75 MiB declared; justify any change) | validate_bundle plus Stick measurement |

Spend rules: the local Grok guard is raised for this work (see `deathride/art/budget.json`); keep the first-call proof and stop-latch behaviours, log every call, and report spent versus remaining at the end of each wave. Videos stay out.
The owner's approval of V2 is the file the pipeline checks before generating the 40 car damage states and 30 liveries, which then happen in the v2 style, not v1.
