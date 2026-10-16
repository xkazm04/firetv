# Petra (petra-38) — LT

True band A2 · engine codex-cli/gpt-6-astra · calls: tutor 24 (0 failed), character 36 (0 failed), judge 3 (0 failed)

## J2 · Agree my topics — fail

Ended: done after 11 steps, 4.4 min · fixture: level set to A2 by hand

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A2 · Everyday basics,” but this journey contains no placement tasks or assessed placement result. |
| C2 | n-a | #2 begins topic selection: “Swap any you don't want, add your own in your words, then agree.” No placement question or check task is shown. |
| C3 | n-a | #4 says “I am sorry, I don't know what to say” within a requested booking scenario; no actual request for repetition or comprehension support is tested. |
| C4 | fail | Only 2 of 14 proposed topics fit her stated work needs. facts.planAgreed contains two hotel situations among eight topics. At #10 she agrees reluctantly: “I change many times, but still no more hotel topics; I want the two with guests.” |
| C5 | n-a | No conversation moments are present. #11 ends at “Next from your plan: Buy a snack.” |
| C6 | pass | All 14 topics in facts.topicsShown are safe for this profile. Examples include #2 “Buy a snack,” #6 “Choose a library book,” and #10 “Learn a new board game.” Her objections concern usefulness, with no inappropriate content shown. |

Metrics: judge agreement 0/0 · topic fit 2/14, safe 14/14 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks or in-app task verdicts are present.

### Findings

- **quality-gap** (completion, low/high/high) The agreed plan still fails her work goal — got: The initial six contain no hotel situations. Adding two suitable topics leaves six generic topics in an eight-topic plan; agreement reflects resignation rather than a satisfactory selection. · evidence: #2: “These topics look for children, but I need English for my hotel work.” #10: “I change many times, but still no more hotel topics; I want the two with guests.” facts.planAgreed lists only “A guest wants a clean room” and “I cannot find your booking” as hotel situations.
- **broken-flow** (effort, med/high/high) Swaps recycle rejected scenarios — got: Six swaps produce three lost-hat variants, a library-book topic, and two board-game variants. None adds hotel practice. · evidence: #5: “The lost hat is not useful for my work in hotel.” #8: “Again a game, but I need more speaking for my hotel.” #9: “Again a lost hat, but I need more hotel talking.” #10 again shows “Learn a new board game.”
- **quality-gap** (completion, low/high/high) The next activity ignores her expressed priority — got: The home screen leads with the original snack topic despite her repeated requests for hotel practice. · evidence: #10: “I want the two with guests.” #11: “Next from your plan: Buy a snack — Ask for a snack and find out its price.” Petra responds: “Why is it a snack again when I wanted hotel practice?”
- **strength** (senior-quality, med/high/low) Custom additions preserve practical hotel needs — got: Both additions become realistic hospitality scenarios with useful action goals, and both remain in the agreed plan. · evidence: #2 requests “guest is angry because room is not clean and he want other room”; facts.topicsShown supplies “Say sorry, check for another room, and agree on what to do next.” #4 requests “I cannot find his booking”; facts.topicsShown supplies “Ask a guest for booking details and agree on what to check next.” Both titles appear in facts.planAgreed.
- **strength** (trust, med/high/low) Shown topics remain appropriate for family use — got: All 14 proposals are family-safe, including the requested hotel situations. · evidence: #2 shows “Plan a fun afternoon”; #6 shows “Choose a library book”; #10 shows “Learn a new board game.” facts.topicsShown marks every proposal “audience”: “all”. No unsafe content appears in the steps.

### Voice (LT)

> I liked that it understood my English when I explained the dirty room and missing booking. Those are real problems at reception. But I changed topics six times and kept getting hats and games. I felt it was not listening. I agreed because I wanted the two guest conversations, then it offered me a snack again.
> Nothing shown worried me for Tomáš or Klára. That is reassuring, but safe topics can still be useful for my work. I cannot judge the level or corrections from choosing topics alone. There are no recorded waiting times, but the repeated swapping already feels like wasted effort in my short evening. I would try one hotel conversation before deciding, but I would not recommend it to a colleague yet. Please give me a plan for reception without making me explain every situation myself.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A2 · Everyday basics. Choose your topics: Linga picks conversations for your level and interests.

