# L1 recertify, round 2, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-17)

This was a code-only L1 re-walk of all 13 pairs of `uat/runs/2026-10-09-maths-l1` on main 90e032f2 (`90e032f273eb27cbfbc0ce63394305ee4991a8df`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 32 rows open in `recert-1/findings.json` were answered `fixed` or `recurs` with current file:line evidence, one walker per Character (radka-41, nela-12, vojtech-18, matyas-19, owen-17). The full tables are in `uat/runs/2026-10-09-maths-l1/recertify-2.md`, the per-pair walks in `recert-2/`, and the stamps in the run's `findings.json` and `recert-1/findings.json`, written by `recertify.cjs writeBack()`. "Fixed" means fixed at L1: the code landed. Nothing is resolved-verified, because Math L2 still waits on the vision host.

Eleven desk/ commits landed since recert-1 (d4f5042a). Five of them close Math rows: c88aef1f and d88fb34c (leak backstop), 37425037 and 4b82f0a3 (partial-link routing), 90e032f2 (photo-marking prompts).

## Counts

| | Blocker | Major | Minor | Polish | Total |
|---|---|---|---|---|---|
| Open before | 2 | 9 | 18 | 3 | 32 |
| Fixed (severity as raised) | 2 | 5 | 1 | 0 | **8** |
| Recur (severity now) | 0 | 4 | 17 | 3 | **24** |
| New | 0 | 1 | 2 | 0 | **3** |
| Open now | 0 | 5 | 19 | 3 | **27** |

- Each fixed row names its commit, 8 of 8, and every cited commit is an ancestor of 90e032f2 (checked with `git merge-base --is-ancestor`).
- No recurring row changed severity: no code under any of them moved.
- Both blockers are closed. The Math section of OPEN.md now holds no blocker.
- Pair verdicts were 11 conditional and 2 fail at recert-1. Now 12 are conditional and 1 passes (radka-41 MB1, whose last open row closed). No pair fails.
- OPEN.md went from 442 to 432 open (Linga 344, Essay 66 to 61, Math 32 to 27): 8 Math rows fixed, 3 new, 5 Essay rows fixed in the same round.

## Fixed, with commits

| Row (recert-1 id) | Was | Commit | What the code does now |
|---|---|---|---|
| L1-vojtech-18-MB1-1 | blocker 18 | c88aef1f | The hint's leak guard refuses a listed sequence ("The 10th term is 39."), a bare log, a count ("10 choose 3 is 120."), a simplify item and inflected Czech number words. The walker ran 21 of recert-1's 25 lines at cz; I re-ran its script: every answer-bearing line refuses except "Takže x = 11." (a wrong answer, not the answer), and the three method lines pass. |
| L1-vojtech-18-MB4-1 | blocker 18 | 37425037, 4b82f0a3 | For a seated cz/18 learner the G17, G20 and N1 papers no longer lead with Area, Pythagoras or Equivalent fractions; they go to "not on the desk yet" (`recovery.ts:181-193`, Reader from `readerOf`, `recovery.ts:172`). See the watch item below for what the same rule does to a 12-year-old. |
| L1-nela-12-MB1-1 | major 12 | d88fb34c | "Odečti 1/6 od 3/4", "Vyděl", "Uprav", "Doplň", "Zapiš jako" and "Rozděl v poměru" now read into a school spec; every answer line of the old finding leaks=true. |
| L1-radka-41-MB1-1 | major 9 | d88fb34c | The same phrasings, with "Zaokrouhli" caught by the rounding fallback on the worded forms. One residual spelling is a new row (below). |
| L1-vojtech-18-MB2-2 | minor 6 | d88fb34c | Czech cardinals are read before "procent": "Je to dvacet procent." is refused. |
| L1-vojtech-18-MB2-1 | major 12 | 90e032f2 | The school photo-marking prompt carries the school system and the cz notation line (`mark.ts:168`). Whether vision keeps the learner's form is L2's to measure. |
| L1-owen-17-MB2-1 | major 12 | 90e032f2 | The linear photo prompt asks for the answer copied exactly as written (`mark.ts:171`); the solution gate in `kinds.ts:117-122` is unchanged. |
| L1-owen-17-MB4-1 | major 9 | 4b82f0a3 | With a seated Reader a broad N2 loss no longer spreads over decimals rows; a fraction question goes to "not on the desk" and an A17 loss shares over three equation units. The same rule is the new watch row. |

## Recurs

24 rows recur. No commit touched them, and each cite was re-found at 90e032f2. The ones that matter, by pair:

- **matyas-19 MB3:** L1-matyas-19-MB3-1 (major 12, implicit differentiation) recurs; **fix in flight**, a parallel run is building it and it is not on main at 90e032f2. Executed: `readQuestion("Find dy/dx if x^2 + y^2 = 25")` reads linear, and "dy/dx = -x/y." passes `leaksLine`. Five smaller MB3 rows and two MB1 rows recur unchanged.
- **radka-41 MB4 and vojtech-18 MB4:** the 97 GCSE-worded statement picker for Czech mocks (L1-radka-41-MB4-1, L1-vojtech-18-MB4-2, both major 9); the TV never shows which statement led a question to a topic (L1-vojtech-18-MB4-3); Back from an off-desk row lands on Equivalent fractions (L1-vojtech-18-MB4-4), which now bites harder because most of a maturita paper's rows are off-desk.
- **vojtech-18 MB1:** the neutral maturita stance still says "a 15-year-old" and names no method (L1-vojtech-18-MB1-2, major 9).
- **nela-12 and radka-41:** the silent UK default (L1-nela-12-MB5-1), the 24-press child setup, the stale next-day phone Recap (filed twice), the recap covering one child, tier-2 fraction denominators, and unsimplified sums ticked right.
- **owen-17:** no worked lesson for the three equation units, the Topics ruler printing "Year 5" to "Year 9", and 31 typed paper rows held only in React state.

## New

| Row | Severity | What |
|---|---|---|
| 2026-10-09-maths-l1/recert-2/L1-radka-41-MB4-2 | major 12 | The routing watch item (answered in full below): the below-year cut sends N1, N2, N8 and A1 to not-on-the-desk for any school-age learner. |
| 2026-10-09-maths-l1/recert-2/L1-nela-12-MB1-1 | minor 6 | "Zaokrouhli 3,456 na dvě/2 desetinná místa" is not read by the rounding fallback (`maths.ts:325`), so "3,46" is not caught. "na desetiny", "na setiny" and English "2 decimal places" are. |
| 2026-10-09-maths-l1/recert-2/L1-vojtech-18-MB1-2 | minor 6 | The two-point line backstop misreads points written without a space: `lineOf` rewrites "(1,3)" as decimals (`maturita.ts:100`), so "The line is y = 2x + 1." passes on "Find the line through (1,3) and (3,7)". Found while spot-checking c88aef1f; the shapes recert-1 listed all refuse. |

## Watch item: where a 12-year-old UK learner's fraction statements go

4b82f0a3 moved the RP3 fixture Ema from age 12 to 8. I executed the rules on a scratch paper outside the repo (`recovery()`, `reachOf`, `paperView`, then `readerOf` from a seated profile), not read them.

- **The rule.** `destinations()` (`recovery.ts:181-193`) keeps a touched unit only if `!past(id) || WHOLE[code]?.includes(id)`, where `past` means the unit's year is below `schoolYear(system, age)` (`syllabus.ts:302`). A UK 12-year-old is in Year 8. `gcse.ts:146-153` `WHOLE` lists only N10, N12, A17, R4, R5 and R9.
- **Result.** For paper [N2 0/3, N1 1/3, A1 0/2]:

  | Reader | Topics | Not on the desk |
  |---|---|---|
  | none, or UK age 8 | Equivalent fractions 2, Adding and subtracting fractions 1, Multiplying and dividing fractions 1, Decimal arithmetic 1, One-step equations 2 | (A4 only) |
  | UK age 10 (Year 6) | N2's three units; not Equivalent fractions | N1 |
  | **UK age 12** (Year 8) | **none** | **N2 3, N1 2, A1 2** |
  | CZ age 12 (7. ročník) and CZ age 14 (Šimon, 9. ročník) | **none** | N2 3, N1 2, A1 2 |

  `paperView` on a seated 12-year-old UK profile gives no topic and the caption "None of these has a topic on the desk yet." (`paperRows.ts:119`).
- **Answer.** Wrongly sent. A statement like N2 ("the four operations with … fractions") whose core is exactly the unit Adding and subtracting fractions is dropped as soon as the learner is two years past that unit, so every school-age learner who loses marks on fractions or on algebraic notation gets no unit at all, although the desk has them. N10, N12, A17, R4, R5 and R9 stay in reach only because someone listed them in `WHOLE`. The cut was written for the Czech maturita paper (MB4-2); it applies to every age. The fixtures were moved to ages that avoid the case (Ema to 8, aim-5 to 10), so no test pins a school-age learner's fraction statement.
- **Filed** as L1-radka-41-MB4-2 (major 12: frequency high, reachability med, trust erosion med), because Radka's Šimon (CZ 14) hits it on his CERMAT mock. Not fixed here.
- **Fix direction.** Apply the below-year cut only where the learner is well past the unit (for example more than three school years above it, or only from age 16), or add the units that carry a statement's core to `WHOLE` (N1 to frac-equivalent, N2 to frac-add-sub and frac-mul-div, N8 to frac-add-sub). Put the Ema fixture back at 12 and pin both outcomes in `tools/recovery-rules-test.cjs`: the 18-year-old keeps the cut, the 12-year-old reaches the fraction unit.

## Top 5 still open, ranked

No blocker is open. The ranking is by harm to the Math Characters' C1 (no answer given away), to marking, and to the paper list.

1. **Below-year routing strands school-age fraction statements** (L1-radka-41-MB4-2, new, major 12). See the watch item. *Fix direction:* narrow the cut or extend `WHOLE`, and pin a UK-12 and a CZ-14 paper in `recovery-rules-test.cjs`.
2. **Implicit differentiation is promised and cannot be practised** (L1-matyas-19-MB3-1, now `recert-2/L1-matyas-19-MB3-1`, major 12; **fix in flight**). `calc1-chain` names it (`calculus1.spine.ts:116-120`), but no implicit item can be set, read, hint-guarded or marked (`calc.ts:42`). *Fix direction:* the parallel run adds an implicit-derivative shape to `CALC_SHAPES` with a reader and a checker; when it lands, re-walk this row.
3. **The statement picker is 97 English GCSE statements for Czech mocks** (L1-radka-41-MB4-1 and L1-vojtech-18-MB4-2, major 9, filed twice). `PaperPanel.tsx:33` offers one GCSE list to every school system; a cz parent must translate "HCF, LCM" and "loci". *Fix direction:* a cz statement list keyed to the learner's system, or Czech labels on the existing codes, with the find-by-words box searching both.
4. **The maturita hint stance fixes the age at 15 and names no method** (L1-vojtech-18-MB1-2, now `recert-2/L1-vojtech-18-MB1-1`, major 9). `voice.ts:68-78` still opens "a maths tutor for a 15-year-old" for a sequence, line or inequality task. *Fix direction:* take the age from the profile and put the task's method (the unit the reader finds) into the stance, as the school path does.
5. **The leak backstop's last two blind spots** (the two new minor rows: `recert-2/L1-nela-12-MB1-1`, "Zaokrouhli … na dvě desetinná místa", and `recert-2/L1-vojtech-18-MB1-2`, unspaced points). Under the rubric a passed leak is a blocker; both are filed minor 6 because the backstop is blind, not because a leak was seen. *Fix direction:* read the decimal-place wording in `maths.ts:325` and run `lineOf`'s point reader before the decimal-comma rewrite (`maturita.ts:100`), and pin both in the rules tests.

The next ones are minor: the silent UK default and the 24-press child setup (L1-nela-12-MB5-1, L1-radka-41-MB5-1), the stale next-day phone Recap (L1-nela-12-MB5-3, L1-radka-41-MB5-3), and his own MA1 sheet never marked (L1-matyas-19-MB1-1).

## Method notes

- Rows were answered from the code at 90e032f2, with executed repros in scratch directories outside the repo (leak lines through `leaksLine`, `recovery`/`paperView` papers, `readQuestion`, the typesetter). Model-dependent behaviour (whether vision keeps "1 3/4" as written, whether the model obeys the withhold rule) stays with L2.
- The ledger needed a second pass. The first `writeBack` run also stamped the new `recert-2` rows, because they were already in the ledger when the chain rows were collected; that was reverted and re-run with the rerun's own rows skipped, as `finishLedger` does. The committed stamps are the second run.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`. The Math section equals the 27 open rows of `recert-2/findings.json`, row for row. The Linga section is **not byte-identical** to the previous OPEN.md: its 344 rows, ids, ranks and order are unchanged, but 218 lines carry a different `product: N of 105 files changed since` figure (for example 12 became 22), because the ledger counts the desk/ files that moved under a Linga row's product stamp and 11 desk/ commits landed in between. Nothing else in the section moved.
- A reader of the ledger should expect recert-2 ids to be renumbered: restatements are positional within the new folder (for example `L1-owen-17-MB2-1` in recert-2 restates `L1-owen-17-MB2-2` in recert-1). Each restatement carries `recurs: <run>/recert-1/<id>`.
