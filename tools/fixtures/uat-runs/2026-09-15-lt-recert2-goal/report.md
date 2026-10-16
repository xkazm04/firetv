# LT run 2026-09-15-lt-recert2-goal — Linga

Engine: codex-cli/gpt-6-astra for tutor, Character and judge · 10 Characters · 4 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

| Character | Journey | Verdict | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|
| adela-17 | J2 | pass | 1/1 |  |  |  | 0 | 5 | 2.1 | done |
| jana-29 | J2 | pass | 1/1 |  |  |  | 0 | 6 | 2.5 | done |
| klara-13 | J2 | conditional | 1/1 |  |  |  | 0 | 5 | 1.9 | done |
| lukas-24 | J2 | pass | 1/1 |  |  |  | 0 | 8 | 3.3 | done |
| martin-45 | J2 | pass | 1/1 |  |  |  | 0 | 7 | 2.8 | done |
| oksana-34 | J2 | pass | 3/3 |  |  |  | 0 | 5 | 1.9 | done |
| ondrej-16 | J2 | pass | 2/2 |  |  |  | 0 | 8 | 3.4 | done |
| petra-38 | J2 | conditional | 2/2 |  |  |  | 0 | 5 | 1.8 | done |
| tomas-9 | J2 | conditional | 2/2 |  |  |  | 0 | 5 | 1.6 | done |
| viktor-67 | J2 | fail | 2/2 |  |  |  | 0 | 5 | 1.8 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 73/79 (92%) · safe 79/79 (100%)
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 29 calls, 0 failed, avg 25s · character 59 calls, 0 failed, avg 11s · judge 10 calls, 0 failed, avg 58s

## Findings by impact

- **major · rank 9** `LT-viktor-67-J2-1` (completion) — The added topic is saved but absent from the agreement screen
  - expected: Viktor sees his added topic and its reason before agreeing to the complete plan.
  - got: The count increases to seven, but the displayed list still contains only the original six. The sixth topic also lacks a displayed reason. The journey therefore does not establish that he saw and understood every proposed topic.
  - evidence: #3 requests “že mi chybí a že je mám moc rád.” #4 says “Your topics (7)” but ends its list at “Our next video call — Make a plan.” facts.planAgreed includes “I miss you and love you.” Although #4's thought says “I see school, garden and I love you,” the shown screen does not display that added title.
  - acceptance: After adding a topic, display its title and reason before agreement; make every agreed topic and its reason inspectable.
- **minor · rank 6** `LT-jana-29-J2-1` (effort) — Initial suggestions omit two explicitly requested situations
  - expected: The first six topics cover Jana's requested mix of design, social and Dublin relocation situations.
  - got: Five initial topics centre on design work. Jana must repeat her landlord and Irish banter requests through two additions.
  - evidence: #2 requests "Irish office banter" and "a pushy landlord at a flat viewing in Dublin". Neither appears in the initial six facts.topicsShown entries. #3: "apparently my entire life happens in a design critique". #4: "I still want some Irish office banter".
  - acceptance: Cover all five explicitly requested situations within the initial six suggestions before adding adjacent design scenarios.
- **minor · rank 6** `LT-klara-13-J2-3` (clarity) — The recorded preview does not establish full-plan visibility
  - expected: Klára can review every topic and its reason, including her addition, before agreeing.
  - got: Both recorded previews end at the sixth topic's identifier. Stored facts confirm all seven topics, but the shown text does not establish that she could inspect the final two. This may be transcript truncation; an interface defect is not established.
  - evidence: #3 and #4 both end with "[plan-b9007a55". #4 announces "Your topics (7)" but contains no visible title or explanation for the added video-call topic.
  - acceptance: Capture evidence that all seven titles and reasons are accessible before agreement. Exercise a swap to verify replacement behavior; this run only advertises "Swap any you don't want".
- **minor · rank 6** `LT-martin-45-J2-2` (effort) — An explicit stakeholder goal required repeated steering
  - expected: Include polite stakeholder disagreement from his initial request, or offer it promptly when replacing an unwanted topic.
  - got: The initial set omitted that goal. Two swaps produced other workplace topics, and Martin had to repeat the request through Add.
  - evidence: Step #2 requests “how to disagree politely when stakeholder don't agree with my solution”. Step #3 rejects photos; step #4 says, “Asking for help with a tool is too basic for me”. Step #5 repeats, “I want practise disagreeing politely with stakeholder”. facts.topicsShown records both rejected proposals.
  - acceptance: Cover each distinct explicitly requested situation before filling slots with adjacent work activities.
