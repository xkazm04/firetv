# P13f - The 6-7 s large-object GC churn was the probe's own /stats: built in place, same bytes; no settled pair

2026-10-07/08, AFTKM `10.0.0.139:5555` (Android 11, PowerVR Rogue GE9215), isolated `dev.deathride.perf` / 8772 / private
ADB 5041. Branch `autopilot/stack-grounded-opportunity-research-9d88747c`, cut from `deathride/main` bba8be1b (P13e); the
released run cac03d57 left no commit and was not read. Every figure below was measured in this session. Summaries are in
`deathride/evidence/perf/p13f/`. Its `manifest.json` binds the raw logcats, `raw.json`, heap dumps, APK, build and gate
logs and scripts, which are kept outside git in `C:/Users/kazda/kiro/deathride-raw-evidence/p13f/9d88747c/`. Nothing was
pushed.

## Figures first

| Reading (P13d's command, 360 s, profiled) | P13e run 1 | P13e run 2 | **P13f step 3 (the cut, ungraded)** |
|---|---:|---:|---:|
| GCs in the probe's ~355 s (`art.gc.gc-count`, every GC) | 110 | 115 | **47** |
| Allocated, MB/s (`art.gc.bytes-allocated`) | 7.82 | 8.23 | **3.35** |
| Logged background GCs (logcat lines; inside the probe) | 63 (59) | 57 (55) | **24 (23)** |
| Large objects freed by the logged GCs, MB (MB/s) | 1,123.9 (3.12) | 1,077.0 (2.99) | **322.0 (0.89)** |
| Large objects per logged GC, MB | 4.9-21.0 | 15.0-22.0 | 10.0-16.0 |
| Gap between logged GCs, min / median / max, s | 1.67 / 6.77 / 10.63 | 3.31 / 6.45 / 17.60 | 3.50 / **15.69** / 49.39 |
| Logged GC total time, ms | 63.9-456.8 | 101.3-626.2 | 100.8-288.6 (331.3 before the probe) |
| Transition max, ms (bar: no frame over 100) | 97.0 | 103.3 | 114.5 |
| Transition windows over 100 ms | 0 of 59 | 10 of 58 | 3 of 57 |
| PSS, MiB (I2 reference 192) | 161.0-177.5 | 169.2-189.3 | 174.2-195.1 |
| Host settle / CPU at start / end | not settled / 49-66% / 30-57% | not settled / 55-89% / 73-91% | no wait (ungraded) / 56-63% / 66-99% |

| Lobby A/B, two phones paired, 60 s phases (`stats-load-*.json`) | p13e.apk (base code) | **p13f.apk (the cut)** |
|---|---:|---:|
| Quiet (no `/stats`), MB/s; GCs a minute | 0.67; 3.0 | 0.66; 3.0 |
| The probe's `/stats` loop, MB/s; GCs a minute | 7.50; 31.9-32.0 | **2.77; 12.0-13.0** |
| `/stats` reads a second; body, bytes | 4.96; 76,863 / 76,810 | 4.96; 76,815 / 76,824 |
| **Allocated per `/stats` read, MB** | **1.378** | **0.426** (-69%) |

**The source:** the probe's own `GET /stats`, built by `RaceServer.statsJson` (`link/RaceServer.kt:321-329` at bba8be1b)
and `Distribution.json` (`link/Metrics.kt:20`). Each 77 KB reply allocated 1.38 MB, about 1.03 MB of it as large objects:
grown `char[]` copies of Kotlin template builders, two 34 KB slot Strings, and four fresh 32 KB `double[4096]`. At the
probe's race-loop rate this is about 5-7 MB/s, most of the app's 8.2 MB/s. Players' phones never request `/stats`, so it
is a **measurement artifact of the probe**, and it was cut on the link side with the same bytes on the wire (step 2).

**The graded pair was not run.** Before run 1, four 900 s waits (3,601 s, 22:01-23:01Z) never saw 60 consecutive seconds
under 60% CPU: the last minute of each wait averaged 96.8 / 92.4 / 93.8 / 87.2% and held 51-60 of 60 samples at or over
60% (other sessions' processes; nothing was killed or deprioritized). Per the brief, an unsettled run is not started and
not a grade. **M1 goal 2 stays open; the bar's verdict on a settled host is still owed.**

## Step 0 - the record

`DEATH-RIDE-DECISIONS-2026-10-07.md` section 5 holds the App Master's four rulings on P13e's questions (under the operator's
06:25Z delegation) with the reason for each. Line 18's card (render-thread profile saves, which tracks the race-start bar)
got P13e's figures and stays open; the optimize row's note got one P13e sentence (commit 319d9f43).

## Step 1 - the source

### Every GC (`gc-p13e.json`, `tools/perf-p13f-gc.py`)

Each logged ART GC of P13e's two runs, on the probe clock: the device clock is placed by each round's `transition
startRace` line against the probe's `startedSecond` (spread 12 ms and 62 ms across the six rounds). ART logs a GC only over
5 ms of pause or 100 ms in total, so the runtime counters (`/profile`) are the full count.

- Run 2: 57 lines, 55 inside the probe: 51 in races, 4 in the lobby, 2 before the probe (startup and the `/routes` warm-up,
  3.3-4.4 MB of large objects). Inside the probe every logged GC freed 15-22 MB in 272-509 large objects (about 44 KB
  each), every 3.3-17.6 s (median 6.45). Pauses 0.08-10.5 ms; totals 101.3-626.2 ms.
- Run 2's two frames over 100 ms sit on its two longest GCs: the 626.2 ms GC ended at 266.77 s (the 103.3 ms frame at
  266.3 s, 3.4 s before round 4) and the 363.5 ms GC ended at 333.68 s (the 100.8 ms frame at 333.4 s).
- Run 1: 63 lines, 59 inside (52 race, 7 lobby); the one over 300 ms (456.8 ms) in salt's race.
- The runtime counters: run 1 110 GCs and 7.82 MB/s, run 2 115 GCs and 8.23 MB/s (18.6 and 19.5 a minute).

### What is dropped (`heap-dumps.json`, `tools/perf-p13f-heap.py`)

Two `am dumpheap` dumps (no forced GC) of `p13e.apk` under the probe, about 140 s in, 14.8 s apart. The reader marks
what the dump's roots reach and lists the rest. Every unreachable array of 12 KiB or more (ART's large-object threshold) in
the first dump belongs to one `/stats` reply; its text says which builder made it:

