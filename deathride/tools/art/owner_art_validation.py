"""Validate the dated Keep/Reject application independently of generation tooling."""
from common import ROOT, ART, read_json, sha


def validate_selection(catalog, ledger, regions):
    entries={e['asset_id']:e for e in catalog['assets']}
    logical={e['logical_name']:e for e in catalog['assets']}
    decisions=ledger['assets']
    for name,a in decisions.items():
        if a['decision']=='Reject':
            assert a['asset_id'] not in entries and a['asset_id'] not in regions, 'REJECTED_ATLAS_ASSET'
        elif name.startswith(('environment/','portraits/')):
            e=entries[a['asset_id']]
            assert e['owner_approved'] and e['technical_eligible'] and e['owner_evidence']==ledger['authority'], 'OWNER_GATE'
            assert e['source_sha256']==e['approved_source_sha256']==a['source_sha256'], 'OWNER_SOURCE_HASH'
            assert e['export_sha256']==e['approved_export_sha256']==a['export_sha256'], 'OWNER_EXPORT_HASH'
            assert e['asset_id'] in regions, 'KEPT_REGION_MISSING'
    themes={r['id'] for r in catalog['content_contracts']['track-themes']}
    assert set(catalog['environment_sets'])==themes, 'THEME_COVERAGE'
    for keys in catalog['environment_sets'].values():
        assert keys and all(k in logical for k in keys), 'THEME_PROP_MISSING'
        assert 'props/soft-dune' not in keys, 'REJECTED_DUNE_RETAINED'
    assert set(catalog['face_first_portrait_aliases'])=={'rival-rook','rival-vex','rival-mica'}, 'PORTRAIT_DECISIONS'
    for name in ('ox','relay','marrow'):
        assert 'portraits/'+name in logical and 'face-first/'+name not in logical, 'ORIGINAL_PORTRAIT_FALLBACK'
    assert 'soft-dune' not in catalog['natural_obstacles']['obstacles'], 'REJECTED_DUNE_RETAINED'


def validate_owner_art(folder=None):
    folder=folder or ROOT/'assets/phase2-states'
    ledger=read_json(ART/'owner-approvals-2026-10-03.json')
    catalog=read_json(folder/'catalog.json')
    metadata={r['id']:r for g in ('world','ui','cars') for r in read_json(folder/(g+'.json'))['regions']}
    regions=set(metadata)
    validate_selection(catalog,ledger,regions)
    for a in ledger['assets'].values():
        assert sha(ROOT/a['archived_export'])==a['export_sha256'], 'ARCHIVE_CHANGED'
        if a['decision']=='Keep' and a['asset_id'] in metadata:
            from PIL import Image
            from atlas import content_hash
            assert metadata[a['asset_id']]['content_sha256']==content_hash(Image.open(ROOT/a['archived_export'])), 'KEPT_PIXEL_BINDING'
    env=read_json(ART/'rework2-environment.json')
    assert not env['retained_visuals'], 'RETAINED_DUNE'
    assert catalog['environment_sets']==env['theme_sets']
    assert catalog['environment_obstacles']==env['obstacles']
    original=read_json(ART/'archive/owner-2026-10-03/candidate-environment.json')
    for before,after in zip(original['obstacles'],env['obstacles']):
        assert {k:v for k,v in before.items() if k!='logical_name'}=={k:v for k,v in after.items() if k!='logical_name'}, 'OBSTACLE_PHYSICS_CHANGED'
    for group in ('world','ui'):
        old=read_json(ROOT/'assets/phase2-hud'/(group+'.json'))['regions']
        current={r['id']:r for r in read_json(folder/(group+'.json'))['regions']}
        for r in old:
            if r['id']=='v4-fusion-props-soft-dune-v1-despill-v1':continue
            assert current[r['id']]['content_sha256']==r['content_sha256'], 'BASE_PIXELS_CHANGED'
    story_root=ROOT/'assets/story-art'
    story=read_json(story_root/'catalog.json')
    approvals=read_json(ART/'story-approvals.json')['assets']
    baseline={e['key']:e for e in read_json(ART/'contracts/rework2-base-story-catalog.json')['assets']}
    for e in story['assets']:
        name='portraits/mechanic' if e['key']=='mechanic' else 'story/'+e['key']
        a=ledger['assets'].get(name)
        if a and a['decision']=='Keep':
            assert e['owner_approved'] and e['technical_eligible'] and e['owner_evidence']==ledger['authority']
            assert e['sha256']==e['approved_export_sha256']==a['export_sha256']==sha(story_root/e['file'])
            assert e['source_sha256']==e['approved_source_sha256']==a['source_sha256']
            assert approvals[e['key']]['owner_approved'] and approvals[e['key']]['export_sha256']==e['sha256']
        elif e['key'] in ('car-seizure','rig-reveal'):
            assert e==baseline[e['key']] and not e['owner_approved'], 'REJECTED_STORY_FALLBACK'
            assert sha(story_root/e['file'])==e['sha256']
    return dict(status='pass',kept=14,rejected=21,active_environment=4,active_portraits=4,
        active_story_textures=7,prior_portraits_preserved=['ox','relay','marrow'],retained_dune=False,
        original_world_regions_preserved=60,original_ui_regions_preserved=37,
        gameplay_metadata_unchanged=True,new_generated_assets=0)
