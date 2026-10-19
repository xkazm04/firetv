# Viktor (viktor-67) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 10 (0 failed), character 22 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - ended character-stopped before done; D2 failed: The cue (#3) gave 'Said more simply: Can you see me?', which is a restatement,…; D3 failed: #17 'Try it again' gave a fresh question, but replay.used is false. His answer… · judge: fail

Ended: character-stopped after 22 steps, 5.9 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | Placement not run; level set to A1 by fixture. |
| C2 | n-a | Viktor never answered in Czech in this transcript (#8-#21 all English). |
| C3 | n-a | No 'Show the words' listening task in J4. |
| C4 | n-a | Topic list not judged; the one scene (Mia's day, garden, cat) was family-based. |
| C5 | pass | Mia's turns are short with one question each: 'Nice! Are the tomatoes red too?' (#19). 'I drew a cat' (#9) is past tense. |
| C6 | pass | #14/#15 'I have a cat in the garden', #22 'Yes, the tomatoes are big': both correct and usable on Sunday, though only articles and 'are'. |
| D1 | pass | #2 'Help me answer', #4 'Choose a phrase' and Pause & coach were all on the scene screen; he never left the conversation. |
| D2 | fail | The cue (#3) gave 'Said more simply: Can you see me?', which is a restatement, not an answer phrase. The cue (#10, #12) repeated 'Try: What did you do at school today?' and he typed his own line. The moment note did quote him exactly (#14 'You said I have cat in garden.'). |
| D3 | fail | #17 'Try it again' gave a fresh question, but replay.used is false. His answer 'I have tomato and flowers' keeps a plural slip, so it is not clearly better. |
| D4 | pass | Evidence rows mark the cue/quiz-assisted turns 'supported: true' (quiz picks, 'I draw garden'). Unassisted turns are 'supported: false'. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 8, below 0, above 1 · moments 2/2 · moment recall 2/7 (29%) · breaches 0

Disagreements: No placement tasks in J4.

### Findings

- **quality-gap** (missing, high/high/high) Help cue repeats a line that does not answer Mia — got: 'Try: What did you do at school today?' stays on screen after Mia says 'I drew a cat. Do you draw?'. The first cue only restated 'Can you see me?'. · evidence: #3, #5, #10, #12: 'Try: What did you do at school today?'
- **quality-gap** (clarity, high/high/med) Phrase quiz is not about the current scene — got: 'Which question asks about her day at school?' while Mia asks 'Do you draw?'. 'Where is my garden?' is a throwaway distractor. · evidence: #11 quiz after #9 'I drew a cat. Do you draw?'
- **quality-gap** (senior-quality, med/high/med) Past-tense help above A1 — got: The cue and quiz offer 'What did you do at school today?'. Mia says 'I drew a cat'. · evidence: #5, #9
- **quality-gap** (completion, med/med/med) Replay does not show a better answer — got: replay.used false. The answer 'I have tomato and flowers' keeps a plural slip, which was held and never shown. · evidence: #17; facts moments[0].replay.used=false
- **quality-gap** (missing, med/med/med) Five of seven errors had only held fixes; coaching null — got: Two stops only, and facts.coaching is null. 'Red, small time' passed with a 'Nice!' reply. · evidence: facts.heldFixes (5); #19-#20
- **strength** (trust, med/high/low) Moment quotes him exactly and the fix is correct — got: 'You said I have cat in garden.' then 'Try I have a cat in the garden.' He repeated it right, and the second fix was also taken up (#21 'Tomatoes are big'). · evidence: #14-#16, #21-#22
- **strength** (effort, med/high/low) Support is flagged, so the picture stays honest — got: Evidence rows carry supported:true for the quiz and cue turns. Unassisted turns are false. · evidence: facts.evidence

### Voice (LT)

> Víte, the scene about Mia and my garden was exactly what I want for Sunday, and the partner spoke slowly with one small question each time. I liked that the fix quoted my own words, "I have cat in garden", and showed me "a cat in the garden". But when I was stuck, the help did not help me. The same sentence about school stayed on the screen even when Mia asked about her cat, and the quiz asked about something else. I ended up typing my own words anyway. "Did you do" is hard for me too. Some of my mistakes were never explained to me, like "Red, small time". I would use it on Saturday for the garden words, but I would not yet trust the help button. Fifteen minutes at home beats the tram, so I would try again.

Time saved: 30 min · low

Moments shown 1 · held fixes 5 · raw moments returned 7 of 7 tutor turns

- learner turn 2 "Hello Mia. Yes, I see you. You school today?": raw moment returned: yes — said "You school today?" / better "Did you go to school today?" · moment shown: no
- learner turn 4 "Yes, I draw. I draw garden. Nice cat!": raw moment returned: yes — said "I draw garden" / better "I draw a garden" · moment shown: no
- learner turn 6 "Yes, I like cat. I have cat in garden.": raw moment returned: yes — said "I have cat in garden." / better "I have a cat in the garden." · moment shown: yes
- learner turn 9 "I have tomato and flowers. My garden is big.": raw moment returned: yes — said "I have tomato and flowers" / better "I have tomatoes and flowers." · moment shown: no
- learner turn 11 "Flowers red and yellow. I love flowers.": raw moment returned: yes — said "Flowers red and yellow." / better "The flowers are red and yellow." · moment shown: no
- learner turn 13 "Tomatoes green. Red, small time. I love tomatoes.": raw moment returned: yes — said "Red, small time." / better "Some are red, some are small." · moment shown: no
- learner turn 15 "Yes, tomatoes big. I love my garden.": raw moment returned: yes — said "Yes, tomatoes big." / better "Yes, the tomatoes are big." · moment shown: yes

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A1First words · self-chosen
    Ask about school
    Your mission
    Ask one short question about school and understand a short answer.
    Tell what happened
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
    Ask one short question about school and understand a short answer.
    [button: Start talking]
    Or choose a situation [list: Ask about school [plan-b4a503b6] | My garden and the weather [plan-f04ca151] | Tell them you miss them [plan-caf59c0e] | Say that again, please [plan-8c1dace6] | Hello and take your turn [plan-254cb54d] | Plan the next video call [plan-bb0d66f8] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*Ask about school is exactly what I want for Mia, so I'll start.* → `start-talking` · ok · 6s

**#2 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Hi Grandpa! Can you see me?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Mia one short question
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Ask Mia one short question
    Hi Grandpa! Can you see me?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! Can you see me?"

*I don't know how to ask in English, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Hi Grandpa! Can you see me?
    Said more simply
    Can you see me?
    NowAsk Mia one short question
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Ask Mia one short question
    Hi Grandpa! Can you see me?
    Said more simply
    Can you see me?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! Can you see me?"

*I don't know what to say in English, I need help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Hi Grandpa! Can you see me?
    What it means
    see: look with your eyes
    NowAsk Mia one short question
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Ask Mia one short question
    Hi Grandpa! Can you see me?
    What it means
    see: look with your eyes
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! Can you see me?"

*I don't know how to answer in English, I'll look at the phrase help.* → `quiz` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Which question asks about her day at school?
    01
    What did you do at school today?
    02
    Where is my garden?
    A little support
    Try: What did you do at school today?
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Ask Mia one short question
    Hi Grandpa! Can you see me?
    A little support
    Try: What did you do at school today?
    Which question asks about her day at school?
    [button: What did you do at school today?] [button: Where is my garden?]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! Can you see me?"

*Ah, a quiz; the first sentence is about school, I know that word.* → `pick-phrase` option=0 · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Hi Grandpa! Can you see me?
    A little support
    Now use the idea in your own reply on the phone.
    NowAsk Mia one short question
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Ask Mia one short question
    Hi Grandpa! Can you see me?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! Can you see me?"

*I don't know what to say in English; maybe the phrase choices will help.* → `quiz` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Which question asks about her day at school?
    01
    What did you do at school today?
    02
    Where is my garden?
    A little support
    Try: What did you do at school today?
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Ask Mia one short question
    Hi Grandpa! Can you see me?
    A little support
    Try: What did you do at school today?
    Which question asks about her day at school?
    [button: What did you do at school today?] [button: Where is my garden?]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! Can you see me?"

*The first one is about school, I think. I choose number one.* → `pick-phrase` option=0 · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Hi Grandpa! Can you see me?
    A little support
    Now use the idea in your own reply on the phone.
    NowAsk Mia one short question
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Ask Mia one short question
    Hi Grandpa! Can you see me?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! Can you see me?"

*I don't know what to say in English; maybe I can try myself a short question.* → `answer` "Hello Mia. Yes, I see you. You school today?" · ok · 10s

**#9 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    I drew a cat. Do you draw?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    I drew a cat. Do you draw?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I drew a cat. Do you draw?"

*I don't understand all of it; I need help to answer.* → `cue` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    I drew a cat. Do you draw?
    A little support
    Try: What did you do at school today?
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    I drew a cat. Do you draw?
    A little support
    Try: What did you do at school today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I drew a cat. Do you draw?"

*I don't know what to say back; the phrase help might make it easier.* → `quiz` · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Which question asks about her day at school?
    01
    What did you do at school today?
    02
    Where is my garden?
    A little support
    Try: What did you do at school today?
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    I drew a cat. Do you draw?
    A little support
    Try: What did you do at school today?
    Which question asks about her day at school?
    [button: What did you do at school today?] [button: Where is my garden?]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I drew a cat. Do you draw?"

*Mia kreslila kočku, ale já nevím, co říct; zkusím pomoc.* → `cue` · ok · 0s

**#12 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    I drew a cat. Do you draw?
    A little support
    Try: What did you do at school today?
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    I drew a cat. Do you draw?
    A little support
    Try: What did you do at school today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I drew a cat. Do you draw?"

*Kresba kočky... I will answer simply, I draw a little garden.* → `answer` "Yes, I draw. I draw garden. Nice cat!" · ok · 9s

**#13 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Nice! Do you like cats?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    Nice! Do you like cats?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    You · spoken
    Yes, I draw. I draw garden. Nice cat!
    Mia · granddaughter, age 9
    Nice! Do you like cats?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice! Do you like cats?"

*I like cats, I can try a short answer myself.* → `answer` "Yes, I like cat. I have cat in garden." · ok · 9s

**#14 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said I have cat in garden.
    Your line
    One cat needs 'a' before it, and 'the garden' names the place.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I have cat in garden.”
    Say it again, your way.
    One cat needs 'a' before it, and 'the garden' names the place.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I don't know how to fix it, I will ask to be shown.* → `show-me` · ok · 0s

**#15 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said I have cat in garden.
    Try
    I have a cat in the garden.
    One cat needs 'a' before it, and 'the garden' names the place.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I have cat in garden.”
    Try “I have a cat in the garden.”
    One cat needs 'a' before it, and 'the garden' names the place.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I try to say it again, short and simple.* → `answer` "I have a cat in the garden." · ok · 0s

**#16 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said I have cat in garden.
    Your try
    I have a cat in the garden.
    One cat needs 'a' before it, and 'the garden' names the place.
    You fixed “have a cat”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    You fixed “have a cat”
    You said “I have cat in garden.”
    Your try: “I have a cat in the garden.”
    One cat needs 'a' before it, and 'the garden' names the place.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I fixed a sentence, good, now go back and continue.* → `back` · ok · 6s

**#17 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Cool! What do you have in your garden?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    Cool! What do you have in your garden?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    You · spoken
    Yes, I draw. I draw garden. Nice cat!
    Mia · granddaughter, age 9
    Nice! Do you like cats?
    You · spoken
    Yes, I like cat. I have cat in garden.
    Mia · granddaughter, age 9
    Nice! What colour is your cat?
    Mia · granddaughter, age 9
    Cool! What do you have in your garden?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Cool! What do you have in your garden?"

*I understand garden; I can say tomatoes and flowers simply.* → `answer` "I have tomato and flowers. My garden is big." · ok · 9s

**#18 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Wow, big garden! What colour are the flowers?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    Wow, big garden! What colour are the flowers?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    You · spoken
    Yes, I draw. I draw garden. Nice cat!
    Mia · granddaughter, age 9
    Nice! Do you like cats?
    You · spoken
    Yes, I like cat. I have cat in garden.
    Mia · granddaughter, age 9
    Nice! What colour is your cat?
    Mia · granddaughter, age 9
    Cool! What do you have in your garden?
    You · spoken
    I have tomato and flowers. My garden is big.
    Mia · granddaughter, age 9
    Wow, big garden! What colour are the flowers?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Wow, big garden! What colour are the flowers?"

*Colour of flowers, I know red and yellow maybe.* → `answer` "Flowers red and yellow. I love flowers." · ok · 8s

**#19 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Nice! Are the tomatoes red too?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    Nice! Are the tomatoes red too?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    You · spoken
    Yes, I draw. I draw garden. Nice cat!
    Mia · granddaughter, age 9
    Nice! Do you like cats?
    You · spoken
    Yes, I like cat. I have cat in garden.
    Mia · granddaughter, age 9
    Nice! What colour is your cat?
    Mia · granddaughter, age 9
    Cool! What do you have in your garden?
    You · spoken
    I have tomato and flowers. My garden is big.
    Mia · granddaughter, age 9
    Wow, big garden! What colour are the flowers?
    You · spoken
    Flowers red and yellow. I love flowers.
    Mia · granddaughter, age 9
    Nice! Are the tomatoes red too?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice! Are the tomatoes red too?"

*Tomatoes are green now, I can say a little.* → `answer` "Tomatoes green. Red, small time. I love tomatoes." · ok · 13s

**#20 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Video call: Mia's day
    Mia says
    Oh, green tomatoes! Are they big?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand her main answer
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Video call: Mia's day
    Ask Mia one short question about school and understand her short answer.
    Now: Understand her main answer
    Oh, green tomatoes! Are they big?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! Can you see me?
    You · spoken
    Hello Mia. Yes, I see you. You school today?
    Mia · granddaughter, age 9
    I drew a cat. Do you draw?
    You · spoken
    Yes, I draw. I draw garden. Nice cat!
    Mia · granddaughter, age 9
    Nice! Do you like cats?
    You · spoken
    Yes, I like cat. I have cat in garden.
    Mia · granddaughter, age 9
    Nice! What colour is your cat?
    Mia · granddaughter, age 9
    Cool! What do you have in your garden?
    You · spoken
    I have tomato and flowers. My garden is big.
    Mia · granddaughter, age 9
    Wow, big garden! What colour are the flowers?
    You · spoken
    Flowers red and yellow. I love flowers.
    Mia · granddaughter, age 9
    Nice! Are the tomatoes red too?
    You · spoken
    Tomatoes green. Red, small time. I love tomatoes.
    Mia · granddaughter, age 9
    Oh, green tomatoes! Are they big?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Oh, green tomatoes! Are they big?"

*Big? Yes, small and big, I try simple.* → `answer` "Yes, tomatoes big. I love my garden." · ok · 7s

**#21 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said Yes, tomatoes big.
    Your line
    Add 'are' before 'big' when you talk about tomatoes.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “Yes, tomatoes big.”
    Say it again, your way.
    Add 'are' before 'big' when you talk about tomatoes.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I will say it again with 'are', short and simple.* → `answer` "Tomatoes are big. I love my garden." · ok · 0s

**#22 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said Yes, tomatoes big.
    Try
    Yes, the tomatoes are big.
    Add 'are' before 'big' when you talk about tomatoes.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “Yes, tomatoes big.”
    Try “Yes, the tomatoes are big.”
    Add 'are' before 'big' when you talk about tomatoes.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I managed to say something nice; I will finish now.* → `done` · done · 0s

</details>
