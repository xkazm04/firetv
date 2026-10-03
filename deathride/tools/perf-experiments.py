"""Serial device experiments against an immutable APK; keep every failed result."""
import argparse, subprocess, time
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--after',type=Path,required=True)
p.add_argument('--apk',type=Path,required=True)
p.add_argument('--output',type=Path,required=True)
a=p.parse_args()
while not a.after.exists():time.sleep(2)
variants=[('vsync',['pacing=vsync']),
          ('vsync-display',['pacing=vsync','renderPriority=display']),
          ('vsync-display-720',['pacing=vsync','renderPriority=display','resolution=720']),
          ('continuous-display',['renderPriority=display'])]
for name, extras in variants:
    folder=a.output/name
    cmd=['python','tools/perf-device.py',str(folder),'--apk',str(a.apk),'--seconds','180','--profile','--install']
    for extra in extras:cmd+=['--extra',extra]
    result=subprocess.run(cmd)
    print(name,'runner exit',result.returncode,flush=True)
    if (folder/'raw.json').exists():subprocess.run(['python','tools/perf-summary.py',str(folder/'raw.json')])
