# P10 - Race-start hitch: projection bins and region tiles off the render thread

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 /
private ADB 5041. Branch `autopilot/stack-grounded-opportunity-research-ae3015cf`, cut from
`deathride/main` c4763248 (P9). Every figure below was measured in this session. Evidence is in
`deathride/evidence/perf/p10/` (`manifest.json` binds the raw traces, logcats, build logs and both
APKs, which are kept outside git in `C:/Users/kazda/kiro/deathride-raw-evidence/p10/`). Nothing was
pushed.

## Reconciled first

`git log -15 deathride/main` ends at c4763248. No later commit bakes the bins off the render thread,
so the fix had to be built, not only measured. P9 had attributed the hitch to `Course.candidates`
(`by lazy` SYNCHRONIZED -> `bakeCandidates`). It was built by the first `course.project()` of each course
on the render thread, inside the scenery bake's landmarks step. On the diagnostic APK 41f0a14f that took
1,138.5-2,268.3 ms per first visit and 0.056 ms on a revisit.

## The change

**Bins (d3c68fec).** `Course.prewarmProjection()` forces the bins of a course and of every branch
alternative, and `projectionReady` reports when that is done. The lazy stays `SYNCHRONIZED`, so a
render-thread `project()` that arrives during an unfinished bake waits instead of racing.
`CoursePrewarm` is a single background thread at `NORM_PRIORITY-2` that builds and bakes only the
course about to be used, never the catalogue. The projection result is unchanged.

Every path that makes a course current, traced:

