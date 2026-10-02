import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const [base,pin]=process.argv.slice(2);
const output=process.env.COMBAT_OUTPUT||'evidence/phase1';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const stats=async()=>await(await fetch(base+'/stats')).json();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
 await page.goto(base+'/?pin='+pin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await page.locator('#carButton').tap();await page.locator('#carChoice').selectOption('Bastion');await page.locator('#closeCar').tap();
 const cdp=await context.newCDPSession(page);
 const point=async(id,touchId)=>{const b=await page.locator('#'+id).boundingBox();assert.ok(b&&b.height>=38,id+' reachable target');return{x:b.x+b.width/2,y:b.y+b.height/2,id:touchId}};
 const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 for(const layout of ['Classic','Cruise','Split']) {
  await page.locator('#settings').tap();await page.locator('#layoutChoice').selectOption(layout);await page.locator('#closeFeel').tap();
  await page.locator('#race').tap();await pause(3300);assert.equal((await stats()).phase,'race');
  while((await stats()).slots[0].combat.armingSeconds>0)await pause(100);
  // C3 added Scatter. Each layout starts at an observed Rivet, not the old two-gun assumption.
  for(let n=0;n<3 && (await stats()).slots[0].combat.weaponName!=='Rivet';n++){await page.locator('#swap').tap();await pause(180)}
  assert.equal((await stats()).slots[0].combat.weaponName,'Rivet');
  const steering=await point('steer',1),fire=await point('fire',2),mine=await point('mine',3);
  const before=(await stats()).slots[0].combat.ammo;
  await touch('touchStart',[steering,fire]);steering.x+=60;if(layout==='Split')steering.y-=75;
  await touch('touchMove',[steering,fire]);await pause(420);
  let slot=(await stats()).slots[0];assert.equal(slot.effectiveFire,1);assert.ok(slot.combat.ammo<before);assert.ok(slot.effectiveSteer>0);
  assert.equal(slot.layout,layout);if(layout==='Cruise'||layout==='Split')assert.ok(slot.effectiveThrottle>.5);
  await touch('touchStart',[steering,fire,mine]);await pause(160);
  assert.equal((await stats()).slots[0].effectiveMine,1);
  await touch('touchEnd',[mine]);await pause(150);
  slot=(await stats()).slots[0];assert.equal(slot.effectiveMine,0);assert.equal(slot.effectiveFire,1);
  await touch('touchEnd',[]);await pause(150);
  slot=(await stats()).slots[0];assert.equal(slot.effectiveFire,0);assert.equal(slot.effectiveThrottle,0);
  await page.locator('#swap').tap();await pause(150);assert.equal((await stats()).slots[0].combat.weaponName,'Hammer');
  const heavy=(await stats()).slots[0].combat.ammo;await touch('touchStart',[await point('fire',4)]);await pause(200);await touch('touchEnd',[]);await pause(120);
  assert.ok((await stats()).slots[0].combat.ammo<heavy);
  await page.locator('#swap').tap();await pause(180);assert.equal((await stats()).slots[0].combat.weaponName,'Scatter');
  await page.locator('#swap').tap();await pause(180);assert.equal((await stats()).slots[0].combat.weaponName,'Rivet');
  await page.screenshot({path:`${output}/w4-${layout.toLowerCase()}.png`});
  checks.push(layout+': independent steer/fire/mine pointers; ammo; release; heavy swap; expected throttle');
  await page.locator('#leave').tap();await pause(150);
 }
 await page.locator('#settings').tap();await page.locator('#layoutChoice').selectOption('Classic');await page.locator('#mirrorChoice').check();await page.locator('#closeFeel').tap();await pause(150);
 assert.equal((await stats()).slots[0].mirrored,true);assert.ok((await page.locator('#steer').boundingBox()).x>(await page.locator('#fire').boundingBox()).x);
 checks.push('Left-handed mirror moves steering to the right; host telemetry agrees');
 await page.locator('#settings').tap();await page.locator('#mirrorChoice').uncheck();await page.locator('#closeFeel').tap();
 await page.locator('#race').tap();await pause(3300);while((await stats()).slots[0].combat.armingSeconds>0)await pause(100);await touch('touchStart',[await point('fire',5)]);await pause(160);
 await context.close();await pause(450);const final=await stats();assert.equal(final.slots[0].effectiveFire,0);assert.equal(final.slots[0].effectiveMine,0);
 checks.push('Disconnected phone clears attack holds on Stick');assert.deepEqual(errors,[]);
 await writeFile(output+'/w4-device.json',JSON.stringify({device:base,checks,errors,stats:final,limits:'Real Chrome CDP touch; device identity comes from the run manifest, not this test.'},null,2));console.log(checks.join('\n'));
}finally{await browser.close()}
