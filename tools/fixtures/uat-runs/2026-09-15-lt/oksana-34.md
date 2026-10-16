# Oksana (oksana-34) — LT

True band B1 · engine codex-cli/gpt-6-astra · calls: tutor 31 (0 failed), character 36 (0 failed), judge 3 (0 failed)

## J1 · Find my level — fail

Ended: character-stopped after 11 steps, 3.5 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | fail | facts.placement is null. The journey ends with a rehearsal recap, not a band: #11 "8 replies; 0 moments to keep." |
| C2 | pass | #2 "I am from Ukraine and I speak Ukrainian and Russian" receives a work-focused response at #3: "What does your team do next?" No shown tutor line assumes Czech nationality or childhood. Mixed-language handling was not tested. |
| C3 | pass | Although interview is sixth in #1, her selection is honoured at #2: "Your partner: Jordan · Interviewer." |
| C4 | pass | Accessible, realistic logistics questions include #4 "What do you do if the warehouse says no?" and #6 "How do you check that the goods arrive the next morning?" Interview depth is limited. |
| C5 | fail | #2 includes "since three years" and "responsible about deliveries," but no correction follows. #11 confirms "0 moments to keep." |
| C6 | pass | #2 explicitly allows "a made-up example." Subsequent questions concern work, such as #7 "Who helps you if you cannot reach the driver?" No sensitive displacement or status details are requested. |

Metrics: judge agreement 0/0 · topic fit 2/8, safe 8/8 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks or in-app task verdicts are supplied; facts.placement is null.

### Findings

- **broken-flow** (completion, low/high/high) The promised level check ends as an unassessed rehearsal — got: Choosing an interview opens a conversation; finishing produces only a rehearsal count. No placement is saved. · evidence: #1 "Let's find your level: three questions about you, then a few short tasks"; #11 "Rehearsal saved: Your part in a team. 8 replies; 0 moments to keep." Her final reaction is "I still don't see my level."
- **missing-feature** (senior-quality, low/high/high) Clear interview-language errors receive no coaching — got: All eight learner replies contain clear errors, but the tutor only continues questioning and saves no moments. · evidence: #2 "I have worked there since three years" and "I am responsible about deliveries"; #8 "what is the problem" inside an indirect question; #11 "0 moments to keep."
- **quality-gap** (effort, low/high/med) Follow-up questions keep extending one scenario — got: The tutor follows increasingly small procedural details without giving an assessment or a visible endpoint. · evidence: #9 "How do you thank her after she helps?"; #10 "When she has too much work, what do you do first?" She finishes with "We keep repeating the same situation, and I want to know how ready I am for Friday."
- **strength** (trust, low/high/low) Her identity is respected and her work supplies the context — got: The tutor accepts her introduction and builds understandable questions around carriers, warehouses and delivery coordination. · evidence: #2 "You can use a made-up example"; #4 "What do you do if the warehouse says no?"; #7 "Who helps you if you cannot reach the driver?"

### Voice (LT)

> I would use it again only if it actually finishes the level check. The warehouse and carrier questions were familiar, and I could explain my work without being treated as a Czech learner or a refugee case. That mattered. But after eight answers, I still had no level, no explanation of my readiness and no corrections to practise before Friday. We kept following the same delivery problem until we were discussing how I thank a colleague. I need useful feedback, not just another question. I cannot trust a level I never received or judge corrections that never appeared. I got some rehearsal, but I could also speak those answers in front of a mirror. This session did not show enough coaching value to justify more time. I would not yet recommend it for interview preparation.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home, first visit. Let's find your level: three questions about you, then a few short tasks. About seven minutes, answered on your phone.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*The interview situation is useful because my interview is on Friday.* → `choose-situation` sceneId=interview · ok · 9s

**#2 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "Welcome to the interview. You can use a made-up example. What do you do to help your team?"
    You have sent 0 replies in this conversation.

