# Design card: Cars wear their loadout

Status: recommended direction, not approved. Date 2026-10-15. Context: `dr-tv-screens` / game module `deathride/game`. Inventory and provider status: [ART-GAPS-2026-10-15.md](ART-GAPS-2026-10-15.md).

## Thesis

A car IS its loadout. The garage choice must be readable on the track at 3 m: when a player buys Hammer or armour tier 3, every car with that part should look different, theirs and the rivals', through the race and in the garage. Today nothing is: the 62 mount rows in `game/src/main/resources/mounts/mount-attachments.csv` draw tinted rectangles (0 of 76 rows has a `sprite`), armour has no art at all ("no armour art exists; armour is a stat only"), and the garage shows words (tv-16).

## What the player sees

1. Weapons differ by silhouette, not colour. At 3 m on a 1080p TV a mount is about 45 px (scale 0.15-0.21 of a 232 px body). So the designs must differ by outline: Rivet = long thin twin barrels with a drum; Scatter = wide fan nose with a flared muzzle; Hammer = tall boxy roof launcher with a fat tube; Mine = a low rear rack with a visible round charge; Spikes = a row of triangular teeth along the flank or nose.
2. Armour by tier: tier 1 bolted side plates, tier 2 plates plus a front ram bar, tier 3 full welded shell with skirts. Each tier adds mass to the silhouette, never a colour change alone.
3. Engine and tyre cues, secondary: a stack or intake that grows with engine tier, a studded ring on the steered tyre overlay for tyre tier. Optional, after the first three.
4. Damage states keep mounts: tint .86/.7/.3 and the wreck drop already exist (`MountPainter.kt:56-61`) and apply to sprites the same way.
5. The garage preview shows the same car with the same mounts (the car picture requested in tv-16), updated live when a part is previewed.

## What must stay true

- Frame budget: one texture, no allocation in the draw path (the `MountPainter.kt` header). The mount page is a second atlas; it is drawn in one batch pass per frame, not per mount. Stick pitfalls: no per-frame bake or allocation; texture switches are expensive (docs/concepts/deathride/PITFALLS.md, 2026-10-03 and P3 heading notes: prefer one neutrally lit sprite rotated at runtime).
- Owner-approval gate: `AtlasArt.approved` (`AtlasArt.kt:141-142`) is unchanged; a sprite that is not owner approved or exact-reference approved never draws; no candidate ever ships.
- Procedural fallback stays: a missing, unapproved or failed-to-load sprite draws today's silhouette. The game works with zero approved sprites.
- Heading and scale: sprites are authored facing right, rotated at runtime with the car heading, scaled by the row's `scale` x body length. No physics, car dimension or camera constant changes.
- Determinism: art does not touch the sim.

## Data model change

1. Fill the existing `sprite` column of `mount-attachments.csv` with an atlas region id, e.g. `m3-rivet-needle-v1`. No schema change for weapons.
2. Add an equipment layer row type `mode=equip`, columns reused (x, y, rotationDeg, scale, layer, sprite), plus one new column `tier` (1-3, empty for weapons). `kind` Armor keeps `none` rows until a plate exists. Catalog key becomes class x kind x tier (tier 0 for weapons).
3. `MountLoadout.mask` already carries one bit per kind; add a tier byte for armour from the car's installed part tier. `MountKind.ARMOR->{}` at `MountPainter.kt:67` becomes a sprite or procedural plate draw.
4. Version the bundle `assets/phase3-mounts`, immutable once accepted (same convention as phase2-states, `art/DELIVERY.md`), with its own `catalog.json` carrying `owner_approved` per region.
5. `MountCatalogTest` extends: every (class, kind, tier) has rows or an explicit `none` with a reason; every non-empty `sprite` resolves in the catalog.

## Art production plan

