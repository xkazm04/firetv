"""Inherit approved car export pivots without scaling, cropping, or changing source gates."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from common import ART, ROOT, read_json, write_json, sha, now

def translate(image,cell,delta):
    # Pillow handles RGBA affine interpolation in premultiplied alpha internally.
    out=image.convert('RGBA').transform(tuple(cell),Image.Transform.AFFINE,(1,0,-delta[0],0,1,-delta[1]),resample=Image.Resampling.BILINEAR,fillcolor=(0,0,0,0))
    rgba=np.asarray(out).copy();mask=rgba[:,:,3]>0
    if mask.any():
        _,ix=ndimage.distance_transform_edt(~mask,return_indices=True)
        rgba[~mask,:3]=rgba[ix[0][~mask],ix[1][~mask],:3]
    return Image.fromarray(rgba)

def main():
    path=ART/'reports/v2-part3-derived-current-deterministic.json';rows=read_json(path)
    refs={r['id']:r for r in read_json(ART/'reports/v2-fusion-current-deterministic.json') if r['kind']=='car'}
    ledger=read_json(ART/'reference-approvals.json')['references'];audit=[]
    for r in rows:
        if not r.get('source'):continue
        if r.get('registration'):continue  # idempotent; regenerate base reports to rebuild
        key=r['brief']['requires_approval'];ref=refs[key];approval=ledger[key]
        assert approval['owner_approved'] and sha(ROOT/r['brief']['reference'])==approval['source_sha256']==ref['source_sha256']
        p=r['placement'];a=ref['placement'];delta=[a['pivot_px'][i]-p['pivot_px'][i] for i in range(2)]
        record={'at':now(),'id':r['id'],'reference_id':key,'reference_source_sha256':ref['source_sha256'],'reference_export_sha256':ref['sha256'],'source_sha256':r['source_sha256'],'unregistered_path':r['path'],'unregistered_export_sha256':r['sha256'],'unregistered_placement':dict(p),'translation_px':delta,'scale':1,'recipe':'Translate the already-normalized RGBA by the pivot difference into the approved reference cell; bilinear alpha-aware sampling only when needed; no scaling, source padding, stretching or source-gate changes. Re-extrude hidden RGB for linear sampling.','generator_sha256':sha(Path(__file__)),'new_paid_calls':0}
        if any(delta) or p['cell_px']!=a['cell_px']:
            original=Image.open(r['path']).convert('RGBA');out=translate(original,a['cell_px'],delta)
            alpha=np.asarray(out)[:,:,3]
            if alpha[0].any() or alpha[-1].any() or alpha[:,0].any() or alpha[:,-1].any():
                r['codes']=sorted(set(r['codes']+['REFERENCE_REGISTRATION_CLIPS']));r['verdict']='reject'
                record['status']='held';audit.append(record);continue
            # A cell change cannot silently discard opaque pixels off the canvas.
            box=original.getbbox()
            if box and (box[0]+delta[0]<1 or box[1]+delta[1]<1 or box[2]+delta[0]>a['cell_px'][0]-1 or box[3]+delta[1]>a['cell_px'][1]-1):
                r['codes']=sorted(set(r['codes']+['REFERENCE_REGISTRATION_CLIPS']));r['verdict']='reject';record['status']='held';audit.append(record);continue
            target=ART/'processed/v2-part3-registered'/(r['id']+'.png');target.parent.mkdir(parents=True,exist_ok=True);out.save(target)
            r['path']=str(target.resolve());r['sha256']=sha(target)
        r['placement']={**p,'pivot_px':a['pivot_px'],'cell_px':a['cell_px'],'pivot_reference_id':key}
        record.update(status='registered',export_sha256=r['sha256']);r['registration']=record;audit.append(record)
    write_json(path,rows);write_json(ART/'audits/v2-part3-export-registration.json',{'at':now(),'records':audit})
    print('Fixed-reference exports',len(audit),'translated',sum(any(r['translation_px']) for r in audit),'held',sum(r['status']=='held' for r in audit))

if __name__=='__main__':main()
