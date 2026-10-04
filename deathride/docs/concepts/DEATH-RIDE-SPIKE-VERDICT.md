# Death Ride — Slipstream: S6 spike verdict

## Recommendation

**STOP at Gate G0.** Deliver this runnable candidate for the Stick trial; do not start Phase 1 until the owner's optical measurements and playtest clear the gate. This is an evidence boundary, not a measured hardware kill-criterion failure.

## Built and observed

A close-camera racer built around catching a slide. Touch anywhere to anchor your steering thumb, tap the brake to loosen the rear, and countersteer to recover. The TV follows the action while a minimap keeps the rest of the circuit in view.

Standalone Android APK (dev.deathride.slipstream), Kotlin simulation, libGDX Android/LWJGL3 renderers, Ktor HTTP/WebSocket server, and plain-HTTP phone controller. Development device: Windows 11 desktop, NVIDIA GeForce RTX 4090, Java 17 (and a Java 22 build check where logged). Browser: Chromium 136 headless, 896×414 with touch emulation. Physical Fire TV, phone models and Wi-Fi band: not measured.

Tiers: T0 source exists; T1 APK/build/static validation; T2 real desktop server and controllers connected; T3 scripted behavior and JVM tests; T4 owner perception is not measured. Screenshots are desktop captures, not device evidence.

## Numbers

Timing triples below are p50 / p95 / max. Lifetime quantiles use declared bounded histograms; last-10-second values and maxima are exact. Full JSON and logs are in `../../../evidence/` relative to this document.

| Metric | Value | Sample / method / device |
|---|---|---|
| Simulation regression suite | 14 core + 3 link tests pass | JVM, behavioral assertions (T3) |
| Three-lap six-car AI race | 69.967–72.6 s | 20 seeds, 120 finishers; JVM sim (T3) |
| Full-lock slip / 1 s coast speed | 23.153° / 24.076 m/s | 1 scripted trajectory each; JVM sim (T3) |
| Brake distance from 15 / 25 m/s | 4.537 / 12.019 m | 1 scripted stop each; JVM sim (T3) |
| Transport RTT, idle | 0.968 / 1.543 / 1.923 ms | n=25; Windows loopback (T3) |
| Transport RTT, steering load P1 | 0.306 / 0.612 / 2.355 ms | n=1802; 30.003 Hz; 60 s, loopback (T3) |
| Transport RTT, steering load P2 | 0.251 / 0.519 / 2.48 ms | n=1802; 60 s, loopback (T3) |
| Input age consumed, P1 / P2 | 17.199 / 33.38 / 49.371 / 16.598 / 32.766 / 48.779 ms | Last 10 s; n=600 / 600; corrected clocks; not optical (T3) |
| Desktop frames, entire soak | 16.6 / 17 / 110.773 ms | n=53987; 1920×1080, six AI cars; includes startup (T3) |
| Desktop frames, minute 1 / 15 | 16.675 / 16.803 / 17.83 / 16.667 / 17.307 / 18.255 ms | Exact 10 s windows; n=600 / 600 (T3) |
| Simulation step, desktop soak | 0.028 / 0.052 / 1.06 ms | n=50513; lifetime histogram (T3) |
| JVM heap, minute 1 / 15 | 15.828 / 24.381 MB | One sample each; desktop heap; excludes native/GL memory (T3) |
| Warmed simulation allocation | 0 bytes / 10,000 steps | Desktop thread allocation counter; unit-test gate (T3) |
| Render allocation audit | 53664 / 53687 frames allocated 0 bytes | Includes transitions and diagnostic captures; desktop only (T3) |
| Real-time desktop soak | 900.029 s | 12 race starts; automated AI + rematches (T3) |

The probe observed zero sequence gaps/out-of-order inputs during its steady load and zero outstanding acknowledgements at its end. Its later failure injections intentionally caused one stale rejection and one out-of-order rejection; these are included in the final diagnostic counters. The simulation soak has no human controllers. Actual thermal behavior is not established.

| Hardware / perception metric | Value |
|---|---|
| Stick install, model, Fire OS, actual ABI/RAM | not measured |
| Stick 1080p frame time, 2 cars: p50 / p95 / max / n | not measured |
| Stick 1080p frame time, 6 cars: p50 / p95 / max / n | not measured |
| Optical input-to-photon: p50 / p95 / max; 30 taps at 240 fps | not measured |
| Real Wi-Fi idle/load RTT, loss/order and consumed input age | not measured |
| Stick 15-minute thermal soak; minute 1 vs 15 frame tails | not measured |
| Stick heap/PSS/CPU budget; actual output resolution | not measured |
| Wi-Fi band, physical phone models, competing-stream run | not measured |
| Physical-phone wake lock, fullscreen, vibration, orientation; iOS | not measured |
| QR-to-driving time on Stick; comfort over 10 minutes | not measured |
| Owner playtest: connected steering, slide recovery, comfort, rematch, lateness | not measured |

## Owner playtest

What the owner did: not measured.

What the owner saw: not measured.

What the owner felt: not measured.

1. Does steering feel connected? not measured.
2. Can I recover from a slide? not measured by an owner (scripted dynamics are tested).
3. Is the phone comfortable for ten minutes? not measured.
4. Would I race again? not measured.
5. Does anything feel late? not measured.

## Risks

Shrank: build/native packaging, deterministic contact/lap behavior, six-car completion, bounded render/simulation storage, pairing, reconnect identity, simultaneous thumb controls and stale-frame handling all have local evidence.

Grew or remain open: Fire OS GL/lifecycle differences; ARM frame-time maxima and GC; TCP head-of-line tails on real Wi-Fi; phone wake lock unavailable on insecure origins; physical ergonomics and perceived steering; camera comfort and readability on a real couch. The desktop GPU is substantially stronger than a Stick and the RTT tests did not cross a Wi-Fi radio.

No prediction was added to conceal lag. The TV keeps the newest complete input, rejects old sequences and old corrected timestamps, holds steering and drops propulsion/braking after 250 ms. The source retains a fixed 60 Hz simulation; the 30 Hz time-basis test only covers isolated handling.

## Hardware gate procedure

Install the APK through the owner's Wi-Fi package-install workflow. Record the Stick model, Fire OS version, active ABI, phone models and Wi-Fi band. Scan into a two-phone race and collect `/stats` for idle/load, including a competing-stream run. Film both screens at 240 fps for at least 30 FLASH TEST taps. Report optical p50/p95/max. Run continuous six-car racing for 15 minutes and record minute-1/minute-15 tails and heap. Let the owner answer the five questions above.

Proposed rubric: optical p50 ≤120 ms and p95 ≤180 ms; six-car frame p95 ≤16.7 ms, max ≤33 ms. No growing 60-second latency tail. If optical p95 remains >250 ms after the feel pass, or six cars cannot hold 30 fps, stop and let the owner choose a change. None of these hardware thresholds is certified by this delivery.
