import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const [base,pin,output]=process.argv.slice(2);
assert.equal(new URL(base).port,process.env.DEATHRIDE_BROWSER_PORT||'8770');await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const stats=async()=>await(await fetch(base+'/stats')).json();
const contexts=[],errors=[];
async function join(profile,seat){
 const ctx=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});contexts.push(ctx);
 await ctx.addInitScript(p=>localStorage.setItem('profile',p),profile);const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?pin='+pin);await page.waitForFunction(s=>document.getElementById('player').textContent===s,'PLAYER '+seat);return page;
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let n=0;n<160;n++){if(await fn())return;await pause(100)}assert.fail('Duel state timeout')}
try{
 const guestBefore=await readFile('profiles/campaign-guest-q2.sav','utf8');
 const p=await join('campaign-probe-q2',1),guest=await join('campaign-guest-q2',2);
 await p.locator('#careerButton').tap();await p.locator('#careerSheet').waitFor({state:'visible'});
 await until(async()=>(await stats()).slots[0].career.campaign.finale===1);
 let s=await stats();assert.equal(s.slots[0].career.eventType,'ELIMINATION');assert.equal(s.slots[0].career.laps,0);
 assert.match(await p.locator('#careerCourse').textContent(),/DEATH DUEL/);
 assert.match(await p.locator('#campaignTotals').textContent(),/Bulwark.*seized|seized.*Bulwark/i);
 assert.equal(await p.locator('#careerCar').isDisabled(),true);
 await until(async()=>(await stats()).audio.lastNarration==='voice.announcer.seizure');
 const seizureAudio=(await stats()).audio;
 assert.equal(seizureAudio.musicMode,'none','Owner no-music mode reaches the native runtime');
 assert.equal(seizureAudio.missing,0,'Intentional silence is distinct from missing audio');
 assert.equal(seizureAudio.lastNarrationPlayed,true,'Seizure narration reaches native playback');
 await p.screenshot({path:output+'/seizure.png'});
 await p.locator('#careerStart').tap();await until(async()=>(await stats()).phase==='race');
 s=await stats();assert.equal(s.eventType,'ELIMINATION');assert.equal(s.slots[0].combat.ability.id,'mine-dispatcher');
 await until(async()=>(await stats()).audio.lastNarration==='voice.announcer.duel');
 const duelAudio=(await stats()).audio;
 assert.equal(duelAudio.lastNarrationPlayed,true,'Elimination narration reaches native playback');
 assert.equal(duelAudio.musicMode,'none');assert.ok(duelAudio.intentionalSilence>0);
 assert.ok(duelAudio.played>0);assert.ok(duelAudio.highWater<=duelAudio.cap);
 assert.equal(s.slots[1].combat.spectating,true);assert.equal(await p.locator('#lapLabel').textContent(),'DUEL');
 // Ordinary touch acceleration. Automatic ability needs no ability press.
 const cdp=await contexts[0].newCDPSession(p);const box=await p.locator('#gas').boundingBox();assert.ok(box);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2,y:box.y+box.height/2}]});
 await until(async()=>(await stats()).slots[0].combat.ability.uses>0);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await p.screenshot({path:output+'/dispatcher.png'});await guest.screenshot({path:output+'/spectator.png'});
 await p.locator('#leave').tap();await until(async()=>['lobby','results'].includes((await stats()).phase));
 assert.equal(await readFile('profiles/campaign-guest-q2.sav','utf8'),guestBefore,'Spectator earns no ticket and consumes no packed item');
 await p.locator('#careerButton').tap();await until(async()=>(await stats()).phase==='career');
 s=await stats();assert.equal(s.slots[0].career.campaign.finale,1);assert.equal(s.slots[0].career.round,35);
 assert.deepEqual(errors,[]);
 await writeFile(output+'/result.json',JSON.stringify({fixture:'Funded final-event profile; actual P1/P2 browser inputs, no claimed earned progression',checks:['seizure names actual collateral and reaches audio','death duel reaches no-laps narration','no lap target','rig override','automatic dispatcher with normal touch','P2 spectator profile unchanged','abandon permits same supplied retry'],state:s,seizureAudio,duelAudio,errors},null,2));
 console.log('Death duel seizure, dispatch, spectator and retry PASS');
}catch(e){await contexts[0]?.pages()[0]?.screenshot({path:output+'/failure.png'}).catch(()=>{});throw e}finally{await browser.close()}
