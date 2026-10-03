# G-BAL: campaign curve and payout follow-up

Design first, 2026-10-03. **The release is a measured partial correction, not accepted campaign balance.** Late boss dips remain outside the intended band and censored careers remain. Q3 is immutable before evidence. No rival-only physics, altered PR denominator, synthetic victory, deleted censored careers or longer observation limit is used. Owner/device checks remain pending.

## Design and production changes

The owner-approved seized-car, supplied-basic-rig elimination finale in `deathride/campaign/OWNER-CAMPAIGN-CHOICE.md` and Q0 supersedes the older 1.05 lap-race finale proposal. Runtime curve data now explicitly says `supplied-rig`, with a 0.525 reference. The four ordinary boss targets remain 0.89; actual field/player ratios and survivor wins decide the outcome. A reference ratio is not a win probability.

Production preserves the cap of 10, stock chassis, prices, PR weights, abilities, weapons and driving decisions. Act prize scales are 1.6 / 2.2 / 2.2 / 2.4 / 2.6, with nondecreasing prizes, and earned ally cash is 350 / 650 / 1,000 / 1,400 CR. Cars and useful single-part choices retain ownership, unlock, wallet, revision and save rules; their prices remain intentionally unequal. Late field targets stop at 665 rather than implying an unreachable 690-705 can be bought. Marrow retains the 635 ceiling. These edits improve some measured ratios but **reduce completion in the measured cohorts**; the table below is the acceptance result, not a success claim.

Curve validation rejects missing/out-of-order events, invalid values, decreasing division prize scales, an ordinary-lap basis on the elimination finale, and ordinary boss targets moved outside 0.85-0.90. Mutations fire each rule. All four ally cash choices use real promotion/claim transactions and test exact-once transfer, wallet room, stale requests and save/reload.

## Why the larger correction was rejected

`CampaignHeadroomReportKt` exhaustively enumerates legal part combinations, including choices a greedy buyer skips. Under the shipped caps, a developed Flint reaches 627.9888 PR; the strongest Vex-era opponent is Quill at 664.1318, bounding the ratio below by 0.9456 even for an all-maximum field. At Mica, developed Quill is 664.1318 and the strongest opponent is Bulwark at 671.0771, bounding the ratio by 0.9896. Real mixed fields can be weaker. Raising a nominal field target or cash grant cannot exceed this physical envelope. These are legal ceilings, not claims that every career is fully developed.

Eleven ledger-only screens retained severe prize cuts, full promotion-car cash and price-increase alternatives. Those screens reuse Q3 physics and do not constitute fresh acceptance samples. The first fresh economy-only version became the bounded fallback after the larger redesign below was rejected; its historical folder is `final`, and the release recheck uses `release`. They contain the same independent physical observations, not two datasets to pool.

A design addendum before the second physical pass proposed shared Elite 12 / Champion 16 stat caps, for players and rivals equally, with actual TV/phone meters. Vex/Mica field targets became 705/825, funded by fixed 2,000/2,600 grants through the ordinary shop. No stock stat, part, price or PR weight changed. Legal ceilings reached 744.731 / 843.248 PR; measured reference fields reached 712.636 / 815.545. This made the planned dip physically possible but introduced other problems.

The first headroom candidate kept Marrow 635: fresh duel rig wins were 76 / 48 / 37 per 1,024, failing dominance. Twelve paired 384-fight probes retained budget, dispatcher cadence, mine and waiting alternatives. A 610 ceiling from Marrow's first Crown appearance restored viable duel odds; changing only the last row would retain previously bought parts. Lower budgets were not monotonically easier because discrete loadouts differ. No dispatcher, mine or waiting change ships.

The complete 610 headroom candidate produced 1,267/2,000 primary completions and 236/2,000 PR-policy completions, primary boss ratios 0.8550 / 0.8707 / 0.8765 / 0.8497, and duel wins 259 / 179 / 162 per 1,024. The last ratio is still below the declared lower bound; it is not rounded into a pass. Zero sampled Elite wins at Mica initially looked like a progression block, but promotion-tier cars are legal there and the complete careers refute that interpretation. The decisive rejection was the same-seed control below: roughly 20 percentage points of Champion class winner-share movement, plus substantial PR-policy censoring. Matching a PR curve alone does not justify that change. The patch, cap table, experimental tests, actual browser captures and both complete cohorts remain in evidence; none of the higher caps or the 610 ceiling is in production.

