# barbora-43 × EM1 · (recert-11)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-essay-l1/recert-10 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own sample pa… (major) | recurs → L1-barbora-43-EM1-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791 (unchanged): the x-ray still has three whole teenage-sleep sentences, the phone placeholder is still the tired/sleep sample, and the seeded task is still 'Later school starts'. No commit since b7fca776 touched them. At ffa91a49 the cited lines of changed files sit at essay/EssayTV.tsx:541->542 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes, and no cli… (major) | recurs → L1-barbora-43-EM1-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791: the reading prompt still carries mode, age and a task only if the body names one; /api/analyse takes body.task but the phone's piece call sends none; no earlier readings or notes in the prompt. No commit since b7fca776 touched desk/essay.ts, analyse/route.ts or phone/page.tsx. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
