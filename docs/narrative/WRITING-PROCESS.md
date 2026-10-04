# Death Ride: how the script was written, and where it is weakest

Head writer's report, 2026-10-04. It covers how the 518 lines in `deathride/narrative/lines.csv` were produced and checked, what the checks found, what was cut, and where I am least sure. The method is R3's revision protocol (C5), applied with the tools available to a single writing session. The protocol is mapped step by step below, including the steps I could only approximate.

## 1. Order of work

1. **The last card first.** The ending card (`campaign-victory`) was written and locked before anything else (R1 P3, R2 P3). Every other card was then checked against it: does this set it up? (STORY-BIBLE-V2 section 1.)
2. **Frame and bible next.** I read the four dossiers, the owner's plot and rulings, the data (including the code that builds race grids) and the kept art briefs before writing a line. Two facts from the code shaped the story: every named rival is on every grid in Acts 1 to 4, and Marrow races (and Relay doesn't) in Act 5.
3. **Voice bibles** (R3 C2) before any dialogue, with "never says" lists.
4. **Candidate pools for the 45 key slots**, judged blind, with a revision round for the weak ones.
5. **The full script** (`lines.csv`), with the key slots filled from the judged picks and the remaining lines written to the voice bibles.
6. **Mechanical lint**, then a **read-aloud pass**, then a **covered-name test**, each followed by fixes.

## 2. Candidate drafting and blind scoring (R3 B3, B5, C5 steps 3 to 7)

**Slots.** 45 key slots: 12 story cards (including the prologue, the boss races, crown-3, crown-4, crown-6, the finale card and the locked ending), the four boss turns, the four refusals, Marrow's key lines (Paper Night, first receipt, first notice, first time on track, the seizure, the hut offer, all three finale phases), the Voice's key lines (first call, the correction, the duel opener, the last line), the Mechanic's key lines (welcome, the frame, the seizure, the rig plan, the shim, the duel opener, after, the pardon) and four ally lines. This is more than the 40 the brief asked for.

**Drafting under rotating constraints.** 456 candidates, 10 to 12 per slot, drafted in four batches. **A**: at most 8 words a line. **B**: must carry a concrete object or number. **C**: open on a verb, no adjectives. **D**: an angle most writers would not take. These are R3 B3 point 5 and verbalized-sampling-style spread (R3 B1, [13]).

**Blind judging.** Two independent judges, a Sonnet-class model (J1) and an Opus-class model (J2), each got a packet with the rubric (R3 C1, ten dimensions, 1 to 5), a short world summary and the slot briefs. Each packet shuffled candidates differently, with speaker names, batch letters, authorship and my picks hidden, and character counts shown. Judges were told to be severe and to cite a rubric dimension and a word for each top-3 reason (R3 B5). They wrote their scores by hand; I checked that they were not computed by a heuristic.

**Results (round 1):**

| Measure | Value |
|---|---|
| Candidates scored | 456 by each judge |
| Mean score (both judges) | 3.69 (J1 3.65, J2 3.73) |
| Agreement between the judges' candidate means (Pearson) | 0.64 |
| Same first choice | 25 of 45 slots |
| Overlap of top 3 | 82 of 135 places |
| Candidates passing R3's ship rule for both judges | 57 of 456 |
| Mean by batch | A short 3.60, B concrete 3.75, C verb-first 3.69, D unlikely angle 3.69 |
| Slot winners by batch | B 17, D 16, C 7, A 5 |

The batch result is the most useful finding for future writing: **specificity (B) and the unexpected angle (D) win; brevity alone (A) does not.**

**My taste against the blind judges.** Before judging I had marked a provisional pick in each slot. Of the 41 that could be matched, **only 9 were the blind first choice**, and the median rank of my pick was 3. Most of the judges' overrides were right. My best example of being wrong: my Mica witness line ("Your mechanic said no to Marrow at my table, shaking. I've said nothing to him for ten years, steady.") scored 2.60, because it is a mirrored sentence (B2 #14). I had not seen it. Its replacement scored 4.45.

**Revision round (R3 C5 step 7).** Nine slots had no candidate clearly over the bar. For each, I wrote three rewrites aimed at the lowest-scoring dimension and judged them blind against the two best originals by two fresh judges (J3 Sonnet-class, J4 Opus-class):

