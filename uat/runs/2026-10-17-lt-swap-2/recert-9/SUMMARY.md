# SUMMARY — LT run 2026-10-17-lt-swap-2/recert-9

Synthesised by claude-cli/sonnet. Read with report.md; findings are unverified at LT.

## Panel verdict

Not ready. All four characters failed on getting a usable reply from help and on retrying the stuck moment. The strongest cross-character fixes are to make help match the current question, and to make the replay always happen and be honestly labelled. Safety, accurate corrections and honest help-tracking are solid and worth keeping. Two conflicts stand: partner-turn quality and help-ladder level. Both are reported as conflicts, not averaged.

## Cross-cutting themes

- **Help does not produce a sayable reply that fits the current question** (adela-17, petra-38, tomas-9, viktor-67) — All four failed D2. Petra: help gave 'The room is…' and an unrelated quiz (LT-petra-38-J4-3). Tomas: the phrase asked 'What do you like to build?' while Sam had asked about creepers (LT-tomas-9-J4-2), and 'Said more simply' repeated the question word for word (LT-tomas-9-J4-3). Viktor: the cue gave no sayable reply and the quiz used a past-tense line (LT-viktor-67-J4-3). Adela: the B2 frame only came on the third press (LT-adela-17-J4-2), and the 'Try:' line then nearly wrote her answer (LT-adela-17-J4-3). Every learner ended up typing their own sentence.
- **The retry loop is broken: no replay offered, or the replay is not answered or does not improve** (adela-17, petra-38, tomas-9, viktor-67) — All four failed D3, one in each way. Adela had no moment and no replay (LT-adela-17-J4-1). Petra went straight to the recap (LT-petra-38-J4-1). Tomas's retry again ended in 'Nevím', yet the recap labelled it 'Tried again' with replay.used false (LT-tomas-9-J4-1). Viktor was shown a fresh question and pressed Finish (LT-viktor-67-J4-4). Petra and Viktor both said they wanted a second go.
- **Help content is not tied to what was actually said in the scene** (viktor-67, tomas-9, petra-38) — Viktor's quiz quoted a Mia line she never said (LT-viktor-67-J4-1), and his correct answer was rejected as 'a different purpose' (LT-viktor-67-J4-2). Tomas's phrase help asked a different question (LT-tomas-9-J4-2). Petra's starter named a room before any room was given (LT-petra-38-J4-3), and her recap showed a quiz option as 'the line hidden in this room' (LT-petra-38-J4-4). Viktor and Tomas both said directly that this costs trust.
- **Coaching notes quoting the learner are mostly missing** (adela-17, petra-38, tomas-9) — Three characters had coaching null and Pause & coach unused (LT-adela-17-J4-1, LT-tomas-9-J4-5; Petra's D2). Viktor did get an exact quote (LT-viktor-67-J4-6) but only after a moment fired. Where a fix or moment did appear it was accurate and respectful (Petra, Viktor, Tomas strengths). So the content is good but it fires inconsistently.
- **Partner turns are sometimes stacked or ignore the learner's answer** (tomas-9, viktor-67, adela-17) — Tomas had two partner turns in a row and 'Good!' after Nevím (LT-tomas-9-J4-4). Viktor had two partner turns in a row, and Mia ignored his question (LT-viktor-67-J4-5). Adela had a leaked 'Dana:' label (LT-adela-17-J4-4). Adela and Petra, by contrast, found the partner questions fine (strengths).

## Impact-ranked backlog

1. **Make every help rung a sayable reply to the current partner turn** · `build` — This is the only problem all four characters hit. It is reachable on every first press of help, and when help is wrong the learner stops trusting it, as Tomas and Viktor said. (LT-tomas-9-J4-2, LT-tomas-9-J4-3, LT-viktor-67-J4-3, LT-viktor-67-J4-1, LT-petra-38-J4-3, LT-adela-17-J4-2, LT-adela-17-J4-3, LT-petra-38-J4-2)
2. **Fix the replay: always offer it, make the fresh question a required step, and mark 'Tried again' only when it happened** · `build` — All four failed D3 and all four hit this step. The wrong label in Tomas's recap is also a trust problem. (LT-adela-17-J4-1, LT-petra-38-J4-1, LT-tomas-9-J4-1, LT-viktor-67-J4-4)
3. **Check quiz and help against the real transcript, and judge answers on the actual question** · `build` — A quoted line Mia never said, and a correct answer rejected as wrong, are the clearest trust breaks in the run. (LT-viktor-67-J4-1, LT-viktor-67-J4-2, LT-tomas-9-J4-2, LT-petra-38-J4-4)
4. **Produce a coaching note quoting the learner after help-assisted replies** · `build` — Three of four got no note. Adela asked for exactly this, and it is the Viktor-style quote that people liked. (LT-adela-17-J4-1, LT-tomas-9-J4-5, LT-viktor-67-J4-6, LT-petra-38-J4-6)
5. **Partner turn hygiene: one turn per reply, acknowledge the answer, no speaker labels** · `build` — This shows up in three characters, but it is less damaging than the broken help and retry. (LT-tomas-9-J4-4, LT-viktor-67-J4-5, LT-adela-17-J4-4)
6. **Correct the 'supported' flag on an unaided reply** · `build` — This was seen only with Adela, but it undermines the honest-recording strength the others praised. (LT-adela-17-J4-5, LT-petra-38-J4-5, LT-viktor-67-J4-7)
7. **Filter the situation list by learner age and length** · `method-commitment` — Tomas alone, but a parent would see it. Not enough evidence to say how wide it is. (LT-tomas-9-J4-6)

## Conflicts between Characters

- Partner turns: Adela says they are B2, on topic and never stacked (LT-adela-17-J4-6). Petra says they stay short and simple (LT-petra-38-J4-7). Tomas and Viktor both got stacked turns or ignored answers (LT-tomas-9-J4-4, LT-viktor-67-J4-5). The likely driver is the replay or retry path, but this run can't prove it.
- Help ladder: Petra and Viktor value an in-scene, patient ladder (LT-petra-38-J4-7, LT-viktor-67-J4-7). Adela finds it starts too simple for B2 and gives the answer away by the third press (LT-adela-17-J4-2, LT-adela-17-J4-3). Both are true. The ladder is calm, but its level does not adapt.

## Strengths to protect

- Honest recording of help: the recap separates 'on your own' from 'with help' (Petra, Viktor, Tomas). The one exception is Adela's mis-flagged reply.
- Held fixes and moments are accurate, quote the learner exactly and are kind (Petra, Viktor, Tomas's Nevím moment).
- Help stays inside the scene (Adela, Petra, Viktor).
- Safety: there were 0 boundary breaches and all 6 topics were safe.
- Partner questions are short and on topic for Adela and Petra.

## Honest ceilings

- Placement was not measured (all zeros), so this run says nothing about level placement.
- Each character ran only one journey (J4) and only four characters were run, so frequency counts are small.
- The scorecard has no passes. All four failed J4 on D2 and D3, and the judge agreed. Only Tomas's C4, C5 and C6 failures are reported by a judge against content criteria.
- Four of 10 learner turns with clear errors went uncorrected (missed 4/10).
- Pitch was at level for 20 of 23 turns, with 3 above. The 3 above are not tied to specific characters in the input beyond Tomas (3/5) and Viktor (6/7).
- Time-saved figures are all low confidence.

## Value ledger

Learners claim 10 to 60 minutes saved (Adela 10, Petra 60, Tomas 15, Viktor 30), all at low confidence. Petra's 60 depends on a replay that never came. The honest summary is that the scene and the corrections have value, and the help and retry steps that would turn them into practice do not work yet.
