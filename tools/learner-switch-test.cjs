/**
 * LEARNER SWITCHING, THE STORE SIDE (delivery 7a): what a switch of learner, a saved profile, a draft patch, a Sentence
 * reading in flight, a bad session.json and a phone's reset must and must not do. One case per part of the delivery:
 * P1 (load, draft, save), P2 (one clear function: switchedFrom), robustness-6 (failed runs do not follow a switch),
 * P3 (a Sentence reading carries its owner), P5 (profile ids), P6 (what a phone may post).
 * Run with npm test in desk/ (directly: node tools/learner-switch-test.cjs). No live model is called: the text engine is
 * a stub, and the data directory is disposable, under the OS temp dir; never desk/data. The load cases come last, because
 * they swap the store module out from under the routes.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-learner-switch-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
assert.ok(!path.resolve(data).startsWith(path.resolve(root,'data')),'never desk/data');
fs.mkdirSync(data,{recursive:true});

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
const engine=require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
let answer=async()=>{throw new Error('the text engine was called');};
engine.text=(req)=>answer(req);
const storeFile=src('lib/session/store.ts');
let store=require(storeFile);
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>{reg.resetProviders();answer=async()=>{throw new Error('the text engine was called');};});
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const catchErrors=()=>{const real=console.error,errs=[];console.error=(...a)=>{errs.push(a.join(' '));};return {errs,done:()=>{console.error=real;}};};
const withErrors=(f)=>{const c=catchErrors();try{f();}finally{c.done();}return c.errs;};
const req=(url,{method='GET',role,body}={})=>{const headers={'Content-Type':'application/json'};if(role)headers['x-desk-role']=role;
 return new Request('http://desk'+url,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});};
const postSession=(e,role)=>route('session').POST(req('/api/session',{method:'POST',role,body:e}));
const postAnalyse=(body)=>route('analyse').POST(req('/api/analyse',{method:'POST',body}));
const SJ=()=>path.join(data,'session.json');

/** A desk with ema seated and all five of her things on it. */
const seatedWithWork=(id='ema')=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id});
 const s=store.getSession();
 globalThis.__desk.session={...s,conversation:{id:'c1',turns:[]},check:{level:'A2'},english:{sentence:'x'},worked:{topic:'t',owner:id},workroom:{owner:id}};
 return globalThis.__desk.session;
};
const five=(s)=>[s.conversation,s.check,s.english,s.worked,s.workroom];
const failed=(id,error)=>({id,phase:'failed',startedAt:1,endedAt:2,error});

