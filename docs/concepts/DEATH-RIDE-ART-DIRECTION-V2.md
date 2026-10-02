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

V1 and V3 retain their historical checkpoint wording; the recorded owner choice and fusion outcome are in F1, V2, V4 and R2. V2-P3 records the subsequent owner car review and approved-family generation.

| Id | Status | Evidence / next gate | Commit label | Date |
|---|---|---|---|---|
| F1 | Owner fusion compiled by family; bridge and hash-bound prose decision implemented | `deathride/V2-part2-fusion.md`; 35 pipeline tests pass; new reference approval remains closed | art-fusion-contract-20261001 | 2026-10-01 |
| V1 | Five style directions and 35 comparable proof slots delivered; 68 generated attempts, no owner acceptance | `deathride/art/review.html`; exact choice file absent | art-v1-choice-20261001 | 2026-10-01 |
| V2 | Fusion ten-car/six-rival roster delivered; 13 pixel passes, three capped car rejects; owner approval pending | `art/review/fusion/index.html`; 34 attempts / 68 local observations; seventy derived jobs blocked | art-fusion-roster-20261001 | 2026-10-01 |
| V3 | Research and sixteen-mode surface lab delivered; 44 clean Stick runs; simple live edges/decals option, graded stacks held | `deathride/art/surface-lab/review.html`; same-binary A/B cost lines; owner stack choice still pending | art-v3-surface-lab-20261001 | 2026-10-01 |
| V4 | Fusion world kit packed and measured; owner review pending | `deathride/V4-part2-fusion-world.md`; 74 assets / 178 regions; 31.25 MiB (+0.50 ribbon); four isolated Stick runs 16.69/17.89 ms | art-fusion-world-20261001 | 2026-10-01 |
| R2 | Portable fusion owner review complete; stopped at exact-reference approval | `deathride/V2-part2-owner-review.md`; desktop/mobile, 270 pixel/hash checks; 338/350 reserved; three car rejects retained | art-fusion-review-20261001 | 2026-10-01 |
| V2-P3 | Six exact references approved; 24 states and 18 liveries pass pixel gates; four reworks remain unapproved, Comet/Kestrel capped holds | `deathride/V2-part3-cars.md`; 63 image calls, paired identity/control evidence, six family sheets, 96px before/after; 39 tests and 532 portable hash checks pass; 401/550 reserved | art-v2-part3-cars-20261002 | 2026-10-02 |
| V2-P4 | Four reworked candidates pass unchanged gates; Comet turbine rear and Kestrel single harpoon repaired; all await owner approval | `deathride/V2-part4-cars.md`; 10 new images, 28 new local observations, native 96px before/after; 42 tests and 552 portable hash checks pass; 28 derived jobs blocked; shared ledger 433/550 | art-v2-part4-cars-20261002 | 2026-10-02 |

## g. Session log

### V1, 2026-10-01 — five-way choice

Read owner direction and addendum first; restart tree was clean, with 130 inherited reservations and no partial V1 pixels. Design first in `deathride/V1-style-choice.md`. Preserved v1 style and review, authored five versioned cards, and generated identical seven-subject proof sets through the existing Grok guard. Per-row style resolution keeps historical briefs on their immutable v1 contract. New V2/V4 production jobs fail closed without an exact owner choice; source-reference approval remains independent.

68 paid images produced 35 current proof slots plus retained corrections. Every attempt has deterministic gates and two actual local-model observations (136 observations); direct export review caught a lost pale spark centre and wrong wrench geometry, then checked their corrected pixels. Three-attempt ceilings were respected. Rejected margins, surface borders and repeated motifs remain visible; neither model agreement nor source repairs grant owner acceptance. Contact boards compare all five directions, every direction against v1, actual 96px cars/32px icons, and all attempts. `deathride/art/review/v2/index.html` and its review-sized images are portable committed artifacts; raw generations remain ignored.

