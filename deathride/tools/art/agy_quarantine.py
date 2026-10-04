"""Measure both ash outputs without accepting or retrying the provider violation."""
from pathlib import Path
from PIL import Image
from common import ART, ROOT, digest, read_json, sha, style_for
from agy_pipeline import pipeline as p
from process import policy, key_image
from animation import remove_cell_backgrounds, split_sheet

def main():
    audit=read_json(ART/'audits/a1-extra-call.json');records=p.records();known={r['id'] for r in records}
    row=next(r for r in p.rows() if r['id']=='agy-scrap-ash-v1')
    for image in audit['images']:
        path=ROOT/image['path'];label='unrequested-edit' if 'noboxes' in path.name else 'first-output';id='agy-scrap-ash-'+label
        if id in known:continue
        assert sha(path)==image['sha256']
        source=Image.open(path).convert('RGBA');cfg=policy();keyed,keydata=key_image(source,cfg)
        spec=dict(columns=3,rows=2,frames=6,durations_ms=[160]*6,loop=True,pivot='fixed cell centre',frame_cell_px=64)
        keyed,keydata['secondary_cell_keys_rgb']=remove_cell_backgrounds(source,keyed,spec)
        folder=ART/'processed/regions'/id;folder.mkdir(parents=True,exist_ok=True)
        frames,codes=split_sheet(keyed,spec,folder,id)
        if min(source.size)<cfg['source_min_edge_px'] or max(source.size)>cfg['source_max_edge_px']:codes.append('SOURCE_SIZE_BAND')
        dest=folder/(id+'.png');keyed.thumbnail((768,512));keyed.save(dest)
        r=dict(id=id,**{'class':'ash'},kind='sheet',brief=dict(row,logical_name='regions/scrap/atmosphere/ash/'+label),
               source=str(path),source_sha256=sha(path),path=str(dest),sha256=sha(dest),codes=codes+['PROVIDER_CONTRACT_HOLD'],
               metrics=keydata,frames=frames,animation=spec,gates_hash=digest(cfg),style_hash=digest(style_for(row)),
               verdict='technical-hold',origin='contract-quarantine',owner_approved=False,runtime_enabled=False,region='scrap',
               fallback='weather disabled; owner/provider contract review pending',audit='audits/a1-extra-call.json')
        p.frame_preview(r,folder);records.append(r)
    p.save(records)

if __name__=='__main__':main()
