# Recertify, round 5 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-5`, **level L1 only (code re-walk on main c4893c88, 2026-10-17)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed. Every row open in `recert-4/findings.json` (21 rows) was answered `fixed` or `recurs` with current file:line evidence at c4893c88; the rows the new commits claim to close were executed in scratch repros outside the repo. Nothing here is `resolved-verified`: that needs live L2 evidence, and Math L2 still waits on the vision host.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-4` `findings.json`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-maths-l1/recert-5` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement is in `recert-5/findings.json` (`recurs: 2026-10-09-maths-l1/recert-4/<id>`). Rerun ids are positional, so they are written `2026-10-09-maths-l1/recert-5/<id>`.

Head of this round: **c4893c8886f0cb85c8880dbbb7e0ee145a9259c9** (c4893c88). The previous round (recert-4) read 67581c54f790c5e542ebe9b6f4089644b0fa5e9c (67581c54); the commits since are listed under *Method*. Every cited commit was checked with `git merge-base --is-ancestor <sha> HEAD`.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 21 | 0 blocker, 0 major, 18 minor, 3 polish |
| Fixed (L1) | 2 | 0 blocker, 0 major, 2 minor, 0 polish (severity as raised) |
| Recurs | 19 | 0 blocker, 0 major, 16 minor, 3 polish (severity now) |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 19 | 0 blocker, 0 major, 16 minor, 3 polish |

Every fixed row names its commit (2 of 2); every cited commit is an ancestor of c4893c88 (`git merge-base --is-ancestor`).

## Pair verdicts now

| Pair | At recert-4 | Now | Walk |
| --- | --- | --- | --- |
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-5/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-5/matyas-19--MB3.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-5/nela-12--MB2.md) |
| nela-12 MB5 | L1-conditional | L1-conditional | [nela-12--MB5.md](recert-5/nela-12--MB5.md) |
| owen-17 MB2 | L1-conditional | L1-conditional | [owen-17--MB2.md](recert-5/owen-17--MB2.md) |
| owen-17 MB4 | L1-conditional | L1-conditional | [owen-17--MB4.md](recert-5/owen-17--MB4.md) |
| radka-41 MB4 | L1-conditional | L1-conditional | [radka-41--MB4.md](recert-5/radka-41--MB4.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-5/radka-41--MB5.md) |
| vojtech-18 MB4 | L1-conditional | L1-conditional | [vojtech-18--MB4.md](recert-5/vojtech-18--MB4.md) |

No pair changed its verdict. nela-12 MB5 and radka-41 MB5 each lose a minor and keep the rest.

## Fixed (L1: the fix has landed in code; not resolved-verified)

| Finding | Sev. | Title | Evidence (current code) and commit |
|---|---|---|---|
| 2026-10-09-maths-l1/recert-4/L1-nela-12-MB5-2 | minor | The phone's Recap tab, opened on a new day before any desk event, still shows yesterday's… | fc8a5151: tonightsLog(s, now) (tv/recapRows.ts:71-74) returns the session log only when its day (log.day, else the day its timer started) is today, else an empty log, and recapRows wraps the session in it (:77-78), so the TV tile's hints, second hints and hinted problems are tonight's only (:91); the phone's Recap tally takes the same log (phone/page.tsx:757) while its guard (:755-756) shows "Arrives when the session ends." when no tile has work and the evening did not end today. Executed at c4893c88 (scratch recap.cjs, outside the repo; 20:00 on 24 Sep, a log of 42 minutes, 1 problem, 3 hints and 1 hard problem from 19:00 the day before, no event since): the maths tile is empty "Not tonight" with 0 hints and 0 second hints, the phone tally is "" and the phone shows "Arrives when the session ends."; the same log stamped day 2026-9-24 gives 3 hints and 1 second. Pinned by tools/tv-recap-test.cjs ('MB5-3'). (fc8a5151) |
| 2026-10-09-maths-l1/recert-4/L1-radka-41-MB5-3 | minor | The phone's Recap opened the next day before any TV event shows yesterday's hints as toni… | Same fix as L1-nela-12-MB5-2 (fc8a5151): recapRows and the phone tally count the log only when it is today's (tonightsLog, tv/recapRows.ts:71-74, applied at :77-78 and at phone/page.tsx:757). Executed at c4893c88 (scratch recap.cjs): a yesterday-stamped log, and an undated log whose timer started yesterday, with no event -> the maths tile reads "Not tonight" with 0 hints, the phone tally is empty and the Recap says "Arrives when the session ends."; a log of today keeps its 3 hints. An undated log with no start time still counts as tonight's, as the store's own rule does. (fc8a5151) |

