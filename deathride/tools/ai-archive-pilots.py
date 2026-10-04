"""Retain exploratory raw outcomes separately from final acceptance samples."""
from pathlib import Path
import gzip,hashlib,json

root=Path(__file__).resolve().parents[1]
out=root/'evidence/ai/z3/pilots';out.mkdir(parents=True,exist_ok=True)
manifest=[]
for metadata in sorted((root/'evidence/ai/z3/runs').glob('*.json')):
    run=json.loads(metadata.read_text());tag=run['tag']
    if 'pilot' not in tag and tag!='ai-z3-duel-lane':continue
    for base in (root/'build/reports/campaign/q3',root/'build/reports/ai/z3'):
        for source in sorted((base/tag).glob('*.csv')):
            raw=source.read_bytes();target=out/tag/(source.name+'.gz');target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(gzip.compress(raw,mtime=0))
            assert gzip.decompress(target.read_bytes())==raw
            manifest.append(dict(file=str(target.relative_to(out)).replace('\\','/'),bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest()))
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Archived',len(manifest),'pilot files; excluded from final sample counts')
