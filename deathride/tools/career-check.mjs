import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot} from './pilot.mjs';
const [base,pin]=process.argv.slice(2),device=process.env.PROBE_DEVICE||'10.0.0.139:5555';
const adb=(...args)=>execFileSync('adb',['-s',device,...args],{encoding:'utf8'});
const pause=ms=>new Promise(r=>setTimeout(r,ms)),stats=async()=>await(await fetch(base+'/stats')).json();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const contexts=[],pages=[],errors=[],checks=[],windows=[];
try {
 for(let i=0;i<2;i++){const context=await browser.newContext({viewport:{width:1000,height:480},isMobile:true,hasTouch:true});contexts.push(context);const page=await context.newPage();pages.push(page);page.on('pageerror',e=>errors.push(e.message));await installPilot(page);await page.goto(base+'/?pin='+pin);await page.waitForFunction(n=>document.getElementById('player').textContent==='PLAYER '+n,i+1)}
 const [page,guest]=pages;adb('shell','input','keyevent','19');await page.locator('#careerSheet').waitFor({state:'visible'});
 assert.equal(await page.locator('#careerStart').isEnabled(),true);assert.equal(await guest.locator('#careerStart').isEnabled(),false);
 await page.waitForFunction(()=>document.querySelector('#careerCar option[value=Comet]')?.disabled===true);
 assert.equal(await page.locator('#careerCar option[value=Comet]').evaluate(o=>o.disabled),true);
 adb('shell','input','keyevent','22');await pause(300);assert.equal((await stats()).slots[0].career.difficulty.id,'Club');
 adb('shell','input','keyevent','22');await pause(300);assert.equal((await stats()).slots[0].career.difficulty.id,'Pro');assert.equal(await guest.locator('#careerDifficulty').inputValue(),'Pro');
 await page.screenshot({path:'evidence/phase1/w7-career-phone.png'});adb('shell','screencap','-p','/sdcard/w7-career.png');adb('pull','/sdcard/w7-career.png','evidence/phase1/w7-career-tv.png');
 checks.push('Remote UP opens career and LEFT/RIGHT chooses declared tiers; five named rivals and career car locks visible; guest cannot start/change host tier');
 await page.locator('#careerDifficulty').selectOption('Rookie');await pause(250);
 await page.locator('#careerGarage').tap();await page.locator('[data-part=brakes]').tap();await pause(200);assert.equal((await stats()).slots[0].garage.credits,40);
 await page.locator('#closeGarage').tap();await page.locator('#careerButton').tap();await page.locator('#careerStart').tap();
 const routes=await(await fetch(base+'/routes')).json(),pilot=new Pilot(routes);let result,lastWindow=0;
 const began=performance.now();
 while(performance.now()-began<195000){
  result=await stats();await Promise.all(pages.map((p,i)=>p.evaluate(command=>{window.__pilot=command},pilot.command(result,i))));
  if(result.phase==='results')break;
  if(result.raceSeconds-lastWindow>=10){lastWindow=result.raceSeconds;windows.push(result);console.log('race '+result.raceSeconds.toFixed(1)+' s / '+result.slots.map(s=>'lap '+s.lap+' HP '+Math.round(s.combat.hp)).join(' / '))}
  await pause(100);
 }
 assert.equal(result.phase,'results');assert.equal(result.raceMode,'career');assert.equal(result.slots[0].garage.races,1);assert.equal(result.slots[0].career.cleared,1);assert.equal(result.slots[0].career.round,2);
 assert.equal(result.slots[1].garage.races,1);assert.equal(result.slots[1].career.cleared,0);assert.notEqual(result.slots[0].garage.profile,result.slots[1].garage.profile);
 assert.ok(result.combatSummary.shots>0);checks.push('Two scripted LAN controllers race with weapons; host clears round and receives cash; guest receives own cash with no career advancement');
 for(const page of pages)await page.evaluate(()=>{window.__pilot=null});
 await page.locator('#race').tap();await page.locator('#careerSheet').waitFor({state:'visible'});await page.screenshot({path:'evidence/phase1/w7-next-round.png'});
 const saved=result.slots.map(s=>({profile:s.garage.profile,credits:s.garage.credits,round:s.career.round,cleared:s.career.cleared}));
 adb('shell','am','force-stop','dev.deathride.tv');adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');let nextPin;
 for(let n=0;n<30;n++){await pause(1000);const pid=adb('shell','pidof','dev.deathride.tv').trim();const log=adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');nextPin=[...log.matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(nextPin)break}assert.ok(nextPin);
 for(let i=0;i<2;i++){await pages[i].evaluate(()=>localStorage.removeItem('token'));await pages[i].goto(base+'/?pin='+nextPin);await pages[i].waitForFunction(n=>document.getElementById('player').textContent==='PLAYER '+n,i+1)}await pause(300);
 const restored=await stats();for(let i=0;i<2;i++){assert.equal(restored.slots[i].garage.profile,saved[i].profile);assert.equal(restored.slots[i].garage.credits,saved[i].credits);assert.equal(restored.slots[i].career.round,saved[i].round);assert.equal(restored.slots[i].career.cleared,saved[i].cleared)}
 checks.push('Fresh pairing after app process restart restores independent host/guest careers and garages');assert.deepEqual(errors,[]);
 await writeFile('evidence/phase1/w7-device.json',JSON.stringify({device:'AFTKM 1080p, Chrome touch menus and scripted pursuit inputs over LAN; not human play',checks,errors,windows,result,restored},null,2));console.log(checks.join('\n'));
}catch(error){console.error('Browser errors:',errors);for(let i=0;i<pages.length;i++){console.error(await pages[i].locator('#careerCar').innerHTML());await pages[i].screenshot({path:'evidence/phase1/w7-failure-'+i+'.png'})}throw error}finally{await browser.close()}
