"""Build small versioned inputs for the surface lab, without any paid generation."""
import math
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from common import ART, ROOT, read_json, write_json, sha
from process import tile_metrics, tile_codes

LAB=ROOT/'tools/art/surface-lab'
OUT=ART/'surface-lab/inputs'

def main():
    OUT.mkdir(parents=True,exist_ok=True);records=[]
    def copy(source,name,role,codes=None):
        source=source.resolve();dest=OUT/name;shutil.copyfile(source,dest)
        records.append({'file':name,'source':str(source),'source_sha256':sha(source),'sha256':sha(dest),'role':role,'source_gate_codes':codes or [],'owner_approved':False})
    reports={}
    for p in (ART/'reports').glob('*-deterministic.json'):
        value=read_json(p)
        if isinstance(value,list):
            for r in value:
                if r.get('path'):reports[r['id']]=r
    def exported(asset):
        r=reports[asset];p=__import__('pathlib').Path(r['path'])
        if sha(p)!=r['sha256']:raise ValueError('stale export '+asset)
        return p
    copy(exported('p4-tiles-asphalt-worn-v1'),'baseline.png','v1 worn asphalt comparison')
    copy(exported('p4-tiles-dirt-v1'),'dirt.png','same v1 dirt in every experiment')
    for i,slug in enumerate(['rust-ink','bleached-poster','scrap-collage']):
        r=read_json(ART/'reports'/f'v1-{slug}-deterministic.json')
        r=next(r for r in r if r['brief']['proof_role']=='ground')
        copy(__import__('pathlib').Path(r['path']),f'ground-{i}.png','unapproved '+slug+' style proof; failures visible',r['codes'])
    r=next(r for r in read_json(ART/'reports/v1-rust-ink-deterministic.json') if r['brief']['proof_role']=='heavy')
    copy(__import__('pathlib').Path(r['path']),'car.png','same original unapproved heavy proof in all modes',r['codes'])
    atlas=Image.new('RGBA',(512,512));d=ImageDraw.Draw(atlas)
    # Select exact delivered revisions by logical names; never guess a revision.
    selected={r['logical_name']:r['id'] for r in read_json(ART/'selections.json')['assets'] if r.get('logical_name')}
    logical=['decals/cracks','decals/oil','decals/skid','decals/scorch','landmarks/stone-stack','barriers/concrete-straight']
    for i,name in enumerate(logical):
        asset=selected[name];source=exported(asset);im=Image.open(source).convert('RGBA');im.thumbnail((116,116))
        x=(i%4)*128+(128-im.width)//2;y=(i//4)*128+(128-im.height)//2;atlas.alpha_composite(im,(x,y))
        records.append({'atlas_region':i,'logical_name':name,'source_id':asset,'source_sha256':sha(source),'role':'same v1 detail in all modes; surface technique experiment'})
    # Code-native soft coverage masks are experimental renderer primitives, not generated world art.
    for col in [2,3]:
        mask=Image.new('RGBA',(128,128));m=ImageDraw.Draw(mask)
        m.ellipse((12,35,116,93),fill=(255,255,255,150 if col==2 else 220));mask=mask.filter(ImageFilter.GaussianBlur(12 if col==2 else 5));atlas.alpha_composite(mask,(col*128,128))
    d=ImageDraw.Draw(atlas);d.rectangle((4,260,15,271),fill='white');atlas.save(OUT/'details.png')
    # Smooth periodic macro field: fixed algorithm, seed, harmonics and extrema recorded.
    rng=np.random.default_rng(713);y,x=np.mgrid[0:128,0:128]/128;field=np.zeros((128,128))
    for fx,fy,amp in [(1,0,1),(0,1,.8),(1,1,.6),(2,1,.3),(1,3,.2)]:field+=amp*np.sin(2*np.pi*(fx*x+fy*y)+rng.uniform(0,2*np.pi))
    field=(field-field.min())/(field.max()-field.min());a=np.uint8(np.rint(field*255));Image.fromarray(a).convert('RGBA').save(OUT/'macro.png')
    manifest={'schema':1,'seed':713,'macro_algorithm':'five periodic sine harmonics; numpy PCG64 phase seed 713; 128 square RGBA','scope':'review-only lab inputs; not production selections','records':records,'files':{p.name:{'sha256':sha(p),'size':Image.open(p).size} for p in OUT.glob('*.png')}}
    write_json(ART/'surface-lab/inputs.json',manifest)
    assets=LAB/'assets';assets.mkdir(parents=True,exist_ok=True)
    for p in OUT.glob('*.png'):shutil.copyfile(p,assets/p.name)
    print('Prepared',len(manifest['files']),'lab textures; immutable manifest hashes recorded')

if __name__=='__main__':main()
