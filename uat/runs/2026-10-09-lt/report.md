# LT run 2026-10-09-lt — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 1 Characters · 4 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 0 of 1

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| tomas-9 | J1 | fail - D3 failed: #8 Task 4 was too long for him ("Too long and hard, I don't understand, I want…; D5 failed: #10 focus "like 'The ball was red'" uses past 'was', beyond an A1 learner who …; C2 failed: Task 4 (#8): "Think about your last game of Minecraft. What did you build or f… | fail | 2/3 | A2 vs A1 · near |  |  | 0 | 10 | 3.4 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 0 · near 1 · miss 0
- **judge agreement:** 5/5 (100%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 11 calls, 0 failed, avg 6s · character 10 calls, 0 failed, avg 14s · judge 1 calls, 0 failed, avg 32s
- **driver coverage:** 9 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 18** `LT-tomas-9-J1-1` (clarity) — Task 4 prompt too long for a nine-year-old
  - expected: A prompt of 15 words or fewer, such as 'What do you build in Minecraft?'
  - got: A 24-word, three-part open prompt asking for two or three sentences.
  - evidence: #8 "Think about your last game of Minecraft. What did you build or find, and why was it fun? Tell me in two or three sentences." Tomáš: "Too long and hard, I don't understand". · check task generation prompt
  - acceptance: For elementary profiles every task prompt is 15 words or fewer, one question.
- **major · rank 12** `LT-tomas-9-J1-2` (senior-quality) — A2 placement is inflated by guessing and keyword spotting
  - expected: A1 for a child who gets only single words.
  - got: A2, from a 50/50 choice pass and a listening pass on 'red'.
  - evidence: #6 "I'll just guess the second one"; #9 "red? dog... red" scored pass; #10 "A2 · Everyday basics". · placement scoring
  - acceptance: Two-option choice passes get lower weight, and a lone keyword is scored partial.
- **minor · rank 6** `LT-tomas-9-J1-3` (senior-quality) — Next focus uses past tense beyond his level
  - expected: A focus sentence using only 'like' or 'is', such as 'I like dogs.'
  - got: "The ball was red" and "The dog broke the wall" as models.
  - evidence: #10 focus "like 'The ball was red' or 'I like dogs.'" · verdict focus prompt
  - acceptance: Focus examples match the pre-A2 grammar of the child's actual answers.

## What passed

- `LT-tomas-9-J1-4` Skips and Czech answers are met kindly — Warm, non-judging notes.
- `LT-tomas-9-J1-5` Minecraft and dog themes keep a child engaged — Tasks and questions were about Minecraft and dogs.

## Voices

**Tomáš · J1** (time saved: 10 min · low)

> Minecraft a psi, to jo! The first questions were okay and I liked "Creeper! Nice one." The dog task I understood. But then the long Minecraft one, "two or three sentences", nevím, I wanted to stop, it felt like school. Listening was fast; I only caught dog and red. It said A2 and "Well done", which is nice, but I guessed the 'took' one, so I don't quite believe it. Also "The ball was red" is too hard for me; I only say "I like dog". It didn't make me feel stupid, which matters. Mum would like that it's only a few minutes at home. Shorter tasks, more dogs, and I would use it again.
