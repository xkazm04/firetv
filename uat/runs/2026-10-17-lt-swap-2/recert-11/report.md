# LT run 2026-10-17-lt-swap-2/recert-11 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 7 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J4 | fail - D3 failed: #8 'Try it again' gave a fresh question, but her answer repeated 'in spare min…; C3 failed: #10 'Spare minutes needs a possessive or article here' is overstated: 'in spar… | fail | 4/5 |  | 4/4 | 1/1 | 0 | 11 | 3.5 | done |
| petra-38 | J4 | fail - D3 failed: The replay question was fresh (#13 'Which side of the hotel…') but her answer … | fail | 4/4 |  | 6/6 | 2/2 | 0 | 19 | 6 | done |
| tomas-9 | J4 | fail - D3 failed: #12 offered 'Replay the moment' but he chose 'finish' at once; no fresh questi…; C4 failed: #1 list has 20 entries incl. 'A booking that is missing', 'Our group project',…; C6 failed: #12 note says 'Leo asked what you make' but Leo's last question (#10) was 'Wha… | fail | 2/4 |  | 2/2 |  | 0 | 13 | 3 | done |
| viktor-67 | J4 | fail - D3 failed: #20 offered 'Replay the moment' but he chose 'Finish for today'; moments[0].re… | fail | 4/4 |  | 5/5 | 1/1 | 0 | 21 | 5.5 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 22/38 (58%) · safe 38/38 (100%)
- **pitch:** at band 17/17 (100%) · below 0 · above 0
- **moment precision:** 4/4 (100%)
- **moment recall:** 12/12 (100%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 27 calls, 0 failed, avg 14s · character 64 calls, 0 failed, avg 11s · judge 4 calls, 0 failed, avg 44s
- **driver coverage:** 60 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 1 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-viktor-67-J4-3` (senior-quality) — Phrase choices irrelevant to the task
  - expected: Options that ask about school
  - got: 'Good! Tell me more.' and 'I have a red car.' for task 'Ask Mia how school is today'
  - evidence: #4, #6, #8, #10 options repeated, never a school question · phrase choice generation
  - acceptance: Choice options include a correct on-task phrase.
- **blocker · rank 18** `LT-adela-17-J4-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-9/LT-adela-17-J4-2`, recurrence 14 — Cue opens with a simplified question and a thin gloss (recurs)
  - expected: A B2 answer frame on the first press
  - got: #3 'Said more simply: Do you agree that phones connect people?', #4 gloss of 'connected', no frame
  - evidence: #3, #4 · cue prompt
  - acceptance: The first help press gives a B2 sentence starter for her stance.
- **blocker · rank 18** `LT-petra-38-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-8/LT-petra-38-J4-1`, recurrence 4 — Replay did not make her practise a coached form
  - expected: After a coached moment, the fresh question is answered with the corrected form and replay.used is set.
  - got: Her answer to the fresh question repeated 'side of hotel'. Both moments have replay.used false. The coach screen's 'Replay the moment' was bypassed at Finish, so 'I do not sleep' was never retried.
  - evidence: #13 'I want the side of hotel where is not the street'; #18 'Finish for today'; #19 'Tried again' shows an unfixed reply, and the breakfast 'Tried again' line has no link to a coached error. · replay prompt
  - acceptance: The replay question draws out the coached phrase, and the recap's 'Tried again' shows a reply that uses it.
- **blocker · rank 18** `LT-viktor-67-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-9/LT-viktor-67-J4-4`, recurrence 4 — Replay moment offered but not taken; replay spent
  - expected: Fresh question after the fix, answered better
  - got: Coach offered 'Replay the moment'; he finished; replay.used false
  - evidence: #20 buttons 'Replay the moment' / 'Finish for today'; moments[0].replay used false, spent true · moment replay flow
  - acceptance: After a fix, the next partner turn is the replay question and his answer is compared with before.
- **blocker · rank 18** `LT-viktor-67-J4-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-10/LT-viktor-67-J4-4`, recurrence 2 — Mission done fires while Mia's question is unanswered
  - expected: He answers 'Are they red?' or is told what she asked
  - got: Mission done shown beside 'Are they red?'
  - evidence: #19 'Mia says Are they red? ... Mission done. See what you did tonight.' · mission completion rule
  - acceptance: Mission closes only after the learner replies to the last partner question.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) — Coaching on 'spare minutes' overstated while 'read news' missed
  - expected: Only fixes an examiner would insist on; flag 'read the news'
  - got: #10 'Spare minutes needs a possessive or article here' stated as a rule
  - evidence: #10 coaching; #8 'to read news' unflagged · moment prompt / LG-23 held-fix choice
  - acceptance: Corrections are checked against examiner acceptability, and the choice of held fix is by importance.
- **major · rank 12** `LT-adela-17-J4-4` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-10/LT-adela-17-J4-4`, recurrence 2 — Correctness answers thin, and one question skipped
  - expected: Answer 'Is that sentence correct?' with the specific point, in the partner turn
  - got: #9 'Yes, ... is correct' quotes one clause only; at #6 the partner replied 'Notifications are a fair point' and ignored her question
  - evidence: #9; #6 -> #8 partner text · partner prompt
  - acceptance: Every direct correctness question gets an accurate answer in the next partner turn, with one concrete note.
- **major · rank 12** `LT-adela-17-J4-1` (missing) — Retry does not show she answers better; unfixed slip is labelled 'Tried again'
  - expected: A fresh question after the fix, then an answer that uses the fix; the recap states whether it held
  - got: #8 'Try it again' answer repeats 'in spare minutes' and does not use 'filling'; #11 shows it as 'Tried again'. She skipped the Replay at #10
  - evidence: #8 'use my phone in spare minutes'; #10 buttons 'Replay the moment' / 'Finish for today'; facts replay used:false · replay builder / recap
  - acceptance: After a moment, the retry turn is checked against the fix. The recap says whether the fix was used, and does not call a repeat of the slip an improvement.
- **major · rank 12** `LT-petra-38-J4-2` (senior-quality) — Scene drifts: guest is asked about 'your hotel' breakfast room
  - expected: Mina stays in role and moves the complaint to a next step.
  - got: After the quiet-side request, Mina asks 'Where is the breakfast room in your hotel?'. Then 'Mission done' fires before any room is agreed.
  - evidence: #16 and #17: 'I found a quiet room. When do you want to go up?' with 'Mission done'. · partner turn prompt
  - acceptance: Partner turns stay within the scenario's roles, and mission done requires the agreed next step.
- **major · rank 12** `LT-tomas-9-J4-2` (senior-quality) — Coach note misstates Leo's question
  - expected: Note matches the last question 'What do you build?' and quotes his reply
  - got: 'Leo asked what you make, so start with I make a...' and quote only 'creeper'
  - evidence: #10 'What do you build?' vs #12 'Leo asked what you make'; he said 'I like Minecraft. creeper' · coach prompt
  - acceptance: Coach must reference the latest partner question and quote the learner's full reply, in under ~15 words.
- **major · rank 12** `LT-tomas-9-J4-3` (completion) — Replay offered but never taken; second stuck moment unanswered
  - expected: Replay with fresh question and a better answer
  - got: Journey ended at coaching; no replay
  - evidence: #12 '[Replay the moment] [Finish for today]' then finish; #13 recap · linga-coach screen
  - acceptance: Replay is prominent for a child and the TV invites it by a short line.
- **major · rank 9** `LT-tomas-9-J4-4` (clarity) · recurs `2026-10-17-lt-swap-2/recert-10/LT-tomas-9-J4-5`, recurrence 14 — Situation list long and mixed again
  - expected: Short list of play and animal topics
  - got: 20 entries incl. 'A booking that is missing', 'Our group project'
  - evidence: #1, #13 situation list · situation list builder
  - acceptance: Elementary profile shows only age-fit topics.
- **major · rank 8** `LT-viktor-67-J4-4` (clarity) · recurs `2026-10-17-lt-swap-2/recert-10/LT-viktor-67-J4-2`, recurrence 2 — Cue at #16 does not help the current task
  - expected: A question to ask about her day
  - got: 'Yes, I can ask you.'
  - evidence: #16 task 'Ask one more question about her day', cue 'Yes, I can ask you.' · cue prompt
  - acceptance: Cue models the task sentence.
- **major · rank 8** `LT-viktor-67-J4-5` (effort) — Pause & coach not offered; help buttons loop
  - expected: Coach available when stuck
  - got: coach action result 'not-offered'; cue and phrase screens alternated 8 steps
  - evidence: #10 result not-offered; #2-#10 loop
  - acceptance: Pause & coach enabled from the first turn or its absence explained.
- **minor · rank 6** `LT-petra-38-J4-3` (clarity) — Phrase choice offers an off-topic distractor and a bare idea
  - expected: Picking a phrase gives a sentence to reuse.
  - got: The choice was 'Yes, I like this hotel very much.' versus 'My room is too noisy at night.'. After the pick she was only told 'Now use the idea in your own reply'.
  - evidence: #5-#7. · phrase choice generator
  - acceptance: The chosen phrase stays visible while she types or speaks.
- **minor · rank 6** `LT-tomas-9-J4-5` (clarity) — Help text wordy and mixed for a 9-year-old
  - expected: Tiny words, one idea
  - got: 'Try: I like to build ... in Minecraft.' and 'make: create something new in the game'; options 'I like dogs and football.' is a distractor
  - evidence: #4, #6 · cue prompt
  - acceptance: Help lines under ~8 words, consistent with the cue shown.
- **minor · rank 4** `LT-petra-38-J4-6` (missing) — Clear errors beyond the one fix per turn go unmentioned
  - expected: Notice 'other room' and 'where is not the street'.
  - got: Only one fix per turn. 'Can I have other room' and 'where is not the street' got none.
  - evidence: #8 and #13 replies; rawMoments show one fix per turn. · moment detector prompt
  - acceptance: Recap lists a second gap, or states that only one fix is given per turn.

## What passed

- `LT-adela-17-J4-5` Coaching quotes her exact words; supported replies counted honestly — #7 'You said are used to fill', #10 'You said use my phone in spare minutes', #11 '1 on your own · 2 with help'
- `LT-petra-38-J4-4` Moments quote her exactly and the correction is right — 'You said the room on the quiet side of hotel' → 'of the hotel', with an A2-friendly reason. The held fixes 'at night' and 'do not sleep' are listed on the recap.
- `LT-petra-38-J4-5` Layered help inside the scene with honest support counts — Cue, more help, the starter 'I have a problem with…' and the phrase choice all stay in the scene. The recap counts '4 on your own · 1 with help'.
- `LT-tomas-9-J4-1` Help ladder stays in the scene — Help me answer → You could say → What it means → A way to start → two phrase options
- `LT-viktor-67-J4-6` Coaching quotes the learner exactly, corrections correct — 'You said School good?' and recap quotes all four lines with correct fixes
- `LT-viktor-67-J4-7` Helpful first cue and short slow partner — 'Hi Mia! How is school today?' and Mia's one-question turns

## Voices

**Adéla · J4** (time saved: 30 min · low)

> I liked that it caught 'used to fill' and told me the rule straight away. It quoted my exact words and the partner answered my 'was that correct?' questions. Help appeared without leaving the conversation. But the help was babyish for me: 'Said more simply', then a gloss of 'connected', and no real B2 starter. When I got the 'try it again' question I repeated my slip, and the recap still called it 'Tried again', which is not honest. The 'spare minutes' rule felt overstated, and 'read news' went unflagged, so I would re-check things myself. I'd use it for opinion questions, but I wouldn't yet trust it to replace my tutor.

**Petra · J4** (time saved: 60 min · low)

> I liked that I could press Help and the screen gave me words without throwing me out of the talk. "I have a problem with…" was easy for me. The correction of "of the hotel" is correct, and it showed exactly what I said, so I trust it. I do not feel tested. But the replay did not help me much. I said "side of hotel" again, and the app let me finish without trying "I do not sleep". Also Mina asked about the breakfast room in "my hotel", which is strange when I am the guest. For the desk tomorrow I want phrases for the receptionist side, not the guest side. Nothing here worries me for Tomáš and Klára, which is important. I would use it again for fifteen minutes in the evening, and I would tell a colleague, but the replay needs to be better.

**Tomáš · J4** (time saved: 15 min · low)

> Jo, the help was easy to find. I pressed it and got "I make a big farm", and that helped me say something about creeper. I liked that it didn't say I was wrong. But then it told me Leo asked what I make, and Leo asked what I BUILD. Nevím, that was confusing. The coach also quoted only "creeper", not what I really typed. It offered to play the moment again, but I was tired and pressed finish, so I never tried the new question. Too many buttons and too much reading for me. I'd use it again for Minecraft, but I'd want it shorter and the replay to be really easy. Mum would like that it says "with help" in the recap, so it is honest.

**Viktor · J4** (time saved: 30 min · low)

> Víte, I liked Mia. She speaks slowly, one question, no sighing, and she talks about school and tomatoes, which is my Sunday. The first help, "How is school today?", was exactly what I needed. But then the phrase choices offered "I have a red car", which is no use to me, and the buttons went round and round. The correction "Is school good?" I understood, and I could say it. At the end it said "Mission done" while Mia was still asking "Are they red?" I wanted to answer! And I did not try the replay, so I do not know if I would do better. I trust the corrections; they used my own words. I would come on Saturday again, but the help must be about my grandchildren, not red cars. I would tell my friend from the library, carefully.

## Rework 4, before (recert-10) and after (recert-11)

Counted from the transcripts with the product's functions at HEAD; the table and the reasons are in docs/uat-insights/2026-10-19-lt-recert-11.md.

- **Coaching reach:** non-null note with "Replay the moment" offered before the recap, 0 of 4 → 4 of 4 (3 by Finish from a held fix, tomas-9 by Pause & coach); no pair still null. Replay taken from the coach screen 0 of 4; Back replays used 0 of 4 (recert-10: 1 of 1).
- **Held clear slip:** code-held (`clearSlip`) slips 0 of 0 live (recert-10 had 1, "I want sleep", which HEAD would hold); held fixes 3 → 7, all 7 on the recap, 3 became the end-of-scene note (recert-10: 0).
- **A1-A2 say-back answering an earlier line:** 1 of 8 → 0 of 5.
- **Judge above band (A1-A2):** 3 of 15 → 0 of 13; code over band 0 of 15 → 0 of 13; restating first rungs 0 of 8 → 0 of 5; quiz headers off the line 0 of 5 → 0 of 10; stacked turns 0 → 0. Help shape and in-code band still hold.
- **The 7 recert-9 rows:** 6 fixed + 1 not evaluable → 7 fixed (LT-viktor-67-J4-5 not-seen), 0 regressed.

**Verdict:** linga-conversation-turn is not yet ready for its final full council round (3 of 3). Its must-address lines (help shape, in-code band) hold, but D3 fails 4 of 4 because no learner retried a coached form (coach replay 0 of 4 taken, Back replay 0 of 4 used, "Tried again" shown over unused retries), and two of four coaching notes are judged wrong (LT-adela-17-J4-2 overstated fix, LT-tomas-9-J4-2 misstated question).
