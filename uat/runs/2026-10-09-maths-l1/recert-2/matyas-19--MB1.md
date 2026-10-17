# matyas-19 × MB1 · Tonight's sheet, together (recert-2)

- Character: matyas-19 (first-year ČVUT, MA1, Calculus 1 path)
- Journey: MB1 · Tonight's sheet, together
- Cert level: L1 re-walk, code only, no model
- Head: 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-conditional**: the hint guard holds, but his own sheet still cannot be marked from the phone or TV, and lim_(n->inf) is still unread.

## Reachable surface (now)

- Homework door -> page: TV Select = hint (desk/src/tv/keys.ts:391); /api/mark callers send no page id (desk/src/app/phone/page.tsx:387, :406).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB1-1 | recurs (minor) | desk/src/app/phone/page.tsx:387 — sendWorking posts image,w,h only; desk/src/app/api/mark/route.ts:62 — no practice: "Start a practice set first."; desk/src/tv/keys.ts:391 — page Select = hint, no mark action. His own MA1 sheet is still never marked: no client sends a page id. | - |
| MB1-2 | recurs (polish) | desk/src/lib/rules/calc2.ts:596-597 — AS_N_GOES and TO_INFINITY accept only "infinity". lim_(n->inf) still reads as linear; "The limit is 3/2." is not refused (executed: leaksLine false; with n->infinity it reads calc and is refused true). | - |

## New findings

None.

## Notes

Executed with tools/ts-load.cjs (scratch matyas-19 b.cjs). No file behind these rows changed since recert-1 (git log d4f5042a..HEAD). Real sheet marking is L2 (vision host).
