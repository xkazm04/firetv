/** Math Buddy's offline rules. Run with npm test in desk/ (directly: node tools/maths-rules-test.cjs). No model is called; a disposable data directory, never desk/data. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,mock}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'desk-maths-rules-'));
const {verify,evaluate}=require(path.join(root,'src/lib/desk/verify.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts')),eye=require(path.join(root,'src/lib/engines/vision.ts'));
let answer,seen=[];engine.text=(req)=>{seen.push(req);return answer(req);};
let looked;eye.vision=(req)=>looked(req);
const {makeItems}=require(path.join(root,'src/lib/desk/items.ts'));
const {markSet,EMPTY_MARK}=require(path.join(root,'src/lib/desk/mark.ts'));
const {hint}=require(path.join(root,'src/lib/desk/hint.ts'));
const {explain}=require(path.join(root,'src/lib/desk/explain.ts'));
const {slip}=require(path.join(root,'src/lib/rules/maths.ts'));
const {getLearner,recordAttempt,saveLearner,saveEnglish,addHistory}=require(path.join(root,'src/lib/session/learners.ts'));
const {SYLLABUS,SYSTEM_START,topic,nextTopic,expectedIndex}=require(path.join(root,'src/lib/library/syllabus.ts'));
const {LESSONS}=require(path.join(root,'src/lib/library/lessons.data.ts'));
/** The school path's length, derived (the one pin per path is in tools/maths-paths-test.cjs). */
const N_SCHOOL=require(path.join(root,'src/lib/library/paths.ts')).PATHS.school.topics.length;
const storeFile=path.join(root,'src/lib/session/store.ts');
let store=require(storeFile);
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
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
 {n:5,studentAnswer:'six?',studentWorking:'',verdict:'right',solution:'7',slip:'unclear'},
];
test('marking believes the substitution, and asks when it cannot substitute: a wrong model solution, no readable answer, no mark',async()=>{
 looked=reply({items:marks});
 const r=await markSet('img',sheet,'maths-mark');
 assert.deepEqual(r.items.map(i=>i.verdict),['right','wrong','wrong','unsure','unsure','unsure']);assert.equal(r.unsure,3);
 assert.equal(r.items[0].said,'Number 1 is right.');assert.equal(r.items[0].slip,undefined);
 assert.equal(r.items[1].studentAnswer,'-3');assert.equal(r.items[1].slip,'sign-lost-moving');assert.equal(r.items[1].said,slip('sign-lost-moving').says);
 assert.equal(r.items[2].slip,undefined,'a slip from another topic is dropped');assert.match(r.items[2].said,/How did you get there\?/);
 for(const i of r.items.slice(3)){assert.equal(i.slip,undefined);assert.match(i.said,/How did you get there\?|has no answer yet\./);}
});
// S50 (T8): when the model can solve the item and the answer substitutes cleanly, the substitution decides - the model's verdict is overruled
const walkSheet={topic:'linear-two-step',marked:false,items:['14 = 2x + 6','−2x + 3 = −1','2x+3=11','5x-4=21'].map((question,ix)=>({n:ix+1,question}))};
test('T8: a model verdict the substitution contradicts is overruled, both ways; the slip still comes only from the vocabulary',async()=>{
 looked=reply({items:[
  {n:1,studentAnswer:'x = 4',studentWorking:'8 = 2x\nx = 4',verdict:'wrong',solution:'4',slip:'arithmetic-slip'},
  {n:2,studentAnswer:'x = −2',studentWorking:'−2x = −4\nx = −2',verdict:'right',solution:'2',slip:'sign-lost-moving'},
  {n:3,studentAnswer:'5',studentWorking:'',verdict:'right',solution:'4',slip:'bracket-first-term-only'},
  {n:4,studentAnswer:'5',studentWorking:'',verdict:'right',solution:'5',slip:'unclear'},
 ]});
 const r=await markSet('img',walkSheet,'maths-t8');
 assert.deepEqual(r.items.map(i=>i.verdict),['right','wrong','wrong','right'],'model says wrong, substitution right -> right; model says right, substitution wrong -> wrong');
 assert.equal(r.unsure,0,'the walk\'s items 5 and 6 are no longer "not sure"');
 assert.equal(r.items[0].slip,undefined,'a right item takes no slip, whatever the model named');assert.equal(r.items[0].said,'Number 1 is right.');
 assert.equal(r.items[1].slip,'sign-lost-moving');assert.equal(r.items[1].said,slip('sign-lost-moving').says);
 assert.equal(r.items[2].slip,undefined,'a slip from another topic is dropped');assert.match(r.items[2].said,/How did you get there\?/);
 const rec=getLearner('maths-t8').skills['linear-two-step'];assert.equal(rec.seen,4);assert.equal(rec.right,2);
});
test('T8: the desk still asks when the answer does not substitute or the model cannot solve the item',async()=>{
 looked=reply({items:[
  {n:1,studentAnswer:'about four',studentWorking:'',verdict:'right',solution:'4',slip:'unclear'},
  {n:2,studentAnswer:'',studentWorking:'−2x = −4',verdict:'wrong',solution:'2',slip:'sign-lost-moving'},
  {n:3,studentAnswer:'4',studentWorking:'',verdict:'right',solution:'5',slip:'unclear'},
  {n:4,studentAnswer:'3',studentWorking:'',verdict:'wrong',solution:'',slip:'arithmetic-slip'},
 ]});
 const r=await markSet('img',walkSheet,'maths-t8-ask');
 assert.deepEqual(r.items.map(i=>i.verdict),['unsure','unsure','unsure','unsure'],'unparseable answer, no answer, a model solution that fails verify, no model solution');
 assert.equal(r.unsure,4);assert.equal(getLearner('maths-t8-ask').skills['linear-two-step'],undefined,'nothing unsure reaches the record');
 for(const i of r.items){assert.equal(i.slip,undefined);assert.match(i.said,/How did you get there\?|has no answer yet\./);}
});
test('no marked line carries a value, and only settled items reach the learner record',async()=>{
 looked=reply({items:marks});
 const r=await markSet('img',sheet,'maths-record');
 for(const i of r.items){const numbers=(i.said.match(/-?\d+(\/\d+)?/g)??[]).filter(v=>v!==String(i.n));assert.deepEqual(numbers,[],`item ${i.n} said: ${i.said}`);}
 const me=getLearner('maths-record'),rec=me.skills['linear-one-step'];
 assert.equal(rec.seen,3);assert.equal(rec.right,1);assert.deepEqual(rec.slips,['sign-lost-moving']);
 assert.equal(me.history.at(-1).detail,'1 of 6 right, 3 not sure','the three the desk could not decide are on the line');
 looked=reply({items:'not json'});
 await assert.rejects(()=>markSet('img',sheet,'maths-blank'),{message:EMPTY_MARK});
 const blank=getLearner('maths-blank');
 assert.equal(blank.skills['linear-one-step'],undefined);assert.equal(blank.history.length,0,'no history entry');assert.equal(blank.digest.length,0,'no digest entry');
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
 assert.equal(seen.length,2,'a clean hint is one prompt per stage: no re-ask');const [first,second]=seen;
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
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});answer=reply({items:stated});
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
test('marking grades on the server from the question alone, and the marked set carries no answer either',async()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});store.dispatch({type:'practice.set',practice:sheet});
 looked=reply({items:marks});
 const {items}=await markSet('img',store.getSession().practice,'maths-server-marks');
 assert.deepEqual(items.map(i=>i.verdict),['right','wrong','wrong','unsure','unsure','unsure'],'the verdicts come from substitution, with no stored answer to lean on');
 store.dispatch({type:'practice.marked',items});
 const keys=keysIn(store.getSession().practice);
 assert(!keys.includes('answer'));assert(!keys.includes('solution'),'the marker\'s own solution stays on the server');
});
test('an answer arriving on an event, or from a desk saved before this change, is stripped before any screen sees it',()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
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
 // W5b: 'Add and subtract fractions' is met before linear equations, so it comes first (years from memory, a teacher checks).
 // W7 batch 1: three more fractions units, ordered so that no system's year goes down along the path: equivalent
 // fractions, a fraction of an amount, add and subtract, multiply and divide, then the three linear-equation topics
 // W7 batch 2: the "Decimals and percent" strand after one-step equations, the one place every system's years allow
 // W7 batch 3: "Ratio and rates" and "Geometry and data" after the percent units and before two-step equations, where every
 // system's year is fixed (US 7, UK 8, CZ 7, DE 6): fifteen topics
 // v2 M2b: Pythagoras' theorem and the probability of an event after the equations with brackets: seventeen topics
 assert.deepEqual(ids,['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div','linear-one-step','dec-arith','dec-convert','pct-of-amount','pct-change','ratio-share','unit-rate','area','mean-range','linear-two-step','linear-both-sides','pythagoras','probability']);assert.equal(new Set(ids).size,ids.length);
 for(const f of ['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div'])assert.equal(topic(f).lessonId,undefined,`no fractions lesson in the library: ${f} names none`);
 for(const f of ['dec-arith','dec-convert','pct-of-amount','pct-change'])assert.equal(topic(f).lessonId,undefined,`no decimals or percent lesson in the library: ${f} names none`);
 for(const f of ['ratio-share','unit-rate','area','mean-range'])assert.equal(topic(f).lessonId,undefined,`no ratio, area or statistics lesson in the library: ${f} names none`);
 for(const f of ['pythagoras','probability'])assert.equal(topic(f).lessonId,undefined,`no Pythagoras or probability lesson in the library: ${f} names none`);
 const lessons=new Set(LESSONS.map(l=>l.id));
 SYLLABUS.forEach((t,ix)=>{
  for(const p of t.prereq)assert(ids.indexOf(p)>-1&&ids.indexOf(p)<ix,`${t.id} needs ${p}, which must come earlier`);
  if(t.lessonId)assert(lessons.has(t.lessonId),`${t.id} names lesson ${t.lessonId}`);
  for(const k of ['us','uk','cz','de']){assert(Number.isInteger(t.year[k]),`${t.id} ${k}`);if(ix)assert(t.year[k]>=SYLLABUS[ix-1].year[k],`${t.id} is met no earlier than the topic before it in ${k}`);}
 });
 assert.deepEqual(Object.keys(SYSTEM_START).sort(),['cz','de','uk','us']);
});
test('topic finds by exact id and says undefined for anything else',()=>{
 assert.equal(topic('linear-two-step'),SYLLABUS[13],'W7 batch 3: the percent units, then ratio and rates and geometry and data, stand before it');assert.equal(topic('linear-two-step').name,'Two-step equations');
 assert.equal(topic('frac-add-sub'),SYLLABUS[2]);assert.equal(topic('frac-add-sub').name,'Add and subtract fractions');
 for(const id of ['','unknown','Linear-One-Step',' linear-one-step','linear',undefined,null])assert.equal(topic(id),undefined,String(id));
});
test('nextTopic walks the path in order, ignores ids it does not know, and runs out when all is secure',()=>{
 const next=(secure)=>nextTopic(secure)?.id;
 // W5b: fractions come first, so a list without them is a gap earlier on the path (nextTopic is the prerequisite walk;
 // the ruler's needle and Topics' first focus use the frontier rule in library/paths.ts instead). W7: four fractions
 // units; add and subtract, and multiply and divide, each need equivalent fractions; a fraction of an amount needs none
 // W7 batch 2: the decimals and percent strand follows one-step equations; decimals arithmetic needs nothing on the path,
 // the conversion needs equivalent fractions, a percent of an amount the conversion, a percent change a percent of an amount
 const [E,O,F,MD]=['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div'],FR=[E,O,F,MD];
 const [DA,DC,PO,PC]=['dec-arith','dec-convert','pct-of-amount','pct-change'],DP=[DA,DC,PO,PC],ONE='linear-one-step';
 // W7 batch 3: ratio and sharing needs equivalent fractions, unit rates ratio and the decimals, area nothing, mean and range the decimals
 const [RS,UR,AR,MR]=['ratio-share','unit-rate','area','mean-range'],B3=[RS,UR,AR,MR];
 assert.equal(next([]),E,'a learner with nothing secure starts at the start');
 assert.equal(next([E]),O);assert.equal(next([E,O]),F);assert.equal(next([E,O,F]),MD);
 assert.equal(next([O]),E,'a fraction of an amount secure alone: equivalent fractions is still the gap');
 assert.equal(next([O,ONE]),E);
 assert.equal(next([...FR]),ONE);
 assert.equal(next([...FR,ONE]),DA,'W7 batch 2: after one-step equations, the decimals');
 assert.equal(next([...FR,ONE,DA]),DC);assert.equal(next([...FR,ONE,DA,DC]),PO);assert.equal(next([...FR,ONE,DA,DC,PO]),PC);
 assert.equal(next([...FR,ONE,PO]),DA,'a percent of an amount secured alone leaves the decimals as the gap');
 assert.equal(next([...FR,ONE,DA,PO]),DC);
 assert.equal(next([...FR,ONE,...DP]),RS,'W7 batch 3: after the percent units, ratio and sharing');
 assert.equal(next([...FR,ONE,...DP,RS]),UR);assert.equal(next([...FR,ONE,...DP,RS,UR]),AR);assert.equal(next([...FR,ONE,...DP,RS,UR,AR]),MR);
 assert.equal(next([...FR,ONE,PO,PC,RS]),DA,'unit rates wait for the decimals unit: the decimals are the gap');
 assert.equal(next([...FR,ONE,...DP,...B3]),'linear-two-step');
 assert.equal(next([...FR,ONE,...DP,...B3,'linear-two-step']),'linear-both-sides');
 assert.equal(next([...FR,...DP,...B3,'linear-two-step',ONE]),'linear-both-sides','the order the ids are listed in does not matter');
 assert.equal(next([...FR,ONE,...DP,...B3,'linear-two-step','linear-both-sides']),'pythagoras','v2 M2b: after the equations, Pythagoras (was: nothing left)');
 assert.equal(next([...FR,ONE,...DP,...B3,'linear-two-step','linear-both-sides','pythagoras']),'probability');
 assert.equal(next([...FR,ONE,...DP,...B3,'linear-two-step','linear-both-sides','pythagoras','probability']),undefined);
 assert.equal(next([...FR,ONE,DA,DC,PO,PC,RS,UR,MR,'linear-two-step','linear-both-sides','pythagoras','probability']),AR,'Pythagoras and probability secured without area: area is the gap earlier on the path');
 assert.equal(next([...FR,ONE,...DP,'linear-two-step','linear-both-sides']),RS,'the batch-3 strands are a gap earlier on the path for a learner who had every other topic');
 assert.equal(next([...FR,ONE,'linear-two-step','linear-both-sides']),DA,'the new strand is a gap earlier on the path for a learner who had every linear topic');
 assert.equal(next(['unknown','','linear-two-step-x']),E,'unknown ids unlock nothing');
 assert.equal(next([...FR,'linear-two-step']),ONE,'a gap earlier on the path is filled first');
 assert.equal(next([ONE]),E,'the new first topic is a gap earlier on the path too');
 assert.equal(next([...FR,'linear-both-sides']),ONE);
 assert.equal(next([...FR,ONE,...DP,...B3,'linear-both-sides']),'linear-two-step','a topic secured out of order is skipped, not repeated');
 assert.equal(next([...FR,ONE,ONE]),DA,'a repeated id counts once');
});
test("expectedIndex reads age against each system's own year: -1 before the path, never past its end",()=>{
 // W7 batch 1: the path's years per system (us/uk/cz/de) are equivalent 4/5/5/5, of an amount 5/5/5/5, add and subtract
 // 5/6/5/5, multiply and divide 6/7/6/5, one-step 6/7/6/5, two-step 7/8/7/6, both sides 8/9/8/7; the school year is
 // age - SYSTEM_START + 1 (us 6, uk 5, cz 6, de 6). So the first topic behind a learner comes at US 9 (Grade 4: one),
 // UK 9 (Year 5: two), CZ 10 (5. ročník: three) and DE 10 (Klasse 5: five - all four fractions units and one-step).
 // W7 batch 2 adds, after one-step, decimals 6/7/6/6, conversion 6/7/7/6, percent of an amount 6/7/7/6 and percent
 // change 7/8/7/6: the first-topic ages stay, and a 12-year-old was past 10 of 11 topics in us, uk and cz, all 11 in de.
 // W7 batch 3 adds ratio and sharing, unit rates, area, and mean and range at 7/8/7/6 each, between percent change and
 // two-step equations: a 12-year-old is now past 14 of 15 topics in us, uk and cz, all 15 in de; an 11-year-old in de
 // is past 14 (Klasse 6 reaches two-step equations)
 // v2 M2b adds Pythagoras at 8/9/8/8 and probability at 8/9/9/8 after both sides (8/9/8/7): a 13-year-old in us and uk is past
 // all 17, a 12-year-old in de past 15 of 17 (Klasse 7 stops at both sides), a 13-year-old in cz past 16 (probability is 9. ročník)
 for(const [sys,first,n] of [['us',9,1],['uk',9,2],['cz',10,3],['de',10,5]]){
  assert.equal(expectedIndex(sys,first-1),-1,`${sys} age ${first-1}`);assert.equal(expectedIndex(sys,first),n,`${sys} age ${first}`);
 }
 assert.equal(expectedIndex('uk',11),8);assert.equal(expectedIndex('uk',12),14);assert.equal(expectedIndex('uk',13),N_SCHOOL);
 assert.equal(expectedIndex('de',11),14);assert.equal(expectedIndex('de',12),15);assert.equal(expectedIndex('de',13),N_SCHOOL);
 assert.equal(expectedIndex('us',11),8);assert.equal(expectedIndex('us',13),N_SCHOOL);assert.equal(expectedIndex('cz',13),16);assert.equal(expectedIndex('cz',14),N_SCHOOL);assert.equal(expectedIndex('cz',12),14);assert.equal(expectedIndex('us',12),14);assert.equal(expectedIndex('cz',11),6);
 for(const sys of ['us','uk','cz','de'])for(const age of [0,5,SYSTEM_START[sys]])assert.equal(expectedIndex(sys,age),-1,`${sys} age ${age}`);
 for(const sys of ['us','uk','cz','de'])for(const age of [16,40,120])assert.equal(expectedIndex(sys,age),SYLLABUS.length,`${sys} age ${age}`);
 assert.notEqual(expectedIndex('uk',4),0,'nothing behind them is -1, never 0');
});

