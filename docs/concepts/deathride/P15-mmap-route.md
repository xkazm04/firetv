# P15 - does an AAudio MMAP stream keep the Stick's audio pair idle?

2026-10-08, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/stack-grounded-opportunity-research-4a0b4a1f`, cut from `deathride/main` b94dd443 (P14). Every figure
below was measured in this session. Summaries are in `deathride/evidence/perf/p15/`. Its `manifest.json` binds the raw
dumps, logcats, gate log, scripts and both APKs, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p15/`. Nothing a player hears changed. Nothing was pushed.

## Figures first

**No MMAP route is granted on the Stick.** Neither an EXCLUSIVE nor a SHARED low-latency AAudio stream reaches
`mmap_no_irq_out`. Both fall back to AAudio's legacy AudioTrack path and become a normal mixed track on `AudioOut_D`.
That is the same thread, flags and frame count as P14's silentTrack. The pair wakes as it did for silentTrack. Step 3
(the A/B) was not run, as the brief requires when no MMAP route is granted.

| silentMmap launch | Granted (the arm's log line) | AAudio MMAP endpoints opened | Holder | `AudioOut_D` standby | `AudioOut_D` / HAL `writer`, % of a core (slices/s) |
|---|---|---|---|---|---|
| lobby, EXCLUSIVE asked | SHARED, perf mode NONE, 48 kHz, burst 770, capacity 1,540, device 2, MMAP used 0 | 0 exclusive, 0 shared | track on `AudioOut_D`, flags 0x000, 1,540 frames | **no** | 55.9 (18,173) / 55.5 (18,186) |
| lobby, SHARED asked | SHARED, NONE, 48 kHz, 770, 1,540, device 2, MMAP used 0 | 0 / 0 | the same | **no** | 55.9 (17,899) / 55.3 (17,911) |
| probe run, 30 s (lobby) | as the first row | 0 / 0 | the same | **no** | 51.0 (17,658) / 49.7 (17,535) |
| probe run, 60 s (race) | as the first row | 0 / 0 | the same | **no** | 51.6 (17,825) / 50.8 (17,792) |
| reference: nothing running | - | 0 / 0 (none searched since boot) | - | yes | under 0.5 |

The CPU column is a route check: two schedstat reads about 10 s apart (14.0-15.3 s with the adb round trips). It is not
a graded reading.

**What this answers.** P14 showed that any PCM stream that AudioFlinger mixes costs the pair about half a core each.
P15 shows that on this Stick, as configured, no app stream can avoid the mixer. The only declared PCM route around it,
`mmap_no_irq_out`, serves the `HDMI-Out` device only, and Fire OS does not attach that device. It attaches `Speaker`
(id 2), which only `primary_out` (`AudioOut_D`) serves. **The sound-on lever is closed: goal 1 cannot be met with sound
on through any app-side output path on this device.** Per ruling 2 (section 8), goal 1's bar now goes to the owner.

## The route evidence (`evidence/perf/p15/route.md`, `route.json`, `route-policy.txt`, `route-ports.txt`)

- **Nothing running:** `aaudio.mmap_policy` 2 and `aaudio.mmap_exclusive_policy` 2 (AUTO: MMAP is allowed and tried
  first), `aaudio.mixer_bursts` 1. `dumpsys media.aaudio` showed no endpoint, and none had been searched for since boot.
  Both mixers were in standby.
- **The open, in order** (full logcat at the first lobby launch):
  1. `APM_AudioPolicyManager: getOutputForAttrInt() device {type:0x2}, ... flags 0x4001` (DIRECT | MMAP_NOIRQ). No
     output is returned.
  2. `AAudioService: openStream(), could not open in EXCLUSIVE mode`. The same request and refusal follow for the
     shared MMAP endpoint. `dumpsys media.aaudio` counts searches but 0 found and 0 opened, exclusive and shared.
  3. Legacy fallback: `flags 0x104` (FAST | RAW) returns output 13 (`AudioOut_D`). AudioFlinger then refuses the fast
     track: `createTrack_l(): mismatch between requested flags (00000104) and output flags (00000002)`.
  4. The stream becomes a normal mixed track, so it reports performance mode NONE.
- **Why:**
  - `mmap_no_irq_out` (DIRECT | MMAP_NOIRQ, PCM 16-bit, 48 kHz) lists one supported device, `HDMI-Out`.
  - The attached output devices are `Speaker` (`AUDIO_DEVICE_OUT_SPEAKER`, id 2) and a `Default Out` stub.
  - Of all 15 output mix ports, only `primary_out` serves `Speaker`. Every DIRECT port serves `HDMI-Out` or
    `AVLS-Out`, and neither is attached.
  - An app cannot pick a device that the policy has not attached.
- **Threads that wake with silentMmap open,** in the lobby and in the race:
  - audioserver's `AudioOut_D` and the HAL's `writer` run at 50-56% of a core each, about 17,500-18,200 slices/s.
    That is P14's silentTrack range (52-54% in its graded runs). No other audioserver or HAL thread reaches 0.5%.
  - In the app, the stream's only thread is the legacy path's `AudioTrack` callback thread. It ran 3-7 slices in all
    and none between the reads. The server never drains the full 1,540-frame buffer (server position 0, the same
    Fire OS quirk as silentTrack's row), but the mixer cycles anyway.
  - No AAudio service thread runs, because none was created.
- **After each force-stop,** `AudioOut_D` and `AudioOut_15` were back in standby. At the end, with the owner's app in
  front, no AAudio endpoint was open.

## What the arm proves

- **The arm** (43e547e3):
  - `AudioArm.SILENT_MMAP` (`silentMmap`) takes MUTED's path in `GdxAudioBackend`, and its app stream is
    `AppTrack.MMAP`.
  - The perf launcher opens one NDK AAudio stream: EXCLUSIVE (SHARED when the perf-only extra `mmapSharing=shared` is
    given), LOW_LATENCY, usage GAME, content type SONIFICATION, PCM 16-bit stereo, 48 kHz.
  - Its data callback writes zeros. The stream opens on resume and closes on pause.
  - It logs one line with what was granted: sharing mode, performance mode, rate, channels, format, burst, capacity,
    buffer size, device, session, and `AAudioStream_isMMapUsed`. That last one is the platform's test API, looked up
    with `dlsym`.
  - It uses no Oboe and adds no dependency. libaaudio, liblog and libdl are NDK system libraries.
- **Build wiring (`app/build.gradle.kts`):**
  - Only `-PsilentMmap=true` pins `ndkVersion` 28.2.13676358 and wires `src/main/cpp/CMakeLists.txt` with CMake 3.22.1.
    Both were already in the SDK, and nothing was downloaded.
  - The property passes `-DDR_SILENT_MMAP=ON` to the **debug** build type only, and the CMakeLists builds no target
    without it.
  - The Kotlin wrapper (`src/main/mmap/.../SilentMmap.kt`) is added to the debug source set only.
  - `MainActivity` reaches the wrapper by name. Without the property, silentMmap throws
    (`needs a debug build made with -PsilentMmap=true`), so a mistyped perf build cannot pass for the arm.
  - The perf APK command is P14's plus `-PsilentMmap=true`.
- **Release carries nothing** (`release-proof.json`). One release build made *with* the property
  (`assembleRelease -PsilentMmap=true -PnoPngReencode=true`) packs only the two `libgdx.so`. Its dex contains no
  `SilentMmap` class and no `nativeOpen`. The perf debug APK packs `libdrsilentmmap.so` for arm64-v8a and armeabi-v7a,
  plus the class. Without the property, no build changes at all.
- **As before, only the debuggable `dev.deathride.perf` reads `audioArm`.** `full` stays the default.
  `AudioArmTest`'s replay SHA-256 for `full` and for the default constructor is still `7678bc90...`
  (`defaultArmGivesThePlatformTheSameStartParametersAndStopCallsAsBefore` green).
- **Tests (AudioArmTest):**
  - silentMmap replays line for line like muted: no play, loop, setPitch, setPan or stop, and the same stats but the
    arm id. It is a new case of the parameterised silent-arm test.
  - Exactly the three silent stream arms ask for an app stream, and all three are silent.
  - Unknown names still throw, now including `silentmmap`, `SILENT_MMAP`, `mmap` and `silentMMAP`.

## Failures and limits kept

- **One void route run.** The first race-route probe could not start, because node's `ws` package was not in the
  worktree (`ERR_MODULE_NOT_FOUND`). It sat in the lobby, its dumps are kept as `race-silentMmap-void-noWs-*`, and it
  read the same route.
- **One run with no race reading.** After `ws` 8.18.0 was copied from the main checkout (gitignored
  `tools/node_modules`, removed at the end), the second run was still in the lobby at both dump points. It is kept as
  `race-silentMmap-a-*`, with the same route. The third run took its second reading in a race (`/stats` phase `race`,
  27.3 s in).
- The route runs exit 1 on the probe's class-coverage assertion (180 s), as P14's diagnostic runs did. They are not
  graded.
- **The main log turned over before the shared-mode launch could be read in full.** The shared launch's policy lines
  are not kept. Its granted line, the AAudio service's counters (shared searches 1 -> 2, 0 found) and the
  `could not open in EXCLUSIVE mode` warning are kept.
- **Not tried** (each outside this brief's arm, or not an app's act):
  - selecting an output device by id (`AAudioStreamBuilder_setDeviceId`). No HDMI device is attached for the app to
    select;
  - `hdmi_pcm_passthrough_direct`, which also serves HDMI-Out only;
  - changing the platform's audio policy or HAL configuration, which needs a system image;
  - any listening test (the arm writes zeros).
- No graded run was taken, so this run has no frame figures. The pair's CPU above comes from route checks, not from
  P12's rule.

## Gates

- `gradlew.bat :core:test :link:test :game:test --rerun-tasks --console=plain` is green on 07ccb265. Its code is
  identical to 43e547e3, the last code commit: core 261, link 29 (2 skipped, as on the base), game 114 (113 + the
  silentMmap case).
- `EvidenceRuleTest` ran green with the P15 evidence committed. No link timing test failed, so none was rerun.
- `assembleDebug -PsilentMmap=true` (the perf APK `d156d758...`) and `assembleRelease -PsilentMmap=true
  -PnoPngReencode=true` both built offline. Nothing was downloaded.
- What did not change:
  - any threshold, clock, input rate, render scale, budget or physics;
  - `perf-device.py`'s arguments, the grading in `perf-p10/p11/p12/p14.py`, and `settle.ps1`;
  - link/, core/, RaceGame, the HUD, any asset, and the default arm's platform calls.
- `perf-p15.py` was not written: its rule is for step 3, which the route did not reach.
- The owner's `dev.deathride.tv` was in front before and after: the same task t330, activity record a03c5a7 and
  process 14337. Task size was 4 before and 4 after. The restore intent went to the running top-most instance, and the
  package was last updated 2026-10-06 23:44:23. `dev.deathride.perf` was force-stopped, and both mixers were in
  standby with no AAudio endpoint open (`device-state.json`). The copied `ws` was removed.

## Card figures (for the optimize ledger)

- **Audio output path, P15 (sound-on lever closed):**
  - AAudio MMAP is not granted. EXCLUSIVE and SHARED low-latency streams both fall back to a mixed track on
    `AudioOut_D`, flags 0x000, 1,540 frames, performance mode NONE.
  - `mmap_no_irq_out` serves HDMI-Out only, and Fire OS attaches Speaker (id 2), which only `primary_out` serves.
  - With silentMmap open, the pair runs at 50-56% of a core each (about 17,500-18,200 slices/s), lobby and race. Muted
    is 0.
  - So every app PCM stream on this Stick costs the pair (P14 + P15).
- **Lane C, new card: the early-probe Wi-Fi delivery stall** (ruling 4, figures from P14):
  - Rejection bursts come 4.7-6.0 s into a probe, and have been known since P0. Two of P14's three bursts fell there.
  - The soak's one rejected input: slot 1, q=139, refused at second 4.94, receive age 270.3 ms, RTT 297.3 ms. That one
    input fails I2's zero-rejection line.
  - silentDeep-run1: 9 + 9 inputs refused at receive ages of 251-313 ms, in bursts at seconds 4.7-6.0 and 307-309.
    The run is void.
  - The line is read again at the next goal-1 soak, and no soak rerun is commissioned for it.

## Questions

1. **Goal 1's bar (ruling 2: now the owner's).** With sound on, every app stream on this Stick goes through
   `AudioOut_D`'s mixer. That costs the pair about half a core each and brings back the active tail (P14's silent arms: 73-162
   frames over 33 ms per 360 s run, worst p95 20.5-31.1 ms). Muted, the tail over 33 ms is gone (0 / 0), but the
   worst p95 is 18.9-19.2 ms against 16.7. Under N3 the sound stays. Does the owner keep the bar (16.7 ms p95, 33 ms
   max) and record goal 1 as not met on this device with sound on? Or set a sound-on bar for the Stick?
2. **No mixdown is proposed.** The mixdown sketch in P14's question 1 was worth building only if silentMmap beat
   silentTrack. With no MMAP route, a mixdown into one AudioTrack would still be one mixed stream on `AudioOut_D`, and
   P14 measured that one zero-writing stream costs the pair as much as the full mix. So the sketch is not updated, and
   nothing is asked under ruling 1.
3. **The muted over-20 ms tail** (44-45 frames a run). Ruling 2 holds it until the owner rules on the bar. If the bar
   stays, it is the only part of goal 1 left that the app could move, and only muted.
4. **Evidence.** As in P12-P14: summaries are committed, and the raw dumps, logcats, gate log, scripts and both APKs
   are kept outside git with their SHA-256 (`manifest.json`).
