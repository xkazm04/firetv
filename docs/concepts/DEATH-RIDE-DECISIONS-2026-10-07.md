# Death Ride: decisions of 2026-10-07 (evidence rule, PNG re-encode, D-SAVE, sound stays)

Captured from the commit record on `deathride/main` at e4ec2163. "Owner" is the owner's own ruling; "App Master" is the App Master acting under the owner's delegation.

## 1. Evidence rule: summaries in git, raw outside

- **Who decided:** the owner, 2026-10-07 06:41Z.
- **Owner's words:** "Summaries in git, raw outside".
- **Rule:** runs commit summaries, manifests and a few downscaled screenshots. Raw traces and full captures live outside git, bound by their hashes (example: `deathride/evidence/perf/p13/manifest.json`, which lists each committed file with bytes and sha256 and binds the raw files kept outside). History is left as it is.
- **Constraint:** `deathride/evidence/` had grown to 994.2 MiB in 6,354 files, and every perf run added traces and captures to every clone.
- **Lost:** Git LFS for new evidence and art sources (a second store and a server dependency for the same problem); rewriting history (breaks every pin and hash that names a commit).
- **Reverse:** delete `EvidenceRuleTest.kt` or raise `EvidenceRule.MAX_BYTES`. Nothing was moved or deleted, so nothing needs restoring.
- **2026-10-07 update:** grandfathering is now by blob, not by path, because a grandfathered file that grew in place was not caught (commit 53c59e5e). A path is grandfathered only while its blob id equals the one tracked at 20189c47; a changed blob is judged like a new file. This supersedes "Grandfathering is by path" under The guard.

### Figures (M1 goal 5's measure)

Tracked bytes from `git ls-tree -r -l <commit> -- deathride/evidence deathride/art`.

| point | commit | evidence/ | evidence/ + art/ |
|---|---|---|---|
| at the ruling: last `deathride/main` commit at or before 06:41Z (committed 2026-10-07T08:17:03+02:00 = 06:17:03Z; the next one, f8776e1c, is 07:59Z) | 20189c47 | 994.2 MiB, 6,354 files | 1,297.5 MiB (1,360,574,625 B), 10,829 files |
| this run's base | e4ec2163 | 996.0 MiB, 6,498 files | 1,299.4 MiB (1,362,482,935 B), 10,973 files |

Growth since the ruling: +144 files, +1.8 MiB (+1,908,310 B), all in `deathride/evidence/`; `deathride/art/` did not change. The 20189c47 evidence figure equals the App Master's reading.

### Audit of every `deathride/main` commit after the ruling (20189c47..e4ec2163)

144 files were added under `deathride/evidence/`; none was modified or removed there, and the range has no merge commit. **No added file breaks the rule.**

| commit | added | what |
|---|---|---|
| bf8043cf | 121 | P12 audio arms: runs, comparison, manifest (the largest file, 132,871 B, is `perf/p12/diag-still/p11-readings.json`) |
| 08fd331e | 22 | P13b Stick runs of the P10 arm |
| f6385e71 | 1 | `evidence/assets/png-reencode-release.md` |

By extension: 109 json, 19 txt, 15 log, 1 md. No refused extension, no logcat name, nothing over the cap. Grandfathered post-ruling files: none needed.

### The guard

`deathride/core/src/test/kotlin/dev/deathride/core/EvidenceRuleTest.kt`, run by `:core:test`.

- **Refused at any size:** `.gz .zip .apk .aab .perfetto-trace .pftrace .atrace .trace .hprof .mp4 .webm .mkv`, and any file whose name starts with `logcat`.
- **Refused over 512 KiB (524,288 B):** every other file, images included. The cap is about four times (3.95x) the largest file committed after the ruling (132,871 B): room for a real summary, too small for a raw capture.
- **Grandfathered:** every path tracked at the ruling commit 20189c47, read with `git ls-tree` (no committed list). 1,040 of those paths are refused by extension or name, so history stays as it is. Grandfathering is by path; a grandfathered file that grows is not caught.
- **Repo case:** `git ls-tree -r -l HEAD -- deathride/evidence`, run from the repo root two levels above `deathride/core`. It fails naming each offending file. If git cannot run, or the ruling commit is missing from the clone (a shallow clone), it fails with that message and never passes silently.
- **Planted file:** the unit cases refuse a planted `.gz`, APK, logcat, oversize JSON and oversize PNG, and allow summary.json, manifest.json, probe.log, a small PNG and a grandfathered raw file. No raw file was committed to prove it.

