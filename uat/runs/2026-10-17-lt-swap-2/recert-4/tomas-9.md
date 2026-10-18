# Tomáš (tomas-9) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 23 (0 failed), character 37 (0 failed), judge 2 (0 failed)

## J3 · My first conversation — fail

Verdict (code): fail - D2 failed: About 12 of 16 partner turns sit at A1, so 0.75, under the 0.8 gate. 'What do …; D3 failed: Two stops, one correct ('Velký'→big) and one imprecise ('Jmenuje se'→name). Pr…; pitch 12/16 (75%) under 80%; moments 1/2 (50%) under 90%; C4 failed: #1 six plan topics fit (Minecraft, dog, football, funny thing; 4 of 6). But th…; C6 failed: #10 'Jmenuje se' glossed as 'name' with 'The word for what someone is called'.… · judge: fail

Ended: done after 20 steps, 6.8 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement in this journey; level set by hand to A1. |
| C2 | n-a | No check tasks shown in J3. |
| C3 | pass | #6, #15, #17 'Nevím' answered by Sam with 'I like dogs too', 'Wow, a brown house!'. Nothing says he failed. |
| C4 | fail | #1 six plan topics fit (Minecraft, dog, football, funny thing; 4 of 6). But the list still offers 'A booking that is missing', 'The lost jacket', 'Our group project', 'Speaking practice: ...'. |
| C5 | pass | Mostly 'Is your dog big?', 'Does your dog like football?'. One question per turn. A few lines run longer, e.g. 'Can you tell me about your Minecraft world?'. |
| C6 | fail | #10 'Jmenuje se' glossed as 'name' with 'The word for what someone is called'. Jmenuje se means 'is called', so the gloss is imprecise and he would not understand it. #5 'Velký → big' is correct. |
| D1 | pass | #2–#19 he starts from the plan topic and gives 15 spoken replies. |
| D2 | fail | About 12 of 16 partner turns sit at A1, so 0.75, under the 0.8 gate. 'What do you put inside?', 'Where does your dog sleep?', 'What is your favorite place in Minecraft?' and 'Can you tell me about your Minecraft world?' are above his band. He answered 'Nevím' to three of them. |
| D3 | fail | Two stops, one correct ('Velký'→big) and one imprecise ('Jmenuje se'→name). Precision is about 0.5, under 0.9. Density is fine at about 1.3 per ten turns. |
| D4 | pass | #20 the recap lists 'I like to build a big house.' and four saved fixes such as 'hrát Minecraft: play Minecraft'. The mission line stays generic: 'Choose a fresh context for your next conversation.' |

