"""Materialize the versioned style-choice experiment; no paid calls."""
import csv
import shutil
from common import ART, read_json, write_json

DIRECTIONS = [
 ('rust-ink','Rust and Ink','Heavy rough dry-brush outlines with uneven broken edges; flat opaque painted fills, scratch hatching, only two value steps. Maximum broad-versus-narrow silhouette exaggeration, chunky angular appendages, clustered rivets and bare expanses. Aggressive blunt workshop menace.', 'Strongest silhouette and simplest moving read; scratches may disappear at sofa scale.'),
 ('bleached-poster','Bleached Poster','Weathered screen-print illustration in exactly six inks: soot black, bleached bone, sun-baked ochre, rust orange, dried-blood red and hazard yellow. Contours are carved negative-space wedges rather than drawn outlines. Hard flat cut shapes, sparse large halftone clusters, deliberately offset ink-edge slivers. Stout emblem-like proportions, very low detail density, stark sun-bleached propaganda mood.', 'Graphic economy and pale heat; must remain a vehicle rather than an emblem.'),
 ('hot-ink','Hot Ink','Hand-inked action-comic drawing: thick tapered swooping outer contour, sharp thin interior nib strokes, two hard cel-shadow shapes, limited spatter clustered at stressed corners. Long thrusting wedges, exaggerated forward rams and swept fins. Medium mechanical detail density, hot rust-orange and dried-blood-red paint against soot, small hazard-yellow accents. Frenetic insolent mood, visible brush energy.', 'Most kinetic outlines; monitor tiny spatter and action marks becoming detached noise.'),
 ('scrap-collage','Scrap Collage','Hand-assembled cut-paper and scrap-metal collage illustration, torn irregular panel edges, visibly overlapping patched flat shapes, coarse printed-paper fibres, tape seams, rivet clusters and blank geometric stencil cuts. No continuous ink contour: dark under-paper gaps separate planes. Asymmetric blocky proportions, dense detail on a few mismatched panels, rough tactile handmade mood. Matte two-tone flat shading only.', 'Patchwork identity and tactile planes; dense panels must survive downsampling.'),
 ('soot-pulp','Soot Pulp','Ominous pulp illustration built from pooled soot-black masses and a few jagged bleached-bone cut highlights, broad ragged silhouette edges, sparse scratched contour fragments. High value contrast is intrinsic paint colour, never directional illumination. Long skeletal negative spaces against swollen armoured masses; low interior detail density, rust underpainting and tiny hazard-yellow warning points. Severe haunted industrial mood, flat opaque colour with no fog baked into assets.', 'Darkest shape language with bone cutouts; neutral lighting and ground contrast need care.')
]

SUBJECTS = [
 ('heavy','Bastion','car','One single original heavy combat wagon: a broad spiked fortress with four oversized exposed tyres, a blunt welded ram at the RIGHT nose, a short roof cannon pointing RIGHT, bolted roof plates and tyre-stack rear bumper at LEFT. Length twice width. Visible dents, chipped mismatched panels and rust, intact reference configuration. Strict overhead roof-plane view, horizontal axis, complete vehicle within the middle three quarters of the canvas, generous empty margin. No occupant or exposed driver.',128),
 ('light','Needle','car','One single original light combat buggy: a very narrow stripped rat-rod with four exposed skinny wheels, empty skeletal cage, exposed engine at LEFT rear and a tapered forked ram at RIGHT nose. Length just over twice width. Patched panels, dents and soot, intact reference configuration. Strict overhead roof-plane view, horizontal axis, complete vehicle within the middle three quarters of the canvas, generous empty margin. No occupant or exposed driver.',128),
 ('portrait','rook','portrait','One isolated original fictional adult rival portrait, chest-up facing the viewer: gaunt weathered scavenger with angular cheekbones, a healed cheek scar, broken-lens goggles on the forehead, uneven cropped hair, dust scarf and one welded shoulder plate. Bitter calculating expression. The entire head and shoulder silhouette fits inside the middle three quarters with generous margin. Flat neutral even light; this is a portrait, not a person inside a vehicle.',256),
 ('ground','asphalt-worn','tile','Entire image is ONLY an empty worn asphalt material patch viewed directly overhead. Anonymous fine cracks, tiny abrasion strokes and grit; low contrast middle-dark values, uniform density and even light. One unrepeated stochastic field fills every edge and continues seamlessly across all boundaries. No repeated quadrants, mirrored halves, large cracks, identifiable motifs, objects, road markings, cars, border or grid.',256),
 ('barrier','concrete','prop','One isolated original road barricade viewed strictly from above: a horizontal battered concrete block with bolted scrap end caps and a few blank hazard-yellow diagonal paint bands worn away. Chips, rust fasteners and patched top surface, no readable symbols. Top plane only, entire silhouette in the middle three quarters with generous margin; no ground or cast shadow.',128),
 ('icon','repair','icon','One isolated repair HUD icon: a single battered open-ended wrench with a wide recognisable jaw and taped grip, chipped bone metal and one small hazard-yellow patch. Diagonal simple silhouette legible at 32 pixels, sparse large marks, no badge, circular backing, lettering or additional objects. Entire wrench in the middle three quarters with generous margin.',128),
 ('effect','spark-burst','effect','One isolated compact impact spark burst, a single still effect sprite: a central pale bone star with seven uneven short hot ochre and rust-orange tapered sparks radiating outwards. Strong central mass, crisp opaque painted sparks, no smoke, glow gradient, sheet, grid, object, lettering or background scene. Everything in the middle three quarters with generous margin.',128)
]

