"""Fail-closed validation of the partial G1 art handoff; never claims G1 completion."""
from collections import Counter
import json
from pathlib import Path
from PIL import Image
from common import ART, ROOT, read_json, sha, write_json
from gen import Budget, fingerprint
from common import style_for
from atlas import content_hash, validate_layout
from process import tile_metrics, tile_codes
from regions_pipeline import CATALOG, REPORT, eligible, rows
from regions_delivery import PACK, REVIEW

def require(condition,code):
    if not condition:raise ValueError(code)

def validate_plan(plan,folder=PACK):
    require(plan['residency']['active_regions_max']==1,'MULTIPLE_RESIDENT_REGIONS')
    cost=plan['residency']
    require(cost['car_pages_or_reserve_mib']==8 and cost['new_material_slots']==0 and not cost['mipmaps'],'RESERVE_OR_MATERIAL_POLICY')
    require(cost['current_runtime_delta_bytes']==0 and cost['current_runtime_mib']==31.25,'RUNTIME_DELTA')
    projected=cost['baseline_mib']-cost['unused_track_edge_replaced_mib']+cost['regional_page_max_mib']-cost['old_backdrop_replaced_mib']+cost['new_panels_max_mib']
    require(projected==cost['complete_kit_projection_mib'] and projected<=31.25,'PROJECTED_RESIDENCY')
    require(cost['regional_page_max_mib']==4 and cost['new_panels_max_mib']==3,'REGION_TEXTURE_CAP')
    require(cost['current_candidate_swap_projection_mib']<=31.25,'CURRENT_CANDIDATE_RESIDENCY')
    require(len(cost['activation_prerequisites'])>=5,'ACTIVATION_GATES_MISSING')
    baseline=read_json(ROOT/'assets/phase2-states/manifest.json')
    require(plan['baseline_manifest_sha256']==sha(ROOT/'assets/phase2-states/manifest.json'),'BASELINE_CHANGED')
    slots={a['logical_name'] for a in read_json(ROOT/'assets/phase2-states/catalog.json')['assets'] if a['group']=='tile'}
    for region in plan['regions']:
        require(sum(p['rgba_bytes'] for p in region['pages'])<=4*2**20,'REGION_PAGE_BUDGET')
        require(sum(p['rgba_bytes'] for p in region['panels'])<=3*2**20,'REGION_PANEL_BUDGET')
        require(len({p['replacement_slot'] for p in region['tiles']})==len(region['tiles']),'DUPLICATE_MATERIAL_SLOT')
        for item in region['tiles']+region['panels']:
            require(not item['owner_approved'] and not item['runtime_enabled'],'INFERRED_APPROVAL')
            path=folder/item['file'];require(sha(path)==item['sha256'],'CANDIDATE_HASH_CHANGED')
            with Image.open(path) as im:
                require(im.mode=='RGBA' and list(im.size)==[item['width'],item['height']],'CANDIDATE_FORMAT')
                require(item['rgba_bytes']==im.width*im.height*4,'CANDIDATE_BYTE_COUNT')
                if item['kind']=='tile':
                    require(im.size==(256,256) and item['replacement_slot'] in slots,'MATERIAL_SLOT_UNKNOWN')
                    require(not tile_codes(tile_metrics(im),item['replacement_slot'].split('/')[-1]),'CANDIDATE_TILE_GATES')
        for atlas in (folder/region['region']).glob('*.atlas'):
            data=read_json(atlas.with_suffix('.json'));validate_layout(data['regions'])
            for r in data['regions']:
                page=Image.open(atlas.parent/data['pages'][r['page']]['file'])
                cell=page.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']))
                require(content_hash(cell)==r['content_sha256'],'ATLAS_CONTENT_CHANGED')
        require(region['candidate_bytes_on_disk']==sum(x['rgba_bytes'] for x in region['pages']+region['tiles']+region['panels']),'REGION_BYTE_COUNT')
        for alias in region['reuse_aliases']:
            require(not alias['new_owner_approval'] and not alias['regional_placement_approved'] and alias['additional_resident_bytes']==0,'REUSE_APPROVAL')
            require(sha(ROOT/alias['source'])==alias['sha256'],'KEPT_EXPORT_CHANGED')
        budget=region['atmosphere_budget']
        require(region['weather_cap']<=24 and budget['shared_pool']==96 and budget['combat_reserved']>=72 and budget['new_framebuffers']==0,'ATMOSPHERE_BUDGET')
        for prop in region['proposed_prop_metadata']:
            require(not prop['owner_approved'] and prop['effect_class'] in ('solid','drag','none'),'PROP_APPROVAL_OR_CLASS')
            foot=prop['collision_footprint']
            if prop['effect_class']=='none':require(foot is None,'DECORATIVE_COLLISION')
            else:require(foot['shape']=='ellipse' and foot['space']=='local-metres' and min(foot['radii'])>0,'PROP_FOOTPRINT')
    return dict(status='pass',current_projection_mib=cost['current_candidate_swap_projection_mib'],complete_conditional_projection_mib=projected,
      material_candidates=len(plan['tiles']),sprite_pages=len(plan['pages']),panels=len(plan['panels']),actual_runtime_delta_bytes=0)

