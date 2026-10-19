# matyas-19 × MB1 · (recert-6)

- Character: matyas-19
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB1-1 His own weekly MA1 sheet can be hinted but never marked; only the desk's own si… (minor) | recurs → L1-matyas-19-MB1-1 | Cited lines re-found at 6b189791 and unchanged in substance: phone/page.tsx:401-406 sendWorking still posts only {image,w,h} to /api/mark (the other /api/mark call, :425, posts typed answers); api/mark/route.ts:62 still answers 'Start a practice set first.' with no practice, so his own sheet cannot be marked. route.ts:61 and :99 show a body.page branch (markPageRoute) exists on the server, but no client sends a page id (grep of desk/src finds only those two callers); tv/keys.ts:391 page handler has no mark action. No commit since c4893c88 on this path. | none |
| L1-matyas-19-MB1-2 A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n… (polish) | fixed | Executed at 6b189791 (scratch /tmp/rc/scratch/a.cjs): specFromQuestion('Find lim_(n->inf) (3n+1)/(2n-5)') returns {shape:'sequence-limit', f:'(3x+1)/(2x-5)'}, as do n->infinity, n->∞ and n->+inf; 'Find the limit as n approaches ∞ of ...' reads too; n->-inf reads null (a sequence never goes to -infinity). leaksCalc(spec,'The limit is 3/2.') is true for every spelling, so the hint guard now checks the result. Code: calc2.ts:596-598 (N_GOES accepts any token after the arrow, toInfinity = infinityOf(where)===1) and the readers at calc2.ts:626-637; a row pinning the cases is in tools/calc2-sequence-test.cjs (L1-matyas-19-MB1-2). | 0416286d |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
