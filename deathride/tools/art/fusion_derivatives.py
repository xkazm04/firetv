"""Explicit measured pixel derivatives; original failures remain unchanged."""
from pathlib import Path
import numpy as np
from scipy import ndimage
from PIL import Image
from common import ART,read_json,write_json,sha,style_for
from process import process_one,key_image,tile_metrics,tile_codes

def relayout(record,boxes):
    source=Path(record['source']);keyed,_=key_image(Image.open(source));parts=[]
    covered=0
    for box in boxes:
        p=keyed.crop(box);a=np.asarray(p)[:,:,3]>0;covered+=int(a.sum())
        if not p.getbbox() or a[:2].any() or a[-2:].any() or a[:,:2].any() or a[:,-2:].any():
            raise ValueError('layout crop clips source effect: '+str(box))
        parts.append(p.crop(p.getbbox()))
    if covered!=int((np.asarray(keyed)[:,:,3]>0).sum()):raise ValueError('source effect pixels lost')
    scale=min(1,400/max(max(p.size) for p in parts));out=Image.new('RGBA',(1536,1024),(255,0,255,255))
    for i,p in enumerate(parts):
        p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.LANCZOS)
        out.alpha_composite(p,((i%3)*512+(512-p.width)//2,(i//3)*512+(512-p.height)//2))
    folder=ART/'processed/v4-fusion-derivatives';folder.mkdir(parents=True,exist_ok=True)
    row={**record['brief'],'id':record['id'].removesuffix('-v1')+'-layout-v1'};path=folder/(row['id']+'-source.png');out.save(path)
    result=process_one(row,path,folder)
    result['derivation']={'parent_id':record['id'],'parent_source_sha256':record['source_sha256'],
        'parent_pixel_codes':record['codes'],'recipe':'partition complete disjoint source effects; re-centre on fixed 512px cells using one shared uniform scale; no painted pixels invented',
        'source_boxes':boxes,'shared_scale':scale,'foreground_pixels_preserved_before_resample':covered,'new_paid_calls':0,'generator_sha256':sha(__file__)}
    return result

def wrapped(record,width=8):
    from wrap_tiles import repair
    if width!=8:raise ValueError('only established eight-pixel repair is supported')
    result=repair(record)
    result['derivation']['generator_sha256']=sha(__file__)
    result['derivation']['new_paid_calls']=0
    return result

def cropped(record,size=768):
    source=Image.open(record['source']).convert('RGBA');w,h=source.size
    box=((w-size)//2,(h-size)//2,(w+size)//2,(h+size)//2)
    if min(box)<0:raise ValueError('crop larger than source')
    folder=ART/'processed/v4-fusion-derivatives';folder.mkdir(parents=True,exist_ok=True)
    row={**record['brief'],'id':record['id'].removesuffix('-v1')+f'-crop{size}-v1'}
    path=folder/(row['id']+'-source.png');source.crop(box).save(path)
    result=process_one(row,path,folder)
    result['derivation']={'parent_id':record['id'],'parent_source_sha256':record['source_sha256'],
        'parent_pixel_codes':record['codes'],'recipe':'fixed centred 768px crop removes generated border; no pixel synthesis; original remains rejected',
        'source_box':box,'new_paid_calls':0,'generator_sha256':sha(__file__)}
    return result

def component_layout(record,centres):
    """Keep whole disconnected painted components; never cut an effect at a grid."""
    keyed,_=key_image(Image.open(record['source']));a=np.asarray(keyed).copy()
    labels,count=ndimage.label(a[:,:,3]>0);centres=np.asarray(centres,dtype=float)
    groups=[np.zeros(a.shape[:2],bool) for _ in range(6)];assignments=[]
    for label in range(1,count+1):
        ys,xs=np.where(labels==label);centre=np.array([xs.mean(),ys.mean()])
        group=int(np.argmin(((centres-centre)**2).sum(axis=1)))
        groups[group]|=labels==label;assignments.append({'component':label,'pixels':len(xs),'centroid':centre.tolist(),'frame':group})
    if any(not g.any() for g in groups):raise ValueError('empty component group')
    parts=[]
    for mask in groups:
        pixels=a.copy();pixels[~mask,3]=0;p=Image.fromarray(pixels);parts.append(p.crop(p.getbbox()))
    scale=min(1,400/max(max(p.size) for p in parts));out=Image.new('RGBA',(1536,1024),(255,0,255,255))
    for i,p in enumerate(parts):
        p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.LANCZOS)
        out.alpha_composite(p,((i%3)*512+(512-p.width)//2,(i//3)*512+(512-p.height)//2))
    folder=ART/'processed/v4-fusion-derivatives';folder.mkdir(parents=True,exist_ok=True)
    row={**record['brief'],'id':record['id']+'-layout-v1'};path=folder/(row['id']+'-source.png');out.save(path)
    result=process_one(row,path,folder)
    result['derivation']={'parent_id':record['id'],'parent_source_sha256':record['source_sha256'],'parent_pixel_codes':record['codes'],
        'recipe':'assign whole disconnected source components to six inspected phase centres; preserve every keyed foreground pixel; one shared scale and fixed cell centres',
        'source_centres':centres.tolist(),'assignments':assignments,'shared_scale':scale,
        'foreground_pixels_preserved_before_resample':int((a[:,:,3]>0).sum()),'new_paid_calls':0,'generator_sha256':sha(__file__)}
    return result

def despill(record):
    """Remove visible key-colour contamination, preserving alpha and geometry."""
    im,_=key_image(Image.open(record['source']).convert('RGBA'))
    a=np.asarray(im).copy();rgb=a[:,:,:3].astype(float);foreground=a[:,:,3]>0
    pink=foreground&(rgb[:,:,2]>rgb[:,:,1]*1.12)&(rgb[:,:,0]>rgb[:,:,1]*1.12)&(np.minimum(rgb[:,:,0],rgb[:,:,2])-rgb[:,:,1]>15)
    good=foreground&~pink
    _,ix=ndimage.distance_transform_edt(~good,return_indices=True)
    a[pink,:3]=a[ix[0][pink],ix[1][pink],:3]
    source=Image.new('RGBA',im.size,(255,0,255,255));source.alpha_composite(Image.fromarray(a))
    folder=ART/'processed/v4-fusion-derivatives';folder.mkdir(parents=True,exist_ok=True)
    row={**record['brief'],'id':record['id']+'-despill-v1'};path=folder/(row['id']+'-source.png');source.save(path)
    result=process_one(row,path,folder)
    result['derivation']={'parent_id':record['id'],'parent_source_sha256':record['source_sha256'],
        'recipe':'replace magenta-contaminated foreground RGB with nearest uncontaminated foreground colour; preserve alpha and geometry before common export sampling',
        'changed_source_pixels':int(pink.sum()),'new_paid_calls':0,'generator_sha256':sha(__file__)}
    return result

def repaint_fire(record):
    """Owner-authorized world repaint: retain the earlier valid overhead animation."""
    parent=next(r for r in read_json(ART/'reports/p4-effects-deterministic.json') if r['class']=='fire')
    if parent['codes']:raise ValueError('repaint parent must pass existing gates')
    sheet=Image.new('RGBA',(1536,1024),(255,0,255,255));parents=[]
    for i,f in enumerate(parent['frames']):
        if sha(f['path'])!=f['sha256']:raise ValueError('fire parent frame changed')
        a=np.asarray(Image.open(f['path']).convert('RGBA')).copy();rgb=a[:,:,:3].astype(float)
        light=(rgb[:,:,0]+rgb[:,:,1])*.5
        paint=np.zeros_like(rgb);paint[:]=[23,21,19]
        paint[light>65]=[108,36,39];paint[light>120]=[180,81,45]
        paint[(rgb[:,:,1]>125)&(light>150)]=[163,119,56]
        paint[(rgb[:,:,1]>180)&(light>200)]=[221,208,166]
        # Fixed-cell interrupted hatching, identical coordinates in every frame;
        # only rust paint is affected, preserving pivots, alpha and hot centres.
        yy,xx=np.mgrid[:a.shape[0],:a.shape[1]]
        hatch=((xx+2*yy)%29==0)&(xx%17<5)&(paint[:,:,0]==180)
        paint[hatch]=[108,36,39];a[:,:,:3]=np.uint8(paint)
        p=Image.fromarray(a).resize((512,512),Image.Resampling.NEAREST);sheet.alpha_composite(p,((i%3)*512,(i//3)*512));parents.append({'index':i,'sha256':f['sha256']})
    folder=ART/'processed/v4-fusion-derivatives';folder.mkdir(parents=True,exist_ok=True)
    row={**record['brief'],'id':'v4-fusion-effects-fire-repaint-v1','reference':'',
        'prompt_action':'Offline repaint of the six existing valid overhead fire frames. Preserve phase geometry, alpha, fixed pivots and durations; map hot primaries to the fusion soot/rust/ochre/ivory roles and add sparse fixed-cell broken hatch marks. No new generated image.'}
    path=folder/(row['id']+'-source.png');sheet.save(path);result=process_one(row,path,folder)
    result['derivation']={'parent_id':parent['id'],'parent_source_sha256':parent['source_sha256'],'parent_frames':parents,
        'rejected_generation_id':record['id'],'rejected_generation_sha256':record['source_sha256'],
        'recipe':'deterministic repaint of valid original overhead fire; five fusion colour roles, fixed-cell sparse hatching; original alpha and phase geometry preserved before common export sampling',
        'style_contract':style_for(row),'new_paid_calls':0,'generator_sha256':sha(__file__)}
    return result


def main():
    rows=read_json(ART/'reports/v4-fusion-current-deterministic.json');result=[]
    muzzle=next(r for r in rows if r['class']=='muzzle')
    result.append(relayout(muzzle,[(0,0,330,512),(330,0,650,512),(650,0,1024,512),
                                   (0,512,420,1024),(420,512,670,1024),(670,512,1024,1024)]))
    for cls in ('metal','ice','asphalt-clean'):
        r=next(r for r in rows if r['class']==cls);c=cropped(r);result.append(c)
        if c['codes']:result.append(wrapped(c))
    gravel=next(r for r in rows if r['class']=='gravel');result.append(wrapped(gravel))
    explosion=next(r for r in rows if r['class']=='explosion')
    result.append(relayout(explosion,[(0,0,512,333),(512,0,1024,333),(0,333,512,667),
                                      (512,333,1024,667),(0,667,512,1024),(512,667,1024,1024)]))
    for cls,centres in [('smoke',[(175,245),(504,251),(860,250),(178,790),(510,804),(860,832)]),
                        ('sparks',[(183,291),(511,285),(817,283),(192,752),(533,747),(845,748)])]:
        result.append(component_layout(next(r for r in rows if r['class']==cls),centres))
    result.append(repaint_fire(next(r for r in rows if r['class']=='fire')))
    for cls in ('soft-dune','rock-spire'):result.append(despill(next(r for r in rows if r['class']==cls)))
    write_json(ART/'reports/v4-fusion-derivatives-deterministic.json',result)
    print([(r['id'],r['codes']) for r in result])

if __name__=='__main__':main()
