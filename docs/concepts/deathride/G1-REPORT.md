# Death Ride Phase 1 — G1 evidence

2026-09-30. Reference application: `dev.deathride.tv` / **Death Ride**, AFTKM Fire TV Stick, 1920×1080. W6 → W4 → W5 → W7 → W8 were executed in the owner's revised order. No art or audio assets were added, and the five approved steering presets were not recalibrated.

## Recommendation and truth level

**The complete game loop is ready for an owner session. G1 is not passed. Do not approve an art production investment from these automated results.** The larger silhouettes, authored roads, procedural surface detail, motion marks, combat cues, readable menus and persistent career are a substantial step beyond the original tiny rectangles. The result is still far below a finished commercial game: repetitive procedural scenery, simple damage animation, no sound, limited rival expression, and unresolved balance/comfort questions.

The short early wrecks in the device session and Bastion's weak wins away from the combat arena deserve particular attention. Numerical correctness is not evidence that those encounters are fair or enjoyable. Physical-phone reach, sofa readability, optical latency, perceived impact and desire for another race remain **not measured**. Only the owner can decide “is this worth putting art into.”

| Claim | Highest demonstrated tier | Evidence and limit |
|---|---|---|
| Larger, distinct car bodies and five authored tracks | behaves | Physical geometry, lint, collision/AI tests and actual Stick screenshots. Sofa readability is not felt. |
| Handling, surfaces, mass, drift and fixed simulation | behaves | Shared core tests, seeded replay, strict live-step allocation gates and device driving. Approved presets retained. |
| Guns, mines, armor, repairs, wreck obstacles and elimination | behaves | Actual core races and ordinary LAN weapon inputs on Stick. Human fairness is not felt. |
| Parts change the car; purchases and payouts persist once | behaves | Offer/stat consumers, idempotent receipts, corruption recovery, touch/remote purchases and process restart. Value is not felt. |
| Twelve rounds, four personal-score cups, named rivals and tier unlocks | behaves | Content/pacing tests and three-event device session; guest profile remains separate. Rival identity and progression appeal are not felt. |
| Tier difficulty changes decisions without hidden power | valid / wired / behaves | Reaction, mine and repair decisions tested; stock physics/damage equality checked. The modeled win-rate ordering does not establish human fairness. |
| Sustained Stick performance with the whole game active | measured below | Real 900-second combat/course cycle, two LAN inputs, thermal/PSS samples. Not a cold-device or contended-network qualification. |
| “Worth putting art into” | owner pending | No agent or test can assign the felt tier. |

## Reproducible build and complete device session

`./gradlew :core:test :link:test :app:assembleDebug`: **green, 52 core + 3 link tests**, including deterministic replay and zero-allocation live simulation. Final APK SHA-256: `EE42CFDB0A89E551899383AC76B6A37016E6CD57E3A66E027F793F6D265DE573`. Installed and exercised on the Stick; build log is `w8-build.txt`.

`tools/session-check.mjs` ran two isolated Chrome touch browser profiles at 896×414. Menus use real touch actions; driving is a diagnostic pursuit controller sending ordinary 30 Hz absolute inputs over LAN. It reads public route/pose telemetry, avoids deliberately shooting the other human, and seeks repairs. It cannot change world state or transfer a human seat to host AI. It is not human play.

The host chose Line/Rookie and installed brakes for 120 CR from the 160 CR starter grant. The final installed build, including sliced scenery preparation, produced:

| Event | Real device race time | Weapon shots | Host / guest outcome |
|---|---:|---:|---|
| Foundry opening | 27.48 s | 220 | Both wrecked; host had completed one lap; both paid |
| Switchback | 15.78 s | 167 | Both wrecked during lap one; both paid |
| Foundry cup final | 26.87 s | 265 | Both wrecked; guest had completed one lap; host advanced to round four |

Host balance ended at **240 CR**, guest at **286 CR**. These final career races exercise qualified-wreck advancement, not three-lap finishes. An earlier camera-corrected run completed both human cars over three laps in its 77.45 s cup final (`w8-session-before-scenery.json`); the core physics/combat were unchanged by the rendering fix. The different ordinary-input runs are sensitive to network timing and contact cascades, and are not deterministic human-skill measurements. Guest career stayed at round one. Home closed the listener; resume preserved the career screen, neutral controls and both returning seats. Before/after Home screenshots were identical. A full process restart followed by new seat tokens restored independent browser profiles, balances, installed parts and host progress. No browser script exceptions. Full snapshots are in [`w8-session.json`](../../../deathride/evidence/phase1/w8-session.json).

