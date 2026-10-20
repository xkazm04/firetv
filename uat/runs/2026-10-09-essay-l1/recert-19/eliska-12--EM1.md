# eliska-12 × EM1 · (recert-19)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 2bdbdee8
- Recertifies: 2026-10-09-essay-l1/recert-18 at 8a739027
- **Verdict now: L1-pass (no row open; L2 owed on L1-eliska-12-EM1-4).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): when it omits … (major) | fixed (not-seen), code clause only | recert-19 @2bdbdee8: 2bdbdee8 closes the code clause (ancestor of main). Acceptance clause, the refusal arm: a first-pass reading whose evidence sentence (Structure, job evidence) or checkable sentence (Evidence, support checkable) names no integer link (supports / backs) is refused as unanswered, never ruled. Code: linkMissing (desk/src/lib/rules/essay.ts:473-478) is true for a Structure observation with job evidence and no integer supports, and for an Evidence observation with support checkable and no integer backs; 0 is an integer (backs nothing; no sentence is numbered 0) so it is accepted; unanswered (:485-492) adds those sentences to the missing list; judge (desk/src/lib/desk/essay.ts:143-146) throws DeskSaid(NOT_EVERY_SENTENCE) on a non-empty list before decideVerdicts (:148) and before record(); analyseEssay, each paragraph of analysePiece and analysePieceAgain all go through judge. Executed outside the repo (rc19/exec19.cjs, tools/ts-load.cjs, engine.text stubbed, a temp DESK_DATA_DIR) on the P2-shaped paragraph "Homework takes hours. Research found that teenagers sleep less. Therefore it should shrink.": for BOTH lenses, with the link absent, null, the string "3" and the fraction 2.5, unanswered() = [2], analyseEssay rejects with exactly NOT_EVERY_SENTENCE, and the learner store was written 0 times and is byte-unchanged (no verdict ruled, nothing recorded). Controls: supports 0 / backs 0 is accepted and ruled ([[1,neutral],[2,strong],[3,neutral]]); supports 3 / backs 3 gives the linked path ([[1,faulty],[2,strong],[3,strong]] for Structure, [[1,faulty],[2,strong],[3,neutral]] for Evidence). For contrast, decideVerdicts alone on the unlinked reading returns [[1,neutral],[2,strong],[3,neutral]] (the planted unsupported sentence 1 is not faulty), the call the refusal now sits in front of. tools/essay-rules-test.cjs 175/0 at 2bdbdee8 pins the same cases (L1-eliska-12-EM1-4 tests). STAMPED ON THE CODE CLAUSE ONLY. Remainder, named: L2 is owed, a live P2 x5 per lens through the claude CLI (does the real model name the links often enough that the refusal is rare, and does the retry succeed), not run in this round. Observed, not a row: reviseSentence (a rewrite, desk/src/lib/desk/essay.ts:304) checks observationOk only, not linkMissing, so the single re-judged rewritten sentence is not covered by the refusal. The L1 expected text "the planted unsupported sentence is the faulty one whether or not the model names which claim a sentence backs" is met by refusing, not by ruling without the link. | 2bdbdee8 |

## New findings

None.

## Notes

- Evidence check at 2bdbdee8: every cited line was re-mapped through `git diff -U0 8a739027 2bdbdee8` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main` (82905fd2, 534ba3e0 and 2bdbdee8: all true). Nothing is resolved-verified: that needs live L2 evidence. Model-dependent behaviour stays with L2.