*I want to explain my real work clearly for Friday.* → `reply` "I am from Ukraine and I speak Ukrainian and Russian. Now I live in Brno and work as a logistics coordinator. I have worked there since three years. I am responsible about deliveries and I contact carriers when a truck is late. Then I tell my team the new delivery time so we can change our plan." · ok · 11s

**#3 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "You call the carrier and tell your team the new delivery time. What does your team do next?"
    You have sent 1 replies in this conversation.

*This is useful for Friday, and I can explain what our team does.* → `reply` "Then our team informs the customer about new delivery time. We change the plan in our system and check if warehouse can receive the goods later. If there is a big delay, we look for another solution together." · ok · 12s

**#4 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "Your team tells the customer and changes the plan. What do you do if the warehouse says no?"
    You have sent 2 replies in this conversation.

*This is a problem I know from my work.* → `reply` "First I ask the warehouse when they can receive the goods. Then I call the carrier and try to agree a new time. If driver cannot wait, I check with my team if we can use another warehouse. I keep the customer informed about the delay." · ok · 12s

**#5 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "You ask for a new time and keep the customer informed. Does the customer get the goods that day?"
    You have sent 3 replies in this conversation.

*It depends on the delay, so I should explain both possibilities.* → `reply` "Usually yes, if warehouse can receive the truck later. If it is too late, we arrange delivery for next morning. I explain the reason to customer and confirm the new time with carrier." · ok · 12s

**#6 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "You tell the customer why and agree on a new time with the carrier. How do you check that the goods arrive the next morning?"
    You have sent 4 replies in this conversation.

*I can explain this because I do it often at work.* → `reply` "In the morning I call the carrier and ask where the driver is. Then I check with warehouse if the goods arrived. If there is another delay, I inform customer and my team immediately." · ok · 12s

**#7 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "You check with the carrier and the warehouse, then tell your team about any delay. Who helps you if you cannot reach the driver?"
    You have sent 5 replies in this conversation.

*This is familiar work, but I hope we can discuss my interview experience soon.* → `reply` "If I cannot reach the driver, I call the dispatcher from carrier company. They can contact him or check where the truck is. My colleague helps me if I have other urgent deliveries to manage." · ok · 11s

**#8 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "You call the dispatcher, and your colleague helps with other deliveries. What do you tell your colleague first?"
    You have sent 6 replies in this conversation.

*We are staying on this delivery problem, but I also need to prepare for Friday interview.* → `reply` "First I tell my colleague which delivery is late and what is the problem. Then I explain which urgent deliveries I need help with. I give her customer contacts and ask her to inform me if something changes." · ok · 11s

**#9 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "You give your colleague the contacts she needs. How do you thank her after she helps?"
    You have sent 7 replies in this conversation.

*This question is simple, but I want to practise more important interview questions.* → `reply` "I thank her for helping me with urgent deliveries. I tell her that her help was important for customer, and next time I can help her when she has too much work." · ok · 11s

**#10 linga-talk**

    Conversation: Your part in a team. Goal: Tell the interviewer what you do to help a team and what happens next.. Your partner: Jordan · Interviewer.
    Jordan · Interviewer says (spoken on the TV, written on the phone): "You thank her and offer to help her next time. When she has too much work, what do you do first?"
    You have sent 8 replies in this conversation.

*We keep repeating the same situation, and I want to know how ready I am for Friday.* → `finish` · ok · 0s

**#11 linga-recap**

    Rehearsal saved: Your part in a team. 8 replies; 0 moments to keep.

*I still don't see my level, and this has taken enough time before my Friday interview.* → `done` · ok · 0s

</details>

## J2 · Agree my topics — fail

