# eliska-12 × EM1 · (recert-16)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 76a8cbc1
- Recertifies: 2026-10-09-essay-l1/recert-15 at 0e6a63c6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): when it omits them,… (major) | recurs → L1-eliska-12-EM1-4 | Re-walked at 76a8cbc1 (the local main tip); what the previous walk (at 0e6a63c6) found still holds: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35; only n, note and the deciding field are required, :48; file unchanged); backsOf (desk/src/lib/rules/essay.ts:541-545) accepts a link only when it names an opinion of the same paragraph and backed (:547-548) is built from accepted links only; in the Evidence arm an opinion with marked checkable sentences judged in this call and no accepted link is ruled neutral (:603-606), and Structure marks the true topic sentence when links are omitted. 76a8cbc1 changed only the claim arm of the Structure lens (claimRuled :573-580, :619) and does not touch the link logic. git diff -U0 0e6a63c6 76a8cbc1 touches desk/src/app/phone/page.tsx (heading state inserted at :123, so every line from :123 on moves down by 1; loadParagraphs :308, file load :323, paste :328-330, piece call :340, paragraph call :367, learner reset :487) and desk/src/lib/rules/essay.ts (claimRuled inserted :573-580, the judged-skip :582-585, the old claim arm :607-609 removed, :619; lines up to :572 keep their numbers, :575-606 move +11, :610 on move +8), and no other desk file: analyse/route.ts, EssayTV.tsx and lib/desk/essay.ts are byte-identical to 0e6a63c6. Every cite was re-mapped through it and compared byte for byte with the old line (the cited lines of those files, 0 differ; the three lines inside a hunk, the old page.tsx :327, :339 and :366, re-read by hand at :328, :340 and :367). |  |

## New findings

None.

## Notes

- Evidence check at 76a8cbc1: every cited line was re-mapped through `git diff -U0 0e6a63c6 76a8cbc1` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
