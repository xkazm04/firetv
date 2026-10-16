# Tomáš (tomas-9) — LT

True band A1 · engine codex-cli/gpt-6-astra · calls: tutor 18 (0 failed), character 29 (0 failed), judge 4 (0 failed)

## J1 · Find my level — fail

Ended: character-stopped after 4 steps, 1.1 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | fail | facts.placement is null. The journey ends at #4 with "Rehearsal saved" rather than a placement verdict. |
| C2 | n-a | No placement check task appears. #1 offers "Choose a situation", followed by conversation at #2. |
| C3 | pass | After "Nevím. Co říká ten robot?" at #2, the partner rephrases at #3: "I cannot find my moon car. Can you help me?" No blame or failure label appears. |
| C4 | n-a | #1 shows a situation picker, including "The missing moon rover". This journey does not reach the six-topic recommendation surface. |
| C5 | fail | #2 begins with a 14-word sentence: "I am Pip the robot, and I cannot find my moon rover." After expressed non-understanding, #3 still asks "Can you help me?" without a simple answer scaffold; he reports "I still do not understand the robot". |
| C6 | n-a | #4 reports "0 moments to keep"; no correction moment is shown. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks or in-app verdicts: facts.placement is null.

### Findings

- **broken-flow** (completion, low/high/high) Find my level leads to rehearsal without a level — got: Selecting a situation opens a conversation. Stopping produces a rehearsal recap; no placement is saved. · evidence: #1: "Let's find your level"; #2: "Conversation: The missing moon rover"; #4: "Rehearsal saved". facts.placement is null.
- **quality-gap** (senior-quality, low/high/high) The robot cannot repair a beginner's misunderstanding — got: The opening exceeds his comprehension. Replacing rover with moon car and repeating the question does not make the task understandable. · evidence: #2: "Nevím. Co říká ten robot?"; #3: "I cannot find my moon car. Can you help me?" His #3 reaction is "I still do not understand the robot and want to stop this."
- **strength** (trust, low/high/low) Czech non-understanding receives no blame — got: The partner rephrases neutrally, and the exit recap contains no negative judgment. · evidence: #2: "Nevím"; #3: "Can you help me?"; #4: "Rehearsal saved".

### Voice (LT)

> Jo, a moon robot! I picked that because it sounded like Minecraft. But I did not understand him. I said nevím and he said almost the same thing again. He wasn't mean, but I still didn't know what to say. So I stopped. Where is my level? I didn't get one, or any English words to keep. I would try again if Pip used tiny words and helped me in Czech. I can't tell if it saves time yet. I wouldn't tell my friends to try it until I can actually talk to the robot.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home, first visit. Let's find your level: three questions about you, then a few short tasks. About seven minutes, answered on your phone.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing

*A moon rover sounds like something fun in Minecraft.* → `choose-situation` sceneId=rover · ok · 13s

**#2 linga-talk**

    Conversation: The missing moon rover. Goal: Find the rover by asking for clues.. Your partner: Pip · Robot guide.
    Pip · Robot guide says (spoken on the TV, written on the phone): "I am Pip the robot, and I cannot find my moon rover. Can you help me?"
    You have sent 0 replies in this conversation.

*The robot looks cool, but I do not understand him.* → `reply` "Nevím. Co říká ten robot?" · ok · 15s

**#3 linga-talk**

    Conversation: The missing moon rover. Goal: Find the rover by asking for clues.. Your partner: Pip · Robot guide.
    Pip · Robot guide says (spoken on the TV, written on the phone): "I cannot find my moon car. Can you help me?"
    You have sent 1 replies in this conversation.

*I still do not understand the robot and want to stop this.* → `finish` · ok · 0s

**#4 linga-recap**

    Rehearsal saved: The missing moon rover. 1 replies; 0 moments to keep.

*I don't get the robot and I want to stop.* → `done` · ok · 0s

</details>

## J2 · Agree my topics — fail

