# P17 - What M1 goal 1's muted tail is made of on the Stick

2026-10-08, AFTKM `10.0.0.139:5555` (Android 11, PowerVR GE9215, display mode 3840x2160 at 59.94 Hz), isolated
`dev.deathride.perf` / 8772 / private ADB 5041. Branch `autopilot/stack-grounded-opportunity-research-c462db81`, cut from
`deathride/main` a060a47e (P16). Research only: nothing a player sees or hears changed, no card was built and nothing is graded.
Every figure below was measured in this session. Summaries are in `deathride/evidence/perf/p17/`. Its `manifest.json` binds the
raw logcats, `raw.json.gz` files, SurfaceFlinger dumps, the three atraces, build and gate logs, scripts and the APK, which are
kept outside git in `C:/Users/kazda/kiro/deathride-raw-evidence/p17/`. Nothing was pushed.

## Figures first

**The answer.** The muted window p95 is made of render-start jitter around the platform's vsync tick. It is not made of late
frames.

- The display presented on the next refresh at p95 in every active window.
- With only the on-time frames counted, the render-interval p95 is still 17.5-19.4 ms in every window.
- Jitter alone (class (a)) keeps **240 of 240 and 248 of 248 windows over 16.7 ms**.
- SurfaceFlinger's own `VSYNC-app` tick, which wakes the game's Choreographer, has an interval p95 of **16.736-16.739 ms**.
  27.4% of its intervals are over 16.7 ms.
- So the interval metric cannot reach 16.7 ms on this Stick even when every frame presents on time. That goes to the owner as
  a question (decisions section 10(c)). The bar, the metric, the rule and every I2 figure are unchanged.

### The two muted runs (deathride/main + the perf-only schedstat columns, `audioArm=muted`, P14's procedure, 360 s)

| Reading | muted-run1 | muted-run2 | P14 muted (f861f535) |
|---|---|---|---|
| Settled | no (two 900 s waits; host 94-100%) | no (two 900 s waits) | no settle (P12 procedure) |
| Host CPU at start / end | 73-82% / 63-98% | 82-97% / 65-78% | - |
| Active frames | 19,279 | 19,269 | - |
| Over 16.7 / 20 / 33 ms | 8,832 / **38** / **0** | 8,867 / **77** / **0** | - / 44, 45 / 0, 0 |
| Worst active-window p95 | **19.044 ms** | **19.388 ms** | 18.880 / 19.175 |
| Pooled active p95 / median | 18.175 / 16.679 ms | 18.275 / 16.680 ms | - |
| Window medians | 16.668-16.730 ms | 16.607-16.711 ms | - |
| Active max | 27.672 ms | 27.142 ms | 29.261 / 29.688 |
| PSS min-max | 159.9-172.1 MiB | 160.2-184.8 MiB | 166.1-180.5 / 161.1-190.5 |
| GCs / GC time / allocation | 35 / 2,510 ms / 2.589 MB/s | 38 / 2,209 ms / 2.587 MB/s | - |
| Render thread runnable (CPU held by another thread) | 15.8 ms per active s | 13.6 ms per active s | - |
| Rejected inputs | 0 / 0 | **4 / 5** (Wi-Fi stall at 297 s) | 0 / 0 |

Both runs are research, not a grade: neither settled, as the brief allows. muted-run2's probe exits 1 on the rejection
assertion only, which is P15's lane-C Wi-Fi stall. By the rule fixed in `perf-p17.py`, rejected inputs are recorded and do not
void a run.

### The window p95 decomposition (step 2)

Present times come from SurfaceFlinger (source below). Each slow interval (render interval over 16.7 ms) is put in one of two
classes by its present interval. Class (a), jitter, means it presented on the next refresh. Class (b), a missed refresh, means
its present interval was 1.5 periods or more.

