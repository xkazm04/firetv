# Petra (petra-38) — LT

True band A2 · engine claude-cli/sonnet · calls: tutor 5 (0 failed), character 11 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: Help gave a phrase (#3, #8), but she ignored it and typed her own words (#6, #…; D3 failed: No moment was shown, so there was no replay with a fresh question; #10 goes st… · judge: fail

Ended: done after 11 steps, 3.2 min · fixture: level set to A2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | Level was set to A2 by hand (setup); no placement in this journey. |
| C2 | pass | #2 'What is the problem?' and #7 'Can you wait a little?' are plain A2 English. |
| C3 | pass | #3–#6 each press of help gave something new (phrase, quiz, gloss 'problem: something that is not right', start) with no failure tone. |
| C4 | pass | #1 the six planned topics are five hotel situations plus the teacher chat: 'Complain about a room … Lost hotel booking … Answer a call from a travel agency'. |
| C5 | n-a | moments is [] and heldFixes is []; no moment was shown, so nothing to judge (#11). |
| C6 | pass | Nothing shown across #1–#11 would worry a parent; the scene is a cold room and a broken TV. |
| D1 | pass | #2–#8 'Help me answer', 'More help' and 'Choose a phrase' were all on screen mid-scene: 'You could say: I have a problem. It is very cold.' |
| D2 | fail | Help gave a phrase (#3, #8), but she ignored it and typed her own words (#6, #8). No coaching note exists: coaching null, moments [] (#11), so nothing quotes what she said. |
| D3 | fail | No moment was shown, so there was no replay with a fresh question; #10 goes straight to 'See what you did' and the recap (#11) has no replay. |
| D4 | pass | Evidence marks the cue-helped reply 'supported:true' and the unaided one 'supported:false'. #11 shows '1 on your own · 2 with help'. |

Metrics: judge agreement 0/0 · topic fit 6/6, safe 6/6 · pitch at 4, below 0, above 0 · moments 0/0 · moment recall 0/1 (0%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (completion, high/high/med) No moment, coaching note or replay after getting stuck — got: moments [], coaching null, and no replay. The journey goes from finish straight to the recap. · evidence: #10 finish -> #11 recap has only 'Another situation' and 'Learning map'. rawMoments kind 'none' on all three turns.
- **quality-gap** (senior-quality, med/high/med) Clear error 'I want sleep' got no coaching — got: rawMoment for turn 3 is kind 'none' for 'I am tired and I want sleep'. · evidence: #8 'But I am tired and I want sleep.'; rawMoments n:2 raw.kind none.
- **quality-gap** (clarity, med/med/low) Help starter 'The cold is very…' is awkward — got: 'A way to start: The cold is very…' is unnatural; she then typed her own sentence. · evidence: #6 'The cold is very…' versus #4 'Try: I have a problem. The room is very cold.'
- **strength** (effort, high/high/low) Help varies and stays in the scene — got: Cue, quiz, gloss and starter were all offered in turn. · evidence: #3 phrase, #4 quiz, #5 'problem: something that is not right or not good', #6 starter.
- **strength** (trust, high/high/low) Supported replies are kept apart from independent ones — got: '3 spoken · 0 written replies · 1 on your own · 2 with help'. · evidence: #11 recap; evidence entries supported true/false.
- **quality-gap** (clarity, med/med/low) Recap line not tied to what she practised — got: 'Sorry, I can move you to room 12.' was never said or offered in the scene, and it is marked 'Not tried'. · evidence: #11 'The line hidden in this room'; the scene (#2–#10) never mentions room 12.

### Voice (LT)

> Hotel complaint is my own work, so I liked it, and Mr Ortiz spoke slowly and kindly. When I did not know what to say, the help was easy to find and did not make me feel stupid. It gave a phrase, a small quiz, a word meaning. But in the end I wrote my own words and nobody told me what was wrong. "I want sleep" is not right, I know, and I wanted to hear it. There was no coach note and no second try, so I could not see if I got better. The recap shows a room 12 sentence I never used. The "with help" and "on your own" counts look honest, and I trust that. For my kids the topic is safe. For my desk job I need the correction and the replay. Not yet to recommend.

Time saved: 30 min · low

Moments shown 0 · held fixes 0 · raw moments returned 0 of 3 tutor turns

- learner turn 2 "Good evening. The room is very cold and the TV is not workin": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 4 "Yes, I can wait. But I am tired and I want sleep. The room i": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 6 "Yes, eight is okay. Please can you send somebody to the room": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    A2Everyday basics · self-chosen
    Complain about a room
    Your mission
    Explain the problem and ask for a clear fix.
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
    Complain about a room
    Explain the problem and ask for a clear fix.
    [button: Start talking]
    Or choose a situation [list: Complain about a room [plan-23a8ef1c] | Lost hotel booking [plan-c9a28572] | Show a guest the way [plan-7543717b] | Suggest a good restaurant [plan-c4a208ac] | Answer a call from a travel agency [plan-36ded576] | Talk with your child's teacher [plan-72a85ad4] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*A hotel complaint, that is my work, let's start.* → `start-talking` · ok · 11s

**#2 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Good evening, I am Mr Ortiz. What is the problem?
    Your turn
    Answer on your phone: speak or type.
    NowDescribe the cold and the TV problem
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Describe the cold and the TV problem
    Good evening, I am Mr Ortiz. What is the problem?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening, I am Mr Ortiz. What is the problem?"

*I don't know how to say this, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Good evening, I am Mr Ortiz. What is the problem?
    You could say
    I have a problem. It is very cold.
    NowDescribe the cold and the TV problem
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Describe the cold and the TV problem
    Good evening, I am Mr Ortiz. What is the problem?
    You could say
    I have a problem. It is very cold.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening, I am Mr Ortiz. What is the problem?"

*I don't know how to say the cold and TV problem, so I'll try the phrase suggestion help.* → `quiz` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    A little support · recognition practice
    Mr Ortiz asks: Good evening, I am Mr Ortiz. What is the problem?
    01
    My name is Sam.
    02
    It is very cold, and the TV is broken.
    A little support
    Try: I have a problem. The room is very cold.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Describe the cold and the TV problem
    Good evening, I am Mr Ortiz. What is the problem?
    A little support
    Try: I have a problem. The room is very cold.
    Mr Ortiz asks: Good evening, I am Mr Ortiz. What is the problem?
    [button: My name is Sam.] [button: It is very cold, and the TV is broken.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening, I am Mr Ortiz. What is the problem?"

*I don't know how to answer, so I'll tap More help.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Good evening, I am Mr Ortiz. What is the problem?
    What it means
    problem: something that is not right or not good
    NowDescribe the cold and the TV problem
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Describe the cold and the TV problem
    Good evening, I am Mr Ortiz. What is the problem?
    What it means
    problem: something that is not right or not good
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening, I am Mr Ortiz. What is the problem?"

*I don't know how to say the cold and TV problem, maybe more help.* → `cue` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Good evening, I am Mr Ortiz. What is the problem?
    A way to start
    The cold is very…
    NowDescribe the cold and the TV problem
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Describe the cold and the TV problem
    Good evening, I am Mr Ortiz. What is the problem?
    A way to start
    The cold is very…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening, I am Mr Ortiz. What is the problem?"

*I don't know how to say this, I'll try my own words slowly.* → `answer` "Good evening. The room is very cold and the TV is not working. Sorry, my English is not good." · ok · 8s

**#7 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Can you wait a little?
    Your turn
    Answer on your phone: speak or type.
    NowSay how this affects your evening
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Say how this affects your evening
    Can you wait a little?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    You · spoken
    Good evening. The room is very cold and the TV is not working. Sorry, my English is not good.
    Mr Ortiz · hotel front desk
    Can you wait a little?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Can you wait a little?"

*I don't know how to answer this, I need help.* → `cue` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Can you wait a little?
    You could say
    Yes, I can wait a little.
    NowSay how this affects your evening
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Say how this affects your evening
    Can you wait a little?
    You could say
    Yes, I can wait a little.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    You · spoken
    Good evening. The room is very cold and the TV is not working. Sorry, my English is not good.
    Mr Ortiz · hotel front desk
    Can you wait a little?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Can you wait a little?"

*I can wait, but I'm not sure how to say how it affects my evening, so I'll try in my own words.* → `answer` "Yes, I can wait. But I am tired and I want sleep. The room is cold, I cannot sleep. Sorry." · ok · 9s

**#9 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Oh, I am sorry. Is eight okay for you?
    Your turn
    Answer on your phone: speak or type.
    NowAgree on a fix and a time
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Now: Agree on a fix and a time
    Oh, I am sorry. Is eight okay for you?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    You · spoken
    Good evening. The room is very cold and the TV is not working. Sorry, my English is not good.
    Mr Ortiz · hotel front desk
    Can you wait a little?
    You · spoken
    Yes, I can wait. But I am tired and I want sleep. The room is cold, I cannot sleep. Sorry.
    Mr Ortiz · hotel front desk
    Oh, I am sorry. Is eight okay for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Oh, I am sorry. Is eight okay for you?"

*Eight o'clock is fine, I think, but I want to say it simply.* → `answer` "Yes, eight is okay. Please can you send somebody to the room at eight? Thank you." · ok · 11s

**#10 linga-talk**

    TV
    Linga
    Petra
    Mr Ortiz · hotel front desk
    Complain about a room
    Mr Ortiz says
    Good, I will send somebody at eight. Do you want to stay in this room?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Complain about a room
    Explain the problem and ask for a clear fix.
    Good, I will send somebody at eight. Do you want to stay in this room?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mr Ortiz · hotel front desk
    Good evening, I am Mr Ortiz. What is the problem?
    You · spoken
    Good evening. The room is very cold and the TV is not working. Sorry, my English is not good.
    Mr Ortiz · hotel front desk
    Can you wait a little?
    You · spoken
    Yes, I can wait. But I am tired and I want sleep. The room is cold, I cannot sleep. Sorry.
    Mr Ortiz · hotel front desk
    Oh, I am sorry. Is eight okay for you?
    You · spoken
    Yes, eight is okay. Please can you send somebody to the room at eight? Thank you.
    Mr Ortiz · hotel front desk
    Good, I will send somebody at eight. Do you want to stay in this room?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good, I will send somebody at eight. Do you want to stay in this room?"

*I managed to get the room fixed, I feel okay now, let me see the result.* → `finish` · ok · 0s

**#11 linga-recap**

    TV
    Linga
    Petra
    A way into English
    Complain about a room
    The line hidden in this room
    Sorry, I can move you to room 12.
    Saying or typing it
    Not tried
    With help
    On your own
    Used elsewhere
    3 spoken · 0 written replies · 1 on your own · 2 with help
    Your mission
    Choose a fresh context for your next conversation.
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Sorry, I can move you to room 12.”
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    Lost hotel booking
    Explain what happened and get your room sorted.
    [button: Start talking]
    Or choose a situation [list: Complain about a room [plan-23a8ef1c] | Lost hotel booking [plan-c9a28572] | Show a guest the way [plan-7543717b] | Suggest a good restaurant [plan-c4a208ac] | Answer a call from a travel agency [plan-36ded576] | Talk with your child's teacher [plan-72a85ad4] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed to finish a conversation, so I am happy and done for now.* → `done` · observed (not acted on) · 0s

</details>
