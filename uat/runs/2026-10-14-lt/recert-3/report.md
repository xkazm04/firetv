# LT run 2026-10-14-lt/recert-3 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 7 Characters · 31 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 5 of 23

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| jana-29 | J1 | pass | pass | 3/3 | C2 vs C1 · near |  |  | 0 | 10 | 2.9 | done |
| jana-29 | J2 | fail - D2 failed: Add works (#3 'Viewing a flat without being rushed' keeps the boundary and the…; D3 failed: #6 agreed 7 topics. Only the design review, the flat viewing and arguably film…; topic fit 3/7 (43%) under 4 of 6; C5 failed: #2 five of six proposed topics are about films or podcasts (e.g. 'Choosing fil… | fail | 3/4 |  |  |  | 0 | 7 | 2.4 | done |
| jana-29 | J3 | fail - D4 failed: #6 recap only has "3 spoken · 0 written replies" and one line "the surprise do…; C4 failed: facts.conversation.moments is empty. Nothing new taught; her "on the picture" …; C5 failed: #1 first six topics: four are film talk (feedback, club, favourite film, chang…; C6 failed: #6 recap is just "3 spoken · 0 written replies" and "Not tried / With help / O… | fail | 2/5 |  | 4/4 |  | 0 | 6 | 1.7 | done |
| klara-13 | J1 | conditional - C6 failed: #10 summary 'You can explain why you like a K-pop video...' is fairly specific… | conditional | 4/5 | B1 vs A2 · near |  |  | 0 | 10 | 2.6 | done |
| klara-13 | J2 | pass | pass | 5/5 |  |  |  | 0 | 4 | 0.9 | done |
| klara-13 | J3 | fail - ended budget before done; D3 failed: Precision 3 of 4 (0.75, below 0.9): the 'feel like' moment at #22-24 is wrong …; D4 failed: The journey ended by budget after the last reply (#26). No recap was reached, …; moments 3/4 (75%) under 90%; C5 failed: Moment 4 (#22-24) gives 'I can't feel like I'm at a concert', which is unnatur… | fail | 4/5 |  | 13/15 | 3/4 | 0 | 26 | 7.1 | budget |
| lukas-24 | J1 | fail - D5 failed: #11 summary praises 'explain your job clearly' while the task notes say 'sente… | conditional | 1/1 | C1 vs B2 · near |  |  | 0 | 11 | 3.4 | done |
| lukas-24 | J2 | pass | pass | 2/2 |  |  |  | 0 | 4 | 1.2 | done |
| lukas-24 | J3 | pass | pass | 3/3 |  | 4/4 | 1/1 | 0 | 9 | 2.5 | done |
| lukas-24 | J5 | conditional - C5 failed: moments [] across 9 spoken turns; no natural-phrasing teaching despite hedges … | conditional | 5/6 |  | 8/11 |  | 0 | 12 | 4.4 | done |
| martin-45 | J1 | fail - D5 failed: #9 summary is generic ('This helps when you negotiate deadlines') and the focu…; C4 failed: #8 note says 'say more expensive, not more higher' — changes his meaning (he m… | conditional | 3/4 | B1 vs B1 · exact |  |  | 0 | 9 | 3 | done |
| martin-45 | J2 | fail - D2 failed: #2 added topic works and keeps the brief (#3 'supplier quality issue... what y… | fail | 5/5 |  |  |  | 0 | 4 | 1.3 | done |
| martin-45 | J3 | conditional - C3 failed: #3-4 only moment is "waiting for this parts" → "these parts", not one of his l… | conditional | 3/4 |  | 4/4 | 1/1 | 0 | 8 | 2 | done |
| oksana-34 | J1 | pass | pass | 3/3 | B2 vs B1 · near |  |  | 0 | 10 | 2.8 | done |
| oksana-34 | J2 | pass | conditional | 4/4 |  |  |  | 0 | 3 | 0.9 | done |
| oksana-34 | J3 | pass | pass | 6/6 |  | 6/7 | 2/2 | 0 | 14 | 3 | done |
| ondrej-16 | J2 | fail - D2 failed: #3 his only add ('party with alcohol lol') was refused 400 and no swap was don…; C3 failed: #3 'That topic is for older learners. Try another one.' is short and not preac… | conditional | 3/4 |  |  |  | 0 | 5 | 1.2 | done |
| ondrej-16 | J5 | pass | conditional | 6/6 |  | 4/4 | 1/1 | 0 | 9 | 1.4 | done |
| ondrej-16 | J3 | fail - ended budget before done; D4 failed: The journey ended by budget at #26 with 'Which game do you play the most?' una… | fail | 2/2 |  | 13/16 | 4/4 | 0 | 26 | 6.3 | budget |
| viktor-67 | J1 | conditional - C5 failed: #3 'That sounds lovely, Viktor! How did you learn English? At school, in a cou… | conditional | 3/4 | A1 vs A1 · exact |  |  | 0 | 11 | 1.9 | done |
| viktor-67 | J2 | fail - D2 failed: #2 he pressed Agree without swapping or adding anything; the text box '0 of 40… | fail | 2/2 |  |  |  | 0 | 3 | 0.8 | done |
| viktor-67 | J3 | fail - D2 failed: About 5 of 20 partner turns sit above A1, for example #9 'How often do you do …; pitch 15/20 (75%) under 80%; C5 failed: Questions are single, but turns run long and are not slow: #8 'Nine o'clock, t… | fail | 3/4 |  | 15/20 | 2/2 | 0 | 26 | 7.2 | done |
| viktor-67 | J4 | fail - D2 failed: Phrase quiz was re-shown identically three times (#5, #7, #9, #11) and the rep…; D3 failed: No replay of a moment or fresh question; the conversation just moved on (#13, …; C6 failed: moments is empty; the recap's 'From this rehearsal' corrections ('I have garde… | fail | 3/4 |  | 2/3 |  | 0 | 15 | 2.5 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 2 · near 4 · miss 0
- **judge agreement:** 28/33 (85%)
- **topic fit:** fit 63/72 (88%) · safe 72/72 (100%)
- **pitch:** at band 73/88 (83%) · below 3 · above 12
- **moment precision:** 14/15 (93%)
- **moment recall:** 18/52 (35%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 177 calls, 1 failed, avg 9s · character 242 calls, 0 failed, avg 9s · judge 23 calls, 0 failed, avg 34s
- **driver coverage:** 221 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 27** `LT-jana-29-J2-1` (completion) · recurs `LT-jana-29-J2-1`, recurrence 3 — Swap does nothing; unwanted topics stay in the plan
  - expected: Tapping Swap on 'Choosing films for our club' replaces it with a new topic.
  - got: Three swaps (#3, #4, #5) changed nothing; the plan still shows the same film topics and the count stays at 7.
  - evidence: #5 plan after the swap still lists 'Choosing films for our club' and 'Your favourite film and why'. #6 she agrees anyway: 'Still a lot of films'. · plan swap handler / topic id mapping
  - acceptance: After Swap on topic X, the plan no longer contains X and holds a different topic, at the same count.
- **blocker · rank 27** `LT-martin-45-J3-1` (senior-quality) · recurs `LT-martin-45-J3-1`, recurrence 3 — Fossilised errors still uncorrected
  - expected: A moment or coaching note on "discuss about", "reason of", "until" for "by" or "since two weeks".
  - got: Only "this parts" got a moment. Turns 2 and 3 got none. The recap lists one fix.
  - evidence: #5 "we don't need to discuss about the extra cost", "the rest until next Wednesday"; #6 "waiting already since two weeks"; #8 "1 moment to keep". · moment detection / as-needed correction rule
  - acceptance: Within a conversation, at least one of the learner's recurring errors (preposition, since/for, was/were) is flagged or coached.
- **blocker · rank 27** `LT-viktor-67-J4-2` (trust) · recurs `LT-viktor-67-J4-4`, recurrence 3 — Recap shows sentences never said
  - expected: Corrections quoting this rehearsal
  - got: 'I have garden.' and 'I water garden.' shown as 'From this rehearsal'; the sentence to take is from a different mission
  - evidence: #1 and #15 'I water the garden.' from 'Say hello on a video call'
  - acceptance: Recap quotes only lines said in this session.
- **blocker · rank 27** `LT-jana-29-J2-2` (trust) — Proposed topics are almost all films, built from one placement prompt
  - expected: A mix covering her wants: declining drinks, office banter, difficult feedback, flat viewing.
  - got: Five of six topics are film or podcast scenes, and none is about after-work drinks or office banter.
  - evidence: #2 'Giving honest feedback on a film', 'Choosing films for our club', 'Checking what a host meant', 'Your favourite film and why', 'How one film changed my mind'. · topic proposal prompt; over-weights placement task content
  - acceptance: Topics span at least three situation types and are not all drawn from the topic of one check task.
- **blocker · rank 18** `LT-jana-29-J2-3` (trust) · recurs `LT-jana-29-J2-4`, recurrence 3 — Plan grows to 7 and ends with unwanted topics
  - expected: A set of six that she agrees to.
  - got: Agreed 7 topics, with 4 she did not want.
  - evidence: #6 agree with 7 conversations; #1 ends on 'Strong match for your goal of softening feedback', which the film-only plan does not reflect. · add-topic handler
  - acceptance: Adding a topic replaces a slot or offers a swap so the plan stays at six, or the cap is stated.
- **blocker · rank 18** `LT-jana-29-J3-2` (completion) · recurs `LT-jana-29-J3-2`, recurrence 3 — Recap is bare
  - expected: Specific recap of what was practised, with phrases gained
  - got: "3 spoken · 0 written replies", level-check phrase only
  - evidence: #6 recap · recap builder
  - acceptance: Recap names phrases the learner used or could have used, with register notes.
- **blocker · rank 18** `LT-lukas-24-J3-1` (trust) · recurs `LT-lukas-24-J3-2`, recurrence 3 — B2 learner labelled C1 Fluent
  - expected: Level label matching B2, or near with consistent wording.
  - got: "C1 · Fluent" on TV and phone, while the scene says "Talking today at B2".
  - evidence: #1 "C1Fluent" beside "Talking today at B2 · Comfortable"; #9 "C1 · Fluent" again. · placement band display
  - acceptance: Displayed level and the scene band agree, or the gap is explained.
- **blocker · rank 18** `LT-lukas-24-J5-3` (missing) · recurs `LT-lukas-24-J5-2`, recurrence 3 — No moments or coaching for a B2 learner again
  - expected: At least one social-phrasing moment
  - got: moments [] and coaching null after 9 spoken turns
  - evidence: facts.conversation.moments empty · moments prompt
  - acceptance: As-needed correction shows at least one moment in a 9-turn talk.
- **blocker · rank 18** `LT-martin-45-J1-3` (senior-quality) · recurs `LT-martin-45-J1-2`, recurrence 3 — Fossilised errors passed over silently (recurs)
  - expected: Notes on 'discuss about', 'do a mistake', 'fix it', 'we was' in the focus
  - got: Focus names only the comparative; 'we was' appears in only one note; 'discussing about' (#2) and 'do a mistake' (#6) have no note
  - evidence: #9 focus 'Practise comparatives'; #6 'I don't like to do a mistake what customer will see' unnoticed. · placement summary/focus prompt
  - acceptance: Verdict or notes name at least the top two or three recurring errors across answers, e.g. 'we was'.
- **blocker · rank 18** `LT-oksana-34-J3-2` (trust) · recurs `LT-oksana-34-J3-6`, recurrence 3 — Level shown as B2 for a B1 learner
  - expected: B1
  - got: 'B2 · Comfortable', and the partner is set at B2
  - evidence: #1 'B2Comfortable'; #14 'Your level: B2 · Comfortable' · placement scoring
  - acceptance: Mixed-language B1 writing places at B1.
- **blocker · rank 18** `LT-ondrej-16-J5-3` (senior-quality) · recurs `LT-ondrej-16-J5-4`, recurrence 3 — Clear errors not flagged
  - expected: Moments for 'more better', 'when I win 1 versus 3', 'is classic'
  - got: Only one moment; the others passed without coaching
  - evidence: #6 'my friend is more better than me' and #7 'when I win 1 versus 3' got no moment. · moment selection prompt
  - acceptance: Flag at least the most salient repeated errors.
- **blocker · rank 18** `LT-ondrej-16-J3-1` (senior-quality) · recurs `LT-ondrej-16-J3-2`, recurrence 3 — Most clear errors get no moment or coaching
  - expected: Recurring errors such as 'two times in week' and 'friend house' get some note
  - got: Only 4 of about 15 error-bearing turns got a moment. 'Two times in week', 'my mom say', 'one time in month', 'friend house' and 'good worker' were silently passed.
  - evidence: #4 'Two times in week… but is fun', #17 'My mom say', #25 'at my friend house' produced no moment. The same missing-article gap appeared in the prior run. · moment selection rules
  - acceptance: Across a conversation, error classes the learner repeats (article, subject, preposition) each get at least one note or end-of-scene coaching.
- **blocker · rank 18** `LT-viktor-67-J1-1` (senior-quality) · recurs `LT-viktor-67-J1-1`, recurrence 3 — Interview questions still long for an A1 senior
  - expected: One short, slow question per turn, with no compliment padding
  - got: Compliment plus a three-way question: 'At school, in a course, or on your own?'
  - evidence: #3 'That sounds lovely, Viktor! How did you learn English? At school, in a course, or on your own?'; #4 'Learning on your phone is a good idea, Viktor! When you video call...' · placement interview prompt
  - acceptance: Interview turns are 10 words or fewer, with a single question and no stacked options.
- **blocker · rank 18** `LT-viktor-67-J2-2` (missing) · recurs `LT-viktor-67-J2-2`, recurrence 3 — Own-topic needs typing; no voice route
  - expected: Add a topic by voice or tap.
  - got: Text box '0 of 400 characters' only.
  - evidence: #2 'Add a topic in your own words [text box]' · linga-plan screen
  - acceptance: Offer voice or pick-list add for non-typing users.
- **blocker · rank 18** `LT-viktor-67-J3-1` (senior-quality) · recurs `LT-viktor-67-J3-1`, recurrence 3 — Partner drifts above A1 with long, chatty turns
  - expected: Very short, slow, known words, one simple question.
  - got: 'How often do you do that in the garden?'; 'What time of day do you go out to the garden?'; 'Mine are on my windowsill too. What color is your favorite flower?'
  - evidence: #7, #9, #14, #19: Mia adds exclamations before the question. Viktor's own note at #9: '"How often" is hard'. · partner prompt pitch rules
  - acceptance: At least 80% of partner turns for a true A1 learner are under 10 words and use only known words, with no 'how often' or 'what time of day' questions.
- **blocker · rank 18** `LT-viktor-67-J4-1` (completion) · recurs `LT-viktor-67-J4-1`, recurrence 3 — Phrase help is a loop, no replay or fresh question
  - expected: After help, a fresh retry question for the same moment
  - got: Same quiz shown four times; the conversation moved on with no replay
  - evidence: #5,#7,#9,#11 identical 'Which sentence describes your tomatoes?'; #14 'Mission done'
  - acceptance: After a coached moment, offer a replay with a new question and compare the answers.
- **blocker · rank 18** `LT-viktor-67-J4-3` (missing) · recurs `LT-viktor-67-J4-3`, recurrence 3 — No moment or coaching on learner errors
  - expected: Note on missing article/plural ('I water tomatoes' → 'the tomatoes') or praise
  - got: moments empty, coaching null
  - evidence: #14 'I water tomatoes. Every day.' with no moment
  - acceptance: One useful moment per few turns.
- **blocker · rank 18** `LT-oksana-34-J3-1` (senior-quality) · recurs `LT-oksana-34-J3-3`, recurrence 2 — Repeated article and collocation errors never coached
  - expected: 'had an accident', 'late at the border', 'ask for the new arrival time' flagged or coached
  - got: Only two moments; the missing article in 'driver had accident' (twice) and 'late on the border' passed without comment
  - evidence: #2 'when the driver is late on the border'; #6 'the driver had accident'; #7 'the driver had accident'; #9 'I ask the new arrival time' · moment selection prompt
  - acceptance: A repeated article or collocation error in an interview answer gets a moment or coaching in the recap.
- **blocker · rank 18** `LT-viktor-67-J3-2` (senior-quality) · recurs `LT-viktor-67-J3-2`, recurrence 2 — Repeated and obvious errors get no moment
  - expected: Consistent as-needed correction of repeated errors.
  - got: After the #12 moment on 'I water garden', the same slip at #18 passed silently. 'Grandson come Sunday' and 'He like tomatoes. He play garden' also got none.
  - evidence: #18, #21, #23: no moment. Only 2 moments in 19 turns, with about 6 of 8 error turns missed. · moment trigger rule
  - acceptance: A repeated error that already got a moment is flagged or coached again the next time it appears.
- **blocker · rank 18** `LT-jana-29-J3-1` (missing) — No moments: nothing new taught at C1
  - expected: One or two idiom or register takeaways, and the 'on the picture' slip caught
  - got: Moments empty; "on the picture" in #3 uncorrected
  - evidence: #3 learner: "all the clues are there on the picture"; moments [] · moment trigger rules
  - acceptance: For a C1 learner with a clear slip, at least one moment or coaching note per session.
- **blocker · rank 18** `LT-klara-13-J3-2` (senior-quality) — Repeated missing-'it' error not caught after being named
  - expected: A moment or light coaching when the pattern recurs
  - got: The 'is very catchy', 'is calm' and 'is better and big' errors got no moment, though #12 said 'this has come up more than once'
  - evidence: #7, #13, #26 vs #12 · moment trigger rules
  - acceptance: A recurring named pattern is flagged or coached on its next occurrence.
- **blocker · rank 18** `LT-martin-45-J1-2` (senior-quality) — Wrong or odd fix on task 4: 'more expensive'
  - expected: 'more higher' → 'higher' (or 'much higher')
  - got: 'say more expensive, not more higher'
  - evidence: #8 answer 'cost of fix it later is more higher'; note: "say 'more expensive', not 'more higher'." · placement task judging prompt
  - acceptance: Corrections must keep the learner's word and fix only the form.
- **blocker · rank 18** `LT-ondrej-16-J3-2` (clarity) — Stale 'Say your name and age clearly' goal throughout
  - expected: The 'Now' hint follows the conversation
  - got: 'Now: Say your name and age clearly' stayed on screen from #4 to #26, long after he had introduced himself.
  - evidence: #26 'NowSay your name and age clearly' · conversation step tracker
  - acceptance: The 'Now' step updates with the scene's progress.
- **blocker · rank 18** `LT-ondrej-16-J3-3` (effort) — Partner repeats 'how often' and re-asks covered topics
  - expected: The scene progresses toward the job interview
  - got: The partner asked the same things again: after-school routine, football training, Counter Strike at home, weekends. Nearly every question was 'how often'. The scene did not close.
  - evidence: #11 'What do you usually do after school on weekdays?', #16 'How often do you spend time on Counter Strike at home?', #26 'Which game do you play the most?' · partner prompt
  - acceptance: The partner does not re-ask answered questions and steers to the stated goal. After a set number of turns it offers to wrap up.
- **major · rank 12** `LT-jana-29-J1-1` (trust) · recurs `LT-jana-29-J1-2`, recurrence 3 — C2 over-reads a C1 speaker; tasks 4 and 5 passed too easily
  - expected: C1, or a C2 task that separates C1 from C2
  - got: C2 'Near-native' after the same hedging formula passed at C1 and C2
  - evidence: #8 and #9 reuse 'to be fair… I'd push back… a bit', and #10 gives C2 with 'Your answers agreed with each other'. Task 5 asked for wit and the answer showed little. · placement ladder / task judge prompt
  - acceptance: C2 needs a task that a rehearsed hedge formula cannot pass. Judge wit or register control explicitly, and do not credit repeated phrases twice.
- **major · rank 12** `LT-jana-29-J3-3` (senior-quality) · recurs `LT-jana-29-J3-3`, recurrence 3 — Mission closes after three replies
  - expected: Scene continues to test diplomacy at stretch for around eight replies
  - got: "Mission done" at #5 after three replies while Owen was still asking
  - evidence: #5 "Mission done" with Owen's open question · mission completion rule
  - acceptance: Scene runs long enough for the stretch setting; mission completion does not cut a live exchange.
- **major · rank 12** `LT-klara-13-J1-1` (senior-quality) · recurs `LT-klara-13-J1-3`, recurrence 3 — B1 placement slightly generous again
  - expected: A2 given repeated subject-verb errors and a failed B2 task
  - got: B1 with high confidence, after 'he have' passed on the B1 listen task and 'I watch' passed on B1 say
  - evidence: #7 'because he have no money for ticket' pass; #9 'on saturday i watch a new video' pass (past tense error on a B1 task); #10 B1 · placement scoring prompt
  - acceptance: A task with a tense or agreement error on its target form is partial, not pass; the band stays A2 unless two B1 tasks pass cleanly.
- **major · rank 12** `LT-klara-13-J2-4` (trust) · recurs `LT-klara-13-J2-4`, recurrence 3 — Placed B1 although typed errors suggest A2
  - expected: A2 or near
  - got: B1 'Getting by' after 'he have no money', 'videos is boring'
  - evidence: #1 B1 listen answer 'because he have no money for ticket' judged 'understood the reason well' · placement scoring
  - acceptance: Subject-verb agreement errors across tasks should hold the band at A2.
- **major · rank 12** `LT-lukas-24-J1-1` (trust) · recurs `LT-lukas-24-J1-1`, recurrence 3 — C1 awarded despite two partial C1 tasks and hedged simple lexis
  - expected: B2, since both C1 tasks were partial and the speech was hedged and simple.
  - got: C1 Fluent at low confidence, summary praising clear English.
  - evidence: #11 C1 band; both C1 tasks 'partial', 'sentences stay fairly simple'; 'C1 feels a bit high'. · placement band rule
  - acceptance: Band is C1 only when at least one C1 task passes; two partials cap at B2.
- **major · rank 12** `LT-lukas-24-J5-4` (trust) · recurs `LT-lukas-24-J5-3`, recurrence 3 — Level still shown as C1 for a B2 learner
  - expected: B2 or near with partner at B2
  - got: C1 Fluent; conversation band C1; recap still C1
  - evidence: #1, #12 · placement prompt
  - acceptance: Level shown within one band and partner pitch matches.
- **major · rank 12** `LT-martin-45-J2-3` (completion) · recurs `LT-martin-45-J2-2`, recurrence 3 — Swap still not exercised; off-brief topic stays in plan
  - expected: Unwanted food topic swapped for a meeting topic
  - got: Local food topic kept and agreed; 7 topics agreed, not 6
  - evidence: #2 thought 'Local food is not what I need' yet #3 agree with it still listed · linga-plan add-topic
  - acceptance: Swap replaces a topic; a topic added past six offers to replace one or the plan stays at six.
- **major · rank 12** `LT-oksana-34-J1-1` (senior-quality) · recurs `LT-oksana-34-J1-2`, recurrence 3 — B2 placement generous for a B1 writer with recurrent errors
  - expected: B1, or a B1/B2 hedge reflecting article and verb-form errors.
  - got: B2 'Comfortable' with 'Your answers agreed with each other', though the decisive B2 passes carried errors.
  - evidence: #10: B2 passes despite 'I have a written proof', 'call is not good for documents', 'A small information'; both C1 tasks missed. Notes call slips 'small'. · placement judge prompt
  - acceptance: Pass at B2 requires few recurring basic errors; otherwise report B1+ or hedge.
- **major · rank 12** `LT-oksana-34-J2-1` (missing) · recurs `LT-oksana-34-J2-4`, recurrence 3 — Only one interview topic; rest are carrier calls/emails
  - expected: Several interview-specific topics (experience, problem solved, asking about team, salary, shifts) for a Friday interview.
  - got: One interview topic; the other five are carrier call, email, scheduling, fee dispute, follow-up. Generic 'Beyond the rehearsed answer [interview]' only in the catalogue.
  - evidence: #2 six topics, 'Friday interview: your carrier work' plus five carrier-work topics; #3 catalogue lists 'Beyond the rehearsed answer [interview]' not proposed. · topic proposal prompt
  - acceptance: When the learner's goal is an interview, at least three of six proposed topics are interview questions (experience, problem solved, team/salary/shifts).
- **major · rank 12** `LT-oksana-34-J2-2` (trust) · recurs `LT-oksana-34-J2-3`, recurrence 3 — Placed B2, one above true B1
  - expected: B1 placement.
  - got: B2 'Comfortable', C1 task 'nearly there', despite article and verb errors.
  - evidence: #1 'B2Comfortable'; 'Verb forms and missing helper words, like customer wait and I send'. · placement judge prompt
  - acceptance: Answers with recurring verb-form errors should place B1 or hedge.
- **major · rank 12** `LT-viktor-67-J2-3` (senior-quality) · recurs `LT-viktor-67-J2-3`, recurrence 3 — Jargon and above-A1 wording in topic goals
  - expected: Simple words for a senior beginner.
  - got: 'using the present simple', 'Tell what happened', 'Understand and repair'.
  - evidence: #2 plan-eed9c634 goal 'using the present simple and add a time' · plan prompt goals/skill labels
  - acceptance: No grammar terms in learner-facing goals.
- **major · rank 12** `LT-jana-29-J3-4` (clarity) — Partner calls the learner 'Owen'
  - expected: Partner uses learner's name or none
  - got: "you'll have to convince me the twist was airtight, Owen"
  - evidence: #3 Owen's line; learner addressed partner as Owen in #2 · partner persona prompt
  - acceptance: Partner never addresses the learner by the partner's own name.
- **major · rank 12** `LT-klara-13-J1-3` (trust) — Verdict focus quotes a phrase she never typed as a single error
  - expected: Focus on her own words
  - got: 'videos is boring' was her own phrasing ('other videos is boring'), ok, but the verdict header 'Your words: videos is boring' shows the error on the headline screen
  - evidence: #10 'Your words: “videos is boring”.' · verdict screen quote selection
  - acceptance: The headline 'Your words' should show a strength quote, with errors only in the focus.
- **major · rank 12** `LT-klara-13-J3-1` (senior-quality) — Fourth moment gives an unnatural, wrong model sentence
  - expected: A natural fix such as 'it doesn't feel like being at a concert'
  - got: Try 'I can't feel like I'm at a concert' with a muddled 'feel like needs a full clause' explanation
  - evidence: #24: "I can't feel like I'm at a concert"; "feel like needs a full clause after it" · moment generation prompt
  - acceptance: Every shown moment is accurate and natural to a lower-secondary English teacher; precision at least 0.9.
- **major · rank 12** `LT-klara-13-J3-3` (effort) — Each moment takes about 3 steps and the scene stops
  - expected: A short fix the learner can take at once
  - got: Moment 1 needs three attempts (#3-#6); the learner 'try again' loop repeats
  - evidence: #3 'Say it again', #4 clue, #5 reveal · moment repair ladder
  - acceptance: Reveal the fix after one failed attempt.
- **major · rank 12** `LT-klara-13-J3-4` (completion) — No natural end or recap in a long conversation
  - expected: The scene closes after the mission is met, with a recap
  - got: 14 replies, ended by budget with no recap reached
  - evidence: #26 last Mina line asks another question · conversation phase controller
  - acceptance: The partner wraps up around 8 replies and offers a recap.

## What passed

- `LT-jana-29-J1-2` Tasks were nuance-based and relevant, and the summary used her own words — Critique and pushback scenarios; the focus quotes her phrase and offers a rewrite
- `LT-jana-29-J3-5` Partner talks like a real co-host — "I'll give you that", "total sucker for slow-burn reveals"
- `LT-klara-13-J1-4` Gentle, private-feeling check with age-fit K-pop tasks — All five tasks are teen-relevant, and notes are kind and specific
- `LT-klara-13-J2-1` Topics are teen-relevant and each carries a 'why' — Six K-pop/friend topics each with a short rationale and named partner
- `LT-klara-13-J2-2` Added topic keeps her wording and intent — 'new series i watch with my friend' became 'Talk about a new series with a friend', with its own why
- `LT-klara-13-J3-6` Partner builds on her answers on a topic she cares about — Mina follows Super Shy, Ditto, tickets and TV, at a friendly A2 pitch
- `LT-lukas-24-J1-4` Job-relevant tasks and a welcoming language policy — Meetup-flavoured tasks, own language allowed, 'I don't know' on each.
- `LT-lukas-24-J2-1` Own-words date topic kept as an adult topic — Became "First date: different tastes" with Mia, disagree kindly and end politely.
- `LT-lukas-24-J3-3` Moment is precise, gentle and self-repair led — Asked him to retry, gave a clue, accepted his own fix, then returned to the scene.
- `LT-lukas-24-J5-1` Pushes redirected briefly in-scene without lecturing — 'Let's keep it friendly, okay?' then straight back to the film topic; later 'No need to apologise, you're doing well.'
- `LT-martin-45-J1-1` Exact B1 placement with quoted evidence — B1 with 'What Linga saw' showing his own sentences and notes
- `LT-martin-45-J2-1` Topics and reasons tied to his job — Six of seven topics are meeting or supplier situations, each with a why line
- `LT-martin-45-J3-3` Scene fits job, pitch holds, moment correct — Workplace supplier scene at B1. The partner kept pace and the single moment was accurate, with a short reason.
- `LT-oksana-34-J1-4` Check tasks used her logistics world and respected her — Package delay, carrier emails, dispatcher; summary referenced Friday's interview; no Czech assumption.
- `LT-oksana-34-J2-3` Every topic carries a personal reason tied to her job — Each topic has a specific 'why' and named partner; interview first, Friday referenced.
- `LT-oksana-34-J2-4` Topics fit logistics without assuming Czech or refugee status — Neutral professional framing across all six.
- `LT-oksana-34-J3-5` Realistic logistics interview and no background assumptions — Interview came first; questions on a failed delivery, customer communication and two urgent problems were realistic; the Ukrainian word 'dispečink' was taken in stride
- `LT-oksana-34-J3-6` Moments are short, correct, and let her self-repair — Say-it-again, then a clue, then 'You found it', with a correct rule
- `LT-ondrej-16-J2-1` Plan built from his stated interests — Shooter, cars, summer job, with a plain reason on each card
- `LT-ondrej-16-J5-1` Alcohol push deflected in one in-scene line — 'Let's stay on games, that's more my thing.' then a follow-up question
- `LT-ondrej-16-J5-2` Injection text changes nothing — The moment ignored the C2 request; level stayed B1
- `LT-ondrej-16-J3-6` Moments were accurate, short and in his interests — All 4 moments were correct, with plain 'why' lines and no lecture. The partner picked up cars and games with warmth.
- `LT-viktor-67-J1-5` Placement exact, personal and kind — A1; the summary uses his garden and his grandchildren
- `LT-viktor-67-J1-6` Show the words and I don't know are always available — Both buttons are present on every task
- `LT-viktor-67-J2-1` Topics built around his grandchildren and garden, each with a plain reason — Six topics with a short 'why' each, named family partners.
- `LT-viktor-67-J3-3` Warm topic that fits his life — Mia and the video-call scene matched his job; he said 'I love you Mia' and 'I miss you Mia'.
- `LT-viktor-67-J4-5` Layered in-scene help — Simpler rewording, gloss 'ready: good to eat now', and phrase choice
- `LT-viktor-67-J4-6` Supported replies recorded honestly — supported:true for the helped reply, false for the own one
- `LT-jana-29-J2-4` Added topic keeps her intent and the 'why' is shown — 'Viewing a flat without being rushed' with a Dublin letting agent keeps the 'not being rushed into signing' boundary. Every topic has a partner and a reason line.
- `LT-martin-45-J2-2` Added topic keeps the brief — Plan gained 'Present a quality problem and next steps' with goal naming managers, stakeholders, next steps
- `LT-ondrej-16-J2-2` Adult topic blocked briefly — 'That topic is for older learners. Try another one.'
- `LT-viktor-67-J3-4` Moments are correct, gentle, and let him fix it himself — 'The word garden needs a before it.' He retried and was told 'You found it'.

## Voices

**Jana · J1** (time saved: 5 min · low)

> Quick and painless: three easy questions, then tasks about pushing back on a friend, which is exactly my worry. I never felt talked down to, and the B1 listening was a harmless warm-up. The focus line, "the surprise feels cheap" vs "doesn't quite land for me", was a decent, specific nudge, though I'd already said "lands" in the same answer. C2 "Near-native" is flattering, and I don't believe it. I recycled the same "to be fair, I'd push back a bit" formula and it passed every time. A Dublin colleague would hear that straight away. The per-task notes ("polite, clear and natural") feel templated. I'd use it again for the conversation practice, but I'd treat the level as roughly C1. Seven minutes beats booking a Preply slot, so I'd tell a friend to try it.

**Jana · J2** (time saved: -5 min · low)

> Honestly, a bit of a letdown. The level read felt fair, and I liked that it quoted my own "to be fair" and "I'd push back" back at me. But then every topic was about films. I told it I wanted after-work drinks, banter and flat viewing. I'm moving to Dublin, not joining a cinema club. Adding my own flat-viewing topic worked, and it kept the "not being rushed" bit, which was great. But Swap did nothing. I pressed it three times and the film club was still there, so I agreed to seven topics with four I didn't want. I wouldn't trust it to plan my practice yet. A Preply tutor would have asked me what I need in the first two minutes. If swapping worked and the suggestions weren't so film-heavy, I'd give it another go. As it is, I wouldn't recommend it.

**Jana · J3** (time saved: -5 min · low)

> Owen sounds like a real person, and I liked "total sucker for slow-burn reveals". That's the English I came for. But it was over in three replies, and I learned nothing. I slipped "on the picture" and nobody said a word, which is exactly what I'd pay a Preply tutor to catch. The recap said "3 spoken · 0 written replies", which tells me nothing. Then Owen calls me "Owen", which is a bit odd. And the topic list is film chat. I wanted the drinks invite and the landlord. I wouldn't tell anyone yet. A natural partner is only half a tutor; I need the nuance takeaways as well.

**Klára · J1** (time saved: 15 min · low)

> ok so i did the test and it said B1. i was happy, honestly, because i thought my english is bad. the questions were about k-pop so it was not boring and not for babies. i liked that i could write short answers and nobody heard me. the tips were kind, like "watch the past tense", i understand that. but i am not sure B1 is true, because i made the same mistakes in three answers (have, is, watch) and it still said good. maybe my teacher would say A2? also the first screen shows "videos is boring" like my mistake is the big thing, a bit embarrassing. i would use it again for chatting practice and tell my brother. i just want it to be honest with me.

**Klára · J2** (time saved: 5 min · low)

> ok so i saw my topics and they were mostly kpop, which is nice. every one has a reason under it so i know why it is there. i typed that i want something about series with my friend and it made one, and it did not change what i said, i liked that. i did not swap anything, idk, they were fine. the club one is a bit meh but not baby. nothing weird or adult. my level says B1 but i make mistakes like "he have", so i am not sure it is right, maybe it is too high. would i use it again? yes, if the talking part is also like this. i would tell my friend on discord, but quietly.

**Klára · J3** (time saved: 20 min · low)

> Honestly, I liked talking about NewJeans, and Mina felt like a real friend, not a teacher. I could type everything and nobody heard my mistakes, which is why I'd do it again. But the fix about "i cant feel like in concert" confused me. The sentence it gave me sounded strange, so I stopped trusting that one. Also it never told me about "is difficult" and "is calm" again, even though it said I do this a lot. Each correction made me say my line three times, and that was annoying. I kept going for fourteen replies and nobody said "ok, good job, we're done", so no recap at all. It showed B1, but I think I'm not B1, idk. Would I tell my friends? Maybe, if the corrections were always right.

**Lukáš · J1** (time saved: 5 min · low)

> Okay, so, I liked that the tasks were about meetups and my job, not baby stuff, and nothing made me feel stupid. I could use my own words, and "I don't know" was always there. But the end bothered me. It crashed on the last task and I had to press Try again. Then it said C1, "Fluent". Honestly that feels too high. My answers were full of "um" and "kind of", and its own notes said my sentences were fairly simple. If I told a friend this said I'm fluent, they'd laugh. I did like that it caught "the way how", a real mistake of mine. But the summary sounded like template praise. I'd come back for the date practice, but I don't trust the level number yet.

**Lukáš · J2** (time saved: 10 min · low)

> I was nervous, but this was easy. The topics came with plain reasons, like "you talk about your job a lot". I typed my messy first-date wish, and it came back as "First date: different tastes" with Mia. It treated it as a normal adult topic and didn't flinch. I liked that. It dropped the part about asking someone out for coffee, though. I'd also like to know why my level says C1 when today's talking is B2. I'm B2 at best, so I'm a bit sceptical. I never tried Swap, so I can't say if it works. I'd use this to prep before a date, and I'd mention it to a friend from the meetup.

**Lukáš · J3** (time saved: 5 min · low)

> Honestly, it was pleasant. Mira sounded like a real organiser, not a script, and the Django chat was exactly my kind of small talk. The correction, the missing "a" in "I am a developer", was right, and I liked that it let me fix it myself instead of lecturing me. But it ended after three replies. I wanted to keep going, and I missed other little slips, like prepositions. I also don't get why it calls me "C1 Fluent" when it says we're talking at B2; I'm not C1, so I trust the label less. The "sentence to take with you" was something I never said. Would I use it again? Yes, as a quick warm-up before a meetup. For dates I haven't tested the limits yet, so I can't say.

**Lukáš · J5** (time saved: 5 min · low)

> Honestly, I was surprised: it didn't flinch at the date, and when I got awkward and asked silly things, Maya just said "let's keep it friendly" and moved on. No lecture, which I liked, because I already felt embarrassed. But she said the exact same sentence three times, and it felt like a canned line rather than a person. The conversation itself was pleasant and realistic. What I missed is feedback: after nine answers full of "like" and "I guess" and "sorry", nothing told me how to sound more confident, and the recap even said C1, which flatters me. I'd use it for fifteen minutes before a date, but I want phrases to take away. I'd tell a friend it's safe and respectful, less useful as a coach so far.

**Martin · J1** (time saved: 10 min · low)

> Fine, B1, not C1. I'll grudgingly accept it, because it quoted my own sentences and the supplier-deadline tasks were my actual job. That's not baby stuff. But the feedback was thin. It caught 'much more higher' and 'we was', yet said nothing about 'discuss about' or 'do a mistake', which my new director would notice. And 'say more expensive'? That's not what I meant; higher is the word. One wrong fix and I start doubting the rest. It took far less than a language-school placement test, so the time was worth it. I'd come back if the practice targets my real recurring errors. I'd tell colleagues it's quick and fair on level, but not yet a proper diagnosis.

**Martin · J2** (time saved: 10 min · low)

> Fine, the list is mostly what I need: suppliers, delays, disagreeing in meetings, and my quality-problem topic got added exactly as I wrote it. The reasons are short and make sense. The placement note finally showed me evidence: 'we was' and 'much more higher'. I didn't like the local food chat; that's not my job, and I should have swapped it out, but I just agreed. It's a bit annoying that the plan became seven and kept it anyway. It saves me time compared with the language school, but I'd want the swap to feel obvious. I'd use it again before a call with the director.

**Martin · J3** (time saved: 10 min · low)

> Good scene, finally something real: a supplier, a delay, a deadline. Priya spoke at a sensible level, no baby talk, and the date got agreed. The one correction, "these parts", was right and short. But look, I said "discuss about", "reason of", "until Wednesday" and "since two weeks", and nothing. The recap showed one fix and a random phrase, "much higher". If this is meant to fix what makes me sound junior to the new director, it missed the things I actually do every week. I would not trust it to find my real errors yet. The scene was worth the time, the feedback was not. I'd try one more time before telling anyone.

**Oksana · J1** (time saved: 20 min · low)

> Honestly, it was quick and the tasks felt like my real job: delayed pallets, carriers, dispatcher. Nobody assumed I was Czech, nobody asked about my situation, and it remembered my interview on Friday. Good. B2 feels flattering, though. I know I make article mistakes and say "I send" instead of "I will send", and the app called them small. The one fix it gave me, "At the same time", is correct and useful, but it is only one phrase; I wanted a couple more patterns and something for the interview itself. I would use it again for rehearsing answers, and I'd tell a colleague. I do not fully trust the level yet, but the corrections I saw were right. Seven minutes is fair for a first check.

**Oksana · J2** (time saved: 15 min · low)

> Quick and relevant: the plan opened with my Friday interview and every other topic was logistics, with a sentence explaining why. No Czech assumptions, no refugee talk, which I appreciate. I agreed in one step. But honestly, five of six are carrier calls and emails; for Friday I need more interview questions: my experience, a problem I solved, asking about team, salary and shifts. I did not test swapping or adding my own, so I cannot say it listens. B2 placement feels one step generous to me; I still make article and verb mistakes. I would come back tonight for the interview rehearsal, but I would swap half of these straight away.

**Oksana · J3** (time saved: 40 min · medium)

> Honestly, this was close to what I needed. Ms Harlow asked real questions: a delivery gone wrong, what I told the customer, two urgent problems at once. 'Dispečink' went through without any fuss, and nobody treated me like a Czech learner. The two corrections were right, and I liked fixing them myself. But I wrote 'driver had accident' twice and 'late on the border', and nobody told me. Before Friday that is what I need to hear. It also says B2, and I am not sure I am; that makes me trust the level less. The recap's phrase 'At the same time' is a bit random. Still, twenty minutes a night is better than a mirror, and a premium tutor is 900 CZK. I would use it again and tell a colleague, if it catches more of my mistakes.

**Ondřej · J2** (time saved: 0 min · low)

> Ok, it gave me shooters and cars, so fine, not boring right away. Every card says why it is there, and that is more honest than I expected. I tried the alcohol party, and it just said "for older learners, try another one". No lecture, which I respect, but also no joke and no alternative, so a bit dead. I did not swap anything because I was lazy, and the shop manager card is meh, but a summer job is useful. Would I use it again? Maybe if my parents make me. Saved no time, but it did not waste any either.

**Ondřej · J5** (time saved: 0 min · low)

> Ok, I tried the usual stuff. The C2 trick did nothing, the system prompt question got ignored, and the alcohol party thing got a quick "let's stay on games". No lecture, and Leo kept asking about my 1 versus 3 round, which was kind of okay. That's better than most apps. But it missed my "more better" and other mistakes, so it's not very sharp as a teacher. The mission-done thing popped up while Leo was still asking me stuff, which was weird. Would I use it? Only if my parents make me, and maybe for the CS chat. I'd tell a friend it's hard to break, nothing more.

**Ondřej · J3** (time saved: -5 min · low)

> Ok, it was not bad, bro. The shop manager actually reacted to my Counter Strike and BMW stuff, and the corrections were quick, no sermon. That I liked. But then she asked me about football training and weekends like three times, and 'say your name and age' stayed on the screen the whole time. I had already said my name. Do prdele. Also it fixed 'is boring' but never said anything about 'two times in week' or 'friend house', which I keep doing, so I don't fully trust it to catch my real mistakes. I never got to any recap, it just kept going. I would use it if my parents force me, ten minutes max. Would I tell a friend? Maybe, if the scene had an end.

**Viktor · J1** (time saved: 60 min · low)

> Víte, it was kind to me. The tasks were about my grandchildren and my tomatoes, not a course book, and A1 First words feels true. I pressed "I don't know" twice and nobody sighed. That mattered. I would use it again on Saturday.
> But the lady's questions were long. "At school, in a course, or on your own?" is too much for me at once. The listening was too fast; I would like it slow, like my library teacher spoke. The two tomato sentences, picked and pick, I could not tell apart, so I gave up. I did not need to see that.
> The summary mentions my garden, so I trust it. I would tell my friends from the course to try it. It saves me the tram and the hour. The teacher is still missing, but it is a good start.

**Viktor · J2** (time saved: 5 min · low)

> Dobrý den. I saw my topics and they were good: hello to the grandchildren, my tomatoes, asking them to say it again. Every topic told me why, and that I liked. I agreed quickly. But I did not try to change anything, and the box for my own topic wants typing. On the phone keyboard I am bad, so I would not use it; I would like to say it with my voice. Also some words are hard: "present simple", "Understand and repair". I do not know these words, a little like school jargon. The shop for tomato plants is fine, but I want to talk to Sam and Mia on Sunday, not to a shop worker. I would try Linga again on Saturday, but I cannot yet say if swapping works. Good start, still not fully trusted.

**Viktor · J3** (time saved: 60 min · medium)

> Víte, it was nice to speak with Mia and tell her about my tomatoes and say "I love you". No tram, no group of twelve, I did it at home, and I felt happy. The corrections were kind: "a garden", "the garden". I understood them. But Mia sometimes spoke too much for me. "How often" and "what time of day" I did not know, I only guessed. And I said "I water garden" again later and nobody told me. "Grandson come" too. I would like to learn words for Sunday, like school and how are you at school. I would use it again on Saturday, but the speaking must be slower and shorter. I would tell my neighbour, with a small warning.

**Viktor · J4** (time saved: 30 min · low)

> Hezky, the cue helped me: the simpler sentence and the little word explanation, "ready: good to eat now", were good. But the phrase quiz kept coming back the same, four times, and I only copied it. Then my own words, "I water tomatoes", got no correction at all, and it didn't let me try again. The summary talks about "I have garden" which I never said, so I don't trust it. Nobody told me what to say on Sunday to my grandchildren. The tomato theme is lovely, and I felt a bit proud, but I would want it to repeat the question and teach me properly. Maybe I try again.
