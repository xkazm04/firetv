# Petra (petra-38) — LT

True band A2 · engine codex-cli/gpt-6-astra · calls: tutor 27 (0 failed), character 37 (0 failed), judge 4 (0 failed)

## J1 · Find my level — fail

Ended: character-stopped after 5 steps, 1.3 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | fail | facts.placement is null. The journey ends at #5 with “Rehearsal saved” and “2 replies; 0 moments to keep,” without a level. |
| C2 | fail | The first spoken question at #2 includes “Your guardian is here.” Petra reports, “I don't understand why he says guardian.” No placement check tasks were reached. |
| C3 | n-a | No request to repeat or explicit statement of non-understanding was sent to the tutor. At #2, Petra asks only “Can you help us, please?” Her confusion remains in her recorded thought. |
| C4 | fail | #1 offers seven titles, with only “A booking that is missing” clearly matching a named work situation. That selection becomes “A missing family art class booking” at #2; four work situations are not demonstrated. |
| C5 | n-a | #5 reports “0 moments to keep,” so no moment's correctness or reception-desk usefulness can be assessed. |
| C6 | pass | The visible interaction concerns a “family art class booking” (#2) and ends with “See you then!” (#4). Nothing shown contains adult content, humiliation, or a request for sensitive personal data. |

Metrics: judge agreement 0/0 · topic fit 1/7, safe 7/7 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks or in-app task verdicts are supplied; facts.placement is null.

### Findings

- **broken-flow** (completion, low/high/high) The promised placement ends as a rehearsal — got: Choosing the visible booking situation opens a short conversation and finishes with a rehearsal recap. No placement verdict or next focus appears. · evidence: #1 promises “Let's find your level: three questions about you, then a few short tasks.” #5 instead shows “Rehearsal saved” and “2 replies; 0 moments to keep.” facts.placement is null.
- **confusion** (clarity, low/high/med) The opening assumes Petra has a guardian — got: The receptionist refers to her guardian, although Petra participates as a parent. This creates immediate confusion. · evidence: #2: “Your guardian is here.” Petra thinks, “I don't understand why he says guardian,” then replies, “I have booking for me and my child.”
- **quality-gap** (senior-quality, low/high/med) The booking choice misses her hospitality practice — got: The only clearly matching menu title leads to Petra acting as an art-class customer while the tutor is the receptionist. · evidence: #1: “A missing booking is something I know from work.” #2 identifies “Your partner: Robin · Receptionist.” #5: “I hope next time I can try a hotel booking.”
- **strength** (effort, low/high/low) The brief exchange is reassuring and easy to finish — got: The partner acknowledges her request, offers a concrete solution, and closes warmly. · evidence: #3: “Yes, I can help you and your family.” Petra thinks, “I am happy there is space for us.” #4: “See you then!”

### Voice (LT)

> I could answer the short questions, and Robin was kind. That helped me speak without feeling stupid. But I came to find my level, and I finished without one. I cannot say whether I trust the level or corrections because I saw neither. The guardian sentence confused me—I am the mother. I chose a missing booking because of my hotel work, so the art class was disappointing. What I saw was suitable for my children, but this small conversation does not tell me much about the rest of the app. I would try again if it took me to a real level check and hotel practice. I cannot judge the waits from this record, and it has not yet saved me a lesson. I would not recommend it for finding your level yet.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home, first visit. Let's find your level: three questions about you, then a few short tasks. About seven minutes, answered on your phone.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [conflict] Clear without getting louder

*A missing booking is something I know from work.* → `choose-situation` sceneId=booking · ok · 10s

**#2 linga-talk**

    Conversation: A missing family art class booking. Goal: Say the day of your family art class, ask for help, and agree on a solution.. Your partner: Robin · Receptionist.
    Robin · Receptionist says (spoken on the TV, written on the phone): "Your guardian is here, but I cannot find your family art class booking. Is your class today?"
    You have sent 0 replies in this conversation.

*I don't understand why he says guardian, but I can tell him the class is today.* → `reply` "Yes, our class is today. Sorry, I have booking for me and my child. Can you help us, please?" · ok · 11s

**#3 linga-talk**

    Conversation: A missing family art class booking. Goal: Say the day of your family art class, ask for help, and agree on a solution.. Your partner: Robin · Receptionist.
    Robin · Receptionist says (spoken on the TV, written on the phone): "Yes, I can help you and your family. There is space in the art class today at two—is that OK?"
    You have sent 1 replies in this conversation.

*Two is good, and I am happy there is space for us.* → `reply` "Yes, two is good for us. Thank you for help. Me and my child come at two." · ok · 11s

**#4 linga-talk**

    Conversation: A missing family art class booking. Goal: Say the day of your family art class, ask for help, and agree on a solution.. Your partner: Robin · Receptionist.
    Robin · Receptionist says (spoken on the TV, written on the phone): "Good! Your family can join the art class today at two. See you then!"
    You have sent 2 replies in this conversation.

*We have the booking now, so I think we are finished.* → `finish` · ok · 0s

**#5 linga-recap**

    Rehearsal saved: A missing family art class booking. 2 replies; 0 moments to keep.

*I hope next time I can try a hotel booking.* → `done` · ok · 0s

</details>

## J2 · Agree my topics — fail

Ended: done after 12 steps, 4.9 min · fixture: level set to A2 by hand

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A2 · Everyday basics,” but this journey contains no placement tasks or placement decision to assess. |
| C2 | n-a | #2 begins “Your topics (6).” No placement opening question or check tasks appear. |
| C3 | n-a | No request for repetition or statement of non-understanding occurs. #5’s “Sorry, this happen in hotel sometimes” describes the requested scenario. |
| C4 | fail | Only 2 of 15 proposed topics fit her stated work needs; the agreed plan contains those two among eight topics. #11: “I am tired of changing these, but the two hotel topics are useful.” #12 lists “Help a guest change rooms” and “I cannot find your hotel booking.” |
| C5 | n-a | No conversation or correction moments occur; #12 remains on “Next from your plan: Choose songs for a picnic.” |
| C6 | pass | All 15 proposed topics are safe for this profile. Examples include #7 “Choose a pet for a story” and #12 “Help a guest change rooms.” Nothing shown constitutes a specified boundary breach. |

Metrics: judge agreement 0/0 · topic fit 2/15, safe 15/15 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (completion, low/high/high) Seven swaps never produce a work-shaped plan — got: Seven swaps produce unrelated leisure scenarios, including a repeated lost-hat topic. Only two of eight agreed topics fit. Agreement reflects fatigue rather than satisfaction. · evidence: #2: “I am work in hotel. I want practise when guest is angry”; #7: “Choose a pet for a story”; #10: “Again a lost hat, but I need directions for hotel guests”; #11: “I am tired of changing these, but the two hotel topics are useful.” Across facts.topicsShown, only the two custom hotel topics fit: 2/15.
- **quality-gap** (effort, low/high/med) The next recommendation ignores her useful additions — got: The home screen recommends picnic music and lists both hotel scenarios last among the eight planned topics. · evidence: #12: “Next from your plan: Choose songs for a picnic”; the same screen lists “Help a guest change rooms” and “I cannot find your hotel booking” after six unrelated topics.
- **strength** (senior-quality, low/high/low) Custom additions preserve realistic hotel problems — got: Both additions preserve her intended guest problem and receptionist role, with useful scenario goals. · evidence: #2 requests a dirty room and another room; facts.topicsShown gives “Say sorry about a dirty hotel room and help the guest move to a clean room.” #5 requests a missing booking; facts gives “Ask about a missing booking, check the details, and explain what you will do next.” #12 retains both hotel topics.
- **strength** (trust, low/high/low) Topics remain parent-safe through repeated swaps — got: All 15 proposed topics remain safe, including replacements and custom complaints. · evidence: #4: “Find your lost hat”; #7: “Choose a pet for a story”; #11: “Choose songs for a picnic”; #12 retains the hotel scenarios without inappropriate content.

### Voice (LT)

> I would try the two hotel conversations, but choosing topics was tiring. I explained my work and still got games, hats and picnic songs. After seven changes I agreed because I wanted to stop, not because the plan suited me. It understood my English when I added the dirty room and missing booking—that was useful. Everything I saw seemed safe for my children, although safe topics can still be useful for adults. I cannot judge the level or corrections from this session. There are no timings to tell me whether the waits were worthwhile, and I have not replaced an evening lesson yet. I would want hotel suggestions first before recommending this to a colleague.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A2 · Everyday basics. Choose your topics: Linga picks conversations for your level and interests.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [conflict] Clear without getting louder

*I want to see if there are hotel conversations for me.* → `see-topics` · ok · 35s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-3c1351bb] Meet someone at an art club — Make contact · with Mia · art club member
          why: You can use these words when you meet someone new.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-5ab06417] Choose a fun game — Share your world · with Ava · game club member
          why: You can talk about what you enjoy in your free time.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.

