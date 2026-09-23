/**
 * The homework pipelines as typed session jobs: one runner (lib/desk/job.ts), a `jobs` record in the session,
 * one run of a kind at a time, the lesson pick keyed to its hint, and no failure that leaves a screen waiting.
 * Run with npm test in desk/ (directly: node tools/desk-jobs-rules-test.cjs). No model is called - every engine
 * is stubbed at the provider registry - and the data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`desk-jobs-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));
const storeFile=src('lib/session/store.ts');
let store=require(storeFile);
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());

/** One text stub for every call; `on` picks the answer by what the caller's schema asks for. */
function stubText(on){reg.useProvider('text',{name:'stub',run:async(req)=>{
 const p=Object.keys(req.schema?.properties??{});
 const which=p.includes('lesson')?'lesson':p.includes('hint')?'hint':p.includes('items')?'items':'other';
 const f=on[which];if(!f)throw new Error(`no stub for ${which}`);return {raw:await f(req)};
}});}
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
const held=()=>{let open;const p=new Promise((r)=>{open=r;});return {p,open};};
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
/** Let the fire-and-forget work behind a route (the lesson pick) run to its end. */
const drain=async()=>{for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));};

const PAGE={id:'maths-1',subject:'maths',title:'Sheet',img:'',w:100,h:100};
const ITEMS=[{n:1,text:'2x+3=11',cx:0,cy:0,band:[0,10],key:'k1'},{n:2,text:'x-5=2',cx:0,cy:0,band:[10,20],key:'k2'}];
/** A fresh desk with a scratch learner and one read maths page, on the page screen. */
function onPage(){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'jobs-scratch',name:'Scratch',type:'other'}});store.dispatch({type:'profile.save'});
 store.dispatch({type:'page.reading',page:PAGE});store.dispatch({type:'page.read',id:PAGE.id,items:ITEMS,readMs:1,provider:'test'});
 assert.equal(store.getSession().screen,'page');
}
const STATED=[{question:'2x+3=11',answer:'4'},{question:'x-5=2',answer:'7'},{question:'3x=18',answer:'6'},{question:'x+1=10',answer:'9'},{question:'5x=35',answer:'7'},{question:'x/2=4',answer:'8'}];
const LESSON='jWpiMu5LNdg';
/** A line the desk would say: no exception name, no stack. */
const deskWorded=(line)=>{assert.equal(typeof line,'string');assert(line.length>0);assert(!/\b\w*Error:/.test(line),`not desk-worded: ${line}`);assert(!/\n\s+at /.test(line),`carries a stack: ${line}`);};

test('case 1: a practice set that fails is a failed job with a desk-worded error; the next try lands the set',async()=>{
 onPage();
 stubText({items:()=>{throw new Error('boom');}});
 const bad=await post('practice',{topic:'linear-one-step'});
 assert.equal(bad.status,502);deskWorded((await bad.json()).error);
 const job=store.getSession().jobs?.practice;
 assert.equal(job?.phase,'failed');deskWorded(job.error);assert.equal(job.key,'linear-one-step');
 stubText({items:()=>({items:STATED})});
 const ok=await post('practice',{topic:'linear-one-step'});
 assert.equal(ok.status,200);
 assert.equal(store.getSession().jobs.practice.phase,'done');assert.equal(store.getSession().jobs.practice.error,undefined);
 assert.equal(store.getSession().practice.items.length,6);
});

test('case 2: two hints at once for one item: the second is refused with 409, and one hint is counted',async()=>{
 onPage();
 const gate=held();let asked=0;
 stubText({hint:async()=>{asked++;await gate.p;return {hint:'Undo the +3 first.',what_to_try_next:'What is left on the left?'};},lesson:()=>({lesson:'none',why:'x'})});
 const first=post('hint',{}),second=post('hint',{});
 // the refusal must not wait on the first hint: a second request still waiting after 500 ms is the bug
 const refused=await Promise.race([second,new Promise((r)=>setTimeout(()=>r('still waiting'),500))]);
 if(refused==='still waiting'){gate.open();await Promise.all([first,second]);}
 assert.notEqual(refused,'still waiting','the second hint was not refused');
 assert.equal(refused.status,409);deskWorded((await refused.json()).error);
 gate.open();assert.equal((await first).status,200);await drain();
 assert.equal(asked,1,'the refused hint made no engine call');
 const s=store.getSession();assert.equal(s.log.hints,1);assert.equal(s.log.problems.length,1);
});

