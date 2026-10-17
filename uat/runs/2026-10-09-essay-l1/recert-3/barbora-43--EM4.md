# barbora-43 × EM4 · What happened tonight? (recert-3)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-barbora-43-EM4-1 A paragraph-only evening has no delete: the paragraph stays in session.json, de… (major) | recurs → L1-barbora-43-EM4-1 | desk/src/app/phone/EssayShelf.tsx:44-45 — delete-all only with a kept piece / desk/src/lib/session/store.ts:1131 — JSON.stringify(store.session) holds the paragraph / desk/src/app/phone/page.tsx:705,723 — shelf only on the paragraph panel / recert-3 @00f5db95: cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday page (polish) | recurs → L1-barbora-43-EM4-2 | desk/src/tv/recapRows.ts:56 — parseDetail ignores ', N paragraphs' / desk/src/lib/rules/week.ts:322 — 'paragraph reading' / 'piece' / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