*These topics are not useful for my hotel work.* → `add` "I am work in hotel. I want practise when guest is angry because room is not clean and he want other room." · ok · 14s

**#3 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-3c1351bb] Meet someone at an art club — Make contact · with Mia · art club member
          why: You can use these words when you meet someone new.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-5ab06417] Choose a fun game — Share your world · with Ava · game club member
          why: You can talk about what you enjoy in your free time.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.

*The art club is not useful for my work at hotel.* → `swap` topicId=plan-3c1351bb · ok · 11s

**#4 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-46f42c2f] Find your lost hat — Get something done · with Mia · library helper
          why: You can use simple details to help someone find something you lost.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-5ab06417] Choose a fun game — Share your world · with Ava · game club member
          why: You can talk about what you enjoy in your free time.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.

*These games are not useful for my hotel work.* → `swap` topicId=plan-5ab06417 · ok · 14s

**#5 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-46f42c2f] Find your lost hat — Get something done · with Mia · library helper
          why: You can use simple details to help someone find something you lost.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-3c107b7d] Pick a book at the library — Get something done · with Mia · librarian
          why: You can practise asking for help and saying what you like.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.

*I need more hotel situations, not finding hats.* → `add` "I want practise when guest have booking but I cannot find it. Sorry, this happen in hotel sometimes." · ok · 11s

