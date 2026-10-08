# P14 step 2: the route of each arm on the Stick (before any graded run)

APK `6c1f959e...` (`raw/arms.apk`, built from 3f388822). For each arm the perf package was force-stopped, launched with
`--es audioArm <arm>` (full without it), left in the lobby for 25 s (no probe, no race), then
`dumpsys media.audio_flinger` and `dumpsys media.audio_policy` were taken, and audioserver's per-thread schedstat was read
twice about 10 s apart (`scripts/route.sh`; raw dumps in `route/` outside git, bound by the manifest). The lobby plays no
game sound, so in `full` and `muted` nothing is open.

## Output threads (audio_flinger)

The Stick has two mixer threads, and only one is ever used:

| Thread | Flags | HAL frame count | Normal frame count | Device |
|---|---|---:|---:|---|
| `AudioOut_D` (tid 683) | `AUDIO_OUTPUT_FLAG_PRIMARY` | 768 (16 ms at 48 kHz) | 768 | 0x2 |
| `AudioOut_15` (tid 689) | `AUDIO_OUTPUT_FLAG_PRIMARY` | 480 | 960 | none; 0 frames ever written |

| Arm | The app's track | Track flags | Track frame count (server) | Latency column | `AudioOut_D` standby | `AudioOut_D` CPU / slices, lobby (approx.) |
|---|---|---|---:|---|---|---|
| `muted` | none | - | - | - | **yes** (0 of 4 tracks active) | 0% / 0 |
| `silentTrack` | on `AudioOut_D`, active, usage 0xe (GAME), content type 4 (SONIFICATION), 48 kHz stereo 16-bit | 0x000 | 1,540 (32 ms) | `new` | **no** (1 of 5 active) | ~67% / ~22,400 per s |
| `silentDeep` | on `AudioOut_D`, active, same attributes | 0x000 | 4,800 (100 ms) | `new` | **no** (1 of 5 active) | ~66% / ~21,600 per s |
| `full` (lobby) | none (no lobby sound) | - | - | - | yes (0 of 4) | 0% / 0 |

The CPU column divides two schedstat reads by a nominal 10 s; the real gap was a little longer (adb round trips), so the
percentages are slightly high. They are a route check, not a reading; the graded readings are the A/B's.

**Fire OS puts both silent arms on the same thread.** `PERFORMANCE_MODE_POWER_SAVING` with a 100 ms buffer got a
larger client buffer (4,800 frames instead of 1,540) and nothing else: the same `AudioOut_D` mixer, the same track flags
(no `AUDIO_OUTPUT_FLAG_DEEP_BUFFER`), and the mixer leaves standby as for the default arm. silentDeep is run in the A/B
anyway, as the brief requires.

## Why: the policy has no deep-buffer output (audio_policy, HW modules)

The primary module declares these output mix ports, and no other:

| Mix port | Flags |
|---|---|
| `primary_out` | `PRIMARY` |
| `hdmi_pcm_passthrough_direct`, `hdmi_passthrough_direct`, `avls_out` | `DIRECT` |
| `hdmi_passthrough_tunnel`, `avls_out_tunnel` | `DIRECT | HW_AV_SYNC` |
| `mmap_no_irq_out` | `DIRECT | MMAP_NOIRQ` |
| `bt_sco_out` | `PRIMARY` |

`primary_out` is PCM 16-bit, 48 kHz stereo only, on HDMI, speaker and AVLS. There is no `deep_buffer` (or
`compress_offload`) mix port, so a performance mode cannot route an app's PCM away from `primary_out`'s mixer. Two other
ports take PCM, and neither was tried here:
- `mmap_no_irq_out` (PCM 16-bit, 48 kHz, stereo or multichannel, HDMI): reached by an AAudio stream in MMAP mode, which
  bypasses the AudioFlinger mixer thread. It needs an NDK AAudio stream (or Oboe), not an AudioTrack.
- `hdmi_pcm_passthrough_direct` (PCM 16-bit or float, dynamic rates and channels): a DIRECT output that the policy
  normally opens only for a format or channel layout the mixer cannot take (HDMI multichannel PCM), not for a stereo
  game stream.
The other DIRECT ports are passthrough or tunnel outputs for encoded streams and A/V sync.
