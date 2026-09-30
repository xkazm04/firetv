# W8 Integration, balance and G1 evidence - design first

2026-09-30, after W7 `23b6578`. Registry read: `monte-carlo-scenario-presets`, the earlier runtime tiers-of-truth/allocation/update-order and combat-duration/economy notes. The scenario note explicitly rejects repeated deterministic outcomes masquerading as independent Monte Carlo evidence; W7's distinct seeded line/phase variation and physical hashes carry into this report. G1 remains the owner's decision.

## Scope and acceptance

Exercise the complete sequence: pair, choose a car, buy a part, race career events with weapons, review results/cup progress, save, and recover after process restart. At least three real Stick career races are required for the integration evidence. A scripted driver is a controller input source, never an AI takeover of a human seat; report wrecks and incomplete laps honestly. Verify Home/resume, reconnect neutralization, matching phone/TV state, and restoration of procedural scenery. Improve integration defects found in these flows without changing the five approved feel presets.

Keep all tunables as data. The reference renderer still uses one generated static scenery texture plus bounded in-code cars/effects. No image/audio assets are added. Static menus should avoid showing misleading live race information. Keep useful rewards, rival identity and next actions clear; do not claim the prototype has finished-game polish.

## Physical balance scenarios

A versioned preset table declares **2,000 seeded AI-only races per scenario**. Five stock Pro scenarios use the five authored courses. Rotate the five named class/style profiles across all six grid positions, balancing class entry counts and the duplicated class. A sixth scenario cycles courses with a fully upgraded lead car against stock Pro rivals, exposing progression's power advantage. All use real car, collision, surface and combat rules; there is no separate damage model.

Report per scenario: seed count and distinct final hashes, duration p50/p95/max, unresolved races at the existing ceiling, wreck count, class wins/entries, kill share by cause, one-shot rate, and first-damage-to-wreck elapsed time. That latter duration includes gaps and repairs; it is not a continuous duel duration, so do not label every long race 'spongy'. Flag short intervals and one-shots with declared data thresholds. A deterministic seed replays exactly. Full simulations live in a separate reproducible Gradle report task so routine unit builds remain practical; smoke coverage and deterministic/content checks remain in core tests.

W5's structural/sensitivity economy report and W7's 2,000-career-per-tier pacing remain part of the final evidence. If balance reveals a serious mechanical problem, change its single data authority, document the reason and rerun affected evidence. Do not tune to make a summary table look better.

## Real Stick measurement

Run **900 real elapsed seconds** on AFTKM at 1080p, using two 30 Hz LAN controllers and repeated six-car weapon races. Cycle all five tracks; every course retains authored surfaces, generated scenery, skid/dust/smoke/weapon effects and pickups. Record each ten-second rolling frame/input-age window and race transitions, with population/sample count, device, Wi-Fi frequency and APK hash. Separate active race windows from countdown/menu/scene-bake costs; report both rather than excluding inconvenient maxima. Compare minute 1 and minute 15, plus worst p95/max, against W1's measured frame baseline and the original stricter proposed rubric. Record actual weapon/pool activity so a quiet scene cannot be called a combat load.

Sample Android thermalservice and PSS before, during and after. The Stick has already been running for this session, so this is a preheated sustained-load test, not a cold-device claim. Thermal status/cooling readings and sensor temperatures support only observed behavior during this run, not an ambient-controlled thermal qualification. Optical latency, physical-phone comfort, owner fun, iOS and a contended-streaming Wi-Fi test remain not measured.

Produce `G1-REPORT.md` with the evidence table and truth tier per claim: exists, valid, wired, behaves; only the owner can add felt. Include concrete good/bad owner exercises and an honest recommendation. Green core/link/APK tasks, final installed APK, OWNER-CHECKS, status/session log and one local commit finish W8. Never push.

## Integration findings before final acceptance

The first three-event camera-corrected Stick session reached the first cup and restored both profiles after Home and process restart. Two early double wrecks were followed by two three-lap finishes. A resolved driver's position had continued widening the shared camera; active-driver framing/HUD now fixes that. Static menu footers no longer expose the damaged lobby demonstration, and logcat emits compact metrics to avoid truncating full-profile JSON.

The first sustained run exposed several-hundred-millisecond course-change stalls. Preserve that complete run as baseline. Instrument framebuffer setup, renderer setup, geometry submission and finish separately on the Stick before accepting a remedy. Prefer reusing generated rendering resources and spreading static scenery work across a data-defined per-frame budget, with an explicit preparation state and countdown held until the course is ready, if geometry cost is dominant. Keep the exact procedural scenery content and one texture footprint; do not solve the hitch by silently lowering detail or caching five full-size textures. Repeat course checks, complete session/lifecycle and the full soak after any runtime fix.