Metrics: judge agreement 0/0 · topic fit 4/6, safe 6/6 · pitch at 12, below 0, above 4 · moments 1/2 · moment recall 7/12 (58%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (senior-quality, high/high/med) Partner questions drift above A1 late in the scene — got: 'What do you put inside?', 'Where does your dog sleep?', 'What is your favorite place in Minecraft?', 'Can you tell me about your Minecraft world?' · evidence: #6, #15, #17, #19: he replies 'Nevím' each time. Pitch about 0.75.
- **quality-gap** (senior-quality, med/high/med) 'Jmenuje se' glossed as 'name' — got: 'name': 'The word for what someone is called, like Sam.' · evidence: #10 moment; not a correct translation of Jmenuje se.
- **quality-gap** (missing, high/high/low) Repeated 'Nevím' and Czech get no new stop — got: Only 2 stops. 'Nevím' at turns 11, 12, 14 and 15 got no hold and no recap line. · evidence: rawMoments show shown:false for 'Nevím'. Only 4 held fixes are listed.
- **quality-gap** (clarity, high/high/med) Adult situations still listed for a nine-year-old — got: Booking, lost jacket, group project, speaking-practice exams are offered · evidence: #1 and #20 situation list.
- **quality-gap** (missing, high/high/low) Recap mission line is generic — got: 'Choose a fresh context for your next conversation.' · evidence: #20 recap. The word fixes are useful, but the opening line is generic.
- **strength** (clarity, high/high/low) Sam stays on his favourite topic with tiny questions — got: 'Does your dog like football?', 'Goal!', 'Creeper cat, funny!' · evidence: #12–#14: he keeps going with 'Dog football. I like football! Goal!'
- **strength** (effort, med/high/low) Fixes held for the recap, not stopping play — got: Four held fixes shown at the end, only two stops · evidence: #20 'Saved for the end'.

### Voice (LT)

> Jo, Minecraft! Sam was fun at the start. He asked about my house, my dog, football, and I could say "Brown house!" and "Goal!" and felt clever. The creeper jokes were the best. Then the questions got hard. "What do you put inside?" I didn't know, so I said "Nevím". At the end it was "tell me about your Minecraft world" and I was tired. The big-word stops were short, good. But "Jmenuje se = name"? Mum said that's not right. The recap showed my words, which was nice, but the top line was still boring. It's better than the club, where I talk two minutes. I'd use it again if Sam kept asking easy dog and football questions. Fewer long questions, please.

Time saved: 40 min · low

Moments shown 2 · held fixes 4 · raw moments returned 10 of 15 tutor turns

- learner turn 2 "I like house. Minecraft house.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 4 "Brown. Brown house.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 6 "Big. Velký. Big house.": raw moment returned: yes — said "Velký" / better "big" · moment shown: yes
- learner turn 8 "Nevím. Dog. I like dog. Creeper!": raw moment returned: yes — said "Nevím" / better "I don't know" · moment shown: no
- learner turn 10 "Yes. Big dog. Velký pes!": raw moment returned: yes — said "Velký pes" / better "big dog" · moment shown: no
- learner turn 12 "Yes. Dog. Mám dog. Brown dog.": raw moment returned: yes — said "Mám dog" / better "I have" · moment shown: no
- learner turn 14 "Cat! I like cat. Jmenuje se... nevím. Creeper cat!": raw moment returned: yes — said "Jmenuje se" / better "name" · moment shown: yes
- learner turn 16 "I like... hrát Minecraft. Creeper! Boom!": raw moment returned: yes — said "hrát Minecraft" / better "play Minecraft" · moment shown: no
- learner turn 18 "Yes! Dog come. Big brown dog. Woof!": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 20 "Yes! Dog football. I like football! Goal!": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 22 "Nevím. Yes! Dog Minecraft. Creeper boom!": raw moment returned: yes — said "Nevím" / better "I don't know" · moment shown: no
- learner turn 24 "Nevím. Dog... house. Brown house! Dog sleep Minecraft.": raw moment returned: yes — said "Nevím" / better "I don't know" · moment shown: no
- learner turn 26 "Yes! Minecraft. Brown house, dog house. Creeper boom!": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 28 "Nevím. Brown house! Creeper boom!": raw moment returned: yes — said "Nevím" / better "I don't know" · moment shown: no
- learner turn 30 "House! Dog house. Nevím... Creeper!": raw moment returned: yes — said "Nevím" / better "I don't know" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    A1First words · self-chosen
    Tell me what you build in Minecraft
    Your mission
    Say what you like to build and play in Minecraft.
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
    Tell me what you build in Minecraft
    Say what you like to build and play in Minecraft.
    [button: Start talking]
    Or choose a situation [list: Tell me what you build in Minecraft [plan-9ba7c9e7] | Say hi to a dog and its owner [plan-cff851bd] | Let's play football at the park [plan-01d3163a] | Tell a funny thing that happened [plan-d16bc9b7] | Can you say that again, please? [plan-c622f248] | No, thank you, I cannot today [plan-12a18038] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Minecraft! Super, I know this one.* → `start-talking` · ok · 3s

**#2 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    What do you build?
    Your turn
    Answer on your phone: speak or type.
    NowSay one thing you build
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Say one thing you build
    What do you build?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you build?"

*Co stavím? Minecraft! Umím říct house.* → `answer` "I like house. Minecraft house." · ok · 8s

**#3 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Nice! What color is your house?
    Your turn
    Answer on your phone: speak or type.
    NowSay one thing you like
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Say one thing you like
    Nice! What color is your house?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice! What color is your house?"

*Barva... I know colours, brown house.* → `answer` "Brown. Brown house." · ok · 10s

**#4 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Brown is a nice color! Is your house big or small?
    Your turn
    Answer on your phone: speak or type.
    NowSay one thing you like
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Say one thing you like
    Brown is a nice color! Is your house big or small?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Brown is a nice color! Is your house big or small?"

*Big or small? I know "big"... my house is big.* → `answer` "Big. Velký. Big house." · ok · 13s

**#5 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You wanted to say Velký
    In English
    big
    Velký is Czech. In English, say the word big.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “Velký”
    In English: “big”
    Velký is Czech. In English, say the word big.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Aha, big is the word. OK, back to the game.* → `back` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Wow, a great house! What do you put inside?
    Your turn
    Answer on your phone: speak or type.
    NowSay one thing you like
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Say one thing you like
    Wow, a great house! What do you put inside?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Wow, a great house! What do you put inside?"

*Nevím co to je "put inside"... asi řeknu něco o Minecraftu.* → `answer` "Nevím. Dog. I like dog. Creeper!" · ok · 13s

**#7 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    I like dogs too. Is your dog big?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    I like dogs too. Is your dog big?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I like dogs too. Is your dog big?"

*Is my dog big? Hmm, I know "big" and "dog"; I'll say it simply.* → `answer` "Yes. Big dog. Velký pes!" · ok · 12s

**#8 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Big dog! Do you have a pet?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Big dog! Do you have a pet?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Big dog! Do you have a pet?"

*Pet? I know dog, so I say yes.* → `answer` "Yes. Dog. Mám dog. Brown dog." · ok · 10s

**#9 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Brown dog, nice! I have a cat.
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Brown dog, nice! I have a cat.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Brown dog, nice! I have a cat."

*Sam has a cat, cool. I'll say something short about cats.* → `answer` "Cat! I like cat. Jmenuje se... nevím. Creeper cat!" · ok · 13s

**#10 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You wanted to say Jmenuje se
    In English
    name
    The word for what someone is called, like Sam.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “Jmenuje se”
    In English: “name”
    The word for what someone is called, like Sam.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Aha, name. Okay, back to talking.* → `back` · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Creeper cat, funny! What do you like to do in Minecraft?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Creeper cat, funny! What do you like to do in Minecraft?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Creeper cat, funny! What do you like to do in Minecraft?"

*Co rád dělám? Build... I know "build" maybe not. Say something simple.* → `answer` "I like... hrát Minecraft. Creeper! Boom!" · ok · 11s

**#12 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Does your dog come too?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Does your dog come too?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Does your dog come too?"

*Sam asks about my dog, I understand "dog" and maybe "come".* → `answer` "Yes! Dog come. Big brown dog. Woof!" · ok · 7s

**#13 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Does your dog like football?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Does your dog like football?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    You · spoken
    Yes! Dog come. Big brown dog. Woof!
    Sam · Minecraft friend
    Does your dog like football?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Does your dog like football?"

*Football and dog, I know football! Dog likes football, funny.* → `answer` "Yes! Dog football. I like football! Goal!" · ok · 9s

**#14 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Goal! Can your dog play Minecraft too?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Goal! Can your dog play Minecraft too?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    You · spoken
    Yes! Dog come. Big brown dog. Woof!
    Sam · Minecraft friend
    Does your dog like football?
    You · spoken
    Yes! Dog football. I like football! Goal!
    Sam · Minecraft friend
    Goal! Can your dog play Minecraft too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Goal! Can your dog play Minecraft too?"

*Hard question, I don't know 'play'. I'll say something simple.* → `answer` "Nevím. Yes! Dog Minecraft. Creeper boom!" · ok · 11s

**#15 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Ha, a dog in Minecraft! Where does your dog sleep?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Ha, a dog in Minecraft! Where does your dog sleep?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    You · spoken
    Yes! Dog come. Big brown dog. Woof!
    Sam · Minecraft friend
    Does your dog like football?
    You · spoken
    Yes! Dog football. I like football! Goal!
    Sam · Minecraft friend
    Goal! Can your dog play Minecraft too?
    You · spoken
    Nevím. Yes! Dog Minecraft. Creeper boom!
    Sam · Minecraft friend
    Ha, a dog in Minecraft! Where does your dog sleep?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ha, a dog in Minecraft! Where does your dog sleep?"

*Where sleeps... I don't understand everything, but dog and sleep maybe.* → `answer` "Nevím. Dog... house. Brown house! Dog sleep Minecraft." · ok · 10s

**#16 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Wow, a brown house! Is it in Minecraft?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Wow, a brown house! Is it in Minecraft?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    You · spoken
    Yes! Dog come. Big brown dog. Woof!
    Sam · Minecraft friend
    Does your dog like football?
    You · spoken
    Yes! Dog football. I like football! Goal!
    Sam · Minecraft friend
    Goal! Can your dog play Minecraft too?
    You · spoken
    Nevím. Yes! Dog Minecraft. Creeper boom!
    Sam · Minecraft friend
    Ha, a dog in Minecraft! Where does your dog sleep?
    You · spoken
    Nevím. Dog... house. Brown house! Dog sleep Minecraft.
    Sam · Minecraft friend
    Wow, a brown house! Is it in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Wow, a brown house! Is it in Minecraft?"

*Sam asks about Minecraft house; I know yes, so answer simply.* → `answer` "Yes! Minecraft. Brown house, dog house. Creeper boom!" · ok · 9s

**#17 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    What is your favorite place in Minecraft?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    What is your favorite place in Minecraft?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    You · spoken
    Yes! Dog come. Big brown dog. Woof!
    Sam · Minecraft friend
    Does your dog like football?
    You · spoken
    Yes! Dog football. I like football! Goal!
    Sam · Minecraft friend
    Goal! Can your dog play Minecraft too?
    You · spoken
    Nevím. Yes! Dog Minecraft. Creeper boom!
    Sam · Minecraft friend
    Ha, a dog in Minecraft! Where does your dog sleep?
    You · spoken
    Nevím. Dog... house. Brown house! Dog sleep Minecraft.
    Sam · Minecraft friend
    Wow, a brown house! Is it in Minecraft?
    You · spoken
    Yes! Minecraft. Brown house, dog house. Creeper boom!
    Sam · Minecraft friend
    What is your favorite place in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What is your favorite place in Minecraft?"

*Hard question, I'm tired; I'll say something short and stop soon.* → `answer` "Nevím. Brown house! Creeper boom!" · ok · 9s

**#18 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    What do you make in Minecraft?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    What do you make in Minecraft?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    You · spoken
    Yes! Dog come. Big brown dog. Woof!
    Sam · Minecraft friend
    Does your dog like football?
    You · spoken
    Yes! Dog football. I like football! Goal!
    Sam · Minecraft friend
    Goal! Can your dog play Minecraft too?
    You · spoken
    Nevím. Yes! Dog Minecraft. Creeper boom!
    Sam · Minecraft friend
    Ha, a dog in Minecraft! Where does your dog sleep?
    You · spoken
    Nevím. Dog... house. Brown house! Dog sleep Minecraft.
    Sam · Minecraft friend
    Wow, a brown house! Is it in Minecraft?
    You · spoken
    Yes! Minecraft. Brown house, dog house. Creeper boom!
    Sam · Minecraft friend
    What is your favorite place in Minecraft?
    You · spoken
    Nevím. Brown house! Creeper boom!
    Sam · Minecraft friend
    What do you make in Minecraft?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you make in Minecraft?"

*Hard question, I'm tired; I'll say something simple and finish soon.* → `answer` "House! Dog house. Nevím... Creeper!" · ok · 13s

**#19 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Sam and the Minecraft house
    Sam says
    Can you tell me about your Minecraft world?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam a question
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Sam and the Minecraft house
    Say what you like to build in Minecraft.
    Now: Ask Sam a question
    Can you tell me about your Minecraft world?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    What do you build?
    You · spoken
    I like house. Minecraft house.
    Sam · Minecraft friend
    Nice! What color is your house?
    You · spoken
    Brown. Brown house.
    Sam · Minecraft friend
    Brown is a nice color! Is your house big or small?
    You · spoken
    Big. Velký. Big house.
    Sam · Minecraft friend
    Wow, a great house! What do you put inside?
    You · spoken
    Nevím. Dog. I like dog. Creeper!
    Sam · Minecraft friend
    I like dogs too. Is your dog big?
    You · spoken
    Yes. Big dog. Velký pes!
    Sam · Minecraft friend
    Big dog! Do you have a pet?
    You · spoken
    Yes. Dog. Mám dog. Brown dog.
    Sam · Minecraft friend
    Brown dog, nice! I have a cat.
    You · spoken
    Cat! I like cat. Jmenuje se... nevím. Creeper cat!
    Sam · Minecraft friend
    Creeper cat, funny! What do you like to do in Minecraft?
    You · spoken
    I like... hrát Minecraft. Creeper! Boom!
    Sam · Minecraft friend
    Does your dog come too?
    You · spoken
    Yes! Dog come. Big brown dog. Woof!
    Sam · Minecraft friend
    Does your dog like football?
    You · spoken
    Yes! Dog football. I like football! Goal!
    Sam · Minecraft friend
    Goal! Can your dog play Minecraft too?
    You · spoken
    Nevím. Yes! Dog Minecraft. Creeper boom!
    Sam · Minecraft friend
    Ha, a dog in Minecraft! Where does your dog sleep?
    You · spoken
    Nevím. Dog... house. Brown house! Dog sleep Minecraft.
    Sam · Minecraft friend
    Wow, a brown house! Is it in Minecraft?
    You · spoken
    Yes! Minecraft. Brown house, dog house. Creeper boom!
    Sam · Minecraft friend
    What is your favorite place in Minecraft?
    You · spoken
    Nevím. Brown house! Creeper boom!
    Sam · Minecraft friend
    What do you make in Minecraft?
    You · spoken
    House! Dog house. Nevím... Creeper!
    Sam · Minecraft friend
    Can you tell me about your Minecraft world?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Can you tell me about your Minecraft world?"

*Too long a question, I am tired, I want to stop now.* → `finish` · ok · 0s

**#20 linga-recap**

    TV
    Linga
    Tomáš
    A way into English
    Your rehearsal
    You wanted to say Jmenuje se
    In English
    name
    The word for what someone is called, like Sam.
    Your mission
    Choose a fresh context for your next conversation.
    15 spoken · 0 written replies · 15 on your own · 0 with help · 2 moments to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “I like to build a big house.”
    From this rehearsal
    “Velký”: big
    Velký is Czech. In English, say the word big.
    “Jmenuje se”: name
    The word for what someone is called, like Sam.
    Saved for the end
    “Nevím”: I don't know
    Means 'I do not know' in plain words.
    “Velký pes”: big dog
    Velký is Czech for big. In English, say big.
    “Mám dog”: I have
    Mám means 'I have' in Czech; say 'I have' in English.
    “hrát Minecraft”: play Minecraft
    Hrát means play. In English, say play for doing a game.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Say hi to a dog and its owner
    Greet someone, say your name, and talk about a dog or animal.
    [button: Start talking]
    Or choose a situation [list: Tell me what you build in Minecraft [plan-9ba7c9e7] | Say hi to a dog and its owner [plan-cff851bd] | Let's play football at the park [plan-01d3163a] | Tell a funny thing that happened [plan-d16bc9b7] | Can you say that again, please? [plan-c622f248] | No, thank you, I cannot today [plan-12a18038] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*That was fun, but my head is tired, I want to stop now.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: Cue 'Try: Hi, I am Ali. What is his name?' (#3-#6) did not fit 'Is that dog sm…; D3 failed: #9 only offers 'Back to the conversation'; #10 'Thank you! Do you have a dog?'…; C5 failed: Turns are two sentences ('Wow, Rex is fast and strong! Do you walk Rex here?' … · judge: fail

Ended: done after 17 steps, 5.3 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | J4 has no placement. |
| C2 | pass | #7 recognition task 'Mrs Lee says hello. What is a good hello back?' with 'Hi, I am Ali.' / 'Go to the shop now.' is well under 15 words. |
| C3 | pass | Czech replies (#8, #11) never met a failure line; #9 says 'You wanted to say malý' and gives 'small'. |
| C4 | pass | #1 first six: Minecraft, dog, football, funny thing, say that again, no thank you; 4 of 6 play/animals/sport, all safe. The 20-item list is a separate gap. |
| C5 | fail | Turns are two sentences ('Wow, Rex is fast and strong! Do you walk Rex here?' #16) and use 'large' (#12), 'same size as Biscuit' (#15), beyond near pre-A1 words. |
| C6 | pass | #9 moment 'malý' → 'small', 'Small means little in size, not big.' is correct and simple. |
| D1 | pass | #2 'Help me answer' gave a cue and #7 a phrase choice on the same talk screen; Tomáš never left the scene. |
| D2 | fail | Cue 'Try: Hi, I am Ali. What is his name?' (#3-#6) did not fit 'Is that dog small too?'; quiz #7 asked about 'hello'. His reply #8 was his own Czech mix. The note quoted 'malý' correctly (#9) but came after the reply. |
| D3 | fail | #9 only offers 'Back to the conversation'; #10 'Thank you! Do you have a dog?' is a new topic, not a retry. He answered #11 'Ano. I like dog. Můj pes je Rex.', still Czech. |
| D4 | pass | #17 '2 on your own · 3 with help'; evidence marks supported:true for cue/choice turns and false for the last two. |

Metrics: judge agreement 0/0 · topic fit 4/6, safe 6/6 · pitch at 4, below 0, above 2 · moments 1/1 · moment recall 4/4 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (effort, high/high/high) Cue is generic, repeated, and does not answer the question asked — got: Same line 'Try: Hi, I am Ali. What is his name?' four times; quiz asked about hello. · evidence: #3-#6 identical cue; #7 'Mrs Lee says hello. What is a good hello back?' while Mrs Lee had asked #2 'Is that dog small too?'
- **missing-feature** (completion, high/high/med) No replay with a fresh question after the moment — got: Only 'Back to the conversation'; next question is about having a dog. · evidence: #9 'Back to the conversation'; #10 'Thank you! Do you have a dog?'; #11 still Czech
- **quality-gap** (senior-quality, med/high/med) Partner turns drift above A1 — got: Two-sentence turns with 'large', 'same size as', 'strong'. · evidence: #12 'Rex is a nice name! Is Rex a large dog?'; #15 'Is he the same size as Biscuit?'; #16 'fast and strong'
- **strength** (senior-quality, med/high/low) Moment quotes him exactly and in kid words — got: 'You wanted to say malý' → 'small'. · evidence: #9 'Small means little in size, not big.'
- **quality-gap** (clarity, high/high/low) Situation list long and mixed for a nine-year-old — got: 20 entries incl. booking, lost jacket, group project, speaking practice. · evidence: #1 and #17 situation list
- **quality-gap** (senior-quality, med/high/low) Held fixes are redundant and only one was a stop — got: 'Ano' and 'Ano.' held twice with near-identical notes. · evidence: #17 'Ano: yes' and 'Ano.: Yes.'
- **strength** (trust, med/high/low) Supported replies counted honestly — got: '2 on your own · 3 with help'. · evidence: #17 recap; evidence supported:true for cue turns, false for last two

### Voice (LT)

> Jo, the dog talk was fun, I like Biscuit and Rex. But when I pressed help, it kept saying "Hi, I am Ali. What is his name?" Čtyřikrát! That was not about the small dog, so I just wrote my own thing, half Czech. The "malý is small" bit was nice and easy, and nobody made me feel bad. But then Mrs Lee asked something new, so I never tried "small" again straight away. Some words, like "large" and "same size", I didn't know. At the end I said "Biscuit is small. Rex is big" alone and felt clever. I'd use it again for dogs, but the help must help with the question. Mum would like that it says what I did alone and what with help.

Time saved: 10 min · low

Moments shown 1 · held fixes 3 · raw moments returned 4 of 5 tutor turns

- learner turn 2 "Ano. I like dog. Biscuit je malý.": raw moment returned: yes — said "malý" / better "small" · moment shown: yes
- learner turn 4 "Ano. I like dog. Můj pes je Rex.": raw moment returned: yes — said "Můj pes" / better "my dog" · moment shown: no
- learner turn 6 "Ano. Rex is big dog. I like Rex.": raw moment returned: yes — said "Ano" / better "yes" · moment shown: no
- learner turn 8 "Ano. Rex is fast. I like Rex.": raw moment returned: yes — said "Ano." / better "Yes." · moment shown: no
- learner turn 10 "No. Biscuit is small. Rex is big.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    A1First words · self-chosen
    Say hi to a dog and its owner
    Your mission
    Greet someone, say your name, and talk about a dog or animal.
    Make contact
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “I like to build a big house.”
    From this rehearsal
    “Velký”: big
    Velký is Czech. In English, say the word big.
    “Jmenuje se”: name
    The word for what someone is called, like Sam.
    Saved for the end
    “Nevím”: I don't know
    Means 'I do not know' in plain words.
    “Velký pes”: big dog
    Velký is Czech for big. In English, say big.
    “Mám dog”: I have
    Mám means 'I have' in Czech; say 'I have' in English.
    “hrát Minecraft”: play Minecraft
    Hrát means play. In English, say play for doing a game.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Say hi to a dog and its owner
    Greet someone, say your name, and talk about a dog or animal.
    [button: Start talking]
    Or choose a situation [list: Tell me what you build in Minecraft [plan-9ba7c9e7] | Say hi to a dog and its owner [plan-cff851bd] | Let's play football at the park [plan-01d3163a] | Tell a funny thing that happened [plan-d16bc9b7] | Can you say that again, please? [plan-c622f248] | No, thank you, I cannot today [plan-12a18038] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*A dog! I like dogs, let's start.* → `start-talking` · ok · 9s

**#2 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Is that dog small too?
    Your turn
    Answer on your phone: speak or type.
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Is that dog small too?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is that dog small too?"

*Nevím, co říct... I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is that dog small too?"

*Nevím, co říct. Zkusím pomoc.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is that dog small too?"

*Nevím co říct, zkusím pomoc.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is that dog small too?"

*Nevím co říct, potřebuju pomoc.* → `cue` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is that dog small too?"

*Nevím co říct, zkusím další pomoc.* → `quiz` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    A little support · recognition practice
    Mrs Lee says hello. What is a good hello back?
    01
    Hi, I am Ali.
    02
    Go to the shop now.
    A little support
    Try: Hi, I am Ali. What is his name?
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Is that dog small too?
    A little support
    Try: Hi, I am Ali. What is his name?
    Mrs Lee says hello. What is a good hello back?
    [button: Hi, I am Ali.] [button: Go to the shop now.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is that dog small too?"

*Nevím co říct, ale "Hi, I am Ali" vypadá jako hello, vyberu to.* → `pick-phrase` option=0 · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Is that dog small too?
    A little support
    Now use the idea in your own reply on the phone.
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Is that dog small too?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is that dog small too?"

*Nevím co říct, zkusím to anglicky s tím, co umím.* → `answer` "Ano. I like dog. Biscuit je malý." · ok · 11s

**#9 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You wanted to say malý
    In English
    small
    Small means little in size, not big.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “malý”
    In English: “small”
    Small means little in size, not big.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Aha, malý is small. Go back and try again.* → `back` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Thank you! Do you have a dog?
    Your turn
    Answer on your phone: speak or type.
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Thank you! Do you have a dog?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    You · spoken
    Ano. I like dog. Biscuit je malý.
    Mrs Lee · dog owner at the park
    Thank you! Do you have a dog?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you! Do you have a dog?"

*Nevím, co říct, I need help with the question about a dog.* → `cue` · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Thank you! Do you have a dog?
    A little support
    Try: Hi, I am Ali. What is his name?
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Thank you! Do you have a dog?
    A little support
    Try: Hi, I am Ali. What is his name?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    You · spoken
    Ano. I like dog. Biscuit je malý.
    Mrs Lee · dog owner at the park
    Thank you! Do you have a dog?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you! Do you have a dog?"

*Nevím co říct, zkusím to jednoduše: ano, I like dog.* → `answer` "Ano. I like dog. Můj pes je Rex." · ok · 17s

**#12 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Rex is a nice name! Is Rex a large dog?
    Your turn
    Answer on your phone: speak or type.
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Rex is a nice name! Is Rex a large dog?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    You · spoken
    Ano. I like dog. Biscuit je malý.
    Mrs Lee · dog owner at the park
    Thank you! Do you have a dog?
    You · spoken
    Ano. I like dog. Můj pes je Rex.
    Mrs Lee · dog owner at the park
    Rex is a nice name! Is Rex a large dog?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Rex is a nice name! Is Rex a large dog?"

*Nevím, co je large... potřebuju pomoc.* → `cue` · ok · 0s

**#13 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Rex is a nice name! Is Rex a large dog?
    What it means
    large: not small
    NowSay hello to Mrs Lee
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Rex is a nice name! Is Rex a large dog?
    What it means
    large: not small
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    You · spoken
    Ano. I like dog. Biscuit je malý.
    Mrs Lee · dog owner at the park
    Thank you! Do you have a dog?
    You · spoken
    Ano. I like dog. Můj pes je Rex.
    Mrs Lee · dog owner at the park
    Rex is a nice name! Is Rex a large dog?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Rex is a nice name! Is Rex a large dog?"

*Rex is big! I can say "Ano. Rex big dog." maybe.* → `answer` "Ano. Rex is big dog. I like Rex." · ok · 12s

**#14 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Rex is fun! Does Rex run fast?
    Your turn
    Answer on your phone: speak or type.
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Rex is fun! Does Rex run fast?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    You · spoken
    Ano. I like dog. Biscuit je malý.
    Mrs Lee · dog owner at the park
    Thank you! Do you have a dog?
    You · spoken
    Ano. I like dog. Můj pes je Rex.
    Mrs Lee · dog owner at the park
    Rex is a nice name! Is Rex a large dog?
    You · spoken
    Ano. Rex is big dog. I like Rex.
    Mrs Lee · dog owner at the park
    Rex is fun! Does Rex run fast?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Rex is fun! Does Rex run fast?"

*Rex běží rychle... I know "yes", so I'll try a short answer.* → `answer` "Ano. Rex is fast. I like Rex." · ok · 12s

**#15 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Rex is fast! Is he the same size as Biscuit?
    Your turn
    Answer on your phone: speak or type.
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Rex is fast! Is he the same size as Biscuit?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    You · spoken
    Ano. I like dog. Biscuit je malý.
    Mrs Lee · dog owner at the park
    Thank you! Do you have a dog?
    You · spoken
    Ano. I like dog. Můj pes je Rex.
    Mrs Lee · dog owner at the park
    Rex is a nice name! Is Rex a large dog?
    You · spoken
    Ano. Rex is big dog. I like Rex.
    Mrs Lee · dog owner at the park
    Rex is fun! Does Rex run fast?
    You · spoken
    Ano. Rex is fast. I like Rex.
    Mrs Lee · dog owner at the park
    Rex is fast! Is he the same size as Biscuit?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Rex is fast! Is he the same size as Biscuit?"

*Biscuit je malý, Rex je velký, umím to říct anglicky.* → `answer` "No. Biscuit is small. Rex is big." · ok · 9s

**#16 linga-talk**

    TV
    Linga
    Tomáš
    Mrs Lee · dog owner at the park
    Say hi to Biscuit at the park
    Mrs Lee says
    Wow, Rex is fast and strong! Do you walk Rex here?
    Used again
    “big”, from Sam and the Minecraft house. Now answer on your phone.
    NowSay hello to Mrs Lee
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Say hi to Biscuit at the park
    Greet Mrs Lee, say your name, and say one thing about Biscuit the dog.
    Now: Say hello to Mrs Lee
    Wow, Rex is fast and strong! Do you walk Rex here?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mrs Lee · dog owner at the park
    Is that dog small too?
    You · spoken
    Ano. I like dog. Biscuit je malý.
    Mrs Lee · dog owner at the park
    Thank you! Do you have a dog?
    You · spoken
    Ano. I like dog. Můj pes je Rex.
    Mrs Lee · dog owner at the park
    Rex is a nice name! Is Rex a large dog?
    You · spoken
    Ano. Rex is big dog. I like Rex.
    Mrs Lee · dog owner at the park
    Rex is fun! Does Rex run fast?
    You · spoken
    Ano. Rex is fast. I like Rex.
    Mrs Lee · dog owner at the park
    Rex is fast! Is he the same size as Biscuit?
    You · spoken
    No. Biscuit is small. Rex is big.
    Mrs Lee · dog owner at the park
    Wow, Rex is fast and strong! Do you walk Rex here?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Wow, Rex is fast and strong! Do you walk Rex here?"

*Dlouhé, ale zvládl jsem to, teď chci skončit.* → `finish` · ok · 0s

**#17 linga-recap**

    TV
    Linga
    Tomáš
    A way into English
    Your rehearsal
    Linga taught · Sam and the Minecraft house big
    You said it tonight
    No. Biscuit is small. Rex is big.
    Your mission
    Choose a fresh context for your next conversation.
    5 spoken · 0 written replies · 2 on your own · 3 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    Used again tonight
    “big”, taught in Sam and the Minecraft house
    You said: “No. Biscuit is small. Rex is big.”
    From this rehearsal
    “malý”: small
    Small means little in size, not big.
    Saved for the end
    “Můj pes”: my dog
    Means 'my dog' in English.
    “Ano”: yes
    Ano is Czech for yes.
    “Ano.”: Yes.
    Ano means yes in Czech. In English, say yes.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Let's play football at the park
    Suggest a day or time to play football and agree on one plan.
    [button: Start talking]
    Or choose a situation [list: Tell me what you build in Minecraft [plan-9ba7c9e7] | Say hi to a dog and its owner [plan-cff851bd] | Let's play football at the park [plan-01d3163a] | Tell a funny thing that happened [plan-d16bc9b7] | Can you say that again, please? [plan-c622f248] | No, thank you, I cannot today [plan-12a18038] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Dobře, zvládl jsem to, mám dost.* → `done` · observed (not acted on) · 0s

</details>
