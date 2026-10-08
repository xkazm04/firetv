# P14 - M1 goal 1's soak on today's main, and whether the sound's cost is the stream or its output path

2026-10-08, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/stack-grounded-opportunity-research-bef55c0f`, cut from `deathride/main` f861f535 (P13g). Every figure
below was measured in this session. Summaries are in `deathride/evidence/perf/p14/`. Its `manifest.json` binds the raw
logcats, traces, dumpsys output, gate logs, scripts and both APKs, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p14/`. Nothing a player hears changed. Nothing was pushed.

## Figures first

### The soak (M1 goal 1, I2): deathride/main as found, P11's command, 900 s

| I2 line | Limit | **P14 soak** (f861f535) | Status | P11 soak (e170d4e5) |
|---|---|---|---|---|
| Worst active-window p95 (616 windows) | <= 16.7 ms | **27.419 ms** | **fail** | 24.892 |
| Active max | <= 33 ms | **84.728 ms** | **fail** | 79.493 |
| Active-window median | 16-18 ms | 16.659-16.713 ms | pass | 16.653-16.698 |
| PSS (16 samples) | < 192 MiB | **156.0-179.1 MiB** | **pass** | 174.9-202.0 (fail) |
| Rejected inputs | 0 | **0 / 1** | **fail** | 0 / 0 |

- **Settled at its start.** Seven 900 s waits (08:03-09:48Z) did not settle. The eighth settled after 571 s (last minute
  18-52%). The host was at 21-25% when the probe began (10:00:29Z) and back at 80-92% when it ended (10:15:43Z).
- Thermal status 0 at start and end. 900.216 s, 14 rounds, all 10 classes. 0 host pump stalls, 30.0006 Hz per seat.
  Warm PSS change -3.24 MiB. Textures 39.97 / art 18.75 MiB. 0 profile saves.
- **Frames over 33 ms: 215 of 48,722 active** (P11: 197 of 48,884). By dominant category: cars 121, simulation 69,
  flushSwap 11, audio 8, HUD 5, scenery 1. 214 had the render thread off-CPU for more than 8 ms, and 17 overlapped a
  logged GC.
