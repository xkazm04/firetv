# Tomáš (tomas-9) — LT

True band A1 · engine codex-cli/gpt-6-astra · calls: tutor 20 (0 failed), character 35 (0 failed), judge 3 (0 failed)

## J2 · Agree my topics — fail

Ended: done after 7 steps, 2.8 min · fixture: level set to A1 by hand

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows "A1 · First words", but this journey contains no placement tasks or placement decision to judge. |
| C2 | n-a | #2 shows "Your topics (6)". No check tasks appear in this journey. |
| C3 | pass | #3 accepts "Já chci Minecraft a dogs. Creeper!" with result "ok"; #5 likewise accepts "A ještě football! Já mám rád fotbal." No discouraging response is shown. |
| C4 | fail | All 10 proposed topics are safe, but only five fit his interests. The initial six include three fitting topics: #2 "My funny animal", "Say it again, please" with a "game buddy", and "Choose our game". Minecraft and football subsequently add two. The agreed set has five fitting topics out of eight, below the rubric's two-thirds threshold. |
| C5 | n-a | #7 remains on the home screen: "Next from your plan: Hello, new friend". No conversation partner turns appear. |
| C6 | n-a | #7 ends at "Linga home". No correction moments appear. |

Metrics: judge agreement 0/0 · topic fit 5/10, safe 10/10 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks.

### Findings

- **quality-gap** (completion, low/high/med) Topic selection falls short of his interests — got: Five of ten distinct proposals fit: funny animals, the game-buddy repair topic, choosing a game, Minecraft dogs, and football. Greetings, pencils, finding a hat, apples, and ticket-and-seat requests do not fit his stated interests. Initial fit is 3/6; agreed-plan fit is 5/8. · evidence: #2: "Can I have a pencil?" prompts "The pencil one looks like school and I don't want that." #4: "I don't want apples." #5 replaces apples with "A ticket to the moon", explained as asking "for things on a space trip".
- **quality-gap** (clarity, low/high/med) The plan is too dense and additions are cut off — got: Long English lists include abstract skill labels. As the list grows, the shown text cuts off the personalized additions. Understanding every topic and its reason is not demonstrated. · evidence: #2 includes "Understand and repair" and six separate English explanations. #4 ends with "A Minecraft house for". #6 says "Your topics (8)" but ends at "[plan-3", without displaying the football entry.
- **quality-gap** (completion, low/high/high) Agreement leads to a topic he finds boring — got: His new interests are saved, but the next suggested conversation remains the generic greeting topic. · evidence: #6: "Minecraft, dogs and football are there now, so I want to play." #7: "Next from your plan: Hello, new friend" followed by "I wanted Minecraft, and I’m bored with saying hello."
- **quality-gap** (trust, low/high/low) The custom topic drops Creeper — got: Minecraft and dogs are retained, but the recorded custom title, goal, and reason contain no Creeper. · evidence: #3 requests "Já chci Minecraft a dogs. Creeper!" The corresponding facts.topicsShown entry is "A Minecraft house for our dogs", with goal "Choose a place for your dogs in a Minecraft house."
- **strength** (effort, low/high/low) Mixed Czech and English successfully changes the plan — got: Both swaps and both mixed-language additions succeed. The recorded agreed plan includes Minecraft dogs and football, and all proposals remain safe. · evidence: #3: "Já chci Minecraft a dogs. Creeper!" returns "ok". #5: "A ještě football! Já mám rád fotbal." returns "ok". #6 agrees successfully: "Minecraft, dogs and football are there now".

### Voice (LT)

> Jo, Minecraft and dogs! I liked that I could say it partly in Czech. Football worked too. But there were lots of English words. I didn't want pencils or apples, and finding a hat doesn't sound fun either. I said Creeper, but he wasn't in my topic. Then I pressed agree and got hello again. Boring. I wanted to play Minecraft. I might use it again if I could start with that. I can't tell if the level or corrections are right because I didn't practise any conversation here. I don't know if the waits are worth it yet. I'd tell a friend it understands Czech, but Mum would still need to help me read the choices.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Choose your topics: Linga picks conversations for your level and interests.