// ---- P2: one clear function ----
test('P2: saving a new profile from a seated learner\'s desk clears all five',()=>{
 seatedWithWork();assert.ok(five(store.getSession()).every(Boolean));
 store.dispatch({type:'profile.draft',patch:{name:'Zed'}});store.dispatch({type:'profile.save'});
 const s=store.getSession();assert.equal(s.learner.name,'Zed');assert.deepEqual(five(s),[null,null,null,null,null]);
});
test('P2: saving the seated learner\'s own profile keeps the running conversation',()=>{
 seatedWithWork();
 store.dispatch({type:'profile.draft',patch:{id:'ema',name:'Ema'}});store.dispatch({type:'profile.save'});
 const s=store.getSession();assert.equal(s.learner.id,'ema');assert.ok(s.conversation,'the conversation is kept');
});
test('P2: learner.set to another learner clears all five',()=>{
 seatedWithWork();store.dispatch({type:'learner.set',id:'jakub'});
 assert.deepEqual(five(store.getSession()),[null,null,null,null,null]);
});
test('P2: the learner.set and profile.save cases both call switchedFrom (source pin)',()=>{
 const t=fs.readFileSync(storeFile,'utf8');
 const set=t.slice(t.indexOf('case "learner.set"'),t.indexOf('case "profile.draft"'));
 const save=t.slice(t.indexOf('case "profile.save"'),t.indexOf('case "profile.discard"'));
 assert.match(set,/switchedFrom\(/);assert.match(save,/switchedFrom\(/);
});

// ---- robustness-6: a failed run is the learner's who asked ----
test('robustness-6: after learner.set the failed read, hint and practice runs are gone, and so is their error status',()=>{
 seatedWithWork();
 globalThis.__desk.session={...store.getSession(),status:'The desk could not come up with a hint just now.',jobs:{read:failed('r1','The desk could not read that page.'),hint:failed('h1','The desk could not come up with a hint just now.'),practice:failed('p1','The desk could not write that set.')}};
 store.dispatch({type:'learner.set',id:'jakub'});
 const s=store.getSession();assert.equal(s.jobs.read,undefined);assert.equal(s.jobs.hint,undefined);assert.equal(s.jobs.practice,undefined);assert.equal(s.status,'');
});
test('robustness-6: a status that is not a deleted job\'s error is left alone',()=>{
 seatedWithWork();
 globalThis.__desk.session={...store.getSession(),status:'something else',jobs:{read:failed('r1','The desk could not read that page.')}};
 store.dispatch({type:'learner.set',id:'jakub'});
 assert.equal(store.getSession().status,'something else');
});
test('robustness-6: a running analyse run is gone after a switch, and a done run is kept',()=>{
 seatedWithWork();
 globalThis.__desk.session={...store.getSession(),jobs:{analyse:{id:'a1',phase:'running',startedAt:1},lesson:{id:'l1',phase:'done',startedAt:1,endedAt:2}}};
 store.dispatch({type:'learner.set',id:'jakub'});
 const s=store.getSession();assert.equal(s.jobs.analyse,undefined);assert.equal(s.jobs.lesson?.phase,'done');
});

const plantRunning=()=>{
 seatedWithWork();
 const E='The desk could not write that set.';
 globalThis.__desk.session={...store.getSession(),status:E,jobs:{practice:{id:'p1',phase:'running',startedAt:1},read:failed('r1',E),hint:failed('h1','The desk could not come up with a hint just now.'),analyse:{id:'a1',phase:'running',startedAt:1},lesson:{id:'l1',phase:'done',startedAt:1,endedAt:2}}};
};
const droppedAll=(s)=>{assert.equal(s.jobs.practice,undefined);assert.equal(s.jobs.read,undefined);assert.equal(s.jobs.hint,undefined);assert.equal(s.jobs.analyse,undefined);assert.equal(s.jobs.lesson?.phase,'done');assert.equal(s.status,'');};
test('robustness-6: a switch while a practice run is running still drops the failed runs and the analyse run',()=>{
 plantRunning();store.dispatch({type:'learner.set',id:'jakub'});droppedAll(store.getSession());
});
test('robustness-6: a profile save to a new learner while a practice run is running drops them too',()=>{
 plantRunning();
 store.dispatch({type:'profile.draft',patch:{name:'Zed'}});store.dispatch({type:'profile.save'});
 droppedAll(store.getSession());
});
test('robustness-6: control, a focus event while a practice run is running changes no job and no status',()=>{
 plantRunning();store.dispatch({type:'focus',focus:0});
 const s=store.getSession();
 assert.equal(s.jobs.practice?.phase,'running');assert.equal(s.jobs.read?.phase,'failed');assert.equal(s.jobs.hint?.phase,'failed');assert.equal(s.jobs.analyse?.phase,'running');assert.equal(s.jobs.lesson?.phase,'done');
 assert.equal(s.status,'The desk could not write that set.');
});

// ---- P8: a dropped run's start status goes with it ----
const running=(id,start)=>({id,phase:'running',startedAt:1,start});
test('P8: a switch that drops a running analyse run clears its start status',()=>{
 seatedWithWork();
 globalThis.__desk.session={...store.getSession(),status:'reading your sentence…',jobs:{analyse:running('a1','reading your sentence…')}};
 store.dispatch({type:'learner.set',id:'jakub'});
 const s=store.getSession();assert.equal(s.jobs.analyse,undefined);assert.equal(s.status,'');
});
test('P8: a switch that drops a running practice run clears its start status',()=>{
 seatedWithWork();
 globalThis.__desk.session={...store.getSession(),status:'writing a practice set…',jobs:{practice:running('p1','writing a practice set…')}};
 store.dispatch({type:'learner.set',id:'jakub'});
 const s=store.getSession();assert.equal(s.jobs.practice,undefined);assert.equal(s.status,'');
});
test('P8: a status that is no longer the start text is left alone',()=>{
 seatedWithWork();
 globalThis.__desk.session={...store.getSession(),status:'something else',jobs:{analyse:running('a1','reading your sentence…'),practice:running('p1','writing a practice set…')}};
 store.dispatch({type:'learner.set',id:'jakub'});
 assert.equal(store.getSession().status,'something else');
});
test('P8: a real analyse run records its start text on the job',async()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 let release;answer=async()=>new Promise((r)=>{release=()=>r({json:{explanation:'x'},provider:'stub'});});
 const a=postAnalyse({kind:'english',sentence:'I have seen him yesterday.'});
 await new Promise((r)=>setTimeout(r,20));
 assert.equal(store.getSession().status,'reading your sentence…');assert.equal(store.getSession().jobs.analyse.start,'reading your sentence…');
 store.dispatch({type:'learner.set',id:'jakub'});assert.equal(store.getSession().status,'');
 const c=catchErrors();try{release();await a;}finally{c.done();}
});

// ---- P7-a: an unreadable learners.json is one desk sentence, never 'Try again' ----
const LJ=()=>path.join(data,'learners.json');
/** A learners.json holding one learner, cut short by five bytes: it parses as nothing. */
const truncatedBook=()=>{const l=require(src('lib/session/learners.ts'));fs.rmSync(LJ(),{force:true});l.saveEnglish('ema',{...l.blank('ema').english});const b=fs.readFileSync(LJ());fs.writeFileSync(LJ(),b.subarray(0,b.length-5));return fs.readFileSync(LJ());};
test('P7-a (b): a run that fails on an unreadable learners.json says one desk sentence, not Try again',async()=>{
 const job=require(src('lib/desk/job.ts')),l=require(src('lib/session/learners.ts'));
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 const was=truncatedBook();
 const c=catchErrors();let r;try{r=await job.runJob('memory',async()=>{l.saveEnglish('ema',l.blank('ema').english);});}finally{c.done();}
 assert.equal(r.ok,false);
 const s=store.getSession();
 assert.equal(s.jobs.memory.phase,'failed');assert.equal(s.jobs.memory.error,store.LEARNER_UNREAD_RUN);assert.equal(s.status,store.LEARNER_UNREAD_RUN);
 assert.doesNotMatch(s.status,/Try again/);assert.equal(store.LEARNER_UNREAD_RUN,'The learner file could not be read just now, so this was not saved.');
 assert.ok(fs.readFileSync(LJ()).equals(was),'learners.json is untouched');
 fs.rmSync(LJ(),{force:true});
});
test('P7-a (b): control, any other failure still says Try again',async()=>{
 const job=require(src('lib/desk/job.ts'));
 store.dispatch({type:'reset'});
 const c=catchErrors();try{await job.runJob('memory',async()=>{throw new Error('boom');});}finally{c.done();}
 assert.match(store.getSession().jobs.memory.error,/Try again\.$/);
});

// ---- robustness-1: a run writes its status line only while its learner is seated ----
const job1=()=>require(src('lib/desk/job.ts'));
const held1=()=>{let open;const p=new Promise((r)=>{open=r;});return {p,open};};
const KINDS1=['read','hint','lesson','mark','explain'];
const heldRun=(kind,{fail=false}={})=>{
 const g=held1();
 const p=job1().runJob(kind,async()=>{await g.p;if(fail)throw new Error('boom');return 1;},{start:`${kind} start`,done:()=>`${kind} done`});
 return {p,open:g.open};
};
for(const kind of KINDS1){
 test(`robustness-1 (a): a ${kind} run that succeeds after a switch does not write its done line on the next learner's desk`,async()=>{
  seatedWithWork('ema');const r=heldRun(kind);
  store.dispatch({type:'learner.set',id:'jakub'});
  r.open();assert.equal((await r.p).ok,true);
  const s=store.getSession();assert.notEqual(s.status,`${kind} done`);assert.equal(s.learner.id,'jakub');assert.equal(s.jobs[kind].phase,'done');
 });
 test(`robustness-1 (b): a ${kind} run that fails after a switch does not write its failure sentence on the next learner's desk`,async()=>{
  seatedWithWork('ema');const r=heldRun(kind,{fail:true});
  store.dispatch({type:'learner.set',id:'jakub'});
  const c=catchErrors();let res;try{r.open();res=await r.p;}finally{c.done();}
  assert.equal(res.ok,false);
  const s=store.getSession();assert.notEqual(s.status,res.error);assert.equal(s.status,'');
  assert.equal(s.jobs[kind],undefined,"P11 (i): the failure of the learner who left leaves no failed job on the next learner's desk");
 });
}
test('robustness-1 (c): a hint held at the engine across a switch does not write its done line on the next learner',async()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 store.dispatch({type:'page.reading',page:{id:'maths-1',subject:'maths',title:'Sheet',img:'',w:100,h:100}});
 store.dispatch({type:'page.read',id:'maths-1',items:[{n:1,text:'2x+3=11',cx:0,cy:0,band:[0,10],key:'k1'}],readMs:1,provider:'test'});
 const g=held1();let asked=0;
 answer=async(r)=>{const k=Object.keys(r.schema?.properties??{});if(k.includes('hint')){asked++;await g.p;return {json:{hint:'Undo the +3 first.',what_to_try_next:'What is left?'},provider:'stub'};}return {json:{lesson:'none',why:'x'},provider:'stub'};};
 const post=route('hint').POST(req('/api/hint',{method:'POST',body:{}}));
 for(let i=0;i<200&&!asked;i++)await new Promise((r)=>setImmediate(r));
 assert.equal(asked,1);assert.equal(store.getSession().status,'thinking about a hint…');
 store.dispatch({type:'learner.set',id:'jakub'});
 assert.equal(store.getSession().status,'','the start line went with the switch');
 g.open();await post;for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));
 assert.doesNotMatch(store.getSession().status,/^hint in /);assert.doesNotMatch(store.getSession().status,/thinking about a hint/);
});
test('robustness-1 (d): after a switch the surviving run keeps its job, but its start text is gone from the status line',async()=>{
 seatedWithWork('ema');const r=heldRun('hint');
 assert.equal(store.getSession().status,'hint start');
 store.dispatch({type:'learner.set',id:'jakub'});
 const s=store.getSession();assert.equal(s.status,'');assert.equal(s.jobs.hint.phase,'running');assert.equal(s.jobs.hint.start,'hint start');
 r.open();await r.p;
});
test('robustness-1 (d): a status that is not the surviving run\'s start text is left alone',async()=>{
 seatedWithWork('ema');const r=heldRun('hint');
 store.dispatch({type:'status',text:'something else'});
 store.dispatch({type:'learner.set',id:'jakub'});
 assert.equal(store.getSession().status,'something else');
 r.open();await r.p;
});
test('robustness-1 (e): control, a run whose learner stays seated writes its done line',async()=>{
 seatedWithWork('ema');const r=heldRun('mark');r.open();await r.p;
 assert.equal(store.getSession().status,'mark done');
});
test('robustness-1 (e): control, a run whose learner stays seated writes its failure line',async()=>{
 seatedWithWork('ema');const r=heldRun('mark',{fail:true});
 const c=catchErrors();let res;try{r.open();res=await r.p;}finally{c.done();}
 assert.equal(store.getSession().status,res.error);assert.notEqual(res.error,'');
});
test('robustness-1 (e): control, a run whose learner left and came back (ema, jakub, ema) writes its done line',async()=>{
 seatedWithWork('ema');const r=heldRun('explain');
 store.dispatch({type:'learner.set',id:'jakub'});store.dispatch({type:'learner.set',id:'ema'});
 r.open();await r.p;
 assert.equal(store.getSession().status,'explain done');
});
test('robustness-1 (e): control, a run with no one seated at both moments writes its done line',async()=>{
 store.dispatch({type:'reset'});assert.equal(store.getSession().learner,null);
 const r=heldRun('read');r.open();await r.p;
 assert.equal(store.getSession().status,'read done');
});

