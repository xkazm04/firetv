# Death Ride Phase 2 - G2 integration evidence

2026-10-01. Branch `deathride/integration`; local commits only. Reference device: AFTKM Fire TV Stick, 1920x1080. **G2 remains owner pending.** The atlas world/UI renderer, procedural fallbacks, corrected edge contact and longer career are implemented. Exact car-reference approval, production car states/liveries and the owner's quality/feel decision are still outstanding. No audio was added.

## Claim tiers

The ladder is **exists -> valid -> wired -> behaves -> felt**. A higher tier is limited to the evidence named in its row; no automated result assigns felt.

| Claim | Highest demonstrated tier | Evidence and limit |
|---|---|---|
| Immutable world/UI atlas kit and eleven repeating tiles | behaves | I1 real GL upload/draw, all 25 courses selected on Stick, screenshots; I2 full-game budget run below. Owner style/readability pending. |
| Barriers, props, landmarks, pickups, decals, effects and HUD | behaves | Runtime consumes catalog pivots/timings and content aliases. Effects use a fixed 64-slot visual pool. Procedural combat cues remain. Not every effect frame or prop placement has an owner verdict. |
| Missing/failed asset fallback | behaves | Missing catalog, failed pages, absent car state and budget rejection checked; no-art desktop smoke and 16.85 simulated seconds of combat (63 shots, two wrecks; race not completed). Core simulation does not depend on art availability. |
| Neutral +x car sprites rotated at runtime | wired | P3 measured the strategy on AFTKM; I1 implements pivot/body-bounds rotation. Current ten car references are unapproved, so the production path uses procedural cars. Future car assets are not full-game measured. |
| Damage-state lookup and optional livery panel masks | wired | Approved-entry/state lookup and tint consumer exist. No 40 state or 30 livery jobs were generated; no claim they behave or look consistent in this build. |
| Complete 47-case track-edge/barrier autotile families | valid | Art bundle validates all cases/256-mask mapping. Spline track renderer does not load the two grid-atlas pages. |
| Twenty-five circuits, ten cars and five tiers | behaves | Core content/replay tests and all-class/all-course Stick selection. Production car artwork and human handling comparison remain pending. |
| Track-edge slowdown is reachable | behaves | V1 first reproduced failure for all ten cars on both sides, then tested outer collision-radius surface contact and real drag. Interior material queries retain the centre rule. |
| Track linter rejects its ten base defects | behaves | Six new mutants complete ten explicit base-rule tests; nine additional feature/content mutants. Mutation coverage does not prove all geometric defects are impossible. |
| Longer career and promotion-boss purchases | behaves, simulation limited | Authored 18/21/24 laps, shared finish/timeout rules, legal next-tier NPC purchases one event early, replay tests and measured outcomes below. Human endurance comfort and tension remain pending. |
| Fixed rules across Rookie/Club/Pro | behaves | Settings change AI decisions; tested common cars, HP, damage, lap target and rewards. No player-power rubber band. Perceived fairness remains pending. |
| Saves, receipts, guest/finale rules | behaves, scope limited | Current core tests, opening Stick recovery and the funded 24-lap finale/P2 spectator check. Ordinary guest and migration device checks remain historical C4 evidence. No earned full-career device playthrough. |
| Sustained memory and frame budget | behaves, device limited | One preheated AFTKM, two scripted LAN controllers. PSS is system-side `--local`; frame intervals are not optical latency. Numeric targets and misses are below. |
| Finished-game quality, fair challenge, readable art, worthwhile progression | owner pending | No felt claim. Use the checklist below. |

## Build and art provenance

Final build and source hashes, checks and device artifacts are bound in the [I3 manifest](../../../deathride/evidence/phase2/i3/manifest.json). The full build is green: **89 core / 3 link / 3 renderer tests**, plus **30 art-tool tests**. Real-GL failure injection and the device checks below are separate evidence. I1/V1/IP/I2 each have a design note and retained evidence; old G1/C4 outputs were not overwritten. Current physical evidence supersedes old outcome hashes after the verge/format change.