| Large object (one 77 KB reply) | Bytes | Made by |
|---|---:|---|
| `char[]` beginning `{"audio":` x4 | 19,720 + 23,792 + 88,196 + 176,396 | The outer `StringBuilder(3000)` growing (`RaceServer.kt:323-324`) |
| `char[]` beginning `{"slot":0` / `{"slot":1`, x3 each | 2 x (26,188 + 52,380 + 104,764) | Each slot's template, desugared into its own growing builder (`:327`) |
| `byte[]` beginning `{"slot":` x2 | 34,238 + 34,206 | That template's String, appended once and dropped |
| `double[4096]` x4 | 4 x 32,768 | `Distribution.json`'s fresh window per call (`Metrics.kt:20`): frame, sim, two input ages |
| `byte[]` beginning `{"audio":` x2 (second dump) | 2 x 78,307 | The reply String and its UTF-8 copy (`respondText`) |
| `char[8192]` beginning `GET /stats HTTP/1.1` | 16,384 each | ktor CIO's request-line buffers (not app code) |

That is about 1,031 KB of large objects per reply, against ~44 KB per large object and 15-22 MB per GC in the logcats.
The second dump adds four HUD `char[]` (81-136 KB, `{"t":"hud"`) and two `,"hostCareer":` builders: the dump stalled the
probe past its 5 s timeout, its phones disconnected, and their HUD jobs' builders became unreachable. They are not churn.

### Proof by a switch (`stats-load-before.json`, `tools/perf-p13f-stats-load.mjs`)

`p13e.apk` in the lobby, two phones paired with the probe's own hello and 30 Hz neutral inputs, five 60 s phases. Quiet
(no `/stats`): 0.67 MB/s and 3 GCs a minute. The probe's race loop (`GET /stats`, 160 ms pause): 7.50 MB/s and 32 a minute,
at 4.96 reads a second. **`/stats` adds 6.83 MB/s: 1.378 MB per 77 KB reply, 18x its size.** Nothing else changed between
phases, and the quiet rate returned each time (0.68, 0.67, 0.66 MB/s).

So the 15-21 MB every 6-7 s is the probe's own `/stats`: at the race loop's ~3.5-5 reads a second, its ~1 MB of large
objects per reply is 3.5-5 MB/s of large objects, the 2.99-3.12 MB/s the logged GCs freed.

## Step 2 - what shipped: `/stats` built in place (bb49e716)

Both conditions hold: the allocator is in `deathride/link/`, and the fix keeps the same bytes on the wire. It is P11's
in-place build (cc882e7f) **without its gzip**, which was out of bounds:

- `statsJson` appends every field into one reused `StringBuilder` held under its own lock, instead of Kotlin templates
  (on Android each becomes its own growing builder, and each slot one also became a String). The fields, their order and
  their text are unchanged; the route line (`respondText(statsJson(), ContentType.Application.Json)`) is unchanged.
- `Distribution.json` sorts in a scratch array reused under the lock it already holds, instead of a fresh 32 KB array.

`StatsJsonTest` (3 cases) keeps the pre-P13f `statsJson` and `Distribution` verbatim:
- the new text is byte-identical on a populated 77 KB state, at three clocks, twice (reused buffer), and with `combatFull`
  swapped; and on the defaults;
