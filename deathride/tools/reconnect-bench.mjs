// Phone reconnect behaviour with the host gone: node tools/reconnect-bench.mjs <base> <pin> <hostPid> [seconds]
// Pairs a page, kills the host process, counts WebSocket construction attempts and 30 Hz timer work for <seconds> (default 40).
import {chromium} from 'playwright';
const base=process.argv[2],pin=process.argv[3],pid=Number(process.argv[4]),seconds=Number(process.argv[5]||40);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const ctx=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});
const p=await ctx.newPage();
await p.addInitScript(()=>{window.__ws=[];const W=window.WebSocket;window.WebSocket=function(u,pr){window.__ws.push(performance.now());return new W(u,pr)};window.WebSocket.prototype=W.prototype;for(const k of ['CONNECTING','OPEN','CLOSING','CLOSED'])window.WebSocket[k]=W[k]});
await p.goto(base+'/?pin='+pin);await p.waitForFunction(()=>document.getElementById('player').textContent.startsWith('PLAYER'));
const before=await p.evaluate(()=>window.__ws.length);
process.kill(pid);const t0=Date.now();
await p.waitForTimeout(seconds*1000);
const times=await p.evaluate(()=>window.__ws.map(t=>Math.round(t)));
const attempts=times.length-before;
console.log(JSON.stringify({seconds,attemptsWhileHostDown:attempts,perMinute:Math.round(attempts*60/seconds),gapsMs:times.slice(before).map((t,i,a)=>i?t-a[i-1]:null).filter(Boolean).slice(0,12)}));
await browser.close();