| Slot | Target dimension | Best before | Best after | Outcome |
|---|---|---:|---:|---|
| Mica's turn (witness line) | Tells (mirroring), Action | 3.75 | **4.45** | "The boy refused him at my table. I poured the man's tea." |
| Mica asks the Mechanic's name | Specificity, Function | 3.95 | **4.40** | "I don't tie numbers to the anchor. Give me a name." |
| Finale card (crown-7) | Economy, Ear | 3.95 | **4.25** | tightened |
| Ox's boss card (foundry-7) | pass threshold | 4.00 (failed both) | **4.15** | the round-1 runner-up confirmed |
| The Mechanic after the duel | Action | 3.85 | **4.10** | "The radio went quiet, so I counted the bolts on the shelf..." |
| The rig plan | Tells ("doesn't need to be X, needs to be Y") | 3.80 | **4.05** | "Three years in his garage, he never let a single bolt go..." |
| The covered frame | Action | 3.95 | **4.00** | small gain |
| **switchback-6 card (the offer)** | Economy, Ear | 3.75 | **3.80** | **still under the bar** |
| **Vex's refusal** | Subtext, Tells | 4.10 then 3.30 | about 3.7 | **still under the bar; the judges disagree** |

I stopped after one revision round, following R3 B4 ("about two passes"; model edits plateau).

**The record.** Every candidate, both judges' ten-dimension scores, the pass flags, both judges' first choices with their reasons, the revision rounds and the decision for each slot are in `deathride/narrative/candidates/` (`cards.md`, `turns.md`, `marrow.md`, `voice.md`, `finale.md`, `mechanic.md`). The status column marks the key pick, secondary uses and alternates.

**Where I overrode or bent the scores, and why:**

- **The ending card** was locked before judging (R1 P3). It also came out top of its pool, which confirmed the lock rather than causing it.
- **Two ties** (Ox's turn, Ox's refusal): I took the line carrying the story function (the money twist; subtext) and used the other as the follow-up line.
- **Alternates kept** where the top line depends on a plant players may miss. Marrow's "You always round. Not tonight." is kept as an alternate for "Do not round it."; the Voice's "To the second." for "Didn't round it."; Marrow's "That is the boy's welding" for "Tell him I kept his bench."
- **Two edits after judging,** both recorded in the candidates files: "four days old" became "a week old" (continuity with crown-1), and a doubled "Here." was cut from Vex's follow-up.

## 3. The rest of the script

The 447 non-key lines (barks, taunts, shop chatter, announcer calls, retry, loss and payout variants) were written directly to the voice bibles and checked against the rubric by me, not blind-scored. That is the main honesty caveat for the bulk of the file (section 8). The bark pools follow R3 C3: at least 16 per boss rival, 10 for Relay and 18 for Marrow, split by status (rival, ally, grudge) and trigger, with at least one line of three words or fewer and one full sentence each. Information goes first, and no bark announces a hunt.