- distributions match the fresh-array ones over 9,000 adds and three bin/capacity shapes, at five window offsets;
- the served `/stats` has the same status, headers (but Date) and body (but its two clock fields) as a bare server running
  the old route line on the old text, with and without `Accept-Encoding: gzip`; it is never gzipped.
- A one-field mutation (`lap` appended as a Double) fails both text tests.

The APK differs from `p13e.apk` in `classes4.dex` alone (unzipped and compared). No pixel, sound, budget, threshold, clock,
physics, input rate or render scale changed; nothing under `core/`, audio, HUD or font code changed.

What is left per reply: the 78 KB reply String and its 78 KB UTF-8 copy (removing them means serving bytes without
`respondText`), ktor's request buffers, and the small objects of the sub-builders (`audioJson`, `trafficJson` and so on),
0.426 MB in all.

## Step 3 - the cut on the Stick (`step3/`)

One ungraded 360 s run of P13d's command with `p13f.apk` (`c155e09d...`, built from bb49e716, arms off), host unsettled
(56-99%):

- GCs 115 -> **47** (runtime, against P13e run 2), logged 57 -> 24, large objects freed 2.99 -> **0.89 MB/s**, allocation
  8.23 -> **3.35 MB/s**; median gap between logged GCs 6.45 -> 15.69 s; the longest GC in the probe 626.2 -> 288.6 ms.
- PSS 174.2-195.1 MiB: over 192 at one sample (272 s, Java heap PSS 73 MiB). The GC lines show the same heap envelope as
  P13e (after GC 48-58 MB of 72-82 MB, against 47-61 of 69-85), so the cut did not raise the heap; PSS follows where in
  its GC cycle the 67 s sample lands (P13e's Java heap samples ranged 48-71 MiB).
- Transition max 114.5 ms, 3 of 57 windows over 100 ms, all three frames at 264.96-265.18 s, 3.6-3.8 s before round 4
  (crown), in the lobby: they sit inside a 238.4 ms background GC with a 7.9 ms pause that ended at 265.15 s, on a host at
  66-99%. Frame work 102.0 / 110.3 / 73.7 ms (simulation 30.9 / 24.9 / 55.6, telemetry 34.9, requests 51.9).
- Every switch window stays clean: k=11 17.5-19.2 ms, slowest window interval 80.5 ms (foundry's switch frame).
- Car pick 7.4-50.9, `startRace` 13.0-21.5, `raceLaunch` 6.6-17.4, track 13.3-72.0 ms; flush 10.0-27.6 / 9.9-37.9 ms;
  `ProfileCodec.decode` compiled at startup, 40.9 s before the first request; 0/0 rejected inputs, 0 pump stalls.

## Step 4 - the graded pair: not started

`scripts/runs-n.sh` (P13e's, P13f paths; the unchanged command and `perf-p10.py`) waited before run 1. Four 900 s waits
ended 22:16, 22:31, 22:46 and 23:01Z without 60 consecutive seconds under 60% (`run1-not-started/settle-try1..4.json`; last
minutes 71-100%, 28-100%, 40-100%, 27-100%, 51-60 samples at or over 60% each). Run 1 was not started, so run 2 was not
either. There is no settled pair and no grade: the bar's verdict, and line 18's card, stay open.

## Card S figures (for the optimize ledger)

- GC churn: 115 -> 47 GCs per 360 s run, large objects freed 2.99 -> 0.89 MB/s, allocation 8.23 -> 3.35 MB/s (P13e run 2
  against P13f step 3, both unsettled); lobby A/B 1.378 -> 0.426 MB per `/stats` read.
- Source: the probe's `/stats` (`RaceServer.kt:321-329`, `Metrics.kt:20`), ~1 MB of large objects per 77 KB reply;
  a measurement artifact.
- Built: bb49e716, same bytes (StatsJsonTest).
- Race-start bar: still unproven on a settled host; step 3's unsettled 114.5 ms max sits in a GC.

## Limits

Step 3 is one unsettled run against P13e's unsettled runs; GC counts depend on load less than frame times do, but the
frame readings of step 3 are not a grade. The heap dumps stall the app; the probe run that took them timed out after the
dump and is ungraded. The lobby A/B runs no race. The `/stats` cost of the race loop depends on the probe's own read rate,
which the probe sets; players never read it. The remaining GCs (47 per run) still land near lobby frames on a loaded host.

## Questions

1. Should the race-start grade be retried on a settled host (the next quiet window), or should the operator pause other
   sessions for the ~20 min the pair needs? P13e's settled-pair attempt and this one each waited an hour (four 900 s waits) without 60 quiet seconds.
2. The rest of the reply's large objects (its String and UTF-8 copy, 157 KB a read) can go only by serving bytes without
   `respondText`. Worth a follow-up in `link/` with a served-bytes proof like `RoutesReplyTest`'s?
3. The probe could read `/stats` less often (the steering loop's 160 ms pause), but that changes the probe's run
   arguments, which this brief left out of bounds.
