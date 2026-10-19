# LT run 2026-10-17-lt-swap-2/recert-8 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 7 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 1 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J4 | fail - D3 failed: #15 replay: 'used':false. 'Try it again' (#10) re-asked Marco's next question.… | fail | 4/4 |  | 5/7 | 1/1 | 0 | 15 | 4.4 | done |
| petra-38 | J4 | fail - D2 failed: #8 note quotes 'You said Can you help me please?', which is accurate. But #7 c…; D3 failed: Replay #8-#9 gave 'What should we do about it?'. Her answer 'I want other room…; C5 failed: #8 'Can you fix the shower, please? Or can I have a new room?' is usable, but … | conditional | 4/5 |  | 5/5 | 1/1 | 0 | 16 | 4.4 | done |
| tomas-9 | J4 | fail - D3 failed: #12 fresh question 'Where are the diamonds in the game?' (Try it again) but hi…; C6 failed: #19 'Dog needs an s here, because you mean more than one dog' for 'Yes. I like… | fail | 3/4 |  | 7/10 | 1/1 | 0 | 19 | 5.4 | done |
| viktor-67 | J4 | fail - ended character-stopped before done; D2 failed: The cue (#3) gave 'Said more simply: Can you see me?', which is a restatement,…; D3 failed: #17 'Try it again' gave a fresh question, but replay.used is false. His answer… | fail | 2/2 |  | 8/9 | 2/2 | 0 | 22 | 5.9 | character-stopped |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 5/6 (83%) · safe 6/6 (100%)
- **pitch:** at band 25/31 (81%) · below 2 · above 4
- **moment precision:** 5/5 (100%)
- **moment recall:** 9/17 (53%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 38 calls, 0 failed, avg 10s · character 72 calls, 0 failed, avg 11s · judge 4 calls, 0 failed, avg 49s
- **driver coverage:** 69 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 1 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-viktor-67-J4-1` (missing) · recurs `2026-10-17-lt-swap-2/recert-7/LT-viktor-67-J4-1`, recurrence 4 — Help cue repeats a line that does not answer Mia
  - expected: A cue that changes with Mia's line and gives a reply Viktor can say, such as 'I draw a garden.'
  - got: 'Try: What did you do at school today?' stays on screen after Mia says 'I drew a cat. Do you draw?'. The first cue only restated 'Can you see me?'.
  - evidence: #3, #5, #10, #12: 'Try: What did you do at school today?' · cue/support cache; recognition practice prompt
  - acceptance: Each cue is built from the current partner line and offers an answer phrase at A1.
- **blocker · rank 27** `LT-tomas-9-J4-3` (completion) — Retry after the moment did not improve
  - expected: A fresh question where the coached phrase fits and he answers better.
  - got: Next reply again contained 'nevím'; recap lists it as 'Tried again' though replay.used false.
  - evidence: #12 'I like diamond. I can... jé, nevím.'; #19 'Tried again: ...jé, nevím...' · moment replay flow
  - acceptance: After a moment ask a fresh question where the coached phrase fits; recap counts only a real better retry.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J4-1`, recurrence 10 — Cue gives a simplified question first; B2 frame is late and thin
  - expected: A B2 opening frame on the first help press
  - got: Press 1 'Said more simply', press 2 gloss of 'stand', then 'I think that…' as the phrase
  - evidence: #3 'Said more simply', #4 'stand: what you think', #5 'I think that…' · cue prompt
  - acceptance: First help press offers a B2 frame such as 'I'd argue that… although…'.
- **blocker · rank 18** `LT-viktor-67-J4-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-viktor-67-J4-1`, recurrence 8 — Phrase quiz is not about the current scene
  - expected: Options that match Mia's last line
  - got: 'Which question asks about her day at school?' while Mia asks 'Do you draw?'. 'Where is my garden?' is a throwaway distractor.
  - evidence: #11 quiz after #9 'I drew a cat. Do you draw?' · recognition practice prompt
  - acceptance: The quiz options respond to the partner's latest line.
- **blocker · rank 18** `LT-tomas-9-J4-1` (effort) · recurs `2026-10-17-lt-swap-2/recert-7/LT-tomas-9-J4-3`, recurrence 4 — Help cue repeated identically and too long
  - expected: A cue that changes and moves a 9-year-old on, in a few words.
  - got: Help pressed three times gave the same 'Try: I like to build. My favourite block is...'
  - evidence: #2-#4 identical 'Try: I like to build. My favourite block is...'; #5 had to use quiz. · cue builder
  - acceptance: Repeated Help gives a different, shorter cue each press.
- **blocker · rank 18** `LT-petra-38-J4-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-7/LT-petra-38-J4-3`, recurrence 3 — Replay does not make her practise the coached phrase
  - expected: Replay gives a fresh question, she uses the coached form, and the replay is marked used.
  - got: Replay question was 'What should we do about it?'. Her reply kept 'I want other room'. replay.used is false.
  - evidence: #9 'I want other room please'; moment replay used:false; recap shows 'Tried again' with a different reply. · replay prompt
  - acceptance: After a fix, the replay question invites the corrected form, and the replay is marked used when she tries it.
- **blocker · rank 18** `LT-petra-38-J4-2` (effort) · recurs `2026-10-17-lt-swap-2/recert-7/LT-petra-38-J4-4`, recurrence 3 — Clear learner errors got no moment or held fix
  - expected: Fix for 'I want other room', 'want to sleep' and similar errors, shown or held for the recap.
  - got: One moment. heldFixes is empty. Turns 4, 7 and 9 have clear errors; the missed ones are 'other room' and 'I think is not repair'.
  - evidence: rawMoments turns 1, 7, 9 kind none; '#9 I want other room please' got no fix for 'other room'. · moment detection prompt
  - acceptance: Each learner turn with a clear error yields a moment or a held fix on the recap.
- **blocker · rank 18** `LT-adela-17-J4-1` (missing) · recurs `2026-10-17-lt-swap-2/recert-7/LT-adela-17-J4-4`, recurrence 2 — Replay does not test the fix; recap quote is cut mid-sentence
  - expected: A fresh question that checks 'often', and the full retry quoted
  - got: Replay used:false; recap 'Tried again' ends 'whether '
  - evidence: #15 'it depends on whether ' ; moments[0].replay.used=false · recap builder / replay
  - acceptance: Replay asks a fresh question; recap quotes the complete retry and shows whether the fix was used.
- **blocker · rank 18** `LT-adela-17-J4-3` (trust) — Clear error 'not used to go' got no moment or coaching
  - expected: Note: 'be used to + -ing': 'not used to going'
  - got: Only 'eventually' flagged; 'not used to go to bed' passed silently and coaching is null
  - evidence: #8 'they are not used to go to bed early'; facts.conversation.coaching null · moment prompt / LG-23 held fix
  - acceptance: When the cap allows one fix, held fixes appear on the recap.
- **major · rank 12** `LT-petra-38-J4-4` (trust) · recurs `2026-10-17-lt-swap-2/recert-7/LT-petra-38-J4-5`, recurrence 4 — Recap coaching quotes the first turn, not the stuck point
  - expected: Coaching tied to where she needed help and to the moment she fixed.
  - got: Recap coaching still quotes 'Can you help me please?' while the kept moment is another sentence.
  - evidence: #16 recap 'You said Can you help me please?' next to the 'From this rehearsal' moment about 'repair'. · coach prompt
  - acceptance: The recap shows the moment she actually worked on first.
- **major · rank 12** `LT-viktor-67-J4-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-7/LT-viktor-67-J4-2`, recurrence 3 — Past-tense help above A1
  - expected: Present-tense, known words for a first-time learner
  - got: The cue and quiz offer 'What did you do at school today?'. Mia says 'I drew a cat'.
  - evidence: #5, #9 · partner and cue prompt level
  - acceptance: A1 help phrases are present tense with known words, such as 'Do you like school?'.
- **major · rank 12** `LT-tomas-9-J4-4` (senior-quality) — Held-fix explanations misleading
  - expected: Accurate child wording that fits the question asked.
  - got: 'because you mean more than one dog' after 'Do you like dogs?'; 'One friend, like Rex' for a dog.
  - evidence: #19 recap held fixes for 'I like dog' and 'Rex like football'. · moment prompt
  - acceptance: Notes name the real referent and avoid wrong grammar reasons.
- **major · rank 9** `LT-tomas-9-J4-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-7/LT-tomas-9-J4-4`, recurrence 11 — Situation list long and mixed
  - expected: A short list about play and animals.
  - got: 20 entries incl. booking, lost jacket, group project, speaking practice.
  - evidence: #1 and #19 list with 'A booking that is missing', 'Our group project'. · situation list builder
  - acceptance: Show age-fit situations only for elementary profiles.
- **major · rank 8** `LT-viktor-67-J4-5` (missing) · recurs `2026-10-17-lt-swap-2/recert-7/LT-viktor-67-J4-4`, recurrence 8 — Five of seven errors had only held fixes; coaching null
  - expected: The learner sees why 'Red, small time' and 'Flowers red' went wrong, or sees them on the recap
  - got: Two stops only, and facts.coaching is null. 'Red, small time' passed with a 'Nice!' reply.
  - evidence: facts.heldFixes (5); #19-#20 · LG-23 held fix selection
  - acceptance: Held fixes show on the recap with the exact quote.
- **major · rank 8** `LT-viktor-67-J4-4` (completion) · recurs `2026-10-17-lt-swap-2/recert-7/LT-viktor-67-J4-3`, recurrence 2 — Replay does not show a better answer
  - expected: After the fix, the fresh question brings a visibly better reply, and the replay is used
  - got: replay.used false. The answer 'I have tomato and flowers' keeps a plural slip, which was held and never shown.
  - evidence: #17; facts moments[0].replay.used=false · moment replay flow
  - acceptance: The replay is scored on the learner's retry, and the recap says whether it improved.
- **major · rank 8** `LT-tomas-9-J4-5` (clarity) — Simplified help repeats the previous question
  - expected: Simpler rewording of the current question.
  - got: 'Said more simply: What do you make?' for 'What do you build?'; sentence-help not offered.
  - evidence: #9 shown; #9 result 'not-offered'. · cue builder
  - acceptance: Simplified line restates the current question.
- **minor · rank 6** `LT-petra-38-J4-3` (clarity) — Cue repeated three times with no new help
  - expected: Help escalates or changes on repeated presses.
  - got: The same 'Try: Excuse me...' cue at #3, #4, #5.
  - evidence: #4 and #5 show an identical 'A little support' line. · cue ladder
  - acceptance: Each further press moves to the next rung (simpler wording, then phrase choice).
- **polish · rank 2** `LT-adela-17-J4-4` (clarity) — Marco's questions get stacked and one is dropped
  - expected: One partner turn per learner reply
  - got: Two consecutive partner turns: 'Do you think phones should be turned off at night?' then 'When friends message you at night…'
  - evidence: #10 transcript shows both Marco turns · partner prompt
  - acceptance: Each learner reply gets exactly one partner reply.

## What passed

- `LT-petra-38-J4-5` Supported reply recorded honestly — Recap '3 on your own · 1 with help'.
- `LT-tomas-9-J4-6` Moment quotes his words exactly and stays kind — 'You wanted to say Já nevím...' → 'I don't know'; Czech accepted; partner turns short and friendly.
- `LT-adela-17-J4-5` Moment is exact and explains the false friend — 'eventually' → 'often' with meaning contrast
- `LT-adela-17-J4-6` Support honestly recorded as supported — '2 on your own · 3 with help'
- `LT-petra-38-J4-6` Moment quotes her words exactly and lets her retry — 'You said I think is not repair today' with 'Show me' and a confirmation 'You fixed...'.
- `LT-viktor-67-J4-6` Moment quotes him exactly and the fix is correct — 'You said I have cat in garden.' then 'Try I have a cat in the garden.' He repeated it right, and the second fix was also taken up (#21 'Tomatoes are big').
- `LT-viktor-67-J4-7` Support is flagged, so the picture stays honest — Evidence rows carry supported:true for the quiz and cue turns. Unassisted turns are false.

## Voices

**Adéla · J4** (time saved: 20 min · low)

> The scene was on topic: Marco asked real opinion questions and the 'eventually' correction was exact. I'd use that. But help meant pressing three times for a simplified question and a gloss before I got 'I think that…', which is not B2. The retry didn't test anything: the recap cut my sentence off and the fix was never used. I also said 'not used to go to bed' and nothing flagged it, though that is exactly my kind of slip. Yes, I was told 'correct' twice, but I'd have to re-check everything myself. The 'with help' count is honest, which I like. I'd try again, but I wouldn't yet replace my tutor.

**Petra · J4** (time saved: 60 min · low)

> The hotel scene was my job, and Ana spoke slowly. That helped. When I was stuck, the hint gave me a sentence and I could say it. Nobody made me feel stupid, and 'Said more simply' was kind. But I pressed help three times and got the same line. When I tried again, I said 'I want other room' again, and nothing told me that was wrong. It only fixed 'I think is not repair'. I can't say I trust it yet. Would I tell my sister? Maybe, after it is fixed. The kids' side looked safe, and I'd let Tomáš try it. But I need 'another room' and the other words that matter at the desk tomorrow.

**Tomáš · J4** (time saved: 25 min · low)

> Jo, Minecraft was good, and Mia was nice, short questions, no stress. I pressed Help three times and got the same long sentence, "My favourite block is..." — nevím what that means! The quiz was easier, I picked the house one. When I said "Já nevím" it told me "I don't know", okay, cool. But the next question about diamonds, I said nevím again, so did I learn it? Not really. Rex and football were fun, I could say that. I didn't like the list with booking and group project, that's homework. I'd use it for the dog talks, but I want help that gives me the word. Mum likes no trip to the club, ale nevím jestli se naučím víc.

**Viktor · J4** (time saved: 30 min · low)

> Víte, the scene about Mia and my garden was exactly what I want for Sunday, and the partner spoke slowly with one small question each time. I liked that the fix quoted my own words, "I have cat in garden", and showed me "a cat in the garden". But when I was stuck, the help did not help me. The same sentence about school stayed on the screen even when Mia asked about her cat, and the quiz asked about something else. I ended up typing my own words anyway. "Did you do" is hard for me too. Some of my mistakes were never explained to me, like "Red, small time". I would use it on Saturday for the garden words, but I would not yet trust the help button. Fifteen minutes at home beats the tram, so I would try again.
