"""The single conditioned/unconditioned control pair; no statistical claim."""
import json
import urllib.request
from common import ART, ROOT, read_json, write_json, compile_prompt, style_for, sha, make_contact_sheet, now
from grade import HOST, MODELS, post
from part3_identity import geometry, paired
from process import process_one

def main():
    conditioned=next(r for r in read_json(ART/'reports/v2-part3-proofs-deterministic.json') if r['id']=='v2-part3-line-livery-bone-v1')
    control=read_json(ART/'reports/v2-part3-control-current-deterministic.json')[0]
    assert compile_prompt(conditioned['brief'],style_for(conditioned['brief']))==compile_prompt(control['brief'],style_for(control['brief']))
    reference=ROOT/conditioned['brief']['reference'];refid=conditioned['brief']['requires_approval']
    approval=read_json(ART/'reference-approvals.json')['references'][refid]
    assert approval['owner_approved'] and approval['source_sha256']==sha(reference)
    tags=json.load(urllib.request.urlopen(HOST+'/api/tags'));models={m['name']:m for m in tags['models']}
    records=[]
    for item in (conditioned,control):
        records.append({'id':item['id'],'arm':'conditioned edit' if item is conditioned else 'unconditioned generation','source_sha256':item['source_sha256'],'export_sha256':item['sha256'],'pixel_codes':item['codes'],'geometry':geometry(item,reference),'observations':[]})
    for model in MODELS:
        for item,record in zip((conditioned,control),records):record['observations'].append(paired(item,reference,model,models[model]['digest']))
        post('/api/generate',{'model':model,'keep_alive':0})
    anchor=process_one({**conditioned['brief'],'id':'v2-part3-approved-line-anchor'},reference,ART/'processed/v2-part3-consistency')
    make_contact_sheet([anchor,conditioned,control],ART/'review/fusion/part3-consistency.png','Approved Line | reference-conditioned livery | identical prompt without image reference')
    write_json(ART/'reports/v2-part3-consistency.json',{'at':now(),'n_per_arm':1,'reference_id':refid,'reference_source_sha256':sha(reference),'prompt_identical':True,'arms':records,'scope':'One matched prompt pair. Common-width silhouette IoU preserves aspect. Both local graders compare each arm with the exact approved reference. Diagnostic only; no statistical superiority, taste approval or production control selection.'})
    print([(r['arm'],r['geometry']['uniform_width_aligned_silhouette_iou']) for r in records])

if __name__=='__main__':main()
