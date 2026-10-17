# radka-41 × MB5 · Is it worth keeping? (recert-1)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** The recap and the Sunday page now tell the truth, and the blockers are fixed. Three minor rows remain: the setup cost, a recap that covers only the seated child, and a new residual where the phone recap read before any event shows yesterday's hints.

## Reachable surface (now)

- Setup on the TV profile rows (`desk/src/tv/profileRows.ts:24,71-85`); the phone profile has only the name (`desk/src/app/phone/page.tsx:538`).
- Evening log per day: `dayed()` in reduce (`desk/src/lib/session/store.ts:664-669,679`).
- Recap tiles, caption and phone line (`desk/src/tv/recapRows.ts:66-80,228-288`; `desk/src/app/phone/page.tsx:735-750`).
- Marks: skipped apart from unsure (`desk/src/lib/rules/marks.ts:28`, `desk/src/lib/rules/maths.ts:241`).
- Code-written questions in cz decimals and Kč (`desk/src/lib/rules/school.ts:1433-1436,3613-3620`).
- Sunday page: homework, papers, unit lines with not-sure/skipped (`desk/src/lib/rules/week.ts:128-131,162-163`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB5-1 log never reset; next night reads as yesterday's | fixed | store.ts:664-669 clears on the first event of a later day, End session included; scratch recap.cjs -> 'A quiet evening.' | 9ee12486 M5 (MB-B12): the evening log is stamped with the local day... |
| L1-radka-41-MB5-2 Sunday page ignores homework and papers | fixed | read/route.ts:56-58; learners.ts:486; week.ts:128-131 | 18789175 MB-B14: a homework sheet and a typed paper write the week... |
| L1-radka-41-MB5-4 24-press setup, silent UK default | recurs | profileRows.ts:24,72,79 unchanged since 12592a71; phone edits only the name | null |
| L1-radka-41-MB5-5 UK decimals and £/€ for a cz learner | fixed | school.ts:1433,3613-3620; scratch q.cjs: 300 cz dec-arith items, 0 £/€, 0 decimal points | eb00c8ee feat(maths): print code-written questions in the learner's decimals and money |
| L1-radka-41-MB5-6 a blank answer shown as the desk's doubt | fixed | marks.ts:28; maths.ts:241; MathsTV.tsx:860; recapRows.ts:258-263 | da50fc86 feat(maths): count skipped items apart from the desk's doubt |
| L1-radka-41-MB5-7 recap and week cover only the seated child | recurs | recapRows.ts:66-80 and page.tsx:740-747 read the seated session; s.away unread | null |
| L1-radka-41-MB5-8 notSure never shown on the Sunday page | fixed | week.ts:162-163 | f47b8b41 MB5-8: the unit line names the last set's not-sure count when above 0 |

## New findings

- **Minor (rank 6), the residual of 2026-10-14 L1-radka-41-MB5-10.** The End-session-first case is **fixed now**: `dayed()` no longer exempts session.end (0a53e75e, UD-13), and scratch recap.cjs reads 'A quiet evening.' What remains: the day reset runs only inside `reduce`. If the phone's Recap tab is opened on day 2 before any TV event, it reads the stored log, because `recapRows` takes hints from `s.log` with no day check (`recapRows.ts:79-80`, `page.tsx:740-744`). It then shows 'Worked through with 3 hints; nothing was marked.' and the old tally as tonight's.

## Notes

- Executed `reduce`/`recapRows`/`recapCaption`, the school generators and `question()` from current source through tools/ts-load.cjs with an isolated DESK_DATA_DIR. The 24-press setup count was not re-run; the rows are unchanged.
