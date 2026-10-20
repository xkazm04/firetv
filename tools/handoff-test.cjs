/**
 * TL-5: the hand-off lives in the session. The reducer over plain sessions: ask.open mints an Ask (id, phase open, the TV's
 * screen, the seated learner) and replaces an open one; ask.cancel and ask.sent answer only the open id; a learner switch,
 * session.end, reset, a nav off the asking screen and a restart (load) each close it; a status that names the phone goes
 * with a switch and a restart. The session file is a scratch DESK_DATA_DIR. No route, no model.
 * Run with npm test in desk/ (directly: node tools/handoff-test.cjs).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-handoff-${process.pid}-${Date.now()}`);fs.mkdirSync(data,{recursive:true});process.env.DESK_DATA_DIR=data;
// a restored session.json that holds an open ask and a line that sends someone to the phone: written before the store is first loaded
fs.writeFileSync(path.join(data,'session.json'),JSON.stringify({profiles:[],learner:null,screen:'landing',status:'paste or dictate the paragraph on the phone',
 ask:{id:'old',kind:'page',learner:null,screen:'landing',at:1,phase:'open'}}));
const store=require(path.join(root,'src/lib/session/store.ts'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
const {reduce,fresh}=store;
const seated=(screen='practice')=>{let s=reduce(fresh(),{type:'learner.set',id:'ema'});return {...s,screen};};

test('TL-5: a restored session.json holding an ask loads with ask null, and its status naming the phone is cleared (D2)',()=>{
 const s=store.getSession();assert.equal(s.ask,null);assert.equal(s.status,'');
});
test('TL-5: a fresh session has ask null',()=>assert.equal(fresh().ask,null));
test('TL-5: ask.open mints an id, opens on the current screen for the seated learner, and keeps only the detail an ask carries',()=>{
 const s=seated('practice');
 const a=reduce(s,{type:'ask.open',kind:'answers',detail:{subject:'maths',n:2,junk:1}}).ask;
 assert.equal(typeof a.id,'string');assert.ok(a.id.length>8);
 assert.equal(a.kind,'answers');assert.equal(a.phase,'open');assert.equal(a.screen,'practice');assert.equal(a.learner,s.learner.id);assert.equal(typeof a.at,'number');
 assert.deepEqual(a.detail,{subject:'maths',n:2});
 assert.equal(reduce(s,{type:'ask.open',kind:'name'}).ask.detail,undefined);
});
test('TL-5: a new ask.open replaces the open one with a new id',()=>{
 const one=reduce(seated(),{type:'ask.open',kind:'answers'}),two=reduce(one,{type:'ask.open',kind:'explain'});
 assert.equal(two.ask.kind,'explain');assert.notEqual(two.ask.id,one.ask.id);
});
test('TL-5: ask.cancel closes the open ask; a stale id changes nothing',()=>{
 const o=reduce(seated(),{type:'ask.open',kind:'page'});
 assert.equal(reduce(o,{type:'ask.cancel',id:'stale'}).ask?.id,o.ask.id);
 assert.equal(reduce(o,{type:'ask.cancel',id:o.ask.id}).ask,null);
 assert.equal(reduce(seated(),{type:'ask.cancel',id:'x'}).ask,null);
});
test('TL-5: ask.sent sets phase sent on the open id; a stale id changes nothing',()=>{
 const o=reduce(seated(),{type:'ask.open',kind:'page'});
 const sent=reduce(o,{type:'ask.sent',id:o.ask.id});
 assert.equal(sent.ask.phase,'sent');assert.equal(sent.ask.id,o.ask.id);assert.equal(sent.ask.kind,'page');
 assert.equal(reduce(o,{type:'ask.sent',id:'stale'}).ask.phase,'open');
});
test('TL-5: a learner switch closes the ask and clears a status that names the phone, but not another status (D3)',()=>{
 const o={...reduce(seated(),{type:'ask.open',kind:'sentence'}),status:'say or type the sentence on the phone'};
 const sw=reduce(o,{type:'learner.set',id:'jakub'});
 assert.equal(sw.ask,null);assert.equal(sw.status,'');
 const other=reduce({...o,status:'Linear is ready'},{type:'learner.set',id:'jakub'});assert.equal(other.status,'Linear is ready');
 // sitting down as the same learner is no switch
 assert.equal(reduce(o,{type:'learner.set',id:o.learner.id}).ask?.id,o.ask.id);
});
test('TL-5: session.end and reset close the ask',()=>{
 const o=reduce(seated(),{type:'ask.open',kind:'page'});
 assert.equal(reduce(o,{type:'session.end'}).ask,null);assert.equal(reduce(o,{type:'reset'}).ask,null);
});
test('TL-5: a nav off ask.screen closes the ask; a nav to the same screen, a focus and a status keep it',()=>{
 const o=reduce(seated('practice'),{type:'ask.open',kind:'answers'});
 assert.equal(reduce(o,{type:'nav',screen:'landing'}).ask,null);
 assert.equal(reduce(o,{type:'nav',screen:'practice'}).ask?.id,o.ask.id);
 assert.equal(reduce(o,{type:'focus',focus:1}).ask?.id,o.ask.id);
 assert.equal(reduce(o,{type:'status',text:'x'}).ask?.id,o.ask.id);
});

// ---- TL-11: the result routes answer a phone only with the open ask's id
const reg=require(path.join(root,'src/lib/engines/registry.ts'));
require(path.join(root,'src/lib/engines/text.ts'));require(path.join(root,'src/lib/engines/embed.ts'));require(path.join(root,'src/lib/engines/vision.ts'));
const {afterEach}=require('node:test');afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
const stubText=(on)=>reg.useProvider('text',{name:'stub',run:async(req)=>{const p=Object.keys(req.schema?.properties??{});
 const which=p.includes('lesson')?'lesson':p.includes('hint')?'hint':'other';const f=on[which];if(!f)throw new Error(`no stub for ${which}`);return {raw:await f(req)};}});
const stubVision=(f)=>reg.useProvider('vision',{name:'stub',run:async(req)=>({raw:await f(req)})});
const call=(name,body,role='phone')=>require(path.join(root,`src/app/api/${name}/route.ts`)).POST(new Request(`http://desk/api/${name}`,{method:'POST',headers:{'x-desk-role':role},body:JSON.stringify(body)}));
const seatAt=(screen,extra={},kind='page')=>{store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{id:'ho-scratch',name:'Scratch',type:'other'}});store.dispatch({type:'profile.save'});
 globalThis.__desk.session={...store.getSession(),screen,subject:'maths',...extra};store.dispatch({type:'ask.open',kind});return store.getSession();};
const PG={id:'maths-1',subject:'maths',title:'Sheet',img:'data:image/jpeg;base64,AAAA',w:100,h:100,items:[{n:1,text:'2x+3=11',cx:0,cy:0,band:[0,10],key:'k1'}]};
const PRACTICE=()=>({topic:'linear-one-step',marked:false,items:[{n:1,question:'x+3=7',answer:'4'},{n:2,question:'x-5=2',answer:'7'}]});
/** For each route: the request that works with a model-free (stubbed) engine, the state that route needs, and the ask it answers. */
const ROUTES={
 read:{body:{image:'data:image/jpeg;base64,AAAA',subject:'maths',w:100,h:100},setup:()=>stubVision(()=>({items:[{number:1,text:'2x+3=11',x:0.5,y:0.2}]})),screen:'landing',kind:'page'},
 mark:{body:{answers:['4','7']},screen:'practice',extra:()=>({practice:PRACTICE()}),kind:'answers'},
 analyse:{body:{kind:'essay',text:'Homework is pointless. Nobody checked it.',type:'evidence'},screen:'landing',expect:null,kind:'paragraph',refusedBeforeWork:428},
 hint:{body:{askedQ:'where first?'},setup:()=>stubText({hint:()=>({hint:'Look at the +3.',what_to_try_next:'Undo it.'}),lesson:()=>({lesson:'none',why:'x'})}),screen:'page',extra:()=>({pages:[PG],pageIx:0,itemIx:0}),kind:'question'},
 explain:{body:{transcript:'I took away three',n:1},setup:()=>stubText({other:()=>({reply:'You took the three away first. Good.',slip:'',value:''})}),screen:'practice',extra:()=>({practice:PRACTICE()}),kind:'explain'},
 second:{body:{n:1,answer:'4'},screen:'walk',extra:()=>({practice:{...PRACTICE(),marked:true,items:[{n:1,question:'x+3=7',studentAnswer:'5',verdict:'wrong',said:'Number 1.'},{n:2,question:'x-5=2',studentAnswer:'7',verdict:'right',said:'Number 2.'}]}}),kind:'second'},
};
for(const [name,spec] of Object.entries(ROUTES)){
 test(`TL-11: /api/${name} from a phone with no ask or the wrong askId is 409 and changes nothing; the right askId is answered and the ask closed`,async()=>{
  spec.setup?.();
  const open=seatAt(spec.screen,spec.extra?.(),spec.kind);assert.equal(open.ask.phase,'open');
  const frozen=JSON.stringify(store.getSession());
  for(const body of [spec.body,{...spec.body,askId:'not-the-ask'},{...spec.body,askId:undefined}]){
   const r=await call(name,body);assert.equal(r.status,409,JSON.stringify(Object.keys(body)));assert.equal((await r.json()).error,'The TV is not asking for that now.');
   assert.equal(JSON.stringify(store.getSession()),frozen,'the session is untouched');
  }
  store.dispatch({type:'ask.cancel',id:open.ask.id});
  assert.equal((await call(name,{...spec.body,askId:open.ask.id})).status,409,'a closed ask answers nothing');
  const again=seatAt(spec.screen,spec.extra?.(),spec.kind);
  const r=await call(name,{...spec.body,askId:again.ask.id});
  assert.notEqual(r.status,409,`${name}: accepted`);assert.ok(r.status<500,`${name}: ${r.status}`);
  // analyse's stub answer is the text notice (428): a refusal before any work, so the ask is not spent (lite r3); every other route answers and closes it
  if(spec.refusedBeforeWork){assert.equal(r.status,spec.refusedBeforeWork);assert.equal(store.getSession().ask?.phase,'open','a refusal before the work leaves the ask open');}
  else assert.equal(store.getSession().ask,null,'the result closes the ask');
  // the TV and an in-process caller need no ask
  seatAt(spec.screen,spec.extra?.(),spec.kind);
  assert.notEqual((await call(name,spec.body,'tv')).status,409);
 });
}

