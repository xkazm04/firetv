"""Apply the dated owner table using only existing exact exports and atlas cells."""
import copy
import hashlib
import re
import shutil
import subprocess
from pathlib import Path
from PIL import Image
from common import ROOT, ART, read_json, write_json, sha
from atlas import pack_group, content_hash

EVIDENCE='docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md section 1'
FOLDER=ROOT/'assets/phase2-states'
REVIEW=ART/'review/rework2'
ARCHIVE=ART/'archive/owner-2026-10-03'
FALLBACK={
 'derelict-crane':'props/crate','wreck-car':'props/crate-metal','quarry-face':'props/rock-field',
 'slag-heap':'props/rock-field','salt-crust':'procedural/salt-crust','dead-brush':'props/brush',
 'league-hoarding':'props/sign','smelter-stacks':'props/drum','sluice-gate':'props/crate-metal',
 'dead-tree':'props/dead-tree','guard-rail':'props/sign','rock-fall':'props/rock-field',
 'rock-spire':'props/rock-spire','tyres-scattered':'props/tyres-scattered','tyre-wall':'props/tyres'}


def apply():
    owner=(ROOT.parent/'docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md').read_text(encoding='utf-8')
    picks={}
    for logical,pick,sample,digest in re.findall(r'^\| ([^|]+?) \| (Keep|Reject) \| ([^ /]+) / ([a-f0-9]{64}) \|',owner,re.M):
        picks[logical]=(pick,sample,digest)
    assert len(picks)==35
    records=read_json(REVIEW/'review.json')['records']
    ARCHIVE.mkdir(parents=True,exist_ok=True)
    for src,name in [(FOLDER/'catalog.json','candidate-catalog.json'),(FOLDER/'manifest.json','candidate-manifest.json'),
        (ROOT/'assets/story-art/catalog.json','candidate-story-catalog.json'),(ART/'rework2-environment.json','candidate-environment.json')]:
        if not (ARCHIVE/name).exists():shutil.copy2(src,ARCHIVE/name)
    catalog=read_json(ARCHIVE/'candidate-catalog.json')
    manifest=read_json(ARCHIVE/'candidate-manifest.json')
    env=read_json(ARCHIVE/'candidate-environment.json')
    ledger=dict(schema=1,authority=EVIDENCE,generated_replacements=0,assets={})
    kept_ids=set();rejected_ids=set()
    for r in records:
        logical=r['brief']['logical_name'] if r['part']!='retained' else 'Retained natural dune'
        pick,sample,digest=picks[logical]
        assert sha(REVIEW/r['path'])==digest==r['sha256']
        assert sha(REVIEW/r['source'])==r['source_sha256']
        if r['part']!='retained':assert sample==r['id']
        asset_id=sample
        (kept_ids if pick=='Keep' else rejected_ids).add(asset_id)
        fallback=FALLBACK.get(logical.split('/')[-1],'') if r['part']=='environment' else ''
        if pick=='Reject' and r['part']=='faces':
            fallback='portraits/'+r['class'] if logical.startswith('portraits/') else 'pre-rework card; procedural until separately approved'
        if r['part']=='retained':fallback='procedural dune; gameplay footprint unchanged'
        ledger['assets'][logical]=dict(decision=pick,asset_id=asset_id,owner_approved=pick=='Keep',
            owner_evidence=EVIDENCE,source_sha256=r['source_sha256'],export_sha256=digest,
            archived_export=str((REVIEW/r['path']).relative_to(ROOT)).replace('\\','/'),fallback=fallback)
    for e in catalog['assets']:
        if e['asset_id'] in kept_ids:
            e.update(owner_approved=True,owner_evidence=EVIDENCE,
                approved_source_sha256=e['source_sha256'],approved_export_sha256=e['export_sha256'])
    catalog['assets']=[e for e in catalog['assets'] if e['asset_id'] not in rejected_ids]
    catalog['natural_obstacles']['obstacles'].pop('soft-dune',None)
    # Salt crust's old comparison was the same rejected dune: use procedural scenery there.
    sets={}
    for theme,keys in env['theme_sets'].items():
        mapped=[]
        for key in keys:
            replacement=FALLBACK.get(key.split('/')[-1],key)
            if key=='props/soft-dune' or replacement.startswith('procedural/'):continue
            if replacement not in mapped:mapped.append(replacement)
        assert mapped;sets[theme]=mapped
    env['theme_sets']=sets;env['retained_visuals']={}
    env['owner_decisions']=EVIDENCE
    env['gaps']={
        'industrial':'Earlier tyres, drum, sign and crate replace rejected tyre wall, stacks, hoarding and wreck.',
        'quarry':'Earlier rock field and crates replace the crane, quarry face, slag and wreck; no distinct crane silhouette.',
        'desert':'No salt-crust or retained dune sprite. Earlier brush/sign/crate and kept pylon share the smaller set; procedural ground remains.',
        'wetland':'Earlier crate, tree, drum and tyres replace rejected sluice, stacks and tyre wall.',
        'alpine':'Earlier sign, rocks, brush, tyres and crate replace rejected rail, rock fall, spire, scattered tyres and wreck.'}
    for obstacle in env['obstacles']:
        key=obstacle['logical_name']
        obstacle['logical_name']='procedural/soft-dune' if key=='props/soft-dune' else FALLBACK.get(key.split('/')[-1],key)
    catalog['environment_sets']=sets;catalog['environment_obstacles']=env['obstacles']
    catalog['environment_policy']='Owner Keep assets active with exact hashes. Reject candidates excluded; earlier kit or procedural fallback. No new generation.'
    catalog['environment_gaps']=env['gaps']
    catalog['face_first_portrait_aliases']={k:v for k,v in catalog['face_first_portrait_aliases'].items() if v.split('/')[-1] in ('rook','vex','mica')}
    # Repack existing cells only. Content hashes establish unchanged visible pixels.
    for group in ('world','ui'):
        meta=read_json(FOLDER/(group+'.json'));stage=ROOT/'build/owner-art-pack'/group;stage.mkdir(parents=True,exist_ok=True)
        images={p['file']:Image.open(FOLDER/p['file']).convert('RGBA') for p in meta['pages']}
        pack=[]
        for r in meta['regions']:
            if r['id'] in rejected_ids:continue
            page=images[meta['pages'][r['page']]['file']]
            cell=page.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']))
            assert content_hash(cell)==r['content_sha256']
            path=stage/(r['id']+'.png');cell.save(path)
            pack.append(dict(id=r['id'],path=str(path),sha256=sha(path),region_in_cell=r['region_in_cell'],
                placement={'pivot_px':r['pivot_px']},hud_interior_px=r.get('hud_interior_px')))
        pages=pack_group(group,pack,stage)
        for name in (group+'.atlas',group+'.json',group+'-0.png'):shutil.copy2(stage/name,FOLDER/name)
        manifest['pages']=[p for p in manifest['pages'] if not p['file'].startswith(group+'-')]+pages
    manifest['environment_rework'].update(candidate_count=4,owner_approved=4,policy=catalog['environment_policy'])
    manifest['face_rework'].update(portrait_candidates=4,owner_approved=4,exact_reuses=0,
        policy='Rook, Vex, Mica and Mechanic kept. Original Ox, Relay and Marrow remain. Six story scenes kept; seizure/rig fall back.')
    manifest['owner_application']=dict(authority=EVIDENCE,kept=len(kept_ids),rejected=len(rejected_ids),new_assets=0,
        kept_asset_ids=sorted(kept_ids),rejected_asset_ids=sorted(rejected_ids))
    manifest['resident_rgba_bytes_with_reserved_cars']=sum(p['rgba_bytes'] for p in manifest['pages']+manifest['tiles']+manifest.get('ribbons',[]))+max(p['rgba_bytes'] for p in manifest['themes'])+manifest['cars_reserved_rgba_bytes']
    write_json(FOLDER/'catalog.json',catalog);write_json(FOLDER/'manifest.json',manifest)
    write_json(ART/'rework2-environment.json',env)
    write_json(ART/'owner-approvals-2026-10-03.json',ledger)
    write_json(ART/'rework2-environment-selections.json',dict(owner_approved=True,authority=EVIDENCE,
        candidates={k:v['asset_id'] for k,v in ledger['assets'].items() if k.startswith('environment/') and v['owner_approved']},retained_visuals={}))
    write_json(ART/'rework2-face-selections.json',dict(owner_approved=True,authority=EVIDENCE,
        candidates={k:v['asset_id'] for k,v in ledger['assets'].items() if k.startswith(('portraits/','story/')) and v['owner_approved']},
        story_exports=['mechanic','debt-contract','ally-rook','ally-ox','ally-vex','ally-mica','ending']))
    story=read_json(ARCHIVE/'candidate-story-catalog.json');old={e['key']:e for e in read_json(ART/'contracts/rework2-base-story-catalog.json')['assets']}
    approvals=read_json(ART/'story-approvals.json')
    for i,e in enumerate(story['assets']):
        if e['source_id'] in kept_ids:
            e.update(owner_approved=True,owner_evidence=EVIDENCE,approved_source_sha256=e['source_sha256'],approved_export_sha256=e['sha256'])
        elif e['key'] in ('car-seizure','rig-reveal'):
            e=copy.deepcopy(old[e['key']]);story['assets'][i]=e
            raw=subprocess.check_output(['git','show','bee3457:deathride/assets/story-art/'+e['file']],cwd=ROOT)
            assert hashlib.sha256(raw).hexdigest()==e['sha256']
            (ROOT/'assets/story-art'/e['file']).write_bytes(raw)
        approvals['assets'][e['key']]=dict(owner_approved=e['owner_approved'],owner_evidence=e['owner_evidence'],source_sha256=e['source_sha256'],export_sha256=e['sha256'])
    story['policy']='Exact owner Keep approvals active. Earlier unapproved seizure and rig cards retain procedural fallback. No replacement generation.'
    write_json(ROOT/'assets/story-art/catalog.json',story);write_json(ART/'story-approvals.json',approvals)
    print('Applied',len(kept_ids),'Keep and',len(rejected_ids),'Reject decisions; no generated assets.')


if __name__=='__main__':apply()