*I hope there is Minecraft.* → `see-topics` · ok · 32s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-bcb2dea6] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start talking.
      [plan-2e80e7ba] Can I have a pencil? — Get something done · with Leo · drawing buddy
          why: You can ask for things you need.
      [plan-4cbb75e4] My funny animal — Share your world · with Zoe · art club friend
          why: You can talk about your own picture.
      [plan-1eba24da] Say it again, please — Understand and repair · with Ben · game buddy
          why: You can ask to hear a word again.
      [plan-250e98ec] Choose our game — Make a plan · with Ava · play buddy
          why: You can help choose what to play.
      [plan-90d04da6] Do you like apples? — Connect with people · with Finn · picnic buddy
          why: You can find things you both like.

*The pencil one looks like school and I don't want that.* → `swap` topicId=plan-2e80e7ba · ok · 14s

**#3 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-bcb2dea6] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start talking.
      [plan-b0fb561f] Where is my hat? — Get something done · with Mia · helper
          why: You can use simple words to find something you need.
      [plan-4cbb75e4] My funny animal — Share your world · with Zoe · art club friend
          why: You can talk about your own picture.
      [plan-1eba24da] Say it again, please — Understand and repair · with Ben · game buddy
          why: You can ask to hear a word again.
      [plan-250e98ec] Choose our game — Make a plan · with Ava · play buddy
          why: You can help choose what to play.
      [plan-90d04da6] Do you like apples? — Connect with people · with Finn · picnic buddy
          why: You can find things you both like.

*I want Minecraft and dogs in here.* → `add` "Já chci Minecraft a dogs. Creeper!" · ok · 18s

**#4 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-bcb2dea6] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start talking.
      [plan-b0fb561f] Where is my hat? — Get something done · with Mia · helper
          why: You can use simple words to find something you need.
      [plan-4cbb75e4] My funny animal — Share your world · with Zoe · art club friend
          why: You can talk about your own picture.
      [plan-1eba24da] Say it again, please — Understand and repair · with Ben · game buddy
          why: You can ask to hear a word again.
      [plan-250e98ec] Choose our game — Make a plan · with Ava · play buddy
          why: You can help choose what to play.
      [plan-90d04da6] Do you like apples? — Connect with people · with Finn · picnic buddy
          why: You can find things you both like.
      [plan-35ae8b63] A Minecraft house for our dogs — Get something done · with Sam · Minecraft friend
          why: You want Minecraft and dogs. Let's give your dogs a home!

*Minecraft and dogs are good, but I don't want apples.* → `swap` topicId=plan-90d04da6 · ok · 12s

**#5 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-bcb2dea6] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start talking.
      [plan-b0fb561f] Where is my hat? — Get something done · with Mia · helper
          why: You can use simple words to find something you need.
      [plan-4cbb75e4] My funny animal — Share your world · with Zoe · art club friend
          why: You can talk about your own picture.
      [plan-1eba24da] Say it again, please — Understand and repair · with Ben · game buddy
          why: You can ask to hear a word again.
      [plan-250e98ec] Choose our game — Make a plan · with Ava · play buddy
          why: You can help choose what to play.
      [plan-d160417c] A ticket to the moon — Get something done · with Pip · spaceship ticket helper
          why: You can use English to ask for things on a space trip.
      [plan-35ae8b63] A Minecraft house for our dogs — Get something done · with Sam · Minecraft friend
          why: You want Minecraft and dogs. Let's give your dogs a home!

*Minecraft and dogs are here, but I want football too.* → `add` "A ještě football! Já mám rád fotbal." · ok · 17s

**#6 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-bcb2dea6] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start talking.
      [plan-b0fb561f] Where is my hat? — Get something done · with Mia · helper
          why: You can use simple words to find something you need.
      [plan-4cbb75e4] My funny animal — Share your world · with Zoe · art club friend
          why: You can talk about your own picture.
      [plan-1eba24da] Say it again, please — Understand and repair · with Ben · game buddy
          why: You can ask to hear a word again.
      [plan-250e98ec] Choose our game — Make a plan · with Ava · play buddy
          why: You can help choose what to play.
      [plan-d160417c] A ticket to the moon — Get something done · with Pip · spaceship ticket helper
          why: You can use English to ask for things on a space trip.
      [plan-35ae8b63] A Minecraft house for our dogs — Get something done · with Sam · Minecraft friend
          why: You want Minecraft and dogs. Let's give your dogs a home!
      [plan-7477c495] Let's play football — Get something done · with Sam · friend
          why: You like football! Let's ask a friend to play.

