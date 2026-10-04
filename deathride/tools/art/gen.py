"""Budgeted Grok CLI image generation. Never retries on an error or overwrites a job."""
from __future__ import annotations
import argparse
import concurrent.futures
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone
from common import ART, ROOT, append_json, briefs, compile_prompt, digest, file_lock, make_contact_sheet, now, read_json, sha, write_json, style_for

# A bare number can be a token count or a dimension. Require error context.
# Grok Build also reports exhausted image access as HTTP 402, not just 429.
QUOTA = re.compile(r'(?i)(rate.?limit(?:ed| exceeded| reached)|quota.{0,50}(exceed|exhaust|reach)|too many requests|\b(?:HTTP(?:/\d(?:\.\d)?)?\s*|status(?:_code| code)?[\"\s:=]*|error[\"\s:=]*)(?:429|402)\b|\b429\s+(?:too many|rate limit)|\b402\s+Payment Required|usage limit.{0,40}(exceed|reach)|usage balance.{0,40}exhaust|insufficient.{0,15}credits)')

def quota_evidence(output):
    match=QUOTA.search(output)
    if match:return match.group(0)
    def inspect(value,error_context=False):
        if isinstance(value,dict):
            context=error_context or value.get('type')=='error'
            for key,item in value.items():
                name=key.lower()
                if item in (429,402) and (name in ('status','status_code','statuscode','http_status') or (context and name=='code')):return 'structured HTTP status '+str(item)
                found=inspect(item,context or name in ('error','errors','exception'))
                if found:return found
        elif isinstance(value,list):
            for item in value:
                found=inspect(item,error_context)
                if found:return found
        elif isinstance(value,str):
            if error_context and value.strip() in ('429','402'):return 'structured error '+value.strip()
            if value.startswith('{'):
                try:return inspect(json.loads(value),error_context)
                except json.JSONDecodeError:pass
        return None
    for line in output.splitlines():
        try:found=inspect(json.loads(line))
        except json.JSONDecodeError:continue
        if found:return found
    return None

def session_evidence(session_id):
    """Read only our explicit session. Never ingest a neighbouring job's output."""
    matches = list((Path.home()/'.grok/sessions').glob('*/'+session_id+'/chat_history.jsonl'))
    calls, results, files = [], [], []
    for path in matches:
        for line in path.read_text(encoding='utf-8').splitlines():
            try: event=json.loads(line)
            except json.JSONDecodeError: continue  # last line may still be being written
            for call in event.get('tool_calls',[]):
                if call.get('name') in ['image_gen','image_edit']:
                    args=call['arguments']
                    calls.append({'name':call['name'],'arguments':json.loads(args) if isinstance(args,str) else args})
            if event.get('type')=='tool_result':
                results.append(event.get('content',''))
        files += [p for p in (path.parent/'images').glob('*') if p.suffix.lower() in ['.png','.jpg','.jpeg','.webp']]
    return calls, results, files

