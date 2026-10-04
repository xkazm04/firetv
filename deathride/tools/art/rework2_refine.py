"""Explicit hash-bound content corrections through the unchanged guarded driver."""
import argparse
from common import ART, briefs, read_json, write_json, style_for, now, file_lock
from gen import Budget, candidates, generate, proof_valid

def run(part,notes_path):
    rows=briefs(ART/f'briefs/rework2-{part}.csv');notes=read_json(notes_path);budget=Budget()
    with file_lock(ART/'.run.lock',timeout=1):
        for asset,note in notes.items():
            row=next(r for r in rows if r['id']==asset)
            group=[r for r in rows if r['batch']==row['batch'] and r['status']=='ready']
            if row!=group[0] and not proof_valid(row['batch'],group,style_for(row)):
                raise RuntimeError('Inspected proof required before sibling refinement')
            s=read_json(candidates(row)[-1]);assert s['status']=='generated'
            rejection=dict(asset=asset,image_sha256=s['sha256'],note=note,at=now(),attempt=s['attempt'])
            write_json(ART/'rejections'/(asset+'.json'),rejection)
            budget.record({'event':'content-rejection',**rejection})
            result=generate(row,style_for(row),budget,refine=True)
            if result['status']!='generated' or budget.summary()['stop']:break

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--part',default='environment');p.add_argument('--notes',required=True);a=p.parse_args()
    run(a.part,a.notes)
