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

## e. Addendum, 2026-10-01 (owner): show a choice of style directions

V1 and V2 change: instead of committing to one look, produce **four to five genuinely different raw-wasteland style directions** and let the owner choose (or fuse). Each direction is a named style card
(`style-<slug>.json` plus a short rationale) and a **proof set** rendered identically across directions: one heavy car, one light car, one rival portrait, one ground patch, one barrier/prop, one HUD icon, one effect.
Directions must differ in more than palette: line quality, shading language, detail density, proportion exaggeration, mood. Suggested spread (rename freely, keep them distinct):

1. **Rust-and-ink brutal**: heavy rough brush outlines, flat painted fills, scratch hatching, maximum silhouette exaggeration.
2. **Sun-bleached poster**: screen-print look, limited 5-6 colour palette, halftone grit, bold graphic shapes, high contrast.
3. **Comic grindhouse**: thick inked comic lines, spatter, speed streaks, saturated hot accents on a dirty base.
4. **Scrapyard collage**: cut-out, patched, mismatched textured panels, visible tape, rivets and stencil marks, a hand-assembled look.
5. **Nightmare pulp**: dark, smoky, high-contrast chiaroscuro-in-flat-colour with toxic accents (optional fifth, drop it if it repeats another).

Rules: same neutral-light and top-down contracts in every direction; the same prompt skeleton with only the style block changing, so the comparison is fair; run the existing gates on every proof asset;
spend about 70 images on the proof sets (7 assets x 5 directions x about 2 attempts), then **stop and present** one contact sheet per direction plus one combined board. V2 (the full ten cars and six portraits) is then done **only in the owner-chosen direction**;
if no choice has been recorded in `deathride/art/OWNER-CHOICE.md` when V1 finishes, finish V1 and V3 (the surface lab can use two or three directions' ground proofs as inputs, since the tile trick research is style-agnostic) and then stop, logging that V2/V4 wait for the choice.

## f. Execution status

| Id | Status | Evidence / next gate | Commit label | Date |
|---|---|---|---|---|
| V1 | Five style directions and 35 comparable proof slots delivered; 68 generated attempts, no owner acceptance | `deathride/art/review.html`; exact choice file absent | art-v1-choice-20261001 | 2026-10-01 |
| V2 | Waiting for owner choice; zero full-roster or derived-state generation | `deathride/art/OWNER-CHOICE.md`, then exact-reference approval | pending | 2026-10-01 |
| V3 | In progress: research and isolated libGDX lab; Stick integration race currently active | Separate package `dev.deathride.artlab`; no replacement of integration app | pending | 2026-10-01 |
| V4 | Waiting for owner style and surface-stack choice; no kit regeneration | Choice plus validated atlas residency and Stick evidence | pending | 2026-10-01 |

## g. Session log

### V1, 2026-10-01 — five-way choice

Read owner direction and addendum first; restart tree was clean, with 130 inherited reservations and no partial V1 pixels. Design first in `deathride/V1-style-choice.md`. Preserved v1 style and review, authored five versioned cards, and generated identical seven-subject proof sets through the existing Grok guard. Per-row style resolution keeps historical briefs on their immutable v1 contract. New V2/V4 production jobs fail closed without an exact owner choice; source-reference approval remains independent.

68 paid images produced 35 current proof slots plus retained corrections. Every attempt has deterministic gates and two actual local-model observations (136 observations); direct export review caught a lost pale spark centre and wrong wrench geometry, then checked their corrected pixels. Three-attempt ceilings were respected. Rejected margins, surface borders and repeated motifs remain visible; neither model agreement nor source repairs grant owner acceptance. Contact boards compare all five directions, every direction against v1, actual 96px cars/32px icons, and all attempts. `deathride/art/review/v2/index.html` and its review-sized images are portable committed artifacts; raw generations remain ignored.

33 Python pipeline tests pass; `:core:test :link:test :app:assembleDebug` is green. Existing bundle validation still passes 69 assets/172 regions with unchanged declared 30.75 MiB residency. Local graders remain diagnostic, with human calibration pending. No V2 roster, damage states, liveries or V4 assets were generated. Spend this wave 68 images; weekly 198/350 reserved, 152 remaining, zero videos, no actual quota/rate-limit error, stop latch clear. Owner choice, taste, production integration and on-Stick appearance of the style proofs are not measured. Proceed to V3 under the addendum; V2/V4 wait without a question.
