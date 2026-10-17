# radka-41 × MB5 · Setting up and the evening's recap (recert-2)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-conditional.** All three open rows recur unchanged; none was touched by the new commits.

## Reachable surface (now)

- TV profile rows (`desk/src/tv/profileRows.ts:65-78`), phone Profile with Name only (`desk/src/app/phone/page.tsx:534-538`), TV recap (`desk/src/tv/recapRows.ts:66-80`), phone Recap tab (`page.tsx:735-744`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB5-1 24 presses to set up a child; system defaults to UK | recurs (minor, rank 6) | profileRows.ts:24 DEFAULT_SYSTEM uk; :69 type defaults high-school; :77 Maths course row before Save/Back; page.tsx:538 Name only | none |
| L1-radka-41-MB5-2 recap covers only the seated child | recurs (minor, rank 6) | recapRows.ts:66-68 reads the seated session's history; page.tsx:735-744 one block titled s.learner.name; store.ts:666 other child's log sits in `away` | none |
| L1-radka-41-MB5-3 next-day phone Recap shows yesterday's hints | recurs (minor, rank 6) | recapRows.ts:79 hints/second from s.log with no log.day check; page.tsx:741-744 tally from s.log; store.ts:664-669 dayed runs only in reduce (:679), getSession (:989) returns the stored session | none |

## New findings

None.

## Notes

- Evidence check only (re-found lines; profileRows.ts unchanged since recert-1; recapRows and phone commits added slip/hint rows without a day guard). MB5-3 is code-decided, no L2 needed.
