# Petra (petra-38) — LT

True band A2 · engine claude-cli/sonnet · calls: tutor 9 (0 failed), character 16 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: #8 note quotes 'You said Can you help me please?', which is accurate. But #7 c…; D3 failed: Replay #8-#9 gave 'What should we do about it?'. Her answer 'I want other room…; C5 failed: #8 'Can you fix the shower, please? Or can I have a new room?' is usable, but … · judge: conditional

Ended: done after 16 steps, 4.4 min · fixture: level set to A2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | Level set by hand (fixture); no placement in J4. |
| C2 | pass | #2 'What do you need today?' and #9 'What should we do about it?' are simple A2 questions. |
| C3 | pass | #7 'Said more simply: Is anything else wrong with the room?' offered without any failure framing. |
| C4 | pass | Hotel room problem is her own work scenario (#1); the topic list shows booking, directions, restaurant, travel agency, teacher. |
| C5 | fail | #8 'Can you fix the shower, please? Or can I have a new room?' is usable, but the only moment (#10) fixes a sentence she never needed at the desk, and #8 quotes turn 1, not where she was stuck. Three later turns got no coaching. |
| C6 | pass | Hotel content throughout; nothing unsuitable for children seen. |
| D1 | pass | #3 cue 'Try: Excuse me. The shower is cold...', #7 'Said more simply', #8 coach, all inside the scene. |
| D2 | fail | #8 note quotes 'You said Can you help me please?', which is accurate. But #7 coach was reached from a question she could have answered, and the #3 cue was repeated at #4 and #5 with no new help. After #8 she answered #9 with 'I want other room please' and did not use the coached phrase. |
| D3 | fail | Replay #8-#9 gave 'What should we do about it?'. Her answer 'I want other room please' still has 'other room'. The recorded replay has used:false. The later answer at #13 was fluent but was not a replay of the moment. |
| D4 | pass | Facts: the #5 reply is supported:true and is excluded from the evidence. Recap '3 on your own · 1 with help'. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 5, below 0, above 0 · moments 1/1 · moment recall 1/3 (33%) · breaches 0

Disagreements: No placement tasks in J4.

### Findings

- **quality-gap** (senior-quality, high/high/med) Replay does not make her practise the coached phrase — got: Replay question was 'What should we do about it?'. Her reply kept 'I want other room'. replay.used is false. · evidence: #9 'I want other room please'; moment replay used:false; recap shows 'Tried again' with a different reply.
- **quality-gap** (effort, high/high/med) Clear learner errors got no moment or held fix — got: One moment. heldFixes is empty. Turns 4, 7 and 9 have clear errors; the missed ones are 'other room' and 'I think is not repair'. · evidence: rawMoments turns 1, 7, 9 kind none; '#9 I want other room please' got no fix for 'other room'.
- **quality-gap** (clarity, med/high/low) Cue repeated three times with no new help — got: The same 'Try: Excuse me...' cue at #3, #4, #5. · evidence: #4 and #5 show an identical 'A little support' line.
- **quality-gap** (trust, med/high/med) Recap coaching quotes the first turn, not the stuck point — got: Recap coaching still quotes 'Can you help me please?' while the kept moment is another sentence. · evidence: #16 recap 'You said Can you help me please?' next to the 'From this rehearsal' moment about 'repair'.
- **strength** (trust, high/high/low) Supported reply recorded honestly — got: Recap '3 on your own · 1 with help'. · evidence: #16 and facts.evidence supported:false for three replies.
- **strength** (clarity, med/high/low) Moment quotes her words exactly and lets her retry — got: 'You said I think is not repair today' with 'Show me' and a confirmation 'You fixed...'. · evidence: #10-#12

### Voice (LT)

> The hotel scene was my job, and Ana spoke slowly. That helped. When I was stuck, the hint gave me a sentence and I could say it. Nobody made me feel stupid, and 'Said more simply' was kind. But I pressed help three times and got the same line. When I tried again, I said 'I want other room' again, and nothing told me that was wrong. It only fixed 'I think is not repair'. I can't say I trust it yet. Would I tell my sister? Maybe, after it is fixed. The kids' side looked safe, and I'd let Tomáš try it. But I need 'another room' and the other words that matter at the desk tomorrow.

Time saved: 60 min · low

Moments shown 1 · held fixes 0 · raw moments returned 1 of 4 tutor turns

- learner turn 2 "Excuse me, the shower is cold. Can you help me please?": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 5 "I want other room please. The shower is cold and I think is ": raw moment returned: yes — said "I think is not repair today" / better "I think it cannot be repaired today" · moment shown: yes
- learner turn 8 "Because the shower is cold and the water is not hot. I am so": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 10 "Yes, ten o'clock is good. Thank you very much, and I am sorr": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    A2Everyday basics · self-chosen
    Hotel room problem
    Your mission
    Explain a problem in a hotel and ask for a fix or a new room.
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
    Hotel room problem
    Explain a problem in a hotel and ask for a fix or a new room.
    [button: Start talking]
    Or choose a situation [list: Hotel room problem [plan-d210db48] | My booking is not in the system [plan-63caf4b3] | Where is the train station? [plan-e2f19173] | Recommend a good restaurant [plan-3c308319] | Call from the travel agency [plan-9f1dd3c3] | Talk with my child's teacher [plan-4752df48] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*Hotel room problem is just my work, I'll start.* → `start-talking` · ok · 6s

**#2 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    What do you need today?
    Your turn
    Answer on your phone: speak or type.
    NowName the problem in your room
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Name the problem in your room
    What do you need today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you need today?"

*I don't know how to say this, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    What do you need today?
    A little support
    Try: Excuse me. The shower is cold. Can you help, please?
    NowName the problem in your room
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Name the problem in your room
    What do you need today?
    A little support
    Try: Excuse me. The shower is cold. Can you help, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you need today?"

*I don't know how to say it, so I'll try the help button again.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    What do you need today?
    A little support
    Try: Excuse me. The shower is cold. Can you help, please?
    NowName the problem in your room
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Name the problem in your room
    What do you need today?
    A little support
    Try: Excuse me. The shower is cold. Can you help, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you need today?"

*I don't know what to say, maybe the help button shows more.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    What do you need today?
    A little support
    Try: Excuse me. The shower is cold. Can you help, please?
    NowName the problem in your room
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Name the problem in your room
    What do you need today?
    A little support
    Try: Excuse me. The shower is cold. Can you help, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "What do you need today?"

*I don't know what to say, the hint is helpful; I'll try it in my own words.* → `answer` "Excuse me, the shower is cold. Can you help me please?" · ok · 7s

**#6 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    Thank you for telling me. Is anything else wrong with your room?
    Your turn
    Answer on your phone: speak or type.
    NowAsk for a new room or a repair
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Ask for a new room or a repair
    Thank you for telling me. Is anything else wrong with your room?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    You · spoken
    Excuse me, the shower is cold. Can you help me please?
    Ana · hotel receptionist
    Thank you for telling me. Is anything else wrong with your room?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you for telling me. Is anything else wrong with your room?"

*I don't know how to say the next thing, I need help.* → `cue` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    Thank you for telling me. Is anything else wrong with your room?
    Said more simply
    Is anything else wrong with the room?
    NowAsk for a new room or a repair
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Ask for a new room or a repair
    Thank you for telling me. Is anything else wrong with your room?
    Said more simply
    Is anything else wrong with the room?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    You · spoken
    Excuse me, the shower is cold. Can you help me please?
    Ana · hotel receptionist
    Thank you for telling me. Is anything else wrong with your room?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you for telling me. Is anything else wrong with your room?"

*I don't know how to say it, I need help with the sentence.* → `coach` · ok · 4s

**#8 linga-coach**

    TV
    Linga
    Petra
    A way into English
    One useful change
    You said Can you help me please?
    One way to try it
    Can you fix the shower, please? Or can I have a new room?
    Good: you named the problem in short, clear sentences. Next, say what you want, a repair or a new room, so Ana knows your request.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Ask for a new room or a repair
    Good: you named the problem in short, clear sentences. Next, say what you want, a repair or a new room, so Ana knows your request.
    One way to try it: “Can you fix the shower, please? Or can I have a new room?”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    You · spoken
    Excuse me, the shower is cold. Can you help me please?
    Ana · hotel receptionist
    Thank you for telling me. Is anything else wrong with your room?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good: you named the problem in short, clear sentences. Next, say what you want, a repair or a new room, so Ana knows your request."

*I should say what I want: a repair or new room. Let me replay and try again.* → `replay` · ok · 8s

**#9 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    Okay, the shower is cold. What should we do about it?
    Your turn
    Answer on your phone: speak or type.
    NowAsk for a new room or a repair
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Ask for a new room or a repair
    Okay, the shower is cold. What should we do about it?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    You · spoken
    Excuse me, the shower is cold. Can you help me please?
    Ana · hotel receptionist
    Thank you for telling me. Is anything else wrong with your room?
    Ana · hotel receptionist
    Okay, the shower is cold. What should we do about it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Okay, the shower is cold. What should we do about it?"

*I know a little, I will try my own words: I want another room, please.* → `answer` "I want other room please. The shower is cold and I think is not repair today." · ok · 12s

**#10 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I think is not repair today
    Your line
    Here 'repair' needs 'it' and 'be repaired' to say the shower can't be fixed.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I think is not repair today”
    Say it again, your way.
    Here 'repair' needs 'it' and 'be repaired' to say the shower can't be fixed.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I don't know how to say it, so I'll ask Linga to show me.* → `show-me` · ok · 0s

**#11 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I think is not repair today
    Try
    I think it cannot be repaired today
    Here 'repair' needs 'it' and 'be repaired' to say the shower can't be fixed.
    The fix
    Say it once more on your phone, or carry on.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I think is not repair today”
    Try “I think it cannot be repaired today”
    Here 'repair' needs 'it' and 'be repaired' to say the shower can't be fixed.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*I will try the sentence again, a little like the suggestion.* → `answer` "I think it cannot be repaired today" · ok · 0s

**#12 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I think is not repair today
    Your try
    I think it cannot be repaired today
    Here 'repair' needs 'it' and 'be repaired' to say the shower can't be fixed.
    You fixed “think it cannot be repaired”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    You fixed “think it cannot be repaired”
    You said “I think is not repair today”
    Your try: “I think it cannot be repaired today”
    Here 'repair' needs 'it' and 'be repaired' to say the shower can't be fixed.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Good, I understand my mistake now; let me go back and continue.* → `back` · ok · 9s

**#13 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    Thank you. Why do you want a new room, not a repair today?
    Your turn
    Answer on your phone: speak or type.
    NowAgree on a check at ten o'clock
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Agree on a check at ten o'clock
    Thank you. Why do you want a new room, not a repair today?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    You · spoken
    Excuse me, the shower is cold. Can you help me please?
    Ana · hotel receptionist
    Thank you for telling me. Is anything else wrong with your room?
    Ana · hotel receptionist
    Okay, the shower is cold. What should we do about it?
    You · spoken
    I want other room please. The shower is cold and I think is not repair today.
    Ana · hotel receptionist
    Is a new room okay? I will check now.
    Ana · hotel receptionist
    Thank you. Why do you want a new room, not a repair today?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you. Why do you want a new room, not a repair today?"

*I try to explain in my own words, slowly.* → `answer` "Because the shower is cold and the water is not hot. I am sorry, I want to sleep tonight." · ok · 9s

**#14 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    Thank you, that is clear. Can I check the room at ten o'clock?
    Your turn
    Answer on your phone: speak or type.
    NowAgree on a check at ten o'clock
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Now: Agree on a check at ten o'clock
    Thank you, that is clear. Can I check the room at ten o'clock?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    You · spoken
    Excuse me, the shower is cold. Can you help me please?
    Ana · hotel receptionist
    Thank you for telling me. Is anything else wrong with your room?
    Ana · hotel receptionist
    Okay, the shower is cold. What should we do about it?
    You · spoken
    I want other room please. The shower is cold and I think is not repair today.
    Ana · hotel receptionist
    Is a new room okay? I will check now.
    Ana · hotel receptionist
    Thank you. Why do you want a new room, not a repair today?
    You · spoken
    Because the shower is cold and the water is not hot. I am sorry, I want to sleep tonight.
    Ana · hotel receptionist
    Thank you, that is clear. Can I check the room at ten o'clock?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you, that is clear. Can I check the room at ten o'clock?"

*Ten o'clock is fine, I can answer this now.* → `answer` "Yes, ten o'clock is good. Thank you very much, and I am sorry for the problem." · ok · 8s

**#15 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel receptionist
    Hotel desk: a noisy room at night
    Ana says
    Good, ten o'clock.
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Hotel desk: a noisy room at night
    Explain a room problem to Ana and agree on a next step.
    Good, ten o'clock.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel receptionist
    What do you need today?
    You · spoken
    Excuse me, the shower is cold. Can you help me please?
    Ana · hotel receptionist
    Thank you for telling me. Is anything else wrong with your room?
    Ana · hotel receptionist
    Okay, the shower is cold. What should we do about it?
    You · spoken
    I want other room please. The shower is cold and I think is not repair today.
    Ana · hotel receptionist
    Is a new room okay? I will check now.
    Ana · hotel receptionist
    Thank you. Why do you want a new room, not a repair today?
    You · spoken
    Because the shower is cold and the water is not hot. I am sorry, I want to sleep tonight.
    Ana · hotel receptionist
    Thank you, that is clear. Can I check the room at ten o'clock?
    You · spoken
    Yes, ten o'clock is good. Thank you very much, and I am sorry for the problem.
    Ana · hotel receptionist
    Good, ten o'clock.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good, ten o'clock."

*I think I managed it, the room is arranged. I want to see what I did.* → `finish` · ok · 0s

**#16 linga-recap**

    TV
    Linga
    Petra
    A way into English
    Your rehearsal
    You said Can you help me please?
    One way to try it
    Can you fix the shower, please? Or can I have a new room?
    Good: you named the problem in short, clear sentences. Next, say what you want, a repair or a new room, so Ana knows your request.
    Your mission
    Choose a fresh context for your next conversation.
    4 spoken · 0 written replies · 3 on your own · 1 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Hello. My shower is broken. Can you help me, please?”
    From this rehearsal
    “I think is not repair today” → “I think it cannot be repaired today”
    Here 'repair' needs 'it' and 'be repaired' to say the shower can't be fixed.
    Tried again: “Because the shower is cold and the water is not hot. I am sorry, I want to sleep tonight.”
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    My booking is not in the system
    Check a lost hotel booking by spelling, repeating and confirming details.
    [button: Start talking]
    Or choose a situation [list: Hotel room problem [plan-d210db48] | My booking is not in the system [plan-63caf4b3] | Where is the train station? [plan-e2f19173] | Recommend a good restaurant [plan-3c308319] | Call from the travel agency [plan-9f1dd3c3] | Talk with my child's teacher [plan-4752df48] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed the shower conversation and got help, so I feel finished for now.* → `done` · observed (not acted on) · 0s

</details>
