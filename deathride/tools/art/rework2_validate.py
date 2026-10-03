"""Audit current rework artifacts, proof chronology, spend and the unchanged generator."""
import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from common import ART, ROOT, briefs, read_json, write_json, sha, style_for
from gen import Budget, fingerprint
from rework2_pipeline import report, eligible, candidate_records
from validate_bundle import validate

def audit(parts):
    events=[json.loads(line) for line in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    reserved=[e for e in events if e.get('event')=='reserved' and e.get('asset','').startswith('rw2-')]
    assert len(reserved)<=150 and Budget().summary()['images_reserved']<=700
    assert read_json(ART/'budget.json')['max_attempts_per_asset']==3
    counts=Counter(e['asset'].rsplit('-v',1)[0] for e in reserved);assert all(v<=3 for v in counts.values())
    assert sha(ROOT/'tools/art/gen.py')==read_json(ART/'audits/rework2-start.json')['generator_sha256']
    assertions=0
    for part in parts:
        rows=briefs(ART/f'briefs/rework2-{part}.csv');records=read_json(report(part))
        for batch in {r['batch'] for r in rows}:
            group=[r for r in rows if r['batch']==batch and r['status']=='ready']
            proof=read_json(ART/'proofs'/(batch+'.json'))
            assert proof['input_hash']==fingerprint(group,style_for(group[0]))
            assert proof['verdict']=='batch-direction-checked' and sha(proof['image'])==proof['sha256']
            for row in group[1:]:
                calls=[e for e in reserved if e['asset']==row['id']]
                assert calls and min(e['at'] for e in calls)>proof['at'], ('Proof must precede first sibling',row['id'])
        for r in records:
            assert not r['owner_approved']
            s=read_json(ROOT/r['generation_sidecar'])
            assert s['status']=='generated' and s['sha256']==r['source_sha256'] and s['prompt_verbatim_verified']
            assert len(s['image_tool_calls'])==1 and s['image_tool_calls'][0]['arguments']['prompt']==s['prompt']
            assert sha(r['path'])==r['sha256'] and sha(r['source'])==r['source_sha256']
            assert len(r.get('grades',[]))==2 and all(g['status']=='graded' and g['image_hashes']==[r['source_sha256']] for g in r['grades'])
            assertions+=5
    folder=ART/'review/rework2';review=read_json(folder/'review.json')
    assert review['owner_approved_count']==0
    for r in review['records']:
        assert not r['owner_approved'] and sha(folder/r['source'])==r['source_sha256'] and sha(folder/r['path'])==r['sha256']
        if r['part']=='faces':
            from face_visibility import screen
            assert screen(r)['passed']
        assertions+=3
    env=read_json(ART/'rework2-environment.json')
    assert sha(ROOT/'core/src/main/resources/data/obstacles.csv')==env['core_obstacles_sha256']
    selected=read_json(ART/'rework2-environment-selections.json')['candidates']
    catalog=read_json(ROOT/'assets/phase2-states/catalog.json')
    entries={r['logical_name']:r for r in catalog['assets']}
    for key,id in selected.items():
        e=entries[key];assert e['asset_id']==id and e['review_required'] and not e['owner_approved']
    assert catalog['environment_sets']==env['theme_sets'] and catalog['environment_obstacles']==env['obstacles']
    # Every untouched original world region keeps exactly its prior visible pixels.
    old=read_json(ROOT/'assets/phase2-hud/world.json')['regions'];new={r['id']:r for r in read_json(ROOT/'assets/phase2-states/world.json')['regions']}
    for r in old:assert new[r['id']]['content_sha256']==r['content_sha256']
    face_summary={}
    if 'faces' in parts:
        from rework2_faces_bundle import fields
        face_records={r['id']:r for r in candidate_records('faces')}
        face_selection=read_json(ART/'rework2-face-selections.json')
        chosen=face_selection['candidates']
        expected_faces={'portraits/'+name for name in ('rook','ox','vex','mica','relay','marrow','mechanic')}
        expected_faces|={'story/'+name for name in ('debt-contract','ally-rook','ally-ox','ally-vex','ally-mica','car-seizure','rig-reveal','ending')}
        assert set(chosen)==expected_faces, 'Incomplete face coverage must be resolved or explicitly reported before final validation'
        assert not face_selection['owner_approved']
        portrait_count=0
        for logical,id in chosen.items():
            r=face_records[id];assert eligible(r)
            if not logical.startswith('portraits/'):continue
            portrait_count+=1;e=entries['face-first/'+r['class']]
            assert e['asset_id']==id and e['review_required'] and not e['owner_approved']
            assert all(e[k]==v for k,v in fields(r).items())
        old_ui=read_json(ROOT/'assets/phase2-hud/ui.json')['regions']
        new_ui={r['id']:r for r in read_json(ROOT/'assets/phase2-states/ui.json')['regions']}
        for r in old_ui:assert new_ui[r['id']]['content_sha256']==r['content_sha256']
        story_root=ROOT/'assets/story-art';story=read_json(story_root/'catalog.json')
        story_approvals=read_json(ART/'story-approvals.json')['assets']
        baseline=read_json(ART/'contracts/rework2-base-story-catalog.json')
        old_story={e['key']:e for e in baseline['assets']}
        for e in story['assets']:
            assert sha(story_root/e['file'])==e['sha256'] and not e['owner_approved']
            if e['key'] in face_selection['story_exports']:
                r=face_records[e['source_id']];assert eligible(r)
                assert all(e[k]==v for k,v in fields(r).items())
                a=story_approvals[e['key']]
                assert not a['owner_approved'] and a['source_sha256']==e['source_sha256'] and a['export_sha256']==e['sha256']
            else:assert e==old_story[e['key']]
        from story_bundle import validate as validate_story
        validate_story()
        negative=read_json(ART/'reports/rework2-face-calibration-negative.json')
        assert not negative['gate']['passed'] and 'FACE_TOO_SMALL' in negative['gate']['defects']
        face_summary=dict(face_candidates=len(chosen),portrait_candidates=portrait_count,
          unique_face_source_candidates=len({face_records[id]['source_sha256'] for id in chosen.values()}),
          exact_face_reuses=sum(bool(face_records[id].get('reused_exact_export')) for id in chosen.values()),
          story_replacements=len(face_selection['story_exports']),unchanged_original_ui_regions=len(old_ui),
          negative_face_control_rejected=True)
    validate(ROOT/'assets/phase2-states',ART/'reports/rework2-environment-bundle.json')
    result=dict(status='pass',parts=parts,new_reservations=len(reserved),budget=Budget().summary(),
      candidates=len(review['records']),environment_candidates=len(selected),assertions=assertions,
      unchanged_original_world_regions=len(old),owner_approved=0,guarded_driver_unchanged=True,
      **face_summary,
      scope='Proof chronology, one exact-prompt tool call per reservation, hash-bound screening, unchanged footprint/effect metadata, portable candidate pixels and atlas validation; no owner/device claim.')
    write_json(ART/'reports/rework2-validation.json',result);print(result)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--faces',action='store_true');a=p.parse_args()
    audit(['environment','faces'] if a.faces else ['environment'])
