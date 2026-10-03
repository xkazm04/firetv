"""Bounded intrusive scheduler ring, stopped at the first actual rejected ack."""
import argparse,datetime,gzip,json,os,subprocess,time,zlib
from pathlib import Path

p=argparse.ArgumentParser();p.add_argument('output',type=Path)
p.add_argument('--apk',type=Path,required=True);p.add_argument('--seconds',type=int,default=900)
a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
adb=['adb','-P','5041','-s','10.0.0.139:5555'];events=[]
def run(label,args,timeout=90):
    event={'label':label,'args':args,'startUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    r=subprocess.run(adb+args,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=timeout,creationflags=subprocess.CREATE_NO_WINDOW)
    (a.output/(label+'.txt')).write_bytes(r.stdout)
    event.update(endUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),returncode=r.returncode)
    events.append(event);(a.output/'events.json').write_text(json.dumps(events,indent=2));return r

proc=subprocess.Popen(['python','tools/perf-device.py',str(a.output/'probe'),'--apk',str(a.apk),'--seconds',str(a.seconds),'--profile'],
    env={**os.environ,'PROBE_REJECTION_LOG':'1'},creationflags=subprocess.CREATE_NO_WINDOW)
log=a.output/'probe/probe.log'
while proc.poll() is None and not log.exists():time.sleep(.2)
assert proc.poll() is None,'Probe failed before pairing'
run('start',['shell','atrace','--async_start','-b','16384','-a','dev.deathride.perf','sched','gfx','dalvik'])
trigger=None
while proc.poll() is None:
    for line in log.read_text(errors='replace').splitlines():
        if line.startswith('{"rejectionTrace"'):
            trigger=json.loads(line)['rejectionTrace'];break
    if trigger:break
    time.sleep(.05)
(a.output/'trigger.json').write_text(json.dumps({'trigger':trigger,'scope':'Intrusive bounded ring; first rejected acknowledgement triggers stop. No packet timestamp or cutoff is changed.'},indent=2))
remote='/data/local/tmp/deathride-perf-network.atrace'
run('stop',['shell','atrace','--async_stop','-z','-o',remote],timeout=180)
code=proc.wait();print('diagnostic probe',code,flush=True)
raw=subprocess.check_output(adb+['exec-out','cat',remote],creationflags=subprocess.CREATE_NO_WINDOW)
(a.output/'trace.atrace').write_bytes(raw);marker=raw.find(b'TRACE:\n');body=raw[marker+7:] if marker>=0 else raw
try:body=zlib.decompress(body)
except zlib.error:pass
(a.output/'trace.txt.gz').write_bytes(gzip.compress(body,mtime=0))
subprocess.run(['python','tools/perf-summary.py',str(a.output/'probe/raw.json')])
subprocess.run(['python','tools/perf-trace.py',str(a.output/'trace.txt.gz')])
