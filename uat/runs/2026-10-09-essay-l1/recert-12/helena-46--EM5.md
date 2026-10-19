# helena-46 × EM5 · (recert-12)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 3 recur; 3 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM5-2 On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf… (minor) | recurs → L1-helena-46-EM5-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/drop/page.tsx:86 renders TextNotice with no mode (default piece), so desk/src/app/phone/EssayShelf.tsx:66 still labels the decline "Read without keeping" on /drop; EssayShelf.tsx:48 still says pieces you read on the TV with "Keep it on my shelf" land here. a3db5db2 added the notice line (:42), not these two strings. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayShelf.tsx:64 -> 66, :46 -> 48. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-helena-46-EM5-3 Leaving a piece out of the exemplars still lets its text shape the dims and cou… (polish) | recurs → L1-helena-46-EM5-3 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/twin/card.ts:46-48 still computes born (ps.length >= TWIN_BORN) and the dims over every piece ps, with the excluded filter only on the exemplars (:48); desk/src/app/drop/page.tsx:96 still promises "leave out anything you would not share" beside that list. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-helena-46-EM5-4 .docx text: table cells become separate paragraphs and a non-breaking hyphen is… (polish) | recurs → L1-helena-46-EM5-4 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/rules/docx.ts:59 handles only w:tab, w:br and w:t per </w:p> split; a search for noBreakHyphen, w:tc and w:tbl in docx.ts finds none, so table cells are still separate paragraphs and a non-breaking hyphen is still dropped and glues the words. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
