"""Publish measured before/after facts; never convert pending or failed studies to a pass."""
import csv, json, statistics, collections, html, hashlib, sys, gzip, io
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence/tracks/owner-part4'
INDEX=json.loads((OUT/'source-index.json').read_text()) if (OUT/'source-index.json').exists() else {}
def source_text(path):
    if path.exists():return path.read_text(encoding='utf-8-sig')
    entry=INDEX[path.relative_to(ROOT).as_posix()]
    with gzip.open(ROOT/entry['path'],'rb') as f:raw=f.read()
    assert hashlib.sha256(raw).hexdigest()==entry['sha256']
    return raw.decode('utf-8-sig')
def evidenced(path):return path.exists() or path.relative_to(ROOT).as_posix() in INDEX
def rows(path):
    return list(csv.DictReader(io.StringIO(source_text(path))))
def truth(s): return s == 'true'
def median(xs): return round(statistics.median(xs), 2) if xs else None
def groups(rs, keys):
    result = collections.defaultdict(list)
    for r in rs: result[tuple(r[k] for k in keys)].append(r)
    return result
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def study(tag):
    root = ROOT / 'build/reports/campaign/q3' / tag
    result = {'tag': tag}
    physical = rows(root/'physical.csv') + rows(root/'boss-extra.csv')
    result['physical'] = dict(trials=len(physical), early=sum(truth(r['early']) for r in physical),
        completedLead=sum(truth(r['finished']) for r in physical),
        unfinishedLead=sum(not truth(r['finished']) for r in physical),
        rounds=len({r['round'] for r in physical}))
    result['bossPhysical'] = [dict(event=int(k[0])+1,skill=int(k[1]),trials=len(rs),firsts=sum(truth(r['finished']) and r['position']=='1' for r in rs))
        for k,rs in groups([r for r in physical if int(r['round']) in (6,13,20,27)], ['round','skill']).items()]
    difficulty = rows(ROOT/'build/reports/ai/z3'/tag/'difficulty.csv')
    result['bossDifficulty'] = [dict(event=int(k[0]),skill=int(k[1]),trials=len(rs),wins=sum(truth(r['first']) for r in rs),beatBoss=sum(truth(r['beatBoss']) for r in rs),
        early=sum(truth(r['early']) for r in rs),unresolved=sum(int(r['unresolved']) for r in rs))
        for k,rs in groups([r for r in difficulty if r['lead']==r['difficulty']],['event','lead']).items()]
    duels=rows(root/'duels.csv')
    result['duels']=[dict(skill=int(k[0]),trials=len(rs),wins=sum(truth(r['win']) for r in rs),draws=sum(truth(r['draw']) for r in rs),
        timeouts=sum(truth(r['draw']) and float(r['seconds'])>=599.9 and not(float(r['hp'])<=0 and float(r['bossHp'])<=0) for r in rs),
        mutualWrecks=sum(truth(r['draw']) and float(r['hp'])<=0 and float(r['bossHp'])<=0 for r in rs),
        early=sum(truth(r['early']) for r in rs),oneShots=sum(int(r['oneShots']) for r in rs),medianSeconds=median([float(r['seconds']) for r in rs]))
        for k,rs in groups(duels,['skill']).items()]
    result['careers']={}
    for policy in ('race','pr'):
        path=root/f'careers-{policy}.csv'
        if not evidenced(path): result['careers'][policy]={'status':'pending'};continue
        rs=rows(path)
        result['careers'][policy]=dict(status='complete' if len(rs)==2000 else 'partial',trials=len(rs),
            completed=sum(truth(r['completed']) for r in rs),bankrupt=sum(truth(r['bankruptcy']) for r in rs),
            censoredAt70=sum(not truth(r['completed']) and int(r['races'])>=70 for r in rs),
            medianRaces=median([int(r['races']) for r in rs]),medianHours=median([float(r['hours']) for r in rs]),
            completedMedianHours=median([float(r['hours']) for r in rs if truth(r['completed'])]),
            bySkill=[dict(skill=int(k[0]),trials=len(g),completed=sum(truth(r['completed']) for r in g),
                medianRaces=median([int(r['races']) for r in g])) for k,g in groups(rs,['skill']).items()])
    result['exactReplays']=source_text(root/'final-core-replay.txt').strip() if evidenced(root/'final-core-replay.txt') else 'pending'
    return result

