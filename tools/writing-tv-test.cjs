/**
 * Writing on the TV (docs/concepts/TV-WRITING-SCREEN-2026-10-21.md): the Writing screen (off the desk since 2026-10-22: no landing stop), its
 * key map, the `writing` hand-off to the phone, the ask door's kind check for it, the coaching and the save through the
 * writing routes (a stub text engine, a scratch DESK_DATA_DIR, never desk/data), and Back to the landing. No model.
 * Run with npm test in desk/ (directly: node tools/writing-tv-test.cjs).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=fs.mkdtempSync(path.join(os.tmpdir(),'desk-writing-tv-'));process.env.DESK_DATA_DIR=data;
const src=(f)=>path.join(root,'src',f);
const store=require(src('lib/session/store.ts'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
const {reduce,fresh,badPost}=store;
const {tvKey,LOCAL}=require(src('tv/keys.ts'));
const rows=require(src('tv/landingRows.ts'));
const W=require(src('tv/writingScreen.ts'));
const {ASK_PANEL,panelFor}=require(src('app/phone/panelFor.ts'));
const {barItems}=require(src('app/phone/phoneBar.ts'));
const {landingView}=require(src('landing/model.ts'));

const EMA={id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']};
const KID={id:'kid',name:'Kid',type:'elementary',age:9,system:'uk',modules:['essay']};
const base=(patch={})=>({...fresh(),profiles:[EMA,KID],learner:{id:'ema',name:'Ema'},joined:true,phonesLive:1,writing:{},history:[],...patch});
const ev=(s,k)=>tvKey(s,k,LOCAL).events;
/** The session after a key's events, through the reducer (no route). */
const press=(s,k)=>ev(s,k).reduce((x,e)=>reduce(x,e),s);
const DRAFT='I think screens should go away before bed. They are bright and they are fun.';
const REVISED='I think screens should go away before bed. A 2019 study of 1,000 teenagers found screen users fell asleep 30 minutes later, because the light keeps the brain awake.';

// 2026-10-22: Essay Master is the one writing tile on the landing. The Writing screen below stays in code but is off the desk
// (no landing stop reaches it) until it is folded into Essay Master, so these cases open it by its screen name.
test('landing: Writing is no stop beside Essay Master - the desk has the three apps, the place card and the phone',()=>{
 assert.deepEqual(rows.landingStops(base()),['maths','english','essay','place','phone']);
 assert.deepEqual(rows.landingStops(base({learner:{id:'kid',name:'Kid'}})),['essay','place','phone']);
 assert.deepEqual(rows.landingStops(base({profiles:[{...EMA,modules:['maths']}]})),['maths','place','phone']);
 assert.equal(rows.writingOn(base()),false);
 const v=landingView(base({screen:'landing',focus:2}));
 assert.deepEqual(v.apps.map((a)=>a.id),['maths','english','essay'],'no Writing tile beside Essay Master');
 assert.equal(v.at,'essay');
});

test('landing: Writing has no world of its own - its art draws the empty world, and worlds.tsx is not asked for one',()=>{
 const {worldArt}=require(src('landing/model.ts'));
 assert.equal(worldArt({app:'writing',fresh:true,done:0,open:false}),null);
 assert.equal(worldArt({app:'essay',fresh:true,sent:null,paras:0}).app,'essay');
 const worlds=fs.readFileSync(src('landing/themes/paper/worlds.tsx'),'utf8');
 assert.doesNotMatch(worlds,/writing/i,'the paper worlds are perf pass 3\'s: Writing borrows the empty world');
});

test('Writing screen: the prompt list is the band\'s, Up/Down walk it, Select picks, Back leaves for Essay Master',()=>{
 const s=base({screen:'writing',focus:0});
 assert.deepEqual(W.writingStops(s),W.writingPrompts(s).map((p)=>p.id));
 assert.deepEqual(W.writingPrompts(s).map((p)=>p.band),['teen','teen','teen'],'Ema is 16');
 assert.ok(W.writingPrompts(base({learner:{id:'kid',name:'Kid'}})).every((p)=>p.band!=='teen'),'a nine-year-old gets the young prompts');
 assert.deepEqual(ev(s,'down'),[{type:'focus',focus:1}]);assert.deepEqual(ev(s,'right'),[{type:'focus',focus:1}]);
 assert.deepEqual(ev(s,'up'),[],'the first prompt stays');
 assert.deepEqual(ev({...s,focus:1},'select'),[{type:'writing.pick',promptId:W.writingPrompts(s)[1].id},{type:'focus',focus:0}]);
 assert.deepEqual(ev(s,'back'),[{type:'nav',screen:'essaytype',focus:5}],'Back: the Essay Master lens home, the lamp on Write from a prompt');
 assert.deepEqual(ev(s,'menu'),[],'Menu on the list does nothing');
 const picked=press(s,'select');
 assert.deepEqual(picked.writingTv,{promptId:'screens',stage:'write'});assert.equal(W.writingPhase(picked),'write');
});

