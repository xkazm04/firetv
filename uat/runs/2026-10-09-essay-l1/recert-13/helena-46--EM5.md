# helena-46 × EM5 · (recert-13)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head 0eaf5a97
- Recertifies: 2026-10-09-essay-l1/recert-12 at ee7d6ac7
- **Verdict now: L1-pass (no row open).** 3 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM5-2 On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf… (minor) | fixed | 16ee1e98 (ancestor of main) gives /drop its own words: the page renders <TextNotice where="pc"> and <EssayShelf where="pc"> (desk/src/app/drop/page.tsx:86, :89); the notice's decline reads "Not now" when reading or where === "pc" (desk/src/app/phone/EssayShelf.tsx:66) and the empty shelf there says 'Pieces you keep with "Keep it" on this page land here.' (:48), while the phone keeps "Read without keeping" and the TV wording. tools/essay-piece-test.cjs 51/0 holds the strings. The acceptance (on /drop the decline reads 'Not now' and the empty shelf names 'Keep it' on this page) is met. | 16ee1e98 |
| L1-helena-46-EM5-3 Leaving a piece out of the exemplars still lets its text shape the dims and cou… (polish) | fixed | c2dacc69 (ancestor of main) takes the second arm of the acceptance: the /drop twin list now says "A piece you leave out is not used as a sample, but it still counts toward the style words:" (desk/src/app/drop/page.tsx:96), which matches the code (born and the dims are still computed over every piece ps, desk/src/lib/twin/card.ts:46-48, with the excluded filter only on the exemplars). tools/essay-piece-test.cjs 51/0 asserts the sentence. The acceptance (either excluded pieces leave the measure too, or the copy says they still count toward the style numbers) is met. | c2dacc69 |
| L1-helena-46-EM5-4 .docx text: table cells become separate paragraphs and a non-breaking hyphen is… (polish) | fixed | 6374a2e6 with 012df48f (ancestors of main) read a non-breaking hyphen as "-" and a table row as one line: docxText (desk/src/lib/rules/docx.ts:59-62) joins the cells of a w:tr with " / " and turns <w:noBreakHyphen/> into a hyphen before the w:t scan. tools/docx-rules-test.cjs 6/0 executes both ("e" + noBreakHyphen + "mail" reads "e-mail"; a two-row table reads "Name / Age / City" and "Eva / 15 / Brno" as separate lines among the paragraphs around it), which is the fixture the acceptance asks for. 012df48f repaired the first commit's test and the row join. The acceptance (noBreakHyphen reads as "-", a table row reads as one line, a fixture pins both) is met. | 6374a2e6 with 012df48f |

## New findings

None.

## Notes

- Evidence check at 0eaf5a97: every cited line was re-mapped through `git diff -U0 ee7d6ac7 0eaf5a97` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
