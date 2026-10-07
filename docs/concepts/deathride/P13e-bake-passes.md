# P13e - The course-switch gap was the ground tile: the bake now draws it in 16 synced bands

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11, PowerVR Rogue GE9215), isolated `dev.deathride.perf` / 8772 / private
ADB 5041. Branch `autopilot/stack-grounded-opportunity-research-34467b3c`, cut from `deathride/main` 258117ec (P13d).
Every figure below was measured in this session. Summaries are in `deathride/evidence/perf/p13e/`. Its `manifest.json`
binds the raw logcats, `raw.json`, APKs, build and gate logs and scripts, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p13e/`. Nothing was pushed.

## Figures first

| Reading (P10 arm, 360 s, profiled) | P13d run 1 | P13d run 2 | **P13e run 1** | **P13e run 2** |
|---|---:|---:|---:|---:|
| Transition max, ms (bar: no frame over 100) | 136.7 | 177.9 | **97.0** | **103.3** |
| Transition windows over 100 ms | 19 of 55 | 30 of 56 | **0 of 59** | **10 of 58** |
| Interval 11 frames after each switch (k=11), ms | 99.3, 99.5, 110.7, 104.1, 93.4 | 108.2, 100.0, 110.5, 104.5, 102.4 | **19.2, 17.6, 17.7, 18.9, 17.4** | **20.5, 18.2, 18.1, 16.3, 29.6** |
| Slowest interval in any switch window (k=1-19), ms | 110.7 | 110.5 | **84.4** | **70.5** |
| Round 0 (first requests) max, ms | 136.7 | 177.9 | **62.0** | **46.4** |
| Car pick request, ms | 12.3-40.5 | 10.9-29.7 | 10.0-29.8 | 7.9-48.6 |
| `startRace` request, ms | 23.8-43.0 | 21.1-145.9 | **18.3-29.7** | **14.1-24.4** |
| `raceLaunch`, ms | 6.6-10.2 | 6.5-11.5 | 6.5-19.3 | 6.1-11.9 |
| Track request, ms | 12.3-62.7 | 10.8-81.4 | 8.9-75.5 | 11.2-64.3 |
| Flush, one seat, ms (seat 0 / seat 1) | 9.3-73.6 / 9.8-90.8 | 11.1-45.0 / 11.3-28.5 | 9.9-33.1 / 9.9-29.7 | 7.5-38.9 / 7.6-42.0 |
| `ProfileCodec.decode` JIT compile | in round 0 | in round 0 | **at startup, 42.8 s before the first request** | **at startup, 33.5 s before** |
| PSS, MiB (I2 reference 192) | 168.1-192.5 | 175.8-203.9 | **161.0-177.5** | **169.2-189.3** |
| Rejected inputs / host pump stalls | 0/0 / 0 | 0/0 / 0 | 0/0 / 0 | 0/0 / 0 |
| Host settle (60 s under 60%) / CPU at start / end | settled / 20-26% / 41-46% | settled / 16-17% / 37-56% | **not settled in 900 s** / 49-66% / 30-57% | **not settled in 901 s** / 55-89% / 73-91% |

**Verdict on the bar: run 1 pass, run 2 fail. Neither run is a valid grade: the host never settled** (other sessions and
the owner's applications held it at 60-100% CPU; see "Host" below). Both ran P13d's exact command on one APK, in a row.
In both, the course-switch gap is gone: the k=11 interval fell from 93.4-110.7 ms to 16.3-29.6 ms, and no switch window has
an interval over 84.4 ms. The run's first requests no longer meet the GC and the `decode` compile: round 0 is 62.0 / 46.4 ms
(P13d 136.7 / 177.9). Run 2 fails on two lobby frames that are not the bake and not first requests: 103.3 ms (crown, 3.4 s
before round 4) and 100.8 ms (scrap, 1.4 s before round 5), each next to a long background GC (626 ms and 364 ms total)
on a host at 73-91% CPU.

**The phase that moved: `prepare`'s scenery bake.** The bake's full-target ground tile was about 100-130 ms of GPU work in
one draw, which the driver ran with the deferred FBO passes about 10 passes in: the P13c/P13d gap (93.4-114.4 ms). Drawn
as 16 scissored, glFinished bands it is about 8-9 ms of GPU in each of 16 frames (band slices 12-14 ms; bake frames 15-40
ms of work), and the switch frame no longer runs a pass.

## Step 0 - the baseline bake (`baseline-bakes.json`)

The bake as shipped before P13e (3 ms slices, `sceneryBuildBudgetMs` 3), from the `sceneryBake` line of P13d's two runs
and this session's off arm:

| Course | Bakes | Passes (`slicedFrames`) | `totalCpuMs` | `maxSliceMs` |
|---|---:|---:|---:|---:|
| scrap-1-c | 5 | 49-123 | 174.4-552.3 | 5.0-38.6 |
| foundry-1-c | 3 | 74-86 | 341.6-368.8 | 22.0-23.2 |
| salt-1-b | 3 | 52-67 | 184.2-279.8 | 6.1-11.3 |
| switchback-1-a | 3 | 51-53 | 193.5-213.6 | 7.4-19.5 |
| crown-1-a | 2 | 50-52 | 179.8-192.5 | 6.7-7.7 |

scrap-1-c's first bake of each run is the startup bake, before the probe, cold (112-123 passes, 506-552 ms). The bake's work
is mostly kerbs and barriers (128-368 ms per bake, `sceneryBakeDetail`).

## Step 1 - the arms (`arms.json`)

`SwitchArm` gained twelve perf-only arms, off by default. Only the debuggable `dev.deathride.perf` launcher reads
`switchArm`, and an unknown value throws, as in P13d. Each arm ran one 210 s profiled lobby run (about 3 course switches:
foundry, salt, switchback), read with `tools/perf-p13e-arms.py` (P13d's reader plus each bake's `sceneryBakePasses` line:
passes, budget, every pass's ms, paired with the window it started in). (i) is "no interval over 100 ms in any switch
window", (ii) "every bake frame at or under 50 ms of work": the slice column is the bake's own ms per pass over the whole
bake, the frame column the whole frame's work over the window frames that ran a pass (k=0 included when the switch frame
runs one).

| Arm | What changes | k=11, ms | Slowest window interval, ms (k) | Max slice / pass-frame work, ms | (i) | (ii) |
|---|---|---|---|---|---|---|
| off | The bake before P13e (reproduces P13d) | 100.6, 107.2, 101.2 | 107.2 (11) | 22.5 / 85.1 | fail | fail (k=0) |
| passes9 | At most 9 passes (40 ms budget; the 9th runs the rest) | 61.5, 20.8, 12.4 | 139.9 (9) | 118.1 / 138.3 | fail | fail |
| passes6 | At most 6 passes (60 ms) | 39.7, 35.1, 45.9 | 166.6 (6) | 145.2 / 164.8 | fail | fail |
| passes3 | At most 3 passes (120 ms) | 23.1, 18.0, 22.8 | 195.6 (1) | 150.9 / 192.7 | fail | fail |
| finish | glFinish at the end of every slice (diagnostic) | 12.0, 16.7, 17.0 | 189.6 (1) | 122.9 / 188.1 | fail | fail |
| ground8 | Ground quad through 8 scissored row bands, one per pass, no sync | 112.5, 101.8, 102.7 | 112.5 (11) | 24.0 / 70.8 | fail | fail (k=0) |
| ground4 | The same, 4 bands | 107.7, 97.7, 108.9 | 108.9 (11) | 22.6 / 73.6 | fail | fail (k=0) |
| ground8finish | ground8, glFinish every slice (diagnostic) | 16.8, 16.9, 32.7 | 114.1 (1) | 24.3 / 112.1 | fail | fail (k=0) |
| noground | No ground tile (diagnostic; pixels differ) | 24.4, 16.2, 16.5 | 80.2 (1) | 24.3 / 78.4 | pass | fail (k=0) |
| bands8 | 8 bands, glFinish on each band's pass, no pass in the switch frame | 16.7, 14.6, 16.9 | 74.9 (1) | 23.2 / 28.2 | **pass** | **pass** |
| **bands16** | **16 bands, the same (shipped)** | 18.8, 19.1, 30.9 | **67.2 (1)** | 21.7 / 28.8 | **pass** | **pass** |
| bands8flush | bands8 with glFlush instead of glFinish | 15.6, 17.5, 16.8 | 102.5 (8) | 21.1 / 27.7 | fail | pass |

What the arms show, in the order they ran:
- **Fewer passes moves the job, it does not remove it.** With at most 9, 6 or 3 passes the k=11 gap is gone, but a ~100 ms
  interval follows the bake's last pass (salt 5 passes -> k=6 100.8; switchback 4 -> k=5 106.0; passes6 switchback 3 ->
  k=4 101.8): the driver runs the deferred passes when the target is first sampled, if it has not by pass ~10. The
  limited passes also need 118-151 ms of work in one frame, and the first runs in the switch frame. None meets (i) or (ii),
  so the `record` arm was not built: no passes arm would pass (i) whatever its frame work.
- **The job is the first pass's GPU work.** With glFinish per slice (finish) it lands in the first pass, 116-123 ms against
  a ~16 ms first slice, and never again.
- **The job is the ground tile.** noground (no full-target ground quad) has no interval over 80.2 ms in any window, and its
  slowest is the switch frame's own work. ground8finish times the bands: 19-26 ms per band slice against 4-5 ms for the
  slices after them, about 15-21 ms of GPU per eighth, 130-140 ms for the whole quad. The quad samples a 256 px tile
  repeated every 8 m across the whole 2048 px target without mipmaps, so each texel fetch is a cache miss.
- **The bands must be synced.** Unsynced (ground8, ground4) the driver batches the band passes and runs them together at
  pass ~10: the gap is back at k=11. glFlush does not make it run them (bands8flush: 91.6-102.5 ms at k=8). glFinish does.
- **The switch frame must not run a pass.** It already carries the scene's construction (`configureWorld` `sceneMs`
  21-71 ms; frame work 28-85 ms), so a 20 ms band in it makes a 112 ms frame (ground8finish, foundry). bands8 and bands16
  bind nothing in the frame that creates the scene.

## Step 2 - what shipped: `BakeShape.SHIPPED` (16 synced bands)

bands16 meets (i) and (ii) in its arm run and has the lowest slowest-window interval of the arms that do (67.2 ms against
bands8's 74.9; both are the switch frame's own work, k=1). Band frames run 16-29 ms of work (bands8: 24-28). The shipping
change is code in `TrackScene` (no tuning value changed):

- The bake's ground quad (`canvas.tile(groundTile, ...)` over the whole target) is drawn 16 times, each through
  `glScissor` of one 128-row band (`BakeShape.rows`), one band per pass. The quad, its vertices, texture, tint, blending
  and position in the draw order are unchanged; the scissor only limits which pixels each draw writes, and the bands cover
  the target once. Every step before it (the clear) and after it runs as before, in today's 3 ms slices.
- A pass that drew a band ends with `glFinish` while the target is bound, so its GPU work runs in that frame.
- The frame that creates the scene (the switch frame, and the first frame at startup) runs no pass.
- `BakePasses` (GL-free) runs the passes; with no pass limit it is the old loop. `BakeShape` names the shapes;
  `SwitchArm.shape` maps each arm. The P13d arms, passesN and finish run the old bake (`BakeShape.UNBANDED`) as measured,
  and `switchArm=unbanded` restores it on the perf build for an A/B.

The cost: a bake takes 16 more passes (frames) and its slices sum to more wall time, because each band frame waits for its
band: foundry 98-101 passes and 600-654 ms of slices (was 74-86 and 342-369), crown 61-63 and 375-381 (was 50-52 and
180-193). The course shows about 0.3 s later. Nothing drawn changes, and no budget, target, texture size, threshold, clock,
physics, input rate or render scale changed. `sceneryBuildBudgetMs` stays 3.

### Pixel identity (`hashes.json`)

One ungraded 360 s run of the graded APK itself (`p13e.apk`, `fd8c6dd8...`; `perf-device.py --install --seconds 360
--extra bakeHash=on`). With `bakeHash=on` (perf package only) RaceGame reads the finished 2048 x 2048 RGBA target back
(`glReadPixels`, 16 MiB) and hashes it, then bakes the same course again with `BakeShape.UNBANDED` (blocking) and hashes that:

| Course | Shipped bake SHA-256 | Unbanded bake SHA-256 | Same |
|---|---|---|---|
| scrap-1-c (startup and round 5) | 5c785253...5b0a65f8 | 5c785253...5b0a65f8 | yes (both bakes) |
| foundry-1-c | d75b50c0...907852ce | d75b50c0...907852ce | yes |
| salt-1-b | 1fe83af7...d43447d7 | 1fe83af7...d43447d7 | yes |
| switchback-1-a | 40dbb168...6223892a | 40dbb168...6223892a | yes |
| crown-1-a | 8e13eb06...5a0b086f | 8e13eb06...5a0b086f | yes |

The finished target is byte-identical for all five courses.

## Step 3 - first requests

**`/routes`** (`link/RoutesReply.kt`). The reply was one 17.5 MB String built by nested `joinToString` and kept by a lazy;
each request encoded a second array of the same size. Now each point is written straight into 64 KiB UTF-8 blocks, built
once on the link side on the first request (268 blocks; no reply-sized String or array exists), and a request copies the
blocks to the socket with `respondBytesWriter`. `RoutesReplyTest` proves the bytes equal the old reply for
`Courses.playable` (38 courses, 17,540,087 B on the JVM, sha256 `57adf4e8...`), and that the served body, `Content-Type`
and `Content-Length` equal ktor's `respondText` of the old String on a bare server. On the Stick the warm-up reply is
17,540,089 B, the same length as P13d's (2 B more than the JVM's: a platform difference in the course data or its
printing; each comparison runs on one platform). The steady background GCs (one every ~6-7 s freeing 15-21 MB of large objects, 57 in run 2 against 62
in P13d run 2) are not from `/routes` and are unchanged; their source was not looked for.

**`ProfileCodec.decode`** (`game/CodecWarm.kt`). At create, after the profiles load, a low-priority daemon thread
round-trips copies of the loaded profiles through `encode` and `decode` (100 rounds; no file is read or written; core is
unchanged). The `Compiler allocated 4206KB to compile ... ProfileCodec.decode` line now lands at startup in both runs
(19:05:43.0 and 19:27:58.8), 42.8 s and 33.5 s before each run's first request, so it **left the graded windows**. The warm-up
took 8.2 s / 6.0 s and ended 36.4 s / 28.5 s before the first request. The first flushes are 9.9-33.1 ms and the first `startRace`
18.3 / 24.4 ms (P13d: 73.6 / 90.8 ms flushes, 145.9 ms `startRace`).

## Step 4 - the Stick runs

One APK (`fd8c6dd8...`, built from 5df2a49b, the last code commit, arms off; byte-identical to the hash run's APK).
Two consecutive runs of `tools/perf-device.py --install --profile --warm-routes --tracks
scrap-1-c,foundry-1-c,salt-1-b,switchback-1-a,crown-1-a --seconds 360`, graded with the unchanged `tools/perf-p10.py`.
Both probes exited 0.

### Host

Before each run the settle script waited 900 s for 60 consecutive seconds under 60% CPU and did not get them (run 1: last
minute 27-100%, run 2: 23-100%); P13d's script starts the run either way, so both ran unsettled. A settled pair was then
tried (`runs-n.sh`, up to four 900 s waits per run): run 3 waited four times (3,604 s) without 60 quiet seconds, with
the host at 100% in every sample of the third wait's last minute (other sessions' Python at up to 787% and Unreal Editor builds, and the
owner's game client), and was not started. There is no settled pair; the bar's verdict on a settled host is still owed.

### Every render over 100 ms after the probe started

| Run | s | Work, ms | Interval, ms | Phase | Attribution |
|---|---:|---:|---:|---|---|
| 1 | - | - | - | - | None. The only frames over 100 ms are at app start, before the probe (-42.4 to -37.6 s). |
| 2 | 266.3 / 266.4 | 101.9 / 18.6 | 68.3 / 103.3 | simulation 52.3, cars/effects 23.2, HUD 17.1; CPU 29.9 | A lobby frame 3.4 s before round 4 (crown), between the car picks and the track pick: 72 ms of its 101.9 off-CPU, during a background GC of 626 ms total (10.5 ms pause), host at 73-91% CPU. Not the bake (no switch until 1.7 s later). |
| 2 | 333.4 | 58.2 | 100.8 | requests 24.3, simulation 26.1 | A lobby frame 1.4 s before round 5 (scrap), the car picks (seat 1 48.6 ms), next to a 364 ms background GC. |

Frames before the probe started (app start) are outside every window; they are listed in `p10-readings.json`.

### Switch windows (`switches.json`)

| Run | Course | Passes | Switch frame work, ms | k=11, ms | Slowest interval k=1-19, ms | Max slice, ms |
|---|---|---:|---:|---:|---:|---:|
| 1 | foundry-1-c | 101 | 81.6 | 19.2 | 84.4 | 24.6 |
| 1 | salt-1-b | 74 | 37.2 | 17.6 | 40.1 | 13.1 |
| 1 | switchback-1-a | 69 | 41.6 | 17.7 | 43.3 | 13.1 |
| 1 | crown-1-a | 61 | 39.0 | 18.9 | 40.4 | 13.3 |
| 1 | scrap-1-c | 60 | 46.6 | 17.4 | 48.4 | 14.5 |
| 2 | foundry-1-c | 101 | 68.6 | 20.5 | 70.5 | 24.6 |
| 2 | salt-1-b | 81 | 30.1 | 18.2 | 31.5 | 15.4 |
| 2 | switchback-1-a | 73 | 41.4 | 18.1 | 43.3 | 14.6 |
| 2 | crown-1-a | 63 | 31.2 | 16.3 | 33.9 | 20.8 |
| 2 | scrap-1-c | 62 | 55.0 | 29.6 | 57.1 | 14.0 |

The slowest interval of each window is k=1, the switch frame's own work (scene construction, region tiles), not the bake.

### PSS against 192 MiB

161.0-177.5 MiB (run 1) and 169.2-189.3 MiB (run 2): under the I2 reference in both (P13d 192.5 / 203.9).

## Tests

`gradlew.bat :core:test :link:test :game:test --rerun-tasks`: green, core 261, link 23 (2 skipped, as on the base), game 110
(101 on the base + 9 new). link gained 3 (`RoutesReplyTest`). Every existing test file is unchanged. A first forced run under
the 100% host failed two link timing tests that do not touch `/routes` (`CompactLinkTest` server start within 8 s,
`HudPayloadTest` idle heartbeat count); a link rerun and the final full run were green. See `tests.json`.

| Test | What it shows |
|---|---|
| `BakeShapeTest.theShippedShapeIs16FinishedBandsAndNoPassInTheSwitchFrame` | The shipped shape; `UNBANDED` is the bake before P13e. |
| `...theBandsCoverTheTargetOnceInRowOrder` | Band rows are contiguous, cover 0 until the target size once, none empty; 16 x 128 rows of 2048. |
| `...eachBandGetsItsOwnPassAndEveryStepRunsOnceInTheSameOrder` | Each of the 16 bands ends its own pass (the clear rides with the first); every step runs once, in order; after the bands the passes are today's budget slicing of the steps left; the banded bake takes 14-16 more passes. |
| `...everyArmHasAShapeAndThePreP13eArmsRunTheUnbandedBake` | Every arm maps to a shape; off and bands16 are shipped; the P13d arms run the unbanded bake. |
| `BakePassesTest` (4) | A pass limit is never exceeded (one more only at a bin wait); every step runs once in order; no limit is the old loop, verbatim. |
| `RoutesReplyTest` (3) | The blocks equal the old reply's bytes for `Courses.playable`; block boundaries and an empty list keep the bytes; the served reply has the old body, `Content-Type` and `Content-Length`. |
| `CodecWarmTest` | The warm-up runs on its own daemon thread, on copies, and leaves the profiles unchanged. |

## Card S figures (for the optimize ledger; the ledger itself was not touched)

- Course-switch gap (k=11 interval): 93.4-114.4 ms (P13d, 40 switches) -> 16.3-29.6 ms (10 switches, P13e runs 1-2).
- Slowest interval in any switch window: 110.7 ms -> 84.4 ms (the switch frame's own work).
- Ground tile GPU: one ~100-130 ms job -> 16 bands of about 8-9 ms, each in its own frame.
- Round 0 (first requests) max: 136.7 / 177.9 ms -> 62.0 / 46.4 ms; first `startRace` 145.9 -> 18.3-24.4 ms.
- Transition max: 136.7 / 177.9 ms -> 97.0 / 103.3 ms; windows over 100 ms 19 / 30 -> 0 / 10 (unsettled host).
- PSS: 168.1-203.9 MiB -> 161.0-189.3 MiB.
- Cost: bake +16 passes, foundry 600-654 ms of slices (was 342-369); the course shows about 0.3 s later.

## Limits

The two graded runs ran on a host that never settled (other sessions and the owner's applications); by the brief's rule
neither is a valid grade. Each arm ran about 3 switches in one 210 s run, unsettled, and switch windows are 20 frames (a
bake runs 60-130 passes; the frames past k=19 are graded only in the full runs). The ground-tile attribution rests on the
arms (noground, ground8finish, finish); what the PowerVR driver does is not visible to the app. The pixel proof compares
the shipped bake with the unbanded path of the same build on the same device, not with a recording from before the
change. No race finished in either run (every round ran to the probe's 60 s cap). Under `app/` only `MainActivity`'s
perf-only extras changed; nothing under `core/` changed. `ws` 8.18.0 was copied from the main checkout for the runs
(`deathride/tools/node_modules`, gitignored) and removed afterwards. The owner's `dev.deathride.tv` was in front before
and after (the same task t330 and process 14337; the package last updated 2026-10-06 23:44, before this session);
`dev.deathride.perf` was force-stopped at the end.
