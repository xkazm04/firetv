"""Small, reference-bound P3 experiments; no production state approval implied."""
from pathlib import Path
import numpy as np
from PIL import Image
from common import ART,read_json,write_json,briefs,sha,make_contact_sheet
from family import write_csv
from process import process_one,key_image,policy
from gen import candidates,generate,Budget

ANCHOR=Path('C:/Users/kazda/kiro/firetv/.contest/art-test/cars/car_line.png')

def prepare():
    base=dict(briefs(ART/'briefs/p3-references.csv')[1])
    action='One compact red coupe, blank ivory centre stripe, rounded RIGHT nose, broad blue-black windshield, short flat rear spoiler at LEFT. True orthographic roof-only plan view, four wheels seen only from above, no visible side walls. Keep the entire vehicle in the central three quarters. Preserve the clean chassis geometry, wheel positions, silhouette, glass and metal. Change only body paint to steel blue, preserving the ivory stripe. No damage, numbers, text or driver.'
    rows=[]
    for name,reference in [('conditioned',str(ANCHOR)),('control','')]:
        row={**base,'id':'p3-method-'+name+'-v1','prompt_action':action,'reference':reference,'batch':'p3-method-'+name}
        rows.append(row)
    rows.append({**base,'id':'p3-generated-headings-v1','kind':'sheet','class':'Line-headings','reference':str(ANCHOR),'frame':'4x4:16','batch':'p3-generated-headings','prompt_action':'A precise 4 by 4 sprite sheet of this same red coupe, exactly sixteen equal square cells, no drawn grid or labels. One identical vehicle centred in each cell, same size, same blank ivory stripe, wheel positions and top-down geometry. Frame order row-major: nose angles measured clockwise from screen RIGHT: 0,22.5,45,67.5 / 90,112.5,135,157.5 / 180,202.5,225,247.5 / 270,292.5,315,337.5 degrees. Only heading changes. Neutral symmetric lighting, no shadows. Every vehicle fully fits its own cell with clear magenta space around it. No lettering, numbers or drivers.'})
    write_csv(ART/'briefs/p3-experiments.csv',rows)

def compare():
    rows=briefs(ART/'briefs/p3-experiments.csv')
    anchor=process_one({**rows[0],'id':'owner-line-anchor','reference':''},ANCHOR,ART/'processed/p3-method')
    images=[anchor];metrics={}
    def canonical(path):
        im=Image.open(path).convert('RGBA');return im.crop(im.getbbox()).resize((256,128),Image.Resampling.LANCZOS)
    a=canonical(anchor['path']);aa=np.asarray(a);mask=aa[:,:,3]>127
    for row in rows[:2]:
        record=read_json(candidates(row)[-1]);item=process_one(row,record['image'],ART/'processed/p3-method');images.append(item)
        bb=np.asarray(canonical(item['path']));m=bb[:,:,3]>127
        metrics[row['id']]={'aligned_silhouette_iou':float((mask&m).sum()/(mask|m).sum()),'aspect_ratio':item['metrics']['aspect'],'palette_p90_delta_e':item['metrics']['palette_p90_delta_e']}
    write_json(ART/'reports/p3-method-deterministic.json',images)
    write_json(ART/'reports/p3-consistency-experiment.json',{'anchor_sha256':sha(ANCHOR),'n_per_arm':1,'method':'Bounding-box-normalized silhouette IoU; aspect ratio and role-palette distance. Paint change is intentional. No statistical or owner acceptance claim.','metrics':metrics})
    make_contact_sheet(images,ART/'contact-sheets/p3-method-comparison.png','P3 | approved direction anchor / conditioned edit / unconditioned control')

def refine_kestrel():
    row=next(r for r in briefs(ART/'briefs/p3-references.csv') if r['class']=='Kestrel')
    old=read_json(candidates(row)[-1])
    if old['attempt']!=1:raise ValueError('Kestrel correction already attempted; inspect result')
    note={'asset':row['id'],'image_sha256':old['sha256'],'note':'Measured CROPPED_OR_MARGIN: the rear fin reaches the left edge. Reduce the entire vehicle to 65 percent of the canvas width, centred horizontally, with at least 15 percent completely clear magenta border on LEFT and RIGHT. Preserve the long spear chassis and true overhead view; no wheel hubs visible.','attempt':1}
    write_json(ART/'rejections'/(row['id']+'.json'),note)
    Budget().record({'event':'content-rejection',**note})
    generate(row,read_json(ART/'style.json'),Budget(),True)

if __name__=='__main__':
    import sys
    (refine_kestrel if '--refine-kestrel' in sys.argv else compare if '--compare' in sys.argv else prepare)()
