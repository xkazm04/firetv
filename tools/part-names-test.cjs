/**
 * A part is called by its paper name wherever the learner sees or hears it (v2 M3a-2): the TV voice on the walk, the second
 * go's three sentences (route /api/second) and the explain reply (route /api/explain) say '5(b)' for the second part of the
 * fifth question, not the internal item number 6. A single item's lines are as they were. The stored lines are untouched.
 * Run with npm test in desk/ (directly: node tools/part-names-test.cjs). No model is called - the text engine is stubbed.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-part-names-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));
const store=require(src('lib/session/store.ts'));
const M=require(src('lib/rules/maths.ts'));
const W=require(src('lib/rules/calc-word.ts'));
const X=require(src('lib/desk/explain.ts'));
const {spokenLine}=require(src('lib/desk/spoken.ts'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const STEM='A ladder leans on a wall.';
const spec={shape:'derivative',f:'3x^2 + 2x'};
const single=(n)=>({n,question:`Differentiate f(x) = ${n}x^2.`,spec,verdict:'wrong',said:M.ASK(n)});
// four single items, then the word problem: 5(a) is item 5, 5(b) is item 6
const items=()=>[1,2,3,4].map(single).concat([
 {...single(5),stem:STEM,part:'a',said:M.RIGHT(5),verdict:'right'},
 {...single(6),stem:STEM,part:'b',said:M.RIGHT(6)},
]);
const session=(screen,extra={},walkIx=5)=>({screen,walkIx,practice:{items:items()},...extra});

test('1: the voice on the walk calls a part by its paper name, the card\'s line, and the stored line stays',()=>{
 const s=session('walk');
 const said=spokenLine(s);
 assert.equal(said,'Number 5(b) is right.');
 assert.match(said,/5\(b\)/);assert.doesNotMatch(said,/Number 6/);
 assert.equal(said,W.deskLine(s.practice.items,5,s.practice.items[5].said),'the card\'s line (namedLine + itemName)');
 assert.equal(s.practice.items[5].said,'Number 6 is right.','the stored line is as marking wrote it');
 assert.equal(spokenLine({...s,walkIx:4}),'Number 5(a) is right.');
});

test('2: a single item, and the hint, sentence, forensic and break screens, speak what they spoke',()=>{
 const s=session('walk');
 assert.equal(spokenLine({...s,walkIx:1}),M.ASK(2),'a single item on a set with parts');
 assert.equal(spokenLine({screen:'walk',walkIx:0,practice:{items:[single(1)]}}),M.ASK(1));
 assert.equal(spokenLine({screen:'walk',walkIx:0,practice:{items:[{...single(1),said:undefined}]}}),undefined);
 assert.equal(spokenLine({screen:'walk',walkIx:0,practice:null}),undefined);
 const hint1={hint:'Look at Number 6 again.'},hint2={hint:'Second.'};
 assert.equal(spokenLine({...s,screen:'hint',hint:{stage:1,hint1,hint2}}),'Look at Number 6 again.','the hint is not renamed');
 assert.equal(spokenLine({...s,screen:'hint',hint:{stage:2,hint1,hint2}}),'Second.');
 assert.equal(spokenLine({...s,screen:'sentence',english:{explanation:'Because.'}}),'Because.');
 assert.equal(spokenLine({...s,screen:'forensic',essay:{summary:'In short.'}}),'In short.');
 assert.equal(spokenLine({...s,screen:'break'}),'Time for a break.');
 assert.equal(spokenLine({...s,screen:'practice'}),'');
});

test('3: the second go\'s three sentences name a part 5(b); a single item\'s are unchanged',()=>{
 const its=items(),nm=(i)=>W.itemName(its,i);
 assert.equal(nm(5),'5(b)');
 const states=[{...its[5],verdict:'wrong',second:{}},{...its[5],verdict:'right'},{...its[5],verdict:'unsure'}];
 for(const it of states){
  const line=M.secondProblem(it,nm(5));
  assert.match(line,/5\(b\)/);assert.doesNotMatch(line,/umber 6|number 6/);
  assert.equal(line,M.secondProblem({...it,n:6},'5(b)'));
 }
 assert.equal(M.secondProblem({...its[5],verdict:'wrong'},nm(5)),null,'a wrong item without its go may take it');
 for(const v of ['right','unsure'])for(const second of [undefined]){
  const it={...single(2),verdict:v};
  assert.equal(M.secondProblem(it,W.itemName(its,1)),M.secondProblem(it),'a single item: byte for byte');
 }
 assert.equal(M.secondProblem({n:2,verdict:'wrong',second:{}},'2'),'Number 2 has had its second go. Look at where the pen is, or try a new set.');
 assert.equal(M.secondProblem({n:2,verdict:'right'}),'Number 2 came back right, so it needs no second go.');
 assert.equal(M.secondProblem({n:2,verdict:'unsure'}),'The desk is not sure about number 2 yet. Tell it how you got there first.');
});

let seen=[];
const stub=(reply)=>{seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);return {raw:JSON.stringify({reply,slip:'unclear',value:''})};}});};
const ask=(item,name)=>X.explainItem(item,'I used the product rule','calc1-rules','part-names-scratch',()=>false,20,'uk',name);

test('4: the explain reply names a part 5(b), from a model reply and from the said/ASK fallback; the stored reply is untouched',async()=>{
 const its=items(),b=its[5];
 stub('Look again at number 6, the second line.');
 let x=await ask(b,W.itemName(its,5));
 assert.equal(x.shown,'Look again at number 5(b), the second line.');
 assert.equal(x.reply,'Look again at number 6, the second line.','what the session stores');
 // a reply that is empty falls back to the item's own line, then to ASK
 stub('');
 x=await ask(b,'5(b)');assert.equal(x.shown,'Number 5(b) is right.');assert.equal(x.reply,'Number 6 is right.');
 x=await ask({...b,said:undefined},'5(b)');assert.equal(x.shown,W.namedLine(M.ASK(6),6,'5(b)'),'ASK');assert.notEqual(x.shown,M.ASK(6));
 assert.match(x.shown,/5\(b\)/);assert.doesNotMatch(x.shown,/umber 6/);
 // a single item: the same lines as before, named or not
 stub('Look again at number 2.');
 x=await ask(its[1],W.itemName(its,1));assert.equal(x.shown,x.reply);assert.equal(x.shown,'Look again at number 2.');
 x=await ask(its[1]);assert.equal(x.shown,x.reply);
});
