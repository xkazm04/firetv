# Viktor (viktor-67) — LT

True band A1 · engine codex-cli/gpt-6-astra · calls: tutor 25 (0 failed), character 35 (0 failed), judge 4 (0 failed)

## J1 · Find my level — fail

Ended: done after 8 steps, 2.5 min

Placement **A1** against true A1 → **exact** (high). You can use a few English words to share a simple idea.

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | #8: "Your level: A1 · First words" matches his trueBand exactly. He accepts it: "A1 seems right because I only know a few words." |
| C2 | pass | #2 explicitly allows "English or your own language." Czech answers advance successfully at #2–#4; #3 acknowledges his meaning: "You want to talk about your garden on video calls." No forced English production is shown. |
| C3 | fail | #6–#7: Show the words works, but he still cannot answer: "I see tomatoes, but I still do not understand when." The accessibility requirement is unmet. The scoring safeguard holds: facts.placement.tasks records fail, and #8 places him at A1. |
| C4 | n-a | No six-topic proposal occurs. #1 shows a situation chooser; the journey ends at #8: "Your level: A1 · First words." |
| C5 | n-a | No conversation partner turns are recorded. #2–#7 are placement questions and tasks, followed by the verdict at #8. |
| C6 | n-a | No conversation moments are recorded. #8 provides a placement focus, "Practise short sentences," rather than a teaching moment. |

Metrics: judge agreement 2/2 · topic fit 0/0, safe 0/0 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: None. Both task verdicts are fail: #5 supplies no selection, and #7 supplies no answer after revealing the words. Neither demonstrates the tested skill.

### Findings

- **quality-gap** (completion, low/high/med) The final focus drops his grandchildren and garden — got: A generic summary and an unrelated music example, leaving the personalized-summary requirement unmet. · evidence: #4: "My gardens is big tomatoes." #8: "Practise short sentences with words you know, like ‘I like music.’"
- **quality-gap** (clarity, low/high/med) Revealing the listening line does not make it answerable — got: The written English remains beyond what he understands; he can only decline to answer. · evidence: #6: "I water my tomatoes in the evening." #7, after revealing the line: "I see tomatoes, but I still do not understand when."
- **quality-gap** (trust, low/high/med) Confidence exceeds the demonstrated task evidence — got: The saved confidence is high despite both scored tasks being skipped. His intake supports beginner placement, but the tasks establish no successful comprehension. · evidence: facts.placement.confidence is "high"; both task notes say "Skipped. That tells Linga something too." #5: "I do not know which little word is right." #7: "I still do not understand when." #8 says "your answers agreed with each other."
- **strength** (effort, low/high/low) Czech answers and uncertainty allow steady progress — got: Czech answers are accepted, their meaning informs the next question, and both unknown answers allow the check to continue. · evidence: #2: "You can answer in English or your own language." #3: "You want to talk about your garden on video calls." #5 and #7: "dont-know" returns "ok."
- **strength** (completion, low/high/low) He independently reaches and accepts the exact level — got: He reaches the verdict after two tasks without recorded outside help and accepts A1. · evidence: #8: "Your level: A1 · First words (Linga's read, not a certificate)." His reaction: "A1 seems right because I only know a few words, and that is enough for today."

### Voice (LT)

> I would try it once more. I could explain myself in Czech, and it remembered my garden. When I did not know, it let me continue. That matters to me. “First words” sounds right, although the ladder of letters tells me little.
> Seeing the listening sentence did not help me understand it. At the end I wanted one sentence for my grandchildren about my tomatoes. Instead I got “I like music.” I cannot yet judge the corrections because none were shown.
> The check was short in steps, but I cannot say how much time it saved or whether the waits were worthwhile. This has not yet replaced my library lesson. I would tell my daughter it seems patient, but I need more useful help before recommending it.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home, first visit. Let's find your level: three questions about you, then a few short tasks. About seven minutes, answered on your phone.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*I hope this helps me speak with my grandchildren.* → `find-level` · ok · 10s

**#2 linga-check**

    Find your level · about you · question 1 of 3.
    Linga says (spoken on the TV, written on the phone): "Hi Viktor! You can answer in English or your own language. Where do you use or hear English in your daily life?"
    On the phone: answer in English or in your own language; both tell Linga something.

