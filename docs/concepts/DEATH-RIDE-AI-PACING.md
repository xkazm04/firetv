# Death Ride: opponent AI behaviour and race pacing (Z0-Z4)

Written 2026-10-04 from the owner's decisions. The owner kept the rule that boss promotion needs **winning the boss race** (first place) and asked for opponent behaviour that is managed per race.

## Owner decisions (verbatim, then host reading)

> keep the rule, but lets talk about AI. In racing which lasts 2 or 3 circles we will need to manage how each opponent behaves: 1. Default behavior given by his car strengths - some would try more to race, some to destroy and be physical 2. Strategic behavior - trying to destroy first two cars as main focus, keeping leaders always in bit of disadvantage
> 1. Any leader duo 2. Allowed to wreck the leader 3. Bosses should have extended health. It is good idea to target player's weakest part 4. No visible cue 5. 8 laps are too much, I would cut it in half and rather focus on design of tracks if the race would be too short, first races in each level should have 2-3 minutes total time, final up to double as they should be longer and more complex

Host reading:
- **Hunters target any leader duo**: the two cars currently in positions 1 and 2, whoever they are (the human or AIs), symmetric.
- **They may wreck the leader.** Contact, ramming, shots, mines and blocking are all allowed, inside the bounded rules below.
- **Bosses get extended health** (a data multiplier on boss entrants) and target **the player car weakest part**: derive a weakness profile from the player car (stats relative to its tier band and its current damage: for example low armour, low handling, low grip, low top speed, low weapon slots, and the class identity pair weakness) and map each weakness to a tactic (low armour: ram and Hammer; low handling: push or block in corners; low acceleration: block and brake-check; fragile light cars: ram and mines).
- **No visible cue** that the hunt is on: no HUD marker. (Taunt lines may stay as ordinary story text if already present; add no new cue.)
- **Pacing**: the current campaign has 8 to 14 laps per event (`deathride/core/src/main/resources/data/campaign.csv`, 35 events). Cut laps roughly in half, but define length by **time**, not by laps: the **first race of each level (division) takes about 2 to 3 minutes** total, the **final race of a level up to double (about 4 to 6 minutes)** and must be longer and more complex; if a race would be too short, **fix it with track design** (longer, more complex courses), not with more laps of a short track.

## Constraints that already bind (do not break)

Deterministic 60 Hz step, no allocation, no wall clock, same physics for the AI as the player (no speed or grip cheats, no rubber banding: the hunt is **behaviour**: targeting, blocking, contact, shots, mines, abilities). One HP authority, hit dedup, no one-shot kills, start protection of four seconds, attack slots (`aiMaxAttackers`, 2 today), perception-based decisions with no omniscience, the early-wreck fairness gate (under 5% of events lost by the human lead before the end of lap one), tiers Rookie/Club/Pro/Champion differ by skill not power, saves still load, no dead end. Registry notes (read only): `C:\Users\kazda\kiro\ai-registry\knowledge\game-production\systems-canon\agent-behaviour-authoring` (behaviour-model-selection: at most four modes, hybrid by hierarchy; commitment-and-recovery-windows; perception-before-decision; group-coordination-without-a-hive-mind: slots or tokens with leases, cap concurrent attackers, broadcast facts not commands; decision-trace-as-evidence; ai-corner-speed-from-grip-limit; no-double-grip-penalty; ai-distances-from-car-size), `balance-validation\difficulty-design-and-adaptation` (skill-scaling-versus-power-scaling, the cross-tier skill-swap test), `balance-validation\encounter-balance-simulation` (winner share, rotation cross-check, seed diversity, gates shown able to fire), `balance-validation\combat-pacing-and-dramatic-arc`.

## Z0 Design note and data model (first)

