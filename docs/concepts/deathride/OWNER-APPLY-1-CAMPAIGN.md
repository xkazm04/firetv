# Owner application 1 — campaign

Merge `deathride/campaign-v2` into consolidated `deathride/main`. The sole textual conflict was the backlog: both campaign and art entries are retained. Main's renderer, HUD, effects, audio triggers and controller behavior survive. Item 02 is rejected: ordinary bosses require a surviving, finished first-place win. A third-place driver ahead of a fourth-place named boss does not recruit that boss. The finale still requires a surviving elimination victory, never a lap win.

Items 01 and 03–08 remain: 35 stable events across five seven-visit acts and 367 ordinary laps, finite shared class limits and late 0.93–1.03 PR bands, useful ally rewards, saved restitution including wallet overflow, coalition story, supplied rig and last-car-running finale. The accepted 4–6 hour target is now in `ash-rules.csv` and the authoring tool as well as the prose; DV3 had left 3–5 in those two places. This target is an aspiration, not an observed guarantee.

The report uses a frozen compiled runtime and a fresh physical library on the retained DV3 seed schedule, 4 base outcomes plus 16 extra boss outcomes per cell, two separately rerun 2,000-career policies at the unchanged 70-attempt horizon, and 3,072 paired finale fights. The race-informed policy trains on first-place wins. Data and resource digests identify the executing bytes. Historical DV3 results remain untouched and labeled historical on the review page.

Report: file:///C:/Users/kazda/kiro/firetv-deathride/deathride/evidence/owner-decisions/campaign/index.html

Instrument checks use actual first-place settlement and the report's shared metrics. Planted third-place promotions, censored runs ending at 69 attempts, absent arrivals and both edges of the late PR band are rejected. The earlier class-winner, seed diversity, full rotation, pairing and unresolved controls are rerun. Class controls from DV3 remain retained evidence because this application changes no vehicle, cap, physics, weapon or ability data relative to DV3. No new all-class physical acceptance is claimed.

## Measured result

| Policy | DV3 completed / 2,000 | Owner rule completed / 2,000 | Censored at 70 | Bankruptcy |
|---|---:|---:|---:|---:|
| Race-informed | 1,162 | 669 | 1,331 | 0 |
| Highest PR | 961 | 8 | 1,992 | 0 |

All **11,520 fresh physical outcomes**, both reference-garage files and all **3,072 finale fights** are byte-identical to DV3. The complete physical cross and per-cell 99% distinct-hash gate pass. All 34 final-core event replays reproduce exactly; the 350 frozen runtime digests match the final build. These are paired reruns, not extra independent seed blocks. The changed earned ledgers measure the stricter gate and first-place buyer training rather than a secretly changed race simulation.

Race-informed Rookie completes 0/667, Club **3/667**, Pro 666/666. Of 1,331 censored careers, 1,022 stop at Vex and 292 at Ox; the remaining 17 stop earlier. The PR buyer censors 1,940 at Rook, 35 at Ox, 15 at Vex and two at the finale. The preserved roadworthiness and no-bankruptcy properties do not imply eventual victory. Full end wallets still cannot buy a win from an exhausted legal build.

First-entry race-informed boss ratios are **0.8551 / 0.8713 / 0.9191 / 0.9708**: Vex still misses 0.93–1.03. Highest-PR ratios are **0.8504 / 0.8852 / 0.9976 / 1.0317**: Mica still misses. The latter policy reaches the bosses with **2,000 / 60 / 25 / 10** careers; those late ratios describe a highly selected surviving subset, not a broad improvement. The old .85–.90 verdict remains shown alongside the accepted bands. No band was widened.

Completed race-informed driving p50 is **3.7631 h for Pro** (p90 4.5424) and **3.6022 h for the three Club completions**; the latter is too small and selected to establish typical Club duration. Censored Rookie/Club driving p50 is **5.7975 / 6.0827 h**. Only eight PR-buyer Pro careers finish (p50 4.0455 h). Adding an explicitly assumed 30–60 minutes for menus/story can put completed paths around the accepted 4–6-hour goal; it does not make that a typical completion promise for these cohorts. Mean paid restitution remains 289.12 CR for race-informed careers but only 5.11 CR for the mostly early-censored PR buyer.

Status: **APPLIED; build and functional gates green, numerical campaign acceptance incomplete.** Required tasks pass with 163 core / 8 link / 35 game tests and debug APK; 51 art tests, bundle validation, 12 campaign-metric tests, six runtime browser suites and both offline campaign pages pass. The browser wrapper initially failed a port assertion before gameplay; it now passes its isolated port explicitly. The failed launch remains in `browser-runtime`, with successful campaign/duel results in `browser-runtime-retry`.

The inherited Frostline recovery jam is still present in the fresh physical library, and the retained developed Rookie long-straight timeout remains open. The first-place decision increases censoring substantially; further balancing must preserve that owner rule. No observation horizon or numerical gate is widened. All Stick and human pacing/feel tests remain unmeasured.

Reproduction: build `:core:reportClasspath`, freeze with `tools/freeze-campaign-runtime.py owner-2026-10-03`, then use its classpath with `CampaignReportKt physical 4`, `boss 16`, `duel 512`, both `careers 2000` buyer policies, and `verify 4`, all with tag `owner-2026-10-03`. Physical namespace is 103118209; duel namespace is 103090001. Run `tools/owner-campaign-report.py` after those outputs are complete. Physical outputs refuse overwrite; use a clean report destination for a fresh reproduction.