## 2. Release-only lossless PNG re-encode

- **Who decided:** the owner: "Re-encode at release build only" (M1 goal 3).
- **Constraint:** the APK carried PNGs that compress losslessly, but the pins in 223 records name the source bytes.
- **Chosen:** f6385e71. The release variant packages re-encoded copies (pyoxipng, zopfli) of 48 PNGs, with pins rewritten in the packaged catalogs. Release APK 35,136,461 to 33,550,861 B (-1,585,600 B). `deathride/assets/`, `deathride/art/` and every record stay byte-identical. The 7 owner-approved story-art files are never touched.
- **Cost:** release builds need Python with pyoxipng 9.1.1 and Pillow (`app/release-assets/requirements.txt`), or `-PnoPngReencode=true`. The first release build takes about 10 minutes.
- **Lost:** re-encoding the 48 files in git and rewriting their 223 pins (history churn; the owner-approved art would change bytes).
- **Reverse:** build with `-PnoPngReencode=true` (ships the original 35,136,461 B), or revert f6385e71.

## 3. D-SAVE: profile saves off the render thread

- **Who decided:** the owner answered the save ask with "Design mitigation solution and execute". The design, and the three open choices below, are the App Master's under that delegation.
- **Constraint:** profile saves ran on the render thread, 50.2-107.7 ms each on the Stick, a cause of frames over 100 ms at race start and finish.
- **Chosen:** one ordered background writer. P13a: a4698beb (kill seam at the three save steps), 73827b4f (the writer), cc5a6a13 (submit vs save timing, 50 iterations each). P13b: 08fa0a72 (`ProfileSaver` seam, writer-thread ms per completion), ebe59cd3 (`RaceGame` saves through the writer).
  - Changes apply at once and revert once if their save fails.
  - A race start waits for its MONEY tickets, and a receipt for its settle, while the render thread keeps drawing.
  - `pause()` drains for at most 1,500 ms, under the 4,000 ms pause kill in libGDX 1.13.5. `dispose()` closes with 2,000 ms.
- **Lost:** a writer for car picks only (race start and finish stay over 100 ms); keeping saves synchronous (accepts the save frames as a residue).
- **Three choices P13b left open; the App Master kept them as built, and the owner can reverse them:**
  1. BACK drops a pending start; its written tickets stay unsettled, like an abandoned race.
  2. The garage is refused while a start is pending.
  3. A start refused for a pending ticket or settle is dropped, not queued; the player presses again.
- **Figures (Stick):** save on the render thread 50.2-107.7 ms to 0; `startRace` 139.6-273.5 to 46.6-142.7 ms; transition max 308.4 to 186.1 and 117.2 ms. The 100 ms bar still fails (31 and 32 windows); P13c continues the work. Evidence: `deathride/evidence/perf/p13/`.
- **Reverse:** make `RaceGame` call the store directly again (revert ebe59cd3); the writer and seam are additive. Each of the three open choices is a local change in the start path.

## 4. Sound stays (owner ruling N3)

- **Who decided:** the owner's earlier ruling N3 (no change to the game's sound without the owner's say). No new decision is taken and none is asked.
- **Constraint and finding (P12: fbb6bb2b, 1e05f30a; runs in bf8043cf):** playing sound costs the Stick 46-53% of a core, however many voices play. Capping voices, or slowing pitch and pan updates, gained nothing.
- **Alternatives that lost:** capping voices and slower pitch/pan updates (no gain); muting. Muted, frames over 33 ms fell from 128/120 to 3/1 per run, but the muted worst p95, 19.4 ms, still fails I2's 16.7 ms, and muting removes every race sound, which N3 does not allow.
- **So no sound trade is offered to the owner.**
- **Reverse:** the perf-only audio arms (df31a677) stay in the perf build; the shipped game is unchanged, so there is nothing to undo.

