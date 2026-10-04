# R2 — Game Narrative Craft: Patterns for Death Ride

Research slice R2 of the Death Ride narrative research. Scope: narrative design craft (how story is built into play), not plot. Nothing here copies another game's plot, characters or lines; examples are cited only to show a technique, and every Death Ride idea in Part D is original to this project.

Research date: 2026-10-04. Sources: 40 distinct references, mostly primary (developer interviews, GDC talks, studio blogs). They are numbered [S1]–[S40] at the end.

**Pattern format.** Rule (when X, do Y, because Z); naive failure; checkable evidence with a source; confidence. High means a primary quote I fetched and read. Medium means a reputable secondary source, or a summary of a primary I could not open in full. Low means a fan wiki or community consensus.

---

## Part A — The core problem in one paragraph

Death Ride is an arcade racer that has a story. The player spends most of their time steering, so a story that waits for the steering to stop competes with the game instead of riding on it. The games that solve this (Hades, Bastion, Brothers, Spec Ops, the Nemesis games) share three habits. **The mechanic is the sentence**: the controls tell the story. **Text is small, frequent and reactive**, not a long meal between rounds. **The world remembers the player's play** and comments on it.

---

## Part B — Patterns

### 1. Story rides on gameplay

#### P1. The mechanic is the sentence
- **Rule.** When a story beat matters most, deliver it through a change in what the controls do, not through a cutscene, because the player believes their hands before they believe a narrator.
- **Naive failure.** The story says one thing while the play says another: Clint Hocking's 2007 "ludonarrative dissonance" [S34]. A racer whose "deadly" rivals drive politely in a line has this problem.
- **Evidence.**
  - *Brothers: A Tale of Two Sons*: one brother is on each analogue stick. Josef Fares: "you connect with your left hand to the bigger brother and right hand to the little brother… you actually lose one physical hand", and pressing the dead brother's button at the end "is the essence of the whole game itself" [S18].
  - *Spec Ops: The Line*: the loading-screen tips turn from weapon stats into hostile whispers. Walker's "generic combat barks go from professional to detached, to unhinged" [S19].
- **Confidence.** High (Fares quoted from Game Informer; GMTK's analysis matches Walt Williams' GDC 2013 talk listing).

#### P2. One event, one idea, then retire it
- **Rule.** When you build a campaign of short events, give each event one new idea. Introduce it, develop it, twist it, then drop it, because a new idea is what makes the next event feel like a new scene.
- **Naive failure.** Thirty-five races that differ only in the track and the opponents' numbers. The story cards then have to supply all the novelty, and they can't.
- **Evidence.**
  - Koichi Hayashida (Super Mario 3D Land) on *kishōtenketsu*: "First, you have to learn how to use that gameplay mechanic, and then the stage will offer you a slightly more complicated scenario… And then the next step is something crazy happens that makes you think about it in a way you weren't expecting." Gimmicks are typically retired after their level [S32].
  - *Forza Horizon 4*'s "Horizon Stories" put narrative into rule variants, such as a film-stunt driver or a taxi job, with voice-over setting the context before and during each event [S35].
- **Confidence.** High for Hayashida. Medium for Forza (search summary; the page did not load).

#### P3. Build the whole campaign backwards from the finale's test
- **Rule.** When the game ends in one decisive event, design every earlier beat as preparation for that event, and let the preparation be measured, because then the finale grades the whole campaign rather than one race.
- **Naive failure.** The finale is simply the hardest race. Allies, parts and choices from earlier have no say in whether you survive it.
- **Evidence.** Brian Kindregan on *Mass Effect 2*: "The whole game would centre around: recruit your team for the suicide mission, try to make them loyal, and then go on the suicide mission and see who survives." [S17]
- **Confidence.** High.

### 2. Reactivity, scoped and authored cheaply

#### P4. Salience, not branching: a line database where the most specific match wins
- **Rule.** When characters must react to many situations, write lines as entries tagged with conditions. At run time, pick the entry whose conditions match most specifically, and fall back to broad defaults. This lets writers add special cases without touching code or breaking the general case.
- **Naive failure.** If/else dialogue trees per situation. They explode combinatorially, so writers stop adding the small "it noticed!" lines that make reactivity feel real.
- **Evidence.**
  - Elan Ruskin's GDC 2012 talk on Valve's *Left 4 Dead* system: a "uniform mechanism for tracking thousands of facts", "cascading from special to general cases" and remembering history, so writers can make "special cases and running gags without forcing programmers to change thousands of lines of code" [S8].
  - Emily Short calls this *salience-based narrative*: easy to start "with sensible, broad defaults", then extended with "more salient content for individual situations". Its risk is that a salience pick lands worse than an authored placement [S9].
