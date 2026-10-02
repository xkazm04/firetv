"""Cross-check final fusion provenance, bounded attempts and published selections."""
from collections import Counter
from common import ART,ROOT,read_json,write_json,sha,style_for,now
from fusion_bundle import candidates
from atlas import validate_selection
from gen import Budget
from validate_bundle import validate

def main():
    review_path=ART/'review/fusion/review.json'
    if review_path.exists() and read_json(review_path).get('part')==4:
        from part4_validate import validate as validate_part4
        return validate_part4()
    if review_path.exists() and read_json(review_path).get('part')==3:
        from part3_validate import validate as validate_part3
        return validate_part3()
    totals={};observations=0
    for wave in ('v2-fusion','v4-fusion'):
        rs=read_json(ART/'reports'/f'{wave}-attempts-deterministic.json')
        counts=Counter(r['parent_id'] for r in rs)
        if max(counts.values())>3:raise ValueError('three-attempt identity cap exceeded')
        for r in rs:
            if sha(r['source'])!=r['source_sha256'] or sha(r['path'])!=r['sha256']:raise ValueError('attempt changed')
            style_for(r['brief'])
        totals[wave]={'attempts':len(rs),'identities':len(counts),'max_attempts':max(counts.values())}
        for model in ('mimo-9b','qwen3.8'):
            grades=read_json(ART/'reports'/f'{wave}-attempts-{model}.json')
            if len(grades)!=len(rs) or any(g['status']!='graded' for g in grades):raise ValueError('missing attempt observations')
            observations+=len(grades)
    chosen=candidates();selections=read_json(ART/'fusion-selections.json')['assets'];direct=read_json(ART/'audits/fusion-direct-review.json')
    for s in selections:
        r=chosen[s['logical_name']];validate_selection(s,r)
        if direct[r['id']]['verdict']=='reject' or direct[r['id']]['source_sha256']!=r['source_sha256']:raise ValueError('direct review mismatch')
    for suffix in ('derivatives','exports'):
        rs=read_json(ART/'reports'/f'v4-fusion-{suffix}-deterministic.json')
        for model in ('mimo-9b','qwen3.8'):
            grades=read_json(ART/'reports'/f'v4-fusion-{suffix}-{model}.json')
            if len(grades)!=len(rs) or any(g['status']!='graded' for g in grades):raise ValueError('missing derivative/export observations')
            observations+=len(grades)
    if any(s['owner_approved'] for s in selections):raise ValueError('owner approval impersonated')
    bundle=validate(ROOT/'assets/phase2-fusion',ART/'reports/v4-fusion-bundle-validation.json')
    if len(selections)!=74 or bundle['regions']!=178 or bundle['resident_mib_with_car_reserve']!=31.25:raise ValueError('bundle inventory')
    gate=read_json(ART/'audits/v2-fusion-derived-gate.json')
    if len(gate['blocked_jobs'])!=70 or any(j['reserve_calls'] or not j['result'].startswith('OWNER_REFERENCE_APPROVAL_REQUIRED:') for j in gate['blocked_jobs']):raise ValueError('derived gate audit invalid')
    if sha(ART/'reference-approvals.json')!=gate['approval_sha256']:raise ValueError('approval file changed since gate audit')
    if any(v['owner_approved'] for k,v in read_json(ART/'reference-approvals.json')['references'].items() if k.startswith('v2-fusion-')):raise ValueError('new owner approval requires a separate phase')
    budget=Budget().summary()
    if budget['images_reserved']>350:raise ValueError('budget cap')
    result={'at':now(),'status':'pass-with-three-car-rejections','totals':totals,'local_observations':observations,
        'world_selections':74,'world_derivatives':11,'effects_export_reviews':5,'bundle':bundle,
        'budget':budget,'session_images_reserved':budget['images_reserved']-198,
        'no_damage_states_or_liveries':True,'owner_approval':'pending; exact-source gate retained',
        'scope':'local raw and processed hashes, exact style resolution, combined revision attempt caps, two model observations per attempt/derivative/export, selected world gates, atlas packing/residency. Owner taste and integrated gameplay remain pending.'}
    write_json(ART/'reports/v4-fusion-validation.json',result);print(result)

if __name__=='__main__':main()
