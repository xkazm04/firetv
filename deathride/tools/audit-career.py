"""Independent C4 raw-row audit and four-curve plot. Requires matplotlib for the plot only."""
import csv, gzip, json, math, statistics, sys
from collections import defaultdict, Counter
from pathlib import Path

root=Path(__file__).resolve().parents[1]
directory=Path(sys.argv[1]) if len(sys.argv)>1 else root/'core/build/reports/ash-circuit/8'
def read(name):
    path=directory/name
    with (path.open(encoding='utf-8') if path.exists() else gzip.open(str(path)+'.gz','rt',encoding='utf-8')) as f:return list(csv.DictReader(f))
physical=read('physical.csv');careers=read('careers.csv');timeline=read('timeline.csv');summary=read('summary.csv')
groups=Counter((r['round'],r['difficulty'],r['car'],r['band']) for r in physical)
assert len(set(groups.values()))==1
seeds=next(iter(groups.values()))
hashes=defaultdict(set)
for r in physical:hashes[r['round'],r['difficulty'],r['car'],r['band']].add(r['hash'])
assert all(len(values)==seeds for values in hashes.values())
bands={int(r["band"]) for r in physical}
assert bands in ({0,1,2,4},{0,1,2,4,8,17})
assert len(physical)==35*6*3*len(bands)*seeds
keys={(int(r['round']),int(r['difficulty']),int(r['car']),int(r['band']),int(r['seed'])) for r in physical}
assert len(keys)==len(physical)
assert all(0<float(r['seconds'])<=180.02 and 0<=float(r['hp'])<=100 and 1<=int(r['position'])<=6 for r in physical)
assert all(r['finished']=='true' or float(r['hp'])==0 for r in physical)
assert all(len(r['rivals'].split(';'))==(1 if int(r['round'])==34 else 5) for r in physical)
physical_lookup={(int(r['round']),int(r['difficulty']),int(r['seed'])):r for r in physical}
assert len(physical_lookup)==len(physical)
data=root/'core/src/main/resources/data'
def authored(name):
    with (data/(name+'.csv')).open(encoding='utf-8') as f:return list(csv.DictReader(f))
