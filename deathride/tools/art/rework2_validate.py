"""Audit current rework artifacts, proof chronology, spend and the unchanged generator."""
import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from common import ART, ROOT, briefs, read_json, write_json, sha, style_for
from gen import Budget, fingerprint
from rework2_pipeline import report, eligible
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
            from face_visibility import gate
            assert gate(r['face_grades'],r['source_sha256'],r['sha256'],60 if r['kind']=='portrait' else 112)['passed']
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
    validate(ROOT/'assets/phase2-states',ART/'reports/rework2-environment-bundle.json')
    result=dict(status='pass',parts=parts,new_reservations=len(reserved),budget=Budget().summary(),
      candidates=len(review['records']),environment_candidates=len(selected),assertions=assertions,
      unchanged_original_world_regions=len(old),owner_approved=0,guarded_driver_unchanged=True,
      scope='Proof chronology, one exact-prompt tool call per reservation, hash-bound screening, unchanged footprint/effect metadata, portable candidate pixels and atlas validation; no owner/device claim.')
    write_json(ART/'reports/rework2-validation.json',result);print(result)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--faces',action='store_true');a=p.parse_args()
    audit(['environment','faces'] if a.faces else ['environment'])
