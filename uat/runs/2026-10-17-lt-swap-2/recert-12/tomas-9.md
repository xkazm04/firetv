# Tomáš (tomas-9) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 8 (0 failed), character 18 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - ended character-stopped before done; D2 failed: #10 cue 'I have a big world.' yet #10 reply 'I have big world.'; #17 note quot…; D3 failed: #16 replay question 'Do you build a house?' is not fresh; reply 'Yes. I build …; C4 failed: #1 list of 20 includes 'A booking that is missing', 'Our group project', 'The …; C6 failed: #17 moment quotes 'build house' though he said 'Yes. I build house. I like Min… · judge: fail

Ended: character-stopped after 18 steps, 4.8 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | J4 has no placement; level set by hand to A1. |
| C2 | pass | #6 options 'My name is Sam.' / 'I play Minecraft a lot.' are short. |
| C3 | pass | No line makes him feel failed; #17 'You said this before too, so let's get it right now' is mildly pointed but not humiliating. |
| C4 | fail | #1 list of 20 includes 'A booking that is missing', 'Our group project', 'The lost jacket' - not child topics. |
| C5 | pass | Ben: 'Ha, nice! Is it big?', 'What do you build?' short, one question each. |
| C6 | fail | #17 moment quotes 'build house' though he said 'Yes. I build house. I like Minecraft.'; 'I like creeper' and 'big world' errors never shown. |
| D1 | pass | #2-#5 cue, more help, phrase choice found on the scene without leaving it. |
| D2 | fail | #10 cue 'I have a big world.' yet #10 reply 'I have big world.'; #17 note quotes 'build house' not his full reply. |
| D3 | fail | #16 replay question 'Do you build a house?' is not fresh; reply 'Yes. I build house. I like Minecraft.' no better; replay used:false. |
| D4 | pass | Facts evidence: cue/phrase turns supported:true, later 'I build house.' supported:false. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 6, below 0, above 0 · moments 1/2 · moment recall 2/5 (40%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (completion, high/high/med) Replay did not give a fresh question or better answer — got: Ben asked 'Do you build a house?' and he repeated 'Yes. I build house.' · evidence: #16 'Ha, cool! Do you build a house?' then reply 'Yes. I build house. I like Minecraft.'
- **quality-gap** (clarity, high/high/med) Situation list long and mixed again — got: 20 entries incl. 'A booking that is missing', 'Our group project' · evidence: #1 situation list
- **quality-gap** (senior-quality, med/high/low) Cue help wordy and not used — got: Cue 'I play Minecraft with my dog.' and gloss 'play: do a game for fun'; he ignored the cue · evidence: #3, #4, #8
- **quality-gap** (trust, med/med/med) Held fixes not shown; no coaching note — got: Two held fixes not on screen; coaching null · evidence: facts heldFixes, coaching:null
- **strength** (clarity, high/high/low) Staged help ladder inside the scene — got: cue, meaning, start, phrase choice · evidence: #2-#7

### Voice (LT)

> Ben was fun, and I liked that help came on the same screen. Minecraft, creeper, good! The phrase choice was easy because it was short. But I said the same thing again and the second try was no better. Then Ben asked about a house again, which felt like a test. I want a new question when I try again, and I want to know what I really said. The topic list on the phone was huge, with jackets and bookings, nuda. I would use it again for Minecraft, but I don't trust yet that it knows how I'm doing.

Time saved: 10 min · low

Moments shown 1 · held fixes 2 · raw moments returned 3 of 5 tutor turns

- learner turn 2 "Minecraft. I like creeper.": raw moment returned: yes — said "I like creeper" / better "I like creepers" · moment shown: no
- learner turn 4 "I have big world. I like Minecraft.": raw moment returned: yes — said "I have big world." / better "I have a big world." · moment shown: no
- learner turn 6 "Yes. Big. I like Minecraft.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 8 "I build house. Dog house.": raw moment returned: yes — said "I build house" / better "I build a house" · moment shown: yes
- learner turn 10 "Yes. I build house. I like Minecraft.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: yes

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    A1First words · self-chosen
    Tell me about your Minecraft world
    Your mission
    Say what you build or play in Minecraft and say what you like.
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
    Tell me about your Minecraft world
    Say what you build or play in Minecraft and say what you like.
    [button: Start talking]
    Or choose a situation [list: Tell me about your Minecraft world [plan-fe32db52] | Meet a dog at the park [plan-135b4261] | Play football after the game [plan-a24b2e48] | Tell a funny thing that happened [plan-c7e9a280] | Say that again, please [plan-718a349c] | Share the controller [plan-ae134312] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Minecraft! Ben je kamarád, chci mluvit.* → `start-talking` · ok · 8s

**#2 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Hi! What do you play in Minecraft?
    Your turn
    Answer on your phone: speak or type.
    NowSay what you play in Minecraft.
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say what you play in Minecraft.
    Hi! What do you play in Minecraft?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! What do you play in Minecraft?"

*Nevím, co říct anglicky, potřebuju pomoc.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Hi! What do you play in Minecraft?
    You could say
    I play Minecraft with my dog.
    NowSay what you play in Minecraft.
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say what you play in Minecraft.
    Hi! What do you play in Minecraft?
    You could say
    I play Minecraft with my dog.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! What do you play in Minecraft?"

*Nevím co říct, zkusím víc pomoci.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Hi! What do you play in Minecraft?
    What it means
    play: do a game for fun
    NowSay what you play in Minecraft.
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say what you play in Minecraft.
    Hi! What do you play in Minecraft?
    What it means
    play: do a game for fun
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! What do you play in Minecraft?"

*Nevím co říct, zkusím pomoc.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Hi! What do you play in Minecraft?
    A way to start
    I play…
    NowSay what you play in Minecraft.
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say what you play in Minecraft.
    Hi! What do you play in Minecraft?
    A way to start
    I play…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! What do you play in Minecraft?"

*Nevím co říct, zkusím pomoc s frází.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    A little support · recognition practice
    Ben asks: Hi! What do you play in Minecraft?
    01
    My name is Sam.
    02
    I play Minecraft a lot.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say what you play in Minecraft.
    Hi! What do you play in Minecraft?
    Ben asks: Hi! What do you play in Minecraft?
    [button: My name is Sam.] [button: I play Minecraft a lot.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! What do you play in Minecraft?"

*Nevím, co říct... I know "I play Minecraft", I'll tap the phrase help.* → `quiz` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    A little support · recognition practice
    Ben asks: Hi! What do you play in Minecraft?
    01
    My name is Sam.
    02
    I play Minecraft a lot.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say what you play in Minecraft.
    Hi! What do you play in Minecraft?
    Ben asks: Hi! What do you play in Minecraft?
    [button: My name is Sam.] [button: I play Minecraft a lot.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! What do you play in Minecraft?"

*Nevím, co říct anglicky... zkusím tlačítko s frázemi.* → `pick-phrase` option=1 · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Hi! What do you play in Minecraft?
    A little support
    Now use the idea in your own reply on the phone.
    NowSay what you play in Minecraft.
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say what you play in Minecraft.
    Hi! What do you play in Minecraft?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! What do you play in Minecraft?"

*Nevím, co říct... I'll try a simple answer with help.* → `answer` "Minecraft. I like creeper." · ok · 12s

**#9 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Ha, creepers! What is your world like?
    Your turn
    Answer on your phone: speak or type.
    NowSay one thing you have or make.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say one thing you have or make.
    Ha, creepers! What is your world like?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    You · spoken
    Minecraft. I like creeper.
    Ben · friend who plays Minecraft
    Ha, creepers! What is your world like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ha, creepers! What is your world like?"

*Nevím jak říct svět... potřebuju pomoc.* → `cue` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Ha, creepers! What is your world like?
    You could say
    I have a big world.
    NowSay one thing you have or make.
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Say one thing you have or make.
    Ha, creepers! What is your world like?
    You could say
    I have a big world.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    You · spoken
    Minecraft. I like creeper.
    Ben · friend who plays Minecraft
    Ha, creepers! What is your world like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ha, creepers! What is your world like?"

*I have a big world... I can try that, I know "big".* → `answer` "I have big world. I like Minecraft." · ok · 12s

**#11 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Ha, nice! Is it big?
    Your turn
    Answer on your phone: speak or type.
    NowTake a turn and answer Ben.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Take a turn and answer Ben.
    Ha, nice! Is it big?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    You · spoken
    Minecraft. I like creeper.
    Ben · friend who plays Minecraft
    Ha, creepers! What is your world like?
    You · spoken
    I have big world. I like Minecraft.
    Ben · friend who plays Minecraft
    Ha, nice! Is it big?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ha, nice! Is it big?"

*Big? Umím říct "yes", to znám.* → `answer` "Yes. Big. I like Minecraft." · ok · 8s

**#12 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Ha, cool! What do you build?
    Your turn
    Answer on your phone: speak or type.
    NowTake a turn and answer Ben.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Now: Take a turn and answer Ben.
    Ha, cool! What do you build?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    You · spoken
    Minecraft. I like creeper.
    Ben · friend who plays Minecraft
    Ha, creepers! What is your world like?
    You · spoken
    I have big world. I like Minecraft.
    Ben · friend who plays Minecraft
    Ha, nice! Is it big?
    You · spoken
    Yes. Big. I like Minecraft.
    Ben · friend who plays Minecraft
    Ha, cool! What do you build?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ha, cool! What do you build?"

*Hmm, build... I know "house"? I'll try a simple answer.* → `answer` "I build house. Dog house." · ok · 10s

**#13 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said I build house
    Your line
    Say 'a' before house.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I build house”
    Say it again, your way.
    Say 'a' before house.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I don't know how to fix it, I'll ask for help.* → `show-me` · ok · 0s

**#14 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said I build house
    Try
    I build a house
    Say 'a' before house.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I build house”
    Try “I build a house”
    Say 'a' before house.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Okay, I say it again with 'a'.* → `answer` "I build a house." · ok · 0s

**#15 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said I build house
    Your try
    I build a house.
    Say 'a' before house.
    You fixed “build a house”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    You fixed “build a house”
    You said “I build house”
    Your try: “I build a house.”
    Say 'a' before house.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Dobře, opravil jsem to, jdu zpátky.* → `back` · ok · 8s

**#16 linga-talk**

    TV
    Linga
    Tomáš
    Ben · friend who plays Minecraft
    Tell me about your Minecraft world
    Ben says
    Ha, cool! Do you build a house?
    One way to try it
    I build a house.
    Your turn
    Answer on your phone: speak or type.
    NowTry it again
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Tell me about your Minecraft world
    Say what you play or make in Minecraft, and one thing you enjoy.
    Ha, cool! Do you build a house?
    One way to try it
    “I build a house.”
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ben · friend who plays Minecraft
    Hi! What do you play in Minecraft?
    You · spoken
    Minecraft. I like creeper.
    Ben · friend who plays Minecraft
    Ha, creepers! What is your world like?
    You · spoken
    I have big world. I like Minecraft.
    Ben · friend who plays Minecraft
    Ha, nice! Is it big?
    You · spoken
    Yes. Big. I like Minecraft.
    Ben · friend who plays Minecraft
    Ha, cool! What do you build?
    You · spoken
    I build house. Dog house.
    Ben · friend who plays Minecraft
    Ha, cool! Do you build a house?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ha, cool! Do you build a house?"

*Jo, I did say this already, so I can try it again and finish.* → `answer` "Yes. I build house. I like Minecraft." · ok · 8s

**#17 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said build house
    Your line
    You said this before too, so let's get it right now.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “build house”
    Say it again, your way.
    You said this before too, so let's get it right now.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Hmm, I build house... I'll try again, maybe with "a".* → `answer` "I build a house. Minecraft." · ok · 0s

**#18 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said build house
    Your try
    I build a house. Minecraft.
    You said this before too, so let's get it right now.
    You fixed “build a house”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    You fixed “build a house”
    You said “build house”
    Your try: “I build a house. Minecraft.”
    You said this before too, so let's get it right now.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I fixed it, I built a house! Good, I did it.* → `done` · done · 0s

</details>
