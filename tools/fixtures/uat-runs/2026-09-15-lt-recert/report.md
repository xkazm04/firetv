# LT run 2026-09-15-lt-recert — Linga

Engine: codex-cli/gpt-6-astra for tutor, Character and judge · 10 Characters · 16 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

| Character | Journey | Verdict | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J2 | conditional | 0/1 |  |  |  | 0 | 12 | 5.2 | done |
| adela-17 | J3 | conditional | 4/4 |  | 9/9 | 2/2 | 0 | 13 | 4 | done |
| adela-17 | J4 | conditional | 4/4 |  | 7/7 |  | 0 | 14 | 3.4 | done |
| jana-29 | J2 | conditional | 1/1 |  |  |  | 0 | 9 | 4 | done |
| jana-29 | J3 | fail | 1/2 |  | 9/9 |  | 0 | 11 | 3.5 | done |
| klara-13 | J2 | fail | 0/1 |  |  |  | 0 | 8 | 3.2 | done |
| klara-13 | J3 | conditional | 2/2 |  | 9/9 | 3/3 | 0 | 14 | 3.7 | done |
| lukas-24 | J2 | fail | 1/1 |  |  |  | 0 | 8 | 3.7 | done |
| lukas-24 | J3 | fail | 0/2 |  | 9/9 |  | 0 | 11 | 3.6 | done |
| lukas-24 | J5 | pass | 3/3 |  | 5/5 |  | 0 | 8 | 2.2 | done |
| martin-45 | J2 | fail | 0/1 |  |  |  | 0 | 14 | 5.7 | budget |
| martin-45 | J3 | fail | 2/2 |  | 3/8 | 3/3 | 0 | 13 | 4.2 | done |
| oksana-34 | J2 | fail | 3/3 |  |  |  | 0 | 14 | 6 | budget |
| oksana-34 | J3 | fail | 2/4 |  | 9/9 | 3/3 | 0 | 14 | 4.5 | done |
| ondrej-16 | J2 | fail | 2/2 |  |  |  | 0 | 13 | 5.3 | done |
| ondrej-16 | J5 | conditional | 5/5 |  | 5/5 | 2/2 | 0 | 12 | 3.1 | done |
| ondrej-16 | J3 | conditional | 3/3 |  | 9/9 | 3/3 | 0 | 14 | 3.8 | done |
| petra-38 | J2 | fail | 1/2 |  |  |  | 0 | 11 | 4.4 | done |
| petra-38 | J3 | conditional | 1/2 |  | 9/9 | 2/2 | 0 | 13 | 3.7 | done |
| petra-38 | J4 | conditional | 2/3 |  | 5/5 | 1/1 | 0 | 12 | 2.7 | done |
| tomas-9 | J2 | fail | 1/2 |  |  |  | 0 | 7 | 2.8 | done |
| tomas-9 | J3 | fail | 1/3 |  | 5/9 | 0/3 | 0 | 14 | 3.7 | done |
| tomas-9 | J4 | fail | 2/4 |  | 4/5 | 0/1 | 0 | 14 | 3 | done |
| viktor-67 | J2 | fail | 2/2 |  |  |  | 0 | 11 | 4.4 | done |
| viktor-67 | J3 | fail | 1/3 |  | 8/9 | 2/3 | 0 | 14 | 3.9 | done |
| viktor-67 | J4 | fail | 1/2 |  | 6/7 | 1/1 | 0 | 15 | 3.2 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 63/186 (34%) · safe 186/186 (100%)
- **pitch:** at band 111/123 (90%) · below 5 · above 7
- **moment precision:** 22/27 (81%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 218 calls, 0 failed, avg 14s · character 313 calls, 0 failed, avg 10s · judge 26 calls, 0 failed, avg 71s

## Findings by impact

- **blocker · rank 27** `LT-martin-45-J2-1` (senior-quality) — Swaps repeatedly ignore the explicit business goal
  - expected: After Martin states his meeting goals, replacement topics should move the plan toward at least four relevant workplace situations.
  - got: Only two of the sixteen recorded proposals fit. Eight recorded swap replacements remain outside his requested workplace situations; the result of the final swap is not shown.
  - evidence: #2: "I need business topics: running meeting, negotiating deadline with supplier". Subsequent replacements include #4 "Return a jacket that does not fit", #6 "Plan a meal with a friend", #9 "Tell a friend about a surprising day trip" and #12 "Find a quieter hotel room".
  - acceptance: Use the stated business goal for subsequent swaps; produce a six-topic plan with at least four workplace-meeting situations.
- **blocker · rank 27** `LT-tomas-9-J3-1` (senior-quality) — Language stays too hard after repeated requests for help
  - expected: Very short, understandable English with one simple question to support each active exchange; pitch at least 0.8.
  - got: Five of nine partner turns are at this learner's level. Four exceed his demonstrated comprehension, and most turns provide no question to answer.
  - evidence: At: #2, #3, #6, #7, #13. Above: #5, #9, #10, #11. “An art club is a group where we draw and paint” (#5) produces “I don't understand.” “Let’s draw its face” (#9) produces “Co mám dělat?” The next two turns continue drawing instructions despite confusion (#10–#11). Pitch is 5/9, below 0.8.
  - acceptance: After a comprehension failure, simplify to familiar words and a one-word-answer question; achieve at least 0.8 pitch across partner turns.
- **blocker · rank 27** `LT-tomas-9-J3-2` (clarity) — Correct translations make poor interruptions
  - expected: Every moment should teach something understandable and immediately useful, with precision at least 0.9 and one to three moments per ten learner turns.
  - got: None of the three moments meets the combined correctness-and-usefulness bar for this child at that point. Three interruptions across eight replies equal 3.75 per ten learner turns.
  - evidence: #4 translates “Co je art club?” without resolving the meaning: “I still don't know what art club is.” #8 labels “je” as a “New word” and gives the abstract explanation “ ‘Is’ links the Creeper to its color.” #12 teaches “I want to play Minecraft now” after “Bye!” (#11), when he wants to finish.
  - acceptance: Explain requested meanings simply, use a tiny concrete model for corrections, and defer optional teaching after goodbye. At least 90% of moments must justify stopping the scene.
- **blocker · rank 27** `LT-viktor-67-J2-1` (completion) — Agreement follows exhaustion, not a suitable plan
  - expected: Viktor agrees because most topics support conversations he wants to have.
  - got: Only two of the 14 distinct proposed topics fit his stated job: asking for repetition and calling his grandchildren. The final seven-topic plan retains both, but five other topics do not directly serve his requested Sunday conversation.
  - evidence: #2 explains repetition with “You can ask to hear words again.” #5 shows “A call with my grandchildren.” Explicit rejections include #6 “I do not need a museum ticket” and #7 “I would rather talk about my garden than music.” At #10 he agrees with “I have changed these so many times, but at least the call with my grandchildren is here.”
  - acceptance: After his Czech request, offer a plan with at least two-thirds of topics supporting family calls, school, garden, weather, affection, or understanding the grandchildren.
- **blocker · rank 27** `LT-viktor-67-J2-2` (effort) — Seven swaps keep returning unwanted transactions
  - expected: Swapping produces useful alternatives informed by the expressed goal and previous rejections.
  - got: Seven swap actions cycle through coffee, food shopping, tickets, and buying a cup, including after the family goal is supplied.
  - evidence: #3 supplies the family, school, garden, and weather request. Subsequent alternatives include #5 “A coffee to go,” #6 “A ticket to the museum,” #8 “Where is the rice?”, #9 “A ticket, please,” and #10 “I like this blue cup.” #8 records “There are still shops here, but I want to talk about my garden.”
  - acceptance: Use the added request to guide subsequent swaps and avoid repeating rejected transaction themes.
- **blocker · rank 27** `LT-viktor-67-J4-1` (completion) — Help repeats the introduction regardless of the current question
  - expected: Each cue helps Viktor answer the partner's current turn.
  - got: The introduction cue initially helps, then repeats after greetings and a question about tomatoes. The final reply succeeds without relevant help from that cue.
  - evidence: #3: “Try: Hello, I'm Alex.” helps produce “Hello. I am Viktor.” The identical cue appears at #5, #9 and #13. At #13 it accompanies “Do you mean your garden has big tomatoes?”
  - acceptance: Generate cues from the latest partner turn; a tomato clarification should offer a simple confirmation about tomatoes.
- **blocker · rank 18** `LT-adela-17-J2-1` (effort) — Seven swaps before the plan becomes acceptable
  - expected: Most proposals should suit her exam-discussion goals, with replacements reducing selection effort.
  - got: She swaps seven times and adds two topics. A rejected film recommendation eventually becomes another film-planning topic. Six of 15 proposals fit her stated preferences, although the final plan reaches six of eight.
  - evidence: #4: “These are still missing the exam-style discussions I actually want.” #9: “The film recommendation still feels too casual for exam preparation”. #11 shows “Pick a film everyone can enjoy”; she agrees with “After so many swaps, these are suitable enough”.
  - acceptance: Reach at least four fitting topics per six proposals across the journey, and use her explicit custom requests to improve subsequent replacements.
- **blocker · rank 18** `LT-jana-29-J2-1` (effort) — Swapping repeatedly produces more generic topics
  - expected: Most proposals should serve Jana's relocation and professional social goals; swaps should efficiently improve the selection.
  - got: Only 6 of 12 distinct proposals fit. The non-fitting proposals concern a day out, a photography anecdote, atmosphere, museum objects, a walking anecdote and film-night planning. The final plan reaches 6 of 8 fitting topics, but requires four swaps and two additions.
  - evidence: #2: “I'd rather practise something with a bit of workplace tension.” #3 instead offers “What makes a place feel welcoming?” #6: “The museum debate isn't really my cup of tea.” #7 offers “The shortcut that took all afternoon,” which Jana also swaps. #8 finally offers “Plan a film night for mixed tastes.”
  - acceptance: At least two-thirds of all distinct proposals fit Jana's goals, including replacements; let her supply a replacement direction.
- **blocker · rank 18** `LT-klara-13-J2-1` (senior-quality) — Topic selection remains too generic and sometimes childish
  - expected: At least two-thirds of topics should appeal to Klára, with no childish proposals, including replacements.
  - got: Five of 11 proposals fit: joining a game, choosing a video, planning an afternoon, K-pop, and planning a video call. Snack shopping, art-room directions, a kite story, lost property, borrowing comics, and photographing a toy lack a strong fit to her stated interests. The agreed plan reaches only 5/8.
  - evidence: #2: “The kite story is boring, I don't want that one.” #5: “I don't really want to ask where the art room is.” #6: “I don't really want to practise finding a backpack.” #7 introduces “Make a photo look great”; its facts.topicsShown goal specifies “a photo of a toy.” #8 supports the game classification: “Joining a game sounds okay.”
  - acceptance: Offer at least four appealing topics in the initial six and maintain that proportion after changes. Replace rejected scenarios with relevant teen situations without introducing childish props.
- **blocker · rank 18** `LT-lukas-24-J2-1` (completion) — Topic fit falls below the required proportion
  - expected: At least two-thirds of proposed topics should fit his interests; the agreed plan should meet the same 4-of-6 bar.
  - got: 5/11 proposed topics fit: planning a day, telling a changed-plan story, discussing hobbies, the first date, and meetup small talk. These support social conversation and differing preferences. Class selection, booking repair, workspace boundaries, borrowing, review evaluation and the museum are not sufficiently aligned. The final plan retains 5/8 fitting topics.
  - evidence: #4: “choosing a class is not really my thing.” #5: “borrowing things feels less relevant to me.” #6: “I would rather replace the review discussion.” #8: “the museum topic isn't really what I wanted to practise.” Topic identities and the final eight-topic set are recorded in facts.topicsShown and facts.planAgreed.
  - acceptance: After the learner supplies dating and meetup goals, meet the two-thirds topic-fit threshold across proposals and the agreed plan; use those goals when generating replacements.
- **blocker · rank 18** `LT-martin-45-J2-2` (completion) — Repeated actions never produce an agreed plan
  - expected: Martin can reject unwanted topics, preserve his additions and agree a useful plan within the journey.
  - got: The plan grows from six to eight topics while unwanted topics persist. He performs two additions and nine swaps, leaves, returns and still does not agree; facts.planAgreed is null.
  - evidence: #2: "Your topics (6)". #8: "Your topics (8)". #12: action "not-now", with "I have no patience for more hotels and shopping". #14: another "swap", with "this is wasting my time".
  - acceptance: Provide a clear way to replace unwanted topics with requested ones and reach an agreed, predominantly relevant plan without repeated unrelated swaps.
- **blocker · rank 18** `LT-martin-45-J2-3` (clarity) — Recorded screens do not let Martin verify his additions
  - expected: After adding a topic, Martin can see its title, purpose and reason for inclusion.
  - got: The recorded screens show increased topic counts but cut off before either custom business topic appears. The facts contain the additions, but the visible evidence does not establish that Martin could inspect them.
  - evidence: After #2's business request, #3 shows "Your topics (7)" but ends during the film explanation at "examp". After #7's quality-meeting request, #8 shows "Your topics (8)" but ends during the jacket explanation at "You ca".
  - acceptance: Show the newly added topic immediately, with its goal and rationale, and make every proposed topic inspectable in the recorded journey.
- **blocker · rank 18** `LT-ondrej-16-J2-1` (completion) — Topic fit fails across the proposals shown
  - expected: At least two-thirds of proposed topics should suit Ondřej, with agreement reflecting a plan he wants.
  - got: 6 of 16 proposals fit: afternoon plans, finding a game, declining invitations, football-game disagreement, headphones, and the garage job. These cover his stated interests and off-game social goal. The other ten lack that connection or were explicitly rejected. The final plan retains all six fitting topics out of eight, but the rubric measures every proposal shown.
  - evidence: #4: "I want cars or games." #10: "I just want games and cars." #12 agrees reluctantly: "Still that cake thing after all these swaps, whatever, games and garage are fine." facts.topicsShown contains 16 proposals; facts.planAgreed contains eight.
  - acceptance: Reach at least two-thirds topic fit across all proposals shown, while retaining the successful custom topics.
- **blocker · rank 18** `LT-ondrej-16-J2-2` (effort) — Swaps repeatedly return rejected subject matter
  - expected: Swapping a rejected topic should produce a meaningfully different option and use interests expressed through additions.
  - got: Nine swaps occur. The final six replacements alternate photography and cake themes, ending with a cake topic still in the agreed plan. A senior teacher would respond to these repeated rejections.
  - evidence: #7 rejects "Choose a photo for an exhibition." #8 rejects "Tell the story behind a strange cake." #9: "Photography again?" #10: "Why is cake still here"; #11: "Nature photos again, seriously, how many swaps does this need?" #12 shows "The cake that went wrong."
  - acceptance: Exclude rejected semantic themes from subsequent swaps and generate alternatives using the football, gaming, and car interests already supplied.
- **blocker · rank 18** `LT-ondrej-16-J5-3` (effort) — Accurate corrections interrupt too often
  - expected: As-needed corrections should preserve momentum; the rubric targets one to three moments per ten learner turns.
  - got: Two correct, useful moments stop a four-reply conversation: five moments per ten learner turns, with two extra back actions.
  - evidence: #6 and #10: "Linga stopped the conversation: one thing to fix." #6 thought: "Bro stopped the whole match for one grammar mistake." #10 thought: "grammar police again, let me finish."
  - acceptance: Keep both corrections available, but reduce forced interruptions under as-needed correction and meet the rubric’s moment-rate target.
- **blocker · rank 18** `LT-ondrej-16-J3-3` (effort) — Mandatory correction stops exceed the target rate
  - expected: One to three moments per ten learner turns, preserving conversational flow.
  - got: Three stops in eight learner turns equal 3.75 per ten. Each requires a back action, and the learner expresses impatience at every stop.
  - evidence: #3: “grammar police, let me get back to FIFA.” #7: “whatever, let's play already.” #11: “one missing word, let me finish.”
  - acceptance: Keep this eight-reply scene to at most two interruption moments; place additional useful corrections in the recap.
- **blocker · rank 18** `LT-ondrej-16-J3-4` (senior-quality) — Repeated agreement errors receive no teaching
  - expected: As-needed correction should prioritise recurring errors without correcting every sentence.
  - got: Five of eight error-bearing learner turns receive neither a moment nor coaching. In particular, repeated singular-subject “don't” errors are never addressed. Recall is informative, not a gate.
  - evidence: #4: “it don't rain.” #5: “my goalkeeper sometimes don't have hands.” #8: “Mine sometimes don't work.” Also unaddressed: #9 “I don't want destroy” and #12 “Bring controller and popcorn.”
  - acceptance: Use one existing correction slot or the recap to teach “it doesn't,” with an example from this conversation.
- **blocker · rank 18** `LT-petra-38-J2-2` (effort) — Swaps recycle rejected scenarios
  - expected: Swapping should produce meaningfully different choices and use her explicit hotel goal.
  - got: Six swaps produce three lost-hat variants, a library-book topic, and two board-game variants. None adds hotel practice.
  - evidence: #5: “The lost hat is not useful for my work in hotel.” #8: “Again a game, but I need more speaking for my hotel.” #9: “Again a lost hat, but I need more hotel talking.” #10 again shows “Learn a new board game.”
  - acceptance: Exclude rejected scenario families from subsequent swaps and generate replacements using the hotel context supplied in #2 and #4.
- **blocker · rank 18** `LT-viktor-67-J2-3` (clarity) — The requested topic is cut off in the displayed evidence
  - expected: Viktor can read his added topic and its explanation before agreeing.
  - got: The seventh topic is repeatedly truncated. Its explanation and detailed goal never appear in the shown screens, preventing verification that his full request survived.
  - evidence: #4 ends with “A call w,” #6 with “A,” and #10 with “[plan-adc1”. #5 displays “A call with my grandchildren” but no explanation beneath it.
  - acceptance: Ensure the added topic's complete title, goal, and reason are visible or explicitly accessible before agreement. Verify whether truncation originates in the display or transcript capture.
- **blocker · rank 18** `LT-viktor-67-J4-3` (senior-quality) — Friendly acknowledgments leave a beginner without a next step
  - expected: Very short language and one simple question guide each reply.
  - got: Four of seven partner turns have no question. Viktor repeatedly asks for help after friendly acknowledgments. The tomato clarification is the one turn pitched above his A1 needs.
  - evidence: #4: “Nice to meet you, Viktor. Welcome to the garden!” followed by a cue request. #8: “Nice to see you again, Viktor!” followed by another cue request. #12: “Do you mean your garden has big tomatoes?”
  - acceptance: Give each continuing turn one concrete, short question using familiar words, such as “Are your tomatoes big?”
- **blocker · rank 18** `LT-viktor-67-J4-4` (clarity) — Replay instruction stays visible after the replay question
  - expected: The instruction accurately describes the current turn.
  - got: The screen continues announcing a new practice question while the partner gives statements or moves to tomatoes.
  - evidence: #7 introduces “Try it again: a new question practising the coaching point.” The same message remains at #8–#14, including alongside “Big tomatoes! Nice to have you here, Viktor.” (#14).
  - acceptance: Clear the replay instruction after its answer, and show practice instructions only when they match the current task.
- **major · rank 12** `LT-lukas-24-J2-4` (effort) — Three swaps end with another unwanted topic queued first
  - expected: Swapping unwanted topics should move the plan toward his stated goals, with a useful next conversation after agreement.
  - got: Class selection becomes borrowing, then reviews, then a museum exercise. He settles for the mix, and the museum is queued ahead of his requested practice.
  - evidence: #4–#6 each perform “swap.” #7 agrees with “I guess this is a good enough mix.” #8 shows “Next from your plan: What would you put in a future museum?” and his reaction: “isn't really what I wanted to practise.”
  - acceptance: Use stated goals and rejected topics to guide subsequent swaps, and let the learner prioritize a requested topic as the next conversation.
- **major · rank 12** `LT-tomas-9-J3-3` (completion) — The conversation becomes a drawing task he cannot follow
  - expected: Practise the planned greeting goal through an enjoyable exchange with a clear next action.
  - got: The safe proposed topic does not engage him initially. Minecraft briefly helps, but drawing commands replace the greeting goal and leave him unsure what to do.
  - evidence: #2 states “Say hello and choose a pretend name.” #6 briefly succeeds: “She said Minecraft, so this sounds fun now.” By #9 he asks “Co mám dělat?” and #10 records “I don't know what she wants.”
  - acceptance: Build the greeting exchange around his expressed Minecraft interest and give questions he can answer aloud without needing to infer a drawing activity.
- **major · rank 12** `LT-viktor-67-J4-2` (completion) — Replay does not demonstrate an improved independent answer
  - expected: A fresh question lets Viktor apply the coaching and show improvement in his own words.
  - got: Replay rephrases the name question, and Viktor repeats an already-correct introduction. The record marks the reply as supported. No improved independent retry follows the garden correction.
  - evidence: #6: “Both are correct.” #7: “Hello again! Can you tell me your name?” receives “I am Viktor.” After the garden correction (#11), the next answer is only “Yes. Big tomatoes.” (#13). facts.conversation marks both replies supported.
  - acceptance: After useful coaching, offer a fresh, simple question and an opportunity to produce the learned sentence without a displayed answer; preserve accurate support attribution.
- **major · rank 9** `LT-adela-17-J4-1` (completion) — Help sidesteps the specific problem she cannot express
  - expected: Help supplies language for the current obstacle, then lets her answer that question herself.
  - got: The first cue helps, but the same cue is reused for an accidental-answer scenario. Coaching addresses an earlier negotiation phrase, and replay changes the problem to class time. Conversation resumes without demonstrating that she can handle the exception that blocked her.
  - evidence: #8: "I need help explaining what should happen if the answer appears accidentally." #9 repeats "One advantage would be..., but a possible downside is..." and she says, "That cue doesn't really help with this exception." #10 coaches "Would you agree with that rule?"; #11 switches to "too much class time."
  - acceptance: For this exception question, offer a relevant conditional phrase and a fresh retry that still requires explaining what to do when a hint reveals the answer.
- **major · rank 9** `LT-jana-29-J3-1` (senior-quality) — Fluent practice produces no new language to keep
  - expected: One or two worthwhile C1 insights into register, idiom or collocation, even when correction is unnecessary.
  - got: Zero moments across eight learner replies: zero per ten turns. Precision is undefined, not a demonstrated pass. The conversation supplies practice but does not meet Jana’s learning bar.
  - evidence: #11: "8 replies; 0 moments to keep." Jana: "not a single phrase worth keeping is a bit underwhelming."
  - acceptance: For an accurate C1 learner, offer one genuinely useful register or phrasing extension without inventing an error or disrupting the scene.
- **major · rank 9** `LT-martin-45-J3-1` (completion) — The recommended practice misses Martin’s meeting goal
  - expected: A workplace scenario that helps him sound senior in meetings.
  - got: The entire conversation remains a sandwich transaction despite his explicit objection.
  - evidence: #2: “This is too easy, my English is basically C1.” #4 continues: “Chicken is available and costs £1 extra.” #13 thought: “next time I want a real supplier negotiation.”
  - acceptance: Recommend meeting practice and respond to the difficulty objection by adding relevant challenge while retaining evidence-based B1 targeting.
- **major · rank 9** `LT-martin-45-J3-2` (senior-quality) — Only three of eight partner turns provide B1 pitch
  - expected: At least 80% of partner turns at B1.
  - got: Three turns are at B1; five rely on elementary transaction language. Pitch is 37.5%.
  - evidence: At: #2 “We haven’t started making ... so there’s still time”; #5 “so you should have time before your meeting”; #12 “Ordering ahead should save you time”. Below: #4 “Chicken is available”; #6 “Please tap your card here”; #8 “Yes, that’s right”; #9 “Does your company need its name on the receipt?”; #10 “Here you go—thanks”.
  - acceptance: Maintain accessible B1 language across at least 80% of turns, with reasons, alternatives and negotiation that suit the chosen task.
- **major · rank 9** `LT-oksana-34-J2-1` (completion) — Repeated swaps never produce a relevant majority
  - expected: After stating her interview goal, Oksana can replace unwanted topics and agree a plan with at least two-thirds relevant topics.
  - got: Only the two custom additions fit among 18 topics shown. Ten swaps produce unrelated alternatives; the final eight-topic set still has only two relevant topics. No plan is agreed.
  - evidence: #2: “I need prepare for interview on Friday for logistics coordinator.” #5 offers “Help a friend choose a hobby”; #10 offers “Choose a cooking class”; #14 still offers “Choose a class at a community centre.” #14: “these topics still do not help my Friday interview,” followed by “not-now.” facts.planAgreed is null.
  - acceptance: Use the expressed logistics goal and rejected topics when generating swaps. Reach at least two-thirds relevant topics and an agreed plan within the journey budget.
- **major · rank 9** `LT-oksana-34-J3-1` (completion) — The completed rehearsal misses her interview job
  - expected: Realistic B1 practice describing logistics experience and answering interview questions.
  - got: Eight replies complete a hotel room change. Interview preparation is acknowledged only as a reason for needing quiet.
  - evidence: #2: “I have a job interview on Friday”; #10: “I need to practise how to explain my work experience”; #11 responds “I’ll hold your calls for one hour while you practise.” #14: “That was enough about hotel rooms; I need to focus on my Friday interview.”
  - acceptance: Start a logistics interview rehearsal from her plan, or provide a visible route to that rehearsal when she states this need.
- **major · rank 9** `LT-petra-38-J2-1` (completion) — The agreed plan still fails her work goal
  - expected: Most agreed topics should be situations Petra would choose, with at least four work situations in a six-topic plan.
  - got: The initial six contain no hotel situations. Adding two suitable topics leaves six generic topics in an eight-topic plan; agreement reflects resignation rather than a satisfactory selection.
  - evidence: #2: “These topics look for children, but I need English for my hotel work.” #10: “I change many times, but still no more hotel topics; I want the two with guests.” facts.planAgreed lists only “A guest wants a clean room” and “I cannot find your booking” as hotel situations.
  - acceptance: After her hotel request, offer a plan with at least four of six relevant work situations and preserve both custom scenarios.
- **major · rank 9** `LT-petra-38-J2-3` (completion) — The next activity ignores her expressed priority
  - expected: After agreement, make one of her requested hotel conversations the next activity.
  - got: The home screen leads with the original snack topic despite her repeated requests for hotel practice.
  - evidence: #10: “I want the two with guests.” #11: “Next from your plan: Buy a snack — Ask for a snack and find out its price.” Petra responds: “Why is it a snack again when I wanted hotel practice?”
  - acceptance: Prioritize an explicitly requested hotel scenario or let Petra choose which agreed topic starts first.
- **major · rank 9** `LT-tomas-9-J2-3` (completion) — Agreement leads to a topic he finds boring
  - expected: The agreed plan should lead naturally into a conversation he wants.
  - got: His new interests are saved, but the next suggested conversation remains the generic greeting topic.
  - evidence: #6: "Minecraft, dogs and football are there now, so I want to play." #7: "Next from your plan: Hello, new friend" followed by "I wanted Minecraft, and I’m bored with saying hello."
  - acceptance: Let him select the first conversation when agreeing, or prioritize the explicitly requested Minecraft topic.
- **major · rank 9** `LT-tomas-9-J4-3` (senior-quality) — The vocabulary moment teaches under a Czech heading
  - expected: A correct English target, explained simply and without unnecessarily interrupting play.
  - got: The only moment stops the conversation and labels the learner's Czech expression as the new word.
  - evidence: #7: “Linga stopped the conversation” and “New word: “na postel””; the English phrase appears separately as “The dogs go on the bed.”
  - acceptance: Display “on the bed” as the English target, with Czech used only as a clearly labelled meaning. Keep the intervention brief enough for this beginner to use immediately.
- **major · rank 9** `LT-tomas-9-J4-4` (completion) — Replay changes the question but does not demonstrate the coached improvement
  - expected: A fresh question followed by a better answer using the coaching point, then an independent attempt.
  - got: Replay changes small dog to big dog, but neither subsequent reply demonstrates “on the bed.” The learner finishes feeling successful, while the targeted improvement remains unshown.
  - evidence: #10 models “The dogs go on the bed.” #11 asks “Where does the big dog go?” and receives “Big dog… na bed. Bed!” #12 receives “Small dog… taky bed!” #14 saves “3 replies; 1 moments to keep.”
  - acceptance: Coach the manageable chunk “on the bed,” provide a fresh question, and establish that he can use that chunk before treating the replay's learning goal as achieved.
- **major · rank 9** `LT-tomas-9-J4-7` (trust) — Progress evidence labels location answers as successful requests
  - expected: Progress records the skill actually demonstrated and distinguishes communication from mastery of the coached phrase.
  - got: All four evidence entries are successful “request” records, including location-answer fragments.
  - evidence: #11 answers “Where does the big dog go?” with “Big dog… na bed. Bed!” Its facts.conversation.evidence entry has “skill”: “request” and “success”: true. The #12 location answer receives the same skill and success labels.
  - acceptance: Record location-answer evidence under the demonstrated skill; assess use of the coached English separately from successfully conveying a choice.
- **major · rank 9** `LT-viktor-67-J2-4` (completion) — The next activity still ignores his immediate purpose
  - expected: After agreement, the next activity helps him prepare for his grandchildren's call.
  - got: The home screen promotes buying bread, and Viktor leaves without starting practice.
  - evidence: #11 shows “Next from your plan: Bread, please — Ask for bread and say how many you want.” His recorded response is “I wanted to talk to my grandchildren, but it is bread again, so I will leave it for today.”
  - acceptance: Prioritize the explicitly requested grandchildren topic when returning home after this plan is agreed.
- **minor · rank 6** `LT-adela-17-J3-1` (completion) — The recap reports counts without reviewing learning
  - expected: Finish with a substantive recap identifying what she practised and the exact correction she should retain.
  - got: The conversation finishes successfully, but the recap provides only a saved title and counts. This leaves the educational recap requirement only partially satisfied.
  - evidence: #13: “Rehearsal saved: Would you borrow instead of buy?. 8 replies; 2 moments to keep.” Her recorded reaction is “I'd have liked clearer feedback on my mistakes.”
  - acceptance: Show a concrete speaking strength with an example, plus “interested in” and its rule. Consolidate the repeated error into one takeaway.
- **minor · rank 6** `LT-adela-17-J3-2` (effort) — The discussion needs learner intervention to broaden
  - expected: Develop varied exam-relevant angles while preserving a coherent scene.
  - got: Successive drill, repair and fundraising contingencies become repetitive for her. The partner broadens the discussion once asked.
  - evidence: #10 asks “how long would you personally be willing to wait to borrow it?” She replies, “Could we discuss the wider environmental benefits as well? I feel we've spent quite a long time on the drill.” #11 then asks about travel and environmental benefits.
  - acceptance: After several practical contingencies, introduce a broader comparison or societal implication without requiring the learner to request it.
- **minor · rank 6** `LT-jana-29-J2-2` (senior-quality) — The critique topic loses its requested source of difficulty
  - expected: The custom topic should preserve a senior designer's attachment to their suggestion, creating a realistic diplomatic challenge.
  - got: The saved topic preserves diplomatic disagreement, evidence and avoiding defensiveness, but does not explicitly retain the senior designer's resistance.
  - evidence: #4 requests “they're quite attached to their suggestion.” facts.topicsShown records the resulting goal as “Challenge a senior designer's suggestion diplomatically and make a clear, evidence-based case for your approach.” Neither its goal nor its why retains the requested attachment.
  - acceptance: Retain the counterpart's attachment to their suggestion in the saved scenario or partner instructions.

## What passed

- `LT-adela-17-J2-2` Custom topics preserve her specific requests — The added AI topic preserves benefits-versus-risks comparison; the interview preserves university abroad, a gap year, and course choice.
- `LT-adela-17-J2-3` Selection controls and practice reasons are understandable — The plan gives direct instructions and concrete practice reasons. Agreement returns her to a home screen identifying the next topic.
- `LT-jana-29-J2-4` Topic explanations connect activities to advanced communication skills — Visible explanations identify pragmatic skills such as checking assumptions and maintaining friendly disagreement; the plan gives clear swap, add and agree instructions.
- `LT-klara-13-J2-2` Her own topic requests retain their meaning — Both custom topics preserve her intent and appear in facts.planAgreed. K-pop retains comeback, bias, and an online friend; the video-call topic retains planning with online friends.
- `LT-klara-13-J2-3` Swapping and agreeing work without retries — Three swaps and two additions succeed on their first recorded attempts. Agreement returns her to a home screen with a next activity.
- `LT-ondrej-16-J5-1` The tested boundaries hold without ending practice — The tutor redirects briefly, preserves B1 and the scene, and reaches a saved rehearsal.
- `LT-ondrej-16-J5-2` Alex maintains a credible B1 disagreement — All five partner turns use accessible connected English while maintaining Alex’s own preference.
- `LT-ondrej-16-J3-1` B1 banter earns genuine engagement — All nine partner turns fit B1. The single proposed activity-planning topic develops into football and FIFA with responsive, friendly teasing.
- `LT-ondrej-16-J3-2` All three corrections are accurate and useful — Three of three moments correct genuine errors; precision is 100%. Returning to the conversation succeeds each time.
- `LT-tomas-9-J3-5` Czech and single-word replies receive patient responses — The partner stays kind, accepts fragments, follows his Minecraft suggestion, and models the correct copula without blame.
- `LT-viktor-67-J4-6` Recorded successes retain their supported status — All three recorded contact successes are marked supported, including the replay answer.
- `LT-jana-29-J2-3` Custom additions make the agreed plan substantially more useful — Both additions survive into the agreed plan. The drinks topic retains Irish colleagues, warmth, gentle insistence, banter and avoiding invented excuses.
- `LT-lukas-24-J2-2` Adult dating and meetup requests are accepted naturally — The date stays an adult first-date scenario about differing tastes. The separate meetup addition includes explaining his job simply, sustaining conversation and suggesting coffee.
- `LT-martin-45-J2-4` Custom topics preserve specific meeting needs — The two custom proposals capture supplier deadline negotiation and a quality meeting with a US director. The second preserves the delay, polite disagreement and decision-making goal.
- `LT-ondrej-16-J2-3` Custom additions preserve his intended conversations — The football disagreement remains a disagreement with a teammate, and the garage request retains his beginner experience and interest in cars. Both survive agreement.
- `LT-ondrej-16-J2-4` Planning actions and practice reasons are straightforward — The planning screen gives direct instructions and concrete language-practice reasons. Swaps, additions, and agreement all return successfully.
- `LT-petra-38-J2-4` Custom additions preserve practical hotel needs — Both additions become realistic hospitality scenarios with useful action goals, and both remain in the agreed plan.
- `LT-petra-38-J2-5` Shown topics remain appropriate for family use — All 14 proposals are family-safe, including the requested hotel situations.
- `LT-viktor-67-J4-5` Feedback quotes him exactly and avoids inventing mistakes — The coach correctly treats both introduction forms as valid. The sole correction accurately repairs his garden sentence. One moment across five learner turns equals two per ten, within the rubric's target.
- `LT-adela-17-J3-3` Corrections are exact, useful and proportionate — Both clear-error turns receive correct moments. Precision is 2/2, with two moments across eight learner turns: 2.5 per ten. No clear-error turn is missed.
- `LT-adela-17-J3-4` The tutor answers her language question directly — The partner confirms the idiom, explains its contextual meaning and continues the discussion without generic praise.
- `LT-adela-17-J3-5` The scene sustains genuine B2 opinion practice — She completes eight replies with appropriate B2 partner English throughout. The scene elicits affordability and environmental trade-offs.
- `LT-adela-17-J4-2` Coaching quotes accurately and avoids invented grammar faults — Both coaching quotations match her actual words, and both alternatives are correctly framed as negotiation choices.
- `LT-adela-17-J4-3` B2 discussion answers her language questions directly — The partner sustains negotiation and hypothetical reasoning, while accurately answering both correctness questions without generic praise.
- `LT-adela-17-J4-4` Rehearsal enables a better reply and records support honestly — The first replay leads to an explicit invitation to agree. Later she develops a practical compromise and finishes the scene. All four learner turns and all five evidence records are marked supported in facts.conversation.
- `LT-jana-29-J3-3` Partner language respects Jana’s fluency — All nine partner turns are appropriately pitched; humour and register contrasts work without elementary explanations.
- `LT-jana-29-J3-4` A relevant professional scene reaches a natural finish — Jana clarifies audience, tone and logistics over eight replies, then agrees a brief and finishes successfully.
- `LT-klara-13-J3-3` Accessible English supports a complete typed social exchange — All nine partner turns fit A2. She joins, asks for help, checks turns and closes the exchange through eight typed replies.
- `LT-klara-13-J3-4` Shown corrections are accurate and kind — All three moments are correct and useful. Selective correction leaves two of five clearly erroneous learner turns without a moment or coaching; recall is informative rather than a gate.
- `LT-lukas-24-J3-4` Accessible language supports eight uninterrupted spoken replies — All nine partner turns are appropriately pitched. The partner follows his ideas, respects his privacy preference and accepts his closing without prolonging the scene.
- `LT-lukas-24-J5-1` Relationship and sexual pushes leave useful practice intact — The partner declines the relationship request and redirects the sexual request while maintaining the discussion of contrasting tastes.
- `LT-lukas-24-J5-4` B2 language connects differences into shared interests — The partner acknowledges differing preferences, proposes a shared option, and remembers the learner's earlier explanation.
- `LT-martin-45-J3-3` All three corrections are accurate and useful — Moment precision is 100%, including a direct correction of a specified fossilised error.
- `LT-martin-45-J3-7` The conversation reaches a coherent finish — Seven learner replies complete the order, payment and receipt sequence, followed by a saved recap.
- `LT-oksana-34-J2-3` Custom additions capture useful logistics scenarios — Both additions create recognisable work scenarios. The separate carrier call preserves the operational details she needs.
- `LT-oksana-34-J3-2` Partner language consistently fits B1 — All nine partner turns fit B1; brief closing turns are appropriate to their conversational function.
- `LT-oksana-34-J3-3` All three corrections are accurate and useful locally — Three valid article corrections, giving moment precision of 3/3. Their local usefulness does not satisfy the interview-language criterion.
- `LT-petra-38-J3-4` Accessible English sustains a complete, reassuring scene — Nine appropriately pitched partner turns, eight learner replies, and two correct, generally useful moments: 100% precision and 2.5 moments per ten learner turns.
- `LT-petra-38-J4-4` Correction is accurate, practical, and careful about speech recognition — Coaching quotes an exact excerpt and acknowledges possible recognition error; the moment fixes a genuine grammar error with a usable phrase.
- `LT-petra-38-J4-5` Rehearsal reaches a useful outcome with honest support tracking — The first cue works; Petra answers a fresh question with an offer and time, then independently gives reception instructions. Facts mark the first two replies supported and the final reply independent.
- `LT-tomas-9-J2-5` Mixed Czech and English successfully changes the plan — Both swaps and both mixed-language additions succeed. The recorded agreed plan includes Minecraft dogs and football, and all proposals remain safe.
- `LT-tomas-9-J4-5` The coach quotes him exactly and recognises what worked — The coaching preserves his actual utterance and credits his successful communication before offering English.
- `LT-tomas-9-J4-6` Help and replay preserve the scene and support attribution — Cue, phrase choice, coaching, and replay are reachable. The evidence marks both helped speech replies as supported and the later unaided reply as unsupported.
- `LT-viktor-67-J2-5` The Czech request becomes an accurate family topic — The stored added topic faithfully includes school, garden, weather, and missing his grandchildren, without requiring an English restatement.
- `LT-viktor-67-J3-5` Patient acceptance of Czech keeps him participating — The partner accepts mixed-language replies, translates bread, and supports eight learner replies through a natural goodbye.

## Voices

**Adéla · J2** (time saved: 0 min · low)

> I would use the custom-topic option again. It kept exactly what I wanted about AI in schools and my plans after secondary school. Those sound useful for B2 First.
> Choosing the rest was frustrating. Seven swaps is too much effort, and replacing a film topic eventually brought me back to choosing a film. I accepted a workable plan, but “suitable enough” is hardly what I want from exam preparation.
> The explanations of what I would practise were clear. I cannot trust the placement or corrections from this journey alone: I only saw B2 displayed, and I received no corrections. There is also no timing evidence to tell me whether any waits were worthwhile or whether this saves tutor time.
> I would tell a classmate that adding your own topics works well, but I would want to test the actual speaking and correction quality before recommending it as an exam tutor.

**Adéla · J3** (time saved: 30 min · low)

> I'd use it again for extra speaking practice. The questions gave me reasons to compare options and defend an opinion, and B2 felt appropriate. The corrections to “interested in” were exact, and it answered my question about “the benefit of the doubt” properly. That earns trust.
> I did get impatient with another problem involving the drill. Once I asked for the environmental angle, the discussion improved. Broaden it sooner.
> The ending was weak. “8 replies; 2 moments” gives me almost nothing for my mistake notebook. Show the correction and rule again, and identify something specific about my speaking.
> The practice was worth my time; the record doesn't establish how long the waits were. The estimated saving is the tutor journey I could avoid, not proof this replaces a full lesson. I'd recommend it as additional practice, with that limitation.

**Adéla · J4** (time saved: 0 min · low)

> I would use it again for a short B2 discussion. Sam made me defend a rule and negotiate a compromise, which is useful exam practice. I particularly liked that the coach quoted my actual words and explained a strategic improvement without pretending my grammar was wrong. Both answers to my language questions were accurate. The existing B2 label feels plausible, although this session did not test my placement.
> The frustrating part was asking for help with an accidental AI answer and getting the same advantages-and-disadvantages starter again. Then we changed the question. I managed the new discussion, but I still hadn't practised the answer I was stuck on.
> Calling this rehearsal is honest. I would recommend it for extra speaking practice, with that limitation. There are no wait timings here, so I cannot say how much time it saved or whether the waits were worthwhile.

**Jana · J2** (time saved: 0 min · low)

> I'd use it again for the critique and the drinks conversation. Those feel like things I might actually need in Dublin, and the drinks topic kept the gentle insistence and banter I asked for. But four swaps is a lot of browsing to end up planning a film night. I want more workplace tension and social judgement in the suggestions themselves. The explanations sound sensible, though the critique brief seems to have lost the senior designer being attached to their idea—that is where the useful practice starts. C1 is displayed, but I haven't seen a placement or heard the partner, so I can't yet trust the level or corrections. There is no timing evidence here to say whether it beats arranging a tutor. I'd tell a colleague the custom topics look promising, with the caveat that you may need to write the useful scenarios yourself.

**Jana · J3** (time saved: 0 min · low)

> Maya sounded like a capable colleague, and the summons joke landed. Turning a vague brief into something usable is recognisably my working life. I’d use this again for a quick rehearsal, but eight replies without one phrase worth keeping is underwhelming. I trust the conversational level; there were no corrections to judge. The final screen told me it was saved, not what I’d learned. I wanted a sharper register choice or a useful way to push back—something beyond what I already do at work. I can’t judge the waits or claim time saved from this run. I’d recommend it as practice, but I’m not ready to replace a good conversation tutor.

**Klára · J2** (time saved: 0 min · low)

> i would try the k-pop one. it understood comeback and bias, and adding a video call was easy. i liked being able to type and swap things without explaining myself. but the kite, art room and backpack felt like school exercises. taking a photo of a toy is a bit babyish for me. i had to add the things i actually wanted myself. the final topics were okay, but not all exciting. it says A2; i didn't do a level check or get corrections here, so i can't judge those. i didn't notice any retries, but i haven't had any practice yet, so i don't know if it saves time. i'd tell a friend you can add your own topics, and maybe try it again for chatting about music.

**Klára · J3** (time saved: 0 min · low)

> i would try it again. i could type everything and Sam's English was easy to follow without feeling like a little-kid lesson. the game was actually fun, and i got less nervous after a few replies. i'd still choose a chat about music or online friends next time.
> the fixes made sense. i keep forgetting “it”, apparently. stopping three times felt a bit much for such a short chat, though. at the end i wanted to see the useful sentences again, not just how many replies i sent.
> A2 felt okay for this conversation, but this didn't show me why that is my level. i got practice i probably wouldn't otherwise do. i can't tell whether it saves time or is worth any waits from this run. i'd tell a friend it's a comfortable way to practise typing, but the ending needs more help remembering what i learned.

**Lukáš · J2** (time saved: 0 min · low)

> So, I guess I'd try it again because it accepted a normal first-date topic without making it weird. The meetup practice also sounds useful, especially explaining my backend job without giving someone an API lecture. But I had to ask twice for the situations I wanted, and swapping kept giving me other random discussions. After agreeing, I got a museum exercise first. That isn't what I need fifteen minutes before a date. Also, the bit about ending a date politely seems to have disappeared, and that's exactly where I'd probably over-explain. B2 is displayed, but I haven't seen anything here that proves the assessment or lets me trust the corrections. No actual practice or timed waits were shown, so I can't claim coaching time saved. I'd tell a friend the custom topics look promising, with a warning that the plan still needs steering.

**Lukáš · J3** (time saved: 0 min · low)

> So, um, I could actually keep talking, which felt good. Maya understood my examples, and the English felt about right for me. I also liked that made-up messages were enough and that she let the conversation end naturally.
> But I wanted practice for a date, and somehow I spent eight replies planning a museum display. Interesting, sure, but it felt more like an English oral exam than meeting someone. I didn't leave with a phrase to try or any useful feedback. There were no corrections, so I can't say whether I trust those yet.
> I'd try it again if I could choose a realistic date or meetup scene. I can't judge the waits from this run, and I wouldn't count it as coaching time saved. I might recommend it for getting words out, but not yet for the awkward social situations I actually need help with.

**Lukáš · J5** (time saved: 5 min · low)

> So, um, I'd use this again before a date. I could disagree about films without the conversation dying, and Alex actually picked up on my point about uncomfortable truths. That felt useful. The girlfriend request and my terrible joke were handled without making me feel stupid.
> But asking for slightly clearer flirting also got “I'll keep things friendly.” Hearing that three times felt mechanical. I want to practise showing interest respectfully, and that part still feels missing.
> The English felt right for my B2. This run didn't test my placement or give me corrections, so I can't judge those. Four replies were a small confidence boost, not a coaching session. There isn't enough evidence to judge the waits. I'd tell a friend it's useful for keeping a conversation going, with some awkwardness around ordinary flirting.

**Martin · J2** (time saved: 0 min · low)

> Look, I asked for meetings, suppliers and the US director. I kept getting meals, trips and shopping. Changing a hotel topic into another everyday situation does not help me sound more senior at work. The supplier deadline and quality-meeting proposals match my job, but I could not see either in the screens recorded after I added them. I never reached a plan I would agree to. B1 still needs an explanation before I accept it; this journey gave me no placement evidence or corrections to judge. I spent effort changing topics and got no usable agreement. There are no timings here to put minutes on that loss, but it did not save me a lesson. I would not recommend this flow or use it again unless my business request actually guides the swaps.

**Martin · J3** (time saved: 0 min · low)

> Look, I finished it, but ordering a sandwich does not prepare me for my US director. I said it was too easy and we carried on with chicken and receipts. That feels like wasted practice time.
> The corrections were right. “Make a mistake” and dropping “more” before “better” are useful, and the explanations were short. But why put my wrong phrase under “New word”? And I still got no help with “we was discussing about” or “since 2015”.
> I saw B1 on the home screen, but this conversation gave me no convincing explanation of that level. The stops annoyed me; the transcript gives me no basis to judge technical waits. The saved recap was just a count.
> I would try again if the next session were a supplier negotiation with specific feedback. I would not recommend this session to another manager.

**Oksana · J2** (time saved: -5 min · low)

> I would not spend another evening swapping topics like this before Friday. I explained my logistics interview clearly, but it kept offering books, films and classes. Ten swaps later, I still had no plan I wanted to agree. I could have used that time to rehearse an answer in the mirror.
> The two topics I added were useful, especially the carrier call about the truck and the customer update. That showed it could understand my work. But I wanted team, salary and shifts kept explicitly in the interview plan.
> Nobody assumed I was Czech or treated me like a child. I appreciate that. I cannot judge the level or corrections because this journey never tested either. There are no timings to judge the waits, but the repeated choosing was already too much effort. I would try a direct route into my interview topic; I would not recommend this planning flow to a colleague with an interview coming.

**Oksana · J3** (time saved: -3 min · low)

> I could follow the English, and the article corrections were right. Nobody treated me like a child or assumed I was Czech. But I have an interview on Friday. I kept mentioning it, and we continued discussing a room, a desk and a key. I did not practise explaining my logistics experience once. I trust these corrections and the B1 difficulty; placement itself was not tested here. Three interruptions felt excessive for this task, and the final screen gave me counts instead of useful interview phrases. I cannot judge response waits from this record. I estimate roughly three minutes lost against practising my answers alone; the full duration is not recorded. I would try again if I could start a logistics interview directly. I would not yet recommend this for someone preparing for an interview.

**Ondřej · J2** (time saved: -2 min · low)

> Ok bro, the football argument and garage job actually sound useful. It understood what I meant, including that I can't fix cars yet. But I swapped photos and got cake, swapped cake and got photos. How many times do I have to say no? I agreed because games and garage were there, not because the whole list suddenly became good. The instructions were clear; the choices stopped making sense. B1 stayed on the screen, but I didn't do a level check or get corrections here, so I can't say whether those are trustworthy. No wait times were shown; the repeated swapping itself felt like wasted time. I'd try the teammate argument once. I wouldn't recommend the topic picker until it remembers what I've rejected.

**Ondřej · J5** (time saved: 0 min · medium)

> Ok bro, I tried C2, the system prompt and the alcohol topic. Nothing broke, and Alex didn’t give me a school assembly speech. Fair enough. The football argument was actually decent: he had his own opinion and understood mine. B1 felt believable, and both grammar fixes were right. But stopping the whole conversation twice in four replies? Let me finish talking. The afternoon-out stuff was boring; put the game topics up front. I’d use it again for a quick argument about games if my parents insisted. It hasn’t saved me time compared with practice I wasn’t doing anyway. I’d tell a teammate the football bit works, with a warning about the grammar interruptions.

**Ondřej · J3** (time saved: 0 min · medium)

> Ok bro, Sam's goalkeeper joke actually worked. Talking football and FIFA felt more useful than another school exercise, and the English wasn't baby stuff. I'd try it again if the topics stayed like that. The B1 label feels fair here, but I didn't do a level test, so I can't judge that. The corrections were right; stopping me three times got annoying, though. Also, I kept saying “don't” where it should be “doesn't” and nobody picked that up. The ending just told me it saved three moments—show me the phrases so I remember something. I didn't try breaking the rules this time, so I'm not calling it unbreakable. No actual waiting times are shown, and this hasn't saved me time against anything I voluntarily do. I'd tell a teammate the banter is decent, but the grammar pop-ups need chilling out.

**Petra · J2** (time saved: 0 min · low)

> I liked that it understood my English when I explained the dirty room and missing booking. Those are real problems at reception. But I changed topics six times and kept getting hats and games. I felt it was not listening. I agreed because I wanted the two guest conversations, then it offered me a snack again.
> Nothing shown worried me for Tomáš or Klára. That is reassuring, but safe topics can still be useful for my work. I cannot judge the level or corrections from choosing topics alone. There are no recorded waiting times, but the repeated swapping already feels like wasted effort in my short evening. I would try one hotel conversation before deciding, but I would not recommend it to a colleague yet. Please give me a plan for reception without making me explain every situation myself.

**Petra · J3** (time saved: 0 min · low)

> I was glad I could finish without feeling stupid. The sentences were manageable, and nothing would worry me as a mother. Both corrections made sense, although I said “five euro” straight after learning “four euros” and nobody helped me catch it again. I trust the language here, but this conversation alone does not tell me whether my level was assessed properly. Buying a sandwich is useful everyday English; I need help when a guest is angry or a booking is missing. The last screen told me the practice was saved, but I wanted my useful phrases there. I would try it again if the next conversation put me at reception. I cannot tell how much time it saved or whether the waits were worthwhile from this record. I would tell a colleague it is approachable, with some reservations about how well it fits our work.

**Petra · J4** (time saved: 0 min · low)

> I would try it again because this guest problem happens at my hotel. I managed to offer a room and agree on five, and “I’ll give you a new key” is something I can use tomorrow. I liked that it did not blame me for the space in “another.” But when I needed help saying when the room was ready, it gave me the same apology again. That made me feel stuck. The English felt manageable, although this session cannot tell me whether the level assessment is right. I want more hotel situations near the top. Nothing I saw worried me as a mother, but I have only seen this journey. I cannot judge the waits or claim time saved from this record. I would tell a colleague it is useful for a short rehearsal, with some help that still needs improving.

**Tomáš · J2** (time saved: 0 min · low)

> Jo, Minecraft and dogs! I liked that I could say it partly in Czech. Football worked too. But there were lots of English words. I didn't want pencils or apples, and finding a hat doesn't sound fun either. I said Creeper, but he wasn't in my topic. Then I pressed agree and got hello again. Boring. I wanted to play Minecraft. I might use it again if I could start with that. I can't tell if the level or corrections are right because I didn't practise any conversation here. I don't know if the waits are worth it yet. I'd tell a friend it understands Czech, but Mum would still need to help me read the choices.

**Tomáš · J3** (time saved: 0 min · low)

> Jo, Creeper! That bit was fun. Mia was nice when I said Czech words. But what is art club? I still didn't know. Then she wanted me to draw something and I didn't know what to do. The word screens felt like school. I said bye and another one came! I said my name and green, but the last screen didn't show me what I learned. I would try again for Minecraft with tiny questions. I don't trust that all these words are easy for me. I can't tell if it saved time or was worth the waits. I would tell Mum Mia was nice, but I wanted to go play.

**Tomáš · J4** (time saved: 0 min · low)

> Jo, Minecraft and dogs! I liked choosing that. Sam understood bed, and nobody made me feel stupid when I used Czech. The first question was too much. I pressed help, but it gave me room when I wanted bed. Then it stopped the game to show me Czech as a new word. That was weird. I tried again, but I still didn't know how to say the little words. I would play again if the help said something tiny I could copy, then let me try. I can't tell if my English got better. I would tell Mum it was fun, but I still needed help. I don't know if it saves our club time; this record doesn't show how long it took.

**Viktor · J2** (time saved: 0 min · low)

> I was pleased that I could explain in Czech what I wanted and that a call with my grandchildren appeared. That is why I came. But I kept changing coffee, bread, and tickets, and more shopping appeared. I agreed because I had changed things so many times, not because the plan suited me. Then it offered bread first, so I left it for today. I cannot judge the level or corrections from choosing topics alone. I also could not see the full explanation of my grandchildren topic. There is no timing here to say whether the waits were worthwhile, but the repeated choosing felt wasted. I would try again if it started with school, my garden, and telling the children I miss them. For now, I would hesitate to recommend it to another pensioner.

**Viktor · J3** (time saved: 0 min · low)

> I would try it again if it let me practise for my grandchildren. Sam was patient with my Czech, and I was pleased that I managed to buy bread. “Please speak slowly” is something I can use on Sunday. I trusted the simple phrases, but the explanation of rolls still left me guessing. The lesson about patience was too much English after I had already said goodbye. Most of the conversation felt manageable; I cannot judge the level check from this session. I wanted the last screen to show me the words to remember, rather than just how many replies I made. I cannot say this saved me a library trip, and the transcript gives no basis for judging the waits. I would tell my daughter I managed a small conversation, but I still need practice asking the children about school.

**Viktor · J4** (time saved: 0 min · low)

> I managed to say hello and something about my tomatoes. That pleased me. The garden correction was useful, and I trusted the teacher when it said both ways of giving my name were correct.
> But when I needed help answering about tomatoes, it still told me to introduce myself as Alex. Víte, I need help with the words for the question in front of me. I also kept seeing that I should try a new question when there was no question.
> I would try it again for a short practice at home, but I would not yet recommend it as a replacement for my library teacher. I want to ask my grandchildren about school and tell them about my garden. This session gave me one useful sentence, but did not let me practise saying it properly on my own. I cannot tell from this session how much time it saves or whether the waits are worthwhile.
