/**
 * Withholding is the product: every maths hint line bound for the TV passes rules/maths leaks(), the one leak rule
 * (explain uses it too), and it reads an item as a photographed page delivers it ('Solve for x:  3x − 7 = 11').
 * The oracle and the corpus are the lab's: vision/poc_hints.py:26-39 (answers, leak terms) and the 24 recorded
 * maths hint stages in prototype/data.json, read here, never executed. Run with npm test in desk/ (directly:
 * node tools/withhold-rules-test.cjs). No model is called - the text engine is stubbed at the provider seam; a
 * disposable data directory under the OS temp dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-withhold-'));delete process.env.DESK_TEXT_ENGINE;
after(()=>fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true}));

const load=(f)=>require(path.join(root,'src/lib',f));
const reg=load('engines/registry.ts');
const maths=load('rules/maths.ts');
const {verify}=load('desk/verify.ts');
const {hint}=load('desk/hint.ts');
afterEach(()=>reg.resetProviders());

/** The stub at the provider seam: each call takes the next answer; every request is kept. */
let seen=[];
function stub(...answers){seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);const a=answers[Math.min(seen.length-1,answers.length-1)];return {raw:JSON.stringify(a)};}});}

// ---- the lab's corpus, read not run ----
const corpus=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../prototype/data.json'),'utf8'));
const page=corpus.pages[0];
const item=(n)=>page.items.find((i)=>i.n===n);
/** poc_hints.py:26-39 - the answers the lab checked a hint against, for the single-variable equation items. */
const ANSWERS={1:'6',2:'3',7:'20',10:'9'};
const EQUATIONS=[1,2,7,10];
/** Every number in a line, as the rule reads one. */
const numbers=(s)=>(s.match(/[-−]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?/g)??[]).map((v)=>v.replace(/\s+/g,'').replace(/^−/,'-'));
const words=(s)=>s.trim().split(/\s+/).filter(Boolean).length;

test('case 1: leaks reads the item as the page gives it; equationOf finds the equation or says there is none',()=>{
 assert.equal(maths.leaks('Solve for x:  3x − 7 = 11','so x = 6'),true);
 assert.equal(maths.equationOf('Solve:  x/4 + 3 = 8'),'x/4 + 3 = 8');
 assert.equal(maths.equationOf('Find the slope of the line through (2, 5) and (6, 13)'),null);
 assert.equal(maths.equationOf('Solve the system:  2x + y = 7  and  x − y = 2'),null,'a system has no single-variable oracle');
 assert.equal(maths.equationOf('3x+5=11'),'3x+5=11','a bare equation is its own equation');
 for(const n of EQUATIONS)assert.equal(maths.leaks(item(n).text,`x = ${ANSWERS[n]}`),true,`item ${n}: ${item(n).text}`);
});

test('case 2: an answer in the hint is re-asked once, naming the leak, and the clean second hint is what returns',async()=>{
 for(const n of EQUATIONS){
  const clean={hint:'Look at what is done to x last, and undo that first.',what_to_try_next:'Do the same to both sides.'};
  stub({hint:`Nearly there: x = ${ANSWERS[n]}.`,what_to_try_next:'Check it.'},clean);
  const h=await hint('maths',item(n).text,{});
  assert.equal(h.hint,clean.hint,`item ${n}`);assert.equal(h.next,clean.what_to_try_next,`item ${n}`);
  assert.equal(seen.length,2,`item ${n}: exactly one re-ask`);
  assert.match(seen[1].prompt,/previous hint gave the answer away/i,`item ${n}`);
  assert.doesNotMatch(seen[0].prompt,/gave the answer away/i);
  assert.doesNotMatch(seen[1].prompt,new RegExp(`x = ${ANSWERS[n]}\\b`),'the re-ask does not hand the leaked line back');
 }
});

test('case 3: a second leak falls back to the item\'s withheld line from rules/maths, next empty, no third call',async()=>{
 for(const n of EQUATIONS){
  stub({hint:`Nearly there: x = ${ANSWERS[n]}.`,what_to_try_next:'Check it.'},{hint:`So x is ${ANSWERS[n]}.`,what_to_try_next:'Done.'});
  const h=await hint('maths',item(n).text,{});
  assert.equal(seen.length,2,`item ${n}: no third model call`);
  assert.equal(h.hint,maths.withheldLine(item(n).text),`item ${n}`);
  assert.equal(h.next,'');
  assert(h.hint.trim().length>0,'never an empty TV');
  assert(words(h.hint)<=25,`item ${n}: ${words(h.hint)} words`);
  const eq=maths.equationOf(item(n).text);
  for(const v of numbers(h.hint))assert.equal(verify(eq,v),false,`item ${n}: withheld line carries ${v}`);
  assert.equal(maths.leaks(item(n).text,h.hint),false);
 }
 // a re-ask that fails still leaves the TV a line, never an error in place of the hint
 seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);if(seen.length>1)throw new Error('engine down');return {raw:JSON.stringify({hint:'So x = 6.',what_to_try_next:'Check it.'})};}});
 const down=await hint('maths',item(1).text,{});
 assert.deepEqual([down.hint,down.next,seen.length],[maths.withheldLine(item(1).text),'',2]);
 for(const n of [3,9]){const w=maths.withheldLine(item(n).text);assert(w&&words(w)<=25,`item ${n}`);assert.equal(maths.leaks(item(n).text,w),false);}
});

