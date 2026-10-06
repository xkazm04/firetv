import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const [base,pin,wave='2']=process.argv.slice(2);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});
const page=await context.newPage(); const errors=[]; const checks=[];
page.on('pageerror',e=>errors.push(e.message));
const stats=async()=>await(await fetch(base+'/stats')).json();
try {
  await page.goto(base+'/?pin='+pin+'&layout=Classic');
  await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
  await page.locator('#carButton').tap();
  for(const id of ['Needle','Line','Bastion','Comet','Trail']) {
    await page.locator('#carChoice').selectOption(id);
    await page.waitForTimeout(250);
    assert.equal((await stats()).slots[0].car.id,id);
    assert.equal(await page.locator('#carStats meter').count(),Object.keys((await stats()).slots[0].car.stats).length);
  }
  checks.push('All five classes selected on paired phone; host agrees; seven stat bars');
  await page.screenshot({path:`evidence/phase1/w${wave}-controller.png`});
  await page.locator('#closeCar').tap();
  if(Number(wave)>=3){
    await page.locator('#settings').tap();
    for(const id of ['Gravel','Oil','Ice','Asphalt']){
      await page.locator('#surfaceChoice').selectOption(id);await page.waitForTimeout(250);
      assert.equal((await stats()).surface,id);
    }
    await page.locator('#closeFeel').tap();checks.push('All four practice surfaces selected live');
  }
  await page.locator('#race').tap(); await page.waitForTimeout(3300);
  assert.equal((await stats()).phase,'race');
  const cdp=await context.newCDPSession(page); const gas=await page.locator('#gas').boundingBox();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:gas.x+gas.width/2,y:gas.y+gas.height/2,id:10}]});
  await page.waitForTimeout(1200);
  assert.ok((await stats()).slots[0].speedMps>1);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  if(Number(wave)>=3){
    const drift=await page.locator('#drift').boundingBox();
    const steer=await page.locator('#steer').boundingBox();
    const points=[{x:gas.x+gas.width/2,y:gas.y+gas.height/2,id:10},{x:steer.x+steer.width/2,y:steer.y+steer.height/2,id:11},{x:drift.x+drift.width/2,y:drift.y+drift.height/2,id:12}];
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
    points[1].x+=120;await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points});
    await page.waitForTimeout(1300);assert.equal((await stats()).slots[0].drifting,true);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    checks.push('Simultaneous throttle steer and handbrake enter drift on Stick');
  }
  checks.push('Selected class starts race and responds to phone throttle');
  await page.locator('#leave').tap(); await page.waitForTimeout(200);
  assert.equal((await stats()).phase,'lobby'); assert.deepEqual(errors,[]);
  await writeFile(`evidence/phase1/w${wave}-device.json`,JSON.stringify({device:'AFTKM via LAN; Chromium touch emulation, not physical phone',checks,errors,stats:await stats()},null,2));
  console.log(checks.join('\n'));
} finally {await browser.close()}
