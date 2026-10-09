/** One Essay Master writing episode, end to end in the browser with the real model (M5 goal 3, W1-W8). Run only against an isolated server.
 *
 * HOW TO RUN (a live-model run; never part of a gate, never in desk/package.json rulesSuites):
 *   1. An isolated desk: a fresh directory outside every repo, seeded with pairing.json {"key":"<48 hex chars>"}. NEVER desk/data/.
 *   2. Start the desk on its own port with it: DESK_DATA_DIR=<dir> npx next dev --webpack -p 3241 (in desk/), with ANTHROPIC_API_KEY,
 *      CLAUDECODE, CLAUDE_CODE_*, ELEVENLABS_*, PIPER_*, DESK_TEXT_ENGINE, CLAUDE_FAST_MODEL and CLAUDE_BEST_MODEL unset. The
 *      `claude` CLI must be on PATH and signed in. The essay calls ask for model 'best' (sonnet) through the claude CLI.
 *   3. ESSAY_TEST_ALLOW_WRITES=1 DESK_DATA_DIR=<the same dir> [ESSAY_TEST_URL=http://localhost:3241] node tools/essay-ui-test.cjs
 *      Then, after stopping and restarting the server on the same dir and port: ... node tools/essay-ui-test.cjs --reread
 *   Playwright: from tools/node_modules, or set NODE_PATH to a tools/node_modules that has it. Output: artifacts/essay-integration/
 *   (timings.json after every step, results.json last, results-reread.json for --reread, and screenshots).
 *
 * The TV is the browser holding the desk's key; the phone pairs with /phone?pin= in its own browser context. Every wait polls
 * GET /api/session for a change that has not happened yet. Typing and dictation are not simulated beyond filling the textarea;
 * this does not test a physical phone, heard audio or a real keyboard. Nothing here asserts the model's judgement: the
 * verdicts, notes and moves are recorded for a person to read.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
if(process.env.ESSAY_TEST_ALLOW_WRITES!=='1')throw new Error('Use an isolated server, then set ESSAY_TEST_ALLOW_WRITES=1.');
if(!process.env.DESK_DATA_DIR)throw new Error('Set DESK_DATA_DIR to the data directory of the isolated server.');
const data=path.resolve(process.env.DESK_DATA_DIR),real=path.resolve(__dirname,'../desk/data');
if(data===real||data.startsWith(real+path.sep))throw new Error('Refusing to run against desk/data.');
const base=(process.env.ESSAY_TEST_URL||'http://localhost:3241').replace(/\/$/,'');
const reread=process.argv.includes('--reread');
const key=JSON.parse(fs.readFileSync(path.join(data,'pairing.json'),'utf8')).key;
const out=path.resolve(__dirname,'../artifacts/essay-integration');fs.mkdirSync(out,{recursive:true});
const LEARNER={id:'essay-browser-teen',name:'Sam',type:'high-school',age:15,modules:['maths','english','essay']};
const PARAGRAPH="Schools should start later in the morning. During puberty, teenagers' body clocks shift later, so many cannot fall asleep before 11 pm. When Seattle moved its high-school start from 7:50 to 8:45 in 2016, students slept about 34 minutes more each night. Also it is just better and everyone knows it. That is why a later start would help students learn.";
const REWRITE="Also, in the same study, students' grades in their first class of the day went up.";
const WAIT=300000;
let tvCookie='';
async function asTheTV(){const r=await fetch(base+'/tv?key='+encodeURIComponent(key),{redirect:'manual'});tvCookie=(r.headers.getSetCookie?.()??[]).map(c=>c.split(';')[0]).filter(c=>c.startsWith('desk-tv=')).join('; ');assert.ok(tvCookie,'the desk took its key');}
const json=(b)=>({method:'POST',headers:{'Content-Type':'application/json',cookie:tvCookie},body:JSON.stringify(b)});
async function event(b){const r=await fetch(base+'/api/session',json(b));assert.equal(r.status,200,JSON.stringify(b)+' -> '+r.status);return r.json();}
async function current(){return(await fetch(base+'/api/session',{headers:{cookie:tvCookie}})).json();}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/** Poll the session until pred(session) holds; returns {s, ms} from the call. Throws with the last screen on timeout. */
async function until(pred,what,limit=WAIT){const t=Date.now();let s;while(Date.now()-t<limit){s=await current();if(pred(s))return{s,ms:Date.now()-t};await sleep(100);}throw new Error('timed out waiting for '+what+' (screen '+s?.screen+', subject '+s?.subject+')');}
const timings=[],steps={},errors=[];
const saveTimings=()=>fs.writeFileSync(path.join(out,'timings.json'),JSON.stringify(timings,null,2));
const note=(step,o)=>{timings.push({step,...o});saveTimings();};
const shape=a=>a&&{type:a.type,provider:a.provider,summary:a.summary,sentences:a.sentences.map(x=>({n:x.n,text:x.text})),verdicts:a.verdicts.map(v=>({n:v.n,verdict:v.verdict,note:v.note,fix:v.fix??null,was:v.was??null}))};
async function run(name,fn){try{const r=await fn();steps[name]={verdict:'pass',...(r||{})};}catch(e){steps[name]={verdict:'fail',error:String(e.message||e).slice(0,600)};throw e;}finally{note(name+'-done',{verdict:steps[name]?.verdict});}}

