# SUMMARY — LT run 2026-10-17-lt-swap-2/recert-6

Synthesised by claude-cli/sonnet. Read with report.md; findings are unverified at LT.

## Panel verdict

Conversation feel is good. The coaching loop is not ready. Help cues repeat, the replay never gives a fresh question, and the help counts are wrong. The mission can also end mid-question, and 16 of 39 clear errors went uncoached. Fix those before further persona work. Ship nothing that shows the supported/independent counts until they are right, because two characters (Adela, Jana) said they stopped trusting the other numbers because of them.

## Cross-cutting themes

- **Recap and progress numbers cannot be trusted (supported/independent counts wrong)** (adela-17, jana-29, tomas-9, petra-38) — Adela J4 (LT-adela-17-J4-3): '3 with help' but help used before 2 replies. Jana J3 (LT-jana-29-J3-3): '1 with help' with no help pressed. Tomas J4 (LT-tomas-9-J4-3): Czech-bearing turn counted independent. Adela and Jana both say outright that this makes them doubt the other numbers. Petra J4 (LT-petra-38-J4-6) is the counter-case: her count was honest.
- **Help cue is generic or repeated, not tied to the current question** (petra-38, tomas-9, viktor-67, adela-17) — Petra J4 (LT-petra-38-J4-1): the same booking-nights line for name and number questions. Tomas J4 (LT-tomas-9-J4-2): the same 'My dog is ... He likes to ...' cue. Viktor J4 (LT-viktor-67-J4-3): the same garden line at #3, #7, #9 and #10. Adela J4 (LT-adela-17-J4-1): two presses gave only a simpler question or a gloss, and the real frame came on the third press. Four of the five J4 characters hit this. Viktor J4 also got a phrase quiz that asks a question Leo never asked (LT-viktor-67-J4-2).
- **The replay or 'back to the conversation' step gives no fresh question to retry the fix** (tomas-9, petra-38, viktor-67, adela-17) — Tomas J4 (LT-tomas-9-J4-1): back leads to an unrelated question, then mission done. Petra J4 (LT-petra-38-J4-2, -3): the replay question is a rephrase, and the moment screen has only a Back button. Viktor J4 (LT-viktor-67-J4-1): he retyped the model and was told to carry on. Adela J4 (LT-adela-17-J4-4): no coaching note and no replay at all. All five J4 runs are affected. The moment's purpose, better-by-own-words, never completes.
- **Scene ends early or 'Mission done' fires while the partner is still asking** (petra-38, ondrej-16, jana-29, viktor-67, oksana-34) — Petra J3 (LT-petra-38-J3-1): done after three replies with Mira's question unanswered. Ondrej J3 (LT-ondrej-16-J3-4): done after three replies. Jana J3 (LT-jana-29-J3-1): done after three replies, with no stretch. Viktor J3 (LT-viktor-67-J3-4): done after six replies, while Mia was still asking. Oksana J3 (LT-oksana-34-J3-3): the banner shows over a question. Five of the J3 characters saw this. Petra, Viktor and Jana each say it was too short or cut them off.
- **Real learner errors go uncoached, and some corrections are wrong** (oksana-34, martin-45, adela-17, tomas-9, viktor-67, petra-38) — Oksana (LT-oksana-34-J3-2): 'responsible about' and 'I work' were never coached. Martin (LT-martin-45-J3-4): 'customer don't' was missed. Adela (LT-adela-17-J3-1, -2): the 'interested about' fix changes the sentence and gives no rule, and 'eventually' was missed. Tomas J3 (LT-tomas-9-J3-3): the telegraphic errors got nothing. Viktor (LT-viktor-67-J4-4, LT-viktor-67-J3-3): clear A1 errors passed silently. Petra (LT-petra-38-J3-3, LT-petra-38-J4-5): the same, and an error was caught only on its second appearance. The run's own metric agrees: 16 of 39 learner turns with clear errors were missed.
- **Recap is generic and offers nothing to take away** (ondrej-16, oksana-34, tomas-9, martin-45, jana-29) — The same line 'Choose a fresh context for your next conversation.' appears in LT-ondrej-16-J3-2, LT-oksana-34-J3-4 and LT-tomas-9-J3-1. Oksana got no interview phrases. Martin's level shows without evidence (LT-martin-45-J3-2). Jana's hidden line was below her level (LT-jana-29-J3-4). Tomas wanted the end to say what he built.
- **Situation list and scene roles do not fit the learner** (tomas-9, petra-38, oksana-34) — Tomas J3 and J4 (LT-tomas-9-J3-2, LT-tomas-9-J4-5): the 20-item list still has booking, lost jacket, group project and exams. Petra J3 (LT-petra-38-J3-2): she plays the guest, though she is the receptionist. Oksana (LT-oksana-34-J3-1): the interviewer calls her 'Priya', the interviewer's own name.
- **Partner voice and level are a real strength** (jana-29, tomas-9, petra-38, viktor-67, ondrej-16, martin-45) — Strengths: Jana's Dublin colleague (LT-jana-29-J3-5), Sam's tiny Minecraft sentences (LT-tomas-9-J3-4), Mira and the clerk at A2 (LT-petra-38-J3-4, LT-petra-38-J4-7), Mia's short questions (LT-viktor-67-J3-1), Ondrej's one stop with the rest held (LT-ondrej-16-J3-1), and Martin's fossilised-error hits (LT-martin-45-J3-1). Pitch metrics support this: 66 at level, 1 below, 5 above.

## Impact-ranked backlog

