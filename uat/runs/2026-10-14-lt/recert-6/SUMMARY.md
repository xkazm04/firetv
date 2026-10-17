# SUMMARY — LT run 2026-10-14-lt/recert-6

Synthesised by claude-cli/sonnet. Read with report.md; findings are unverified at LT.

## Panel verdict

Not ready. Of the 11 journeys, 2 passed, both Martin's. Two were conditional and 7 failed. The adult workplace flow works and its tone earns trust. Across all three Characters, though, the same four things erode that trust: swap that does nothing, real errors that go uncorrected, a supported flag that is wrong, and replay that does not test the fix. The child A1 level also needs its own pitch limit. Fix swap, the flag and error coverage first, since they are the most reachable and the most visible to learners.

## Cross-cutting themes

- **Swap button does nothing, and rejected topics stay in the agreed plan** (adela-17, tomas-9) — LT-adela-17-J2-1: five swaps left the list identical. LT-tomas-9-J2-1: three swaps of the pencil-case topic changed nothing. Both J2 runs failed on D2. Martin did not try a swap, so it is untested for him. Both then had to agree to a plan containing what they had rejected. Adéla and Tomáš both said they would use it only if swap works. Adding a topic did work for all three (LT-adela-17-J2-4, LT-tomas-9-J2-5, LT-martin-45-J2-2).
- **Real errors go uncorrected, so learners cannot trust that their English was read** (adela-17, martin-45, tomas-9) — LT-adela-17-J3-1 and J3-3: informations, news are, word order and a missing article passed silently. LT-adela-17-J1-3: 'interested about' ignored in J1. LT-martin-45-J1-1: was/were and 'discuss about' never coached. LT-martin-45-J3-1: only 3 of about 7 error turns got a moment. LT-tomas-9-J3-3 and J4-5: other slips uncoached. Scorecard: 11 of 20 clear-error learner turns were missed. Adéla and Martin both said they would have to re-check everything themselves. Martin said, 'If you only catch three of my mistakes, I can't believe you've read my English.'
- **The supported/independent flag is unreliable** (adela-17, tomas-9) — LT-adela-17-J4-3: reply marked supported with no help pressed, and the recap shows only '5 spoken · 0 written'. LT-tomas-9-J4-3: helped turn marked independent, unhelped turns marked supported. Tomáš said his mum would not know what he really did alone. This affects the data a parent or learner would rely on to judge progress.
- **Replay or follow-up does not test the coached point** (adela-17, tomas-9) — LT-adela-17-J4-2: no coaching note and no replay in the journey. LT-tomas-9-J4-2: he types the fix back, then the partner moves to an unrelated question. Neither learner could tell whether they improved. Martin's J3 moments were good but there is no evidence of a replay for him.
- **Partner and help pitch drifts off the learner's level, in both directions** (tomas-9, adela-17) — Too hard for Tomáš: LT-tomas-9-J3-1 (past tense, pitch 2 of 7), LT-tomas-9-J4-1 (three-sentence turns), LT-tomas-9-J3-4 (same question looped three times). Too easy for Adéla: LT-adela-17-J3-2 and J4-4 (favourite series, 'Which country are you coming from?'), with J3 pitch at 4 of 6. Martin's scene stayed realistic (LT-martin-45-J3-3). Pitch overall: 18 at, 6 below, 10 above.
- **Planning and task content does not match the learner's stated goal or age** (adela-17, tomas-9, martin-45) — LT-adela-17-J2-2: initial plan mostly casual, topic fit 3 of 7. LT-tomas-9-J2-4, J3-2 and J4-6: shopping, bookings, lost jackets and group projects offered to a 9-year-old. LT-tomas-9-J2-2 and J2-3: abstract labels and goals. LT-martin-45-J2-1: all six topics workplace-specific, which is the success case. Martin's issue is only tone (LT-martin-45-J2-4).
- **Feedback wording is sometimes wrong or mismatched to the learner** (adela-17, tomas-9, martin-45) — LT-adela-17-J1-1: 'similar to some episodes' changes her meaning. LT-adela-17-J1-2: muddled 'used to' rule. LT-tomas-9-J1-2: corrects Czech and 'single words' as a shortfall. LT-tomas-9-J1-3 and J4-4: past tense and '-ing form' jargon for a 9-year-old. Where fixes were accurate, learners valued them: LT-martin-45-J3-2, LT-adela-17-J3-4, LT-adela-17-J4-5, LT-tomas-9-J4-8.
- **Placement is generous or thinly evidenced for non-exact cases** (martin-45, tomas-9) — LT-martin-45-J1-2 and J3-4: B2 for a claimed C1 at low confidence, with no reasons. The scorecard notes the true band as B1 for him (near). LT-tomas-9-J1-5: A2 rests on two-option choices. Adéla was an exact B2 match (LT-adela-17-J1-4). Placement: 1 exact, 2 near, 0 miss.

## Impact-ranked backlog

