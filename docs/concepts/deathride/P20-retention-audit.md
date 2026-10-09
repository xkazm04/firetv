# P20 - Card 13: what survives a full GC (the retention audit)

2026-10-09, AFTKM `10.0.0.139:5555` (Android 11, armeabi-v7a, PowerVR GE9215), isolated `dev.deathride.perf` / 8772 / private
ADB 5041. Branch `autopilot/stack-grounded-opportunity-research-8313c7f9`, cut from `deathride/main` 059d1982 (P19). Research
only: no app code changed, nothing graded, no 900 s soak. Every figure below was measured in this session. Summaries are in
`deathride/evidence/perf/p20/`. Its `manifest.json` binds the raw files kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p20/`: the heap dumps, meminfo and smaps files, logcats, the APK, the build and gate
logs, and the AOSP sources read. No hprof was committed. Nothing was pushed.

## Figures first

**The answer.**
- After a forced GC, **43.3-48.1 MiB survives in the app heap**. That is within 6.4% of ART's own count of the survivors for
  the same GC.
- **31.5 MiB of it is kept only because the probe reads `/routes`.** No phone ever requests `/routes`:
  - the cached `/routes` reply (`RoutesReply`) holds 16.76 MiB;
  - the 32 playable courses the probe never races hold 14.76 MiB. The first `/routes` built every course, and `Courses.built`
    keeps them all.
- **Survivors grow only by the projection bins of each newly raced course**: 1.3-2.1 MiB a course, flat once the courses
  repeat. This is not a leak.
- **The `Code` line is clean file-backed page cache.** It holds the perf APK's uncompressed dex, framework.jar and the GPU
  compiler libraries. The kernel decides how much of it stays resident, not the app.
- **ART's 24 MB is fixed.** It is `heapmaxfree` 8 MB times a foreground multiplier of 3.0, and it does not scale with the
  survivors. So every MB of survivors cut also lowers, by one MB, the footprint the heap refills to.

### The reconciliation (before any ranking)

Each dump was taken with `am dumpheap -g`. ART runs a GC, the finalizers and a second GC, then writes the dump. The reader
(`tools/perf-p20-retained.py`) marks what the dump's roots reach. Its numbers sit beside the line ART logged for the last of
those GCs, read with `perf-p18-gc.py`'s own reader.

| Dump | When | hprof | App heap reachable, MiB | Zygote, MiB | Image, MiB | ART's GC line (used / footprint) | App vs used | App + zygote vs used |
|---|---|---|---:|---:|---:|---|---:|---:|
| a1 | run 1, lobby after the scenery and `/routes` warm-up, before the probe | 69 MB in 7.222 s | **43.29** | 4.84 | 7.89 | 46 MB / 70 MB | -5.9% | +4.6% |
| b1 | run 1, mid-race round 1 (probe second ~31) | 71 MB in 7.461 s | **44.95** | 4.84 | 7.89 | 48 MB / 72 MB | -6.4% | +3.7% |
| a2 | run 2, as a1 | 69 MB in 7.153 s | **43.30** | 4.84 | 7.89 | 46 MB / 70 MB | -5.9% | +4.7% |
| d2 | run 2, lobby after its last round (round 3) | 74 MB in 7.704 s | **48.07** | 4.84 | 7.89 | 51 MB / 75 MB | -5.7% | +3.7% |

- **Every dump is within 10%, so the ranking stands.**
  - ART's `used` counts every space it allocates in, so the zygote space's objects (4.84 MiB) are in it, and the boot image is
    not.
  - ART's figure falls between the app heap alone and the app heap plus the zygote space.
  - The rest of the gap is the reader's sizing. Class objects count only their static fields, and ART prints whole MB.
- **Garbage after the forced GC:** 0.00-0.04 MiB unreachable in the app heap. Only 152-280 B are reachable through a
  `Reference.referent` alone.
- **hprof-conv check (`conv-check.json`).** The converted dumps reach exactly the raw dumps' bytes summed over their heaps
  (58,744,738 / 60,481,523 / 58,749,690 / 63,754,611 B). hprof-conv drops ART's heap ids and folds its extra root kinds into
  ROOT_UNKNOWN, so the heap split and the root kinds are read from the raw file.
- **The heap's free space is 24 MiB after every dump's GC.** `dumpsys meminfo`'s Dalvik `Heap Free` reads 24,576 / 24,576 /
  24,560 / 24,576 KB beside 48.0-52.9 MB allocated.

### What survives, ranked (`ranking.json`)

Each app-heap object is attributed to its nearest dominator of class `dev.deathride.*`. MiB and share are of the app heap's
survivors.

| Owner (retained, app heap) | a1 | b1 | a2 | d2 | Share at d2 |
|---|---:|---:|---:|---:|---:|
| `dev.deathride.core.Course` | 17.23 | 17.23 | 17.23 | **21.03** | 43.7% |
| `dev.deathride.link.RoutesReply` | 16.76 | 16.76 | 16.76 | **16.76** | 34.9% |
| `dev.deathride.link.Distribution` (4) | 1.84 | 1.90 | 1.84 | 1.90 | 4.0% |
| `dev.deathride.link.PerfTrace` (2) | 1.53 | 1.53 | 1.53 | 1.53 | 3.2% |
| Everything else (no owner over 0.77 MiB: GlyphLayer 0.77, StatsReply 0.58, TrackNode 0.50, Counter 0.44, SceneryCanvas 0.43, ...) | 5.93 | 7.53 | 5.94 | 6.85 | 14.3% |
| **App heap survivors** | **43.29** | **44.95** | **43.30** | **48.07** | |

**The courses (`instances-a1.json`, `instances-d2.json`).**
- 39 courses are built in every dump: the 37 playable courses, plus `runoff` and `foundry`, 0.03 MiB together.
- The 32 the probe never races retain **14.76 MiB**, 0.36-0.58 MiB each. That is the spline arrays: x, y, width, lane, arc,
  curvature, dx, dy, inverseLength2 and surfaces, 37 of each among the large arrays.
- The raced courses also keep their projection bins:

| Course | Bins at a1, MiB | Bins at d2, MiB |
|---|---:|---:|
| scrap-1-c (prewarmed in the lobby) | 1.31 | 1.31 |
| foundry-1-c | - | 1.66 |
| salt-1-b | - | 2.14 |
| **Total** | **1.31** | **5.10** |

**Each owner of 1 MiB or more:**

| Owner | The code that holds it | Does the next frame or round need it? | Would releasing it change what a player sees or hears? |
|---|---|---|---|
| Course (32 never raced, 14.76 MiB) | `core/.../Tracks.kt:203-210`: `Courses.built` caches every built course. `Courses.playable` (`:224-227`) builds on access, and `RaceServer.kt:401` walks it for the `/routes` reply. | No. A round uses only the selected course. `Courses.course()` builds one on demand, and `CoursePrewarm.kt:15` prewarms it off the render thread. | No. Only `/routes` built them, and the controller fetches `/build` and `/catalog` only (`controller/index.html:51`). |
| Course projection bins (1.3-2.1 MiB per raced course) | `Tracks.kt:56-57`: the lazy `candidateBins`, kept with the course | Only the selected course's bins (`project()`, `Tracks.kt:168`) | Not if the bake ends before the race starts. A race that starts first waits on the bake lock, so its card guards the race start. |
| RoutesReply (16.76 MiB) | `link/.../RaceServer.kt:401`: a companion `lazy` that keeps the reply for the process's life (served at `:185`) | No. Only a `GET /routes` reads it: perf-device.py's warm-up and the probe at its start (`ability-stick-probe.mjs:61`). | No. Players never request it, and the bytes on the wire can stay the same. |
| Distribution (1.90 MiB) | `link/.../Metrics.kt:9`: a `LongArray` of 50,001 bins per distribution. `Metrics.kt:39-41` makes four: frame, sim and two input ages. | Yes. Every frame and input adds a sample, and `/stats` reads the lifetime histograms. | No, but it is telemetry. Fewer bins would change a measurement. `int` counts would save 0.76 MiB, under the 1 MiB card line. |
| PerfTrace (1.53 MiB) | `link/.../PerfTrace.kt:6` rows, `FrameProfiler.kt:35` frames, `RaceServer.kt:79` inputs | Yes while profiling | No, but it exists only when launched with `profile=true` (`RaceGame.kt:20`). It is the instrument, so no card. |

### What grew

- **a1 -> b1 (round 1, mid-race): +1.66 MiB.**
  - The probe's `/stats` builder (`StatsReply`, +0.50 MiB), the phones' websocket handler (+0.46), `HudMetadata` (+0.21) and
    ktor buffers.
  - Course and RoutesReply are unchanged.
- **a2 -> d2 (three rounds, lobby): +4.77 MiB.**
  - Course +3.80 MiB: the bins of foundry-1-c and salt-1-b (`int[]` +3.82 MiB in 6,759 arrays).
  - `StatsReply` +0.50 MiB.
- **(b) -> (c) was not measured.** Dump (c) was never taken (see Failures).
- **ART's own logged full GCs stand in for it** (`survivors.json`: seven P18 and P19 runs, 8-20 full GCs each).
  - Survivors go 48-51 MB (round 1) -> 50-52 -> 52-54 -> 54-58 -> 57-59 (round 5) -> **57-58 MB (round 6)**.
  - Round 6 is scrap-1-c again, the first repeated course, and it is flat in every run.
  - The rise of about 10 MB over rounds 1-5 is the five courses' bins (1.3-2.1 MiB each). There is no growth when a course
    repeats, so there is **no leak**.
  - These late-run survivors are the floor under the PSS peaks: P19's peaks were sampled at 336-338 s.

### The Code line (`code.json`)

The App Summary's `Code` is the private pages of the `.so`, `.jar`, `.apk`, `.ttf`, `.dex` and `.oat` mmap rows. The smaps
read through `run-as` names the files.

| Sample | Code, MiB | `.apk` private | `.jar` private | `.so` private |
|---|---:|---:|---:|---:|
| a1 before / after the dump | 28.59 / 24.86 | 16.50 / 11.07 | 3.24 / 6.93 | 8.55 / 6.65 |
| b1 before / after | 24.11 / 23.80 | 11.82 / 11.82 | 5.85 / 5.61 | 6.27 / 6.18 |
| a2 before / after | 28.66 / 27.84 | 16.86 / 16.86 | 3.71 / 5.17 | 7.73 / 5.58 |
| d2 before / after (2 h idle) | 11.47 / 16.39 | 6.49 / 7.35 | 4.18 / 8.16 | 0.74 / 0.82 |
| P19 base-run1 (8 samples) | 14.56-30.64 | 7.54-16.42 | 0.62-3.92 | 6.18-10.07 |
| P19 cut-run1 | 16.83-34.92 | 7.50-16.99 | 0.88-4.74 | 8.31-12.61 |
| P19 base-run2 | 32.14-34.55 | 16.34-17.61 | 4.14-4.93 | 11.13-11.54 |
| P19 cut-run2 | 38.79-40.35 | 17.50 | 8.20-9.31 | 12.43-12.91 |

**What each row holds:**
- **`.apk`** is the perf APK's own `base.apk`, and nearly every resident page is dex (`scripts/apk-maps.py`: 7.37-16.16 MiB of dex in 7.38-16.47
  MiB resident). The debuggable perf build stores `classes*.dex` uncompressed: 16.9 MB in seven files. ART maps them from the APK and
  the interpreter and JIT read them.
- **`.jar`** is mostly `/system/framework/framework.jar` (2.5-4.3 MiB private), then telephony-common, core-oj and others.
- **`.so`** is `libusc.so` and `libglslcompiler.so` (the PowerVR shader compiler), plus `libhwui.so`.

**Which rows move.**
- All three move between P19's runs: `.apk` by up to ~10 MiB, `.jar` by up to ~8.7 and `.so` by up to ~6.7.
- They also fall within a run in one step:
  - base-run1 between 205 and 273 s: `.apk` -6.2, `.jar` -1.8 and `.so` -2.1 MiB;
  - cut-run1 between 139 and 206 s: `.apk` -9.7 MiB.
- Writing a 70 MB dump drops `.apk` pages too (a1: 16.50 -> 11.07).
- After 2 h idle, `.so` read 0.74 MiB.
- These are clean file pages. The kernel evicts them under memory pressure and reads them back on use.

**Can the app move them?** Not by releasing anything. It can only map fewer pages, for example with less dex or dex it reads
less. A release install compiled ahead of time reads its dex far less than this debuggable JIT build, but this run did not
measure it (question 2). So the 14.6-40.1 MiB spread between runs is page-cache residency, set by the device's memory
pressure at the time.

### ART's 24 MB (`headroom.json`): a reading of the source, not a trace

AOSP android-11 (`art` and `frameworks/base`, `android11-release`), against the Stick's settings: `heapmaxfree` 8m,
`heapminfree` 512k, `heaptargetutilization` 0.75, `heapgrowthlimit` 192m. No `foreground-heap-growth-multiplier` and no
`ro.config.low_ram` are set.

1. `AndroidRuntime.cpp:792-801` passes those properties to ART as `-XX:HeapMinFree/HeapMaxFree/HeapTargetUtilization`, and the
   multiplier only when it is set.
2. The multiplier defaults to `kDefaultHeapGrowthMultiplier = 2.0` (`runtime_options.def:57`, `heap.h:146`).
3. Outside low-memory mode, `runtime.cc:1365-1373` adds `kExtraDefaultHeapGrowthMultiplier`. That is 1.0 under the read-barrier
   (concurrent copying) collector (`runtime.cc:195`), so the multiplier is **3.0**.
4. `heap.cc:3506-3512`: `HeapGrowthMultiplier()` returns it while the process cares about pause times (foreground), and 1.0
   otherwise.
5. `heap.cc:3525-3533`, after a full (non-sticky) GC:
   - `delta = used x (1/0.75 - 1) = used/3`;
   - `grow = min(delta, 8 MB)`, at least 512 KB;
   - `target = used + grow x 3`.
6. `heap.cc:3562-3570`: a sticky (young) GC only shrinks the target, to `used + 8 MB x 3`.

**So for survivors of 24 MB or more, the headroom is 8 MB x 3 = 24 MB, fixed.** It does not scale with the survivors (it would
only below 24 MB, or 8 MB in the background).

This matches every observation:
- the 24 MB after every logged full GC in all of P18's and P19's runs;
- the four forced GCs here (46/70, 48/72, 46/70, 51/75 MB);
- the 24,576 KB `Heap Free` in meminfo.

The 24 MB comes from system properties the app does not own, and this run changed none.

## The cards opened (ledger `research-2026-10-08-deathride-muted-tail`)

Each card is open, lane B. Each graded A/B uses four interleaved profiled 360 s runs on P18's arm, with no dump, tracker or
forced GC. Survivors are the `usedMB` of each logged full GC over 30 MB, read with `perf-p18-gc.py`'s reader and grouped by
round.

| Card | Lever | Before | Keep rule (fixed before its first graded run) |
|---|---|---|---|
| **14** | Do not keep the `/routes` reply (same bytes, built per request or let go after it is written) | RoutesReply 16.76 MiB in every dump | served body byte-identical, AND in every round both cut runs' lowest survivors at least 12 MB below both base runs', AND no P19 guard worse |
| **15** | Do not keep the courses that `/routes` builds (build them for the reply without caching; raced courses cache as today) | 32 never-raced courses 14.76 MiB | served body byte-identical, AND in every round at least 10 MB lower, AND no guard worse, the track transition included |
| **16** | Release the projection bins of courses not selected (CoursePrewarm bakes them again at selection) | 1.31 MiB (a1) -> 5.10 MiB (d2); survivors +2-3 MB a round | rounds 4-6 at least 4 MB lower, AND no race starts before its bins are baked, AND no guard worse, the race-start transition included |

- Cards 14 and 15 are observer-side, like P13f's and P18's cuts. A player's session never builds the reply or those 32
  courses, so together they take about 31.5 MB of survivors out of what the graded PSS line measures.
- Not opened as cards:
  - Distribution (0.76 MiB at most without changing a measurement);
  - PerfTrace (the profiler itself);
  - the Code line (no app-held lever);
  - every owner under 1 MiB.

## Steps

0. **Section 13 of `DEATH-RIDE-DECISIONS-2026-10-07.md` (daebee5d), the first commit.** It records the App Master's five rulings
   on P19's questions: P19 accepted; 45a159d8 descriptive; card 13 before the next goal-1 soak; card 13 reads the Code line;
   the tracks package rule.
1. **The tools, each in its own commit, before any dump was read.**
   - `perf-p20-retained.py` (66bcd515): `perf-p13f-heap.py`'s record walk, copied and extended (that file is unchanged), with a
     Lengauer-Tarjan dominator tree.
   - `test_perf_p20_retained.py` (36868014), green with 8 tests:
     - a hand graph with a shared child and two cycles, with known idoms and retained sizes;
     - the Lengauer-Tarjan paper's graph;
     - 300 random graphs against the definition;
     - a hand-built ART-style dump;
     - the GC line read with `perf-p18-gc.py`'s reader;
     - growth.
   - `perf-p20-dumps.py` (5037fee0, the run's dump schedule).
   - `perf-p20-code.py` (968909f2), written after the dumps, which reads meminfo and smaps only.
   - The reader was checked for format and speed on P13f's old dump (13 s) before this run's dumps existed. That dump is not
     evidence here.
2. **The runs (286df277).**
   - `perf.apk` was built with P19's perf command (`-PappId=dev.deathride.perf "-PappLabel=Death Ride Perf" -PracePort=8772`),
     at 36868014 (deathride/main code), from the build cache.
   - `aapt badging`: `package: name='dev.deathride.perf'`, debuggable. SHA-256 `bf07c732...`.
   - Its 576 entries are CRC-identical to P19's cut.apk (9c20b2b4, the same code) (`apk-diff.txt`).
   - perf-device.py checked the badging again and installed it. The installed `base.apk` hash equals the built one.
   - Two diagnostic runs (`runs-log.txt`); see Failures.
3. **The reading (a488957b), the ledger (24fd4810), this doc and the PERF-SESSION row.**

## Failures and limits

- **(c), mid-race in the last round, was never taken.**
  - Run 1's dump (b) stalled the app 7.5 s, past the probe's 5 s request timeout, and ended the probe after one round. P13f
    measured 7.0 s for its dump.
  - Run 2 (allowed, because run 1 did not produce all four) took a2.
  - Then **the host stopped for about two hours**. The app's logcat streams were last written at 03:53:48Z, and the probe's log
    at 05:55:06Z, with a timeout after 3 rounds. The harness then stopped the dump script. No dump was in progress.
  - The brief allows two runs, so there was no third.
  - The growth from round 1 to the last round is read from ART's logged full GCs of seven earlier runs instead.
- **d2 was taken by hand from run 2's still-running process** (`run2/d-recovery.txt`), with the script's steps.
  - `/stats` read `results` (salt-1-b, phones disconnected). One BACK key to `dev.deathride.perf` (its remote's way back to the
    lobby) returned it to the lobby with the scenery ready.
  - So d2 is the lobby after run 2's last round, round 3, about 2 h after it.
  - Its heap figures are unaffected. Its meminfo shows swap: SwapPss 9.4 MiB, and App Summary Java Heap 20.3 MiB against a
    51.5 MiB Dalvik row.
- **Each dump perturbs what it sits beside.**
  - The forced GC empties the heap's garbage, so the meminfo after it is not a sample of the sawtooth.
  - Writing 70 MB evicts page cache, so `Code` reads lower after a dump.
- **Sizing.**
  - Instance sizes are ART's class object sizes, and array sizes are header plus data.
  - Class objects count only their static fields (a lower bound).
  - The dominator tree treats every loaded class as a root, as `perf-p13f-heap.py` does.
  - `Reference.referent` is not a strong reference.
- **The perf build is debuggable (JIT).** The heap figures are the app's own objects and hold for any build of this code. The
  Code line does not.
- **Nothing was graded:** no settled wait, no PSS grade, no frame figure. The runs are diagnostics (decisions section 12, ruling
  4).

## Gates

- `gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain`; see `evidence/perf/p20/tests.json`.
- `test_perf_p20_retained.py`: 8 tests green, committed at 36868014 before the first dump was read.
- **No app code changed.** `git diff deathride/main..HEAD` touches only this run's paths: the decisions doc, this doc,
  PERF-SESSION, `deathride/tools/` (four new files), `deathride/evidence/perf/p20/` and the two ledger files.
- No typecheck or lint command is configured for this project. Both are skipped, not passed.

## The device at the end (`device-state-end.txt`)

- The owner's `dev.deathride.tv` is in front, as found: the same task t330, activity record a03c5a7 and process 14337, last
  updated 2026-10-06 23:44:23. The restore intent was delivered to the running top-most instance.
- `dev.deathride.perf` was force-stopped and is not running.
- No hprof is left in `/data/local/tmp`: each dump was pulled, then `rm`'d, and `ls` confirmed it was gone.
- `dev.deathride.tracks` was not touched: still `lastUpdateTime=2026-10-09 03:27:10`, not running.
- Thermal status 0, both mixers in standby.
- The `ws` module copied into the worktree for the probe (gitignored) was removed.

## Questions

1. **The graded PSS line includes about 31.5 MB of survivors that only the probe's `/routes` creates** (cards 14 and 15).
   Should those two cards be built before the next goal-1 soak? With ART's fixed 24 MB headroom, they would lower its PSS line
   by about the same amount.
2. **The Code line on the perf build.** 7.5-17.9 MiB of it is the debuggable build's uncompressed dex, read by the JIT.
   - The release install (compiled ahead of time) was not measured.
   - Should a diagnostic run read the release build's Code line, or should the perf build's representativeness be reviewed?
   - The second option is a build-file question, outside P20's bounds.
3. **Card 16 touches the race start**, the bake that P10 moved off the render thread. Order: 14 and 15 first (observer-side,
   no player path), then 16?
4. **(c) was lost to a host stop.** Is the stand-in from ART's logged GCs (seven runs, flat on the repeated course) accepted for
   the leak question, or is one more diagnostic run wanted?
