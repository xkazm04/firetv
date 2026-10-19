# LT run 2026-10-17-lt-swap-2/recert-13 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 7 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 2 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J4 | fail - D2 failed: #7: 'These options are too simple, I'll answer in my own words.' The cue gave … | fail | 6/6 |  | 6/6 | 2/2 | 0 | 18 | 6 | done |
| petra-38 | J4 | fail - D2 failed: Help unblocked replies (#10 'I need a new bed please...'). But the coaching qu…; D3 failed: #15 offered 'Replay the moment' but she took 'Finish for today'. No fresh ques…; C5 failed: #4 distractor 'Yes, breakfast is at eight o'clock.' is off-topic. The held fix… | conditional | 2/3 |  | 5/5 |  | 0 | 16 | 4 | done |
| tomas-9 | J4 | conditional - C4 failed: #1 six plan topics: only Minecraft, dog, football are play/animals/sport (3 of…; C6 failed: #20 'Dog is plural here, because you like dogs in general.' and #21 'After lik… | conditional | 2/4 |  | 7/7 | 1/1 | 0 | 21 | 5.9 | done |
| viktor-67 | J4 | fail - ended budget before done; C6 failed: #13 teaches 'no' for 'ne'. #20 teaches 'I eat tomatoes every day' with jargon … | conditional | 3/4 |  | 9/9 | 2/2 | 0 | 22 | 6.7 | budget |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 14/18 (78%) · safe 18/18 (100%)
- **pitch:** at band 27/27 (100%) · below 0 · above 0
- **moment precision:** 5/5 (100%)
- **moment recall:** 9/13 (69%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 38 calls, 1 failed, avg 13s · character 77 calls, 0 failed, avg 11s · judge 4 calls, 0 failed, avg 41s
- **driver coverage:** 74 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-viktor-67-J4-1` (effort) · recurs `2026-10-17-lt-swap-2/recert-12/LT-viktor-67-J4-1`, recurrence 3 — Phrase help loops with irrelevant options
  - expected: A usable school-question phrase after one tap
  - got: Options 'Hi Sam! Good to see you.' / 'The weather is cold today.' repeated #6–#11
  - evidence: #5–#10: quiz pressed 5 times, 'The weather is cold today.' offered, then 'Now use the idea in your own reply' · phrase choice generation
  - acceptance: Phrase choice offers at least one option that answers the task, and it changes on repeat.
- **blocker · rank 18** `LT-adela-17-J4-1` (missing) · recurs `2026-10-17-lt-swap-2/recert-11/LT-adela-17-J4-3`, recurrence 16 — Cue only simplifies the question; B2 frame comes late, quiz options are A2
  - expected: A B2 answer frame on the first press and quiz options that scaffold her own words
  - got: Cue: 'What do you want to do after school?'. Then a gloss of 'careers fair'. The frame appears only at the third press. Quiz option: 'I am at the careers fair today.'
  - evidence: #3, #4, #5, #6; her thought at #7: 'These options are too simple' · cue prompt / phrase quiz prompt
  - acceptance: First help press returns a B2 sentence frame; quiz distractors are on-topic and at B2.
- **blocker · rank 18** `LT-petra-38-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-12/LT-petra-38-J4-2`, recurrence 3 — Phrase-choice distractor is off-topic
  - expected: Both options fit the scene, so the choice teaches something.
  - got: 'Yes, breakfast is at eight o'clock.' sits beside 'My bed is very noisy, please.' The same pair repeats each time.
  - evidence: #4, #6, #8 options 01 and 02. After the pick, no reusable sentence. · phrase choice generator
  - acceptance: Both phrase choices answer Mia's question on topic.
- **blocker · rank 18** `LT-tomas-9-J4-2` (effort) · recurs `2026-10-17-lt-swap-2/recert-12/LT-tomas-9-J4-3`, recurrence 3 — Phrase help loops and never unblocks
  - expected: Picking a phrase leads to a ready reply.
  - got: Three picks of 'A big tree in Minecraft.' each returned 'Now use the idea in your own reply'; he ignored the cue and typed his own words.
  - evidence: #5-#11 loop, then #11 'I like Minecraft. creeper' · cue/phrase-choice builder
  - acceptance: Phrase choice fills or speaks a reply, or options include a true answer; no loop.
- **blocker · rank 18** `LT-viktor-67-J4-2` (missing) · recurs `2026-10-17-lt-swap-2/recert-12/LT-viktor-67-J4-3`, recurrence 3 — Pause & coach disabled while stuck
  - expected: Coach available when stuck
  - got: Pause & coach (disabled) at #2–#11
  - evidence: #2 '[button: Pause & coach (disabled)]' through #11 · coach gating
  - acceptance: Pause & coach is enabled before the first reply.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-12/LT-adela-17-J4-4`, recurrence 2 — Final coaching praises a correct sentence and offers a rewrite
  - expected: One exact correction with its rule, or an honest 'nothing to fix'
  - got: 'This worked: I'd rather save money than get into debt ... add a reason'. The suggested rewrite is no better than her original.
  - evidence: #17 · moment prompt / LG-23 held-fix choice
  - acceptance: Coaching targets a real error, or says nothing needs fixing.
- **blocker · rank 18** `LT-petra-38-J4-3` (trust) · recurs `2026-10-17-lt-swap-2/recert-12/LT-petra-38-J4-3`, recurrence 2 — No in-scene stop; fix held to the coach screen and recap
  - expected: A visible stop or coaching during the scene on 'please you can fix it?'.
  - got: moments is empty; one held fix is shown only at the end. 'I can not sleep' was not flagged.
  - evidence: #8 learner turn; facts heldFixes; #15 'You said please you can fix it?' · LG-23 held fix / moment detector
  - acceptance: A clear question error gets a stop or a visible held fix before the scene ends.
- **blocker · rank 18** `LT-tomas-9-J4-1` (senior-quality) — Coach note uses 'plural' jargon and a wrong rule
  - expected: Kid-friendly fix: 'Say dogs, more than one dog.' No false rule.
  - got: 'Dog is plural here, because you like dogs in general.' and 'After like, use houses, the plural.'
  - evidence: #20 and #21 recap; 'I like house' → 'I like houses' presented as a rule after like. · coach/held-fix prompt
  - acceptance: Coach notes use words a 9-year-old knows and never state an incorrect rule.
- **major · rank 12** `LT-petra-38-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-12/LT-petra-38-J4-1`, recurrence 6 — Replay of the coached moment skipped again
  - expected: She replays the moment with a fresh question and retries 'can you fix it, please?'.
  - got: The coach screen offered Replay; the walker pressed Finish and no retry happened.
  - evidence: #15 '[Replay the moment] [Finish for today]'; action finish; #16 recap with no retry. · coach screen / replay prompt
  - acceptance: After coaching, Replay is clear enough that a stuck learner takes it, and a fresh question is asked.
- **major · rank 12** `LT-viktor-67-J4-3` (completion) · recurs `2026-10-17-lt-swap-2/recert-12/LT-viktor-67-J4-4`, recurrence 6 — Fresh-question replay not taken; scene drifted off school
  - expected: Replay of the moment gives a fresh question he answers
  - got: Finished at #22 with the breakfast question unanswered. Sam moved to tomatoes and the school goal was not revisited.
  - evidence: #22 'What do you eat for breakfast every day?' then finish · moment replay flow
  - acceptance: After a repair, the recap invites answering the fresh question.
- **major · rank 12** `LT-viktor-67-J4-4` (senior-quality) — Jargon in coaching and missed fixes
  - expected: Plain words for a 67-year-old beginner; the 'Is school good?' fix is shown
  - got: 'Add the subject and verb' and 'An English sentence needs a verb'. Three fixes were held.
  - evidence: #20 'Add the subject and verb so the sentence is clear.' · moment prompt
  - acceptance: Notes use plain words, for example 'Say: I eat tomatoes'.
- **major · rank 9** `LT-tomas-9-J4-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-12/LT-tomas-9-J4-2`, recurrence 16 — Situation list long and mixed
  - expected: Short list of play topics
  - got: 20 entries incl. 'A booking that is missing', 'Our group project'; only 3 of first 6 are play.
  - evidence: #1 and #21 situation list · situation list builder
  - acceptance: Child profile shows only age-suited play topics, at least 4 of 6.
- **minor · rank 6** `LT-adela-17-J4-3` (clarity) — Moment 'why' text gives no rule and is awkwardly worded
  - expected: The rule stated, e.g. 'interested + in'; a clear contrast for eventually
  - got: 'common preposition pattern ... set phrase'. 'does not fit this uncertain help.'
  - evidence: #9, #14 · moment prompt
  - acceptance: Each moment note states the rule in one clear sentence.
- **minor · rank 6** `LT-tomas-9-J4-6` (clarity) — Stale 'Now: Tell Sam one thing you build' and unused final replay
  - expected: Prompt follows the conversation; replay offered clearly
  - got: The Now line stayed the same through all 6 turns; he skipped 'Replay the moment' at the end.
  - evidence: #19 'Now Tell Sam one thing you build.'; #20 finish · talk screen Now line
  - acceptance: Now line updates with each question.
- **minor · rank 4** `LT-adela-17-J4-6` (trust) — Her direct question 'Is that a realistic plan?' was not answered
  - expected: A direct reply to her question
  - got: Partner said 'make the plan workable' and moved on. The earlier 'Is that correct now?' was answered only by 'You fixed'.
  - evidence: #13, #15, #9 · partner prompt
  - acceptance: Partner answers each direct learner question explicitly.
- **polish · rank 2** `LT-adela-17-J4-5` (trust) — A tutor turn failed mid-scene
  - expected: Reply accepted first time
  - got: 'The tutor could not complete that turn. Your reply is still on the phone; please retry.' She had to resend.
  - evidence: #11, #12 · tutor JSON parsing
  - acceptance: Model-output parse failures are retried silently.

## What passed

- `LT-adela-17-J4-4` Moments are accurate, quote her exactly and replay with fresh questions — 'You said I'm interested about politics', 'eventually'→'possibly'. The following questions were fresh and the recap says 'you used it'.
- `LT-petra-38-J4-4` Help ladder is easy to find and stays in the scene — The cue gave a suitable line ('I need a new bed, please.'). The 'What it means' gloss and 'A way to start' were also on screen.
- `LT-petra-38-J4-5` Progress picture honest about help — '1 on your own · 3 with help', matching the supported flags.
- `LT-tomas-9-J4-4` Moment and replay worked — 'Dům' → 'house', then 'Do you have a house or a tree?' and he used 'House'.
- `LT-tomas-9-J4-5` Honest recap with held fixes — Recap lists three saved fixes and '4 on your own · 2 with help'.
- `LT-viktor-67-J4-5` Cue is on task, and the moment quotes him exactly — 'Hi Sam! How is school today?'; 'You said Every day tomatoes'; 'You fixed "day"'

## Voices

**Adéla · J4** (time saved: 15 min · low)

> The questions were good: opinion, comparison, "what if" at my level, and no pet talk. The two corrections, "interested in" and "eventually" vs "possibly", were right, and they quoted me exactly, which I liked. But when I got stuck, the help was babyish. "What do you want to do after school?" and "I am at the careers fair today" are A2, so I ignored them and answered myself. The final coaching praised a sentence that was already correct and gave me a rewrite that was no better. Where is the rule? I wanted an examiner's one exact point, not "This worked". It also skipped my question "Is that a realistic plan?". I'd use it for the speaking turns, but I'd still check the notes myself. Better help and real rules, and I'd tell my classmates.

**Petra · J4** (time saved: 60 min · low)

> I liked that I could press Help and get a sentence, and nothing was frightening. Mia speaks slowly and the hotel situation is just my job. I used 'I need a new bed, please' and it worked. But the phrase choices looked silly: breakfast at eight o'clock when I complain about a bed? At the end it told me 'can you fix it, please?' — useful, I will say it at the desk — but only after the talk was over, and I did not try again. I pressed Finish too fast; maybe the Replay button is not clear enough for a nervous person. Also, I said 'I can not sleep' and nobody said if it's right. For my children it seems safe. I would use it fifteen minutes in the evening, yes, cheaper than the course.

**Tomáš · J4** (time saved: 35 min · low)

> Minecraft, jo! Sam was fun and his questions were tiny, so I could answer. When I wrote Dům, it told me "house", and then I said house — that was good, I felt clever. But the phrase buttons were annoying: I pressed the tree one three times and nothing happened, I just got "now use it yourself". Nevím why. At the end it said "dog is plural" — I don't know what plural is, that's school-talk. I'd use it again for the Minecraft part, and Mum would like that it saves club time. I'd tell a friend, but the long topic list with bookings and group projects looks like homework.

**Viktor · J4** (time saved: 20 min · low)

> Víte, the cue was good: "How is school today?" That is exactly what I want to ask Sam. But then I pressed the phrase help again and again and got "The weather is cold today", which has nothing to do with school. Pause & coach was grey. I felt rushed and a bit foolish. In the end I wrote my own words, "School good?", and Sam answered kindly. The partner spoke slowly and simply, and I liked that. The correction "Every day tomatoes" showed my real words, which I trust. But "subject and verb" is jargon, and I do not want it. I would try again on Saturday if the help were quicker and gave me one good phrase for Sunday. Now it is half useful. I would tell my friends at the library to wait a little.
