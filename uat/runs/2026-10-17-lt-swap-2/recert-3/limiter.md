# Limiter — Linga error coverage, recert-3

Written by a builder on 2026-10-17 from this run's own files and the code at `e08dba19`. The Director's ruling (a) asked for this analysis before any more building. It is not a judge output.

## Result

**Dominant class: A, mayStop was false.** The moment **gap** blocked 14 to 17 of the 28 misses, and the **cap** blocked 7, all of them Tomáš's (J3 L6 to L12). B, where the model was allowed to stop and did not, covers 4 to 7. C covers none, because every miss is explained before detection matters (see *Class C* below).

The gate does what it was written to do. It is the limiter by construction. Suppose the tutor had stopped on every error turn the gate let through. It would then have shown **14 to 16 moments**, not 13, out of 41 error turns. So at least 25 of the 28 misses could not have had a moment under the current gap and cap, whatever the model or the prompt did. The gate holds stops to the rubric's density target, 1 to 3 per ten learner turns (`uat/rubric.md:33`). In this run 41 of 54 learner turns, 76%, carried a clear error. At that error rate, a stop-only recall is capped near 3 / 7.6, about 40%. The run's 13 of 41 is 32%.

**No fix was built.** Raising recall through stops means breaking the density target that `uat/rubric.md:33` and the 2026-09-15 findings set (Ondřej's "grammar police", Martin's "4.29 per ten", Klára's and Oksana's "3.75 per ten"). The other route is to coach without stopping. That choice is the open owner question **LG-23** (`docs/LINGA-CONVERSATION-DESIGN.md:228`: *"Is there a third preference, save fixes for the end…? Should a stop be kept for meaning-blurring errors, with everything else held for the recap?"*). Both routes are a conflict between two goals, or a scope change, so the builder brief says to report rather than decide. The options and what each would recover are under *What a fix needs*.

## Method

The gate, as it ran (`desk/src/lib/english/conversation.ts`):

- `momentAllowed(c)` (line 150): no moment if correction is not `as-needed` or `moments.length >= cap`. Otherwise allowed if there is no earlier moment, or if at least `gap - 1` learner turns have passed since the last moment's turn. B1 and above: gap 3, cap 4. A1–A2 (`beginner`, `easyBand`): gap 4, cap 2.
- `stopsRepeat = momentAllowed(c, true)` (line 459) checks the cap only.
- `fossil = fossilOf(reply, judged, again)` (line 465, `review.ts:248`) looks for a taught slip said again, or a `KNOWN_SLIP_FIXES` pair said earlier in this scene.
- `mayStop = stopsRepeat && (fossil || momentAllowed(c))` (line 466). When this is false, the turn's task reads `moment: kind none with empty fields.` (line 474), so the model is told not to stop.

For each learner turn of each J3/J4 transcript, the state before that turn was rebuilt from `facts.conversation`. That state is the turns before it, the moments already closed, the scene band and correction `as-needed`, and an empty taught list (each Character has its own fresh `DESK_DATA_DIR`, and placement writes no taught item). The real `momentAllowed`, `slipsAgain` and `fossilOf` were run on it, through `tools/ts-load.cjs`. Each moment is placed on the learner turn whose text holds its `said`.

| Journey | Band | Learner turns | Moments on | mayStop true on | mayStop false (why) |
|---|---|---|---|---|---|
| martin-45 J3 | B2 | 7 | L2, L5 | L1, L2, L5 | L3, L4, L6, L7 (gap) |
| ondrej-16 J3 | B1 | 4 | L2 | L1, L2 | L3, L4 (gap) |
| petra-38 J3 | A2 | 5 | L1 | L1, L5 | L2, L3, L4 (gap) |
| viktor-67 J3 | A1 | 5 | L5 | L1–L5 | none |
| oksana-34 J3 | B1 | 10 | L1, L5, L9 | L1, L4, L5, L8, L9 | L2, L3, L6, L7, L10 (gap) |
| adela-17 J3 | B2 | 4 | L1 | L1, L4 | L2, L3 (gap) |
| tomas-9 J3 | A1 | 12 | L1, L5 | L1, L5 | L2–L4 (gap), L6–L12 (cap) |
| tomas-9 J4 | A1 | 3 | L1 | L1 | L2, L3 (gap) |
| jana-29 J3 | C1 | 4 | L2 | L1, L2 | L3, L4 (gap) |

