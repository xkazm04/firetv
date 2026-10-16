# Linga placement thresholds: decision record of 2026-10-16

State described: main at db604738. Source file: `desk/src/lib/english/placement.ts`. Commits: c7a99b7e, b4c67801, pinned by 3a49c0c1. Live check: `uat/runs/2026-10-16-lt-placement-oos` (run 523e1c73), drained at db604738. A later capture appends the outcome of the A2/B1 follow-up in section 7.

## 1. Constraint that forced the choice

The 2026-10-14 LT recerts stored eight high-confidence placements across recert-1 and recert-3. Six of the eight were one band above the true band (Adela B2 to C1, Jana C1 to C2 twice, Petra A2 to B1, Klara A2 to B1, Oksana B1 to B2), and all eight rested on exactly two strong passes (c7a99b7e and the doc comment on `HIGH_STRONG_PASSES`). Every near miss of those recerts was one band high, none low (b4c67801). A badge that reads high and is wrong is the worst failure for a level that a certificate can consume, so the ladder had to stop saying high on thin evidence.

## 2. Decision

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| T1 | Confidence is high only with `HIGH_STRONG_PASSES` = 3 strong passes at the placed band (and a real fail or partial above it, or C2). | Six of eight stored highs were one band high, all on two strong passes. | Two strong passes, the earlier threshold, which the recert data refuted. No other alternative is recorded. | built, c7a99b7e |
| T2 | Confidence is never high when the ladder band differs from the about-questions read (`selfBand` in `check.ts`). It caps at medium, or low when the band has fewer than two strong passes. | The talk and the tasks disagreeing is evidence against a high. | none recorded | built, c7a99b7e |
| T3 | Thin evidence is `THIN_STRONG_PASSES` = 2: fewer than two strong passes at the top band. | b4c67801. | none recorded | built, b4c67801 |
| T4 | Lean down, never up: when the top band is thin, or the read is lower than the band, and the band just below holds a strong pass of its own, place the learner one band lower. Confidence after a lean is medium, low when the top band was thin. A lower band with no strong pass is not evidence, so Ondrej (B1, read A2, A2 held by a choice only) stays at B1. | Every miss was high, none low. | An upward lean, excluded by the comment because no recert miss was low. No other alternative is recorded. | built, b4c67801 |
| T5 | In a scattered ladder (a pass above a lower real fail), a band more than one above the lowest failed band holds only on a strong pass. A weak pass is a choice between two options or a listening answer of one or two words. | LG-48 (Tomas, A1, age 9, placed B1). Lives in `held` and `weakPass` of `placement.ts`. | A flat cap at one band above the fail, which the comment rejects because a strong say pass above a misclicked 50/50 should still hold its band. | built, in the fix(linga) after the recert drain (LG-48 in `docs/BACKLOG.md`) |
| T6 | The rules are pinned on stored marks. The replay covers recert-1, -2 and -3 (17 placements with marks) against the ladder at dba8c1de: no learner farther from the true band, nothing high that the read or fewer than three strong passes contradicts, and the one-band-high misses it names (Adela, Jana x2, Lukas x2, Tomas, Viktor) land. The test fails on dba8c1de's `placement.ts`. | The thresholds must not drift silently. | none recorded | built, 3a49c0c1 |

The thresholds were fitted on those 17 stored marks, so the replay is in-sample by construction.

## 3. Council verdict on r2

The linga-placement-check feature is full-ready (council review 5047cbb2, in the style of run 5cb436a9). No council report for that full verdict exists in this repo. A grep of `uat/`, `docs/` and `.claude/` for `linga-placement-check` finds only `docs/concepts/STUDY-DESK-COUNCIL-RULINGS-2026-10-09.md`, section 9, which records the earlier lite rounds of the feature (lite r1 ready 0.6329, lite r2 ready 0.7186, judged at 4aa3601f). Those predate r2 and are not its verdict. The full-ready verdict is recorded only in the App Master journal.

## 4. Live out-of-sample result