// ---- "How did you get there?" settles the item: the learner's spoken value, substituted on the walk ----
/** A marked walk on the session, as the phone and the TV see it: items 4-6 are unsure (the marker's solution fails, the answer does not read, no mark). */
async function markedWalk(){
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});store.dispatch({type:'practice.set',practice:sheet});
 looked=reply({items:marks});
 const {items}=await markSet('img',store.getSession().practice,store.getSession().learner.id);
 store.dispatch({type:'practice.marked',items});
 return store.getSession().learner.id;
}
const said=(json)=>{answer=reply(json);};
async function explainAt(ix,transcript='I took one away and got nine'){
 const route=require(path.join(root,'src/app/api/explain/route.ts'));
 const r=await route.POST(new Request('http://desk/api/explain',{method:'POST',body:JSON.stringify({transcript,n:ix})}));
 return {status:r.status,body:await r.json()};
}
const record=(id)=>JSON.parse(JSON.stringify(getLearner(id).skills['linear-one-step']??null));
test('case 1: an unsure item whose spoken value substitutes is settled right, and the attempt is recorded once',async()=>{
 const me=await markedWalk(),before=record(me);
 assert.equal(store.getSession().practice.items[3].verdict,'unsure');
 said({reply:'Look at the line where the 1 moved.',value:'9',slip:'unclear'});
 const r=await explainAt(3);
 assert.equal(r.status,200);assert.equal(r.body.settled,'right');
 const it=store.getSession().practice.items[3];
 assert.equal(it.verdict,'right');assert.equal(it.said,'Number 4 is right.');assert.equal(it.slip,undefined);
 const after=record(me);assert.equal(after.seen,before.seen+1);assert.equal(after.right,before.right+1);
 assert.equal(store.getSession().skills['linear-one-step'].seen,after.seen,'the session reads the learner record back');
});
test('case 2: a spoken value that does not substitute settles the item wrong, with the slip from the topic\'s vocabulary',async()=>{
 const me=await markedWalk(),before=record(me);
 said({reply:'Check what happened to the 1.',value:'x = 11',slip:'sign-lost-moving'});
 const r=await explainAt(3,'I moved the one over and got eleven');
 assert.equal(r.status,200);assert.equal(r.body.settled,'wrong');
 const it=store.getSession().practice.items[3];
 assert.equal(it.verdict,'wrong');assert.equal(it.slip,'sign-lost-moving');assert.equal(it.said,slip('sign-lost-moving').says);
 const after=record(me);assert.equal(after.seen,before.seen+1);assert.equal(after.right,before.right);assert(after.slips.includes('sign-lost-moving'));
});
test('case 3: a value the desk cannot read leaves the item unsure and the learner record alone',async()=>{
 const me=await markedWalk(),before=record(me);
 for(const value of ['','about nine']){
  said({reply:'Tell me the number you ended with.',value,slip:'unclear'});
  const r=await explainAt(3);
  assert.equal(r.status,200,value);assert.equal(r.body.settled,undefined,value);
  const it=store.getSession().practice.items[3];
  assert.equal(it.verdict,'unsure',value);assert.equal(it.reply,'Tell me the number you ended with.','the reply still reaches the walk');assert.equal(it.said,'The desk is not sure about number 4. How did you get there?',value);
 }
 assert.deepEqual(record(me),before);
});
test('case 4: a settled item is never settled or recorded again',async()=>{
 const me=await markedWalk(),before=record(me);
 assert.equal(store.getSession().practice.items[1].verdict,'wrong');
 for(let k=0;k<2;k++){
  said({reply:'Look at the line where the 5 moved.',value:'7',slip:'unclear'});
  const r=await explainAt(1,'I added five and got seven');
  assert.equal(r.status,200);assert.equal(r.body.settled,undefined);
  assert.equal(store.getSession().practice.items[1].verdict,'wrong');assert.equal(store.getSession().practice.items[1].reply,'Look at the line where the 5 moved.','reply only');assert.equal(store.getSession().practice.items[1].said,slip('sign-lost-moving').says);
  assert.deepEqual(record(me),before,`call ${k+1}`);
 }
});
test('case 4b: on an item already wrong, a slip the explanation names from the topic\'s vocabulary becomes its slip - verdict, pen and record untouched',async()=>{
 const me=await markedWalk(),before=record(me),was=store.getSession().practice.items[1];
 assert.equal(was.verdict,'wrong');assert.equal(was.slip,'sign-lost-moving');
 for(const s of ['unclear','made-up','bracket-first-term-only']){
  said({reply:'Look at the line where the 5 moved.',value:'-3',slip:s});await explainAt(1,'I took five away');
  const it=store.getSession().practice.items[1];
  assert.equal(it.slip,'sign-lost-moving',`${s} is outside the vocabulary: the title stays`);assert.equal(it.said,was.said,s);
 }
 said({reply:'Re-do the arithmetic on that line.',value:'-3',slip:'arithmetic-slip'});
 const r=await explainAt(1,'I took five away and got minus three');
 assert.equal(r.status,200);assert.equal(r.body.settled,undefined,'a wrong item is not settled again');
 const it=store.getSession().practice.items[1];
 assert.equal(it.verdict,'wrong');assert.equal(it.slip,'arithmetic-slip','the title follows the conversation');
 assert.equal(it.said,slip('arithmetic-slip').says);assert.equal(it.reply,'Re-do the arithmetic on that line.');
 assert.deepEqual(it.slipAt,was.slipAt,'the pen stays where the learner\'s lines put it');
 assert.deepEqual(record(me),before,'no second attempt is recorded');
 // the reducer holds the same line against an event that did not come through the rules
 store.dispatch({type:'practice.settle',n:2,reply:'x',slip:'collect-x-wrong-sign',said:'free text'});
 assert.equal(store.getSession().practice.items[1].slip,'arithmetic-slip');
 store.dispatch({type:'practice.settle',n:1,reply:'x',slip:'arithmetic-slip'});
 assert.equal(store.getSession().practice.items[0].slip,undefined,'a right item takes no slip');
});
test('case 5: a reply that gives the answer away is stopped in code, and the item\'s own line stands in',async()=>{
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 store.dispatch({type:'practice.set',practice:{topic:'linear-one-step',marked:false,items:[{n:1,question:'2x+3=11'},{n:2,question:'x-5=2'}]}});
 const ask='The desk is not sure about number 2. How did you get there?';
 store.dispatch({type:'practice.marked',items:[{n:1,question:'2x+3=11',verdict:'right',said:'Number 1 is right.'},{n:2,question:'x-5=2',verdict:'unsure',said:ask}]});
 for(const leak of ['You should get 7.','so x = 7','Nearly: x = 7/1 is where it lands.','It comes out at seven.','Work out 12-7.']){
  said({reply:leak,value:'',slip:'unclear'});
  const r=await explainAt(1,'I did something');
  assert.equal(r.status,200);
  const it=store.getSession().practice.items[1];
  for(const [where,text] of [['the route',r.body.reply],['the session',it.reply],['the status line',store.getSession().status]]){
   const numbers=(String(text).match(/-?\d+(\.\d+)?(\/\d+)?/g)??[]).filter(v=>verify('x-5=2',v));
   assert.deepEqual(numbers,[],`${where} carries the answer after «${leak}»: ${text}`);
  }
  assert.equal(r.body.reply,ask);assert.equal(it.reply,ask);
 }
 said({reply:'Look at the line where the 5 moved.',value:'',slip:'unclear'});
 assert.equal((await explainAt(1)).body.reply,'Look at the line where the 5 moved.','a number from the question is not the answer');
});
test('case 6: the desk\'s reply rides on the walk item, for the TV\'s caption slot',async()=>{
 await markedWalk();
 said({reply:'Look at the line where the 1 moved.',value:'about nine',slip:'unclear'});
 await explainAt(4,'I am not sure');
 assert.equal(store.getSession().practice.items[4].reply,'Look at the line where the 1 moved.');
 assert.equal(store.getSession().practice.items[3].reply,undefined,'only the item explained');
});
test('GUARD case 7: after settling, no line on any item carries a value, and the session carries no answer',async()=>{
 await markedWalk();
 for(const [ix,value] of [[3,'9'],[4,'x = 6'],[5,'about eight'],[1,'7']]){said({reply:'Look again at the step where x was left alone.',value,slip:'arithmetic-slip'});await explainAt(ix);}
 const p=store.getSession().practice;
 for(const i of p.items){
  const numbers=((i.said??'').match(/-?\d+(\/\d+)?/g)??[]).filter(v=>v!==String(i.n));assert.deepEqual(numbers,[],`item ${i.n} said: ${i.said}`);
  const leaked=((i.reply??'').replace(/^The desk heard \S.*?\. /,'').match(/-?\d+(\.\d+)?(\/\d+)?/g)??[]).filter(v=>verify(i.question,v));assert.deepEqual(leaked,[],`item ${i.n} reply: ${i.reply}`);
 }
 const keys=keysIn(p);assert(!keys.includes('answer'));assert(!keys.includes('solution'));
});

