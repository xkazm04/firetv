# P18 - What makes the Java heap swing behind the PSS peak (card 5)

2026-10-08/09, AFTKM `10.0.0.139:5555` (Android 11, PowerVR GE9215), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/stack-grounded-opportunity-research-acbad996`, cut from `deathride/main` 992c48a9 (P17). Every figure below
was measured in this session. Summaries are in `deathride/evidence/perf/p18/`. Its `manifest.json` binds the raw logcats,
`raw.json.gz` files, the allocation tracker's samples, the APKs, and the build and gate logs and scripts. Those are kept outside
git in `C:/Users/kazda/kiro/deathride-raw-evidence/p18/`. Nothing a player sees or hears changed. Nothing was pushed.

## Figures first

**The answer.**
- **What the swing is made of.** In a race, two thirds of what the app allocates is the probe's own HTTP reads, and 56% of
  the bytes are large objects (12 KiB or more).
- **What sets its height.** The swing's height is ART's heap headroom, not the allocation rate. After every logged full GC,
  in all five P18 runs, ART grew the heap to exactly **24 MB** above what survived.
- **The cut.** The largest allocator in game/ or link/ was the probe's `/profile` reply: 3.4-4.0 MB of large arrays per 10 s
  read. It is now served in place with the same bytes, and it is kept by the rule: **2.60 / 2.58 -> 2.27 / 2.25 MB/s**,
  GCs 35 -> 33.
- **The PSS line.** It is not graded: the host never settled. The cut runs' PSS max did not fall (181.9 / 186.6 against
  182.0 / 168.1 MiB), as the headroom finding predicts.

### The allocator table (step 1: one diagnostic 360 s race of deathride/main, default sound arm)

Source: ART's own allocation tracker, read by `tools/perf-p18-alloc.py` and `tools/perf-p18-audit.py`.

- **Samples:** 67 race windows of about 0.69 s, taken every 5 s, 46.0 s tracked in all. They hold **524,322 records**, and none
  was full (ART keeps 65,535).
- **Sampled race rate:** **1.69 MB/s, 11,410 objects/s**, mean object 148 B.
- **The run's ART counter:** 2.68 MB/s over the whole probe, lobby included, of which 0.30 MB/s is the tracker's own replies.
- **Shares:** share of the sampled race bytes. "Of 2.59" is the site's rate over P17's whole-probe 2.59 MB/s.

By what made the allocation happen (the whole stack):

| Path | MB/s | Objects/s | Share | Of 2.59 | Large-object share |
|---|---:|---:|---:|---:|---:|
| Probe: HTTP request parse (ktor CIO, every request) | 0.624 | 630 | **36.9%** | 24.1% | 97% |
| Probe: `/profile` (every 10 s) | 0.335 | 17 | **19.8%** | 12.9% | 99% |
| Phones: websocket (HUD sends, inputs, acks) | 0.298 | 4,648 | 17.6% | 11.5% | 2% |
| Probe: `/stats` (3.5-5 a second) | 0.182 | 1,163 | 10.7% | 7.0% | 0% |
| Game loop (render thread) | 0.143 | 1,821 | 8.4% | 5.5% | 2% |
| Other link threads (coroutine dispatch, sockets) | 0.091 | 2,770 | 5.4% | 3.5% | 0% |
| Course worker, profile writers, main thread, audio and exited threads | 0.020 | 361 | 1.2% | 0.8% | - |

By module (the site's first frame in the app's own code; a stack with none is the engine or platform under it):

| Module | MB/s | Objects/s | Share | Of 2.59 |
|---|---:|---:|---:|---:|
| link: ktor engine (no app frame) | 0.936 | 6,952 | 55.3% | 36.1% |
| link | 0.430 | 1,442 | 25.4% | 16.6% |
| game | 0.165 | 1,124 | 9.8% | 6.4% |
| core | 0.133 | 1,394 | 7.9% | 5.1% |
| audio | 0.019 | 200 | 1.1% | 0.7% |
| link: coroutines (no app frame) | 0.006 | 193 | 0.4% | 0.2% |
| platform | 0.004 | 102 | 0.2% | 0.1% |
| HUD/font (GlyphLayer, HandCutFont) | 0.0001 | 3 | 0.0% | 0.0% |

The top call sites (`alloc-audit.json` lists 60):

| # | Site | Module | Path | MB/s | Objects/s | Share | Of 2.59 |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `ByteBufferChannel.readUTF8LineToUtf8Suspend:1955` from `HttpParserKt.parseHeaders` / `parseRequest`: a `char[8192]` (16 KiB, a large object) per header line | link (ktor engine) | probe HTTP | 0.613 | 267 | **36.2%** | 23.7% |
| 2 | `RaceServer.kt:180`, the `/profile` route's template (grown `char[]`, the String, respondText's UTF-8 copy) | **link** | probe `/profile` | 0.172 | 1.8 | **10.2%** | 6.7% |
| 3 | `PerfTrace.json:35` (+ `:24`, `:20`, `:33`), the trace text the template holds | **link** | probe `/profile` | 0.161 | 2.0 | 9.5% | 6.2% |
| 4 | ktor websocket session: `StringBuilder` growth in `outgoingProcessorLoop` / `runIncomingProcessor` | link (ktor engine) | phones | 0.114 | 729 | 6.7% | 4.4% |
| 5 | `RaceGame.combatHudJson:967`, the phones' combat HUD built each frame (its callees `Abilities.hudJson:205`, core, 0.019 MB/s, and `weaponStatesJson:971-973`, game, 0.018 MB/s, are their own sites) | game | game loop | 0.053 | 109 | 3.1% | 2.0% |
| 6 | `Abilities.json:211`, from `RaceGame.trafficJson` | core | probe `/stats` | 0.033 | 184 | 1.9% | 1.3% |
| 7 | `RaceGame.combatJson:977` | game | probe `/stats` | 0.033 | 49 | 1.9% | 1.2% |
| 8 | ktor websocket: `StringFactory.newStringFromChars` | link (ktor engine) | phones | 0.029 | 435 | 1.7% | 1.1% |
| 9 | `AiBehaviour.json:291`, from `RaceGame.trafficJson` | core | probe `/stats` | 0.028 | 148 | 1.7% | 1.1% |
| 10 | `RaceServer$handle$3:237`, a received text frame | link | phones | 0.026 | 50 | 1.5% | 1.0% |
| 11 | `Distribution.json:29` | link | probe `/stats` | 0.018 | 123 | 1.1% | 0.7% |
| 12 | `InputPacket.toDoubleOrNullFast:92` (+ `handleInput:254`) | link | phones | 0.023 | 653 | 1.3% | 0.9% |
| 13 | `CueService.statsJson:181`, `QueuedAudioBackend.statsJson:124` | audio | probe `/stats` | 0.014 | 50 | 0.8% | 0.5% |

**What one `/profile` read costs.**
- Samples that caught a whole read held 3.38-3.95 MB in 100-183 records. 6-18 of those records are arrays of 12 KiB or more
  (up to 1.06 MB): the template's and `buildString`'s doubling `char[]`, the 300 KB String and the 360 KB UTF-8 copy.
- One read every 10 s is 0.34-0.40 MB/s.
- On the JVM, `ProfileReplyTest` measures the old text and its UTF-8 copy at 2.31 MB above the cost of formatting the rows,
  for a 225 KB reply.

**Plainly:**
- The probe's HTTP reads are **67.4%** of a race's allocation: the request parse, `/profile` and `/stats`. Players' phones make
  no HTTP request in a race.
- What a player's race allocates (websocket, game loop, other threads) is about **0.55 MB/s**.
- core is 7.9% and audio 1.1%. The HUD font pages allocate nothing measurable (0.0001 MB/s).

### The PSS breakdown at the peak (step 1, the audit run, as P17 read it)

| Sample | TOTAL | Java heap | Native | Graphics (GL mtrack) | Code | Other + system + stack |
|---|---:|---:|---:|---:|---:|---:|
| Peak (275.4 s) | **172.9** | 71.7 | 11.0 | 52.1 | 19.3 | 18.9 |
| Lowest (0 s, before the probe) | 155.2 | 50.6 | 11.0 | 52.0 | 23.5 | 18.1 |
| Peak - lowest | +17.7 | **+21.0** | 0.0 | +0.1 | -4.3 | +0.8 |

As in P17, the peak is Java heap, while graphics and native heap stay flat. The A/B runs read the same at their peaks:
- Java heap 75.2 / 59.3 MiB in the base runs and 73.0 / 73.7 MiB in the cut runs;
- graphics 52.0-52.3 MiB;
- native 10.2-10.4 MiB.

### What sets the swing's height: ART's headroom (`gc-headroom.json`, `tools/perf-p18-gc.py`)

Each GC line ART logs ends with what survived and the footprint it grew the heap to. ART logs only the GCs that pause over 5 ms
or run over 100 ms.

| Run | Logged GCs (full) | Footprint minus survivors after each full GC | Survivors | Footprint | Freed per GC (median) | Large-object share of freed |
|---|---:|---|---|---|---:|---:|
| audit | 29 (20) | **24 MB** in all 20 | 41-58 MB | 65-82 MB | 23.0 MiB | 56% |
| base-run1 | 22 (19) | **24 MB** in all 19 | 48-58 | 72-82 | 23.0 | 52% |
| cut-run1 | 11 (7) | **24 MB** in all 7 | 50-58 | 74-82 | 21.0 | 45% |
| base-run2 | 20 (18) | **24 MB** in all 18 | 48-59 | 72-83 | 23.0 | 53% |
| cut-run2 | 11 (9) | **24 MB** in all 9 | 50-58 | 74-82 | 22.4 | 46% |

- The heap fills those 24 MB before the next GC, whatever the rate. The allocation rate sets **how often** the heap swings
  (GCs 35 -> 33), not **how high**.
- The PSS peak is the survivors (48-59 MB) plus up to 24 MB of headroom, plus where in that cycle one of the probe's **8 PSS
  samples per run** (one every ~68 s) lands.
- The Stick's settings: `dalvik.vm.heapmaxfree` 8m, `heapminfree` 512k, `heaptargetutilization` 0.75, `heapgrowthlimit` 192m,
  and no foreground growth multiplier property. The 24 MB is measured; which of ART's rules produces it was not traced.

### The A/B under the rule (step 4, `ab-verdict.json`, `perf-p18.py` fixed at 70fe350c before the first run)

Base `be571718...` is deathride/main 992c48a9, byte-identical to P17's perf.apk. Cut `dd2d9754...` is 293f77a0 and differs in
`classes4.dex` alone. The runs were four profiled 360 s runs on the default sound arm, interleaved: base, cut, base, cut.

| Reading | base-run1 | cut-run1 | base-run2 | cut-run2 |
|---|---:|---:|---:|---:|
| Settled | no (two 900 s waits) | no (no wait) | no (no wait) | no (no wait) |
| Host CPU at start / end, % | 48-63 / 47-52 | 29-33 / 54-77 | 100 / 54-96 | 66-89 / 100 |
| **Allocated, MB/s (ART)** | **2.599** | **2.271** | **2.576** | **2.254** |
| GCs / GC time, ms / blocking | 35 / 3,337 / 0 | 33 / 2,436 / 0 | 35 / 3,213 / 1 | 33 / 3,001 / 1 |
| Logged GCs | 22 | 11 | 20 | 11 |
| PSS min - max, MiB | 161.8 - **182.0** | 164.5 - **181.9** | 156.9 - **168.1** | 166.5 - **186.6** |
| Java heap at the peak (peak - lowest), MiB | 75.2 (+20.7) | 73.0 (+22.5) | 59.3 (+10.5) | 73.7 (+25.3) |
| Peak sample at | 336.7 s | 336.7 s | 3.7 s | 273.9 s |
| No-regression: active frames over 33 ms | 68 | 84 | 96 | 95 |
| No-regression: worst active-window p95, ms | 25.145 | 24.603 | 26.888 | 26.721 |
| No-regression: rejected inputs | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Rounds; `/profile` reads | 6; 33 | 6; 33 | 6; 33 | 6; 33 |

**Verdict (the rule's own words):**
- **Keep the cut.** Its equivalence test is green (`ProfileReplyTest`: 5 tests, 0 failures, errors or skips). Both cut runs
  allocate less than both base runs: 2.271 and 2.254 against 2.576 and 2.599 MB/s. The cut saves 0.323-0.328 MB/s, about
  **3.4 MB per `/profile` read**, the audit's figure.
- **The PSS line is not graded.** No run settled. On the readings alone it would not pass: cut-run2's 186.6 MiB is above both
  base runs.

The no-regression readings decide nothing under the rule. They move within each pair, on a host at 29-100%.

## Step 0 - the record

Section 11 of `DEATH-RIDE-DECISIONS-2026-10-07.md` (046d3f38) records the App Master's six rulings on P17's questions, under the
operator's 06:25Z delegation:
- 3e9f09dc accepted as descriptive;
- the p95 question is with the owner;
- card 2 is within N3 and the clocks rule, but not scheduled;
- card 7 is declined;
- the inert schedstat path stays;
- card 5 goes before card 6.

## Step 1 - the audit

**The source, and why.**
- ART's own allocation tracker, switched on and read over the debuggable perf package's JDWP with DDM chunks only (`REAE`,
  `REAQ`, `REAL`), by `tools/perf-p18-alloc.py` (c2141ba6).
- No debugger agent loads, and nothing in the app changed. Each record carries its size, thread and class, and up to 16 frames
  with line numbers. So a site is named exactly, on every thread, ktor's included.
- The other two candidates were not chosen:
  - A heap dump lists only what is still in the heap when it is taken, and names no call site. P13f's two dumps held only
    1.2-4.9 MB unreachable, against a 21-24 MB swing.
  - A perf-only per-phase counter would see the render thread's phases only, and would have put a new path into the app.
- **Sampling:** tracking on for 0.5 s, then read, then off (switching it off clears ART's records), every 5 s. A sample is
  complete while it holds fewer than 65,535 records. The busiest held 10,355.

**Its cost to the device** (`alloc-audit.json` `cost`, rows on the profile clock):
- Inside a tracked window the render thread ran as outside one: interval p50 16.685 / 16.685 ms, work p50 9.41 / 9.43 ms.
  Frames over 33 ms were 0.71% of rows inside and 1.52% outside.
- **Each read stalls the app.** Building the reply holds ART's tracker lock while every allocating thread waits. The read
  took p50 0.33 s (max 0.91 s). The worst render interval around each read was p50 233 ms, max 807 ms.
- So the run's active max is 280.4 ms, and the probe refused 58 + 75 inputs on those stalls (it exits 1 on that assertion
  only). The run is a diagnostic, not a grade.
- The tracker's own replies are Java arrays: 0.30 MB/s of the run's 2.68 MB/s.

**Not traced:** what survives a GC. The 48-59 MB of survivors are live data; the tracker sees allocation, not retention.

## Step 2 - the rule

`tools/perf-p18.py` (70fe350c) was committed before the first A/B run. It starts from `perf-p17.py`: P17's readers and its PSS
breakdown are reused, and its present-time and cause readings are not needed. Its `RULE` fixes:
- the procedure (four interleaved profiled 360 s runs, default sound arm, no heap dump, no tracker, no forced GC);
- the settle (at most two 900 s waits before the first run; if it does not settle, the rest run without waits and the four
  runs are research);
- the void rule;
- the readings;
- the two verdicts quoted above.

`tools/perf-p18-gc.py` was written after the runs. It is descriptive, and no verdict reads it.

## Step 3 - the cut (293f77a0)

**Where it lives.** The largest allocator in game/ or link/ is the `/profile` reply, in `link/`. Its two lines:
- `RaceServer.kt:180` (10.2%);
- `PerfTrace.json` (9.5%) inside it.

It is one reply's text, and one change cuts both.

**What the reply does now:**
- `PerfTrace.writeJson` formats the same text a piece at a time (about 4,096 chars).
- The route encodes each piece straight into pooled 8 KiB UTF-8 blocks. This is P13g's `StatsReply`, now with a pool size and a
  block cap: `/profile` keeps one reply of at most 64 blocks (512 KiB).
- The reply is written by `respondBytesWriter` with its length.
- The rows are still copied under the trace's lock as before, so the render thread's `append` never waits on formatting.
- `PerfTrace.json()` keeps its text. `/stats` is unchanged (`StatsJsonTest` green).

**What is left per read:** the two row copies (about 0.23 MB for a 10 s read) and small objects.

**The proof** (`ProfileReplyTest`, 5 cases, over frame and input rows recorded on the Stick in the audit run). The pre-P18
`PerfTrace` and route line are kept verbatim in the test.
1. `json()` is the old text at 3 capacities and 8 cursors (empty, wrapped, past the end, negative).
2. The reply's bytes are the UTF-8 of the old route's text at 6 cursor pairs, twice (the reuse path). This holds with and
   without a runtime map, the map holding `Zoë Łódź 🏎`. A one-field change is caught.
3. The pool keeps one reply, trimmed to 64 blocks on release. A racing read takes its own reply.
4. Warm, a read of 600 rows adds **992 B** to formatting its rows. The old text adds **2,313,768 B** for a 225,034-byte reply
   (JVM thread counter).
5. The served `/profile` equals a bare ktor server running the old route line on the old traces: status, every header but Date
   (Content-Type `application/json`, Content-Length) and the body byte for byte. That covers 5 queries (none, the probe's, past
   the end, malformed) x 3 Accept-Encodings, never gzipped.

**No draw path changed**, so no pixel diff is owed. Not reported as changed:
- the ktor engine's header buffers (section 7 ruling 2);
- core's `/stats` JSON builders;
- audio's stats;
- the HUD font pages.

## Failures and limits kept

- **No run settled.** Two 900 s waits before base-run1 never saw 60 quiet seconds: their last minutes ran 51-100% and 35-100%,
  with 51-52 of 60 samples at or over 60%. The other three ran without waits, as the brief says. The four runs are research,
  and the PSS line is not graded.
- **The PSS max is a sample of a sawtooth.**
  - The probe reads PSS 8 times a run. The max is wherever one of those lands in a 24 MB GC cycle: base-run2's peak is its
    second sample, at 3.7 s.
  - No 360 s pair resolves a PSS difference smaller than that cycle. A cut of the allocation rate does not move the cycle's
    height (the headroom table above).
- **The cut is observer-side.** `/profile` exists only while profiling, and players' phones never read it. It lowers what the
  profiled probe adds to the graded runs, as P13f/P13g's `/stats` cuts did (section 6 ruling 2). A player's race is unchanged.
- **The audit is one run, of the base, with the tracker on.**
  - Its windows cover 13% of the race.
  - A 10 s event like `/profile` is caught whole in only some of them, so its sampled share is less precise than a
    steady-state site's. The A/B's measured -3.4 MB per read agrees with it.
  - The read stalls inflate the run's frames and rejections.
  - Lobby phases are not in the table: 3 lobby and 2 round-edge samples, left out.
- **The tracker's "objects/s" counts allocations.** A large object counts once, whatever its size.
- **Not measured:** what survives a GC (retention); an unprofiled run; a sound-off run; a 900 s run (forbidden).

## Gates

- `gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain`, twice, both **green**. Both are in
  `evidence/perf/p18/tests.json`.
  - Run 1 was at 293f77a0 and run 2 at 474f9ef1, with the A/B evidence committed.
  - Each read core 261 (`EvidenceRuleTest` included), link 34 (29 + `ProfileReplyTest` 5; 2 skipped, as on the base) and
    game 117.
  - No run failed, so nothing was rerun.
- **`assembleRelease` passed**, with `:desktop:compileKotlin`: 293f77a0, 11 min 37 s, `90ce9ef3...`.
  - The release package is `dev.deathride.tracks` and is not debuggable.
  - P18 adds no perf-only code to the app. The cut is the `/profile` route itself, which any build serves only while
    profiling, with the same bytes.
  - The sampler is a host tool that talks only to the debuggable perf package's JDWP.
- **What did not change:**
  - anything a player sees or hears;
  - any threshold, clock, physics, input rate, render scale, TextureBudget, I2 limit, heap limit or audio default;
  - core/, audio/ and the HUD font pages;
  - the grading in `perf-p10..p17`, `perf-device.py` and `settle.ps1` (a copy was used);
  - desk/, art/, assets, .ai/ and .personas/;
  - the 10-06 ledger and its row.
- No GC was forced, and no heap dump was taken.

## The device at the end

- The owner's `dev.deathride.tv` was in front before and after: the same task t330, activity record a03c5a7 and process 14337.
  The package was last updated 2026-10-06 23:44:23.
- `dev.deathride.perf` was force-stopped. The restore intent was delivered to the running top-most instance.
- The JDWP forward was removed. Both mixers were in standby and thermal status was 0 (`device-state-end.txt`).
- The `ws` module copied into the worktree for the probe (gitignored) was removed.

## Questions

1. **The PSS line's lever is not the allocation rate.**
   - ART grows the heap 24 MB past the survivors after every full GC. The peak is the survivors (48-59 MB) plus that
     headroom.
   - A rate cut changes how often the heap swings, not how high.
   - What is left is two levers:
     - the live heap, which nothing has measured yet;
     - the headroom, which is heap tuning, out of bounds here.
   - Should the next memory card audit what survives a GC? That needs a heap dump after a collection, so a forced GC in a
     diagnostic run, never in a graded one, which I2's rule allows only outside graded runs. Or is card 6's fixed -3 MiB of
     graphics the only lever worth Stick time before the next goal-1 soak?
2. **ktor CIO's header-line buffers are now the largest allocator in a race.**
   - They are 0.61 MB/s, 24% of 2.59 MB/s, and all of it is the probe's: a 16 KiB `char[]` per header line of each
     probe request (`/stats` and `/profile`).
   - Section 7 ruling 2 keeps the engine, its configuration and the probe's cadence.
   - Does that ruling stand, now that this is the largest single allocator? Players never send these requests.
3. **The PSS grade for the cut.** It goes to a settled pair or the next goal-1 soak, under the rule above. Given question 1, is
   a dedicated settled pair for it worth the Stick time, or should the next goal-1 soak read it?
