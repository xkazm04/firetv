# LT run 2026-10-17-lt-swap-2/recert-4 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 8 Characters · 25 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 1 of 12

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J3 | pass | pass | 5/5 |  | 6/6 | 1/1 | 0 | 10 | 6.5 | done |
| adela-17 | J4 | fail - D4 failed: The recap (#15) says '2 on your own · 3 with help', yet she used help only bef…; C4 failed: Only the opener is a B2 opinion question. Later turns drop to personal or yes/… | fail | 4/5 |  | 3/6 | 1/1 | 0 | 15 | 6 | done |
| jana-29 | J3 | conditional - C4 failed: No moment and no held fix all session. Jana's "on the picture I'm finishing" (… | conditional | 3/4 |  | 9/11 |  | 0 | 13 | 10.1 | done |
| martin-45 | J3 | fail - D3 failed: Three stops in seven learner turns (≈4 per ten, above 1-3); #14-#17 spent four…; C2 failed: #19 recap shows 'B1 · Getting by · self-chosen' with no reason from his answer… | conditional | 5/6 |  | 8/8 | 3/3 | 0 | 19 | 10.1 | done |
| oksana-34 | J3 | conditional - C4 failed: Partner asks 'the warehouse work you do each day' (#6) after she is office-bas… | conditional | 4/5 |  | 10/10 | 3/3 | 0 | 16 | 10.2 | done |
| ondrej-16 | J3 | fail - D3 failed: 3 stops in 7 turns (~4 per ten, over 1-3); #4 'Clock times take a different pr…; moments 2/3 (67%) under 90% | fail | 1/1 |  | 7/8 | 2/3 | 0 | 21 | 6.1 | done |
| petra-38 | J3 | conditional - C5 failed: #6 recap gives only 'Can you check the heater, please?'; no moment or held fix… | conditional | 3/4 |  | 4/4 |  | 0 | 6 | 3.2 | done |
| petra-38 | J4 | fail - D2 failed: The cue at #3, #4, #5 is identical and did not change on repeat. At #10 and #1…; D3 failed: #13 offers 'Replay the moment' / 'Replay with a new question' but the Characte…; C5 failed: The moment (#6-#7) is correct and usable ('I have a booking number, I think').… | fail | 5/6 |  | 3/3 | 1/1 | 0 | 14 | 2.2 | done |
| tomas-9 | J3 | fail - D2 failed: About 12 of 16 partner turns sit at A1, so 0.75, under the 0.8 gate. 'What do …; D3 failed: Two stops, one correct ('Velký'→big) and one imprecise ('Jmenuje se'→name). Pr…; pitch 12/16 (75%) under 80%; moments 1/2 (50%) under 90%; C4 failed: #1 six plan topics fit (Minecraft, dog, football, funny thing; 4 of 6). But th…; C6 failed: #10 'Jmenuje se' glossed as 'name' with 'The word for what someone is called'.… | fail | 2/4 |  | 12/16 | 1/2 | 0 | 20 | 6.8 | done |
| tomas-9 | J4 | fail - D2 failed: Cue 'Try: Hi, I am Ali. What is his name?' (#3-#6) did not fit 'Is that dog sm…; D3 failed: #9 only offers 'Back to the conversation'; #10 'Thank you! Do you have a dog?'…; C5 failed: Turns are two sentences ('Wow, Rex is fast and strong! Do you walk Rex here?' … | fail | 4/5 |  | 4/6 | 1/1 | 0 | 17 | 5.3 | done |
| viktor-67 | J3 | not-reached - ended setup-failed: claude-cli/haiku did not answer with JSON: {"topics":[{"title":"Ask a… | not-reached | 0/0 |  |  |  | 0 | 0 | 0 | setup-failed |
| viktor-67 | J4 | fail - D2 failed: Cue helped him reach 'How is school?' (#8), but no coaching note exists: momen…; D3 failed: No moment and no replay happened; rawMoments all kind 'none'. No fresh questio… | fail | 3/3 |  | 4/4 |  | 0 | 13 | 2.3 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 50/54 (93%) · safe 54/54 (100%)
- **pitch:** at band 70/82 (85%) · below 6 · above 6
- **moment precision:** 13/15 (87%)
- **moment recall:** 36/47 (77%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 92 calls, 1 failed, avg 14s · character 164 calls, 0 failed, avg 17s · judge 12 calls, 0 failed, avg 39s
- **driver coverage:** 153 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-martin-45-J3-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-martin-45-J3-1`, recurrence 9 — 'We was' (his signature error) never corrected
  - expected: A moment or held fix on 'we was waiting' and 'this parts'.
  - got: Said twice (#2, #4); the first stop took 'until' instead. Retry kept 'we was' and was marked 'You fixed'.
  - evidence: #4 'because we was waiting already two weeks' → #5 'You fixed “delivery by”'. Also 'this parts', 'I want that you confirm' got nothing in #19. · moment detection / as-needed rule
  - acceptance: Recurring errors (was/were, this+plural, want that you) get priority for the stop or held fix.
- **blocker · rank 27** `LT-martin-45-J3-2` (trust) · recurs `2026-10-17-lt-swap-2/recert-3/LT-martin-45-J3-2`, recurrence 4 — B1 shown with no evidence
  - expected: A level line naming what his answers did.
  - got: Recap only 'B1 · Getting by · self-chosen'.
  - evidence: #19 'Your level: B1 · Getting by · self-chosen' · level summary
  - acceptance: Recap shows one reason from his own lines for the band.
- **blocker · rank 27** `LT-adela-17-J3-1` (trust) · recurs `2026-10-17-lt-swap-2/recert-3/LT-adela-17-J3-1`, recurrence 2 — 'interested about' and false friends left uncorrected
  - expected: The slip 'interested about' → 'in' named in the stop, the recap or a held fix. 'eventually' (meaning possibly) also noted.
  - got: Only 'used to work' was fixed. 'interested about' got nothing, and the partner's "No: check the verb after 'used to'" ignored it. 'eventually' and 'actual' were never mentioned.
  - evidence: #3 "I'm very interested about technology"; #6 partner covers only 'used to'; #10 recap lists one moment only. · moment detection prompt; held-fix (LG-23) logic
  - acceptance: When a turn has two clear slips, the second is held and shown in the recap.
- **blocker · rank 27** `LT-tomas-9-J4-1` (effort) — Cue is generic, repeated, and does not answer the question asked
  - expected: A cue he can say to 'Is that dog small too?', such as 'Yes. Biscuit is small.'
  - got: Same line 'Try: Hi, I am Ali. What is his name?' four times; quiz asked about hello.
  - evidence: #3-#6 identical cue; #7 'Mrs Lee says hello. What is a good hello back?' while Mrs Lee had asked #2 'Is that dog small too?' · cue / phrase choice builder, scene-goal-driven fallback
  - acceptance: Cue and phrase choice must relate to the partner's current question and change on each press.
- **blocker · rank 18** `LT-adela-17-J4-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-adela-17-J4-1`, recurrence 8 — Cue only simplifies the question; quiz is about a different prompt
  - expected: A B2 answer frame for the actual question.
  - got: 'Said more simply: Social media adds pressure. Do you think it does more harm?', then a gloss 'piles on: adds more and more'. The quiz asks about 'makes people lonely', not Leo's point.
  - evidence: #3, #4, #6. The B2 frame 'I see your point, but…' only arrived on the third press (#5). · cue prompt
  - acceptance: The first cue offers a B2 frame tied to the current question.
- **blocker · rank 18** `LT-tomas-9-J3-4` (clarity) · recurs `2026-10-17-lt-swap-2/recert-3/LT-tomas-9-J3-4`, recurrence 8 — Adult situations still listed for a nine-year-old
  - expected: Only child-suited situations
  - got: Booking, lost jacket, group project, speaking-practice exams are offered
  - evidence: #1 and #20 situation list. · situation catalogue filter
  - acceptance: The situation list for an elementary profile hides adult and exam items.
- **blocker · rank 18** `LT-tomas-9-J4-2` (completion) · recurs `2026-10-14-lt/recert-6/LT-tomas-9-J4-2`, recurrence 8 — No replay with a fresh question after the moment
  - expected: After the 'small' moment, a new question lets him try the coached word alone.
  - got: Only 'Back to the conversation'; next question is about having a dog.
  - evidence: #9 'Back to the conversation'; #10 'Thank you! Do you have a dog?'; #11 still Czech · moment replay flow
  - acceptance: After a moment, the partner asks a fresh question that uses the coached word.
- **blocker · rank 18** `LT-petra-38-J3-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J3-1`, recurrence 6 — Clear errors got no stop and no held fix; recap shows none
  - expected: 'the heating is not work' and 'because is very cold' noted as a moment or a held fix on the recap
  - got: rawMoments kind none for all three turns; moments and heldFixes empty; recap shows only a hidden line
  - evidence: #2 'the heating is not work'; #3 'I cannot sleep because is very cold... two blanket'; #6 recap lists no fix · moment trigger / as-needed correction rule
  - acceptance: A turn with a clear error gets a stop or a held fix shown on the recap.
- **blocker · rank 18** `LT-viktor-67-J4-1` (trust) · recurs `2026-10-14-lt/recert-3/LT-viktor-67-J4-4`, recurrence 5 — Phrase quiz shows a line Leo never said
  - expected: Quiz options respond to Leo's actual line 'Hi, Grandpa! Want to see my drawing?'
  - got: Quiz: 'Leo says: I had a good day. What is a good next question?' with 'Where is my cup?' as distractor.
  - evidence: #7 vs #6: Leo's visible line is the drawing question; the quiz invents another. · recognition practice prompt
  - acceptance: Quiz prompt quotes the partner's current line and options answer it.
- **blocker · rank 18** `LT-oksana-34-J3-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-3/LT-oksana-34-J3-3`, recurrence 4 — Key B1 errors 'since three years' and 'responsible about' never coached
  - expected: 'I have worked there for three years' and 'responsible for' corrected or held for the recap
  - got: Stops and held fixes went to articles and agreement; neither error appears in the recap
  - evidence: #2 'I work there since three years'; #4 'I am responsible about the delivery'; #16 recap lists neither. Turn 1 got only the dispečink word. · moment selection prompt
  - acceptance: Prefer the error the Character model was told to make (tense/preposition) over repeat article slips; recap includes it.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J4-3`, recurrence 2 — Partner questions drift to simple or personal and add fluff
  - expected: B2 opinion, comparison or speculation questions that stay on the topic.
  - got: 'How do you handle exam stress yourself?' and 'Do you enjoy speaking up in class debates?'. Praise such as 'That's a smart plan'. 'Do you think the pressure is worse, Leo?' is addressed to Leo himself.
  - evidence: #7, #11, #13, #14 · partner prompt
  - acceptance: Each partner turn asks a comparison or speculation question on the debate topic.
- **blocker · rank 18** `LT-petra-38-J4-1` (clarity) · recurs `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J4-2`, recurrence 2 — Cue repeats the same line for every question
  - expected: A cue that changes with each partner question and on repeat
  - got: 'Try: I have a booking number. Can you check, please?' shown at #3, #4, #5, #10 and #12 for different questions
  - evidence: #10 asked to spell name, cue said 'I have a booking number'; #12 asked for the number, same cue. · cue ladder prompt
  - acceptance: The cue relates to the current partner question, and a second press gives a different, fuller help.
- **blocker · rank 18** `LT-tomas-9-J3-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-3/LT-tomas-9-J3-5`, recurrence 2 — Partner questions drift above A1 late in the scene
  - expected: Concrete yes/no or one-word questions with known words
  - got: 'What do you put inside?', 'Where does your dog sleep?', 'What is your favorite place in Minecraft?', 'Can you tell me about your Minecraft world?'
  - evidence: #6, #15, #17, #19: he replies 'Nevím' each time. Pitch about 0.75. · conversation partner prompt
  - acceptance: At least 80% of partner turns are yes/no, either/or or one-word questions using known words. No open 'tell me about' prompts at A1.
- **blocker · rank 18** `LT-jana-29-J3-1` (missing) — Clear slip "on the picture" got no moment and no recap fix
  - expected: A stop or a held fix on "on the picture" that shows on the recap
  - got: rawMoments kind none for all 10 turns; the recap shows no fix; coaching null
  - evidence: #2 "a bit of a deadline on the picture I'm finishing"; #13 recap lists only a hidden line and counts. · moment trigger rules
  - acceptance: A planted C1 slip gets a stop or a held fix shown on the recap.
- **blocker · rank 18** `LT-ondrej-16-J3-2` (effort) — Stops are heavy and repeated for small -s slips
  - expected: 1-3 stops per ten turns, short, scene resumes quickly
  - got: 3 stops in 7 turns, each needing 2-3 re-types before 'Back to the conversation'; two were the same 3rd-person -s
  - evidence: #10-#12 and #16-#19, 'Ugh, again this fix.' · moment cap / selection rules
  - acceptance: Stop density within 1-3 per ten turns; not the same rule stopped twice.
- **blocker · rank 18** `LT-viktor-67-J4-2` (missing) — No coaching or moment after a supported scene
  - expected: A coaching note quoting his words and a replay with a fresh question.
  - got: moments [], coaching null; scene ended with no replay.
  - evidence: Facts: 'moments':[], 'coaching':null; #13 recap shows no fix. · moment selection
  - acceptance: After help is used, a quoted note and a replay offer appear.
- **major · rank 12** `LT-tomas-9-J4-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-3/LT-tomas-9-J4-2`, recurrence 8 — Partner turns drift above A1
  - expected: One tiny sentence and one simple question with known words.
  - got: Two-sentence turns with 'large', 'same size as', 'strong'.
  - evidence: #12 'Rex is a nice name! Is Rex a large dog?'; #15 'Is he the same size as Biscuit?'; #16 'fast and strong' · partner prompt, elementary band
  - acceptance: Partner turns for age-9 A1 use one sentence, words from the learner's known set.
- **major · rank 12** `LT-adela-17-J3-2` (senior-quality) — Praise answers to 'Is that a good reason?' stay generic
  - expected: A verdict plus any remaining slip.
  - got: "Your reasons are clear, especially..." and "connect the job to your studies clearly" with no mention of 'studies of international relations'.
  - evidence: #7, #8 · partner prompt
  - acceptance: Partner answers a direct 'is it correct' with a verdict on language, not content praise.
- **major · rank 12** `LT-adela-17-J4-3` (trust) — Supported/independent counts do not match what she did
  - expected: Only replies that used help are marked supported.
  - got: The recap says '3 with help', but help was used only before the first reply. Evidence rows disagree with the conversation flags.
  - evidence: #15 '2 on your own · 3 with help'; supported:true on replies at #12 and #13 with no help used · supported flag in session evidence
  - acceptance: The supported flag is set only when a cue, phrase or coaching was used for that reply, and the recap count equals it.
- **major · rank 12** `LT-jana-29-J3-2` (senior-quality) — Scene drifts into a scheduling loop after the decline is done
  - expected: Banter and pressure that escalate the nuance, such as a pushy colleague or a joke to read
  - got: Partner shuffles days and lunch spots for eight turns; the 'reason' goal prompt stays stale
  - evidence: #5-#11 client call, Wednesday, Tuesday, midday; the goal chip still says "Give a brief, believable reason" at #10. · partner turn prompt, goal progression
  - acceptance: The partner adds new social pressure each turn, and the goal chip advances with the scene.
- **major · rank 12** `LT-martin-45-J3-3` (effort) — Stops dense and repetitive for a fast learner
  - expected: 1-3 stops per ten turns.
  - got: Three stops in seven turns, each needing a retry loop.
  - evidence: #14-#17 four steps for 'I wait'; stops at #3, #9, #14. · stop cap rule
  - acceptance: Cap stops; hold more fixes for the recap.
- **major · rank 12** `LT-oksana-34-J3-2` (senior-quality) — Interviewer asks warehouse and repeated questions that do not fit a coordinator
  - expected: Coordinator-appropriate interview questions, no repeats
  - got: Asked about warehouse work after she said she is in the office; 'Which companies send you goods' asked twice
  - evidence: #6 'the warehouse work you do each day'; #9 and #15 'Which firms send you goods, and how do you manage their orders each week?' · partner prompt
  - acceptance: Partner tracks questions already asked and the role stated by the learner.
- **major · rank 12** `LT-ondrej-16-J3-1` (senior-quality) — First moment's explanation is wrong
  - expected: 'usual time' gets 'at the' with an accurate reason (fixed phrase / article), or the stop goes to the missing apostrophe
  - got: 'Clock times take a different preposition, and this noun phrase needs the.' but 'usual time' is not a clock time
  - evidence: #4-#5 'Clock times take a different preposition' for 'i cant play in usual time' · moment why generation / moment prompt
  - acceptance: The why text matches the actual error; a teacher agrees with each stop's explanation.
- **major · rank 12** `LT-petra-38-J4-3` (senior-quality) — Coaching note suggests an unusable line
  - expected: A phrase she can use at the desk, fitting a guest without a number
  - got: 'The booking number is in my email.' while the learner had said she had no number; coach quotes an earlier turn and not the most recent error.
  - evidence: #13 note vs #11 thought 'I don't have a number'. · coach prompt
  - acceptance: The coaching quotes the latest learner reply and gives a line that answers the clerk's last question.
- **major · rank 12** `LT-tomas-9-J3-2` (senior-quality) — 'Jmenuje se' glossed as 'name'
  - expected: 'is called' or 'What's your name?' modelled
  - got: 'name': 'The word for what someone is called, like Sam.'
  - evidence: #10 moment; not a correct translation of Jmenuje se. · moment prompt
  - acceptance: A moment gives an English phrase equivalent in use to the Czech, in words a nine-year-old knows.
- **major · rank 9** `LT-tomas-9-J4-5` (clarity) · recurs `2026-10-17-lt-swap-2/recert-3/LT-tomas-9-J4-5`, recurrence 8 — Situation list long and mixed for a nine-year-old
  - expected: Short list of play and animal topics.
  - got: 20 entries incl. booking, lost jacket, group project, speaking practice.
  - evidence: #1 and #17 situation list · situation list builder
  - acceptance: Elementary profile shows only age-fit play and animal situations.
- **major · rank 9** `LT-tomas-9-J3-3` (missing) · recurs `2026-10-17-lt-swap-2/recert-3/LT-tomas-9-J3-2`, recurrence 7 — Repeated 'Nevím' and Czech get no new stop
  - expected: Say 'I don't know' once as a moment, then model more Czech-to-English words
  - got: Only 2 stops. 'Nevím' at turns 11, 12, 14 and 15 got no hold and no recap line.
  - evidence: rawMoments show shown:false for 'Nevím'. Only 4 held fixes are listed. · moment trigger rules
  - acceptance: Each distinct Czech word gets a stop or a held fix on the recap.
- **major · rank 9** `LT-oksana-34-J3-3` (missing) · recurs `2026-10-17-lt-swap-2/recert-3/LT-oksana-34-J3-4`, recurrence 4 — Recap has no interview phrases to keep; mission line generic
  - expected: Interview phrases for Friday
  - got: Grammar fixes plus 'Choose a fresh context for your next conversation'
  - evidence: #16 recap; 'The line hidden in this room' is a generic sentence · recap builder
  - acceptance: Recap lists two or three reusable interview phrases from the scene.
- **major · rank 9** `LT-oksana-34-J3-4` (clarity) · recurs `2026-10-17-lt-swap-2/recert-3/LT-oksana-34-J3-5`, recurrence 4 — 'Mission done' banner appears from #10 while interviewer keeps asking
  - expected: Mission done at a natural end
  - got: Banner persists over five more partner questions
  - evidence: #10 'Mission done. See what you did tonight.' beside 'What happens when two orders need the same truck?' · mission completion rule
  - acceptance: Banner only when the scene is at a natural close.
- **major · rank 9** `LT-ondrej-16-J3-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-3/LT-ondrej-16-J3-3`, recurrence 4 — Recap mission line generic
  - expected: Recap names what was practised (negotiating a time and game)
  - got: 'Choose a fresh context for your next conversation.'
  - evidence: #21 Your mission: Choose a fresh context for your next conversation. · recap builder
  - acceptance: Recap line names the skill evidenced (negotiate).
- **major · rank 9** `LT-tomas-9-J3-5` (missing) · recurs `2026-10-17-lt-swap-2/recert-3/LT-tomas-9-J3-3`, recurrence 4 — Recap mission line is generic
  - expected: A short recap naming what he said: Minecraft, creeper, dog
  - got: 'Choose a fresh context for your next conversation.'
  - evidence: #20 recap. The word fixes are useful, but the opening line is generic. · recap builder
  - acceptance: The recap opens with one line naming what he talked about.
- **major · rank 8** `LT-jana-29-J3-3` (trust) — Recap counts two replies as 'with help' though no help was used
  - expected: Help counts match what the learner pressed
  - got: "8 on your own · 2 with help"
  - evidence: Steps #2-#11 show only answers; the evidence flags supported:true at #7 and #9. · supported flag in evidence
  - acceptance: 'With help' only counts replies where Help or a phrase was used.
- **minor · rank 6** `LT-petra-38-J4-6` (missing) · recurs `2026-10-17-lt-swap-2/recert-1/LT-petra-38-J4-6`, recurrence 5 — Moment screen offers no fresh-question replay
  - expected: After the moment, a fresh question to retry
  - got: Only the same sentence retried at #7; then 'Back to the conversation'.
  - evidence: #8 '[button: Back to the conversation]' · linga-moment screen
  - acceptance: Offer a fresh question after a moment fix.
- **minor · rank 6** `LT-viktor-67-J4-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J4-4`, recurrence 5 — 'Is good' / 'I like dog' left uncorrected
  - expected: A teacher would model 'It is good' / 'I like the dog'.
  - got: rawMoments kind none for turn 2.
  - evidence: #9 'Yes Leo, I like dog. Is good.' no moment. · moment selection
  - acceptance: Repeated article/subject omissions get a note or held fix on the recap.
- **minor · rank 6** `LT-adela-17-J4-5` (clarity) — Rule given is thin for an exam learner
  - expected: The rule named: 'be used to' + -ing, with 'to' as a preposition.
  - got: 'After this structure, use the -ing form of the verb.'
  - evidence: #9 · moment prompt
  - acceptance: The note names the structure ('be used to' + -ing) and why.
- **minor · rank 6** `LT-ondrej-16-J3-5` (senior-quality) — Partner repeats the same yes/no check pattern
  - expected: Partner adds content, pushes the scene (e.g. disagreement, a counter-offer)
  - got: Partner echoes 'X works for me' and asks 'Will Mia...?' each turn; flat for a provocative teen
  - evidence: #8-#15 'Nice, Minecraft at nine works for me!' · partner prompt
  - acceptance: Partner introduces a new obstacle at least once per conversation.
- **minor · rank 6** `LT-petra-38-J3-2` (effort) — Conversation ended after three replies
  - expected: About eight turns of practice
  - got: Mission done after the third reply, partner offered room twelve at once
  - evidence: #5 'Mission done. See what you did tonight.' after three learner replies · mission completion rule
  - acceptance: The scene lasts long enough to practise several exchanges, e.g. a time and a follow-up.
- **minor · rank 6** `LT-petra-38-J4-2` (completion) — Coach ends without a retry of the fresh question
  - expected: Replay with a new question and a better answer
  - got: Replay was offered at #13 but the journey finished at #14 with no replay.
  - evidence: #13 '[button: Replay the moment]'; #14 recap after 'Finish for today'. · linga-coach screen
  - acceptance: Replay is prominent and the journey does not count done until a fresh question is answered.
- **minor · rank 6** `LT-tomas-9-J4-6` (senior-quality) — Held fixes are redundant and only one was a stop
  - expected: Distinct, useful fixes.
  - got: 'Ano' and 'Ano.' held twice with near-identical notes.
  - evidence: #17 'Ano: yes' and 'Ano.: Yes.' · held fix selection
  - acceptance: Dedupe held fixes by the same word across turns.
- **minor · rank 6** `LT-viktor-67-J4-4` (effort) — Same cue pressed four times, nothing changes
  - expected: Repeat press escalates (translation, fuller phrase).
  - got: 'Try: How was school today?' identical at #3, #4, #5.
  - evidence: #3-#5 identical screens; he then used the quiz. · cue/support cache
  - acceptance: A second press gives a different level of help.

## What passed

- `LT-adela-17-J3-4` Interview partner pitched at B2 and on her plan — Opinion and experience questions, not babyish.
- `LT-adela-17-J4-4` Moment quotes her exactly and the fix is correct, once — 'You said teenagers are used to communicate online' → 'communicating'. She retried and carried on. The partner did not repeat the correction.
- `LT-jana-29-J3-4` Partner register sounds like a real colleague — Natural pub-invitation and banter lines
- `LT-martin-45-J3-4` Short accurate reasons and a useful held-fix recap — 
- `LT-martin-45-J3-5` Scene fits his job — 
- `LT-oksana-34-J3-5` Mixed-language word handled gracefully as a vocabulary gain — 'You wanted to say dispečink' → 'dispatch', no placement drop
- `LT-oksana-34-J3-6` Held fixes kept the scene moving and appear in the recap — 3 stops, 5 held fixes shown under 'Saved for the end'
- `LT-ondrej-16-J3-4` Held fixes shown in recap, stops on real errors — Biggest error 'more better' held and shown in 'Saved for the end'; scene not interrupted
- `LT-petra-38-J3-3` Patient, short, work-shaped partner turns — Short polite questions with a clear 'Now:' goal each turn
- `LT-tomas-9-J3-6` Sam stays on his favourite topic with tiny questions — 'Does your dog like football?', 'Goal!', 'Creeper cat, funny!'
- `LT-viktor-67-J4-5` Cue matches the current question and stays in the scene — 'Try: How was school today?' fits the mission; later cue (#11) fits 'Can you ask me about school?'.
- `LT-viktor-67-J4-6` Progress picture stays honest — Supported replies flagged; recap '1 on your own · 2 with help'.
- `LT-adela-17-J3-3` Stop is correct, short and she repaired it herself — Stop on 'used to work' with a correct rule; self-repair accepted.
- `LT-jana-29-J3-5` Scene ran 10 replies before closing, with the plan topic first — The recommended topic matched her wants; mission closed after 10 replies
- `LT-petra-38-J4-4` Moment is precise and the Show me retry works — 'I have booking' became 'a booking number', and the retry was marked 'You fixed have a booking'.
- `LT-petra-38-J4-5` Supported replies not counted as independent — '0 on your own · 2 with help'
- `LT-tomas-9-J3-7` Fixes held for the recap, not stopping play — Four held fixes shown at the end, only two stops
- `LT-tomas-9-J4-4` Moment quotes him exactly and in kid words — 'You wanted to say malý' → 'small'.
- `LT-tomas-9-J4-7` Supported replies counted honestly — '2 on your own · 3 with help'.

## Voices

**Adéla · J3** (time saved: 30 min · low)

> Good: this was a real B2 interview, not chat. Ms Carter asked proper questions and the 'used to working' correction was exact, with the rule. But I asked "Was my answer correct?" and she only picked one error. 'Interested about' is exactly my notebook slip, and it passed without a word. 'Eventually' went too, and 'actual'. So I can't fully trust "Your reasons are clear". I'd use it again for the speaking practice, and it saves me the travel. I would still check my own sentences afterwards, which cuts the benefit. Tell a friend? Yes, but only for the question practice, not as a full corrector.

**Adéla · J4** (time saved: 30 min · low)

> Ahoj. The topic was right for me, and the one correction was exactly what I needed. I did say 'used to communicate', and the tip showed 'communicating'. Seeing my own words quoted back was good. But the help was weak. The first cue just made Leo's question simpler, like for a beginner, and I had to press three times before I got 'I see your point, but…'. Then the quiz was about a different question. Later Leo asked 'Do you enjoy speaking up in class debates?', which is not B2 First level, and he praised me with 'smart plan'. The summary says three answers had help, but I used it once. I would use it again for the corrections, but I'd still check the rules myself. I would not yet tell my class.

**Jana · J3** (time saved: 10 min · low)

> Priya sounds like an actual colleague, which is more than I expected after Speak. The pub invitation was spot on and I could have kept going. But I came to learn something, and I learned nothing. I said "on the picture" in my very first reply and it never mentioned it, not on screen and not in the recap. Meanwhile the scene went round in circles about Wednesday versus Thursday and soup. The recap gave me one nice phrase ("take a rain check") and a count that says I had help twice, which I didn't. For 15 minutes it's pleasant banter, but a Preply native would have caught my slip and taught me an Irish idiom. I'd try the disagreeing-with-a-senior scene, but I wouldn't tell anyone yet.

**Martin · J3** (time saved: 20 min · low)

> Look, the supplier scene was right on target: certificates, truck times, my real Monday. Ravi spoke at a sensible pace and I never felt slowed down. The reasons were short and I could not argue with "by means no later than that day". Recap with saved fixes (more better, he don't) was useful. But the worst one, "we was", I said twice and nobody touched it, and it even marked my retry "fixed" with it still there. I'd say that is my main problem. Also B1 appears with just "self-chosen" and no reason, so why should I believe it? Three stops in seven turns plus retries felt a bit schoolish. I'd use it again for meeting practice, but I need evidence about my level before I tell the director's team.

**Oksana · J3** (time saved: 40 min · medium)

> Honestly, it felt like a real interviewer for a few minutes. The questions about late trucks and two orders on one truck were exactly Friday's material, and it never treated me as Czech. I liked that dispečink became "dispatch" instead of counting against me. But the partner asked about warehouse work after I said I sit in the office, and it asked about the same companies twice. That is not what a real interviewer would do. The corrections were right but small: articles again. Nobody told me "since three years" or "responsible about", which I know I say. The recap gave me no phrases to take into the room. The "Mission done" banner sat there while questions kept coming. I would use it again for the evening rehearsals, but I would want more logistics wording and the big mistakes caught. Worth the twenty minutes.

**Ondřej · J3** (time saved: -2 min · low)

> Ok, it was fine, I guess. Sam sounds like an actual teammate, not a textbook, and Minecraft at nine got sorted. I didn't hate the recap: the "more better" thing was in there and it didn't stop me mid-chat. But the stops were annoying. Same "she answer" -s thing twice, and I had to type my sentence again and again before I could go back. One explanation was just wrong, "clock times"? It's not a clock time, bro. Sam also just kept saying "works for me" and asking if Mia is cool. Not exactly hard. Would I use it again? Only if parents force me. Would I tell a friend? Maybe if the stops get shorter. I didn't try to break it this time, so I can't say how it handles that.

**Petra · J3** (time saved: 70 min · low)

> Nice, the cold room felt like my work, and Mr Okafor spoke slowly, so I was not afraid. I could answer in my own words. But it ended very fast, only three answers, and then "mission done". I said "the heating is not work" and "because is very cold", and nobody told me. The recap gave me one nice sentence, "Can you check the heater, please?", I can use it tomorrow. But I want to know my mistakes, not only be told well done. Safe for Tomáš and Klára, no worry there. I would use it again for fifteen minutes in the evening, cheaper than the course. I would tell a colleague, but say it needs more corrections.

**Petra · J4** (time saved: 60 min · low)

> Sorry, I liked that it was patient. I pressed help again and again and nobody made me feel stupid. The booking scene is real work for me, and the fix 'a booking number' is something I can say at the desk. But the help was always the same sentence, even when the clerk asked me to spell my name or give the number. I did not know what to say, and it did not help me. At the end it says my name was good and tells me to say the number is in my email, but I did not have the number. I did not try the replay with a new question, so I do not know if I am better. For the children the topics seem safe. I would try again, but the help must listen to the question.

**Tomáš · J3** (time saved: 40 min · low)

> Jo, Minecraft! Sam was fun at the start. He asked about my house, my dog, football, and I could say "Brown house!" and "Goal!" and felt clever. The creeper jokes were the best. Then the questions got hard. "What do you put inside?" I didn't know, so I said "Nevím". At the end it was "tell me about your Minecraft world" and I was tired. The big-word stops were short, good. But "Jmenuje se = name"? Mum said that's not right. The recap showed my words, which was nice, but the top line was still boring. It's better than the club, where I talk two minutes. I'd use it again if Sam kept asking easy dog and football questions. Fewer long questions, please.

**Tomáš · J4** (time saved: 10 min · low)

> Jo, the dog talk was fun, I like Biscuit and Rex. But when I pressed help, it kept saying "Hi, I am Ali. What is his name?" Čtyřikrát! That was not about the small dog, so I just wrote my own thing, half Czech. The "malý is small" bit was nice and easy, and nobody made me feel bad. But then Mrs Lee asked something new, so I never tried "small" again straight away. Some words, like "large" and "same size", I didn't know. At the end I said "Biscuit is small. Rex is big" alone and felt clever. I'd use it again for dogs, but the help must help with the question. Mum would like that it says what I did alone and what with help.

**Viktor · J3** (time saved: 0 min · low)

> I never got to speak with anyone. The program did not start, so I have nothing to say about the grandchildren, the slow English or the corrections. Nic jsem nezkusil. I cannot say whether I would trust it or save time against my library course. I would need to try again when it works on the TV.

**Viktor · J4** (time saved: 40 min · low)

> Dobrý den. I like that the help is there and it speaks slowly: Leo says short things, and the button gave me "How was school today?" and I could say it to my grandson. I did not have to leave the room, which I like. But the quiz showed words Leo did not say, and I was confused. Nobody told me what I said wrong — "I like dog, is good" — and I wanted to try again with a new question, but the scene just ended. I would use it on Saturday for ten minutes, because it is about my Leo and not the course book. I would tell a friend, but I would say: needs a teacher's little note at the end.
