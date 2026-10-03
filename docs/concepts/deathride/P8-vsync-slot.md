# P8 — test a bounded render slot after vsync

Design before implementation. With vsync requests, cached geometry and audio
off-thread, render CPU is well inside a refresh period but actual entry p95
remains about 18.6 ms. Callback/wakeup variance remains visible. Test starting
render work at a fixed 2, 3 or 4 ms offset after the actual Choreographer vsync
timestamp. This is an actual wait before simulation/rendering, not a change to
the frame metric: RaceGame still measures real System.nanoTime at entry.

One reusable render runnable parks until 200 microseconds before its deadline,
then spins only that final bounded interval. It never holds an application
monitor while waiting. Late callbacks run immediately; no frame is hidden or
retimestamped. Trace the wait and callback lateness in diagnostic builds. This
trades up to 2–4 ms of scheduling delay and approximately 0.2 ms of active CPU
per frame for steadier starts. Measure input-consumption age and audio queues
as well as frame timing; no optical latency claim is possible. Native image
resolution and every effect remain unchanged. Keep it optional until measured.

The 2/3/4 ms arms fail the frame gates (worst active p95 18.810/19.915/18.971
ms; max 33.392/33.970/33.125 ms). Their unique-frame p95 improves, but extra
latency and spinning are not justified as a default by this result. Select
native-resolution vsync/display priority without a slot for final qualification.
Wi-Fi policy remains optional: the 3-ms lock arm still has four rejects/seat.

A 20-second view/scheduler trace observes app callback lag p95 3.061 ms,
max 6.400 ms (1,198 callbacks); seven arrive beyond the 4-ms slot. Slot wait
CPU p95 .178 ms and wall p95 3.702 ms are retained as explicit costs. The
rejections in this run precede the trace; do not attribute them to its spans.
Add an optional probe log event and a bounded native ring capture that stops
on the first rejected ack, after the clean run. This is intrusive diagnostic
work, not qualification, and never changes freshness or acknowledgement logic.

Follow-up experiment justified by the measured 6.4-ms callback lateness:
allow a 6/8-ms slot and an explicit display-priority UI callback thread, with
up to 500 us final spin. All are optional, native resolution is unchanged.
These trade CPU/power and up to eight ms actual scheduling delay for regularity;
they cannot hide that delay in input-consumption or frame metrics. Build only
after the clean soak, then compare short arms after the network ring completes.
Adopt a default only if data justifies it, followed by a fresh full qualification.

The first default qualification also reports a host-pump stall. Add bounded
host GC observations, immediate stall timestamps/CPU/memory, and an independent
50-ms heartbeat isolate before the next runs. Its missed-heartbeat records
distinguish a main-loop pause from a wider scheduling gap. These are diagnostic
records only: the ordinary 30-Hz generator, timestamp, cutoff, and fail-on-stall
contract remain unchanged. Do not change process priority or offload the pump
without evidence that those changes address the measured problem.

Live `ps` inspection finds the Fire OS foreground main thread already at nice
-10; requested Android DISPLAY is -4. Therefore the explicit callback-priority
arm is a lower-priority control on this device, not an assumed priority boost.
Retain actual thread priorities in each later receipt and assess the combined
slot arms as configured, without claiming that a priority increase caused them.

## Rejection-triggered scheduler evidence

The 900.158-second diagnostic sends 27,005 packets per seat at full rate;
five per seat are rejected. No host pump or independent heartbeat stalls;
226 host GCs have p95 1.489 ms, max 3.655 ms. The first rejection pair at
03:52:02.255 UTC triggers trace stop nine ms later. Both full receive gaps
are captured: 285.063/285.146 ms. There are seventeen render entries inside
each gap, max interval 19.831 ms. The first packet's measured age is 255.753
ms; parse .735 ms, offer .333 ms, ack enqueue .296 ms.

No captured app GC interval overlaps that gap. The longest overlapping app
lock-contention span is .047 ms. App CPU totals approximately 168 ms across
the four CPUs during the 285-ms wall interval. This rules out a whole-app GC
pause and the observed short handler locks as causes of this particular gap.
It still does not identify kernel packet arrival or which dispatcher is the
socket selector. The precise network/selector boundary remains open; rejecting
actually stale packets is correct. Do not claim a freshness/order fix that
the measurements do not support. Native tracing, build/report generation on
the host and trace export are all observer work in this diagnostic arm.

## Final selection

Callback DISPLAY control: active p95/max 20.848/38.248 ms. Combined 6-ms and
8-ms arms: 19.778/35.562 and 20.592/36.011 ms respectively. All have full-rate
inputs, zero rejects and no host stalls, but none is a 900-second qualification
or passes the frame gates. Actual main-thread nice is -4 in these explicit
controls, versus the system's -10 default; GL remains -4. No callback priority
override, slot wait/spin, Wi-Fi policy or resolution reduction is selected.

Delivery default is native-resolution vsync requests with GL display priority,
cached unchanged marks, bounded audio mailboxes, allocation cleanup and HUD
deltas. Required 136/8/27 tests and APK assembly pass. Frozen delivery source
APK SHA-256 `77d15b6e785753ee1a1f6799b540efd5a4641c0d5d32476464ad6dbe99f3b8c1`.
The final 900-second delivery run uses no intent extras or device phase/native
profilers. Host diagnostic records remain enabled without changing pumping.

## Delivery result and handoff

900.189 s, all 27,006 inputs per seat accepted at 30.0004 Hz, no pump/heartbeat
stalls, all ten classes exercised. Input/functional/memory/texture gates pass.
Active-window p95/max **22.433/54.923 ms**, six-live **22.433/37.580 ms**:
both frame targets still fail. Peak PSS 140.192 MiB; warm median change
-26.302 MiB; thermal service samples all zero. The exact unprofiled maximum
has no phase attribution; do not infer its cause from another capture.

Separate actual browser/device checks pass: six live cars, 168 regions with
no art failures, neutral controls after interruption, both reconnect/calibrate,
Home stops all native app tracks (3 active before, 0 on Home, 6 after resume),
and scenery/rendering recover. Optional Wi-Fi lock releases/reacquires. Original
TV package path/version/install/update/signature metadata matches the baseline.
Fresh default perf lobby is ready. The handoff helper initially missed an early
PIN log; it now polls/caches the new-process PIN alongside readiness.

Final report/HTML preserve every failure and the remaining network/presentation
work. No art reduction, cutoff change, fake timestamp or push. Owner feel and
listening remain unclaimed. This wave closes the timed pass with open frame
gates, not a claim that the complete performance objective was achieved.