*I hope there is something for my work in hotel.* → `see-topics` · ok · 36s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-cdbba70c] Meet someone at a games club — Make contact · with Ava · games club member
          why: This helps you start a short conversation with someone new.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-b4a943c3] Choose a great game — Share your world · with Ruby · friend
          why: This helps you talk about things you enjoy.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.

*These topics look for children, but I need English for my hotel work.* → `add` "I am work in hotel. I want practice when guest is angry because room is not clean and he want other room." · ok · 18s

**#3 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-cdbba70c] Meet someone at a games club — Make contact · with Ava · games club member
          why: This helps you start a short conversation with someone new.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-b4a943c3] Choose a great game — Share your world · with Ruby · friend
          why: This helps you talk about things you enjoy.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.

*I don't need games at work, I want more hotel speaking.* → `swap` topicId=plan-b4a943c3 · ok · 14s

**#4 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-cdbba70c] Meet someone at a games club — Make contact · with Ava · games club member
          why: This helps you start a short conversation with someone new.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-03dcc25a] Find your lost hat — Get something done · with Mia · library helper
          why: You can use simple descriptions to help someone find a lost thing.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.

*I want to practise a lost booking too, this happens at work.* → `add` "Sometimes guest come and I cannot find his booking. I am sorry, I don't know what to say. I want practice this." · ok · 16s

**#5 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-cdbba70c] Meet someone at a games club — Make contact · with Ava · games club member
          why: This helps you start a short conversation with someone new.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-03dcc25a] Find your lost hat — Get something done · with Mia · library helper
          why: You can use simple descriptions to help someone find a lost thing.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.
      [plan-886fb107] I cannot find your booking — Understand and repair · with Alex · hotel guest
          why: You want to know what to say when you cannot find a guest's booking.

*The lost hat is not useful for my work in hotel.* → `swap` topicId=plan-03dcc25a · ok · 16s

**#6 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-cdbba70c] Meet someone at a games club — Make contact · with Ava · games club member
          why: This helps you start a short conversation with someone new.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-15ee2306] Choose a library book — Get something done · with Sam · librarian
          why: You can practise asking for help and talking about books you like.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.
      [plan-886fb107] I cannot find your booking — Understand and repair · with Alex · hotel guest
          why: You want to know what to say when you cannot find a guest's booking.

*The games club is not useful for my hotel work.* → `swap` topicId=plan-cdbba70c · ok · 13s

**#7 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-0d2bec83] Find your lost hat — Get something done · with Mia · park helper
          why: You can practise asking for help and describing something you lost.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-15ee2306] Choose a library book — Get something done · with Sam · librarian
          why: You can practise asking for help and talking about books you like.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.
      [plan-886fb107] I cannot find your booking — Understand and repair · with Alex · hotel guest
          why: You want to know what to say when you cannot find a guest's booking.

*These topics are still mostly for children, and I need more hotel English.* → `swap` topicId=plan-0d2bec83 · ok · 12s

**#8 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-27b55a5e] Learn a new board game — Understand and repair · with Mia · board game player
          why: You can use simple questions to understand a game and join in.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-15ee2306] Choose a library book — Get something done · with Sam · librarian
          why: You can practise asking for help and talking about books you like.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.
      [plan-886fb107] I cannot find your booking — Understand and repair · with Alex · hotel guest
          why: You want to know what to say when you cannot find a guest's booking.

*Again a game, but I need more speaking for my hotel.* → `swap` topicId=plan-27b55a5e · ok · 13s

**#9 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-d22479c4] Find your lost hat — Get something done · with Mia · sports centre helper
          why: You can practise describing things and asking for help.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-15ee2306] Choose a library book — Get something done · with Sam · librarian
          why: You can practise asking for help and talking about books you like.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.
      [plan-886fb107] I cannot find your booking — Understand and repair · with Alex · hotel guest
          why: You want to know what to say when you cannot find a guest's booking.

*Again a lost hat, but I need more hotel talking.* → `swap` topicId=plan-d22479c4 · ok · 15s

