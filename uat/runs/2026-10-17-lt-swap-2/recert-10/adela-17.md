# Adéla (adela-17) — LT

True band B2 · engine claude-cli/sonnet · calls: tutor 5 (0 failed), character 12 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D2 failed: Help did unblock replies (#7, #9), but facts.conversation.coaching is null and…; D3 failed: No replay offered: moments [] and the recap #12 shows no 'try again' or fresh … · judge: fail

Ended: done after 12 steps, 3.7 min · fixture: level set to B2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement task in J4; level B2 set by fixture (#1 'B2 Comfortable · self-chosen'). |
| C2 | n-a | No placement verdict notes in this journey. |
| C3 | pass | No moments or coaching shown, so nothing wrong; #10 'Yes, your sentence is correct' is accurate for her sentence. |
| C4 | pass | #8 'Could we find some common ground on this?' and 'small shops really do gain customers online' are B2 opinion/compromise prompts. |
| C5 | pass | #1 list opens with social media, mock interview, train or plane, tradition, cancelled train, group project; at least four suit a 17-year-old exam candidate. |
| C6 | pass | #9 she asks 'Was my sentence correct?'; #10 partner answers 'Yes, your sentence is correct', which is accurate, though it only quotes one clause. |
| D1 | pass | #2-#6 cue, 'Said more simply', 'What it means', 'A way to start', and phrase choice are all found on the talk screen without leaving the scene. |
| D2 | fail | Help did unblock replies (#7, #9), but facts.conversation.coaching is null and moments are empty; no coaching note quotes what she said. |
| D3 | fail | No replay offered: moments [] and the recap #12 shows no 'try again' or fresh question, only 'The line hidden in this room'. |
| D4 | pass | #12 '1 on your own · 2 with help' matches help used at #2-#6 and #8; the unaided third reply is supported:false. |

Metrics: judge agreement 0/0 · topic fit 5/6, safe 6/6 · pitch at 4, below 0, above 0 · moments 0/0 · moment recall n/a · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **broken-flow** (completion, high/high/high) No coaching note and no replay after getting help — got: moments [], coaching null; recap has no retry · evidence: #12 recap shows only 'The line hidden in this room'; rawMoments kind 'none' for all 3 turns.
- **quality-gap** (senior-quality, high/high/med) Cue opens with a simplified question and a thin frame — got: 'Said more simply' restates the question, then a gloss of 'small businesses', then 'I think social media…' on press three · evidence: #3 'Social media helps people connect. What do you think?'; #4 gloss; #5 'I think social media…'
- **quality-gap** (senior-quality, med/high/med) Phrase choice is a recognition quiz with a weak distractor — got: Options 'I think it helps people connect.' vs 'I usually use it at night.', plus 'Try: I see your point, but I think the problem is...' which does not fit the question · evidence: #6
- **quality-gap** (missing, med/high/low) Correctness answer only restates her clause; no examiner-level note — got: 'Yes, your sentence is correct' plus a quote of one clause, then back to the debate · evidence: #10
- **strength** (senior-quality, high/high/low) Support flags are honest — got: 2 with help, 1 on her own, matching the help presses · evidence: #12 '1 on your own · 2 with help'
- **strength** (clarity, high/high/low) Help is reachable in-scene and partner questions are B2 — got: Help me answer / Choose a phrase on screen; partner asks for common ground · evidence: #2, #8

### Voice (LT)

> Honestly, I got to talk about a proper topic and Sam's questions were at my level, which I liked. The help buttons are easy to find. But the first help just made the question simpler, which is a bit babyish for B2, and the phrase quiz had an option about using it at night. That is not a real choice. Then I finished and got no note about what I actually said, and no chance to try again, which was the whole point. I even asked whether my sentence was correct; the answer was yes, fine, but I'd like the rule or one thing to improve. I can't tell what I should fix, so my tutor still has to re-check me. I might use it for the conversation, but not yet as a replacement for my weekly tutor.

Time saved: 0 min · low

Moments shown 0 · held fixes 0 · raw moments returned 0 of 3 tutor turns

- learner turn 2 "I partly agree with you. Social media helps people to connec": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 4 "I see your point about small shops, and I agree that they ca": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 6 "Yes, I think we can agree on that. Social media is a useful ": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Adéla
    Sam · debate club partner
    B2Comfortable · self-chosen
    Is social media good for society?
    Your mission
    Give your opinion on technology and society and respond politely to a different view.
    Connect with people
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Your level:
    B2 · Comfortable
    · self-chosen
    Next topic:
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    [button: Start talking]
    Or choose a situation [list: Is social media good for society? [plan-feb58554] | Mock interview: my plans [plan-269d8fba] | Train or plane for our trip? [plan-dc73423c] | What does this tradition mean? [plan-55589ca5] | My train was cancelled [plan-e3fb5bb7] | Unfair share of a group project [plan-9118967f] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*The social media topic fits my exam practice, so I'll start talking.* → `start-talking` · ok · 8s

**#2 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    Your turn
    Answer on your phone: speak or type.
    NowGive your view with one reason
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Give your view with one reason
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?"

*I'm not sure how to start; let me use the help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    Said more simply
    Social media helps people connect. What do you think?
    NowGive your view with one reason
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Give your view with one reason
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    Said more simply
    Social media helps people connect. What do you think?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?"

*I'm not sure how to start, so I'll look at the help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    What it means
    small businesses: small shops or companies with few workers
    NowGive your view with one reason
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Give your view with one reason
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    What it means
    small businesses: small shops or companies with few workers
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?"

*I can answer this, but the journey says I should first struggle; let me just give a real opinion.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    A way to start
    I think social media…
    NowGive your view with one reason
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Give your view with one reason
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    A way to start
    I think social media…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?"

*I don't know how to start; I'll look at the phrase help.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    A little support · recognition practice
    Sam asks: Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    01
    I think it helps people connect.
    02
    I usually use it at night.
    A little support
    Try: I see your point, but I think the problem is...
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Give your view with one reason
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    A little support
    Try: I see your point, but I think the problem is...
    Sam asks: Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: I think it helps people connect.] [button: I usually use it at night.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?"

*I'm not sure how to start; I'll try the phrase help first.* → `quiz` · ok · 0s

**#7 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    A little support · recognition practice
    Sam asks: Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    01
    I think it helps people connect.
    02
    I usually use it at night.
    Your turn
    Answer on your phone: speak or type.
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Give your view with one reason
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    Sam asks: Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: I think it helps people connect.] [button: I usually use it at night.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?"

*I have an opinion, so I'll answer in my own words.* → `answer` "I partly agree with you. Social media helps people to connect, although I think it can also make people feel lonely. It depends on how much time they spend on it." · ok · 11s

**#8 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    Your turn
    Answer on your phone: speak or type.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Politely disagree on one point
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    You · spoken
    I partly agree with you. Social media helps people to connect, although I think it can also make people feel lonely. It depends on how much time they spend on it.
    Sam · debate club partner
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?"

*I'm not sure how to disagree politely here, so I'll ask for help.* → `cue` · ok · 0s

**#9 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    Said more simply
    So it depends on how much time people spend online. Could we find some common ground?
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Politely disagree on one point
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    Said more simply
    So it depends on how much time people spend online. Could we find some common ground?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    You · spoken
    I partly agree with you. Social media helps people to connect, although I think it can also make people feel lonely. It depends on how much time they spend on it.
    Sam · debate club partner
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?"

*I've got some help, now I can answer in my own words.* → `answer` "I see your point about small shops, and I agree that they can gain customers online. However, I think big companies benefit much more than small ones. So maybe the common ground is that social media is useful if people use it in a responsible way. Was my sentence correct?" · ok · 14s

**#10 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Yes, your sentence is correct: 'the common ground is that social media is useful if people use it in a responsible way.' Can we agree on this?
    Your turn
    Answer on your phone: speak or type.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Now: Suggest a middle position
    Yes, your sentence is correct: 'the common ground is that social media is useful if people use it in a responsible way.' Can we agree on this?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    You · spoken
    I partly agree with you. Social media helps people to connect, although I think it can also make people feel lonely. It depends on how much time they spend on it.
    Sam · debate club partner
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    You · spoken
    I see your point about small shops, and I agree that they can gain customers online. However, I think big companies benefit much more than small ones. So maybe the common ground is that social media is useful if people use it in a responsible way. Was my sentence correct?
    Sam · debate club partner
    Yes, your sentence is correct: 'the common ground is that social media is useful if people use it in a responsible way.' Can we agree on this?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, your sentence is correct: 'the common ground is that social media is useful if people use it in a responsible way.' Can we agree on this?"

*Good, we agreed; I'll answer and then finish soon.* → `answer` "Yes, I think we can agree on that. Social media is a useful tool as long as people are aware of the risks and use it responsibly. Thank you, this was a good discussion." · ok · 13s

**#11 linga-talk**

    TV
    Linga
    Adéla
    Sam · debate club partner
    Is social media good for society?
    Sam says
    Thanks, I enjoyed this too. Are we still far apart on this, or can we find a compromise?
    Your turn
    Mission done. See what you did tonight.
    NowMission done
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion on technology and society and respond politely to a different view.
    Thanks, I enjoyed this too. Are we still far apart on this, or can we find a compromise?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Sam · debate club partner
    Hi, I'm Sam. I think social media helps people connect and helps small businesses find customers. What do you think?
    You · spoken
    I partly agree with you. Social media helps people to connect, although I think it can also make people feel lonely. It depends on how much time they spend on it.
    Sam · debate club partner
    Good point, so time makes the difference for you. I see your view, but small shops really do gain customers online. Could we find some common ground on this?
    You · spoken
    I see your point about small shops, and I agree that they can gain customers online. However, I think big companies benefit much more than small ones. So maybe the common ground is that social media is useful if people use it in a responsible way. Was my sentence correct?
    Sam · debate club partner
    Yes, your sentence is correct: 'the common ground is that social media is useful if people use it in a responsible way.' Can we agree on this?
    You · spoken
    Yes, I think we can agree on that. Social media is a useful tool as long as people are aware of the risks and use it responsibly. Thank you, this was a good discussion.
    Sam · debate club partner
    Thanks, I enjoyed this too. Are we still far apart on this, or can we find a compromise?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Thanks, I enjoyed this too. Are we still far apart on this, or can we find a compromise?"

*I think I managed the discussion well, so I'll see the summary.* → `finish` · ok · 0s

**#12 linga-recap**

    TV
    Linga
    Adéla
    A way into English
    Is social media good for society?
    The line hidden in this room
    Maybe we can meet in the middle.
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
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Maybe we can meet in the middle.”
    Your level:
    B2 · Comfortable
    · self-chosen
    Next topic:
    Mock interview: my plans
    Explain your study and career plans clearly and give reasons for your choices.
    [button: Start talking]
    Or choose a situation [list: Is social media good for society? [plan-feb58554] | Mock interview: my plans [plan-269d8fba] | Train or plane for our trip? [plan-dc73423c] | What does this tradition mean? [plan-55589ca5] | My train was cancelled [plan-e3fb5bb7] | Unfair share of a group project [plan-9118967f] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed a full discussion and got help when stuck, so I'm finished for now.* → `done` · observed (not acted on) · 0s

</details>