| | muted-run1 | muted-run2 |
|---|---|---|
| Active windows (rebuilt on the device clock: match their own count / p95) | 240 (235 / 235) | 248 (244 / 245) |
| Render-interval window p95 | 17.543-19.044 ms | 17.850-19.388 ms |
| **Present-interval window p95** | **16.683 ms in every window** | **16.683 ms in every window** |
| On-time frames only, window p95 (class (b) removed) | 17.543-19.057 ms | 17.850-19.388 ms |
| Windows that class (a) alone keeps over 16.7 ms | **240 of 240** | **248 of 248** |
| Active present intervals of 0 / 1 / 2 refreshes | 94 / 19,090 / 90 | 85 / 19,102 / 82 |

The worst three windows of each run:

| Run | Window (s) | Render p95 | Present p95 | Over 16.7 ms | Class (a) | Class (b) |
|---|---|---:|---:|---:|---:|---:|
| muted-run1 | 194.1 | 18.645 | 16.683 | 308 | 307 | 1 |
| muted-run1 | 195.1 | 18.832 | 16.683 | 308 | 307 | 1 |
| muted-run1 | 196.1 | 19.044 | 16.683 | 305 | 304 | 1 |
| muted-run2 | 175.6 | 19.388 | 16.683 | 293 | 293 | 0 |
| muted-run2 | 176.6 | 19.388 | 16.683 | 293 | 293 | 0 |
| muted-run2 | 177.7 | 19.388 | 16.683 | 298 | 298 | 0 |

**Plainly: class (a) alone keeps the window p95 over 16.7 ms, in every window of both runs.**

- About 300 of each window's ~600 intervals are over 16.7 ms, and 1 or none of them missed a refresh.
- The p95 needs no more than 30 of them.
- Counterfactuals (`perf-p17-summary.py`, arithmetic on the measured intervals):

| Worst window p95 (windows over 16.7 ms) | muted-run1 | muted-run2 |
|---|---|---|
| Measured | 19.044 (240) | 19.388 (248) |
| Without every frame over 20 ms (set to one refresh) | 18.780 (240) | 19.199 (248) |
| Class (b) removed | 19.057 (240) | 19.388 (248) |
| **Class (a) set to one refresh** (every frame presented on time, no start jitter) | **16.689 (0)** | **16.686 (0)** |

**What the jitter is made of** (three whole 25 s atraces of the diag run, 4,494 frames):

- The game renders when SF's `VSYNC-app` timer ticks. The tick comes every **16.679 ms** (fitted 16.6795; p5 16.62, p95
  16.736-16.739, max 16.83). That is 0.02 ms under the bar, so a start only 0.02 ms later than the one before counts as over
  16.7 ms.
- After the tick, the main thread's Choreographer callback has a lag of p50 0.38-0.40 ms and **p95 2.36-2.52 ms**:
  - tick to wakeup: 0.12 ms;
  - wakeup to run: p95 1.93-2.01 ms. The CPUs were held mostly by `surfaceflinger` (RT), whose composition wakes on the same
    tick, then by the link threads and HwBinder;
  - run to callback: p95 0.90-2.11 ms.
- The GL thread then wakes and runs within 0.2 ms (p50).
- Across intervals over 16.7 ms, the time from vsync to start grows by 0.56-0.92 ms on average, and 0.17-0.48 ms of that is
  the callback lag.
- muted-run1's intervals over 16.7 ms are bimodal:
  - 5,185 of 8,806 are within 0.25 ms of the period;
  - 1,335 sit at +1.25 to +1.75 ms.
- In a back-pressure phase (trace 3), the start waits instead for the previous frame's buffer: callback to wakeup 5.8 ms (p50).

**The present-time source and its limit.**

