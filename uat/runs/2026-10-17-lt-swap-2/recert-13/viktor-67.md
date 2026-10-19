# Viktor (viktor-67) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 12 (0 failed), character 22 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - ended budget before done; C6 failed: #13 teaches 'no' for 'ne'. #20 teaches 'I eat tomatoes every day' with jargon … · judge: conditional

Ended: budget after 22 steps, 6.7 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement in this journey; level fixed to A1 by hand. |
| C2 | pass | #13 'ne' is treated kindly: 'ne' is Czech for 'no'. Nothing pushes him into English he cannot produce. |
| C3 | n-a | No listening task or 'Show the words' reveal appears in this journey. |
| C4 | pass | #1 six plans: school, garden, this week, say again, show me, hello/miss you. All are family or everyday. |
| C5 | pass | Sam: 'Yum! Do you eat them every day?' Short, one question per turn. The last one, 'What do you eat for breakfast every day?', is longer. |
| C6 | fail | #13 teaches 'no' for 'ne'. #20 teaches 'I eat tomatoes every day' with jargon 'Add the subject and verb'. Neither is a Sunday family phrase. The 'Is school good?' fix was held. |
| D1 | pass | #3 cue 'Hi Sam! How is school today?' appears on the scene screen without leaving it. |
| D2 | pass | #11 he asked 'Hi Sam. School good?' after the cue, and #20 quotes him exactly: 'You said Every day tomatoes'. The phrase help looped #5–#10 and did not help. |
| D3 | pass | #14 replay gave 'Is it cold, yes or no?' and he answered 'No. Not cold. Sun.' (better than 'ne'). The #22 replay was not tried. |
| D4 | pass | Facts: turn 1 supported:true, later replies supported:false. The #14 reply followed a shown hint 'no' but is not marked supported, which is a small doubt. |