// ---- P11 (delivery 7d-2): a run of the learner who left neither blocks nor leaves a retry for the next learner ----
const settle=async()=>{for(let i=0;i<60;i++)await new Promise((r)=>setImmediate(r));};
const withPage=(key='k1',id='maths-1')=>{
 store.dispatch({type:'page.reading',page:{id,subject:'maths',title:'Sheet',img:'',w:100,h:100}});
 store.dispatch({type:'page.read',id,items:[{n:1,text:'2x+3=11',cx:0,cy:0,band:[0,10],key}],readMs:1,provider:'test'});
};
const postHint=(body={})=>route('hint').POST(req('/api/hint',{method:'POST',body}));
const postRetry=(kind)=>route('session/retry').POST(req('/api/session/retry',{method:'POST',body:{kind}}));
/** A text stub where each hint call waits on its own gate, in the order they are asked; a lesson pick answers at once unless `pick` says otherwise. */
const gatedHints=(gates,pick)=>{let n=0;const calls={hint:0,lesson:0};
 answer=async(r)=>{const k=Object.keys(r.schema?.properties??{});
  if(k.includes('hint')){const i=n++;calls.hint++;await gates[i]?.p;return {json:{hint:`hint ${i}`,what_to_try_next:'next'},provider:'stub'};}
  calls.lesson++;return pick?pick(r):{json:{lesson:'none',why:'x'},provider:'stub'};};
 return calls;};
