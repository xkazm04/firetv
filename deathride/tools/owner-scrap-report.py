"""Publish the changed-slot evidence without relabeling historical whole-campaign runs."""
import csv
import hashlib
import io
import json
import re
import statistics
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence/tracks/owner-scrap-e'
BASE = sys.argv[1]
def rows(path):
    return list(csv.DictReader(path.open(encoding='utf-8-sig', newline='')))
def old(path):
    return subprocess.check_output(['git','show',BASE+':deathride/'+path],cwd=ROOT).decode('utf-8-sig')
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

boss=rows(OUT/'boss.csv'); pacing=rows(OUT/'pacing.csv')
proof=json.loads((OUT/'proof/scrap-7-e.json').read_text())
shape=json.loads((OUT/'shape.json').read_text())
assert len(boss)==96 and len(pacing)==144
historical=rows(ROOT/'evidence/tracks/owner-part4/scrap-boss-choices.csv')
assert boss==[r for r in historical if r['candidate']=='scrap-7-e']
assert proof['freshRun'] and proof['sixCarTrials']==72 and not proof['flags']
assert proof['repeatHashMatches'] and shape['installedEqualsComposer']
assert all(g['status']=='pass' for g in shape['gates'])
priorProof=json.loads(old('tracks/candidates/proof-final/scrap-7-e.json'))
assert all(proof[k]==priorProof[k] for k in ['digest','aggregate','cleanFinishSeconds','lapWinnerSeconds','repeatHashMatches'])
data=ROOT/'core/src/main/resources/data'
before=list(csv.DictReader(io.StringIO(old('core/src/main/resources/data/campaign.csv'))))
after=rows(data/'campaign.csv')
assert len(after)==35
for a,b in zip(before,after):
    assert {k:v for k,v in a.items() if k!='course'}=={k:v for k,v in b.items() if k!='course'}
    assert b['course']==('scrap-7-e' if a['id']=='scrap-7' else a['course'])
beforeRegions=list(csv.DictReader(io.StringIO(old('core/src/main/resources/data/region.csv'))))
for a,b in zip(beforeRegions,rows(data/'region.csv')):
    a['defaultCourses']=a['defaultCourses'].replace('scrap-7-f','scrap-7-e')
    assert a==b
beforeIds=[r['id'] for r in csv.DictReader(io.StringIO(old('core/src/main/resources/data/tracks.csv')))]
assert [r['id'] for r in rows(data/'tracks.csv')]==['scrap-7-e' if c=='scrap-7-f' else c for c in beforeIds]
protected=['core/src/main/kotlin/dev/deathride/core/ProfileStore.kt','core/src/main/kotlin/dev/deathride/core/Campaign.kt','core/src/main/kotlin/dev/deathride/core/AshCircuit.kt']
for path in protected:
    assert (ROOT/path).read_text(encoding='utf-8')==old(path)
bossSummary=[]
for skill in range(3):
    group=[r for r in boss if int(r['skill'])==skill]
    bossSummary.append(dict(skill=skill,trials=len(group),wins=sum(r['first']=='true' for r in group),beatBoss=sum(r['beatBoss']=='true' for r in group),early=sum(r['early']=='true' for r in group),unresolved=sum(int(r['unresolved']) for r in group)))
assert [r['wins'] for r in bossSummary]==[4,2,0]
paceSummary=[]
for build in ['stock','developed']:
    group=[r for r in pacing if r['build']==build]
    seconds=statistics.median(float(r['winnerSeconds']) for r in group if float(r['winnerSeconds'])>=0)
    paceSummary.append(dict(build=build,trials=len(group),winnerMedianSeconds=seconds,targetSeconds=[240,360],pacingPass=240<=seconds<=360,
        unresolvedCars=sum(int(r['unresolved']) for r in group),early=sum(r['earlyLead']=='true' for r in group),oneShots=sum(int(r['oneShots']) for r in group)))
