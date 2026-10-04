"""Exhaustive affordable-independent PR ceilings from legal part transitions; no race/feel claim."""
import csv, json, statistics
from functools import lru_cache
from pathlib import Path
root=Path(__file__).resolve().parents[1];data=root/'core/src/main/resources/data'
def rows(name):return list(csv.DictReader((data/(name+'.csv')).open(encoding='utf-8')))
def rules(name):return {r['key']:float(r['value']) for r in rows(name)}
names=['speed','acceleration','grip','armor','mass','handling','slots','braking']
cars=[dict(rows('cars/'+c['id'])[0],**c) for c in rows('cars')];parts=rows('parts');mapping={r['parameter']:r for r in rows('stat-mapping')};weights=rows('pr-weights');limits=rules('car-rules')
locks={(r['id'],int(r['tier'])):int(r['afterRounds']) for r in rows('part-unlocks')}
def stats(car,tiers):
    return {name:max(int(limits['statMin']),min(int(limits['slotsMax'] if name=='slots' else limits['statMax']),int(car[name])+sum(t*int(p[name]) for t,p in zip(tiers,parts)))) for name in names}
def rating(s):
    return sum((float(mapping[w['parameter']]['base'])+float(mapping[w['parameter']]['perPoint'])*s[mapping[w['parameter']]['stat']]-float(w['origin']))/float(w['unitPerPoint'])*float(w['weight']) for w in weights)
@lru_cache(None)
def ceiling(id,cleared):
    car=next(c for c in cars if c['id']==id);start=(0,)*len(parts);seen={start};stack=[start];best=(rating(stats(car,start)),start)
    while stack:
        tiers=stack.pop();before=stats(car,tiers);pr=rating(before)
        if pr>best[0]:best=(pr,tiers)
        for i,p in enumerate(parts):
            if tiers[i]>=int(p['maxTier']) or locks.get((p['id'],tiers[i]+1),0)>cleared:continue
            changed=list(tiers);changed[i]+=1;changed=tuple(changed)
            if changed in seen:continue
            after=stats(car,changed)
            if not any(int(p[name])>0 and after[name]>before[name] for name in names):continue
            seen.add(changed);stack.append(changed)
    return dict(car=id,cleared=cleared,maximumPR=best[0],parts=best[1],reachableConfigurations=len(seen))
# Independent formula agrees with current physical stock rows before reporting any bound.
physical=list(csv.DictReader((root/'core/build/reports/ip-career/4/physical.csv').open()))
checked=0
for row in physical:
    if row['band']=='0':
        assert abs(rating(stats(cars[int(row['car'])],(0,)*len(parts)))-float(row['playerPR']))<1e-8
        checked+=1
ranks={r['id']:int(r['rank']) for r in rows('roster-tiers')};plans=rows('rival-garages');schedule=rows('career-curve');tiers=sorted(ranks,key=ranks.get)
results=[]
for round in [6,13,20,27,34]:
    point=schedule[round];act=int(point['act']);fieldTier=int(point['fieldTier']);fieldClear=max(round,fieldTier*7)
    player=max((ceiling(c['id'],round) for c in cars if ranks[c['tier']]<=act),key=lambda c:c['maximumPR'])
    cast=[p for p in plans if p['id']=='marrow'] if round==34 else [p for p in plans if p['id']!=('relay' if act==4 else 'marrow')]
    field=[dict(rival=p['id'],**ceiling(p[tiers[fieldTier]],fieldClear)) for p in cast]
    maximum=statistics.mean(c['maximumPR'] for c in field)
    results.append(dict(event=round+1,player=player,field=field,fieldMeanHardCeilingPR=maximum,fundedMaxPlayerToMaxField=player['maximumPR']/maximum))
report=dict(method='Exhaustive graph of legal useful-part purchases, unlimited replenished funds; shared clamped stats and PR mapping. Ignores fixed NPC target ceilings to give an upper bound, not an attainable earned-career claim. No physics simulation.',stockPhysicalRowsCrossChecked=checked,bosses=results)
target=root/'evidence/phase2/ip-calibration/boss-hard-ceilings.json';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps([dict(event=r['event'],player=r['player']['maximumPR'],field=r['fieldMeanHardCeilingPR'],ratio=r['fundedMaxPlayerToMaxField']) for r in results],indent=2))
