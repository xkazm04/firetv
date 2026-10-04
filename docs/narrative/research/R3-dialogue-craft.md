# R3: Dialogue craft for Death Ride

Research dossier, slice R3 (dialogue craft). Written 2026-10-04.

Scope: how to write short, voiced, character-specific lines for a top-down vehicular combat racer. The forms are three-line story cards, taunts and barks of one or two sentences, and shop or pre- and post-race exchanges of three to eight lines. The cast is a league boss (Marrow) who owns the player's debt, five region bosses who change sides after defeat, a young, nervous but helpful Mechanic who runs the parts store, and an Announcer. Lines appear as text, and some are synthesised with ElevenLabs.

Part A covers craft patterns. Each pattern gives the rule, the naive failure, an original Death Ride example, the source and a confidence rating. Part B covers writing dialogue with an LLM. Part C is the toolkit. Every example line was written for this project; none is quoted from a cited work. Numbers in brackets refer to the Sources list.

---

## Part A: Craft patterns

### A1. A line is an action

**Rule.** Every line is something one character does to another: a push, a bribe, a test or a dodge. Before writing a scene, answer Mamet's three questions: who wants what, what happens if they don't get it, and why now [8]. McKee calls dialogue "verbal action": each line should shift the balance of power or knowledge [30].

**Naive failure.** Characters agree, report facts and announce feelings, and nothing changes. Mamet's test is that a logline reading "Bob and Sue discuss..." describes no drama [8].

**Example (Mechanic, pre-race).**
- Flat: "Your car is ready. I fixed the axle. Good luck out there."
- Active: "Axle's in. It's not new. It's honest." The Mechanic wants trust in a used part and fears the blame if it fails. The line carries both without naming either.

**Confidence: high.** Mamet's memo is primary, and McKee and Overton make the same point. Overton writes even fight scenes "like a dramatic dialogue scene" [20].

### A2. Subtext in few words

**Rule.** What matters goes in what the character won't say. A short form has no room for explanation, so the subtext has to ride on one concrete thing: an object, a number, an odd word choice. Ingold's notes on the classic stranger-test scene describe two people "sizing each other up" while talking about something else. In games, he argues, the structure of a conversation carries subtext: which replies are offered, which loop back, which skip ahead [6].

**Naive failure.** The character names the feeling: "I'm worried about you." LLMs do this by default. In the LAMP study, professional editors listed "unnecessary exposition" among seven recurring faults in model prose [11].