result=dict(baselineCommit=BASE,assignment='scrap-7-e',ownerStatus='applied',balanceStatus='flagged',stableEvents=35,playableCourses=38,
    catalogPositionsPreserved=True,regionAttachmentsPreserved=True,saveAndPromotionCodeUnchanged=True,
    sixCar=dict(trials=72,cleanTrials=3,cleanMedianSeconds=proof['cleanFinishSeconds']['p50'],combatMedianSeconds=proof['lapWinnerSeconds']['p50'],early=proof['aggregate']['earlyLeadWreck'],stalls=proof['aggregate']['stuck'],timeouts=proof['aggregate']['timeouts'],flags=proof['flags'],repeatHashMatches=True,rotationDifferenceSeconds=proof['rotationReferenceDifferenceSeconds']),
    shape=dict(gates=shape['gates'],distinctRetainedPeers=len(shape['otherRetainedComparisons'])),boss=bossSummary,bossAll96RowsMatchHistorical=True,stressMatchesHistorical=True,pacing=paceSummary,
    scope='Changed slot only; the earlier full campaign study used scrap-7-f. No new whole-career balance claim.',
    unresolvedPacingRows=[r for r in pacing if int(r['unresolved'])>0],
    sha256={p.relative_to(OUT).as_posix():digest(p) for p in [OUT/'boss.csv',OUT/'pacing.csv',OUT/'shape.json',OUT/'proof/scrap-7-e.json',OUT/'proof/scrap-7-e-trials.ndjson.gz']})
(OUT/'summary.json').write_text(json.dumps(result,indent=2)+'\n')
balancePath=ROOT/'tracks/candidates/scrap-boss-balance.json'
balance=json.loads(balancePath.read_text());balance['candidates']['scrap-7-e']=bossSummary
balance['ownerDecision']='scrap-7-e Keep; scrap-7-d and scrap-7-f Reject and archived'
balance['selectedCourseRerun']=dict(source='evidence/tracks/owner-scrap-e/boss.csv',sha256=digest(OUT/'boss.csv'),trials=96,allRowsMatchHistorical=True)
balancePath.write_text(json.dumps(balance,indent=2)+'\n')
report=ROOT/'tracks/atlas/owner-triage.html'
body=report.read_text(encoding='utf-8')
body=re.sub(r'<section id="scrap-e-update">.*?</section>', '', body, flags=re.S)
body=body.replace('Scrap-7-f is provisional and awaits the owner.', 'The historical study used scrap-7-f; the owner subsequently selected e (see the current assignment above).')
body=body.replace('provisional-owner-review','historical assignment; superseded by e')
body=body.replace('after uses the final assignments and hunter fix.', 'the historical after study uses the part-4 assignments (including f) and hunter fix.')
section='''<section id="scrap-e-update"><h2>Current owner decision: scrap-7-e assigned</h2>
<p>Section 4 applied: e Keep; d/f Reject and archived. All 35 stable event IDs and region attachments remain. Three practice alternates remain available. First place is still required for boss promotion.</p>
<p><strong>Fresh matched boss diagnostic: Rookie 4/32, Club 2/32, Pro 0/32 first-place wins.</strong> All 96 races resolved; all raw rows and hashes match the earlier e diagnostic. This remains a balance concern requiring separate tuning.</p>
<p>Installed shape/lint and boss-complexity gates pass; distinct from all 36 other retained composer roads. Fresh six-car proof: 72 stress races plus three clean traversals, clean/combat medians 264.42/244.17 seconds within 240–360; nine early lead wrecks, two stalls, zero race timeouts, exact replay and rotation pass.</p>
<p>Fresh equal-peer campaign-damage pacing (72 stock + 72 developed races): stock winner median 243.47 seconds passes; developed 211.97 seconds is below target. One stock-field car remains unresolved at the 420-second watchdog; zero developed unresolved cars, early lead wrecks or one-shot kills. These flags are retained.</p>
<p><a href="../../evidence/tracks/owner-scrap-e/summary.json">Fresh changed-slot measurements</a> · <a href="scrap-7.html">Recorded decision and archive downloads</a></p>
<p><strong>Historical scope below:</strong> the full campaign, class and progression comparison used f. It has not been rerun for this short assignment and is not evidence of current whole-campaign balance.</p></section>'''
body=body.replace('</nav>','</nav>'+section,1)
report.write_text(body,encoding='utf-8')
print(json.dumps({k:result[k] for k in ['assignment','stableEvents','boss','pacing','scope']},indent=2))