The rejected upgraded obstacle sweep still supplies a stress diagnostic: all 36,000 entries finished, zero wrecks/early wrecks/unresolved, maximum obstacle-induced winner-share delta 0.6667 points, and all 6,000 final-runtime hashes reproduced. A recovered 39.93-second progress interval remains a feel concern. It recorded 3,243 solid contacts, 11,802 drag car-ticks and 21,915 avoidance decisions. This is not a production upgrade balance pass. G-OBS's stock paired sweeps remain the release obstacle evidence.

## Sampling, replay and instrument checks

The release library contains 11,520 actual ordinary races: all 34 events, every legal chassis, three useful upgrade bands, three lead decision settings, four seeds per regular cell and twenty per boss cell. The opponent decisions are fixed Club and ordinary lead slot is 0. Fresh physical namespace 91008209 is disjoint from Q3. Both 2,000-ledger policies use the same 70-race censoring cap; first two seeds choose chassis, other regular seeds and eighteen boss seeds supply held-out outcomes. These are outcome-resampled careers, not 4,000 independent full-physics careers. Reward choices, debt, failed milestones and approximation gaps remain visible.

The release duel has 512 fresh seed blocks crossed with three lead decisions and both grid slots: 3,072 fights. Rig wins are 313 / 212 / 241 per 1,024, draws 104 / 111 / 136, and opening losses zero. Q3 wins were 299 / 248 / 222 per 1,024. All-fight share includes draws; resolved share divides by both sides' wins. Rotation-specific 85% dominance and 5% opening-loss diagnostics pass. Nonmonotonic skill results do not establish human difficulty calibration. Q3 dispatcher-off controls are labeled historical, not resampled here.

Nine Python tests share the report's real metric functions and plant dominance at both extremes, an all-draw case, missing/imbalanced rotations, unpaired/duplicate seeds, constant hashes and boundary early losses. Every alarm can fire. The complete cross and minimum 99% distinct-state checks apply per cell. Wilson intervals use individual rotations; pooled paired fights are not treated as independent observations.

Long runs used frozen class/resource directories. After reverting the failed headroom experiment, **every release main-class and resource byte matches the sampled economy runtime**. All 34 ordinary first-event hashes and six duel rows replay exactly. Both 2,000-career files and their entire timelines reproduce byte-for-byte. These rechecks and copied output paths are not new independent samples. The alternative restoration of Q3 prize scales failed exact replay at event 16 and was rejected; its prior outcomes were not relabeled.

The 610 headroom follow-up reused 9,360 proven unchanged prefix outcomes and simulated 2,160 affected Crown races anew. Its guard compares all main class bytes and data, refuses changed earlier curves/active rivals/physics, verifies each cell/seed/PR and replays the first whole row of every retained event. Missing, partial, duplicate and malformed event streams fail tests. An incorrectly named seed property triggered this guard before copying any outcome; the failed header-only run remains archived.

Required `:core:test :link:test :game:test :app:assembleDebug` is green on the release: **150 core / 3 link / 21 renderer tests**. The 152-core-test logs belong to the rejected headroom version. Active obstacle allocation coverage explicitly proves measured drag and perceived avoidance execute; overlapping drag uses the strongest patch. Actual loopback desktop browser checks pass cash/car/part claims, guest restriction, narration, persistence and the restored cap-10 meters. Gallery pages were opened in Chrome. This is not an owner verdict.

## Reproduction

From `deathride`, use a fresh report directory. Physical/duel writers refuse overwrite. Optional `-DcampaignStream=true` permits the boss supplement to consume complete base events; reference garage files must match exactly.

```powershell
.\gradlew.bat :core:reportClasspath
$cp=(Get-Content core/build/report-classpath.txt -Raw).Trim()
$tag='gameplay-gbal-20261003-final'
java -Xmx1g '-DcampaignPhysicalSeedNamespace=91008209' '-Djava.util.concurrent.ForkJoinPool.common.parallelism=3' -cp $cp dev.deathride.core.CampaignReportKt physical 4 $tag
java -Xmx1g '-DcampaignPhysicalSeedNamespace=91008209' '-Djava.util.concurrent.ForkJoinPool.common.parallelism=3' -cp $cp dev.deathride.core.CampaignReportKt boss 16 $tag
java -Xmx1g '-Djava.util.concurrent.ForkJoinPool.common.parallelism=3' -cp $cp dev.deathride.core.CampaignReportKt duel 512 $tag
java -Xmx1g -cp $cp dev.deathride.core.CampaignReportKt verify 1 $tag
java -Xmx1g -cp $cp dev.deathride.core.CampaignReportKt careers 2000 $tag
java -Xmx1g '-DcampaignBuyer=pr' -cp $cp dev.deathride.core.CampaignReportKt careers 2000 $tag
python tools/summarize-campaign.py build/reports/campaign/q3/gameplay-gbal-20261003-final evidence/gameplay/campaign/release
python tools/compare-campaign.py evidence/gameplay/campaign/release
python -m unittest discover -s tools -p 'test_*metrics.py'
.\gradlew.bat :core:test :link:test :game:test :app:assembleDebug
```