test('case 3: "Still stuck" is one more hint, not two',async()=>{
 onPage();
 stubText({hint:()=>({hint:'Undo the +3 first.',what_to_try_next:'Then the 2.'}),lesson:()=>({lesson:'none',why:'x'})});
 assert.equal((await post('hint',{})).status,200);await drain();
 assert.equal((await post('hint',{stage:2})).status,200);await drain();
 const s=store.getSession();assert.equal(s.hint.stage,2);assert.equal(s.log.hints,2);assert.deepEqual(s.log.hard,['2x+3=11']);
});

test('case 4: the lesson belongs to its hint: a new hint clears it, and a late pick for the old one is dropped',async()=>{
 onPage();
 stubText({hint:()=>({hint:'Look at the +3.',what_to_try_next:'Undo it.'}),lesson:()=>({lesson:LESSON,why:'chosen because your problem needs one step undone'})});
 await post('hint',{itemIx:0});await drain();
 assert.equal(store.getSession().lesson?.id,LESSON,'item 1\'s pick landed');
 const picks=[];
 stubText({hint:()=>({hint:'Look at the -5.',what_to_try_next:'Undo it.'}),lesson:()=>{const h=held();picks.push(h);return h.p;}});
 await post('hint',{itemIx:1});
 let s=store.getSession();assert.equal(s.hint.key,'k2');assert.equal(s.lesson,null,'the old lesson is gone the moment the new hint lands');assert.equal(s.noLesson,false);
 // item 1 asked again while item 2's pick is still out, then item 2 again: three picks in flight
 await post('hint',{itemIx:0});await post('hint',{itemIx:1});
 assert.equal(picks.length,3);assert.equal(store.getSession().hint.key,'k2');
 picks[1].open({lesson:LESSON,why:'for item 1'});await drain();
 assert.equal(store.getSession().lesson,null,"item 1's pick, back after item 2's hint, does not land");
 picks[2].open({lesson:'none',why:'x'});await drain();
 picks[0].open({lesson:LESSON,why:'an older ask'});await drain();
 s=store.getSession();assert.equal(s.lesson,null,'only the newest pick for this hint counts');assert.equal(s.noLesson,true);
});

test('case 5: a lesson pick that fails or comes back without a lesson ends as "no lesson", never an endless wait',async()=>{
 for(const lesson of [()=>({why:'x'}),()=>{throw new Error('boom');}]){
  onPage();
  stubText({hint:()=>({hint:'Look at the +3.',what_to_try_next:'Undo it.'}),lesson});
  assert.equal((await post('hint',{})).status,200);await drain();
  const s=store.getSession();
  assert.equal(s.jobs?.lesson?.phase,'failed');deskWorded(s.jobs.lesson.error);
  assert.equal(s.noLesson,true);assert.equal(s.lesson,null);
 }
});

test('case 6: a hint that throws answers 502 with an error, and the TV stays on the page',async()=>{
 onPage();
 stubText({hint:()=>{throw new Error('boom');}});
 const r=await post('hint',{}).catch((e)=>e);
 assert(r instanceof Response,`the route answered instead of throwing (${r})`);
 assert.equal(r.status,502);deskWorded((await r.json()).error);
 const s=store.getSession();assert.equal(s.jobs.hint.phase,'failed');assert.equal(s.screen,'page');assert.equal(s.log.hints,0);
});

test('GUARD case 8: a practice set still answers only its four keys, and no answer rides in the session or its jobs',async()=>{
 onPage();
 stubText({items:()=>({items:STATED})});
 const r=await post('practice',{topic:'linear-one-step'});
 assert.deepEqual(Object.keys(await r.json()).sort(),['items','ms','provider','tries']);
 const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];
 const saved=JSON.parse(fs.readFileSync(path.join(data,'session.json'),'utf8'));
 for(const s of [store.getSession(),saved])assert(!keysIn(s).includes('answer'));
});