Accepted bundle: [art delivery](../../../deathride/art/DELIVERY.md), [style](../../../deathride/art/STYLE.md), [review/contact sheets](../../../deathride/art/review.html). I1 loads world/UI (78 regions), eleven repeat tiles and at most one backdrop. Road texture quads remain live at close range; the 2048-square baked scenery target uses 16 MiB rather than the old 36 MiB. Background detail is correspondingly coarser; this is visible and awaits owner review.

All ten exact car approvals remain false in this build's `art/reference-approvals.json`. The existing guarded Grok driver was not invoked: **0 new images, 0 videos; integration used none of its initial 50-image allocation**. Its merged ledger remains 130/180. A read-only [closing ledger snapshot](../../../deathride/evidence/phase2/i3-art-budget-snapshot.json) records the concurrent art worktree separately at 198/350 under its changed cap; the integration ledger is not a live account balance. No renderer gap required new generation. File existence was not treated as approval. The immutable bundle was not edited. Local model grading remains diagnostic; its human-labelled calibration is still pending.

## Verge and linter correction

The forge concern was correct. The old centre-only test could not reach a 1.5 m verge when the wall kept centres at least 1.5-2.325 m inside the edge. V1 regression evidence covers all 20 roster/side cases before and after the change. Kerb/verge detection now uses the outer lateral collision radius; the wall, road width and car geometry are unchanged. AI look-ahead uses the same edge footprint. At 20 m/s, one 1/60-second coasting step measured **19.71209 m/s on verge versus 19.92680 m/s on asphalt**. This is a circular contact-footprint approximation, not fractional tyre contact. See [V1 design/evidence](V1-verge-and-lint.md).

## Career pacing

The old C4 report measured roughly 49-53 active minutes in a three-lap career. Increasing reward coefficients alone could not produce five hours of driving. The revised format keeps 35 events: **18 laps in Scrap, 21 in Foundry, 24 thereafter**, while practice stays three laps. TV and phone show the actual target, and the timeout scales with it. No menu waits, hypothetical retries, HP boosts or damage changes are counted as time.

The funded pilot used 240 actual races, with a replay for the first seed in each cell. Mean seconds at 3/12/18/24 laps were **82.12 / 318.10 / 473.50 / 625.91**; finishes **60/60 / 60/60 / 58/60 / 58/60**; no lap-one wrecks. The two long-format wrecks were Pro-field Comets at laps 16 and 14. These were legally purchased but explicitly funded garages, not earned careers.

The full current report contains **15,120 actual fixed-step races**, **3,780 first-seed replays** and **6,000 sampled earned careers**. The independent ledger audit recomputed **215,895 settlements**. All 6,000 careers completed, with zero sampled bankruptcy and zero lap-one player wrecks.

| Rival skill | Mean active hours | Median | 5th-95th percentile | Above 8 hours |
|---|---:|---:|---:|---:|
| Rookie | 5.850 | 5.869 | 5.657-5.985 | 0 / 2,000 |
| Club | 6.102 | 6.049 | 5.763-6.633 | 2 / 2,000 |
| Pro | 6.535 | 6.325 | 5.974-7.846 | 83 / 2,000 |

The **mean** five-to-eight-hour target is now met. No sample fell below five hours, but the longest Pro sample reached **11.697 hours** through actual retries. Mean races were 35.000 / 35.706 / 37.242. First Club purchases averaged 7.000 / 7.013 / 7.094 races, and following-tier intervals now meet seven-to-nine races in each setting. First upgrades averaged **1.250 / 1.503 / 2.000 races**: Rookie and Club still buy sooner than the proposed two-to-three-race target. Longer races collect more real pickups; prices, prizes and repairs were not silently retuned.

Club promotion-boss ratios are **0.9279 / 0.9428 / 0.9311 / 0.9625**; all miss 0.85-0.90. Historical values were 0.9245 / 0.9930 / 0.9984 / 0.9996, so the last three dips improved and the first slightly worsened. The opening is 0.8966 and finale 1.0461. Field changes across tier joins are **+0.004% / +2.024% / +0.605% / -0.413%**, replacing historical drops of 2.98-9.22%. Player PR still falls 4.93% at the Pro join, and the upper field plateaus. This does not certify smooth progression or tension.

