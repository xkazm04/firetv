# P19 - Card 6: the HUD font page re-landed and graded for memory

2026-10-09, AFTKM `10.0.0.139:5555` (Android 11, PowerVR GE9215), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/codebase-static-analysis-sweep-a4123307`, cut from `deathride/main` afc4d4cc (P18). Every figure below was
measured in this session. Summaries are in `deathride/evidence/perf/p19/`. Its `manifest.json` binds the raw logcats,
`raw.json.gz` files, meminfo dumps, the APKs, and the build and gate logs and scripts. Those are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p19/`. Nothing a player sees or hears changed: P16's text diff of 0 carries over
to the same code. Nothing was pushed.

## Figures first

**The answer.** Card 6 is **kept** by the rule fixed before the first A/B run.
- **Owned textures:** 39.97 / 39.97 -> **36.97 / 36.97 MiB** (-3.00 MiB in every window of every run).
- **The GL line (`GL mtrack`), max over the run:** 52.23 / 52.20 -> **49.06 / 49.07 MiB** (-3.13 to -3.17 MiB).
- **Guards:** none is worse. hudFlushes 3 -> 2 in every active race frame.
- **The PSS line:** not graded, because no run settled. cut-run2 read **195.19 MiB** at its peak sample, above 192. That
  sample holds Java heap 74.75 MiB and Code 39.30 MiB, with GL mtrack at 49.04.

### The re-land's identity check (step 1, 9c20b2b4)

- `git revert --no-edit 8443a99f` applied cleanly. No conflict, so no resolution was needed.
- **It is the exact inverse.** `git diff 8443a99f 8443a99f~1 | git patch-id --stable` and the re-land's own patch-id are both
  `8c18dd60...`.
- **The four files are byte-identical to 8443a99f's parent** (blob ids):

| File | 8443a99f~1 | 9c20b2b4 |
|---|---|---|
| `HandCutFont.kt` | 025e1ef8 | 025e1ef8 |
| `RuntimeFonts.kt` | 0b943bec | 0b943bec |
| `RaceGame.kt` | c44bc6c8 | c44bc6c8 |
| `FontPageTest.kt` | b5c199b3 | b5c199b3 |

- `git log 8443a99f..9c20b2b4 -- deathride/game deathride/app` holds **only 60456219** (P17's perf-only scheduler counters:
  `AndroidProfile.kt`, `MainActivity.kt`, `FrameProfiler.kt`, `SchedProfileTest.kt`, no draw path) **and the re-land**.
  60456219 touches none of the four font files.
- So the drawing code is the code P16 proved: text diff 0 in 6 Stick captures (2 lobby, 4 race), RGB and alpha, and the
  scenery bakes byte-identical on 4 courses. The pixel harness was not rebuilt.
- `FontPageTest` came back with the re-land: **4 tests, 0 failures, errors or skips**.
- The APKs differ in **`classes2.dex` alone** (`apk-diff.txt`, 576 entries each).

### The named meminfo line (step 2, before the rule)

One base reading (`base-reading/`): base.apk installed, launched profiled, in the lobby after the scenery was ready, with three
`dumpsys meminfo --local` samples 10 s apart and one `dumpsys meminfo -a`. No probe, no race, no forced GC.

| Sample | GL mtrack (Pss Total), KB | App Summary Graphics, KB | EGL mtrack / Gfx dev rows | TOTAL PSS, KB |
|---|---:|---:|---|---:|
| 1 | 53,198 | 53,198 | none | 135,571 |
| 2 | 53,250 | 53,250 | none | 126,662 |
| 3 | 53,250 | 53,250 | none | 130,037 |
| `-a` | 53,250 | 53,250 | none | 134,157 |

- Telemetry at the same time: owned textures **41,911,296 B = 39.97 MiB** (art 19,660,800, scenery 16,777,216, fonts
  5,242,880, QR 230,400).
- **The line is `GL mtrack`.** This Stick prints no `EGL mtrack` and no `Gfx dev` row, so the App Summary's `Graphics` is
  GL mtrack alone, in every sample. P17 and P18 read 52.0-52.3 MiB in that line at every PSS peak and lowest sample.
