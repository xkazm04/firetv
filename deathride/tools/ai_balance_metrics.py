"""Small, falsifiable AI/pacing calculations; no renderer or simulation dependencies."""
from collections import Counter,defaultdict
from statistics import mean,median
from pathlib import Path
import json

MAX_RESOLVED_SHARE=json.loads((Path(__file__).resolve().parent/'campaign-analysis-rules.json').read_text())['maximumResolvedWinnerShare']

SKILLS=('Rookie','Club','Pro')
def flag(value):return value is True or str(value).lower() in ('true','1')
def distribution(values):
    values=sorted(map(float,values))
    return dict(n=len(values),median=median(values) if values else None,
                p10=values[int((len(values)-1)*.1)] if values else None,
                p90=values[int((len(values)-1)*.9)] if values else None,
                maximum=max(values) if values else None)

def physical_summary(rows,events,cars,tier_ranks):
    def summary(group):
        finished=[r for r in group if flag(r['finished']) and float(r['hp'])>0]
        early=sum(flag(r['early']) for r in group)
        return dict(n=len(group),wins=sum(int(r['position'])==1 for r in finished),finished=len(finished),
            timeouts=sum(not flag(r['finished']) and float(r['hp'])>0 for r in group),early=early,
            earlyRate=early/len(group) if group else None,earlyPass=bool(group) and early/len(group)<.05,
            finishSeconds=distribution(r['seconds'] for r in finished),allExitSeconds=distribution(r['seconds'] for r in group))
    result=summary(rows);result['skills']=[dict(skill=name,**summary([r for r in rows if int(r['skill'])==i])) for i,name in enumerate(SKILLS)]
    result['events']=[]
    for index,event in enumerate(events):
        if event['type']=='ELIMINATION':continue
        group=[r for r in rows if int(r['round'])==index]
        reference=[r for r in group if int(r['skill'])==1 and tier_ranks[cars[int(r['car'])]['tier']]==int(event['playerTier'])]
        bands={band:summary([r for r in reference if r['band']==band]) for band in sorted({r['band'] for r in reference},key=int)}
        envelope=[120,180] if index%7==0 else [240,360] if flag(event['boss']) else None
        result['events'].append(dict(event=event['id'],number=index+1,course=event['course'],laps=int(event['laps']),
            envelope=envelope,reference='Club lead; both current-tier peers; split by installed upgrade band',bands=bands,
            skills=[dict(skill=name,**summary([r for r in group if int(r['skill'])==i])) for i,name in enumerate(SKILLS)],**summary(group)))
    return result

def pressure_summary(rows):
    leader=sum(float(r['leaderDamage']) for r in rows);role=sum(float(r['hunterRoleDamage']) for r in rows);intent=sum(float(r['huntIntentDamage']) for r in rows)
    maximum=max((int(r['maxAttackers']) for r in rows),default=None)
    return dict(n=len(rows),leaderDamage=leader,hunterRoleDamage=role,huntIntentDamage=intent,
        hunterRoleShare=role/leader if leader else None,huntIntentShare=intent/leader if leader else None,
        maxAttackers=maximum,attackCapPass=bool(rows) and maximum<=2,
        attributionPass=bool(rows) and 0<=intent<=role+1e-8 and 0<=role<=leader+1e-8,
        leaderChanges=distribution(int(r['leaderChanges']) for r in rows),
        huntDecisions=sum(int(r['huntDecisions']) for r in rows),
        racesWithHunts=sum(int(r['huntDecisions'])>0 for r in rows),
        scope='Impact-time leader ranks; cumulative until lead exit. Changes include close rank swaps, not separately classified overtakes.')

def duel_summary(rows,samples):
    cells=defaultdict(list)
    for r in rows:cells[int(r['skill']),int(r['rotation'])].append(r)
    complete=set(cells)=={(s,g) for s in range(3) for g in range(2)} and all(len(v)==samples for v in cells.values())
    paired=complete and len({frozenset(r['seed'] for r in v) for v in cells.values()})==1
    diverse=complete and all(len({r['seed'] for r in v})==samples and len({r['hash'] for r in v})/samples>=.99 for v in cells.values())
    def group(rs):
        wins=sum(flag(r['win']) for r in rs);draws=sum(flag(r['draw']) for r in rs);early=sum(flag(r['early']) for r in rs)
        losses=len(rs)-wins-draws;resolved=len(rs)-draws;dominant=max(wins,losses)/resolved if resolved else None
        return dict(n=len(rs),wins=wins,losses=len(rs)-wins-draws,draws=draws,winRate=wins/len(rs) if rs else None,
            early=early,earlyPass=bool(rs) and early/len(rs)<.05,seconds=distribution(r['seconds'] for r in rs),
            oneShots=sum(int(r['oneShots']) for r in rs),oneShotPass=bool(rs) and all(int(r['oneShots'])==0 for r in rs),
            resolvedDominantShare=dominant,dominancePass=dominant is not None and dominant<=MAX_RESOLVED_SHARE)
    return dict(completeCross=complete,pairedSeeds=paired,seedDiversity=diverse,**group(rows),
        skills=[dict(skill=name,**group([r for r in rows if int(r['skill'])==i])) for i,name in enumerate(SKILLS)],
        holdout=group([r for r in rows if int(r['sample'])>=128]),
        scope='Final 512-seed runs include 128 seed blocks observed during tuning; the remaining 384 are reported separately.')

