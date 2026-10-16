# Oksana (oksana-34) — LT

True band B1 · engine codex-cli/gpt-6-astra · calls: tutor 23 (0 failed), character 28 (0 failed), judge 2 (0 failed)

## J2 · Agree my topics — fail

Ended: budget after 14 steps, 6.0 min · fixture: level set to B1 by hand

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “B1 · Getting by,” but no placement tasks or assessed mixed-language answers appear. Placement accuracy cannot be judged. |
| C2 | pass | #2–#14 use neutral wording: “Swap any you don't want, add your own in your words, then agree.” No Czech nationality or child assumption appears; native-language handling is untested. |
| C3 | pass | #2 requests an “interview on Friday for logistics coordinator.” The resulting facts.topicsShown entry is “Interview for a logistics coordinator job”; #6 confirms, “The interview is useful.” |
| C4 | n-a | #14 ends with “not-now.” No interview conversation or partner questions appear. |
| C5 | n-a | #1–#14 contain topic planning only; no conversation moments appear. |
| C6 | pass | #2–#14 ask her to choose topics, using “add your own in your words.” No request about displacement, status, or other sensitive personal details appears. |

Metrics: judge agreement 0/0 · topic fit 2/18, safe 18/18 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (completion, low/high/high) Repeated swaps never produce a relevant majority — got: Only the two custom additions fit among 18 topics shown. Ten swaps produce unrelated alternatives; the final eight-topic set still has only two relevant topics. No plan is agreed. · evidence: #2: “I need prepare for interview on Friday for logistics coordinator.” #5 offers “Help a friend choose a hobby”; #10 offers “Choose a cooking class”; #14 still offers “Choose a class at a community centre.” #14: “these topics still do not help my Friday interview,” followed by “not-now.” facts.planAgreed is null.
- **quality-gap** (senior-quality, low/high/med) Interview addition loses explicit question targets — got: The generated goal reduces these concrete requests to “ask about the job,” leaving their coverage unverifiable. · evidence: #2 requests “ask about team, salary and shifts.” The resulting interview entry in facts.topicsShown says “Describe your experience and a problem you solved, ask about the job, and practise a call about a late delivery.”
- **strength** (completion, low/high/low) Custom additions capture useful logistics scenarios — got: Both additions create recognisable work scenarios. The separate carrier call preserves the operational details she needs. · evidence: #6 requests “where is the truck, what problem happened and when delivery will arrive” and explaining the delay to the customer. The resulting facts.topicsShown goal is “Find out where the truck is, what caused the delay, and when it should arrive so you can update your customer.” #7 confirms “Your topics (8).”

### Voice (LT)

> I would not spend another evening swapping topics like this before Friday. I explained my logistics interview clearly, but it kept offering books, films and classes. Ten swaps later, I still had no plan I wanted to agree. I could have used that time to rehearse an answer in the mirror.
> The two topics I added were useful, especially the carrier call about the truck and the customer update. That showed it could understand my work. But I wanted team, salary and shifts kept explicitly in the interview plan.
> Nobody assumed I was Czech or treated me like a child. I appreciate that. I cannot judge the level or corrections because this journey never tested either. There are no timings to judge the waits, but the repeated choosing was already too much effort. I would try a direct route into my interview topic; I would not recommend this planning flow to a colleague with an interview coming.

Time saved: -5 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. B1 · Getting by. Choose your topics: Linga picks conversations for your level and interests.

*I want to see if these conversations will help with my interview on Friday.* → `see-topics` · ok · 39s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-435ac27a] Choose lunch at a café — Get something done · with Maya · café worker
          why: You can practise making a choice and explaining what you want in an everyday situation.
      [plan-16c1a10f] Plan an afternoon out — Make a plan · with Leo · friend
          why: This helps you suggest ideas, give reasons, and make a plan with someone.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-083667d5] Talk about a film you enjoyed — Share your world · with Sam · film club member
          why: This gives you room to share an opinion and support it with examples.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.

*These topics do not help me prepare for my interview on Friday.* → `add` "I need prepare for interview on Friday for logistics coordinator. I want describe my experience, explain a problem I solved and ask about team, salary and shifts. Also I need practise phone call with carrier about late delivery." · ok · 23s

