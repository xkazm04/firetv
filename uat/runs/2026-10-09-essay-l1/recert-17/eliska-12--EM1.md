# eliska-12 × EM1 · (recert-17)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 37d8e8e6
- Recertifies: 2026-10-09-essay-l1/recert-16 at 76a8cbc1
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): when it omits … (major) | recurs → L1-eliska-12-EM1-4 | recert-17 @37d8e8e6: Re-walked at 37d8e8e6 (the local main tip); what the previous walk (at 76a8cbc1) found still holds: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35; only n, note and the deciding field are required, :48; the schema lines are unchanged, the file's hunks are :163 and :167 only); backsOf (desk/src/lib/rules/essay.ts:541-545) accepts a link only when it names an opinion of the same paragraph and backed (:547-548) is built from accepted links only; in the Evidence arm an opinion with marked checkable sentences judged in this call and no accepted link is ruled neutral (:603-606), and Structure marks the true topic sentence when links are omitted. lib/rules/essay.ts is byte-identical to 76a8cbc1. git diff -U0 76a8cbc1 37d8e8e6 touches desk/src/app/phone/page.tsx (a line inserted after old :289 and the old :292 removed, so the format radios are :290 and no later line moves; openKept :357 and the paragraph call :367 changed in place), desk/src/app/phone/EssayShelf.tsx (onOpen's type and call), desk/src/app/api/analyse/route.ts (:19 the Body type, :203 the analyseEssay call) and desk/src/lib/desk/essay.ts (:163 analyseEssay's signature, :167 the judge call), and no other desk file: lib/rules/essay.ts, EssayTV.tsx, voice.ts and the rest are byte-identical to 76a8cbc1. Every cite was re-mapped through it per file and compared byte for byte with the old line (128 cited line numbers, ranges expanded: 0 differ; the 5 inside a hunk, the old page.tsx :292 and :367, route.ts :19 and :203, essay.ts :163, re-read by hand at page.tsx :290 and :367, route.ts :19 and :203, essay.ts :163). |  |

## New findings

None.

## Notes

- Evidence check at 37d8e8e6: every cited line was re-mapped through `git diff -U0 76a8cbc1 37d8e8e6` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main` (c35a1cad and 37d8e8e6: both true). Model-dependent behaviour stays with L2.