## 5. P13e rulings (the bake, the settled pair, the GC source, the later reveal)

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z ("Design mitigation solution and execute"). The owner may overrule any of the four.
- **Context:** P13e (bba8be1b) removed the course-switch gap by drawing the scenery bake's ground tile in 16 synced bands (5df2a49b). Its two graded runs (transition max 97.0 and 103.3 ms) ran on a host that never settled, so neither is a valid grade. See `docs/concepts/deathride/P13e-bake-passes.md`.
- **Rulings:**
  1. **`BakeShape.SHIPPED` (16 synced bands) stays.** Reason: it met all four of P13e's ship rules: no switch-window interval over 100 ms; every bake frame at or under 50 ms of work; a byte-identical target for all five courses on the Stick; and the lowest max of the passing arms (67.2 ms against bands8's 74.9). No passesN arm could meet rule (i). `switchArm=unbanded` stays on the perf build for A/B.
  2. **The settled graded pair is owed** and is step 4 of P13f. Reason: by the brief's own rule an unsettled run is not a grade, and both P13e runs were unsettled.
  3. **P13f finds the GC source.** Reason: run 2's two frames over 100 ms are lobby frames next to background GCs of 626 and 364 ms; the app frees 15-21 MB of large objects every 6-7 s (57 GCs in 360 s), the source is unfound, and it feeds M1 goal 1 (active max) as well as goal 2.
  4. **The course showing about 0.3 s later is accepted.** Reason: I2 budgets frames, memory and inputs, not reveal time, and a smooth reveal is the trade this mitigation exists for.
- **Reverse:** `TrackScene` back to `BakeShape.UNBANDED` (revert 5df2a49b) brings back the ~100 ms switch gap and the earlier reveal.

## 6. P13f rulings (settle, cut the reply's bytes, PSS)

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the three.
- **Context:** P13f (d2b12042, partial) found the lobby's 6-7 s large-object GC churn in the probe's own `GET /stats` and built it in place with the same bytes (bb49e716): 1.378 -> 0.426 MB per read, 115 -> 47 GCs in an ungraded 360 s run. Its graded pair was never started: four 900 s waits (22:01-23:01Z) never saw 60 s under 60% host CPU. See `docs/concepts/deathride/P13f-gc-churn.md`.
- **Rulings:**
  1. **Settle, pause no one.** The graded pair waits for a quiet window; each run may use up to eight 900 s settle waits (P13e's `runs-n.sh` allowed four). `settle.ps1`'s rule (60 consecutive 1 s samples under 60%) and the HOST rule stand. Reason: pausing other projects' runs is the operator's call, and waiting costs only Stick time. If no settle comes, the App Master asks the operator for a 20-minute pause.
  2. **Cut the reply String and its UTF-8 copy** (P13g step 1, in `link/`, with a served-bytes proof). Reason: the bytes on the wire stay the same, and it removes most of the probe's remaining large-object churn, which is observer effect on the bar being graded (players' phones never read `/stats`).
  3. **PSS:** P13f step 3's single 195.1 MiB sample is answered by the settled pair's PSS readings against 192 MiB; no separate action. Reason: one sample on an unsettled run, in the GC cycle's peak, is not a reading of the budget.

