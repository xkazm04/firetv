# P12 - What the game's sound costs on the Stick (measure only)

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/stack-grounded-opportunity-research-e48eb7ce`, cut from `deathride/main` e170d4e5 (P11).
Nothing a player hears changes: the default arm is today's sound, and only the perf package can pick another.
Every figure below was measured in this session. Summaries are in `deathride/evidence/perf/p12/`; its `manifest.json`
binds the raw logcats, traces, device counters, APK and build/gate logs kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p12/`. Nothing was pushed.

## Figures first

One APK (`bf6a17bf...`, the switch on `deathride/main`) was used for all four arms. There were two profiled 360 s runs
per arm, interleaved, under the rule below, which was committed (0e320cc9) before the first run.

| Arm | Active frames over 33 ms (run 1 / 2) | Over 20 ms | Worst active p95, ms | Active max, ms | Audio pair CPU, % of a core (`AudioOut_D` / `writer`) | Pair slices/s each | Render thread runqueue wait, ms/s | Verdict |
|---|---|---|---|---|---|---|---|---|
| `full` (today) | **128 / 120** | 966 / 881 | 24.238 / 24.850 | 81.736 / 69.999 | 46.5-46.9 / 51.7-52.5 | 17,399-17,808 | 88.7 / 76.5 | - |
| `muted` | **3 / 1** | 138 / 137 | 19.434 / 19.451 | 71.545 / 34.913 | 0.0 / 0.0 | 0 | 13.4 / 12.4 | **beats full** on all three readings; does not clear I2 |
| `capped` (3 voices) | **200 / 107** | 1,019 / 757 | 41.732 / 24.870 | 240.852 / 79.884 | 45.8-47.3 / 47.9-50.9 | 15,990-17,020 | 85.5 / 73.0 | not shown |
| `still` (200 ms pitch/pan) | **170 / 113** | 1,040 / 889 | 30.059 / 23.920 | 87.516 / 87.694 | 47.4-47.5 / 53.0-53.2 | 18,002-18,038 | 83.2 / 75.9 | not shown |

What each arm buys against `full` (mean of two runs against the mean of the two full runs):

- **muted:** active frames over 33 ms -98.4% (124 -> 2); over 20 ms -85.1% (924 -> 138); worst p95 -20.8%
  (24.54 -> 19.44 ms). The render thread waits runnable 12-13 ms per second instead of 77-89. Even silent, the game
  still fails I2: worst p95 19.4 ms (limit 16.7) and max 71.5 ms in run 1 (limit 33). Run 2's max was 34.9 ms.
- **capped:** nothing shown. Over 33 ms +23.8%, over 20 ms -3.8%, worst p95 +35.7%; its two runs fall on both sides
  of full. The audio pair runs as with eight voices.
- **still:** nothing shown. Over 33 ms +14.1%, over 20 ms +4.4%, worst p95 +10.0%, and its runs again fall on both
  sides of full. Of the parameter calls, 92% were held (41,151-46,142 held, 3,438-3,885 applied per run), and the pair
  ran as before.

The finding: **the platform's cost is on or off, not per voice or per update.** While any sound plays, audioserver's
mixer and the Fire OS HAL writer each take about half a core in 16,000-18,000 slices per second, whether 3 or 8
voices play and whether pitch and pan move every frame or five times a second. When nothing plays, the mixer goes to
standby (`dumpsys media.audio_flinger`: `AudioOut_D` "Standby: yes", 0 active tracks) and the tail is gone.

## Why

P11 ([P11-frame-tail.md](P11-frame-tail.md)) found that the platform audio pair takes 71-83% of the render thread's
preempted time in active frames over 33 ms. The pair is audioserver's `AudioOut_D` mixer and the Fire OS HAL `writer`,
both at nice -19, about 14,000 slices/s each. It uses 0.0% CPU while the game is silent. The 900 s soak still fails
I2: worst active p95 24.892 ms, max 79.493 ms. Changing the game's sound is an audio design decision under N3, and the
operator takes it. P12 supplies the figures.

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
`RaceGame` takes the arm as a constructor parameter (default `full`) and hands it to the backend; the desktop launcher
does not pass one.

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

