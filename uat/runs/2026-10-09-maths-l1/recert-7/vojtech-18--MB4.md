# vojtech-18 × MB4 · (recert-7)

- Character: vojtech-18
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-maths-l1/recert-6 at 6b189791
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-vojtech-18-MB4-1 The TV never shows which statement led a question to a topic (topics[].codes unwired) (minor) | fixed | da6f9f07 (ancestor of HEAD) gave PaperTopic a `said` list (desk/src/tv/paperRows.ts:15, :49: canOf(code, system) per code, the learner's language) and the topic row draws ' · led by ' + t.said.join('; ') instead of the codes (desk/src/maths/MathsTV.tsx:753). tools/maths-tv-test.cjs 'paper 9' renders a pct-of-amount row and asserts the statement words, not 'led by N12', for uk and for a cz learner (Czech words differ); maths-tv 78/0. The row's acceptance (each topic row names the statement's can text it came through) is met. | da6f9f07 |
| L1-vojtech-18-MB4-3 The only inequality statement is the linear A22; a quadratic or logarithmic inequality, o… (minor) | recurs → L1-vojtech-18-MB4-3 | Narrowed by e9c5ee8f, still open: the three statements exist (A26 quadratic inequality, A27 logarithmic expression, A28 domain; gcse.ts:85-87, Czech in gcse-cz.ts:61-63; pinned by tools/gcse-rules-test.cjs) but touch no unit, because no school unit teaches them; the acceptance's 'mapped to the units that teach them' cannot be met without a unit. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
