# Performance session — 2026-10-03

Start 00:41 UTC; approximately four-hour device window. Exclusive Stick access,
local commits only. Session rows are completed with each measured wave.

| Wave | Work and evidence | Limits |
|---|---|---|
| P0 | /24 discovery of AFTKM .139, isolated perf app/8772/ADB 5041, matching installed baseline hash. 900.275 s at 30 Hz: 19/22 rejections, active p95/max 26.198/176.268 ms, PSS <=118.295 MiB. Added optional bounded phase/GL/input diagnostics; desktop JFR and native scheduler/simpleperf evidence identify native audio stalls. Required 136/5/20 tests and APK pass. | No runtime optimization yet, no relaxed gate, no owner feel claim. Diagnostic JSON export has measured overhead. Longer input diagnostic continues; original TV app only inspected read-only. One local commit; no push. |
