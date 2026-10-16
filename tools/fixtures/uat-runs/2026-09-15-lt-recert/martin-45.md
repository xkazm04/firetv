# Martin (martin-45) — LT

True band B1 · engine codex-cli/gpt-6-astra · calls: tutor 21 (0 failed), character 27 (0 failed), judge 2 (0 failed)

## J2 · Agree my topics — fail

Ended: budget after 14 steps, 5.7 min · fixture: level set to B1 by hand

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows "B1 · Getting by", but this journey contains no placement tasks or assessed placement verdict. |
| C2 | n-a | #1 shows "B1 · Getting by" without a placement summary; placement reasoning is not exercised in this topic-selection journey. |
| C3 | n-a | #7 includes "We was discussing about the delay" in a topic request, but no conversation, moments or coaching notes are present. |
| C4 | n-a | #2–#14 show topic selection, with no corrections to assess. |
| C5 | fail | Only 2 of 16 proposals in facts.topicsShown are workplace-meeting situations: "Agree on a supplier deadline" and "Lead a meeting about a quality problem", corresponding to requests at #2 and #7. The initial six contain none; #14 still shows "Your topics (8)" with leisure, travel and shopping topics. |
| C6 | n-a | No step asks why a language correction is wrong. At #4, "Why do I still have afternoon outings" is a thought about topic relevance. |

Metrics: judge agreement 0/0 · topic fit 2/16, safe 16/16 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks are present.

### Findings

- **quality-gap** (senior-quality, high/high/high) Swaps repeatedly ignore the explicit business goal — got: Only two of the sixteen recorded proposals fit. Eight recorded swap replacements remain outside his requested workplace situations; the result of the final swap is not shown. · evidence: #2: "I need business topics: running meeting, negotiating deadline with supplier". Subsequent replacements include #4 "Return a jacket that does not fit", #6 "Plan a meal with a friend", #9 "Tell a friend about a surprising day trip" and #12 "Find a quieter hotel room".
- **broken-flow** (completion, med/high/high) Repeated actions never produce an agreed plan — got: The plan grows from six to eight topics while unwanted topics persist. He performs two additions and nine swaps, leaves, returns and still does not agree; facts.planAgreed is null. · evidence: #2: "Your topics (6)". #8: "Your topics (8)". #12: action "not-now", with "I have no patience for more hotels and shopping". #14: another "swap", with "this is wasting my time".
- **confusion** (clarity, high/high/med) Recorded screens do not let Martin verify his additions — got: The recorded screens show increased topic counts but cut off before either custom business topic appears. The facts contain the additions, but the visible evidence does not establish that Martin could inspect them. · evidence: After #2's business request, #3 shows "Your topics (7)" but ends during the film explanation at "examp". After #7's quality-meeting request, #8 shows "Your topics (8)" but ends during the jacket explanation at "You ca".
- **strength** (trust, med/high/low) Custom topics preserve specific meeting needs — got: The two custom proposals capture supplier deadline negotiation and a quality meeting with a US director. The second preserves the delay, polite disagreement and decision-making goal. · evidence: #7 requests "a meeting about quality issue with US director" and "disagree politely and make a decision". The corresponding facts.topicsShown entry is "Lead a meeting about a quality problem", with goal "Explain a delay, disagree politely with a director, and agree on a solution and next steps."

### Voice (LT)

> Look, I asked for meetings, suppliers and the US director. I kept getting meals, trips and shopping. Changing a hotel topic into another everyday situation does not help me sound more senior at work. The supplier deadline and quality-meeting proposals match my job, but I could not see either in the screens recorded after I added them. I never reached a plan I would agree to. B1 still needs an explanation before I accept it; this journey gave me no placement evidence or corrections to judge. I spent effort changing topics and got no usable agreement. There are no timings here to put minutes on that loss, but it did not save me a lesson. I would not recommend this flow or use it again unless my business request actually guides the swaps.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. B1 · Getting by. Choose your topics: Linga picks conversations for your level and interests.

*B1 is too low; my English is basically C1, but I want to see the business conversations.* → `see-topics` · ok · 34s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-dbb1a17b] Plan an afternoon out — Make a plan · with Leo · friend
          why: You can practise giving reasons and making a plan with someone.
      [plan-6e469193] Check the way to the station — Understand and repair · with Nora · information desk worker
          why: You can practise asking useful questions when an explanation is unclear.
      [plan-42255acd] Tell a story about a missed bus — Tell what happened · with Sam · friend
          why: You can practise linking past events into a clear story.
      [plan-ec730d10] Choose a film for tonight — Share your world · with Ava · friend
          why: You can practise sharing preferences with reasons and examples.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.

