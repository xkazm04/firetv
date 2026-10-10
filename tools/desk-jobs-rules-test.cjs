/**
 * The homework pipelines as typed session jobs: one runner (lib/desk/job.ts), a `jobs` record in the session,
 * one run of a kind at a time, the lesson pick keyed to its hint, and no failure that leaves a screen waiting.
 * Run with npm test in desk/ (directly: node tools/desk-jobs-rules-test.cjs). No model is called - every engine
 * is stubbed at the provider registry - and the data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
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
 // the focus is the topic's place on the school path (W5b put 'Add and subtract fractions' first), not a fixed number
 const topics={...s,screen:'topics',focus:require(src('lib/library/syllabus.ts')).SYLLABUS.findIndex((t)=>t.id==='linear-two-step'),topic:'linear-two-step'};
 assert.deepEqual(tvKey({...topics,jobs:{practice:{id:'p',phase:'running',startedAt:0,key:'linear-two-step'}}},'select',LOCAL).calls,[]);
 const failed={...topics,jobs:{practice:{id:'p',phase:'failed',startedAt:0,key:'linear-two-step',error:'The desk could not write this set. Try again.'}}};
 assert.equal(practiceFailed(failed,'linear-two-step'),'The desk could not write this set. Try again.');assert.equal(practiceFailed(failed,'linear-one-step'),null);
 assert.deepEqual(tvKey(failed,'select',LOCAL).calls.map(c=>c.body),[{topic:'linear-two-step'}],'Select on the failed topic asks again');
 store.dispatch({type:'topic.open',topic:'linear-two-step'});assert.equal(store.getSession().focus,topics.focus,'the open topic keeps the focus');
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

test('case 5b: choosing or saving a learner goes to the desk with the lamp at rest, never into Math Buddy',()=>{
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'scratch-words',name:'Words',type:'other',modules:['english','essay']}});store.dispatch({type:'profile.save'});
 let s=store.getSession();assert.equal(s.learner.id,'scratch-words');assert.equal(s.screen,'landing','a saved profile opens the desk');assert.equal(s.focus,-1);
 store.dispatch({type:'nav',screen:'tonight'});store.dispatch({type:'learner.set',id:'scratch-words'});
 s=store.getSession();assert.equal(s.screen,'landing','a chosen learner opens the desk, not Tonight');assert.equal(s.focus,-1,'the lamp rests on what this learner left');
});

test('case 5c (S34 T4): a fresh desk seats no one - apps ask who first, no work is written for no one, and one pick seats a learner',async()=>{
 store.dispatch({type:'reset'});
 let s=store.getSession();
 assert.equal(s.learner,null,'a reset desk has no one at it');assert.equal(s.screen,'landing');
 assert.deepEqual(s.profiles.map(p=>p.id),['ema','jakub'],'the demo profiles stay on the switcher');
 store.dispatch({type:'nav',screen:'tonight'});
 s=store.getSession();assert.equal(s.screen,'learner','an app asked for with no one seated is the learner switcher');assert.equal(s.back,'landing');
 store.dispatch({type:'nav',screen:'landing'});
 for(const e of [{type:'page.reading',page:PAGE},{type:'practice.set',practice:{topic:'linear-one-step',items:[],marked:false}},{type:'topic.open',topic:'linear-one-step'},{type:'session.end'},{type:'timer.start'}])store.dispatch(e);
 s=store.getSession();
 assert.deepEqual([s.pages.length,s.practice,s.topic,s.screen,s.timer.running],[0,null,null,'landing',false],'nothing is written for no one');
 for(const [name,body] of [['read',SNAP],['practice',{topic:'linear-one-step'}],['analyse',{kind:'essay',text:'x',type:'argument'}]]){
  const r=await post(name,body);assert.equal(r.status,409,name);assert.match((await r.json()).error,/No one is at the desk/,name);
 }
 assert.deepEqual((await (await route('memory').POST()).json()).lines,[],'no evening to write down');
 store.dispatch({type:'learner.set',id:'ema'});
 s=store.getSession();assert.deepEqual(s.learner,{id:'ema',name:'Ema'});assert.equal(s.screen,'landing');assert.equal(s.focus,-1);
 assert.deepEqual(s.away??{},{},'the empty chair left nothing behind');
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

test('rewrite case 6: POST /api/session refuses essay.revised with 403, as it refuses essay.set',async()=>{
 onPage();
 const r=await session({type:'essay.revised',n:1,analysis:{text:'Forged.',type:'structure',sentences:[{n:1,text:'Forged.',words:1,connectors:[],role:'claim'}],stats:{},verdicts:[{n:1,verdict:'strong',note:'x'}],summary:'s'}});
 assert.equal(r.status,403);deskWorded((await r.json()).error);
 assert.equal(store.getSession().essay,null,'no revised reading was put on the desk from outside');
});

const watched=()=>require(src('lib/library/watched.ts'));
const {LESSONS}=require(src('lib/library/lessons.data.ts'));
const MATHS=LESSONS.filter((l)=>l.subject==='maths');
const lessonLine=(ref,at=1)=>({at,kind:'lesson',label:MATHS.find((l)=>l.id===ref)?.title??ref,detail:'watched',ref});
/** Open a library lesson the way Units does: its pick, then the lesson screen. */
const openLesson=(l)=>{store.dispatch({type:'lesson.set',lesson:{id:l.id,title:l.title,t:0,text:l.concepts.join(' · '),why:'x',youtube:l.youtube}});store.dispatch({type:'nav',screen:'lesson'});};
/** Wind the running watch back by `ms`, as if the lesson had been playing that long. */
const played=(ms)=>{const g=globalThis.__desk;g.session={...g.session,watch:{...g.session.watch,since:g.session.watch.since-ms}};};

test('watched case 1: the rule - half the running time, 30 s floor, 2 min cap; no history, no ticks: the first lesson is next and every other open',()=>{
 const W=watched();
 assert.equal(W.watchNeedMs(2),60000);assert.equal(W.watchNeedMs(0.5),30000,'the floor');assert.equal(W.watchNeedMs(9),120000,'the cap');assert.equal(W.watchNeedMs(undefined),120000,'no running time: the cap');
 assert.ok(!LESSONS.some((l)=>'done' in l),'the library claims nothing watched');
 assert.deepEqual(W.lessonStates(MATHS,[]),['next','open','open','open','open','open','open','open']);
 assert.deepEqual(W.lessonStates(MATHS,[{at:1,kind:'practice',label:MATHS[0].title,detail:'4 of 6 right'}]),W.lessonStates(MATHS,[]),'only a lesson line ticks a lesson');
 assert.deepEqual(W.lessonStates(MATHS,[lessonLine(MATHS[0].id)]),['done','next','open','later','later','later','later','later']);
 assert.deepEqual(W.lessonStates(MATHS,[lessonLine(MATHS[2].id)]),['next','open','done','later','later','later','later','later'],'a lesson skipped is still next');
});

