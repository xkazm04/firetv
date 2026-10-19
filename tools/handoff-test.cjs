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