### The runs (interleaved, in this order)

| Run | Active frames | Over 33 ms | Over 20 ms | Worst p95 | Active max | Pair CPU % (`AudioOut_D` / `writer`) | Pair slices/s | Render runqueue wait ms/s | PSS MiB | Host CPU start / end (16 logical) |
|---|---:|---:|---:|---:|---:|---|---|---:|---|---|
| full-run1 | 18,938 | **128** | 966 | 24.238 | 81.736 | 46.54 / 51.69 | 17,450 / 17,399 | 88.66 | 167.1-198.5 | 43-86% / 36-66% |
| muted-run1 | 19,259 | **3** | 138 | 19.434 | 71.545 | 0.0 / 0.0 | 0 / 0 | 13.35 | 152.1-196.7 | 65-95% / 100% |
| capped-run1 | 18,797 | **200** | 1,019 | 41.732 | 240.852 | 47.30 / 50.86 | 17,020 / 16,975 | 85.46 | 141.6-196.7 | 95-98% / 99-100% |
| still-run1 | 18,839 | **170** | 1,040 | 30.059 | 87.516 | 47.43 / 53.04 | 18,002 / 18,002 | 83.17 | 154.0-184.7 | 100% / 69-87% |
| full-run2 | 18,943 | **120** | 881 | 24.850 | 69.999 | 46.91 / 52.53 | 17,808 / 17,762 | 76.53 | 173.6-198.3 | 40-57% / 84-100% |
| muted-run2 | 19,272 | **1** | 137 | 19.451 | 34.913 | 0.0 / 0.0 | 0 / 0 | 12.44 | 171.1-200.5 | 59-98% / 100% |
| capped-run2 | 19,048 | **107** | 757 | 24.870 | 79.884 | 45.80 / 47.88 | 16,032 / 15,990 | 72.98 | 153.2-179.0 | 100% / 96-100% |
| still-run2 (void) | 18,603 | 89 | 804 | 23.334 | 66.125 | 47.11 / 53.52 | 18,118 / 18,117 | 69.16 | 181.2-204.9 | 100% / 100% |
| still-run3 (rerun) | 18,976 | **113** | 889 | 23.920 | 87.694 | 47.50 / 53.20 | 18,038 / 18,037 | 75.89 | 165.6-200.4 | 100% / 100% |