Integration fixes: static menus now show car/credits instead of damaged lobby-demo HP; the race camera and main HUD follow remaining active human drivers instead of centering a distant wreck; the selected HUD driver is named. Logcat emits a compact metrics record below Android's line limit; `/stats` retains full profile/pose state. Public diagnostic telemetry includes traffic, pickups and grid lanes. No gameplay power was added to the probes. The final renderer also reuses one framebuffer and one baking renderer, spreads identical geometry across a 3 ms submission budget, holds simulation/countdown until ready, and rebuilds scenery on resume. Actual slices include submission overhead and are measured rather than assumed to meet 3 ms exactly.

## Physical balance: actual simulation

The versioned `balance-scenarios.csv` declares five stock Pro scenarios, one per course, plus a mixed-course fully upgraded lead against stock Pro rivals. Each has **2,000 seeded races**, six AI cars, the actual fixed-step movement/contact/combat rules, and all available pickups. Class/style pairs rotate across grid positions, with equal class entries. Each named rival's style remains attached to its class: this is a roster balance test, not an isolated causal estimate of chassis power. Lead position also has a grid advantage.

The mixed scenario crosses all five lead classes with all five courses (80 seeds per pair). Review caught an initial use of the same modulo rotation for both, which tied each class to one course. That mixed result was discarded and the corrected 2,000-race preset rerun. A test now checks all 25 combinations. A second review replaced forced maximum tiers with actual legal shop purchases: otherwise capped Bastion armor imposed a handling penalty a player cannot buy. The final rerun uses legal parts; both discarded summaries are retained. Seed replay and distinct final physical hashes guard against counting repeated deterministic outcomes as independent races.

| Scenario | Race seconds p50 / p95 / max | Mean wrecks / 6 | Damage-to-wreck p50 / p95 | Under 5 s / all wrecks |
|---|---:|---:|---:|---:|
| foundry-stock | 73.47 / 77.82 / 86.35 | 2.941 | 17.43 / 47.25 s | 3.64% |
| switchback-stock | 110.02 / 116.85 / 123.82 | 3.178 | 15.50 / 61.48 s | 0.91% |
| redline-stock | 107.52 / 111.52 / 116.55 | 2.784 | 16.22 / 59.30 s | 0.72% |
| runoff-stock | 96.15 / 101.28 / 105.98 | 3.126 | 16.32 / 57.60 s | 2.22% |
| crucible-stock | 66.25 / 72.83 / 80.72 | 3.874 | 17.05 / 39.80 s | 2.85% |
| mixed-upgraded | 95.27 / 111.98 / 115.65 | 2.302 | 14.95 / 47.67 s | 4.08% |

All **12,000 races resolved**, with **2,000 distinct hashes in each preset**, zero one-shot kills and no declared numeric alarms. Raw outcomes: [`w8-races.csv`](../../../deathride/evidence/phase1/w8-races.csv); summaries/classes/causes are alongside it. Reproduce all with `:core:balanceReport`; `-PbalanceScenario=mixed-upgraded` reruns that preset alone. The recorded first full run plus corrected mixed rerun produced the final combined evidence. The discarded confounded mixed summary is retained separately for audit.

**Roster win rate per entry** (equal entries per class, class/style paired; not share of race winners):

| Course | Needle | Line | Bastion | Comet | Trail |
|---|---:|---:|---:|---:|---:|
| foundry | 28.88% | 25.83% | 1.17% | 1.50% | 25.96% |
| switchback | 27.50% | 24.50% | 0.75% | 6.62% | 23.96% |
| redline | 22.62% | 10.29% | 0.08% | 44.71% | 5.62% |
| runoff | 26.04% | 17.92% | 0.46% | 7.04% | 31.87% |
| crucible | 23.71% | 22.58% | 9.92% | 12.04% | 15.08% |

**Kill share by damage cause** (fraction of wrecks, including uncredited wall/self deaths):

| Course | Rivet | Hammer | Mine | Ram | Wall |
|---|---:|---:|---:|---:|---:|
| foundry-stock | 63.29% | 14.56% | 12.11% | 9.93% | 0.12% |
| switchback-stock | 65.41% | 12.31% | 13.69% | 8.45% | 0.14% |
| redline-stock | 74.72% | 10.11% | 8.24% | 6.88% | 0.05% |
| runoff-stock | 65.37% | 14.70% | 11.93% | 7.95% | 0.05% |
| crucible-stock | 47.13% | 12.79% | 32.28% | 7.69% | 0.12% |
| mixed-upgraded | 63.23% | 14.73% | 14.66% | 7.23% | 0.15% |

Comet/Vex expresses its straight-line role on Redline; Trail/Mica leads Runoff. Bastion/Ox improves in Crucible but is weak elsewhere despite a material kill share. The fully upgraded lead wins **96.45%** against stock rivals. This deliberately extreme scenario exposes progression power dominating stock opposition; later-career challenge is not established by the current roster. Neither result is hidden by the no-alarm summary.


