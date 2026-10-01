import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot} from './pilot.mjs';

const [base]=process.argv.slice(2),device=process.env.PROBE_DEVICE||new URL(base).hostname+':5555';
const adb=(...args)=>execFileSync('adb',['-s',device,...args],{encoding:'utf8'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats')).json();
const checks=[],races=[],errors=[];
await mkdir('evidence/phase2',{recursive:true});
async function restart(){
 adb('shell','input','keyevent','KEYCODE_WAKEUP');adb('shell','am','force-stop','dev.deathride.tv');adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');
 for(let i=0;i<80;i++){await pause(500);const pid=adb('shell','pidof','dev.deathride.tv').trim();if(!pid)continue;const log=adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');const pin=[...log.matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(pin)try{await stats();return pin}catch{}}
 throw Error('Device listener did not start');
}
async function until(test,label,limit=100){for(let i=0;i<limit;i++){const s=await stats();if(test(s))return s;await pause(100)}throw Error(label)}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:1000,height:600},isMobile:true,hasTouch:true});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
try{
 const pin=await restart();await installPilot(page);await page.goto(base+'/?pin='+pin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 const catalog=await(await fetch(base+'/catalog')).json();assert.equal(catalog.weapons.length,4);
 await page.locator('#garageButton').tap();await until(s=>s.phase==='garage','garage');
 const before=await stats();assert.equal(before.slots[0].garage.credits,0);const loanDebt=before.slots[0].garage.market.debt+330;
 const act=async(action,id='')=>{await page.locator(`[data-market="${action}"][data-item="${id}"]`).tap();await pause(250)};
 await act('loan');await until(s=>s.slots[0].garage.market.debt===loanDebt,'loan');
 await act('item','turbo');await until(s=>s.slots[0].garage.market.items.find(x=>x.id==='turbo').packed,'packed turbo');
 await act('contract','delivery');await until(s=>s.slots[0].garage.market.contracts.find(x=>x.id==='delivery').active,'contract');
 await act('service','manual');await until(s=>s.slots[0].garage.market.manualService,'manual service');
 checks.push('Fresh profile; bounded loan; paid one-race turbo; optional delivery contract; manual service selected through controller buttons');
 async function drive(career){
  if(career){await page.locator('#careerButton').tap();await until(s=>s.phase==='career','career');await page.locator('#careerStart').tap()}
  else {await page.locator('#closeGarage').tap();await until(s=>s.phase==='lobby','lobby');await page.locator('#race').tap()}
  const pilot=new Pilot(await(await fetch(base+'/routes')).json());const began=performance.now();let result;
  while(performance.now()-began<220000){result=await stats();await page.evaluate(command=>{window.__pilot=command},{...pilot.command(result,0),weapon:3});if(result.phase==='results')break;await pause(100)}
  await page.evaluate(()=>{window.__pilot=null});assert.equal(result.phase,'results');races.push(result);return result;
 }
 const result=await drive(false);assert.ok(result.combatSummary.shotsByWeapon[3]>0);assert.ok(result.slots[0].garage.market.debt<loanDebt);
 assert.equal(result.slots[0].garage.market.items.find(x=>x.id==='turbo').packed,false);
 checks.push('Actual device race fired Scatter; result consumed the reserve and repaid debt without a duplicate settlement');
 await page.locator('#garageButton').tap();await until(s=>s.phase==='garage','results garage');
 let g=(await stats()).slots[0].garage;
 if(g.market.condition<100){const condition=g.market.condition;await act('repair');await until(s=>s.slots[0].garage.market.condition===Math.min(100,condition+20),'repair increment');checks.push('Manual hull repair increased condition by the priced increment')}
 await act('trade','Needle');await until(s=>s.slots[0].garage.car.id==='Needle','trade');
 g=(await stats()).slots[0].garage;assert.ok(g.market.cars.find(c=>c.id==='Needle').owned);assert.equal(g.market.cars.find(c=>c.id==='Line').owned,false);
 const saved={credits:g.credits,debt:g.market.debt,condition:g.market.condition,car:g.car.id,races:g.races};
 await page.locator('#closeGarage').tap();const nextPin=await restart();await page.goto(base+'/?pin='+nextPin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await until(s=>s.slots[0].garage.car?.id==='Needle','restored profile');g=(await stats()).slots[0].garage;
 assert.deepEqual({credits:g.credits,debt:g.market.debt,condition:g.market.condition,car:g.car.id,races:g.races},saved);
 checks.push('Trade retained one owned car; ownership / cash / debt / condition survived process restart with the same browser profile');
 const career=await drive(true);assert.equal(career.combatSummary.damageScale,.10);
 assert.ok(!(career.slots[0].combat.wrecked && career.slots[0].lap<=1),'Automated reference drive must not wreck inside lap one');
 checks.push('Scrap career uses the common 0.10 damage policy on device; automated lead driver reached at least the first lap');
 await page.screenshot({path:'evidence/phase2/c3-controller.png'});adb('shell','screencap','-p','/sdcard/c3-content.png');adb('pull','/sdcard/c3-content.png','evidence/phase2/c3-tv.png');
 assert.deepEqual(errors,[]);await writeFile('evidence/phase2/c3-device.json',JSON.stringify({utc:new Date().toISOString(),device:adb('shell','getprop','ro.product.model').trim(),checks,errors,saved,races},null,2));
 await page.locator('#leave').tap();console.log(checks.join('\n'));
}finally{await browser.close()}
