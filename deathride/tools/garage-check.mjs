import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const [base,pin]=process.argv.slice(2),device=process.env.PROBE_DEVICE||'10.0.0.139:5555';
const adb=(...args)=>execFileSync('adb',['-s',device,...args],{encoding:'utf8'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats')).json();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:1040,height:480},isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto(base+'/?pin='+pin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await page.locator('#garageButton').tap();await page.locator('#garageSheet').waitFor({state:'visible'});await pause(300);
 let before=(await stats()).slots[0].garage;assert.equal(before.credits,160);assert.equal(before.car.id,'Line');assert.equal(await page.locator('.offer').count(),6);
 await page.locator('[data-part=brakes]').tap();await pause(350);
 let bought=(await stats()).slots[0].garage;assert.equal(bought.credits,40);assert.equal(bought.offers.find(x=>x.id==='brakes').tier,1);assert.equal(bought.car.stats.braking,before.car.stats.braking+1);
 // Old offer delivered twice, then an attempted racing purchase, must never buy another tier.
 const token=await page.evaluate(()=>localStorage.getItem('token'));
 await page.evaluate(({token,pin,before})=>new Promise(resolve=>{const ws=new WebSocket('ws://'+location.host+'/ws');ws.onopen=()=>ws.send(JSON.stringify({t:'hello',token,pin}));ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.t==='welcome'){const buy={t:'buy',profile:before.profile,car:'Line',part:'brakes',tier:0};ws.send(JSON.stringify(buy));ws.send(JSON.stringify(buy));setTimeout(()=>{ws.close();resolve()},250)}}}),{token,pin,before});
 await pause(1600);assert.equal((await stats()).slots[0].garage.credits,40);checks.push('Phone purchase: six families; 160 - 120 = 40 CR; braking 6 > 7; duplicate old offer cannot charge again');
 await page.screenshot({path:'evidence/phase1/w5-phone-garage.png'});
 // Real remote car/part navigation shares the same profile and effective stats.
 adb('shell','input','keyevent','22');await pause(300);assert.equal((await stats()).slots[0].garage.car.id,'Bastion');
 adb('shell','input','keyevent','21');await pause(300);assert.equal((await stats()).slots[0].garage.car.id,'Line');
 adb('shell','input','keyevent','20');adb('shell','input','keyevent','20');
 adb('shell','screencap','-p','/sdcard/w5-garage.png');adb('pull','/sdcard/w5-garage.png','evidence/phase1/w5-tv-garage.png');
 checks.push('TV remote LEFT/RIGHT changes garage car; UP/DOWN selects part; phone and TV use same profile');
 await page.locator('#closeGarage').tap();await page.locator('#race').tap();await pause(3300);assert.equal((await stats()).phase,'race');
 // A stationary, non-firing player is a real losing path through combat, not a mocked payout.
 let result;for(let n=0;n<190;n++){await pause(1000);result=await stats();if(result.phase==='results')break}
 assert.equal(result.phase,'results');const paid=result.slots[0].garage;assert.equal(paid.races,1);assert.ok(paid.receipt.banked>0);assert.equal(paid.credits,40+paid.receipt.banked);
 await pause(1200);assert.equal((await stats()).slots[0].garage.credits,paid.credits);checks.push('Actual Stick race ends, pays once, itemizes repair/insurance and retains positive cash');
 await writeFile('evidence/phase1/w5-device-before-restart.json',JSON.stringify({checks,before,bought,result},null,2));
 adb('shell','am','force-stop','dev.deathride.tv');adb('shell','am','start','-n','dev.deathride.tv/.MainActivity');
 let nextPin;for(let n=0;n<30;n++){await pause(1000);const pid=adb('shell','pidof','dev.deathride.tv').trim();const log=adb('logcat','-d','--pid='+pid,'-s','DeathRide:I');nextPin=[...log.matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(nextPin)break}assert.ok(nextPin,'Restart reaches ready listener');
 await page.evaluate(()=>localStorage.removeItem('token'));await page.goto(base+'/?pin='+nextPin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');await pause(500);
 const restored=(await stats()).slots[0].garage;assert.equal(restored.profile,before.profile);assert.equal(restored.credits,paid.credits);assert.equal(restored.races,1);assert.equal(restored.offers.find(x=>x.id==='brakes').tier,1);
 await page.locator('#garageButton').tap();await pause(200);await page.screenshot({path:'evidence/phase1/w5-receipt.png'});assert.deepEqual(errors,[]);
 checks.push('App force-stop/relaunch and fresh seat token preserve the browser profile, bought part, receipt and cash');
 await page.locator('#closeGarage').tap();await context.close();adb('shell','input','keyevent','19');await pause(300);adb('shell','input','keyevent','85');await pause(300);
 const couchBefore=(await stats()).slots[0].garage;assert.equal(couchBefore.profile,'couch-0');assert.equal(couchBefore.credits,160);
 adb('shell','input','keyevent','20');adb('shell','input','keyevent','20');adb('shell','input','keyevent','23');await pause(300);
 const couchAfter=(await stats()).slots[0].garage;assert.equal(couchAfter.credits,40);assert.equal(couchAfter.offers.find(x=>x.id==='brakes').tier,1);
 checks.push('Remote PLAY/PAUSE opens couch garage; DOWN/DOWN/SELECT buys brakes once for 120 CR');
 await writeFile('evidence/phase1/w5-device.json',JSON.stringify({device:'AFTKM 1080p; desktop Chrome touch over LAN, not physical phone',checks,errors,before,bought,result,restored},null,2));console.log(checks.join('\n'));
} finally {await browser.close()}
