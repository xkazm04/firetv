"""C1 handoff, reference-bound derived briefs, and family coverage gates."""
from __future__ import annotations
import csv
import io
import subprocess
from pathlib import Path
from common import ART,ROOT,briefs,read_json,write_json,sha,now,digest

IDENTITIES={
 'Needle':'Narrow yellow open-wheel dune buggy with a slender empty roll cage, exposed engine at the LEFT rear and tapering short nose at the RIGHT. Length just over twice width.',
 'Line':'Compact red coupe with a blank ivory centre stripe, rounded RIGHT nose, broad blue-black windshield and a small flat rear spoiler at LEFT. Length twice width.',
 'Bastion':'Broad olive armored wagon with squared wheel guards, rectangular riveted roof plates, four oversized tyres and a short mechanical roof gun aimed RIGHT. Blunt RIGHT nose. Length twice width.',
 'Comet':'Long orange wedge racer with a triangular RIGHT nose, narrow blue-black teardrop canopy and wide completely blank rear wing at LEFT. Length two and a half times width.',
 'Trail':'Short blue rally hatchback with stubby RIGHT nose, short boxy roof, wide rounded wheel arches and a small flat spoiler at LEFT. Compact length less than twice width.',
 'Flint':'Compact orange ram pickup: broad blunt wedge bumper at RIGHT, short forward cab, exposed rectangular rear cargo bed at LEFT, chunky squared wheel arches and four thick tyres. Squat length less than twice width.',
 'Quill':'Light ivory and blue technical spider: slender central single-seat empty cockpit, detached slim wheel pods, sharply pinched waist, twin narrow rear booms at LEFT and round needle-like nose at RIGHT. Length just over twice width.',
 'Vandal':'Red interceptor sedan: long chamfered hood at RIGHT, squared blue-black cabin, two blank ivory diagonal shoulder marks and split short rear fins at LEFT, four enclosed wheels. Length twice width.',
 'Kestrel':'Long blue and cool-grey sprint chassis: very long slender spear nose at RIGHT, narrow central dark capsule cockpit, two swept rear fins and exposed engine at LEFT, tiny tucked wheel pods. Length nearly three times width.',
 'Bulwark':'Broad olive and ivory heavy endurance carrier: six wheels, squared full-width RIGHT ram bumper, broad armored central roof with three parallel ribs and a short squared engine deck at LEFT. Length twice width.'}
STATES={'clean':'Intact clean panels. No damage.',
 'damaged-1':'Add a few small dents and restrained paint chips on the hood; keep chassis silhouette and all wheel positions.',
 'damaged-2':'Add deeper buckled panels, cracked glass and exposed metal scars, visibly more severe than damaged-1; retain overall chassis footprint and all wheels.',
 'wreck':'Burnt inert wreck with blackened panels, collapsed roof detail and opaque broken glass; retain recognizable chassis footprint, no detached parts, no smoke or flames.'}
LIVERIES={'ivory':'warm ivory painted panels','red':'muted red painted panels','blue':'steel blue painted panels'}

def snapshot():
    commit=subprocess.check_output(['git','rev-parse','deathride/content'],text=True).strip()
    path='deathride/core/src/main/resources/data/car-shapes.csv'
    data=subprocess.check_output(['git','show',commit+':'+path])
    target=ART/'contracts/c1-car-shapes.csv';target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    write_json(ART/'contracts/c1-source.json',{'commit':commit,'branch':'deathride/content','path':path,'sha256':sha(target),'captured_at':now(),'policy':'Read-only snapshot of C1 authority; reject mismatches after integration, never edit these numbers in ART.'})
    return list(csv.DictReader(io.StringIO(data.decode())))

def check_scale_contract():
    snapshot_path=ART/'contracts/c1-car-shapes.csv'
    record=read_json(ART/'contracts/c1-source.json')
    if sha(snapshot_path)!=record['sha256']:raise ValueError('C1 snapshot hash mismatch')
    with snapshot_path.open() as f:snapshot_rows={r['id']:r for r in csv.DictReader(f)}
    with (ROOT/'core/src/main/resources/data/car-shapes.csv').open() as f:local={r['id']:r for r in csv.DictReader(f)}
    for key,row in local.items():
        if key in snapshot_rows and any(float(row[field])!=float(snapshot_rows[key][field]) for field in ('lengthM','widthM')):raise ValueError('C1 dimensions diverged: '+key)
    return snapshot_rows

