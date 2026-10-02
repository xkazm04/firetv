# K1 — Four roads into Death Ride

2026-10-02 · campaign direction triage · `deathride/campaign`

**Design intent throughout. None of these proposed campaigns has been played.** Existing-runtime measurements below are historical evidence, not a verdict on these directions. Original premises and new cast are authored here; Ash Circuit deliberately retains the project's original cast and story. No game code, CSV, art or audio is changed. No generation spend.

## Ground rules for a fair comparison

Each option has five progression stages, 35 events per completed route, five recurring rivals plus a final antagonist, three sample three-line cards, three taunts and the same economic promise. Their differences are the decisions between races, the dramatic stakes and the tone, not hidden stat advantages. Optional challenges overlay an event unless explicitly stated; they do not pad the 35-event count. Retries add actual races. Event lengths provisionally retain 18 laps in stage one, 21 in stage two and 24 thereafter. Shorter formats require a new duration/economy experiment, not a promise of unchanged length.

**Cost vocabulary:** S = content/configuration and existing presentation, with validation; M = a bounded new rule, menu or persistence hook and its tests; L = a new campaign/gameplay subsystem with migration, balancing and broad regression coverage. These are relative implementation scopes, not time estimates or work authorized by this triage. Shared PR correction is a separate **L balance workstream** if all target dips are mandatory; it is not included in a direction's narrative scope.

### What the consolidated game actually supplies

- [Progression brief](../DEATH-RIDE-PROGRESSION.md): poor car against poor opponents; winnings buy parts and new chassis; visible strengths/weaknesses; a story across 30–40 events. Its ratio and money targets are proposals.
- [C4](C4-ash-circuit.md) supplies a 35-event, five-division career, nested rival garages, shared shop transactions, grudges, short story cards, host/guest separation and a two-entrant finale. [W7](W7-campaign.md) explains the original ordered career, personal cup points, save/receipt rules and decision-only difficulty; its 12-event/stock-opponent account is historical, superseded by C4.
- [G2](G2-REPORT.md) supersedes C4's three-lap timing: Rookie/Club/Pro rival settings yielded mean **5.850 / 6.102 / 6.535 active hours** in the sampled earned careers, with 35 events and 18/21/24 laps. This is simulation, not human endurance or story approval. Five car licence tiers (Rookie/Club/Pro/Elite/Champion) are distinct from those three AI settings.
- Current [campaign](../../../deathride/core/src/main/resources/data/campaign.csv), [championships](../../../deathride/core/src/main/resources/data/championships.csv), [curve](../../../deathride/core/src/main/resources/data/career-curve.csv), [unlocks](../../../deathride/core/src/main/resources/data/career-unlocks.csv), [rival garages](../../../deathride/core/src/main/resources/data/rival-garages.csv), [rival stories](../../../deathride/core/src/main/resources/data/rival-stories.csv) and [story cards](../../../deathride/core/src/main/resources/data/story-cards.csv) are the reuse boundary. Events hold `id,name,cup,course,story,boss,duel,laps`; divisions are cups, not a map or a branching quest system.
- [Contracts](../../../deathride/core/src/main/resources/data/contracts.csv) currently mean finish Foundry with a shipment, obtain a result where Rook is wrecked, or win without damage. There is no physical cargo escort. `Commerce.resultBonus` hard-codes Rook/Relay relationship recipients; `RivalEconomy.cast` hard-codes the five bosses and Marrow finale. Generic cast/contract IDs require **M** work for alternatives, not just renamed CSV rows. Six persistent rivals do not mean six opponents on every grid: ordinary single-player races have five AI, and the finale one.
- [Tracks](../../../deathride/core/src/main/resources/data/tracks.csv): **25 closed circuits**, five themes (industrial, quarry, desert, wetland, alpine). Foundry/Slagway/Rail Cut; Scree/Cut Face/Haul Road; Salt Line/Dust Wake/Mirage; Sluice/Runoff/Spillway; Frost Line/High Pass/Summit provide reusable regional identities. Crown is industrial. These are laps, not continuous point-to-point roads. Gravel, oil, ice, kerb and offtrack modify grip/drag; shortcuts and acceleration sections exist. Surface choice can teach chassis weaknesses without a new hazard system.
- [Weapons](../../../deathride/core/src/main/resources/data/weapons.csv) include Rivet, Hammer and Mine; the current table also includes Scatter. [Abilities](../../../deathride/core/src/main/resources/data/abilities.csv) supplies ten finite-energy, cooldown abilities. These proposals principally use the required Rivet/Hammer/Mine set and existing abilities, adding no weapons. Ability-specific challenge scoring still needs result telemetry/rules; an ability existing does not mean its challenge exists.
- [Owner fusion choice](../../../deathride/art/OWNER-CHOICE.md): Soot Pulp portraits/backdrops, Rust and Ink cars/ground, Hot Ink icons/effects; raw, rough, wasteland material throughout. [Fusion review](../../../deathride/art/review/fusion/index.html) contains six reusable Ash portraits. New people receive text identity only in this triage. Audio suggestions are briefs; no listening, generation or audio-fit test is claimed.

