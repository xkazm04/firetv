"""Publish the seventy registered car frames into the existing two-page reserve.

Losslessly remove common transparent margins per car; retain a four-pixel gutter,
one shared pivot and reference body bounds. Never resize or stretch pixels.
"""
import math
import shutil
from PIL import Image
from common import ART, ROOT, read_json, write_json, sha, now
from atlas import pack_group, validate_selection
from validate_bundle import validate


def publish():
    review=read_json(ART/'review/fusion/review.json')
    rows=[r for r in review['records'] if r.get('role')=='derived' and not r.get('superseded')]
    if len(rows)!=70:raise ValueError('SEVENTY_REVIEWED_CAR_FRAMES_REQUIRED')
    ledger=read_json(ART/'reference-approvals.json')['references']
    refs={r['id']:r for r in review['records']}
    records=[];catalog=[];provenance=[];families=[]
    out=ROOT/'assets/phase2-states'
    if out.exists():raise ValueError('versioned bundle exists; inspect before rebuilding')
    stage=ART/'processed/art-states-bundle'
    stage.mkdir(parents=True,exist_ok=True)
    for cls in sorted({r['class'] for r in rows}):
        family=[r for r in rows if r['class']==cls]
        if len(family)!=7:raise ValueError('INCOMPLETE_CAR_FAMILY: '+cls)
        key=family[0]['brief']['requires_approval'];ref=refs[key];approval=ledger[key]
        source=ART/'review/fusion'/ref['source']
        assert approval['owner_approved'] and approval.get('owner_evidence') and sha(source)==approval['source_sha256']==ref['source_sha256']
        reference_image=Image.open(ART/'review/fusion'/ref['pixels']).convert('RGBA')
        assert sha(ART/'review/fusion'/ref['pixels'])==ref['export_sha256']
        if 'placement' not in ref:
            from process import process_one
            measured=process_one(ref['brief'],source,ART/'processed/art-states-approved-reprocess')
            assert not measured['codes'] and measured['sha256']==ref['export_sha256']
            ref['placement']=measured['placement']
        images=[Image.open(ART/'review/fusion'/r['pixels']).convert('RGBA') for r in family]
        boxes=[im.getbbox() for im in images]+[reference_image.getbbox()]
        crop=[min(b[0] for b in boxes)-4,min(b[1] for b in boxes)-4,max(b[2] for b in boxes)+4,max(b[3] for b in boxes)+4]
        # Four-pixel packing grid; added pixels are transparent, never a source-gate remedy.
        crop[2]=crop[0]+math.ceil((crop[2]-crop[0])/4)*4
        crop[3]=crop[1]+math.ceil((crop[3]-crop[1])/4)*4
        pivot=[ref['placement']['pivot_px'][0]-crop[0],ref['placement']['pivot_px'][1]-crop[1]]
        bounds=[v-crop[i%2] for i,v in enumerate(reference_image.getbbox())]
        families.append({'car_class':cls,'reference_id':key,'reference_source_sha256':ref['source_sha256'],'crop_px':crop,'pivot_px':pivot,'body_bounds_px':bounds,'scale':1})
        for r,im in zip(family,images):
            assert r['brief']['requires_approval']==key and not r['pixel_codes']
            assert r['placement']['pivot_px']==ref['placement']['pivot_px'] and im.size==reference_image.size
            assert sha(ART/'review/fusion'/r['pixels'])==r['export_sha256']
            direct=r['direct_review']
            if direct.get('verdict')=='reject' or not direct.get('note'):raise ValueError('DIRECT_REVIEW_REQUIRED: '+r['id'])
            if direct.get('source_sha256')!=r['source_sha256']:raise ValueError('STALE_DIRECT_SOURCE')
            identity=r['identity']
            if len(identity.get('observations',[]))!=2 or any(g.get('status')!='graded' or g['image_hashes']!=[ref['source_sha256'],r['source_sha256']] for g in identity['observations']):raise ValueError('PAIRED_IDENTITY_REQUIRED')
            if identity.get('verdict')=='reject' and not direct.get('identity_override'):raise ValueError('UNRESOLVED_IDENTITY_REJECTION')
            candidate={'codes':r['pixel_codes'],'path':str(ART/'review/fusion'/r['pixels']),'sha256':r['export_sha256'],'source_sha256':r['source_sha256']}
            selection={'status':'technical-accepted','review_note':direct['note'],'processed_sha256':r['export_sha256'],'source_sha256':r['source_sha256'],'owner_approved':False,
                       'model_observations':[{'model':g['model'],'status':g['status'],'image_sha256':g['image_hashes'][0]} for g in r['grades']]}
            validate_selection(selection,candidate)
            cell=im.crop(crop);target=stage/(r['id']+'.png');cell.save(target)
            records.append({'id':r['id'],'path':str(target),'sha256':sha(target),'placement':{'pivot_px':pivot},'body_bounds_px':bounds})
            action=r['brief']['id'].split('-state-')[-1].rsplit('-v',1)[0] if '-state-' in r['brief']['id'] else 'livery-'+r['brief']['id'].split('-livery-')[-1].rsplit('-v',1)[0]
            if action=='intact':action='clean'
            catalog.append({'logical_name':f'cars/{cls.lower()}/{action}','asset_id':r['id'],'group':'cars','car_class':cls,
                            'owner_approved':False,'reference_approved':True,'technical_accepted':True,'reference_id':key,'reference_source_sha256':ref['source_sha256']})
            provenance.append({'selection':selection,'id':r['id'],'source_sha256':r['source_sha256'],'registered_export_sha256':r['export_sha256'],'packed_cell_sha256':sha(target),'crop_px':crop,'pivot_px':pivot,'body_bounds_px':bounds,'scale':1,'identity':identity,'direct_review':direct})
    pages=pack_group('cars',records,stage,max_pages=2)
    meta=read_json(stage/'cars.json');bounds_by_id={r['id']:r['body_bounds_px'] for r in records}
    for r in meta['regions']:
        r['body_bounds_px']=bounds_by_id[r['id']]
        r.pop('path',None)
        r['registered_source_export']='art/review/fusion/pixels/'+r['id']+'.png'
    write_json(stage/'cars.json',meta)
    # Preserve the currently shipped HUD/world exactly in a new versioned bundle.
    source=ROOT/'assets/phase2-hud'
    for p in source.iterdir():
        if p.is_file():shutil.copyfile(p,stage/p.name)
    manifest=read_json(stage/'manifest.json');base=read_json(stage/'catalog.json')
    manifest['pages']+=pages
    used=sum(p['rgba_bytes'] for p in pages)
    if used>manifest['cars_reserved_rgba_bytes']:raise ValueError('CAR_RESERVE_EXCEEDED')
    manifest['cars_reserved_rgba_bytes']-=used
    manifest.update(bundle='phase2-states',published_at=now(),truth='Owner-approved exact car references with technically selected derived frames; derivative owner review pending.',
                    resident_policy='All world/UI/autotile/material/ribbon pages + one backdrop + two car pages; car reserve consumed, never double counted. Game scenery/fonts excluded.')
    base['assets']+=catalog
    write_json(stage/'manifest.json',manifest);write_json(stage/'catalog.json',base)
    write_json(stage/'cars-provenance.json',{'families':families,'frames':provenance,'packing':'common per-car transparent crop, four-pixel gutter, lossless pixels, unchanged aspect and registration'})
    (stage/'README.md').write_text('# ART STATES bundle\n\nPreserves the phase2-hud world/UI kit and adds 70 car regions: four states and three liveries for each of ten exact owner-approved references. Derived frames are technical selections, not owner approvals. Needle intact reuses its exact reference after three rejected no-op edits.\n\nTwo 1024-square car pages consume the existing 8 MiB reserve; declared full-kit residency remains 31.25 MiB with one backdrop. Runtime loads world/UI/cars/tiles (18.75 MiB), plus at most one 4 MiB backdrop; fonts and scenery are accounted separately by TextureBudget. Cropping removes only common transparent margins, preserving aspect, four-pixel gutters, shared pivots and reference body bounds. cars-provenance.json records every frame.\n\nHealthy cars choose base/bone/red/ochre by stable seat index. Damage takes priority and uses the original-reference paint; no damage-by-livery cross product is implied. Missing or invalid regions retain procedural fallback. See art/review/fusion/index.html for sources, rejected attempts and local grading limits.\n',encoding='utf-8')
    validate(stage,ART/'reports/art-states-bundle-validation.json')
    # Exclude intermediate per-frame PNGs from the shipped bundle.
    out.mkdir()
    for p in stage.iterdir():
        if p.is_file() and p.name not in {r['id']+'.png' for r in records}:shutil.copyfile(p,out/p.name)
    print('Published',len(records),'car frames on',len(pages),'pages;',manifest['resident_rgba_bytes_with_reserved_cars']/2**20,'MiB declared residency')


if __name__=='__main__':publish()