Gallery: file:///C:/Users/kazda/kiro/firetv-deathride-gameplay/deathride/evidence/gameplay/campaign/index.html

Remaining work requires a joint late-roster/upgrade design that passes both attainable boss ratios and class winner-share checks, then fresh physical cohorts and human pacing review. The current partial release does not close that target. Owner reward usefulness, driving/story quality, physical-phone comfort and every Stick check remain pending. The reserved Stick was never discovered or accessed. No art generation, registry edits or push.

## Measured final outcome

Each buyer below has 2,000 ledgers. A completion is an actual season victory; arriving at the final event is not counted as winning. The unchanged 70-race limit retains censored runs. Q3 and the final library use disjoint physical seeds, but this before/after changes obstacles and economy together; it does not isolate their individual career effects. The released upgrade caps are unchanged.

| Buyer | Q3 completed | Final completed | Final censored | Q3 boss entry ratios | Final boss entry ratios |
|---|---:|---:|---:|---|---|
| race | 1292 / 2,000 | 1099 / 2,000 | 901 | 0.8551 / 0.8658 / 0.9908 / 1.0162 | 0.8551 / 0.8792 / 0.9385 / 0.9800 |
| pr | 541 / 2,000 | 419 / 2,000 | 1581 | 0.8828 / 0.9095 / 0.9886 / 1.0182 | 0.8828 / 0.9845 / 0.9919 / 1.0182 |

| Buyer | Reward policy | N | Completed Q3 / final | Censored final |
|---|---|---:|---:|---:|
| race | money | 668 | 426 / 364 | 304 |
| race | car | 666 | 432 / 376 | 290 |
| race | part | 666 | 434 / 359 | 307 |
| pr | money | 668 | 185 / 150 | 518 |
| pr | car | 666 | 172 / 129 | 537 |
| pr | part | 666 | 184 / 140 | 526 |

Boss-band misses remain: race event 21 (0.9385), race event 28 (0.9800), pr event 14 (0.9845), pr event 21 (0.9919), pr event 28 (1.0182). Ratios condition on arrivals, whose populations differ after censoring. These results do not establish all-career success or human fairness.

The final physical library has 11,520 ordinary outcomes and 3,072 fresh duels. Ordinary opening losses: 0; unresolved lead samples: 0. Bankruptcy counts remain 0 / 0 for the two buyers. The planted-defect instrument tests, complete paired rotation cross, minimum 99% distinct-state diagnostic and final replay checks pass. Failed gates remain visible: allCareersCompleted, allBossEntryMediansInLegacyBand.

| Buyer | Median reference ratio gap | p95 gap | Maximum gap |
|---|---:|---:|---:|
| race | 0.0135 | 0.0835 | 0.1531 |
| pr | 0.0000 | 0.0667 | 0.1531 |

The fixed reference field and sparse held-out ordinary outcomes limit the career instrument. Finale outcomes also resample the funded diagnostic garage, rather than physically simulating every ledger's actual saved Marrow. This approximation is reported, not removed by generating more ledger seeds.

The **rejected** shared-cap control pairs the experimental runtime with a one-file old-cap override and identical seeds. All 3,600 unchanged lower-tier rows match exactly. Late-tier winner-share changes below are caused by the cap change, not the obstacle toggle. These higher caps are not shipped.

| Barriers | Tier | Class | Old cap wins / 600 | Rejected cap wins / 600 | Change pp |
|---|---:|---|---:|---:|---:|
| False | 3 | Quill | 411 | 342 | -11.50 |
| False | 3 | Vandal | 189 | 258 | +11.50 |
| False | 4 | Bulwark | 237 | 115 | -20.33 |
| False | 4 | Kestrel | 363 | 485 | +20.33 |
| True | 3 | Quill | 413 | 344 | -11.50 |
| True | 3 | Vandal | 187 | 256 | +11.50 |
| True | 4 | Bulwark | 239 | 119 | -20.00 |
| True | 4 | Kestrel | 361 | 481 | +20.00 |

Owner reward usefulness, late-car handling, finale tension, actual-phone comfort and every Stick check remain pending. Existing saves retain owned upgrades; they are not promised the exact new-career boss garage. No push, no device access and no art spend.