async function rereadMode(){
 await asTheTV();
 const browser=await chromium.launch({headless:true});
 try{
  const tv=await (await browser.newContext({viewport:{width:1920,height:1150}})).newPage();tv.on('pageerror',e=>errors.push(e.message));
  // seat the learner the way the desk does: a profile draft, then save (the server loads the learner's record from learners.json)
  await event({type:'profile.draft',patch:LEARNER});await event({type:'profile.save'});
  await event({type:'subject',subject:'essay'});await event({type:'nav',screen:'essaytype',focus:0});
  await tv.goto(base+'/tv?key='+encodeURIComponent(key));await tv.waitForSelector('.em-w, [data-role="desk-object"]',{timeout:60000});
  const s=await until(x=>x.learner?.id===LEARNER.id&&x.screen==='essaytype','the lens home',60000);
  await sleep(1500);
  await tv.screenshot({path:path.join(out,'tv-reread-lens-home.png')});
  const ss=s.s;
  const results={passed:true,learner:ss.learner?.id,screen:ss.screen,history:(ss.history||[]).filter(h=>h.kind==='writing').map(h=>({kind:h.kind,label:h.label,detail:h.detail})),writing:Object.fromEntries(Object.entries(ss.writing||{}).map(([k,v])=>[k,{seen:v.seen,right:v.right,estimate:v.estimate}])),errors};
  assert.equal(results.history.length,1,'one writing entry in the session read back after the restart');
  assert.ok(results.writing.evidence&&results.writing.evidence.seen>=1,'writing.evidence is there after the restart');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'results-reread.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results));
 }finally{await browser.close();}
}

