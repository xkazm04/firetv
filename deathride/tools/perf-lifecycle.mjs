// Separate device behavior/art check; never part of timing qualification.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot} from './pilot.mjs';
const [output,apk]=process.argv.slice(2),device='10.0.0.139:5555',pkg='dev.deathride.perf';
const activity=pkg+'/dev.deathride.tv.MainActivity',base='http://10.0.0.139:8772';
const adb=(args,encoding='utf8')=>execFileSync('adb',['-P','5041','-s',device,...args],{encoding,windowsHide:true,timeout:30000,maxBuffer:16e6});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats',{signal:AbortSignal.timeout(5000)})).json();
const result={utc:new Date().toISOString(),package:pkg,apkSha256:createHash('sha256').update(await readFile(apk)).digest('hex'),checks:[],captures:[],errors:[],limits:'Headless browser controllers, real device screenshots and lifecycle. Not optical latency, listening or human feel. Separate from the clean soak.'};
await mkdir(output,{recursive:true});
assert.equal(adb(['shell','sha256sum',adb(['shell','pm','path',pkg]).trim().replace('package:','')]).split(/\s/)[0],result.apkSha256);
async function until(fn,label){for(let i=0;i<160;i++){try{const s=await stats();if(fn(s))return s}catch{}await pause(100)}throw Error(label)}
async function capture(name){const before=await stats();await writeFile(output+'/'+name+'.png',adb(['exec-out','screencap','-p'],'buffer'));result.captures.push({name,before,after:await stats()})}
adb(['shell','input','keyevent','KEYCODE_WAKEUP']);adb(['shell','am','force-stop',pkg]);adb(['shell','am','start','-n',activity]);
await until(s=>s.sceneryReady,'ready');
const pid=adb(['shell','pidof',pkg]).trim();
const pin=[...adb(['logcat','-d','--pid='+pid,'-s','DeathRide:I']).matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];assert.ok(pin);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const contexts=[],pages=[];
 for(let i=0;i<2;i++){
  const c=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true}),p=await c.newPage();contexts.push(c);pages.push(p);
  p.on('pageerror',e=>result.errors.push(e.message));await installPilot(p);await p.goto(base+'/?pin='+pin);
  await p.waitForFunction(n=>document.getElementById('player').textContent==='PLAYER '+n,i+1);
  await p.locator('#carButton').tap();await p.locator('#carChoice').selectOption(i?'Bastion':'Quill');await p.locator('#closeCar').tap();
 }
 await until(s=>s.slots[0].car.id==='Quill'&&s.slots[1].car.id==='Bastion'&&s.sceneryReady,'selections');
 await pages[0].locator('#race').tap();await until(s=>s.phase==='race','race');
 const pilot=new Pilot(await(await fetch(base+'/routes')).json(),true);
 for(let i=0;i<45;i++){
  const s=await stats();for(let seat=0;seat<2;seat++)await pages[seat].evaluate(c=>window.__pilot=c,{...pilot.command(s,seat),fire:1,mine:1,ability:1});await pause(150);
 }
 const live=await stats();assert.equal(live.raceEntrants,6);assert.equal(live.art.failures,0);assert.equal(live.art.regions,168);assert.ok(live.audio.played>0);assert.ok(live.art.draws>0);
 await capture('active');await pages[0].screenshot({path:output+'/controller-active.png'});
 result.checks.push('Two actual browser controllers, six entrants, merged art/HUD/abilities/audio counters active');
 await pages[0].evaluate(()=>window.__pilot=null);await contexts[0].setOffline(true);
 result.quiet=await until(s=>s.slots[0].stale.last10s>0&&s.slots[0].effectiveThrottle===0&&s.slots[0].effectiveFire===0&&s.slots[0].effectiveAbility===0,'quiet neutral controls');
 await contexts[0].setOffline(false);await pages[0].waitForFunction(()=>document.body.classList.contains('online')&&!document.body.classList.contains('lost'));
 await until(s=>s.slots.every(x=>x.connected&&x.clockSynced),'reconnected and calibrated');
 result.checks.push('Network interruption neutralizes throttle/fire/ability; browser reconnects and recalibrates');
 for(const p of pages)await p.evaluate(()=>window.__pilot=null);
 const audioTracks=text=>text.split('\n').map(x=>x.trim().split(/\s+/)).filter(x=>['yes','no'].includes(x[2])&&x[3]===pid).map(x=>({id:x[1],active:x[2]==='yes',session:x[4]}));
 const beforeAudio=adb(['shell','dumpsys','media.audio_flinger']);await writeFile(output+'/audio-before-home.txt',beforeAudio);result.audioBeforeHome=audioTracks(beforeAudio);
 adb(['shell','input','keyevent','KEYCODE_HOME']);await pause(1200);
 const homeAudio=adb(['shell','dumpsys','media.audio_flinger']);await writeFile(output+'/audio-home.txt',homeAudio);result.audioHome=audioTracks(homeAudio);assert.ok(result.audioHome.every(x=>!x.active),'No active native app audio while Home');
 adb(['shell','am','start','-n',activity]);const resumed=await until(s=>s.sceneryReady&&!s.paused&&s.slots.every(x=>x.connected&&x.clockSynced),'Home/resume ready and reconnected');
 await until(s=>s.frameNumber>resumed.frameNumber+20,'rendering after resume');await capture('home-resume');
 const afterAudio=adb(['shell','dumpsys','media.audio_flinger']);await writeFile(output+'/audio-resumed.txt',afterAudio);result.audioResumed=audioTracks(afterAudio);
 result.resumed=resumed;assert.equal(resumed.art.failures,0);result.checks.push('Home stops native app audio; resume rebuilds scenery, restarts rendering/listener and reconnects both browsers');
 assert.deepEqual(result.errors,[]);result.pass=true;
}catch(e){result.error=e.stack;process.exitCode=1}
finally{await browser.close();await writeFile(output+'/logcat.txt',adb(['logcat','-d','--pid='+pid,'-v','threadtime']));await writeFile(output+'/result.json',JSON.stringify(result,null,2));console.log(JSON.stringify({pass:result.pass,error:result.error,checks:result.checks}))}
