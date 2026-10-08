"""P17: each frame's actual present time on the Stick's display, from SurfaceFlinger's per-layer latency ring.

start: finds the perf app's SurfaceView layer (`dumpsys SurfaceFlinger --list`), then runs one shell loop on the device that
  dumps `dumpsys SurfaceFlinger --latency <layer>` every --period seconds into /data/local/tmp until stopped. Each dump is the
  refresh period (ns) and the layer's last 127 frames as `desiredPresent actualPresent frameReady` (CLOCK_MONOTONIC ns, the
  clock of the profile rows' startNs). desiredPresent is the buffer's queue time (eglSwapBuffers, auto timestamp),
  actualPresent the display's present fence, frameReady the GPU's acquire fence. At 59.94 Hz the ring holds 2.13 s, so a
  1.5 s period overlaps consecutive dumps; perf-p17.py counts any gap.
stop: removes the flag, waits for the loop to write its end line (the loop's own and its children's CPU ticks, so the
  source's cost on the device is read from the run itself), pulls the file into the run directory and deletes it.
Nothing on the app side; the dumps run as the shell user at nice 0 beside the probe. Never inside a graded I2 run."""
import argparse, json, subprocess, sys, time
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('cmd', choices=('start', 'stop'))
p.add_argument('output', type=Path, help='run directory (present-latency.txt and present-start.json land here)')
p.add_argument('--device', default='10.0.0.139:5555')
p.add_argument('--package', default='dev.deathride.perf')
p.add_argument('--period', type=float, default=1.5)
a = p.parse_args()
REMOTE = '/data/local/tmp/deathride-p17-latency.txt'
FLAG = '/data/local/tmp/deathride-p17-latency.on'
SCRIPT = '/data/local/tmp/deathride-p17-latency.sh'

def adb(*args):
    return subprocess.check_output(['adb', '-P', '5041', '-s', a.device, *args], creationflags=subprocess.CREATE_NO_WINDOW,
                                   timeout=60).decode(errors='replace')

a.output.mkdir(parents=True, exist_ok=True)
if a.cmd == 'start':
    layer = None
    for _ in range(60):
        names = [x.strip() for x in adb('shell', 'dumpsys SurfaceFlinger --list').splitlines()]
        found = [x for x in names if x.startswith(f'SurfaceView - {a.package}/') and not x.startswith('Background')]
        if found:
            layer = found[-1]
            break
        time.sleep(1)
    if layer is None:
        sys.exit('no SurfaceView layer for ' + a.package)
    # The loop's first line is its own pid; each dump is headed by the uptime it began at; the end line holds
    # /proc/self/stat's utime stime cutime cstime (10 ms ticks) of the loop shell, whose children are the dumpsys runs.
    body = (f'echo "pid $$ layer {layer}"; '
            f'while [ -e {FLAG} ]; do echo "== $(cat /proc/uptime)"; dumpsys SurfaceFlinger --latency "{layer}"; sleep {a.period}; done; '
            'echo "end $(cat /proc/uptime) $(cut -d" " -f14-17 /proc/$$/stat)"')
    adb('shell', f"cat > {SCRIPT} <<'EOF'\n{body}\nEOF")
    adb('shell', f'touch {FLAG}; rm -f {REMOTE}; nohup sh {SCRIPT} > {REMOTE} 2>&1 &')
    sf = adb('shell', 'cut -d" " -f14,15 /proc/$(pidof surfaceflinger)/stat; cat /proc/uptime').split()
    (a.output / 'present-start.json').write_text(json.dumps({'layer': layer, 'periodSeconds': a.period,
        'surfaceflingerTicksAtStart': [int(sf[0]), int(sf[1])], 'uptimeAtStart': float(sf[2])}, indent=2))
    print(json.dumps({'layer': layer}))
else:
    adb('shell', f'rm -f {FLAG}')
    for _ in range(30):
        if 'end ' in adb('shell', f'tail -1 {REMOTE}'):
            break
        time.sleep(1)
    sf = adb('shell', 'cut -d" " -f14,15 /proc/$(pidof surfaceflinger)/stat; cat /proc/uptime').split()
    data = subprocess.check_output(['adb', '-P', '5041', '-s', a.device, 'exec-out', 'cat', REMOTE],
                                   creationflags=subprocess.CREATE_NO_WINDOW, timeout=120)
    (a.output / 'present-latency.txt').write_bytes(data)
    adb('shell', f'rm -f {REMOTE} {SCRIPT}')
    start = json.loads((a.output / 'present-start.json').read_text())
    start.update({'surfaceflingerTicksAtEnd': [int(sf[0]), int(sf[1])], 'uptimeAtEnd': float(sf[2]), 'bytes': len(data)})
    (a.output / 'present-start.json').write_text(json.dumps(start, indent=2))
    print(json.dumps({'bytes': len(data)}))