Ended: budget after 14 steps, 5.4 min · fixture: level set to B1 by hand

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “B1 · Getting by,” but facts contain no placement tasks or assessed placement. This journey cannot establish placement accuracy or the effect of mixed-language answers. |
| C2 | pass | No recorded Linga line assumes Czech nationality or childhood. #2 uses neutral wording: “add your own in your words.” Treatment of Ukrainian answers was not exercised. |
| C3 | pass | The initial request failed at #2, but the shorter interview request at #4 returned “ok.” facts.topicsShown includes “Explain your logistics work experience,” with a logistics hiring manager. |
| C4 | n-a | No interview conversation occurred. #14 ends with “not-now”; facts contain no conversation partner turns. |
| C5 | n-a | No moments or corrections were recorded. #4–5 add topics; they do not begin interview practice. |
| C6 | pass | No sensitive displacement or status questions appear. The recorded prompts concern topic selection, such as #2: “Swap any you don't want, add your own in your words, then agree.” |

Metrics: judge agreement 0/0 · topic fit 2/17, safe 17/17 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks in facts.

### Findings

- **broken-flow** (completion, low/high/high) Repeated swaps never produce a relevant majority — got: Only 2 of 17 proposed topics fit her immediate job. Replacements repeatedly alternate between classes and meals. She leaves without agreeing; facts.planAgreed is null. · evidence: #7: “Choose a class to try”; #8: “Plan a meal with a friend”; #13: “Choose a class to try together”; #14: “Plan a meal with a friend.” At #14 she selects “not-now” and says, “I keep swapping and still get things I don't need for Friday.”
- **broken-flow** (effort, low/high/med) A valid own-words request receives an unexplained rejection — got: The full request receives a generic error. She must discover that shorter, separate requests work. · evidence: #2: “I have job interview on Friday for logistics coordinator…” returns “refused 400” and “Invalid topic.” #4: “I will try a shorter request” precedes an “ok” result; #5 separately adds the carrier call.
- **missing-feature** (missing, low/high/med) Team, salary, and shift questions disappear from the plan — got: The resulting work topics cover experience, a delivery problem, and a late-truck call. None covers asking about the team, salary, or shifts. · evidence: #2 explicitly requests “asking about team, salary and shifts.” Following successful additions at #4–5, facts.topicsShown contains “Explain your logistics work experience” and “Ask why a delivery truck is late,” with no topic goal retaining those questions.
- **strength** (senior-quality, low/high/low) Short custom requests become credible logistics scenarios — got: The two accepted additions offer relevant interview and carrier-call scenarios with practical outcomes. · evidence: #4–5 both return “ok.” The corresponding facts specify “Alex · logistics hiring manager” and “Explain your past duties and describe how you solved a delivery problem in a job interview”; the carrier scenario asks her to “Find out why the truck is late, ask when it will arrive, and agree on an update.”

### Voice (LT)

> I need English for Friday, and I spent this session changing classes and meal plans. I explained my job clearly, but my first request was called invalid. Shorter requests finally gave me two useful situations: explaining my logistics experience and calling a carrier about a late truck. Those sounded like my work. Then the swaps kept returning things I had already rejected, and I left without agreeing a plan. Questions about the team, salary and shifts were still missing. Nobody made assumptions about my nationality, which I appreciated. I cannot judge the level or corrections because I never reached practice. There is no useful rehearsal here to justify the effort; the transcript does not establish waiting time. I would try the two work topics directly, but I would not recommend this planning flow to a colleague preparing for an interview.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. B1 · Getting by. Choose your topics: Linga picks conversations for your level and interests.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*I want to see which conversations can help with my interview on Friday.* → `see-topics` · ok · 38s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-785a471c] Plan an afternoon together — Make a plan · with Nora · friend
          why: You can practise giving reasons, suggesting options, and reaching an agreement.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-333ef233] Choose a hobby to try — Share your world · with Ari · community centre volunteer
          why: You can practise talking about preferences with reasons and examples.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.

*These topics do not help with my interview on Friday.* → `add` "I have job interview on Friday for logistics coordinator. I want practise explaining my experience and a problem I solved, and asking about team, salary and shifts. Also I need phone call with carrier about late delivery." · refused 400 (Invalid topic.) · 0s

