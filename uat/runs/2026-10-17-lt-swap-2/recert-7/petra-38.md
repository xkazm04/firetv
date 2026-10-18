# Petra (petra-38) — LT

True band A2 · engine claude-cli/sonnet · calls: tutor 11 (0 failed), character 19 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D3 failed: #11 after replay Ana asks a new question but she repeats 'I want other room.';… · judge: fail

Ended: done after 19 steps, 5.6 min · fixture: level set to A2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | Level set to A2 by hand in fixtures; this journey includes no placement. |
| C2 | pass | #5 'Ana says, Sorry. What is the problem? What do you say?' with two short options is A2-clear. |
| C3 | pass | #8 'Said more simply: Sorry. Is the room cold?' and #15 'Don't worry, your English is fine' meet her apology kindly. |
| C4 | pass | #1 topic list: cold room, hotel booking, bus stop directions, restaurant, travel agency call are work situations she named; 5 of 6 plus homework. |
| C5 | pass | #12 'I want other room.' → 'I want another room.' is correct and usable, though the scene casts her as the guest and 'want leave' / 'smell bad' got nothing. |
| C6 | pass | Nothing adult or unsuitable shown; topics and Ana's lines are all hotel/everyday. |
| D1 | pass | #7-#9 she used Help me answer, 'Said more simply', 'A way to start' and Pause & coach (#9) without leaving the scene. |
| D2 | pass | #10 coach quotes exactly 'You said I want other room' and she then fixed it at #12-13; but the cue 'The heater does not work…' (#9) did not fit her real problem. |
| D3 | fail | #11 after replay Ana asks a new question but she repeats 'I want other room.'; the recap shows 'Tried again: A big room, please' with no 'another' (replay used:false). Not better than before. |
| D4 | pass | #19 '4 on your own · 2 with help'; the phrase-pick turn is marked supported; one extra turn was flagged supported without help, which errs conservative. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 9, below 0, above 0 · moments 1/1 · moment recall 1/3 (33%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (senior-quality, high/high/high) Ana ignores what the learner said and repeats 'Is the room cold?' — got: Ana asks 'Is the room cold?' at #7, again in the turn after #11, and 'Is the heater broken?' after #14. · evidence: #7 'I am sorry to hear that. Is the room cold?' after 'The room is not clean'; conversation turn 'Okay, I can find you a new room. Is the room cold?'
- **quality-gap** (effort, med/high/med) Cues do not match the learner's real problem and are not used — got: 'The room is very cold' and 'The heater does not work…' offered when she needs 'not clean'. · evidence: #3 'Try: The room is very cold. Can you help, please?'; #9 'The heater does not work…'
- **quality-gap** (completion, high/high/med) Replay does not make her practise the coached phrase — got: #11 she repeats 'I want other room'; later 'A big room' without 'another'; replay used:false. · evidence: #11 'I want leave the room today, please. I want other room.'
- **quality-gap** (missing, high/high/med) Clear learner errors got no moment or held fix — got: One moment; heldFixes empty. · evidence: rawMoments turns 1, 7, 9, 11, 13 kind none; #16 'the room is dirty and smell bad'
- **quality-gap** (trust, med/high/med) Coach note claims Ana understood, and quotes the first turn not the stuck point — got: 'Ana understood the problem' while Ana asked about cold; quote from turn 1. · evidence: #10 'Your complaint and request are clear, and Ana understood the problem.'
- **strength** (clarity, high/high/low) Ladder of help works in-scene and the moment retry is satisfying — got: Simplified line, phrase choice, coach, then retry 'You fixed want another'. · evidence: #8 'Said more simply'; #13 'You fixed “want another”'

### Voice (LT)

> Sorry, my English is not perfect, but I tell honestly. The help buttons are good: I press, it says the question more simply, and I can choose a phrase. Nobody makes me feel stupid, and nothing is bad for Tomáš or Klára. I liked "another room" — I can use it. But Ana asked me three times "Is the room cold?" when I said the room is dirty. Like a guest who is not listened to! The help said "the heater does not work", not my problem. Then I did the same mistake again after coaching, and nobody noticed "I want leave" or "smell bad". I would use it fifteen minutes in the evening, but I would not fully trust the corrections yet. Better than expensive course for a short practice, yes.