All runs: 360.0-360.2 s (still-run2 363.6), 6 rounds, active median 16.62-16.76 ms, thermal status 0, 0 host pump
stalls, input 29.9999-30.0027 Hz per seat. Every run carried its arm: the startup log said `audio arm=<id>` for each
perf arm and nothing for `full`, and `/stats` `audio.backend.native.arm` agreed (the four diagnostic runs too). **still-run2 is void.** It failed
P11's zero-rejection gate: 4 + 5 inputs were rejected at receive ages of 256-268 ms in one burst at second 87, the
Wi-Fi delivery stall known since P0. Under the rule it was rerun as still-run3, after the diagnostic runs, so the
rerun is not interleaved. Its figures are kept above; it would not change the still verdict (89 is below both full
runs, but still-run1's 170 is above them).

The CPU and slice columns come from `/proc/<pid>/task/<tid>/schedstat`, read before and after the probe
(`perf-device.py`). P11's tick counters agree: AudioOut_D 45.6-47.3% and writer 47.6-52.9% with sound, 0.0% muted.
PSS crossed 192 MiB in seven of the nine runs, each time at the first sample, just after the `/routes` warm-up
(still-run2 also at second 304). That is P11's uncollected-heap question 3, and it appears in every arm.

### What the game's own audio did in each arm (final `/stats`)

| Arm | Cues played | Native voice starts | Refused | Peak native voices | Parameter calls applied / held | Game audio phase median, ms |
|---|---|---|---|---|---|---|
| full | 1,004 / 995 | 998 / 993 | 0 | 8 / 8 | all (not counted) | 0.176 / 0.164 |
| muted | 1,105 / 1,083 | 0 platform, 1,105 / 1,082 silent | 0 | 7 / 7 (silent) | 0 / 0 | 0.166 / 0.194 |
| capped | 1,681 / 1,528 | 700 / 680 | 978 / 845 | 3 / 3 | 38,361 / 38,375 applied | 0.152 / 0.155 |
| still | 1,034 / 1,125 | 1,030 / 1,119 | 0 | 7 / 8 | 3,438 / 3,885 applied, 41,151 / 46,142 held | 0.169 / 0.265 |

`capped` has a side effect of the cap living in `GdxAudioBackend.start`, as the brief placed it. The cue service does
not know about the cap, so a refused loop is played again on the next frame. That gives 845-978 refused starts and
1,528-1,681 cues played instead of about 1,000. The extra plays did not reach the render thread: the game audio phase
median is 0.152-0.155 ms against full's 0.164-0.176 ms. The platform figures say the same as the frame figures: with
three voices the pair runs as with eight.

### Where the render thread waited: one atrace per arm (diagnostic runs, intrusive)

Each diagnostic run (180 s, profiled) carried one 20 s atrace (sched, freq, gfx, dalvik, `DR.*`), started 12 s into
the first race, with `dumpsys media.audio_flinger` taken just after it. Traces with sound wrapped their buffers and kept
about 10.2-10.6 s. The muted trace kept all 20 s, because the audio pair's scheduler events are about half of a trace.
These frame counts are not I2 figures.

| Trace | Frames kept | Over 33 ms | Preempted by the audio pair in frames > 33 ms | ... in frames > 20 ms | Render thread preempted / wakeup wait, whole span | Pair in the trace (CPU, switch-ins/s) | Mixer |
|---|---:|---:|---|---|---|---|---|
| full | 575 (10.6 s) | 18 | 205.8 of 236.7 ms (87%) | 452.6 of 671.7 ms (67%) | 117.6 / 59.5 ms/s | 42.2-42.9%, 13,637-13,858 | active, 7 of 11 tracks |
| muted | 1,196 (20.0 s) | 1 | 0 of 0.2 ms | 0 of 6.9 ms | 11.9 / 6.2 ms/s | below 5% of a core (not listed) | standby, 0 of 4 |
| capped | 579 (10.2 s) | 9 | 129.5 of 137.7 ms (94%) | 227.5 of 286.8 ms (79%) | 84.0 / 40.5 ms/s | 43.7-44.6%, 14,102-14,310 | active, 4 of 8 |
| still | 543 (10.6 s) | 27 | 341.5 of 449.8 ms (76%) | 554.7 of 862.5 ms (64%) | 133.1 / 79.8 ms/s | 42.2-43.6%, 13,843-13,904 | active, 7 of 11 |

The traces reproduce P11 (71-83% there, 76-94% here, in frames over 33 ms) and add the muted control. Silent, the
render thread is almost never preempted. Its remaining slow frames are sleeps on the large-object-space lock during a
concurrent GC: 6 of the 7 frames over 20 ms overlap one, and they wait 32.7 ms in total on that lock. In the profiled
muted runs, 2 of the 4 frames over 33 ms overlap a logged GC, and the 71.5 ms frame spent 59.5 ms off-CPU in one.
The process allocated 8.0-8.2 MiB/s (full 7.7-7.8). With sound off, the next cause in line is GC, which P11's
`/stats` cut (allocation -55%) was aimed at.

The two slice counts measure different things. schedstat counts every time a thread is put on a CPU over the
whole probe: 16,000-18,000/s. The trace counts switch-ins over a 10 s window with tracing on: 13,600-14,300/s. Both
say the pair hands off thousands of times a second whenever an app stream is active.

## Failures and limits kept

- The first smoke run died at pairing. Other sessions keep the Stick's adbd logging (a stale `tcp:6666` forward on
  the default adb server is retried several times a second), so the 256 KiB main log spans about 3 minutes. The
  pairing line had turned over before the scenery was ready. `perf-device.py` now streams the startup log from just
  before the launch (20189c47). Nothing during the probe changed.