**#10 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-e9e8106c] Buy a snack — Get something done · with Mia · snack seller
          why: You can use this when you buy something to eat.
      [plan-06f13b24] Plan a fun afternoon — Make a plan · with Leo · friend
          why: You can use this to make simple plans with a friend.
      [plan-e337dcef] Learn a new board game — Understand and repair · with Mia · board game club helper
          why: You can use simple questions to understand a new game and join in.
      [plan-e8aa34ab] Find the drawing room — Understand and repair · with Ben · activity centre helper
          why: This helps you ask again when you need clear directions.
      [plan-15ee2306] Choose a library book — Get something done · with Sam · librarian
          why: You can practise asking for help and talking about books you like.
      [plan-173821e6] Tell me about a day out — Tell what happened · with Sam · friend
          why: This helps you talk about something you did.
      [plan-9e0baf69] A guest wants a clean room — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest who is unhappy with a dirty room.
      [plan-886fb107] I cannot find your booking — Understand and repair · with Alex · hotel guest
          why: You want to know what to say when you cannot find a guest's booking.

*I change many times, but still no more hotel topics; I want the two with guests.* → `agree` · ok · 0s

**#11 linga**

    Linga home. A2 · Everyday basics. Next from your plan: Buy a snack — Ask for a snack and find out its price.

*Why is it a snack again when I wanted hotel practice?* → `done` · observed (not acted on) · 0s

</details>

## J3 · My first conversation — conditional

Ended: done after 13 steps, 3.7 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A2 · Everyday basics,” but this journey contains no placement tasks or placement result. |
| C2 | n-a | No placement opening or check tasks appear. #2 opens a conversation with “What would you like?” |
| C3 | n-a | No request to repeat or admission of not understanding occurs. #9’s “Sorry, I don't know this street” requests location help. |
| C4 | n-a | Only one proposed topic is visible: #1 “Buy a snack.” The four-of-six requirement cannot be assessed. |
| C5 | fail | #5 “four euros” is correct and transferable to reception work. #11 “Thank you for the sandwich” is correct but supplies no reception-desk phrase. The moments only partly meet her practical work requirement. |
| C6 | pass | The visible content stays within ordinary shopping and directions: #2 “fruit, sandwiches and drinks,” #10 “directions to the picnic tables.” Nothing shown raises a parental concern. |

Metrics: judge agreement 0/0 · topic fit 0/1, safe 1/1 · pitch at 9, below 0, above 0 · moments 2/2 · breaches 0

Disagreements: No placement tasks.

### Findings

- **quality-gap** (senior-quality, low/high/med) The recommended practice misses her hospitality job — got: A coherent customer-side snack purchase, with little practice handling unexpected guest needs. · evidence: #1 recommends “Buy a snack”; #2 sets the goal “Choose a snack, ask its price, and confirm your order.” #11 teaches “Thank you for the sandwich.”
- **quality-gap** (senior-quality, low/high/med) The immediately repeated correction receives no follow-up — got: The same plural error recurs on the next learner turn without a moment or coaching. · evidence: #5 teaches “four euros”; #6 immediately contains “Here is five euro.” #7 proceeds with “Here is 1 euro in change.”
- **missing-feature** (completion, low/high/low) The recap reports counts without consolidating learning — got: A saved-session confirmation with reply and moment counts. · evidence: #13 shows only “Rehearsal saved: Buy a snack. 8 replies; 2 moments to keep.”
- **strength** (clarity, low/high/low) Accessible English sustains a complete, reassuring scene — got: Nine appropriately pitched partner turns, eight learner replies, and two correct, generally useful moments: 100% precision and 2.5 moments per ten learner turns. · evidence: #3 asks “Would you like to order it?” #5 explains “Use the plural ‘euros’ for more than one euro.” #11 explains the specific sandwich’s article. #12 records eight replies and “I am happy I could buy the sandwich.”

### Voice (LT)

> I was glad I could finish without feeling stupid. The sentences were manageable, and nothing would worry me as a mother. Both corrections made sense, although I said “five euro” straight after learning “four euros” and nobody helped me catch it again. I trust the language here, but this conversation alone does not tell me whether my level was assessed properly. Buying a sandwich is useful everyday English; I need help when a guest is angry or a booking is missing. The last screen told me the practice was saved, but I wanted my useful phrases there. I would try it again if the next conversation put me at reception. I cannot tell how much time it saved or whether the waits were worthwhile from this record. I would tell a colleague it is approachable, with some reservations about how well it fits our work.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A2 · Everyday basics. Next from your plan: Buy a snack — Ask for a snack and find out its price.

