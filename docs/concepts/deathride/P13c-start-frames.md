# P13c - The last start frames over 100 ms (deferred publishes, and the switch gap traced)

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/codebase-static-analysis-sweep-14a0a539`, cut from `deathride/main` e4ec2163 (P13b merged). Every
figure below was measured in this session. Summaries are in `deathride/evidence/perf/p13c/`. Its `manifest.json` binds
the raw trace, logcats, APK, build and gate logs and helper scripts, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p13c/`. Nothing was pushed.

## Figures first

| Reading (P10 arm, 360 s, profiled) | P13 run 1 | P13 run 2 | **P13c run 1** | **P13c run 2** |
|---|---:|---:|---:|---:|
| Transition max, ms (bar: no frame over 100) | 186.1 | 117.2 | **111.1** | **112.0** |
| Transition windows over 100 ms | 31 of 57 | 32 of 58 | 36 of 58 | 23 of 56 |
| Renders over 100 ms that are request frames (requests phase over 60 ms) | 4 | 4 | 1 | **0** |
| Bake-phase gap (the GPU job below), ms | 102.6-112.4 | 100.1-108.5 | 101.0-102.9 | 101.0-112.0 |
| Car pick request, ms | 18.9-118.6 | 21.7-52.5 | 11.6-32.7 | 10.4-21.1 |
| `startRace` request, ms | 46.6-142.7 | 56.4-106.1 | 20.6-69.2 | 20.1-37.3 |
| `raceLaunch`, ms | 7.9-13.2 | 7.2-10.9 | 7.1-10.5 | 6.9-30.1 |
| Track request, ms | 28.6-72.1 | 11.5-71.9 | 14.3-72.3 | 18.1-65.7 |
| `finishRace` frame | 104.8 work | 105.6 work | no race finished | no race finished |
| Flush, one seat, ms (seat 0 / seat 1) | (in the request) | (in the request) | 11.0-51.8 / 11.2-61.2 | 9.4-54.3 / 9.5-46.8 |
| Deferred UI rebuild, ms | (in the request) | (in the request) | 0.5-17.8 (mean 2.1) | 0.5-4.9 (mean 1.8) |
| PSS, MiB | 154.5-188.7 | 171.7-197.8 | 159.0-190.4 | 164.4-197.8 |
| Rejected inputs / host pump stalls | 0/0 / 0 | 0/0 / 0 | 0/0 / 0 | 0/0 / 0 |
| Host CPU at start / end (16 logical) | 96-100% / 25-35% | 17-32% / 22-28% | 29-59% / 23-58% | 47-51% / 38-60% |

**Verdict on the bar: fail in both runs.** The phase that moved is the **request phase** of the start, car-pick and
track frames. `startRace` fell from 46.6-142.7 to 20.1-69.2 ms, a car pick from 18.9-118.6 to 10.4-32.7 ms, and no
start, car-pick or results frame is over 100 ms in either run. In run 2 the only frames over 100 ms are the four
bake-phase gaps. Run 2's per-round transition max is 93.4, 108.5, 109.0, 101.0, 112.0 and 92.1 ms: rounds 0 and 5
pass, rounds 1-4 miss only through the gap. The gap is a GPU job the driver runs 10 frames after a course switch's
texture uploads (traced below). It is driver work with no fix that avoids a design choice, so nothing was built for it.

The window counts follow the slow frames, not the bar. A 10 s window that holds one 101 ms frame counts as much as one
that holds a 186 ms frame. Run 1 has more windows over (36) than P13 run 1 (31) with a lower maximum: its gaps sit at
101-103 ms and three extra frames (below) land in the round-0 and round-5 windows.

## (A) The bake-phase gap, traced

`tools/perf-p13c-trace.py` is `perf-p11-trace.py` with a capture that waits for a course switch (`--wait switch`: a
race, then the end of that race, then trace at once). It adds a per-frame account of every interval over 100 ms: the
GL-thread sections (app `DR.*` phases, gfx slices, dalvik lock contention), sleep and waker, preemption, GC and other
app threads. One 14 s atrace (sched, freq, gfx, dalvik, app sections) was taken across the scrap -> foundry practice
switch in the lobby. It ran on the installed P13 APK in a diagnostic 150 s arm that was not graded. The gap predates
P13c.

