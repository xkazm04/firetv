import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const [base,pin,output='evidence/hud/h2/layouts']=process.argv.slice(2);
assert.equal(new URL(base).port,'8768','Only HUD listener');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],checks=[],responses=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)responses.push({url:r.url(),status:r.status()})});
const stats=async()=>await(await fetch(base+'/stats')).json();
try {
 assert.equal((await stats()).slots.filter(s=>s.connected).length,0);
 await page.goto(base+'/?pin='+pin);await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 for(const viewport of [{width:896,height:414},{width:740,height:360},{width:667,height:320}]) {
  await page.setViewportSize(viewport);
  for(const layout of ['Classic','Cruise','Split'])for(const mirror of [false,true]) {
   await page.locator('#settings').tap();await page.locator('#layoutChoice').selectOption(layout);await page.locator('#mirrorChoice').setChecked(mirror);await page.locator('#closeFeel').tap();
   const sizes={};
   for(const id of ['steer','gas','fire','brake','drift','mine','swap','ability','race','leave','careerButton','garageButton','carButton','settings']) {
    if(id==='gas'&&layout==='Split')continue;
    const b=await page.locator('#'+id).boundingBox();assert.ok(b&&b.width>=44&&b.height>=44,id+' target floor');
    assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=viewport.width+.5&&b.y+b.height<=viewport.height+.5,id+' in viewport');sizes[id]=b;
   }
   assert.equal(sizes.steer.x>sizes.fire.x,mirror);
   checks.push({viewport,layout,mirror,sizes});
  }
  await page.screenshot({path:output+`/controller-${viewport.width}.png`});
 }
 await page.setViewportSize({width:896,height:414});
 for(const [button,sheet,close] of [['settings','feelSheet','closeFeel'],['carButton','carSheet','closeCar'],['garageButton','garageSheet','closeGarage'],['careerButton','careerSheet','closeCareer']]) {
  await page.locator('#'+button).tap();await page.locator('#'+sheet).waitFor({state:'visible'});
  await page.screenshot({path:output+'/'+sheet+'.png'});await page.locator('#'+close).tap();
 }
 // Real offline transition: no artificial cosmetic class injection.
 await context.setOffline(true);await page.waitForFunction(()=>document.body.classList.contains('lost'),{timeout:10000});
 await page.screenshot({path:output+'/lost-link.png'});await context.setOffline(false);
 await page.waitForFunction(()=>document.body.classList.contains('online')&&!document.body.classList.contains('lost'),{timeout:15000});
 assert.deepEqual(errors,[]);assert.deepEqual(responses,[]);
 await writeFile(output+'/result.json',JSON.stringify({checks,errors,responses,offlineReconnect:true,limits:'Real headless browser layouts and offline transition; physical phone reach remains owner pending.'},null,2));
 console.log(JSON.stringify({layouts:checks.length,allDrivingTargetsAtLeast44px:true,sheets:4,offlineReconnect:true}));
} finally {await browser.close()}