// ---- Lite r3 rework (council c126c54e): the door checks the ask's kind, the session route holds the TV's acts, a retry meets
// the door, and a refused answer does not spend the ask
const sess=(e,role='phone')=>require(path.join(root,'src/app/api/session/route.ts')).POST(new Request('http://desk/api/session',{method:'POST',headers:role?{'x-desk-role':role}:{},body:JSON.stringify(e)}));
const retry=(body,role='phone')=>require(path.join(root,'src/app/api/session/retry/route.ts')).POST(new Request('http://desk/api/session/retry',{method:'POST',headers:role?{'x-desk-role':role}:{},body:JSON.stringify(body)}));
/** Seats a scratch learner on `screen` with a second profile on the switcher, and opens an ask of `kind` (none with null). */
const seatOpen=(screen,kind,extra={})=>{store.dispatch({type:'reset'});
 for(const [id,name] of [['ho-other','Other'],['ho-scratch','Scratch']]){store.dispatch({type:'profile.draft',patch:{id,name,type:'other'}});store.dispatch({type:'profile.save'});}
 globalThis.__desk.session={...store.getSession(),screen,subject:'maths',...extra};if(kind)store.dispatch({type:'ask.open',kind});return store.getSession();};
const READ_BODY={image:'data:image/jpeg;base64,AAAA',subject:'maths',w:100,h:100};
const readStub=()=>stubVision(()=>({items:[{number:1,text:'2x+3=11',x:0.5,y:0.2}]}));
const PAPER_ROWS=[{q:'1',marks:1,outOf:3,codes:['N2']}];