test('watched case 2: a lesson played past its time writes one dated line in the seated learner\'s history, and Units ticks it; paused or short, nothing',()=>{
 store.dispatch({type:'reset'});
 for(const id of ['watch-a','watch-b']){store.dispatch({type:'profile.draft',patch:{id,name:id,type:'high-school'}});store.dispatch({type:'profile.save'});}
 store.dispatch({type:'learner.set',id:'watch-a'});store.dispatch({type:'subject',subject:'maths'});
 const W=watched(),u1=MATHS[0],need=W.lessonNeedMs(u1.id);
 openLesson(u1);
 let s=store.getSession();assert.equal(s.watch.id,u1.id);assert.equal(s.watch.owner,'watch-a');assert.notEqual(s.watch.since,null,'playing: the stretch runs');
 played(need-5000);store.dispatch({type:'lesson.watched'});
 assert.ok(!store.getSession().history.some((h)=>h.kind==='lesson'),'not yet played long enough: no line');
 store.dispatch({type:'lesson.pause',paused:true});s=store.getSession();
 assert.equal(s.watch.since,null,'paused: the stretch ends');assert.ok(s.watch.ms>=need-5000);
 const ms=s.watch.ms;store.dispatch({type:'focus',focus:0});store.dispatch({type:'lesson.watched'});
 assert.equal(store.getSession().watch.ms,ms,'paused time does not count');assert.ok(!store.getSession().history.some((h)=>h.kind==='lesson'),'still short: no line');
 store.dispatch({type:'lesson.pause',paused:false});played(6000);assert.ok(W.watchDue(store.getSession().watch,Date.now()));
 const t0=Date.now();store.dispatch({type:'lesson.watched'});
 s=store.getSession();const lines=s.history.filter((h)=>h.kind==='lesson');
 assert.equal(lines.length,1);assert.equal(lines[0].ref,u1.id);assert.equal(lines[0].label,u1.title);assert.ok(lines[0].at>=t0,'dated');
 assert.equal(W.lessonStates(MATHS,s.history)[0],'done','Units and the calendar tick it from the history');
 store.dispatch({type:'lesson.watched'});store.dispatch({type:'nav',screen:'units'});openLesson(u1);played(need*2);store.dispatch({type:'lesson.watched'});
 assert.equal(store.getSession().history.filter((h)=>h.kind==='lesson').length,1,'played on, the lesson is written once');
 store.dispatch({type:'learner.set',id:'watch-b'});s=store.getSession();
 assert.equal(s.watch,null,'another learner at the desk: the watch is not theirs');
 assert.deepEqual(W.lessonStates(MATHS,s.history)[0],'next','the tick is watch-a\'s, not watch-b\'s');
 openLesson(MATHS[1]);store.dispatch({type:'nav',screen:'units'});
 s=store.getSession();assert.equal(s.watch.since,null,'off the lesson screen, the clock stops');
});

test('watched case 3: a watched line never rolls off the history, and a watch is not something a screen can post',async()=>{
 const {capped}=require(src('lib/session/learners.ts'));
 const many=Array.from({length:30},(_,i)=>({at:i+10,kind:'practice',label:'t',detail:`${i}`}));
 const kept=capped([lessonLine(MATHS[0].id,1),lessonLine(MATHS[1].id,2),...many,lessonLine(MATHS[0].id,99)]);
 assert.equal(kept.filter((h)=>h.kind==='practice').length,20,'the other lines keep their cap');
 assert.deepEqual(kept.filter((h)=>h.kind==='lesson').map((h)=>[h.ref,h.at]),[[MATHS[1].id,2],[MATHS[0].id,99]],'one line per lesson, the latest, however old');
 onPage();const r=await session({type:'lesson.watched'});assert.equal(r.status,403);deskWorded((await r.json()).error);
});

// ---- practice-empty-set-is-failure: no verifiable question is a failed set, never an empty paper ----
const WRONG=STATED.map((c)=>({question:c.question,answer:String(Number(c.answer)+1)}));
test('empty case 1: two rounds with every candidate rejected answer 502, fail the job in desk words, and leave the previous set untouched',async()=>{
 onPage();
 stubText({items:()=>({items:STATED})});assert.equal((await post('practice',{topic:'linear-one-step'})).status,200);
 const before=JSON.stringify(store.getSession().practice);
 let asked=0;stubText({items:()=>{asked++;return {items:WRONG};}});
 const r=await post('practice',{topic:'linear-two-step'});
 assert.equal(r.status,502);const {error}=await r.json();deskWorded(error);assert.match(error,/^The desk could not write this set\./);
 assert.equal(asked,2,'both rounds were asked');
 const s=store.getSession();
 assert.equal(s.jobs.practice.phase,'failed');assert.match(s.jobs.practice.error,/^The desk could not write this set\./);assert.equal(s.jobs.practice.key,'linear-two-step');
 assert.equal(JSON.stringify(s.practice),before,'no practice.set: the previous set is untouched');
 assert(!/questions ready/.test(s.status),`status: ${s.status}`);
 // and it can be asked again in place
 stubText({items:()=>({items:STATED})});
 const again=await retry({kind:'practice'});assert.equal(again.status,200);
 const t=store.getSession();assert.equal(t.practice.topic,'linear-two-step');assert.equal(t.practice.items.length,6);assert.equal(t.jobs.practice.phase,'done');
});
test('empty case 2: a partial set of 4 still lands as 4',async()=>{
 onPage();
 stubText({items:()=>({items:STATED.slice(0,4)})});
 const r=await post('practice',{topic:'linear-one-step'});
 assert.equal(r.status,200);assert.equal((await r.json()).items,4);
 assert.equal(store.getSession().practice.items.length,4);assert.equal(store.getSession().jobs.practice.phase,'done');
});
test('empty case 3: an unknown topic is refused 400 before any job starts; a malformed body to /api/mark answers 400, not a throw',async()=>{
 onPage();
 let asked=0;stubText({items:()=>{asked++;return {items:STATED};}});
 const r=await post('practice',{topic:'no-such-topic'});
 assert.equal(r.status,400);assert.match((await r.json()).error,/not one this desk writes/);
 assert.equal(asked,0);assert.equal(store.getSession().jobs.practice,undefined,'no job was started');
 const raw=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body}));
 const m=await raw('mark','{not json').catch((e)=>e);
 assert(m instanceof Response,`the mark route answered instead of throwing (${m})`);assert.equal(m.status,400);deskWorded((await m.json()).error);
 const p=await raw('practice','{not json').catch((e)=>e);assert(p instanceof Response);assert.equal(p.status,400);
});
test('an early refusal is a sentence, the shorthand the phone would show is gone',async()=>{
 const sentence=(line)=>/^[A-Z].*[.]$/.test(line);
 const seat=()=>{store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{id:'jobs-scratch',name:'Scratch',type:'other'}});store.dispatch({type:'profile.save'});};
 const say=async(name,body)=>{const r=await post(name,body);assert.equal(r.status,400,name);const {error}=await r.json();assert.equal(sentence(error),true,error);return error;};
 seat();
 assert.equal(await say('hint',{}), 'Photograph a page first.');
 assert.equal(await say('read',{}), 'Photograph a page first.');
 assert.equal(await say('practice',{}), 'Choose a topic first.');
 assert.equal(await say('practice',{topic:'nope'}), 'That topic is not one this desk writes a set for.');
 assert.equal(await say('explain',{n:0}), 'Start a practice set first.');
 assert.equal(await say('mark',{answers:['4']}), 'Start a practice set first.');
 onPage();
 store.dispatch({type:'page.reading',page:{...PAGE,id:'empty'}});store.dispatch({type:'page.read',id:'empty',items:[],readMs:1,provider:'test'});
 assert.equal(await say('hint',{}), 'That item is not on the page.');
 store.dispatch({type:'practice.set',practice:{topic:'linear-one-step',items:[{n:1,question:'2x=4',key:'k'}],marked:false,owner:'jobs-scratch'}});
 assert.equal(await say('explain',{n:5}), 'That item is not on the desk any more.');
});