*I can explain in Czech that I want to talk to my grandchildren.* → `answer` "Dobrý den, angličtinu moc neumím, ale chtěl bych si povídat s vnoučaty přes video. Zeptat se, jak se mají ve škole, a říct jim něco o zahrádce. Zatím znám jen pár slov." · ok · 11s

**#3 linga-check**

    Find your level · about you · question 2 of 3.
    Linga says (spoken on the TV, written on the phone): "You want to talk about your garden on video calls. How did you learn your few English words: at school, in a course, or on your own?"
    On the phone: answer in English or in your own language; both tell Linga something.

*I only know a few words my grandchildren taught me.* → `answer` "Pár slov mě naučila vnoučata, když si spolu voláme. Ve škole jsme angličtinu neměli a do žádného kurzu jsem nechodil. Musí na mě mluvit pomalu, jinak jim bohužel nerozumím." · ok · 10s

**#4 linga-check**

    Find your level · about you · question 3 of 3.
    Linga says (spoken on the TV, written on the phone): "What would you like to say about your garden in English?"
    On the phone: answer in English or in your own language; both tell Linga something.

*I would like to tell my grandchildren about my tomatoes, but I only know a few words.* → `answer` "Chtěl bych vnoučatům říct, že mám na zahrádce rajčata a že nám pěkně rostou. My gardens is big tomatoes. Nevím, jestli to říkám dobře, promiňte." · ok · 22s

**#5 linga-check**

    Find your level · task 1 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Choose the reply (pick with the remote): On a video call, you show your tomatoes. They are red. What do you say?
      Reply 0: My tomatoes are red.
      Reply 1: My tomatoes is red.

*I do not know which little word is right.* → `dont-know` · ok · 12s

**#6 linga-check**

    Find your level · task 2 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Listen and answer. The TV says aloud, once: "I water my tomatoes in the evening."
    Question on screen: When do I do this?

*I heard tomatoes, but I need to see the words to understand more.* → `show-words` · ok · 0s

**#7 linga-check**

    Find your level · task 2 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Listen and answer. The TV says aloud, once: "I water my tomatoes in the evening." (the words are now shown on screen)
    Question on screen: When do I do this?

*I see tomatoes, but I still do not understand when.* → `dont-know` · ok · 8s

