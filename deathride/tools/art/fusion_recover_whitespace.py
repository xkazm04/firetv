"""Audit one trailing-space transport difference; recover existing pixels, no spend."""
from PIL import Image
from common import ART,read_json,write_json,sha,now,file_lock
from gen import Budget,session_evidence,quota_evidence

def main():
    budget=Budget();audit=[]
    with file_lock(ART/'.run.lock',timeout=1):
        for p in sorted((ART/'raw').glob('v2-fusion-cars-*/attempt-02/sidecar.json')):
            r=read_json(p)
            if r['status']!='generation-error':continue
            calls,results,files=session_evidence(r['session_id'])
            if len(calls)!=1 or len(files)!=1:raise ValueError('not one successful call')
            requested=r['prompt'];actual=calls[0]['arguments']['prompt']
            if not (requested==actual+' ' and len(requested)-len(actual)==1):raise ValueError('not exactly one terminal ASCII space')
            if quota_evidence('\n'.join(map(str,results))):raise ValueError('quota recovery forbidden')
            image=p.parent/files[0].name
            if not image.exists() or sha(image)!=sha(files[0]):raise ValueError('missing/mismatched already returned pixels')
            with Image.open(image) as im:im.verify()
            before=sha(p)
            entry={'asset':r['asset'],'at':now(),'original_sidecar_sha256':before,'requested_prompt':requested,
                'actual_prompt':actual,'difference':'exactly one final ASCII space omitted; no wording, style or bridge change',
                'session_id':r['session_id'],'image_sha256':sha(image),'reservation_retained':True,'new_calls':0,
                'original_status':r['status'],'original_error':r['error'],'prompt_verbatim_verified':False}
            r.update(status='generated',image=str(image.resolve()),sha256=sha(image),
                recovery='audited one-terminal-space transport difference; see audits/v2-fusion-whitespace-recovery.json',
                original_status=r['status'],actual_tool_prompt=actual)
            write_json(p,r);entry['recovered_sidecar_sha256']=sha(p);audit.append(entry)
            budget.record({'event':'artifact-recovered-no-spend',**entry})
    write_json(ART/'audits/v2-fusion-whitespace-recovery.json',audit)
    print('Recovered',len(audit),'existing images; reservations unchanged',budget.summary())

if __name__=='__main__':main()
