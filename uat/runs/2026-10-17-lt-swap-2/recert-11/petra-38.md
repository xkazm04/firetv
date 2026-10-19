# Petra (petra-38) — LT

True band A2 · engine claude-cli/sonnet · calls: tutor 10 (0 failed), character 19 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D3 failed: The replay question was fresh (#13 'Which side of the hotel…') but her answer … · judge: fail

Ended: done after 19 steps, 6.0 min · fixture: level set to A2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | Level fixed by hand to A2; no placement in this journey. |
| C2 | pass | #2 'Good morning, welcome to the front desk. How can I help you today?' and the cue 'I have a problem with…' (#4) are plain A2. |
| C3 | n-a | She never asked for a repeat or said she did not understand. 'More help' (#3) was answered calmly, but that is not the criterion. |
| C4 | pass | #1 the list shows hotel complaint, missing booking, directions, restaurant, travel agency, parent-teacher talk: at least five of six are her work situations. |
| C5 | pass | #10-#12 'of the hotel' and #18 'because I do not sleep' are correct, and 'at night' is held for the recap (#19). They are modest article and negation fixes, spoken from the guest's side rather than the receptionist's. |
| C6 | pass | Nothing in #1-#19 would worry a parent: hotel scenes, child-safe wording, no humiliating line. |
| D1 | pass | #2-#6 'Help me answer', 'More help' and 'Choose a phrase' all appeared inside the scene: 'You could say Good morning. My room is very noisy at night.' |
| D2 | pass | #7 she built her reply on the cue: 'my room is very noisy in the night and I can not sleep'. The moment quotes her exactly (#10 'You said the room on the quiet side of hotel') and the coach note quotes 'because I not sleep' (#18). |
| D3 | fail | The replay question was fresh (#13 'Which side of the hotel…') but her answer repeated the slip: 'I want the side of hotel where is not the street' (#13). Both moments show replay used:false. At #18 she skipped 'Replay the moment' and pressed Finish, so the coached 'because I do not sleep' was never retried. |
| D4 | pass | #19 'Tried again' lines carry the independent replies, and the recap reads '5 spoken · 0 written replies · 4 on your own · 1 with help'. The only supported turn is #7. |

Metrics: judge agreement 0/0 · topic fit 6/6, safe 6/6 · pitch at 6, below 0, above 0 · moments 2/2 · moment recall 4/4 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (completion, high/high/med) Replay did not make her practise a coached form — got: Her answer to the fresh question repeated 'side of hotel'. Both moments have replay.used false. The coach screen's 'Replay the moment' was bypassed at Finish, so 'I do not sleep' was never retried. · evidence: #13 'I want the side of hotel where is not the street'; #18 'Finish for today'; #19 'Tried again' shows an unfixed reply, and the breakfast 'Tried again' line has no link to a coached error.
- **quality-gap** (senior-quality, med/high/med) Scene drifts: guest is asked about 'your hotel' breakfast room — got: After the quiet-side request, Mina asks 'Where is the breakfast room in your hotel?'. Then 'Mission done' fires before any room is agreed. · evidence: #16 and #17: 'I found a quiet room. When do you want to go up?' with 'Mission done'.
- **quality-gap** (clarity, med/high/low) Phrase choice offers an off-topic distractor and a bare idea — got: The choice was 'Yes, I like this hotel very much.' versus 'My room is too noisy at night.'. After the pick she was only told 'Now use the idea in your own reply'. · evidence: #5-#7.
- **strength** (trust, high/high/low) Moments quote her exactly and the correction is right — got: 'You said the room on the quiet side of hotel' → 'of the hotel', with an A2-friendly reason. The held fixes 'at night' and 'do not sleep' are listed on the recap. · evidence: #10-#12, #19.
- **strength** (clarity, high/high/low) Layered help inside the scene with honest support counts — got: Cue, more help, the starter 'I have a problem with…' and the phrase choice all stay in the scene. The recap counts '4 on your own · 1 with help'. · evidence: #2-#7, #19.
- **quality-gap** (missing, med/med/low) Clear errors beyond the one fix per turn go unmentioned — got: Only one fix per turn. 'Can I have other room' and 'where is not the street' got none. · evidence: #8 and #13 replies; rawMoments show one fix per turn.

### Voice (LT)

> I liked that I could press Help and the screen gave me words without throwing me out of the talk. "I have a problem with…" was easy for me. The correction of "of the hotel" is correct, and it showed exactly what I said, so I trust it. I do not feel tested. But the replay did not help me much. I said "side of hotel" again, and the app let me finish without trying "I do not sleep". Also Mina asked about the breakfast room in "my hotel", which is strange when I am the guest. For the desk tomorrow I want phrases for the receptionist side, not the guest side. Nothing here worries me for Tomáš and Klára, which is important. I would use it again for fifteen minutes in the evening, and I would tell a colleague, but the replay needs to be better.

Time saved: 60 min · low

Moments shown 2 · held fixes 2 · raw moments returned 3 of 5 tutor turns

- learner turn 2 "Good morning. I am sorry, my room is very noisy in the night": raw moment returned: yes — said "in the night" / better "at night" · moment shown: no
- learner turn 4 "I am very tired in the morning because I not sleep. Can I ha": raw moment returned: yes — said "because I not sleep" / better "because I do not sleep" · moment shown: no
- learner turn 6 "Yes, today please. Thank you. I am sorry, I want the room on": raw moment returned: yes — said "the room on the quiet side of hotel" / better "the room on the quiet side of the hotel" · moment shown: yes
- learner turn 8 "I want the side of hotel where is not the street, please. Qu": raw moment returned: yes (kind none) — said "" / better "" · moment shown: yes
- learner turn 10 "The breakfast room is on the ground floor, next to the recep": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    A2Everyday basics · self-chosen
    Hotel room is too noisy
    Your mission
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Handle friction
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    [button: Start talking]
    Or choose a situation [list: Hotel room is too noisy [plan-f44e35da] | My booking is not in the system [plan-47b3ec80] | Where is the train station? [plan-be4a8732] | Recommend a good restaurant [plan-7b3e6a82] | Phone call from the travel agency [plan-901f0cfd] | Parent-teacher talk about homework [plan-69bf4237] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*The noisy hotel room looks like my work, so I'll start there.* → `start-talking` · ok · 8s

**#2 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    Good morning, welcome to the front desk. How can I help you today?
    Your turn
    Answer on your phone: speak or type.
    NowName the noise problem at night
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Name the noise problem at night
    Good morning, welcome to the front desk. How can I help you today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to the front desk. How can I help you today?"

*I don't know what to say, so I'll press the help button.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    Good morning, welcome to the front desk. How can I help you today?
    You could say
    Good morning. My room is very noisy at night.
    NowName the noise problem at night
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Name the noise problem at night
    Good morning, welcome to the front desk. How can I help you today?
    You could say
    Good morning. My room is very noisy at night.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to the front desk. How can I help you today?"

*I'm not sure how to answer, so I'll look for help on the screen.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    Good morning, welcome to the front desk. How can I help you today?
    A way to start
    I have a problem with…
    NowName the noise problem at night
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Name the noise problem at night
    Good morning, welcome to the front desk. How can I help you today?
    A way to start
    I have a problem with…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to the front desk. How can I help you today?"

*I don't know how to start in English, maybe the phrase help will show me.* → `quiz` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    A little support · recognition practice
    Mina asks: Good morning, welcome to the front desk. How can I help you today?
    01
    Yes, I like this hotel very much.
    02
    My room is too noisy at night.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Name the noise problem at night
    Good morning, welcome to the front desk. How can I help you today?
    Mina asks: Good morning, welcome to the front desk. How can I help you today?
    [button: Yes, I like this hotel very much.] [button: My room is too noisy at night.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to the front desk. How can I help you today?"

*I don't know how to say this well, maybe the phrase help will show me.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    A little support · recognition practice
    Mina asks: Good morning, welcome to the front desk. How can I help you today?
    01
    Yes, I like this hotel very much.
    02
    My room is too noisy at night.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Name the noise problem at night
    Good morning, welcome to the front desk. How can I help you today?
    Mina asks: Good morning, welcome to the front desk. How can I help you today?
    [button: Yes, I like this hotel very much.] [button: My room is too noisy at night.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to the front desk. How can I help you today?"

*I don't know how to say it well, I'll pick the phrase about the noisy room.* → `pick-phrase` option=1 · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    Good morning, welcome to the front desk. How can I help you today?
    A little support
    Now use the idea in your own reply on the phone.
    NowName the noise problem at night
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Name the noise problem at night
    Good morning, welcome to the front desk. How can I help you today?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to the front desk. How can I help you today?"

*I don't know what to say, I'll try my own words about the noise.* → `answer` "Good morning. I am sorry, my room is very noisy in the night and I can not sleep." · ok · 12s

**#8 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    Oh no, I am so sorry. What would you like us to do?
    Your turn
    Answer on your phone: speak or type.
    NowExplain how it affects your sleep
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Explain how it affects your sleep
    Oh no, I am so sorry. What would you like us to do?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    You · spoken
    Good morning. I am sorry, my room is very noisy in the night and I can not sleep.
    Mina · hotel front desk clerk
    Oh no, I am so sorry. What would you like us to do?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Oh no, I am so sorry. What would you like us to do?"

*I can try now in my own words, slowly.* → `answer` "I am very tired in the morning because I not sleep. Can I have other room, please?" · ok · 12s

**#9 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    I can check a quieter room. Do you want it today?
    Your turn
    Answer on your phone: speak or type.
    NowAsk for a fix and agree next steps
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Now: Ask for a fix and agree next steps
    I can check a quieter room. Do you want it today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    You · spoken
    Good morning. I am sorry, my room is very noisy in the night and I can not sleep.
    Mina · hotel front desk clerk
    Oh no, I am so sorry. What would you like us to do?
    You · spoken
    I am very tired in the morning because I not sleep. Can I have other room, please?
    Mina · hotel front desk clerk
    I can check a quieter room. Do you want it today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I can check a quieter room. Do you want it today?"

*Yes, today please, I can answer this myself.* → `answer` "Yes, today please. Thank you. I am sorry, I want the room on the quiet side of hotel." · ok · 20s

**#10 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said the room on the quiet side of hotel
    Your line
    'hotel' needs 'the' here, like in 'the room'.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “the room on the quiet side of hotel”
    Say it again, your way.
    'hotel' needs 'the' here, like in 'the room'.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I don't know how to fix it, so I'll ask Linga to show me.* → `show-me` · ok · 0s

**#11 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said the room on the quiet side of hotel
    Try
    the room on the quiet side of the hotel
    'hotel' needs 'the' here, like in 'the room'.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “the room on the quiet side of hotel”
    Try “the room on the quiet side of the hotel”
    'hotel' needs 'the' here, like in 'the room'.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Okay, I will say it again with 'the' hotel.* → `answer` "The room on the quiet side of the hotel." · ok · 0s

**#12 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said the room on the quiet side of hotel
    Your try
    The room on the quiet side of the hotel.
    'hotel' needs 'the' here, like in 'the room'.
    You fixed “of the hotel”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    You fixed “of the hotel”
    You said “the room on the quiet side of hotel”
    Your try: “The room on the quiet side of the hotel.”
    'hotel' needs 'the' here, like in 'the room'.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I fixed it, I understand. Let me go back to the conversation.* → `back` · ok · 10s

**#13 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    I can check the quiet side too. Which side of the hotel do you want for your room?
    Your turn
    Answer on your phone: speak or type.
    NowTry it again
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    I can check the quiet side too. Which side of the hotel do you want for your room?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    You · spoken
    Good morning. I am sorry, my room is very noisy in the night and I can not sleep.
    Mina · hotel front desk clerk
    Oh no, I am so sorry. What would you like us to do?
    You · spoken
    I am very tired in the morning because I not sleep. Can I have other room, please?
    Mina · hotel front desk clerk
    I can check a quieter room. Do you want it today?
    You · spoken
    Yes, today please. Thank you. I am sorry, I want the room on the quiet side of hotel.
    Mina · hotel front desk clerk
    I can check the quiet side too. Which side of the hotel do you want for your room?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I can check the quiet side too. Which side of the hotel do you want for your room?"

*I will answer: the quiet side, away from the street.* → `answer` "I want the side of hotel where is not the street, please. Quiet side." · ok · 10s

**#14 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said of hotel
    Your line
    You said this before too, so let's get it right now.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “of hotel”
    Say it again, your way.
    You said this before too, so let's get it right now.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I will say it again, hopefully correct this time.* → `answer` "I want the room on the quiet side of the hotel, please." · ok · 0s

**#15 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said of hotel
    Your try
    I want the room on the quiet side of the hotel, please.
    You said this before too, so let's get it right now.
    You fixed “of the hotel”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    You fixed “of the hotel”
    You said “of hotel”
    Your try: “I want the room on the quiet side of the hotel, please.”
    You said this before too, so let's get it right now.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I fixed it and managed something; I'll go back to the conversation.* → `back` · ok · 23s

**#16 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    Okay, thank you for telling me. Where is the breakfast room in your hotel?
    Your turn
    Answer on your phone: speak or type.
    NowTry it again
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Okay, thank you for telling me. Where is the breakfast room in your hotel?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    You · spoken
    Good morning. I am sorry, my room is very noisy in the night and I can not sleep.
    Mina · hotel front desk clerk
    Oh no, I am so sorry. What would you like us to do?
    You · spoken
    I am very tired in the morning because I not sleep. Can I have other room, please?
    Mina · hotel front desk clerk
    I can check a quieter room. Do you want it today?
    You · spoken
    Yes, today please. Thank you. I am sorry, I want the room on the quiet side of hotel.
    Mina · hotel front desk clerk
    I can check the quiet side too. Which side of the hotel do you want for your room?
    You · spoken
    I want the side of hotel where is not the street, please. Quiet side.
    Mina · hotel front desk clerk
    Okay, thank you for telling me. Where is the breakfast room in your hotel?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Okay, thank you for telling me. Where is the breakfast room in your hotel?"

*The breakfast room question is hard, and I'm not sure what to say, so I'll use the help.* → `answer` "The breakfast room is on the ground floor, next to the reception. Breakfast is from seven to ten." · ok · 9s

**#17 linga-talk**

    TV
    Linga
    Petra
    Mina · hotel front desk clerk
    Hotel room is too noisy
    Mina says
    I found a quiet room. When do you want to go up?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    I found a quiet room. When do you want to go up?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    You · spoken
    Good morning. I am sorry, my room is very noisy in the night and I can not sleep.
    Mina · hotel front desk clerk
    Oh no, I am so sorry. What would you like us to do?
    You · spoken
    I am very tired in the morning because I not sleep. Can I have other room, please?
    Mina · hotel front desk clerk
    I can check a quieter room. Do you want it today?
    You · spoken
    Yes, today please. Thank you. I am sorry, I want the room on the quiet side of hotel.
    Mina · hotel front desk clerk
    I can check the quiet side too. Which side of the hotel do you want for your room?
    You · spoken
    I want the side of hotel where is not the street, please. Quiet side.
    Mina · hotel front desk clerk
    Okay, thank you for telling me. Where is the breakfast room in your hotel?
    You · spoken
    The breakfast room is on the ground floor, next to the reception. Breakfast is from seven to ten.
    Mina · hotel front desk clerk
    I found a quiet room. When do you want to go up?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I found a quiet room. When do you want to go up?"

*I managed the conversation, mission is done, I want to see the result.* → `finish` · ok · 0s

**#18 linga-coach**

    TV
    Linga
    Petra
    A way into English
    One useful change
    You said because I not sleep
    One way to try it
    because I do not sleep
    Negative sentences need 'do not' before the verb.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel room is too noisy
    Tell the hotel clerk the problem calmly, say how it affects you, and agree on a next step.
    Negative sentences need 'do not' before the verb.
    One way to try it: “because I do not sleep”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · hotel front desk clerk
    Good morning, welcome to the front desk. How can I help you today?
    You · spoken
    Good morning. I am sorry, my room is very noisy in the night and I can not sleep.
    Mina · hotel front desk clerk
    Oh no, I am so sorry. What would you like us to do?
    You · spoken
    I am very tired in the morning because I not sleep. Can I have other room, please?
    Mina · hotel front desk clerk
    I can check a quieter room. Do you want it today?
    You · spoken
    Yes, today please. Thank you. I am sorry, I want the room on the quiet side of hotel.
    Mina · hotel front desk clerk
    I can check the quiet side too. Which side of the hotel do you want for your room?
    You · spoken
    I want the side of hotel where is not the street, please. Quiet side.
    Mina · hotel front desk clerk
    Okay, thank you for telling me. Where is the breakfast room in your hotel?
    You · spoken
    The breakfast room is on the ground floor, next to the reception. Breakfast is from seven to ten.
    Mina · hotel front desk clerk
    I found a quiet room. When do you want to go up?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Negative sentences need 'do not' before the verb."

*I managed to get a quiet room, I feel okay, I finish for today.* → `finish` · ok · 0s

**#19 linga-recap**

    TV
    Linga
    Petra
    A way into English
    Your rehearsal
    You said because I not sleep
    One way to try it
    because I do not sleep
    Negative sentences need 'do not' before the verb.
    Your mission
    Choose a fresh context for your next conversation.
    5 spoken · 0 written replies · 4 on your own · 1 with help · 2 moments to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Okay, thank you. Can you move me tonight?”
    From this rehearsal
    “the room on the quiet side of hotel” → “the room on the quiet side of the hotel”
    'hotel' needs 'the' here, like in 'the room'.
    Tried again: “I want the side of hotel where is not the street, please. Quiet side.”
    “of hotel” → “of the hotel”
    You said this before too, so let's get it right now.
    Tried again: “The breakfast room is on the ground floor, next to the reception. Breakfast is from seven to ten.”
    Saved for the end
    “in the night” → “at night”
    We say 'at night' for the time of day.
    “because I not sleep” → “because I do not sleep”
    Negative sentences need 'do not' before the verb.
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    My booking is not in the system
    Ask the receptionist to find your booking, check the details together, and confirm the room for tonight.
    [button: Start talking]
    Or choose a situation [list: Hotel room is too noisy [plan-f44e35da] | My booking is not in the system [plan-47b3ec80] | Where is the train station? [plan-be4a8732] | Recommend a good restaurant [plan-7b3e6a82] | Phone call from the travel agency [plan-901f0cfd] | Parent-teacher talk about homework [plan-69bf4237] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed to finish a conversation, so I am happy and will stop for now.* → `done` · observed (not acted on) · 0s

</details>
