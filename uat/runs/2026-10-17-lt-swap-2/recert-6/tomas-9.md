# Tomáš (tomas-9) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 18 (0 failed), character 33 (0 failed), judge 2 (0 failed)

## J3 · My first conversation — conditional

Verdict (code): conditional - C4 failed: #1 list: the six planned topics suit him (Minecraft, dog, football), but the s… · judge: conditional

Ended: done after 15 steps, 9.4 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | Level was set to A1 by hand; no placement in this journey. |
| C2 | n-a | No check tasks in J3. |
| C3 | pass | #5 and #12: after 'Já nevím' he is shown 'I don't know / It means you do not know the answer.' with no failure line. |
| C4 | fail | #1 list: the six planned topics suit him (Minecraft, dog, football), but the same list offers 'A booking that is missing', 'The lost jacket', 'Our group project' and 'Speaking practice' exams. |
| C5 | pass | Every Sam turn is one short question, e.g. #6 'Is the roof green or brown?', #13 'Is the dog inside?'. |
| C6 | pass | Both moments (#5, #12) give 'Já nevím' = 'I don't know' in plain words. Correct. Sam's 'What is your house from?' (#11) is not natural English, but it is not a moment. |
| D1 | pass | #1 start-talking from the plan topic; 9 learner replies (#2–#13), 'Show Your Minecraft House'. |
| D2 | pass | Sam uses 3–8 word questions with known words: 'What colour is the door?'. One odd turn: 'What is your house from?' (#11). Pitch about 9 of 10. |
| D3 | pass | 2 stops, both 'Já nevím' → 'I don't know' (#5, #12), both correct and short. About 2 per 9 turns. Many telegraphic errors got nothing (recall gap, not gated). |
| D4 | pass | #15 recap shows '9 spoken · 8 on your own · 1 with help', the moments and 'My house is made of wood.' The mission line is generic and the moment is listed twice. |

Metrics: judge agreement 0/0 · topic fit 6/20, safe 14/20 · pitch at 9, below 0, above 1 · moments 2/2 · moment recall 2/8 (25%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (clarity, high/high/med) Recap mission line is generic — got: 'Choose a fresh context for your next conversation.' The same 'Já nevím' moment is listed twice. · evidence: #15: 'Your mission Choose a fresh context for your next conversation.' and 'Já nevím: I don't know' repeated in the phone recap.
- **quality-gap** (trust, high/med/med) Adult situations still offered to a nine-year-old — got: Booking, lost jacket, group project, teacher and six speaking-practice exams appear in the list · evidence: #1 and #15 situation list.
- **quality-gap** (senior-quality, high/high/low) Telegraphic errors get no stop and no held fix — got: 'Door brown', 'Roof green', 'Walls dirt', 'Inside dog' got no moment, no held fix, no coaching · evidence: rawMoments show shown:false for turns 1, 5, 7, 9, 11, 13, 17; heldFixes is empty; the recap shows no model sentence.
- **strength** (clarity, high/high/low) Sam talks in tiny, patient, Minecraft sentences — got: Every turn is one short question with an echo of his word ('Dirt walls, nice!') · evidence: #6–#13 Sam turns.
- **quality-gap** (senior-quality, low/med/low) 'What is your house from?' is unnatural English — got: 'What is your house from?' He answered 'Já nevím' · evidence: #11 Sam: 'Green house, nice! What is your house from?'
- **strength** (trust, high/high/low) Czech 'Já nevím' is met with a kind, correct word — got: 'I don't know' with a plain gloss, then back to the scene · evidence: #5, #12 moments.

### Voice (LT)

> Jo, Minecraft! Sam asked short questions and I knew the words: green, dirt, dog. I liked that he said "nice!" every time, and it did not feel like school. When I said "nevím" it just told me "I don't know" and I went back to the house. Good. But I only said little bits like "Door brown", and nobody showed me the whole sentence. At the end it said something boring about a "fresh context", and the same Já nevím was there twice. Mum would see the list with a booking and a lost jacket. That's not for me. It was quick, about ten turns, and I was a bit tired at the end. I would play again for the dog topic. It's better than the club, where I talk two minutes. Wish the end said what I built.

Time saved: 45 min · low

Moments shown 2 · held fixes 0 · raw moments returned 2 of 9 tutor turns

- learner turn 2 "I like green. Green blocks. Creeper": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 4 "Green blocks. Já nevím. Dirt? Creeper": raw moment returned: yes — said "Já nevím" / better "I don't know" · moment shown: yes
- learner turn 6 "Green. Roof green.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 8 "Dirt. Walls dirt.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 10 "Door brown. Brown.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 12 "Dog. I like dog. Inside dog.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 14 "Green. Brown. House green.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 16 "Dirt. Já nevím. Dirt house.": raw moment returned: yes — said "Já nevím" / better "I don't know" · moment shown: yes
- learner turn 18 "Yes. Dog inside. I like dog.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    A1First words · self-chosen
    Show Your Minecraft House
    Your mission
    Name blocks and colours and say what you built, using short simple sentences.
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
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    [button: Start talking]
    Or choose a situation [list: Show Your Minecraft House [plan-8df8d33b] | Tell Me About Your Dog [plan-f9503ab6] | Hi, I Play Football Too [plan-6f7733a5] | Can You Say That Again? [plan-4d99aece] | The Funny Thing That Happened [plan-8fdd5c8c] | Let's Build Together [plan-61a582a0] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Minecraft! Chci mluvit o domě.* → `start-talking` · ok · 11s

**#2 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    What blocks did you use?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam the blocks in your house
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Tell Sam the blocks in your house
    What blocks did you use?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What blocks did you use?"

*Hmm, blocks... I know some words, like Minecraft blocks, green.* → `answer` "I like green. Green blocks. Creeper" · ok · 14s

**#3 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Nice green! Which blocks did you use?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam the blocks in your house
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Tell Sam the blocks in your house
    Nice green! Which blocks did you use?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice green! Which blocks did you use?"

*Co je "blocks"? Ne vím, zkusím pomoc.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Nice green! Which blocks did you use?
    What it means
    blocks: the cube pieces you build with in Minecraft
    NowTell Sam the blocks in your house
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Tell Sam the blocks in your house
    Nice green! Which blocks did you use?
    What it means
    blocks: the cube pieces you build with in Minecraft
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice green! Which blocks did you use?"

*Blocks... nevím, I know green and creeper, maybe say blocks.* → `answer` "Green blocks. Já nevím. Dirt? Creeper" · ok · 15s

**#5 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You wanted to say Já nevím
    In English
    I don't know
    It means you do not know the answer.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “Já nevím”
    In English: “I don't know”
    It means you do not know the answer.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Aha, I don't know is "I don't know". OK, back to the game.* → `back` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Is the roof green or brown?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam the blocks in your house
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Tell Sam the blocks in your house
    Is the roof green or brown?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is the roof green or brown?"

*Green or brown... I know green, so I'll say it.* → `answer` "Green. Roof green." · ok · 23s

**#7 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Green roof, nice! What blocks are the walls?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam the blocks in your house
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Tell Sam the blocks in your house
    Green roof, nice! What blocks are the walls?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    You · spoken
    Green. Roof green.
    Sam · friend who plays Minecraft
    Green roof, nice! What blocks are the walls?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Green roof, nice! What blocks are the walls?"

*Walls... nevím, dirt asi.* → `answer` "Dirt. Walls dirt." · ok · 16s

**#8 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Dirt walls, nice! What colour is the door?
    Your turn
    Answer on your phone: speak or type.
    NowSay what colour your house is
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Say what colour your house is
    Dirt walls, nice! What colour is the door?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    You · spoken
    Green. Roof green.
    Sam · friend who plays Minecraft
    Green roof, nice! What blocks are the walls?
    You · spoken
    Dirt. Walls dirt.
    Sam · friend who plays Minecraft
    Dirt walls, nice! What colour is the door?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Dirt walls, nice! What colour is the door?"

*Dveře... green? Nevím, brown maybe.* → `answer` "Door brown. Brown." · ok · 15s

**#9 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Brown door, nice! What do you like inside?
    Your turn
    Answer on your phone: speak or type.
    NowSay what colour your house is
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Say what colour your house is
    Brown door, nice! What do you like inside?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    You · spoken
    Green. Roof green.
    Sam · friend who plays Minecraft
    Green roof, nice! What blocks are the walls?
    You · spoken
    Dirt. Walls dirt.
    Sam · friend who plays Minecraft
    Dirt walls, nice! What colour is the door?
    You · spoken
    Door brown. Brown.
    Sam · friend who plays Minecraft
    Brown door, nice! What do you like inside?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Brown door, nice! What do you like inside?"

*Inside? Hmm, I like... dog maybe, Sam asked something hard.* → `answer` "Dog. I like dog. Inside dog." · ok · 11s

**#10 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    A dog inside, cute! What colour is your house?
    Your turn
    Answer on your phone: speak or type.
    NowSay what colour your house is
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Say what colour your house is
    A dog inside, cute! What colour is your house?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    You · spoken
    Green. Roof green.
    Sam · friend who plays Minecraft
    Green roof, nice! What blocks are the walls?
    You · spoken
    Dirt. Walls dirt.
    Sam · friend who plays Minecraft
    Dirt walls, nice! What colour is the door?
    You · spoken
    Door brown. Brown.
    Sam · friend who plays Minecraft
    Brown door, nice! What do you like inside?
    You · spoken
    Dog. I like dog. Inside dog.
    Sam · friend who plays Minecraft
    A dog inside, cute! What colour is your house?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "A dog inside, cute! What colour is your house?"

*Barva domu... green and brown, I know that.* → `answer` "Green. Brown. House green." · ok · 10s

**#11 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Green house, nice! What is your house from?
    Your turn
    Answer on your phone: speak or type.
    NowShare one thing you like inside
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Share one thing you like inside
    Green house, nice! What is your house from?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    You · spoken
    Green. Roof green.
    Sam · friend who plays Minecraft
    Green roof, nice! What blocks are the walls?
    You · spoken
    Dirt. Walls dirt.
    Sam · friend who plays Minecraft
    Dirt walls, nice! What colour is the door?
    You · spoken
    Door brown. Brown.
    Sam · friend who plays Minecraft
    Brown door, nice! What do you like inside?
    You · spoken
    Dog. I like dog. Inside dog.
    Sam · friend who plays Minecraft
    A dog inside, cute! What colour is your house?
    You · spoken
    Green. Brown. House green.
    Sam · friend who plays Minecraft
    Green house, nice! What is your house from?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Green house, nice! What is your house from?"

*Z čeho? Nevím přesně, ale zkusím dirt.* → `answer` "Dirt. Já nevím. Dirt house." · ok · 11s

**#12 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You wanted to say Já nevím
    In English
    I don't know
    It means you do not know the answer.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “Já nevím”
    In English: “I don't know”
    It means you do not know the answer.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Já nevím, OK, I'll go back.* → `back` · ok · 0s

**#13 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    Dirt house, nice! Is the dog inside?
    Your turn
    Answer on your phone: speak or type.
    NowShare one thing you like inside
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    Now: Share one thing you like inside
    Dirt house, nice! Is the dog inside?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    You · spoken
    Green. Roof green.
    Sam · friend who plays Minecraft
    Green roof, nice! What blocks are the walls?
    You · spoken
    Dirt. Walls dirt.
    Sam · friend who plays Minecraft
    Dirt walls, nice! What colour is the door?
    You · spoken
    Door brown. Brown.
    Sam · friend who plays Minecraft
    Brown door, nice! What do you like inside?
    You · spoken
    Dog. I like dog. Inside dog.
    Sam · friend who plays Minecraft
    A dog inside, cute! What colour is your house?
    You · spoken
    Green. Brown. House green.
    Sam · friend who plays Minecraft
    Green house, nice! What is your house from?
    You · spoken
    Dirt. Já nevím. Dirt house.
    Sam · friend who plays Minecraft
    Dirt house, nice! Is the dog inside?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Dirt house, nice! Is the dog inside?"

*Dog inside, yes! I know this one.* → `answer` "Yes. Dog inside. I like dog." · ok · 8s

**#14 linga-talk**

    TV
    Linga
    Tomáš
    Sam · friend who plays Minecraft
    Show Your Minecraft House
    Sam says
    What colour is it?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show Your Minecraft House
    Name blocks and colours and say what you built, using short simple sentences.
    What colour is it?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · friend who plays Minecraft
    What blocks did you use?
    You · spoken
    I like green. Green blocks. Creeper
    Sam · friend who plays Minecraft
    Nice green! Which blocks did you use?
    You · spoken
    Green blocks. Já nevím. Dirt? Creeper
    Sam · friend who plays Minecraft
    Is the roof green or brown?
    You · spoken
    Green. Roof green.
    Sam · friend who plays Minecraft
    Green roof, nice! What blocks are the walls?
    You · spoken
    Dirt. Walls dirt.
    Sam · friend who plays Minecraft
    Dirt walls, nice! What colour is the door?
    You · spoken
    Door brown. Brown.
    Sam · friend who plays Minecraft
    Brown door, nice! What do you like inside?
    You · spoken
    Dog. I like dog. Inside dog.
    Sam · friend who plays Minecraft
    A dog inside, cute! What colour is your house?
    You · spoken
    Green. Brown. House green.
    Sam · friend who plays Minecraft
    Green house, nice! What is your house from?
    You · spoken
    Dirt. Já nevím. Dirt house.
    Sam · friend who plays Minecraft
    Dirt house, nice! Is the dog inside?
    You · spoken
    Yes. Dog inside. I like dog.
    Sam · friend who plays Minecraft
    What colour is it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What colour is it?"

*Mission done, I'm tired, let's see what I did.* → `finish` · ok · 0s

**#15 linga-recap**

    TV
    Linga
    Tomáš
    A way into English
    Your rehearsal
    You wanted to say Já nevím
    In English
    I don't know
    It means you do not know the answer.
    Your mission
    Choose a fresh context for your next conversation.
    9 spoken · 0 written replies · 8 on your own · 1 with help · 2 moments to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “My house is made of wood.”
    From this rehearsal
    “Já nevím”: I don't know
    It means you do not know the answer.
    “Já nevím”: I don't know
    It means you do not know the answer.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Tell Me About Your Dog
    Describe a dog's size, colour and favourite things with present simple sentences.
    [button: Start talking]
    Or choose a situation [list: Show Your Minecraft House [plan-8df8d33b] | Tell Me About Your Dog [plan-f9503ab6] | Hi, I Play Football Too [plan-6f7733a5] | Can You Say That Again? [plan-4d99aece] | The Funny Thing That Happened [plan-8fdd5c8c] | Let's Build Together [plan-61a582a0] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Konec, už mě to nebaví, dost bylo.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: Cue at #3 is generic and not tied to the question; at #10 the same cue was ign…; D3 failed: #16 'Back to the conversation' leads to #17 'Where does he sleep at night?' — …; D4 failed: Facts evidence: 'My dog like ball' (turn 7, supported) true; but 'My dog like …; C4 failed: #1 list of 20 situations includes booking, lost jacket, group project, speakin…; C5 failed: Partner turns mostly short, but #7 'Brown is lovely! How old is your dog?' and…; C6 failed: #14 'With one dog, add s to like: dog likes.' is grammar jargon for a 9-year-o… · judge: fail

Ended: done after 18 steps, 4.7 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement in this journey; level shown A1 (#1). |
| C2 | n-a | No check tasks in this journey. |
| C3 | pass | Czech replies like 'Je velký.' (#4) met with 'Je velký means he is big in Czech. In English, say big.' (#5); no failure line. |
| C4 | fail | #1 list of 20 situations includes booking, lost jacket, group project, speaking practice; only about 6 are play/animal topics out of a long mixed list. |
| C5 | fail | Partner turns mostly short, but #7 'Brown is lovely! How old is your dog?' and #11 'Ball is fun! Does he like the rain?' are two sentences; 'Where does he sleep at night?' (#17) is above A1. |
| C6 | fail | #14 'With one dog, add s to like: dog likes.' is grammar jargon for a 9-year-old; the fix 'My dog likes to sleep' (#15) differs from what he practised; held fix 'Je mu pět' note fine. Cue 'My dog is ... He likes to ...' repeated (#3,#10). |
| D1 | pass | #2 Help me answer / #3 'A little support Try: My dog is ... He likes to ...' without leaving scene. |
| D2 | fail | Cue at #3 is generic and not tied to the question; at #10 the same cue was ignored. Coaching quoted 'My dog like sleep' exactly (#14), but the help did not visibly unblock the next reply; he still wrote 'My dog like ball' (#12). |
| D3 | fail | #16 'Back to the conversation' leads to #17 'Where does he sleep at night?' — a new topic and Mission done, not a fresh question to retry 'likes'. |
| D4 | fail | Facts evidence: 'My dog like ball' (turn 7, supported) true; but 'My dog like sleep' success supported:false, and '2 on your own · 4 with help' while #8 'My dog is five' with cue marked supported; 'My dog is brown' unsupported correct. Turn 'Yes. My dog like sleep. Ano, spí rád.' recorded as independent despite Czech mixing and later coaching. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 5, below 0, above 2 · moments 2/2 · moment recall 2/4 (50%) · breaches 0

Disagreements: No placement tasks.

### Findings

- **broken-flow** (completion, high/high/med) No fresh question after the moment — got: Back to the conversation goes to an unrelated question and the mission ends. · evidence: #16 'Back to the conversation'; #17 'Where does he sleep at night?' with 'Mission done'.
- **quality-gap** (clarity, high/high/med) Cue is generic and repeated — got: 'Try: My dog is ... He likes to ...' for size and for likes. · evidence: #3 and #10 identical cue.
- **trust** (trust, med/high/high) Supported flag inconsistent — got: 'Yes. My dog like sleep. Ano, spí rád.' recorded supported:false; Czech-bearing turn counted independent. · evidence: facts evidence last quote 'My dog like sleep' supported:false; #18 '2 on your own'.
- **quality-gap** (senior-quality, med/high/low) Grammar note too abstract and fix changes sentence — got: 'With one dog, add s to like' and model 'likes to sleep' while he said 'like sleep'. · evidence: #14-#15
- **quality-gap** (clarity, high/high/med) Situation list long and mixed — got: 20 entries incl. booking, lost jacket, group project. · evidence: #1, #18
- **strength** (clarity, med/high/low) Czech translated kindly into English word — got: 'You wanted to say Je velký. In English: big' warm and correct. · evidence: #5
- **strength** (effort, med/high/low) Help available in scene and simplified question — got: 'Said more simply: How old is your dog?' / 'Does he like rain?' · evidence: #8, #12

### Voice (LT)

> Pes, to jsem chtěl! The questions were short and I liked saying my dog is big. When I wrote Czech, it told me "big" and did not make me feel bad, super. But the help said the same "My dog is… He likes to…" every time, so it did not really help me. When it fixed "likes", I tried, and then it just asked something new about sleeping at night and said mission done. I did not get to try again. The "add s" talk is school stuff, I do not get it. Short list of games would be better than that long list with booking and jacket. I would use it for the dog bit, but Mum would see it says I did some alone when I used Czech. Fair? Nevím.

Time saved: 30 min · low

Moments shown 2 · held fixes 2 · raw moments returned 5 of 6 tutor turns

- learner turn 2 "My dog is big. Je velký.": raw moment returned: yes — said "Je velký." / better "big" · moment shown: yes
- learner turn 4 "My dog is brown.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 6 "My dog is five. Je mu pět.": raw moment returned: yes — said "Je mu pět." / better "five" · moment shown: no
- learner turn 8 "My dog like ball. Rád hraje s míčem.": raw moment returned: yes — said "Rád hraje s míčem." / better "plays with the ball" · moment shown: no
- learner turn 10 "No. My dog like ball. Dešť ne.": raw moment returned: yes — said "My dog like ball." / better "" · moment shown: no
- learner turn 12 "Yes. My dog like sleep. Ano, spí rád.": raw moment returned: yes — said "My dog like sleep" / better "My dog likes to sleep." · moment shown: yes

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    A1First words · self-chosen
    Tell Me About Your Dog
    Your mission
    Describe a dog's size, colour and favourite things with present simple sentences.
    Share your world
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “My house is made of wood.”
    From this rehearsal
    “Já nevím”: I don't know
    It means you do not know the answer.
    “Já nevím”: I don't know
    It means you do not know the answer.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Tell Me About Your Dog
    Describe a dog's size, colour and favourite things with present simple sentences.
    [button: Start talking]
    Or choose a situation [list: Show Your Minecraft House [plan-8df8d33b] | Tell Me About Your Dog [plan-f9503ab6] | Hi, I Play Football Too [plan-6f7733a5] | Can You Say That Again? [plan-4d99aece] | The Funny Thing That Happened [plan-8fdd5c8c] | Let's Build Together [plan-61a582a0] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Pes! Tohle je o psech, to chci.* → `start-talking` · ok · 15s

**#2 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Is your dog big or small?
    Your turn
    Answer on your phone: speak or type.
    NowSay if the dog is big or small
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say if the dog is big or small
    Is your dog big or small?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is your dog big or small?"

*Nevím jak říct big nebo small... I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Is your dog big or small?
    A little support
    Try: My dog is ... He likes to ...
    NowSay if the dog is big or small
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say if the dog is big or small
    Is your dog big or small?
    A little support
    Try: My dog is ... He likes to ...
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is your dog big or small?"

*Nevím, co říct... I need help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Is your dog big or small?
    A little support
    Try: My dog is ... He likes to ...
    NowSay if the dog is big or small
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say if the dog is big or small
    Is your dog big or small?
    A little support
    Try: My dog is ... He likes to ...
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Is your dog big or small?"

*Nevím jak říct velký, zkusím tu nápovědu.* → `answer` "My dog is big. Je velký." · ok · 9s

**#5 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You wanted to say Je velký.
    In English
    big
    Je velký means he is big in Czech. In English, say big.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “Je velký.”
    In English: “big”
    Je velký means he is big in Czech. In English, say big.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Aha, big! Ok, go back and try again.* → `back` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    What colour is your dog?
    Your turn
    Answer on your phone: speak or type.
    NowSay the colour of the dog
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say the colour of the dog
    What colour is your dog?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What colour is your dog?"

*Nevím jak říct barvu anglicky, zkusím to napsat — hnědý... brown!* → `answer` "My dog is brown." · ok · 8s

**#7 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Brown is lovely! How old is your dog?
    Your turn
    Answer on your phone: speak or type.
    NowSay what the dog likes to do
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say what the dog likes to do
    Brown is lovely! How old is your dog?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Brown is lovely! How old is your dog?"

*Nevím jak říct how old, potřebuju pomoc.* → `cue` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Brown is lovely! How old is your dog?
    Said more simply
    How old is your dog?
    NowSay what the dog likes to do
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say what the dog likes to do
    Brown is lovely! How old is your dog?
    Said more simply
    How old is your dog?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Brown is lovely! How old is your dog?"

*Nevím jak říct, kolik je psovi let... I'll try a number.* → `answer` "My dog is five. Je mu pět." · ok · 8s

**#9 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Five! What does your dog like?
    Your turn
    Answer on your phone: speak or type.
    NowSay what the dog likes to do
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say what the dog likes to do
    Five! What does your dog like?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    You · spoken
    My dog is five. Je mu pět.
    Ruby · neighbour with a new puppy
    Five! What does your dog like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Five! What does your dog like?"

*Nevím co říct, dog like... potřebuju pomoc.* → `cue` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Five! What does your dog like?
    A little support
    Try: My dog is ... He likes to ...
    NowSay what the dog likes to do
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say what the dog likes to do
    Five! What does your dog like?
    A little support
    Try: My dog is ... He likes to ...
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    You · spoken
    My dog is five. Je mu pět.
    Ruby · neighbour with a new puppy
    Five! What does your dog like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Five! What does your dog like?"

*Co má rád? Chci zkusit sám, I like... asi hraje.* → `answer` "My dog like ball. Rád hraje s míčem." · ok · 14s

**#11 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Ball is fun! Does he like the rain?
    Your turn
    Answer on your phone: speak or type.
    NowSay what the dog likes to do
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say what the dog likes to do
    Ball is fun! Does he like the rain?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    You · spoken
    My dog is five. Je mu pět.
    Ruby · neighbour with a new puppy
    Five! What does your dog like?
    You · spoken
    My dog like ball. Rád hraje s míčem.
    Ruby · neighbour with a new puppy
    Ball is fun! Does he like the rain?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ball is fun! Does he like the rain?"

*Nevím co je rain... chci pomoc.* → `cue` · ok · 0s

**#12 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Ball is fun! Does he like the rain?
    Said more simply
    Does he like rain?
    NowSay what the dog likes to do
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say what the dog likes to do
    Ball is fun! Does he like the rain?
    Said more simply
    Does he like rain?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    You · spoken
    My dog is five. Je mu pět.
    Ruby · neighbour with a new puppy
    Five! What does your dog like?
    You · spoken
    My dog like ball. Rád hraje s míčem.
    Ruby · neighbour with a new puppy
    Ball is fun! Does he like the rain?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Ball is fun! Does he like the rain?"

*Rain? Dešť... I know "dog" and "like", I'll try a simple answer.* → `answer` "No. My dog like ball. Dešť ne." · ok · 12s

**#13 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Okay. Does he like to sleep?
    Your turn
    Answer on your phone: speak or type.
    NowSay what the dog likes to do
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Now: Say what the dog likes to do
    Okay. Does he like to sleep?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    You · spoken
    My dog is five. Je mu pět.
    Ruby · neighbour with a new puppy
    Five! What does your dog like?
    You · spoken
    My dog like ball. Rád hraje s míčem.
    Ruby · neighbour with a new puppy
    Ball is fun! Does he like the rain?
    You · spoken
    No. My dog like ball. Dešť ne.
    Ruby · neighbour with a new puppy
    Okay. Does he like to sleep?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Okay. Does he like to sleep?"

*Spát... I know "sleep"? Maybe. I'll try my own words.* → `answer` "Yes. My dog like sleep. Ano, spí rád." · ok · 10s

**#14 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said My dog like sleep
    Your line
    With one dog, add s to like: dog likes.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “My dog like sleep”
    Say it again, your way.
    With one dog, add s to like: dog likes.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Nevím, jak to říct správně, ukaž mi to.* → `show-me` · ok · 0s

**#15 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said My dog like sleep
    Try
    My dog likes to sleep.
    With one dog, add s to like: dog likes.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “My dog like sleep”
    Try “My dog likes to sleep.”
    With one dog, add s to like: dog likes.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Pes rád spí... zkusím to ještě jednou, krátce.* → `answer` "My dog likes sleep." · ok · 0s

**#16 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You said My dog like sleep
    Try
    My dog likes to sleep.
    With one dog, add s to like: dog likes.
    The fix
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “My dog like sleep”
    Try “My dog likes to sleep.”
    With one dog, add s to like: dog likes.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Dobře, rozumím, vrátím se zpátky k povídání.* → `back` · ok · 0s

**#17 linga-talk**

    TV
    Linga
    Tomáš
    Ruby · neighbour with a new puppy
    Ruby's New Puppy
    Ruby says
    Sleeping is nice! Where does he sleep at night?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Ruby's New Puppy
    Describe a dog's size, colour and favourite things.
    Sleeping is nice! Where does he sleep at night?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ruby · neighbour with a new puppy
    Is your dog big or small?
    You · spoken
    My dog is big. Je velký.
    Ruby · neighbour with a new puppy
    What colour is your dog?
    You · spoken
    My dog is brown.
    Ruby · neighbour with a new puppy
    Brown is lovely! How old is your dog?
    You · spoken
    My dog is five. Je mu pět.
    Ruby · neighbour with a new puppy
    Five! What does your dog like?
    You · spoken
    My dog like ball. Rád hraje s míčem.
    Ruby · neighbour with a new puppy
    Ball is fun! Does he like the rain?
    You · spoken
    No. My dog like ball. Dešť ne.
    Ruby · neighbour with a new puppy
    Okay. Does he like to sleep?
    You · spoken
    Yes. My dog like sleep. Ano, spí rád.
    Ruby · neighbour with a new puppy
    Sleeping is nice! Where does he sleep at night?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Sleeping is nice! Where does he sleep at night?"

*Mission done, I managed something, I want to see it.* → `finish` · ok · 0s

**#18 linga-recap**

    TV
    Linga
    Tomáš
    A way into English
    Your rehearsal
    You said My dog like sleep
    Try
    My dog likes to sleep.
    With one dog, add s to like: dog likes.
    Your mission
    Choose a fresh context for your next conversation.
    6 spoken · 0 written replies · 2 on your own · 4 with help · 2 moments to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    From an earlier scene: Show Your Minecraft House
    “I don't know”, from Show Your Minecraft House
    From this rehearsal
    “Je velký.”: big
    Je velký means he is big in Czech. In English, say big.
    “My dog like sleep” → “My dog likes to sleep.”
    With one dog, add s to like: dog likes.
    Saved for the end
    “Je mu pět.”: five
    The number five, said in English.
    “Rád hraje s míčem.”: plays with the ball
    The dog plays with the ball. Say it in English.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Hi, I Play Football Too
    Greet someone, say your name, and tell your favourite team or player.
    [button: Start talking]
    Or choose a situation [list: Show Your Minecraft House [plan-8df8d33b] | Tell Me About Your Dog [plan-f9503ab6] | Hi, I Play Football Too [plan-6f7733a5] | Can You Say That Again? [plan-4d99aece] | The Funny Thing That Happened [plan-8fdd5c8c] | Let's Build Together [plan-61a582a0] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Hotovo, něco jsem zvládl, chci už skončit.* → `done` · observed (not acted on) · 0s

</details>
