# I2 Stick texture and frame budget - design first, 2026-10-01

Declare limits before the sustained measurement. Units below are binary MiB (1,048,576 bytes); PSS from Android is KiB. Texture storage counts allocated RGBA texels, without mipmaps; it is not a replacement for whole-process PSS.

| Allocation | Budget MiB | Basis |
|---|---:|---|
| Resident art | 32 | World/UI pages 8, repeat tiles 2.75, one optional backdrop 4, up to two future car pages 8; grid autotile pages are not loaded for spline courses |
| One art page | 4 | At most 1024x1024 RGBA, no mipmaps; tiles at most 256x256 |
| Scenery framebuffer | 16 | One 2048x2048 RGBA target, no depth buffer |
| Runtime fonts | 11 | Android 20/44/16 fonts: 1024x512, 1024x2048, 1024x256; the 8 MiB large-font page is an explicit non-art exception |
| Pairing QR | 0.22 | 240x240 RGBA |
| Total owned textures | 52 | All above actually resident; preserves about 10 MiB headroom over a story screen with this bundle |
| Whole-process PSS | 192 | Measured with `dumpsys meminfo --local dev.deathride.tv`, not a Java heap estimate |

Publish actual art, fonts, QR, scenery and total owned texture bytes in telemetry, with limit status; count each font texture once. Asset loads must reject an over-budget allocation and retain their procedural fallback. Keep one story backdrop; loading another disposes the old one. Effects retain their fixed pool.

Check the PNG signature/IHDR dimensions and remaining residency **before decoding pixels**. Checking an already decoded Pixmap is too late to protect process memory from an oversized replacement file. Keep file-backed managed textures for Android context recovery; avoid decoding the same PNG once for dimensions and again for upload. Add a malformed/oversized-header regression and retain the real-GL zero-budget fallback check. This loader correction does not modify shipped image pixels.

Reject empty/overflowing animation catalogs and zero-area/out-of-region HUD or car bounds. A valid texture page must not make malformed metadata count as an available effect or introduce an infinite HUD scale. The GL audit mutates only a temporary bundle and checks that unrelated pickup art remains available.

The IP live finale screenshot also exposed a dangling `else` in the existing HUD loop: each inactive duel slot drew the garage footer over the two-car race HUD. Add braces around the outer race/countdown/results branch and inspect a two-entrant race on the final APK. This is a drawing correction; no participant, payout, lap or camera rule changes.

Run at least 900 seconds on the scanned AFTKM using two ordinary 30 Hz controllers, six-car combat and a five-theme course cycle. Save every raw PSS/thermal sample and rolling frame distribution. Run memory sampling asynchronously so it does not block controller input. Require PSS below 192 MiB and compare medians of the first and last three non-start samples (growth at most 8 MiB); report the entire range and trend, not just the last reading. No fake GC or ordinary application memory dump.

Frame objective: median in the 16-18 ms range near 16.7 ms. Compare active-window p95 against G1's 21.60 ms and the original 16.7 ms ambition without calling either an automatic pass. Retain active and transition maxima separately, with 33 ms as the active maximum target. Since-start pooled histogram and exact rolling distributions keep their own meanings. If texture/PSS or sustained frame limits fail, cut decorative effects or residency and repeat on the resulting APK; do not change physics, clocks or measurement thresholds to hide a broken budget.

Inspect final screens and collect Home/resume and story residency evidence. Approved car sprites remain unavailable; no claim that their future pages or animation have been measured. Optical latency, physical-phone comfort, cold-device behavior and contended Wi-Fi remain owner/hardware work. One final build/status/session/commit closes this wave; no art generation is planned.

## Preparation work cut during the first run

The initial art-enabled soak showed active medians near 16.7 ms but a 271 ms preparation/start peak. Inspection found 9,000 ground and 20,000 road specks still being baked even where opaque material tiles cover them. Remove that redundant decoration when its material art is available; keep the procedural grain for missing-material fallback. Also remove duplicate baked road/shortcut tile passes, since the cached live quads already supply them over the procedural ribbon. Yield after each candidate decorative prop rather than processing the whole prop loop in one slice. This does not alter physics, clocks, thresholds, live road geometry or warning markings. Retain the first run as baseline and perform a full 900-second run on the changed APK. No performance improvement is claimed until measured.

## Active effect cut

The preparation-cut run recorded a 34.54 ms fully active maximum, above the declared 33 ms target. Do not move the threshold. Suppress the redundant 720-slot procedural skid history when atlas skid art is available, and suppress procedural smoke/muzzle/explosion decoration when those exact sprite effects are available. Keep tracer paths, mine warnings, blast-radius rings, dust and health indicators. Missing effects retain their individual procedural fallback. Reduce the atlas cosmetic pool from 96 to 64 slots and skid emission from 10 to about 6.7 per second per drifting car. Atlas smoke uses the shared 40% HP threshold so removing its procedural duplicate does not create a missing warning band. Shorter atlas drift trails replace the long procedural skid history, including its braking-only marks. These are visual cuts only; catalog animation durations and combat state remain unchanged. Retain the preceding complete soak, then measure another full 900 seconds on the resulting APK.

## Retained first-run result

The initial APK ran 900.01 seconds, with PSS 107.22-115.71 MiB and first/last warm median change -0.18 MiB. Active window medians ranged 16.60-16.85 ms; worst active p95/max were 20.99/32.34 ms, while the initial/preparation maximum reached 271.10 ms. Its zero-rejection gate failed (5 and 6 rejected frames, on the two seats, in one transition window). That failure is retained in `evidence/phase2/i2-baseline/`; duration and valid numeric observations are not discarded.

