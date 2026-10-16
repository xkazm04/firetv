# UAT note — 2026-10-16-lt-placement-oos

Out-of-sample live check of Linga placement (journey J1) on placement full r2 (`desk/src/lib/english/placement.ts`, b4c67801 and c7a99b7e; measured at 8576ee7f). Run folder `uat/runs/2026-10-16-lt-placement-oos/` (claude CLI only: tutor haiku, Character and judge sonnet). A measurement run: no product code changed, and the placement.ts thresholds were not touched.

The r2 thresholds were fitted to 17 stored J1 marks (`recert-1/2/3` of `2026-10-14-lt`, all ten Characters). Six Characters ran J1 live: klara-13, petra-38, oksana-34 (fitted; r2 still places them one band high) and three new ones written before the run and not changed after it (`sofie-11` A2 child, `dominik-17` B2 teen, `hana-41` B1 adult).

| Character | Set | True | Live | Confidence | Distance |
|---|---|---|---|---|---|
| klara-13 | fitted | A2 | B1 | medium | +1 |
| petra-38 | fitted | A2 | B1 | low | +1 |
| oksana-34 | fitted | B1 | B2 | low | +1 |
| sofie-11 | new | A2 | B1 | low | +1 |
| dominik-17 | new | B2 | B2 | low | 0 |
| hana-41 | new | B1 | B1 | medium | 0 |

**Result.** Unseen: 2 of 3 exact, 1 one band high, 0 low. Nothing two bands off. No high-confidence read at all, so none high-confidence and wrong. Fitted: the live band equals the r2 replay band for all three (still one high each).

**What it says.**
- The no-false-high property held out of sample: the six reads carry confidence low or medium, and every miss is one band high.
- The unseen A2 child fails the same way the three fitted A2/B1 learners do. The three A2 learners (klara, petra, sofie) are placed B1 on a B1 listen pass, with the B1 say task partial or passed and the B2 say task failed. One A2 sample is not a trend; it does say the rule that lifts A2 learners to B1 was not removed by the fit.
- dominik-17 (B2) and oksana-34 both came with a summary line "Linga placed you one level lower than your answers alone, to be safe" next to a band that the judge read as unexplained or generous: for dominik the C1 tasks were "nearly there" and it reads as an undersell, for oksana B2 is still above her true B1. The line states a rule, not a reason (judge findings LT-dominik-17-J1-4, LT-oksana-34-J1-2).
- Judge side: dominik-17 and oksana-34 fail their journey in code on D5 (the summary is generic or partly specific); the placement gate passes for all six.

**LG-49.** The J1 verdict screen shows the same band, with the same words, on the TV and the phone for all six. The label "Your level" and the TV's "Talking today at" line are not on a J1 screen, so this run neither confirms nor contradicts the label fix; the TV home hero is still not seen.

**Limits.** n = 6, one run each, a model-played Character, LT only (no L2). A single run per Character cannot separate the Characters' own luck from the ladder. A second run of the three new ones would give a spread.

Drained to `docs/BACKLOG.md`: a `recert 2026-10-16-lt-placement-oos` line under LG-48 and under LG-49. No new LG row: nobody landed two bands off or high-confidence wrong. sofie-11's +1 on low confidence is the same kind as the fitted misses and is listed on the LG-48 line.
