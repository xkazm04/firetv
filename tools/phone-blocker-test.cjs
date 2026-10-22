/**
 * The phone as a blocker (docs/concepts/PHONE-BLOCKER-PAIRING-2026-10-22.md): a Select that needs the phone, with none live,
 * is the pairing page for that wish (session.pairFor), never a silent no-op and never an ask nobody can answer. A phone that
 * joins (or returns) puts the TV back on the same screen and lamp and the held Select runs again; Back gives the wish up;
 * with a phone live nothing changes. Pure: sessions are plain objects, the reducer is the store's own, no route, no model.
 * Run with npm test in desk/ (directly: node tools/phone-blocker-test.cjs).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
require('./ts-load.cjs');
const root=path.resolve(__dirname,'../desk'),src=(f)=>path.join(root,'src',f);
const data=path.join(os.tmpdir(),`desk-phone-blocker-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;
const store=require(src('lib/session/store.ts'));
after(()=>{clearInterval(globalThis.__desk&&globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
const keys=()=>require(src('tv/keys.ts'));
const rules=()=>require(src('lib/rules/pairBlock.ts'));
const LOCAL={busy:false,table:false,hintInFlight:false};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
const page={id:'p1',subject:'maths',day:today(),title:'Sheet one',img:'',w:100,h:100,items:[{n:1,key:'k1',text:'x + 1 = 2',band:[0,10]},{n:2,key:'k2',text:'x + 2 = 5',band:[10,20]}]};
function session(patch={}){
 return {subject:'maths',screen:'landing',focus:0,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,ask:null,phonesLive:0,
  learner:{id:'ema',name:'Ema'},profiles:[{id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']}],draft:null,
  timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,
  english:null,essay:null,practice:null,topic:null,walkIx:0,skills:{},history:[],jobs:{},log:{started:null,minutes:0,problems:[],hard:[],hints:0},status:'',...patch};
}
const askKinds=(step)=>step.events.filter(e=>e.type==='ask.open').map(e=>e.kind);
const set={topic:'fractions',items:[{n:1,q:'1+1',a:'2',key:'a',verdict:null}],at:1};

// the audit table, as code: [name, session, key, the ask kind wanted]
const CASES=[
 ['Tonight: Select on I have homework, no sheet yet (page)',()=>session({screen:'tonight',focus:0}),'select','page'],
 ['Essay lens home: Select on a lens (paragraph)',()=>session({subject:'essay',screen:'essaytype',focus:0}),'select','paragraph'],
 ['Paragraph plan: Select on a slot (slot)',()=>session({subject:'essay',screen:'essayplan',focus:0,essayPlan:{lens:'claim',slots:['','','']}}),'select','slot'],
 ['Sentence screen: Try a sentence (sentence)',()=>session({subject:'english',screen:'sentence',english:null,focus:0}),'select','sentence'],
 ['Page: Ask in words (question)',()=>session({screen:'page',pages:[page],pageIx:0,itemIx:1,focus:1}),'select','question'],
 ['Hint: Ask in words (question)',()=>session({screen:'hint',pages:[page],pageIx:0,itemIx:0,focus:2}),'select','question'],
 ['Practice card: Snap the sheet (sheet)',()=>session({screen:'practice',practice:set,focus:0}),'select','sheet'],
 ['Practice card: Type my answers (answers)',()=>session({screen:'practice',practice:set,focus:1}),'select','answers'],
 ['Paper: Type a paper (paper)',()=>session({screen:'paper',focus:99}),'select','paper'],
 ['Learner cards: Add a learner (name)',()=>session({screen:'learner',focus:1}),'select','name'],
 ['Writing: the phone stop (writing)',()=>session({screen:'writing',writingTv:{promptId:'screens',stage:'write'},focus:0}),'select','writing'],
];

test('every phone-blocked Select with no phone live is one pair.for naming the wish: no ask, no call, no other event',()=>{
 const {tvKey}=keys();
 for(const [name,mk,key,kind] of CASES){
  const open=tvKey({...mk(),phonesLive:1},key,LOCAL);
  assert.ok(askKinds(open).includes(kind),`${name}: with a phone live the key opens the ${kind} ask (the fixture reaches the stop)`);
  const blocked=tvKey(mk(),key,LOCAL);
  assert.deepEqual(blocked.events,[{type:'pair.for',kind}],`${name}: no phone -> the pairing page`);
  assert.deepEqual(blocked.calls,[],name);assert.deepEqual(blocked.local,{},name);
 }
});

test('with a phone live, or on a key that asks for nothing, the step is what it always was',()=>{
 const {tvKey}=keys();
 const s=session({screen:'tonight',focus:2});
 assert.deepEqual(tvKey(s,'select',LOCAL).events.map(e=>e.type),['subject','nav'],'Teach me something needs no phone');
 assert.deepEqual(tvKey(session({screen:'learner',focus:0}),'select',LOCAL).events.map(e=>e.type),['learner.set'],'choosing a learner needs no phone');
 assert.deepEqual(tvKey(session({screen:'tonight',focus:0}),'right',LOCAL).events.map(e=>e.type),['focus']);
 assert.equal(tvKey(session({screen:'tonight',focus:0,phonesLive:2}),'select',LOCAL).events.some(e=>e.type==='pair.for'),false);
 // an unknown count (a plain fixture without phonesLive) is not "no phone": only a counted zero blocks
 const bare=session({screen:'tonight',focus:0});delete bare.phonesLive;
 assert.equal(tvKey(bare,'select',LOCAL).events.some(e=>e.type==='pair.for'),false);
 // Linga's reply opens by itself and the remote can answer it: it is not a blocker
 const {blockedAsk}=rules();
 assert.equal(blockedAsk({phonesLive:0},[{type:'ask.open',kind:'reply'}]),null);
 assert.equal(blockedAsk({phonesLive:0},[{type:'ask.open',kind:'words'}]),'words');
});

test('pair.for puts the pairing page up, remembering the screen, the lamp and the wish; it drops an ask and does nothing with a phone live',()=>{
 const s=session({screen:'essaytype',subject:'essay',focus:2,ask:{id:'a',kind:'paragraph',learner:'ema',screen:'essaytype',at:1,phase:'open'}});
 const n=store.reduce(s,{type:'pair.for',kind:'paragraph'});
 assert.equal(n.screen,'pair');assert.equal(n.focus,0);assert.equal(n.back,'essaytype');assert.equal(n.ask,null);
 assert.deepEqual({...n.pairFor,at:0},{screen:'essaytype',focus:2,kind:'paragraph',gone:true,at:0},'gone: a phone had been paired before');
 assert.equal(store.reduce({...s,phonesLive:1},{type:'pair.for',kind:'paragraph'}).screen,'essaytype','a phone is live: nothing');
 assert.equal(store.reduce({...s,joined:false},{type:'pair.for',kind:'paragraph'}).pairFor.gone,false,'never paired: not gone');
 assert.equal(store.reduce(n,{type:'pair.for',kind:'slot'}),n,'already on the pairing page: unchanged');
});

test('a phone joining puts the TV back on the same screen and lamp with the wish ready; the held Select then runs with the phone counted in',()=>{
 const {tvKey,resumeStep}=keys();
 const s0=session({screen:'essaytype',subject:'essay',focus:2,joined:false});
 const blocked=tvKey(s0,'select',LOCAL);
 let s=store.reduce(s0,blocked.events[0]);
 assert.equal(s.screen,'pair');
 assert.equal(resumeStep(s),null,'nothing to resume while the pairing page is up');
 s=store.reduce(s,{type:'join'});
 assert.equal(s.screen,'essaytype');assert.equal(s.focus,2);assert.equal(s.pairFor.ready,true,'the join goes back, not to the Joined screen');
 const r=resumeStep(s,LOCAL);
 assert.deepEqual(r.events.map(e=>e.type),['pair.clear','essay.type','status','ask.open'],'cleared, then the lens chosen and the paragraph asked for, as the Select would');
 assert.equal(r.events.at(-1).kind,'paragraph');
 s=store.reduce(s,{type:'pair.clear'});assert.equal(s.pairFor,undefined);
});

test('a returning phone (presence, no new join) resumes too; presence 0 does not',()=>{
 let s=store.reduce(session({screen:'practice',practice:set,focus:1}),{type:'pair.for',kind:'answers'});
 const still=store.reduce(s,{type:'phone.presence',live:0});
 assert.equal(still.screen,'pair');assert.equal(still.pairFor.ready,undefined);
 s=store.reduce(s,{type:'phone.presence',live:1});
 assert.equal(s.screen,'practice');assert.equal(s.focus,1);assert.equal(s.pairFor.ready,true);
});

test('Back on the pairing page gives the wish up: the screen and lamp it came from, no pairFor, no ask',()=>{
 const {tvKey}=keys();
 const s=store.reduce(session({screen:'sentence',subject:'english',focus:1}),{type:'pair.for',kind:'sentence'});
 const step=tvKey(s,'back',LOCAL);
 assert.deepEqual(step.events,[{type:'nav',screen:'sentence',focus:1}]);
 const n=store.reduce(s,step.events[0]);
 assert.equal(n.screen,'sentence');assert.equal(n.pairFor,undefined);assert.equal(n.ask,null);
 // any other way off the page drops it too
 assert.equal(store.reduce(s,{type:'nav',screen:'landing'}).pairFor,undefined);
 // the paired buttons (Forget every phone) are not on a wish's page
 assert.deepEqual(tvKey({...s,focus:1},'select',LOCAL).events,[]);
});

test('without a wish the pair screen is what it was: Back to where it opened, the two buttons when paired',()=>{
 const {tvKey}=keys();
 const s=session({screen:'pair',back:'landing',focus:1});
 assert.deepEqual(tvKey(s,'select',LOCAL).events,[{type:'phones.forget'}]);
 assert.equal(tvKey(s,'back',LOCAL).events[0].screen,'landing');
});

test('the wording says whether a phone was paired and is gone, and names the job',()=>{
 const {pairWords,PAIR_JOB}=rules();
 assert.match(pairWords({kind:'paragraph',gone:false}).head,/needs a phone/);
 assert.match(pairWords({kind:'paragraph',gone:true}).head,/not here/);
 assert.match(pairWords({kind:'paragraph',gone:false}).sub,/paste or say your paragraph/);
 const kinds=[...fs.readFileSync(src('lib/session/store.ts'),'utf8').match(/export type AskKind =([^;]+);/)[1].matchAll(/"([a-z]+)"/g)].map(m=>m[1]);
 assert.deepEqual(kinds.filter(k=>!PAIR_JOB[k]),[],'every ask kind has its job named');
});

test('a phone and a guest may not post pair.for or pair.clear (the allowlists stay default-deny)',()=>{
 const {PHONE_MAY,guestMay,view}=require(src('lib/session/pairing.ts'));
 assert.equal(PHONE_MAY.has('pair.for'),false);assert.equal(PHONE_MAY.has('pair.clear'),false);
 assert.equal(guestMay(session(),{type:'pair.for',kind:'name'}),false);
 assert.equal(guestMay(session(),{type:'pair.clear'}),false);
 const s=store.reduce(session({screen:'tonight'}),{type:'pair.for',kind:'page'});
 assert.equal(view(s,'guest').pairFor,undefined,'the lobby is not told what the learner wanted');
});
