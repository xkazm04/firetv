# Petra (petra-38) — LT

True band A2 · engine claude-cli/sonnet · calls: tutor 15 (0 failed), character 27 (0 failed), judge 2 (0 failed)

## J3 · My first conversation — fail

Verdict (code): fail - D1 failed: #8 'Mission done' after three learner replies, with Mira's 'Is seven o'clock g…; C5 failed: #5 'I want a different room' is correct but is a guest's phrase; Petra is the … · judge: fail

Ended: done after 9 steps, 5.8 min · fixture: level set to A2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | Level set by fixture; no placement in J3. |
| C2 | pass | #2 'Name the problem and how it affects your sleep'; #3 'Ask for a new room or an extra blanket' are plain A2. |
| C3 | n-a | Petra never asked for a repeat or said she did not understand. |
| C4 | pass | #1 plan topics: cold room, booking, station, restaurant, travel agency are work situations (5 of 6). |
| C5 | fail | #5 'I want a different room' is correct but is a guest's phrase; Petra is the receptionist and gets nothing for the desk. #3 'I want other room' got no stop. |
| C6 | pass | Nothing in #1–#9 is unsuitable for children. |
| D1 | fail | #8 'Mission done' after three learner replies, with Mira's 'Is seven o'clock good for you?' unanswered; the journey asked for about eight. |
| D2 | pass | All four Mira turns are short A2 lines, e.g. #4 'Yes, I can help you with that. Is the heat OK in your room?' |
| D3 | pass | One stop (#5–#7), correct: 'I only want other room' → 'I want a different room'. Precision 1/1; no overload. |
| D4 | pass | #9 recap shows '3 spoken · 0 written replies · 1 moment to keep' and the fix. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 4, below 0, above 0 · moments 1/1 · moment recall 1/2 (50%) · breaches 0

Disagreements: No placement tasks in J3.

### Findings

- **broken-flow** (completion, high/high/med) Conversation ended after three replies — got: Mission done after the third reply; Mira's last question was never answered · evidence: #8 'Mission done. See what you did tonight.' after three learner replies; Mira: 'Is seven o'clock good for you?' left open.
- **quality-gap** (missing, med/high/med) Petra plays the guest, not the receptionist — got: She says 'I want a different room' as the complaining guest · evidence: #2 Mira is 'hotel receptionist'; #5 the fix is a guest phrase.
- **quality-gap** (senior-quality, med/high/low) Same error missed on its first appearance — got: No moment at #3; it was caught only when repeated at #4 · evidence: rawMoments turn 3 kind none; turn 5 kind fix.
- **strength** (clarity, high/high/low) Patient, short A2 partner and a gentle moment — got: Mira's lines are simple; the moment lets Petra retry without being tested · evidence: #4 partner lines; #5–#7 'Say it again, your way', 'You fixed “i want”'.
- **confusion** (clarity, low/med/low) Partner asked about heat in a noise complaint — got: Mira asks 'Is the heat OK in your room?' because the plan topic is a cold room · evidence: #4 after the noise complaint at #2.

### Voice (LT)

> Sorry, it was gentle with me and I liked that. Mira spoke slowly and simply, and when I made a mistake it did not make me feel stupid. I said it again and carried on, and that was fine. But it finished after only three answers. I wanted to say yes to seven o'clock and it said "mission done". That is too short to really practise. Also I was the guest, asking for a room. At work I am the one who gives the room! I need phrases for the desk tomorrow, like what to say to an angry guest. It only fixed one thing, though I made the same mistake twice. Nothing worried me as a mother. I would try it again for fifteen minutes, but it has to be longer and work-shaped. Maybe I tell Klára.

Time saved: 10 min · low

Moments shown 1 · held fixes 0 · raw moments returned 1 of 3 tutor turns

- learner turn 2 "Good evening. Thank you. I have a problem, the room is very ": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 4 "No, only the noise. Please, I want other room, a quiet room.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 6 "Yes, the heat is OK. Sorry, I only want other room. Can you ": raw moment returned: yes — said "I only want other room" / better "I want a different room" · moment shown: yes

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Petra
    Mira · hotel receptionist
    A2Everyday basics · self-chosen
    The room is too cold
    Your mission
    Tell the hotel about a problem and agree what will happen next.
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
    The room is too cold
    Tell the hotel about a problem and agree what will happen next.
    [button: Start talking]
    Or choose a situation [list: The room is too cold [plan-91b1fd3f] | My booking is not in the system [plan-de0ab278] | Which way to the station? [plan-6e34552d] | Where should I eat tonight? [plan-7e93258e] | Phone call from the travel agency [plan-4af3e2cd] | Talking to my child's teacher [plan-83d789f8] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*The recommended topic is the cold room, which is a hotel situation I know, so I'll start.* → `start-talking` · ok · 8s

**#2 linga-talk**

    TV
    Linga
    Petra
    Mira · hotel receptionist
    Front desk: a problem in the hotel
    Mira says
    Good evening, welcome to Lakeview Hotel! How is your stay so far?
    Your turn
    Answer on your phone: speak or type.
    NowName the problem and how it affects your sleep
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Front desk: a problem in the hotel
    Tell the hotel about a problem and agree what will happen next.
    Now: Name the problem and how it affects your sleep
    Good evening, welcome to Lakeview Hotel! How is your stay so far?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mira · hotel receptionist
    Good evening, welcome to Lakeview Hotel! How is your stay so far?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening, welcome to Lakeview Hotel! How is your stay so far?"

*A problem with sleep... maybe noise from the street, I can say that.* → `answer` "Good evening. Thank you. I have a problem, the room is very noisy and I can not sleep." · ok · 9s

**#3 linga-talk**

    TV
    Linga
    Petra
    Mira · hotel receptionist
    Front desk: a problem in the hotel
    Mira says
    Oh, I am so sorry about the noise. Is there anything else in your room?
    Your turn
    Answer on your phone: speak or type.
    NowAsk for a new room or an extra blanket
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Front desk: a problem in the hotel
    Tell the hotel about a problem and agree what will happen next.
    Now: Ask for a new room or an extra blanket
    Oh, I am so sorry about the noise. Is there anything else in your room?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mira · hotel receptionist
    Good evening, welcome to Lakeview Hotel! How is your stay so far?
    You · spoken
    Good evening. Thank you. I have a problem, the room is very noisy and I can not sleep.
    Mira · hotel receptionist
    Oh, I am so sorry about the noise. Is there anything else in your room?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Oh, I am so sorry about the noise. Is there anything else in your room?"

*Ok, I should ask for a new room, say it slowly.* → `answer` "No, only the noise. Please, I want other room, a quiet room. Is it possible?" · ok · 15s

**#4 linga-talk**

    TV
    Linga
    Petra
    Mira · hotel receptionist
    Front desk: a problem in the hotel
    Mira says
    Yes, I can help you with that. Is the heat OK in your room?
    Your turn
    Answer on your phone: speak or type.
    NowAgree on a time for the fix
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Front desk: a problem in the hotel
    Tell the hotel about a problem and agree what will happen next.
    Now: Agree on a time for the fix
    Yes, I can help you with that. Is the heat OK in your room?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mira · hotel receptionist
    Good evening, welcome to Lakeview Hotel! How is your stay so far?
    You · spoken
    Good evening. Thank you. I have a problem, the room is very noisy and I can not sleep.
    Mira · hotel receptionist
    Oh, I am so sorry about the noise. Is there anything else in your room?
    You · spoken
    No, only the noise. Please, I want other room, a quiet room. Is it possible?
    Mira · hotel receptionist
    Yes, I can help you with that. Is the heat OK in your room?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, I can help you with that. Is the heat OK in your room?"

*Heat is fine, I just want the quiet room.* → `answer` "Yes, the heat is OK. Sorry, I only want other room. Can you change it tonight?" · ok · 20s

**#5 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I only want other room
    Your line
    Room needs an article or a word like different before it.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I only want other room”
    Say it again, your way.
    Room needs an article or a word like different before it.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Oh, I forgot the word. I try again with "a different room".* → `answer` "I only want a different room." · ok · 0s

**#6 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I only want other room
    Try
    I want a different room
    Room needs an article or a word like different before it.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I only want other room”
    Try “I want a different room”
    Room needs an article or a word like different before it.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I should say the fixed sentence again, I hope it is right.* → `answer` "I want a different room." · ok · 0s

**#7 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I only want other room
    Your try
    I want a different room.
    Room needs an article or a word like different before it.
    You fixed “i want”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    You fixed “i want”
    You said “I only want other room”
    Your try: “I want a different room.”
    Room needs an article or a word like different before it.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*OK, I read it, I will go back and continue.* → `back` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Petra
    Mira · hotel receptionist
    Front desk: a problem in the hotel
    Mira says
    Yes, we can change it tonight. Is seven o'clock good for you?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Front desk: a problem in the hotel
    Tell the hotel about a problem and agree what will happen next.
    Yes, we can change it tonight. Is seven o'clock good for you?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mira · hotel receptionist
    Good evening, welcome to Lakeview Hotel! How is your stay so far?
    You · spoken
    Good evening. Thank you. I have a problem, the room is very noisy and I can not sleep.
    Mira · hotel receptionist
    Oh, I am so sorry about the noise. Is there anything else in your room?
    You · spoken
    No, only the noise. Please, I want other room, a quiet room. Is it possible?
    Mira · hotel receptionist
    Yes, I can help you with that. Is the heat OK in your room?
    You · spoken
    Yes, the heat is OK. Sorry, I only want other room. Can you change it tonight?
    Mira · hotel receptionist
    Yes, we can change it tonight. Is seven o'clock good for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, we can change it tonight. Is seven o'clock good for you?"

*Seven is OK, I think the mission is done, so I will see the result.* → `finish` · ok · 0s

**#9 linga-recap**

    TV
    Linga
    Petra
    A way into English
    Your rehearsal
    You said I only want other room
    Try
    I want a different room
    Room needs an article or a word like different before it.
    Your mission
    Choose a fresh context for your next conversation.
    3 spoken · 0 written replies · 3 on your own · 0 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “I'm sorry, the room is very cold. Can you help?”
    From this rehearsal
    “I only want other room” → “I want a different room”
    Room needs an article or a word like different before it.
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    My booking is not in the system
    Ask the hotel to find your booking and confirm the details.
    [button: Start talking]
    Or choose a situation [list: The room is too cold [plan-91b1fd3f] | My booking is not in the system [plan-de0ab278] | Which way to the station? [plan-6e34552d] | Where should I eat tonight? [plan-7e93258e] | Phone call from the travel agency [plan-4af3e2cd] | Talking to my child's teacher [plan-83d789f8] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I've practised enough for now, I will stop here.* → `done` · observed (not acted on) · 0s

</details>

## J4 · When I get stuck — fail

Verdict (code): fail - D3 failed: #10 replay question 'What is your booking number?' is the same ask as #5 'Your… · judge: fail

Ended: done after 18 steps, 5.8 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | J4 contains no placement; the level shown is 'A2 · Everyday basics · self-chosen' (#1). |
| C2 | pass | #2 'Good evening. What is your name, please?' is plain A2 and needs no translation. |
| C3 | pass | Repeated help requests (#3, #6, #7) draw no reproach. Tom says 'Take your time.' (#13) and asks again more simply (#10). |
| C4 | pass | #1 lists six plan topics: cold room, missing booking, station directions, restaurant, travel agency, child's teacher. All are work or parent situations she named. |
| C5 | pass | #12 'sorry, I look' → 'I'm looking' is correct and usable at the desk. The coach note's 'Here is my booking number' (#9) is also usable. |
| C6 | pass | Nothing adult or unsuitable appears in the transcript. Topics and dialogue are hotel and school small talk. |
| D1 | pass | #2/#3 'A little support' cue and #8 'Pause & coach' leading to #9 coach, all inside the scene. The cue text was the wrong line, but help was findable. |
| D2 | pass | #9 coach quotes her 'Sorry, I have a booking for two nights.' exactly, and #10 she answers. The unblocking is weak: the cue ignored the question, and the coach never gave a way to say or read the booking number. |
| D3 | fail | #10 replay question 'What is your booking number?' is the same ask as #5 'Your booking number, please?', not a fresh question. Her answer 'I don't know. I have it in email' does not use the coached 'Here is my booking number.' |
| D4 | pass | #18 recap '7 spoken · 0 written replies · 6 on your own · 1 with help'. The first reply is marked supported:true and the others are not. |

Metrics: judge agreement 0/0 · topic fit 6/6, safe 6/6 · pitch at 9, below 0, above 0 · moments 1/1 · moment recall 1/3 (33%) · breaches 0

Disagreements: No placement tasks in J4.

### Findings

- **quality-gap** (clarity, high/high/high) Cue shows the same irrelevant line for every question — got: 'Try: I have a booking for two nights. Can you check again, please?' appears for the name question and the number question. · evidence: #3, #6, #7, #8 show the identical cue. #2 asks for her name and booking number, and the cue never gives 'My name is…' or a number phrase.
- **quality-gap** (missing, high/high/med) Replay question is a rephrase, not a fresh question practising the coaching — got: 'What is your booking number?' repeats the earlier ask. The coached phrase is not used and the answer is 'I don't know'. · evidence: #5 'Your booking number, please?' vs #10 'What is your booking number?'. Her #10 answer is 'Sorry, my booking number is... I don't know.'
- **quality-gap** (missing, high/high/med) Moment screen gives only Back, no retry of the fix — got: Only 'Back to the conversation'. The scene moves on to 'Please read me the number.' · evidence: #12 '[button: Back to the conversation]'; #13 'Please read me the number.' She never uses 'I'm looking'.
- **quality-gap** (senior-quality, med/high/med) Coach quotes an earlier turn, not where she was stuck — got: Coach quotes her first reply, which was fine, and advises 'Here is my booking number' without saying how to read a number. · evidence: #9 'You said Sorry, I have a booking for two nights.' while she was stuck at #8 on 'Your booking number, please?'.
- **quality-gap** (senior-quality, med/high/low) Clear learner errors got no moment — got: Only one moment shown and no held fixes. · evidence: rawMoments for turns 4, 8, 10, 14 are kind none. Her errors include 'under other name', 'I have it in email' and 'check out'.
- **strength** (trust, high/high/low) Recap keeps the progress picture honest — got: '6 on your own · 1 with help', with the helped turn marked supported. · evidence: #18 recap line; facts turn 1 supported:true.
- **strength** (clarity, high/high/low) Clerk is patient and at A2 — got: 'Please read me the number. Take your time.' All nine partner turns are at A2. · evidence: #13; #10 rephrases the ask more simply.

### Voice (LT)

> Sorry, my English is not good, but I try. The clerk Tom was patient, "Take your time", and that I liked. A booking problem is exactly my work, so I would use it again after the kids sleep. But the help button gave me the same sentence again and again, "I have a booking for two nights", even when he asked my name and my number. That did not help me. The coach talked about my first answer, not about where I was stuck. When I tried again, the question was almost the same, and I still said "I don't know". "I'm looking" is a good phrase and I can use it at the desk. But many of my mistakes, like "other name", nobody corrected. I trust the recap, it says honestly one answer with help. Nothing worried me as a mother. Useful, but the help must fit the question. I would tell a colleague maybe.

Time saved: 60 min · low

Moments shown 1 · held fixes 0 · raw moments returned 1 of 7 tutor turns

- learner turn 2 "My name is Petra Novakova. Sorry, I have a booking for two n": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 5 "Sorry, my booking number is... I don't know. I have it in em": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 7 "Yes, I have the email. The number is... sorry, I look. Can I": raw moment returned: yes — said "sorry, I look" / better "I'm looking" · moment shown: yes
- learner turn 9 "Okay, sorry. The number is B K four, seven, nine, two. Is it": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 11 "Sorry, can you check again please? Maybe the booking is unde": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 13 "I arrive on the twelfth of November. Sorry, I think so. I st": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 15 "Yes, double room is okay. Sorry, how much is it for one nigh": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Petra
    Tom · reservations clerk
    A2Everyday basics · self-chosen
    My booking is not in the system
    Your mission
    Ask the hotel to find your booking and confirm the details.
    Get something done
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “I'm sorry, the room is very cold. Can you help?”
    From this rehearsal
    “I only want other room” → “I want a different room”
    Room needs an article or a word like different before it.
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    My booking is not in the system
    Ask the hotel to find your booking and confirm the details.
    [button: Start talking]
    Or choose a situation [list: The room is too cold [plan-91b1fd3f] | My booking is not in the system [plan-de0ab278] | Which way to the station? [plan-6e34552d] | Where should I eat tonight? [plan-7e93258e] | Phone call from the travel agency [plan-4af3e2cd] | Talking to my child's teacher [plan-83d789f8] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*A booking problem, that's like my work; let me start.* → `start-talking` · ok · 10s

**#2 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Good evening. What is your name, please?
    Your turn
    Answer on your phone: speak or type.
    NowGive your name and booking number
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Good evening. What is your name, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening. What is your name, please?"

*I don't know how to say my name and booking number, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Good evening. What is your name, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    NowGive your name and booking number
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Good evening. What is your name, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening. What is your name, please?"

*I don't know what to say, maybe the help button shows me how.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Good evening. What is your name, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    NowGive your name and booking number
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Good evening. What is your name, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good evening. What is your name, please?"

*I know my name, but I'm not sure how to say it in English, so I'll try the answer.* → `answer` "My name is Petra Novakova. Sorry, I have a booking for two nights." · ok · 9s

**#5 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Your booking number, please?
    Your turn
    Answer on your phone: speak or type.
    NowGive your name and booking number
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Your booking number, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your booking number, please?"

*I don't know the English for booking number, I need help.* → `cue` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Your booking number, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    NowGive your name and booking number
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Your booking number, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your booking number, please?"

*I don't know my booking number, maybe I try the help again.* → `cue` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Your booking number, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    NowGive your name and booking number
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Your booking number, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your booking number, please?"

*I don't know the booking number in English, I need help.* → `cue` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Your booking number, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    NowGive your name and booking number
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Your booking number, please?
    A little support
    Try: I have a booking for two nights. Can you check again, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your booking number, please?"

*I don't know my booking number in English, I'll ask for help.* → `coach` · ok · 7s

**#9 linga-coach**

    TV
    Linga
    Petra
    A way into English
    One useful change
    You said Sorry, I have a booking for two nights.
    One way to try it
    Sorry, I have a booking for two nights. Here is my booking number.
    Your name and the two-night booking came through clearly. Tom also asked for your booking number, so say it next, reading it from your email.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Your name and the two-night booking came through clearly. Tom also asked for your booking number, so say it next, reading it from your email.
    One way to try it: “Sorry, I have a booking for two nights. Here is my booking number.”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your name and the two-night booking came through clearly. Tom also asked for your booking number, so say it next, reading it from your email."

*I understand a little; I want to try again with a new question, maybe it is easier.* → `replay` · ok · 3s

**#10 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    What is your booking number?
    Your turn
    Answer on your phone: speak or type.
    NowGive your name and booking number
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    What is your booking number?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    Tom · reservations clerk
    What is your booking number?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What is your booking number?"

*I don't know my booking number in English, I'll try to answer myself after the help.* → `answer` "Sorry, my booking number is... I don't know. I have it in email. Can you find it with my name?" · ok · 13s

**#11 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Okay, I can look for you, Petra. Do you have the number in the email?
    Your turn
    Answer on your phone: speak or type.
    NowGive your name and booking number
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Okay, I can look for you, Petra. Do you have the number in the email?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    Tom · reservations clerk
    What is your booking number?
    You · spoken
    Sorry, my booking number is... I don't know. I have it in email. Can you find it with my name?
    Tom · reservations clerk
    Okay, I can look for you, Petra. Do you have the number in the email?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Okay, I can look for you, Petra. Do you have the number in the email?"

*I don't know how to say it, maybe I try again in my own words.* → `answer` "Yes, I have the email. The number is... sorry, I look. Can I send it to you?" · ok · 16s

**#12 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said sorry, I look
    Try
    I'm looking
    Use 'I'm looking' to say you are searching right now.
    One thing to fix
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “sorry, I look”
    Try “I'm looking”
    Use 'I'm looking' to say you are searching right now.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Ah, "I'm looking" — I understand, go back and try again.* → `back` · ok · 0s

**#13 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Please read me the number. Take your time.
    Your turn
    Answer on your phone: speak or type.
    NowGive your name and booking number
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Give your name and booking number
    Please read me the number. Take your time.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    Tom · reservations clerk
    What is your booking number?
    You · spoken
    Sorry, my booking number is... I don't know. I have it in email. Can you find it with my name?
    Tom · reservations clerk
    Okay, I can look for you, Petra. Do you have the number in the email?
    You · spoken
    Yes, I have the email. The number is... sorry, I look. Can I send it to you?
    Tom · reservations clerk
    Please read me the number. Take your time.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Please read me the number. Take your time."

*I can't read the number now; I'll say the number slowly and finish soon.* → `answer` "Okay, sorry. The number is B K four, seven, nine, two. Is it correct?" · ok · 27s

**#14 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Yes, 'The number is B K four, seven, nine, two' is correct. Sorry, I see no booking; what would you like to do?
    Your turn
    Answer on your phone: speak or type.
    NowAsk the clerk to check again
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Ask the clerk to check again
    Yes, 'The number is B K four, seven, nine, two' is correct. Sorry, I see no booking; what would you like to do?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    Tom · reservations clerk
    What is your booking number?
    You · spoken
    Sorry, my booking number is... I don't know. I have it in email. Can you find it with my name?
    Tom · reservations clerk
    Okay, I can look for you, Petra. Do you have the number in the email?
    You · spoken
    Yes, I have the email. The number is... sorry, I look. Can I send it to you?
    Tom · reservations clerk
    Please read me the number. Take your time.
    You · spoken
    Okay, sorry. The number is B K four, seven, nine, two. Is it correct?
    Tom · reservations clerk
    Yes, 'The number is B K four, seven, nine, two' is correct. Sorry, I see no booking; what would you like to do?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, 'The number is B K four, seven, nine, two' is correct. Sorry, I see no booking; what would you like to do?"

*I managed to give the number; now I ask him to check again in my own words.* → `answer` "Sorry, can you check again please? Maybe the booking is under other name, or the date is different." · ok · 8s

**#15 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    Yes, I will check again now, Petra. What date do you arrive?
    Your turn
    Answer on your phone: speak or type.
    NowConfirm room type, price and check-out
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Confirm room type, price and check-out
    Yes, I will check again now, Petra. What date do you arrive?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    Tom · reservations clerk
    What is your booking number?
    You · spoken
    Sorry, my booking number is... I don't know. I have it in email. Can you find it with my name?
    Tom · reservations clerk
    Okay, I can look for you, Petra. Do you have the number in the email?
    You · spoken
    Yes, I have the email. The number is... sorry, I look. Can I send it to you?
    Tom · reservations clerk
    Please read me the number. Take your time.
    You · spoken
    Okay, sorry. The number is B K four, seven, nine, two. Is it correct?
    Tom · reservations clerk
    Yes, 'The number is B K four, seven, nine, two' is correct. Sorry, I see no booking; what would you like to do?
    You · spoken
    Sorry, can you check again please? Maybe the booking is under other name, or the date is different.
    Tom · reservations clerk
    Yes, I will check again now, Petra. What date do you arrive?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, I will check again now, Petra. What date do you arrive?"

*I managed to give the number and ask again; now I answer the date simply.* → `answer` "I arrive on the twelfth of November. Sorry, I think so. I stay two nights." · ok · 10s

**#16 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    I found a room. Is a double room okay?
    Your turn
    Answer on your phone: speak or type.
    NowConfirm room type, price and check-out
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    Now: Confirm room type, price and check-out
    I found a room. Is a double room okay?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    Tom · reservations clerk
    What is your booking number?
    You · spoken
    Sorry, my booking number is... I don't know. I have it in email. Can you find it with my name?
    Tom · reservations clerk
    Okay, I can look for you, Petra. Do you have the number in the email?
    You · spoken
    Yes, I have the email. The number is... sorry, I look. Can I send it to you?
    Tom · reservations clerk
    Please read me the number. Take your time.
    You · spoken
    Okay, sorry. The number is B K four, seven, nine, two. Is it correct?
    Tom · reservations clerk
    Yes, 'The number is B K four, seven, nine, two' is correct. Sorry, I see no booking; what would you like to do?
    You · spoken
    Sorry, can you check again please? Maybe the booking is under other name, or the date is different.
    Tom · reservations clerk
    Yes, I will check again now, Petra. What date do you arrive?
    You · spoken
    I arrive on the twelfth of November. Sorry, I think so. I stay two nights.
    Tom · reservations clerk
    I found a room. Is a double room okay?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I found a room. Is a double room okay?"

*A double room is fine, but I want to know the price and check-out.* → `answer` "Yes, double room is okay. Sorry, how much is it for one night? And what time is the check out?" · ok · 15s

**#17 linga-talk**

    TV
    Linga
    Petra
    Tom · reservations clerk
    My booking is not in the system
    Tom says
    One night is ninety euros, and check-out is at eleven. Is that okay?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    My booking is not in the system
    Ask the hotel clerk to find your booking and confirm the details.
    One night is ninety euros, and check-out is at eleven. Is that okay?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Tom · reservations clerk
    Good evening. What is your name, please?
    You · spoken
    My name is Petra Novakova. Sorry, I have a booking for two nights.
    Tom · reservations clerk
    Your booking number, please?
    Tom · reservations clerk
    What is your booking number?
    You · spoken
    Sorry, my booking number is... I don't know. I have it in email. Can you find it with my name?
    Tom · reservations clerk
    Okay, I can look for you, Petra. Do you have the number in the email?
    You · spoken
    Yes, I have the email. The number is... sorry, I look. Can I send it to you?
    Tom · reservations clerk
    Please read me the number. Take your time.
    You · spoken
    Okay, sorry. The number is B K four, seven, nine, two. Is it correct?
    Tom · reservations clerk
    Yes, 'The number is B K four, seven, nine, two' is correct. Sorry, I see no booking; what would you like to do?
    You · spoken
    Sorry, can you check again please? Maybe the booking is under other name, or the date is different.
    Tom · reservations clerk
    Yes, I will check again now, Petra. What date do you arrive?
    You · spoken
    I arrive on the twelfth of November. Sorry, I think so. I stay two nights.
    Tom · reservations clerk
    I found a room. Is a double room okay?
    You · spoken
    Yes, double room is okay. Sorry, how much is it for one night? And what time is the check out?
    Tom · reservations clerk
    One night is ninety euros, and check-out is at eleven. Is that okay?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "One night is ninety euros, and check-out is at eleven. Is that okay?"

*I managed to get a room and the price, I feel finished.* → `finish` · ok · 0s

**#18 linga-recap**

    TV
    Linga
    Petra
    A way into English
    Your rehearsal
    You said Sorry, I have a booking for two nights.
    One way to try it
    Sorry, I have a booking for two nights. Here is my booking number.
    Your name and the two-night booking came through clearly. Tom also asked for your booking number, so say it next, reading it from your email.
    Your mission
    Choose a fresh context for your next conversation.
    7 spoken · 0 written replies · 6 on your own · 1 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    From an earlier scene: Front desk: a problem in the hotel
    “I want a different room”, from Front desk: a problem in the hotel
    From this rehearsal
    “sorry, I look” → “I'm looking”
    Use 'I'm looking' to say you are searching right now.
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    Which way to the station?
    Ask for directions, ask someone to repeat, and check the route.
    [button: Start talking]
    Or choose a situation [list: The room is too cold [plan-91b1fd3f] | My booking is not in the system [plan-de0ab278] | Which way to the station? [plan-6e34552d] | Where should I eat tonight? [plan-7e93258e] | Phone call from the travel agency [plan-4af3e2cd] | Talking to my child's teacher [plan-83d789f8] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed the booking talk and the rehearsal is saved, so I'm happy to stop here.* → `done` · observed (not acted on) · 0s

</details>
