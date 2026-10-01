"""Reproduce the frozen diagnostic set; labels are agent observations, not human truth."""
import argparse
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from common import ART, read_json, write_json, sha, make_contact_sheet
from process import process_one

def build():
    items=[]
    refs=read_json(ART/'references.json')
    for r in refs:
        p=Path(r['path'])
        if p.name.startswith('SHEET-'):continue
        kind={'cars':'car','tiles':'tile','ui':'icon','scene':'scene'}[p.parent.name]
        cls=p.stem.split('_',1)[1];cls=cls.title() if kind=='car' else cls
        row={'id':'test-'+p.stem.replace('_','-'),'class':cls,'kind':kind,'prompt_action':('One overhead right-facing '+cls+' car' if kind=='car' else 'Full-bleed '+cls+' ground material without vehicles' if kind=='tile' else 'One '+cls+' icon without text' if kind=='icon' else 'Combat-racing scene mood reference'),'background_key':'none' if kind in ('tile','scene') else '#FF00FF'}
        if kind=='icon':
            row['prompt_action']={'ammo':'One ammunition crate icon, olive metal box with straps and no text','hammer':'One heavy cannon shell icon, olive projectile with brass base and no text','rivet':'One twin machine-gun icon with ammunition belt, no text','mine':'One spiked round mine icon, no text','repair':'One repair icon with green cross and orange wrench, no text'}[cls]
        item=process_one(row,p,ART/'processed/owner-tests') if kind in ('car','tile','icon') else {'id':row['id'],'class':cls,'kind':kind,'source':str(p),'source_sha256':sha(p),'path':str(p),'brief':row,'codes':[],'verdict':'owner-review'}
        items.append(item)
    # Same rows used by the real pipeline, never thumbnail proxies.
    for batch in ('p1-cars','p1-tiles'):items+=read_json(ART/'reports'/f'{batch}-deterministic.json')
    for asset in ('p1-car-needle-v1','p1-tile-asphalt-v1'):
        side=read_json(ART/'raw'/asset/'attempt-01/sidecar.json');row=dict(side['brief']);row['id']='old-'+asset
        items.append(process_one(row,side['image'],ART/'processed/diagnostic'))
    images=ART/'calibration/images';images.mkdir(parents=True,exist_ok=True)
    base=next(i for i in items if i['id']=='p1-car-line-v2')
    for mutation in ('text','vertical'):
        im=Image.open(base['source']).convert('RGB')
        if mutation=='text':
            draw=ImageDraw.Draw(im);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',80)
            draw.text((410,450),'77',font=font,fill='white',stroke_width=3,stroke_fill='black')
        else:im=im.rotate(90)
        path=images/(mutation+'.png');im.save(path)
        row={**base['brief'],'id':'mutant-line-'+mutation}
        item=process_one(row,path,ART/'processed/diagnostic');item['mutation']=mutation;items.append(item)
    assert len(items)==30
    labels=[]
    for item in items:
        ident=item['id'];car=item['kind']=='car'
        expected={'forbidden_details':ident in ('test-car-comet','mutant-line-text'),
                  'true_top_down':('no' if ident=='test-car-trail' else 'yes') if car else 'not_applicable',
                  'heading_right':('no' if ident=='mutant-line-vertical' else 'yes') if car else 'not_applicable',
                  'subject_matches':'no' if ident in ('p1-tile-gravel-v1','p1-tile-ice-v1','p1-tile-oil-v1','old-p1-tile-asphalt-v1') else 'yes'}
        labels.append({'id':ident,'source_sha256':item['source_sha256'],'expected':expected,'label_author':'executing-agent visual inspection and declared mutations; NOT human/owner labels','neutral_lighting':'unlabelled: ambiguous shading; not included in error-rate denominator'})
    write_json(ART/'calibration/diagnostic-input.json',items)
    label_path=ART/'calibration/agent-labels.json'
    if label_path.exists():
        assert read_json(label_path)==labels,'frozen labels changed; issue a new calibration version'
    else:write_json(label_path,labels)
    write_json(ART/'reports/owner-tests-deterministic.json',[i for i in items if i['id'].startswith('test-') and i['kind'] in ('car','tile')])
    make_contact_sheet(items,ART/'contact-sheets/calibration-30.png','30 diagnostic inputs | executing-agent labels; human calibration pending')

def report():
    labels={r['id']:r for r in read_json(ART/'calibration/agent-labels.json')}
    outputs={}
    for model in ('mimo-9b','qwen3.8'):
        grades=read_json(ART/'reports'/f'calibration-{model}.json');counts={'images':len(grades),'scored_fields':0,'false_accept':0,'false_reject':0,'uncertain':0,'defective_fields':0,'clean_fields':0,'ungraded_images':0};errors=[]
        for grade in grades:
            if grade['status']!='graded':counts['ungraded_images']+=1;continue
            truth=labels[grade['asset']]
            for field,expected in truth['expected'].items():
                actual=grade['answers'][field];bad=expected is True if field=='forbidden_details' else expected=='no'
                counts['defective_fields' if bad else 'clean_fields']+=1
                counts['scored_fields']+=1
                if actual=='uncertain':counts['uncertain']+=1;continue
                if actual!=expected:
                    code='false_accept' if bad else 'false_reject';counts[code]+=1
                    errors.append({'id':grade['asset'],'field':field,'expected':expected,'actual':actual,'error':code})
        counts['false_accept_rate']=counts['false_accept']/max(1,counts['defective_fields'])
        counts['false_reject_rate']=counts['false_reject']/max(1,counts['clean_fields'])
        outputs[model]={'counts':counts,'errors':errors}
    write_json(ART/'calibration/diagnostic-results.json',{'basis':'28 natural images + 2 declared mutations; manual executing-agent labels frozen before grading; four semantic fields per image; not human calibration','trusted_for_acceptance':False,'human_false_accept':'not measured','human_false_reject':'not measured','models':outputs})
    print(outputs)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--report',action='store_true');a=p.parse_args()
    report() if a.report else build()