- Atlas: 46 weapon sprites + 30 armour plates = 76 at 64x64 cells; estimate one page 1024x512 (128 cells, 2 MiB RGBA), against 32.8 MB resident now. Shared-kit option: 8 designs on a 512x256 page (0.5 MiB), per-class anchor rows only.
- Generation briefs: one per weapon design from the existing fusion style (Rust and Ink), side-on orthographic, facing right, alpha-keyed on the project's gate colour, no cast shadow (renderer supplies it), explicit "no text" and a silhouette-first note; references are the approved car references so mounts sit in the same hand. Each brief names the weapon's game behaviour (rapid burst, fan, heavy slow, rear drop, contact).
- Process: proof (Rivet on Needle, Comet, Bastion; up to 9 images) -> owner reads the proofs at 64 px on the TV -> approve exact hashes -> batch the rest with per-asset ceiling 3 -> technical gates (`art/gates.json`) -> owner approves each exact asset -> bundle `phase3-mounts`.
- Budget: shared kit ceiling 24, per-class ceiling 228 more, expected 12-16 and 100-120; see ART-GAPS section 6. Needs the provider decision first.
- Phase 0 ships with no images: procedural tiered plates built from the same rectangles, so the data model and the garage preview are real before any art is bought.

## Acceptance cases

Each is falsifiable by a test or a measured run.

1. Coverage: for each of 10 classes and each of 4 weapon kinds installed, `MountPainter` issues a sprite draw and zero silhouette quads (`quads` counter 0 for that mount) once its region is approved. Fails if any (class, weapon) falls back.
2. Fallback: with all `phase3-mounts` regions marked unapproved, the draw output equals today's procedural quads, byte for byte in the `quads` audit.
3. Draw calls: the mount pass adds at most 2 texture switches per frame (to the mount page and back) and 0 allocations in a 60 s Stick run; frame p95 stays within 1 ms of the baseline pair from the same APK revision (matched-pair rule from PITFALLS 2026-10-03).
4. Armour tiers: tier 0, 1, 2, 3 on one class give four different non-empty sprite sets; the garage preview and the race car for the same loadout are pixel-identical at the same scale.
5. Damage: damaged-1, damaged-2 and wreck draw the same mounts as clean, tinted, and the wreck variant is dropped and crooked (existing behaviour kept); no mount is missing in any state.
6. Silhouette test at 64 px: the four weapon sprites of one class have pairwise silhouette IoU below 0.6 (so they differ in outline, not colour).
7. Approval gate: a sprite whose catalog entry has `owner_approved` false never draws in a build with art enabled; an approval test names every drawn region.

## Risks

- Provider unavailable: Grok latched, agy latched, Leonardo API tokens 9 (ART-GAPS section 5). Mitigation: Phase 0 procedural plates, owner decision on a pilot.
- Gate failures on small thin silhouettes (the Comet and Kestrel history needed 7 and 9 attempts). Mitigation: ceiling 3, logged raises only.
- Texture-switch hitch on the Stick (PowerVR; PITFALLS P13d/P13e class issues). Mitigation: a single mount page, one pass, measured pair before accept.
- Visual clutter: mounts hide the car identity. Mitigation: scale cap 0.21 of body, review at native size.
- The garage picture (tv-16) is a dependency for acceptance 4; it is separate work in RaceGame.

## Scores

- Size: M (data + painter + one atlas; the art is the long pole).
- Effort: 6 of 10 (Phase 0 is 2; art adds the rest).
- Impact: 8 of 10 (every car, every race, the garage).
- Risk: 4 of 10 (fallback is today's behaviour).

## Why it ranks above the other gaps

HUD glyphs, the banner and ability approvals are cheaper but touch one screen each. This is the only gap that changes what the player sees on the track the whole race and that gives the garage purchase a visible result; it also fits the existing gate (`AtlasArt.approved`), the existing data hook (the empty `sprite` column), and has a zero-image Phase 0.

## What this does NOT include

- No new car bodies, liveries or damage states; the 70 car frames stay.
- No weapon behaviour, balance or sound changes.
- No physics, camera or car dimension change.
- No HUD icon repaint, ability icon approval or launcher banner (separate rows in ART-GAPS).
- No generation or spend until the owner decides the provider.
- No per-driver customisation or cosmetic store.