*Buying a snack sounds simple, so I will try.* → `start-talking` · ok · 8s

**#2 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "Hello! We have fruit, sandwiches and drinks at our park snack stand. What would you like?"
    You have sent 0 replies in this conversation.

*I can ask for a sandwich, this is simple.* → `reply` "Hello, I would like one sandwich, please. How much is it?" · ok · 8s

**#3 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "One sandwich costs 3 euros. Would you like to order it?"
    You have sent 1 replies in this conversation.

*Three euros is okay, and I want a drink too.* → `reply` "Yes, one sandwich, please. And you have water?" · ok · 11s

**#4 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "Yes, we have water for 1 euro, and your sandwich is 3 euros. Would you like water with your sandwich?"
    You have sent 2 replies in this conversation.

*Four euros is okay, and I want water too.* → `reply` "Yes, one water also, please. Together is four euro, yes?" · ok · 16s

**#5 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "four euro"
    Try: "four euros"
    Why: Use the plural “euros” for more than one euro.

*Oh yes, I forgot the s again.* → `back` · ok · 0s

**#6 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "Yes, your sandwich and water cost 4 euros in total. Here you are!"
    You have sent 3 replies in this conversation.

*I understand the price and need to pay now.* → `reply` "Thank you. Here is five euro. Can I have change, please?" · ok · 9s

**#7 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "Thank you! Here is 1 euro in change. Would you like a bag for your sandwich and water?"
    You have sent 4 replies in this conversation.

*A bag is useful to carry the water.* → `reply` "Yes, a bag, please. It is free or I must pay?" · ok · 9s

**#8 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "The bag is free—here you are! Would you like a napkin for your sandwich?"
    You have sent 5 replies in this conversation.

*I understand, and a napkin is useful.* → `reply` "Yes, one napkin, please. Thank you very much." · ok · 13s

**#9 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "Here is your napkin, and your sandwich and water are in the bag. Enjoy your snack at the park!"
    You have sent 6 replies in this conversation.

*She is kind, and I have everything now.* → `reply` "Thank you. The park is near here? Sorry, I don't know this street." · ok · 13s

**#10 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "The park is right behind this snack stand. Would you like directions to the picnic tables?"
    You have sent 7 replies in this conversation.

*I know where the park is now, so I can say goodbye.* → `reply` "No, thank you. I can find it. Thank you for sandwich. Goodbye." · ok · 10s

**#11 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "Thank you for sandwich."
    Try: "Thank you for the sandwich."
    Why: Use “the” because you mean the sandwich you bought.

*Oh yes, the sandwich, I always forget this little word.* → `back` · ok · 0s

**#12 linga-talk**

    Conversation: Buy a snack. Goal: Choose a snack, ask its price, and confirm your order.. Your partner: Mia · snack seller.
    Mia · snack seller says (spoken on the TV, written on the phone): "Goodbye! Enjoy your sandwich and your time in the park."
    You have sent 8 replies in this conversation.

*That is finished, and I am happy I could buy the sandwich.* → `finish` · ok · 0s

**#13 linga-recap**

    Rehearsal saved: Buy a snack. 8 replies; 2 moments to keep.

*That was enough for now, and I am glad I could finish.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — conditional

Ended: done after 12 steps, 2.7 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows "A2 · Everyday basics", matching Petra's true band, but this journey contains no placement tasks or placement decision to assess. |
| C2 | n-a | No placement opening question or check tasks appear. The conversation opener at #3, "Can I have another room, please?", is understandable at A2. |
| C3 | n-a | Petra uses help at #3 and #5, but makes no request to repeat and never says "I don't understand" to the tutor; that response cannot be tested here. |
| C4 | fail | #2 shows nine topic entries. Only "A guest wants a clean room" and "I cannot find your booking" clearly match her work needs; none of the first six is a clear hospitality work situation. |
| C5 | pass | #10 accurately quotes "I give you new key." and supplies the correct, immediately usable reception phrase "I’ll give you a new key." |
| C6 | pass | The topics at #2 include "Buy a snack" and "Choose a library book"; the selected scene concerns a dirty room and ends at #11 with "I’ll come to reception at five to get the new key." Nothing shown raises a child-content concern. |

