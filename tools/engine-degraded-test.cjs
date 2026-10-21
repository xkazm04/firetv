/**
 * The degraded-engine drill: what the desk does at the TV when a live engine answers with nonsense, nothing, or not at
 * all. Every row of tools/engine-degraded-fixtures.json is one provider answer (prose, an empty object, wrong types,
 * empty strings, centres outside the photo, an unknown lesson id, or a thrown timeout / unreachable / exit / cutoff /
 * declined) put through the real route: POST /api/read, POST /api/hint and the lesson pick behind it. The row's `expect`
 * is the fallback the learner is owed: a desk sentence (never the engine's words or the answer), the page not stuck on
 * "reading", the hint screen not entered, "no lesson" instead of an endless wait, and a retry that works once the engine
 * is back - or, for a ceiling or a refusal (`again: false`), no second run at all, since asking again ends the same way.
 *
 * engines-rules-test.cjs holds the engine contract (shape, timeout, exit) one call at a time, and desk-jobs-rules-test.cjs
 * holds the job lifecycle with a few failures. This suite is the matrix between them, at the screen.
 *
 * A row with a `todo` is a gap the desk has today. It runs and reports, and does not fail the suite: the fix is in
 * hint.ts or read.ts, which are on the live model surface, so it lands with a live drift record (.ai/memory/0017).
 * The drift records in uat/drift/ cannot seed these rows: they are counts-only by design and carry no model text.
 *
 * No model or CLI is called: every engine is stubbed at the provider registry. The data directory is disposable,
 * under the OS temp dir, never desk/data. Run with node tools/engine-degraded-test.cjs (needs desk/node_modules).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,before,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;
try{ts=require(path.join(root,'node_modules/typescript'));}
catch{throw new Error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm ci` in desk/ first.');}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`desk-degraded-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'engine-degraded-fixtures.json'),'utf8'));
const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const {EngineError}=require(src('lib/engines/types.ts'));
const {leaks}=require(src('lib/rules/maths.ts'));
const {NOT_AGAIN}=require(src('lib/desk/job.ts'));
const store=require(src('lib/session/store.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const retry=(kind)=>post('session/retry',{kind});
/** Let the fire-and-forget work behind a route (the lesson pick) run to its end. */
const drain=async()=>{for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));};

// The routes log every failure's detail for the operator; the drill reads the screen, not the log.
const quiet={error:console.error,info:console.info};
before(()=>{console.error=()=>{};console.info=()=>{};});
after(()=>{Object.assign(console,quiet);clearInterval(globalThis.__desk?.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());

/** A fixture answer as a provider would give it: a thrown failure, or a fresh copy of the raw answer. */
function given(answer){
 if(answer&&typeof answer==='object'&&!Array.isArray(answer)&&'$throw' in answer){
  // a plain Error is what a CLI that died throws; the call core turns it into an exit EngineError
  if(answer.$throw==='exit')throw new Error(`engine exited with code 1: x = ${'4'}`);
  throw new EngineError(answer.$throw,'stub',`stub ${answer.$throw}`);
 }
 return {raw:answer===undefined?undefined:JSON.parse(JSON.stringify(answer))};
}
/** One text stub for the hint and the lesson pick, told apart by the schema the caller asks for. */
const stubText=({hint=FIX.good.hint,lesson=FIX.good.lesson})=>reg.useProvider('text',{name:'stub',run:async(req)=>{
 const p=Object.keys(req.schema?.properties??{});
 return given(p.includes('lesson')?lesson:hint);
}});
const stubVision=(answer)=>reg.useProvider('vision',{name:'stub',run:async()=>given(answer)});
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const W=100,H=100;
const SNAP={image:'data:image/jpeg;base64,AAAA',subject:'maths',title:'Algebra',w:W,h:H};
const ITEMS=[{n:1,text:FIX.problem,cx:50,cy:30,band:[25,35],key:'k1'},{n:2,text:'x-5=2',cx:50,cy:70,band:[65,75],key:'k2'}];
/** A fresh desk with a scratch learner seated and no page. */
function blank(){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'degraded-scratch',name:'Scratch',type:'other'}});store.dispatch({type:'profile.save'});
}
/** The same desk with one read maths page, on the page screen. */
function onPage(){
 blank();
 store.dispatch({type:'page.reading',page:{id:'maths-1',subject:'maths',title:'Sheet',img:'',w:W,h:H}});
 store.dispatch({type:'page.read',id:'maths-1',items:ITEMS,readMs:1,provider:'test'});
 assert.equal(store.getSession().screen,'page');
}
const opts=(row)=>(row.todo?{todo:row.todo}:{});
/** The status line a failed run leaves: the desk sentence alone, none of the engine's words. */
function saidOnly(s,sentence){
 assert.equal(s.status,sentence,'the status line is the desk sentence alone');
 assert(!/x\s*=\s*4|\b4\b/.test(s.status),`the status line carries the answer: ${s.status}`);
}

