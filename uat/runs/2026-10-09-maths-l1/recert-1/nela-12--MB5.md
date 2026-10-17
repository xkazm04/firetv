# nela-12 × MB5 · Is it worth keeping? (recert-1)

- Character: nela-12, with Mum (Radka) beside her. Profile `elementary`, 12, `cz`, School maths, Family.
- Journey: MB5 · Is it worth keeping?
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** Both blockers and the week-page major are fixed. Three minors remain: the silent UK default with a blurb that does not name the number format, the school year off by one, and the phone recap showing yesterday's hints before any event on a new day.

## Reachable surface (now)

- Recap caption: `desk/src/tv/recapRows.ts:228-238`. The tiles come from tonight's history plus `s.log` (`recapRows.ts:66-80`). The TV shows them at `desk/src/tv/screens.tsx:328-335` and the phone at `desk/src/app/phone/page.tsx:740-746`.
- Evening log per day: `desk/src/lib/session/store.ts:664-669` (dayed), run by every `reduce` (`store.ts:679`).
- Week page: homework digest written at `desk/src/app/api/read/route.ts:46-59`; Sunday page at `desk/src/lib/rules/week.ts:230-232,289-300`.
- Profile: `desk/src/tv/profileRows.ts:24-33`. School year: `desk/src/lib/library/syllabus.ts:296-304`, `desk/src/lib/rules/stretch.ts:74-78`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB5-1 "all of it right" with nothing marked | fixed | `recapRows.ts:228-238`. Hints only: "Worked through with 3 hints; nothing was marked."; Linga only: "One conversation in English; nothing to mark." (scratch `recap.cjs`) | 715ce1ef M6 (MB-B11): the recap caption says 'all of it right' only when an item was marked... |
| L1-nela-12-MB5-2 evening log never resets | fixed | `store.ts:664-669,679`. Repro: 3 hints on day 1, End session first on day 2 -> log.hints 0, "A quiet evening." | 9ee12486 M5 (MB-B12): the evening log is stamped with the local day... |
| L1-nela-12-MB5-3 week page blind to homework | fixed | `read/route.ts:46-59` digest entry; `week.ts:230-232,289-300` | 18789175 MB-B14: a homework sheet and a typed paper write the week; the Sunday page says them |
| L1-nela-12-MB5-4 silent UK default; blurb does not name 0,5 | recurs | `profileRows.ts:24` DEFAULT_SYSTEM 'uk', `:29` blurb unchanged. '0,5' under uk is unsure ("cannot read this as one number"), right under cz (scratch `sys.cjs`). The card wording improved, the cause did not | null |
| L1-nela-12-MB5-5 12-year-old taken for 7. ročník | recurs | `syllabus.ts:302-304` ignores the cut-off; learnerYear({12, cz}) = 7 | null |

## New findings

- **Minor (rank 4), the residual of 2026-10-14 L1-nela-12-MB5-7.** The stated defect is fixed: End session as the first event of a new day now clears the log, because dayed() no longer skips session.end (0a53e75e). Still true: the log is cleared only when an event is reduced, and `recapRows.ts:79` reads `s.log.hints` without checking `s.log.day`. So the phone's Recap tab, opened on day 2 before any desk event, passes its guard and reads "Worked through with 3 hints; nothing was marked." (scratch `recap.cjs`).

## Notes

- The repros run the real reducer with Date.now moved across midnight (scratch `recap.cjs`); no model, scratch DESK_DATA_DIR.
