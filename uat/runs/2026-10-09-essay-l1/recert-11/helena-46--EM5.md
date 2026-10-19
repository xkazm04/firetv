# helena-46 × EM5 · (recert-11)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-essay-l1/recert-10 at 6b189791
- **Verdict now: L1-conditional.** 1 fixed, 3 recur; 3 rows open. (was L1-fail)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM5-1 Reading a kept email puts every sentence on the TV and its first words on the lens home (major) | fixed | b75bd45f (ancestor of HEAD) added curtainOn(s) (desk/src/tv/keys.ts:82-89: a kept piece, s.essay.piece.pieceId, in Adult mode) and EssayTV.tsx reads it on all three surfaces the row cited: the lens home's opening words (LastParagraph h2 :280 -> 'Your kept piece. The words are on the PC page and the phone.'), the forensic page's sentence (Page :426 -> 'Sentence N · the words are on the PC page and the phone') and the Table row text (:492 -> 'Sentence N', with the same line on the keys row :500). The Rail draws arrows only, no text. School and Family mode and a paragraph that was not kept draw as before (curtain false). tools/essay-rules-test.cjs 'L1-helena-46-EM5-1' renders EssayType, Forensic and the Table for Adult+kept, School and un-kept sessions and asserts no sentence text for the first (157 pass 0 fail). This is the row's first arm (marks on the TV, words on the PC page/phone). Residue, not a new row: a faulty note that quotes a word ('word' does not say much here) and The move line can still carry a few of the learner's words on the TV. | b75bd45f |
| L1-helena-46-EM5-2 On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf says piec… (minor) | recurs → L1-helena-46-EM5-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 and unchanged: desk/src/app/drop/page.tsx:86 renders TextNotice with no mode (default piece), so desk/src/app/phone/EssayShelf.tsx:64 still labels the decline Read without keeping; EssayShelf.tsx:46 still says pieces you read on the TV with Keep it on my shelf land here, on /drop too. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-helena-46-EM5-3 Leaving a piece out of the exemplars still lets its text shape the dims and count toward… (polish) | recurs → L1-helena-46-EM5-3 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 and unchanged: desk/src/lib/twin/card.ts:46-48 computes born (ps.length >= TWIN_BORN) and dims over all pieces ps, with the excluded filter only on exemplars; desk/src/app/drop/page.tsx:96 still promises leave out anything you would not share beside exemplars only. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-helena-46-EM5-4 .docx text: table cells become separate paragraphs and a non-breaking hyphen is dropped a… (polish) | recurs → L1-helena-46-EM5-4 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 and unchanged: desk/src/lib/rules/docx.ts:59 handles only w:tab, w:br and w:t per </w:p> split; a grep finds no noBreakHyphen, w:tc or w:tbl in docx.ts, so table cells still become separate paragraphs and a non-breaking hyphen is dropped. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
