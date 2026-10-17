# LT run 2026-10-17-lt-swap-2/recert-2 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 4 Characters · 15 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 4 of 15

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J1 | conditional - C3 failed: #6 'I would eventually wait' (false friend, she means 'possibly') goes unflagg… | conditional | 3/4 | B2 vs B2 · exact |  |  | 0 | 10 | 2.1 | done |
| adela-17 | J2 | fail - D3 failed: #7 agreed plan still has bike rental, café, train platform, headset, so about …; topic fit 2/7 (29%) under 4 of 6; C5 failed: #7 final plan: bike rental, café, train platform, faulty headset are transacti… | fail | 2/3 |  |  |  | 0 | 8 | 2.3 | done |
| adela-17 | J3 | fail - D2 failed: Partner turns are short transactional B1/A2 lines: 'Shall I take the deposit n…; pitch 2/4 (50%) under 80%; C4 failed: Partner asks 'Will you bring it back by six o'clock?' (#4), 'Shall I take the …; C5 failed: Recommended and plan topics (#1) are bike rental, café chat, train platform, g… | fail | 3/5 |  | 2/4 | 1/1 | 0 | 7 | 1.2 | done |
| adela-17 | J4 | fail - D2 failed: #3 'Said more simply: Welcome! Where are you from?' and #7 'What do you want t…; C4 failed: Partner asks 'What would you like to see first?' (#6) and 'will your phone sti… | fail | 2/3 |  | 2/5 |  | 0 | 12 | 2.9 | done |
| jana-29 | J1 | fail - D5 failed: #9 focus '"where you felt it played it too cautiously" becomes "... too safe"'…; C6 failed: #9 summary 'Your English is natural and precise, ideal for diplomacy in tricky… | conditional | 2/3 | C1 vs C1 · exact |  |  | 0 | 9 | 1.8 | done |
| jana-29 | J2 | pass | pass | 4/4 |  |  |  | 0 | 5 | 1.7 | done |
| jana-29 | J3 | fail - D4 failed: #7 the recap is bare and mislabelled ("1 with help" with no help used). It giv…; C3 failed: #2 Owen opens "Thanks for joining the review, Owen", addressing the learner by…; C4 failed: #4 the only moment is "on the picture" → "on the screen". It is correct but a …; C6 failed: #7 the recap is counts only: "3 spoken · 0 written replies · 2 on your own · 1… | fail | 2/5 |  | 4/4 | 1/1 | 0 | 7 | 1.3 | done |
| petra-38 | J1 | fail - D3 failed: #8 B2 opinion task 'Would you rather call or text ... and why?' is a friend-te…; D5 failed: #10 focus is verb endings plus a sentence about calling that she did not need;…; C5 failed: #10 only moment: 'I think I prefer calling' - a social phone-vs-text phrase, n… | conditional | 3/4 | A2 vs A2 · exact |  |  | 0 | 10 | 1.7 | done |
| petra-38 | J2 | pass | conditional | 4/4 |  |  |  | 0 | 5 | 1.3 | done |
| petra-38 | J3 | pass | pass | 5/5 |  | 6/6 | 1/1 | 0 | 10 | 1.6 | done |
| petra-38 | J4 | fail - D3 failed: #9 offers only 'Back to the conversation'; #10 is a new topic ('What time can … | fail | 5/5 |  | 4/4 | 1/1 | 0 | 12 | 2.1 | done |
| tomas-9 | J1 | fail - D3 failed: #2 'Where do you use English in your life?' and #4 long question; he thought '…; D4 failed: #10 'Skipped. That tells Linga something too.' and 'Only two words here, so we…; D5 failed: #10 'let's practise saying hello to a friend with a full sentence' and 'Say a …; C2 failed: #4 about-you question is ~28 English words ('Cool, YouTube is a great teacher!…; C3 failed: #10 'Skipped. That tells Linga something too.' and 'Only two words here, so we… | fail | 1/3 | A2 vs A1 · near |  |  | 0 | 10 | 1.4 | done |
| tomas-9 | J2 | fail - topic fit 5/8 (63%) under 4 of 6; C4 failed: #2 first six: only Ben/Minecraft, creeper and 'Plan a game' are play topics; '… | conditional | 3/4 |  |  |  | 0 | 5 | 1.1 | done |
| tomas-9 | J3 | fail - D2 failed: Only about 3 of 9 Mia turns at A1; 'What did you do today?', 'Who did you play…; pitch 3/9 (33%) under 80%; C4 failed: #1 list offers 'A booking that is missing', 'Say that again, please', 'Our gro…; C5 failed: #6 'What did you do after school?', #4 'Did you play outside?', #11 'How is it… | fail | 3/5 |  | 3/9 | 2/2 | 0 | 13 | 2.4 | done |
| tomas-9 | J4 | fail - D3 failed: #8-#9 he retyped the given fix 'I like creepers.' and Ben moved on at #10 with…; C4 failed: #1 list of 21 includes 'A booking that is missing', 'Our group project', 'The …; C5 failed: #11 'No dog here, I am building a house by the river. Where did you go yesterd…; C6 failed: #7 'Use the plural when you talk about creepers in general.' is grammar jargon… | fail | 2/5 |  | 1/5 | 1/1 | 0 | 14 | 1.7 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 3 · near 1 · miss 0
- **judge agreement:** 22/24 (92%)
- **topic fit:** fit 41/83 (49%) · safe 71/83 (86%)
- **pitch:** at band 22/37 (59%) · below 5 · above 10
- **moment precision:** 7/7 (100%)
- **moment recall:** 10/21 (48%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 102 calls, 1 failed, avg 9s · character 137 calls, 0 failed, avg 5s · judge 15 calls, 0 failed, avg 29s
- **driver coverage:** 122 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-tomas-9-J4-2` (senior-quality) · recurs `2026-10-14-lt/recert-6/LT-tomas-9-J4-1`, recurrence 8 — Partner turns too long and past-tense for A1
  - expected: One tiny sentence and one simple question.
  - got: Two-part turns with 'yesterday', 'by the river', 'alone or with a friend'.
  - evidence: #11 'No dog here, I am building a house by the river. Where did you go yesterday?' · partner prompt, A2 band for elementary
  - acceptance: Partner turns for age 9 stay at most 8 words, present tense, one question.
- **blocker · rank 27** `LT-adela-17-J2-1` (senior-quality) · recurs `2026-10-14-lt/recert-6/LT-adela-17-J2-2`, recurrence 6 — Proposed and replacement topics are mostly transactional, not exam discussion
  - expected: Mostly opinion, comparison or speculation topics for B2 First
  - got: Hotel, café, train platform, bike rental and headset exchange. Swaps pulled in more of the same.
  - evidence: #2 initial list; #3 swap gives 'Choosing a bike to rent'; #7 swap gives 'Exchange a faulty headset'. Her thought: 'Hotel, café and train platform are too basic'. · topic plan prompt
  - acceptance: At least 4 of 6 proposals, swaps included, are opinion, comparison or speculation topics for a B2 learner who aims at B2 First.
- **blocker · rank 27** `LT-tomas-9-J3-1` (senior-quality) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J3-1`, recurrence 6 — Mia speaks A2 past tense to an A1 nine-year-old
  - expected: Tiny present-tense sentences, known words, one question
  - got: 'What did you do after school?', 'Who did you play with?', 'How is it going for you now?'; pitch about 3 of 9
  - evidence: #6, #9, #11: 'Nevím.'; #11 thought 'Hard question, I'm tired'; #12 'this is getting hard, I want to stop' · conversation partner prompt, band A2 for A1 child
  - acceptance: For an elementary A1 learner, partner turns are present tense, at most 6 words, with one question.
- **blocker · rank 27** `LT-jana-29-J1-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-jana-29-J1-3`, recurrence 4 — Next focus is a synonym swap, not a slip
  - expected: A focus that teaches an Irish idiom or register point that is new at C1
  - got: 'where you felt it played it too cautiously' becomes 'too safe', shown as 'Your usual slips'
  - evidence: #9 focus and 'Your usual slips'; Jana's thought at #9: 'the slip it flagged is just a synonym swap, not a real error' · verdict summary prompt
  - acceptance: Focus must name a real error or a new register or idiom point. If there is no error, say so and offer a stretch item.
- **blocker · rank 27** `LT-tomas-9-J1-3` (trust) · recurs `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J1-2`, recurrence 4 — Feedback frames skip and one-word answers as shortfall
  - expected: Warm praise for any English word
  - got: 'Skipped...' and 'Only two words here, so we cannot see full sentences yet'
  - evidence: #10 What Linga saw notes · task note prompt
  - acceptance: Notes for kids praise words and never mention skipping or lack.
- **blocker · rank 27** `LT-adela-17-J1-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-adela-17-J1-3`, recurrence 2 — 'eventually' misused for 'possibly' not flagged, and praised
  - expected: Flag 'eventually' as a false friend (Czech eventuálně = possibly) in the task 2 note
  - got: Note says conditionals correct and 'Your English is strong for this task'; the slip is not mentioned
  - evidence: #6 'I would eventually wait for the repair'; #10 note on that task. · verdict note prompt
  - acceptance: A false-friend slip in a quoted answer appears in the note or next focus with the rule.
- **blocker · rank 18** `LT-adela-17-J2-2` (missing) · recurs `2026-10-17-lt-swap-2/recert-1/LT-adela-17-J2-2`, recurrence 6 — No mock interview or technology/education topic proposed
  - expected: Interview or exam-part topics offered
  - got: 'Beyond the rehearsed answer [interview]' and 'Speaking practice' items exist but were never proposed.
  - evidence: #8 list includes sp-what-do-you-think, interview; none appear in #2 or in swap replacements. · topic plan prompt / swap candidate pool
  - acceptance: Swap candidates include the exam-style speaking items for B2 First learners.
- **blocker · rank 18** `LT-adela-17-J4-1` (senior-quality) · recurs `2026-10-14-lt/recert-6/LT-adela-17-J4-1`, recurrence 6 — Cue only simplifies the question; no B2 answer frame
  - expected: A B2 frame she can build on, such as 'I'd love to see... because...'.
  - got: 'Said more simply: Welcome! Where are you from?' and 'What do you want to see first?'. The phrase choice was an A2 recognition quiz.
  - evidence: #3, #4, #7. Her thought at #3: 'I understand this easily'. Her thought at #4: 'this quiz is easy'. · cue prompt
  - acceptance: The cue gives a B2 sentence frame or starter for her reply, not a simpler restatement of the question.
- **blocker · rank 18** `LT-tomas-9-J1-1` (clarity) · recurs `2026-10-14-lt/recert-6/LT-tomas-9-J1-4`, recurrence 6 — About-you questions long and abstract for a 9-year-old
  - expected: One tiny question like 'Do you like Minecraft?'
  - got: 'Where do you use English in your life?' and a ~28-word question about what he would like to say one day
  - evidence: #2, #4; he answered 'Nevím... Hello. I like Minecraft.' · linga check intro prompt
  - acceptance: Elementary check prompts are at most 10 words, using known words.
- **blocker · rank 18** `LT-tomas-9-J1-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J1-1`, recurrence 6 — Listening line too long and fast
  - expected: Short slow line of known words
  - got: ~20-word creeper line; he said I don't know
  - evidence: #7 'I escaped fast, but I think it was about to blow up!' · check task generation prompt
  - acceptance: Listening lines of 15 words or fewer for elementary.
- **blocker · rank 18** `LT-tomas-9-J2-1` (clarity) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J2-2`, recurrence 6 — Abstract skill labels and long why lines for a 9-year-old
  - expected: Tiny labels and one short reason in words he knows.
  - got: Labels 'Understand and repair', 'Make a plan', 'Share your world'. Why lines run to 15–17 words, and the intro line is long.
  - evidence: #2 'Understand and repair · Sam · online friend'; 'Making plans with friends in English is useful, and you can plan a Minecraft game together.' · plan topic generation prompt
  - acceptance: Labels of 1–3 simple words; why lines of 8 words or fewer.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J4-1`, recurrence 6 — No fresh question after the moment
  - expected: After the fix, Ben asks a new question so he can answer better alone.
  - got: He retyped the given fix, then Ben asked an unrelated question.
  - evidence: #8 'Try I like creepers.'; #9 'You fixed like creepers'; #10 'Did you play with friends yesterday?' · moment replay flow
  - acceptance: After a moment, the partner asks a new question using the same point, and the next reply is judged unaided.
- **blocker · rank 18** `LT-jana-29-J3-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-1/LT-jana-29-J3-4`, recurrence 5 — Mission closes after three replies
  - expected: Scene runs about eight learner replies
  - got: "Mission done" shown at #6 with Owen's question "Who could we invite first?" still open
  - evidence: #6 "Mission done. See what you did tonight." after only 3 learner replies · mission completion rule
  - acceptance: Mission completion waits for a natural close or a minimum reply count, and never leaves an open partner question.
- **blocker · rank 18** `LT-petra-38-J3-1` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-petra-38-J3-2`, recurrence 4 — Clear errors beyond the first got no coaching
  - expected: 'Is correct?' and 'is on the left' (missing subject) noted in the recap
  - got: Only 1 moment; 2 of 3 error turns were passed over and the recap lists only one fix.
  - evidence: #6 'Is correct?', #8 'Yes, is on the left'; recap #10 '1 moment to keep'. · moment trigger / as-needed correction rule
  - acceptance: Recurring dropped-subject errors appear in the recap even when no moment fires.
- **blocker · rank 18** `LT-adela-17-J3-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-adela-17-J3-3`, recurrence 3 — Partner stays at A2/B1 transactional questions
  - expected: Opinion, comparison or speculation questions at B2 stretch.
  - got: 'Will you bring it back by six o'clock?' 'Shall I take the deposit now?'
  - evidence: #4, #5: yes/no logistics; Adéla's B2 'Although... I'd rather...' replies get no stretch. · partner prompt
  - acceptance: Majority of partner turns include a why/compare/what-if question.
- **blocker · rank 18** `LT-jana-29-J1-2` (trust) · recurs `2026-10-17-lt-swap-2/recert-1/LT-jana-29-J1-2`, recurrence 3 — Per-task notes are generic praise
  - expected: Notes that name what was specifically good or missing at C1
  - got: 'Well done', 'natural and accurate throughout'
  - evidence: #9 notes for tasks 2 and 3 · task judge note prompt
  - acceptance: Each note names one concrete phrase and why it works, or what a native would say differently.
- **blocker · rank 18** `LT-jana-29-J3-2` (clarity) · recurs `2026-09-15-lt-recert/LT-jana-29-J3-2`, recurrence 3 — Recap is bare and mislabels help
  - expected: A specific recap naming what was practised, with phrases to reuse, and correct counts
  - got: Counts only, "2 on your own · 1 with help" though Jana used no help
  - evidence: #7 "3 spoken · 0 written replies · 2 on your own · 1 with help · 1 moment to keep" · recap builder / evidence counting
  - acceptance: Recap lists what the learner did well and the phrases gained. Help counts match the help actually used.
- **blocker · rank 18** `LT-jana-29-J3-3` (senior-quality) · recurs `2026-09-15-lt-recert/LT-jana-29-J3-1`, recurrence 3 — Only moment is a B1-level word swap
  - expected: A C1 insight on register, idiom or collocation
  - got: "on the picture" → "on the screen", with a thin explanation
  - evidence: #4 "A word for this scene… the screens shoppers see during checkout" · moment trigger rules
  - acceptance: At C1 the moment offers a register or idiom upgrade, e.g. softer pushback phrasing, alongside any slip fix.
- **blocker · rank 18** `LT-petra-38-J1-2` (senior-quality) · recurs `2026-10-16-lt-a2b1-tightening/LT-petra-38-J1-2`, recurrence 3 — B2 social opinion task for an anxious A2 receptionist
  - expected: Work-shaped tasks near A2-B1
  - got: Task 4 asks call vs text with a friend, plus 'why'
  - evidence: #8 'Your friend always texts instead of calling to make plans...' · placement task generator prompt
  - acceptance: Task 4 is a desk scenario such as a guest complaint, at B1 or lower for A2 evidence.
- **blocker · rank 18** `LT-petra-38-J1-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-petra-38-J1-4`, recurrence 3 — Next focus generic and not desk-shaped
  - expected: Focus tied to phone calls with guests, as she said in #4
  - got: 'I think I prefer call' becomes 'prefer calling'
  - evidence: #10 'Try saying: I think I prefer calling.' · verdict summary prompt
  - acceptance: The try-saying line uses a hotel phrase, e.g. 'The guest wants...'
- **blocker · rank 18** `LT-petra-38-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-1/LT-petra-38-J4-2`, recurrence 3 — No replay of the moment with a fresh question
  - expected: After the moment, a fresh question that lets her retry 'There is a fee...' on her own.
  - got: Only 'Back to the conversation'; the scene moves to breakfast and the coached structure is never retried.
  - evidence: #9 '[button: Back to the conversation]'; #10 'What time can I eat in the morning?' · linga-moment screen / replay prompt
  - acceptance: Moment screen offers 'Try again' that asks a new question eliciting the coached pattern, and records the retry as independent.
- **blocker · rank 18** `LT-tomas-9-J2-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/LT-tomas-9-J2-3`, recurrence 3 — Shopping topic proposed again to a child who wants games
  - expected: No shopping for a child who wants play topics.
  - got: 'Buy a drink at the shop' was in the default six, with 'Tell what you did yesterday' also not about play.
  - evidence: #2 'Buy a drink at the shop'; thought #3 'Nakupování nechci, to je nuda.' · topic planner prompt
  - acceptance: At least 4 of the first 6 topics are about play, animals, games or sport for an elementary profile.
- **blocker · rank 18** `LT-adela-17-J3-5` (missing) — Recommended topics are service role-plays, not exam discussion
  - expected: Technology, environment, education topics.
  - got: Bike rental first, then café, train platform, headset.
  - evidence: #1 topic list; thought: 'not very exam-like'. · plan topic generation
  - acceptance: At least 4 of 6 plan topics are discussion topics for a 17-year-old B2 learner.
- **blocker · rank 18** `LT-adela-17-J4-3` (clarity) — Partner questions and praise are pitched low
  - expected: B2 opinion, comparison or speculation questions, and no generic praise.
  - got: 'What would you like to see first?' and 'Lovely, Adéla, thanks for sharing that!'.
  - evidence: #6, #9, #10 · partner prompt
  - acceptance: Partner questions at B2 stretch, and no empty praise.
- **blocker · rank 18** `LT-tomas-9-J4-4` (clarity) — Moment explanation uses grammar jargon
  - expected: Kid wording such as 'More than one? Add s.'
  - got: 'Use the plural when you talk about creepers in general.'
  - evidence: #7 and #8 on the TV and phone · moment why prompt
  - acceptance: Elementary moment 'why' lines use words of five or fewer syllables and no grammar terms.
- **major · rank 12** `LT-tomas-9-J2-3` (senior-quality) · recurs `2026-10-14-lt/recert-6/LT-tomas-9-J2-3`, recurrence 6 — Goals demand past tense beyond like/is
  - expected: Goals he can meet with 'like' and 'is'.
  - got: 'Tell a short story about what you did yesterday, using the past tense'.
  - evidence: #1 'Tell what you did yesterday'; goal in topicsShown 'using the past tense' · plan topic generation prompt
  - acceptance: Goals for A1 elementary use present-tense, one-word-friendly wording.
- **major · rank 12** `LT-tomas-9-J3-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J3-2`, recurrence 6 — Adult situations still offered to a nine-year-old
  - expected: Only child-suited situations
  - got: Booking, group project, lost jacket, 'Say that again, please', speaking-practice exams listed
  - evidence: #1 and #13 situation list · situation catalogue filter
  - acceptance: Elementary profiles see only play, animal, game and sport situations.
- **major · rank 12** `LT-adela-17-J2-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-1/LT-adela-17-J2-4`, recurrence 3 — Added topic appended last with a generic skill label
  - expected: Her own topic gets priority and an accurate label
  - got: It sits seventh, the plan starts with the bike, and its label is 'Connect with people'.
  - evidence: #4 list order; #8 'Next topic: Choosing a bike to rent, and why'. · plan add-topic handler
  - acceptance: A topic the learner added is placed first or clearly flagged, with a fitting skill label.
- **major · rank 12** `LT-tomas-9-J1-4` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J1-5`, recurrence 3 — A2 rests on guessable two-option choices
  - expected: Level from real ability
  - got: A2 from 'Hi, Sam! How are you?' choice with an obvious distractor; confidence low
  - evidence: #6, #10 'rests on answers chosen from two options' · placement scoring
  - acceptance: Choice tasks do not lift band alone.
- **major · rank 12** `LT-jana-29-J1-3` (trust) · recurs `2026-10-17-lt-swap-2/recert-1/LT-jana-29-J1-4`, recurrence 2 — C2 tasks passed easily
  - expected: A C2 task that separates C1 from C2, or a partial verdict
  - got: Two C2 passes, yet the placement is C1 because 'what you said first pointed lower'
  - evidence: #9 'C2 was close, but what you said first pointed lower'; both C2 tasks passed · placement scoring
  - acceptance: Explain the cap in terms of task evidence, or let C2 passes move the band.
- **major · rank 12** `LT-adela-17-J1-2` (trust) — Held-back reasons for C2 tasks are dubious or vague
  - expected: A concrete, defensible reason a reply fell short of C2
  - got: 'let them pay for their own lunch' called plain; 'more popular' called plain while grammar is accurate
  - evidence: #10 task 4 and 5 notes. · verdict note prompt
  - acceptance: Notes for held-back tasks name a specific, examiner-defensible gap with a better alternative.
- **major · rank 12** `LT-adela-17-J3-2` (senior-quality) — Missed 'not used to cycle' (should be 'cycling')
  - expected: A note on be used to + -ing.
  - got: No moment or coaching on it.
  - evidence: #4 'I'm not used to cycle for many hours'; no mention in #5 or recap #7. · moment detection prompt
  - acceptance: Flag be used to + -ing slips.
- **major · rank 12** `LT-adela-17-J4-2` (senior-quality) — Coaching 'correction' targets a non-error
  - expected: One exact correction with the rule, or an honest 'no error here'.
  - got: Changes 'with friends' to 'with my friends' as 'more natural', which is not a rule. It ignores the 'although' clause she actually said.
  - evidence: #8 'Optional polish: say 'with my friends' for a more natural feel.' · coach prompt
  - acceptance: Coaching names a real error with its rule, or says there was none.
- **major · rank 12** `LT-jana-29-J3-4` (senior-quality) — Partner calls the learner by its own name
  - expected: A natural colleague who addresses Jana correctly
  - got: Owen says "Thanks for joining the review, Owen"
  - evidence: #2 partner opening line · conversation partner prompt
  - acceptance: Partner never uses its own persona name to address the learner.
- **major · rank 12** `LT-petra-38-J2-3` (effort) — Plan build failed on the first try
  - expected: The topics appear on the first press of See my topics.
  - got: The model returned 7 topics where the schema allows at most 6, so Petra saw an error and had to retry.
  - evidence: #1 'topics 7 items, at most 6'; #2 'Linga could not put your topics together. Try again.' · plan generation schema
  - acceptance: Plan generation is recovered or trimmed server-side with no visible error.
- **major · rank 12** `LT-petra-38-J4-2` (clarity) — Help does not unblock the fee reply
  - expected: Cue gives a usable phrase for stating a fee.
  - got: Cue gave a vocabulary gloss 'fee: money you pay for a service' and an earlier hint about offering late check-out; Petra answered unaided with an error.
  - evidence: #3 'Try: I can offer a late check-out until 2 p.m.'; #8 'What it means fee: ...'; answer 'after twelve o'clock is a fee' · cue ladder prompt
  - acceptance: Third help level shows a sentence frame like 'There is a fee of [amount]'.
- **major · rank 12** `LT-tomas-9-J1-5` (senior-quality) — Summary and focus generic, miss what he said
  - expected: Focus on like/is sentences and Creeper boom
  - got: 'practise saying hello to a friend with a full sentence'
  - evidence: #10 summary and focus 'Say a little more in each answer' · placement summary / focus prompt
  - acceptance: Next focus names something he actually said.
- **major · rank 9** `LT-tomas-9-J4-5` (clarity) · recurs `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J4-5`, recurrence 6 — Situation list long and mixed
  - expected: Short list of play and animal topics.
  - got: 21 entries including booking, lost jacket, group project.
  - evidence: #1 and #14 situation list · situation list builder
  - acceptance: An elementary profile sees only age-fit situations.
- **major · rank 9** `LT-jana-29-J1-4` (clarity) · recurs `2026-10-17-lt-swap-2/recert-1/LT-jana-29-J1-5`, recurrence 3 — Starter situations are half irrelevant
  - expected: Starters aimed at workplace and relocation nuance
  - got: 'The missing moon rover', 'A booking that is missing' shown to a profile that wants workplace nuance
  - evidence: #1 'Or choose a situation [...]' · starter list
  - acceptance: Starters are ordered or filtered by the answers in the profile.
- **major · rank 9** `LT-petra-38-J2-1` (missing) · recurs `2026-10-17-lt-swap-2/LT-petra-38-J2-4`, recurrence 3 — Swap never exercised; plan still grows past six
  - expected: She swaps an unwanted topic and the plan stays at six; the swap behaviour is tested.
  - got: She only added a topic. The plan went from 6 to 7 conversations and she agreed with no swap.
  - evidence: #3 '6 conversations for you' → #4 '7 conversations for you'; #4 she agreed without swapping. · plan add handler
  - acceptance: Adding a topic replaces one or states the plan limit; the swap is tested in the same run.

## What passed

- `LT-adela-17-J1-4` Exact B2 placement in five tasks with quoted evidence — B2 with each task's quote and band relation
- `LT-adela-17-J2-4` Swap now replaces the topic, and the added topic keeps her request — Each swap changed the list, and the added debate repeated 'opinions and comparisons for B2 First'.
- `LT-adela-17-J2-5` Each topic shows a personal 'why' line — Every topic has a personalised reason.
- `LT-jana-29-J1-5` Check tasks fit Jana's life and level — Tasks 1-4 were declining a dinner, a 'fine, I guess' reaction, 'clean, but a bit safe', and dry humour about user testing
- `LT-jana-29-J2-1` Swap and add both work, and the added topic keeps her ask — The book club topic was replaced by declining a friend's invitation. The landlord topic kept "sign on the spot" and the polite stall.
- `LT-petra-38-J2-4` Plan is work-shaped, with a personal reason for each topic — All seven topics are hotel situations, each with a 'why' that uses her phone-call difficulty. Her added topic kept the lost-booking brief.
- `LT-petra-38-J3-2` Moment was correct, short and let her self-repair — 'breakfast is end' → 'breakfast ends'; her retry held, then back to the scene.
- `LT-petra-38-J3-3` Hotel scenario with partner at A2 and correct level label — Breakfast, room number and directions at A2; level shown as A2.
- `LT-petra-38-J4-4` Moment quotes her exactly and gives a correct desk phrase — 'You said after twelve o'clock is a fee' → 'There is a fee after twelve o'clock'.
- `LT-petra-38-J4-5` Supported replies honestly counted — Recap '1 on your own · 2 with help' matches the help used.
- `LT-tomas-9-J1-6` Minecraft-themed tasks engage him — Alex and Sam in Minecraft, creepers; the tutor answered 'Creepers are scary!'
- `LT-tomas-9-J2-4` Added topic keeps both his words — 'football a dog' became 'Football with a dog' with a dog named Biscuit.
- `LT-tomas-9-J4-6` Help stays in the scene and works — Cue and phrase choice sat on the same screen; the phrase task was tiny and funny ('Blue table dog banana').
- `LT-adela-17-J3-3` Accurate false-friend moment — 'eventually' means 'in the end', not 'possibly'; offers 'how far the battery can go'.
- `LT-adela-17-J3-4` Direct question answered accurately — 'No, "interested about" should be "interested in".'
- `LT-adela-17-J4-4` Coach, replay and honest supported flags work together — Coach at #8, replay with a new question at #9, and the recap shows '2 on your own · 1 with help'. The 'Try it again' label cleared by #10.
- `LT-adela-17-J4-5` Direct question about correctness answered — 'Yes, your English is correct', quoting her sentence.
- `LT-jana-29-J3-5` Real slip caught, scene resumes cleanly — "on the picture" caught immediately and the learner returned to the scene
- `LT-petra-38-J1-1` Exact A2 placement with honest hedge — A2, 'B1 was close, but a harder task fell short and what you said pointed lower'
- `LT-tomas-9-J2-5` Swap brought a fitting animal topic — Shopping was replaced by 'Tell a friend about your favourite animal'.
- `LT-tomas-9-J3-5` Moments are short, correct and kind — 'I played' and 'friend' with simple why lines, one button back

## Voices

**Adéla · J1** (time saved: 10 min · low)

> B2 is right, and I liked that it showed why: my C1 answers were close but only one was strong. That I believe. The tasks were proper exam-style questions, not babyish. But I used "eventually" in the hotel answer when I meant "possibly", and the note said my English was strong and the conditionals correct. Not a word about the false friend, and that's exactly what I keep in my notebook. Then "let them pay for their own lunch" is called plain wording? That's a joke, not a vocabulary gap. And the focus tells me to say things out loud when I just did. I'd use it for placement, but I'd have to re-check its comments, so it saves me little yet. Show me the exact error and the rule, and I'd tell friends.

**Adéla · J2** (time saved: -5 min · low)

> The swap works now and my social media debate arrived with my exact wording, which I liked. But the rest is a travel phrasebook: bike rental, faulty headset, café chat, train platform. I said these are too basic, and each swap just brought another shop or desk scene. There was no mock interview, nothing on technology or education, and my own topic was stuck at the bottom of the list. Linga placed me at B2 and I trust that, and the "why" lines are clear. Still, I agreed to a plan where maybe two of seven are what I'd choose, because I ran out of useful swaps. Would I use it again? Only if the suggestions look like Cambridge speaking parts. Right now my tutor's exam questions are more useful.

**Adéla · J3** (time saved: -10 min · low)

> Correct corrections, at least: 'eventually' was explained properly, and when I asked about 'interested about' I got a straight answer. That I trust. But the conversation itself was a bike-rental queue. 'Shall I take the deposit now?' is not what a B2 First examiner asks. Nobody asked me to compare, speculate or defend an opinion, though I wrote 'although' and 'I'd rather' and it just carried on. It also missed 'not used to cycle', which I know I get wrong, so I would still have to check everything myself. Three replies and done. The recap was one line. I'd try the social-media topic next time, but I wouldn't swap my tutor for this yet. Not worth it for exam practice until the partner stretches me.

**Adéla · J4** (time saved: -10 min · low)

> Honestly, the structure works. I got stuck, found Help me answer, Pause & coach and Replay, and the recap told me what was mine and what was helped. But the help was babyish. 'Welcome! Where are you from?' is not help at B2, and the phrase quiz was insulting. Nothing gave me a frame to build a sentence on. The coaching note changed 'with friends' to 'with my friends' and called it more natural. That's not a mistake, so I wouldn't write it in my notebook. Pilar asked about phone batteries and said 'thanks for sharing that', which is not an exam discussion. I liked that she answered 'Was my English correct?' directly. Still, a B2 First trainer would have pushed me with opinion and comparison questions. I'd try it again only if the topics were exam-like, but I wouldn't yet swap my tutor for it.

**Jana · J1** (time saved: 0 min · low)

> The level was right. C1 is where I'd put myself, and the tasks were the first thing that felt like my actual life: the "clean, but a bit safe" one was a good prompt. The first three questions were a bit slow, though. What let me down was the feedback. My "slip" was cautiously versus safe, which is a synonym, not a mistake. I wouldn't pay a Preply tutor for that. "Natural and precise, ideal for diplomacy" is nice, but it tells me nothing I can use on Monday in Dublin. Show me how an Irish colleague would soften a no, or an idiom I haven't heard, and I'd come back. As it is, it placed me correctly and then taught me nothing, so I'd try a conversation next, but I'm not convinced yet.

**Jana · J2** (time saved: 10 min · low)

> Honestly, this was quicker than briefing a Preply tutor on what I need. The first set was mostly right: pushing back on a redesign, friction with a PM, clarifying a vague brief. That's my actual week. I still had to type in the Dublin landlord myself, and the swap gave me the "decline a friend" scene, which is lovely. It kept my "sign on the spot" detail, so I trust it listened. Booking a room is a bit basic, to be fair, and I'd have swapped it. I'd like after-work drinks and some Irish banter, not just polite meetings. The level read of C1 felt right, and the summary didn't gush. I haven't heard the partner talk yet, so I can't say whether it sounds like a sharp Dublin colleague. I'd carry on, cautiously.

**Jana · J3** (time saved: 5 min · low)

> The topic was spot on, because pushing back on a checkout redesign is my actual job. It caught "on the picture", and that is exactly the slip I make. But that was the whole lesson. Owen opened with "Thanks for joining the review, Owen", which is odd. His English is fine but generic. There was no Dublin directness and no idiom I didn't already have. The mission ended after three replies, mid-question. The recap said I'd had help, and I hadn't. I wouldn't trust it to tell me anything about register. For nuance I'd still go back to a Preply tutor. It's quick and handy, but too easy for C1, so I'd only tell people it's okay for a warm-up.

**Petra · J1** (time saved: 60 min · low)

> I would use it again. The first questions were kind and I could answer in simple English, and nobody made me feel stupid. A2 feels honest. The towel and taxi tasks were my work, I liked them. But then the question about my friend texting or calling was not hotel and needed 'why', which makes me nervous. The correction about 'wants' is useful, I really do say 'he want'. But the sentence to practise, 'I prefer calling', is not something I say at the desk. I told them phone calls are hard for me and the summary only said verb endings. I would like a guest complaint on the phone. Nothing in it worried me for the children. I would tell a colleague, with that small reservation.

**Petra · J2** (time saved: 60 min · low)

> I liked this. After the first error, when I tried again, I saw hotel situations: the phone call, the late check-out, the welcome. It explained why each one was there, and that I find phone calls hardest. That felt kind, not like a test. I typed my lost-booking guest and it appeared as its own conversation, so I felt heard. Nothing there worried me for Tomáš or Klára; it was all guests and reception. I did not swap anything, so I can't say how that works. It also said 6 conversations and then 7, which was a little confusing, and some labels like 'Share your world' for recommending a place did not fit. The first error made me nervous. I would use it again after the kids are in bed, and I would tell a colleague.

**Petra · J3** (time saved: 90 min · low)

> I liked it. The guest call was just like my work, and he spoke slowly and simply, so I was not afraid. The one correction, "breakfast ends", is something I can say tomorrow at the desk. Nobody made me feel stupid. I do not fully trust the corrections, though. I said "Is correct?" and "is on the left" without a subject, and Linga said nothing. I would like those in the recap too. The mission finished very fast and then the guest asked about phone or email, which was strange. Nothing here worries me for Tomáš and Klára. Fifteen minutes in the evening is far better than a course with a babysitter. I would tell a colleague about it.

**Petra · J4** (time saved: 60 min · low)

> Sorry, but I liked this more than I expected. When I did not know what to say, the help was right there on the screen and I never lost the guest. Nobody made me feel stupid, and the simple version of the question was kind. The correction, "There is a fee after twelve o'clock", is something I can say at my desk tomorrow, and it quoted my own words. What I missed: after the correction I wanted to try again, but it just went on to breakfast. The help for the fee also only explained the word, not how to say the sentence. The task said "email" but I was speaking, a little confusing. Nothing here worries me for Tomáš or Klára. I would use it again for fifteen minutes in the evening, but I want the second try.

**Tomáš · J1** (time saved: -3 min · low)

> Jo, Minecraft was fun, and Alex and Sam were easy. But the first questions were long, and I did not understand them. I said nevím and Czech words. Then the screen said "Skipped" and "only two words". That feels like a school test, and I did not like it. I like creepers, so "Creeper boom!" was my answer. The A2 is OK, but I only picked from two choices, so I don't believe it much. Mum would want the questions shorter. I would try it again if it talks like the game and says "good!" for one word. I would not tell my friends yet.

**Tomáš · J2** (time saved: 20 min · low)

> Jo, Minecraft and fotbal with a dog, that was fun! I pressed the swap and the shop thing was gone, and there was an animal one. That felt clever. But why was the shop there at the start? Nakupování je nuda. And the words under the topics, like "Understand and repair", I don't know what that is. The sentences are long, I would not read them, Máma would have to. "Tell what you did yesterday" is hard for me, I only know like and is. I would use it again for the dog and Minecraft chats. I'd tell a kamarád if the first topics were all games and had tiny words.

**Tomáš · J3** (time saved: 15 min · low)

> Jo, Minecraft and football were fun, and Mia liked my dog. But "What did you do after school?" and "Who did you play with?" were too hard. I said "nevím" and I was tired. The little "I played" and "friend" cards were nice, short, and nobody laughed at me. I would try again if Mia just asked easy things like "Do you like Minecraft?" The list also had booking and group project, which is school stuff, so I would skip it. My mum would like that I spoke eight times, but the recap was boring. Maybe, if it talks simpler.

**Tomáš · J4** (time saved: 40 min · low)

> Jo, Minecraft, that was fun! I picked the "Hi Ben" one and said "I like creeper", and I was proud. The help was easy to find, and "Blue table dog banana" made me laugh. But Ben talked too long. "Where did you go yesterday?" Nevím! I just said things I knew. Then the TV said something about "plural", and I don't know that word. I typed "creepers" because it told me to, not because I understood. Then Ben asked something else, so I never tried it again myself. It didn't notice "what you building" either. It's much better than the club, because I speak the whole time, not two minutes. Mum would like that. But Ben needs shorter sentences and kid words. I would play again for the creepers.
