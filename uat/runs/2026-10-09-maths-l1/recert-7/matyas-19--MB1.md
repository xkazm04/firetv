# matyas-19 × MB1 · (recert-7)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-maths-l1/recert-6 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question… (minor) | recurs → L1-matyas-19-MB1-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 and unchanged in substance: phone/page.tsx:401-406 sendWorking still posts only {image,w,h} to /api/mark (the other /api/mark call, :425, posts typed answers); api/mark/route.ts:62 still answers 'Start a practice set first.' with no practice, so his own sheet cannot be marked. route.ts:61 and :99 show a body.page branch (markPageRoute) exists on the server, but no client sends a page id (grep of desk/src finds only those two callers); tv/keys.ts:391 page handler has no mark action. No commit since c4893c88 on this path. At ffa91a49 the cited lines of changed files sit at tv/keys.ts:391->407 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (56f903ae, da6f9f07, 3240d025 and e9c5ee8f are the Math commits; b75bd45f, 61a8e2ee and ffa91a49 are Essay) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
