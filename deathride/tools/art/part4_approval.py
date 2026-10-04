"""Prepare exact-reference Part 4 families and report live owner gates without spending."""
from common import ART, ROOT, read_json, write_json, sha, now, briefs, file_lock
from family import write_csv
from gen import reference_gate
from part4_review import CLASSES

STATES={
    'intact':'Keep the intact reference exactly as it is, INCLUDING all existing stylistic rust, scuffs, scratches and chipped paint. No new damage. Do not clean or restore the body.',
    'damaged-1':'Add a few small dents and restrained paint chips to body panels only. Preserve all existing stylistic wear. Keep every identity attachment, engine fitting and weapon.',
    'damaged-2':'Add deeper buckled panels, cracked cockpit glass and exposed metal scars, clearly more severe than light damage. Retain overall chassis footprint and all wheels, engine, fins and weapons.',
    'wreck':'Burnt inert wreck with blackened panels, collapsed roof detail and opaque broken glass. Keep recognizable footprint, all wheels and identity attachments. No detached pieces, smoke or flames.'}


def prepare():
    with file_lock(ART/'.budget.lock'):
        return _prepare()


def _prepare():
    selected=read_json(ART/'part4-selections.json')['references']
    ledger=read_json(ART/'reference-approvals.json')['references']
    before={k:sha(ART/k) for k in ('usage.json','history.jsonl')}
    base=briefs(ART/'briefs/v2-part3-reworks.csv')[0];rows=[];checks=[]
    for cls in CLASSES:
        key=selected[cls]
        approved=[k for k,v in ledger.items() if v.get('owner_approved') and k.startswith(('v2-part3-rework-'+cls.lower()+'-', 'v2-fusion-cars-'+cls.lower()+'-'))]
        if key not in approved and approved:
            # Honour a newly approved older exact candidate, without transferring approval.
            key=approved[-1]
        entry=ledger[key]
        invariant='Use the supplied exact owner-approved reference. Freeze body geometry, wheel count and centres, camera, RIGHT heading, framing, cockpit, engine, weapons, fins, all attachment points and material roles. Only the requested state or painted-panel colour may change. '
        for label,action in STATES.items():
            rows.append({**base,'id':f'v2-part4-{cls.lower()}-state-{label}-v1','class':cls,'batch':f'v2-part4-{cls.lower()}-states',
                'reference':entry['candidate_source'],'requires_approval':key,'prompt_action':invariant+action+' Keep complete car and the reference clear border.'})
        for label,paint in [('bone','muted bone #DDD0A6'),('red','dried red #6C2427'),('ochre','sun-baked ochre #A37738')]:
            rows.append({**base,'id':f'v2-part4-{cls.lower()}-livery-{label}-v1','class':cls,'batch':f'v2-part4-{cls.lower()}-liveries',
                'reference':entry['candidate_source'],'requires_approval':key,'prompt_action':invariant+'Change only painted body panels to '+paint+'. Preserve bare silver steel, ivory weapon parts, rubber, glass, electrical colours and existing contrasting marks. Preserve all wear. No new damage, emblems, text or numbers.'})
        for row in rows[-7:]:
            try:
                reference_gate(row)
                if entry.get('pixel_codes'):raise ValueError('APPROVED_SOURCE_PIXEL_FAILURE: '+key)
                gate='ready';error=None
            except ValueError as exc:gate='blocked-owner-reference';error=str(exc)
            row['status']=gate
            checks.append({'asset':row['id'],'class':cls,'reference_id':key,'source_sha256':entry['source_sha256'],'status':gate,'error':error})
    # Existing generated briefs are immutable. An owner changing reference requires a new versioned file.
    path=ART/'briefs/v2-part4-derived.csv'
    if path.exists() and any((ART/'raw'/r['id']).exists() for r in rows):
        prior=briefs(path)
        if prior!=rows:raise ValueError('generated derived briefs must be versioned, not overwritten')
    else:write_csv(path,rows)
    after={k:sha(ART/k) for k in before};assert before==after
    report={'at':now(),'ledger_sha256':sha(ART/'reference-approvals.json'),'checks':checks,'ready':sum(r['status']=='ready' for r in checks),
        'blocked':sum(r['status']!='ready' for r in checks),'before':before,'after':after,'new_images':0}
    audit=ART/'audits/v2-part4-approval-checks.json';history=read_json(audit) if audit.exists() else []
    history.append(report);write_json(audit,history);write_json(ART/'reports/v2-part4-approval-gate.json',report)
    print('Exact owner approval:',report['ready'],'ready,',report['blocked'],'blocked; zero reservations')
    return report


if __name__=='__main__':prepare()
