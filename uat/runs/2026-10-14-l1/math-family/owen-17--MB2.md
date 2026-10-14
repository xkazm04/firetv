# owen-17 x MB2 · Practise a topic and get it marked — L1 re-walk (2026-10-14, main 4af25199)

Owen is **Family mode** by the mode rules: age 17, no stored mode, so `modeOf` gives family (`desk/src/lib/rules/mode.ts:48-52`); a stored "adult" would be refused under 18. He gets no Mode row. Nothing of his belongs to the adult walker.

Verdict: **L1-conditional.** Two majors stand: the content of his fraction sets (recurrence 2) and photo marking of a linear sheet (vision, uncertain). Carried 9 rows + 1 strength: 6 fixed, 2 open, 1 uncertain. New 1 (minor).
Time saved if it all worked: **~0-10 min a session** against marking by hand with a scheme (the value is practice he would not otherwise do), confidence **low**. Grounding: **MB-EXPLAIN 6/8** (was 3/8); linear sets MB-SET **2/7** unchanged; MB-MARK prompt-only 2/6 school, 3/6 linear, unchanged.

## What I walked

- From Paper (MB4) or Topics: Get ready for school labels no year past the path's end and says 'This path ends at Year 9; your year is past it.' (`desk/src/tv/prepareRows.ts:78-93`; UK 17 = year 17 of 17). A unit with a lesson offers 'See how first' lit (`keys.ts:513-529`).
- Executed typed marking of **linear** items (his equations rows) with mixed numbers: '4x + 2 = 5': '1 3/4' wrong, '3/4' right, '7/4' wrong; '2x + 7 = 4': '-1 1/2' right; '7 - 2x = 3x + 1': '1 1/5' right; 'x + 4 = 10': '2 3' not sure. Sweep over 4,000 random equations: **6,720 of 6,720** correct forms (integer, fraction, mixed number, decimal) ticked, **0 of 20,108** wrong forms ticked (scratch `mark.cjs`, `lin.cjs`; `desk/src/lib/desk/verify.ts:155-177`).
- School units: 13,712 mutated answers, 0 ticked; slip lines 53 of 53 <= 25 words, share of measured fixed TV lines <= 25 words **0.991** (was 0.542).
- Executed his fraction sets: 0 of 2,000 frac-add-sub and 0 of 2,000 frac-mul-div specs carry a mixed number, every denominator 2..12; 'A step up' only changes the tier mix (`desk/src/lib/rules/stretch.ts:36-39`).
- Units: '£' on a € item and '31.5 cm squared' / 'sq cm' / 'square cm' are 'not sure' (not wrong); only 'cm2' and 'square centimetres' are right. He sees € items (335 of 2,000) and £ (331).

## Scored criteria

| | Result |
|---|---|
| C2 BLOCKER no wrong tick | pass: 0 false ticks in 45,340 executed answers (4,800 + 13,712 school, 6,720 + 20,108 linear) |
| C7 not worded for a child | content still KS3: 'Work out 5/8 - 1/2.'; the voice is not the young one (rules/voice only under 14) |
| C3, C5 (shared with MB4) | see MB4 |

## Findings this pair

- **Fixed:** L1-owen-17-MB2-1 (blocker, false tick), -2 (false ring), -4 (lines), -6 (unsure wording), -8 (lesson first), -9 (explain).
- **Open:** -3 (major, recurrence 2, backlog MB-B20): fraction sets never practise the forms his mock tested; -5 (minor, recurrence 2): UK-habit units are 'not sure'; new -11 (minor): the equation units have no worked lesson (14 of 17 do).
- **Uncertain:** -7 photo marking of a linear sheet (the prompt asks the model for 'a plain number or simple fraction' and its own value of x). **Needs Ollama qwen host.**

## In my voice

The ticks I can believe now. I typed 1 3/4 where the answer was 3/4 and it rang it, and I typed -1 1/2 where that is the answer and it took it. That was the one that would have cost me a mark in November.

But what it gives me to do is still Year 7. 'Five eighths take away a half.' My paper had mixed numbers and a word problem and I pressed 'a step up' and got the same sort of thing in a different order. If the only thing I can practise is what I already can do, I will not come back after the second set.

## L2 handoff

- Photo of a handwritten linear sheet (mixed numbers, 'x =' forms): **needs Ollama qwen host.**
- Whether the live equation sets are on his level (model-written, MB-SET 2/7): text engine, isolated data dir, a uk profile of 17.
