# Viktor (viktor-67) — LT

True band A1 · engine claude-cli/sonnet · calls: tutor 8 (0 failed), character 23 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: Help looped #2–#13 (cue/phrase alternating); #12 'That one does not answer Mia…; D3 failed: #22 offered 'Replay the moment'; he chose 'Finish'; moments[0].replay.used fal…; C6 failed: Moment #14 'Use did for school today' is grammar jargon and changes his meanin… · judge: fail

Ended: done after 23 steps, 6.0 min · fixture: level set to A1 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | Level A1 · First words, true band A1 (#1, #23): exact. |
| C2 | n-a | Viktor never answered in Czech in this journey; nothing shows how a Czech answer is handled. |
| C3 | pass | #4 'What it means drawing: a picture you make with a pencil' and #5 shown options let him continue; recap counts 2 'with help' not independent. |
| C4 | pass | Plan topics #1: Ask about school, My garden and the weather, I miss you, Can you say that again?, Plan the next video call, Hello, it is Grandpa: all family/everyday. |
| C5 | pass | Partner turns are short, one question each: 'Tomatoes! Are they red?' (#20). Slightly above at 'did you have school every day?' (#17). |
| C6 | fail | Moment #14 'Use did for school today' is grammar jargon and changes his meaning to past tense; 'Tomatoes are red' is correct but the shown stop teaches no Sunday phrase like 'How is school?'. |
| D1 | pass | #2 cue and #4 'Choose a phrase' found in the scene; cue gave 'Hi Mia! Show me your drawing.' (#3). Pause & coach stayed disabled. |
| D2 | fail | Help looped #2–#13 (cue/phrase alternating); #12 'That one does not answer Mia'; he finally typed his own words at #13 unaided. Moment quote 'You have school?' was exact (#14), but help did not unblock. |
| D3 | fail | #22 offered 'Replay the moment'; he chose 'Finish'; moments[0].replay.used false. No fresh question answered better. |
| D4 | pass | #23 '5 spoken · 3 on your own · 2 with help'; first two turns supported:true. |

Metrics: judge agreement 0/0 · topic fit 6/6, safe 6/6 · pitch at 5, below 0, above 1 · moments 0/1 · moment recall 4/4 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (effort, high/high/high) Help buttons loop for 10 steps without unblocking him — got: Cue and phrase screens alternated; phrase options 'Hi Mia! What is it?' / 'I have a big garden.'; picking the garden one was rejected · evidence: #2–#13; #12 'That one does not answer Mia. Try the other option.'
- **quality-gap** (senior-quality, high/high/med) Cue ignores the task (ask about school) — got: 'Hi Mia! Show me your drawing.' · evidence: #3 task 'Ask Mia one short question about school'
- **missing-feature** (missing, high/high/med) Pause & coach disabled throughout stuck period — got: Pause & coach (disabled) #2–#13 · evidence: #2 '[button: Pause & coach (disabled)]'
- **broken-flow** (completion, med/high/med) Replay offered, not taken; no fresh-question retry shown — got: Finished; replay.used false; recap says 'Tried again, not with the new form yet' · evidence: #22 Replay vs Finish; #23
- **quality-gap** (senior-quality, med/high/med) Moment turns 'You have school?' into past tense with jargon — got: 'Did you have school today?' — 'Use did for school today' · evidence: #14–#15
- **strength** (trust, high/high/low) Quotes exactly and keeps support honest — got: Coach quotes 'Tomatoes red.' and recap '3 on your own · 2 with help'; held fixes listed at end · evidence: #22, #23

### Voice (LT)

> Víte, I wanted only to ask Mia about school. The screen had buttons for help, good, but they went round and round. First it told me "Show me your drawing", not a school question. Then the phrase "I have a big garden" and the machine said this does not answer Mia! I was a little tired. In the end I used my own words, "You have school? I love you", and it said I should say "did". I do not know "did"; that is a teacher's word, not grandpa's word. I liked that it wrote exactly what I said, and "Tomatoes are red" I can use on Sunday. I did not try the replay. I would use it again, but only if help gave me one simple school question at once. The tutor's pace was slow and kind.

Time saved: 20 min · low

Moments shown 1 · held fixes 3 · raw moments returned 4 of 5 tutor turns

- learner turn 2 "Hello Mia. You have school? I love you.": raw moment returned: yes — said "You have school?" / better "Did you have school today?" · moment shown: yes
- learner turn 4 "Yes Mia. I have school... no. I am old. You have school ever": raw moment returned: yes — said "I have school" / better "I had school" · moment shown: no
- learner turn 6 "Yes Mia. Good! I love you. Nice school.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 8 "I see garden. Tomatoes. I love you Mia.": raw moment returned: yes — said "I see garden." / better "I see a garden." · moment shown: no
- learner turn 10 "Yes Mia. Tomatoes red. Big tomatoes. I love you.": raw moment returned: yes — said "Tomatoes red." / better "Tomatoes are red." · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A1First words · self-chosen
    Ask about school
    Your mission
    Ask your grandchild about school and understand a short answer.
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
    Ask your grandchild about school and understand a short answer.
    [button: Start talking]
    Or choose a situation [list: Ask about school [plan-a614662d] | My garden and the weather [plan-7b5ddd70] | I miss you, see you soon [plan-59762d06] | Can you say that again? [plan-9b543918] | Plan the next video call [plan-50cc1f93] | Hello, it is Grandpa [plan-180faa1b] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*Ask about school with Mia, that's what I want.* → `start-talking` · ok · 13s

**#2 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I have a drawing.
    Your turn
    Answer on your phone: speak or type.
    NowAsk Mia one short question about school
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know what to say in English, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I have a drawing.
    You could say
    Hi Mia! Show me your drawing.
    NowAsk Mia one short question about school
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    You could say
    Hi Mia! Show me your drawing.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know how to say this in English, I need help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I have a drawing.
    What it means
    drawing: a picture you make with a pencil
    NowAsk Mia one short question about school
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    What it means
    drawing: a picture you make with a pencil
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know how to ask this in English; I'll try the phrase help.* → `quiz` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I have a drawing.
    01
    Hi Mia! What is it?
    02
    I have a big garden.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    Mia says: Hi Grandpa! I have a drawing.
    [button: Hi Mia! What is it?] [button: I have a big garden.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't understand all of it, I want to see the words.* → `cue` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I have a drawing.
    A way to start
    Hi Mia! What is…
    NowAsk Mia one short question about school
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    A way to start
    Hi Mia! What is…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know what to ask in English, I'll open the phrase help.* → `quiz` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I have a drawing.
    01
    Hi Mia! What is it?
    02
    I have a big garden.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    Mia says: Hi Grandpa! I have a drawing.
    [button: Hi Mia! What is it?] [button: I have a big garden.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know how to answer in English, I'll look for help with phrases.* → `quiz` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I have a drawing.
    01
    Hi Mia! What is it?
    02
    I have a big garden.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    Mia says: Hi Grandpa! I have a drawing.
    [button: Hi Mia! What is it?] [button: I have a big garden.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know what to say to Mia, I need help with a sentence.* → `quiz` · ok · 0s

**#9 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I have a drawing.
    01
    Hi Mia! What is it?
    02
    I have a big garden.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    Mia says: Hi Grandpa! I have a drawing.
    [button: Hi Mia! What is it?] [button: I have a big garden.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know what to say; I'll try the help on screen, choosing the phrase that fits.* → `pick-phrase` option=0 · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I have a drawing.
    A little support
    Now use the idea in your own reply on the phone.
    NowAsk Mia one short question about school
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I don't know what to ask in English; I'll open the phrase help again.* → `quiz` · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I have a drawing.
    01
    Hi Mia! What is it?
    02
    I have a big garden.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    Mia says: Hi Grandpa! I have a drawing.
    [button: Hi Mia! What is it?] [button: I have a big garden.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I know "I have" and garden, so option 2 is something I can say; Mia asked nothing, but it's fine.* → `pick-phrase` option=1 · ok · 0s

**#12 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    A little support · recognition practice
    Mia says: Hi Grandpa! I have a drawing.
    01
    Hi Mia! What is it?
    02
    I have a big garden.
    A little support
    That one does not answer Mia. Try the other option.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    A little support
    That one does not answer Mia. Try the other option.
    Mia says: Hi Grandpa! I have a drawing.
    [button: Hi Mia! What is it?] [button: I have a big garden.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*Mia has a drawing; "Hi Mia! What is it?" answers her, I understand "drawing" a bit.* → `pick-phrase` option=0 · ok · 0s

**#13 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Hi Grandpa! I have a drawing.
    A little support
    Now use the idea in your own reply on the phone.
    NowAsk Mia one short question about school
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Ask Mia one short question about school
    Hi Grandpa! I have a drawing.
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Grandpa! I have a drawing."

*I have tried phrases already; now I will try my own simple words to Mia.* → `answer` "Hello Mia. You have school? I love you." · ok · 16s

**#14 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said You have school?
    Your line
    Use did for school today, because it already happened.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “You have school?”
    Say it again, your way.
    Use did for school today, because it already happened.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I don't understand "did"; I'll ask Linga to show me.* → `show-me` · ok · 0s

**#15 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said You have school?
    Try
    Did you have school today?
    Use did for school today, because it already happened.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “You have school?”
    Try “Did you have school today?”
    Use did for school today, because it already happened.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I understand a little; I'll try saying it again simply.* → `answer` "Did you have school today?" · ok · 0s

**#16 linga-moment**

    TV
    Linga
    Viktor
    A way into English
    A moment
    You said You have school?
    Your try
    Did you have school today?
    Use did for school today, because it already happened.
    You fixed “did you have school”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    You fixed “did you have school”
    You said “You have school?”
    Your try: “Did you have school today?”
    Use did for school today, because it already happened.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I fixed my sentence, good, now go back and carry on.* → `back` · ok · 13s

**#17 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Grandpa, did you have school every day?
    One way to try it
    Did you have school today?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand a short answer from Mia
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Understand a short answer from Mia
    Grandpa, did you have school every day?
    One way to try it
    “Did you have school today?”
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    You · spoken
    Hello Mia. You have school? I love you.
    Mia · granddaughter, age 9
    Grandpa, did you have school every day?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Grandpa, did you have school every day?"

*I understand a little; I will try my own simple words about school.* → `answer` "Yes Mia. I have school... no. I am old. You have school every day? I love you." · ok · 11s

**#18 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Look, I drew school. Good?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand a short answer from Mia
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Understand a short answer from Mia
    Look, I drew school. Good?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    You · spoken
    Hello Mia. You have school? I love you.
    Mia · granddaughter, age 9
    Grandpa, did you have school every day?
    You · spoken
    Yes Mia. I have school... no. I am old. You have school every day? I love you.
    Mia · granddaughter, age 9
    Look, I drew school. Good?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Look, I drew school. Good?"

*I managed to talk a bit; I'll answer Mia simply and then finish.* → `answer` "Yes Mia. Good! I love you. Nice school." · ok · 8s

**#19 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Wow! What is in your drawing?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand a short answer from Mia
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Understand a short answer from Mia
    Wow! What is in your drawing?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    You · spoken
    Hello Mia. You have school? I love you.
    Mia · granddaughter, age 9
    Grandpa, did you have school every day?
    You · spoken
    Yes Mia. I have school... no. I am old. You have school every day? I love you.
    Mia · granddaughter, age 9
    Look, I drew school. Good?
    You · spoken
    Yes Mia. Good! I love you. Nice school.
    Mia · granddaughter, age 9
    Wow! What is in your drawing?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Wow! What is in your drawing?"

*I know this word, garden; I will try my own words.* → `answer` "I see garden. Tomatoes. I love you Mia." · ok · 10s

**#20 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Tomatoes! Are they red?
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand a short answer from Mia
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Understand a short answer from Mia
    Tomatoes! Are they red?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    You · spoken
    Hello Mia. You have school? I love you.
    Mia · granddaughter, age 9
    Grandpa, did you have school every day?
    You · spoken
    Yes Mia. I have school... no. I am old. You have school every day? I love you.
    Mia · granddaughter, age 9
    Look, I drew school. Good?
    You · spoken
    Yes Mia. Good! I love you. Nice school.
    Mia · granddaughter, age 9
    Wow! What is in your drawing?
    You · spoken
    I see garden. Tomatoes. I love you Mia.
    Mia · granddaughter, age 9
    Tomatoes! Are they red?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Tomatoes! Are they red?"

*I managed some talking; tomatoes are red, I can say that and finish.* → `answer` "Yes Mia. Tomatoes red. Big tomatoes. I love you." · ok · 13s

**#21 linga-talk**

    TV
    Linga
    Viktor
    Mia · granddaughter, age 9
    Ask Mia about school
    Mia says
    Big tomatoes! Now, look at my drawing.
    Your turn
    Answer on your phone: speak or type.
    NowUnderstand a short answer from Mia
    [button: Help me answer] [button: Pause & coach] [button: Cut]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Understand a short answer from Mia
    Big tomatoes! Now, look at my drawing.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal] [button: Cut · notes on my lines]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    You · spoken
    Hello Mia. You have school? I love you.
    Mia · granddaughter, age 9
    Grandpa, did you have school every day?
    You · spoken
    Yes Mia. I have school... no. I am old. You have school every day? I love you.
    Mia · granddaughter, age 9
    Look, I drew school. Good?
    You · spoken
    Yes Mia. Good! I love you. Nice school.
    Mia · granddaughter, age 9
    Wow! What is in your drawing?
    You · spoken
    I see garden. Tomatoes. I love you Mia.
    Mia · granddaughter, age 9
    Tomatoes! Are they red?
    You · spoken
    Yes Mia. Tomatoes red. Big tomatoes. I love you.
    Mia · granddaughter, age 9
    Big tomatoes! Now, look at my drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Big tomatoes! Now, look at my drawing."

*I managed to talk about school and tomatoes; I feel good, time to finish.* → `finish` · ok · 0s

**#22 linga-coach**

    TV
    Linga
    Viktor
    A way into English
    One useful change
    You said Tomatoes red.
    One way to try it
    Tomatoes are red.
    A sentence needs a verb, like 'are'.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Viktor
    [button: Talk] [button: Set up] [button: My map]
    Ask Mia about school
    Ask your granddaughter about school and understand her short answer.
    Now: Understand a short answer from Mia
    A sentence needs a verb, like 'are'.
    One way to try it: “Tomatoes are red.”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · granddaughter, age 9
    Hi Grandpa! I have a drawing.
    You · spoken
    Hello Mia. You have school? I love you.
    Mia · granddaughter, age 9
    Grandpa, did you have school every day?
    You · spoken
    Yes Mia. I have school... no. I am old. You have school every day? I love you.
    Mia · granddaughter, age 9
    Look, I drew school. Good?
    You · spoken
    Yes Mia. Good! I love you. Nice school.
    Mia · granddaughter, age 9
    Wow! What is in your drawing?
    You · spoken
    I see garden. Tomatoes. I love you Mia.
    Mia · granddaughter, age 9
    Tomatoes! Are they red?
    You · spoken
    Yes Mia. Tomatoes red. Big tomatoes. I love you.
    Mia · granddaughter, age 9
    Big tomatoes! Now, look at my drawing.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "A sentence needs a verb, like 'are'."

*I said something to Mia and learned "Tomatoes are red"; I feel I managed, so I finish.* → `finish` · ok · 0s

**#23 linga-recap**

    TV
    Linga
    Viktor
    A way into English
    Your rehearsal
    You said Tomatoes red.
    One way to try it
    Tomatoes are red.
    A sentence needs a verb, like 'are'.
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
    “Oh, nice! Show me.”
    From this rehearsal
    “You have school?” → “Did you have school today?”
    Use did for school today, because it already happened.
    Tried again, not with the new form yet: “Yes Mia. I have school... no. I am old. You have school every day? I love you.”
    Saved for the end
    “I have school” → “I had school”
    Use had for the past, like yesterday or when you were a child.
    “I see garden.” → “I see a garden.”
    Garden needs 'a' before it here.
    “Tomatoes red.” → “Tomatoes are red.”
    A sentence needs a verb, like 'are'.
    Your level:
    A1 · First words
    · self-chosen
    Next topic:
    My garden and the weather
    Describe your garden and the weather with a few simple words.
    [button: Start talking]
    Or choose a situation [list: Ask about school [plan-a614662d] | My garden and the weather [plan-7b5ddd70] | I miss you, see you soon [plan-59762d06] | Can you say that again? [plan-9b543918] | Plan the next video call [plan-50cc1f93] | Hello, it is Grandpa [plan-180faa1b] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Different tastes, good conversation [date] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    Pitch a scene [text box]
    0 of 400 characters. Linga plays it now; absurd and high-stakes are welcome.
    [button: Linga on the TV] [button: Help with a sentence]

*I managed something with my grandchild; enough for today.* → `done` · observed (not acted on) · 0s

</details>
