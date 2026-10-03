# Death Ride — Stick performance and input robustness

2026-10-03. Branch `deathride/perf`, isolated package `dev.deathride.perf`,
port 8772. Device: Fire TV Stick 4K AFTKM, Android 11/API 30, armeabi-v7a,
four CPUs, approximately 1.7 GB RAM; discovered at `10.0.0.139:5555` by /24
port scan. All work is local; no push. The original `dev.deathride.tv` package
is outside every installation, force-stop and compilation command.

Final qualification and handoff are recorded below after the last run. This
report distinguishes improvements from gate closure; a short successful arm
or a zero-rejection counter with a stalled host is not qualification.

## Measurement contract

The existing ability soak drives two ordinary WebSocket controllers at 30 Hz,
cycles five courses and ten classes, and sends fire, mines and abilities.
Races have six entrants, HUD and audio enabled. Active timing windows are
sampled during race at raceSeconds >= 10; six-live-car windows are additionally
reported. Each sample is the exact last-ten-second distribution, so overlapping
percentiles are **not pooled**. Reported p95 is the worst such active-window
p95. Max is the worst active-window maximum. Unique diagnostic frame samples
have a different scope and are labelled separately.

Frame time is the real monotonic interval between `RaceGame.render` entries,
unchanged throughout the pass. It is neither CPU time nor an optical/presentation
measurement. Native traces split phase wall time into scheduled CPU, sleep and
runnable delay. The preceding render's work is paired with the next interval.
The final standard soak disables phase recording, full-profile export and
native tracing/sampling; it retains the established stats polling and local PSS
sampling. Scene preparation/countdown/startup remain in raw all-phase results.

Targets remain p95 <=16.7 ms, max <33 ms, zero rejects over >=900 seconds,
full input stream without host pump stalls, every class activating, <=192 MiB
PSS and <=8 MiB warm growth, <=52 MiB owned textures and <=32 MiB art.

## Measured causes and retained work

* **Native audio on the render thread:** baseline diagnostic audio p99
  15.748 ms, max 131.623 ms. A scheduler span spent 40.943 of 48.601 ms asleep
  in native audio. P1 moves playback to a bounded worker. A later native trace
  caught a remaining 60.692 ms producer wait on the worker monitor during ART
  JIT delay; P7 replaces that shared monitor with sixteen preallocated SPSC
  mailboxes. A repeated native trace finds zero worker-monitor contention,
  audio CPU p95 .375 ms and sleep p95 zero. Native onset and parameter delays,
  cancellation, failure, stale-onset and overflow counters remain visible.
* **HUD transport:** full unchanged metadata was approximately 25 KB per
  message per seat at ten Hz. Negotiated deltas average approximately 1.6 KB,
  refresh fully on phase/change/reconnect and every five seconds, and leave
  dynamic combat/speed data fresh. Legacy controllers still receive full HUD.
  Real socket reconnect tests and all six browser suites pass.
* **Render allocation:** desktop JFR and per-phase thread allocation identify
  audio pairs, lists, iterators and a floating-point range. Removing them
  reduces warm active audio average 532.127 to 8.609 bytes/frame, median/p95
  zero. Onsets/transitions still allocate. A changing-two-engine/parameter
  allocation test also passes with escape analysis disabled. Existing core
  steady-step zero-allocation and determinism tests remain intact.
* **Road-mark submission:** native samples identify immediate rectLine work.
  A bounded reusable GPU mesh preserves exact float vertex order and layer
  order. Desktop GL comparison of 1,000 random lines, including degenerate
  lines, under three transforms has zero differing pixels out of 196,608.
  Same-APK Stick comparison reduces mean render CPU 8.772 to 7.437 ms and
  cars/effects phase mean 3.313 to 2.212 ms. One additional draw batch is an
  explicit trade-off; no additional texture, reduced effect or changed art.
* **Input rejection:** reproduced pairs have 281–308 ms receive gaps while
  rendering continues. Parsing/offer/ack enqueue normally remain below 3 ms;
  sequence ordering is intact. Packets actually arrive past the unchanged
  250 ms freshness cutoff. TCP_NODELAY was already enabled at both ends.
  This localizes the long gap before application handling but does not
  distinguish Wi-Fi from the common transport selector. No timestamp, cutoff,
  acknowledgement or stale-consumption counter is altered to make it pass.

The rejection-triggered P8 native ring captures both complete 285-ms receive
gaps with seventeen render entries inside each (max 19.831 ms). No app GC
overlaps them; the longest app lock-contention span is .047 ms. First rejected
input age 255.753 ms, parse .735 ms, offer .333 ms, ack enqueue .296 ms. App CPU
is approximately 168 ms over that 285-ms interval across four cores. The host
has no pump/heartbeat stall, and its maximum GC over the diagnostic is 3.655 ms.
This rules out the recorded local locks, a whole-app GC pause, and host pumping
as causes of that specific gap. Kernel packet-arrival timestamps are missing,
so this still does not distinguish wireless delivery from the socket selector.
The full 900-second diagnostic records five rejects per seat; it is intrusive
and is not a frame qualification run.

