# Death Ride: the progress dimension, campaign, story, stats timeline and car archetypes

Written 2026-10-01 from the owner's brief. It binds Phase 2 waves **C1 (roster), C3 (economy), C4 (career)** and the art briefs for rival portraits and story cards.
Where it conflicts with `DEATH-RIDE-PHASE2.md`, this file wins for those waves. Numbers here are **proposals to be checked by simulation**, not facts; every claim of balance
must come from a headless simulation, and every claim of feel stays `not measured` until the owner has driven it.

## a. The promise to the player

You start with a poor car in a poor league, up against drivers with poor cars. Every race you clear pays money; money buys upgrades and then a better car; as you rise, so does the
field, so the game stays tense at every step instead of becoming a stroll. Each car type has a **visible strength and a visible weakness**, so the player's choice of car is a
choice of playstyle, and **skill can beat raw power**: a small, fragile sports car driven well wins through lines and corner speed, never through out-gunning heavier cars.

## b. Power rating: one number that makes "poor" and "rich" comparable

Define a car's **Power Rating (PR)** as a weighted sum of its derived physical stats (speed, acceleration, grip, handling, armor, mass, weapon slots), computed from the data in one function in `core`
(single authority; the shop, the AI and the UI all call it). Weights are data (`pr-weights.csv`) and are chosen so that **equal PR means equal expected race strength on a mixed track set**; the
simulation (below) is what calibrates the weights, not intuition. Upgrades add PR through the same function. The AI's cars and the player's cars use the same PR, so a timeline of "player PR vs field PR" is a real chart,
not a story.

## c. Archetypes: every car has a price on its strength

**Budget rule (linted):** within a tier, every car has the same PR within +-3%. A car is strong somewhere only by being weak somewhere else. The linter fails any car that is not at least
**+2 sigma-bands high on one primary stat and low on another** (an "identity pair"), and any car at the budget with no weakness.

Stats are shown to the player as bars on TV and phone, and in the shop; the weak bar is drawn in a warning colour. Handling is two separable things in the derived physics:
**steering authority** (how much lock the car gets at speed) and **response** (how quickly yaw follows the thumb). Heavy cars lose both; light cars gain both.

| Archetype | Wins on | Pays with | Derived physics (relative to a mid car) | Skill expression |
|---|---|---|---|---|
| **Heavy bruiser** (current Bastion line) | armor +, mass +, **top speed +, engine power +** (it takes a lot to hurt it and it wins ramming and straight-line pushing) | **acceleration --, steering authority and response --, braking --** (slow to launch, wide in corners, hard to stop) | high mass, high armor reduction, low yaw rate, long braking distance, big turning radius | Win by lane choice, never needing to turn late, using mass in contact; punished by tight tracks and hairpins |
| **Light sports** (current Needle line) | **acceleration ++, steering authority and response ++, brake ++** (perfect feel) | **armor --, mass --, top speed capped, engine power limited** (fragile; loses every shove; outrun on a straight) | low mass, low HP, high yaw rate, short stopping distance, capped speed | Dominates technical tracks and clean air through the line and corner exit speed; dies if it trades paint; skill wins, overspeeding cannot |
| **Top-speed racer** (Comet) | top speed ++ | cornering, armor | long straights, low grip | Needs a free line; loses on technical tracks |
| **Grip rally** (Trail) | grip ++ on loose surfaces, stable | top speed, armor | surface-dependent | Best on gravel, ice and oil, mediocre elsewhere |
| **Balanced** (Line) | no weakness | no peak | everything within one band | The safe pick, rarely the winning one |
| **Brawler / gunship** | weapon slots +, ammo +, mounts | speed, armor | more slots, heavy weapon | Wins by shooting, a combat-track specialist |
| **Dirty trickster** (new) | mines, sabotage, carries consumables | frail, slow | utility slots | Wins by traps and positioning |

Ten cars: at least two per tier-band built from these archetypes, so progression is also a **sidegrade** choice at every tier (two rookie cars, two club, two pro, two elite plus two specials), never a straight ladder. Tiers are
**Rookie, Club, Pro, Elite, Champion**; PR budget grows with tier by the curve in section e.

**Skill beats power, proven by simulation, not asserted.** For every tier, the simulation (2,000 seeded races per scenario, actual fixed-step rules, `encounter-balance-simulation`) must show:

1. **No dominant class**: at equal tier, no class wins more than 55% of entries across the mixed track set, and every class is the best class (by mean finish time) on at least one track type and the worst on at least one (`tier-band-peer-outlier-linting`).
2. **Skill ladder, not an overspeed ladder**: the same light car driven by the AI at *Champion* skill (line quality, braking accuracy, reaction delay, the three skill axes of `skill-scaling-versus-power-scaling`) beats a *Rookie*-skill heavy of the same tier on technical tracks;
   the same heavy at Rookie skill beats a Rookie-skill light on a straight-heavy track. If skill moves the result by less than a declared margin, the skill axes are broken, not the cars.
3. **The light car cannot win by speed**: with all AIs at equal skill, the light car's top-speed deficit must show up as time lost on a long-straight track (declared minimum), and must not be made up by free acceleration advantages alone.
4. **The heavy car cannot win by being untouchable**: a heavy that never turns well must lose measurable time on a hairpin track; its armor must not make it unkillable (kill time under a declared envelope with the `encounter-duration-envelopes` bands).

## d. The story: a campaign worth the climb