// ---- the set's "k of n right" line in the learner's history: counted from the item verdicts, restated when an item settles ----
const lineNow=(me)=>getLearner(me).history.filter(h=>h.kind==='practice').at(-1);
test('case 8: rules/maths counts the line from the verdicts alone - an unsure or wrong item is not right',()=>{
 const {rightLine}=require(path.join(root,'src/lib/rules/maths.ts'));
 assert.equal(typeof rightLine,'function','one rule for marking and settle');
 assert.equal(rightLine([{verdict:'right'},{verdict:'wrong'},{verdict:'unsure'},{},{verdict:'right'}]),'2 of 5 right, 2 not sure','an unsure item, or one with no verdict, is not sure - never right, never a slip');
 assert.equal(rightLine([{verdict:'right'},{verdict:'wrong'},{verdict:'right'}]),'2 of 3 right','with nothing unsure the line is the old form exactly');
 assert.equal(rightLine([]),'0 of 0 right');
});
test('GUARD case 9: marking alone writes one line, "1 of 6 right, 3 not sure"',async()=>{
 const me=store.getSession().learner.id,before=getLearner(me).history.length;
 await markedWalk();
 assert.equal(getLearner(me).history.length,before+1);assert.equal(lineNow(me).detail,'1 of 6 right, 3 not sure');
 assert.equal(store.getSession().history.at(-1).detail,'1 of 6 right, 3 not sure');
});
test('case 10: an item that settles right restates the line k+1 of n, in the learner record and the session, and adds no entry',async()=>{
 const me=await markedWalk(),n=getLearner(me).history.length;
 said({reply:'Look at the line where the 1 moved.',value:'9',slip:'unclear'});
 assert.equal((await explainAt(3)).body.settled,'right');
 assert.equal(lineNow(me).detail,'2 of 6 right, 2 not sure','k+1 of n after an item settles right, and one fewer not sure');
 assert.equal(store.getSession().history.at(-1).detail,'2 of 6 right, 2 not sure','the session reads the restated line back');
 assert.equal(getLearner(me).history.length,n,'a settle restates the marking line, it adds none');
});
test('case 11: an item settled twice is counted once',async()=>{
 const me=await markedWalk();
 for(let k=0;k<2;k++){said({reply:'Look at the line where the 1 moved.',value:'9',slip:'unclear'});await explainAt(3);}
 assert.equal(lineNow(me).detail,'2 of 6 right, 2 not sure');
});
test('case 12: a wrong settle leaves k where it stands',async()=>{
 const me=await markedWalk(),n=getLearner(me).history.length;
 said({reply:'Check the step where x was left alone.',value:'11',slip:'arithmetic-slip'});
 assert.equal((await explainAt(4,'I got eleven')).body.settled,'wrong');
 assert.equal(lineNow(me).detail,'1 of 6 right, 2 not sure','a wrong settle moves no tick, only a not sure');
 said({reply:'Look at the line where the 1 moved.',value:'9',slip:'unclear'});await explainAt(3);
 said({reply:'Check the step where x was left alone.',value:'11',slip:'arithmetic-slip'});
 assert.equal((await explainAt(5,'I got eleven')).body.settled,'wrong');
 assert.equal(lineNow(me).detail,'2 of 6 right','after a right settle, a wrong one leaves 2 - and nothing is left unsure');
 assert.equal(getLearner(me).history.length,n);
 const p=store.getSession().practice.items;assert.equal(lineNow(me).detail,`${p.filter(i=>i.verdict==='right').length} of ${p.length} right`,'the line is what the verdicts say');
});