def validate_delivery():
    start=read_json(ART/'audits/g1-start.json');incident=read_json(ART/'audits/g1-quota-incident.json');rs=read_json(REPORT)
    for path,hash in start['protected_hashes'].items():require(sha(ROOT/path)==hash,'PROTECTED_RUNTIME_OR_DATA_CHANGED: '+path)
    require(sha(ROOT/'tools/art/gen.py')==incident['guard_after_sha256'] and start['generator_sha256']==incident['guard_before_sha256'],'GUARD_CHANGE_UNAUDITED')
    require(incident['guard_before_sha256']!=incident['guard_after_sha256'],'QUOTA_FIX_MISSING')
    require(Budget().summary()['stop']==incident['ending_budget']['stop'] and Budget().summary()['stop'] is not None,'REAL_QUOTA_LATCH_CLEARED')
    require(Budget().summary()['images_reserved']==582 and incident['new_reservations']==16,'SPEND_CHANGED_AFTER_STOP')
    require(incident['observed_image_tool_calls']==0 and incident['successful_new_images']==0,'INCIDENT_IMAGE_COUNT')
    events=[json.loads(s) for s in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    reserved=[x for x in events if x.get('event')=='reserved' and x.get('asset','').startswith('g1-')]
    require(len(reserved)==16 and len(reserved)<=130,'SESSION_RESERVATIONS')
    require(max(Counter(x['asset'].rsplit('-v',1)[0] for x in reserved).values(),default=0)<=3,'ATTEMPT_CAP')
    groups={}
    for row in rows():groups.setdefault(row['batch'],[]).append(row)
    for group in groups.values():
        for row in group[1:]:
            calls=[e for e in reserved if e['asset']==row['id']]
            if not calls:continue
            proof=read_json(ART/'proofs'/(row['batch']+'.json'))
            require(proof['input_hash']==fingerprint(group,style_for(group[0])) and min(e['at'] for e in calls)>proof['at'],'PROOF_BEFORE_BATCH')
    require(not list((ART/'proofs').glob('g1-*.json')),'UNSUPPORTED_GENERATION_PROOF')
    review=read_json(REVIEW/'review.json');portable={r['id']:r for r in review['records']}
    for r in rs:
        require(not r['owner_approved'] and not r['runtime_enabled'],'NEW_APPROVAL_OR_RUNTIME_ACTIVATION')
        # Both current no-spend origins have source==export. Validate committed
        # copies so a fresh checkout need not possess ignored processed files.
        require(r['origin'] in ('reuse','recolour') and r['source_sha256']==r['sha256'],'UNEXPECTED_PARTIAL_ORIGIN')
        require(sha(REVIEW/portable[r['id']]['path'])==r['sha256'],'SOURCE_EXPORT_HASH')
        if r['origin']=='recolour':
            require(eligible(r),'UNGRADED_OR_UNINSPECTED_RECOLOUR')
            require(sha(ROOT/r['parent_source'])==r['parent_sha256'],'RECOLOUR_PARENT_CHANGED')
            with Image.open(REVIEW/portable[r['id']]['path']) as im, Image.open(REVIEW/'images'/(r['id']+'-repeat.png')) as repeat:
                require(repeat.size==(512,512),'REPEAT_SIZE')
                for x in (0,256):
                    for y in (0,256):require(repeat.crop((x,y,x+256,y+256)).tobytes()==im.tobytes(),'REPEAT_NOT_ACTUAL_EXPORT')
    plan=validate_plan(read_json(ART/'regions/atlas-plan.json'))
    require(review['owner_approved_count']==0 and review['runtime_enabled_count']==0,'REVIEW_APPROVAL')
    require(len(review['region_pages'])==5 and len(review['records'])==27 and len(review['gaps'])==59,'INVENTORY_COVERAGE')
    for record in review['records']:
        require(sha(REVIEW/record['path'])==record['sha256'] and sha(REVIEW/record['source'])==record['source_sha256'],'PORTABLE_IMAGE_HASH')
    result=dict(status='pass-for-partial-delivery',g0='complete',g1='partial; provider quota blocks 59 generated assets',
      protected_hashes_verified=len(start['protected_hashes']),candidate_records=len(rs),recolours=16,kept_prop_memberships=11,missing_generated_assets=59,
      local_model_observations=sum(len(r.get('grades',[])) for r in rs),owner_approvals=0,runtime_activations=0,
      new_reservations=16,weekly_reservations=582,cap=850,quota_latch='set; never cleared',plan=plan,device='not touched; no timing claim')
    write_json(ART/'reports/g1-validation.json',result);print(result);return result

if __name__=='__main__':validate_delivery()
