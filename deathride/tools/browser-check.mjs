import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.argv[2]||'http://127.0.0.1:8765',pin=process.argv[3];
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});const errors=[];
const contexts=await Promise.all([0,1].map(()=>browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true,deviceScaleFactor:1})));
const pages=await Promise.all(contexts.map(c=>c.newPage()));
for(const p of pages)p.on('pageerror',e=>errors.push(e.message));
for(const [i,p] of pages.entries()){await p.goto(base+'/?pin='+pin+(i===0?'&layout=Classic':''));await p.waitForFunction(()=>document.getElementById('player').textContent.startsWith('PLAYER'))}
const stats=async()=>await(await fetch(base+'/stats')).json();assert.equal((await stats()).slots.filter(s=>s.connected).length,2);
const p=pages[0],cdp=await contexts[0].newCDPSession(p);
await p.screenshot({path:process.env.BROWSER_SCREENSHOT||'../evidence/controller.png'});
await p.locator('#settings').tap();await p.locator('#feelChoice').selectOption('Loose');await p.waitForTimeout(300);assert.equal((await stats()).feel.id,'Loose');await p.locator('#closeFeel').tap();
const box=async id=>await p.locator('#'+id).boundingBox();let steer=await box('steer'),gas=await box('gas');
const steerPoint={x:Math.round(steer.x+steer.width*.75),y:Math.round(steer.y+steer.height*.5),id:1,radiusX:8,radiusY:8};
const gasPoint={x:Math.round(gas.x+gas.width*.5),y:Math.round(gas.y+gas.height*.5),id:2,radiusX:8,radiusY:8};
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...steerPoint,x:Math.round(steer.x+steer.width*.5)},gasPoint]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[steerPoint,gasPoint]});await p.waitForTimeout(350);
let st=await stats();assert.equal(st.slots[0].effectiveThrottle,1);assert.ok(st.slots[0].effectiveSteer>.3,'steer and throttle together');
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[steerPoint]});await p.waitForTimeout(130);st=await stats();assert.equal(st.slots[0].effectiveThrottle,1);assert.equal(st.slots[0].effectiveSteer,0);
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(100);assert.equal((await stats()).slots[0].effectiveThrottle,0);