// ---- the pen: where the working broke, decided in rules/maths from the learner's own lines and a root found in code ----
const M=()=>require(path.join(root,'src/lib/rules/maths.ts'));
test('pen case 1: rootOf finds the linear root in code, and claims none for anything that is not linear',()=>{
 const {rootOf}=M();assert.equal(typeof rootOf,'function');
 assert.equal(rootOf('3x - 7 = 11'),6);assert.equal(rootOf('x/2 = 4'),8);assert.equal(rootOf('2x = 7'),3.5);
 assert.equal(rootOf('x^2 = 9'),null,'three points not collinear: not linear');
 assert.equal(rootOf('3 = 3'),null,'no x to find');assert.equal(rootOf('2x + = 1'),null,'not arithmetic');
});
test('pen case 2: the first line the root stops satisfying, and a sign mark when one flipped term repairs it',()=>{
 assert.deepEqual(M().locate('3x - 7 = 11',['3x = 11 - 7','3x = 4','x = 4/3']),{line:0,span:'- 7',kind:'sign'});
});
test('pen case 3: a broken line no single sign flip repairs is marked as a line, with no kind and no span',()=>{
 assert.deepEqual(M().locate('2x + 6 = 10',['2x + 6 = 10','x + 6 = 5','x = -1']),{line:1});
});
test('pen case 4: a line that is not arithmetic is skipped, never blamed; no failing line, no lines or no linear root claims nothing',()=>{
 const {locate}=M(),q='3x - 7 = 11';
 assert.deepEqual(locate(q,['take 7 from both sides','3x = 4','x = 4/3']),{line:1});
 assert.equal(locate(q,['3x = 18','x = 6']),undefined);assert.equal(locate(q,[]),undefined);
 assert.equal(locate('x^2 = 9',['x = 4']),undefined);
});
test('pen case 5: withholding - no sign is ringed on a line where x stands alone, so the answer\'s own sign is never marked',()=>{
 assert.deepEqual(M().locate('3x - 7 = 11',['3x = 18','x = -6']),{line:1});
});
test('pen case 6: marking puts slipAt on a wrong item from its own lines and it reaches the session; verdicts unchanged, no answer anywhere',async()=>{
 const pen={...sheet,items:sheet.items.map(i=>i.n===2?{...i,question:'3x - 7 = 11'}:i)};
 const penMarks=marks.map(m=>m.n===2?{n:2,studentAnswer:'4/3',studentWorking:'3x = 11 - 7\n3x = 4\nx = 4/3',verdict:'wrong',solution:'6',slip:'sign-lost-moving'}:m);
 let asked;looked=(req)=>{asked=req;return reply({items:penMarks})();};
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});store.dispatch({type:'practice.set',practice:pen});
 const {items}=await markSet('img',store.getSession().practice,'maths-pen-mark');
 assert.deepEqual(items.map(i=>i.verdict),['right','wrong','wrong','unsure','unsure','unsure'],'GUARD: the verdicts are the substitution\'s, as before');
 assert.deepEqual(items[1].slipAt,{line:0,span:'- 7',kind:'sign'});
 for(const i of items)if(i.verdict!=='wrong')assert.equal(i.slipAt,undefined,`item ${i.n} is ${i.verdict}`);
 assert.match(asked.prompt,/one step per line/,'the lines the pen is drawn on are asked for');
 store.dispatch({type:'practice.marked',items});
 assert.deepEqual(store.getSession().practice.items[1].slipAt,{line:0,span:'- 7',kind:'sign'},'kept through practice.marked');
 const keys=keysIn(store.getSession());assert(!keys.includes('answer'));assert(!keys.includes('solution'));
});
test('pen case 7: an unsure item settled wrong by an explanation gets its slipAt from the same rule; settled right, none',async()=>{
 const walk=async()=>{
  store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});store.dispatch({type:'practice.set',practice:sheet});
  looked=reply({items:marks.map(m=>m.n===4?{...m,studentWorking:'x = 10 + 1'}:m)});
  const {items}=await markSet('img',store.getSession().practice,store.getSession().learner.id);
  store.dispatch({type:'practice.marked',items});assert.equal(store.getSession().practice.items[3].verdict,'unsure');
 };
 await walk();said({reply:'Check what happened to the 1.',value:'11',slip:'sign-lost-moving'});
 assert.equal((await explainAt(3,'I moved the one over and got eleven')).body.settled,'wrong');
 let it=store.getSession().practice.items[3];assert.equal(it.verdict,'wrong');assert.deepEqual(it.slipAt,{line:0});
 await walk();said({reply:'Look at the line where the 1 moved.',value:'9',slip:'unclear'});
 assert.equal((await explainAt(3)).body.settled,'right');
 it=store.getSession().practice.items[3];assert.equal(it.verdict,'right');assert.equal(it.slipAt,undefined);
});