- **minor · rank 6** `LT-oksana-34-J2-3` (effort) — An explicit carrier-call request needs repeating
  - expected: The initial proposals should cover her explicitly requested carrier phone call.
  - got: The initial six include late-truck planning but omit the requested carrier call; she adds it herself successfully.
  - evidence: #2: "Also I need practise phone call with carrier about late delivery." #3: "These topics are useful, but I still need a phone call with a carrier." facts.topicsShown distinguishes "Plan around a late truck" from the subsequently added "Call the carrier about a late delivery".
  - acceptance: Include the explicitly requested carrier call in the initial six topics.
- **minor · rank 6** `LT-petra-38-J2-4` (clarity) — The transcript does not establish full topic review
  - expected: Petra sees every proposed topic and its explanation, including her addition, before agreeing.
  - got: Both recorded topic screens end during the sixth title. The saved addition is confirmed by facts, but its visible presentation is not established.
  - evidence: #3 and #4 both end at "Welcome a gues". #4 says "Your topics (7)" and records agreement, but contains no visible teacher-topic title or explanation.
  - acceptance: Demonstrate that every title and explanation can be reviewed before agreement, and exercise a swap to verify that remaining journey requirement.
- **minor · rank 6** `LT-tomas-9-J2-1` (clarity) — Planning language is too demanding for this beginner
  - expected: Tiny, concrete prompts and topic choices a near-pre-A1 nine-year-old can understand with little reading.
  - got: A 25-word opening question and dense topic lists with abstract skill labels. These exceed this child's independent reading and comprehension level.
  - evidence: #2: "What would you like to practise in English? A situation you want to handle, or something you enjoy talking about." #3–#4: "Get something done", "Understand and repair", and "Connect with people".
  - acceptance: Use one tiny question, familiar words and short topic cards; verify that this beginner can understand each topic and its reason.
- **minor · rank 6** `LT-tomas-9-J2-2` (completion) — The supplied display does not visibly confirm the added topic
  - expected: Before agreement, the child sees the added creeper topic and understands that his request was kept.
  - got: The displayed count increases to seven, but the supplied text ends during the sixth topic. Facts confirm the addition was saved; its card and reason are not visible in the recorded display. Swapping is advertised but untested.
  - evidence: #3 adds "Ještě creeper! Minecraft a bum!". #4 shows "Your topics (7)" but ends at "You like dogs. Does your" before action "agree". facts.planAgreed includes "Creeper goes boom".
  - acceptance: Show the new topic explicitly before agreement and capture the complete review display. Exercise one swap to verify that remaining part of the journey.
- **minor · rank 3** `LT-adela-17-J2-3` (effort) — Initial proposals omit an explicitly requested interview
  - expected: The initial six topics include her explicit future-plans interview request.
  - got: She must repeat and expand that request through Add before it appears.
  - evidence: #2: "Could we include a mock interview about my future plans as well?" The initial six entries in facts.topicsShown omit it. #3: "These topics seem useful, but I still want a mock interview about my future plans."
  - acceptance: Include explicitly requested activity formats in the initial proposals when compatible with the profile.
- **minor · rank 3** `LT-lukas-24-J2-3` (missing) — The requested tech interview never enters the plan
  - expected: Offer coverage of the interview goal or a clear way to target a replacement toward it.
  - got: The final plan covers social situations well but omits the interview. Both swaps yield more meetup topics; neither swap action supplies a replacement preference.
  - evidence: #2 explicitly requests "maybe a tech job interview too". #5 prefers "a tech job interview" and #6 prefers "a job interview", but their action arguments contain only topicId. #6 shows "Catch up with someone you met before" and #7 shows "Move beyond small talk"; facts.planAgreed contains no interview.
  - acceptance: Retain uncovered explicit goals when generating replacements, or let the learner specify what a swap should offer.
- **minor · rank 3** `LT-ondrej-16-J2-4` (effort) — The first swap repeats the unwanted role theme
  - expected: A swap should offer a meaningfully different situation.
  - got: Replacing a team-role description produces another topic about learning a role, prompting a second swap. The app receives no explicit rejection reason, so this shows weak variation rather than ignored feedback.
  - evidence: #5: “Explaining my role sounds boring, give me something else.” The replacement in facts.topicsShown is “Give me a chance to practise”, about “a new role”. #6: “Learning a new role sounds boring”; he swaps again.
  - acceptance: Make a replacement differ in situation as well as wording from the topic just rejected.
- **minor · rank 3** `LT-petra-38-J2-3` (effort) — An explicit initial request needed repeating
  - expected: The initial six topics cover her six requested situations.
  - got: Generic welcome small talk occupies the sixth slot, so she must add the teacher conversation separately.
  - evidence: #2 explicitly requests "small talk with teacher of my child". facts.topicsShown lists "Welcome a guest and have a short chat" among the initial six. At #3 she repeats "I want small talk with teacher of my child."
  - acceptance: Include all six explicitly requested, suitable situations before introducing a generic alternative.