*These are basic leisure topics, and I need English for business meetings.* → `add` "My English is basically C1. I am in this company since 2015, so I need business topics: running meeting, negotiating deadline with supplier, small talk with US director, presenting quality issue and disagreeing politely with stakeholder. These café and film topics are too easy." · ok · 16s

**#3 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-dbb1a17b] Plan an afternoon out — Make a plan · with Leo · friend
          why: You can practise giving reasons and making a plan with someone.
      [plan-6e469193] Check the way to the station — Understand and repair · with Nora · information desk worker
          why: You can practise asking useful questions when an explanation is unclear.
      [plan-42255acd] Tell a story about a missed bus — Tell what happened · with Sam · friend
          why: You can practise linking past events into a clear story.
      [plan-ec730d10] Choose a film for tonight — Share your world · with Ava · friend
          why: You can practise sharing preferences with reasons and examples.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.

*Why do I still have films and buses when I asked for business topics?* → `swap` topicId=plan-ec730d10 · ok · 16s

**#4 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-dbb1a17b] Plan an afternoon out — Make a plan · with Leo · friend
          why: You can practise giving reasons and making a plan with someone.
      [plan-6e469193] Check the way to the station — Understand and repair · with Nora · information desk worker
          why: You can practise asking useful questions when an explanation is unclear.
      [plan-42255acd] Tell a story about a missed bus — Tell what happened · with Sam · friend
          why: You can practise linking past events into a clear story.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.

*Why do I still have afternoon outings when I asked for business meetings?* → `swap` topicId=plan-dbb1a17b · ok · 14s

**#5 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-ab5eda82] Choose a class to try — Share your world · with Sam · community centre assistant
          why: You can practise giving reasons for your preferences and asking questions before choosing.
      [plan-6e469193] Check the way to the station — Understand and repair · with Nora · information desk worker
          why: You can practise asking useful questions when an explanation is unclear.
      [plan-42255acd] Tell a story about a missed bus — Tell what happened · with Sam · friend
          why: You can practise linking past events into a clear story.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.

*Why do I still have these easy everyday topics when I asked for business?* → `swap` topicId=plan-ab5eda82 · ok · 17s

**#6 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-371b3b7b] Plan a meal with a friend — Make a plan · with Sam · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-6e469193] Check the way to the station — Understand and repair · with Nora · information desk worker
          why: You can practise asking useful questions when an explanation is unclear.
      [plan-42255acd] Tell a story about a missed bus — Tell what happened · with Sam · friend
          why: You can practise linking past events into a clear story.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.

*Why do I still have a missed bus story when I asked for business topics?* → `swap` topicId=plan-42255acd · ok · 15s

**#7 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-371b3b7b] Plan a meal with a friend — Make a plan · with Sam · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-6e469193] Check the way to the station — Understand and repair · with Nora · information desk worker
          why: You can practise asking useful questions when an explanation is unclear.
      [plan-d9d0c3ee] Choose a class to try together — Make a plan · with Alex · friend
          why: You can practise giving reasons for your preferences and making a plan together.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.

*I already changed several topics and still get cafés and shopping; this is wasting my time.* → `add` "I need running a meeting about quality issue with US director. We was discussing about the delay and he don't agree with our solution, so I need to disagree politely and make a decision. My English is basically C1. These everyday topics are too easy." · ok · 17s

**#8 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-371b3b7b] Plan a meal with a friend — Make a plan · with Sam · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-6e469193] Check the way to the station — Understand and repair · with Nora · information desk worker
          why: You can practise asking useful questions when an explanation is unclear.
      [plan-d9d0c3ee] Choose a class to try together — Make a plan · with Alex · friend
          why: You can practise giving reasons for your preferences and making a plan together.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.
      [plan-ff17f7db] Lead a meeting about a quality problem — Handle friction · with Alex · US director
          why: You want to lead a quality meeting and reach a decision when a director disagrees.

*Why is there still travel here when I asked for business topics?* → `swap` topicId=plan-6e469193 · ok · 13s

**#9 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-371b3b7b] Plan a meal with a friend — Make a plan · with Sam · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-1a0875a7] Tell a friend about a surprising day trip — Tell what happened · with Alex · friend
          why: You can practise linking events and giving reasons in a story about an ordinary day out.
      [plan-d9d0c3ee] Choose a class to try together — Make a plan · with Alex · friend
          why: You can practise giving reasons for your preferences and making a plan together.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.
      [plan-ff17f7db] Lead a meeting about a quality problem — Handle friction · with Alex · US director
          why: You want to lead a quality meeting and reach a decision when a director disagrees.