// ---- practice-gate-rejects-identities: an item whose verdict cannot depend on the answer never reaches the set ----
test('gate case 1: an identity or an equation with no x is rejected at the gate, whatever answer it states; a real item and x^2=4 are kept',async()=>{
 answer=reply({items:[{question:'3+4=7',answer:'5'},{question:'2(x+1)=2x+2',answer:'-100'},{question:'2x+3=3',answer:'5x'},{question:'2x+3=11',answer:'4'},{question:'x^2=4',answer:'2'}]});
 const r=await makeItems('linear-one-step','maths-gate',2);
 assert.deepEqual(r.items.map(i=>i.question),['2x+3=11','x^2=4'],'only items whose verdict depends on the answer');
 assert.equal(r.tries,1);
});
test('gate case 2: an answer that itself contains x is never read as a number; well-formed items verify exactly as before',()=>{
 const {substitute}=require(path.join(root,'src/lib/desk/verify.ts'));
 for(const v of ['5x','x','2x-1','X'])assert.equal(substitute('2x+3=3',v),null,`${v} is not a number`);
 assert.equal(verify('2x+3=3','5x'),false);assert.equal(verify('2x+3=3','0'),true);
 assert.equal(substitute('2x+3=11','4'),true);assert.equal(substitute('2x+3=11','5'),false);assert.equal(substitute('2x=7','7/2'),true);
});
test('gate case 3: marking asks about a degenerate item and an x-answer - never "right"; a real item still marks right',async()=>{
 const odd={topic:'linear-one-step',marked:false,items:['3+4=7','2(x+1)=2x+2','2x+3=3','2x+1=1','2x+3=11'].map((question,ix)=>({n:ix+1,question}))};
 looked=reply({items:[
  {n:1,studentAnswer:'5',studentWorking:'',verdict:'right',solution:'5',slip:'unclear'},
  {n:2,studentAnswer:'-100',studentWorking:'',verdict:'right',solution:'1',slip:'unclear'},
  {n:3,studentAnswer:'x = x',studentWorking:'2x = 0',verdict:'right',solution:'0',slip:'unclear'},
  {n:4,studentAnswer:'5x',studentWorking:'',verdict:'right',solution:'0',slip:'unclear'},
  {n:5,studentAnswer:'4',studentWorking:'2x=8',verdict:'right',solution:'4',slip:'unclear'},
 ]});
 const r=await markSet('img',odd,'maths-gate-mark');
 assert.deepEqual(r.items.map(i=>i.verdict),['unsure','unsure','unsure','unsure','right']);assert.equal(r.unsure,4);
 for(const i of r.items.slice(0,4))assert.equal(i.said,require(path.join(root,'src/lib/rules/maths.ts')).NOT_SURE(i.n),`item ${i.n} is not sure`);
 const rec=getLearner('maths-gate-mark').skills['linear-one-step'];assert.equal(rec.seen,1,'only the real item reaches the record');assert.equal(rec.right,1);
});

