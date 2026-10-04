# Death Ride: Story Bible v2 (The Ash Circuit, rewritten)

Head writer's draft, 2026-10-04. **For the owner to accept or reject.** Nothing in game data, code, art or audio has been changed. Every change to the story frame is listed, with its cost, in [FRAME-CHANGES.md](FRAME-CHANGES.md). The voices are in [VOICE-BIBLES.md](VOICE-BIBLES.md) and the script, as data, is in `deathride/narrative/lines.csv`. How the lines were made and scored is in [WRITING-PROCESS.md](WRITING-PROCESS.md). The owner review page is `deathride/narrative/review/index.html`.

**What stays fixed (the owner's spine and rulings).** The player races to pay a debt to Marrow, who owns the league, and survival is at stake. Winning (first place) each division's boss race turns that boss to the player's side, and the boss pays out money, a car or a part, chosen by the player. Bosses have extended health and target the player's weakest part, with no visible hunt cue. Marrow seizes the player's car as part of the debt: the apex of his need for control. The Mechanic, the young, nervous, helpful parts-store owner, builds a rough car with a mine dispatcher to end Marrow's reign. The last event is a fight to the death in the Crown arena, not a lap race. The 35 event ids, the five regions and their owner-approved names, and Q0's defaults are all unchanged: the player chooses the payout, the seized car returns on victory, the duel is one-on-one, and the Mechanic is loyal.

---

## 1. What the story is about

**In one sentence:** Death Ride is about the difference between a debt and a gift. Marrow's book can seize everything the player bought, but it has no column for what the player was given.

No character ever says this. The structure carries it (R1 P11). The car the player bought on credit is seized. The car the player drives in the finale was given, part by part, by the people the player beat and the kid who fixed their car. The finale is the bought car's owner against the given car's driver.

### The last card, written first and locked (R1 P3, D1)

The ending card (`campaign-victory`) was written before any other line. Every earlier card was checked against it: does this set it up?

> Your key comes home with Marrow's clamp cut through.
> The Mechanic takes the mine rack off the rig first.
> By the door there's a new hook, at your height.

What each line pays off:

- **The key.** In the Ash Yards a driver's key hangs on the Tag Board, in the ash, when the paper wins. Marrow's seizure clamps the player's key to his folio (the kept debt-contract art shows exactly this). The key coming home is the debt motif reversed.
- **The rack off first.** The Mechanic built a weapon, and it killed a man. Nobody says so. He takes that part off before anything else, and that is the ending's price (R1 P12).
- **The hook.** Keys hang on the Tag Board because people owe. This one hangs by the shop door because someone measured you for a place. It is the first thing in the game that is yours without paper. The kept ending art (the Mechanic in the reopened shop; an adult silhouette, "identity left open", hanging a coat; a broken lien clamp; a covered car) already shows this scene. The silhouette is the player.

## 2. Premise (three sentences)

Once a year the league signs new drivers at the Crown on Paper Night. You sign, the league's announcer rounds the figure into a name ("Twelve Hundred"), and you are sent to the bottom of the circuit to race it off. The bosses of five regions stand between you and the Crown, and Marrow keeps the only book; you win over the bosses one by one, until Marrow does the one thing his own rules forbid and takes your car. You end it in a car built from everything you were given.

## 3. Structure

### Acts

| Act | Region | Story mode (R1 D2) | The one reveal (R1 D12, P16) | The boss's want | Turn costs the boss |
|---|---|---|---|---|---|
| Prologue | The Crown, Paper Night | The debt is signed where the game will end (R4 #11) | none | | |
| 1 | Ash Yards | A prologue in tone: survivable, even fun. The debt is a nightly number. | **The collector owes too.** Rook's own key hangs under the soot on the board he keeps, and the league puts a lien on his car. | Keep the gate and outlive his creditor | His Needle (towed by the league) and the gate |
| 2 | Cinder Row | The money twist | **Where the money goes.** The "road levy" on every receipt is skimmed into the house cars, which Ox's belt builds and which hunt the player. | Keep her crew fed | The belt order; the furnaces go cold |
| 3 | Salt Cut | The record | **The league kills defaulters and whites them out.** Vex's stopped stopwatch proves a house car rammed Tull at the third cairn. Vex drove on. | Be fastest on the record | His haul contracts; he is whited out |
| 4 | Thin Air | The kid | **The Mechanic's history.** He swept Marrow's garage as a child and ran away. Marrow offers him a pardon in a hut; he keeps it unsigned. | Keep the road neutral and open | Her neutrality; the league stops the grit |
| 5 | The Crown | The book | **Marrow's one protected thing is the Voice**, and the seizure. | (Marrow never turns) | |
| Finale | Crown arena (crown-7-a) | A fight that changes a relationship in three phases | | | |

The order follows the money upstream (R4 #13): salvage is sorted in the Yards, melted into league fleet in Cinder Row, hauled across the Salt Cut, carried over the only pass, and spent at the Crown.

### Fixed beats and floating content (R2 P17, D14)

Hand-placed beats (never chosen by salience): the prologue and the first ledger; each refusal (event 5 of acts 1 to 4); each boss turn; the Voice's correction (crown-3); the rig reveal (crown-4); the lien (crown-6); the seizure; the finale; the ending. Everything else (barks, shop chatter, announcer calls, retry lines) is chosen at run time from `lines.csv` by most-specific match (R2 P4).

### The interest curve

Each act runs intro (events 1 to 2), develop (3 to 4), the refusal under pressure (5), the qualifier with Marrow's notice (6), and the boss twist and turn (7) (R2 D9, kishotenketsu). The campaign curve rises through four turns, dips at crown-1 (Relay loses his car to a clause) and crown-6 (the lien), and peaks in the finale.

### Who is on the grid (from the code, `RivalEconomy.cast`)

Acts 1 to 4 race Rook, Ox, Mica, Vex and Relay in every event, with the act's boss in slot one. Act 5 races Marrow, Rook, Ox, Mica and Vex: **Marrow is on track in crown-1 to crown-6, and Relay is not.** The story uses both facts. The player races every future boss for weeks before that boss's race, so respect is earned by mirrored competence (R4 P13). Marrow is met on track before the duel (R4 #10, at no cost). Relay is absent from Act 5 because his car is seized at the gates by a clause in crown-1: the rehearsal of the player's seizure.

## 4. Beat sheet: 35 events, prologue and ending

"Rule variant" lists what already exists in data (contracts are optional overlays; boss means first place promotes; ELIMINATION is the duel). Nothing here adds a new rule. Proposed titles change only the display title, never the id. The cards themselves are in `lines.csv` (rows `card.<id>.1` to `.3`).

| Id | Region | Role | Title (proposed; unchanged if blank) | The one idea | Story beat | Rule variant | Who speaks |
|---|---|---|---|---|---|---|---|
| prologue | Crown | prologue | Paper Night | The debt has a ritual, and a name | The pen is chained to the table. Marrow reads the car's number, not yours ("A good chassis. I will remember it."). The Voice rounds the figure into a name: Twelve Hundred. | none (card before scrap-1) | card; Marrow (one line); the Voice |
| scrap-1 | Ash Yards | build-up | Ash on the key | The Tag Board | Forty-one keys on the board; Rook hung the last one. Every key is a car the league took back. The parts shop leaves one bulb on over the empty bay. | none | card; Mechanic welcome; the Voice |
| scrap-2 | Ash Yards | build-up | The fourth line | The nightly ledger | The first receipt has four lines; you understand three. The fourth, "road levy", is in Marrow's hand. | none | card; ledger with Marrow's remark; Mechanic on the books |
| scrap-3 | Ash Yards | build-up | Loose ground | The covered frame | Scree on the road. In the shop a Line frame sits under a sheet: off the scale plate, nobody bid, so it is nobody's. "Forty kilos of nobody's. Let it stay that way a bit longer." | none | card; Mechanic plant |
| scrap-4 | Ash Yards | build-up | A sealed box | Relay's gearbox | Relay asks you to carry a sealed gearbox: unregistered, the only part in the basin not on paper. It ends up on the Mechanic's shelf. | delivery (optional) | card; Relay; Mechanic |
| scrap-5 | Ash Yards | pressure | A local debt | The leash bites someone else | Rook's Needle comes to the grid with a league lien tag. The Mechanic offers to hide it behind his curtain. Rook looks, sees the frame, refuses: "Kid, I collect for a living. Don't show me things." Then: "Nice frame. Never saw it." **Rook's refusal.** | none | card; Rook pre exchange; Mechanic |
| scrap-6 | Ash Yards | qualifier | Numbers under soot | The collector owes | Wipe the soot on the board: Rook's own key, three rows down. And one key apart, nobody's name: Tull's. Marrow's notice: tow crews to the Tag Board. | qualifier (opens Club) | card; the Voice reads "From the book" |
| scrap-7 | Ash Yards | boss | Rook at the gate | Rook races for his car | The tow truck parks where Rook can see it. Win outright. Turn: Rook takes his own key off the board and gives it to you. The league tows his Needle. Rook gives the Mechanic Yard tyres. | boss (first place) | card; Rook pre/post; payout; the Voice; Marrow notice |
| foundry-1 | Cinder Row | build-up | The Roll Call | Witness: the collector changed | Rook arrives in a Trail with no tags to hang. Ox watches him stand at your pit. Cinder Row stamps a lost hand's name into an ingot. | none | card; Rook (ally) and Ox (rival) |
| foundry-2 | Cinder Row | build-up | Easy money | The loan | The lender's stall is painted Crown red. The fee is written where you can read it. The Mechanic will repair without a loan. | existing optional loan | card; Mechanic on loans |
| foundry-3 | Cinder Row | build-up | The Bastion's line | Mirrored competence | Ox owns the straights and runs wide in the hairpins. Her crew counts your brake lights from the furnace door. | none | card; Ox barks |
| foundry-4 | Cinder Row | build-up | A second name | Equity | A new house car rolls off the belt. Its driver has a fleet number, not a name: his key is on the Tag Board. | none | card; the Voice |
| foundry-5 | Cinder Row | pressure | The crew account | Ox's refusal | Crew wages and your payments share one account. Ox has the second receipts in her vest and will not show them: "I also know who eats while it stays there." | none | card; Ox pre exchange |
| foundry-6 | Cinder Row | qualifier | Borrowed steel | The rig, quietly | The Mechanic asks Ox's crew for an offcut "for a thing." A young hand says Ox's caution keeps them poor. Marrow's notice. | qualifier (opens Pro), delivery (optional) | card; Mechanic; the Voice |
| foundry-7 | Cinder Row | boss | Ox holds the line | The money twist | Ox's crew eats at the furnace door, watching. Win outright. Turn: "I built the cars that chased you. Here's what you paid me for them." Both receipts on your bonnet; the levy is exposed and recovered. Ox gives the Mechanic a plate stamped with the Roll Call. | boss | card; Ox pre/post; payout; ledger restitution |
| salt-1 | Salt Cut | build-up | White horizon | Witness: what turning costs | The furnaces are cold; Ox's crew eats at the door anyway. Vex sees it on his way through. Restitution lands on the ledger. Races run at dusk. | none | card; Ox (ally); Vex; ledger |
| salt-2 | Salt Cut | build-up | A dry footprint | Tull | Tyre tracks end at the third cairn. The Cairn Log says Tull crashed alone. | none | card; the Voice |
| salt-3 | Salt Cut | build-up | Switch in the crate | The leash, petty | Someone swapped your ammunition crate. The Mechanic catches it at the counter. The quarry dispatch drum is now bolted to the frame. | none | card; Mechanic |
| salt-4 | Salt Cut | build-up | Vex runs ahead | Mirrored competence | The log lists a house car as the Salt Line record holder. Vex knows the real time and won't say it. | clean (optional) | card; Vex barks |
| salt-5 | Salt Cut | pressure | The missing lap | Vex's refusal | Vex's stopwatch is stopped at the third cairn, two winters ago. "Every haul I've run is in the log under somebody else's name. The watch is the one place I'm first." Ox: "I said that about the belt." | none | card; Vex and Ox pre exchange |
| salt-6 | Salt Cut | qualifier | Relay at dusk | The edit | Relay reads the Cairn Log twice and finds the whiteout. Marrow's notice. | qualifier (opens Elite) | card; Relay; the Voice |
| salt-7 | Salt Cut | boss | Vex opens the throttle | The record | Win outright. Turn: Vex hands over the stopwatch: "I ran it past a dead man." Whited out of the haul contracts. The watch will go into the rig. | boss | card; Vex pre/post; payout |
| switchback-1 | Thin Air | build-up | The mountain road | Hut Law | The shop climbs the pass on a trailer. Mica asks the Mechanic his name; he has to think. Vex races for nothing now but the record. | none | card; Mica; Mechanic |
| switchback-2 | Thin Air | build-up | The books | One hand | Ox's receipts, Relay's log and the Yards tags laid on a hut table: one handwriting. | none | card; Relay; Ox |
| switchback-3 | Thin Air | build-up | A voice on the line | The protected thing, first sight | In the hut everyone listens to the Voice. He still calls you Twelve Hundred. A clerk on the line corrects him to the credit; Marrow tells the clerk to let it stand. | none | card; the Voice |
| switchback-4 | Thin Air | build-up | Water over ink | Copies | Mica gives each crew a different copy of the evidence. No single seized car can carry it all away. | none (Runoff course) | card; Mica |
| switchback-5 | Thin Air | pressure | A remembered wreck | Mica's refusal | Mica will not close her huts to Marrow: "I've buried people who were turned from a hut." Marrow arrives and is sheltered. | grudge (optional) | card; Mica pre exchange |
| switchback-6 | Thin Air | qualifier | No private deal | Marrow's offer | At Mica's table Marrow offers the Mechanic a clean page and his old bench at the Crown. The page goes into the apron, unsigned. Mica watches it go. | qualifier (opens Champion) | card; Marrow; Mechanic |
| switchback-7 | Thin Air | boss | Mica tests the line | Neutrality | Her knife lies beside Marrow's cloth strips. Win outright. Turn: "Forty strips on that anchor are his. I'm cutting forty." Then: "The boy refused him at my table. I poured the man's tea." Mica gives anchor pins for the drum. | boss | card; Mica pre/post; payout |
| crown-1 | Crown | build-up | Inside the gates | The rehearsal | Relay's car is seized at the gate by clause nine, a clause that did not exist. He gives the Mechanic the sealed gearbox. The league stops sending grit up the pass. | none | card; Relay; Marrow |
| crown-2 | Crown | build-up | The house cars | Marrow on track | The house cars race with fleet numbers. Marrow is on the grid for the first time and compliments your car. | none | card; Marrow barks; Mechanic |
| crown-3 | Crown | build-up | A public account | The Voice reads the book | The crews give the Voice their book. Marrow waits for him to finish, as he always has: forty minutes, every line about him. He could cut the cable. He interrupts once, because the Voice had rounded. | none | card; the Voice correction |
| crown-4 | Crown | build-up | The last shipment | The rig | The sheet comes off. Every part was given; the only registered thing on it is the shim, which is Marrow's pardon. "I folded it six times. Seven was too thick." The drum turns on the Mechanic's bearing. | delivery (optional) | card; Mechanic rig scene |
| crown-5 | Crown | pressure | Under review | Marrow stops talking about money | The ledger grows a line: registration under review. Marrow chains the exits for the longest Crown run. | none | card; ledger; Marrow |
| crown-6 | Crown | qualifier | Clause nine | The lien | Clause nine is one sentence long and a week old, and makes every registered car the league's. The rig was never registered. A lien tag goes on your mirror. | qualifier | card; Marrow notice; Mechanic |
| crown-7 | Crown arena | finale | Marrow on his road | The fight | Seizure in the shop (Marrow wipes his feet). Then the duel in three phases. | ELIMINATION | card; seizure scene; finale script |
| campaign-victory | Ash Yards | ending | A hook by the door | Home | The locked ending card. | none | card; allies; Mechanic after |

## 5. The debt model's story logic: the ledger after every race

The ledger is Marrow's voice (R2 D7, P20). Until Act 5 he speaks mostly through it, and through the Voice reading his notices. Q0's arithmetic is unchanged. The proposals are labels and remarks only.

**The receipt, every race: the purse above, four league lines, the balance below, and a signature.** The scrap-2 card ("Your first receipt has four lines. You understand three.") refers to the four league lines.

- **Purse**, after insured repairs (header).
1. **League payment**: up to 20% of the net prize (the existing protected minimum stays).
2. **Credited**: what reduced the balance.
3. **Road levy**: the diverted quarter. *Proposed UI label change:* call it "Road levy" until Ox joins, not "diverted". The player reads a reasonable-sounding fee from the first race and is told, twelve events later (foundry-7), what it was. The twist is then planted in plain sight from scrap-2 (R1 P6).
4. **Interest**: the six-credit first-visit charge, events 1 to 14.
- **Balance**, with the change in the colour the player learns to fear (footer).
- **Signature**: "M." under a one-line remark chosen by situation (`lines.csv`, trigger `ledger-receipt`). Examples: first receipt, "Four lines. Each one fair." Second receipt, "Keep this. Compare it with the next one." (which plants Ox's duplicates). Levy, "The levy keeps the road open. You are welcome to walk instead."

**What the numbers mean in the story:**

- **Twelve Hundred** is the figure on Paper Night, rounded by the Voice into a name ("The figure's got some change on it. I don't do change. Twelve Hundred."). The figure changes; the name does not. Marrow never rounds anything. He lets only the Voice round.
- **The road levy is theft with a reason.** It buys the house cars on Ox's belt, which carry "equity" drivers (defaulters working off their paper) and which race in every event. When the hunters pressure the leaders (owner ruling, no visible cue), the story reason is that the league's own debtors are set on its other debtors. Marrow's case is that the fleet keeps the schedule full, the schedule keeps the road open, and the road is the only reason fuel and food still move.
- **Exposure (foundry-7)** recovers the levy: first against the principal, and the rest returned as cash (the existing restitution rule). The Voice reads a notice: "From the book: interest on Yards accounts is suspended. The league is generous." Interest stopping at event 14 is already in the data; the story now has a reason for it.
- **Debt bands** used as salience conditions: `debt=high` (above 900), `debt=mid` (300 to 900), `debt=low` (1 to 299), `debt=paid` (0). Marrow, the Mechanic and the Voice react to the band.
- **The turn of the screw (crown-5, crown-6).** Once the money is public, Marrow stops talking about money. A new ledger row appears, "Registration: under review", then "Lien posted: {car}, clause nine". Q0's rule that a zero balance never prevents the seizure is the plot: the player can pay everything and still lose the car, and the player's anger goes to Marrow, not to the game (R2 P21).
- **After victory:** "Claim void." The fraudulent balance is cancelled, recorded separately from money paid (Q0).

## 6. The car seizure staging (R2 D10)

1. **Foreshadow on the ledger and in someone else's life.** Rook's Needle under lien (scrap-5 to scrap-7). Relay's car taken by clause nine at the Crown gate (crown-1). "Registration: under review" (crown-5). The lien tag on your mirror (crown-6). The player should see it coming for six events; prediction plus dread is the goal (R2 Part E).
2. **Seize after a result, not a failure.** The seizure fires on entering the final preparation after crown-6 (Q0). It is plainly the paper, never a penalty for driving.
3. **Stage it in the shop, with the Mechanic present and powerless.** Marrow has never entered the shop (a plant held all game). He comes in, **wipes his feet**, and says: "Clause nine. You will find it on the back of your copy now." Then: "Key on the counter. Thank you." He clamps the key to his folio (the kept debt-contract image) and leaves your receipts on the counter, folded.
4. **No monologue.** Two short Marrow lines, one ledger stamp ("Collateral held"), the car's slot empties, and the shop is silent.
5. **The Mechanic, after:** "Don't look at the empty bay. Look at me. Okay, look at the rig." Then: "Okay. Okay. The rig's warm. I warmed it when I saw him on the road." Later, idle: "I wiped my feet too. When he did. I don't know why I did that."
6. **Felt in the hands:** the player's next drive is the rig, which is slower and rougher than anything they have driven since Act 1.

*Variant (frame change FC-13, recommended for later):* Marrow drives the seized car in the duel. The script carries tagged variant lines.

## 7. The Mechanic: arc and plants

**Want (stated):** keep the shop alive, be useful, stay out of trouble. **Need (unseen):** to build something that is his, and to act while afraid. **Secret:** the rig. **History:** an orphan who swept Marrow's Crown garage from the age of six and ran away at nine with a bag of bolts. Bettany, the old owner of the Yards parts shop, took him in. She died three winters ago, and the shop and its paper passed to him. Her name is still on the sign.

He is not a sidekick. He has his own agenda (the sheet in the back), his own debt, his own history with the villain, and his own cost at the end. He sometimes refuses the player, for example when a part is wrong for the car, or when the player borrows against a prize. His nervousness is a sane response to a real threat. Courage, for him, is doing it shaking.

| Act | Plant | Payoff |
|---|---|---|
| 1 | Holds a spare bearing in every portrait; rolls it in his palm when nervous | The rig's mine drum turns on it (crown-4); he pockets it again in the ending art |
| 1 | The covered frame: "It's nobody's. Forty kilos of nobody's." | The rig is the one car in the basin with no paper on it (crown-6: "The Mechanic's rig was never registered.") |
| 1 | Doesn't watch races; listens to the Voice on the radio | After the duel: "The radio went quiet, so I counted the bolts on the shelf. All of them. Sit down." |
| 1 | Offers to hide Rook's car behind his curtain; Rook sees the frame | Rook never wrote it down (crown-7) |
| 1 | Relay's sealed gearbox goes on his shelf | It is the rig's gearbox (crown-1, crown-4) |
| 2 | Talks to a league clerk at night (looks like betrayal) | He was buying the quarry drum from league salvage |
| 2 | Asks Ox's crew for an offcut "for a thing" | Ox casts him a plate with the Roll Call on it |
| 3 | Catches the swapped ammunition crate | Competence as care; he checks everything twice |
| 4 | Mica asks his name; he has to think | Mica is the only one who uses it (Ennis) |
| 4 | Marrow's pardon in his apron, unsigned (looks like betrayal) | It is the shim under the drum: "I folded it six times. Seven was too thick." |
| 4 | "He kept my bench. Thirteen years. Who keeps a bench?" | Marrow, phase 2: "Tell him I kept his bench." |
| 5 | Wipes his feet when Marrow does | Shows what Marrow made of him, then what he unmakes |
| Finale | Calm on the radio for the first time | Takes the mine rack off first |

The betrayal suspicion (R4 #8) is planted twice and resolved at crown-4, before the finale. `mechanicLoyal=1` holds.

## 8. The bosses: refuse once, then turn

The owner's rule is kept: winning the boss race turns the boss immediately and opens the payout. The craft additions are a **refusal before** the boss race (R1 P4) and a **witness** that makes the turn the boss's own decision (R1 P5), with the **cost** landing in the next act (R4 P14). Each boss witnesses the previous ally's cost and sees that the ally was not destroyed by it. The coalition grows by witness, not by speeches.

| Boss | Want, and Marrow's hold | Refusal (event 5) | What they must have seen | The turn (post-win) | Cost, shown next act | Keeps their culture (R4 P15) |
|---|---|---|---|---|---|---|
| **Rook** (Ash Yards, Needle, bitter collector) | Keep the gate; outlive his creditor. Marrow holds Rook's own tags. | scrap-5: refuses to hide his liened car: "Kid, I collect for a living. Don't show me things." Then: "Nice frame. Never saw it." | The player's driving: braking later than he does at his own gate. If he finished unwrecked, the player left him whole. | Takes his own key off the Tag Board and gives it to you: "Truck's got my car. Board's got my key. Only one of those I can give away." | His Needle is towed; he loses the gate; he races a Trail (matching `rival-garages.csv`) | Still talks in hooks and tags; "I'll hang nothing" |
| **Ox** (Cinder Row, Bastion, foreman, she) | Keep her crew fed. Marrow holds the wage account; she holds duplicates. | foundry-5: "I know what's in my vest. I also know who eats while it stays there." | Rook, the collector, standing at your pit with no tags to hang (foundry-1) | "I built the cars that chased you. Here's what you paid me for them." Both receipts on your bonnet. | The belt order cancelled; furnaces cold; the crew eats at the door anyway | Roll Call; "on the pour"; calls you "crew" |
| **Vex** (Salt Cut, Comet, speed obsessive, he) | Be fastest on the record. Marrow owns the haul contracts and the log. | salt-5: "Every haul I've run is in the log under somebody else's name. The watch is the one place I'm first." | Ox's crew eating at a cold furnace, together (salt-1) | "You want the fastest lap ever run on the flats? I ran it past a dead man. Here." | Whited out of every haul contract | Calls you "Mirror"; talks in seconds |
| **Mica** (Thin Air, Trail, keeper of the pass, she) | Keep the road open and neutral. Marrow holds the grit for winter. | switchback-5: "The hut takes everyone. Him too." Then: "I've buried people who were turned from a hut. I won't be the one turning." | The Mechanic refusing Marrow at her table (switchback-6) | "Forty strips on that anchor are his. I'm cutting forty." Then: "The boy refused him at my table. I poured the man's tea." | No grit up the pass; winter is coming | Hut Law; asks names; won't call anyone a number |

**Two refusal lengths (R1 D6).** Rook's is short: one scene, then the boss race two events later. Mica's is long: her refusal at switchback-5, the hut scene at switchback-6, and the turn at switchback-7, because hers is the turn that costs a whole road.

**Losing the boss race is content (R2 P8).** Each boss has in-character post-loss lines, the Mechanic blames the car, not the driver, and the Voice frames it for the league. Retry lines remember the last attempt (`retry=1`, `retry=2`, `retry=3+`).

**Weakness targeting stays invisible.** Bosses never say before or during the race which part of your car they are after (owner: no visible cue). After a boss race, the boss may tell you what they were aiming at, as character and as a lesson. If the owner counts that as a cue, those lines are tagged `weakness-reveal` and can be switched off in one place.

## 9. The allies' payouts, in their own currency

The owner's three choices (money, car, part) and the amounts in `campaign-allies.csv` are unchanged. What changes is the voice: each ally offers the same three choices in their own terms (R2 D9; R2 P10 says don't make them vending machines). Separately, as story only, each ally gives the Mechanic one part for the rig. The rig's stats stay fixed in `mechanic-rig.csv`; there is no hidden power.

| Ally | Money | Car | Part | Gift to the rig (story only) |
|---|---|---|---|---|
| Rook | 350: "Tag money. Collected it nine years. Now I'm uncollecting it." | Trail: "A Trail on a clean tag. Cleaner than mine ever was." | Tyres: "Yard tyres. Pulled them myself. Tagged them with my name." | Yard tyres |
| Ox | 650: "The levy back, counted twice." | Flint: "A Flint off my belt. Built before we knew who for." | Armour: "Plate, poured from the same ladle as the house cars. Seems fair." | A plate stamped with the Roll Call names, and one more: Tull |
| Vex | 1000: "Every haul I'll never get paid for again. Take it before it's whiteout." | Quill: "A Quill. Fastest thing I've got that isn't me." | Engine: "I tuned that engine to a stopwatch. Now it's yours. Don't let it idle." | His stopwatch: it runs again, inside the drum, counting five seconds between drops |
| Mica | 1400: "Grit money. There's no grit coming. Spend it on something that moves." | Kestrel: "A Kestrel. It doesn't argue with the road." | Suspension: "Hut-built suspension. It forgives you once." | Anchor pins that hold the drum, and a cloth strip on the mirror |
| Relay (not a boss) | | | | The sealed gearbox, seal still on |
| the Mechanic | | | | The bearing the drum turns on |
| Marrow (unwilling) | | | | The pardon, folded into a shim |

Allies remain rivals on track with zero race benefit (Q0). After the turn their barks become friendly rivalry, with grudge variants if you wreck them (Q0's grudge state).

## 10. Marrow

**Fair grievance (R1 P2, D3; R4 P9).** Before the league, the five regions fought over the one road: convoys burned and the pass was held for ransom. Marrow and the man who became the Voice turned the war into a schedule. A purse is the only wage left in the basin, and a race is the only reason fuel, grit and food still move between the regions. He says it once, in Mica's hut, to win her neutrality: "Before the book, they burned convoys on this pass. Nobody burns a convoy that owes them money." He is right that the road needs order, and partly right that his book keeps it.

**Illegitimate method.** Debt bondage, the skim, equity drivers, staged "retirements" on track (Tull), clauses written after the fact, and seizure.

**What makes him frightening is that he is reasonable.** He speaks only of fairness and obligation, never of force (R4 P6). He never says "debt". He never threatens directly, never raises his voice, never asks a question he cannot answer, and never rounds a number. His mania is precision, not volume: he corrects a clerk to the last credit, sweeps the Crown's start line himself, knows every chassis number, and wipes his feet. He compliments the car, never the driver (R1 D14), and every early kindness reads as foreclosure in hindsight.

**One protected thing: the Voice (R1 P1, D4; R4 P11).** The league's announcer has called every race for thirty years. He and Marrow built the league together. He is the only person in the book with a clean line, and the only person Marrow lets round a number. It is never explained in dialogue. It is shown in four moments:

1. **Paper Night:** Marrow writes the exact figure; the Voice reads it out rounded ("I don't do change. Twelve Hundred."), and Marrow, who rounds nothing, lets it stand (prologue card and the Voice's first line).
2. **switchback-3:** a clerk on the radio corrects the Voice's rounding; Marrow tells the clerk to let it stand.
3. **crown-3:** the crews give the Voice the real book. His code is that he reads what is on the paper in front of him, so he reads it. Marrow could cut the cable. He doesn't. He waits for his friend to finish, as he always has, and interrupts once, because the Voice had rounded: he lets the Voice round the player's name, never the figures in his own book. **The bond costs him the league:** keeping his friend means losing his secret, and that is what drives him to the seizure and the public death match.
4. **Finale, phase 3:** Marrow's last line is to the Voice: "Do not round it." After the wreck the Voice reads the exact time, says "Didn't round it." to a dead man, and turns the booth off.

**Present between races (R4 P12).** Through the ledger signature on every receipt; "From the book" notices read by the Voice before every boss race and at key moments; wordless appearances in cards; on track in Act 5 (12 or more barks); in person exactly three times: Paper Night, the hut offer, and the seizure.

**He never joins (Q0).** His defeat ends his control.

## 11. The finale: three phases, three relationships

Event crown-7, ELIMINATION, arena crown-7-a. The rig (the fixed Line body plus the automatic, speed-gated dispatcher) against Marrow's Bulwark. Q0's rules are unchanged: last car running, 20-second opening protection, 600-second watchdog draw, free retries. Phases are **presentation only**: they are chosen by Marrow's health (above 66%, 66% to 34%, 33% and below) and change only which lines can play. An AI shift per phase is optional (FC-12).

The plan, in the Mechanic's words, is true to the systems: **"Three years in his garage, he never let a single bolt go. He'll follow anything that leaves."** The dispatcher drops a mine every five seconds while the rig is rolling (speed gate). Marrow's duel AI is obsessive visible-target pursuit. Marrow's need for control is literally what drives him over the mines (R2 P1: the mechanic is the sentence).

| Phase | Marrow's health | The relationship | Marrow (one line, at most) | The Voice | The Mechanic (reactive) |
|---|---|---|---|---|---|
| Pit, before | | Allies name their parts on the pit radio (R4 #9, presentation only) | | "Listen for engines. When there's one, I'll say so." | "Five seconds a drop. Count with me." Then: "Don't double back over your own. They don't know whose side they're on." |
| 1. Collection | above 66% | Creditor and property | "Bring it in gently. Every part on that car was bought on my road." | "The Bulwark is on the rig's tail. He likes to collect in person." | "He's following. Good. Let him." |
| 2. The boy | 66% to 34% | Master and the servant who left | "Tell him I kept his bench." | "Mister Marrow is losing plate. I'll say that once." | Does not answer him: "Don't listen to him. Listen to the drum. Left side's open." |
| 3. The book | 33% and below | The man and his only friend | "Do not round it." (to the booth) | "The Bulwark is down to the frame. The rig is still rolling." | "He won't stop. He can't. Keep rolling." |
| After | wrecked | | silence | Reads the time once, to the second, then: "Didn't round it." The booth goes dark. | (in the shop) "The radio went quiet, so I counted the bolts on the shelf. All of them. Sit down." Then: "Rack first. Then everything." |

The decisive act is the player's own driving (R2 P22). No ally lands the blow.

**The killing blow, planted in Act 1 (R1 D10).** At scrap-3 the Mechanic is too nervous to arm a test mine and apologises to it. In the finale he says, "Don't double back over your own. They don't know whose side they're on." This is true: mines hurt their owner. The tension of the whole finale is a weapon that takes no sides, built by a kid who apologises to machines.

**Ending sequence:** finale caption ("The Voice reads the time once, to the second. Then the booth goes dark for the first time in thirty years."), one line from each ally, the Mechanic's after scene, and the locked ending card.

## 12. Political economy of the league (R1 P14; R4 P27)

| Role | What they get | What they pay |
|---|---|---|
| **Marrow and the league** | The road licences, the book, the purse schedule, a cut of every haul, belt order and toll, the fleet, the broadcast | Must keep the schedule full and the drivers dependent. Fewer drivers sign every Paper Night, and the stands are empty. |
| **The Voice** | The microphone; a clean line in the book | His word: he reads whatever paper is put in front of him, including false paper (Tull) |
| **Regional bosses** | Standing (gate, belt, hauls, the pass), a cut, a licence to keep their people working | Their best drivers, their silence, part of every purse |
| **Drivers** | A chance to clear the paper | Cars, bodies, sometimes lives ("retired") |
| **Equity drivers** | A bed and a fleet number | Their names; they drive house cars until the car or the driver wears out |
| **The basin (the audience)** | The broadcast: the only news and the only show. The basin listens on the radio because it can't afford the trip, so the stands are empty. | Their regions' autonomy. The broadcast is the league's legitimacy, which is why the Voice reading the crews' book is fatal to Marrow. |
| **The excluded** | Nothing | The salvage, the labour, and the keys on the board |

What runs the road after Marrow (R1 D3): the book is not burned. Every crew keeps a copy (switchback-4), the schedule still runs, and each region's own institution (Tag Board, Roll Call, Cairn Log, Hut Law) keeps its stretch. Marrow was right that the road needs order. He was wrong that it needed an owner. The ending leaves real problems: the furnaces are cold, the pass has no grit for winter, and Vex has no hauls. That is bounded hope (R4 P28), not a fixed world.

## 13. The five region cultures (R4 section 12, adapted)

Each culture is derived from climate, then economy, then custom, then slang (R4 P23), and each has a dissenting voice (R4 P24). At most one slang word per card, taught by context.

### Ash Yards (scrap): the Tag Board

- **Economy:** burned vehicle yards. Salvage is sorted, weighed on the scale plate and sold by weight to the foundry. Pay comes as league credit, spendable at league counters.
- **Institution:** the **Tag Board** by the gate. When a driver can't pay, their key hangs in the ash until someone claims the debt it carries. Favours are written on the backs of tags.
- **Slang:** *weighed* (paid out, or dead); *clean tag* (honest work); *sooted* (broke); *on the hook* (owing a favour); *fresh tag* (a new driver).
- **Moral code:** "What you pull is yours; what you owe is everyone's." Ingratitude is the only crime, and help is a hook. **Dissent:** the young sorters say the board keeps them owing the old men.
- **Local boss:** **Rook** wants to keep the gate (his standing) and to outlive his creditor. Marrow holds Rook's own tags, and Rook collects for Marrow to pay his interest.
- **Residue:** the Mechanic's shop, Bettany's sign, one swept bay, a covered bench.

### Cinder Row (foundry): the Roll Call

- **Economy:** the furnace belt melts salvage into league fleet: the house cars. Crews are paid by shift into an account the league audits.
- **Institution:** the **Roll Call** at every shift change; the crew meal at the furnace door; a lost hand's name is stamped into an ingot.
- **Slang:** *on the pour* (all in); *slag* (a lie, a cheat); *cooling* (resting, or hiding); *a full ladle* (a big score).
- **Moral code:** "No one is left on the pour." Crew before self. **Dissent:** the young hands say Ox's caution keeps them poor.
- **Local boss:** **Ox** wants her crew's jobs and tools safe. Marrow holds the wage account; Ox keeps duplicate receipts.

### Salt Cut (salt): the Cairn Log

- **Economy:** white flats and ochre quarry cuts. Haul contracts pay per load, so speed is money. Loads and logs go missing.
- **Institution:** the **Cairn Log**: every haul is logged at a survey cairn. Races run at dusk, because the noon glare blinds. Sharing brine water at a cairn is a truce.
- **Slang:** *whiteout* (erased from the record); *a long load* (a lie, a padded claim); *glare* (attention: "don't draw glare"); *dry* (out of options).
- **Moral code:** "Whoever writes the log owns the past." **Dissent:** the quarry crews say flats drivers sell the truth for speed, and Vex is the proof.
- **Local boss:** **Vex** wants to be fastest on the record. Marrow owns the haul contracts and the official log.

### Thin Air (switchback): Hut Law

- **Economy:** the only service road above the basin: tolls, grit stores and anchor upkeep. Marrow controls the grit that keeps the pass open in winter.
- **Institution:** **Hut Law**: anyone who reaches a road hut is sheltered for one night, enemy or not. Every safe crossing ties a cloth strip to an anchor, and the pass is crossed in silence.
- **Slang:** *anchored* (trustworthy); *thin* (desperate, near death); *loose rock* (a talker); *over the top* (safe, or dead, said dryly).
- **Moral code:** "No one crosses alone; no one is turned from the hut." **Dissent:** some say neutrality is how the road stays Marrow's, and Mica comes to agree.
- **Local boss:** **Mica** wants the road open and neutral and refuses private deals. The cost of joining is her neutrality.

### The Crown (crown): the Lien Wall

- **Economy:** licences, the book, the fleet, the broadcast, and a cut of every purse.
- **Institution:** the **Lien Wall** of seized cars' tags; the podium plinth (where Paper Night cars are weighed); Paper Night itself; contracts read aloud; the Voice's booth, the only maintained room in the stands.
- **Slang (league euphemism):** *retired* (seized, or killed); *equity* (people); *settled* (paid, or dead); *a clean book* (total control); *from the book* (the ritual opening of Marrow's notices).
- **Moral code:** "Everything has a price and a paper; the book is the law." **Dissent:** the unpaid pit staff whisper that the book is fiction, and in crown-3 the basin hears that it is.
- **Local boss:** **Marrow** wants control and continuity. He believes the regions would otherwise eat each other.

## 14. Motifs (each recurs with its meaning flipped, R1 P10)

| Motif | First meaning | Last meaning |
|---|---|---|
| **Keys** | Hung on the Tag Board: owed or dead. Clamped to Marrow's folio: seized. | Rook gives his away. Yours hangs on a hook by the shop door. |
| **The bearing** | Nerves: the Mechanic rolls it in his palm | Commitment: the mine drum turns on it |
| **Rounding** | The Voice rounds the player into a name; Marrow lets him | Marrow asks for the exact time; the Voice gives it |
| **The sheet and the curtain** | Hiding: the Mechanic's frame, Rook's refusal | Showing: the sheet comes off (crown-4) |
| **The stopwatch** | Stopped: Vex's guilt, time frozen at the third cairn | Running: inside the drum, counting the drops |
| **Cloth strips** | Hut Law shelters everyone, Marrow included | Mica cuts his strips; one is tied to the rig's mirror |
| **Wiping feet** | Marrow's politeness as menace | The Mechanic catches himself doing it, and stops |
| **Paper** | The debt, the pardon, the clause | A shim under a mine drum |

## 15. Continuity with the data and the art

- **Data that changes if the owner accepts:** the display titles and card lines in `story-cards.csv`; `campaign-beats.csv` beats; `rival-stories.csv` biographies, taunts and grudge taunts (Mica no longer "protecting the witness"); `campaign-allies.csv` joined and grudge lines; `campaign-mechanic.csv` act lines (act 3 currently says "Your sibling is safe here"); the ledger's diversion label ("Road levy"). No numbers, ids, courses or rules change.
- **Art:** every kept image fits. The debt-contract image (Marrow and a clamped key on a folio), the ally images (Rook with a key, Ox with two receipts, Vex grinning with a folded sheet, Mica with duplicate ledger sheets), the rig reveal (the Mechanic, a patched red coupe with three mine canisters), the duel tableau, and the ending (the Mechanic in the reopened shop; the open-identity silhouette is the player). No new art is required. The prologue card reuses the Crown backdrop.
- **Audio:** the 14 recorded lines are kept as fallbacks and marked in `lines.csv` (status `recorded-keep`); where a new line is proposed, the replacement is named. **Marrow has no cast voice yet.** His voiced lines need a casting pass (a low, unhurried older voice; it must never be pushed to shout). The Voice can read Marrow's notices, so most of Marrow's presence is voiced already.

## 16. What was cut, and why

- **The living missing sibling** (Q0's addition, not the owner's plot). It split the Mechanic's secret in two, spent a reveal on something with no expression in play, and stretched the investigation K1 warned about. The ending art's silhouette now reads as the player. See FC-01.
- **The fire conspiracy** (a league tow truck at a burning garage). "The villain secretly caused your tragedy" is a stock twist, and it makes Marrow a thug rather than a reasonable man. He does not need to burn anything; the paper does it.
- **Investigation procedure on cards** ("Relay finds your payment listed as a fleet purchase"). Facts now arrive as objects and confessions (R3 A8).
- **A crowd in the stands** (R4 #12). It would need new art, and G0 forbids faces. The basin listens on the radio instead, which costs nothing and makes the broadcast the battlefield.
