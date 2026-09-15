/** Math Buddy's offline rules. Run with npm test in desk/ (directly: node tools/maths-rules-test.cjs). No model is called; a disposable data directory, never desk/data. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,mock}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/maths-rules',String(Date.now()));
const {verify,evaluate}=require(path.join(root,'src/lib/desk/verify.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts')),eye=require(path.join(root,'src/lib/engines/vision.ts'));
let answer,seen=[];engine.text=(req)=>{seen.push(req);return answer(req);};
let looked;eye.vision=(req)=>looked(req);
const {makeItems}=require(path.join(root,'src/lib/desk/items.ts'));
const {markSet}=require(path.join(root,'src/lib/desk/mark.ts'));
const {hint}=require(path.join(root,'src/lib/desk/hint.ts'));
const {explain}=require(path.join(root,'src/lib/desk/explain.ts'));
const {slip}=require(path.join(root,'src/lib/rules/maths.ts'));
const {getLearner,recordAttempt}=require(path.join(root,'src/lib/session/learners.ts'));
const {SYLLABUS,SYSTEM_START,topic,nextTopic,expectedIndex}=require(path.join(root,'src/lib/library/syllabus.ts'));
const {LESSONS}=require(path.join(root,'src/lib/library/lessons.data.ts'));
const storeFile=path.join(root,'src/lib/session/store.ts');
let store=require(storeFile);
after(()=>clearInterval(globalThis.__desk.ticker));
const reply=(json)=>async()=>({json,provider:'test',ms:1});

test('verify accepts a value that satisfies the equation and rejects one that does not',()=>{
 assert(verify('2x+3=11','4'));assert(!verify('2x+3=11','5'));
 assert(verify('x+5=2','-3'));assert(verify('2x=7','7/2'));assert(!verify('2x=7','3'));
 assert(verify('3x=1','1/3'));assert(!verify('3x=1','0.33'));
 assert(verify('7=2x-3','5'));assert(verify('4(x-2)=2x+6','7'));
});
test('verify reads implicit multiplication, powers and the characters a camera produces',()=>{
 assert(verify('3(x-1)=6','3'));assert(verify('(x+1)(x-2)=0','2'));assert(verify('(x+1)(x-2)=0','-1'));
 assert(verify('x²=9','-3'));assert(verify('x^2=9','3'));assert(verify('2x^2=18','3'));assert(verify('-x^2=-9','3'));
 assert(verify('2x − 3 = 5','4'));assert(verify('3×x=12','4'));assert(verify('x÷2=4','8'));assert(verify('2[x+1]=8','3'));
 assert.equal(evaluate('2^3^2',0),512);assert.equal(evaluate('.5x',4),2);assert.equal(evaluate('2(3)',0),6);
});
test('verify never throws on input it cannot read and never says yes to it',()=>{
 for(const [eq,v] of [['2x+3','4'],['x=1=1','1'],['2x+=11','4'],['2(x+3=11','4'],['2x+3=11',''],['2x+3=11','x = 4'],['2x+3=11','four'],['1/x=1','0'],['y=4','4'],[undefined,'4'],['x=4',null]])assert.equal(verify(eq,v),false,`${eq} with ${v}`);
 for(const e of ['','  ','2+','()','.','1/0','x$'])assert.equal(evaluate(e,1),null,e);
});
test('a generated item whose stated answer is wrong never reaches the practice set',async()=>{
 answer=reply({items:[{question:'2x+3=11',answer:'4'},{question:'x-5=2',answer:'3'},{question:'3x = 18',answer:'x = 6'},{question:'2x+3 = 11',answer:'4'},{question:'x/2=4',answer:''},{question:'x+1=10',answer:'9'}]});
 const r=await makeItems('linear-one-step','maths-items',3);
 assert.deepEqual(r.items,[{n:1,question:'2x+3=11'},{n:2,question:'3x = 18'},{n:3,question:'x+1=10'}],'the stated answer does its job at the gate and goes no further');
 assert.equal(r.tries,1);
});

const sheet={topic:'linear-one-step',marked:false,items:['2x+3=11','x-5=2','3x=18','x+1=10','5x=35','x/2=4'].map((question,ix)=>({n:ix+1,question}))};
const marks=[
 {n:1,studentAnswer:'4',studentWorking:'2x=8',verdict:'right',solution:'4',slip:'sign-lost-moving'},
 {n:2,studentAnswer:'x = -3',studentWorking:'x=2-5',verdict:'wrong',solution:'7',slip:'sign-lost-moving'},
 {n:3,studentAnswer:'5',studentWorking:'',verdict:'wrong',solution:'6',slip:'bracket-first-term-only'},
 {n:4,studentAnswer:'9',studentWorking:'',verdict:'right',solution:'8',slip:'unclear'},
 {n:5,studentAnswer:'6',studentWorking:'',verdict:'right',solution:'7',slip:'unclear'},
];
test('marking believes the substitution, and says nothing when the marker and the substitution disagree',async()=>{
 looked=reply({items:marks});
 const r=await markSet('img',sheet,'maths-mark');
 assert.deepEqual(r.items.map(i=>i.verdict),['right','wrong','wrong','unsure','unsure','unsure']);assert.equal(r.unsure,3);
 assert.equal(r.items[0].said,'Number 1 is right.');assert.equal(r.items[0].slip,undefined);
 assert.equal(r.items[1].studentAnswer,'-3');assert.equal(r.items[1].slip,'sign-lost-moving');assert.equal(r.items[1].said,slip('sign-lost-moving').says);
 assert.equal(r.items[2].slip,undefined,'a slip from another topic is dropped');assert.match(r.items[2].said,/How did you get there\?/);
 for(const i of r.items.slice(3)){assert.equal(i.slip,undefined);assert.match(i.said,/How did you get there\?/);}
});
test('no marked line carries a value, and only settled items reach the learner record',async()=>{
 looked=reply({items:marks});
 const r=await markSet('img',sheet,'maths-record');
 for(const i of r.items){const numbers=(i.said.match(/-?\d+(\/\d+)?/g)??[]).filter(v=>v!==String(i.n));assert.deepEqual(numbers,[],`item ${i.n} said: ${i.said}`);}
 const me=getLearner('maths-record'),rec=me.skills['linear-one-step'];
 assert.equal(rec.seen,3);assert.equal(rec.right,1);assert.deepEqual(rec.slips,['sign-lost-moving']);
 assert.equal(me.history.at(-1).detail,'1 of 6 right');
 looked=reply({items:'not json'});const blank=await markSet('img',sheet,'maths-blank');
 assert.equal(blank.unsure,6);assert.equal(getLearner('maths-blank').skills['linear-one-step'],undefined);
});
test('a wrong attempt moves the estimate but never un-secures a secured skill',()=>{
 let rec;for(let k=0;k<3;k++)rec=recordAttempt('maths-secure','linear-two-step',true);assert.equal(rec.secure,false,'three attempts are not enough');
 for(let k=0;k<3;k++)rec=recordAttempt('maths-secure','linear-two-step',true);assert.equal(rec.secure,true);
 const before=rec.estimate;rec=recordAttempt('maths-secure','linear-two-step',false,'arithmetic-slip');
 assert(rec.estimate<before);assert.equal(rec.secure,true);assert.deepEqual(rec.slips,['arithmetic-slip']);
 for(let k=0;k<5;k++)recordAttempt('maths-secure','linear-two-step',false);
 assert.equal(getLearner('maths-secure').skills['linear-two-step'].secure,true);
});
test('hints withhold the answer and the second hint must go one step further',async()=>{
 seen=[];answer=reply({hint:'Look at what is added to 2x.',what_to_try_next:'Undo it on both sides.'});
 const h1=await hint('maths','2x+3=11',{});
 assert.equal(h1.hint,'Look at what is added to 2x.');assert.equal(h1.next,'Undo it on both sides.');
 await hint('maths','2x+3=11',{previous:h1.hint,askedQ:'where do I start?'});
 const [first,second]=seen;
 for(const r of seen)assert.match(r.system,/never state the final answer, never write the completed solution/);
 assert.match(first.prompt,/Give the FIRST hint/);assert.doesNotMatch(first.prompt,/ONE STEP FURTHER/);
 assert.match(second.prompt,/«Look at what is added to 2x\.»/);assert.match(second.prompt,/ONE STEP FURTHER/);assert.match(second.prompt,/still stop short of the answer/);
 assert.match(second.prompt,/The student asked: "where do I start\?"/);
});
test('the reply to an explanation withholds the verdict and keeps only this topic\'s slips',async()=>{
 seen=[];answer=reply({reply:'  Look again at the line where the 5 moved.  ',slip:'sign-lost-moving'});
 const kept=await explain('x-5=2','I took five away','linear-one-step','maths-explain');
 assert.equal(kept.reply,'Look again at the line where the 5 moved.');assert.equal(kept.slip,'sign-lost-moving');
 assert.match(seen[0].system,/never state the final answer, never give the completed line, never say whether they are right or wrong/);
 for(const s of ['bracket-first-term-only','unclear','made-up'])(answer=reply({reply:'Check that step.',slip:s}),assert.equal((await explain('x-5=2','','linear-one-step','maths-explain')).slip,undefined,s));
});

// ---- the session goes to every screen, so no practice answer may ride in it ----
/** Every key anywhere in a value, however deep. */
const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];
const stated=[{question:'2x+3=11',answer:'4'},{question:'x-5=2',answer:'7'},{question:'3x=18',answer:'6'},{question:'x+1=10',answer:'9'},{question:'5x=35',answer:'7'},{question:'x/2=4',answer:'8'}];
test('a practice set reaches the screens with no answer in the session, the stream or the saved desk',async()=>{
 const practiceRoute=require(path.join(root,'src/app/api/practice/route.ts')),sessionRoute=require(path.join(root,'src/app/api/session/route.ts')),streamRoute=require(path.join(root,'src/app/api/session/stream/route.ts'));
 store.dispatch({type:'reset'});answer=reply({items:stated});
 const made=await practiceRoute.POST(new Request('http://desk/api/practice',{method:'POST',body:JSON.stringify({topic:'linear-one-step'})}));
 assert.equal(made.status,200);assert.deepEqual(Object.keys(await made.json()).sort(),['items','ms','provider','tries']);
 const got=await (await sessionRoute.GET()).json();
 assert.equal(got.practice.items.length,6,'the set did land');
 // the stream's keep-alive ping is a real interval; a mocked one lets the suite end the moment the reader lets go
 mock.timers.enable({apis:['setInterval']});
 const reader=(await streamRoute.GET()).body.getReader(),first=new TextDecoder().decode((await reader.read()).value);await reader.cancel();
 mock.timers.reset();
 const streamed=JSON.parse(first.replace(/^data: /,''));
 const saved=JSON.parse(fs.readFileSync(path.join(process.env.DESK_DATA_DIR,'session.json'),'utf8'));
 for(const [where,payload] of [['GET /api/session',got],['the session stream',streamed],['session.json',saved]]){
  assert.deepEqual(payload.practice.items.map(i=>i.question),stated.map(c=>c.question),where);
  assert(!keysIn(payload.practice).includes('answer'),`${where} carries an answer field`);
 }
});
test('POST /api/session refuses practice.set and practice.marked from a client, and the session is untouched',async()=>{
 const sessionRoute=require(path.join(root,'src/app/api/session/route.ts'));
 store.dispatch({type:'reset'});store.dispatch({type:'practice.set',practice:sheet});
 const before=JSON.stringify(store.getSession().practice);
 const forged=[
  {type:'practice.set',practice:{topic:'linear-one-step',marked:false,items:[{n:1,question:'x=1'}]}},
  {type:'practice.marked',items:sheet.items.map(i=>({...i,verdict:'right',said:`Number ${i.n} is right.`}))},
 ];
 for(const e of forged){
  const r=await sessionRoute.POST(new Request('http://desk/api/session',{method:'POST',body:JSON.stringify(e)}));
  assert.equal(r.status,403,e.type);assert.match((await r.json()).error,/api\/(practice|mark)/,e.type);
  assert.equal(JSON.stringify(store.getSession().practice),before,`${e.type} changed the session`);
 }
 const ok=await sessionRoute.POST(new Request('http://desk/api/session',{method:'POST',body:JSON.stringify({type:'practice.clear'})}));
 assert.equal(ok.status,200,'a client event the screens do send still goes through');assert.equal(store.getSession().practice,null);
});
test('the session stream releases its 15 s ping when the client disconnects, by cancel or by abort',async()=>{
 const streamRoute=require(path.join(root,'src/app/api/session/stream/route.ts'));
 const realSet=globalThis.setInterval,realClear=globalThis.clearInterval,live=new Set();
 globalThis.setInterval=(fn,ms,...a)=>{const h=realSet(fn,ms,...a);if(ms===15000)live.add(h);return h;};
 globalThis.clearInterval=(h)=>{live.delete(h);return realClear(h);};
 try{
  const reader=(await streamRoute.GET()).body.getReader();await reader.read();
  assert.equal(live.size,1,'the stream starts one keep-alive ping');
  await reader.cancel();
  assert.equal(live.size,0,'a cancelled reader leaves no ping running');
  const aborted=new AbortController();
  const r2=(await streamRoute.GET(new Request('http://desk/api/session/stream',{signal:aborted.signal}))).body.getReader();await r2.read();
  assert.equal(live.size,1);
  aborted.abort();
  assert.equal(live.size,0,'an aborted request leaves no ping running');
 }finally{for(const h of live)realClear(h);globalThis.setInterval=realSet;globalThis.clearInterval=realClear;}
});
test('marking grades on the server from the question alone, and the marked set carries no answer either',async()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'practice.set',practice:sheet});
 looked=reply({items:marks});
 const {items}=await markSet('img',store.getSession().practice,'maths-server-marks');
 assert.deepEqual(items.map(i=>i.verdict),['right','wrong','wrong','unsure','unsure','unsure'],'the verdicts come from substitution, with no stored answer to lean on');
 store.dispatch({type:'practice.marked',items});
 const keys=keysIn(store.getSession().practice);
 assert(!keys.includes('answer'));assert(!keys.includes('solution'),'the marker\'s own solution stays on the server');
});
test('an answer arriving on an event, or from a desk saved before this change, is stripped before any screen sees it',()=>{
 store.dispatch({type:'reset'});
 store.dispatch({type:'practice.set',practice:{topic:'linear-one-step',marked:false,items:stated.map((c,ix)=>({n:ix+1,...c}))}});
 assert(!keysIn(store.getSession()).includes('answer'),'practice.set');
 store.dispatch({type:'practice.marked',items:stated.map((c,ix)=>({n:ix+1,...c,verdict:'right',said:`Number ${ix+1} is right.`}))});
 assert(!keysIn(store.getSession()).includes('answer'),'practice.marked');
 assert.equal(store.getSession().practice.items[0].said,'Number 1 is right.','what a screen may see is kept');
 // a session.json written while items still carried answers, loaded by a fresh store
 const legacy={...store.getSession(),practice:{topic:'linear-one-step',marked:false,items:stated.map((c,ix)=>({n:ix+1,...c}))}};
 fs.writeFileSync(path.join(process.env.DESK_DATA_DIR,'session.json'),JSON.stringify(legacy));
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];store=require(storeFile);
 assert.deepEqual(store.getSession().practice.items.map(i=>i.question),stated.map(c=>c.question),'the saved set is still there');
 assert(!keysIn(store.getSession()).includes('answer'),'loaded from session.json');
});