// ---- settle-x-answer-is-unsure: a spoken value in x settles nothing, by the same rule marking uses (substitute) ----
test('settle case 1: a spoken value containing x leaves the item unsure (null); a clean number settles right or wrong as before',()=>{
 const {settle,RIGHT}=M(),it={n:4,question:'x+1=10',studentWorking:'',studentAnswer:''};
 for(const v of ['5x','x','x = 5x','2x-1','X'])assert.equal(settle(it,v,'unclear','linear-one-step'),null,`${v} is not a value of x`);
 // x=0 is the root here: a value in x read at 0 would settle it wrongly right
 const zero={n:1,question:'2x+3=3',studentWorking:'',studentAnswer:''};
 for(const v of ['5x','x'])assert.equal(settle(zero,v,'unclear','linear-one-step'),null,`${v} on 2x+3=3`);
 const right=settle(it,'9','unclear','linear-one-step');assert.equal(right.verdict,'right');assert.equal(right.said,RIGHT(4));
 assert.equal(settle(it,'x = 9','unclear','linear-one-step').verdict,'right');
 const wrong=settle(it,'11','sign-lost-moving','linear-one-step');assert.equal(wrong.verdict,'wrong');assert.equal(wrong.slip,'sign-lost-moving');
 assert.equal(settle(zero,'0','unclear','linear-one-step').verdict,'right');
 for(const v of ['','about nine',undefined])assert.equal(settle(it,v,'unclear','linear-one-step'),null,String(v));
});
test('settle case 2: through the explain route, a spoken "5x" leaves the unsure item unsure and the record alone',async()=>{
 const me=await markedWalk(),before=record(me);
 said({reply:'Tell me the number you ended with.',value:'5x',slip:'arithmetic-slip'});
 const r=await explainAt(3,'I got five x');
 assert.equal(r.status,200);assert.equal(r.body.settled,undefined);
 assert.equal(store.getSession().practice.items[3].verdict,'unsure');assert.deepEqual(record(me),before);
});