const until=async(f)=>{for(let i=0;i<200&&!f();i++)await new Promise((r)=>setImmediate(r));assert.ok(f(),'condition not reached');};
test('P11 (ii): the next learner\'s hint is not refused while the learner who left has one running; each lands on its own learner',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1();const calls=gatedHints([gA]);
 const pA=postHint();await until(()=>calls.hint===1);
 store.dispatch({type:'learner.set',id:'jakub'});withPage('kb','maths-b');
 const rB=await postHint();assert.equal(rB.status,200,'B is not refused');
 await settle();
 let s=store.getSession();assert.equal(s.hint.hint1.hint,'hint 1');assert.equal(s.hint.owner,'jakub');
 gA.open();assert.equal((await pA).status,200);await settle();
 s=store.getSession();assert.equal(s.hint.hint1.hint,'hint 1',"A's late hint did not replace B's");assert.equal(s.hint.owner,'jakub');
 assert.equal(s.away.ema.hint.hint1.hint,'hint 0');assert.equal(s.away.ema.hint.owner,'ema');
});
test('P11 (ii): the same through runJob for another kind (mark)',async()=>{
 seatedWithWork('ema');const r=heldRun('mark');
 store.dispatch({type:'learner.set',id:'jakub'});
 const second=await job1().runJob('mark',async()=>2,{done:()=>'B done'});
 assert.equal(second.ok,true,'not refused');assert.equal(store.getSession().jobs.mark.by,'jakub');
 r.open();assert.equal((await r.p).ok,true);
 const s=store.getSession();assert.equal(s.jobs.mark.by,'jakub',"the old run is no longer current: its late job.done is dropped");assert.equal(s.status,'B done');
});
test('P11 control: the seated learner\'s second request while their own run is running is still refused 409 BUSY',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1();const calls=gatedHints([gA]);
 const pA=postHint();await until(()=>calls.hint===1);
 const again=await postHint();assert.equal(again.status,409);assert.equal(calls.hint,1,'no second engine call');
 const viaJob=await job1().runJob('hint',async()=>1);assert.equal(viaJob.ok,false);assert.equal(viaJob.status,409);
 gA.open();await pA;await settle();
});
test('P11 (i): a run that fails after the switch leaves no failed job, and retry answers 409 with no engine call',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1();let calls=0;
 answer=async()=>{calls++;await gA.p;throw new Error('boom');};
 const pA=postHint();await until(()=>calls===1);
 store.dispatch({type:'learner.set',id:'jakub'});withPage('kb','maths-b');
 const c=catchErrors();try{gA.open();assert.equal((await pA).status,502);await settle();}finally{c.done();}
 assert.equal(store.getSession().jobs.hint,undefined,"no failed hint on B's desk");
 const r=await postRetry('hint');assert.equal(r.status,409);assert.equal(calls,1,'no engine was called');
});
test('P11 (i): retry refuses a failed job whose by is not the seated learner (a restored session)',async()=>{
 seatedWithWork('jakub');withPage('k1','maths-1');
 const job={id:'h1',phase:'failed',startedAt:1,endedAt:2,error:'x',key:'k1',input:{itemIx:0,askedQ:''}};
 let calls=0;answer=async()=>{calls++;return {json:{hint:'h',what_to_try_next:'n'},provider:'stub'};};
 globalThis.__desk.session={...store.getSession(),jobs:{hint:{...job,by:'ema'}}};
 const r=await postRetry('hint');assert.equal(r.status,409);assert.equal(calls,0);
 globalThis.__desk.session={...store.getSession(),jobs:{hint:{...job,by:'jakub'}}};
 assert.equal((await postRetry('hint')).status,200,'control: the seated learner\'s own failed job is retried');
 await settle();
});

// ---- P10-a (delivery 7d-2): a hint's lesson pick runs for the learner who asked and speaks only while they are seated ----
test('P10-a: a hint that returns after a switch leaves B\'s desk without a lesson line; A\'s away slot holds the pick and A finds it on return',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1();const calls=gatedHints([gA]);
 const pA=postHint();await until(()=>calls.hint===1);
 store.dispatch({type:'learner.set',id:'jakub'});withPage('kb','maths-b');
 const before=store.getSession();
 gA.open();assert.equal((await pA).status,200);await settle();
 assert.equal(calls.lesson,1,'the pick still ran, for A');
 let s=store.getSession();
 assert.doesNotMatch(s.status,/no lesson covers|lesson:|finding the lesson/);
 assert.equal(s.lesson,before.lesson);assert.equal(s.noLesson,before.noLesson);assert.equal(s.hint,before.hint);
 assert.equal(s.away.ema.noLesson,true,'A\'s away slot holds the none pick');assert.equal(s.away.ema.hint.owner,'ema');
 store.dispatch({type:'learner.set',id:'ema'});
 s=store.getSession();assert.equal(s.noLesson,true);assert.equal(s.hint.hint1.hint,'hint 0');
});
test('P10-a: A\'s late pick does not replace B\'s running pick, and B\'s pick lands on B',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1(),gPick=held1();
 const calls=gatedHints([gA],async()=>{await gPick.p;return {json:{lesson:'none',why:'x'},provider:'stub'};});
 const pA=postHint();await until(()=>calls.hint===1);
 store.dispatch({type:'learner.set',id:'jakub'});withPage('kb','maths-b');
 assert.equal((await postHint()).status,200);await until(()=>calls.lesson===1);
 assert.equal(store.getSession().jobs.lesson.by,'jakub');
 gA.open();assert.equal((await pA).status,200);await settle();
 assert.equal(calls.lesson,1,'A\'s pick did not start');
 assert.equal(store.getSession().jobs.lesson.by,'jakub');assert.equal(store.getSession().jobs.lesson.phase,'running');
 gPick.open();await settle();
 const s=store.getSession();assert.equal(s.noLesson,true,'B\'s pick landed on B');assert.equal(s.jobs.lesson.phase,'done');
});