test('Writing screen: on the chosen prompt Select hands the typing to the phone as a named writing ask; Back cancels it first',()=>{
 const s=base({screen:'writing',focus:0,writingTv:{promptId:'screens',stage:'write'}});
 assert.deepEqual(W.writingStops(s),['phone','another']);
 assert.equal(W.phoneActionLabel(s),'Write it on your phone');
 assert.deepEqual(ev(s,'select'),[{type:'ask.open',kind:'writing'}]);
 const asking=press(s,'select');
 assert.equal(asking.ask.kind,'writing');assert.equal(asking.ask.screen,'writing');assert.equal(W.writingAskOf(asking)?.id,asking.ask.id);
 assert.match(W.writingLine(asking),/On the phone: your paragraph\. Back cancels\./);
 assert.deepEqual(ev(asking,'select'),[],'no second ask while one is open');
 assert.deepEqual(ev(asking,'back'),[{type:'ask.cancel',id:asking.ask.id}],'the first Back cancels the hand-off');
 assert.deepEqual(ev(asking,'menu'),[],'Menu does not drop the prompt under an open ask');
 assert.deepEqual(ev(s,'back'),[{type:'nav',screen:'essaytype',focus:5}],'with none open, Back is Essay Master');
 assert.equal(reduce(asking,{type:'nav',screen:'landing',focus:rows.LANDING_REST}).ask,null,'leaving the screen closes the ask');
 // Another prompt: the list again, the lamp on the prompt that was chosen; Menu is the same
 assert.deepEqual(ev({...s,focus:1},'select'),[{type:'writing.clear'},{type:'focus',focus:0}],'the lamp back on the prompt\'s own row');
 assert.deepEqual(ev({...s,writingTv:{promptId:'uniform',stage:'write'}},'menu'),[{type:'writing.clear'},{type:'focus',focus:1}]);
 assert.equal(reduce(asking,{type:'writing.clear'}).ask,null,'clearing the episode closes its hand-off');
 assert.deepEqual(ev({...s,writingTv:{promptId:'screens',stage:'write',busy:true}},'select'),[],'nothing moves under a paragraph being read');
});

test('the hand-off: the writing ask has its own phone panel, which fits a phone with its own Send and Cancel in the bar',()=>{
 assert.equal(ASK_PANEL.writing,'write');
 const s=reduce(base({screen:'writing',writingTv:{promptId:'screens',stage:'write'}}),{type:'ask.open',kind:'writing'});
 assert.equal(panelFor(s),'write');
 assert.deepEqual(barItems({joined:true,ask:{kind:'writing',phase:'open'}}).map((i)=>i.id),['cancel'],'Cancel in the bar; the panel sends');
 const panel=fs.readFileSync(src('app/phone/WritingPanel.tsx'),'utf8');
 assert.match(panel,/askId: ask\.id/,'the panel names the open ask when it sends');
 assert.match(panel,/width: "100%", boxSizing: "border-box"/,'the text box never runs past the panel (360 and 414 px)');
 const {writingSend}=require(src('app/phone/WritingPanel.tsx'));
 assert.deepEqual(writingSend({writingTv:{promptId:'screens',stage:'write'}}),{url:'/api/writing/coach',field:'draft',label:'Send paragraph'});
 assert.deepEqual(writingSend({writingTv:{promptId:'screens',stage:'coached'}}),{url:'/api/writing/finish',field:'revision',label:'Send revision'});
 const page=fs.readFileSync(src('app/phone/page.tsx'),'utf8');
 assert.match(page,/screen === "write" && s && s\.ask\?\.kind === "writing" && <WritingPanel/,'the phone draws the panel only for a writing ask');
});

