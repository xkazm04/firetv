"""Deterministic extraction and measurements. Originals are read-only inputs."""
from __future__ import annotations
import argparse
import csv
import math
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from common import ART, ROOT, briefs, make_contact_sheet, read_json, sha, write_json, digest, style_for
from gen import candidates

def policy(): return read_json(ART/'gates.json')

def key_image(image, cfg=None):
    cfg=cfg or policy()
    rgba=np.asarray(image.convert('RGBA')).copy()
    rgb=rgba[:,:,:3].astype(float)
    border=np.concatenate((rgb[0],rgb[-1],rgb[:,0],rgb[:,-1]))
    key=np.median(border,axis=0)
    magenta=(min(key[0],key[2])-key[1])>cfg['magenta_chroma_min']
    chroma=np.minimum(rgb[:,:,0],rgb[:,:,2])-rgb[:,:,1]
    dominant_magenta=(chroma>cfg['magenta_chroma_min'])&(rgb[:,:,0]>90)&(rgb[:,:,2]>65)
    # Sheets sometimes have white exterior gutters around magenta cells. Detect the
    # large key field independently, preserving enclosed ivory effect highlights.
    mixed_key=not magenta and dominant_magenta.mean()>.1
    magenta=magenta or mixed_key
    if magenta:
        bg=dominant_magenta
        if mixed_key:
            near=np.linalg.norm(rgb-key,axis=2)<cfg['neutral_key_distance']
            seed=np.zeros(near.shape,bool);seed[[0,-1],:]=near[[0,-1],:];seed[:,[0,-1]]=near[:,[0,-1]]
            bg|=ndimage.binary_propagation(seed,mask=near)
    else:
        near=np.linalg.norm(rgb-key,axis=2)<cfg['neutral_key_distance']
        seed=np.zeros(near.shape,bool)
        seed[[0,-1],:]=near[[0,-1],:];seed[:,[0,-1]]=near[:,[0,-1]]
        bg=ndimage.binary_propagation(seed,mask=near)
    foreground=(~bg)&(rgba[:,:,3]>0)
    labels,count=ndimage.label(foreground)
    sizes=np.bincount(labels.ravel())
    keep=sizes>=max(3,int(foreground.size*cfg['component_min_fraction']))
    keep[0]=False
    foreground=keep[labels]
    rgba[:,:,3]=np.where(foreground,rgba[:,:,3],0)
    # Despill fringe from nearest interior, never recolour solid paint.
    interior=ndimage.binary_erosion(foreground,iterations=2)
    if interior.any():
        _,indices=ndimage.distance_transform_edt(~interior,return_indices=True)
        fringe=foreground&~interior
        if magenta:
            contaminated=fringe&((rgb[:,:,0]+rgb[:,:,2])/2-rgb[:,:,1]>25)
            rgba[contaminated,:3]=rgba[indices[0][contaminated],indices[1][contaminated],:3]
    return Image.fromarray(rgba), {'estimated_key_rgb':key.tolist(),'magenta_key':bool(magenta),'mixed_border_key':bool(mixed_key),'components':int(sum(keep))}