Original setting and cast (no use of the original game's story, names or places). Short, hard-edged, told in **story cards** (one image, three lines of text, between events; art from the P4 portrait/backdrop kit) and in rival taunts; nothing gates play on reading.

**Working title of the arc: "The Ash Circuit".** You inherit a burnt-out garage and a debt from a sibling who vanished mid-season. The debt is owed to **Marrow**, who owns the Ash Circuit, a blood-money racing league across five rust-belt towns.
You race to pay the debt, then to find out why the books were cooked.

| Act | Division (tier) | Place | Beat | Boss rival |
|---|---|---|---|---|
| 1 | **Scrap League** (Rookie) | The Yards | You owe, you own nothing; the first win pays the first part | **Rook**, a bitter local |
| 2 | **Foundry Cup** (Club) | Foundry row | You are noticed; a loan offer you should refuse | **Ox**, the heavy |
| 3 | **Salt Flats Series** (Pro) | The flats and the quarry | The sibling's trail; the first sabotage | **Vex**, the speed freak |
| 4 | **Switchback Circuit** (Elite) | The mountain road | The books; a rival who knows more than she says | **Mica**, the grip artist |
| 5 | **The Crown** (Champion) | Marrow's own speedway | The reveal, a final duel on the home track | **Marrow** |

Side threads: optional **contracts** (deliver a car to a track, finish with one rival not finishing, win without a wreck) that pay extra and move rival relationships; **grudges** (a rival you wrecked remembers and races you harder, as a data flag on their profile, never as hidden power).
Rival identities in the code already exist (Rook, Ox, Mica, Vex, Relay); keep their names and give them stories. 30-40 events across five acts, not twelve.

## e. The difficulty and stats timeline

Four curves, all as **data tables** (`career-curve.csv`) and all plotted in the pacing report (`dataviz` skill when charts are produced):

1. **Field PR** `F(k)` for event k (k=1..N): the PR of the AI cars at that event.
2. **Player expected PR** `P(k)` if the player spends optimally for a typical skill: computed by the career simulation from the real shop, income and unlocks.
3. **PR ratio** `P(k)/F(k)`, the designed tension curve. Proposed shape: starts at **0.85-0.90** (poor car, poor field, slightly behind, scrappy), rises toward **0.95-1.0** as the player spends, **dips to 0.85-0.9 at each act boss** (a spike of difficulty), and ends **~1.05 at the final** so the finale is hard but fair.
   The ratio is **not** a rubber band: the field does not read the player's performance. It is a fixed schedule (rivals have their own wealth that grows at a declared rate and they buy cars and parts through the same shop; a rival who wins buys better and a rival who is wrecked is set back; named rivals follow a script of when they upgrade).
4. **Money timeline**: income per race `I(k)` (prize by position, kills, bonuses), and the price of the next upgrade and the next car, giving **races-to-afford**. Targets to check by simulation, not to assume:

| Milestone | Target races to afford | Check |
|---|---|---|
| First upgrade (tyres or engine, a visible change) | 2-3 | `races_to_first_upgrade` |
| First sidegrade or new car (Club) | 7-9 | |
| Each following tier | 7-9 more, growing slowly | tier curve is a smooth ramp (`progression-curve-shape-tests`: no step wall at joins) |
| Total campaign length | 30-40 events, 5-8 hours of play | |
| Bankruptcy rate for a reasonable player | under 3% (**no dead end**: a loss still pays something, repairs never cost more than the minimum job income, the insured economy from W5 stays) | |

Difficulty settings stay **skill, not physics** (Rookie/Club/Pro AI reaction, line quality and decisions, as in W7); the stats timeline above is the *content* difficulty and is the same for every setting.
**Early-wreck fairness (a named metric):** under 5% of events may end for the human before the end of lap one for a reasonable driver; Phase 1 hardware sessions exceeded this and the combat damage-to-wreck times (p50 ~15-17 s in the balance report) must be raised for the first two acts (armor and starting HP and weapon damage as data), measured by the simulation and then felt by the owner.

## f. What is simulated and what only the owner can judge

| Claim | How it is proven | Tier |
|---|---|---|
| Cars are within the tier budget and each has an identity pair | `core` linter test | valid |
| No class dominates; skill beats power; light cannot win by speed; heavy is not untouchable | 2,000 seeded races per tier scenario, with skill tiers | behaves |
| PR ratio curve, races-to-afford, bankruptcy rate, no step walls | 2,000 seeded careers using the physical outcome library (as in W7) | behaves |
| The story reads and the climb feels worth it | The owner, in a session | felt (owner only) |
| The weakness is *visible*: bars, warning colours, silhouettes, handling cues | Stick screenshots, then the owner | exists, then felt |

## g. Waves this file changes

- **C1 Roster v2**: build the roster by this file's archetype table and PR function, with the budget linter and the four skill-versus-power invariants; ten cars, five tiers.
- **C3 Combat and economy depth**: build the shop/economy to the money timeline; add the early-wreck fairness tuning.
- **C4 Career v2**: five acts, 30-40 events, the Ash Circuit story cards as data, rival economy and grudges, the four curves as tables, the pacing report as the evidence.
- **P4 art**: story-card backdrops (one per act), rival portraits (Rook, Ox, Vex, Mica, Marrow, Relay), act banners, a "weakness" iconography set; **P3 car silhouettes** must read the archetype (heavy long and wide, light small and low).
- **I3 Gate G2** adds: does the climb feel worth it, is each car's weakness visible, does a skilled player beat power. Owner only.
