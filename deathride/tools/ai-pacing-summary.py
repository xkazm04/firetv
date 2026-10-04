"""Audit raw timing observations and publish review data; never infer completed races."""
import csv
import hashlib
import json
from pathlib import Path
import statistics

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'evidence/ai/z1';DATA=ROOT/'core/src/main/resources/data'
def read(path):return list(csv.DictReader(path.open(encoding='utf-8')))
def audit(path,course_count):
    rows=read(path)
    keys=[tuple(r[k] for k in ('course','car','skill','sample')) for r in rows]
    assert len(rows)==course_count*10*4*2 and len(set(keys))==len(keys)
    assert len({r['course'] for r in rows})==course_count
    assert all(r['finished']=='true' and float(r['flyingLapSeconds'])>0 for r in rows)
    for r in rows:
        assert abs(float(r['launchLapSeconds'])+3*float(r['flyingLapSeconds'])-float(r['seconds']))<1e-7
    return rows
before=audit(OUT/'laps-before.csv',25);after=audit(OUT/'laps-final.csv',29)
old=read(OUT/'before-data/campaign.csv');events=read(DATA/'campaign.csv')
timings=read(DATA/'course-pacing.csv');targets={r['event']:float(r['targetSeconds']) for r in read(DATA/'event-pacing.csv')}
table=[]
for i,(a,b) in enumerate(zip(old,events)):
    assert a['id']==b['id']
    ref=next(r for r in timings if r['course']==b['course'] and r['tier']==b['playerTier'])
    old_lap=statistics.mean(float(r['flyingLapSeconds']) for r in before if r['course']==a['course'] and r['tier']==a['playerTier'] and r['skill']=='Club')
    table.append(dict(event=b['id'],name=b['name'],phase=b['phase'],type=b['type'],oldCourse=a['course'],course=b['course'],
        oldLaps=int(a['laps']),laps=int(b['laps']),targetSeconds=targets[b['id']],referenceLapSeconds=float(ref['referenceLapSeconds']),
        estimatedSeconds=int(b['laps'])*float(ref['referenceLapSeconds']),oldEstimatedSeconds=int(a['laps'])*old_lap))
hashes={str(p.relative_to(ROOT)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest()
    for p in sorted((DATA).rglob('*.csv'))}
result=dict(scope='Solo stock drivers. Flying-lap estimates exclude launch, combat, traffic and menus. They are not human or full-field race times.',
    beforeRuns=len(before),afterRuns=len(after),beforeHorizonSeconds=240,afterSurveyHorizonSeconds=360,
    retainedPilotTimeouts=sum(r['finished']=='false' for r in read(OUT/'laps-after-pilot.csv')),
    ordinaryLapsBefore=sum(int(r['laps']) for r in old),ordinaryLapsAfter=sum(int(r['laps']) for r in events),events=table,
    courses=timings,redesigns=read(DATA/'course-redesigns.csv'),dataSha256=hashes,
    measurementSha256={name:hashlib.sha256((OUT/name).read_bytes()).hexdigest() for name in ('laps-before.csv','laps-after-pilot.csv','laps-after.csv','laps-final.csv')})
(OUT/'pacing.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print('Timing cross, complete observations, derived durations and provenance PASS')
