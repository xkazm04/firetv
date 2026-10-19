# matyas-19 × MB1 · (recert-8)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-maths-l1/recert-7 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own si… (minor) | recurs → L1-matyas-19-MB1-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: sendWorking (desk/src/app/phone/page.tsx:422) still posts only {image,w,h} to /api/mark (:427) and the typed-answers call (:446) posts answers; desk/src/app/api/mark/route.ts:64 still answers "Start a practice set first." with no practice, and the route's body.page arm (route.ts:12-14) has no client that sends a page id. withPhoneAsk (route.ts:48) only gates the door. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:401 -> 422, route.ts:62 -> 64. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
