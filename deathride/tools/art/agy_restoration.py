"""Kept-design edit comparisons using existing rework/face gates and local graders."""
import argparse
import json
from pathlib import Path
import urllib.request
from common import ART, ROOT, briefs, now, read_json, sha, write_json
import rework2_pipeline as rw
from face_visibility import ask_face, screen, FACE_MODELS
from grade import HOST, MODELS, post
from process import process_one
from PIL import Image
from agy_provider import AgyBudget

def rows(part):
    return [r for r in briefs(ART/'briefs/agy-restoration.csv') if (r['kind']=='portrait')==(part=='faces')]
rw.rows=rows
rw.report=lambda part: ART/f'reports/agy-restoration-{part}.json'

def combine():
    old={r['id']:r for r in read_json(ART/'reports/agy-restoration.json')} if (ART/'reports/agy-restoration.json').exists() else {}
    ledger=read_json(ART/'owner-approvals-2026-10-03.json')['assets'];out=[]
    for part in ('environment','faces'):
        if not rw.report(part).exists():continue
        for r in read_json(rw.report(part)):
            logical=r['brief']['logical_name'];entry=ledger.get(logical)
            r.update(before_source=r['brief']['reference'],origin='edit-restoration',owner_approved=False,runtime_enabled=False)
            if entry and entry['decision']=='Keep':r['before_export']=str(ROOT/entry['archived_export'])
            if not r.get('direct_review') and old.get(r['id'],{}).get('direct_review'):
                previous=old[r['id']]
                if previous['source_sha256']==r['source_sha256'] and previous['sha256']==r['sha256']:r['direct_review']=previous['direct_review']
            r['technical_eligible']=rw.eligible(r);out.append(r)
    # The region's exact failing source and framing-only edit form a repair pair.
    path=ART/'reports/agy-candidates.json'
    if path.exists():
        matches=[r for r in read_json(path) if r['brief']['id']=='agy-foundry-casting-ladle-v1']
        if len(matches)>1:
            before=matches[0]
            for after in matches[1:]:
                r=dict(after);r.pop('region',None)
                r.update(before_source=before['source'],before_export=before['path'],origin='edit-margin-repair',
                         repair_before_codes=before['codes'],repair_after_codes=after['codes'],
                         brief=dict(after['brief'],logical_name='repair/casting-ladle-margin'))
                out.append(r)
    write_json(ART/'reports/agy-restoration.json',out)

def faces():
    path=rw.report('faces');records=read_json(path)
    available={m['name']:m for m in json.load(urllib.request.urlopen(HOST+'/api/tags'))['models']}
    for model in FACE_MODELS:
        for r in records:
            g=ask_face(r,model,available[model]['digest']);r['face_grades']=[x for x in r.get('face_grades',[]) if x['model']!=model]+[g]
            r['face_gate']=screen(r);write_json(path,records)
        post('/api/generate',dict(model=model,keep_alive=0))

def controls():
    for part in ('environment','faces'):
        path=rw.report(part)
        if not path.exists():continue
        records=read_json(path)
        for r in records:
            row=dict(r['brief'],id='control-'+r['brief']['id'])
            control=process_one(row,r['brief']['reference'],ART/'processed/agy-controls'/row['id'])
            r.update(original_control=control['path'],original_control_sha256=control['sha256'],original_control_codes=control['codes'],
                     control_recipe='Unedited original full-resolution source, same processor and export-cell limit as candidate; no synthesis or upscaling',
                     control_source_sha256=control['source_sha256'])
        write_json(path,records)
    combine()

def validate():
    budget=AgyBudget().summary();stop=read_json(ART/'audits/a1-empty-output.json')['budget']['stop']
    assert budget['images_reserved']==9 and budget['stop']==stop
    events=[json.loads(line) for line in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    assert not [e for e in events if e.get('provider')=='agy' and e.get('event')=='reserved' and e['at']>stop['at']]
    records=read_json(ART/'reports/agy-restoration.json');assert len(records)==1
    ledger=read_json(ART/'owner-approvals-2026-10-03.json')['assets'];jobs=briefs(ART/'briefs/agy-restoration.csv');assert len(jobs)==8
    inventory=[]
    for row in jobs:
        kept=ledger[row['logical_name']];assert kept['decision']=='Keep' and sha(row['reference'])==kept['source_sha256']
        with Image.open(row['reference']) as im:before_size=list(im.size);assert min(before_size)>=512
        r=next((r for r in records if r['brief']['id']==row['id']),None)
        inventory.append(dict(id=row['id'],logical_name=row['logical_name'],source_sha256=kept['source_sha256'],source_size=before_size,
                              status='edit candidate; owner-unapproved' if r else 'not-attempted; empty-output stop'))
        if not r:continue
        assert not r['owner_approved'] and not r['runtime_enabled']
        assert r['control_source_sha256']==kept['source_sha256'] and not r['original_control_codes']
        assert sha(r['source'])==r['source_sha256'] and sha(r['path'])==r['sha256'] and sha(r['original_control'])==r['original_control_sha256']
        with Image.open(r['source']) as im:after_size=list(im.size)
        with Image.open(r['path']) as after,Image.open(r['original_control']) as control:assert after.size==control.size
        assert len(r['grades'])==2 and all(g['status']=='graded' and g['image_hashes']==[r['source_sha256']] for g in r['grades'])
        provenance=read_json(ART/'provenance/agy'/(r['id']+'.json'))
        call=provenance['image_tool_evidence']['calls'][0]
        assert len(provenance['image_tool_evidence']['calls'])==1 and call['args']['Prompt']==provenance['prompt']
        assert [Path(p).resolve() for p in call['args']['ImagePaths']]==[Path(row['reference']).resolve()]
        inventory[-1].update(output_size=after_size,resolution_increased=after_size!=before_size,export_sha256=r['sha256'])
    review=read_json(ART/'review/agy/review.json')
    assert len(review['restoration_gaps'])==8 and review['owner_approved_count']==review['runtime_enabled_count']==0
    result=dict(at=now(),status='pass-for-partial-evidence; restoration set and edit repair incomplete',budget=budget,
                inventory=inventory,generated_edits=1,unattempted_restorations=7,margin_repair='not-attempted; first source fails CROPPED_OR_MARGIN',
                local_model_observations=2,owner_approvals=0,runtime_activations=0,no_calls_after_required_stop=True)
    write_json(ART/'reports/a2-validation.json',result);print(result)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['measure','grade','faces','combine','controls','validate','direct','proof']);p.add_argument('--part',default='environment');p.add_argument('--id');p.add_argument('--note');p.add_argument('--batch');p.add_argument('--hold',action='store_true');a=p.parse_args()
    if a.mode=='measure':
        for part in ('environment','faces'):rw.measure(part)
        combine()
    elif a.mode=='grade':
        for part in ('environment','faces'):rw.grade(part)
        combine()
    elif a.mode=='faces':faces();combine()
    elif a.mode=='controls':controls()
    elif a.mode=='validate':validate()
    elif a.mode=='direct':rw.direct(a.part,a.id,a.note,not a.hold);combine()
    elif a.mode=='proof':rw.proof(a.part,a.batch,a.note)
    else:combine()
