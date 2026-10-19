# P13g - /stats served as UTF-8 blocks (same bytes), and the settled graded pair: both runs pass

2026-10-08, AFTKM `10.0.0.139:5555` (Android 11, PowerVR Rogue GE9215), isolated `dev.deathride.perf` / 8772 / private
ADB 5041. Branch `autopilot/stack-grounded-opportunity-research-708b5f31`, cut from `deathride/main` d2b12042 (P13f). Every
figure below was measured in this session. Summaries are in `deathride/evidence/perf/p13g/`. Its `manifest.json` binds the
raw logcats, `raw.json`, heap dump, APK, build and gate logs and scripts, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p13g/708b5f31/`. Nothing was pushed.

## Figures first

| Graded run (P13d's command, 360 s, profiled, `perf-p10.py`) | **P13g run 1** | **P13g run 2** | P13f step 3 (ungraded) | P13e run 2 (unsettled) |
|---|---:|---:|---:|---:|
| Host settle (wait) | **settled** (665 s) | **settled** (76 s) | no wait | not settled |
| Host CPU at start / end, % | 17-21 / 19-26 | 19 / 21-24 | 56-63 / 66-99 | 55-89 / 73-91 |
| **Transition max, ms (bar: no frame over 100)** | **83.9** | **99.6** | 114.5 | 103.3 |
| Transition windows over 100 ms | **0 of 55** | **0 of 56** | 3 of 57 | 10 of 58 |
| GCs in the probe (`art.gc.gc-count`) | 36 | 37 | 47 | 115 |
| Allocated, MB/s | 2.59 | 2.57 | 3.35 | 8.23 |
| Logged background GCs; large objects freed, MB (MB/s) | 22; 252.5 (0.70) | 19; 222.3 (0.62) | 24; 322.0 (0.89) | 57; 1,077.0 (2.99) |
| Logged GC total time, ms | 100.9-303.3 | 100.6-281.6 | 100.8-288.6 | 101.3-626.2 |
| PSS, MiB (I2 reference 192) | 169.7-178.4 | 168.8-188.5 | 174.2-195.1 | 169.2-189.3 |
| Rejected inputs; pump stalls | 0/0; 0 | 0/0; 0 | 0/0; 0 | 0/0; 0 |

| Lobby A/B, two phones paired, five 60 s phases (`stats-load-p13f/p13g.json`) | p13f.apk (bb49e716) | **p13g.apk (db1ec55a)** |
|---|---:|---:|
| Quiet (no `/stats`), MB/s; GCs a minute | 0.65; 2-3 | 0.65; 3-4 |
| The probe's `/stats` loop, MB/s; GCs a minute | 2.74 / 2.80; 12.0 | **2.01 / 2.00; 10.9-11.0** |
| `/stats` reads a second; body, bytes | 4.90 / 4.98; 76,834 / 76,856 | 4.93 / 4.95; 76,929 / 76,873 |
| **Allocated per `/stats` read, MB** | **0.428 / 0.433** | **0.275 / 0.272** (-37%) |

P13f measured 1.378 MB per read on the base code and 0.426 on its cut; this session's rerun of p13f.apk agrees (0.43).
The 0.156 MB saved per read is the 78 KB reply String plus its 78 KB UTF-8 copy.

**Verdict:** the pair passes. Both runs settled, ran back to back (run 2 began 00:23:58Z, eight minutes after run 1
began at 00:15:36Z), and neither has a transition frame over 100 ms. **M1 goal 2 is met on this APK.** Run 2's margin is
0.4 ms, on a frame inside a GC (below).

## Step 0 - the record

`DEATH-RIDE-DECISIONS-2026-10-07.md` section 6 holds the App Master's three rulings on P13f's questions (settle without
pausing anyone, up to eight 900 s waits; cut the reply String and its UTF-8 copy; PSS answered by the pair), with who
decided and why (918baa35).

## Step 1 - what shipped: `/stats` as pooled UTF-8 blocks (db1ec55a)

- `StatsReply` (`link/StatsReply.kt`): one reply as UTF-8 in 8 KiB blocks (under ART's 12 KiB large-object threshold),
  encoded from P13f's reused `StringBuilder` through a 2,048-char window (`getChars`), with `String.toByteArray(UTF_8)`'s
  exact output: 1-4 byte characters, a surrogate pair split across the window, and `?` for an unpaired surrogate.
- `RaceServer.statsReply()` fills a reply under the stats lock (the builder, the window and a pool of up to four replies
  share it) and returns it. The route writes it with `respondBytesWriter(ContentType.Application.Json,
  contentLength=reply.length)` after the lock is released, then gives it back to the pool in `finally`. No lock is held
  across the suspending write. A read that races another takes its own reply, so a reply is never refilled while it is
  being written. `statsJson()` still returns the same text (the desktop log uses it); the text P13f's build makes is
  untouched.
- Proof (`StatsJsonTest`, 6 cases, 4 new):
  - `replyBlocksAreTheUtf8OfTheText`: the blocks equal `toByteArray(UTF_8)` for accents, CJK, an emoji, unpaired
    surrogates, pairs split at the window and at block boundaries, and the populated 79 KB text. A one-byte mutation is
    detected.
  - `racingRepliesAreDistinctAndReturnToThePool`: two held replies are distinct and each is its own clock's bytes. Released
    replies are reused, and the pool stays bounded.
  - `aWarmReplyAllocatesNoReplySizedArray`: a warm build allocates 8,856 B on the JVM thread counter against a 79,239 B
    reply, so it allocates under 12 KiB in total.
  - `servedStatsAreTheOldRouteByteForByte`: a bare ktor server runs the old route line (`respondText(..., Application.Json)`)
    on the pre-P13f text at the clocks the new reply carries. Status, every header but Date (Content-Type
    `application/json`, Content-Length, `Cache-Control: no-store`) and the body are equal byte for byte. The test covers no
    Accept-Encoding, `gzip, deflate` and `gzip`, never gzipped, with a career text holding `Zoë Łódź 🏎`. 64 reads racing
    on 8 threads are each whole, valid JSON and the old route's bytes at their own clocks.
- `p13g.apk` differs from `p13f.apk` in `classes4.dex` alone (`apk-diff.txt`).
- Gate: `gradlew.bat :core:test :link:test :game:test --rerun-tasks` green. Core 261, link 29 (2 skipped, as on the base),
  game 110.

## Step 2 - the cut measured (`stats-load-*.json`, `heap-dump.json`)

- P13f's lobby A/B, both APKs in one session: 0.43 -> **0.27 MB per `/stats` read**, 2.77 -> 2.00 MB/s under the
  probe's loop, 12 -> 11 GCs a minute. The quiet rate is unchanged (0.65 MB/s). The GC count barely moves because P13f's
  cut already took the large-object churn that set the GC pace; what is left is mostly small objects.
- One `am dumpheap` of p13g.apk 35 s into the `/stats` loop (the dump stalls the app past the load script's timeout, as in
  P13f). Its unreachable arrays of 12 KiB or more are 63 `char[8192]` (16,384 B) ktor CIO request-header buffers (not
  app code) and two 12,325 B `byte[]` Career.json texts from the game's publish (not `/stats`). **No reply String, no
  UTF-8 copy and no `/stats` builder array remain.**
- The first p13g lobby launch timed out because adb's logcat stream overran (`load-p13g-try1-notready`). The rerun is the
  one reported.

## Step 3 - the graded pair (`pair.json`, `run1/`, `run2/`)

One APK (`6f5614b6...`, built from db1ec55a, arms off, `assembleDebug -PappId=dev.deathride.perf "-PappLabel=Death Ride
Perf" -PracePort=8772`). P13d's exact command twice in a row through P13f's `runs-n.sh` with eight waits; P13e's
`settle.ps1` unchanged; graded with the unchanged `perf-p10.py`. Gradle daemons were stopped before the first wait.
Both probes exited 0.