## 7. P13g rulings (goal 2 met, CIO header buffers, the cut vs the quiet host)

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the three.
- **Context:** P13g (708b5f31, merged at f861f535) served `/stats` as pooled UTF-8 blocks with the same bytes (db1ec55a) and ran the settled graded pair: transition max 83.9 / 99.6 ms, 0 of 55 and 0 of 56 windows over 100 ms. Run 2's margin is 0.4 ms, on a lobby frame inside a 68.7 ms GC pause. See `docs/concepts/deathride/P13g-stats-bytes-and-pair.md`, whose three questions these answer.
- **Rulings:**
  1. **M1 goal 2 counts as met.** Its measure is met as written: two settled, consecutive runs, no transition frame over 100 ms, and a doc naming the phase that moved. No third run is commissioned for it. If any later settled graded run on a later `deathride/main` APK has a transition frame over 100 ms, line 18's card and the goal reopen. Reason: the bar is the measure, and the 0.4 ms margin is recorded as a limit, not as a new bar.
  2. **ktor CIO's 16 KB request-header buffers get no follow-up.** The engine and its configuration stay as they are, and so does the probe's `/stats` cadence. Reason: players never read `/stats`, and the buffers are engine internals outside link's route code. Every run since P8 uses the probe's cadence, so changing it would break comparability. Revisit only if a measured frame over a bar is attributed to it.
  3. **The split between the cuts and the quiet host is recorded as a limit.** No action. Reason: the GC counts and allocation rates, which depend little on host load, moved with the cuts; separating the frame-time share would need unsettled runs that are not a grade.
- **Reverse:** a later settled graded run with a transition frame over 100 ms reopens goal 2 and line 18's card (ruling 1); a measured frame over a bar attributed to the CIO buffers reopens ruling 2.

## 8. P14 rulings (the MMAP arm, goal 1's bar, the transition watch, the rejected input)

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the five.
- **Context:** P14 (bef55c0f, merged at b94dd443) soaked `deathride/main` f861f535 for 900 s with sound on: worst active p95 27.419 ms, active max 84.728 ms and 1 rejected input fail goal 1; median and PSS pass. Its A/B showed that one AudioTrack writing only zeros on `AudioOut_D` wakes the platform pair (the mixer and the HAL writer) to 52-54% of a core each and brings back 86-122 active frames over 33 ms per 360 s run (muted 0/0). `PERFORMANCE_MODE_POWER_SAVING` is refused and the HAL has no deep-buffer port. See `docs/concepts/deathride/P14-soak-and-output-path.md`, whose five questions these answer.
- **Rulings:**
  1. **Build the perf-only `silentMmap` arm now (P15).** No mixdown is built, in P15 or later, without the owner's say. Reason: `mmap_no_irq_out` is the only declared PCM route around the mixer, and an arm that writes zeros shows whether a mixdown is worth building without changing anything a player hears. A mixdown changes the sound path, which N3 reserves to the owner, and it needs a listening test.
  2. **Goal 1's p95 bar goes to the owner once P15's verdict is in, not before.** No run on the muted over-20 ms tail is commissioned until the owner rules. Reason: changing a goal's bar is the owner's call, and the answer depends on P15. If MMAP keeps the pair idle, the gap left is muted's 18.9-19.2 ms; if it does not, goal 1 cannot be met with sound on.
  3. **The soak's 132.7 ms transition watch does not reopen line 18.** It is recorded as a watch; the next settled graded transition run decides. Reason: section 7's ruling 1 reopens it only on a settled graded run. The soak was settled only at its start (the host was back at 80-92%), and its transition reading is not P13d's graded 360 s command.
  4. **The soak is not rerun for the zero-rejection line alone.** The early-probe Wi-Fi stall (rejection bursts 4.7-6.0 s into a probe, known since P0) gets its own lane-C card, with P14's figures, in P15's Card figures; the line is read again at the next goal-1 soak. Reason: a rerun costs up to eight settle waits for a line that a known stall decides by chance.
  5. **Section 7's ruling 3 stands with the reason P14 wrote for it** (the split between the cuts and the quiet host is a limit, because separating the frame-time share would need unsettled runs that are not a grade). Reason: nothing P14 measured changes it.
