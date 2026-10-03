"""Same-seed physical control for the shared cap change, separate from obstacle effects."""
import csv,gzip,hashlib,html,json,shutil,statistics
from collections import Counter
from pathlib import Path
root=Path(__file__).resolve().parents[1]
control=root/'build/cap10-obstacle-control'
before=control/'build/reports/obstacles/upgraded-campaign/races.csv'
after=root/'build/reports/obstacles/upgraded-campaign/races.csv'
out=root/'evidence/gameplay/campaign/upgrade-control';out.mkdir(parents=True,exist_ok=True)
a=list(csv.DictReader(before.open()));b=list(csv.DictReader(after.open()))
key=lambda r:tuple(r[k] for k in ['obstacles','course','tier','rotation','sample','seed'])
assert len(a)==len(b)==6000 and [key(r) for r in a]==[key(r) for r in b]
unchanged=[(x,y) for x,y in zip(a,b) if int(x['tier'])<3]
assert all(x==y for x,y in unchanged),'An unchanged lower-tier control differs'
summary={'scope':'Rejected headroom candidate runtime, useful funded parts, identical seeds/course/tier/rotation/obstacle factors; only car-upgrade-caps.csv overrides Elite and Champion back to 10. Before/after are 6,000 races each, not new careers. Raw unchanged-tier rows must match exactly. Higher caps are not shipped.',
         'unchangedTierRowsMatched':len(unchanged),'cells':[]}
for mode in ['0','1']:
 for tier in ['3','4']:
    x=[r for r in a if r['obstacles']==mode and r['tier']==tier];y=[r for r in b if r['obstacles']==mode and r['tier']==tier]
    def stats(rows):
        return {'races':len(rows),'winners':dict(Counter(r['winner'] for r in rows)),
                'finishers':sum(int(r['finished']) for r in rows),
                'wrecks':sum(int(r['wrecks']) for r in rows),
                'unresolved':sum(int(r['unresolved']) for r in rows),
                'earlyWrecks':sum(int(r['early']) for r in rows),
                'meanFinishSeconds':statistics.mean(float(r['meanFinishSeconds']) for r in rows)}
    old=stats(x);new=stats(y)
    summary['cells'].append({'obstacles':mode=='1','tier':int(tier),'before':old,'after':new,
        'winnerShareDeltaPoints':{car:100*(new['winners'].get(car,0)-old['winners'].get(car,0))/len(x) for car in sorted(set(old['winners'])|set(new['winners']))}})
raw=before.read_bytes();(out/'cap10-races.csv.gz').write_bytes(gzip.compress(raw,mtime=0))
summary['cap10RawSha256']=hashlib.sha256(raw).hexdigest();summary['finalRawSha256']=hashlib.sha256(after.read_bytes()).hexdigest()
(out/'car-upgrade-caps-before.csv').write_text((control/'data/car-upgrade-caps.csv').read_text().rstrip()+'\n')
shutil.copyfile(root/'build/campaign-balanced-snapshot/5/data/car-upgrade-caps.csv',out/'car-upgrade-caps-after.csv')
shutil.copyfile(control/'cap10-control.log',out/'cap10-control.log')
(out/'summary.json').write_text(json.dumps(summary,indent=2))
table='<table><tr><th>Barriers</th><th>Tier</th><th>Class</th><th>Old cap wins / races</th><th>Candidate cap wins / races</th><th>Change pp</th></tr>'
for cell in summary['cells']:
    for car,delta in cell['winnerShareDeltaPoints'].items():
        values=[cell['obstacles'],cell['tier'],car,f"{cell['before']['winners'].get(car,0)} / {cell['before']['races']}",f"{cell['after']['winners'].get(car,0)} / {cell['after']['races']}",f'{delta:+.2f}']
        table+='<tr>'+''.join('<td>'+html.escape(str(v))+'</td>' for v in values)+'</tr>'
table+='</table>'
(out/'index.html').write_text('<!doctype html><meta charset="utf-8"><title>Shared upgrade cap control</title><style>body{font:18px system-ui;background:#eee7d6;max-width:1100px;margin:2rem auto;padding:1rem}table{border-collapse:collapse}td,th{border:1px solid #999;padding:.6rem}</style><h1>Shared upgrade cap control</h1><p>'+html.escape(summary['scope'])+'</p>'+table+'<p>Each late tier has 600 races per mode, equally crossing all 25 courses and six grid rotations. These funded short races do not establish human fairness or career pacing. Raw rows and all completion/wreck counts: <a href="summary.json">summary</a>, <a href="cap10-races.csv.gz">old-cap rows</a>. Final rows are retained in the upgraded obstacle gallery.</p>',encoding='utf-8')
print(json.dumps(summary,indent=2))