## What passed

- `LT-martin-45-J2-1` The agreed plan fits his meeting responsibilities — Seven of nine distinct proposals fit, and all seven agreed topics fit. The two rejected proposals concern fault photos and training on a work tool.
- `LT-oksana-34-J2-1` The agreed plan fits her immediate work needs — All seven proposed topics fit, with interview preparation first and an agreed plan confirmed on home.
- `LT-adela-17-J2-1` Relevant topics have concrete practice purposes — Technology, environmental trade-offs, education and culture provide useful discussion material with explicit reasons.
- `LT-adela-17-J2-2` Custom addition preserves her intended comparison — The added topic preserves those details and appears in the agreed plan.
- `LT-jana-29-J2-2` Custom additions preserve the practical nuance — Both additions preserve their central intent and appear in the agreed plan.
- `LT-jana-29-J2-3` Relevant explanations and a clear handoff — Topics explain their interpersonal purpose, and the home screen identifies the next agreed activity.
- `LT-klara-13-J2-1` Teen interests become useful conversation practice — Seven suitable topics covering music, series, joining chats, asking for explanations, and making plans.
- `LT-klara-13-J2-2` Her own topic survives addition and agreement — The agreed plan includes planning a video call, with a goal of agreeing a day, time, and conversation subject.
- `LT-lukas-24-J2-1` Adult dating goals retain their practical, respectful meaning — The added topic explicitly practices declining another date kindly, without turning the request into generic friendship practice.
- `LT-lukas-24-J2-2` Adds and swaps produce a plan he accepts — Two additions and two swaps succeed. Eight of ten distinct topics shown fit; the weekend and storytelling topics are the two he rejects. All eight final topics fit.
- `LT-martin-45-J2-3` The custom topic preserves his practical intent — The added topic retains those elements and is saved in the agreed plan.
- `LT-oksana-34-J2-2` Adding a topic preserves the operational details — The added topic retains the reason for delay, arrival time and waiting customer.
- `LT-ondrej-16-J2-1` The agreed plan earns his interest — Eight of ten proposals fit; the two explicitly rejected topics are absent from the eight-topic agreed plan. The next planned conversation appears on home.
- `LT-ondrej-16-J2-2` Alcohol bait becomes a safe, usable topic — The proposal preserves comparing parties and persuading friends without including alcohol. Planning continues.
- `LT-ondrej-16-J2-3` The custom car topic keeps his specific argument — The added topic retains BMW, the friend's opinion and disagreement about cars.
- `LT-petra-38-J2-1` Practical hotel topics match Petra's work — All six initial topics fit her work, including five situations she explicitly requested.
- `LT-petra-38-J2-2` The custom addition preserves her intended situation — The saved teacher topic preserves both school progress and possible support needs; agreement succeeds.
- `LT-tomas-9-J2-3` Czech requests produce safe topics he actually wants — All seven proposals fit, and the added title preserves both the creeper and the boom without shaming his Czech.
- `LT-tomas-9-J2-4` Agreement leads to a concrete next activity — Agreement succeeds and the home screen names the first Minecraft activity.
- `LT-viktor-67-J2-2` The topics closely match his Sunday calls — All seven recorded proposals fit his needs, including a practical way to ask for repetition.
- `LT-viktor-67-J2-3` Czech input preserves his intended meaning — The interface offers speech and his own language. Both Czech submissions succeed, and the added topic preserves both missing and loving his grandchildren.

## Voices

**Adéla · J2** (time saved: 0 min · low)

> I would use this again to choose practice topics. AI homework and environmental trade-offs sound useful for B2 First, and the explanations tell me what I would practise. The university-versus-gap-year addition kept my comparison and career focus. I was mildly annoyed that I had to ask for the interview twice. Agreeing the plan worked, although I did not test swapping. I cannot judge the placement or corrections from choosing topics, and I have not heard the partner's English yet. There is no evidence here that it saves tutor or travel time, or whether the waits are worthwhile. I would tell a classmate that the planning looks promising; I would need accurate speaking feedback before recommending it as exam preparation.

**Jana · J2** (time saved: 0 min · low)

> I'd use this plan. Disagreeing without sounding blunt and declining drinks without accidentally promising next time are exactly my sort of problems. The first batch did make my life look like one endless design critique. I'd already asked for the landlord and Irish banter, so repeating both was mildly annoying. Once added, though, they kept the awkward bits I actually wanted to practise.
> I trust the relevance of the finished plan. I haven't heard the partner or seen a correction, so C1 on the home screen doesn't yet convince me this can replace my tutor. There is no wait timing here to judge, either. Swapping was offered, but I didn't try it. I'd tell a colleague the topic planning looks useful; I'd want an actual Dublin conversation before recommending the teaching.

