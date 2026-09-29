/**
 * Calculus practice the desk PRINTS ITSELF (desk/src/lib/desk/items.ts, the calc1 branch): the model is asked only
 * for specs - a shape from the topic's own list and its parameters, in the plain notation - never for a question in
 * words and never for its result; code validates each spec (rules/calc wellFormed), prints the question (rules/calc
 * question), orders the set easy to hard and puts it on the desk with the spec, so marking can judge later with no
 * stored truth. The school path is unchanged.
 * Run with npm test in desk/ (directly: node tools/calc-practice-test.cjs). No model is called - the text engine is
 * stubbed at the provider registry - and the data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`desk-calc-practice-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const {view}=require(src('lib/session/pairing.ts'));
const {makeItems}=require(src('lib/desk/items.ts'));
const C=require(src('lib/rules/calc.ts'));
const T=require(src('maths/typeset.ts'));
const {CALC1_SPINE}=require(src('lib/library/calculus1.spine.ts'));
const practice=()=>require(src('app/api/practice/route.ts'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

/** The text stub: each call takes the next answer (the last repeats); every request is kept. */
let seen=[];
function stub(...answers){seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);const a=answers[Math.min(seen.length-1,answers.length-1)];if(a instanceof Error)throw a;return {raw:JSON.stringify(a)};}});}
const post=(body)=>practice().POST(new Request('http://desk/api/practice',{method:'POST',body:JSON.stringify(body)}));
const LEARNER='calc-gen';
function seat(){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Calc',type:'other',modules:['maths'],mathPath:'calc1'}});store.dispatch({type:'profile.save'});
}
/** Every key anywhere in a value, however deep. */
const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];
/** Every string anywhere in a value, however deep. */
const stringsIn=(o)=>typeof o==='string'?[o]:o&&typeof o==='object'?Object.values(o).flatMap(stringsIn):[];

