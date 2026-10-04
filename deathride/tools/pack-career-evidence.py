"""Archive the final C4 report with source hashes; does not run or certify a simulation."""
import gzip
import hashlib
import json
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parents[1]
report = root / 'core/build/reports/ash-circuit/8'
output = root / 'evidence/phase2/c4-measured'
output.mkdir(parents=True, exist_ok=True)
audit = json.loads((report / 'audit.json').read_text(encoding='utf-8'))
assert audit['physicalRaces'] == 30240 and audit['sampledCareers'] == 6000
assert audit['monetarySettlementsIndependentlyRecomputed'] == 214470
for name in ['physical.csv', 'careers.csv', 'timeline.csv']:
    (output / (name + '.gz')).write_bytes(gzip.compress((report / name).read_bytes(), mtime=0))
for name in ['audit.json', 'summary.csv', 'curves.csv', 'policies.csv',
             'funded-boss-fields.csv', 'field-garages.csv', 'pacing.png', 'pacing.svg',
             'c4-duel-probe.sav']:
    shutil.copyfile(report / name, output / name)

tests = {}
for module in ['core', 'link']:
    suites = [ET.parse(p).getroot().attrib for p in
              (root / module / 'build/test-results/test').glob('TEST-*.xml')]
    tests[module] = {key: sum(int(s[key]) for s in suites)
                     for key in ['tests', 'failures', 'errors', 'skipped']}
    assert tests[module]['tests'] == (83 if module == 'core' else 3)
    assert all(tests[module][k] == 0 for k in ['failures', 'errors', 'skipped'])
    test_dir = output / 'test-results' / module
    test_dir.mkdir(parents=True, exist_ok=True)
    for p in (root / module / 'build/test-results/test').glob('TEST-*.xml'):
        shutil.copyfile(p, test_dir / p.name)

logs = output / 'logs'
logs.mkdir(exist_ok=True)
for path in root.glob('c4-*.txt'):
    raw = path.read_bytes()
    content = raw.decode('utf-16' if raw.startswith((b'\xff\xfe', b'\xfe\xff')) else 'utf-8-sig')
    content = '\n'.join(line.rstrip() for line in content.replace('\r', '').splitlines()).rstrip() + '\n'
    (logs / path.name).write_bytes(content.encode('utf-8'))
assert 'BUILD SUCCESSFUL' in (logs / 'c4-release-build.txt').read_text(encoding='utf-8')

files = set()
for directory in ['core/src', 'link/src', 'game/src', 'app/src', 'controller']:
    files.update(p for p in (root / directory).rglob('*') if p.is_file())
files.update(root.glob('*.gradle.kts'))
files.update(root.glob('*/build.gradle.kts'))
files.update(root / 'tools' / name for name in
             ['author-career.py', 'audit-career.py', 'career-v2-check.mjs', 'pack-career-evidence.py'])
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest = {
    'scope': 'C4 final measured sample; not full pacing acceptance or human feel',
    'tests': tests,
    'apkSha256': digest(root / 'app/build/outputs/apk/debug/app-debug.apk'),
    'physicalRaces': audit['physicalRaces'],
    'sampledCareers': audit['sampledCareers'],
    'sourceSha256': {p.relative_to(root).as_posix(): digest(p) for p in sorted(files)},
    'reportSha256': {p.name: digest(p) for p in sorted(report.iterdir()) if p.is_file()},
    'deviceEvidenceSha256': {p.name: digest(p) for p in
                            sorted((root / 'evidence/phase2').glob('c4-*')) if p.is_file()},
    'limits': audit['limits'],
}
(output / 'manifest.json').write_bytes((json.dumps(manifest, indent=2) + '\n').encode('utf-8'))
(output / 'README.txt').write_bytes(('''C4 measured evidence, 2026-10-01
Final: 30,240 actual physical races, eight seeds per cell, 6,000 sampled careers.
The final-runtime-replay.json comparison covers 3,780 independent final-runtime rows.
The full report also replays the first seed in every physical cell.
audit.json independently checks physical facts, monetary settlements and proposed targets.
Raw CSVs are gzip compressed; audit-career.py accepts this directory directly.
Re-running the auditor writes audit/curves/plots, so copy evidence to a scratch directory first.
The seven-policy comparison optimizes completion then purchased PR, not minimum race count.
Source hashes and the final installed APK hash are in manifest.json.
Device records and screenshots are in the parent directory, c4-*-device.json and PNGs.
The duel save is an explicitly authored, funded fixture, not an earned campaign.
The opening device screenshot precedes the story/progress-bar layout correction;
migration/menu captures show the corrected layout. The opening race outcomes remain valid.
logs/ retains intermediate failures and calibration output as well as final successful gates.
PowerShell wrappers can mark adb pull's stderr progress as NativeCommandError; inspect
the JSON assertions and final native-process exit logs for device test outcomes.
c4-calibration/ beside this directory preserves earlier/rejected economy samples.
Their data must not be combined with the final sample.
Five-to-eight-hour duration, stronger boss dips and some tier intervals remain unmet.
See docs/concepts/deathride/C4-ash-circuit.md for methods, results and remaining work.
No Grok spend; no art changes; no push.
''').encode('utf-8'))
print(json.dumps({'output': str(output), 'tests': tests,
                  'apkSha256': manifest['apkSha256']}, indent=2))