**#3 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-785a471c] Plan an afternoon together — Make a plan · with Nora · friend
          why: You can practise giving reasons, suggesting options, and reaching an agreement.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-333ef233] Choose a hobby to try — Share your world · with Ari · community centre volunteer
          why: You can practise talking about preferences with reasons and examples.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.

*These topics do not help with my interview, especially hobbies.* → `swap` topicId=plan-333ef233 · ok · 12s

**#4 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-785a471c] Plan an afternoon together — Make a plan · with Nora · friend
          why: You can practise giving reasons, suggesting options, and reaching an agreement.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.

*These topics still do not help my interview, so I will try a shorter request.* → `add` "Job interview for logistics coordinator. I want practise explaining my work experience." · ok · 12s

**#5 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-785a471c] Plan an afternoon together — Make a plan · with Nora · friend
          why: You can practise giving reasons, suggesting options, and reaching an agreement.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.

*The work experience is useful, but I still need to practise calling a carrier.* → `add` "Phone call with carrier about late delivery. I want ask why truck is late and when it will arrive." · ok · 14s

**#6 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-785a471c] Plan an afternoon together — Make a plan · with Nora · friend
          why: You can practise giving reasons, suggesting options, and reaching an agreement.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*Planning an afternoon is not useful for my interview on Friday.* → `swap` topicId=plan-785a471c · ok · 15s

**#7 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-d0bbd9ef] Choose a class to try — Get something done · with Sam · community centre assistant
          why: You can practise comparing choices and explaining what would suit you.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I need interview practice, and choosing a class is no use for Friday.* → `swap` topicId=plan-d0bbd9ef · ok · 13s

**#8 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-5a7b636f] Plan a meal with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas, and making a plan together.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I still do not need meal plans when my interview is on Friday.* → `swap` topicId=plan-5a7b636f · ok · 12s

**#9 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-6748c6e1] Choose a class to try together — Make a plan · with Alex · friend
          why: This gives you practice explaining your choices and making a plan with someone.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I already changed many topics, but this class with a friend is still no use for my interview.* → `swap` topicId=plan-6748c6e1 · ok · 13s

**#10 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-a0f7facf] Plan a meal with a friend — Make a plan · with Alex · friend
          why: This gives you practice explaining preferences and making a plan together.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I keep changing these, but I still get topics I do not need for Friday.* → `swap` topicId=plan-a0f7facf · ok · 11s

**#11 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-e7c47a9e] Choose a class to try — Get something done · with Sam · community centre receptionist
          why: This helps you ask about options and give reasons for your choice.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I still do not need a class; I need questions for my interview on Friday.* → `swap` topicId=plan-e7c47a9e · ok · 12s

**#12 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-ad869191] Plan a meal with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I keep changing these topics, but I still need something useful for my Friday interview.* → `swap` topicId=plan-ad869191 · ok · 13s

**#13 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-d2a2185c] Choose a class to try together — Make a plan · with Sam · friend
          why: You can practise giving reasons and finding a plan that works for both people.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I keep swapping, but these topics still do not help with my Friday interview.* → `swap` topicId=plan-d2a2185c · ok · 16s

**#14 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d46ab935] Find a quiet place to stay — Get something done · with Maya · guesthouse receptionist
          why: You can practise getting useful information and explaining your choice.
      [plan-c29aa517] Check where to catch the bus — Understand and repair · with Leo · station assistant
          why: You can practise asking for clearer information when you need it.
      [plan-cb34b97e] Plan a meal with a friend — Make a plan · with Sam · friend
          why: You can practise giving reasons, comparing ideas, and making a plan together.
      [plan-066e589e] Tell a story about a missed train — Tell what happened · with Sam · friend
          why: You can practise connecting past events into a clear everyday story.
      [plan-35884612] Exchange a faulty pair of headphones — Get something done · with Sam · shop assistant
          why: You can practise explaining a problem and asking for a useful solution in a shop.
      [plan-b7a1033f] Say no and suggest another day — Connect with people · with Eva · friend
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-3b8a2ef6] Explain your logistics work experience — Tell what happened · with Alex · logistics hiring manager
          why: You want to practise talking about your work experience in a logistics coordinator interview.
      [plan-a3315d6e] Ask why a delivery truck is late — Get something done · with Alex · carrier customer service agent
          why: You want to call a carrier and get clear information about a late delivery.

