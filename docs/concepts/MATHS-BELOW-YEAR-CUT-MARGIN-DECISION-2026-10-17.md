# Maths below-year cut margin: decision record of 2026-10-17

State described: main at 7107748f. Source files: `desk/src/lib/rules/recovery.ts`, `desk/src/lib/library/gcse.ts`. Commits: 37425037, 4b82f0a3 (the cut), 7107748f (the margin). Findings: L1-vojtech-18-MB4-2 (the cut's reason) and L1-radka-41-MB4-2 (the cut's overreach), both in `docs/uat-insights/2026-10-17-maths-l1-recert-2.md`. This record states what the code and commits show; one residual is open (section 5) and the row is not closed.

## 1. Constraint that forced the choice

MB4-2 (L1-vojtech-18): a Czech maturita learner's lost marks on a statement that only partly links to a unit far below their year were being sent to that unit (a cylinder volume, G17, to Area of rectangles; an inequality, N1, to Equivalent fractions). `touches` claims only that a unit practises part of a statement (`gcse.ts:141-142`). 37425037 and 4b82f0a3 cut such a link: a partial link to a unit below the learner's year goes to "not on the desk yet", and a unit named in `WHOLE` stays (`gcse.ts:146-155`). 4b82f0a3 also made the seated learner's Reader reach the paper list and the practice aim (`readerOf`, `recovery.ts:172`).

The first cut applied at any year above the unit. It stranded school-age learners: for the paper [N2 0/3, N1 1/3, A1 0/2] a UK 12-year-old, a CZ 12-year-old and a CZ 14-year-old got no topic and the caption "None of these has a topic on the desk yet." (7107748f message; recert-2 watch item, `2026-10-17-maths-l1-recert-2.md:54-70`). It was filed as L1-radka-41-MB4-2, major 12 (frequency high, reachability med, trust erosion med; same file, line 50 and line 70), because Radka's Šimon (CZ 14) hits it on his CERMAT mock. 4b82f0a3 had hidden it by moving two fixtures (Ema from 12 to 8; the aim 4 and aim 5 learners), so no test pinned a school-age learner's fraction statement.

## 2. Decision

| id | decision | evidence | status |
|---|---|---|---|
| D1 | `past()` cuts a partial link only when the learner is MORE than `PAST_MARGIN` = 3 school years above the unit's year: `year - unitYear > PAST_MARGIN` (`recovery.ts:185`, `recovery.ts:189-190`). The cut filter is unchanged: a unit stays if `!past(id)` or it is in `WHOLE[code]` (`recovery.ts:200`). | The year is `schoolYear(system, age)` = age - `SYSTEM_START` + 1 (`syllabus.ts:296`, `syllabus.ts:302`); Equivalent fractions sits at UK 5, CZ 5 (`syllabus.ts:69`). A UK or CZ 12-year-old is 3 or 2 years past it, so it stays; a CZ 18 learner is far past. | built, 7107748f |
| D2 | `WHOLE` gains N2 -> frac-add-sub, frac-mul-div and N8 -> frac-add-sub (`gcse.ts:147-148`). These stay in reach however far past the unit the learner is. | A statement whose core is the unit is not a partial link. The N2 aim test comment says N2 "is all of adding and subtracting fractions" (`paper-aim-test.cjs:135`). | built, 7107748f |
| D3 | N1 -> frac-equivalent is NOT added to `WHOLE`. N1 stays a partial link (`gcse.ts:41`). | See section 3, alternative A3. | decided, no code |

## 3. Alternatives that lost

