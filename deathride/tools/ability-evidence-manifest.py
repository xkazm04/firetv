"""Bind final report/device evidence to the current compiled core, source and APK."""
import argparse
import csv
import datetime
import hashlib
import json
import subprocess
import sys
import zipfile
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('reports', type=Path)
parser.add_argument('evidence', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
reports, evidence = args.reports.resolve(), args.evidence.resolve()
digest = lambda data: hashlib.sha256(data).hexdigest()
def source_digest(path):
    raw = path.read_bytes()
    try:
        raw.decode('utf-8')
        if b'\0' not in raw:
            raw = raw.replace(b'\r\n', b'\n')
    except UnicodeDecodeError:
        pass
    return digest(raw)
load = lambda path: json.loads(path.read_text(encoding='utf-8'))
compiled = root/'core/build/classes/kotlin/main'
data = root/'core/src/main/resources/data'
fingerprint = hashlib.sha256()
for p in sorted((p for p in compiled.rglob('*') if p.is_file()), key=lambda p: str(p.relative_to(compiled))):
    fingerprint.update(p.read_bytes())
for p in sorted((p for p in data.rglob('*') if p.is_file()), key=str):
    fingerprint.update(p.read_bytes())
runs = {p.name: load(p) for p in reports.glob('run-*.json')}
assert len(runs) == 3 and all(r['coreFingerprint'] == fingerprint.hexdigest() for r in runs.values())
apk = root/'app/build/outputs/apk/debug/app-debug.apk'
apk_hash = digest(apk.read_bytes())
installed = load(evidence/'release-installed.json')
device = load(evidence/'release-soak/summary.json')
assert installed['package'] == 'dev.deathride.abilities'
assert apk_hash == installed['localSha256'] == installed['installedSha256'] == device['apkSha256']
mine = next(r for r in csv.DictReader((data/'weapons.csv').open()) if r['id'] == 'Mine')
assert device['mineBlastRadiiM'] == device['mineTriggerRadiiM'] == [float(mine['radiusM'])]
assert device['mineShotsAcrossRounds'] > 0 and device['peakLiveMines'] > 0
packaged = {}
with zipfile.ZipFile(apk) as z:
    for p in sorted(data.rglob('*.csv')):
        name = 'data/'+p.relative_to(data).as_posix()
        actual = z.read(name)
        assert actual == p.read_bytes(), name
        packaged[name] = digest(actual)
assert packaged
tests = load(evidence/'build-tests.json')
assert all(t['tests'] > 0 and t['failures'] == t['errors'] == t['skipped'] == 0 for t in tests.values())
balance = load(reports/'audit.json')
assert balance['numericAcceptancePassed']
controller = load(evidence/'controller-release/result.json')
controller_execution = load(evidence/'controller-release/execution.json')
assert controller_execution['apkSha256'] == apk_hash
assert controller_execution['resultSha256'] == digest((evidence/'controller-release/result.json').read_bytes())
assert len(controller['checks']) == 6 and controller['disconnectCleared']
assert all(c['independentPointers'] and c['settingsNeutral'] and c['uses'] > 0 for c in controller['checks'])
sources = {}
for module in ('core','link','game','app','desktop'):
    for p in sorted((root/module/'src').rglob('*')):
        if p.is_file():
            sources[p.relative_to(root).as_posix()] = source_digest(p)
for folder, patterns in [('controller', ('*.html','*.json','*.webmanifest')), ('tools', ('*.py','*.mjs','package.json','package-lock.json'))]:
    for pattern in patterns:
        for p in (root/folder).glob(pattern):
            sources[p.relative_to(root).as_posix()] = source_digest(p)
for p in list(root.glob('*.kts'))+list(root.glob('*.properties'))+list(root.glob('*/build.gradle.kts')):
    sources[p.relative_to(root).as_posix()] = source_digest(p)
target = evidence/'manifest.json'
artifacts = {p.relative_to(evidence).as_posix(): digest(p.read_bytes()) for p in sorted(evidence.rglob('*')) if p.is_file() and p != target}
result = {'wave': 'A3', 'generatedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'baseCommit': subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),
          'truth': 'Fixed-step AI proxy; measured single-Stick/controller behavior; no owner feel verdict.',
          'toolVersions': {'java': subprocess.run(['java','-version'],capture_output=True,text=True).stderr.splitlines()[0],
                           'python': sys.version, 'node': subprocess.check_output(['node','--version'],text=True).strip()},
          'tests': tests, 'compiledCoreAndDataFingerprint': fingerprint.hexdigest(), 'reportRuns': runs,
          'racesAudited': balance['racesAudited'], 'balanceFindings': balance['findings'],
          'deviceGates': device['gates'], 'controller': controller,
          'appId': installed['package'], 'apkSha256': apk_hash, 'packagedData': packaged,
          'sourceHashConvention': 'UTF-8 text normalized to LF, other source files exact bytes; APK/compiled/data/evidence hashes are exact stored bytes.',
          'sources': sources, 'evidenceSha256': artifacts}
target.write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8', newline='\n')
print(json.dumps({k:result[k] for k in ('tests','racesAudited','balanceFindings','deviceGates','apkSha256')}, indent=2))