| Path | Before | Now |
|---|---|---|
| Phone `track` pick (RaceServer) | course built on the receive thread, bins on the render thread | `requestTrack`: worker builds and bakes, then sets `trackRequest`; a newer pick supersedes one still baking |
| Remote MENU (RaceGame) | `trackRequest.set` from the render thread; course and bins built on it | `requestTrack`, as above |
| App start, launch course | scene bake built the bins on the render thread | prewarmed at `RaceGame` construction (Android's UI thread) while `create()` loads fonts, audio and art |
| Career race start (`startRace(true)`) | course and bins built on the render thread at the countdown | the career screen (`openCareer`) prewarms the next event's course |
| Track preview (desktop tool) | as app start | the launch prewarm covers it (the preview course is `selectedTrack`) |
| `resume()`, `lobby()`, practice `startRace` | same course | same course, already baked |
| Any missed path | - | `TrackScene` gives back whole frames before its first projecting stage until the bins are ready. The simulation and the countdown already wait for `scene.ready`, so nothing else on the render thread projects onto a new course first |

The bake was not added inline in the `track` handler. That handler runs in the phone's websocket
receive loop, and a 1-2 s Stick bake there would have held that phone's inputs past the stale-input
limit.

Tests: `CoursePrewarmTest` (core) shows a prewarmed course projecting **bit-identically** to the lazy path
on 1,200 fixed points per course: s, distance, normal and route, with and without hints. It covers the five
soak courses and the two first playable courses with junctions. A fresh course does not bake at
construction, and the bake and its follow-up run on `deathride-course-bake`. `TrackRequestTest` (link)
holds the worker, sends two picks and an input, and checks three things: the input is acknowledged
while both picks wait; nothing is queued before its bake; only the newest pick is queued, with its bins
baked when it is.

**Diagnostics (0743d5b6).** One log line per lobby, track, car and start request, per `configureWorld`
(World construction, the rest of the setup, scene construction), and per profile save and garage
publish. There is nothing per frame and no change in behaviour. `TrackScene`'s bake line gains
`binWaitMs`/`binWaitFrames`.

**Region tiles (0ed2537e, step 3).** See below.

**Pick ordering (59f5605e).** With the bake on a worker, a pick is queued 0.1-2.3 s after it is sent. A
`start` sent inside that window ran first, and the pick, landing in the countdown, was dropped: the race
started on the old course. prep-run2 shows it, because the probe's round-0 pick never logged a track
transition. `RaceServer.trackPending` is now true from `requestTrack` until its task settles. The render
thread reads it before taking `trackRequest` and, while it is true, leaves the queued command (start,
lobby, garage, career) for a later frame. The remote's Enter queues a start instead of starting. Once the
pick lands, the same frame applies the pick and then the command. The game also skips preparing the region
of the course that is already selected.

## The arm

`tools/perf-device.py --install --profile --warm-routes --tracks scrap-1-c,foundry-1-c,salt-1-b,switchback-1-a,crown-1-a --seconds 360`,
twice back to back per APK. Each run covers the launch course racing (round 0), a first visit to each
other course, and a scrap revisit (6 rounds). `perf-device` now records host CPU at the start and end of
each run. The readings come from `tools/perf-p10.py` and `tools/perf-p10-compare.py`. The pass bar
is no frame over 100 ms in any lobby-to-race transition window (window `last10s` max, every window
that is not race second >= 10).

| APK | Code | SHA-256 |
|---|---|---|
| fix | d3c68fec + diag 0743d5b6 | `656c0d6f8aea2c1a...` |
| prep | + 0ed2537e | `d2f03ea7dd5ede0a...` |
| final (one confirmation run) | + 59f5605e | `93911607723bf410...` |

| Run | Host CPU at start / end (16 logical) | Transition max | Windows > 100 ms | PSS MiB | Rejected | Host pump stalls |
|---|---|---:|---:|---|---|---|
| P9 baseline (900 s) | 85-91% | 2,376.901 | - | 171.495-187.878 | 5 / 5 | 3 |
| P9 diag (360 s) | - | 2,272.752 | 42 | 155.489-176.370 | - | - |
| fix-run1 | 35-44% / 100% | **300.445** | 42 | 154.417-166.986 | 0 / 0 | 0 |
| fix-run2 | 100% / 100% | **245.805** | 41 | 161.872-175.077 | 0 / 0 | 4 |
| prep-run1 | 96-100% / 100% | **374.422** | 43 | 159.835-180.743 | 3 / 4 | 1 |
| prep-run2 | 100% / 100% | **335.885** | 42 | 162.372-187.371 | 0 / 0 | 1 |
| final-run1 | 100% / 100% | **308.366** | 41 | 165.186-170.025 | 0 / 0 | 0 |

**Verdict on the brief's bar: fail in all five runs.** The 1.1-2.3 s freeze is gone, but each run still
has 41-43 transition windows above 100 ms. The remaining slow frames are attributed below, with figures.
The transition max falls from 2,272.8-2,376.9 ms (P9) to 245.8-374.4 ms. The window count barely moves
because a 10 s window holds every frame of the lobby-to-race switch, and every switch still has at least
one profile-save frame over 100 ms.

## Result 1: the bin bake left the render thread

| Course | P9 diag first `project()` | fix-run1 | fix-run2 | prep-run1 | prep-run2 | Bin wait, all runs |
|---|---:|---:|---:|---:|---:|---|
| scrap-1-c (launch) | 1,138.5 | 0.379 | 0.383 | 0.377 | 0.389 | 0.0 ms, 0 frames |
| foundry-1-c | 1,372.2 | 0.070 | 0.081 | 0.070 | 0.098 | 0.0 |
| salt-1-b | 1,789.7 | 0.073 | 0.068 | 0.068 | 0.067 | 0.0 |
| switchback-1-a | 1,838.8 | 0.091 | 0.085 | 0.072 | 0.079 | 0.0 |
| crown-1-a | 2,268.3 | 0.036 | 0.035 | 0.051 | 0.034 | 0.0 |
| scrap-1-c revisit | 0.056 | 0.051 | 0.054 | 0.054 | 0.055 | 0.0 |

Milliseconds, on the render thread (TrackScene's landmarks timer). The slowest bake step is now
`kerbsBarriers` in every bake: 3.3-33.9 ms, against `landmarks` at 1,139.6-2,268.4 ms in P9. The launch
course has the largest slowest step, 30.3-33.9 ms, and it falls at app start, before the probe. No render
after the probe started spent more than 100 ms in the prepare (bake) phase. P9 diag had one such frame per
first visit. The bins were always ready before the scene needed them (bin wait 0 in 24 of 24 bakes). The
launch course's bins finished on the worker before `create()` reached the kerbs stage.

## Result 2: what still exceeds 100 ms

The request timers split the transition frames (ms, render thread, min-max per run):

| Request | fix-run1 | fix-run2 | prep-run1 | prep-run2 |
|---|---|---|---|---|
| One profile save (`ProfileStore.save`) | 49.5-133.3 | 51.6-123.6 | 60.0-156.1 | 56.2-121.3 |
| Its garage publish (Garage/Career JSON) | 9.3-26.3 | 10.0-30.5 | 11.1-58.3 | 8.2-45.4 |
| Car pick (one save + publish + reset) | 70.0-168.5 | 74.7-166.8 | 82.3-153.1 | 78.0-160.4 |
| `startRace` (two saves + world) | 144.5-281.6 | 149.4-236.7 | 166.1-366.5 | 154.3-303.3 |
| Track switch (whole request) | 13.4-156.7 | 12.1-169.0 | 20.2-71.7 | 28.9-61.0 |
| ... scene construction on a changed course | 73.5-149.4 | 75.6-162.0 | 16.7-64.5 | 21.5-51.9 |
| ... World construction and setup | 5.5-6.9 | 5.7-12.3 | 4.5-6.2 | 4.8-8.3 |
| `lobby` | 7.7-31.9 | 6.6-27.3 | 6.6-30.9 | 7.2-15.2 |

Every render over 100 ms after the probe started falls in one of three groups. Most are a car,
`startRace` or `finishRace` frame (12-14 per run in the requests phase). Some are a frame whose interval
includes such a frame (16-18 per run). The rest are car frames at 87.8-99.2 ms requests plus a simulation
catch-up (0-3 per run). One `finishRace` (prep-run1, 46.8 s) spent 231.6 ms in the simulation phase:
`Economy.settle`'s two saves run inside the sim block.

`ProfileStore.save` (core) encodes the profile, decode-verifies it, writes a temporary file and calls
`fd.sync()`. It then reads and decode-verifies the old save, copies it to a backup and makes an atomic
move. That durability work on the Stick's flash costs 50-156 ms, on the render thread, for every
car pick and twice for every race start and finish. **This is not fixed here.** The save is the money/data
path: the race ticket from `Economy.start` and the settled cash both depend on it completing. Moving it
to a writer thread changes when a save is known to have happened, which is an owner decision (see
questions). It also predates this work: P9's diagnostic APK already showed 159-336 ms requests-phase
frames on every switch.

## Step 3: region tiles prepared off the render thread (0ed2537e)

On the fix APK the track-switch frame was the last frame not caused by a save. Its whole request took
81.6-169.0 ms on a changed course. `selectRegion` was 61.4-117.1 ms wall of that, but only 4.0-6.9 ms
was GL upload. Its non-GL work is the materials manifest, each candidate's SHA-256, the PNG header check
and the PNG decode. That work now runs on the course worker after the bins and before the request is
queued (`RaceServer.prepareTrack` -> `AtlasArt.prepareRegion`). On the render thread, `selectRegion`
takes the preparation only if it matches the selection, then releases each old slot and uploads. The
texture data is the same managed, file-backed `FileTextureData` that `Texture(FileHandle)` builds, so
pixels and context recovery are unchanged. The IHDR size is still checked before decoding and residency
before upload, and a variant that cannot be made resident still falls back to the base tile. Any
mismatch takes the old synchronous path. The career screen prepares the next career region the same
way.

| Course (first visit) | P9 diag selectRegion (GL) | fix-run1 / fix-run2 | prep-run1 | prep-run2 |
|---|---|---|---|---|
| foundry-1-c | 90.8 (4.8) | 103.5 (6.4) / 85.7 (6.4) | **7.9 (4.9)** | **6.3 (3.4)** |
| salt-1-b | 106.1 (5.6) | 69.3 (4.2) / 73.6 (4.1) | **9.3 (3.8)** | **7.7 (4.5)** |
| switchback-1-a | 71.0 (4.9) | 71.6 (4.0) / 77.6 (4.5) | **7.1 (4.2)** | **10.8 (8.2)** |
| crown-1-a | 64.5 (4.9) | 61.4 (4.0) / 62.2 (4.0) | **5.8 (3.3)** | **10.3 (7.1)** |
| scrap-1-c revisit | 78.2 (4.9) | 71.8 (4.2) / 66.1 (5.5) | **16.5 (5.4)** | **10.8 (8.1)** |
| scrap-1-c launch (app start, synchronous) | 115.7 (7.6) | 116.6 (6.9) / 117.1 (5.2) | 127.9 (8.8) | 73.4 (7.9) |

Every switch after launch logged `prepared=true` with the same candidate count (3, or 4 on switchback)
and the same resident art bytes (19,660,800) as the fix APK. On a changed course the whole track
request fell from 81.6-169.0 ms (fix runs; four of ten switches were over 100 ms) to 23.2-71.7 ms, so after
step 3 no track switch exceeds 100 ms. The launch course is still
selected synchronously in `create()`. Its art does not exist before then, and that frame is app start,
not a transition. The step did not change the bar's verdict: the transition max stayed at 335.9-374.4 ms
because of the saves. That is a single-run comparison per APK on a host at 96-100% CPU. Real-GL
pixel equality of the prepared path was not re-checked on desktop (`desktop/` is outside this run's paths).
It rests on the identical `FileTextureData` construction and the identical candidates and bytes on the Stick.

## Bins memory (step 4)

Desktop JVM, exact ints held by one course's bins (`CoursePrewarmTest`, `evidence/perf/p10/bins.json`):

| Course | Ints held | Bin arrays | Retained (est.) |
|---|---:|---:|---:|
| scrap-1-c | 332,538 | 2,304 | 1.31 MiB |
| foundry-1-c | 421,862 | 2,688 | 1.66 MiB |
| salt-1-b | 545,012 | 3,584 | 2.15 MiB |
| switchback-1-a | 555,683 | 3,584 | 2.19 MiB |
| crown-1-a | 730,393 | 4,480 | 2.87 MiB |
| all five (a soak cycle) | 2,585,488 | 16,640 | 10.18 MiB |

The five courses have no branches. Bins persist for every course a process visits, so a five-course
soak holds about 10.2 MiB of them. P9's PSS rose 47.7 MiB above P8 without attribution, and these arrays
account for at most about 10 MiB of that. Their history does not make them a clear cause. 84e8b125 moved
from 20 m cells to 10 m coarse-to-fine bins (0.3M -> 0.7M ints per course, by its message), and before
54a66fcf every course baked its bins at class load. Not attributed, not changed. PSS ranges here were
154.4-187.4 MiB, under I2's 192 MiB, against P9's 171.5-187.9 (900 s) and 155.5-176.4 (360 s diag).

## Confirmation run on the final code (59f5605e)

One 360 s run of the final APK, the same arm. It confirms the ordering fix and is not a third measured
pair. All 6 picks logged a track transition before their `startRace`, including round 0's same-course
pick (11.7 ms), and the probe passed every functional assertion (exit 0: every class activated, 0/0
rejected inputs, 30.0004 Hz, 0 host stalls, with the host at 100% CPU). Render-thread first `project()`:
0.033-0.386 ms, bin wait 0. selectRegion on the five prepared switches: 6.3-12.4 ms (GL 3.8-7.0). Track
requests: 11.7-72.0 ms. Car picks: 70.1-131.3 ms. `startRace`: 139.6-273.5 ms (saves 50.2-107.7 ms).
Transition max: 308.4 ms. 41 windows over 100 ms. 12 requests-phase renders over 100 ms, none in the
bake phase. PSS 165.2-170.0 MiB. The same saves, the same verdict.

## Input and host

All three probe failures are host or LAN signatures, not Stick stalls.

- fix-run2 had 4 host pump stalls (154-835 ms), 1 in prep-run1 and 1 in prep-run2. All 6 start within
  0.6-1.3 s of the probe's own `dumpsys meminfo`/`thermalservice` sample, and the independent heartbeat
  isolate recorded 0 in every run. This is P9's finding again. The host was at 96-100% CPU from other
  sessions in every snapshot except fix-run1's start (35-44%), and fix-run1 is the run with no stall. The
  sampling was not moved (that is a separate run).
- prep-run1 rejected 3/4 inputs at 128.7-131.1 s, about 11 s into the salt-1-b race and away from any
  course-worker activity. Receive ages were 252.9-274.9 ms, the P6/P8/P9 receive-gap signature
  (252-303 ms).
- An 8 s Gradle compile ran on the host during fix-run2 at about 02:39:25Z. That run's first stall was at
  02:39:00Z.

## Failures kept

- Two combined gate runs on this branch failed timing-sensitive link socket tests on a loaded host. The
  first failed `CompactLinkTest` and `HiddenPhoneTest` while the core suite ran in parallel. A later one
  failed `HiddenPhoneTest` and `HudPayloadTest` (an idle heartbeat count over 3 s). The link suite alone
  passed every time. These tests run before `TrackRequestTest` in the link JVM and exercise no code this
  run changed. A combined run of the base c4763248 (a `git archive` export) passed link 18/18 once. The
  final combined runs on the final code are green; see `tests.json`.
- `TrackRequestTest` itself failed once on a server start that took over 10 s on the loaded host. Its start
  wait is now 60 s (59f5605e).
- This worktree has no `deathride/tools/node_modules`, so the probe's `ws` import failed to resolve.
  `ws` 8.18.0 (no dependencies) was copied from the main checkout for the runs, gitignored, and removed
  afterwards. The main checkout was only read.
- fix-run2, prep-run1 and prep-run2 exit 1 on the probe's own assertions (stalls, rejections), as above.

## Gates and limits

`gradlew.bat :core:test :link:test :game:test` on the final code is green: core 239, link 20 (2 skipped,
as before), game 71. Every run is listed in `evidence/perf/p10/tests.json`. The new tests are
`CoursePrewarmTest` (3) and `TrackRequestTest` (2).

Not measured: optical latency, owner feel, an unprofiled or 900 s run of this code, a cold device,
repeated-measures variance beyond two runs per APK, and a real-GL desktop check of the prepared region
path. No images were generated. No threshold, clock, input rate, warm-up exclusion, render scale or effect
changed, and nothing under `assets/`, `art/`, `app/`, `desktop/`, `tv-app/` or `desk/` was touched. When
the runs finished, `dev.deathride.perf` was stopped and the owner's `dev.deathride.tv` was brought back
to the front (same task t330 and process 14337 as at the start; package last updated 2026-10-06 23:44,
before this session).
