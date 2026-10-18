# Tomáš (tomas-9) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 4 (0 failed), character 12 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: #8 he typed 'I like creeper. Dog.' after the phrase choice, not the offered ph…; D3 failed: #11 offered 'Replay the moment' but he pressed finish at #11; no fresh questio…; C4 failed: #1 list has 20 situations incl. 'A booking that is missing', 'Our group projec…; C6 failed: #11 'with an s, the usual way to say it' is abstract for a 9-year-old; also th… · judge: fail

Ended: done after 12 steps, 2.9 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement in this journey; level set by hand to A1. |
| C2 | pass | #7 recognition task: 'Which sentence tells what you build?' with two short options, under 15 words. |
| C3 | pass | No line made him feel he failed; #11 'Good: you told Leo what you like.' |
| C4 | fail | #1 list has 20 situations incl. 'A booking that is missing', 'Our group project', 'The lost jacket', school-like and travel items, unsuited to a nine-year-old who wants play. |
| C5 | pass | #9 'Creepers are cool! Do you build a house in Minecraft?' two short sentences, one question, known words. |
| C6 | fail | #11 'with an s, the usual way to say it' is abstract for a 9-year-old; also the note drops 'Dog.' and the fix 'I like dogs' changes what he said. |
| D1 | pass | #2-#10 Help me answer, Choose a phrase and Pause & coach found in-scene; #11 coach screen reached without leaving Leo's conversation. |
| D2 | fail | #8 he typed 'I like creeper. Dog.' after the phrase choice, not the offered phrase; the help (#3 'I build a ___') did not shape the reply. #11 note quotes 'I like creeper.' and omits 'Dog.', so not what he really said. |
| D3 | fail | #11 offered 'Replay the moment' but he pressed finish at #11; no fresh question and no better answer shown, #12 ended. |
| D4 | pass | #12 '0 on your own · 1 with help'; evidence marks supported:true for both quotes. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 1, below 0, above 0 · moments 0/0 · moment recall 1/1 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (completion, high/high/med) Replay with fresh question never exercised — got: Finished at coach screen; no retry and no better answer shown. · evidence: #11 'Replay the moment' / 'Finish for today'; he chose finish; #12 '0 on your own'.
- **quality-gap** (senior-quality, high/high/med) Coaching note abstract and drops what he said — got: 'with an s, the usual way to say it'; the quote omits 'Dog.' · evidence: #11 'You said I like creeper.' vs #8 'I like creeper. Dog.'
- **quality-gap** (clarity, med/high/med) Cue generic and help loop repeated — got: Help pressed 4 times with the same 'Try: I build a ___. It is ___.' · evidence: #3-#6 identical cue.
- **quality-gap** (clarity, high/high/low) Situation list long and mixed — got: 20 entries incl. booking, lost jacket, group project. · evidence: #1 list.
- **strength** (clarity, high/high/low) Partner turns tiny and on topic — got: 'Creepers are cool! Do you build a house in Minecraft?' and a simpler version. · evidence: #9, #10.
- **strength** (trust, high/high/low) Supported reply recorded honestly — got: '0 on your own · 1 with help'. · evidence: #12.

### Voice (LT)

> Leo was fun, Minecraft! I liked the question about creepers. But I pressed help four times and got the same "I build a ___" every time, which was boring. Then I typed my own thing anyway. The coach said something about "an s", and I didn't understand that. It also forgot I said "Dog". I wanted to try again with a new question, but I just finished. It said I did it with help, so I think that's fair. Would I use it again? Maybe, for Minecraft. The long list of situations with jackets and bookings looks like school. Mum would like that it didn't make me feel bad.

Time saved: 20 min · low

Moments shown 0 · held fixes 0 · raw moments returned 0 of 1 tutor turns