- **Confidence.** High.

#### P5. Make the game notice what the player caused
- **Rule.** When a character speaks before or after play, key the line to something the player just did or is carrying (low health, last result, who they met already), because "the game is paying attention" is the feeling that makes reactivity worth its cost.
- **Naive failure.** Reactivity keyed only to story progress. That gives a fixed line per chapter, so the player learns the script and stops reading.
- **Evidence.**
  - Kasavin on Hades: "Reactivity has always been a goal of our narrative design, to have those moments where you feel the game is paying attention." [S1]
  - His examples: gods react if the player arrives low on health, and one comments that another god has "already gotten to you" [S3].
  - The original roguelike premise was a game where "every time you run into a boss, they remember, you start keeping a tally of who won this time" [S2].
- **Confidence.** High.

#### P6. Volume to beat repetition, and placement for the few beats that matter
- **Rule.** When content repeats across runs, write enough lines per slot that a repeat comes only after many encounters. Hand-place only a handful of beats that must land in order, because a repeated line punctures the illusion faster than a missing one.
- **Naive failure.** Writing three taunts per rival and hearing them eight times each over 35 races.
- **Evidence.**
  - Kasavin: lines repeat only after "20 or 30 times", and "by the time the line repeats you probably won't remember it anyway" [S3].
  - On sequencing: "We have no idea, apart from a couple of moments, how things are going to be sequenced" [S1].
  - Scale reference: Hades shipped about 21,000 lines and roughly 305,000 words [S40].
