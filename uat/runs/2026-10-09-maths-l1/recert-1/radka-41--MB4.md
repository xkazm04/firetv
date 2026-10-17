# radka-41 × MB4 · Where did the marks go? (recert-1)

- Character: radka-41
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** Both blockers and six other rows are fixed. One major stays: the Paper panel's statement list is GCSE-worded for a cz parent mapping a CERMAT mock, which is out of segment.

## Reachable surface (now)

- Phone Paper panel: rows, a statement picker with find-by-words, and a heading/Send that name the learner (`desk/src/app/phone/PaperPanel.tsx:15-16,19-41,45-73`). Validation: `desk/src/lib/rules/paperEntry.ts:34`.
- Recovery: whole-mark shares across destinations (`desk/src/lib/rules/recovery.ts:196,218-228`).
- TV list, score card, captions (`desk/src/tv/paperRows.ts:29-127`, `desk/src/maths/MathsTV.tsx:712-777`). Rows read 'N marks lost, shared' (`paperRows.ts:93`).
- Select on a row opens the unit with the paper's aim (`desk/src/tv/keys.ts:534-545`). The set is aimed at the lost statements (`desk/src/app/api/practice/route.ts:45,49`, `desk/src/lib/desk/items.ts:86-104,205-212`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB4-1 'No marks were lost' with unmapped losses | fixed | paperRows.ts:110-113,122-126; MathsTV.tsx:769-773 | 9875e783 paper: say 'No marks were lost' only when none were (MB-B15) |
| L1-radka-41-MB4-2 full-loss fan-out, rows 30 of 28 | fixed | recovery.ts:218-228 shares; gcse.ts:60 A4 unmapped from equations; paperRows.ts:117 base + biggest | ee949056 rules: a question's lost marks are shared in whole marks... |
| L1-radka-41-MB4-3 no Select on the list | fixed | keys.ts:539-543 | b3581eb2 tv: Select on a recovery row opens its unit... |
| L1-radka-41-MB4-4 GCSE-worded statements for a CERMAT mock | recurs | PaperPanel.tsx:19,36: one GCSE list for every system; search makes a statement findable, not clear | null |
| L1-radka-41-MB4-5 blank Scored refused; silent left-out rows | fixed | paperEntry.ts:34; paperRows.ts:68-73 | ec8d3cc8 paper: an empty Scored or Out of box says what to type... |
| L1-radka-41-MB4-6 GCSE tier facts as facts about her paper | fixed | recovery.ts:91,96; PaperPanel.tsx:36 | 4e779dd2 paper: state the desk's own limits, never an exam tier |
| L1-radka-41-MB4-7 'Secure on the desk' beside lost marks | fixed | MathsTV.tsx:752 'Worth a recheck' | ccd5660f maths: a topic the desk had as secure reads Worth a recheck... |
| L1-radka-41-MB4-8 panel never names whose record | fixed | PaperPanel.tsx:15-16 | eab8cfa9 MB-B43: the Paper panel's heading and Send button name the seated learner |
| L1-radka-41-MB4-9 the set never sees the paper | fixed | practice/route.ts:45,49; items.ts:100-104,209-212 | c4ba0b8f feat(maths): aim a set opened from a paper at the statements it lost |

## New findings

None.

- 2026-10-14 L1-radka-41-MB4-11 (an unlabelled share) is **fixed now**. paperView marks a row `shared` when one of its questions reaches more than one place (`paperRows.ts:32-40`), and the row's label reads 'N marks lost, shared' (`paperRows.ts:93`, `MathsTV.tsx:734,750`). Commit 95538224 (UD-8 'TV labels a shared lost mark'). The word is terse, but the TV no longer presents a share as a count.

## Notes

- MB4-4 is the out-of-segment default bias against the planned GCSE Foundation scope. It is a real cost for Radka (C3 time, C4), and the fix is a product call.
