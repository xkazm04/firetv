# barbora-43 × EM4 · (recert-12)

- Character: barbora-43
- Journey: EM4
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM4-1 A paragraph-only evening's delete is out of reach when the TV is on a sentence … (major) | recurs → L1-barbora-43-EM4-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: EssayShelf is rendered once, in the paragraph panel (desk/src/app/phone/page.tsx:857, inside the screen === "paste" && !onSentence && !onPlan block opened at :836); the sentence panel (:822, onSentence :262) and the plan panel (:832, onPlan :270) carry no shelf and no "Forget tonight's paragraph" (desk/src/app/phone/EssayShelf.tsx:52). The More sheet's "Forget this desk" (desk/src/app/phone/phoneBar.ts moreRows) forgets the whole desk, not the evening's paragraph. TL-7/TL-10 changed which panel opens, not what each holds. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:710 -> 822, :729 -> 841. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-barbora-43-EM4-2 A piece is 'one reading' on the recap but 'one piece' on the Sunday page (polish) | fixed | f36296f2 (ancestor of HEAD) makes the recap use the Sunday page's words: parseDetail keeps the ", N paragraphs" count (desk/src/tv/recapRows.ts:59), recapLine (:264) counts a reading with more than one paragraph (or, with no count, PIECE_SENTENCES = 12 sentences or more, imported from rules/week, :16) as a piece and says "one paragraph reading and one piece" as week.ts:322 does. Executed at ee7d6ac7 (scratch /tmp/rc12/ex2.cjs): a 3-paragraph piece reads "Essay Master - one piece (Structure): 2 of 14 sentences to fix"; one paragraph reading plus one piece reads "one paragraph reading and one piece"; a pure-paragraph evening keeps "one reading" / "two readings". tools/essay-rules-test.cjs 161/0, tools/week-digest-test.cjs 32/0. The acceptance (the recap line names a piece as a piece, matching the Sunday wording) is met. | f36296f2 |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
