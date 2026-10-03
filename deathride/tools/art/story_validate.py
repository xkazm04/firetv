"""Verify portable review, proof-before-batch, generation provenance and budget without owner acceptance."""
from collections import Counter
from pathlib import Path
from common import ART, ROOT, read_json, write_json, sha
from gen import Budget

def validate():
    folder=ART/'review/story';review=read_json(folder/'review.json')
    records=review['records'];ids=set();calls=Counter()
    for r in records:
        assert r['id'] not in ids;ids.add(r['id'])
        assert not r['owner_approved']
        for path,hashkey in [('source','source_sha256'),('path','sha256'),('reference','reference_sha256')]:
            if r.get(path):assert sha(folder/r[path])==r[hashkey],(r['id'],path)
        s=read_json(folder/r['generation_sidecar'])
        assert s['sha256']==r['source_sha256'] and s['status']=='generated' and s['prompt_verbatim_verified']
        assert len(s['image_tool_calls'])==1 and s['image_tool_calls'][0]['arguments']['prompt']==s['prompt']
        assert len(r['grades'])==2 and all(g['status']=='graded' and g['image_hashes']==[r['source_sha256']] for g in r['grades'])
        assert r['direct_review'].get('reviewed') and r['direct_review']['source_sha256']==r['source_sha256']
        if r.get('runtime_export'):
            e=r['runtime_export'];assert sha(folder/e['path'])==e['sha256']
            assert len(e['grades'])==2 and all(g['status']=='graded' and g['image_hashes']==[e['sha256']] for g in e['grades'])
        calls[s['asset'].rsplit('-v',1)[0]]+=1
    assert max(calls.values())<=3
    history=[__import__('json').loads(line) for line in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    reserved=[e for e in history if e.get('event')=='reserved' and e.get('asset','').startswith('story-')]
    assert len(reserved)<=55
    summary=Budget().summary();assert summary['images_reserved']<=550
    # Snapshot proves original sibling dispatch occurred only after the checked proof.
    proof_path=ART/'audits/story-initial-batch-proofs.json'
    proofs=read_json(proof_path)
    for batch,proof in proofs.items():
        assert proof['verdict']=='batch-direction-checked'
        proof_sources=[r for r in records if r['source_sha256']==proof['sha256']]
        assert proof_sources
        first=proof_sources[0]['brief']['id']
        for r in records:
            if r['brief']['batch']==batch and r['brief']['id']!=first:
                s=read_json(folder/r['generation_sidecar'])
                assert s['timestamp']>proof['at'],r['id']
    result={'status':'pass','attempts':len(records),'paid_reservations':len(reserved),'global_budget':summary,
            'maximum_attempts_per_asset':max(calls.values()),'owner_approved':0,
            'scope':'Exact portable bytes, actual local grades, direct-review hashes, sequential guarded provenance, proof-before-batch and hard budgets; no taste or owner verdict.'}
    write_json(ART/'reports/story-validation.json',result);print(result)
    return result

if __name__=='__main__':validate()