Review also found the mixed upgraded preset correlated class with course. Cross all 25 pairs, add a coverage assertion, rerun its 2,000 actual races, and retain the discarded summary separately. The final five stock presets are unchanged. The report must expose low Bastion wins outside Crucible and the fully upgraded lead's overwhelming advantage over stock rivals; no-alarm numeric gates do not certify balance or G1.

### Scenery and measurement fix, verified on the Stick

The complete baseline ran 900.17 real seconds at 29.99975 Hz per controller, with twelve completed races. It failed its zero-rejection assertion (3/4 stale frames rejected by the two seats). Worst transition frame was 566.57 ms; worst full-race-window p95/max were 21.63/129.50 ms. Keep `w8-soak-baseline.json`, summary and logcat as the failed baseline.

Instrumented warm bakes measured roughly 110-121 ms of geometry and 179-206 ms finishing/disposing the temporary renderer, plus framebuffer setup. The final implementation retains one 3072-square framebuffer and renderer and uses a Kotlin sequence to submit the same deterministic geometry in 3 ms budget slices. GPU submission adds overhead: measured warm slice maxima were 4.44-6.49 ms in the five-course check; cold initial maximum was 30.63 ms. Warm readiness took roughly a second of responsive preparation, without lowering detail or retaining five textures. `sceneryReady` gates simulation/countdown, the phone says PREPARING, and the TV names the course being prepared. Resume regenerates the scenery into the managed target.

`scenery-check.mjs --countdown` visited all five courses, observed twelve preparation polls with race time exactly zero, then measured 2,965.62 ms from first ready poll to GO. A rapid second course choice canceled an unfinished bake and published only the final course. Final three-event session and Home/process recovery passed; ordinary browser multi-touch/release/reconnect/flash checks also passed. The final career session had three double wrecks; an earlier unchanged-physics run had two three-lap finishers. Keep both rather than selecting the favorable result.

Ordinary Android `dumpsys meminfo` coincided with explicit app GC and the once-per-minute 110-130 ms stalls. The device's own help documents `--local` as collecting locally without calling the process. The final sustained run uses that mode for PSS; this still measures the system and is not a claim that diagnostics have zero overhead. Optical latency and physical-phone comfort remain unmeasured.

The final physical report uses 12,000 distinct-per-preset outcomes: five stock presets plus a corrected mixed preset crossing 25 class/course pairs and buying only legal shop upgrades. A capped Bastion cannot buy extra armor merely to incur a handling penalty; the stress setup now respects that real offer rule. Full upgrade lead wins 96.45% against stock Pro rivals. G1 reports this progression-power concern and Bastion's weak non-arena wins explicitly.

Probe rate clarification: input scheduling is independently fixed at 30 Hz and its actual count/duration is reported. Pose polling waits 100 ms after each HTTP response, so its nominal 10 Hz setting is a maximum, not its achieved rate. The summary derives observed race-poll Hz from the counted polls and recorded race-phase wall time.

## Final acceptance record

Final `:core:test :link:test :app:assembleDebug`: green, 52 core + 3 link tests. APK `EE42CFDB0A89E551899383AC76B6A37016E6CD57E3A66E027F793F6D265DE573` is installed on AFTKM and left in a ready lobby. Final three-career-event session, purchase/receipt/save recovery, Home/resume, five-course generation/cancellation/countdown checks and browser touch/reconnect/flash checks passed.

The final sustained run passed its checks: 900.00595 real seconds, 27,000 accepted frames per seat at 29.99980 Hz, zero rejected/dropped/out-of-order input frames, thirteen completed races across all five courses, at least four human-slot three-lap finishes and 4,149 shots recorded in completed-race snapshots. Of 90 ten-second windows, 71 were fully active races. Worst active-window p95/max: 21.60/30.14 ms; all-window worst p95/max: 21.69/109.29 ms. Minute 1 frame p50/p95/max: 16.95/21.21/27.60 ms; minute 15 includes a transition at 16.82/21.50/99.00 ms. The adjacent final complete race window is 16.71/21.60/25.08 ms. Worst active input-age p95/max: P1 47.05/73.95 ms, P2 46.83/73.73 ms, clock-estimated rather than optical.

CPU HAL 56.157 -> 55.077 C, every sampled thermal status/cooling value zero; PSS 116,085-122,123 KB. The device was preheated, on 2442 MHz Wi-Fi. The regular intrusive-dump stalls and large synchronous-bake stalls are removed in this measured run. There is still a strict performance miss: active p95 is 0.07 ms above W1's particular 21.53 ms window, and the original 16.7 ms p95 / 33 ms all-phase maximum rubric is not met. Do not call the overall performance gate green. Detailed frame populations, transition costs, input counts, polling rate, thermal raw data and baseline comparison are in `G1-REPORT.md` and `w8-soak*.json`.

OWNER-CHECKS, status and session log are updated. Engineering integration/evidence work is complete; G1 remains the owner's decision. Early wrecks, Bastion/roster balance, progression power, physical-phone comfort, optical latency and finished-game quality remain unresolved or unmeasured as explicitly listed in the report. No push.
