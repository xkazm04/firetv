# P14 step 1: M1 goal 1's 900 s soak of deathride/main (f861f535)

- APK `474400c0...` (`raw/soak.apk` in the manifest), built from f861f535 with
  `assembleDebug -PappId=dev.deathride.perf "-PappLabel=Death Ride Perf" -PracePort=8772`; gradle daemons stopped before
  the first wait.
- Command, P11 step 4's exactly: `python tools/perf-device.py <out> --install --profile --seconds 900` (default arm:
  `--warm-routes`, five-course cycle; two 30 Hz probe controllers, mines on, probe at AboveNormal).
- Graded with the unchanged `perf-p11.py` (`p11-readings.json`); transition watch with the unchanged `perf-p10.py`
  (`p10-readings.json`); GCs with `perf-p13f-gc.py` (`gc.json`).

## Settle

P13e's `settle.ps1` unchanged (60 consecutive 1 s samples under 60%, up to 900 s a wait). Waits 1-7 (08:03-09:48Z) did
not settle (`settle/soak-settle-try1..7.json`). **Wait 8 settled after 571 s** (`settle/settle-final.json`, last minute
18-52%). The probe began 10:00:29Z with the host at 21-25%; at its end (10:15:43Z) the host was at 80-92% (`host-cpu-*.json`).
**The soak counts as settled at its start**; the host loaded up again during it.

## I2 lines

| I2 line | Limit | Soak | Status |
|---|---|---|---|
| Worst active-window p95 (616 active windows) | <= 16.7 ms | 27.419 ms | **fail** (G1 21.60: fail) |
| Active max | <= 33 ms | 84.728 ms | **fail** |
| Active-window median | 16-18 ms | 16.659-16.713 ms | pass |
| PSS, 16 samples | < 192 MiB | 156.0-179.1 MiB | pass |
| Rejected inputs | 0 | 0 / 1 | **fail** |

Beside them: warm PSS change -3.24 MiB (pass, <= 8); input 30.0006 Hz per seat; host pump stalls 0; textures 39.97 /
art 18.75 MiB; six-live worst p95 27.419 ms; thermal status 0 at start and end (CPU 54.0 C, GPU 38.5 C); 900.216 s,
14 rounds, all 10 classes. The probe exits 1 on its zero-rejection assertion only: slot 1's input q=139 at second 4.94
was refused at a receive age of 270.3 ms (RTT 297.3 ms), the Wi-Fi delivery stall known since P0 (P12's still-run2 had
the same 256-268 ms signature). 0 profile saves (P13b moved them off the render thread).

## The tail (perf-p11.py attribution)

215 of 48,722 active frames ran over 33 ms (P11 soak: 197 of 48,884):

| Dominant category | cars | simulation | flushSwap | audio | hud | scenery |
|---|---:|---:|---:|---:|---:|---:|
| Frames over 33 ms | 121 | 69 | 11 | 8 | 5 | 1 |

- 214 of 215 had the render thread off-CPU for more than 8 ms; 17 overlapped a logged GC (P11: 197 of 197, 22).
- Over 20 ms: 2,002 frames, 1,509 off-CPU over 8 ms, 83 in a GC.
- Who held the CPU (device counters around the probe, % of one core, no trace in a soak): audio HAL `writer` 52.3,
  audioserver `AudioOut_D` 47.6, the render thread 53.4, link (DefaultDispatcher) 33.4, system_server NetworkStats 9.1,
  app SoundPool 4.6, audio worker 4.4. Wi-Fi sent 468 KB/s. The audio pair is at P11's and P12's level (P11 soak 53.7 /
  47.9), so the preemption attribution P11 and P12 traced (the pair takes 71-94% of the render thread's preempted
  time in frames over 33 ms) is the reading here too; this run carries no trace of its own.

## GC

89 GCs in the probe (6.0 a minute; P11 soak 285), allocated 2.49 MB/s (P11 8.22), 50 logged background GCs, large
objects freed 592.0 MB (0.66 MB/s), logged GC total time 102.6-265.7 ms, gaps 2.2-33.7 s (median 20.6). 17 of the 215
frames over 33 ms overlap a logged GC.

## Transition watch (perf-p10.py; not a grade)

Transition max 132.7 ms, 7 of 133 transition windows over 100 ms, all from two frames: 121.5 ms 3.0 s before round 1
(foundry) and 132.7 ms 3.4 s before round 3 (switchback). Both are lobby frames whose previous render worked 119.7 /
127.7 ms with 52.0 / 47.0 ms of CPU (simulation 50.6 / 21.6, telemetry 59.3 / 64.6 ms), so the thread was mostly off-CPU.
Neither sits on a logged GC (the nearest, 265.7 ms, ended about 3.5 s into round 1's race). Rounds 4-13 stayed at or under 86.5 ms. This
soak is not P13d's 360 s graded command; the App Master decides whether it reopens line 18 (ruling 1).