// ---- P13 (delivery 7d-3): a hint's wait for its lesson ends when its pick ends without one, seated or away ----
/** Picks that answer in the order they are asked: each waits on its own gate, and a gate marked to fail throws. */
const gatedPicks=(gates)=>{let n=0;return async()=>{const g=gates[n++];await g?.p;if(g?.fail)throw new Error('boom');return {json:{lesson:'none',why:'x'},provider:'stub'};};};
const gate=(fail=false)=>({...held1(),fail});
const quiet=async(f)=>{const c=catchErrors();try{return await f();}finally{c.done();}};
const snap=(s)=>({lesson:s.lesson,noLesson:s.noLesson,hint:s.hint?.hint1?.hint});
test('P13 (a): a pick refused at the start (B\'s own pick is running) still ends the wait for A\'s hint in A\'s away slot',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1(),gB=gate();
 const calls=gatedHints([gA],gatedPicks([gB]));
 const pA=postHint();await until(()=>calls.hint===1);
 store.dispatch({type:'learner.set',id:'jakub'});withPage('kb','maths-b');
 assert.equal((await postHint()).status,200);await until(()=>calls.lesson===1);
 gA.open();assert.equal((await pA).status,200);await settle();
 assert.equal(calls.lesson,1,'A\'s pick never started');
 let s=store.getSession();assert.equal(s.away.ema.noLesson,true,'A\'s wait ended');assert.equal(s.away.ema.lesson,null);
 assert.equal(s.noLesson,false,'B\'s own pick has not landed, and A did not touch B');assert.equal(s.lesson,null);assert.equal(s.jobs.lesson.by,'jakub');
 gB.open();await settle();
 s=store.getSession();assert.equal(s.noLesson,true);
 store.dispatch({type:'learner.set',id:'ema'});s=store.getSession();assert.equal(s.noLesson,true);assert.equal(s.hint.hint1.hint,'hint 0');
});
test('P13 (b): a pick that fails after the switch ends the wait for A\'s hint in A\'s away slot',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1(),gP=gate(true);
 const calls=gatedHints([gA],gatedPicks([gP]));
 const pA=postHint();await until(()=>calls.hint===1);
 gA.open();assert.equal((await pA).status,200);await until(()=>calls.lesson===1);
 store.dispatch({type:'learner.set',id:'jakub'});withPage('kb','maths-b');
 const before=snap(store.getSession());
 await quiet(async()=>{gP.open();await settle();});
 const s=store.getSession();
 assert.equal(s.away.ema.noLesson,true,'A\'s wait ended');assert.equal(s.away.ema.lesson,null);
 assert.deepEqual(snap(s),before,'B\'s lesson and noLesson are unchanged');
 assert.equal(s.jobs.lesson,undefined,'P11: no failed job on B\'s desk');
});
test('P13 (c): A\'s pick superseded by B\'s pick lands in A\'s away slot (its own keyed lesson.set), and B\'s pick lands on B',async()=>{
 seatedWithWork('ema');withPage();
 const gA=held1(),gP1=gate(),gP2=gate();
 const calls=gatedHints([gA],gatedPicks([gP1,gP2]));
 const pA=postHint();await until(()=>calls.hint===1);
 gA.open();assert.equal((await pA).status,200);await until(()=>calls.lesson===1);
 store.dispatch({type:'learner.set',id:'jakub'});withPage('kb','maths-b');
 assert.equal((await postHint()).status,200);await until(()=>calls.lesson===2);
 assert.equal(store.getSession().jobs.lesson.by,'jakub','B\'s pick replaced A\'s record');
 const before=snap(store.getSession());
 gP1.open();await settle();
 let s=store.getSession();
 assert.equal(s.away.ema.noLesson,true,'A\'s pick landed in A\'s slot');
 assert.deepEqual(snap(s),before,'B\'s lesson and noLesson are unchanged');
 gP2.open();await settle();
 s=store.getSession();assert.equal(s.noLesson,true,'B\'s pick landed on B');assert.equal(s.away.ema.noLesson,true);
});
test('P13 control: on the normal path noLesson is not true before the pick lands',async()=>{
 seatedWithWork('ema');withPage();
 const gP=gate();
 const calls=gatedHints([],gatedPicks([gP]));
 assert.equal((await postHint()).status,200);await until(()=>calls.lesson===1);await settle();
 let s=store.getSession();assert.equal(s.lesson,null);assert.equal(s.noLesson,false,'no flash of "no lesson"');
 gP.open();await settle();assert.equal(store.getSession().noLesson,true);
});
test('P13 control: a re-ask on the same item - the first pick failing does not set noLesson on the new hint',async()=>{
 seatedWithWork('ema');withPage();
 const gP1=gate(true),gP2=gate();
 const calls=gatedHints([],gatedPicks([gP1,gP2]));
 assert.equal((await postHint()).status,200);await until(()=>calls.lesson===1);
 assert.equal((await postHint()).status,200);await until(()=>calls.lesson===2);
 await quiet(async()=>{gP1.open();await settle();});
 let s=store.getSession();assert.equal(s.hint.hint1.hint,'hint 1');assert.equal(s.noLesson,false,'the new hint still waits for its own pick');
 gP2.open();await settle();assert.equal(store.getSession().noLesson,true);
});
test('P13 control: a lesson chosen on the TV (no key) still lands on the seated hint',()=>{
 seatedWithWork('ema');withPage();
 store.dispatch({type:'lesson.set',lesson:null});assert.equal(store.getSession().noLesson,true);
});

