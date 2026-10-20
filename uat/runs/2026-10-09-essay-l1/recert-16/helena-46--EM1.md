# helena-46 × EM1 · (recert-16)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 76a8cbc1
- Recertifies: 2026-10-09-essay-l1/recert-15 at 0e6a63c6
- **Verdict now: L1-conditional.** 0 fixed, 2 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly Czech; short Czech, Czech … (polish) | recurs → L1-helena-46-EM1-4 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds: paragraphIsEnglish (desk/src/lib/rules/essay.ts:264-271) is unchanged since ffa91a49: the 51 lines of the check's window hash to the same sha256 (1e12d4e6015ffc2b608a368039538edfa2f905ef7cfeaecb137b84863583b8a1) at ffa91a49 (lines 225-275), at 0e6a63c6 (lines 228-278) and at 76a8cbc1 (lines 228-278; 76a8cbc1's hunks start at :573, below the check, so its numbers did not move). git diff ffa91a49 76a8cbc1 touches the file at :134-136 (forensicTitle), :285, :323, :348, :559, :573-585, :617-619 and from :908 on, none of them in the check. So no fresh held-out probe was written this round and recert-12/heldout.json stays the latest language measure (plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32; short plain-letter Czech lines 4 of 6, "Preji hezky den." and "Venku fouka vitr." still go to the model). Still open: a paragraph under 6 words is judged by the laxer arm on purpose (:268). |  |
| L1-helena-46-EM1-5 An email read on its own, or a piece read with Keep off, is still judged as an essay: the kind … (minor) | recurs → L1-helena-46-EM1-5 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds: desk/src/app/phone/page.tsx:367 still posts kind essay, text, type (and task when a title was read, 44aa0519) with no format; the message / email / essay radios (:291) show only with Keep on and no open piece, inside pieceRead (:289-296), which renders only when paras.length > 1 (:290), so a single paragraph is never asked; desk/src/lib/desk/essay.ts:159 formatOf (file unchanged) takes the format only from a kept piece or a sent one, and :163 analyseEssay(raw, type, learnerId, ...) still judges an email read on its own as an essay; desk/src/app/api/analyse/route.ts:19 types no format on kind essay. 44aa0519 added the task key to the same two calls (:340, :367) and no format. git diff -U0 0e6a63c6 76a8cbc1 touches desk/src/app/phone/page.tsx (heading state inserted at :123, so every line from :123 on moves down by 1; loadParagraphs :308, file load :323, paste :328-330, piece call :340, paragraph call :367, learner reset :487) and desk/src/lib/rules/essay.ts (claimRuled inserted :573-580, the judged-skip :582-585, the old claim arm :607-609 removed, :619; lines up to :572 keep their numbers, :575-606 move +11, :610 on move +8), and no other desk file: analyse/route.ts, EssayTV.tsx and lib/desk/essay.ts are byte-identical to 0e6a63c6. Every cite was re-mapped through it and compared byte for byte with the old line (the cited lines of those files, 0 differ; the three lines inside a hunk, the old page.tsx :327, :339 and :366, re-read by hand at :328, :340 and :367). |  |

## New findings

None.

## Notes

- Evidence check at 76a8cbc1: every cited line was re-mapped through `git diff -U0 0e6a63c6 76a8cbc1` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
