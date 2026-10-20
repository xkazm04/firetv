# daniel-15 × EM2 · (recert-16)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 76a8cbc1
- Recertifies: 2026-10-09-essay-l1/recert-15 at 0e6a63c6
- **Verdict now: L1-pass (no row open).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is ruled faulty: 'Rewr… (minor) | fixed | 76a8cbc1 (ancestor of main) closes the row. decideVerdicts (desk/src/lib/rules/essay.ts:524) now lets a claim that is only context take the one unsupported slot: claimRuled (:573-580) is the one test of "this claim is ruled neutral" (strong, blind to unlinked evidence, bodyProves, closesAfterEvidence), the judged-skip (:582-585) sets unsupportedSeen for an earlier context claim that is not ruled neutral, and the claim arm (:619) uses claimRuled. Executed in a scratch script outside the repo (real decideVerdicts, contextObservations and reviseSentence, engine.text stubbed, no model; the same file at 76a8cbc1^ loaded beside it): paragraph "Homework is pointless. Teachers give too much. It ruins evenings." all three job claim, no evidence. First reading: 1 faulty, 2 neutral, 3 neutral. Rewrite of sentence 2 alone with the others as context (the call desk/src/lib/desk/essay.ts:288 makes): 76a8cbc1 -> neutral, 76a8cbc1^ -> faulty ("Rewrite · not yet"). Rewrite of 3: neutral now, faulty before. Rewrite of 1 (the first unsupported claim): faulty in both, as it should be. reviseSentence itself (real function, stub answers {n, job: claim}): rewriting 2 leaves verdicts 1 faulty, 2 neutral, 3 neutral; rewriting 3 the same; rewriting 1 stays faulty. A four-sentence paragraph (claim, claim, claim, context): rewrite of 3 neutral now, faulty before. tools/essay-rules-test.cjs 170/0 (the new case included). The rendered TV is L2. | 76a8cbc1 |

## New findings

None.

## Notes

- Evidence check at 76a8cbc1: every cited line was re-mapped through `git diff -U0 0e6a63c6 76a8cbc1` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
