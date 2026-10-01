"""Extract a unique material period from a repeated generated preview, without new calls."""
from pathlib import Path
from PIL import Image
from common import ART,read_json,write_json,sha,make_contact_sheet
from process import tile_metrics,tile_codes
from wrap_tiles import wrap

def run():
    parent=read_json(ART/'reports/p2-materials-final-deterministic.json')[0]
    source=Image.open(parent['source']).convert('RGBA');folder=ART/'processed/p4-gravel-recovery';folder.mkdir(parents=True,exist_ok=True)
    trials=[];selected=[]
    for size in (1024,512,256):
        crop=source.crop((0,0,size,size)).resize((256,256),Image.Resampling.LANCZOS)
        before=tile_metrics(crop);out=wrap(crop);metrics=tile_metrics(out);codes=tile_codes(metrics,'gravel')
        path=folder/('gravel-period-'+str(size)+'.png');out.save(path)
        trial={'id':'gravel-period-'+str(size),'path':str(path.resolve()),'source_crop_px':[0,0,size,size],'before_metrics':before,'metrics':metrics,'codes':codes,'verdict':'reject' if codes else 'candidate'};trials.append(trial)
        if not codes and not selected:
            record={**parent,'id':'p4-gravel-period-v1','source':str(path.resolve()),'source_sha256':sha(path),'path':str(path.resolve()),'sha256':sha(path),'metrics':metrics,'codes':[],'verdict':'owner-review','derivation':{'recipe':'unique-upper-left-period-v1 + opposite-edge-blend-v1','parent_id':parent['id'],'parent_raw_sha256':parent['source_sha256'],'crop_px':[0,0,size,size],'band_px':8,'selection':'largest of fixed 1024/512/256 source crops passing unchanged final-pixel seam and repetition gates','new_grok_calls':0}}
            repeat=Image.new('RGBA',(512,512))
            for x in (0,256):
                for y in (0,256):repeat.paste(out,(x,y))
            rp=folder/'gravel-period-repeat.png';repeat.save(rp);record['repeat_path']=str(rp.resolve());selected=[record]
    write_json(ART/'reports/p4-gravel-recovery-trials.json',trials)
    write_json(ART/'reports/p4-gravel-recovery-deterministic.json',selected)
    make_contact_sheet(trials,ART/'contact-sheets/p4-gravel-recovery.png','Gravel local remedy | fixed crop candidates; no additional generation')
    print([(r['id'],round(r['metrics']['autocorrelation_peak'],4),r['codes']) for r in trials])

if __name__=='__main__':run()
