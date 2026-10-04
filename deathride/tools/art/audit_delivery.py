"""Reconcile spend, selections, current source provenance and open handoff gates."""
import collections,json,subprocess,hashlib
from common import ART,ROOT,read_json,write_json,sha,now

def run():
    history=[json.loads(line) for line in (ART/'history.jsonl').read_text(encoding='utf-8').splitlines()]
    reserves=[r for r in history if r['event']=='reserved'];usage=read_json(ART/'usage.json');week='2026-W40'
    ledger=usage['weeks'][week];reserved=sum(r['images'] for r in reserves if r['week']==week)
    if reserved!=ledger['images_reserved']:raise ValueError('RESERVATION_LEDGER_MISMATCH')
    statuses=collections.Counter();model_tools=collections.Counter();assets=[]
    for path in sorted((ART/'raw').glob('*/attempt-*/sidecar.json')):
        r=read_json(path);statuses[r['status']]+=1
        if r['status']=='generated' and sha(r['image'])!=r['sha256']:raise ValueError('RAW_HASH_CHANGED')
        if r['status'] not in ('generated','interrupted-unknown-spend'):raise ValueError('UNRESOLVED_GENERATION: '+str(path))
        for call in r.get('image_tool_calls',[]):model_tools[call['name']]+=1
        assets.append({'id':r['asset'],'attempt':r['attempt'],'status':r['status'],'sha256':r.get('sha256'),'session_id':r.get('session_id'),'batch':r.get('brief',{}).get('batch')})
    if sum(statuses.values())!=reserved:raise ValueError('SIDECAR_LEDGER_MISMATCH')
    selections=read_json(ART/'selections.json')['assets'];counts=collections.Counter(s['status'] for s in selections)
    commit=subprocess.check_output(['git','rev-parse','deathride/content'],text=True).strip();source=read_json(ART/'contracts/p4-content-source.json');comparisons={}
    for name,entry in source['sources'].items():
        current=subprocess.check_output(['git','show',commit+':'+entry['path']]);current_hash=hashlib.sha256(current).hexdigest()
        comparisons[name]={'captured_sha256':entry['sha256'],'current_sha256':current_hash,'unchanged':entry['sha256']==current_hash}
    result={'at':now(),'week':week,'weekly_reservations':reserved,'new_this_execution':reserved-8,'inherited_reservations':8,'p4_reservations':reserved-37,'remaining':read_json(ART/'budget.json')['weekly_image_cap']-reserved,'videos':ledger['videos_reserved'],'stop':usage['stop'],'sidecar_statuses':dict(statuses),'verified_tool_calls':dict(model_tools),'tool_count_note':'Four inherited successful images predate exact-session tool inspection; image tools are verified for all new generated results. One false quota token-count incident was recovered without another call.','actual_quota_error_observed':False,'false_quota_audit':'audits/p4-false-quota.json','generation_records':assets,'selection_counts':dict(counts),'bundle_validation':read_json(ART/'reports/p4-bundle-validation.json'),'content_captured_commit':source['commit'],'content_latest_commit_at_audit':commit,'content_hash_comparisons':comparisons,'open_gates':['Owner approval of ten exact car references before 40 state and 30 livery jobs','Human-labelled calibration of the 30-image diagnostic','Reconcile provisional Marrow portrait with committed C4 IDs','I1 asset loading, renderer integration, fallback and retirement of old oversized scenery target','I2 full-game texture/frame budget and Stick soak','G2 owner quality and feel'],'no_push':True}
    write_json(ART/'reports/p4-delivery-audit.json',result)
    print({k:result[k] for k in ('weekly_reservations','new_this_execution','p4_reservations','remaining','sidecar_statuses','selection_counts')})

if __name__=='__main__':run()
