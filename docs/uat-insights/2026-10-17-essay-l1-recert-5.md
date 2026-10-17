# L1 recertify, round 5, of the Essay Master run 2026-10-09-essay-l1 (2026-10-17)

This was a code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on main c4893c88 (`c4893c8886f0cb85c8880dbbb7e0ee145a9259c9`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 54 rows open in `recert-4/findings.json` were answered `fixed` or `recurs` with current file:line evidence; the four rows a commit claims to close were each proved by an executed scratch repro outside the repo, not read. The full tables are in `uat/runs/2026-10-09-essay-l1/recertify-5.md`, the per-pair walks in `recert-5/`, and the stamps in the run's `findings.json` and in `recert-1` to `recert-4/findings.json`. `L1` is not `resolved-verified`: that needs live L2 evidence.

Commits since recert-4 (67581c54) that touch Essay code: ede841e4, 087c9d13 (with its test follow-up e9c5802b), fb23fe5c, e32f688d. fdafb05f is an ancestor of 67581c54 and recert-4 already stamped it. 332e49a5 is Linga only (`english/check.ts`, `types.ts`) and no Essay row cites those files. Ids below are recert-4's unless written `recert-5/…`.

## Counts

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before | 0 | 24 | 24 | 6 | **54** |
| Fixed (severity as raised) | 0 | 4 | 0 | 0 | **4** |
| Recur (severity now) | 0 | 20 | 24 | 6 | **50** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 20 | 24 | 6 | **50** |

- Each fixed row names its commit, 4 of 4, and every cited commit is an ancestor of c4893c88 (checked with `git merge-base --is-ancestor`).
- No blocker is open; none was fixed this round.
- Pair verdicts are the same as at recert-4 (9 conditional and 1 fail, helena-46 EM5); no pair passes yet, every pair still holds an open row.
- No new row: none of the four walked fixes opened a gap the rows do not already name.

## Fixed, with commits

| Row (recert-4 id) | Was | Commit | What the code does now |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 | major 12 | ede841e4 | With a piece reading held, the phone's Next paragraph posts `essay.at` for the next paragraph's first sentence and keeps the reading (`nextFromRewrite`, phone/page.tsx:334-340), and "This paragraph only" is not rendered for a paragraph the piece already read (`pieceCovers`, :239, :737). Executed: a three-paragraph piece read, then `essay.at` n=3 leaves `essay.piece` on the session. A paragraph the piece did not read still offers it, which the suggested acceptance allows. |
| L1-helena-46-EM1-7 | major 12 | 087c9d13 (+ e9c5802b test) | The one-paragraph button on a piece opened from the shelf sends it down `readPiece(true)` with its pieceId (phone/page.tsx:737), and the route adds a version to that id (analyse/route.ts:115). Executed: a kept one-paragraph piece, changed and posted as kind piece with its pieceId, goes from 1 to 2 versions under the same id. |
| L1-helena-46-EM5-3 | major 12 | fb23fe5c | `ownText` (rules/style.ts:55-65) drops ">" lines and everything from an "On … wrote:", "Original Message" or Czech "napsal(a):" line; the dims and the exemplars use only that (style.ts:92, twin/card.ts:48), and the /drop and Workroom copy now says the card carries up to five of her own texts for her to review. Executed: a reply with a quoted thread exports only her own line, and the card JSON holds none of the quoted words. |
| L1-helena-46-EM5-9 | major 8 | e32f688d | `/api/twin` answers 403 unless the profile's mode is adult (api/twin/route.ts:20-26) for GET and POST, every role; /drop shows the twin panel only when the call answered (drop/page.tsx:36, :90). Executed: a 13-year-old and an 18+ Family profile get 403 on GET, open and exclude, for the phone, the tv and no role. |

## Recurs

50 rows recur: no commit changed the behaviour their cited lines describe (cites in files that did change were re-mapped hunk by hunk and compared with the old line). The ones that matter:

- **helena-46 EM1 and EM5:** the kind of writing never reaches the reading and a phone-kept piece grows the wrong twin (`recert-5/L1-helena-46-EM1-1`, `L1-helena-46-EM5-2`), a kept email puts every sentence on the TV (`L1-helena-46-EM5-1`), no remote path back to the Workroom, no reading from the PC page, a kept piece cannot be named. The privacy copy and the Family-mode leak left the list.
- **daniel-15 EM3 and barbora-43 EM1:** pasting the revised essay makes a second "Untitled essay"; the forensic page never names the paragraph; the x-ray's model paragraph is on the phone sample's topic; the reading never sees the assignment. The piece-read replacement left the list.
- **eliska-12 EM1 and EM2, kristyna-17 EM1 and EM3:** the faulty note is still the adult CHECKS line, the planted-claim fix depends on the model naming links, kept verdicts go stale, the Czech language check and English word lists, the forensic page that never names the paragraph.

## New

None.

## Top 5 still open, ranked

No blocker is open. Ranked by harm to C1 (no ghostwriting), to what the learner keeps, and to the piece list.

1. **The kind of writing never reaches the reading** (`recert-5/L1-helena-46-EM1-1`, major 12): the analyse route accepts a format the phone never sends, so an email is read with the essay move "Claim, then evidence, then the link back". *Fix direction:* the phone's keep asks message / email / essay and the reading prompt carries the format.
2. **Reading a kept email puts every sentence on the TV and its first words on the lens home** (`recert-5/L1-helena-46-EM5-1`, major 12).
3. **Emails can grow the wrong twin** (`recert-5/L1-helena-46-EM5-2`, major 12): phone-kept pieces are always "essay", /drop defaults to "Message".
4. **Pasting the revised essay makes a second "Untitled essay", not a version** (`recert-5/L1-daniel-15-EM3-1`, major 9).
5. **The forensic page shows neither "paragraph k of n" nor the summary** (`recert-5/L1-daniel-15-EM3-2` and `L1-kristyna-17-EM3-1`, major 9).

Left the list since recert-4: the next-paragraph replacement, the one-paragraph version, the privacy copy and the Family-mode twin.

## Method notes

- Rows were answered from the code at c4893c88 with executed repros in scratch directories outside the repo (`piece.cjs`: a stubbed engine, the piece route and the phone's `pieceHeld` / `essay.at` logic; `twin.cjs`: `ownText`, the portrait, the card and `/api/twin` as three kinds of profile). Model-dependent behaviour stays with L2.
- Every cite of recert-4's evidence was re-mapped through `git diff -U0 67581c54 c4893c88` per file; moved cites were compared with their old line (37 of 39 identical across both runs; the 2 that differ sit in the Math Recap block and were re-read by hand), and cites inside a changed hunk were re-read by hand and re-written.
- Stamping: `writeBack` ran once through the ledger with the rerun's own rows skipped (parent 41, recert-1 52, recert-2 52, recert-3 53, recert-4 54 Essay rows stamped); the ledger was read before any stamp.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`: 424 -> 424. Essay 54 -> 50 and Math 21 -> 19 are this round; the Linga section moved 349 -> 355 because the six open rows of `2026-10-17-lt-swap-2` (committed in c4893c88) were not in OPEN.md yet. The Essay section equals the 50 rows of `recert-5/findings.json`, row for row.
- Ids are renumbered in recert-5 (positional within the folder): for example `L1-daniel-15-EM3-1` in recert-5 restates `L1-daniel-15-EM3-2` in recert-4. Each restatement carries `recurs: 2026-10-09-essay-l1/recert-4/<id>`.
- `npm run test:rules` at c4893c88: 85 suites green, 2068 of 2068 tests.
