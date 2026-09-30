import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {randomUUID} from 'node:crypto';
const [base,prefix='w8-scenery']=process.argv.slice(2),device=process.env.PROBE_DEVICE||'10.0.0.139:5555',run=promisify(execFile);
const adb=async(...args)=>(await run('adb',['-s',device,...args],{encoding:'utf8',windowsHide:true})).stdout;
const pause=ms=>new Promise(r=>setTimeout(r,ms)),stats=async()=>await(await fetch(base+'/stats')).json();
const checks=[];let before=await stats();assert.equal(before.phase,'lobby');
for(let i=0;i<5;i++){
 const started=performance.now();await adb('shell','input','keyevent','82');let after;
 for(let j=0;j<300;j++){after=await stats();if(after.track.id!==before.track.id&&after.sceneryReady!==false)break;await pause(30)}
 assert.notEqual(after.track.id,before.track.id);assert.notEqual(after.sceneryReady,false);const readyMs=performance.now()-started;
 await pause(500);await adb('shell','screencap','-p','/sdcard/w8-scenery.png');await adb('pull','/sdcard/w8-scenery.png','evidence/phase1/'+prefix+'-'+after.track.id+'.png');
 checks.push({track:after.track.id,readyMs,stats:await stats()});console.log(after.track.id+' ready '+readyMs.toFixed(2)+' ms');before=after;
}
const pid=(await adb('shell','pidof','dev.deathride.tv')).trim();let logs=await adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');let preparation;
if(process.argv.includes('--countdown')){
 const pin=[...logs.matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];assert.ok(pin);const ws=new WebSocket(base.replace('http','ws')+'/ws');const send=m=>ws.send(JSON.stringify(m));
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('welcome timeout')),5000);ws.on('error',reject);ws.on('open',()=>send({t:'hello',pin,profile:'scenery-'+randomUUID()}));ws.on('message',data=>{const m=JSON.parse(data);if(m.t==='welcome'){clearTimeout(timeout);resolve()}if(m.t==='error')reject(Error(m.message))})});
 const courses=(await(await fetch(base+'/catalog')).json()).tracks;const current=(await stats()).track.id;const next=courses[(courses.findIndex(c=>c.id===current)+1)%courses.length].id;
 send({t:'track',id:next});send({t:'start'});let loadingSamples=0,readyAt=0,result;const began=performance.now();
 while(performance.now()-began<15000){result=await stats();if(result.phase==='countdown'&&!result.sceneryReady){loadingSamples++;assert.equal(result.raceSeconds,0)}if(result.phase==='countdown'&&result.sceneryReady&&!readyAt)readyAt=performance.now();if(result.phase==='race')break;await pause(40)}
 assert.ok(loadingSamples>0,'observed preparation while countdown waits');assert.equal(result.phase,'race');assert.ok(performance.now()-readyAt>=2700,'three-second countdown begins after preparation');assert.equal(result.track.id,next);
 preparation={loadingSamples,countdownAfterReadyMs:performance.now()-readyAt,track:next};send({t:'lobby'});await pause(200);
 // Cancel an in-progress bake by choosing another course; only the latest course may publish ready.
 const canceled=courses[(courses.findIndex(c=>c.id===next)+1)%courses.length].id;send({t:'track',id:canceled});await pause(120);send({t:'track',id:current});
 for(let n=0;n<300;n++){result=await stats();if(result.track.id===current&&result.sceneryReady)break;await pause(30)}assert.equal(result.track.id,current);assert.ok(result.sceneryReady);preparation.canceledCourse=canceled;preparation.finalCourse=current;ws.close();
 logs=await adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');console.log(JSON.stringify(preparation));
}
await writeFile('evidence/phase1/'+prefix+'.json',JSON.stringify({checks,preparation,logs:logs.split('\n').filter(s=>s.includes('sceneryBake'))},null,2));
console.log(logs.split('\n').filter(s=>s.includes('sceneryBake')).join('\n'));
