# daniel-15 × EM2 · (recert-12)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-1 Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learne… (minor) | recurs → L1-daniel-15-EM2-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/phone/page.tsx:413 still sets r.lang = recogniserLang(s) for every phone recogniser, including the Essay panels' Dictate buttons (:823, :834, :855), and recogniserLang returns cs-CZ for a cz learner; the desk reads English. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:392 -> 413. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is rul… (minor) | recurs → L1-daniel-15-EM2-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: a rewrite is judged on its own: desk/src/lib/desk/essay.ts:288 decideVerdicts(lens.id, next.sentences, new Set([n]), ...), and only the first unsupported claim of a paragraph is faulty (desk/src/lib/rules/essay.ts:569 unsupportedSeen, :609), so a claim first ruled neutral as a later one is ruled faulty alone. 69b5b059 changed closesAfterEvidence only for the Evidence lens' Explain. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; rules/essay.ts:539 -> 569, :521 -> 550. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
