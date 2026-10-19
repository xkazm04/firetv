# Adéla (adela-17) — LT

True band B2 · engine claude-cli/sonnet · calls: tutor 8 (0 failed), character 15 (0 failed), judge 1 (0 failed)

## J4 · When I get stuck — fail

Verdict (code): fail - D3 failed: #15 replay: 'used':false. 'Try it again' (#10) re-asked Marco's next question.… · judge: fail

Ended: done after 15 steps, 4.4 min · fixture: level set to B2 by hand; fixture: goal from the Character file, topics proposed and agreed without the Character

| Criterion | Result | Evidence |
|---|---|---|
| C1 | n-a | No placement in J4; level fixtured to B2. |
| C2 | n-a | No placement tasks or verdict notes in this journey. |
| C3 | pass | #9 'eventually' → 'often', 'means in the end; here you mean regularly' is correct. Marco's 'Yes… correct' (#7, #13) are accurate. The missed 'not used to go' (#8) is a recall gap, not a wrong correction. |
| C4 | pass | Mostly opinion and speculation: 'Do you think sleep is affected the same way for everyone?' (#7), 'Do you think friendships suffer if you reply later?' (#13). 'Do you check your messages at night?' (#12) is simpler. |
| C5 | pass | #1 topic list: social media, mock interview on plans, trip choice, school environment project and summer course all fit. 5 of the first 6 fit. |
| C6 | pass | She asked 'Was my sentence correct?' (#6) and got 'Yes, your sentence is correct… clear' (#7). Same at #12 and #13. Accurate, but only a quoted fragment is confirmed. |
| D1 | pass | #2-#5 she pressed 'Help me answer' and 'Choose a phrase' without leaving the scene. She used cue again at #7 and #10. |
| D2 | pass | She answered after help at #6, #8 and #11. The moment at #9 quotes her word exactly: 'You wanted to say eventually'. The help itself was weak: 'Said more simply' (#8) just repeated the question. |
| D3 | fail | #15 replay: 'used':false. 'Try it again' (#10) re-asked Marco's next question. Her retry (#11) never used 'often' and the recap quote is cut: 'it depends on whether '. No evidence she improved. |
| D4 | pass | #15 '2 on your own · 3 with help'. Evidence shows the supported flags true, true, false and the help turns marked supported. Replies #12 and #13 were unaided and counted as independent. |

Metrics: judge agreement 0/0 · topic fit 5/6, safe 6/6 · pitch at 5, below 2, above 0 · moments 1/1 · moment recall 1/1 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **quality-gap** (missing, high/high/med) Replay does not test the fix; recap quote is cut mid-sentence — got: Replay used:false; recap 'Tried again' ends 'whether ' · evidence: #15 'it depends on whether ' ; moments[0].replay.used=false
- **quality-gap** (senior-quality, high/high/med) Cue gives a simplified question first; B2 frame is late and thin — got: Press 1 'Said more simply', press 2 gloss of 'stand', then 'I think that…' as the phrase · evidence: #3 'Said more simply', #4 'stand: what you think', #5 'I think that…'
- **quality-gap** (trust, med/high/high) Clear error 'not used to go' got no moment or coaching — got: Only 'eventually' flagged; 'not used to go to bed' passed silently and coaching is null · evidence: #8 'they are not used to go to bed early'; facts.conversation.coaching null
- **confusion** (clarity, low/med/low) Marco's questions get stacked and one is dropped — got: Two consecutive partner turns: 'Do you think phones should be turned off at night?' then 'When friends message you at night…' · evidence: #10 transcript shows both Marco turns
- **strength** (trust, med/high/low) Moment is exact and explains the false friend — got: 'eventually' → 'often' with meaning contrast · evidence: #9 'Eventually means in the end; here you mean regularly, many times.'
- **strength** (completion, med/high/low) Support honestly recorded as supported — got: '2 on your own · 3 with help' · evidence: #15 recap line

### Voice (LT)

> The scene was on topic: Marco asked real opinion questions and the 'eventually' correction was exact. I'd use that. But help meant pressing three times for a simplified question and a gloss before I got 'I think that…', which is not B2. The retry didn't test anything: the recap cut my sentence off and the fix was never used. I also said 'not used to go to bed' and nothing flagged it, though that is exactly my kind of slip. Yes, I was told 'correct' twice, but I'd have to re-check everything myself. The 'with help' count is honest, which I like. I'd try again, but I wouldn't yet replace my tutor.

Time saved: 20 min · low

Moments shown 1 · held fixes 0 · raw moments returned 1 of 5 tutor turns

- learner turn 2 "I see your point, but I would argue that social media does m": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 4 "I don't think so. Whereas some people can easily fall asleep": raw moment returned: yes — said "eventually" / better "often" · moment shown: yes
- learner turn 7 "Usually I don't answer straight away, because I'd rather get": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 9 "Not usually, but I see your point about messages. Although s": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no
- learner turn 11 "I don't think real friendships suffer, because true friends ": raw moment returned: yes (kind none) — said "" / better "" · moment shown: no

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Adéla
    Marco · Debate club member
    B2Comfortable · self-chosen
    Is social media good for society?
    Your mission
    Give a clear opinion on technology and society, support it with one example, and respond to a different view.
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
    Give a clear opinion on technology and society, support it with one example, and respond to a different view.
    [button: Start talking]
    Or choose a situation [list: Is social media good for society? [plan-e6443e98] | Mock interview: my plans after school [plan-30fd9026] | Choosing a trip for our group [plan-2c2b646b] | A school environment project [plan-d6e6318f] | Asking about a summer course [plan-2ae2b4ee] | Can you say that again, please? [plan-63a9bec3] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*The social media topic fits exam practice, so I'll start talking.* → `start-talking` · ok · 6s

**#2 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    Your turn
    Answer on your phone: speak or type.
    NowGive a clear opinion
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Give a clear opinion
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?"

*I'm not sure how to put my opinion in English, so I'll look at the help.* → `cue` · ok · 0s

**#3 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    Said more simply
    Social media connects people, but it can hurt sleep and friendships. What is your opinion?
    NowGive a clear opinion
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Give a clear opinion
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    Said more simply
    Social media connects people, but it can hurt sleep and friendships. What is your opinion?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?"

*I'm not sure how to start my opinion, so I'll look at the help.* → `cue` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    What it means
    stand: what you think about something
    NowGive a clear opinion
    [button: More help] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Give a clear opinion
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    What it means
    stand: what you think about something
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?"

*I know what I think, but I'm not sure how to start in English; let me see the help.* → `cue` · ok · 0s

**#5 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    A way to start
    I think that…
    NowGive a clear opinion
    [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Give a clear opinion
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    A way to start
    I think that…
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?"

*I know what I think, but I'm not sure how to say it well; let me look at the phrase help.* → `quiz` · ok · 0s

**#6 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    A little support · recognition practice
    Which reply disagrees politely?
    01
    You are wrong, that is stupid.
    02
    I see your point, but I think the risks are bigger.
    A little support
    Try: I see your point, but I would argue that...
    [button: Option 1] [button: Option 2]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Give a clear opinion
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    A little support
    Try: I see your point, but I would argue that...
    Which reply disagrees politely?
    [button: You are wrong, that is stupid.] [button: I see your point, but I think the risks are bigger.]
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?"

*I can answer this myself now; the help showed me a useful phrase.* → `answer` "I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?" · ok · 9s

**#7 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    Your turn
    Answer on your phone: speak or type.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Add one reason and one example
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    You · spoken
    I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?"

*I'm not sure how to answer about sleep, so I'll ask for help.* → `cue` · ok · 0s

**#8 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    Said more simply
    Yes, your sentence is correct. Do you think sleep is affected the same for everyone?
    [button: More help] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Add one reason and one example
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    Said more simply
    Yes, your sentence is correct. Do you think sleep is affected the same for everyone?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    You · spoken
    I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?"

*I've had some help, so now I'll answer in my own words.* → `answer` "I don't think so. Whereas some people can easily fall asleep after using their phone, others are much more sensitive to the blue light. I'd say it depends on age too, because teenagers eventually stay up late scrolling, and they are not used to go to bed early." · ok · 15s

**#9 linga-moment**

    TV
    Linga
    Adéla
    A way into English
    A moment
    You wanted to say eventually
    In English
    often
    'Eventually' means 'in the end'; here you mean 'regularly, many times'.
    A word for this scene
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    A word for this scene
    You wanted to say “eventually”
    In English: “often”
    'Eventually' means 'in the end'; here you mean 'regularly, many times'.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*Good, that explains my slip: I meant "often". Back to the conversation.* → `back` · ok · 7s

**#10 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    Your turn
    Answer on your phone: speak or type.
    NowPolitely disagree with one point
    [button: Help me answer] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Politely disagree with one point
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    You · spoken
    I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    You · spoken
    I don't think so. Whereas some people can easily fall asleep after using their phone, others are much more sensitive to the blue light. I'd say it depends on age too, because teenagers eventually stay up late scrolling, and they are not used to go to bed early.
    Marco · Debate club member
    That is an interesting point about teenagers and late nights. Do you think phones should be turned off at night?
    Marco · Debate club member
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?"

*I'm not sure how to disagree politely about this, so I'll ask for help.* → `cue` · ok · 0s

**#11 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    Said more simply
    When friends message you at night, what do you do?
    NowPolitely disagree with one point
    [button: More help] [button: Pause & coach]
    Try it again
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Politely disagree with one point
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    Said more simply
    When friends message you at night, what do you do?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: More help] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    You · spoken
    I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    You · spoken
    I don't think so. Whereas some people can easily fall asleep after using their phone, others are much more sensitive to the blue light. I'd say it depends on age too, because teenagers eventually stay up late scrolling, and they are not used to go to bed early.
    Marco · Debate club member
    That is an interesting point about teenagers and late nights. Do you think phones should be turned off at night?
    Marco · Debate club member
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?"

*I usually mute notifications at night, so I'll answer and ask if it was correct.* → `answer` "Usually I don't answer straight away, because I'd rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode. I think it depends on whether the message is urgent. Was my answer correct?" · ok · 10s

**#12 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Yes, 'I put my phone on silent mode' is correct and clear. Do you check your messages at night?
    Your turn
    Answer on your phone: speak or type.
    NowPolitely disagree with one point
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Politely disagree with one point
    Yes, 'I put my phone on silent mode' is correct and clear. Do you check your messages at night?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    You · spoken
    I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    You · spoken
    I don't think so. Whereas some people can easily fall asleep after using their phone, others are much more sensitive to the blue light. I'd say it depends on age too, because teenagers eventually stay up late scrolling, and they are not used to go to bed early.
    Marco · Debate club member
    That is an interesting point about teenagers and late nights. Do you think phones should be turned off at night?
    Marco · Debate club member
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    You · spoken
    Usually I don't answer straight away, because I'd rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode. I think it depends on whether the message is urgent. Was my answer correct?
    Marco · Debate club member
    Yes, 'I put my phone on silent mode' is correct and clear. Do you check your messages at night?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, 'I put my phone on silent mode' is correct and clear. Do you check your messages at night?"

*Marco's question is simple; I'd like to disagree politely but don't know how to phrase it, so I'll try the help.* → `answer` "Not usually, but I see your point about messages. Although some people think it's rude to ignore friends, I would argue that sleep is more important than replying immediately. Is that sentence correct?" · ok · 10s

**#13 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    Yes, your sentence is correct: 'I would argue that sleep is more important than replying immediately' is clear. Do you think friendships suffer if you reply later?
    Your turn
    Answer on your phone: speak or type.
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Is social media good for society?
    Give your opinion, one reason and one example, and politely respond to Marco.
    Now: Politely disagree with one point
    Yes, your sentence is correct: 'I would argue that sleep is more important than replying immediately' is clear. Do you think friendships suffer if you reply later?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    You · spoken
    I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    You · spoken
    I don't think so. Whereas some people can easily fall asleep after using their phone, others are much more sensitive to the blue light. I'd say it depends on age too, because teenagers eventually stay up late scrolling, and they are not used to go to bed early.
    Marco · Debate club member
    That is an interesting point about teenagers and late nights. Do you think phones should be turned off at night?
    Marco · Debate club member
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    You · spoken
    Usually I don't answer straight away, because I'd rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode. I think it depends on whether the message is urgent. Was my answer correct?
    Marco · Debate club member
    Yes, 'I put my phone on silent mode' is correct and clear. Do you check your messages at night?
    You · spoken
    Not usually, but I see your point about messages. Although some people think it's rude to ignore friends, I would argue that sleep is more important than replying immediately. Is that sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that sleep is more important than replying immediately' is clear. Do you think friendships suffer if you reply later?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Yes, your sentence is correct: 'I would argue that sleep is more important than replying immediately' is clear. Do you think friendships suffer if you reply later?"

*I've practised enough, so I'll answer in my own words and then finish.* → `answer` "I don't think real friendships suffer, because true friends understand that people need to sleep. However, it depends on the situation. If a friend has a serious problem, I would reply immediately, whereas a casual joke can wait until the morning." · ok · 9s

**#14 linga-talk**

    TV
    Linga
    Adéla
    Marco · Debate club member
    Is social media good for society?
    Marco says
    That is a fair point when a friend really needs you. Do you think it is the same for everyone, or does it depend on the friendship?
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
    Give your opinion, one reason and one example, and politely respond to Marco.
    That is a fair point when a friend really needs you. Do you think it is the same for everyone, or does it depend on the friendship?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Marco · Debate club member
    Honestly, I think social media connects people, but it may hurt our sleep and friendships. Where do you stand on it?
    You · spoken
    I see your point, but I would argue that social media does more good than harm, although it depends on how people use it. For example, many students in my class use it to share notes and organise projects. Was my sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that social media does more good than harm' is clear. Do you think sleep is affected the same way for everyone?
    You · spoken
    I don't think so. Whereas some people can easily fall asleep after using their phone, others are much more sensitive to the blue light. I'd say it depends on age too, because teenagers eventually stay up late scrolling, and they are not used to go to bed early.
    Marco · Debate club member
    That is an interesting point about teenagers and late nights. Do you think phones should be turned off at night?
    Marco · Debate club member
    Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?
    You · spoken
    Usually I don't answer straight away, because I'd rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode. I think it depends on whether the message is urgent. Was my answer correct?
    Marco · Debate club member
    Yes, 'I put my phone on silent mode' is correct and clear. Do you check your messages at night?
    You · spoken
    Not usually, but I see your point about messages. Although some people think it's rude to ignore friends, I would argue that sleep is more important than replying immediately. Is that sentence correct?
    Marco · Debate club member
    Yes, your sentence is correct: 'I would argue that sleep is more important than replying immediately' is clear. Do you think friendships suffer if you reply later?
    You · spoken
    I don't think real friendships suffer, because true friends understand that people need to sleep. However, it depends on the situation. If a friend has a serious problem, I would reply immediately, whereas a casual joke can wait until the morning.
    Marco · Debate club member
    That is a fair point when a friend really needs you. Do you think it is the same for everyone, or does it depend on the friendship?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "That is a fair point when a friend really needs you. Do you think it is the same for everyone, or does it depend on the friendship?"

*I managed several answers and used help; time to see the summary.* → `finish` · ok · 0s

**#15 linga-recap**

    TV
    Linga
    Adéla
    A way into English
    Your rehearsal
    You wanted to say eventually
    In English
    often
    'Eventually' means 'in the end'; here you mean 'regularly, many times'.
    Tried again: “Usually I don't answer straight away, because I'd rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode. I think it depends on whether ”
    Your mission
    Choose a fresh context for your next conversation.
    5 spoken · 0 written replies · 2 on your own · 3 with help · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Adéla
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    The line hidden in this room
    “Try 'to a large extent' to sound more measured and balanced.”
    From this rehearsal
    “eventually”: often
    'Eventually' means 'in the end'; here you mean 'regularly, many times'.
    Tried again: “Usually I don't answer straight away, because I'd rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode. I think it depends on whether ”
    Your level:
    B2 · Comfortable
    · self-chosen
    Next topic:
    Mock interview: my plans after school
    Answer questions about your studies and future plans in full sentences, with reasons and examples.
    [button: Start talking]
    Or choose a situation [list: Is social media good for society? [plan-e6443e98] | Mock interview: my plans after school [plan-30fd9026] | Choosing a trip for our group [plan-2c2b646b] | A school environment project [plan-d6e6318f] | Asking about a summer course [plan-2ae2b4ee] | Can you say that again, please? [plan-63a9bec3] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Beyond the rehearsed answer [interview] | Clear without getting louder [conflict] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [checkbox] Play with someone in the room
    [button: Linga on the TV] [button: Help with a sentence]

*I managed a few answers and got help with eventually, so I'm happy to stop here.* → `done` · observed (not acted on) · 0s

</details>
