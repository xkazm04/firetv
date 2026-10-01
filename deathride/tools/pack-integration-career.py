"""Archive an audited integration career library; never creates or certifies race outcomes."""
import argparse, csv, gzip, hashlib, json, shutil, statistics, xml.etree.ElementTree as ET
from pathlib import Path

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--report',type=Path,default=root/'core/build/reports/ip-career/4')
parser.add_argument('--output',type=Path,default=root/'evidence/phase2/ip-measured')
args=parser.parse_args();report=args.report;output=args.output;output.mkdir(parents=True,exist_ok=True)
audit=json.loads((report/'audit.json').read_text(encoding='utf-8'))
assert audit['physicalRaces']==15120 and audit['sampledCareers']==6000
careers=list(csv.DictReader((report/'careers.csv').open(encoding='utf-8')))
distribution=[]
for difficulty in range(3):
    rows=[r for r in careers if int(r['difficulty'])==difficulty]
    hours=sorted(float(r['hours']) for r in rows)
    distribution.append(dict(difficulty=difficulty,samples=len(rows),completed=sum(r['completed']=='true' for r in rows),
        minimumHours=hours[0],p05Hours=hours[int(.05*(len(hours)-1))],medianHours=statistics.median(hours),
        p95Hours=hours[int(.95*(len(hours)-1))],maximumHours=hours[-1],
        belowFiveHours=sum(h<5 for h in hours),aboveEightHours=sum(h>8 for h in hours)))
(report/'duration-distribution.json').write_text(json.dumps(distribution,indent=2)+'\n',encoding='utf-8')
for name in ['physical.csv','careers.csv','timeline.csv']:
    (output/(name+'.gz')).write_bytes(gzip.compress((report/name).read_bytes(),mtime=0))
for name in ['audit.json','summary.csv','curves.csv','policies.csv','funded-boss-fields.csv','field-garages.csv','duration-distribution.json','pacing.png','pacing.svg','c4-duel-probe.sav']:
    shutil.copyfile(report/name,output/name)
tests={}
for module in ['core','link','game']:
    paths=list((root/module/'build/test-results/test').glob('TEST-*.xml'))
    suites=[ET.parse(p).getroot() for p in paths]
    tests[module]={key:sum(int(s.get(key,'0')) for s in suites) for key in ['tests','failures','errors','skipped']}
    assert tests[module]['tests']>0 and all(tests[module][key]==0 for key in ['failures','errors','skipped'])
    target=output/'test-results'/module;target.mkdir(parents=True,exist_ok=True)
    for path in paths:shutil.copyfile(path,target/path.name)
logs=output/'logs';logs.mkdir(exist_ok=True)
for path in root.glob('ip-*.txt'):
    raw=path.read_bytes();content=raw.decode('utf-16' if raw.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig')
    (logs/path.name).write_text('\n'.join(line.rstrip() for line in content.splitlines()).rstrip()+'\n',encoding='utf-8')
assert 'BUILD SUCCESSFUL' in (logs/'ip-release-build.txt').read_text(encoding='utf-8')
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=set()
for directory in ['core/src','link/src','game/src','app/src','controller']:
    files.update(p for p in (root/directory).rglob('*') if p.is_file())
files.update(root.glob('*.gradle.kts'));files.update(root.glob('*/build.gradle.kts'))
files.update(root/'tools'/name for name in ['author-career.py','author-tracks.py','audit-boss-ceilings.py','audit-career.py','integration-career-check.mjs','pack-integration-career.py'])
manifest=dict(scope='Integration endurance and promotion fields; simulation evidence, not owner acceptance',tests=tests,
    apkSha256=digest(root/'app/build/outputs/apk/debug/app-debug.apk'),physicalSeedsPerCell=4,
    physicalRaces=audit['physicalRaces'],replayedCells=audit['replayedCells'],sampledCareers=audit['sampledCareers'],
    sourceSha256={p.relative_to(root).as_posix():digest(p) for p in sorted(files)},
    reportSha256={p.name:digest(p) for p in sorted(report.iterdir()) if p.is_file()},
    deviceEvidenceSha256={p.name:digest(p) for p in sorted((root/'evidence/phase2').glob('ip-*')) if p.is_file()},
    calibrationSha256={p.relative_to(root).as_posix():digest(p) for p in sorted((root/'evidence/phase2/ip-calibration').rglob('*')) if p.is_file()},
    limits=audit['limits'])
(output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
(output/'README.txt').write_text("""Integration career evidence, 2026-10-01
15,120 actual fixed-step races, four independent seeds per cell, 3,780 first-seed replays.
6,000 sampled earned careers (2,000 each Rookie/Club/Pro) resample the physical library.
The seven legal spending caps optimize completion then purchased PR, not global optimality.
Raw CSVs use deterministic gzip. audit-career.py accepts this directory directly;
copy to scratch first because the audit regenerates its JSON/curves/plots.
The independent monetary audit checks every sampled settlement.
The device opening uses a pre-budget APK whose hash is in ip-calibration/device-apk.json;
its core/format matches this report. Subsequent result-label and I2 changes are
presentation only. The completed 24-lap duel uses this exact IP release APK and an
isolated funded fixture; its source/hash are in ip-calibration/duel-fixture.json.
See the I2 manifest for the final soak APK and G2 for all limits.
Logs retain failed preflight assertions as well as final successful builds.
PowerShell can label adb progress on stderr NativeCommandError; inspect JSON checks.
The finale save is an explicitly funded fixture, not an earned device campaign.
No owner feel claim, no art generation, no push.
""",encoding='utf-8')
print(json.dumps(dict(output=str(output),tests=tests,apkSha256=manifest['apkSha256']),indent=2))
