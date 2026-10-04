"""Bind the G2 handoff to checked source and retained evidence, without assigning felt."""
import hashlib,json,subprocess,xml.etree.ElementTree as ET
from pathlib import Path

root=Path(__file__).resolve().parents[1];repo=root.parent
output=root/'evidence/phase2/i3';output.mkdir(exist_ok=True)
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
git=lambda *args:subprocess.check_output(['git',*args],cwd=repo,text=True).strip()
tests={}
for module in ['core','link','game']:
    suites=[ET.parse(p).getroot() for p in (root/module/'build/test-results/test').glob('TEST-*.xml')]
    tests[module]={k:sum(int(s.get(k,'0')) for s in suites) for k in ['tests','failures','errors','skipped']}
    assert tests[module]['tests'] and all(tests[module][k]==0 for k in ['failures','errors','skipped'])
for name in ['i3-release-build.txt','i3-art-tests.txt']:
    p=root/name;raw=p.read_bytes()
    content=raw.decode('utf-16' if raw.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig')
    (output/name).write_text('\n'.join(line.rstrip() for line in content.splitlines()).rstrip()+'\n',encoding='utf-8')
assert 'BUILD SUCCESSFUL' in (output/'i3-release-build.txt').read_text(encoding='utf-8')
files=set()
for folder in ['core/src','link/src','game/src','app/src','desktop/src','controller','assets/phase2-v1']:
    files.update(p for p in (root/folder).rglob('*') if p.is_file())
files.update(root.glob('*.gradle.kts'));files.update(root.glob('*/build.gradle.kts'))
reports=[repo/'docs/concepts/deathride'/name for name in ['G2-REPORT.md','I1-atlas-renderer.md','V1-verge-and-lint.md','IP-career-pacing.md','I2-stick-budget.md','I3-owner-handoff.md']]
reports += [root/'README.md',root/'OWNER-CHECKS.md',repo/'docs/concepts/DEATH-RIDE-PHASE2.md']
apk=root/'app/build/outputs/apk/debug/app-debug.apk'
tested=root/'build/integration-stage/i2-tested.apk'
assert digest(apk)==digest(tested), 'Final build differs from measured APK'
manifest=dict(scope='G2 implementation and evidence handoff; owner quality/feel pending',
    branch=git('branch','--show-current'),parentBeforeI3=git('rev-parse','HEAD'),
    waveCommits={wave:git('rev-parse',f'integration-{wave}-20261001') for wave in ['i1','v1','ip','i2']},
    tests=tests,buildApkSha256=digest(apk),soakApkSha256=digest(tested),
    buildMatchesSoakApk=digest(apk)==digest(tested),
    sourceSha256={p.relative_to(root).as_posix():digest(p) for p in sorted(files)},
    artBudgetSnapshotSha256=digest(root/'evidence/phase2/i3-art-budget-snapshot.json'),
    reportSha256={p.relative_to(repo).as_posix():digest(p) for p in reports},
    evidenceManifestSha256={p.relative_to(root).as_posix():digest(p) for p in sorted((root/'evidence/phase2').rglob('*manifest*.json')) if p.parent!=output},
    newImages=0,newVideos=0,ownerGate='pending',pushed=False)
(output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:manifest[k] for k in ['branch','waveCommits','tests','buildApkSha256','soakApkSha256','buildMatchesSoakApk','ownerGate']},indent=2))
