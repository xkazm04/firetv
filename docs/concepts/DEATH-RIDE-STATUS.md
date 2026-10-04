# Death Ride: where we are (start here)

Written 2026-10-04 at the end of the session. This is the entry point; `DEATH-RIDE-PLAN.md` is the original plan and each topic keeps its own note.
Nothing marked "pending" has been felt on the Stick or by the owner unless a note says so.

## Built and merged (all on `main`)

- **Game core:** libGDX + Kotlin, deterministic 60 Hz sim, Android phones as controllers over WebSocket (port 8765), six cars, drift model, weapons (Rivet, Hammer, Mine at 0.5 m blast, provisional), ten car abilities, shop and economy, AI temperament and hunter plans. See PHASE1, PHASE2, DRIFT, ABILITIES, PROGRESSION, AI-PACING.
- **Campaign:** 35 stable events across five regions (Ash Yards, Cinder Row, Salt Cut, Thin Air, the Crown), debt ledger, ally promotion, death duel. See CAMPAIGN-IMPL, CAMPAIGN-DESIGN-V2.
- **Tracks:** the owner-triaged library (37 Keeps) assigned to the 35 events; scrap-7 is scrap-7-e (owner pick; d and f archived). See TRACKS-MASTER and `deathride/tracks/atlas/index.html`.
- **Regions:** per-region palette, atmosphere and props from `region.csv`. See REGIONS.
- **Art direction:** the fusion (Soot Pulp portraits and barriers, Rust and Ink cars and ground, Hot Ink icons and effects). See ART-DIRECTION-V2.
- **Audio:** 14 recordings kept as fallbacks; no music yet (Suno later).
- **Story pass (2026-10-04):** `docs/narrative/` holds the research (R1 to R4), STORY-BIBLE-V2, FRAME-CHANGES, VOICE-BIBLES and WRITING-PROCESS; `deathride/narrative/lines.csv` is the 518-line script. Owner review page: `deathride/narrative/review/index.html`. Nothing of it is wired into the game yet.

## Owner decisions that bind

Owner decision logs: `DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md` and `-2026-10-04.md`, backlog notes N1 to N4 in `DEATH-RIDE-BACKLOG.md`. Standing rulings: boss promotion is winning the boss race (first place); bosses get extended health and target the player's weakest part; hunters target any leader duo and may wreck the leader; no visible hunt cue; races by time (first race of a level 2 to 3 min, finals up to double); keep the full feature package and optimise later (N3); art direction is the fusion; the announcer is noir-read Callum; no music for now.

## Open, in the order I would take them

1. **Owner reviews the story pass:** the frame changes (FC-01 to FC-23; recommended adopt, adopt later, reject lists are in FRAME-CHANGES), the 155-item review page, the key lines by reading aloud. Check FC-16 (bosses name your weak part only after the race) against the "no visible cue" ruling.
2. **Balance pass on the new track library:** boss first-place wins are Rookie 4/32, Club 2/32, Pro 0/32 at scrap-7-e; all ten class pools exceed the 55% dominance threshold; career completions fell from 905 to 459 per 2,000; developed pacing at scrap-7 is 211.97 s (target below); one stock-field car unresolved. The first-place promotion rule stays as ruled.
3. **Track distinctiveness:** nine kept "angled-fan" courses look alike; swap or rework some.
4. **Implement the story in the game:** story data, cards, barks, voice recordings (voices through the shared ElevenLabs account, credits reset 2026-10-04 19:31 UTC; Marrow has no cast voice yet); several bark triggers need wiring. Rewrite the Mechanic's silent line first (see the speech-synthesis note in the registry).
5. **Stick checks pending** for several waves (frame-time delta for regions unmeasured; app ids dev.deathride.perf and others; the Stick address changes, scan the /24 for port 5555).
6. **Art:** the agy follow-up run with a relaxed empty-output stop rule (the last run latched at 9/120); Grok is exhausted (402).
7. **Audio later:** per-car engine triage, tyre, skid, drift, mine-drop and lap sounds, Suno music.
8. **Offered, undecided:** a standalone repo for Death Ride; dropping the old stash from the track redesign.

## Working notes

- Never run Gradle from more than one worktree at once; daemons hold files.
- Astra runs use PowerShell launcher scripts under `.contest/runs/`; an hourly session cron checked them.
- Registry knowledge for this game lives in the ai-registry repo, bundle `game-production` (racing and TV games, and the new `narrative-and-dialogue` category with laws L14 to L17).
- Three empty folders `firetv-deathride-ai`, `-camp` and `-hud` under `C:\Users\kazda\kiro` could not be deleted on 2026-10-04: an unidentified process holds a handle inside them. Delete them after a restart.