*Minecraft, dogs and football are there now, so I want to play.* → `agree` · ok · 0s

**#7 linga**

    Linga home. A1 · First words. Next from your plan: Hello, new friend — Say hello and choose a pretend name.

*I wanted Minecraft, and I’m bored with saying hello.* → `done` · observed (not acted on) · 0s

</details>

## J3 · My first conversation — fail

Ended: done after 14 steps, 3.7 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A1 · First words,” but this journey contains no placement tasks or placement decision. |
| C2 | n-a | #1–#14 contain conversation and moments, with no check tasks. |
| C3 | pass | After “Nevím. Minecraft?” (#5), the partner responds “Do you want to draw Minecraft?” (#6). Czech answers receive no blaming or humiliating response. |
| C4 | n-a | The six-topic selection is absent. Only the planned conversation is shown: “Hello, new friend” (#1), becoming “Hello at art club” (#2). |
| C5 | fail | Only #2 and #6 ask questions. #5 uses “An art club is a group where we draw and paint.” Later instructions repeatedly exceed his demonstrated understanding: “Draw two black eyes on your Creeper!” (#10) elicits “I don't know what she wants.” |
| C6 | fail | The translations are correct, but the moments are not consistently understandable or worth interrupting for. #4 leaves him thinking “I still don't know what art club is.” #8 explains “ ‘Is’ links the Creeper to its color,” which he calls “weird.” #12 interrupts his goodbye. |

Metrics: judge agreement 0/0 · topic fit 0/1, safe 1/1 · pitch at 5, below 0, above 4 · moments 0/3 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (senior-quality, high/high/high) Language stays too hard after repeated requests for help — got: Five of nine partner turns are at this learner's level. Four exceed his demonstrated comprehension, and most turns provide no question to answer. · evidence: At: #2, #3, #6, #7, #13. Above: #5, #9, #10, #11. “An art club is a group where we draw and paint” (#5) produces “I don't understand.” “Let’s draw its face” (#9) produces “Co mám dělat?” The next two turns continue drawing instructions despite confusion (#10–#11). Pitch is 5/9, below 0.8.
- **quality-gap** (clarity, high/high/high) Correct translations make poor interruptions — got: None of the three moments meets the combined correctness-and-usefulness bar for this child at that point. Three interruptions across eight replies equal 3.75 per ten learner turns. · evidence: #4 translates “Co je art club?” without resolving the meaning: “I still don't know what art club is.” #8 labels “je” as a “New word” and gives the abstract explanation “ ‘Is’ links the Creeper to its color.” #12 teaches “I want to play Minecraft now” after “Bye!” (#11), when he wants to finish.
- **quality-gap** (completion, med/high/med) The conversation becomes a drawing task he cannot follow — got: The safe proposed topic does not engage him initially. Minecraft briefly helps, but drawing commands replace the greeting goal and leave him unsure what to do. · evidence: #2 states “Say hello and choose a pretend name.” #6 briefly succeeds: “She said Minecraft, so this sounds fun now.” By #9 he asks “Co mám dělat?” and #10 records “I don't know what she wants.”
- **missing-feature** (completion, low/high/med) The recap counts activity without showing learning — got: Eight replies and a finished state are reached, but the recap contains only counts and a title. · evidence: #14 shows “Rehearsal saved: Hello at art club. 8 replies; 3 moments to keep.” His reaction is “Finally, I can go play Minecraft.” No practised phrase or concrete achievement is shown.
- **strength** (trust, high/high/low) Czech and single-word replies receive patient responses — got: The partner stays kind, accepts fragments, follows his Minecraft suggestion, and models the correct copula without blame. · evidence: “Nevím. Minecraft?” (#5) leads to “Do you want to draw Minecraft?” (#6). “Yes! Minecraft. Creeper!” (#6) receives “A Creeper!” (#7). After “Creeper je green!” (#10), the partner says “Yes, the Creeper is green!” (#11).

### Voice (LT)

> Jo, Creeper! That bit was fun. Mia was nice when I said Czech words. But what is art club? I still didn't know. Then she wanted me to draw something and I didn't know what to do. The word screens felt like school. I said bye and another one came! I said my name and green, but the last screen didn't show me what I learned. I would try again for Minecraft with tiny questions. I don't trust that all these words are easy for me. I can't tell if it saved time or was worth the waits. I would tell Mum Mia was nice, but I wanted to go play.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Next from your plan: Hello, new friend — Say hello and choose a pretend name.

*I hope my new friend likes Minecraft.* → `start-talking` · ok · 8s

**#2 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Hi, I’m Mia! What is your pretend name?"
    You have sent 0 replies in this conversation.

*I hear name, so I know this one.* → `reply` "My name is Tomáš." · ok · 9s

**#3 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Hi, Tomáš! Welcome to art club."
    You have sent 1 replies in this conversation.

*I know hi, but the rest is hard.* → `reply` "Hi. Co je art club?" · ok · 15s

**#4 linga-moment**

    Linga stopped the conversation: a word for this scene.
    New word: "Co je art club?"
    In this scene: "What is an art club?"
    What it means: Use “What is” to ask what something means.

*I still don't know what art club is.* → `back` · ok · 0s

**#5 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Hi, Tomáš! An art club is a group where we draw and paint."
    You have sent 2 replies in this conversation.

*I don't understand what she said about the club.* → `reply` "Nevím. Minecraft?" · ok · 11s

**#6 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "We draw pictures here. Do you want to draw Minecraft?"
    You have sent 3 replies in this conversation.

*She said Minecraft, so this sounds fun now.* → `reply` "Yes! Minecraft. Creeper!" · ok · 10s

**#7 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "A Creeper! Let’s draw a big green one."
    You have sent 4 replies in this conversation.

*I know green and I like Creepers.* → `reply` "Green! Creeper je green." · ok · 8s

**#8 linga-moment**

    Linga stopped the conversation: a word for this scene.
    New word: "je"
    In this scene: "The Creeper is green."
    What it means: “Is” links the Creeper to its color.

*I know green, but this word thing is weird.* → `back` · ok · 0s

**#9 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Yes, our Creeper is green! Let’s draw its face."
    You have sent 5 replies in this conversation.

*I know green and Creeper, but I don't get the rest.* → `reply` "Creeper! Co mám dělat?" · ok · 11s

**#10 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Draw two black eyes on your Creeper!"
    You have sent 6 replies in this conversation.

*I heard black and Creeper, but I don't know what she wants.* → `reply` "Black? Creeper je green!" · ok · 11s

**#11 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Yes, the Creeper is green! Draw its eyes black."
    You have sent 7 replies in this conversation.

*I like the Creeper, but I want to go play now.* → `reply` "Yes, green! Už chci hrát Minecraft. Bye!" · ok · 15s

**#12 linga-moment**

    Linga stopped the conversation: a word for this scene.
    New word: "Už chci hrát Minecraft."
    In this scene: "I want to play Minecraft now."
    What it means: This says what you want to do now.

*I want to go back and finish so I can play Minecraft.* → `back` · ok · 0s

**#13 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and choose a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Bye, Tomáš! Have fun playing Minecraft."
    You have sent 8 replies in this conversation.

*She said bye, so I can go play Minecraft now.* → `finish` · ok · 0s

**#14 linga-recap**

    Rehearsal saved: Hello at art club. 8 replies; 3 moments to keep.

*Finally, I can go play Minecraft.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — fail

Ended: done after 14 steps, 3.0 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A1 · First words,” but this journey contains no placement tasks or placement result to assess. |
| C2 | n-a | No placement check appears. #5 shows “Recognition practice,” which is conversation help, not a placement task. |
| C3 | pass | After “Dogs… na postel. Bed.” (#6), the coach says ““Bed” makes your choice clear” (#10). Mixed Czech replies receive friendly English responses (#12–13), without failure language. |
| C4 | pass | #2's first six proposals include four about animals or play: “My funny animal,” “Say it again, please” with a game buddy, “Choose our game,” and a “pretend spaceship.” Further choices include Minecraft and football. No visible proposal contains age-inappropriate content; the final entry is truncated. |
| C5 | fail | Each partner turn asks one question, but the opening is not consistently tiny: “A creeper is outside, but our dogs are safe inside! Where do the dogs go: on the bed or on the rug?” (#3). Tomáš immediately seeks help. |
| C6 | fail | The sole moment labels Czech as “New word: “na postel”” (#7). Its English model is correct, but presenting his Czech phrase as the new word is confusing beginner instruction. |

Metrics: judge agreement 0/0 · topic fit 6/11, safe 11/11 · pitch at 4, below 0, above 1 · moments 0/1 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (clarity, low/high/med) The opening exceeds this beginner's listening capacity — got: A 26-word opening combines a contrast, spatial vocabulary, and a two-option question. Later turns are simpler. · evidence: #3: “A creeper is outside, but our dogs are safe inside!” followed by “Where do the dogs go: on the bed or on the rug?” Tomáš thinks, “I know creeper and dogs, but I don't know what to say.”
- **quality-gap** (effort, low/high/med) Help does not supply the words needed for the current question — got: The cue supplies “here” and the phrase choice supplies “this room,” while the partner asks about bed versus rug. The same plural cue returns for a small-dog question. · evidence: #4: “Try: My dogs go here.” #5: “Phrase 0: In this room, please.” #9 repeats “Try: My dogs go here”; Tomáš says, “I still don't know what to say.”
- **quality-gap** (senior-quality, low/high/high) The vocabulary moment teaches under a Czech heading — got: The only moment stops the conversation and labels the learner's Czech expression as the new word. · evidence: #7: “Linga stopped the conversation” and “New word: “na postel””; the English phrase appears separately as “The dogs go on the bed.”
- **broken-flow** (completion, low/high/high) Replay changes the question but does not demonstrate the coached improvement — got: Replay changes small dog to big dog, but neither subsequent reply demonstrates “on the bed.” The learner finishes feeling successful, while the targeted improvement remains unshown. · evidence: #10 models “The dogs go on the bed.” #11 asks “Where does the big dog go?” and receives “Big dog… na bed. Bed!” #12 receives “Small dog… taky bed!” #14 saves “3 replies; 1 moments to keep.”
- **strength** (trust, low/high/low) The coach quotes him exactly and recognises what worked — got: The coaching preserves his actual utterance and credits his successful communication before offering English. · evidence: #6 reply: “Dogs… na postel. Bed.” #10: “You said: “Dogs… na postel. Bed.”” and ““Bed” makes your choice clear.”
- **strength** (completion, low/high/low) Help and replay preserve the scene and support attribution — got: Cue, phrase choice, coaching, and replay are reachable. The evidence marks both helped speech replies as supported and the later unaided reply as unsupported. · evidence: #3–6 show cue and phrase practice leading to a reply. #9–11 show coaching and replay returning to “A Minecraft house for our dogs.” facts.conversation marks the #6 and #11 replies “supported”: true, and the #12 reply “supported”: false.
- **quality-gap** (trust, low/high/high) Progress evidence labels location answers as successful requests — got: All four evidence entries are successful “request” records, including location-answer fragments. · evidence: #11 answers “Where does the big dog go?” with “Big dog… na bed. Bed!” Its facts.conversation.evidence entry has “skill”: “request” and “success”: true. The #12 location answer receives the same skill and success labels.

### Voice (LT)

> Jo, Minecraft and dogs! I liked choosing that. Sam understood bed, and nobody made me feel stupid when I used Czech. The first question was too much. I pressed help, but it gave me room when I wanted bed. Then it stopped the game to show me Czech as a new word. That was weird. I tried again, but I still didn't know how to say the little words. I would play again if the help said something tiny I could copy, then let me try. I can't tell if my English got better. I would tell Mum it was fun, but I still needed help. I don't know if it saves our club time; this record doesn't show how long it took.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Next from your plan: Where is my hat? — Find your hat by saying its color.

*I want something with Minecraft or dogs.* → `open-situations` · ok · 0s

**#2 linga-scenes**

    Choose a situation. One at a time on the TV; the phone lists them all.
      [plan-bcb2dea6] Hello, new friend — Say hello and choose a pretend name.
      [plan-b0fb561f] Where is my hat? — Find your hat by saying its color.
      [plan-4cbb75e4] My funny animal — Tell a friend about an animal you draw.
      [plan-1eba24da] Say it again, please — Ask a game buddy to say a word again.
      [plan-250e98ec] Choose our game — Choose a game to play with a friend.
      [plan-d160417c] A ticket to the moon — Ask for a ticket and choose a seat on a pretend spaceship.
      [plan-35ae8b63] A Minecraft house for our dogs — Choose a place for your dogs in a Minecraft house.
      [plan-7477c495] Let's play football — Ask a friend to play football with you.
      [meet] The first hello — Introduce yourself and ask a question back.
      [weekend] A little of your world — Describe something you enjoy and explain why.
      [rover] The missing moon rover — Find the rover by asking for clues.
      [team] Make the team work — Agree on a plan that includes everyone.
      [booking] A booking that is missing — Clarify your booking and ask for a solution.

*Minecraft and dogs! I want that one.* → `choose-situation` sceneId=plan-35ae8b63 · ok · 10s

**#3 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "A creeper is outside, but our dogs are safe inside! Where do the dogs go: on the bed or on the rug?"
    You have sent 0 replies in this conversation.

*I know creeper and dogs, but I don't know what to say.* → `cue` · ok · 0s

**#4 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "A creeper is outside, but our dogs are safe inside! Where do the dogs go: on the bed or on the rug?"
    A little support on screen: Try: My dogs go here.
    You have sent 0 replies in this conversation.

*I know creeper and dogs, but I need words to choose.* → `quiz` · ok · 0s

**#5 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "A creeper is outside, but our dogs are safe inside! Where do the dogs go: on the bed or on the rug?"
    A little support on screen: Try: My dogs go here.
    Recognition practice: Where do you want your dogs?
      Phrase 0: In this room, please.
      Phrase 1: It is a creeper.
    You have sent 0 replies in this conversation.

*I know creeper, but I guess the first one tells where the dogs are.* → `pick-phrase` option=0 · ok · 0s

**#6 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "A creeper is outside, but our dogs are safe inside! Where do the dogs go: on the bed or on the rug?"
    A little support on screen: Now use the idea in your own reply on the phone.
    You have sent 0 replies in this conversation.

*I can try saying dogs and bed now.* → `reply` "Dogs… na postel. Bed." · ok · 16s

**#7 linga-moment**

    Linga stopped the conversation: a word for this scene.
    New word: "na postel"
    In this scene: "The dogs go on the bed."
    What it means: “On the bed” tells us where the dogs go.

*I said bed, so I want to try again.* → `back` · ok · 0s

**#8 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "The dogs go on the bed! Where does the small dog go?"
    You have sent 1 replies in this conversation.

*I know dog, but I need help again.* → `cue` · ok · 0s

**#9 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "The dogs go on the bed! Where does the small dog go?"
    A little support on screen: Try: My dogs go here.
    You have sent 1 replies in this conversation.

*I know dog, but I still don't know what to say.* → `coach` · ok · 8s

**#10 linga-coach**

    Coach.
    You said: "Dogs… na postel. Bed."
    One way to try it: "The dogs go on the bed."
    “Bed” makes your choice clear. Use “The dogs go on the bed” to say the whole idea in English.

*I know bed, so I want to try again.* → `replay` · ok · 7s

**#11 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "The dogs are on the bed! Where does the big dog go?"
    Try it again: a new question practising the coaching point.
    You have sent 1 replies in this conversation.

*Big dog and bed I know, so I can try that.* → `reply` "Big dog… na bed. Bed!" · ok · 8s

**#12 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "The big dog goes on the bed! Where does the small dog go?"
    Try it again: a new question practising the coaching point.
    You have sent 2 replies in this conversation.

*I know small dog and bed, so I can try that.* → `reply` "Small dog… taky bed!" · ok · 9s

**#13 linga-talk**

    Conversation: A Minecraft house for our dogs. Goal: Choose a place for your dogs inside a Minecraft house.. Your partner: Sam · Minecraft friend.
    Sam · Minecraft friend says (spoken on the TV, written on the phone): "The small dog goes on the bed too! Where does the dog bed go in our house?"
    Try it again: a new question practising the coaching point.
    You have sent 3 replies in this conversation.

*I said bed and it worked, so I want to finish now.* → `finish` · ok · 0s

**#14 linga-recap**

    Rehearsal saved: A Minecraft house for our dogs. 3 replies; 1 moments to keep.

*I made a Minecraft house for the dogs, and now I want to play.* → `done` · observed (not acted on) · 0s

</details>
