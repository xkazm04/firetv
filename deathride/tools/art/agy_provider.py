"""Sequential Antigravity image adapter. A reservation is spent even on uncertainty.

No provider-error retries. Continuation is restricted to verifying an already saved
image, in the exact conversation, and explicitly forbids another image call.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import time
from PIL import Image
from common import ART, ROOT, append_json, compile_prompt, digest, file_lock, now, read_json, sha, write_json
from gen import Budget, quota_evidence, reference_gate

MODEL = 'gemini-3.8-flash-high'
FAILURE = re.compile(r'(?i)(unauthenticated|unauthorized|authentication (?:failed|required)|invalid (?:api.?key|token)|not logged in|permission denied|auto.denied|access denied|\b(?:HTTP|status|error)\s*[:=]?\s*(?:401|403)\b|resource.exhausted|empty.output|no image (?:generated|produced|returned)|failed to generate|image generation failed)')

def failure_evidence(text):
    quota = quota_evidence(text)
    match = FAILURE.search(text)
    return quota or (match.group(0) if match else None)

class AgyBudget(Budget):
    provider = 'agy'
    def __init__(self, art=ART):
        super().__init__(art)
        self.config = self.policy['providers']['agy']
        self.model = self.config['model']

    def _load(self):
        path = self.art/'usage-agy.json'
        return read_json(path) if path.exists() else dict(schema=1, provider='agy', images_reserved=0, stop=None)

    def reserve(self, asset, attempt):
        with file_lock(self.art/'.budget.lock'):
            usage = self._load()
            if usage['stop']: raise RuntimeError('SPEND_STOP: '+str(usage['stop']))
            if usage['images_reserved'] >= self.config['run_image_cap']: raise RuntimeError('AGY_RUN_CAP')
            path = self.art/'history.jsonl'
            events = [json.loads(s) for s in path.read_text(encoding='utf-8').splitlines()] if path.exists() else []
            agy_events=[e for e in events if e.get('provider')=='agy']
            reservations=[e for e in agy_events if e.get('event')=='reserved']
            if len(reservations)!=usage['images_reserved']:raise RuntimeError('AGY_LEDGER_MISMATCH; audit before spending')
            completed={(e.get('asset'),e.get('attempt')) for e in agy_events if e.get('event')=='result'}
            if any((e['asset'],e['attempt']) not in completed for e in reservations):
                raise RuntimeError('AGY_UNFINISHED_RESERVATION; inspect interrupted process before spending')
            slot = re.sub(r'-v\d+$', '', asset)
            used = sum(e.get('event')=='reserved' and re.sub(r'-v\d+$','',e.get('asset',''))==slot for e in events)
            if used >= self.attempt_limit(asset): raise RuntimeError('ASSET_ATTEMPT_CAP: '+slot)
            usage['images_reserved'] += 1
            write_json(self.art/'usage-agy.json', usage)
            append_json(path,dict(event='reserved',asset=asset,attempt=attempt,at=now(),images=1,
                                  origin='agy-cli',provider='agy',model=self.model,run=self.config['run_id']))

    def record(self, event):
        super().record({'provider':'agy','model':self.model,**event})

    def stop(self, reason):
        with file_lock(self.art/'.budget.lock'):
            usage=self._load()
            if not usage['stop']:
                usage['stop']=dict(at=now(),reason=reason)
                write_json(self.art/'usage-agy.json',usage)
                append_json(self.art/'history.jsonl',dict(event='spend-stop',provider='agy',model=self.model,**usage['stop']))

    def summary(self):
        usage=self._load()
        return dict(provider='agy',model=self.model,images_reserved=usage['images_reserved'],
                    remaining=self.config['run_image_cap']-usage['images_reserved'],cap=self.config['run_image_cap'],
                    real_allowance='unknown',stop=usage['stop'])

def conversation_id(text):
    def walk(value):
        if isinstance(value,dict):
            for key in ('conversation_id','conversationId','session_id','sessionId'):
                if isinstance(value.get(key),str) and value[key]:return value[key]
            for item in value.values():
                result=walk(item)
                if result:return result
        elif isinstance(value,list):
            for item in value:
                result=walk(item)
                if result:return result
    for line in text.splitlines():
        try:
            result=walk(json.loads(line))
            if result:return result
        except json.JSONDecodeError:pass
    try:return walk(json.loads(text))
    except json.JSONDecodeError:return None

def image_evidence(session, brain=None):
    """Follow only child IDs explicitly created by this conversation, never neighbours."""
    brain=brain or Path.home()/'.gemini/antigravity-cli/brain'
    queue=[session];seen=set();calls=[];logs=[];errors=[]
    while queue:
        sid=queue.pop()
        if sid in seen:continue
        seen.add(sid)
        path=brain/sid/'.system_generated/logs/transcript_full.jsonl'
        if not path.is_file():continue
        logs.append(dict(session=sid,sha256=sha(path)))
        for line in path.read_text(encoding='utf-8').splitlines():
            try:event=json.loads(line)
            except json.JSONDecodeError:continue
            for call in event.get('tool_calls',[]):
                if call.get('name')=='generate_image':calls.append(dict(session=sid,**call))
            content=event.get('content','')
            if event.get('type')=='GENERIC' and 'Created the following subagents:' in content:
                queue+=re.findall(r'"conversationId"\s*:\s*"([a-f0-9-]+)"',content)
            # Actual image tool responses, not copied historical logs or the prompt.
            if event.get('type')=='GENERATE_IMAGE' or event.get('type')=='ERROR':
                error=failure_evidence(content)
                if error:errors.append(error)
    return dict(calls=calls,logs=logs,errors=errors)

def verify_prompt(evidence,prompt):
    return len(evidence['calls'])==1 and evidence['calls'][0]['args'].get('Prompt')==prompt

def run_turn(exe, instruction, folder, budget, asset, name, session=None):
    command=[exe,'-p',instruction,'--model',budget.model,'--dangerously-skip-permissions',
             '--disable-slash-commands','--output-format','stream-json']
    if session:command+=['--conversation',session]
    log=folder/(name+'.jsonl');started=time.monotonic()
    with log.open('w',encoding='utf-8') as output:
        process=subprocess.Popen(command,cwd=folder,stdout=output,stderr=subprocess.STDOUT)
        while process.poll() is None:
            evidence=failure_evidence(log.read_text(encoding='utf-8',errors='replace'))
            timeout=time.monotonic()-started>600
            if evidence or timeout:
                budget.stop(asset+': '+(evidence or '600 second timeout; outcome unknown'))
                if os.name=='nt':subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],capture_output=True)
                else:process.kill()
                process.wait(timeout=20)
                break
            time.sleep(.5)
    text=log.read_text(encoding='utf-8',errors='replace')
    evidence=failure_evidence(text)
    if evidence:budget.stop(asset+': '+evidence)
    return process.returncode,text

def generate(row,style,budget,refine=False):
    reference_gate(row)
    folder_base=budget.art/'raw'/row['id']
    old=[read_json(p) for p in sorted(folder_base.glob('attempt-*/sidecar.json'))]
    signature=digest(dict(row=row,style=style,provider='agy',model=budget.model))
    for previous in old:
        if previous['input_hash']!=signature:raise ValueError('Immutable ID changed; mint new id: '+row['id'])
    if old and not refine:
        previous=old[-1]
        if previous['status']=='generated' and (not Path(previous['image']).is_file() or sha(previous['image'])!=previous['sha256']):
            return dict(previous,status='artifact-invalid',error='No automatic spend; restore artifact')
        return previous
    correction=None
    if refine:
        rejection=read_json(budget.art/'rejections'/(row['id']+'.json'))
        if not old or old[-1]['status']!='generated' or rejection['image_sha256']!=old[-1]['sha256']:
            raise ValueError('Exact generated-image rejection required; never retry transport failures')
        correction=rejection['note']
    references=row.get('style_references',[])
    if isinstance(references,str):references=json.loads(references) if references else []
    source=row.get('reference','')
    paths=[Path(p) if Path(p).is_absolute() else ROOT/p for p in ([source] if source else [])+references]
    if len(paths)>14:raise ValueError('At most 14 total image inputs')
    for path in paths:
        if not path.is_file():raise ValueError('Reference missing: '+str(path))
        with Image.open(path) as im:
            im.verify()
    if source:
        with Image.open(paths[0]) as im:
            if min(im.size)<512:raise ValueError('Full-resolution edit source required (minimum edge 512)')
    exe=os.environ.get('AGY',str(Path(os.environ.get('LOCALAPPDATA',''))/'agy/bin/agy.exe'))
    if not Path(exe).is_file():raise ValueError('agy executable missing before spend')
    attempt=len(old)+1;folder=folder_base/f'attempt-{attempt:02}'
    if folder.exists():raise ValueError('Existing attempt folder requires inspection')
    prompt=compile_prompt(row,style,correction)
    target=(folder/'image.png').resolve()
    sidecar=dict(asset=row['id'],provider='agy',origin='agy-cli',model=budget.model,image_model='Nano Banana 2 (provider built-in image tool)',
                 timestamp=now(),attempt=attempt,brief=row,prompt=prompt,input_hash=signature,status='reserved',image=None,
                 mode='edit' if source else 'generate',references=[dict(path=str(p.resolve()),sha256=sha(p)) for p in paths],
                 owner_approved=False,runtime_enabled=False)
    try:budget.reserve(row['id'],attempt)
    except RuntimeError as exc:return dict(sidecar,status='spend-blocked',error=str(exc))
    folder.mkdir(parents=True)
    write_json(folder/'sidecar.json',sidecar)
    instruction=(f"{'Edit' if source else 'Generate'} exactly ONE image with your built-in Nano Banana 2 image tool. "
        f"Use 2K resolution, aspect ratio matching {row['size']}. Save the resulting PNG to {target}. "
        'Use the IMAGE PROMPT below verbatim as the image tool prompt. Do not paraphrase. '
        'Use your built-in image-generator component if that is how the image tool is exposed. '
        'Do not generate variants, retry any image call, use web, launch coding agents, or modify any other project files. '
        'You may read input images and copy the single image tool result to the requested output. '
        'Finish only after the file exists; reply with its saved absolute path.\n')
    if source:instruction+='EDIT TARGET (full resolution, preserve identity/design): '+str(paths[0].resolve())+'\n'
    for i,path in enumerate(paths[1:] if source else paths):instruction+=f'STYLE REFERENCE {i+1}: {path.resolve()}\n'
    instruction+='\nIMAGE PROMPT:\n'+prompt
    (folder/'request.txt').write_text(instruction,encoding='utf-8')
    started=time.monotonic()
    try:
        code,output=run_turn(exe,instruction,folder,budget,row['id'],'generate')
        sidecar['returncode']=code;sidecar['session_id']=conversation_id(output)
        if budget.summary()['stop']:raise RuntimeError('Provider stop latched: '+str(budget.summary()['stop']))
        if code!=0:raise RuntimeError('agy nonzero exit: '+str(code))
        if not target.is_file() or target.stat().st_size==0:raise RuntimeError('EMPTY_OUTPUT: expected PNG does not exist')
        with Image.open(target) as im:
            if im.format!='PNG':raise ValueError('Output is not PNG')
            sidecar['source_size']=list(im.size);im.verify()
        if not sidecar['session_id']:raise RuntimeError('No conversation ID; cannot verify same-session continuation')
        before=sha(target)
        code,follow=run_turn(exe,f'In this same conversation, verify that the already generated file {target} exists. Do NOT call the image tool or generate or edit anything. Do NOT modify the file. Reply with its absolute path only.',
                            folder,budget,row['id'],'verify',sidecar['session_id'])
        if code!=0 or budget.summary()['stop'] or sha(target)!=before:raise RuntimeError('Continuation verification failed')
        evidence=image_evidence(sidecar['session_id'])
        sidecar['image_tool_evidence']=evidence
        if len(evidence['calls'])>1:raise RuntimeError('Multiple image calls; accounting audit required')
        if evidence['errors']:raise RuntimeError('Image tool error: '+str(evidence['errors']))
        sidecar.update(status='generated',image=str(target),sha256=before,continuation_verified=True,
                       prompt_verbatim_verified=verify_prompt(evidence,prompt),
                       prompt_verification='Exact tool parameters from this session and explicitly linked image-generator children')
    except Exception as exc:
        sidecar.update(status='generation-error',error=str(exc))
        budget.stop(row['id']+': '+str(exc))
    sidecar['elapsed_seconds']=round(time.monotonic()-started,3)
    write_json(folder/'sidecar.json',sidecar)
    budget.record(dict(event='result',**sidecar))
    print(row['id'],sidecar['status'],sidecar.get('error',''),flush=True)
    return sidecar
