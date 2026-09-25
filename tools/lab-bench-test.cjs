/**
 * The lab bench (tools/lab-bench.cjs): the lab's corpus run through the PRODUCTION read, hint and lesson-pick
 * modules, scored with the lab's rules, a verdict per PoC kill criterion (STUDY-DESK-POC-RESULTS.md:7-9).
 * Everything here is the replay: recorded answers at the provider seam, no model, no network, a data directory
 * under the OS temp dir (never desk/data). Run with npm test in desk/ (directly: node tools/lab-bench-test.cjs).
 * No Python runs: the lab's tables are read out of vision/*.py as text.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {test,after}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const BENCH=path.join(__dirname,'lab-bench.cjs');
const {runBench}=require('./lab-bench.cjs');
const corpus=require('./lab-corpus.cjs');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'desk-lab-bench-test-'));
after(()=>fs.rmSync(scratch,{recursive:true,force:true}));

const cli=(...args)=>spawnSync(process.execPath,[BENCH,...args],{encoding:'utf8',timeout:120000,env:{...process.env,DESK_DATA_DIR:'',DESK_TEXT_ENGINE:''}});
const truthItems=(id)=>corpus.pages[id].items.map((t)=>({number:t.n,text:t.text,x:t.cx/corpus.pages[id].w,y:t.cy/corpus.pages[id].h}));
const pick=(o,keys)=>Object.fromEntries(keys.map((k)=>[k,o[k]]));

test('case 1: the maths sample page read back as printed -> found, exact and selects 10/10, verdict A pass',async()=>{
 assert.equal(corpus.pages.maths.sampleMatches,true,'data.json pages[0] is desk/public/samples/maths.jpg, byte for byte');
 const r=await runBench({replay:{read:{maths:truthItems('maths')}}});
 assert.deepEqual(pick(r.read.maths,['found','of','exact','selects']),{found:10,of:10,exact:10,selects:10});
 assert.deepEqual(r.read.maths.issues,[]);
 assert.equal(r.read.maths.cyErr,0);
 assert.equal(r.verdicts.A,'pass');
});

test('case 2: a dropped exponent and two swapped centres -> exact 9/10, selects 8/10, and the report names 2, 3 and 4',async()=>{
 const items=truthItems('maths');
 items[1].text='2x − 5x − 3 = 0';
 const y3=items[2].y;items[2].y=items[3].y;items[3].y=y3;
 const r=await runBench({replay:{read:{maths:items}}});
 assert.deepEqual(pick(r.read.maths,['found','of','exact','selects']),{found:10,of:10,exact:9,selects:8});
 assert.deepEqual([...new Set(r.read.maths.issues.map((i)=>i.n))].sort((a,b)=>a-b),[2,3,4]);
 assert.deepEqual(r.read.maths.issues.find((i)=>i.what==='text').n,2);
 // selects is the phone's own rule: the same nearestItem() the tap calls
 assert.equal(r.read.maths.rule,'nearestItem (desk/src/lib/desk/select.ts)');
 const src=fs.readFileSync(BENCH,'utf8');
 assert.match(src,/select\.nearestItem\(/);
 assert.doesNotMatch(src,/cy - y\)/,'the bench has no selection rule of its own');
});

test('case 3: the 24 recorded PoC maths hint stages through the production hint() -> leaked 0/12, LaTeX on 3',async()=>{
 const r=await runBench({replay:true});
 assert.deepEqual(pick(r.hints,['leaked','of','latex']),{leaked:0,of:12,latex:3});
 assert.equal(r.hints.reasked,0,'the gate lets every recorded stage through untouched');
 assert.equal(r.hints.reached,0);
 assert.equal(r.hints.rule,'rules/maths leaks()');
 assert.equal(r.verdicts.B,'pass');
});

test('case 4: the model states x = 6 and x = 20 -> leaked 2/12, kill criterion B fail, exit 1 from the command',async()=>{
 const fixture={hints:{
  'Solve for x: 3x - 7 = 11':{hint1:{hint:'x = 6',what_to_try_next:'Check it by substituting.'}},
  'Solve: x/4 + 3 = 8':{hint1:{hint:'x = 20',what_to_try_next:'Check it by substituting.'}},
 }};
 const r=await runBench({replay:fixture});
 assert.deepEqual(pick(r.hints,['leaked','of']),{leaked:2,of:12});
 assert.equal(r.hints.reached,0,'the gate still kept both answers off the TV');
 assert.equal(r.verdicts.B,'fail');
 const f=path.join(scratch,'leaky.json');fs.writeFileSync(f,JSON.stringify(fixture));
 const out=cli('--replay',f);
 assert.equal(out.status,1,out.stderr);
 assert.match(out.stdout,/B\b.*fail/);
});

test('case 5: the run-3 picks through the production pickLesson() -> 8/9 as the lab; all none -> 2/9 fail; a pick outside the acceptable set is wrong',async()=>{
 // the queries and their acceptable lessons are the lab's (vision/poc_retrieval.py QUERIES + ACCEPT), not data.json's picks
 const py=fs.readFileSync(path.join(REPO,'vision/poc_retrieval.py'),'utf8');
 assert.equal(corpus.queries.length,9);
 for(const q of corpus.queries){assert(py.includes(JSON.stringify(q.q)),`${q.q} is a poc_retrieval.py query`);assert(Array.isArray(q.accept));}
 assert.deepEqual(corpus.queries.filter((q)=>!q.accept.length).map((q)=>q.q),['What is 15% of 240?','The angles of a triangle are x, 2x and 3x. Find x.']);
 assert(corpus.queries.some((q)=>q.q==='Does 2x + 3 = 2x + 5 have a solution?'),'the ninth query, absent from data.json');
 // the replay is its own recorded answer set
 assert.equal(Object.keys(corpus.run3).length,9);
 assert.equal(corpus.run3['The angles of a triangle are x, 2x and 3x. Find x.'],'bAerID24QJ0');
 assert.equal(corpus.run3['What is 15% of 240?'],'none');
 const r=await runBench({replay:true});
 assert.deepEqual(pick(r.retrieval,['right','of']),{right:8,of:9});
 assert.equal(r.retrieval.right,r.baseline.retrieval.n);
 assert.deepEqual(r.retrieval.wrong.map((w)=>w.q),['The angles of a triangle are x, 2x and 3x. Find x.']);
 assert.equal(r.verdicts.C,'pass');
 const none=await runBench({replay:{picks:Object.fromEntries(corpus.queries.map((q)=>[q.q,'none']))}});
 assert.deepEqual(pick(none.retrieval,['right','of']),{right:2,of:9});
 assert.equal(none.verdicts.C,'fail');
 // a real library lesson that is not acceptable for the query counts as wrong
 const off=await runBench({replay:{picks:{'Solve for x: 3x - 7 = 11':'jWpiMu5LNdg'}}});
 assert.equal(off.retrieval.right,7);
 assert.deepEqual(off.retrieval.wrong.find((w)=>w.q==='Solve for x: 3x - 7 = 11'),{q:'Solve for x: 3x - 7 = 11',picked:'jWpiMu5LNdg',accept:['bAerID24QJ0']});
});

test('case 6: --json is one object: read, hints, retrieval, baseline, verdicts, providers - all replay',()=>{
 const out=cli('--json');
 assert.equal(out.status,0,out.stderr);
 const r=JSON.parse(out.stdout);
 assert.deepEqual(Object.keys(r).sort(),['baseline','hints','providers','read','retrieval','verdicts']);
 assert.deepEqual(pick(r.baseline.read.exact,['n','of']),{n:10,of:10});
 assert.deepEqual(pick(r.baseline.read.ring,['n','of']),{n:16,of:16});
 assert.deepEqual(pick(r.baseline.hints.leaked,['n','of']),{n:0,of:12});
 assert.deepEqual(pick(r.baseline.retrieval,['n','of']),{n:8,of:9});
 assert.deepEqual(r.verdicts,{A:'pass',B:'pass',C:'pass'});
 assert(Object.keys(r.providers).length>=2);
 for(const [engine,name] of Object.entries(r.providers))assert.equal(name,'replay',engine);
});

test('case 7: nearestItem is the phone\'s tap rule, and the phone calls it from lib/desk/select',()=>{
 const {nearestItem}=require('./lab-bench.cjs').desk().select;
 const items=[{cy:245},{cy:366},{cy:486}];
 assert.equal(nearestItem(items,300),0);
 assert.equal(nearestItem(items,430),2);
 const phone=fs.readFileSync(path.join(REPO,'desk/src/app/phone/page.tsx'),'utf8');
 assert.match(phone,/import \{ nearestItem \} from "@\/lib\/desk\/select";/);
 assert.match(phone,/nearestItem\(page\.items, y\)/);
 assert.doesNotMatch(phone,/Math\.abs\(it\.cy - y\)/,'one selection rule, not two');
});

test('case 8 GUARD: a replay run keeps to an OS-temp data dir, writes nothing under desk/data, calls no network',async()=>{
 const data=path.join(REPO,'desk/data');
 const stamp=(p)=>{try{return fs.statSync(p).mtimeMs;}catch{return null;}};
 const before=[stamp(data),stamp(path.join(data,'embeddings.json'))];
 const fetch0=global.fetch;let calls=0;
 global.fetch=async()=>{calls++;throw new Error('the bench made a network call');};
 try{
  const r=await runBench({replay:true});
  assert.equal(r.dataDir.startsWith(fs.realpathSync(os.tmpdir()))||r.dataDir.startsWith(os.tmpdir()),true,r.dataDir);
  assert.equal(process.env.DESK_DATA_DIR,r.dataDir);
  assert.deepEqual(r.verdicts,{A:'pass',B:'pass',C:'pass'});
 }finally{global.fetch=fetch0;}
 assert.equal(calls,0);
 assert.deepEqual([stamp(data),stamp(path.join(data,'embeddings.json'))],before);
});

test('case 9 GUARD: the phone\'s tap selects exactly as before - nearestItem equals the old inline loop everywhere',()=>{
 const {nearestItem}=require('./lab-bench.cjs').desk().select;
 // phone/page.tsx:124 before the move, verbatim
 const old=(page,y)=>{let best=0;page.items.forEach((it,i)=>{if(Math.abs(it.cy-y)<Math.abs(page.items[best].cy-y))best=i;});return best;};
 const lists=[...Object.values(corpus.pages).map((p)=>p.items),[{cy:100},{cy:200}],[{cy:200},{cy:100},{cy:150}],[{cy:50}],[]];
 for(const items of lists)for(let y=-50;y<=1900;y+=7)assert.equal(nearestItem(items,y),old({items},y),`y=${y} over ${items.length} items`);
 // a tie keeps the first item, as the loop's strict < did
 assert.equal(nearestItem([{cy:100},{cy:200}],150),0);
});