The gap frame (trace second 1.582, interval 100.0 ms, 11 frames after the switch frame):

| Where the render thread was | ms |
|---|---:|
| Running (`DR.prepare` bake slice 3.8, HUD 2.4, the rest under 1) | 8.2 |
| **Asleep in `eglSwapBuffers` -> `queueBuffer`** | **91.5** |
| Preempted (sf, display irq) | 0.3 |
| GC overlapping the frame | none |
| Lock contention | none |

The `queueBuffer` binder call returns only when the GPU finishes the previous frame. That frame's completion fence
(`waiting for GPU completion 75`) took **108.0 ms**. The 12 frames before it took 4.1-7.7 ms, and the trace's median is
4.5 ms. Meanwhile each of the four CPUs was 43-60 ms idle of the 100. SurfaceFlinger polled `!fenceHasSignaled()` on
the app's buffer until the fence signalled at 1.6814 s, and the render thread woke 0.1 ms later. The CPU slice that
queued that GPU job was an ordinary bake slice: prepare 3.6 ms, 7 draws, 0 texture uploads.

The same frame is slow every time. From the per-frame `/profile` rows, the slow interval falls **11 frames after the
course-switch frame** (so the GPU job is the 10th frame's) in **all 22 switches measured**: P13 run 1 and run 2 (5
each), the diagnostic run (2) and P13c run 1 and run 2 (5 each). The frame before it does different CPU work each time
(prepare 3.1-24.5 ms, any course, any bake stage). The switch frame is the only one with texture uploads: 4, the
region's 19.66 MB of tiles that `AtlasArt.selectRegion` uploads in place of the previous region's 4, which it disposes.
`gap-attribution.json` holds the table.

**Attribution: GPU-driver work, triggered by the app's region-texture replacement and run on the driver's own
schedule 10 frames later.** It is not the render thread's CPU, not a GC, not a lock and not preemption. The trace cannot
split the 108 ms between the 4 texture deletes and the 4 uploads: the driver's work is not visible in sched/gfx.
Nothing was built for (A), because each fix in reach needs a design choice:
- Keep the old textures alive past the driver's window. This raises the texture budget peak by 19.66 MB.
- Spread the 4 uploads over the bake's frames. `TrackScene`'s live road is keyed by `Texture` objects at construction,
  so this means restructuring the scene. The 10-frame delay also suggests the cost does not follow the upload frame,
  so the gain is unproven.

A second trace finding, outside the transition windows: two GPU fences of 627.7 and 231.5 ms at trace second 8.8-9.1,
during the race (`DR.clear` -> `dequeueBuffer` 54.7 ms, NetworkStats on the CPUs). Not looked into.

## (B), (C), (D): the publish and UI shape (5bbf4fa2)

A request frame no longer builds a seat's garage, car and career JSON, and no longer rebuilds the UI.
`game/FramePublish.kt` is GL-free and shares RaceGame's profile and message arrays by reference.

- **`publishGarage(i)`** now marks seat i dirty (`FramePublish.publish`). Every caller is unchanged: `ProfileSaves`'
  `Hooks.publish`, `edit`, `beginStart`'s seat-0 notice, `pump`, `settle`, the purchases and the refusals. Two marks
  before a build build once.
- **`FramePublish.frame()`** runs first in `render()`, before `saves.pump()`, so the earliest it can run after a request
  is the next frame. It first runs a UI rebuild a request asked for. Then it builds **at most one** dirty seat, the
  lowest first, with the same builders in the same order: `DeathDuel.carJson`, `Garage.json(profile, shopMessage,
  saveStatus)`, `Career.json(profile, careerMessage)`, and `hostCareerJson` for seat 0. A seat's JSON reaches
  `/meta` one or two frames after the request. Each build logs `transition flush seat= ms=`.
