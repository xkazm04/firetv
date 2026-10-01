"""One-off audited repair of a token-count false positive; cannot clear a real quota latch."""
import json,shutil
from PIL import Image
from common import ART,read_json,write_json,sha,now,file_lock
from gen import Budget,QUOTA,session_evidence

def recover():
    folder=ART/'raw/p4-props-tyres-v1/attempt-01';side=folder/'sidecar.json';old=read_json(side)
    usage=read_json(ART/'usage.json')
    if usage['stop']!={'at':'2026-10-01T09:12:05.003575+00:00','reason':'p4-props-tyres-v1: 429'}:raise ValueError('not the audited false positive; no recovery allowed')
    if old['session_id']!='805b927b-e9db-40d9-b19c-e702f9bffe0c' or old['status']!='quota-stopped':raise ValueError('unexpected session/state')
    output=(folder/'cli-output.txt').read_text(encoding='utf-8');calls,results,files=session_evidence(old['session_id'])
    if QUOTA.search(output+'\n'+'\n'.join(map(str,results))):raise ValueError('real quota/error evidence; cannot clear')
    events=[json.loads(line) for line in output.splitlines() if line.startswith('{')]
    matches=[event for event in events if event.get('type')=='usage' and event.get('usage',{}).get('output_tokens')==429]
    if len(matches)!=1 or len(calls)!=1 or len(files)!=1 or calls[0]['arguments']['prompt']!=old['prompt']:raise ValueError('audit evidence mismatch')
    with Image.open(files[0]) as im:im.verify()
    shutil.copy2(side,folder/'false-quota-original-sidecar.json')
    target=folder/files[0].name;shutil.copy2(files[0],target)
    record={**old,'status':'generated','image':str(target.resolve()),'sha256':sha(target),'recovery':'Existing successful output recovered after token-count false positive; zero new calls.'}
    audit={'at':now(),'session_id':old['session_id'],'original_stop':usage['stop'],'trigger':'usage.output_tokens == 429, not an HTTP status','successful_tool_results':results,'cli_log_sha256':sha(folder/'cli-output.txt'),'recovered_image_sha256':sha(target),'new_calls':0,'reviewer':'executing-agent inspected exact-session tool evidence','detector_fix':'429 requires explicit HTTP/status/error context; regression test excludes usage counters'}
    write_json(ART/'audits/p4-false-quota.json',audit)
    write_json(side,record)
    Budget().record({'event':'false-quota-audit',**audit})
    Budget().record({'event':'recovered-result',**record})
    with file_lock(ART/'.budget.lock'):
        latest=read_json(ART/'usage.json')
        if latest!=usage:raise ValueError('budget changed during audit')
        latest['stop']=None;write_json(ART/'usage.json',latest)
    print('Recovered successful image without spend; narrowly audited false-positive latch cleared.')

if __name__=='__main__':recover()