The library uses **four independent physical seeds per cell**, six upgrade bands, all eligible player classes, 35 events and three rival skill settings. Resampling does not create additional independent physical seeds. One evolving reference NPC economy supplies the physical fields; sampled career fields can differ and nearest PR-ratio bands approximate them. Band mismatch is **0.05110 p95 / 0.05838 maximum**; 6,432 sampled outcomes lie outside the wider 0.80-1.15 ratio envelope. Seven legal spending caps were compared, with cap six selected; no globally optimal spending or human win-rate claim is made.

Review the [four pacing curves](../../../deathride/evidence/phase2/ip-measured/pacing.png), [independent audit](../../../deathride/evidence/phase2/ip-measured/audit.json), [duration distribution](../../../deathride/evidence/phase2/ip-measured/duration-distribution.json) and [source/evidence manifest](../../../deathride/evidence/phase2/ip-measured/manifest.json).

Promotion bosses receive the next licence one event before the player, pay the ordinary market prices, and keep their purchases across the next division. Fixed field targets rise across joins. This does not manufacture unreachable PR: shared chassis/part ceilings and the Champion cast can still miss proposed boss dips. The final Marrow duel retains its intended lower ceiling and requires a win. An exhaustive legal-part graph (unlimited funds, ignoring NPC target limits) gives boss-field hard ceilings of **545.64 / 635.10 / 649.17 / 659.11 PR** at events 7/14/21/28. Fully upgraded eligible player maxima divided by those fields are **0.905 / 0.958 / 0.995 / 0.988**. These are purchase bounds, not earned curves or simulated win rates: late 0.85-0.90 dips cannot be guaranteed by money alone under the current stat clamps. A wider upper-tier ladder needs a new roster/handling balance matrix. Qualified wrecks still advance ordinary events; their real shortened time counts.

The Stick opening check uses ordinary browser inputs with a nominal 30 Hz send interval and public pose telemetry. Foundry finished all 18 laps in **466.92 s** and Slagway in **587.87 s**, neither as a wreck. Credits reached 176 then 352; the career advanced to round three. Player and nested rival garages matched after process restart. It verifies endurance beyond lap three, payouts and restart recovery. See [opening results](../../../deathride/evidence/phase2/ip-opening-device.json) and [IP design](IP-career-pacing.md).

The exact IP release APK also ran an isolated, explicitly funded **24-lap Crown duel in 873.38 s**. The scripted driver finished **second** and remained at round 35/season one. Marrow stayed AI, there were exactly two physical entrants, and connected Player 2 kept cash, debt, packed turbo and race count. See [duel results](../../../deathride/evidence/phase2/ip-duel-device.json) and [fixture/APK provenance](../../../deathride/evidence/phase2/ip-calibration/duel-fixture.json). This is not human driving or an earned full campaign. The inactive-slot HUD overlap visible in the IP screenshot is addressed in I2 below.

## Stick texture, frame and memory budget

The [I2 design](I2-stick-budget.md) declares limits before measurement: **32 MiB resident art, 4 MiB per art page, 16 MiB scenery, 11 MiB fonts, 0.22 MiB QR, 52 MiB total owned textures, 192 MiB PSS**. The 8 MiB large-font page is an explicit non-art exception. Allocation rejects assets that exceed either the art limit or remaining total texture allowance. One backdrop replaces the previous one. Telemetry counts actual font texture dimensions once each.

PNG signature/dimensions and remaining residency are checked before decoding. Empty/overflowing animation entries and invalid HUD/body rectangles fall back per entry. Unit and real-GL mutations pass. Redundant scenery grain/road passes and duplicate smoke/muzzle/explosion/skid decoration were cut; the atlas visual pool is 64 slots. Combat cues and missing-asset procedural drawing remain. The inactive-slot footer overlap is corrected and the [final two-car HUD](../../../deathride/evidence/phase2/i2-duel-hud-tv.png) was visually inspected; that short preview is not another completed career race.

The final APK ran **900.024 seconds**, completing **11 races across five themes**. Both controllers delivered **30.0003 Hz / 27,001 accepted inputs**, with zero rejected packets and zero host pump stalls. All 78 regions remained loaded with zero failures and **1,040,463 atlas draws**. Sustained-load assertions passed; this does not mark the separate tail targets passed.

