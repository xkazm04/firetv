# Essay Master, Family: L1 report (2026-10-14)

Written by the orchestrator from the walker's returned summary (the walker's own write of this file was refused by the harness). Detail: `findings.json` and the `<character>--<journey>.md` voices beside it.

## Verdicts (prior run in brackets)
- EM1: L1-conditional (was fail)
- EM2: L1-fail (was conditional). One blocker by rank, `L1-eliska-12-EM2-1`: under the Evidence lens a rewrite that is still only an opinion is ruled neutral, so "it holds" and the move inks. Re-ranked from major because it is deterministic once the model reads the rewrite as opinion.
- EM3: L1-conditional (was fail)
- EM4: L1-conditional (was conditional)

## Counts
83 rows: 67 findings, 16 strengths. Of 59 carried findings, 19 fixed (L1 only), 40 still open at recurrence 2. 8 new. Open now: 1 blocker, 26 major, 19 minor, 2 polish.

## Grounding and wiring
Grounding ES-READ 3/8 (unchanged), ES-REVISE 7/7. Wiring: 21 of 27 reading fields drawn; `stats.words`, `stats.links`, `connectors`, `provider` are drawn nowhere.

## Time saved (estimate)
EM1 Eliska ~12 min; EM1 Barbora ~13; EM2 Eliska ~3; EM3 Daniel 0 to -5; EM4 Barbora ~13.

## Top open by impact
1. `L1-eliska-12-EM2-1` false hold on an opinion rewrite
2. `L1-eliska-12-EM1-2` clean PEEL paragraph gets a false fault on its Explain sentence
3. `L1-barbora-43-EM4-4` paragraph-only evening shows no notice and no delete; text stays in session.json

## L2 recertify (2026-10-16)

Instrument: `tools/essay-ui-test.cjs` W1-W8, now accepting the one-time text notice at W3. Live against an isolated desk (fresh data dir outside every repo, `next dev --webpack -p 3377`, model `claude-cli/sonnet` through the claude CLI, no API key), on main 3e494e0c. All eight steps passed; 0 page errors. Learner: the harness's own Sam (15, high-school), one Evidence-lens paragraph, one rewrite. This is **not** a run of the originating Characters (Eliska, Barbora, Daniel, Kristyna), so a stamp below covers the mechanism a live run observed, not that Character's read of it.

### resolved-verified (2)
- `L1-barbora-43-EM4-3` rewrites that hold reach the recap. W5 turned sentence 4 faulty -> strong; W6's phone recap read "Essay Master - one reading (Evidence): 0 of 5 sentences to fix, 1 fixed tonight" and W7's learners.json history detail "0 of 5 sentences to fix, 1 fixed".
- `L1-barbora-43-EM4-6` no "Nothing needed a second hint." on an Essay-only evening. W6's phone recap has no hint line. Its ceiling (the line still shows with a maths tile) was not run.

### Still reproduces (1, partly moved)
- `L1-barbora-43-EM4-4` (recurrence 3). The engine is now named before a first reading: W3's first "Analyse on the TV" got the 428 and the phone showed "...Claude, through the command line on this computer...". But the paragraph text is still in the data dir's `session.json` after the reading, and the Recap-tab delete was not exercised.

### New (1)
- `L2-essay-browser-teen-W3-1` (major): the notice on the single-paragraph path is drawn as a red error line (`data-role="essay-note"`) with no accept control; `essay-notice` never appears there (only `readPiece`, with 2+ paragraphs, shows `TextNotice`). A first-time learner with one paragraph is refused on every press. The harness proceeds by POSTing `/api/texts {notice:true}` itself, and asserts first that the TV had not opened the forensic page, no sentences were read, and the notice was not recorded as accepted. Fix belongs in `desk/` and was not made here.

### Observed, not stamped
- W3 and W4: the one faulty sentence's note is the code's own check line ("No checkable sentence here backs this opinion."), consistent with `L1-eliska-12-EM1-6` and `L1-daniel-15-EM2-2`, but a rewrite that stays faulty was not produced, so neither is verified. No whole learner sentence appeared in any note, move, pattern or summary (the harness echo check: none); the other ghostwriting reading (`L1-barbora-43-EM1-1`) needs a young-voice profile and was not run.
- W5: the rewrite carried a specific effect, so it was judged strong; `L1-eliska-12-EM2-1` (an opinion rewrite held as neutral) was not exercised and stays not-rechecked.
- W2: Enter to essaytype took 632 ms against the 560 ms zoom.
- Not run, so unchanged: the piece path (E1), `EM2-1`, `EM3-8`, `EM4-1`, `EM4-2`, the Czech findings, and the other 48 not-rechecked rows. The artifacts are in the gitignored `artifacts/essay-integration/`.

Counts after: 84 rows (83 + 1 new); of the 19 rows stamped at the L1 recertify, 2 are now resolved-verified, 15 stay fixed (L1 only) and 2 stay open.
