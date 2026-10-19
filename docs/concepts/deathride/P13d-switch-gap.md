# P13d - The course-switch gap: not the region tiles, the scenery bake

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11, PowerVR Rogue GE9215), isolated `dev.deathride.perf` / 8772 / private
ADB 5041. Branch `autopilot/stack-grounded-opportunity-research-4daeae1b`, cut from `deathride/main` b365b4e5 (P13c).
Every figure below was measured in this session. Summaries are in `deathride/evidence/perf/p13d/`. Its `manifest.json`
binds the raw logcats, `raw.json`, APKs, build and gate logs and scripts, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p13d/`. Nothing was pushed.

## Figures first

| Reading (P10 arm, 360 s, profiled) | P13c run 1 | P13c run 2 | **P13d run 1** | **P13d run 2** |
|---|---:|---:|---:|---:|
| Transition max, ms (bar: no frame over 100) | 111.1 | 112.0 | **136.7** | **177.9** |
| Transition windows over 100 ms | 36 of 58 | 23 of 56 | 19 of 55 | 30 of 56 |
| Interval 11 frames after each switch, ms | 101.0-102.9 | 101.0-112.0 | 99.3, 99.5, 110.7, 104.1, 93.4 | 108.2, 100.0, 110.5, 104.5, 102.4 |
| Car pick request, ms | 11.6-32.7 | 10.4-21.1 | 12.3-40.5 | 10.9-29.7 |
| `startRace` request, ms | 20.6-69.2 | 20.1-37.3 | 23.8-43.0 | 21.1-**145.9** |
| `raceLaunch`, ms | 7.1-10.5 | 6.9-30.1 | 6.6-10.2 | 6.5-11.5 |
| Track request, ms | 14.3-72.3 | 18.1-65.7 | 12.3-62.7 | 10.8-81.4 |
| Flush, one seat, ms (seat 0 / seat 1) | 11.0-51.8 / 11.2-61.2 | 9.4-54.3 / 9.5-46.8 | 9.3-73.6 / 9.8-90.8 | 11.1-45.0 / 11.3-28.5 |
| Flush on a request frame | 1 (110.0 ms frame) | 0 | **0 (by construction)** | **0 (by construction)** |
| PSS, MiB | 159.0-190.4 | 164.4-197.8 | 168.1-192.5 | 175.8-203.9 |
| Rejected inputs / host pump stalls | 0/0 / 0 | 0/0 / 0 | 0/0 / 0 | 0/0 / 0 |
| Host settle wait / CPU at start / end (16 logical) | 577 s / 29-59% / 23-58% | 311 s / 47-51% / 38-60% | 301 s / 20-26% / 41-46% | 76 s / 16-17% / 37-56% |

**Verdict on the bar: fail in both runs.** The gap after each course switch is unchanged, and it is not caused by the
region tiles. Ten diagnostic arms (below) show the GPU job follows the **scenery bake's rendering into the 2048 px
scenery FrameBuffer**: about 10 render passes into the bake, whatever the tiles do. Every fix the brief allowed acts on
the tiles, so per the brief **nothing was built for (A)**. The deferred-flush rule (step 3) was built and holds: no seat
was built on a request frame. Each run also has one frame over 100 ms at its first requests. Both are attributed to a
background GC and the JIT compile of `ProfileCodec.decode`, next to a first flush (run 1) or the first `startRace` (run 2).

## Step 0 - the premise, and the GL inventory

**Tile bytes.** `TextureBudget.TILE_EDGE` is 256, and `decodeTile` and `loadTexture` refuse a PNG header above it. All 16
region tiles in `assets/regions/` and all 11 `tile`-group base tiles are 256 x 256 RGBA (colour type 6). So a region
switch replaces **4 x 262,144 B = 1,048,576 B (1 MiB)**. The `19660800` in P13c's "4 region tiles, 19.66 MB" is
`textureBytes`, the **whole art residency**. The `art ready` and `regionMaterials` lines print it, unchanged across every
switch (`regionMaterials foundry:true candidates=3 bytes=19660800 prepared=true`). P13c's premise was wrong, as the
brief suspected. Keeping both tile sets alive would cost 1 MiB, not 19.66 MB.

**GL inventory.** `ProfileGl` now counts, per frame, every object created, deleted or re-specified: textures (gen,
delete, uploads and their bytes, mipmaps), buffers (gen, delete, data, sub-data and bytes), shaders and programs
(create, compile, link, delete), framebuffers (gen, bind, attach, delete), renderbuffers, flush, finish and readPixels.
RaceGame (profiled builds only) logs a `glInventory` line per frame for 20 frames from each course switch (k=0 is the
switch frame). P13d run 1, first switch:

| k | Interval, ms | Objects created / deleted / re-specified | Steady per-frame work |
|---:|---:|---|---|
| 0 | 40.8 | **4 `glGenTextures`, 4 `glDeleteTextures`, 4 uploads = 1,048,576 B** | 7 `glBufferData` (75 KB), 2 FBO binds, 2 clears |
| 1-10 | 84.2, then 11-18 | none | 7 `glBufferData` (72-89 KB), 2 FBO binds, 1 clear |
| **11** | **100.0** | none | 9 `glBufferData`, 2 FBO binds, 1 clear |
| 12-19 | 13-33 | none | 9-11 `glBufferData`, 2 FBO binds, 1 clear |

In the switch frame and the 19 frames after it, nothing else is created or deleted: no buffer, shader, program,
framebuffer or renderbuffer. The 2 FBO binds per frame are the bake's `FrameBuffer.begin/end` on the scenery target
(`SceneryCanvas.buffer`, 2048 x 2048 RGBA, created once and never re-created). The `glBufferData` calls are libGDX's
streamed vertex batches (`ShapeRenderer`, `SpriteBatch`). Outside the windows no frame of either run created or deleted
an object (`strayObjectFrames` 0).

## Step 1 - what triggers the GPU job: ten arms

`SwitchArm` is perf-only and **off by default**. As with P12's audio arm, only the debuggable `dev.deathride.perf`
launcher reads the intent extra `switchArm`, and an unknown value throws. Each arm ran about 3 lobby course switches
(`perf-device.py --profile --seconds 210 --extra switchArm=<arm>`). The intervals are read from the `glInventory`
lines (`tools/perf-p13d-arms.py`). A slow interval at k is the GPU job of frame k-1.

| Arm | What changes | Slow intervals (k: ms), per switch | Reading |
|---|---|---|---|
| off | Nothing (the shipping switch) | 11: 100.0 / 99.9 / 100.7 | Reproduces P13c. |
| delay | Old tiles deleted 60 frames later, one per frame | switch 11: 108.4 / 99.7 / 102.1; release windows: none (max 15.9-34.2) | **Not the delete.** |
| skip | No tile deleted or uploaded at all (diagnostic) | 11: 107.4 / 100.5 / 101.9 | **Not the tiles.** |
| early | Tiles uploaded when the pick lands; switch 30 frames later | stage windows: none (max 18-38); switch 11: 107.9 / 108.8 / 101.5 | Follows the switch, not the upload. |
| reuse | New pixels uploaded into the old texture objects | 11: 108.1 / 101.5 / 101.9 | Not the object churn. |
| holdbake | Bake starts 30 frames after the switch (diagnostic) | switch windows: none; bake window **12**: 106.9 / 99.9 / 110.7 | **Follows the bake** (its first pass is at k=1 of that window). |
| flush | `glFlush` after each bake slice | **7**: 101.8 / 100.9 / 101.6 | Earlier, not smaller. |
| flushbound | `glFlush` before `FrameBuffer.end` | **7**: 101.2 / 100.9 / 102.0 | The same. |
| halfslice | Half the per-slice bake budget (diagnostic) | 11: 101.9 / 108.9 / 110.3 | Twice the passes (scrap 130 -> 178), same k: counts passes, not work. |
| noclear | First pass fills an opaque rect instead of `glClear` | 11: 114.4 / 107.4 / 100.2 | Not the clear. |

One noclear run was voided: `perf-device.py` polled `pidof` before the process existed, and the app had started. It was
rerun. `arms.json` holds every window's intervals and objects.

**Attribution.** The GPU job is set off by the scenery bake. It starts at the bake's first pass into the scenery target,
not the switch: holdbake moves it 30 frames with the bake. It lands about 10 passes in (6 with a `glFlush` per slice),
whether the slices are full or half size, and whether the target was cleared or painted. Its length is close to fixed:
**93.4-114.4 ms** in 40 switches across the arms and runs, 21 of them at 99.7-102.4 ms. That looks like a driver
wait with a timeout, not like work that scales with the bake. It is not the region textures: deleting them later,
uploading them earlier, reusing their objects or not touching them at all leaves it in place. It is not a write-after-read
on the target either: in holdbake nothing had sampled the target for 30 frames. What the PowerVR driver does at that
point is not visible to the app or to sched/gfx (P13c's trace: the render thread waits 91.5 ms in `queueBuffer` on the
previous frame's fence).

## Step 2 - the fix: none built for (A)

The brief allowed three fixes, all on the tiles: keep the old tiles for a bounded number of frames, reuse their texture
objects, or move or spread the uploads. delay, reuse and early are exactly those three, and skip removes the tiles
altogether. None moved the gap. The only lever the arms found is the bake's FBO rendering itself: when the bake starts,
and how its passes are submitted. A change there is outside the allowed list. It is a design choice on `TrackScene`'s
bake and the scenery target, so per the brief nothing was built and the evidence is reported. The App Master's
questions are in the result. The candidates the arms suggest, none tried as a fix:
- **Bake the next course's scenery before the switch frame**, e.g. while the pick is on the course worker or during
  the results screen. The job would then land outside the lobby-to-race window only if the bake itself runs outside a
  transition window. Every lobby frame is in one today (perf-p10 grades every non-active window).
- **Bake in fewer passes** (a larger slice budget). halfslice shows the job follows the pass count, so 10 passes is the
  trigger. A bake of 10 passes or fewer may never set it off, at a higher per-frame cost (P13 bounded slices for the
  start hitch).
- **A second scenery target** (bake into a spare, then swap). This is 16 MiB more, which TextureBudget's SCENERY 16 MiB
  forbids.

What was built for the arms is kept, off by default: `TileRelease` (GL-free hold-and-release, used by the delay arm),
`AtlasArt.frame`, `stageRegion` and `peakTextureBytes`, and the `glInventory` lines. With the arm off the switch is
byte-for-byte today's: replaced tiles are disposed in the switch frame (`TileRelease` with a hold of 0).

## Step 3 - the flush rule (built)

`FramePublish` splits its frame in two. `beginFrame()`, first in `render()`, runs the UI rebuild a request asked for, as
before. `endFrame()`, at the start of the telemetry phase after the simulation (so after `finishRace`), builds at most
one dirty seat, lowest first, **unless the frame called `request()`**. RaceGame calls `request()` on a car pick, a
purchase or market buy, a track switch, any command (start, lobby, garage, career), `launchRace`, `finishRace` and the
early arm's stage. `frame()` is `beginFrame()` then `endFrame()`, so every existing caller and test behaves as before.
The builders, their order and the one-seat limit are unchanged, so the bytes are the same.

In both runs no seat was built on a request frame. Two P13c effects remain, as the brief asked: they are reported, not fixed.
- **The JIT cost next to a run's first flushes.** Run 1, probe second 0.2 and 0.8: a seat-0 flush of **73.6 ms** after
  the first car pick and track switch overlapped a background concurrent-copying GC (231 ms total, 36 MB of large
  objects freed: the `/routes` warm-up garbage). A seat-1 flush of **90.8 ms** came next to
  `Compiler allocated 4206KB to compile ... ProfileCodec.decode`. They made frames of 123.0 and 134.0 ms work (telemetry
  76.1 / 91.9) and run 1's transition max (136.7). Run 2 had the same pair (GC 289 ms total, the same `decode` compile)
  inside its first **`startRace` (145.9 ms**, of which ticket submits 27.8 + 33.2), which set run 2's max (177.9).
  Later flushes are 9-45 ms. The rule moves a flush off a request frame. It cannot make the first one warm.
- **The finish path.** No race finished in either run: every round ran to the probe's 60 s cap, and no SETTLE write
  was logged. `finishRace` now calls `request()`, so its frame builds no seat. The settle flushes run on the next frames
  without a request, and its UI rebuild runs first in the next frame, as in P13c. Shown by tests only; no finish-path
  Stick run was wanted.

## Tests

`gradlew.bat :core:test :link:test :game:test --rerun-tasks`: core 258, link 20 (2 skipped, as on the base), game 101
(92 + 9 new). Every existing test file is unchanged. See `tests.json`.

| Test | What it shows |
|---|---|
| `FramePublishRequestTest.aRequestFrameBuildsNoSeatEvenWithASeatLeftDirtyAndTheNextQuietFrameDoes` | Seat 1, left dirty by the previous frame, is not built in a request frame; the next quiet frame builds it. |
| `...consecutiveRequestFramesHoldTheSeatUntilTheFirstQuietOne` | Three request frames in a row build nothing; the fourth (quiet) builds once. |
| `...aRequestHoldsOnlyItsOwnFrame` | The hold ends with its frame. |
| `...theUiRebuildAndTheSeatKeepTheirOwnFrames` | A track switch's UI rebuild still runs first in the next frame, even if that frame has a car pick; the seat waits for the quiet frame. |
| `TileReleaseTest` (5) | Hold schedule (released at hold, hold+1, ... one per frame, oldest first), bytes counted until each release, no hold releases at once, a second switch queues behind the first, `releaseAll`. |

AtlasArt's own use of `TileRelease` needs GL textures, so it is covered by the delay arm on the Stick (release windows
logged with `held=` and `peak=`), not by a JVM test.

## Stick runs

One APK (`e584c3c2...`, built from 60ac7cb9 with P13c's recipe, arm off). Two consecutive runs of
`tools/perf-device.py --install --profile --warm-routes --tracks scrap-1-c,foundry-1-c,salt-1-b,switchback-1-a,crown-1-a
--seconds 360`, graded with the unchanged `tools/perf-p10.py`. Before each run the host stayed under 60% CPU for 60 s
(settled after 301 s and 76 s). Both probes exited 0, so no run was voided.

### Every render over 100 ms after the probe started

| Run | s | Work, ms | Interval, ms | Phase | Attribution |
|---|---:|---:|---:|---|---|
| 1 | 0.2 / 0.3 | 123.0 / 24.9 | 52.9 / 131.0 | telemetry 76.1 | Seat-0 flush (73.6 ms, a quiet frame) during a 231 ms background GC, after the first car pick and track switch. Then the long interval. |
| 1 | 0.8 / 0.9 | 134.0 / 49.9 | 37.3 / 136.7 | telemetry 91.9 | Seat-1 flush (90.8 ms) next to the JIT compile of `ProfileCodec.decode`. |
| 1 | 200.7, 268.2 | 6.0-16.2 | 110.7, 104.1 | prepare 3.2-3.6 | Bake gap (A), k=11. The other three switches read 99.3, 99.5, 93.4. |
| 2 | 0.6 / 0.8 | 176.6 / 54.5 | 32.7 / 177.9 | requests 147.1 | First `startRace` (145.9 ms) during a 289 ms background GC and the same `decode` compile. |
| 2 | 67.0, 201.9, 269.4, 334.4 | 8.3-28.5 | 102.4-110.5 | prepare 3.2-3.9 | Bake gap (A), k=11. The fifth reads 100.0. |

Frames before the probe started (app start, -36 to -28 s) are outside every window. They are listed in
`p10-readings.json`.

### Texture residency by owner (the `/stats` art block, identical in every sample of both runs)

| Owner | Bytes | MiB | Budget |
|---|---:|---:|---|
| Art (atlases, 11 tiles of which 4 are region slots = 1 MiB, backdrop) | 19,660,800 | 18.75 | ART 32 MiB |
| Story art | 0 | 0 | (inside ART; practice runs load none) |
| Scenery target | 16,777,216 | 16.00 | SCENERY 16 MiB |
| Fonts | 5,242,880 | 5.00 | FONTS 11 MiB |
| QR | 230,400 | 0.22 | QR 225 KiB |
| **Owned total** | **41,911,296** | **39.97** | **TOTAL 52 MiB** (`budgetOk: true`) |

Art peak (`peakTextureBytes`, logged with every switch): 19,660,800 B. No tiles overlap with the arm off. In the delay
arm both sets overlap for 60 frames, a peak of 20,709,376 B (+1 MiB).

## What still exceeds 100 ms

1. **(A) The bake gap, 93.4-110.7 ms once per lobby course switch (6 of 10 over 100),** 11 frames after the switch (10 bake passes). A
   GPU-driver job set off by the scenery bake's rendering into the scenery target, not by the region tiles. It alone fails
   rounds 3-4 of run 1 and rounds 1, 3, 4 and 5 of run 2. Not built: every allowed fix acts on the tiles, and the arms rule the tiles out.
2. **The run's first requests next to the first GC and the `ProfileCodec.decode` JIT compile:** run 1's first flushes
   (73.6 / 90.8 ms) and run 2's first `startRace` (145.9 ms). They set the transition max of both runs (round 0).
   Reported, not fixed (step 3).

## Limits

Each arm ran about 3 switches in one 210 s run (the probe exits 1 on its 900 s duration gate). The k=11 measure is read
from log lines, and the GPU's own work is not visible. The attribution says what moves the job, not what the driver
does. Two profiled 360 s runs of one APK, not a 900 s soak. No race finished, so the finish path is covered by tests
only. Run 2's PSS reached 203.9 MiB (P13c run 2 197.8), over the I2 reference of 192. No cause was looked for. Nothing
under `core/`, `link/`, `desktop/`, `assets/` or `art/` changed, and under `app/` only the perf-only arm wiring in
`MainActivity`. `ws` 8.18.0 was copied from the main checkout for the runs, gitignored, and removed afterwards. At the
end `dev.deathride.perf` was force-stopped. The owner's `dev.deathride.tv` was in front, as at the start: the same task
t330 and process 14337, and the package was last updated 2026-10-06 23:44, before this session.