test('the door: only the TV moves the episode - a phone may not pick or clear, and no screen or phone may post coached, finished or busy',()=>{
 for(const type of ['writing.coached','writing.finished','writing.busy'])assert.match(badPost({type,draft:'x',note:'y',revision:'z',saved:'s',busy:true,by:'ema'}),/does not know/,type);
 assert.equal(badPost({type:'writing.pick',promptId:'screens'}),null);assert.equal(badPost({type:'writing.clear'}),null);
 // a phone posting a pick or a clear is refused: neither is on the phone's allowlist (lib/session/pairing.ts PHONE_MAY)
 const {PHONE_MAY}=require(src('lib/session/pairing.ts'));
 for(const type of ['writing.pick','writing.clear'])assert.equal(PHONE_MAY.has(type),false,type);
 // the routes' results land only on the learner they were for, at the stage they answer
 const s=base({writingTv:{promptId:'screens',stage:'write'}});
 assert.equal(reduce(s,{type:'writing.coached',draft:DRAFT,note:'n',by:'kid'}),s,'another learner\'s note is dropped');
 assert.equal(reduce(s,{type:'writing.finished',revision:REVISED,saved:'x',by:'ema'}),s,'no finish before the note');
 assert.equal(reduce(base(),{type:'writing.pick',promptId:'screens'}).writingTv.promptId,'screens');
 assert.equal(reduce({...base(),learner:null},{type:'writing.pick',promptId:'screens'}).writingTv??null,null,'no one seated: no episode');
 assert.equal(reduce(s,{type:'learner.set',id:'kid'}).writingTv,null,'a switch of learner drops the episode');
});

// ---- the routes, with a stub text engine: the kind check at the ask door, the coaching, the save
const reg=require(src('lib/engines/registry.ts'));require(src('lib/engines/text.ts'));
afterEach(()=>reg.resetProviders());
let noted=0;
const stubNote=(note)=>reg.useProvider('text',{name:'stub',run:async()=>{noted++;return {raw:{note}};}});
const call=(name,body,role='phone')=>require(src(`app/api/writing/${name}/route.ts`)).POST(new Request(`http://desk/api/writing/${name}`,{method:'POST',headers:{'x-desk-role':role},body:JSON.stringify(body)}));
const seat=(writingTv,kind='writing')=>{
 store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{id:'wtv-ema',name:'Ema',type:'high-school',age:16}});store.dispatch({type:'profile.save'});
 globalThis.__desk.session={...store.getSession(),screen:'writing',writingTv};
 if(kind)store.dispatch({type:'ask.open',kind});return store.getSession();
};

test('the ask door checks the ask\'s KIND as well as its id: an id of another module\'s open ask answers no writing ask',async()=>{
 stubNote('Your claim has nothing a reader can check yet. What would show it is true?');noted=0;
 const s=seat({promptId:'screens',stage:'write'},'paragraph');
 let r=await call('coach',{askId:s.ask.id,draft:DRAFT});
 assert.equal(r.status,409,'the id is the open ask\'s, but it is Essay Master\'s paragraph ask');
 assert.equal(store.getSession().writingTv.stage,'write');assert.equal(noted,0,'no model call');
 assert.equal(store.getSession().ask?.id,s.ask.id,'the other module\'s ask is left as it was');
 const w=seat({promptId:'screens',stage:'write'});
 r=await call('coach',{askId:'not-it',draft:DRAFT});assert.equal(r.status,409,'a stale id');
 r=await call('coach',{draft:DRAFT,promptId:'screens'},'tv');assert.equal(r.status,200,'no askId from the TV or an in-process caller: the /writing page, stateless as before');
 assert.equal(store.getSession().writingTv.stage,'write','the page\'s coaching leaves the TV episode alone');
 // a phone that leaves the askId out does not walk round the door (TL-11: a phone answers the open ask and nothing else)
 noted=0;r=await call('coach',{draft:DRAFT,promptId:'screens'});
 assert.equal(r.status,409,'a phone with no askId is refused at the coach route');assert.equal(noted,0,'and spends no model call');
 const L=require(src('lib/session/learners.ts')),lines=L.getLearner('wtv-ema').history.length;
 r=await call('finish',{promptId:'screens',draft:DRAFT,note:'a note',revision:REVISED});
 assert.equal(r.status,409,'a phone with no askId is refused at the finish route');
 assert.equal(L.getLearner('wtv-ema').history.length,lines,'and writes nothing to the learner\'s record');
 assert.equal(store.getSession().ask?.id,w.ask.id,'the open writing ask is left as it was');
 // the /writing page's finish carries the note it was given: an empty one is a coaching step that never happened
 for(const note of ['','   ']){
  r=await call('finish',{promptId:'screens',draft:DRAFT,note,revision:REVISED},'tv');
  assert.equal(r.status,400,'no note, no "coached on" line');assert.equal(L.getLearner('wtv-ema').history.length,lines,'nothing saved');
 }
 const lib=fs.readFileSync(src('lib/session/phoneAsk.ts'),'utf8');
 assert.match(lib,/fields\.askId !== ask\.id \|\| !answers\.includes\(ask\.kind\)/,'the door checks the id and the kind, for every kind');
 assert.ok(w.ask);
});