| id | alternative | why it lost |
|---|---|---|
| A1 | Revert the cut (37425037/4b82f0a3). | It re-opens MB4-2 for the CZ 18 learner: G17 and N1 would again route to Area of rectangles and Equivalent fractions. The CZ 18 case is still pinned (`recovery-rules-test.cjs:241-262`, `recovery-rules-test.cjs:282-286`). |
| A2 | A margin of 0 to 2. | Still strands the 12 to 14 learners the finding names. The recert note proposed "more than three school years" (`2026-10-17-maths-l1-recert-2.md:70` fix direction), and the commit chose 3. The commit does not record a measured test of margins 0 to 2; the reason against them is the stranded-learner list in section 1, and I am not adding a figure the sources do not show. |
| A3 | Add N1 -> frac-equivalent to `WHOLE`. | The commit states it "would undo the CZ-18 N1 cut that MB4-2 pins in recovery-rules-test and paper-aim-test". Both pins exist: `recovery-rules-test.cjs:246-248` (the inequality, N1, is not on the desk for CZ 18) and `paper-aim-test.cjs:391-402` (N1 off the desk for the seated maturita learner). |

## 4. Consequences

- A learner within 3 years of a unit keeps every partial link to it. A UK or CZ 12-year-old reaches Equivalent fractions through N1, and the three fraction-and-notation statements stay on the desk (`recovery-rules-test.cjs:264-287`).
- N2 and N8 reach the fraction units for any age, including CZ 18 (`recovery-rules-test.cjs:281`).
- The CZ 18 learner keeps the cut: for the same paper the topics are frac-add-sub and frac-mul-div only, and A1 and N1 are not on the desk (`recovery-rules-test.cjs:282-286`).
- The margin is one constant for every unit and system. A unit placed a year late or early in the syllabus table moves the cut for its learners (`syllabus.ts:64-67` itself calls the CZ/DE years "from memory, unchecked").

## 5. Open residual: a CZ 14-year-old's N1

Not fixed, not closed. A CZ 14-year-old is in 9. ročník (14 - 6 + 1 = 9, `syllabus.ts:296`, `syllabus.ts:302`), four years past Equivalent fractions at CZ 5 (`syllabus.ts:69`); 4 > `PAST_MARGIN` (`recovery.ts:185`), and N1 is not in `WHOLE`, so N1 marks go to "not on the desk yet". The commit says so directly. The same arithmetic puts a UK 14-year-old (Year 10, 5 years past) in the same state; the sources do not mention this case, it follows from the code. Šimon, the finding's CZ 14 learner, keeps N2 and A1 but loses N1.

Watch item for the recert-3 re-walk of L1-radka-41-MB4-2: re-walk the paper [N2 0/3, N1 1/3, A1 0/2] for a CZ 14 reader and ask whether an N1 loss with no topic on the desk is acceptable for a school-age learner. Do not mark the row fixed on the strength of 7107748f; it fixes N2, A1 and the 12-year-olds, not this. Options the recert would weigh, none chosen here: a per-statement or per-system margin, a different margin only for N1, or accepting the gap and saying so in the caption.

## 6. How it is pinned

- `tools/recovery-rules-test.cjs`, test `MB4-2: a maturita learner past a unit does not have a partial link send their marks to it` (line 241): CZ 18 cut, a CZ age 10 learner keeps the old routing.
- Same file, test `L1-radka-41-MB4-2: a school-age learner at or near a unit's year keeps the fraction units; the maturita learner keeps the cut` (line 264): UK 12, CZ 12 and CZ 14 keep N2 and A1 units and have no N2 or A1 off the desk; UK 12 and CZ 12 reach `frac-equivalent` through N1; N8 stays reachable at CZ 18; CZ 18 keeps the cut.
- The restored fixtures of 7107748f: Ema at age 12 in `tools/maths-tv-test.cjs:1029` (test `RP3 a`, line 1027), and `seat()` at the default age 14 with `frac-add-sub` in the `aim 5` test (`tools/paper-aim-test.cjs:136`; the default age 14 is at line 46) and in `aim 4` (`paper-aim-test.cjs:127`).
- `tools/paper-aim-test.cjs:391-402` pins the maturita side (N1 off the desk for CZ 18 through the Reader).
- No test pins the CZ 14 N1 gap as intended: `recovery-rules-test.cjs:264-287` asserts N2 and A1 for CZ 14 but does not assert N1 either way.
