"""Publish face-screened, owner-disabled portraits and story textures, preserving prior fallbacks."""
import shutil
from PIL import Image
from common import ART, ROOT, read_json, write_json, sha, now
from atlas import pack_group, content_hash
from face_visibility import screen
from rework2_pipeline import eligible, report, candidate_records
from validate_bundle import validate

def fields(r):
    g=screen(r)
    assert g['passed']
    return dict(face_required=True,face_visibility_version=g['version'],face_visibility_passed=True,
      face_visibility_source_sha256=r['source_sha256'],face_visibility_export_sha256=r['sha256'],
      face_height_fraction=min(c['face_height_fraction'] for c in g['checks']),
      face_eye_gap_native_px=min(c['native_eye_gap_px'] for c in g['checks']))

def build():
    folder=ROOT/'assets/phase2-states';source=ROOT/'assets/phase2-hud'
    stage=ART/'processed/rework2-face-pack';stage.mkdir(parents=True,exist_ok=True)
    chosen={}
    for r in candidate_records('faces'):
        if eligible(r):chosen[r['brief']['logical_name']]=r
    assert chosen, 'No face-screened candidates'
    meta=read_json(source/'ui.json');records=[]
    for r in meta['regions']:
        im=Image.open(source/meta['pages'][r['page']]['file']).convert('RGBA')
        cell=im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']))
        assert content_hash(cell)==r['content_sha256']
        target=stage/(r['id']+'.png');cell.save(target)
        records.append(dict(id=r['id'],path=str(target),sha256=sha(target),region_in_cell=r['region_in_cell'],
          hud_interior_px=r.get('hud_interior_px'),placement={'pivot_px':r['pivot_px']}))
    catalog=read_json(folder/'catalog.json');catalog['assets']=[e for e in catalog['assets'] if not e['logical_name'].startswith('face-first/')]
    aliases={}
    for logical,r in chosen.items():
        assert sha(r['path'])==r['sha256'] and sha(r['source'])==r['source_sha256']
        if not logical.startswith('portraits/'):continue
        records.append(r);key='face-first/'+r['class']
        catalog['assets'].append(dict(logical_name=key,asset_id=r['id'],group='ui',review_required=True,
          technical_eligible=True,owner_approved=False,owner_evidence='',source_sha256=r['source_sha256'],
          export_sha256=r['sha256'],approved_source_sha256='',approved_export_sha256='',**fields(r)))
        if r['class']!='mechanic':aliases['rival-'+r['class']]=key
    pages=pack_group('ui',records,stage)
    for name in ('ui.atlas','ui.json','ui-0.png'):shutil.copy2(stage/name,folder/name)
    catalog['face_first_portrait_aliases']=aliases
    manifest=read_json(folder/'manifest.json');manifest['pages']=[p for p in manifest['pages'] if not p['file'].startswith('ui-')]+pages
    manifest['face_rework']=dict(at=now(),portrait_candidates=sum(k.startswith('portraits/') for k in chosen),
      exact_reuses=sum(bool(r.get('reused_exact_export')) for r in chosen.values()),
      owner_approved=0,page_change=0,policy='Screened 128px face cells use spare UI atlas space. Prior portrait regions and aliases remain fallback until exact owner approval.')
    write_json(folder/'catalog.json',catalog);write_json(folder/'manifest.json',manifest)
    story_root=ROOT/'assets/story-art';story=read_json(story_root/'catalog.json')
    approvals=read_json(ART/'story-approvals.json')
    # Freeze historical catalog before replacing disabled candidates; before pictures live in review/story.
    baseline=ART/'contracts/rework2-base-story-catalog.json'
    if not baseline.exists():shutil.copy2(story_root/'catalog.json',baseline)
    exported=[]
    for logical,r in chosen.items():
        if logical.startswith('portraits/') and r['class']!='mechanic':continue
        key='mechanic' if logical.startswith('portraits/') else logical.split('/')[-1]
        old=next(e for e in story['assets'] if e['key']==key)
        assert not old['owner_approved'], 'Never overwrite an approved story selection'
        target=story_root/(key+'.png');shutil.copy2(r['path'],target)
        with Image.open(target) as im:w,h=im.size
        entry=dict(key=key,file=target.name,source_id=r['id'],source_sha256=r['source_sha256'],sha256=sha(target),
          width=w,height=h,rgba_bytes=w*h*4,technical_eligible=True,owner_approved=False,owner_evidence='',
          approved_source_sha256='',approved_export_sha256='',**fields(r))
        if r.get('reused_exact_export'):entry['exact_reuse_of']=r['source_candidate_id']
        story['assets']=[entry if e['key']==key else e for e in story['assets']]
        approvals['assets'][key]=dict(owner_approved=False,owner_evidence='',source_sha256=r['source_sha256'],export_sha256=sha(target))
        exported.append(key)
    write_json(story_root/'catalog.json',story);write_json(ART/'story-approvals.json',approvals)
    write_json(ART/'rework2-face-selections.json',dict(owner_approved=False,candidates={k:r['id'] for k,r in chosen.items()},story_exports=exported))
    validate(folder,ART/'reports/rework2-face-atlas-validation.json')
    from story_bundle import validate as validate_story
    validate_story()
    print('Published',len(chosen),'screened candidates, all owner-disabled;',len(exported),'story replacements.')

if __name__=='__main__':build()
