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
// the forensic table's figures row shows the paragraph's words and links beside the other counts (EM1-3, EM1-4); a source pin, no model needed
{const tv=fs.readFileSync(path.resolve(__dirname,'../desk/src/essay/EssayTV.tsx'),'utf8');const f=tv.match(/const figs:[^
]*/)?.[0]||'';assert.ok(/a\.stats\.words[^\]]*"words"/.test(f)&&/a\.stats\.links[^\]]*"links"/.test(f),'the forensic table figures include words and links');}
// F16: the plan's caption shows an essay refusal (the 428 text-notice line the analyse route sets); a source pin, no model needed
{const tv=fs.readFileSync(path.resolve(__dirname,'../desk/src/essay/EssayTV.tsx'),'utf8');const plan=tv.slice(tv.indexOf('export function EssayPlan'));assert.ok(plan.includes('const refused = refusalCaption(s)')&&plan.includes(': refused ? refused'),'the plan caption shows a refused read');}
const key=JSON.parse(fs.readFileSync(path.join(data,'pairing.json'),'utf8')).key;
const ADULT=process.env.ADULT==='1';
const out=path.resolve(__dirname,ADULT?'../artifacts/essay-integration-adult':'../artifacts/essay-integration');fs.mkdirSync(out,{recursive:true});
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

/** ADULT=1 (UD-25): an Adult learner (type other, no age, mode adult): Workroom -> keep a TITLED text (notice step first) -> read it -> the TV's Workroom curtain
 * shows no kept text -> delete all -> the session's text is cleared (UD-6) -> the Twin portrait/card routes. Each check is recorded pass / fail / skipped; a skip
 * carries its reason and is never a pass. A failed check is a finding: nothing here is loosened. */