### Chassis vocabulary for every cast

The [roster](../../../deathride/core/src/main/resources/data/cars.csv), individual `data/cars/*.csv`, [loadouts](../../../deathride/core/src/main/resources/data/car-loadouts.csv) and abilities are current authority over older archetype prose. Cast tables name a signature class, not permission to field a Champion in the opening. Existing Ash rivals change chassis through `rival-garages.csv`; alternatives need equivalent five-tier purchase plans and pool checks. Current boss fields can already buy the next tier one event early, so a Rook/Needle portrait is not a claim that the event-seven Rook still drives Needle.

| Licence | Classes and visible tradeoffs | Existing signature abilities |
|---|---|---|
| Rookie | Needle: nimble, low armor/mass and capped speed. Line: durable road coupe, slower launch/response; not the old perfectly balanced concept. | Steel Flick dash; Flywheel surge |
| Club | Bastion: fast, armored and heavy, poor launch/braking/steering. Trail: loose-surface grip, low speed/armor. | Shoulder charge; Ground Bite grip |
| Pro | Comet: top speed, weak armor/cornering. Flint: agile brawler, less straight-line speed than Comet. | Turbine with grip/steering cost; Punch Lance with windup |
| Elite | Quill: medium spike fighter, responsive but relatively frail. Vandal: fast, heavier trap car, weaker response/brakes. | Bone Rack contact spikes; Scrambler damaging slow patch |
| Champion | Kestrel: light, precise, vulnerable in contact. Bulwark: armored mass, less precise handling/braking. | Arc Harpoon damage/slow (not a towing system); Plate Brace protection with mobility cost |

### The shared money and difficulty contract

Start with the existing poor Line/Needle access and ordinary insured economy. Race receipts pay participation/position, wreck bounties and declared bonuses; losses still pay. Money buys engine, tires, brakes, armor, suspension and mounts, then a legal chassis. Unlock Club after seven clears, Pro after fourteen, Elite after twenty-one, Champion after twenty-eight. Preserve optional loans, repair protection and owned lower-tier entry so a bad race cannot create a progression dead end. Side income is optional; baseline completion must not require it. Proposed first useful upgrade: 2–3 races; first new tier and subsequent intervals: 7–9 races. These are targets, not guaranteed shop outcomes.

Let **P(k)** be expected purchased player PR and **F(k)** actual mean entered AI PR at event k. For every direction the **design-intent P/F sketch** is: opening 0.85–0.90 → spending relief 0.95–1.00 → promotion bosses at k=7/14/21/28 back to 0.85–0.90 → final duel k=35 about 1.05. The final deliberately differs from promotion bosses. PR is not win probability. Rival grants, purchase windows and limits follow a declared event/stage schedule, never player PR, results or chosen difficulty; each rival's own results affect its legal wealth. Rookie/Club/Pro changes AI decisions only. No speed/HP/damage rubber band, no mid-race power correction.