// ---- corrupt-learner-file-never-overwritten: a learners.json the desk cannot read is never written over ----
const booked=()=>path.join(process.env.DESK_DATA_DIR,'learners.json');
/** Run `f` with console.error captured; the lines it logged. */
const quietly=(f)=>{const lines=[],was=console.error;console.error=(...a)=>{lines.push(a.map(String).join(' '));};try{f();}finally{console.error=was;}return lines;};
test('learners case 1: with garbage in learners.json, recording an attempt leaves the file byte-identical and the save throws',()=>{
 recordAttempt('maths-book-keep','linear-one-step',true);
 const good=fs.readFileSync(booked());
 try{
  for(const garbage of ['{"ema":{"skills":{"linear-one-step":{"seen":9','not json at all','[1,2,3]','null','"a string"']){
   fs.writeFileSync(booked(),garbage);
   quietly(()=>{for(const save of [()=>recordAttempt('maths-book-corrupt','linear-one-step',true),()=>saveLearner({...getLearner('maths-book-corrupt'),memory:['x']}),()=>addHistory('maths-book-corrupt',{at:1,kind:'practice',label:'t',detail:'d'})])assert.throws(save,/learners\.json could not be read/,'a save over an unreadable book throws, as saveEnglish does');});
   assert.equal(fs.readFileSync(booked(),'utf8'),garbage,`learners.json was written over: ${garbage}`);
   assert.throws(()=>quietly(()=>saveEnglish('maths-book-corrupt',getLearner('maths-book-corrupt').english)),undefined,'an English commit reports it, as it reports a disk failure');
   assert.equal(fs.readFileSync(booked(),'utf8'),garbage);
  }
 }finally{fs.writeFileSync(booked(),good);}
 assert.equal(getLearner('maths-book-keep').skills['linear-one-step'].seen,1,'the book is all there once the file reads again');
});
test('learners case 2: a valid file still round-trips; a missing or empty file still starts empty',()=>{
 const good=fs.readFileSync(booked());
 try{
  const before=getLearner('maths-book-keep').skills['linear-one-step'].seen;
  recordAttempt('maths-book-keep','linear-one-step',false,'arithmetic-slip');
  const rec=getLearner('maths-book-keep').skills['linear-one-step'];assert.equal(rec.seen,before+1);assert.deepEqual(rec.slips,['arithmetic-slip']);
  for(const start of [()=>fs.rmSync(booked()),()=>fs.writeFileSync(booked(),''),()=>fs.writeFileSync(booked(),' \n')]){
   start();
   assert.deepEqual(getLearner('maths-book-new').skills,{},'nothing on disk: an empty book');
   const logged=quietly(()=>recordAttempt('maths-book-new','linear-one-step',true));
   assert.deepEqual(logged,[],'an empty start is not a failure');
   assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(booked(),'utf8'))),['maths-book-new'],'the first attempt starts the book');
  }
 }finally{fs.writeFileSync(booked(),good);}
});
test('learners case 3: a write that fails throws, and is logged where the book is unreadable',()=>{
 const good=fs.readFileSync(booked());
 fs.chmodSync(booked(),0o444);
 let logged;
 try{logged=quietly(()=>assert.throws(()=>recordAttempt('maths-book-keep','linear-one-step',true),/learners\.json could not be written/));}
 finally{fs.chmodSync(booked(),0o666);fs.writeFileSync(booked(),good);}
 assert.deepEqual(fs.readFileSync(booked()),good,'the book is as it was');
});