- `perf-p19.py` names it (`GL_LINE = 'GL mtrack'`) and was committed at ca323907, before the first A/B run.

### The A/B under the rule (step 3, `ab-verdict.json`)

- **Base** `9253fc9f...` is deathride/main afc4d4cc's code, built at 2664c6e4, which adds only docs. Its entries are
  identical to P18's cut APK, entry for entry.
- **Cut** `522b73c1...` is 9c20b2b4, the re-land.
- Both are `dev.deathride.perf`, built by `gradlew.bat :app:assembleDebug -PappId=dev.deathride.perf "-PappLabel=Death Ride
  Perf" -PracePort=8772`.
- The runs were four profiled 360 s runs on the default sound arm, by P18's `ab.sh` (P14's procedure), interleaved: base, cut,
  base, cut.

| Reading | base-run1 | cut-run1 | base-run2 | cut-run2 |
|---|---:|---:|---:|---:|
| Settled | no (two 900 s waits) | no (no wait) | no (no wait) | no (no wait) |
| Host CPU at start / end, % | 52-78 / 50-89 | 95-100 / 100 | 71-99 / 100 | 32-70 / 50-81 |
| **Owned textures, MiB (max; min equal)** | **39.97** | **36.97** | **39.97** | **36.97** |
| Fonts (telemetry), MiB | 5.00 | 2.00 | 5.00 | 2.00 |
| **GL mtrack max (min), MiB** | **52.23** (51.97) | **49.06** (48.88) | **52.20** (51.91) | **49.07** (48.92) |
| PSS min - max, MiB | 157.47 - 175.22 | 151.06 - 164.96 | 172.46 - 185.24 | 178.24 - **195.19** |
| Peak sample at; Java heap / Code at the peak, MiB | 205.3 s; 61.50 / 27.11 | 338.5 s; 69.50 / 17.06 | 337.1 s; 68.30 / 32.75 | 336.4 s; 74.75 / 39.30 |
| hudMs mean (guard) | 1.220 | 1.164 | 1.245 | 1.134 |
| hudMs p95 (reported) | 1.902 | 1.869 | 1.753 | 1.822 |
| hudFlushes (every active frame) | 3 | 2 | 3 | 2 |
| hudDraws; drawCalls; textureBinds | 6; 18.09; 12.16 | 5; 17.77; 11.82 | 6; 18.34; 12.41 | 5; 17.31; 11.36 |
| Active frames over 33 ms (guard) | 102 | 130 | 87 | 79 |
| Worst active-window p95, ms (guard) | 37.117 | 26.327 | 27.268 | 26.339 |
| Active max, ms | 97.22 | 100.31 | 65.54 | 78.33 |
| Rejected inputs (guard) | 5 / 6 | 4 / 4 | 0 / 0 | 0 / 0 |
| Allocated, MB/s; GCs | 2.263; 31 | 2.170; 32 | 2.283; 33 | 2.231; 33 |
| Rounds; input rate, Hz | 6; 30.003 | 6; 30.002 | 6; 30.002 | 6; 30.002 |