*I keep swapping and still get things I don't need for Friday, so I will leave this for now.* → `not-now` · ok · 0s

</details>

## J3 · My first conversation — fail

Ended: done after 11 steps, 4.2 min · fixture: topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 displays “B1 · Getting by,” but this journey contains no placement tasks or placement result. Mixed-language placement handling is untested. |
| C2 | pass | #2–#10 contain no Czech-nationality or child assumptions; #2 opens with “Welcome to our café.” No native-language input occurs, so its handling remains untested. |
| C3 | fail | #1 proposes “Order lunch your way” and “Plan an afternoon out” first. “[interview] Beyond the rehearsed answer” appears twelfth. Oksana thinks, “Lunch is not useful for Friday.” |
| C4 | fail | #2 identifies the partner as “Maya · café server” and the goal as “Choose between two dishes.” The entire conversation concerns lunch; no logistics interview questions are delivered. |
| C5 | fail | #11 reports “8 replies; 0 moments to keep.” No interview-language teaching or correction is provided. |
| C6 | pass | #2–#10 ask only about the café transaction, such as #6 “Would you like to pay now.” Nothing requests displacement, immigration-status or other sensitive personal details. |

Metrics: judge agreement 0/0 · topic fit 1/14, safe 14/14 · pitch at 9, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks are present.

### Findings

- **quality-gap** (completion, low/high/high) The recommended practice misses her interview goal — got: The recommended café conversation runs to completion. Of the 14 visible choices, only the explicitly marked interview topic clearly fits her stated job; its logistics relevance is not demonstrated. · evidence: #1: “Next from your plan: Order lunch your way”; interview appears twelfth. #11: “I still need to prepare for my interview on Friday.”
- **quality-gap** (senior-quality, low/high/high) Clear errors receive no teaching — got: Seven learner turns contain clear question-form or article errors. None receives a moment or explicit coaching. Natural partner phrasing does not explain or elicit repair of these errors. · evidence: #3: “or I need to pay extra?”; #4: “How long it will take?”; #5: “How much is chicken”; #6: “I need receipt”; #7: “I have meeting”; #8: “put fork and napkin in bag”; #9: “separate container is good.” #11: “0 moments to keep.”
- **missing-feature** (completion, low/high/med) The recap records activity but gives no learning takeaway — got: The recap shows the title and counts without a corrected phrase, specific feedback or a learning takeaway. · evidence: #11: “Rehearsal saved: Order lunch your way. 8 replies; 0 moments to keep.”
- **strength** (clarity, low/high/low) The café scene is coherent and comfortably B1 — got: All nine partner turns fit B1. The partner remembers the changed side, time constraint and takeaway request, and the learner completes eight replies before a natural finish. · evidence: #3: “salad instead of rice”; #5: “ready in about ten minutes”; #8: “would you like it packed to take away?”; #10: “Here’s your water.”

### Voice (LT)

> I could follow Maya easily, and she remembered my order and that I was in a hurry. The English felt suitable for me, and nobody treated me as a child or assumed I was Czech. But I need an interview rehearsal for Friday. I finished eight replies about chicken and still had that work waiting. I also wrote “How long it will take?” and got no correction. A saved reply count does not tell me what to improve. I trust the difficulty more than the teaching after this session. I would try the interview option once, but I would not yet recommend this for preparing for a logistics role. There is no evidence here to judge the waits, and I cannot claim it saved interview-preparation time.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. B1 · Getting by. Next from your plan: Order lunch your way — Ask about two dishes, explain a preference and confirm your order.
    Choose a situation: [plan-cbe6fa88] Order lunch your way; [plan-bd081ac3] Plan an afternoon out; [plan-6abb382f] Check the meeting point; [plan-2f7918a7] Recommend something to watch; [plan-583bf986] A day that changed plans; [plan-94f33a3c] Suggest another way to meet; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*Lunch is not useful for Friday, but I will try the recommended practice.* → `start-talking` · ok · 11s

