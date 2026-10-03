"""Hidden desktop allocation diagnostic. Never substitutes for Stick timing."""
import argparse,gzip,json,os,statistics,subprocess,time,urllib.request
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('output',type=Path);a=p.parse_args()
a.output.mkdir(parents=True,exist_ok=True)
profiles=[];cursor=0
with (a.output/'run.log').open('w',encoding='utf-8') as log:
    proc=subprocess.Popen(['java',f'-XX:StartFlightRecording=filename={a.output.resolve()}/allocation.jfr,settings=profile,dumponexit=true',
        '-cp','desktop/build/install/desktop/lib/*','dev.deathride.desktop.LauncherKt',
        '--hidden','--soak','--audit','--profile','--duration=90','--port=8773'],
        stdout=log,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW)
    while proc.poll() is None:
        time.sleep(5)
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:8773/profile?frames={cursor}',timeout=5) as r:s=json.load(r)
            cursor=s['frames']['end'];profiles.append(s)
        except OSError:pass
assert proc.returncode==0,proc.returncode
(a.output/'phases.json.gz').write_bytes(gzip.compress(json.dumps(profiles).encode(),mtime=0))
cols=profiles[0]['frames']['columns'];rows=[r for p in profiles for r in p['frames']['rows'] if r[cols.index('active')]==1][600:]
def q(values):
    values=sorted(values)
    return {'median':statistics.median(values),'p95':values[int(.95*(len(values)-1))],'mean':statistics.mean(values),'max':max(values)}
summary={'scope':'Desktop warm active samples after first 600 active frames; AI proxy, no phone, JFR and phase recorder enabled. Not Stick timing.',
    'frames':len(rows),'phases':{c:q([r[i] for r in rows]) for i,c in enumerate(cols) if c not in ('startNs','active','liveCars')}}
(a.output/'summary.json').write_text(json.dumps(summary,indent=2))
print(json.dumps({k:v for k,v in summary['phases'].items() if k.endswith('Bytes')},indent=2))
# --soak captures a result image outside the timing evidence folder.
capture=Path('../evidence/results.png')
if capture.exists():capture.replace(a.output/'results.png')