class Budget:
    def __init__(self, art=ART):
        self.art = Path(art)
        self.policy = read_json(self.art / 'budget.json')

    def _load(self):
        path = self.art / 'usage.json'
        return read_json(path) if path.exists() else {'schema': 1, 'weeks': {}, 'stop': None}

    def attempt_limit(self, asset):
        slot = re.sub(r'-v\d+$', '', asset)
        override = self.policy.get('asset_attempt_overrides', {}).get(slot)
        if override is None:
            return self.policy.get('max_attempts_per_asset', 3)
        if not override.get('reason') or not override.get('authorization') or not override.get('audit_file'):
            raise RuntimeError('ATTEMPT_OVERRIDE_EVIDENCE_REQUIRED: ' + slot)
        audit = self.art / override['audit_file']
        if not audit.is_file() or sha(audit) != override.get('audit_sha256'):
            raise RuntimeError('ATTEMPT_OVERRIDE_AUDIT_MISMATCH: ' + slot)
        limit = override.get('limit')
        if type(limit) is not int or limit < 1:
            raise RuntimeError('INVALID_ATTEMPT_LIMIT: ' + slot)
        return limit

    def reserve(self, asset, attempt):
        with file_lock(self.art / '.budget.lock'):
            usage = self._load()
            if usage['stop']:
                raise RuntimeError('SPEND_STOP: ' + str(usage['stop']))
            history=self.art/'history.jsonl'
            slot=re.sub(r'-v\d+$','',asset)
            events=[json.loads(line) for line in history.read_text(encoding='utf-8').splitlines()] if history.exists() else []
            used=sum(e.get('event')=='reserved' and re.sub(r'-v\d+$','',e.get('asset',''))==slot for e in events)
            if used>=self.attempt_limit(asset):
                raise RuntimeError('ASSET_ATTEMPT_CAP across revisions: '+slot)
            week = datetime.now(timezone.utc).strftime('%G-W%V')
            bucket = usage['weeks'].setdefault(week, {'images_reserved': 0, 'videos_reserved': 0})
            if bucket['images_reserved'] >= self.policy['weekly_image_cap']:
                raise RuntimeError('LOCAL_BUDGET_CAP')
            for name, envelope in self.policy.get('session_envelopes', {}).items():
                prefixes=tuple(envelope.get('asset_prefixes', []))
                if prefixes and not asset.startswith(prefixes):
                    continue
                spent=(sum(e.get('event')=='reserved' and e.get('week')==week and e.get('at','')>=envelope['started_at'] and e.get('asset','').startswith(prefixes) for e in events)
                       if prefixes else bucket['images_reserved']-envelope['starting_reservations'])
                if envelope['week'] == week and spent >= envelope['max_new_images']:
                    raise RuntimeError('SESSION_BUDGET_CAP: ' + name)
            bucket['images_reserved'] += 1
            write_json(self.art / 'usage.json', usage)
            append_json(self.art / 'history.jsonl', {'event':'reserved', 'asset':asset, 'attempt':attempt, 'week':week, 'at':now(), 'images':1, 'origin':'grok-cli'})
            return week

    def record(self, event):
        with file_lock(self.art / '.budget.lock'):
            append_json(self.art / 'history.jsonl', event)

    def stop(self, reason):
        with file_lock(self.art / '.budget.lock'):
            usage = self._load()
            if not usage['stop']:
                usage['stop'] = {'at':now(), 'reason':reason}
                write_json(self.art / 'usage.json', usage)
                append_json(self.art / 'history.jsonl', {'event':'spend-stop', **usage['stop']})

    def summary(self):
        usage = self._load()
        week = datetime.now(timezone.utc).strftime('%G-W%V')
        spent = usage['weeks'].get(week, {}).get('images_reserved', 0)
        return {'week':week,'images_reserved':spent,'remaining':self.policy['weekly_image_cap']-spent,'videos':0,'stop':usage['stop']}

def fingerprint(rows, style):
    return digest({'briefs':rows, 'style':style})

def candidates(row):
    folder = ART / 'raw' / row['id']
    return sorted(folder.glob('attempt-*/sidecar.json')) if folder.exists() else []

def reference_gate(row,art=ART):
    if row.get('wave') in ('V2','V4') or row.get('id','').startswith(('v2-','v4-')):
        from style_choice import require_choice
        require_choice(row, art)
    requirement=row.get('requires_approval','')
    if not requirement:return
    path=Path(art)/'reference-approvals.json'
    if not path.exists():raise ValueError('OWNER_REFERENCE_APPROVAL_REQUIRED: '+requirement)
    record=read_json(path)['references'].get(requirement,{})
    ref=Path(row.get('reference',''))
    if not ref.is_absolute():ref=ROOT/ref
    if not record.get('owner_approved') or not record.get('owner_evidence') or not ref.is_file() or sha(ref)!=record.get('source_sha256'):
        raise ValueError('OWNER_REFERENCE_APPROVAL_REQUIRED: '+requirement)

