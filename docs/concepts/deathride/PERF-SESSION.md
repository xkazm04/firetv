# Performance session — 2026-10-03

Start 00:41 UTC; approximately four-hour device window. Exclusive Stick access,
local commits only. Session rows are completed with each measured wave.

| Wave | Work and evidence | Limits |
|---|---|---|
| P0 | /24 discovery of AFTKM .139, isolated perf app/8772/ADB 5041, matching installed baseline hash. 900.275 s at 30 Hz: 19/22 rejections, active p95/max 26.198/176.268 ms, PSS <=118.295 MiB. Added optional bounded phase/GL/input diagnostics; desktop JFR and native scheduler/simpleperf evidence identify native audio stalls. Required 136/5/20 tests and APK pass. | No runtime optimization yet, no relaxed gate, no owner feel claim. Diagnostic JSON export has measured overhead. Longer input diagnostic continues; original TV app only inspected read-only. One local commit; no push. |
| P1 | Fixed-capacity audio worker, generation-safe handles, stop-before-start, coalesced parameters and visible delays/drops. Phase audio p99/max 2.003/13.456 ms versus 15.748/131.623 before. Final 900.211 s: active p95/max 22.672/48.027 ms; PSS <=137.077 MiB. 136/5/25 tests and APK pass. | 3/4 rejected inputs had receive age 252–271 ms and zero ordering errors; gate remains open. One stale audio onset dropped, native completion max 134.702 ms, parameter wait max 153.154 ms; audible timing remains unmeasured. No art or input-policy change. One local commit; no push. |
| P2 | Negotiated HUD deltas with full refresh/reconnect, measured ~1.6 KB/message, unchanged dynamic data. 900.222 s: all 54,014 inputs accepted; RTT p95/max 61.821/115.864 ms. Frame p95/max 21.776/39.225 ms, PSS <=127.856 MiB. 169 tests/APK and six browser suites pass. | Frame gate remains open; zero rejects in this run is not universal LAN proof. Stale consumption and audio queue delay remain published. One local commit; no push. |
