/**
 * Essay Master's paragraph sits with its learner: the paragraph, the lens chosen and the sentence it is on travel in
 * the seat swap (store.ts MathsSlot) like Math Buddy's work, a reading that lands for a learner who has left goes to
 * their slot (the owner on essay.type / essay.set), and the landing needs no guess about whose it is. Run with npm
 * test in desk/ (directly: node tools/essay-seat-test.cjs). The store is driven through reduce() over fresh(); the
 * scratch DESK_DATA_DIR is under the OS temp dir, never desk/data. No model is called.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-essay-seat-'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
const store=()=>require(path.join(root,'src/lib/session/store.ts'));
const keys=()=>require(path.join(root,'src/tv/keys.ts'));
const rows=()=>require(path.join(root,'src/tv/landingRows.ts'));

const sentences=(...t)=>t.map((text,i)=>({n:i+1,text,words:text.split(' ').length}));
const A1={type:'argument',text:'Cats sleep. Dogs bark. So cats win.',sentences:sentences('Cats sleep.','Dogs bark.','So cats win.'),
 verdicts:[{n:1,verdict:'strong',note:'ok'},{n:2,verdict:'faulty',note:'Whose?'},{n:3,verdict:'neutral',note:'ok'}],stats:{},summary:'Ema argues cats win. It leans on one claim.'};
const A2={...A1,text:'Rain falls. Sun shines.',sentences:sentences('Rain falls.','Sun shines.'),verdicts:[{n:1,verdict:'strong',note:'ok'},{n:2,verdict:'strong',note:'ok'}],summary:'A second reading for Ema.'};
const seatedEma=()=>{const {reduce,fresh}=store();return reduce(fresh(),{type:'learner.set',id:'ema'});};
const hasLast=(s)=>keys().lensStops(s).includes('last');

test('case 1: Ema reads a paragraph, the desk is handed to Jakub: nothing of hers is on his desk and his lens home has no last card',()=>{
 const {reduce}=store();
 let s=reduce(seatedEma(),{type:'essay.type',essayType:'argument'});
 s=reduce(s,{type:'essay.set',analysis:A1});
 assert.equal(hasLast(s),true,'Ema has her last card');
 s=reduce(s,{type:'learner.set',id:'jakub'});
 assert.equal(s.essay,null);assert.equal(s.essayType,null);assert.equal(s.essayAt,null);
 assert.equal(hasLast(s),false,'no last stop for Jakub');
});

test('case 2: Ema comes back: her paragraph, lens and sentence are where she left them; an empty slot is not kept',()=>{
 const {reduce}=store();
 let s=reduce(seatedEma(),{type:'essay.type',essayType:'argument'});
 s=reduce(s,{type:'essay.set',analysis:A1});s=reduce(s,{type:'essay.at',n:2});
 s=reduce(s,{type:'learner.set',id:'jakub'});
 assert.ok(s.away.ema,'her work is in away');
 s=reduce(s,{type:'learner.set',id:'ema'});
 assert.deepEqual(s.essay,A1);assert.equal(s.essayType,'argument');assert.equal(s.essayAt,2);
 assert.equal(s.away.jakub,undefined,'Jakub left nothing behind: his empty slot is deleted');
 assert.equal(hasLast(s),true);
});

test('case 3: a slot saved by the old build (no essay keys) seats cleanly, and a slot that has them survives a JSON round trip',()=>{
 const {reduce,fresh}=store();
 const old={...reduce(fresh(),{type:'learner.set',id:'jakub'}),essay:A2,essayType:'argument',essayAt:1};
 const oldSlot={pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,noLesson:false,lessonPaused:false,topic:'linear-two-step',practice:null,walkIx:0,log:{problems:[],hints:0,hard:[]},tasks:[]};
 for(const k of ['essay','essayType','essayAt'])assert.equal(k in oldSlot,false);
 const persisted=JSON.parse(JSON.stringify({...old,away:{ema:oldSlot}}));
 const s=reduce(persisted,{type:'learner.set',id:'ema'});
 assert.equal(s.essay,null);assert.equal(s.essayType,null);assert.equal(s.essayAt,null,'null, not undefined');
 assert.equal(s.topic,'linear-two-step','the old slot still seats');
 assert.equal(s.away.jakub.essay.summary,A2.summary,'and what was on the leaving desk went with its learner');
 // and one that has them
 let t=reduce(seatedEma(),{type:'essay.set',analysis:A1});
 t=reduce(t,{type:'learner.set',id:'jakub'});
 const round=JSON.parse(JSON.stringify(t));
 assert.equal(round.essay,null);assert.deepEqual(round.away.ema.essay,A1,'the keys are saved with the slot');
 const back=reduce(round,{type:'learner.set',id:'ema'});
 assert.deepEqual(back.essay,A1);
});

test('case 4: a reading that lands after Ema left the desk goes to her slot; the TV stays where it is',()=>{
 const {reduce}=store();
 let s=reduce(seatedEma(),{type:'learner.set',id:'jakub'});
 assert.equal(s.screen,'landing');
 s=reduce(s,{type:'essay.type',essayType:'argument',owner:'ema'});
 s=reduce(s,{type:'essay.set',analysis:A2,owner:'ema'});
 assert.equal(s.essay,null);assert.equal(s.essayType,null);assert.equal(s.screen,'landing','the TV is not pulled onto her forensic page');
 assert.deepEqual(s.away.ema.essay,A2);assert.equal(s.away.ema.essayType,'argument');
 assert.equal(hasLast(s),false);
 s=reduce(s,{type:'learner.set',id:'ema'});
 assert.deepEqual(s.essay,A2,'and it is there when she sits down');
});

test('case 5: GUARD: essay.set with no owner, or the seated learner as owner, opens the forensic page as before',()=>{
 const {reduce}=store();
 for(const ev of [{type:'essay.set',analysis:A1},{type:'essay.set',analysis:A1,owner:'ema'}]){
  const s=reduce(seatedEma(),ev);
  assert.equal(s.screen,'forensic');assert.deepEqual(s.essay,A1);assert.equal(s.essayAt,null);assert.equal(s.subject,'essay');
 }
 const t=reduce(seatedEma(),{type:'essay.type',essayType:'evidence',owner:'ema'});assert.equal(t.essayType,'evidence');
});

test('case 7: Jakub has read the same lens himself; Ema\'s paragraph is not drawn on his landing card',()=>{
 const {reduce}=store(),{essayWaiting}=rows();
 let s=reduce(seatedEma(),{type:'essay.set',analysis:A1});
 s=reduce(s,{type:'learner.set',id:'jakub'});
 s={...s,history:[{at:Date.now()-86400000,kind:'writing',label:'Argument',detail:'1 of 6 sentences to fix'}]};
 const w=essayWaiting(s);
 assert.equal(w.rail,null,'no sentences of Ema\'s on his card');
 assert.match(w.line,/1 of 6 sentences to fix/,'the caption names his own last reading');
 assert.doesNotMatch(w.line,/Ema|cats/i);
 // and the seated learner's own paragraph still draws its rail
 const own=essayWaiting({...reduce(seatedEma(),{type:'essay.set',analysis:A1}),history:s.history});
 assert.deepEqual(own.rail.map(x=>[x.n,x.against]),[[1,false],[2,true],[3,false]]);
});

test('plan case 8: Ema fills two slots, the desk goes to Jakub, who has no plan; back to Ema, her two slots are there',()=>{
 const {reduce}=store();
 let s=reduce(seatedEma(),{type:'essay.plan',lens:'argument'});
 s=reduce(s,{type:'essay.slot',i:0,text:'Schools should start later.'});s=reduce(s,{type:'essay.slot',i:1,text:'Research found that teenagers fall asleep later.'});
 assert.equal(s.essayPlan.slots.filter(Boolean).length,2);
 s=reduce(s,{type:'learner.set',id:'jakub'});
 assert.equal(s.essayPlan,undefined,'Jakub has no plan');
 assert.ok(s.away.ema.essayPlan,'it sits in Ema\'s slot');
 s=reduce(s,{type:'learner.set',id:'ema'});
 assert.deepEqual(s.essayPlan,{lens:'argument',slots:['Schools should start later.','Research found that teenagers fall asleep later.','']});
 assert.equal(s.away.jakub,undefined,'his empty chair keeps nothing');
 s=reduce(s,{type:'learner.set',id:'jakub'});
 assert.equal(JSON.parse(JSON.stringify(s)).away.ema.essayPlan.slots[0],'Schools should start later.','it survives a JSON round trip');
});
