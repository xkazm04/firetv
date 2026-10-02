// Real controller commands and screenshots; no injected simulation or cosmetic states.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot} from './pilot.mjs';
const [base,output='evidence/hud/h3/gallery']=process.argv.slice(2);
assert.equal(new URL(base).port,'8768');
const device=new URL(base).hostname+':5555',pkg='dev.deathride.hud',activity=pkg+'/dev.deathride.tv.MainActivity';
const run=(args,encoding='utf8')=>execFileSync('adb',['-P','5039',...args],{encoding,windowsHide:true,timeout:20000,maxBuffer:8e6});
run(['connect',device]);
const adb=(...args)=>run(['-s',device,...args]);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats',{signal:AbortSignal.timeout(5000)})).json();
const result={utc:new Date().toISOString(),device,pkg,apkSha256:createHash('sha256').update(await readFile('app/build/outputs/apk/debug/app-debug.apk')).digest('hex'),checks:[],captures:[],courses:[],errors:[],limits:'Ordinary paired-controller inputs. Screenshot follows telemetry and is not frame-synchronous. No human feel claim.'};
await mkdir(output,{recursive:true});
async function until(fn,label,limit=150){for(let i=0;i<limit;i++){const s=await stats();if(fn(s))return s;await pause(100)}throw Error(label)}
async function capture(name){const before=await stats();await writeFile(output+'/'+name+'.png',run(['-s',device,'exec-out','screencap','-p'],'buffer'));result.captures.push({name,before,after:await stats()});await writeFile(output+'/progress.json',JSON.stringify(result,null,2));console.log('Captured '+name)}
adb('shell','input','keyevent','KEYCODE_WAKEUP');adb('shell','am','force-stop',pkg);adb('shell','am','start','-n',activity);
let pin;
for(let i=0;i<60;i++){await pause(500);const pid=adb('shell','pidof',pkg).trim();if(!pid)continue;pin=[...adb('logcat','-d','--pid='+pid,'-s','DeathRide:I').matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(pin)try{await stats();break}catch{}}
assert.ok(pin);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});const page=await context.newPage();
page.on('pageerror',e=>result.errors.push(e.message));
try {
 await until(s=>s.sceneryReady,'initial scene');await capture('lobby-unpaired');
 await installPilot(page);await page.goto(base+'/?pin='+pin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await capture('lobby-paired');
 await page.locator('#garageButton').tap();await until(s=>s.phase==='garage','garage');await capture('garage');await page.screenshot({path:output+'/phone-garage.png'});
 await page.locator('[data-market="loan"]').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/phone-shop.png'});await page.locator('#closeGarage').tap();
 await page.locator('#careerButton').tap();const menu=await until(s=>s.phase==='career'&&s.art.textureBytes===15466496,'career and published backdrop residency');const career=menu.slots[0].career;
 assert.equal(career.roundCount,35);assert.equal(career.story.lines.length,3);assert.equal(career.rivals.length,5);
 assert.equal(await page.locator('#storyTitle').textContent(),career.story.title);assert.ok((await page.locator('#storyLines').textContent()).includes(career.story.lines[2]));
 assert.equal(menu.art.regions,98);assert.equal(menu.art.failures,0);assert.equal(menu.art.textureBytes,15466496);
 await capture('career-story-rivals');await page.screenshot({path:output+'/phone-career.png'});
 result.checks.push('35 events, three story lines, five actual rival garages, controller story agreement and one resident backdrop');
 adb('shell','input','keyevent','KEYCODE_HOME');await pause(1000);adb('shell','am','start','-n',activity);await until(s=>s.sceneryReady,'resume');await capture('home-resume');
 result.checks.push('Home/resume retained HUD listener and atlas with no failed regions');
 await page.locator('#careerStart').tap();await until(s=>s.phase==='countdown','career countdown');await capture('career-countdown');await until(s=>s.phase==='race','career race');await capture('career-laps');
 await page.locator('#leave').tap();await until(s=>s.phase==='lobby','leave career diagnostic');result.checks.push('Ordinary round-one career start displayed its authored 18-lap counter; aborted before settlement');
 await page.locator('#carButton').tap();
 const cars=await page.locator('#carChoice option').evaluateAll(os=>os.map(o=>o.value));assert.equal(cars.length,10);
 for(const id of cars){await page.locator('#carChoice').selectOption(id);await until(s=>s.slots[0].car.id===id,'car '+id);await capture('car-'+id)}
 result.checks.push('All ten car selections and signature names observed through controller');
 const tracks=await page.locator('#trackChoice option').evaluateAll(os=>os.map(o=>o.value));assert.ok(tracks.length>=24);
 for(const id of tracks){const began=performance.now();await page.locator('#trackChoice').selectOption(id);if(id==='switchback'){const preparing=await until(s=>s.track.id===id,'track publication');if(!preparing.sceneryReady)await capture('preparing-circuit')}
  await until(s=>s.track.id===id&&s.sceneryReady,'track '+id,450);result.courses.push({id,elapsedMs:performance.now()-began});console.log('Prepared '+id)}
 result.checks.push(tracks.length+' authored courses prepared on Stick');
 await page.locator('#trackChoice').selectOption('foundry');await page.locator('#carChoice').selectOption('Quill');await until(s=>s.track.id==='foundry'&&s.sceneryReady&&s.slots[0].car.id==='Quill','race selection');await page.locator('#closeCar').tap();await page.locator('#race').tap();
 await until(s=>s.phase==='countdown','countdown');await capture('countdown');
 const pilot=new Pilot(await(await fetch(base+'/routes')).json());let current,captured=false,wreckCaptured=false;const began=performance.now();
 while(performance.now()-began<240000){
  current=await stats();await page.evaluate(c=>{window.__pilot=c},pilot.command(current,0));
  if(current.phase==='race'&&current.raceSeconds>3&&!captured){assert.equal(current.art.regions,98);assert.equal(current.art.failures,0);assert.ok(current.art.draws>0);await capture('race');await context.setOffline(true);await until(s=>s.slots[0].stale.last10s>10&&s.slots[0].effectiveThrottle===0,'link quiet and neutral');await pause(500);await capture('link-quiet');await context.setOffline(false);await page.waitForFunction(()=>document.body.classList.contains('online')&&!document.body.classList.contains('lost'));captured=true}
  if(current.phase==='race'&&current.slots[0].combat.wrecked&&!wreckCaptured){await capture('wreck-spectating');wreckCaptured=true}
  if(current.phase==='results')break;await pause(100);
 }
 await page.evaluate(()=>{window.__pilot=null});assert.equal(current.phase,'results');assert.equal(current.slots[0].car.id,'Quill');assert.ok(current.combatSummary.shots>0);
 await capture('results');await page.screenshot({path:output+'/phone-results.png'});
 result.checks.push('Ordinary Quill practice reached results with weapons firing; real link quiet/reconnect');
 result.final=current;result.wreckCaptured=wreckCaptured;assert.deepEqual(result.errors,[]);result.pass=true;
 await page.locator('#leave').tap();await until(s=>s.phase==='lobby','cleanup');
}catch(error){result.error=error.stack;process.exitCode=1}
finally {await browser.close();await writeFile(output+'/result.json',JSON.stringify(result,null,2));console.log(JSON.stringify({pass:result.pass,error:result.error,checks:result.checks}))}