**Unresolved in the baseline:** G2 Club-reference promotion ratios are 0.9279 / 0.9428 / 0.9311 / 0.9625, opening 0.8966 and finale 1.0461. First useful upgrades average 1.250 / 1.503 / 2.000 races across settings. G2's legal ceiling audit says later 0.85–0.90 dips cannot be guaranteed under current clamps by money alone. The upper field plateaus; player PR falls 4.93% at the Pro join. A selected direction needs renewed earned-career simulation (P, F, P/F and money), branch coverage where relevant and an owner play session. Do not label the proposed sawtooth measured or silently solve it with stat cheats. Holding current stats means accepting and publishing the missed targets.

## A — Ash Circuit

**Premise (three sentences).** You inherit a burned garage, your missing sibling's tools and a debt to league owner Marrow. Racing through five towns reveals that he has been turning duplicate debts into a private fleet. You bring the surviving witnesses to his home circuit and race him for a public reckoning.

**Tone / fit.** Gritty, intimate, angry, ultimately hopeful. Soot Pulp faces and battered Rust and Ink machinery directly support exhausted workers and small acts of loyalty; Hot Ink marks receipts and threats. Audio brief: dry garage percussion, low engine drones, sparse human voices; silence before the duel. No score or voice asset is required for these text cards.

**Structure / player agency.** Linear five-act investigation, **35 authored / 35 played events**, seven per division: Scrap/Rook → Foundry/Ox → Salt/Vex → Switchback/Mica → Crown/Marrow. The garage is the returning home; acts change who can corroborate the ledger. Repeat the race–receipt–purchase loop; change surfaces, legal cars, witnesses and the meaning of the debt. All current 25 circuits can be used, with ten repeat visits framed by new evidence. Optional contracts influence relationship flavor, not whether the sibling survives. The finale requires a win; qualified ordinary wrecks still advance under existing rules, so story cards say “reach the next division,” not “win every race.”

**Progression.** Keep the shared contract and current 0/7/14/21/28 unlock schedule. Debt is the dramatic reason to earn, not a second mandatory grind; insurance and optional work protect poor starts. Boss purchases and P/F use the shared fixed schedule and target dips, with G2's misses visible. Signature weaknesses become story teaching: Rook punishes late lines, Ox overcommits on tight corners, Vex needs straights, Mica rewards surface reading.

| Rival | Signature class | Personality and story job |
|---|---|---|
| Rook | Needle | Bitter local collector who remembers every favor and fears his own creditor; first gatekeeper. |
| Ox | Bastion | Blunt foreman who races to keep his crew's tools out of Marrow's hands; second gatekeeper. |
| Vex | Comet | Impatient speed obsessive hiding the unedited record of a stolen lap; third gatekeeper. |
| Mica | Trail | Patient mountain driver sheltering the missing sibling; fourth gatekeeper. |
| Relay | Line | Quiet courier who reads every receipt twice and moves the evidence between towns. |
| **Marrow — final antagonist** | **Bulwark** | **Polite fleet owner who speaks of people as depreciating equipment; final Crown duel.** |

**Events / side content / cost.** Ordinary armed races, boss fields and final duel already exist (**S** authoring). Reuse Foundry delivery, Rook retirement and clean-win contracts, plus decision-only grudges (**S**). Frame Crucible as a “breakers' night,” but it remains a lap race with existing wreck bounties; a true last-car-standing destruction derby needs new finish/scoring, AI and venue validation (**L**, excluded). A Rivet-only optional race would need enforced loadout/AI rules (**M**, excluded from the base). No scripted sibling rescue, escort or cinematic chase is implied.

**Three sample cards — three lines each.**

*Opening / The spare key*
> The key survived the fire.
> Your sibling's name survived in Marrow's book.
> Only one of them still opens anything.

*Midpoint / A second copy*
> Ox lays two receipts on the bonnet.
> Same debt. Same date. Two ruined crews.
> This time he asks you to stay for the race.

*Finale / Open account*
> Relay has given every crew a copy.
> Marrow can no longer burn the only book.
> He can still put you into the wall.

**Three taunts.** Rook: “That corner collects faster than I do.” Ox: “Leave a lane, or become one.” Marrow: “I have already priced your victory.”