test('case 4: a leak in what_to_try_next alone is caught, and neither returned field carries the answer',async()=>{
 const q='Solve for x:  3x − 7 = 11';
 stub({hint:'Look at the -7.',what_to_try_next:'Then divide 18 by 3 to get 6.'},{hint:'Look at the -7.',what_to_try_next:'Undo it on both sides first.'});
 const h=await hint('maths',q,{});
 assert.equal(seen.length,2,'a re-ask');
 assert.match(seen[1].prompt,/what to try next/i,'the re-ask names the field that leaked');
 for(const f of [h.hint,h.next])assert(!numbers(f).includes('6'),f);
 assert.equal(h.next,'Undo it on both sides first.');
});

test('case 5: expression items leak by form - an equivalent product or polynomial, or a bracket whose root zeroes it',()=>{
 const factor='Factor completely:  x² + 7x + 12',expand='Expand:  (x + 4)(x − 3)';
 assert.equal(maths.leaks(factor,'It factors as (x + 3)(x + 4).'),true);
 assert.equal(maths.leaks(factor,'One of the brackets is (x + 3).'),true,'a linear bracket whose root zeroes the expression');
 assert.equal(maths.leaks(factor,'The other bracket is (x+4), think about it.'),true);
 assert.equal(maths.leaks(expand,'you should reach x^2 + x - 12'),true);
 assert.equal(maths.leaks(expand,'you should reach x² + x − 12.'),true);
 // the item's own form, or its own brackets, are not the answer
 assert.equal(maths.leaks(factor,'Look at x² + 7x + 12 and the constant term.'),false);
 assert.equal(maths.leaks(expand,'Multiply (x + 4) by each term of (x − 3).'),false);
 assert.equal(maths.leaks(factor,'Try a bracket like (x + 1) and check it.'),false,'a bracket that does not zero it is method talk');
 assert.equal(maths.expressionOf('Simplify:  (3x²y)(4xy³)'),null,'two variables: no oracle, stays unchecked');
});

test('case 6 GUARD: the 24 recorded real maths hint stages pass the gate - 0 flagged, 0 re-asks',async()=>{
 const recorded=Object.entries(corpus.hints).filter(([,h])=>h.subject==='math');
 assert.equal(recorded.length,12);
 let flagged=0,calls=0;
 for(const [key,h] of recorded){
  const text=(page.items.find((i)=>i.key===key)??{text:h.q}).text;
  for(const st of [h.hint1,h.hint2])for(const f of [st.hint,st.what_to_try_next])if(maths.leaks(text,f))flagged++;
  stub(h.hint1);const a=await hint('maths',text,{});calls+=seen.length;
  stub(h.hint2);const b=await hint('maths',text,{previous:a.hint});calls+=seen.length;
  assert.deepEqual([a.hint,a.next,b.hint,b.next],[h.hint1.hint,h.hint1.what_to_try_next,h.hint2.hint,h.hint2.what_to_try_next],key);
 }
 assert.equal(flagged,0,'the PoC judged 0/12 leaked (STUDY-DESK-POC-RESULTS.md:66)');
 assert.equal(calls,24,'no re-asks');
});

test('case 7 GUARD: method numbers are not answers, and a clean hint is still exactly one prompt',async()=>{
 const q='Solve for x:  3x − 7 = 11',line='Add 7 to both sides, then divide by 3.';
 assert.equal(maths.leaks(q,line),false);
 stub({hint:line,what_to_try_next:'Then see what x is.'});
 const h=await hint('maths',q,{});
 assert.equal(h.hint,line,'returned verbatim');assert.equal(seen.length,1);
 // tools/maths-rules-test.cjs 'hints withhold the answer...' - the same two calls, still exactly two prompts
 const reply={hint:'Look at what is added to 2x.',what_to_try_next:'Undo it on both sides.'};
 stub(reply);const h1=await hint('maths','2x+3=11',{});
 const all=[...seen];stub(reply);await hint('maths','2x+3=11',{previous:h1.hint,askedQ:'where do I start?'});
 assert.equal(all.length+seen.length,2);
});
