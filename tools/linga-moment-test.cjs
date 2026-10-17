/** Run with npm run test:rules in desk/ (directly: node tools/linga-moment-test.cjs). Code only: no model call, no desk/data. */
const path=require('node:path'),assert=require('node:assert/strict'),{test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/linga-moment',String(Date.now()));
const {momentAllowed}=require(path.join(root,'src/lib/english/conversation.ts'));
const {fossilOf,slipsAgain}=require(path.join(root,'src/lib/english/review.ts'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);});

const learner=(n,text)=>({id:`t${n}`,role:'learner',text});
const partner=(n,text)=>({id:`p${n}`,role:'partner',text});
const fix=(turnId,said,better)=>({id:`${turnId}:moment`,kind:'fix',said,better,why:'x',turnId,at:1});
function scene(level,lines,moments){
  const turns=[];lines.forEach((l,i)=>{turns.push(learner(i,l));turns.push(partner(i,'Okay, tell me more.'))});
  return {preferences:{correction:'as-needed',level},turns,moments};
}
const MARTIN='I think he don\'t agree with the plan.',ONDREJ='This train is more better than the bus.';

test('a fossil (martin: he don\'t agree) found by code stops one turn after a moment, inside the gap',()=>{
  const c=scene('B1',['I think he don\'t agree.','What do you mean?'],[fix('t0','he don\'t agree','he doesn\'t agree')]);
  assert.equal(momentAllowed(c),false,'the plain gap is not met');
  assert.equal(momentAllowed(c,true),true,'a repeated slip may stop inside the gap');
  const again=slipsAgain(MARTIN,c,[]);
  assert.ok(fossilOf(MARTIN,c,again),'the repeat is a fossil');
});

test('ondrej: more better said twice is a fossil with no moment yet, and only a repeat is let through',()=>{
  const c=scene('B1',['The bus is more better.','Yes, a long way.'],[]);
  const f=fossilOf(ONDREJ,c,slipsAgain(ONDREJ,c,[]));
  assert.ok(f);assert.equal(f.better,'better');
  assert.equal(momentAllowed(c),true);
});

test('the cap holds even for a repeat, and the beginner cap is lower than the adult one',()=>{
  const m=(n)=>Array.from({length:n},(_,i)=>fix(`t${i}`,'he don\'t agree','he doesn\'t agree'));
  const lines=['a','b','c','d','e'];
  assert.equal(momentAllowed(scene('A1',lines,m(2)),true),false);
  assert.equal(momentAllowed(scene('A1',lines,m(1)),true),true);
  assert.equal(momentAllowed(scene('B1',lines,m(2)),true),true);
  assert.equal(momentAllowed(scene('B1',lines,m(3)),true),true);
  assert.equal(momentAllowed(scene('B1',lines,m(4)),true),false);
  const off=scene('B1',lines,[]);off.preferences.correction='never';
  assert.equal(momentAllowed(off,true),false);
});