**Risk / model / content budget.** Overall direction scope **S**, strongest reuse, low structural replay variety. Thirty-five three-line cards (105 lines), six biographies, 18 base taunts plus six grudge variants; revise existing material and reuse all six fusion portraits. The risk is a predictable debt conspiracy stretched over long repeat races; vary the witness action, not just the next clue. No new schema for the base: retain events, five cups, rival garages, stories, unlocks, curve and saves. Branching forgiveness or variable endings would become **M** and are outside this baseline. Tone can become joyless; keep the reunited workshop and worker solidarity visible. PR correction remains the shared separate L issue.

## B — Last Passage

**Premise (three sentences).** A chain of failing pumping stations is emptying the settlements behind you. Your traveling garage joins the last civilian convoy, winning race permits and repair money to move it through five guarded crossings. At the coast, the official who sold everyone passage closes the gate and challenges you to earn the road he already promised.

**Tone / fit.** Pulp melodrama, urgent, warm, weather-beaten. Rust and Ink cars look repaired by people who must keep moving; Soot Pulp portraits stress companionship rather than glamour. Audio brief: rattling tools, wheel rhythms and distant communal singing, always subordinate to engine/combat cues. The convoy exists in cards and hub copy, not as newly animated vehicles.

**Structure / player agency.** Five sequential hubs: Yard muster → Quarry pumps → Salt crossing → Flood road → Headland gate. **35 played / 45 authored events**: per hub five fixed events (including departure boss) plus one two-event detour selected from two authored alternatives. Choose the route at the hub, see its surfaces/rewards, complete that pair, then depart; five hub choices yield 32 route combinations. The shop travels with you and the last hub closes behind you. Repeat delivery/repair/departure; change who needs the passage and which road you risk. Examples: quarry detour via Scree/Ballast or Switchback/Cut Face; wetland via Sluice/Reed Cut or Runoff/Spillway. Revisit existing industrial circuits for the gate. The “road” is a sequence of closed race circuits; continuous convoy driving is excluded.

**Progression.** Earn permit money via ordinary race receipts and optional finish contracts; permits themselves are story/unlock gates, never a second currency toll. Keep the shared poor start, parts, five licence tiers and target P/F curve. Branch variants use the same stage-position field/reward budgets so detour selection cannot skip a licence or farm grants; differences are surface and rival mix. Rivals buy through the common shop and fixed stage windows without inspecting player strength. Current early NPC promotion access is retained. Long circuits support journey scale, but no 5–8-hour guarantee transfers from G2 to these routes without simulation.

| Rival | Signature class | Personality and story job |
|---|---|---|
| Tern | Needle | Restless pathfinder who leaves instructions scratched on spare panels; muster challenger. |
| Hessa | Bastion | Pump mechanic who distrusts promises lighter than an engine block; quarry gatekeeper. |
| Sile | Comet | Reckless permit runner trying to outrun the consequences of a bad sale; salt gatekeeper. |
| Olt | Trail | Soft-spoken flood surveyor who counts absent families, not trophies; wetland gatekeeper. |
| Nacre | Vandal | Convoy scavenger whose elaborate tricks always conceal a practical kindness. |
| **Warden Pell — final antagonist** | **Bulwark** | **Custodian of the coastal gate who sells hope in installments; final gate duel.** |

**Events / side content / cost.** Lap races, departure bosses and final duel reuse race rules (**S** content after generic cast hooks). Generalize existing finish-based delivery contracts to declared course/recipient IDs (**M**); the cargo remains abstract. Clean-win “keep the medicine sealed” uses the existing predicate, not a cargo-health bar (**S** once recipients are generalized). Rival-caused losses use existing grudges (**S**). Hub route choice, branch completion and one-time rewards are **M** new campaign/save/UI work, mandatory to this direction. Moving escorts, fuel depletion, convoy losses or point-to-point navigation would each demand substantial new systems (**L**, excluded). No damage-to-civilian simulation is promised.

**Three sample cards — three lines each.**

*Opening / Last pump*
> The pump coughs air into the morning.
> Hessa bolts your workshop to a trailer.
> Take the tools. Leave the sign.

*Midpoint / Two roads*
> Olt marks the flood height on your door.
> The upper road is longer. The lower road still pays.
> Everyone waits while you choose.

*Finale / Paid in advance*
> Pell has your money and the gate key.
> Behind you, a hundred engines idle on their last repair.
> He offers one more race.