def rules(name):return {r['key']:float(r['value']) for r in authored(name)}
economy=rules('economy');market=rules('market');ash=rules('ash-rules')
prizes={int(r['position']):int(r['credits']) for r in authored('prizes')}
points={int(r['position']):int(r['points']) for r in authored('career-points')}
schedule=authored('career-curve');cups=authored('championships');cars=authored('cars')
hulls={r['id']:float(r['hullScale'])*100 for r in authored('car-loadouts')}
tier_rank={name:i for i,name in enumerate(['rookie','club','pro','elite','champion'])}
assert all(tier_rank[cars[int(r['car'])]['tier']]<=int(r['round'])//7 for r in physical)
traces=defaultdict(list)
for r in timeline:
    traces[int(r['difficulty']),int(r['seed'])].append(r)
    assert all(math.isfinite(float(r[k])) for k in ['playerPR','fieldPR','ratio','income','seconds','ratioGap'])
    assert abs(float(r['playerPR'])/float(r['fieldPR'])-float(r['ratio']))<1e-10
    assert int(r['cash'])>=0 and int(r['debt'])>=0
    assert int(r['gross'])-int(r['repair'])-int(r['debtPaid'])==int(r['netIncome'])
    assert int(r['netIncome'])-int(r['income'])==int(r['unbankedAtCap'])>=0
    income=int(r['income']);before=int(r['cash'])-income
    for price,metric in [('nextUpgrade','upgradeRaces'),('nextCar','carRaces')]:
        remaining=max(0,int(r[price])-before)
        expected=0 if remaining==0 else remaining/income if income>0 else -1
        assert abs(float(r[metric])-expected)<1e-10
    source=physical_lookup[int(r['event'])-1,int(r['difficulty']),int(r['physicalSeed'])]
    assert r['position']==source['position'] and r['early']==source['early'] and r['seconds']==source['seconds']
    assert abs(abs(float(source['playerPR'])/float(source['fieldPR'])-float(r['ratio']))-float(r['ratioGap']))<1e-10
for c in careers:
    rows=traces[int(c['difficulty']),int(c['seed'])]
    assert len(rows)==int(c['races'])
    assert abs(sum(float(r['seconds']) for r in rows)/3600-float(c['hours']))<1e-8
    assert sum(r['early']=='true' for r in rows)==int(c['early'])
    assert [int(r['race']) for r in rows]==list(range(1,len(rows)+1))
    assert c['bankruptcy']=='false'
    assert sum(r['advanced']=='true' for r in rows)==(35 if c['completed']=='true' else int(rows[-1]['event'])-1+(rows[-1]['advanced']=='true'))
    cup_points=0;streak=0;debt=int(ash['startingDebt'])
    for r in rows:
        event=int(r['event']);position=int(r['position']);source=physical_lookup[event-1,int(r['difficulty']),int(r['physicalSeed'])]
        streak=streak+1 if position==1 else 0
        extra=(int(market['cleanBonus']) if source['clean']=='true' and source['finished']=='true' else 0)+min(streak,int(market['streakCap']))*int(market['streakBonus'])
        if int(source['kills'])==5:extra+=int(market['destructionBonus'])
        bonus=0
        if r['advanced']=='true':
            cup_points+=points[position]
            if event%7==0:
                cup=cups[(event-1)//7]
                for grade in ['gold','silver','bronze']:
                    if cup_points>=int(cup[grade+'Points']):bonus=int(cup[grade+'Bonus']);break
                cup_points=0
        gross=math.floor((economy['participationCredits']+prizes[position]+min(int(source['kills']),economy['paidWreckCap'])*economy['wreckBountyCredits'])*float(schedule[event-1]['rewardScale']))+bonus+extra+int(source['cash'])
        repair=min(math.ceil(max(0,hulls[cars[int(source['car'])]['id']]-float(source['hp']))*economy['repairCreditsPerHp']),math.floor(gross*economy['maxRepairPrizeShare']))
        net=gross-repair;paid=min(debt,math.floor(net*market['repaymentShare']),max(0,net-int(market['minimumTakeHome'])))
        debt-=paid
        assert (gross,repair,paid,debt)==(int(r['gross']),int(r['repair']),int(r['debtPaid']),int(r['debt']))
        before=int(r['cash'])-int(r['income'])
        assert int(r['income'])==min(net-paid,int(economy['creditCap'])-before)
findings=[];settings=[]
for d,s in enumerate(summary):
    group=[c for c in careers if int(c['difficulty'])==d];assert len(group)==int(s['careers'])
    assert len({c['seed'] for c in group})==len(group)
    assert sum(c['completed']=='true' for c in group)==int(s['completed'])
    mean=lambda key:statistics.mean(float(c[key]) for c in group if float(c[key])>=0)
    assert abs(mean('hours')-float(s['meanHours']))<1e-8
    first=mean('firstUpgrade');club=mean('club');milestones=[mean(k) for k in ['club','pro','elite','champion']]
    gaps=[milestones[i+1]-milestones[i] for i in range(3)]
    early=sum(int(c['early']) for c in group)/sum(int(c['races']) for c in group)
    item=dict(s,followingTierIntervals=gaps,firstUpgradeTarget=2<=first<=3,clubTarget=7<=club<=9,followingTiersTarget=all(7<=round(g,2)<=9 for g in gaps),durationTarget=5<=mean('hours')<=8,earlyTarget=early<.05)
    settings.append(item)
    for key in ['firstUpgradeTarget','clubTarget','followingTiersTarget','durationTarget','earlyTarget']:
        if not item[key]:findings.append(f"{s['difficulty']}: {key} missed")
    if int(s['completed'])<len(group):findings.append(f"{s['difficulty']}: {len(group)-int(s['completed'])} careers censored at 70 races")
# First visit to each event, avoiding retry-weighted averages.
first_visits={}
for r in timeline:first_visits.setdefault((r['difficulty'],r['seed'],r['event']),r)
columns=['playerPR','fieldPR','ratio','income','nextUpgrade','nextCar','upgradeRaces','carRaces','ratioGap','gross','repair','debtPaid','netIncome','unbankedAtCap']
curve=[]
for d in range(3):
    for event in range(1,36):
        rows=[r for (difficulty,seed,k),r in first_visits.items() if int(difficulty)==d and int(k)==event]
        assert rows
        curve.append(dict(difficulty=d,event=event,samples=len(rows),**{k:statistics.mean(float(r[k]) for r in rows) for k in columns}))
with (directory/'curves.csv').open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=list(curve[0]));writer.writeheader();writer.writerows(curve)
club=[r for r in curve if r['difficulty']==1]
joins=[{'event':k,'playerPrChange':club[k-1]['playerPR']/club[k-2]['playerPR']-1,'fieldPrChange':club[k-1]['fieldPR']/club[k-2]['fieldPR']-1,'nextCarRaces':club[k-1]['carRaces']} for k in [8,15,22,29]]
outside=sum(not .8<=float(r['ratio'])<=1.15 for r in timeline)
for event in [1,7,14,21,28,35]:
    ratio=club[event-1]['ratio'];low,high=(1,1.1) if event==35 else (.85,.9)
    if not low<=ratio<=high:findings.append(f"Club event {event}: measured PR ratio {ratio:.4f} outside proposed [{low}, {high}]")
report={'physicalRaces':len(physical),'replayedCells':len(groups),'monetarySettlementsIndependentlyRecomputed':len(timeline),'milestoneComparisonDecimalPlaces':2,'sampledCareers':len(careers),'sampledRaceOutcomes':len(timeline),'settings':settings,'targetFindings':findings,'tierJoins':joins,'racesOutsideRatioEnvelope':outside,'walletCapDiscardedCredits':sum(int(r['unbankedAtCap']) for r in timeline),'largestRatioGap':max(float(r['ratioGap']) for r in timeline),'ratioGapP95':sorted(float(r['ratioGap']) for r in timeline)[int(.95*len(timeline))],
 'limits':['Club-skill AI lead is a driving proxy; no human feel claim.','Nearest PR-ratio upgrade band; eight seeds per physical cell; Monte Carlo resamples those outcomes.','One evolving reference rival economy supplies physical fields; career rival economies settle actual sampled results, so field configurations differ.','Seven legal spending caps compared, not proof of globally optimal play.','Baseline omits optional player loans, contracts, reserves and manual repairs; C3 tests cover those separately.','Hours measure active racing only; menus, reading and human retries are not invented.','First-visit curves; milestone means omit unreached milestones, with completion counts reported.']}
(directory/'audit.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
if '--stamp' in sys.argv:
    assert seeds==8 and all(int(s['careers'])>=2000 for s in summary)
    path=root/'core/src/main/resources/data/career-curve.csv'
    schedule=list(csv.DictReader(path.open(encoding='utf-8')))
    for authored,measured in zip(schedule,club):
        assert int(authored['number'])==measured['event']
        for key in columns:authored['measured'+key[0].upper()+key[1:]]=measured[key]
    with path.open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=list(schedule[0]),lineterminator='\n');writer.writeheader();writer.writerows(schedule)
import matplotlib
matplotlib.use('Agg')
matplotlib.rcParams['svg.hashsalt']='deathride-c4'
import matplotlib.pyplot as plt
fig,axes=plt.subplots(2,2,figsize=(13,8),layout='constrained')
colors=['#27877f','#d16a28','#7656a8'];names=['Rookie field','Club field','Pro field'];x=list(range(1,36))
for d,color in enumerate(colors):
    rows=[r for r in curve if r['difficulty']==d]
    axes[0,0].plot(x,[r['fieldPR'] for r in rows],label=names[d],color=color)
    axes[0,1].plot(x,[r['playerPR'] for r in rows],label=names[d],color=color)
    axes[1,0].plot(x,[r['ratio'] for r in rows],label=names[d],color=color)
axes[1,0].axhspan(.85,.9,color='gray',alpha=.12);axes[1,0].axhline(1,color='gray',ls=':')
for key,label,color in [('netIncome','Net earned before wallet cap','#27877f'),('gross','Gross incl. cup bonuses','#777777'),('nextUpgrade','Next upgrade price','#d16a28'),('nextCar','Next tier car after trade','#7656a8')]:axes[1,1].plot(x,[r[key] for r in club],label=label,color=color)
for ax,title,ylabel in zip(axes.flat,['Actual field PR F(k)','Purchased player PR P(k)','Player / field PR','Money timeline — Club field'],['PR','PR','Ratio','Credits']):
    ax.set(title=title,xlabel='Event (first visit)',ylabel=ylabel);ax.grid(alpha=.2);ax.legend(fontsize=8)
    for boundary in [7.5,14.5,21.5,28.5]:ax.axvline(boundary,color='gray',alpha=.3)
fig.suptitle('The Ash Circuit — physical-library career pacing (AI reference, not human feel)')
fig.savefig(directory/'pacing.png',dpi=150);fig.savefig(directory/'pacing.svg',metadata={'Date':None});plt.close(fig)
svg=directory/'pacing.svg';svg.write_bytes(('\n'.join(line.rstrip() for line in svg.read_text(encoding='utf-8').splitlines())+'\n').encode('utf-8'))
print(json.dumps(report,indent=2))
