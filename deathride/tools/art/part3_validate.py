"""Validate exact portable Part 3 evidence, approvals, bounded spend and family exports."""
import json
import re
from collections import Counter
from common import ART, ROOT, read_json, write_json, sha, now, briefs
from gen import reference_gate, Budget, fingerprint
from common import style_for
from part3_setup import APPROVED, REWORK
from validate_bundle import validate as validate_world_bundle

def validate():
    folder=ART/'review/fusion';review=read_json(folder/'review.json');ledger=read_json(ART/'reference-approvals.json')['references']
    template=read_json(ART/'V2-REFERENCE-APPROVAL.template.json')['references'];checks=0
    assert sha(ART/'OWNER-CHOICE.md')==read_json(ART/'audits/v2-part3-owner-instruction.json')['current_owner_sha256']
    approved_ids={f'v2-fusion-cars-{c.lower()}-v1' for c in APPROVED}
    assert {k for k,v in ledger.items() if v.get('owner_approved')}==approved_ids
    for key in approved_ids:
        a=ledger[key];t=template[key]
        assert a['source_sha256']==t['source_sha256']==sha(ROOT/a['candidate_source'])
        assert a['processed_sha256']==t['processed_sha256'] and 'Approved the art direction, looks very solid. For cars.' in a['owner_evidence']
    refs={r['id']:r for r in review['records'] if r['id'] in approved_ids}
    baseline=read_json(folder/'part2-review.json')
    current_by_id={r['id']:r for r in review['records']}
    assert len(baseline['records'])==95
    for original in baseline['records']:
        current=current_by_id[original['id']]
        assert current['source_sha256']==original['source_sha256'] and current['export_sha256']==original['export_sha256']
    assert sum(r.get('world_bundle_selected',False) for r in review['records'])==74
    world=validate_world_bundle(ROOT/'assets/phase2-fusion',ART/'reports/v2-part3-world-bundle-validation.json')
    assert world['regions']==178 and world['resident_mib_with_car_reserve']==31.25
    for r in review['records']+review['part3_attempts']:
        for filekey,hashkey in [('source','source_sha256'),('pixels','export_sha256'),('repeat','repeat_sha256'),('animation','animation_sha256')]:
            if r.get(filekey):assert sha(folder/r[filekey])==r[hashkey],r['id']+' '+filekey;checks+=1
        for f in r.get('frames',[]):assert sha(folder/f['pixels'])==f['sha256'];checks+=1
        if r.get('registration'):
            registration=r['registration']
            assert sha(folder/registration['unregistered_path'])==registration['unregistered_export_sha256'];checks+=1
            assert registration['export_sha256']==r['export_sha256'] and registration['scale']==1 and registration['new_paid_calls']==0
        assert len(r['grades'])==2 and all(g.get('status')=='graded' and g['image_hashes'][0]==r['source_sha256'] for g in r['grades']),r['id']+' local grades'
        if r.get('part')==3 and r.get('role')!='attempt':
            direct=r['direct_review'];assert direct.get('source_sha256')==r['source_sha256'] and direct.get('export_sha256')==r['export_sha256'],r['id']+' direct review'
            if r['role']=='derived':
                reference_gate(r['brief']);assert r['brief']['requires_approval'] in approved_ids
                pair=r['identity'];assert pair['metrics']['candidate_source_sha256']==r['source_sha256']
                expected=ledger[r['brief']['requires_approval']]['source_sha256']
                assert len(pair['observations'])==2 and all(g['status']=='graded' and g['image_hashes']==[expected,r['source_sha256']] for g in pair['observations']),r['id']+' identity observations'
            if r['role']=='rework':assert not ledger[r['id']]['owner_approved']
    history=[json.loads(line) for line in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    events=[e for e in history if e.get('asset','').startswith('v2-part3-') and e.get('event')=='reserved']
    results=[e for e in history if e.get('asset','').startswith('v2-part3-') and e.get('event')=='result']
    assert len(results)==len(events) and all(r['status']=='generated' and r.get('prompt_verbatim_verified') and len(r['image_tool_calls'])==1 for r in results)
    conditioned=0
    for result in results:
        row=result['brief'];reference_id=row.get('requires_approval')
        if reference_id:
            call=result['image_tool_calls'][0]
            assert call['name']=='image_edit' and len(call['arguments']['image'])==1
            actual=re.sub(r'[/\\]+','/',call['arguments']['image'][0]).lower()
            assert actual.endswith('/'+row['reference'].lower())
            assert result['reference_sha256']==ledger[reference_id]['source_sha256']
            conditioned+=1
    counts=Counter(re.sub(r'-v\d+$','',e['asset']) for e in events)
    assert max(counts.values())<=read_json(ART/'budget.json')['max_attempts_per_asset']
    assert len(events)==Budget().summary()['images_reserved']-338
    assert Budget().summary()['images_reserved']<=550
    # No reservation may follow a quota/unknown-spend latch.
    stops=[i for i,e in enumerate(history) if e.get('event')=='spend-stop' and e.get('reason','').startswith('v2-part3-')]
    if stops:assert not any(e.get('event')=='reserved' for e in history[min(stops)+1:])
    source_refs={r['class']:r for r in read_json(ART/'reports/v2-fusion-current-deterministic.json') if r['kind']=='car'}
    exports=[]
    for r in review['records']:
        if r.get('role')!='derived':continue
        ref=source_refs[r['class']];p=r['placement'];a=ref['placement']
        codes=[]
        if p['cell_px']!=a['cell_px']:codes.append('REFERENCE_CELL_DRIFT')
        if p['pivot_px']!=a['pivot_px']:codes.append('REFERENCE_PIVOT_DRIFT')
        if p['world_length_m']!=a['world_length_m']:codes.append('REFERENCE_SCALE_DRIFT')
        exports.append({'id':r['id'],'reference_id':ref['id'],'reference_export_sha256':ref['sha256'],'export_sha256':r['export_sha256'],'reference_pivot':a['pivot_px'],'pivot':p['pivot_px'],'reference_cell':a['cell_px'],'cell':p['cell_px'],'codes':codes})
    write_json(ART/'reports/v2-part3-export-registration.json',{'status':'pass' if not any(e['codes'] for e in exports) else 'held','records':exports,'scope':'Exact reference cell, art pivot and world length; no stretching or automatic alignment repair.'})
    current=[r for r in review['records'] if r.get('part')==3];derived=[r for r in current if r['role']=='derived'];reworks=[r for r in current if r['role']=='rework']
    assert len(derived)==42 and Counter(r['class'] for r in derived)==Counter({c:7 for c in APPROVED})
    assert len(reworks)==4 and {r['class'] for r in reworks}==set(REWORK)
    before=sha(ART/'usage.json');blocked=[]
    for r in reworks:
        for variant in ('state-intact','state-damaged-1','state-damaged-2','state-wreck','livery-bone','livery-red','livery-ochre'):
            row={**r['brief'],'requires_approval':r['id'],'reference':ledger[r['id']]['candidate_source']}
            try:reference_gate(row)
            except ValueError as error:
                assert str(error).startswith('OWNER_REFERENCE_APPROVAL_REQUIRED:')
                blocked.append({'reference_id':r['id'],'variant':variant,'result':str(error)})
            else:raise AssertionError('unapproved rework admitted')
    assert sha(ART/'usage.json')==before
    write_json(ART/'audits/v2-part3-approval-gate.json',{'at':now(),'admitted_derived_jobs':42,'blocked_rework_jobs':blocked,'usage_sha256_before_and_after':before,'scope':'Read-only production reference-gate calls. No reserve/generation invoked.'})
    assert len([r for r in current if r['role']=='control'])==1
    for cls in APPROVED:assert (folder/('part3-family-'+cls.lower()+'.png')).is_file()
    control=read_json(ART/'reports/v2-part3-consistency.json');assert control['prompt_identical'] and control['n_per_arm']==1 and len(control['arms'])==2
    assert not any(e['codes'] for e in exports),'export registration remains held'
    proofs=[]
    rows=briefs(ART/'briefs/v2-part3-derived.csv')
    for batch in dict.fromkeys(r['batch'] for r in rows):
        group=[r for r in rows if r['batch']==batch];proof=read_json(ART/'proofs'/(batch+'.json'))
        assert proof['input_hash']==fingerprint(group,style_for(group[0])) and proof['verdict']=='batch-direction-checked'
        first_slot=re.sub(r'-v\d+$','',group[0]['id'])
        for result in results:
            if result['brief']['batch']==batch and re.sub(r'-v\d+$','',result['asset'])!=first_slot:
                assert result['timestamp']>=proof['at'],'sibling generated before checked proof'
        proofs.append({'batch':batch,'source_sha256':proof['sha256'],'checked_at':proof['at']})
    result={'at':now(),'status':'pass','scope':'Evidence integrity and required inventory, not acceptance of held content or human calibration','portable_hash_checks':checks,'approved_references':6,'reworks':4,'derived_states':24,'liveries':18,'control_arms':2,'generated_attempts':len(events),'current_rejects':[{'id':r['id'],'codes':r['codes']} for r in current if r['verdict']=='reject'],'export_registration_holds':[r['id'] for r in exports if r['codes']],'proofs':proofs,'budget':Budget().summary(),'part_reservations':len(events),'attempts_per_slot':dict(counts)}
    result.update(guarded_one_image_results=len(results),approved_reference_edit_inputs_verified=conditioned,
        semantic_observations=2*len(review['part3_attempts']),current_paired_identity_observations=2*len(derived),blocked_rework_derivatives=len(blocked))
    write_json(ART/'reports/v2-part3-validation.json',result)
    write_json(ART/'reports/v2-part3-portable-index.json',{'at':now(),'files':{str(p.relative_to(folder)).replace('\\','/'):sha(p) for p in folder.rglob('*') if p.is_file()}})
    print(json.dumps({k:v for k,v in result.items() if k not in ('proofs','attempts_per_slot')},indent=2))

if __name__=='__main__':validate()
