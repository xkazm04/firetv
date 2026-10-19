# P11 - The Stick active-frame tail: an honest probe, the attribution, one cut, a 900 s soak

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/stack-grounded-opportunity-research-743e0e1e`, cut from `deathride/main` 4bbae5d2 (P10).
Every figure below was measured in this session. Evidence is in `deathride/evidence/perf/p11/`; its
`manifest.json` binds the raw traces, logcats, APKs and build/gate logs kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p11/`. Nothing was pushed.

## Figures first

**The I2 readings.** P11 baseline = two profiled 360 s runs of the deathride/main APK with the fixed probe.
Soak = one profiled 900 s run of the final APK (same code as deathride/main, see step 3).

| Reading | I2 limit | P10 (four 360 s) | P11 baseline (2 x 360 s) | P11 soak (900 s) | Soak |
|---|---|---|---|---|---|
| Worst active-window p95 | <= 16.7 ms | 22.3-26.3 | 23.078 / 24.102 | 24.892 | **fail** (also over G1 21.60) |
| Active max | <= 33 ms | 64.4-81.1 | 64.752 / 74.496 | 79.493 | **fail** |
| Active-window median | 16-18 ms | 16.65-16.73 | 16.661-16.706 | 16.653-16.698 | pass |
| PSS | < 192 MiB | 154.4-187.4 | 154.5-179.2 | 174.9-202.0 | **fail** |
| Warm PSS change | <= 8 MiB | - | +6.09 / +4.66 | -0.17 | pass |
| Rejected inputs | 0 | 0-4 per seat | 0 / 0 | 0 / 0 | pass |
| Input per seat | > 29 Hz | 30.0 | 30.0024-30.0025 | 29.9998 Hz | pass |
| Host pump stalls | 0 | 6 in 5 runs | 0 / 0 | 0 | pass |

**Where the tail comes from** (baseline runs; frames are active racing frames, phase race with the scene ready):

| | Run 1 | Run 2 |
|---|---:|---:|
| Active frames | 19,037 | 19,005 |
| Over 16.7 ms | 8,815 | 8,804 |
| Over 20 ms | 765 | 788 |
| Over 33 ms | 81 | 97 |
| Over 33 ms with the render thread off-CPU > 8 ms | 80 | 97 |
| Over 33 ms overlapping a logged ART GC | 18 | 20 |
| Profile saves (counted apart, none in an active frame) | 23, all followed by a frame > 33 ms | 23, likewise |

The render thread was not running for most of every slow frame. The scheduler traces (step 2) say what held
its CPU: the platform's audio pair (the audioserver mixer `AudioOut_D` and the audio HAL `writer` in
`fireos.hardware.audio.service`, both at nice -19) took 71% and 83% of its preempted time in frames over 33 ms.
The second largest cause is the probe's own `/stats` load on the Stick.

**The cut** (cc882e7f: `/stats` and `/profile` gzipped, `/stats` built in place) **was reverted** (e11edc7d):

| | Baseline run 1 / 2 | Cut run 1 / 2 |
|---|---|---|
| Worst active-window p95 (decides) | 23.078 / 24.102 | **26.965** / 22.335 |
| Active frames over 33 ms (decides) | 81 / 97 | **44 / 49** |
| Active max | 64.752 / 74.496 | 141.930 / 67.739 |
| Active frames over 20 ms | 765 / 788 | 487 / 568 |
| Pooled active interval p95 | 19.202 / 19.220 | 18.242 / 18.511 |
| Process allocation | 7.79 / 7.71 MB/s | 3.51 / 3.47 MB/s |
| ART GCs (runtime stats, 342 s) | 111 / 109 | 49 / 49 |
| PSS | 154.5-173.7 / 163.8-179.2 | 164.3-192.0 / 172.7-196.9 |
| NetworkStats CPU / Wi-Fi sent | 8.6% of a core / 472 KB/s (soak, no cut) | 2.8-2.9% / 155-157 KB/s |

The over-33 ms count fell by 40-55% in both cut runs. But cut run 1's worst window was worse than both baselines,
so the pre-registered rule says revert. Both cut runs also read PSS over 192 MiB. At first that looked like the
cut's doing, but the soak on the uncut APK read 202.0 MiB at the same first sample, so PSS does not tell the
two arms apart (step 3).