test('H1: a Linga reply ask answered on /api/read from a phone is 409, and the TV screen and the ask are unchanged',async()=>{
 readStub();
 const open=seatOpen('linga-talk','reply');const frozen=JSON.stringify(store.getSession());
 const r=await call('read',{...READ_BODY,askId:open.ask.id});
 assert.equal(r.status,409);assert.equal((await r.json()).error,'The TV is not asking for that now.');
 assert.equal(store.getSession().screen,'linga-talk');assert.equal(store.getSession().ask?.id,open.ask.id);assert.equal(store.getSession().ask?.phase,'open');
 assert.equal(JSON.stringify(store.getSession()),frozen,'the session is untouched');
});
test('H1: each result route refuses the id of an open ask of a kind it does not answer (409, nothing changes)',async()=>{
 for(const [name,spec] of Object.entries(ROUTES)){
  spec.setup?.();
  const open=seatOpen(spec.screen,'reply',spec.extra?.());const frozen=JSON.stringify(store.getSession());
  const r=await call(name,{...spec.body,askId:open.ask.id});
  assert.equal(r.status,409,`${name} took a reply ask`);
  assert.equal(JSON.stringify(store.getSession()),frozen,`${name}: the session is untouched`);
 }
});
for(const [type,e,want] of [['learner.set',{type:'learner.set',id:'ho-other'},403],['profile.discard',{type:'profile.discard'},403],['topic.open',{type:'topic.open',topic:'linear-one-step'},403],['practice.clear',{type:'practice.clear'},403],
 ['paper.enter (no askId)',{type:'paper.enter',rows:PAPER_ROWS},409],['paper.enter (wrong askId)',{type:'paper.enter',rows:PAPER_ROWS,askId:'not-the-ask'},409]]){
 test(`H2: a phone's ${type} on /api/session is ${want} and the session is byte-identical`,async()=>{
  for(const kind of [null,'paper']){
   seatOpen('paper',kind,{practice:PRACTICE()});const frozen=JSON.stringify(store.getSession());
   const r=await sess(e);assert.equal(r.status,want,`with ask ${kind}`);
   assert.equal((await r.json()).error,want===403?'Only the TV moves the desk.':'The TV is not asking for that now.');
   assert.equal(JSON.stringify(store.getSession()),frozen,`with ask ${kind}: the session is untouched`);
  }
 });
}
test('H2: a phone\'s paper.enter with the id of an open ask of another kind is 409 and changes nothing',async()=>{
 const open=seatOpen('paper','page');const frozen=JSON.stringify(store.getSession());
 assert.equal((await sess({type:'paper.enter',rows:PAPER_ROWS,askId:open.ask.id})).status,409);
 assert.equal(JSON.stringify(store.getSession()),frozen);
});
test('H2: a phone\'s paper.enter with the open paper ask\'s id is kept and closes the ask; the TV posts as before',async()=>{
 let open=seatOpen('paper','paper');
 let r=await sess({type:'paper.enter',rows:PAPER_ROWS,askId:open.ask.id});assert.equal(r.status,200);
 assert.equal(store.getSession().ask,null,'the result closes the ask');assert.ok(store.getSession().paper,'the paper is kept');
 seatOpen('paper',null);assert.equal((await sess({type:'paper.enter',rows:PAPER_ROWS},'tv')).status,200);assert.ok(store.getSession().paper);
 // a paper the desk keeps no row of is the phone's to fix: the ask stays open
 open=seatOpen('paper','paper');
 r=await sess({type:'paper.enter',rows:[],askId:open.ask.id});assert.equal(r.status,200);
 assert.equal(store.getSession().ask?.id,open.ask.id);assert.equal(store.getSession().ask?.phase,'open','an unkept paper does not spend the ask');
});
test('H2: the phone\'s own posts stay allowed: task.add, task.done, profile.draft and profile.save',async()=>{
 seatOpen('tonight',null);
 assert.equal((await sess({type:'task.add',name:'Read',sub:'english',min:10})).status,200,'task.add');
 const t=store.getSession().tasks.at(-1);assert.equal((await sess({type:'task.done',id:t.id,done:true})).status,200,'task.done');
 for(const e of [{type:'profile.draft',patch:{name:'Zed'}},{type:'profile.save'}])assert.equal((await sess(e)).status,200,e.type);
});

