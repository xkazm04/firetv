# LT run 2026-10-14-lt/recert-5 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 3 Characters · 12 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 1 of 11

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J1 | fail - D5 failed: #10 the summary names whereas and because, but the next focus "would have to s…; C2 failed: #10 task 1 "Well done."; task 5 "Try more precise, idiomatic phrases" names no…; C3 failed: #10 "whereas during explanations they would stay" → "would have to stay off" c…; C6 failed: #8 she asked "Was that correct?"; #10 never answers it, and instead presents a… | fail | 2/5 | B2 vs B2 · exact |  |  | 0 | 10 | 2.6 | done |
| adela-17 | J2 | fail - D3 failed: #3 plan agreed with 4 of 7 she'd choose (3 of 6 initial); below the 4 of 6 rat…; topic fit 4/7 (57%) under 4 of 6; C3 failed: #1 "would stay" → "would have to stay off" changes her meaning; her sentence w…; C5 failed: #2 initial six: only smart devices, give up phone, eco-tech club plan are exam…; C6 failed: #1 she asked "Was that correct?"; the note says "tangled, so the rule about ph… | fail | 2/5 |  |  |  | 0 | 4 | 1.4 | done |
| adela-17 | J3 | conditional - C6 failed: #5 answered 'No' to 'Is that sentence correct?' but named only 'actual'; 'inte… | conditional | 2/3 |  | 11/11 | 2/2 | 0 | 19 | 3.2 | done |
| adela-17 | J4 | fail - D3 failed: #9 only says 'Say it again, your way' on the same sentence; no 'Replay the mom…; D4 failed: Evidence shows later unaided replies flagged supported:true (e.g. #11 miss-mes…; C3 failed: #12 Lena says 'No, 'phone than' should be 'phone to'' to an answer with no suc…; C6 failed: #11 she asks 'Was my answer correct?' about a correct answer; #12 answers 'No,… | fail | 3/5 |  | 6/7 | 2/2 | 0 | 17 | 2.6 | done |
| martin-45 | J1 | fail - D5 failed: #8 'Your words: "he move the supplier call"' is a misattributed slip and focus…; C4 failed: #8 note says 'team has' while 'my team have' is acceptable British usage; 'he … | conditional | 3/4 | B1 vs B1 · exact |  |  | 0 | 8 | 1.9 | done |
| martin-45 | J2 | fail - D2 failed: Swap pressed on 'Small talk about favourite places' at #2,#3,#4,#6 and it stay…; C4 failed: #1 'team have' flagged to 'team has'; collective-noun plural is acceptable in … | fail | 4/5 |  |  |  | 0 | 8 | 1.2 | done |
| martin-45 | J3 | pass | pass | 5/5 |  | 6/6 | 2/2 | 0 | 13 | 2 | done |
| tomas-9 | J1 | fail - D3 failed: #7 "Too long and fast, I understood only dog and game"; #4 24-word about-you q…; D4 failed: #9-#10 "Thanks for sharing! Your English was only single words" after "Nevím..…; D5 failed: #10 "Your words: “Minecraft house.”." stray period; slip "Brother?" → "My brot…; C2 failed: #5 and #6 prompts are ~25 English words; #7 spoken line ~22 words and he said …; C3 failed: #10 "Your English was only single words, so try a full sentence" after his hon… | fail | 1/3 | A2 vs A1 · near |  |  | 0 | 10 | 1.8 | done |
| tomas-9 | J2 | fail - D1 failed: #2 labels "Understand and repair", "Get something done", "Make contact" are ab…; C2 failed: #1 tasks: "Your dog runs to the door and wags his tail. Someone rings the bell… | fail | 3/4 |  |  |  | 0 | 4 | 0.9 | done |
| tomas-9 | J3 | fail - D2 failed: Pitch about 9 of 13 (0.69). Above his level: #5 'What do you like to make in M…; pitch 9/13 (69%) under 80%; C4 failed: #1 list for a nine-year-old includes 'A booking that is missing', 'Our group p…; C6 failed: #11 moment text 'Use the plural 'dogs' when you talk about dogs in general' is… | fail | 3/5 |  | 9/13 | 2/2 | 0 | 18 | 2.9 | done |
| tomas-9 | J4 | fail - D2 failed: #6 'build: make something new with blocks' unblocked his reply, but #7 quotes …; D3 failed: #7 offers only 'Back to the conversation'; no replay. #13 ends with '4 spoken …; D4 failed: Turn 'Ball is blue. Modrá. I like dog.' is supported:true in facts although #1…; C1 failed: #1 and #13 show 'Your level: A2 · Everyday basics' for a true A1; near is allo…; C4 failed: #1 lists 21 situations; the first six are not all play/animal topics, and the …; C5 failed: #10 'Red roof, nice! My dog loves red too. What is the name of my dog's favori…; C6 failed: #7 moment 'Dům... house' → 'a house' is fine, but the real errors 'I build hou… | fail | 1/5 |  | 1/5 | 1/1 | 0 | 13 | 1.7 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 2 · near 1 · miss 0
- **judge agreement:** 11/12 (92%)
- **topic fit:** fit 27/48 (56%) · safe 45/48 (94%)
- **pitch:** at band 33/42 (79%) · below 1 · above 8
- **moment precision:** 9/9 (100%)
- **moment recall:** 9/17 (53%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 86 calls, 0 failed, avg 9s · character 124 calls, 0 failed, avg 5s · judge 11 calls, 0 failed, avg 32s
- **driver coverage:** 113 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 27** `LT-martin-45-J1-1` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-martin-45-J1-2`, recurrence 5 — Focus built on a misread slip, not his fossilised errors
  - expected: Focus names a recurring error like 'we was', 'since 2015'
  - got: Focus is 'he move the supplier call'; the listening line said 'I can move'
  - evidence: #8 'Your words: "he move the supplier call"'; #2 'we was discussing' not mentioned · placement summary/focus prompt
  - acceptance: Focus names a recurring error from his own answers, accurately
- **blocker · rank 27** `LT-adela-17-J1-1` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J1-1`, recurrence 4 — Correct sentence 'corrected' as her next focus and usual slip
  - expected: Only a real error is offered as a slip; otherwise say none was found.
  - got: "whereas during explanations they would stay" → "would have to stay off" shown as both next focus and 'Your usual slips'.
  - evidence: #10 Next to practise and Your usual slips; her sentence in #8 was grammatical. · slip/focus generation prompt
  - acceptance: Every slip shown is an error an examiner would mark; with none, the screen says so.
- **blocker · rank 27** `LT-martin-45-J2-1` (completion) · recurs `2026-10-14-lt/recert-3/LT-martin-45-J2-3`, recurrence 4 — Swap button does nothing; unwanted topic stays and is agreed
  - expected: Pressing Swap replaces 'Small talk about favourite places' with another topic.
  - got: Four swap presses; the topic is still in the list and in planAgreed.
  - evidence: #2,#3,#4,#6 swap on favourite places; #7 list unchanged; #8 planAgreed includes it. · linga-plan swap action
  - acceptance: After Swap, the chosen topic is replaced by a different one, or an error is shown.
- **blocker · rank 27** `LT-tomas-9-J1-1` (clarity) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J1-1`, recurrence 3 — Check tasks too long for a nine-year-old beginner
  - expected: Prompts of 15 words or fewer in words he knows
  - got: ~25-word choose prompts and a 22-word listening line; he skipped one and wanted to quit
  - evidence: #5 "Your dog runs to the door and wags his tail. Someone rings the bell..."; #7 "Too long and fast"; #10 "Dlouhé, těžké... chci už skončit." · check task generation prompt
  - acceptance: Every check prompt and listening line is 15 words or fewer using pre-A1 vocabulary.
- **blocker · rank 27** `LT-tomas-9-J1-4` (trust) — 'Only single words' feedback feels like failing
  - expected: Warm praise for any English word, no 'only'
  - got: 'Your English was only single words, so try a full sentence'
  - evidence: #9/#10 "Thanks for sharing! Your English was only single words" · task note prompt
  - acceptance: For elementary profiles, notes celebrate words and never say 'only'.
- **blocker · rank 18** `LT-martin-45-J3-1` (senior-quality) · recurs `2026-10-14-lt/recert-3/LT-martin-45-J3-1`, recurrence 5 — "we was promised" and other fossilised errors get no moment
  - expected: A moment or coaching on "we was promised", "until next Friday" and "confirm me".
  - got: Turn 3 got nothing. The recap lists two fixes only.
  - evidence: #7 "we was promised the delivery in the middle of October ... I need the first one until next Friday" got no moment. #11 "please confirm me the date" got none. #13 "2 moments to keep". · moment detection / as-needed rule
  - acceptance: Every learner turn with his named fossilised error gets a moment or a coaching note, or the recap lists it.
- **blocker · rank 18** `LT-adela-17-J1-3` (clarity) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J1-3`, recurrence 4 — Notes generic or inaccurate
  - expected: Each note names a concrete strength or error with a quote.
  - got: "Well done."; "Try more precise, idiomatic phrases"; "tangled" with no cause.
  - evidence: #10 notes on tasks 1, 4 and 5. · verdict note prompt
  - acceptance: Notes cite one phrase from the answer and say why it works or fails.
- **blocker · rank 18** `LT-adela-17-J4-3` (clarity) · recurs `2026-10-14-lt/recert-1/LT-adela-17-J4-3`, recurrence 4 — Help is a simplified restatement or an unrelated quiz
  - expected: A B2 answer frame for what she is stuck on.
  - got: 'Said more simply' restatements and a second-conditional quiz unrelated to the question.
  - evidence: #3 'Which device do you use most for reading news?'; #4 'Which sentence is a correct second conditional?'; #7 'Which news do you like?' · cue prompt
  - acceptance: Cue returns an opinion or comparison sentence frame matched to the question asked.
- **blocker · rank 18** `LT-adela-17-J2-1` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J2-2`, recurrence 3 — Plan is half everyday tasks, not exam discussion
  - expected: At least 4 of 6 topics are exam-style opinion, comparison or speculation topics.
  - got: Blackout story, e-waste drop-off and 'Could you explain that again?' are everyday tasks; fit 4/7 after her add.
  - evidence: #2 "Find an e-waste drop-off point"; "Could you explain that again?"; planAgreed 7 topics. · topic plan prompt
  - acceptance: For a B2 First candidate, at least 4 of the 6 proposed topics are opinion, comparison or speculation.
- **blocker · rank 18** `LT-adela-17-J2-2` (missing) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J2-3`, recurrence 3 — Mock interview not proposed up front
  - expected: A speaking-interview topic is in the initial set for a B2 First candidate.
  - got: She had to add it herself.
  - evidence: #2 add-topic text; not in the initial six. Appears as 7th in #3. · topic plan prompt
  - acceptance: Initial plan for an exam-aiming learner includes an interview-style topic.
- **blocker · rank 18** `LT-adela-17-J2-3` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J2-5`, recurrence 3 — Questionable 'usual slip' correction
  - expected: Only corrections an examiner would accept.
  - got: Her grammatical 'would stay' is turned into 'would have to stay off', which changes the meaning.
  - evidence: #1 "“whereas during explanations they would stay” → try “whereas during explanations they would have to stay off”" · placement coaching prompt
  - acceptance: Corrections flag only real errors and keep the learner's meaning.
- **blocker · rank 18** `LT-adela-17-J4-4` (trust) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J4-6`, recurrence 3 — Supported flags and recap misstate independence
  - expected: Unaided replies recorded as independent; recap separates supported from independent.
  - got: Later replies with no help flagged supported:true; recap says '7 spoken · 0 written replies'.
  - evidence: #11, #13 no help used but evidence supported:true; #17 recap line. · evidence recorder / recap builder
  - acceptance: Only replies after a cue, phrase or Show me count as supported; the recap shows both counts.
- **blocker · rank 18** `LT-tomas-9-J1-2` (clarity) · recurs `2026-10-14-lt/recert-2/LT-tomas-9-J1-4`, recurrence 3 — About-you questions too long and about learning history
  - expected: One tiny question like 'Do you like Minecraft?'
  - got: 'Where do you use English in your life?' and a 24-word two-option question
  - evidence: #2 "Where do you use English in your life?"; #4 "Do you know how to say 'my dog' or 'I have a dog' in English? Tell me!" · linga check intro prompt
  - acceptance: Intro questions for elementary profiles are under 10 words, about games or animals.
- **blocker · rank 18** `LT-tomas-9-J1-3` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J1-2`, recurrence 3 — Slips and focus beyond his level, stray punctuation
  - expected: Focus using like/is only; no 'slip' labels on single-word answers
  - got: 'Your usual slips … “Brother?” → try “My brother and I will play Minecraft.”' and 'build a house'; 'Your words: “Minecraft house.”.'
  - evidence: #10 slips line and "“Minecraft house.”." · placement summary / focus prompt
  - acceptance: Focus is one tiny phrase with known verbs; no doubled period; no 'slips' for a beginner's single words.
- **blocker · rank 18** `LT-tomas-9-J2-1` (clarity) · recurs `2026-09-15-lt-recert/LT-tomas-9-J2-2`, recurrence 3 — Abstract skill labels and long why lines for a 9-year-old
  - expected: Tiny picture-led labels and one short reason in words he knows.
  - got: Labels "Understand and repair", "Get something done", "Make contact" and 14-word why lines.
  - evidence: #2 "Understand and repair · Vera · shop helper"; "Tell a short story about your game and put the events in order." · plan topic generation prompt
  - acceptance: Each topic shows a label of at most 3 child words and a reason of at most 8 words; no skill category names.
- **blocker · rank 18** `LT-tomas-9-J3-1` (senior-quality) · recurs `2026-09-15-lt-recert2-beginners/LT-tomas-9-J3-2`, recurrence 3 — Several Sam turns use words above a beginner nine-year-old
  - expected: Very short sentences made of words he knows
  - got: 'make', 'build', 'wood', 'yours' and 'favourite thing to build' are used with no support
  - evidence: #5 learner: 'Hmm, make – I don't know it'. #9 'Yours? Hmm, I think it means...'. #17 'Hard question... I'm getting tired.' · conversation partner prompt (band A2 for an A1 child)
  - acceptance: At least 80% of partner turns use only words an A1 child knows; after a hesitation, the next turn gets easier.
- **blocker · rank 18** `LT-tomas-9-J3-3` (trust) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J3-4`, recurrence 3 — Grown-up situations are listed for a nine-year-old
  - expected: Child-suited situations only
  - got: 'A booking that is missing', 'Our group project' and 'The lost jacket' are offered
  - evidence: #1 and #18 situation list. · situation catalogue filter
  - acceptance: The situation list for elementary profiles hides adult and workplace contexts.
- **blocker · rank 18** `LT-tomas-9-J4-1` (senior-quality) · recurs `2026-09-15-lt-recert2-beginners/LT-tomas-9-J4-3`, recurrence 3 — Partner turns too long for A1 nine-year-old
  - expected: One very short sentence and one simple question.
  - got: Two or three sentences plus a question with 'favorite toy'.
  - evidence: #10 'Red roof, nice! My dog loves red too. What is the name of my dog's favorite toy?'; #12 'My dog is happy, and I like dogs too. Do you know my dog's name?' · partner prompt, A2 band for elementary
  - acceptance: Partner turns at most 8 words with one question, known vocabulary.
- **blocker · rank 18** `LT-tomas-9-J4-2` (completion) · recurs `2026-09-15-lt-recert/LT-tomas-9-J4-4`, recurrence 3 — No replay of the moment
  - expected: Fresh question to retry the coached point.
  - got: Only 'Back to the conversation'; session ends without retry.
  - evidence: #7 only 'Back to the conversation'; #13 '1 moment to keep' · moment replay flow
  - acceptance: Moment screen offers Try again with a new question.
- **blocker · rank 18** `LT-tomas-9-J4-3` (senior-quality) · recurs `2026-10-14-lt/recert-1/LT-tomas-9-J4-5`, recurrence 3 — Real errors uncoached; trivial moment chosen
  - expected: Coach 'I build house' → 'a house' and 'dog' → 'dogs'.
  - got: Only the Czech word got a moment; 'I like dog' repeated twice.
  - evidence: #10 and #11 'I like dog.' no moment · moment selection prompt
  - acceptance: Moment targets grammatical errors in the learner's words.
- **blocker · rank 18** `LT-adela-17-J1-2` (trust) · recurs `2026-09-15-lt/LT-adela-17-J1-3`, recurrence 2 — Her direct question 'Was that correct?' is never answered
  - expected: A yes/no with the rule, in the verdict or the task note.
  - got: The note says the sentence is 'tangled' and the question is skipped.
  - evidence: #8 "Was that correct?"; #10 note "The whereas sentence is tangled". · verdict note prompt
  - acceptance: A question to the tutor in a response gets an accurate answer in the note.
- **blocker · rank 18** `LT-adela-17-J4-2` (missing) · recurs `2026-09-15-lt/LT-adela-17-J4-5`, recurrence 2 — Replay offers no fresh question
  - expected: Replay the moment gives a new question and she answers it better.
  - got: She re-says the same sentence; no replay is offered or taken.
  - evidence: #9 'Say it again, your way'; #10 'Back to the conversation'. · moment/replay prompt
  - acceptance: After a moment, offer a fresh question that exercises the same point.
- **blocker · rank 18** `LT-adela-17-J4-1` (senior-quality) — Tutor marks a correct answer wrong and repeats an old correction
  - expected: Answer 'Was my answer correct?' accurately: yes, the answer was correct.
  - got: Lena says 'No, 'phone than' should be 'phone to''.
  - evidence: #11 answer had no error; #12 reply: 'No, 'phone than' should be 'phone to': 'I prefer my phone to my laptop.'' · partner prompt / correction carry-over
  - acceptance: When the learner asks if a sentence was correct, the reply judges only that sentence; never re-issues a prior correction.
- **major · rank 12** `LT-tomas-9-J2-2` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J2-3`, recurrence 4 — Placement summary tasks and feedback exceed 15 words and A1 level
  - expected: Tasks of about 15 words or fewer; advice using words he has.
  - got: Two 25-word tasks, a B1 task offered, and advice "My brother and I will play Minecraft".
  - evidence: #1 "Your dog runs to the door and wags his tail. Someone rings the bell..."; "Try “My brother and I will play Minecraft.”" · placement task prompt
  - acceptance: Check tasks and tips for elementary A1 use 15 words or fewer and only known verbs.
- **major · rank 12** `LT-martin-45-J1-2` (trust) · recurs `2026-10-14-lt/recert-4/LT-martin-45-J1-4`, recurrence 3 — Why B1 not B2 still thin
  - expected: Clear reason B2 answers fell short
  - got: 'close, but none was strong', confidence low
  - evidence: #8 'Your B2 answers were close, but none was strong' · placement summary prompt
  - acceptance: Verdict states concrete B2 gaps
- **major · rank 12** `LT-martin-45-J1-3` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-martin-45-J1-3`, recurrence 3 — Task 1 passes despite slips; 'team has' note questionable
  - expected: Partial or accurate note
  - got: pass with 'he move', 'team have'
  - evidence: #5, #8 note 'team has' · listen task judge
  - acceptance: Flag slips consistently
- **major · rank 12** `LT-tomas-9-J4-4` (trust) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J4-2`, recurrence 3 — Supported flag inaccurate
  - expected: Only helped replies marked supported.
  - got: 'Ball is blue...' turn (no help used at #11) is supported:true; 'Roof is red' used 'Said more simply' so fine.
  - evidence: facts turns: 'Ball is blue. Modrá. I like dog.' supported:true; #11 no help pressed · evidence recording of supported
  - acceptance: supported true only when help was opened for that turn.
- **major · rank 12** `LT-adela-17-J3-1` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-adela-17-J3-2`, recurrence 2 — Missing article 'for environment' never flagged
  - expected: A moment or note on 'the environment'
  - got: Partner only answered 'pay off' and moved on
  - evidence: #5 learner: 'the production is not good for environment'; #6 partner: 'Yes, pay off is correct'. No moment or coaching. · moment detection / partner correction prompt
  - acceptance: Clear grammar slips in a turn get a moment or a one-line note, even when the learner asks about another phrase.
- **major · rank 12** `LT-adela-17-J2-5` (trust) — Her direct question 'Was that correct?' not answered plainly
  - expected: A direct yes/no with the reason.
  - got: The note says the sentence is 'tangled' with no clear correct/incorrect answer.
  - evidence: #1 "Was that correct?" → "The whereas sentence is tangled"
  - acceptance: When she asks if it was correct, the reply says yes or no and why.
- **major · rank 12** `LT-adela-17-J3-2` (clarity) — Her question about 'possibly' not answered directly
  - expected: Say whether 'might possibly not' was correct and why
  - got: Same clue repeated, then 'Try may not'
  - evidence: #8 'Is "possibly" correct here?'; #9 'Is that correct now?'; #9/#10 only the 'Eventually' note. · moment repair loop
  - acceptance: When a learner asks if a repair is correct during a moment, answer it.
- **major · rank 12** `LT-tomas-9-J3-5` (clarity) — Sam asks 'What is your name?' again late in the chat
  - expected: Conversation moves forward
  - got: After the Rex football turn Sam asks his name a second time, and the mission label stays 'Tell Sam your name'
  - evidence: #16 'Rex plays football with you! That sounds fun. What is your name?'; label 'Now: Tell Sam your name' in #4-#16. · conversation partner prompt / mission step tracker
  - acceptance: The partner never repeats an answered mission question; the 'Now' label follows progress.
- **major · rank 9** `LT-tomas-9-J3-2` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J3-2`, recurrence 4 — Moment explanation uses grammar jargon
  - expected: A child-sized reason such as 'More than one dog: dogs.'
  - got: 'Use the plural 'dogs' when you talk about dogs in general.'
  - evidence: #11 and #18 recap: 'Use the plural 'dogs' when you talk about dogs in general.' · moment prompt / correction rules
  - acceptance: Moment 'why' lines for elementary profiles have no grammar terms and are 8 words or fewer.
- **major · rank 9** `LT-martin-45-J2-2` (clarity) · recurs `2026-10-14-lt/recert-4/LT-martin-45-J2-3`, recurrence 3 — Plan grows from six to seven after an add, unexplained
  - expected: Six topics, or a note explaining the new size.
  - got: '7 conversations for you' and seven agreed.
  - evidence: #6 '7 conversations for you'; #8 seven items in planAgreed. · linga-plan add-topic
  - acceptance: Adding a topic replaces one or says why the plan is now seven.
- **major · rank 9** `LT-tomas-9-J4-5` (clarity) · recurs `2026-09-15-lt/LT-tomas-9-J4-4`, recurrence 3 — Topic list long and mixed
  - expected: A small list mostly about play and animals.
  - got: 21 situations including booking, project, lost jacket.
  - evidence: #1 list
  - acceptance: Show six child-suited topics.
- **minor · rank 6** `LT-martin-45-J3-2` (completion) · recurs `2026-10-14-lt/recert-4/LT-martin-45-J3-2`, recurrence 3 — Scene closes after five replies
  - expected: About eight replies of practice.
  - got: "Mission done" after the fifth reply.
  - evidence: #12 "Mission done. See what you did tonight." · mission completion rule
  - acceptance: The mission does not complete before about eight learner replies.
- **minor · rank 6** `LT-tomas-9-J2-3` (senior-quality) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J2-5`, recurrence 3 — Narrate and describe goals demand more than like/is
  - expected: Goals he can meet with words he has.
  - got: "using first and then", "full sentence" goals.
  - evidence: #2 "put the events in order"; #3 "Say what you like about football, using full short sentences" · plan topic generation prompt
  - acceptance: Goals for pre-A1 children ask for one word or a like/is sentence.
- **minor · rank 6** `LT-tomas-9-J2-4` (completion) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J2-4`, recurrence 2 — Swap not exercised
  - expected: A swap visibly replaces a topic.
  - got: Only add was used; swap not shown.
  - evidence: #2-#3 seven Swap buttons present; actions were add-topic and agree. · plan swap handler
  - acceptance: A swap replaces the topic with a new child-suitable one.
- **minor · rank 6** `LT-tomas-9-J3-4` (missing) · recurs `2026-10-14-lt/recert-4/LT-tomas-9-J3-3`, recurrence 2 — Plural slip and 'Rex like' went unmarked until a later repeat
  - expected: A quick model on the first 'I like dog'; a gentle model for 'Rex like'
  - got: The first 'I like dog' (#4) passed; the moment came only at #10. 'Rex like... football' got nothing.
  - evidence: #4 'Yes. I like dog. Dog is good.' got no moment; #15 'Rex like... football!' got none. · moment trigger / coaching rules
  - acceptance: A repeated or first-seen clear slip gets a short model, with at most one stop per few turns.
- **minor · rank 6** `LT-adela-17-J3-3` (senior-quality) — Partial answer to 'Is that sentence correct?'
  - expected: Name both the false friend and the preposition error
  - got: 'No, actual technology should be current technology' only
  - evidence: #5 partner reply omits 'interested about', which the moment later caught at #3. · partner prompt, correction wording
  - acceptance: Partner answer and moment agree on all errors in the sentence asked about.
- **minor · rank 4** `LT-adela-17-J3-6` (trust) — Near-uniform 'Yes, correct' answers feel like confirmation
  - expected: Occasional refinement at examiner standard
  - got: Almost every checked phrase is 'correct' with a gloss
  - evidence: #7, #12, #14, #16, #18, all begin 'Yes, ... is correct'. · partner prompt
  - acceptance: Confirmations add register or collocation notes where useful.

## What passed

- `LT-adela-17-J1-4` Placement exact, with exam-style tasks — B2, via the library photo comparison and persuasion tasks at B2 and C1.
- `LT-adela-17-J3-5` B2 questions that keep the discussion going — Escalating, on-topic exam-style questions
- `LT-martin-45-J1-4` Specific slips list with fixes — Quoted slips with corrected forms; exact B1
- `LT-martin-45-J2-3` Added topic keeps his request and each topic has a clear why — 'Present a quality problem' with 'plan with the supplier to management'; no 'easy' framing.
- `LT-martin-45-J3-3` Short, correct reason on challenge — One-line rule shown after "Why is that wrong?".
- `LT-martin-45-J3-4` Meeting-shaped scene at his band — Elena's B1 English and a real negotiation-and-next-steps scene.
- `LT-tomas-9-J1-5` Honest, gentle verdict framing — 'Understood A2 · spoke A1 · not a certificate' and 'Some answers only partly showed this level'; skip note is kind
- `LT-tomas-9-J2-5` Added topic keeps what he asked for and plan is child-safe — "football" became "Talk about football" with Leo, football friend.
- `LT-tomas-9-J2-6` Interests drive the plan — Minecraft house, dog Max, creeper present at once.
- `LT-tomas-9-J3-6` Topic and warmth match Tomáš; the 'Nevím' moment is kind — Minecraft, creeper, dogs and football carried 12 turns. 'Nevím' got a translation and 'Take your time'.
- `LT-tomas-9-J4-6` Help ladder is findable in-scene — Simpler line, phrase choice and word gloss available.
- `LT-adela-17-J2-4` Added topic keeps her request — The mock interview keeps studying abroad and gives a reason tied to her words.
- `LT-adela-17-J3-4` Accurate moments with a clear reason — 'interested in'; 'Eventually means in the end, not possibly' → 'may not'
- `LT-adela-17-J4-5` Moments are exact and quote the learner — Both moments quote her exactly with a correct rule.
- `LT-adela-17-J4-6` Partner questions are B2 and on exam topics — Comparison and hypothetical questions on the phone topic.
- `LT-martin-45-J1-5` Workplace tasks fit Martin — Supplier deadline negotiation task

## Voices

**Adéla · J1** (time saved: -5 min · low)

> The level is right: B2, and the tasks felt like a real First speaking test. The library-or-home one and the councillor one were good, not babyish. But the "tell me exactly what was wrong" part let me down. I asked "Was that correct?" and got no answer. Then it showed my sentence "they would stay in a box" as a slip and suggested "would have to stay off". My sentence was fine, and that suggestion is worse English. Calling it "tangled" is wrong too. "Well done" and "more idiomatic phrases" are exactly the vague comments I can't use. If one correction is wrong, I have to re-check them all, so it saved me no time. I'd retry once for the placement, but I wouldn't trust it as a tutor yet.

**Adéla · J2** (time saved: -5 min · low)

> Reasons for each topic were clear and the mock interview I added came back as a proper topic. I liked that. But half the plan is errands: an e-waste drop-off and "Could you explain that again?" are not what I need for B2 First. I'd have wanted the interview offered at the start, not typed in myself. I also don't trust the "usual slip": my "would stay" was fine, and changing it to "would have to stay off" alters what I meant. I asked "Was that correct?" and got "tangled", not an answer. Kept it short, no fluff, which I like, but I'd re-check everything myself. Not yet recommending it to classmates.

**Adéla · J3** (time saved: 60 min · medium)

> Good topic and proper B2 questions, no babyish stuff, and I got to talk for ten turns. "Eventually" caught immediately, and the "interested in" fix was right. But I'm picky: I said "good for environment" and nobody told me about the missing "the". When I asked "is that sentence correct?" it said no and mentioned only "actual". When I asked if "possibly" was right, it just repeated the clue. And it kept saying "Yes, correct" so often that I started to wonder what I wasn't being told. The recap is specific, not generic praise, which I liked. I'd use it for speaking practice, but I'd still check my notebook. It saves me the travel, not yet the re-checking.

**Adéla · J4** (time saved: -10 min · medium)

> Honestly, I wanted to like it. The moment screen quoting "I prefer my phone than my laptop" and giving the rule with "to" was exactly what my notebook needs, and the "not used to" note was right too. Lena's questions were proper B2 ones. But then I asked "Was my answer correct?" about a perfectly fine answer and she said "No, 'phone than' should be 'phone to'". That is a wrong correction, and now I have to re-check everything, which kills the time I'd save. The help was weak: "Said more simply" and a second-conditional quiz had nothing to do with what I was stuck on. There was no replay with a new question, only repeating my own sentence, and the recap doesn't say what I did alone. I'd not tell classmates yet. Fix the false "No" and I'd come back.

**Martin · J1** (time saved: 15 min · low)

> Fine, B1, not C1 — I can live with that, because it showed my actual sentences: "two weeks delay make", "people in my company is cycling". That's concrete and I can't argue. But the headline example, "he move the supplier call", felt silly; I misread a line. And "we was discussing", "since 2015"? Not a word. The reason I'm not B2 is just "close, but none was strong". A trainer would want more. Meeting topics were right, no baby stuff, and seven minutes beats a school test. I'd come back, but I'd want the focus on my real habits. Would I tell a colleague? Decent, not yet sharp.

**Martin · J2** (time saved: 0 min · low)

> Look, the topics are mostly right: supplier call, moving a deadline, disagreeing about a report. Finally something for my job, and each has a reason. I added the quality-problem presentation in my own words and it came back as what I asked for. Good. But the swap button is broken. I pressed it four times on "favourite places" and nothing happened. Then it let me agree with that hobby topic anyway. For a man who hates wasted time, that is bad. The plan also became seven without any explanation. I'd use it for the meeting practice, but I'd not trust the controls yet. Also "team have" is fine in British English, so why correct it? Fix swap first, then I'd tell colleagues.

**Martin · J3** (time saved: 45 min · low)

> Look, this was close to my real Monday call, so I'd use it again. Elena spoke clearly and sensibly, and the supplier negotiation was proper work, not a toy. When I asked "why is that wrong?" I got one line, and it was right. "Discuss about" is wrong, and "until" is not "by" for a deadline. I accept both. But I said "we was promised" and "confirm me", and nothing stopped me. That is exactly what the new director hears. So I don't fully trust that it sees my English. It also said "mission done" after five replies, while I wanted more. The recap with two fixes is neat but thin. I'd tell a colleague to try it, with the warning that it catches only part of my mistakes.

**Tomáš · J1** (time saved: -5 min · low)

> Hm, it was okay at the start, I said Minecraft and dog and creeper, that was fun. Then the tasks were dlouhé. The dog and the bell one, I only knew "hello", so I guessed. The listening one was too fast, I pressed nevím. At the end it said I only say single words and gave me a long sentence to learn. That felt like school. A2 is a bit high, I am not that good, but I did get the level number and I liked that it said "not a certificate". I would not press it again alone. Maybe if the questions were tiny, like "Creeper? Yes or no?" Mum would need to help me now. I would not tell kamarád yet.

**Tomáš · J2** (time saved: 10 min · low)

> Jo, Minecraft and pes were there right away, and I could add fotbal myself. That was good. Then I pressed agree and wanted to play. But the words on the screen: "Understand and repair", "Get something done"? Nevím. That sounds like school. Mum would have to read it to me. The reasons are too long for me too. I did not try swap, so I don't know if it works. The tutor was not mean when I said nevím, and I liked that. Would I use it again? Maybe, if the topics were shorter and just pictures and one word. I wouldn't tell friends yet. The club costs lots of money and I speak two minutes there, so this could be better.

**Tomáš · J3** (time saved: 50 min · medium)

> Jo, I talked a lot! Sam knew Minecraft and dogs, and I said "Rex is big! Big dog. Woof!" That was fun and I felt clever. The "nevím" help was good, because it told me the English and didn't make me feel bad. But some questions were hard: "make", "yours", "favourite thing to build". Then I only said Minecraft words and got tired. The dog-plural thing had a long grown-up sentence, and I didn't really get it. Sam also asked my name two times, which was funny and weird. The list had a "booking" and a "group project", and that is school stuff, no thanks. Maman would like that I speak ten minutes at home instead of driving to the club where I say two minutes. I'd use it again, but I want shorter questions.

**Tomáš · J4** (time saved: 30 min · low)

> Jo, Minecraft! The help buttons were easy: I pressed the cue and the sentence got shorter, and "build" got explained. I liked that. Alex was nice when I said "Nevím" and called ball a good guess, so I didn't feel dumb. But Alex talks too much. "Favorite toy" I did not get at all. Then it stopped me for "Dům", which I knew was house, and never fixed my real mistakes, "I like dog". I never got to try the question again, so I didn't feel clever. My mum would like that it's short at home, not a club. I'd use it again, but only if Alex talked smaller.