The same all-course probe measured median selection-to-ready time 3188.60 ms before the preparation cuts and 1022.44 ms after them (25 courses each, including polling overhead). Subsequent full-load measurements are reported separately. Logging of rejection timestamps and host pump stalls was added without changing the input rate, telemetry cadence or acceptance thresholds.

## Host scheduling failure retained

The preparation-only run lasted 900.20 seconds with zero rejected inputs, but its Windows controller sent only 26.81 Hz per seat. Its 222 recorded pump stalls reached 2.68 seconds. This fails the declared load; stable Stick frame medians do not turn it into an accepted soak. Archive it as `i2-pre-effects`. The diagnostic host was concurrently running the four-worker physical library. After verifying the report PID's command line, lower only that process to BelowNormal and launch the final Node controller at AboveNormal. Record these scheduling settings. No game clock, input rate, sample cadence or threshold changes. The resulting run must still demonstrate the actual required input throughput.

## Full-rate effects-cut observation

The effects-cut APK ran 900.007 seconds at 30.0009 Hz per seat with zero recorded host pump stalls. It still failed the zero-rejection gate: four and three inputs were rejected, with ack RTTs 258-360 ms around seconds 414, 466 and 472. The measured render windows cannot establish whether those network/receiver delays originated on the LAN or in device scheduling. Do not weaken stale-input rejection. PSS was 105.64-113.09 MiB, warm-median change -3.57 MiB; owned textures 37.97 MiB. Active p50 ranged 16.602-16.853 ms and worst p95 was 21.238 ms. One active maximum reached 41.979 ms at the second window; the all-window maximum was 212.962 ms at the first window. Thus the median/memory budgets passed, while the strict tail and transport gates did not. Keep this full record even if a later run passes.

Repeat after the quiet device windows with the physical report finished. Subsequent loader review found the pre-decode and metadata guards described above, so the final repeat uses that corrected APK. Host load and loader code both differ; this cannot isolate which condition changed any timing or network result. It is not evidence that earlier failures disappeared. No threshold, physics, input rate or warm-up exclusion changes are authorized by this diagnostic choice.

The retained rejection correlation pairs each ack with the next ten-second render window. The active windows covering seconds 414 and 472 had maxima only 26.86 and 27.10 ms; the transition covering second 466 reached 125.11 ms. These coarse observations do not explain the 258-360 ms round trips as equivalent render stalls. A synchronized packet/server-queue trace would be needed to assign a cause. Raw correlation: `evidence/phase2/i2-rejection-diagnostic.json`.


## Final corrected APK observation

Final APK SHA-256 `871346fef88691cdea96dfbdb6fab33496076cd40f2509051b29b8ba2d0150d0` ran **900.024 seconds**, completed **11 races across all five themes**, and accepted **27,001 inputs per seat at 30.0003 Hz**, with zero rejected inputs and zero recorded host pump stalls. The sustained-load assertions pass. All 78 regions remain available with zero asset failures; 1,040,463 atlas draws occurred during the load. Installed `base.apk` hashes to the same measured file.

PSS from sixteen `dumpsys meminfo --local` observations was **107.018-115.502 MiB**, under 192 MiB. First/last warm medians were **114.035 / 113.880 MiB** (change **-0.155 MiB**); the fitted warm trend is **+0.04993 MiB/min**, so this is not a claim of monotonic decline or proof against a longer-term leak. Owned textures stay **37.970 MiB** (art **10.750 MiB**), under 52/32 MiB. Story residency separately adds one 4 MiB backdrop. Thermal status stays zero; sampled CPU/GPU/skin maxima are **60.196 / 42.652 / 42.300 C** on the already warm device.

Across **73 fully active windows**, p50 spans **16.574-16.812 ms**, worst p95 is **21.644 ms**, and maximum **34.920 ms**. Thus median and memory limits pass, but **both p95 comparisons (original 16.7, G1 21.60) and the 33 ms active maximum target remain missed**. Across all 90 windows the maximum is **241.275 ms** at initial preparation; worst p95 is 21.696 ms in a transition window. Discarded simulation time is **741 ms**, all in windows containing transitions; the first window records three stale consume samples per seat despite zero rejected input packets. Do not describe this as uninterrupted 60 fps or zero latency loss. Earlier failures are retained, not replaced by this passing sustained-input observation. No timing/transport gate was loosened.

The all-25-course selection-to-ready median is **1180.55 ms**, versus 3188.60 ms before preparation cuts (polling overhead included; separate sessions, not an isolated GPU benchmark). Final all-ten-car/all-course/story/Home-resume checks pass. Final two-car HUD preview is clean; real-GL missing/failed/over-budget/invalid-metadata fallbacks pass. The no-art desktop combat check covers 16.85 simulated seconds, 63 shots and two wrecks, not a completed race. Green build: **89 core / 3 link / 3 renderer tests** plus APK. Evidence: `deathride/evidence/phase2/i2-*` and `i2/manifest.json`.

I2 closes with measured median/residency success and explicit tail/transition limitations. Future approved car textures, other hardware, cold/congested runs, optical latency and owner feel remain unmeasured. This integration run generated zero images/videos and used none of its initial 50-image allocation; the parallel art ledger is separately scoped in G2.
