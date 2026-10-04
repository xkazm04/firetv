"""Timestamped independent network observations; never change input acceptance."""
import argparse,datetime,json,re,subprocess,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('output',type=Path);p.add_argument('--seconds',type=int,default=300);a=p.parse_args()
a.output.parent.mkdir(parents=True,exist_ok=True)
end=time.monotonic()+a.seconds
with a.output.open('w') as f:
 while time.monotonic()<end:
  start=time.monotonic();utc=datetime.datetime.now(datetime.timezone.utc).isoformat()
  r=subprocess.run(['ping','-n','1','-w','1000','10.0.0.139'],stdout=subprocess.PIPE,creationflags=subprocess.CREATE_NO_WINDOW)
  text=r.stdout.decode(errors='replace');m=re.search(r'time([=<])(\d+)ms',text)
  f.write(json.dumps({'utc':utc,'icmpMs':int(m[2]) if m else None,'lessThan':bool(m and m[1]=='<'),'hostCallMs':(time.monotonic()-start)*1000,'exit':r.returncode,'output':text})+'\n');f.flush()
  time.sleep(max(0,1-(time.monotonic()-start)))
