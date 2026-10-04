# Death Ride: car abilities (A0-A3)

Written 2026-10-02 from the owner's car review (`deathride/art/OWNER-CHOICE.md` section C in the art worktree `C:\Users\kazda\kiro\firetv-deathride-art`):

> Quill ... a medium weight car specialized on using rear and front spikes for close contact damage.
> Kestrel ... introducing electricity, having engine overpowering with energy, front spike transformed into electric harpoon ... overall the cars are structured well to give their unique ability. It can be turbo, long range or contact weapon.
> Comet would need rework, having air turbines as engine with more massive back construction to handle it.

The owner's principle: **each car structured to give its own unique ability.** The roster already has ten classes with stat identities and a Power Rating budget (`DEATH-RIDE-PROGRESSION.md`, C1 roster). Abilities make the identities active, not only statistical.

## A0 Merge the drift stream into this branch (first)

This branch is `deathride/abilities`, cut from `deathride/integration`. `deathride/drift` (D1-D3: class-scaled axle drift, Drift Lab) is finished and unmerged, and a trial merge conflicts in seven files: `OWNER-CHECKS.md`,
`controller/index.html`, `core/.../World.kt`, `game/.../AtlasEffects.kt`, `RaceGame.kt`, `TrackScene.kt`, `link/.../RaceServer.kt`.
Merge it carefully: keep both streams' behaviour (atlas rendering, edge/verge fix and longer career from integration; the drift model and calibration from drift), prove it with tests (integration had 89 core / 3 link / 3 renderer tests;
drift had 106 core), the zero-allocation and determinism tests, and an APK build. Record any behaviour that had to be chosen between the two. Commit as one merge commit.

## A1 Ability design (note first, with sources)

Design one **signature ability per car class** for the ten classes (Needle, Line, Bastion, Comet, Trail, Flint, Quill, Vandal, Kestrel, Bulwark), as data. Sources: the roster stat identities, `W4-weapons-and-damage.md`,
`realtime-combat-semantics` and the registry notes in `C:\Users\kazda\kiro\ai-registry\.claude\worktrees\forge-racing-tv\knowledge\game-production` (read only).
Rules from those notes that bind: one authority for HP, hit dedup per activation, wrecked as a state tag, a start-protection window, no weapon kills a full-health car in one hit, every time value typed in seconds, telegraph or arming for
area effects, one authority per number, and skill-based, not power-based, balance (each ability costs the car something; the Power Rating budget stays within the tier band, so abilities are paid for by the car's stats or by cooldown or energy, not free).
Three ability shapes the owner named: **turbo** (a burst of speed), **long range** (a ranged weapon), **contact weapon** (close-contact damage). Suggested, to refine:

| Car | Idea | Shape |
|---|---|---|
| Quill | bone spikes front and rear: bonus ram damage on contact and a damage-reflecting rear spike against chasers; costs top speed and handling through mass | contact |
| Kestrel | electric harpoon replaces the front spike: a short-range tether or shock that damages, slows or pulls a target; the over-energised engine gives an energy meter that powers it | long range / hybrid |
| Comet | air-turbine engines: a turbine turbo burst, hot and fragile (overheats, or loses grip or steering while active) | turbo |
| Needle | steel-silver light buggy: a quick dash or evasive flick; fragile | turbo / evasion |
| Bastion, Bulwark | heavy plating: a shoulder-charge or armour surge (damage reduction for a short window) | contact / defence |
| Trail, Line, Flint, Vandal | the remaining identities (grip rally, balanced, brawler/gunship, trickster): one each, distinct from the others and from existing weapons (Rivet, Hammer, Mine) | mixed |

Each ability needs: an input (a phone button or hold, which interacts with the existing layouts Classic/Cruise/Split and the left-handed mirror; the phone controller page must gain the control without breaking driving), a cost (energy meter,
cooldown or ammo), a telegraph, a counter, an AI use rule (perception-based, no omniscience), a presentation hook (an effect id for the art kit), and a Power Rating adjustment.

## A2 Implementation, data-first in `core`

One abilities data file (CSV) and a deterministic implementation in the 60 Hz step: no allocation, no wall clock, determinism and zero-allocation tests extended. Abilities respect the existing combat rules (hit dedup, one HP authority,
start protection, no one-shot kills). Wire the phone controller control, the host HUD, the AI usage rule, and presentation hooks (procedural fallback if the art asset is missing). Keep every existing test green.

## A3 Balance, evidence and owner checks

Extend the headless balance report: per-class win share over the declared course mix with abilities on (winner share, not entry rate), skill-beats-power invariants still hold, early-wreck fairness (under 5% of events lost before lap one
for the human lead) not regressed, no dominant class, class-by-course rotation cross-check, seed diversity alarm. Report ability use rate, damage share from abilities, and time-to-first-wreck distributions.
Stick check under app id `dev.deathride.abilities` (never replace `dev.deathride.tv`; scan the /24 for port 5555) with the frame budget. `OWNER-CHECKS.md` entry per ability, with plain words for good and bad. Honest tiers of truth: simulated versus felt.

## Rules

Original work only. Build green at every commit (`:core:test :link:test :app:assembleDebug` plus the renderer tests). One design note, one status row, one session-log entry and one commit per wave (A0, A1, A2, A3). Never push, never ask a question.

| Id | Wave | Status |
|---|---|---|
| A0 | Merge drift into this branch | complete — seven conflicts reconciled; 105 core / 3 link / 3 renderer; APK green |
| A1 | Ability design note | complete — sourced ten-class design and CSV; authored cost/escape checks; build green |
| A2 | Abilities in core, controller and AI | complete — 116 core / 3 link / 3 renderer; zero allocation; six controller layout/mirror checks; APK green |
| A3 | Balance report, Stick check, owner checks | complete - 66,000 races pass; 120 core / 3 link / 3 renderer and APK green; Stick frame/input gaps logged; owner feel pending |