## Narrowed (still open)

None.

## Still open

| Finding | Restated as | Sev. now | Title | What the code does now |
|---|---|---|---|---|
| 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB1-1 | 2026-10-09-maths-l1/recert-5/L1-matyas-19-MB1-1 | minor · rank 6 | His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question… | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) |
| 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB1-2 | 2026-10-09-maths-l1/recert-5/L1-matyas-19-MB1-2 | polish · rank 2 | A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n->∞) are | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-1 | 2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-1 | minor · rank 6 | Calculus 2: by-parts working (and the other technique topics) is read as nothing; the pen… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-2 | 2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-2 | minor · rank 6 | Word-problem parts with an irrational answer accept only the exact form or about 6 figure… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-3 | 2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-3 | polish · rank 2 | Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left outside t… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-4 | 2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-4 | minor · rank 3 | Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequences 33) | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-matyas-19-MB3-5 | 2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-5 | polish · rank 1 | question(spec).tex is computed for every Calculus spec and read by no screen | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-nela-12-MB2-1 | 2026-10-09-maths-l1/recert-5/L1-nela-12-MB2-1 | minor · rank 6 | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročn… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-nela-12-MB2-2 | 2026-10-09-maths-l1/recert-5/L1-nela-12-MB2-2 | minor · rank 6 | Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-nela-12-MB5-1 | 2026-10-09-maths-l1/recert-5/L1-nela-12-MB5-1 | minor · rank 3 | A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off) | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-owen-17-MB2-1 | 2026-10-09-maths-l1/recert-5/L1-owen-17-MB2-1 | minor · rank 6 | The three linear-equation units have no worked lesson: 'See how first' is offered on 14 o… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-owen-17-MB2-2 | 2026-10-09-maths-l1/recert-5/L1-owen-17-MB2-2 | minor · rank 4 | The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the Prepare fix… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-owen-17-MB4-1 | 2026-10-09-maths-l1/recert-5/L1-owen-17-MB4-1 | minor · rank 6 | 31 typed paper rows live only in React state: a phone reload or tab discard loses them | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) |
| 2026-10-09-maths-l1/recert-4/L1-radka-41-MB4-1 | 2026-10-09-maths-l1/recert-5/L1-radka-41-MB4-1 | minor · rank 6 | A cz parent picks Czech statements, but the TV and the Prepare line echo the English stat… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-radka-41-MB5-1 | 2026-10-09-maths-l1/recert-5/L1-radka-41-MB5-1 | minor · rank 6 | Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back' (the silent UK de… | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) |
| 2026-10-09-maths-l1/recert-4/L1-radka-41-MB5-2 | 2026-10-09-maths-l1/recert-5/L1-radka-41-MB5-2 | minor · rank 6 | The recap and the week cover only the child seated now | cited lines re-found at c4893c88; the recapRows.ts cite (66-68) and the phone Recap block (741-750) sit in changed hunks of fc8a5151 and were re-read by hand: the signature moved to :77 and now wraps the log in tonightsLog, and the phone block moved to :750-760 with the tally taking the same wrapped log; the history is still the seated learner's and the block is still titled with their name; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) |
| 2026-10-09-maths-l1/recert-4/L1-vojtech-18-MB4-1 | 2026-10-09-maths-l1/recert-5/L1-vojtech-18-MB4-1 | minor · rank 6 | The TV never shows which statement led a question to a topic (topics[].codes unwired) | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-vojtech-18-MB4-2 | 2026-10-09-maths-l1/recert-5/L1-vojtech-18-MB4-2 | minor · rank 6 | Back from an off-desk row of the recovery list lands on Equivalent fractions | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |
| 2026-10-09-maths-l1/recert-4/L1-vojtech-18-MB4-3 | 2026-10-09-maths-l1/recert-5/L1-vojtech-18-MB4-3 | minor · rank 6 | The only inequality statement is the linear A22; a quadratic or logarithmic inequality, o… | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked (the brief), and the rules suites (`npm run test:rules`) pass at c4893c88: 85 suites green, 2068 of 2068 tests.

