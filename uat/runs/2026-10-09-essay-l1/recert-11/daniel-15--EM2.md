# daniel-15 × EM2 · (recert-11)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-essay-l1/recert-10 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-1 Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learner, but the… (minor) | recurs → L1-daniel-15-EM2-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791: recogniserLang still returns cs-CZ for a cz learner and is applied to every phone recogniser, including the Essay panels. Untouched. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is ruled faulty:… (minor) | recurs → L1-daniel-15-EM2-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791 (rules/essay.ts moved): only the first unsupported claim is faulty (unsupportedSeen, essay.ts:539,579); bodyProves/closesAfterEvidence (:521,:526) need the multi-paragraph context; the rewrite is still judged with new Set([n]) alone (desk/essay.ts:288). 645fdc94 changed revise() tidying/refusal wording only, not the ruling. At ffa91a49 the cited lines of changed files sit at lib/rules/essay.ts:539->565, lib/rules/essay.ts:521->547 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