- **Reverse:** the owner's ruling on goal 1's bar (ruling 2) or a mixdown decision (ruling 1) supersedes this section; a settled graded run with a transition frame over 100 ms reopens line 18 (ruling 3, via section 7's ruling 1).

## 9. P15 rulings (the mixdown sketch, the silentMmap arm, goal 1's bar, the stall card)

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the four.
- **Context:** P15 (d95166c8) found no AAudio MMAP route on the Stick: EXCLUSIVE and SHARED low-latency streams both fall back to a mixed track on `AudioOut_D`, because `mmap_no_irq_out` serves `HDMI-Out` only and Fire OS attaches `Speaker`, which only `primary_out` serves. With the zero-writing `silentMmap` stream open, the platform pair runs at 50-56% of a core each, as it did for P14's silentTrack. See `docs/concepts/deathride/P15-mmap-route.md`, whose questions these answer.
- **Rulings:**
  1. **The P14 mixdown sketch is retired.** Reason: with no MMAP route, a mixdown into one AudioTrack is still one mixed stream on `AudioOut_D`, and P14 measured that one zero-writing stream costs the pair as much as the full mix. It comes back only with a new output route on the device and the owner's say (N3).
  2. **The `silentMmap` arm stays in the tree, dormant.** The perf commands and the ledger do not carry `-PsilentMmap=true`; P15's doc says how to build the arm. Reason: it is debug-only behind a property, the release build carries none of it (P15's `release-proof.json`), and it is the probe to re-run if a Fire OS update ever opens an MMAP route.
  3. **Goal 1's bar was put to the owner on 2026-10-08** with the P14 and P15 figures. Until the owner answers, section 8's ruling 2 holds: no frame-tail research run. Reason: changing a goal's bar is the owner's call, and P15 closed the sound-on lever that the answer depended on.
  4. **P15's lane-C card for the early-probe Wi-Fi stall enters the optimize ledger as an open card** with P14's figures. It is read again at the next goal-1 soak (section 8, ruling 4). Reason: the stall decides the zero-rejection line by chance, so it is tracked as its own card rather than by a rerun.
- **Reverse:** a new output route on the device and the owner's say bring back the mixdown (ruling 1); a Fire OS update that may open an MMAP route is answered by rebuilding the arm with `-PsilentMmap=true` (ruling 2); the owner's ruling on goal 1's bar supersedes ruling 3.

## 10. Goal 1's bar (the owner) and the P16 rulings

### (a) The owner's ruling on goal 1's bar

- **Who decided:** the owner, 2026-10-08 15:18Z, answering the App Master's ask (section 9, ruling 3).
- **Rulings:**
  1. **Goal 1 keeps its bar:** a 900 s Stick soak with active p95 at or under 16.7 ms and active max at or under 33 ms.
  2. **With sound on, goal 1 is recorded as not met on the Stick.** P14's 900 s soak of f861f535 read worst active p95 27.419 ms, active max 84.728 ms and 1 rejected input. P15 found no output route that avoids the audio pair. Sound stays (N3, section 4).
  3. **One research run (P17) traces the muted over-20 ms tail.** Reason: savings on the render side shrink the sound-on tail too.
- **This lifts section 8 ruling 2 and section 9 ruling 3** (no frame-tail research run until the owner rules).

### (b) The App Master's rulings on P16's questions

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the three.
- **Context:** P16 (935687ff, merged at a060a47e) built, measured and reverted both HUD cards. Card 1 (the font pages merge) met its own gate but not the hudMs rule fixed before its first graded run; card 2 (the static HUD layer) failed the pixel gate under the Stick's 2x MSAA. See `docs/concepts/deathride/P16-hud-layers.md`, whose questions these answer.
- **Rulings:**
  1. **Card 1 is not re-landed.** Its verdict stands under the rule fixed before the first graded run (2840bfc4).
     - Reason: re-landing it over that rule would grade it after seeing the result.
     - Its value is mostly memory (font textures 5 -> 2 MiB, next to the PSS line), not hudMs. So it comes back as a candidate card in P17's ledger, ranked by P17's attribution.
     - If it is ranked, it is re-graded with a settled pair, under a new rule fixed before the first graded run that names PSS max beside hudMs.
  2. **A pixel-exact form of card 2 goes in as an open card in P17's ledger**, not the 10-06 one. It retains the chrome's vertices: the same quads, the same atlas page and the same MSAA rasterization.
     - Its ceiling is P16's -0.145 ms hudMs against base.
     - Reason: the gain is real but small, about 1.4% of a 10 ms frame. It is worth building only if the attribution gives the HUD a share of the tail.
  3. **base-run2's PSS samples (194.3 and 192.0 MiB, on unchanged main) go with goal 1.** P17 reads PSS in every run and finds its source. The next goal-1 soak grades the line.

