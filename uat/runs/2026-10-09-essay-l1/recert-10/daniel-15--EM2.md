# daniel-15 × EM2 · (recert-10)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-essay-l1/recert-9 at b7fca776
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-1 Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learne… (minor) | recurs → L1-daniel-15-EM2-1 | cited lines re-found at 6b189791: recogniserLang still returns cs-CZ for a cz learner and is applied to every phone recogniser, including the Essay panels. Untouched. | none |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is rul… (minor) | recurs → L1-daniel-15-EM2-2 | cited lines re-found at 6b189791 (rules/essay.ts moved): only the first unsupported claim is faulty (unsupportedSeen, essay.ts:539,579); bodyProves/closesAfterEvidence (:521,:526) need the multi-paragraph context; the rewrite is still judged with new Set([n]) alone (desk/essay.ts:288). 645fdc94 changed revise() tidying/refusal wording only, not the ruling. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 b7fca776 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
