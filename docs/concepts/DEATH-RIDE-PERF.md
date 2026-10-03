# Stick performance and input robustness

Branch `deathride/perf`, app `dev.deathride.perf`, port 8772. Original TV package
is preserved. Gates are unchanged; no owner feel verdict is inferred.

| Wave | Scope | Status |
|---|---|---|
| P0 | Baseline and bounded diagnostics | Complete: 900 s baseline fails frame/rejection gates, passes memory; native audio render-thread stalls measured; 161 tests and APK green. [Design/findings](deathride/P0-performance-baseline.md) |
| P1 | Native audio worker | Complete: audio phase p99 15.748 → 2.003 ms; final 900 s still fails frame and zero-rejection gates, memory passes. 166 tests and APK green. [Design/findings](deathride/P1-audio-worker.md) |
| P2 | HUD metadata deltas and input evidence | Complete: 900.222 s, 27,007/27,007 inputs accepted per controller, frame p95/max 21.776/39.225 ms still fail, memory passes. 169 tests, APK and six browser suites pass. [Design/findings](deathride/P2-input-and-network.md) |
| P3 | Pacing / priority / 720p experiments | Complete: vsync/display unique active p95 18.683 ms; target still fails. 720p rejected as no demonstrated p95 benefit. Intrusive trace identifies remaining audio monitor stall. [Design/findings](deathride/P3-frame-pacing.md) |
| P4 | Audio render allocation | Complete: desktop average 532.127 ? 8.609 B/frame, median/p95 zero; no-escape-analysis test passes. 360 s Stick audio p99 .967 ms; 170 tests/APK green. [Design/findings](deathride/P4-render-allocation.md) |
| P5 | Static road-mark mesh | Complete: 196,608 pixels exactly match reference; matched-APK render CPU mean 8.772 ? 7.437 ms, all inputs accepted over 360 s. Frame gate still open. 170 tests/APK pass. [Design/findings](deathride/P5-static-road-marks.md) |
| P7 | Remove measured audio monitor dependency | Complete: bounded SPSC mailboxes, coherent parameter stress, 171 tests/APK pass. Native trace: zero worker-monitor contention; audio CPU p95 .375 ms. Clean long runs follow in P6. [Design/findings](deathride/P7-audio-mailboxes.md) |
| P6 | Foreground Wi-Fi latency experiment | Complete: baseline 8/10 rejects; lock arm zero but invalidated by 13.629 s host pump stall. No causal-fix claim; optional lock and stricter qualification reporting retained. 171 tests/APK from frozen P7 build. [Design/findings](deathride/P6-wireless-latency.md) |