Run `uat/runs/2026-10-16-lt-placement-oos`, journey J1, claude CLI only (tutor haiku, Character and judge sonnet), measured at 8576ee7f. The run changed no product code. Three Characters are fitted (klara-13, petra-38, oksana-34, whose stored marks set the thresholds) and three were written before the run and not changed after it (sofie-11, dominik-17, hana-41). Sources: `docs/uat-insights/2026-10-16-lt-placement-oos.md` and the run's `report.md`.

| Character | Set | True | Live | Confidence | Distance |
|---|---|---|---|---|---|
| klara-13 | fitted | A2 | B1 | medium | +1 |
| petra-38 | fitted | A2 | B1 | low | +1 |
| oksana-34 | fitted | B1 | B2 | low | +1 |
| sofie-11 | new | A2 | B1 | low | +1 |
| dominik-17 | new | B2 | B2 | low | 0 |
| hana-41 | new | B1 | B1 | medium | 0 |

Unseen: 2 of 3 exact (dominik-17, hana-41), sofie-11 one band high, none low. Nothing is two bands off. There is no high-confidence read at all, so none is high-confidence and wrong. The run's scorecard reads exact 2, near 4, miss 0. The three fitted Characters landed on their r2 replay band, each still one high. The no-false-high property held out of sample; band accuracy on the fitted set did not improve past one band high.

## 5. Known limit: the A2/B1 boundary

All three A2 Characters (klara-13, petra-38, sofie-11) place at B1, and each of the three is one band high. Three of the four one-band misses are on the A2/B1 boundary; the fourth is oksana-34 (true B1, placed B2). The marks from the run JSONs, in task order:

| Character | Marks | Read |
|---|---|---|
| klara-13 | A1 choose pass, A2 choose pass, B1 listen pass (9 words), B2 say fail, B1 say pass | A2 |
| sofie-11 | A1 choose pass, A2 choose pass, B1 listen pass (5 words), B2 say fail, B1 say partial | A2 |
| petra-38 | A2 choose pass, B1 listen partial (16 words), B1 say partial | B1 |

The pattern: a B1 listen pass (klara, sofie), a B1 say task that is a partial or a pass, and A2 held only by weak choose passes. Petra differs in one detail: her B1 listen was a partial, and two partials at B1 end the check at B1. In all three, the band below B1 holds no strong pass, so the lean-down rule (T4) cannot fire: a lower band with no strong pass is by design not evidence. What the rules did do is cap confidence. Klara reads medium (the read A2 differs from B1), sofie and petra read low. The judge findings ask for a clearer caveat on these verdicts: the line "What you said at the start pointed elsewhere, so this is a careful guess" (LT-klara-13-J1-2, LT-sofie-11-J1-1) and the line "Linga placed you one level lower than your answers alone, to be safe" (LT-dominik-17-J1-4, LT-oksana-34-J1-2) state a rule, not a reason.

The outcome of the tightening aimed at this limit is in section 8.

## 6. Limits of the evidence

n = 6, one run each, model-played Characters, LT only (no L2). A single run per Character cannot separate a Character's luck from the ladder. Three of the six were fitted, so only three are out of sample, and only one of those is an A2. One A2 sample is not a trend; it does show that the rule that lifts A2 learners to B1 was not removed by the fit. Judge agreement was 23 of 28 (82 percent), so some per-task verdicts are contested. A second run of the three new Characters would give a spread.

## 7. Follow-up

A separate delivery is tightening the A2/B1 boundary only, without moving any B1/B2 exact result (dominik-17 and hana-41, and the pinned replay of 3a49c0c1). It is dispatched beside this record and is not part of the state described here. The next capture appends its outcome. That outcome is section 8. LG-48 and LG-49 in `docs/BACKLOG.md` carry the run's recert lines; no new LG row was filed because nobody landed two bands off or high-confidence wrong.

## 8. Outcome of the A2/B1 tightening (ae4b1153)

The tightening: 7c94669c ("lean B1 to A2 on any A2 pass when the read is below B1"), pinned by the replay test 26376e3d and noted under LG-48 by ae4b1153. When the about-questions read is below B1, B1 is the top held band, held by its own passes and checked above, and A2 holds a pass of any kind (a choice counts), the placement leans to A2 at low confidence. The accepted risk is the mirror case: a true B1 learner whose read comes out low could now be placed A2.

