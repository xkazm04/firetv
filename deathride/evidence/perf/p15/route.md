# P15 step 2: silentMmap's route on the Stick (before anything graded)

APK `d156d758...` (`raw/p15/arms.apk`, built from 43e547e3 with `-PsilentMmap=true`, installed as `dev.deathride.perf`).
`scripts/route.sh` launched the perf package with the arm (no probe), waited 25 s, and took `dumpsys media.audio_flinger`,
`media.aaudio` and `media.audio_policy`. It read the schedstat of every thread of audioserver, the audio HAL
(`fireos.hardware.audio.service`) and the app twice, about 10 s apart. `scripts/race-route.sh` repeated the dumps during one
ungraded 180 s probe run (P11's command, `--extra audioArm=silentMmap`): 30 s after pairing (lobby) and 60 s after it (race,
per `/stats`). The raw dumps are outside git, bound by `manifest.json`. Summaries: `route.json`, `route-policy.txt`, and
`dumpsys-*-aaudio.txt` (each in full).

## Nothing running (baseline)

`aaudio.mmap_policy` = 2 and `aaudio.mmap_exclusive_policy` = 2 (AUTO: MMAP is allowed and tried first), and
`aaudio.mixer_bursts` = 1. `dumpsys media.aaudio` showed no endpoint, and no endpoint had been searched for since boot.
Both mixers (`AudioOut_D`, `AudioOut_15`) were in standby. No audioserver or HAL thread used 0.5% of a core.

## What was granted (the arm's own log line, every launch)

| Launch | Requested | Granted sharing | Performance mode | Rate | Burst | Capacity / size | Device | MMAP used |
|---|---|---|---|---:|---:|---:|---|---|
| lobby | EXCLUSIVE, LOW_LATENCY | **SHARED** | **NONE** | 48,000 | 770 | 1,540 / 1,540 | 2 (Speaker) | **0 (no)** |
| lobby, `mmapSharing=shared` | SHARED, LOW_LATENCY | SHARED | **NONE** | 48,000 | 770 | 1,540 / 1,540 | 2 | **0** |
| probe run (lobby, then race) | EXCLUSIVE, LOW_LATENCY | **SHARED** | **NONE** | 48,000 | 770 | 1,540 / 1,540 | 2 | **0** |

"MMAP used" is `AAudioStream_isMMapUsed`, which the platform's libaaudio exports as a test API; the arm looks it up at run time.

## Where the stream went

| Reading | lobby EXCLUSIVE | lobby SHARED | probe 30 s (lobby) | probe 60 s (race) |
|---|---|---|---|---|
| AAudio service: exclusive MMAP endpoints opened | 0 (2 searches, 0 found) | 0 | 0 | 0 (9 searches, 0 found) |
| AAudio service: shared MMAP endpoints opened | 0 (1 search) | 0 | 0 | 0 (5 searches) |
| Holder of the stream | a track on `AudioOut_D` | the same | the same | the same |
| Track: flags, usage, content type, frames | 0x000, 0xe GAME, 4 SONIFICATION, 1,540 | the same | the same | the same |
| `AudioOut_D` standby | **no** | **no** | **no** | **no** |
| `AudioOut_15` standby | yes | yes | yes | yes |
| `AudioOut_D` CPU % of a core / slices per s | 55.9 / 18,173 | 55.9 / 17,899 | 51.0 / 17,658 | 51.6 / 17,825 |
| HAL `writer` CPU % / slices per s | 55.5 / 18,186 | 55.3 / 17,911 | 49.7 / 17,535 | 50.8 / 17,792 |
| App threads of the stream | `AudioTrack` (the legacy path's callback thread): 3-7 slices in all, 0 between reads | the same | the same | the same |

The track row has the same fields as P14's silentTrack row: active, flags 0x000, 1,540 frames, server position 0,
latency `new`. After each force-stop, both mixers were back in standby.

## Why: the policy has no MMAP output for the device in use (`route-policy.txt`)

1. AAudio asks the policy for an MMAP output: `getOutputForAttrInt() device {type:0x2}, ... flags 0x4001`
   (DIRECT | MMAP_NOIRQ). No output is returned, and `AAudioService: openStream(), could not open in EXCLUSIVE mode`
   follows. The shared MMAP endpoint is requested the same way and refused the same way.
2. AAudio then falls back to its legacy path, an AudioTrack with `flags 0x104` (FAST | RAW). The policy returns output 13
   (`AudioOut_D`), and AudioFlinger refuses the fast track: `createTrack_l(): mismatch between requested flags (00000104)
   and output flags (00000002)`. The stream becomes a normal mixed track, so the reported performance mode is NONE.
3. **`mmap_no_irq_out` supports one device, `HDMI-Out` (`AUDIO_DEVICE_OUT_AUX_DIGITAL|HDMI`). That device is not among
   the available output devices.** Fire OS exposes `Speaker` (id 2, `AUDIO_DEVICE_OUT_SPEAKER`) and a `Default Out`
   stub, and sends everything through `primary_out` (the MS12 primary stream, `AudioOut_D`). An app cannot choose an
   output device that the policy has not attached, so no request reaches the MMAP port.

`route-ports.txt` lists every output mix port with the devices it serves. Only `primary_out` serves `Speaker`. Every
DIRECT port (`mmap_no_irq_out`, the HDMI passthrough, tunnel and PCM-direct ports, and `avls_out`) serves `HDMI-Out`
or `AVLS-Out`, and neither device is attached. So on this Stick, as configured, every app PCM stream lands on
`primary_out`'s mixer thread, `AudioOut_D`.
