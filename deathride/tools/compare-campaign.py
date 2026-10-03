"""Compare immutable Q3 with a fresh library; do not conceal censored careers or failed targets."""
import csv,gzip,html,json,statistics,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
before=root/'evidence/campaign/q3'
after=root/(sys.argv[1] if len(sys.argv)>1 else 'evidence/gameplay/campaign/final')
old=json.loads((before/'summary.json').read_text())
new=json.loads((after/'summary.json').read_text())
def raw(folder,name):
    return list(csv.DictReader(gzip.decompress((folder/(name+'.gz')).read_bytes()).decode().splitlines()))

comparison={'scope':'Q3 versus fresh gameplay library: economy data and obstacles differ, as do physical seeds. This is before/after evidence, not isolation of one causal factor. Each buyer has 2,000 resampled ledgers, not independent end-to-end physical careers.',
            'careers':[],'rewardPolicies':[],'bosses':[],'duels':[],'seedOverlap':{},'remaining':[]}
for buyer in ['race','pr']:
    for reward in ['money','car','part']:
        def reward_totals(report):
            cells=[r for r in report['careers'] if r['buyer']==buyer and r['reward']==reward]
            return {key:sum(r[key] for r in cells) for key in ['careers','completed','censored','bankruptcies']}
        comparison['rewardPolicies'].append({'buyer':buyer,'reward':reward,'before':reward_totals(old),'after':reward_totals(new)})
    for skill in [None,'Rookie','Club','Pro']:
        a=[r for r in old['careers'] if r['buyer']==buyer and (skill is None or r['skill']==skill)]
        b=[r for r in new['careers'] if r['buyer']==buyer and (skill is None or r['skill']==skill)]
        comparison['careers'].append({'buyer':buyer,'skill':skill or 'all',
            'before':{key:sum(r[key] for r in a) for key in ['careers','completed','censored','bankruptcies']},
            'after':{key:sum(r[key] for r in b) for key in ['careers','completed','censored','bankruptcies']},
            'beforeFinaleArrivals':sum(r['milestones']['finale']['reached'] for r in a),
            'afterFinaleArrivals':sum(r['milestones']['finale']['reached'] for r in b)})
    for event in [7,14,21,28,35]:
        a=next(r for r in old['ratioTimeline'] if r['buyer']==buyer and r['event']==event)
        b=next(r for r in new['ratioTimeline'] if r['buyer']==buyer and r['event']==event)
        comparison['bosses'].append({'buyer':buyer,'event':event,'beforeMedian':a['median'],'afterMedian':b['median'],
            'beforeArrivals':a['arrivals'],'afterArrivals':b['arrivals'],'target':b['authoredTarget'],
            'basis':b['ratioBasis'],'insideBossBand':.85<=b['median']<=.90 if event<35 else None})
for b in new['duels']:
    a=next(r for r in old['duels'] if (r['skill'],r['rotation'])==(b['skill'],b['rotation']))
    comparison['duels'].append({'skill':b['skill'],'rotation':b['rotation'],
        'before':{key:a[key] for key in ['fights','rigWins','bossWins','draws','rigWinRate','resolvedRigWinRate','earlyLosses']},
        'after':{key:b[key] for key in ['fights','rigWins','bossWins','draws','rigWinRate','resolvedRigWinRate','earlyLosses']}})
for name in ['physical.csv','boss-extra.csv','duels.csv']:
    a={r['seed'] for r in raw(before,name)};b={r['seed'] for r in raw(after,name)}
    comparison['seedOverlap'][name]={'beforeDistinct':len(a),'afterDistinct':len(b),'overlap':len(a&b)}
    assert not a&b,'Fresh physical namespace overlaps Q3'
comparison['gatesBefore']=old['gates'];comparison['gatesAfter']=new['gates']
comparison['approximationBefore']=old['approximation'];comparison['approximationAfter']=new['approximation']
if any(r['insideBossBand'] is False for r in comparison['bosses']):comparison['remaining'].append('At least one buyer/event still misses the absolute 0.85-0.90 first-entry boss band. Inspect the policy-specific rows; the target has not been relaxed.')
if not new['gates']['allCareersCompleted']:comparison['remaining'].append('Censored careers remain at the unchanged 70-race limit; arrival is not completion.')
comparison['remaining'].extend(['Duel skill win rates are not a calibrated monotonic human difficulty scale.','Owner feel, phone comfort and every Stick check pending.'])
(after/'comparison.json').write_text(json.dumps(comparison,indent=2),encoding='utf-8')
def table(headers,rows):
    return '<table><tr>'+''.join('<th>'+html.escape(str(h))+'</th>' for h in headers)+'</tr>'+''.join('<tr>'+''.join('<td>'+html.escape(str(c))+'</td>' for c in r)+'</tr>' for r in rows)+'</table>'
page='<h2>Q3 before / fresh gameplay after</h2><p>'+comparison['scope']+'</p>'
page+=table(['Buyer','Skill','N','Completed before','Completed after','Censored after','Finale arrivals after'],
    [[r['buyer'],r['skill'],r['after']['careers'],r['before']['completed'],r['after']['completed'],r['after']['censored'],r['afterFinaleArrivals']] for r in comparison['careers']])
page+=table(['Buyer','Event','PR ratio before','PR ratio after','Arrivals before / after','Target','Boss band met'],
    [[r['buyer'],r['event'],round(r['beforeMedian'],4),round(r['afterMedian'],4),f"{r['beforeArrivals']} / {r['afterArrivals']}",r['target'],r['insideBossBand']] for r in comparison['bosses']])
page+=table(['Buyer','Ally choice policy','N','Completed before','Completed after','Censored after'],
    [[r['buyer'],r['reward'],r['after']['careers'],r['before']['completed'],r['after']['completed'],r['after']['censored']] for r in comparison['rewardPolicies']])
page+=table(['Decisions','Wins / all fights before','Wins / all fights after','Draws after','Resolved rig share after'],
    [[r['skill'],f"{r['before']['rigWins']} / {r['before']['fights']}",f"{r['after']['rigWins']} / {r['after']['fights']}",r['after']['draws'],f"{r['after']['resolvedRigWinRate']:.2%}"] for r in comparison['duels'] if r['rotation'] is None])
page+='<p>'+html.escape(' '.join(comparison['remaining']))+'</p><p><a href="comparison.json">Full before/after, rotation rows, seed overlap and approximation gaps</a>. No fresh physical seeds overlap Q3. Historical dispatcher-off controls are labeled historical, not rerun.</p>'
target=after/'index.html';existing=target.read_text(encoding='utf-8')
marker='<!-- before-after -->'
target.write_text(existing.split(marker)[0]+marker+page,encoding='utf-8')
print(json.dumps(comparison,indent=2))
