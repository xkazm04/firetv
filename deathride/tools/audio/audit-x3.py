"""Hash, provenance, budget and in-memory credential audit. Never outputs a key."""
from pathlib import Path
import hashlib
import json
import os
import re
from datetime import datetime, timezone

session='x3-2026-10-02'
ledger={r['id']:r for r in map(json.loads,Path('tools/audio/ledger.jsonl').read_text().splitlines()) if r['session']==session}
assert all(r['status']=='complete' for r in ledger.values()),'Unresolved spend; stop'
spent=sum(r['budgetCharge'] for r in ledger.values())
assert spent<=9000
assert all(r['creditsBefore']>=8000 and r['creditsAfter']>=8000 for r in ledger.values())
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
for r in ledger.values():
    assert r['sha256']==sha(r['out'])
    assert json.loads(Path(r['out']+'.json').read_text())==r
counts={}
for file in Path('audio/x3').glob('*/acceptance.json'):
    report=json.loads(file.read_text())
    for r in report['samples']:
        for key in ['raw','edited','repeat']:
            item=r.get(key)
            if item:
                assert item['sha256']==sha(item['file']),(r['id'],key)
                if 'checks' in item:
                    assert item['status']==('pass' if all(item['checks'].values()) else 'fail')
                    assert set(item['failures'])=={k for k,v in item['checks'].items() if not v}
    counts[file.parent.name]=dict(total=len(report['samples']),passed=sum(r['status']=='pass' for r in report['samples']))
manifest=json.loads(Path('assets/audio/cues.json').read_text())
assert manifest['maxVoices']==8
assert len(manifest['cues'])==len({r['id'] for r in manifest['cues']})
assets={}
for r in manifest['cues']:
    if r['path']:
        p=Path('assets')/r['path']
        assert r['status']=='technical-pass' and sha(p)==r['sha256']
        assets[r['path']]=r['decodedBytes']
assert sum(assets.values())<=manifest['decodedBudgetBytes']
assert sum(p.stat().st_size for p in Path('assets/audio').rglob('*') if p.is_file())<=manifest['installedBudgetBytes']
secret=os.environ.get('ELEVENLABS_API_KEY')
if not secret:
    match=re.search(r'^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*(.+)$',Path('C:/Users/kazda/kiro/garden-vr/.env').read_text(),re.M)
    assert match,'Credential unavailable for leak audit'
    secret=match[1].strip().strip('\"\'')
needle=secret.encode()
files=[p for folder in ['audio/x3','assets/audio','tools/audio'] for p in Path(folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files.extend(Path('../docs/concepts/deathride').glob('X3*.md'))
for p in files:
    if needle in p.read_bytes(): raise RuntimeError('Credential leak detected; output withheld')
report=dict(at=datetime.now(timezone.utc).isoformat(),result='pass',session=session,conservativeCharge=spent,
            providerConfirmed=sum(r.get('providerCredits') or 0 for r in ledger.values()),generatedTakes=len(ledger),
            acceptance=counts,uniqueInstalledClips=len(assets),decodedAssetBytes=sum(assets.values()),credentialLeakFound=False,
            caveat='Hashes and host budgets are technical evidence, not physical device acceptance.')
Path('audio/x3/audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
