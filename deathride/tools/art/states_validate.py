"""Validate portable ART STATES provenance, approval, proofs and packed pixels."""
import json
from collections import Counter
from PIL import Image
from common import ART, ROOT, read_json, write_json, sha, now, briefs, style_for
from gen import Budget, fingerprint
from atlas import content_hash
from validate_bundle import validate as validate_bundle


def validate():
    folder=ART/'review/fusion';review=read_json(folder/'review.json');ledger=read_json(ART/'reference-approvals.json')['references'];checks=0
    for r in review['records']:
        for key,digest in [('source','source_sha256'),('pixels','export_sha256'),('repeat','repeat_sha256'),('animation','animation_sha256')]:
            if r.get(key):
                assert sha(folder/r[key])==r[digest], (r['id'],key)
                checks+=1
        for frame in r.get('frames') or []:
            assert sha(folder/frame['pixels'])==frame['sha256'];checks+=1
    current=[r for r in review['records'] if r.get('part')==5 and not r.get('superseded')]
    assert len(current)==28 and all(not r['pixel_codes'] and r['verdict']=='technical-selected' for r in current)
    refs={r['id']:r for r in review['records']}
    for r in current:
        key=r['brief']['requires_approval'];approval=ledger[key];ref=refs[key]
        assert approval['owner_approved'] and approval.get('owner_evidence') and approval['source_sha256']==ref['source_sha256']
        assert r['placement']['pivot_px']==ref['placement']['pivot_px'] and r['placement']['cell_px']==ref['placement']['cell_px']
        assert len(r['grades'])==2 and len(r['identity']['observations'])==2
        assert all(g['status']=='graded' and g['image_hashes'][0]==r['source_sha256'] for g in r['grades'])
        assert all(g['status']=='graded' and g['image_hashes']==[ref['source_sha256'],r['source_sha256']] for g in r['identity']['observations'])
        assert r['direct_review']['source_sha256']==r['source_sha256'] and r['direct_review']['export_sha256']==r['export_sha256']
    rows=briefs(ART/'briefs/v2-part4-derived.csv');proofs=read_json(ART/'audits/art-states-initial-proofs.json')
    attempts=read_json(ART/'reports/art-states-attempts-deterministic.json')
    generation={(r['asset'],r['attempt']):r for r in read_json(ART/'audits/art-states-generation.json')}
    for batch in {r['batch'] for r in rows}:
        group=[r for r in rows if r['batch']==batch];p=proofs[batch]
        assert p['input_hash']==fingerprint(group,style_for(group[0])) and p['verdict']=='batch-direction-checked'
        assert any(a['source_sha256']==p['sha256'] for a in attempts)
        for row in group[1:]:
            # Timestamp of first reserved sibling, not later correction reviews.
            a=next(v for v in attempts if v['brief']['id']==row['id'] and v['attempt']==1)
            sidecar=generation[(row['id'],1)]
            assert p['at']<sidecar['timestamp'], 'proof must precede sibling'
    for r in attempts:
        if r.get('derivation'):
            assert r['attempt']==0 and r['source_sha256']==ledger[r['brief']['requires_approval']]['source_sha256']
            assert '-state-intact-' in r['brief']['id']
            continue
        s=generation[(r['brief']['id'],r['attempt'])];reference=ledger[r['brief']['requires_approval']]
        assert s['status']=='generated' and s['prompt_verbatim_verified'] and len(s['image_tool_calls'])==1
        assert s['reference_sha256']==reference['source_sha256'] and s['sha256']==r['source_sha256']
    assert max(Counter(r['brief']['id'] for r in attempts if not r.get('derivation')).values())<=3
    bundle=ROOT/'assets/phase2-states';result=validate_bundle(bundle,ART/'reports/art-states-bundle-validation.json')
    packing=read_json(bundle/'cars-provenance.json');metadata=read_json(bundle/'cars.json')
    regions={r['id']:r for r in metadata['regions']}
    for r in packing['frames']:
        reg=regions[r['id']];original=Image.open(folder/refs[r['id']]['pixels']).convert('RGBA');expected=original.crop(r['crop_px'])
        page=Image.open(bundle/metadata['pages'][reg['page']]['file'])
        actual=page.crop((reg['x'],reg['y'],reg['x']+reg['width'],reg['y']+reg['height']))
        assert content_hash(actual)==content_hash(expected), 'packing may not rescale or alter opaque pixels'
    control=read_json(ART/'reports/art-states-consistency.json');assert control['prompt_identical'] and control['n_per_arm']==1
    assert all(len(a['observations'])==2 and all(g['status']=='graded' for g in a['observations']) for a in control['arms'])
    report={'at':now(),'status':'pass','portable_hash_checks':checks,'new_current_frames':28,'new_derived_attempts':sum(not r.get('derivation') for r in attempts),'reference_baselines':sum(bool(r.get('derivation')) for r in attempts),'packed_frames':70,'bundle':result,'budget':Budget().summary(),
            'scope':'Exact owner sources, two semantic and paired local observations, proof-before-siblings, bounded calls, portable pixels, lossless packing, complete registered families and declared residency. No human calibration or device-performance claim.'}
    write_json(ART/'reports/art-states-validation.json',report);print(report);return report


if __name__=='__main__':validate()