/**
 * A failure that asking again would only repeat (a ceiling, a refusal: `again: false` on the row) is not offered Try
 * again: the retry is refused with the desk's sentence, the job stays failed and the engine is not asked a second time.
 */
async function refusedAgain(kind){
 const before=store.getSession(),r=await retry(kind),body=await r.json();
 assert.equal(r.status,409,'Try again is refused: it would end the same way');assert.equal(body.error,NOT_AGAIN);
 const t=store.getSession();
 assert.equal(t.jobs[kind].phase,'failed');assert.equal(t.jobs[kind].id,before.jobs[kind].id,'no second run was started');
}

// ---- the page read ----
for(const row of FIX.read){
 test(`read: ${row.name}`,opts(row),async()=>{
  blank();stubVision(row.answer);
  const r=await post('read',SNAP),body=await r.json(),e=row.expect;
  const s=store.getSession(),page=s.pages[0];
  assert.equal(s.reading,false,'the TV is not left saying "reading"');
  assert.equal(s.pages.length,1,'one page on the desk');
  if(e.fails){
   assert.equal(r.status,502);assert.equal(body.error,e.fails);
   assert.equal(s.jobs.read.phase,'failed');assert.equal(s.jobs.read.error,e.fails);saidOnly(s,e.fails);
   assert.deepEqual(page.items,[],'the failed page stays on the desk, empty');assert.equal(page.provider,'error');
   stubVision(FIX.good.read);
   if(e.again===false)return refusedAgain('read');
   const again=await retry('read');
   assert.equal(again.status,200,'a retry reads the same page once the engine is back');
   const t=store.getSession();assert.equal(t.pages.length,1);assert.equal(t.pages[0].id,page.id);assert.equal(t.pages[0].items.length,2);
   return;
  }
  assert.equal(r.status,200);assert.equal(s.jobs.read.phase,'done');
  if(e.lands!==undefined){assert.equal(page.items.length,e.lands);assert.match(s.status,new RegExp(`^${e.lands} items read`),'the status line says what was found');}
  if(e.inPage)for(const it of page.items){
   assert(it.cx>=0&&it.cx<=W&&it.cy>=0&&it.cy<=H,`item ${it.n} is centred outside the page: (${it.cx}, ${it.cy})`);
   assert(it.band[0]>=0&&it.band[1]<=H&&it.band[0]<=it.band[1],`item ${it.n} has a band the TV cannot crop: [${it.band}]`);
  }
  if(e.noBlankItems)for(const it of page.items)assert(it.text.trim(),`item ${it.n} is blank`);
 });
}