## New findings for the next drain

None. No walked fix opened a new row this round.

## Method

Commits since recert-4 (11; 6 touch desk/, 2 only tools/):

- c4893c88 uat: live J2 swap rerun on the changed instrument (tomas-9, lukas-24 swapped with a command sent; oksana-34, petra-38 pressed none)
- 93c70f34 fix(uat): a per-topic action resolves by the topic's title, and a step that resolves to no command is recorded 'unresolved', never ok (0fe1e00b: six …
- e9c5802b test(phone): the empty-box guard follows the Analyse button's new onClick (recert-4/L1-helena-46-EM1-7)
- 087c9d13 fix(essay): an opened one-paragraph kept piece, changed and read, goes the piece path and adds a version to its shelf id (recert-4/L1-helena-46-EM1-7)
- ede841e4 fix(essay): after a piece read the phone walks the TV to the next paragraph with essay.at and withholds This paragraph only for a paragraph the piece…
- 0fe1e00b uat: live J2 swap check of adela-17 and tomas-9 after 332e49a5
- 332e49a5 fix(linga): a plan Swap never hands back the topic it replaces or an earlier rejected one, and says so when nothing different comes (recert-6/LT-adel…
- e32f688d fix(twin): /api/twin answers 403 unless the seated learner is an adult in Adult mode, and /drop hides the twin panel then (recert-4/L1-helena-46-EM5-…
- fb23fe5c fix(twin): quoted thread text is stripped before the twin is measured and exported, and the copy says the card carries up to five of her own texts (r…
- e5b2d34e uat: L1 recertify round 4 of the Math and Essay L1 runs (recert-4) on 67581c54, OPEN.md 425 -> 419
- fc8a5151 fix(maths): the Recap ignores a log whose day is not today, on the TV tile and the phone tally (recert-3/L1-nela-12-MB5-3, recert-3/L1-radka-41-MB5-3)

Rows the brief named: fdafb05f, fb23fe5c, e32f688d, ede841e4, 087c9d13, e9c5802b, fc8a5151. fdafb05f is an ancestor of 67581c54, so recert-4 already stamped it (barbora-43-EM1-4 and daniel-15-EM3-1 at recert-3); it needs no stamp here. e9c5802b is a test-only follow-up to 087c9d13 (tools/phone-panel-test.cjs) and is named in that row. 332e49a5 (Linga plan Swap; desk/src/lib/english/check.ts and types.ts) touches no Essay or Math code or cite and is not stamped; 93c70f34, 0fe1e00b and c4893c88 change only uat/.

Rows were answered only from the code at c4893c88; executed evidence is in the fixed rows and in each walk (scratch repros outside the repo, loaded with `tools/ts-load.cjs`: `piece.cjs`, `twin.cjs`, `recap.cjs`). A cite is a line of recert-4's evidence re-mapped through `git diff -U0 67581c54 c4893c88` per file; a cite inside a changed hunk was re-read by hand, and every cite that only moved was compared with its old line (37 of 39 identical; the 2 that differ sit in the Recap block fc8a5151 edited and were re-read by hand, as were the cites inside a changed hunk). The ledger was read before any stamp was written and the rerun's own rows were skipped, as `finishLedger` does; stamps were written once.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-4 (an L1 code walk; this round by the builder session itself); the product moved: desk/ changed in the commits listed under Method, which is why some rows are fixed. | all rows | 2026-10-09-maths-l1/recert-4 -> 2026-10-09-maths-l1/recert-5 |
