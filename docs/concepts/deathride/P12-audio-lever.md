# P12 - What the game's sound costs on the Stick (measure only)

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/stack-grounded-opportunity-research-e48eb7ce`, cut from `deathride/main` e170d4e5 (P11).
Nothing a player hears changes: the default arm is today's sound, and only the perf package can pick another.

## Why

P11 ([P11-frame-tail.md](P11-frame-tail.md)) found that the platform audio pair takes 71-83% of the render thread's
preempted time in active frames over 33 ms. The pair is audioserver's `AudioOut_D` mixer and the Fire OS HAL `writer`,
both at nice -19, about 14,000 slices/s each. It uses 0.0% CPU while the game is silent. The 900 s soak still fails
I2: worst active p95 24.892 ms, max 79.493 ms. Changing the game's sound is an audio design decision under N3, and the
operator takes it. P12 gives him the figures.

## The switch (step 1, df31a677)

`AudioArm` (game/audio) has four values, applied in `GdxAudioBackend`, below the cue service and the audio worker:

| Arm | What changes at the platform | What stays |
|---|---|---|
| `full` (default) | nothing: today's backend | everything |
| `muted` | no Sound or Music is ever started (no `play`/`loop`/`setPitch`/`setPan`/`stop`) | cue flow, voices and handles, decoded sounds (same memory) |
| `capped` | at most 3 voices at once instead of 8; a 4th start is refused in `GdxAudioBackend.start` | cues, gains, assets |
| `still` | per-voice `setPitch`/`setPan` at most once per 200 ms (a start counts as one) | starts and stops |

Only the debuggable `dev.deathride.perf` launcher reads the intent extra `audioArm` (`perf-device.py --extra
audioArm=muted`). Every other package passes `full`; an unknown name throws at launch. A perf arm logs
`audio arm=<id>` and publishes its counters in `/stats` under `audio.backend.native`; `full` publishes nothing new.

`AudioArmTest` records a 67 s cue script from a simulated six-car race (the delivered manifest, cars 0 and 1 as the two
local seats), then replays it into the backend with libGDX's Sound/Music replaced by recorders:

| Replay of one script | Platform calls | play / loop | setPitch = setPan | stop | Peak playing | Starts refused |
|---|---:|---:|---:|---:|---:|---:|
| pre-change backend (verbatim copy) | 16,890 | 118 / 3 | 8,265 | 121 | 6 | 0 |
| `full` and the default constructor | 16,890, line for line, same SHA-256 `7678bc90...` | 118 / 3 | 8,265 | 121 | 6 | 0 |
| `muted` | 118 (59 loads + 59 disposals, as `full`) | 0 / 0 | 0 | 0 | 0 | 0 |
| `capped` | 14,178 | 80 / 3 | 6,947 | 83 | 3 | 38 |
| `still` | 1,622 | 118 / 3 | 631 (every one >= 200 ms after the last) | 121 | 6 | 0 |

Two mutations of the default arm fail the test: a cap of 5, and setPan before setPitch.

## The rule (fixed before the first Stick run)

- **Primary reading:** active frames over 33 ms in a profiled 360 s run (P11's `perf-p11.py` definition).
- **An arm beats full** on a reading when **both** of its runs read lower than **both** full runs. Anything else is
  "not shown".
- Worst active-window p95 and active frames over 20 ms are judged the same way. They are reported beside the primary
  reading and do not decide.
- **An arm clears the I2 frame limits** only if both its runs read worst p95 <= 16.7 ms and active max <= 33 ms.
- **Order:** the runs are interleaved full, muted, capped, still, full, muted, capped, still, so drift in host load or
  device temperature falls on every arm. Then comes one diagnostic run per arm, each carrying one 20 s atrace.
- **Validity:** a run counts only if its logcat and `/stats` show the arm it is filed under. A run that fails
  functionally is rerun, and the failure is kept.
- The rule is coded in `tools/perf-p12.py` (`RULE`).

P11's procedure is kept: `perf-device.py --profile --seconds 360` with `--warm-routes` and the five-course cycle,
two 30 Hz probe controllers, mines on, and the probe at AboveNormal. No threshold, clock, input rate, warm-up exclusion
or render scale changes. One APK serves all four arms; `full` runs without the extra, as production does. Besides
P11's counters, `perf-device.py` now reads `/proc/<pid>/task/<tid>/schedstat` (CPU, runqueue wait, slices) for the
audio pair's processes and the app. It reads them at the same two points as P11, before and after the probe, so it
measures slices/s per run without tracing.

## Results

Pending: the runs follow this commit.
