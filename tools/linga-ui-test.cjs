/** Real-model integration test (E1-E9 of docs/LINGA-COMPETITIVE-SCOPE.md section 3). Run only against an isolated server.
 *
 * HOW TO RUN (a live-model run; never part of a gate):
 *   1. An isolated desk: a fresh directory seeded with a pairing.json, NEVER desk/data/ (real learners). The key in it is
 *      the desk's TV key: {"key":"<any long random string>"} (copy the shape the desk writes on its first start).
 *   2. Start the desk on its own port with that directory: DESK_DATA_DIR=<dir> next dev --webpack -p 3217 (in a worktree
 *      whose node_modules is a junction, turbopack refuses it, so --webpack). The `claude` CLI must be on PATH and signed in.
 *   3. LINGA_TEST_ALLOW_WRITES=1 LINGA_TEST_URL=http://localhost:3217 DESK_DATA_DIR=<the same dir> node tools/linga-ui-test.cjs
 *      Env vars: LINGA_TEST_ALLOW_WRITES=1 (required), DESK_DATA_DIR (required, the server's), LINGA_TEST_URL (default
 *      http://localhost:3217), LINGA_TEST_RESUME=1 (carry on a rover conversation that has one turn instead of starting).
 *   Playwright comes from tools/ (tools/package.json). Output: artifacts/linga-integration/{timings,results}.json + shots.
 *
 * The TV is the browser holding the desk's key: the test reads it from DESK_DATA_DIR/pairing.json, opens /tv?key= as the
 * TV, and pairs the phone the way a phone pairs - the QR's ?pin=.
 * Speech callbacks below are simulated; this does not test a physical microphone or ASR quality.
 *
 * TIMING (E8), per command: ms (click to the response), modelMs (the engine's own responseMs), sendToLineMs (click to the
 * TV showing a changed partner line) and lineToVoiceMs (from that line to the TV footer reading "<partner> speaking").
 * "Voice" here means that FOOTER EVENT, not heard audio: it is set when the audio element starts playing or the browser's
 * synthesis starts speaking (desk/src/english/useEnglishAudio.ts:20,26). A headless browser may never get there (no
 * server voice, no synthesis voice): after 15 s lineToVoiceMs is null and voiceStatus holds the last footer text seen.
 * Voice never fails the run. The TV's Voice toggle (default on) and the autoplay policy are what let it play.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
if(process.env.LINGA_TEST_ALLOW_WRITES!=='1')throw new Error('Use an isolated server, then set LINGA_TEST_ALLOW_WRITES=1.');
const base=process.env.LINGA_TEST_URL||'http://localhost:3217';
if(!process.env.DESK_DATA_DIR)throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server: the test opens the TV with the key the desk keeps there.');
const key=JSON.parse(fs.readFileSync(path.join(process.env.DESK_DATA_DIR,'pairing.json'),'utf8')).key;
/** The TV's cookie, for the calls this script makes as the TV (the desk answers a cookieless call as a guest). */
let tvCookie='';
async function asTheTV(){const r=await fetch(base+'/tv?key='+encodeURIComponent(key),{redirect:'manual'});tvCookie=(r.headers.getSetCookie?.()??[]).map(c=>c.split(';')[0]).filter(c=>c.startsWith('desk-tv=')).join('; ');assert.ok(tvCookie,'the desk took its key');}
const json=(b)=>({method:'POST',headers:{'Content-Type':'application/json',cookie:tvCookie},body:JSON.stringify(b)});
const out=path.resolve(__dirname,'../artifacts/linga-integration');fs.mkdirSync(out,{recursive:true});
const timings=[],errors=[],moments=[];
const SCENE='The missing moon rover',SAID='[data-role="linga-said"] .lo-card-text',STATUS='.linga-footer .lo-status',VOICE_WAIT=15000,LINE_WAIT=120000;
let tvPage;
async function event(b){const r=await fetch(base+'/api/session',json(b));assert.equal(r.status,200);return r.json();}
async function current(){return(await fetch(base+'/api/session',{headers:{cookie:tvCookie}})).json();}
const saveTimings=()=>fs.writeFileSync(path.join(out,'timings.json'),JSON.stringify(timings,null,2));
const lineText=()=>tvPage.evaluate(sel=>document.querySelector(sel)?.textContent??'',SAID);
/** From the click: when does the TV show a changed partner line, and then when does its footer say "<partner> speaking"? Never throws. */
async function watchLine(before,t0){
 const r={sendToLineMs:null,lineToVoiceMs:null,voiceStatus:null,reason:null};
 try{await tvPage.waitForFunction(([sel,was])=>{const t=document.querySelector(sel)?.textContent??'';return t!==''&&t!==was;},[SAID,before],{timeout:LINE_WAIT,polling:25});r.sendToLineMs=Date.now()-t0;}
 catch{r.reason='the partner line did not change within '+LINE_WAIT/1000+' s';return r;}
 const t1=Date.now();
 try{await tvPage.waitForFunction(sel=>{const t=document.querySelector(sel)?.textContent??'';window.__lingaVoiceSeen=t||window.__lingaVoiceSeen||'';return /\sspeaking$/.test(t);},STATUS,{timeout:VOICE_WAIT,polling:25});r.lineToVoiceMs=Date.now()-t1;}
 catch{r.reason='no "<partner> speaking" in the footer within '+VOICE_WAIT/1000+' s (headless: no server voice or no synthesis voice, or blocked)';}
 r.voiceStatus=await tvPage.evaluate(sel=>document.querySelector(sel)?.textContent||window.__lingaVoiceSeen||'',STATUS).catch(()=>null);
 return r;
}
/** Click, wait for the POST, time it. expectLine: this command should give the TV a new partner line (else both line timings are null, with a reason).
 * match: an extra check on the POST body. A 502 is retried once through the page's own request, as before. */
