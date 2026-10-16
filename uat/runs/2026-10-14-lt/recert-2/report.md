# LT run 2026-10-14-lt/recert-2 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 1 Characters · 21 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 4

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| tomas-9 | J1 | fail - D3 failed: #7-#8 he thought 'Too hard, I only understood Minecraft and creeper'; #4 'Dlou…; D5 failed: #10 'answered with a short English sentence' is false; focus 'Practise "Hrát M…; C2 failed: #4 question 3 is ~25 words; #7 listen line ~22 words ('I built a big house in …; C5 failed: #4 'Cool, Minecraft and videos! What would you like to do in English? Talk to …; C6 failed: #10 summary says 'answered with a short English sentence' but he said 'Minecra… | fail | 2/5 | A2 vs A1 · near |  |  | 0 | 10 | 3 | done |
| tomas-9 | J2 | fail - D2 failed: #2-#4 three swaps of "What I did after school" left it unchanged; #6 it is sti… | fail | 4/4 |  |  |  | 0 | 7 | 1.7 | done |
| tomas-9 | J3 | fail - D2 failed: Many Mia turns are above a near pre-A1 child: "Does your dog help you dig diam…; pitch 10/23 (43%) under 80%; C4 failed: #1 list: Minecraft ×3 and "Dogs and football" fit him. The list also offers "A…; C5 failed: #13 "Wow, a diamond room sounds so shiny! Your dog is a great helper. What is … | fail | 3/5 |  | 10/23 | 2/2 | 0 | 27 | 8.8 | done |
| tomas-9 | J4 | fail - D3 failed: #17-#18 replay only asks him to repeat the given 'I like creepers.'; no fresh …; D4 failed: The turn after cue help at #14 ('Minecraft. I like creeper. Dog!') is recorded…; C5 failed: #21 'Ha, dogs are cute! Dogs can help you in Minecraft too. Four o'clock, OK?'…; C6 failed: #16 'Creeper is a countable noun, so it needs an s when you mean more than one… | fail | 2/4 |  | 4/7 | 1/1 | 0 | 22 | 5.3 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 1 · miss 0
- **judge agreement:** 4/5 (80%)
- **topic fit:** fit 9/14 (64%) · safe 14/14 (100%)
- **pitch:** at band 14/30 (47%) · below 0 · above 16
- **moment precision:** 3/3 (100%)
- **moment recall:** 3/22 (14%)
- **boundaries:** 0 breach(es)
- **reliability:** tutor 42 calls, 0 failed, avg 8s · character 66 calls, 0 failed, avg 12s · judge 4 calls, 0 failed, avg 37s
- **driver coverage:** 62 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 27** `LT-tomas-9-J4-1` (effort) · recurs `LT-tomas-9-J4-4`, recurrence 3 — Help loops: quiz shown again, no sayable reply
  - expected: Help gives a short phrase he can say, then the reply box works.
  - got: Quiz 'Which answer makes a plan?' repeats three times; each time it returns 'Now use the idea in your own reply on the phone.' Pause & coach is disabled.
  - evidence: #5-#10: pick-phrase then quiz again, three cycles before he typed 'Minecraft yes. Four.' · cue/quiz help state machine
  - acceptance: Choosing a phrase fills or reads the phrase for him to say; no repeat quiz.
- **blocker · rank 27** `LT-tomas-9-J2-1` (completion) · recurs `LT-tomas-9-J2-1`, recurrence 2 — Swap does nothing; unwanted school topic stays and is agreed
  - expected: Swapping 'What I did after school' removes it and shows a new topic.
  - got: Three swaps changed nothing; the topic stayed and was agreed in the plan of 7.
  - evidence: #2-#4 same list after each swap; #6 "What I did after school" still listed; #6 agree. · plan swap handler
  - acceptance: After Swap, the swapped topic is absent and a different one takes its place.
- **blocker · rank 18** `LT-tomas-9-J1-1` (clarity) · recurs `LT-tomas-9-J1-1`, recurrence 3 — Listening lines too long and past-tense for a pre-A1 child
  - expected: About 10 words, known vocabulary, present tense
  - got: ~22-word past-tense lines at tasks 3-4
  - evidence: #7 'I built a big house in Minecraft last weekend, but then a creeper blew up one wall.' Tomáš: 'Too hard'; #8 same. · check task generation prompt
  - acceptance: For elementary profiles, listen lines are <=10 words, present tense, known words.
- **blocker · rank 18** `LT-tomas-9-J1-3` (senior-quality) · recurs `LT-tomas-9-J1-2`, recurrence 3 — Grammar-form choice pairs reward guessing
  - expected: Meaning-based choices
  - got: 'I want play' vs 'I want to play' pairs
  - evidence: #5-6; verdict #10 admits 'rests on answers chosen from two options'. · check choose task prompt
  - acceptance: Choices differ in meaning, not grammar form, for children.
