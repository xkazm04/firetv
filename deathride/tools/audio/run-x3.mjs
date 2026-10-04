#!/usr/bin/env node
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {session,waves,reuse,argv} from './x3-plan.mjs';
import {request,args,sessionUsage} from './elevenlabs.mjs';

const cli=args(process.argv.slice(2)), wave=cli.wave;
if(!Object.hasOwn(waves,wave))throw Error('--wave effects|engines|voices required');
const base=`audio/x3/${wave}`;fs.mkdirSync(base,{recursive:true});
const save=(name,data)=>fs.writeFileSync(`${base}/${name}.json`,JSON.stringify(data,null,2)+'\n');
const run=a=>{
  const p=spawnSync(process.execPath,['tools/audio/elevenlabs.mjs',...a],{encoding:'utf8',windowsHide:true});
  if(p.status!==0){process.stderr.write(p.stderr||'Guarded tool failed; stop and reconcile.');process.exit(1);}
  return JSON.parse(p.stdout);
};
const plan=waves[wave];
// Validation and aggregate estimate are always completed before any generation.
const estimates=plan.map(r=>({...request(args(argv(r,wave))),id:r.id}));
const total=estimates.reduce((n,r)=>n+r.estimate,0);
save('plan',{session,wave,samples:[...(wave==='effects'?reuse:[]),...plan],generationEstimate:total});
const dry=plan.map(r=>({id:r.id,...run([...argv(r,wave),'--dry-run'])}));
save('dry-run',{at:new Date().toISOString(),wave,total,samples:dry});
console.log(JSON.stringify({wave,calls:plan.length,conservativeEstimate:total,dryRun:!cli.generate}));
if(cli.generate){
  if(!fs.existsSync(`${base}/credits-before.json`))save('credits-before',run(['credits']));
  for(const r of plan){
    const file=`${base}/raw/${r.id}.mp3`;
    if(fs.existsSync(file)){
      const s=JSON.parse(fs.readFileSync(file+'.json','utf8'));
      if(s.status!=='complete'||s.session!==session||s.sha256!==createHash('sha256').update(fs.readFileSync(file)).digest('hex'))throw Error('Existing take is unresolved or changed; stop');
      continue;
    }
    console.log(JSON.stringify({id:r.id,...run(argv(r,wave))}));
  }
  save('credits-after',run(['credits']));
  const records=fs.readFileSync('tools/audio/ledger.jsonl','utf8').trim().split('\n').map(JSON.parse);
  const latest=[...new Map(records.filter(r=>r.session===session).map(r=>[r.id,r])).values()];
  save('spend',{at:new Date().toISOString(),session,...sessionUsage(records,session),cap:9000,reserve:8000,
    providerConfirmed:latest.reduce((s,r)=>s+(r.providerCredits??0),0),unconfirmed:latest.filter(r=>r.providerCredits===null).map(r=>r.out),
    caveat:'Shared account changes can include Garden VR and delayed billing. Conservative charges are not expanded by low actual charges.'});
}