test('the phone\'s paragraph is coached through the writing ask: a refusal keeps the ask open, the note lands on the TV, then the revision is saved to the learner\'s record',async()=>{
 const note='Your claim has nothing a reader can check yet. What would show it is true?';
 stubNote(note);noted=0;
 let s=seat({promptId:'screens',stage:'write'});
 let r=await call('coach',{askId:s.ask.id,draft:'Too short.'});
 assert.equal(r.status,400);assert.match((await r.json()).error,/at least 2 sentences/);
 assert.equal(store.getSession().ask?.id,s.ask.id,'a paragraph the rules refuse does not spend the ask');assert.equal(noted,0);
 r=await call('coach',{askId:s.ask.id,draft:DRAFT});
 assert.equal(r.status,200);
 s=store.getSession();
 assert.equal(s.writingTv.stage,'coached');assert.equal(s.writingTv.note,note);assert.equal(s.writingTv.draft,DRAFT);assert.equal(s.writingTv.busy,false);
 assert.equal(s.ask,null,'the answer closes the ask');assert.equal(noted,1);
 assert.equal(W.writingDone(s),1);assert.equal(W.phoneActionLabel(s),'Revise it on your phone');
 // the revision: a second writing ask from the TV, answered by the finish route
 const tv=press({...s,focus:0},'select');assert.equal(tv.ask.kind,'writing');
 globalThis.__desk.session=tv;
 r=await call('finish',{askId:tv.ask.id,revision:DRAFT});
 assert.equal(r.status,400,'an unchanged paragraph is no revision');assert.equal(store.getSession().ask?.id,tv.ask.id,'and the ask stays open');
 r=await call('finish',{askId:tv.ask.id,revision:REVISED});
 assert.equal(r.status,200,JSON.stringify(await r.clone().json()));
 s=store.getSession();
 assert.equal(s.writingTv.stage,'finished');assert.match(s.writingTv.saved,/sentences, coached on evidence; the revision now gives evidence/);assert.equal(s.ask,null);
 assert.match(W.writingLine(s),/^Saved to your record: /);
 // the learner file under the scratch data dir holds the episode
 const L=require(src('lib/session/learners.ts'));const l=L.getLearner('wtv-ema');
 assert.equal(l.history.at(-1).kind,'writing');assert.equal(l.history.at(-1).label,'Screens before bed');
 assert.ok(fs.existsSync(path.join(data,'learners.json')),'learners.json in the scratch dir');
 // the session re-reads the record on writing.finished (REHYDRATE): the landing says what was written without another event
 assert.equal(s.history.at(-1)?.label,'Screens before bed','the session\'s history holds the episode');
 // a second send after the save answers nothing
 r=await call('finish',{askId:tv.ask.id,revision:REVISED+' More.'});assert.equal(r.status,409);
});

