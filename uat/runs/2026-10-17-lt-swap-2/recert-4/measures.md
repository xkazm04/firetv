# Measures — Linga error coverage, recert-4 (stops and held fixes counted apart)

Written by a builder on 2026-10-18 from this run's own files (`recert-4/`, plus `recert-5/` for Viktor's J3) at product `4bd2a236`, which contains 59772159 (LG-23 Option 1), a0d0eb74 (raw moments), 6e8900ef (the rubric rule) and 579e663f (`--journeys`). It is not a judge output. Counts come from `facts.conversation` (`moments`, `heldFixes`, `rawMoments`, `turns`) and from the judge's `learnerTurnsWithClearErrors` (N) and `missedClearErrors` (M). The recap was checked step by step: every held fix's `said` text is on the last recap screen ("Saved for the end"), so all held fixes count as coaching under the rubric rule.

## Run shape

- recert-4: the eight recert-3 Characters, `--journeys J3,J4`, 12 pairs (the ledger had open J4 rows for adela, petra and viktor too). Martin's J1 was not rerun (placement, outside the 41 moment turns).
- **Viktor J3 ended `setup-failed` in recert-4** (claude-cli/haiku returned malformed topics JSON; scorecard `not-reached`). It was rerun alone as `recert-5` (`--recertify viktor-67 --journeys J3`) and ran clean. Viktor J3 below is recert-5's.
- **Like-for-like (LFL) with recert-3** = J3 of all eight Characters plus Tomáš J4: 9 pairs, 64 learner turns (recert-3: 54). "All pairs" adds the three J4 pairs recert-3 did not run (adela, petra, viktor): 12 pairs, 74 turns.
- The Character model plays each session afresh, so turn counts and the error mix differ from recert-3 (Jana 10 turns not 4, Ondřej 7 not 4, Petra 3 not 5, Viktor 3 not 5). Read the direction, not the decimals.

## (a) Stops and held fixes, per Character (LFL; N = learner turns with a clear error)

| Pair | Learner turns | N | Stops | Held fixes (distinct, on recap) | Missed, stops alone | Missed, stops + held | Judge's M |
|---|---|---|---|---|---|---|---|
| martin-45 J3 | 7 | 6 | 3 | 3 | 3 | 0 | 0 |
| ondrej-16 J3 | 7 | 7 | 3 | 4 | 4 | 0 | 0 |
| petra-38 J3 | 3 | 2 | 0 | 0 | 2 | 2 | 2 |
| viktor-67 J3 (recert-5) | 3 | 2 | 1 | 1 | 1 | 0 | 0 |
| oksana-34 J3 | 9 | 9 | 3 | 5 | 6 | 1 | 1 |
| adela-17 J3 | 5 | 2 | 1 | 0 | 1 | 1 | 1 |
| tomas-9 J3 | 15 | 12 | 2 | 4 (8 turns) | 10 | 6 | 5 |
| tomas-9 J4 | 5 | 4 | 1 | 3 | 3 | 0 | 0 |
| jana-29 J3 | 10 | 1 | 0 | 0 | 1 | 1 | 1 |
| **Total** | **64** | **45** | **14** | **20** | **31** | **11** | **10** |

Extra J4 pairs (not in recert-3): adela J4 N1, 1 stop, 0 held, M0; petra J4 N2, 1 stop, 0 held, M0 (derived 1: its L2 "I have a booking number" got raw none and the judge counted no miss); viktor J4 N1, 0 stops, 0 held, M1. All pairs: **16 stops, 20 held fixes, N 49, missed 33 with stops alone, 13 with stops plus held (judge 11)**.

"Missed, stops alone" and "stops + held" are N − stops and N − stops − held, derived here, because the judge's M already counts a recap-shown held fix as coaching (rubric, 6e8900ef). They differ from M only at Tomáš J3 (derived 6, judge 5) and, in the extras, at Petra J4. Where they differ, the judge's figure is labelled "judge".

