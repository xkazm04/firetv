"""Write false approval candidates and prove seventy derived jobs cannot spend."""
from unittest.mock import patch
from common import ART,ROOT,read_json,write_json,sha,now
from gen import generate,Budget

def main():
    roster=[r for r in read_json(ART/'reports/v2-fusion-current-deterministic.json') if r['kind']=='car']
    ledger=read_json(ART/'reference-approvals.json');template={'schema':1,'references':{}}
    for r in roster:
        key=r['id'];source=ART/'review/fusion/sources'/(key+__import__('pathlib').Path(r['source']).suffix.lower())
        if sha(source)!=r['source_sha256']:raise ValueError('source snapshot changed')
        candidate={'owner_approved':False,'source_sha256':r['source_sha256'],'owner_evidence':None,
            'candidate_source':str(source.relative_to(ROOT)).replace('\\','/'),'processed_sha256':r['sha256'],
            'pixel_codes':r['codes'],'style_file':'style-fusion.json','style_sha256':sha(ART/'style-fusion.json'),
            'review_page':'art/review/fusion/index.html','instruction':'Only owner may set true; resolve pixel rejections first. Approval covers exact source bytes only.'}
        if ledger['references'].get(key,{}).get('owner_approved'):raise ValueError('never overwrite owner approval')
        ledger['references'][key]=candidate;template['references'][key]=candidate
    write_json(ART/'reference-approvals.json',ledger)
    write_json(ART/'V2-REFERENCE-APPROVAL.template.json',template)
    results=[]
    for r in roster:
        for variant in ['state-intact','state-damaged-1','state-damaged-2','state-wreck','livery-bone','livery-red','livery-ochre']:
            job={**r['brief'],'id':'v2-fusion-blocked-'+r['class'].lower()+'-'+variant+'-v1',
                 'requires_approval':r['id'],'reference':ledger['references'][r['id']]['candidate_source']}
            with patch.object(Budget,'reserve') as reserve:
                try:generate(job,{},Budget())
                except ValueError as error:
                    if 'OWNER_REFERENCE_APPROVAL_REQUIRED' not in str(error):raise
                    results.append({'reference':r['id'],'variant':variant,'result':str(error),'reserve_calls':reserve.call_count})
                else:raise ValueError('derived job reached generation')
                reserve.assert_not_called()
    write_json(ART/'audits/v2-fusion-derived-gate.json',{'at':now(),'status':'pass','blocked_jobs':results,
        'scope':'seventy direct generate calls refused before mocked reserve; no paid call, no approval granted',
        'approval_sha256':sha(ART/'reference-approvals.json')})
    print('70 derived jobs blocked before reservation; exact-reference template written')

if __name__=='__main__':main()
