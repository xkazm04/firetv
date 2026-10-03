// Ordinary controller traffic and observed device counters; no simulation control API.
import WebSocket from 'ws';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID,createHash} from 'node:crypto';
import {setPriority,getPriority,constants as osConstants} from 'node:os';
import {Pilot} from './pilot.mjs';
const [base,pin,output,secondsText='900']=process.argv.slice(2),duration=Number(secondsText);
const screenshotsEnabled=process.env.PROBE_SCREENSHOTS!=='0';
const minesEnabled=process.env.PROBE_MINES==='1';
const rotateFirst=process.env.PROBE_ROTATE_FIRST==='1';
const hostPriority=process.env.PROBE_PRIORITY||'Normal';
const profiling=process.env.PROBE_PROFILE==='1';
assert.ok(['Normal','AboveNormal'].includes(hostPriority));
if(hostPriority==='AboveNormal')setPriority(0,osConstants.priority.PRIORITY_ABOVE_NORMAL);
const stream=process.env.DEATHRIDE_TEST_STREAM;
const testPort=stream==='perf'?'8772':stream==='hud'?'8768':'8767';
const testPackage=stream==='perf'?'dev.deathride.perf':stream==='hud'?'dev.deathride.hud':'dev.deathride.abilities';
assert.equal(new URL(base).port,testPort);assert.ok(duration>=60&&duration<=1800);
const device=process.env.PROBE_DEVICE||new URL(base).hostname+':5555',run=promisify(execFile);
const adbPort=process.env.PROBE_ADB_PORT||'5037';assert.ok(/^\d+$/.test(adbPort));
const pause=ms=>new Promise(r=>setTimeout(r,ms)),clients=[];
const get=async path=>{const r=await fetch(base+path,{signal:AbortSignal.timeout(5000)});assert.ok(r.ok);return r.json()};
async function runAdb(args,options){try{return await run('adb',['-P',adbPort,'-s',device,...args],options)}catch(error){if(!/device .*not found|device offline|cannot connect to daemon|failed to start daemon/.test(String(error.stderr||error.message)))throw error;(result.adbReconnects??=[]).push({utc:new Date().toISOString(),command:args.join(' ')});await run('adb',['-P',adbPort,'connect',device],{encoding:'utf8',windowsHide:true,timeout:10000});return await run('adb',['-P',adbPort,'-s',device,...args],options)}}
const adb=async(...a)=>(await runAdb(a,{encoding:'utf8',windowsHide:true,timeout:20000,maxBuffer:2e6})).stdout;
const result={startedUtc:new Date().toISOString(),base,device,durationRequestedSeconds:duration,screenshotsEnabled,minesEnabled,nodeVersion:process.version,hostPriority,hostPriorityValue:getPriority(0),windowRetention:'Direct metrics and car/input state; repeated slot garage/career payloads omitted. Full catalog and round-end state retained.',rounds:[],windows:[],memory:[],screenshots:[],pumpStalls:[],rejections:[],classUses:{},classActiveHudSamples:{},limits:'Scripted LAN inputs; no human feel, physical-phone ergonomics or optical latency claim. Rolling frame windows overlap and are not summed.'};
let pumping=false,timer,started=0,nextWindow=0,nextMemory=0,nextPing=30,memoryPending=null;
let nextProfile=0,frameCursor=0,inputCursor=0;
const ackTracing=profiling||stream==='perf';
if(profiling)result.profiles=[];
if(ackTracing)result.ackObservations=[];
async function memory(second){const [text,thermal]=await Promise.all([adb('shell','dumpsys','meminfo','--local',testPackage),adb('shell','dumpsys','thermalservice')]);result.memory.push({second,hostMemory:process.memoryUsage(),pssKb:Number(text.match(/TOTAL PSS:\s+(\d+)/)?.[1]??text.match(/TOTAL\s+(\d+)/)?.[1]??-1),thermalStatus:Number(thermal.match(/Thermal Status: (\d+)/)?.[1]??-1),text,thermal});console.log(JSON.stringify({second:Math.round(second),accepted:clients.map(c=>c.accepted),rejected:clients.map(c=>c.rejected),hostPumpStalls:result.pumpStalls.length}))}
async function waitFor(fn,label){const end=performance.now()+15000;while(performance.now()<end){const s=await get('/stats');if(fn(s))return s;await pause(100)}throw Error('Timed out: '+label)}
async function join(){
 const c={ws:new WebSocket(base.replace('http','ws')+'/ws'),slot:-1,q:0,offset:0,bestRtt:Infinity,pending:new Map(),accepted:0,rejected:0,sent:0,command:{s:0,a:0,b:0,h:0,fire:0,mine:0,weapon:0,ability:0}};clients.push(c);
 c.send=m=>{if(c.ws.readyState===WebSocket.OPEN)c.ws.send(JSON.stringify(m))};
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('pair timeout')),8000);c.ws.on('error',reject);c.ws.on('open',()=>c.send({t:'hello',pin,profile:'ability-probe-'+randomUUID()}));c.ws.on('message',data=>{const m=JSON.parse(data),now=performance.now();if(m.t==='welcome'){c.slot=m.slot;clearTimeout(timeout);resolve()}if(m.t==='error'){clearTimeout(timeout);reject(Error(m.message))}if(m.t==='pong'&&now-m.ts<c.bestRtt){c.bestRtt=now-m.ts;c.offset=m.tvNow-(now+m.ts)/2;c.send({t:'sync',offset:c.offset})}if(m.t==='ack'){const generated=c.pending.get(m.q),sent=generated?.ts;if(ackTracing)result.ackObservations.push([c.slot,m.q,sent,now,m.tvNow,m.accepted,generated?.offset]);c.pending.delete(m.q);if(m.accepted)c.accepted++;else{c.rejected++;result.rejections.push({slot:c.slot,q:m.q,second:(now-started)/1000,rttMs:sent===undefined?null:now-sent,receiveAgeMs:sent===undefined?null:m.tvNow-sent-generated.offset,offset:generated?.offset,ack:m})}}if(m.t==='hud'&&m.combat?.ability?.phase==='ACTIVE'&&m.car){const id=m.car.id;result.classActiveHudSamples[id]=(result.classActiveHudSamples[id]||0)+1}})});
 for(let i=0;i<5;i++){c.send({t:'ping',ts:performance.now()});await pause(50)}return c;
}
try {
 await mkdir(dirname(output),{recursive:true});
 const catalog=await get('/catalog'),routes=await get('/routes');result.catalog=catalog;
 assert.equal((await get('/stats')).slots.filter(s=>s.connected).length,0,'Refuse an occupied host');
 result.model=(await adb('shell','getprop','ro.product.model')).trim();result.display=await adb('shell','wm','size');
 result.apkSha256=createHash('sha256').update(await readFile('app/build/outputs/apk/debug/app-debug.apk')).digest('hex');
 await join();await join();assert.deepEqual(clients.map(c=>c.slot),[0,1]);await memory(0);
 started=performance.now();let next=started;pumping=true;
 function pump(){if(!pumping)return;const now=performance.now();if(now>=next){for(const c of clients){const q=c.q++,ts=performance.now();c.pending.set(q,{ts,offset:c.offset});c.send({t:'i',q,ts,...c.command});c.sent++}next+=1000/30;if(now-next>100){result.pumpStalls.push({second:(now-started)/1000,lateMs:now-next});next=now+1000/30}}timer=setTimeout(pump,Math.max(0,next-performance.now()))}pump();
 const tracks=['foundry','saltline','scree','sluice','ridge'];
 let roundIndex=0;
 while((performance.now()-started)/1000<duration){
  const pair=rotateFirst?roundIndex%10:(roundIndex%5)*2,track=tracks[roundIndex%5];
  for(const c of clients)c.command={s:0,a:0,b:0,h:0,fire:0,mine:0,weapon:0,ability:0};
  clients[0].send({t:'lobby'});await waitFor(s=>s.phase==='lobby','lobby');clients[0].send({t:'track',id:track});
  for(let i=0;i<2;i++)clients[i].send({t:'car',id:catalog.cars[(pair+i)%10].id});
  if(screenshotsEnabled&&rotateFirst&&!result.preparingScreenshot) {
   const selection=await waitFor(s=>s.track.id===track,'track selection published');
   if(!selection.sceneryReady) {
    const name=dirname(output)+'/preparing-circuit.png';const image=await runAdb(['exec-out','screencap','-p'],{encoding:'buffer',windowsHide:true,timeout:10000,maxBuffer:8e6});await writeFile(name,image.stdout);
    result.preparingScreenshot={file:name,before:selection,after:await get('/stats'),limit:'Preparation requested before asynchronous image readback.'};
   }
  }
  const lobby=await waitFor(s=>s.sceneryReady&&s.track.id===track&&clients.every((c,i)=>s.slots[i].car.id===catalog.cars[(pair+i)%10].id),'selection');
  const round={classes:lobby.slots.map(s=>s.car.id),track,startedSecond:(performance.now()-started)/1000};result.rounds.push(round);
  const pilot=new Pilot(routes,true);clients[0].send({t:'start'});await waitFor(s=>s.phase==='race','race');const roundStart=performance.now();
  while((performance.now()-roundStart)<60000&&(performance.now()-started)/1000<duration){
   const s=await get('/stats'),second=(performance.now()-started)/1000;
   if(profiling&&second>=nextProfile){const p=await get(`/profile?frames=${frameCursor}&inputs=${inputCursor}`);result.profiles.push({second,...p});frameCursor=p.frames.end;inputCursor=p.inputs.end;nextProfile=second+10;}
   if(second>=nextWindow){result.windows.push({second,round:roundIndex,stats:{...s,slots:s.slots.map(({hostCareer,career,garage,...slot})=>slot)}});nextWindow=second+1}
   if(second>=nextPing){for(const c of clients)c.send({t:'ping',ts:performance.now()});nextPing=second+30}
   if(second>=nextMemory&&!memoryPending){nextMemory=second+60;memoryPending=memory(second).finally(()=>{memoryPending=null})}
   for(const c of clients){const slot=s.slots[c.slot],alive=s.phase==='race'&&!slot.combat.wrecked;c.command={...pilot.command(s,c.slot),fire:alive?1:0,mine:alive&&minesEnabled?1:0,weapon:0,ability:alive&&(!rotateFirst||s.raceSeconds>=6)?1:0};}
   const capture=screenshotsEnabled&&s.slots.find(slot=>slot.combat.ability?.phase==='ACTIVE'&&!result.screenshots.some(x=>x.car===slot.car.id));
   if(capture){const name=dirname(output)+'/active-'+capture.car.id+'.png';const image=await runAdb(['exec-out','screencap','-p'],{encoding:'buffer',windowsHide:true,timeout:10000,maxBuffer:8e6});await writeFile(name,image.stdout);result.screenshots.push({car:capture.car.id,second,phaseAtRequest:capture.combat.ability.phase,file:name,limit:'Capture follows request; short effects may have advanced before readback'})}
   if(screenshotsEnabled&&rotateFirst&&s.phase==='race') {
    // Match the renderer's observed main driver selection, then record both sides of readback.
    const live=s.traffic.find(car=>car.human&&!car.wrecked&&!car.finished);
    const driver=s.slots[live?.id??0];
    const ability=driver.combat.ability;
    const phase=driver.combat.armingSeconds>0?'ARMING':ability.phase!=='READY'?ability.phase:ability.cooldownSeconds>0?'COOLDOWN':ability.energy<ability.energyCost?'LOW-ENERGY':'READY';
    const key=driver.car.id+'-'+phase;
    result.tvStates??=[];
    if(!result.tvStates.some(x=>x.key===key)) {
     const name=dirname(output)+'/tv-'+key+'.png';
     const image=await runAdb(['exec-out','screencap','-p'],{encoding:'buffer',windowsHide:true,timeout:10000,maxBuffer:8e6});await writeFile(name,image.stdout);
     const after=await get('/stats');result.tvStates.push({key,second,file:name,before:{phase:s.phase,raceSeconds:s.raceSeconds,slots:s.slots},after:{phase:after.phase,raceSeconds:after.raceSeconds,slots:after.slots},limit:'State requested before asynchronous screencap; short phases may change during capture.'});
    }
   }
   if(screenshotsEnabled&&minesEnabled&&!result.mineScreenshot&&s.combatSummary.mines>0){const name=dirname(output)+'/mines.png';const image=await runAdb(['exec-out','screencap','-p'],{encoding:'buffer',windowsHide:true,timeout:10000,maxBuffer:8e6});await writeFile(name,image.stdout);result.mineScreenshot={second,file:name,combatAtRequest:s.combatSummary,limit:'Ordinary mine inputs; image follows telemetry request.'}}
   if(screenshotsEnabled&&rotateFirst&&!result.wreckScreenshot&&s.slots.some(slot=>slot.combat.wrecked)) {
    const name=dirname(output)+'/human-wreck.png';const image=await runAdb(['exec-out','screencap','-p'],{encoding:'buffer',windowsHide:true,timeout:10000,maxBuffer:8e6});await writeFile(name,image.stdout);
    result.wreckScreenshot={file:name,before:s,after:await get('/stats'),limit:'Actual wreck from ordinary inputs; may transition to results during readback.'};
   }
   if(s.phase==='results'){round.endedEarly=true;break}await pause(160);
  }
  round.final=await get('/stats');round.endedSecond=(performance.now()-started)/1000;
  for(const slot of round.final.slots)result.classUses[slot.car.id]=(result.classUses[slot.car.id]||0)+(slot.combat.ability?.uses||0);
  roundIndex++;
 }
 result.actualDurationSeconds=(performance.now()-started)/1000;
 pumping=false;clearTimeout(timer);await pause(500);result.finalStats=await get('/stats');
 if(memoryPending)await memoryPending;await memory(result.actualDurationSeconds);
 result.clients=clients.map(({slot,sent,accepted,rejected})=>({slot,sent,accepted,rejected,hz:sent/result.actualDurationSeconds}));
 assert.ok(catalog.cars.every(c=>result.classUses[c.id]>0&&result.classActiveHudSamples[c.id]>0),'Every class activated and reported ACTIVE');
 assert.ok(result.clients.every(c=>c.accepted===c.sent&&c.rejected===0&&c.hz>29));assert.equal(result.pumpStalls.length,0);
 result.functionalPass=true;
}catch(error){result.error=error.stack;process.exitCode=1}
finally{
 pumping=false;clearTimeout(timer);for(const c of clients){c.send({t:'i',q:c.q++,ts:performance.now(),s:0,a:0,b:0,h:0,fire:0,mine:0,weapon:0,ability:0});c.ws.close()}
 if(memoryPending)await memoryPending.catch(()=>{});
 result.finishedUtc=new Date().toISOString();await writeFile(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({functionalPass:result.functionalPass,error:result.error,duration:result.actualDurationSeconds,rounds:result.rounds.length,classUses:result.classUses,clients:result.clients},null,2));
}
