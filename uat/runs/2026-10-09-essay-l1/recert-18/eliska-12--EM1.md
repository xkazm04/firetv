# eliska-12 × EM1 · (recert-18)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 8a739027
- Recertifies: 2026-10-09-essay-l1/recert-17 at 37d8e8e6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): when it omits … (major) | recurs → L1-eliska-12-EM1-4 | recert-18 @8a739027: Re-walked at 8a739027 (the local main tip); what the previous walk (at 37d8e8e6) found: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35; only n, note and the deciding field are required, :48; the schema lines are above every hunk of this file and keep their numbers); backsOf (desk/src/lib/rules/essay.ts:551-555, was :541-545) accepts a link only when it names an opinion of the same paragraph and backed (:557-558) is built from accepted links only; in the Evidence arm an opinion with marked checkable sentences judged in this call and no accepted link is ruled neutral (:613-616, was :603-606), and Structure marks the true topic sentence when links are omitted. These bytes are unchanged; only the language arm of this file moved. git diff -U0 37d8e8e6 8a739027 touches desk/src/app/api/analyse/route.ts (:58-60 assignmentOf added; the readPiece call :190 -> :193 and the analyseEssay call :203 -> :206), desk/src/app/phone/page.tsx (:124-125 the assignment expression added; the piece call :340 -> :342 and the paragraph call :367 -> :369 changed in place; every later line is +2), desk/src/lib/desk/essay.ts (additions at :83-86, :90-96, :122, :132-133, :181, :201: ReadingFor.assignment and .earlier, withEarlier and earlierLine, one system sentence, two data rows, a withEarlier call in analyseEssay and in analysePiece; every later line is +16) and desk/src/lib/rules/essay.ts (:208-210 the CZECH_WORDS tail, :243-244 CZECH_NAME_LIKE, :246/:248 the englishReading signature, :254-255 czechPlain, :262, :274-278 the short-paragraph arm of paragraphIsEnglish; every later line is +10), and no other desk file. Every cite of recert-17 (101 cited line numbers, ranges expanded) was re-mapped through it per file and compared byte for byte with the old line: 0 differ; the 5 inside a hunk (route.ts old :190 and :203, page.tsx old :340 and :367, rules/essay.ts old :268) were re-read by hand at route.ts :193 and :206, page.tsx :342 and :369, rules/essay.ts :274-278. |  |

## New findings

None.

## Notes

- Evidence check at 8a739027: every cited line was re-mapped through `git diff -U0 37d8e8e6 8a739027` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main` (5b71182b, 23ce1e87 and 8a739027: all true). Model-dependent behaviour stays with L2.