- **The deferred UI rebuild** (`requestUi`, `transition uiDeferred ms=`) replaces the immediate `rebuildUi()` in four
  places: `Hooks.changed` (beginStart's notice, a ticket or settle completion, `dropStart`), `launchRace`,
  `finishRace` and the track switch. Any `rebuildUi()` clears a pending request, including the 10 Hz `uiStage` one.
  The 10 Hz cadence and the other `rebuildUi()` callers are unchanged: the scene-ready rebuild, `lobby`, `openGarage`,
  `openCareer` and mute.
- **`create()`** flushes both seats at once after loading the profiles (`flushAll`), so the server never serves the
  `{}` defaults past the first frame.
- Unchanged: `configureWorld`'s order (`sceneryReady=false` before the new track JSON), the ticket submits in
  `startRace`, and every save, ticket, settle and revert rule in `ProfileSaves` and `ProfileWriter`. Nothing in RaceGame
  reads `carJson`, `garageJson`, `careerJson` or `hostCareerJson`; only the server's `/meta` and HUD readers do, on
  their own threads. So no same-frame flush was needed. `flush(seat)` exists for that case.
- **One visible difference, and why it is not a byte change.** A seat's JSON is now built from its state at the flush,
  not at the last `publishGarage` call. The builders and fields are the same. One case differs from the old timeline:
  `pump()` restores seat 0's career message after its tickets are durable without publishing again. Before, the phone
  kept `Saving race ticket...` until the next publish; now the flush after it carries the restored message.

### Tests (`FramePublishTest`, 7 cases, all pass)

| Case | What it shows |
|---|---|
| `twoPublishesOfASeatInOneFrameBuildItOnce` | Two marks, no build in the marking frame, one build in the next. |
| `aFrameBuildsAtMostOneSeat` | Seats 0 and 1 dirty: frame 1 builds seat 0, frame 2 seat 1, frame 3 nothing. |
| `theFlushedJsonIsByteIdenticalToAnImmediatePublish` | Car, garage and career bytes equal the builders' output for the same profile (two tickets, a car) and messages. |
| `aRequestFrameDoesNotRebuildTheUiAndTheNextFrameDoes` | `requestUi` in frame N: no rebuild in N, one in N+1, none in N+2. |
| `aRebuildBeforeTheNextFrameCoversTheRequest` | A 10 Hz rebuild after the request clears it. |
| `flushBuildsADirtySeatAtOnceAndOnlyThen` | `flush(seat)` builds a dirty seat now, a clean one never. |
| `aStartRequestFrameBuildsNoJsonAndNoUi` | RaceGame's wiring through `ProfileSaves`: a car pick and `beginStart` build no JSON and no UI in their frame. The next frame rebuilds the UI and builds seat 0 once, from its final state (the pick and `Saving race ticket...`). The frame after builds seat 1. |

Gate: `gradlew.bat :core:test :link:test :game:test`: core 247, link 20 (2 skipped, as on the base), game 92 (85 + 7).
GarageTest, ProfileSavesTest and every other test are unchanged. None needed a flush. One forced run after the Stick
runs failed once in `link` `TrackRequestTest` (a watcher-thread timing case; `link/` and `core/` are unchanged here),
with the host at 68-82% CPU. Three forced reruns of `:link:test` passed. See `tests.json`.

## Stick runs

One APK (`84f3cd355d46...`, built from 5bbf4fa2 with P12's recipe). Two consecutive runs of `tools/perf-device.py
--install --profile --warm-routes --tracks scrap-1-c,foundry-1-c,salt-1-b,switchback-1-a,crown-1-a --seconds 360`,
graded with the unchanged `tools/perf-p10.py`. `tools/perf-p13c.py` builds `comparison.json`. Before each run the
host had to stay under 60% CPU for 60 consecutive seconds. It settled after 577 s (run 1) and 311 s (run 2). Both
probes exited 0 (0/0 rejected inputs, 30.000 Hz, 0 host pump stalls), so no run was voided. `ws` 8.18.0 was copied from
the main checkout for the runs, gitignored, and removed afterwards. Neither run reached `finishRace`: every round ran
to the probe's 60 s cap and went back to the lobby. P13 saw one finished race per run. So the finish path (C) is
measured here only by the tests.

### Every render over 100 ms (probe time, after the probe started)

| Run | s | Work, ms | Interval, ms | Phase | Attribution |
|---|---:|---:|---:|---|---|
| 1 | 0.74 | 78.9 | 100.5 | sim 45.7, HUD 10.1 | The interval holds the previous frame (work 97.3: requests 62.9 = the deferred **flush of seat 1, 61.2 ms**, the run's first flush, next to a JIT compile of `ProfileCodec.decode`). Then three frames of lobby sim catch-up (32-46 ms). |
| 1 | 66.66, 134.19, 201.35, 269.02, 333.79 | 6.7-18.5 | 101.0-102.9 | prepare 3.3-3.6 | Bake-phase gap (A), 11 frames after each switch. |
| 1 | 333.42 | 110.0 | 35.7 | requests 102.9, 4 uploads | One frame held a **flush of seat 1 (40.4 ms, from the previous frame's car pick)**, seat 0's car pick (12.8 ms) and the scrap track switch (47.7 ms: scene construction 41.6, `selectRegion` 21.0). |
| 1 | 333.53 | 21.1 | 111.1 | - | The frame after it. |
| 2 | 66.55, 133.71, 200.63, 268.09 | 5.8-18.4 | 101.0-112.0 | prepare 3.2-4.7 | Bake-phase gap (A). |

Frames before the probe started (app start, -38 to -29 s) are outside every window and are listed in
`comparison.json`.

### What still exceeds 100 ms

1. **(A) The bake-phase gap, 101.0-112.0 ms, once per course switch.** It is GPU-driver work 10 frames after the
   region-texture replacement (above). It alone fails run 2 and rounds 1-4 of both runs. Not built: design choice
   (texture budget or scene restructure).
2. **A deferred flush landing on the next request frame** (run 1, 333.42 s, 110.0 ms). A seat's flush runs in the
   frame after its request, even when that frame has its own request. Here that was a car pick and a track switch. A
   flush costs 9.4-61.2 ms, and 40-61 ms for the first after a race.
3. **The first flush of a run** (run 1, 0.74 s, 61.2 ms) next to a JIT compile, followed by sim catch-up.
4. **The track switch** (D): scene construction 22.4-65.9 ms, with `transition track` up to 72.3 ms. No longer over
   100 ms on its own, because the UI rebuild left its frame. `CoursePrewarm`/`server.prepareTrack` already decode the
   region tiles off the render thread. What is left is `selectRegion`'s GL upload and `TrackScene`'s texture-keyed road
   geometry, which need GL objects. Covering it without a design choice was not possible, so it was reported, not
   fixed.

Items 2 and 3 follow from the shape the brief set ("at most one seat per frame, starting with the frame after the
request"). A flush that skipped any frame with its own request would remove item 2. Per the brief, no further fix was
built after the runs. This is a question for the App Master.

## Limits

One 14 s intrusive trace of one switch, on the P13 APK, in a diagnostic arm (probe exit 1, 2 rejected inputs while
tracing). The 10-frame offset is read from `/profile` rows of 22 switches, not traced each time. The GPU's own work is
invisible to sched/gfx: the attribution says which fence, not which driver task. Two profiled 360 s runs of one APK,
not a 900 s soak. No race finished in either run, so `finishRace`'s deferred rebuild is shown by tests only. Run 2's
PSS reached 197.8 MiB, over the I2 reference of 192 (as P13 run 2); no cause was looked for. Run 1's per-second settle
samples were overwritten by run 2's (a path slip in the waiter); its settled result, after 577 s, is kept in
`run1/settle.json`. No optical latency or owner feel. Nothing under `core/`, `app/`, `link/`, `desktop/`, `assets/` or
`art/` changed.

When the runs finished, `dev.deathride.perf` was force-stopped. The owner's `dev.deathride.tv` was back in front: the
same task t330 and process 14337 as at the start, and the package was last updated 2026-10-06 23:44, before this
session.
