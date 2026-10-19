# Viktor (viktor-67) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 8 (0 failed), character 20 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: Cue #3 "Hi Grandpa! I am home now." and quiz #5 gave no usable reply; he wrote…; D3 failed: #19 offers the fresh question "Which tomatoes are red, big or small?" but he p… · judge: fail

Ended: done after 20 steps, 7.3 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | Level fixture A1 equals true band A1; recap #20 "A1 · First words". |
| C2 | n-a | Viktor never answered in Czech in this journey, so acceptance of Czech was not shown. |
| C3 | pass | #4, #9 "What it means" glosses let him follow without typing; scored help replies were marked supported (evidence success:false for the mismatched choice), not as independent speech. |
| C4 | n-a | Topics were fixture-agreed; this journey shows one topic (school), not six. |
| C5 | pass | Partner lines short, one question each: "Tomatoes! Are they red?" (#15). Slip: #19 "Nice! Which tomatoes are red, big or small?" is odd and Mia ignored his question "you draw garden?". |
| C6 | pass | The one moment "tomatoes are red" (#16) is correct and everyday; held fixes on recap (#20) are correct. |
| D1 | pass | #2 "Help me answer", #4 "Choose a phrase" and #16 "Show me" were all found without leaving the scene. |
| D2 | fail | Cue #3 "Hi Grandpa! I am home now." and quiz #5 gave no usable reply; he wrote his own #7 "Mia, school good?". The moment note quotes him exactly (#16 "You said Yes, tomatoes red."), but the help only unblocked by parroting at #17. |
| D3 | fail | #19 offers the fresh question "Which tomatoes are red, big or small?" but he pressed Finish without answering; replay.spent true, no better answer shown. |
| D4 | pass | Help turns flagged supported:true ("Mia, school good?"); recap #20 "3 on your own · 2 with help". |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 6, below 0, above 1 · moments 1/1 · moment recall 3/4 (75%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (senior-quality, high/high/high) Phrase quiz quotes a Mia line she never said — got: Quiz header "Mia says: School was good. I had maths and art." with options "Nice! What did you draw in art?" / "I like the garden very much." · evidence: #5, #10: the quiz is the same stale text at both turns, not what Mia said at #8.
- **quality-gap** (trust, med/med/high) Correct answer rejected as wrong purpose — got: "That phrase has a different purpose. Try the other option." and evidence success:false · evidence: #11, #12 after Mia asked "What do you like?" (#8).
- **quality-gap** (senior-quality, high/high/med) Cue gives no sayable reply and a past-tense line — got: "Said more simply: Hi Grandpa! I am home now." and "What it means" gloss only; quiz uses "I had maths and art" · evidence: #3, #4, #9: help restates Mia instead of giving Viktor words.
- **broken-flow** (completion, high/high/med) Replay question never answered — got: #19 shows "Which tomatoes are red, big or small?" labelled Try it again; he finished immediately, replay spent · evidence: #19 finish; moments[0].repair spent true, no answer.
- **quality-gap** (clarity, med/med/low) Odd partner turns after replay — got: Two consecutive partner turns, "Me too! Do you eat them?" then "Nice! Which tomatoes are red, big or small?"; Mia ignored his "you draw garden?" · evidence: facts.conversation last turns; #19 transcript.
- **strength** (senior-quality, high/high/low) Moment quotes him exactly and fix is correct — got: "You said Yes, tomatoes red." → "Yes, tomatoes are red." with a verb explanation; held fixes on recap · evidence: #16-#18, #20.
- **strength** (effort, high/high/low) Help stays in scene and is honestly recorded — got: Help me answer, Choose a phrase, Show me all inline; recap "3 on your own · 2 with help" · evidence: #2, #16, #20.

### Voice (LT)

> I liked that the help was right there on the screen and Mia spoke slowly, so I never felt rushed. The correction about "tomatoes are red" was clear, and I could see my own words quoted. That is respectful. But the phrase help confused me. It talked about "maths and art", which Mia never said, and it told me my answer "I like the garden" had a different purpose, when she asked what I like. That I do not trust. The cue did not give me words for Sunday; I made up "Mia, school good?" myself. At the end she asked a new question and I simply finished, nobody asked me to try. For fifteen minutes on Saturday it could replace the tram to the library if the help matched the conversation. Now, děkuji, only partly. I would try it once more.

Time saved: 30 min · low

Moments shown 1 · held fixes 2 · raw moments returned 3 of 5 tutor turns

- learner turn 2 "Mia, school good?": raw moment returned: yes — said "school good?" / better "Is school good?" · moment shown: no
- learner turn 4 "Art good. Mia, you draw garden?": raw moment returned: yes — said "you draw garden?" / better "do you draw in the garden?" · moment shown: no
- learner turn 6 "Yes, I like art. I love you, Mia.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 8 "Yes, garden big. I have tomatoes.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 10 "Yes, tomatoes red. I love tomatoes.": raw moment returned: yes — said "Yes, tomatoes red." / better "Yes, tomatoes are red." · moment shown: yes

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A1First words · self-chosen
    Ask about school
    Your mission
    Ask one short question about school and listen to the answer.
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
    Ask one short question about school and listen to the answer.
    [button: Start talking]
    Or choose a situation [list: Ask about school [plan-bcf33eb9] | Tell about my garden [plan-62a2f482] | Say hello and take a turn [plan-a2323f5d] | Ask them to say it again [plan-0c72572c] | Plan the next call [plan-84f99615] | Tell them about my week [plan-45741b7b] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*Ask about school, that is what I want for Mia.* → `start-talking` · ok · 8s

**#2 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    Your turn
    Answer on your phone: speak or type.
    NowAsk Mia one question about school.
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Ask Mia one question about school.
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

*Nevím, jak se anglicky zeptat; zkusím nápovědu.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    Said more simply
    Hi Grandpa! I am home now.
    NowAsk Mia one question about school.
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Ask Mia one question about school.
    Hi Grandpa! I am home from school.
    Said more simply
    Hi Grandpa! I am home now.
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

*I don't know how to ask in English, I'll tap More help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    What it means
    home from school: back at home after school
    NowAsk Mia one question about school.
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Ask Mia one question about school.
    Hi Grandpa! I am home from school.
    What it means
    home from school: back at home after school
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

*I don't know how to ask this in English, I'll try the phrase help.* → `quiz` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: School was good. I had maths and art.
    01
    Nice! What did you draw in art?
    02
    I like the garden very much.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Ask Mia one question about school.
    Hi Grandpa! I am home from school.
    Mia says: School was good. I had maths and art.
    [button: Nice! What did you draw in art?] [button: I like the garden very much.]
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

*Nevím, co říct... I don't understand well, I need the phrases.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: School was good. I had maths and art.
    01
    Nice! What did you draw in art?
    02
    I like the garden very much.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Ask Mia one question about school.
    Hi Grandpa! I am home from school.
    Mia says: School was good. I had maths and art.
    [button: Nice! What did you draw in art?] [button: I like the garden very much.]
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

*I don't know how to answer; I'll try the Option 1 about school, it sounds like a question.* → `pick-phrase` option=0 · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I am home from school.
    A little support
    Now use the idea in your own reply on the phone.
    NowAsk Mia one question about school.
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Ask Mia one question about school.
    Hi Grandpa! I am home from school.
    A little support
    Now use the idea in your own reply on the phone.
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

*Chci se zeptat Mii na školu, ale nevím jak; zkusím jednoduše.* → `answer` "Mia, school good?" · ok · 12s

**#8 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Art is fun. What do you like?
    Your turn
    Answer on your phone: speak or type.
    NowListen for her short answer.
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Art is fun. What do you like?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Art is fun. What do you like?"

*I don't understand what she said after "Art is fun"; I need help.* → `cue` · ok · 0s

**#9 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Art is fun. What do you like?
    What it means
    art: drawing and painting at school
    NowListen for her short answer.
    [button: More help] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Art is fun. What do you like?
    What it means
    art: drawing and painting at school
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Art is fun. What do you like?"

*Mia asks what I like; I don't know how to say it, I'll try the phrase help.* → `quiz` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: School was good. I had maths and art.
    01
    Nice! What did you draw in art?
    02
    I like the garden very much.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Art is fun. What do you like?
    Mia says: School was good. I had maths and art.
    [button: Nice! What did you draw in art?] [button: I like the garden very much.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Art is fun. What do you like?"

*Nerozumím všemu; I like garden, I can say that.* → `pick-phrase` option=1 · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: School was good. I had maths and art.
    01
    Nice! What did you draw in art?
    02
    I like the garden very much.
    A little support
    That phrase has a different purpose. Try the other option.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Art is fun. What do you like?
    A little support
    That phrase has a different purpose. Try the other option.
    Mia says: School was good. I had maths and art.
    [button: Nice! What did you draw in art?] [button: I like the garden very much.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Art is fun. What do you like?"

*She asks what I like; I know garden, so the second one fits.* → `pick-phrase` option=1 · ok · 0s

**#12 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: School was good. I had maths and art.
    01
    Nice! What did you draw in art?
    02
    I like the garden very much.
    A little support
    That phrase has a different purpose. Try the other option.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Art is fun. What do you like?
    A little support
    That phrase has a different purpose. Try the other option.
    Mia says: School was good. I had maths and art.
    [button: Nice! What did you draw in art?] [button: I like the garden very much.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Art is fun. What do you like?"

*I understand a little; I will try my own simple words about art.* → `answer` "Art good. Mia, you draw garden?" · ok · 13s

**#13 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Nice! Do you like art?
    Your turn
    Answer on your phone: speak or type.
    NowListen for her short answer.
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Nice! Do you like art?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    You · spoken
    Art good. Mia, you draw garden?
    Mia · granddaughter, age 9
    Nice! Do you like art?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice! Do you like art?"

*Mia asks if I like art; I can say a simple answer, I love drawing with grandchildren.* → `answer` "Yes, I like art. I love you, Mia." · ok · 9s

**#14 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    I love you too! Is your garden big?
    Your turn
    Answer on your phone: speak or type.
    NowListen for her short answer.
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    I love you too! Is your garden big?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    You · spoken
    Art good. Mia, you draw garden?
    Mia · granddaughter, age 9
    Nice! Do you like art?
    You · spoken
    Yes, I like art. I love you, Mia.
    Mia · granddaughter, age 9
    I love you too! Is your garden big?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I love you too! Is your garden big?"

*I understand "garden" and "big" — I can answer this simply.* → `answer` "Yes, garden big. I have tomatoes." · ok · 10s

**#15 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Tomatoes! Are they red?
    Your turn
    Answer on your phone: speak or type.
    NowListen for her short answer.
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Tomatoes! Are they red?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    You · spoken
    Art good. Mia, you draw garden?
    Mia · granddaughter, age 9
    Nice! Do you like art?
    You · spoken
    Yes, I like art. I love you, Mia.
    Mia · granddaughter, age 9
    I love you too! Is your garden big?
    You · spoken
    Yes, garden big. I have tomatoes.
    Mia · granddaughter, age 9
    Tomatoes! Are they red?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Tomatoes! Are they red?"

*Red tomatoes, I know this: yes, red.* → `answer` "Yes, tomatoes red. I love tomatoes." · ok · 12s

**#16 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said Yes, tomatoes red.
    Your line
    A sentence like this needs a verb, here 'are', before 'red'.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “Yes, tomatoes red.”
    Say it again, your way.
    A sentence like this needs a verb, here 'are', before 'red'.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I don't know how to fix it, so I'll ask Linga to show me.* → `show-me` · ok · 0s

**#17 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said Yes, tomatoes red.
    Try
    Yes, tomatoes are red.
    A sentence like this needs a verb, here 'are', before 'red'.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “Yes, tomatoes red.”
    Try “Yes, tomatoes are red.”
    A sentence like this needs a verb, here 'are', before 'red'.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Ah, I forgot 'are'. I will say it again.* → `answer` "Yes, tomatoes are red." · ok · 0s

**#18 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said Yes, tomatoes red.
    Your try
    Yes, tomatoes are red.
    A sentence like this needs a verb, here 'are', before 'red'.
    You fixed “tomatoes are red”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    You fixed “tomatoes are red”
    You said “Yes, tomatoes red.”
    Your try: “Yes, tomatoes are red.”
    A sentence like this needs a verb, here 'are', before 'red'.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Good, I fixed it; now back to the conversation.* → `back` · ok · 6s

**#19 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Nice! Which tomatoes are red, big or small?
    Your turn
    Answer on your phone: speak or type.
    NowListen for her short answer.
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask Mia one short question about school and listen to her answer.
    Now: Listen for her short answer.
    Nice! Which tomatoes are red, big or small?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I am home from school.
    You · spoken
    Mia, school good?
    Mia · granddaughter, age 9
    Art is fun. What do you like?
    You · spoken
    Art good. Mia, you draw garden?
    Mia · granddaughter, age 9
    Nice! Do you like art?
    You · spoken
    Yes, I like art. I love you, Mia.
    Mia · granddaughter, age 9
    I love you too! Is your garden big?
    You · spoken
    Yes, garden big. I have tomatoes.
    Mia · granddaughter, age 9
    Tomatoes! Are they red?
    You · spoken
    Yes, tomatoes red. I love tomatoes.
    Mia · granddaughter, age 9
    Me too! Do you eat them?
    Mia · granddaughter, age 9
    Nice! Which tomatoes are red, big or small?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice! Which tomatoes are red, big or small?"

*I managed some talking with Mia; I feel good and want to finish.* → `finish` · ok · 0s

**#20 linga-recap**

    TV
    Linga
    Viktor
    A way into English
    Your rehearsal
    You said Yes, tomatoes red.
    Try
    Yes, tomatoes are red.
    A sentence like this needs a verb, here 'are', before 'red'.
    Your mission
    Choose a fresh context for your next conversation.
    5 spoken · 0 written replies · 3 on your own · 2 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Nice! What did you draw in art?”
    From this rehearsal
    “Yes, tomatoes red.” → “Yes, tomatoes are red.”
    A sentence like this needs a verb, here 'are', before 'red'.
    Saved for the end
    “school good?” → “Is school good?”
    A question needs a verb, like 'is', at the start.
    “you draw garden?” → “do you draw in the garden?”
    Adds 'do' and 'in the' so the question is clear.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    Tell about my garden
    Describe your garden and say what grows there, in simple words.
    [button: Start talking]
    Or choose a situation [list: Ask about school [plan-bcf33eb9] | Tell about my garden [plan-62a2f482] | Say hello and take a turn [plan-a2323f5d] | Ask them to say it again [plan-0c72572c] | Plan the next call [plan-84f99615] | Tell them about my week [plan-45741b7b] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*I managed to talk about tomatoes and got help; I am content for now.* → `done` · observed (not acted on) · 0s

</details>