| Count | Value |
|---|---|
| Lines total | 518 (card kind 112 rows: 37 three-line cards plus Marrow's Paper Night line; shop 99; barks and taunts 98; announcer 59; pre 52; post 55; finale 43) |
| Status | 71 key picks, 425 drafts, 4 alternates, 4 variant lines (FC-13), 8 recordings kept, 6 recordings with a proposed replacement |
| Barks and taunts | Marrow 18, Rook 17, Ox 17, Mica 17, Vex 16, Relay 10, house drivers 3 |
| Voiced running time (estimate) | about 31 minutes (150 words a minute plus pauses; formula, not measured) |
| Longest voiced line | 99 characters (Vex's refusal, by design; see overrides) |
| Longest card line | 72 characters (scrap-5) |

## 4. Banned-pattern check (R3 C4)

I wrote a lint that runs on every build:

- **C4 constructions** ("it's not X, it's Y"; "not just X but"; "Not X. Not Y. Just Z."; naming one's own emotion; scene summaries).
- **C4 vocabulary** (the full list, including "echo", "whisper", "the weight of", the therapy words and the stock names).
- **Each speaker's "never says" rules** as patterns: Marrow never says debt, please, kill, die or dead, uses no contractions, no exclamation marks and no rounded "twelve hundred"; the Mechanic has no swearing, no "trust me", no "boss", "buddy" or "pal"; and so on.
- **TTS lint** for voiced lines: numerals, stacked pauses, more than one capitalised word, over 18 words, homographs, and a tricolon heuristic.
- **Phrases shared between speakers**: every 4-word sequence spoken by two different characters (R3 C3: "no phrase shared with another character").

| Build | Lint hits | Shared 4-word phrases |
|---|---:|---:|
| First build | 8 | 16 |
| Final build | 3 (all overridden, below) | 8 (two deliberate phrases) |

**What the first build caught and I fixed:** a 15-word card line; a tricolon ("Heavy, quick, bad at stopping"); three voiced lines too long for one breath (one was split into two lines); **all three boss loss lines starting "Come back when you..."** (exactly the synonym-pool sameness R3 A9 warns about); "tow it to the" shared by Marrow and Ox; "I can hear it" shared by the Mechanic and Mica; "spend it on something" shared by Ox and Mica; "five seconds a drop" shared by Vex and the Mechanic.

**Overrides, each with its reason:**

- `ann.finish.win.a5` ("Twelve Hundred, first, at the Crown."): the tricolon heuristic misfired; there is no list.
- `rec.mechanic.ally` ("That boss is backing you now..."): "boss" means the division boss, not a way of addressing the player. It is an owner-kept recording.
- `vex.refuse.2` (20 words): Vex's bible gives him the longest, fastest lines in the cast. It is two sentences, each one breath.
- Shared "posted under clause nine. In good order." (Marrow's ledger and the Voice's notice): the Voice reads Marrow's own words ("From the book"), so the repetition is the ritual.
- Shared "they hold anything that wants to stay" (Mica, then the Mechanic quoting her): a deliberate quote.

## 5. Read-aloud pass (R3 B6, point 4)

I read every voiced line aloud, grouped by speaker, in one sitting, so I could compare voices. It found what the regex could not:

- **The Mechanic blamed the car with the same move five times** ("That's the car, not you", "It's not you. It's the left mount", "That's not you. That's the brakes", "It's the rig, not you", "gasping, not you"). This is the R3 B2 #1 construction with full stops instead of a comma, which the regex missed. Four were rewritten; the one in the finale was kept.
- **"That's not a skill, that's a fact."** (Ox's boss loss): the same construction. Rewritten: "She's heavier. Heavy's a fact. We can fix a fact."
- **Mica said "over the top... alive" three times.** Two were rewritten.
- **"That's racing."**, a stock phrase, was replaced by "Slagged me. Fair. The crew'll talk about it for a week."
- **The homograph "read"** in four of Relay's lines, which are his catchphrase: "read it twice". I kept them (the catchphrase is the character) and marked the past tense in the voice direction ("pronounced red").
- **A continuity slip:** the Voice said "Ox has stopped the belt", but Marrow cancelled the order. Now "The belt has stopped."
- **A character slip:** Rook said "forty keys" when the scrap-1 card shows forty-one. A collector would never round, so it is now "forty-one".

## 6. Covered-name test (R3 C5 step 5)

A fresh agent with no access to the script file, the scores or the key was given the voice bibles and 75 voiced lines with the speakers hidden (10 per main speaker, 5 for Relay, sampled at random, recordings excluded). It attributed **69 of 75 (92%)**. The Voice, Vex and Mica scored 10 of 10; Marrow, the Mechanic, Rook and Ox 9 of 10; **Relay 3 of 5**. Relay's polite, procedural register overlaps Marrow's precision ("Damage within tolerance. Barely." was taken for Marrow). I moved that line toward courier vocabulary ("Still on route. Only just.") and record the overlap here: **Relay is the least distinct voice in the cast.** The test is generous because lines carry address and slang ("Mirror", "fresh tag", "From the book"), but those are voice markers by design.

## 7. Lines cut, and why

| Cut | Why |
|---|---|
| All lines about the living missing sibling ("Your sibling is safe here", "Your sibling steps out from behind the parts shelves") | Frame change FC-01 |
| The fire conspiracy (a league tow truck at the burning garage) | A stock twist that makes Marrow a thug rather than a reasonable man (bible section 16) |
| Investigation procedure on cards ("Relay finds your payment listed as a fleet purchase") | Exposition; facts now arrive as objects and confessions (R3 A8) |
| "Your mechanic said no to Marrow at my table, shaking. I've said nothing to him for ten years, steady." | Mirrored sentence; 2.60 blind |
| "This is the Voice. Thirty years I've read what's put in front of me. Tonight that hasn't changed." | My favourite for the Voice's turn; 3.55 blind. The judges preferred the line that names his complicity (Tull) as fact. |
| "I listened. I didn't watch. The Voice went quiet and I didn't know what that meant." | Explains rather than acts; 3.35, then 2.95 |
| "The shim? That's his pardon. It was the right thickness." | Needs its own set-up; the card now sets it up, and "I folded it six times. Seven was too thick." lands harder (4.55) |
| "It's ugly. I know. Ugly doesn't need to be fast. It needs to be followed." | A disguised "X, not Y" construction |
| "You paid for the driving. The car was only ever lent." | Good, but beaten by "Clause nine. You will find it on the back of your copy now." (4.60, the best line of all 456) |
| "Twelve hundred credits of car. I'll call you Twelve Hundred. Saves time." | It explains the joke; "I don't do change" lets the listener get it |
| The research dossiers' own example lines (the bumper jar, the kept mirror) | Written for this project, but reusing them would make the script derivative of its brief |
| "Hidden's stolen. No.", "Belt first. Truth after.", "Not the watch. Never the watch." and other three-word refusals | Batch A: short without content scored lowest across the board |

## 8. Where I am least sure

1. **The judges are the same family as the writer.** All four judges were Anthropic models. R3 B5 asks for a judge from a different family, because of self-preference bias (R3 [16]). I could not do that. Two model sizes, separate agents, shuffled orders and hidden authorship reduce the bias but do not remove it. **The owner's read-aloud pick on the review page is the real final step (R3 B6), not my scores.**
2. **The emotional peak hangs on a plant.** "Do not round it." / "Didn't round it." works only if the player has noticed that the Voice rounds and Marrow lets him (Paper Night, switchback-3, crown-3). Out of context, "round it" could be heard as a driving instruction (round the corner). The alternates ("You always round. Not tonight." / "To the second.") explain more and land less. This needs a playtest.
3. **The Voice as Marrow's protected bond (FC-03)** is the boldest frame change and the least tested. Some players will hear only a dry announcer. The four wordless moments are designed to accumulate, but nothing guarantees it.
4. **Two key slots are under the bar:** the switchback-6 card (the offer; best 3.80 after revision) and Vex's refusal (judges disagree between rounds). Both are flagged on the review page.
5. **The 425 draft lines were not blind-scored.** They passed the lint, the never-says rules and the read-aloud pass, but the bark pools in particular have not had the scrutiny the key lines got. A repetition audit after a real playtest (R3 C5 step 11) is the next honest step.
6. **Marrow has no cast voice.** His voiced lines are written for a calm, low, older voice, untested in synthesis. "Brace." and "Noted." are one-word lines, which R3 notes are unstable in TTS: generate several takes.
7. **Durations are a formula**, not measurements. Card line lengths fit a 12-word target, but the GL card-fit audit must be re-run on the new text.
8. **Runtime triggers.** The script uses triggers and conditions that are natural for a salience table but may not all exist yet, for example `near-rival`, `own-mine-hit`, `player-slow`, `mine-hit-marrow`, `finale-phase`, `boss-finished` and `boss-wrecked`, `prev-payout`, `weakness`, `wrecked-streak`, `debt` bands, `levy-exposed`, the `after:<id>` sequencing and `scene=hut`. Every broad trigger has a fallback line with fewer conditions, so the table degrades gracefully, but wiring is M work and is not claimed here.
9. **The tone is darker than Q0's** (Tull's death on track). Warmth and humour are carried by the Mechanic, Rook's bookkeeping and the Voice's dryness; I think it balances, but this is a judgement.
10. **Relay's voice** is the least distinct (section 6).
11. **The weakness reveals (FC-16)** may count as a cue under the owner's "no visible cue" ruling. They are tagged so they can be switched off in one place.

## 9. What a human still has to do (R3 B6)

1. Sign off the voice bibles and their "never says" lists.
2. Pick the anchor lines from the top three on the review page, reading each aloud. The candidates files give the alternatives.
3. Cast Marrow's voice, then synthesise 2 to 3 takes per line. Listen for silence under 45%, the pronunciation locks and the past-tense "read".
4. Accept or reject each frame change in `FRAME-CHANGES.md`.
5. After a playtest, audit repetition and attribution.

## 10. Reproducibility

The drafting pools, the blind packets (with shuffle seeds), the judges' raw score files, the key files and the build and lint scripts were working files in the session scratchpad. They are not part of the repository. The candidates files under `deathride/narrative/candidates/` carry every candidate and every score, so the record survives without them.