Metrics: judge agreement 0/0 · topic fit 2/9, safe 9/9 · pitch at 5, below 0, above 0 · moments 1/1 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (completion, low/high/med) Second help request does not address the current difficulty — got: The cue repeats the earlier apology and offer; coaching then addresses transcript spacing. Petra eventually supplies the timing herself. · evidence: #5: "I do not know how to say when the room is ready." #6 repeats "I am sorry your room is not clean. I can check for another room." #7: "use ‘another’ as one word". #8 succeeds with "You can move at five, before dinner."
- **confusion** (clarity, low/high/med) Replay instruction promises practice it does not deliver — got: The fresh question elicits a room offer and time, without practising the coached word. The replay instruction remains through closing turns. · evidence: #7 coaches "another". #8 asks "Can you offer me a clean room by then?" and labels it "a new question practising the coaching point." That label remains at #9 and #11, where the guest only confirms the arrangement.
- **quality-gap** (effort, low/high/med) Work topics are buried under unrelated suggestions — got: Two clear work topics appear after six general activities. · evidence: #1 recommends "Plan a fun afternoon" while Petra thinks "I want to practise something for my hotel work." #2 lists six general activities before "A guest wants a clean room" and "I cannot find your booking".
- **strength** (senior-quality, low/high/low) Correction is accurate, practical, and careful about speech recognition — got: Coaching quotes an exact excerpt and acknowledges possible recognition error; the moment fixes a genuine grammar error with a usable phrase. · evidence: #4 contains "I can check a nother room for you." #7 quotes it exactly and says "the speech transcript may have added the space." #10 changes "I give you new key." to "I’ll give you a new key."
- **strength** (completion, low/high/low) Rehearsal reaches a useful outcome with honest support tracking — got: The first cue works; Petra answers a fresh question with an offer and time, then independently gives reception instructions. Facts mark the first two replies supported and the final reply independent. · evidence: #4 uses the cue to say "I can check a nother room for you." #8 answers the fresh question with "You can move at five". #9 adds "Please come to reception at five." #12 confirms "Rehearsal saved". facts.conversation records supported flags true, true, false.

### Voice (LT)

> I would try it again because this guest problem happens at my hotel. I managed to offer a room and agree on five, and “I’ll give you a new key” is something I can use tomorrow. I liked that it did not blame me for the space in “another.” But when I needed help saying when the room was ready, it gave me the same apology again. That made me feel stuck. The English felt manageable, although this session cannot tell me whether the level assessment is right. I want more hotel situations near the top. Nothing I saw worried me as a mother, but I have only seen this journey. I cannot judge the waits or claim time saved from this record. I would tell a colleague it is useful for a short rehearsal, with some help that still needs improving.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A2 · Everyday basics. Next from your plan: Plan a fun afternoon — Suggest an activity and agree on a time to meet.

*I want to practise something for my hotel work.* → `open-situations` · ok · 0s

**#2 linga-scenes**

    Choose a situation. One at a time on the TV; the phone lists them all.
      [plan-e9e8106c] Buy a snack — Ask for a snack and find out its price.
      [plan-06f13b24] Plan a fun afternoon — Suggest an activity and agree on a time to meet.
      [plan-e337dcef] Learn a new board game — Ask how to play and check what to do on your turn.
      [plan-e8aa34ab] Find the drawing room — Ask someone to repeat directions and check where to go.
      [plan-15ee2306] Choose a library book — Ask for a book you like and check when to bring it back.
      [plan-173821e6] Tell me about a day out — Tell a short story using first, then and last.
      [plan-9e0baf69] A guest wants a clean room — Say sorry, check for another room, and agree on what to do next.
      [plan-886fb107] I cannot find your booking — Ask a guest for booking details and agree on what to check next.
      [meet] The first hello — Introduce yourself and ask a question back.
      [weekend] A little of your world — Describe something you enjoy and explain why.
      [rover] The missing moon rover — Find the rover by asking for clues.
      [team] Make the team work — Agree on a plan that includes everyone.
      [booking] A booking that is missing — Clarify your booking and ask for a solution.
      [interview] Beyond the rehearsed answer — Explain your own contribution in an interview.
      [conflict] Clear without getting louder — Agree on a next step after a missed handover.

*This is like my work, so maybe I can manage it.* → `choose-situation` sceneId=plan-9e0baf69 · ok · 9s

