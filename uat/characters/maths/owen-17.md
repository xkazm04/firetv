# Owen, 17 — "Grade 3. Again. I need a 4 or I can't do the course."

module: Math Buddy · journeys: MB2, MB4

## Background / lived experience

First year at a further-education college in Leeds, on a Level 2 motor-vehicle course. He got a grade 3 in GCSE maths in the summer. Without a 4 he must keep studying maths, and most students in his position resit (ref 44). In summer 2026 only 15.3% of the 219,135 learners aged 17 and over who resat maths in England got a 4 or above (ref 44). He sits the November resit on the Foundation tier. That is three papers of 1 h 30 min and 80 marks each, and Paper 1 is non-calculator (ref 45). His college maths lecturer gave the class a Foundation Paper 1 mock in September. Owen scored 31/80, and the paper came back with marks beside every question. He has three weekly hours of college maths shared with 25 others.

His mum bought the desk for his little sister. He uses it in the evenings when the TV is free. He is a native English speaker and reads fine, but loses patience fast.

## Voice

Flat, quick, a bit embarrassed: "Just tell me what to revise. Like, the actual topics." Says "that's long" about any paragraph over two lines.

## Jobs to be done

- Turn his marked mock into a short list of what to revise first, worth the most marks.
- Practise those topics without a teacher, a few times a week, and know the practice was marked right.

## What good looks like

He types the mock in once. The TV shows "you lost most of your marks on these three things, start here". Each one leads straight to six questions he can do on paper, with marks he trusts. It is honest when a topic isn't on the desk.

## Pet peeves

Being treated like a Year 7. Revision lists that are just the whole spec. Long explanations. Being asked to do admin before anything useful happens.

## Motivation (time saved)

- Traditional:
  - Without help, he has no way to turn a marked paper into a revision plan, so he revises whatever comes to mind.
  - A lecturer's question-level analysis covers the whole class, not just him. A private tutor would cost about £30–45 an hour; that figure is from training data, unverified.
  - Going back through 80 marks by hand with the mark scheme takes about 45–60 min.
- With Math Buddy:
  - About 15 min to type the mock: roughly 25 questions, each with its marks, what it was out of and up to a few statements.
  - Then a ranked list on the TV, and six-question sets on the first topic at about 20 min each.
- Expected: ~30–45 min saved on turning the mock into a plan. After that, the value is in practice he would otherwise not do at all. These minutes are this file's estimate, not a measurement.

## Senior-quality bar

An FE GCSE resit lecturer would accept that the recovery list is the same priority order they would draw from his mock's question-level analysis. The practice sets would have to be Foundation-level questions on those topics. And every mark would have to be right.

## Scored acceptance criteria

- **C1** BLOCKER: The recovery list's paper total equals the marks he typed (e.g. 31 of 80). Topics are ordered by marks lost, and none is dropped without being listed under "Not on the desk yet".
- **C2** BLOCKER: No wrong answer on a practice sheet is ticked right.
- **C3** He can find the statement each mock question tests within about 30 seconds a question, from the can-text alone, without knowing spec codes.
- **C4** A statement beyond a Foundation paper is flagged as such and is never put at the top of his list.
- **C5** From the first topic on the recovery list, he can get a six-question set on that topic within 3 screens.
- **C6** No screen prints "GCSE", "1MA1", a board name or a predicted grade while the desk's own GCSE map is marked unverified.
- **C7** Questions for a 17-year-old Foundation resitter are not worded for a young child.

## Surface binding

Profile type `high-school`, age 17, school system `uk`, Maths course School maths, Family mode (under 18: no Mode row, `desk/src/tv/profileRows.ts:74`).

- Route `/phone`: the Paper tab (`desk/src/app/phone/page.tsx:632`), drawn by PaperPanel. Its rows are question, scored and out of (`desk/src/app/phone/PaperPanel.tsx:28`), and its picks come from the statement list by area (`desk/src/app/phone/PaperPanel.tsx:33`). Send moves the TV to `paper` (`desk/src/lib/session/store.ts:598`). The phone follows `paper` to the Paper panel (`desk/src/app/phone/panelFor.ts:44`). He also uses `practice`, snap or typed (`desk/src/app/phone/page.tsx:474`).
- Route `/tv`:
  - `paper`: the topics where marks were lost, the score card and "Not on the desk yet" (`desk/src/maths/MathsTV.tsx:694`, `desk/src/maths/MathsTV.tsx:728`). Back or Menu goes to `prepare` (`desk/src/tv/keys.ts:487`).
  - `prepare`, labelled by UK Year (`desk/src/tv/prepareRows.ts:16`). The two-cell question there, The usual or A step up, writes a set (`desk/src/tv/keys.ts:476`).
  - `practice`, `sheet` and `walk`.
  - `topics` from Tonight (`desk/src/tv/keys.ts:303`).
- **Not reachable from the `paper` list itself:** Select on a recovery row is not handled. The `paper` handler moves the focus only (`desk/src/tv/keys.ts:485`), so getting from a row to its practice goes through Back to Get ready for school.
- **Unreachable:**
  - A photo of his marked mock: typed entry only (no caller of `desk/src/lib/desk/paperRead.ts:52`).
  - Higher-tier content beyond the statements flagged.

## References

`uat/references.md`:
- 44: GCSE resits, numbers and the funding condition.
- 45: the 1MA1 Foundation paper format.
- 40: marking minutes.
- 41: answer-giving AI.

The question-level-analysis practice and UK tutor rates are from training data, unverified.