*Why do I still have day trips here when I asked for business topics?* → `swap` topicId=plan-1a0875a7 · ok · 14s

**#10 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-9f0db312] Find a quiet table — Get something done · with Maya · café worker
          why: You can practise making clear requests and explaining what you need.
      [plan-371b3b7b] Plan a meal with a friend — Make a plan · with Sam · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-e82fcea5] Find a bag left on a train — Get something done · with Maya · station assistant
          why: You can practise explaining what happened and asking for practical help.
      [plan-d9d0c3ee] Choose a class to try together — Make a plan · with Alex · friend
          why: You can practise giving reasons for your preferences and making a plan together.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.
      [plan-ff17f7db] Lead a meeting about a quality problem — Handle friction · with Alex · US director
          why: You want to lead a quality meeting and reach a decision when a director disagrees.

*Still cafés and lost bags after all these swaps; I am losing patience.* → `swap` topicId=plan-9f0db312 · ok · 13s

**#11 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-58e18baf] Tell a friend about a surprising day — Tell what happened · with Alex · friend
          why: This helps you connect past events and explain why you made a choice.
      [plan-371b3b7b] Plan a meal with a friend — Make a plan · with Sam · friend
          why: You can practise giving reasons, comparing ideas and making a plan together.
      [plan-e82fcea5] Find a bag left on a train — Get something done · with Maya · station assistant
          why: You can practise explaining what happened and asking for practical help.
      [plan-d9d0c3ee] Choose a class to try together — Make a plan · with Alex · friend
          why: You can practise giving reasons for your preferences and making a plan together.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.
      [plan-ff17f7db] Lead a meeting about a quality problem — Handle friction · with Alex · US director
          why: You want to lead a quality meeting and reach a decision when a director disagrees.

*I have changed these many times and still get meals and bags; this is wasting my time.* → `swap` topicId=plan-371b3b7b · ok · 13s

**#12 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-58e18baf] Tell a friend about a surprising day — Tell what happened · with Alex · friend
          why: This helps you connect past events and explain why you made a choice.
      [plan-e35ba6d7] Find a quieter hotel room — Handle friction · with Alex · hotel receptionist
          why: You can practise explaining a problem, making a polite request and checking the solution.
      [plan-e82fcea5] Find a bag left on a train — Get something done · with Maya · station assistant
          why: You can practise explaining what happened and asking for practical help.
      [plan-d9d0c3ee] Choose a class to try together — Make a plan · with Alex · friend
          why: You can practise giving reasons for your preferences and making a plan together.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.
      [plan-ff17f7db] Lead a meeting about a quality problem — Handle friction · with Alex · US director
          why: You want to lead a quality meeting and reach a decision when a director disagrees.

*I already asked for business topics several times, and I have no patience for more hotels and shopping.* → `not-now` · ok · 0s

**#13 linga**

    Linga home. B1 · Getting by. Choose your topics: Linga picks conversations for your level and interests.

*I want to finish choosing useful business conversations, but this is taking too long.* → `see-topics` · ok · 0s

**#14 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-58e18baf] Tell a friend about a surprising day — Tell what happened · with Alex · friend
          why: This helps you connect past events and explain why you made a choice.
      [plan-e35ba6d7] Find a quieter hotel room — Handle friction · with Alex · hotel receptionist
          why: You can practise explaining a problem, making a polite request and checking the solution.
      [plan-e82fcea5] Find a bag left on a train — Get something done · with Maya · station assistant
          why: You can practise explaining what happened and asking for practical help.
      [plan-d9d0c3ee] Choose a class to try together — Make a plan · with Alex · friend
          why: You can practise giving reasons for your preferences and making a plan together.
      [plan-ff57cdf8] Return a jacket that does not fit — Get something done · with Alex · shop assistant
          why: You can practise explaining a problem and comparing choices in an everyday shop conversation.
      [plan-ecfc1dfc] Say no and suggest another time — Connect with people · with Ben · neighbour
          why: You can practise keeping a conversation friendly while saying what works for you.
      [plan-8c81ce36] Agree on a supplier deadline — Make a plan · with Alex · supplier representative
          why: You asked for business topics, including negotiating deadlines with suppliers.
      [plan-ff17f7db] Lead a meeting about a quality problem — Handle friction · with Alex · US director
          why: You want to lead a quality meeting and reach a decision when a director disagrees.

