"""Keep censored careers, conditional resampling and actual survivor wins visible."""
import csv,gzip,hashlib,html,json,math,statistics,sys
from collections import defaultdict
from pathlib import Path
from campaign_metrics import dominant as dominance, repeated as repetition, complete_cross, paired_seed_cross, opening_loss, all_fight_share
root=Path(__file__).resolve().parents[1]
source=root/(sys.argv[1] if len(sys.argv)>1 else 'build/reports/campaign/q3/qualifier-q3')
out=root/(sys.argv[2] if len(sys.argv)>2 else 'evidence/campaign/q3');out.mkdir(parents=True,exist_ok=True)
data=root/(sys.argv[3] if len(sys.argv)>3 else 'core/src/main/resources/data')
rules=json.loads((root/'tools/campaign-analysis-rules.json').read_text())
def dominant(w,b):return dominance(w,b,rules['maximumResolvedWinnerShare'])
def repeated(hashes):return repetition(hashes,rules['seedDiversityFloor'])
# Planted instrument defects: thresholds must be reachable and consume the intended denominator.
assert dominant(100,0) and dominant(0,100) and not dominant(50,50) and dominant(0,0) is None
assert repeated([1]*100) and not repeated(list(range(100)))
assert not (5/100<rules['maximumOpeningLossRate'])
def rows(name):return list(csv.DictReader((source/name).open(encoding='utf-8')))
def mean(a):return statistics.mean(a) if a else None
def median(a):return statistics.median(a) if a else None
def wilson(w,n):
    z=1.96;p=w/n;d=1+z*z/n;c=(p+z*z/(2*n))/d;e=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d
    return [c-e,c+e]