- **Source:** `dumpsys SurfaceFlinger --latency "<the perf app's SurfaceView layer>"`, polled every 1.5 s on the device
  (`tools/perf-p17-present.py`). Its ring of 127 frames holds 2.13 s, so the polls overlap. Gaps: 1 (run 1), 0 (run 2), 0 (diag).
  - Chosen because it needs no app change, it gives each frame's queue, GPU-ready and present times on the profile rows' clock
    (CLOCK_MONOTONIC), and the join is exact: 0 SF frames fail the mapping check in runs 1-2, and 19,274 of 19,279 and 19,269 of
    19,269 active intervals have a present time.
  - Not chosen: `EGL_ANDROID_get_frame_timestamps` needs a native hook into libGDX's GLSurfaceView swap; Choreographer times are
    the tick, not the display.
- **Cost:** the poller and its `dumpsys` children used **3.53-3.57% of one core**, about 38 ms of CPU per dump at nice 0.
  SurfaceFlinger used 14.8-16.1% of a core during the runs. A 60 s calibration with the owner's app in front read 17.4% without
  polling and 16.1% with it, so no SF cost was measurable.
- **Refresh period, read from the device:** 16,683,350 ns. `dumpsys display`: active mode 6, 3840x2160 at 59.94 Hz,
  presentationDeadline 16,683,350 ns; SF's `--latency` header says the same.
- **Limit (found here):** SF's present times lie on an **exact 16,683,350 ns grid** (largest residual 0 ns over each whole run).
  They are a model's times, not measured fences, and SF itself composes on its own 16.679 ms timer.
  - So class (b) is read against a model. Render starts drift through that grid at -0.11 to -0.15 ms/s.
  - Each time they cross the refresh boundary (about every 72 s), a burst of 0- and 2-refresh pairs follows (90 / 82 of two,
    94 / 85 of zero).
  - Those frames' render intervals average 16.6-17.0 ms.
  - In the traces SF's own counters read **0 missed frames** (`PrevFrameMissed`, `PrevHwcFrameMissed`, `PrevGpuFrameMissed`)
    in 4,496 compositions, which held 48 class (b) frames.
  - Class (b) here is that beat, not frames the game was late for. Software on this Stick cannot read the panel's real
    cadence.

### The attribution (step 3): every active frame over 20 ms and every class (b) frame

The cause of each frame comes from the rule fixed in `perf-p17.py`:

- The interval's excess over its active medians is split by the schedstat columns into running, runnable and sleep.
- The largest of the three names the cause.
- A sleep is split further into GC, buffer dequeue or other.

**0 frames are unattributed**, in all three runs.

| Cause (frames over 20 ms) | muted-run1 | muted-run2 | diag (traced run, intrusive) |
|---|---:|---:|---:|
| sleep:dequeue (buffer back-pressure) | 12 | 21 | 29 |
| preempted (runnable, CPU held by another thread) | 11 | 11 | 23 |
| running:cars | 3 | 30 | 19 |
| running:hud | 5 | 2 | 9 |
| running:simulation | 4 | 6 | 3 |
| running:flushSwap (CPU in clear/swap) | 3 | 2 | 3 |
| running:scenery | 0 | 2 | 5 |
| sleep:gc | 0 | 2 | 0 |
| sleep:other | 0 | 1 | 3 |
| running:telemetry | 0 | 0 | 1 |
| **total / unattributed** | **38 / 0** | **77 / 0** | **95 / 0** |
| class (a) / (b) | 38 / 0 | 76 / 1 | 92 / 3 |
| With a logged GC overlapping | 4 | 5 | 4 |
| With a /stats build inside (base rate 1.5% of active intervals) | 3 | 3 | 4 |
| With a /profile read inside | 0 | 1 | 1 |
| Mean interval / render work / thread CPU | 21.80 / 15.30 / 10.28 ms | 21.46 / 19.22 / 11.42 ms | 22.55 / 19.33 / 10.83 ms |
| Mean running / runnable / sleep | 11.10 / 2.35 / 8.35 ms | 12.20 / 1.79 / 7.47 ms | 11.66 / 2.08 / 8.81 ms |