async function waitCommand(page,fn,label,{expectLine=true,noLine='this command gives no new partner line',match=()=>true}={}){
 const before=expectLine?await lineText():'';
 const t=Date.now();const response=page.waitForResponse(r=>r.url()===base+'/api/english'&&r.request().method()==='POST'&&r.request().postDataJSON().action===label&&match(r.request().postDataJSON()),{timeout:240000});
 await fn();const line=expectLine?watchLine(before,t):Promise.resolve({sendToLineMs:null,lineToVoiceMs:null,voiceStatus:null,reason:noLine});
 let r=await response;let j=await r.json();const initialStatus=r.status();const ms=Date.now()-t;
 if(initialStatus===502){const body=r.request().postDataJSON();r=await page.request.post(base+'/api/english',{data:body,timeout:240000});j=await r.json();}
 const l=await line;
 timings.push({action:label,ms,initialStatus,status:r.status(),modelMs:j.conversation?.responseMs,sendToLineMs:l.sendToLineMs,lineToVoiceMs:l.lineToVoiceMs,voiceStatus:l.voiceStatus,...(l.reason?{reason:l.reason}:{})});saveTimings();
 assert.equal(r.status(),200,JSON.stringify(j));return j;
}
/** After a reply: did the model raise a moment? If so take it and go back with the button; if not, record that. Never fails on either. */
async function takeMoment(phone,after){
 const m=(await current()).conversation?.moment;
 if(!m){moments.push({after,fired:false});return;}
 moments.push({after,fired:true,kind:m.kind,said:m.said,better:m.better,why:m.why});
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Back to the conversation',exact:true}).click(),'moment-done',{expectLine:false,noLine:'taking a moment gives no new partner line'});
}
const num=a=>a.filter(x=>typeof x==='number'&&Number.isFinite(x));
const stat=a=>{const v=num(a).sort((x,y)=>x-y);return v.length?{n:v.length,median:v.length%2?v[(v.length-1)/2]:Math.round((v[v.length/2-1]+v[v.length/2])/2),max:v.at(-1)}:{n:0,median:null,max:null};};
(async()=>{
 await asTheTV();
 const existing=await current();
 const reuse=process.env.LINGA_TEST_RESUME==='1'&&existing.learner.id==='linga-browser-child'&&existing.conversation?.sceneId==='rover'&&existing.conversation.turns.length===1&&!existing.conversation.pending;
 if(!reuse){
 // E2: an 11-year-old elementary learner; moments on ('as-needed'; 'pauses' turns them off, conversation.ts:83)
 await event({type:'profile.draft',patch:{id:'linga-browser-child',name:'Mia',type:'elementary',age:11,modules:['english','maths','essay']}});await event({type:'profile.save'});
 const prefs={level:'A1',interest:'space',goal:'Ask for clues',creativity:'playful',challenge:'supportive',correction:'as-needed',adultConfirmed:false};
 let r=await fetch(base+'/api/english',json({action:'preferences',learnerId:'linga-browser-child',preferences:prefs,notes:['Give me one short question at a time.']}));assert.equal(r.status,200);
 r=await fetch(base+'/api/english',json({action:'start',learnerId:'linga-browser-child',sceneId:'date',commandId:'forbidden-date'}));assert.equal(r.status,403);
 }
 const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});try{
 const tv=await browser.newPage({viewport:{width:1920,height:1150}}),phone=await browser.newPage({viewport:{width:390,height:844}});tvPage=tv;
 for(const page of [tv,phone])page.on('pageerror',e=>errors.push(e.message));
 await phone.addInitScript(()=>{class FakeRecognition{start(){setTimeout(()=>this.onresult?.({results:[{isFinal:true,0:{transcript:'Could you tell me which bridge you mean, please?'}}]}),60);}stop(){this.onend?.();}abort(){this.onend?.();}}window.SpeechRecognition=FakeRecognition;});
 // the phone pairs first, as it would from the Pair screen's QR: a join takes the TV to its confirmation, so the desk is walked back to the landing after it
 await phone.goto(base+'/phone?pin='+(await current()).pin);await phone.waitForFunction(async()=>(await(await fetch('/api/session')).json()).viewer==='phone');
 // the phone's cookie is set before its join event lands; a nav sent in between is overwritten by the join (store.ts:507-508), so wait for the join itself
 for(let i=0;i<200&&!(await current()).joined;i++)await new Promise(r=>setTimeout(r,50));assert.ok((await current()).joined,'the phone joined');
 await event({type:'nav',screen:'landing',focus:1});
 await tv.goto(base+'/tv?key='+encodeURIComponent(key));await tv.waitForSelector('[data-role="desk-object"]');await tv.locator('.stage').click({position:{x:20,y:20}});await tv.keyboard.press('Enter');await tv.waitForSelector('.linga-tv');assert.equal((await current()).subject,'english');
 await phone.waitForSelector('.linga-phone');
 // the TV may speak only with its Voice toggle on (app/tv/page.tsx:145, default on) and after a gesture (the clicks above; the launch flag covers the rest)
 assert.equal(await tv.getByRole('button',{name:'Voice',exact:true}).getAttribute('aria-pressed'),'true');
 if(reuse)await waitCommand(tv,()=>tv.getByRole('button',{name:'Carry on talking',exact:true}).click(),'resume',{expectLine:false,noLine:'resume shows the line already there'});
 else{
 // E2: a learner with no placement is offered the level check, not a scene
 await tv.getByRole('button',{name:'Find my level',exact:true}).waitFor();await tv.getByRole('button',{name:"I'll pick my level",exact:true}).waitFor();
 assert.equal(await tv.getByRole('button',{name:'Start talking',exact:true}).count(),0);assert.equal((await current()).englishLearning.placement??null,null);
 // seat the level as a parent would: pick, move to A2, 'This is my level'
 await tv.getByRole('button',{name:"I'll pick my level",exact:true}).click();
 const band=()=>tv.locator('[data-role="linga-title"]').first().textContent();
 for(let i=0;i<8&&!(await band()).startsWith('A2');i++){const was=await band();await tv.getByRole('button',{name:(was.startsWith('A1')?'Higher':'Lower'),exact:true}).click();await tv.waitForFunction(w=>document.querySelector('[data-role="linga-title"]')?.textContent!==w,was);}
 assert.ok((await band()).startsWith('A2'),'the picker reached A2');
 await waitCommand(tv,()=>tv.getByRole('button',{name:'This is my level',exact:true}).click(),'level-self',{expectLine:false,noLine:'seating a level gives no partner line',match:b=>b.band==='A2'});
 assert.equal((await current()).englishLearning.placement.band,'A2');
 // 'Back to Linga' is not on the verdict, so the TV goes home the way its own nav does, then E3
 await event({type:'nav',screen:'linga',focus:0});
 await tv.getByRole('button',{name:'Choose a situation',exact:true}).click();
 for(let i=0;i<12&&(await tv.locator('[data-role="linga-title"]').first().textContent())!==SCENE;i++){const was=await tv.locator('[data-role="linga-title"]').first().textContent();await tv.getByRole('button',{name:'Next situation',exact:true}).click();await tv.waitForFunction(w=>document.querySelector('[data-role="linga-title"]')?.textContent!==w,was);}
 assert.equal(await tv.locator('[data-role="linga-title"]').first().textContent(),SCENE);
 await waitCommand(tv,()=>tv.getByRole('button',{name:'Start this situation',exact:true}).click(),'start',{match:b=>b.sceneId==='rover'});
 }
 await tv.waitForSelector('.linga-speaker');
 // E4: a typed reply
 await phone.getByLabel('Your reply',{exact:true}).fill('Where is the rover?');
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Send reply',exact:true}).click(),'turn');
 let s=await current();assert.equal(s.conversation.turns.at(-2).mode,'text');
 await takeMoment(phone,'typed reply');
 await tv.locator('.stage').click({position:{x:10,y:10}});await tv.keyboard.press('m');await tv.waitForSelector('.linga-menu-list');await tv.keyboard.press('Escape');
 await phone.getByRole('button',{name:'Choose a phrase',exact:true}).click();await tv.waitForSelector('.linga-choices');await phone.getByRole('button',{name:'Which bridge do you mean?',exact:true}).click();
 await phone.waitForFunction(async()=>(await(await fetch('/api/session')).json()).englishLearning.evidence.some(e=>e.mode==='choice'));
 s=await current();assert.ok(s.englishLearning.evidence.some(e=>e.mode==='choice'&&e.quote==='Which bridge do you mean?'));assert.ok(s.englishLearning.evidence.filter(e=>e.id.endsWith(':choice')).every(e=>e.mode==='choice'));
 // E4: a spoken reply (simulated recognition): capture, review the words (tick pre-checked), one tap to send
 await phone.getByRole('button',{name:'Speak a reply',exact:true}).click();await phone.getByRole('button',{name:'Stop & review',exact:true}).waitFor();
 await phone.waitForFunction(()=>document.querySelector('.linga-phone textarea')?.value.includes('which bridge'));
 await phone.getByRole('button',{name:'Stop & review',exact:true}).click();await phone.getByLabel('These are the words I said.',{exact:true}).waitFor();assert.equal(await phone.getByLabel('These are the words I said.',{exact:true}).isChecked(),true,'the tick is pre-checked after Stop');
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Send reply',exact:true}).click(),'turn');s=await current();assert.equal(s.conversation.turns.at(-2).mode,'speech');assert.equal(s.conversation.turns.at(-2).supported,true);
 await takeMoment(phone,'spoken reply');
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Pause & coach',exact:true}).click(),'coach',{expectLine:false,noLine:'a coaching note is not a partner line'});await tv.waitForSelector('.linga-comparison');await tv.screenshot({path:path.join(out,'tv-coach.png')});
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Replay with a new question',exact:true}).click(),'replay');await tv.waitForSelector('.linga-speaker');
 await phone.screenshot({path:path.join(out,'phone-replay.png')});await tv.screenshot({path:path.join(out,'tv-replay.png')});
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Finish rehearsal',exact:true}).click(),'finish',{expectLine:false,noLine:'finishing ends the scene: no new partner line'});await tv.waitForSelector('.linga-track');
 await phone.getByRole('button',{name:'My map',exact:true}).click();assert.equal(await phone.locator('.linga-skill').count(),8);
 const print=await phone.context().newPage();await print.goto(base+'/english/print?learner=linga-browser-child');await print.waitForSelector('.linga-print table');assert.equal(await print.locator('tbody tr').count(),8);await print.pdf({path:path.join(out,'learning-map.pdf'),format:'A4',preferCSSPageSize:true});
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await event({type:'nav',screen:'landing',focus:0});await tv.waitForSelector('[data-role="desk-object"]');await tv.keyboard.press('Enter');await tv.waitForFunction(()=>!document.querySelector('.linga-tv'));assert.equal((await current()).subject,'maths');
 await event({type:'nav',screen:'landing',focus:2});await tv.waitForSelector('[data-role="desk-object"]');await tv.keyboard.press('Enter');await tv.waitForFunction(async()=>{const s=await(await fetch('/api/session')).json();return s.screen==='essaytype';});assert.equal((await current()).subject,'essay');
 assert.deepEqual(errors,[]);
 const turnTiming={ms:stat(timings.map(t=>t.ms)),sendToLineMs:stat(timings.map(t=>t.sendToLineMs)),modelMs:stat(timings.map(t=>t.modelMs)),lineToVoiceMs:stat(timings.map(t=>t.lineToVoiceMs))};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({timings,turnTiming,moments,errors,checks:['E2 level: no placement offers the level check, not a scene; A2 seated with level-self through the UI','E3 scene: Choose a situation, The missing moon rover, started','E4 real model: typed and spoken replies; typed turn stored as text, spoken as speech and supported','E4 moments: taken with Back to the conversation if one fired, recorded either way','picked phrase stored as choice evidence','real model: coach, replay, finish','MH-4 one tap: tick pre-checked after Stop, spoken reply sent with one tap','simulated speech: capture, transcript confirmation, supported modality','E8 turn timing: ms, modelMs, sendToLineMs, lineToVoiceMs (the footer event, not heard audio)','E9 age-restricted API rejected (403)','TV/phone session sync','D-pad entry/menu/back','eight-chapter actual evidence print','mobile width','Math and Essay entrances'],speechLimit:'Recognition events are simulated; no physical microphone or room audio tested. Voice is the TV footer event, not heard audio.'},null,2));
 console.log(JSON.stringify({passed:true,timings,turnTiming,moments,errors,artifacts:out}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
