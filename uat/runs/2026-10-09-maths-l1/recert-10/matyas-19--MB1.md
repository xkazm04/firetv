# matyas-19 × MB1 · (recert-10)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-maths-l1/recert-9 at c2dacc69
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question sets are marked (minor) | recurs → L1-matyas-19-MB1-1 | Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: sendWorking (desk/src/app/phone/page.tsx:441) still posts only {image,w,h} to /api/mark and the typed-answers call (:460) posts answers; these are the only two /api/mark callers in desk/src. desk/src/app/api/mark/route.ts:64 still answers "Start a practice set first." with no practice, and the route's body.page arm (route.ts:12-14, :62) has no client that sends a page id. Waits on the vision path. git diff c2dacc69 67e0a3a6 is empty on every file this row cites (route.ts and tv/keys.ts); phone/page.tsx:424 -> 441, :429 -> 441, :448 -> 460 (the c2dacc69-to-67e0a3a6 hunks, 67e0a3a6's 11 lines at :276 among them). None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 c2dacc69 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