def sprite_metrics(image, shape=None, cfg=None):
    cfg=cfg or policy(); alpha=np.asarray(image.convert('RGBA'))[:,:,3]>0
    ys,xs=np.where(alpha)
    metrics={'foreground_fraction':float(alpha.mean()),'source_size_px':list(image.size)}
    codes=[]
    if not len(xs): return metrics,['EMPTY_ALPHA']
    box=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
    metrics['bounds_px']=box
    margin=min(box[0],box[1],image.width-box[2],image.height-box[3])
    metrics['margin_fraction']=float(margin/min(image.size))
    metrics['aspect']=(box[2]-box[0])/(box[3]-box[1])
    if metrics['foreground_fraction']<cfg['minimum_foreground_fraction']: codes.append('EMPTY_ALPHA')
    if metrics['foreground_fraction']>cfg['maximum_foreground_fraction']: codes.append('BACKGROUND_NOT_REMOVED')
    if metrics['margin_fraction']<cfg['source_margin_fraction']: codes.append('CROPPED_OR_MARGIN')
    if shape:
        expected=float(shape['lengthM'])/float(shape['widthM'])
        metrics['expected_aspect']=expected
        metrics['aspect_relative_error']=abs(metrics['aspect']/expected-1)
        if metrics['aspect_relative_error']>cfg['car_aspect_relative_error']: codes.append('ASPECT_BAND')
        sample=np.column_stack((xs[::max(1,len(xs)//20000)],ys[::max(1,len(ys)//20000)]))
        values,vectors=np.linalg.eigh(np.cov(sample.T))
        axis=vectors[:,np.argmax(values)]
        angle=math.degrees(math.atan2(abs(axis[1]),abs(axis[0])))
        metrics['principal_axis_degrees']=angle
        if angle>cfg['principal_axis_max_degrees']: codes.append('AXIS_NOT_X')
    return metrics,codes

def lab(rgb):
    x=np.asarray(rgb,dtype=float)/255
    x=np.where(x>.04045,((x+.055)/1.055)**2.4,x/12.92)
    xyz=x@np.array([[.4124564,.3575761,.1804375],[.2126729,.7151522,.0721750],[.0193339,.1191920,.9503041]]).T
    xyz/=np.array([.95047,1.,1.08883])
    f=np.where(xyz>.008856,np.cbrt(xyz),7.787*xyz+16/116)
    return np.stack((116*f[...,1]-16,500*(f[...,0]-f[...,1]),200*(f[...,1]-f[...,2])),axis=-1)

def palette_metrics(image,style):
    rgba=np.asarray(image.convert('RGBA'));pixels=rgba[rgba[:,:,3]>200,:3]
    if not len(pixels): return {'palette_p90_delta_e':None}
    pixels=pixels[::max(1,len(pixels)//15000)]
    colours=np.array([[int(c[i:i+2],16) for i in (1,3,5)] for c in style['palette']])
    shades=np.concatenate([np.clip(colours*v,0,255) for v in (.55,.75,1.,1.2)])
    distance=np.linalg.norm(lab(pixels)[:,None,:]-lab(shades)[None,:,:],axis=2).min(axis=1)
    return {'palette_mean_delta_e':float(distance.mean()),'palette_p90_delta_e':float(np.percentile(distance,90))}

def tile_metrics(image,cfg=None):
    cfg=cfg or policy();rgb=np.asarray(image.convert('RGB')).astype(float)/255
    dx=np.abs(rgb[:,0]-rgb[:,-1]);dy=np.abs(rgb[0]-rgb[-1])
    grey=np.asarray(image.convert('L').resize((128,128),Image.Resampling.BOX)).astype(float)
    grey-=grey.mean();power=np.abs(np.fft.fft2(grey))**2
    corr=np.fft.ifft2(power).real
    corr/=max(corr[0,0],1e-12)
    y,x=np.indices(corr.shape);dxs=np.minimum(x,128-x);dys=np.minimum(y,128-y)
    valid=np.maximum(dxs,dys)>=128*cfg['tile_autocorrelation_min_shift_fraction']
    peak=float(corr[valid].max())
    index=np.unravel_index(np.argmax(np.where(valid,corr,-np.inf)),corr.shape)
    return {'edge_x_mean':float(dx.mean()),'edge_y_mean':float(dy.mean()),'edge_x_peak':float(dx.max()),'edge_y_peak':float(dy.max()),'autocorrelation_peak':peak,'autocorrelation_shift_px':[int(index[1]),int(index[0])],'basis':'decoded straight RGB / 255; autocorrelation circular luminance at 128px; excludes nearby shifts'}

def tile_codes(metrics,material,cfg=None):
    cfg=cfg or policy();codes=[]
    if max(metrics['edge_x_mean'],metrics['edge_y_mean'])>cfg['tile_edge_mean_max']: codes.append('TILE_SEAM_MEAN')
    if max(metrics['edge_x_peak'],metrics['edge_y_peak'])>cfg['tile_edge_peak_max']: codes.append('TILE_SEAM_PEAK')
    if material!='kerb' and metrics['autocorrelation_peak']>cfg['tile_autocorrelation_max']: codes.append('TILE_REPETITION')
    return codes

def normalize(image,style,shape=None,cell_limit=128):
    box=image.getbbox()
    if not box: raise ValueError('empty alpha cannot normalize')
    cropped=image.crop(box)
    target=round(float(shape['lengthM'])*style['pixels_per_metre']) if shape else cell_limit-2*style['gutter_px']
    scale=target/cropped.width if shape else target/max(cropped.size)
    size=(max(1,round(cropped.width*scale)),max(1,round(cropped.height*scale)))
    gutter=style['gutter_px']
    cell=tuple(2**math.ceil(math.log2(v+2*gutter)) for v in size)
    resized=cropped.resize(size,Image.Resampling.LANCZOS)
    out=Image.new('RGBA',cell)
    offset=((cell[0]-size[0])//2,(cell[1]-size[1])//2)
    out.paste(resized,offset)
    rgba=np.asarray(out).copy();mask=rgba[:,:,3]>0
    _,ix=ndimage.distance_transform_edt(~mask,return_indices=True)
    rgba[~mask,:3]=rgba[ix[0][~mask],ix[1][~mask],:3]
    pivot=[offset[0]+size[0]/2,offset[1]+size[1]/2]
    return Image.fromarray(rgba),{'source_bounds_px':list(box),'source_pivot_px':[(box[0]+box[2])/2,(box[1]+box[3])/2],'pivot_px':pivot,'cell_px':list(cell),'subject_px':list(size),'scale':scale,'world_length_m':float(shape['lengthM']) if shape else None,'gutter_px':gutter,'filter':style['filter'],'mipmaps':style['mipmaps']}

def shapes():
    if (ART/'contracts/c1-source.json').exists():
        from family import check_scale_contract
        return check_scale_contract()
    with (ROOT/read_json(ART/'style.json')['source_shapes']).open() as f: return {r['id']:r for r in csv.DictReader(f)}

def process_one(row,path,output_dir):
    cfg=policy();style=style_for(row);output_dir=Path(output_dir);output_dir.mkdir(parents=True,exist_ok=True)
    record={'id':row['id'],'class':row['class'],'kind':row['kind'],'source':str(Path(path).resolve()),'source_sha256':sha(path),'gate_version':cfg['version'],'gates_hash':digest(cfg),'brief':row,'verdict':'owner-review','codes':[]}
    record['style_hash']=digest(style)
    record['style_version']=style['version']
    record['processor_sources']={'process.py':sha(Path(__file__))}
    if row['kind']=='sheet':record['processor_sources']['animation.py']=sha(Path(__file__).with_name('animation.py'))
    with Image.open(path) as source:
        source=source.copy()
    size_codes=['SOURCE_SIZE_BAND'] if min(source.size)<cfg['source_min_edge_px'] or max(source.size)>cfg['source_max_edge_px'] else []
    if row['kind']=='backdrop':
        out=source.convert('RGBA').resize((1024,1024),Image.Resampling.LANCZOS)
        record['metrics']={'source_size_px':list(source.size),'export_size_px':list(out.size)}
    elif row['kind']=='sheet' and (ART/'animation.json').exists() and row['class'] in read_json(ART/'animation.json').get('effects',{}):
        from animation import split_sheet,remove_cell_backgrounds
        keyed,keydata=key_image(source,cfg)
        spec=read_json(ART/'animation.json')['effects'][row['class']]
        keyed,keydata['secondary_cell_keys_rgb']=remove_cell_backgrounds(source,keyed,spec)
        record['frames'],record['codes']=split_sheet(keyed,spec,output_dir,row['id'])
        record['metrics']={**keydata,'frame_count':len(record['frames']),'source_size_px':list(source.size)}
        record['animation']=spec
        out=keyed.resize((512,512),Image.Resampling.LANCZOS)
    elif row['kind']=='tile':
        record['raw_metrics']=tile_metrics(source,cfg)
        record['raw_codes']=tile_codes(record['raw_metrics'],row['class'],cfg)
        out=source.convert('RGBA').resize((cfg['tile_size_px'],)*2,Image.Resampling.LANCZOS)
        record['metrics']=tile_metrics(out,cfg)
        # The source is diagnostic. Texture acceptance is over exactly the pixels
        # exported for shipping; downsampling can remove a one-source-pixel break.
        record['codes']=tile_codes(record['metrics'],row['class'],cfg)
        repeat=Image.new('RGBA',(out.width*2,out.height*2))
        for x in (0,out.width):
            for y in (0,out.height): repeat.paste(out,(x,y))
        repeat.save(output_dir/(row['id']+'-repeat.png'))
        record['repeat_path']=str((output_dir/(row['id']+'-repeat.png')).resolve())
    else:
        keyed,keydata=key_image(source,cfg)
        shape=shapes().get(row['class']) if row['kind']=='car' else None
        if row['kind']=='car' and shape is None: record['codes'].append('SCALE_NOT_DEFINED')
        metrics,codes=sprite_metrics(keyed,shape,cfg)
        metrics.update(keydata);metrics.update(palette_metrics(keyed,style))
        record['metrics']=metrics;record['codes']+=codes
        if metrics.get('palette_p90_delta_e') is not None and metrics['palette_p90_delta_e']>cfg['palette_p90_delta_e']: record['codes'].append('PALETTE_DRIFT')
        if keyed.getbbox():
            limit=int(row.get('cell_limit') or 128)
            if (ART/'export.json').exists():limit=read_json(ART/'export.json')['cell_limit_by_id'].get(row['id'],limit)
            out,record['placement']=normalize(keyed,style,shape,limit)
            record['placement']['export_cell_limit_px']=limit
        else: out=keyed
        a=np.asarray(out)[:,:,3]
        if a[0].any() or a[-1].any() or a[:,0].any() or a[:,-1].any(): record['codes'].append('ALPHA_BORDER')
    target=output_dir/(row['id']+'.png');out.save(target)
    if row['class'].startswith('frame-') and row['batch']=='p4-hud':
        solid=np.asarray(out)[:,:,3]>10
        holes=ndimage.binary_fill_holes(solid)&~solid;labels,count=ndimage.label(holes)
        if count:
            sizes=np.bincount(labels.ravel());sizes[0]=0;ys,xs=np.where(labels==sizes.argmax())
            record['hud_interior_px']=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
        else:record['codes'].append('HUD_INTERIOR_NOT_TRANSPARENT')
    record['codes']+=size_codes
    record['path']=str(target.resolve());record['sha256']=sha(target)
    if record['codes']: record['verdict']='reject'
    write_json(output_dir/(row['id']+'.json'),record)
    return record

def run(rows,batch):
    reports=[]
    for row in rows:
        found=candidates(row)
        if not found:
            reports.append({'id':row['id'],'class':row['class'],'kind':row['kind'],'brief':row,'source':None,'verdict':'unmeasured','codes':['SOURCE_MISSING']});continue
        result=read_json(found[-1])
        if result['status']!='generated' or not Path(result['image']).is_file() or sha(result['image'])!=result['sha256']:
            reports.append({'id':row['id'],'class':row['class'],'kind':row['kind'],'brief':row,'source':None,'verdict':'unmeasured','codes':['SOURCE_INVALID']});continue
        reports.append(process_one(row,result['image'],ART/'processed'/batch))
    write_json(ART/'reports'/(batch+'-deterministic.json'),reports)
    make_contact_sheet(reports,ART/'contact-sheets'/(batch+'-gates.png'),batch+' | deterministic gates; owner review pending')
    print(batch,{v:sum(r['verdict']==v for r in reports) for v in ('reject','owner-review','unmeasured')})
    return reports

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--briefs',default=str(ART/'briefs/p1-current.csv'));p.add_argument('--batch');a=p.parse_args()
    rows=briefs(a.briefs)
    for batch in dict.fromkeys(r['batch'] for r in rows):
        if not a.batch or a.batch==batch: run([r for r in rows if r['batch']==batch],batch)