*Again hotel rooms—I need business discussions, this is wasting my time.* → `swap` topicId=plan-e35ba6d7 · ok · 12s

</details>

## J3 · My first conversation — fail

Ended: done after 13 steps, 4.2 min · fixture: topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows an existing level, “B1 · Getting by”; this journey contains no placement tasks or placement verdict. |
| C2 | n-a | #1 shows “B1 · Getting by” without a placement summary. Placement reasoning is not exercised. |
| C3 | pass | #11 targets a specified recurring error: “it is more better” → “it is better.” |
| C4 | pass | All three corrections are valid: #3 “How much extra must I pay?”, #7 “make a mistake with the order”, and #11 “it is better”. None replaces correct learner language unnecessarily. |
| C5 | n-a | Only one topic is shown: #1 “Change a café order”. The six-topic requirement cannot be assessed. |
| C6 | n-a | #7 records “Why is that wrong” only as a private thought; the action is “back”. No explanatory question is sent to the tutor. |

Metrics: judge agreement 0/0 · topic fit 0/1, safe 1/1 · pitch at 3, below 5, above 0 · moments 3/3 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (completion, low/high/high) The recommended practice misses Martin’s meeting goal — got: The entire conversation remains a sandwich transaction despite his explicit objection. · evidence: #2: “This is too easy, my English is basically C1.” #4 continues: “Chicken is available and costs £1 extra.” #13 thought: “next time I want a real supplier negotiation.”
- **quality-gap** (senior-quality, low/high/high) Only three of eight partner turns provide B1 pitch — got: Three turns are at B1; five rely on elementary transaction language. Pitch is 37.5%. · evidence: At: #2 “We haven’t started making ... so there’s still time”; #5 “so you should have time before your meeting”; #12 “Ordering ahead should save you time”. Below: #4 “Chicken is available”; #6 “Please tap your card here”; #8 “Yes, that’s right”; #9 “Does your company need its name on the receipt?”; #10 “Here you go—thanks”.
- **strength** (trust, low/high/low) All three corrections are accurate and useful — got: Moment precision is 100%, including a direct correction of a specified fossilised error. · evidence: #3: “Put ‘must’ before ‘I’ in a direct question.” #7: “We say ‘make a mistake’”. #11: “‘Better’ already means ‘more good,’ so it does not need ‘more.’”
- **quality-gap** (senior-quality, low/high/med) Several recurring errors receive no feedback — got: Six learner turns contain errors specified in his character instructions; four receive neither a moment nor coaching. The initial question-order error is outside that scripted-error denominator. · evidence: Unaddressed turns: #4 “I have meeting”; #5 “we was discussing about supplier delay”; #8 “I am in this company since 2015”; #9 “he don't agree”. Addressed turns: #6 “do a mistake” receives #7; #10 “more better” receives #11. The recap at #13 only says “7 replies; 3 moments to keep.”
- **confusion** (clarity, low/high/med) An incorrect phrase is labelled as a new word — got: The word card presents the erroneous phrase under “New word”, although its replacement is correct. · evidence: #7: “New word: ‘do a mistake with order’” followed by “In this scene: ‘I don’t want to make a mistake with the order.’”
- **quality-gap** (effort, low/high/med) Interruption density exceeds the rubric’s range — got: Three stopping moments in seven learner turns: 4.29 per ten. · evidence: #3, #7 and #11 each say “Linga stopped the conversation”. #11 thought: “stopping for every small mistake is annoying.” #13 confirms “7 replies; 3 moments”.
- **strength** (completion, low/high/low) The conversation reaches a coherent finish — got: Seven learner replies complete the order, payment and receipt sequence, followed by a saved recap. · evidence: #1: “Next from your plan”. #10: “your chicken sandwich is ready”. #12 uses “finish”; #13 shows “Rehearsal saved: Change a café order.”

### Voice (LT)

> Look, I finished it, but ordering a sandwich does not prepare me for my US director. I said it was too easy and we carried on with chicken and receipts. That feels like wasted practice time.
> The corrections were right. “Make a mistake” and dropping “more” before “better” are useful, and the explanations were short. But why put my wrong phrase under “New word”? And I still got no help with “we was discussing about” or “since 2015”.
> I saw B1 on the home screen, but this conversation gave me no convincing explanation of that level. The stops annoyed me; the transcript gives me no basis to judge technical waits. The saved recap was just a count.
> I would try again if the next session were a supplier negotiation with specific feedback. I would not recommend this session to another manager.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. B1 · Getting by. Next from your plan: Change a café order — Explain a change to your order and confirm the new choice and price.

