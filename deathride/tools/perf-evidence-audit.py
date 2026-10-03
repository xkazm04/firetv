"""Check original bytes, installed APK identities and completed-wave manifests."""
import gzip,hashlib,json
from pathlib import Path
root=Path('..').resolve();base=Path('evidence/perf');runs=[];files=0
for p in sorted(base.rglob('summary.json')):
 s=json.loads(p.read_text())
 if 'sourceSha256' not in s:continue
 raw=gzip.decompress(p.with_name('raw.json.gz').read_bytes());assert hashlib.sha256(raw).hexdigest()==s['sourceSha256'],p
 receipt=json.loads(p.with_name('installed.json').read_text())
 assert s['apkSha256']==receipt['apkSha256']==receipt['installedSha256'],p
 runs.append(str(p.parent.relative_to(base)))
for p in sorted(base.glob('p[0-7]/manifest.json')):
 for f in json.loads(p.read_text())['files']:
  actual=root/f['path']
  if not actual.exists():actual=p.parent/f['path']
  assert actual.stat().st_size==f['bytes'],actual
  assert hashlib.sha256(actual.read_bytes()).hexdigest()==f['sha256'],actual;files+=1
result={'pass':True,'runs':runs,'completedWaveFilesVerified':files,'limit':'Immutable completed-wave manifests and exact raw/install identity. Final-wave manifest is created after all artifacts settle.'}
(base/'audit.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
