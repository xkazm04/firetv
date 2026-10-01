"""Independent raw-row checks for the C3 fixed-step experiment (stdlib only)."""
import csv, json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
directory=root/'core/build/reports/combat-depth/2000'
summary=list(csv.DictReader((directory/'summary.csv').open()))
assert len(summary)==4
report=[]
for s in summary:
    rows=list(csv.DictReader((directory/(s['scenario']+'.csv')).open()))
    assert len(rows)==2000 and len({r['seed'] for r in rows})==2000 and len({r['hash'] for r in rows})==2000
    assert all(int(r['unresolved'])==0 and int(r['oneShots'])==0 and float(r['seconds'])<=180 for r in rows)
    assert all((float(r['hp'])==0 and int(r['laps'])==0)==(r['earlyWreck']=='true') for r in rows)
    early=sum(r['earlyWreck']=='true' for r in rows);finished=sum(r['finished']=='true' for r in rows)
    assert early==int(s['earlyWrecks']) and finished==int(s['finished']) and early/2000<float(.05)
    assert sum(int(r['shots']) for r in rows)==int(s['shots'])
    assert abs(sum(float(r['seconds']) for r in rows)/2000-float(s['meanSeconds']))<1e-8
    report.append({'scenario':s['scenario'],'races':2000,'earlyWrecks':early,'earlyRate':early/2000,'leadFinishes':finished,'meanSeconds':float(s['meanSeconds'])})
result={'actualRaces':8000,'reference':'Lead entrant uses Club AI decisions under the same physical rules; this is a proxy for a reasonable driver, not a human sample','scenarios':report,'limitations':['Four stock-field scenarios, not every course/loadout','First-lap wreck counts are finite seeded-sample evidence','Owner fairness and feel not measured']}
(directory/'audit.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
