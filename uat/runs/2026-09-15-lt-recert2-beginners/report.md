# LT run 2026-09-15-lt-recert2-beginners — Linga

Engine: codex-cli/gpt-6-astra for tutor, Character and judge · 4 Characters · 13 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

| Character | Journey | Verdict | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|
| klara-13 | J3 | conditional | 2/2 |  | 8/9 | 2/2 | 0 | 13 | 4.5 | done |
| petra-38 | J3 | fail | 1/2 |  | 9/9 | 2/2 | 0 | 13 | 4.4 | done |
| petra-38 | J4 | fail | 3/3 |  | 4/4 | 1/1 | 0 | 9 | 2.2 | done |
| tomas-9 | J3 | fail | 2/3 |  | 8/9 | 1/2 | 0 | 13 | 4.5 | done |
| tomas-9 | J4 | fail | 2/3 |  | 1/4 | 1/1 | 0 | 10 | 2.1 | done |
| viktor-67 | J3 | fail | 1/3 |  | 3/9 | 2/2 | 0 | 13 | 4.7 | done |
| viktor-67 | J4 | fail | 1/2 |  | 7/9 | 1/1 | 0 | 22 | 5.3 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 0 · miss 0
- **judge agreement:** n/a
- **topic fit:** fit 4/4 (100%) · safe 4/4 (100%)
- **pitch:** at band 40/53 (75%) · below 0 · above 13
- **moment precision:** 10/11 (91%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 61 calls, 0 failed, avg 14s · character 93 calls, 0 failed, avg 9s · judge 7 calls, 0 failed, avg 72s

## Findings by impact

- **blocker · rank 27** `LT-petra-38-J4-1` (senior-quality) — The guest takes the receptionist's role
  - expected: Petra practises handling a missing booking as the receptionist, with Leo speaking as the guest.
  - got: Leo addresses Petra as Leo, searches the booking list, changes the booking, and issues her a key. The role reversal repeatedly confuses her.
  - evidence: #2 labels the partner "Leo · hotel guest" but he says "Hello, Leo. I can't find booking H482". Petra thinks "I am confused because he is the guest". At #8 she says "It is strange he gives me the key".
  - acceptance: Keep names and roles consistent throughout; the learner should perform the receptionist's actions and the guest should describe the booking problem.
- **blocker · rank 27** `LT-viktor-67-J3-1` (senior-quality) — Repeated Czech requests do not produce understandable explanations
  - expected: Very short language, familiar words, and Czech clarification when English explanations fail.
  - got: Pitch is at band on #7, #10 and #12 only: 3/9, below the required 0.8. Turns #2, #4, #5, #6, #9 and #11 introduce too much unfamiliar language for this learner. Slow pacing is asserted but not verifiable.
  - evidence: #5: "Tomu drawing bohužel nerozumím". #6: "Drawing means making a picture with a pencil." #10 asks what "eat" means; #11 responds with "put food in your mouth and chew", followed by "pořád tomu nerozumím".
  - acceptance: After an explicit vocabulary difficulty, give a brief Czech meaning and one short English example. Achieve at least 80% at-band partner turns.
- **blocker · rank 27** `LT-viktor-67-J3-2` (completion) — Eight replies never deliver the planned school exchange
  - expected: Help Viktor ask his grandchild about school and understand a short answer.
  - got: The conversation shifts from art to tomatoes and stays in a comprehension-repair loop until Viktor gives up.
  - evidence: #1: "Ask your grandchild about school and listen to a short answer." #7: "Do you eat tomatoes… for lunch?" #11: "Promiň, pořád tomu nerozumím ... Už se rozloučíme."
  - acceptance: Model "How is school?", let Viktor use it, and support understanding of one short answer before finishing.
- **blocker · rank 27** `LT-viktor-67-J4-1` (completion) — Repeated cues do not answer the question he is stuck on
  - expected: Help supplies a simple answer to the current question and enables his next reply.
  - got: The same weather and flower cue appears for questions about contents, colors, and weather. It helps with weather but repeatedly leaves color questions unanswered.
  - evidence: #5 pairs "What color are they?" with "Try: It is sunny. These are my flowers." The mismatch repeats at #9, #16, and #20. At #16 Viktor thinks, "I still do not know how to say the flower colors."
  - acceptance: For each current question, offer an answer pattern and usable vocabulary that let Viktor respond without changing the subject.
- **blocker · rank 27** `LT-viktor-67-J4-2` (effort) — Coaching improves an old answer instead of resolving the current difficulty
  - expected: Coaching preserves an exact quotation while also helping him answer the pending question.
  - got: Requests for help with colors lead to expansions of earlier garden or weather statements.
  - evidence: #5: "I need help saying their color." #6 coaches "I have tomatoes in my garden." #20 requests help understanding the tomato question; #21 again teaches "It is sunny in my garden."
  - acceptance: Use the pending partner question and the learner's difficulty alongside the quoted previous reply when selecting coaching.
- **blocker · rank 18** `LT-tomas-9-J4-1` (completion) — Help repeats a question already answered
  - expected: Each cue helps him respond to the current turn.
  - got: All three cues ask the dog's name, including after Mia names Pip and introduces the ball. Replies follow, but the later cues do not supply relevant help.
  - evidence: #3, #6 and #8 repeat "Try: Hi! What is your dog's name?" despite #5 saying "His name is Pip."
  - acceptance: After Pip is named, offer a tiny response about Pip or the ball; demonstrate that it unblocks the next reply.
- **blocker · rank 18** `LT-tomas-9-J4-3` (senior-quality) — Partner language exceeds his starting ability
  - expected: Tiny familiar sentences and one simple question per turn.
  - got: Only the second partner turn is comfortably pitched for him. The opening is long, the third adds unfamiliar action language without a question, and the final turn introduces several new words.
  - evidence: #2: "she said too much and I need help." #7: "He brings you his yellow ball." #9: "Pip wags his tail! Do you want to throw his yellow ball?"
  - acceptance: Use familiar language such as "A yellow ball! Do you like it?" and give one simple question every turn.
- **blocker · rank 18** `LT-viktor-67-J4-3` (completion) — Fresh replay questions do not produce a better independent answer
  - expected: Replay gives a fresh question, followed by demonstrable improvement and an opportunity to answer independently.
  - got: Replay questions change, but the targeted improvement is not demonstrated. All five recorded replies remain supported.
  - evidence: #10 teaches "The flowers are in the garden."; #11 receives "Tomatoes in garden." #17 teaches "It is sunny in my garden."; #18 receives the unchanged "It is sunny." Facts record all five corresponding replies as "supported": true.
  - acceptance: After supported practice, provide an explicit unaided attempt and verify improvement before treating the replay goal as achieved.
- **major · rank 12** `LT-viktor-67-J3-4` (senior-quality) — The opening models an unnatural tense
  - expected: A natural, accurate school sentence suitable for imitation.
  - got: The partner uses simple present for an apparent event from today's class.
  - evidence: #2: "I draw a tree in art class today." #4 repeats "I draw a tree in art class."
  - acceptance: Use a natural beginner model, such as "School was good" or "I like art", instead of simplifying away necessary tense.
- **major · rank 12** `LT-viktor-67-J4-4` (senior-quality) — Later partner turns exceed this beginner's language needs
  - expected: Very short statements and familiar, simple questions throughout.
  - got: Seven of nine partner turns are at A1; two introduce longer or less familiar formulations. Speaking speed cannot be assessed from text.
  - evidence: #18 asks "What is the weather like in your garden today?" after an additional sentence. #19 says "The garden looks lovely in the sun!" before another color question.
  - acceptance: Keep turns close to patterns such as "Is it sunny?" and "Are your tomatoes red?", especially after repeated help requests.
- **major · rank 9** `LT-petra-38-J3-1` (senior-quality) — The role reversal prevents receptionist practice
  - expected: Petra handles a guest complaint, practising a receptionist's explanation and offer of help.
  - got: The partner labelled hotel guest performs the receptionist's role throughout, leaving Petra to practise being the guest.
  - evidence: #1 promises "Help a guest with a noisy room". #2 labels the partner "Mia · hotel guest", but Mia asks "I'm sorry your room is noisy". #13: "next time I want be the receptionist".
  - acceptance: Keep the planned learner and partner roles consistent; Petra should elicit the complaint and offer the room change herself.
- **major · rank 9** `LT-petra-38-J4-3` (completion) — The journey ends without an independent replay
  - expected: After help, Petra receives a fresh question, answers better independently, and sees coaching that quotes her actual words.
  - got: The correction is followed by the partner resolving the booking. No replay or coaching note is shown. All three saved replies remain marked supported.
  - evidence: #6: "I want to try again." #7 instead says "We have a room for you, so I can change the booking." #9 ends with "Rehearsal saved". facts.conversation records "coaching": null and "supported": true for all learner turns.
  - acceptance: Demonstrate a fresh replay question and an improved unaided answer before completion. Quote the learner exactly in coaching and distinguish supported from independent evidence.
- **minor · rank 6** `LT-klara-13-J3-1` (completion) — The recap counts learning without reviewing it
  - expected: Finish with a recap that identifies what she practised and the one or two things to remember.
  - got: The finished conversation has a saved-state confirmation and counts, but no examples, corrections, or specific achievement to take away.
  - evidence: #13: “Rehearsal saved: Meet a K-pop fan. 8 replies; 2 moments to keep.”
  - acceptance: Show one concrete conversational achievement and both corrected phrases in the final recap.
- **minor · rank 6** `LT-petra-38-J3-2` (completion) — The recap records counts without consolidating learning
  - expected: A recap preserves one or two useful phrases and identifies what Petra practised.
  - got: The displayed recap provides only the title and counts, with no phrases or practical feedback.
  - evidence: #13: "Rehearsal saved: Help with a noisy hotel room. 8 replies; 2 moments to keep."
  - acceptance: Show the corrected phrases and a short, accurate summary of the learner's demonstrated work skill.
- **minor · rank 6** `LT-petra-38-J4-2` (completion) — The second cue does not address the current difficulty
  - expected: Help supplies language for answering the current date question.
  - got: The booking-number cue repeats after the number has already been supplied. Petra works out the date answer herself.
  - evidence: #4 asks "which arrival date do you need?" and Petra requests help with the date. #5 still offers "Try: Could you say the booking number again?" Petra thinks "I think he asks the date, so I can say today."
  - acceptance: Each cue should respond to the latest question and give a usable next reply; verify that both stuck moments are unblocked by relevant help.
- **minor · rank 6** `LT-tomas-9-J3-1` (senior-quality) — The first correction exceeds his demonstrated comprehension
  - expected: Every interruption provides a correct, understandable improvement worth stopping for.
  - got: Both translations are correct, but only the short “je” → “is” moment meets the combined correctness and usefulness bar. Precision is 1/2, below 0.9.
  - evidence: #3: "My house is blue." and "This is how to say the whole idea in English." His response: "that whole sentence is hard." #8: "‘Je’ means ‘is’ in English."
  - acceptance: Give a tiny bilingual explanation or model one manageable chunk, with at least 90% of moments understandable and useful for this learner.
- **minor · rank 6** `LT-tomas-9-J3-2` (clarity) — One question loses the beginner
  - expected: Questions use familiar words or provide immediate support for new words.
  - got: The hand question exceeds his demonstrated understanding. The other eight partner turns fit, yielding pitch 8/9 and meeting the journey threshold.
  - evidence: #9: "What is in its hand?" He answers "Nevím" and thinks "I don't know what he means by hand."
  - acceptance: Support unfamiliar vocabulary with a tiny explanation or offer a familiar choice when he cannot understand.
- **minor · rank 6** `LT-tomas-9-J3-3` (completion) — The recap counts activity without consolidating learning
  - expected: Finish by reminding him of one or two useful things he practised.
  - got: The recap confirms saving and counts replies and moments, but shows no reusable English.
  - evidence: #13: "Rehearsal saved: My Minecraft house. 8 replies; 2 moments to keep."
  - acceptance: Include one or two short phrases from his scene in the recap, with beginner-friendly support.
- **minor · rank 6** `LT-tomas-9-J4-2` (completion) — No independent retry is demonstrated
  - expected: Replay the moment with a fresh question and let Tomáš answer better without support.
  - got: The transcript ends after three supported replies. No replay or independent attempt appears.
  - evidence: #4 returns with "back"; #9 selects "finish"; #10 reports "3 replies; 1 moments to keep." facts.conversation marks all three learner turns "supported": true.
  - acceptance: Offer an accessible replay and capture a fresh, improved answer without a cue before claiming this journey complete.
- **minor · rank 6** `LT-viktor-67-J3-3` (senior-quality) — The clear garden error receives no repair
  - expected: Gently clarify the intended meaning of mangled speech and model a useful garden sentence.
  - got: The one learner turn with a clear English error receives neither a moment nor corrective coaching.
  - evidence: #5: "My gardens is big tomatoes." #6 moves directly to "Drawing means making a picture with a pencil. Do you eat your tomatoes for lunch?"
  - acceptance: Check the intended meaning and offer a short model such as "I have tomatoes in my garden." Avoid treating uncertain recognition as a proven learner mistake.
- **minor · rank 6** `LT-viktor-67-J3-5` (completion) — The recap reports counts without usable Sunday language
  - expected: A recap that helps Viktor remember and reuse something from the conversation.
  - got: The displayed recap contains a title and counts, with no phrases, meanings, or school exchange to rehearse.
  - evidence: #13: "Rehearsal saved: How is school?. 8 replies; 2 moments to keep." His thought is "That was difficult, and I am glad I can rest now."
  - acceptance: Show one or two reusable phrases with Czech meanings and a simple way to rehearse them.
- **minor · rank 3** `LT-klara-13-J3-2` (senior-quality) — One question stretches beyond supportive A2
  - expected: Use short, familiar questions at A2 while keeping the conversation interesting.
  - got: One partner turn introduces a hypothetical conditional. The remaining eight turns are suitably pitched, so overall pitch still meets the threshold at 8/9.
  - evidence: #10: “If you made your own dance, what move would you put first?” Klára answers “maybe clap hands first because is easy haha.”
  - acceptance: Use an accessible equivalent such as “Let’s make a dance! What is the first move?”
- **minor · rank 3** `LT-tomas-9-J4-4` (effort) — Useful help interrupts the scene
  - expected: Help stays within the conversation and preserves the fun.
  - got: The phrase is useful, but a separate moment screen stops the exchange and requires a return action.
  - evidence: #4 explicitly says "Linga stopped the conversation: a word for this scene." Tomáš selects "back".
  - acceptance: Present the short phrase in the scene and allow an immediate spoken retry.

## What passed

- `LT-tomas-9-J4-6` Supported speaking remains honestly recorded — All three replies and their saved evidence retain supported status.
- `LT-viktor-67-J3-6` The partner remains kind and permits Czech — Viktor can repeatedly explain his difficulty in Czech and end the exchange politely.
- `LT-viktor-67-J4-5` Corrections quote him accurately and preserve his dignity — All four coaching displays quote actual learner replies accurately. The sole moment is correct and useful. Both clearly erroneous learner turns receive coaching or a moment.
- `LT-viktor-67-J4-6` Recorded evidence honestly identifies supported speaking — All five learner replies and all five evidence entries explicitly retain supported status.
- `LT-viktor-67-J3-7` Both moments teach accurate, useful repair phrases — Both moments qualify: precision 2/2, with 2.5 moments per ten learner turns. Their usefulness does not satisfy the separate family-language criterion.
- `LT-klara-13-J3-3` Accurate corrections stay small and spaced out — Both moments are accurate and useful, with four learner replies between their triggering turns. Precision is 2/2 and frequency is 2.5 moments per ten learner turns.
- `LT-klara-13-J3-4` Relevant typed practice sustains eight replies — She discusses shared songs, asks reciprocal questions, and ends the chat herself. The partner follows her goodbye.
- `LT-petra-38-J3-3` Both corrections are accurate and proportionate — Both moments teach valid, reusable A2 grammar. Two moments across eight learner replies equal 2.5 per ten turns, within the rubric's range. Their general usefulness does not satisfy the narrower reception-phrase criterion.
- `LT-petra-38-J3-4` Accessible English supports a complete eight-reply exchange — All nine partner turns use accessible language in a concrete hotel context. Petra completes eight replies and reaches the recap.
- `LT-petra-38-J4-4` The correction is accurate and immediately reusable — The sole moment fixes the past tense and missing article with a useful apology.
- `LT-petra-38-J4-5` The first help request produces a usable reply — The cue helps her form her own polite request, and the partner repeats the number patiently.
- `LT-tomas-9-J3-4` Minecraft sustains eight replies — He names colours, objects and his dog across eight replies, then chooses to finish. Two moments across eight replies equals 2.5 per ten, within the interruption-rate target.
- `LT-tomas-9-J3-5` Not knowing receives reassurance — Alex acknowledges his contribution and continues without blame.
- `LT-tomas-9-J4-5` Czech receives an accurate, kind bridge into English — The moment quotes the exact Czech fragment and supplies a correct, useful English question.
- `LT-viktor-67-J4-7` The family setting yields one useful, repeatable weather phrase — The grandchild and garden setting fits his purpose. A relevant weather cue enables a reply that he later repeats.

## Voices

**Klára · J3** (time saved: 30 min · low)

> i would use it again. talking about BTS was easy to start, and i actually wrote eight replies. i liked that Mina answered my questions and nobody made me use my voice. the two fixes made sense and didn't make me feel stupid. i still forgot “it” again though, so seeing the examples at the end would help. the last screen only told me how many replies and moments i had. most questions felt okay, but the one about making my own dance was harder. i trust those corrections; this chat doesn't tell me whether the level check is accurate. i can't tell from this whether the waits are worth it. i'd tell a friend it is a nice way to practise typing before trying voice chat.

**Petra · J3** (time saved: 0 min · low)

> I understood the English and managed eight replies. The two little corrections made sense, and nothing I saw worried me as a mother. But I wanted to help an angry guest at reception. Instead, I was the tired guest and Mia did my job. That is easier, but it does not help me find the words when someone complains tomorrow. I trust these grammar corrections; this conversation does not tell me whether my level was assessed correctly. The final screen counted my replies but gave me no phrases to take back to work. I would try again if I could be the receptionist. I cannot judge the waits or claim this replaced a lesson from what is shown. I would tell a colleague it feels approachable, but I would not yet recommend it for practising difficult reception situations.

**Petra · J4** (time saved: 0 min · low)

> I would try it again, but I would not recommend it for reception practice yet. A missing booking is exactly what I need. Asking for the number again helped, and I trust “Maybe I made a mistake.” But why was the guest changing my booking and giving me a key? I was already nervous, and that made me more confused. The second hint did not help with the date. I wanted another chance to speak by myself before finishing. A2 feels manageable here, but this did not test my level. Nothing shown worried me for the children, although one hotel scene cannot settle my family decision. I cannot judge the waits or say this replaced a lesson. I need clear roles and a proper second try.

**Tomáš · J3** (time saved: 0 min · low)

> Jo, Minecraft! I would try Alex again. I could say blue, red, creeper and Rex. He was nice when I said nevím. Most questions were short, but I didn't know what “hand” meant. The first English sentence was hard. Then it stopped to tell me “is”, which I already know. I wanted to keep talking about the creeper. The corrections look okay, but I need help saying them. At the end it said eight replies and two moments. Show me something I can say again! I had fun, but I can't tell if the waits saved time. I'd tell Mum I want another Minecraft chat.

**Tomáš · J4** (time saved: 0 min · low)

> Jo, a dog! I liked Pip and saying “yellow ball.” Mia said too much sometimes. I pressed help, but it kept telling me to ask his name. I already knew Pip! The Czech bit was okay. It showed my words and how to say them in English. I wanted to try that question, but Mia had already answered it. Then I finished. I said three things, but I still needed help. Some of this A1 felt hard. I would try the dog game again if Mia used tiny questions. I would tell Mum about Pip, but I cannot do it alone yet. I don't know if it saves club time; this was only a little go.

**Viktor · J3** (time saved: 0 min · low)

> I would try once more if it could explain a difficult word in Czech. Alex was polite, and I was allowed to answer in Czech. I liked learning how to ask someone to speak slowly. But I asked again and again and still understood only tomatoes. Explaining one unknown English word with several more did not help me.
> I wanted to ask my grandchildren about school. I finished without practising that question. The two phrases seem useful, but my garden sentence received no help, so I cannot trust that my mistakes will be explained. The level shown does not feel right for me.
> At the library, the teacher could explain what I did not understand. Here, I cannot say the time saved me a lesson. The final screen gave me counts, not words to practise for Sunday. I would not recommend it to another beginner yet.

**Viktor · J4** (time saved: 0 min · low)

> I would try it again for a short practice before Sunday. Speaking about my tomatoes with a grandchild felt useful, and I managed to remember “It is sunny.” The corrections were polite and used the words I had actually said.
> But when I needed help with colors, it kept showing me sunshine and flowers. Then the coach improved my previous answer. I still could not answer the question in front of me. Prosím, give me the few words I need, and let me try them slowly.
> The simple parts suited me; some later questions were too long. I trust the corrections more than the help. I cannot say it saved me time or was worth the waits from this record. I would tell my daughter about the garden practice, but I would still want my library teacher's help.