### Stored replay (in sample)

`tools/linga-rules-test.cjs`, test "A2/B1 boundary", replays all 23 stored placements (the 17 recert placements with marks and the six of `2026-10-16-lt-placement-oos`) against the ladder at db604738. Exact goes from 14 to 19 of 23. The five that move are all true A2 and all land on A2: klara-13 (recert-1, recert-3, OOS), petra-38 (recert-1) and sofie-11 (OOS). No placement moved below its true band, farther from it, or to high, and every one of the 14 exact placements stayed exact. OOS petra-38 (read B1) and ondrej-16 (true B1) stay B1. The test is green in this worktree's `npm run test:rules` (linga-rules-test 159/159). These marks are the ones the rule was written against, so this result is in sample by construction.

### Live out-of-sample run

Run `uat/runs/2026-10-16-lt-a2b1-tightening`, journey J1, claude CLI only (tutor haiku, Character and judge sonnet), `--parallel 1`, measured at c290d10b (clean; `placement.ts` blob 782e7e11, which includes the tightening). Changed no product code. The new Character ivana-33 (true B1, built to read low: brief, hesitant, self-deprecating about-question answers, simple task answers) was committed alone in c290d10b before the run and not changed after it. "Rule fired" is decided by replaying each Character's live marks through `staircase` at this product with and without the read. Source: the run's `report.md`, last section.

| Character | True | Read | Placed | Confidence | Distance | Rule fired | Previous OOS run (read, placed) |
|---|---|---|---|---|---|---|---|
| ivana-33 | B1 | B1 | B1 | low | 0, exact | no: read B1; raw ladder band B2 (two B2 say partials), leaned to B1 by T4 | n/a, new |
| petra-38 | A2 | B1 | B1 | medium | +1, near | no: read B1 | read B1, placed B1 low |
| sofie-11 | A2 | A2 | A2 | low | 0, exact | yes: without the rule the same marks place B1 | read A2, placed B1 low |

Live marks, in task order: ivana-33 A2 choose pass, B1 listen pass, B2 say partial, B2 say partial. petra-38 A2 choose pass, B1 listen pass, B2 say partial, B2 say fail, B1 say partial. sofie-11 A1 choose pass, A2 choose pass, B1 listen pass, B2 say fail, B1 say partial.

**The new true-B1 Character was not placed A2. The accepted risk was not realized, and it was not exercised.** Ivana's about-question answers came out short and self-deprecating, as played ("At school and a course. Sorry, my English is not good."), and the read was still B1, so the rule's precondition never held. Her marks could not have triggered it with any read: her raw band is B2 from two partials, not B1, and a replay with a read of A2 or A1 still places her B1. The risk case needs a true B1 whose ladder tops out at B1 and whose read is A2. No stored or live sample has that shape yet.

On the A2 side the rule did its job where its precondition held. Sofie (read A2) moved from one band high to exact, which matches her stored replay. Petra's read came out B1 in both live runs, so the rule could not reach her. On her live marks a read of A2 would have placed her A2. Scorecard: exact 2, near 1, miss 0. On the same two A2 Characters the previous run had exact 0, near 2. No read was high-confidence.

### Honest ceiling

n = 3, one run each. The Characters are model-played and judged by a model of the same family (claude sonnet), and the tutor is a claude model too. LT only, no L2. The one sample built for the accepted risk did not reach the condition it was built to test, so the run gives no evidence for or against that risk. One A2 move (Sofie) in one run cannot be told apart from run-to-run luck. Sofie's previous marks were the same shape, though, and both her runs read A2.

### Section 5's known limit: narrowed

The limit in section 5 was that every A2 Character placed B1. The stored replay moves five of those placements to A2, and live Sofie lands on A2. The limit remains wherever the read itself comes out B1 for a true A2 learner. Petra shows this in both live runs and in the stored OOS replay. The tightening depends on the read, so it cannot correct a read that is high. The accepted risk (a true B1 read low and placed A2) is unconfirmed and untested, not refuted. Closing the limit would need a second run of the A2 Characters for a spread, plus a true-B1 sample whose ladder tops out at B1 under a low read.
