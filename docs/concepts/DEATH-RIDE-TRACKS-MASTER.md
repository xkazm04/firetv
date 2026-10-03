# Death Ride: track design, research and mastery (T0-T3)

Written 2026-10-04. Owner: "I agree, the track design should be our next priority to research and master", after deciding that races are cut by time (the first race of each level 2 to 3 minutes, the level final up to double and longer and more complex) and that short races are fixed by **track design, not more laps** (`DEATH-RIDE-AI-PACING.md`, branch `deathride/ai-pacing`, which is lengthening courses for pacing in parallel).
Goal: understand what makes a good track in a top-down vehicular **combat** racer, build the instruments that measure it, then author and master a track library for the five themes and the finals. This is a design discipline project: research first, instruments second, design third.

## Facts about what exists

- Track format and linter: `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt`, `TrackContent.kt`, data `track-rules.csv` (width in widest-car-widths 3.6, corner radius in longest-car-lengths 2, pacing band, grid lint, ribbon overlap), mutation tests (all ten base rules have mutants), the scale contract (`presentation.csv`), 25 courses in five themes plus the finale arena, surfaces (asphalt, gravel, oil, ice, kerb, verge, offtrack), natural obstacles with footprint and effect class (gameplay run), pickups, the art prop kit per theme, the minimap from data.
- Campaign: 35 events (`campaign.csv`), seven visits, bosses per level, the finale a last-car-running fight.
- The cars: ten classes with different size, mass, speed and handling; abilities; weapons (Rivet, Hammer, Mine at 0.5 m); six cars per race; the human and AIs with temperament and hunter plans (AI run in progress).
- Registry notes (read only; the racing-vehicles and couch subjects exist only on the unmerged forge branch, so read those under `C:\Users\kazda\kiro\ai-registry\.claude\worktrees\forge-racing-tv\knowledge\game-production`, and the rest under `C:\Users\kazda\kiro\ai-registry\knowledge\game-production`): `balance-validation\procedural-level-planning` (pacing-linter-rules, landmark-and-sightline-legibility, critical-path-to-optional-branch-ratio, seed-determinism-contract), `...\racing-vehicles\racing-track-authoring-and-lint` (width and radius in car units, straight-fraction band, oriented-capsule grid lint, mutate-good-track-to-prove-linter, px-per-metre scale contract), `...\balance-validation\combat-pacing-and-dramatic-arc` (tension curve, duration envelopes), `...\systems-canon\agent-behaviour-authoring`.
- The 1996 original may be studied only through public descriptions (a side experiment collected unverified notes at `C:\Users\kazda\kiro\firetv\.contest\experiments\gpt61-sol-death-rally\research`); never copy tracks, names or layouts.

## T0 Research and the design language (a note first, with sources)

`docs/concepts/deathride/T0-track-design-research.md`. Do real web research (top-down and arcade racing track design, kart and combat racers, race flow, overtaking opportunity design, corner sequencing and rhythm, risk and reward shortcuts, hazard and pickup placement, arenas and combat sections, readability at camera zoom and sofa distance, difficulty ramps across a campaign) and read the registry notes above and the existing code and data. Produce:
1. **A track grammar**: the vocabulary of segments (straight types, sweepers, kinks, hairpins, chicanes, esses, double-apex, decreasing or increasing radius, off-camber sections as surface changes, narrow gates, wide overtaking zones, jump-free elevation substitutes such as surface and width changes), with the measurements that define each in car units.
2. **Combat track elements** specific to this game: ambush straights, mine alleys, pickup shortcuts and risk-reward lines, obstacle fields from the obstacle system, choke gates where six cars compress, wreck-lane hazards, safe versus aggressive lines, places where hunters can trap a leader, arena-style loops for the boss and finale.
3. **Rhythm and pacing rules**: what a two to three minute opening race and a four to six minute final should contain (corner count and variety, straight fraction, overtaking zones per lap, rest beats, the tension curve across a lap and across a division), how a course teaches one new thing per course, and how theme (foundry, slag, salt flats, quarry, mountain, speedway) shapes the grammar.
4. **Quality criteria as measurable claims** that T1 will compute (candidates below), each with a hypothesis and a threshold proposal; label which are authored and which are validated by simulation, and which only the owner can judge (feel).

## T1 Instruments

1. **Track quality report** in the headless suite (core tests or a tools runner): for every course, computed: length, lap time by tier (reference driver), curvature histogram and corner count and variety (radius sequence entropy), straight fraction and longest straight, width profile and the number and quality of overtaking zones (a braking zone followed by width of at least n car widths), compression points (min width events), surface and obstacle load, pickup reachability and risk-reward, and from **AI-only six-car simulations over many seeds** the behaviour: position changes per lap, overtakes, contact and wreck rate by section, spin and stuck events, line diversity, time-to-first-wreck, early-wreck fairness for the human lead, hunter trap spots. Heatmaps of contacts, wrecks, spins, speed and racing lines. Thresholds as data; the gates shown able to fire (planted bad courses); seed diversity and rotation cross-checks.
2. **Static report pages**: `deathride/tracks/atlas/index.html`: all 25 courses and the arena with the minimap, the metrics, heatmaps and the grammar tags; a comparison matrix; a Keep, Maybe or Reject choice with a note per course and a Copy Markdown export in the format of `deathride/audio/report.js` and `report.css`. Give it as a full file:/// URL in your report.
3. **Track Lab** (desktop, in the libGDX desktop launcher in the style of the Drift Lab, or another faithful tool if you justify it): load a course, edit control points and width profile, surfaces, obstacles and pickups with live linter results, run a quick AI race and see lap time and heatmaps, export the course in the existing data format; no change to any existing course data in T0 and T1.

## T2 Master the library (gated: starts after the AI and pacing run has finished)

The AI run (`deathride/ai-pacing`) lengthens courses to meet the time targets. When T2 starts, **merge `deathride/ai-pacing` into this branch first** (conflicts resolved with tests), then redesign: using the grammar and the instruments, author a **mastered library**: for each of the five themes one opening course (two to three minutes at its tier), mid courses, and a longer, more complex final course, plus the boss and finale arenas; each teaches one new thing, has designed overtaking zones and combat elements, passes the linter and the quality gates, and is validated by AI-only simulation and the pacing time targets (first race of each level 120 to 180 seconds, finals up to double). Keep the 35 stable event ids; the course assignment of events may change. Use the existing art kit and per-theme props; no new art generation. The simulation must show hunters can trap a leader on some courses but not make any course a wreck lottery.

## T3 Evidence, owner pages, Stick check

Updated atlas page with the new library and before and after, owner review (Keep, Maybe or Reject with notes and Copy Markdown), build green, a Stick check under app id `dev.deathride.tracks` (never `dev.deathride.tv`; scan the /24 for port 5555) with scripted races on new courses, tiers of truth (nothing felt until the owner says so), a short **knowledge note** for the registry (what was learned about combat-racer track design, as a draft in `docs/concepts/deathride/T3-knowledge-for-registry.md`, not written into the registry).

## Rules

Original work only; no Grok or ElevenLabs spend; one design note, status row, session-log entry and commit per wave; build green (`:core:test :link:test :game:test :app:assembleDebug`, browser checks) at every commit; never push; never ask a question.

| Id | Wave | Status |
|---|---|---|
| T0 | Research and the design language | not started |
| T1 | Instruments: quality report, atlas page, Track Lab | not started |
| T2 | Master the library (after the AI run) | gated |
| T3 | Evidence, owner pages, Stick check, knowledge note | gated |
