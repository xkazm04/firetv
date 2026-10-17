# LT run 2026-10-14-lt/recert-6 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 3 Characters · 10 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 11

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J1 | conditional - C3 failed: #9 'I felt a bit similar to some episodes' changes her meaning (she felt simil… | conditional | 3/4 | B2 vs B2 · exact |  | 1/2 | 0 | 9 | 1.8 | done |
| adela-17 | J2 | fail - D2 failed: Add worked (#3 'Does social media help or harm teens?' kept her exam angle), b…; D3 failed: #8 agreed with all 7 originals incl. series, recap, welcome day; planAgreed ha…; topic fit 3/7 (43%) under 4 of 6; C5 failed: #2 initial six: welcome day, favourite series, recap, group project are everyd… | fail | 3/4 |  |  |  | 0 | 9 | 1.6 | done |
| adela-17 | J3 | fail - D2 failed: Pitch 4 of 6 at band; #7 "Do you have a favourite series…" and #8 "Can you con…; pitch 4/6 (67%) under 80%; C4 failed: Partner asks "Do you have a favourite series that shows how news is made?" (#7… | fail | 5/6 |  | 4/6 | 1/1 | 0 | 10 | 1.8 | done |
| adela-17 | J4 | fail - D2 failed: Help was only "Said more simply" (#3, #8, #12), a gloss "plan: what you intend…; D3 failed: No replay was offered or taken. #16 recap offers only 'Another situation' and …; D4 failed: Evidence marks reply 4 supported:true (#13 "I would most like to explore inves…; C4 failed: Partner questions are mostly intro-level: #7 "Which country are you coming fro… | fail | 2/3 |  | 3/6 |  | 0 | 16 | 2.3 | done |
| martin-45 | J1 | conditional - C3 failed: #11 focus is only articles. 'we was discussing with suppliers about deadlines'… | conditional | 3/4 | B2 vs B1 · near |  |  | 0 | 11 | 2.1 | done |
| martin-45 | J2 | pass | pass | 5/5 |  |  |  | 0 | 4 | 0.9 | done |
| martin-45 | J3 | pass | pass | 4/4 |  | 8/9 | 3/3 | 0 | 18 | 2.8 | done |
| tomas-9 | J1 | fail - D3 failed: #7 and #9 he thought 'Too long and fast'; #8 'Tell them which part of the cast…; D4 failed: #10 'Nevím is Czech, so say I don't know in English' and 'Your answer so far i…; D5 failed: #10 'Try full sentences with a verb: ... The creeper blew up the wall' is gene…; C2 failed: #7 listening line ~28 words, shown via 'Show the words'; #8 task ~28 words; #5…; C3 failed: #10 'Your answer so far is single words' and 'Nevím is Czech, so say I don't k…; C5 failed: #2 'Where do you use English in your life?' and #3/#4 two-option questions abo…; C6 failed: #10 focus 'The creeper blew up the wall' uses past tense, beyond a nine-year-o… | fail | 1/5 | A2 vs A1 · near |  |  | 0 | 10 | 1.4 | done |
| tomas-9 | J2 | fail - D2 failed: #2-#4 Three swaps of "Where are the pencil cases?" changed nothing, and it is …; topic fit 4/7 (57%) under 4 of 6 | fail | 3/3 |  |  |  | 0 | 7 | 0.9 | done |
| tomas-9 | J3 | fail - D2 failed: A2 partner for an A1 child: #6 "Oh, you were building a house! Then the creepe…; pitch 2/7 (29%) under 80%; C4 failed: #1 list offers "A booking that is missing", "Our group project", "The lost jac…; C5 failed: #4 "What were you building before the boom?", #6 "Oh, you were building a hous… | fail | 2/4 |  | 2/7 | 2/2 | 0 | 11 | 1.8 | done |
| tomas-9 | J4 | fail - D3 failed: #10 he only copies 'I like playing house.'; #12 Lenka asks the next unrelated …; D4 failed: facts turn 2 'Ten diamonds. Já mám ten. I like play house.' supported:false th…; C5 failed: Partner turns have 2-3 sentences and words like 'cozy', 'sleep over': #2 'I'm …; C6 failed: #9 moment note 'After 'like', the verb needs the -ing form.' is grammar jargon… | fail | 2/4 |  | 1/6 | 1/1 | 0 | 17 | 2.2 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 1 · near 2 · miss 0
- **judge agreement:** 17/19 (89%)
- **topic fit:** fit 25/34 (74%) · safe 34/34 (100%)
- **pitch:** at band 18/34 (53%) · below 6 · above 10
- **moment precision:** 8/9 (89%)
- **moment recall:** 9/20 (45%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 77 calls, 0 failed, avg 8s · character 122 calls, 0 failed, avg 4s · judge 11 calls, 0 failed, avg 32s
- **driver coverage:** 111 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 27** `LT-tomas-9-J3-1` (senior-quality) · recurs `2026-10-14-lt/recert-2/LT-tomas-9-J3-1`, recurrence 4 — Partner uses A2 past tense with an A1 nine-year-old
  - expected: Tiny present-tense sentences with known words, one question
  - got: "What were you building before the boom?", "What did the creeper do to your house?" Pitch 2 of 7 at band.
  - evidence: #4, #6, #9: learner answers "Já nevím", "Nevím co", "Nevím" to the past-tense questions. · conversation partner prompt (band A2 for A1 child)
  - acceptance: For an elementary A1 profile, partner turns are at most 8 words, present tense, known vocabulary.
- **blocker · rank 27** `LT-tomas-9-J4-3` (trust) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J4-4`, recurrence 4 — Supported flag wrong both ways
  - expected: Only helped replies are supported:true.
  - got: Helped turn marked independent; unhelped turns marked supported.
  - evidence: #8 cue then answer, facts supported:false; #12 and #15 no help, supported:true · evidence recording of supported
  - acceptance: supported is true exactly when help was used for that turn.
- **blocker · rank 27** `LT-tomas-9-J2-1` (completion) · recurs `2026-10-14-lt/recert-2/LT-tomas-9-J2-1`, recurrence 3 — Swap does nothing; rejected shopping topic stays in agreed plan
  - expected: Swapping a topic removes it and shows a new one.
  - got: Three swaps left the list unchanged, and the plan was agreed with pencil cases in it.
  - evidence: #2-#4 same list after each swap; #6 "Where are the pencil cases?" still listed; #6 agree. · plan swap handler
  - acceptance: After Swap, the topic is replaced by a new one and the list count stays the same.
- **blocker · rank 27** `LT-adela-17-J2-1` (completion) · recurs `2026-09-15-lt/LT-adela-17-J2-1`, recurrence 2 — Swap button does nothing; rejected topics stay in the plan
  - expected: Swapping a topic replaces it with a new one.
  - got: Five swaps (#3–#7) left the list identical; the plan was agreed with the topics she rejected.
  - evidence: #3 swap 'Talking about my favourite series'; #4–#7 list unchanged, 'Recapping the last episode' still present after three swaps; #8 planAgreed lists all seven. · plan swap handler / topicId matching
  - acceptance: After a swap, the swapped topic is absent and a new topic appears, in the next screen state.
- **blocker · rank 27** `LT-tomas-9-J1-2` (trust) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J1-4`, recurrence 2 — Feedback corrects Czech and 'single words' as a shortfall
  - expected: Warm praise for any English word, no 'only' or 'Nevím is Czech'
  - got: 'Your answer so far is single words. Try a full sentence' and 'Nevím is Czech, so say I don't know in English'
  - evidence: #10 What Linga saw notes · task note prompt
  - acceptance: For elementary profiles, notes praise words caught and never correct the language used to answer.
- **blocker · rank 27** `LT-adela-17-J3-1` (senior-quality) — Clear errors left uncorrected
  - expected: Notice 'news were', 'tell me what are the entry requirements', missing article in 'English-taught programme'
  - got: Only 'interested about' was flagged; informations, news are/were, embedded question order and missing article passed silently
  - evidence: #2 "get informations", "how news are created", "in English-taught programme"; #5 "news were just written", "could you tell me what are the entry requirements"; one moment only (#3). · moment detection prompt
  - acceptance: A B2 slip repeated or exam-relevant (embedded question order, missing article) gets a moment or coaching note.
- **blocker · rank 18** `LT-martin-45-J1-1` (senior-quality) · recurs `2026-10-14-lt/recert-5/LT-martin-45-J1-1`, recurrence 6 — Focus ignores his fossilised errors (was/were, discuss about)
  - expected: Focus or slips name a recurring error such as 'we was discussing about'.
  - got: Only articles and word order were coached. 'we was discussing with suppliers about deadlines' (#2) and 'make a risk analysis' were never mentioned.
  - evidence: #2 'we was discussing with suppliers about deadlines'; #11 focus 'Practise articles before nouns' · placement summary/focus prompt
  - acceptance: The verdict's slips list includes at least one error from his earlier free answers, including the intake replies.
- **blocker · rank 18** `LT-tomas-9-J4-1` (senior-quality) · recurs `2026-10-14-lt/recert-2/LT-tomas-9-J4-2`, recurrence 6 — Partner turns too long and above A1
  - expected: One tiny sentence and one simple question per turn.
  - got: Three-sentence turns with 'cozy', 'sleep over', 'Where do you find the most diamonds'.
  - evidence: #2 'Hi, I'm Lenka from school! I'm new to Minecraft. How many diamonds are in your chest?'; #15 'Two beds, so friends can sleep over! Why do you like playing in your house?' · partner prompt, A2 band for elementary
  - acceptance: Partner turns for elementary A1 stay under ~8 words with one question; at least 0.8 judged 'at'.
- **blocker · rank 18** `LT-adela-17-J2-2` (missing) · recurs `2026-10-14-lt/recert-5/LT-adela-17-J2-1`, recurrence 4 — Initial plan is mostly casual/everyday, not exam discussion
  - expected: At least 4 of 6 proposals are opinion, comparison or speculation topics for B2 First.
  - got: Welcome day, favourite series, recap and group project are small-talk or logistics tasks.
  - evidence: #2 list; her thought: 'These are mostly about TV series, but I need exam-style topics'. · topic plan prompt
  - acceptance: Topic plan for a B2 First candidate has ≥4 of 6 discussion topics (technology, environment, education).
- **blocker · rank 18** `LT-adela-17-J4-1` (missing) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J4-2`, recurrence 4 — Help is a simplified restatement, not an answer frame
  - expected: A B2 frame for what she is stuck on (explaining her plans and reasons).
  - got: "Said more simply: Could you tell us your name and what you want to study?", a gloss of 'plan', and "My name is…".
  - evidence: #3, #4, #5, #8: "Which country are you from?"; #12 "Many students feel nervous at first. It gets easier." · cue prompt
  - acceptance: Help gives a usable sentence frame for the question asked, at B2, not a paraphrase of the question.
- **blocker · rank 18** `LT-adela-17-J4-3` (trust) · recurs `2026-10-14-lt/recert-5/LT-adela-17-J4-4`, recurrence 4 — Supported flag misstates independence
  - expected: Only replies after help are marked supported; the recap separates supported from independent.
  - got: The reply at #13 was marked supported:true with no help. The recap shows "5 spoken · 0 written replies".
  - evidence: Facts evidence: first four replies supported:true; #13 had no cue. #16 recap line. · evidence recorder / recap builder
  - acceptance: Supported is true only where help was used for that reply. The recap splits supported from independent.
- **blocker · rank 18** `LT-martin-45-J3-1` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-martin-45-J3-1`, recurrence 4 — Most fossilised errors still get no moment
  - expected: Moments or coaching on "more better", "confirm me", "until Friday", "without this parts", "truck leave".
  - got: Only 3 of about 7 error-bearing turns got a moment. "more better" went by and "discuss other solution" was picked instead.
  - evidence: #11 "this is more better for me" got nothing. #7 "please confirm me the date ... until Friday" got nothing. #6 "without this parts" got nothing. #18 "3 moments to keep". · moment detection / as-needed rule
  - acceptance: A turn with a listed fossilised error (more better, confirm me, since-with-present) gets a moment or a recap coaching note within the scene.
- **blocker · rank 18** `LT-tomas-9-J1-1` (clarity) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J1-1`, recurrence 4 — Check tasks too long for a nine-year-old beginner
  - expected: Prompts of 15 words or fewer in words he knows
  - got: ~22-word choose prompt, ~28-word listening line, ~28-word Say-it task
  - evidence: #8 'Tell them which part of the castle you like best and why.' #7 'Last weekend I played Minecraft for hours...'; thought '#9 Too long and hard... I'm tired' · check task generation prompt
  - acceptance: Every check task for an elementary profile has at most 15 English words and known vocabulary.
- **blocker · rank 18** `LT-tomas-9-J1-3` (senior-quality) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J1-3`, recurrence 4 — Next focus beyond his level
  - expected: Focus using like/is only
  - got: 'The creeper blew up the wall.' past tense
  - evidence: #10 Next to practise · placement summary / focus prompt
  - acceptance: Focus sentence uses only like/is and words he already knows.
- **blocker · rank 18** `LT-tomas-9-J1-4` (clarity) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J1-3`, recurrence 4 — About-you questions long and about learning history
  - expected: One tiny question like 'Do you like Minecraft?'
  - got: 'Where do you use English in your life?' and 'Did you learn English at school, or somewhere else?'
  - evidence: #2 and #4; answers 'A ve škole... nevím. I like dog.' · linga check intro prompt
  - acceptance: Intro questions for children are under 8 words and about play or animals.
- **blocker · rank 18** `LT-tomas-9-J2-2` (clarity) · recurs `2026-09-15-lt-recert2-goal/LT-tomas-9-J2-1`, recurrence 4 — Abstract skill labels for a 9-year-old
  - expected: Tiny picture-led labels in words he knows.
  - got: "Understand and repair", "Make a plan", "Get something done", "Connect with people". The added topic is labelled "Share your world", which does not match football and dogs.
  - evidence: #2 "Understand and repair · Ms Hall · museum guide"; #6 "Football and my dog / Share your world" · plan topic generation prompt (skill labels)
  - acceptance: Labels are one or two common words, and the label matches the topic.
- **blocker · rank 18** `LT-tomas-9-J2-3` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-tomas-9-J2-5`, recurrence 4 — Topic goals demand more than the child has
  - expected: Goals he can meet with words like 'like' and 'is'.
  - got: "using a verb and past tense in full sentences", "full sentences with a verb, and give one reason".
  - evidence: #6 goal text for creeper and football topics · plan topic generation prompt
  - acceptance: Goals for a near pre-A1 child name one word or one 'I like' sentence.
- **blocker · rank 18** `LT-tomas-9-J3-2` (clarity) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J3-3`, recurrence 4 — Adult situations listed to a nine-year-old
  - expected: Child-suited situations only
  - got: Booking, group project, lost jacket, pencil cases offered
  - evidence: #1 and #11 situation list. · situation catalogue filter
  - acceptance: Situation list filtered by elementary profile.
- **blocker · rank 18** `LT-tomas-9-J4-2` (completion) · recurs `2026-09-15-lt-recert2-beginners/LT-tomas-9-J4-2`, recurrence 4 — Replay is a copy, not a fresh question
  - expected: After the moment, a new question lets him answer better alone.
  - got: He types the fix back, then Lenka moves to rooms.
  - evidence: #10 'I like playing house.'; #11 'You fixed “like playing”'; #12 'How many rooms are in it?' · moment replay flow
  - acceptance: After a fix, the partner asks a new question using the coached pattern and the next reply is checked unsupported.
- **blocker · rank 18** `LT-tomas-9-J4-4` (clarity) · recurs `2026-09-15-lt-recert2-beginners/LT-tomas-9-J4-4`, recurrence 4 — Moment stops the scene and uses grammar jargon
  - expected: Coaching inside the fun, in kid words.
  - got: Separate moment screen, 'the verb needs the -ing form'.
  - evidence: #9 'After 'like', the verb needs the -ing form.' with 'Back to the conversation' · moment note prompt
  - acceptance: Moment note is one kid-level line, e.g. 'Say: I like playing.'
- **blocker · rank 18** `LT-adela-17-J4-2` (completion) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J4-1`, recurrence 3 — No coaching note and no replay in the journey
  - expected: Pause & coach quotes her words, then Replay gives a fresh question.
  - got: Pause & coach was never used; coaching is null and no replay was offered or taken.
  - evidence: #16 recap offers only 'Another situation' and 'Learning map'. Facts show moments [] and coaching null. · moment/replay prompt
  - acceptance: After help, the screen offers a coaching note quoting her reply and a replay with a new question.
- **blocker · rank 18** `LT-adela-17-J1-3` (trust) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J1-2`, recurrence 2 — 'interested about' still never flagged
  - expected: Flag 'interested about' → 'interested in'.
  - got: The slip in the first answer is ignored.
  - evidence: #2 "I'm not interested about travelling"; #9 lists only the other two slips. · slip extraction prompt
  - acceptance: Slips are extracted from the About-you answers too.
- **blocker · rank 18** `LT-adela-17-J1-1` (senior-quality) — Headline correction 'similar to some episodes' is wrong in meaning
  - expected: Correct it to 'felt similarly about' or 'felt the same about', with the rule.
  - got: Next focus and slips say 'I felt a bit similar to some episodes', which means she resembled the episodes.
  - evidence: #9 'becomes "I felt a bit similar to some episodes"'; note: 'similar to is the fix'. · slip/focus generation prompt
  - acceptance: Every offered correction preserves the learner's meaning and an examiner would accept it.
- **major · rank 12** `LT-martin-45-J1-2` (trust) · recurs `2026-10-14-lt/recert-5/LT-martin-45-J1-2`, recurrence 4 — B2 is generous; task 3 passed despite article and collocation slips
  - expected: Task 3 partial, or a clear reason B1 was ruled out.
  - got: Task 3 passed with 'Your English is well controlled'. Overall B2 at low confidence, one band above his true B1.
  - evidence: #11 'One month delay is big problem' passed at B2; 'confidence':'low' · placement task judge prompt
  - acceptance: A B2 pass is not given when the answer has several basic grammar slips.
- **major · rank 12** `LT-adela-17-J3-3` (senior-quality) · recurs `2026-10-14-lt/recert-5/LT-adela-17-J3-1`, recurrence 3 — Missing article again not flagged
  - expected: Note on 'an English-taught programme'
  - got: Not mentioned
  - evidence: #2 "I'd rather study in English-taught programme"; no moment or recap note. · moment detection prompt
  - acceptance: Article omissions get a moment or a recap note.
- **major · rank 12** `LT-adela-17-J1-2` (senior-quality) — 'used to' rule is stated wrongly
  - expected: Explain 'be used to + -ing' versus 'used to + infinitive'.
  - got: 'after used to we say used to reading'. The rule is muddled.
  - evidence: #9 "Check 'used to read': after 'used to' we say 'used to reading'." · verdict note prompt
  - acceptance: The note states the rule correctly: 'be/get used to' takes -ing.
- **major · rank 12** `LT-adela-17-J3-2` (clarity) — Partner drops to simple, repetitive questions
  - expected: Opinion, comparison or speculation at B2
  - got: 'Do you have a favourite series…' repeated off-scene; adviser asks caller to confirm deadline
  - evidence: #7 "Do you have a favourite series that shows how news is made?"; #8 "Can you confirm the deadline for me, so you have it right?" · partner prompt
  - acceptance: Partner stays in role and asks B2 questions tied to the mission.
- **major · rank 12** `LT-martin-45-J3-4` (trust) — Level B2 with no reasons for a B1 claimant
  - expected: A reason he cannot argue with for the level, ideally naming his recurring errors.
  - got: The recap shows B2 "Comfortable" and quotes "this is an interesting point" from the level check. The 3 'was' slips don't change it.
  - evidence: #18 "Your level: B2 · Comfortable" next to 3 fixes of basic agreement. · level summary
  - acceptance: The recap ties repeated slips to the level or a focus line.
- **major · rank 12** `LT-tomas-9-J1-5` (trust) — A2 placement rests on two-option choices
  - expected: A band believable from his real ability
  - got: A2 with low confidence; screen admits it 'rests on answers chosen from two options and skipped tasks'
  - evidence: #10 'This level rests on answers chosen from two options and skipped tasks.' · placement scoring
  - acceptance: Two-option passes alone cannot lift a child above A1.
- **major · rank 12** `LT-tomas-9-J2-4` (senior-quality) — Off-interest and adult-flavoured topics proposed for a boy who wants games
  - expected: Topics fit a 9-year-old who wants Minecraft, dogs and football, with no shopping.
  - got: Shopping, a museum guide and declining an invitation were proposed. No football or dog topic appeared until he asked for it.
  - evidence: #2 pencil cases, Ms Hall museum guide, "No, I cannot come today" · plan topic generation prompt
  - acceptance: At least 5 of 6 topics are play, animals or sport for an elementary profile.
- **major · rank 12** `LT-tomas-9-J3-4` (effort) — Partner loops on the same question
  - expected: Move on when he cannot answer
  - got: "what did the creeper do?" asked three times; he quit at #10 "Už mě to nebaví"
  - evidence: #6, #7, #10 partner turns. · conversation partner prompt
  - acceptance: After two non-answers, switch to a yes/no or one-word question.
- **minor · rank 6** `LT-adela-17-J2-3` (missing) · recurs `2026-10-14-lt/recert-5/LT-adela-17-J2-2`, recurrence 4 — No mock interview or exam-format topic proposed
  - expected: A speaking-interview style topic is in the initial set.
  - got: Only available far down the situation list ('Beyond the rehearsed answer [interview]'), not proposed.
  - evidence: #2 proposals; #9 list includes 'Beyond the rehearsed answer [interview]' unproposed. · topic plan prompt
  - acceptance: Initial set includes an interview or exam-part topic when goal is B2 First.
- **minor · rank 6** `LT-martin-45-J2-3` (clarity) · recurs `2026-10-14-lt/recert-5/LT-martin-45-J2-2`, recurrence 4 — Plan grows from 6 to 7 after an add, unexplained
  - expected: Six topics, or a note about the new size
  - got: "7 conversations for you" with no explanation
  - evidence: #2 "6 conversations for you" → #3 "7 conversations for you" · linga-plan add-topic
  - acceptance: Either swap one out on add, or say the plan is now seven.
- **minor · rank 6** `LT-tomas-9-J4-6` (clarity) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J4-5`, recurrence 4 — Situation list is long and mixed
  - expected: Short list of play/animal topics.
  - got: 21 situations including booking, lost jacket, group project.
  - evidence: #1 list of 21 situations · situation list builder
  - acceptance: Elementary profile sees at most 6 child-fit situations.
- **minor · rank 6** `LT-tomas-9-J3-3` (missing) · recurs `2026-10-14-lt/recert-5/LT-tomas-9-J3-4`, recurrence 3 — Clear non-Czech errors unmarked, Nevím repeated without a moment
  - expected: Gentle model such as "I build a house" or "I don't know" when repeated
  - got: Only 2 moments; "Creeper boom house", "I like house", "Já nevím", "Nevím" in #9 got nothing
  - evidence: #4, #6, #9 no moment. · moment trigger rules
  - acceptance: Model the sentence for repeated slips.
- **minor · rank 6** `LT-adela-17-J4-4` (senior-quality) — Partner questions are basic and repetitive for B2
  - expected: Opinion, comparison or speculation questions at examiner standard.
  - got: "Which country are you coming from?" and a repeated course question at #11.
  - evidence: #7 and #11: "Which subject would you like to take here..." after she had said she would study media at #6. · partner prompt
  - acceptance: Partner does not repeat settled questions and moves to opinion or speculation by turn 3.
- **minor · rank 6** `LT-tomas-9-J4-5` (missing) — Other real slips uncoached
  - expected: Notice 'Já mám ten' / missing article in 'Dog house'.
  - got: Only one moment.
  - evidence: #8 'Ten diamonds. Já mám ten.' no coaching · moment selection prompt
  - acceptance: Czech fallbacks get a gentle English phrase offer.
- **polish · rank 2** `LT-martin-45-J1-3` (effort) — Judge quote check rejected a valid answer
  - expected: The answer is read first time.
  - got: 'The judge did not quote the learner accurately.' He had to resend the answer.
  - evidence: #7 engine-error; #8 'Linga could not read that answer' · judge quote validation
  - acceptance: Quote validation is retried inside the app, and the learner is never asked to resend.
- **polish · rank 2** `LT-martin-45-J2-4` (senior-quality) — 'Easy small talk' label would irritate a self-declared C1
  - expected: Neutral wording at his stretch level
  - got: "Easy small talk builds rapport... "
  - evidence: #3 why line starts "Easy small talk" · plan why prompt
  - acceptance: The why line avoids 'easy'.

## What passed

- `LT-adela-17-J1-4` Exact B2 placement with an honest reason — B2, with 'Your C1 answers were close, but none was strong'.
- `LT-adela-17-J1-5` Exam-style tasks at the right level — Ranking vs city; subtitles speculation.
- `LT-adela-17-J2-4` Added topic keeps her request and is explained — 'Does social media help or harm teens?' appears with why line 'You asked for this topic, and it is a common B2 speaking task'.
- `LT-adela-17-J3-4` Accurate moment with repair loop and direct answer — Correct fix with a rule; direct 'is correct' answer to her question
- `LT-adela-17-J4-5` Her 'Is that correct?' questions are answered accurately and specifically — Each answer quotes her phrase and confirms it correctly: "'whereas many of my friends prefer entertainment news' is correct, and it shows the contrast clearly."
- `LT-martin-45-J1-4` Workplace tasks and the 'Your usual slips' list with before and after — Meeting and supplier tasks. Each slip is shown as 'X → try Y' in his own words, and the corrections are accurate.
- `LT-martin-45-J2-1` Topics are specific to his work, each with a reason — Six of six workplace topics, each with a personal reason line
- `LT-martin-45-J3-2` Moments are correct, short and reasoned — Each moment gives the right fix and a one-line reason. The repeated 'was' pattern is flagged as recurring.
- `LT-martin-45-J3-3` Meeting-shaped scene with a believable partner — Sofia counters, asks for dates and offers a buffer, so the scene stayed realistic across 8 replies.
- `LT-tomas-9-J1-6` Minecraft-themed choose tasks worked — Tasks 1 and 2 Minecraft with big two-option buttons, he answered confidently
- `LT-tomas-9-J2-5` Added topic keeps what he asked for and the why lines are short — "fotbal a dogs" became "Football and my dog", with the why "You asked about football and dogs".
- `LT-tomas-9-J4-7` Help ladder works in the scene — 'Said more simply' ('How many beds?') and a short phrase choice unblocked him.
- `LT-tomas-9-J4-8` Moment quotes learner exactly and is kind — 'You said I like play house' then correct fix, no shaming.
- `LT-adela-17-J2-5` Placement notes name exact slips with correct fixes — 'similar to' and 'used to reading' are correct and specific.
- `LT-martin-45-J2-2` Added topic keeps his request — "Small talk before the meeting", with weekend, company and a follow-up question
- `LT-tomas-9-J3-5` Moments are short and correct, and Czech is welcomed — "I don't know" and "No worries, you can answer in Czech or English!"

## Voices

**Adéla · J1** (time saved: -10 min · low)

> The B2 placement is right, and the check felt like an exam: ranking against city, subtitles. That I liked. I liked the specific notes too, with no "great job". But then it told me to say "I felt a bit similar to some episodes". That's wrong! I meant I felt similarly about them, not that I resemble episodes. And the "used to" explanation was muddled: it's "be used to" plus -ing. It also ignored my "interested about" in the first answer. I keep a notebook of mistakes, and now I'd have to check every correction myself. That costs me time instead of saving it. The level feels believable, but I can't yet trust the corrections at examiner standard. I'd try again, carefully, and I wouldn't recommend it until the corrections are right.

**Adéla · J2** (time saved: -5 min · low)

> Placement at B2 felt right, and the corrections ("similar to", "used to reading") were exactly what an examiner would say. I liked that every topic had a reason beside it. But then the swap button simply did nothing. I swapped the recap four times and it sat there. I added my social media topic, which worked nicely and kept my exam angle, yet I still had to agree to a plan full of series chat and welcome days. That is not what I asked for. I don't want to re-check the app's own buttons. The first six should already be exam-style: technology, environment, education, a mock interview. I'd try it again only if swaps work. Right now my tutor, even with the commute, gives me topics I actually want.

**Adéla · J3** (time saved: 20 min · low)

> The scene felt real: an admissions call about my own plans, and the one correction, "interested in", was right and came with the rule. When I asked "Was my question correct?" I got a straight answer. But I'm not impressed that so much slipped through. "Informations", "news are", "could you tell me what are…" and the missing article in "English-taught programme" all went unmarked, so I'd have to re-check everything myself. Helen also drifted into asking about a "favourite series" twice, which is the sort of easy question I find babyish. She even asked me to confirm the deadline, which is odd for an adviser. The recap was clear but thin: one item. I'd use it again for speaking turns, but not yet as an examiner-level checker. I'd tell a friend it's good for practice, not for exact corrections.

**Adéla · J4** (time saved: -5 min · low)

> Honestly, this didn't do what I wanted. I pressed help four times and got my examiner's question read back in simpler words, "plan: what you intend to do later", and "My name is…". I'm B2, so that's useless. Then I answered on my own anyway. I liked that when I asked "Is that sentence correct?" Tomas gave a straight, accurate yes and quoted my phrase. That I trust. But I never got a proper coaching note quoting what I really said, and there was no replay with a new question, so I can't tell whether I improved. The recap says everything was "spoken" and doesn't say which answers I did alone. Tomas's questions were also quite easy, like "Which country are you coming from?" A tutor would have pushed me with comparisons. I wouldn't swap it for my weekly exam tutor yet.

**Martin · J1** (time saved: 15 min · medium)

> Fair enough, it put me at B2, not C1. The line that stuck is that my C1 answers were close but none was strong. I saw my own words with fixes, like "an interesting point" and "where the problem was". That's evidence, and I can't argue with it. The tasks were about meetings and suppliers, not hobbies, and that's what I wanted. It took about seven minutes, so no school and no waiting. It was annoying that it rejected my answer once and I had to send it again. I also expected it to catch "we was discussing about" from my first answer, because that's what my US director notices. It only talked about articles. I suspect B2 is a bit generous, and I'd want a few drills on my usual mistakes before I fully trust it. I'd try it again, and I'd tell colleagues it's quick and not a toy.

**Martin · J2** (time saved: 10 min · medium)

> Fine, this one I would use. The topics are what I actually do: supplier deadlines, the US director, quality problems. No hobbies, no jackets. I added small talk and it came back as I asked, weekend and company. Each topic tells me why it is there, so I do not feel it is a toy. The B2 is believable, because it shows me "this is interesting point" and "find where was the problem". I would argue about C1, but I cannot argue with that. I did not try swapping, so I cannot say whether it works. It went from six to seven topics and nobody told me. And "easy small talk" is not what I want to read. Still, I would tell my colleagues. Time saved: maybe ten minutes against the school placement test.

**Martin · J3** (time saved: 30 min · low)

> Fine, the supplier scene was exactly my Monday, and Sofia talked like a real supplier, not a toy. The three fixes were right and short: "we were", "another solution", "stakeholders were". The note that the pattern came up earlier is what I needed. But look, I also said "more better", "confirm me" and "until Friday", and nothing. If you only catch three of my mistakes, I can't believe you've read my English. B2 "Comfortable" without a reason also looks arbitrary to a man who says C1. I'd use it again for meeting practice, since it was quick and I finished before my call. I would tell a colleague to try it, but I'd warn him the corrections are thin. It saved me maybe half an hour compared with the school.

**Tomáš · J1** (time saved: -5 min · low)

> Minecraft tasks were fun, I knew "build" and "house" and picked the right ones. But then the long listening, "too long and fast", and I only heard "creeper". The question about castles, no way, so I pressed nevím. At the end it said my answer was "single words" and that nevím is Czech, so say it in English. That feels like school. The level A2 seems high to me, I just picked from two buttons. The tip with "blew up the wall" I do not understand at all. Would I use it again? Only if it was short and about games, with no long reading. Mum would probably help me, but I would not tell friends yet. Lots of reading on the TV also tired me out.

**Tomáš · J2** (time saved: 0 min · low)

> Jo, Minecraft je tam, to je dobrý. And I said football and dogs and it made it. But I pressed Swap on the pencil cases three times and nothing happened! Nakupování nechci, that is nuda. Then I had to say yes with it still there. Mum would say "why press the button?" The words under each topic like "Understand and repair" I cannot read, and "full sentences with a verb and past tense" sounds like school. Short lines about creepers I get. I would use it for the Minecraft talk, but if the buttons don't work I give up fast. I would tell a friend only if the swap works.

**Tomáš · J3** (time saved: 0 min · low)

> Creeper boom, I liked that Ondra talks about Minecraft! But then he asks "what were you building" and I do not know the words, so I say nevím. He asks the same thing again and again. It started to feel like school and I wanted to stop. The little "I don't know" cards were okay, short and I understood them. But I said "Creeper boom house" and nobody showed me how to say it properly. The talk is too hard for me; one-word questions, please. I speak more here than at the club, but not more fun. Maybe I'd try again if Ondra asked "Is it a creeper? Yes or no?". I would not tell my friends yet.

**Tomáš · J4** (time saved: 25 min · low)

> Jo, the stuck buttons were good. When I did not know, I pressed help and Lenka said it simpler: "How many beds?" That I understood. Dog house, Minecraft, two beds, I could say. I liked that. But Lenka talks too much, long, with words like "cozy" and "sleep over". Nevím! Then the screen stopped and told me about "-ing form". That is like school, ugh. I just copied "playing house" and then Lenka asked about rooms, not the same thing, so I did not try again by myself. Also the app counted some answers as help when I pressed nothing, and one with help as alone. Mum would not know what I really did alone. I would use it for 10 minutes at home instead of the club, but the talking must be shorter and the fix must be simpler.