**Three taunts.** Tern: “I marked the bend. You hit the mark.” Hessa: “That dent had better get us somewhere.” Pell: “Your permit covers arrival. Read the rest.”

**Risk / model / content budget.** Overall **M**, good race/shop reuse with a genuinely new branching itinerary. Forty-five three-line cards (135 lines), six biographies, 18 base taunts plus six grudge variants; six future portraits, five hub text panels and ten detour summaries. Branch-only cards must not mention an unvisited road. Store hub, committed route, completed event IDs and grant/receipt serials; add route edges and generic boss/finale/contract-target IDs while reusing events, cups, unlocks and nested garages. Resume stays at event boundaries; a mobile workshop does not imply mid-race saving. The greatest risk is promising a physical convoy the lap game cannot supply. Repetition remains visible at reused gate circuits; warmth must survive the combat premise. Removing route choice reduces cost but also removes the defining structure.

## C — Dead Air Championship

**Premise (three sentences).** A patched-together broadcast network pays the only wages left in the racing towns. You enter its championship to buy back the transmitter that once let your district speak for itself. Each episode makes you more useful to the sponsors until the station owner steps onto the grid to keep you from taking the microphone.

**Tone / fit.** Dark comedy, grubby, boastful, sharply satirical. Painted sponsor boards are cracked and hand-lettered in the fiction; the fusion palette stays rust, soot and hot warning color, with no clean neon studio makeover. Audio brief: overloaded radio stings, short deadpan announcements and cut-off applause. Text carries every joke; no announcer recording is needed for triage.

**Structure / player agency.** Five broadcast episodes, **35 authored / 35 played events**. In each episode choose the order of three opening heats, then complete three fixed feature races and an episode boss; the order is locked as each heat starts. Pick one of two announced sponsor tasks for the episode, overlaid on those seven races. Ratings are fictional editorial copy, not a hidden player metric. Early episodes use Foundry/Slagway/Scree; features progress through Salt Line/Mirage, Runoff/Spillway and Frost Line/Summit, closing at Crown. Repeat the show format while sponsors rewrite what your victories mean. The sponsor decision changes a declared bonus and the next card variant, not the physics or the main ending.

**Progression.** Ordinary purse buys parts and the next licence under the shared schedule; sponsor rewards stay optional and bounded so the unsponsored route can finish. First three heat slots share a declared stage sub-budget for field targets and grants, independent of order; fixed features climb toward the boss dip. Rival wealth still records their actual results. P/F intent remains 0.85–0.90 → 0.95–1.00 → four promotion dips → ~1.05 finale, never a live ratings-based power adjustment. Keep existing loss income, insured repair and lower-tier entry. Compare sponsor and no-sponsor economic paths before claiming the 7–9-race car timeline.

| Rival | Signature class | Personality and story job |
|---|---|---|
| Bracket | Line | Cheerful veteran who sells every defeat as a feature; opening episode headliner. |
| Clasp | Bastion | Product demonstrator who tests warranties by ramming them; second headliner. |
| Sizzle | Comet | Compulsive self-promoter who forgets the camera cannot brake for her; third headliner. |
| Adder Bell | Quill | Smiling contract lawyer who insists the spikes were disclosed; fourth headliner. |
| Mute | Flint | Laconic former sound engineer who times every shot like a punchline. |
| **Director Vell — final antagonist** | **Kestrel** | **Station proprietor who calls censorship quality control; final broadcast duel.** |

**Events / side content / cost.** Existing armed races, bosses, clean-win predicate and decision grudges support sponsored grudges and damage-free advertising spots (**S** content after generic hooks). Episode sponsor selection, eligibility, one-time bonuses and card variants are **M**, mandatory; a finish contract and a clean-win task can be the first pair. Enforced “Rivet only” or “no mines” feature rules need common player/AI loadout validation and UI explanation (**M**, optional extension). Counting ability hits or near misses for audience ratings needs telemetry/scoring (**M**, excluded). Audience voting/live rule changes and a true elimination derby need new control/scoring systems (**L**, excluded). “Demolition special” in the base is an ordinary combat lap race, never a mislabeled derby.

**Three sample cards — three lines each.**

