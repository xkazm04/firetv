# LT run 2026-10-17-lt-swap-2/recert-9 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 8 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J4 | fail - D2 failed: The help led to a reply (#6), but coaching is null and moments are empty, so n…; D3 failed: No moment was shown, so there was no replay and no fresh question to answer be… | fail | 5/5 |  | 4/4 |  | 0 | 10 | 4.5 | done |
| petra-38 | J4 | fail - D2 failed: Help gave a gloss, 'The room is…' and an unrelated quiz (#5 'Stay quiet and le…; D3 failed: No replay was offered or taken; moments is [] and the journey ended at the rec… | fail | 6/6 |  | 7/7 |  | 0 | 15 | 6 | done |
| tomas-9 | J4 | fail - D2 failed: Help did not unblock: #11 reply 'Creeper... Minecraft. I like dog. Nevím.' sti…; D3 failed: #8 replay shown as a fresh question but #15 'Tried again: Creeper... Minecraft…; C4 failed: #1 list has 20 entries incl. 'A booking that is missing', 'Our group project',…; C5 failed: #8 'Good! Do you know where creepers live?' is a yes/no with an off-level conc…; C6 failed: #15 held fix 'I like dog' → 'I like dogs... when you talk about dogs in genera… | fail | 2/5 |  | 3/5 | 1/1 | 0 | 15 | 6.1 | done |
| viktor-67 | J4 | fail - D2 failed: Cue #3 "Hi Grandpa! I am home now." and quiz #5 gave no usable reply; he wrote…; D3 failed: #19 offers the fresh question "Which tomatoes are red, big or small?" but he p… | fail | 4/4 |  | 6/7 | 1/1 | 0 | 20 | 7.3 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 6/6 (100%) · safe 6/6 (100%)
- **pitch:** at band 20/23 (87%) · below 0 · above 3
- **moment precision:** 2/2 (100%)
- **moment recall:** 6/10 (60%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 28 calls, 0 failed, avg 12s · character 60 calls, 0 failed, avg 18s · judge 4 calls, 0 failed, avg 49s
- **driver coverage:** 56 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-viktor-67-J4-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-2`, recurrence 5 — Phrase quiz quotes a Mia line she never said
  - expected: Quiz options answer Mia's real line ("Art is fun. What do you like?")
  - got: Quiz header "Mia says: School was good. I had maths and art." with options "Nice! What did you draw in art?" / "I like the garden very much."
  - evidence: #5, #10: the quiz is the same stale text at both turns, not what Mia said at #8. · recognition practice prompt / support cache
  - acceptance: Quiz prompt must reproduce the current partner line and offer options that answer it in present tense.
- **blocker · rank 27** `LT-tomas-9-J4-2` (clarity) — Phrase choice asks a different question than the scene
  - expected: Phrase options that answer Sam's current question.
  - got: 'Sam asks: What do you like to build?' while Sam asked 'Do you know where creepers live?'
  - evidence: #10 vs #8; same in #5 · phrase-choice builder
  - acceptance: Choice prompts built from the current partner question.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-7/LT-adela-17-J4-1`, recurrence 12 — Cue gives a simplified question first; B2 frame arrives on press three and is thin
  - expected: A B2 answer frame on the first help press
  - got: 'Said more simply', then a gloss of 'full ban', then 'I agree that phones can…'
  - evidence: #3 'Phones can help, but I think a full ban is safer. What do you think?'; #4 'full ban: a rule that stops all phone use'; #5 'I agree that phones can…' · cue prompt
  - acceptance: The first press offers a B2 starter such as 'I see your point, but…' with a slot.
- **blocker · rank 18** `LT-viktor-67-J4-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-8/LT-viktor-67-J4-1`, recurrence 5 — Cue gives no sayable reply and a past-tense line
  - expected: A short present-tense cue such as "Is school good?"
  - got: "Said more simply: Hi Grandpa! I am home now." and "What it means" gloss only; quiz uses "I had maths and art"
  - evidence: #3, #4, #9: help restates Mia instead of giving Viktor words. · cue prompt level
  - acceptance: Cue offers one A1 phrase the learner can say for the Now task.
- **blocker · rank 18** `LT-viktor-67-J4-4` (completion) · recurs `2026-10-17-lt-swap-2/recert-8/LT-viktor-67-J4-4`, recurrence 3 — Replay question never answered
  - expected: Fresh question after the fix, answered better
  - got: #19 shows "Which tomatoes are red, big or small?" labelled Try it again; he finished immediately, replay spent
  - evidence: #19 finish; moments[0].repair spent true, no answer. · moment replay flow
  - acceptance: Finish should not close an unanswered replay without a nudge; the replay answer should be recorded.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-8/LT-tomas-9-J4-3`, recurrence 2 — Retry after the moment did not improve
  - expected: A fresh question where the coached 'I don't know' fits and he answers better.
  - got: Next reply again ended 'Nevím'; recap lists it as 'Tried again' though replay.used false.
  - evidence: #11 'Creeper... Minecraft. I like dog. Nevím.'; #15 'Tried again: “Creeper... Minecraft. I like dog. Nevím.”' · moment replay flow
  - acceptance: Replay offered and used; recap 'Tried again' only when replay.used is true and the reply is better.
- **blocker · rank 18** `LT-tomas-9-J4-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-8/LT-tomas-9-J4-5`, recurrence 2 — Simplified help repeats the question
  - expected: A simpler rewording.
  - got: 'Said more simply: Do you know where creepers live?' identical to the question.
  - evidence: #9 · cue builder
  - acceptance: Simplified line differs and uses known words.
- **blocker · rank 18** `LT-adela-17-J4-1` (missing) — No coaching note and no replay after getting help
  - expected: A coaching note quoting what she said, and a replay with a fresh question
  - got: moments:[], coaching:null. The recap shows only 'The line hidden in this room'
  - evidence: #10 recap has no replay or coaching. rawMoments kind 'none' for all 3 turns. The journey's promise to 'let me try again on my own' was not delivered. · moment prompt / replay builder
  - acceptance: After a supported reply, offer a replay with a fresh question and quote her words in the coaching note.
- **blocker · rank 18** `LT-petra-38-J4-1` (completion) — No replay of the stuck moment offered
  - expected: After help, a replay with a fresh question to try again on her own.
  - got: No moment was shown, so no replay; the session went straight to the recap.
  - evidence: moments is []; #15 recap has only 'Another situation' and 'Learning map'. · replay prompt / moment gating
  - acceptance: When help was used, the recap or scene offers 'Try that moment again' with a new question; used is recorded.
- **major · rank 12** `LT-petra-38-J4-2` (effort) · recurs `2026-10-17-lt-swap-2/recert-8/LT-petra-38-J4-3`, recurrence 2 — Same quiz screen repeated on three presses
  - expected: Help escalates or changes each time she asks.
  - got: #5, #6 and #7 show the identical 'What is the best first step?' quiz.
  - evidence: #5–#7 'A little support · recognition practice … Name the problem clearly / Stay quiet and leave'. · cue ladder
  - acceptance: Each repeat press gives a different, more concrete aid, such as a full sentence frame.
- **major · rank 12** `LT-adela-17-J4-3` (effort) — Phrase choice is a recognition quiz that hands over the answer
  - expected: A phrase choice that scaffolds her own words
  - got: A quiz on polite disagreement, plus 'Try: I see your point, but I think phones can help if we set clear rules.'
  - evidence: #6; her reply opens with 'I see your point, but I think a full ban…' · phrase help / quiz prompt
  - acceptance: Give a frame with slots, not a near-complete sentence.
- **major · rank 12** `LT-adela-17-J4-5` (trust) — Unaided reply recorded as supported
  - expected: Only turns where help was used count as 'with help'
  - got: The #8 reply, with no help pressed, is flagged supported:true. The recap says '2 with help'.
  - evidence: #10 '1 on your own · 2 with help' against help used only at #2-#6 · supported-flag logic
  - acceptance: Supported flag is cleared when no help was used since the last partner turn.
- **major · rank 12** `LT-petra-38-J4-3` (clarity) — Help did not give a sentence she could say
  - expected: A usable frame such as 'The room is cold and…' for an A2 speaker.
  - got: Only 'The room is…', a word gloss and a yes/no quiz; at #10 the starter was 'Yes, room twelve is good…' before any room was named.
  - evidence: #4 'The room is…'; #10 'Yes, room twelve is good…'. · cue/phrase generator
  - acceptance: Starters match the scene facts and give a full sayable sentence.
- **major · rank 12** `LT-tomas-9-J4-4` (senior-quality) — Partner stacks questions and ignores answers
  - expected: One short question per turn that follows his words.
  - got: 'Creepers are funny! What are you making?' then 'Good! Do you know where creepers live?' (two partner turns in a row); 'Good!' after Nevím.
  - evidence: #8 transcript · partner prompt
  - acceptance: One partner turn, one question.
- **major · rank 12** `LT-tomas-9-J4-5` (missing) — No coaching note quoting what he said; Pause & coach unused
  - expected: A coaching note quoting his words.
  - got: coaching null; only a moment and held fixes at the end.
  - evidence: facts coaching: null; #15 · coach
  - acceptance: Coach note quotes learner exact words.
- **major · rank 12** `LT-viktor-67-J4-2` (trust) — Correct answer rejected as wrong purpose
  - expected: "I like the garden very much." accepted as a reply to "What do you like?"
  - got: "That phrase has a different purpose. Try the other option." and evidence success:false
  - evidence: #11, #12 after Mia asked "What do you like?" (#8). · recognition practice prompt
  - acceptance: Quiz must grade against the live partner question.
- **minor · rank 6** `LT-tomas-9-J4-6` (missing) · recurs `2026-10-17-lt-swap-2/recert-8/LT-tomas-9-J4-2`, recurrence 12 — Situation list long and mixed
  - expected: Short list on play and animals.
  - got: 20 entries incl. 'A booking that is missing', 'Our group project'.
  - evidence: #1, #15 · situation list builder
  - acceptance: Child profile lists only child-fit situations.
- **minor · rank 6** `LT-adela-17-J4-4` (clarity) — Partner reply leaks a 'Dana:' speaker label and mixes feedback with the scene
  - expected: A clean in-character partner turn
  - got: 'Yes, ... is correct and clear. Dana: Fair point, but...'
  - evidence: #7 partner text · partner prompt
  - acceptance: Strip speaker labels, and put the correctness answer in a separate coach line.
- **minor · rank 4** `LT-petra-38-J4-4` (clarity) — Recap shows an odd 'line hidden in this room'
  - expected: A recap tied to what she said and where she needed help.
  - got: The recap shows 'Name the problem clearly' as the 'line hidden in this room'. That is a quiz option, not a line from the scene.
  - evidence: #15 'The line hidden in this room “Name the problem clearly”'. · recap builder
  - acceptance: Recap lists the phrase she was helped with, or her own coached sentence.
- **minor · rank 4** `LT-viktor-67-J4-5` (clarity) — Odd partner turns after replay
  - expected: One simple question per turn
  - got: Two consecutive partner turns, "Me too! Do you eat them?" then "Nice! Which tomatoes are red, big or small?"; Mia ignored his "you draw garden?"
  - evidence: facts.conversation last turns; #19 transcript. · partner prompt
  - acceptance: Replay question follows the last partner turn and answers the learner's question first.

## What passed

- `LT-adela-17-J4-6` Partner questions are B2 and stay on topic — Each turn is one question at B2, with no stacking.
- `LT-adela-17-J4-7` Help stays in the scene and her direct question gets an accurate answer — Cue, gloss and phrase help are all on the talk screen, and 'Was that correct?' was answered.
- `LT-petra-38-J4-5` Supported replies kept apart from independent ones — Recap says '4 on your own · 2 with help' and the two helped turns are marked supported.
- `LT-petra-38-J4-6` Held fixes are accurate and quote the learner exactly — Both fixes quote her words exactly and are correct.
- `LT-petra-38-J4-7` Patient, in-scene help ladder with simple partner English — The ladder runs gloss, then starter, then quiz without leaving the scene. Partner turns stay short.
- `LT-viktor-67-J4-6` Moment quotes him exactly and fix is correct — "You said Yes, tomatoes red." → "Yes, tomatoes are red." with a verb explanation; held fixes on recap
- `LT-viktor-67-J4-7` Help stays in scene and is honestly recorded — Help me answer, Choose a phrase, Show me all inline; recap "3 on your own · 2 with help"
- `LT-tomas-9-J4-7` Nevím moment is kind and clear — 'You wanted to say Nevím / In English: I don't know' — short, no shame, correct.
- `LT-tomas-9-J4-8` Supported replies kept apart — '2 on your own · 2 with help' and supported flags.

## Voices

**Adéla · J4** (time saved: 10 min · low)

> The debate itself was decent. Dana asked proper B2 questions, and I could get help without leaving the scene. But the help started too simple. "Said more simply" is not what I need at B2, and the useful phrase only came on the third press. Then the "Try:" line basically wrote my first answer for me. I asked "Was that correct?" and got a yes, which is fine. But there was no coaching note, no replay, and nothing quoting what I actually said. That is exactly the "tell me exactly what was wrong" part I came for. The recap also says "2 with help" when I answered the third question alone. A tutor would have pushed me to try it again. I'd use it for the questions, but not yet as a replacement for my exam tutor.

**Petra · J4** (time saved: 60 min · low)

> I liked that the hotel scene felt like my work, and nobody made me feel stupid when I pressed help again and again. The little hints were calm. But the help was thin. "The room is…" is not much, and the quiz about "stay quiet and leave" felt like a test, which I hate. Then I just said my own sentence anyway. The corrections at the end were right and I can use "I am going to room 214 now" at the desk, though I did not get to try it again. I wanted a second go with a new question, and it never came. I also like that it says honestly which answers had help. For my kids it looked safe. I would use it again for 15 minutes in the evening, but I would want that replay first.

**Tomáš · J4** (time saved: 15 min · low)

> Jo, Minecraft! I liked talking to Sam, and the "I don't know" bit was fun — I said Nevím and it told me how to say it in English, no shouting. But the help was strange. I pressed the phrase button and it asked a different question about building a house. Sam asked about creepers living somewhere and I didn't understand, and the "simpler" words were the same words. So I just said creeper, dog, Minecraft again. When I tried again, I still said Nevím. Mum would also see the long list of things like bookings and group projects — that's school, nuda. I'd use it for the creeper talk, but the help needs to really help. I wouldn't trust it to teach me yet.

**Viktor · J4** (time saved: 30 min · low)

> I liked that the help was right there on the screen and Mia spoke slowly, so I never felt rushed. The correction about "tomatoes are red" was clear, and I could see my own words quoted. That is respectful. But the phrase help confused me. It talked about "maths and art", which Mia never said, and it told me my answer "I like the garden" had a different purpose, when she asked what I like. That I do not trust. The cue did not give me words for Sunday; I made up "Mia, school good?" myself. At the end she asked a new question and I simply finished, nobody asked me to try. For fifteen minutes on Saturday it could replace the tram to the library if the help matched the conversation. Now, děkuji, only partly. I would try it once more.
