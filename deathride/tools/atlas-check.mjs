import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile, mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot} from './pilot.mjs';

const [base,wave='i1-art']=process.argv.slice(2);
const device=process.env.PROBE_DEVICE||new URL(base).hostname+':5555';
const adb=(...args)=>execFileSync('adb',['-s',device,...args],{encoding:'utf8'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats')).json();
await mkdir('evidence/phase2',{recursive:true});
adb('shell','input','keyevent','KEYCODE_WAKEUP');
adb('shell','am','force-stop','dev.deathride.tv');
adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');
let pin;
for(let n=0;n<40;n++){
 await pause(500);
 const pid=adb('shell','pidof','dev.deathride.tv').trim();
 if(!pid)continue;
 const log=adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');
 pin=[...log.matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];
 if(pin)try{await stats();break}catch{}
}
assert.ok(pin,'Device listener ready with a pairing PIN');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:1000,height:480},isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],checks=[],selections=[],courses=[];
page.on('pageerror',e=>errors.push(e.message));
try {
 await installPilot(page);await page.goto(base+'/?pin='+pin);
 await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await page.locator('#carButton').tap();
 await page.waitForFunction(()=>document.querySelectorAll('#carChoice option').length>=10);
 const cars=await page.locator('#carChoice option').evaluateAll(os=>os.map(o=>o.value));
 assert.equal(cars.length,10);
 for(const id of cars){
  await page.locator('#carChoice').selectOption(id);
  await page.waitForFunction(id=>document.querySelector('#carChoice').value===id,id);
  for(let i=0;i<30 && (await stats()).slots[0].car.id!==id;i++)await pause(100);
  const s=await stats();assert.equal(s.slots[0].car.id,id);selections.push(s.slots[0].car);
 }
 checks.push('All ten car classes selected through the paired controller; host stats match each ID');
 if(true){
  const tracks=await page.locator('#trackChoice option').evaluateAll(os=>os.map(o=>o.value));assert.ok(tracks.length>=24);
  for(const id of tracks){
   const started=performance.now();
   await page.locator('#trackChoice').selectOption(id);
   let stable=0;for(let i=0;i<450;i++){const s=await stats();stable=s.track.id===id&&s.sceneryReady?stable+1:0;if(stable>=2)break;await pause(100)}
   const s=await stats();courses.push({id,ready:s.sceneryReady,elapsedMs:performance.now()-started});
   await writeFile(`evidence/phase2/${wave}-courses.json`,JSON.stringify(courses,null,2));
   assert.equal(s.track.id,id);assert.equal(s.sceneryReady,true,`${id}: scenery not ready within diagnostic ceiling`);
   console.log(`${id}: prepared in ${courses.at(-1).elapsedMs.toFixed(0)} ms`);
  }
  checks.push(`${tracks.length} authored tracks selected and prepared on the Stick`);
 }
 await page.locator('#trackChoice').selectOption('foundry');
 await page.locator('#carChoice').selectOption('Quill');
 await page.locator('#closeCar').tap();await page.locator('#race').tap();
 const pilot=new Pilot(await(await fetch(base+'/routes')).json());
 let result,captured=false;const began=performance.now();
 while(performance.now()-began<200000){
  result=await stats();await page.evaluate(command=>{window.__pilot=command},pilot.command(result,0));
  if(result.phase==='race' && result.raceSeconds>3 && !captured){
   assert.equal(result.art.regions,78);assert.equal(result.art.failures,0);assert.ok(result.art.draws>0);
   adb('shell','screencap','-p','/sdcard/i1-active.png');adb('pull','/sdcard/i1-active.png',`evidence/phase2/${wave}-active.png`);captured=true;
  }
  if(result.phase==='results')break;await pause(100);
 }
 await page.evaluate(()=>{window.__pilot=null});
 assert.equal(result.phase,'results');assert.equal(result.slots[0].car.id,'Quill');assert.ok(result.combatSummary.shots>0);
 checks.push(`New Quill completed a real device race result at ${result.raceSeconds.toFixed(2)} s with ${result.combatSummary.shots} weapon shots; automated LAN pursuit inputs, not human play`);
 await page.screenshot({path:`evidence/phase2/${wave}-controller.png`});
 adb('shell','screencap','-p',`/sdcard/${wave}-content.png`);adb('pull',`/sdcard/${wave}-content.png`,`evidence/phase2/${wave}-tv.png`);
 assert.deepEqual(errors,[]);
 await writeFile(`evidence/phase2/${wave}-device.json`,JSON.stringify({device:adb('shell','getprop','ro.product.model').trim(),utc:new Date().toISOString(),checks,errors,selections,courses,result},null,2));
 await page.locator('#leave').tap();
 await page.locator('#careerButton').tap();
 await pause(800);const menu=await stats();assert.equal(menu.phase,'career');assert.equal(menu.art.failures,0);assert.equal(menu.art.textureBytes,15466496);
 adb('shell','screencap','-p','/sdcard/i1-story.png');adb('pull','/sdcard/i1-story.png',`evidence/phase2/${wave}-story.png`);
 adb('shell','input','keyevent','KEYCODE_HOME');await pause(1000);adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');
 for(let i=0;i<100;i++){await pause(100);try{if((await stats()).sceneryReady)break}catch{}}
 const resumed=await stats();assert.equal(resumed.sceneryReady,true);assert.equal(resumed.art.failures,0);
 await writeFile(`evidence/phase2/${wave}-lifecycle.json`,JSON.stringify({menu,resumed},null,2));
 checks.push('Atlas art active, one story backdrop resident, and Home/resume recovered scenery');
 await page.locator('#closeCareer').tap();console.log(checks.join('\n'));
} finally {await browser.close()}
