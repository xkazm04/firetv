import WebSocket from 'ws';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.argv[2]||'http://127.0.0.1:8765';
const pin=process.argv[3];
const duration=Number(process.argv[4]||60);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>{const r=await fetch(base+'/stats');assert.equal(r.status,200);return r.json()};
function summary(a){const v=[...a].sort((a,b)=>a-b);return {n:v.length,p50:v[Math.ceil(v.length*.5)-1]||0,p95:v[Math.ceil(v.length*.95)-1]||0,max:v.at(-1)||0}}
async function join(token='') {
 const c={ws:new WebSocket(base.replace('http','ws')+'/ws'),slot:-1,token,q:0,offset:0,rtt:[],pending:new Map(),accepted:0,rejected:0,pongs:0};
 c.send=m=>c.ws.send(JSON.stringify(m));
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('welcome timeout')),5000);c.ws.on('error',reject);c.ws.on('open',()=>c.send({t:'hello',pin,token,name:'Probe'}));c.ws.on('message',data=>{const m=JSON.parse(data);const now=performance.now();if(m.t==='welcome'){c.slot=m.slot;c.token=m.token;c.offset=m.tvNow-now;clearTimeout(timeout);resolve()}if(m.t==='error')reject(Error(m.message));if(m.t==='pong'){const rtt=now-m.ts;c.offset=m.tvNow-(m.ts+now)/2;c.send({t:'sync',offset:c.offset,rtt});c.pongs++}if(m.t==='ack'){const sent=c.pending.get(m.q);if(sent!==undefined){c.rtt.push(now-sent);c.pending.delete(m.q)}m.accepted?c.accepted++:c.rejected++}})});
 c.input=(steer=.2,throttle=.8,options={})=>{const q=options.q??c.q++;const ts=performance.now();c.pending.set(q,ts);c.send({t:'i',q,ts:ts+(options.age??0),s:steer,a:throttle,b:0,f:options.flash??0})};
 c.send({t:'ping',ts:performance.now()});await delay(100);return c;
}
const a=await join(),b=await join();assert.notEqual(a.slot,b.slot);assert.equal(a.slot,0);assert.equal(b.slot,1);
assert.match(await (await fetch(base+'/')).text(),/pointerdown/);assert.equal((await stats()).slots.filter(s=>s.connected).length,2);
// Isolated ack baseline (one frame each 200 ms), before sustained steering load.
for(let i=0;i<25;i++){a.input(0,0);await delay(200)}const idle=summary(a.rtt);a.rtt=[];a.send({t:'start'});await delay(3300);
const initial=await stats();const start=performance.now();let timer,active=true,next=start,loadSent=0;function pump(){if(!active)return;const now=performance.now();if(now>=next){const t=(now-start)/1000;a.input(Math.sin(t)*.65,.7);b.input(Math.cos(t*.7)*.65,.65);loadSent++;next+=1000/30;if(now-next>100)next=now+1000/30}timer=setTimeout(pump,Math.max(0,next-performance.now()))}pump();
const windows=[];for(let i=0;i<Math.ceil(duration/10);i++){await delay(Math.min(10000,duration*1000-i*10000));windows.push({second:Math.round((performance.now()-start)/1000),rtt:summary(a.rtt.slice(-300)),stats:await stats()})}active=false;clearTimeout(timer);const actualHz=loadSent/((performance.now()-start)/1000);
const loadA=summary(a.rtt),loadB=summary(b.rtt);
// Silence, stale transport backlog, ordering, and exactly one displayed flash.
a.input(.63,1);await delay(360);let st=await stats();assert.equal(st.slots[0].effectiveThrottle,0);assert.equal(st.slots[0].effectiveSteer,.63);assert.ok(st.slots[0].stale.sinceStart>0);
const oldDrop=st.slots[0].dropped.sinceStart,oldOrder=st.slots[0].outOfOrder.sinceStart;
a.input(-.8,1,{age:-1000});a.input(-1,1,{q:0});await delay(100);st=await stats();assert.ok(st.slots[0].dropped.sinceStart>oldDrop);assert.ok(st.slots[0].outOfOrder.sinceStart>oldOrder);assert.equal(st.slots[0].effectiveThrottle,0);assert.equal(st.slots[0].effectiveSteer,.63);
const flashes=st.flashFrames;a.input(0,0,{flash:1});await delay(100);assert.equal((await stats()).flashFrames,flashes+1);
assert.ok(st.slots[0].inputAgeMs.sinceStart.count>0);assert.ok(st.frameTimeMs.sinceStart.count>0);assert.ok(st.simStepMs.sinceStart.count>0);assert.ok(st.slots.every(s=>s.clockSynced));
const token=a.token;a.ws.close();await delay(100);const returned=await join(token);assert.equal(returned.slot,0);returned.input(-.2,.4);await delay(100);st=await stats();assert.equal(st.slots[0].effectiveThrottle,.4);assert.equal(st.slots[0].effectiveSteer,-.2);
const result={device:'Windows desktop, loopback; NOT Fire TV or Wi-Fi',durationSeconds:duration,actualHz,loadSent,idleRttMs:idle,loadRttMsSlot0:loadA,loadRttMsSlot1:loadB,checks:'two slots; HTTP assets; corrected clock; silence hold/drop; stale rejection; order rejection; one flash; reconnect identity and control',pendingAtEnd:[a.pending.size,b.pending.size],intentionalRejected:a.rejected,initial,windows,final:st};
await writeFile('../evidence/probe.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,initial:undefined,windows:windows.map(w=>({second:w.second,rtt:w.rtt})),final:undefined},null,2));returned.ws.close();b.ws.close();
