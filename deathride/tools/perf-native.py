"""Intrusive diagnostic captures, deliberately separate from clean qualification."""
import argparse, datetime, gzip, json, subprocess, time, zlib
from pathlib import Path

p=argparse.ArgumentParser();p.add_argument('output',type=Path)
p.add_argument('--device',default='10.0.0.139:5555');p.add_argument('--seconds',type=int,default=20)
a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
prefix=['adb','-P','5041','-s',a.device]
events=[]
def run(name,args,timeout=60):
    start=datetime.datetime.now(datetime.timezone.utc).isoformat()
    r=subprocess.run(prefix+args,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NO_WINDOW,timeout=timeout)
    (a.output/(name+'.txt')).write_bytes(r.stdout)
    events.append({'name':name,'args':args,'startUtc':start,'endUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'returncode':r.returncode})
    (a.output/'events.json').write_text(json.dumps(events,indent=2))
    return r
run('threads-before',['shell','ps','-T','-A'])
run('audio-before',['shell','dumpsys','media.audio_flinger'])
trace='/data/local/tmp/deathride-perf.atrace'
r=run('atrace',['shell','atrace','-z','-b','16384','-t',str(a.seconds),'-a','dev.deathride.perf','sched','freq','gfx','audio','dalvik','-o',trace])
if r.returncode==0:
    raw=subprocess.check_output(prefix+['exec-out','cat',trace],creationflags=subprocess.CREATE_NO_WINDOW)
    (a.output/'trace.atrace').write_bytes(raw)
    marker=raw.find(b'TRACE:\n')
    body=raw[marker+7:] if marker>=0 else raw
    try:decoded=zlib.decompress(body)
    except zlib.error:decoded=body
    (a.output/'trace.txt.gz').write_bytes(gzip.compress(decoded,mtime=0))
run('simpleperf',['shell','simpleperf','record','--app','dev.deathride.perf','--duration',str(a.seconds),'-g','-f','99','-o','/data/local/tmp/deathride-perf.data'])
run('simpleperf-report',['shell','simpleperf','report','-i','/data/local/tmp/deathride-perf.data','--sort','comm,pid,tid,dso,symbol'])
run('simpleperf-callgraph',['shell','simpleperf','report','-i','/data/local/tmp/deathride-perf.data','-g','--sort','comm,pid,tid,dso,symbol'])
run('audio-after',['shell','dumpsys','media.audio_flinger'])
print(json.dumps(events,indent=2))