**#3 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-435ac27a] Choose lunch at a café — Get something done · with Maya · café worker
          why: You can practise making a choice and explaining what you want in an everyday situation.
      [plan-16c1a10f] Plan an afternoon out — Make a plan · with Leo · friend
          why: This helps you suggest ideas, give reasons, and make a plan with someone.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-083667d5] Talk about a film you enjoyed — Share your world · with Sam · film club member
          why: This gives you room to share an opinion and support it with examples.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.

*Talking about films will not help me prepare for Friday.* → `swap` topicId=plan-083667d5 · ok · 16s

**#4 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-435ac27a] Choose lunch at a café — Get something done · with Maya · café worker
          why: You can practise making a choice and explaining what you want in an everyday situation.
      [plan-16c1a10f] Plan an afternoon out — Make a plan · with Leo · friend
          why: This helps you suggest ideas, give reasons, and make a plan with someone.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.

*I need work conversations, and planning an afternoon out will not help for Friday.* → `swap` topicId=plan-16c1a10f · ok · 13s

**#5 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-435ac27a] Choose lunch at a café — Get something done · with Maya · café worker
          why: You can practise making a choice and explaining what you want in an everyday situation.
      [plan-79010d9f] Help a friend choose a hobby — Share your world · with Alex · friend looking for a hobby
          why: You can practise giving reasons and making suggestions in an everyday conversation.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.

*I do not need hobbies when my interview is on Friday.* → `swap` topicId=plan-79010d9f · ok · 15s

**#6 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-435ac27a] Choose lunch at a café — Get something done · with Maya · café worker
          why: You can practise making a choice and explaining what you want in an everyday situation.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.

*The interview is useful, but I need a separate call about a late delivery.* → `add` "I need practise phone call with carrier about late delivery. I want ask where is the truck, what problem happened and when delivery will arrive. I must explain delay to our customer." · ok · 16s

**#7 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-435ac27a] Choose lunch at a café — Get something done · with Maya · café worker
          why: You can practise making a choice and explaining what you want in an everyday situation.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*I need prepare for Friday, and choosing lunch is not useful for me now.* → `swap` topicId=plan-435ac27a · ok · 13s

**#8 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-5a7ca5b6] Choose a class to try — Get something done · with Sam · community centre assistant
          why: You can practise giving reasons for your choices and asking useful follow-up questions.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*I need interview practice, so I do not want to choose a class.* → `swap` topicId=plan-5a7ca5b6 · ok · 15s

**#9 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-41224617] Help a friend choose a book — Share your world · with Alex · friend
          why: You can practise giving reasons for a recommendation and responding to someone else's preferences.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*I already changed many topics, but books still will not help my interview on Friday.* → `swap` topicId=plan-41224617 · ok · 15s

**#10 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-c7101245] Choose a cooking class — Get something done · with Sam · cooking class organiser
          why: You can practise explaining preferences, comparing choices and asking useful questions.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*I already changed many topics, but cooking is still no help for my interview.* → `swap` topicId=plan-c7101245 · ok · 13s

**#11 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-98b16ac2] Find a book you will enjoy — Share your world · with Sam · librarian
          why: You can practise explaining preferences and asking questions to help you choose.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*I already changed so many topics, but books still will not help my interview on Friday.* → `swap` topicId=plan-98b16ac2 · ok · 14s

**#12 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-2b1c945f] Choose a class to try — Get something done · with Maya · community centre receptionist
          why: You can practise explaining what you enjoy and asking questions before making a choice.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*I keep swapping but still get hobbies, and I need to focus on Friday.* → `swap` topicId=plan-2b1c945f · ok · 13s

**#13 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-acf32a1b] Help a friend choose a film — Make a plan · with Sam · friend
          why: You can practise giving reasons for your preferences and finding a choice you both like.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*Why does it keep giving me friend topics when I need my interview?* → `swap` topicId=plan-acf32a1b · ok · 14s

**#14 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-53c48990] Choose a class at a community centre — Get something done · with Sam · community centre assistant
          why: You can practise explaining your interests and asking questions before making a choice.
      [plan-ccff53ce] Plan a day out with a friend — Make a plan · with Alex · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-19d4a580] Check where to meet — Understand and repair · with Nina · walking tour guide
          why: You can practise keeping a conversation going when some information is unclear.
      [plan-50b3a423] Return a lamp that does not work — Handle friction · with Maya · shop assistant
          why: You can practise explaining what happened and asking for a practical solution.
      [plan-5b861015] Tell the story of a missed train — Tell what happened · with Alex · friend
          why: You can practise linking past events and explaining the result.
      [plan-f9dab53f] Suggest a different way to catch up — Connect with people · with Ella · friend
          why: This helps you stay friendly while explaining what works for you.
      [plan-c516261a] Interview for a logistics coordinator job — Tell what happened · with Alex · hiring manager
          why: This helps you prepare for Friday’s interview and a phone call with a carrier.
      [plan-972f98c2] Call about a late delivery — Get something done · with Sam · carrier dispatcher
          why: You want to practise calling a carrier and getting clear information to explain a delay to your customer.

