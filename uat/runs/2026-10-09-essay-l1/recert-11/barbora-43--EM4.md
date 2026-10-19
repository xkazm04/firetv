# barbora-43 × EM4 · (recert-11)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-essay-l1/recert-10 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening's delete is out of reach when the TV is on a sentence or the pla… (major) | recurs → L1-barbora-43-EM4-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791: 'Forget tonight's paragraph' is always on the shelf (EssayShelf.tsx:50) but the shelf renders only inside the paragraph panel (page.tsx:724, shelf at :745); the sentence panel (:710) and the plan panel (:718) carry no shelf or forget control. Nothing touched it since b7fca776. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday page (polish) | recurs → L1-barbora-43-EM4-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791: the recap writer still counts 'reading' (recapRows.ts:292) and parseDetail's writing regex tolerates ', N paragraphs' but drops it (:57-60); the Sunday page still says 'paragraph reading' / 'piece' (week.ts:322). Nothing touched them. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