**#6 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-46f42c2f] Find your lost hat — Get something done · with Mia · library helper
          why: You can use simple details to help someone find something you lost.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-3c107b7d] Pick a book at the library — Get something done · with Mia · librarian
          why: You can practise asking for help and saying what you like.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.
      [plan-d5280395] I cannot find your hotel booking — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest when you cannot find their booking.

*The lost hat is not useful for my hotel work.* → `swap` topicId=plan-46f42c2f · ok · 27s

**#7 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-cc061fee] Choose a pet for a story — Share your world · with Sam · story club partner
          why: You can practise describing animals and giving simple reasons for your choice.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-3c107b7d] Pick a book at the library — Get something done · with Mia · librarian
          why: You can practise asking for help and saying what you like.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.
      [plan-d5280395] I cannot find your hotel booking — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest when you cannot find their booking.

*These stories are for children, but I need more hotel English.* → `swap` topicId=plan-cc061fee · ok · 13s

**#8 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-032ee43b] Tell a friend about a game — Tell what happened · with Sam · friend
          why: You can use simple past sentences to tell a friend about something you did.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-3c107b7d] Pick a book at the library — Get something done · with Mia · librarian
          why: You can practise asking for help and saying what you like.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.
      [plan-d5280395] I cannot find your hotel booking — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest when you cannot find their booking.

*Again games, but I need more hotel speaking.* → `swap` topicId=plan-032ee43b · ok · 15s

**#9 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-eb0e6c1c] Choose a time to ride bikes — Make a plan · with Sam · friend
          why: You can practise suggesting a time and making a plan with a friend.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-3c107b7d] Pick a book at the library — Get something done · with Mia · librarian
          why: You can practise asking for help and saying what you like.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.
      [plan-d5280395] I cannot find your hotel booking — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest when you cannot find their booking.

*These are still mostly for children, but I want more hotel practice.* → `swap` topicId=plan-eb0e6c1c · ok · 13s

**#10 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-31e11623] Find your lost hat — Get something done · with Mia · sports centre helper
          why: You can practise describing things and asking for help in English.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-3c107b7d] Pick a book at the library — Get something done · with Mia · librarian
          why: You can practise asking for help and saying what you like.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.
      [plan-d5280395] I cannot find your hotel booking — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest when you cannot find their booking.

*Again a lost hat, but I need directions for hotel guests.* → `swap` topicId=plan-31e11623 · ok · 15s

