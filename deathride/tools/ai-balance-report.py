"""Archive raw studies and publish machine-readable before/after facts, including failed gates."""
from pathlib import Path
from collections import Counter,defaultdict
from statistics import median,mean
import argparse,csv,gzip,hashlib,io,json,subprocess
from ai_balance_metrics import physical_summary,pressure_summary,duel_summary,skill_summary,instrument_cases,distribution,flag
from owner_campaign_metrics import summarize as careers_summary,instrument_cases as owner_cases
from campaign_v2_metrics import roster_review,homogeneous_review,difficulty_cross

p=argparse.ArgumentParser();p.add_argument('--before',default='ai-z3-before');p.add_argument('--after',default='ai-z3-after')
p.add_argument('--roster',default='ai-z3-roster');p.add_argument('--rotation',default='ai-z3-rotation');p.add_argument('--skill',default='ai-z3-skill')
p.add_argument('--difficulty',default='ai-z3-difficulty');p.add_argument('--roster-samples',type=int,default=334)
p.add_argument('--rotation-samples',type=int,default=200);p.add_argument('--skill-samples',type=int,default=334);p.add_argument('--difficulty-samples',type=int,default=32)
a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/'evidence/ai/z3';data=root/'core/src/main/resources/data';archives=[]
def read(path):
    raw=path.read_bytes();raw=gzip.decompress(raw) if path.suffix=='.gz' else raw
    return list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
def pack(source,relative):
    raw=source.read_bytes();target=out/'raw'/relative;target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(gzip.compress(raw,mtime=0));assert gzip.decompress(target.read_bytes())==raw
    archives.append(dict(file=str(target.relative_to(out)).replace('\\','/'),sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw)))
def load_study(path,label):
    rows=read(path);pack(path,f'{label}/{path.name}.gz');return rows
events=read(data/'campaign.csv');cars=read(data/'cars.csv');tiers={r['id']:int(r['rank']) for r in read(data/'roster-tiers.csv')}
curve=read(data/'career-curve.csv') if (data/'career-curve.csv').exists() else read(data/'career-v2-curve.csv')
result=dict(scope='Fresh paired before and after physical libraries; 2,000 conditional careers per buyer/version, not 2,000 independent physical campaigns. No human playability claim.',
    promotion='Boss promotion still requires a surviving first-place win. Finale still requires last car running.',
    beforeTag=a.before,afterTag=a.after,sourceCommit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),
    baselineAudit=json.loads((out/'baseline-audit.json').read_text()),versions={},archives=archives)
for version,tag in [('before',a.before),('after',a.after)]:
    source=root/f'build/reports/campaign/q3/{tag}'
    physical=load_study(source/'physical.csv',version)+load_study(source/'boss-extra.csv',version)
    version_events=read(root/'build/campaign-v2-runtime/ai-z1-before/5/data/campaign.csv') if version=='before' else events
    study=dict(physical=physical_summary(physical,version_events,cars,tiers),cohorts={})
    cells=defaultdict(list)
    for r in physical:cells[int(r['round']),int(r['skill']),int(r['car']),int(r['band'])].append(r)
    expected={(i,s,c,b) for i,e in enumerate(version_events) if e['type']!='ELIMINATION' for s in range(3)
              for c,car in enumerate(cars) if tiers[car['tier']]<=int(e['playerTier']) for b in (0,4,17)}
    study['physicalCross']=dict(complete=set(cells)==expected and all(len(v)==(20 if flag(version_events[k[0]]['boss']) else 4) for k,v in cells.items()),
        diverse=bool(cells) and all(len({r['seed'] for r in v})==len(v) and len({r['hash'] for r in v})/len(v)>=.99 for v in cells.values()))
    for buyer in ('race','pr'):
        careers=load_study(source/f'careers-{buyer}.csv',version);timeline=load_study(source/f'timeline-{buyer}.csv',version)
        cohort=careers_summary(careers,timeline,curve);assert len(careers)==2000
        first={}
        for row in timeline:first.setdefault((row['seed'],row['event']),row)
        cohort['firstEntryDurations']=[dict(event=i,**distribution(r['seconds'] for (_,event),r in first.items() if int(event)==i)) for i in range(1,36)]
        cohort['hoursBasis']='Simulated driving time only; menus/story/pit time not measured. Historical planning allowed another 30–60 minutes.'
        study['cohorts'][buyer]=cohort
    duel=load_study(source/'duels.csv',version);study['duel']=duel_summary(duel,512)
    if version=='after':
        pressure=load_study(source/'physical-ai.csv',version)+load_study(source/'boss-extra-ai.csv',version)
        assert len(pressure)==len(physical);study['pressure']=pressure_summary(pressure)
        study['pressure']['events']=[dict(event=i+1,**pressure_summary([r for r in pressure if int(r['round'])==i])) for i in range(34)]
        for path in sorted(source.glob('*-trace-*.csv')):pack(path,f'{version}/{path.name}.gz')
    for filename in ('reference-garages.csv','boss-extra-garages.csv'):pack(source/filename,f'{version}/{filename}.gz')
    replay=source/'final-core-replay.txt';study['replay']=replay.read_text() if replay.exists() else 'NOT VERIFIED'
    result['versions'][version]=study
