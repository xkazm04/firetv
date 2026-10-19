# SUMMARY — LT run 2026-10-17-lt-swap-2/recert-8

Synthesised by claude-cli/sonnet. Read with report.md; findings are unverified at LT.

## Panel verdict

["All four J4 runs failed. The scenes, safety and exact-quote moments work. Help and replay do not: cues repeat or miss the scene, replay never tests the fix, and about half of the clear errors go unflagged. Fix replay and help first. Ship nothing that claims 'tried again' until replay is real."]

## Cross-cutting themes

- **Help cue is repeated and does not answer the live scene** (petra-38, tomas-9, viktor-67, adela-17) — All four had weak help. Petra: same 'Try: Excuse me...' cue at #3, #4, #5 (LT-petra-38-J4-3). Tomas: same long cue three times (LT-tomas-9-J4-1) and a simplified line that just repeats the question (LT-tomas-9-J4-5). Viktor: 'Try: What did you do at school today?' stayed on screen after Mia asked about drawing (LT-viktor-67-J4-1), and the quiz was off-scene (LT-viktor-67-J4-2). Adela: simplified question first, B2 frame late and thin (LT-adela-17-J4-2). The D2 fails for Petra and Viktor say the same. Four of four Characters hit it, and help is one button press away.
- **'Try it again' does not replay the coached fix, so no improvement is shown** (adela-17, petra-38, tomas-9, viktor-67) — replay.used was false for all four. Adela's retry never used 'often' and the recap quote was cut off (LT-adela-17-J4-1). Petra got a new question and repeated 'other room' (LT-petra-38-J4-1). Tomas said 'nevím' again (LT-tomas-9-J4-3). Viktor's answer kept a plural slip (LT-viktor-67-J4-4). Recap labels these as 'Tried again' anyway, which overclaims. This failed D3 for all four.
- **Clear learner errors pass with no moment or coaching** (adela-17, petra-38, viktor-67) — The run counts 8 missed clear errors across 17 learner turns with clear errors. Adela's 'not used to go to bed' passed silently (LT-adela-17-J4-3). Petra's 'other room' and 'I think is not repair' were missed (LT-petra-38-J4-2). Viktor had five of seven errors held with coaching null, and 'Red, small time' got a 'Nice!' (LT-viktor-67-J4-5). Adela and Viktor said they would have to re-check everything themselves.
- **Moment and recap targeting and wording are inconsistent** (petra-38, tomas-9, adela-17) — Petra's recap quotes turn 1, not where she was stuck (LT-petra-38-J4-4), and the single moment fixed a sentence she never needed at the desk. Tomas's held-fix explanations were misleading (LT-tomas-9-J4-4). Adela's recap quote was cut mid-sentence. The moments are exact when they fire (see strengths) but the follow-up around them is sloppy.
- **Honest support recording and exact-quote moments earn trust** (adela-17, petra-38, tomas-9, viktor-67) — All four have a strength finding: exact quotes in moments (LT-tomas-9-J4-6, LT-petra-38-J4-6, LT-viktor-67-J4-6, LT-adela-17-J4-5) and honest supported counts (LT-petra-38-J4-5, LT-adela-17-J4-6, LT-viktor-67-J4-7). This is the base to protect.

## Impact-ranked backlog

1. **Make 'Try it again' actually replay the coached phrase** · `build` — Every Character failed D3. Without a real replay there is no evidence of improvement, and the recap labels non-replays as 'Tried again'. That is the most trust-eroding gap and everyone reaches it. (LT-adela-17-J4-1, LT-petra-38-J4-1, LT-tomas-9-J4-3, LT-viktor-67-J4-4)
2. **Make help cues scene-aware and different on each press** · `build` — All four met repeated, restated or off-scene cues. Help is one press away, so it is the most reached feature, and it is where learners said they stopped trusting the tool. (LT-viktor-67-J4-1, LT-viktor-67-J4-2, LT-tomas-9-J4-1, LT-tomas-9-J4-5, LT-petra-38-J4-3, LT-adela-17-J4-2)
3. **Catch more clear errors: surface or hold-then-show them** · `build` — 8 of 17 clear-error turns were missed, and 'Nice!' on 'Red, small time' teaches the wrong thing. Three Characters hit this. (LT-adela-17-J4-3, LT-petra-38-J4-2, LT-viktor-67-J4-5)
4. **Fix recap quotes and held-fix explanations** · `build` — Cut-off quotes, quotes of the wrong turn and misleading grammar notes lower trust in an otherwise exact feature. (LT-adela-17-J4-1, LT-petra-38-J4-4, LT-tomas-9-J4-4)
5. **Keep help at the learner's level (A1 past tense, B2 frame first)** · `method-commitment` — Viktor was given past-tense help at A1. Adela got a B2 frame only on the third press. Pitch misses show up at both ends of the range. Pitch score: 25 at, 2 below, 4 above. (LT-viktor-67-J4-3, LT-adela-17-J4-2)
6. **Trim the situation list and stop stacking partner questions** · `decline-with-reason` — Each was seen by one Character only, so they rank low. Tomas found 20 mixed entries. Adela saw one question dropped. (LT-tomas-9-J4-2, LT-adela-17-J4-4)

## Conflicts between Characters

- No Character reached opposite verdicts on the same thing. Closest: Adela said the moment was exact and useful while noting 'not used to go' got nothing. That is a coverage gap, not a conflict.

## Strengths to protect

- Moments quote the learner's own words exactly and stay kind (Tomas, Petra, Viktor, Adela).
- Support is flagged, so the recap counts are honest: Petra '3 on your own · 1 with help', Adela '2 on your own · 3 with help'.
- Topic fit is good: 5 of 6 fit, 6 of 6 safe, 0 boundary breaches, 0 failed calls.
- Scenes felt on topic and partners were short and slow (Petra, Tomas, Viktor).
- The 'eventually' false-friend explanation was clear (Adela).

## Honest ceilings

- The run has only four Characters, all on J4, so cross-journey claims can't be made.
- Placement metrics are all zero, so level placement was not tested.
- Judge agreement is 0 of 0. Judge verdicts differed from the Character verdict for Petra (conditional vs fail).
- Time-saved estimates are low confidence for every Character.
- Viktor ended character-stopped, so his run is incomplete.

## Value ledger

["Learners would reuse it for topic practice (Viktor: garden words; Tomas: dog talks; Adela: would try again). Claimed time saved is 20 to 60 minutes, all low confidence. None would rely on it yet: Adela would not replace her tutor and Viktor would not trust the help button. Value is held back by help and replay, not by scene choice."]