**Class (b) frames** (90 / 82 / 77) are the model beat above. Their render intervals average 16.6 / 16.7 / 17.0 ms, their
off-CPU time is 0.3-1.3 ms, and each has a cause by the same rule (0 unattributed). The causes are spread: sleep:dequeue
28 / 29 / 25, running:simulation 23 / 14 / 14, running:cars 19 / 10 / 14, and others.

**Who held the CPU, and the finer cause, in the traces.** Three whole 25 s traces held 16 active frames over 20 ms. The
trace's cause category matches the profile's for 15 of them, and the profile labelled the 16th preempted where the trace's
largest single contributor was the dequeue sleep. Each frame's largest contributor (`traceDetail`):

| Largest contributor | Frames | Note |
|---|---:|---|
| running (on-CPU work) | 7 | 4 of them inside a concurrent GC (37-95 ms) |
| sleep in `dequeueBuffer` (8.2-9.6 ms) | 6 | woken by SurfaceFlinger's binder thread, or by a task the trace does not name |
| sleep on ART's JIT code cache lock (11.0, 14.7 ms) | 2 | woken by ART's Profile Saver; the profile labels these sleep:dequeue |
| sleep on the ClassLinker lock during a GC | 1 | |

- **Preemption:** SurfaceFlinger's RT threads (its `app` and `sf` vsync threads, Binder:424), the Wi-Fi driver's `hif_thread`
  (nice -10), the IME process (nice -10), kworkers and rcu_preempt. The app's link threads (nice 13) never preempted the render
  thread; they ran on the other CPUs.
- **GC:** 5 of the 16 frames overlapped a concurrent GC. In 2 of them the render thread also slept 4.2-4.7 ms on the
  large-object-space lock.
- **Audio:** the audio pair was idle (`AudioOut_D` and `writer` 0.0% of a core) in every run.
- **Link and Wi-Fi:** the link threads used 39-47% of a core and Wi-Fi sent 477-564 KB/s.
- **Memory pressure:** kswapd0 used 0.7-1.5% of a core and MemAvailable stayed 272-367 MiB.

**The foundry phase of run 2.** run 2's 30 running:cars frames are mostly one round: foundry-1-c held 38 of its 77 frames over
20 ms. Through that round the GL thread waited in the clear's buffer dequeue for a median **6.55 ms** a frame, against
0.65-0.76 ms in the other rounds. Render work was 15.29 ms against 8.75-10.39 ms, and GPU time 10.13 ms against 5.5-6.8 ms. In
run 1 the same course read 0.65 ms in the clear (GPU 9.01 ms). The cause of such a phase cannot be separated with these
readings, which hold no CPU or GPU frequency record (the traces did not carry `freq`).

### The PSS breakdown at each run's peak

From the probe's own `dumpsys meminfo` sample at the peak, compared with the lowest sample (MiB).

| Run | Peak (s) | TOTAL | Java heap | Native | Graphics (GL mtrack) | Code | Other + system + stack | Lowest TOTAL (s) | Java heap peak - lowest |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| muted-run1 | 0 (after the /routes warm-up) | **172.1** | 66.7 | 9.6 | 52.0 | 26.4 | 17.6 | 159.9 (336) | +7.3 |
| muted-run2 | 336 | **184.8** | 77.2 | 10.2 | 52.1 | 25.8 | 19.6 | 160.2 (4) | **+27.1** |
| diag | 300 | **182.8** | 73.8 | 10.1 | 52.0 | 27.1 | 19.7 | 167.2 (137) | +15.1 |

**Source:** the PSS line moves with the Java heap's GC cycle. That heap is uncollected garbage between concurrent GCs, from
2.59 MB/s of allocation. Graphics and native heap are flat. All three muted peaks are under 192 MiB. P16's base-run2 read
194.3 MiB with sound on, and that line goes with goal 1 (ruling 3) to the next goal-1 soak.

### The ranked cards (step 4)