// ---- mark-lands-once-on-its-set: a mark lands only on the set it marked, and only once ----
const {getLearner}=require(src('lib/session/learners.ts'));
const {MOVED_ON}=require(src('lib/desk/job.ts'));
const MARKS={items:[
 {n:1,studentAnswer:'4',studentWorking:'2x=8',verdict:'right',solution:'4',slip:'unclear'},
 {n:2,studentAnswer:'3',studentWorking:'',verdict:'wrong',solution:'7',slip:'unclear'},
 {n:3,studentAnswer:'',studentWorking:'',verdict:'wrong',solution:'6',slip:'unclear'},
 {n:4,studentAnswer:'9',studentWorking:'',verdict:'right',solution:'9',slip:'unclear'},
 {n:5,studentAnswer:'7',studentWorking:'',verdict:'right',solution:'7',slip:'unclear'},
 {n:6,studentAnswer:'8',studentWorking:'',verdict:'right',solution:'8',slip:'unclear'},
]};
const PHOTO={image:'data:image/jpeg;base64,AAAA',w:100,h:100};
const SET_B=[{question:'2x+1=9',answer:'4'},{question:'3x-2=10',answer:'4'},{question:'5x+5=20',answer:'3'},{question:'4x-4=12',answer:'4'},{question:'2x+7=13',answer:'3'},{question:'6x+1=13',answer:'2'}];
const record=(id)=>{const l=getLearner(id);return {lines:l.history.length,skills:JSON.stringify(l.skills)};};
test('mark case 1: a set B that lands while set A is being marked stays unmarked; the mark answers 409 and records nothing for A',async()=>{
 onPage();
 stubText({items:()=>({items:STATED})});assert.equal((await post('practice',{topic:'linear-one-step'})).status,200);
 const gate=held();let seen=0;stubVision(async()=>{seen++;await gate.p;return MARKS;});
 const pending=post('mark',PHOTO);
 for(let i=0;i<200&&!seen;i++)await new Promise((r)=>setImmediate(r));
 assert.equal(seen,1,'the mark of set A is under way');
 stubText({items:()=>({items:SET_B})});assert.equal((await post('practice',{topic:'linear-two-step'})).status,200,'set B lands from Topics');
 const was=record('jobs-scratch');
 gate.open();const r=await pending;
 assert.equal(r.status,409);assert.equal((await r.json()).error,MOVED_ON);
 const s=store.getSession();
 assert.equal(s.practice.topic,'linear-two-step');assert.equal(s.practice.marked,false,'set B stays unmarked');
 assert.deepEqual(s.practice.items.map((i)=>i.question),SET_B.map((c)=>c.question));assert(s.practice.items.every((i)=>i.verdict===undefined));
 assert.deepEqual(record('jobs-scratch'),was,'no attempt and no history line for set A');
 assert(!/right, \d+ to look at/.test(s.status),`status: ${s.status}`);
});
test('mark case 2: a normal mark lands as before; marking the same set again is refused 409 before any vision call',async()=>{
 onPage();
 stubText({items:()=>({items:STATED})});assert.equal((await post('practice',{topic:'linear-one-step'})).status,200);
 const was=record('jobs-scratch');
 let seen=0;stubVision(()=>{seen++;return MARKS;});
 const r=await post('mark',PHOTO);
 assert.equal(r.status,200);const b=await r.json();
 assert.deepEqual([b.right,b.wrong,b.unsure],[4,1,1]);
 let s=store.getSession();assert.equal(s.practice.marked,true);assert.equal(s.screen,'sheet');
 assert.deepEqual(s.practice.items.map((i)=>i.verdict),['right','wrong','unsure','right','right','right']);
 assert.equal(record('jobs-scratch').lines,was.lines+1,'one history line');assert.equal(s.history.at(-1).detail,'4 of 6 right, 1 not sure');
 assert.equal(s.status,'4 right, 1 to look at, 1 to talk through');
 const after=record('jobs-scratch');
 const again=await post('mark',PHOTO);
 assert.equal(again.status,409);deskWorded((await again.json()).error);
 assert.equal(seen,1,'no second vision call');assert.deepEqual(record('jobs-scratch'),after,'no second attempt or history line');
});
test('GUARD mark case 3: a mark that ends after its learner left still lands on their set in away, recorded once',async()=>{
 store.dispatch({type:'reset'});
 for(const id of ['mark-a','mark-b']){store.dispatch({type:'profile.draft',patch:{id,name:id,type:'other'}});store.dispatch({type:'profile.save'});}
 store.dispatch({type:'learner.set',id:'mark-a'});
 stubText({items:()=>({items:STATED})});assert.equal((await post('practice',{topic:'linear-one-step'})).status,200);
 const gate=held();let seen=0;stubVision(async()=>{seen++;await gate.p;return MARKS;});
 const pending=post('mark',PHOTO);
 for(let i=0;i<200&&!seen;i++)await new Promise((r)=>setImmediate(r));
 const was=record('mark-a');
 store.dispatch({type:'learner.set',id:'mark-b'});
 gate.open();assert.equal((await pending).status,200);
 const s=store.getSession();assert.equal(s.practice,null,'nothing landed on mark-b');
 assert.equal(s.away['mark-a'].practice.marked,true);assert.equal(record('mark-a').lines,was.lines+1);
});

