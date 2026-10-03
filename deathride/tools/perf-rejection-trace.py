"""Correlate retained rejected-input rows with an actual scheduler capture."""
import argparse,collections,contextlib,gzip,io,json,re,runpy,sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('trace',type=Path);p.add_argument('raw',type=Path);a=p.parse_args()
saved=sys.argv;sys.argv=['perf-trace.py',str(a.trace)]
with contextlib.redirect_stdout(io.StringIO()):g=runpy.run_path(str(Path(__file__).with_name('perf-trace.py')))
sys.argv=saved
data=a.raw.read_bytes();data=gzip.decompress(data) if a.raw.suffix=='.gz' else data;raw=json.loads(data)
profiles=raw.get('profiles',[]);icols=profiles[0]['inputs']['columns'];fcols=profiles[0]['frames']['columns']
inputs=[dict(zip(icols,r)) for p in profiles for r in p['inputs']['rows']]
frames=[dict(zip(fcols,r)) for p in profiles for r in p['frames']['rows']]
text=gzip.decompress(a.trace.read_bytes()).decode(errors='replace')
pid=int(re.search(r'B\|(\d+)\|DR.requests',text).group(1));stack=collections.defaultdict(list);sections=[];first=None;last=None
for line in text.splitlines():
 m=g['line'].match(line)
 if not m:continue
 name,tid,tgid,core,t,event,body=m.groups();tid=int(tid);t=float(t);first=t if first is None else min(first,t);last=t
 if event!='tracing_mark_write':continue
 if body.startswith('B|'):stack[tid].append((body.split('|',2)[2],t))
 elif body.startswith('E') and stack[tid]:
  label,start=stack[tid].pop()
  if g['tgids'].get(tid)==str(pid) and ('GC' in label or 'Suspend' in label or 'Lock contention' in label):sections.append({'tid':tid,'name':label,'start':start,'end':t,'wallMs':(t-start)*1000})
rows=[]
for r in inputs:
 if r['reason']==0:continue
 end=r['receiveNs']/1e9;start=end-r['receiveGapMs']/1000
 if end<first or start>last:continue
 threads=[]
 for tid,slices in g['cpu'].items():
  if tid==0:continue # idle TID is shared by CPUs, not a single-thread timeline
  cpu=g['overlap'](slices,start,end)
  if cpu>0:threads.append({'tid':tid,'pid':g['tgids'].get(tid),'name':g['names'].get(tid),'cpuMs':cpu})
 threads.sort(key=lambda x:x['cpuMs'],reverse=True)
 f=[f for f in frames if start<=f['startNs']/1e9<=end]
 rows.append({'input':r,'gapStartSeconds':start,'gapEndSeconds':end,'fullGapCaptured':start>=first and end<=last,
  'renderEntries':len(f),'maxRenderIntervalMs':max((x['intervalMs'] for x in f),default=None),'cpuByThread':threads,
  'nonIdleCpuMs':sum(x['cpuMs'] for x in threads),'appCpuMs':sum(x['cpuMs'] for x in threads if x['pid']==str(pid)),
  'overlappingAppGcOrContention':[x for x in sections if x['end']>=start and x['start']<=end]})
result={'appPid':pid,'traceStart':first,'traceEnd':last,'capturedRejectedGaps':rows,
 'limit':'Overlapping GC duration is not a stop-the-world pause. Worker names alone do not identify the socket selector. No kernel packet-arrival timestamps are present; causality is not established by overlap.'}
a.trace.with_name('rejection-correlation.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'capturedRejectedGaps':len(rows),'samples':[{'slot':x['input']['slot'],'q':x['input']['q'],'fullGap':x['fullGapCaptured'],'renders':x['renderEntries'],'gapMs':x['input']['receiveGapMs']} for x in rows]},indent=2))
