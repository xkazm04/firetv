# Tomáš (tomas-9) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 9 (0 failed), character 21 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — conditional

Verdict (code): conditional - C4 failed: #1 six plan topics: only Minecraft, dog, football are play/animals/sport (3 of…; C6 failed: #20 'Dog is plural here, because you like dogs in general.' and #21 'After lik… · judge: conditional

Ended: done after 21 steps, 5.9 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement in this journey; level fixed at A1 by hand. |
| C2 | n-a | No check tasks shown in J4. |
| C3 | pass | #13 Czech 'Dům' answered 'Dům means house in Czech.' with no failure line; #19 'Animals are fun!' |
| C4 | fail | #1 six plan topics: only Minecraft, dog, football are play/animals/sport (3 of 6). Full list also shows 'A booking that is missing', 'Our group project'. |
| C5 | pass | #2-#19 partner turns short, one question each: 'Green is nice! Is it big?', 'Do you have a house or a tree?' |
| C6 | fail | #20 'Dog is plural here, because you like dogs in general.' and #21 'After like, use houses, the plural.' are jargon for a 9-year-old, and the 'after like use plural' rule is wrong for 'I like house'. |
| D1 | pass | #2-#10 Help me answer, 'You could say I make a big tree.', Choose a phrase, all within the scene; #13 moment 'Back to the conversation'. |
| D2 | pass | #13 'Dům' → 'house' unblocked #14 'House. I like house.' Final note #20 quotes 'You said I like dog.' exactly. Cue and phrase picks (#3-#10) did not unblock him. |
| D3 | pass | #14 replay gives fresh question 'Do you have a house or a tree?'; he answers 'House. I like house. Minecraft'; recap 'Tried again … you used it'. |
| D4 | pass | #21 '4 on your own · 2 with help'; facts show supported:true on turns after phrase picks/cue ('Yes. It is big.'). |

Metrics: judge agreement 0/0 · topic fit 3/6, safe 6/6 · pitch at 7, below 0, above 0 · moments 1/1 · moment recall 4/4 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (senior-quality, high/high/med) Coach note uses 'plural' jargon and a wrong rule — got: 'Dog is plural here, because you like dogs in general.' and 'After like, use houses, the plural.' · evidence: #20 and #21 recap; 'I like house' → 'I like houses' presented as a rule after like.
- **broken-flow** (effort, high/high/med) Phrase help loops and never unblocks — got: Three picks of 'A big tree in Minecraft.' each returned 'Now use the idea in your own reply'; he ignored the cue and typed his own words. · evidence: #5-#11 loop, then #11 'I like Minecraft. creeper'
- **quality-gap** (clarity, high/high/low) Situation list long and mixed — got: 20 entries incl. 'A booking that is missing', 'Our group project'; only 3 of first 6 are play. · evidence: #1 and #21 situation list
- **strength** (completion, high/high/low) Moment and replay worked — got: 'Dům' → 'house', then 'Do you have a house or a tree?' and he used 'House'. · evidence: #13, #14, #21 'you used it'
- **strength** (trust, high/high/low) Honest recap with held fixes — got: Recap lists three saved fixes and '4 on your own · 2 with help'. · evidence: #21
- **confusion** (clarity, med/high/low) Stale 'Now: Tell Sam one thing you build' and unused final replay — got: The Now line stayed the same through all 6 turns; he skipped 'Replay the moment' at the end. · evidence: #19 'Now Tell Sam one thing you build.'; #20 finish

### Voice (LT)

> Minecraft, jo! Sam was fun and his questions were tiny, so I could answer. When I wrote Dům, it told me "house", and then I said house — that was good, I felt clever. But the phrase buttons were annoying: I pressed the tree one three times and nothing happened, I just got "now use it yourself". Nevím why. At the end it said "dog is plural" — I don't know what plural is, that's school-talk. I'd use it again for the Minecraft part, and Mum would like that it saves club time. I'd tell a friend, but the long topic list with bookings and group projects looks like homework.

Time saved: 35 min · low

Moments shown 1 · held fixes 3 · raw moments returned 4 of 6 tutor turns