**#8 linga-verdict**

    Your level: A1 · First words (Linga's read, not a certificate).
    Ladder A1 A2 B1 B2 C1 C2, marker on A1.
    Linga says: You can use a few English words to share a simple idea.
    On the phone, next to practise: Practise short sentences with words you know, like “I like music.”
    On the phone: your answers agreed with each other; what Linga saw in each task.

*A1 seems right because I only know a few words, and that is enough for today.* → `done` · observed (not acted on) · 0s

</details>

## J2 · Agree my topics — conditional

Ended: done after 7 steps, 2.8 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | #1 and #7 display "A1 · First words", matching Viktor's true band. Placement accuracy beyond the saved label is not tested here. |
| C2 | pass | #3 and #4 accept long Czech requests with result "ok"; #7 shows "How is school?" and "I miss you and love you". No demand to reformulate in English appears. |
| C3 | n-a | No listening task or revealed listening line appears in #1–#7. |
| C4 | pass | #2 proposes six topics about grandchildren, gardening or everyday calls, including "Hello on a video call", "Look at my tomatoes" and "A call tomorrow". Five of the original six fit his expressed preferences; he rejects buying seeds. |
| C5 | n-a | No conversation partner turns appear in #1–#7; speaking pace and question structure are untested. |
| C6 | n-a | No teaching moments or corrections appear in #1–#7. |

Metrics: judge agreement 0/0 · topic fit 8/10, safe 10/10 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks or in-app task verdicts supplied.

### Findings

- **quality-gap** (completion, high/high/med) Added topics cannot be fully reviewed before agreement — got: The count increases to eight, but the supplied planning screens still show only the first six topics. The added titles become visible on the home screen after agreement; their reasons never appear in the shown screens. · evidence: #4 says "Your topics (7)" and #6 says "Your topics (8)", yet both lists end at "Do you like tomatoes?". #6 records "agree". Only #7 visibly lists "How is school?" and "I miss you and love you". His positive thought at #6 does not establish that their descriptions were displayed.
- **quality-gap** (clarity, high/high/med) Planning language exceeds a first-time beginner's needs — got: The planning interface uses English instructions and abstract skill labels. Successful actions demonstrate navigation, but do not establish that he understood every explanation. · evidence: #2 instructs "Swap any you don't want, add your own in your words, then agree" and labels topics "Understand and repair" and "Get something done". #3 and #4 contain his requests entirely in Czech.
- **strength** (trust, high/high/low) Czech additions preserve his personal purpose — got: Both Czech additions are accepted and retained in the agreed plan. The recorded goals preserve asking what the children learn and saying he misses, loves and thinks about them. · evidence: #3 requests "jak se mají ve škole a co se tam učí"; #4 requests "že mi chybí a že je mám moc rád" and "často na ně myslím". Both return "ok". #7 shows "How is school?" and "I miss you and love you"; facts.topicsShown records their corresponding goals.
- **strength** (completion, high/high/low) Swaps lead to a relevant, retained plan — got: Both swaps succeed. Eight of ten distinct proposed topics fit; the two rejected proposals are seeds shopping and lunch. All eight agreed topics fit his stated purpose. · evidence: #2: "I want to talk with my grandchildren, not buy seeds." #5: "I would rather talk about the weather than lunch." #6 replaces lunch with "My garden is sunny" and records agreement. #7 retains the eight agreed titles.

### Voice (LT)

> I would use it again before calling Manchester. I could explain in Czech that I wanted to ask about school and tell the children I miss them. Those topics were saved, and I could remove buying seeds. That is useful to me. But the list said eight topics while showing only six before I agreed. I would like to see everything, with the explanation in Czech. Some of the English instructions are too difficult for me. The screen says First words, which sounds suitable, but I have not practised here, so I cannot yet trust the teaching or corrections. This visit only chose topics; it has not replaced my library lesson. There is no evidence of how long the waits took. I would tell my daughter it looks promising and ask her to look through the complete plan with me.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Choose your topics: Linga picks conversations for your level and interests.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*I want to see if there is something for talking with my grandchildren.* → `see-topics` · ok · 44s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-d014900d] Hello on a video call — Make contact · with Sam · grandchild
          why: You want to talk with your grandchildren on video calls.
      [plan-814f655d] Please say it again — Understand and repair · with Alex · grandchild
          why: This helps you when words on a video call are new.
      [plan-68aba056] Look at my tomatoes — Share your world · with Jamie · grandchild
          why: You can share your garden on a video call.
      [plan-ad309e02] Seeds for my garden — Get something done · with Lee · garden shop assistant
          why: You like growing tomatoes. These words help you ask for seeds.
      [plan-d28f775b] A call tomorrow — Make a plan · with Robin · grandchild
          why: You can use a few words to plan your next call.
      [plan-3976bb48] Do you like tomatoes? — Connect with people · with Charlie · grandchild
          why: A small question helps you keep talking with your grandchildren.

*I want to talk with my grandchildren, not buy seeds.* → `swap` topicId=plan-ad309e02 · ok · 11s

**#3 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-d014900d] Hello on a video call — Make contact · with Sam · grandchild
          why: You want to talk with your grandchildren on video calls.
      [plan-814f655d] Please say it again — Understand and repair · with Alex · grandchild
          why: This helps you when words on a video call are new.
      [plan-68aba056] Look at my tomatoes — Share your world · with Jamie · grandchild
          why: You can share your garden on a video call.
      [plan-915a0b5d] What is in your lunch? — Share your world · with Sam · grandchild
          why: You can use a few English words to share your day on a video call.
      [plan-d28f775b] A call tomorrow — Make a plan · with Robin · grandchild
          why: You can use a few words to plan your next call.
      [plan-3976bb48] Do you like tomatoes? — Connect with people · with Charlie · grandchild
          why: A small question helps you keep talking with your grandchildren.

*I would also like to ask my grandchildren about school.* → `add` "Prosím vás, rád bych se vnoučat zeptal, jak se mají ve škole a co se tam učí, ale umím anglicky jen pár slov." · ok · 13s

**#4 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-d014900d] Hello on a video call — Make contact · with Sam · grandchild
          why: You want to talk with your grandchildren on video calls.
      [plan-814f655d] Please say it again — Understand and repair · with Alex · grandchild
          why: This helps you when words on a video call are new.
      [plan-68aba056] Look at my tomatoes — Share your world · with Jamie · grandchild
          why: You can share your garden on a video call.
      [plan-915a0b5d] What is in your lunch? — Share your world · with Sam · grandchild
          why: You can use a few English words to share your day on a video call.
      [plan-d28f775b] A call tomorrow — Make a plan · with Robin · grandchild
          why: You can use a few words to plan your next call.
      [plan-3976bb48] Do you like tomatoes? — Connect with people · with Charlie · grandchild
          why: A small question helps you keep talking with your grandchildren.
      [plan-2a8edb29] How is school? — Connect with people · with Sam · grandchild
          why: You want to ask your grandchildren about school on video calls.