def main():
    archive=ART/'style-v1.json'
    if not archive.exists(): shutil.copyfile(ART/'style.json',archive)
    if not (ART/'review-v1.html').exists(): shutil.copyfile(ART/'review.html',ART/'review-v1.html')
    if not (ART/'STYLE-v1.md').exists(): shutil.copyfile(ART/'STYLE.md',ART/'STYLE-v1.md')
    old=read_json(archive)
    palette=['#171513','#39302A','#A37738','#B4512D','#6C2427','#DDD0A6','#B4A044']
    neutral='Original digital hand-drawn 2D wasteland combat-game art. Wear belongs on every manufactured surface: dents, rust bloom, chipped paint, soot and dirt in seams; no factory-new finish. Shared material palette: soot black, sun-baked ochre, rust orange, dried-blood red and bleached bone; one toxic hazard-yellow accent. Detail clusters at silhouette anchors, never uniform noise. Neutral flat even diffuse light, symmetric material shading, no directional illumination and no baked cast shadow. '
    negative='No franchise references, existing fictional characters or copied vehicles, brands, logos, text, letters, numbers, watermark, clean primaries, factory-new surfaces, photorealism, 3D render, perspective, cast shadows or cropped subject. No occupants inside vehicles. No decorative ground behind isolated subjects.'
    common={**old,'version':'wasteland-choice-v2','status':'awaiting-owner-choice','accents':{},'palette':palette,'negative':negative,'style_block':neutral,'owner_choice_file':'OWNER-CHOICE.md'}
    write_json(ART/'style.json',common)
    rows=[]
    for slug,name,block,rationale in DIRECTIONS:
        style={**common,'version':'wasteland-'+slug+'-v2','name':name,'rationale':rationale,'style_block':neutral+block}
        write_json(ART/f'style-{slug}.json',style)
        for role,cls,kind,action,limit in SUBJECTS:
            rows.append(dict(id=f'v1-{slug}-{role}-v1',**{'class':cls},prompt_action=action,size='1024x1024',frame='single',background_key='none' if kind=='tile' else '#FF00FF',count=1,status='ready',kind=kind,reference='',batch=f'v1-{slug}',approval='pending',requires_approval='',cell_limit=limit,style_file=f'style-{slug}.json',wave='V1',proof_role=role))
    with (ART/'briefs/v1-directions.csv').open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    write_json(ART/'style-directions.json',{'schema':1,'status':'owner-choice-pending','subjects':[s[0] for s in SUBJECTS],'directions':[{'slug':s,'name':n,'style_file':f'style-{s}.json','rationale':r} for s,n,b,r in DIRECTIONS],'planned_image_allowance':70,'generation':'Grok CLI through gen.py, no fixed pixel seed','production_gate':'OWNER-CHOICE.md; exact reference approval additionally required for damage/livery'})

if __name__=='__main__': main()
