"""Agy candidate atlas staging and spend/proof audit; production stays unchanged."""
import argparse
from collections import Counter
import json
from pathlib import Path
from common import ART, ROOT, digest, now, read_json, sha, style_for, write_json
from agy_pipeline import pipeline
from agy_provider import AgyBudget, verify_prompt
from gen import candidates, fingerprint
from regions_delivery import pack as region_pack
from regions_validate import validate_plan

PACK=ART/'regions/agy-candidate-pack'
PLAN=ART/'regions/agy-atlas-plan.json'

def pack():
    # One latest eligible attempt per brief. Structural materials replace tint
    # candidates in their existing slot rather than allocate an extra texture.
    latest={}
    for r in pipeline.records():
        if pipeline.eligible(r):latest[r['brief']['id']]=r
    selected=list(latest.values())
    for region,material,replacement in [('foundry','clinker','gravel'),('salt','salt-crust','dirt')]:
        if any(r['region']==region and r['class']==material for r in selected):
            selected=[r for r in selected if not (r['region']==region and r['class']==replacement and r['origin']=='recolour')]
    plan=region_pack(PACK,PLAN,selected,pipeline.rows())
    plan['status']='Agy technical candidates only; owner-unapproved and inactive'
    for region in plan['regions']:
        for gap in region['missing']:gap['reason']='Missing or held by technical screening; see owner review evidence'
    write_json(PLAN,plan)
    return plan

def validate():
    events=[json.loads(s) for s in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    calls=[e for e in events if e.get('event')=='reserved' and e.get('provider')=='agy']
    budget=AgyBudget().summary();assert len(calls)==budget['images_reserved']<=120
    assert all(e.get('model')==budget['model'] for e in calls)
    groups={}
    review=ART/'review/agy'
    portable={r['id']:r for r in read_json(review/'review.json')['records']} if (review/'review.json').exists() else {}
    for row in pipeline.rows():groups.setdefault(row['batch'],[]).append(row)
    released=[]
    for batch,rows in groups.items():
        proof_path=ART/'proofs'/(batch+'.json')
        if proof_path.exists():
            proof=read_json(proof_path);assert proof['input_hash']==fingerprint(rows,style_for(rows[0]))
            proof_image=Path(proof['image'])
            if not proof_image.is_file():proof_image=review/portable[proof['candidate_id']]['source']
            assert sha(proof_image)==proof['sha256'];released.append(batch)
        for row in rows[1:]:
            for call in [c for c in calls if c['asset']==row['id']]:
                assert proof_path.exists(),('Missing proof before sibling',row['id'])
                assert call['at']>proof['at'],('Late proof',row['id'])
    records=pipeline.records();generated=[r for r in records if r['origin']=='generated']
    for r in generated:
        assert not r['owner_approved'] and not r['runtime_enabled']
        source=Path(r['source']);export=Path(r['path'])
        if not source.is_file():source=review/portable[r['id']]['source']
        if not export.is_file():export=review/portable[r['id']]['path']
        assert sha(source)==r['source_sha256'] and sha(export)==r['sha256']
        sidepath=ROOT/r['generation_sidecar']
        if not sidepath.is_file():sidepath=ART/'provenance/agy'/(r['id']+'.json')
        side=read_json(sidepath)
        assert side['provider']=='agy' and side['prompt_verbatim_verified']
        assert verify_prompt(side['image_tool_evidence'],side['prompt'])
        if side['mode']=='edit':
            actual=side['image_tool_evidence']['calls'][0]['args'].get('ImagePaths',[])
            assert [Path(p).resolve() for p in actual]==[Path(p['path']).resolve() for p in side['references']],('Edit/reference inputs changed',r['id'])
        assert len(r.get('grades',[]))==2 and all(g['status']=='graded' for g in r['grades']),('Local grades missing',r['id'])
        write_json(ART/'provenance/agy'/(r['id']+'.json'),side)
    if PLAN.exists():
        validate_plan(read_json(PLAN),PACK)
    result=dict(at=now(),status='pass-for-recorded-candidates',budget=budget,proofs=released,generated_attempts=len(generated),
                technical_candidates=sum(pipeline.eligible(r) for r in generated),gate_failures=Counter(c for r in generated for c in r['codes']),
                owner_approvals=0,runtime_activations=0)
    write_json(ART/'reports/a1-validation.json',result);print(result)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['pack','validate']);globals()[p.parse_args().mode]()
