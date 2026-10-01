// Short final-renderer check. Requires an isolated, explicitly funded round-35 fixture.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const [base,pin,profile='i2-duel-hud-20261001']=process.argv.slice(2);
assert.ok(profile.startsWith('i2-duel-hud-'),'use an isolated diagnostic fixture');
const device=new URL(base).hostname+':5555',pause=ms=>new Promise(r=>setTimeout(r,ms));
const adb=(...args)=>execFileSync('adb',['-s',device,...args],{encoding:'utf8',windowsHide:true});
const stats=async()=>await(await fetch(base+'/stats',{signal:AbortSignal.timeout(5000)})).json();
async function until(test){for(let i=0;i<200;i++){const s=await stats();if(test(s))return s;await pause(100)}throw Error('Timed out waiting for diagnostic state')}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
try {
  async function phone(id){const context=await browser.newContext({viewport:{width:1100,height:700},isMobile:true,hasTouch:true});if(id)await context.addInitScript(id=>localStorage.setItem('profile',id),id);const page=await context.newPage();await page.goto(base+'/?pin='+pin);return page}
  const host=await phone(profile);await host.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
  const guest=await phone();await guest.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 2');
  await host.locator('#careerButton').tap();const menu=await until(s=>s.phase==='career');
  assert.equal(menu.slots[0].career.round,35);assert.equal(menu.slots[0].career.laps,24);
  await host.locator('#careerStart').tap();await until(s=>s.phase==='race');await pause(2000);
  const s=await stats();assert.equal(s.traffic.length,2);assert.equal(s.slots[1].combat.spectating,true);
  assert.equal(s.raceLaps,24);assert.equal(s.art.budgetOk,true);assert.equal(s.art.failures,0);
  await host.screenshot({path:'evidence/phase2/i2-duel-hud-controller.png'});
  adb('shell','screencap','-p','/sdcard/i2-duel-hud.png');adb('pull','/sdcard/i2-duel-hud.png','evidence/phase2/i2-duel-hud-tv.png');
  await host.locator('#leave').tap();await until(s=>s.phase==='lobby');
  await writeFile('evidence/phase2/i2-duel-hud.json',JSON.stringify({utc:new Date().toISOString(),apkSha256:createHash('sha256').update(await readFile('app/build/outputs/apk/debug/app-debug.apk')).digest('hex'),fixture:profile,scope:'Short two-entrant HUD/atlas/budget check; aborted before a finish, no career-completion or feel claim',stats:s},null,2));
  console.log('Two entrants, P2 spectator, 24-lap HUD, loaded art and texture budget verified; screenshot saved for visual inspection; returned to lobby');
} finally {await browser.close()}
