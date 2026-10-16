# LT run 2026-10-14-lt/recert-4 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 3 Characters · 9 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 3 of 11

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J1 | conditional - C2 failed: #10 task 4 note "More precise words and idioms, instead of general ones" and t…; C3 failed: #10 "Your usual slips: 'I'd suggest that she uses the tool' → try 'I'd suggest… | conditional | 2/4 | B2 vs B2 · exact |  | 0/1 | 0 | 10 | 2.1 | done |
| adela-17 | J2 | fail - D2 failed: #2 add-topic worked and kept her wording (#3 "Mock interview: plans and tech i…; D3 failed: planAgreed holds all 7 incl. gaming night, laptop battery, app update; about 2…; topic fit 2/7 (29%) under 4 of 6; C3 failed: #1 "Your usual slips: 'I'd suggest that she uses the tool' → 'use'" presented …; C5 failed: #2 only electric transport and the added mock interview (#3) are exam discussi… | fail | 2/4 |  |  |  | 0 | 5 | 1.1 | done |
| adela-17 | J3 | pass | conditional | 4/4 |  | 6/6 | 1/1 | 0 | 10 | 1.7 | done |
| adela-17 | J4 | fail - D3 failed: #10 offered "Replay the moment" and she chose "Finish for today". There was no…; C4 failed: Partner questions are "What would you like to ask about today's seminar?" and … | fail | 4/5 |  | 2/3 |  | 0 | 11 | 1.4 | done |
| martin-45 | J1 | fail - D5 failed: #8 focus names only third-person -s; his 'we was', 'since 2015', 'more easy', … | conditional | 4/4 | B1 vs B1 · exact |  |  | 0 | 8 | 1.5 | done |
| martin-45 | J2 | pass | conditional | 5/5 |  |  |  | 0 | 4 | 1.1 | done |
| martin-45 | J3 | pass | pass | 4/4 |  | 4/5 | 1/1 | 0 | 11 | 1.5 | done |
| tomas-9 | J1 | fail - D3 failed: #6 the homework task: 'Moc dlouhé, nerozumím, tak hádám.' #7 the listening lin…; D5 failed: #9 focus 'Practise full sentences' and 'My favourite block is diamond' is gene…; C2 failed: #6 task 2 'Your mum asks: "Did you finish your homework?" You already finished…; C6 failed: #9 shows 'Your words: “I like diamond.”.' with a stray period, and a slip line… | fail | 2/4 | A1 vs A1 · exact |  |  | 0 | 9 | 1.3 | done |
| tomas-9 | J2 | conditional - C2 failed: #1 Say-it task: "Your friend asks, 'What is your favourite Minecraft block?' T… | conditional | 3/4 |  |  |  | 0 | 4 | 0.7 | done |
| tomas-9 | J3 | fail - D2 failed: Pitch 2/5. #7, #8 and #9 run to two clauses with words like "loud", "follow yo…; pitch 2/5 (40%) under 80%; C4 failed: #1 list: the plan topics (Minecraft, dog, football) fit, but "A booking that i…; C5 failed: #7 "Ha, boom! Green is a good reason, and creepers are very loud. What else do…; C6 failed: #3 and #4: "Use the right noun form after like." is grammar jargon a nine-year… | fail | 1/4 |  | 2/5 | 1/1 | 0 | 10 | 1.4 | done |
| tomas-9 | J4 | fail - D3 failed: #7 offers only 'Back to the conversation'. #14 ends with no replay and no fres…; D4 failed: Turns marked supported are wrong: 'Creeper world. I like creeper.' (#8) and 'Y…; C5 failed: #12 'Creepers are green and very funny! Do we play in the creeper world at fou…; C6 failed: #7 moment says 'Čtyři means four in Czech; in English, say four o'clock' altho… | fail | 1/3 |  | 3/6 | 0/1 | 0 | 14 | 1.9 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 3 · near 0 · miss 0
- **judge agreement:** 17/21 (81%)
- **topic fit:** fit 31/49 (63%) · safe 46/49 (94%)
- **pitch:** at band 17/25 (68%) · below 1 · above 7
- **moment precision:** 3/5 (60%)
- **moment recall:** 4/13 (31%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 68 calls, 0 failed, avg 8s · character 96 calls, 0 failed, avg 4s · judge 11 calls, 0 failed, avg 35s
- **driver coverage:** 85 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 27** `LT-adela-17-J2-1` (completion) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J2-1`, recurrence 3 — Swapping gaming night does not remove it
  - expected: Swap replaces the rejected topic with a new one.
  - got: List unchanged after swap; plan agreed with gaming night in it.
  - evidence: #3 swap "Planning a group gaming night"; #4 list still shows it; planAgreed includes it. Her thought: "I'd rather swap it for something more serious." · plan swap handler / topicId matching
  - acceptance: After swap, the rejected title is absent and a new topic appears in its slot.
- **blocker · rank 27** `LT-adela-17-J2-2` (missing) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J2-3`, recurrence 2 — Most proposed topics are not exam-style discussions
  - expected: At least 4 of 6 opinion/comparison/speculation topics.
  - got: Laptop battery, gaming night, app update, lecturer repeat are everyday tasks.
  - evidence: #2 titles; fit about 2 of 7 after the add. · topic plan prompt
  - acceptance: For a B2 First learner, at least 4 of 6 topics are discussion topics.
- **blocker · rank 27** `LT-tomas-9-J4-2` (trust) · recurs `2026-10-14-lt/recert-2/LT-tomas-9-J4-4`, recurrence 2 — Supported flag is wrong on several turns
  - expected: Only replies after help are supported; unhelped ones are independent.
  - got: Unhelped turns #8 and #12 are supported:true. The evidence quote is a quiz option, not his words.
  - evidence: Facts turns: 'Creeper world. I like creeper.' supported:true; 'Yes! Four. Creeper world.' supported:true; evidence quote 'Do you want to play at four?'. · evidence recording of supported
  - acceptance: Set supported only when help was used on that turn; quote the learner's own words in evidence.
- **blocker · rank 27** `LT-adela-17-J1-2` (trust) — Real slip 'interested about' never corrected
  - expected: Flag 'interested about' → 'interested in' with the rule.
  - got: No moment or note on it anywhere; the wrong 'uses' slip was shown instead.
  - evidence: #2 "I'm interested about technology"; #10 slips list contains only the 'use' item. · slip extraction prompt
  - acceptance: Slips pick the clear preposition error from her answers.
- **blocker · rank 18** `LT-martin-45-J1-2` (senior-quality) · recurs `2026-10-14-lt/recert-3/LT-martin-45-J1-3`, recurrence 4 — Fossilised errors beyond -s not in focus
  - expected: Focus or slips name 'we was', 'discussing about', 'since 2015', 'more easy'
  - got: Focus is only third-person -s; 'more easy solution' and 'I am ... since 2015' go unmentioned
  - evidence: #2 'we was discussing about... I am in this company since 2015'; #7 'more easy solution'; #8 focus only -s. · placement summary/focus prompt
  - acceptance: Focus/slips include the most frequent or most senior-sounding errors, including 'since' + present and comparatives.
- **blocker · rank 18** `LT-adela-17-J1-1` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J1-2`, recurrence 3 — Invented slip: 'suggest that she uses' marked wrong
  - expected: Only corrections an examiner accepts; 'suggests that she uses' is fine in British English (subjunctive optional).
  - got: "Your usual slips: 'I'd suggest that she uses the tool' → try '... she use the tool'"
  - evidence: #10 phone Your usual slips; her answer #9. · slips/moment generation prompt
  - acceptance: Slips list only items where the original is wrong in Cambridge B2 terms, or labels the alternative as optional.
- **blocker · rank 18** `LT-adela-17-J1-3` (clarity) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J1-3`, recurrence 3 — Notes for harder tasks are generic
  - expected: Name concrete strength or error with an example.
  - got: "Plain word choice and no idioms held it back from C1"; "More precise words and idioms, instead of general ones"; "Well done!"
  - evidence: #10 notes tasks 3, 4, 5. · verdict note prompt
  - acceptance: Each C-level note quotes a phrase she used and a specific alternative.
- **blocker · rank 18** `LT-tomas-9-J3-2` (clarity) · recurs `2026-10-14-lt/recert-1/LT-tomas-9-J3-3`, recurrence 3 — Correction note uses grammar jargon
  - expected: A child-sized reason, e.g. "More than one creeper: creepers."
  - got: "Use the right noun form after like."
  - evidence: #3 and #10: "Use the right noun form after like." · moment prompt / correction rules
  - acceptance: Moment 'why' lines for elementary profiles use no grammar terms.
- **blocker · rank 18** `LT-adela-17-J2-5` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J2-5`, recurrence 2 — Questionable 'usual slip' correction
  - expected: Only corrections an examiner would accept.
  - got: 'she uses' flagged as a slip, to 'use'.
  - evidence: #1 "“I'd suggest that she uses the tool” → try “I'd suggest that she use the tool”" · placement coaching prompt
  - acceptance: Accept both forms or label the subjunctive as optional.
- **blocker · rank 18** `LT-adela-17-J4-2` (clarity) · recurs `2026-09-15-lt-recert/LT-adela-17-J4-1`, recurrence 2 — Help does not match what she is stuck on
  - expected: Cue gives an answer frame for the actual need (asking about an extension).
  - got: Cue returned only a simplified restatement or a gloss of "word count".
  - evidence: #6 "not sure how to politely ask about an extension"; #7 shows "word count: the number of words the essay must have". #9 shows "Said more simply". · cue prompt
  - acceptance: The cue offers a B2 phrase frame for the learner's reply, not a paraphrase of the partner line.
- **blocker · rank 18** `LT-adela-17-J4-3` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J4-5`, recurrence 2 — Partner English and topic drift
  - expected: Natural lecturer English that stays on the scene.
  - got: "how cities pay back the carbon from building new roads" is unnatural and unrelated to the essay-deadline scene. It looks like leakage from an earlier topic.
  - evidence: #8 partner line; #9 simplifies it to "the carbon from new roads". · partner prompt / carry-over memory
  - acceptance: Partner follow-ups stay on the scene goal and use idiomatic phrasing.
- **blocker · rank 18** `LT-martin-45-J3-1` (senior-quality) · recurs `2026-09-15-lt-recert/LT-martin-45-J3-4`, recurrence 2 — Fossilised errors beyond one go uncorrected
  - expected: Moment or coaching on "we was discussing about", "more early", "the earliest date what you can do".
  - got: Only "stakeholder don't" got a moment; the others in the same and later turns got nothing, and the recap lists one fix.
  - evidence: #2 "we was discussing about the delay", "more early"; #8 "the earliest date what you can do"; #11 "1 moment to keep". · moment detection / as-needed rule
  - acceptance: Deferred coaching in the recap names recurring patterns (was/were, discuss about) the learner made.
- **blocker · rank 18** `LT-tomas-9-J1-1` (clarity) · recurs `2026-09-15-lt-j1b/LT-tomas-9-J1-1`, recurrence 2 — Check tasks too long for a nine-year-old
  - expected: Prompts of 15 words or fewer in words he knows
  - got: A 25-word homework task and a 24-word block prompt; he guessed or gave up
  - evidence: #6 'Moc dlouhé, nerozumím, tak hádám.'; #8 'Hard one'; #7 'Too fast and hard' · check task generation prompt
  - acceptance: Every task shown to an elementary profile is 15 English words or fewer, in present tense.
- **blocker · rank 18** `LT-tomas-9-J1-2` (senior-quality) · recurs `2026-09-15-lt-j1b/LT-tomas-9-J1-2`, recurrence 2 — Next focus and slip line beyond his level or wrong
  - expected: A focus using only like/is, and no correction of a correct sentence
  - got: A 'slip' that rewrites correct 'I like diamond.'; focus 'My favourite block is diamond'; stray period in 'Your words'
  - evidence: #9 'Your usual slips “I like diamond.” → try “I like the diamond block.”' · verdict focus prompt / placement summary prompt
  - acceptance: No slip is shown for correct sentences. The focus is a tiny step from his own words.
- **blocker · rank 18** `LT-tomas-9-J2-2` (clarity) · recurs `2026-09-15-lt/LT-tomas-9-J2-2`, recurrence 2 — Skill labels and why lines are too abstract for a 9-year-old
  - expected: A tiny label and one short reason in words he knows.
  - got: Labels such as "Understand and repair", "Get something done" and "Make contact". Why lines run to 15 or more words.
  - evidence: #2 "Understand and repair"; "Telling your friend what you built helps you use the words for order and results." · plan topic generation prompt
  - acceptance: Drop the skill labels for elementary profiles. Keep the why line to about 8 words.
- **blocker · rank 18** `LT-tomas-9-J3-1` (senior-quality) · recurs `2026-09-15-lt-recert/LT-tomas-9-J3-1`, recurrence 2 — Alex's turns outgrow a nine-year-old after the first two
  - expected: Tiny sentences, one question, known words (creeper, wolf, dog).
  - got: Pitch 2 of 5. Turns 3-5 chain clauses and use "loud", "follow you around", "fight" and "shiny".
  - evidence: #7 "Ha, boom! Green is a good reason, and creepers are very loud. What else do you like in Minecraft?" #9 "Which shiny thing in the game do you like most?" #9 thought: "That was a lot of words and I'm tired". · conversation partner prompt (band and length cap)
  - acceptance: For an A1 elementary child, at least 80% of partner turns are one sentence of 8 words or fewer, with one question.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) · recurs `2026-09-15-lt/LT-tomas-9-J4-1`, recurrence 2 — No replay or independent retry after the moment
  - expected: Replay the moment with a fresh question, then let him answer better unaided.
  - got: The moment screen offers only 'Back to the conversation', and the rehearsal ends with no retry.
  - evidence: #7 only 'Back to the conversation'; #13-#14 finish, '5 spoken · 0 written replies · 1 moment to keep'. · moment replay flow
  - acceptance: After a moment, offer a replay with a new question; record the unaided reply as independent.