- learner turn 2 "I like creeper. Dog.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    A1First words · self-chosen
    What do you build in Minecraft?
    Your mission
    Say what you like to build and where, using simple words.
    Share your world
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    What do you build in Minecraft?
    Say what you like to build and where, using simple words.
    [button: Start talking]
    Or choose a situation [list: What do you build in Minecraft? [plan-349e0606] | My funny dog moment [plan-376f331b] | Hi, I play football too [plan-25de960a] | Can you say that again? [plan-99b71905] | Let's play Minecraft on Saturday [plan-5410297d] | Say no, but be kind [plan-f2bb79c6] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Minecraft! I want to talk to Leo.* → `start-talking` · ok · 9s

**#2 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    What do you make in Minecraft?
    Your turn
    Answer on your phone: speak or type.
    NowTell Leo one thing you make
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    What do you make in Minecraft?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Nevím, co říct anglicky, potřebuju pomoc.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    NowTell Leo one thing you make
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Nevím, co říct. Potřebuju pomoc.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    NowTell Leo one thing you make
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Nevím jak říct... I need help, press Help me answer.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    NowTell Leo one thing you make
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Nevím, co říct... I need help.* → `cue` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    NowTell Leo one thing you make
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Nevím jak to říct, zkusím tu pomoc znovu.* → `quiz` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    A little support · recognition practice
    Which sentence tells what you build?
    01
    I build a red house.
    02
    I go to the shop.
    A little support
    Try: I build a ___. It is ___.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    What do you make in Minecraft?
    A little support
    Try: I build a ___. It is ___.
    Which sentence tells what you build?
    [button: I build a red house.] [button: I go to the shop.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Nevím, co říct anglicky, ale první věta je o domu, to znám.* → `pick-phrase` option=0 · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    What do you make in Minecraft?
    A little support
    Now use the idea in your own reply on the phone.
    NowTell Leo one thing you make
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    What do you make in Minecraft?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Nevím co říct, zkusím Repeat nebo napovědu... už jsem klikal, zkusím odpovědět sám.* → `answer` "I like creeper. Dog." · ok · 9s

**#9 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    Creepers are cool! Do you build a house in Minecraft?
    Your turn
    Answer on your phone: speak or type.
    NowTell Leo one thing you make
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    Creepers are cool! Do you build a house in Minecraft?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    You · spoken
    I like creeper. Dog.
    Leo · Minecraft friend
    Creepers are cool! Do you build a house in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Creepers are cool! Do you build a house in Minecraft?"

*Nevím, co říct, potřebuju pomoc.* → `cue` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Tomáš
    Leo · Minecraft friend
    What do you make in Minecraft?
    Leo says
    Creepers are cool! Do you build a house in Minecraft?
    Said more simply
    Creepers are cool! Do you build a house?
    NowTell Leo one thing you make
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    Creepers are cool! Do you build a house in Minecraft?
    Said more simply
    Creepers are cool! Do you build a house?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    You · spoken
    I like creeper. Dog.
    Leo · Minecraft friend
    Creepers are cool! Do you build a house in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Creepers are cool! Do you build a house in Minecraft?"

*Nevím, co říct... I need help with the house question.* → `coach` · ok · 8s

**#11 linga-coach**

    TV
    Linga
    Tomáš
    A way into English
    One useful change
    You said I like creeper.
    One way to try it
    I like creepers. I like dogs.
    Good: you told Leo what you like. Try 'I like creepers' with an s, the usual way to say it. Then you can answer his question about building.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    What do you make in Minecraft?
    Tell Leo one thing you make in Minecraft and where it is.
    Now: Tell Leo one thing you make
    Good: you told Leo what you like. Try 'I like creepers' with an s, the usual way to say it. Then you can answer his question about building.
    One way to try it: “I like creepers. I like dogs.”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Leo · Minecraft friend
    What do you make in Minecraft?
    You · spoken
    I like creeper. Dog.
    Leo · Minecraft friend
    Creepers are cool! Do you build a house in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good: you told Leo what you like. Try 'I like creepers' with an s, the usual way to say it. Then you can answer his question about building."

*I said something with help, I feel I managed it, so finish.* → `finish` · ok · 0s

**#12 linga-recap**

    TV
    Linga
    Tomáš
    A way into English
    Your rehearsal
    You said I like creeper.
    One way to try it
    I like creepers. I like dogs.
    Good: you told Leo what you like. Try 'I like creepers' with an s, the usual way to say it. Then you can answer his question about building.
    Your mission
    Choose a fresh context for your next conversation.
    1 spoken · 0 written replies · 0 on your own · 1 with help
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “I build a red house.”
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    My funny dog moment
    Tell what happened first, next and last, with a simple result.
    [button: Start talking]
    Or choose a situation [list: What do you build in Minecraft? [plan-349e0606] | My funny dog moment [plan-376f331b] | Hi, I play football too [plan-25de960a] | Can you say that again? [plan-99b71905] | Let's play Minecraft on Saturday [plan-5410297d] | Say no, but be kind [plan-f2bb79c6] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Zvládl jsem říct něco o creeperovi a psovi, stačilo, končím.* → `done` · observed (not acted on) · 0s

</details>