- **Settle:** run 1 settled after 665 s on its first wait (last minute 9-48%). Run 2 settled after 76 s (15-38%).
- **Transition:** run 1 max 83.9 ms (foundry round), 0 of 55 windows over 100 ms. Run 2 max 99.6 ms (salt round), 0 of 56
  windows over 100 ms. Per round, run 1: 71.0 / 83.9 / 68.1 / 60.0 / 68.7 / 62.9; run 2: 76.3 / 67.9 / 99.6 / 71.2 / 75.6
  / 74.4 ms.
- **Every frame over 100 ms** is at app start, before the probe (run 1 -31.8 to -28.0 s, run 2 -30.7 to -27.3 s), outside
  every window, as in P13e.
- **Run 2's 99.6 ms:** the interval of a lobby frame at 131.88 s, 3.1 s before round 2 (salt), between the car picks and
  the track pick. Work 41.0 ms (simulation 24.1, telemetry 10.3). The frame before it worked 97.8 ms with 11.0 ms of CPU.
  Both sit inside a 192.1 ms **background young GC with a 68.7 ms pause**, which ended at 131.89 s. That GC is the
  remaining risk to the bar.
- **Switches (k=11 interval):**
  - run 1: 18.6 / 17.5 / 19.5 / 19.4 / 17.8 ms;
  - run 2: 18.6 / 20.7 / 19.3 / 18.6 / 17.7 ms;
  - slowest window interval: 72.4 ms in run 1 and 67.9 ms in run 2, both foundry's switch frame.