33 Python pipeline tests pass; `:core:test :link:test :app:assembleDebug` is green. Existing bundle validation still passes 69 assets/172 regions with unchanged declared 30.75 MiB residency. Local graders remain diagnostic, with human calibration pending. No V2 roster, damage states, liveries or V4 assets were generated. Spend this wave 68 images; weekly 198/350 reserved, 152 remaining, zero videos, no actual quota/rate-limit error, stop latch clear. Owner choice, taste, production integration and on-Stick appearance of the style proofs are not measured. Proceed to V3 under the addendum; V2/V4 wait without a question.

### V2, 2026-10-01 — deferred at owner choice

Design/handoff in `deathride/V2-chosen-roster.md`. OWNER-CHOICE.md is absent. Enumerated ten C1 car identities and six committed Content rivals; the production gate refused all sixteen planned reference/portrait jobs before any reservation. `art/audits/v2-choice-gate.json` records refusal codes and identical before/after ledger/history hashes. No full-roster generation and no damage states or liveries. V1's owner boards and v1/v2 pairs are available now; the full-roster comparisons require the chosen direction. This is a waiting wave, not completed V2 production. Validation remains 33 passing pipeline tests and green required build. V2 spend zero; weekly 198/350, 152 remain, zero videos. Proceed with the independent V3 surface lab; return to V2 only on an actual owner choice.

### V3, 2026-10-01 — measured surface laboratory

Design, primary-source web research and decisions are in `deathride/V3-surface-lab.md`. Built a shared desktop/Android libGDX rendering mock with sixteen switchable experiments, fixed seed and capture phase, six 96px car reads and unchanged source gates. A /24 scan located the AFTKM at `10.0.0.139:5555`. Only `dev.deathride.artlab` was installed. Initial concurrency interrupted two windows; twelve completed diagnostic captures were excluded. Explicit handoffs then allowed 44 clean measurements, including forward/reverse repetitions, alternate style proofs and fresh controls for three APK revisions. The final readback leaves the integration app in its lobby; its installation stayed unchanged throughout each accepted session.

Owner A/B boards carry texture, draw, coverage, PSS and measured timing cost lines. All layers together reached 25.14/31.15 ms p50/p95. The restrained and narrow-band combinations also miss nominal 16.7 ms median cadence. Cached vertices preserve exact Stick pixels and lower CPU work, but 16.86/22.67 ms still leaves that combination held. The bake's extra 4 MiB exceeds current art headroom; no failed stack becomes the default. The simpler live edge/decal control stays at 16.68/17.74 ms and remains an owner option, alongside individual treatments. A hypothetical 31.8125 MiB art allocation fits memory but does not waive frame checks. Production atlases remain unchanged at 30.75 MiB.

Validation passes sixteen modes with two clean repeats each, matched binary controls, exact cached-image equality, raw samples and allocation accounting; desktop/mobile browser checks pass. The 33 pipeline tests and required core/link/APK build are green. Fixed Git line-ending conversion for byte-hashed art evidence without changing prompts, grades, approvals, counts or thresholds. V3 spends zero images; weekly 198/350 reserved, 152 remain, zero videos, stop clear. No full-game soak or owner quality acceptance is claimed. OWNER-CHOICE.md remains absent: V2/V4 production and derived car states/liveries stay gated.

### V4, 2026-10-01 — deferred world-kit handoff

Design and continuation contract are in `deathride/V4-world-kit.md`. The owner choice file is still absent, so no chosen-style kit is produced. Thirty read-only production-gate checks cover six world families across all five style cards; every call refuses before reservation. `art/audits/v4-choice-gate.json` verifies identical ledger, history, selections, reference approvals and production-manifest hashes. No source gate, approval, threshold or stop latch was relaxed.

The live edge/decal surface option remains available for owner review at 16.68/17.74 ms p50/p95 in the isolated lab; heavier graded combinations remain held. Its conservative 31.75 MiB art plan requires actual packing and integrated hardware validation after choice. Existing production residency stays 30.75 MiB. V4 spend zero; session spend 68 new images, weekly 198/350 reserved, 152 remain, zero videos, stop clear. V1 and V3 are delivered; V2 full-roster and V4 kit production remain explicitly waiting. Damage states and liveries also retain their separate exact-reference approval gate. Stop under section e; four local wave commits, no push.