First-damage-to-wreck time includes gaps and repairs; it is not continuous time under fire. A five-second threshold flags short intervals. One-shot means a single damage application destroys a full-health car. The declared alarms check one-shot rate, unresolved races and seed diversity; passing them does not certify good balance. Wreck frequency and duration distributions must be read alongside class wins and kill causes.

## Economy and career pacing

W5's unit-rate faucet/sink topology preceded coefficients. Its **13 scenarios × 2,000 seeded 100-race careers = 2.6 million abstract economic outcomes** use declared outcome/upgrade assumptions. These are not physical races. Baseline first earned part: **1.7025 races**, mean net **108.87 CR/race**. Permanent last-place wreck: **40 CR net**, first earned part after **three races**, no repair debt. Winners reach the explicit **8,000 CR** cap; finite garage completion is not an endless equilibrium. Reward size is the largest sensitivity lever, followed by repair rate and prices. See [W5 assumptions and tornado](W5-parts-and-shop.md).

W7 separately ran **360 distinct physical races** across three tiers, five courses, three representative Line gear bands and eight seeds per cell, then resampled **2,000 careers per tier** through the real shop/progression/receipt rules. Reference-driver wins: **72.68% Rookie / 37.08% Club / 30.53% Pro**. First earned part: **1.2855 / 2.036 / 2.012 races**. No bankruptcies or censored careers; all source outcomes qualified, so unlocks arrived exactly at authored milestones. The starter grant can already buy a first-tier part. These small source cells and approximate gear bands do not establish human win rates or independent confidence intervals from 72,000 resampled outcomes. See [W7 seed review and limits](W7-campaign.md).

## Sustained Stick performance and thermals

**Final sustained run passed:** 900.00595 real seconds, **29.99980 Hz per controller**, 27,000 sent/accepted inputs per seat, zero rejections, zero pending acknowledgments, zero dropped/out-of-order deltas. Thirteen races completed across all five courses, with 4,149 recorded weapon shots in their result snapshots and at least four scripted human-slot three-lap finishes. No client errors or process interruption. The final APK hash matches the session/build hash above.

The observed phase durations were approximately **837 s racing**, 56 s countdown/preparation, 4.8 s lobby transitions and 2.2 s results. No intentional idle gap was inserted. Pose polling achieved **5.93 Hz during races** because each request waits for its response before the 100 ms delay; the independent input pumps maintained 30 Hz. The original raw run's short `load` label says 10 Hz, which is its nominal ceiling, not the achieved polling rate.

| Metric (ms: p50 / p95 / max; sample count) | Minute 1, 50-60 s | Minute 15, 890-900 s | Last full race window, 880-890 s |
|---|---:|---:|---:|
| Frame interval | 16.95 / 21.21 / 27.60 (n=599) | 16.82 / 21.50 / 99.00 (n=593) | 16.71 / 21.60 / 25.08 (n=599) |
| Player 1 input age | 19.19 / 38.44 / 59.08 (n=600) | 22.75 / 41.92 / 54.96 (n=335) | 22.24 / 41.51 / 61.24 (n=600) |
| Player 2 input age | 19.17 / 38.06 / 58.72 (n=600) | 22.58 / 42.48 / 54.75 (n=335) | 22.46 / 41.97 / 62.51 (n=600) |
| Simulation step | 1.24 / 1.87 / 4.95 (n=600) | 1.28 / 2.08 / 4.79 (n=335) | 1.21 / 1.96 / 7.00 (n=600) |

Minute 15 includes a Redline-to-Runoff transition and preparation; it is not a like-for-like thermal comparison with minute 1. The adjacent final complete race window is shown without hiding that 99 ms transition maximum. Across **71 fully active race windows / 42,547 frame samples**, the largest window p95 was **21.60 ms** and largest maximum **30.14 ms** (different windows). Across **all 90 windows / 53,831 samples**, worst p95 was **21.69 ms**, worst maximum **109.29 ms**. Those window sample counts are sums of rolling populations; polling overlaps/gaps mean they are not unique independent frame counts. Since process start: histogram p50/p95 **16.7/21.1 ms**, exact max **109.29 ms**, n=54,596; histogram bins are 0.1 ms.

Worst active-window input-age p95/max was **47.05/73.95 ms** for Player 1 and **46.83/73.73 ms** for Player 2. Whole-load acknowledgment RTT p50/p95/max was **10.35/62.92/103.99 ms** and **10.79/63.32/103.82 ms** (27,000 each). These are distinct measurements. One initial boundary stale-consumption count was recorded per seat; every sampled ten-second window has zero stale counts. The `discardedSimulationMs` counter increased by 9 ms at a transition; it records elapsed-time clamping even in menus/countdowns, so this is not evidence of lost active-race physics time.