(async()=>{
 if(reread)return rereadMode();
 await asTheTV();
 const browser=await chromium.launch({headless:true});
 try{
  const tv=await (await browser.newContext({viewport:{width:1920,height:1150}})).newPage();
  const phone=await (await browser.newContext({viewport:{width:390,height:844}})).newPage();
  for(const p of [tv,phone])p.on('pageerror',e=>errors.push(e.message));
  let reading;

  await run('W1',async()=>{
   await event({type:'profile.draft',patch:LEARNER});await event({type:'profile.save'});
   const pin=(await current()).pin;
   await phone.goto(base+'/phone?pin='+pin);
   await phone.waitForFunction(async()=>(await(await fetch('/api/session')).json()).viewer==='phone');
   // a nav sent before the join lands is overwritten by it, so wait for the join itself
   await until(s=>s.joined,'the phone joining',30000);
   assert.equal((await current()).learner.id,LEARNER.id);
   return{learner:LEARNER.id};
  });

  await run('W2',async()=>{
   await event({type:'nav',screen:'landing',focus:2});
   await until(s=>s.screen==='landing'&&s.focus===2,'the landing at focus 2',15000);
   await tv.goto(base+'/tv?key='+encodeURIComponent(key));await tv.waitForSelector('[data-role="desk-object"]');
   await tv.locator('.stage').click({position:{x:20,y:20}});
   assert.equal((await current()).screen,'landing','still on the landing before Enter');
   const t0=Date.now();await tv.keyboard.press('Enter');
   const r=await until(s=>s.screen==='essaytype'&&s.subject==='essay','essaytype after Enter',30000);
   const ms=Date.now()-t0;note('W2',{enterToEssaytypeMs:ms,zoomMs:560,exceededZoom:ms>560});
   return{enterToEssaytypeMs:ms,zoomMs:560,exceededZoom:ms>560};
  });

  await run('W3',async()=>{
   await phone.getByRole('button',{name:'Essay',exact:true}).click();
   await phone.locator('[data-role="essay-paragraph"]').waitFor();
   await phone.locator('.types label',{hasText:/^Evidence$/}).click();
   await phone.getByLabel('The paragraph the desk will read',{exact:true}).fill(PARAGRAPH);
   const t0=Date.now();
   await phone.getByRole('button',{name:'Analyse on the TV',exact:true}).click();
   await until(s=>s.screen==='forensic'&&s.essay?.sentences?.length>0,'the forensic page with sentences');
   const ms=Date.now()-t0;const s=await current();reading=s.essay;
   note('W3',{analyseMs:ms,provider:reading.provider,lens:reading.type,sentences:reading.sentences.length});
   assert.equal(reading.type,'evidence');
   return{analyseMs:ms,provider:reading.provider,lens:reading.type,sentences:reading.sentences.length};
  });

  await run('W4',async()=>{
   await tv.waitForSelector('.em-r');await sleep(1200);
   await tv.screenshot({path:path.join(out,'tv-coached.png')});
   const coached=shape(reading);
   const first=await tv.evaluate(()=>document.body.innerText.slice(0,1500));
   const verbatim=reading.sentences.map(x=>x.text);
   // the ghostwriting check: report, do not assert. Every fix pattern is listed beside the learner's sentences for a person to read.
   const shown=[...reading.verdicts.map(v=>v.note),...reading.verdicts.map(v=>v.fix?.move),...reading.verdicts.map(v=>v.fix?.pattern),reading.summary].filter(Boolean);
   const echoes=shown.filter(t=>verbatim.some(x=>x.length>20&&t.toLowerCase().includes(x.toLowerCase().replace(/[.!?]$/,''))));
   return{reading:coached,tvTextFirstScreen:first,textsThatContainAWholeLearnerSentence:echoes};
  });

  await run('W5',async()=>{
   const idxOf=s=>{const a=s.essay;if(s.essayAt!=null){const i=a.sentences.findIndex(x=>x.n===s.essayAt);if(i>=0)return i;}const f=new Set(a.verdicts.filter(v=>v.verdict==='faulty').map(v=>v.n));return Math.max(0,a.sentences.findIndex(x=>f.has(x.n)));};
   await tv.locator('.stage').click({position:{x:10,y:10}});
   for(let i=0;i<10;i++){const s=await current();const at=idxOf(s);if(at===3)break;await tv.keyboard.press(at<3?'ArrowDown':'ArrowUp');await until(x=>idxOf(x)!==at,'the TV walking a sentence',15000);}
   assert.equal(idxOf(await current()),3,'the TV is on sentence 4');
   // the focus must be on Rewrite on my phone (the first action)
   for(let i=0;i<4&&(await current()).focus!==0;i++){await tv.keyboard.press('ArrowLeft');await sleep(300);}
   assert.equal((await current()).focus,0);
   await tv.keyboard.press('Enter');
   await until(s=>/rewrite it in your own words on the phone/.test(s.status||''),'the TV status offering the rewrite',15000);
   await tv.screenshot({path:path.join(out,'tv-rewrite-offered.png')});
   const before=reading.verdicts.find(v=>v.n===4),others=reading.verdicts.filter(v=>v.n!==4);
   const ta=phone.locator('[data-role="essay-rewrite"] textarea');await ta.waitFor();
   await phone.waitForFunction(t=>document.querySelector('[data-role="essay-rewrite"] textarea')?.value===t,reading.sentences[3].text);
   await ta.fill(REWRITE);
   const t0=Date.now();await phone.getByRole('button',{name:'Send',exact:true}).click();
   const r=await until(s=>s.essay?.sentences?.find(x=>x.n===4)?.text===REWRITE,'sentence 4 reading again');
   const ms=Date.now()-t0;const after=r.s.essay;
   const afterV=after.verdicts.find(v=>v.n===4);
   const kept=others.every(o=>{const n=after.verdicts.find(v=>v.n===o.n);return n&&n.verdict===o.verdict&&n.note===o.note;});
   await sleep(1200);await tv.screenshot({path:path.join(out,'tv-rewrite-judged.png')});
   note('W5',{rewriteMs:ms,provider:after.provider,before:before.verdict,after:afterV.verdict,othersKept:kept});
   reading=after;
   return{rewriteMs:ms,provider:after.provider,sentence4:{before:{verdict:before.verdict,note:before.note,fix:before.fix??null},after:{verdict:afterV.verdict,note:afterV.note,fix:afterV.fix??null,was:afterV.was??null}},everyOtherVerdictKept:kept};
  });

  await run('W6',async()=>{
   await phone.getByRole('button',{name:'Tonight',exact:true}).click();
   const b=phone.getByRole('button',{name:'End session',exact:true});await b.waitFor();
   const t0=Date.now();await b.click();
   await until(s=>s.screen==='recap','the recap');
   const ms=Date.now()-t0;await sleep(1500);
   await tv.screenshot({path:path.join(out,'tv-recap.png')});await phone.getByRole('button',{name:'Recap',exact:true}).click();await sleep(500);await phone.screenshot({path:path.join(out,'phone-recap.png')});
   const recapText=await phone.locator('[data-role="phone-recap"]').innerText().catch(()=>null);
   note('W6',{endSessionMs:ms});
   return{endSessionMs:ms,phoneRecap:recapText};
  });

  await run('W7',async()=>{
   const book=JSON.parse(fs.readFileSync(path.join(data,'learners.json'),'utf8'));const l=book[LEARNER.id];
   assert.ok(l,'the learner is in learners.json');
   const w=(l.history||[]).filter(h=>h.kind==='writing');
   assert.equal(w.length,1,'one writing entry');
   assert.ok(l.writing&&l.writing.evidence,'writing.evidence holds a record');
   await tv.reload();await tv.waitForSelector('.bench');await sleep(2000);await tv.screenshot({path:path.join(out,'tv-after-reload.png')});
   return{history:w.map(h=>({kind:h.kind,label:h.label,detail:h.detail})),writingEvidence:l.writing.evidence};
  });

  await run('W8',async()=>{assert.deepEqual(errors,[]);return{pageErrors:errors};});
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,steps,errors,note:'No model judgement is asserted; verdicts are recorded for a reader. A physical phone, heard audio and the owner\'s reading are not covered.'},null,2));
  console.log(JSON.stringify({passed:true,steps:Object.fromEntries(Object.entries(steps).map(([k,v])=>[k,v.verdict])),artifacts:out}));
 }catch(e){
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:false,steps,errors,error:String(e.message||e)},null,2));throw e;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