### Part 2 / F1, 2026-10-01 - executable owner fusion

Read the owner choice first and retained its exact bytes. Design in `deathride/V2-part2-fusion.md`. Added a family-resolved fusion style with exact parent hashes and one shared bridge, plus a host compilation binding the existing prose decision to the executable style and chosen surface stack. Unknown families and changed evidence/parents fail closed. The existing single-direction and reference approval paths remain intact; 35 pipeline tests pass. No paid calls: weekly 198/350, 152 available, zero videos, stop clear. Commit is local only.

### Part 2 / V2, 2026-10-01 - generated fusion roster

Design and outcome in `deathride/V2-part2-roster.md`. Generated ten C1-bound references and six rival portraits in the owner fusion, with 34 reservations and 68 current local observations. Strong broad heavies and open light frames are shown at 96px alongside all v1/v2 pairs. Seven cars and six portraits pass pixel gates; Comet, Quill and Kestrel retain margin/aspect failures at the three-attempt ceiling. They stay rejected, with no fourth attempt or disguised padding. Nine terminal-space-only CLI mismatches were audited and recovered from existing output without new spend; the original exact-comparison flags remain false and visible.

Portable sources and review page, explicit direct notes, exact-reference approval template and seventy refusal-before-reservation checks are delivered. No owner approval, car damage state or livery was generated. Browser checks pass desktop/mobile, 35 pipeline tests pass, and required core/link/APK build is green. V2 spend 34; the atomic shared ledger checkpoint also includes concurrent V4 reservations, with zero videos and stop clear. Local commit only; continue the world kit and Stick measurement.

### Part 2 / V4, 2026-10-01 - fusion kit and full-residency Stick comparison

Design/outcome in `deathride/V4-part2-fusion-world.md`. Generated 68 world slots with 106 reservations and reused six new rivals. Eleven explicitly provenanced derivatives repair borders, seams, key fringes and effect layouts; fire is an offline fusion repaint of prior valid phases after three rejected generated attempts. All attempts, derivatives and actual effect exports have both local observations; combined execution total is 312. Packed 74 assets / 178 regions into four atlas pages, plus eleven tiles and five one-resident backdrops. Six obstacle definitions provide collision footprints/effect classes for a later core hook; no physics integration claimed.

Validated hashes, atlas bounds/gutters, content aliases, animations, obstacle metadata and 31.25 MiB residency, including the added 0.50 MiB baked ribbon. The libGDX reader and 35 pipeline tests pass; standalone Android/desktop builds pass. Four same-APK Stick runs allocate the full kit and both car pages. Natural/control average p50/p95: 16.69/17.89 versus 16.70/18.11 ms. Cached course vertices are 28,800 CPU bytes; no per-frame band reconstruction. Isolated instrumentation is not an integrated soak. Both lab-only device sessions preserve the integration installation and restore its prior activity. Historical V3 evidence is archived and separately validated. Weekly 338/350 reserved, session 140, 12 remain, videos zero, stop clear. Car approvals and seventy derived jobs remain held. Local commit only; final review next.

### Part 2 / R2, 2026-10-01 - owner review and approval stop

Design/outcome in `deathride/V2-part2-owner-review.md`. Current review entry now opens the fusion: ten car comparisons, six rivals, 96px silhouettes, 68 world slots, optional eleven repaired originals, actual animation frames, selected obstacle metadata and full-residency Stick A/B. Earlier V1, five-direction and V3 reviews remain linked. Four desktop/mobile views pass images, 203 owner-page links, family/original filters, the three visible car holds, slider behavior and layout. Portable audit passes 270 source/export/frame hashes over 288 files, checks all 74 bundle selections and matches exact approval candidates without ignored raw sources.

Stop with Comet, Quill and Kestrel still rejected and all ten approvals false. The exact-reference approval format/template is delivered; no 40 damage states or 30 liveries generated. Later collision hooking, integrated soak and owner taste remain pending. Weekly 338/350 reservations, 140 new this execution, 12 remain, zero videos, stop clear. Four local part commits, no push. Final owner entry: `deathride/art/review.html`.

