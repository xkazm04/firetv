"""Bind the final I2 evidence to source/APK; preserve failed transport/tail gates."""
import gzip,hashlib,json,shutil,subprocess,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parents[1];evidence=root/'evidence/phase2';output=evidence/'i2';output.mkdir(exist_ok=True)
summary=json.loads((evidence/'i2-soak-summary.json').read_text(encoding='utf-8'))
assert summary['ranFullDuration']
assert summary['memoryBudget']['withinLimit'] and summary['memoryBudget']['growthWithinLimit']
assert summary['textures']['allWithinLimit'] and summary['frameTargets']['activeMediansNear16_7']
# Preserve exact raw observations without million-line review diffs.
for folder in [evidence,evidence/'i2-baseline',evidence/'i2-pre-effects',evidence/'i2-full-rate']:
    raw=folder/'i2-soak.json';packed=raw.with_suffix('.json.gz')
    payload=raw.read_bytes();packed.write_bytes(gzip.compress(payload,mtime=0))
    assert gzip.decompress(packed.read_bytes())==payload

digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
apk=root/'build/integration-stage/i2-tested.apk';assert digest(apk)==summary['apkSha256']
tests={}
for module in ['core','link','game']:
    paths=list((root/module/'build/test-results/test').glob('TEST-*.xml'));suites=[ET.parse(p).getroot() for p in paths]
    tests[module]={key:sum(int(s.get(key,'0')) for s in suites) for key in ['tests','failures','errors','skipped']}
    assert tests[module]['tests']>0 and all(tests[module][key]==0 for key in ['failures','errors','skipped'])
    target=output/'test-results'/module;target.mkdir(parents=True,exist_ok=True)
    for p in paths:shutil.copyfile(p,target/p.name)
logs=output/'logs';logs.mkdir(exist_ok=True)
for p in root.glob('i2-*.txt'):
    raw=p.read_bytes();s=raw.decode('utf-16' if raw.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig')
    (logs/p.name).write_text('\n'.join(line.rstrip() for line in s.splitlines()).rstrip()+'\n',encoding='utf-8')
assert 'BUILD SUCCESSFUL' in (logs/'i2-release-build.txt').read_text(encoding='utf-8')
files=set()
for folder in ['core/src','link/src','game/src','app/src','desktop/src','controller']:
    files.update(p for p in (root/folder).rglob('*') if p.is_file())
files.update(root.glob('*.gradle.kts'));files.update(root.glob('*/build.gradle.kts'))
files.update(root/'tools'/name for name in ['integration-soak.mjs','summarize_stick_soak.py','summarize_integration_soak.py','atlas-check.mjs','duel-hud-check.mjs','pack-integration-device.py'])
manifest=dict(scope='I2 one preheated AFTKM; measured memory/frame behavior, not owner feel',
    sustainedLoadChecksPassed=summary['checksPassed'],sustainedLoadFailure=summary.get('failure'),
    tests=tests,apkSha256=digest(apk),sourceSha256={p.relative_to(root).as_posix():digest(p) for p in sorted(files)},
    evidenceSha256={p.relative_to(evidence).as_posix():digest(p) for p in sorted(evidence.rglob('i2-*')) if p.is_file() and p.name!='i2-soak.json'},
    artCatalogSha256=digest(root/'assets/phase2-v1/catalog.json'),referenceApprovalsSha256=digest(root/'art/reference-approvals.json'),
    textureAndMemoryLimits=summary['memoryBudget'],frameTargets=summary['frameTargets'],
    baselineDifference='The baseline retains I1 TrackScene preparation and I1 AtlasEffects/CombatPainter with unconditional procedural effects. Budget telemetry is already present. The pre-effects run changes preparation only; the full-rate run removes duplicate effects and lowers the cosmetic pool. The final run additionally checks PNG budgets before decoding and rejects malformed animation/region metadata; the physical report has finished, so it does not isolate loader versus host-load effects.',
    baselineProbeDifference='Final probe additionally records rejected-ack timestamps and host pump stalls; traffic frequency and acceptance gates are unchanged.',
    baselineTrackSceneSha256=hashlib.sha256(subprocess.check_output(['git','show','integration-i1-20261001:deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt'],cwd=root)).hexdigest(),
    limits=['Archiving a full-duration observation does not turn failed soak gates into passes; sustainedLoadChecksPassed and failure remain authoritative.','Frames are render-entry intervals, not optical latency.','Preheated single Stick, ordinary LAN; no cold/contended/other-device qualification.','Future car states/liveries are absent; their reserved pages were not measured.','Active and transition maxima and the original p95 target remain separate findings.'])
(output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(output=str(output),apkSha256=manifest['apkSha256'],tests=tests),indent=2))