Held fixes: there were 24 held-eligible turns in the LFL set (martin 3, ondrej 4, oksana 5, tomas J3 8, tomas J4 3, viktor 1). Tomáš's 4 repeats of "Nevím" are listed once (`keepHeld` dedupes the same said/better), so 20 are on the recap.

## Error coverage next to recert-1..3 (missed / learner turns with a clear error)

| Run | Missed | Rate | What counts as coaching |
|---|---|---|---|
| recert-1 | 34 of 57 | 60% | stops (no held fixes existed) |
| recert-2 | 11 of 21 | 52% | stops |
| recert-3 | 28 of 41 | 68% | stops |
| **recert-4 (LFL), stops alone** | **31 of 45** | **69%** | stops only (derived: N − stops) |
| **recert-4 (LFL), stops + held fixes shown on the recap** | **11 of 45** | **24%** (judge's own count: 10 of 45, 22%) | stops + recap-shown held fixes |
| recert-4 (all 12 pairs), stops + held | 13 of 49 | 27% (judge: 11 of 47 over the 11 pairs that ran in recert-4 itself, 23%) | same |

Stops alone did not move (69% against 68%): Option 1 leaves the stop rules alone, so it should not. All the gain comes from held fixes, which cover 20 of the 34 covered turns.

## (c) Did the stop count grow? (Option 1 promises it will not)

| Character | recert-3 stops / learner turns | recert-4 stops / learner turns |
|---|---|---|
| martin-45 | 2 / 7 | 3 / 7 |
| ondrej-16 | 1 / 4 | 3 / 7 |
| petra-38 | 1 / 5 | 0 / 3 |
| viktor-67 | 1 / 5 | 1 / 3 |
| oksana-34 | 3 / 10 | 3 / 9 |
| adela-17 | 1 / 4 | 1 / 5 |
| tomas-9 J3 | 2 / 12 | 2 / 15 |
| tomas-9 J4 | 1 / 3 | 1 / 5 |
| jana-29 | 1 / 4 | 0 / 10 |
| **Total** | **13 / 54 (2.4 per ten)** | **14 / 64 (2.2 per ten)** |

**Stated plainly: the raw stop count is 14 against 13, one higher.** Martin (+1) and Ondřej (+2) have more; Petra and Jana (−1 each) have fewer. The stop density did not rise (2.2 against 2.4 per ten turns, inside the rubric's 1–3). 59772159 does not touch `momentAllowed` (its diff adds `heldTaskFor`, `momentOutcome` and `keepHeld`), and every stop sits on a turn where the gate was open. The +1 follows session length: Ondřej's scene ran 7 turns, not 4, and 3 stops is the gate's own ceiling for 7 turns at B1 (L1, L4, L7). So Option 1 held its promise on density, not as a flat count. The judge did flag Martin's and Ondřej's three stops as heavy ("Ugh, again this fix", two were the same -s slip), which opened a new row (`recert-4/LT-ondrej-16-J3-2`); that complaint predates Option 1 (2026-09-15 findings) and is not caused by it.

## (b) Class of every missed clear error, from `rawMoments`

Definitions (the tutor is now asked for its fix on every as-needed turn, `heldTaskFor`, so a shut gate no longer silences the model):

- **B** = `rawMoments` has no moment for that turn (absent, null or `kind none`): the model returned nothing.
- **D** = the model returned a moment and nothing reached the learner: dropped by `parseMoment`, by `audienceSafe`, or (a third path found here) by `keepHeld`'s dedupe.
- **A** = the gate shut the turn and the model's fix was not held. After 59772159 this cannot happen without the model returning something, so it is **0**; a gate-shut turn with no fix is B (the model was asked and returned none). Gate state is given as a sub-split so the figures can be set against recert-3's "A 21–24".
- **E** (new, outside the metric's turn count) = a second named error on a turn that already carried a stop or a held fix; the tutor returns one fix per turn.

Misses that remain after stops + held fixes (derived 11; the judge's 10 differs only at Tomáš J3):

| # | Pair · turn | Learner line | Class | Gate |
|---|---|---|---|---|
| 1 | jana-29 J3 L1 | "a bit of a deadline **on the picture** I'm finishing" | B | open |
| 2 | petra-38 J3 L1 | "the heating **is not work**" | B | open |
| 3 | petra-38 J3 L2 | "I cannot sleep **because is very cold**… two **blanket**" | B | open |
| 4 | oksana-34 J3 L7 | "I like also to work with people" (the only turn with neither stop nor held fix; the judge's finding instead cites "since three years" and "responsible about" on stopped turns, class E) | B (or E) | open |
| 5 | tomas-9 J3, one turn of L9/L10/L13 (judge counts 5) | e.g. "Dog come", "Dog football" | B | shut (cap reached after L7) |
| 6 | tomas-9 J3, a second turn of L9/L10/L13 (derived only) | | B | shut |
| 7–10 | tomas-9 J3 L11, L12, L14, L15 | "**Nevím**…" | D (dedupe) | shut |
| 11 | adela-17 J3 L2 | "**interested about** technology" (L2 stopped for "used to work") | E | open |

Totals for the 11: **B 6 (5 on the judge's count), D 4, E 1, A 0.** No parse or audience drops were seen: every non-empty `raw` that was not shown was either held or deduped. **Of the 6 B, 4 were on an open gate**, so the model was allowed to stop and returned no moment (Petra's two clear errors, Jana's, Oksana's L7). That is the tutor's own choice, not the gate.

Set against recert-3's gate-shut class (A 21–24): the 20 stops-alone misses that held fixes now rescue are exactly that class; what is left on shut gates is 4 D (dedupe) and 2 B.

## Held fix quality (not the recall measure)

All 20 listed held fixes are real exact excerpts, and judges praised them (Martin, Oksana, Ondřej, Tomáš, Viktor). Two things to weigh: Tomáš's J3 held list is mostly "Nevím" and bare Czech words ("Velký pes", "Mám dog"), which are vocabulary notes more than errors; and his four repeated "Nevím" are listed once, so the recap does not say it happened five times.

## Limiter-cited rows (status after recert-4 and recert-5)

| Row | Status |
|---|---|
| LT-martin-45-J1-1 | not rerun (placement; J1 is outside `--journeys J3,J4`); stays open as recert-3 left it |
| LT-martin-45-J3-1 | **still open** (recurrence 9; every copy stamped "recurs"): "we was" was not taught on either turn, class E (it shares L1 with the "until" stop). Martin's metric is 6 of 6 covered, so the row is now about which error gets the one fix, not a missed turn |
| LT-ondrej-16-J3-2 | **closed on the coverage measure** ("each learner turn with errors got a stop or recap-held fix", 0 of 7 missed; stamped not-seen on four copies). A new open row with the same positional id reports heavy stops; see (c) |
| LT-petra-38-J3-1 (recert-2) and recert-1 LT-petra-38-J3-4 | **still open**: 0 stops, 0 held, 2 of 2 missed, both B on an open gate |
| LT-tomas-9-J3-3 | **still open**, changed shape: the cap no longer silences Czech (4 held fixes shown), but four "Nevím" repeats were deduped (D) and 1–2 turns got no fix |
| LT-tomas-9-J4-3 | the error-coverage version is **closed** (4 of 4 error turns covered: 1 stop, 3 held on the recap; stamped not-seen); an open row with the same positional id (partner turns above A1) is a different finding |
| LT-viktor-67-J3-3 | **not evaluable** in recert-5 (he produced no article slip); 2 of 2 error turns were covered (1 stop, 1 held). Recert-4's own J3 attempt failed at setup |

Regressed: none on error coverage. New open rows of note: Martin/Ondřej stops heavy; Viktor J3 setup failure (malformed topics JSON from the haiku topic call), backlog item 8 of recert-4's SUMMARY.