test('answer line per course: workingLines decides x = from the item alone - a spec item keeps its bare answer, a school item is unchanged byte for byte',()=>{
 const {workingLines,settle}=require(path.join(root,'src/lib/rules/maths.ts'));
 // every calc1 practice shape's bare answer, as a reader returns it: never turned into a value of x
 const CALC=[[{shape:'evaluate',f:'x^2 + 3x',at:'2'},'10'],[{shape:'limit',f:'sin(3x)/x',at:'0'},'3'],[{shape:'derivative',f:'3x^2 + 2x'},'6x + 2'],
  [{shape:'derivative-at',f:'x^3',at:'2'},'12'],[{shape:'critical-point',f:'x^2 - 4x + 1',on:['0','5']},'2'],[{shape:'derivative',f:'3x^2 + 2x'},'-6x - 2']];
 for(const [spec,a] of CALC){const got=workingLines({spec,studentWorking:'',studentAnswer:a});assert.deepEqual(got,[a],`${spec.shape} ${a}`);assert.ok(!got.some(l=>/^x\s*=/.test(l)&&!/^x\s*=/.test(a)),`${spec.shape}: ${got}`);}
 // the school path: the outputs today's rule gives, pinned
 const SCHOOL=[['','4',['x = 4']],['','-3',['x = -3']],['','7/2',['x = 7/2']],['','x = 5',['x = 5']],['','5x',['5x']],['',' ',[]],['','',[]],
  ['2x = 8\nx = 4','4',['2x = 8','x = 4']],['2x = 8; x = 4','',['2x = 8','x = 4']],['2x = 8 -> x = 4','4',['2x = 8','x = 4']]];
 for(const [w,a,want] of SCHOOL)assert.deepEqual(workingLines({studentWorking:w,studentAnswer:a}),want,`${JSON.stringify(w)} / ${JSON.stringify(a)}`);
 // settle on a school item still locates from the x = line it always read
 assert.deepEqual(settle({n:1,question:'x + 3 = 7',studentWorking:'',studentAnswer:'5'},'5','arithmetic-slip','linear-one-step').slipAt,{line:0});
});

// ------------------------------------------------------------------ MB-B2: the reader strips an instruction, reads · : and the decimal comma
test('MB-B2 reader: tasks that read as nothing now read as a kind and a spec, and the answer lines on them leak',async()=>{
 const K=require(path.join(root,'src/lib/rules/kinds.ts')),M=require(path.join(root,'src/lib/rules/maths.ts'));
 const Sc=require(path.join(root,'src/lib/rules/school.ts')),Ca=require(path.join(root,'src/lib/rules/calc.ts'));
 const leakAny=(q,line,sys)=>{const r=K.readQuestion(q,sys);return M.leaks(q,line,sys)||(r.calc?Ca.leaksCalc(r.calc,line):false)||(r.school?Sc.leaksSchool(r.school,line):false);};
 // [task, system, kind, a line that must leak]
 const rows=[
  ['Řeš rovnici 3(x - 2) = 2x + 5',undefined,'linear','x = 11.'],
  ['Řeš rovnici 3(x - 2) = 2x + 5',undefined,'linear','Takže x = 11.'],
  ['Vypočítej: 3/4 + 1/6 =',undefined,'school','The answer is 11/12.'],
  ['2/3 · 9/4 =',undefined,'school','The answer is 3/2.'],
  ['0,3 × 0,4','cz','school','The answer is 0,12.'],
  ['Solve 3(x - 2) = 2x + 5',undefined,'linear','x = 11.'],
  ['Vypočtěte lim x→0 sin(3x)/x',undefined,'calc','The limit is 3.'],
  ['Derivujte: y = sin(x^2)',undefined,'calc','The derivative is 2x cos(x^2).'],
 ];
 for(const [q,sys,kind,line] of rows){
  const r=K.readQuestion(q,sys);
  assert.equal(r.kind,kind,q);
  if(kind==='linear')assert.ok(M.equationOf(q,sys),`${q}: its equation is read`);else assert.ok(r.calc||r.school,`${q}: a spec is read`);
  assert.equal(leakAny(q,line,sys),true,`${q} | ${line}`);
 }
 // with no system the decimal comma reads as it did: not at all
 assert.equal(K.readQuestion('0,3 × 0,4').kind,'linear');
 assert.equal(K.readQuestion('0,3 × 0,4','uk').kind,'linear');
 // a task read as written is read as it was
 for(const q of ['Find lim_(x->0) sin(3x)/x','Work out 3/4 + 1/6','Solve for x:  3x − 7 = 11'])assert.equal(K.readQuestion(q).kind===K.readQuestion(q,'cz').kind,true,q);
 // the hint takes the system: on a Czech sheet the equation leaks, and the stance is the linear sheet's
 const was=engine.text;engine.text=async()=>({json:{hint:'Takže x = 11.',what_to_try_next:'Write x = 11.'},provider:'test',ms:1});
 let h;try{h=await hint('maths','Řeš rovnici 3(x - 2) = 2x + 5',{system:'cz'});}finally{engine.text=was;}
 assert.ok(!/11/.test(h.hint+h.next),`the leaking hint is withheld: ${h.hint}`);
});

// ------------------------------------------------------------------ MB-B2: the stricter fallback for an item no reader reads
test('MB-B2 fallback: on an item no reader reads, a line stating a solution is refused; a plain method line passes; a read item is untouched',()=>{
 const M=require(path.join(root,'src/lib/rules/maths.ts'));
 const word='Sara has some sweets. She gives away 7 and has 12 left. How many did she start with?';
 assert.equal(M.equationOf(word),null);
 for(const l of ['Takže x = 11.','The answer is 42.','Výsledek je 19.','x = 5','So the result is 3/4.'])assert.equal(M.leaks(word,l),true,l);
 for(const l of ['Draw a diagram first.','Write down what you know and what you need to find.','Let x be the number she started with.','Add 7 and 12 to see what the start was.','Think about 3x = 180 as a balance.'])assert.equal(M.leaks(word,l),false,l);
 // an item a reader reads keeps its own rule: the fallback never reaches it
 assert.equal(M.unreadLeaks('Solve for x:  3x − 7 = 11','Takže x = 11.'),false);
 // a decimal comma and a number word are read as the leak rule reads them
 assert.equal(M.leaks(word,'Odpověď je 19,5.'),true);
 assert.equal(M.leaks(word,'The answer is forty two.'),true);
});