- **blocker · rank 18** `LT-tomas-9-J4-3` (senior-quality) · recurs `2026-09-15-lt-recert/LT-tomas-9-J4-3`, recurrence 2 — The only moment is unnecessary and slightly wrong
  - expected: No interruption; or a correction of a real error such as creeper → creepers.
  - got: 'Čtyři → four o'clock' stops the scene, though he had already said 'four'. The real plural errors went uncoached.
  - evidence: #6 'Čtyři... four', #7 'Linga stopped the conversation'. 'I like creeper' and 'I like dog' got no moment. · moment selection prompt
  - acceptance: Moments fire on real errors and never on a phrase he already translated himself.
- **blocker · rank 18** `LT-adela-17-J3-2` (senior-quality) — Clear slips in her turns get no moment or coaching
  - expected: Flag "damages local environment" (missing article), "What else I would add" (word order) and "makes a big carbon footprint" (collocation)
  - got: The partner moves on and says nothing about them. The recap shows one moment only.
  - evidence: #7 learner turn, then #8 partner "Yes, 'concentrate on' is right here" with no mention of the other errors · moment detection / partner correction prompt
  - acceptance: When she makes a clear B2 slip, a moment or coaching note should name it.
- **major · rank 12** `LT-adela-17-J2-4` (trust) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J2-4`, recurrence 3 — Reasons presume interests she never stated
  - expected: Reasons grounded in what she said.
  - got: "Your series interest...", "Gaming with friends is a fun way" with an empty interest preference.
  - evidence: #2 reason lines for series and gaming. · topic plan prompt
  - acceptance: Reasons cite only stated goals or placement evidence.
- **major · rank 12** `LT-tomas-9-J2-3` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-tomas-9-J2-2`, recurrence 3 — Check tasks run over 15 English words
  - expected: About 15 words or fewer per check task.
  - got: The Say-it task is about 19 words. The A2 task about homework is longer and is school-themed.
  - evidence: #1 "Your friend asks, 'What is your favourite Minecraft block?' Tell your friend one thing about your favourite block." · placement task prompt
  - acceptance: Cap elementary check tasks at 15 words and drop school scenarios.
