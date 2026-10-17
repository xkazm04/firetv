# L1 recertify of the Math Buddy run 2026-10-09-maths-l1 (2026-10-17)

This was a code-only L1 re-walk of all 13 pairs of `uat/runs/2026-10-09-maths-l1` on main d4f5042a. There was no model call, no vision call and no browser, and nothing in `desk/` changed. There was one walker per Character (radka-41, nela-12, vojtech-18, matyas-19, owen-17), and every open row was answered `fixed` or `recurs` with current file:line evidence. The full tables are in `uat/runs/2026-10-09-maths-l1/recertify.md`, the per-pair walks in `recert-1/`, and the stamps in the run's `findings.json`, written by `recertify.cjs writeBack()`. "Fixed" means fixed at L1: the code landed. Nothing is resolved-verified, because Math L2 still waits on the vision host.

## Counts

| | Blocker | Major | Minor | Polish | Total |
|---|---|---|---|---|---|
| Open before | 17 | 34 | 38 | 0 | 89 |
| Fixed (severity as raised) | 14 | 27 | 30 | 0 | **71** |
| Recur (severity now) | 2 | 7 | 9 | 0 | **18** |
| New | 0 | 2 | 9 | 3 | **14** |
| Open now | 2 | 9 | 18 | 3 | **32** |

- Each fixed row names its commit, 71 of 71, and every cited commit is an ancestor of d4f5042a.
- Two recurring rows changed severity on re-derived impact:
  - L1-owen-17-MB4-1, blocker to major: the shared rows now add up and are labelled "shared".
  - L1-matyas-19-MB1-3, major to minor: the server marks an own page, but no control sends the page id.
- The 14 new rows are 12 from the 2026-10-14 walk that still hold at d4f5042a, plus 2 seams found in this walk:
  - Owen's Topics ruler still prints "Year 5".."Year 9".
  - Back from an off-desk paper row lands on Equivalent fractions.
- The 14 new rows come from 11 underlying gaps. The Czech-phrasing leak gap is filed three times, as nela-12 MB1, radka-41 MB1 and vojtech-18 MB2. The stale next-day phone Recap is filed twice, as nela-12 MB5 and radka-41 MB5.
- Pair verdicts were 2 conditional and 11 fail at 2026-10-09; now 11 are conditional and 2 fail (vojtech-18 MB1 and MB4).
- What was fixed:
  - the recap's "all of it right" on an unmarked night (L1-radka-41-MB1-2, L1-nela-12-MB5-1);
  - the never-resetting log;
  - the week page that saw no homework;
  - mixed-number false ticks;
  - the paper list that did not add up;
  - "(and 10 more)" off-desk statements;
  - the Calculus leak check on Czech-worded MA1 items.

## Top 5 still-open blockers, ranked

Only two open rows are blocker-severity. The ranking is filled out with the three majors that do the most harm to C1 (no answer given away) and to the marking.

1. **The hint's code leak guard misses whole answer shapes** (L1-vojtech-18-MB1-1, blocker 18). It refuses 19 of 25 lines tried, but a listed sequence ("3, 7, 11, ..."), a bare log, a simplify item, a counting question and Czech number words in other grammatical cases still pass (`rules/maturita.ts:47-62`, `rules/maths.ts:296-299`). *Fix direction:* read a listed sequence into a1/d in `sequenceTermOf`. Then add a Czech number-word reader (all cases) to the SOLUTION fallback, and pin each passing line in a rules test.
2. **Paper statements route maturita questions onto 5.–8. ročník units** (L1-vojtech-18-MB4-2, blocker 18). A cylinder-volume question leads with "Area of rectangles", and an inequality with "Equivalent fractions" (`library/gcse.ts:114,117`, `rules/recovery.ts:175-177`). *Fix direction:* when a statement only partially links to a unit below the learner's year, send it to "not on the desk" rather than to the lowest touched unit.
3. **Common Czech instructions still blind the leak backstop** (L1-nela-12-MB1-1 major 12, L1-radka-41-MB1-1 major 9, L1-vojtech-18-MB2-2 minor 6). "Odečti X od Y", "Vyděl", "Rozděl … v poměru", "Uprav", "Zaokrouhli", "Doplň" and "Zapiš … jako desetinné číslo" read as linear with no spec, and "dvacet procent" is not a percentage (`rules/taskText.ts:16-34`, `rules/school.ts:2656`). Under the rubric a passed leak is a blocker. These are filed as major because the backstop is blind, not because a leak was seen. *Fix direction:* add the missing verbs and the subtrahend-first "X od Y" order to `taskText.ts`, and read Czech cardinals before "procent".
4. **Photo marking runs without school system or notation** (L1-vojtech-18-MB2-8, L1-owen-17-MB2-7, major 12). The school prompt has no system or decimal-comma line. The linear prompt asks for "a plain number or simple fraction", which can hide the learner's form, and the model's own solution gates the verdict (`desk/mark.ts:146-170`, `rules/kinds.ts:118-122`). *Fix direction:* pass `notationLine(system)` and the item's answer shape into both mark prompts, and ask for the answer as written. Then measure at L2 once the vision host is up.
5. **Implicit differentiation is promised and cannot be practised** (L1-matyas-19-MB3-3, major 12). calc1-chain's blurb names it, but no implicit item can be set, read, hint-guarded or marked (`library/calculus1.spine.ts:116-120`, `rules/calc.ts:42`). *Fix direction:* add an implicit-derivative shape to `CALC_SHAPES` with a reader and a checker, or cut the promise from the blurb until it exists.

The next ones are: the GCSE-only statement picker for Czech mocks (L1-radka-41-MB4-4, L1-vojtech-18-MB4-5, major 9); one broad statement fanning a loss over three topics (L1-owen-17-MB4-1, major 9); and the method-less maturita hint stance that fixes the age at 15 (L1-vojtech-18-MB1-2, major 9).

## Method notes

- `2026-10-14-l1/math-family` and `math-adult` had already re-walked these rows on 4af25199, but the ledger never read them. That run has no top-level `findings.json` and no `recert-<k>` folder, so OPEN.md kept listing all 89 rows as never rechecked. Here its answers were leads only, and every row was re-checked after the 130 desk/src commits since. An L1 re-walk of a run should land as `<run>/recert-<k>/`, as this one does, or the ledger cannot see it.
- Regenerating OPEN.md with `--status` also added `product:` cells and "seen on the current product" lines to the Linga and Essay sections. The ledger can now stamp the product; the previous OPEN.md was written without it. No Linga or Essay row changed state: the total went from 510 to 453, exactly the 57 rows Math lost.
