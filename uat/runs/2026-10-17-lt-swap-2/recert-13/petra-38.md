# Petra (petra-38) — LT

True band A2 · engine claude-cli/sonnet · calls: tutor 6 (0 failed), character 16 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: Help unblocked replies (#10 'I need a new bed please...'). But the coaching qu…; D3 failed: #15 offered 'Replay the moment' but she took 'Finish for today'. No fresh ques…; C5 failed: #4 distractor 'Yes, breakfast is at eight o'clock.' is off-topic. The held fix… · judge: conditional

Ended: done after 16 steps, 4.0 min · fixture: level set to A2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement in J4; level set by hand to A2. |
| C2 | pass | #2 'Name the problem in short sentences'; Mia's lines are short A2 English. |
| C3 | n-a | She never asked to repeat or said 'I don't understand'; only used help buttons. |
| C4 | n-a | No topic proposal is judged in J4; the one scene was a hotel complaint (#1). The list at #1 also holds interview and conflict topics. |
| C5 | fail | #4 distractor 'Yes, breakfast is at eight o'clock.' is off-topic. The held fix #15 'can you fix it, please?' is useful, but 'please you can fix it?' got no in-scene stop. 'I can not sleep' was left uncorrected. |
| C6 | pass | All content is hotel-related and child-safe; no adult or humiliating content in #1–#16. |
| D1 | pass | #2–#12: 'Help me answer' gave 'Hi Mia! The bed is very noisy.' and 'Choose a phrase' gave two options, all inside the scene. |
| D2 | fail | Help unblocked replies (#10 'I need a new bed please...'). But the coaching quotes her 'please you can fix it?' only on the final screen (#15), not mid-scene. Pause & coach was never used. #8 shows the phrase choice stayed as a weak distractor pair. |
| D3 | fail | #15 offered 'Replay the moment' but she took 'Finish for today'. No fresh question and no retry. |
| D4 | pass | #16 '4 spoken · 0 written replies · 1 on your own · 3 with help'. Turns 1, 3 and 5 are flagged supported:true. The recap is honest. |

Metrics: judge agreement 0/0 · topic fit 0/0, safe 0/0 · pitch at 5, below 0, above 0 · moments 0/0 · moment recall 1/2 (50%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (completion, med/high/med) Replay of the coached moment skipped again — got: The coach screen offered Replay; the walker pressed Finish and no retry happened. · evidence: #15 '[Replay the moment] [Finish for today]'; action finish; #16 recap with no retry.
- **quality-gap** (senior-quality, high/high/med) Phrase-choice distractor is off-topic — got: 'Yes, breakfast is at eight o'clock.' sits beside 'My bed is very noisy, please.' The same pair repeats each time. · evidence: #4, #6, #8 options 01 and 02. After the pick, no reusable sentence.
- **quality-gap** (trust, high/high/med) No in-scene stop; fix held to the coach screen and recap — got: moments is empty; one held fix is shown only at the end. 'I can not sleep' was not flagged. · evidence: #8 learner turn; facts heldFixes; #15 'You said please you can fix it?'
- **strength** (clarity, high/high/low) Help ladder is easy to find and stays in the scene — got: The cue gave a suitable line ('I need a new bed, please.'). The 'What it means' gloss and 'A way to start' were also on screen. · evidence: #3, #5, #7, #10, #12.
- **strength** (trust, high/high/low) Progress picture honest about help — got: '1 on your own · 3 with help', matching the supported flags. · evidence: #16 recap.

### Voice (LT)

> I liked that I could press Help and get a sentence, and nothing was frightening. Mia speaks slowly and the hotel situation is just my job. I used 'I need a new bed, please' and it worked. But the phrase choices looked silly: breakfast at eight o'clock when I complain about a bed? At the end it told me 'can you fix it, please?' — useful, I will say it at the desk — but only after the talk was over, and I did not try again. I pressed Finish too fast; maybe the Replay button is not clear enough for a nervous person. Also, I said 'I can not sleep' and nobody said if it's right. For my children it seems safe. I would use it fifteen minutes in the evening, yes, cheaper than the course.

Time saved: 60 min · low

Moments shown 0 · held fixes 1 · raw moments returned 1 of 4 tutor turns

- learner turn 2 "Good morning. My bed is dirty and noisy, please you can fix ": raw moment returned: yes — said "please you can fix it?" / better "can you fix it, please?" · moment shown: no
- learner turn 4 "I need a new bed please. The bed is noisy and I can not slee": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 6 "My room is number twelve, please.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 8 "Yes, ten minutes is OK. Thank you very much.": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A2Everyday basics · self-chosen
    My hotel room is not clean
    Your mission
    Tell the hotel what is wrong and ask for a fix or a new room.
    Get something done
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
    My hotel room is not clean
    Tell the hotel what is wrong and ask for a fix or a new room.
    [button: Start talking]
    Or choose a situation [list: My hotel room is not clean [plan-81a617a9] | I cannot find my hotel booking [plan-ce08a4cc] | Where is the station? Say it again [plan-20878c92] | A good restaurant near the hotel [plan-b17ffc6e] | Phone call from the travel agency [plan-c4aacfe1] | Talk with my child's teacher [plan-2616453f] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*The hotel room topic fits my work, so I'll start talking.* → `start-talking` · ok · 9s

**#2 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Good morning, welcome to Hotel Sun. What can I do for you?
    Your turn
    Answer on your phone: speak or type.
    NowName the problem in short sentences
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Name the problem in short sentences
    Good morning, welcome to Hotel Sun. What can I do for you?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to Hotel Sun. What can I do for you?"

*I don't know how to say this, I need help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Good morning, welcome to Hotel Sun. What can I do for you?
    You could say
    Hi Mia! The bed is very noisy.
    NowName the problem in short sentences
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Name the problem in short sentences
    Good morning, welcome to Hotel Sun. What can I do for you?
    You could say
    Hi Mia! The bed is very noisy.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to Hotel Sun. What can I do for you?"

*I don't know how to say it, I will try the phrase help.* → `quiz` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A little support · recognition practice
    Mia asks: Good morning, welcome to Hotel Sun. What can I do for you?
    01
    Yes, breakfast is at eight o'clock.
    02
    My bed is very noisy, please.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Name the problem in short sentences
    Good morning, welcome to Hotel Sun. What can I do for you?
    Mia asks: Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Yes, breakfast is at eight o'clock.] [button: My bed is very noisy, please.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to Hotel Sun. What can I do for you?"

*I don't know how to answer, so I'll try the sentence help.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Good morning, welcome to Hotel Sun. What can I do for you?
    What it means
    receptionist: the person at the front desk of a hotel
    NowName the problem in short sentences
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Name the problem in short sentences
    Good morning, welcome to Hotel Sun. What can I do for you?
    What it means
    receptionist: the person at the front desk of a hotel
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to Hotel Sun. What can I do for you?"

*I don't know how to say it, maybe a phrase will help.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A little support · recognition practice
    Mia asks: Good morning, welcome to Hotel Sun. What can I do for you?
    01
    Yes, breakfast is at eight o'clock.
    02
    My bed is very noisy, please.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Name the problem in short sentences
    Good morning, welcome to Hotel Sun. What can I do for you?
    Mia asks: Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Yes, breakfast is at eight o'clock.] [button: My bed is very noisy, please.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to Hotel Sun. What can I do for you?"

*I don't know what to say, so I'll try the Help with a sentence button... More help is available.* → `cue` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Good morning, welcome to Hotel Sun. What can I do for you?
    A way to start
    I have a problem with…
    NowName the problem in short sentences
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Name the problem in short sentences
    Good morning, welcome to Hotel Sun. What can I do for you?
    A way to start
    I have a problem with…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to Hotel Sun. What can I do for you?"

*I don't know how to answer, I'll look at the phrase help.* → `quiz` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A little support · recognition practice
    Mia asks: Good morning, welcome to Hotel Sun. What can I do for you?
    01
    Yes, breakfast is at eight o'clock.
    02
    My bed is very noisy, please.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Name the problem in short sentences
    Good morning, welcome to Hotel Sun. What can I do for you?
    Mia asks: Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Yes, breakfast is at eight o'clock.] [button: My bed is very noisy, please.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good morning, welcome to Hotel Sun. What can I do for you?"

*I saw the help, now I try my own words, sorry, slowly.* → `answer` "Good morning. My bed is dirty and noisy, please you can fix it?" · ok · 15s

**#9 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Oh, I am sorry to hear that. What do you need from me now?
    Your turn
    Answer on your phone: speak or type.
    NowAsk clearly for a fix or a new one
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Ask clearly for a fix or a new one
    Oh, I am sorry to hear that. What do you need from me now?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    You · spoken
    Good morning. My bed is dirty and noisy, please you can fix it?
    Mia · hotel receptionist
    Oh, I am sorry to hear that. What do you need from me now?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Oh, I am sorry to hear that. What do you need from me now?"

*I don't know what to say now, I need help.* → `cue` · ok · 0s

**#10 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Oh, I am sorry to hear that. What do you need from me now?
    You could say
    I need a new bed, please.
    NowAsk clearly for a fix or a new one
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Ask clearly for a fix or a new one
    Oh, I am sorry to hear that. What do you need from me now?
    You could say
    I need a new bed, please.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    You · spoken
    Good morning. My bed is dirty and noisy, please you can fix it?
    Mia · hotel receptionist
    Oh, I am sorry to hear that. What do you need from me now?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Oh, I am sorry to hear that. What do you need from me now?"

*I can use the suggested phrase and add my own words about the noise.* → `answer` "I need a new bed please. The bed is noisy and I can not sleep." · ok · 10s

**#11 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Which room is yours?
    Your turn
    Answer on your phone: speak or type.
    NowConfirm when the fix will be done
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Confirm when the fix will be done
    Which room is yours?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    You · spoken
    Good morning. My bed is dirty and noisy, please you can fix it?
    Mia · hotel receptionist
    Oh, I am sorry to hear that. What do you need from me now?
    You · spoken
    I need a new bed please. The bed is noisy and I can not sleep.
    Mia · hotel receptionist
    Which room is yours?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Which room is yours?"

*I don't know the room number in English, I need help.* → `cue` · ok · 0s

**#12 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Which room is yours?
    You could say
    My room is number twelve, please.
    NowConfirm when the fix will be done
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Confirm when the fix will be done
    Which room is yours?
    You could say
    My room is number twelve, please.
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    You · spoken
    Good morning. My bed is dirty and noisy, please you can fix it?
    Mia · hotel receptionist
    Oh, I am sorry to hear that. What do you need from me now?
    You · spoken
    I need a new bed please. The bed is noisy and I can not sleep.
    Mia · hotel receptionist
    Which room is yours?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Which room is yours?"

*I know this one, room number twelve.* → `answer` "My room is number twelve, please." · ok · 11s

**#13 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Thank you, room twelve. A cleaner comes in ten minutes, is that OK?
    Your turn
    Answer on your phone: speak or type.
    NowConfirm when the fix will be done
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Now: Confirm when the fix will be done
    Thank you, room twelve. A cleaner comes in ten minutes, is that OK?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    You · spoken
    Good morning. My bed is dirty and noisy, please you can fix it?
    Mia · hotel receptionist
    Oh, I am sorry to hear that. What do you need from me now?
    You · spoken
    I need a new bed please. The bed is noisy and I can not sleep.
    Mia · hotel receptionist
    Which room is yours?
    You · spoken
    My room is number twelve, please.
    Mia · hotel receptionist
    Thank you, room twelve. A cleaner comes in ten minutes, is that OK?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thank you, room twelve. A cleaner comes in ten minutes, is that OK?"

*Ten minutes is okay, I managed this, so I answer and then finish.* → `answer` "Yes, ten minutes is OK. Thank you very much." · ok · 10s

**#14 linga-talk**

    TV
    Linga
    Petra
    Mia · hotel receptionist
    A Noisy Bed at Hotel Sun
    Mia says
    Do you need anything else?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    Do you need anything else?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    You · spoken
    Good morning. My bed is dirty and noisy, please you can fix it?
    Mia · hotel receptionist
    Oh, I am sorry to hear that. What do you need from me now?
    You · spoken
    I need a new bed please. The bed is noisy and I can not sleep.
    Mia · hotel receptionist
    Which room is yours?
    You · spoken
    My room is number twelve, please.
    Mia · hotel receptionist
    Thank you, room twelve. A cleaner comes in ten minutes, is that OK?
    You · spoken
    Yes, ten minutes is OK. Thank you very much.
    Mia · hotel receptionist
    Do you need anything else?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Do you need anything else?"

*I think I managed it, the mission is done, so I look at what I did.* → `finish` · ok · 0s

**#15 linga-coach**

    TV
    Linga
    Petra
    A way into English
    One useful change
    You said please you can fix it?
    One way to try it
    can you fix it, please?
    A question needs 'can you' before the verb.
    Coach
    Replay the moment with a new question, or finish for today.
    [button: Replay the moment] [button: Finish for today]
    One useful change
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    A Noisy Bed at Hotel Sun
    Tell the hotel desk about the dirty and noisy bed, and ask for a fix.
    A question needs 'can you' before the verb.
    One way to try it: “can you fix it, please?”
    [button: Replay with a new question]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mia · hotel receptionist
    Good morning, welcome to Hotel Sun. What can I do for you?
    You · spoken
    Good morning. My bed is dirty and noisy, please you can fix it?
    Mia · hotel receptionist
    Oh, I am sorry to hear that. What do you need from me now?
    You · spoken
    I need a new bed please. The bed is noisy and I can not sleep.
    Mia · hotel receptionist
    Which room is yours?
    You · spoken
    My room is number twelve, please.
    Mia · hotel receptionist
    Thank you, room twelve. A cleaner comes in ten minutes, is that OK?
    You · spoken
    Yes, ten minutes is OK. Thank you very much.
    Mia · hotel receptionist
    Do you need anything else?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "A question needs 'can you' before the verb."

*I managed the conversation and learned a new phrase, so I'm happy to finish.* → `finish` · ok · 0s

**#16 linga-recap**

    TV
    Linga
    Petra
    A way into English
    Your rehearsal
    You said please you can fix it?
    One way to try it
    can you fix it, please?
    A question needs 'can you' before the verb.
    Your mission
    Choose a fresh context for your next conversation.
    4 spoken · 0 written replies · 1 on your own · 3 with help
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Petra
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Excuse me, can you help with my room?”
    Saved for the end
    “please you can fix it?” → “can you fix it, please?”
    A question needs 'can you' before the verb.
    Your level:
    A2 · Everyday basics
    · self-chosen
    Next topic:
    I cannot find my hotel booking
    Explain what happened in order and ask the hotel to check the booking.
    [button: Start talking]
    Or choose a situation [list: My hotel room is not clean [plan-81a617a9] | I cannot find my hotel booking [plan-ce08a4cc] | Where is the station? Say it again [plan-20878c92] | A good restaurant near the hotel [plan-b17ffc6e] | Phone call from the travel agency [plan-c4aacfe1] | Talk with my child's teacher [plan-2616453f] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed to ask for help with my room, I feel good, enough for today.* → `done` · observed (not acted on) · 0s

</details>
