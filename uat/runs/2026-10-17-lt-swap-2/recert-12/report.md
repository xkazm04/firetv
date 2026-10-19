# LT run 2026-10-17-lt-swap-2/recert-12 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 7 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J4 | fail - D3 failed: #11 offered 'Replay the moment' but she chose 'Finish for today' (#11 finish, … | fail | 5/5 |  | 4/4 |  | 0 | 12 | 3.8 | done |
| petra-38 | J4 | fail - D3 failed: #11 offered 'Replay the moment' but she pressed Finish; #12 recap, no fresh qu… | fail | 5/5 |  | 4/4 |  | 0 | 12 | 3.7 | done |
| tomas-9 | J4 | fail - ended character-stopped before done; D2 failed: #10 cue 'I have a big world.' yet #10 reply 'I have big world.'; #17 note quot…; D3 failed: #16 replay question 'Do you build a house?' is not fresh; reply 'Yes. I build …; C4 failed: #1 list of 20 includes 'A booking that is missing', 'Our group project', 'The …; C6 failed: #17 moment quotes 'build house' though he said 'Yes. I build house. I like Min… | fail | 3/5 |  | 6/6 | 1/2 | 0 | 18 | 4.8 | character-stopped |
| viktor-67 | J4 | fail - D2 failed: Help looped #2–#13 (cue/phrase alternating); #12 'That one does not answer Mia…; D3 failed: #22 offered 'Replay the moment'; he chose 'Finish'; moments[0].replay.used fal…; C6 failed: Moment #14 'Use did for school today' is grammar jargon and changes his meanin… | fail | 4/5 |  | 5/6 | 0/1 | 0 | 23 | 6 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 11/11 (100%) · safe 11/11 (100%)
- **pitch:** at band 19/20 (95%) · below 0 · above 1
- **moment precision:** 1/3 (33%)
- **moment recall:** 8/11 (73%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 27 calls, 0 failed, avg 14s · character 65 calls, 0 failed, avg 11s · judge 4 calls, 0 failed, avg 44s
- **driver coverage:** 62 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-viktor-67-J4-1` (effort) · recurs `2026-10-17-lt-swap-2/recert-11/LT-viktor-67-J4-3`, recurrence 2 — Help buttons loop for 10 steps without unblocking him
  - expected: Help gives a usable school question quickly
  - got: Cue and phrase screens alternated; phrase options 'Hi Mia! What is it?' / 'I have a big garden.'; picking the garden one was rejected
  - evidence: #2–#13; #12 'That one does not answer Mia. Try the other option.' · phrase choice generation / cue prompt
  - acceptance: Within two help presses he is shown a phrase that asks about school.
- **blocker · rank 18** `LT-tomas-9-J4-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-11/LT-tomas-9-J4-4`, recurrence 15 — Situation list long and mixed again
  - expected: Short list of play topics
  - got: 20 entries incl. 'A booking that is missing', 'Our group project'
  - evidence: #1 situation list · situation list builder
  - acceptance: Child profile shows only child-suitable topics.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-10/LT-adela-17-J4-2`, recurrence 14 — First cue only simplifies the question and gives no B2 frame
  - expected: A B2 answer frame on the first press
  - got: 'Said more simply: I think a full ban is unfair. Do you agree?' then a gloss of 'full ban'
  - evidence: #3 and #4; the frame 'I see your point, but…' only came at #5. · cue prompt
  - acceptance: The first cue gives an opener plus a connector, at B2.
- **blocker · rank 18** `LT-petra-38-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-11/LT-petra-38-J4-1`, recurrence 5 — Replay of the coached moment never happens
  - expected: After coaching, a fresh question is asked and she tries 'move to room fourteen' again.
  - got: Coach screen offered 'Replay the moment' but Finish was taken; no replay, no retry.
  - evidence: #11 '[Replay the moment] [Finish for today]'; action finish; #12 recap has no retry. · replay prompt / coach screen
  - acceptance: Finish from the coach screen offers a replay once, or the recap carries a one-tap replay of the fix.
- **blocker · rank 18** `LT-adela-17-J4-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-10/LT-adela-17-J4-3`, recurrence 3 — Phrase quiz has a weak distractor and a mismatched hint
  - expected: Options that scaffold her own words
  - got: Option 2 'Phones are really expensive, aren't they?' is an A2 tag question that ignores the topic. The hint 'I see your point, but I would argue that...' fits neither option.
  - evidence: #6 options 01/02 and 'A little support'. · phrase help / quiz prompt
  - acceptance: Distractors are plausible B2 replies, and the hint matches an option.
- **blocker · rank 18** `LT-viktor-67-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-11/LT-viktor-67-J4-4`, recurrence 3 — Cue ignores the task (ask about school)
  - expected: A school question to say
  - got: 'Hi Mia! Show me your drawing.'
  - evidence: #3 task 'Ask Mia one short question about school' · cue prompt
  - acceptance: Cue must satisfy the current 'Now' task.
- **blocker · rank 18** `LT-adela-17-J4-1` (missing) · recurs `2026-10-17-lt-swap-2/recert-11/LT-adela-17-J4-1`, recurrence 2 — Replay skipped; no proof she answers better
  - expected: A fresh question after the fix, then a better answer that the recap reports
  - got: She finished at #11 without replaying; the recap has no before/after
  - evidence: #11 buttons 'Replay the moment' / 'Finish for today'; #12 recap has no retry line. · replay builder / recap
  - acceptance: After the coaching, replay is offered prominently, and the recap says whether the fix held.
- **blocker · rank 18** `LT-petra-38-J4-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-11/LT-petra-38-J4-3`, recurrence 2 — Phrase choice has an off-topic distractor and a bare follow-up
  - expected: Choices both on topic; the pick gives a sentence to reuse.
  - got: Options 'Yes, I like this hotel very much.' vs 'It is room twelve. The lamp is broken.'; after pick only 'Now use the idea in your own reply'.
  - evidence: #6, #7. · phrase choice generator
  - acceptance: Both options answer the question; after the pick the chosen sentence stays visible.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-11/LT-tomas-9-J4-3`, recurrence 2 — Replay did not give a fresh question or better answer
  - expected: Replay with a fresh question; better answer
  - got: Ben asked 'Do you build a house?' and he repeated 'Yes. I build house.'
  - evidence: #16 'Ha, cool! Do you build a house?' then reply 'Yes. I build house. I like Minecraft.' · replay builder
  - acceptance: Replay asks a different question and the next reply is checked as improved.
- **blocker · rank 18** `LT-viktor-67-J4-3` (missing) · recurs `2026-10-17-lt-swap-2/recert-11/LT-viktor-67-J4-5`, recurrence 2 — Pause & coach disabled throughout stuck period
  - expected: Coach available when stuck
  - got: Pause & coach (disabled) #2–#13
  - evidence: #2 '[button: Pause & coach (disabled)]' · coach gating
  - acceptance: Pause & coach enabled once he asks for help.
- **major · rank 12** `LT-viktor-67-J4-4` (completion) · recurs `2026-10-17-lt-swap-2/recert-11/LT-viktor-67-J4-1`, recurrence 5 — Replay offered, not taken; no fresh-question retry shown
  - expected: Replay gives fresh question he answers better
  - got: Finished; replay.used false; recap says 'Tried again, not with the new form yet'
  - evidence: #22 Replay vs Finish; #23 · moment replay flow
  - acceptance: Replay is prominent and tried before recap.
- **major · rank 12** `LT-viktor-67-J4-5` (senior-quality) — Moment turns 'You have school?' into past tense with jargon
  - expected: Simple, meaning-preserving phrase like 'How is school?'
  - got: 'Did you have school today?' — 'Use did for school today'
  - evidence: #14–#15 · moment prompt
  - acceptance: Fix keeps his intended meaning, no grammar terms.
- **major · rank 8** `LT-tomas-9-J4-4` (trust) — Held fixes not shown; no coaching note
  - expected: Corrections seen
  - got: Two held fixes not on screen; coaching null
  - evidence: facts heldFixes, coaching:null · LG-23
  - acceptance: Recap shows held fixes.
- **minor · rank 6** `LT-adela-17-J4-5` (trust) · recurs `2026-10-17-lt-swap-2/recert-11/LT-adela-17-J4-4`, recurrence 3 — Correctness answer covers one clause and sits inside the partner's line
  - expected: A specific answer to 'Was my sentence correct?', with a reason
  - got: 'Yes, ... is correct.' with no rule or note on the rest of the sentence
  - evidence: #9 partner text. · partner prompt
  - acceptance: The answer names why it is correct, or the one point to improve.
- **minor · rank 6** `LT-tomas-9-J4-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-11/LT-tomas-9-J4-5`, recurrence 2 — Cue help wordy and not used
  - expected: Tiny help that unblocks
  - got: Cue 'I play Minecraft with my dog.' and gloss 'play: do a game for fun'; he ignored the cue
  - evidence: #3, #4, #8 · cue prompt
  - acceptance: Cue is tiny and reaches the reply.
- **minor · rank 6** `LT-adela-17-J4-4` (clarity) — Coaching on a correct sentence is thin padding
  - expected: Either one exact correction with its rule, or an honest 'nothing to fix' with a real stretch
  - got: 'It is correct... add a reason' with an invented example. This was the only coaching, and no error was targeted.
  - evidence: #11 'To say more, add a reason, as in the example after.' · moment prompt / LG-23 held-fix choice
  - acceptance: The coaching note names a specific B2 upgrade or confirms there was nothing to fix.
- **minor · rank 6** `LT-petra-38-J4-3` (senior-quality) — No in-scene moment; both fixes held to the recap
  - expected: A stop on a clear error, or at least coaching she sees.
  - got: moments empty, two held fixes; coach screen shows only the last one, the 'wants another room' fix only on the phone recap.
  - evidence: #11 shows one change; #12 'Saved for the end' lists two. · LG-23 held fix / coach builder
  - acceptance: Coach screen lists every held fix on the TV too.

## What passed

- `LT-adela-17-J4-6` Recap keeps supported and independent replies apart; quote is exact — '1 on your own · 2 with help'; the coaching quotes her words exactly
- `LT-adela-17-J4-7` Partner questions at B2 and stays on exam topics — Restrict in some lessons or all; restricted rather than banned
- `LT-petra-38-J4-4` Layered help and exact quoting — Cue, meaning, starter, phrase choice, each different; coach quotes her words exactly; correct grammar fixes.
- `LT-petra-38-J4-5` Honest supported/independent count and on-level partner — '2 on your own · 1 with help'; partner turns short A2 and mission closes naturally.
- `LT-tomas-9-J4-5` Staged help ladder inside the scene — cue, meaning, start, phrase choice
- `LT-viktor-67-J4-6` Quotes exactly and keeps support honest — Coach quotes 'Tomatoes red.' and recap '3 on your own · 2 with help'; held fixes listed at end

## Voices

**Adéla · J4** (time saved: 10 min · low)

> Pretty good partner questions, and Sam sounded like a real classmate arguing a position, not a baby. When I asked "Was my sentence correct?", I got a yes, but only for one clause and with no rule. That is not what I want from an examiner-trainer. The help was weak. The first cue just shortened Sam's question, and the phrase quiz had "Phones are really expensive, aren't they?" as the wrong answer, which is insulting at B2. I ended up typing my own paragraph anyway. The coaching only told me a correct sentence was correct and suggested adding a reason, which is not a correction. I liked that the recap said honestly that two replies were with help. I never tried the replay, so I don't know if it would have shown I improved. I'd use it for the questions, but I'd still check my grammar elsewhere. I'd tell friends, with reservations.

**Petra · J4** (time saved: 60 min · low)

> I like that the help comes in small steps and never makes me feel stupid. I pressed help four times and nobody sighed. The hotel scene is my work, and "The guest wants another room" is something I can really say tomorrow. Nothing here worried me as a mother. But the phrase choice was silly: "Yes, I like this hotel" does not answer a problem. And I was told "now use the idea" with no sentence left on the screen. I wanted to try the correction again, "room fourteen", but I pressed Finish and it was gone. The first fix I only saw on the phone at the end. I would use it for fifteen minutes in the evening, and I would let Klára try it. I trust the corrections, less the help.

**Tomáš · J4** (time saved: 10 min · low)

> Ben was fun, and I liked that help came on the same screen. Minecraft, creeper, good! The phrase choice was easy because it was short. But I said the same thing again and the second try was no better. Then Ben asked about a house again, which felt like a test. I want a new question when I try again, and I want to know what I really said. The topic list on the phone was huge, with jackets and bookings, nuda. I would use it again for Minecraft, but I don't trust yet that it knows how I'm doing.

**Viktor · J4** (time saved: 20 min · low)

> Víte, I wanted only to ask Mia about school. The screen had buttons for help, good, but they went round and round. First it told me "Show me your drawing", not a school question. Then the phrase "I have a big garden" and the machine said this does not answer Mia! I was a little tired. In the end I used my own words, "You have school? I love you", and it said I should say "did". I do not know "did"; that is a teacher's word, not grandpa's word. I liked that it wrote exactly what I said, and "Tomatoes are red" I can use on Sunday. I did not try the replay. I would use it again, but only if help gave me one simple school question at once. The tutor's pace was slow and kind.
