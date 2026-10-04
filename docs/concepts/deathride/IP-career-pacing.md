# IP Integration career pacing — design first, 2026-10-01

The C4 baseline is 35 events and about 50 active minutes. Five hours requires roughly nine active minutes per event; no economy coefficient can create that time inside the current three-lap/180-second format. Test a data-driven endurance format for career events while keeping three-lap practice. Extend the race lap target, time boundary, TV/phone telemetry and qualification consistently; do not add menu waits or count projected time as measured. Saves retain event progress and garages; an interrupted event still restarts as before.

Measure longer races with real fixed steps before selecting laps. Combat damage and pickups remain shared rules for all entrants; any encounter change is explicit content data, not a difficulty or player-specific modifier. Retain early-wreck, completion and actual active-duration distributions. If endurance races mostly end in wrecks, report that structural limit instead of multiplying three-lap times and declaring success. First compare small deterministic physical pilots; rebuild the physical outcome library after the verge correction and final format. Use 2,000 seeded careers per skill setting, stating that they resample a physical library and how many independent seeds that library contains.

Test legal promotion fields at act bosses: rivals may buy next-division chassis before the player unlocks that division, using the same prices and parts. Keep those purchases across the join, and use a fixed monotonic field target schedule. Never manufacture ratings above actual chassis/part caps or read player performance. Retain any boss P/F misses that the stock shared roster cannot achieve, plus policy/band approximation errors and money/affordability curves. A longer career and monotonic target table alone do not establish smooth measured joins.

Required closure: matching core/game/controller behavior, replay/zero-allocation tests, physical pilots and final raw pacing sample with an independent ledger audit and plots. Historical C4 evidence stays intact in its own directory. Full core/link/game/APK build, one status row and session entry, one local commit. Owner endurance comfort, story/tension and whether this climb is worth playing remain not measured. No art spend.

## Format pilot and selected experiment

A 240-race fixed-step pilot compared 3/12/18/24 laps at ten opening/boss events, three opponent skills and two independent seeds per cell, replaying the first seed. Garages were explicitly funded and legally upgraded; this is not an earned-career sample. Mean active durations were 82.12 / 318.10 / 473.50 / 625.91 seconds; finishes 60/60, 60/60, 58/60, 58/60. The two long-format wrecks were Pro-field Comets at laps 16 and 14. No lap-one wrecks, no unresolved leads. Raw rows: `ip-calibration/funded-formats.csv`.

Selected for the full earned-career experiment: 18 laps in Scrap, 21 in Foundry, 24 in later acts. This retains 35 events and makes the longer format visible on both TV and phone. The 21-lap interpolation is a design choice to validate, not a pilot measurement. No damage, HP, ammo, rewards or repair coefficients were changed to manufacture duration. Qualified wrecks retain their existing advancement rule; their actual shorter time counts in the report.

Promotion opponents receive the next licence one event before the player, buy the next chassis through the real market, and retain it into the next act. Their licence lead is fixed schedule data (`fieldTier`), not inferred from player money/skill. Sponsor grants remain once per event; re-preparing an old save can reconcile a changed purchase plan without paying a second grant. Only Frostline's competitive maximum expands to admit the Champion promotion field. All measured numbers from the old curve are removed while this new physical library is rebuilt; new evidence will state its actual seed count and approximation limits.

## Legal PR bound audit

An independent exhaustive graph enumerates useful legal part purchases for each boss-era chassis, with unlimited replenished funds and the actual unlock/stat caps. Its PR formula is cross-checked against physical stock rows. Even after ignoring NPC target limits, the next-tier roster's mean hard ceilings at bosses 7/14/21/28 are **545.64 / 635.10 / 649.17 / 659.11 PR**. The strongest fully upgraded eligible player reaches **493.61 / 608.22 / 645.77 / 651.27 PR**: ratios **0.905 / 0.958 / 0.995 / 0.988** against those maximal fields. These are legal purchase bounds, not earned player curves or race outcomes.

Later proposed 0.85-0.90 boss dips cannot be guaranteed against rich legal players merely by adding NPC money or raising the target column. Global stat clamps flatten the upper ladder. Keep the actual promotion purchase improvement and report measured first-visit curves; do not fake PR weights, buff hidden stats, or shift every late opponent two divisions early to manufacture the desired ratio. A larger upper-tier performance spread would be a new roster/handling balance pass, with its own full class/course matrix and owner review. Tool and raw bounds: `tools/audit-boss-ceilings.py`, `evidence/phase2/ip-calibration/boss-hard-ceilings.json`.

## Measured earned-career result

