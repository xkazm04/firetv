import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const [base,pin]=process.argv.slice(2);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const context=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});
const page=await context.newPage(), errors=[], checks=[];
page.on('pageerror',e=>errors.push(e.message));
const stats=async()=>await(await fetch(base+'/stats')).json();
try {
 await page.goto(base+'/?pin='+pin+'&layout=Classic');
 await page.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await page.locator('#carButton').tap();
 for(const id of ['foundry','switchback','redline','runoff','crucible']) {
  await page.locator('#trackChoice').selectOption(id);
  await page.waitForTimeout(900);
  assert.equal((await stats()).track.id,id);
 }
 checks.push('All five authored courses selected on Stick through paired touch browser');
 await page.locator('#trackChoice').selectOption('foundry');
 await page.locator('#carChoice').selectOption('Bastion');
 await page.waitForTimeout(900);
 assert.equal((await stats()).slots[0].car.id,'Bastion');
 await page.screenshot({path:'evidence/phase1/w6-controller.png'});
 await page.locator('#closeCar').tap();await page.locator('#race').tap();await page.waitForTimeout(3300);
 const cdp=await context.newCDPSession(page),gas=await page.locator('#gas').boundingBox();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:gas.x+gas.width/2,y:gas.y+gas.height/2,id:1}]});
 await page.waitForTimeout(1200);assert.ok((await stats()).slots[0].speedMps>1);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForTimeout(150);assert.equal((await stats()).slots[0].effectiveThrottle,0);
 checks.push('Enlarged Bastion drives and releases throttle');assert.deepEqual(errors,[]);
 await page.locator('#leave').tap();await page.waitForTimeout(200);
 await writeFile('evidence/phase1/w6-device.json',JSON.stringify({device:'AFTKM; Chromium touch emulation over LAN, not physical phone',checks,errors,stats:await stats()},null,2));
 console.log(checks.join('\n'));
} finally {await browser.close()}