## Reconciled first

`git log -15 deathride/main` ends at 4bbae5d2 (the P10 ledger). No later commit moves the probe's sampling,
attributes the active tail or cuts it, so every step was done here. The ledger listed three cards as backlog that
had already landed on deathride/main: d47205a0 (`/stats` strings built on the reader thread), a7b22eb9 (HUD
text rebuilt only on a change) and 5e380025 (link threads below the render thread). P9 had already noted them.
They were not redone; P11 measures them on the Stick and settles them in the ledger (see the end).

The deathride/main APK built here (`6b303179...`) has the same 576 entries, byte for byte, as P10's final APK
(`93911607...`); only the zip packaging differs.

## Step 1: the probe samples memory in its own process (19ae1108)

In P9 and P10 every host pump stall (104.8-835.3 ms, 16 across eight runs) began 0.6-2 s after the probe's own
`adb shell dumpsys meminfo` / `dumpsys thermalservice` sample. That sample spawned, completed and logged on the
input pump's event loop, and the independent heartbeat isolate saw nothing.
`tools/perf-memory-sampler.mjs` now runs those two adb calls, their completion and the progress line in a child
process at Normal priority. The pump's loop sends a small request and gets a small acknowledgement, and the full
samples come back once, after pumping stops. When to sample (60 s cadence, plus one at start and one at end), the
commands, the parsing and the sample fields are unchanged. Each sample now also records when it was requested,
started and completed. No threshold, clock, input rate, warm-up exclusion, budget or reading definition changed.
`perf-device.py` now defaults to `--warm-routes` and the five-course cycle (scrap-1-c, foundry-1-c, salt-1-b,
switchback-1-a, crown-1-a). It also records Wi-Fi bytes and per-thread CPU ticks once before and once after
the probe (95eb46f1).

| Run (APK) | Length | Host CPU start / end (16 logical) | Samples (sampler time) | Pump stalls | Heartbeat stalls | Input per seat | Rejected |
|---|---:|---|---|---:|---:|---|---|
| base-run1 (main) | 360 s | 100% / 36-53% | 8 (293-353 ms) | 0 | 0 | 30.0025 Hz | 0 / 0 |
| base-run2 (main) | 360 s | 41-53% / 100% | 8 (261-739 ms) | 0 | 0 | 30.0024 Hz | 0 / 0 |
| diag (main, two atraces running) | 240 s | 98-100% / 100% | 6 (296-1,107 ms) | 0 | 0 | 30.0019 Hz | 0 / 0 |
| cut-run1 | 360 s | 52-75% / 46-77% | 8 (316-626 ms) | 0 | 0 | 30.0012 Hz | 0 / 0 |
| cut-run2 | 360 s | 70-87% / 95-97% | 8 (302-659 ms) | 0 | 0 | 30.0024 Hz | 0 / 0 |
| soak (final) | 900 s | 92-100% / 93-100% | 16 (273-1,688 ms) | 0 | 0 | 29.9998 Hz | 0 / 0 |

**Proof: 0 pump stalls in six runs (2,580 s of pumping), against 16 in P9-P10's eight**, including runs that started and ended
with the host at 100% CPU from other builders. The diag run exits 1 only because a 240 s run covers 8 of the 10
classes (`Every class activated`); its input stream passed.

## Step 2: attribution

### The phase timers (existing, `tools/perf-p11.py`)

