# matyas-19 × MB1 · (recert-9)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head c2dacc69
- Recertifies: 2026-10-09-maths-l1/recert-8 at ee7d6ac7
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own six… (minor) | recurs → L1-matyas-19-MB1-1 | Re-walked at c2dacc69; what the previous walk (at ee7d6ac7) found still holds: sendWorking (desk/src/app/phone/page.tsx:424) still posts only {image,w,h} to /api/mark (:429) and the typed-answers call (:448) posts answers; these are the only two /api/mark callers in desk/src. desk/src/app/api/mark/route.ts:64 still answers "Start a practice set first." with no practice, and the route's body.page arm (route.ts:12-14) has no client that sends a page id. route.ts and tv/keys.ts are unchanged since ee7d6ac7. Waits on the vision path. Cites re-mapped through git diff -U0 ee7d6ac7 c2dacc69 per file; phone/page.tsx:422 -> 424, :427 -> 429, :446 -> 448 (ca0c905c's two-line shelf hunk at :273). None of the 9 commits since ee7d6ac7 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at c2dacc69: every cited line was re-mapped through `git diff -U0 ee7d6ac7 c2dacc69` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
