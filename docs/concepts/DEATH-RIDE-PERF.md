# Stick performance and input robustness

Branch `deathride/perf`, app `dev.deathride.perf`, port 8772. Original TV package
is preserved. Gates are unchanged; no owner feel verdict is inferred.

| Wave | Scope | Status |
|---|---|---|
| P0 | Baseline and bounded diagnostics | Complete: 900 s baseline fails frame/rejection gates, passes memory; native audio render-thread stalls measured; 161 tests and APK green. [Design/findings](deathride/P0-performance-baseline.md) |
| P1 | Native audio worker | Complete: audio phase p99 15.748 → 2.003 ms; final 900 s still fails frame and zero-rejection gates, memory passes. 166 tests and APK green. [Design/findings](deathride/P1-audio-worker.md) |
