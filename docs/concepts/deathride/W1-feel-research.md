# W1 Feel Lab — design before implementation (2026-09-30)

## Research and diagnosis plan

Unity's [input processor documentation](https://docs.unity3d.com/Packages/com.unity.inputsystem@1.4/manual/Processors.html) separates dead-zone normalization from other axis processing. BeamNG's [official v0.25.2 notes](https://beamng.com/game/news/patch/beamng-drive-v0-25-2/) expose speed steering reduction and oversteer assistance as separate options. These are examples of independent controls, not evidence that their settings suit a touch arcade racer. Registry references read: `_laws.md`, `allocation-discipline-in-the-hot-path`, `canon-as-single-source-of-thresholds`, `genre-response-latency-norms` under the authorized game-production registry.

The existing Spike phone maps relative travel through min(150 CSS px, 30% of pad width), then a 4.5% dead zone, linear thereafter. Release centers instantly. The sim integrates yaw with a 0.12 s response, 1.65 rad/s steering authority attenuated by speed/(speed+7), and slip restoration. Throttle and brake are digital; braking unloads rear grip. There is no separate steering slew limit or throttle ramp. Candidate explanation: thumb travel and the dead zone hide small requests; yaw inertia delays larger ones; slip restoration opposes sustained turn-in. High lateral grip alone is not established as the cause. Trace measurements below must decide which claims survive.

## Implementation contract

`core` owns a validated resource CSV of five profiles: Spike, Loose, Agile, Balanced, Stable. The phone owns only touch geometry (relative anchor and travel), with travel read from the host's catalog. Core owns dead zone, exponent, steering slew/return, speed-dependent authority, yaw response/stability, throttle rise/shape and brake response, so every source uses the same shaping once. AI retains the Spike controller until its calibration is separately tested. All fields are consumed; profiles change at render boundaries through an atomic requested index. TV LEFT/RIGHT and the paired phone settings sheet select live; selection does not reset the race. Balanced is the proposed human default, not an owner verdict.

Relative drag avoids a snap at first contact and retains the accepted layout. Absolute-pad steering would require consistently landing near its center; defer until owner feedback. Lower exponents strengthen small movements; a modest return rate catches thumb release without extending the throttle safety timeout. Throttle rises progressively but release/stale input cuts it immediately. Brake suppresses propulsion and never reverses: reverse requires a separate deliberate control in a later recovery design. Stability assist restores velocity alignment, not invisible steering prediction. No physics-based reason for boost in this wave.

A headless trace runs step, ramp, sine and hold at 8/18/28 m/s, holds speed explicitly to isolate response, and reports 90% turn-in, late mean yaw, radius, slip, and recovery below a declared yaw threshold. The fixture is an isolated car, not a lap. Acceptance bands live beside each profile. Tests cover those bands, reset, determinism, stale safety, zero simulation allocation and baseline races.

## Evidence (append after execution)

Optical latency and owner feel are not measured. The owner films both screens at 240 fps for 30 FLASH TEST taps; count frame separation, multiply by 1000/240 ms, report p50/p95/max. Network input age is a different measurement.

### Headless trace result

60 traces; Java 22 Windows JVM; fixed 60 Hz; source CSV `deathride/evidence/phase1/w1-steering-traces.csv`. Table selects 18 m/s full-lock step (one run/profile). Recovery means yaw <0.05 rad/s after release, not perceived slide recovery.

| Profile | 90% turn-in s | Yaw rad/s | Radius m | Slip degrees | Recovery s |
|---|---:|---:|---:|---:|---:|
| Spike | 0.183 | 1.175 | 15.321 | 8.640 | 0.250 |
| Loose | 0.133 | 1.308 | 13.761 | 38.631 | 0.633 |
| Agile | 0.150 | 1.309 | 13.748 | 20.520 | 0.133 |
| Balanced | 0.233 | 1.291 | 13.947 | 12.317 | 0.200 |
| Stable | 0.317 | 1.081 | 16.645 | 7.932 | 0.250 |

Finding: compare both radius and transient time; simply increasing yaw authority can increase saturated slip at high speed. The shorter travel is a design hypothesis for thumb effort, not a measured human improvement. Spike preserves its coefficients; the new shared pipeline makes brake override simultaneous GO for all profiles, which changes that formerly ambiguous case.

### Stick evidence

Release `dev.deathride.tv`, label **Death Ride**, AFTKM armeabi-v7a, output override 1920x1080, Wi-Fi 2442 MHz (2.4 GHz). Automated Windows clients over LAN; no physical-phone trial. Final APK SHA-256: `180347d05052c93f5334b670cb67dff5605eefadb4e1bc0ab5d05dc7db323626`.

`tools/probe.mjs` ran 60 s at 30.013 Hz, 1816 frames per slot. Last 10 s input age p50/p95/max: P1 20.93/41.58/63.81 ms (n=597); P2 20.77/41.07/113.04 ms (n=597). Frame interval 16.62/21.53/141.61 ms (n=593). These are network/simulation ages, not input-to-photon. Lifetime ages include the intentional silence/countdown and are not steady-load latency. Six successive windows are preserved in `w1-probe.json`.

Remote RIGHT selected Agile and the TV screenshot confirms it. A paired Chromium touch-emulation client selected Loose through the settings sheet on this Stick; simultaneous steer+GO, independent releases, reconnect, race/lobby and flash passed. All 18 core + 3 link tests and APK build passed; baseline and each human profile allocated zero bytes over 10,000 warmed steps. Owner feel, optical latency, competing-stream performance and thermal soak are **not measured** in W1.