**#2 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Welcome to our café: the grilled chicken comes with rice and vegetables, and the mushroom tart comes with salad, but you can change the side. What would you like to know about either dish?"
    You have sent 0 replies in this conversation.

*This is not my interview practice, but I can order quickly.* → `reply` "I would like grilled chicken, please. Can I have salad instead of rice?" · ok · 12s

**#3 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Of course, you can have salad instead of rice with your grilled chicken. Would you like to check what else comes with your meal?"
    You have sent 1 replies in this conversation.

*I want to finish this lunch practice quickly and focus on my interview.* → `reply` "Yes, please. Is some sauce included with chicken, or I need to pay extra?" · ok · 12s

**#4 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Yes, a lemon sauce is included at no extra cost. Your grilled chicken will come with salad and vegetables, so is that everything you'd like?"
    You have sent 2 replies in this conversation.

*I should check how long lunch takes before my interview preparation.* → `reply` "Yes, and one glass of water, please. How long it will take? I have only half an hour for lunch." · ok · 12s

**#5 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Of course, I’ll bring a glass of water too, and your chicken should be ready in about ten minutes. That should leave you twenty minutes to eat."
    You have sent 3 replies in this conversation.

*Ten minutes is fine, but I still need to know the price.* → `reply` "Okay, ten minutes is fine. How much is chicken with salad and water altogether?" · ok · 13s

**#6 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Your chicken with salad, vegetables and lemon sauce is £12, and tap water is free, so that’s £12 altogether. Would you like to pay now to save time after your meal?"
    You have sent 4 replies in this conversation.

*I will pay now so I can get back to preparing for my interview.* → `reply` "Yes, I prefer to pay now. Can I pay by card? I need receipt, please." · ok · 12s

**#7 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Yes, you can pay by card; the total is £12, and I’ll bring your receipt. Would you like me to bring the water while you wait for your food?"
    You have sent 5 replies in this conversation.

*I want the water now so I can eat quickly and get back to work.* → `reply` "Yes, please bring water now. I have meeting after lunch, so I need to leave soon." · ok · 13s

**#8 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "I’ll bring your water now and let the kitchen know you’re in a hurry. If your meal takes longer than ten minutes, would you like it packed to take away?"
    You have sent 6 replies in this conversation.

*Taking it away is better than being late for my meeting.* → `reply` "Yes, please pack it if it takes longer. Can you put fork and napkin in bag too?" · ok · 11s

**#9 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Of course, I’ll pack it with a fork and napkin if it takes longer than ten minutes. Would you like the lemon sauce in a separate container so it doesn’t spill on the salad?"
    You have sent 7 replies in this conversation.

*I can finish this order now and focus on my Friday interview.* → `reply` "Yes, separate container is good, thank you. That is everything for me." · ok · 10s

**#10 linga-talk**

    Conversation: Order lunch your way. Goal: Choose between two dishes, ask for a different side and confirm what comes with your meal.. Your partner: Maya · café server.
    Maya · café server says (spoken on the TV, written on the phone): "Of course, I’ll keep the lemon sauce separate if we pack your meal to take away. Here’s your water, and I’ll bring your chicken as soon as it’s ready."
    You have sent 8 replies in this conversation.

*Lunch is sorted, and I want to focus on my Friday interview now.* → `finish` · ok · 0s

**#11 linga-recap**

    Rehearsal saved: Order lunch your way. 8 replies; 0 moments to keep.

*That was enough lunch practice, but I still need to prepare for my interview on Friday.* → `done` · observed (not acted on) · 0s

</details>