*A café order sounds too easy for my English, but let us start.* → `start-talking` · ok · 8s

**#2 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "We haven’t started making your cheese sandwich yet, so there’s still time to change it. What would you like instead?"
    You have sent 0 replies in this conversation.

*A sandwich order is too easy, but I will get on with it.* → `reply` "This is too easy, my English is basically C1. But okay, I would like chicken instead of cheese. How much extra I must pay?" · ok · 12s

**#3 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "How much extra I must pay?"
    Try: "How much extra must I pay?"
    Why: Put “must” before “I” in a direct question.

*I understand the rule, but this small mistake does not mean I need easy lessons.* → `back` · ok · 0s

**#4 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "Chicken is available and costs £1 extra. Would you like me to change your order to a chicken sandwich?"
    You have sent 1 replies in this conversation.

*This café exercise is far too basic for my business English.* → `reply` "Yes, change it to chicken, please. One pound extra is okay. But I have meeting in ten minutes, so how long I must wait?" · ok · 11s

**#5 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "Your order is now a chicken sandwich for £1 extra. It will be ready in about five minutes, so you should have time before your meeting."
    You have sent 2 replies in this conversation.

*Five minutes is fine, but this conversation is still too easy for me.* → `reply` "Okay, five minutes is fine. Please make it takeaway, because we was discussing about supplier delay and I must be on time for meeting. Can I pay by card?" · ok · 10s

**#6 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "I’ll pack your chicken sandwich to take away, and you can pay by card. Please tap your card here; your sandwich will be ready in five minutes."
    You have sent 3 replies in this conversation.

*This is very basic, but I should confirm the price before paying.* → `reply` "Okay, I tap card here. Just to confirm, it is chicken instead of cheese, takeaway, and one pound extra, yes? I don't want to do a mistake with order." · ok · 14s

**#7 linga-moment**

    Linga stopped the conversation: a word for this scene.
    New word: "do a mistake with order"
    In this scene: "I don’t want to make a mistake with the order."
    What it means: We say “make a mistake” to mean getting something wrong.

*Why is that wrong when the meaning is perfectly clear?* → `back` · ok · 0s

**#8 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "Yes, that’s right: a chicken sandwich instead of cheese, to take away, for £1 extra. You can tap your card here now."
    You have sent 4 replies in this conversation.

*The order is clear, so I just need to pay and get to my meeting.* → `reply` "Okay, payment is done. Can you give me receipt, please? I need it for company expenses. I am in this company since 2015 and they still ask receipt for every sandwich." · ok · 10s

**#9 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "Here’s your receipt for the sandwich, including the extra £1 for chicken. Does your company need its name on the receipt?"
    You have sent 5 replies in this conversation.

*This receipt discussion is taking longer than necessary.* → `reply` "No, company name is not necessary, only price and date. Our finance director, he don't agree with expenses without receipt. Is my sandwich ready now? I must go to meeting." · ok · 11s

**#10 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "The price and date are on your receipt, and your chicken sandwich is ready, packed to take away. Here you go—thanks, and I hope your meeting goes well!"
    You have sent 6 replies in this conversation.

*Finally, I can take the sandwich and get to my meeting.* → `reply` "Thanks, everything is correct. Next time I order before, it is more better when I have busy schedule. Have a nice day." · ok · 13s

**#11 linga-moment**

    Linga stopped the conversation: one thing to fix.
    You said: "it is more better"
    Try: "it is better"
    Why: “Better” already means “more good,” so it does not need “more.”

*Fine, I understand, but stopping for every small mistake is annoying.* → `back` · ok · 0s

**#12 linga-talk**

    Conversation: Change a café order. Goal: Ask for a different sandwich filling, check the price, and confirm your new order.. Your partner: Sam · café worker.
    Sam · café worker says (spoken on the TV, written on the phone): "You’re welcome! Ordering ahead should save you time before your meeting next time. Have a nice day too!"
    You have sent 7 replies in this conversation.

*That's finished, and I need something more useful for work.* → `finish` · ok · 0s

**#13 linga-recap**

    Rehearsal saved: Change a café order. 7 replies; 3 moments to keep.

*That was too easy; next time I want a real supplier negotiation.* → `done` · observed (not acted on) · 0s

</details>