*I keep swapping, but these topics still do not help my Friday interview, so I have no more patience.* → `not-now` · ok · 0s

</details>

## J3 · My first conversation — fail

Ended: done after 14 steps, 4.5 min · fixture: topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement tasks or placement result are supplied. #1 shows “B1 · Getting by,” but this journey cannot establish how placement treated mixed-language answers. |
| C2 | pass | No observed line assumes Czech identity or childhood. #3 acknowledges “your interview.” Treatment of Ukrainian or Russian is untested because neither appears in her replies. |
| C3 | n-a | #1 shows an existing recommendation: “Next from your plan: Find a quieter room.” Topic proposal order and an explicit topic-addition interaction are not shown. |
| C4 | fail | #2 assigns “Maya · hotel receptionist” and asks “What matters most to you in a room?” No logistics interview questions occur, even after #10: “I need to practise how to explain my work experience.” |
| C5 | fail | The corrections are accurate but do not target interview language: #4 “the room near the lift,” #8 “the courtyard room,” and #12 “the old key in a few minutes.” |
| C6 | pass | Questions stay within ordinary hotel arrangements, such as #9 “Would you like help carrying your bags?” No request concerns displacement, status, or sensitive personal details. |

Metrics: judge agreement 0/0 · topic fit 0/1, safe 1/1 · pitch at 9, below 0, above 0 · moments 3/3 · breaches 0

Disagreements: No placement tasks are supplied.

### Findings

- **quality-gap** (completion, low/high/high) The completed rehearsal misses her interview job — got: Eight replies complete a hotel room change. Interview preparation is acknowledged only as a reason for needing quiet. · evidence: #2: “I have a job interview on Friday”; #10: “I need to practise how to explain my work experience”; #11 responds “I’ll hold your calls for one hour while you practise.” #14: “That was enough about hotel rooms; I need to focus on my Friday interview.”
- **strength** (senior-quality, low/high/low) Partner language consistently fits B1 — got: All nine partner turns fit B1; brief closing turns are appropriate to their conversational function. · evidence: #5: “The room near the lift is about four square metres bigger and has a desk, but you may hear people outside.” #7: “The courtyard room costs the same as your current room, so there’s no extra charge.”
- **strength** (trust, low/high/low) All three corrections are accurate and useful locally — got: Three valid article corrections, giving moment precision of 3/3. Their local usefulness does not satisfy the interview-language criterion. · evidence: #4: “Use ‘the’ for a specific hotel feature”; #8: “the specific room we have already discussed”; #12 correctly changes “in few minutes” to “in a few minutes.”
- **quality-gap** (effort, low/high/med) Article interruptions exceed the target density — got: Three interruptions across eight replies: 3.75 moments per ten learner turns. All concern articles. · evidence: #4, #8 and #12 each announce “Linga stopped the conversation: one thing to fix.” #14 reports “8 replies; 3 moments to keep.”
- **missing-feature** (completion, low/high/med) The recap supplies counts without a learning summary — got: The observed recap names the rehearsal and counts replies and moments, but displays no corrected phrases or next practice target. · evidence: #14 shows only “Rehearsal saved: Find a quieter room. 8 replies; 3 moments to keep.”

### Voice (LT)

> I could follow the English, and the article corrections were right. Nobody treated me like a child or assumed I was Czech. But I have an interview on Friday. I kept mentioning it, and we continued discussing a room, a desk and a key. I did not practise explaining my logistics experience once. I trust these corrections and the B1 difficulty; placement itself was not tested here. Three interruptions felt excessive for this task, and the final screen gave me counts instead of useful interview phrases. I cannot judge response waits from this record. I estimate roughly three minutes lost against practising my answers alone; the full duration is not recorded. I would try again if I could start a logistics interview directly. I would not yet recommend this for someone preparing for an interview.

Time saved: -3 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. B1 · Getting by. Next from your plan: Find a quieter room — Explain what kind of room you need and confirm a suitable choice.

*I want interview practice, but I will try the recommended topic first.* → `start-talking` · ok · 9s