def generate(row, style, budget, refine=False):
    reference_gate(row)
    old = [read_json(p) for p in candidates(row)]
    prompt = compile_prompt(row, style)
    signature = digest({'row':row, 'style':style})
    rejection_path=ART/'rejections'/f"{row['id']}.json"
    rejection=read_json(rejection_path) if rejection_path.exists() else None
    for previous in reversed(old):
        if previous['input_hash'] != signature:
            raise RuntimeError('brief changed under existing id; mint new id: ' + row['id'])
        if not refine and previous['status'] == 'generated' and Path(previous['image']).exists() and sha(previous['image']) == previous['sha256']:
            return previous
    # A failed/uncertain call is never silently rerun on resume. A new revision needs a new id.
    if old and not refine:
        if old[-1]['status']=='generated':
            return {**old[-1],'status':'artifact-invalid','error':'Existing image missing or hash mismatch; recover it or mint a new revision, no automatic spend.'}
        return old[-1]
    if refine and (not rejection or not old or old[-1]['status'] != 'generated'):
        raise ValueError('refinement requires a generated image and recorded content rejection; never retry transport errors')
    if refine and rejection.get('image_sha256')!=old[-1].get('sha256'):
        raise ValueError('refinement rejection must name the exact latest image hash')
    if len(old)>=budget.attempt_limit(row['id']):
        raise ValueError('attempt cap reached')
    if refine:
        prompt=compile_prompt(row,style,rejection['note'])
    attempt = len(old)+1
    reference = row.get('reference', '')
    ref=None
    if reference:
        ref = Path(reference)
        if not ref.is_absolute(): ref = ROOT/ref
        if not ref.is_file(): raise ValueError('reference missing before spend: '+str(ref))
    exe = shutil.which('grok')
    if not exe: raise RuntimeError('grok CLI unavailable before spend')
    folder = ART / 'raw' / row['id'] / f'attempt-{attempt:02}'
    sidecar = {'asset':row['id'],'origin':'grok-cli','model':'grok-4.7','seed':None,'timestamp':now(),'attempt':attempt,'prompt':prompt,'brief':row,'input_hash':signature,'status':'reserved','image':None}
    if folder.exists(): raise RuntimeError('existing attempt folder requires inspection: '+str(folder))
    try: budget.reserve(row['id'], attempt)
    except RuntimeError as exc:
        return {**sidecar,'status':'spend-blocked','error':str(exc)}
    folder.mkdir(parents=True, exist_ok=False)
    sidecar['session_id']=str(uuid.uuid4())
    write_json(folder/'sidecar.json', sidecar)
    if reference:
        sidecar['reference_sha256'] = sha(ref)
    tool = 'image_edit' if reference else 'image_gen'
    width,height=map(int,row['size'].split('x'));divisor=math.gcd(width,height)
    aspect=f'{width//divisor}:{height//divisor}'
    instruction = ('Call ' + tool + ' exactly ONCE to produce one image. Use the following image prompt verbatim, without paraphrasing. '
        'Use aspect_ratio '+aspect+'. Do not call other tools, generate variants, or use video. After the tool returns, finish with its saved file path.\n')
    if reference:
        instruction += 'Use this image as the identity reference/edit target: ' + str(ref.resolve()) + '\n'
    instruction += '\nIMAGE PROMPT:\n' + prompt
    (folder/'request.txt').write_text(instruction, encoding='utf-8')
    command = [exe,'-m','grok-4.7','--effort','low','--always-approve','--permission-mode','bypassPermissions','--no-subagents','--disable-web-search','--tools',tool,'--max-turns','2','--session-id',sidecar['session_id'],'--prompt-file',str((folder/'request.txt').resolve()),'--output-format','streaming-json']
    started = time.monotonic()
    try:
        log=folder/'cli-output.txt'
        with log.open('w',encoding='utf-8') as out:
            process=subprocess.Popen(command,cwd=folder,stdout=out,stderr=subprocess.STDOUT)
            while process.poll() is None:
                output=log.read_text(encoding='utf-8',errors='replace')
                _, results, _=session_evidence(sidecar['session_id'])
                quota=quota_evidence(output+'\n'+'\n'.join(map(str,results)))
                if quota: budget.stop(row['id']+': '+quota)
                if time.monotonic()-started>600:
                    subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],capture_output=True)
                    process.wait(timeout=20)
                    raise subprocess.TimeoutExpired(command,600)
                time.sleep(.5)
        output=log.read_text(encoding='utf-8',errors='replace')
        calls, tool_results, returned_files=session_evidence(sidecar['session_id'])
        output+='\n'+'\n'.join(map(str,tool_results))
        sidecar['image_tool_calls']=calls
        sidecar['prompt_verbatim_verified']=len(calls)==1 and calls[0]['arguments'].get('prompt')==prompt
        if len(calls)>1: budget.stop(row['id']+': CLI violated one-image contract; extra spend requires accounting audit')
        quota = quota_evidence(output)
        if quota:
            budget.stop(row['id'] + ': ' + quota)
            sidecar['status'] = 'quota-stopped'
        else:
            files=[]
            for source in returned_files:
                target=folder/source.name
                shutil.copy2(source,target)
                files.append(target)
            if len(files) == 1 and sidecar['prompt_verbatim_verified']:
                from PIL import Image
                with Image.open(files[0]) as image:
                    image.verify()
                sidecar.update(status='generated',image=str(files[0].resolve()),sha256=sha(files[0]))
            else:
                sidecar.update(status='generation-error', error=f'exit={process.returncode}; decoded image file count={len(files)}; verbatim={sidecar['prompt_verbatim_verified']}')
        sidecar['returncode'] = process.returncode
    except subprocess.TimeoutExpired:
        sidecar.update(status='timeout-unknown-spend',error='600 second CLI timeout; no automatic retry')
        budget.stop(row['id'] + ': uncertain timed-out CLI; inspect before further spend')
    except Exception as exc:
        sidecar.update(status='error',error=str(exc))
    sidecar['elapsed_seconds'] = round(time.monotonic()-started,3)
    write_json(folder/'sidecar.json',sidecar)
    # Persist the complete prompt/provenance even though raw image payloads are ignored.
    budget.record({'event':'result',**sidecar})
    print(row['id'],sidecar['status'],flush=True)
    return sidecar