- **blocker · rank 18** `LT-tomas-9-J3-2` (missing) · recurs `LT-tomas-9-J3-4`, recurrence 3 — Czech answers and "nevím" get no model sentence or coaching
  - expected: A short English model such as "I build a house." or a Czech-to-English prompt
  - got: Mia accepts everything; no coaching or moment on most Czech turns
  - evidence: #6-#8, #10-#20: "Dog je se mnou. Dog is... nevím." and "Wolfie je můj friend" got no help. Coaching is null. · coaching trigger / moment rules
  - acceptance: When a learner reply is mostly Czech, offer one short English model sentence he can repeat.
- **blocker · rank 18** `LT-tomas-9-J4-2` (senior-quality) · recurs `LT-tomas-9-J4-3`, recurrence 3 — Partner turns too long and above A1 for a 9-year-old
  - expected: One very short sentence and one question.
  - got: Three-sentence turns, two questions, present continuous.
  - evidence: #21 'Ha, dogs are cute! Dogs can help you in Minecraft too. Four o'clock, OK?'; #14 'What are you doing in Minecraft right now?' · partner prompt, A2 band for elementary
  - acceptance: Partner turns at most 8 words with one question for elementary profiles.
- **blocker · rank 18** `LT-tomas-9-J1-2` (trust) — Verdict summary misdescribes the answer
  - expected: Accurate feedback: he answered in Czech with one word
  - got: 'answered with a short English sentence'; Czech answer judged pass
  - evidence: #10 summary vs response 'Minecraft. Hrát Minecraft.' · placement summary prompt
  - acceptance: Summary quotes what the learner actually said; Czech-only is partial.
- **blocker · rank 18** `LT-tomas-9-J3-1` (senior-quality) — Partner English is above a pre-A1 nine-year-old
  - expected: Very short sentences, known words, one simple question per turn
  - got: Multi-sentence turns with "shiny", "brave", "helper", "Will your wolf help you dig diamonds, like your dog?"
  - evidence: #13, #15, #16: "A wolf and a dog, what a great team! You have lots of shiny diamonds. Do you have a name for your wolf?" He replies in Czech with "I like X". · conversation partner prompt (band A2 for an A1 child)
  - acceptance: For an elementary A1 learner, partner turns are at most 8 words and one question, using known vocabulary.
- **blocker · rank 18** `LT-tomas-9-J4-4` (trust) — Supported replies mis-recorded
  - expected: Replies after help marked supported; others not.
  - got: A reply after cue help is supported:false; an unhelped reply is supported:true.
  - evidence: #14-#15 vs #13; facts.conversation turns · evidence recording of supported
  - acceptance: Supported flag follows help used on that turn exactly.
- **major · rank 12** `LT-tomas-9-J1-4` (clarity) — About-you questions too long for a child
  - expected: One tiny question
  - got: Three-option 25-word question
  - evidence: #4 'Talk to friends, play games, or watch videos without subtitles?' · linga check intro prompt
  - acceptance: Questions <=10 words, one choice.
- **major · rank 12** `LT-tomas-9-J2-2` (senior-quality) — Past-simple and 'going to' topics above a near pre-A1 nine-year-old
  - expected: Topics using words and structures an A1 beginner has.
  - got: Goals ask for "simple past sentences" and "going to", with jargon-y 'why' lines.
  - evidence: #2 "helps you practise past sentences"; #6 "give a short reason with going to". · plan topic generation prompt
  - acceptance: For elementary profiles, topic goals use present simple, 'like', 'is' only.
- **major · rank 12** `LT-tomas-9-J3-4` (effort) — Conversation drags and loops for a nine-year-old
  - expected: A short scene that ends naturally after about eight replies
  - got: 22 replies; Mia circles back to "What do you do in that game?"; he says he is tired
  - evidence: #14 "Dlouhé, chci skončit"; #26 Mia repeats her question from #3. · conversation closing rule
  - acceptance: The partner closes the scene after the mission is met, in about 8 turns.
- **major · rank 12** `LT-tomas-9-J4-3` (clarity) — Moment note uses grammar jargon
  - expected: Plain child words, e.g. 'Many creepers: add s'.
  - got: 'Creeper is a countable noun, so it needs an s...'
  - evidence: #16 and #22 · moment prompt
  - acceptance: Moment 'why' under 8 words with no grammar terms for age 9.
- **major · rank 12** `LT-tomas-9-J4-5` (completion) — Replay is repetition, not a fresh question
  - expected: A new question after the moment.
  - got: He repeats the fix, then Sam asks 'Four o'clock, OK?' again.
  - evidence: #17-#19 · moment replay
  - acceptance: After the replay, Sam asks a new simple question that needs the fixed form.