async function adultPass(){
 const checks=[];
 const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:checks.every(c=>c.verdict!=='fail'),adult:true,checks,errors},null,2));
 const rec=(id,verdict,detail)=>{checks.push({id,verdict,detail});console.log(JSON.stringify({id,verdict,detail}).slice(0,600));save();};
 const check=async(id,fn)=>{const t=Date.now();try{const d=await fn();note(id,{ms:Date.now()-t,verdict:'pass'});rec(id,'pass',d??null);return true;}catch(e){note(id,{ms:Date.now()-t,verdict:'fail'});rec(id,'fail',String(e.message||e).slice(0,900));return false;}};
 const skip=(id,reason)=>rec(id,'skipped',reason);
 const ID='essay-browser-adult',TITLE='Letter to the harbour board';
 const MARK=['marmalade lighthouse','velvet turbine','quartz regatta'];
 const PARAS=[
  `The old ${MARK[0]} should stay open to visitors every summer. It costs the town very little, and last year more than four thousand people climbed its stairs. Those visitors spent money in the cafes nearby.`,
  `The ${MARK[1]} on the pier is a different matter, because it is noisy and nobody has repaired it since 2015. A short repair would make it quiet again. I believe the board should pay for that first.`,
  `Finally, the ${MARK[2]} each August brings the whole town together. For that reason I ask the board to keep funding it, and to publish the budget so that everyone can see where the money goes.`];
 const TEXT=PARAS.join('\n\n');
 const leaks=(s)=>MARK.filter(m=>s.toLowerCase().includes(m));
 const browser=await chromium.launch({headless:true});
 try{
  const tv=await (await browser.newContext({viewport:{width:1920,height:1150}})).newPage();
  const phone=await (await browser.newContext({viewport:{width:390,height:844}})).newPage();
  const pcCtx=await browser.newContext({viewport:{width:1280,height:900}});const pc=await pcCtx.newPage();
  for(const p of [tv,phone,pc])p.on('pageerror',e=>errors.push(e.message));
  await check('E0 seat: Adult learner (type other, no age, mode adult) through profile.draft/save',async()=>{
   await event({type:'profile.draft',patch:{id:ID,name:'Ada',type:'other',mode:'adult',modules:['maths','english','essay']}});await event({type:'profile.save'});
   const s=await current();const p=s.profiles.find(x=>x.id===ID);assert.ok(p);assert.equal(p.type,'other');assert.equal(p.age,undefined);assert.equal(p.mode,'adult');assert.equal(s.learner.id,ID);return{profile:p};});
  await check('E1 phone and PC page join the desk',async()=>{
   const pin=(await current()).pin;
   await phone.goto(base+'/phone?pin='+pin);await phone.waitForFunction(async()=>(await(await fetch('/api/session')).json()).viewer==='phone');
   await until(s=>s.joined,'the phone joining',30000);
   await pc.goto(base+'/drop');
   await pc.waitForSelector('input[placeholder="4-digit code"], [data-role="drop-page"]',{timeout:30000});
   const needJoin=await pc.locator('input[placeholder="4-digit code"]').count();
   if(needJoin){await pc.fill('input[placeholder="4-digit code"]',String((await current()).pin));await pc.getByRole('button',{name:'Join',exact:true}).click();}
   await pc.waitForSelector('[data-role="drop-page"]',{timeout:30000});return{pcNeededJoin:!!needJoin};});
  await tv.goto(base+'/tv?key='+encodeURIComponent(key));await tv.waitForSelector('.bench, [data-role="desk-object"], .em-w',{timeout:60000});
  const call=(p,method,url,body)=>p.evaluate(async([method,url,body])=>{const r=await fetch(url,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json();}catch{}return{status:r.status,j};},[method,url,body]);
  await check('E2 Workroom, nothing kept: the TV opens the Workroom (empty) via the PC page button',async()=>{
   await pc.getByRole('button',{name:'Show the Workroom on the TV',exact:true}).click();
   await until(s=>s.screen==='workroom'||s.workroom?.open,'the Workroom screen',20000).catch(()=>{});
   const s=await current();await tv.waitForSelector('[data-role="essay-workroom"]',{timeout:20000});await sleep(800);
   await tv.screenshot({path:path.join(out,'tv-workroom-empty.png')});
   return{screen:s.screen,body:(await tv.locator('[data-role="essay-workroom"]').innerText()).slice(0,300)};});
  let kept=null;
  await check('E3 keep a TITLED text on the PC page: the one-time notice comes first (428), nothing is kept before it is accepted',async()=>{
   await pc.getByPlaceholder('Title (optional)').fill(TITLE);await pc.getByRole('radio',{name:/Essay/}).check();
   await pc.locator('[data-role="drop-text"]').fill(TEXT);
   await pc.locator('[data-role="drop-keep"]').click();
   await pc.locator('[data-role="essay-notice"]').waitFor({timeout:20000});
   const noticeText=await pc.locator('[data-role="essay-notice"]').innerText();
   const shelf=await call(pc,'GET','/api/texts');assert.equal(shelf.status,200);
   assert.equal(shelf.j.pieces.length,0,'a piece was kept before the notice was accepted');
   assert.equal(shelf.j.noticed,false);
   assert.equal(await pc.getByRole('button',{name:'Read without keeping',exact:true}).count(),1,'the keep path lost its Read without keeping button');
   await pc.getByRole('button',{name:'I understand, keep it',exact:true}).click();
   for(let i=0;i<100&&!kept;i++){const sh=await call(pc,'GET','/api/texts');if(sh.j?.pieces?.length)kept=sh.j.pieces[0];else await sleep(150);}
   assert.ok(kept,'the piece was kept after accepting');assert.equal(kept.title,TITLE,'the stored title is the one typed');assert.equal(kept.format,'essay');
   return{notice:noticeText,piece:kept};});
  await check('E4 Workroom on the TV after the keep: the title and counts show, no kept sentence',async()=>{
   assert.ok(kept,'nothing kept');
   await call(pc,'POST','/api/twin',{open:true});
   await until(s=>s.screen==='workroom'||(s.workroom?.pieces?.length>0),'the Workroom with a piece',20000);
   await tv.waitForSelector('[data-role="essay-workroom"]');await sleep(1000);
   await tv.screenshot({path:path.join(out,'tv-workroom-kept.png')});
   const body=await tv.evaluate(()=>document.body.innerText);const s=await current();
   assert.ok(body.includes(TITLE),'the TV shows the title');
   assert.deepEqual(leaks(body),[],'kept text on the TV curtain');assert.deepEqual(leaks(JSON.stringify(s)),[],'kept text in the TV session snapshot');
   return{tvText:body.slice(0,400),workroom:s.workroom};});
  await check('E5 read it: open from the phone shelf and read the whole piece on the TV (real model, 3 paragraphs)',async()=>{
   await phone.getByRole('button',{name:'Essay',exact:true}).click();await phone.locator('[data-role="essay-paragraph"]').waitFor();
   await phone.locator('[data-role="essay-shelf-piece"]').first().getByRole('button',{name:'Open',exact:true}).click();
   await phone.waitForFunction(()=>document.querySelector('[data-role="essay-paras"]'));
   const t0=Date.now();
   await phone.locator('[data-role="essay-read-piece"]').click();
   const r=await until(s=>s.screen==='forensic'&&s.essay?.sentences?.length>0&&s.essay.piece&&(s.essay.piece.read.length+s.essay.piece.failed.length+(s.essay.piece.notEnglish?.length||0))>=s.essay.piece.paragraphs,'the piece read',300000);
   await sleep(1200);await tv.screenshot({path:path.join(out,'tv-piece-read.png')});
   const a=r.s.essay;
   const shelf=await call(pc,'GET','/api/texts');
   return{readMs:Date.now()-t0,provider:a.provider,type:a.type,sentences:a.sentences.length,piece:{paragraphs:a.piece.paragraphs,read:a.piece.read,failed:a.piece.failed,notEnglish:a.piece.notEnglish||[]},shelfAfter:shelf.j.pieces.map(p=>({title:p.title,versions:p.versions}))};});
  await check('E6 the TV on the forensic page shows the read text only because it was read there (recorded, not a curtain breach); the Workroom curtain stays clean',async()=>{
   const body=await tv.evaluate(()=>document.body.innerText);
   const forensicShows=leaks(body);
   await call(pc,'POST','/api/twin',{open:true});await until(s=>s.screen==='workroom','the Workroom again',20000);await tv.waitForSelector('[data-role="essay-workroom"]');await sleep(800);
   const wr=await tv.locator('[data-role="essay-workroom"]').innerText();const side=await tv.locator('[data-role="essay-twin"]').innerText();
   assert.deepEqual(leaks(wr+side),[],'kept text in the Workroom curtain');
   return{forensicPageShowedMarkers:forensicShows,workroomText:wr.slice(0,300)};});
  await check('E7 TV role is refused the texts API (the TV never reads a text)',async()=>{
   const r=await fetch(base+'/api/texts',{headers:{cookie:tvCookie}});
   assert.ok(r.status===403||r.status===401,'TV read /api/texts: '+r.status+' '+(await r.text()).slice(0,200));return{status:r.status};});
  // Twin routes with a single piece, then born (three messages kept)
  await check('E8 Twin portrait (phone/PC) with one essay: not born, no exemplar text on the TV role',async()=>{
   const p=await call(pc,'GET','/api/twin');assert.equal(p.status,200);assert.equal(p.j.adult,true,'the portrait says Adult');assert.equal(p.j.born,false);
   const tvTwin=await fetch(base+'/api/twin',{headers:{cookie:tvCookie}});const tj=await tvTwin.json();
   assert.deepEqual(leaks(JSON.stringify(tj)),[],'text in the TV twin response');
   return{portrait:{adult:p.j.adult,born:p.j.born,need:p.j.need,channels:p.j.channels.map(c=>({channel:c.channel,pieces:c.pieces,born:c.born,exemplars:c.exemplars.length}))},tvTwin:{status:tvTwin.status,body:tj}};});
  await check('E9 Twin card before the twin is born: 409 with the keep-more line (Adult, phone/PC role)',async()=>{
   const r=await call(pc,'GET','/api/twin/card');assert.equal(r.status,409,JSON.stringify(r));return{status:r.status,error:r.j?.error};});
  await check('E10 Twin card with the TV key is refused (403)',async()=>{
   const r=await fetch(base+'/api/twin/card',{headers:{cookie:tvCookie}});assert.equal(r.status,403);return{status:r.status};});
  await check('E11 keep three messages (titled): the message twin is born; the card downloads as Twin Card JSON',async()=>{
   const msgs=['Hi Tom, thanks for the update. I will send the file tonight, so please check your inbox after seven.','Hello Anna, could we move the call to Thursday? I am travelling on Wednesday, sorry about the change.','Thanks both, the plan looks good to me. Let us start on Monday and review on Friday afternoon.'];
   for(let i=0;i<msgs.length;i++){const r=await call(pc,'POST','/api/texts',{text:msgs[i],format:'message',title:'Note '+(i+1),source:'paste'});assert.equal(r.status,200,JSON.stringify(r));}
   const p=await call(pc,'GET','/api/twin');assert.equal(p.j.born,true,'the twin is born after three messages');
   const card=await pcCtx.request.get(base+'/api/twin/card');
   assert.equal(card.status(),200);const ct=card.headers()['content-type'],cd=card.headers()['content-disposition'];const j=await card.json();
   return{contentType:ct,disposition:cd,topKeys:Object.keys(j),portraitChannels:p.j.channels.map(c=>({channel:c.channel,pieces:c.pieces,born:c.born}))};});
  await check('E12 the born twin on the TV Workroom: level words and Born mark, still no kept text',async()=>{
   await call(pc,'POST','/api/twin',{open:true});await sleep(1500);await tv.waitForSelector('[data-role="essay-twin"]');
   const body=await tv.evaluate(()=>document.body.innerText);await tv.screenshot({path:path.join(out,'tv-workroom-born.png')});
   assert.deepEqual(leaks(body),[]);assert.ok(!/Thanks both, the plan looks good/.test(body),'a message sentence is on the TV');assert.ok(/born/i.test(body),'the TV shows Born (innerText is upper-cased by the screen CSS)');return{tvText:body.slice(0,500)};});
  await check('E13 delete all (phone shelf, second press confirms): shelf empty, session text cleared (UD-6)',async()=>{
   const before=await current();assert.ok(before.essay,'precondition: the session still holds the read piece');
   await phone.getByRole('button',{name:'Essay',exact:true}).click();await phone.locator('[data-role="essay-shelf"]').waitFor();
   await phone.locator('[data-role="essay-delete-all"]').click();
   await phone.getByRole('button',{name:'Yes, delete everything I kept',exact:true}).click();
   await phone.locator('[data-role="essay-shelf-note"]').waitFor({timeout:20000});
   const say=await phone.locator('[data-role="essay-shelf-note"]').innerText();
   const shelf=await call(pc,'GET','/api/texts');assert.deepEqual(shelf.j.pieces,[]);
   const s=await current();
   assert.equal(s.essay,null,'session.essay is not cleared');assert.equal(s.essayAt??null,null);
   assert.notEqual(s.screen,'forensic');
   assert.deepEqual(leaks(JSON.stringify(s)),[],'kept text remains in the session snapshot');
   return{say,screenAfter:s.screen,workroom:s.workroom};});
  await check('E14 after delete: TV shows no kept text; twin is gone (card 409 or portrait unborn)',async()=>{
   await sleep(1500);const body=await tv.evaluate(()=>document.body.innerText);await tv.screenshot({path:path.join(out,'tv-after-delete.png')});
   assert.deepEqual(leaks(body),[]);
   const p=await call(pc,'GET','/api/twin');const c=await call(pc,'GET','/api/twin/card');
   assert.equal(p.j.born,false);assert.equal(c.status,409);return{portraitBorn:p.j.born,cardStatus:c.status};});
  await check('E15 nothing of the kept text remains anywhere in the data dir after delete-all (session.json, learners.json, texts)',async()=>{
   const hits=[];const walk=d=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p);else{let t='';try{t=fs.readFileSync(p,'utf8');}catch{}const m=leaks(t);if(m.length)hits.push({file:path.relative(data,p),markers:m});}}};
   walk(data);assert.deepEqual(hits,[],'kept words still on disk: '+JSON.stringify(hits));return{scanned:data};});
  await check('E16 Family-mode 18+ (age 22, mode family): the card is refused (403) and the portrait says not Adult',async()=>{
   await event({type:'profile.draft',patch:{id:'essay-browser-family22',name:'Fia',type:'other',age:22,mode:'family',modules:['maths','english','essay']}});await event({type:'profile.save'});
   const s=await current();assert.equal(s.learner.id,'essay-browser-family22');
   const c=await call(pc,'GET','/api/twin/card');const p=await call(pc,'GET','/api/twin');
   assert.equal(c.status,403,JSON.stringify(c));assert.equal(p.j.adult,false);return{cardStatus:c.status,portraitAdult:p.j.adult};});
  skip('E17 dictation / .docx upload / camera reading','dictation needs a microphone and ASR, the .docx path needs a file fixture, the camera needs a device: none is driven here');
  rec('E18 no page errors',errors.length?'fail':'pass',errors);
 }finally{
  await browser.close();
  console.log(JSON.stringify({adult:true,summary:checks.map(c=>c.id.split(' ')[0]+':'+c.verdict)}));
  if(checks.some(c=>c.verdict==='fail'))process.exitCode=1;
 }
}