def pack(path):
    raw=path.read_bytes();target=out/(path.name+'.gz');target.write_bytes(gzip.compress(raw,mtime=0));assert gzip.decompress(target.read_bytes())==raw
    return {'file':target.name,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
duels=rows('duels.csv');physical=rows('physical.csv')+rows('boss-extra.csv');summary={'scope':'Fresh physical library; 2,000 held-out-outcome-resampled ledgers per buyer, not independent end-to-end physical careers','duels':[],'careers':[],'physical':{},'archives':[]}
if (source/'reuse-audit.json').exists():
    summary['reuseAudit']=json.loads((source/'reuse-audit.json').read_text())
    summary['scope']='Final build: fresh v5 library with changed Line builds recomputed, audited unchanged-row reuse, and two rerun 2,000-ledger policies; not independent end-to-end careers'
if (source/'report-status.json').exists():summary['decision']=json.loads((source/'report-status.json').read_text())
# Report a replay only when its final-core evidence is present.
replay=(source/'final-core-replay.txt').read_text()
assert replay.startswith('34 event samples reproduced their exact physical-library hashes on the final core.')
# Historical Q3 controls: do not relabel these as newly sampled outcomes.
control=root/'evidence/campaign/q3/experiments'
on=list(csv.DictReader((control/'wait-fiftysix.csv').open()))
off=list(csv.DictReader((control/'dispatcher-control-off.csv').open()))
assert {(r['skill'],r['rotation'],r['seed']) for r in on}=={(r['skill'],r['rotation'],r['seed']) for r in off}
summary['dispatcherControl']=[]
summary['dispatcherControlSource']='Historical Q3 control; not rerun for the gameplay follow-up'
for skill in range(3):
    a=[r for r in on if int(r['skill'])==skill];b=[r for r in off if int(r['skill'])==skill]
    summary['dispatcherControl'].append({'skill':['Rookie','Club','Pro'][skill],'pairedFights':len(a),'onWins':sum(r['win']=='true' for r in a),'offWins':sum(r['win']=='true' for r in b),'scope':'Only rig dispatcher removed; same seeds, slots, physical specs, boss and ordinary weapons'})
for skill in range(3):
 for rotation in [None,0,1]:
    a=[r for r in duels if int(r['skill'])==skill and (rotation is None or int(r['rotation'])==rotation)]
    wins=sum(r['win']=='true' for r in a);draws=sum(r['draw']=='true' for r in a);early=sum(r['early']=='true' for r in a)
    summary['duels'].append({'skill':['Rookie','Club','Pro'][skill],'rotation':rotation,'fights':len(a),'rigWins':wins,'bossWins':len(a)-wins-draws,'draws':draws,'rigWinRate':all_fight_share(wins,len(a)),'win95ci':wilson(wins,len(a)) if rotation is not None else None,'resolvedRigWinRate':all_fight_share(wins,len(a)-draws),'earlyLosses':early,'early95ci':wilson(early,len(a)) if rotation is not None else None,'meanSeconds':mean([float(r['seconds']) for r in a]),'medianSeconds':median([float(r['seconds']) for r in a]),'meanDispatches':mean([int(r['dispatches']) for r in a]),'meanMineHitsAllCars':mean([int(r['mineHits']) for r in a]),'meanRigRepairPickups':mean([int(r['repairs']) for r in a]),'oneShots':sum(int(r['oneShots']) for r in a),'uniqueHashes':len({r['hash'] for r in a}),'uniqueSeeds':len({r['seed'] for r in a})})
cells=defaultdict(list)
for r in physical:cells[tuple(r[k] for k in ['round','skill','car','band'])].append(r)
events=list(csv.DictReader((data/'campaign.csv').open()))
cars=list(csv.DictReader((data/'cars.csv').open()))
parts=list(csv.DictReader((data/'parts.csv').open()))
tiers=['rookie','club','pro','elite','champion'];bands=[0,4,sum(int(p['maxTier']) for p in parts)]
expected={(str(e),str(s),str(c),str(b)):20 if event['boss']=='1' else 4 for e,event in enumerate(events[:34]) for s in range(3) for c,car in enumerate(cars) if tiers.index(car['tier'])<=int(event['playerTier']) for b in bands}
assert set(cells)==set(expected) and all(len(cells[k])==n for k,n in expected.items())
assert (source/'reference-garages.csv').read_bytes()==(source/'boss-extra-garages.csv').read_bytes()
cross=__import__('collections').Counter((r['skill'],r['rotation']) for r in duels)
assert complete_cross(duels,3,2,512)
assert paired_seed_cross(duels,3,2,512)
assert all(len({r['seed'] for r in a})==len(a) for a in cells.values())
summary['physical']={'races':len(physical),'events':len({r['round'] for r in physical}),'cells':len(cells),'seedsPerCell':sorted({len(a) for a in cells.values()}),'minimumUniqueHashesPerCell':min(len({r['hash'] for r in a}) for a in cells.values()),'earlyLosses':sum(r['early']=='true' for r in physical),'unresolvedLead':sum(r['finished']=='false' and float(r['hp'])>0 for r in physical),'leadGridSlot':0,'opponentDifficulty':'Club','replayChecks':34,'training':'first two seeds per cell choose chassis; held-out seeds 2/3 regular and 2..19 boss resampled for ledgers','limitations':['Fixed reference rival trajectory; each ledger pays and shops its own rivals but resamples by nearest PR ratio','Two held-out outcomes per ordinary cell and eighteen per boss cell: 2,000 seeds are ledger variability, not 2,000 new physical outcomes','Normal-race lead stays in grid slot 0; paired rotation control is performed for the new duel']}
summary['physical']['completeCrossFromContent']=True
summary['physical']['sameReferenceGaragesInBaseAndBossSupplement']=True
if (source/'reuse-scope.txt').exists():
    retained=sum(int(r['round'])<28 for r in physical)
    summary['physical']['reuse']={'retainedUnchangedSamples':retained,'newAffectedCrownSamples':len(physical)-retained,'scope':(source/'reuse-scope.txt').read_text(),'replaysAreAdditionalSamples':False}
if (source/'release-equivalence.txt').exists():
    summary['physical']['releaseEquivalence']={'retainedSampledLibrary':len(physical),'newIndependentSamplesInReleaseRecheck':0,'scope':(source/'release-equivalence.txt').read_text()}
for buyer in ['race','pr']:
    careers=rows('careers-'+buyer+'.csv')
    timeline=rows('timeline-'+buyer+'.csv');by_seed=defaultdict(list)
    for r in timeline:by_seed[r['seed']].append(r)
    assert len(careers)==2000
    for skill in range(3):
     for reward in range(3):
        a=[r for r in careers if int(r['skill'])==skill and int(r['reward'])==reward]
        arrivals=[by_seed[r['seed']] for r in a if int(r['finale'])>=0]
        at_finale=[next(x for x in reversed(run) if int(x['event'])==34) for run in arrivals]
        milestones={key:{'reached':sum(int(r[key])>=0 for r in a),'medianRacesAmongReached':median([int(r[key]) for r in a if int(r[key])>=0])} for key in ['rook','ox','vex','mica','finale']}
        summary['careers'].append({'buyer':buyer,'skill':['Rookie','Club','Pro'][skill],'reward':['money','car','part'][reward],'careers':len(a),'completed':sum(r['completed']=='true' for r in a),'censored':sum(r['completed']=='false' for r in a),'milestones':milestones,'bankruptcies':sum(r['bankruptcy']=='true' for r in a),'debtZeroAtEnd':sum(int(r['leagueDebt'])==0 for r in a),'meanPaid':mean([int(r['paid']) for r in a]),'meanRecovered':mean([int(r['recovered']) for r in a]),'medianRaces':median([int(r['races']) for r in a]),'meanHours':mean([float(r['hours']) for r in a]),'maximumRatioGap':max(float(r['maxRatioGap']) for r in a),'censoredEvents':dict(__import__('collections').Counter(r['round'] for r in a if r['completed']=='false'))})
        summary['careers'][-1]['finaleArrival']={'count':len(arrivals),'meanDebtRemaining':mean([int(r['leagueDebt']) for r in at_finale]),'meanPaidBeforeFinale':mean([sum(int(r['paid']) for r in run if int(r['event'])<35) for run in arrivals]),'debtZero':sum(int(r['leagueDebt'])==0 for r in at_finale)}
        summary['careers'][-1]['actualRewardsByAlly']={ally:dict(__import__('collections').Counter(['unrecruited','pending','money','car','part'][int(r['rewards'].split(';')[i])] for r in a)) for i,ally in enumerate(['Rook','Ox','Vex','Mica'])}
for name in ['physical.csv','boss-extra.csv','duels.csv','reference-garages.csv','boss-extra-garages.csv','careers-race.csv','careers-pr.csv','timeline-race.csv','timeline-pr.csv']:
    summary['archives'].append(pack(source/name))
summary['gates']={'normalRaceOpeningLossRateBelow5Percent':not opening_loss(summary['physical']['earlyLosses'],len(physical),rules['maximumOpeningLossRate']),'openingLossRateBelow5Percent':all(not opening_loss(r['earlyLosses'],r['fights'],rules['maximumOpeningLossRate']) for r in summary['duels']),'noOneShotKills':all(r['oneShots']==0 for r in summary['duels']),'seedDiversityAtLeast99PercentEveryCell':all(not repeated([r['hash'] for r in a]) for a in cells.values()) and all(r['uniqueHashes']/r['fights']>=rules['seedDiversityFloor'] for r in summary['duels']),'neitherSideOver85PercentOfResolvedWins':all(dominant(r['rigWins'],r['bossWins']) is False for r in summary['duels']),'noObservedBankruptcy':all(r['bankruptcies']==0 for r in summary['careers']),'allCareersCompleted':all(r['censored']==0 for r in summary['careers'])}
summary['instrumentReview']={'rules':rules,'plantedMetricDefectsRejected':True,'winnerShareReachableRange':[0,1],'duelCross':{str(k):v for k,v in cross.items()},'minimumPhysicalHashFraction':min(len({r['hash'] for r in a})/len(a) for a in cells.values()),'duelWinnerDenominators':'All-fight rig win rate includes draws; resolved winner share excludes draws and sums rig plus boss to 1','normalRaceScope':'Lead entry rates, not roster dominance or a count of every field winner','registryNotes':['entry-vs-winner-share-threshold-check','rotation-confound-cross-check','distinct-hash-seed-diversity-alarm'],'limits':'Combined duel rows contain two paired rotations per seed; Wilson intervals are given only within each rotation, not for pooled paired observations. Distinct hashes do not establish independent humans; a diagnostic asymmetric-winner threshold is not a preregistered human balance claim'}
summary['instrumentReview']['duelPairingVerified']=True
summary['ratioTimeline']=[];summary['approximation']=[]
curve=list(csv.DictReader((data/'career-curve.csv').open()))
for buyer in ['race','pr']:
    seen=set();grouped=defaultdict(list)
    attempts=rows('timeline-'+buyer+'.csv')
    ordinary=[r for r in attempts if int(r['event'])<35];gaps=sorted(float(r['ratioGap']) for r in ordinary)
    ash={r['key']:float(r['value']) for r in csv.DictReader((data/'ash-rules.csv').open())}
    summary['approximation'].append({'buyer':buyer,'ordinaryAttempts':len(ordinary),'medianRatioGap':median(gaps),'p95RatioGap':gaps[math.ceil(.95*len(gaps))-1],'maximumRatioGap':max(gaps),'attemptsOutsideAuthoredEnvelope':sum(not ash['minimumRatio']<=float(r['ratio'])<=ash['maximumRatio'] for r in ordinary),'authoredEnvelope':[ash['minimumRatio'],ash['maximumRatio']]})
    for r in attempts:
        key=(r['seed'],r['event'])
        if key not in seen:seen.add(key);grouped[int(r['event'])].append(float(r['ratio']))
    for event,values in sorted(grouped.items()):
        summary['ratioTimeline'].append({'buyer':buyer,'event':event,'arrivals':len(values),'median':median(values),'minimum':min(values),'maximum':max(values),'authoredTarget':float(curve[event-1]['ratioTarget']),'ratioBasis':curve[event-1].get('ratioBasis','lap-field' if event<35 else 'historical-lap-target'),'scope':'First entry among arrivals; changing censored population; event 35 is the supplied rig'})
low,high=rules['bossRatioBand']
summary['bossRatioChecks']=[{**r,'insideLegacyBand':low<=r['median']<=high} for r in summary['ratioTimeline'] if r['event'] in [7,14,21,28]]
summary['gates']['allBossEntryMediansInLegacyBand']=all(r['insideLegacyBand'] for r in summary['bossRatioChecks'])
(out/'summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
# Standalone exported plots, not generated art or screenshots.
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams.update({'figure.facecolor':'#eee7d6','axes.facecolor':'#faf6ed','font.size':10})
fig,axes=plt.subplots(2,1,figsize=(12,8),layout='constrained')
for buyer,color in [('race','#9d422a'),('pr','#646447')]:
    timeline_rows=rows('timeline-'+buyer+'.csv');seen=set();first=[]
    for r in timeline_rows:
        key=(r['seed'],r['event'])
        if key not in seen:seen.add(key);first.append(r)
    for metric,ax in [('ratio',axes[0]),('leagueDebt',axes[1])]:
        grouped=defaultdict(list)
        for r in first:
            if int(r['event'])<35:grouped[int(r['event'])].append(float(r[metric]))
        x=sorted(grouped);y=[median(grouped[e]) for e in x]
        ax.plot(x,y,marker='.',label=buyer+(' buyer; first entry among arrivals' if metric=='ratio' else ' buyer; after first attempt among arrivals'),color=color)
        if metric=='ratio':
            for e in [7,14,21,28,34]:
                if e in grouped:ax.annotate('n='+str(len(grouped[e])),(e,median(grouped[e])),xytext=(0,8 if buyer=='race' or e in (7,14) else -15),textcoords='offset points',ha='center',fontsize=8)
for ax in axes:
    for e in [7,14,21,28]:ax.axvline(e,color='#c4b99f',lw=1,ls=':')
    ax.set_xlabel('Event (boss qualifiers marked; censored careers disappear from later points)');ax.legend();ax.grid(alpha=.2)
curve=list(csv.DictReader((data/'career-curve.csv').open()))
axes[0].plot(range(1,35),[float(r['ratioTarget']) for r in curve[:34]],ls='--',color='black',label='authored ratio target');axes[0].legend();axes[0].set_ylabel('Player / actual ledger field PR');axes[1].set_ylabel('League debt remaining (CR)')
fig.suptitle('Conditional campaign progression: arrival counts and missed targets remain visible')
fig.savefig(out/'campaign-curves.png',dpi=160);plt.close(fig)
fig,ax=plt.subplots(figsize=(10,5),layout='constrained')
for rotation,offset,color in [(0,-.13,'#9d422a'),(1,.13,'#646447')]:
    a=[r for r in summary['duels'] if r['rotation']==rotation]
    y=[r['rigWinRate'] for r in a];ci=[r['win95ci'] for r in a]
    ax.errorbar([i+offset for i in range(3)],y,yerr=[[v-c[0] for v,c in zip(y,ci)],[c[1]-v for v,c in zip(y,ci)]],fmt='o',capsize=5,color=color,label=f'Rig grid slot {rotation}; 512 fights each')
ax.set_xticks(range(3),['Rookie decisions','Club decisions','Pro decisions']);ax.set_ylim(0,1);ax.set_ylabel('Rig wins / all fights (draws remain in denominator)');ax.set_title('Fresh death-duel cohort: 95% Wilson intervals, paired grid control');ax.legend();ax.grid(alpha=.2);fig.savefig(out/'duel-wins.png',dpi=160);plt.close(fig)
table=''.join('<tr>'+''.join('<td>'+html.escape(str(v))+'</td>' for v in [r['buyer'],r['skill'],r['reward'],r['careers'],r['completed'],r['censored'],r['bankruptcies'],r['milestones']['finale']['reached']])+'</tr>' for r in summary['careers'])
page='''<!doctype html><meta charset="utf-8"><title>Death Ride campaign evidence</title><style>body{font:16px system-ui;background:#eee7d6;color:#27231e;max-width:1150px;margin:30px auto;padding:20px}img{max-width:100%}td,th{padding:8px;border:1px solid #aa9b7e}table{border-collapse:collapse}code{font-size:13px}</style><h1>Campaign measurements</h1><p>Fresh physical outcomes, conditional ledger resampling, no human feel verdict. Failed targets and censored careers remain results.</p><img src="campaign-curves.png"><img src="duel-wins.png"><h2>Seeded career ledgers</h2><p>Race buyer uses two training seeds to pick each chassis; PR buyer is the control. Both resample the other two regular-event seeds and eighteen held-out boss seeds. The 70-race observation limit censors unfinished careers.</p><table><tr><th>Buyer</th><th>Decisions</th><th>Reward</th><th>N</th><th>Completed</th><th>Censored</th><th>Bankrupt</th><th>Finale arrived</th></tr>'''+table+'''</table><p><a href="summary.json">Full measured summary and caveats</a>. Gzip CSV files retain raw outcomes and source hashes.</p>'''
if 'decision' in summary:
    status=summary['decision']
    page=page.replace('<h1>Campaign measurements</h1>','<h1>Campaign measurements</h1><p><strong>'+html.escape(status['label'])+'</strong> '+html.escape(status['reason'])+'</p>',1)
(out/'index.html').write_text(page,encoding='utf-8')
print(json.dumps({'physical':summary['physical'],'duels':[r for r in summary['duels'] if r['rotation'] is None],'gates':summary['gates']},indent=2))