def skill_summary(rows,samples):
    cases=sorted({r['case'] for r in rows});expected={f'within-{i}' for i in range(5)}|{f'cross-{i}' for i in range(4)}
    groups=defaultdict(list)
    for r in rows:groups[r['case'],int(r['swap']),int(r['rotation'])].append(r)
    complete=set(groups)=={(c,s,g) for c in expected for s in range(2) for g in range(6)} and all(len(v)==samples for v in groups.values())
    diverse=complete and all(len({r['seed'] for r in v})==samples and len({r['hash'] for r in v})/samples>=.99 for v in groups.values())
    paired=complete and all(len({frozenset(r['seed'] for r in groups[c,s,g]) for s in range(2) for g in range(6)})==1 for c in expected)
    actual_slots=complete
    for r in rows:
        entries=r['cars'].split(';');actual_slots=actual_slots and len(entries)==6
        for slot,entry in enumerate(entries):
            name,skill,seconds,position=entry.split(':');low=(slot+int(r['rotation']))%6<3
            actual_slots=actual_slots and name==(r['lower'] if low else r['upper']) and skill==('Champion' if low==(int(r['swap'])==0) else 'Rookie')
    results=[]
    for case in cases:
        group=[r for r in rows if r['case']==case];lower=group[0]['lower'];upper=group[0]['upper'];swaps=[]
        for swap in range(2):
            subset=[r for r in group if int(r['swap'])==swap];times={lower:[],upper:[]}
            for row in subset:
                for entry in row['cars'].split(';'):
                    name,skill,seconds,position=entry.split(':')
                    if float(seconds)>=0:times[name].append(float(seconds))
            lower_time=mean(times[lower]) if times[lower] else None;upper_time=mean(times[upper]) if times[upper] else None
            margin=(upper_time-lower_time)*(1 if swap==0 else -1) if lower_time is not None and upper_time is not None else None
            swaps.append(dict(swap=swap,n=len(subset),champion=lower if swap==0 else upper,
                meanFinishSeconds={lower:lower_time,upper:upper_time},championMarginSeconds=margin,
                marginPass=margin is not None and margin>=1,wins=dict(Counter(r['winner'] for r in subset)),
                unresolved=sum(int(r['unresolved']) for r in subset)))
        effect=sum(s['championMarginSeconds'] for s in swaps) if all(s['championMarginSeconds'] is not None for s in swaps) else None
        results.append(dict(case=case,lower=lower,upper=upper,lowerPR=float(group[0]['lowerPR']),upperPR=float(group[0]['upperPR']),swaps=swaps,
            forwardSkillPass=swaps[0]['marginPass'] and swaps[0]['unresolved']==0,swapEffectSeconds=effect,
            swapEffectPass=effect is not None and effect>=1,passBoth=all(s['marginPass'] and s['unresolved']==0 for s in swaps)))
    return dict(n=len(rows),completeCross=complete,actualClassSlotCross=actual_slots,pairedSeeds=paired,seedDiversity=diverse,cases=results,
        allResolved=bool(rows) and all(int(r['unresolved'])==0 for r in rows),
        scope='Stock physics on the declared technical course; within-tier agile/fast and adjacent-tier agile-lower/fast-upper pairs; skills swapped and all six slots crossed.')

def instrument_cases():
    row=dict(leaderDamage='10',hunterRoleDamage='6',huntIntentDamage='3',maxAttackers='2',leaderChanges='4',huntDecisions='7')
    cases=[]
    for name,rows,gate,want in [('valid claim control',[row],'attackCapPass',True),('third concurrent claimant',[dict(row,maxAttackers='3')],'attackCapPass',False),
                              ('empty observer',[],'attackCapPass',False),('invented hunt damage',[dict(row,huntIntentDamage='11')],'attributionPass',False)]:
        actual=pressure_summary(rows)[gate];assert actual==want;cases.append(dict(case=name,gate=gate,actual=actual,expected=want))
    duel=[dict(skill=str(s),rotation=str(g),sample=str(n),seed=str(n),hash=f'{s}-{g}-{n}',win='true',draw='false',early='false',seconds='120',oneShots='0') for s in range(3) for g in range(2) for n in range(20)]
    for name,rows,gate,want in [('valid duel cross',duel,'seedDiversity',True),('constant hashes',[dict(r,hash='same') for r in duel],'seedDiversity',False),
                              ('missing rotation',duel[:-1],'completeCross',False),('unpaired seeds',[dict(r,seed='999') if i==0 else r for i,r in enumerate(duel)],'pairedSeeds',False),
                              ('five percent early',[dict(r,early=str(i%20==0).lower()) for i,r in enumerate(duel)],'earlyPass',False)]:
        actual=duel_summary(rows,20)[gate];assert actual==want;cases.append(dict(case=name,gate=gate,actual=actual,expected=want))
    for name,rows,gate,want in [('all wins',duel,'dominancePass',False),('balanced resolved',[dict(r,win=str(i%2==0).lower()) for i,r in enumerate(duel)],'dominancePass',True),
                              ('all draws',[dict(r,win='false',draw='true') for r in duel],'dominancePass',False),('one shot kill',[dict(r,oneShots='1') for r in duel],'oneShotPass',False)]:
        actual=duel_summary(rows,20)[gate];assert actual==want;cases.append(dict(case=name,gate=gate,actual=actual,expected=want))
    return cases
