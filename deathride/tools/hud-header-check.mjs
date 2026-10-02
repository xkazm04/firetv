// Capture the short preparation header through an ordinary host track command.
import WebSocket from 'ws';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID,createHash} from 'node:crypto';
const [base,pin,output]=process.argv.slice(2);assert.equal(new URL(base).port,'8768');
const device=new URL(base).hostname+':5555',run=promisify(execFile),pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats')).json();
let ws;const captures=[];
await mkdir(output,{recursive:true});
try {
 assert.equal((await stats()).slots.filter(s=>s.connected).length,0);
 ws=new WebSocket(base.replace('http','ws')+'/ws');
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('pair timeout')),8000);ws.on('open',()=>ws.send(JSON.stringify({t:'hello',pin,profile:'hud-header-'+randomUUID()})));ws.on('message',data=>{const m=JSON.parse(data);if(m.t==='welcome'){assert.equal(m.slot,0);clearTimeout(timer);resolve()}if(m.t==='error')reject(Error(m.message))})});
 for(const id of ['switchback','ridge']) {
  ws.send(JSON.stringify({t:'track',id}));let before;
  for(let i=0;i<100;i++){before=await stats();if(before.track.id===id&&!before.sceneryReady)break;await pause(20)}
  assert.equal(before.track.id,id);assert.equal(before.sceneryReady,false,'Observe actual preparation before requesting image');
  const file=output+'/preparing-'+id+'.png';const shot=await run('adb',['-P',process.env.PROBE_ADB_PORT||'5039','-s',device,'exec-out','screencap','-p'],{encoding:'buffer',windowsHide:true,timeout:15000,maxBuffer:8e6});await writeFile(file,shot.stdout);
  captures.push({file,before,after:await stats(),limit:'Readback follows telemetry; visual inspection establishes whether preparation remained visible.'});
  for(let i=0;i<100&&!(await stats()).sceneryReady;i++)await pause(100);
 }
 await writeFile(output+'/result.json',JSON.stringify({utc:new Date().toISOString(),apkSha256:createHash('sha256').update(await readFile('app/build/outputs/apk/debug/app-debug.apk')).digest('hex'),captures},null,2));console.log('Two live preparation captures saved');
}finally {ws?.close()}
