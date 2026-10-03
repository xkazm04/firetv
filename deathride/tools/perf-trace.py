"""Attribute traced phase wall time to scheduled CPU, runnable wait and sleep."""
import bisect, collections, gzip, json, math, re, sys
from pathlib import Path

p=Path(sys.argv[1]);text=gzip.decompress(p.read_bytes()).decode(errors='replace')
line=re.compile(r'^\s*(.*)-(\d+)\s+\(\s*(\d+|[-]+)\)\s+\[(\d+)\].*?\s(\d+\.\d+):\s+(\w+):\s+(.*)$')
switch=re.compile(r'prev_comm=(.*?) prev_pid=(\d+) prev_prio=\d+ prev_state=(.*?) ==> next_comm=(.*?) next_pid=(\d+)')
stack=collections.defaultdict(list);spans=collections.defaultdict(list)
running={};off={};wakeup={};cpu=collections.defaultdict(list);sleep=collections.defaultdict(list);runnable=collections.defaultdict(list)
names={};tgids={}
for raw in text.splitlines():
    m=line.match(raw)
    if not m:continue
    name,tid,tgid,core,t,event,body=m.groups();tid=int(tid);t=float(t)
    names[tid]=name;tgids[tid]=tgid
    if event=='sched_switch':
        sm=switch.match(body)
        if not sm:continue
        pn,prev,state,nn,nxt=sm.groups();prev=int(prev);nxt=int(nxt)
        names[prev]=pn;names[nxt]=nn
        if prev in running:cpu[prev].append((running.pop(prev),t))
        off[prev]=(t,state);wakeup.pop(prev,None)
        running[nxt]=t
        if nxt in off:
            start,state=off.pop(nxt)
            awake=start if state.startswith('R') else wakeup.pop(nxt,t)
            if awake>start:sleep[nxt].append((start,awake))
            if t>awake:runnable[nxt].append((awake,t))
    elif event=='sched_wakeup':
        wm=re.search(r' pid=(\d+) ',body)
        if wm:wakeup.setdefault(int(wm[1]),t)
    elif event=='tracing_mark_write':
        if body.startswith('B|'):
            label=body.split('|',2)[2];stack[tid].append((label,t))
        elif body.startswith('E') and stack[tid]:
            label,start=stack[tid].pop()
            if label.startswith('DR.') or label in ('eglSwapBuffers','dequeueBuffer','queueBuffer') or 'Lock contention' in label:
                spans[(tid,label)].append((start,t))

def quant(values):
    v=sorted(values)
    if not v:return {'count':0}
    return {'count':len(v),'p50':v[math.ceil(len(v)*.5)-1], 'p95':v[math.ceil(len(v)*.95)-1],'max':v[-1],'total':sum(v)}
def overlap(intervals,start,end):
    # slices are chronological for a given thread.
    i=max(0,bisect.bisect_left(intervals,(start,))-1);total=0.0
    while i<len(intervals) and intervals[i][0]<end:
        a,b=intervals[i];total+=max(0,min(b,end)-max(a,start));i+=1
    return total*1000
phases={};longAudio=[]
for (tid,label),ranges in spans.items():
    if not label.startswith('DR.') and label not in ('eglSwapBuffers','dequeueBuffer','queueBuffer'):continue
    if not names.get(tid,'').startswith('GLThread'):continue
    rows=[]
    for a,b in ranges:
        row={'startSeconds':a,'wallMs':(b-a)*1000,'cpuMs':overlap(cpu[tid],a,b),
             'sleepMs':overlap(sleep[tid],a,b),'runnableMs':overlap(runnable[tid],a,b)}
        rows.append(row)
        if label=='DR.audio' and row['wallMs']>20:longAudio.append(row)
    phases[label]={k:quant([r[k] for r in rows]) for k in ('wallMs','cpuMs','sleepMs','runnableMs')}
threads=sorted([{'tid':tid,'name':names.get(tid),'tgid':tgids.get(tid),
    'cpuMs':sum(b-a for a,b in slices)*1000} for tid,slices in cpu.items() if tid!=0],key=lambda x:x['cpuMs'],reverse=True)
result={'source':str(p),'phaseTimesMs':phases,'longAudio':longAudio,'threads':threads,
        'limits':'20-second diagnostic trace; phase spans include tracing overhead. CPU slices are scheduler observations; nested phases are not summed.'}
p.with_name('trace-summary.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'phases':{k:{m:round(v[m]['p95'],3) for m in ('wallMs','cpuMs','sleepMs','runnableMs')} for k,v in phases.items()},'longAudio':longAudio[:10],'threads':threads[:12]},indent=2))
