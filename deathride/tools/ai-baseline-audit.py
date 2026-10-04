"""Compare archived baseline bytes, without treating diagnostic test changes as game changes."""
from pathlib import Path
import json
import hashlib

root=Path(__file__).resolve().parents[1]
old=json.loads((root/'evidence/owner-decisions/campaign/provenance.json').read_text())
before=json.loads((root/'build/campaign-v2-runtime/ai-z1-before/provenance.json').read_text())
keys={k for k in old['sha256']|before['sha256'] if k.startswith(('4/','5/'))}
changes=[dict(file=k,archive=old['sha256'].get(k),before=before['sha256'].get(k)) for k in sorted(keys) if old['sha256'].get(k)!=before['sha256'].get(k)]
for change in changes:
    path=root/'build/campaign-v2-runtime/ai-z1-before'/change['file']
    data=path.read_bytes() if path.is_file() else b''
    lf=data.replace(b'\r\n',b'\n')
    change['lineEndingsOnly']=change['file'].endswith('.csv') and change['archive'] in (hashlib.sha256(lf).hexdigest(),hashlib.sha256(lf.replace(b'\n',b'\r\n')).hexdigest())
out=root/'evidence/ai/z3';out.mkdir(parents=True,exist_ok=True)
report=dict(archiveCommit=old['commit'],beforeCommit=before['commit'],compared=len(keys),exactMainAndResources=not changes,changes=changes,
            equivalentParsedContentAndMain=all(c['lineEndingsOnly'] for c in changes),
            scope='Main classes and packaged resources only. Test/report classes are audited separately before reuse. No new independent baseline samples claimed.')
(out/'baseline-audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