## What profiling ruled out, and what remains costly

All retained active diagnostic frames have zero texture uploads. Owned
textures are 39.970 MiB, art 18.750 MiB; the pool stays within its 64 slots.
Atlas preparation is outside active racing. Preparation slices are a nominal
three-ms work budget, not an OS wall-time guarantee: observed maxima reach
31.368 ms under diagnostic load and readiness blocks countdown appropriately.
Smaller atlases cannot be justified as a cure for uploads that are not occurring.

Clear/acquire wall time includes dequeueBuffer waiting, not equivalent clear
CPU. Native resolution vsync/display scheduling reduces the observed frame
tail; a 720p arm gives no meaningful unique-frame p95 improvement (18.762 vs
18.683 ms). Native resolution is preserved. The exact-pixel mesh is the only
geometry trade-off. Phase diagrams retain HUD, scenery, simulation, effects,
telemetry and audio separately; nested native spans are not added together.

The baseline 20-second native trace uses 11.728 CPU seconds on GLThread,
9.160 on application DefaultDispatcher threads and 1.730 on AudioOut_D.
After mailboxes/cache/deltas, a different 20-second sample uses 10.518,
7.490 and 1.779 respectively, plus .583 on the audio worker. These are
different gameplay samples, not deterministic CPU A/B replays. The network
dispatcher and native mixer remain material. The native callgraphs are retained.

Android per-thread allocation is unsupported on this device and reports -1.
Desktop allocation is a proxy; process ART GC/allocation counters include
HTTP/diagnostics and concurrent collection. GC total time is not a pause
maximum. Entire-render zero allocation is **not** claimed: warm desktop
telemetry still averages about 5.8 KB/frame, scenery 120 bytes, cars/effects
about 496 bytes and HUD 64 bytes. The contractual core steady-step allocation
test is separate and remains green.

## Observer limits and failed experiments

* P0 standard baseline includes a brief one-second simpleperf capability check;
  P3 continuous/display and P7 profile include intrusive native captures.
* Phase JSON export has measured cost: a 207 KB snapshot took 281 ms and
  coincided with 5.07 MB process allocation. An extra full-ring read around
  02:29:46 UTC during P5 coincides with its largest timing cluster. All raw
  outliers remain; none of these diagnostic runs is presented as clean.
* The P6 low-latency Wi-Fi arm has zero rejects but a 13.629-second host pump
  stall. It fails input-stream and functional qualification. The held type-4
  lock proves a system request, not the driver effect. A subsequent short P8
  arm with that lock still rejects four inputs per seat at receive ages
  254–274 ms. It is not an established input fix.
* The first final-default run accepts all 26,990 inputs per seat, but a
  495.470-ms host pump stall invalidates its input-stream/functional gates.
  Its active p95/max are 20.920/44.729 ms. The later delivery run is reported
  separately; this failed attempt is retained in full.
* Independent ICMP captures had no loss but did not coincide with rejection.
  Host packet capture was unavailable; the precise LAN/selector boundary
  remains unresolved. No unsupported radio diagnosis is asserted.
* A zero-rejection 900-second run already occurred in the instrumented P0
  baseline before the fixes. Later zero runs are bounded observations, not
  causal proof that intermittent delivery gaps have been eliminated.
* Final stats follow a deliberate 500-ms ack drain after pumping stops. That
  quiet period produces stale consumption; the last loaded observation is
  preserved separately. Initial/lifecycle quiet periods are also visible.
* No physical phones, optical latency, listening, sofa feel or human art
  direction acceptance is inferred from scripted probes or screenshots.

## Final qualification

**Partial result: input, functional and memory gates pass; both frame gates fail.**

| Delivery observation | Result | Gate |
|---|---:|---|
| Duration | 900.189 s | PASS |
| Inputs, each controller | 27,006 sent / accepted; zero rejected | PASS |
| Host pump / heartbeat stalls | 0 / 0; 30.0004 Hz per seat | PASS |
| Active windows | 612; worst p95 22.433 ms / max 54.923 ms | FAIL / FAIL |
| Six-live-car windows | 70; worst p95 22.433 ms / max 37.580 ms | FAIL / FAIL |
| PSS | 107.099-140.192 MiB; warm median change -26.302 MiB | PASS |
| Owned textures / art | 39.970 / 18.750 MiB | PASS |
| Functional probe | 16 rounds; all ten classes activated/reported ACTIVE | PASS |
| Thermal service samples | status 0 throughout | Observed |

Warm growth compares medians of the last and first three post-initial PSS
samples. Whole-process/all-phase histogram p95 is 18.7 ms; it has a different
scope and does not replace the active-window gate. All-phase max 288.857 ms
includes startup/preparation and remains in the raw data. The unprofiled
54.923-ms active maximum has no phase trace, so its precise cause is not
asserted from a different diagnostic capture.

Ack RTT p95/max is 61.000/105.906 ms; calibrated age at the server ack timestamp
is 10.402/49.363 ms. Before the deliberate end drain, input-consumption lifetime
p95 is 40.9/41.6 ms and max 73.928/74.850 ms for seats 1/2. Both ordering/drop
counters are zero. Stale-consumption totals 59/35 include initial/quiet periods;
the last loaded ten-second windows have zero stale consumption. Host GC max
is 3.855 ms. These are measured ages, not optical latency.