test('retry: a phone retry of a failed read meets the door (409 with no open page ask); with the ask it runs; the TV retries as before',async()=>{
 readStub();
 const failed=()=>{const s=store.getSession();globalThis.__desk.session={...s,jobs:{...s.jobs,read:{id:'r-old',phase:'failed',startedAt:1,endedAt:2,input:READ_BODY,retry:true,by:s.learner.id}}};};
 seatOpen('tonight',null);failed();let frozen=JSON.stringify(store.getSession());
 let r=await retry({kind:'read'});assert.equal(r.status,409,'no ask open');assert.equal(JSON.stringify(store.getSession()),frozen,'the session is untouched');
 const open=seatOpen('tonight','reply');failed();frozen=JSON.stringify(store.getSession());
 r=await retry({kind:'read',askId:open.ask.id});assert.equal(r.status,409,'an ask of another kind');assert.equal(JSON.stringify(store.getSession()),frozen);
 const page=seatOpen('tonight','page');failed();
 r=await retry({kind:'read',askId:page.ask.id});assert.ok(r.status<300,`accepted: ${r.status}`);assert.equal(store.getSession().ask,null,'the result closes the ask');
 seatOpen('tonight',null);failed();assert.ok((await retry({kind:'read'},'tv')).status<300,'the TV retries');
 seatOpen('tonight',null);failed();assert.ok((await retry({kind:'read'},null)).status<300,'an in-process retry');
});

