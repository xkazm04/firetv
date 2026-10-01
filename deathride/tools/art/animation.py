"""Validate and split actual image-sheet pixels without changing per-frame origin."""
import math
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from common import read_json,ART,sha

def remove_cell_backgrounds(source,keyed,spec):
    """Remove secondary flat key panels, seeded only in required empty cell margins."""
    rgb=np.asarray(source.convert('RGB')).astype(float);rgba=np.asarray(keyed.convert('RGBA')).copy();h,w=rgb.shape[:2];keys=[]
    for row in range(spec['rows']):
        for col in range(spec['columns']):
            x0=round(col*w/spec['columns']);x1=round((col+1)*w/spec['columns']);y0=round(row*h/spec['rows']);y1=round((row+1)*h/spec['rows']);cell=rgb[y0:y1,x0:x1]
            ch,cw=cell.shape[:2];samples=[];coords=[]
            for fx,fy in ((.12,.12),(.88,.12),(.12,.88),(.88,.88),(.25,.25),(.75,.25),(.25,.75),(.75,.75)):
                x,y=int(cw*fx),int(ch*fy);coords.append((y,x));samples.append(np.median(cell[max(0,y-3):y+4,max(0,x-3):x+4].reshape(-1,3),axis=0))
            cell_keys=[]
            for colour in samples:
                # Grey smoke and ivory sparks are foreground, never secondary keys.
                is_key=min(colour[0],colour[2])-colour[1]>12
                if not is_key or any(np.linalg.norm(colour-np.array(k))<10 for k in cell_keys):continue
                near=np.linalg.norm(cell-colour,axis=2)<36;seed=np.zeros(near.shape,bool)
                for y,x in coords:seed[y,x]=near[y,x]
                background=ndimage.binary_propagation(seed,mask=near)
                rgba[y0:y1,x0:x1,3][background]=0;cell_keys.append(colour.tolist())
            keys.append(cell_keys)
    # A drawn white separator is a recoverable sheet background only when it spans
    # at least 90% of the entire image. Short ivory effect highlights are preserved.
    white=(rgb.min(axis=2)>210)&((rgb.max(axis=2)-rgb.min(axis=2))<35)
    grid=ndimage.binary_opening(white,structure=np.ones((1,max(2,round(w*.9)))))|ndimage.binary_opening(white,structure=np.ones((max(2,round(h*.9)),1)))
    grid=ndimage.binary_dilation(grid,iterations=2) if grid.any() else grid
    rgba[grid,3]=0
    # Removing secondary panels creates new keyed edges. Despill only their three-
    # pixel fringe; a whole coloured panel can never be recoloured into acceptance.
    colour=rgba[:,:,:3].astype(float);mask=rgba[:,:,3]>0
    pink=(np.minimum(colour[:,:,0],colour[:,:,2])-colour[:,:,1]>12)&(np.minimum(colour[:,:,0],colour[:,:,2])>140)&mask
    clean=mask&~pink
    count=0
    if clean.any() and pink.any():
        distance,ix=ndimage.distance_transform_edt(~clean,return_indices=True)
        edge_distance=ndimage.distance_transform_edt(mask)
        fringe=pink&(distance<=3)&(edge_distance<=3)
        count=int(fringe.sum());rgba[fringe,:3]=rgba[ix[0][fringe],ix[1][fringe],:3]
    return Image.fromarray(rgba),{'colours_by_cell':keys,'new_edge_despill_pixels':count,'maximum_despill_distance_px':3,'long_white_separator_pixels_removed':int(grid.sum())}

def split_sheet(image,spec,output_dir,asset):
    a=np.asarray(image.convert('RGBA'));h,w=a.shape[:2];cols=spec['columns'];rows=spec['rows'];count=spec['frames']
    if count!=cols*rows or len(spec['durations_ms'])!=count:raise ValueError('animation contract count mismatch')
    output_dir=Path(output_dir);output_dir.mkdir(parents=True,exist_ok=True)
    result=[];codes=[];signatures=[];size=spec['frame_cell_px'];side=max(math.ceil(w/cols),math.ceil(h/rows));gutter=4
    # Use the same source-to-output scale and origin for every frame.
    scale=(size-2*gutter)/side
    for n in range(count):
        x0=round((n%cols)*w/cols);x1=round((n%cols+1)*w/cols)
        y0=round((n//cols)*h/rows);y1=round((n//cols+1)*h/rows)
        cell=Image.fromarray(a[y0:y1,x0:x1]);alpha=np.asarray(cell)[:,:,3]>0
        occupancy=float(alpha.mean());border=np.concatenate((alpha[:3].ravel(),alpha[-3:].ravel(),alpha[:,:3].ravel(),alpha[:,-3:].ravel()))
        frame_codes=[]
        if occupancy<.0005:frame_codes.append('EMPTY_FRAME')
        if occupancy>.70:frame_codes.append('FRAME_BACKGROUND')
        if border.mean()>.005:frame_codes.append('FRAME_BOUNDARY')
        pixels=np.asarray(cell);colours=pixels[:,:,:3].astype(float)
        pink=(np.minimum(colours[:,:,0],colours[:,:,2])-colours[:,:,1]>12)&(np.minimum(colours[:,:,0],colours[:,:,2])>140)&alpha
        key_residue=float(pink.sum()/max(1,alpha.sum()))
        if key_residue>.01:frame_codes.append('FRAME_KEY_RESIDUE')
        ys,xs=np.where(alpha)
        offset=[float((xs.mean()+.5)/cell.width-.5),float((ys.mean()+.5)/cell.height-.5)] if len(xs) else None
        if offset and max(map(abs,offset))>.25:frame_codes.append('FRAME_CENTRE_DRIFT')
        target=Image.new('RGBA',(size,size));new_size=(max(1,round(cell.width*scale)),max(1,round(cell.height*scale)))
        resized=cell.resize(new_size,Image.Resampling.LANCZOS);target.paste(resized,((size-new_size[0])//2,(size-new_size[1])//2))
        path=output_dir/(asset+'-frame-'+str(n)+'.png');target.save(path)
        # Compare premultiplied pixels; transparent RGB cannot invent motion.
        rgba=np.asarray(target).astype(float)/255;signature=rgba[:,:,:3]*rgba[:,:,3,None]
        if signatures:
            delta=float(np.abs(signature-signatures[-1]).mean())
            if delta<.001:frame_codes.append('DUPLICATE_FRAME')
        else:delta=None
        signatures.append(signature)
        result.append({'index':n,'path':str(path.resolve()),'sha256':sha(path),'duration_ms':spec['durations_ms'][n],'pivot_px':[size/2,size/2],'cell_px':[size,size],'source_cell_px':[x0,y0,x1,y1],'occupancy':occupancy,'key_residue_fraction':key_residue,'centroid_offset_fraction':offset,'boundary_occupancy':float(border.mean()),'previous_mean_pixel_delta':delta,'codes':frame_codes})
        codes+=frame_codes
    return result,sorted(set(codes))
