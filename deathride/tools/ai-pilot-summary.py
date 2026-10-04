from pathlib import Path
from collections import Counter
from statistics import mean,median
import csv,json,sys
from campaign_v2_metrics import roster_review
from ai_balance_metrics import skill_summary
from owner_campaign_metrics import summarize
root=Path(__file__).resolve().parents[1]
def read(p):return list(csv.DictReader(p.open()))
tag=sys.argv[1]
duel=root/f'build/reports/campaign/q3/{tag}/duels.csv'
roster=root/f'build/reports/ai/z3/{tag}/roster.csv'
difficulty=root/f'build/reports/ai/z3/{tag}/difficulty.csv'
skill_path=root/f'build/reports/ai/z3/{tag}/skill.csv'
if duel.exists():
    rows=read(duel)
    for skill in range(3):
        group=[r for r in rows if r['skill']==str(skill)]
        print(skill,len(group),'wins',sum(r['win']=='true' for r in group),'draws',sum(r['draw']=='true' for r in group),
              {k:round(mean(float(r[k]) for r in group),3) for k in ('seconds','hp','bossHp','dispatches','mineShots','mineHits','laps','bossLaps')})
if roster.exists():
    rows=read(roster);samples=int(sys.argv[2]) if len(sys.argv)>2 else 32
    weights={r['id']:float(r['mixedWeight']) for r in read(root/'core/src/main/resources/data/roster-courses.csv')}
    report=roster_review(rows,weights,samples)
    print('roster',len(rows),'cross',report['completeCross'],'diversity',report['seedDiversity'],'resolved',report['allResolved'])
    for tier in report['tiers']:print(tier['tier'],tier['build'],tier['mixedWinnerShare'],'dominance',tier['dominancePass'],'bestWorst',tier['bestAndWorstPass'])
    print('unresolved',[(r['tier'],r['course'],r['build'],r['seed'],r['unresolved']) for r in rows if int(r['unresolved'])][:20])
if difficulty.exists():
    rows=read(difficulty);print('difficulty',len(rows),'unresolved',sum(int(r['unresolved'])>0 for r in rows))
    for event in (7,14,21,28):
        print(event,[[round(mean(r['first']=='true' for r in rows if int(r['event'])==event and int(r['lead'])==lead and int(r['difficulty'])==difficulty),3) for difficulty in range(3)] for lead in range(3)])
if skill_path.exists():
    report=skill_summary(read(skill_path),int(sys.argv[2]) if len(sys.argv)>2 else 32)
    print('skill',report['n'],'cross',report['completeCross'],'slots',report['actualClassSlotCross'],'diversity',report['seedDiversity'])
    for r in report['cases']:print(r['case'],r['lower'],r['upper'],r['passBoth'],[(s['swap'],round(s['championMarginSeconds'],3),s['unresolved']) for s in r['swaps']])
for buyer in ('race','pr'):
    source=root/f'build/reports/campaign/q3/{tag}'
    if (source/f'careers-{buyer}.csv').exists():
        report=summarize(read(source/f'careers-{buyer}.csv'),read(source/f'timeline-{buyer}.csv'),read(root/'core/src/main/resources/data/career-curve.csv'))
        print('cohort',buyer,report['n'],'completed',report['completed'],'censored',report['censored'],'bankrupt',report['bankruptcy'])
        print('groups',[(r['skill'],r['completed'],r['completedHoursMedian'],r['censoredAt']) for r in report['groups']])
        print('boss bands',[(r['event'],r['firstEntryRatio'],r['band'],r['bandPass']) for r in report['bosses']])
