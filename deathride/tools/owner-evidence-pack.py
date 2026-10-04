"""Retain completed raw studies in deterministic gzip files, outside ignored build output."""
from pathlib import Path
import gzip, hashlib, json, sys

root=Path(__file__).resolve().parents[1]
out=root/'evidence/tracks/owner-part4'
index_path=out/'source-index.json'
index=json.loads(index_path.read_text()) if index_path.exists() else {}
for side in sys.argv[1:] or ['before','after']:
    assert side in ('before','after')
    for study in ('library','duel','difficulty','ledgers'):
        meta=json.loads((root/f'evidence/ai/z3/runs/owner-{side}-{study}.json').read_text())
        assert meta['status']=='complete',(side,study,meta['status'])
    sources=list((root/f'build/reports/campaign/q3/owner-{side}').glob('*.csv'))
    sources+=list((root/f'build/reports/campaign/q3/owner-{side}').glob('*.txt'))
    sources+=[root/f'build/reports/ai/z3/owner-{side}/difficulty.csv']
    target=out/f'campaign-{side}';target.mkdir(exist_ok=True)
    for source in sources:
        dest=target/(source.name+'.gz');digest=hashlib.sha256();size=0
        with source.open('rb') as stream,dest.open('wb') as packed,gzip.GzipFile(filename='',mode='wb',fileobj=packed,mtime=0) as zipper:
            while block:=stream.read(1024*1024):digest.update(block);size+=len(block);zipper.write(block)
        with gzip.open(dest,'rb') as stream:assert hashlib.sha256(stream.read()).hexdigest()==digest.hexdigest()
        index[source.relative_to(root).as_posix()]=dict(path=dest.relative_to(root).as_posix(),sha256=digest.hexdigest(),bytes=size)
    print(side,'retained',len(sources),'raw files')
index_path.write_text(json.dumps(index,indent=2)+'\n')
