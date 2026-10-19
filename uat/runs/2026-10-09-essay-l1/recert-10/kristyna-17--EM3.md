# kristyna-17 × EM3 · (recert-10)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-essay-l1/recert-9 at b7fca776
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-1 A plain title line becomes paragraph 1 of the piece, costs a model call, and ca… (minor) | fixed | cae23442 (ancestor of HEAD) added readTitle/titleOf (desk/src/lib/rules/essay.ts:104-131, TITLE_MAX_WORDS 12): a short unpunctuated first line above more text is the title and is left out of paragraphsOf (desk/src/lib/rules/essay.ts:85-87) and splitSentences (:29-30). Executed: title line, blank line, a 2-sentence paragraph, blank line, a 1-sentence paragraph gave title 'Phones in school', paragraphsOf 2, sentence 1 'Phones distract students.'; with a single newline and a capital next line the same; title plus one sentence gives 1 paragraph. So the title is not a paragraph, costs no call (desk/src/lib/desk/essay.ts:197-200 loops the paragraphs of the title-less sentences) and cannot become 'Start with paragraph 1'. A question or stop-ended heading and a 13+ word line stay paragraphs, outside the row's short-unpunctuated acceptance. | cae23442 |
| L1-kristyna-17-EM3-2 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-2 | Cited lines re-found at 6b189791 and unchanged: desk/src/app/api/texts/route.ts:40 GET still returns pieces, noticed and notice; desk/src/app/phone/EssayShelf.tsx:21 reads only .pieces from /api/texts (no noticed or notice use in the shelf list). | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 b7fca776 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
