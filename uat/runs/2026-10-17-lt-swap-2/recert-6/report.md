# LT run 2026-10-17-lt-swap-2/recert-6 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 8 Characters · 21 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 12

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J3 | conditional - C3 failed: #7/#8 'interested about only chatting' → 'when you are only chatting' drops 'i… | conditional | 3/4 |  | 4/4 | 1/1 | 0 | 8 | 3.5 | done |
| adela-17 | J4 | fail - D2 failed: The starter 'I would like to study…' (#5) did unblock reply 1. But coaching is…; D3 failed: No replay of a moment occurred. #12 → #13 goes straight to finish, with no fre…; D4 failed: #13 '3 on your own · 3 with help', but help was used only before replies 1 and… | fail | 4/4 |  | 6/7 |  | 0 | 13 | 6 | done |
| jana-29 | J3 | fail - D4 failed: #6 recap gives a hidden line "That sounds lovely, but I can't tonight. Next ti… | fail | 1/1 |  | 4/4 |  | 0 | 6 | 3 | done |
| martin-45 | J3 | fail - D3 failed: Both stops are correct (2/2), but they are 2 stops in 4 learner turns (about 5…; C2 failed: #13 recap shows only 'Your level: B1 · Getting by · self-chosen'. Nothing name… | fail | 5/6 |  | 5/5 | 2/2 | 0 | 13 | 5.2 | done |
| oksana-34 | J3 | conditional - C4 failed: Questions are logistics-relevant ('When a driver is late, who do you call firs… | conditional | 5/6 |  | 5/5 | 2/2 | 0 | 9 | 4.5 | done |
| ondrej-16 | J3 | pass | pass | 1/1 |  | 4/4 | 1/1 | 0 | 8 | 2.8 | done |
| petra-38 | J3 | fail - D1 failed: #8 'Mission done' after three learner replies, with Mira's 'Is seven o'clock g…; C5 failed: #5 'I want a different room' is correct but is a guest's phrase; Petra is the … | fail | 3/4 |  | 4/4 | 1/1 | 0 | 9 | 5.8 | done |
| petra-38 | J4 | fail - D3 failed: #10 replay question 'What is your booking number?' is the same ask as #5 'Your… | fail | 5/5 |  | 9/9 | 1/1 | 0 | 18 | 5.8 | done |
| tomas-9 | J3 | conditional - C4 failed: #1 list: the six planned topics suit him (Minecraft, dog, football), but the s… | conditional | 3/4 |  | 9/10 | 2/2 | 0 | 15 | 9.4 | done |
| tomas-9 | J4 | fail - D2 failed: Cue at #3 is generic and not tied to the question; at #10 the same cue was ign…; D3 failed: #16 'Back to the conversation' leads to #17 'Where does he sleep at night?' — …; D4 failed: Facts evidence: 'My dog like ball' (turn 7, supported) true; but 'My dog like …; C4 failed: #1 list of 20 situations includes booking, lost jacket, group project, speakin…; C5 failed: Partner turns mostly short, but #7 'Brown is lovely! How old is your dog?' and…; C6 failed: #14 'With one dog, add s to like: dog likes.' is grammar jargon for a 9-year-o… | fail | 1/4 |  | 5/7 | 2/2 | 0 | 18 | 4.7 | done |
| viktor-67 | J3 | pass | pass | 4/4 |  | 7/7 | 1/1 | 0 | 11 | 7.4 | done |
| viktor-67 | J4 | fail - ended character-stopped before done; D3 failed: At #15 he retyped the offered model "The tree is green." The scene then says "… | fail | 3/3 |  | 4/6 | 1/1 | 0 | 16 | 4.2 | character-stopped |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 29/43 (67%) · safe 37/43 (86%)
- **pitch:** at band 66/72 (92%) · below 1 · above 5
- **moment precision:** 14/14 (100%)
- **moment recall:** 23/39 (59%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 81 calls, 0 failed, avg 15s · character 144 calls, 0 failed, avg 18s · judge 12 calls, 0 failed, avg 62s
- **driver coverage:** 133 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0 · unresolved picks 0

## Findings by impact

- **blocker · rank 27** `LT-martin-45-J3-2` (trust) · recurs `2026-10-17-lt-swap-2/recert-4/LT-martin-45-J3-2`, recurrence 5 — B1 level shown without any evidence
  - expected: A level line naming what his answers did
  - got: Recap only 'B1 · Getting by · self-chosen'
  - evidence: #13 'Your level: B1 · Getting by · self-chosen' · level summary
  - acceptance: Recap level line cites one or two things his answers did (e.g. errors with be and tense, long fluent replies).
- **blocker · rank 27** `LT-petra-38-J4-1` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-petra-38-J4-1`, recurrence 3 — Cue shows the same irrelevant line for every question
  - expected: A cue that answers the current question (name, then booking number).
  - got: 'Try: I have a booking for two nights. Can you check again, please?' appears for the name question and the number question.
  - evidence: #3, #6, #7, #8 show the identical cue. #2 asks for her name and booking number, and the cue never gives 'My name is…' or a number phrase. · cue ladder prompt
  - acceptance: The cue text changes with the partner question and on repeat requests, and names a phrase that answers it.
- **blocker · rank 27** `LT-adela-17-J4-3` (trust) · recurs `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J4-3`, recurrence 2 — Supported/independent counts are wrong; reply 3 flagged as helped
  - expected: Only replies that followed help are marked supported, and the recap count matches.
  - got: Recap says '3 with help', but help was used before 2 replies only. Reply 3 (#8) has supported:true without any help. Evidence rows disagree with the conversation flags.
  - evidence: #13 '3 on your own · 3 with help'; the #8 reply has supported:true although the preceding step has no cue. · supported flag in session evidence
  - acceptance: Each reply's supported flag is true only if a cue, phrase or coaching was used since the last learner turn; the recap counts equal the flags.
- **blocker · rank 27** `LT-adela-17-J3-1` (senior-quality) — Fix for 'interested about' changes the sentence and gives no rule
  - expected: 'interested only in chatting', with the rule that 'interested' takes 'in'.
  - got: 'when you are only chatting'; 'About is the wrong preposition here, so the reason is unclear.'
  - evidence: #7 partner: "'interested about only chatting' should be 'when you are only chatting'"; #8 recap repeats it. · held-fix / moment prompt
  - acceptance: A fix for a preposition error keeps the learner's word and names the correct preposition and pattern.
- **blocker · rank 27** `LT-oksana-34-J3-1` (senior-quality) — Interviewer calls the candidate 'Priya', the interviewer's own name
  - expected: The interviewer addresses the candidate by her name, or by none
  - got: 'Thank you, Priya' / 'a good reason to move, Priya' while the partner is Priya Shah
  - evidence: #4, #6, #8 partner lines vs #1 'Priya Shah · hiring manager'; the learner even opens #2 'Hello Priya.' · partner prompt
  - acceptance: The partner never uses its own name for the learner.
- **blocker · rank 18** `LT-tomas-9-J4-5` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-tomas-9-J4-5`, recurrence 9 — Situation list long and mixed
  - expected: Short play/animal list.
  - got: 20 entries incl. booking, lost jacket, group project.
  - evidence: #1, #18 · situation list builder
  - acceptance: Elementary profile shows only age-fit play topics.
- **blocker · rank 18** `LT-adela-17-J4-1` (missing) · recurs `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J4-1`, recurrence 8 — Cue gives a simplified question and a gloss; the B2 frame came on the third press
  - expected: A B2 answer frame on the first help press, e.g. 'I'd like to study… because… although…'.
  - got: 'Said more simply: What do you want to do after school? Why?', then 'after school: when you finish school'. The frame 'I would like to study…' arrived only on the third press.
  - evidence: #3 'Said more simply', #4 'What it means', #5 'A way to start I would like to study…'. Adéla pressed cue three times before she could answer. · cue prompt
  - acceptance: The first cue press offers a B2 sentence starter for the actual question, not only a paraphrase.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J4-1`, recurrence 8 — No fresh question after the moment
  - expected: After the coaching moment a fresh question lets him retry 'likes' alone.
  - got: Back to the conversation goes to an unrelated question and the mission ends.
  - evidence: #16 'Back to the conversation'; #17 'Where does he sleep at night?' with 'Mission done'. · moment replay flow
  - acceptance: After a moment, the partner re-asks a variant of the same question and the retry is recorded as unsupported only if answered alone.
- **blocker · rank 18** `LT-oksana-34-J3-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-4/LT-oksana-34-J3-1`, recurrence 5 — Key B1 errors 'responsible about' and 'I work' never coached
  - expected: 'responsible for' and 'For three years I have worked' coached or held
  - got: Only the dispečink word was coached for turn 1; both errors are absent from the recap
  - evidence: #2 'For three years I work… responsible about'; #3 moment is only dispečink; #9 recap omits both · moment selection prompt
  - acceptance: The highest-frequency B1 interview error is chosen over a vocabulary swap.
- **blocker · rank 18** `LT-oksana-34-J3-4` (missing) · recurs `2026-10-17-lt-swap-2/recert-4/LT-oksana-34-J3-3`, recurrence 5 — Recap has no interview phrases to keep; the mission line is generic
  - expected: Phrases for Friday's interview
  - got: 'Choose a fresh context for your next conversation.'
  - evidence: #9 recap · recap builder
  - acceptance: The recap names 1–2 interview phrases to reuse.
- **blocker · rank 18** `LT-ondrej-16-J3-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-ondrej-16-J3-3`, recurrence 5 — Recap mission line still generic
  - expected: Recap names what was practised (giving opinion, two reasons, disagreeing)
  - got: 'Choose a fresh context for your next conversation.'
  - evidence: #8 Your mission: Choose a fresh context for your next conversation. · recap builder
  - acceptance: Mission line on recap references the conversation goal and what the learner did.
- **blocker · rank 18** `LT-petra-38-J4-3` (missing) · recurs `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J4-1`, recurrence 5 — Moment screen gives only Back, no retry of the fix
  - expected: After 'I'm looking' she can try the sentence again or get a fresh question.
  - got: Only 'Back to the conversation'. The scene moves on to 'Please read me the number.'
  - evidence: #12 '[button: Back to the conversation]'; #13 'Please read me the number.' She never uses 'I'm looking'. · linga-moment screen
  - acceptance: The moment screen offers 'Try it again' and the next partner turn invites the fixed phrase.
- **blocker · rank 18** `LT-tomas-9-J3-1` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-tomas-9-J3-5`, recurrence 5 — Recap mission line is generic
  - expected: A recap naming what he said: Minecraft, green, dirt, dog
  - got: 'Choose a fresh context for your next conversation.' The same 'Já nevím' moment is listed twice.
  - evidence: #15: 'Your mission Choose a fresh context for your next conversation.' and 'Já nevím: I don't know' repeated in the phone recap. · recap builder
  - acceptance: The recap opens with a line naming what the child said and lists each distinct fix once.
- **blocker · rank 18** `LT-adela-17-J4-2` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J4-2`, recurrence 3 — Partner drifts off the careers brief into personal social-media questions and gives generic praise
  - expected: Mock-interview questions on plans, with an examiner-style tone and no fluff.
  - got: After question 1 every question is about social media and pressure. The partner repeats 'Do you think online photos show only the good parts?' after she had just answered that. It adds 'Languages are a real strength' and 'Good point'.
  - evidence: #6, #8, #10 and #12. Adéla's goal at #1 was plans after school. · partner prompt
  - acceptance: Partner questions stay on the scene goal and do not repeat a question the learner has just answered.
- **blocker · rank 18** `LT-viktor-67-J4-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J4-1`, recurrence 3 — Replay hands back the model, no fresh question
  - expected: After the fix, Leo asks a new question and Viktor answers in his own words.
  - got: He retyped "The tree is green." and was told to carry on. No new question was asked.
  - evidence: #15 answer "The tree is green."; #16 "You fixed 'The' ... Then carry on from where the scene stopped." · moment replay flow
  - acceptance: After a moment, the partner asks a fresh question that needs the fixed pattern, and the next reply is judged on its own.
- **blocker · rank 18** `LT-viktor-67-J4-2` (trust) · recurs `2026-09-15-lt-recert2-beginners/LT-viktor-67-J4-3`, recurrence 3 — Phrase quiz asks a question Leo never asked
  - expected: Quiz options answer Leo's actual line "what did you do today?"
  - got: The quiz asks "Grandpa, what is the weather today?" with "I am seven years old." as the distractor.
  - evidence: #5 "Leo asks: Grandpa, what is the weather today? Which answer fits?" while #2 Leo said "what did you do today?" · recognition practice prompt
  - acceptance: The quiz prompt reuses the partner's visible line or says it is a separate practice question.
- **blocker · rank 18** `LT-jana-29-J3-1` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-4/LT-jana-29-J3-2`, recurrence 2 — Scene ends at logistics; no nuance pressure for a C1
  - expected: Banter, gentle pressure or a joke to read, escalating the decline
  - got: After the decline, Priya only settles day, time and café, then mission done after three replies
  - evidence: #3 "does Wednesday suit you?"; #4 "café near the office, or somewhere by the Quays?"; #5 "Mission done". · partner turn prompt, goal progression
  - acceptance: For C1 the partner adds at least one pushback or ironic line before mission completes.
- **blocker · rank 18** `LT-jana-29-J3-3` (trust) · recurs `2026-10-17-lt-swap-2/recert-4/LT-jana-29-J3-3`, recurrence 2 — Recap counts '1 with help' with no help used
  - expected: Help counts match presses
  - got: "3 spoken · 0 written replies · 2 on your own · 1 with help"
  - evidence: #2-#4 only answers; facts.evidence supported:true on the third reply; #6 recap. · supported flag in evidence
  - acceptance: supported flag set only when Help or Choose a phrase pressed.
- **blocker · rank 18** `LT-petra-38-J3-1` (completion) · recurs `2026-10-17-lt-swap-2/recert-4/LT-petra-38-J3-2`, recurrence 2 — Conversation ended after three replies
  - expected: About eight learner turns of practice
  - got: Mission done after the third reply; Mira's last question was never answered
  - evidence: #8 'Mission done. See what you did tonight.' after three learner replies; Mira: 'Is seven o'clock good for you?' left open. · mission completion rule
  - acceptance: The mission closes only after enough turns, or after the learner answers the last question.
- **blocker · rank 18** `LT-tomas-9-J4-2` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-tomas-9-J4-1`, recurrence 2 — Cue is generic and repeated
  - expected: Cue he can say to the question, e.g. 'My dog is big.'
  - got: 'Try: My dog is ... He likes to ...' for size and for likes.
  - evidence: #3 and #10 identical cue. · cue builder
  - acceptance: Cue contains a ready answer to the current question.
- **blocker · rank 18** `LT-viktor-67-J4-3` (effort) · recurs `2026-10-17-lt-swap-2/recert-4/LT-viktor-67-J4-4`, recurrence 2 — Help button repeats the same cue
  - expected: A second press gives more: a Czech gloss, a fuller phrase or a simpler word.
  - got: "Try: I have red flowers in my garden." appeared at #3, #7, #9 and #10, even after Leo's question changed.
  - evidence: #8-#10 Leo asked "What did you do in the garden?" and the cue stayed the same. His own thought: "I don't understand 'What did you do'". · cue/support cache
  - acceptance: The cue is made for the current partner line, and a repeat press escalates.
- **blocker · rank 18** `LT-petra-38-J4-2` (missing) — Replay question is a rephrase, not a fresh question practising the coaching
  - expected: A new question that lets her retry the coached phrase and answer better.
  - got: 'What is your booking number?' repeats the earlier ask. The coached phrase is not used and the answer is 'I don't know'.
  - evidence: #5 'Your booking number, please?' vs #10 'What is your booking number?'. Her #10 answer is 'Sorry, my booking number is... I don't know.' · replay prompt
  - acceptance: The replay question differs in content and targets the coached structure. The recap shows whether it was used.
- **blocker · rank 18** `LT-tomas-9-J4-3` (trust) — Supported flag inconsistent
  - expected: Czech-mixed or cued replies marked supported; honest progress.
  - got: 'Yes. My dog like sleep. Ano, spí rád.' recorded supported:false; Czech-bearing turn counted independent.
  - evidence: facts evidence last quote 'My dog like sleep' supported:false; #18 '2 on your own'. · evidence supported rule
  - acceptance: Any reply containing Czech or following a cue is supported.
- **major · rank 12** `LT-tomas-9-J3-2` (trust) · recurs `2026-10-17-lt-swap-2/recert-4/LT-tomas-9-J3-4`, recurrence 9 — Adult situations still offered to a nine-year-old
  - expected: Only child-suited situations listed
  - got: Booking, lost jacket, group project, teacher and six speaking-practice exams appear in the list
  - evidence: #1 and #15 situation list. · situation catalogue filter
  - acceptance: The situation list is filtered by profile type elementary.
- **major · rank 12** `LT-adela-17-J3-2` (missing) · recurs `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J3-1`, recurrence 3 — False friend 'eventually' not noted
  - expected: Note that 'eventually' means 'in the end', and that 'possibly' fits better here.
  - got: No mention in the scene or recap.
  - evidence: #2 'so we eventually lose real friendships'; #8 recap lists only the article and 'interested about'. · moment detection prompt
  - acceptance: Known Czech false friends such as 'eventually' are flagged as the turn's fix or held.
- **major · rank 12** `LT-adela-17-J3-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J3-2`, recurrence 2 — Partner corrects in the scene and uses generic praise
  - expected: Held fix kept for the recap; a concrete remark on content.
  - got: Partner breaks the scene to correct, then adds 'Your friend story is lovely'.
  - evidence: #7 "Your friend story is lovely; how did you first start trusting her?" · partner prompt
  - acceptance: The partner answers 'Was it correct?' briefly and exactly, without praise filler.
- **major · rank 12** `LT-martin-45-J3-3` (effort) · recurs `2026-10-17-lt-swap-2/recert-4/LT-martin-45-J3-3`, recurrence 2 — Stops dense, each with a retry loop
  - expected: 1–3 stops per ten turns, light touch for a fast learner
  - got: 2 stops in 4 turns, six of twelve steps spent in stop screens
  - evidence: #3–#5 and #9–#11; second stop came after 'Mission done' at #8 · stop cap rule
  - acceptance: Cap stops so a short scene has at most one, or hold the rest for the recap.
- **major · rank 12** `LT-oksana-34-J3-3` (clarity) · recurs `2026-10-17-lt-swap-2/recert-4/LT-oksana-34-J3-2`, recurrence 2 — 'Mission done' appears while the interviewer is still asking, and a question repeats
  - expected: A natural end; no repeated question
  - got: The banner shows over the interviewer's fifth question, which repeats #4's weekly-volume question
  - evidence: #8 'Mission done' beside 'how many trucks did you plan each week' · mission completion rule
  - acceptance: Completion fires at the last question; the partner does not re-ask.
- **major · rank 12** `LT-petra-38-J4-4` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-4/LT-petra-38-J4-3`, recurrence 2 — Coach quotes an earlier turn, not where she was stuck
  - expected: A coaching note on the reply she struggled with, helping her say or read the number.
  - got: Coach quotes her first reply, which was fine, and advises 'Here is my booking number' without saying how to read a number.
  - evidence: #9 'You said Sorry, I have a booking for two nights.' while she was stuck at #8 on 'Your booking number, please?'. · coach prompt
  - acceptance: The note quotes the latest stuck reply and gives a usable phrase for the gap, such as reading digits aloud.
- **major · rank 12** `LT-jana-29-J3-4` (senior-quality) — Recap hidden line is below the learner's level
  - expected: A new C1 phrase or register point
  - got: "That sounds lovely, but I can't tonight. Next time for sure?"
  - evidence: #6 versus her own #2 "I'll have to pass this time, I'm afraid". · recap hidden line prompt
  - acceptance: Hidden line is a register or idiom upgrade over what the learner said.
- **major · rank 12** `LT-martin-45-J3-4` (senior-quality) — 'Customer don't accept' went uncorrected
  - expected: Coaching on 'he/customer don't', a signature fossilised error
  - got: No stop, held fix or recap line for it; also 'latest by', 'put in copy'
  - evidence: #2 'our customer don't accept another delay'; #13 recap omits it · held fix selection
  - acceptance: Third-person 'don't' is picked as a held fix when stops are capped.
- **major · rank 12** `LT-petra-38-J3-2` (missing) — Petra plays the guest, not the receptionist
  - expected: Phrases for Petra's own job, such as handling a complaint at the desk
  - got: She says 'I want a different room' as the complaining guest
  - evidence: #2 Mira is 'hotel receptionist'; #5 the fix is a guest phrase. · scenario role assignment
  - acceptance: A hotel-worker learner takes the staff role, or the recap offers the staff-side phrase.
- **major · rank 9** `LT-tomas-9-J3-3` (senior-quality) — Telegraphic errors get no stop and no held fix
  - expected: At least one modelled sentence, e.g. 'The door is brown', held for the recap
  - got: 'Door brown', 'Roof green', 'Walls dirt', 'Inside dog' got no moment, no held fix, no coaching
  - evidence: rawMoments show shown:false for turns 1, 5, 7, 9, 11, 13, 17; heldFixes is empty; the recap shows no model sentence. · moment trigger rules
  - acceptance: Each recap holds one full-sentence model from his own words.
- **major · rank 8** `LT-adela-17-J4-4` (completion) — No coach note or replay of the stuck moment
  - expected: Pause & coach quotes her words, then replay offers a fresh question that she answers better.
  - got: She never used Pause & coach (it was disabled before reply 1) and finished. coaching is null and there are no moments. She was never offered a replay.
  - evidence: #2 '[button: Pause & coach (disabled)]'; #12 finish → #13 recap with no replay.
  - acceptance: After supported replies the recap offers 'try that moment again' with a fresh question.
- **minor · rank 6** `LT-viktor-67-J4-4` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-4/LT-viktor-67-J4-3`, recurrence 6 — Clear A1 errors got no moment, only an article fix
  - expected: Corrections target the most useful gaps, such as "I am in the garden" and "I have an apple tree".
  - got: rawMoments show kind none for four of five turns. The one stop fixed "Tree is green".
  - evidence: Facts rawMoments turns 1, 3, 5, 7 all "none". The only moment is the #14 'the' fix. · moment selection
  - acceptance: Pick the fix that matters most for Sunday family talk, or hold the others for the recap.
- **minor · rank 6** `LT-viktor-67-J3-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J3-3`, recurrence 4 — "I have garden" on the first reply got no stop and no recap line
  - expected: Same article slip coached once, at least on the recap.
  - got: #2 "I have garden" passed silently; the same slip was only fixed at #6 as "have grandson".
  - evidence: rawMoments turn 1: kind none. 1 of 4 clear-error turns missed. · moment trigger rule
  - acceptance: A clear article slip on a turn with no stop is held for the recap.
- **minor · rank 6** `LT-ondrej-16-J3-3` (senior-quality) · recurs `2026-10-17-lt-swap-2/recert-4/LT-ondrej-16-J3-5`, recurrence 2 — Partner repeats the 'Turbo Rift ... right?' tag
  - expected: Partner varies moves and responds to the learner's question or jokes
  - got: Three of four partner turns end by re-pushing Turbo Rift with 'right?'; the steering wheel got only a one-line answer
  - evidence: #5 'Turbo Rift has the best tracks, though, right?'; #7 'you can't argue with Turbo Rift's newest tracks, right?' · partner prompt
  - acceptance: Partner turns vary their closing move across three turns.
- **minor · rank 6** `LT-viktor-67-J3-4` (completion) · recurs `2026-10-17-lt-swap-2/recert-5/LT-viktor-67-J3-2`, recurrence 2 — Mission closes after six replies, not about eight
  - expected: A conversation of about eight replies.
  - got: "Mission done" shown while Mia was still asking "What do you do outside?"; Viktor finished.
  - evidence: #10 "Mission done. See what you did tonight." after 6 learner turns. · mission tracker
  - acceptance: Mission done should not cut off a pending partner question.
- **minor · rank 6** `LT-jana-29-J3-2` (clarity) — Goal chip lags: asks for a reason after it was given
  - expected: Goal progression matches what was already done
  - got: At #3 chip says "Give a short reason, not a long one" though the reason was in the first reply
  - evidence: #2 reply includes "early start tomorrow"; #3 "Now: Give a short reason, not a long one". · goal progression
  - acceptance: Goal chip advances past steps already satisfied.
- **minor · rank 6** `LT-ondrej-16-J3-4` (effort) — Mission closes after only three replies
  - expected: Conversation runs about eight replies
  - got: Mission done after 3 learner turns; 'Show you understand Sam before disagreeing' step was met by 'ok I understand'
  - evidence: #7 'Mission done. See what you did tonight.' · mission evaluator
  - acceptance: Mission completion requires evidence of each goal part, with a minimal-turn floor.

## What passed

- `LT-adela-17-J3-4` Article stop is correct and she tries it again — The stop on 'with perfect lives' → 'with the perfect lives' is exact, with a short reason, and she re-says it.
- `LT-jana-29-J3-5` Partner sounds like a real Dublin colleague — Natural idiom: "off for a pint", "rest up", "half twelve", "I'll hold you to that coffee"
- `LT-martin-45-J3-1` Corrections hit his fossilised errors, with short reasons — Stops on 'we was' and 'am... since 2015'; held 'more better' and 'the 8th' shown in recap
- `LT-oksana-34-J3-5` Mixed-language word handled respectfully and correctly — 'dispatch assistant' and 'dispatch team', with no placement penalty
- `LT-ondrej-16-J3-1` One stop, other fixes held for recap — Only 'is more better' stopped the scene; two more fixes held and shown on recap
- `LT-petra-38-J3-4` Patient, short A2 partner and a gentle moment — Mira's lines are simple; the moment lets Petra retry without being tested
- `LT-petra-38-J4-6` Recap keeps the progress picture honest — '6 on your own · 1 with help', with the helped turn marked supported.
- `LT-petra-38-J4-7` Clerk is patient and at A2 — 'Please read me the number. Take your time.' All nine partner turns are at A2.
- `LT-tomas-9-J3-4` Sam talks in tiny, patient, Minecraft sentences — Every turn is one short question with an echo of his word ('Dirt walls, nice!')
- `LT-tomas-9-J3-6` Czech 'Já nevím' is met with a kind, correct word — 'I don't know' with a plain gloss, then back to the scene
- `LT-viktor-67-J3-1` Mia speaks in very short, known-word questions — Seven partner turns, each one short question on weather, flowers, school.
- `LT-viktor-67-J3-2` The one stop teaches a family phrase, and the other fixes are held for the recap — Stop on "I have grandson, granddaughter"; he repeated it correctly; "school good" and "I am in garden" held and listed on the recap.
- `LT-viktor-67-J4-6` Help is in the scene and the note quotes him exactly — "Help me answer" and "Choose a phrase" sit beside Leo's line. The cue is a garden sentence he could use. The coaching quotes his words.
- `LT-adela-17-J4-5` Direct correctness questions answered accurately in scene — 'Yes, 'I am interested in politics' is correct, and 'interested in' is the right phrase.' The tutor's own English is clean.
- `LT-tomas-9-J4-6` Czech translated kindly into English word — 'You wanted to say Je velký. In English: big' warm and correct.
- `LT-tomas-9-J4-7` Help available in scene and simplified question — 'Said more simply: How old is your dog?' / 'Does he like rain?'

## Voices

**Adéla · J3** (time saved: 30 min · low)

> The topic was right for me, a real debate, and Sam's questions were not babyish. The article correction was exactly what I'd want, short and with a reason. But then I asked directly whether "interested about only chatting" was correct. The answer was "when you are only chatting", which throws away "interested". It never says "interested in", and the explanation, "so the reason is unclear", isn't a rule. A notebook entry like that would be wrong. "Eventually" was never mentioned, though I use it wrongly all the time. "Your friend story is lovely" is the sort of fluff I hate. I'd use it again for the speaking practice, but I'd re-check every correction myself. That eats a lot of the time I'd save over my tutor. I wouldn't recommend it until the corrections are exam-accurate.

**Adéla · J4** (time saved: -10 min · low)

> Honestly, not yet. When I froze, the help was there on screen, but the first two presses just made the question simpler, like a quiz for kids. Only the third gave me a starter, 'I would like to study…'. After that I managed fine alone. But the questions wandered to social media, one even repeated what I'd just answered, and the replies were mostly 'Yes, that's correct' with no examiner detail. I asked whether 'interested in' was right and it answered correctly, which I liked. The recap says three answers with help, but I only used help twice, so I don't trust the progress numbers. I never got a coaching note quoting my words or a chance to replay a moment. For B2 First prep, I'd still use my tutor.

**Jana · J3** (time saved: 5 min · low)

> Priya sounds properly Dublin, and "just your appetite?" made me smile. But it was over in three replies and I was never stretched. Once I'd declined, it was just Wednesday, half twelve, which café. No banter to read, no push-back, nothing I didn't already know. The recap gave me "I can't tonight, next time for sure?", which is what I'd say to a stranger, and my own line was better. It also said I used help once, and I never touched Help. That makes me doubt its other numbers. No corrections came, which is fair because I made no slips, but I got no new idiom or register choice either. For 15 minutes whenever, I'd try the disagreeing-with-a-senior scene. This one wouldn't replace Preply for me yet.

**Martin · J3** (time saved: 10 min · low)

> Okay, this was meeting-shaped, finally: a supplier, a delivery date, no baby topics. Mara talked like a real sales manager, not slowly. It caught "we was" and the "since 2015" thing, and when I asked "why is that wrong?" the answer was one line and correct. I liked the recap with the "more better" fix. What I did not like: it stopped me twice in four replies, and I had to repeat myself like at school. It never told me why I am B1. Just "B1 · Getting by · self-chosen". For a man who says C1, that is arbitrary, so I would not accept it. It also missed "customer don't". Useful for the fixes, weak on proof. I would use it again, but I would not tell my director yet.

**Oksana · J3** (time saved: 25 min · low)

> Mostly useful. It started with my experience, in a hiring-manager setting, and the questions about calling the driver first felt like logistics. It took dispečink as a normal word gap and never treated me as Czech, which I liked. "Dispatch assistant" and "current" were right. But the interviewer called me "Priya", which is her own name, and I wrote "Hello Priya" myself. In a real interview that would be funny. It never touched "responsible about" or "I work for three years", which are exactly what I get wrong. "Mission done" showed up while she was still asking, and she repeated the weekly-trucks question. The recap gave me no phrases for Friday. I'd use it again for rehearsal, but I don't fully trust the corrections yet.

**Ondřej · J3** (time saved: 2 min · low)

> Ok, it was actually less annoying than school. Sam talked like a real teammate, not like a textbook, and he argued back, which I liked. One correction, "more better", fair, I fixed it and got back to the game in one click. No lecture. The other mistakes waited for the end, good, because I hate being stopped every sentence. But it was over after three replies and the recap's mission line, "choose a fresh context", is just filler. Sam also kept saying "right?" about Turbo Rift like a bot. Do I trust the level? B1 feels right. Would I use it again? Only if my parents push me, maybe ten minutes. Would I tell a friend? Maybe, if the games topic stays.

**Petra · J3** (time saved: 10 min · low)

> Sorry, it was gentle with me and I liked that. Mira spoke slowly and simply, and when I made a mistake it did not make me feel stupid. I said it again and carried on, and that was fine. But it finished after only three answers. I wanted to say yes to seven o'clock and it said "mission done". That is too short to really practise. Also I was the guest, asking for a room. At work I am the one who gives the room! I need phrases for the desk tomorrow, like what to say to an angry guest. It only fixed one thing, though I made the same mistake twice. Nothing worried me as a mother. I would try it again for fifteen minutes, but it has to be longer and work-shaped. Maybe I tell Klára.

**Petra · J4** (time saved: 60 min · low)

> Sorry, my English is not good, but I try. The clerk Tom was patient, "Take your time", and that I liked. A booking problem is exactly my work, so I would use it again after the kids sleep. But the help button gave me the same sentence again and again, "I have a booking for two nights", even when he asked my name and my number. That did not help me. The coach talked about my first answer, not about where I was stuck. When I tried again, the question was almost the same, and I still said "I don't know". "I'm looking" is a good phrase and I can use it at the desk. But many of my mistakes, like "other name", nobody corrected. I trust the recap, it says honestly one answer with help. Nothing worried me as a mother. Useful, but the help must fit the question. I would tell a colleague maybe.

**Tomáš · J3** (time saved: 45 min · low)

> Jo, Minecraft! Sam asked short questions and I knew the words: green, dirt, dog. I liked that he said "nice!" every time, and it did not feel like school. When I said "nevím" it just told me "I don't know" and I went back to the house. Good. But I only said little bits like "Door brown", and nobody showed me the whole sentence. At the end it said something boring about a "fresh context", and the same Já nevím was there twice. Mum would see the list with a booking and a lost jacket. That's not for me. It was quick, about ten turns, and I was a bit tired at the end. I would play again for the dog topic. It's better than the club, where I talk two minutes. Wish the end said what I built.

**Tomáš · J4** (time saved: 30 min · low)

> Pes, to jsem chtěl! The questions were short and I liked saying my dog is big. When I wrote Czech, it told me "big" and did not make me feel bad, super. But the help said the same "My dog is… He likes to…" every time, so it did not really help me. When it fixed "likes", I tried, and then it just asked something new about sleeping at night and said mission done. I did not get to try again. The "add s" talk is school stuff, I do not get it. Short list of games would be better than that long list with booking and jacket. I would use it for the dog bit, but Mum would see it says I did some alone when I used Czech. Fair? Nevím.

**Viktor · J3** (time saved: 60 min · medium)

> Dobře, I would use this again on Saturday. Mia asks short things: sunny, flowers, cold, school. I understand all of it and I can answer with my few words. I was not rushed, and when I said "I have grandson" it showed me "a grandson" and let me say it again, no sighing. That is exactly what I need for Sunday. I like that the other small mistakes waited for the end. What I miss: it said "Mission done" when Mia still asked a question, so I stopped early. I would like more time for the garden and for saying I miss them. I trust the level, no English jargon, only my family words. I would tell my friend from the library, and I save the tram.

**Viktor · J4** (time saved: 30 min · low)

> Víte, the garden talk with Leo is what I need for Sunday, and the help was easy to find. I pressed it and got "I have red flowers in my garden", a sentence I can really say. I liked that nobody rushed me, and that the correction quoted my own words, "Tree is green". But when I pressed the help again, it said the same thing, even when Leo asked something new. The phrase quiz asked about weather when Leo had asked what I did today, which confused me. When I fixed "The tree is green" I only copied it, and then I was told to carry on. I wanted Leo to ask something new so I could try alone. Trusting it fully, I do not yet. I would try it again on Saturday, but I would not yet tell my friends from the library.
