"""Independent ICMP and scheduler evidence; intentionally diagnostic, not qualification."""
import argparse,datetime,gzip,json,re,subprocess,time,zlib
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('output',type=Path);p.add_argument('--at',required=True);p.add_argument('--seconds',type=int,default=45);a=p.parse_args()
a.output.mkdir(parents=True,exist_ok=True)
target=datetime.datetime.fromisoformat(a.at).timestamp()
while time.time()<target:time.sleep(min(1,target-time.time()))
adb=['adb','-P','5041','-s','10.0.0.139:5555']
remote='/data/local/tmp/deathride-network.atrace'
start=time.time()
with (a.output/'atrace.log').open('wb') as log:
 trace=subprocess.Popen(adb+['shell','atrace','-z','-b','32768','-t',str(a.seconds),'-a','dev.deathride.perf','sched','freq','gfx','audio','dalvik','-o',remote],stdout=log,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW)
 samples=[]
 with (a.output/'icmp.jsonl').open('w') as out:
  while time.time()-start<a.seconds:
   at=datetime.datetime.now(datetime.timezone.utc).isoformat();before=time.perf_counter()
   result=subprocess.run(['ping','-n','1','-w','1000','10.0.0.139'],stdout=subprocess.PIPE,creationflags=subprocess.CREATE_NO_WINDOW)
   text=result.stdout.decode(errors='replace');match=re.search(r'time([=<])(\d+)ms',text)
   sample={'utc':at,'hostCallMs':(time.perf_counter()-before)*1000,'exit':result.returncode,'icmpMs':int(match[2]) if match else None,'lessThan':bool(match and match[1]=='<'),'output':text}
   samples.append(sample);out.write(json.dumps(sample)+'\n');out.flush();time.sleep(.1)
 trace.wait(timeout=180) # Compressing a system-wide scheduler buffer can take longer than capture.
raw=subprocess.check_output(adb+['exec-out','cat',remote],creationflags=subprocess.CREATE_NO_WINDOW,timeout=30)
marker=raw.find(b'TRACE:\n');body=raw[marker+7:] if marker>=0 else raw
try:decoded=zlib.decompress(body)
except zlib.error:decoded=body
(a.output/'trace.txt.gz').write_bytes(gzip.compress(decoded,mtime=0))
(a.output/'threads.txt').write_bytes(subprocess.check_output(adb+['shell','ps','-T','-A'],creationflags=subprocess.CREATE_NO_WINDOW))
events={'startUtc':datetime.datetime.fromtimestamp(start,datetime.timezone.utc).isoformat(),'endUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'samples':len(samples),'losses':sum(s['icmpMs'] is None for s in samples),'maxIcmpMs':max((s['icmpMs'] for s in samples if s['icmpMs'] is not None),default=None),'scope':'Independent host ICMP plus intrusive 32MiB scheduler trace. No claim of clean qualification.'}
(a.output/'events.json').write_text(json.dumps(events,indent=2));print(events)
