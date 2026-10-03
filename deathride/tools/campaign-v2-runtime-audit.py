"""Verify accepted frozen bytes still match the built core and their recorded digests."""
import hashlib,json,os,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
frozen=root/'build/campaign-v2-runtime/candidate-v6-final'
manifest=json.loads((frozen/'provenance.json').read_text())
checked=0
for name,digest in manifest['sha256'].items():
 p=Path(name)
 if not p.is_absolute():p=frozen/p
 assert hashlib.sha256(p.read_bytes()).hexdigest()==digest,str(p)
 checked+=1
old=[Path(x) for x in (frozen/'classpath.txt').read_text().strip().split(os.pathsep) if Path(x).is_dir()]
current=[Path(x) for x in (root/'core/build/report-classpath.txt').read_text().strip().split(os.pathsep) if Path(x).is_dir()]
assert len(old)==len(current)
comparisons=[]
for a,b in zip(old,current):
 left={str(p.relative_to(a)):hashlib.sha256(p.read_bytes()).hexdigest() for p in a.rglob('*') if p.is_file()}
 right={str(p.relative_to(b)):hashlib.sha256(p.read_bytes()).hexdigest() for p in b.rglob('*') if p.is_file()}
 assert left==right,(a,b)
 comparisons.append(dict(frozen=str(a.relative_to(root)),current=str(b.relative_to(root)),files=len(left),exact=True))
result=dict(scope='Final candidate-v6-final executing runtime and built classes/resources; includes test adapters and external dependency digests',checkedDigests=checked,comparisons=comparisons,sourceBaseCommit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip())
target=root/'evidence/campaign/design-v2/final-runtime-audit.json'
target.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