// ---- status-line-desk-words-only: a failure puts only desk words on the TV's status line; the detail goes to the server log ----
test('status case 1: a hint whose engine answered raw text fails with the desk sentence on the status line - no excerpt, no answer - and the detail in the server log',async()=>{
 onPage();
 stubText({hint:()=>'x = 6 is the answer'});
 const logged=[],was=console.error;console.error=(...a)=>{logged.push(a.map(String).join(' '));};
 let r;try{r=await post('hint',{});}finally{console.error=was;}
 const sentence='The desk could not come up with a hint just now. The answer came back in pieces.';
 assert.equal(r.status,502);assert.equal((await r.json()).error,sentence,'the route\'s error body is the desk sentence, as before');
 const s=store.getSession();
 assert.equal(s.jobs.hint.phase,'failed');assert.equal(s.jobs.hint.error,sentence,'job.failed carries the same sentence, as before');
 assert.equal(s.status,sentence,'the status line is the desk sentence alone');
 assert(!s.status.includes('6'),`the status line carries the answer: ${s.status}`);assert(!s.status.includes('('),`the status line carries a detail: ${s.status}`);
 const line=logged.find((l)=>l.includes(s.jobs.hint.id));
 assert(line,`the server log names the run: ${JSON.stringify(logged)}`);
 assert.match(line,/\bhint\b/);assert.match(line,/x = 6 is the answer/,'the detail is kept for the server log');
});


// ---- HW2: the homework door opens tonight's sheet, never the oldest page on the desk ----
test('HW2: the door opens a maths page snapped tonight with problems; yesterday\'s, a failed one and an unstamped one ask for a photo',()=>{
 const {tvKey,LOCAL}=require(src('tv/keys.ts'));const {tonightsSheet,dayOf}=require(src('tv/mathsRows.ts'));const {tonightStops}=require(src('tv/keys.ts'));
 const door=(s)=>tvKey({...s,screen:'tonight',focus:tonightStops({...s,screen:'tonight'}).indexOf('homework')},'select',LOCAL).events;
 const asks=[{type:'subject',subject:'maths'},{type:'page.ask',subject:'maths'}];
 onPage();
 let s=store.getSession();
 assert.equal(s.pages[0].day,dayOf(Date.now()),'a page is stamped with the day it was snapped');
 assert.equal(tonightsSheet(s)?.ix,0);
 assert.deepEqual(door(s).slice(0,2),[{type:'subject',subject:'maths'},{type:'page.select',pageIx:0}],'tonight\'s page with problems: the door opens it');
 const old={...s.pages[0],id:'old',day:'2000-1-1'},bare={...s.pages[0],id:'bare',day:undefined};
 assert.deepEqual(door({...s,pages:[old]}),[...asks],'yesterday\'s page and nothing tonight: the door asks');
 assert.deepEqual(door({...s,pages:[bare]}),asks,'a page with no day stamp is not tonight\'s');
 const failed={...s.pages[0],id:'f',items:[],provider:'error'};
 assert.deepEqual(door({...s,pages:[old,failed]}),asks,'tonight\'s failed page: the door asks');
 const pi=door({...s,pages:[failed,old,s.pages[0]]}).find(e=>e.type==='page.select');
 assert.equal(pi.pageIx,2,'the newest page with problems, not the oldest');
});

test('HW2: a learner\'s first sheet tonight is not titled page N+1',()=>{
 const phone=fs.readFileSync(src('app/phone/page.tsx'),'utf8');
 assert.match(phone,/p\.subject === sub && p\.day === today/,'the title counts only tonight\'s pages of the subject');
 onPage();
 const {dayOf}=require(src('tv/mathsRows.ts'));
 const s=store.getSession();const today=dayOf(Date.now());
 const count=(pages)=>pages.filter(p=>p.subject==='maths'&&p.day===today).length;
 assert.equal(count([{...s.pages[0],day:'2000-1-1'}]),0,'an older page does not make tonight\'s first sheet "page 2"');
 assert.equal(count(s.pages),1);
});
test('HW2: the door and its caption use the one predicate',()=>{
 const tv=fs.readFileSync(src('maths/MathsTV.tsx'),'utf8'),keys=fs.readFileSync(src('tv/keys.ts'),'utf8');
 assert.match(tv.split('function doorCaption')[1].split('\n}')[0],/tonightsSheet\(s\)/);
 assert.match(keys,/tonightsSheet\(s\)/);
 assert.doesNotMatch(keys,/s\.pages\.findIndex\(\(p\) => p\.subject === "maths"\)/,'the oldest-page lookup is gone');
});

