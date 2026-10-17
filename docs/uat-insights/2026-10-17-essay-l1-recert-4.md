# L1 recertify, round 4, of the Essay Master run 2026-10-09-essay-l1 (2026-10-17)

This was a code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on main 67581c54 (`67581c54f790c5e542ebe9b6f4089644b0fa5e9c`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 58 rows open in `recert-3/findings.json` were answered `fixed` or `recurs` with current file:line evidence; the commits that claim a Essay row were each proved by an executed scratch repro outside the repo, not read. The full tables are in `uat/runs/2026-10-09-essay-l1/recertify-4.md`, the per-pair walks in `recert-4/`, and the stamps in the run's `findings.json`, `recert-1/findings.json`, `recert-2/findings.json` and `recert-3/findings.json`, written by `recertify.cjs writeBack()`. "Fixed" means fixed at L1: the code landed. Nothing is resolved-verified.

Seven commits landed since recert-3 (00f5db95): fdafb05f, 7c8a497c, a52b4347, 6e8b7728, 258cc1bf, 5da74e9a, 67581c54. Four of them close or narrow Essay rows: fdafb05f, a52b4347, 6e8b7728 (narrows one), 67581c54. Ids below are recert-3's unless written `recert-4/…`.

## Counts

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before | 0 | 28 | 24 | 6 | **58** |
| Fixed (severity as raised) | 0 | 4 | 1 | 0 | **5** |
| Recur (severity now) | 0 | 24 | 23 | 6 | **53** |
| New | 0 | 0 | 1 | 0 | **1** |
| Open now | 0 | 24 | 24 | 6 | **54** |

- Each fixed row names its commit, 5 of 5, and every cited commit is an ancestor of 67581c54 (checked with `git merge-base --is-ancestor`).
- 1 row is **narrowed**, not fixed: L1-barbora-43-EM4-1.
- No blocker is open; none was fixed this round.
- Pair verdicts are the same as at recert-3 (9 conditional and 1 fail, helena-46 EM5); no pair passes yet, every pair still holds an open row.
- 1 new row, each opened by a walked fix or carried out of a closed row (below).

## Pair verdicts

| Pair | At recert-3 | Now |
| --- | --- | --- |
| barbora-43 EM1 | L1-conditional | L1-conditional |
| barbora-43 EM4 | L1-conditional | L1-conditional |
| daniel-15 EM2 | L1-conditional | L1-conditional |
| daniel-15 EM3 | L1-conditional | L1-conditional |
| eliska-12 EM1 | L1-conditional | L1-conditional |
| eliska-12 EM2 | L1-conditional | L1-conditional |
| helena-46 EM1 | L1-conditional | L1-conditional |
| helena-46 EM5 | L1-fail | L1-fail |
| kristyna-17 EM1 | L1-conditional | L1-conditional |
| kristyna-17 EM3 | L1-conditional | L1-conditional |

## Fixed, with commits

| Row (recert-3 id) | Was | Commit | What the code does now |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-4 | minor 6 | fdafb05f | fdafb05f: the box starts empty and the sample is only a placeholder (phone/page.tsx:61-62, :719, reset :428). "Analyse on the TV" is disabled while the box is empty (disabled={… // !essay.trim()}, :728) and the whole-piece read stops on an empty piece (pieceProblem('') -> 'There is nothing to read. Write or send a piece first.', executed at 67581c54, scratch r7.cjs), so the untouched sample can no longer be read and filed (desk/essay.ts:123,142 record()) as hers. |
| L1-daniel-15-EM2-1 | major 12 | 67581c54 | 67581c54: sendRewrite writes an accepted rewrite back into the phone's own paragraphs (phone/page.tsx:251 -> writeRewriteBack, rewriteBack.ts:15-25) when the original sentence appears exactly once across them; otherwise the phone says plainly 'That rewrite stays on the desk. Reading the whole piece again uses the text as typed here.' (:251 setMsg, and a standing line above the read button while any rewrite is unwritten, :283 and :725; the count resets on a new text, :254, and on a read, :291). Executed at 67581c54 (scratch r6.cjs): ['Many students are tired. Sleep is important.','Schools start early.'], rewrite of 'Sleep is important.' -> written, the first paragraph now carries the rewrite, so readPiece's paras.join sends it; a sentence that occurs twice, is absent or is empty -> not written, the stay-on-the-desk line; 3 stranded -> '3 rewrites stay on the desk. …'. Pinned by tools/phone-panel-test.cjs. The kept piece on the shelf takes the rewrite when the next read keeps a new version, since the read sends the written-back text. |
| L1-daniel-15-EM2-2 | major 9 | a52b4347 | a52b4347: cleanFix(raw, sentences) is given every learner sentence (rules/essay.ts:231, called with sentences.map(t => t.text) at :511), refuses a slot of sentence shape or one holding a run of the learner's words (:247-249, sentenceShaped :256-259), and a frame whose literal words hold a subject and a finite verb (addsContent, :251, :267-273). Executed at 67581c54 (scratch r2.cjs): 'Phones stop students listening [how many]' (a 4-word run of a neighbour) -> refused; '[Phones stop students listening, so they lose marks in tests].' (a whole sentence in a slot) -> refused; 'This is because [children who walk arrive at school more awake and ready to learn].' -> refused; 'A survey found that [number] of children walk.' and 'Research by [source] shows that [claim].' -> refused; real frames still stand: 'For example, [a number or a case] shows that [what it proves].', 'This matters because [the effect on the reader].', '[Claim] because [mechanism].' -> kept. Pinned by tools/essay-rules-test.cjs. The note half was closed at recert-3 (f3b8e4b1). One residual edge is filed as new: the verb list in addsContent is closed. |
| L1-daniel-15-EM3-1 | major 12 | fdafb05f | fdafb05f makes the Essay box start and reset empty: FRESH_PARAS = [""] (phone/page.tsx:61), the sample is ESSAY_PLACEHOLDER (:62), shown as the textarea's placeholder (:719), and a learner switch resets to the same empty state (:428). Executed at 67581c54 (scratch r7.cjs): onEssayPaste builds paragraphsOf(before + pasted + after) (:272-278); with an empty box a two-paragraph paste gives exactly ["Paragraph one is here.","Paragraph two follows."], where the old sample as value gave ["Many students are tired. Sleep is important. Schools start early. This is bad.Paragraph one is here.","Paragraph two follows."] (fused). Pinned by tools/phone-panel-test.cjs. |
| L1-eliska-12-EM1-1 | major 9 | a52b4347 | a52b4347 closes the pattern half: the two repros of the recert-3 insight now fail. Executed at 67581c54 (scratch r2.cjs): 'A survey found that [number] of children walk.' -> refused (addsContent: subject 'a survey' before the finite verb 'found'); 'Research by [source] shows that [claim].' -> refused ('research' before 'shows'); a frame made of a neighbour's words ('Schools start early in the [time]') -> refused when the whole paragraph is passed and kept with the faulty sentence alone, which decideVerdicts no longer does (:511). If L2 shows a frame with an open-class verb on screen it is a ghostwriting blocker (see the new row). |

## Narrowed

- **L1-barbora-43-EM4-1** (6e8b7728), restated as `2026-10-09-essay-l1/recert-4/L1-barbora-43-EM4-1` major 8: Narrowed (the delete half is fixed by 6e8b7728, the 'shelf on every screen' half stays open, as the brief ruled). Code: EssayShelf.tsx:50 renders the button whenever the shelf renders, and the shelf renders whenever /api/texts answers (:36 if (!cards) return null); texts/route.ts:73 clears with essay.clear (store.ts:796-797 sets essay and essayAt to null and the forensic screen to landing); tools/texts-rules-test.cjs pins it (seated paragraph gone, kept piece still on disk, TV and guest refused with 403, an away slot untouched). The shelf itself is still rendered only on the paragraph panel (phone/page.tsx:710 condition, :729 element).

## Recurs

52 more rows recur: no commit changed the behaviour their cited lines describe (cites in files that did change were re-mapped hunk by hunk and compared with the old line). The ones that matter:

- **daniel-15 EM2 and EM3, barbora-43 EM1 and EM4:** the sample-paragraph, rewrite-write-back, ghostwriting-frame and paragraph-delete rows are closed (above); what remains is the shelf reach on a sentence or the plan, the piece-read replacement, the title line, the forensic page that never names the paragraph.
- **eliska-12 EM1 and EM2:** the faulty note is still the adult CHECKS line, the planted-claim fix depends on the model naming links, kept verdicts go stale, Next sentence steps to n+1.
- **helena-46 EM1 and EM5, kristyna-17 EM1 and EM3:** the kind of writing never reaches the reading, the wrong twin, the Workroom served to under-18 profiles, the privacy copy, the Czech language check and English word lists, the forensic page that never names the paragraph.

## New

| Row | Severity | What |
| --- | --- | --- |
| 2026-10-09-essay-l1/recert-4/L1-eliska-12-EM1-6 | minor 6 | cleanFix's content check is a closed list of verbs: a frame with any other verb ('Teenagers sleep [how many] hours.') still states content and is kept. a52b4347 refuses a frame whose literal words hold a subject and a finite verb (addsContent), but FINITE is a list (rules/essay.ts:264). Executed at 67581c54 (scratch r3.cjs): 'Teenagers sleep [how many] hours.' and 'Councils ban cars outside schools [where].' are kept as the pattern for a faulty sentence; 'Schools start early in the [time]' (a neighbour's words) is refused. Whether the real model produces such a frame is L2: any one on screen is a ghostwriting blocker. |

## Top 5 still open, ranked

No blocker is open. Ranked by harm to C1 (no ghostwriting), to what the learner keeps, and to the piece list.

1. **The privacy copy says the desk never keeps what other people wrote to you, and it does** (`recert-4/L1-helena-46-EM5-3`, major 12): quoted replies and her client emails go verbatim into the card's exemplars. *Fix direction:* drop lines starting `>` and everything after an "On … wrote:" line before measuring and exporting, and make the /drop and Workroom copy say the card carries up to five of her own texts, for her to review.
2. **The Workroom and the twin portrait are served to Family-mode and under-18 profiles** (`recert-4/L1-helena-46-EM5-9`, major 8): only the card download is Adult-gated. *Fix direction:* `/api/twin` answers 403 and `/drop` hides the twin panel unless the mode is adult; a test opens it as a 13-year-old and as an 18+ Family profile.
3. **The kind of writing never reaches the reading, and a phone-kept piece grows the wrong twin** (`recert-4/L1-helena-46-EM1-1` and `recert-4/L1-helena-46-EM5-2`, major 12): the analyse route accepts a format the phone never sends, so an email is read with the essay move "Claim, then evidence, then the link back". *Fix direction:* the phone's keep asks message / email / essay, the reading prompt carries the format, and a length-faulty sentence is taught to split.
4. **After a whole-piece read the phone offers "Next paragraph (2 of 5)", which leads to "This paragraph only" and replaces the piece's reading** (`recert-4/L1-daniel-15-EM3-1`, major 12). *Fix direction:* when the TV holds a piece reading, the rewrite panel's next step walks the TV to the next paragraph's first sentence (`essay.at`), and "This paragraph only" is not offered for a paragraph the piece already read.
5. **A one-paragraph kept email, changed and read with "Analyse on the TV", makes no new version though the phone says it will** (`recert-4/L1-helena-46-EM1-7`, major 12). *Fix direction:* a one-paragraph opened piece adds a version when read, or the phone line stops promising one.

Left the list since recert-3: the pattern guard and backstop (its number 1, fixed), the rewrites that never reach the phone (number 2, fixed), the paragraph-only delete (number 3, narrowed: the shelf reach stays open) and the prefilled sample paragraph (number 4, fixed).

## Method notes

- Rows were answered from the code at 67581c54 with executed repros in scratch directories outside the repo (`cleanFix` on frames and slots, `writeRewriteBack`, `paragraphsOf`, `pieceProblem`). Model-dependent behaviour stays with L2: whether the real model emits a frame the closed verb list lets through is an L2 count, and any content frame on screen is a ghostwriting blocker.
- Every cite of recert-3's evidence was re-mapped through `git diff -U0 00f5db95 67581c54` per file (the first pass of this round read only the first number of a list such as `page.tsx:59,82,423`; the lists were then re-mapped, and the cites that only moved were compared with their old line: 77 of 77 identical). A cite inside a changed hunk was re-read by hand and re-written (the fixed, narrowed and touched rows).
- The walker was the builder session itself, one pass over all pairs, as at recert-3.
- Stamping: `writeBack` ran once through the ledger with the rerun's own rows skipped from the start (parent 46, recert-1 57, recert-2 57, recert-3 58 rows stamped); the generator ran once without stamping and once with, and the ledger was read before any stamp.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`. The Essay section equals the 54 open rows of `recert-4/findings.json`, row for row. The Linga section's rows, ids, ranks and order are unchanged; its `product: N of 105 files changed since` figures move because desk/ files moved under a Linga row's product stamp.
- Ids are renumbered in recert-4 (positional within the folder, new rows last): for example `L1-eliska-12-EM1-1` in recert-4 restates `L1-eliska-12-EM1-2` in recert-3. Each restatement carries `recurs: 2026-10-09-essay-l1/recert-3/<id>`.