A render's interval is the previous render's work plus the time until the next render starts (eglSwapBuffers and
the GL thread's own work). So each slow interval is charged to the previous row's phases: simulation, scenery,
cars (cars and effects), HUD (HUD and caption), telemetry (the 10 Hz stage), audio, requests, camera, and
flush/swap. Flush/swap is the clear, where a buffer dequeue blocks, plus the gap between renders. Each slow frame
goes to the category that exceeds its active median by the most.

| Dominant category | > 16.7 ms (run 1 / 2) | > 20 ms | > 33 ms |
|---|---|---|---|
| cars | 1,507 / 1,533 | 317 / 290 | **46 / 60** |
| simulation | 1,862 / 1,903 | 167 / 159 | **24 / 26** |
| HUD | 359 / 409 | 40 / 62 | 6 / 7 |
| audio (game audio update) | 114 / 121 | 13 / 19 | 3 / 2 |
| scenery | 328 / 502 | 67 / 106 | 1 / 1 |
| flush/swap | 4,277 / 4,050 | 150 / 140 | 1 / 1 |
| telemetry (the /stats or UI build on the render thread) | 339 / 255 | 9 / 10 | 0 / 0 |
| requests, camera, other | 29 / 31 | 2 / 2 | 0 / 0 |
| **total** | 8,815 / 8,804 | 765 / 788 | 81 / 97 |
| ... render thread off-CPU > 8 ms | 2,625 / 1,477 | 641 / 614 | 80 / 97 |
| ... overlapping a logged ART GC | 199 / 213 | 89 / 99 | 18 / 20 |

The over-16.7 ms count is mostly vsync jitter: the active median is 16.66-16.71 ms, so half of all intervals land
just over it, and those go to flush/swap. Over 33 ms, **no phase does a different job.** In those frames every
phase takes about four times its median. Thread CPU doubles, and the time off-CPU is larger still:

| ms, run 1 / 2 | Simulation | Cars | HUD | Scenery | Render work | Thread CPU | Off-CPU |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mean of the frames > 33 ms | 10.0 / 9.4 | 13.1 / 14.4 | 5.4 / 6.5 | 3.3 / 3.9 | 38.0 / 39.7 | 14.9 / 15.9 | 23.2 / 23.9 |
| Active median | 1.97 / 1.70 | 2.53 / 2.97 | 1.04 / 1.56 | 0.87 / 1.02 | 9.1 / 9.4 | 7.3 / 8.2 | - |

"Cars" leads only because it is the longest phase, so most of the wait falls inside it. The candidates the brief
named, checked one by one:

- **The /stats or telemetry build on the render thread: not a cause.** The telemetry phase median is 0.007 ms,
  and it leads in 0 of the 178 frames over 33 ms. d47205a0 already builds those strings on the reader thread.
- **HUD text rebuilds: not a cause.** HUD leads in 13 of 178, and each of those 13 had the thread off-CPU for
  16.6-40.7 ms.
- **ART GC: a contributor.** The process allocated 7.71-7.79 MB/s and ran 109-111 GCs per 342 s (9.8-10.2 s of
  GC time, runtime stats). 38 of 178 frames over 33 ms overlap one of the logged GCs (ART logs only the long
  ones, 58-60 per run), against 1.7% of all active frames. In the traces the render thread slept 11.9 and
  11.4 ms on the large-object-space lock held by the GC, across each trace's frames over 20 ms.
- **Simulation catch-up: not the cause.** Each of the 50 simulation-led frames over 33 ms had the thread
  off-CPU for 10.4 ms or more. They show the same shape as the others, not extra steps.
- **Link thread contention: not by preemption.** In the traces the link threads took 0 ms of the render
  thread's preempted time in frames over 33 ms, and 1.5 of 791 ms in frames over 20 ms. They did use 29.8% of
  a core over the soak, and they filled CPUs while it waited.

### What held the render thread's CPU: two atraces (`tools/perf-p11-trace.py`)

A third 240 s run of the deathride/main APK (diag) carried two 20 s atraces (sched, gfx, dalvik and the app's
`DR.*` sections), each started 12 s into a race. The trace is intrusive, so no I2 figure comes from that run.
After the buffer wrapped, each trace kept 10.1-10.4 s of frames (585 and 564).

| Frames over 33 ms | Trace 1 (12 frames) | Trace 2 (17 frames) |
|---|---:|---:|
| Running, ms per frame | 15.6 | 13.0 |
| Preempted (runnable, CPU taken) | 17.2 | 6.8 |
| Wakeup latency (woken, not yet running) | 5.8 | 20.4 |
| Sleeping (mostly in `dequeueBuffer`/`queueBuffer`: buffer back-pressure) | 4.6 | 15.6 |
| Preempted time taken by `writer` + `AudioOut_D` (nice -19) | 146.3 of 206.1 ms (71%) | 95.6 of 115.5 ms (83%) |
| ... by the app's JIT thread pool | 35.0 ms | 0 |
| Frames inside a NetworkStats poll | 6 of 12 (polls cover 13.3% of the span) | 4 of 17 (5.6%) |
| Frames overlapping a concurrent GC | 2 | 3 |

- **The audio pair.** `AudioOut_D` (audioserver's mixer) and `writer` (the Fire OS audio HAL) each ran 41-45% of
  a core in 13,600-14,600 slices per second, 28-32 µs each: a hand-off loop between the two threads. At nice -19
  their wakeups preempt the render thread (nice -4) whenever they share its CPU. `top` showed 58-61% and 50-53%
  of a core for them with six AI cars racing and no clients. With the owner's app in front and silent, after
  the runs, they used 0.0%.
- **NetworkStats polls.** system_server's NetworkStats thread burned 0.56-0.73 s of a core every ~7 s, each time
  about 1 s after an `android.fg` wakeup. That timing fits Android's data-usage alert (2 MiB by default), which
  re-polls stats. This is inferred, not traced to the alert. The probe re-reads the 77.5 KB `/stats` in a loop
  with a 160 ms pause; the phones' HUD stream is ~9.4 KB/s per seat.
- **The app's link threads.** `DefaultDispatcher` workers (nice 13) never preempted the render thread. While it
  waited, they were the largest CPU user beside the audio pair: 119-500 ms of CPU across the slow frames of a
  trace. They serve the probe's `/stats` and `/profile` reads and both phones' HUD and inputs.
- **Wakeup latency with a CPU idle.** About half of the waiting (150 of 276 ms, 255 of 463 ms) passed with some
  CPU idle. The scheduler did not move the render thread there at once.

**Ranking.** The largest attributed cause is preemption by the platform's audio pair. That is not app code and
lies outside this run's paths. The app could lower it only by changing how it outputs sound (fewer streams, a
different output path), which under N3 is an audio design decision (see questions). The largest cause the app
does own is the probe's `/stats` load: the NetworkStats polls it triggers, the link-thread CPU, and more than half
of the 7.7 MB/s that drives GC (the cut below removed 55% of it). Players' phones never request `/stats`; the probe reads it to steer and to record its
windows. So the cut took that one.

## Step 3: the cut and its A/B

**cc882e7f** (link only; the APK differs from the baseline in `classes4.dex` alone):

- `/stats` and `/profile` answer with gzip (BEST_SPEED) when the request accepts it. Node's fetch sends
  `gzip, deflate` and decodes transparently. Other readers get the same bytes and content type as before.
  77.5 KB -> ~14 KB on the wire.
- `statsJson` appends into one reused buffer instead of Kotlin templates. Android desugars each template into
  its own growing StringBuilder, and each slot object carries ~31 KB of career and garage JSON.
- `Distribution.json` sorts in a reused scratch array instead of a fresh 32 KB large object per call, which was
  made under the lock the render thread's `add()` takes.

**Equivalence, desktop:** `StatsJsonTest` kept the pre-cut `statsJson` and `Distribution` verbatim. On a populated
77 KB state it found the new text **byte-identical**: three clock values, a reused buffer, and `combatFull`
swapped. Distributions matched over 9,000 adds and three bin/capacity shapes. The gzipped `/stats` and
`/profile` decoded to the plain bodies (`/stats` with its two clock fields masked). A mutation (one field
appended as a float) failed the test. The link suite was green: 23 tests, 2 skipped.

**Keep rule, fixed before the cut arm ran** (in `perf-p11-compare.py`): keep only if each cut run beats both
baseline runs on worst active-window p95 and on active frames over 33 ms.

| Run | Worst active p95 | Over 33 ms | Active max | Over 20 ms | Allocation | GC lines | PSS MiB | Host CPU start / end |
|---|---:|---:|---:|---:|---:|---:|---|---|
| base-run1 | 23.078 | 81 | 64.752 | 765 | 7.79 MB/s | 60 | 154.5-173.7 | 100% / 36-53% |
| base-run2 | 24.102 | 97 | 74.496 | 788 | 7.71 MB/s | 58 | 163.8-179.2 | 41-53% / 100% |
| cut-run1 | **26.965** | 44 | 141.930 | 487 | 3.51 MB/s | 27 | 164.3-192.0 | 52-75% / 46-77% |
| cut-run2 | 22.335 | 49 | 67.739 | 568 | 3.47 MB/s | 29 | 172.7-196.9 | 70-87% / 95-97% |

**Verdict: not kept, reverted in e11edc7d.** Cut run 1's worst window was worse than both baselines. That
window held a burst of 47-142 ms frames around second 298; the 141.9 ms frame was 128.8 ms off-CPU, with no GC
overlap and no trace.

**A correction to the revert's message.** e11edc7d also blamed the cut for PSS over 192 MiB. In both cut runs the
first sample, taken just after the 17.5 MB `/routes` warm-up, held 76.8-77.4 MB of Dalvik heap, against 59.0-59.7
in the two baselines. The soak then ran the uncut APK and read **202.0 MiB with 78.7 MB of Dalvik heap at that same
first sample**. So whether a GC has run since the warm-up varies from run to run. It does not distinguish the
arms, and the revert rests on the p95 rule alone. Native heap after the first sample was 11.7-13.4 MB with the
cut, against 9.5-10.0 (baselines) and 9.2-11.2 (soak), possibly the per-request Deflater. That is small and
unproven.

What the cut did show, for the record: over-33 ms frames 81/97 -> 44/49 (-40% to -55%), over-20 ms -26% to -38%,
pooled active interval p95 19.20-19.22 -> 18.24-18.51 ms, allocation -55%, and GCs 109-111 -> 49. With the cut,
NetworkStats used 2.8-2.9% of a core over each run and the Stick's Wi-Fi sent 155-157 KB/s. The uncut soak used
8.6% and sent 472 KB/s (a different run: 900 s, same procedure). That supports the mechanism: fewer bytes, fewer
NetworkStats polls. The link threads' share did not fall: 33.9-48.5% of a core with the cut, 29.8% in the soak.
The cut goes back to the operator as a card with these figures. Its rule failed on one window of one run, and a
longer A/B (more runs, or a 900 s soak per arm) would settle it.

## Step 4: the 900 s soak (final APK `54161341...`, the deathride/main code)

`perf-device.py --install --profile --seconds 900` (default arm: `--warm-routes`, five-course cycle), at the same
I2 procedure as P9: two 30 Hz probe controllers, mines on, the probe at AboveNormal. The host was at 92-100% CPU
at both ends. 900.140 s, 14 rounds, all 10 classes, thermal status 0 throughout, functional pass (exit 0).

| I2 reading | Limit | Soak | Status |
|---|---|---|---|
| Worst active-window p95 (615 active windows) | <= 16.7 ms | 24.892 ms | **fail** (G1 21.60: fail) |
| Active max | <= 33 ms | 79.493 ms | **fail** |
| Active-window median | 16-18 ms | 16.653-16.698 ms | pass |
| PSS, 16 samples | < 192 MiB | 174.9-202.0 MiB | **fail** |
| Warm PSS change (first/last three non-start medians) | <= 8 MiB | -0.17 MiB | pass |
| Owned textures / art | 52 / 32 MiB | 39.97 / 18.75 MiB | pass |
| Rejected inputs | 0 | 0 / 0 (54,008 acks, RTT p95 19.96 ms) | pass |
| Input per seat | > 29 Hz | 29.9998 Hz | pass |
| Host pump stalls / heartbeat stalls | 0 | 0 / 0 | pass |

Also measured: six-live worst p95 22.570 ms, and the all-window max 252.2 ms (a transition window). There were
55 profile saves (45.4-130.1 ms), each followed by a frame over 33 ms (53 over 100 ms), none in an active frame.
The probe's memory samples took 273-1,688 ms each in the sampler, with the pump untouched.

PSS fails on two samples: 202.0 MiB at the first one, just after the `/routes` warm-up (Dalvik heap 78.7 MB), and
192.4 MiB at second 529 (Dalvik 66.4 MB). Graphics (GL mtrack) held at 52.5-52.7 MB and native heap at 8.9-11.2
MB. The excess is Java heap that a GC had not yet collected. The code is P10's final, byte for byte, and P10's
runs read 154.4-187.4 MiB (P9's 900 s soak 171.5-187.9). So this reads as GC-timing variance on the same code
rather than a regression. It is still a fail on I2's limit, reported as measured.

The soak's tail has the baseline's shape. 197 of 48,884 active frames ran over 33 ms: cars led 102, simulation
76, scenery 5, HUD 4, audio 4, flush/swap 2, telemetry 2, requests 1, camera 1. All 197 had the thread off-CPU
for more than 8 ms (24.5 ms on average, against 15.1 ms of thread CPU), and 22 overlapped a logged GC. Over
878.8 s the process allocated 8.22 MB/s and ran 285 GCs (24.6 s of GC time). The device counters agree with the
traces: the audio HAL `writer` used 53.7% of a core, `AudioOut_D` 47.9%, the render thread 47.7%, the link
threads 29.8% and NetworkStats 8.6%; Wi-Fi sent 472 KB/s.

## Failures and limits kept

- The diag run exits 1 on the class-coverage assertion only: 240 s covers 4 rounds and 8 of 10 classes.
- The atraces wrapped their 16 MB per-CPU buffers: each kept about 10.2 s of its 20 s. They are intrusive, so
  their frame counts are not I2 figures.
- GC overlap is time overlap. ART logs only long GCs, 58-60 of the 109-111 per run.
- Off-CPU time from the profile (work minus thread CPU) says that the thread was not running, not why; only the
  29 traced frames over 33 ms have a scheduler split.
- Two runs per arm, back to back, on a host shared with other builders (36-100% CPU at run edges, recorded per
  run). Run-to-run variation is not modelled beyond that.
- This worktree had no `deathride/tools/node_modules`. `ws` 8.18.0 was copied from the main checkout for the runs
  (gitignored) and removed afterwards; the main checkout was only read.
- Not measured: optical latency, owner feel, an unprofiled run, a cold device, the audio pair's cost with fewer
  streams, and the JIT's share in an AOT-compiled APK.

## Gates

`gradlew.bat :core:test :link:test :game:test --console=plain --rerun-tasks` on f28e5faa (the final code) is green:
core 239, link 20 (2 skipped), game 71. `tests.json` lists every run. No threshold, clock, input rate, warm-up
exclusion, render scale or effect changed, and nothing under `assets/`, `art/`, `app/`, `desktop/`, `tv-app/` or
`desk/` was touched. ProfileStore, Economy and every profile save call site are unchanged.

When the runs finished, `dev.deathride.perf` was force-stopped and the owner's `dev.deathride.tv` brought back to
the front. The intent went to the running instance: the same task t330 and activity record a03c5a7 as at the
start, process 14337 throughout, package last updated 2026-10-06 23:44:23 (before this session). With it in front,
the audio pair sat at 0.0% CPU (`device-state.json`).

## Questions for the operator

1. **The audio pair.** The largest cause of the active tail is platform code: audioserver's mixer and the Fire OS
   audio HAL hand off ~14,000 times a second each at nice -19 whenever the game plays sound. Lowering it means
   changing the game's audio output: fewer simultaneous SoundPool streams, a mix-down to one stream, or another
   output path. Under N3 that is an audio design decision, so it is left as a lane C card.
2. **The /stats cut.** Re-land cc882e7f, or measure it longer first? It cut the over-33 ms frames by 40-55%,
   allocation by 55% and NetworkStats CPU about 3x, but it failed the keep rule on one run's worst window. PSS turned
   out not to tell the arms apart.
3. **PSS on the I2 procedure.** The `/routes` warm-up leaves 17-20 MB of Java garbage that the first memory sample
   may or may not see. The soak and both cut runs crossed 192 MiB that way, and the soak once more at second 529.
   I2 forbids a forced GC. Should the start sample keep counting toward the PSS limit as it does now, or does the
   warm-up's transient need a ruling?
4. **The profile saves** (P10's open decision) remain: 23 per 360 s run and 55 in the soak, every one followed by
   a frame over 33 ms, none in an active frame.
5. **Evidence.** As P10: summaries are committed and raw traces/APKs are kept outside git with their SHA-256. The
   operator has not ruled on evidence yet.
