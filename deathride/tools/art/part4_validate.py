"""Validate Part 4 source bytes, gates, observations, approvals and attributed spend."""
import json
import re
from collections import Counter
from pathlib import Path
from PIL import Image
from common import ART, ROOT, read_json, write_json, sha, now, briefs, style_for
from gen import Budget, reference_gate, fingerprint
from process import process_one
from part4_review import spend
from validate_bundle import validate as validate_world


def validate():
    folder=ART/'review/fusion';review=read_json(folder/'review.json');assert review['part']==4
    selection=review['part4_selected'];by_id={r['id']:r for r in review['records']}
    assert set(selection)=={'Needle','Comet','Quill','Kestrel'}
    baseline=read_json(ART/'audits/v2-part4-baseline.json')
    authorization=read_json(ART/'audits/v2-part4-attempt-extension.json')
    assert sha(ART/'gates.json')==authorization['gates_sha256']
    assert sha(ART/'style-fusion.json')==authorization['style_sha256']
    assert sha(ART/'OWNER-CHOICE.md')==read_json(ART/'owner-choice-binding.json')['owner_choice_sha256']
    ledger=read_json(ART/'reference-approvals.json')['references']
    for key,old in baseline['approval_ledger']['references'].items():
        assert ledger[key]['source_sha256']==old['source_sha256'],key+' previous reference changed'
        if old.get('owner_approved'):assert ledger[key]==old,key+' previous owner approval changed'
    old_review=read_json(folder/'part3-review.json')
    for old in old_review['records']:
        current=by_id[old['id']]
        assert current['source_sha256']==old['source_sha256'] and current['export_sha256']==old['export_sha256']
    checks=0
    for row in review['records']+review['part3_attempts']:
        for field,hashfield in [('source','source_sha256'),('pixels','export_sha256'),('repeat','repeat_sha256'),('animation','animation_sha256')]:
            if row.get(field):assert sha(folder/row[field])==row[hashfield],row['id']+' '+field;checks+=1
        for frame in row.get('frames',[]):assert sha(folder/frame['pixels'])==frame['sha256'];checks+=1
        if row.get('registration'):
            reg=row['registration'];assert sha(folder/reg['unregistered_path'])==reg['unregistered_export_sha256'];checks+=1
        assert len(row['grades'])==2 and all(g['status']=='graded' and g['image_hashes'][0]==row['source_sha256'] for g in row['grades']),row['id']+' semantic observations'
        if row.get('part')==4:
            direct=row['direct_review'];assert direct['source_sha256']==row['source_sha256'] and direct['export_sha256']==row['export_sha256']
            if row['pixel_codes'] or direct['verdict']=='reject':assert row['verdict']=='reject'
    for cls,key in selection.items():
        row=by_id[key];assert row['class']==cls and not row['superseded'] and not row['pixel_codes']
        assert row['verdict'] in ('owner-review','owner-approved-reference')
        result=process_one(row['brief'],folder/row['source'],ART/'processed/v2-part4-portable-validation')
        assert result['codes']==[] and result['sha256']==row['export_sha256'],key+' portable gate reproduction'
        assert ledger[key]['source_sha256']==row['source_sha256'] and ledger[key]['processed_sha256']==row['export_sha256']
        direct=row.get('part4_direct_review',row['direct_review'])
        assert direct['source_sha256']==row['source_sha256'] and direct['export_sha256']==row['export_sha256']
        for kind in ('colour','silhouette'):
            assert Image.open(folder/f'part4-{cls.lower()}-96-{kind}.png').size==(96,64)
        if cls in ('Comet','Kestrel'):
            batch=row['brief']['batch'];proof=read_json(ART/f'proofs/{batch}.json')
            assert proof['sha256']==row['source_sha256'] and proof['verdict']=='batch-direction-checked'
            assert proof['input_hash']==fingerprint([row['brief']],style_for(row['brief']))
    features=read_json(ART/'reports/v2-part4-features.json');assert len(features)==8
    for cls,key in selection.items():
        expected=[by_id[key]['source_sha256'],sha(folder/f'part4-{cls.lower()}-96-colour.png')]
        pair=[r for r in features if r['asset']==key]
        assert len(pair)==2 and all(r['status']=='graded' and r['image_hashes']==expected for r in pair)
    accounting=spend();assert accounting['new_images']<=120
    policy=read_json(ART/'budget.json');assert policy['weekly_image_cap']==550 and policy['max_attempts_per_asset']==3
    assert accounting['budget']['images_reserved']<=550 and not accounting['budget']['stop']
    events=[json.loads(line) for line in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    wanted={(r['asset'],r['attempt']) for r in accounting['reservations']}
    results=[r for r in events if r['event']=='result' and (r['asset'],r['attempt']) in wanted]
    assert len(results)==len(wanted)==len(review['part4_attempts'])
    attempts={r['id']:r for r in review['part4_attempts']};conditioned=0
    for result in results:
        assert result['status']=='generated' and result['prompt_verbatim_verified'] and len(result['image_tool_calls'])==1
        assert result['sha256']==attempts[result['asset']]['source_sha256']
        call=result['image_tool_calls'][0];row=result['brief']
        assert call['arguments']['prompt']==result['prompt']
        if row.get('reference'):
            conditioned+=1;assert call['name']=='image_edit' and len(call['arguments']['image'])==1
            actual=re.sub(r'[/\\]+','/',call['arguments']['image'][0]).lower()
            expected=str((ROOT/row['reference']).resolve()).replace('\\','/').lower()
            assert actual==expected
            source_key=Path(row['reference']).stem
            if source_key not in by_id and '/raw/' in expected:source_key=Path(row['reference']).parts[-3]
            assert source_key in by_id and result['reference_sha256']==by_id[source_key]['source_sha256']
            if row.get('requires_approval'):reference_gate(row)
        else:assert call['name']=='image_gen'
    counts=Counter(re.sub(r'-v\d+$','',r['asset']) for r in events if r['event']=='reserved')
    budget=Budget()
    for slot in ('v2-part3-rework-comet','v2-part3-rework-kestrel'):assert counts[slot]<=budget.attempt_limit(slot)
    gate=read_json(ART/'reports/v2-part4-approval-gate.json');assert gate['before']==gate['after'] and len(gate['checks'])==28
    assert gate['ledger_sha256']==sha(ART/'reference-approvals.json')
    derived=briefs(ART/'briefs/v2-part4-derived.csv');assert len(derived)==28
    for cls in selection:
        assert sum(r['class']==cls and '-state-' in r['id'] for r in derived)==4
        assert sum(r['class']==cls and '-livery-' in r['id'] for r in derived)==3
    for row in derived:
        if row['status']=='ready':reference_gate(row)
        else:
            try:reference_gate(row)
            except ValueError as exc:assert 'OWNER_REFERENCE_APPROVAL_REQUIRED' in str(exc)
            else:raise AssertionError('blocked row unexpectedly approved')
            assert not any(r['asset']==row['id'] for r in accounting['reservations'])
    browser=read_json(ART/'reports/v2-part4-browser.json');assert browser['status']=='pass' and len(browser['results'])==2
    world=validate_world(ROOT/'assets/phase2-fusion',ART/'reports/v2-part4-world-bundle-validation.json')
    assert world['regions']==178 and world['resident_mib_with_car_reserve']==31.25
    report={'at':now(),'status':'pass','portable_hash_checks':checks,'new_image_reservations':accounting['new_images'],
        'other_task_reservations':accounting['other_task_new_images'],'budget':accounting['budget'],'current_pixel_passes':4,
        'new_attempts':len(results),'conditioned_calls':conditioned,'semantic_observations_new_attempts':2*len(results),
        'retained_reference_observations':4,'feature_observations':8,'blocked_derived_jobs':gate['blocked'],
        'owner_approved_reworks':[cls for cls,key in selection.items() if ledger[key]['owner_approved']],
        'attempt_limits':{slot:{'used':counts[slot],'limit':budget.attempt_limit(slot)} for slot in ('v2-part3-rework-comet','v2-part3-rework-kestrel')},
        'unchanged_world_residency_mib':31.25,'human_calibration':'pending','scope':'Portable exact source/export bytes, unchanged source gates, actual local observations, native 96px sizes, original approvals, proof checkpoints, all one-image calls, scoped retry ceilings and live approval blockers. No runtime claim.'}
    write_json(ART/'reports/v2-part4-validation.json',report)
    files={str(p.relative_to(folder)).replace('\\','/'):sha(p) for p in folder.rglob('*') if p.is_file()}
    write_json(ART/'reports/v2-part4-portable-index.json',{'at':now(),'files':files})
    print(report);return report


if __name__=='__main__':validate()