// ---- P4 with P4-a: the switcher says what a switch ends ----
test('P4: switchEndsLine names what the seated learner has running, and only for another learner',()=>{
 const {switchEndsLine}=require(src('tv/keys.ts'));
 seatedWithWork('ema');
 const base=store.getSession(),jakub=base.profiles.find((p)=>p.id==='jakub'),ema=base.profiles.find((p)=>p.id==='ema');
 const only=(o)=>({...base,conversation:null,check:null,jobs:{},...o});
 assert.equal(switchEndsLine(only({conversation:{id:'c1',turns:[]}}),jakub),`Switching to ${jakub.name} ends the Linga scene for ${ema.name}.`);
 assert.equal(switchEndsLine(only({check:{level:'A2'}}),jakub),`Switching to ${jakub.name} ends the level check for ${ema.name}.`);
 assert.equal(switchEndsLine(only({jobs:{analyse:{id:'a',phase:'running',startedAt:1,key:'english'}}}),jakub),`Switching to ${jakub.name} ends the Sentence reading for ${ema.name}.`);
 assert.equal(switchEndsLine(only({conversation:{id:'c1',turns:[]},check:{level:'A2'},jobs:{analyse:{id:'a',phase:'running',startedAt:1,key:'english'}}}),jakub),`Switching to ${jakub.name} ends the Linga scene, the level check and the Sentence reading for ${ema.name}.`);
 assert.equal(switchEndsLine(only({conversation:{id:'c1',turns:[]}}),null),`Switching to someone else ends the Linga scene for ${ema.name}.`);
 // nothing running, a finished reading, or the seated learner's own card: no line
 assert.equal(switchEndsLine(only({}),jakub),null);
 assert.equal(switchEndsLine(only({jobs:{analyse:{id:'a',phase:'running',startedAt:1,key:'essay'}}}),jakub),`Switching to ${jakub.name} ends the Essay Master reading for ${ema.name}.`);
 assert.equal(switchEndsLine(only({jobs:{analyse:{id:'a',phase:'done',startedAt:1,endedAt:2,key:'english'}}}),jakub),null);
 assert.equal(switchEndsLine(only({conversation:{id:'c1',turns:[]}}),ema),null);
 assert.equal(switchEndsLine({...only({conversation:{id:'c1',turns:[]}}),learner:null},jakub),null);
 assert.ok(!/—/.test(switchEndsLine(only({check:{level:'A2'}}),jakub)));
});
test('P4-b: a finished Linga scene is not named; a Take Two in progress and a paused scene are',()=>{
 const {switchEndsLine}=require(src('tv/keys.ts'));
 seatedWithWork('ema');
 const base=store.getSession(),jakub=base.profiles.find((p)=>p.id==='jakub'),ema=base.profiles.find((p)=>p.id==='ema');
 const only=(o)=>({...base,conversation:null,check:null,jobs:{},...o});
 const named=`Switching to ${jakub.name} ends the Linga scene for ${ema.name}.`;
 assert.equal(switchEndsLine(only({conversation:{id:'c1',phase:'finished',turns:[]}}),jakub),null);
 assert.equal(switchEndsLine(only({conversation:{id:'c1',phase:'finished',turns:[],takes:[{turns:[]}]}}),jakub),named);
 assert.equal(switchEndsLine(only({conversation:{id:'c1',phase:'finished',turns:[],takes:[{turns:[],endedAt:5}]}}),jakub),null);
 assert.equal(switchEndsLine(only({conversation:{id:'c1',paused:true,turns:[{id:'t1',role:'partner'}]}}),jakub),named);
});
test('P4: the TV Learner screen and the phone line both build their line with switchEndsLine (source pin)',()=>{
 assert.match(fs.readFileSync(src('tv/screens.tsx'),'utf8'),/switchEndsLine\(s, at\)/);
 assert.match(fs.readFileSync(src('app/phone/page.tsx'),'utf8'),/switchEndsLine\(s, null\)/);
});

// ---- P3: the Sentence reading carries its owner ----
test('P3: a Sentence reading that lands after a switch is dropped, and the new learner\'s own request is not refused',async()=>{
 seatedWithWork('ema');store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 let release,calls=0;
 answer=async()=>{calls++;if(calls===1)return new Promise((r)=>{release=()=>r({json:{explanation:'for ema'},provider:'stub'});});return {json:{explanation:'for jakub'},provider:'stub'};};
 const a=postAnalyse({kind:'english',sentence:'I have seen him yesterday.'});
 await new Promise((r)=>setTimeout(r,20));assert.ok(release,'ema\'s run is held in the engine');
 store.dispatch({type:'learner.set',id:'jakub'});
 const b=await postAnalyse({kind:'english',sentence:'She goes to school every day.'});
 assert.equal(b.status,200);assert.equal(store.getSession().english.explanation,'for jakub');
 const c=catchErrors();try{release();await a;}finally{c.done();}
 assert.equal(store.getSession().english.explanation,'for jakub','jakub\'s reading is his own');
 assert.equal(store.getSession().learner.id,'jakub');
 assert.equal(c.errs.filter((l)=>/a sentence reading for a learner who left the desk was dropped/.test(l)).length,1,JSON.stringify(c.errs));
});
test('P3: the analyse route\'s english.set carries owner: who.id (source pin)',()=>{
 assert.match(fs.readFileSync(src('app/api/analyse/route.ts'),'utf8'),/type: "english\.set", analysis: a, owner: who\.id/);
});