weights={r['id']:float(r['mixedWeight']) for r in read(data/'roster-courses.csv')}
peers={tier:[r['id'] for r in cars if tiers[r['tier']]==tier] for tier in range(5)}
roster=load_study(root/f'build/reports/ai/z3/{a.roster}/roster.csv','roster')
result['roster']=roster_review(roster,weights,a.roster_samples,peers=peers)
result['roster']['oneShots']=sum(int(r['oneShots']) for r in roster)
result['roster']['unresolvedRows']=[r for r in roster if int(r['unresolved'])]
rotation=load_study(root/f'build/reports/ai/z3/{a.rotation}/rotation.csv','rotation')
result['rotation']=homogeneous_review(rotation,result['roster'],a.rotation_samples)
skill=load_study(root/f'build/reports/ai/z3/{a.skill}/skill.csv','skill');result['skill']=skill_summary(skill,a.skill_samples)
difficulty=load_study(root/f'build/reports/ai/z3/{a.difficulty}/difficulty.csv','difficulty')
result['difficulty']=dict(n=len(difficulty),completeCross=difficulty_cross(difficulty,a.difficulty_samples,{(tier+1)*7:peers[tier+1] for tier in range(4)}),
    unresolvedRows=[r for r in difficulty if int(r['unresolved'])],cells=[])
power_groups=defaultdict(set)
for r in difficulty:power_groups[r['event'],r['lead'],r['car'],r['rotation'],r['sample']].add((r['playerPR'],r['fieldPR']))
result['difficulty']['powerIndependentOfDifficulty']=bool(power_groups) and all(len(v)==1 for v in power_groups.values())
for event in (7,14,21,28):
    for lead in range(3):
        for opposition in range(3):
            rows=[r for r in difficulty if int(r['event'])==event and int(r['lead'])==lead and int(r['difficulty'])==opposition]
            result['difficulty']['cells'].append(dict(event=event,lead=lead,opposition=opposition,n=len(rows),wins=sum(flag(r['first']) for r in rows),
                early=sum(flag(r['early']) for r in rows),seconds=distribution(r['seconds'] for r in rows)))
result['instrumentCases']=instrument_cases()+owner_cases()
result['pacing']=json.loads((root/'evidence/ai/z1/pacing.json').read_text())
result['limitations']=[
    'Lead skill is a decision proxy, not a human test. Campaign reference opposition is Club; game difficulty is separately crossed.',
    'The careers resample a finite physical library and censor at 70 attempts. No population completion guarantee is implied.',
    'Successful-finisher time distributions are accompanied by timeout/wreck counts. A fast or weak build can miss the solo-reference time envelope.',
    'Duel tuning saw seed blocks 0–127; final blocks 128–511 are the held-out cohort. Pilot repeats are never added to final sample counts.',
    'Leader damage attribution is measured at impact time; travelling shots may land after their decision lease ends.',
    'Skill swaps are on one declared technical track; a faster straight-line chassis is still expected to have other course strengths.',
    'The strict both-directions finishing-order reversal is an additional diagnostic, separate from the declared agile/lower-tier Champion skill margin.',
    'Device frame times and human pacing remain for Z4.'
]
(out/'report.json').write_text(json.dumps(result,indent=2)+'\n')
print('Wrote',out/'report.json')
