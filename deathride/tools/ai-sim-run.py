"""Run immutable headless studies with explicit scope and retained command/timing logs."""
from pathlib import Path
import argparse,datetime,json,os,subprocess,time

p=argparse.ArgumentParser()
p.add_argument('runtime');p.add_argument('study',choices=['campaign','library','finish','ledgers','difficulty','roster','rotation','duel','skill'])
p.add_argument('tag');p.add_argument('--samples',type=int,default=32);p.add_argument('--threads',type=int,default=4)
p.add_argument('--buyer',default='both');p.add_argument('--property',action='append',default=[]);a=p.parse_args()
root=Path(__file__).resolve().parents[1];os.chdir(root)
snapshot=root/'build/campaign-v2-runtime'/a.runtime
cp=(snapshot/'classpath.txt').read_text().strip()
out=root/'evidence/ai/z3/runs';out.mkdir(parents=True,exist_ok=True)
name=f'{a.tag}-{a.study}';log=out/f'{name}.log';meta=out/f'{name}.json'
if log.exists() or meta.exists():raise SystemExit('Refuse to overwrite a study log')
base=['java','-Xmx1024m',f'-Djava.util.concurrent.ForkJoinPool.common.parallelism={a.threads}',
      '-DcampaignPhysicalSeedNamespace=103118209','-DcampaignSeed=103090001','-DdesignSeedNamespace=104010003']+[f'-D{prop}' for prop in a.property]
campaign='dev.deathride.core.CampaignReportKt';design='dev.deathride.core.CampaignDesignReportKt'
commands=[]
def add(main,args,props=()):commands.append(base+list(props)+['-cp',cp,main]+list(map(str,args)))
if a.study in ('campaign','library','finish'):
    if a.study!='finish':add(campaign,['physical',4,a.tag]);add(campaign,['boss',16,a.tag])
    if a.study!='library':add(campaign,['duel',512,a.tag])
if a.study in ('campaign','finish','ledgers'):
    for buyer in ('race','pr') if a.buyer=='both' else (a.buyer,):add(campaign,['careers',2000,a.tag],[f'-DcampaignBuyer={buyer}'])
    add(campaign,['verify',4,a.tag])
elif a.study=='duel':add(campaign,['duel',a.samples,a.tag])
elif a.study=='skill':add('dev.deathride.core.AiSkillReportKt',[a.samples,a.tag])
elif a.study not in ('campaign','library','finish','ledgers'):add(design,[a.study,a.samples,f'build/reports/ai/z3/{a.tag}'])
state=dict(runtime=a.runtime,snapshotCommit=json.loads((snapshot/'provenance.json').read_text())['commit'],study=a.study,tag=a.tag,
           threads=a.threads,priority='BelowNormal',started=datetime.datetime.now(datetime.timezone.utc).isoformat(),steps=[],status='running')
meta.write_text(json.dumps(state,indent=2)+'\n')
with log.open('w',encoding='utf-8') as stream:
    for command in commands:
        started=time.monotonic()
        result=subprocess.run(command,stdout=stream,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW|subprocess.BELOW_NORMAL_PRIORITY_CLASS)
        stream.flush();state['steps'].append(dict(command=command,exit=result.returncode,wallSeconds=time.monotonic()-started))
        if result.returncode:
            state['status']='failed';meta.write_text(json.dumps(state,indent=2)+'\n');raise SystemExit(result.returncode)
        meta.write_text(json.dumps(state,indent=2)+'\n')
state['status']='complete';state['ended']=datetime.datetime.now(datetime.timezone.utc).isoformat();meta.write_text(json.dumps(state,indent=2)+'\n')
print(name,'complete',flush=True)