def write_csv(path,rows):
    with Path(path).open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=rows[0].keys());writer.writeheader();writer.writerows(rows)

def prepare():
    rows=snapshot();assert {r['id'] for r in rows}==set(IDENTITIES)
    fields=['id','class','prompt_action','size','frame','background_key','count','status','kind','reference','batch','approval','requires_approval']
    refs=[];derived=[];approvals={}
    for shape in rows:
        cls=shape['id'];refid='p3-ref-'+cls.lower()+'-v1'
        base=dict.fromkeys(fields,'');base.update(id=refid,**{'class':cls},size='1024x1024',frame='single',background_key='#FF00FF',count='1',status='ready',kind='car',batch='p3-references',approval='pending')
        base['prompt_action']='One single vehicle only: '+IDENTITIES[cls]+' This is a strict plan-view reference, all roof planes viewed directly from above with the front pointing RIGHT. Symmetric material shading; no visible side walls, front grille or cast shadow. Keep the complete vehicle inside the middle three quarters of the canvas with a generous margin. Show identity invariants only, no damage, driver, text or numbers.'
        refs.append(base)
        approvals[refid]={'owner_approved':False,'source_sha256':None,'owner_evidence':None,'identity':IDENTITIES[cls]}
        for state,action in STATES.items():
            r=dict(base);r.update(id='p3-'+cls.lower()+'-'+state+'-v1',status='blocked-owner-reference',batch='p3-states',requires_approval=refid,reference='PENDING:'+refid)
            r['prompt_action']='Freeze this exact vehicle identity, camera, rightward heading, scale, wheel positions, framing, background and material roles. '+IDENTITIES[cls]+' Change only state: '+action
            derived.append(r)
        for name,action in LIVERIES.items():
            r=dict(base);r.update(id='p3-'+cls.lower()+'-livery-'+name+'-v1',status='blocked-owner-reference',batch='p3-liveries',requires_approval=refid,reference='PENDING:'+refid)
            r['prompt_action']='Freeze this exact vehicle geometry, camera, rightward heading, scale, damage state, wheels, glass, metal and framing. '+IDENTITIES[cls]+' Change ONLY body paint to '+action+'. No emblems, symbols, numbers or text.'
            derived.append(r)
    write_csv(ART/'briefs/p3-references.csv',refs);write_csv(ART/'briefs/p3-derived.csv',derived)
    approval_path=ART/'reference-approvals.json'
    if not approval_path.exists():write_json(approval_path,{'schema':1,'references':approvals})
    write_json(ART/'family-coverage.json',{'classes':list(IDENTITIES),'reference_briefs':len(refs),'state_briefs':len(rows)*len(STATES),'livery_briefs':len(rows)*len(LIVERIES),'states':list(STATES),'liveries':list(LIVERIES),'owner_reference_approvals':0,'derived_generation':'blocked pending exact owner reference approval','c1':read_json(ART/'contracts/c1-source.json')})

def review_package():
    from common import make_contact_sheet
    items=read_json(ART/'reports/p3-references-acceptance.json')
    approvals=read_json(ART/'reference-approvals.json')
    for item in items:
        record=approvals['references'][item['id']]
        record.update(candidate_source=item['source'],candidate_source_sha256=item['source_sha256'],processed_sha256=item['sha256'],review_sheet='contact-sheets/p3-reference-'+item['class'].lower()+'.png')
        make_contact_sheet([item],ART/record['review_sheet'],item['class']+' | invariant reference candidate | owner approval pending')
    write_json(ART/'reference-approvals.json',approvals)
    coverage=read_json(ART/'family-coverage.json')
    coverage.update(reference_candidates=len(items),pixel_gate_pass=sum(not r['codes'] for r in read_json(ART/'reports/p3-references-deterministic.json')),derived_images_generated=0)
    write_json(ART/'family-coverage.json',coverage)

if __name__=='__main__':
    import sys
    (review_package if '--review-package' in sys.argv else prepare)()
