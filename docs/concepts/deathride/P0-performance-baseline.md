# P0 — measurement before changes, 2026-10-03

Use the consolidated campaign/audio source on `deathride/perf`. Exclusive AFTKM
access is authorized; discover port 5555 on the host's /24. Install only
`dev.deathride.perf`, listener 8772, private host ADB server 5041. Retain read-only
TV package records and bind each measurement to its installed APK hash.

First record an unchanged-runtime baseline with the existing ordinary-input
ability probe (two 30 Hz controllers, six-car grid, abilities/guns/mines, HUD and
audio). No screenshots during timing. Retain failed attempts. Then add bounded,
preallocated phase diagnostics and repeat: request/preparation, input/simulation,
audio, telemetry/UI rebuild, scenery draw, effects/cars, HUD and render return.
Separate render-entry intervals from CPU wall work and inter-frame wait; neither
is optical latency or GPU execution time. System tracing and GL counters will
check scheduling, native audio, upload and draw work. Android runtime GC counters
and allocation sampling are diagnostics, not part of the final clean soak.

Inputs must retain the 250 ms freshness cutoff and actual generation timestamps.
Record receive age, parse/offer/ack time and rejection cause; measure before
changing transport or mailbox behavior. No acceptance of stale input to pass a
counter. Keep the fixed-step deterministic zero-allocation gate intact.

Final qualification: at least 900 seconds, actual controller throughput recorded,
zero rejected inputs, worst fully-active 10-second window p95 <=16.7 ms and max
<33 ms. Also retain all windows and since-start maxima. Six entrants at race start
does not mean six remain alive: separately report six-live-car coverage. Memory:
PSS <=192 MiB (`dumpsys meminfo --local`), warm growth <=8 MiB, owned textures
<=52 MiB and art <=32 MiB. Profile audio with actual installed clips; absent songs
are not claimed as playing. No guessed quality reductions.

Each wave ends with the required core/link/game tests and APK, design findings,
status, session entry and local commit. Final evidence uses the truth ladder
exists → valid → wired → behaves → felt; owner feel remains pending. About four
hours from 00:41 UTC, ending around 04:41 UTC. Nothing pushed.

## Baseline and first diagnostic findings

The unchanged-runtime APK `992e596fbb7bc3b7b3eb7440fcba7a2b7b68a3593ad67b0f15dcbf36f0c53e4b`
ran 900.275 seconds. Each seat sent 27,009 inputs at 30.0008 Hz, with 19 / 22
rejections and no host pump stalls. Rejections cluster near 537–540 and 841–843
seconds, with RTTs as high as 1,032.6 ms. Complete active windows: worst p95
26.198 ms, max 176.268 ms; 87 windows still had all six cars active and include
both extrema. These misses exceed the historical silent HUD result; the runs
are not controlled enough to assign that difference entirely to audio.

PSS 94.431–118.295 MiB, 39.970 MiB owned textures and 18.750 MiB art pass.
The merged checkout actually loads 168 art regions, including its selected car
states, rather than H3's older 98-region kit. No art was changed in this wave.
Audio reached eight voices, 4,385 plays and 3,970,682 decoded bytes. The 33 missing
requests include the intentionally absent music; no full-song mixing is claimed.
A one-second simpleperf capability check occurred during the baseline between
the 192- and 252-second observations; its raw windows remain included. Thus this
baseline is diagnostic, not a pristine final qualification.

The optional recorder is preallocated; its append allocation test passes. It
records raw wall/CPU times, phase spans, actual GL calls, effect occupancy and
input parse/offer/ack-enqueue times. The final clean run will disable it. JSON
export is off the render thread but still costs CPU and allocations: one 207 KB
profile response took 281 ms wall time and coincided with 5.07 MB process-wide
allocation. Do not attribute all diagnostic-run GC to production rendering.

In a retained 3,863-active-frame snapshot, render work p50/p95 is 15.440/21.047 ms;
render CPU is 8.834/12.384 ms. Audio reaches **115.983 ms**. The independent
20-second scheduler trace catches an audio span of **48.601 ms**, including
40.943 ms asleep. This establishes native audio work on the render thread as a
cause of large tails. P1 will isolate playback calls in a bounded worker; it
must expose queue delay/drop counts and preserve the eight-voice limit.

| Phase | Snapshot p95 ms | Scope |
|---|---:|---|
| Requests/metric recording | 0.067 | Includes existing metric locks |
| Preparation | 0.005 | Fully active samples; transition work remains separately captured |
| Input and simulation | 3.421 | One or more fixed steps |
| Audio | 2.098 | Rare native stalls dominate the max, not the p95 |
| Telemetry and UI rebuild | 1.465 | Throttled ten-Hz publication |
| Clear/acquire framebuffer | 9.446 | Mostly dequeueBuffer sleep, not nine ms of clear CPU |
| Effect update | 0.051 | 64-slot pool; snapshot maximum 37 occupied |
| Scenery submission | 2.636 | Live drawing, not preparation |
| Cars/combat/effects submission | 5.714 | Includes marks and ability presentation |
| HUD | 2.777 | Shapes, atlas and glyph drawing |

Every one of these active samples has **zero GL texture uploads**. Draw calls
p95/max 18; binds p95/max 14. Texture reduction is not justified as an upload fix.
The scheduler trace records 11.728 CPU seconds on GLThread and 9.160 across the
application's DefaultDispatcher threads in 20 seconds; native mixer AudioOut_D
uses 1.730 CPU seconds. Network serialization/scheduling is material, but this
does not yet identify the baseline's second-long input delays. In the retained
input snapshot receive-age max is 41.895 ms, offer max 5.659 ms and ack-enqueue
max 6.347 ms, with no rejection. Enqueue time is explicitly not wire time.

Desktop phase allocation measurement (3,679 warm active samples, distinct from
Stick timing) finds about 5.76 KB/frame amortized telemetry, 532 B audio, 120 B
scenery, 488 B cars/effects and 64 B HUD. Simulation is zero for steady stepping;
rare world/result transitions remain in this sample. The established core
allocation/determinism tests remain green. All **136 core / 5 link / 20 game**
tests and the debug APK pass. The first property-argument build attempt failed
before compilation; the corrected build and its log are retained.

Evidence: `deathride/evidence/perf/p0`, including byte-for-byte gzip raw baseline,
desktop JFR/phase data, scheduler trace and simpleperf samples/call graphs. A
longer instrumented run continues to capture input failures before P1 changes.
Windows packet capture was unavailable (driver access denied); no network
threshold, packet timestamp, app state or system Wi-Fi setting was altered.