- **GC: 89 GCs** in the probe (P11's soak: 285). 2.49 MB/s allocated (P11: 8.22). 50 logged background GCs, 592.0 MB of
  large objects freed (0.66 MB/s), logged GC time 102.6-265.7 ms.
- Device counters (% of one core): audio HAL `writer` 52.3, `AudioOut_D` 47.6, render thread 53.4, link 33.4,
  NetworkStats 9.1.
- The one rejected input: slot 1, q=139, refused at second 4.94 at a receive age of 270.3 ms (RTT 297.3 ms). This is the
  Wi-Fi delivery stall known since P0. The probe exits 1 on that assertion only.
- Transition watch (`perf-p10.py`; not a grade): max 132.7 ms, 7 of 133 windows over 100 ms. They come from two lobby
  frames 3.0 s before round 1 (121.5 ms) and 3.4 s before round 3 (132.7 ms).

### The output-path A/B: one APK, interleaved 360 s profiled runs, `perf-p14.py`'s rule (fixed in 7fd0168b)

| Arm | Route (step 2) | Active frames over 33 ms (run 1 / 2) | Over 20 ms | Worst active p95, ms | Active max, ms | Audio platform CPU, % of a core | Pair CPU `AudioOut_D` / `writer`, % | Pair slices/s each | Render runqueue wait, ms/s | PSS, MiB | Rejected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `full` | SoundPool + Music on `AudioOut_D` | **158 / 121** | 1,093 / 951 | 25.537 / 29.144 | 75.168 / 94.125 | **98.5 / 101.4** | 45.9 / 49.7; 46.6 / 52.1 | 16,107; 17,542 | 98.3 / 85.5 | 158.5-173.9 / 163.0-174.3 | 0 / 0 |
| `muted` | nothing open; `AudioOut_D` in standby | **0 / 0** | 44 / 45 | 18.880 / 19.175 | 29.261 / 29.688 | **0.0 / 0.0** | 0 / 0 | 0 | 14.6 / 11.5 | 166.1-180.5 / 161.1-190.5 | 0 / 0 |
| `silentTrack` | one zero-writing AudioTrack on `AudioOut_D`, 1,540 frames | **86 / 122** | 538 / 743 | 21.531 / 31.054 | 106.467 / 101.579 | **106.2 / 104.7** | 53.5 / 52.7; 52.9 / 51.8 | 18,720; 18,505 | 60.7 / 77.4 | 172.8-**198.7** / 165.0-182.9 | 0 / 0 |
| `silentDeep` | the same thread, 4,800 frames; power-saving mode refused | **73 / 162** | 575 / 884 | 20.491 / 23.566 | 66.377 / 66.001 | **105.6 / 104.3** | 53.3 / 52.3; 52.6 / 51.7 | 18,636; 18,420 | 62.3 / 83.0 | 166.5-190.2 / 164.3-188.0 | 0 / 0 |

silentDeep's two valid runs are run 2 and run 3. Run 1 is void (below).

| Comparison (P12's rule: X beats Y only if both X runs read lower than both Y runs) | Frames over 33 ms (primary) | Audio platform CPU | Answer |
|---|---|---|---|
| **silentTrack vs muted** | **muted beats silentTrack** | **muted beats silentTrack** | **Yes: an open stream alone costs the pair**, as much as the full mix |
| **silentDeep vs silentTrack** | not shown (+13.0%) | not shown (-0.5%) | **No: the deep-buffer request does not avoid it** (there is no deep-buffer path) |
| muted vs full (reference) | muted beats full (-100%) | muted beats full | P12 reproduced on this APK |
| silentTrack vs full | not shown (-25.4%) | full beats silentTrack (+5.5%) | a silent stream costs the pair at least what the game's sound does |
| silentDeep vs full | not shown (-15.8%) | full beats silentDeep (+5.0%) | likewise |

No arm clears the I2 frame limits. muted's max (29.3 / 29.7 ms) is under 33 ms for the first time on this probe, but its
worst p95 (18.9 / 19.2 ms) is not under 16.7 ms.

## What each arm proves

- **muted** (control): with nothing open, the mixer sleeps, the pair is at 0% and the render thread waits runnable
  11-15 ms/s. 0 active frames over 33 ms in both runs, one of them with the host at 98-100%. The active tail that remains
  is over 20 ms only: 44-45 frames a run, worst p95 18.9-19.2 ms.
- **silentTrack**: the game makes exactly muted's platform calls (the JVM replay proves it line for line), and the app
  adds one AudioTrack that only writes zeros. That alone wakes the pair to 52-54% of a core each at about 18,500
  slices/s. That is more than full's 46-52%, because the silent stream never stops while full's sound pauses in the
  lobby. Frames over 33 ms return to full's range (86/122 against 158/121; 0/0 muted). **The cost belongs to an open
  PCM stream on the Stick's mixer, not to what is played**, which closes P12's question 2 (part one).
- **silentDeep**: `PERFORMANCE_MODE_POWER_SAVING` with a 100 ms buffer. The platform refused the mode: the built track
  reports `performanceMode=0` with `requestedMode=2` (logcat, `arm-lines.txt` in every silentDeep run). It got a larger
  client buffer (4,800 frames instead of 1,540) on the same `AudioOut_D` with the same flags, and the pair ran as for
  silentTrack (104-106%, 18,400-18,600 slices/s). On frames, its runs fall on both sides of silentTrack's. Its active
  max (66 ms against 102-106 ms) beats silentTrack's, but max is not a deciding reading, and the route gives no
  mechanism for it.

## The routing evidence (step 2, before any graded run; `evidence/perf/p14/route/route.md`)

`dumpsys media.audio_flinger` in the lobby, 25 s after each launch, and again in the race (diagnostic runs):

- The Stick has two mixer threads. `AudioOut_D` (tid 683, `AUDIO_OUTPUT_FLAG_PRIMARY`, HAL frame count 768 = 16 ms) is
  the one used. `AudioOut_15` (PRIMARY, no device) has never written a frame.
- silentTrack: the app's track is on `AudioOut_D`, active, flags 0x000, usage GAME (0xe), content type SONIFICATION (4),
  48 kHz stereo 16-bit, frame count 1,540. `AudioOut_D` "Standby: no".
- silentDeep: the same thread, flags 0x000, frame count 4,800. `AudioOut_D` "Standby: no". **Fire OS puts both arms on
  the same thread.** silentDeep was run anyway, as the brief requires.
- muted, and full in the lobby: no track active, `AudioOut_D` "Standby: yes".
- In the race the routes held: one active track (the app's) on `AudioOut_D`, which was not in standby.
- **Why** (`dumpsys media.audio_policy`): the primary HAL module has no `deep_buffer` or offload mix port. Its outputs
  are `primary_out` (PCM 16-bit 48 kHz stereo, PRIMARY), several DIRECT HDMI/AVLS passthrough and tunnel ports,
  `bt_sco_out`, and **`mmap_no_irq_out` (DIRECT + MMAP_NOIRQ, PCM 16-bit 48 kHz, HDMI)**. That last one is the only
  declared PCM route that bypasses the AudioFlinger mixer. It is reached by an AAudio stream in MMAP mode, not by an
  AudioTrack.

### Where the render thread waited: one atrace per silent arm (diagnostic runs, intrusive; not I2 figures)

| Trace | Frames kept | Over 33 ms | Preempted by the audio pair in frames > 33 ms | ... in frames > 20 ms | Pair in the trace (CPU, switch-ins/s) |
|---|---:|---:|---|---|---|
| silentTrack | 530 (9.7 s) | 18 | 110.1 of 139.2 ms (**79%**) | 210.2 of 306.7 ms (69%) | `AudioOut_D` 46.3%, 15,684; `writer` 43.8%, 15,474 |
| silentDeep | 544 (10.7 s) | 21 | 120.2 of 136.5 ms (**88%**) | 199.7 of 298.6 ms (67%) | `AudioOut_D` 42.0%, 14,228; `writer` 41.0%, 14,479 |

These match P12's full (87%), capped (94%) and still (76%) traces. The silent app thread `DR.silentTrack` took 0-1.0 ms
of the preempted time. The cost is the platform pair's handoffs, not the app's writes.

## Step 0 - the record

`DEATH-RIDE-DECISIONS-2026-10-07.md` section 7 holds the App Master's three rulings on P13g's questions: goal 2 met,
the CIO buffers left alone, and the split recorded as a limit. It gives who decided and why (9ea96a93).

## Step 2 - what shipped (3f388822, perf package only)

- `AudioArm` gains `silentTrack` and `silentDeep`. Each arm now carries an explicit id, and the existing ids are
  unchanged. A `silent` arm takes MUTED's path in `GdxAudioBackend`, and the arm carries an `AppTrack` (DEFAULT or
  POWER_SAVING, with at least 100 ms of buffer).
- `SilentTrack` (app/): one `AudioTrack` with SoundPool's attributes (libGDX 1.13.5 `DefaultAndroidAudio`: USAGE_GAME,
  CONTENT_TYPE_SONIFICATION). It runs 16-bit stereo at the native output rate (48 kHz) in streaming mode, and its writer
  thread does blocking writes of zeros. `onResume` opens it and `onPause` stops and releases it. It logs
  `silentTrack open mode=... performanceMode=... requestedMode=...`.
- Only the debuggable `dev.deathride.perf` reads `audioArm`, as before, so every other build plays `full` and opens no
  track. RaceGame, link/, core/, the HUD and every asset are untouched.
- Tests (`AudioArmTest`, 3 new cases):
  - both silent arms replay line for line like muted (no play, loop, setPitch, setPan or stop);
  - only they ask for an app track;
  - unknown names, including `silenttrack` and `SILENT_TRACK`, still throw;
  - the full arm's and the default constructor's replay SHA-256 is now asserted to be P12's `7678bc90...`.

  A mutation (silentDeep not silent) fails 2 of the 8 cases.

## Failures and limits kept

- **silentDeep-run1 is void**: 9 + 9 inputs were refused at receive ages of 251-313 ms in two bursts (seconds 4.7-6.0
  and 307-309). Under the rule it was rerun as silentDeep-run3 after the diagnostic runs, so the rerun is not
  interleaved. Its figures (89 over 33 ms, platform CPU 106.1%) would not change either verdict.
- The soak's one rejected input (second 4.94) fails I2's zero-rejection line on a known Wi-Fi stall. Two of today's three
  rejection bursts came 4.7-6.0 s into a probe.
- The soak was settled at its start only. The host climbed back to 80-92% during it, and P11's soak ran at 92-100%
  throughout. The soak's worst p95 (27.4 ms) is above P11's (24.9 ms) and the max is about the same. Its GC count,
  allocation and PSS are all lower.
- silentTrack-run1 read PSS 198.7 MiB in one sample (> 192), at second 338 of 360. Its other seven samples read
  172.8-188.7. P11's soak had a 192.4 MiB sample at second 529 the same way: uncollected Java heap, read at a GC
  cycle's peak. The silent arms hold one extra buffer of at most 19 KB, so this is not the arm, but it is a PSS sample
  over the limit.
- The A/B runs were not settled (P12's procedure has no settle). Host CPU was 84-100% at the start of run 1 of every arm
  and 14-36% in runs 2 and 3. muted read 0 over 33 ms both times.
- The atraces wrapped their buffers and kept 9.7-10.7 s of 20 s. The diagnostic runs exit 1 on the class-coverage
  assertion only (180 s covers 3 rounds), as in P11 and P12.
- The lobby route check reads audioserver's schedstat twice about 10 s apart. Its percentages are approximate, and the
  graded CPU readings are the A/B's.
- The main log on the Stick turned over in under 35 s during the route check, so the route logcats miss the startup
  lines. The graded runs keep them through perf-device's startup stream.
- Not measured: an AAudio MMAP stream, a stream of real game audio through any path other than SoundPool and Music,
  any listening test (the silent arms write zeros only), and an unprofiled run.

## Gates

`gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain` is green on 66de9683, whose code is
identical to 3f388822 (the last code commit): core 261, link 29 (2 skipped, as on the base), game 113 (110 + 3).
`EvidenceRuleTest` is green with the A/B evidence committed (1af3c401). No link timing test failed, so none was rerun.
`tests.json` lists every gate run. No threshold, clock, input rate, render scale, budget, physics, `perf-device.py`
argument, `perf-p10/p11/p12.py` grading or `settle.ps1` rule changed. `perf-p14.py` is a new copy of `perf-p12.py`.

When the runs finished, `dev.deathride.perf` was force-stopped and the owner's `dev.deathride.tv` was brought back to
the front. The intent went to the running instance, the same task t330, activity record a03c5a7 and process 14337 as
at the start. The package was last updated 2026-10-06 23:44:23. With it in front, both mixers were in standby
(`device-state.json`). The worktree's copied `ws` module was removed.

## Card figures (for the optimize ledger)

- **M1 goal 1 (I2 soak), f861f535, settled at start:**
  - p95 27.419 fail;
  - max 84.728 fail;
  - median 16.659-16.713 pass;
  - PSS 156.0-179.1 MiB pass (P11: 202.0, fail);
  - rejected 0/1 fail.

  215 of 48,722 active frames over 33 ms. GCs 285 -> 89, allocation 8.22 -> 2.49 MB/s against P11's soak.
- **Audio output path:**
  - one silent AudioTrack costs the platform pair 104-106% of a core (muted 0) and 86-122 active frames over 33 ms per
    360 s run (muted 0);
  - `PERFORMANCE_MODE_POWER_SAVING` is refused on the Stick, which has no deep-buffer port: no gain;
  - lever left: AAudio MMAP (`mmap_no_irq_out`), untested.
- **Muted on this APK:** 0 / 0 frames over 33 ms, max 29.3 / 29.7 ms (under 33 for the first time), worst p95
  18.9 / 19.2 ms (still over 16.7).

## Questions

1. **Goal 1 with sound on.** On this Stick, any PCM stream mixed by AudioFlinger costs the pair about half a core each
   and brings back the tail. Neither the voice count (P12), the parameter rate (P12) nor the performance mode or buffer
   size (P14) changes that. The only declared route that bypasses the mixer is `mmap_no_irq_out`, reached by an AAudio
   stream in MMAP mode (NDK, or Oboe). Should the next run build a perf-only `silentMmap` arm? That would be one
   exclusive AAudio MMAP output stream of zeros, plus a route proof that `AudioOut_D` stays in standby and the HAL
   writer stays idle, judged against muted under the same rule. Only if it beats silentTrack would a mixdown be worth
   building. The app would then mix the game's cues itself into that one stream:
   - decode the cue manifest's sounds to PCM once (today SoundPool decodes them, within the same decoded budget);
   - per-voice gain, pitch (resampling) and pan, as `parameters()` sets them today;
   - the streamed song (today Music);
   - a mixer thread feeding the MMAP buffer;
   - `GdxAudioBackend` as the cue path's sink, so the cue service, worker and voice handles stay as they are.

   Whether the mixdown sounds the same would need a listening test (N3).
2. **Goal 1's p95 bar even without sound.** Muted reads 0 frames over 33 ms and a max under 33 ms on this APK, but its
   worst p95 is 18.9-19.2 ms against 16.7. If the MMAP route is not taken, or fails, goal 1's p95 line cannot be met on
   this device with sound on, and not today even muted. Does the App Master want a ruling on goal 1's bar (the
   operator's), or a P15 on the muted over-20 ms tail (44-45 frames a run)?
3. **The soak's transition watch.** The soak was settled at its start and ran a later `deathride/main` APK, and it read
   132.7 ms in 2 of 14 round transitions. Both were lobby frames 3.0-3.4 s before a race, with 107-128 ms of work but
   47-52 ms of CPU, on a host that was loading up again. It is not P13d's graded 360 s command. Does it reopen line 18
   under ruling 1?
4. **The rejected input.** The soak fails I2's zero-rejection line on one input at second 4.94, the Wi-Fi stall known
   since P0. silentDeep-run1's bursts also began 4.7 s in. Should the soak be rerun for that line, or does the stall
   need its own card?
5. **Evidence.** As in P12-P13g: summaries are committed, and the raw traces, logcats, dumpsys output and both APKs are
   kept outside git with their SHA-256 (`manifest.json`).
