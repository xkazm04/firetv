"""Bind merge checks, JVM reports and installed audio to the consolidated APK; no device claims."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import shutil
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence/merge-campaign-audio'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def text(path):
    data = path.read_bytes()
    return data.decode('utf-16' if data.startswith((b'\xff\xfe', b'\xfe\xff')) else 'utf-8-sig')


assert 'BUILD SUCCESSFUL' in text(OUT / 'build-final.log')
tests = {}
regressions = []
for module in ['core', 'link', 'game']:
    files = sorted((ROOT / module / 'build/test-results/test').glob('TEST-*.xml'))
    assert files, module
    suites = [ET.parse(file).getroot() for file in files]
    totals = {key: sum(int(s.get(key, 0)) for s in suites)
              for key in ['tests', 'failures', 'errors', 'skipped']}
    assert totals['failures'] == totals['errors'] == totals['skipped'] == 0, totals
    tests[module] = totals
    target = OUT / 'junit' / module
    target.mkdir(parents=True, exist_ok=True)
    for file in files:
        shutil.copyfile(file, target / file.name)
    for suite in suites:
        for test in suite.findall('testcase'):
            name = test.get('name', '')
            if any(word in name.lower() for word in ['alloc', 'replay', 'determin', 'observation', 'narration', 'seizuresequence']):
                regressions.append(f"{test.get('classname')}.{name}")

browsers = ['browser-check', 'combat-check', 'ability-controller-check',
            'hud-browser-check', 'campaign-browser-check', 'duel-browser-check']
browser_log = text(OUT / 'browser-final.log')
assert all(f'{name} PASS' in browser_log for name in browsers)
reward = json.loads((OUT / 'browser-final/campaign-browser-check/result.json').read_text())
duel = json.loads((OUT / 'browser-final/duel-browser-check/result.json').read_text())
for record, cue in [(reward['rewardAudio'], 'voice.mechanic.ally'),
                    (duel['seizureAudio'], 'voice.announcer.seizure'),
                    (duel['duelAudio'], 'voice.announcer.duel')]:
    assert record['lastNarration'] == cue and record['lastNarrationPlayed'], record
    assert record['highWater'] <= record['cap'] == 8

audio_reviews = {}
for name in ['x2', 'effects', 'engines', 'voices', 'music']:
    data = json.loads((OUT / f'audio-review/{name}.json').read_text(encoding='utf-8'))
    assert data['result'] == 'pass'
    audio_reviews[name] = dict(media=len(data['media']), layouts=len(data['layouts']))
for wave in ['q3', 'q4']:
    assert json.loads((OUT / f'gallery/{wave}/gallery-browser.json').read_text())['pass']
native = json.loads((OUT / 'native-audio.json').read_text())
assert native['result'] == 'pass' and native['audio']['highWater'] == 8
assert native['audio']['missing'] == 0
assert 'atlas GL audit passed' in text(OUT / 'atlas.log')

manifest = json.loads((ROOT / 'assets/audio/cues.json').read_text())
paths = {r['path']: r for r in manifest['cues'] if r['path']}
apk = ROOT / 'app/build/outputs/apk/debug/app-debug.apk'
metadata = json.loads((apk.parent / 'output-metadata.json').read_text())
assert metadata['applicationId'] == 'dev.deathride.campaign'
with zipfile.ZipFile(apk) as bundle:
    for path, row in paths.items():
        assert hashlib.sha256(bundle.read('assets/' + path)).hexdigest() == row['sha256'], path
    assert json.loads(bundle.read('assets/audio/cues.json')) == manifest
    assert not any('/x3/' in path or '/audition/' in path for path in bundle.namelist())
decoded = sum(row['decodedBytes'] for row in paths.values())
assert decoded <= 6 * 1024 * 1024

archive = json.loads((OUT / 'campaign-archive.json').read_text())
assert archive['verified'] and sha(Path(archive['archive'])) == archive['archiveSha256']
sources = {}
for module in ['core', 'link', 'game', 'desktop', 'app']:
    for file in sorted((ROOT / module / 'src').rglob('*')):
        if file.is_file():
            sources[file.relative_to(ROOT).as_posix()] = sha(file)
for file in sorted((ROOT / 'controller').rglob('*')):
    if file.is_file():
        sources[file.relative_to(ROOT).as_posix()] = sha(file)
sources['assets/audio/cues.json'] = sha(ROOT / 'assets/audio/cues.json')

report = dict(at=datetime.now(timezone.utc).isoformat(), result='pass',
              parents=dict(main='7d3a21b', campaign='cd89ea4'), tests=tests,
              allocationAndReplayChecks=regressions, browsers=browsers,
              campaignCuePlayback=[reward['rewardAudio'], duel['seizureAudio'], duel['duelAudio']],
              audioReviews=audio_reviews, nativeHost=native,
              apk=dict(path=str(apk.relative_to(ROOT)), sha256=sha(apk), bytes=apk.stat().st_size,
                       applicationId=metadata['applicationId']),
              installedAudioFiles=len(paths), decodedAudioBytes=decoded,
              archive=dict(path=archive['archive'], sha256=archive['archiveSha256'], files=len(archive['files'])),
              sources=sources,
              notMeasured=['merged build on a physical Stick', 'human listening or owner feel',
                           'new device frame/PSS qualification', 'rerun of the full Q3 balance cohort'])
(OUT / 'validation.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({key: report[key] for key in ['result', 'tests', 'apk', 'installedAudioFiles', 'decodedAudioBytes']}))
