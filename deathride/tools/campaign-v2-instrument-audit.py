"""Publish the actual gate response to planted defects, not just a test count."""
import json
from pathlib import Path
from test_campaign_v2_metrics import CampaignV2MetricsTest
from campaign_v2_metrics import roster_review

fixture=CampaignV2MetricsTest();weights=fixture.weights
results=[]
def record(name,mutate,key,expected):
    rows=fixture.rows();mutate(rows);r=roster_review(rows,weights,4)
    value=r[key] if key in r else all(t['dominancePass'] for t in r['tiers'])
    assert value==expected,(name,value)
    results.append(dict(plantedCase=name,gate=key,result=value,expected=expected,
        maximumWinnerShare=max(max(t['mixedWinnerShare'].values()) for t in r['tiers'])))
record('balanced synthetic control',lambda rows:None,'dominancePass',True)
record('all wins assigned to A: reachable rate 1.0',lambda rows:[r.update(winner='A') for r in rows],'dominancePass',False)
record('constant terminal hashes',lambda rows:[r.update(hash='same') for r in rows],'seedDiversity',False)
record('missing rotation observation',lambda rows:rows.pop(),'completeCross',False)
record('rotations alias the same three labels',lambda rows:[r.update(rotation=str(i%3)) for i,r in enumerate(rows)],'completeCross',False)
record('correct labels but class assignments never rotate',lambda rows:[r.update(cars='A:10;A:10;A:10;B:11;B:11;B:11') for r in rows],'actualClassSlotCross',False)
record('one unpaired seed block',lambda rows:rows[-1].update(seed='99'),'pairedRotations',False)
record('one unresolved entrant',lambda rows:rows[0].update(unresolved='1'),'allResolved',False)
target=Path(__file__).resolve().parents[1]/'evidence/campaign/design-v2/dv2/instrument-audit.json'
target.write_text(json.dumps(dict(scope='Synthetic injected defects, never campaign outcomes',cases=results),indent=2)+'\n',encoding='utf-8')
print('Published eight reachable gate/control responses')
