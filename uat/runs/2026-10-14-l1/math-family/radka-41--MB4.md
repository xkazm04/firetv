# radka-41 x MB4 · Where did the marks go? — L1 re-walk (2026-10-14, main 4af25199)

Šimon's mock is a Czech 9th-grade paper (50 points), which the desk does not model: this is the **out-of-segment** walk, so findings about the statement list are default-bias findings against the planned product (GCSE Foundation for 14-16, plan section b), not defects in it.

Verdict: **L1-conditional.** Both blockers fixed; one major stays (the list is a GCSE one); one new major (an unlabeled share). Carried 9 rows + 1 strength: 7 fixed, 2 open (1 major, 1 minor). New 1 (major).
Time saved if it all worked: **~30 min** of her own (a tutor spends most of a 60-min lesson on the mock; she types it in about 20 min, not 15, because of the pick list), confidence **low-medium**. Grounding: none (code).

## What I walked

- Phone Paper tab, 16 questions. The heading names the child ('A paper Nela sat'); an empty Scored says 'Type 0 if nothing was scored.' (`PaperPanel.tsx:15-16`, `paperEntry.ts:32-38`). The picker has a find-by-words box over 97 GCSE statements in UK wording; 30 of 97 match a jargon test ('HCF, LCM', 'reciprocals', 'standard form', 'loci', 'trapezia'), 11 say 'a harder statement'.
- Executed (scratch `mock.cjs`) a 16-question mock, 21 of 48:
  - **no statement picked**: score card '21 of 48 marks · 27 marks lost'; caption '27 marks were lost on questions that name no statement. Pick what each one tests on the phone.'; topic list '27 marks sit on questions that name no statement.' ('No marks were lost' appears only when none were).
  - **statements picked** (A17, N2, A4, R9): rows 'Add and subtract fractions 4', 'Fractions, decimals and percent 4', 'Multiply and divide fractions 3', 'One-step equations 3' ... sum 27 = lost. An expression question (A4) is 'not on the desk yet', not a share of an equations unit.
  - A topic the desk had as secure reads **'Worth a recheck'** beside its lost marks.
- Select on a row -> that unit's question (`keys.ts:534-545`): 1 press to the unit question, 2 to the set (was 7-18 plus remembering the name).
- No string names GCSE, 1MA1, Edexcel, a grade or a pass prediction (grep); the 6-mark and 80-mark limits are worded as the desk's own.

## Scored criteria

| | Result |
|---|---|
| C1 BLOCKER never the answer | n/a here (MB1) |
| C2 BLOCKER recovery never calls a topic secure or leaves it out against my marks; order by marks lost; total right | **pass**: total exact; 'Worth a recheck', never dropped; rows add up; the prerequisite pull is named in the caption. Each row's number is a share (L1-radka-41-MB4-11) |
| C3 16 questions in <= 15 min, each 'what does it test' answerable from the list or the panel says no match | **fail on time (est. 20-25 min)**; the panel says plainly when a question names no statement |
| C4 every statement understandable to a non-specialist; CERMAT-mappable | **fail**: 30 of 97 jargon-ish and no CERMAT list (L1-radka-41-MB4-4, out of segment) |
| C5, C7 | pass (a not-sure state exists) |
| C6 no board/grade/prediction | pass |

## Findings this pair

- **Fixed:** L1-radka-41-MB4-1 (no 'No marks were lost'), -2 (rows add up; prerequisite pull explained), -3 (Select), -5 (blank Scored; left-out count), -6 (tier facts as the desk's own limits), -7 ('Worth a recheck'), -8 (names the child).
- **Open:** -4 (major, recurrence 2, MB-B7, `scope_note` out-of-segment); -9 (minor, recurrence 2, MB-B40) the set the list leads to never sees the paper.
- **New, major:** L1-radka-41-MB4-11. 'Add and subtract fractions · 4 lost · From 6, 10, 14' - I added up those three questions on the paper and they lost 2 + 2 + 4 = 8 (scratch `rad.cjs`). The totals are right; the row is a share and the TV does not say so, and the statement behind it is computed and never drawn (`RecoveryTopic.codes`, 0 readers under `tv/` and `maths/`).

## In my voice

This is the first time the screen and the paper agreed on the number at the top and on the bottom: 21 of 48, 27 lost, and the rows add up to 27. When I typed it with nothing picked it no longer told me nothing was lost. And I can press a topic and be in it, I do not have to remember what it was called. Fair.

But it asks me, a mother, 'what does question 7 test', and the answer list is 'HCF, LCM' and 'trapezia' and 'loci'. Šimon's test says 'výrazy' and 'rovnice'. I got there by searching 'equation', which is something, but it took me twenty minutes and I guessed on four. And then a row says 4 marks lost on adding fractions and I count 8 on those three questions. I do not know whether I typed it wrong or the desk is wrong, and that is the sentence I came to this product to stop having.

## L2 handoff

- Typing a real 16-question mock on a phone with the find box (C3 time): browser, isolated data dir; no vision.
- A real CERMAT paper through the list: the mapping rate is a product call (concept-doc), not a test.