// ------------------------------------------------------------------ the typeset check (as tools/calc-rules-test.cjs)
const UNI={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ˣ':'x','ⁿ':'n','₀':'0','₁':'1','₂':'2','₃':'3','ₙ':'n','½':'12','¼':'14','¾':'34','⅓':'13'};
const PLAIN_SIGNS=/(?<![a-zA-Z])(sqrt|cbrt|int|sum|prod|infinity|inf|pi|alpha|beta|gamma|delta|epsilon|theta|lambda|rho|sigma|tau|phi|omega|Gamma|Delta|Theta|Lambda|Sigma|Phi|Omega)(?![a-zA-Z])/g;
const expected=(s)=>[...s].map(c=>UNI[c]??c).join('').replace(PLAIN_SIGNS,' ').replace(/[^0-9a-zA-Z]/g,'');
const alnum=(s)=>s.replace(/[^0-9a-zA-Z]/g,'');
function subsequence(needle,hay){let i=0;for(const c of hay)if(c===needle[i])i++;return i===needle.length;}
function leaves(nodes){const out=[];T.walk(nodes,n=>{if('v' in n)out.push(n);});return out;}
/** Why a plain line does not typeset cleanly: '' when every letter and digit survives and no command text reaches the TV. */
function typesetFault(line){
 let nodes;try{nodes=T.parseMath(line);T.flatten(nodes);}catch(e){return `throws: ${e.message}`;}
 if(!subsequence(expected(line),alnum(T.flatten(nodes))))return `dropped: ${T.flatten(nodes)}`;
 const ls=leaves(nodes);
 if(ls.some(n=>String(n.v).includes('\\'))||ls.some(n=>n.t==='text'&&/^(d|t)?frac$|^sqrt$/.test(n.v)))return 'raw-tex';
 return '';
}

// ------------------------------------------------------------------ one topic per shape: six good specs and three bad
// A spec as the model is asked to write it: points as strings in the plain notation, a difficulty 1-5.
const S=(shape,f,params={},difficulty=3)=>({shape,f,...params,difficulty});
const FIX=[
 {topic:'calc1-functions',good:[S('evaluate','x^2 + 1',{at:'3'},2),S('evaluate','2x - 5',{at:'4'},1),S('evaluate','x^3 - x',{at:'2'},3),S('evaluate','(x + 1)/(x - 1)',{at:'3'},4),S('evaluate','sqrt(x + 5)',{at:'4'},3),S('evaluate','3x^2 - 2x + 1',{at:'-1'},2)],
  bad:[S('evaluate','x^^2',{at:'1'},1),S('derivative','x^2',{},1),S('evaluate','x^2 + 1',{at:'3'},1)]},
 {topic:'calc1-limit-idea',good:[S('limit','sin(3x)/x',{at:'0',side:''},4),S('limit','(x^2 - 1)/(x - 1)',{at:'1',side:''},1),S('limit','(x^2 - 4)/(x - 2)',{at:'2',side:''},2),S('limit','1/x^2',{at:'0',side:''},3),S('limit','(3x^2 + 1)/(x^2 + 2)',{at:'inf',side:''},3),S('limit','(sqrt(x + 4) - 2)/x',{at:'0',side:''},5)],
  bad:[S('limit','1/x',{at:'0',side:''},1),S('limit','x^2',{at:'banana',side:''},1),S('limit','sin(3x)/x',{at:'0',side:''},1)]},
 {topic:'calc1-rules',good:[S('derivative','x^3 + 2x',{},1),S('derivative','3x^4 - x^2',{},2),S('derivative','(x^2 + 1)(x - 3)',{},3),S('derivative','(2x + 1)/(x - 1)',{},4),S('derivative','5x^2 - 3x + 7',{},1),S('derivative','x/(x^2 + 1)',{},5)],
  bad:[S('derivative','x - x + 3',{},1),S('antiderivative','x',{},1),S('derivative','e^x',{},1)]},
 {topic:'calc1-related-rates',good:[S('derivative-at','x^3 + x^2',{at:'2'},3),S('derivative-at','sqrt(x)',{at:'4'},3),S('derivative-at','x^2 - 3x',{at:'5'},1),S('derivative-at','1/x',{at:'2'},2),S('derivative-at','x^4',{at:'1'},1),S('derivative-at','(x + 1)^3',{at:'1'},4)],
  bad:[S('derivative-at','sqrt(x)',{at:'0'},1),S('derivative-at','x^2',{},1),S('derivative-at','x^4',{at:'1'},1)]},
 {topic:'calc1-extrema',good:[S('critical-point','x^2 - 4x + 1',{on:['0','5'],kind:'min'},1),S('critical-point','x^2 + 6x',{on:['-5','0'],kind:'min'},2),S('critical-point','x^3 - 3x',{on:['0','3'],kind:'min'},3),S('extremum','x^3 - 12x',{on:['-3','0'],kind:'max'},4),S('extremum','x^2 - 2x + 5',{on:['-1','3'],kind:'min'},2),S('extremum','-x^2 + 4x',{on:['0','5'],kind:'max'},3)],
  bad:[S('extremum','x^2',{on:['1','3'],kind:'min'},1),S('critical-point','x^3 - 3x',{on:['-3','3'],kind:'min'},1),S('limit','x^2',{at:'1'},1)]},
 {topic:'calc1-optimisation',good:[S('extremum','x(10 - x)',{on:['0','10'],kind:'max'},2),S('extremum','x^2 - 6x + 13',{on:['0','5'],kind:'min'},1),S('extremum','-2x^2 + 8x',{on:['0','4'],kind:'max'},1),S('extremum','x + 4/x',{on:['1','5'],kind:'min'},4),S('extremum','12x - x^3',{on:['0','3'],kind:'max'},3),S('extremum','x^3 - 3x^2',{on:['1','4'],kind:'min'},5)],
  bad:[S('extremum','2x + 1',{on:['0','3'],kind:'max'},1),S('extremum','x^2',{on:['0'],kind:'min'},1),S('extremum','x(10 - x)',{on:['0','10'],kind:'max'},1)]},
 {topic:'calc1-newton',good:[S('newton-step','x^2 - 2',{x0:'1',steps:1},1),S('newton-step','x^2 - 3',{x0:'2',steps:1},2),S('newton-step','x^3 - 2',{x0:'1',steps:1},3),S('newton-step','x^2 - 7',{x0:'3',steps:1},2),S('newton-step','x^3 - x - 1',{x0:'1',steps:1},4),S('newton-step','cos(x) - x',{x0:'1',steps:1},5)],
  bad:[S('newton-step','x^2 - 2',{x0:'0',steps:1},1),S('newton-step','x^2 - 2',{x0:'1',steps:9},1),S('newton-step','x^2 - 2',{x0:'1',steps:1},1)]},
 {topic:'calc1-antiderivatives',good:[S('antiderivative','x',{},1),S('antiderivative','3x^2 + 2x',{},2),S('antiderivative','cos(x)',{},2),S('antiderivative','e^(2x)',{},4),S('antiderivative','sin(x) + x^3',{},3),S('antiderivative','4x^3 - 6x',{},3)],
  bad:[S('antiderivative','0x',{},1),S('definite-integral','x',{a:'0',b:'1'},1),S('antiderivative','cos(x)',{},1)]},
 {topic:'calc1-definite-integral',good:[S('definite-integral','x^2',{a:'0',b:'1'},1),S('definite-integral','2x',{a:'0',b:'3'},1),S('definite-integral','x^3',{a:'1',b:'2'},2),S('definite-integral','sin(x)',{a:'0',b:'pi'},4),S('definite-integral','e^x',{a:'0',b:'1'},3),S('definite-integral','3x^2 + 1',{a:'-1',b:'2'},3)],
  bad:[S('definite-integral','x^3',{a:'-1',b:'1'},1),S('definite-integral','x',{a:'foo',b:'1'},1),{...S('definite-integral','2x',{a:'1',b:'4'},1),answer:'15'}]},
];
/** The nine specs as a model might send them: bad ones mixed in among the good. */
const nine=(fx)=>[fx.good[0],fx.bad[0],fx.good[1],fx.good[2],fx.bad[1],fx.good[3],fx.good[4],fx.bad[2],fx.good[5]];
const shapesOf=(topic)=>CALC1_SPINE.find((t)=>t.id===topic).shapes;
/** The expected order: difficulty, then the expression's length. */
const byEase=(specs)=>[...specs].sort((a,b)=>a.difficulty-b.difficulty||a.f.length-b.f.length);
const questionOf=(spec)=>{const {difficulty,...rest}=spec;void difficulty;const q=C.question(rest);return q&&q.plain;};

test('1: for one topic per shape, nine specs (malformed, off-shape, degenerate, duplicate among them) make six well-formed items, easy to hard, each typesetting',async()=>{
 seat();
 assert.deepEqual([...new Set(FIX.flatMap((fx)=>shapesOf(fx.topic)))].sort(),[...C.CALC_SHAPES].sort(),'the fixture covers every shape');
 for(const fx of FIX){
  stub({specs:nine(fx)});
  const made=await makeItems(fx.topic,LEARNER);
  assert.equal(seen.length,1,`${fx.topic}: one call was enough`);
  assert.equal(made.items.length,6,`${fx.topic}: six items`);
  assert.deepEqual(made.items.map((i)=>i.question),byEase(fx.good).map(questionOf),`${fx.topic}: the good six, easy to hard`);
  made.items.forEach((it,ix)=>{
   assert.deepEqual(Object.keys(it).sort(),['n','question','spec'],`${fx.topic} ${ix}`);
   assert.equal(it.n,ix+1);
   assert.ok(C.wellFormed(it.spec).ok,`${fx.topic} ${it.question}`);
   assert.ok(shapesOf(fx.topic).includes(it.spec.shape),`${fx.topic}: ${it.spec.shape} is on the topic's list`);
   assert.equal(it.question,C.question(it.spec).plain,'the question is the one code prints from the spec');
   assert.equal(typesetFault(it.question),'',`${fx.topic} typesets: ${it.question}`);
   assert.equal('difficulty' in it.spec,false,'the difficulty ordered the set and stays behind');
  });
 }
});

test('2: the item carries no truth - no answer key anywhere, and the truth (recomputed with rules/calc) is not in the question',async()=>{
 seat();
 for(const fx of FIX){
  stub({specs:nine(fx)});
  const {items}=await makeItems(fx.topic,LEARNER);
  const keys=keysIn(items);
  for(const k of ['answer','solution','truth','value','zero'])assert.equal(keys.includes(k),false,`${fx.topic}: a ${k} key`);
  for(const it of items){
   assert.equal(C.leaksCalc(it.spec,it.question),false,`${fx.topic}: the question states its own result: ${it.question}`);
   // every number the question prints outside its function is a parameter: none of them is the result the desk works out
   for(const tok of it.question.split(it.spec.f).join(' ').match(/-?\d+(\.\d+)?(\/\d+)?/g)??[])assert.notEqual(C.checkAnswer(it.spec,tok).verdict,'right',`${fx.topic}: ${tok} in "${it.question}" is the result`);
  }
 }
});

test('3: the model is asked only for specs - the topic\'s own shapes by enum, typed parameters, a difficulty, at most n + 3, and no answer field anywhere',async()=>{
 seat();
 const l=learners.getLearner(LEARNER);learners.saveLearner({...l,memory:['Works quickly and skips the last line.'],skills:{...l.skills,'calc1-rules':{topic:'calc1-rules',seen:2,right:1,estimate:0.5,secure:false,lastSeen:1,slips:['forgot-chain']}}});
 for(const fx of FIX){
  stub({specs:nine(fx)});
  await makeItems(fx.topic,LEARNER);
  const req=seen[0];
  assert.equal(req.model,'fast');
  const words=JSON.stringify(req.schema)+req.system+req.prompt;
  assert.doesNotMatch(words,/answer|solution/i,`${fx.topic}: the request names an answer`);
  const list=req.schema.properties.specs;
  assert.equal(list.type,'array');assert.equal(list.maxItems,9,'at most n + 3');
  const item=list.items,props=item.properties;
  assert.deepEqual(props.shape.enum,shapesOf(fx.topic),`${fx.topic}: the shape enum is the topic's own list`);
  assert.equal(props.f.type,'string');assert.equal(props.difficulty.type,'integer');
  for(const [k,p] of Object.entries(props))assert.ok(typeof p.type==='string',`${fx.topic}: ${k} is typed`);
  assert.equal(item.additionalProperties,false);
  // the notation the reader and checker understand, small parameters, varied difficulty, the learner's own memory
  for(const w of [/x\^2/,/sqrt\(x\)/,/e\^\(2x\)/,/sin\(x\)/,/ln\(x\)/,/LaTeX/,/small integers/i,/vary/i])assert.match(req.system+req.prompt,w,`${fx.topic}: ${w}`);
  assert.match(req.prompt,/Works quickly and skips the last line\./);
 }
 stub({specs:nine(FIX[2])});await makeItems('calc1-rules',LEARNER);
 const chain=C.CALC_SLIPS.find((s)=>s.id==='forgot-chain');
 assert.ok(seen[0].prompt.includes(chain.says),'the named slip is in the prompt, as the desk says it');
 assert.doesNotMatch(seen[0].prompt,/forgot-chain/,'never as an id');
});

test('4: a short first round asks again, naming what the learner already has, and the second round fills the set',async()=>{
 seat();
 const fx=FIX[0];
 stub({specs:[...fx.bad,fx.good[0],fx.good[1],fx.good[2],fx.good[3]]},{specs:[fx.good[0],fx.good[4],fx.good[5],fx.bad[0]]});
 const made=await makeItems(fx.topic,LEARNER);
 assert.equal(made.tries,2);assert.equal(seen.length,2);
 assert.equal(seen[1].schema.properties.specs.maxItems,5,'n - have + 3');
 for(const g of fx.good.slice(0,4))assert.ok(seen[1].prompt.includes(questionOf(g)),`round two avoids ${questionOf(g)}`);
 assert.deepEqual(made.items.map((i)=>i.question),byEase(fx.good).map(questionOf));
});

test('5: the route writes a calc1 set onto the desk with its specs, and no view of the session (TV, phone, saved) carries a truth',async()=>{
 seat();
 const fx=FIX[8];
 stub({specs:nine(fx)});
 const r=await post({topic:fx.topic});
 assert.equal(r.status,200);assert.deepEqual(Object.keys(await r.json()).sort(),['items','ms','provider','tries']);
 const s=store.getSession();
 assert.equal(s.practice.topic,fx.topic);assert.equal(s.practice.items.length,6);
 assert.ok(s.practice.items.every((i)=>C.wellFormed(i.spec).ok),'the specs travelled with the set');
 const saved=JSON.parse(fs.readFileSync(path.join(data,'session.json'),'utf8'));
 for(const [where,v] of [['tv',view(s,'tv')],['phone',view(s,'phone')],['session.json',saved]]){
  const keys=keysIn(v);for(const k of ['answer','solution','truth'])assert.equal(keys.includes(k),false,`${where}: a ${k} key`);
  assert.equal(keysIn(v.practice).includes('value'),false,`${where}: a value key on the set`);
  const lines=stringsIn({practice:v.practice,jobs:v.jobs,status:v.status});
  for(const it of s.practice.items)for(const line of lines)assert.equal(C.leaksCalc(it.spec,line),false,`${where}: "${line}" states the result of ${it.question}`);
 }
 // an answer riding in on an event stops at shown(): the spec keeps only what the question prints
 store.dispatch({type:'practice.set',practice:{topic:fx.topic,marked:false,items:[{n:1,question:'Evaluate int_0^3 2x dx.',answer:'9',spec:{shape:'definite-integral',f:'2x',a:0,b:3,answer:'9',value:9,zero:true}}]}});
 const it=store.getSession().practice.items[0];
 assert.deepEqual(it,{n:1,question:'Evaluate int_0^3 2x dx.',spec:{shape:'definite-integral',f:'2x',a:0,b:3}});
});

test('6: all-bad rounds fail with the practice sentence and 502, and the previous set stays',async()=>{
 seat();
 stub({specs:nine(FIX[2])});assert.equal((await post({topic:'calc1-rules'})).status,200);
 const before=JSON.stringify(store.getSession().practice);
 const fx=FIX[5];
 // malformed, off-shape and degenerate only: nothing the desk could print and judge
 const allBad=[fx.bad[0],fx.bad[1],S('derivative','x^2',{},1),{...fx.good[0],answer:'25'},S('extremum','x^2',{on:['1','3'],kind:'min'},1)];
 for(const b of allBad)assert.equal(C.wellFormed(b).ok&&CALC1_SPINE.find((t)=>t.id===fx.topic).shapes.includes(b.shape),false,JSON.stringify(b));
 stub({specs:allBad},{specs:[...allBad].reverse()});
 const r=await post({topic:fx.topic});
 assert.equal(r.status,502);assert.match((await r.json()).error,/^The desk could not write this set\./);
 assert.equal(seen.length,2,'two rounds, then the set fails');
 const s=store.getSession();
 assert.equal(s.jobs.practice.phase,'failed');assert.equal(s.jobs.practice.key,fx.topic);assert.match(s.jobs.practice.error,/^The desk could not write this set\./);
 assert.equal(JSON.stringify(s.practice),before,'no practice.set: the previous set is untouched');
 // an answer the schema check cannot read at all is the same failure, not a crash
 stub({specs:'none'},{nothing:true});
 assert.equal((await post({topic:fx.topic})).status,502);
 assert.equal(JSON.stringify(store.getSession().practice),before);
});

test('7: the route accepts a calc1 id and refuses one on neither path; a school topic still generates through the old path',async()=>{
 seat();
 stub({specs:nine(FIX[0])});
 const bad=await post({topic:'nope'});
 assert.equal(bad.status,400);assert.deepEqual(await bad.json(),{error:'no such topic'});
 assert.equal(seen.length,0,'no engine call');assert.equal(store.getSession().jobs.practice,undefined,'no job was started');
 assert.equal((await post({topic:'calc1-functions'})).status,200,'a calc1 id is a topic');
 const STATED=[{question:'2x+3=11',answer:'4'},{question:'x-5=2',answer:'7'},{question:'3x=18',answer:'6'},{question:'x+1=10',answer:'9'},{question:'5x=35',answer:'7'},{question:'x/2=4',answer:'8'}];
 stub({items:STATED});
 assert.equal((await post({topic:'linear-one-step'})).status,200);
 const req=seen[0];
 assert.deepEqual(req.schema.properties.items.items.required,['question','answer'],'the school path asks as it always did');
 assert.match(req.system,/single equation in x/);
 const s=store.getSession();
 assert.deepEqual(s.practice.items.map((i)=>i.question),STATED.map((c)=>c.question));
 assert.ok(s.practice.items.every((i)=>!('spec' in i)),'a school item has no spec');
});