Load was observable: **4,960 race polls**, 1,080 with six unresolved cars, 2,399 with live projectile/mine/blast effects; sampled peaks were **2 projectiles / 18 mines / 2 blasts**. Asphalt, kerb, oil, gravel and ice were all observed under the human slots. This is normal six-car combat with wrecks and finishers, not six cars forced to remain alive for every second and not an artificial maximum-pool benchmark.

On **2442 MHz Wi-Fi**, thermal HAL CPU went **56.157 -> 55.077 C**, GPU **40.240 -> 39.849 C**. Every thermal sample reported status **0** and cooling-device value **0**. PSS ranged **116,085-122,123 KB** (about 113.4-119.3 MiB), ending at 118,591 KB. No sustained growth is visible in this preheated run. Ambient conditions were not controlled; this does not certify all devices, radio contention or every thermal path.

Against W1's measured final-window p95 21.53 ms, the final worst active-window p95 is **0.07 ms higher**, so a strict numerical "all windows inside W1" claim would be false. The maximum improves from W1's 141.61 ms to 109.29 ms across all phases, and to 30.14 ms within fully active race windows. Against the original proposed **p95 <=16.7 ms / max <=33 ms** rubric, **G1 performance is not a full pass**: active p95 and transition maxima miss it. The active-window worst-frame component meets 33 ms. Optical thresholds remain unmeasured.

Full evidence: [`w8-soak.json`](../../../deathride/evidence/phase1/w8-soak.json), [`w8-soak-summary.json`](../../../deathride/evidence/phase1/w8-soak-summary.json), and the retained baseline/profiling records alongside them. The app was restarted into a ready lobby after measurement; the final build remains installed.


The Stick was already warm from earlier wave checks. Two Node WebSocket clients send ordinary absolute input states at 30 Hz; public pose polling waits 100 ms after each response (nominal maximum 10 Hz, with the achieved rate reported above). Repeated six-car practice races cycle all five authored courses with weapons, pickups, surfaces and generated effects. The run records phase changes and every ten-second frame/input-age window. Thermalservice and PSS are sampled asynchronously once per minute so adb work does not block the input scheduler. The final PSS command uses `dumpsys meminfo --local` to avoid invoking an application dump/explicit GC.

Frame distributions are render-entry intervals. Input ages are simulation consumption ages after a best-RTT midpoint clock estimate, **not input-to-photon**. Window quantiles are exact; since-start histograms declare their bin width. Report active race windows separately from countdown/menu/course-bake transitions, retaining both maxima. Never average window percentiles and call the result a pooled percentile.

The preserved baseline (`w8-soak-baseline.json`) ran 900.17 seconds with twelve races but failed the zero-rejection assertion: 3/4 stale input frames rejected at the two seats. Its worst transition was **566.57 ms** and worst fully active race maximum **129.50 ms**. Ordinary memory dumps also coincided with explicit app GC every minute. Scenery profiling and the `--local` sampler change led to the final rerun; these are measured corrections, not exclusions of inconvenient data.

The final five-course loading check observed preparation, a **2,965.62 ms** countdown after readiness, and cancellation of an unfinished course build. Warm bake slices peaked at **4.44-6.49 ms**, cold at **30.63 ms**; the nominal geometry budget is 3 ms before submission overhead. The detailed records are `w8-bake-baseline.json`, `w8-bake-final.json` and their logs/screenshots.

The W1 measured comparison is frame **16.62 / 21.53 / 141.61 ms** p50/p95/max in its final ten-second window, with input-age p95 about **41 ms**. That is a measured baseline, not the original stricter proposed performance rubric. Any misses of either must remain visible.

## Owner exercises and unresolved work

Use [OWNER-CHECKS](../../../deathride/OWNER-CHECKS.md), especially W8. Play a Yard Cup, compare Line with Bastion in practice, try both solo and two phones, and compare Classic/Cruise/Split without changing the approved feel data. Good: heading and road are readable, attacks have warning and impact, a loss still suggests an understandable next choice, and the shop purchase matters. Bad: repeated unexplained early wrecks, the slow armored class feeling useless, eyes leaving the TV to find buttons, cramped thumbs, or no wish to race again.

Priorities before an art commitment: owner combat/comfort verdict; a focused Bastion-versus-roster balance decision; optical flash measurement; real Android/iOS phone checks and a contended Wi-Fi run. No audio, art production or unmeasured quality claim is hidden inside this gate. The final APK remains installed, all wave commits are local, and nothing was pushed.