### V2 Part 3, 2026-10-02 — owner car changes and approved families

Read OWNER-CHOICE.md Section C first and recorded the six explicitly authorised approvals from the exact template hashes and owner quotation. Preserved the prior style binding and rebound it to the appended owner evidence without changing drawing contracts. One design note is `deathride/V2-part3-cars.md`. Nine guarded attempts deliver silver Needle, turbine Comet, medium-weight bone-spiked Quill and electric-harpoon Kestrel. Needle/Quill pass pixels. Comet's best design retains a margin failure; the final single-harpoon Kestrel fails margin/aspect after adding a broad tether loop. Both are capped at three attempts, all alternatives retained, and all four reworks remain unapproved.

Generated all four states and three liveries for each of the six approved references: 42 current derivatives, 53 attempts including eleven bounded corrections. All final derivatives pass pixel gates. Direct inspection corrected lost wear, obsolete Flint cross-brace prose, erased Bulwark roof ribs and Vandal wreck margin. All 63 Part 3 images have two semantic observations; all derivative attempts have paired exact-reference identity checks. One identical-prompt unconditioned control scores 0.927981 silhouette overlap versus 0.997931 conditioned, with no statistical claim. Two exports receive audited half-pixel pivot translations, no scaling or source padding. All 42 final export pivots/cells match approved references.

Updated `art/review/fusion/index.html` contains four before/after pairs and true 96px silhouettes, six family sheets, the control, all attempts and the preserved world/Part 2 review. Desktop/mobile checks load 151 images and 244 links, preserve six approvals and all rejects, and exercise filters plus the existing surface slider. Thirty-nine pipeline tests, required core/link/APK tasks, 532 portable hashes and exact tool-input/proof/spend assertions pass. The unchanged world bundle remains 74 logical assets, 178 regions and 31.25 MiB. Current fusion entry points understand Part 3; historical templates, sources and gate numbers remain intact.

Spend is 63 new image reservations, weekly 401/550 with 149 remaining, zero videos, no quota error and a clear stop latch. All paid results have exactly one verbatim-verified image tool call; derived edits use the approved image paths/hashes. Remaining: a future authorised iteration for the two capped rework defects, owner approval of all four reworks (their 28 derivatives still refuse before spend), derivative taste review and later integration/soak. One local part commit; never pushed.


### V2 Part 4, 2026-10-02 ? four gated rework candidates

Read OWNER-CHOICE.md A-D, the Part 3 design/reports/audits, ACCEPTANCE.md and guarded pipeline first. Design and outcome are in `deathride/V2-part4-cars.md`. Diagnosed source margin, aspect and identity separately; retained Needle/Quill exact passing pixels and repaired Comet/Kestrel through ten bounded, verbatim-verified one-image calls. Approved Line sibling edits supplied structure, concise landscape redraws fixed framing, and separate geometry/weapon corrections fixed Kestrel's width and single-harpoon silhouette. Logged exact audit hashes raise only Comet to seven total attempts and Kestrel to nine, with both next revisions proven blocked. No threshold relaxation, padding, stretching, transport retry or latch clearing.

All four current references pass unchanged gates and reproduce exact exports from portable sources. Twenty semantic observations on new attempts, four reused retained observations, and eight source/96px feature observations remain diagnostic; small-read uncertainty is visible. Original/Part 3/current comparisons, native 96px silhouettes, every failed attempt and preserved prior world/family evidence are published at `art/review/fusion/index.html`. All four approvals remain false; repeated live checks block their 28 prepared states/liveries without spend. Existing approvals are preserved exactly.

42 pipeline tests, 552 portable hash checks, required core/link/APK tasks and desktop/mobile review pass; 161 images, 172 links, native sizes and filters are checked. World bundle remains 31.25 MiB with 74 assets/178 regions, no production atlas or runtime changes. Car-work spend is 10 images; concurrent HUD work adds 22 shared-ledger reservations, for 433/550 and 117 remaining. Zero videos, clear stop. One local commit; no push. Owner exact-source decisions, then derived families, human calibration and integration remain outstanding.