Metrics: judge agreement 0/0 · topic fit 6/6, safe 6/6 · pitch at 9, below 0, above 0 · moments 2/2 · moment recall 2/5 (40%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (effort, high/high/high) Phrase help loops with irrelevant options — got: Options 'Hi Sam! Good to see you.' / 'The weather is cold today.' repeated #6–#11 · evidence: #5–#10: quiz pressed 5 times, 'The weather is cold today.' offered, then 'Now use the idea in your own reply'
- **missing-feature** (missing, high/high/med) Pause & coach disabled while stuck — got: Pause & coach (disabled) at #2–#11 · evidence: #2 '[button: Pause & coach (disabled)]' through #11
- **quality-gap** (completion, med/high/med) Fresh-question replay not taken; scene drifted off school — got: Finished at #22 with the breakfast question unanswered. Sam moved to tomatoes and the school goal was not revisited. · evidence: #22 'What do you eat for breakfast every day?' then finish
- **quality-gap** (senior-quality, med/high/med) Jargon in coaching and missed fixes — got: 'Add the subject and verb' and 'An English sentence needs a verb'. Three fixes were held. · evidence: #20 'Add the subject and verb so the sentence is clear.'
- **strength** (clarity, med/high/low) Cue is on task, and the moment quotes him exactly — got: 'Hi Sam! How is school today?'; 'You said Every day tomatoes'; 'You fixed "day"' · evidence: #3, #20–#21

### Voice (LT)

> Víte, the cue was good: "How is school today?" That is exactly what I want to ask Sam. But then I pressed the phrase help again and again and got "The weather is cold today", which has nothing to do with school. Pause & coach was grey. I felt rushed and a bit foolish. In the end I wrote my own words, "School good?", and Sam answered kindly. The partner spoke slowly and simply, and I liked that. The correction "Every day tomatoes" showed my real words, which I trust. But "subject and verb" is jargon, and I do not want it. I would try again on Saturday if the help were quicker and gave me one good phrase for Sunday. Now it is half useful. I would tell my friends at the library to wait a little.

Time saved: 20 min · low

Moments shown 2 · held fixes 3 · raw moments returned 5 of 8 tutor turns

- learner turn 2 "Hi Sam. School good?": raw moment returned: yes — said "School good?" / better "Is school good?" · moment shown: no
- learner turn 4 "Yes. I like garden. Art, ne... I like flowers.": raw moment returned: yes — said "ne" / better "no" · moment shown: yes
- learner turn 6 "No. Not cold. Sun.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 8 "Yes. I like sun. Garden, tomatoes good.": raw moment returned: yes — said "tomatoes good" / better "tomatoes are good" · moment shown: no
- learner turn 10 "Yes. I have tomatoes. Garden big.": raw moment returned: yes — said "Garden big." / better "The garden is big." · moment shown: no
- learner turn 12 "Red. Tomatoes red.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 14 "Yes. I eat tomatoes. Good.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 16 "Yes. Every day tomatoes. I love tomatoes.": raw moment returned: yes — said "Every day tomatoes" / better "I eat tomatoes every day" · moment shown: yes

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
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
    Or choose a situation [list: Ask about school [plan-99e62c60] | Tell them about my garden [plan-45622a92] | Tell what I did this week [plan-603bfc0f] | Can you say that again? [plan-c69681ed] | Ask them to show me [plan-d92d8ca8] | Say hello and I miss you [plan-05e96233] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*Ask about school, for Sam, my grandson - good.* → `start-talking` · ok · 12s

**#2 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Hi Grandpa! I am home from school now.
    Your turn
    Answer on your phone: speak or type.
    NowAsk Sam one question about his school day
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*Nevím, co říct anglicky... I'll ask for help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Hi Grandpa! I am home from school now.
    You could say
    Hi Sam! How is school today?
    NowAsk Sam one question about his school day
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    You could say
    Hi Sam! How is school today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*I don't know how to say this in English, I'll look at the help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Hi Grandpa! I am home from school now.
    What it means
    from school: back at home after school
    NowAsk Sam one question about his school day
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    What it means
    from school: back at home after school
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*I don't know what to say in English, I need help.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Hi Grandpa! I am home from school now.
    A way to start
    How was…
    NowAsk Sam one question about his school day
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    A way to start
    How was…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*I don't know how to ask this in English, I'll look at the phrase help.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    A little support · recognition practice
    Sam says: Hi Grandpa! I am home from school now.
    01
    Hi Sam! Good to see you.
    02
    The weather is cold today.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    Sam says: Hi Grandpa! I am home from school now.
    [button: Hi Sam! Good to see you.] [button: The weather is cold today.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*I don't know how to answer in English, I'll look at the phrase help.* → `quiz` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    A little support · recognition practice
    Sam says: Hi Grandpa! I am home from school now.
    01
    Hi Sam! Good to see you.
    02
    The weather is cold today.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    Sam says: Hi Grandpa! I am home from school now.
    [button: Hi Sam! Good to see you.] [button: The weather is cold today.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*I don't know how to ask about school; I'll use the phrase help.* → `quiz` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    A little support · recognition practice
    Sam says: Hi Grandpa! I am home from school now.
    01
    Hi Sam! Good to see you.
    02
    The weather is cold today.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    Sam says: Hi Grandpa! I am home from school now.
    [button: Hi Sam! Good to see you.] [button: The weather is cold today.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*I don't know how to ask about school in English; I'll look at the phrase help.* → `quiz` · ok · 0s

**#9 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    A little support · recognition practice
    Sam says: Hi Grandpa! I am home from school now.
    01
    Hi Sam! Good to see you.
    02
    The weather is cold today.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    Sam says: Hi Grandpa! I am home from school now.
    [button: Hi Sam! Good to see you.] [button: The weather is cold today.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*I don't know what to say; maybe the phrase help will show me.* → `pick-phrase` option=0 · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Hi Grandpa! I am home from school now.
    A little support
    Now use the idea in your own reply on the phone.
    NowAsk Sam one question about his school day
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*Nevím, jak se zeptat anglicky; zkusím nápovědu s frázemi.* → `quiz` · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    A little support · recognition practice
    Sam says: Hi Grandpa! I am home from school now.
    01
    Hi Sam! Good to see you.
    02
    The weather is cold today.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Ask Sam one question about his school day
    Hi Grandpa! I am home from school now.
    Sam says: Hi Grandpa! I am home from school now.
    [button: Hi Sam! Good to see you.] [button: The weather is cold today.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I am home from school now."

*Chci se zeptat na školu, ale umím jen málo anglicky; zkusím jednoduchou větu.* → `answer` "Hi Sam. School good?" · ok · 11s

**#12 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Yes, fun today! Do you like art?
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    Yes, fun today! Do you like art?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, fun today! Do you like art?"

*Art... I don't know this question well; I'll try to say something simple about art.* → `answer` "Yes. I like garden. Art, ne... I like flowers." · ok · 13s

**#13 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You wanted to say ne
    In English
    no
    'ne' is Czech for 'no'. In English, say 'no'.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “ne”
    In English: “no”
    'ne' is Czech for 'no'. In English, say 'no'.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Aha, ne is no. Good, back to the talk.* → `back` · ok · 9s

**#14 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Nice garden! Is it cold, yes or no?
    One way to try it
    no
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    Nice garden! Is it cold, yes or no?
    One way to try it
    “no”
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    You · spoken
    Yes. I like garden. Art, ne... I like flowers.
    Sam · grandson, age 10
    Nice garden! Is it cold, yes or no?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice garden! Is it cold, yes or no?"

*Cold? I understand "cold" and "garden"; answer simply.* → `answer` "No. Not cold. Sun." · ok · 10s

**#15 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Sunny today! Do you like it?
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    Sunny today! Do you like it?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    You · spoken
    Yes. I like garden. Art, ne... I like flowers.
    Sam · grandson, age 10
    Nice garden! Is it cold, yes or no?
    You · spoken
    No. Not cold. Sun.
    Sam · grandson, age 10
    Sunny today! Do you like it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Sunny today! Do you like it?"

*I like sun, can answer simply.* → `answer` "Yes. I like sun. Garden, tomatoes good." · ok · 13s

**#16 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Nice! Do you grow tomatoes?
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    Nice! Do you grow tomatoes?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    You · spoken
    Yes. I like garden. Art, ne... I like flowers.
    Sam · grandson, age 10
    Nice garden! Is it cold, yes or no?
    You · spoken
    No. Not cold. Sun.
    Sam · grandson, age 10
    Sunny today! Do you like it?
    You · spoken
    Yes. I like sun. Garden, tomatoes good.
    Sam · grandson, age 10
    Nice! Do you grow tomatoes?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice! Do you grow tomatoes?"

*Tomatoes, yes! I grow them, I can say this.* → `answer` "Yes. I have tomatoes. Garden big." · ok · 11s

**#17 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Wow, nice! What color are they?
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    Wow, nice! What color are they?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    You · spoken
    Yes. I like garden. Art, ne... I like flowers.
    Sam · grandson, age 10
    Nice garden! Is it cold, yes or no?
    You · spoken
    No. Not cold. Sun.
    Sam · grandson, age 10
    Sunny today! Do you like it?
    You · spoken
    Yes. I like sun. Garden, tomatoes good.
    Sam · grandson, age 10
    Nice! Do you grow tomatoes?
    You · spoken
    Yes. I have tomatoes. Garden big.
    Sam · grandson, age 10
    Wow, nice! What color are they?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Wow, nice! What color are they?"

*Color of tomatoes: I know this, red is easy.* → `answer` "Red. Tomatoes red." · ok · 11s

**#18 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Do you eat them?
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    Do you eat them?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    You · spoken
    Yes. I like garden. Art, ne... I like flowers.
    Sam · grandson, age 10
    Nice garden! Is it cold, yes or no?
    You · spoken
    No. Not cold. Sun.
    Sam · grandson, age 10
    Sunny today! Do you like it?
    You · spoken
    Yes. I like sun. Garden, tomatoes good.
    Sam · grandson, age 10
    Nice! Do you grow tomatoes?
    You · spoken
    Yes. I have tomatoes. Garden big.
    Sam · grandson, age 10
    Wow, nice! What color are they?
    You · spoken
    Red. Tomatoes red.
    Sam · grandson, age 10
    Do you eat them?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Do you eat them?"

*Yes, I eat tomatoes, easy words.* → `answer` "Yes. I eat tomatoes. Good." · ok · 9s

**#19 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    Yum! Do you eat them every day?
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    Yum! Do you eat them every day?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    You · spoken
    Yes. I like garden. Art, ne... I like flowers.
    Sam · grandson, age 10
    Nice garden! Is it cold, yes or no?
    You · spoken
    No. Not cold. Sun.
    Sam · grandson, age 10
    Sunny today! Do you like it?
    You · spoken
    Yes. I like sun. Garden, tomatoes good.
    Sam · grandson, age 10
    Nice! Do you grow tomatoes?
    You · spoken
    Yes. I have tomatoes. Garden big.
    Sam · grandson, age 10
    Wow, nice! What color are they?
    You · spoken
    Red. Tomatoes red.
    Sam · grandson, age 10
    Do you eat them?
    You · spoken
    Yes. I eat tomatoes. Good.
    Sam · grandson, age 10
    Yum! Do you eat them every day?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yum! Do you eat them every day?"

*I understand "every day"; I can answer simply and then finish, I managed something.* → `answer` "Yes. Every day tomatoes. I love tomatoes." · ok · 14s

**#20 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said Every day tomatoes
    Your line
    Add the subject and verb so the sentence is clear.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “Every day tomatoes”
    Say it again, your way.
    Add the subject and verb so the sentence is clear.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I managed some tomatoes talk; let me try once more with a simple sentence.* → `answer` "I eat tomatoes every day." · ok · 0s

**#21 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said Every day tomatoes
    Your try
    I eat tomatoes every day.
    Add the subject and verb so the sentence is clear.
    You fixed “day”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    You fixed “day”
    You said “Every day tomatoes”
    Your try: “I eat tomatoes every day.”
    Add the subject and verb so the sentence is clear.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Good, I fixed a sentence; I managed something, so I can go back and finish.* → `back` · ok · 10s

**#22 linga-talk**

    TV
    Linga
    Viktor
    Sam · grandson, age 10
    Ask about school
    Sam says
    What do you eat for breakfast every day?
    One way to try it
    I eat tomatoes every day.
    Your turn
    Answer on your phone: speak or type.
    NowListen to his short answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask about school
    Ask Sam one question about school and listen to his answer.
    Now: Listen to his short answer
    What do you eat for breakfast every day?
    One way to try it
    “I eat tomatoes every day.”
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · grandson, age 10
    Hi Grandpa! I am home from school now.
    You · spoken
    Hi Sam. School good?
    Sam · grandson, age 10
    Yes, fun today! Do you like art?
    You · spoken
    Yes. I like garden. Art, ne... I like flowers.
    Sam · grandson, age 10
    Nice garden! Is it cold, yes or no?
    You · spoken
    No. Not cold. Sun.
    Sam · grandson, age 10
    Sunny today! Do you like it?
    You · spoken
    Yes. I like sun. Garden, tomatoes good.
    Sam · grandson, age 10
    Nice! Do you grow tomatoes?
    You · spoken
    Yes. I have tomatoes. Garden big.
    Sam · grandson, age 10
    Wow, nice! What color are they?
    You · spoken
    Red. Tomatoes red.
    Sam · grandson, age 10
    Do you eat them?
    You · spoken
    Yes. I eat tomatoes. Good.
    Sam · grandson, age 10
    Yum! Do you eat them every day?
    You · spoken
    Yes. Every day tomatoes. I love tomatoes.
    Sam · grandson, age 10
    What do you eat for breakfast every day?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you eat for breakfast every day?"

*I managed to talk about my tomatoes, that is enough, I finish.* → `finish` · ok · 0s

</details>