Audio stays enabled: 4,161 native starts, eight-voice high water, zero failed
starts/overflow, three stale queued onsets discarded and 22 cancelled starts.
Queue max 118.998 ms, native call max 81.827 ms, onset completion max 128.616 ms,
parameter queue max 179.498 ms. Decoded audio is 3,970,682 bytes within the
6-MiB budget. The 31 missing-cue requests are the already uncommissioned music
paths from X3, not a newly muted performance variant. Audible delay remains
an owner check.

Separate device/browser checks pass: six live cars and 168 art regions with
zero failures in actual racing and resumed captures; dropped connection
neutralizes throttle/fire/ability; both browsers reconnect and recalibrate.
Native active app tracks are 3 before Home, 0 on Home, and 6 after resume.
The optional type-4 Wi-Fi lock is held, absent while paused, and held after
resume. These checks are outside the soak. The owner-handoff script initially
missed an early PIN log after waiting for scenery; its retry polls and retains
the new-process PIN while waiting for listener/scenery readiness.


Selected delivery APK SHA-256:
`77d15b6e785753ee1a1f6799b540efd5a4641c0d5d32476464ad6dbe99f3b8c1`.
Normal launch uses native resolution, vsync requests, GL nice -4, the system's
main-thread priority, cached marks, audio mailboxes and negotiated HUD deltas.
There is no slot wait/spin, callback-priority override or Wi-Fi lock by default.
The final receipt has an empty intent-extra list. Optional experiments remain
available for reproduction, with bounds and logs.

All five 2/3/4/6/8-ms slot arms fail the frame gates; their worst active-window
p95/max pairs are 18.810/33.392, 19.915/33.970, 18.971/33.125,
19.778/35.562 and 20.592/36.011 ms. No extra latency/spin is retained merely to
make render-entry timestamps steadier. A native trace independently measures
callback lag p95 3.061 ms, max 6.400 ms. Frame phases can fit within a refresh
period while actual callback/wakeup/buffer timing still violates the gate.

## Remaining work and trade-offs

There is **no demonstrated art reduction that reaches the original targets**.
720p did not improve unique-frame p95, active atlas uploads are zero, and the
effect pool is bounded. Reducing textures, effects or sharpness without a
measured benefit would spend visual quality on an unproven cause. None is
applied. The exact-pixel mark cache is the measured art-preserving CPU saving.

The remaining frame work needs a scheduler/presentation-level investigation,
including actual presentation timestamps and an art-preserving batching/pacing
prototype. A larger frame budget or reduced cadence would change the stated
60-Hz goal and is not counted as a fix. No untested smaller atlas, lower
resolution or effect cap is advertised as sufficient.

For input robustness, capture kernel packet-arrival/selector readiness at a
rejection, then repeat the same APK on an isolated 5-GHz or wired LAN as a
controlled transport comparison. Those are follow-up experiments, not proven
fixes or changes made tonight. The application must continue rejecting genuinely
stale packets; accepting them or changing ack timing would hide latency.
Retain audio onset/parameter-delay counters and complete the listening check:
moving native calls off rendering trades blocking for visible asynchronous
delivery, and rare stale onsets can still be discarded.

## Truth tiers

| Tier | Evidence and boundary |
|---|---|
| Exists | Source and frozen delivery APK contain bounded audio mailboxes, HUD deltas, allocation cleanup, cached marks and reproducible diagnostics. |
| Valid | 136 core / 8 link / 27 game tests and APK assembly pass; core determinism/steady allocation, no-escape-analysis audio tests, exact-pixel audit and six browser suites pass. |
| Wired | Installed AFTKM APK hash matches the frozen artifact; normal launch has no intent extras; six-car/HUD/ability/audio activity and Home/reconnect behavior are observed on device. |
| Behaves | Final 900.189 s passes full-rate zero-rejection, functional and memory gates. Frame p95/max fail, and captured intermittent receive gaps in other runs remain unresolved. |
| Felt | Pending owner: physical phones, optical latency, listening, sofa readability and subjective art acceptance. Scripted behavior and screenshots are not substitutes. |

## Evidence and owner handoff

[Wave status](../DEATH-RIDE-PERF.md), [session log](PERF-SESSION.md), individual
P0–P8 designs, and [owner checks](../../../deathride/OWNER-CHECKS.md) provide
the per-wave record. Raw observations are archived byte-for-byte as gzip with
SHA-256 manifests; installed APK hashes are verified on the Stick before runs.

HTML evidence page:
`file:///C:/Users/kazda/kiro/firetv-deathride-perf/deathride/evidence/perf/index.html`

The original TV package comparison passes for code path, versions, install/update
times and signatures. The isolated default perf app is left in a fresh ready
lobby; its current pairing URL is recorded in
`deathride/evidence/perf/final/lifecycle/owner-ready.json`.
Nine local wave commits (P0-P8, with P7 completed before P6) retain the work.
No push was performed.