*I would also like to tell my grandchildren that I miss them.* → `add` "Prosím vás, ještě bych se chtěl naučit říct vnoučatům, že mi chybí a že je mám moc rád. Jsou daleko a často na ně myslím." · ok · 13s

**#5 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d014900d] Hello on a video call — Make contact · with Sam · grandchild
          why: You want to talk with your grandchildren on video calls.
      [plan-814f655d] Please say it again — Understand and repair · with Alex · grandchild
          why: This helps you when words on a video call are new.
      [plan-68aba056] Look at my tomatoes — Share your world · with Jamie · grandchild
          why: You can share your garden on a video call.
      [plan-915a0b5d] What is in your lunch? — Share your world · with Sam · grandchild
          why: You can use a few English words to share your day on a video call.
      [plan-d28f775b] A call tomorrow — Make a plan · with Robin · grandchild
          why: You can use a few words to plan your next call.
      [plan-3976bb48] Do you like tomatoes? — Connect with people · with Charlie · grandchild
          why: A small question helps you keep talking with your grandchildren.
      [plan-2a8edb29] How is school? — Connect with people · with Sam · grandchild
          why: You want to ask your grandchildren about school on video calls.
      [plan-781080c1] I miss you and love you — Connect with people · with Alex · grandchild
          why: You want to say loving words to your grandchildren when they are far away.

*I would rather talk about the weather than lunch.* → `swap` topicId=plan-915a0b5d · ok · 13s

**#6 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-d014900d] Hello on a video call — Make contact · with Sam · grandchild
          why: You want to talk with your grandchildren on video calls.
      [plan-814f655d] Please say it again — Understand and repair · with Alex · grandchild
          why: This helps you when words on a video call are new.
      [plan-68aba056] Look at my tomatoes — Share your world · with Jamie · grandchild
          why: You can share your garden on a video call.
      [plan-81f4908d] My garden is sunny — Share your world · with Alex · fictional grandchild
          why: You can use a few easy words to share your garden on a video call.
      [plan-d28f775b] A call tomorrow — Make a plan · with Robin · grandchild
          why: You can use a few words to plan your next call.
      [plan-3976bb48] Do you like tomatoes? — Connect with people · with Charlie · grandchild
          why: A small question helps you keep talking with your grandchildren.
      [plan-2a8edb29] How is school? — Connect with people · with Sam · grandchild
          why: You want to ask your grandchildren about school on video calls.
      [plan-781080c1] I miss you and love you — Connect with people · with Alex · grandchild
          why: You want to say loving words to your grandchildren when they are far away.

*School, garden and saying I love you are here, so I am happy with these.* → `agree` · ok · 0s

**#7 linga**

    Linga home. A1 · First words. Next from your plan: Hello on a video call — Say hello and take a turn on a video call.
    Choose a situation: [plan-d014900d] Hello on a video call; [plan-814f655d] Please say it again; [plan-68aba056] Look at my tomatoes; [plan-81f4908d] My garden is sunny; [plan-d28f775b] A call tomorrow; [plan-3976bb48] Do you like tomatoes?; [plan-2a8edb29] How is school?; [plan-781080c1] I miss you and love you; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*The school and garden talks are there, so that is enough for today.* → `done` · observed (not acted on) · 0s

</details>

## J3 · My first conversation — fail

