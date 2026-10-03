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
