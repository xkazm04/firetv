# barbora-43 × EM1 · (recert-10)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-essay-l1/recert-9 at b7fca776
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own… (major) | recurs → L1-barbora-43-EM1-1 | cited lines re-found at 6b189791 (unchanged): the x-ray still has three whole teenage-sleep sentences, the phone placeholder is still the tired/sleep sample, and the seeded task is still 'Later school starts'. No commit since b7fca776 touched them. | none |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes, … (major) | recurs → L1-barbora-43-EM1-2 | cited lines re-found at 6b189791: the reading prompt still carries mode, age and a task only if the body names one; /api/analyse takes body.task but the phone's piece call sends none; no earlier readings or notes in the prompt. No commit since b7fca776 touched desk/essay.ts, analyse/route.ts or phone/page.tsx. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 b7fca776 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