### (c) Reverse

- The owner may overrule any of these.
- A finding that the interval metric cannot reach 16.7 ms even when every frame presents on time goes to the owner as a question. It does not change the bar.

## 11. P17 rulings

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the six.
- **Context:** P17 (c462db81, merged at 992c48a9) traced the muted over-20 ms tail. Goal 1's window p95 is start jitter on the platform's vsync tick, every slow frame is attributed, and the PSS peak is Java heap (+7.3 / +27.1 / +15.1 MiB above each run's lowest sample) while graphics and native heap stay flat. See `docs/concepts/deathride/P17-muted-tail.md`, whose questions these answer.
- **Rulings:**
  1. **P17's after-run commit 3e9f09dc is accepted as descriptive.**
     - `perf-p17.py` only adds readings; `klass()` and the cause ladder are unchanged.
     - The join fix in `perf_p17_lib.py` moves no class reading in the muted runs. Both read 0 failed mapping checks, and the frames it now leaves out lie past the last row or before a missing row, which no active interval reads.
     - Both runs stay research readings (unsettled).
  2. **The finding that goal 1's interval p95 cannot reach 16.7 ms on this Stick went to the owner as a question on 2026-10-08** (section 10(c)). The bar stays until the owner rules.
  3. **Card 2 (requesting the frame from a display-priority looper) is within N3 and I2's clocks rule** as a perf-only arm in `dev.deathride.perf`. The vsync cadence, the game clock, the input rate and every threshold stay. It is not scheduled before the owner's answer: under any answer it cannot change goal 1's verdict, because the tick's own p95 is 16.736 ms.
  4. **Card 7 is declined: no mute path outside the debuggable gate.**
     - A mute that works in a non-debuggable build is a sound control in a build a player could run, which is N3's ground.
     - The card's figure: 2 of 16 traced frames over 20 ms, none over 33 ms, no window moved.
  5. **The inert schedstat path stays in release**, as P16's counters do (P17's `tests.json`: never opened, both columns -1).
     - No run removes it on its own.
     - A later run that adds a perf source set or a compile-time flag in `app/build.gradle.kts` for another reason moves both out.
  6. **Card 5 goes before card 6.**
     - Card 5 goes after the cause of the PSS peak. Card 6 is a fixed -3 MiB, about a ninth of run 2's swing.
     - Card 6 follows under its own rule (section 10(b) ruling 1).
     - Card 3 (back-pressure) stays research-first, behind both.
- **Reverse:** the owner's answer on goal 1's measure supersedes rulings 2 and 3.

