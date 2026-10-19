# Death Ride: audio-less alpha wiring plan (2026-10-06)

Baseline: `deathride/main` = `main` 0158739f. Goal: one build the owner can play on the Stick, no audio, with all approved art that exists wired in and every missing piece degrading to procedural. Not a polish pass; gaps that need new generated art (53 region images, 11 prop edits; providers latched) are out of scope and stay procedural.

## Streams (disjoint file ownership; each in its own worktree, merged by the host)

- **S1 Cars + HUD** (`game/.../RaceGame.kt` HUD and preview sections, `AtlasArt.kt`): lobby/garage preview via the art path; minimap car markers coloured per seat (and a small car sprite if cheap); body-length fit so art matches contact shape; damaged/wreck frames keep seat identity (tint or marker); remove or implement the dead `-tint` lookup; atlas-skin the HP/armour/energy bars if the atlas has fills; Dispatcher art path decision.
- **S2 Story text** (`core` content/campaign, `DeathDuel.kt`, `AshCircuit.kt`, resources, minimal RaceGame hooks): load `narrative/lines.csv` (card, pre, post, finale kinds) with fallback to `story-cards.csv`; replace hard-coded duel/seizure text; show pre/post lines on career/results; show barks/announcer as short captions in race; length-fit check.
- **S3 Tracks** (`TrackScene.kt`, `RegionLook.kt`, `RegionAtmosphere.kt`): wire autotile barrier and track-edge and `course-ribbon` if they fit the Stick budget behind a safe fallback, else document why not; per-region barrier variety from existing assets; career course picker shows the course shape (generated from centreline, no new art).
- **S4 Release gate** (host): merge, `:core:test :link:test :game:test :app:assembleDebug`, desktop GL smoke, install on Stick, update OWNER-CHECKS with an alpha section.

## Rules
- Gradle is run one worktree at a time (lock in the scratchpad); daemons hold files.
- Procedural fallback must remain for every art lookup. No gameplay balance changes. No pushes.
- Known and unchanged: owner review of derived car frames, frame-time gate (N3: optimise later), unapproved story panels fall back.