- **Request timers** (run 1 / run 2):
  - car pick 9.6-42.9 / 10.2-22.5 ms;
  - `startRace` 17.7-27.1 / 19.9-35.9 ms;
  - `raceLaunch` 7.2-11.6 / 6.8-27.8 ms;
  - track 14.7-65.6 / 13.7-59.1 ms;
  - flush seat 0: 11.8-42.5 / 10.6-49.9 ms;
  - flush seat 1: 11.4-48.2 / 10.9-27.5 ms.
- `ProfileCodec.decode` compiled at startup, 33 / 32 s before the first request.
- **PSS** 169.7-178.4 and 168.8-188.5 MiB: under 192 in every sample. This answers P13f's single 195.1 MiB sample, per
  ruling 3.
- 0/0 rejected inputs, 30.0 Hz input streams, 0 pump stalls.
- **GC:**
  - 36 / 37 GCs in the probe (runtime);
  - 22 / 19 logged background GCs, 10-14 MB of large objects each, about 500 objects (~28 KB average);
  - median gap 20.4 / 20.5 s;
  - longest 303.3 ms (run 1, lobby) and 281.6 ms (run 2, foundry race), neither on a frame over 100 ms.
- perf-p10's other readings: `activeMaxMs` fails in both runs (68.1 / 70.9 ms against 33) and `activeP95WorstVsG1Ms` in
  run 2 (22.5 against 21.6). These are M1 goal 1's measures (the active race), not this bar, and are unchanged in kind
  from P13e/P13f.

## The phase that moved

The race-start goal's remaining frames over 100 ms were lobby frames inside background GCs:
- P13e run 2: 103.3 ms on a 626.2 ms GC;
- P13f step 3: 114.5 ms on a 238.4 ms GC.

Over P13f and P13g, the probe's `/stats` went from 1.378 to 0.27 MB per read. The run's GCs went from 115 to 36-37, and
large objects freed went from 2.99 to 0.62-0.70 MB/s. The longest GC in the probe went from 626.2 to 303.3 ms. The
transition max went from 103.3 ms (P13e run 2) and 114.5 ms (P13f step 3) to **83.9 / 99.6 ms**, a drop of 19.4 / 3.7 ms
against P13e run 2, with 10 -> 0 windows over 100 ms.

Limit: the earlier runs were unsettled and these settled, so this session cannot split the frame-time gain between
P13g's cut (0.156 MB per read) and a quiet host. The GC counts and allocation rates, which depend little on host load,
moved with the cuts.

## Card figures (for the optimize ledger)

- GC churn card: P13g 0.426 -> 0.27 MB per `/stats` read (reply String and UTF-8 copy cut, db1ec55a, same bytes).
- Settled pair: 36 / 37 GCs, 0.70 / 0.62 MB/s large objects freed.
- Line 18 (race-start bar): **passes on a settled pair**:
  - transition max 83.9 / 99.6 ms;
  - 0 of 55 / 0 of 56 windows over 100 ms;
  - PSS 168.8-188.5 MiB.

## Limits

- Run 2 passes by 0.4 ms. Its slowest transition frame sits in a background young GC with a 68.7 ms pause, so a longer
  pause there would fail the bar again. The remaining large objects per read are ktor CIO's 16 KB header buffers, which
  are not app code; cutting them would mean changing the engine or its configuration.
- Two runs are the bar's sample. No race finished in either run (the probe's design), so the finish path is shown by
  tests only.
- The heap dump is one sample. The lobby A/B runs no race.

## Questions

1. Run 2's margin is 0.4 ms, and the frame sits on a 68.7 ms GC pause. Should a third settled run (or a pair on the next
   build) be required before line 18's card is treated as closed for M1? This session closed it by the brief's rule (two
   settled, consecutive, passing runs).
2. ktor CIO's `char[8192]` request-header buffers (16 KB, large objects) are now the probe's main large-object allocation
   per read. Reaching them means changing the engine or its configuration, which is outside link's route code. Is it worth a
   look, or should the probe read `/stats` less often (its run arguments are out of bounds today)?
