# P7 — remove the measured audio-worker monitor stall

Design before implementation. P3's retained native scheduler trace catches
`DR.audio` at 2230925.854916 s: 61.509 ms wall, 0.593 ms CPU, 60.692 ms asleep.
ART identifies monitor contention in `QueuedAudioBackend.pending`, owned by
DeathRideAudio, while the worker is delayed around Object.wait/JIT code-cache
activity. Native calls were outside the application monitor, but that does
not make a shared monitor nonblocking. Exact excerpt is retained in
`p3/network/audio-wait-excerpt.txt`. The trace is intrusive; the causal lock
dependency itself is directly observed.

Use the existing single CueService producer and single native worker with
sixteen preallocated slots. Publish generation/start payload through a volatile
state; only the worker returns a slot to free. Stop is a volatile request.
Parameter updates use an odd/even revision snapshot: producer never waits,
worker retries later if a write overlaps. Park only the worker, outside any
monitor. Preserve start-age limit, visible dropped/cancelled starts, native
eight-voice cap and zero-allocation producer. Rotate parameter selection to
bound starvation under continuous updates. Tests must cover cancellation,
generation reuse, concurrent changing parameters, native blocking/failure,
short pending clips and allocation with escape analysis disabled.

## Results

All 136 core / 8 link / 27 game tests and APK assembly pass. New concurrent
parameter stress checks that eight voices receive coherent gain/pitch/pan
revisions and reach their final values. Existing blocking-native, saturation,
generation-reuse, cancellation, failure and pending-short-clip tests pass.
Both allocation tests also pass with escape analysis disabled. No callback
queue or command object is allocated by the producer.

The 20-second native trace contains 1,199 audio phases: wall p95/max .499/7.409 ms,
CPU p95/max .375/.644 ms, sleep p95 zero and max .869 ms. There are zero ART
monitor-contention records owned by DeathRideAudio. The largest audio span is
mostly runnable scheduler delay, not the removed producer/worker dependency.
The exact trace and native callgraph remain available; this is an intrusive
capture, not a blanket guarantee against OS stalls.

The 360.197-second diagnostic accepted all 10,806 inputs per seat. It contains
the native scheduler/simpleperf captures, and its 23.453/53.103 ms active-window
p95/max must not be presented as clean qualification. Frozen APK
`41d87f006d9b0ed3733f44fbe7eab62ebd080cb65c31556cc959f26e2167918c`
includes the optional P6 Wi-Fi experiment, disabled in this run. Subsequent
900-second P6 arms qualify the same runtime without phase/native observers.
All native latency/drop counters remain published. No art or input-policy
trade-off is part of this wave.
