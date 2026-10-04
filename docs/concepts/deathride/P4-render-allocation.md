# P4 — steady audio allocation

Design before implementation. P0's desktop per-thread allocation profile found
about 532 bytes per active audio update. Inspection of that measured phase finds
temporary local-driver lists, spatial Pairs and voice-list iterators/removal
lists on every frame. Replace those with two driver references, scalar spatial
outputs and indexed bounded voice scans. Retain cue arbitration, cooldowns,
event identities, mix, voice count and timing. Onset/transition bookkeeping
still allocates and must not be described as a zero-allocation renderer.

Test changing spatial gain/pitch and two local engines after warmup with the
JVM allocation counter; retain existing audio behavior, determinism and core
zero-allocation tests. Reprofile desktop and device separately. This is a
measured allocation reduction, not an assumed explanation for frame spikes.

## Results

Desktop warm active allocation: audio median/p95/mean 440/824/532.127 bytes
before, 0/0/8.609 after (3,679 versus 3,678 active samples after warmup). The
remaining maximum 2,424 bytes belongs to onset/transition bookkeeping, not a
claim of an allocation-free renderer. Telemetry remains about 5.87 KB/frame
amortized, scenery 120 bytes, cars/effects about 496 bytes, HUD 64 bytes.

An initial allocation test passed with escape analysis but a later run exposed
64 bytes/update from the low-health floating range. Replaced that range with
primitive comparisons. The dedicated spatial/two-driver test now passes with
`-XX:-DoEscapeAnalysis`; retain the failed build log under P5, which first
repeated it, rather than presenting only the successful attempt. Existing
behavior/core determinism and zero-allocation gates pass: 136 core, 8 link,
26 game tests and APK assembly.

The 360.117-second Stick run uses frozen APK
`2868f633d9a6ab87bb0fc9754b396ab911a3cacb3551be473d1828f336297ddd`,
with vsync/display scheduling and `roadMarks=immediate`. This combined APK
contains the following P5 cache experiment, explicitly disabled in this arm.
All 10,804 inputs per seat accepted. Warm active window p95/max 19.647/28.553 ms;
unique active-row p95 18.607 ms. Audio phase p95/p99/max .376/.967/9.781 ms.
PSS 127.979-139.010 MiB. This is a diagnostic duration, not the 900 s gate.
The older monitor handoff remains in this arm; P7 addresses its separately
observed rare stall. No art, cue arbitration or freshness policy change.