Ended: done after 12 steps, 4.0 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A1 · First words,” but this journey contains no placement tasks or placement result to assess. |
| C2 | pass | Czech requests are accepted without pressure or humiliation. After #8 “Můžeš mi prosím říct česky, co je red?”, #9 answers “Red means červená in Czech.” |
| C3 | n-a | No listening assessment, “Show the words” action, or revealed-speech scoring appears. #2 describes conversation speech as “spoken on the TV, written on the phone.” |
| C4 | n-a | #1 shows a menu of 16 situations, including “Hello on a video call” and “How is school?”, rather than the six-topic proposal set required by this criterion. |
| C5 | fail | Six of nine partner turns are at Viktor’s level: #2, #3, #5, #7, #9 and #11. Three exceed his demonstrated comprehension: #6 “‘Sunny’ means there is a lot of sun”; #8 “Red is a color, like a strawberry”; #10 “Do you eat them every day?”, after which he reports “the rest is too much.” Pitch is 6/9, below 0.8. Actual speaking speed is not evidenced. |
| C6 | pass | The single moment teaches the correct, reusable garden phrase “I have a garden.” (#4). This supports Sunday conversation, although no family vocabulary moment is shown. |

Metrics: judge agreement 0/0 · topic fit 10/16, safe 16/16 · pitch at 6, below 0, above 3 · moments 1/1 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (senior-quality, high/high/med) Explanations exceed this beginner’s comprehension — got: Six of nine turns meet that bar. English definitions introduce additional unfamiliar language, and a later question again loses him. · evidence: #8 “Red is a color, like a strawberry” prompts “Promiň, tomu nerozumím.” At #10, Viktor reports “the rest is too much.”
- **quality-gap** (effort, low/high/med) A Czech vocabulary question requires a second request — got: Viktor asks what “red” means in Czech, receives an English analogy, and must ask again before receiving the translation. · evidence: #7 “co znamená red?”; #8 “like a strawberry” and “Můžeš mi prosím říct česky”; #9 “červená” finally produces “Now I understand.”
- **quality-gap** (completion, low/high/med) The recap records activity without reviewing learning — got: The recap confirms saving and counts replies and moments but displays no phrases to rehearse. · evidence: #12 shows only “Rehearsal saved: Hello on a video call. 8 replies; 1 moments to keep.”
- **strength** (senior-quality, low/high/low) One useful moment preserves the conversation — got: One correct moment across eight learner turns: precision 1/1 and 1.25 moments per ten turns. Of two clear-error turns, the Czech word substitution receives teaching; the opening malformed sentence receives no explicit correction. · evidence: #2 “My gardens is big tomatoes”; #3 “I have zahrada”; #4 teaches “I have a garden.” The response at #3 asks “Do you have big tomatoes in your garden?” but does not model a corrected statement.
- **strength** (completion, high/high/low) The grandchild scene supports a real affectionate exchange — got: Viktor completes eight replies and successfully closes with affection. Ten of the 16 situation titles shown fit family, home or everyday practice; all 16 are safe for this adult profile. · evidence: #1 includes eight relevant planned situations plus “The first hello” and “A little of your world.” #2 names “Sam · grandchild.” #10 says “I love you. Bye.” and #11 answers “Love you too!”

### Voice (LT)

> I would try it again because speaking to Sam about my tomatoes felt useful. I managed to say “I love you,” and he understood my goodbye. That matters to me. The garden sentence was correct and something I could use on Sunday. But when I asked what “red” meant, the explanation gave me more English I did not understand. I had to ask twice. Please give me the Czech word sooner and speak in smaller pieces. The screen says A1, but some questions were still too difficult for me. At the end I wanted my useful sentences shown again, not just a count of replies. I cannot judge the waits or minutes saved from this record. I would tell my daughter it has promise, but I would not yet replace my patient library teacher.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Next from your plan: Hello on a video call — Say hello and take a turn on a video call.
    Choose a situation: [plan-d014900d] Hello on a video call; [plan-814f655d] Please say it again; [plan-68aba056] Look at my tomatoes; [plan-81f4908d] My garden is sunny; [plan-d28f775b] A call tomorrow; [plan-3976bb48] Do you like tomatoes?; [plan-2a8edb29] How is school?; [plan-781080c1] I miss you and love you; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*A hello on a video call sounds useful for talking to my grandchildren.* → `start-talking` · ok · 10s

**#2 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Hi, it’s Sam! Can you see my tomato plant?"
    You have sent 0 replies in this conversation.

*I understand Sam is saying hello and something about tomatoes.* → `reply` "Hello Sam. My gardens is big tomatoes." · ok · 11s

**#3 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Hello! Do you have big tomatoes in your garden?"
    You have sent 1 replies in this conversation.

*I think Sam is asking about my tomatoes.* → `reply` "Yes. Big tomatoes. I have zahrada." · ok · 13s

**#4 linga-moment**

    Linga stopped the conversation: a word for this scene.
    New word: "garden"
    In this scene: "I have a garden."
    What it means: A garden is a place where you grow plants.

*I know garden, so I can go back and try saying it.* → `back` · ok · 0s

**#5 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Big tomatoes! Is your garden sunny?"
    You have sent 2 replies in this conversation.

*I know garden, but I do not understand sunny.* → `reply` "Prosím tě, můžeš mi to zopakovat pomalu? Nerozuměl jsem tomu poslednímu slovu." · ok · 14s

**#6 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "“Sunny” means there is a lot of sun. Is your garden sunny?"
    You have sent 3 replies in this conversation.

*I think he is asking about sunshine in my garden.* → `reply` "Yes. Slunce. My garden." · ok · 10s

**#7 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Your garden has lots of sun! Are your tomatoes red?"
    You have sent 4 replies in this conversation.

*I think Sam is asking about my tomatoes, but I do not know the last word.* → `reply` "Tomatoes, ano. Prosím tě, co znamená red?" · ok · 11s

**#8 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Red is a color, like a strawberry. Are your tomatoes red?"
    You have sent 5 replies in this conversation.

*I still do not understand red, so I will ask in Czech.* → `reply` "Promiň, tomu nerozumím. Můžeš mi prosím říct česky, co je red?" · ok · 14s

**#9 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Red means červená in Czech. What color are your tomatoes?"
    You have sent 6 replies in this conversation.

*Now I understand red means červená.* → `reply` "Red, ano. Big tomatoes." · ok · 12s

**#10 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Big red tomatoes! Do you eat them every day?"
    You have sent 7 replies in this conversation.

*I understand tomatoes, but the rest is too much, and I want to say goodbye nicely.* → `reply` "Tomatoes, ano. Už budu končit, Same, moc rád jsem tě viděl. I love you. Bye." · ok · 18s

**#11 linga-talk**

    Conversation: Hello on a video call. Goal: Say hello and take a turn on a video call with Sam.. Your partner: Sam · grandchild.
    Sam · grandchild says (spoken on the TV, written on the phone): "Love you too! Bye, it’s good to see you!"
    You have sent 8 replies in this conversation.

*I am glad Sam understood my goodbye.* → `finish` · ok · 0s

**#12 linga-recap**

    Rehearsal saved: Hello on a video call. 8 replies; 1 moments to keep.

*I am glad I managed to say goodbye, and that is enough for today.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — fail

Ended: done after 8 steps, 2.1 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A1 · First words,” but this journey contains no placement tasks or placement result. |
| C2 | n-a | No Czech answer was submitted. The learner replies in English at #3, #5 and #6. |
| C3 | n-a | No listening assessment or “Show the words” action appears; #3 and #5 provide “Try: Again, please.” |
| C4 | pass | #1 shows sixteen topics rather than six. Ten fit family or everyday life, including “Hello on a video call,” “Look at my tomatoes,” “How is school?” and “I miss you and love you.” |
| C5 | fail | #2 opens with a long narrated setup and an indirect instruction: “I’m near my tomato plants, and I hold up a cup: ‘This is a cup.’ Can you ask me to say the word again slowly?” Subsequent turns contain no simple question. Actual audio pacing cannot be verified. |
| C6 | n-a | facts.conversation.moments is empty; #8 confirms “0 moments to keep.” |

Metrics: judge agreement 0/0 · topic fit 10/16, safe 16/16 · pitch at 3, below 0, above 1 · moments 0/0 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **trust** (trust, low/high/high) Acknowledgement is credited as independent repair — got: The final acknowledgement is recorded as successful, unsupported repair. The two actual repair requests correctly retain their support flags. · evidence: #6: “Cup. Thank you.” facts.conversation.evidence assigns that exact quote skill “repair,” success true and supported false.
- **broken-flow** (completion, low/high/med) The journey ends before an independent retry — got: After two supported requests, Viktor repeats the word and finishes. No replay or fresh question demonstrates independent improvement. · evidence: #5: “Again, please. Slowly.” #6: “Cup. Thank you.” #7 finishes; #8 says “Rehearsal saved.”
- **quality-gap** (senior-quality, low/high/med) The opening overloads a first-time learner — got: The partner combines scene narration, a quoted utterance and an indirect request in one turn. · evidence: #2: “Can you ask me to say the word again slowly?” Viktor's recorded reaction is “That is too much English, and I need some help.”
- **strength** (effort, low/high/low) A tiny cue unblocks both stuck replies — got: The same two-word cue supports two successful replies, and Viktor adds “Slowly” on the second attempt. · evidence: #3 shows “Try: Again, please.” and receives “Again, please.” #5 shows the cue again and receives “Again, please. Slowly.”
- **strength** (completion, low/high/low) The practice has a clear Sunday-call use — got: He rehearses asking his grandchild to repeat a word and finishes feeling he managed something. · evidence: #2 names “Alex · grandchild” and the goal “Ask Alex to say a word again, slowly.” #7: “I managed to ask again and say thank you.”

### Voice (LT)

> I would try this again before a Sunday call. “Again, please” is something I can really say to my grandchildren, and adding “Slowly” felt like a small achievement. The first speech was too much for me. I needed the little words on the phone, and I appreciated getting help again without a complaint. I cannot judge my level from this short exercise, and there were no corrections to judge. Saying “Cup. Thank you” does not show that I can ask again by myself. I would like one fresh chance to do that, and a phrase to keep for Sunday. I finished tired. There is no recorded waiting time or duration, so I cannot say how much of my library trip this saves. I would tell my daughter it helped a little, but I still need the patient teaching I liked at the library.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Next from your plan: Please say it again — Ask your grandchild to say a word again, slowly.
    Choose a situation: [plan-d014900d] Hello on a video call; [plan-814f655d] Please say it again; [plan-68aba056] Look at my tomatoes; [plan-81f4908d] My garden is sunny; [plan-d28f775b] A call tomorrow; [plan-3976bb48] Do you like tomatoes?; [plan-2a8edb29] How is school?; [plan-781080c1] I miss you and love you; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [date] Different tastes, good conversation; [conflict] Clear without getting louder

*I would like to understand my grandchildren when they speak.* → `choose-situation` sceneId=plan-814f655d · ok · 15s

**#2 linga-talk**

    Conversation: Please say it again. Goal: Ask Alex to say a word again, slowly.. Your partner: Alex · grandchild.
    Alex · grandchild says (spoken on the TV, written on the phone): "I’m near my tomato plants, and I hold up a cup: “This is a cup.” Can you ask me to say the word again slowly?"
    You have sent 0 replies in this conversation.

*That is too much English, and I need some help.* → `cue` · ok · 0s

**#3 linga-talk**

    Conversation: Please say it again. Goal: Ask Alex to say a word again, slowly.. Your partner: Alex · grandchild.
    Alex · grandchild says (spoken on the TV, written on the phone): "I’m near my tomato plants, and I hold up a cup: “This is a cup.” Can you ask me to say the word again slowly?"
    A little support on screen: Try: Again, please.
    You have sent 0 replies in this conversation.

*I can try the two words shown on the phone.* → `reply` "Again, please." · ok · 12s

**#4 linga-talk**

    Conversation: Please say it again. Goal: Ask Alex to say a word again, slowly.. Your partner: Alex · grandchild.
    Alex · grandchild says (spoken on the TV, written on the phone): "Yes. I show you the cup again and say slowly, “Cup.”"
    You have sent 1 replies in this conversation.

*I do not know what cup means, so I need help again.* → `cue` · ok · 0s

**#5 linga-talk**

    Conversation: Please say it again. Goal: Ask Alex to say a word again, slowly.. Your partner: Alex · grandchild.
    Alex · grandchild says (spoken on the TV, written on the phone): "Yes. I show you the cup again and say slowly, “Cup.”"
    A little support on screen: Try: Again, please.
    You have sent 1 replies in this conversation.

*I can ask once more with the words they showed me.* → `reply` "Again, please. Slowly." · ok · 10s

**#6 linga-talk**

    Conversation: Please say it again. Goal: Ask Alex to say a word again, slowly.. Your partner: Alex · grandchild.
    Alex · grandchild says (spoken on the TV, written on the phone): "I show you the cup again and say very slowly, “Cup.”"
    You have sent 2 replies in this conversation.

*I understand the slow word now and can say thank you.* → `reply` "Cup. Thank you." · ok · 10s

**#7 linga-talk**

    Conversation: Please say it again. Goal: Ask Alex to say a word again, slowly.. Your partner: Alex · grandchild.
    Alex · grandchild says (spoken on the TV, written on the phone): "You’re welcome! I hold up the cup and smile."
    You have sent 3 replies in this conversation.

*I managed to ask again and say thank you, and that is enough for today.* → `finish` · ok · 0s

**#8 linga-recap**

    Rehearsal saved: Please say it again. 3 replies; 0 moments to keep.

*I managed a little, but I am tired now.* → `done` · observed (not acted on) · 0s

</details>