def proof_path(batch):
    return ART/'proofs'/f'{batch}.json'

def proof_valid(batch, rows, style):
    p=proof_path(batch)
    if not p.exists(): return False
    proof=read_json(p)
    return proof['input_hash']==fingerprint(rows,style) and proof['verdict']=='batch-direction-checked' and Path(proof['image']).exists() and sha(proof['image'])==proof['sha256']

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--briefs',default=str(ART/'briefs/p1-current.csv'))
    p.add_argument('--batch')
    p.add_argument('--mode',choices=['proof','run','approve-proof','reject-proof','dry-run'],default='run')
    p.add_argument('--review-note')
    p.add_argument('--refine',action='store_true',help='one deliberate content refinement, with recorded rejection; no error retries')
    p.add_argument('--parallel',type=int,default=int(os.getenv('GROK_MAX_PARALLEL_IMAGES','4')))
    args=p.parse_args()
    rows=briefs(args.briefs)
    rows=[r for r in rows if r['status']=='ready' and (not args.batch or r['batch']==args.batch)]
    if not rows: raise ValueError('no ready briefs')
    budget=Budget()
    if args.mode=='dry-run':
        print(json.dumps({'images':len(rows),'batches':sorted({r['batch'] for r in rows}),'budget':budget.summary()},indent=2)); return
    with file_lock(ART/'.run.lock',timeout=1):
        for batch in dict.fromkeys(r['batch'] for r in rows):
            if budget.summary()['stop']:
                print(json.dumps(budget.summary()),flush=True)
                break
            group=[r for r in rows if r['batch']==batch]
            style=style_for(group[0])
            if any(style_for(r)!=style for r in group):
                raise ValueError('a proof batch must have exactly one style contract')
            if args.mode in ['approve-proof','reject-proof']:
                if not args.review_note: raise ValueError('inspection evidence required')
                found=candidates(group[0])
                result=read_json(found[-1]) if found else None
                if not result or result['status']!='generated': raise ValueError('proof image unavailable')
                if args.mode=='reject-proof':
                    rejection={'asset':result['asset'],'image_sha256':result['sha256'],'note':args.review_note,'at':now(),'attempt':result['attempt']}
                    write_json(ART/'rejections'/f"{result['asset']}.json",rejection)
                    budget.record({'event':'content-rejection',**rejection})
                else:
                    write_json(proof_path(batch),{'batch':batch,'input_hash':fingerprint(group,style),'image':result['image'],'sha256':sha(result['image']),'verdict':'batch-direction-checked','reviewer':'executing-agent; NOT owner acceptance','note':args.review_note,'at':now()})
                continue
            if not proof_valid(batch,group,style):
                results=[generate(group[0],style,budget,args.refine)]
                print('PROOF_REVIEW_REQUIRED',batch,flush=True)
            else:
                if args.mode=='proof': continue
                count=max(1,min(args.parallel,int(os.getenv('GROK_MAX_PARALLEL_IMAGES','4')),4))
                # Scheduling is bounded; each worker re-checks the durable stop latch before spending.
                with concurrent.futures.ThreadPoolExecutor(max_workers=count) as pool:
                    results=list(pool.map(lambda row:generate(row,style,budget),group))
            make_contact_sheet([{'id':r['asset'],'path':r.get('image'),'verdict':r['status']} for r in results],ART/'contact-sheets'/f'{batch}-raw.png',batch+' | RAW / owner review pending')
            print(json.dumps(budget.summary()),flush=True)
            if budget.summary()['stop']: break
            # Unknown provider failures must be inspected before another group.
            # An unrecognised quota message must not drain the entire proof queue.
            if any(r['status']!='generated' for r in results):
                print('GENERATION_FAILURE_REQUIRES_INSPECTION; no further groups dispatched',flush=True)
                break

if __name__=='__main__':
    main()