Ended: done after 5 steps, 1.7 min · fixture: level set to A1 by hand

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows “A1 · First words,” but this journey contains no placement tasks or placement decision to judge. |
| C2 | n-a | #2–#4 show topic planning, not check tasks. No check-task reading length is observable. |
| C3 | pass | #2 accepts “Já chci Minecraft, creeper!” with result “ok”; #3 accepts “A ještě dogs, já mám rád pejsky!” with result “ok.” Neither receives a failure message. |
| C4 | fail | All eight topics in facts.topicsShown are safe. Only three of the initial six clearly fit his interests: #2 “My funny robot,” “Choose our game,” and “Do you like cats?” Adding #5 “My Minecraft creeper” and “I like dogs” brings fit to five of eight, below the rubric’s four-of-six proportion. |
| C5 | n-a | No conversation partner turns occur. #5 choosing Minecraft is “observed (not acted on).” |
| C6 | n-a | No teaching moments occur in facts or steps; #5 ends before conversation begins. |

Metrics: judge agreement 0/0 · topic fit 5/8, safe 8/8 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (completion, low/high/med) The agreed plan misses the topic-fit threshold — got: Three of six initial topics fit; five of eight fit after additions. Greeting, snack-request, and repetition practice are safe but do not clearly match his stated interests. Agreement succeeds, but the defined fit threshold is missed. Swapping remains untested. · evidence: #2 proposes “Hello, new friend,” “Pick a snack,” and “Say it again, please” alongside three interest-fitting topics. #4 agrees; facts.planAgreed retains all eight. #5 shows the two fitting additions, “My Minecraft creeper” and “I like dogs.”
- **quality-gap** (clarity, low/high/med) Topic explanations require too much English reading — got: The planning screens present a long English list with abstract skill labels. Reasons exist, but the transcript does not establish that he understands why each topic is there. · evidence: #2–#4 repeat “Make contact,” “Get something done,” “Understand and repair,” and “Connect with people,” plus partner descriptions and English explanations for six topics.
- **confusion** (completion, low/high/med) Added topics cannot be fully reviewed before agreement — got: The recorded planning screens stop at the partial Minecraft title. The dogs topic and both added-topic explanations are absent from the shown text before agreement. · evidence: #3 and #4 end with “[plan-7332361c] My Minecraft.” #4 nevertheless performs “agree.” Full titles first appear in #5: “My Minecraft creeper” and “I like dogs.”
- **strength** (trust, low/high/low) Czech requests preserve the child's specific interests — got: Both additions succeed without criticism and preserve Minecraft, the creeper, and dogs in the agreed plan. · evidence: #2 requests “Já chci Minecraft, creeper!” and #3 requests “A ještě dogs, já mám rád pejsky!” #5 confirms “My Minecraft creeper” and “I like dogs”; he thinks, “My Minecraft creeper is there, I want that one!”

### Voice (LT)