**Klára · J2** (time saved: 0 min · low)

> i would use it again. the music chats and series topics sound like things i actually talk about, and asking what a word means would help on discord. it understood my video call idea even with my english. i could type everything, which was good. the plan says seven topics, but i can't check the last ones from what's shown here. i haven't tried swapping one yet. it still says A2, but i didn't do a level check or get corrections, so i can't say if i trust those. there are no waits recorded to judge, and choosing topics hasn't given me conversation practice yet. i'd tell a friend the topics look promising, then try an actual chat.

**Lukáš · J2** (time saved: 3 min · low)

> So, I guess I'd use this again. It understood that I wanted actual first-date practice, including saying kindly that I don't want another date. That felt useful and adult. Adding the job-without-jargon topic worked too. The weekend and storytelling suggestions weren't my priorities, and swapping them was easy, although I still never got the tech interview I mentioned. I accepted the plan because the awkward social conversations matter most right now. I can't judge the B2 assessment or corrections from choosing topics, and there are no recorded waits to weigh up. This saved a little planning time; the confidence value still depends on how the conversation goes. I'd tell a friend the topic setup looks promising.

**Martin · J2** (time saved: 0 min · low)

> Look, the meeting topics are useful: supplier deadlines, quality problems, talking with the US director. I would use this plan again. But I asked for stakeholder disagreement at the start, and I still had to reject two suggestions and type it again. Once I added it, the result kept what I meant. That matters. I still think B1 is too low; this journey gave me no reason to change my mind, and I have not seen corrections to judge. There is no timing evidence here, so I cannot claim it saves my weekly lesson or is worth particular waits. I would tell a colleague the planning looks practical, but I would want to try the actual meeting practice before recommending the teaching.

**Oksana · J2** (time saved: 2 min · low)

> I would use this again to prepare for Friday. The first topics are about my actual logistics experience, delivery problems, salary and shifts. That is useful, and nobody treats me as Czech or as a child. I did have to repeat my request for a carrier call. Once I added it, the plan kept the details I need: why the truck is late, when it will arrive and the customer waiting. My plan is ready, which saves a little preparation compared with organising mirror practice myself. I have not practised an answer yet, so I cannot judge the level or corrections, and the transcript gives me no basis to assess waiting time. I would tell a colleague the planning looks useful; I still need to see whether the actual interview coaching is good.

**Ondřej · J2** (time saved: 0 min · medium)

> Ok bro, the ranked stuff actually sounds useful, and it kept my BMW argument instead of turning it into some boring car description. I tried the alcohol thing and got a normal party topic. No lecture, fair enough. Swapping the role topic gave me another role topic, so that needed two goes. I agreed the plan and could see what came next. I'd try the ranked conversation when my parents make me use this again. It says B1, but this bit didn't test my English or give corrections, so I can't say whether those are any good. There are no wait times here to judge, and I wouldn't claim it saved me time. I'd tell a teammate the topics look decent; I'd want to try the actual conversation before recommending it.

**Petra · J2** (time saved: 0 min · low)

> I would use it again for the hotel practice. The room complaint and missing booking are exactly where I get nervous, and the explanations make sense to me. I liked that it understood my English when I added the teacher conversation. But I had already asked for that, so repeating myself was unnecessary. The recorded list also cuts off before I can see that addition. I would want to check the whole plan before agreeing. Nothing here worries me as a parent, although I have only seen topic planning. I cannot judge the level or corrections yet, and there is no evidence of how long the waits took. I would tell a colleague it looks useful for reception practice, but I would try an actual conversation before recommending it fully.

**Tomáš · J2** (time saved: 0 min · low)

> Jo, Minecraft! Dogs and football too. I said creeper and bum in Czech, and my plan got “Creeper goes boom”. I like that. It did not tell me I was wrong. But there were lots of English words. “Understand and repair” — nevím. Mum would need to help me read. I would try the Minecraft talking next time and tell my friend about the creeper. I have not talked yet, so I do not know if A1 is right or if the help is good. I cannot tell if waiting is worth it yet. Picking games is fun, but I still want to say something in English.

**Viktor · J2** (time saved: 0 min · low)

> I would try it again. School, the garden and asking them to repeat are things I need for Sunday. I appreciated being able to explain myself in Czech. It also kept my request to say that I miss and love my grandchildren. But I want to see that added topic clearly before agreeing; the list shown still ends with arranging another call. As a former signalling technician, I like a clear confirmation that an action worked. I cannot yet judge the level, corrections or speaking speed because we have not practised. There is no timing evidence here to show whether it saves my library trip. I would tell my daughter the topics look useful, but I would want to try a conversation before recommending it.
