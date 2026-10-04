// Ordinary paired browser input on the campaign package; fixtures are named and disclosed.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot,tuning} from './pilot.mjs';
const [base,mode='boss',runTag=mode]=process.argv.slice(2);assert.equal(new URL(base).port,'8770');assert.ok(['boss','finale'].includes(mode));assert.match(runTag,/^[a-z0-9-]+$/);
if(process.env.CAMPAIGN_PILOT_FAST==='1'){tuning.cruiseFraction=.97;tuning.cornerGripFraction=.68;tuning.lookAheadSeconds=.60}
const pkg='dev.deathride.campaign',device=new URL(base).hostname+':5555',out='evidence/campaign/q4/'+runTag;
await mkdir(out,{recursive:true});
const adb=(args,encoding='utf8')=>execFileSync('adb',['-P','5041','-s',device,...args],{encoding,windowsHide:true,timeout:30000,maxBuffer:12e6});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats',{signal:AbortSignal.timeout(5000)})).json();
async function until(fn,label,seconds=30){for(let n=0;n<seconds*10;n++){const s=await stats();if(fn(s))return s;await pause(100)}throw Error(label)}
const result={mode,device,pkg,pilotTuning:{...tuning},startedUtc:new Date().toISOString(),fixture:'campaign-stick-'+mode,scope:'Funded legal entry fixture; ordinary controller inputs; no full earned campaign or human feel claim',captures:[],windows:[],memory:[],errors:[],checks:[]};
const apkPath=adb(['shell','pm','path',pkg]).trim().split('\n')[0].replace('package:','');result.apkSha256=adb(['shell','sha256sum',apkPath]).trim().split(/\s+/)[0];
async function persist(){await writeFile(out+'/result.json',JSON.stringify(result,null,2))}
async function capture(name){const before=await stats();await writeFile(out+'/'+name+'.png',adb(['exec-out','screencap','-p'],'buffer'));result.captures.push({name,before,after:await stats()});console.log('Captured '+name);await persist()}
function memory(second){const text=adb(['shell','dumpsys','meminfo','--local',pkg]);result.memory.push({second,pssKb:Number(text.match(/TOTAL PSS:\s+(\d+)/)?.[1]??text.match(/TOTAL\s+(\d+)/)?.[1]??-1),text})}
adb(['shell','input','keyevent','KEYCODE_WAKEUP']);adb(['shell','am','force-stop',pkg]);adb(['shell','am','start','-n',pkg+'/dev.deathride.tv.MainActivity']);
let pin;
for(let n=0;n<90;n++){await pause(500);const pid=adb(['shell','pidof',pkg]).trim();if(!pid)continue;pin=[...adb(['logcat','-d','--pid='+pid,'-s','DeathRide:I']).matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(pin)try{if((await stats()).sceneryReady)break}catch{}}
assert.ok(pin);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const contexts=[];
async function join(profile,seat){const ctx=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});contexts.push(ctx);const page=await ctx.newPage();page.on('pageerror',e=>result.errors.push(e.message));await installPilot(page);await ctx.addInitScript(p=>localStorage.setItem('profile',p),profile);await page.goto(base+'/?pin='+pin);await page.waitForFunction(s=>document.getElementById('player').textContent===s,'PLAYER '+seat);return page}
try{
 const p=await join(result.fixture,1);let guest,guestBefore;
 if(mode==='finale'){guestBefore=adb(['exec-out','run-as',pkg,'cat','files/profiles/campaign-stick-guest.sav']);guest=await join('campaign-stick-guest',2)}
 await p.locator('#garageButton').tap();await until(s=>s.phase==='garage','garage');await capture('mechanic-shop');await p.locator('#mechanicPanel').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/phone-mechanic.png'});await p.locator('#closeGarage').tap();
 await p.locator('#careerButton').tap();const menu=await until(s=>s.phase==='career','career');result.menu=menu;
 if(mode==='boss')assert.equal(menu.slots[0].career.round,7,'This fixture must still be at the first boss');
 await capture(mode==='boss'?'boss-card':'seized-car-card');await p.locator('#storyCard').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/phone-story.png'});
 if(mode==='finale'){assert.equal(menu.slots[0].career.eventType,'ELIMINATION');assert.equal(menu.slots[0].career.campaign.seizedCar,'Kestrel');assert.equal(menu.slots[0].career.campaign.finale,1)}
 await p.locator('#careerStart').tap();await until(s=>s.phase==='race','race');
 const pilot=new Pilot(await(await fetch(base+'/routes')).json(),true);const began=performance.now();let current,nextWindow=0,nextMemory=30,captured=false;
 const limit=mode==='boss'?1500:660;
 memory(0);
 while((performance.now()-began)/1000<limit){
  current=await stats();const second=(performance.now()-began)/1000;
  await p.evaluate(c=>{window.__pilot=c},{...pilot.command(current,0),ability:mode==='boss'?1:0});
  if(second>=nextWindow){result.windows.push({second,phase:current.phase,raceSeconds:current.raceSeconds,frameTimeMs:current.frameTimeMs,simStepMs:current.simStepMs,discardedSimulationMs:current.discardedSimulationMs,art:current.art,combatSummary:current.combatSummary,slots:current.slots.map(({garage,career,...s})=>s)});nextWindow=second+1}
  if(second>=nextMemory){memory(second);nextMemory=second+60;console.log(JSON.stringify({second:Math.round(second),lap:current.slots[0].lap,pos:current.slots[0].position,hp:current.slots[0].combat.hp,phase:current.phase}));await persist()}
  if(!captured&&current.raceSeconds>6){await capture(mode==='boss'?'boss-race':'duel-rig');await p.screenshot({path:out+'/phone-race.png'});if(guest)await guest.screenshot({path:out+'/phone-spectator.png'});captured=true;result.timingCleanAfterSecond=second+30}
  if(current.phase==='results')break;
  await pause(100);
 }
 await p.evaluate(()=>{window.__pilot=null});result.final=current;memory((performance.now()-began)/1000);await capture('result');
 assert.equal(current.phase,'results','Actual race must resolve or hit its declared watchdog');
 if(mode==='boss'){
  result.bossWon=current.slots[0].career.round===8;result.checks.push('Actual funded boss race reached results through normal input');
  if(result.bossWon){await p.locator('#careerButton').tap();await until(s=>s.phase==='career','promotion menu');await capture('ally-choice');await p.locator('[data-ally="rook:money"]').tap();const claimed=await until(s=>s.slots[0].career.campaign.allies[0].state===2,'cash promotion');result.claimed=claimed;await capture('ally-claimed');await p.locator('#campaignLedger').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/phone-ally.png'});result.checks.push('Rook joined from the observed win; cash choice committed')}
 }else{
  assert.equal(current.slots[1].combat.spectating,true);assert.equal(adb(['exec-out','run-as',pkg,'cat','files/profiles/campaign-stick-guest.sav']),guestBefore);
  result.checks.push('Actual Kestrel seizure and supplied dispatcher rig','P2 spectator save unchanged','Actual duel result retained');
  if(current.slots[0].career.campaign.finale!==2){await p.locator('#careerButton').tap();const retry=await until(s=>s.phase==='career','supplied retry');assert.equal(retry.slots[0].career.round,35);assert.equal(retry.slots[0].career.campaign.finale,1);result.retry=retry;await capture('free-rig-retry')}
  else result.checks.push('Observed survivor victory restored the seized car and voided the claim');
 }
 assert.deepEqual(result.errors,[]);result.functionalPass=true;
 await p.locator((await stats()).phase==='career'?'#closeCareer':'#leave').tap();await until(s=>s.phase==='lobby','cleanup');result.cleanupPass=true;
}catch(e){result.error=e.stack;process.exitCode=1}finally{await browser.close();result.finishedUtc=new Date().toISOString();await persist();console.log(JSON.stringify({functionalPass:result.functionalPass,bossWon:result.bossWon,error:result.error,checks:result.checks}))}