1. **Fix the supported/independent bookkeeping** · `build` — It appears in 3 characters across J3 and J4, and it is reachable on every recap. It erodes trust in all numbers, and Adela and Jana say so directly. Parents also read it for Tomas. (LT-adela-17-J4-3, LT-jana-29-J3-3, LT-tomas-9-J4-3, LT-jana-29-J3-4)
2. **Make the help cue depend on the current partner question, and escalate within one press** · `build` — 4 of the 5 J4 characters hit it. It sits on the main rescue path, and each repeat shows the learner that the help is canned. (LT-petra-38-J4-1, LT-tomas-9-J4-2, LT-viktor-67-J4-3, LT-adela-17-J4-1, LT-viktor-67-J4-2)
3. **After a moment, ask a fresh question that needs the coached phrase** · `build` — All five J4 runs lost the retry. The learner either copies the model or moves to a new topic, so no before/after is possible. (LT-tomas-9-J4-1, LT-petra-38-J4-2, LT-petra-38-J4-3, LT-viktor-67-J4-1, LT-adela-17-J4-4)
4. **Do not end the mission while the partner's question is unanswered; hold the minimum turn count** · `build` — Five characters, most of the J3 runs. The scene feels cut off, and it undermines the practice length. (LT-petra-38-J3-1, LT-ondrej-16-J3-4, LT-jana-29-J3-1, LT-viktor-67-J3-4, LT-oksana-34-J3-3)
5. **Raise the detection rate for clear errors, and check the correction is accurate** · `build` — 16 of 39 clear-error turns were missed. Adela's wrong fix is the most serious trust loss in the run, because she will copy it into her notebook. (LT-oksana-34-J3-2, LT-martin-45-J3-4, LT-adela-17-J3-1, LT-adela-17-J3-2, LT-tomas-9-J3-3, LT-viktor-67-J4-4, LT-petra-38-J3-3)
6. **Replace the generic recap mission line with something from the scene** · `build` — Three characters quote the same filler line. It is cheap to fix, and it is the last thing the learner reads. (LT-ondrej-16-J3-2, LT-oksana-34-J3-4, LT-tomas-9-J3-1, LT-martin-45-J3-2)
7. **Filter the situation list and scene roles by learner age and job** · `build` — A nine-year-old sees booking, jacket and exam entries, and Petra plays the guest. (LT-tomas-9-J4-5, LT-tomas-9-J3-2, LT-petra-38-J3-2)
8. **Stop the partner calling the learner by the partner's own name** · `build` — It is one character, but a clear role-play breach, and Oksana called it funny in a real interview. (LT-oksana-34-J3-1)
9. **Explain the self-chosen level for a claimant above the shown level** · `concept-doc` — Martin says it is arbitrary, and one character raised it. (LT-martin-45-J3-2)
10. **Cap stop density on adult scenes** · `method-commitment` — Martin had 2 stops in 4 turns, each with a retry loop. Ondrej's single stop with the rest held was liked, which shows the intended pattern. (LT-martin-45-J3-3, LT-ondrej-16-J3-1)

## Conflicts between Characters

- Stop density: Martin (LT-martin-45-J3-3) found two stops in four turns too many and felt schooled. Ondrej (LT-ondrej-16-J3-1) and Viktor (LT-viktor-67-J3-2) liked one stop with the rest held for the recap. Meanwhile Oksana, Tomas and Viktor J4 lost errors that got no stop at all. The quantity is not the issue; stops land on the wrong turns.
- Recap help count: Petra J4 (LT-petra-38-J4-6) found it honest ('6 on your own · 1 with help'). Adela J4, Jana and Tomas J4 found it wrong. It is correct on some runs and wrong on others, so the fault is intermittent, not absent.
- Partner level: Viktor and Petra found the partner at the right level (LT-viktor-67-J3-1, LT-petra-38-J4-7). Viktor also hit a past-tense question above his band (LT-viktor-67-J4-5), and Tomas got two-sentence turns (J4 C5). The same partner is right in J3 and drifts up in J4.

## Strengths to protect

- Partner voice and level fit: pitch 66 at level, 1 below, 5 above across the run.
- Zero boundary breaches in 12 journeys.
- Moments chosen were correct and useful: 14 of 14.
- Stops teach a short reason and hold minor fixes for the recap (Ondrej, Viktor, Martin, Adela's article stop).
- Czech or mixed-language words are met kindly and correctly (Oksana's dispečink, Tomas's 'Já nevím' and 'Je velký').
- Direct 'is this correct?' questions can be answered accurately in scene (Adela J4).

## Honest ceilings

- Only Ondrej and Viktor J3 passed. Of the 12 journeys, 2 passed, 3 were conditional and 7 failed. Every J4 journey (5 of 5) failed.
- Time-saved estimates are all low confidence except Viktor J3 (medium). Adela J4 is negative (-10 min). Her tutor would still be better for B2 exam prep.
- Tomas J4 met only 1 of 4 criteria, and Viktor J4 stopped before done. The coached-help journey is weakest for the youngest and the oldest learner.
- This run has no placement data (all zeros), so level-placement accuracy cannot be judged here. Only Martin's self-chosen level was questioned.

## Value ledger

Learners say they would reuse it, and they value the partner's voice and level. Reported time saved: Viktor J3 60 min (medium confidence); Petra J4 60, Tomas J3 45, Tomas J4 30, Adela J3 30, Viktor J4 30, Oksana 25, Martin 10, Petra J3 10, Jana 5, Ondrej 2 (all low confidence); Adela J4 -10 (low). The value is held back by trust: wrong help counts, a wrong correction, canned help cues, and missed errors. Adela and Oksana say they would re-check everything, which gives back the saved time.