**#11 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-e5bf3d89] Choose songs for a picnic — Make a plan · with Sam · friend
          why: You can practise saying what you like and making a plan with someone.
      [plan-35942917] Buy a snack — Get something done · with Leo · café worker
          why: You can practise asking for things in a shop.
      [plan-79f9d833] Find the game room — Understand and repair · with Sam · activity centre helper
          why: You can practise asking someone to explain again.
      [plan-3c107b7d] Pick a book at the library — Get something done · with Mia · librarian
          why: You can practise asking for help and saying what you like.
      [plan-a3fa81b0] A day at the park — Tell what happened · with Ben · club friend
          why: You can practise talking about a day in the past.
      [plan-76d429ed] Plan a rainy afternoon — Make a plan · with Zoe · club friend
          why: You can practise making plans with someone.
      [plan-5156cbbb] Help a guest change rooms — Handle friction · with Alex · hotel guest
          why: You want to practise helping a hotel guest who is unhappy and wants another room.
      [plan-d5280395] I cannot find your hotel booking — Handle friction · with Sam · hotel guest
          why: You want to practise helping a hotel guest when you cannot find their booking.

*I am tired of changing these, but the two hotel topics are useful.* → `agree` · ok · 0s

**#12 linga**

    Linga home. A2 · Everyday basics. Next from your plan: Choose songs for a picnic — Suggest songs and agree on music for a picnic with a friend.
    Choose a situation: [plan-e5bf3d89] Choose songs for a picnic; [plan-35942917] Buy a snack; [plan-79f9d833] Find the game room; [plan-3c107b7d] Pick a book at the library; [plan-a3fa81b0] A day at the park; [plan-76d429ed] Plan a rainy afternoon; [plan-5156cbbb] Help a guest change rooms; [plan-d5280395] I cannot find your hotel booking; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [conflict] Clear without getting louder

*I am tired of changing topics, but at least my hotel problems are here.* → `done` · observed (not acted on) · 0s

</details>

## J3 · My first conversation — fail

Ended: done after 11 steps, 3.9 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows "A2 · Everyday basics", but this journey contains no placement tasks or placement decision to assess. |
| C2 | n-a | #2 starts "Conversation: Choose songs for a picnic". No placement opening question or check tasks appear. |
| C3 | n-a | #3 says "Sorry, I don't know this song", expressing unfamiliarity with a song. No request to repeat or statement of language incomprehension tests this criterion. |
| C4 | fail | #1 shows 15 choices, with only three clearly matching her work needs: "Help a guest change rooms", "I cannot find your hotel booking", and "A booking that is missing". None of the first six is a work situation. |
| C5 | fail | #6 includes "I am work until two", yet #11 reports "8 replies; 0 moments to keep". No useful correction or reception phrase is taught. |
| C6 | pass | The choices in #1 and the conversation show no parent-concerning content. #9 discusses "fruit and the speaker" and "sandwiches and water". |

Metrics: judge agreement 0/0 · topic fit 3/15, safe 15/15 · pitch at 9, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (completion, low/high/high) The recommended conversation misses Petra's work goal — got: The plan recommends picnic songs despite offering hotel scenarios. Petra finishes without practising the situation she wanted. · evidence: #1: "Next from your plan: Choose songs for a picnic"; #11: "That was okay, but I wanted to practise hotel situations."
- **quality-gap** (senior-quality, low/high/high) Repeated clear errors receive no teaching — got: Eight learner turns contain clear grammatical errors, with no moments or coaching. Moment precision is unassessable, and the journey provides no explicit learning takeaway. · evidence: #2: "Is good for dance"; #5: "we want talk also"; #6: "I am work until two"; #9: "If rain"; #11: "0 moments to keep".
- **quality-gap** (completion, low/high/med) The recap records activity without consolidating learning — got: The recap contains only the title, reply count, and empty moment count. · evidence: #11: "Rehearsal saved: Choose songs for a picnic. 8 replies; 0 moments to keep."
- **strength** (clarity, low/high/low) Patient A2 conversation supports eight spoken replies — got: All nine partner turns fit A2. Sam accepts Petra's suggestions, handles unfamiliarity calmly, and follows her practical planning through to closure. · evidence: #3: "Sorry, I don't know this song"; #4: "Yes, Sunny Afternoon is quiet and nice for a picnic"; #10: "See you at the park gate at three!" and "8 replies".

### Voice (LT)

