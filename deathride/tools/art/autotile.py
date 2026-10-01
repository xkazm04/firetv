"""Complete eight-neighbour blob topology and reproducible source-texture composition."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from common import ART,read_json,write_json,sha,make_contact_sheet

N,NE,E,SE,S,SW,W,NW=1,2,4,8,16,32,64,128
OFFSETS=((0,-1,N),(1,-1,NE),(1,0,E),(1,1,SE),(0,1,S),(-1,1,SW),(-1,0,W),(-1,-1,NW))

def canonical(mask):
    if not 0<=mask<=255:raise ValueError('eight-bit neighbour mask required')
    for diagonal,a,b in ((NE,N,E),(SE,S,E),(SW,S,W),(NW,N,W)):
        if not (mask&a and mask&b):mask&=~diagonal
    return mask

CASES=tuple(sorted({canonical(m) for m in range(256)}))

def footprint(mask,size=120):
    if mask not in CASES:raise ValueError('noncanonical case')
    if size%4:raise ValueError('tile edge divisible by four required')
    a=np.zeros((size,size),bool);q=size//4;t=size-q
    a[q:t,q:t]=True
    if mask&N:a[:q,q:t]=True
    if mask&E:a[q:t,t:]=True
    if mask&S:a[t:,q:t]=True
    if mask&W:a[q:t,:q]=True
    if mask&NW:a[:q,:q]=True
    if mask&NE:a[:q,t:]=True
    if mask&SW:a[t:,:q]=True
    if mask&SE:a[t:,t:]=True
    return a

def barrier_mask(mask,size=120,width=8):
    filled=footprint(mask,size)
    # Cell borders continue into neighbours; don't draw a wall across shared exits.
    return filled&~ndimage.binary_erosion(filled,iterations=width,border_value=1)

def require_complete(records):
    masks=[r['mask'] for r in records]
    if len(masks)!=47 or set(masks)!=set(CASES):raise ValueError('AUTOTILE_INCOMPLETE: exact 47 unique canonical cases required')
    for r in records:
        if not Path(r['path']).is_file() or sha(r['path'])!=r['sha256']:raise ValueError('AUTOTILE_ART_MISSING_OR_CHANGED')

def mask_from_grid(grid,x,y):
    h,w=grid.shape;mask=0
    for dx,dy,bit in OFFSETS:
        if 0<=x+dx<w and 0<=y+dy<h and grid[y+dy,x+dx]:mask|=bit
    return canonical(mask)

def build(family,source_record):
    if source_record.get('codes'):raise ValueError('source pixel gates must pass')
    source=Path(source_record['path'])
    if sha(source)!=source_record['sha256']:raise ValueError('source changed')
    im=Image.open(source).convert('RGBA');box=im.getbbox();im=im.crop(box)
    if family=='barrier':
        # Sample only the interior of the accepted overhead wall, never front-face pixels.
        w,h=im.size;im=im.crop((w//4,h//4,w*3//4,h*3//4))
    texture=np.asarray(im.resize((120,120),Image.Resampling.LANCZOS)).copy()
    folder=ART/'processed'/('p4-autotile-'+family);folder.mkdir(parents=True,exist_ok=True)
    records=[]
    for mask in CASES:
        alpha=barrier_mask(mask) if family=='barrier' else footprint(mask)
        a=texture.copy();a[:,:,3]=alpha.astype(np.uint8)*255
        # Four-pixel gutter samples the logical tile edge. Region excludes this padding.
        padded=np.pad(a,((4,4),(4,4),(0,0)),mode='edge');path=folder/(f'{family}-{mask:03}.png');Image.fromarray(padded).save(path)
        records.append({'id':f'{family}-{mask:03}','mask':mask,'path':str(path.resolve()),'sha256':sha(path),'source_id':source_record['id'],'source_sha256':source_record['sha256'],'region_in_cell':[4,4,120,120],'cell_px':[128,128],'intentional_empty':family=='barrier' and mask==255,'verdict':'technical candidate'})
    require_complete(records)
    write_json(ART/'reports'/('p4-autotile-'+family+'.json'),{'family':family,'case_count':47,'resolver':[canonical(m) for m in range(256)],'bit_order':'N NE E SE S SW W NW','source':source_record,'cases':records,'recipe':'blob-quarter-v1; deterministic source pixels and canonical occupancy; owner quality pending'})
    make_contact_sheet(records,ART/'contact-sheets'/('p4-autotile-'+family+'.png'),family+' | all 47 cases; inspect topology and source style')
    # A connected, nontrivial map proves the exported pixels compose, not only IDs.
    grid=np.array([[0,0,1,1,1,0,0],[0,1,1,0,1,1,0],[1,1,0,0,0,1,1],[1,0,0,1,0,0,1],[1,1,1,1,1,1,1],[0,1,0,1,0,1,0],[0,1,1,1,1,1,0]],bool)
    canvas=Image.new('RGBA',(840,840),'#423F36');lookup={r['mask']:r for r in records}
    for y,x in np.argwhere(grid):
        tile=Image.open(lookup[mask_from_grid(grid,x,y)]['path']).crop((4,4,124,124));canvas.alpha_composite(tile,(int(x)*120,int(y)*120))
    canvas.convert('RGB').save(ART/'contact-sheets'/('p4-autotile-'+family+'-map.png'))
    return records

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--family',choices=['track-edge','barrier'],required=True);p.add_argument('--source-record',required=True);a=p.parse_args()
    build(a.family,read_json(a.source_record))