| Final Stick observation | Measured result | Declared target / outcome |
|---|---:|---|
| Owned textures / resident art | 37.970 / 10.750 MiB | 52 / 32 MiB: within budget |
| PSS range | 107.018-115.502 MiB | Below 192 MiB |
| First/last three warm PSS medians | 114.035 / 113.880 MiB | -0.155 MiB; within 8 MiB growth limit |
| Active-window p50 range (73 windows) | 16.574-16.812 ms | Near 16.7 ms: met |
| Worst active-window p95 | 21.644 ms | Misses original 16.7 and G1 21.60 ms |
| Active maximum | 34.920 ms | Misses 33 ms |
| All-window maximum | 241.275 ms | Initial/preparation stall retained |

The warm PSS linear trend is **+0.04993 MiB/min** despite the lower endpoint medians; neither monotonic decline nor a longer-term leak-free claim is justified. Thermal status remained zero; sampled CPU/GPU/skin maxima were **60.196 / 42.652 / 42.300 C**. There were **741 ms of discarded simulation time**, all in windows containing transitions, and three stale consume samples per seat in the initial window. Accepted packets and timely simulation consumption are separate measures. A since-start histogram is not an average of rolling percentiles.

Earlier complete runs retain a baseline rejection failure, a host-throughput failure, and a full-rate effects-cut run with seven rejected inputs and a 41.979 ms active maximum. The final run also differs in host load and loader guards, so timing differences do not identify one cause. Preparation/effect work was cut without changing physics or loosening gates. Final selection-to-ready median across 25 courses is **1180.55 ms**, versus **3188.60 ms** before preparation cuts (includes polling overhead). The [installed APK record](../../../deathride/evidence/phase2/i2-installed-apk.json) matches the measured artifact.

The [soak summary](../../../deathride/evidence/phase2/i2-soak-summary.json), [losslessly compressed raw samples](../../../deathride/evidence/phase2/i2-soak.json.gz) and [I2 manifest](../../../deathride/evidence/phase2/i2/manifest.json) retain the actual load, APK and limits. Earlier failed runs remain in their named evidence directories; the [I2 design and findings](I2-stick-budget.md) explains each one.

Limits: preheated single Stick and ordinary LAN, no forced maximum-pool effects or six immortal cars. Browser/Node inputs are not physical-phone touch comfort. Input age and RTT are not input-to-photon latency. Ambient conditions, cold start, congested Wi-Fi and other devices are unqualified. Future car pages are reserved but not loaded or measured.

## Owner checklist and remaining work

- [ ] Review the exact ten reference contact sheets and record approval by hash before derived state/livery generation. Judge silhouettes at gameplay scale and all headings. There are no production car-state/livery visuals to approve in this APK.
- [ ] Drive all five themes from the sofa. Judge road/verge distinction, shortcut warnings, barrier/prop scale, texture repetition and coarse scenery against live road detail. Check the outside contact slowdown without feeling trapped by the wall.
- [ ] Compare damage flashes, muzzle direction, mines, repair/ammo pickups, HP and weapon icons during actual combat. Decide whether danger and impacts read without sound; audio remains absent.
- [ ] Use two actual phones in Classic/Cruise/Split and mirror. Check thumb reach, independent release, camera following the survivor, Home/resume and reconnect. Run the 30-tap optical recipe in [OWNER-CHECKS](../../../deathride/OWNER-CHECKS.md); network timings are not that result.
- [ ] Play an 18-lap opening event and a later 24-lap event. Decide whether the added driving is engaging or repetitive, whether an interruption needs mid-event saving, and whether the result payout makes the time worthwhile. Mid-event progress still restarts after process death.
- [ ] Buy an earned part and the next-tier car, compare each promotion boss and the following opening, then judge Marrow's duel. Use the measured ratio/money misses as prompts, not as a fairness verdict. Confirm the optional loan feels optional.
- [ ] Read story cards and recognize rivals on TV. Judge text comfort, identity, the missing-sibling arc and whether the climb invites another race.
- [ ] Record G2's quality/feel verdict with concrete defects. No agent or automated check has marked it passed.

The remaining production work is exact car approval and guarded derivation, owner art/handling/career review, local-grader calibration, audio, optical/physical-phone and network qualification, plus the specific pacing/frame misses reported above. Historical G1 issues are not silently treated as solved by new art. Nothing was pushed.
