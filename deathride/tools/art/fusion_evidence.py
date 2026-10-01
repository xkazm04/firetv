"""Collect every fusion attempt, or perform explicitly recorded bounded corrections."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from common import ART, briefs, read_json, write_json, style_for, file_lock, now
from gen import candidates, generate, Budget
from process import process_one, run

def gather(path, wave):
    rows=briefs(path);current=[];attempts=[]
    for batch in dict.fromkeys(r['batch'] for r in rows):
        current+=run([r for r in rows if r['batch']==batch],batch)
    for row in rows:
        # Include superseded revision IDs in the same bounded identity slot.
        import re
        slot=re.sub(r'-v\d+$','',row['id'])
        paths=sorted((ART/'raw').glob(slot+'-v*/attempt-*/sidecar.json'))
        for p in paths:
            value=read_json(p)
            if value['status']!='generated':continue
            version={**value['brief'],'id':value['asset']+'-a'+str(value['attempt'])}
            result=process_one(version,value['image'],ART/'processed'/(wave+'-attempts'))
            result.update(parent_id=row['id'],attempt=value['attempt']);attempts.append(result)
    write_json(ART/'reports'/(wave+'-current-deterministic.json'),current)
    write_json(ART/'reports'/(wave+'-attempts-deterministic.json'),attempts)
    print('Current',len(current),'attempts',len(attempts),flush=True)

def refine(path,reviews):
    rows={r['id']:r for r in briefs(path)};budget=Budget();jobs=[]
    with file_lock(ART/'.run.lock',timeout=1):
        for asset,note in read_json(reviews).items():
            note=note.rstrip()
            row=rows[asset];last=read_json(candidates(row)[-1])
            if last['status']!='generated':raise ValueError('no retry of failed transport')
            rejection={'asset':asset,'image_sha256':last['sha256'],'note':note,'at':now(),'attempt':last['attempt'],'reviewer':'executing-agent; not owner'}
            write_json(ART/'rejections'/f'{asset}.json',rejection)
            budget.record({'event':'content-rejection',**rejection});jobs.append(row)
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(lambda row:generate(row,style_for(row),budget,refine=True),jobs))
        print(budget.summary(),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--briefs',required=True);p.add_argument('--wave',required=True);p.add_argument('--reviews');a=p.parse_args()
    if a.reviews:refine(a.briefs,a.reviews)
    else:gather(a.briefs,a.wave)