- learner turn 2 "I like Minecraft. creeper": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 4 "I like Minecraft. Dům": raw moment returned: yes — said "Dům" / better "house" · moment shown: yes
- learner turn 6 "House. I like house. Minecraft": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 8 "Green. Je green.": raw moment returned: yes — said "Je" / better "is" · moment shown: no
- learner turn 10 "Yes. It is big. I like house.": raw moment returned: yes — said "I like house" / better "I like houses." · moment shown: no
- learner turn 12 "I like Minecraft. I like dog.": raw moment returned: yes — said "I like dog." / better "I like dogs." · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    A1First words · self-chosen
    Show me your Minecraft world
    Your mission
    Say what you build and what you like to do in Minecraft.
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
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    [button: Start talking]
    Or choose a situation [list: Show me your Minecraft world [plan-3a52fc31] | My dog did something funny [plan-1447e93a] | Who plays football with us? [plan-586ffaba] | Say hi and meet a new friend [plan-d7a78930] | Can you say that again, please? [plan-0cd2a370] | Can I have my turn now? [plan-d04b3124] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Minecraft! Super, chci mluvit.* → `start-talking` · ok · 12s

**#2 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Hi, Sam here. What do you make?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam one thing you build.
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím, co říct anglicky, zkusím pomoc.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Hi, Sam here. What do you make?
    You could say
    I make a big tree.
    NowTell Sam one thing you build.
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    You could say
    I make a big tree.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím, co říct... I'll press More help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Hi, Sam here. What do you make?
    What it means
    make: build or create something
    NowTell Sam one thing you build.
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    What it means
    make: build or create something
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím, co říct... I need help.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Hi, Sam here. What do you make?
    A way to start
    I make a…
    NowTell Sam one thing you build.
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    A way to start
    I make a…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím co říct, zkusím pomoc s frází.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    A little support · recognition practice
    Sam asks: Hi, Sam here. What do you make?
    01
    A big tree in Minecraft.
    02
    I am nine years old.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    Sam asks: Hi, Sam here. What do you make?
    [button: A big tree in Minecraft.] [button: I am nine years old.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím, co to říká, ale strom v Minecraftu znám.* → `pick-phrase` option=0 · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Hi, Sam here. What do you make?
    A little support
    Now use the idea in your own reply on the phone.
    NowTell Sam one thing you build.
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím jak říct anglicky, chci pomoc.* → `quiz` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    A little support · recognition practice
    Sam asks: Hi, Sam here. What do you make?
    01
    A big tree in Minecraft.
    02
    I am nine years old.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    Sam asks: Hi, Sam here. What do you make?
    [button: A big tree in Minecraft.] [button: I am nine years old.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím, co to je... "tree" a "Minecraft" znám, vyberu to první.* → `pick-phrase` option=0 · ok · 0s

**#9 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Hi, Sam here. What do you make?
    A little support
    Now use the idea in your own reply on the phone.
    NowTell Sam one thing you build.
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím co říct, zkusím nápovědu s frázemi.* → `quiz` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    A little support · recognition practice
    Sam asks: Hi, Sam here. What do you make?
    01
    A big tree in Minecraft.
    02
    I am nine years old.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    Sam asks: Hi, Sam here. What do you make?
    [button: A big tree in Minecraft.] [button: I am nine years old.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Hmm, I know tree and Minecraft! Pick the first one.* → `pick-phrase` option=0 · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Hi, Sam here. What do you make?
    A little support
    Now use the idea in your own reply on the phone.
    NowTell Sam one thing you build.
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Hi, Sam here. What do you make?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, Sam here. What do you make?"

*Nevím co říct, I'll try typing a simple thing I know.* → `answer` "I like Minecraft. creeper" · ok · 9s

**#12 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Creepers are scary! What do you make?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam one thing you build.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Creepers are scary! What do you make?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Creepers are scary! What do you make?"

*Nevím, co říct... I'll try typing something simple I know.* → `answer` "I like Minecraft. Dům" · ok · 15s

**#13 linga-moment**

    TV
    Linga
    Tomáš
    A way into English
    A moment
    You wanted to say Dům
    In English
    house
    Dům means house in Czech.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “Dům”
    In English: “house”
    Dům means house in Czech.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Aha, dům is house! Go back and try again.* → `back` · ok · 8s

**#14 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Do you have a house or a tree?
    One way to try it
    house
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam one thing you build.
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Do you have a house or a tree?
    One way to try it
    “house”
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    You · spoken
    I like Minecraft. Dům
    Sam · Minecraft friend
    Do you have a house or a tree?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Do you have a house or a tree?"

*Nevím jak říct, co stavím; zkusím jedno slovo, které znám.* → `answer` "House. I like house. Minecraft" · ok · 11s

**#15 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Nice, a house! What color is it?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam one thing you build.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Nice, a house! What color is it?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    You · spoken
    I like Minecraft. Dům
    Sam · Minecraft friend
    Do you have a house or a tree?
    You · spoken
    House. I like house. Minecraft
    Sam · Minecraft friend
    Nice, a house! What color is it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice, a house! What color is it?"

*Barva? Nevím anglicky, ale znám barvy: green.* → `answer` "Green. Je green." · ok · 12s

**#16 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Green is nice! Is it big?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam one thing you build.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Green is nice! Is it big?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    You · spoken
    I like Minecraft. Dům
    Sam · Minecraft friend
    Do you have a house or a tree?
    You · spoken
    House. I like house. Minecraft
    Sam · Minecraft friend
    Nice, a house! What color is it?
    You · spoken
    Green. Je green.
    Sam · Minecraft friend
    Green is nice! Is it big?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Green is nice! Is it big?"

*Nevím, jak říct, co stavím... zkusím pomoc.* → `cue` · ok · 0s

**#17 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Green is nice! Is it big?
    You could say
    Yes, it is big.
    NowTell Sam one thing you build.
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Green is nice! Is it big?
    You could say
    Yes, it is big.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    You · spoken
    I like Minecraft. Dům
    Sam · Minecraft friend
    Do you have a house or a tree?
    You · spoken
    House. I like house. Minecraft
    Sam · Minecraft friend
    Nice, a house! What color is it?
    You · spoken
    Green. Je green.
    Sam · Minecraft friend
    Green is nice! Is it big?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Green is nice! Is it big?"

*Big? Umím říct "yes"... I'll try a simple answer.* → `answer` "Yes. It is big. I like house." · ok · 16s

**#18 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Big house! What do you like to do?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam one thing you build.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Big house! What do you like to do?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    You · spoken
    I like Minecraft. Dům
    Sam · Minecraft friend
    Do you have a house or a tree?
    You · spoken
    House. I like house. Minecraft
    Sam · Minecraft friend
    Nice, a house! What color is it?
    You · spoken
    Green. Je green.
    Sam · Minecraft friend
    Green is nice! Is it big?
    You · spoken
    Yes. It is big. I like house.
    Sam · Minecraft friend
    Big house! What do you like to do?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Big house! What do you like to do?"

*Hurá, zvládl jsem to; I want to say I like to build and finish.* → `answer` "I like Minecraft. I like dog." · ok · 11s

**#19 linga-talk**

    TV
    Linga
    Tomáš
    Sam · Minecraft friend
    Show me your Minecraft world
    Sam says
    Animals are fun! What is in your world?
    Your turn
    Answer on your phone: speak or type.
    NowTell Sam one thing you build.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Animals are fun! What is in your world?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    You · spoken
    I like Minecraft. Dům
    Sam · Minecraft friend
    Do you have a house or a tree?
    You · spoken
    House. I like house. Minecraft
    Sam · Minecraft friend
    Nice, a house! What color is it?
    You · spoken
    Green. Je green.
    Sam · Minecraft friend
    Green is nice! Is it big?
    You · spoken
    Yes. It is big. I like house.
    Sam · Minecraft friend
    Big house! What do you like to do?
    You · spoken
    I like Minecraft. I like dog.
    Sam · Minecraft friend
    Animals are fun! What is in your world?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Animals are fun! What is in your world?"

*Hodně jsem toho řekl, chci skončit, zvládl jsem to.* → `finish` · ok · 0s

**#20 linga-coach**

    TV
    Linga
    Tomáš
    A way into English
    One useful change
    You said I like dog.
    One way to try it
    I like dogs.
    Dog is plural here, because you like dogs in general.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Show me your Minecraft world
    Say what you build and what you like to do in Minecraft.
    Now: Tell Sam one thing you build.
    Dog is plural here, because you like dogs in general.
    One way to try it: “I like dogs.”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · Minecraft friend
    Hi, Sam here. What do you make?
    You · spoken
    I like Minecraft. creeper
    Sam · Minecraft friend
    Creepers are scary! What do you make?
    You · spoken
    I like Minecraft. Dům
    Sam · Minecraft friend
    Do you have a house or a tree?
    You · spoken
    House. I like house. Minecraft
    Sam · Minecraft friend
    Nice, a house! What color is it?
    You · spoken
    Green. Je green.
    Sam · Minecraft friend
    Green is nice! Is it big?
    You · spoken
    Yes. It is big. I like house.
    Sam · Minecraft friend
    Big house! What do you like to do?
    You · spoken
    I like Minecraft. I like dog.
    Sam · Minecraft friend
    Animals are fun! What is in your world?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Dog is plural here, because you like dogs in general."

*I said something about dogs, that's enough, I did it.* → `finish` · ok · 0s

**#21 linga-recap**

    TV
    Linga
    Tomáš
    A way into English
    Your rehearsal
    You said I like dog.
    One way to try it
    I like dogs.
    Dog is plural here, because you like dogs in general.
    Your mission
    Choose a fresh context for your next conversation.
    6 spoken · 0 written replies · 4 on your own · 2 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Tomáš
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “I like to build a house.”
    From this rehearsal
    “Dům”: house
    Dům means house in Czech.
    Tried again: “House. I like house. Minecraft” · you used it
    Saved for the end
    “Je”: is
    'Je' is Czech. In English, say 'is' between the house and its colour.
    “I like house” → “I like houses.”
    After like, use houses, the plural.
    “I like dog.” → “I like dogs.”
    Dog is plural here, because you like dogs in general.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    My dog did something funny
    Tell a short story about what your dog or animal did.
    [button: Start talking]
    Or choose a situation [list: Show me your Minecraft world [plan-3a52fc31] | My dog did something funny [plan-1447e93a] | Who plays football with us? [plan-586ffaba] | Say hi and meet a new friend [plan-d7a78930] | Can you say that again, please? [plan-0cd2a370] | Can I have my turn now? [plan-d04b3124] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Zvládl jsem to, stačí, chci končit.* → `done` · observed (not acted on) · 0s

</details>