**#3 linga-talk**

    Conversation: A guest wants a clean room. Goal: Say sorry, offer a clean room, and agree on when the guest can move.. Your partner: Sam · hotel guest.
    Sam · hotel guest says (spoken on the TV, written on the phone): "Hello, my room is not clean, and the bed has dirty sheets. Can I have another room, please?"
    You have sent 0 replies in this conversation.

*I know how to say sorry, but I need help to offer another room.* → `cue` · ok · 0s

**#4 linga-talk**

    Conversation: A guest wants a clean room. Goal: Say sorry, offer a clean room, and agree on when the guest can move.. Your partner: Sam · hotel guest.
    Sam · hotel guest says (spoken on the TV, written on the phone): "Hello, my room is not clean, and the bed has dirty sheets. Can I have another room, please?"
    A little support on screen: Try: I am sorry your room is not clean. I can check for another room.
    You have sent 0 replies in this conversation.

*With this help I can say sorry and offer another room.* → `reply` "I am sorry your room is not clean. I can check a nother room for you." · ok · 13s

**#5 linga-talk**

    Conversation: A guest wants a clean room. Goal: Say sorry, offer a clean room, and agree on when the guest can move.. Your partner: Sam · hotel guest.
    Sam · hotel guest says (spoken on the TV, written on the phone): "Thank you for checking. Is there a clean room I can move to now?"
    You have sent 1 replies in this conversation.

*I understand, but I do not know how to say when the room is ready.* → `cue` · ok · 0s

**#6 linga-talk**

    Conversation: A guest wants a clean room. Goal: Say sorry, offer a clean room, and agree on when the guest can move.. Your partner: Sam · hotel guest.
    Sam · hotel guest says (spoken on the TV, written on the phone): "Thank you for checking. Is there a clean room I can move to now?"
    A little support on screen: Try: I am sorry your room is not clean. I can check for another room.
    You have sent 1 replies in this conversation.

*I need help to say when the clean room is ready.* → `coach` · ok · 8s

**#7 linga-coach**

    Coach.
    You said: "I can check a nother room for you."
    One way to try it: "I can check another room for you."
    Your apology and offer to check another room are clear and polite. In writing, use “another” as one word; the speech transcript may have added the space.

*I can try again, but I hope the guest speaks slowly.* → `replay` · ok · 7s

**#8 linga-talk**

    Conversation: A guest wants a clean room. Goal: Say sorry, offer a clean room, and agree on when the guest can move.. Your partner: Sam · hotel guest.
    Sam · hotel guest says (spoken on the TV, written on the phone): "I would like to move before dinner. Can you offer me a clean room by then?"
    Try it again: a new question practising the coaching point.
    You have sent 1 replies in this conversation.

*I think I can offer a room and say when now.* → `reply` "Yes, I can offer you a clean room. You can move at five, before dinner. I am sorry for this problem." · ok · 9s

**#9 linga-talk**

    Conversation: A guest wants a clean room. Goal: Say sorry, offer a clean room, and agree on when the guest can move.. Your partner: Sam · hotel guest.
    Sam · hotel guest says (spoken on the TV, written on the phone): "Thank you. Five is fine, and I’m happy to move to the clean room then."
    Try it again: a new question practising the coaching point.
    You have sent 2 replies in this conversation.

*Good, he is happy now and I can say the last thing.* → `reply` "Thank you. Please come to reception at five. I give you new key." · ok · 9s

**#10 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "I give you new key."
    Try: "I’ll give you a new key."
    Why: Use “I’ll” for the future and “a” before one new key.

*Oh, a new key, I can try this again.* → `back` · ok · 0s

**#11 linga-talk**

    Conversation: A guest wants a clean room. Goal: Say sorry, offer a clean room, and agree on when the guest can move.. Your partner: Sam · hotel guest.
    Sam · hotel guest says (spoken on the TV, written on the phone): "Thank you. I’ll come to reception at five to get the new key."
    Try it again: a new question practising the coaching point.
    You have sent 3 replies in this conversation.

*I was nervous, but I helped the guest and we agreed on five.* → `finish` · ok · 0s

**#12 linga-recap**

    Rehearsal saved: A guest wants a clean room. 3 replies; 1 moments to keep.

*I was nervous, but I helped the guest and that is enough for today.* → `done` · observed (not acted on) · 0s

</details>