**Example (Mechanic, after the league seizes the player's car).**
- Stated: "I'm so sorry they took your car. I know how much it meant to you."
- Subtext: "I kept your mirror. Left one. It's on the hook."

**Technique.** Give the writer, human or model, the subtext as a private note, such as "blames himself". Then forbid any line that states it.

**Confidence: high** for the principle. **Medium** for the one-object heuristic, which is practitioner consensus.

### A3. Economy

**Rule.** Cut until no word can go without losing meaning. George Miller on Fury Road: "People only speak when it's necessary... There's no time for recreational talk" [22]. Kurvitz said Disco Elysium treated Twitter as its "main competition in terms of hooking people with text" and kept its replies short and confrontational [25]. Slabinski puts concision first among his game-dialogue principles, and notes that most players won't remember individual lines, so clarity beats cleverness [28].

**Naive failure.** Saying it twice, once as information and once as reaction: "We need to go now. There's no more time to waste."

**Example (Announcer, race start).**
- Padded: "Ladies and gentlemen, welcome to another thrilling race in the wasteland, where anything can happen!"
- Tight: "Six cars. Four laps. One of them owes money."

**Confidence: high.**

### A4. Distinct voices: rhythm, vocabulary, syntax

**Rule.** Each character needs a fingerprint you can hear with the name covered. McKee defines an "ear for dialogue" as talk with a syntax, rhythm, tone and vocabulary that belong to one character only [30]. Milch gives his educated Deadwood characters "an almost Elizabethan" diction, unlike the prospectors, and their profanity is "calibrated according to the given personality and the given environment". He also wrote much of the show in metre [19]. The levers:
- **Length and shape:** fragments, complete clauses, or a long clause with a sting at the end.
- **Lexicon:** the field their words come from (ledger, garage, church, radio, haulage).
- **Grammar habits:** dropped subjects, questions answered with questions, the passive used to dodge blame.
- **Metre:** a regular beat survives synthesis better than awkward stress.
- **Address:** what they call the player (name, role, debt number, nothing).

**Naive failure.** Everyone speaks in tidy, medium-length sentences. Antislop measured model "slop fingerprints" that cluster by model family [10]. One model voicing six characters gives all six the same fingerprint unless the voice bible pushes back.

**Example ("the race is rigged" in three voices).**
- Marrow, who uses ledger words and no contractions: "The outcome has been accounted for."
- Mechanic, who speaks in fragments and hedges: "The track's, um. It's set up. Not by me."
- Region boss, an ex-hauler: "Track's bent. Drive it bent."

**Confidence: high.**

### A5. What each character refuses to say

**Rule.** A voice is defined by what it never says. Keiko Nobumoto, series composer on Cowboy Bebop, describes her job as catching lines Spike would never say, "no matter the circumstances" [21]. Each voice bible should carry a "never says" list, and breaking it counts as a defect.

**Naive failure.** Under pressure, everyone ends up voicing the emotional summary. The villain explains himself, the hard boss confesses, the shy kid makes a speech.

**Proposed entries, for the owner to accept or reject.**
- **Marrow** never raises his voice, never makes a direct threat, never says "debt" (only "the arrangement" or a figure), and never asks a question he can't already answer.
- **Mechanic** never swears and never lies about a part. He goes quiet instead.
- **Announcer** never takes a side or shows sympathy. A dry pause is the most it allows.

**Confidence: high** for the principle. The entries are design proposals.

### A6. Menace without parody

**Rule.** Menace comes from calm, competence, precise knowledge and a rationale the villain believes. Gonzalez (Fallout: New Vegas) says "you can't just make your tyrants cardboard villains" and argues for making adversaries "as strong as possible" [24]. Burch on Borderlands 2's villain: "He believes he's the good guy", someone players "like and hate at the same time" [23]. Milch treats coarse frontier speech as a tool for keeping order, not a matter of style [19]. In one or two sentences, menace works by:
1. **Precision.** He knows a small true detail: a lap time, a bolt, a name.
2. **Understatement.** The threat sounds like routine to him.
3. **A reasonable frame.** He thinks he is the adult in the room.
4. **An unspoken cost.**

**Naive failure.** Exclamation marks, "You fool!", promises of regret, explaining the plan. In synthesis, an angry tag on a soft voice can also misfire (A13).

**Example (Marrow, before a must-win race).**
- Parody: "You think you can beat me? You'll pay for this, every last scrap!"
- Menace: "Win if you like. Interest doesn't watch the races."

**Confidence: high** for the reasonable frame. **Medium** for the four-point list, which is a synthesis.

### A7. Warmth and humour in a grim world

**Rule.** The humour comes from the characters, not from jokes, and it is kind to the player. Kasavin said Hades' early-access audience valued humour that laughs "with you, not at you" [18]. Adams lists rules for game comedy: don't just write jokes, know the character, keep it brief, sometimes don't be funny, apply the "human being test", and keep puns out of character speech [27]. Matejka warns that a bark mocking failure can sound like the game mocking the player [29]. Warmth here should look like:
- **Acts, not declarations:** a part left on the bench, a discount nobody mentions.
- **Competence as care:** the Mechanic over-explaining a fix because he wants the player to survive.
- **Earned gallows humour:** a defeated boss can joke about losing. Marrow is never funny on purpose.
- **Deflection:** Ingold's "deflect" option keeps the tone of a scene intact [6].

**Naive failure.** A quip after every serious beat. LLMs habitually add a cute closing line.

**Example (Mechanic, third wreck in a row).**
- Quip: "Wow, you really love crashing, huh? Ha!"
- Warm: "I started a jar. For your bumpers. It's a big jar."

**Confidence: high.**

### A8. Exposition hidden in conflict

**Rule.** World facts arrive as ammunition or as the price of a deal. Mamet says any "as you know" line means the scene is broken [8]. Faliszek: Left 4 Dead has no voice that comes in to say "and now what's happening is" [32]. Slabinski calls forced lore a treachery [28]. Miller says audiences "pick up on the run because we never stop to explain" [22]. Four ways to carry facts:
- **The jab.** The fact is an insult: "Marrow paid your entry too? Then you're already losing."
- **The bargain.** The Mechanic only names a region's hazards while haggling over tyres.
- **The correction.** One character gets a fact wrong and another corrects them with heat.
- **The object.** A number painted on a hull, a ledger page on a card.

**Naive failure.** "As you know, Marrow has run the league for twenty years and holds your debt of forty thousand."

**Example (story card, region boss).**
"Marrow bought her rig the year the wells dried.
She's been paying it off one driver at a time.
You're this month's payment."

**Confidence: high.**

### A9. Barks that stay fresh

**Rule.** Treat barks as a system. Ruskin's GDC 2012 talk describes Valve's approach: hundreds of world facts matched against thousands of lines. The most specific rule wins and general rules are fallbacks. Memory stops repeats and makes running gags possible [7]. Emily Short's summary notes that this creates "a strong illusion of situational awareness" with no planning behind it [7]. Kasavin's Hades method is the same: write for every context you can think of and let the game choose. A line repeats only after "20 or 30" loops [18]. Matejka suggests drafting each bark in several emotional keys before cutting down [29]. The mechanics:
1. **Specificity tiers:** general lines plus context lines (lap, health, rival, region, last result). Specific lines win.
2. **Pools:** 4 to 8 lines for common triggers, 2 to 3 for rare ones.
3. **Use-once and cooldown flags:** no repeats within a race.
4. **Rationed standouts:** one rare-weight line per pool. The memorable ones wear out first.
5. **Length variety**, so repeats don't share a rhythm.
6. **Information first:** threat behind, armour low, boss enraged [29].
7. **Character first:** the same trigger sounds different from each speaker.

**Naive failure.** Five synonyms ("Watch out!", "Look out!", "Careful!") that the player hears as one line.

**Example (region boss, trigger "player rams me").** "That's my paint." / "Again? Fine." / "You hit like you owe money." / *(lap 4, boss low)* "Not today. Not like this." / *(rare)* "My father drove this rig. He hit harder."

**Confidence: high** for the system. **Medium** for the pool sizes, which should be tuned in playtests.

### A10. Banter structures

Shapes that fit three to eight lines:
- **Setup, turn, button.** The button is a decision or a dig, never a summary.
- **Accept, reject, deflect.** Ingold's three-option set [6]. Use it for player choices, or as the moves available to NPCs.
- **Loops and trapdoors.** A loop resets a pushy player. A trapdoor lets an impatient one skip ahead. Both say something about character [6].
- **Overheard pairs.** In Valve's system one character's line can trigger another's reply [7]. F.E.A.R.'s squads narrate their own tactics to each other [7]. Two rival bosses talking about the player over the radio is the Death Ride version.
- **Escalation ladder.** Each line raises the stakes one step. Whoever stops raising loses.

**Naive failure.** Ping-pong agreement ("Right." "Exactly."), or a joke on every line.

**Example (post-race, defeated boss now an ally).**
1. Boss: "You cost me a season."
2. Player (deflect): "You cost me a radiator."
3. Boss: "Fair trade."
4. Mechanic: "She's, um, still parked in my bay."
5. Boss: "I'm staying. Your kid makes good coffee."

**Confidence: medium-high.** The Ingold material comes from detailed talk notes, not the talk itself.

### A11. Three-line cards

**Rule.** A card is a small poem with one job:
1. **Concrete situation:** a noun you could photograph.
2. **Pressure or turn:** what it costs now.
3. **The hook:** aimed at the player, and ideally the shortest line.

Keep each line to about 12 words or fewer. Don't start two lines the same way, and never end on a moral. Leave a question for the race to answer. That follows Mamet's rule that drama makes the audience wonder what happens next [8].

**Naive failure.** Three lines of mood ("The wasteland stretches endlessly...") or a closing aphorism ("Some debts are paid in blood.").

**Example.**
"The parts store has one working light.
It's over the bench where your car will be.
Bring it back in one piece. Or most of one."

**Confidence: medium.** This is a common heuristic, reasoned from [8].

### A12. Callbacks

**Rule.** Plant a concrete phrase or object, then bring it back changed. Supergiant and Valve both run on remembered facts. Kasavin's example is a boss acknowledging a rematch [18]. Ruskin's system tracks history so it can run gags [7]. Larian gave each companion a dedicated writer for years, which is why they could answer odd situations fluently [26].
- Plant in memorable moments: a first meeting, a seizure, a first win.
- Pay off with a variation, not a repeat. Flip the meaning.
- Make every callback a game flag with a fallback line.
- Use at most one callback per exchange.

**Example.** Race 2 taunt: "Nice paint. Did it come with the debt?" After the alliance: "Paint's still ugly. I'll ride with it."

**Confidence: high** for memory-driven reactivity. **Medium** for the rationing rule.

### A13. Writing for the ear and for ElevenLabs

**Rule.** Write for the sound first, then format for the model that will voice it. ElevenLabs controls differ by model. The current Death Ride voice wave uses `eleven_multilingual_v2`, where v3 audio tags are not documented [33].

| Control | v2 (Multilingual) | v3 / v4 |
|---|---|---|
| Pauses | `<break time="1.5s" />` up to 3 s. Too many "can cause instability" [1] | No SSML. Use an ellipsis, dash, line break or `[pause]` [1][2] |
| Emotion | Narrative context, such as "her voice trembling". These tags are spoken and must be cut in post [1] | Bracketed tags: `[sad]`, `[angry]`, `[whispers]`, `[shouts]`, `[sighs]`, `[laughs]` [2][4] |
| Emphasis | Capitals add emphasis. Ellipses add weight [1] | Same [1][2] |
| Tag failure | n/a | v3 may read a tag aloud when it doesn't suit the voice, for example a soft voice told to shout [2] |
| Avoid | n/a | Non-vocal tags such as "[standing]", "[grinning]", "[music]" [1] |
| Stability | Slider | Presets: Creative, Natural, Robust. Robust is "less responsive to directional prompts" [5] |
| Style exaggeration | Recommended at 0 [4] | Same [4] |
| Speed | 0.7 to 1.2. Extreme values degrade quality [1] | Not available [4] |
| Multi-speaker | n/a | Text to Dialogue: hyphen for a cut-off, ellipsis to trail off, 2,000 characters per request [3] |

**Writing rules:**
1. **One breath per line,** about 6 to 14 words. Split anything longer.
2. **Punctuation is direction.** A full stop gives a beat, a comma a breath, an ellipsis a weighted pause and a dash a cut-off [1][3]. Use them sparingly. In the last voice wave, `mechanic.seizure` came back with four long interior pauses and 55.52% silence against a 45% ceiling [33]. Cut hesitation marks first.
3. **At most one capitalised word** per line [1].
4. **Spell out numbers, currency and abbreviations** ("forty thousand scrip"). Normalisation is a known weak spot [1].
5. **Avoid homographs** (lead, wind, tear, live, read).
6. **Lock proper names early.** Test "Marrow" and every boss and region name. v4 takes IPA between slashes, and alias or phoneme handling exists for some models [1]. Marrow's pronunciation is still unmeasured [33].
7. **Match tags to the voice** [2]. Cast for the emotional range the character needs.
8. **The caption matches the audio** word for word, minus tags.
9. **Very short inputs are less stable.** Guidance suggests v3 prompts over about 250 characters for consistency (from a search excerpt, unconfirmed). For two-word barks, generate several takes.
10. **Generate several takes and choose** [3].

**Confidence: high** for rows from ElevenLabs pages [1][2][3][4]. **Medium** for the v3 preset names and the 250-character figure, which came from secondary sources [5]. Verify both in the UI.

---

## Part B: Writing high-quality dialogue with an LLM

### B1. Why model dialogue sounds like a model

- **Mode collapse.** Zhang et al. trace it partly to typicality bias in human preference data, which pushes models toward stereotypical completions [13]. A model's first draft is its most average line.
- **Measured over-use.** Antislop measured "voice barely above a whisper" at 731 times its human rate and "heart hammered ribs" at 1,192 times. "Flickered", "murmured" and "whispered" were over-represented in nearly every model tested, and "It's not X, it's Y" ran up to 6.3 times the human rate [10].
- **Shared faults.** Professional writers editing GPT-4o, Claude 3.5 Sonnet and Llama 3.1 found the same seven faults in all three: cliché, unnecessary exposition, purple prose, poor sentence structure, lack of specificity, awkward word choice and tense inconsistency [11].
- **Weak self-judgement.** Models flagged problem spans at 0.46 precision against 0.57 agreement between experts. Readers ranked writer-edited text first, then model-edited, then raw output [11]. Shaib et al. found near-zero agreement between models and humans on what counts as "slop" [12]. **A model can draft and revise, but a human must judge.**

**Confidence: high.** The caveat is that these studies cover prose and Q&A, not barks.

### B2. Banned patterns

† marks a pattern measured in [9], [10] or [11]. The others are editorial judgement. C4 has the grep-able version.

| # | Pattern | Naive example | Why it fails |
|---|---|---|---|
| 1 | "It's not X, it's Y" and "Not X. Not Y. Just Z." † | "It's not a race. It's a reckoning." | The best-known model construction [9][10]. Fakes a revelation. |
| 2 | Tricolon on every line † | "Fast, loud, and hungry." | Rule-of-three cadence becomes a tell at density [9] |
| 3 | Aphorism as the button | "Some roads you drive alone." | Characters don't talk about the theme |
| 4 | Naming one's own emotion † | "I'm scared, okay? There. I said it." | Unnecessary exposition [11]. Kills subtext. |
| 5 | Therapy and HR vocabulary | "I hear you. That's valid." | Wrong world. Everyone becomes one counsellor. |
| 6 | Model vocabulary † | "a testament to", "tapestry", "palpable", "the weight of" | Measured over-use [9][11] |
| 7 | Whisper and flicker directions † | "[murmured, barely above a whisper]" | Extreme measured rates [10]. Also weak TTS direction. |
| 8 | Stock action openers | "Well, well, well." "Buckle up." "Game on." | Says nothing about the speaker |
| 9 | Villain parody | "You fool! You'll regret this!" | See A6 |
| 10 | Cute button after a serious line | "...Also, nice hat." | Deflates weight (A7) |
| 11 | Echo agreement | "Exactly." "Right." | No action (A10) |
| 12 | Articulate speech under stress | Full paragraphs mid-crash | Fails Adams's human-being test [27] |
| 13 | Stacked rhetorical questions | "Do you know what it costs? Do you even care?" | Melodrama |
| 14 | Mirrored sentences | "You drive for money. I drive for blood." | Reads as written, not spoken |
| 15 | Piled ellipses and dashes † | "I... I just... — I can't." | A model tell [9] and long TTS silences (A13) |
| 16 | Stock fantasy names † | Elara, Kael, Lyra | "Elara" ran at 85,513 times the human rate in one model [10] |
| 17 | Lecture openers | "Here's the thing about debt..." | The writer's voice over the character's |
| 18 | Scene summary | "So we've both lost something today." | Mamet: don't explain what just happened [8] |
| 19 | Puns in speech | "Looks like you're tyre-d." | Keep puns for item names [27] |
| 20 | Said-bookisms | "she growled menacingly" | Leonard: the verb is the writer butting in [31]. In TTS context, it gets spoken. |

**Confidence: high** for † items. **Medium** for the rest, which are defaults the owner can overrule.

### B3. Prompting methods

1. **Include the voice bible every time.** It should cover the "never says" list, lexicon, address and five or more human-written reference lines (C2). Anthropic's guide calls examples "one of the most reliable ways to steer... tone" and recommends 3 to 5 diverse ones so the model doesn't copy a single pattern [17]. Never paste lines from existing works.
2. **State the scene as verbal action:** who wants what, the stakes, why now, and what is hidden [8]. Mark the hidden part "never said aloud".
3. **Phrase instructions positively and give the reason** [17]. "Marrow speaks in calm, complete ledger sentences because he sees the league as accounting" works better than "don't make Marrow shout". Apply the blacklist after generation, as a filter, not as the main instruction.
4. **Match the prompt to the output** [17]. An ornate brief produces ornate lines, so write briefs flat and short.
5. **Draft under constraints.** Examples: a word cap, one concrete noun required, no adjectives, open on a verb, include a number. Rotate constraints between batches to break mode collapse.
6. **Ask for spread, then select.** Generate 10 to 20 candidates per slot. Verbalized sampling, which asks for several candidates with their probabilities, raised creative-writing diversity 1.6 to 2.1 times [13]. In practice: "Write 12 options, four of them lines this character would say that most writers wouldn't think of."
7. **One slot per call,** at a single specificity tier (A9), so the model responds to a context instead of filling a list.
8. **Keep drafting and judging separate.** Judge in a different call, ideally with a different model family (B5).
9. **Put the TTS rules (A13) and the target model in the brief,** so drafts arrive speakable.

**Confidence: high** for 1, 3, 4 and 6 (vendor documentation and a measured paper). **Medium** for the rest.

### B4. Critique and revision

- **Score against the rubric (C1),** never "is this good?". The open question invites the length and familiarity biases in B5.
- **Revise against one target.** Pass the reviser the lowest-scoring dimension and the specific rule broken, and ask for three fixes to that alone.
- **Stop after about two passes.** Model edits help but stay below human edits [11]. The writers' edits in that study were 74% replacements, 18% deletions and 8% insertions [11]. Human review should mostly swap words and cut.

**Confidence: medium-high.**

### B5. Comparing lines blind

LLM judges show position bias, verbosity bias (in humans too) [14][15] and self-preference driven by low perplexity [16]. A model judge favours the most typical line, which is usually the one you least want. Protocol:
1. Strip speaker names. The judge sees the line and the slot brief only.
2. Shuffle the order, run each comparison twice with positions swapped, and drop pairs whose verdict flips [15].
3. Show the character count for each line. Shorter wins ties.
4. Use a judge from a different model family than the drafter [16].
5. Require each ranking reason to cite a rubric dimension and a specific word.
6. A human picks from the top three by reading each aloud.

**Confidence: high.**

### B6. Human review points

Automated slop detection is unreliable [12], so people must handle:
1. **Voice bible sign-off,** including every "never says" list, before generation starts.
2. **Anchor lines:** Marrow's first and last lines, each boss's turn scene and the Mechanic's first welcome. These are written or chosen by a human, and the rest is calibrated to them.
3. **Every intended laugh,** read aloud.
4. **A read-aloud pass** before synthesis.
5. **A listening pass** after it. The voice wave itself notes that signal checks "do not prove that delivery was achieved" [33].
6. **A repetition audit** after a full playtest.

**Confidence: high.**

---

## Part C: Practical toolkit

### C1. Dialogue quality rubric

Score each dimension from 1 to 5. A line ships at an average of 4 or more, with no dimension below 3 and both Voice and Tells at 4 or more.

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Action** (A1) | Reports or agrees | Intent, no pressure | A clear move that shifts the balance |
| **Voice** (A4, A5) | Anyone could say it, or it breaks "never says" | Recognisable with the name shown | Recognisable with the name covered |
| **Subtext** (A2) | States the feeling or theme | Implies it, then half-says it | One concrete detail carries the unsaid |
| **Economy** (A3) | Padded or doubled | One removable clause | Nothing can go. Within the word cap. |
| **Specificity** | Generic wasteland mood | One world detail | Fits only this world, speaker and moment |
| **Function** (A8, A9) | Gives the player nothing | Information is buried | Needed information inside the character beat |
| **Freshness** (A9, A12) | Stock phrase or duplicate | New wording, familiar angle | New angle that survives a third hearing |
| **Tells** (B2) | Two or more blacklist hits | One soft hit | None |
| **Ear** (A13) | Numerals, homographs, stacked pauses | Speakable with one fix | Clean in one breath. Punctuation directs it. |
| **Tone fit** (A6, A7) | Parody menace or a misplaced quip | Right register, off key | Calm menace, warmth as an act, humour with the player |

### C2. Voice bible template

```
CHARACTER: <name / role>
CORE (in their words): <what they want from the player>
HIDES: <the unsaid thing shaping every line>
STATUS MOVE: <interrupts / waits / flatters / defers>
RHYTHM: typical length <e.g. 3-7 words>; shape <punchy front / sting at end>;
        metre <e.g. even stresses, max one pause per line>
LEXICON: fields <ledger / garage / radio ...>; signature words (max 6);
         address for player <name / "driver" / number / none>
GRAMMAR HABITS: <drops subjects / no contractions / answers with questions>
NEVER SAYS: <3-5 hard rules>
HUMOUR: <none / dry / self-deprecating / gallows; aimed at whom>
UNDER PRESSURE: <quieter / louder / more formal / more fragmented>
ARC: <how the voice shifts after defeat or alliance; what never changes>
REFERENCE LINES: <5+ human-written lines for this project, varied triggers>
CALLBACK FLAGS: <flags this character plants or pays off>
TTS: model <v2/v3>; voice id; settings; tag range the voice can carry;
     pronunciation locks for names it says
```

Sample for Marrow (a proposal): core is "Everyone pays. I only write it down." He hides that he needs the player racing, because a dead debtor pays nothing. Rhythm is 5 to 10 words in complete sentences, no contractions, with a beat before the last clause. Never says: "debt", "please", a raised voice, or a question he can't answer.

### C3. Bark checklist

- [ ] Trigger, eligible speakers, cooldown and priority defined
- [ ] The information the player gets is named [29]
- [ ] General pool plus context tiers (lap, health, rival, region, last result, campaign flag) [7][18]
- [ ] 4 to 8 lines for common triggers, 2 to 3 for rare ones, one rare standout
- [ ] Each line takes a different angle; no synonym swaps [29]
- [ ] At least one bark of three words or fewer, and one full sentence
- [ ] Speaker recognisable with the name covered; no "never says" breach
- [ ] Doesn't sneer at the player for failing [29]
- [ ] No phrase shared with another character or another pool
- [ ] Once per race; long cooldown on the standout; never back-to-back from one speaker
- [ ] One breath, numbers as words, at most one capitalised word and one hesitation mark
- [ ] Fits the caption slot in two lines at TV distance
- [ ] Clean against the C4 blacklist
- [ ] Still makes sense if cut off halfway, or has a cut-off variant [7]

### C4. LLM-tell blacklist

A hit rejects the line. A human may override it with a written reason.

**Constructions:** `It's not .*, it's` · `not just .* but` · `Not .*\. Not .*\. Just` · three-item lists in voiced lines · a closing generalisation about life, roads, debts, blood or fate · `I'm (so )?(scared|angry|sorry|worried|afraid|proud)` without approval · scene summaries (`after everything`, `in the end`, `we've both`) · mirrored pairs (`You X for Y. I X for Z.`) · more than one rhetorical question per exchange.

**Vocabulary:** testament, tapestry, delve, palpable, symphony, dance (as a metaphor), echo, whisper(ed), murmur(ed), flicker(ed), "the weight of", "barely above a whisper", "heart hammered", "something shifted", "a beat", "for what it's worth", "here's the thing", "let that sink in", "buckle up", "let's do this", "game on", "well, well, well". Therapy words: valid, process (about feelings), boundaries, journey, closure, "I hear you". Names: Elara, Kael, Lyra, Seraphina, Thorne, and any name not sanctioned by the region bible.

**Punctuation and TTS:** more than one `...` or `—` per voiced line · more than one all-caps word · numerals, currency symbols or abbreviations in voiced text · audio tags in v2 lines · non-vocal tags · adverb speech tags in TTS context text [1][31].

**Tone:** a quip straight after a death, seizure or boss turn · puns in speech [27] · an exclamation mark plus a future threat in a villain line.

### C5. Revision protocol

Steps marked H need a human.

1. **Brief (H the first time).** Slot, speaker, verbal action (want, stakes, why now), hidden note, information the player needs, word cap, TTS model, flags to plant or pay off.
2. **Load context.** Voice bibles, 3 to 5 reference lines, the rubric and the A13 rules, all written plainly [17].
3. **Draft for spread.** 10 to 20 candidates over at least two batches with different constraints, including deliberately less likely options [13].
4. **Mechanical filter.** Blacklist regex, caps, TTS lint and a duplicate check against the line ledger. Expect about half to drop.
5. **Name-covered test.** A different model guesses each speaker from the bible set. Lines it can't attribute are dropped. H for anchor lines.
6. **Blind judging.** A cross-family judge scores against the rubric with positions shuffled and swapped and lengths shown. Keep 3 to 5 [14][15][16].
7. **Targeted revision.** At most two rounds, each fixing only the lowest dimension. Then re-run steps 4 to 6.
8. **Pick and edit (H).** Read aloud, choose one, edit by replacing and cutting [11], and log any blacklist overrides.
9. **Synthesis (H listens).** 2 to 3 takes [3]. Check pronunciation locks and silence against the 45% ceiling, and confirm no tag was read aloud [2].
10. **Ledger.** Record the line, speaker, trigger, flags and key phrases so later slots don't reuse them.
11. **Playtest audit (H).** Count bark repeats and phrases shared between characters, and feed the failures back as new briefs.

---

## Sources

1. ElevenLabs, TTS "Best practices". https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices
2. ElevenLabs, "Audio Tags 101: Directing emotional TTS in Eleven v3". https://elevenlabs.io/blog/v3-audiotags
3. ElevenLabs, "Text to Dialogue". https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue
4. ElevenLabs, "Text to Speech (product guide)". https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech
5. Secondary guides on v3 stability presets: inference.sh https://inference.sh/blog/guides/elevenlabs-v3-voice-cloning-fix ; Artlist https://help.artlist.io/hc/en-us/articles/33143492937757-Elevenlabs-Eleven-v3
6. Robert Yang, notes on Jon Ingold's "Sparkling Dialogue" (AdventureX 2018). https://www.blog.radiator.debacle.us/2018/11/notes-on-sparking-dialogue-great.html
7. Elan Ruskin, "AI-driven Dynamic Dialog through Fuzzy Pattern Matching", GDC 2012. https://www.gdcvault.com/play/1015528/AI-driven-Dynamic-Dialog-through ; Emily Short's summary https://emshort.blog/2012/03/16/gdc-2012-talk-on-dynamic-dialogue/ ; F.E.A.R. note https://www.gamedeveloper.com/game-platforms/speak-to-me-
8. David Mamet, memo to the writers of The Unit. https://nofilmschool.com/2010/10/david-mamet-drama-a-memo-the-unit-writers
9. Wikipedia, "Signs of AI writing". https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
10. Paech et al., "Antislop", arXiv 2510.15061. https://arxiv.org/html/2510.15061v2
11. Chakrabarty, Laban, Wu, "Can AI writing be salvaged?" (CHI 2025). https://arxiv.org/html/2409.14509
12. Shaib et al., "Measuring AI 'Slop' in Text", arXiv 2509.19163. https://arxiv.org/html/2509.19163
13. Zhang et al., "Verbalized Sampling", arXiv 2510.01171. https://arxiv.org/abs/2510.01171
14. Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena". https://arxiv.org/pdf/2306.05685
15. Chen et al., "Humans or LLMs as the Judge? A Study on Judgement Biases" (EMNLP 2024). https://arxiv.org/html/2402.10669v2
16. Wataoka et al., "Self-Preference Bias in LLM-as-a-Judge". https://arxiv.org/pdf/2410.21819
17. Anthropic, "Prompting best practices". https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
18. Greg Kasavin interview, GeekDad (2019). https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/ ; GDC 2021 Hades dialogue talk https://www.gdcvault.com/play/1026975/Breathing-Life-into-Greek-Myth
19. David Milch on language in Deadwood, Literary Hub. https://lithub.com/david-milch-on-language-and-obscenity-in-deadwood/
20. Amanda Overton on Arcane, Creative Screenwriting. https://www.creativescreenwriting.com/cswcms/amanda-overton-discusses-arcane-a-tale-of-two-traumatized-sisters-in-two-cities/
21. SlashFilm on the 2018 Cowboy Bebop roundtable (Nobumoto). https://www.slashfilm.com/988164/long-before-cowboy-bebop-shinichiro-watanabe-had-already-created-spike/
22. Cinephilia & Beyond on Fury Road (Miller to Total Film). https://cinephiliabeyond.org/mad-max-fury-road/
23. Anthony Burch, Shacknews. https://www.shacknews.com/article/77199/borderlands-2-writer-seeting-up-sequel-why-death-matters
24. PC Gamer, John Gonzalez on Fallout: New Vegas villains. https://www.pcgamer.com/games/rpg/fallout-new-vegas-lead-writer-worries-caesars-argument-for-authoritarianism-was-done-a-little-too-well-but-still-believes-you-cant-just-make-your-tyrants-cardboard-villains/
25. Kotaku on Disco Elysium's dialogue (Kurvitz). https://kotaku.com/disco-elysiums-dialogue-system-is-as-addictive-as-any-s-1841046831
26. Game Rant, interview with Baldur's Gate 3 lead writer Adam Smith. https://gamerant.com/baldurs-gate-3-interview/
27. Ian Adams, "6 tips for writing video game dialogue that's actually funny". https://www.gamedeveloper.com/design/6-tips-for-writing-video-game-dialogue-that-s-actually-funny
28. Mark Slabinski, "8 Key Principles of Writing Effective Game Dialogue". https://www.gamedeveloper.com/game-platforms/8-key-principles-of-writing-effective-game-dialogue
29. Ryan Matejka, "How To Write Video Game Barks". https://howtowriteagame.substack.com/p/how-to-write-video-game-barks
30. Robert McKee, Dialogue (2016), via summaries. https://www.blinkist.com/en/books/dialogue-en ; https://medium.com/@pirangy/dialogue-functions-action-robert-mckee-dialogue-the-art-of-verbal-action-for-the-page-stage-7e5b0ddfb26a
31. Elmore Leonard's ten rules (NYT, 16 July 2001). https://www.goodreads.com/author_blog_posts/6719280-elmore-leonard-s-10-rules-of-writing
32. Chet Faliszek on Left 4 Dead, bit-tech. https://www.bit-tech.net/reviews/gaming/pc/left4dead-interview-chet-faliszek/1/
33. Project file `docs/concepts/deathride/X3-4-campaign-voices.md` (current voice model and settings, `mechanic.seizure` silence result, unmeasured Marrow pronunciation).

**Source-quality note.** The primary sources are 1 to 4, 8, 10 to 17 and 33. Sources 6, 7 (summary), 18 to 26 and 30 are interviews, notes or summaries that report a practitioner's words second-hand. Treat their quotes as accurate in substance but check them before quoting publicly. Source 5 is secondary and should be checked against the live ElevenLabs UI.