- **minor · rank 6** `LT-tomas-9-J1-5` (senior-quality) — Next focus parrots Czech words
  - expected: Teacher-like focus with an English word to try
  - got: 'Practise "Hrát Minecraft." in English as "play Minecraft"'
  - evidence: #10 focus; 'Your words: “Hrát Minecraft.”.' has a stray period · placement focus prompt
  - acceptance: Focus is a clean model phrase, no quoted Czech.
- **minor · rank 6** `LT-tomas-9-J2-3` (clarity) — Plan text too long and school-flavoured for a 9-year-old reader
  - expected: Tiny labels, picture-led choices.
  - got: Long why lines and 'Understand and repair', 'Connect with people' category labels.
  - evidence: #2 "Understand and repair", "Connect with people".
  - acceptance: Child profile topic cards show one short line.
- **minor · rank 6** `LT-tomas-9-J3-3` (effort) — Second moment repeats the first
  - expected: A new, different thing to learn
  - got: "Já stavím" → "I'm building" repeats the lesson from "Já stavím dům"
  - evidence: #9 and #27: "2 moments to keep" are the same phrase. · moment dedupe
  - acceptance: Do not raise a moment on a phrase already taught in the same scene.
- **polish · rank 2** `LT-tomas-9-J3-6` (clarity) — Situation list includes grown-up situations for a 9-year-old
  - expected: Child-suited situations only
  - got: "A booking that is missing", "Our group project" and "The lost jacket" sit in the child's list
  - evidence: #1 phone list. · situation catalogue filter
  - acceptance: Filter the situation list by profile type.

## What passed

- `LT-tomas-9-J1-6` Skips and Czech answers handled kindly — 'Skipped. That tells Linga something too.' and Czech accepted
- `LT-tomas-9-J2-4` Added topic keeps his words — "Dogs and football" added with matching why line.
- `LT-tomas-9-J3-5` Warm, safe tone and a Minecraft-based scene — Mia praises, follows his Minecraft story and reassures him on "nevím"
- `LT-tomas-9-J4-6` Warm, never failing, and the fix quotes him — Sam reacts to his words ('Ha, no creeper, good plan!'); the moment quotes 'I like creeper.' and shows 'I like creepers.'

## Voices

**Tomáš · J1** (time saved: 10 min · low)

> Hmm. The Minecraft bit was fun, I knew "Minecraft" and "play". But then the voice talked long and fast about a house and a creeper blowing up a wall, and I understood nothing, so I pressed "nevím" twice. It didn't tell me I was bad, good. Then it said I wrote a short English sentence, but I only said "hrát Minecraft", that's Czech! So I don't really believe it. A2 sounds big for me. The questions at the start were also too long, like homework. Mum could use it for a quick level, but I'd want tiny questions with dogs and Minecraft, one word answers. I'd maybe try again if it were shorter.

**Tomáš · J2** (time saved: 10 min · low)

> Minecraft first, super, and when I wrote dogs and football it came right away. That felt clever. But I pressed swap on the school one three times and nothing happened, it stayed there. I don't want school, nechci! Then I agreed anyway because Mum's phone was waiting. The words under each topic are long and some say "past sentences", I don't know that. I'd use it again for Minecraft, but if I can't say no to things it feels like homework. I'd tell a friend only after they fix the swap button.

**Tomáš · J3** (time saved: 20 min · low)

> Mia was nice and I liked talking about Minecraft and Wolfie. But her questions got long, like "Will your wolf help you dig diamonds, like your dog?". I did not understand all of it, so I said it in Czech and added "I like diamond". Nobody showed me how to say it in English except "I'm building", and then I got that same thing again at the end. It went on too long; I wanted to play Minecraft. It was better than the club, because I talked the whole time and nobody laughed. I would come again if Mia spoke shorter and showed me one new English sentence each time. I don't trust that my English got better. Mum would like that it is only ten minutes, and I would tell my friend it is fun, but "easy" it was not.

**Tomáš · J4** (time saved: 15 min · low)

> Creeper, jo, I liked talking about Minecraft and Sam said "no creeper, good plan", that was funny. But the help was annoying. I pressed the buttons and got the same "which answer" thing again and again, like school. In the end I just said my own words: "House. Minecraft house." Sam's questions got long, "What are you doing right now", nevím. The fix said something about "countable noun". I don't know what that is! I did say "I like creepers" when it showed me, so that was OK. Then Sam asked the same four o'clock question and I said yes again. I would try it again for Minecraft, but only if the help just tells me what to say. Maybe Mum would like that it's at home, not a club.