`fossilOf` returned null and `slipsAgain` returned nothing on every turn of the run.

**Limits of the evidence.**

1. The judge gives counts per journey (`learnerTurnsWithClearErrors`, `missedClearErrors`) and quotes some turns, but it does not list the error turns. Below, a turn counts as an error turn when the judge quotes it, or when it holds an unambiguous error, and the per-journey counts are made to match the judge's. Three misses cannot be placed on one turn. Their rows say so.
2. The transcripts do not keep the model's raw `moment` field. On a B row, "the model chose not to stop" cannot be told apart from "the model returned a fix that `parseMoment` dropped (said not an exact excerpt) or `audienceSafe` held". Each B row carries this caveat.

L*n* is the *n*-th learner turn in `facts.conversation.turns`. The *#n* numbers are the judge's step numbers, where the judge quoted one.

## Per-turn table: the 41 clear-error turns

### The 28 misses

| # | Character · turn | Learner line (the error words in bold) | mayStop | Class | Why |
|---|---|---|---|---|---|
| 1 | martin-45 J3 L3 (#7) | "On our side the owner will be Petr… **He don't have** a problem to prepare the summary **until Friday**…" | false | A · gap | 0 learner turns since the L2 moment. **Detector gap:** "he don't" is a `KNOWN_SLIPS` pair, and Martin said "when **he don't** agree" in his J1 level check. `fossilOf` only reads this scene's learner lines, and placement writes no taught item, so the repeat was not seen. With it, the turn would have stopped inside the gap. |
| 2 | martin-45 J3 L4 | "…Also we **must to** stop other orders… I need the confirmed date **until tomorrow**." | false | A · gap | 1 turn since L2. "until tomorrow" repeats L3's deadline "until". No list can key it, because "until" is right in "wait until Friday". |
| 3 | martin-45 J3 L6 | "…a problem in your packing process, not **a accident**… send the root cause analysis **until next Wednesday**?" | false | A · gap | 0 turns since the L5 moment. Third deadline "until", not keyable. |
| 4 | martin-45 J3, L1 **or** L7 (ambiguous) | L1 "…this delay **is making a problem** for our production… ten minutes **for every topic**…" / L7 "…we should **do a separate meeting** for the pricing…" | L1 true / L7 false | B (L1) or A · gap (L7) | The judge counts 6 error turns and does not say which turn is the sixth. On L1 the model was allowed to stop (see limit 2 above). On L7, 1 turn had passed since L5. |
| 5 | ondrej-16 J3 L1 | "all night? no way man… I can play **only to ten** maybe" | true | B | No moment yet. The model returned no moment that survived (limit 2). |
| 6 | ondrej-16 J3 L3 (#7) | "maybe on saturday? I have no school then, so we can play **more long**…" | false | A · gap | 0 turns since the L2 moment. First time: there is no repeat to detect. |
| 7 | ondrej-16 J3 L4 (#8) | "tonight we finish at ten… **is ok for you?**" | false | A · gap | 1 turn since L2. First time. |
| 8 | petra-38 J3 L2 (#4) | "…I can not sleep **because is too hot** and I am very tired." | false | A · gap | A1–A2 gap 4: 0 turns since L1. Repeats L1's dropped subject "**and is very hot**". `KNOWN_SLIP_FIXES` has no subject-drop pair, and "is too" is not keyable. |
| 9 | petra-38 J3 L4 (#6) | "…Also the bathroom, the water is not hot **in shower**. Sorry." | false | A · gap | 2 turns since L1, and the gap needs 3. A repeated article drop (L1 "I have problem"), not keyable. |
| 10 | petra-38 J3, L3 **or** L5 (ambiguous) | L3 "Maybe I can change **to other room**?…" / L5 "No, thank you. **I stay** in this room… thank you **for help**." | L3 false / L5 true | A · gap (L3) or B (L5) | The judge counts 4 error turns and quotes only L1, L2 and L4. L3 is 1 turn since L1. L5 is the first turn the gate opens again (limit 2). |
| 11 | viktor-67 J3 L2 (#3) | "Yes, I am home. **I am in garden.** Mia, how is school?" | true | B | No moment yet. `momentTaskFor(true)` tells a beginner's tutor *"A grammar slip is a stop for a beginner only when they have made it more than once"*, and this is the first time. Not stopping is what that task asks, so the cause would sit in momentTaskFor (limit 2). |
| 12 | viktor-67 J3 L3 (#4) | "Yes, I have flowers. **Garden, many flowers.** Mia, **you have flowers?**" | true | B | Arguably the second article drop. Allowed, and no stop came (limit 2). |
| 13 | viktor-67 J3 L4 (#5) | "**My flowers red and yellow.** I love flowers. Mia, I miss you." | true | B | First-time missing verb, so the same beginner rule applies (limit 2). Note: had the model stopped on L2, the A1 gap of 4 would have blocked L3 to L5, L5's moment included. Viktor's scene admits **one** stop whatever the model does. |
| 14 | oksana-34 J3 L2 (#5) | "…a GPS system to see **where are the trucks**." | false | A · gap | 0 turns since the L1 moment. First time. |
| 15 | oksana-34 J3 L3 (#6) | "…**When was a delay**, I called the driver and I found **other solution**." | false | A · gap | 1 turn since L1. The article drop repeats L1 "was logistics coordinator", not keyable. |
| 16 | oksana-34 J3 L6 (#11) | "First I would call the driver to know where he is and **how long is the delay**. Then I would call the carrier **dispečink**…" | false | A · gap | 0 turns since the L5 moment. Repeats L2's indirect-question order, and "dispečink" is the L1 word again. Neither is a `KNOWN_SLIP_FIXES` pair. |
| 17 | oksana-34 J3, one of L7 / L10 / L4 / L8 (ambiguous) | Most likely L7 "I worked three years **as logistics coordinator**…" (supported) | L7, L10 false / L4, L8 true | A · gap (L7, L10) or B (L4, L8) | The judge counts 7 error turns and quotes four. The other three are the moment turns. L7, the third article drop of the scene, is the likeliest; it was 1 turn since L5. |
| 18 | tomas-9 J3 L3 (#5) | "I make house. **Dům je** green. Creeper" | false | A · gap | 1 turn since L1. **Detector gap:** the L1 word moment taught "A dům… house" → "house", and "Dům" is said again. `keysOf` (`slip.ts:178`) returns null for a word moment, so `slipsAgain` never matches a taught word. With it, the turn would be a fossil inside the gap, but that would spend the A1 cap of 2 and lose the L5 moment, so Tomáš's total would not change. |
| 19 | tomas-9 J3 L4 | "Minecraft. **Je to v**… house. Green house" | false | A · gap | 2 turns since L1, and A1 needs 3. Czech reach, not yet taught. |
| 20 | tomas-9 J3 L6 (#9) | "Yes! Dog. **I like dog. Pes je brown.**" | false | A · cap | 2 moments, which is the A1 cap. The cap also blocks a fossil (`stopsRepeat` false). |
| 21 | tomas-9 J3 L7 | "Rex. My dog Rex. **Je to brown dog**" | false | A · cap | Cap. An exact repeat of the L5 word moment "Je to blue water" → "It is blue water". That is cited row LT-tomas-9-J3-3: "no moment after 'Je to' was shown". |
| 22 | tomas-9 J3 L8 | "Rex… **v house**. Green house. Rex is **in house**" | false | A · cap | Cap. |
| 23 | tomas-9 J3 L9 | "Yes. Rex is big. **Velký pes.** I like Rex" | false | A · cap | Cap. |
| 24 | tomas-9 J3 L10 (#13) | "**Nevím**… House. Green house. **Dog house je brown**" | false | A · cap | Cap. LT-tomas-9-J3-3. |
| 25 | tomas-9 J3 L11 | "Yes. Near house. **Dog house je near.**" | false | A · cap | Cap. |
| 26 | tomas-9 J3 L12 (#15) | "No fish. Dog. I like dog. **Ty máš fish?**" | false | A · cap | Cap. |
| 27 | tomas-9 J4 L2 (#7) | "**Dog jump… voda.** Splash! Dog water." (supported) | false | A · gap | 0 turns since the L1 moment. A different Czech word from the taught "Pes je mokrý", and "Dog jump" repeats L1 "Dog like" (third-person -s) on another verb. Not keyable. LT-tomas-9-J4-3. |
| 28 | tomas-9 J4 L3 (#9) | "First, my dog… **park**. Then **dog water**. Splash!" (supported) | false | A · gap | 1 turn since L1. LT-tomas-9-J4-3. |

### The 13 caught

| Character · turn | Moment shown (said → better) |
|---|---|
| martin-45 J3 L2 | "we was waiting for your packaging material already two weeks" → "we have been waiting … for two weeks" |
| martin-45 J3 L5 | "he want to know the root cause" → "he wants …" |
| ondrej-16 J3 L2 | "I don't want my mom be angry" → "… my mom to be angry" |
| petra-38 J3 L1 | "The air conditioning is not work" → "… is not working" |
| viktor-67 J3 L5 | "Bees in garden." → "Bees in the garden." (the model's own repeat judgement; "in garden" is not keyable) |
| oksana-34 J3 L1 | "I have worked there since three years" → "… for three years" |
| oksana-34 J3 L5 | "some reserve carrier" → "a reserve carrier" |
| oksana-34 J3 L9 | "I am used to start early" → "I am used to starting early" |
| adela-17 J3 L1 | "students are interested about using them" → "interested in using them" ("actual information", a false friend in the same turn, was not named) |
| tomas-9 J3 L1 | word: "A dům… house" → "house" |
| tomas-9 J3 L5 | word: "Je to blue water" → "It is blue water" |
| tomas-9 J4 L1 | word: "Pes je mokrý." → "The dog is wet." |
| jana-29 J3 L2 | "I'd rather somewhere…" → "I'd prefer somewhere…" |

## Totals

| Class | Rows | Of which |
|---|---|---|
| **A · mayStop false** | **21 firm + up to 3 ambiguous = 21–24** | gap 14 firm (+0–3 ambiguous), cap 7 (Tomáš J3 L6–L12). `stopsRepeat` itself never blocked except at the cap. |
| B · mayStop true, no stop | 4 firm + up to 3 ambiguous = 4–7 | ondrej L1; viktor L2, L3, L4 (beginner rule "only when made more than once") |
| C · code cannot detect | 0 | see below |

Detector gaps inside class A, meaning repeats that a code-found fossil could have stopped inside the gap:

- **Level-check slips never reach `fossilOf`.** martin L3, "He don't" after J1's "when he don't agree". This is +1 row if seeded.
- **Word moments carry no slip keys.** tomas J3 L3, "Dům" after the "dům → house" moment, and L7 "Je to" after the "Je to" moment. L7 is cap-blocked anyway. Seeding L3 spends Tomáš's cap and loses L5, so the net is 0.

The other repeats in the gap rows cannot be put on a list: the deadline "until", subject drops, article drops, indirect-question order. Only a model judgement can recognise them.

**Class C.** None of the misses is *only* C, because A is reached first on every miss and the gate never asked the model. Still, of the 14 firm gap rows only 2 hold a repeat that code could have matched: martin L3 and tomas J3 L3. The other 12 are either first-time errors (ondrej L3, L4; oksana L2; tomas J3 L4) or repeats that no closed list can key (martin L4, L6; petra L2, L4; oksana L3, L6; tomas J4 L2, L3). Widening 7f72ae7a's rule, which lets a code-found repeat stop inside the gap, cannot reach those 12.

**The ceiling.** If the model had stopped on every error turn the gate let through, the counts would have been: martin 2, ondrej 2, petra 1–2, viktor 1, oksana 3–4, adela 1, tomas J3 2, tomas J4 1, jana 1. That totals 14–16 of 41. The run reached 13. A perfect model under the current gate recovers **1 to 3** of the 28. Each B stop the model took would have spent the gap on the turns after it.

## Cited open rows

| Row | Rows above | Class |
|---|---|---|
| LT-martin-45-J1-1 (B2 generous; "We was discussing", "when he don't agree" not named) | Placement, so it is outside the 41 moment turns (J1 metric 0 of 0). Its "he don't" is the unseeded repeat in row 1. | n-a here; feeds row 1's detector gap |
| LT-martin-45-J3-1 (fossilised errors pass) | 1, 2, 3, 4 | A · gap (row 4 may be B) |
| LT-ondrej-16-J3-2 ("play more long", "is ok for you?") | 6, 7 (and 5) | A · gap (5 is B) |
| LT-petra-38-J3-1 (recert-2; "I have problem", "because is too hot") | 8, and 10 | A · gap ("I have problem" sits in the L1 moment turn) |
| LT-petra-38-J3-4 (repeated errors passed) | 8, 9, 10 | A · gap |
| LT-tomas-9-J3-3 ("Pes je brown", "Dog house je brown" after "Je to") | 20, 21, 24 | A · cap |
| LT-tomas-9-J4-3 ("Dog like water", "Dog jump… voda") | 27, 28 | A · gap ("Dog like water" is the L1 moment turn) |
| LT-viktor-67-J3-3 (repeated "in garden", 3 of 4 missed) | 11, 12, 13 | B (the beginner rule in `momentTaskFor`), and the gate admits one stop in his scene |

## What a fix needs (for the owner's ruling, LG-23)

1. **Coach without stopping. This reaches up to 21–24 rows, and it is the recommendation.** On a turn where the gap or the cap shuts the stop, the turn would still ask for the one fix, held to the same `parseMoment` check (an exact excerpt of the reply). Code would keep it as a held note: never a stop, never on screen during the scene (K2 holds). The recap would list the held notes and keep them on the record. The density target stays as it is. Whether a recap note counts as "coaching" under `uat/rubric.md:34` ("no moment and no coaching") is a judge-rubric question. Size M: the turn task and parse in `conversation.ts`, a `Conversation` field in `types.ts`, the recap in `view.ts` (its TV picture follows the "verdict is a picture" rule), and rule tests. This is LG-23's *"save fixes for the end"* and *"held for the recap"*.
2. **Loosen the gate.** Change the B1+ gap from 3 to 2 and the A1–A2 gap from 4 to 3, with the A1–A2 cap from 2 to 3. Under the same reconstruction, and with a model that stops every time it may, this recovers about 6 rows: martin, ondrej, petra, viktor, oksana and tomas J3 one each. That is 19 moments in 54 turns, 3.5 per ten, over the rubric's 3 (`uat/rubric.md:33`). It also brings back Martin's 3 stops in 7 turns, the 4.29 per ten that the 2026-09-15 run flagged.
3. **Widen the detectors only.** Seed level-check slips into `fossilOf`, and give word moments keys from their own-language words. This is +1 net (martin L3), all bounded by the cap. It does not move the figure.
4. **Separately (class B, Viktor):** `momentTaskFor(true)` keeps a first-time grammar slip from stopping a beginner. Under the A1 gap his scene admits one stop anyway, so this changes which turn is caught, not how many.