(async()=>{
 if(reread)return rereadMode();
 await asTheTV();
 if(ADULT)return adultPass();
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
   const analyse=phone.getByRole('button',{name:'Analyse on the TV',exact:true});
   // UD-7: the first paragraph read asks the one-time notice (428) before any run, as keeping a piece does (E3 of the Adult pass)
   const call=(method,url,body)=>phone.evaluate(async([method,url,body])=>{const r=await fetch(url,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json();}catch{}return{status:r.status,j};},[method,url,body]);
   const shelf=await call('GET','/api/texts');assert.equal(shelf.status,200);
   const noticeDue=shelf.j.noticed===false;
   let noticeSeen=null,noticeVia=null;
   const t0=Date.now();
   await analyse.click();
   if(noticeDue){
    // the single-paragraph path must show the same notice dialog (data-role="essay-notice") with its accept button; no API shortcut
    await phone.locator('[data-role="essay-notice"]').waitFor({timeout:20000});
    noticeVia='dialog';
    noticeSeen=await phone.locator('[data-role="essay-notice"]').innerText();
    // nothing was analysed before the notice was accepted
    const before=await current();
    assert.notEqual(before.screen,'forensic','the TV opened the forensic page before the notice was accepted');
    assert.ok(!before.essay?.sentences?.length,'a paragraph was analysed before the notice was accepted');
    assert.equal((await call('GET','/api/texts')).j.noticed,false,'the notice was recorded as accepted before anyone accepted it');
    assert.equal(await phone.getByRole('button',{name:'I understand, keep it',exact:true}).count(),0,'the paragraph path offers to keep what it does not keep');
    assert.equal(await phone.getByRole('button',{name:'Not now',exact:true}).count(),1,'the paragraph notice has no Not now button');
    await phone.getByRole('button',{name:'I understand, read it',exact:true}).click();
    // the click alone records the acceptance and the analyse goes through, with no second press on Analyse
    await until(s=>s.screen==='forensic'&&s.essay?.sentences?.length>0,'the forensic page with sentences after the accept click');
    assert.equal((await call('GET','/api/texts')).j.noticed,true,'the notice was not recorded as accepted after the click');
   }
   await until(s=>s.screen==='forensic'&&s.essay?.sentences?.length>0,'the forensic page with sentences');
   const ms=Date.now()-t0;const s=await current();reading=s.essay;
   note('W3',{analyseMs:ms,provider:reading.provider,lens:reading.type,sentences:reading.sentences.length,noticeDue,noticeVia});
   assert.equal(reading.type,'evidence');
   return{analyseMs:ms,provider:reading.provider,lens:reading.type,sentences:reading.sentences.length,noticeDue,noticeVia,notice:noticeSeen};
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