// ---- the hint ----
for(const row of FIX.hint){
 test(`hint: ${row.name}`,opts(row),async()=>{
  onPage();stubText({hint:row.answer});
  const r=await post('hint',{}),body=await r.json(),e=row.expect;
  await drain();
  const s=store.getSession();
  if(e.fails){
   assert.equal(r.status,502);assert.equal(body.error,e.fails);
   assert.equal(s.jobs.hint.phase,'failed');assert.equal(s.jobs.hint.error,e.fails);saidOnly(s,e.fails);
   assert.equal(s.screen,'page','the TV stays on the page');assert.equal(s.hint,null,'no hint card');assert.equal(s.log.hints,0,'a failed hint is not counted');
   stubText({});
   if(e.again===false)return refusedAgain('hint');
   const again=await retry('hint');
   assert.equal(again.status,200,'a retry asks again once the engine is back');await drain();
   assert.equal(store.getSession().hint?.hint1?.hint,FIX.good.hint.hint);
   return;
  }
  if(e.withheld){
   assert.equal(r.status,200);
   const shown=s.hint?.hint1;
   assert(shown&&shown.hint.trim(),'a hint is shown');
   assert(!leaks(FIX.problem,shown.hint),`the hint on the TV gives the answer away: ${shown.hint}`);
   assert.equal(shown.next,'','nothing to try next that could carry the answer');
   assert.equal(body.hint,shown.hint);
  }
  if(e.neverBlank){
   if(r.status===200){
    assert(String(body.hint??'').trim(),'the route answered a blank hint');
    assert(String(s.hint?.hint1?.hint??'').trim(),'the TV shows a blank hint card');
   }else{
    assert.equal(r.status,502);assert.equal(s.jobs.hint.phase,'failed');assert.equal(s.hint,null);
   }
  }
 });
}

// ---- the lesson pick behind a hint ----
for(const row of FIX.lesson){
 test(`lesson: ${row.name}`,opts(row),async()=>{
  onPage();stubText({lesson:row.answer});
  const r=await post('hint',{});
  assert.equal(r.status,200,'the hint itself lands');await drain();
  const s=store.getSession(),e=row.expect;
  assert.notEqual(s.jobs?.lesson?.phase,'running','the lesson pick ended: no endless "finding the lesson"');
  if(e.noLesson){assert.equal(s.lesson,null);assert.equal(s.noLesson,true,'the TV says no lesson covers this');}
  if(e.lesson){assert.equal(s.lesson?.id,e.lesson);assert.equal(s.noLesson,false);}
  if(e.whyWithheld)assert(!leaks(FIX.problem,s.lesson.why),`the lesson's why gives the answer away: ${s.lesson.why}`);
 });
}

/**
 * Every way an attempt can end without an answer to judge, read from the EngineErrorKind union in types.ts (comments
 * stripped) rather than kept here by hand: a kind added there is a row owed here. `shape` is not thrown - it is what the
 * engine makes of a malformed raw answer, and the prose / empty / wrong-type rows are its cases.
 */
function attemptKinds(){
 const t=fs.readFileSync(src('lib/engines/types.ts'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 const m=/export\s+type\s+EngineErrorKind\s*=\s*([^;]+);/.exec(t);
 assert(m,'types.ts declares EngineErrorKind');
 return [...m[1].matchAll(/"([a-z]+)"/g)].map((x)=>x[1]).filter((k)=>k!=='shape');
}
test('GUARD: the matrix covers every pipeline, and the read and the hint each meet every way an attempt can fail',()=>{
 for(const k of ['read','hint','lesson'])assert(FIX[k].length>0,`no ${k} rows`);
 const kinds=attemptKinds();
 assert(kinds.length>=3&&kinds.includes('timeout'),`the EngineErrorKind union was not read: ${kinds}`);
 for(const pipe of ['read','hint']){
  const thrown=new Set(FIX[pipe].map((r)=>r.answer&&r.answer.$throw).filter(Boolean));
  for(const kind of kinds)assert(thrown.has(kind),`no ${pipe} row where the engine fails with ${kind}`);
 }
});
