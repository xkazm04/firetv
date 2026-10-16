# P22 - M1 goal 1's 900 s sound-on Stick soak of deathride/main

2026-10-16, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/stack-grounded-opportunity-research-90b34845`, cut from `deathride/main` a443f12f. P22 changes no code. Every
figure below was measured in this session. Summaries are in `deathride/evidence/perf/p22/`. Its `manifest.json` binds the raw
files kept outside git in `C:/Users/kazda/kiro/deathride-raw-evidence/p22/` by SHA-256: logcats, `raw.json.gz`, the SurfaceFlinger
dump, both APKs, and the build and gate logs. Nothing was pushed.

Reconciled first: no P22 soak was on `deathride/main` or in `evidence/perf/`. The Stick answered, `dev.deathride.tv` was not
running, the launcher was in front, and no install of another session was in the way.

## Figures first

The ruled order was P21, then P22, then card 16 (decisions section 13(b) ruling 4). Goal 1's measure is the owner's of
2026-10-09 (section 14(a)): a 900 s sound-on soak of the deathride/main APK, in every active 10 s window the p95 frame reaches
the screen one refresh (16.68 ms) after the one before; active max <= 33 ms, median 16-18 ms, PSS < 192 MiB, zero rejected inputs.

| Goal 1 line | Limit | **P22 soak** (a443f12f) | Status |
|---|---|---|---|
| Active p95, screen (SurfaceFlinger present interval), worst of 629 windows | one refresh, 16.68 ms | **16.667 ms in 629 of 629 windows** | **pass** |
| Active max | <= 33 ms | **37.599 ms** (render interval) | **fail** |
| Active-window median | 16-18 ms | 16.569-16.691 ms | pass |
| PSS (16 samples) | < 192 MiB | **129.7-153.6 MiB** | **pass** |
| Rejected inputs | 0 | 0 / 0 (27,003 of 27,003 per seat, 30.001 Hz) | pass |
| Lobby-to-race transition (no frame over 100 ms) | 100 ms | max **93.051 ms**, no window over 100 ms (14 rounds) | **pass** |
| Duration | >= 900 s | 900.069 s | pass |

- **The old interval p95 is shown for comparison, not graded.** The render-interval worst-window p95 was 20.824 ms. The owner's
  line replaced it. In screen terms, 49,346 of 49,381 active frames presented one refresh after the one before (99.93%), and 35
  presented two refreshes after.
- **The max line misses by 4.6 ms.** Five active frames were over 33 ms (37.321, 37.599, 36.463, 34.589, 35.897 ms). All five were
  class b (a missed refresh, a 33.33 ms present interval), and all five were attributed to a preempted render thread. Section
  10(a) ruling 2 (the max still fails on the platform's audio with sound on) stands.
- **Frames over 20 ms: 1,046 of 49,381.** 1,018 presented on the next refresh anyway (class a). Causes: preempted 607, dequeue
  back-pressure 276, running 148, GC sleep 7, other sleep 8.
- **Transition.** The 100 ms bar holds. The seven renders over 100 ms (100.1-213.7 ms) all sit 35-39 s before round 0, which is app
  start and the first scenery bakes, and are not transitions. P21's 1,139-1,145 ms figures were not reproduced. They are P9's first
  render-thread projection, which P10 moved off the render thread.
- **PSS peak** 153.63 MiB at second 272: Java heap 56.14, Graphics 49.73, Code 19.30, Native 10.34 MiB. The swing from the lowest
  sample is Java heap +21.6 MiB (ART's post-GC headroom, as P18 and P20 found). Warm PSS growth +2.08 MiB. Owned textures 36.97 MiB.
- **GC.** 85 GCs, 1 blocking, 2.218 MB/s allocated, 28 logged background GCs.

### The release build's Code line (ruling 3(b), ungraded)

- `assembleRelease` with `-PappId=dev.deathride.perf` (R8 on, debug key, not debuggable; `release-badging.txt`), `890ae15b...`,
  installed over my own debug perf APK. `dev.deathride.tv` and `dev.deathride.tracks` were not touched.
- A 120 s run without `--profile` read **Code 14.73-14.82 MiB** at four samples (total PSS 117.2-121.8 MiB, Java heap 25-29 MiB).
- The debug soak read Code 19.30-19.45 MiB at its peak and lowest samples. The release Code line is about 4.6 MiB lower.
- The probe exited 1 on "every class activated" (120 s is too short for every ability class). Inputs were 3,604 of 3,604
  accepted per seat. Nothing here is graded.
- This is the reading of the build under the id `dev.deathride.perf`. The shipped id (`dev.deathride.tracks`) was not built, so
  that release APK is the same code under another package name.

### Do the figures call for cards 2, 3 or 16?

- **Card 2 (display-priority looper): no.** Ruling 3(b)1 schedules it only if the soak fails the p95 line on missed refreshes. The
  p95 line passed in every window.
- **Card 3 (back-pressure): not called by the p95 line.** Back-pressure in `dequeueBuffer` is the cause of 276 of the 1,046 frames
  over 20 ms, and of none of the five frames over 33 ms. It is the owner's call whether the max line (a miss by 4.6 ms, five
  frames in 49,381) is worth a card.
- **Card 16: not called by this soak.** The transition line it guards (no frame over 100 ms) held at 93.051 ms.

## How it was run

- **APK.** `gradlew.bat :app:assembleDebug -PappId=dev.deathride.perf "-PappLabel=Death Ride Perf" -PracePort=8772` at a443f12f,
  `f7dbcee5...`, checked with `aapt dump badging` before install (`dev.deathride.perf`, debuggable, label "Death Ride Perf").
- **Soak.** P14's command (`perf-device.py --install --profile --seconds 900`, default sound arm, five-course cycle, `/routes`
  warm-up) with `perf-p17-present.py` polling SurfaceFlinger beside it, then `perf-summary.py`, `perf-p11.py`, `perf-p10.py`,
  `perf-p13f-gc.py` and `perf-p17.py`. No reader, threshold, clock or input rate changed.
- **The present poller is the only way to read the owner's line.** It costs 3.37% of one core on the device (SurfaceFlinger itself
  11.7%). P17 kept it out of graded runs, and this one carries it. If the owner wants the max, median and PSS lines read
  without the poller, that is a second 900 s run.
- **Settle.** Two 900 s waits (11:05Z and 11:20Z) did not settle (last minute 30-91% and 38-97%; 20 and 42 of 60 samples at or over
  60%). The soak ran unsettled. Host CPU was 71-81% at its start (11:20:52Z) and 33-41% at its end (11:36:02Z), under other
  sessions' node, git and find processes.
- **Thermal** status 0 at start and end. 0 host pump stalls.
- **Profile.** 49,381 active frames, 629 active windows, 14 rounds, all five courses.

## Failures and limits

- **One run, unsettled.** The host was loaded at the start. The max line's five frames were all preempted render threads, so a
  quieter host may read lower. Not shown.
- **The max line** is read as the render interval, the system's own measure since P8. In present terms the same five frames are
  33.33 ms intervals, which is also over 33 ms.
- **The screen p95 is a coarse line.** Present times are SurfaceFlinger's own grid (residual 0 ns). It catches missed refreshes,
  not small jitter, as section 14(a) says.
- **Code line:** one 120 s reading of the release build under the perf id. Not the 900 s soak, not graded.
- **`gc.json`** was rebuilt after the first post-run call, because that call ran after `raw.json` had been removed. The rebuilt
  file reads the same `raw.json.gz`.
- **`p17-readings.json` is slimmed** in git (the 1,053 slow-frame rows are left out for the 512 KiB rule). The full file is raw.
- A first soak attempt was stopped during its first settle wait, before any install, after a 10 minute task limit was set by
  mistake. Nothing reached the Stick. The soak above is the one run.
- No typecheck or lint command is configured for this project. Both are skipped, not passed.

## Gates

`gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain` at a443f12f: green, core 268, link 68 (2 skipped),
game 142, 3 min 51 s (`evidence/perf/p22/tests.json`). `assembleRelease` passed (8 min 7 s); `:desktop:compileKotlin` was not
run, because nothing in P22 touches code.

## The device at the end (`device-state-end.txt`)

- The launcher is in front, as found. `dev.deathride.tv` (`0.1-spike`, last updated 2026-10-06 23:44:23) is unchanged and not running.
- `dev.deathride.perf` was force-stopped. It now holds the release APK (`890ae15b...`) from the Code reading.
- `dev.deathride.tracks` was not touched by this run (its last update, 2026-10-15 11:47:41, is another session's).
- Thermal status 0.

## Questions

1. **Goal 1.** By the owner's line, sound-on goal 1 passes on p95, median, PSS, rejects and the transition bar, and misses only the
   33 ms max (37.6 ms, five frames, all preempted). Does goal 1 count as met, or is the max line to be worked, for example by
   card 3 or a settled rerun?
2. **A soak without the poller.** Should the max, median and PSS lines be read once more without the SurfaceFlinger poller (3.4% of a
   core), and on a settled host?
3. **The release Code line** was read under `dev.deathride.perf`. Is that accepted for ruling 3(b), or should the shipped id be read
   once the Stick's `dev.deathride.tracks` stream allows an install?
4. **Card 15** (P21 question 2) and the 30 MB floor (P21 question 3) were not touched. They need a settled pair, which this host
   has not given.
