// Sustained real-time device load: ordinary 30 Hz inputs; no host simulation controls.
import WebSocket from 'ws';
import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash,randomUUID} from 'node:crypto';
import {Pilot,tuning} from './pilot.mjs';
const [base,pin,durationArg='900',output='evidence/phase2/i2-soak.json']=process.argv.slice(2),duration=Number(durationArg);
const device=process.env.PROBE_DEVICE||new URL(base).hostname+':5555',run=promisify(execFile),pause=ms=>new Promise(r=>setTimeout(r,ms));
const adb=async(...args)=>(await run('adb',['-s',device,...args],{encoding:'utf8',timeout:20000,windowsHide:true,maxBuffer:2e6})).stdout;
const stats=async()=>await(await fetch(base+'/stats',{signal:AbortSignal.timeout(5000)})).json();
const quantiles=a=>{const v=[...a].sort((a,b)=>a-b);return{n:v.length,p50:v[Math.ceil(v.length*.5)-1]||0,p95:v[Math.ceil(v.length*.95)-1]||0,max:v.at(-1)||0}};
const rejections=[],pumpStalls=[],errors=[],windows=[],races=[],thermals=[],clients=[],phaseChanges=[];let started=0,inputDurationSeconds=0,active=true,timer,failure,initial,final;
async function thermal(second){
 const [temperature,memory]=await Promise.all([adb('shell','dumpsys','thermalservice'),adb('shell','dumpsys','meminfo','--local','dev.deathride.tv')]);
 const hal=temperature.split('Current temperatures from HAL:')[1]?.split('Current cooling devices from HAL:')[0]||'';
 const sensors=Object.fromEntries([...hal.matchAll(/mValue=([\d.-]+), mType=\d+, mName=([^,}]+)/g)].map(m=>[m[2],Number(m[1])]));
 const row={second,utc:new Date().toISOString(),status:Number(temperature.match(/Thermal Status: (\d+)/)?.[1]??-1),sensors,pssKb:Number(memory.match(/TOTAL PSS:\s+(\d+)/)?.[1]??memory.match(/TOTAL\s+(\d+)/)?.[1]??-1),temperature,memory};
 thermals.push(row);console.log('thermal '+second+' s status '+row.status+' sensors '+JSON.stringify(sensors)+' PSS '+row.pssKb+' KB');
}
async function join(){
 const c={ws:new WebSocket(base.replace('http','ws')+'/ws'),slot:-1,q:0,offset:0,bestRtt:Infinity,rtt:[],pending:new Map(),accepted:0,rejected:0,sent:0,command:{s:0,a:0,b:0,h:0,fire:0,mine:0,weapon:0}};clients.push(c);
 c.send=m=>{if(c.ws.readyState===WebSocket.OPEN)c.ws.send(JSON.stringify(m))};
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('welcome timeout')),10000);c.ws.on('error',e=>{errors.push(e.message);reject(e)});c.ws.on('open',()=>c.send({t:'hello',pin,profile:'soak-'+randomUUID()}));c.ws.on('message',data=>{const m=JSON.parse(data),now=performance.now();if(m.t==='welcome'){c.slot=m.slot;clearTimeout(timeout);resolve()}if(m.t==='error')reject(Error(m.message));if(m.t==='pong'){const rtt=now-m.ts;if(rtt<c.bestRtt){c.bestRtt=rtt;c.offset=m.tvNow-(m.ts+now)/2;c.send({t:'sync',offset:c.offset})}}if(m.t==='ack'){const sent=c.pending.get(m.q);if(sent!==undefined){c.rtt.push(now-sent);c.pending.delete(m.q)}m.accepted?c.accepted++:(c.rejected++,rejections.push({slot:c.slot,q:m.q,second:started?(now-started)/1000:null,rttMs:sent===undefined?null:now-sent,ack:m}))}})});
 for(let i=0;i<8;i++){c.send({t:'ping',ts:performance.now()});await pause(60)}return c;
}
let hardware,apkSha256,thermalPending;
const loadObservations={racePolls:0,sixActivePolls:0,weaponEffectPolls:0,peakProjectiles:0,peakMines:0,peakBlasts:0,surfaces:[]};
try {
 hardware={controllerHostPriority:process.env.PROBE_PRIORITY||'Normal',simulationHostPriority:process.env.SIM_PRIORITY||'Normal',model:(await adb('shell','getprop','ro.product.model')).trim(),display:await adb('shell','wm','size'),wifi:await adb('shell','cmd','wifi','status'),startedUtc:new Date().toISOString(),preheated:true,memoryMethod:'dumpsys meminfo --local: kernel/system-side details without calling application'};
 apkSha256=createHash('sha256').update(await readFile('app/build/outputs/apk/debug/app-debug.apk')).digest('hex');
 const a=await join(),b=await join();assert.equal(a.slot,0);assert.equal(b.slot,1);await thermal(0);
 const allRoutes=await(await fetch(base+'/routes')).json();const routes=['foundry','scree','saltline','sluice','ridge'].map(id=>{const route=allRoutes.find(r=>r.id===id);assert.ok(route,`Missing soak course ${id}`);return route});let pilot=new Pilot(routes,true),track=0,raceEpoch=0,lastPhase='',lastTransition=0,nextWindow=10000,nextThermal=60000,nextPing=30000,starting=false;
 a.send({t:'track',id:routes[0].id});for(let n=0;n<100;n++){const s=await stats();if(s.track.id===routes[0].id&&s.sceneryReady)break;await pause(100)}initial=await stats();assert.equal(initial.track.id,routes[0].id);a.send({t:'start'});started=performance.now();let nextInput=started;
 function pump(){if(!active)return;const now=performance.now();if(now>=nextInput){for(const c of clients){const q=c.q++,ts=performance.now();c.pending.set(q,ts);c.send({t:'i',q,ts,...c.command});c.sent++}nextInput+=1000/tuning.inputHz;if(now-nextInput>100){pumpStalls.push({second:(now-started)/1000,lateMs:now-nextInput});nextInput=now+1000/tuning.inputHz}}timer=setTimeout(pump,Math.max(0,nextInput-performance.now()))}pump();
 while(performance.now()-started<duration*1000){
  const s=await stats(),elapsed=performance.now()-started;final=s;
  if(s.phase==='race'){const c=s.combatSummary;loadObservations.racePolls++;if(c.active===6)loadObservations.sixActivePolls++;if(c.projectiles+c.mines+c.blasts>0)loadObservations.weaponEffectPolls++;loadObservations.peakProjectiles=Math.max(loadObservations.peakProjectiles,c.projectiles);loadObservations.peakMines=Math.max(loadObservations.peakMines,c.mines);loadObservations.peakBlasts=Math.max(loadObservations.peakBlasts,c.blasts);for(const slot of s.slots)if(!loadObservations.surfaces.includes(slot.surfaceId))loadObservations.surfaces.push(slot.surfaceId)}
  if(s.phase!==lastPhase){phaseChanges.push({second:elapsed/1000,phase:s.phase,track:s.track.id,raceEpoch});lastTransition=elapsed;lastPhase=s.phase;
   if(s.phase==='race'){raceEpoch++;starting=false}
   if(s.phase==='results'){races.push({second:elapsed/1000,stats:s});console.log('result '+races.length+' '+s.track.id+' '+s.raceSeconds.toFixed(2)+' s / '+s.combatSummary.shots+' shots / '+s.combatSummary.living+' living');a.send({t:'lobby'});starting=true;track=(track+1)%routes.length}
  }
  if(starting&&s.phase==='lobby'){if(s.track.id!==routes[track].id)a.send({t:'track',id:routes[track].id});else{pilot=new Pilot(routes,true);a.send({t:'start'});starting=false}}
  for(const c of clients)c.command=pilot.command(s,c.slot);
  if(elapsed>=nextWindow){const fullRace=s.phase==='race'&&elapsed-lastTransition>=10000&&s.raceSeconds>=10;windows.push({second:elapsed/1000,raceEpoch,fullRace,rtt:clients.map(c=>quantiles(c.rtt.slice(-300))),stats:s});console.log('window '+Math.round(elapsed/1000)+' s / '+s.phase+' '+s.track.id+' / frame '+JSON.stringify(s.frameTimeMs.last10s));nextWindow+=10000}
  if(elapsed>=nextPing){for(const c of clients)c.send({t:'ping',ts:performance.now()});nextPing+=30000}
  if(elapsed>=nextThermal){if(thermalPending)await thermalPending;thermalPending=thermal(Math.round(elapsed/1000));nextThermal+=60000}
  await pause(1000/tuning.telemetryHz);
 }
 active=false;clearTimeout(timer);const elapsedSeconds=(performance.now()-started)/1000;inputDurationSeconds=elapsedSeconds;final=await stats();
 if(!windows.length||windows.at(-1).second<duration-1)windows.push({second:elapsedSeconds,raceEpoch,fullRace:final.phase==='race'&&elapsedSeconds*1000-lastTransition>=10000&&final.raceSeconds>=10,rtt:clients.map(c=>quantiles(c.rtt.slice(-300))),stats:final});
 if(thermalPending)await thermalPending;await thermal(elapsedSeconds);assert.deepEqual(errors,[]);assert.ok(elapsedSeconds>=duration);assert.ok(races.length>=5,'at least one complete five-course cycle');assert.ok(new Set(races.map(r=>r.stats.track.id)).size===5);
 for(const c of clients){assert.equal(c.rejected,0);assert.ok(c.accepted>duration*29);assert.ok(final.slots[c.slot].clockSynced)}
 const artWindows=windows.map(w=>w.stats.art);assert.ok(artWindows.every(a=>a.budgetOk===true),'owned texture budget');assert.ok(artWindows.every(a=>a.regions===78&&a.failures===0),'shipped atlas pages stay loaded');assert.ok(final.art.draws-initial.art.draws>1000,'actual atlas draws during load');assert.ok(thermals.every(t=>t.pssKb>0&&t.pssKb<=192*1024),'PSS ceiling 192 MiB');const median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];const samples=thermals.slice(1);assert.ok(median(samples.slice(-3).map(t=>t.pssKb))-median(samples.slice(0,3).map(t=>t.pssKb))<=8*1024,'PSS median growth at most 8 MiB');assert.ok(windows.filter(w=>w.fullRace).every(w=>w.stats.frameTimeMs.last10s.p50>=16&&w.stats.frameTimeMs.last10s.p50<=18),'active frame medians near 16.7 ms');
 console.log(JSON.stringify({elapsedSeconds,races:races.length,windows:windows.length,hz:clients.map(c=>c.sent/elapsedSeconds),rtt:clients.map(c=>quantiles(c.rtt)),errors},null,2));
}catch(error){failure=error.stack;throw error}finally{
 active=false;clearTimeout(timer);for(const c of clients)c.ws.close();if(thermalPending)await thermalPending.catch(e=>errors.push(e.message));
 const elapsedSeconds=started?(performance.now()-started)/1000:0;
 await writeFile(output,JSON.stringify({hardware,apkSha256,requestedSeconds:duration,inputDurationSeconds,elapsedSeconds,load:'Two Node WebSocket controllers at 30 Hz with public telemetry pursuit (100 ms wait after each response; nominal maximum 10 Hz); six-car practice, five-theme course cycle, packaged atlas scenery/effects with procedural cars. Clock offset from best RTT. Preheated Stick. Not human or optical latency.',errors,failure,rejections,pumpStalls,loadObservations,clients:clients.map(c=>({slot:c.slot,sent:c.sent,accepted:c.accepted,rejected:c.rejected,pending:c.pending.size,bestRtt:c.bestRtt,offset:c.offset,rtt:quantiles(c.rtt)})),phaseChanges,thermals,races,windows,initial,final},null,2));
}