The final library contains **15,120 actual fixed-step races**, four independent seeds per cell and **3,780 first-seed replays**, across all eligible player classes, six upgrade bands, 35 events and three rival skills. The seven declared spending caps were compared on separate pilot seeds; cap six was selected by completion then purchased PR. **6,000 sampled earned careers** (2,000 per setting) all completed. The independent Python audit recomputed all **215,895 monetary settlements**. No sampled bankruptcy or lap-one player wreck occurred. These careers resample the physical library; they are not 6,000 independent physical playthroughs or human play.

| Rival skill | Mean active hours | Median hours | 5th-95th percentile hours | Samples above 8 h | First part after races | First Club car after races |
|---|---:|---:|---:|---:|---:|---:|
| Rookie | 5.850 | 5.869 | 5.657-5.985 | 0 / 2,000 | 1.250 | 7.000 |
| Club | 6.102 | 6.049 | 5.763-6.633 | 2 / 2,000 | 1.503 | 7.013 |
| Pro | 6.535 | 6.325 | 5.974-7.846 | 83 / 2,000 | 2.000 | 7.094 |

All samples exceeded five hours, but the longest Pro career reached **11.697 hours** through actual retries; the five-to-eight-hour mean target is not a bound on every player. Mean races were 35.000 / 35.706 / 37.242. Following-tier purchase intervals now meet the proposed seven-to-nine-race band in every setting (Club: 7.417 / 8.101 / 8.544). First purchases arrive sooner than the proposed two-to-three-race target for Rookie and Club. Longer races also earn more actual pickups; no reward/repair coefficient was adjusted to conceal that effect.

| Club first-visit ratio | Historical C4 | IP |
|---|---:|---:|
| Boss 7 | 0.9245 | 0.9279 |
| Boss 14 | 0.9930 | 0.9428 |
| Boss 21 | 0.9984 | 0.9311 |
| Boss 28 | 0.9996 | 0.9625 |
| Finale 35 | see historical curves | 1.0461 |

Bosses 14/21/28 now produce stronger PR dips; boss 7 is slightly farther from the proposed band. **All four promotion bosses still miss 0.85-0.90.** Field changes across joins 8/15/22/29 are **+0.004% / +2.024% / +0.605% / -0.413%**, versus historical C4 drops of 2.98-9.22%. Player PR still falls **4.93%** at the Pro join as purchased chassis/parts change; the last field still dips slightly and the Champion field plateaus. This is improved continuity, not a claim of a smooth or exciting ladder. The opening ratio is 0.8966 and the finale 1.0461, within their proposed bands. There are 6,432 sampled outcomes outside the wider 0.80-1.15 ratio envelope.

The nearest-band mismatch is **0.05110 at p95, 0.05838 maximum**, in ratio units. One evolving reference NPC economy supplies physical fields; actual sampled rival purchases can differ. These approximation errors limit fine balance claims. No globally optimal spending or human win-rate claim is made. Owner endurance comfort, richer upper-tier stat separation, late boss dips, first-purchase timing and retry tails remain work.

Evidence: [audit](../../../deathride/evidence/phase2/ip-measured/audit.json), [four curves](../../../deathride/evidence/phase2/ip-measured/pacing.png), [duration distribution](../../../deathride/evidence/phase2/ip-measured/duration-distribution.json), [source and build manifest](../../../deathride/evidence/phase2/ip-measured/manifest.json). Compressed raw rows and failed/successful logs are retained beside them. The legal ceiling formula was cross-checked against all 2,520 physical stock rows.

## Device and build closure

Two ordinary scripted-browser opening races completed all 18 laps on the Stick: Foundry **466.92 s**, Slagway **587.87 s**, neither as a wreck. Credits reached 176 then 352 and progress reached round three; player and nested rival garages survived process restart. Inputs used a nominal 30 Hz browser interval and public pose telemetry, not human driving. The opening APK hash is in `ip-calibration/device-apk.json`.

On the exact green IP release APK, an isolated explicitly funded Crown fixture completed **24 laps in 873.38 s**, finishing **second** to Marrow. It remained at round 35/season one. There were exactly two physical entrants; connected Player 2 spectated and retained cash, debt, packed turbo and race count. The fixture's historical source, renamed profile/checksum and APK hashes are in `ip-calibration/duel-fixture.json`; this is not an earned device campaign. An earlier attempt lost foreground to the separate drift lab and is retained as interrupted, with no completed-race claim. The live screenshot exposed a pre-existing inactive-slot HUD/footer overlap, queued for the final I2 renderer correction.

`:core:test :link:test :game:test :app:assembleDebug` is green: **89 core / 3 link / 2 renderer tests**. Practice remains three laps; current physical/report evidence supersedes old outcome hashes after V1/IP. No art generation or push. Exact car approval, owner endurance/tension judgement, stronger late boss dips and the reported purchase/transition/tail misses remain outstanding.
