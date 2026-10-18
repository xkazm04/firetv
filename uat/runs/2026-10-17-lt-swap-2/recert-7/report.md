# LT run 2026-10-17-lt-swap-2/recert-7 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 8 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J4 | pass | pass | 5/5 |  | 7/7 | 1/1 | 0 | 14 | 3.9 | done |
| petra-38 | J4 | fail - D3 failed: #11 after replay Ana asks a new question but she repeats 'I want other room.';… | fail | 5/5 |  | 9/9 | 1/1 | 0 | 19 | 5.6 | done |
| tomas-9 | J4 | fail - D2 failed: #8 he typed 'I like creeper. Dog.' after the phrase choice, not the offered ph…; D3 failed: #11 offered 'Replay the moment' but he pressed finish at #11; no fresh questio…; C4 failed: #1 list has 20 situations incl. 'A booking that is missing', 'Our group projec…; C6 failed: #11 'with an s, the usual way to say it' is abstract for a 9-year-old; also th… | fail | 3/5 |  | 1/1 |  | 0 | 12 | 2.9 | done |
| viktor-67 | J4 | fail - D2 failed: Cue repeated 'Try: How was school today? What did you do?' at #3, #4, #7, #10,…; D3 failed: Replay question 'What is in the garden? Tell me.' (#15) was fresh, but his ans…; C5 failed: Partner asks past tense 'What did you do at school?' (#9) and 'Did you play at…; C6 failed: Both moments teach only 'have a garden' (#12-#17), the same slip twice. No fam… | fail | 2/4 |  | 4/7 | 1/2 | 0 | 20 | 5.4 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 11/12 (92%) · safe 12/12 (100%)
- **pitch:** at band 21/24 (88%) · below 0 · above 3
- **moment precision:** 3/4 (75%)
- **moment recall:** 4/9 (44%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 32 calls, 0 failed, avg 12s · character 65 calls, 0 failed, avg 10s · judge 4 calls, 0 failed, avg 77s
- **driver coverage:** 61 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-viktor-67-J4-1` (clarity) · recurs `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-3`, recurrence 3 — Help cue repeats the same irrelevant line
  - expected: A usable answer phrase, changing with the question
  - got: 'Try: How was school today? What did you do?' shown four times, even when Mia asked 'What did you do at school?'
  - evidence: #3, #4, #7, #10 · cue/support cache
  - acceptance: Each press gives a different, answer-shaped phrase for the current question.
- **blocker · rank 27** `LT-petra-38-J4-1` (senior-quality) — Ana ignores what the learner said and repeats 'Is the room cold?'
  - expected: The partner responds to 'the room is not clean', not the scripted cold room.
  - got: Ana asks 'Is the room cold?' at #7, again in the turn after #11, and 'Is the heater broken?' after #14.
  - evidence: #7 'I am sorry to hear that. Is the room cold?' after 'The room is not clean'; conversation turn 'Okay, I can find you a new room. Is the room cold?' · partner prompt / scenario script
  - acceptance: Partner reply must address the learner's stated problem; no repeat of an already answered question.
- **blocker · rank 18** `LT-adela-17-J4-1` (effort) · recurs `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J4-1`, recurrence 10 — Cue gives simplified question first; B2 frame arrives on press three
  - expected: A B2 answer frame on first help press
  - got: Press 1 'Said more simply', press 2 gloss of 'focus', press 3 'I agree partly, but…'
  - evidence: #3 'I think social media is bad for focus and sleep', #4 'focus: being able to concentrate', #5 'A way to start I agree partly, but…' · cue prompt
  - acceptance: First help press returns an answer frame suited to the question at B2.
- **blocker · rank 18** `LT-petra-38-J4-3` (completion) · recurs `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-2`, recurrence 2 — Replay does not make her practise the coached phrase
  - expected: Fresh question where she uses 'another room' and does better.
  - got: #11 she repeats 'I want other room'; later 'A big room' without 'another'; replay used:false.
  - evidence: #11 'I want leave the room today, please. I want other room.' · replay prompt
  - acceptance: Replay question invites the coached phrase and the recap shows whether it was used.
- **blocker · rank 18** `LT-petra-38-J4-4` (missing) · recurs `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-5`, recurrence 2 — Clear learner errors got no moment or held fix
  - expected: Fixes for 'want leave', 'smell bad', and the first 'other room'.
  - got: One moment; heldFixes empty.
  - evidence: rawMoments turns 1, 7, 9, 11, 13 kind none; #16 'the room is dirty and smell bad' · moment detection prompt
  - acceptance: Each clear error yields a stop or a held fix shown on the recap.
- **blocker · rank 18** `LT-tomas-9-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-4`, recurrence 2 — Coaching note abstract and drops what he said
  - expected: Tiny child wording quoting 'I like creeper. Dog.'
  - got: 'with an s, the usual way to say it'; the quote omits 'Dog.'
  - evidence: #11 'You said I like creeper.' vs #8 'I like creeper. Dog.' · moment prompt
  - acceptance: Note quotes the whole reply and uses child words, e.g. 'one creeper, many creepers'.
- **blocker · rank 18** `LT-viktor-67-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-5`, recurrence 2 — Past-tense and 'play' questions above A1
  - expected: Short present-tense questions with known words
  - got: 'What did you do at school?', 'Did you play at school?'; Viktor 'I don't understand "play"'
  - evidence: #9, #11 · partner prompt
  - acceptance: Partner uses present tense and known words for A1 learners.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) — Replay with fresh question never exercised
  - expected: After coaching, a fresh question lets him retry alone.
  - got: Finished at coach screen; no retry and no better answer shown.
  - evidence: #11 'Replay the moment' / 'Finish for today'; he chose finish; #12 '0 on your own'. · moment replay flow
  - acceptance: After coaching, the replay offers a new question and the retry is recorded as independent if unsupported.
- **blocker · rank 18** `LT-viktor-67-J4-3` (senior-quality) — Replay adds no improvement; same slip returns
  - expected: The learner answers better after the fix
  - got: After fixing 'a garden' he said 'I have garden' again at #15 and #18. Moment 2 only repeated the first.
  - evidence: #14, #15, #16, #18 · moment replay flow
  - acceptance: Replay checks the fixed form in the new reply, or offers a new target.
- **major · rank 12** `LT-viktor-67-J4-4` (missing) · recurs `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-4`, recurrence 7 — Clear errors missed; same fix twice
  - expected: Moments on different useful gaps
  - got: rawMoments 'none' for turns 1, 3, 5 apart from the article; 'Ty' and 'Garden at school?' unremarked; 2 stops for one slip.
  - evidence: #8, #10, #12, #16 · moment selection
  - acceptance: Prefer varied useful fixes, e.g. 'I love you' pattern, 'It is big'.
- **major · rank 12** `LT-viktor-67-J4-5` (clarity) · recurs `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J4-3`, recurrence 4 — Phrase quiz is not about the scene
  - expected: Options answer Mia's real line
  - got: Quiz invents 'I had a test today' (past tense) while the scene asks how school was
  - evidence: #6 · recognition practice prompt
  - acceptance: Quiz drawn from the partner's actual line.
- **major · rank 12** `LT-petra-38-J4-5` (trust) · recurs `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-4`, recurrence 3 — Coach note claims Ana understood, and quotes the first turn not the stuck point
  - expected: Coaching tied to where she was stuck, truthful about Ana.
  - got: 'Ana understood the problem' while Ana asked about cold; quote from turn 1.
  - evidence: #10 'Your complaint and request are clear, and Ana understood the problem.' · coach prompt
  - acceptance: Note helps with the question she was stuck on and does not praise a mismatch.
- **major · rank 12** `LT-tomas-9-J4-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-2`, recurrence 3 — Cue generic and help loop repeated
  - expected: Cue that moves him on; Help pressed once is enough.
  - got: Help pressed 4 times with the same 'Try: I build a ___. It is ___.'
  - evidence: #3-#6 identical cue. · cue builder
  - acceptance: Repeat press escalates to a new kind of help (phrase choice) at once.
- **major · rank 12** `LT-adela-17-J4-3` (senior-quality) — Partner addresses itself as 'Ana' in its own turns
  - expected: Partner speaks to the learner naturally
  - got: 'Do you use group chats too, Ana?' and 'Ana might say…' from Ana herself
  - evidence: #13 'Do you use group chats too, Ana?'; #8 'Ana might say late-night scrolling is still the real problem.' · partner prompt
  - acceptance: Partner never names itself as the addressee or speaks of itself in third person.
- **major · rank 12** `LT-petra-38-J4-2` (effort) — Cues do not match the learner's real problem and are not used
  - expected: Help that moves her sentence forward.
  - got: 'The room is very cold' and 'The heater does not work…' offered when she needs 'not clean'.
  - evidence: #3 'Try: The room is very cold. Can you help, please?'; #9 'The heater does not work…' · cue ladder prompt
  - acceptance: Cue draws on the learner's own stated problem and the current question.
- **major · rank 9** `LT-tomas-9-J4-4` (clarity) · recurs `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-5`, recurrence 10 — Situation list long and mixed
  - expected: Short play/animal list.
  - got: 20 entries incl. booking, lost jacket, group project.
  - evidence: #1 list. · situation list builder
  - acceptance: Elementary profile shows only play, animal, sport situations.
- **minor · rank 6** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J4-5`, recurrence 2 — Rule for the fix is a bare collocation statement, no rule or why
  - expected: Named rule/collocation with a contrast, e.g. interested in + noun/-ing
  - got: 'interested' is followed by 'in' here, not 'about'.
  - evidence: #11 moment note · moment prompt
  - acceptance: Moment 'why' names the pattern (adjective + preposition) and one example.
- **minor · rank 6** `LT-adela-17-J4-4` (clarity) — Replay quote truncated and fix not tested
  - expected: Replay shows the full reply and checks use of the fix
  - got: Recap 'Tried again: ...discuss current' cut mid-sentence; replay used:false
  - evidence: #14 'they also let us share news and discuss current' · recap builder
  - acceptance: Replay reply quoted whole; replay question invites the corrected structure.

## What passed

- `LT-adela-17-J4-5` Moment quotes her words exactly and fix is correct — 'You said interested about their sleep' → 'interested in their sleep'
- `LT-adela-17-J4-6` Her 'was that correct?' questions answered accurately in-scene; supported counts honest — Yes/No answers correct; '3 on your own · 2 with help' matches
- `LT-petra-38-J4-6` Ladder of help works in-scene and the moment retry is satisfying — Simplified line, phrase choice, coach, then retry 'You fixed want another'.
- `LT-tomas-9-J4-5` Partner turns tiny and on topic — 'Creepers are cool! Do you build a house in Minecraft?' and a simpler version.
- `LT-tomas-9-J4-6` Supported reply recorded honestly — '0 on your own · 1 with help'.
- `LT-viktor-67-J4-6` Coaching quotes his exact words and is gentle — 'You said I have garden' → 'Try I have a garden'; no shaming; a clear 'Show me' clue.

## Voices

**Adéla · J4** (time saved: 40 min · low)

> Mostly I'd use it again. The debate felt like a real exam discussion, and the partner's questions were at my level. When I pressed help, I first got my question made simpler and a definition of "focus", which I didn't need. The useful phrase, "I see your point, but I think...", only came after three presses. The correction was exact: it quoted "interested about their sleep" and gave "interested in". I'd want the rule, though, not just "followed by in". When I asked "Was my sentence correct?" I got straight answers, and I like that. Ana calling herself "Ana" ("Do you use group chats too, Ana?") made me wince. I'm glad the recap says honestly which replies had help. It saves me some tutor time, but the corrections need more depth. Dobré, ale chci víc pravidel.

**Petra · J4** (time saved: 60 min · low)

> Sorry, my English is not perfect, but I tell honestly. The help buttons are good: I press, it says the question more simply, and I can choose a phrase. Nobody makes me feel stupid, and nothing is bad for Tomáš or Klára. I liked "another room" — I can use it. But Ana asked me three times "Is the room cold?" when I said the room is dirty. Like a guest who is not listened to! The help said "the heater does not work", not my problem. Then I did the same mistake again after coaching, and nobody noticed "I want leave" or "smell bad". I would use it fifteen minutes in the evening, but I would not fully trust the corrections yet. Better than expensive course for a short practice, yes.

**Tomáš · J4** (time saved: 20 min · low)

> Leo was fun, Minecraft! I liked the question about creepers. But I pressed help four times and got the same "I build a ___" every time, which was boring. Then I typed my own thing anyway. The coach said something about "an s", and I didn't understand that. It also forgot I said "Dog". I wanted to try again with a new question, but I just finished. It said I did it with help, so I think that's fair. Would I use it again? Maybe, for Minecraft. The long list of situations with jackets and bookings looks like school. Mum would like that it didn't make me feel bad.

**Viktor · J4** (time saved: 15 min · low)

> Víte, the garden talk with Mia was nice, and I like that the TV is patient and does not sigh. When the machine showed me "I have a garden", I understood at once and wrote it. But the help button gave me the same sentence four times, and it was not an answer. Then Mia asked "What did you do" and "play", and I did not know those words. I said "garden" and "I love you" again, which is all I could do. After the correction I still said "I have garden", so I am not sure I learned it. Would I use it again? Yes, on Saturday, if the questions were shorter. I trust the correction, it is correct, but it taught me only one thing. For Sunday I want words like "How was school?" and "I miss you". Maybe I would tell a friend from the library.
