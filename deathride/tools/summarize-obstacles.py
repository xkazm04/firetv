"""Paired physics comparison. Keep failures and actual winner denominators visible."""
import csv,gzip,hashlib,html,json,statistics,sys
from collections import defaultdict,Counter
from pathlib import Path
from obstacle_metrics import share,changed_share,repeated,crossed,early,unresolved
root=Path(__file__).resolve().parents[1]
tag=sys.argv[1] if len(sys.argv)>1 else 'initial'
source=root/f'build/reports/obstacles/{tag}/races.csv'
out=root/f'evidence/gameplay/obstacles/{tag}';out.mkdir(parents=True,exist_ok=True)
rows=list(csv.DictReader(source.open()))
rules={r['key']:float(r['value']) for r in csv.DictReader((root/'core/src/main/resources/data/obstacle-rules.csv').open())}
cells=defaultdict(list)
for r in rows:cells[tuple(r[k] for k in ['obstacles','course','tier','rotation'])].append(r)
courses={r['course'] for r in rows}
expected={(m,c,str(t),str(r)) for m in ['0','1'] for c in courses for t in range(5) for r in range(6)}
assert len(courses)==25 and crossed(cells,expected)
assert len({len(v) for v in cells.values()})==1
assert all(len({r['sample'] for r in v})==len(v) for v in cells.values())
diversity=[{'cell':k,'runs':len(v),'hashes':len({r['hash'] for r in v}),'seeds':len({r['seed'] for r in v})} for k,v in cells.items()]
alarms=[]
for c in diversity:
 if any(repeated([r[key] for r in cells[c['cell']]],rules['distinctHashMinimum']) for key in ['hash','seed']):alarms.append(f"Repeated seeds/states {c['cell']}")
by_pair=defaultdict(dict)
for r in rows:by_pair[tuple(r[k] for k in ['course','tier','rotation','sample'])][r['obstacles']]=r
assert all(set(p)=={'0','1'} and p['0']['seed']==p['1']['seed'] for p in by_pair.values())
campaign='campaign' in tag
summary={'scope':f'Physical paired races, Club decisions, {"authored campaign tier damage scales" if campaign else "full practice damage"}, {"funded useful legal upgrades on" if "upgraded" in tag else "stock"} three copies of each tier chassis; all courses equally weighted, including stress entries outside competitive pools. No human/Stick verdict.','pairs':len(by_pair),'rotationCells':len(cells),'cellSamples':len(next(iter(cells.values()))),'minimumDistinctFraction':min(c['hashes']/c['runs'] for c in diversity),'modes':[],'tiers':[],'alarms':alarms}
if (source.parent/'report-status.json').exists():
 summary['decision']=json.loads((source.parent/'report-status.json').read_text())
 summary['scope']=summary['decision']['label']+'. '+summary['decision']['reason']+' '+summary['scope']
for mode in ['0','1']:
 a=[r for r in rows if r['obstacles']==mode]
 finished=[float(c.split(':')[1]) for r in a for c in r['cars'].split(';') if float(c.split(':')[1])>=0]
 summary['modes'].append({'obstacles':mode=='1','races':len(a),'finishers':len(finished),'meanFinishSeconds':statistics.mean(finished),'medianFinishSeconds':statistics.median(finished),'wrecks':sum(int(r['wrecks']) for r in a),'unresolved':sum(int(r['unresolved']) for r in a),'earlyWrecks':sum(int(r['early']) for r in a),'entries':len(a)*6,'maxStallSeconds':max(float(r['longestStallSeconds']) for r in a),'winners':dict(Counter(r['winner'] for r in a))})