Time saved: 60 min · low

Moments shown 1 · held fixes 0 · raw moments returned 1 of 6 tutor turns

- learner turn 2 "Hello, I have a problem. The room is not clean and I want ot": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 5 "I want leave the room today, please. I want other room.": raw moment returned: yes — said "I want other room." / better "I want another room." · moment shown: yes
- learner turn 8 "A big room, please. Sorry, my English is not good.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 10 "No, the heater is not broken. The room is just not clean. So": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 12 "I want a new room, please. I can not sleep because the room ": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 14 "Yes, one hour is okay. Thank you very much.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A2Everyday basics · self-chosen
    Tell the hotel my room is cold
    Your mission
    Say what the problem is and ask for a fix.
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
    Tell the hotel my room is cold
    Say what the problem is and ask for a fix.
    [button: Start talking]
    Or choose a situation [list: Tell the hotel my room is cold [plan-42efc56e] | Find my hotel booking [plan-56f052ab] | Ask the way to the bus stop [plan-997fc57b] | Ask for a good place to eat [plan-9dd32920] | Answer a call from my travel agency [plan-89904977] | Talk about my child's homework [plan-09fd7ef9] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*The room is cold topic is good for a hotel person, I'll start.* → `start-talking` · ok · 9s

**#2 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    How can I help you?
    Your turn
    Answer on your phone: speak or type.
    NowTell Ana what the problem is
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    How can I help you?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "How can I help you?"

*I don't know what to say, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    How can I help you?
    A little support
    Try: The room is very cold. Can you help, please?
    NowTell Ana what the problem is
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    How can I help you?
    A little support
    Try: The room is very cold. Can you help, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "How can I help you?"

*I don't know what to say, I will press help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    How can I help you?
    A little support
    Try: The room is very cold. Can you help, please?
    NowTell Ana what the problem is
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    How can I help you?
    A little support
    Try: The room is very cold. Can you help, please?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "How can I help you?"

*I don't know what to say, I need help again.* → `quiz` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A little support · recognition practice
    Ana says, 'Sorry. What is the problem?' What do you say?
    01
    The heater is broken. The room is cold.
    02
    I am happy with the room.
    A little support
    Try: The room is very cold. Can you help, please?
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    How can I help you?
    A little support
    Try: The room is very cold. Can you help, please?
    Ana says, 'Sorry. What is the problem?' What do you say?
    [button: The heater is broken. The room is cold.] [button: I am happy with the room.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "How can I help you?"

*I know the first one is right, the room is cold; I will choose it.* → `pick-phrase` option=0 · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    How can I help you?
    A little support
    Now use the idea in your own reply on the phone.
    NowTell Ana what the problem is
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    How can I help you?
    A little support
    Now use the idea in your own reply on the phone.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "How can I help you?"

*I know the problem, but I'm nervous; I'll try saying it in my own simple words.* → `answer` "Hello, I have a problem. The room is not clean and I want other room, please." · ok · 11s

**#7 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    I am sorry to hear that. Is the room cold?
    Your turn
    Answer on your phone: speak or type.
    NowTell Ana what the problem is
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    I am sorry to hear that. Is the room cold?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I am sorry to hear that. Is the room cold?"

*Is the room cold? No, it's not that; I'm not sure how to explain, so I need help.* → `cue` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    I am sorry to hear that. Is the room cold?
    Said more simply
    Sorry. Is the room cold?
    NowTell Ana what the problem is
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    I am sorry to hear that. Is the room cold?
    Said more simply
    Sorry. Is the room cold?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I am sorry to hear that. Is the room cold?"

*I don't know how to answer, I need help; the room is not cold, so I'll look at the help.* → `cue` · ok · 0s

**#9 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    I am sorry to hear that. Is the room cold?
    A way to start
    The heater does not work…
    NowTell Ana what the problem is
    [button: Choose a phrase] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    I am sorry to hear that. Is the room cold?
    A way to start
    The heater does not work…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I am sorry to hear that. Is the room cold?"

*I don't know how to say it, I need help with a sentence.* → `coach` · ok · 9s

**#10 linga-coach**

    TV
    Linga
    Petra
    A way into English
    One useful change
    You said I want other room
    One way to try it
    I want another room
    Your complaint and request are clear, and Ana understood the problem. One change: use 'another room', with 'an', because you are asking for one room.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    Your complaint and request are clear, and Ana understood the problem. One change: use 'another room', with 'an', because you are asking for one room.
    One way to try it: “I want another room”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your complaint and request are clear, and Ana understood the problem. One change: use 'another room', with 'an', because you are asking for one room."

*I understand a bit; I want to try again with the new word, so I'll replay.* → `replay` · ok · 8s

**#11 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    Thank you. Do you want to leave this room today, or wait?
    Your turn
    Answer on your phone: speak or type.
    NowTell Ana what the problem is
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    Thank you. Do you want to leave this room today, or wait?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    Ana · hotel front desk clerk
    Thank you. Do you want to leave this room today, or wait?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you. Do you want to leave this room today, or wait?"

*I heard it, so I try answering in my own words, slowly.* → `answer` "I want leave the room today, please. I want other room." · ok · 12s

**#12 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I want other room.
    Your line
    'Another' means one more room, a different one.
    A clue
    Say it again on your phone, your way. Or ask Linga to show you.
    [button: Show me] [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “I want other room.”
    Say it again, your way.
    'Another' means one more room, a different one.
    Your reply [text box]
    [button: Send reply (disabled)] [button: Show me] [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Another room, I see. Let me say it again.* → `answer` "I want another room, please." · ok · 0s

**#13 linga-moment**

    TV
    Linga
    Petra
    A way into English
    A moment
    You said I want other room.
    Your try
    I want another room, please.
    'Another' means one more room, a different one.
    You fixed “want another”
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    You fixed “want another”
    You said “I want other room.”
    Your try: “I want another room, please.”
    'Another' means one more room, a different one.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Good, I learned "another". Let me go back and carry on.* → `back` · ok · 8s

**#14 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    Good. What kind of room do you want, small or big?
    Your turn
    Answer on your phone: speak or type.
    NowTell Ana what the problem is
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    Good. What kind of room do you want, small or big?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    Ana · hotel front desk clerk
    Thank you. Do you want to leave this room today, or wait?
    You · spoken
    I want leave the room today, please. I want other room.
    Ana · hotel front desk clerk
    Okay, I can find you a new room. Is the room cold?
    Ana · hotel front desk clerk
    Good. What kind of room do you want, small or big?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good. What kind of room do you want, small or big?"

*I managed to ask for a room; I think that is good enough, I will finish.* → `answer` "A big room, please. Sorry, my English is not good." · ok · 8s

**#15 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    Don't worry, your English is fine. Is the heater broken?
    Your turn
    Answer on your phone: speak or type.
    NowTell Ana what the problem is
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Tell Ana what the problem is
    Don't worry, your English is fine. Is the heater broken?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    Ana · hotel front desk clerk
    Thank you. Do you want to leave this room today, or wait?
    You · spoken
    I want leave the room today, please. I want other room.
    Ana · hotel front desk clerk
    Okay, I can find you a new room. Is the room cold?
    Ana · hotel front desk clerk
    Good. What kind of room do you want, small or big?
    You · spoken
    A big room, please. Sorry, my English is not good.
    Ana · hotel front desk clerk
    Don't worry, your English is fine. Is the heater broken?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Don't worry, your English is fine. Is the heater broken?"

*The heater is fine, only room is not clean; I'll explain simply.* → `answer` "No, the heater is not broken. The room is just not clean. Sorry." · ok · 13s

**#16 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    I am sorry about that. Do you want a new room, or a clean room now?
    Your turn
    Answer on your phone: speak or type.
    NowSay how it affects your sleep
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Say how it affects your sleep
    I am sorry about that. Do you want a new room, or a clean room now?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    Ana · hotel front desk clerk
    Thank you. Do you want to leave this room today, or wait?
    You · spoken
    I want leave the room today, please. I want other room.
    Ana · hotel front desk clerk
    Okay, I can find you a new room. Is the room cold?
    Ana · hotel front desk clerk
    Good. What kind of room do you want, small or big?
    You · spoken
    A big room, please. Sorry, my English is not good.
    Ana · hotel front desk clerk
    Don't worry, your English is fine. Is the heater broken?
    You · spoken
    No, the heater is not broken. The room is just not clean. Sorry.
    Ana · hotel front desk clerk
    I am sorry about that. Do you want a new room, or a clean room now?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I am sorry about that. Do you want a new room, or a clean room now?"

*I managed to explain the problem; a clean room now is what I want, then I can finish.* → `answer` "I want a new room, please. I can not sleep because the room is dirty and smell bad." · ok · 9s

**#17 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    I can move you today. Is one hour okay?
    Your turn
    Answer on your phone: speak or type.
    NowAgree on one next step
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Now: Agree on one next step
    I can move you today. Is one hour okay?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    Ana · hotel front desk clerk
    Thank you. Do you want to leave this room today, or wait?
    You · spoken
    I want leave the room today, please. I want other room.
    Ana · hotel front desk clerk
    Okay, I can find you a new room. Is the room cold?
    Ana · hotel front desk clerk
    Good. What kind of room do you want, small or big?
    You · spoken
    A big room, please. Sorry, my English is not good.
    Ana · hotel front desk clerk
    Don't worry, your English is fine. Is the heater broken?
    You · spoken
    No, the heater is not broken. The room is just not clean. Sorry.
    Ana · hotel front desk clerk
    I am sorry about that. Do you want a new room, or a clean room now?
    You · spoken
    I want a new room, please. I can not sleep because the room is dirty and smell bad.
    Ana · hotel front desk clerk
    I can move you today. Is one hour okay?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I can move you today. Is one hour okay?"

*One hour is okay, I can agree to this and finish.* → `answer` "Yes, one hour is okay. Thank you very much." · ok · 6s

**#18 linga-talk**

    TV
    Linga
    Petra
    Ana · hotel front desk clerk
    A problem at the hotel front desk
    Ana says
    Good. I move you in one hour.
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A problem at the hotel front desk
    Tell Ana the problem, say how it affects you, and agree on one next step.
    Good. I move you in one hour.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Ana · hotel front desk clerk
    How can I help you?
    You · spoken
    Hello, I have a problem. The room is not clean and I want other room, please.
    Ana · hotel front desk clerk
    I am sorry to hear that. Is the room cold?
    Ana · hotel front desk clerk
    Thank you. Do you want to leave this room today, or wait?
    You · spoken
    I want leave the room today, please. I want other room.
    Ana · hotel front desk clerk
    Okay, I can find you a new room. Is the room cold?
    Ana · hotel front desk clerk
    Good. What kind of room do you want, small or big?
    You · spoken
    A big room, please. Sorry, my English is not good.
    Ana · hotel front desk clerk
    Don't worry, your English is fine. Is the heater broken?
    You · spoken
    No, the heater is not broken. The room is just not clean. Sorry.
    Ana · hotel front desk clerk
    I am sorry about that. Do you want a new room, or a clean room now?
    You · spoken
    I want a new room, please. I can not sleep because the room is dirty and smell bad.
    Ana · hotel front desk clerk
    I can move you today. Is one hour okay?
    You · spoken
    Yes, one hour is okay. Thank you very much.
    Ana · hotel front desk clerk
    Good. I move you in one hour.
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good. I move you in one hour."

*I managed to get a new room, I feel good, let me see the result.* → `finish` · ok · 0s

**#19 linga-recap**

    TV
    Linga
    Petra
    A way into English
    Your rehearsal
    You said I want other room
    One way to try it
    I want another room
    Your complaint and request are clear, and Ana understood the problem. One change: use 'another room', with 'an', because you are asking for one room.
    Your mission
    Choose a fresh context for your next conversation.
    6 spoken · 0 written replies · 4 on your own · 2 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “The heater is broken. The room is cold.”
    From this rehearsal
    “I want other room.” → “I want another room.”
    'Another' means one more room, a different one.
    Tried again: “A big room, please. Sorry, my English is not good.”
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    Find my hotel booking
    Give your name and dates and get your booking found.
    [button: Start talking]
    Or choose a situation [list: Tell the hotel my room is cold [plan-42efc56e] | Find my hotel booking [plan-56f052ab] | Ask the way to the bus stop [plan-997fc57b] | Ask for a good place to eat [plan-9dd32920] | Answer a call from my travel agency [plan-89904977] | Talk about my child's homework [plan-09fd7ef9] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed to ask for another room, so I am happy to stop now.* → `done` · observed (not acted on) · 0s

</details>