`docs/concepts/deathride/Z0-ai-behaviour.md` with sources. Current state (read the code first: `core/.../World.kt` driveAi and `AiMode` DRIVE/OVERTAKE/RECOVER, `Combat.kt` AI targeting around the `aiMaxAttackers` cap and `lastTarget`, data `rivals.csv`, `ai-skills.csv`, `combat.csv`, `Career.kt`, `DeathDuel.kt`, `AshCircuit.kt`): modes are three; rivals have a few style scales (lane bias, pass distance, fire range, heavy range, mines); targeting is nearest-forward-in-range with a slot cap; nothing knows rank, race phase or intent.
Specify two layers on top, as data (CSV) with one authority per number:
1. **Temperament** (static, from the car and the persona): dials for contact willingness (ram and block), preferred fighting range, risk (wall closeness, drift use), ability use, and target preference weights. Defaults from the car archetype table (Bastion and Bulwark bruisers; Needle, Line and Trail racers that avoid contact; Quill contact fighter that lines up spikes; Kestrel harpoon hunter; Comet straight-line overtaker; Vandal and Flint brawlers; the rig is a mine layer) with a per-named-rival offset (Rook late-brake passer, Ox bruiser, Mica patient corner hunter, Vex straight-line gunner, Relay tactician, Marrow calculated enforcer). Each ability gets an AI use rule consistent with its archetype.
2. **Strategy**: a **race plan** with phases by race-progress fraction (settle, pressure, all-in, final lap commitment), chosen per race by tier, role (field, rival, boss) and position. The **hunter** plan: the AIs whose plan says hunt choose the current top two as targets, with attack slots (cap per target, lease times, cooldown after a hit, no pile-on beyond the cap), start protection untouched, and a commitment window so targeting does not flip-flop (hysteresis). Symmetric for AI leaders. Not every AI hunts: define how many hunters per race by tier (Rookie: temperament only; Club: light hunt; Pro and Champion: full hunt) so the human is pressured, not ganged, and the pack stays raceable.
3. **Boss behaviour**: extended health as a data multiplier on boss entrants (careful: one HP authority; a bigger max HP, never a hidden damage reduction), and **weakness targeting** of the player car per the host reading above, with the weakness profile and the tactic table as data.
Decision trace (registry `decision-trace-as-evidence`): each AI logs its mode, plan phase, target, reason, so headless tests can explain behaviour.

## Z1 Pacing by time, and track design

Measure **lap times per course** with the reference driver at each tier (all 25 courses and the finale arena); define each event's duration target and **derive the lap count from the target time** (laps = nearest integer to target time over lap time, minimum 2, with a sensible maximum): the first event of every level 120 to 180 s, the last event (the level final) up to double, 240 to 360 s, and the rest interpolated; the campaign has seven visits (`campaign.csv` phases build-up, pressure, boss, payout), keep the 35 stable event ids (saves). Where a course is too short for the target at a sensible lap count, **redesign or lengthen it**: author longer, more complex courses (more corners, elevation-free variety: hairpins, chicanes, surface changes, shortcuts, obstacles from the gameplay obstacle system) for finals and bosses, through the existing track format and linter (`Tracks.kt`, `track-rules.csv`; mutation tests for every new rule; scale contract; art themes and the prop kit stay as applied; no new art generation); record each course's lap time and complexity in data. The death duel stays a last-car-running fight with its own length.

## Z2 Implementation and tests

Implement in `core` (deterministic, allocation-free in the step), wire phone and TV nothing new (no visible cue), content data for rivals, bosses and tracks. Tests with content assertions: every temperament and plan produces the intended decisions in controlled scenarios (hunters pick positions 1 and 2, slots cap attackers, a hunt cannot start inside the start protection, hysteresis, no omniscience), determinism, zero allocation in the step, saves load and migrate, no dead end.

## Z3 Simulation and balance (the rule stays: win the boss race)

Headless: 2,000-career cohorts and the duel simulation re-run with the new AI and the new lap counts: boss-race win rates by tier and skill (the rule must stay achievable: report honestly; tune boss health, ally payouts, difficulty, not the rule), race durations against the 2 to 3 minute and up-to-double targets for all 35 events, early-wreck fairness for the human lead (under 5% before lap one), leader pressure metrics (share of leader damage from hunters, number of simultaneous attackers never above the cap, leader position changes per race so the pack stays tight), class winner share and the skill-beats-power invariants, completions and censoring and the campaign length in hours (the old 4 to 6 hour target will shrink with shorter races: report the new figure and flag it for the owner), the instrument self-review (gates shown able to fire, seed diversity alarm, rotation cross-check).

## Z4 Owner review page and Stick check

`deathride/ai/design/index.html` (static, offline): per-car and per-rival temperament table, the race plan phases, the hunter rules, the boss weakness tactic table, the event duration and lap table for all 35 events, the new or lengthened courses, the simulation results before and after; a Keep, Maybe or Reject choice with a note per decision and a Copy Markdown export in the format of `deathride/audio/report.js` and `report.css`. Give it as a full file:/// URL. A Stick check under app id `dev.deathride.ai` (never `dev.deathride.tv`; scan the /24 for port 5555; the Stick is free): a scripted race showing hunter behaviour and a measured race duration; frame-time figures as measured (the optimisation pass is deferred by owner decision N3).

## Rules

Original work only. One design note, status row, session-log entry and one commit per wave; build green (`:core:test :link:test :game:test :app:assembleDebug`, browser checks) at every commit; no Grok or ElevenLabs spend; never push; never ask a question.

| Id | Wave | Status |
|---|---|---|
| Z0 | AI behaviour design and data model | complete: design and six proposed CSV tables; required build and six browser suites pass |
| Z1 | Pacing by time, lap counts and track design | not started |
| Z2 | Implementation and tests | not started |
| Z3 | Simulation and balance | not started |
| Z4 | Owner review page and Stick check | not started |
