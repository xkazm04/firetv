import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const [base,pin,output='evidence/abilities/a2/controller']=process.argv.slice(2);
assert.equal(new URL(base).port,'8767','Only the isolated abilities listener is allowed');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],checks=[],packets=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const stats=async()=>await(await fetch(base+'/stats')).json();
async function until(fn,message,seconds=10){const end=performance.now()+seconds*1000;while(performance.now()<end){if(await fn())return;await pause(100)}throw Error(message)}
page.on('pageerror',e=>errors.push(e.message));
page.on('websocket',ws=>ws.on('framesent',({payload})=>{try{const p=JSON.parse(payload);if(p.t==='i')packets.push(p)}catch{}}));
try {
 assert.equal((await stats()).slots.filter(s=>s.connected).length,0,'Refuse occupied seats');
 await page.goto(base+'/?pin='+pin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await page.locator('#carButton').tap();await page.locator('#carChoice').selectOption('Bulwark');await page.locator('#closeCar').tap();
 const cdp=await context.newCDPSession(page);
 const point=async(id,touchId)=>{const b=await page.locator('#'+id).boundingBox();assert.ok(b&&b.height>=38&&b.y+b.height<=414,id+' reachable');return{x:b.x+b.width/2,y:b.y+b.height/2,id:touchId}};
 const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 for(const layout of ['Classic','Cruise','Split'])for(const mirror of [false,true]) {
  await page.locator('#settings').tap();await page.locator('#layoutChoice').selectOption(layout);await page.locator('#mirrorChoice').setChecked(mirror);await page.locator('#closeFeel').tap();
  await page.locator('#race').tap();await until(async()=>{const s=await stats();return s.phase==='race'&&s.slots[0].combat.armingSeconds===0},'race protection expired',15);
  const steering=await point('steer',1),ability=await point('ability',2),brake=await point('brake',3);
  assert.equal((await page.locator('#steer').boundingBox()).x>(await page.locator('#ability').boundingBox()).x,mirror);
  const energy=(await stats()).slots[0].combat.ability.energy;
  await touch('touchStart',[steering,ability]);steering.x+=35;if(layout==='Split')steering.y-=65;
  await touch('touchMove',[steering,ability]);await pause(220);
  let slot=(await stats()).slots[0];assert.equal(slot.effectiveAbility,1);assert.ok(slot.effectiveSteer>0);
  assert.ok(slot.combat.ability.energy<energy,'Real activation spends energy');assert.ok(slot.combat.ability.uses>0);
  if(layout==='Classic')assert.equal(slot.effectiveThrottle,0);else assert.ok(slot.effectiveThrottle>.5);
  assert.equal(packets.at(-1).fire,0,'Ability does not press FIRE');
  await touch('touchStart',[steering,ability,brake]);await pause(100);assert.equal(packets.at(-1).b,1,'Brake remains independent');
  await touch('touchEnd',[]);await pause(160);slot=(await stats()).slots[0];assert.equal(slot.effectiveAbility,0);assert.equal(slot.effectiveThrottle,0);assert.equal(packets.at(-1).b,0);
  await page.screenshot({path:output+'/'+layout+'-'+mirror+'.png'});
  // Opening settings while a captured ability hold exists must publish a neutral input.
  await touch('touchStart',[await point('ability',4)]);await pause(80);
  await page.locator('#settings').dispatchEvent('click');await pause(120);assert.equal(packets.at(-1).ability,0);assert.equal(packets.at(-1).a,0);
  await touch('touchEnd',[]);await page.locator('#closeFeel').tap();
  checks.push({layout,mirror,energyBefore:energy,uses:slot.combat.ability.uses,independentPointers:true,settingsNeutral:true});
  await page.locator('#leave').tap();await until(async()=>['lobby','results'].includes((await stats()).phase),'left race');
 }
 await page.locator('#race').tap();await until(async()=>(await stats()).phase==='race','final race');
 await touch('touchStart',[await point('ability',5)]);await pause(150);await context.close();await pause(500);
 const final=await stats();assert.equal(final.slots[0].effectiveAbility,0);assert.equal(final.slots[0].effectiveThrottle,0);
 assert.deepEqual(errors,[]);assert.ok(packets.some(p=>p.ability===1));
 await writeFile(output+'/result.json',JSON.stringify({base,checks,disconnectCleared:true,errors,inputPackets:packets.length,final,limit:'Chrome CDP touch; physical-phone comfort and optical latency not measured'},null,2));
 console.log(JSON.stringify({checks:checks.length,disconnectCleared:true,inputPackets:packets.length}));
} catch(error) {await page.screenshot({path:output+'/failure.png'}).catch(()=>{});throw error} finally {await browser.close()}
