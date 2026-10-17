# barbora-43 × EM4 · What happened tonight? (recert-2)

- Character: barbora-43 (Barbora, 43, Eliška's mother; reads the recap and the Sunday page for Eliška, age 12, Family)
- Journey: EM4 the evening's recap and the week, read by the parent
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** No commit since recert-1 touches the recap, the shelf or the delete path; the paragraph-only evening still has no delete (major) and a polish wording split remains.

## Reachable surface (now)

- Unchanged from recert-1: phone Recap (`desk/src/tv/recapRows.ts`), Sunday page (`desk/src/lib/rules/week.ts`), shelf only on the paragraph panel (`desk/src/app/phone/page.tsx:705,723`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM4-1 (recert-1 md: EM4-4) paragraph-only evening has no delete (major) | **recurs** (major) | `EssayShelf.tsx:44-45` delete-all only with cards; `store.ts:1130` persists the paragraph; `page.tsx:705` shelf hidden on sentence/plan | - |
| EM4-2 piece 'one reading' vs 'one piece' (polish) | **recurs** (polish) | `recapRows.ts:56` drops the paragraph count; `week.ts:322` says 'piece' | - |

## New findings

None.

## Notes

- Code-only re-read of the cited lines; no commit in 782afdfb..HEAD touches these files.
- JSON ids follow findings.json (`EM4-1` is the md's EM4-4 row).
