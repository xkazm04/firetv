// Phone page cost under a live host: node tools/controller-bench.mjs <base> <pin> [label]
// Chrome (CHROME_EXECUTABLE), 896x414 touch, CPU throttled 4x (a mid phone). Reports per phase: main-thread script / layout / style time,
// layout + style recalc counts, DOM mutation records, WebSocket frames and bytes both ways. Not a physical phone.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const base=process.argv[2]||'http://127.0.0.1:8765',pin=process.argv[3],label=process.argv[4]||'run';
const throttle=Number(process.env.CPU_THROTTLE||4);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const ctx=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const p=await ctx.newPage(),cdp=await ctx.newCDPSession(p);
await p.addInitScript(()=>{
  window.__net={sent:0,sentBytes:0,recv:0,recvBytes:0,hud:0,hudBytes:0,muts:0};
  const send=WebSocket.prototype.send;WebSocket.prototype.send=function(d){window.__net.sent++;window.__net.sentBytes+=d.length;return send.call(this,d)};
  const add=WebSocket.prototype.addEventListener;
  const desc=Object.getOwnPropertyDescriptor(WebSocket.prototype,'onmessage');
  Object.defineProperty(WebSocket.prototype,'onmessage',{set(fn){desc.set.call(this,e=>{const n=window.__net;n.recv++;n.recvBytes+=e.data.length;if(e.data.startsWith('{"t":"hud"')){n.hud++;n.hudBytes+=e.data.length}return fn(e)})},get:desc.get,configurable:true});
  addEventListener('DOMContentLoaded',()=>{new MutationObserver(r=>{window.__net.muts+=r.length}).observe(document,{subtree:true,childList:true,attributes:true,characterData:true})});
});
await cdp.send('Performance.enable');
await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
if(process.env.NET_MBPS){await cdp.send('Network.enable');const bps=Number(process.env.NET_MBPS)*125000;await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:Number(process.env.NET_LATENCY_MS||20),downloadThroughput:bps,uploadThroughput:bps})}
const t0=Date.now();
await p.goto(base+'/?pin='+pin,{waitUntil:'load'});
const load=await p.evaluate(()=>({transferBytes:performance.getEntriesByType('navigation').concat(performance.getEntriesByType('resource')).filter(e=>!e.name.startsWith('ws')).reduce((a,e)=>a+e.transferSize,0),fcp:performance.getEntriesByType('paint').find(e=>e.name==='first-contentful-paint')?.startTime,dcl:performance.timing.domContentLoadedEventEnd-performance.timing.navigationStart,htmlBytes:document.documentElement.outerHTML.length}));
await p.waitForFunction(()=>document.getElementById('player').textContent.startsWith('PLAYER'),null,{timeout:15000});
const linked=Date.now()-t0;
const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
const net=()=>p.evaluate(()=>({...window.__net}));
const result={label,throttle,load:{...load,linkedMs:linked},phases:{}};
const wait=ms=>p.waitForTimeout(ms);const idle=s=>wait(s*1000);
await wait(1500);
async function runPhase(name,seconds,action){
  const m0=await metrics(),n0=await net();const t=Date.now();await action(seconds);const m1=await metrics(),n1=await net(),s=(Date.now()-t)/1000;
  const dm=k=>+(((m1[k]||0)-(m0[k]||0))*1000/s).toFixed(1),dc=k=>+(((m1[k]||0)-(m0[k]||0))/s).toFixed(1),dn=k=>+(((n1[k]||0)-(n0[k]||0))/s).toFixed(1);
  result.phases[name]={seconds:+s.toFixed(1),scriptMsPerS:dm('ScriptDuration'),layoutMsPerS:dm('LayoutDuration'),styleMsPerS:dm('RecalcStyleDuration'),taskMsPerS:dm('TaskDuration'),
    layoutsPerS:dc('LayoutCount'),styleRecalcsPerS:dc('RecalcStyleCount'),domMutationsPerS:dn('muts'),sentPerS:dn('sent'),sentBytesPerS:dn('sentBytes'),recvPerS:dn('recv'),recvBytesPerS:dn('recvBytes'),hudPerS:dn('hud'),hudBytesPerS:dn('hudBytes'),heapKB:Math.round(m1.JSHeapUsedSize/1024)};
}
await runPhase('lobbyIdle',10,idle);
await p.locator('#garageButton').tap();await wait(800);
await runPhase('garageOpenIdle',8,idle);
await p.locator('#closeGarage').tap();await wait(500);
await p.locator('#race').tap();await wait(3600);
const stamp=async id=>{const b=await p.locator('#'+id).boundingBox();return b};
const pad=await stamp('steer');const ax=pad.x+pad.width/2,ay=pad.y+pad.height/2;
const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
const tp=(x,y,id)=>({x:Math.round(x),y:Math.round(y),id,radiusX:8,radiusY:8});
await touch('touchStart',[tp(ax,ay,1)]);
await runPhase('raceDriving',10,async seconds=>{const end=Date.now()+seconds*1000;let i=0;while(Date.now()<end){i++;await touch('touchMove',[tp(ax+Math.sin(i/20)*40,ay-30-Math.abs(Math.cos(i/30))*40,1)]);await wait(8)}});
await touch('touchEnd',[]);
await touch('touchStart',[tp(ax,ay,1)]);await touch('touchMove',[tp(ax+20,ay-60,1)]);
await runPhase('raceHeldSteady',8,idle);
await touch('touchEnd',[]);
await runPhase('raceNoTouch',6,idle);
const out=process.env.BENCH_OUTPUT;if(out)await writeFile(out,JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,1));
await browser.close();