- **major · rank 12** `LT-adela-17-J2-3` (missing) · recurs `2026-09-15-lt-recert2-goal/LT-adela-17-J2-3`, recurrence 2 — Initial plan omits an interview even though she aims at B2 First
  - expected: A mock speaking-interview topic is proposed up front.
  - got: She had to add it herself.
  - evidence: #2 add-topic text; not in initial six topicsShown. · topic plan prompt
  - acceptance: Exam-goal learners see an interview topic in the first set.
- **major · rank 12** `LT-adela-17-J3-3` (trust) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J3-2`, recurrence 2 — False friend 'eventually' confirmed as clear, no moment
  - expected: Check what she means by "eventually" and note the false friend
  - got: "Yes, your sentence is correct, and 'greener eventually' is clear."
  - evidence: #3 partner reply; no moment at #2/#3 · partner prompt, correction wording
  - acceptance: Treat "eventually" used for "possibly" as a flagged false friend.
- **major · rank 12** `LT-adela-17-J4-6` (missing) · recurs `2026-09-15-lt/LT-adela-17-J4-7`, recurrence 2 — Recap does not separate supported from independent speaking
  - expected: The recap shows what she managed alone and what needed support.
  - got: The recap shows only "2 spoken · 0 written replies", though both replies were supported.
  - evidence: #11 recap line; facts turns both supported:true. · recap builder
  - acceptance: The recap states how many replies were supported and how many were independent.
- **major · rank 12** `LT-martin-45-J1-4` (clarity) · recurs `2026-10-14-lt/recert-1/LT-martin-45-J1-2`, recurrence 2 — Why B1 not B2 is thin for a C1 claimant
  - expected: A clear reason the B2 answers fell short
  - got: 'Your B2 answers were close, but none was strong' with confidence low
  - evidence: #8 'Your B2 answers were close, but none was strong, so Linga starts you at B1.' · placement summary prompt
  - acceptance: Tie the B1 call to a count or pattern of recurring errors across answers.
- **major · rank 12** `LT-tomas-9-J4-4` (clarity) · recurs `2026-09-15-lt/LT-tomas-9-J4-3`, recurrence 2 — Partner turns grow long and use 'mob'
  - expected: Tiny sentences, one question, known words.
  - got: The later turns have two clauses plus a question and unexplained words such as 'mob'.
  - evidence: #12 'Creepers are green and very funny! Do we play in the creeper world at four o'clock?'; #13 'Which mob do you want to meet there?' · partner prompt, elementary band
  - acceptance: Partner turns for age 9 stay at 8 words per sentence or fewer, with one question.
- **major · rank 12** `LT-adela-17-J1-4` (trust) — Task verdicts and screen explanation don't match
  - expected: Consistent reasoning for ceiling.
  - got: Task 3 passed at C1, task 5 partial, yet "Your C1 answers were close, but only one was strong"; task 3 praise cites 'However' and 'instead of' as C1 structures.
  - evidence: #10 task 3 pass note and explanation line. · placement judge prompt
  - acceptance: C1 pass requires C1 evidence; explanation matches task verdicts.
- **major · rank 12** `LT-adela-17-J3-4` (clarity) — Answer to her question names no preposition
  - expected: Say "compensate for" when she asks whether "compensate" was correct
  - got: "No, 'compensate' needs a preposition after it". She had to ask again at #6.
  - evidence: #6 partner reply, then her "which preposition do I need" in the same turn · partner prompt, correction wording
  - acceptance: A "no" answer must carry the exact fix.
- **major · rank 12** `LT-adela-17-J4-1` (completion) — Replay never taken, so improvement is unproven
  - expected: Replay gives a fresh question and she answers it better than before.
  - got: She finished at the coach screen without replaying.
  - evidence: #10 offered "Replay the moment" or "Finish for today"; she chose finish, and the recap #11 shows no replay. · coach screen / replay prompt
  - acceptance: After coaching, replay is prompted. A fresh question practising the coached point is answered and compared with the earlier reply.
- **major · rank 12** `LT-adela-17-J4-7` (senior-quality) — Partner questions are not B2 exam-style
  - expected: Opinion, comparison or speculation questions.
  - got: Generic prompts such as "Is there anything else you'd like to check?".
  - evidence: #6 partner line. · partner prompt
  - acceptance: At least some partner turns ask for opinion or speculation.
- **major · rank 9** `LT-martin-45-J2-3` (clarity) · recurs `2026-10-14-lt/recert-1/LT-martin-45-J2-4`, recurrence 2 — Plan grows to seven after an add, unexplained; swap not exercised
  - expected: Plan of six or a note about the size
  - got: '7 conversations for you', agreed at seven
  - evidence: #3 '7 conversations for you'; #4 planAgreed lists seven · linga-plan add-topic
  - acceptance: Explain the plan size or swap one out on add.
- **major · rank 9** `LT-tomas-9-J1-3` (clarity) · recurs `2026-10-14-lt/recert-1/LT-tomas-9-J1-4`, recurrence 2 — About-you questions too long and cover learning history
  - expected: One tiny question
  - got: 'Where do you use English in your life?' and a three-option question
  - evidence: #2 and #4; answers were a word salad 'Minecraft. Nevím. Dog.' · linga check intro prompt
  - acceptance: Opening questions are under 10 words, about games or animals.
- **major · rank 9** `LT-adela-17-J3-5` (clarity) — Partner speaks of Owen in the third person
  - expected: Owen speaks as "I"
  - got: "Owen pushes back: batteries are made only once…" in Owen's own turn
  - evidence: #3, #8, #9 partner turns · partner prompt
  - acceptance: Partner lines stay in first person.
- **major · rank 8** `LT-tomas-9-J2-4` (completion) — Swapping was not exercised
  - expected: A swap visibly replaces a topic.
  - got: All topics fit, so he never swapped. Swap working is not shown by this run.
  - evidence: #2-#3 swap buttons present; the action list has only add-topic and agree. · plan swap handler
  - acceptance: A run with an unwanted topic that proves swap replaces it.
- **minor · rank 6** `LT-martin-45-J1-3` (trust) · recurs `2026-10-14-lt/recert-3/LT-martin-45-J1-4`, recurrence 2 — Task 1 passes despite two -s slips
  - expected: Partial or flagged slip
  - got: pass; 'quality team want', 'supplier say' unflagged in the note
  - evidence: #5 vs #8 note 'You understood why the delivery could be late'. · listen task judge
  - acceptance: Note the -s slip on pass or mark partial.
- **minor · rank 6** `LT-martin-45-J3-2` (effort) · recurs `2026-10-14-lt/recert-1/LT-martin-45-J3-4`, recurrence 2 — Scene ended after four replies
  - expected: About eight replies of practice.
  - got: "Mission done" appeared after four replies.
  - evidence: #10 "Mission done. See what you did tonight."
  - acceptance: Mission completion does not cut short the scene before a reasonable number of turns.
- **minor · rank 6** `LT-tomas-9-J2-5` (senior-quality) · recurs `2026-10-14-lt/recert-2/LT-tomas-9-J2-2`, recurrence 2 — Narrate goal asks for sequence and past telling
  - expected: Goals using words an A1 beginner has.
  - got: The goal asks for "first, then next, and what happened at the end", which is above a child who knows only like and is.
  - evidence: #2 "Tell what you did first, then next, and what happened at the end, in short sentences." · plan topic generation prompt
  - acceptance: For A1 children, ask for one word or one like/is sentence.
- **minor · rank 6** `LT-tomas-9-J3-4` (trust) · recurs `2026-10-14-lt/recert-2/LT-tomas-9-J3-6`, recurrence 2 — Grown-up situations in a nine-year-old's list
  - expected: Child-suited situations only.
  - got: "A booking that is missing", "Our group project" and "The lost jacket" are listed.
  - evidence: #1 and #10 situation list. · situation catalogue filter
  - acceptance: The situation list for an elementary profile is filtered to child-suited ones.
- **minor · rank 6** `LT-adela-17-J3-6` (effort) — 'Mission done' appears after only three replies
  - expected: The scene keeps going until she chooses to finish
  - got: From #7 the screen shows "Mission done. See what you did tonight." while the partner keeps asking questions.
  - evidence: #7, #8, #9 "Mission done" alongside a new partner question · mission progress
  - acceptance: Mission-done state must not compete with an open partner question.
- **minor · rank 6** `LT-tomas-9-J3-3` (missing) — "I like dog" gets no moment or coaching
  - expected: A quick "dogs" model, as with creepers.
  - got: The same plural slip passed unmarked; only the first was caught.
  - evidence: #7 "I like dog. Wolf! Dog in Minecraft." The turn got no moment. #10 shows 1 moment. · moment trigger / coaching rules
  - acceptance: A repeated clear slip gets a light prompt or coaching on its second occurrence.

## What passed

- `LT-adela-17-J1-5` Exact B2 placement with correct false-friend catch — B2 exact; "Try 'possibly' instead of 'eventually'"; tasks were exam-style opinion questions.
- `LT-adela-17-J2-6` B2 placement exact, with honest caveat — B2 with clear reasoning about C1 answers.
- `LT-adela-17-J4-4` Direct question answered concretely — The partner and coach both answered precisely, with the sentence quoted and a note that the alternative is not an error.
- `LT-adela-17-J4-5` Coaching quotes the learner exactly and placement is B2 — Exact quote and the right level.
- `LT-martin-45-J1-1` B1 placement backed by quoted evidence — B1 exact with 'Your usual slips' quoting his own sentences with fixes
- `LT-martin-45-J2-1` Topics match the business brief, each with a reason — Six meeting/supplier topics, each with a 'why' line
- `LT-martin-45-J3-3` Workplace scene at B1 with a clean, correct moment — Supplier negotiation, natural partner, one precise fix with a held repair.
- `LT-tomas-9-J1-5` Kind handling of Czech and 'Nevím' — Praised the words he caught and reframed the skip
- `LT-tomas-9-J2-1` Topics are game-led and the added topic keeps his words — All 7 topics fit; his "dog a football" became "My dog and my football" and was agreed. The next topic is the Minecraft block.
- `LT-tomas-9-J3-5` Plan topic and partner match his love of Minecraft — A topic about his favourite block, a friendly game-club partner, and the chat stayed on creepers and wolves.
- `LT-tomas-9-J3-6` Recap shows a real, reusable phrase — The recap shows "I like creeper" → "I like creepers." and the next topic.
- `LT-tomas-9-J4-5` In-scene help ladder works for a child — 'Said more simply: What time is good?' and 'What it means' are short, and he answered afterwards.
- `LT-adela-17-J2-7` Add-your-own topic keeps her request — Mock interview on plans and tech in education added with fitting reason.
- `LT-adela-17-J3-1` Moment fired on a real slip and she self-repaired — The moment on "compensate the production emissions" is correct. She repaired it, and the recap kept it with the rule.
- `LT-adela-17-J3-7` Recap now carries a concrete correction — The recap shows her own slip, the fix and the rule.
- `LT-martin-45-J2-2` Added topic kept as asked — Small talk with the American director added with a named partner
- `LT-tomas-9-J4-6` Czech answers are accepted warmly — The partner builds on 'Je zelený' with 'Creepers are green and very funny!'

## Voices

**Adéla · J1** (time saved: 10 min · low)

> The placement is right and the tasks felt like proper exam questions, not babyish — that I liked. 'Possibly' for 'eventually' was exactly the sort of correction I want. But then it told me my usual slip was 'she uses' and I should say 'she use'. I checked: both are fine in British English, so that's a wrong correction, and it ignored 'interested about', which is a real mistake I made in my very first answer. That is what I would have written in my notebook. Notes like 'plain word choice, no idioms' tell me nothing; give me the actual phrase. And 'ready for university study' is a big claim from a seven-minute check. I'd try it again, but I would re-check every correction, so it saves me no time yet.

**Adéla · J2** (time saved: -5 min · low)

> Honestly, half of this isn't what I asked for. The placement is right, B2, and I liked that it explained why not C1. The electric transport debate and the mock interview I added are exactly my kind of thing. But laptop battery, a gaming night, an app update? That's not B2 First speaking. I swapped the gaming night and it simply stayed there, so I had to agree to a plan with it in. And "Your series interest" — I never said that. Also, flagging "she uses" as a slip looks doubtful to me; I'd have to check it myself, which costs me the time I'm supposed to save. I'd give it one more try, but I wouldn't recommend it yet.

**Adéla · J3** (time saved: 40 min · medium)

> The topic was right: a proper debate, with Owen pushing back and no pet chatter. I liked that the one correction was exact, with the rule, and that it went into my map. The recap showed my own sentence this time, not generic praise. But I would not rely on it alone. I wrote "damages local environment" and "What else I would add", and nobody said a word. When I asked whether "compensate" was correct, I got "needs a preposition" and had to ask which one. "Greener eventually is clear" also made me nervous, because that is exactly my false-friend trap. Owen also talks about himself in the third person, which is odd. Still, it is much closer to an examiner-trainer than my old tutor's chat. I would use it again, but I would keep my notebook open to check it. I'd tell a friend, with that warning.

**Adéla · J4** (time saved: 10 min · low)

> The help was there, and the answer about my email sentence was exact: correct and polite, no "great job". Good. But I skipped replay, so I never proved I could do it better. The cue only simplified Dr Hale's words or glossed "word count". It did not give me a phrase for what I was stuck on, the extension. Then Dr Hale asked about "cities pay back the carbon from building new roads". That's odd English, and it has nothing to do with an essay deadline. An examiner would wince. The recap doesn't say which answers I needed help for. Would I use it again? Maybe, if the cues give me real frames and the partner pushes opinions. Right now it saves me little time, since I'd still check things myself.

**Martin · J1** (time saved: 60 min · medium)

> Fine, B1, not C1. I didn't expect that, but it quoted my own sentences back, 'supplier confirm', 'we have penalty', and I can't argue: those are real. The tasks were about suppliers and deadlines, not baby topics, and it took a few minutes, much faster than a school test. What bugs me: it only told me to practise -s endings. My 'we was discussing about' and 'since 2015' were in my first answer and nobody mentioned them. Those are what the new director notices. So I trust the level, but I'd want the focus to be sharper before I commit to practising. I'd try it again, and I'd tell a colleague it's quick and honest.

**Martin · J2** (time saved: 20 min · low)

> Finally something that speaks my language. The topics are my real work: suppliers, quality reports, stakeholder meetings. Each had a reason, and I could add the small talk with the American director myself, and it kept that. I didn't swap anything, because nothing needed it. The B1 stung a bit, but it quoted my own sentences ("the supplier say Friday"), so I can't argue. It went up to seven topics without telling me why, which is a bit sloppy. And calling the director chat "easy" is cheeky. Still, I'd use it before a call. I'd tell a colleague.

**Martin · J3** (time saved: 60 min · medium)

> Finally a topic that's mine: a supplier, a deadline, a partial delivery. Priya sounded like a real account manager, not a sandwich shop, and nobody slowed me down. The correction on "stakeholder don't" was right and the rule was one line, fine. But I said "we was discussing about" and "more early" in the very same sentence and Linga let both pass. Later "the earliest date what you can do" also slid by. If you only fix one thing, I'm not convinced you see my real problem. It ended after four replies, which felt abrupt. I would use it again before a call, and I'd tell a colleague, but I want the recap to name my repeat errors.

**Tomáš · J1** (time saved: -5 min · low)

> Jo, the A1 was right and the summary was nice. It said I know park, ball and creeper, and I liked that. But the tasks were too long. The homework one I just guessed, because it was moc dlouhé. The question about my block I only half understood. After that I was done. It felt a bit like school. The "slip" line told me to change "I like diamond", but that was fine already. I'd try it again if the questions were tiny and about Minecraft. A tiny sentence and a creeper joke would work better. I'd tell a friend only if it were shorter.

**Tomáš · J2** (time saved: 20 min · low)

> Jo, Minecraft! Tohle bylo dobrý. Everything was about my games, and when I typed "dog a football" it made "My dog and my football". I felt clever. Then it started with my favourite block, so I didn't get bored. But a lot of the words on the plan were too hard: "Understand and repair", what? Mum would have to read it to me. The sentences under each topic are long too. I never needed Swap, so I don't know if it works. I would press it again, but only if the reading gets tiny. It's better than the club, where I talk two minutes. I'd tell Honza, but only about the Minecraft part.

**Tomáš · J3** (time saved: 40 min · medium)

> Jo, Minecraft! I liked talking to Alex about creepers and wolves, and I did it myself on the remote and phone, not in a club with eight kids. When it said "creepers" I could say it again, and that was fun. But Alex got talky: "shiny thing", "follow you around", and two sentences each time. Too many words, I got tired and wanted to stop. The note "noun form" I don't understand, my mum would have to explain it. It didn't fix "dog" the second time, which is fine, I didn't mind. I'd use it again for Minecraft, but I'd want Alex to say tiny things. And please, no jacket or booking things. Nuda.

**Tomáš · J4** (time saved: 40 min · low)

> Creeper, jo! Playing with Sam was fun, and the "what time is good?" help was easy for me. I said "čtyři... four" and Sam understood. But then a screen stopped everything and said "four o'clock". I already said four! Nudné, like school. Nobody let me try again, and the corrections skipped "creepers". Sam also talks too much at the end, and I don't know "mob". Mum would like that it takes 10 minutes at home instead of the club, where I hardly speak. I'd use it again for Minecraft, but I wouldn't trust the progress picture, because it says I had help when I didn't. A second chance with a new question would make it a real game.
