"""Bake a small natural-edge ribbon and assemble exact fusion lab inputs once."""
import shutil
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
from common import ART,ROOT,read_json,write_json,sha

OUT=ART/'surface-lab/fusion-inputs'

def bake_ribbon(road,dirt,seed=713):
    """512 longitudinal x 256 transverse, periodic wear; no frame-time work."""
    rng=np.random.default_rng(seed);h,w=256,512
    yy,xx=np.mgrid[:h,:w];s=xx/w;t=(yy+.5-h/2)/(h/2)
    phases=rng.uniform(0,2*np.pi,8)
    irregular=sum(a*np.sin(2*np.pi*f*s+p) for a,f,p in zip((.030,.019,.014,.009),(1,3,7,13),phases[:4]))
    opposite=sum(a*np.sin(2*np.pi*f*s+p) for a,f,p in zip((.030,.019,.014,.009),(2,5,9,17),phases[4:]))
    edge=.79+np.where(t>0,irregular,opposite)
    d=np.abs(t)-edge
    # Blended road/dirt shoulder is a pigment transition, never an ink outline.
    noise=rng.uniform(-.014,.014,(h,w))
    soil=np.clip((d+.035+noise)/.095,0,1)[...,None]
    ra=np.asarray(road.convert('RGB').resize((256,256)),dtype=float)
    da=np.asarray(dirt.convert('RGB').resize((256,256)),dtype=float)
    base=ra[yy%256,xx%256]*(1-soil)+da[yy%256,xx%256]*soil
    rubber=np.exp(-((np.abs(t)-.59-.02*np.sin(s*2*np.pi*3))/.026)**2)
    broken=(np.sin(2*np.pi*s*9+.8)+np.sin(2*np.pi*s*17)>1.05)*.10
    base*=1-(rubber*broken)[...,None]
    # Tiny disconnected worn paint fragments only; no continuous parallel line.
    paint=(np.abs(np.abs(t)-.68-irregular)<.009)&(np.sin(s*2*np.pi*11)>.97)&(rng.random((h,w))>.42)
    base[paint]=base[paint]*.72+np.array([180,163,124])*.28
    alpha=np.clip((.995-np.abs(t)+np.where(t>0,irregular,opposite)*.22)/.055,0,1)
    rgba=np.dstack((np.uint8(np.clip(base,0,255)),np.uint8(alpha*255)))
    # Exact wrap of the longitudinal boundary; retain variation in the interior.
    mean=np.uint8((rgba[:,0].astype(float)+rgba[:,-1])/2);rgba[:,0]=mean;rgba[:,-1]=mean
    return Image.fromarray(rgba)

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    world=read_json(ART/'reports/v4-fusion-current-deterministic.json')
    cars=read_json(ART/'reports/v2-fusion-current-deterministic.json')
    # A measured tile derivative can replace its original, with provenance retained.
    derivatives=ART/'reports/v4-fusion-derivatives-deterministic.json'
    if derivatives.exists():world+=read_json(derivatives)
    sources={};records=[]
    for r in world:
        if r.get('path') and not r['codes']:sources[r['brief'].get('logical_name',r['brief']['asset_family']+'/'+r['class'])]=r
    def pixels(key):
        r=sources[key]
        if sha(r['path'])!=r['sha256']:raise ValueError('stale export '+key)
        records.append({'logical_name':key,'id':r['id'],'source_sha256':r['source_sha256'],'export_sha256':r['sha256'],'codes':r['codes']})
        return Image.open(r['path']).convert('RGBA')
    road=pixels('tiles/asphalt-worn');soil=pixels('tiles/dirt')
    road.save(OUT/'ground.png');soil.save(OUT/'dirt.png')
    bake_ribbon(road,soil).save(OUT/'ribbon.png')
    detail=Image.new('RGBA',(512,512));mapping=[]
    names=['decals/skid','decals/oil','decals/scorch','decals/cracks','decals/impact',
           'props/brush','props/rock-field','props/soft-dune','props/dead-tree','props/rock-spire','barriers/concrete-straight']
    for i,name in enumerate(names):
        im=pixels(name);im=im.crop(im.getbbox());im.thumbnail((112,112),Image.Resampling.LANCZOS)
        detail.alpha_composite(im,((i%4)*128+(128-im.width)//2,(i//4)*128+(128-im.height)//2));mapping.append({'cell':i,'logical_name':name})
    mask=Image.new('RGBA',(128,128));d=ImageDraw.Draw(mask);d.ellipse((10,32,118,96),fill=(255,255,255,210));mask=mask.filter(ImageFilter.GaussianBlur(5));detail.alpha_composite(mask,(384,256));detail.save(OUT/'details.png')
    # Occupy one declared 1024 car page; the resident probe allocates the second.
    page=Image.new('RGBA',(1024,1024));car_mapping=[]
    for i,r in enumerate(r for r in cars if r['kind']=='car' and not r['codes']):
        im=Image.open(r['path']).convert('RGBA');im=im.crop(im.getbbox());im.thumbnail((96,96),Image.Resampling.LANCZOS)
        page.alpha_composite(im,((i%4)*128+(128-im.width)//2,(i//4)*128+(128-im.height)//2));car_mapping.append({'cell':i,'id':r['id'],'export_sha256':r['sha256']})
    page.save(OUT/'cars.png')
    manifest={'schema':1,'seed':713,'scope':'fusion isolated lab; same inputs for control and natural-edge variant; owner review pending',
        'ribbon':{'size':[512,256],'rgba_bytes':512*256*4,'recipe':'periodic material encroachment + sparse rubber and worn paint; baked once offline per material/seed; cached course UVs close at lap seam','generator_sha256':sha(__file__),'per_frame_generation':False},
        'records':records,'details':mapping,'cars':car_mapping,
        'excluded_cars':[{'id':r['id'],'codes':r['codes']} for r in cars if r['kind']=='car' and r['codes']],
        'files':{p.name:{'sha256':sha(p),'size':Image.open(p).size} for p in OUT.glob('*.png')}}
    write_json(ART/'surface-lab/fusion-inputs.json',manifest)
    dest=ROOT/'tools/art/surface-lab/assets/fusion';dest.mkdir(parents=True,exist_ok=True)
    for p in OUT.glob('*.png'):shutil.copyfile(p,dest/p.name)
    print('Fusion inputs prepared; ribbon adds 0.5 MiB; course vertices 28.125 KiB')

if __name__=='__main__':main()
