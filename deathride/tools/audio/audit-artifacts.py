"""Validate provenance/equal kits, build a hash manifest, and verify no key entered deliverables.
The read-only key is compared in memory; only a boolean result is written.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import re

base = Path('audio/audition')
plan = json.loads((base / 'plan.json').read_text())
acceptance = json.loads((base / 'acceptance.json').read_text())
records = [json.loads(s) for s in Path('tools/audio/ledger.jsonl').read_text().splitlines() if s]
latest = {r['id']: r for r in records}
assert len(plan['directions']) == 4
assert len(plan['samples']) == 32
assert len(set(s['voiceId'] for s in plan['samples'] if s['category'] == 'tts')) == 3
assert len(set(s['prompt'] for s in plan['samples'] if s['category'] == 'tts')) == 1
assert not Path('audio/OWNER-AUDIO-CHOICE.md').exists(), 'X3 gate must not be created by this run'
assert sum(r['budgetCharge'] for r in latest.values()) <= 9000
assert not any(r['status'] not in ('complete', 'abandoned-reserved') for r in latest.values())
for d in plan['directions']:
    kit = [s for s in plan['samples'] if s['direction'] == d['id']]
    assert [s.get('cue', s['category']) for s in kit] == ['music', 'engine', 'rivet', 'mine', 'crunch', 'pickup', 'confirm', 'tts']
    assert [s['seconds'] for s in kit] == [20, 2, 1.5, 2, 1.5, 1, 1, None]
for sample in plan['samples']:
    sidecar = json.loads((base / 'raw' / (sample['id'] + '.mp3.json')).read_text())
    row = next(r for r in acceptance['samples'] if r['id'] == sample['id'])
    assert (sidecar['request'].get('prompt') or sidecar['request'].get('text')) == sample['prompt']
    assert sidecar['status'] == 'complete'
    assert sidecar['ts'] and sidecar['creditsBefore'] >= 8000 and sidecar['creditsAfter'] >= 8000
    assert latest[sidecar['id']] == sidecar
    for variant in ('raw', 'matched'):
        item = row[variant]
        assert hashlib.sha256((base / item['file']).read_bytes()).hexdigest() == item['sha256']
        assert item['status'] == ('pass' if all(item['checks'].values()) else 'fail')
        assert set(item['failures']) == {k for k,v in item['checks'].items() if not v}
    assert row['raw']['sha256'] == sidecar['sha256']
    if sample['loop']:
        assert row['repeat']['cycles'] == 3 and row['repeat']['decodePass']
        assert hashlib.sha256((base / row['repeat']['file']).read_bytes()).hexdigest() == row['repeat']['sha256']

secret = os.environ.get('ELEVENLABS_API_KEY')
if not secret:
    env = Path('C:/Users/kazda/kiro/garden-vr/.env').read_text(encoding='utf-8')
    match = re.search(r'^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*(.+)$', env, re.M)
    assert match, 'Key unavailable for in-memory leak check'
    secret = match[1].strip().strip('\"\'')
needle = secret.encode()
files = sorted(p for folder in (Path('audio'), Path('tools/audio')) for p in folder.rglob('*')
               if p.is_file() and '__pycache__' not in p.parts and p.name != 'artifact-manifest.json')
files += [Path('../docs/concepts/DEATH-RIDE-AUDIO-BRIEF.md'), Path('../docs/concepts/deathride/AUDIO-SESSION.md'),
          Path('../docs/concepts/deathride/X2-audio-audition.md'), Path('../docs/concepts/DEATH-RIDE-AUDIO.md')]
for f in files:
    if needle in f.read_bytes():
        raise RuntimeError('Credential leak detected; no secret output permitted')
    if f.suffix in ('.json', '.jsonl', '.md', '.html', '.mjs', '.py'):
        assert b'\r\n' not in f.read_bytes(), 'Use LF before hashing text, matching the repository: ' + str(f)
manifest = {'at': datetime.now(timezone.utc).isoformat(), 'result': 'pass', 'credentialLeakFound': False,
            'generatedTakes': 32, 'directions': 4, 'voiceCandidates': 3,
            'budgetCharge': sum(r['budgetCharge'] for r in latest.values()),
            'files': [{'path': f.as_posix(), 'bytes': f.stat().st_size, 'sha256': hashlib.sha256(f.read_bytes()).hexdigest()} for f in files]}
(base / 'artifact-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps({k:v for k,v in manifest.items() if k != 'files'}))