The ledger is `.claude/scan-sweep/runs/research-2026-10-08-deathride-muted-tail/findings.jsonl`, with 12 cards (5 open, 7
declined), in the 10-06 format plus a rank. Its row in `open-backlogs.jsonl` is open. No card was built.

| Rank | Card | Share (figure) | Lane / size / risk | Disposition |
|---:|---|---|---|---|
| 1 | The platform's vsync tick sets the interval p95 | the whole p95: 240/240, 248/248 windows on class (a); tick p95 16.736-16.739 ms | C / S / 1 | declined (no lever; owner question) |
| 2 | Render start waits on the main thread's Choreographer callback; request the frame from a dedicated display-priority looper | callback lag p95 2.36-2.52 ms; 1,335 intervals in the +1.25-1.75 ms mode; cannot reach 16.7 (rank 1) | B / M / 3 | open |
| 3 | Buffer back-pressure (`dequeueBuffer` 8-9.6 ms) | 12 / 21 / 29 frames over 20 ms; worst window -0.187 / -0.086 ms; lever not named (research first) | B / L / 3 | open |
| 4 | Preemption by platform threads | 11 / 11 / 23 frames; worst window -0.173 / 0.000 ms | C / S / 1 | declined (no lever) |
| 5 | Java heap swing behind the PSS peak: allocation audit at a peak | Java heap +7.3 / +27.1 / +15.1 MiB at the peaks; 2.59 MB/s | B / M / 2 | open |
| 6 | **P16 card 1 re-graded for memory** (ruling 1) | font textures 5 -> 2 MiB: about -3 MiB of PSS (194.3 -> ~191.3 on P16's base-run2); HUD has no p95 share | B / S / 1 | open (settled pair, a new rule naming PSS max beside hudMs) |
| 7 | ART JIT code cache lock on the debuggable perf build | 2 of 16 traced frames over 20 ms (11.0, 14.7 ms sleeps); the shipped build is AOT | C / S / 1 | open (measurement) |
| 8 | On-CPU spikes spread over the phases | 15 / 42 / 40 frames; worst window -0.070 / 0.000 ms | C / S / 1 | declined |
| 9 | The probe's /stats load | 3 / 3 / 4 frames (2.6-5x base rate) | C / S / 1 | declined (section 7 ruling 2) |
| 10 | ART GC overlap | logged 4 / 5 / 4; traced 5 of 16; window 0.000 | C / S / 1 | declined (cut by card 5) |
| 11 | Class (b) in SF's present times | 90 / 82; SF missed counters 0 in 4,496 compositions | C / S / 1 | declined (artifact) |
| 12 | **Pixel-exact retained HUD chrome** (vertices kept; ruling 2) | running:hud 5 / 2 / 9 frames; worst window 0.000; ceiling -0.145 ms hudMs | B / M / 2 | declined (no HUD share) |

## Step 0 - the record

`DEATH-RIDE-DECISIONS-2026-10-07.md` section 10 (0bc84bf2) records three things:

- the owner's ruling of 2026-10-08 15:18Z: goal 1 keeps its bar; with sound on it is recorded as not met; one research run
  traces the muted tail; section 8 ruling 2 and section 9 ruling 3 are lifted;
- the App Master's three rulings on P16's questions;
- the reverse.

## Step 1 - the rule (before any run)

- **The rule.** `tools/perf-p17.py` (1e9aafae) was committed before the first run, with the shared readers in
  `tools/perf_p17_lib.py`, the SF poller in `tools/perf-p17-present.py` and the trace account in `tools/perf-p17-trace.py`.
  Its `RULE` string fixes:
  - the procedure and the settle;
  - the readings;
  - the classes (a) and (b) at 1.5 refresh periods;
  - the window rebuild;
  - the cause rule.
- **Added after muted-run1, descriptive only** (no class, cause or rule reading changed; each commit says so):
  - 3e9f09dc: dropped the SF frames queued after the last profile row (they had been counted as failed mapping checks), and
    added GPU time, queue-to-present, present intervals by refresh count, the grid residual and the render start's drift;
  - b65085a7, fc59f4c0, fe0567fa: the trace's start-delay split, the vsync tick, SF's counters, the main thread's callback and
    each frame's largest contributor;
  - 33802179: the summary's counterfactuals, with trace accounts limited to active frames.
- **Perf-only instrumentation (60456219), because FrameProfiler could not tell preemption from blocking.**
  - What: `schedRunMs` and `schedWaitMs`, read once a frame (at the row's begin) from the render thread's own
    `/proc/self/task/<tid>/schedstat` by `AndroidProfile`. They cover the same begin-to-begin interval as `intervalMs`, and the
    rest of the interval is sleep.
  - Where it runs: only when `MainActivity`'s `perfBuild` holds, which means debuggable and package `dev.deathride.perf`.
    Every other build passes `schedstat=false` and writes -1.
  - Test: `SchedProfileTest` (3 cases: the parser, the columns over a row's interval, off).
  - Release: see Gates.

## Steps 2-3 - the runs

Order: muted-run1, muted-run2, diag-muted (`runs-log.txt`). Every run used one APK, `perf.apk` (`be571718...`, 60456219), with
`--install` and `--extra audioArm=muted`.

| Run | Length | Settle | Host CPU start / end | Rounds | Exit |
|---|---|---|---|---|---|
| muted-run1 | 360.2 s | two 900 s waits, not settled (last minute 94-100%) | 73-82% / 63-98% | 6 | 0 |
| muted-run2 | 360.2 s | two 900 s waits, not settled | 82-97% / 65-78% | 6 | 1 (rejections only: 4 + 5 at 297 s, receive ages 254-256 ms) |
| diag-muted | 300.2 s | none (intrusive) | 100% / 100% | 5 | 0 |

- **The diag run** carried three atraces (sched, gfx, dalvik and the app's sections), each **25 s** at 16 MiB per CPU.
  - They started at 12 s into the first race, then 5 s after each previous capture.
  - **All three kept the whole capture:** every CPU's first event is within 1 ms of the start, and its last at 25.0 s.
  - Its figures are intrusive and are not I2 figures. Its one frame over 33 ms (81.8 ms) began 1.3 s after trace 2's last
    traced frame, while atrace stopped and compressed its buffer on the device.

## Failures and limits kept

- **Neither profiled run settled.**
  - The host was at 94-100% through all four waits, from other sessions' node processes. Both runs are kept as research with
    host CPU at start and end.
  - The I2 figures in this document are research readings, not grades.
  - Muted worst p95 here (19.044 / 19.388) brackets P14's 18.880 / 19.175.
- **muted-run2 refused 4 + 5 inputs at 297 s**, at receive ages of 254-256 ms. This is the Wi-Fi delivery stall (P15's
  lane-C card), and the run was kept by the rule.
- **The present-time source is a model.**
  - SF's present times are an exact arithmetic grid, so the panel's real cadence and any real missed scanout cannot be read by
    software on this Stick.
  - Class (b) here is the beat between that grid and SF's own 16.679 ms composition timer, and SF's own counters read 0 missed
    frames.
  - The class (a) count does not depend on this, because every window's present p95 is one period either way.
- **The poller cost 3.5% of a core** at nice 0 beside the probe, and the schedstat read adds one small file read per frame.
  Both runs carry both, so their tail figures are not P14's exact conditions.
- **The cause rule is a single label per frame.** Most slow frames have more than one contributor. The traces show that the
  profile's sleep:dequeue label also holds lock sleeps (the JIT code cache lock, the ClassLinker lock) that only a trace
  separates.
- **The perf package is debuggable**, so it runs JIT-only. The shipped package is AOT, and the JIT's share of the tail there is
  not measured (card 7).
- **Not measured:**
  - CPU and GPU frequency (no `freq` in the traces);
  - the panel's real refresh;
  - a sound-on run with present times;
  - an unprofiled run;
  - a 900 s run (forbidden).
- **The 1,369 SF frames queued after the last profile row** in run 1's first analysis were a tool error, fixed in 3e9f09dc
  before any figure here.

## Gates

- `gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain`. Both runs are in
  `evidence/perf/p17/tests.json`.
  - **Run 1** (b65085a7, code = 60456219, host at 100%) failed three link socket-timing tests: `CompactLinkTest`,
    `HiddenPhoneTest` and `HudPayloadTest`. link/ is untouched, so it was rerun unchanged, never edited.
  - **Run 2** (d220b38f, with the P17 evidence committed) is **green**: core 261 (`EvidenceRuleTest` included), link 29 (2
    skipped, as on the base), game 117 (114 + `SchedProfileTest` 3).
- **`assembleRelease` passed**, together with `:desktop:compileKotlin` (fc59f4c0, code = 60456219, 12 min 2 s, `e9c3d12d...`).
  - The release package is `dev.deathride.tracks` and is not debuggable.
  - **It carries the schedstat path inert, as P16's counters are:** the `AndroidProfile` class, the `/schedstat` string and the
    two column names are in its `classes.dex`.
  - `perfBuild` is false there, so it never opens the file and writes -1 in both columns when profiled.
  - Stripping the code from release needs a compile-time flag in `app/build.gradle.kts` or a debug source set, and both are
    outside this run's paths (question 5).
- **What did not change:**
  - any threshold, clock, physics, input rate, render scale, TextureBudget, I2 limit or audio default;
  - the grading in `perf-p10..p16.py`, `perf-device.py` and `settle.ps1` (a copy was used);
  - link/ and core/;
  - desk/, art/, assets, .ai/ and .personas/;
  - the 10-06 ledger.

## The device at the end

- The owner's `dev.deathride.tv` was in front before and after: the same task t330, activity record a03c5a7 and process 14337.
  Task size was 4, and the package was last updated 2026-10-06 23:44:23.
- `dev.deathride.perf` was force-stopped, and the restore intent was delivered to the running top-most instance.
- Both mixers were in standby and thermal status was 0 (`device-state-end.txt`).
- The poller's files were removed from `/data/local/tmp`. The `ws` module copied into the worktree for the probe (gitignored)
  was removed.

## Questions

1. **Goal 1's p95 cannot be reached by the interval metric on this Stick, even when every frame is on time (section 10(c)).**
   - SF's own `VSYNC-app` tick has an interval p95 of 16.736-16.739 ms, and 27.4% of its intervals exceed 16.7 ms.
   - Muted, every window's present p95 is one refresh, while class (a) jitter alone keeps 488 of 488 windows over 16.7 ms.
   - The bar stays. Does the owner want anything recorded beside it, such as the present-interval p95 or the tick's own p95 as
     a reference reading? Changing the metric is not proposed.
2. **Card 2** (a dedicated display-priority looper for the frame request) changes where the vsync callback runs, not the
   cadence. Is that within N3 and the frame-clock rule, so that a perf arm may be built and A/B'd?
3. **Card 7:** the muted arm needs the debuggable perf package, so the JIT's share cannot be read on an AOT build without a mute
   that does not depend on that gate. Does the App Master want such a measurement path?
4. **The next goal-1 soak's PSS line:** muted peaks were 172.1 / 184.8 / 182.8 MiB, all Java heap. Should card 5's allocation
   audit or card 6's re-grade come first?
5. **The schedstat columns in release.** They are inert in release, as P16's counters are, but present in its dex. Should a
   later run move `AndroidProfile`'s schedstat read behind a compile-time flag or into a debug source set (`app/build.gradle.kts`
   or `app/src/debug`, both outside P17's paths), so that release carries none of it?