*Opening / Terms of airtime*
> The camera light is held on with wire.
> Bracket tells you where to stand for the sponsor.
> There is no camera on that side.

*Midpoint / Customer satisfaction*
> Clasp returns the armor with a complaint.
> The sponsor calls the holes ventilation.
> Your next race will settle the warranty.

*Finale / Unscheduled speech*
> Vell cuts your microphone before the start.
> The district has already switched on its transmitter.
> For once, he will have to finish his answer.

**Three taunts.** Bracket: “Lovely wreck. Can you do it facing the board?” Adder Bell: “You agreed to contact in paragraph six.” Vell: “That overtake will not make the edit.”

**Risk / model / content budget.** Overall **M**, strong mechanical reuse, moderate replay variation through heat order and sponsor choice. Thirty-five three-line base cards plus ten three-line sponsor inserts (135 lines), six biographies, 18 base taunts plus six grudge variants; six future portraits and ten sponsor briefs. Humor dates quickly and can trivialize the wasteland; aim jokes at exploiters, keep drivers' stakes sincere. Persist heat completion/order, sponsor choice and settled objective receipts; add generic cast IDs and task/card-variant links while retaining five cups, events, garages and unlock milestones. The current ordered `careerRound` cannot represent this unaided. Reordering must not duplicate grants or cup points. Live audiences, generated commentary and dynamic ratings are outside the base scope; novelty depends on authored writing, not an invisible simulation.

## D — The Common Road

**Premise (three sentences).** The towns once swore that no one could own the road between them. Five circuit keepers have turned that promise into a relic while charging everyone to cross their boundaries. You carry a battered public milepost from town to town, defeating the keepers until the keeper of the central road must honor the oath in front of all of them.

**Tone / fit.** Mythic, austere, communal, defiant. The myth lives in oral history, roadside markers and patched coats; there is no magic or new fantasy vehicle language. Rust and Ink ground and Soot Pulp faces make the ritual tangible, with Hot Ink used sparingly for territory markers. Audio brief: iron strikes, low collective voices and wind through gantries, not an orchestral prophecy. All symbolism is text in this triage.

**Structure / player agency.** A five-region map: claim the Yard, choose Quarry or Wetland next, take the other, reach the High Pass, then challenge the central Crown. **35 authored / 35 played event identities**, seven per region; Quarry/Wetland each need a Club and Pro difficulty/content variant for their two possible positions (14 extra configurations, **49 total configurations**). Each region has four road trials, two keeper races and one claim boss; cleared regions remain visible as allied territory. Repeat the claiming ritual; change which community speaks and the rank at which you visit it. Revisit only in ordinary practice, without territory income or repeat claim rewards. No real-time invasion/defense simulation. Circuit ownership changes the map and unlocks, not track geometry.

**Progression.** Region-clear count controls licences at 7/14/21/28 clears, not geographic identity. Local race purses buy normal parts/cars; a claim grants the ordinary cup award once, not passive income. Both middle-region orders receive pre-authored rank-appropriate fields, shops and track pools; their PR budgets do not read the player's car. Retain the shared sawtooth P/F intent and final ~1.05 exception, legal NPC purchases, loss income and insurance. Surface order changes the value of Trail versus Bastion and later Flint versus Comet; all ten classes stay available at their normal tier. Branch variants need fresh balance/affordability evidence before claims of fair route choice.

| Rival | Signature class | Personality and story job |
|---|---|---|
| Cairn | Needle | Proud young keeper who knows every word of the oath and none of its purpose; Yard boss. |
| Rivna | Bastion | Quarry steward who mistakes keeping order for keeping everyone out; regional boss. |
| Tallow | Trail | Wetland ferrymaster who tests courage by how carefully a driver crosses; regional boss. |
| Fane | Quill | Severe pass guardian who wears each repaired panel as a witness; High Pass boss. |
| Ilex | Vandal | Wandering sign painter whose jokes restore the names toll collectors erased. |
| **The Last Keeper, Orra — final antagonist** | **Bulwark** | **Custodian who preserved the oath by denying anyone the right to use it; central-road duel.** |

