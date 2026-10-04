"""One matched Comet livery control; diagnostic only, never shipping art."""
import json
import shutil
import urllib.request
from common import ART, ROOT, read_json, write_json, sha, compile_prompt, style_for, now, briefs, make_contact_sheet
from process import run, process_one
from grade import HOST, MODELS, post
from part3_identity import geometry, paired


def main():
    control=run(briefs(ART/'briefs/art-states-control.csv'),'art-states-control')[0]
    conditioned=next(r for r in read_json(ART/'reports/art-states-attempts-deterministic.json') if r['id']=='v2-part4-comet-livery-bone-v1')
    assert compile_prompt(conditioned['brief'],style_for(conditioned['brief']))==compile_prompt(control['brief'],style_for(control['brief']))
    reference=ROOT/conditioned['brief']['reference']
    models={r['name']:r for r in json.load(urllib.request.urlopen(HOST+'/api/tags'))['models']}
    arms=[]
    for item,arm in [(conditioned,'conditioned'),(control,'unconditioned')]:
        arms.append({'id':item['id'],'arm':arm,'source_sha256':item['source_sha256'],'export_sha256':item['sha256'],'pixel_codes':item['codes'],'geometry':geometry(item,reference),'observations':[]})
    for model in MODELS:
        for item,record in zip((conditioned,control),arms):record['observations'].append(paired(item,reference,model,models[model]['digest']))
        post('/api/generate',{'model':model,'keep_alive':0})
    folder=ART/'review/fusion'
    for item in (conditioned,control):
        from pathlib import Path
        shutil.copyfile(item['source'],folder/'sources'/(item['id']+Path(item['source']).suffix))
        shutil.copyfile(item['path'],folder/'pixels'/(item['id']+'.png'))
    anchor=process_one({**conditioned['brief'],'id':'art-states-control-anchor'},reference,ART/'processed/art-states-control')
    make_contact_sheet([anchor,conditioned,control],folder/'art-states-consistency.png','Approved Comet | conditioned bone livery | same prompt without reference')
    evidence={'at':now(),'n_per_arm':1,'prompt_identical':True,'reference_source_sha256':sha(reference),'arms':arms,
              'scope':'One matched pair; aspect-preserving common-width silhouette overlap, paired local observations. No statistical or taste claim; control never ships.'}
    write_json(ART/'reports/art-states-consistency.json',evidence)
    print([(r['arm'],r['geometry']['uniform_width_aligned_silhouette_iou']) for r in arms])


if __name__=='__main__':main()