def balance(which):
    rs=rows(OUT/f'{which}-class-balance.csv')
    def cell(key, g):
        wins=collections.Counter(r['winner'] for r in g)
        n=sum(wins.values()); top=max(wins.values())
        halves=[]
        for samples in (range(6),range(6,12)):
            part=collections.Counter(r['winner'] for r in g if int(r['sample']) in samples)
            halves.append(dict(part))
        return dict(key=list(key),trials=n,wins=dict(wins),dominance=round(top/n,4),dominanceFlag=top/n>.55,
                    seedHalves=halves,early=sum(truth(r['earlyLead']) for r in g),unresolvedCars=sum(int(r['unresolved']) for r in g),
                    winnerMedianSeconds=median([float(r['winnerSeconds']) for r in g if float(r['winnerSeconds'])>=0]))
    return dict(trials=len(rs),early=sum(truth(r['earlyLead']) for r in rs),unresolvedCars=sum(int(r['unresolved']) for r in rs),
        oneShots=sum(int(r['oneShots']) for r in rs),pooled=[cell(k,g) for k,g in groups(rs,['tier','build']).items()],
        events=[cell(k,g) for k,g in groups(rs,['event','build']).items()])

def table(head, data):
    esc=lambda x:html.escape('—' if x is None else str(x))
    return '<div class="table-wrap"><table class="matrix"><thead><tr>'+''.join('<th>'+esc(c)+'</th>' for c in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+esc(c)+'</td>' for c in row)+'</tr>' for row in data)+'</tbody></table></div>'