- **Confidence.** High for the principles. Medium for the word counts (Supergiant's infographic, via Game Rant).

#### P7. Compress reactions into signals when you can't afford lines
- **Rule.** When you cannot write a reaction for every situation, show the character's feeling through a cheap, legible signal: a meter tick, a portrait swap, a typeface, a driving change. The signal does what a line would, at a fraction of the cost.
- **Naive failure.** Either silence (the world ignores the player) or a script so large it never ships.
- **Evidence.**
  - Larian writer Kevin VanOrd on *Baldur's Gate 3*'s approval pop-ups: "we can't have every character reacting to every situation, otherwise we would be working on the game forever". The system is a way of showing feeling without writing new dialogue [S10].
  - *Pentiment* gives each social class its own animated typeface (Gothic script for monks, plain scrawl for peasants), so the voice reads before the words do [S21].
  - *Into the Breach* tells its story in a few lines per pilot. Chris Avellone: "there is no canonical lore in the game, only the possibilities and interpretations you can stitch together from snippets of conversations" [S12].
- **Confidence.** Medium for VanOrd (the article bodies would not load; headlines and summaries agree). High for Pentiment and Into the Breach.

#### P8. Failure is content, not a wall
- **Rule.** When the player loses, give them story they would not have got by winning, because in a repeat-play game losing is the most common event and must not be dead air.
- **Naive failure.** A "RETRY?" screen. Losing teaches nothing about the world and feels like a tax.
- **Evidence.**
  - Disco Elysium's Kurvitz: "We've written out the failure states in this game with much more detail and psychological realism than games usually present failure" [S11].
  - Kasavin: "If the whole game is structured around dying and restarting, then we had to make sure the moment of death isn't about rage-quitting" [S1]. In Hades, death sends the player home to new conversations.
  - The racing counter-example: Burnout Paradise players made a mod to mute the DJ's repetitive lines, and called his post-failure comments useless [S37].
- **Confidence.** High for Kurvitz and Kasavin. Low for Burnout (community sources).

### 3. Allies, companions and attachment

#### P9. An ally must never cost the player
- **Rule.** When an AI ally shares play space with the player, cheat in the ally's favour so they never sabotage the player, because one frustrating moment poisons every story beat that character carries.
- **Naive failure.** A "realistic" ally who gets in the way, gets spotted, or nags.
- **Evidence.**
  - *The Last of Us*: "Ellie is invisible to Hunters and Infected when the player is not in combat." She also helps by throwing bricks and handing over ammunition and health [S14].
  - Valve's commentary for Half-Life 2: Episode One says Alyx first led the player and pestered them to hurry, but "playtesters hated being nagged", so she was changed to let the player lead [S16].
- **Confidence.** High for The Last of Us. Medium for Alyx (commentary summarised on fan wikis).

#### P10. The bond must pay out in play, but not reduce the person to a tool
- **Rule.** When a relationship deepens, give it a mechanical dividend the player feels during play. Keep the character's voice independent of the payout, because a benefit makes the player seek the character out, but a pure transaction makes them a vending machine.
- **Naive failure, in two forms.** Either the relationship has no gameplay effect (players skip it), or it is all effect (players grind it and feel nothing).
- **Evidence.**
  - Persona's social links tie each bond to fusion bonuses and, from Persona 4, to combat abilities. Game Developer's comparative analysis warns that Persona 5's version can make relationships "feel dishonest and reduces the characters to tools" [S29].
  - In Hades, a high bond with a former boss unlocks a once-per-encounter summon: the character appears in the player's fight and deals damage [S7].
  - Titanfall 2 made the pilot-and-Titan bond "a core pillar", with optional dialogue the player "can take or leave" while moving [S15].
- **Confidence.** High for Persona and Titanfall. Low-medium for the Hades summon mechanics (fan wiki, consistent with play).

#### P11. Turn an enemy into a friend through the fight itself
- **Rule.** When a defeated enemy is to become an ally, make the fight express who they are. Let the defeat be the moment their attitude cracks, then let them remember the fight forever after, because a turn that happens in a cutscene detached from the fight reads as arbitrary.
- **Naive failure.** A generic boss beaten by attrition, then a card saying "X now respects you." The player never met X; they met a health bar.
- **Evidence.**
  - Toby Fox (Undertale): "it's important to make every monster feel like an individual… They attack you, you heal, you attack them, they die. There's no meaning to that." Each fight's attack patterns are the character [S28].
  - Monolith's Nemesis system: an enemy who kills the player remembers it, levels up and taunts them. Michael de Plater said it borrowed the competition and revenge of multiplayer [S27].
  - The sequel extended this to followers' loyalty and betrayal [S39].
- **Confidence.** High for Undertale. Medium for the Nemesis origin (de Plater's DICE 2015 talk, via GameSpot). Low for Shadow of War betrayal details.

### 4. Short-form text: barks, taunts, cards and announcer

#### P12. One bark carries one piece of information, in the speaker's voice
- **Rule.** When a line plays during action, make it carry exactly one useful fact. Put character in word choice and stance, not in puns, because the player hears barks more than any other text and processes them at speed.
- **Naive failure.** Clever one-liners that obscure the information, and a pool so thin that the joke curdles by the third hearing.
- **Evidence.**
  - Ubisoft writer Richard Dansky: "each bark should convey one piece of information". He warns against "cartoony" one-liners and bad puns, and notes that how often barks fire determines how fast they wear out [S13].
  - Nels Anderson (Mark of the Ninja): "Getting too 'clever' or flavourful can actually make the barks less useful… Make them clear and unobtrusive" [S13].
  - *Wargroove* carries each commander through a few stock lines of personality and mood [S38].
- **Confidence.** High for Dansky and Anderson. Medium for Wargroove.

#### P13. The announcer is a character with a stance, not a play-by-play caller
- **Rule.** When you have a narrator or announcer, give them an opinion, a relationship to the player, and a rule set: terse, reveals what the player can't see, rewards skilled play, never repeats. Generic sports patter is noise.
- **Naive failure.** An announcer who describes what the player can already see ("And he crashes!"), on loop.
- **Evidence.**
  - Kasavin on Bastion's narrator: "He is not a play-by-play announcer but is deepening pretty much everything that you do." He uses "short expressions to convey a lot of rich meaning" and is "comfortable with long pauses" [S5].
  - The written rules: dialogue is for subtext, keep it short, don't break the fourth wall, reward experimentation and finesse, no repeats [S4].
  - Darkest Dungeon II, a "road trip from hell", recast its narrator as a guide "lamenting the state of the world" to fit the journey [S31].
- **Confidence.** High.

#### P14. Text as framing device: the mundane UI can turn on the player
- **Rule.** When the story needs to shift tone, use the interface the player already trusts (tips, menus, the shop ledger) to deliver the shift, because a change in a familiar surface is felt more than a new cutscene.
- **Naive failure.** UI that stays neutral and cheerful while the story darkens.
- **Evidence.** Spec Ops' loading screens move from tips to accusations. Williams wanted the player "to feel like they were under attack. Not as the character… but as the person playing the game" [S19].
- **Confidence.** High.

### 5. Rivals characterised through behaviour

#### P15. A rival's personality is a driving profile plus a memory
- **Rule.** When rivals have personalities, express each one first as an AI driving profile (line choice, aggression, defence, weapon habits). Second, give them a grudge state that persists. Only third, give them lines that name the behaviour. The player reads character from how a car moves long before they read a taunt.
- **Naive failure.** Personality that exists only off-track. Road Rash on 3DO let players "schmooze" rivals from the menu, and rivals "who act aggressively during 'schmoozing' will act the same way during the next race". A reviewer judged it a non-starter because "players won't have time to worry about this during a race" [S23].
- **Evidence.**
  - GRID (2019): 400+ AI profiles. Repeated contact turns a driver into a "NEMESIS", who gets a skill boost, blocks and rams, and is "the only AI type that will initiate car-to-car contact"; it resets at the flag [S24].
  - Burnout Revenge marked rivals who had taken the player out, and rewarded "Revenge Takedowns" against them [S25].
- **Confidence.** High for GRID and the Road Rash critique. Medium for Burnout Revenge.

#### P16. Every rival needs their own ending, even a tiny one
- **Rule.** When a cast of rivals competes for one prize, give each a short closure (a card or a single image) for when the player beats them for good, because rivals the player has fought for hours deserve a last word. Players treasure these even when they are rough.
- **Naive failure.** Rivals simply stop appearing.
- **Evidence.**
  - David Jaffe on Twisted Metal: "We wanted the cars to be characters… each character was given their own story", built as "little Twilight Zone-type stories… with a 'be careful what you wish for' twist".
  - The producer recalls spending "$80,000 on all the endings". The studio called them terrible and they were cut, yet years later fans loved them [S22]. The value was in having an ending per character, not in its polish.
- **Confidence.** High.

### 6. Pacing a 4–6 hour arcade campaign

#### P17. A fractal interest curve with few fixed beats
- **Rule.** When pacing a campaign, run one interest curve over the whole game (hook, rising, climax, resolution) and nest a smaller curve inside each region and each race. Pin only a few beats to fixed slots and let everything else float, because rigid sequencing breaks under player variance and fully floating content loses its spine.
- **Naive failure.** Even pacing: one story card before every race, all the same weight, so nothing peaks.
- **Evidence.**
  - Jesse Schell's interest curve runs hook, rising tension, climax, resolution, and can be "fractal" [S33].
  - Hades fixes "a couple of moments" and lets the rest emerge [S1].
  - Pentiment's acts are separated by time skips, so consequences land later: "People will remember that you're the person who pinned the crime on a certain person" [S20].
- **Confidence.** Medium for Schell (secondary notes). High for Hades and Pentiment.

#### P18. Delayed consequence beats immediate feedback for weight
- **Rule.** When a choice or result should feel heavy, show its consequence one or more chapters later, in someone else's mouth, because a delayed echo proves the world kept a record.
- **Naive failure.** Every outcome resolved on the post-race screen and never mentioned again.
- **Evidence.**
  - Pentiment: Sawyer says "we won't be telling the player they got it wrong"; consequences show across the time skip [S20].
  - Need for Speed: Most Wanted (2005) opens by taking the player's car and only returns it after the player beats the rival who took it, at the top of a 15-rival list. The loss is staged at minute one and paid off hours later [S26].
- **Confidence.** High for Pentiment. Medium for NFS (Wikipedia summary, widely corroborated).

### 7. Making repeat play fresh

#### P19. The world remembers the last attempt
- **Rule.** When the player retries or replays, let the opening framing reflect the previous attempt, because "you again" is the cheapest possible proof that attempts are part of the story.
- **Naive failure.** Identical pre-race text on every retry.
- **Evidence.**
  - Slay the Spire's opening figure gives a blessing based on how the previous run went [S36].
  - Into the Breach lets one pilot carry over between timelines, so a survivor's history persists across resets [S12].
- **Confidence.** Medium for Slay the Spire (wiki). High for Into the Breach.

### 8. Making stakes felt (debt, loss)

#### P20. Stakes must be a number the player reads at a ritual moment
- **Rule.** When the stake is economic (debt, rent, a lien), show it as a short ledger at a fixed, repeated moment, and make the player's in-play choices visibly move it, because abstract debt is forgotten while a nightly line item is felt.
- **Naive failure.** A cutscene says "you owe a lot" and the number never appears again until it's dramatically called in.
- **Evidence.** Papers, Please ends each day rationing "food, rent, heat and sometimes medicine". Earning more means processing travellers faster, against the duty to admit only valid papers [S30]. The ledger is the stake; the work moves it.
- **Confidence.** High.

#### P21. Take something the player built, not something the story gave
- **Rule.** When the story removes a possession, remove one the player invested in (upgraded, named, painted), and stage the removal as a defeat of the player's will, not of their skill. If they lose a race they could have won, they blame the game. If they lose a contract they could never have beaten, they blame the villain.
- **Naive failure.** Confiscating a car the player never cared about, or confiscating it as a penalty for failing a race, which feels like a cheat.
- **Evidence.** In the Nemesis games, a named enemy who kills the player becomes the player's own revenge goal [S27]. NFS: Most Wanted makes the taken car the spine of the campaign [S26]. Mass Effect 2 ties loss to earlier investment, so the player owns the outcome [S17].
- **Confidence.** Medium. This is my synthesis of sourced parts.

### 9. How endings land

#### P22. The final decision must belong to the player character and use the core verb
- **Rule.** When the game ends, the decisive act must be performed by the player, with the game's main mechanic, at a moment the whole game has trained. Don't hand the climactic choice to a supporting character, because players read that as stolen agency.
- **Naive failure.** A climactic cutscene in which an ally makes the key move.
- **Evidence.**
  - Hades II's original ending drew criticism because another character, not the protagonist, made the crucial merciful decision, "stealing agency" from her. Supergiant revised it so she "make[s] that call herself" and added scenes "showing rather than telling" [S6].
  - Brothers' ending is a button press the whole game has taught [S18].
- **Confidence.** High (Aftermath interview with Kasavin).

---

## Part C — Scale references (arcade-sized examples)

| Game | Technique worth stealing (craft only) | Confidence |
|---|---|---|
| Hotline Miami | The developers describe it as "an arcade game first, and a reality simulator second". Story sits in brief framing between arcade levels and never slows them (Wikipedia, citing developer interviews) | Medium |
| Katamari Damacy | A single speaking character judges every result, so a performance score becomes a character beat | Medium |
| FTL | Text events written as plain prose, implemented by the designers; short, choice-ending vignettes between fights [Tom Jubert, Wikipedia] | Medium |
| Forza Horizon | Story delivered as rule-variant event chains with voice-over before and during the event [S35] | Medium |
| Red Dead Redemption 2 | "Ride and talk": dialogue during low-demand travel. It fails when ride length and line length don't match (community analysis). For Death Ride: **time mid-race dialogue to race phases, not wall-clock time** | Low |

---

## Part D — Implications for Death Ride (14)

These are design proposals, built from the patterns above. Nothing in them reuses another game's plot or lines.

**1. A "beat card" schema: every race carries exactly one story beat in four slots** (P1, P2, P17).
Author each of the ~35 races as:
- (a) **pre-race state**: one card of 1–2 TV-legible lines, plus who is on the grid and their mood icon;
- (b) **rule variant**: the beat expressed as a race rule;
- (c) **mid-race hooks**: 3–6 event-keyed barks;
- (d) **post-race state**: ledger line, shop scene change, announcer recap.

The card says what is at stake; the rule makes the player do it. If a beat can't be expressed as a rule variant, it belongs in the shop, not on the track.

**2. A rule-variant library: each variant is a sentence of story** (P1, P2). Introduce each one, develop it once, twist it once, then retire it or save it for the finale. Starter set:
- **Garnish race**: the purse is split live at checkpoints, with the league's cut taken first. The debt becomes physical mid-drive.
- **Collector run**: league enforcers enter mid-race and target only the player. Survival is the win.
- **Grudge heat**: a rival with a persistent nemesis flag ignores the field and hunts the player.
- **Debt of honour**: a turned boss asks the player to finish in an exact position. This tests restraint, not speed.
- **Shakedown test**: a run at the shop to try the Mechanic's latest part. It can't be lost, and failure lines are funny (P8).
- **Carry race**: the player escorts a slow vehicle whose damage meter is the stake.

**3. A salience table for all short-form text** (P4, P6, P12). Use one data file with rows of `speaker, trigger, conditions[], weight, once_flag, cooldown_races`. The most specific match wins, and broad defaults always exist.
- Triggers: grid, overtaken_by, wrecked_by, mine_hit, last_lap, finish_pos, retry.
- Conditions: region, debt band, last result against this rival, ally status, retry count.

Target: no pre/post line for a given rival repeats within a campaign. Barks have cooldowns. A new special case is one row, with no code change.

**4. Barks carry one fact, sized for a TV** (P12). A mid-race bark is a portrait plus five to eight words, or a voice line under two seconds, and says one thing ("coming up your left side"). Personality lives in diction and stance. Puns are rationed to one rival who is *defined* by bad jokes, so the habit becomes characterisation, not noise.

**5. Rivals are AI profiles first, lines second** (P15). Each rival gets a driving signature the player can learn without reading:
- a line choice (inside diver, wall-hugger);
- an aggression trigger;
- a weapon habit (hoards for the last lap, sprays early);
- a visible tell before an attack.

Taunts then name the behaviour the player just saw. Add a GRID-style nemesis flag, but persist it across races until it is resolved, so a grudge becomes a multi-race thread. Never let personality live only in a menu (the Road Rash trap).

**6. The announcer is a league employee with an opinion** (P13, P14). Follow Bastion's rules:
- be terse;
- give subtext, not play-by-play;
- reward finesse specifically (a clean triple pass, a mine chain);
- never repeat within a session.

Because the announcer belongs to the league, their stance can drift from dismissive to grudging to uneasy as the debt story darkens. That costs one condition column.

**7. Make the debt a nightly ledger** (P20). After every race, show three to five lines: purse, league cut, interest, repairs, net debt, with the change in a colour the player learns to fear. Choices move it: parts bought, risky high-purse variants, taking a turned boss's cash instead of their part. Until late in the campaign, Marrow appears only as a signature under the ledger, so the ledger *is* Marrow's voice. The debt band (comfortable, tight, delinquent, called) is a salience condition, so everyone reacts to it (P5).

**8. Losing is content** (P8, P19). A loss gets three short reactions:
- the winning rival gloats in character;
- the Mechanic blames the car, not the driver;
- the announcer frames it for the league.

Retry cards acknowledge the last attempt, so the third retry reads differently from the first. Story beats sit on *finishing* an event; *winning* gates only money and rank. That follows Kasavin's warning about difficulty walls blocking story [S2].

**9. Make boss-turns-ally work emotionally** (P9, P10, P11, P16):
- **The fight is the character.** Each boss has a signature behaviour that the region's earlier races teach in small doses. The boss race is then the twist and conclusion of that region's *kishōtenketsu* (P2).
- **Seed the turn in the defeat line.** The boss reveals *why* they drove that way (what they owe, to whom). The line reframes the fight just played instead of announcing friendship.
- **Pay in their own currency.** A hoarder pays cash, a builder pays a part. The reward is characterisation.
- **The ally appears in play.** Once per race, call the turned ally in to perform the signature move the player learned to fear. Past dread becomes present delight (P10), and the ally never harms the player (P9).
- **The ally remembers.** Their lines are conditioned on the player's later results and debt band (P5).
- **One ally wavers.** Under Marrow's pressure, one ally hangs back instead of helping, shown in driving before any line explains it (P1, P15). This keeps allies from becoming vending machines without making one sabotage the player.

**10. Stage the car seizure so it hurts and feels fair** (P18, P20, P21):
- **Foreshadow on the ledger.** The debt band visibly approaches "called" several races ahead, and the announcer and the Mechanic react (P5).
- **Seize after a win.** Then the seizure is plainly the contract, not a penalty for skill, and the player's anger goes to Marrow, not the game.
- **Take the car the player made.** Show their paint, parts and win count as it goes. Stage it in the shop, with the Mechanic present and powerless.
- **No monologue.** One Marrow line, one ledger stamp, the car slot emptying, the garage music dropping (P14).
- **Make the loss felt in the hands.** Run one or two races in a junk car (P1).

**11. Stage the Mechanic and the mine rig as a planted reveal** (P1, P3, P18):
- **Plant early.** From region one, add one-line oddities in the shop: questions about parts the player has no use for, a covered bench, nervous deflections keyed to certain purchases. Players should half-notice.
- **Build it from what the player earned.** The rig visibly uses parts paid out by turned bosses, so the finale vehicle is made of the player's alliances (P3).
- **Reveal through a test run, not a speech.** Introduce the rig in a cannot-lose shakedown with the Mechanic's anxious commentary. The mine-laying verb is taught in play before it is needed in anger, as Half-Life 2 teaches a key tool through a game of fetch [S16].
- **Rough is characterisation.** The rig's quirks are the Mechanic's personality in metal. Their finale barks stay about the machine, which keeps them in role and builds trust in it.

**12. The finale grades the campaign** (P3, P22). The fight to the death is won with the trained verbs: driving, weapons, the rig and the earned ally calls. Which allies appear, and how well the rig performs, depend on earlier choices (ME2's rule). The decisive act is the player's own input. No ally lands the final blow, and any final choice is made with the controls, not a menu.

**13. Give every major rival an ending card** (P16, P18). When a rival is beaten for the last time, show one image plus two lines. Echo it once, later, in someone else's mouth. Twisted Metal shows that having per-character endings matters more than their polish, so keep them as cheap cards.

**14. Pace five regions as a fractal curve with few fixed beats** (P17):
- **Hand-placed beats:** the hook (first race plus first ledger), each boss turn, the first ally call-in, the seizure, the rig reveal, the finale.
- **Everything else** is salience-picked.
- **Region shape:** intro → develop → twist (the boss's signature) → conclude (the turn).
- **The seizure** lands about 75–80% through: late enough to sting, early enough to rebuild.
- **Story budget:** about 20 seconds of text before and after each race, so story stays near 10% of session time (P1).

---

## Part E — Risks for the narrative lead

- **Salience can misfire at climactic moments** [S9]. Never let it pick the fixed beats.
- **Allies can become vending machines** [S29]. Allies must talk about more than what they pay.
- **The seizure can feel like a cheat.** Playtest whether players *predicted* it; prediction plus dread is the goal.

---

## Sources

- [S1] Game Developer, "How Supergiant weaves narrative rewards into Hades' cycle of perpetual death" (Kasavin quotes). https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death
- [S2] Game Developer / GDC Podcast ep. 16, "Roguelikes and narrative design with Hades creative director Greg Kasavin". https://www.gamedeveloper.com/design/roguelikes-and-narrative-design-with-i-hades-i-creative-director-greg-kasavin
- [S3] GeekDad, "Narrative and Early Access: Supergiant's Greg Kasavin Discusses Hades Development" (2019). https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/
- [S4] Supergiant Games blog, "In-Depth: Writing Bastion" (Kasavin). https://www.supergiantgames.com/blog/in-depth-writing-bastion/
- [S5] Game Developer, "Interview: Storytelling Through Narration in Bastion". https://www.gamedeveloper.com/design/interview-storytelling-through-narration-in-i-bastion-i-
- [S6] Aftermath, Hades II ending revision interview. https://aftermath.site/hades-2-supergiant-narrative-interview-ending-changes/
- [S7] Hades Wiki (fan), "Companion Battie". https://hades.fandom.com/wiki/Companion_Battie
- [S8] Elan Ruskin, GDC 2012, "AI-driven Dynamic Dialog through Fuzzy Pattern Matching" (GDC Vault; slides on Valve CDN). https://www.gdcvault.com/play/1015528/AI-driven-Dynamic-Dialog-through
- [S9] Emily Short, "Beyond Branching: Quality-Based, Salience-Based, and Waypoint Narrative Structures". https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/
- [S10] GamesRadar, Baldur's Gate 3 writer (Kevin VanOrd) on the reputation system. https://www.gamesradar.com/games/baldurs-gate/baldurs-gate-3-writer-says-the-rpgs-reputation-system-exists-because-larian-cant-just-let-players-break-party-members-we-would-be-working-on-the-game-forever/ (also PC Gamer coverage)
- [S11] ZA/UM devblog, "The Hungarian Interview" (Kurvitz). https://discoelysium.com/devblog/2017/03/31/the-hungarian-interview
- [S12] Kotaku, "Into The Breach Tells Its Story Through Its Characters" (Avellone). https://kotaku.com/into-the-breach-tells-its-story-through-its-characters-1824159682
- [S13] Kotaku, "Why Video Game Characters Say Such Ridiculous Things" (Dansky, Dahlen, Anderson). https://kotaku.com/why-video-game-characters-say-such-ridiculous-things-5921878
- [S14] Game Developer, "Endure and Survive: the AI of The Last of Us". https://www.gamedeveloper.com/design/endure-and-survive-the-ai-of-the-last-of-us
- [S15] Fenix Bazaar, "Titanfall 2 interview: … bonding with your titan" (Joel Emslie). https://fenixbazaar.com/2016/08/23/titanfall-2-full-interview/
- [S16] Half-Life Wiki (fan), Alyx Vance / Episode One developer commentary summary. https://half-life.fandom.com/wiki/Alyx_Vance
- [S17] TheGamer, "How Mass Effect 2 Was Built Around The Suicide Mission" (Kindregan). https://www.thegamer.com/mass-effect-2-suicide-mission-characters-choices-archetypes/
- [S18] Game Informer, "Afterwords: Brothers: A Tale of Two Sons" (Fares). https://gameinformer.com/b/features/archive/2013/09/27/afterwords-brothers-a-tale-of-two-sons.aspx
- [S19] Mark Brown (GMTK), "Why Spec Ops: The Line Mattered"; Walt Williams, GDC 2013, "We Are Not Heroes". https://gmtk.substack.com/p/why-spec-ops-the-line-mattered and https://www.gdcvault.com/play/1017980/We-Are-Not-Heroes-Contextualizing/
- [S20] TheGamer, "Interview: Obsidian's Josh Sawyer On Pentiment". https://www.thegamer.com/interview-obsidian-josh-sawyer-pentiment/
- [S21] Game Developer, "Pentiment director explains how going all-in on fonts helped…". https://www.gamedeveloper.com/design/pentiment-director-explains-how-going-all-in-on-fonts-helped-elevate-the-medieval-detective-rpg-
- [S22] MEL Magazine, "An Explosive Oral History of Twisted Metal" (Jaffe, Campbell). https://melmagazine.com/en-us/story/twisted-metal-oral-history
- [S23] CelJaded, "Road Rash (1994) — Panasonic 3DO Retrospective". https://www.celjaded.com/retrospective-road-rash-1994/
- [S24] PCGamesN, "The Nemesis system in Codemasters' GRID reboot makes for dramatic racing" (Chris Smith). https://www.pcgamesn.com/grid/grid-gameplay-codemasters
- [S25] Wikipedia, "Burnout Revenge"; The Xbox Hub retrospective. https://en.wikipedia.org/wiki/Burnout_Revenge and https://www.thexboxhub.com/looking-back-to-2006-with-xbox-360s-burnout-revenge/
- [S26] Wikipedia, "Need for Speed: Most Wanted (2005 video game)". https://en.wikipedia.org/wiki/Need_for_Speed:_Most_Wanted_(2005_video_game)
- [S27] GameSpot, "Shadow of Mordor's Nemesis System Was Inspired by Batman and Sports Games" (de Plater, DICE 2015). https://www.gamespot.com/articles/shadow-of-mordor-s-nemesis-system-was-inspired-by-/1100-6423740/
- [S28] The Escapist, "Undertale Dev: 'Every Monster Should Feel Like an Individual'" (Toby Fox). https://www.escapistmagazine.com/undertale-dev-every-monster-should-feel-like-an-individual/
- [S29] Game Developer, "Same but different — Comparing the Social Link System in Persona 3, 4 & 5". https://www.gamedeveloper.com/design/same-but-different---comparing-the-social-link-system-in-persona-3-4-5
- [S30] Game Developer, "Road to the IGF: Lucas Pope's Papers, Please"; Wikipedia, "Papers, Please". https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-
- [S31] Game Developer, "How a theme of 'a road trip from hell' would shape Darkest Dungeon II" (Bourassa). https://www.gamedeveloper.com/design/how-a-theme-of-a-road-trip-from-hell-would-shape-darkest-dungeon-ii
- [S32] Game Developer, "The secret to Mario level design" (Hayashida). https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design
- [S33] Notes on Jesse Schell, *The Art of Game Design*, interest curve (secondary). https://notesbylex.com/the-art-of-game-design-a-book-of-lenses-2nd-edition-by-jesse-schell
- [S34] Wikipedia, "Ludonarrative dissonance"; University of Pittsburgh, "Ludonarrative Dissonance: What it Meant and What it Means" (Hocking's original blog post is offline). https://en.wikipedia.org/wiki/Ludonarrative_dissonance and https://www.games.pitt.edu/ludonarrative-dissonance-what-it-meant-and-what-it-means/
- [S35] Windows Central, "Forza Horizon 4 features narrative-based gameplay". https://www.windowscentral.com/forza-horizon-4-features-narrative-based-gameplay-crazy-taxi-stories
- [S36] Slay the Spire Wiki, "Neow". https://slaythespire.wiki.gg/wiki/Neow
- [S37] GamesRadar, Burnout Paradise review; se7en.ws report on the mod muting DJ Atomika. https://www.gamesradar.com/burnout-paradise-10/ and https://se7en.ws/modders-finally-shut-up-dj-atomika-in-burnout-paradise-remastered/?lang=en
- [S38] Red Bull, "We speak with Chucklefish about strategy title Wargroove". https://www.redbull.com/us-en/wargroove-interview
- [S39] TechRadar, "Shadow of War's Nemesis system is at once both brilliant and frustrating", plus community reports on follower betrayal. https://www.techradar.com/news/shadow-of-wars-nemesis-system-is-at-once-brilliant-and-yet-incredibly-frustrating
- [S40] Game Rant, "Hades Infographic Breaks Down Game's Dialogue Count". https://gamerant.com/hades-developer-infographic-dialogue-breakdown/

## Confidence summary

- **High** (primary quotes read in full): Hades reactivity and repetition (S1–S3), Bastion narrator rules (S4–S5), Hades II ending agency (S6), salience-based dialogue (S8–S9), Disco Elysium failure (S11), barks (S13), The Last of Us ally cheating (S14), Mass Effect 2 structure (S17), Brothers (S18), Spec Ops (S19), Pentiment (S20–S21), Twisted Metal endings (S22), Road Rash critique (S23), GRID nemesis (S24), Undertale (S28), Mario kishōtenketsu (S32).
- **Medium**: BG3 approval (S10), Burnout Revenge (S25), NFS: Most Wanted (S26), the Nemesis origin (S27), the Persona critique (S29, an analysis piece), Forza (S35), Wargroove (S38), Schell (S33).
- **Low**: fan-wiki mechanics (S7, S16, S36), the Burnout DJ's reception (S37), Shadow of War betrayal (S39), the RDR2 ride-and-talk failure. Treat these as illustrations, not proof.