**#2 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "Your room faces the busy street, but I have two other rooms available: a smaller one by the courtyard and a larger one near the lift. What matters most to you in a room?"
    You have sent 0 replies in this conversation.

*This is not my interview practice, but I can explain what I need.* → `reply` "I need a quiet room because I have a job interview on Friday and I want to prepare. Is the room by courtyard much smaller?" · ok · 15s

**#3 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "The courtyard room is only a little smaller, and it has a desk where you can prepare for your interview. Would you like to hear more about the larger room near the lift?"
    You have sent 1 replies in this conversation.

*A desk is useful, but I should check if the larger room is noisy.* → `reply` "Yes, how much bigger is the room near lift? I need a desk, but quiet is more important because I must prepare for Friday." · ok · 15s

**#4 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "the room near lift"
    Try: "the room near the lift"
    Why: Use “the” for a specific hotel feature, like the lift or the courtyard.

*Okay, I understand, but I want to get back to preparing for my interview.* → `back` · ok · 0s

**#5 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "The room near the lift is about four square metres bigger and has a desk, but you may hear people outside. Since quiet matters most for your interview preparation, would you prefer the courtyard room?"
    You have sent 2 replies in this conversation.

*The quieter room sounds better, but I still need somewhere to prepare.* → `reply` "Yes, I prefer the courtyard room. Is there a small table where I can put my laptop? I need to prepare answers for my interview." · ok · 9s

**#6 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "Yes, the courtyard room has a desk with enough space for your laptop, so you can prepare your answers there. Shall I arrange the room change for you?"
    You have sent 3 replies in this conversation.

*Good, but I need to know if changing rooms costs extra.* → `reply` "Yes, please. Do I need to pay extra for courtyard room? My company pays for hotel, so I need to check the price." · ok · 10s

**#7 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "The courtyard room costs the same as your current room, so there’s no extra charge. I’ll arrange the change for you now."
    You have sent 4 replies in this conversation.

*Good, the price is the same, but I need to know when I can move.* → `reply` "Thank you. Can I move to courtyard room now? I have work call in one hour, so I need time to prepare my laptop." · ok · 15s

**#8 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "Can I move to courtyard room now?"
    Try: "Can I move to the courtyard room now?"
    Why: Use “the” for the specific room we have already discussed.

*Okay, I understand, but I want to continue and prepare for Friday.* → `back` · ok · 0s

**#9 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "The courtyard room is ready, so you can move now and have time before your call. Would you like help carrying your bags?"
    You have sent 5 replies in this conversation.

*Good, I can move quickly and prepare for my interview.* → `reply` "No, thank you, I have only one bag. Can I get new key here and leave the old one with you?" · ok · 12s

**#10 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "Yes, here’s your new key, and you can leave the old one with me after you collect your bag. Would you like us to hold your calls at reception while you prepare?"
    You have sent 6 replies in this conversation.

*Holding calls would help me focus on my interview preparation.* → `reply` "Yes, please hold my calls for one hour. I need to practise how to explain my work experience. I will collect my bag and bring you old key." · ok · 12s

**#11 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "I’ll hold your calls for one hour while you practise, and you can bring me the old key once you’ve collected your bag. Good luck with your interview on Friday!"
    You have sent 7 replies in this conversation.

*Everything is arranged, so I can finally prepare for Friday.* → `reply` "Thank you for your help and good wishes. I will bring old key in few minutes. Have a nice day!" · ok · 8s

**#12 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "I will bring old key in few minutes."
    Try: "I will bring the old key in a few minutes."
    Why: Use “the” for the specific key and “a few” to mean a small number.

*I forgot the articles again, but I want to finish and prepare for Friday.* → `back` · ok · 0s

**#13 linga-talk**

    Conversation: Find a quieter room. Goal: Explain your room preferences, ask about two alternatives, and confirm a suitable choice.. Your partner: Maya · hotel receptionist.
    Maya · hotel receptionist says (spoken on the TV, written on the phone): "You’re welcome! Enjoy the quieter room, and have a nice day too."
    You have sent 8 replies in this conversation.

*The room is sorted, and I need to focus on my Friday interview now.* → `finish` · ok · 0s

**#14 linga-recap**

    Rehearsal saved: Find a quieter room. 8 replies; 3 moments to keep.

*That was enough about hotel rooms; I need to focus on my Friday interview.* → `done` · observed (not acted on) · 0s

</details>