// ---- HW3: a read with zero problems is a failed job, retried in place ----
test('HW3: a read that comes back with zero items ends failed with the desk\'s reason; a retry keeps the page and writes no history line',async()=>{
 blank();
 const {EMPTY_READ}=require(src('lib/desk/job.ts'));const learners=require(src('lib/session/learners.ts'));
 const lines=()=>(learners.getLearner('jobs-scratch')?.history??[]).filter((h)=>h.kind==='homework').length;
 const before=lines();
 stubVision(()=>({items:[]}));
 const r=await post('read',SNAP);
 assert.equal(r.status,502);assert.equal((await r.json()).error,EMPTY_READ);deskWorded(EMPTY_READ);
 let s=store.getSession();
 assert.equal(s.jobs.read.phase,'failed');assert.equal(s.jobs.read.error,EMPTY_READ);
 assert.equal(s.pages.length,1);assert.equal(s.pages[0].items.length,0);assert.equal(s.pages[0].provider,'error');assert.equal(s.reading,false);
 assert.equal(lines(),before,'no homework history line for an empty read');
 const id=s.pages[0].id;
 const again=await retry({kind:'read'});
 assert.notEqual(again.status,409,'a retry is accepted');assert.equal(again.status,502,'and the empty read fails again');
 s=store.getSession();assert.equal(s.pages.length,1,'the page count is kept');assert.equal(s.pages[0].id,id,'the page id is kept');assert.equal(lines(),before);
 stubVision(()=>READ3);
 assert.equal((await retry({kind:'read'})).status,200);
 s=store.getSession();assert.equal(s.pages.length,1);assert.equal(s.pages[0].items.length,3);assert.equal(lines(),before+1,'the read that found problems is written down');
});
test('HW3: an empty read fails for English and Essay too, and the TV and the phone point to Try again',async()=>{
 for(const subject of ['english','essay']){
  blank();stubVision(()=>({items:[]}));
  assert.equal((await post('read',{...SNAP,subject})).status,502,subject);
  assert.equal(store.getSession().jobs.read.phase,'failed',subject);
 }
 const tv=fs.readFileSync(src('maths/MathsTV.tsx'),'utf8');
 assert.match(tv,/Open Try again on the phone/);assert.doesNotMatch(tv,/Snap it again on the phone/);
 const {panelFor,follow}=require(src('app/phone/panelFor.ts'));
 const page={...PAGE,items:[],provider:'error'};
 const failed={screen:'page',joined:true,subject:'maths',awaiting:null,practice:null,pages:[page],pageIx:0,jobs:{read:{id:'j',kind:'read',phase:'failed',key:page.id,error:'x',startedAt:0,input:{id:page.id}}}};
 assert.equal(panelFor(failed),'capture','the capture panel carries that read\'s Try again');
 const cue=follow(undefined,failed,{panel:'join',role:'student',busy:false});
 assert.equal(cue.key,`page:retry:${page.id}`);assert.equal(cue.to,'capture','a phone arriving on a failed read lands where Try again is, and opensCamera is off there');
 const ph=fs.readFileSync(src('app/phone/page.tsx'),'utf8');
 assert.match(ph,/screen === "capture" && !readAgain/,'the camera stays off while Try again is offered');
});

// ---- robustness-2 / craft-7: readPage itself, vision stubbed; the shared reader for maths, English and Essay ----
const {readPage}=require(src('lib/desk/read.ts'));
const readOf=(items,subject='maths',w=1000,h=2000)=>{stubVision(()=>({items}));return readPage('AAAA',subject,w,h);};
const row=(number,text,x,y)=>({number,text,x,y});
test('robustness-2: an item with a position that is not a finite number is dropped; out-of-range and pixel positions stay inside the page',async()=>{
 const r=await readOf([row(1,'a',0.5,0.3),row(2,'b',NaN,0.5),row(3,'c',0.5,Infinity),row(5,'e',-0.4,1.7),row(6,'f',640,1300),row(7,'g',0.5,0.01)]);
 assert.deepEqual(r.items.map(i=>i.n),[1,5,6,7]);
 for(const i of r.items){assert(i.cx>=0&&i.cx<=1000,`cx ${i.cx}`);assert(i.cy>=0&&i.cy<=2000,`cy ${i.cy}`);assert(i.band[0]>=0&&i.band[1]<=2000&&i.band[0]<=i.band[1],`band ${i.band}`);}
 const p=r.items.find(i=>i.n===6);assert.deepEqual([p.cx,p.cy],[1000,2000],'a pixel position is clamped to the page edge');
});
test('robustness-2: a two-column sheet with distinct numbers keeps 1, 2, 3',async()=>{
 const r=await readOf([row(2,'two',0.7,0.1),row(1,'one',0.2,0.6),row(3,'three',0.2,0.1)]);
 assert.deepEqual(r.items.map(i=>i.text),['one','two','three'],'printed number first, never height alone');
});
test('HW5: a number that repeats with no label means sections that restart; the old pin\'s repeat half reads in the HW5 order',async()=>{
 // OLD (printed number, ties stable): one, two, two again, three. NEW (sections): two, three | one, two again
 const r=await readOf([row(2,'two',0.7,0.1),row(1,'one',0.2,0.6),row(3,'three',0.2,0.1),row(2,'two again',0.7,0.2)]);
 assert.deepEqual(r.items.map(i=>i.text),['two','three','one','two again']);
 assert.deepEqual(r.items.map(i=>i.key.replace(/^.*?:/,'')),['2','3','1','2#2'],'itemKey still gives the second 2 its #2');
});
const shuffle=(rows,order)=>order.map((k)=>rows.find((r)=>r.text===k));
test('HW5: two stacked sections numbered 1 to 3 read A1 A2 A3 B1 B2 B3, given in any order, for maths, English and Essay',async()=>{
 const rows=[row(1,'A1',0.3,0.1),row(2,'A2',0.3,0.2),row(3,'A3',0.3,0.3),row(1,'B1',0.3,0.5),row(2,'B2',0.3,0.6),row(3,'B3',0.3,0.7)];
 for(const subject of ['maths','english','essay'])for(const order of [['B1','A2','B3','A1','B2','A3'],['A1','B1','A2','B2','A3','B3'],['B3','B2','B1','A3','A2','A1']]){
  const r=await readOf(shuffle(rows,order),subject,1000,1000);
  assert.deepEqual(r.items.map(i=>i.text),['A1','A2','A3','B1','B2','B3'],`${subject}: ${order}`);
 }
 const r=await readOf(rows,'maths',1000,1000);
 assert.deepEqual(r.items.map(i=>i.key.replace(/^.*?:/,'')),['1','2','3','1#2','2#2','3#2'],'keys come from itemKey');
});
test('HW5: lettered parts split by the label, and a page of 1a 1b 2 alone is not split',async()=>{
 const lab=(number,label,text,y)=>({number,label,text,x:0.3,y});
 const r=await readOf([lab(1,'a','S1a',0.1),lab(1,'b','S1b',0.2),row(2,'S2',0.3,0.3),lab(1,'b','T1b',0.6),lab(1,'a','T1a',0.5)],'maths',1000,1000);
 assert.deepEqual(r.items.map(i=>i.text),['S1a','S1b','S2','T1a','T1b']);
 const one=await readOf([row(2,'S2',0.3,0.3),lab(1,'b','S1b',0.2),lab(1,'a','S1a',0.1)],'maths',1000,1000);
 assert.deepEqual(one.items.map(i=>i.text),['S1a','S1b','S2'],'no repeat: the printed sort');
});
test('HW5: an Essay page whose items all carry the same number reads top to bottom',async()=>{
 const r=await readOf([row(1,'third',0.5,0.8),row(1,'first',0.5,0.1),row(1,'second',0.5,0.45)],'essay',1000,1000);
 assert.deepEqual(r.items.map(i=>i.text),['first','second','third']);
});
test('HW5: one band is the band of its first item, read left to right; an equal x puts the upper item first',()=>{
 const {orderItems}=require(src('lib/desk/read.ts'));
 const it=(n,t,cx,cy)=>({n,t,cx,cy,band:[cy-50,cy+50]});
 // 1 and 2 sit in one band (cy 100 and 140): the right one is higher on the page, but the band reads left to right
 const o=orderItems([it(1,'right',500,100),it(1,'left',100,140),it(1,'low',100,400)]);
 assert.deepEqual(o.map(i=>i.t),['left','right','low']);
 const tie=orderItems([it(1,'lower',100,140),it(1,'upper',100,100)]);
 assert.deepEqual(tie.map(i=>i.t),['upper','lower']);
 assert.equal(orderItems([]).length,0);
});
test('robustness-2: w or h of 0 is refused with a 400 in the desk\'s words, no page is added',async()=>{
 blank();
 for(const bad of [{w:0},{h:0},{w:-5},{w:'x'}]){
  const r=await post('read',{...SNAP,...bad});assert.equal(r.status,400,JSON.stringify(bad));deskWorded((await r.json()).error);
 }
 assert.equal(store.getSession().pages.length,0);
});
test('craft-7: the English and Essay reads order and band like the maths one',async()=>{
 for(const subject of ['english','essay']){
  const r=await readOf([row(2,'second',0.5,0.9),row(1,'first',0.5,0.02)],subject,100,100);
  assert.deepEqual(r.items.map(i=>i.n),[1,2],subject);
  const half=subject==='essay'?9:4.5;
  assert.deepEqual(r.items[0].band,[0,Math.round(0.02*100+half)],`${subject}: the band is clamped at the top`);
  assert.deepEqual(r.items[1].band,[Math.round(90-half),Math.min(100,Math.round(90+half))],subject);
 }
});