**Events / side content / cost.** Existing surface races, boss flags and finale duel supply the seven-event region loop (**S** content after generic hooks). Clean-win “carry the milepost” and finish-based public deliveries reuse predicates after recipient/course generalization (**M**). Grudges remain personal decision changes, not gang stat buffs (**S**). Territory UI, adjacency/unlock rules, rank variants and ownership saves are **L**, mandatory. Recruiting defeated keepers is a story alliance only; teammate AI or shared garages are **L** extensions. Retaliation timers, conquest economy, track-building and destruction-derby victory modes are **L**, excluded. Losing a race cannot erase a region or trap an uninsured player.

**Three sample cards — three lines each.**

*Opening / First marker*
> Cairn has painted his name over the milepost.
> Under it, the old words still show through.
> A road belongs to those who keep it open.

*Midpoint / The crossing*
> Tallow lifts the toll chain herself.
> Nobody cheers until the first repair cart passes.
> Then the whole bank begins to move.

*Finale / Keeper of nothing*
> Orra brings the original oath to the grid.
> The towns bring the copies they have lived by.
> One road will have to hold them both.

**Three taunts.** Cairn: “The old road has no place for your new dents.” Fane: “Every mark on me has a witness.” Orra: “I kept this road alive. What have you kept?”

**Risk / model / content budget.** Overall **L**, highest structural/save risk; two macro orders give meaningful surface sequencing but not unlimited replayability. Thirty-five three-line cards plus four three-line order bridges (117 lines), six biographies, 18 base taunts plus six grudge variants; six future portraits, five map labels and 49 event configurations. Epic language may overpromise a strategic world; keep the map small and the consequences concrete. Add region IDs, adjacency, ownership, region-clear order, rank-to-event variants and one-time claim receipts; retain event/cup/garage/curve data underneath. Track pool eligibility and `afterRounds` unlocks need rank-aware mapping, and existing linear saves need an explicit migration policy. PR correction remains a separate L issue. Cutting the ownership map makes a linear pilgrimage, not this direction.

## Comparison and decision boundary

| Criterion | A · Ash Circuit | B · Last Passage | C · Dead Air | D · Common Road |
|---|---|---|---|---|
| Direction scope | S; story revision | M; hub branches + generic cast hooks | M; heat order + sponsor state + generic hooks | L; ownership map + rank variants + generic hooks |
| Existing-system fit | Highest; current complete structure | High race/shop reuse; route state new | High race/shop reuse; episode state new | Medium; linear career assumptions change |
| Replayability intent | Low; different cars/contracts | Medium; 32 detour combinations | Medium; heat order and sponsor objectives | Medium; two region orders, different surface timing |
| Fusion / tone fit | Direct gritty fit | Direct rough-road fit; warmer | Compatible if satire stays grimy | Compatible if myth stays material |
| Content volume | 35 cards / 105 lines; 6 reused portraits | 45 cards / 135 lines; 6 new portraits later | 35 cards + 10 inserts / 135 lines; 6 new portraits later | 35 cards + 4 bridges / 117 lines; 6 new portraits later |
| Main risk | Long linear clue repetition | Implied physical escort; branch continuity | Joke fatigue; sponsor reward inflation | Strategy expectations; saves and tier-order variants |

All volumes also include six biographies, 18 base taunts and six grudge variants; only three taunts per direction are sampled here. The PR correction, pacing validation and eventual owner playtest are common costs and are not evidence in favor of any narrative.

Choose A for a complete current structure with clearer story work; B for journey and route responsibility; C for repeatable show rituals and self-serving rivals; D for a lasting map consequence. A coherent fuse takes one structure and one secondary tone/cast device: A + B's traveling workshop can be S if travel is only framing, whereas importing B's route choices makes it M. C's sponsor jokes can decorate any direction cheaply; its reward system cannot. D's map cannot be obtained through story-card wording. No direction is selected by this note.

**K1 validation / handoff:** checked against the listed documents, current CSV headers/content and the cast/contract consumers; all four use the same categories, counts and ratio qualification. K2 will present this note offline with sketches explicitly labeled design intent, only existing Ash portraits, the matrix and a choices template. Narrative quality, audio fit, route balance and human feel remain unmeasured.
