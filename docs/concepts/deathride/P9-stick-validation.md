# P9 - Stick validation of the 10-06 render wave, one blending cut, the race-start hitch

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11, 1920x1080 override), isolated
`dev.deathride.perf` / 8772 / private ADB 5041. Base `deathride/main` 86cb512d,
which includes the 10-06 optimize wave and the later weapon/mount merges. The
installed `dev.deathride.tv` package was not touched. Every figure below was measured
in this session. Evidence is in `deathride/evidence/perf/p9/` (`manifest.json` binds
the raw traces, full-size captures and APKs, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p9/`).

## Reconciled first

The ledger still listed six cards as backlog that have already landed:
49a6fd68 AtlasArt memo, 81a2f692 ring tables, a7b22eb9 HUD text, d47205a0 lazy
/stats, 5e380025 link priority and cb0b1040 release R8. None was redone. The only
open render card that could change the tail was the opaque-blending one.

## The P8 arm no longer runs unchanged

Two failed attempts are kept in `failed-attempts/`.

1. **Routes timeout.** The first run aborted at second 0: `TimeoutError`, 0 rounds.
   Courses build lazily since baf5181a, so the probe's first `/routes` (17,540,089
   bytes) builds every playable course. That takes longer than the probe's 5 s
   setup fetch. P8 paid this cost at class load. `perf-device --warm-routes` now
   makes that one GET before the probe, with no 5 s limit, and records it. It took
   11.7, 20.1, 16.9 and 15.8 s across the runs.
2. **Stale course ids.** The second run timed out at its first selection with 0
   rounds. The P8 cycle (`foundry, saltline, scree, sluice, ridge`) is no longer in
   the playable catalog, which now lists region courses, and the server ignores
   the pick. `PROBE_TRACKS` / `--tracks` now names the course cycle, and an
   unplayable id fails at once. Both P9 arms used `scrap-1-c, foundry-1-c,
   salt-1-b, switchback-1-a, crown-1-a`: the first course of each region, which
   covers all five themes.

Everything else follows P8 unchanged: two 30 Hz probe controllers, mines on, the
host probe at AboveNormal with other processes untouched, a 900 s duration, and
the same gates and thresholds. Both A/B arms ran `--profile`, because
`sceneryDrawMs` needs the phase profile. The P8 delivery run was unprofiled and
used the old courses, so every P8 comparison below is across both differences.
Its later code is also 176 commits newer.

## Baseline soak (step 2): deathride/main, APK `3ec2ee5d...`

900.147 s, 14 rounds, all ten classes active, thermal status 0 throughout.

| Reading | P9 baseline | I2 budget | Status | P8 delivery |
|---|---:|---|---|---:|
| Active p50 range | 16.653-16.711 ms | 16-18 ms | pass | 16.624-16.707 |
| Worst active-window p95 | 21.964 ms | 16.7 ms (G1 21.60 for comparison) | fail (both) | 22.433 |
| Active max | 79.611 ms | < 33 ms | fail | 54.923 |
| Six-live worst p95 (139 windows) | 21.964 ms | 16.7 ms | fail | 22.433 |
| Transition max | 2,376.901 ms | none set by I2 | reported | 288.857 (all windows) |
| PSS range | 171.495-187.878 MiB | < 192 MiB | pass | 107.099-140.192 |
| Warm PSS change | -3.051 MiB | <= 8 MiB | pass | -26.302 |
| Owned textures / art | 39.970 / 18.750 MiB | 52 / 32 MiB | pass | 39.970 / 18.750 |
| Rejected inputs | 5 / 5 | 0 | fail | 0 / 0 |
| Input stream | 29.983 Hz, 3 host pump stalls | > 29 Hz, no stall | fail | 30.0004 Hz, none |

Pooled active profile: interval p95 18.813 ms; work p50/p95 8.326/17.124 ms; CPU
p50/p95 6.945/9.656 ms; `sceneryDrawMs` p50/p95/mean 0.853/1.976/1.033 ms (the
card's P5 figure was mean 1.29, p95 1.89).

The worst active frames are not fill-bound. The 79.6 ms frame had simulation at
24.0 ms and work at 48.8 ms, but CPU at only 21.4 ms. Every frame above 54 ms
has the same shape: wall time exceeds thread CPU while the scenery draw takes
0.6-3.6 ms.

The ten rejections came in three bursts between seconds 864 and 867. Their receive ages were
252-303 ms, the same signature as the receive gaps documented in P6/P8. The 1.1-2.4 s
course-switch stalls fall in transition windows, not active ones.

PSS peaks 47.7 MiB above P8's peak. That increase is measured but not attributed.

## The cut (step 3): road and shortcut tiles with blending off

Alpha audit, done before any change:

- All 11 base tiles and all 16 region tile variants are alpha 255.
- The tint is alpha 1.0 (254 when packed).
- The oil decal is translucent, so it keeps blending.
- The 2048x2048 baked scenery target holds 5,871-10,430 texels below alpha 255
  (lowest 185), from sprite edges baked into it, so its full-screen quad keeps
  blending too.

The change therefore wrapped only the road and shortcut quads in `TrackScene.draw`
with `disableBlending`/`enableBlending` (4b2f23b9).

Desktop proof: `--blend-check` (BlendAudit, in that commit) renders the shipping
`TrackScene.draw` plus `drawRoadMarks` both ways into a 1920x1080 RGBA8888 target
(desktop GL, RTX 4090). It covered the five soak courses plus `runoff`, the only
playable course with an oil decal: 66 views across lobby, overview and race zooms,
hazards and shortcuts. It checked every texel and vertex alpha the opaque draws
sample. **0 of 136,857,600 pixels differ.** This is desktop GL, not proof that the
Stick's fp16 path produces identical bytes.

Second soak on APK `cd2513d7...`, same arm: 900.141 s, 14 rounds. Its only
difference from the baseline APK is `classes2.dex` (+164 bytes uncompressed). The
1 MB gap in file size comes from zip packaging.

| Reading | Baseline | Opaque road | Change |
|---|---:|---:|---:|
| Worst active-window p95 | 21.964 | 25.398 | +3.433 ms |
| Pooled active interval p95 | 18.813 | 19.028 | +0.215 ms |
| Active max | 79.611 | 92.681 | +13.070 ms |
| Six-live worst p95 | 21.964 | 23.800 | +1.836 ms |
| `sceneryDrawMs` p50 / p95 / mean | 0.853 / 1.976 / 1.033 | 0.897 / 1.972 / 1.075 | +0.044 / -0.004 / +0.042 |
| `carsEffectsMs` p50 (code unchanged) | 2.439 | 2.702 | +0.263 |
| CPU p50 | 6.945 | 7.463 | +0.518 |
| PSS range MiB | 171.5-187.9 | 160.8-177.7 | (pass both) |
| Rejected inputs | 5 / 5 | 0 / 0 | |
| Host pump stalls | 3 | 4 | (fail both) |

**Verdict: not better. Reverted** (6af138c5). The keep rule (sceneryDrawMs and
active p95 no worse) fails. Phases the change does not touch moved more than the
scenery phase did, so the gap reads as run-to-run variation rather than a cost of
the cut. Either way no gain was measured.

The likely reason is structural. The full-screen scenery quad has to stay blended,
so the fragments under the road are shaded before the opaque road covers them.
Removing blending from the road alone gives the tiler nothing to drop. A bake
that writes alpha 1 would make the quad eligible, but it changes edge pixels
(the brief forbids that).

These are single runs per APK, one after the other, with no repeated-measures
variance.

## The race-start hitch (step 4): attributed, not fixed

The profiled baselines already put the stall in the `prepare` phase (`scene.advance`)
with 0 texture uploads in those frames. A third, diagnostic APK (`41f0a14f...`, the timers committed in e2e3de27)
adds per-section bake timing, the wall and GL-upload time of `selectRegion`, and
a separate timer on the first `course.project()`. It ran for 360 s on the same
cycle.

| Course, first visit | Slowest bake step | First `course.project()` | `selectRegion` (GL upload) |
|---|---:|---:|---:|
| scrap-1-c (app start) | landmarks 1,139.6 ms | **1,138.5 ms** | 115.7 (7.6) ms |
| foundry-1-c | landmarks 1,372.9 | **1,372.2** | 90.8 (4.8) |
| salt-1-b | landmarks 1,790.2 | **1,789.7** | 106.1 (5.6) |
| switchback-1-a | landmarks 1,839.2 | **1,838.8** | 71.0 (4.9) |
| crown-1-a | landmarks 2,268.4 | **2,268.3** | 64.5 (4.9) |
| scrap-1-c revisit | kerbs 3.5 | 0.056 | 78.2 (4.9) |

The slow phase is the first `course.project()` of each course. It builds that
course's lazy projection bins (`Course.candidates by lazy` in core) on the render
thread, inside one bake step of the landmark section.

- It is not a texture upload: upload time is 4.8-7.6 ms and those frames show 0
  uploads.
- It is not first-use class init: the cost recurs for every new course, grows
  from 1.1 to 2.3 s, and is gone on a revisit (0.056 ms).
- `selectRegion` is a separate 65-116 ms stall in the `requests` phase.

The baseline soak shows the same pattern (1,108-2,372 ms on first visits, 5-13 ms
on revisits). The ledger's "1.1 s at race start" is therefore the first visit of
the launch course. Every other course pays more on its first lobby selection.

Not fixed here. The link `track` handler already builds the course on its IO
thread (e13d7cef) but not the bins. Pre-baking them there, or at course build in
core, falls outside this run's paths.

## Host instrument finding

All 10 host pump stalls across the three runs (104.8-731.2 ms) start within 2 s
of the probe's own memory sample (`adb shell dumpsys meminfo` and
`thermalservice` spawned from the pump's event loop). The independent heartbeat
isolate recorded 0 stalls, so these were main-loop pauses, not a host-wide gap.
The host was at 85-91% CPU from other sessions in the two snapshots taken. The I2 input-stream and functional
gates fail on every P9 run for this reason, not because of the Stick.

Moving the sampling off the pump thread would change the procedure, so it was not
done mid-A/B.

## Gates and limits

`gradlew.bat :core:test :link:test :game:test` is green: 236 core, 18 link (2
skipped) and 71 game tests. The diagnostic timers stay in `TrackScene` and
`ProfileGl`: one `nanoTime` per bake step, a log line per bake, and upload timing
only in profiled builds. The render pass is byte-identical to `deathride/main`.

Not measured: optical latency, owner feel, an unprofiled 900 s run of this code,
a cold device, or variance across repeated runs. No images were generated, no
threshold, clock, input rate, render scale or effect changed, and nothing was
pushed. When the runs finished, `dev.deathride.perf` was stopped and the owner's
`dev.deathride.tv` (same process and task as at start) was brought back to the
front.