// ---- P5: profile ids ----
test('P5: a new draft never takes an id a profile holds',()=>{
 store.dispatch({type:'reset'});
 const real=Date.now;Date.now=()=>1234567;
 try{
  globalThis.__desk.session={...store.getSession(),profiles:[...store.getSession().profiles,{id:'p1234567',name:'Taken',type:'other',modules:[]}]};
  store.dispatch({type:'profile.draft',patch:{name:'N'}});
  assert.equal(store.getSession().draft.id,'p1234567-2');
  store.dispatch({type:'profile.discard'});
 }finally{Date.now=real;}
});
test('P5: with a draft open, a patch that names another id is refused',()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{id:'mine',name:'Mine'}});
 const was=store.getSession().draft;
 store.dispatch({type:'profile.draft',patch:{id:'other',name:'Other'}});
 assert.deepEqual(store.getSession().draft,was);
 assert.equal(store.getSession().status,'The desk did not take that change to the profile. A profile keeps the id it was made with.');
 store.dispatch({type:'profile.draft',patch:{id:'mine',name:'Mine again'}});assert.equal(store.getSession().draft.name,'Mine again');
});
test('P5: with no draft open, an id naming a profile starts an edit of it, and an id naming none starts a new draft',()=>{
 store.dispatch({type:'reset'});
 const ema=store.getSession().profiles.find((p)=>p.id==='ema');
 store.dispatch({type:'profile.draft',patch:{...ema,age:17}});
 let d=store.getSession().draft;assert.equal(d.id,'ema');assert.equal(d.name,'Ema');assert.equal(d.age,17);
 store.dispatch({type:'profile.discard'});
 store.dispatch({type:'profile.draft',patch:{id:'brandnew',name:'B'}});
 d=store.getSession().draft;assert.equal(d.id,'brandnew');assert.equal(d.name,'B');assert.equal(store.getSession().profiles.some((p)=>p.id==='brandnew'),false);
});

// ---- P1: draft and save ----
test('P1 draft: each bad field is refused with its exact status and the draft stays as it was',()=>{
 const REFUSED='The desk did not take that change to the profile. ';
 const bad=[
  [{type:'wizard'},'That school type is not one the desk knows.'],[{type:'constructor'},'That school type is not one the desk knows.'],
  [{system:'mars'},'That school system is not one the desk knows.'],
  [{modules:['maths','maths']},'Those subjects are not ones the desk knows.'],[{modules:['latin']},'Those subjects are not ones the desk knows.'],[{modules:'maths'},'Those subjects are not ones the desk knows.'],
  [{name:5},'A name must be text.'],
  [{age:12.5},'An age must be a whole number.'],[{age:'x'},'An age must be a whole number.'],
 ];
 store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{name:'Q'}});
 for(const [patch,why] of bad){
  const was=store.getSession().draft;store.dispatch({type:'status',text:''});
  store.dispatch({type:'profile.draft',patch});
  assert.deepEqual(store.getSession().draft,was,JSON.stringify(patch));assert.equal(store.getSession().status,REFUSED+why,JSON.stringify(patch));
 }
 assert.equal(store.profileProblem({type:'wizard'}),store.PROFILE_TYPE_UNKNOWN);assert.equal(store.profileProblem({modules:[]}),null);
});
test('P1 draft: a good patch is taken, an empty modules list and an age outside the range included',()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{name:'Quinn',type:'elementary',age:10,system:'cz',modules:[]}});
 const d=store.getSession().draft;assert.equal(d.name,'Quinn');assert.equal(d.age,10);assert.equal(d.system,'cz');assert.deepEqual(d.modules,[]);
 store.dispatch({type:'profile.draft',patch:{age:40}});assert.equal(store.getSession().draft.age,undefined,'out of range is deleted silently');
});
test('P1 save: a draft with a bad type is refused and the profiles, draft and seat stay',()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 const s={...store.getSession(),draft:{id:'zz',name:'Zed',type:'wizard',modules:[]}};
 const n=store.reduce(s,{type:'profile.save'});
 assert.deepEqual(n.profiles,s.profiles);assert.deepEqual(n.draft,s.draft);assert.equal(n.learner.id,'ema');
 assert.equal(n.status,'The desk did not save that profile. That school type is not one the desk knows.');
});

// ---- P6: what a phone may post ----
test('P6: a reset from a phone is refused and the desk is unchanged; the TV can reset',async()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 const profiles=JSON.parse(JSON.stringify(store.getSession().profiles));
 const r=await postSession({type:'reset'},'phone');
 assert.equal(r.status,403);assert.equal((await r.json()).error,'Only the TV can reset the desk.');
 assert.deepEqual(store.getSession().profiles,profiles);assert.equal(store.getSession().learner.id,'ema');
 const t=await postSession({type:'reset'},'tv');assert.equal(t.status,200);assert.equal(store.getSession().learner,null);
});
test('P6: a profile.draft carrying an id from a phone is refused; its name patch is not',async()=>{
 store.dispatch({type:'reset'});
 const r=await postSession({type:'profile.draft',patch:{id:'ema',name:'Hijack'}},'phone');
 assert.equal(r.status,403);assert.equal((await r.json()).error,'Only the TV can start editing a profile.');assert.equal(store.getSession().draft,null);
 const ok=await postSession({type:'profile.draft',patch:{name:'Mia'}},'phone');assert.equal(ok.status,200);assert.equal(store.getSession().draft.name,'Mia');
 const tv=await postSession({type:'profile.draft',patch:{id:store.getSession().draft.id,name:'Mia B'}},'tv');assert.equal(tv.status,200);
});