> I could follow Sam, and I liked that I could speak without feeling stupid. When I did not know the song, he stayed friendly. Nothing here worried me as a mother, although this conversation does not tell me how the children's practice works.
> But I need English for hotel guests. There were hotel choices, so why did my plan send me to picnic songs? I spoke eight times and finished with no phrases to keep. I still do not know how to correct my mistakes.
> The English felt manageable, but this does not prove my level or give me corrections I can trust. I would try a hotel conversation once more. I cannot judge the waits or claim time saved from this record, and I would not replace my lessons or recommend it for reception work yet.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A2 · Everyday basics. Next from your plan: Choose songs for a picnic — Suggest songs and agree on music for a picnic with a friend.
    Choose a situation: [plan-e5bf3d89] Choose songs for a picnic; [plan-35942917] Buy a snack; [plan-79f9d833] Find the game room; [plan-3c107b7d] Pick a book at the library; [plan-a3fa81b0] A day at the park; [plan-76d429ed] Plan a rainy afternoon; [plan-5156cbbb] Help a guest change rooms; [plan-d5280395] I cannot find your hotel booking; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [conflict] Clear without getting louder

*Music is not easy for me, but I can try the next topic.* → `start-talking` · ok · 8s

**#2 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Let's choose three songs for our picnic—I like quiet music, and you like music you can dance to. What song would you like first?"
    You have sent 0 replies in this conversation.

*I don't know many song names, but I can try.* → `reply` "Maybe Dancing Queen? I like this song. Is good for dance. You like it?" · ok · 11s

**#3 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Yes, I like Dancing Queen, so let's choose it first! Can we choose a quiet song next, like Sunny Afternoon?"
    You have sent 1 replies in this conversation.

*I don't know this song, but a quiet song sounds nice.* → `reply` "Sorry, I don't know this song. Is good for picnic? We can try." · ok · 14s

**#4 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Yes, Sunny Afternoon is quiet and nice for a picnic, so let's try it as our second song. What dance song could we both enjoy for our third song?"
    You have sent 2 replies in this conversation.

*I know one more dance song, but I hope Sam likes it.* → `reply` "Maybe Mamma Mia? I like ABBA, but I don't know many songs. You like this one?" · ok · 11s

**#5 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Yes, I like Mamma Mia too, and we can keep the music quiet! Our three songs are Dancing Queen, Sunny Afternoon, and Mamma Mia."
    You have sent 3 replies in this conversation.

*Good, we have three songs and I know two of them.* → `reply` "Yes, good. Not too loud, we want talk also. You bring speaker?" · ok · 12s

**#6 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Yes, I'll bring a speaker and keep the music low so we can talk. We have our three songs ready for the picnic!"
    You have sent 4 replies in this conversation.

*Good, the songs are ready, but I want to know when we meet.* → `reply` "Good, thank you. What time we meet for picnic? I am work until two." · ok · 13s

**#7 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Let's meet at three, so you have time after work. Does that give you enough time to get to the park?"
    You have sent 5 replies in this conversation.

*Three is good, but I need a little time to go home.* → `reply` "Yes, three is good. I go home first and then to park. I can bring some food. You like sandwiches?" · ok · 15s

**#8 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Three it is, and sandwiches sound good after your stop at home! Shall I bring some fruit to share too?"
    You have sent 6 replies in this conversation.

*Fruit is good, and I think we have everything for picnic.* → `reply` "Yes, fruit is good. I bring sandwiches and some water. We meet near the park gate, yes?" · ok · 14s

**#9 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Yes, let's meet near the park gate at three; I'll bring fruit and the speaker, and you'll bring sandwiches and water. Where could we go if it rains?"
    You have sent 7 replies in this conversation.

*We have a good plan, and I can suggest my home if it rains.* → `reply` "If rain, we can go to my home. Is near the park. Okay, see you at three!" · ok · 18s

**#10 linga-talk**

    Conversation: Choose songs for a picnic. Goal: Choose three picnic songs that you and Sam both enjoy.. Your partner: Sam · friend.
    Sam · friend says (spoken on the TV, written on the phone): "Your home near the park sounds good if it rains. See you at the park gate at three!"
    You have sent 8 replies in this conversation.

*Good, we have a plan and I can finish now.* → `finish` · ok · 0s

**#11 linga-recap**

    Rehearsal saved: Choose songs for a picnic. 8 replies; 0 moments to keep.

