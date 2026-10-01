"""Make reproducible rotation representations and count their actual RGBA storage."""
import json
import math
from pathlib import Path
from PIL import Image
from common import ART,ROOT,read_json,write_json,sha,make_contact_sheet
import numpy as np
from scipy import ndimage

def inspect_generated():
    from process import key_image,policy,sprite_metrics
    source=ART/'raw/p3-generated-headings-v1/attempt-01/1.jpg'
    im,_=key_image(Image.open(source));a=np.asarray(im).copy();mask=a[:,:,3]>0
    lines=ndimage.binary_opening(mask,structure=np.ones((1,800)))|ndimage.binary_opening(mask,structure=np.ones((800,1)))
    mask&=~ndimage.binary_dilation(lines,iterations=3)
    labels,count=ndimage.label(mask);objects=[]
    for n,box in enumerate(ndimage.find_objects(labels),1):
        if box and (labels[box]==n).sum()>3000:
            y,x=box;objects.append((int((y.start+y.stop)/2)//256,int((x.start+x.stop)/2)//256,box,n))
    frames=[];views=[]
    for row,col,box,n in sorted(objects):
        y,x=box;frame=a[y,x].copy();frame[:,:,3]=np.where(labels[y,x]==n,frame[:,:,3],0)
        frame=Image.fromarray(frame);metrics,_=sprite_metrics(frame,{'lengthM':2,'widthM':1})
        expected=((row*4+col)*22.5)%180;expected=min(expected,180-expected)
        actual=metrics['principal_axis_degrees'];error=abs(actual-expected)
        path=ART/'processed/headings'/f'generated-{row}-{col}.png';frame.save(path)
        frames.append({'row':row,'col':col,'unsigned_axis_degrees':actual,'expected_unsigned_axis_degrees':expected,'axis_error_degrees':error})
        views.append({'id':f'frame {row*4+col}: axis {actual:.1f} expected {expected:.1f}','path':str(path),'verdict':'reject' if error>10 else 'axis only passes'})
    codes=['DRAWN_GRID'] if lines.any() else []
    if len(frames)!=16:codes.append('FRAME_COUNT')
    if any(f['axis_error_degrees']>10 for f in frames):codes.append('HEADING_SEQUENCE')
    write_json(ART/'reports/p3-generated-headings-analysis.json',{'source_sha256':sha(source),'frame_count':len(frames),'frames':frames,'codes':codes,'verdict':'reject' if codes else 'owner-review','device':'not measured; rejected source representation','note':'Unsigned PCA measures axis only, never front versus rear. Long drawn grid removed for diagnostic component counting, not accepted asset repair.'})
    make_contact_sheet(views,ART/'contact-sheets/p3-generated-headings-analysis.png','Generated heading sequence | unsigned axis diagnostic')

def build():
    source=ART/'processed/p1-cars/p1-car-line-v2.png'
    im=Image.open(source).convert('RGBA')
    # A square, fixed-origin cell is common to every representation; body is never re-trimmed per heading.
    size=2**math.ceil(math.log2(math.hypot(*im.size)))
    # Visible content is smaller than the original padded rectangle.
    bbox=im.getbbox();size=2**math.ceil(math.log2(math.hypot(bbox[2]-bbox[0],bbox[3]-bbox[1])+8))
    base=Image.new('RGBA',(size,size));base.paste(im,((size-im.width)//2,(size-im.height)//2))
    folder=ROOT/'tools/art/stick-probe/src/main/assets';folder.mkdir(parents=True,exist_ok=True)
    base.save(folder/'single.png')
    manifest={'source':str(source),'sha256':sha(source),'cell_px':size,'representations':{}}
    views=[]
    for count in (1,16,32):
        frames=[base.rotate(360*i/count,resample=Image.Resampling.BICUBIC) for i in range(count)]
        page_size=read_json(ART/'style.json')['texture_budget']['page_px']
        across=page_size//size;per_page=across*across;pages=[]
        if count==1:pages=['single.png']
        else:
            for start in range(0,count,per_page):
                page=Image.new('RGBA',(page_size,page_size))
                for i,frame in enumerate(frames[start:start+per_page]):page.paste(frame,((i%across)*size,(i//across)*size))
                name=f'h{count}-{start//per_page}.png';page.save(folder/name);pages.append(name)
        pixels=sum(Image.open(folder/name).width*Image.open(folder/name).height for name in pages)
        manifest['representations'][str(count)]={'pages':pages,'rgba_bytes':pixels*4,'mib':pixels*4/2**20,'headings':count,'max_heading_error_degrees':0 if count==1 else 180/count,'per_page':per_page,'columns':across}
        for i in range(min(count,8)):
            path=ART/'processed/headings'/f'h{count}-{i}.png';path.parent.mkdir(parents=True,exist_ok=True);frames[i].save(path)
            views.append({'id':f'{count} headings / frame {i}','path':str(path),'verdict':'representation probe'})
    write_json(folder/'headings.json',manifest);write_json(ART/'device/headings-memory.json',manifest)
    make_contact_sheet(views,ART/'contact-sheets/p3-headings.png','Heading representations | same source, fixed art pivot')
    print(json.dumps(manifest['representations'],indent=2))

if __name__=='__main__':
    import sys
    (inspect_generated if '--inspect-generated' in sys.argv else build)()
