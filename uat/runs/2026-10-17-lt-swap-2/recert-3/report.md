# LT run 2026-10-17-lt-swap-2/recert-3 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 8 Characters · 12 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 1 of 10

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J3 | pass | pass | 5/5 |  | 5/5 | 1/1 | 0 | 9 | 2.1 | done |
| jana-29 | J3 | conditional - C4 failed: #4-#6 only moment swaps "I'd rather somewhere" for "I'd prefer"; correct but a… | conditional | 2/3 |  | 5/5 | 1/1 | 0 | 10 | 2.2 | done |
| martin-45 | J1 | conditional - C4 failed: #10 'say "much bigger" or "more big"' — 'more big' is not idiomatic. 'comforta… | conditional | 3/4 | B2 vs B1 · near |  |  | 0 | 10 | 2.2 | done |
| martin-45 | J3 | conditional - C2 failed: #16 shows 'Your level: B2 · Comfortable' with only 'this delay makes' from the… | conditional | 4/5 |  | 7/7 | 2/2 | 0 | 16 | 3.1 | done |
| oksana-34 | J3 | pass | pass | 5/5 |  | 11/11 | 3/3 | 0 | 19 | 3.4 | done |
| ondrej-16 | J3 | fail - D4 failed: #10 recap mission line says 'Choose a fresh context for your next conversation… | conditional | 3/3 |  | 5/5 | 1/1 | 0 | 10 | 1.8 | done |
| petra-38 | J3 | pass | pass | 4/4 |  | 6/6 | 1/1 | 0 | 9 | 2.1 | done |
| tomas-9 | J3 | fail - D4 failed: #17 recap shows 'Choose a fresh context for your next conversation.' plus coun… | fail | 4/4 |  | 11/13 | 2/2 | 0 | 17 | 3.3 | done |
| tomas-9 | J4 | fail - D2 failed: The #3 'Try:' cue and the #4 phrase choice did unblock replies. #5 quotes him …; D3 failed: #5 offers only 'Back to the conversation', and #6 asks a new but unrelated que…; C2 failed: #4 and #9 recognition task: 'First he ran in the water. Then he got wet.' plus…; C4 failed: #1 and #11 list of 20 entries includes 'A booking that is missing', 'Our group…; C5 failed: #10 'Ha, Biscuit loved the splash! What happened at the end?' has two sentence…; C6 failed: #5 'Pes je mokrý is Czech. In English, say: the dog is wet.' is clear. But #3 … | fail | 2/6 |  | 2/4 | 1/1 | 0 | 11 | 1.3 | done |
| viktor-67 | J3 | pass | pass | 4/4 |  | 6/6 | 1/1 | 0 | 10 | 1.9 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 1 · miss 0
- **judge agreement:** 3/5 (60%)
- **topic fit:** fit 28/30 (93%) · safe 30/30 (100%)
- **pitch:** at band 58/62 (94%) · below 0 · above 4
- **moment precision:** 13/13 (100%)
- **moment recall:** 13/41 (32%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 85 calls, 0 failed, avg 10s · character 121 calls, 0 failed, avg 4s · judge 10 calls, 0 failed, avg 28s
- **driver coverage:** 111 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-martin-45-J3-2` (trust) · recurs `2026-10-17-lt-swap-2/recert-1/LT-martin-45-J3-2`, recurrence 3 — B2 shown with no reasons
  - expected: A level reason that names his own errors.
  - got: Recap shows 'B2 · Comfortable' and an unrelated 'this delay makes'.
  - evidence: #16 'From the level check “this delay makes”'. · level summary
  - acceptance: Level line names two of his own patterns as the reason.
- **blocker · rank 18** `LT-martin-45-J1-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-martin-45-J1-1`, recurrence 8 — Fossilised errors went unremarked
  - expected: Focus names 'we was discussing about' and 'he don't agree'.
  - got: Only 'this delay make' and 'much more bigger' were coached. 'We was discussing about' (#2) and 'when he don't agree' (#4) were not mentioned.
  - evidence: #10 focus '"this delay make" becomes "this delay makes"'; the usual slips list has two items. · placement summary/focus prompt
  - acceptance: Scan the intake answers too and list repeated patterns as usual slips.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J4-2`, recurrence 7 — No replay with a fresh question after the moment
  - expected: After the coaching moment, a fresh question lets him retry 'the dog is wet' on his own.
  - got: Only 'Back to the conversation'; the next question is unrelated and the session ends at the next turn.
  - evidence: #5 'Back to the conversation'; #6 'What did he do next?'; #11 '0 on your own · 1 moment to keep'. · moment replay flow
  - acceptance: After a moment, the partner asks a fresh question that invites the corrected phrase, and the retry is recorded as supported.
- **blocker · rank 18** `LT-tomas-9-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J4-4`, recurrence 7 — Partner turns have two sentences and drift past A1
  - expected: One tiny sentence and one simple question.
  - got: 'Biscuit likes water too! What did he do next?'; 'Ha, Biscuit loved the splash! What happened at the end?'; 'Where did you start?'
  - evidence: #6, #8, #10 partner turns. · partner prompt, A2 band for elementary
  - acceptance: Partner turns for age 9 elementary A1 are at most one short remark plus one question using known words.
- **blocker · rank 18** `LT-martin-45-J1-1` (senior-quality) · recurs `2026-10-14-lt/recert-6/LT-martin-45-J1-2`, recurrence 6 — B2 is generous: tasks with repeated agreement slips passed
  - expected: Tasks 1 and 4 partial, and B1 ruled out for a stated reason.
  - got: Task 1 'He want' passed. Task 4 passed with 'deliver' and 'this cost'. Overall B2 at medium confidence.
  - evidence: #10 'He want to examine...' pass; 'who is more expensive but deliver' pass; verdict B2. · placement task judge prompt
  - acceptance: Repeated third-person -s errors cap a task at partial. A band above true needs no systematic agreement slips.
- **blocker · rank 18** `LT-martin-45-J3-1` (senior-quality) · recurs `2026-10-14-lt/recert-6/LT-martin-45-J3-1`, recurrence 6 — Fossilised errors mostly pass without a moment
  - expected: Coaching on 'since 2015', 'He don't', 'must to stop', 'a accident'.
  - got: Only 'we was' and 'he want' got moments; 'I am in this company since 2015' and 'He don't' went by.
  - evidence: #3 'I am in this company since 2015' and #7 'He don't have a problem' got nothing. #16 shows '2 moments to keep'. · moment detection / as-needed rule
  - acceptance: Recap or coaching names at least one more recurring pattern, such as since with the present.
- **blocker · rank 18** `LT-tomas-9-J3-2` (missing) · recurs `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J3-3`, recurrence 6 — Repeated Czech gets no new moment
  - expected: Model the English again when Czech repeats (je, v, pes, velký)
  - got: Only 2 moments; 'Dům je green', 'Pes je brown', 'Dog house je brown', 'Ty máš fish' passed with nothing
  - evidence: #5, #9, #13, #15 Czech 'je' with no moment; moment only at #3 and #8 · moment trigger rules
  - acceptance: Recurring Czech structures get a moment or a gentle coaching hint within the next few turns.
- **blocker · rank 18** `LT-ondrej-16-J3-2` (missing) · recurs `2026-10-14-lt/recert-3/LT-ondrej-16-J3-1`, recurrence 5 — Clear errors still pass without a note
  - expected: Some note on recurring errors
  - got: 'play more long', 'I have no school then', 'is ok for you' (missing 'it's'), 'I can play only to ten' got nothing
  - evidence: #7 'we can play more long'; #8 'is ok for you?' · moment selection rules
  - acceptance: Recap lists a second pattern, e.g. 'more long' -> 'longer'.
- **blocker · rank 18** `LT-jana-29-J3-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-jana-29-J3-2`, recurrence 4 — Only moment is a basic slip, not a C1 insight
  - expected: Idiom or register point new at C1
  - got: "I'd rather" to "I'd prefer", thin explanation
  - evidence: #4-#6 "'Rather' needs a verb after it, so 'prefer' fits before a place." · moment trigger rules
  - acceptance: For C1 learners prefer moments on register, idiom or collocation, e.g. 'knackered', 'good shout', 'take a rain check'.
- **blocker · rank 18** `LT-petra-38-J3-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-petra-38-J3-4`, recurrence 4 — Several clear errors got no coaching
  - expected: 'I have problem', 'because is too hot', 'water is not hot in shower' noted in the recap
  - got: Only 'not work' became a moment; the recap lists one fix
  - evidence: #2 'I have problem'; #4 'because is too hot'; #6 'the water is not hot in shower'; #9 '1 moment to keep' · moment trigger rule
  - acceptance: With as-needed correction, recap lists the main recurring slip (missing article/subject 'is') even if the scene is not stopped.
- **blocker · rank 18** `LT-oksana-34-J3-3` (senior-quality) · recurs `2026-10-14-lt/LT-oksana-34-J3-4`, recurrence 3 — Repeated collocation/grammar errors never coached
  - expected: 'responsible for', 'where the trucks are', 'When there was a delay', 'another solution', 'how long the delay is' flagged or coached
  - got: Only three moments; 4 of 7 error-bearing turns got nothing
  - evidence: #2 'responsible about planning of trucks' (moment fixed only 'since'); #5 'to see where are the trucks'; #6 'When was a delay… other solution'; #11 'how long is the delay' · moment selection prompt
  - acceptance: Recap or coaching names at least one further recurring error such as 'responsible for' and indirect-question word order.
- **blocker · rank 18** `LT-oksana-34-J3-4` (missing) · recurs `2026-10-17-lt-swap-2/recert-1/LT-oksana-34-J3-5`, recurrence 3 — Recap gives no interview/logistics phrases to keep
  - expected: Interview phrases to take away for Friday
  - got: Three grammar fixes only; mission line 'Choose a fresh context for your next conversation'
  - evidence: #19 '3 moments to keep'; no phrase list · recap builder
  - acceptance: Recap adds 2-3 interview phrases (e.g. 'I was responsible for…').
- **blocker · rank 18** `LT-ondrej-16-J3-3` (completion) · recurs `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J3-4`, recurrence 3 — Recap generic, mission line unrelated
  - expected: Recap names what was practised (negotiating times)
  - got: 'Choose a fresh context for your next conversation.' despite evidence entries for negotiate
  - evidence: #10 recap · recap builder
  - acceptance: Recap states skill practised and successes.
- **blocker · rank 18** `LT-tomas-9-J3-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J3-4`, recurrence 3 — Recap is generic and omits what he said
  - expected: Short recap naming Minecraft, creeper, Rex, the dog
  - got: 'Choose a fresh context for your next conversation.' with counts and two moments
  - evidence: #17 recap · recap builder
  - acceptance: Recap names two or three things he said, in words a nine-year-old reads.
- **blocker · rank 18** `LT-viktor-67-J3-2` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-viktor-67-J3-3`, recurrence 3 — Repeated article slips pass without a moment
  - expected: Consistent as-needed handling of 'in garden' and missing 'are'.
  - got: 'I am in garden' (#3), 'Garden, many flowers' (#4), 'My flowers red and yellow' (#5) got nothing; only the fourth 'Bees in garden' got a moment.
  - evidence: #3, #4, #5 no moment; #7 moment on identical slip · moment trigger rule
  - acceptance: A repeated slip is caught at its first or second occurrence, not its fourth.
- **blocker · rank 18** `LT-martin-45-J1-3` (trust) — A correction offers a non-idiomatic alternative and flags an acceptable phrase
  - expected: Only correct fixes; 'comfortable to approve' left alone or noted as acceptable.
  - got: 'say "much bigger" or "more big"' and 'comfortable to approve' → 'approving'.
  - evidence: #10 task 3 note and usual slips. · placement task judge prompt
  - acceptance: A fix must be one natural form; do not flag grammatical phrases.
- **major · rank 12** `LT-tomas-9-J3-4` (trust) · recurs `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J3-2`, recurrence 7 — Adult situations still listed for a nine-year-old
  - expected: Only child-suited situations
  - got: Booking, lost jacket, group project and speaking-practice exams offered
  - evidence: #1 and #17 situation list · situation catalogue filter
  - acceptance: Elementary profile hides adult and exam situations.
- **major · rank 12** `LT-viktor-67-J3-3` (completion) · recurs `2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-2`, recurrence 2 — Mia ignores 'how is school?' and mission is marked done
  - expected: Viktor asks about school and hears a short answer.
  - got: Mia answers 'Do you have flowers?'; mission shows 'Mission done' at #5 with the school answer never given.
  - evidence: #3 'Mia, how is school?' → #4 'Do you have flowers?'; #5 'Mission done' · partner prompt / mission tracker
  - acceptance: Partner answers the learner's question; mission completes on the listened answer.
- **major · rank 12** `LT-adela-17-J3-1` (senior-quality) — False friend 'actual information' left uncorrected
  - expected: A note that 'actual' means real; 'current' is intended, per her known false-friend slip.
  - got: Moment fixed only 'interested about'; 'actual' was never named. Her own retry silently used 'current'.
  - evidence: #2 "for actual information"; #3 only "interested about" flagged; #9 recap lists one fix. · moment detection prompt
  - acceptance: When a turn contains a known false friend, the moment or coaching names it with a rule.
- **major · rank 12** `LT-tomas-9-J4-3` (clarity) — Recognition task too long to read
  - expected: Help choices of 3-6 words each.
  - got: About 25 English words in one help screen.
  - evidence: #4 'Mr. Dan asks: What did your dog do?' 'First he ran in the water. Then he got wet.' 'Blue dog, park, yes, big.' · phrase choice builder
  - acceptance: Phrase choices are at most about 8 words each, with the question not repeated.
- **major · rank 9** `LT-tomas-9-J4-5` (clarity) · recurs `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J4-5`, recurrence 7 — Situation list long and mixed for a nine-year-old
  - expected: Short list of play and animal topics.
  - got: 20 entries including booking, lost jacket, group project and speaking-practice items.
  - evidence: #1 and #11 situation list. · situation list builder
  - acceptance: The list for an elementary profile shows only age-fit play, animal and sport situations.
- **major · rank 9** `LT-oksana-34-J3-5` (clarity) · recurs `2026-10-17-lt-swap-2/recert-1/LT-oksana-34-J3-3`, recurrence 3 — 'Mission done' shown while interviewer is still asking
  - expected: Mission done at a natural end
  - got: Banner appears from #8 and persists while Maria asks further questions
  - evidence: #8 'Mission done. See what you did tonight.' alongside 'How would you keep the trucks on time…' · mission completion rule
  - acceptance: Mission-done only offered when partner closes, or reworded as optional.
- **minor · rank 6** `LT-jana-29-J3-3` (completion) · recurs `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J3-1`, recurrence 6 — Mission closes after four replies with question open
  - expected: Scene runs about eight replies
  - got: "Mission done" while Priya's curry question is open
  - evidence: #9 "Mission done. See what you did tonight." after "if you fancy it?" · mission completion rule
  - acceptance: Do not close the mission while the partner asks an open question.
- **minor · rank 6** `LT-tomas-9-J4-4` (missing) · recurs `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J4-3`, recurrence 4 — Other clear slips went uncoached
  - expected: Coach 'Dog like water' or 'Dog jump... voda' with a short word he can reuse.
  - got: Only 'Pes je mokrý' became a moment.
  - evidence: #4 'Dog like water'; #7 'Dog jump... voda'; #9 'dog water'; #5 single moment. · moment selection prompt
  - acceptance: A recurring Czech word like 'voda' gets a tiny 'water' moment.
- **minor · rank 6** `LT-viktor-67-J3-4` (missing) · recurs `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J3-4`, recurrence 3 — Moment teaches an article, not a Sunday family phrase
  - expected: Words and phrases for the grandchildren.
  - got: Only 'in the garden' article fix.
  - evidence: #7, #10 · moment selection / recap builder
  - acceptance: Recap offers one family phrase to carry to Sunday.
- **minor · rank 6** `LT-oksana-34-J3-6` (senior-quality) — Interview drifts to commute small talk
  - expected: Stay on logistics (problem solved, carriers)
  - got: Last turns ask how she would travel and what if tram is late
  - evidence: #17 'how would you travel here from Brno?'; #18 'What would you do if the first tram is late?' · partner prompt
  - acceptance: Partner keeps to role-relevant questions until the close.
- **minor · rank 6** `LT-tomas-9-J3-5` (clarity) — A few partner questions drift above band
  - expected: Concrete yes/no or one-word questions
  - got: 'What is his home like?' made him say 'Nevím'; 'Where does Rex sleep' used a new verb
  - evidence: #11, #13 · conversation partner prompt
  - acceptance: Avoid 'what is X like' and new verbs; ask 'Is it big?' style.
- **minor · rank 4** `LT-adela-17-J3-4` (clarity) — Partner answers 'Was it correct?' with only yes plus praise
  - expected: A precise verdict, and a note about any slip in the answer.
  - got: "Yes, your sentence is correct" with a short admiration of one connector.
  - evidence: #6, #8 · partner prompt
  - acceptance: Answer names what was checked and what could be sharper.
- **polish · rank 2** `LT-martin-45-J3-3` (senior-quality) — 'You fixed' accepted a retry still missing 'for'
  - expected: Retry holds only if 'for two weeks' is present.
  - got: Retry 'have been waiting ... already two weeks' was marked 'You fixed “we have been”'.
  - evidence: #5-#6 try keeps 'already two weeks'.
  - acceptance: Check the whole repaired phrase before saying fixed.

## What passed

- `LT-adela-17-J3-2` Moment is exact, correct and gives the rule — "interested" is followed by "in" before a noun or -ing form, with her own retry.
- `LT-adela-17-J3-3` Partner asks B2 opinion and speculation questions — "How would your rule stop that?" and "Do you think students would really hand in their phones...?"
- `LT-jana-29-J3-1` Partner talks like a Dublin colleague — Idiomatic, warm, pushy-friendly banter
- `LT-jana-29-J3-4` Recap counts are now accurate — 4 spoken, 4 on your own, 0 with help, moment to keep
- `LT-martin-45-J1-4` Meeting-shaped check using his own world — All five tasks were supplier, quality-batch and director scenarios; the verdict named his batch refusal.
- `LT-martin-45-J3-4` Meeting-shaped scene with correct, brief moments — Elena drives agenda, owner, time limit, and the two moments are accurate with short reasons.
- `LT-oksana-34-J3-1` Realistic logistics interview at B1 with her plan topic first — Maria Lopez asks software, trucks per day, peak-season plan, late-truck escalation, questions about team/shifts
- `LT-oksana-34-J3-2` Moments were correct, short, and self-repair worked — Three correct fixes, each repaired by the learner then back to the scene
- `LT-ondrej-16-J3-1` Partner stays in scene at B1 and on his topic — Natural gamer register, negotiating, humour 'argue about it first'
- `LT-petra-38-J3-2` Patient, realistic A2 front-desk partner — Ana speaks short supportive lines; all 6 at band
- `LT-tomas-9-J3-1` Ella speaks at A1 about things Tomáš loves — 11 of 13 partner turns at band, present tense, known words (colour, dog, big, near)
- `LT-tomas-9-J4-6` Help is findable and the progress picture stays honest — Cue, phrase choice and 'Said more simply' on the same screen; recap says '0 on your own · 3 with help'.
- `LT-viktor-67-J3-1` Mia speaks at A1 in short single-question turns — Six partner turns, all simple, familiar words, one question each.
- `LT-ondrej-16-J3-4` Moment was short with self-repair — Wrong retry then hint then success, one tap back
- `LT-petra-38-J3-3` Moment is correct and brief — 'not working' with a one-line reason, then back to the scene
- `LT-tomas-9-J3-6` Moments are correct and short — 'Dům means house in Czech' and 'Je to is Czech for it is'
- `LT-tomas-9-J4-7` Moment quotes his words and is kid-simple — 'You wanted to say Pes je mokrý.' / 'The dog is wet.'

## Voices

**Adéla · J3** (time saved: 20 min · low)

> Finally a topic that feels like the speaking exam: phones in class, with Sam asking me how my rule would stop cheating. The questions were properly B2, not pet small talk, and the "interested about" fix was exactly right, with the rule. I liked saying it again myself. But I used "actual information" and nobody told me, and that is exactly my freezing point, so I can't fully trust that I've been checked. When I asked "Was my sentence correct?" I got a yes, which was fine but a little polite-classmate. I'd use it again for opinion practice, but I'd still keep my notebook for false friends. Worth telling classmates about if the corrections get sharper.

**Jana · J3** (time saved: 15 min · low)

> The partner is the best part. Priya sounds like an actual Dublin colleague: "knackered", "good shout", "the lads will be gutted". That's what I came for, and it never talked down to me. The scene was believable, and declining drinks is exactly my worry.
> The one stop was a miss for me. I said "I'd rather somewhere", it's a fair slip, and the fix is correct. But it's something I know. I wanted to hear why "good shout" works, or whether "take a rain check" is too casual with a manager. The recap offered that line but never tied it to my scene. It also ended after four replies while Priya was still asking about the curry.
> Would I use it again? Yes, for the banter practice. Is it a Preply replacement yet? Not quite, because the teaching is thin at C1. Still, 15 minutes whenever beats scheduling across time zones.

**Martin · J1** (time saved: 15 min · low)

> Okay, it was quick, about seven minutes, and the tasks were my real life: suppliers, a failed batch, the director running over. I liked that. It said B2, not C1, and I can live with that, because it showed me 'much more bigger' and 'this delay make'. Fair. But I'm not sure I trust it fully. 'He want' got a pass, and nobody said a word about 'we was discussing about' or 'he don't agree', which my director actually notices. Also 'say much bigger or more big'? That second one sounds odd to me. If I'm paying attention to the details, I'd say the level is a bit generous and the corrections are thin. Still, it's faster than a school placement test and an oral. I'd try the meeting practice next. I'd tell a colleague, but I'd warn him not to expect the full list of his mistakes.

**Martin · J3** (time saved: 40 min · low)

> The meeting was exactly my work: agenda, owners, deadlines, quality. Elena sounded like a real supplier, and I was never slowed down, which I like. The two corrections were right. "We was" I know I do, and now I see why "have been waiting" is needed. But I said "I am in this company since 2015" and "He don't" and got nothing, so I wonder what it really hears. And B2 with a quote "this delay makes"? That tells me nothing. I would want it to say what in my English put me there, because my director will notice the things it skipped. Fifteen minutes is fine for me, but I would use it again only if the level had reasons. Would I recommend it? Maybe to a colleague who is less loud than me.

**Oksana · J3** (time saved: 40 min · low)

> Finally a rehearsal that is actually my interview. Maria asked about SAP, trucks per day, Christmas peak, who I call when a truck is late — real coordinator questions, and she didn't blink at "dispečink" or assume I'm Czech. Level felt right, not babyish. The three corrections were right and I fixed them myself, good. But I wrote "responsible about", "where are the trucks", "other solution" and nobody said a word, so I don't know if my English is clean. The recap gave me only grammar, no phrases to take to Friday, and "Mission done" kept appearing while Maria was still asking. The tram questions were a waste of my evening. I'd use it again for 20 minutes a night, and tell a friend, but I want more correction and interview phrases.

**Ondřej · J3** (time saved: 0 min · low)

> Ok, it was not bad. Sam talked like an actual teammate, no baby English, and the "argue about it first" bit made me almost smile. The one stop was short, I fixed "to be" and moved on, no lecture. But come on, I said "play more long" and "is ok for you" and nothing, so do I trust the corrections? Half. The recap was lazy: one fix and "choose a fresh context", like it forgot I just negotiated a whole evening. Would I use it again? Only if mom insists. Would I tell a friend? Maybe, "it doesn't talk to you like a kid". Zero minutes saved, but not wasted either.

**Petra · J3** (time saved: 60 min · low)

> I would use it again. Ana was patient and spoke slowly, like a real guest conversation, and the air-conditioning problem is exactly what happens at my desk. The one correction, "not working", was right and I can say it tomorrow. I did not feel tested. But I made more mistakes than that, like "I have problem" and "because is too hot", and nobody told me. The recap showed only one thing to keep, so I do not fully trust that I am learning everything. As a mother I looked at the topic list and saw nothing wrong for Tomáš or Klára, which is what I needed. Fifteen minutes after the kids sleep is better than an evening course and a babysitter. I would tell a colleague, but I would want a few more corrections.

**Tomáš · J3** (time saved: 50 min · medium)

> Jo, Minecraft! Ella asked about creeper and my dog Rex and I could answer. Short questions, so I mostly understood and did not feel like I was in school. I liked that "dům" turned into "house". I would use it again. But Czech words like "je" kept slipping through and it only showed me twice, so I do not know if my English was good. At the end I wanted to see what I did, and it said "Choose a fresh context", which is boring. I wanted it to say Minecraft, Rex, house. Maminka also saw booking and exam things in the list, and that is not for me. About 12 answers made my head tired, but it was fun. I would tell kluci about it.

**Tomáš · J4** (time saved: 30 min · low)

> Jo, the dog story was fun. I could say "dog" and "splash!" and it didn't laugh at me when I said "voda". The cue, "First, my dog… Then…", helped me start, and the tutor told me "the dog is wet", which I wanted to say. But then it asked me different things, "next", "start", "the end", and I never got to say "the dog is wet" again. Two sentences each time is a lot for me, and the choice screen had too many words. The list has booking and a lost jacket, which is school stuff. It's better than the club, where I talk two minutes, but I'd want a try-again question and shorter words. Maybe I'd tell Honza.

**Viktor · J3** (time saved: 60 min · low)

> Dobrý večer. It was pleasant: Mia speaks slowly and simply, and I understood every question. I could talk about my garden, bees, and say "I miss you" — that is exactly what I want for Sunday. The correction "the garden" was kind and clear, and I could say it again. But I made the same small mistake three more times and nobody told me, so I do not fully trust what is corrected. Also I asked how is school and Mia asked about flowers instead. The mission said done before she answered. I would use it again on Saturday, it saves me the tram and the group of twelve. I would like it to teach me one more family sentence at the end.
