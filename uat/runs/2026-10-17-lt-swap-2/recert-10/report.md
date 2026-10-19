# LT run 2026-10-17-lt-swap-2/recert-10 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 6 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J4 | fail - D2 failed: Help did unblock replies (#7, #9), but facts.conversation.coaching is null and…; D3 failed: No replay offered: moments [] and the recap #12 shows no 'try again' or fresh … | fail | 4/4 |  | 4/4 |  | 0 | 12 | 3.7 | done |
| petra-38 | J4 | fail - D2 failed: Help gave a phrase (#3, #8), but she ignored it and typed her own words (#6, #…; D3 failed: No moment was shown, so there was no replay with a fresh question; #10 goes st… | fail | 4/4 |  | 4/4 |  | 0 | 11 | 3.2 | done |
| tomas-9 | J4 | conditional - C4 failed: #1 situation list has 20 entries incl. 'A booking that is missing', 'Our group… | conditional | 4/5 |  | 4/7 | 1/1 | 0 | 16 | 5 | done |
| viktor-67 | J4 | fail - D2 failed: Help unblocked replies (#6, #10) but coaching is null and no note quotes what …; D3 failed: No moment, so no replay or fresh question; moments [] and mission ended at #11. | fail | 2/2 |  | 4/4 |  | 0 | 12 | 3.6 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 21/24 (88%) · safe 24/24 (100%)
- **pitch:** at band 16/19 (84%) · below 0 · above 3
- **moment precision:** 1/1 (100%)
- **moment recall:** 4/5 (80%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 24 calls, 0 failed, avg 12s · character 51 calls, 0 failed, avg 12s · judge 4 calls, 0 failed, avg 44s
- **driver coverage:** 47 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 1 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-adela-17-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-8/LT-adela-17-J4-1`, recurrence 3 — No coaching note and no replay after getting help
  - expected: A coaching note quoting what she said, then a replay with a fresh question
  - got: moments [], coaching null; recap has no retry
  - evidence: #12 recap shows only 'The line hidden in this room'; rawMoments kind 'none' for all 3 turns. · moment prompt / replay builder
  - acceptance: After a supported turn, the recap or a pause offers a quoted note and a fresh-question replay.
- **blocker · rank 18** `LT-tomas-9-J4-5` (missing) · recurs `2026-10-17-lt-swap-2/recert-9/LT-tomas-9-J4-6`, recurrence 13 — Situation list long and mixed again
  - expected: Short list of play and animal topics
  - got: 20 entries incl. 'A booking that is missing', 'Our group project'
  - evidence: #1, #16 · situation list builder
  - acceptance: For an elementary profile show only child-suited situations.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-8/LT-adela-17-J4-2`, recurrence 12 — Cue opens with a simplified question and a thin frame
  - expected: A B2 answer frame on the first press
  - got: 'Said more simply' restates the question, then a gloss of 'small businesses', then 'I think social media…' on press three
  - evidence: #3 'Social media helps people connect. What do you think?'; #4 gloss; #5 'I think social media…' · cue prompt
  - acceptance: First help press gives a B2 frame such as 'It depends on… although…' for stretch learners.
- **blocker · rank 18** `LT-petra-38-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-9/LT-petra-38-J4-1`, recurrence 2 — No moment, coaching note or replay after getting stuck
  - expected: A moment quoting what she said, then a replay with a fresh question.
  - got: moments [], coaching null, and no replay. The journey goes from finish straight to the recap.
  - evidence: #10 finish -> #11 recap has only 'Another situation' and 'Learning map'. rawMoments kind 'none' on all three turns. · moment gating / replay prompt
  - acceptance: After a turn where help was used, a coaching note quotes her words and offers a replay with a fresh question.
- **blocker · rank 18** `LT-viktor-67-J4-1` (completion) — No coaching note and no replay in a stuck journey
  - expected: A coaching note quoting his words and a fresh replay question to answer better
  - got: moments [] and coaching null; mission closed after three supported replies
  - evidence: #11 'Mission done'; facts.conversation moments [], coaching null; rawMoments all kind 'none'. · moment detection / coaching prompt
  - acceptance: After supported replies, offer Pause & coach or a replay with a note quoting his line.
- **major · rank 12** `LT-adela-17-J4-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-9/LT-adela-17-J4-3`, recurrence 2 — Phrase choice is a recognition quiz with a weak distractor
  - expected: A scaffold for her own words
  - got: Options 'I think it helps people connect.' vs 'I usually use it at night.', plus 'Try: I see your point, but I think the problem is...' which does not fit the question
  - evidence: #6 · phrase help / quiz prompt
  - acceptance: Phrase help offers two or three B2 openers fitted to the question, with no obvious wrong answer.
- **major · rank 12** `LT-petra-38-J4-2` (senior-quality) — Clear error 'I want sleep' got no coaching
  - expected: A fix such as 'I want to sleep' or 'I'd like to sleep'.
  - got: rawMoment for turn 3 is kind 'none' for 'I am tired and I want sleep'.
  - evidence: #8 'But I am tired and I want sleep.'; rawMoments n:2 raw.kind none. · moment detector prompt
  - acceptance: A clear A2 grammar slip gets a moment or a held fix on the recap.
- **major · rank 12** `LT-tomas-9-J4-3` (clarity) — Opening question is confusing and above A1
  - expected: A tiny first question, clear whose dog Biscuit is
  - got: 'Biscuit likes what?' before anything is said; later 'Is your dog big?' makes Biscuit's owner unclear; 'Where Biscuit sleeps' and 'What is Creeper like?' are above a beginner
  - evidence: #2, #7, #15 · partner prompt
  - acceptance: Mia's first line names the dog as the learner's and uses one known word question.
- **major · rank 12** `LT-viktor-67-J4-2` (clarity) — Cue does not help with the current task
  - expected: Cue to ask a school question, e.g. 'Do you like school?'
  - got: #8 cue 'Hi Lena! Yes, I see you.' when the task was 'Ask Lena one question about school'
  - evidence: #7 Now: 'Ask Lena one question about school'; #8 'You could say Hi Lena! Yes, I see you.' · cue prompt
  - acceptance: Cue must offer a sayable line serving the Now task.
- **minor · rank 6** `LT-adela-17-J4-4` (missing) — Correctness answer only restates her clause; no examiner-level note
  - expected: Confirm and add one concrete point, such as noting 'big companies benefit much more' as good comparison
  - got: 'Yes, your sentence is correct' plus a quote of one clause, then back to the debate
  - evidence: #10 · partner prompt
  - acceptance: Answer names what was right and any rule, within the scene.
- **minor · rank 6** `LT-tomas-9-J4-4` (senior-quality) — Held fixes are pedantic for a 9-year-old
  - expected: Fix only what matters, in kid words
  - got: 'Biscuit likes ball.' → 'likes the ball.' 'Add the before ball'; 'I like dog' → 'dogs'
  - evidence: #16 Saved for the end · held fix rules
  - acceptance: Skip article-only fixes at A1; correct only errors a teacher would call wrong.
- **minor · rank 6** `LT-viktor-67-J4-3` (senior-quality) — Cue gives whole answer to copy
  - expected: A scaffold he adapts (his garden)
  - got: #10 cue 'Good! My school is nice too.' sent verbatim; he wanted to talk about his garden
  - evidence: #9 thought 'I want to say I like garden'; #10 answer is the cue verbatim · cue prompt
  - acceptance: Cue gives a frame with a slot he fills.
- **minor · rank 4** `LT-tomas-9-J4-6` (missing) · recurs `2026-10-17-lt-swap-2/recert-9/LT-tomas-9-J4-5`, recurrence 2 — Pause & coach unused; no coaching note
  - expected: A coaching note quoting his words
  - got: coaching null
  - evidence: facts coaching: null; Pause & coach visible #7–#15 but never offered/used · coach
  - acceptance: Surface Pause & coach after repeated cue use and quote the learner's words.
- **minor · rank 4** `LT-petra-38-J4-3` (clarity) — Help starter 'The cold is very…' is awkward
  - expected: A usable frame such as 'The room is cold and…'.
  - got: 'A way to start: The cold is very…' is unnatural; she then typed her own sentence.
  - evidence: #6 'The cold is very…' versus #4 'Try: I have a problem. The room is very cold.' · cue/phrase generator
  - acceptance: The starter is a natural opening for the required reply.
- **minor · rank 4** `LT-petra-38-J4-6` (clarity) — Recap line not tied to what she practised
  - expected: A recap line drawn from her scene or a stuck moment.
  - got: 'Sorry, I can move you to room 12.' was never said or offered in the scene, and it is marked 'Not tried'.
  - evidence: #11 'The line hidden in this room'; the scene (#2–#10) never mentions room 12. · recap builder
  - acceptance: The recap names a line from this conversation or from her help.
- **minor · rank 4** `LT-viktor-67-J4-4` (completion) — Mission ends with partner question unanswered
  - expected: He answers 'Do you paint?' or is told what she asked
  - got: Mission done fires at #11 right after Lena asks 'Do you paint?'
  - evidence: #11 'I paint in art. Do you paint?' with 'Mission done' · mission completion rule
  - acceptance: Let the scene continue or sign off with the question answered.

## What passed

- `LT-adela-17-J4-5` Support flags are honest — 2 with help, 1 on her own, matching the help presses
- `LT-adela-17-J4-6` Help is reachable in-scene and partner questions are B2 — Help me answer / Choose a phrase on screen; partner asks for common ground
- `LT-petra-38-J4-4` Help varies and stays in the scene — Cue, quiz, gloss and starter were all offered in turn.
- `LT-petra-38-J4-5` Supported replies are kept apart from independent ones — '3 spoken · 0 written replies · 1 on your own · 2 with help'.
- `LT-tomas-9-J4-1` Moment teaches 'I don't know' and the retry uses it — #6 'nevím' → 'I don't know'; #9 he says it in a full try; recap 'you used it'
- `LT-tomas-9-J4-2` Help stays honest in the progress picture — '3 on your own · 3 with help'
- `LT-viktor-67-J4-5` Progress picture stays honest — '3 spoken · 0 written replies · 0 on your own · 3 with help'
- `LT-viktor-67-J4-6` Phrase quiz matches the live line — 'Lena asks: Hi Grandpa! Can you see me?' with options 'Yes, I can see you.'

## Voices

**Adéla · J4** (time saved: 0 min · low)

> Honestly, I got to talk about a proper topic and Sam's questions were at my level, which I liked. The help buttons are easy to find. But the first help just made the question simpler, which is a bit babyish for B2, and the phrase quiz had an option about using it at night. That is not a real choice. Then I finished and got no note about what I actually said, and no chance to try again, which was the whole point. I even asked whether my sentence was correct; the answer was yes, fine, but I'd like the rule or one thing to improve. I can't tell what I should fix, so my tutor still has to re-check me. I might use it for the conversation, but not yet as a replacement for my weekly tutor.

**Petra · J4** (time saved: 30 min · low)

> Hotel complaint is my own work, so I liked it, and Mr Ortiz spoke slowly and kindly. When I did not know what to say, the help was easy to find and did not make me feel stupid. It gave a phrase, a small quiz, a word meaning. But in the end I wrote my own words and nobody told me what was wrong. "I want sleep" is not right, I know, and I wanted to hear it. There was no coach note and no second try, so I could not see if I got better. The recap shows a room 12 sentence I never used. The "with help" and "on your own" counts look honest, and I trust that. For my kids the topic is safe. For my desk job I need the correction and the replay. Not yet to recommend.

**Tomáš · J4** (time saved: 35 min · medium)

> Jo, I liked it more than the English club. I said "nevím" and it told me how to say "I don't know", so next time I said it in English and felt clever. Mia asked about Biscuit, then my dog, then Minecraft and creeper — that was fun. The help buttons were easy to find. But Mia's first question was weird, and "where Biscuit sleeps" was too hard. "What is Creeper like?" I didn't know how to answer. The end notes about "the ball" and "dogs" were boring, like school. The topic list was huge, with a "booking" and a "group project" — nuda. Short and no reading is good, and I spoke nearly the whole time. I'd use it again, and I'd tell kluci about the Minecraft one.

**Viktor · J4** (time saved: 30 min · low)

> Víte, it was gentle and Lena spoke slowly, which I liked. When I did not know what to say, the help was easy to find and I did not leave the room. The choice of two phrases was clear. But the help sometimes gave me the wrong sentence, "I see you" when I wanted to ask about school, and then I just copied it. I wanted to say something about my garden. Then it finished while Lena asked about painting, and nobody told me what I said well or badly. No note, no second try. I like that it says honestly I had help, not alone. For Saturday before the call I would use it again, but I need the words for my grandchildren, and a real second chance to try.