test('craft-2: an item\'s key is its page and printed number, not its text; two items with the same text get two identities and a hint retry on the second reaches the second',async()=>{
 blank();
 stubVision(()=>({items:[row(1,'2x+3=11',0.5,0.2),row(2,'2x+3=11',0.5,0.5),row(3,'x-5=2',0.5,0.8)]}));
 assert.equal((await post('read',SNAP)).status,200);
 let s=store.getSession();const [a,b,c]=s.pages[0].items;
 assert.equal(a.fingerprint,b.fingerprint,'the content fingerprint is the normalised text');
 assert.notEqual(a.key,b.key);assert.equal(new Set([a.key,b.key,c.key]).size,3);
 assert.equal(a.key,`${s.pages[0].id}:1`);
 const {itemKey}=require(src('lib/desk/read.ts'));const seen=new Map();
 assert.deepEqual([itemKey('p',1,seen),itemKey('p',1,seen),itemKey('p',2,seen)],['p:1','p:1#2','p:2'],'a repeated number takes a suffix');
 // a hint on the second twin, failed, then asked again: the retry match reaches the second item
 stubText({hint:()=>{throw new Error('boom');}});
 store.dispatch({type:'item',itemIx:1});
 assert.equal((await post('hint',{askedQ:'',itemIx:1})).status,502);
 assert.equal(store.getSession().jobs.hint.key,b.key);
 let asked='';stubText({hint:(req)=>{asked=req.prompt;return {hint:'Undo the +3.',what_to_try_next:'Subtract 3.'};},lesson:()=>({lesson:'none',why:'x'})});
 assert.equal((await retry({kind:'hint'})).status,200);await drain();
 s=store.getSession();assert.equal(s.hint.key,b.key,'the second twin, not the first');assert.equal(s.jobs.hint.phase,'done');
 // a session that already holds items keeps the keys it stored them with
 store.dispatch({type:'page.read',id:s.pages[0].id,items:[{...a,key:'k-old'}],readMs:1,provider:'t'});
 assert.equal(store.getSession().pages[0].items[0].key,'k-old');
});

test('robustness-3: a read for a subject the desk does not have is refused with a 400; a page that is gone is a 409 in the desk\'s words',async()=>{
 blank();let asked=0;stubVision(()=>{asked++;return READ3;});
 for(const subject of ['history','',7]){const r=await post('read',{...SNAP,subject});assert.equal(r.status,400,String(subject));deskWorded((await r.json()).error);}
 assert.equal(asked,0,'no vision call for a subject the desk does not have');assert.equal(store.getSession().pages.length,0);
 blank();asked=0;
 const gone=await post('read',{id:'maths-gone'});assert.equal(gone.status,409);assert.equal((await gone.json()).error,'That page is no longer on the desk.');
 assert.equal(store.getSession().pages.length,0);
});

test('value-4 / craft-5: the reading caption says the read is one call, not that problems arrive as they are read',()=>{
 const tv=fs.readFileSync(src('maths/MathsTV.tsx'),'utf8');
 assert.doesNotMatch(tv,/as they are read/);assert.match(tv,/Reading the page… the problems appear here all at once when it is read\./);
});

