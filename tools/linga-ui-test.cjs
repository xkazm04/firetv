/** Real-model integration test. Run only against an isolated server/data directory.
 * LINGA_TEST_ALLOW_WRITES=1 LINGA_TEST_URL=http://localhost:3217 DESK_DATA_DIR=<the server's data dir> node tools/linga-ui-test.cjs
 * The TV is the browser holding the desk's key: the test reads it from the server's DESK_DATA_DIR/pairing.json,
 * opens /tv?key= as the TV, and pairs the phone the way a phone pairs - the QR's ?pin=.
 * Speech callbacks below are simulated; this does not test a physical microphone or ASR quality.
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
const timings=[],errors=[];
async function event(b){const r=await fetch(base+'/api/session',json(b));assert.equal(r.status,200);return r.json();}
async function current(){return(await fetch(base+'/api/session',{headers:{cookie:tvCookie}})).json();}
async function waitCommand(page,fn,label){const t=Date.now();const response=page.waitForResponse(r=>r.url()===base+'/api/english'&&r.request().method()==='POST'&&r.request().postDataJSON().action===label,{timeout:75000});await fn();let r=await response;let j=await r.json();const initialStatus=r.status();if(initialStatus===502){const body=r.request().postDataJSON();r=await page.request.post(base+'/api/english',{data:body,timeout:75000});j=await r.json();}timings.push({action:label,ms:Date.now()-t,initialStatus,status:r.status(),modelMs:j.conversation?.responseMs});fs.writeFileSync(path.join(out,'timings.json'),JSON.stringify(timings,null,2));assert.equal(r.status(),200,JSON.stringify(j));return j;}
(async()=>{
 await asTheTV();
 const existing=await current();
 const reuse=process.env.LINGA_TEST_RESUME==='1'&&existing.learner.id==='linga-browser-child'&&existing.conversation?.sceneId==='rover'&&existing.conversation.turns.length===1&&!existing.conversation.pending;
 if(!reuse){
 await event({type:'profile.draft',patch:{id:'linga-browser-child',name:'Mia',type:'elementary',age:8,modules:['english','maths','essay']}});await event({type:'profile.save'});
 const prefs={level:'beginner',interest:'space',goal:'Ask for clues',creativity:'playful',challenge:'supportive',correction:'pauses',adultConfirmed:false};
 let r=await fetch(base+'/api/english',json({action:'preferences',learnerId:'linga-browser-child',preferences:prefs,notes:['Give me one short question at a time.']}));assert.equal(r.status,200);
 r=await fetch(base+'/api/english',json({action:'start',learnerId:'linga-browser-child',sceneId:'date',commandId:'forbidden-date'}));assert.equal(r.status,403);
 }
 const browser=await chromium.launch({headless:true});try{
 const tv=await browser.newPage({viewport:{width:1920,height:1150}}),phone=await browser.newPage({viewport:{width:390,height:844}});
 for(const page of [tv,phone])page.on('pageerror',e=>errors.push(e.message));
 await phone.addInitScript(()=>{class FakeRecognition{start(){setTimeout(()=>this.onresult?.({results:[{isFinal:true,0:{transcript:'Could you tell me which bridge you mean, please?'}}]}),60);}stop(){this.onend?.();}abort(){this.onend?.();}}window.SpeechRecognition=FakeRecognition;});
 // the phone pairs first, as it would from the Pair screen's QR: a join takes the TV to its confirmation, so the desk is walked back to the landing after it
 await phone.goto(base+'/phone?pin='+(await current()).pin);await phone.waitForFunction(async()=>(await(await fetch('/api/session')).json()).viewer==='phone');
 await event({type:'nav',screen:'landing',focus:1});
 await tv.goto(base+'/tv?key='+encodeURIComponent(key));await tv.waitForSelector('[data-role="desk-object"]');await tv.locator('.stage').click({position:{x:20,y:20}});await tv.keyboard.press('Enter');await tv.waitForSelector('.linga-tv');assert.equal((await current()).subject,'english');
 await phone.waitForSelector('.linga-phone');
 if(reuse)await waitCommand(tv,()=>tv.getByRole('button',{name:'Carry on talking',exact:true}).click(),'resume');else await waitCommand(tv,()=>tv.getByRole('button',{name:'Start talking',exact:true}).click(),'start');await tv.waitForSelector('.linga-speaker');
 await phone.getByLabel('Your reply',{exact:true}).fill('Where is the rover?');
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Send reply',exact:true}).click(),'turn');
 let s=await current();assert.equal(s.conversation.turns.at(-2).mode,'text');assert.equal(s.englishLearning.achievements.repair??'not-tried','not-tried');
 await tv.locator('.stage').click({position:{x:10,y:10}});await tv.keyboard.press('m');await tv.waitForSelector('.linga-menu-list');await tv.keyboard.press('Escape');
 await phone.getByRole('button',{name:'Choose a phrase',exact:true}).click();await tv.waitForSelector('.linga-choices');await phone.getByRole('button',{name:'Which bridge do you mean?',exact:true}).click();
 await phone.getByRole('button',{name:'Speak a reply',exact:true}).click();await phone.getByRole('button',{name:'Stop & review',exact:true}).waitFor();
 await phone.waitForFunction(()=>document.querySelector('.linga-phone textarea')?.value.includes('which bridge'));
 await phone.getByRole('button',{name:'Stop & review',exact:true}).click();await phone.getByText('These are the words I said.',{exact:true}).click();
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Send reply',exact:true}).click(),'turn');s=await current();assert.equal(s.conversation.turns.at(-2).mode,'speech');assert.equal(s.conversation.turns.at(-2).supported,true);assert.notEqual(s.englishLearning.achievements.repair,'independent');
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Pause & coach',exact:true}).click(),'coach');await tv.waitForSelector('.linga-comparison');await tv.screenshot({path:path.join(out,'tv-coach.png')});
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Replay with a new question',exact:true}).click(),'replay');await tv.waitForSelector('.linga-speaker');
 await phone.screenshot({path:path.join(out,'phone-replay.png')});await tv.screenshot({path:path.join(out,'tv-replay.png')});
 await waitCommand(phone,()=>phone.getByRole('button',{name:'Finish rehearsal',exact:true}).click(),'finish');await tv.waitForSelector('.linga-track');
 await phone.getByRole('button',{name:'My map',exact:true}).click();assert.equal(await phone.locator('.linga-skill').count(),8);
 const print=await phone.context().newPage();await print.goto(base+'/english/print?learner=linga-browser-child');await print.waitForSelector('.linga-print table');assert.equal(await print.locator('tbody tr').count(),8);await print.pdf({path:path.join(out,'learning-map.pdf'),format:'A4',preferCSSPageSize:true});
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await event({type:'nav',screen:'landing',focus:0});await tv.waitForSelector('[data-role="desk-object"]');await tv.keyboard.press('Enter');await tv.waitForFunction(()=>!document.querySelector('.linga-tv'));assert.equal((await current()).subject,'maths');
 await event({type:'nav',screen:'landing',focus:2});await tv.waitForSelector('[data-role="desk-object"]');await tv.keyboard.press('Enter');await tv.waitForFunction(async()=>{const s=await(await fetch('/api/session')).json();return s.screen==='essaytype';});assert.equal((await current()).subject,'essay');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({timings,errors,checks:['real model: scene, two replies, coach, replay, finish','simulated speech: capture, transcript confirmation, supported modality','age-restricted API rejected','TV/phone session sync','D-pad entry/menu/back','eight-chapter actual evidence print','mobile width','Math and Essay entrances'],speechLimit:'Recognition events are simulated; no physical microphone or room audio tested.'},null,2));
 console.log(JSON.stringify({passed:true,timings,errors,artifacts:out}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
