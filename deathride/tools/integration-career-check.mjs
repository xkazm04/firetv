import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Pilot,installPilot} from './pilot.mjs';

const [base,mode='opening']=process.argv.slice(2),device=new URL(base).hostname+':5555';
const adb=(...args)=>execFileSync('adb',['-s',device,...args],{encoding:'utf8'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats')).json();
const checks=[],races=[],errors=[],progress=[];await mkdir('evidence/phase2',{recursive:true});
async function restart(){
 adb('shell','input','keyevent','KEYCODE_WAKEUP');adb('shell','am','force-stop','dev.deathride.tv');adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');
 for(let i=0;i<80;i++){await pause(500);const pid=adb('shell','pidof','dev.deathride.tv').trim();if(!pid)continue;const log=adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');const pin=[...log.matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(pin)try{await stats();return pin}catch{}}
 throw Error('Device listener did not start');
}
async function until(test,label,limit=150){for(let i=0;i<limit;i++){const s=await stats();if(test(s))return s;await pause(100)}throw Error(label)}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
async function phone(pin,profile){const context=await browser.newContext({viewport:{width:1100,height:700},isMobile:true,hasTouch:true});const page=await context.newPage();if(profile)await page.addInitScript(id=>localStorage.setItem('profile',id),profile);await installPilot(page);page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/?pin='+pin);return page}
try{
 const legacy=mode==='migration'?Object.fromEntries((await readFile('core/src/test/resources/legacy/c3-device-profile.sav','utf8')).split('\n').filter(x=>x.includes('=')).map(x=>[x.slice(0,x.indexOf('=')),x.slice(x.indexOf('=')+1)])):null;
 const pin=await restart();const page=await phone(pin,mode==='duel'?(process.env.DUEL_PROFILE||'c4-duel-probe'):legacy?.id);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 let guest,guestBefore;
 if(mode==='duel'||mode==='guest'){
  guest=await phone(pin);await guest.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 2');
  await guest.locator('#garageButton').tap();await until(s=>s.phase==='garage','guest garage');
  await guest.locator('[data-market="loan"]').tap();await until(s=>s.slots[1].garage.credits===300,'guest loan');
  await guest.locator('[data-market="item"][data-item="turbo"]').tap();await until(s=>s.slots[1].garage.market.items.find(i=>i.id==='turbo').packed,'guest turbo');
  if(mode==='guest')await guest.locator('#garageCar').selectOption('Bulwark');
  await guest.locator('#closeGarage').tap();await until(s=>s.phase==='lobby','guest close');
  const g=(await stats()).slots[1].garage;guestBefore={credits:g.credits,races:g.races,debt:g.market.debt,packed:g.market.items.find(i=>i.id==='turbo').packed};
 }
 async function menu(){await page.locator('#careerButton').tap();return await until(s=>s.phase==='career','career menu')}
 let s=await menu();const opening=s.slots[0].career;assert.equal(opening.roundCount,35);assert.equal(opening.story.lines.length,3);assert.equal(opening.rivals.length,mode==='duel'?1:5);
 assert.equal(await page.locator('#storyTitle').textContent(),opening.story.title);assert.ok((await page.locator('#storyLines').textContent()).includes(opening.story.lines[2]));
 await page.screenshot({path:`evidence/phase2/ip-${mode}-controller.png`});adb('shell','screencap','-p','/sdcard/ip-career.png');adb('pull','/sdcard/ip-career.png',`evidence/phase2/ip-${mode}-tv.png`);
 checks.push('35 events, three story lines, actual rival garages and controller story text published on Stick');
 if(mode==='duel'){assert.equal(opening.round,35);assert.equal(opening.rivals[0].id,'marrow');assert.equal(opening.duel,true)}
 else if(legacy){assert.equal(opening.round,Math.floor(Number(legacy.career.split(',')[0])*35/12)+1);assert.equal(s.slots[0].garage.credits,Number(legacy.credits));assert.equal(s.slots[0].garage.market.debt,Number(legacy.market.split(',')[2]));assert.equal(s.slots[0].garage.car.id,legacy.car);checks.push('Actual C3 device profile migrated to 35 events with its selected car, credits and debt preserved')}
 else {assert.equal(opening.round,1);assert.equal(s.slots[0].garage.market.debt,120);assert.ok(opening.rivals.every(r=>r.parts>0));}
 if(mode==='guest'){
  await page.locator('#careerStart').tap();await until(x=>x.phase==='career' && x.slots[0].career.message.includes('Player 2: choose'),'guest ownership/division gate');
  await guest.locator('#careerGarage').tap();await until(x=>x.phase==='garage','guest selection');await guest.locator('#garageCar').selectOption('Line');
  await guest.locator('#closeGarage').tap();await until(x=>x.phase==='lobby','guest ready');s=await menu();checks.push('An unowned above-division guest car was rejected before issuing any race ticket');
 }
 for(let race=0;race<(['menu','migration'].includes(mode)?0:['duel','guest'].includes(mode)?1:2);race++){
  const round=s.slots[0].career.round;let maxLap=0,crossedThree=false;await page.locator('#careerStart').tap();const pilot=new Pilot(await(await fetch(base+'/routes')).json());const began=performance.now();let observed=false;
  while(performance.now()-began<1500000){s=await stats();if(s.phase==='race'){assert.equal(s.raceLaps,opening.laps);maxLap=Math.max(maxLap,s.slots[0].lap);if(s.slots[0].lap>3)crossedThree=true;}await page.evaluate(command=>{window.__pilot=command},{...pilot.command(s,0),weapon:3});
   if(guest && mode==='guest'){await guest.evaluate(command=>{window.__pilot=command},{...pilot.command(s,1),weapon:3});if(s.phase==='race'){assert.ok(s.traffic.some(r=>r.name==='ROOK' && !r.human));assert.equal(s.traffic.filter(r=>r.human).length,2)}}
   if(s.phase==='race' && mode==='duel'){assert.equal(s.traffic.length,2);assert.equal(s.traffic[1].name,'MARROW');assert.equal(s.traffic[1].human,false);assert.equal(s.slots[1].combat.spectating,true);observed=true}
   if(s.phase==='results')break;await pause(100)
  }
  await page.evaluate(()=>{window.__pilot=null});if(guest)await guest.evaluate(()=>{window.__pilot=null});assert.equal(s.phase,'results');assert.ok(s.slots[0].garage.receipt);races.push(s);progress.push({round,laps:s.raceLaps,maxLap,crossedThree});
  if(mode==='duel'){
   assert.equal(observed,true);const g=s.slots[1].garage;assert.deepEqual({credits:g.credits,races:g.races,debt:g.market.debt,packed:g.market.items.find(i=>i.id==='turbo').packed},guestBefore);
   checks.push('Authored finale fixture: exactly two physical entrants; Marrow remains AI with P2 connected; spectator keeps cash, debt, packed turbo and race count');
  }else if(mode==='guest'){
   const g=s.slots[1].garage;assert.equal(g.races,guestBefore.races+1);assert.equal(g.market.items.find(i=>i.id==='turbo').packed,false);
   const csv=async name=>{const lines=(await readFile('core/src/main/resources/data/'+name+'.csv','utf8')).trim().split(/\r?\n/);const keys=lines.shift().split(',');return lines.map(line=>Object.fromEntries(line.split(',').map((v,i)=>[keys[i],v])))};
   const economy=Object.fromEntries((await csv('economy')).map(r=>[r.key,Number(r.value)])),prizes=await csv('prizes'),curve=await csv('career-curve');
   assert.equal(g.receipt.gross,Math.floor((economy.participationCredits+Number(prizes[g.receipt.position-1].credits)+Math.min(g.receipt.kills,economy.paidWreckCap)*economy.wreckBountyCredits)*Number(curve[round-1].rewardScale))+g.market.bonus+s.slots[1].combat.cash);
   assert.equal(s.slots[1].career.round,1);checks.push('Two scripted browser input streams finished; named Rook stayed on the grid; guest received the same division prize scale, consumed its item and retained its independent career');
  }else {assert.ok(s.slots[0].career.round>round);assert.ok(!(s.slots[0].combat.wrecked && s.slots[0].lap<=1));if(race===0)s=await menu()}
 }
 if(mode==='opening'||mode==='migration'){
  if(mode==='opening'){assert.ok(progress.some(r=>r.crossedThree),'actual career ran beyond three laps');checks.push('TV telemetry uses authored endurance laps and live racing continued beyond lap three')}const before=s.slots[0];const save={credits:before.garage.credits,debt:before.garage.market.debt,round:before.career.round,rivals:before.career.rivals};
  const nextPin=await restart();await page.goto(base+'/?pin='+nextPin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
  const restored=await until(x=>x.slots[0].career.round===save.round,'career restore');const after=restored.slots[0];
  assert.deepEqual({credits:after.garage.credits,debt:after.garage.market.debt,round:after.career.round,rivals:after.career.rivals},save);
  checks.push(mode==='opening'?'Two ordinary career races paid player and rival garages; no lap-one lead wreck; nested rival cash/parts and player progress survived process restart':'Migrated player and nested rival profiles survived process restart');
 }
 if(await page.locator('#closeCareer').isVisible())await page.locator('#closeCareer').tap();else await page.locator('#leave').tap();
 await until(x=>x.phase==='lobby','probe cleanup');if(guest)await guest.locator('#leave').tap();
 assert.deepEqual(errors,[]);await writeFile(`evidence/phase2/ip-${mode}-device.json`,JSON.stringify({utc:new Date().toISOString(),device:adb('shell','getprop','ro.product.model').trim(),mode,fixture:mode==='duel',checks,errors,opening,progress,races},null,2));
 console.log(checks.join('\n'));
}finally{await browser.close()}