test('MB-B3: the maths read prompt carries the cz learner\'s system, notation, course and age; English and Essay prompts are byte-for-byte what they were; a label rides on the item',async()=>{
 const OLD=(what)=>`This is a photo of a printed page. Transcribe every numbered item exactly as printed: ${what}. `+
  `For each item give its number, its text, and the position of its centre as fractions of the image (x: 0 = left edge, 1 = right edge; y: 0 = top, 1 = bottom). `+
  `Keep the printed numbering. Do not solve anything and do not add items that are not there.`;
 let seen=null;const spy=(items)=>reg.useProvider('vision',{name:'stub',run:async(req)=>{seen=req;return {raw:{items}};}});
 spy([]);await readPage('AAAA','english',100,100,'p1');
 assert.equal(seen.prompt,OLD('the exercise sentences, with their blanks (______) and the word in brackets'));assert.equal(seen.schema.properties.items.items.properties.label,undefined);
 await readPage('AAAA','essay',100,100,'p1',{system:'cz',age:15});
 assert.equal(seen.prompt,OLD('each paragraph as one item'),'a profile never reaches the Essay prompt');
 await readPage('AAAA','maths',100,100,'p1',{system:'cz',path:'school',age:15,stage:'High school'});
 const p=seen.prompt;
 assert(p.startsWith(OLD('the maths problems, with all symbols and exponents (write exponents with ^, e.g. x^2)')),'the maths prompt keeps its old text first');
 for(const bit of ['Czech Republic','decimal comma','colon','tg and cotg','School maths','15 years old','lim_(x->a)','a/b with brackets','no LaTeX','printed in'])assert(p.includes(bit),bit);
 assert(!/High school/.test(p),'the age leads; the stage is the fallback');
 assert.equal(seen.schema.properties.items.items.properties.label.type,'string');assert(!seen.schema.properties.items.items.required.includes('label'),'the label is optional');
 await readPage('AAAA','maths',100,100,'p1',{path:'calc1',stage:'Other'});assert(/Their stage is Other\./.test(seen.prompt)&&!/years old/.test(seen.prompt));
 // lettered parts: n stays the printed number, the label names the part, and the key carries it
 stubVision(()=>({items:[{number:3,text:'b part',x:0.5,y:0.6,label:'3b'},{number:3,text:'a part',x:0.5,y:0.3,label:'3a'},{number:4,text:'plain',x:0.5,y:0.9}]}));
 const r=await readPage('AAAA','maths',100,100,'p1');
 assert.deepEqual(r.items.map(i=>[i.n,i.label]),[[3,'3a'],[3,'3b'],[4,undefined]],'number, then label');
 assert.deepEqual(r.items.map(i=>i.key),['p1:3:3a','p1:3:3b','p1:4']);
 const tv=fs.readFileSync(src('maths/MathsTV.tsx'),'utf8');assert.match(tv,/\{x\.label \?\? x\.n\}/);assert.match(tv,/it\.label \?\? it\.n/);
});
test('MB-B3: the read route hands the seated learner\'s profile to the maths read only',async()=>{
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'jobs-cz',name:'Cz',type:'high-school',age:16,system:'cz'}});store.dispatch({type:'profile.save'});
 let prompt='';reg.useProvider('vision',{name:'stub',run:async(req)=>{prompt=req.prompt;return {raw:READ3};}});
 assert.equal((await post('read',SNAP)).status,200);
 assert(prompt.includes('Czech Republic')&&prompt.includes('16 years old')&&prompt.includes('School maths'),prompt);
 prompt='';assert.equal((await post('read',{...SNAP,subject:'english'})).status,200);
 assert(!/Czech|years old|School maths/.test(prompt),'the English read is told nothing about the learner');
});

// ---- HF1: a partial read says so ----
test('HF1: missingNumbers names the printed numbers a read left out, run by run; unknown is not complete',()=>{
 const {missingNumbers}=require(src('lib/desk/read.ts'));
 const ns=(...a)=>a.map((n)=>typeof n==='number'?{n}:{n:parseInt(n),label:n});
 assert.deepEqual(missingNumbers(ns(1,2,3,5)),[4]);
 assert.deepEqual(missingNumbers(ns(1,2,3,4)),[]);
 assert.deepEqual(missingNumbers(ns(1,2,3,1,2,4)),[3],'a repeated number starts a new run');
 assert.deepEqual(missingNumbers(ns(7,8,9)),[],'a continuation sheet has no gap before it');
 assert.deepEqual(missingNumbers(ns(1,'2a','2b',3)),[],'lettered parts count once');
 assert.equal(missingNumbers([{n:1},{n:Infinity},{n:3}]),null);
 assert.equal(missingNumbers([{n:1},{n:2.5}]),null);
});
test('HF1: the read route carries the missing numbers on the page, the answer, the done line and the log; a complete page carries an empty list',async()=>{
 blank();
 const row=(number,y)=>({number,text:`item ${number}`,y,x:0.5});
 stubVision(()=>({items:[row(1,0.1),row(2,0.3),row(3,0.5),row(5,0.8)]}));
 const warned=[];const w=console.warn;console.warn=(...a)=>warned.push(a.join(' '));
 let r;try{r=await post('read',SNAP);}finally{console.warn=w;}
 assert.equal(r.status,200);const j=await r.json();
 assert.equal(j.items,4);assert.deepEqual(j.missing,[4]);
 const s=store.getSession();
 assert.deepEqual(s.pages[0].missing,[4]);assert.equal(s.jobs.read.phase,'done');
 assert(/Number 4 was not read/.test(s.status),s.status);assert(warned.some((l)=>l.includes('4')),'a server log line names it');
 const {missingLine}=require(src('tv/pageLines.ts'));
 assert.equal(missingLine([4]),'Number 4 was not read. Take a new photo of the page on the phone.');
 assert.match(missingLine([4,7,9]),/^Numbers 4, 7 and 9 were not read\./);
 assert.match(missingLine([4,7,9,11,12]),/^Numbers 4, 7, 9 and 2 more were not read\./);
 assert.match(missingLine([4,7]),/^Numbers 4 and 7 were not read\./);
 for(const l of [missingLine([4]),missingLine([1,2,3,4])])assert(!/[—–-]/.test(l)&&!/Try again/.test(l),l);
 const tv=fs.readFileSync(src('tv/screens.tsx'),'utf8');assert.match(tv,/p\.missing\?\.length \? missingLine\(p\.missing\)/);
 blank();stubVision(()=>({items:[row(1,0.1),row(2,0.3),row(3,0.5)]}));
 const ok=await (await post('read',SNAP)).json();assert.deepEqual(ok.missing,[]);assert.deepEqual(store.getSession().pages[0].missing,[]);
 blank();stubVision(()=>({items:[row(1,0.1),{...row(2,0.3),number:0}]}));
 assert.equal((await (await post('read',SNAP)).json()).missing,null,'unknown is kept distinct');
 assert.equal(store.getSession().pages[0].missing,null);
});

test('HF1b: the Math Buddy page screen says the missing numbers, after the hint captions and before the lamp caption',()=>{
 const tv=fs.readFileSync(src('maths/MathsTV.tsx'),'utf8');
 assert.match(tv,/import \{ missingLine \} from "@\/tv\/pageLines"/);
 const at=tv.indexOf('export function PageScreen');assert(at>=0);
 const end=tv.indexOf('export function',at+10);const slice=tv.slice(at,end<0?undefined:end);
 const branch='p.missing?.length ? missingLine(p.missing)';assert(slice.includes(branch));
 const b=slice.indexOf(branch);
 for(const before of ['Reading the page','could not read this page','Thinking about a hint','No hint that time'])assert(slice.indexOf(before)>=0&&slice.indexOf(before)<b,before);
 assert(slice.indexOf('is under the lamp')>b);
});