- still-run2 is void (input rejects, above), and its rerun was not interleaved.
- The diagnostic runs exit 1 on the class-coverage assertion only (180 s covers 3 rounds), as P11's diag did.
- Two valid runs per arm on one Stick, with the host at 40-100% CPU from other builders (recorded per run). The arms
  with sound vary a lot from run to run (over 33 ms: 107-200), so a small gain from `capped` or `still` could hide in
  that spread. The rule shows none. The platform counters, which vary little (pair 45.8-53.5% of a core), show
  none either.
- `capped` replays refused loops (above). A cap inside the cue service would choose which three voices play by
  priority and would not retry. Its platform cost would be the same, because the pair's load did not follow the voice
  count.
- **Not measured: what any arm sounds like.** No listening test was done, and this run cannot judge whether `capped`
  or `still` sounds different from today's mix. Also not measured: a single app-mixed stream, another Android output
  path (deep buffer, offload, AAudio), and an unprofiled run.
- PSS crossed 192 MiB in seven of nine runs (P11 question 3, unchanged).

## Gates

`gradlew.bat :core:test :link:test :game:test --console=plain` is green on the final commit: core 239, link 20
(2 skipped), game 76 (71 before plus 5 `AudioArmTest` cases). `tests.json` lists every run, including the base gate
on e170d4e5 and the mutation check. The default arm gives the platform the same calls as before, line for line; see
the replay table. No threshold, clock, input rate, warm-up exclusion or render scale changed. Nothing under `assets/`,
`art/`, `campaign/`, `desk/`, `tv-app/` or `desktop/` was touched. ProfileStore, Economy and every profile save call
site are unchanged, and the `/stats` cut cc882e7f was not re-landed.

When the runs finished, `dev.deathride.perf` was force-stopped and the owner's `dev.deathride.tv` brought back to the
front. The intent went to the running instance: task t330, activity record a03c5a7, process 14337 throughout,
package last updated 2026-10-06 23:44:23, before this session. With it in front the audio pair sat at 0.0% CPU
(`device-state.json`).

## Questions for the operator

1. **The audio choice (N3).** On the Stick the sound's frame cost is all or nothing:
   - **Keep today's sound** (`full`): 120-128 active frames over 33 ms per 360 s run, worst p95 24.2-24.9 ms, and
     the audio pair at about half a core each whenever anything plays.
   - **Fewer voices** (`capped`, 3 instead of 8): no gain shown (107-200 frames over 33 ms; pair unchanged).
   - **Calmer pitch/pan** (`still`, 5 updates a second instead of 60): no gain shown (113-170; pair unchanged).
   - **No sound** (`muted`, which silenced everything; for the race tail, silence while racing is what counts):
     1-3 frames over 33 ms (-98%), worst p95 19.4 ms (-21%), render thread preemption 10x lower. It still misses
     I2 (p95 limit 16.7 ms), and it removes every race sound, which N3 does not allow without your say.

   So no change to *how many* sounds play or *how often they move* buys frame time on this device. Only whether a
   stream is open does. I cannot judge whether `capped` or `still` sounds different, and this run did not listen.
2. **A follow-up measurement, if you want sound and frame time both.** The open lever is the output path, not the
   mix. Two perf-only arms would settle it: one silent app stream (does any open stream cost the same?), and one app
   mix-down to a single stream through another Android output mode. Both change the audio pipeline, so they need
   your go.
3. **With sound off, GC is next.** The muted tail sleeps on the GC's large-object lock (8.0-8.2 MiB/s allocated). The
   `/stats` cut (cc882e7f, allocation -55%) is still waiting for its longer A/B (P11 question 2).
4. **Evidence.** As in P10 and P11: summaries are committed, and the raw traces, logcats, counters and APK are kept
   outside git with their SHA-256. You have not ruled on evidence yet.
