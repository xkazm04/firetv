// Fresh campaign entry, ordinary browser controller inputs and observed host telemetry.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot,tuning} from './pilot.mjs';
const [base,tag='campaign-opening']=process.argv.slice(2);
assert.equal(new URL(base).port,'8772');assert.match(tag,/^[a-z0-9-]+$/);
const pkg='dev.deathride.ai',device=new URL(base).hostname+':5555',out='evidence/ai/z4/stick/'+tag;
let exists=false;for(const suffix of ['result.json','result.json.gz'])try{await access(out+'/'+suffix);exists=true}catch{}
assert.ok(!exists,'Use a fresh run tag; do not overwrite previous evidence');
await mkdir(out,{recursive:true});
const installed=JSON.parse(await readFile('evidence/ai/z4/stick/installation.json','utf8'));
assert.equal(installed.applicationId,pkg);assert.equal(installed.device,device);
const adb=(args,encoding='utf8')=>execFileSync('adb',['-P','5043','-s',device,...args],{encoding,windowsHide:true,timeout:30000,maxBuffer:12e6});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
for(let attempt=0;attempt<=6;attempt++){
 const foreground=adb(['shell','dumpsys','activity','activities']).split('\n').find(line=>line.includes('mResumedActivity'))||'';
 if(!foreground.includes('dev.deathride.')||foreground.includes(pkg+'/'))break;
 if(attempt===6){await writeFile(out+'/pending.json',JSON.stringify({status:'pending',reason:'Another Death Ride app is foreground',foreground},null,2));throw Error('Stick busy; check pending')}
 await pause(10000);
}
const stats=async()=>await(await fetch(base+'/stats',{signal:AbortSignal.timeout(5000)})).json();
async function until(fn,label,seconds=40){for(let n=0;n<seconds*5;n++){const s=await stats();if(fn(s))return s;await pause(200)}throw Error(label)}
const result={pkg,device,tag,apkSha256:installed.apkSha256,startedUtc:new Date().toISOString(),pilotTuning:tuning,
 scope:'Fresh named profile; ordinary paired controller input from a telemetry pilot. No supplied funds or save fixture. Not human driving.',windows:[],captures:[],errors:[]};
const persist=()=>writeFile(out+'/result.json',JSON.stringify(result,null,2));
async function capture(name){const before=await stats();await writeFile(out+'/'+name+'.png',adb(['exec-out','screencap','-p'],'buffer'));result.captures.push({name,before,after:await stats()});await persist()}
let pin=process.env.AI_VISIBLE_PIN;
if(pin){assert.match(pin,/^\d{4}$/);result.pairingSource='PIN read from captured TV lobby; existing isolated AI process';}
else {
 adb(['shell','input','keyevent','KEYCODE_WAKEUP']);adb(['shell','am','force-stop',pkg]);adb(['shell','am','start','-n',pkg+'/dev.deathride.tv.MainActivity']);
 for(let n=0;n<100;n++){await pause(500);const pid=adb(['shell','pidof',pkg]).trim();if(!pid)continue;pin=[...adb(['logcat','-d','--pid='+pid,'-s','DeathRide:I']).matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(pin)try{if((await stats()).sceneryReady)break}catch{}}
}
assert.ok(pin,'Pairing log');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const ctx=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});
 await ctx.addInitScript(profile=>localStorage.setItem('profile',profile),'ai-z4-'+tag);
 const page=await ctx.newPage();page.on('pageerror',e=>result.errors.push(e.message));await installPilot(page);
 await page.goto(base+'/?pin='+pin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await page.locator('#careerButton').tap();result.menu=await until(s=>s.phase==='career','career');
 assert.equal(result.menu.slots[0].career.round,1,'Fresh first event');
 await page.locator('#careerDifficulty').selectOption('Pro');
 result.menu=await until(s=>s.slots[0].career.difficulty.id==='Pro','Pro difficulty');
 await capture('career-menu');await page.screenshot({path:out+'/phone-menu.png'});
 await page.locator('#careerStart').tap();await until(s=>s.phase==='race','race');
 const pilot=new Pilot(await(await fetch(base+'/routes')).json(),true);const start=performance.now();let next=0,captured=false,current;
 result.start=await stats();
 while((performance.now()-start)<480000){
  current=await stats();const wallSeconds=(performance.now()-start)/1000;
  await page.evaluate(c=>{window.__pilot=c},{...pilot.command(current,0),ability:1});
  if(wallSeconds>=next){
   result.windows.push({wallSeconds,...current,slots:current.slots.map(({garage,career,...s})=>s)});next=wallSeconds+1;
   if(result.windows.length%30===0){await persist();console.log(JSON.stringify({wallSeconds,raceSeconds:current.raceSeconds,phase:current.phase,lap:current.slots[0].lap}))}
  }
  if(!captured&&current.traffic.some(c=>c.ai.hunting&&c.ai.target>=0)){await capture('hunt-observed');await page.screenshot({path:out+'/phone-race.png'});captured=true}
  if(current.phase==='results')break;
  await pause(100);
 }
 await page.evaluate(()=>{window.__pilot=null});result.wallSeconds=(performance.now()-start)/1000;result.final=current;
 await capture('result');result.memory=adb(['shell','dumpsys','meminfo','--local',pkg]);
 assert.equal(current.phase,'results');assert.ok(captured,'Observed a visible-target hunt');
 assert.ok(result.windows.every(s=>s.traffic.every(c=>c.ai.maxAttackers<=2)),'Attack cap');assert.deepEqual(result.errors,[]);
 result.functionalPass=true;await page.locator('#leave').tap();await until(s=>s.phase==='lobby','cleanup');result.cleanupPass=true;
}catch(e){result.error=e.stack;process.exitCode=1}finally{await browser.close();result.finishedUtc=new Date().toISOString();await persist();console.log(JSON.stringify({functionalPass:result.functionalPass,wallSeconds:result.wallSeconds,error:result.error}))}