for tier in range(5):
 a=[r for r in rows if r['tier']==str(tier)];n=len(a)//2
 wins=[Counter(r['winner'] for r in a if r['obstacles']==m) for m in ['0','1']]
 classes=sorted(set(wins[0])|set(wins[1]))
 item={'tier':tier,'racesPerMode':n,'classes':[],'rotationShares':[]}
 for car in classes:
  before=share(wins[0][car],n);after=share(wins[1][car],n)
  item['classes'].append({'car':car,'beforeWins':wins[0][car],'afterWins':wins[1][car],'beforeShare':before,'afterShare':after,'delta':after-before})
  if changed_share(wins[0][car],wins[1][car],n,rules['winnerShareDeltaMaximum']):alarms.append(f'Tier {tier} {car}: winner share changed by more than {rules["winnerShareDeltaMaximum"]}')
 for rotation in range(6):
  for mode in ['0','1']:
   v=[r for r in a if r['rotation']==str(rotation) and r['obstacles']==mode]
   item['rotationShares'].append({'rotation':rotation,'obstacles':mode=='1','races':len(v),'wins':dict(Counter(r['winner'] for r in v))})
 summary['tiers'].append(item)
before,after=summary['modes']
if unresolved(after['unresolved']):alarms.append('Obstacle-on watchdog survivors: full-resolution gate failed; inspect final speed and recovery state before classifying as stuck')
if early(after['earlyWrecks'],after['entries'],rules['earlyWreckMaximum']):alarms.append('Obstacle-on early-wreck share at or above 5%'+(' (practice stress: campaign target not applicable; retain the rate)' if not campaign else ''))
if after['earlyWrecks']>before['earlyWrecks']:alarms.append('Observed early-wreck count increased')
summary['totalWreckCountDelta']=after['wrecks']-before['wrecks']
summary['pairedChangedWinners']=sum(p['0']['winner']!=p['1']['winner'] for p in by_pair.values())
summary['pairedChangedHashes']=sum(p['0']['hash']!=p['1']['hash'] for p in by_pair.values())
summary['cells']=diversity
raw=source.read_bytes();(out/'races.csv.gz').write_bytes(gzip.compress(raw,mtime=0));summary['rawSha256']=hashlib.sha256(raw).hexdigest()
(out/'summary.json').write_text(json.dumps(summary,indent=2))
table='<table><tr><th>Obstacles</th><th>Races</th><th>Mean finish s</th><th>Wrecks</th><th>Early / entries</th><th>Watchdog survivors</th><th>Longest no-progress s</th></tr>'
for m in summary['modes']:table+=f'<tr><td>{m["obstacles"]}</td><td>{m["races"]}</td><td>{m["meanFinishSeconds"]:.2f}</td><td>{m["wrecks"]}</td><td>{m["earlyWrecks"]} / {m["entries"]}</td><td>{m["unresolved"]}</td><td>{m["maxStallSeconds"]:.2f}</td></tr>'
table+='</table><h2>Winner share: wins / races, by tier</h2><table><tr><th>Class</th><th>Before</th><th>After</th><th>Change pp</th></tr>'
for t in summary['tiers']:
 for c in t['classes']:table+=f'<tr><td>{c["car"]}</td><td>{c["beforeShare"]:.2%}</td><td>{c["afterShare"]:.2%}</td><td>{c["delta"]*100:+.2f}</td></tr>'
table+='</table>'
page=f'''<!doctype html><meta charset="utf-8"><title>Natural obstacles: paired physics</title><style>body{{font:18px system-ui;background:#18211f;color:#eee;max-width:1100px;margin:3rem auto}}table{{border-collapse:collapse}}td,th{{padding:.7rem;border:1px solid #69746b}}a{{color:#e5c584}}</style><h1>Natural obstacles: paired physics</h1><p>{html.escape(summary['scope'])}</p><p>{summary['pairs']} pairs; full course × tier × six-slot rotation cross; {summary['cellSamples']} samples per cell. Minimum distinct-state fraction {summary['minimumDistinctFraction']:.2%}. Exact replay checked for both modes on all 25 courses. Small cells are diagnostic, not precise rates.</p>{table}<h2>Declared alarms</h2><p>{html.escape('; '.join(alarms) or 'No declared numeric alarm fired. This is not an owner quality verdict.')}</p><p><a href="summary.json">Full summary, rotation counts and cell diversity</a> · <a href="races.csv.gz">Raw paired races</a></p><p>Stick performance and owner checks pending. Crucible preserves its narrow ribbon with decoration only.</p>'''
(out/'index.html').write_text(page,encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k not in ['cells','tiers']},indent=2))
