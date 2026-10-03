"""Exact raw phase distributions and conservative complete-active-window gates."""
import argparse, gzip, hashlib, json, math, statistics
from pathlib import Path

p=argparse.ArgumentParser();p.add_argument('source',type=Path);a=p.parse_args()
data=a.source.read_bytes()
if a.source.suffix=='.gz':data=gzip.decompress(data)
s=json.loads(data)
def q(values):
    v=sorted(values)
    if not v:return {'count':0}
    return {'count':len(v),'p50':v[math.ceil(len(v)*.5)-1],
        'p95':v[math.ceil(len(v)*.95)-1],'p99':v[math.ceil(len(v)*.99)-1],
        'max':v[-1],'mean':statistics.fmean(v)}
def windows(rows):
    if not rows:return {'count':0}
    return {'count':len(rows),'worstP95Ms':max(w['stats']['frameTimeMs']['last10s']['p95'] for w in rows),
        'maxMs':max(w['stats']['frameTimeMs']['last10s']['max'] for w in rows),
        'p50RangeMs':[min(w['stats']['frameTimeMs']['last10s']['p50'] for w in rows),max(w['stats']['frameTimeMs']['last10s']['p50'] for w in rows)],
        'stepWorstP95Ms':max(w['stats']['simStepMs']['last10s']['p95'] for w in rows)}
active=[w for w in s['windows'] if w['stats']['phase']=='race' and w['stats']['raceSeconds']>=10]
six=[w for w in active if w['stats']['combatSummary']['active']==6]
pss=[m['pssKb']/1024 for m in s['memory']]
warm=pss[1:]
growth=statistics.median(warm[-3:])-statistics.median(warm[:3]) if warm else None
final=s.get('finalStats',s['windows'][-1]['stats'])
result={'sourceSha256':hashlib.sha256(data).hexdigest(),'apkSha256':s.get('apkSha256'),
    'durationSeconds':s.get('actualDurationSeconds'),'functionalPass':s.get('functionalPass',False),
    'error':s.get('error'),'clients':s.get('clients'),'pumpStalls':s['pumpStalls'],'rejections':s['rejections'],
    'allWindows':windows(s['windows']),'activeWindows':windows(active),'sixLiveWindows':windows(six),
    'sinceStartFrameMs':final['frameTimeMs']['sinceStart'],
    'discardedSimulationMs':final['discardedSimulationMs'],
    'inputAgeWorstP95Ms':[max((w['stats']['slots'][i]['inputAgeMs']['last10s']['p95'] for w in active),default=0) for i in range(2)],
    'inputCounters':[{k:slot[k] for k in ('stale','dropped','outOfOrder')} for slot in final['slots']],
    'pssRangeMiB':[min(pss),max(pss)] if pss else [],'warmPssGrowthMiB':growth,
    'ownedTextureMiB':max(w['stats']['art']['ownedTextureBytes']/1048576 for w in s['windows']),
    'artMiB':max(w['stats']['art']['textureBytes']/1048576 for w in s['windows']),
    'audio':final.get('audio'),'classes':s.get('classUses'),'rounds':len(s['rounds']),
    'limits':'Overlapping window percentiles are not pooled. Native profiling intervals, if any, remain in raw evidence. Not optical latency or owner feel.'}
if s.get('ackObservations'):
    acks=[r for r in s['ackObservations'] if r[2] is not None]
    result['ackRttMs']=q([r[3]-r[2] for r in acks])
    calibrated=[r for r in acks if len(r)>6 and r[6] is not None]
    result['clockAdjustedAgeAtAckTimestampMs']=q([r[4]-r[2]-r[6] for r in calibrated])
    result['estimatedAckReturnMs']=q([r[3]-(r[4]-r[6]) for r in calibrated])
    result['ackTimingLimit']='Ack timestamp is after server JSON parsing, before mailbox offer. Offset is the one sent before that input. One-way estimates depend on calibration; no optical claim.'
result['hudTransport']=[{k:slot.get(k) for k in ('hudDelta','hudMessages','hudCharacters','hudFullSnapshots')} for slot in final['slots']]
result['lastLoadObservation']=s.get('lastLoadObservation')
result['finalStatsLimit']='finalStats follows a 500 ms acknowledgement drain with pumping stopped; stale consumption during that deliberate quiet interval is retained separately from lastLoadObservation.'
if s.get('profiles'):
    profiles=s['profiles'];cols=profiles[0]['frames']['columns'];rows=[];gaps=[];end=None
    for profile in profiles:
        f=profile['frames']
        if end is not None and f['first']!=end:gaps.append([end,f['first']])
        end=f['end'];rows.extend(f['rows'])
    live=[r for r in rows if r[cols.index('active')]==1]
    sixRows=[r for r in live if r[cols.index('liveCars')]==6]
    result['profile']={'rows':len(rows),'gaps':gaps,'active':{c:q([r[i] for r in live]) for i,c in enumerate(cols) if c not in ('startNs','active','liveCars')},
        'sixLive':{c:q([r[i] for r in sixRows]) for i,c in enumerate(cols) if c not in ('startNs','active','liveCars')},
        'runtimeFirst':profiles[0]['runtime'],'runtimeLast':profiles[-1]['runtime']}
    # An interval belongs to the previous render's work; preserve that pairing.
    idx={c:i for i,c in enumerate(cols)}
    gapsMs=[r[idx['intervalMs']]-prev[idx['workMs']] for prev,r in zip(rows,rows[1:]) if prev[idx['active']]==1 and r[idx['active']]==1]
    result['profile']['betweenRenderMs']=q(gapsMs)
    ins=[row for profile in profiles for row in profile['inputs']['rows']]
    icols=profiles[0]['inputs']['columns']
    result['profile']['inputs']={c:q([r[i] for r in ins]) for i,c in enumerate(icols) if c not in ('receiveNs','slot','q','reason')}
    result['profile']['rejectedInputRows']=[dict(zip(icols,r)) for r in ins if r[icols.index('reason')]!=0]
    if s.get('ackObservations'):
        result['profile']['ackRttMs']=q([r[3]-r[2] for r in s['ackObservations'] if r[2] is not None])
result['gates']={'duration':(s.get('actualDurationSeconds') or 0)>=900,
    'zeroRejected':bool(s.get('clients')) and all(c['rejected']==0 and c['accepted']==c['sent'] for c in s['clients']),
    'frameP95':bool(active) and result['activeWindows']['worstP95Ms']<=16.7,
    'frameMax':bool(active) and result['activeWindows']['maxMs']<33,
    'memory':bool(pss) and max(pss)<=192 and growth is not None and growth<=8,
    'textures':result['ownedTextureMiB']<=52 and result['artMiB']<=32}
out=a.source.parent/'summary.json';out.write_text(json.dumps(result,indent=2)+'\n')
archive=a.source.parent/'raw.json.gz'
if not archive.exists():archive.write_bytes(gzip.compress(data,mtime=0))
assert gzip.decompress(archive.read_bytes())==data
print(json.dumps({k:result[k] for k in ('durationSeconds','activeWindows','sixLiveWindows','clients','gates')},indent=2))
