# helena-46 × EM1 · (recert-17)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 37d8e8e6
- Recertifies: 2026-10-09-essay-l1/recert-16 at 76a8cbc1
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly Czech; short Czech, C… (polish) | recurs → L1-helena-46-EM1-4 | recert-17 @37d8e8e6: Re-walked at 37d8e8e6 (the local main tip); what the previous walk (at 76a8cbc1) found still holds: paragraphIsEnglish (desk/src/lib/rules/essay.ts:264-271) is unchanged since ffa91a49: the 51 lines of the check's window hash to the same sha256 (1e12d4e6015ffc2b608a368039538edfa2f905ef7cfeaecb137b84863583b8a1) at ffa91a49 (lines 225-275), at 76a8cbc1 (228-278) and at 37d8e8e6 (228-278); desk/src/lib/rules/essay.ts is byte-identical at 76a8cbc1 and 37d8e8e6, so nothing moved. No fresh held-out probe was written; recert-12/heldout.json stays the latest language measure (plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32; short plain-letter Czech lines 4 of 6). Still open: a paragraph under 6 words is judged by the laxer arm on purpose (:268); "Preji hezky den." and "Venku fouka vitr." still go to the model. git diff -U0 76a8cbc1 37d8e8e6 touches desk/src/app/phone/page.tsx (a line inserted after old :289 and the old :292 removed, so the format radios are :290 and no later line moves; openKept :357 and the paragraph call :367 changed in place), desk/src/app/phone/EssayShelf.tsx (onOpen's type and call), desk/src/app/api/analyse/route.ts (:19 the Body type, :203 the analyseEssay call) and desk/src/lib/desk/essay.ts (:163 analyseEssay's signature, :167 the judge call), and no other desk file: lib/rules/essay.ts, EssayTV.tsx, voice.ts and the rest are byte-identical to 76a8cbc1. Every cite was re-mapped through it per file and compared byte for byte with the old line (128 cited line numbers, ranges expanded: 0 differ; the 5 inside a hunk, the old page.tsx :292 and :367, route.ts :19 and :203, essay.ts :163, re-read by hand at page.tsx :290 and :367, route.ts :19 and :203, essay.ts :163). |  |
| L1-helena-46-EM1-5 An email read on its own, or a piece read with Keep off, is still judged as an essay: the … (minor) | fixed (not-seen) | c35a1cad closes the row (ancestor of main), with 37d8e8e6 (ancestor of main) beside it for the shelf; every half holds at 37d8e8e6. Executed in a scratch script outside the repo (rc17/exec.cjs, real code loaded through tools/ts-load.cjs, engine.text stubbed, no model, DESK_DATA_DIR a temp dir): (a) the paragraph call expression read out of desk/src/app/phone/page.tsx:367 with pieceFormat email and no pieceId posts {"kind":"essay","text":"Schools start too early. Teenagers are tired.","type":"structure","format":"email"}; with no format chosen it posts no format key; with a pieceId open it posts none either; (b) desk/src/app/api/analyse/route.ts:203 passes hasFormat(body.format) ? body.format : undefined as analyseEssay's last argument (hasFormat on kind essay: email -> "email", "Not A Format!" -> undefined, none -> undefined); the real analyseEssay with format email on a single paragraph puts the line The kind of writing this is: "email" into the reading request and the system sentence "judge the text as that kind of writing"; the same read with no format, or an unknown one, carries neither; the line equals the one analysePiece (the piece path, through formatOf) gives judge for format email; (c) the message / email / essay radios (data-role essay-format, desk/src/app/phone/page.tsx:290) now open pieceRead gated by !pieceId only, before the paras.length > 1 block and outside Keep, and pieceRead() is rendered on the paste screen (:870), the rewrite panel (:851) and the plan panel (:857). tools/phone-panel-test.cjs 119/0, tools/essay-piece-test.cjs 53/0, tools/essay-rules-test.cjs 170/0 at 37d8e8e6. The rendered phone is L2. | c35a1cad |

## New findings

None.

## Notes

- Evidence check at 37d8e8e6: every cited line was re-mapped through `git diff -U0 76a8cbc1 37d8e8e6` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main` (c35a1cad and 37d8e8e6: both true). Model-dependent behaviour stays with L2.
