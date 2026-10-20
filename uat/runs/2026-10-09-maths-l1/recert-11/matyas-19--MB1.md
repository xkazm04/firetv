# matyas-19 × MB1 · (recert-11)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head ed23c4ac
- Recertifies: 2026-10-09-maths-l1/recert-10 at 67e0a3a6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) |
| --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question sets are marked (minor) | recurs → L1-matyas-19-MB1-1 | Reconciled at ed23c4ac: not landed; owed. The server half exists (desk/src/app/api/mark/route.ts body.page arm, markPageRoute), the client half does not: sendWorking (desk/src/app/phone/page.tsx) posts {image,w,h} only and the typed-answers call posts answers, and desk/src/tv/keys.ts has no mark action on the page screen. Needs desk/src/app/phone/page.tsx and desk/src/tv/keys.ts (both held by the stick pass, outside this pass's paths) plus the vision path to read a ten-problem photo; route.ts needs nothing. |

## New findings

None.