// ---- the topic spine every maths screen and the practice set read from ----
test('the syllabus is a path: unique ids, prereqs that point back along it, lessons that exist',()=>{
 const ids=SYLLABUS.map(t=>t.id);
 assert.deepEqual(ids,['linear-one-step','linear-two-step','linear-both-sides']);assert.equal(new Set(ids).size,ids.length);
 const lessons=new Set(LESSONS.map(l=>l.id));
 SYLLABUS.forEach((t,ix)=>{
  for(const p of t.prereq)assert(ids.indexOf(p)>-1&&ids.indexOf(p)<ix,`${t.id} needs ${p}, which must come earlier`);
  if(t.lessonId)assert(lessons.has(t.lessonId),`${t.id} names lesson ${t.lessonId}`);
  for(const k of ['us','uk','cz','de']){assert(Number.isInteger(t.year[k]),`${t.id} ${k}`);if(ix)assert(t.year[k]>=SYLLABUS[ix-1].year[k],`${t.id} is met no earlier than the topic before it in ${k}`);}
 });
 assert.deepEqual(Object.keys(SYSTEM_START).sort(),['cz','de','uk','us']);
});
test('topic finds by exact id and says undefined for anything else',()=>{
 assert.equal(topic('linear-two-step'),SYLLABUS[1]);assert.equal(topic('linear-two-step').name,'Two-step equations');
 for(const id of ['','unknown','Linear-One-Step',' linear-one-step','linear',undefined,null])assert.equal(topic(id),undefined,String(id));
});
test('nextTopic walks the path in order, ignores ids it does not know, and runs out when all is secure',()=>{
 const next=(secure)=>nextTopic(secure)?.id;
 assert.equal(next([]),'linear-one-step','a learner with nothing secure starts at the start');
 assert.equal(next(['linear-one-step']),'linear-two-step');
 assert.equal(next(['linear-one-step','linear-two-step']),'linear-both-sides');
 assert.equal(next(['linear-two-step','linear-one-step']),'linear-both-sides','the order the ids are listed in does not matter');
 assert.equal(next(['linear-one-step','linear-two-step','linear-both-sides']),undefined);
 assert.equal(next(['unknown','','linear-two-step-x']),'linear-one-step','unknown ids unlock nothing');
 assert.equal(next(['linear-two-step']),'linear-one-step','a gap earlier on the path is filled first');
 assert.equal(next(['linear-both-sides']),'linear-one-step');
 assert.equal(next(['linear-one-step','linear-both-sides']),'linear-two-step','a topic secured out of order is skipped, not repeated');
 assert.equal(next(['linear-one-step','linear-one-step']),'linear-two-step','a repeated id counts once');
});
test('expectedIndex reads age against each system\'s own year: -1 before the path, never past its end',()=>{
 // the first age at which each system has a topic behind the learner, and the year before it
 for(const [sys,first] of [['us',11],['uk',11],['cz',11],['de',10]]){
  assert.equal(expectedIndex(sys,first-1),-1,`${sys} age ${first-1}`);assert.equal(expectedIndex(sys,first),1,`${sys} age ${first}`);
 }
 assert.equal(expectedIndex('uk',12),2);assert.equal(expectedIndex('uk',13),3);assert.equal(expectedIndex('de',11),2);assert.equal(expectedIndex('de',12),3);
 assert.equal(expectedIndex('us',13),3);assert.equal(expectedIndex('cz',12),2);
 for(const sys of ['us','uk','cz','de'])for(const age of [0,5,SYSTEM_START[sys]])assert.equal(expectedIndex(sys,age),-1,`${sys} age ${age}`);
 for(const sys of ['us','uk','cz','de'])for(const age of [16,40,120])assert.equal(expectedIndex(sys,age),SYLLABUS.length,`${sys} age ${age}`);
 assert.notEqual(expectedIndex('uk',4),0,'nothing behind them is -1, never 0');
});
