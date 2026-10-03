# P3 — measured frame pacing experiments

Design before implementation. P0's scheduler trace places most `DR.clear` time
inside buffer dequeue sleep, not raster clear CPU. P2's warm CPU p95 is about
11 ms while actual render-entry p95 is about 23 ms. Test an explicit Android
Choreographer request-render callback, then display-priority GL scheduling,
then a 1280x720 surface. Keep each variant identifiable in launch receipts and
logs; do not change simulation time or substitute intended vsync timestamps
for actual render-entry time. Lifecycle removes callbacks while paused.

These are experiments, not default changes. Retain a variant only after a
device comparison. Preserve every effect, texture, HUD and audio cue. A 720p
surface keeps composition but may reduce sharpness and requires separate
owner review if selected. Full timing qualification still requires 900 seconds.

Android's [game loop documentation](https://developer.android.com/games/develop/gameloops)
describes BufferQueue backpressure and variable callback delivery. This supports
the experiment, not a claim that Choreographer guarantees our frame target.

## Results

All four 180-second variants use frozen APK `069e152734453ab045b8037dcc46b4bcbaf30e9449b1e3187cd631b436988184`. They are diagnostics, not 15-minute/all-roster qualification.

| Variant | Worst active-window p95 / max ms | Unique active-row p95 ms | Rejected per seat |
|---|---:|---:|---:|
| vsync | 21.314 / 50.556 | 19.138 | 4 / 5 |
| vsync-display | 20.173 / 33.360 | 18.683 | 2 / 4 |
| vsync-display-720 | 19.082 / 73.624 | 18.762 | 0 / 0 |
| continuous-display | 25.332 / 73.139 | 21.067 | 0 / 0 |

The continuous-display arm includes an intrusive 50-second 32 MiB scheduler
capture plus 297 independent ICMP samples; do not use it as a clean A/B timing
claim. Capture compression exceeded the observer's original wait timeout; the
completed remote trace was recovered, not repeated. ICMP had no loss and max
65 ms, but no rejection occurred in that interval, so it cannot localize an
unobserved failure. CPU-frequency access warnings remain in the original log.

Vsync plus display priority reduced buffer acquisition waiting and the measured
interval tail, but no variant reaches 16.7 ms. The 720p surface's unique-row p95
18.762 ms is no improvement over native 18.683 ms and has a 73.624 ms maximum.
Keep native resolution: no art trade-off is justified. All real timestamps and
failures remain in the evidence. Defaults are unchanged in this wave; later
combined qualification will decide whether to retain paced scheduling.

Rejected inputs show 281-308 ms shared receive gaps while 17-18 render frames
continue. Exact matching frame rows and input phases are in
`vsync/input-stall-analysis.json`; the handler's parse/offer/ack enqueue is far
shorter. Thus neither out-of-order handling nor a whole-process 300 ms pause
explains those failures. The transport/OS boundary remains under investigation.

The scheduler trace also directly catches a 61.509 ms audio phase waiting
60.692 ms for the audio worker's monitor during ART JIT contention. This is a
new measured dependency despite native calls already being outside the lock;
P7 removes the monitor. The causal excerpt is retained. Existing core/link/game
tests remain applicable and the variant Android build passes. No optical or
owner-feel claim is made.