## 12. P18 rulings

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the four.
- **Context:** P18 (acbad996, merged at afc4d4cc) audited the race's allocation with ART's own tracker, cut the probe's `/profile` reply in place (card 5, 293f77a0) and found that after every full GC ART grows the heap exactly 24 MB above the survivors. See `docs/concepts/deathride/P18-heap-swing.md`, whose questions these answer.
- **Rulings:**
  1. **P18 is accepted.**
     - Card 5 is kept under `perf-p18.py`, which was fixed at 70fe350c before the first A/B run.
     - Allocation went from 2.599 / 2.576 to 2.271 / 2.254 MB/s, and GCs from 35 to 33.
     - `ProfileReplyTest` (5 cases) shows the same bytes.
     - The cut is observer-side, like P13f's and P13g's.
     - The PSS line was not graded (unsettled). The next goal-1 soak grades it; no dedicated settled pair is spent on it (P18 question 3).
  2. **Card 6 is graded on the lines that hold it.** This refines section 10(b) ruling 1, which named PSS max.
     - P18 showed that PSS max is the Java heap's 24 MB headroom over the survivors, sampled 8 times a run: it swings 15-27 MiB between runs.
     - So a fixed graphics cut is graded on owned textures and on the meminfo line that holds GL textures.
     - PSS max is reported beside them and graded only on a settled pair.
  3. **Section 7 ruling 2 stands** (P18 question 2).
     - ktor CIO's 16 KiB header-line buffers (0.61 MB/s) come from probe requests that players never send.
     - The engine, its configuration and the probe's cadence stay unchanged, so every reading stays comparable.
  4. **Retention is the PSS lever left in the app** (P18 question 1).
     - A retention audit goes into the P17 ledger as card 13: open, lane B, research first.
     - It comes after card 6 and before card 3.
     - It may force a GC and take a heap dump in a diagnostic run only, never in a graded run (I2).
- **Reverse:** the owner may overrule any of these. His answer on goal 1's measure leaves them standing, because every option keeps the 192 MiB PSS line.

## 13. P19 rulings

- **Who decided:** the App Master, under the operator's delegation of 2026-10-07 06:25Z. The owner may overrule any of the five.
- **Context:** P19 (a4123307, merged at 059d1982) re-landed card 6, the HUD font page, and graded it for memory under the rule fixed at ca323907. See `docs/concepts/deathride/P19-font-page-memory.md`, whose questions these answer.
- **Rulings:**
  1. **P19 is accepted. Card 6 is kept** by the rule fixed at ca323907.
     - The re-land 9c20b2b4 is the exact inverse of 8443a99f: the same patch-id, and four blobs identical to 8443a99f~1.
     - Owned textures went from 39.97 / 39.97 to 36.97 / 36.97 MiB, and GL mtrack max from 52.23 / 52.20 to 49.06 / 49.07 MiB.
     - hudFlushes went from 3 to 2, no guard is worse, and `FontPageTest` is green (4 tests).
     - PSS was not graded (unsettled). cut-run2's 195.19 MiB goes to the next goal-1 soak.
  2. **45a159d8 is accepted as descriptive** (P19 question 3), as section 11 ruling 1 accepted 3e9f09dc.
     - ca323907's rule already said that rejected inputs are recorded and do not void a run. The reader had taken the probe's `functionalPass`, which the rejection assertion also clears.
     - The fix applies to both arms alike (base-run1 had 11 rejects, cut-run1 had 8). It was committed at 02:14:28Z, before cut-run1 finished at 02:16:40Z.
     - The keep rests on owned textures and GL mtrack, which read the same in every run of an arm, so the verdict does not depend on the fix.
     - From now on, a reader change made after an A/B's first graded run has started cites the rule's words it applies, and is committed before the next run ends.
  3. **Card 13 runs before the next goal-1 soak** (P19 question 2). It is P20. The soak waits on the owner's answer on goal 1's measure.
  4. **Card 13 also reads the `Code` line** (P19 question 4): which file-backed mappings make it up, and why it moves 14.6-40.1 MiB between runs.
  5. **The tracks package** (P19 question 1).
     - P19's first builds omitted `-PappId` and were installed over `dev.deathride.tracks` three times. It now holds `e7280368...` (deathride/main code), with its data kept.
     - From now on, every Stick build passes `-PappId=dev.deathride.perf`, and its package is checked with `aapt badging` before any install.
     - No run installs, uninstalls, clears or force-stops `dev.deathride.tracks` or `dev.deathride.tv`.
     - Whether the tracks stream reinstalls its own build is the owner's call. It has been reported to the owner.
- **Reverse:** the owner may overrule any of these.
