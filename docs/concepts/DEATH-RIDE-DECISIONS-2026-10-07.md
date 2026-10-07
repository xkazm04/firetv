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
