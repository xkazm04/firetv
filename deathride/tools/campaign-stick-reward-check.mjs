// Reload the actually won boss profile and check its receipt; no prepared reward is injected.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const [base]=process.argv.slice(2);assert.equal(new URL(base).port,'8770');const pkg='dev.deathride.campaign',device=new URL(base).hostname+':5555';
const adb=(...a)=>execFileSync('adb',['-P','5041','-s',device,...a],{encoding:'utf8',windowsHide:true,timeout:20000});
const pause=ms=>new Promise(r=>setTimeout(r,ms));const stats=async()=>await(await fetch(base+'/stats')).json();
adb('shell','am','force-stop',pkg);adb('shell','am','start','-n',pkg+'/dev.deathride.tv.MainActivity');let pin;
for(let n=0;n<60;n++){await pause(500);const pid=adb('shell','pidof',pkg).trim();if(!pid)continue;pin=[...adb('logcat','-d','--pid='+pid,'-s','DeathRide:I').matchAll(/pairing http[^\n]*pin=(\d+)/g)].at(-1)?.[1];if(pin)break}
assert.ok(pin);const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const ctx=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});await ctx.addInitScript(()=>{localStorage.setItem('profile','campaign-stick-boss');const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.__probeSocket=this}}});const p=await ctx.newPage();await p.goto(base+'/?pin='+pin);await p.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');
 await p.locator('#careerButton').tap();await p.locator('#careerSheet').waitFor({state:'visible'});await pause(500);const before=await stats();const c=before.slots[0].career.campaign;
 assert.equal(before.slots[0].career.round,8);assert.equal(c.allies[0].state,2);const credits=before.slots[0].garage.credits;
 await p.evaluate(c=>window.__probeSocket.send(JSON.stringify({t:'market',profile:c.profile,car:c.car,action:'ally',id:'rook:money',revision:c.revision})),c);await pause(500);
 const after=await stats();assert.equal(after.slots[0].garage.credits,credits);assert.equal(after.slots[0].career.campaign.allies[0].state,2);
 await p.locator('#closeCareer').tap();await pause(500);assert.equal((await stats()).phase,'lobby');
 await writeFile('evidence/campaign/q4/reward-reload.json',JSON.stringify({pass:true,scope:'Restarted actual boss-win profile; no reset or injected reward',checks:['round eight and claimed cash survived restart','duplicate ordinary market request did not grant again','correct modal close returns to lobby'],before,after},null,2));console.log('Actual promotion reload, duplicate rejection and modal cleanup PASS');
}finally{await browser.close()}