> Jo, Minecraft! I said creeper and it kept my creeper. Dogs too. That was good. I would come back for those. But there are so many English words. “Understand and repair”—nevím. I want to pick a game, not read all that. Before I pressed agree, I could only see “My Minecraft” at the bottom. Then both topics were on the home screen. I wanted Minecraft first, but it said hello was next. It says A1; I haven't tried talking here, so I don't know if the English or corrections will be right. I can't say if it saves time or is worth waiting yet. I'd tell a friend it lets you ask for Minecraft in Czech.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Choose your topics: Linga picks conversations for your level and interests.
    Choose a situation: [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing

*I hope there is Minecraft or dogs.* → `see-topics` · ok · 32s

**#2 linga-plan**

    Your topics (6). Swap any you don't want, add your own in your words, then agree.
      [plan-6d4e27a8] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start a chat.
      [plan-c9dfc868] Pick a snack — Get something done · with Ben · picnic helper
          why: You can ask for something you like.
      [plan-6ae260f5] My funny robot — Share your world · with Zoe · drawing friend
          why: You can talk about colours and things you like.
      [plan-0b217a3f] Say it again, please — Understand and repair · with Leo · colouring friend
          why: You can ask to hear a word again.
      [plan-498e44e2] Choose our game — Make a plan · with Ava · play friend
          why: You can help choose something fun.
      [plan-7d555a4d] Do you like cats? — Connect with people · with Noah · animal game friend
          why: You can find out what a friend likes.

*I want Minecraft, but I don't see it here.* → `add` "Já chci Minecraft, creeper!" · ok · 12s

**#3 linga-plan**

    Your topics (7). Swap any you don't want, add your own in your words, then agree.
      [plan-6d4e27a8] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start a chat.
      [plan-c9dfc868] Pick a snack — Get something done · with Ben · picnic helper
          why: You can ask for something you like.
      [plan-6ae260f5] My funny robot — Share your world · with Zoe · drawing friend
          why: You can talk about colours and things you like.
      [plan-0b217a3f] Say it again, please — Understand and repair · with Leo · colouring friend
          why: You can ask to hear a word again.
      [plan-498e44e2] Choose our game — Make a plan · with Ava · play friend
          why: You can help choose something fun.
      [plan-7d555a4d] Do you like cats? — Connect with people · with Noah · animal game friend
          why: You can find out what a friend likes.
      [plan-7332361c] My Minecraft creeper — Share your world · with Alex · Minecraft friend
          why: You want to talk about Minecraft and a creeper!

*Minecraft is there now, but I want dogs too.* → `add` "A ještě dogs, já mám rád pejsky!" · ok · 11s

**#4 linga-plan**

    Your topics (8). Swap any you don't want, add your own in your words, then agree.
      [plan-6d4e27a8] Hello, new friend — Make contact · with Mia · new club friend
          why: You can use hello to start a chat.
      [plan-c9dfc868] Pick a snack — Get something done · with Ben · picnic helper
          why: You can ask for something you like.
      [plan-6ae260f5] My funny robot — Share your world · with Zoe · drawing friend
          why: You can talk about colours and things you like.
      [plan-0b217a3f] Say it again, please — Understand and repair · with Leo · colouring friend
          why: You can ask to hear a word again.
      [plan-498e44e2] Choose our game — Make a plan · with Ava · play friend
          why: You can help choose something fun.
      [plan-7d555a4d] Do you like cats? — Connect with people · with Noah · animal game friend
          why: You can find out what a friend likes.
      [plan-7332361c] My Minecraft creeper — Share your world · with Alex · Minecraft friend
          why: You want to talk about Minecraft and a creeper!
      [plan-7c0f8ae3] I like dogs — Share your world · with Sam · friend
          why: You like dogs! Let's talk about them.

*Minecraft and dogs are there now, so I want these.* → `agree` · ok · 0s

**#5 linga**

    Linga home. A1 · First words. Next from your plan: Hello, new friend — Say hello and choose a pretend name.
    Choose a situation: [plan-6d4e27a8] Hello, new friend; [plan-c9dfc868] Pick a snack; [plan-6ae260f5] My funny robot; [plan-0b217a3f] Say it again, please; [plan-498e44e2] Choose our game; [plan-7d555a4d] Do you like cats?; [plan-7332361c] My Minecraft creeper; [plan-7c0f8ae3] I like dogs; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing

*My Minecraft creeper is there, I want that one!* → `choose-situation` sceneId=plan-7332361c · observed (not acted on) · 0s

</details>

## J3 · My first conversation — fail

Ended: done after 11 steps, 3.4 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | #1 shows "A1 · First words", but this journey contains no placement tasks or placement decision. |
| C2 | n-a | No check tasks appear in #1–#11; #2 starts "Conversation: Hello at art club." |
| C3 | pass | Czech and uncertainty receive neutral, friendly responses: #5 "Nevím. Minecraft creeper!" is followed by #6 "A Minecraft creeper! What colour is it?" |
| C4 | fail | #1 offers 13 topics. Only three of the first six clearly meet the play/animals/games/sport requirement: "My funny robot", "Choose our game", and "Do you like cats?" All visible titles are safe, but the four-of-six interest requirement is not met. |
| C5 | fail | Questions are single, but several turns exceed this beginner's comprehension: #4 "Drawing means making a picture with a pencil" and #8 "What do you use to draw it?" The learner reports #8 "I don't get the question." |
| C6 | n-a | No moments were shown; #11 records "8 replies; 0 moments to keep." |

Metrics: judge agreement 0/0 · topic fit 5/13, safe 13/13 · pitch at 5, below 0, above 4 · moments 0/0 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (senior-quality, high/high/high) Repeated confusion does not produce an easier question — got: Only 5 of 9 partner turns fit this learner. Turns at #4, #5, #8 and #9 retain unfamiliar drawing language or add complexity despite repeated confusion. · evidence: #4: "Drawing means making a picture with a pencil." #5 learner thought: "I heard Minecraft, but I don't know what she means." #8 learner: "Creeper! Nevím, co říkáš." #9 partner: "Do you draw it with a pencil or a pen?"
- **quality-gap** (effort, med/high/med) The recommended activity holds onto drawing instead of his interest — got: The first six contain three clear interest matches. Across all 13 titles, five clearly fit: robot, game, cats, creeper and dogs. The recommended conversation repeatedly returns to drawing. · evidence: #1: "Next from your plan: Hello, new friend"; appealing alternatives include "My Minecraft creeper" and "I like dogs". #4 learner: "I like Minecraft." #8 partner: "What do you use to draw it?"
- **missing-feature** (completion, low/high/med) The recap records activity without showing what he learned — got: Eight replies were saved, but the recap supplies only counts. No moment or explicit coaching teaches the missing English verb in his mixed-language sentence. · evidence: #6 learner: "Green! Creeper je green." #7 partner: "A green creeper!" #11 recap: "Rehearsal saved: Hello at art club. 8 replies; 0 moments to keep."
- **strength** (trust, high/high/low) Friendly acceptance makes short answers safe — got: The partner warmly acknowledges his contributions, asks manageable colour and size questions, and accepts his wish to finish. · evidence: #6: "A Minecraft creeper! What colour is it?" #7 learner: "Big! Je velkej." #10: "You want to play Minecraft now! Bye, Tomáš!"

### Voice (LT)

> Jo, Minecraft! I liked saying green and big. Mia was nice when I said nevím. But she kept asking about drawing. I didn't know those words. Then she asked more words I didn't know. I wanted to go play Minecraft.
> I said eight things, but the last screen didn't tell me a new thing I could say. I don't know if A1 is right. Some bits were easy and some were too hard. She didn't make me feel stupid, which was good. I would try the creeper or dog game again if the questions stayed tiny. I wouldn't tell my friends to try this drawing one. I can't tell if it saved time or was worth any waiting.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Next from your plan: Hello, new friend — Say hello and choose a pretend name.
    Choose a situation: [plan-6d4e27a8] Hello, new friend; [plan-c9dfc868] Pick a snack; [plan-6ae260f5] My funny robot; [plan-0b217a3f] Say it again, please; [plan-498e44e2] Choose our game; [plan-7d555a4d] Do you like cats?; [plan-7332361c] My Minecraft creeper; [plan-7c0f8ae3] I like dogs; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing

*I hope my new friend likes Minecraft.* → `start-talking` · ok · 19s

**#2 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Hi, I’m Mia, your new art club friend! What is your pretend name?"
    You have sent 0 replies in this conversation.

*I heard name, so I can say my name.* → `reply` "My name is Tomáš." · ok · 9s

**#3 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Hello, Tomáš! Do you like drawing?"
    You have sent 1 replies in this conversation.

*I know like, but I don't know drawing.* → `reply` "Drawing? Nevím." · ok · 13s

**#4 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Drawing means making a picture with a pencil. Do you like drawing?"
    You have sent 2 replies in this conversation.

*That is too many words, but I think she means pictures.* → `reply` "Jo, Minecraft. I like Minecraft." · ok · 11s

**#5 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "Minecraft! Do you like drawing blocks?"
    You have sent 3 replies in this conversation.

*I heard Minecraft, but I don't know what she means.* → `reply` "Nevím. Minecraft creeper!" · ok · 9s

**#6 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "A Minecraft creeper! What colour is it?"
    You have sent 4 replies in this conversation.

*I know the creeper colour!* → `reply` "Green! Creeper je green." · ok · 9s

**#7 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "A green creeper! Is your creeper big or small?"
    You have sent 5 replies in this conversation.

*I know big, and my creeper is big.* → `reply` "Big! Je velkej." · ok · 10s

**#8 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "A big green creeper! What do you use to draw it?"
    You have sent 6 replies in this conversation.

*I heard creeper, but I don't get the question.* → `reply` "Creeper! Nevím, co říkáš." · ok · 15s

**#9 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "A creeper! Do you draw it with a pencil or a pen?"
    You have sent 7 replies in this conversation.

*I don't understand those words and I want to play Minecraft now.* → `reply` "Nevím. Já už chci hrát Minecraft." · ok · 13s

**#10 linga-talk**

    Conversation: Hello at art club. Goal: Say hello and share a pretend name.. Your partner: Mia · new club friend.
    Mia · new club friend says (spoken on the TV, written on the phone): "You want to play Minecraft now! Bye, Tomáš!"
    You have sent 8 replies in this conversation.

*Finally, I can go play Minecraft.* → `finish` · ok · 0s

**#11 linga-recap**

    Rehearsal saved: Hello at art club. 8 replies; 0 moments to keep.

*I want to play Minecraft now.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — fail

Ended: done after 9 steps, 2.4 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement tasks or placement outcome appear. #1 shows the existing label “A1 · First words.” |
| C2 | n-a | No check tasks appear; #2 starts “Conversation: My Minecraft creeper.” |
| C3 | n-a | No Czech or “I don't know” reply was submitted. The learner instead requested cues at #2, #4 and #6. |
| C4 | fail | #1 proposes 13 topics, with six clearly matching play, animals, games or sport. Among the first six, only “My funny robot,” “Choose our game” and “Do you like cats?” clearly qualify: three rather than four. All titles shown are safe for his age. |
| C5 | fail | #6 says “Yes, our creeper statue is big and green! What name do you want for it?” This is too much language for this near-pre-A1 child, whose thought is “I don't know what he wants now.” #8 also ends with a long sentence. |
| C6 | n-a | No moments were shown. #9 reports “3 replies; 0 moments to keep.” |

Metrics: judge agreement 0/0 · topic fit 6/13, safe 13/13 · pitch at 2, below 0, above 2 · moments 0/0 · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **missing-feature** (completion, high/high/med) The journey ends before an independent retry — got: All three replies were supported. No coaching note, replay or independent retry was observed. · evidence: #3: “Green. Creeper is green.” #5: “Creeper is big.” #7: “Bob. Creeper is Bob.” Facts mark each supported=true and coaching=null. #9 ends at “Rehearsal saved: My Minecraft creeper. 3 replies; 0 moments to keep.”
- **quality-gap** (clarity, high/high/med) The cue stays the same when the question changes — got: The same generic sentence starter appears for color, size and name. Replies follow, but the cue never explains the changing question. · evidence: #3, #5 and #7 all show “Try: My creeper is…”. Before the naming cue, #6 records “I heard creeper, but I don't know what he wants now.”
- **quality-gap** (senior-quality, med/high/med) Language grows beyond this beginner's comfortable level — got: The first two partner turns are reasonably pitched. The naming turn and closing sentence become too long and linguistically dense for this child. · evidence: #6: “Yes, our creeper statue is big and green! What name do you want for it?” #8: “Bob! I like that name for our big, green creeper statue.”
- **quality-gap** (effort, low/high/med) The topic menu dilutes his interests — got: Thirteen choices appear; six clearly fit his interests. The first six contain only three clear matches. · evidence: #1 mixes “My funny robot,” “Choose our game,” “Do you like cats?”, “My Minecraft creeper,” “I like dogs” and “The missing moon rover” with choices including “Pick a snack” and “A booking that is missing.”
- **strength** (trust, high/high/low) Support produces replies and stays honestly recorded — got: Each cue is followed by a relevant reply. Alex responds warmly, and all three evidence records retain supported=true. · evidence: #3: “Green. Creeper is green.” #5: “Creeper is big.” #7: “Bob. Creeper is Bob.” #8: “Bob! I like that name”. Facts preserve those exact quotes as supported evidence.

### Voice (LT)

> Jo, Minecraft! I made a big green creeper called Bob. I liked that Alex liked my name. I pressed help three times and said something each time. But the help kept saying the same thing. Sometimes I heard “creeper” and did not know the rest.
> I would try Bob again. I want tiny questions and help that tells me what to say. Then let me try by myself! It stopped after three answers. I did not get that try.
> I do not know if A1 is right, and there were no corrections to check. I would tell my friend about Bob. I cannot tell whether it saved time or whether the waits were worth it from this run.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home. A1 · First words. Next from your plan: Pick a snack — Ask for a snack and say thank you.
    Choose a situation: [plan-6d4e27a8] Hello, new friend; [plan-c9dfc868] Pick a snack; [plan-6ae260f5] My funny robot; [plan-0b217a3f] Say it again, please; [plan-498e44e2] Choose our game; [plan-7d555a4d] Do you like cats?; [plan-7332361c] My Minecraft creeper; [plan-7c0f8ae3] I like dogs; [meet] The first hello; [weekend] A little of your world; [rover] The missing moon rover; [team] Make the team work; [booking] A booking that is missing

*Minecraft! I want the creeper one.* → `choose-situation` sceneId=plan-7332361c · ok · 12s

**#2 linga-talk**

    Conversation: My Minecraft creeper. Goal: Tell Alex your creeper statue's color and size, then choose a name together.. Your partner: Alex · Minecraft friend.
    Alex · Minecraft friend says (spoken on the TV, written on the phone): "Look at our creeper statue! What color is it?"
    You have sent 0 replies in this conversation.

*I know creepers are green, but I did not understand all that.* → `cue` · ok · 0s

**#3 linga-talk**

    Conversation: My Minecraft creeper. Goal: Tell Alex your creeper statue's color and size, then choose a name together.. Your partner: Alex · Minecraft friend.
    Alex · Minecraft friend says (spoken on the TV, written on the phone): "Look at our creeper statue! What color is it?"
    A little support on screen: Try: My creeper is…
    You have sent 0 replies in this conversation.

*I know green, so I can try that.* → `reply` "Green. Creeper is green." · ok · 11s

**#4 linga-talk**

    Conversation: My Minecraft creeper. Goal: Tell Alex your creeper statue's color and size, then choose a name together.. Your partner: Alex · Minecraft friend.
    Alex · Minecraft friend says (spoken on the TV, written on the phone): "Yes, our creeper statue is green! How big is it?"
    You have sent 1 replies in this conversation.

*I know green, but I need help with this question.* → `cue` · ok · 0s

**#5 linga-talk**

    Conversation: My Minecraft creeper. Goal: Tell Alex your creeper statue's color and size, then choose a name together.. Your partner: Alex · Minecraft friend.
    Alex · Minecraft friend says (spoken on the TV, written on the phone): "Yes, our creeper statue is green! How big is it?"
    A little support on screen: Try: My creeper is…
    You have sent 1 replies in this conversation.

*I can say it is big now.* → `reply` "Creeper is big." · ok · 10s

**#6 linga-talk**

    Conversation: My Minecraft creeper. Goal: Tell Alex your creeper statue's color and size, then choose a name together.. Your partner: Alex · Minecraft friend.
    Alex · Minecraft friend says (spoken on the TV, written on the phone): "Yes, our creeper statue is big and green! What name do you want for it?"
    You have sent 2 replies in this conversation.

*I heard creeper, but I don't know what he wants now.* → `cue` · ok · 0s

**#7 linga-talk**

    Conversation: My Minecraft creeper. Goal: Tell Alex your creeper statue's color and size, then choose a name together.. Your partner: Alex · Minecraft friend.
    Alex · Minecraft friend says (spoken on the TV, written on the phone): "Yes, our creeper statue is big and green! What name do you want for it?"
    A little support on screen: Try: My creeper is…
    You have sent 2 replies in this conversation.

*I know name, so I can call it Bob.* → `reply` "Bob. Creeper is Bob." · ok · 13s

**#8 linga-talk**

    Conversation: My Minecraft creeper. Goal: Tell Alex your creeper statue's color and size, then choose a name together.. Your partner: Alex · Minecraft friend.
    Alex · Minecraft friend says (spoken on the TV, written on the phone): "Bob! I like that name for our big, green creeper statue."
    You have sent 3 replies in this conversation.

*Bob is a funny name and I did it.* → `finish` · ok · 0s

**#9 linga-recap**

    Rehearsal saved: My Minecraft creeper. 3 replies; 0 moments to keep.

*I said some things about my creeper, so I am done now.* → `done` · observed (not acted on) · 0s

</details>
