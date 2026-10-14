# owen-17 x MB4 · Where did the marks go? — L1 re-walk (2026-10-14, main 4af25199)

Family mode (see owen-17--MB2): age 17 is under 18, no Mode row.

Verdict: **L1-conditional.** The two prior blockers and the main major are fixed; one new major is the cost of the fix (a share nobody labels). Carried 7 rows + 2 strengths: 6 fixed, 1 open (minor, recurrence 2). New 1 (major).
Time saved if it all worked: **~25-35 min** for turning the mock into a plan (the file says 30-45; typing 25 questions with a statement each is probably 20 min, not 15), confidence **medium**. Grounding: not an AI surface (code); the set it leads to is MB2's.

## What I walked

- Phone Paper tab: heading 'A paper Owen sat', Send 'Send 24 questions to Owen's record' (the 25th is left out with its reason) (`desk/src/app/phone/PaperPanel.tsx:15-16`). Each row has a 'Find by words' box that narrows the 97 statements and opens the matching area (`paperEntry.ts:60-67`).
- Executed a 25-question mock (typed 31 of 87; the 80-mark cap left out the last row, so the TV paper is **28 of 80 · 52 lost**; `recovery.ts` says why in words) through `recovery()` and `paperView` (scratch `mock.cjs`):
  - 14 topic rows sum **39**, 4 off-desk statements sum **13**: 52 = the paper's loss. Over 2,000 random papers: **0** breaches of topics + off-desk + unmapped = lost.
  - Score card: '13 of 52 lost marks are not on the desk yet.'; aside: '4 statements the desk has no topic for, after the topics.' Every off-desk statement is walked by name (primes, simultaneous equations, area under a graph flagged 'a harder statement', sorted after a Foundation one of equal loss). Nothing is 'and 10 more'.
  - Caption: 'Start with Fractions, decimals and percent. The list runs from the biggest loss, with the base each one needs first.'
- Select on a recovery row -> Get ready for school on that unit, question open (lit on 'See how first' if it has a lesson) -> Select -> the set. That is 2-3 screens (`keys.ts:534-545`).
- No user-facing string in `maths/`, `tv/`, `app/phone/` or `rules/recovery.ts` names GCSE, 1MA1, Edexcel, a grade or a prediction (grep).

## Scored criteria

| | Result |
|---|---|
| C1 BLOCKER total = what I typed; ordered by marks lost; nothing dropped silently | **pass**: total exact, rows add up; a capped row is named; ordering is marks lost with a prerequisite pulled first, and the caption says when that makes the first row not the biggest |
| C2 BLOCKER no wrong tick on a practice sheet | pass (see MB2) |
| C3 find the statement in ~30 s from the can-text | **uncertain**: find-by-words helps; 97 GCSE statements, 30 with jargon; est. 25-40 s a question |
| C4 beyond-Foundation flagged, never top | pass: 'a harder statement', sorts after a Foundation one of equal loss, cannot be a topic row |
| C5 first topic -> six in <= 3 screens | pass (paper -> unit question -> set; lesson-first adds the worked screen) |
| C6 no GCSE/1MA1/board/grade | pass |
| C7 not worded for a child | content is MB2's |

## Findings this pair

- **Fixed:** L1-owen-17-MB4-1 (rows add up), -2 (off-desk statements named), -3 (Select on a row), -4 (harder statement sorted), -5 (picker findable), -7 (no 'Year 5-9').
- **Open, minor, recurrence 2:** -6 the 25 typed rows live only in React state until Send (MB-B22; the backlog records the App Master's ruling RP5 that a kept draft stays open).
- **New, major, recurrence 1:** L1-owen-17-MB4-10. 'Add and subtract fractions: 4 lost · From 2, 3, 8, 21' - those four questions lost 8 marks on the paper (1+3+2+2). The row is a share (a question that tests several topics gives each a whole-mark part), and no line on the TV says so; the statement behind a share (`RecoveryTopic.codes`) is computed and never drawn.

## In my voice

Right. That is the list I wanted. 'Where the marks went', my total is the one I typed, and the bit it cannot teach me is written down: primes, simultaneous equations, a graph one. At least it does not pretend. Press on a row and I am on that topic, not hunting for it through seventeen cards.

One thing does not add up and I did the sum on my paper: it says 4 marks lost on adding fractions and I lost 8 on those questions. It is probably splitting a mark between fractions and decimals, fine, but say so on the screen. If one number is not mine I start doubting the others.

And 'Year 5 to Year 9' is gone. Thanks.

## L2 handoff

- Time to type a real 25-question mock with a pick each, on a phone (C3): browser plus an isolated data dir; no vision.
- Whether the first topic's set is on his level (model-written equation units): text engine.
