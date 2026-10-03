"""Pack screened candidates into existing atlas space without enabling them."""
import shutil
from PIL import Image
from common import ART, ROOT, read_json, write_json, sha, now
from atlas import pack_group, content_hash
from rework2_pipeline import eligible, report
from validate_bundle import validate

def build():
    folder=ROOT/'assets/phase2-states';stage=ART/'processed/rework2-pack';stage.mkdir(parents=True,exist_ok=True)
    baseline=ART/'contracts/rework2-base-catalog.json'
    if not baseline.exists():shutil.copy2(folder/'catalog.json',baseline)
    catalog=read_json(baseline)
    # World source remains the immutable HUD-era kit; re-running never repacks its own output.
    source=ROOT/'assets/phase2-hud';meta=read_json(source/'world.json');records=[]
    for r in meta['regions']:
        im=Image.open(source/meta['pages'][r['page']]['file']).convert('RGBA')
        cell=im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']))
        assert content_hash(cell)==r['content_sha256']
        target=stage/(r['id']+'.png');cell.save(target)
        records.append(dict(id=r['id'],path=str(target),sha256=sha(target),region_in_cell=r['region_in_cell'],
          placement={'pivot_px':r['pivot_px']}))
    chosen={}
    for r in read_json(report('environment')):
        if eligible(r):chosen[r['brief']['logical_name']]=r
    for logical,r in chosen.items():
        assert sha(r['path'])==r['sha256'] and sha(r['source'])==r['source_sha256']
        records.append(r)
        catalog['assets'].append(dict(logical_name=logical,asset_id=r['id'],group='world',
          owner_approved=False,review_required=True,technical_eligible=True,owner_evidence='',
          source_sha256=r['source_sha256'],export_sha256=r['sha256'],
          approved_source_sha256='',approved_export_sha256='',effect_class='none',collision_footprint=None))
    pages=pack_group('world',records,stage)
    environment=read_json(ART/'rework2-environment.json')
    catalog['environment_sets']=environment['theme_sets']
    catalog['environment_obstacles']=environment['obstacles']
    catalog['league_slogans']=environment['slogans']
    catalog['environment_policy']='All rw2 candidates require owner approval. Missing/unapproved assets retain procedural or existing obstacle fallback.'
    manifest=read_json(folder/'manifest.json')
    manifest['pages']=[p for p in manifest['pages'] if not p['file'].startswith('world-')]+pages
    manifest['environment_rework']=dict(at=now(),candidate_count=len(chosen),owner_approved=0,
      page_change=0,policy='20 compact 64px environment cells fit spare space on the existing world page; original regions unchanged.')
    for name in ('world.atlas','world.json','world-0.png'):shutil.copy2(stage/name,folder/name)
    write_json(folder/'catalog.json',catalog);write_json(folder/'manifest.json',manifest)
    write_json(ART/'rework2-environment-selections.json',dict(owner_approved=False,candidates={k:r['id'] for k,r in chosen.items()}))
    validate(folder,ART/'reports/rework2-environment-bundle.json')
    print('Packed',len(chosen),'disabled candidates on unchanged world page count.')

if __name__=='__main__':build()
