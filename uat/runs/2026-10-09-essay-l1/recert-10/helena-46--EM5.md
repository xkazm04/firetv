# helena-46 × EM5 · (recert-10)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-essay-l1/recert-9 at b7fca776
- **Verdict now: L1-fail.** 0 fixed, 4 recur; 4 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM5-1 Reading a kept email puts every sentence on the TV and its first words on the l… (major) | recurs → L1-helena-46-EM5-1 | Cited lines re-found at 6b189791 (EssayTV.tsx changed only at :477): desk/src/essay/EssayTV.tsx:425 still draws the sentence text on the forensic page, :258 and :280 the opening words on the lens home, :491 the sentence text in the Table row. 176f04f0 added two more figures, not more text, and nothing in Adult mode keeps sentences off the TV or asks first. | none |
| L1-helena-46-EM5-2 On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf… (minor) | recurs → L1-helena-46-EM5-2 | Cited lines re-found at 6b189791 and unchanged: desk/src/app/drop/page.tsx:86 renders TextNotice with no mode (default piece), so desk/src/app/phone/EssayShelf.tsx:64 still labels the decline Read without keeping; EssayShelf.tsx:46 still says pieces you read on the TV with Keep it on my shelf land here, on /drop too. | none |
| L1-helena-46-EM5-3 Leaving a piece out of the exemplars still lets its text shape the dims and cou… (polish) | recurs → L1-helena-46-EM5-3 | Cited lines re-found at 6b189791 and unchanged: desk/src/lib/twin/card.ts:46-48 computes born (ps.length >= TWIN_BORN) and dims over all pieces ps, with the excluded filter only on exemplars; desk/src/app/drop/page.tsx:96 still promises leave out anything you would not share beside exemplars only. | none |
| L1-helena-46-EM5-4 .docx text: table cells become separate paragraphs and a non-breaking hyphen is… (polish) | recurs → L1-helena-46-EM5-4 | Cited lines re-found at 6b189791 and unchanged: desk/src/lib/rules/docx.ts:59 handles only w:tab, w:br and w:t per </w:p> split; a grep finds no noBreakHyphen, w:tc or w:tbl in docx.ts, so table cells still become separate paragraphs and a non-breaking hyphen is dropped. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 b7fca776 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