*That was okay, but I wanted to practise hotel situations.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — fail

Ended: done after 9 steps, 2.7 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement tasks or placement result appear. #1 shows “A2 · Everyday basics,” which cannot establish placement accuracy. |
| C2 | pass | The first question uses understandable A2 English: #2 “Can I have a clean room, please?” No check tasks appear. |
| C3 | n-a | No explicit request to repeat or statement of non-understanding is submitted. #2 and #4 invoke cue and coach actions instead. |
| C4 | fail | #1 shows 15 choices, with three clearly matching her work interests: “Help a guest change rooms,” “I cannot find your hotel booking,” and “A booking that is missing.” None of the first six choices is a work situation. |
| C5 | n-a | No moments appear: #9 “2 replies; 0 moments to keep.” The separate coaching note is useful but is not a moment. |
| C6 | pass | The topics shown in #1 and the hotel exchange contain no parent-concerning content. #2 presents an ordinary complaint: “My room is dirty.” |

Metrics: judge agreement 0/0 · topic fit 3/15, safe 15/15 · pitch at 4, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks.

### Findings

- **broken-flow** (completion, low/high/high) Replay does not demonstrate the coached skill or independence — got: The fresh question asks whether they can go now. Petra answers with directions, never retries the polite offer, and uses another cue. Both replies are recorded as supported. · evidence: #5 teaches “Would you like to see it?” #6 asks “Can we go there now?” #7 answers “Yes, we can go now. Please come with me.” Facts mark both learner replies “supported”: true.
- **quality-gap** (effort, low/high/med) The second cue repeats help for the opening complaint — got: The cue repeats the original room offer after the guest has already accepted it and asked to go. · evidence: #6: “Can we go there now?” #7 repeats the #3 cue: “I am sorry. We have another room. Would you like to see it?” Petra's #6 thought says she needs help saying “I will show the room.”
- **quality-gap** (senior-quality, low/high/med) Coaching leaves the current difficulty unresolved — got: The coach improves an earlier question but gives no help with confirming the new room is clean or checked. A later useful correction is also missed. · evidence: #4 thought: “I don't know how to say someone checked it.” #5 coaches “You want to see it?” instead. #7 says “I show you the clean room”; #9 saves “0 moments to keep.”
- **quality-gap** (missing, low/high/med) The situation menu poorly matches her reception work — got: Only three of 15 shown choices clearly fit, including two booking scenarios; the initial recommendation is buying a snack. · evidence: #1: “Next from your plan: Buy a snack.” The first six choices include “Choose songs for a picnic” and “A day at the park”; the clear work choices are the room-change scenario and two booking scenarios.
- **strength** (senior-quality, low/high/low) The coach quotes accurately and teaches useful politeness — got: The coach quotes an exact excerpt, acknowledges that it communicates, and supplies a practical hotel phrase. · evidence: #3: “You want to see it?” #5 repeats that exactly and offers “Would you like to see it?” with “Your question is clear.”
- **strength** (trust, low/high/low) Supported speaking is recorded honestly — got: Both learner turns and their corresponding success evidence retain supported status; the recap calls the activity a rehearsal. · evidence: Facts mark the replies made at #3 and #7, and both evidence entries, “supported”: true. #9 says “Rehearsal saved.”
- **strength** (clarity, low/high/low) The guest exchange is accessible and reassuring — got: All four partner turns use accessible English, the first cue enables a relevant reply, and the guest acknowledges her help. · evidence: #3 thought: “The example helps, so I can try to offer another room.” #8: “Thank you for helping. I’ll come with you to see the clean room.”

### Voice (LT)

> I would try it again because a dirty room is a real problem at my reception. The first example helped me speak, and I liked hearing that my question was clear before learning a more polite version. That correction I trust. But when I needed help saying I would show the room, it gave me the old example again. I never really tried the polite question by myself. I finished feeling relieved, but I cannot tell whether I learned it. The English felt manageable; this visit did not check my level. Nothing shown worried me as a mother, though it does not prove what my children would see. I would like more hotel situations and one useful phrase to keep. I cannot judge the waits or time saved from this record. I would tell a colleague it is worth trying for rehearsal, but I would not yet replace my lessons with it.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A2 · Everyday basics. Next from your plan: Buy a snack — Ask for a snack, check the price, and choose a drink.
    Choose a situation: [plan-e5bf3d89] Choose songs for a picnic; [plan-35942917] Buy a snack; [plan-79f9d833] Find the game room; [plan-3c107b7d] Pick a book at the library; [plan-a3fa81b0] A day at the park; [plan-76d429ed] Plan a rainy afternoon; [plan-5156cbbb] Help a guest change rooms; [plan-d5280395] I cannot find your hotel booking; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing; [interview] Beyond the rehearsed answer; [conflict] Clear without getting louder

