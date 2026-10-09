# P21 - Cards 14 and 15: stop keeping what only /routes built

2026-10-09, AFTKM `10.0.0.139:5555` (Android 11, PowerVR GE9215), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/codebase-static-analysis-sweep-2b60edfb`, cut from `deathride/main` 4f05315e (P20). Every figure below was
measured in this session. Summaries are in `deathride/evidence/perf/p21/`. Its `manifest.json` binds the raw files kept
outside git in `C:/Users/kazda/kiro/deathride-raw-evidence/p21/`: logcats, `raw.json.gz` files, the hprof, the APKs, and the
build and gate logs and scripts. Nothing a player sees or hears changed. Nothing was pushed.

## Figures first

**The answer.**
- **Card 14 is kept** by the rule fixed before the first graded run (0c3ac3b4). `/routes` no longer keeps its 16.76 MiB reply
  in the heap. Logged full-GC survivors read **17-18 MB lower** in every round both arms logged, and no guard is worse.
- **Card 15 is declined** by the same rule and reverted (0f04dc49).
  - Two of its guards read worse in both runs: active frames over 33 ms and the worst active-window p95.
  - Its survivors fell under the rule's 30 MB floor, so the rule graded no round. Described without the floor, they read 15-16 MB
    below card 14's.
- **Nothing settled.** Both 900 s waits failed and the host ran at 85-100% through every run. So the guards are research
  readings, and PSS is not graded. The rule applies the guards settled or not.
- **The code `deathride/main` gets is card 14 alone** (ab6b0d51). Card 15's commit and its revert are both on the branch.

### Why card 14 is not built per request (the preflight)

The card's Flow offered two ways: build the reply per request, or let the blocks go once the reply is written. Both make every
request build the reply again. Before the rule's runs, one scratch APK (`preflight/flow.apk`, `936f4ce8...`, never committed)
served `/routes` built per request. Each figure is a request to the Stick's lobby, timed by curl:

| APK | Request 1, first byte / total, s | Later requests, first byte / total, s |
|---|---|---|
| base (kept reply): P20's `perf.apk`, entry-identical | 15.57 / 17.03 | 0.03-0.12 / 0.95-1.09 (2 requests) |
| base (kept reply): this run's `base.apk` | 9.00 / 10.52 | 0.03 / 1.23 |
| per request (scratch) | 9.93 / 11.27 | **7.52-7.71 / 8.44-8.62** (3 requests) |
| c14 (built, the file) | 15.19 / 17.16 | 0.03 / 1.25 |
| c15 (built, the file, courses not kept) | 9.94 / 11.39 | 0.03-0.13 / 1.20-2.02 (3 requests) |

- The probe fetches `/routes` with a 5 s timeout (`ability-stick-probe.mjs:28,61`), after `perf-device.py`'s warm-up.
- Built per request, the probe's fetch would time out in every run of both cut arms, and every graded run would be void. The
  brief keeps the probe and `perf-device.py` unchanged.
- So card 14 writes the reply's text once, with `RoutesReply.write` (the same function and the same UTF-8 writer chain), to one
  file in `java.io.tmpdir`, which is the app's cache directory on Android. Every request streams that file with the same
  `Content-Type` and `Content-Length`. The heap keeps the file's name only. A file that has gone is written again; an earlier
  process's file is deleted when the first one is written.
- The Stick served the same body from all three arms: sha256 `2381319a...`, 17,540,089 B, in every request
  (`preflight/arms-routes-sha.txt`).
- This is a change of method within the card, made on evidence. It is question 1.

### The A/B under the rule (`ab-verdict.json`)

- **APKs.** All three are `dev.deathride.perf`, built by P19's perf command at 07:58-07:59Z and checked with `aapt badging` before
  any install.
  - base `840bc7b0...`: 0c3ac3b4's code (deathride/main 4f05315e plus docs and tools). Its 576 entries equal P20's `perf.apk`,
    entry for entry.
  - c14 `bc222256...`: ab6b0d51. It differs from base in `classes4.dex` alone.
  - c15 `e191b04c...`: 10170a82. It differs from c14 in `classes2.dex` alone.
  - Each was built in this worktree with `deathride/` checked out to its commit (`git diff <commit> -- deathride` empty), then
    restored.
- **Runs.** Six profiled 360 s runs on the default sound arm, P19's `ab.sh` with only its paths changed, interleaved base, c14,
  c15, base, c14, c15. No heap dump, allocation tracker or forced GC.
- **Settle.** base-run1 waited twice, 900 s each, and did not settle. The last minutes read 57-100% (59 of 60 samples at or over
  60%) and 33-100% (47 of 60). The other five runs ran without waits.
- **Survivors** are the `usedMB` of each logged full GC over 30 MB, by round (`raceLaunch` lines).

| Reading | base-run1 | c14-run1 | c15-run1 | base-run2 | c14-run2 | c15-run2 |
|---|---:|---:|---:|---:|---:|---:|
| Host CPU at start / end, % | 78-100 / 100 | 96-100 / 85-100 | 85-100 / 99-100 | 100 / 100 | 100 / 100 | 99-100 / 97-100 |
| Rounds; functional | 6; yes | 6; yes | 6; yes | 6; yes | 6; yes | 6; yes |
| **Survivors over 30 MB, rounds 1-6, MB** | 49 50 52 55 58 58 | 31 32 35 37 40 40 | none | 48 - 52 55 57 - | - - - 37 40 - | none |
| Survivors, every logged full GC (descriptive), MB | as above | as above | - 16 18 21 24 24 | as above | as above | 13 16 19 21 25 25 |
| ART GC count; GC time, ms | 31; 2,858 | 31; 3,100 | 39; 3,459 | 31; 2,597 | 38; 2,173 | 37; 4,289 |
| Allocated, MB/s | 2.221 | 2.235 | 2.213 | 2.234 | 2.265 | 2.130 |
| **Active frames over 33 ms (guard)** | 107 | 103 | **135** | 129 | 84 | **241** |
| **Worst active-window p95, ms (guard)** | 27.196 | 26.035 | **30.138** | 38.979 | 25.325 | **34.456** |
| Active max, ms | 72.07 | 73.39 | 80.93 | 84.62 | 75.75 | 79.17 |
| Rejected inputs (guard) | 0 / 0 | 3 / 3 | 0 / 0 | 11 / 12 | 0 / 0 | 0 / 0 |
| Track transition max, ms: `track` / `configureWorld` (rounds 1-5) | 65.1 / 64.8 | 78.2 / 78.0 | 58.3 / 58.0 | 60.2 / 59.9 | 67.7 / 67.3 | 61.0 / 60.7 |
| PSS min - max, MiB | 157.10 - 166.28 | 140.92 - 164.88 | 139.28 - 158.31 | 148.33 - 180.85 | 132.31 - 153.14 | 137.01 - 152.62 |
| Java heap / Code at the PSS peak, MiB | 64.05 / 21.05 | 56.37 / 30.63 | 40.75 / 38.38 | 61.61 / 40.21 | 49.84 / 24.17 | 39.37 / 30.67 |
| routes warm-up, s | 15.82 | 16.53 | 21.80 | 10.56 | 9.66 | 21.45 |

- **The headroom.** Every logged full GC of base and c14 left a 24 MB headroom, as P18 and P20 found. Under 24 MB of survivors,
  the c15 runs' headroom fell to 14-22 MB: ART's footprint becomes twice the survivors (P20's `heap.cc` reading, `delta = used/3`
  times 3).
- **Rounds logged.** ART logs a GC only when it pauses over 5 ms or runs over 100 ms. c14-run2 logged two full GCs and base-run2
  nine, so only rounds 4 and 5 hold a GC in every run of base and c14.

**Card 14's verdict (the rule's own words): kept.**
- Its served-bytes tests are green: `RoutesReplyTest` (3, unchanged) and `RoutesServedTest` (3).
- In every graded round both c14 runs' lowest survivors read at least 12 MB below both base runs'.
  - Round 4: 37 / 37 against 55 / 55 (gap 18).
  - Round 5: 40 / 40 against 58 / 57 (gap 17).
  - Rounds 1-3 and 6 are not graded, because c14-run2 or base-run2 logged no GC in them. Where c14-run1 and base-run1 both logged
    one, c14-run1 reads 18 MB lower in every round (31-40 against 49-58).
- No guard is worse. A guard is worse only when both c14 runs read above both base runs:
  - over 33 ms: 103 / 84 against 107 / 129;
  - worst p95: 26.035 / 25.325 against 27.196 / 38.979 ms;
  - rejected inputs: 6 / 0 against 0 / 23.
- PSS max 164.88 / 153.14 against 166.28 / 180.85 MiB. Both c14 runs are below both base runs, but PSS is not graded
  (unsettled). Its grade goes to P22.

**Card 15's verdict (the rule's own words): declined, compared with c14 because card 14 is kept.**
- Its tests are green: `CoursesKeptTest`, `CoursePrewarmTest` (unchanged), `RoutesReplyTest` and `RoutesServedTest`.
- **No round is graded.** Every logged full GC of both c15 runs read under the rule's 30 MB floor (13-25 MB).
- **Two guards are worse:**
  - over 33 ms: 135 / 241 against 103 / 84;
  - worst p95: 30.138 / 34.456 against 26.035 / 25.325 ms.
- Not worse: rejected inputs (0 / 0 against 6 / 0) and the track transition (`track` 58.3 / 61.0 against 78.2 / 67.7 ms,
  `configureWorld` 58.0 / 60.7 against 78.0 / 67.3 ms).
- PSS max 158.31 / 152.62 against 164.88 / 153.14 MiB (not graded).
- It was reverted with `git revert` (0f04dc49), whose message holds these figures.

**What the guards may mean (not proven).**
- The host was at 85-100% in every run, so slow frames are partly the host's.
- c15 is also the only arm whose survivors fall under 24 MB, where ART's headroom shrinks below 24 MB. Its GC time (3,459 / 4,289
  ms) is the highest of the three arms.
- This run cannot separate the two. Question 2.

### The diagnostic dump (`diag/`): the c15 APK at P20's point a

One more run, ungraded: `perf-p20-dumps.py --plan a` on the c15 APK. P18's arm is unchanged, and `am dumpheap -g` ran in the lobby
after the `/routes` warm-up and before the probe. The dump is 36 MB, written in 6.29 s. The probe ran on and finished. The dump was
read with `perf-p20-retained.py` and P20's `instances.py`.

| Reading | P20 a1 (deathride/main) | P21 a (c15) |
|---|---:|---:|
| App heap reachable, MiB | 43.29 | **10.37** |
| ART's GC line (used / footprint) | 46 MB / 70 MB | 12 MB / 24 MB |
| `RoutesReply` retained, MiB (instances) | 16.76 (1) | **0 (0)** |
| `Course` retained, MiB (courses built) | 17.23 (39) | **1.62 (2: scrap-1-c 1.62 with its bins, foundry 0.01)** |
| `RoutesFile` retained | - | 80 B (1) |

- **The reconciliation is outside P20's 10% line.** The app heap alone reads -13.6% against ART's 12 MB, and the app heap plus
  zygote +26.7%.
  - ART prints whole MB, and the zygote space (4.84 MiB) is in ART's `used`.
  - The absolute gaps (-1.6 / +3.2 MiB) are about P20's (-2.7 to -2.9 / +1.7 to +2.1). Only the base is smaller.
  - No verdict reads this dump. It shows which objects are gone, not a ranking.
- The c14 APK was not dumped, as the brief asks for c15 only. By P20's ranking its point a would hold Course about 17.2 MiB and
  no RoutesReply.

## Step 0 - the record

Section 14 of `DEATH-RIDE-DECISIONS-2026-10-07.md` (9be5d816, this branch's first commit) records:
- the owner's 06:34Z ruling on goal 1's measure (ask ec436b62);
- the App Master's rulings: cards 2 and 3 wait on the soak, P20 is accepted, P20's five questions are answered, and the order is
  P21, then P22, then card 16.

## Step 1 - the rule

`tools/perf-p21.py` (0c3ac3b4) was committed before any app change and before the first graded run. It loads `perf-p19.py`'s run
reader, guards and void test, and `perf-p18-gc.py`'s GC line, without copying them. Its `RULE` fixes:
- the arms and the build command;
- the six runs and their order;
- the settle (P19's);
- the void rule (rejections do not void a run);
- survivors by round, with the 30 MB floor of the card's Method;
- P19's three guards and the track transition (rounds 1-5, `track` and the pick's `configureWorld` totalMs, max per run);
- both keep rules (card 15 against c14 when card 14 is kept, else against base);
- PSS, graded only on a settled pair.

Before it was committed it was dry-read on P19's four runs, and its survivors equalled P20's `survivors.json`. No reader changed
after the first graded run.

## Step 2 - card 14 (ab6b0d51)

- **Readers of the cached reply** (listed in the commit message):
  - `RaceServer.kt:185`, the route, is the only one. The lazy was at `:401`.
  - The HTTP readers of `/routes` are tools only: `perf-device.py:88`, `ability-stick-probe.mjs:61` and LAN check scripts.
- **`RoutesFile.kt`** writes and streams the file. `RaceServer`'s companion holds a `RoutesFile`, not a `Lazy<RoutesReply>`.
  `RoutesReply.of` stays as the blocks `RoutesReplyTest` proves.
- **`RoutesServedTest` (new, 3):**
  - two requests serve identical bytes, equal to `RoutesReply.of(Courses.playable)`, with the same `Content-Length`, and the heap
    after a full GC grew 48,688 B over them;
  - no static field of `RaceServer` and no field of `RoutesFile` can hold the reply;
  - the file holds the reply and is written again when it has gone.
- **The control is seeded red** (`c14-control-red.txt`): against 0c3ac3b4's server the heap grew 18,752,680 B, and the static
  field test failed.

## Step 3 - card 15 (10170a82, reverted at 0f04dc49)

- **Readers of `Courses.built` and `Courses.playable`** (listed in the commit message).
  - `built` is read and filled only by `Courses.course()`. Its callers are `Courses.all`, `Courses.playable` and
    `CoursePrewarm.submit(index)`.
  - In main sources, `Courses.playable` is read only by `RaceServer.kt:401`.
  - No frame, round or lobby list needs every course built:
    - the game's catalogue is `Courses.all`;
    - the lobby and controller lists are `Courses.json`, which has no geometry;
    - a pick is built by `CoursePrewarm.submit(index)` on the course worker before `configureWorld` reads it.
  - So the card was built.
- **The change:** `Courses.playable` returned the kept course when a selection built it, and otherwise a build it did not keep.
- **`CoursesKeptTest`:** after a walk of `Courses.playable` that read every point, only the selected course was kept. Its control
  was red on the old cache: 38 courses kept beside the 1 selected.
- `CoursePrewarmTest` and `RoutesReplyTest` were never changed.

## Failures and limits

- **No run settled** (see the settle above). The guards are research readings on a host at 85-100%, and PSS is not graded.
  base-run2's 23 rejected inputs and 38.979 ms window are that host's. The P15 Wi-Fi stall card voids nothing.
- **The 30 MB floor.**
  - The floor comes from `perf-p18-gc.py`, where it kept startup GCs out. The card's Method kept it.
  - Here it hid card 15's survivors entirely. Card 14's round 1 survivors (31 MB) sit just above it.
  - The rounds already exclude startup: round 0 is before the first race and is not graded. A floor-free reading would have
    graded card 15's survivors. That reading is in `survivors-nofloor.json`, written after the runs, and no verdict reads it.
- **ART logs only slow GCs.** c14-run2 logged two full GCs and base-run2 nine, so card 14 is graded on two rounds.
- **Card 14 writes a 17.5 MB file** into the app's cache directory once per process, when `/routes` is first requested (never by a
  phone). It lengthens no request after the first (0.03 s to the first byte), and the c15 runs' warm-up (21.5-21.8 s) includes the
  file write and the course builds.
- **The diagnostic reconciliation** is outside 10% at this heap size (above).
- **Not measured:**
  - a settled pair;
  - the PSS line on a 900 s soak (P22);
  - the release build's Code line (P22, ruling 3(b));
  - a c14 dump.

## Gates

- **At the card 14 commit (ab6b0d51):** `gradlew.bat :core:test :link:test :game:test --rerun-tasks`.
  - Its first run failed one `HudPayloadTest` timing assertion: a websocket change within 500 ms, with no `/routes`, under the
    parallel build on a loaded host. That test passed alone.
  - The second full run was green: core 261, link 37 (2 skipped, as on the base), game 121.
- **At the card 15 commit (10170a82):** green, core 262, link 37 (2 skipped), game 121.
- **At the last code commit (0f04dc49, card 14's code): two green runs and one red**, in `evidence/perf/p21/tests.json`.
  - Run 1 at 0f04dc49 was green: core 261, link 37 (2 skipped), game 121.
  - Run 2 at 1e23e5d3 (evidence, ledger and docs committed; the same code) failed two `ProfileSavesTest` timing assertions with
    the host at 100%. No P21 commit touches `game/` or `app/`. The class passed alone (9 tests).
  - Run 3 at 1e23e5d3 was green, with the same counts as run 1. Runs 2 and 3 ran after the evidence was committed
    (`EvidenceRuleTest`).
- **`assembleRelease` with `:desktop:compileKotlin` passed** at 0f04dc49 in 10 min 46 s: `5dc4ecd8...`, package
  `dev.deathride.tracks`, not debuggable (`release-badging.txt`).
- **What did not change:**
  - anything a player sees or hears;
  - any threshold, clock, input rate, render scale, I2 limit or audio default;
  - the probe, `perf-device.py`, `perf-p18-gc.py`, `perf-p19.py` and `settle.ps1`;
  - `app/`, `game/`, `art/`, the evidence outside `p21/`, and `desk/`.
- No GC was forced and no heap dump was taken in a graded run.
- No typecheck or lint command is configured for this project. Both are skipped, not passed.

## The device at the end (`device-state-end.txt`)

- **The owner's `dev.deathride.tv` is in front, as found:**
  - task t330, activity record a03c5a7 and process 14337;
  - `0.1-spike`, last updated 2026-10-06 23:44:23, `base.apk` `06cee0ab...` (unchanged since `device-state-start.txt`).
  - The restore intent was delivered to the running top-most instance.
- **`dev.deathride.perf` was force-stopped and is not running.**
  - It holds the c15 APK from the diagnostic run. P22 installs its own.
  - The `/routes` file in its cache was removed.
- **No hprof is left on the device.** The dump was pulled, then removed, and `ls` found none.
- **`dev.deathride.tracks` was not touched:** `e7280368...`, last updated 2026-10-09 03:27:10, not running.
- Thermal status 0.
- The `ws` module copied into `deathride/tools/node_modules` for the probe is gitignored and was removed.

## Questions

1. **Card 14's method.** The card's Flow (build per request, or let the blocks go once written) times out the probe's 5 s
   `/routes` fetch on the Stick (7.5 s per build). Card 14 instead keeps the bytes in a file in the app's cache directory. Is the
   file accepted as within the card, or should the probe's fetch timeout be reviewed instead? The probe is outside this run's
   bounds.
2. **Card 15.** It was declined by its frame guards on an unsettled host, with its survivors 15-16 MB below c14's (described) and
   hidden by the 30 MB floor. Should it be re-graded under a rule that reads survivors without the floor, on a settled pair? If so,
   before or after P22? A cost to weigh: under 24 MB of survivors ART's headroom shrinks below 24 MB, and the c15 arm had the most
   GC time.
3. **The 30 MB floor.** It now sits just under card 14's round 1 survivors (31 MB). Should P22's and card 16's rules read every
   full GC from round 1 on, without a floor?