// ---- HF2: a good read is kept when the learner file cannot be written ----
test('HF2: with the learner file unwritable a read of 2 items is kept: 200, saved false, the items on the page, the job done, READ_NOT_SAVED said',async()=>{
 blank();
 const {READ_NOT_SAVED}=store;
 const file=path.join(data,'learners.json');const had=fs.existsSync(file)?fs.readFileSync(file):null;
 fs.writeFileSync(file,'not a book');
 stubVision(()=>({items:[{number:1,text:'2x+3=11',y:0.2,x:0.5},{number:2,text:'x-5=2',y:0.6,x:0.5}]}));
 const errs=[];const e0=console.error;console.error=(...a)=>errs.push(a.join(' '));
 let r;try{r=await post('read',SNAP);}finally{console.error=e0;if(had)fs.writeFileSync(file,had);else fs.rmSync(file,{force:true});}
 assert.equal(r.status,200);const j=await r.json();assert.equal(j.saved,false);assert.equal(j.items,2);
 const s=store.getSession();
 assert.equal(s.pages.length,1);assert.equal(s.pages[0].items.length,2);assert.equal(s.reading,false);
 assert.equal(s.jobs.read.phase,'done');assert.notEqual(s.jobs.read.phase,'failed');
 assert.equal(s.status,READ_NOT_SAVED);deskWorded(READ_NOT_SAVED);
 assert(errs.some((l)=>/learner file/.test(l)),'the error is logged');
});

// ---- HF4: session.json is published through a temp file, and a write that fails is said ----
const SJ=()=>path.join(data,'session.json');
const jam=()=>{fs.rmSync(SJ(),{recursive:true,force:true});fs.mkdirSync(SJ());fs.writeFileSync(path.join(SJ(),'x'),'x');};
const unjam=()=>{if(fs.existsSync(SJ())&&fs.statSync(SJ()).isDirectory())fs.rmSync(SJ(),{recursive:true,force:true});};
const tmps=()=>fs.readdirSync(data).filter((n)=>/^session.json..*.tmp$/.test(n));
const catchErrors=()=>{const errs=[];const e0=console.error;console.error=(...a)=>errs.push(a.join(' '));return {errs,done:()=>{console.error=e0;}};};
test('HF4: with session.json unwritable a read of 2 items is kept: 200, saved false, done, READ_NOT_KEPT said, one log line, no tmp left, one recovery line',async()=>{
 blank();
 const {READ_NOT_KEPT}=store;deskWorded(READ_NOT_KEPT);
 assert.equal(READ_NOT_KEPT,'That page was read, but the desk could not save it, so it will be gone if the desk restarts.');
 jam();
 stubVision(()=>({items:[{number:1,text:'2x+3=11',y:0.2,x:0.5},{number:2,text:'x-5=2',y:0.6,x:0.5}]}));
 const c=catchErrors();let r,j;
 try{
  r=await post('read',SNAP);j=await r.json();assert.equal(store.getSession().status,READ_NOT_KEPT);
  store.dispatch({type:'status',text:'a'});store.dispatch({type:'status',text:'b'});store.dispatch({type:'status',text:'c'});
  const bad=c.errs.filter((l)=>/session.json/.test(l));
  assert.equal(bad.length,1,'one line while writes keep failing: '+JSON.stringify(c.errs));
  assert.equal(store.sessionSaved(),false);
  assert.deepEqual(tmps(),[],'no temp file is left');
  unjam();
  store.dispatch({type:'status',text:'d'});store.dispatch({type:'status',text:'e'});
  const back=c.errs.filter((l)=>/written again/.test(l));
  assert.equal(back.length,1,'one recovery line');
  assert.equal(store.sessionSaved(),true);
 }finally{c.done();unjam();}
 assert.equal(r.status,200);assert.equal(j.saved,false);assert.equal(j.items,2);
 const s=store.getSession();
 assert.equal(s.pages.length,1);assert.equal(s.pages[0].items.length,2);
 assert.equal(s.jobs.read.phase,'done');
 assert(JSON.parse(fs.readFileSync(SJ(),'utf8')).pages,'session.json parses');
});
test('HF4: with the learner file and session.json both failing, READ_NOT_SAVED is said',async()=>{
 blank();
 const {READ_NOT_SAVED}=store;
 const file=path.join(data,'learners.json');const had=fs.existsSync(file)?fs.readFileSync(file):null;
 fs.writeFileSync(file,'not a book');jam();
 stubVision(()=>({items:[{number:1,text:'2x+3=11',y:0.2,x:0.5}]}));
 const c=catchErrors();let r;
 try{r=await post('read',SNAP);}finally{c.done();unjam();if(had)fs.writeFileSync(file,had);else fs.rmSync(file,{force:true});}
 assert.equal(r.status,200);assert.equal((await r.json()).saved,false);
 assert.equal(store.getSession().status,READ_NOT_SAVED);
 store.dispatch({type:'status',text:'back'});
});
// last: it swaps the store module out from under the routes loaded above
test('case 7: a job saved as running is not running after the desk restarts',()=>{
 onPage();
 const saved={...store.getSession(),jobs:{read:{id:'r1',phase:'running',startedAt:Date.now()-5000,key:PAGE.id,input:{id:PAGE.id}}}};
 fs.writeFileSync(path.join(data,'session.json'),JSON.stringify(saved));
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];store=require(storeFile);
 const job=store.getSession().jobs?.read;
 assert(job,'the saved job is still on record');assert.notEqual(job.phase,'running');
 assert.equal(job.phase,'failed');deskWorded(job.error);assert.equal(store.getSession().reading,false);
 assert.deepEqual(job.input,{id:PAGE.id},'the run keeps what it was asked with, so the phone can offer Try again');
});

// ---- HF4: load() says why a session.json that exists was not used (after case 7: it swaps the store module too) ----
test('HF4: load() logs once for a session.json that is not JSON or fails the shape check, and not at all for no file',()=>{
 const reload=(content)=>{
  clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];
  if(content===null)fs.rmSync(SJ(),{force:true});else fs.writeFileSync(SJ(),content);
  const c=catchErrors();try{store=require(storeFile);}finally{c.done();}
  return c.errs.filter((l)=>/session.json/.test(l));
 };
 const a=reload('{not json');assert.equal(a.length,1,JSON.stringify(a));assert.equal(store.getSession().learner,null);
 const b=reload(JSON.stringify({profiles:'nope',learner:null}));assert.equal(b.length,1,JSON.stringify(b));assert.match(b[0],/shape check/);assert.equal(store.getSession().learner,null);
 const n=reload(null);assert.deepEqual(n,[]);
});
