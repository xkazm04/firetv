"""Publish the final proof marker only after every fresh retained-course trial is present."""
from pathlib import Path
import csv, gzip, hashlib, json, io, subprocess, sys

root=Path(__file__).resolve().parents[1]
folder=root/'tracks/candidates'
manifest=list(csv.DictReader((folder/'manifest.csv').open()))
ids=[r['candidate'] for r in manifest]+['switchback-4-runoff']
out=folder/'proof-final'
engines=set();flags=[];files={}
for ident in ids:
    path=out/(ident+'.json');p=json.loads(path.read_text())
    assert p['freshRun'] and p['sixCarTrials']==72 and p['repeatHashMatches'],ident
    assert p['seeds']==12 and p['rotations']==6
    assert p['proofMode']==('six-car lap traversal of arena' if ident=='crown-7-a' else 'six-car lap race')
    engines.add(p['engineSha256'])
    if ident!='switchback-4-runoff':assert not p['flags'],(ident,p['flags'])
    if p['flags']:flags.append(dict(candidate=ident,flags=p['flags'],ownerAcceptedException=True))
    raw=out/(ident+'-trials.ndjson.gz')
    trials=[json.loads(line) for line in gzip.open(raw,'rt')]
    assert len(trials)==72 and len({t['seed'] for t in trials})==12 and len({t['rotation'] for t in trials})==6
    assert all(len(t['assignments'])==6 for t in trials)
    for f in (path,raw):files[f.name]=hashlib.sha256(f.read_bytes()).hexdigest()
assert len(engines)==1
ledger=json.loads((root/'tracks/excluded/owner-2026-10-04/archive-ledger.json').read_text())
for r in ledger:assert hashlib.sha256((root/r['path'].replace('\\','/')).read_bytes()).hexdigest()==r['sha256'],r['path']
if '--git-index' in sys.argv:
    refs=[':deathride/'+r['path'].replace('\\','/') for r in ledger]
    stream=io.BytesIO(subprocess.check_output(['git','cat-file','--batch'],input=''.join(ref+'\n' for ref in refs).encode(),cwd=root))
    for r in ledger:
        header=stream.readline().split();blob=stream.read(int(header[2]));assert stream.read(1)==b'\n'
        assert hashlib.sha256(blob).hexdigest()==r['sha256'],r['path']
result=dict(candidates=len(ids),trials=len(ids)*72,cleanTrials=len(ids)*3,engineSha256=next(iter(engines)),
            flags=flags,archiveFilesVerified=len(ledger),archiveIndexVerified='--git-index' in sys.argv,sha256=files)
(out/'_complete.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='sha256'}))