test('(d) a refused answer does not spend the ask; the ask is sent while the work runs and closed by a result or a work failure',async()=>{
 // a bad request: the route refuses it before any work, and the ask stays open for the phone to try again
 let open=seatOpen('practice','answers',{practice:PRACTICE()});
 let r=await call('mark',{answers:'x',askId:open.ask.id});assert.equal(r.status,400);
 assert.equal(store.getSession().ask?.id,open.ask.id);assert.equal(store.getSession().ask?.phase,'open','a refused mark leaves the ask open');
 open=seatOpen('walk','second',ROUTES.second.extra());
 r=await call('second',{n:1,answer:'   ',askId:open.ask.id});assert.equal(r.status,400);
 assert.equal(store.getSession().ask?.phase,'open','a blank second go leaves the ask open');
 // the work: sent while it runs, closed when it fails
 let during=null;stubVision(()=>{during=store.getSession().ask?.phase;throw new Error('vision down');});
 open=seatOpen('tonight','page');
 r=await call('read',{...READ_BODY,askId:open.ask.id});assert.equal(r.status,502);
 assert.equal(during,'sent','the ask is sent once the work begins');assert.equal(store.getSession().ask,null,'a work failure closes the ask');
 // a refused answer then a good one: the same ask answers it
 open=seatOpen('practice','answers',{practice:PRACTICE()});
 assert.equal((await call('mark',{answers:'x',askId:open.ask.id})).status,400);
 assert.equal((await call('mark',{answers:['4','7'],image:'data:image/jpeg;base64,AAAA',askId:open.ask.id})).status,400,'both ways in');
 assert.equal(store.getSession().ask?.phase,'open');
 r=await call('mark',{answers:['4','7'],askId:open.ask.id});assert.ok(r.status<300,`${r.status}`);assert.equal(store.getSession().ask,null);
});
test('(d) ask.sent stays refused on /api/session for every role',async()=>{
 const open=seatOpen('practice','answers');
 for(const role of ['tv','phone','guest',null])assert.equal((await sess({type:'ask.sent',id:open.ask.id},role)).status,403,String(role));
 assert.equal(store.getSession().ask.phase,'open');
});
test('(e) the phone\'s paper post names the open paper ask: PaperPanel sends askId with paper.enter, and the page hands it the paper ask\'s id',()=>{
 const panel=fs.readFileSync(path.join(root,'src/app/phone/PaperPanel.tsx'),'utf8'),page=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 assert.match(panel,/type: "paper\.enter", rows: rawOf\(rows\), \.\.\.\(askId \? \{ askId \} : \{\}\)/);
 assert.match(page,/<PaperPanel .*askId=\{s\?\.ask\?\.kind === "paper" \? askId : undefined\}/);
});

// ---- after the stick pass (F17, F21) ----
const planned=()=>{let s=seated('essayplan');s=reduce(s,{type:'essay.plan',lens:'evidence'});return {...s,screen:'essayplan'};};
test('F17: essay.slot closes the slot ask for that slot, and the status that sent the learner to the phone goes with it',()=>{
 let s=planned();
 for(let i=0;i<3;i++){
  s={...reduce(s,{type:'status',text:store.planStatus?store.planStatus(i):'say or type slot on the phone'}),};
  s=reduce(s,{type:'ask.open',kind:'slot',detail:{i}});
  assert.equal(s.ask.kind,'slot');assert.equal(s.ask.detail.i,i);
  s=reduce(s,{type:'essay.slot',i,text:'A sentence number '+i+' that says something clearly.'});
  assert.equal(s.ask,null,`slot ${i} answered closes its ask`);assert.equal(s.status,'',`slot ${i} answered clears the phone line`);
 }
});
test('F17: essay.slot leaves another kind of ask, and an ask on another slot, open',()=>{
 let s=planned();
 s=reduce(s,{type:'ask.open',kind:'slot',detail:{i:2}});
 assert.equal(reduce(s,{type:'essay.slot',i:0,text:'A first sentence that says something clearly.'}).ask?.detail?.i,2);
 const o=reduce(planned(),{type:'ask.open',kind:'rewrite'});
 assert.equal(reduce(o,{type:'essay.slot',i:0,text:'A first sentence that says something clearly.'}).ask?.kind,'rewrite');
});
test('F21: ask.cancel clears a status naming the phone, and leaves any other status',()=>{
 let s=reduce(seated('essayplan'),{type:'status',text:'say or type slot 1, Your claim, on the phone'});
 s=reduce(s,{type:'ask.open',kind:'slot',detail:{i:0}});
 const c=reduce(s,{type:'ask.cancel',id:s.ask.id});assert.equal(c.ask,null);assert.equal(c.status,'');
 let t=reduce(seated('essayplan'),{type:'ask.open',kind:'slot',detail:{i:0}});t=reduce(t,{type:'status',text:'Saved.'});
 assert.equal(reduce(t,{type:'ask.cancel',id:t.ask.id}).status,'Saved.');
 assert.equal(reduce(c,{type:'ask.cancel',id:'stale'}).status,'');
});
