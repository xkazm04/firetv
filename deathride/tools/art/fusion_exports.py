"""Inspect the actual six-frame exports; grade these independently of sources."""
from PIL import Image
from common import ART,read_json,write_json,sha,make_contact_sheet
from fusion_bundle import candidates
from review_exports import checker

def main():
    folder=ART/'processed/v4-fusion-export-previews';folder.mkdir(parents=True,exist_ok=True)
    items=[]
    for record in candidates().values():
        if not record.get('frames') or record['codes']:continue
        sheet=Image.new('RGB',(768,512),'#70747A');frames=[]
        for frame in record['frames']:
            if sha(frame['path'])!=frame['sha256']:raise ValueError('stale frame')
            pixels=Image.open(frame['path']).convert('RGBA').resize((256,256),Image.Resampling.NEAREST)
            preview=checker((256,256));preview.alpha_composite(pixels);preview=preview.convert('RGB');frames.append(preview)
            sheet.paste(preview,((frame['index']%3)*256,(frame['index']//3)*256))
        path=folder/(record['id']+'-export.png');sheet.save(path)
        frames[0].save(folder/(record['id']+'.gif'),save_all=True,append_images=frames[1:],duration=[f['duration_ms'] for f in record['frames']],loop=0)
        items.append({**record,'id':record['id']+'-export','source':str(path.resolve()),'source_sha256':sha(path),'path':str(path.resolve()),'sha256':sha(path),
            'review_context':'Six actual exported RGBA animation frames, three across and two down, enlarged 2x without altering pixels. The neutral grey checker is review backing, never art. Judge only foreground subject, phase progression, unwanted objects/text and lighting.',
            'export_parent_id':record['id'],'export_frame_hashes':[f['sha256'] for f in record['frames']]})
    write_json(ART/'reports/v4-fusion-exports-deterministic.json',items)
    make_contact_sheet(items,ART/'contact-sheets/v4-fusion-export-review.png','Actual exported effect pixels')
    rows=list(candidates().values())
    for family in sorted({r['brief']['asset_family'] for r in rows}):
        make_contact_sheet([r for r in rows if r['brief']['asset_family']==family],ART/'contact-sheets'/('v4-fusion-selected-'+family+'.png'),family+' selected candidates')

if __name__=='__main__':main()