**Verdict (the rule's own words):**
- **Keep the card.**
  - FontPageTest is green.
  - Both cut runs read owned textures at least 2.5 MiB below both base runs: 36.97 against 39.97, a 3.00 MiB gap.
  - Both cut runs read GL mtrack lower than both base runs: 49.06 / 49.07 against 52.20 / 52.23.
  - No guard is worse. A guard is worse only when both cut runs read above both base runs:
    - over 33 ms: 130 / 79 against 102 / 87;
    - worst p95: 26.327 / 26.339 against 37.117 / 27.268;
    - hudMs mean: 1.164 / 1.134 against 1.220 / 1.245;
    - rejected inputs: 8 / 0 against 11 / 0.
- **The guards are research.** Nothing settled, so the rule applies them and records their readings as research.
- **PSS is not graded** (unsettled). Its grade goes to the next goal-1 soak (decisions section 12 rulings 1-2). On the
  readings alone the PSS max would not pass: cut-run2's 195.19 MiB is above both base runs.

## Step 0 - the record

Section 12 of `DEATH-RIDE-DECISIONS-2026-10-07.md` (2664c6e4, this branch's first commit) records the App Master's four
rulings on P18's questions, under the operator's 06:25Z delegation:
- P18 is accepted;
- card 6 is graded on the lines that hold it;
- section 7 ruling 2 stands;
- retention becomes card 13, after card 6 and before card 3.

## Step 1 - the re-land

See the identity check above. The re-land is `git revert --no-edit 8443a99f`. Its message keeps git's subject line, and a
body adds the identity facts and the attribution.

## Step 2 - the rule

`tools/perf-p19.py` (ca323907) was committed before the first A/B run. It starts from `perf-p18.py`, whose PSS readers and
procedure it reuses, and takes its HUD readers from `perf-p16.py`. Its `RULE` fixes:
- the procedure;
- the settle (at most two 900 s waits before the first run; if that does not settle, the rest run without waits and the pair
  is research for the host-sensitive lines);
- the void rule (a functional failure or the wrong APK voids a run; rejected inputs do not);
- the readings;
- the keep verdict and the guards;
- the PSS line, graded only on a settled pair.

It also states that owned textures and GL mtrack are graded settled or not, and that the guards apply settled or not.

**One reader fix after the first run (45a159d8).**
- base-run1 refused 5 + 6 inputs (the Wi-Fi stall card). The probe exits 1 on that assertion, which sets its
  `functionalPass` false.
- The reader took that flag as is, as `perf-p18.py` did; none of P18's A/B runs had a rejection.
- Read that way, the rule's own void test would have been crossed: it says rejected inputs do not void a run.
- 45a159d8 makes the reader apply the rule's words. A run is functional when the probe passed, or when its only failing
  assertion is the rejection one and:
  - every seat sent above 29 Hz;
  - every input was either accepted or rejected;
  - there was no host pump stall;
  - at least one round ran.
- It was committed while cut-run1 was running, before any cut run had finished, and no verdict criterion changed.
- Under the unfixed reader the verdict would have read "not two functional runs" and decided nothing.
- `probeFunctionalPass` keeps the probe's own flag in every run's readings.

## Step 3 - the A/B

- The procedure is P18's, unchanged: `ab.sh` with only the evidence path changed, and `settle.ps1` byte for byte.
- base-run1 waited twice, 900 s each:
  - the first wait's last minute ran at 21-100%, with 30 of 60 samples at or over 60%;
  - the second ran at 34-100%, with 27 of 60.
- It did not settle, so cut-run1, base-run2 and cut-run2 ran without waits.
- No heap dump, no allocation tracker and no forced GC ran. `perf-p19.py`'s verdict is in `ab-verdict.json`, and each run's
  readings are in its `p19-readings.json`.

## Failures and limits kept

- **No run settled.** The frame, hudMs and rejection guards are research readings on a host at 32-100%. base-run1's worst
  window p95 of 37.117 ms is a slow window on that host.
- **Two runs refused inputs:** base-run1 5 + 6 between 273 and 338 s, and cut-run1 4 + 4 between 139 and 206 s. Both were at
  30.0 Hz with no pump stall. This is P15's lane-C Wi-Fi stall card. By the rule they are recorded and void nothing.
- **The PSS max is still a sample of the heap's sawtooth.**
  - cut-run2's 195.19 MiB sample sits at a Java heap peak (74.75 MiB, +16.05 over its lowest sample).
  - The `Code` line (file-backed `.apk`/`.so`/`.jar` mappings) moves too, between runs more than within one: lowest and
    peak samples read 14.61 / 27.11, 16.83 / 17.06, 34.55 / 32.75 and 40.06 / 39.30 MiB.
  - GL mtrack is flat within each run (0.15-0.29 MiB) and 3.13-3.17 MiB lower on the cut arm.
- **The tracks package was overwritten (an operator-side error in this session).**
  - My first two debug builds omitted `-PappId=dev.deathride.perf`, so they built as `dev.deathride.tracks`, the default in
    `gradle.properties`. That is another stream's debuggable package, first installed on the Stick 2026-10-06 15:58:57.
  - The first base reading's `adb install -r` and two more installs (03:23-03:25 CEST) replaced that package's APK three
    times. `install -r` keeps its data. Any process of it that was running was killed by the first install.
  - Its prior APK hash and update time had not been recorded, so it could not be restored exactly.
  - It was reinstalled with the deathride/main build under that id (`e7280368...`; `tracks-package-incident.txt`).
  - Each install restarted that package's process: the ones seen started at 03:25:30 and 03:27:09, an install's own second.
    No such process was running at the end of the runs.
  - The mis-built APKs never ran a measured run. The base reading made then read the old P18 `dev.deathride.perf` instead
    and is kept outside git (`misbuild/`), not used.
  - The owner's `dev.deathride.tv` was untouched throughout: the same process 14337.
- **Not measured:**
  - a settled pair;
  - a 900 s soak (forbidden);
  - a sound-off run;
  - what survives a GC (card 13).

## Gates

- `gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain`, twice, both **green**. Both are in
  `evidence/perf/p19/tests.json`.
  - Run 1 was at 45a159d8, before the A/B evidence (host 38-74% at start).
  - Run 2 was at 3fab6cd7, with the A/B evidence and the ledger committed (host 66-83%).
  - The code under test is 9c20b2b4's in both.
  - Each read core 261 (`EvidenceRuleTest` included), link 34 (2 skipped, as on the base) and game 121 (117 + `FontPageTest`
    4).
  - No run failed, so nothing was rerun. `tests.json`, `release-badging.txt` and `manifest.json` were committed after run 2.
- `FontPageTest` was run by class at 9c20b2b4 before the rule: 4 tests, 0 failures, errors or skips. Its JUnit result is
  `FontPageTest.xml`, which the keep rule reads.
- **`assembleRelease` passed**, with `:desktop:compileKotlin`: at 3fab6cd7, 9 min 20 s, `f6c5bbc0...`.
  - The release package is `dev.deathride.tracks` and is not debuggable.
  - The re-land adds no perf-only code. The font page is the shipped HUD's own drawing, unchanged in pixels (P16's proof).
- **What did not change:**
  - anything a player sees or hears;
  - any threshold, clock, physics, input rate, render scale, TextureBudget, I2 limit, heap limit or audio default;
  - core/, audio/ and link/;
  - the grading in `perf-p10..p18`, `perf-device.py` and `settle.ps1` (a copy was used);
  - desk/, art/, assets, .ai/ and .personas/;
  - the 10-06 ledger and its row.
- No GC was forced and no heap dump was taken.
- No typecheck or lint command is configured for this project. Both are skipped, not passed.

## The device at the end

- The owner's `dev.deathride.tv` was in front before and after:
  - the same task t330, activity record a03c5a7 and process 14337;
  - last updated 2026-10-06 23:44:23.
- The restore intent was delivered to the running top-most instance.
- `dev.deathride.perf` was force-stopped and is not running.
- Both mixers were in standby and thermal status was 0 (`device-state-end.txt`).
- `dev.deathride.tracks` holds `e7280368...` (deathride/main code) and is not running. See the incident above.
- The `ws` module copied into the worktree for the probe (gitignored) was removed.

## Questions

1. **The tracks stream's package.**
   - `dev.deathride.tracks` on the Stick now holds a deathride/main debug build (`e7280368...`), not that stream's own
     last install, which was not recorded.
   - Its data was kept. Does the tracks stream need to reinstall its own build before its next Stick check?
2. **PSS above 192 on the cut arm.**
   - cut-run2 read 195.19 MiB at a Java heap peak, as P16's base-run2 read 194.3. The fixed -3 MiB is real in every sample,
     but it is smaller than the heap's swing.
   - Should card 13 (retention) run before the next goal-1 soak, which grades the PSS line?
3. **The reader fix 45a159d8.** It brings the reader in line with the rule's written void test (rejections do not void a run).
   Is it accepted as descriptive, as section 11 ruling 1 accepted P17's 3e9f09dc?
4. **The `Code` line** moves 14.6-40.1 MiB between runs (file-backed mappings) and adds to the PSS max beside the Java heap.
   Should card 13's audit read it too?
