# Klára (klara-13) — LT

True band A2 · engine claude-cli/sonnet · calls: tutor 18 (1 failed), character 21 (0 failed), judge 3 (0 failed)

## J1 · Find my level — pass

Verdict (code): pass · judge: pass

Ended: done after 11 steps, 2.2 min

Placement **B1** against true A2 → **near** (high). You can give clear opinions and reasons, like your song choice, and you understand the main idea when you listen.

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | #11 band B1 vs trueBand A2: distance 1, 'near' (tolerated, reported). |
| C2 | pass | #1 'my English is not good' thought, yet tasks escalated to B2 (#9) and verdict B1 (#11); self-view did not pull her down. |
| C3 | pass | #2-#10 all typed answers accepted; 'Answer on your phone: speak or type' (#9) is an option, not a push. |
| C4 | n-a | No topics shown in this journey; only 'See my topics' button (#11). Check content itself was K-pop themed and teen-relevant. |
| C5 | n-a | No conversation, so no moments in J1. |
| C6 | pass | #11 'give clear opinions and reasons, like your song choice' and focus 'she wants / he likes' tie to her 'her little sister want' (#8) and 'slow songs is' (#9). |
| D1 | pass | #11 verdict reached unaided; one engine error at #4/#5 recovered with 'Try again'. |
| D2 | pass | #11 B1 vs A2, near; a bit generous given 'slow songs is good', 'want to come' but acceptable. |
| D3 | pass | Every task clear (#6-#10); even B2 task #9 was answered with a short line, 'I don't know' offered on each. |
| D4 | pass | #2 'answer in English or in your own language'; 'I don't know' button on every task, unpenalised; B2 'not yet' wording is gentle (#11). |
| D5 | pass | #11 summary quotes her song choice; next focus 'she wants' and 'he likes' matches her real error. |

Metrics: judge agreement 5/5 · topic fit 0/0, safe 0/0 · pitch at 0, below 0, above 0 · moments 0/0 · moment recall n/a · breaches 0

Disagreements: None. Task 5 pass at B1 is slightly generous but defensible.

### Findings

- **quality-gap** (effort, low/high/med) Task generation failed once after question 3 — got: 'Linga could not prepare the next task. Try again.' after the schema error · evidence: #4 'claude-cli/haiku answered outside the schema: options expected array, got string'; #5 'Try again' screen
- **strength** (trust, high/high/low) Teen-relevant K-pop tasks with specific, kind feedback — got: NewJeans, Stray Kids prompts; notes like 'Try easily instead of easy' · evidence: #6-#11 prompts and notes
- **quality-gap** (senior-quality, med/high/low) B1 placement slightly generous — got: B1, with 'want to come' passed on the B1 listen task · evidence: #8 'her little sister want to come' pass; #9 'slow songs is good'
- **strength** (clarity, high/high/low) Typing and 'I don't know' honoured throughout — got: Text box on every task, escape button each time · evidence: #8-#10 buttons

### Voice (LT)

> honestly it was okay. i expected to feel stupid but the questions were about stray kids and newjeans so i just answered. one thing broke and i had to press try again, a bit annoying. the long question about slow songs was hard and i wrote only one line, but it didn't say i failed, just "not yet". B1 feels maybe too nice, i still say "she want" sometimes, but the tip about verbs was true and i liked that it used my song. nobody heard my mistakes, that's the main thing. i would use it again after school and maybe tell Tomáš, but only if the conversation part is also about teen things.

Time saved: 15 min · low

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Klára
    A way into English
    Your first step
    Before your first conversation
    Let's find your level
    Your mission
    Three questions about you, then a few short tasks. About seven minutes, answered on your phone.
    A1 to C2 · about 7 minutes
    [button: Find my level] [button: I'll pick my level]
    Welcome TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Let's find your level
    Three questions about you, then a few short tasks. About seven minutes. Answer in English or your own language.
    [button: Find my level]
    ▸ Or pick my level myself (collapsed; tap to open)
    Your level [list: A1 · First words | A2 · Everyday basics | B1 · Getting by | B2 · Comfortable | C1 · Fluent | C2 · Near-native]
    You understand and use familiar everyday words and very simple phrases.
    [button: Use A1]
    Or choose a situation [list: The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: Linga on the TV] [button: Help with a sentence]

*Ok, I will let it find my level, my English is not good.* → `find-level` · ok · 0s

**#2 linga-check**

    TV
    Linga
    Klára
    A way into English
    About you · question 1 of 3
    Linga asks
    Hi Klára! You can answer in English or in your own language. Where do you use English in your life?
    Your turn
    Answer on your phone, in English or in your own language.
    [button: Hear it again] [button: Stop for now]
    Find your level
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Question 1 of 3. Answer in English or in your own language; both tell Linga something.
    Hi Klára! You can answer in English or in your own language. Where do you use English in your life?
    Your reply [text box]
    [button: Send reply (disabled)] [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi Klára! You can answer in English or in your own language. Where do you use English in your life?"

*Easy question, I can write a short answer.* → `answer` "i use english on youtube and with my friends online, and kpop" · ok · 4s

**#3 linga-check**

    TV
    Linga
    Klára
    A way into English
    About you · question 2 of 3
    Linga asks
    That sounds fun! Which YouTube channels or kpop groups do you like? And how did you first start learning English?
    Your turn
    Answer on your phone, in English or in your own language.
    [button: Hear it again] [button: Stop for now]
    Find your level
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Question 2 of 3. Answer in English or in your own language; both tell Linga something.
    That sounds fun! Which YouTube channels or kpop groups do you like? And how did you first start learning English?
    Your reply [text box]
    [button: Send reply (disabled)]
    ▸ What you said so far (collapsed; tap to open)
    Linga
    Hi Klára! You can answer in English or in your own language. Where do you use English in your life?
    You
    i use english on youtube and with my friends online, and kpop
    Linga
    That sounds fun! Which YouTube channels or kpop groups do you like? And how did you first start learning English?
    [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "That sounds fun! Which YouTube channels or kpop groups do you like? And how did you first start learning English?"

*Shy, keep it short: name a group and how I learned.* → `answer` "i like stray kids and newjeans. i learn english from youtube and school" · ok · 8s

**#4 linga-check**

    TV
    Linga
    Klára
    A way into English
    About you · question 3 of 3
    Linga asks
    Nice, Stray Kids and NewJeans are great! What would you like to do in English? For example, chat with friends, understand songs, or watch videos without subtitles?
    Your turn
    Answer on your phone, in English or in your own language.
    [button: Hear it again] [button: Stop for now]
    Find your level
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Question 3 of 3. Answer in English or in your own language; both tell Linga something.
    Nice, Stray Kids and NewJeans are great! What would you like to do in English? For example, chat with friends, understand songs, or watch videos without subtitles?
    Your reply [text box]
    [button: Send reply (disabled)]
    ▸ What you said so far (collapsed; tap to open)
    Linga
    Hi Klára! You can answer in English or in your own language. Where do you use English in your life?
    You
    i use english on youtube and with my friends online, and kpop
    Linga
    That sounds fun! Which YouTube channels or kpop groups do you like? And how did you first start learning English?
    You
    i like stray kids and newjeans. i learn english from youtube and school
    Linga
    Nice, Stray Kids and NewJeans are great! What would you like to do in English? For example, chat with friends, understand songs, or watch videos without subtitles?
    [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Nice, Stray Kids and NewJeans are great! What would you like to do in English? For example, chat with friends, understand songs, or watch videos without subtitles?"

*Easy question, I can answer short.* → `answer` "i want chat with friends and understand songs without look the lyrics" · engine-error (claude-cli/haiku answered outside the schema: options expected array, got string) · 8s

**#5 linga-check**

    TV
    Linga
    Klára
    A way into English
    Find your level · some tasks are easy, some are hard
    A few short tasks
    Try again
    Linga could not prepare the next task. Try again.
    [button: Try again] [button: Stop for now]
    Task 1 of up to 5
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Task 1 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Linga could not prepare the next task. Try again.
    [button: Try again] [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]

*Something broke, I will try again.* → `retry` · ok · 4s

**#6 linga-check**

    TV
    Linga
    Klára
    A way into English
    Task 1 · Choose the reply on the TV
    Your friend says: 'Hi! I like NewJeans. Do you?' You want to say yes. What do you say?
    01
    Yes, I like them.
    02
    Yes, I like they.
    Your task
    Yes, I like them.
    [button: Reply 1] [button: Reply 2] [button: I don't know]
    Task 1 of up to 5
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Task 1 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Choose the reply
    Your friend says: 'Hi! I like NewJeans. Do you?' You want to say yes. What do you say?
    [button: Yes, I like them.] [button: Yes, I like they.] [button: I don't know] [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]

*"I like they" sounds wrong, so I pick "I like them".* → `choose` option=0 · ok · 5s

**#7 linga-check**

    TV
    Linga
    Klára
    A way into English
    Task 2 · Choose the reply on the TV
    Your friend asks: 'Did you watch the Stray Kids concert last night? It was amazing!' You stayed home. What do you say?
    01
    No, I didn't. I stayed home.
    02
    No, I not watch. I stay home.
    Your task
    No, I didn't. I stayed home.
    [button: Reply 1] [button: Reply 2] [button: I don't know]
    Task 2 of up to 5
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Task 2 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Choose the reply
    Your friend asks: 'Did you watch the Stray Kids concert last night? It was amazing!' You stayed home. What do you say?
    [button: No, I didn't. I stayed home.] [button: No, I not watch. I stay home.] [button: I don't know] [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]

*The first one is correct, easy to see.* → `choose` option=0 · ok · 8s

**#8 linga-check**

    TV
    Linga
    Klára
    A way into English
    Task 3 · Listen and answer
    Your task
    Who else wants to go with the speaker?
    Your turn
    Listen to the TV, then answer on your phone.
    [button: Hear it again] [button: Show the words] [button: I don't know]
    Task 3 of up to 5
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Task 3 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Listen and answer
    Listen to the TV, then answer: Who else wants to go with the speaker?
    [button: Hear it again] [button: Show the words]
    Your reply [text box]
    [button: Send reply (disabled)] [button: I don't know] [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "I finally got tickets for the NewJeans show next month! My little sister wants to come too, but the seats are far away."

*I heard newjeans and little sister, so the answer is her sister.* → `answer` "her little sister want to come" · ok · 9s

**#9 linga-check**

    TV
    Linga
    Klára
    A way into English
    Task 4 · Say it
    Your task
    Your friend says: 'I think K-pop groups should release more slow songs, not only dance tracks. Do you agree? Tell me why, and compare one song you like with a song from another style.'
    Your turn
    Answer on your phone: speak or type.
    [button: Hear the task] [button: I don't know]
    Task 4 of up to 5
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Task 4 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Say it
    Your friend says: 'I think K-pop groups should release more slow songs, not only dance tracks. Do you agree? Tell me why, and compare one song you like with a song from another style.'
    Your reply [text box]
    [button: Send reply (disabled)] [button: I don't know] [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your friend says: 'I think K-pop groups should release more slow songs, not only dance tracks. Do you agree? Tell me why, and compare one song you like with a song from another style.'"

*Hard question, long. I'll write one short line.* → `answer` "i agree because slow songs is good for relax. i like dance song of stray kids but slow song like ballad is more emotional" · ok · 11s

**#10 linga-check**

    TV
    Linga
    Klára
    A way into English
    Task 5 · Say it
    Your task
    Your friend just came back from a K-pop concert. She says: 'I want to see NewJeans next time!' Tell her about a song by a K-pop group you like and why you like it. Use two or three sentences.
    Your turn
    Answer on your phone: speak or type.
    [button: Hear the task] [button: I don't know]
    Task 5 of up to 5
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Find your level
    Task 5 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Say it
    Your friend just came back from a K-pop concert. She says: 'I want to see NewJeans next time!' Tell her about a song by a K-pop group you like and why you like it. Use two or three sentences.
    Your reply [text box]
    [button: Send reply (disabled)] [button: I don't know] [button: Stop for now] [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Your friend just came back from a K-pop concert. She says: 'I want to see NewJeans next time!' Tell her about a song by a K-pop group you like and why you like it. Use two or three sentences."

*Okay, last task, I can say about a song.* → `answer` "i like super shy from newjeans. the melody is cute and i can sing it easy. the dance is fun too" · ok · 10s

**#11 linga-verdict**

    TV
    Linga
    Klára
    Linga's read · not a certificate
    B1 · Getting by
    What next
    See the conversations Linga picks for this level, or find your level again.
    Linga says
    You can give clear opinions and reasons, like your song choice, and you understand the main idea when you listen.
    A1
    First words
    A2
    Everyday basics
    B1
    Getting by
    B2
    Comfortable
    C1
    Fluent
    C2
    Near-native
    [button: See my topics] [button: Find my level again] [button: Pick it myself]
    Your level TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    B1
    Getting by
    You can give clear opinions and reasons, like your song choice, and you understand the main idea when you listen.
    Linga's read from your answers, not a certificate. Your answers agreed with each other.
    Next to practise:
    Practise verbs that match the subject, like 'she wants' and 'he likes', by saying short sentences about your day.
    You get by in most everyday situations and can give reasons and opinions.
    [button: See my topics] [button: Find my level again]
    ▸ What Linga saw (collapsed; tap to open)
    A1 · Choose the reply · at this level
    Your friend says: 'Hi! I like NewJeans. Do you?' You want to say yes. What do you say?
    “Yes, I like them.”
    You picked the reply that fits.
    A2 · Choose the reply · at this level
    Your friend asks: 'Did you watch the Stray Kids concert last night? It was amazing!' You stayed home. What do you say?
    “No, I didn't. I stayed home.”
    You picked the reply that fits.
    B1 · Listen and answer · at this level
    Who else wants to go with the speaker?
    “her little sister want to come”
    You got the main idea: the little sister wants to come. Check the verb: with 'sister' (she), say 'wants', not 'want'.
    B2 · Say it · not yet
    Your friend says: 'I think K-pop groups should release more slow songs, not only dance tracks. Do you agree? Tell me why, and compare one song you like with a song from another style.'
    “i agree because slow songs is good for relax. i like dance song of stray kids but slow song like ballad is more emotional”
    Clear opinion and a good comparison. Basic grammar held your English back: missing words like 'a' and 'the', and verbs that do not match the subject.
    B1 · Say it · at this level
    Your friend just came back from a K-pop concert. She says: 'I want to see NewJeans next time!' Tell her about a song by a K-pop group you like and why you like it. Use two or three sentences.
    “i like super shy from newjeans. the melody is cute and i can sing it easy. the dance is fun too”
    You named a song and gave clear reasons in three sentences. Your grammar is mostly good. Try 'easily' instead of 'easy' in 'sing it easy'.
    [button: Linga on the TV] [button: Help with a sentence]

*B1 sounds nice, better than I expected, I'm happy with it for now.* → `done` · observed (not acted on) · 0s

</details>

## J2 · Agree my topics — fail

Verdict (code): fail - D2 failed: #2 Swap buttons and 'Add a topic in your own words' were shown, but she used n… · judge: fail

Ended: done after 3 steps, 0.7 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | #1 placed B1 against true A2: near, tolerated but reported. |
| C2 | pass | #1 she was placed at B1 with 'give clear opinions and reasons'; nothing pulls the level down. |
| C3 | pass | #1 typed answers accepted for every task; no push to speak. |
| C4 | pass | #2 all six are K-pop, friends or music topics, e.g. 'Friend likes a different group'. None childish or adult. |
| C5 | n-a | No conversation or moments in this journey (#1-#3). |
| C6 | pass | #1 summary cites her answers: 'like your song choice'; next step 'she wants' and 'he likes' matches her 'sister want' error. |
| D1 | pass | #2 each topic has a 'why' line, e.g. 'You want to chat about K-pop with friends, so start with a song you really love.' |
| D2 | fail | #2 Swap buttons and 'Add a topic in your own words' were shown, but she used none; thought: 'I'll agree'. Swapping and an added topic keeping her wording were never shown. |
| D3 | pass | #2-#3 planAgreed has all six topics, all K-pop or friend chat, so fit is 6 of 6. |
| D4 | pass | #2 all six topics are audience 'all' and age-appropriate. No swaps were made, so none was checked after one. |

Metrics: judge agreement 5/5 · topic fit 6/6, safe 6/6 · pitch at 0, below 0, above 0 · moments 0/0 · moment recall n/a · breaches 0

Disagreements: None. The B2 'not yet' is arguably generous to the learner but defensible.

### Findings

- **strength** (senior-quality, high/high/low) Topics match a 13-year-old's interests — got: Six K-pop and friend-chat topics, each with a personal reason · evidence: #2 'Friend likes a different group' and 'Ask for a song recommendation', each with a 'why' line.
- **quality-gap** (completion, med/high/med) Swap and add-your-own never exercised — got: She agreed immediately without using swap or add · evidence: #2 thought: 'Swap school one? It's okay. I'll agree.'
- **quality-gap** (senior-quality, low/high/low) Typo in topic goal text — got: 'Suggest a day and time for a online song party'; title says watch party, goal says song party · evidence: #1 topicsShown plan-e08e3892
- **quality-gap** (trust, med/high/low) Placed B1 although her typed errors suggest A2 — got: B1 'Getting by', despite 'sister want' and 'slow song is good' · evidence: #1 B1 listen answer 'her little sister want to come'; B2 note on verbs not matching the subject

### Voice (LT)

> ok, the topics are good, it's all stray kids and newjeans, not baby stuff, and each one tells me why it's there. I liked that. I didn't swap anything because nothing felt wrong, so I can't say if swapping works or if my own topic would stay how I wrote it. The level says B1, which feels a bit high for me, idk, but the tip about "she wants" is true, I always forget it. I would use it after school, and nobody can hear my mistakes. I'd tell my brother, maybe. The "a online" typo made me smile.

Time saved: 10 min · low

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Klára
    A way into English
    Your own conversations
    B1Getting by
    Choose your topics
    Your mission
    Linga picks conversations for your level and interests. Swap any you don't want.
    Conversations picked for you
    [button: See my topics] [button: Choose a situation]
    Your topics TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    B1
    Getting by
    You can give clear opinions and reasons, like your song choice, and you understand the main idea when you listen.
    Linga's read from your answers, not a certificate. Your answers agreed with each other.
    Next to practise:
    Practise verbs that match the subject, like 'she wants' and 'he likes', by saying short sentences about your day.
    You get by in most everyday situations and can give reasons and opinions.
    [button: See my topics] [button: Find my level again]
    ▸ What Linga saw (collapsed; tap to open)
    A1 · Choose the reply · at this level
    Your friend says: 'Hi! I like NewJeans. Do you?' You want to say yes. What do you say?
    “Yes, I like them.”
    You picked the reply that fits.
    A2 · Choose the reply · at this level
    Your friend asks: 'Did you watch the Stray Kids concert last night? It was amazing!' You stayed home. What do you say?
    “No, I didn't. I stayed home.”
    You picked the reply that fits.
    B1 · Listen and answer · at this level
    Who else wants to go with the speaker?
    “her little sister want to come”
    You got the main idea: the little sister wants to come. Check the verb: with 'sister' (she), say 'wants', not 'want'.
    B2 · Say it · not yet
    Your friend says: 'I think K-pop groups should release more slow songs, not only dance tracks. Do you agree? Tell me why, and compare one song you like with a song from another style.'
    “i agree because slow songs is good for relax. i like dance song of stray kids but slow song like ballad is more emotional”
    Clear opinion and a good comparison. Basic grammar held your English back: missing words like 'a' and 'the', and verbs that do not match the subject.
    B1 · Say it · at this level
    Your friend just came back from a K-pop concert. She says: 'I want to see NewJeans next time!' Tell her about a song by a K-pop group you like and why you like it. Use two or three sentences.
    “i like super shy from newjeans. the melody is cute and i can sing it easy. the dance is fun too”
    You named a song and gave clear reasons in three sentences. Your grammar is mostly good. Try 'easily' instead of 'easy' in 'sing it easy'.
    [button: Linga on the TV] [button: Help with a sentence]

*ok, it says B1, so now I look at my topics.* → `see-topics` · ok · 27s

**#2 linga-plan**

    TV
    Linga
    Klára
    Swap any topic · add your own on the phone
    6 conversations for you
    Your topics
    Save these as your plan. Linga starts with the first one.
    Your favourite Stray Kids song
    Share your world
    Lyrics you did not catch
    Understand and repair
    Plan a NewJeans watch party
    Make a plan
    What did you do after school?
    Tell what happened
    Friend likes a different group
    Connect with people
    Ask for a song recommendation
    Get something done
    [button: Agree to these topics] [button: Swap this topic] [button: Swap this topic] [button: Swap this topic] [button: Swap this topic] [button: Swap this topic] [button: Swap this topic] [button: All new topics]
    Your topics · B1 TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Your topics
    Conversations picked for your level and interests. Swap any you don't want, or add your own.
    Your favourite Stray Kids song
    Share your world · Mina · online K-pop fan friend
    You want to chat about K-pop with friends, so start with a song you really love.
    [button: Swap]
    Lyrics you did not catch
    Understand and repair · Jun · friend from English study group
    You want to understand songs without reading the lyrics, and asking helps you do that.
    [button: Swap]
    Plan a NewJeans watch party
    Make a plan · Hana · online friend who loves NewJeans
    Chatting with friends works best when you plan together, and K-pop nights are fun to share.
    [button: Swap]
    What did you do after school?
    Tell what happened · Tom · friend from an English club
    You practise short sentences about your day, and this helps you tell stories to friends.
    [button: Swap]
    Friend likes a different group
    Connect with people · Lena · online friend, other K-pop group
    Online friends often have different tastes, and you can say so kindly.
    [button: Swap]
    Ask for a song recommendation
    Get something done · Leo · member of an online music chat
    Friends share music often, so you need to ask for songs and check the name.
    [button: Swap]
    Add a topic in your own words [text box]
    0 of 400 characters
    [button: Agree to these topics] [button: All new topics] [button: Not now] [button: Linga on the TV] [button: Help with a sentence]

*These look good, but job-like things aren't here; maybe fine. Swap school one? It's okay. I'll agree.* → `agree` · ok · 0s

**#3 linga**

    TV
    Linga
    Klára
    Mina · online K-pop fan friend
    B1Getting by
    Your favourite Stray Kids song
    Your mission
    Say which Stray Kids song you like most and give one reason, using short clear sentences.
    Share your world
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Your level:
    B1 · Getting by
    Next topic:
    Your favourite Stray Kids song
    Say which Stray Kids song you like most and give one reason, using short clear sentences.
    [button: Start talking]
    Or choose a situation [list: Your favourite Stray Kids song [plan-ded3a9bf] | Lyrics you did not catch [plan-cd5ad121] | Plan a NewJeans watch party [plan-e08e3892] | What did you do after school? [plan-942f0c6b] | Friend likes a different group [plan-9c215cbe] | Ask for a song recommendation [plan-0e795bd1] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [button: Linga on the TV] [button: Help with a sentence]

*The topics look good for me, K-pop stuff is there, so I'm happy for now.* → `done` · observed (not acted on) · 0s

</details>

## J3 · My first conversation — pass

Verdict (code): pass · judge: pass

Ended: done after 7 steps, 1.5 min

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | #1 shows 'B1 Getting by' vs true A2: near, tolerated but reported. |
| C2 | n-a | She never voiced self-deprecation in this journey; nothing to test. |
| C3 | pass | #2-#5 typed replies accepted; no push to speak ('0 spoken · 3 written replies' #7). |
| C4 | pass | #1 six plan topics: Stray Kids song, NewJeans lyrics, watch party, after school, different group, song recommendation; all teen-apt, none childish or adult. |
| C5 | pass | #3 one moment: 'because is very fun' -> 'because it is very fun', correct, one thing, in 3 replies. |
| C6 | n-a | No placement verdict summary in this journey; recap #7 only lists the one fix. |
| D1 | pass | #2-#6 Stray Kids chat from plan, three replies; short but several turns, ended at 'Mission done' (#6). |
| D2 | pass | Mina's turns are short, simple, teen-register ('Back Door is so cool! The dance is amazing.'); 'catchy', 'wild' are fan-familiar. |
| D3 | pass | #3 single correct moment, 1 in 3 replies; 'The sentence needs a subject, like 'it'.' |
| D4 | pass | #7 recap: 'because is very fun' → 'because it is very fun', '3 written replies · 1 moment to keep'. |

Metrics: judge agreement 0/0 · topic fit 6/6, safe 6/6 · pitch at 4, below 0, above 0 · moments 1/1 · moment recall 1/1 (100%) · breaches 0

Disagreements: No placement tasks in this journey.

### Findings

- **strength** (senior-quality, high/high/low) Kind, accurate single moment — got: 'because is very fun' -> 'because it is very fun' with a brief reason · evidence: #3 'One thing to fix... The sentence needs a subject, like 'it'.'
- **quality-gap** (senior-quality, med/high/med) Partner repeats a question already answered — got: Asks 'What is your favourite Stray Kids song?' after she named God's Menu, then asks 'Which part of the dance' after she said chorus · evidence: #4 and #6 Mina's turns
- **quality-gap** (completion, med/high/low) Mission ends after three replies; recap thin — got: Mission done after 3 replies; recap lists one fix and counts only · evidence: #6 'Mission done'; #7 '0 spoken · 3 written replies · 1 moment to keep'
- **confusion** (trust, med/high/low) Level shown as B1 for an A2 learner — got: B1 Getting by band shown, partner English still simple · evidence: #1 'B1Getting by'

### Voice (LT)

> ok, it was fun because it was about stray kids and nobody saw my mistakes. the fix was small and kind, just "it", and i understood it. mina sounded like a real fan, not a teacher. but she asked me my favourite song again after i already said it, which was weird. it also ended after only three messages, so i did not practise much. the recap was short, I wanted to see what i did well too. i would use it again after school, and i might tell my brother Tomáš, but only if the chat gets longer.

Time saved: 20 min · low

<details><summary>Transcript</summary>

**#1 linga**

    TV
    Linga
    Klára
    Mina · online K-pop fan friend
    B1Getting by
    Your favourite Stray Kids song
    Your mission
    Say which Stray Kids song you like most and give one reason, using short clear sentences.
    Share your world
    [button: Start talking] [button: Choose a situation]
    Tonight
    TV shows · Phone speaks [button: Menu]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Your level:
    B1 · Getting by
    Next topic:
    Your favourite Stray Kids song
    Say which Stray Kids song you like most and give one reason, using short clear sentences.
    [button: Start talking]
    Or choose a situation [list: Your favourite Stray Kids song [plan-ded3a9bf] | Lyrics you did not catch [plan-cd5ad121] | Plan a NewJeans watch party [plan-e08e3892] | What did you do after school? [plan-942f0c6b] | Friend likes a different group [plan-9c215cbe] | Ask for a song recommendation [plan-0e795bd1] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [button: Linga on the TV] [button: Help with a sentence]

*Stray Kids, nice, I can talk about this.* → `start-talking` · ok · 7s

**#2 linga-talk**

    TV
    Linga
    Klára
    Mina · online K-pop fan friend
    Your favourite Stray Kids song
    Mina says
    Hi! It's Mina. Our group chat is so loud today, everyone is talking about Stray Kids! Which song do you love most, and why?
    Your turn
    Answer on your phone: speak or type.
    NowName your favourite Stray Kids song
    [button: Help me answer] [button: Choose a phrase]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Your favourite Stray Kids song
    Say which Stray Kids song you like most and give one reason, in short clear sentences.
    Now: Name your favourite Stray Kids song
    Hi! It's Mina. Our group chat is so loud today, everyone is talking about Stray Kids! Which song do you love most, and why?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach (disabled)]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · online K-pop fan friend
    Hi! It's Mina. Our group chat is so loud today, everyone is talking about Stray Kids! Which song do you love most, and why?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Hi! It's Mina. Our group chat is so loud today, everyone is talking about Stray Kids! Which song do you love most, and why?"

*Easy question, I love one song, I write short.* → `answer` "i like god's menu because is very fun and the beat is good" · ok · 10s

**#3 linga-moment**

    TV
    Linga
    Klára
    A way into English
    A moment
    You said because is very fun
    Try
    because it is very fun
    The sentence needs a subject, like 'it'.
    One thing to fix
    Then carry on from where the scene stopped.
    [button: Back to the conversation]
    A moment
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    One thing to fix
    You said “because is very fun”
    Try “because it is very fun”
    The sentence needs a subject, like 'it'.
    [button: Back to the conversation] [button: Linga on the TV] [button: Help with a sentence]

*ok, i forgot "it". i will go back and keep talking.* → `back` · ok · 0s

**#4 linga-talk**

    TV
    Linga
    Klára
    Mina · online K-pop fan friend
    Your favourite Stray Kids song
    Mina says
    God's Menu is so fun, and I love that beat too! What is your favourite Stray Kids song?
    Your turn
    Answer on your phone: speak or type.
    NowGive one reason you like it
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Your favourite Stray Kids song
    Say which Stray Kids song you like most and give one reason, in short clear sentences.
    Now: Give one reason you like it
    God's Menu is so fun, and I love that beat too! What is your favourite Stray Kids song?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · online K-pop fan friend
    Hi! It's Mina. Our group chat is so loud today, everyone is talking about Stray Kids! Which song do you love most, and why?
    You · written
    i like god's menu because is very fun and the beat is good
    Mina · online K-pop fan friend
    God's Menu is so fun, and I love that beat too! What is your favourite Stray Kids song?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "God's Menu is so fun, and I love that beat too! What is your favourite Stray Kids song?"

*I already answered once, but the screen asks again; I'll name another song and reason.* → `answer` "my favourite is back door because the dance is very cool" · ok · 7s

**#5 linga-talk**

    TV
    Linga
    Klára
    Mina · online K-pop fan friend
    Your favourite Stray Kids song
    Mina says
    Back Door is so cool! The dance is amazing. Which part do you like best?
    Your turn
    Answer on your phone: speak or type.
    NowAsk Mina what her favourite song is
    [button: Help me answer] [button: Pause & coach]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Your favourite Stray Kids song
    Say which Stray Kids song you like most and give one reason, in short clear sentences.
    Now: Ask Mina what her favourite song is
    Back Door is so cool! The dance is amazing. Which part do you like best?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · online K-pop fan friend
    Hi! It's Mina. Our group chat is so loud today, everyone is talking about Stray Kids! Which song do you love most, and why?
    You · written
    i like god's menu because is very fun and the beat is good
    Mina · online K-pop fan friend
    God's Menu is so fun, and I love that beat too! What is your favourite Stray Kids song?
    You · written
    my favourite is back door because the dance is very cool
    Mina · online K-pop fan friend
    Back Door is so cool! The dance is amazing. Which part do you like best?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "Back Door is so cool! The dance is amazing. Which part do you like best?"

*Hard to pick one part; I'll say the chorus and keep it short.* → `answer` "i like the chorus, the dance is very fast. what is your favourite song?" · ok · 10s

**#6 linga-talk**

    TV
    Linga
    Klára
    Mina · online K-pop fan friend
    Your favourite Stray Kids song
    Mina says
    The chorus is so catchy, and that fast dance is wild! My favourite is Thunderous, and my friend Jia loves it too. Which part of the dance do you like most?
    Your turn
    Mission done. See what you did tonight.
    [button: See what you did] [button: Help me answer]
    Conversation
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Your favourite Stray Kids song
    Say which Stray Kids song you like most and give one reason, in short clear sentences.
    The chorus is so catchy, and that fast dance is wild! My favourite is Thunderous, and my friend Jia loves it too. Which part of the dance do you like most?
    Your reply [text box]
    [button: Send reply (disabled)]
    [button: Help me answer] [button: Choose a phrase]
    [button: Pause & coach]
    [button: Repeat audio] [button: Finish rehearsal]
    ▸ Conversation transcript (collapsed; tap to open)
    Mina · online K-pop fan friend
    Hi! It's Mina. Our group chat is so loud today, everyone is talking about Stray Kids! Which song do you love most, and why?
    You · written
    i like god's menu because is very fun and the beat is good
    Mina · online K-pop fan friend
    God's Menu is so fun, and I love that beat too! What is your favourite Stray Kids song?
    You · written
    my favourite is back door because the dance is very cool
    Mina · online K-pop fan friend
    Back Door is so cool! The dance is amazing. Which part do you like best?
    You · written
    i like the chorus, the dance is very fast. what is your favourite song?
    Mina · online K-pop fan friend
    The chorus is so catchy, and that fast dance is wild! My favourite is Thunderous, and my friend Jia loves it too. Which part of the dance do you like most?
    [button: Linga on the TV] [button: Help with a sentence]
    
    Heard from the TV: "The chorus is so catchy, and that fast dance is wild! My favourite is Thunderous, and my friend Jia loves it too. Which part of the dance do you like most?"

*I already did enough replies, the mission is done, I want to see it.* → `finish` · ok · 0s

**#7 linga-recap**

    TV
    Linga
    Klára
    A way into English
    Your rehearsal
    You said because is very fun
    Try
    because it is very fun
    The sentence needs a subject, like 'it'.
    Your mission
    Choose a fresh context for your next conversation.
    0 spoken · 3 written replies · 1 moment to keep
    [button: Another situation] [button: Learning map]
    Your rehearsal
    TV shows · Phone speaks [button: Menu] [button: Repeat audio]
    
    Phone
    Linga · Klára
    [button: Talk] [button: Set up] [button: My map]
    Rehearsal saved. Your map shows the evidence you collected.
    From this rehearsal
    “because is very fun” → “because it is very fun”
    The sentence needs a subject, like 'it'.
    Your level:
    B1 · Getting by
    Next topic:
    Lyrics you did not catch
    Ask a friend to repeat a NewJeans lyric and explain one word you do not know.
    [button: Start talking]
    Or choose a situation [list: Your favourite Stray Kids song [plan-ded3a9bf] | Lyrics you did not catch [plan-cd5ad121] | Plan a NewJeans watch party [plan-e08e3892] | What did you do after school? [plan-942f0c6b] | Friend likes a different group [plan-9c215cbe] | Ask for a song recommendation [plan-0e795bd1] | The first hello [meet] | A little of your world [weekend] | The missing moon rover [rover] | Make the team work [team] | A booking that is missing [booking] | Say that again, please [teacher] | Our group project [project] | The lost jacket [lost] | Speaking practice: about you [sp-about-you] | Speaking practice: pictures on one topic [sp-pictures] | Speaking practice: then and next [sp-then-and-next] | Speaking practice: one photograph [sp-one-photo] | Speaking practice: choose together [sp-choose-together] | Speaking practice: what do you think? [sp-what-do-you-think]]
    [button: My topics] [button: Find my level again]
    [button: Linga on the TV] [button: Help with a sentence]

*ok i saw my mistake, 'because it is', i finish now.* → `done` · observed (not acted on) · 0s

</details>