def page(title, body):
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><link rel="stylesheet" href="../../audio/report.css"><link rel="stylesheet" href="../tracks.css"><style>body{overflow-wrap:anywhere}.matrix td,.matrix th{padding:.55rem}.table-wrap{overflow:auto}main{max-width:1400px}.outlines{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}.outline{border:1px solid #789;padding:12px;background:#fff;color:#15272d}.outline svg{width:100%;height:190px}pre{white-space:pre-wrap}</style><body><main><h1>'+title+'</h1><nav><a href="index.html">Campaign atlas</a> &middot; <a href="owner-triage.html">Before/after report</a> · <a href="scrap-7.html">Scrap-7 owner review</a> · <a href="candidates.html">Full retained library</a> · <a href="../lab/index.html">Track Lab</a> · <a href="../../regions/index.html">Regions</a></nav>'+body+'</main></body></html>'

def write_outlines(selected,events,regions):
    sheet='<p>Final campaign assignment in event order. Scrap-7-f is provisional. Geometry shown at individual fit scale; labels retain lap counts and regions.</p><div class="outlines">'
    for c in selected:
        ps=c['shape']['outline'];xs=[p[0] for p in ps];ys=[p[1] for p in ps];w=max(xs)-min(xs);h=max(ys)-min(ys);pad=max(w,h)*.07
        coords=' '.join(f'{x:.4f},{y:.4f}' for x,y in ps+[ps[0]])
        label=html.escape(c['id']+(' — PROVISIONAL' if c.get('provisional') else ''))
        event=events[c['slot']]; duration='Elimination' if event['type']=='ELIMINATION' else event['laps']+' laps'
        region=regions[event['cup']]['name']
        labQuery='course=runoff' if c.get('accepted') else 'candidate='+c['id']
        sheet+=f'<article class="outline"><strong>{label}</strong><svg viewBox="{min(xs)-pad} {min(ys)-pad} {w+2*pad} {h+2*pad}" role="img" aria-label="{label}"><g transform="translate(0,{min(ys)+max(ys)}) scale(1,-1)"><polyline points="{coords}" fill="none" stroke="#17697b" stroke-width="{max(w,h)*.009}"/></g></svg><p>{duration} · {html.escape(region)}</p><p><a href="../lab/index.html?{labQuery}">Open in Lab</a></p></article>'
    (ROOT/'tracks/atlas/final-outline-sheet.html').write_text(page('Final campaign outline sheet',sheet+'</div>'),encoding='utf-8')
    atlas='<p>35 campaign events, one assigned course each. Scrap-7-f remains provisional; three duplicate owner Keeps are available as practice alternates. <a href="scrap-7.html">Review the three new boss roads</a>.</p><p><a href="owner-triage.html">Measured before/after report</a> &middot; <a href="final-outline-sheet.html">Standalone outline sheet</a> &middot; <a href="legacy.html">Archived T1 atlas</a></p>'+sheet+'</div>'
    (ROOT/'tracks/atlas/index.html').write_text(page('Campaign track atlas',atlas),encoding='utf-8')

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    owner=json.loads((ROOT/'tracks/candidates/owner-decisions.json').read_text())
    library=json.loads((ROOT/'tracks/atlas/candidates.json').read_text())
    assignment=rows(ROOT/'tracks/candidates/owner-assignment.csv')
    selected=[next(c for c in library['candidates'] if c['id']==a['candidate']) for a in assignment]
    events={e['id']:e for e in rows(ROOT/'core/src/main/resources/data/campaign.csv')}
    regions={r['division']:r for r in json.loads((ROOT/'regions/data.json').read_text())['regions']}
    write_outlines(selected,events,regions)
    if '--outlines-only' in sys.argv:
        print('Published 35 final outlines');return
    result=dict(before=study('owner-before'),after=study('owner-after'),beforeBalance=balance('before'),afterBalance=balance('after'),assignment=assignment,
                campaignSha256=sha(ROOT/'core/src/main/resources/data/campaign.csv'))
    old_shapes=json.loads((OUT/'before-shapes.json').read_text())
    result['shapes']=dict(beforeCourses=len(old_shapes['courses']),beforePass=sum(all(g['status']=='pass' for g in c['shape']['gates']) for c in old_shapes['courses']),
        beforeSimilarPairs=sum(p['similar'] for p in old_shapes['pairs']),afterComposerCourses=len(library['candidates'])-1,
        afterPass=sum(all(g['status']=='pass' for g in c['shape']['gates']) for c in library['candidates'] if not c.get('accepted')),
        afterSimilarPairs=sum(p['similar'] for p in library['pairs']),acceptedException='Runoff')
    result['device']=json.loads((OUT/'stick-status-at-review.json').read_text())
    result['firstBossChoices']=json.loads((ROOT/'tracks/candidates/scrap-boss-balance.json').read_text())
    result['retainedProofComparison']=[]
    for ident in owner['keeps']:
        old_folder='proof-12-traversal' if ident=='crown-7-a' else 'proof-12'
        old=json.loads((ROOT/'tracks/candidates'/old_folder/(ident+'.json')).read_text())
        new=json.loads((ROOT/'tracks/candidates/proof-final'/(ident+'.json')).read_text())
        same=all(old[k]==new[k] for k in ('digest','flags','cleanFinishSeconds','lapWinnerSeconds','aggregate','repeatHashMatches'))
        result['retainedProofComparison'].append(dict(candidate=ident,identicalMeasuredQuality=same))
        assert same,ident
    result['pacing']=[]
    for b,a in zip(result['beforeBalance']['events'],result['afterBalance']['events']):
        event,build=a['key'];visit=int(event.split('-')[-1])
        if visit not in (1,6,7):continue
        low,high=(120,180) if visit==1 else (240,360)
        result['pacing'].append(dict(event=event,build=build,target=[low,high],before=b['winnerMedianSeconds'],after=a['winnerMedianSeconds'],
                                    beforePass=low<=b['winnerMedianSeconds']<=high,afterPass=low<=a['winnerMedianSeconds']<=high))
    result['quality']=[dict(event=c['slot'],candidate=c['id'],status=c.get('technicalStatus','accepted-exception'),
        flags=c.get('technicalFlags',c.get('proof',{}).get('flags',[])),clean=round(c.get('proof',{}).get('cleanFinishSeconds',{}).get('p50'),2),
        combat=round(c.get('proof',{}).get('lapWinnerSeconds',{}).get('p50'),2),early=c.get('proof',{}).get('aggregate',{}).get('metrics',{}).get('earlyLeadWreckRate'),
        target=[c.get('minSeconds'),c.get('maxSeconds')]) for c in selected]
    (OUT/'before-after.json').write_text(json.dumps(result,indent=2)+'\n')
    body='<p>35 stable events. 37 owner Keeps retained; three duplicate Keeps are practice alternates. Scrap-7-f is provisional and awaits the owner. 63 rejected and three unreviewed proposals are archived. Approved Runoff and finale geometry remain unchanged.</p>'
    body+='<p><strong>Balance findings remain:</strong> all ten tier/equipment groups exceed the 55% class-dominance diagnostic (eight before), and all three new first-boss choices have low measured Pro wins. Shape, traversal and stock pacing passes do not erase these findings. The Stick check is pending/busy with dev.deathride.perf in the foreground.</p>'
    body+='<p><strong>Progression is mixed:</strong> race-priority completions improve from 868 to 1,316 of 2,000, but PR-priority completions fall from 905 to 459. No Rookie proxy finishes within the 70-race cap on either side; after assignment, no Club proxy finishes the PR-priority policy either. These unresolved balance and progression findings require follow-up.</p>'
    body+='<p>Before uses frozen original runtime bytes; after uses the final assignments and hunter fix. Actual campaign encounter damage, harsh six-car stress, equal-peer class races and conditional career resampling are separate experiments. No human win rate or device performance is inferred.</p>'
    body+='<p>The broad campaign comparison includes the approved course assignment changes as well as the hunter repair. The original 12-seed finale regression isolates the hunter change on the same approved crown-7-a course.</p>'
    body+='<p><a href="final-outline-sheet.html">Final 35-course outline sheet</a> · <a href="../../evidence/tracks/owner-part4/before-after.json">All structured measurements</a></p>'
    body+='<h2>Campaign and fairness</h2>'+table(['Measure','Before','After'],[
        ['Library shape passes under the same gates',f"{result['shapes']['beforePass']}/{result['shapes']['beforeCourses']}",f"{result['shapes']['afterPass']}/{result['shapes']['afterComposerCourses']}; Runoff accepted exception"],
        ['Similar outline pairs',result['shapes']['beforeSimilarPairs'],result['shapes']['afterSimilarPairs']],
        ['Physical lap trials',result['before']['physical']['trials'],result['after']['physical']['trials']],
        ['Physical lead finishes',result['before']['physical']['completedLead'],result['after']['physical']['completedLead']],
        ['Physical lead early wrecks',result['before']['physical']['early'],result['after']['physical']['early']],
        ['Equal-peer six-car trials',result['beforeBalance']['trials'],result['afterBalance']['trials']],
        ['Equal-peer early lead wrecks',result['beforeBalance']['early'],result['afterBalance']['early']],
        ['Equal-peer unresolved cars',result['beforeBalance']['unresolvedCars'],result['afterBalance']['unresolvedCars']],
        ['Equal-peer one-shot kills',result['beforeBalance']['oneShots'],result['afterBalance']['oneShots']]])
    body+='<h2>Named boss wins by matched difficulty</h2><p>Both eligible peer cars, two lead slots and eight seeds: 32 trials per event and skill. Wins mean a surviving first-place finish, as required for promotion. Finishing ahead of the named boss alone does not qualify.</p>'+table(['Event','Skill','Before wins','After wins'],[[b['event'],['Rookie','Club','Pro'][b['skill']],f"{b['wins']}/{b['trials']}",f"{a['wins']}/{a['trials']}"] for b,a in zip(result['before']['bossDifficulty'],result['after']['bossDifficulty'])])
    body+='<h2>Final duel</h2><p>512 shared seeds, two grid/equipment rotations and three lead-skill proxies against a fixed Club boss. This is separate from the original both-Pro 12-trial regression fixture.</p>'+table(['Lead skill','Before rig wins / timeouts','After rig wins / timeouts','After mutual wrecks','Trials per side'],[[['Rookie','Club','Pro'][b['skill']],f"{b['wins']} / {b['timeouts']}",f"{a['wins']} / {a['timeouts']}",a['mutualWrecks'],a['trials']] for b,a in zip(result['before']['duels'],result['after']['duels'])])
    body+='<p>The unchanged 600-second watchdog never awards a victory. All 274 baseline timeouts were eliminated in this study. Two Rookie trials ended in legitimate mutual-wreck draws at 142 and 170 seconds; both hulls were zero. The original regression improved from 3/12 unresolved to 0/12, and 128 held-out both-Pro trials had zero timeouts.</p>'
    body+='<h2>Class balance</h2><p>Three entrants per peer, twelve common seeds and six rotations per event. Rotations are correlated; seed-half counts are retained in JSON. More than 55% pooled dominance is a diagnostic flag. Class balance is flagged, not passed.</p>'+table(['Tier / equipment','Before wins','After wins','After dominance'],[[' / '.join(b['key']),'; '.join(f'{k} {v}' for k,v in b['wins'].items()),'; '.join(f'{k} {v}' for k,v in a['wins'].items()),f"{100*a['dominance']:.1f}%"] for b,a in zip(result['beforeBalance']['pooled'],result['afterBalance']['pooled'])])
    body+='<h2>Opening and final pace under campaign damage</h2><p>The authored bands are tested at stock event-tier equipment. Fully developed fields are also shown: foundry-1, foundry-6 and scrap-7 run below those bands when fully upgraded. No laps or approved geometry were changed to conceal this. The arena uses its separate duel measurement.</p>'+table(['Event / build','Target s','Before winner median s','After winner median s','After'],[[r['event']+' / '+r['build'],'–'.join(map(str,r['target'])),r['before'],r['after'],'in band' if r['afterPass'] else 'below band' if r['after']<r['target'][0] else 'above band'] for r in result['pacing']])
    body+='<h2>Conditional campaign simulations</h2><p>Two spending policies, each 2,000 careers resampled from measured physical outcomes. These are economic/progression simulations, not 4,000 independent full physical campaigns.</p>'+table(['Policy','Before complete / total','After complete / total','Before / after median races'],[[p,f"{result['before']['careers'][p].get('completed','pending')}/{result['before']['careers'][p].get('trials',0)}",f"{result['after']['careers'][p].get('completed','pending')}/{result['after']['careers'][p].get('trials',0)}",f"{result['before']['careers'][p].get('medianRaces')} / {result['after']['careers'][p].get('medianRaces')}"] for p in ('race','pr')])
    body+='<p>Careers stop at 70 races. Unfinished runs at that cap are censored, not successful completions. Overall observed hours include censored runs; completed-only hours describe only the subset that finished.</p>'+table(['Policy / version','Rookie / Club / Pro completions','Censored at 70','Bankrupt','Observed median hours','Completed-only median hours'],[[p+' / '+side,' / '.join(f"{c['completed']}/{c['trials']}" for c in result[side]['careers'][p]['bySkill']),result[side]['careers'][p]['censoredAt70'],result[side]['careers'][p]['bankrupt'],result[side]['careers'][p]['medianHours'],result[side]['careers'][p]['completedMedianHours']] for p in ('race','pr') for side in ('before','after')])
    body+='<h2>Final assignment quality and pacing</h2><p>Fresh 72-trial stress proof per course, plus clean traversal: 2,880 six-car trials and 120 clean races across the 40-item library. The 37 retained choices reproduce their original measured quality exactly. Opening events target 120–180 seconds; lap finals target 240–360. Runoff remains unchanged with its 25/72 stress early-wreck exception. The crown-7-a row is a lap rehearsal; actual elimination is reported separately above.</p><details><summary>All 35 assigned courses</summary>'+table(['Event','Candidate','Clean median s','Combat lap-winner median s','Target s','Flags'],[[r['event'],r['candidate'],r['clean'],r['combat'],'accepted original' if r['target'][0] is None else '–'.join(map(str,r['target'])),', '.join(r['flags']) or 'none'] for r in result['quality']])+'</details>'
    body+='<p><a href="../../evidence/tracks/owner-part4/source-index.json">Raw study file index with SHA-256 hashes</a>. Compressed CSV and text sources are retained beside the index. Runtime provenance, final proof, class trials and boss-choice trials are retained in the same evidence directory or linked candidate library.</p>'
    body+='<p><a href="../../evidence/tracks/owner-part4/stick-status-at-review.json">Stick status at review</a>: all 254 hosts in 10.0.0.0/24 scanned on TCP/5555; AFTKM at 10.0.0.139 is busy. Only dev.deathride.tracks is authorized. No install, launch or app stop was performed; device performance and sofa readability remain pending.</p>'
    (ROOT/'tracks/atlas/owner-triage.html').write_text(page('Owner track triage: measured before and after',body),encoding='utf-8')
    print(json.dumps(dict(events=len(selected),output='tracks/atlas/owner-triage.html')))

if __name__=='__main__':main()