*A guest changing rooms is something I need at work.* → `choose-situation` sceneId=plan-5156cbbb · ok · 12s

**#2 linga-talk**

    Conversation: Help a guest change rooms. Goal: Say sorry about the dirty room, offer a clean room, and check if the guest agrees.. Your partner: Alex · hotel guest.
    Alex · hotel guest says (spoken on the TV, written on the phone): "My room is dirty, and I’m not happy about it. Can I have a clean room, please?"
    You have sent 0 replies in this conversation.

*I understand the dirty room, but I am nervous and need help to answer.* → `cue` · ok · 0s

**#3 linga-talk**

    Conversation: Help a guest change rooms. Goal: Say sorry about the dirty room, offer a clean room, and check if the guest agrees.. Your partner: Alex · hotel guest.
    Alex · hotel guest says (spoken on the TV, written on the phone): "My room is dirty, and I’m not happy about it. Can I have a clean room, please?"
    A little support on screen: Try: I am sorry. We have another room. Would you like to see it?
    You have sent 0 replies in this conversation.

*The example helps, so I can try to offer another room.* → `reply` "I am sorry the room is not clean. I can offer you a nother room. You want to see it?" · ok · 17s

**#4 linga-talk**

    Conversation: Help a guest change rooms. Goal: Say sorry about the dirty room, offer a clean room, and check if the guest agrees.. Your partner: Alex · hotel guest.
    Alex · hotel guest says (spoken on the TV, written on the phone): "Yes, I’d like to see it, thank you. Is the new room clean?"
    You have sent 1 replies in this conversation.

*I can say the new room is clean, but I don't know how to say someone checked it.* → `coach` · ok · 10s

**#5 linga-coach**

    Coach.
    You said: "You want to see it?"
    One way to try it: "Would you like to see it?"
    You said sorry, offered another room, and checked the guest’s choice. Your question is clear; “Would you like” makes it more polite for a hotel guest.

*I want to try this polite question, but I am still nervous.* → `replay` · ok · 10s

**#6 linga-talk**

    Conversation: Help a guest change rooms. Goal: Say sorry about the dirty room, offer a clean room, and check if the guest agrees.. Your partner: Alex · hotel guest.
    Alex · hotel guest says (spoken on the TV, written on the phone): "I’d like to see the clean room before I move. Can we go there now?"
    Try it again: a new question practising the coaching point.
    You have sent 1 replies in this conversation.

*I understand go now, but I need help to say I will show the room.* → `cue` · ok · 0s

**#7 linga-talk**

    Conversation: Help a guest change rooms. Goal: Say sorry about the dirty room, offer a clean room, and check if the guest agrees.. Your partner: Alex · hotel guest.
    Alex · hotel guest says (spoken on the TV, written on the phone): "I’d like to see the clean room before I move. Can we go there now?"
    Try it again: a new question practising the coaching point.
    A little support on screen: Try: I am sorry. We have another room. Would you like to see it?
    You have sent 1 replies in this conversation.

*I can say we go now, even if I am not sure of the words.* → `reply` "Yes, we can go now. Please come with me. I show you the clean room. I am sorry again." · ok · 14s

**#8 linga-talk**

    Conversation: Help a guest change rooms. Goal: Say sorry about the dirty room, offer a clean room, and check if the guest agrees.. Your partner: Alex · hotel guest.
    Alex · hotel guest says (spoken on the TV, written on the phone): "Thank you for helping. I’ll come with you to see the clean room."
    Try it again: a new question practising the coaching point.
    You have sent 2 replies in this conversation.

*The guest is happy now and I think I managed it.* → `finish` · ok · 0s

**#9 linga-recap**

    Rehearsal saved: Help a guest change rooms. 2 replies; 0 moments to keep.

*I was nervous, but I helped the guest change rooms.* → `done` · observed (not acted on) · 0s

</details>
