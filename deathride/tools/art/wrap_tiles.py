"""Measured, narrow-band seam repair; never hides internal repeated motifs."""
from pathlib import Path
import numpy as np
from PIL import Image
from common import ART,read_json,write_json,sha,digest,make_contact_sheet
from process import tile_metrics,tile_codes,policy

def wrap(image,band=8):
    a=np.asarray(image.convert('RGBA')).astype(float).copy();h,w=a.shape[:2]
    if band<2 or 2*band>=min(h,w):raise ValueError('invalid seam band')
    for k in range(band):
        blend=.5*(1-k/(band-1));left=a[:,k].copy();right=a[:,w-1-k].copy()
        a[:,k]=left*(1-blend)+right*blend;a[:,w-1-k]=right*(1-blend)+left*blend
    for k in range(band):
        blend=.5*(1-k/(band-1));top=a[k].copy();bottom=a[h-1-k].copy()
        a[k]=top*(1-blend)+bottom*blend;a[h-1-k]=bottom*(1-blend)+top*blend
    return Image.fromarray(np.rint(a).astype(np.uint8))

def repair(record):
    if not record['codes'] or not set(record['codes'])<=set(['TILE_SEAM_PEAK','TILE_SEAM_MEAN']):raise ValueError('only measured seam failures eligible; repeated motifs remain rejected')
    source=Path(record['path'])
    if sha(source)!=record['sha256']:raise ValueError('source changed')
    im=Image.open(source);out=wrap(im);folder=ART/'processed/p4-wrap';folder.mkdir(parents=True,exist_ok=True)
    asset=record['id']+'-wrap-v1';path=folder/(asset+'.png');out.save(path)
    metrics=tile_metrics(out);codes=tile_codes(metrics,record['class']);diff=np.any(np.asarray(im)!=np.asarray(out),axis=2)
    result={**record,'id':asset,'source':str(path.resolve()),'source_sha256':sha(path),'path':str(path.resolve()),'sha256':sha(path),'metrics':metrics,'codes':codes,'verdict':'reject' if codes else 'owner-review','derivation':{'recipe':'opposite-edge-blend-v1','band_px':8,'parent_id':record['id'],'parent_sha256':record['sha256'],'parent_raw_sha256':record['source_sha256'],'before_metrics':record['metrics'],'before_codes':record['codes'],'changed_pixel_fraction':float(diff.mean()),'interior_preserved':bool(np.array_equal(np.asarray(im)[8:-8,8:-8],np.asarray(out)[8:-8,8:-8]))}}
    repeat=Image.new('RGBA',(512,512))
    for x in (0,256):
        for y in (0,256):repeat.paste(out,(x,y))
    repeat_path=folder/(asset+'-repeat.png');repeat.save(repeat_path);result['repeat_path']=str(repeat_path.resolve())
    write_json(folder/(asset+'.json'),result)
    return result

def main():
    candidates=read_json(ART/'reports/p4-tiles-deterministic.json');fixed=[repair(r) for r in candidates if r.get('codes') and set(r['codes'])<=set(['TILE_SEAM_PEAK','TILE_SEAM_MEAN'])]
    write_json(ART/'reports/p4-wrap-deterministic.json',fixed)
    make_contact_sheet(fixed,ART/'contact-sheets/p4-wrap-gates.png','Narrow-band seam repair | before metrics retained; unchanged interiors')
    make_contact_sheet([{**r,'path':r['repeat_path']} for r in fixed],ART/'contact-sheets/p4-wrap-repeat.png','Seam-repaired materials | 2x2 actual shipping pixels')
    print([(r['id'],r['codes'],r['derivation']['changed_pixel_fraction']) for r in fixed])

if __name__=='__main__':main()
