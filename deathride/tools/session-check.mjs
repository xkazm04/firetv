import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot} from './pilot.mjs';
const [base,pin]=process.argv.slice(2),device=process.env.PROBE_DEVICE||'10.0.0.139:5555';
const adb=(...args)=>execFileSync('adb',['-s',device,...args],{encoding:'utf8'});
const pause=ms=>new Promise(r=>setTimeout(r,ms)),stats=async()=>await(await fetch(base+'/stats')).json();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const apkSha256=createHash('sha256').update(await readFile('app/build/outputs/apk/debug/app-debug.apk')).digest('hex');
const pages=[],errors=[],checks=[],windows=[],races=[];let restored,lifecycle,failure;
async function capture(name){adb('shell','screencap','-p','/sdcard/w8-session.png');adb('pull','/sdcard/w8-session.png','evidence/phase1/'+name+'.png')}
async function waitStats(test,seconds=15){for(let n=0;n<seconds*10;n++){try{const s=await stats();if(test(s))return s}catch{}await pause(100)}throw Error('State timeout: '+test)}
try {
 for(let i=0;i<2;i++){const context=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});const page=await context.newPage();pages.push(page);page.on('pageerror',e=>errors.push(e.message));await installPilot(page);await page.goto(base+'/?pin='+pin);await page.waitForFunction(n=>document.getElementById('player').textContent==='PLAYER '+n,i+1)}
 const [page,guest]=pages;await page.locator('#careerButton').tap();await page.locator('#careerSheet').waitFor({state:'visible'});
 await page.locator('#careerCar').selectOption('Line');await page.locator('#careerDifficulty').selectOption('Rookie');await pause(250);
 await page.locator('#careerGarage').tap();await page.locator('[data-part=brakes]').tap();await waitStats(s=>s.slots[0].garage.credits===40);
 await page.locator('#closeGarage').tap();await page.locator('#careerButton').tap();
 checks.push('Two independent touch browser profiles; choose Line/Rookie and buy first brake tier from starter 160 CR');
 const routes=await(await fetch(base+'/routes')).json();
 for(let race=0;race<3;race++){
  await page.locator('#careerStart').tap();const pilot=new Pilot(routes,true);let result,lastWindow=0,captured=false,capturedSurvivor=false;const began=performance.now();
  while(performance.now()-began<195000){
   result=await stats();await Promise.all(pages.map((p,i)=>p.evaluate(command=>{window.__pilot=command},pilot.command(result,i))));
   if(result.phase==='results')break;
   if(result.phase==='race'&&result.raceSeconds-lastWindow>=10){lastWindow=result.raceSeconds;windows.push({race:race+1,stats:result});console.log('race '+(race+1)+' / '+result.raceSeconds.toFixed(1)+' s / '+result.slots.map(s=>'lap '+s.lap+' HP '+Math.round(s.combat.hp)).join(' / '))}
   if(!capturedSurvivor&&result.phase==='race'&&result.slots.filter(s=>s.combat.wrecked).length===1){capturedSurvivor=true;await capture('w8-survivor-'+(race+1))}
   if(!captured&&result.phase==='race'&&result.raceSeconds>12){captured=true;await capture('w8-race-'+(race+1))}
   await pause(100);
  }
  assert.equal(result.phase,'results');assert.equal(result.raceMode,'career');assert.equal(result.slots[0].garage.races,race+1);
  assert.equal(result.slots[0].career.cleared,race+1);assert.equal(result.slots[1].career.cleared,0);assert.ok(result.combatSummary.shots>0);
  races.push(result);await capture('w8-results-'+(race+1));await page.screenshot({path:'evidence/phase1/w8-results-phone-'+(race+1)+'.png'});
  for(const p of pages)await p.evaluate(()=>{window.__pilot=null});
  await page.locator('#race').tap();await page.locator('#careerSheet').waitFor({state:'visible'});
  if(race===1){
   const before=await stats();await capture('w8-before-home');adb('shell','input','keyevent','3');await pause(1500);
   let stopped=false;try{await fetch(base+'/health',{signal:AbortSignal.timeout(1500)})}catch{stopped=true}assert.ok(stopped,'Home closes LAN listener');
   adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');const after=await waitStats(s=>s.slots.every(x=>x.connected)&&!s.paused&&s.sceneryReady,30);
   assert.equal(after.phase,'career');assert.equal(after.slots[0].garage.profile,before.slots[0].garage.profile);assert.equal(after.slots[0].career.cleared,2);
   assert.ok(after.slots.every(s=>s.effectiveThrottle===0&&s.effectiveFire===0&&s.effectiveMine===0));await capture('w8-after-home');
   lifecycle={before,after,listenerStopped:stopped};checks.push('Home stops listener; resume restores career, both browser seats and neutral drive/fire/mine controls');
  }
 }
 assert.equal(races[2].slots[0].career.round,4);checks.push('Three real Stick career weapon races pay separate profiles and advance host through first cup');
 await page.screenshot({path:'evidence/phase1/w8-cup-phone.png'});await capture('w8-cup-tv');
 const saved=races[2].slots.map(s=>({profile:s.garage.profile,credits:s.garage.credits,round:s.career.round,cleared:s.career.cleared}));
 adb('shell','am','force-stop','dev.deathride.tv');adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');let nextPin;
 for(let n=0;n<30;n++){await pause(1000);const pid=adb('shell','pidof','dev.deathride.tv').trim();const log=adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');nextPin=[...log.matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(nextPin)break}assert.ok(nextPin);
 for(let i=0;i<2;i++){await pages[i].evaluate(()=>localStorage.removeItem('token'));await pages[i].goto(base+'/?pin='+nextPin);await pages[i].waitForFunction(n=>document.getElementById('player').textContent==='PLAYER '+n,i+1)}
 restored=await waitStats(s=>s.slots[0].garage.profile===saved[0].profile&&s.slots[1].garage.profile===saved[1].profile);
 for(let i=0;i<2;i++){assert.equal(restored.slots[i].garage.credits,saved[i].credits);assert.equal(restored.slots[i].career.round,saved[i].round);assert.equal(restored.slots[i].career.cleared,saved[i].cleared)}
 checks.push('Process restart with fresh pairing restores both balances, parts and host cup progress');assert.deepEqual(errors,[]);console.log(checks.join('\n'));
}catch(error){failure=error.stack;throw error}finally{await writeFile('evidence/phase1/w8-session.json',JSON.stringify({apkSha256,device:'AFTKM 1080p, Chrome touch menus; cooperative scripted ordinary LAN inputs, not human play',checks,errors,failure,windows,races,lifecycle,restored},null,2));await browser.close()}