test('the TV draws the Writing screen in the On Air shell, and nothing typed: the note, the progress and the actions',()=>{
 const tv=fs.readFileSync(src('app/tv/page.tsx'),'utf8');
 assert.match(tv,/case "writing": return <WritingTV s=\{s\} \/>;/);
 const screen=fs.readFileSync(src('writing/WritingTV.tsx'),'utf8');
 assert.doesNotMatch(screen,/ep\.draft|ep\.revision/,'the TV never shows the typed paragraph: the phone owns it');
 for(const role of ['writing-prompt','writing-progress','writing-note','writing-action','writing-caption'])assert.match(screen,new RegExp(`data-role="${role}"`),role);
 // the caption is what changes as the D-pad walks: it is announced on the list as on the chosen prompt (the landing's desk-announce)
 const captions=screen.match(/<div[^>]*data-role="writing-caption"[^>]*>/g)??[];
 assert.equal(captions.length,2,'one caption per phase');
 for(const c of captions)assert.match(c,/aria-live="polite"/,c);
});

test('a failing engine at the coach route: the code\'s own note lands on the TV, the ask closes, nothing stays busy; the page path answers the same',async()=>{
 reg.useProvider('text',{name:'stub',run:async()=>{noted++;throw new Error('down');}});noted=0;
 const s=seat({promptId:'screens',stage:'write'});
 let r=await call('coach',{askId:s.ask.id,draft:DRAFT});
 assert.equal(r.status,200,'a failed engine is no failed coaching: the code words the note');
 const body=await r.json();assert.equal(body.source,'code');assert.ok(noted>=1,'the engine was asked');
 const now=store.getSession();
 assert.equal(now.writingTv.stage,'coached');assert.equal(now.writingTv.busy,false,'busy is cleared');assert.equal(now.ask,null,'the answer closes the ask');
 const {codeNote}=require(src('lib/writing/coach.ts'));assert.equal(now.writingTv.note,codeNote(DRAFT,'teen'));
 r=await call('coach',{promptId:'screens',draft:DRAFT},'tv');
 assert.equal(r.status,200);assert.equal((await r.json()).source,'code','the /writing page gets the code note too');
});

test('the /writing page path saves a whole episode from its body to the seated learner, and refuses one that skips the revision',async()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'profile.draft',patch:{id:'wtv-page',name:'Page',type:'high-school',age:16}});store.dispatch({type:'profile.save'});
 const L=require(src('lib/session/learners.ts'));
 let r=await call('finish',{promptId:'screens',draft:DRAFT,note:'a note',revision:DRAFT},'tv');
 assert.equal(r.status,400,'an unchanged paragraph is no revision');assert.equal(L.getLearner('wtv-page').history.length,0);
 r=await call('finish',{promptId:'screens',draft:DRAFT,note:'a note',revision:REVISED},'tv');
 assert.equal(r.status,200);const b=await r.json();
 assert.equal(b.focus,'evidence');assert.equal(b.holds,true);assert.match(b.saved,/coached on evidence; the revision now gives evidence/);
 const h=L.getLearner('wtv-page').history;assert.equal(h.length,1);assert.deepEqual([h[0].kind,h[0].label],['writing','Screens before bed']);
 assert.equal(store.getSession().writingTv??null,null,'the page path leaves the TV episode alone');
 // the session reads the record again, as the TV path does on writing.finished: the landing and the recap show it at once
 const s=store.getSession();assert.equal(s.history.at(-1)?.label,'Screens before bed','the session\'s history holds the page\'s episode');
 assert.deepEqual(Object.keys(s.writing),Object.keys(L.getLearner('wtv-page').writing),'and its writing record');
 // a re-read for a learner who is not seated changes nothing
 assert.equal(store.reduce(s,{type:'learner.reread',by:'someone-else'}),s);
});

test('a phone with no readable body, an empty body or no ask open meets the same ask door at coach and finish: 409, no model call, no save',async()=>{
 stubNote('A note.');noted=0;
 const L=require(src('lib/session/learners.ts'));
 for(const withAsk of [true,false]){
  seat({promptId:'screens',stage:'write'},withAsk?'writing':null);
  const lines=L.getLearner('wtv-ema').history.length;
  for(const name of ['coach','finish']){
   for(const raw of ['{}','not json','null','[]']){
    const r=await require(src(`app/api/writing/${name}/route.ts`)).POST(new Request(`http://desk/api/writing/${name}`,{method:'POST',headers:{'x-desk-role':'phone'},body:raw}));
    assert.equal(r.status,409,`${name} ${raw} ask=${withAsk}`);assert.equal((await r.json()).error,'The TV is not asking for that now.');
   }
  }
  assert.equal(noted,0,'no model call');assert.equal(L.getLearner('wtv-ema').history.length,lines,'nothing saved');
 }
});