// ---- Drive layout (left pad: X steer / UP go / DOWN brake; right hand: DRIFT FIRE MINE SWAP ABILITY) ----
await p.evaluate(()=>{const send=WebSocket.prototype.send;window.__sent=0;WebSocket.prototype.send=function(d){window.__sent++;return send.call(this,d)}});const sentCount=()=>p.evaluate(()=>window.__sent);
assert.equal((await stats()).slots[1].layout,'Drive','Drive is the default layout');
await p.locator('#settings').tap();await p.locator('#layoutChoice').selectOption('Drive');await p.locator('#closeFeel').tap();await p.waitForTimeout(250);assert.equal((await stats()).slots[0].layout,'Drive');
const catalog=await (await fetch(base+'/catalog')).json(),loose=catalog.feelProfiles.find(x=>x.id==='Loose'),drive=catalog.layouts.find(x=>x.id==='Drive');
const padBox=await box('steer');const travel=Math.min(loose.touchTravelPx,padBox.width*loose.touchTravelFraction);
const tp=(x,y,id)=>({x:Math.round(x),y:Math.round(y),id,radiusX:8,radiusY:8});const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
const ax=padBox.x+padBox.width/2,ay=padBox.y+padBox.height/2;const settle=()=>p.waitForTimeout(220);
await touch('touchStart',[tp(ax,ay,1)]);await settle();st=await stats();assert.equal(st.slots[0].effectiveThrottle,0);assert.equal(st.slots[0].effectiveBrake,0);assert.equal(st.slots[0].effectiveSteer,0);
const driveNumbers={padWidthPx:Math.round(padBox.width),looseTravelPx:travel};
await touch('touchMove',[tp(ax,ay-drive.throttleTravelPx,1)]);await settle();st=await stats();assert.ok(st.slots[0].effectiveThrottle>=.99,'pad UP is full GO');assert.equal(st.slots[0].effectiveBrake,0);
await touch('touchMove',[tp(ax,ay-49,1)]);await settle();st=await stats();driveNumbers.up49=st.slots[0].effectiveThrottle;assert.ok(Math.abs(st.slots[0].effectiveThrottle-.5)<.06,'analog GO ~0.5 at 49 px: '+st.slots[0].effectiveThrottle);
await touch('touchMove',[tp(ax,ay+drive.brakeTravelPx+10,1)]);await settle();st=await stats();assert.equal(st.slots[0].effectiveBrake,1,'pad DOWN is full BRAKE');assert.equal(st.slots[0].effectiveThrottle,0);
await touch('touchMove',[tp(ax,ay+30,1)]);await settle();st=await stats();driveNumbers.down30=st.slots[0].effectiveBrake;assert.ok(st.slots[0].effectiveBrake>.3&&st.slots[0].effectiveBrake<.4,'analog BRAKE at 30 px');
await touch('touchMove',[tp(ax+24,ay,1)]);await settle();st=await stats();driveNumbers.right24=st.slots[0].effectiveSteer;assert.ok(Math.abs(st.slots[0].effectiveSteer-24/travel)<.03,'steer at doubled sensitivity '+st.slots[0].effectiveSteer);assert.equal(st.slots[0].effectiveThrottle,0);assert.equal(st.slots[0].effectiveBrake,0);
await touch('touchMove',[tp(ax-travel-30,ay,1)]);await settle();assert.equal((await stats()).slots[0].effectiveSteer,-1);
await touch('touchMove',[tp(ax+30,ay-60,1)]);await settle();st=await stats();assert.ok(st.slots[0].effectiveSteer>.4&&st.slots[0].effectiveThrottle>.5,'diagonal combines steer + GO');
await touch('touchEnd',[tp(ax+30,ay-60,1)]);await settle();st=await stats();assert.deepEqual([st.slots[0].effectiveSteer,st.slots[0].effectiveThrottle,st.slots[0].effectiveBrake],[0,0,0],'release returns to coast');
await p.screenshot({path:process.env.BROWSER_DRIVE_SCREENSHOT||'../evidence/controller-drive.png'});
// Pad held + DRIFT + FIRE + MINE all at once (3 and 4 simultaneous touches).
const centre=async id=>{const b=await box(id);return{x:b.x+b.width/2,y:b.y+b.height/2}};
const padHeld=tp(ax+20,ay-80,1),dr=await centre('drift'),fi=await centre('fire'),mi=await centre('mine');const drift=tp(dr.x,dr.y,2),fire=tp(fi.x,fi.y,3),mine=tp(mi.x,mi.y,4);
await touch('touchStart',[tp(ax,ay,1)]);await touch('touchMove',[padHeld]);await settle();
await touch('touchStart',[padHeld,drift]);await settle();st=await stats();assert.equal(st.slots[0].effectiveDrift,1,'DRIFT with pad held (2 touches)');assert.ok(st.slots[0].effectiveThrottle>.8);assert.ok(st.slots[0].effectiveSteer>.3);
await touch('touchStart',[padHeld,drift,fire]);await settle();st=await stats();assert.equal(st.slots[0].effectiveDrift,1);assert.equal(st.slots[0].effectiveFire,1,'FIRE with pad + DRIFT held (3 touches)');assert.ok(st.slots[0].effectiveThrottle>.8);assert.ok(st.slots[0].effectiveSteer>.3);
await touch('touchStart',[padHeld,drift,fire,mine]);await settle();st=await stats();assert.equal(st.slots[0].effectiveMine,1,'MINE as the fourth touch');assert.equal(st.slots[0].effectiveFire,1);assert.equal(st.slots[0].effectiveDrift,1);
await touch('touchEnd',[drift]);await settle();st=await stats();assert.equal(st.slots[0].effectiveDrift,0,'DRIFT releases alone');assert.equal(st.slots[0].effectiveFire,1);assert.equal(st.slots[0].effectiveMine,1);assert.ok(st.slots[0].effectiveThrottle>.8);
await touch('touchEnd',[]);await settle();st=await stats();assert.deepEqual([st.slots[0].effectiveFire,st.slots[0].effectiveMine,st.slots[0].effectiveDrift,st.slots[0].effectiveThrottle,st.slots[0].effectiveSteer],[0,0,0,0,0]);
// Geometry: pad on the left half, every right-hand control >= 72 px, no overlaps, FIRE and DRIFT largest.
const ids=['steer','drift','fire','mine','swap','ability'],g={};for(const id of ids)g[id]=await box(id);
for(const id of ['drift','fire','mine','swap','ability'])assert.ok(g[id].width>=72&&g[id].height>=72,id+' is at least 72 px: '+JSON.stringify(g[id]));
assert.ok(g.steer.x+g.steer.width<=g.fire.x+1&&g.steer.x+g.steer.width<=g.drift.x+1,'pad owns the left half');
for(const i of ids)for(const j of ids)if(i<j){const a=g[i],b=g[j];assert.ok(a.x+a.width<=b.x+.5||b.x+b.width<=a.x+.5||a.y+a.height<=b.y+.5||b.y+b.height<=a.y+.5,i+' overlaps '+j)}
const area=id=>g[id].width*g[id].height;assert.ok(area('fire')>area('mine')&&area('fire')>area('swap')&&area('fire')>area('ability')&&area('drift')>area('mine')&&area('drift')>area('swap')&&area('drift')>area('ability'),'FIRE and DRIFT are the largest');
assert.equal(await p.locator('#gas').isVisible(),false);assert.equal(await p.locator('#brake').isVisible(),false);
// Uplink rate: 250 Hz of pointermoves must not become 250 packets/s.
const countBefore=await sentCount(),t0=Date.now();await touch('touchStart',[tp(ax,ay,1)]);for(let i=0;i<125;i++){await touch('touchMove',[tp(ax+(i%2?5:-5),ay-i%60,1)]);await p.waitForTimeout(4)}const secs=(Date.now()-t0)/1000;await touch('touchEnd',[]);
driveNumbers.packetsPerSecondAt250HzMoves=Math.round(((await sentCount())-countBefore)/secs);assert.ok(driveNumbers.packetsPerSecondAt250HzMoves<=100,'uplink capped: '+driveNumbers.packetsPerSecondAt250HzMoves);
await p.waitForTimeout(100);
// Mirror still works for Drive.
await p.locator('#settings').tap();await p.locator('#mirrorChoice').check();await p.locator('#closeFeel').tap();await p.waitForTimeout(200);assert.ok((await box('steer')).x>(await box('fire')).x,'Drive mirrored: pad on the right');
await p.locator('#settings').tap();await p.locator('#mirrorChoice').uncheck();await p.locator('#closeFeel').tap();
await p.locator('#settings').tap();await p.locator('#layoutChoice').selectOption('Classic');await p.locator('#closeFeel').tap();await p.waitForTimeout(250);
console.log(JSON.stringify(driveNumbers));
const oldToken=await p.evaluate(()=>localStorage.getItem('token'));await p.reload();await p.waitForFunction(()=>document.getElementById('player').textContent==='PLAYER 1');assert.equal(await p.evaluate(()=>localStorage.getItem('token')),oldToken);
await p.locator('#race').tap();await p.waitForTimeout(3200);assert.equal((await stats()).phase,'race');
await p.locator('#settings').tap();const before=(await stats()).flashFrames;await p.locator('#flash').dispatchEvent('pointerdown',{pointerId:8});assert.equal(await p.locator('#flashscreen').evaluate(e=>e.classList.contains('on')),true);await p.waitForTimeout(150);assert.equal((await stats()).flashFrames,before+1);await p.locator('#closeFeel').tap();
await p.locator('#leave').tap();await p.waitForTimeout(150);assert.equal((await stats()).phase,'lobby');assert.deepEqual(errors,[]);
const result={driveNumbers,browser:'Chromium headless, 896 x 414, mobile touch emulation; not a physical phone',checks:['two browser contexts pair','simultaneous steer + throttle via CDP touch','release steer holds gas','release gas clears throttle','Drive default; pad UP analog GO; pad DOWN analog BRAKE; steer at doubled sensitivity; diagonal; release coasts','pad held + DRIFT + FIRE + MINE register together (3 and 4 touches); DRIFT releases alone','Drive geometry: pad left, right-hand controls >=72 px, no overlaps, FIRE/DRIFT largest; mirror','uplink capped at 250 Hz of moves','reload reclaims original car','start/countdown/race','phone white and one TV flash','lobby command','zero page exceptions'],capabilities:await p.evaluate(()=>({secureContext:isSecureContext,wakeLock:'wakeLock'in navigator,fullscreen:!!document.fullscreenEnabled})),errors};
await writeFile(process.env.BROWSER_OUTPUT||'../evidence/browser-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
