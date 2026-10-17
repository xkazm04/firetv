# L1 recertify, round 3, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-17)

This was a code-only L1 re-walk of the 11 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on main 00f5db95 (`00f5db956f6c77cdfda09e5a5f477261bd543eda`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 27 rows open in `recert-2/findings.json` were answered `fixed` or `recurs` with current file:line evidence; the five commits that claim a Math row were each proved by an executed scratch repro outside the repo, not read. The full tables are in `uat/runs/2026-10-09-maths-l1/recertify-3.md`, the per-pair walks in `recert-3/`, and the stamps in the run's `findings.json`, `recert-1/findings.json` and `recert-2/findings.json`, written by `recertify.cjs writeBack()`. "Fixed" means fixed at L1: the code landed. Nothing is resolved-verified, because Math L2 still waits on the vision host.

Ten desk/ and docs commits landed since recert-2 (90e032f2); five close or narrow Math rows: fd9f5ca5, 7107748f (with the decision record d66be973 / 20769444), 00f5db95, 8f5e4a5e, 0a7b8086. Ids below are recert-2's; the brief and the commit messages sometimes use recert-1's (fd9f5ca5 says L1-matyas-19-MB3-3 for recert-2's L1-matyas-19-MB3-1).

## Counts

| | Blocker | Major | Minor | Polish | Total |
|---|---|---|---|---|---|
| Open before | 0 | 5 | 19 | 3 | **27** |
| Fixed (severity as raised) | 0 | 2 | 2 | 0 | **4** |
| Recur (severity now) | 0 | 3 | 17 | 3 | **23** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 3 | 17 | 3 | **23** |

- Each fixed row names its commit, 4 of 4, and every cited commit is an ancestor of 00f5db95 (checked with `git merge-base --is-ancestor`).
- One row is **narrowed**, not fixed: L1-radka-41-MB4-2 (below-year routing), now major 8 (was 12), see the residual below.
- No blocker is open; none was fixed this round (none was open).
- Of the 11 pairs re-walked, nine stay conditional and nela-12 MB1 and vojtech-18 MB1 now pass, because their last rows closed. radka-41 MB1 and vojtech-18 MB2 had no open row at recert-2 and were not re-walked. No pair fails.
- OPEN.md went from 432 to 425 open (Linga 344, Essay 61 to 58, Math 27 to 23): 8 rows fixed (4 Math, 4 Essay), 1 new (Essay).

## Fixed, with commits

| Row (recert-2 id) | Was | Commit | What the code does now |
|---|---|---|---|
| L1-matyas-19-MB3-1 | major 12 | fd9f5ca5 | A tenth shape, `implicit-derivative` (`calc.ts:46-50`), set by calc1-chain, read from English and Czech phrasings, marked (-x/y and x/(-y) right, x/y a sign slip; a value at a point judged as derivative-at is) and hint-guarded (`leaksLine` refuses "dy/dx = -x/y." and, at a point, "the slope is -0.75"). Executed on "Find dy/dx if x^2 + y^2 = 25". |
| L1-nela-12-MB1-1 | minor 6 | 8f5e4a5e | The rounding fallback reads "na dvě/2/jedno/tři desetinná místa" (`maths.ts:325-327`). Executed: "3,46" for "Zaokrouhli 3,456 na dvě desetinná místa" is flagged; so are "3,5" for one place and English "3.46" for two decimal places. |
| L1-vojtech-18-MB1-1 | major 9 | 00f5db95 | `voiceOf("maths", age)` names the profile's age ("an 18-year-old"), and a sequence, line or inequality task puts its method in the stance (`hint.ts:90-110`). Executed with the text engine stubbed to capture the system prompt: all three read "a maths tutor for an 18-year-old. This is …". |
| L1-vojtech-18-MB1-2 | minor 6 | 0a7b8086 | `lineOf` reads bracketed points as written before the decimal-comma rewrite (`maturita.ts:100-103`). Executed: "(1,3) and (3,7)" is the line y = 2x + 1 and "The line is y = 2x + 1." is flagged; "A[1,5; 2]" is still the decimal point. |

## Narrowed: L1-radka-41-MB4-2, the CZ-14 N1 residual (answered with execution)

7107748f (below-year cut only more than 3 school years past a unit, N2 and N8 in `WHOLE`) fixes what the recert-2 watch item found for a 12-year-old. I executed `recovery()` (`tools/ts-load.cjs`, scratch outside the repo) on the paper [N2 0/3, N1 1/3, A1 0/2] for each Reader:

| Reader | Topics | Not on the desk |
|---|---|---|
| none, UK 8, UK 10, UK 12 (Year 8), CZ 12 (7. ročník) | Equivalent fractions 2, One-step equations 2, Adding and subtracting fractions 1, Multiplying and dividing fractions 1, Decimal arithmetic 1 | nothing |
| **CZ 14 (9. ročník, Šimon)** | One-step equations 2, Adding and subtracting 1, Multiplying and dividing 1, Decimal arithmetic 1 | **N1 "Order integers, decimals and fractions …", 2 marks** |
| CZ 16, CZ 18 | Adding and subtracting 2, Multiplying and dividing 1 | N1, A1 (the intended maturita cut) |

`paperView` on a seated CZ-14 profile gives four topics and one off-desk row; the caption starts "Start with One-step equations." and the N1 marks sit in the off-desk list. So the residual in the decision record (`docs/concepts/MATHS-BELOW-YEAR-CUT-MARGIN-DECISION-2026-10-17.md` section 5) is real and unfixed. A matrix over the 22 statements that have a desk unit shows it is wider than CZ 14: N1 is stranded from **UK age 13** and CZ age 14, A1 joins at **age 15** (UK and CZ), ten statements go at 16 and fourteen at CZ 18. A UK Year 11 GCSE sitter (age 15 or 16) therefore loses N1 and A1 to "not on the desk" too. So L1-radka-41-MB4-2 is stamped **recurs, narrowed**, restated as `recert-3/L1-radka-41-MB4-2` (major, rank 8: frequency med, reachability med, trust med), not fixed. No test pins the case (`recovery-rules-test.cjs:264-287` asserts N2 and A1 for CZ 14 and says nothing of N1).

*Fix direction (not made here):* make the cut depend on the learner's stage as well as the distance, for example only from `schoolYear >= 12`, the sixth-form / maturita learner it was written for; or give the margin per statement; or accept the gap and say it in the caption. Pin UK 13, UK 15, CZ 14 and CZ 15 next to the existing UK 12 / CZ 12 / CZ 18 cases.

## Recurs

22 more rows recur unchanged: no commit touched their cited lines (the files that did change, `calc.ts`, `chain.ts`, `items.ts`, `store.ts`, `gcse.ts`, were checked hunk by hunk and the cites re-mapped). The ones that matter:

- **radka-41 MB4 and vojtech-18 MB4:** the 97 GCSE-worded statement picker for Czech mocks (L1-radka-41-MB4-1, L1-vojtech-18-MB4-1, major 9, filed twice; `PaperPanel.tsx:12`, `:36`, `paperEntry.ts:48` unchanged); the TV never shows which statement led a question to a topic (L1-vojtech-18-MB4-2); Back from an off-desk row lands on Equivalent fractions (L1-vojtech-18-MB4-3).
- **nela-12 and radka-41:** the silent UK default and the 24-press child setup, the stale next-day phone Recap (filed twice), the recap covering one child, tier-2 fraction denominators, unsimplified sums ticked right.
- **matyas-19:** his own MA1 sheet is never marked; five smaller Calculus rows (`lim_(n->inf)`, by-parts working, irrational word-problem answers, the infinity bound in typesetting, two long blurbs) and `question().tex` read by no screen.
- **owen-17:** no worked lesson for the three equation units, the Topics ruler's "Year 5" to "Year 9", and 31 typed paper rows held only in React state.

## New

None. The walk looked at the rows the five commits claim and at their edges; one edge is recorded but not filed: "na tři desetinná místa" with "3,456" is not flagged because that is the number the question prints.

## Top 5 still open, ranked

No blocker is open. Ranked by harm to C1 (no answer given away), to marking, and to the paper list.

1. **The statement picker is 97 English GCSE statements for Czech mocks** (`recert-3/L1-radka-41-MB4-1` and `recert-3/L1-vojtech-18-MB4-1`, recert-1's L1-radka-41-MB4-1 / L1-vojtech-18-MB4-2; major 9, filed twice). `PaperPanel.tsx:33-36` offers one GCSE list to every school system, so a cz parent translates "HCF, LCM" and "loci" while typing a CERMAT mock. *Fix direction:* a cz statement list keyed to the learner's system, or Czech labels on the existing codes, with the find-by-words box searching both.
2. **CZ-14 N1 residual: below-year routing still strands N1 from UK 13 / CZ 14 and A1 from 15** (`recert-3/L1-radka-41-MB4-2`, major 8, narrowed). `recovery.ts:185-190`; N1 is a partial link to Equivalent fractions and not in `WHOLE` (`gcse.ts:146-148`). *Fix direction:* above, with the four ages pinned in `recovery-rules-test.cjs`.
3. **The silent UK default and the 24-press child setup** (`recert-3/L1-nela-12-MB5-1`, `recert-3/L1-radka-41-MB5-1`, minor 6). A profile with no system row reads as UK, so a Czech "0,5" is unsure, and a skipped system row saves United Kingdom. *Fix direction:* ask the system once at the start of setup, with the country's decimal convention in the line, and cut the presses.
4. **The stale next-day phone Recap** (`recert-3/L1-nela-12-MB5-3` and `recert-3/L1-radka-41-MB5-3`, minor 4 and 6). Opened on a new day before any desk event it shows yesterday's hints as tonight's. *Fix direction:* the Recap keys its text to the day it was written and says "nothing yet today" until an event arrives.
5. **His own MA1 sheet is never marked** (`recert-3/L1-matyas-19-MB1-1`, minor 6): no client sends a page id (`phone/page.tsx:387`, `api/mark/route.ts:62`). *Fix direction:* a snapped page whose items read as Calculus specs is marked by the same code judge as a desk set, items that do not read being "not sure"; waits on the vision host for L2.

Implicit differentiation (was the recert-2 number 2) and the maturita stance and backstop rows (recert-2's numbers 4 and 5) have left the list.

## Method notes

- Rows were answered from the code at 00f5db95 with executed repros in scratch directories outside the repo (`recovery`, `reachOf`, `paperView`, `readQuestion`, `checkAnswer`, `leaksLine`, `lineOf`, and `hint()` with the text engine stubbed to capture the stance). Model-dependent behaviour (whether the model sets a sound implicit item, whether vision keeps "1 3/4" as written) stays with L2.
- Every cite of recert-2's evidence was re-mapped through `git diff -U0 90e032f2 00f5db95` per file; a cite inside a changed hunk was re-read by hand and re-written (the evidence of the fixed, narrowed and touched rows).
- The walker was the builder session itself, one pass over all 11 pairs, where recert-2 used one subagent per Character. The two other changes of instrument are none: no model, no vision, same overlay.
- Stamping: `writeBack` ran once, through the ledger (`byGid` of each recert-2 row), skipping the rerun's own rows (`row.run !== recert-3`) from the start, which is the second pass recert-2 had to make by hand. The generator ran once without stamping to check its output, once with; recert-2's findings were read before any stamp in both, so the `recurrence` counters were incremented once. The stamp counts: parent 2 fixed + 11 recurs, recert-1 2 + 22, recert-2 4 + 23.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`. The Math section equals the 23 open rows of `recert-3/findings.json`, row for row (23 of 23 ids present, none extra). The Linga section is **not byte-identical** to the previous OPEN.md: its 344 rows, ids, ranks and order are unchanged, but 213 lines carry a different `product: N of 105 files changed since` figure (22 became 27), because the ledger counts desk/ files that moved under a Linga row's product stamp and 10 desk/ commits landed in between. Nothing else in the section moved.
- A reader of the ledger should expect recert-3 ids to be renumbered: restatements are positional within the new folder (for example `L1-matyas-19-MB3-1` in recert-3 restates `L1-matyas-19-MB3-2` in recert-2). Each restatement carries `recurs: 2026-10-09-maths-l1/recert-2/<id>`.
