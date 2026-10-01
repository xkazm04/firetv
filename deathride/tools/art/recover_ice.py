"""Fixed centre-crop trials for visible edge lighting missed by numeric seam gates."""
from PIL import Image
from common import ART,read_json,write_json,sha,make_contact_sheet
from process import tile_metrics,tile_codes
from wrap_tiles import wrap

def trials():
    parent=next(r for r in read_json(ART/'reports/p2-materials-deterministic.json') if r['class']=='ice')
    source=Image.open(parent['source']).convert('RGBA');folder=ART/'processed/p4-ice-recovery';folder.mkdir(parents=True,exist_ok=True);records=[]
    for size in (768,512,256):
        left=(source.width-size)//2;top=(source.height-size)//2;box=[left,top,left+size,top+size]
        crop=source.crop(box).resize((256,256),Image.Resampling.LANCZOS);out=wrap(crop);metrics=tile_metrics(out);codes=tile_codes(metrics,'ice')
        path=folder/('ice-centre-'+str(size)+'.png');out.save(path)
        record={**parent,'id':'p4-ice-centre-'+str(size)+'-v1','source':str(path.resolve()),'source_sha256':sha(path),'path':str(path.resolve()),'sha256':sha(path),'metrics':metrics,'codes':codes,'verdict':'reject' if codes else 'owner-review','derivation':{'recipe':'fixed-centre-crop-v1 + opposite-edge-blend-v1','parent_id':parent['id'],'parent_raw_sha256':parent['source_sha256'],'crop_px':box,'band_px':8,'before_metrics':tile_metrics(crop),'new_grok_calls':0}}
        repeat=Image.new('RGBA',(512,512))
        for x in (0,256):
            for y in (0,256):repeat.paste(out,(x,y))
        rp=folder/('ice-centre-'+str(size)+'-repeat.png');repeat.save(rp);record['repeat_path']=str(rp.resolve());records.append(record)
    write_json(ART/'reports/p4-ice-recovery-trials.json',records)
    make_contact_sheet([{**r,'path':r['repeat_path']} for r in records],ART/'contact-sheets/p4-ice-recovery-trials.png','Ice centre-crop trials | real 2x2 exported repeats; selection pending')
    print([(r['id'],r['codes']) for r in records])

if __name__=='__main__':trials()