// ---- P1: load (last: it swaps the store module out from under the routes) ----
const reload=(content)=>{
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];
 for(const f of fs.readdirSync(data))if(f.startsWith('session.json'))fs.rmSync(path.join(data,f),{force:true});
 if(content!==null)fs.writeFileSync(SJ(),content);
 const c=catchErrors();try{store=require(storeFile);}finally{c.done();}
 return c.errs.filter((l)=>/session.json/.test(l));
};
const aside=()=>fs.readdirSync(data).filter((f)=>f.startsWith('session.json.bad-'));
const good={id:'good',name:'Good',type:'high-school',age:16,modules:['maths']};
test('P1 load: a session.json that is not JSON is set aside, whole, and the desk starts fresh with SESSION_UNREAD',()=>{
 const errs=reload('{not json');
 assert.equal(errs.length,1,JSON.stringify(errs));
 const kept=aside();assert.equal(kept.length,1);assert.equal(fs.readFileSync(path.join(data,kept[0]),'utf8'),'{not json');
 assert.equal(store.getSession().status,store.SESSION_UNREAD);assert.equal(store.SESSION_UNREAD,'The desk could not read its saved session, so it started fresh.');
 assert.equal(store.getSession().learner,null);assert.match(errs[0],new RegExp(kept[0].replace(/\./g,'\\.')));
});
test('P1 load: profiles that are not a list is set aside the same way',()=>{
 const body=JSON.stringify({profiles:'nope',learner:null});
 const errs=reload(body);
 assert.equal(errs.length,1,JSON.stringify(errs));assert.match(errs[0],/shape check/);
 const kept=aside();assert.equal(kept.length,1);assert.equal(fs.readFileSync(path.join(data,kept[0]),'utf8'),body);
 assert.equal(store.getSession().status,store.SESSION_UNREAD);
});
test('P1 load: a learner that is neither null nor an object with an id is set aside',()=>{
 const errs=reload(JSON.stringify({profiles:[good],learner:'ema'}));
 assert.equal(errs.length,1);assert.match(errs[0],/shape check/);assert.equal(aside().length,1);assert.equal(store.getSession().status,store.SESSION_UNREAD);
});
test('P1 load: a bad profile alone is dropped and said; the file is kept in use, not set aside, and the status is not touched',()=>{
 const errs=reload(JSON.stringify({profiles:[good,{id:'w',name:'W',type:'wizard',modules:[]},{...good,name:'Again'},{name:'Nameless',type:'other',modules:[]}],learner:null}));
 assert.deepEqual(store.getSession().profiles.map((p)=>p.id),['good']);assert.equal(store.getSession().profiles[0].name,'Good');
 assert.equal(errs.length,3,JSON.stringify(errs));assert.equal(aside().length,0);assert.notEqual(store.getSession().status,store.SESSION_UNREAD);assert.equal(store.getSession().status,'');
 assert.ok(fs.existsSync(SJ()),'the file is still in place');
});
test('P1 load: a type that is a key of Object.prototype is dropped, not passed',()=>{
 const errs=reload(JSON.stringify({profiles:[good,{id:'c',name:'C',type:'constructor',modules:[]}],learner:null}));
 assert.deepEqual(store.getSession().profiles.map((p)=>p.id),['good']);assert.equal(errs.length,1);
});
test('P1 load: the other fields of a kept profile are repaired, not the profile dropped',()=>{
 const errs=reload(JSON.stringify({profiles:[{id:'a',name:'A',type:'high-school',age:99,system:'mars',modules:['maths','nope','maths','essay']},{id:'b',name:'B',type:'other',age:30,modules:'all'}],learner:{id:'a',name:'A'}}));
 assert.deepEqual(errs,[]);
 const [a,b]=store.getSession().profiles;
 assert.equal(a.age,undefined);assert.equal(a.system,undefined);assert.deepEqual(a.modules,['maths','essay']);
 assert.equal(b.age,undefined);assert.deepEqual(b.modules,['maths','english','essay']);
 assert.equal(store.getSession().learner.id,'a','the seat stays as saved');
});
test('P1 load: no file logs nothing',()=>{
 assert.deepEqual(reload(null),[]);assert.equal(aside().length,0);
});

test('P7-a (a): a desk that starts with learners.json unreadable says LEARNER_UNREAD, and shows no paper',()=>{
 truncatedBook();
 reload(JSON.stringify({profiles:[good],learner:{id:'good',name:'Good'}}));
 const s=store.getSession();assert.equal(s.learner.id,'good');
 assert.equal(s.status,store.LEARNER_UNREAD);assert.equal(s.paper,null);
 fs.rmSync(LJ(),{force:true});
});
test('P7-a (a): control, a readable learners.json at startup leaves the status clear',()=>{
 const l=require(src('lib/session/learners.ts'));fs.rmSync(LJ(),{force:true});l.saveEnglish('good',l.blank('good').english);
 reload(JSON.stringify({profiles:[good],learner:{id:'good',name:'Good'}}));
 assert.notEqual(store.getSession().status,store.LEARNER_UNREAD);
 fs.rmSync(LJ(),{force:true});
});
