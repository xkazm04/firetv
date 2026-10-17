# barbora-43 × EM4 ·  (recert-4)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-essay-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening has no delete: the paragraph stays in session.json, del… (major) | **recurs (narrowed)** → L1-barbora-43-EM4-1 | Narrowed (the delete half is fixed by 6e8b7728, the 'shelf on every screen' half stays open, as the brief ruled). Code: EssayShelf.tsx:50 renders the button whenever the shelf renders, and the shelf renders whenever /api/texts answers (:36 if (!cards) return null); texts/route.ts:73 clears with essay.clear (store.ts:796-797 sets essay and essayAt to null and the forensic screen to landing); tools/texts-rules-test.cjs pins it (seated paragraph gone, kept piece still on disk, TV and guest refused with 403, an away slot untouched). The shelf itself is still rendered only on the paragraph panel (phone/page.tsx:710 condition, :729 element). | 6e8b7728 |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday page (polish) | recurs → L1-barbora-43-EM4-2 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
