// Effects-on driving/performance evidence using ordinary LAN controller messages.
// Usage: node drift-probe.mjs http://HOST:8766 PIN OUTPUT.json [seconds-per-pair=30]
import WebSocket from 'ws';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {Pilot} from './pilot.mjs';

const [base, pin, output, secondsText='30'] = process.argv.slice(2);
assert.ok(base && pin && output, 'base, PIN and output are required');
assert.equal(new URL(base).port, '8766', 'Drift probe only targets the isolated lab port');
const seconds=Number(secondsText);assert.ok(seconds>=15 && seconds<=180);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const get=async path=>{const response=await fetch(base+path,{signal:AbortSignal.timeout(5000)});assert.ok(response.ok);return response.json()};
const quantiles=values=>{const a=values.toSorted((x,y)=>x-y);return {count:a.length,p50:a[Math.floor((a.length-1)*.5)]??0,p95:a[Math.floor((a.length-1)*.95)]??0,max:a.at(-1)??0}};
const clients=[];
const result={basis:'Ordinary scripted controller inputs; two LAN clients, four normal AIs; all shipped effects enabled. Not human feel or optical latency.',started:new Date().toISOString(),base,secondsPerPair:seconds,device:process.env.PROBE_DEVICE??'Record device separately',profiles:[],rounds:[]};
let pumping=false,timer;
async function join() {
  const c={ws:new WebSocket(base.replace('http','ws')+'/ws'),q:0,command:{s:0,a:0,b:0,h:0},pending:new Map(),rtt:[],accepted:0,rejected:0,hudSamples:0,driftHudSamples:0,spinHudSamples:0,peakQuality:0,peakSlip:0,pulses:0,holdUntil:0,catchUntil:0,nextPulse:0};
  clients.push(c);c.send=value=>c.ws.send(JSON.stringify(value));
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('Pairing timeout')),8000);
    c.ws.on('error',reject);
    c.ws.on('open',()=>c.send({t:'hello',pin,name:'Drift probe',profile:`drift-probe-${clients.length}`}));
    c.ws.on('message',data=>{
      const m=JSON.parse(data),now=performance.now();
      if(m.t==='error'){clearTimeout(timeout);reject(Error(m.message))}
      if(m.t==='welcome'){c.slot=m.slot;clearTimeout(timeout);resolve()}
      if(m.t==='pong'){const rtt=now-m.ts;c.send({t:'sync',offset:m.tvNow-(now+m.ts)/2,rtt})}
      if(m.t==='ack'){const ts=c.pending.get(m.q);if(ts!==undefined){c.rtt.push(now-ts);c.pending.delete(m.q)}m.accepted?c.accepted++:c.rejected++}
      if(m.t==='hud'){c.hudSamples++;if(m.drifting)c.driftHudSamples++;if(m.spunOut)c.spinHudSamples++;c.peakQuality=Math.max(c.peakQuality,m.driftQuality);c.peakSlip=Math.max(c.peakSlip,Math.abs(m.slipRadians))}
    });
  });
  c.send({t:'ping',ts:performance.now()});return c;
}
async function waitFor(predicate,label,timeout=10000){const deadline=performance.now()+timeout;while(performance.now()<deadline){const s=await get('/stats');if(predicate(s))return s;await delay(100)}throw Error('Timed out: '+label)}
try {
  const catalog=await get('/catalog'),routes=await get('/routes');
  result.catalog=catalog;
  assert.equal((await get('/stats')).slots.filter(s=>s.connected).length,0,'Lab is already in use');
  await join();await join();assert.deepEqual(clients.map(c=>c.slot),[0,1]);await delay(150);
  pumping=true;
  let next=performance.now();
  function pump(){if(!pumping)return;for(const c of clients){if(c.ws.readyState!==WebSocket.OPEN)continue;const ts=performance.now(),q=c.q++;c.pending.set(q,ts);c.send({t:'i',q,ts,...c.command,fire:0,mine:0,weapon:0})}next+=1000/30;if(performance.now()-next>100)next=performance.now()+1000/30;timer=setTimeout(pump,Math.max(0,next-performance.now()))}pump();
  for(const profile of catalog.feelProfiles){clients[0].send({t:'feel',id:profile.id});await waitFor(s=>s.feel.id===profile.id,profile.id);result.profiles.push(profile.id)}
  clients[0].send({t:'feel',id:'Balanced'});await waitFor(s=>s.feel.id==='Balanced','Balanced');
  const holds={Needle:.5,Line:.6,Bastion:.8,Comet:.7,Trail:.6,Flint:.5,Quill:.4,Vandal:.6,Kestrel:.6,Bulwark:.7};
  for(let pair=0;pair<catalog.cars.length;pair+=2){
    clients[0].send({t:'lobby'});await waitFor(s=>s.phase==='lobby','lobby');
    clients[0].send({t:'track',id:'foundry'});
    for(let i=0;i<2;i++)clients[i].send({t:'car',id:catalog.cars[pair+i].id});
    const lobby=await waitFor(s=>s.sceneryReady && s.track.id==='foundry' && clients.every((c,i)=>s.slots[i].car.id===catalog.cars[pair+i].id),'class selection');
    const pilot=new Pilot(routes,true),round={classes:clients.map((c,i)=>lobby.slots[i].car.id),windows:[],pulses:[0,0]};result.rounds.push(round);
    for(const c of clients){c.holdUntil=0;c.catchUntil=0;c.nextPulse=0;c.command={s:0,a:1,b:0,h:0}}
    clients[0].send({t:'start'});await waitFor(s=>s.phase==='race','race');
    const started=performance.now();let lastWindow=-1;
    while(performance.now()-started<seconds*1000){
      const s=await get('/stats'),now=performance.now(),second=(now-started)/1000;
      if(Math.floor(second)>lastWindow){lastWindow=Math.floor(second);round.windows.push({second,stats:s})}
      for(const c of clients){
        const car=s.slots[c.slot],normal=pilot.command(s,c.slot),alive=s.phase==='race'&&!car.combat.wrecked;
        if(alive && now>=c.nextPulse && now>=c.catchUntil && car.speedMps>12 && Math.abs(normal.s)>.25){
          c.holdUntil=now+holds[car.car.id]*1000;c.catchUntil=c.holdUntil+1300;c.nextPulse=now+6000;c.direction=Math.sign(normal.s);c.pulses++;round.pulses[c.slot]++;
        }
        c.command=normal;
        if(alive && now<c.holdUntil)c.command={s:c.direction*.8,a:.6,b:0,h:1};
        else if(alive && now<c.catchUntil)c.command={s:Math.max(-1,Math.min(1,-car.slipRadians*1.4+car.yaw*.18)),a:.25,b:0,h:0};
      }
      if(s.phase==='results'){round.endedEarly=true;break}
      await delay(180);
    }
    round.final=await get('/stats');
    for(const c of clients)c.command={s:0,a:0,b:0,h:0};
  }
  result.clients=clients.map(({slot,q,accepted,rejected,rtt,hudSamples,driftHudSamples,spinHudSamples,peakQuality,peakSlip,pulses})=>({slot,sent:q,accepted,rejected,rttMs:quantiles(rtt),hudSamples,driftHudSamples,spinHudSamples,peakQuality,peakSlip,pulses}));
  assert.ok(result.rounds.some(r=>r.final.art.driftSmokeEmitted>0),'No rendered drift smoke observed');
  assert.ok(result.rounds.some(r=>r.final.art.driftSkidsEmitted>0),'No rendered drift skid marks observed');
  assert.ok(result.clients.every(c=>c.driftHudSamples>0 && c.peakQuality>0),'Both inputs must produce real drift feedback');
  result.passed=true;
} catch(error){result.error=error.stack;process.exitCode=1}
finally {
  pumping=false;clearTimeout(timer);
  for(const c of clients){if(c.ws.readyState===WebSocket.OPEN)c.send({t:'i',q:c.q++,ts:performance.now(),s:0,a:0,b:0,h:0});c.ws.close()}
  result.finished=new Date().toISOString();await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,error:result.error,rounds:result.rounds.map(r=>({classes:r.classes,pulses:r.pulses,smoke:r.final?.art.driftSmokeEmitted,skids:r.final?.art.driftSkidsEmitted})),clients:result.clients},null,2));
}
