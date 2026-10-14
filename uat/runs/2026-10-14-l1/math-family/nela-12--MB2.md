# nela-12 x MB2 · Practise a topic and get it marked — L1 re-walk (2026-10-14, main 4af25199)

Verdict: **L1-pass** (no major left; three minors still open, none new). Carried 7 rows + 2 strengths: 4 fixed, 3 open (all minor, all recurrence 2).
Time saved if it all worked: **~5-8 min a sheet** (marking by code replaces Mum checking and arguing; with MB1 that is the 15-20 min in the Character file), confidence **medium-low** (no traditional-way number for marking alone). Grounding: **MB-EXPLAIN 6/8** (was 3/8); code-built school sets n-a; **MB-WORKED 3/5** unchanged.

## What I walked

- Topics or Get ready for school -> a unit with a worked lesson teaches first (`keys.ts:481-489`, `513-529`: 'See how first' lit) -> 'Try six' -> practice -> the phone's typed route -> the sheet -> the walk -> second go. Lessons exist for 14 of 17 school units, all my fractions and decimals units included.
- Executed typed marking as a cz learner over six units x 400 seeds x 2 tiers: **4,800 of 4,800** correct answers ticked ('27,88', '£116,15'); 13,712 one-digit mutations: 0 ticked, 0 equal values ringed; 22,884 code-written slip answers (the two I really make, 'added the bottoms' and 'lost the decimal') **0 ticked**, 22,721 named by their own slip, 163 'not sure' (scratch `school.cjs`, `fuzz.cjs`, `slips.cjs`). Suites school-marking 67/67, school-rules 87/87.
- Executed the unsure line: '20/22' for 'simplest form' -> 'The desk is not sure about number 1. The value is right; the question asks for it in its simplest form.' A skipped box -> 'Number 1 has no answer yet.' (`desk/src/lib/rules/kinds.ts:149-157`).
- Explain: the recogniser follows my system (cs-CZ, `desk/src/app/phone/recogniserLang.ts:7`), there is a 'Type it' button (`ExplainTalk.tsx:38`), and the prompt carries my written answer, my working and the slip's line (`desk/src/lib/desk/explain.ts:229-241`).

## Scored criteria

| | Result |
|---|---|
| C2 BLOCKER no wrong tick | pass: 0 false ticks in 18,512 executed answers |
| C3 comma read | pass: 800 of 800 per unit; point form also read (96 of 800 dec-arith point forms, e.g. '1.225', are 'not sure': a point can be a thousands mark in cz) |
| C4 short lines | pass: 53 of 53 slip lines <= 25 words (was 7 over) |
| C6 'not sure' not a guess | pass |
| C8 fractions a 6. ročník meets | holds literally (printed denominators <= 12, no negatives); the range of common bottoms (4/11 - 1/12 = 37/132) and improper-fraction answers ('3/2') still want a teacher |

## Findings this pair

- **Fixed:** L1-nela-12-MB2-1 (reason on the card), -2 (cs-CZ + Type it), -3 (explain 6/8), -5 (slip lines).
- **Open, minor, recurrence 2 (backlog says unbuilt):** -4 questions print '6.8 × 4.1', '£23.23 × 5' and '€17.49 - €12.76' to a cz learner while answers are '27,88' and '£116,15' (MB-B4; the worked lesson shows the same pair; 0 Kč anywhere); -6 teacher sign-off of the tier-2 range (MB-B37); -7 the unsimplified (doubled) form of an add/subtract answer, e.g. 6/4 for 3/2, is ticked right (300 of 300 tried) while the lesson's last step says 'then simplify' (MB-B42).

## In my voice

To je lepší. When I put 4/22 for the one that wants the simplest form, it did not say I got something *different* any more, it said the value is right and the question wants it simplest. That is what I would say to Mum. And a blank says 'no answer yet', not that the computer is confused.

I can talk to it in Czech now, and there is a button if I do not want to. Fine.

Still: why is my sheet in pounds? We have no pounds. And '27,88' I have to write with a comma but the sum above it has a dot. That is the one thing in the whole set that still makes me say 'to je blbost'.

## L2 handoff

- Photo marking of my handwriting (comma, fractions written 3/4 or stacked): **needs Ollama qwen host.**
- Czech speech recognition on a child's voice for the explain step: text engine plus a real phone.
