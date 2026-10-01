# Death Ride: Phase 2, the art pipeline and the content to beat the 1996 original

Written 2026-10-01. Phase 1 (`DEATH-RIDE-PHASE1.md`, G1-REPORT.md) delivered a complete loop with placeholder visuals. Owner decisions on 2026-10-01:

- The Grok test art (cars, tiles, icons, one mock scene, in `C:\Users\kazda\kiro\firetv\.contest\art-test\`) is **good enough to build on**: the art style, the cars
  and the icons are the direction. Extraction into the game and consistency are the known challenges.
- The ambition is to **beat the content and quality of Death Rally (1996)**. Public benchmarks (unverified secondary sources collected by a side experiment,
  `.contest\experiments\gpt61-sol-death-rally\research\GAME-FACTS.md`): six cars on an upgrade ladder, nineteen tracks, engine/tire/armor upgrades, one-race
  consumables (mines, spikes, fuel), loans, contraband side contracts, named rivals who buy cars. Treat as targets to exceed, not facts to copy.
- **Grok image generation is the mass image engine** (the owner's weekly quota just reset; use it, but never waste it, see section d). Local models help with recognition and
  grading. The registry knowledge in `C:\Users\kazda\kiro\ai-registry\knowledge\media-generation` (and `game-production`) is the method.
- Astra drives development. Two parallel streams, on separate worktrees, merged by the host: **Art stream** (P1-P4) and **Content stream** (C1-C4), then **Integration** (I1-I3).

## a. Tools and facts verified on this machine (2026-10-01)

| Thing | State |
|---|---|
| Grok CLI | `grok` 1.0.44 logged in with the owner's SuperGrok session, model `grok-4.7`, built-in `image_gen` / `image_edit` / video tools, bundled skills `game-assets`, `game-tilesets`, `game-character-consistency`, `game-animation-frames`, `game-ui-icons`, `imagine` in `~/.grok/bundled/skills/` (read them before writing prompts). Headless call that worked: `grok -m grok-4.7 --effort low --always-approve --permission-mode bypassPermissions -p "<prompt>" --output-format json` run inside the output directory; the image is saved as a file there. Several can run in parallel processes. |
| What the test showed | 1024x1024 or 16:9 PNG, flat colour background reliable, strong style. Failures seen: one car came back three-quarter view instead of top-down; one car cropped at the frame edge; asphalt and oil tiles repeated visibly; lighting baked from the top-left (it will not rotate correctly if the sprite is rotated in-engine); extra decoration (driver, number) when not forbidden. |
| Local models | GPU RTX 4090 24 GB. Ollama has `qwen3.8:27b-64k` and `mimo-9b:q8-64k` (vision capable, `capabilities` includes vision) at `localhost:11434`. The repo's `vision/vlm.py` is an existing local vision client from the PoC. Use local models for **grading and recognition**, never as the arbiter of taste. |
| Reference device | Fire TV Stick 4K (AFTKM, 1.7 GB, armeabi-v7a, 1080p). Texture memory is the real constraint, see section d. |

## b. Art stream (worktree/branch `deathride/art`)

Rule: assets are produced by a **repeatable pipeline from versioned briefs**, never by hand, so any asset can be regenerated, graded and replaced.

### P1 Style bible and pipeline skeleton

- **Style bible** (`deathride/art/STYLE.md` + a machine-readable `style.json`): the locked style block restated verbatim in every call (registry: `style-block-restated-every-call`,
  `style-first-token-ordering`, `medium-vocabulary-locking`, `two-block-style-and-action`), camera contract (**true top-down, car pointing +x, neutral flat lighting with no baked
  directional shadow so the engine can rotate and light it**), colour roles (`assigned-colour-roles`, per-class accent), outline weight, scale contract linking sprite pixels to the game's
  metres per pixel from the Phase 1 scale contract (read `W6-tracks.md`), negative prompt list (`negative-prompting`: no driver, no text, no numbers, no logos, no perspective).
  Derive the style from the owner-approved test images (`style-onboarding-from-sample`); keep them as the reference set.
- **Asset brief CSV** (`art/briefs/*.csv`): id, class, prompt-action block, size, frame, background key, count, status. One row per asset; this is the single authority (`canon-as-single-source-of-thresholds`).
- **Generation driver** (`tools/art/gen.py` or Node): reads the briefs, calls the Grok CLI headless in parallel (bounded concurrency, default 4, `GROK_MAX_PARALLEL_*`), writes raw outputs plus a
  JSON sidecar (prompt, seed if any, model, timestamp, attempt number), resumable, idempotent, and keeps the **generation history as an artifact** (`generation-history-as-artifact`).
- **Budget guard**: a counter file of images and videos spent this week, a hard cap set in `art/budget.json` (the owner raises it), and a **gate before every spend** (`gate-before-every-credit-spend`):
  a batch runs a 1-image proof first; unspent budget is reported, not hoarded (`unspent-budget-is-a-defect`). The Grok subscription's real limit is unknown from here: the driver must stop and log on the first rate-limit or quota error and never retry in a loop.

Done when: one command regenerates the five test cars and five tiles from briefs into `art/raw/`, resumably, with a history log and a budget file.

### P2 Post-processing and acceptance (local, deterministic first, local VLM second)

- **Post-process**: key out the background colour (despill edges), trim, normalise to the scale contract, pad to a power-of-two cell, pivot from the art not the canvas
  (`sprite-sequence-timing-and-pivot-stability`), gutter for atlas bleed (`atlas-packing-and-bleed-margins`), palette drift check across a family (`palette-discipline-across-frames`).
- **Deterministic gates** (unconditional fails, `unconditional-fail-criteria`, `unmeasured-is-not-pass`): non-empty alpha, subject within the frame with margin (catches the cropped Bastion), aspect and
  size band, orientation check (principal axis along +x), background fully removed, **tiles: wrap-around edge difference under a calibrated threshold** (`wrap-around-edge-diff`, `seam-threshold-calibration`)
  plus a repetition score (autocorrelation peak) that catches the visible-repeat asphalt and oil tiles. Calibrate thresholds on the existing test images and record them.
- **Local VLM grader** (Ollama `mimo-9b` or `qwen3.8:27b`, schema from `vision-model-grading-schema`, two-grader disagreement rule `two-grader-disagreement-rule`): answers fixed questions only (is it true top-down?
  is there a driver or text? does it match the family palette? is the silhouette distinct from the other classes?) and returns JSON; a disagreement or low confidence routes to the owner contact sheet. The grader never
  accepts, it only rejects or routes. Record its false-accept and false-reject on a hand-labelled set of 30 images before trusting it, and write that number down.
- **Rejection memory**: failed prompts and failure codes are stored as negative evidence and fed into the retry prompt (`rejections-as-negative-evidence`), bounded retries (`bounded-refine-iteration`, max 3), a defect-class
  to remedy map (`defect-class-to-remedy-map`), best-of-n only where the economics allow (`reroll-economics-per-credit`).
- **Contact sheets** for the owner: auto-generated PNG sheets per batch with ids, verdicts and failure codes.

Done when: the five test cars and five tiles are run through the gates and the failures seen on 2026-10-01 (three-quarter Trail, cropped Bastion, repeating asphalt/oil) are **caught by the pipeline**, with the numbers in `art/ACCEPTANCE.md`.

### P3 Car family at scale (the hard consistency problem)

- Per class: a **reference sheet** approved by the owner first (`approved-reference-sheet`, `character-identity-continuity`: `reference-shows-only-invariants`, `identity-split-from-state`), then derived states from it with
  `image_edit` where it keeps identity: clean, damaged-1, damaged-2, wreck/burnt, and colour variants for rival liveries (`assigned-colour-roles`). Use a control arm to measure consistency (`consistency-control-arm`).
- Heading strategy decision, tested not assumed: (a) rotate one neutrally lit sprite in-engine (cheapest, needs the flat-light contract), (b) 16 or 32 pre-rotated frames, (c) generated frames. Measure memory and look on the Stick before choosing; write the result into `PITFALLS.md`.
- Target roster for art: the five current classes plus **at least five new classes** that the Content stream defines (C1); each with reference sheet, four states, three liveries.

### P4 World kit

Tiles (asphalt in 3 wear levels, gravel, ice, oil, kerb, grass, dirt, concrete, metal), barriers and walls (modular, straight, corner, hazard stripe), props (tyre stacks, crates, cones, signs, oil drums), pickup art
(ammo, repair, cash, mine, turbo), decals (skid marks, oil, scorch, cracks, blood-free impact marks), effect sprites (muzzle flash, explosion frames, smoke, sparks, fire) as animation sheets
(`game-animation-frames` skill, `motion-sampled-under-a-frame-budget`), HUD frames and icons (`game-ui-icons`), rival portraits for the campaign, track-theme backdrops. Tiles must tile; props are isolated on key colour.
Autotile completeness for track edges and barriers: enumerate the full rule set and fail on a missing case (`autotile-rule-set-completeness`, 47 cases for eight-neighbour).

## c. Content stream (worktree/branch `deathride/content`, data and core only, no art dependency)

Targets exceed the public benchmark: **at least 10 car classes in tiers, at least 24 tracks across themes, at least 6 weapons/consumables, a deeper economy and a longer career.**

### C1 Roster v2

Eight to ten cars on a tier ladder (rookie to elite) with a readable identity and a price curve, built on the W2 stat model and mapping; extra stats where the game needs them (turbo, ammo capacity, mounts). A headless
class-versus-course matrix proves no dominant class on every track type (`tier-band-peer-outlier-linting`, `cost-curve-object-audit`). Sizes: classes must differ visibly in length and width within the scale contract.

### C2 Tracks v2

Extend the W6 track format and linter to 24+ tracks in 4+ themes (the track-theme list is data: surfaces, palette keys, prop sets, hazard sets), with class-restricted pools, acceleration zones, shortcuts, hazards, and a pacing linter
(`pacing-linter-rules`, `landmark-and-sightline-legibility`). A seeded generator is allowed only if the linter is its acceptance test and the stored plan, not the seed, is what ships (`seed-determinism-contract`).

### C3 Combat and economy depth

More weapons and one-race consumables (spikes, turbo boost, fuel, sabotage-like sneaky options, a shotgun-style close weapon), pickups on track, repair in increments, trade-in value, loans and debts, contraband-style side contracts, bonuses
(clean race, win streak, total destruction). Registry: `realtime-combat-semantics` (one HP authority, hit dedup, wreck as state tag, telegraph), `game-economy-tuning` (structure before numbers, faucet/sink band, no winner-take-all loop, tornado sweep), `encounter-balance-simulation` (2,000 seeded races per scenario).

### C4 Career v2 and rivals

A career ladder of many more events, named rival drivers with personalities as data profiles who buy cars and upgrades (an economy for rivals, not scripted), cups, a final duel, difficulty tiers by skill not power
(`skill-scaling-versus-power-scaling`), and a pacing simulation (2,000 seeded careers: races to first upgrade, to each tier, bankruptcy rate). Early-wreck fairness gets its own metric, because Phase 1 hardware sessions had both humans wrecked inside lap one.

## d. Integration (after both streams, one Astra run on a merge branch)

- **I1 Renderer integration**: a libGDX `TextureAtlas` loader with the **procedural drawing kept as the fallback for any asset missing or failing**, so the game never breaks on missing art. Cars, tiles, barriers, props, pickups, effects, HUD from the atlas;
  rotation, tint for liveries, damage-state swap, and decals driven from sim state through the existing read-only snapshot (the rules never see a sprite).
- **I2 Stick budget**: texture memory on a 1.7 GB device with a 32-bit userland. Declare a texture budget in MB per scene and per atlas page, measure PSS on the Stick (`dumpsys meminfo`), use ETC2 or reduce atlas sizes if needed, and keep frame time inside the Phase 1 figures
  (frame p50 16.7 ms, no growth over a 15-minute soak). If a heading strategy or an effect breaks the budget, it is cut, not tuned around.
- **I3 Gate G2** (owner): a session with real art on the Stick; the owner judges "better than the 1996 original?" Write `G2-REPORT.md` with evidence and the tier of truth for each claim (exists, valid, wired, behaves, felt); only the owner certifies felt.

## e. Ground rules

- No pixel of the original game, no extraction, decompilation, scraping of its art or audio, and no names, geography or tuning values copied from it. Study it only through public descriptions. Our names, tracks, cars and art are original.
- Grok usage is a **budget**: log every call in the generation history, stop at the first quota or rate-limit error, never loop on errors, and report spent versus remaining at the end of each batch. Do not delete or overwrite accepted assets; versions go to new ids.
- The Grok output is the owner's account usage. Do not run video generation unless a brief explicitly needs it (effect frames can be image sheets); video is out of scope for this phase unless the owner asks.
- Art lives under `deathride/art/` (briefs, style, raw is git-ignored, accepted assets committed under `deathride/assets/` with their sidecars). Keep the repo size sane: accepted atlas pages only, no raw dumps.
- One authority per number; build green at every commit: `:core:test`, `:link:test`, `:app:assembleDebug`; core stays pure JVM and deterministic with the zero-allocation guarantee.
- The Stick is at a DHCP address that changes; scan the /24 for port 5555. If it is offline, do the work that does not need it and say `not measured`.
- Each wave: design note first (`docs/concepts/deathride/<id>-*.md`), tests or gates with content assertions, a status row and a session-log entry below, one commit per wave on its branch, never push, no questions.

## f. Status table

| Stream | Id | Wave | Depends on | Status | Commit | Date |
|---|---|---|---|---|---|---|
| Art | P1 | Style bible, briefs, generation driver, budget guard | - | complete; ten raw candidates, not accepted | art-p1-20261001 | 2026-10-01 |
| Art | P2 | Post-processing, deterministic gates, local VLM grader, contact sheets | P1 | gates complete; human calibration pending | art-p2-20261001 | 2026-10-01 |
| Art | P3 | Car family: reference sheets, states, liveries, heading strategy | P2, C1 | ten references and heading decision; states/liveries await owner reference approval | art-p3-20261001 | 2026-10-01 |
| Art | P4 | World kit: tiles, barriers, props, pickups, decals, effects, HUD, portraits | P2 | not started | | |
| Content | C1 | Roster v2 (8-10 cars, tiers) | - | not started | | |
| Content | C2 | Tracks v2 (24+, themes, linter) | - | not started | | |
| Content | C3 | Combat and economy depth | C1 | not started | | |
| Content | C4 | Career v2 and rivals | C2, C3 | not started | | |
| Integration | I1 | Atlas renderer with procedural fallback | P3, P4, C2 | not started | | |
| Integration | I2 | Stick texture and frame budget | I1 | not started | | |
| Integration | I3 | Gate G2 report, owner session | I2, C4 | not started | | |

## g. Session log

(each run appends: wave, date, what changed, commands with results, what is `not measured`, spend of the Grok budget, next wave)

### P1, 2026-10-01 (restart of interrupted art work)

Design first in `deathride/P1-style-and-pipeline.md`. Preserved the inherited style, budget and eight charges; audited four interrupted jobs and issued new revision IDs. Explicit Grok session binding verifies the exact prompt and one image call, live quota observation latches stop, and resume refuses to spend on uncertain or corrupted prior outputs. `python deathride/tools/art/gen.py` now materializes all five cars and five tiles from `p1-current.csv`; a second run added zero reservations. Seven Python contract tests pass. `:core:test :link:test :app:assembleDebug`: BUILD SUCCESSFUL (47 up-to-date tasks). Car and tile raw contact sheets are in `deathride/art/contact-sheets/`. Eight new calls this wave; weekly ledger 16/180 images, 164 remaining, zero videos, no quota error. Car key colours and tile subject intrusion are visible defects for P2, not acceptance. Device and owner quality not measured. Next P2.

### P2, 2026-10-01

Design first in `deathride/P2-acceptance.md`. Added deterministic keyed extraction/despill/scale/pivot/gutters, palette and frame gates, full-resolution source and shipping-tile seam metrics, autocorrelation, and hash-bound acceptance reports/contact sheets. Historical Trail, Bastion, asphalt and oil defects are caught; exact numbers are in `deathride/art/ACCEPTANCE.md`. Both local Ollama models graded 30 frozen agent-labelled images (28 natural, two mutations): MiMo diagnostic false-clean 5/8 defect fields, Qwen 1/8; human-labelled calibration remains pending and models never accept. Initial schema failures are retained; confidence enum fixes their cause. Six Grok correction calls; empty material prompts remove vehicles, final oil passes pixel gates, gravel reaches its three-attempt cap still repetitive. Weekly ledger 22/180 reserved, 158 remain, zero videos, no quota error. Seventeen Python tests pass; `:core:test :link:test :app:assembleDebug` BUILD SUCCESSFUL (47 up-to-date). Owner sheets per batch under `deathride/art/contact-sheets/`. Device/owner quality not measured. Next P3, with explicit reference approval dependency preserved.

### P3, 2026-10-01

Design first in `deathride/P3-car-family.md`. Captured the C1 ten-class scale authority from `09d849d` read-only, with hash and integration mismatch checks. Ten invariant references pass pixel gates after one Needle camera correction and one Kestrel margin correction; both local models supplied semantic and family observations. Per-class and batch owner sheets are in `art/contact-sheets/`. Prepared 40 state and 30 livery briefs, but generated none: the plan explicitly requires owner reference approval first, and no new reference has that approval. The driver rejects missing evidence or changed reference bytes before any spend; approval remains pending without a question.

The approved original Line provided a small conditioning control: silhouette IoU 0.9980 with image_edit versus 0.9499 without a reference (one per arm). A generated 16-heading sheet had sixteen cars but failed heading sequence and added grid lines. The isolated AFTKM probe measured one/16/32 representations at p50 16.753/16.776/16.758 ms and 0.25/4/8 MiB RGBA storage; runtime rotation is preferred. PSS, p95, raw logs and screenshots are recorded; the prior game activity was restored. Full gameplay performance, soak and owner quality remain not measured. Findings are in `PITFALLS.md`. Twenty Python tests pass; `:core:test :link:test :app:assembleDebug` BUILD SUCCESSFUL. Fifteen image calls this wave; weekly ledger 37/180, 143 remain, zero videos, no quota error. Next P4; revisit derived car states only after exact reference approval.