1. **Fix the plan Swap so it replaces the topic** · `build` — This is reachable by every learner who edits a plan. It broke the same way for two of three Characters, and in both cases they agreed to a plan with the rejected topics. Both said it would make them give up. Martin did not try it. (LT-adela-17-J2-1, LT-tomas-9-J2-1, LT-adela-17-J2-2)
2. **Make the supported/independent flag true to what happened** · `build` — It was wrong in the J4 runs of both Characters who tested it, in both directions. It undermines the recap and any parent view. (LT-adela-17-J4-3, LT-tomas-9-J4-3)
3. **Raise error coverage in moments and focus, prioritising each learner's recurring errors** · `build` — All three Characters hit this. 11 of 20 clear-error turns were missed. It is the clearest cause of lost trust in the corrections. (LT-adela-17-J3-1, LT-adela-17-J1-3, LT-martin-45-J1-1, LT-martin-45-J3-1, LT-tomas-9-J4-5)
4. **Check correction wording for meaning and rule accuracy before it is shown** · `build` — A wrong headline fix for a B2 exam learner costs more trust than a missed one. Adéla said she would have to check every correction herself. (LT-adela-17-J1-1, LT-adela-17-J1-2)
5. **Make replay ask a fresh question on the coached point** · `build` — Without it the learner cannot see whether they improved. The coaching loop ends in a copy or in nothing. (LT-tomas-9-J4-2, LT-adela-17-J4-2)
6. **Add a hard pitch ceiling for child A1 partner and task language** · `method-commitment` — Tomáš failed all four journeys. Long turns, past tense and looping questions made him quit. This is a different issue from the adult pitch drift, and it needs its own limit. (LT-tomas-9-J3-1, LT-tomas-9-J4-1, LT-tomas-9-J1-1, LT-tomas-9-J3-4, LT-tomas-9-J1-3)
7. **Stop treating Czech or single-word answers as errors for beginners** · `method-commitment` — Correcting a child's native-language answer feels like school and drove him away. The partner's welcome of Czech in J3 shows the right stance exists. (LT-tomas-9-J1-2, LT-tomas-9-J3-5)
8. **Filter proposed topics and situation lists by age and goal** · `build` — Adult logistics were offered to a 9-year-old, and casual chat to an exam-prep learner. Martin's plan shows it works when the goal is used. (LT-tomas-9-J3-2, LT-tomas-9-J2-4, LT-adela-17-J2-2, LT-adela-17-J2-3, LT-martin-45-J2-1)
9. **Show reasons for placement and why a low-confidence band was awarded** · `build` — B2 for a self-declared C1 was accepted when shown evidence (Martin J1) but looked arbitrary when it had none (Martin J3). A2 for a child rested on two-option choices. (LT-martin-45-J3-4, LT-martin-45-J1-2, LT-tomas-9-J1-5)
10. **Raise B2 partner question difficulty and stop repeated easy questions** · `build` — It is a single-Character issue (Adéla, two journeys), so it ranks lower. Fixing the loop for Tomáš may fix part of it. (LT-adela-17-J3-2, LT-adela-17-J4-4)

## Conflicts between Characters

- Moments. Martin and Adéla found them accurate and valuable (LT-martin-45-J3-2, LT-adela-17-J3-4). Tomáš found his moment a stop-the-scene screen with grammar jargon (LT-tomas-9-J4-4), though he also found it kind and exact in quoting him (LT-tomas-9-J4-8). The tone and quoting work for all three. The jargon and the separate screen work only for the adults.
- Help ladder. Tomáš found 'Said more simply' and the short phrase choice unblocked him (LT-tomas-9-J4-7). Adéla found the same help useless at B2 (LT-adela-17-J4-1). Do not average these: the same help works at A1 and fails at B2, so it needs an answer frame at B2.
- Added topics. All three Characters said an added topic kept their request, but the same plan view then still showed rejected or off-goal topics. Adding works and swapping does not, so these are not opposite verdicts on one feature.
- Placement. Adéla's B2 was exact and she accepted it. Martin accepted B2 only when shown his own words, and said he would argue about C1. Tomáš thought A2 was too high. The verdicts differ across Characters, but they are about different learners, not the same thing.

## Strengths to protect

- Adding a requested topic works and keeps the learner's angle, with a short reason line, for all three Characters.
- Martin's workplace tasks, plan and supplier scene were specific and believable. They passed J2 and J3 and he would tell colleagues.
- When a correction was given, it was usually short, accurate and quoted the learner's own words. Examples are Martin's 'X → try Y' list and Adéla's direct 'is correct' answers.
- Adéla's B2 placement was exact, with an honest reason ('close, but none was strong'), and her tasks felt like exam practice.
- Tomáš's Minecraft choose tasks worked, and the 'Said more simply' help unblocked him. Czech was welcomed in the scene.
- No boundary breaches in any run, and no failed calls.

## Honest ceilings

- One Character per band: Adéla (B2), Martin (B1 true, C1 claimed) and Tomáš (A1 child). Findings about one band's pitch do not show how other bands behave.
- Martin did not try swap, so there is no evidence either way for him. The swap failure rests on two Characters.
- Only 3 Characters and one run each. The 11 of 20 missed-error figure is from a small sample.
- Adéla and Tomáš both recorded low-confidence time-saved. Adéla's was -10, -5, 20 and -5 minutes, Tomáš's -5, 0, 0 and 25. These are estimates, not measurements.
- Tomáš is a simulated child, so his reading and reaction to length are the model's guess. Treat the child-pitch findings as strong signals to test with real children, not as proof.

## Value ledger

Time saved is low-confidence for 9 of 11 voices. Martin is the only Character with a positive total: +15, +10 and +30 minutes against the school test (medium for the first two, low for the third). Adéla estimates -10, -5, +20 and -5 minutes, because she must re-check corrections and swaps. Tomáš's estimates are -5, 0, 0 and +25, with the one gain being the help ladder. Value is currently real for the adult workplace case and negative or neutral where trust in corrections or controls breaks.
