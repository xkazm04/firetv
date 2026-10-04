"""Review actual exported effect frames on a neutral checker, plus local GIF previews."""
from PIL import Image,ImageDraw
from common import ART,read_json,write_json,sha,make_contact_sheet

def checker(size):
    im=Image.new('RGBA',size,'#70747A');draw=ImageDraw.Draw(im)
    for y in range(0,size[1],16):
        for x in range(0,size[0],16):
            if (x//16+y//16)%2:draw.rectangle((x,y,x+15,y+15),fill='#85898F')
    return im

def build():
    folder=ART/'processed/p4-export-previews';folder.mkdir(parents=True,exist_ok=True);items=[]
    for record in read_json(ART/'reports/p4-effects-deterministic.json'):
        if record['codes']:continue
        sheet=Image.new('RGB',(768,512),'#70747A');frames=[]
        for frame in record['frames']:
            pixels=Image.open(frame['path']).convert('RGBA').resize((256,256),Image.Resampling.NEAREST)
            preview=checker((256,256));preview.alpha_composite(pixels);preview=preview.convert('RGB');frames.append(preview)
            sheet.paste(preview,((frame['index']%3)*256,(frame['index']//3)*256))
        path=folder/(record['id']+'-export.png');sheet.save(path)
        frames[0].save(ART/'contact-sheets'/(record['id']+'-preview.gif'),save_all=True,append_images=frames[1:],duration=[f['duration_ms'] for f in record['frames']],loop=0)
        item={**record,'id':record['id']+'-export','source':str(path.resolve()),'source_sha256':sha(path),'path':str(path.resolve()),'sha256':sha(path),'review_context':'This is a deterministic contact sheet of the SIX actual exported RGBA frames, arranged three across and two down, enlarged 2x without altering pixels. The neutral grey checkerboard is a review backing, never part of the art or an unwanted grid. Judge only foreground subject, six-phase progression, unwanted objects/text and lighting. Magenta backgrounds and source separators have already been removed.','export_parent_id':record['id'],'export_frame_hashes':[f['sha256'] for f in record['frames']]}
        items.append(item)
    write_json(ART/'reports/p4-export-review-deterministic.json',items)
    make_contact_sheet(items,ART/'contact-sheets/p4-export-review.png','Actual exported effect pixels | neutral checkerboard; six frames each')

if __name__=='__main__':build()