test('the TV reads the jobs: Select waits while a set or a hint is being made, and a failed set is named on its topic',()=>{
 const {tvKey,practiceFailed,LOCAL}=require(src('tv/keys.ts'));
 onPage();const s=store.getSession();
 assert.deepEqual(tvKey({...s,jobs:{hint:{id:'h',phase:'running',startedAt:0}}},'select',LOCAL).calls,[],'no second hint from the TV while one runs');
 assert.equal(tvKey(s,'select',LOCAL).calls.length,1);
 const topics={...s,screen:'topics',focus:1,topic:'linear-two-step'};
 assert.deepEqual(tvKey({...topics,jobs:{practice:{id:'p',phase:'running',startedAt:0,key:'linear-two-step'}}},'select',LOCAL).calls,[]);
 const failed={...topics,jobs:{practice:{id:'p',phase:'failed',startedAt:0,key:'linear-two-step',error:'The desk could not write this set. Try again.'}}};
 assert.equal(practiceFailed(failed,'linear-two-step'),'The desk could not write this set. Try again.');assert.equal(practiceFailed(failed,'linear-one-step'),null);
 assert.deepEqual(tvKey(failed,'select',LOCAL).calls.map(c=>c.body),[{topic:'linear-two-step'}],'Select on the failed topic asks again');
 store.dispatch({type:'topic.open',topic:'linear-two-step'});assert.equal(store.getSession().focus,1,'the open topic keeps the focus');
});

// ---- retry in place (engines B): a failed run is asked again from what the desk holds ----
require(src('lib/engines/vision.ts'));
/** One vision stub: a function of the call, or an error it throws. */
const stubVision=(f)=>reg.useProvider('vision',{name:'stub',run:async(req)=>({raw:await f(req)})});
const READ3={items:[{number:1,text:'2x+3=11',y:0.2,x:0.5},{number:2,text:'x-5=2',y:0.5,x:0.5},{number:3,text:'3x=18',y:0.8,x:0.5}]};
const SNAP={image:'data:image/jpeg;base64,AAAA',subject:'maths',title:'Algebra',w:100,h:100};
const retry=(body)=>require(src('app/api/session/retry/route.ts')).POST(new Request('http://desk/api/session/retry',{method:'POST',body:JSON.stringify(body)}));
/** A fresh desk with a scratch learner and no page on it. */
function blank(){store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{id:'jobs-scratch',name:'Scratch',type:'other'}});store.dispatch({type:'profile.save'});}

test('retry case 2: a read that failed is read again in place: the same page id, no second page',async()=>{
 blank();
 stubVision(()=>{throw new Error('ollama 500: boom');});
 assert.equal((await post('read',SNAP)).status,502);
 let s=store.getSession();assert.equal(s.pages.length,1);assert.equal(s.jobs.read.phase,'failed');
 const id=s.pages[0].id;
 let seen=0;stubVision((req)=>{seen++;assert.equal(req.imageBase64,'AAAA','the held page is what is read again');return READ3;});
 const r=await retry({kind:'read'});
 assert.equal(r.status,200);assert.equal(seen,1);
 s=store.getSession();
 assert.equal(s.pages.length,1,'no orphan page');assert.equal(s.pages[0].id,id,'the same page id');
 assert.equal(s.pages[0].items.length,3);assert.equal(s.pages[0].img,SNAP.image);
 assert.equal(s.jobs.read.phase,'done');assert.equal(s.jobs.read.error,undefined);
});

test('retry: a hint that failed is asked again for the same item and the same question',async()=>{
 onPage();
 stubText({hint:()=>{throw new Error('boom');}});
 assert.equal((await post('hint',{askedQ:'What do I do first?',itemIx:1})).status,502);
 assert.equal(store.getSession().jobs.hint.phase,'failed');
 store.dispatch({type:'item',itemIx:0});
 let prompt='';stubText({hint:(req)=>{prompt=req.prompt;return {hint:'Look at the -5.',what_to_try_next:'Undo it.'};},lesson:()=>({lesson:'none',why:'x'})});
 assert.equal((await retry({kind:'hint'})).status,200);await drain();
 const s=store.getSession();
 assert.equal(s.hint.key,'k2','the item that failed, not the one now focused');assert.equal(s.hint.askedQ,'What do I do first?');
 assert(prompt.includes('What do I do first?'));assert.equal(s.jobs.hint.phase,'done');
});

test('retry: with nothing failed there is nothing to retry, and no engine is called',async()=>{
 onPage();
 let asked=0;stubText({items:()=>{asked++;return {items:STATED};},hint:()=>{asked++;return {hint:'x',what_to_try_next:'y'};}});
 for(const kind of ['practice','hint','read','mark']){const r=await retry({kind});assert.equal(r.status,409,kind);deskWorded((await r.json()).error);}
 assert.equal(asked,0);
});

