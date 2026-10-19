# Viktor (viktor-67) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 7 (0 failed), character 21 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D3 failed: #20 offered 'Replay the moment' but he chose 'Finish for today'; moments[0].re… · judge: fail

Ended: done after 21 steps, 5.5 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | Level fixture A1 equals trueBand A1 (exact). |
| C2 | n-a | Viktor never answered in Czech here; Czech appears only in his private thoughts (#5 'Nevím, co říct'), so acceptance of Czech is not shown. |
| C3 | n-a | No listening task or scored reveal. #5 'What it means' only glosses 'home from'; nothing scored. |
| C4 | pass | #1 six planned topics are all family/home: school, garden, hello, say it again, next call, 'Say I miss you'. |
| C5 | pass | Partner turns short, one question each: #15 'Can you ask a good school question?', #18 'Do you like tomatoes?', #19 'Are they red?'. |
| C6 | pass | #12-13 'School good?' → 'Is school good?'; recap 'Tomatoes good.' → 'Tomatoes are good.' All correct, usable on Sunday. |
| D1 | pass | #2-#3 'Help me answer' gave 'Hi Mia! How is school today?' and 'Choose a phrase' gave options, all inside the scene. |
| D2 | pass | #3 cue led to his reply 'Hello Mia. I love you. School good?' (#11); coaching quotes him exactly: 'You said School good?' (#12) and 'Tomatoes good.' (#20). |
| D3 | fail | #20 offered 'Replay the moment' but he chose 'Finish for today'; moments[0].replay.used false, repair spent. No fresh question answered better. |
| D4 | pass | #21 '2 on your own · 2 with help'; evidence marks supported true for the cued turns and false for 'Yes, I like tomatoes.' |

Metrics: judge agreement 0/0 · topic fit 6/6, safe 6/6 · pitch at 5, below 0, above 0 · moments 1/1 · moment recall 4/4 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (completion, high/high/med) Replay moment offered but not taken; replay spent — got: Coach offered 'Replay the moment'; he finished; replay.used false · evidence: #20 buttons 'Replay the moment' / 'Finish for today'; moments[0].replay used false, spent true
- **broken-flow** (clarity, high/high/med) Mission done fires while Mia's question is unanswered — got: Mission done shown beside 'Are they red?' · evidence: #19 'Mia says Are they red? ... Mission done. See what you did tonight.'
- **quality-gap** (senior-quality, high/high/high) Phrase choices irrelevant to the task — got: 'Good! Tell me more.' and 'I have a red car.' for task 'Ask Mia how school is today' · evidence: #4, #6, #8, #10 options repeated, never a school question
- **quality-gap** (clarity, med/med/med) Cue at #16 does not help the current task — got: 'Yes, I can ask you.' · evidence: #16 task 'Ask one more question about her day', cue 'Yes, I can ask you.'
- **quality-gap** (effort, med/med/med) Pause & coach not offered; help buttons loop — got: coach action result 'not-offered'; cue and phrase screens alternated 8 steps · evidence: #10 result not-offered; #2-#10 loop
- **strength** (trust, high/high/low) Coaching quotes the learner exactly, corrections correct — got: 'You said School good?' and recap quotes all four lines with correct fixes · evidence: #12, #20, #21
- **strength** (senior-quality, high/high/low) Helpful first cue and short slow partner — got: 'Hi Mia! How is school today?' and Mia's one-question turns · evidence: #3, #15-#19

### Voice (LT)

> Víte, I liked Mia. She speaks slowly, one question, no sighing, and she talks about school and tomatoes, which is my Sunday. The first help, "How is school today?", was exactly what I needed. But then the phrase choices offered "I have a red car", which is no use to me, and the buttons went round and round. The correction "Is school good?" I understood, and I could say it. At the end it said "Mission done" while Mia was still asking "Are they red?" I wanted to answer! And I did not try the replay, so I do not know if I would do better. I trust the corrections; they used my own words. I would come on Saturday again, but the help must be about my grandchildren, not red cars. I would tell my friend from the library, carefully.

Time saved: 30 min · low

Moments shown 1 · held fixes 3 · raw moments returned 4 of 4 tutor turns

- learner turn 2 "Hello Mia. I love you. School good?": raw moment returned: yes — said "School good?" / better "Is school good?" · moment shown: yes
- learner turn 4 "Mia, you have good day?": raw moment returned: yes — said "you have good day?" / better "Did you have a good day?" · moment shown: no
- learner turn 6 "I draw garden. Tomatoes.": raw moment returned: yes — said "I draw garden" / better "I draw a garden" · moment shown: no
- learner turn 8 "Yes, I like tomatoes. Tomatoes good.": raw moment returned: yes — said "Tomatoes good." / better "Tomatoes are good." · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A1First words · self-chosen
    Ask about school
    Your mission
    Ask one simple question about school and listen to the answer.
    Connect with people
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Ask about school
    Ask one simple question about school and listen to the answer.
    [button: Start talking]
    Or choose a situation [list: Ask about school [plan-2bebe6fe] | Tell about my garden [plan-2adef8d9] | Say hello and start the call [plan-f407d878] | Ask them to say it again [plan-c7308f92] | Plan the next call [plan-f822b282] | Say I miss you [plan-bb790cfe] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*Mia and school, that's what I want; I press Start talking.* → `start-talking` · ok · 10s

**#2 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    Your turn
    Answer on your phone: speak or type.
    NowAsk Mia how school is today
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*I don't know how to ask this in English, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    You could say
    Hi Mia! How is school today?
    NowAsk Mia how school is today
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    You could say
    Hi Mia! How is school today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*I don't know what to say in English, so I'll look for the phrase help.* → `quiz` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I am home from school.
    01
    Good! Tell me more.
    02
    I have a red car.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    Mia says: Hi Grandpa! I am home from school.
    [button: Good! Tell me more.] [button: I have a red car.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*I don't know what to say in English; maybe the phrase options help.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    What it means
    home from: back after being at
    NowAsk Mia how school is today
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    What it means
    home from: back after being at
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*Nevím, co říct... I need help with the words.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I am home from school.
    01
    Good! Tell me more.
    02
    I have a red car.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    Mia says: Hi Grandpa! I am home from school.
    [button: Good! Tell me more.] [button: I have a red car.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*Nevím, co říct anglicky... I need help with the words.* → `cue` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    A way to start
    How is school…
    NowAsk Mia how school is today
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    A way to start
    How is school…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*I don't know what to say in English; I'll look at the phrase help.* → `quiz` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I am home from school.
    01
    Good! Tell me more.
    02
    I have a red car.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    Mia says: Hi Grandpa! I am home from school.
    [button: Good! Tell me more.] [button: I have a red car.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*I don't know what to say; I'll look at the help with a sentence.* → `pick-phrase` option=0 · ok · 0s

**#9 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    A little support
    Now use the idea in your own reply on the phone.
    NowAsk Mia how school is today
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*Nevím, jak říct anglicky... I need help with the phrases.* → `quiz` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I am home from school.
    01
    Good! Tell me more.
    02
    I have a red car.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    Mia says: Hi Grandpa! I am home from school.
    [button: Good! Tell me more.] [button: I have a red car.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*Nevím, co říct. I need help with the words.* → `coach` · not-offered · 0s

**#11 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I am home from school.
    01
    Good! Tell me more.
    02
    I have a red car.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask Mia how school is today
    Hi Grandpa! I am home from school.
    Mia says: Hi Grandpa! I am home from school.
    [button: Good! Tell me more.] [button: I have a red car.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school."

*Mia says hello; I can say a simple thing about school.* → `answer` "Hello Mia. I love you. School good?" · ok · 13s

**#12 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said School good?
    Your line
    A question starts with 'Is' here.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “School good?”
    Say it again, your way.
    A question starts with 'Is' here.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I don't understand this; I'll press Show me for help.* → `show-me` · ok · 0s

**#13 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said School good?
    Try
    Is school good?
    A question starts with 'Is' here.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “School good?”
    Try “Is school good?”
    A question starts with 'Is' here.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Easy fix: "Is school good?" I can say it again.* → `answer` "Is school good?" · ok · 0s

**#14 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said School good?
    Your try
    Is school good?
    A question starts with 'Is' here.
    You fixed “Is”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    You fixed “Is”
    You said “School good?”
    Your try: “Is school good?”
    A question starts with 'Is' here.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I fixed it, nice; back to the conversation to carry on.* → `back` · ok · 13s

**#15 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Can you ask a good school question?
    Your turn
    Answer on your phone: speak or type.
    NowAsk one more question about her day
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask one more question about her day
    Can you ask a good school question?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Hello Mia. I love you. School good?
    Mia · granddaughter, age 9
    Can you ask a good school question?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Can you ask a good school question?"

*I don't know what to ask next; I'll use the help button.* → `cue` · ok · 0s

**#16 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Can you ask a good school question?
    You could say
    Yes, I can ask you.
    NowAsk one more question about her day
    [button: More help] [button: Pause & coach] [button: Cut]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Ask one more question about her day
    Can you ask a good school question?
    You could say
    Yes, I can ask you.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Hello Mia. I love you. School good?
    Mia · granddaughter, age 9
    Can you ask a good school question?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Can you ask a good school question?"

*I don't understand it all, I'll try a simple question about her day.* → `answer` "Mia, you have good day?" · ok · 14s

**#17 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Yes, good day! What do you draw?
    Your turn
    Answer on your phone: speak or type.
    NowListen to Mia's answer and react
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Listen to Mia's answer and react
    Yes, good day! What do you draw?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Hello Mia. I love you. School good?
    Mia · granddaughter, age 9
    Can you ask a good school question?
    You · spoken
    Mia, you have good day?
    Mia · granddaughter, age 9
    Yes, good day! What do you draw?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, good day! What do you draw?"

*Mia asks what I draw; I can say a simple thing about my garden.* → `answer` "I draw garden. Tomatoes." · ok · 11s

**#18 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Do you like tomatoes?
    Your turn
    Answer on your phone: speak or type.
    NowListen to Mia's answer and react
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Now: Listen to Mia's answer and react
    Do you like tomatoes?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Hello Mia. I love you. School good?
    Mia · granddaughter, age 9
    Can you ask a good school question?
    You · spoken
    Mia, you have good day?
    Mia · granddaughter, age 9
    Yes, good day! What do you draw?
    You · spoken
    I draw garden. Tomatoes.
    Mia · granddaughter, age 9
    Do you like tomatoes?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Do you like tomatoes?"

*I like tomatoes, I can say it simply.* → `answer` "Yes, I like tomatoes. Tomatoes good." · ok · 16s

**#19 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: ask Mia about school
    Mia says
    Are they red?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Are they red?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Hello Mia. I love you. School good?
    Mia · granddaughter, age 9
    Can you ask a good school question?
    You · spoken
    Mia, you have good day?
    Mia · granddaughter, age 9
    Yes, good day! What do you draw?
    You · spoken
    I draw garden. Tomatoes.
    Mia · granddaughter, age 9
    Do you like tomatoes?
    You · spoken
    Yes, I like tomatoes. Tomatoes good.
    Mia · granddaughter, age 9
    Are they red?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Are they red?"

*Mission is done and I managed something; I want to see what I did.* → `finish` · ok · 0s

**#20 linga-coach**

    TV
    Linga
    Viktor
    A way into English
    One useful change
    You said Tomatoes good.
    One way to try it
    Tomatoes are good.
    Tomatoes is plural, so it needs 'are' before 'good'.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: ask Mia about school
    Ask one simple question about school and listen to the answer.
    Tomatoes is plural, so it needs 'are' before 'good'.
    One way to try it: “Tomatoes are good.”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Hello Mia. I love you. School good?
    Mia · granddaughter, age 9
    Can you ask a good school question?
    You · spoken
    Mia, you have good day?
    Mia · granddaughter, age 9
    Yes, good day! What do you draw?
    You · spoken
    I draw garden. Tomatoes.
    Mia · granddaughter, age 9
    Do you like tomatoes?
    You · spoken
    Yes, I like tomatoes. Tomatoes good.
    Mia · granddaughter, age 9
    Are they red?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Tomatoes is plural, so it needs 'are' before 'good'."

*I talked with Mia and managed something, so I am happy to finish for today.* → `finish` · ok · 0s

**#21 linga-recap**

    TV
    Linga
    Viktor
    A way into English
    Your rehearsal
    You said Tomatoes good.
    One way to try it
    Tomatoes are good.
    Tomatoes is plural, so it needs 'are' before 'good'.
    Your mission
    Choose a fresh context for your next conversation.
    4 spoken · 0 written replies · 2 on your own · 2 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Art”
    From this rehearsal
    “School good?” → “Is school good?”
    A question starts with 'Is' here.
    Tried again: “Mia, you have good day?”
    Saved for the end
    “you have good day?” → “Did you have a good day?”
    Add 'a' before 'good day' and start the question with 'Did'.
    “I draw garden” → “I draw a garden”
    Say 'a' before garden.
    “Tomatoes good.” → “Tomatoes are good.”
    Tomatoes is plural, so it needs 'are' before 'good'.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Tell about my garden
    Tell your grandchild two things about your garden, like flowers or tomatoes.
    [button: Start talking]
    Or choose a situation [list: Ask about school [plan-2bebe6fe] | Tell about my garden [plan-2adef8d9] | Say hello and start the call [plan-f407d878] | Ask them to say it again [plan-c7308f92] | Plan the next call [plan-f822b282] | Say I miss you [plan-bb790cfe] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*I managed to talk about school and tomatoes, that is enough for today.* → `done` · observed (not acted on) · 0s

</details>