test('case 6: a practice set written for one learner does not land after the desk changed learner',async()=>{
 store.dispatch({type:'reset'});
 for(const id of ['scratch-a','scratch-b']){store.dispatch({type:'profile.draft',patch:{id,name:id,type:'other'}});store.dispatch({type:'profile.save'});}
 store.dispatch({type:'learner.set',id:'scratch-a'});assert.equal(store.getSession().learner.id,'scratch-a');
 const gate=held();let asked=0;stubText({items:async()=>{asked++;await gate.p;return {items:STATED};}});
 const pending=post('practice',{topic:'linear-one-step'});
 for(let i=0;i<200&&!asked;i++)await new Promise((r)=>setImmediate(r));
 assert.equal(asked,1);
 store.dispatch({type:'learner.set',id:'scratch-b'});
 gate.open();const r=await pending;await drain();
 const s=store.getSession();
 assert.equal(s.practice,null,"scratch-a's set did not land on scratch-b");
 assert.notEqual(s.jobs.practice?.phase,'done','the run was superseded, not done');assert.notEqual(s.jobs.practice?.phase,'running');
 assert(!/questions ready/.test(s.status),`status: ${s.status}`);
 assert.notEqual(r.status,200);
});

test('GUARD case 8: a read that succeeds lands its items with the same status line as before',async()=>{
 blank();stubVision(()=>READ3);
 const r=await post('read',SNAP);assert.equal(r.status,200);
 const s=store.getSession();assert.equal(s.pages[0].items.length,3);assert.match(s.status,/^3 items read in \d+ s$/);
});

const session=(e)=>require(src('app/api/session/route.ts')).POST(new Request('http://desk/api/session',{method:'POST',body:JSON.stringify(e)}));
test('case 8: POST /api/session refuses job events with 403, like linga.changed',async()=>{
 onPage();
 for(const e of [{type:'job.start',kind:'read',id:'forged'},{type:'job.done',kind:'read',id:'forged'},{type:'job.failed',kind:'practice',id:'forged',error:'x'}]){
  const r=await session(e);assert.equal(r.status,403,e.type);
 }
 assert.deepEqual(store.getSession().jobs,{},'no forged job on the desk');
});

test('case 9: POST /api/session refuses every event only the server raises; the screens\' own events still pass',async()=>{
 onPage();
 stubText({items:()=>({items:STATED})});assert.equal((await post('practice',{topic:'linear-one-step'})).status,200);
 store.dispatch({type:'practice.marked',items:store.getSession().practice.items.map((it)=>({...it,verdict:'unsure'}))});
 const before=JSON.stringify(store.getSession().practice);
 const serverOnly=[
  {type:'practice.settle',n:1,reply:'Right.',verdict:'right'},{type:'practice.marked',items:[]},{type:'practice.set',practice:{topic:'x',items:[],marked:false}},
  {type:'page.reading',page:{...PAGE,id:'forged'}},{type:'page.read',id:PAGE.id,items:[],readMs:1,provider:'x'},
  {type:'hint.set',hint:{key:'k1',problem:'p',stage:1,hint1:null,hint2:null,askedQ:''}},{type:'hint.stage',stage:2},
  {type:'lesson.set',lesson:null,key:'k1'},{type:'english.set',analysis:{}},{type:'essay.set',analysis:{}},
 ];
 for(const e of serverOnly){const r=await session(e);assert.equal(r.status,403,e.type);deskWorded((await r.json()).error);}
 assert.equal(JSON.stringify(store.getSession().practice),before,'no verdict was settled from outside');
 assert.equal(store.getSession().pages.length,1);
 for(const e of [{type:'nav',screen:'page'},{type:'item',itemIx:1},{type:'status',text:'ok'},{type:'lesson.set',lesson:null},{type:'timer.start'},{type:'walk',ix:0}]){
  assert.equal((await session(e)).status,200,e.type);
 }
});

// last: it swaps the store module out from under the routes loaded above
test('case 7: a job saved as running is not running after the desk restarts',()=>{
 onPage();
 const saved={...store.getSession(),jobs:{read:{id:'r1',phase:'running',startedAt:Date.now()-5000}}};
 fs.writeFileSync(path.join(data,'session.json'),JSON.stringify(saved));
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];store=require(storeFile);
 const job=store.getSession().jobs?.read;
 assert(job,'the saved job is still on record');assert.notEqual(job.phase,'running');
 assert.equal(job.phase,'failed');deskWorded(job.error);assert.equal(store.getSession().reading,false);
});
