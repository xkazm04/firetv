/**
 * Math Buddy: one item kind, one judge. The marker, the explainer and the hint read the same registry (rules/kinds), and
 * a single answer can be judged with no set (judgeItem). Run with npm test in desk/ (directly: node tools/maths-judge-test.cjs).
 * No model is called - the vision and text engines are stubbed at the provider seam (the module export, as
 * maths-rules-test.cjs does); a disposable data directory under the OS temp dir, never desk/data.
 *
 * Cases 1-8 are the card's acceptance (math-buddy-A). Case 6 is a GUARD: green before the change by design.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-maths-judge-'));
const src=(f)=>path.join(root,'src',f);
const engine=require(src('lib/engines/text.ts')),eye=require(src('lib/engines/vision.ts'));
let seenText=[],seenVision=[];
let answerText=()=>{throw new Error('text: no model in this case');};
let looked=()=>{throw new Error('vision: no model in this case');};
engine.text=(req)=>{seenText.push(req);return answerText(req);};
eye.vision=(req)=>{seenVision.push(req);return looked(req);};
const {markSet,markTyped}=require(src('lib/desk/mark.ts'));
const {hint}=require(src('lib/desk/hint.ts'));
const {getLearner}=require(src('lib/session/learners.ts'));
const {withheldLine}=require(src('lib/rules/maths.ts'));
const {voiceOf}=require(src('lib/rules/voice.ts'));
let K=null;try{K=require(src('lib/rules/kinds.ts'));}catch{}
const kinds=()=>{assert.ok(K,'rules/kinds.ts exists');return K;};
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
const reply=(json)=>async()=>({json,provider:'test',ms:1});
const throwing=(what)=>()=>{throw new Error(`${what}: a typed mark must not call a model`);};

// ------------------------------------------------------------------ a mixed sheet: school, Calculus, linear with no spec
const TOPIC='frac-add-sub';
const mixed=()=>({topic:TOPIC,marked:false,items:[
 {n:1,question:'Work out 3/4 + 1/6',spec:{shape:'compute',expr:'3/4 + 1/6'}},
 {n:2,question:'Find the derivative of x^2',spec:{shape:'derivative',f:'x^2'}},
 {n:3,question:'x+3=7'},
]});
const STRINGS=['11/12','3x','4'];
const view=(r)=>r.items.map((i)=>({n:i.n,verdict:i.verdict,slip:i.slip,said:i.said}));
const counts=(id)=>{const s=getLearner(id).skills[TOPIC];return s?{seen:s.seen,right:s.right}:{seen:0,right:0};};

test('1: a photographed sheet of three kinds is judged item by item: right, wrong, right, three attempts on the record',async()=>{
 looked=reply({items:STRINGS.map((a,i)=>({n:i+1,studentAnswer:a,studentWorking:''}))});
 const r=await markSet('img',mixed(),'judge-photo');
 assert.deepEqual(r.items.map((i)=>i.verdict),['right','wrong','right'],'each item by its own kind, not the whole sheet by the school marker');
 assert.equal(r.unsure,0);assert.equal(r.landed,true);
 assert.deepEqual(counts('judge-photo'),{seen:3,right:2});
});

test('2: the same three strings typed are judged as the photo judges them, with no model',async()=>{
 looked=reply({items:STRINGS.map((a,i)=>({n:i+1,studentAnswer:a,studentWorking:''}))});
 const photo=await markSet('img',mixed(),'judge-same-photo');
 looked=throwing('vision');answerText=throwing('text');
 const typed=markTyped(STRINGS,mixed(),'judge-same-typed');
 assert.deepEqual(view(typed),view(photo),'verdict, slip and said agree');
 assert.deepEqual(counts('judge-same-typed'),counts('judge-same-photo'),'the same seen and right per topic on the record');
 assert.deepEqual(counts('judge-same-typed'),{seen:3,right:2});
});

test('3: kindOfSpec, kindOfQuestion and kindOfTopic are the one place the kind is decided',()=>{
 const k=kinds();
 assert.equal(k.kindOfSpec({shape:'compute',expr:'1/2+1/3'}),'school');
 assert.equal(k.kindOfSpec({shape:'derivative',f:'x^2'}),'calc');
 assert.equal(k.kindOfSpec(undefined),'linear');assert.equal(k.kindOfSpec({shape:'nope'}),'linear');
 assert.equal(k.kindOfQuestion('Work out 3/4 - 1/6'),'school');
 assert.equal(k.kindOfQuestion('Find the derivative of x^2'),'calc');
 assert.equal(k.kindOfQuestion('Solve for x: 2x + 3 = 11'),'linear');
 // by topic: the two inline pathOfTopic tests of items.ts
 assert.equal(k.kindOfTopic('frac-add-sub'),'school');assert.equal(k.kindOfTopic('linear-two-step'),'linear');
 assert.equal(k.kindOfTopic('no-such-topic'),'linear');
 const {CALC1_SPINE}=require(src('lib/library/calculus1.spine.ts'));
 assert.equal(k.kindOfTopic(CALC1_SPINE[0].id),'calc');
});

const ask=(q,opts)=>{seenText=[];answerText=reply({hint:'Look at the first term.',what_to_try_next:'Write the question on your paper.'});return hint('maths',q,opts).then((r)=>({r,system:seenText[0].system}));};

test('4: a school-path learner\'s derivative question gets the Calculus stance, not the linear-equations one',async()=>{
 const {system}=await ask('Find the derivative of x^2 + 3x',{path:'school',age:13});
 assert.match(system,/Calculus I/);assert.doesNotMatch(system,/factoring and linear-equations unit/);
 assert.ok(system.includes(voiceOf('maths',13).manner),'the voice stays the learner\'s');
});

test('5: a Calculus-path learner\'s fractions task gets the unit stance, in the teen voice of the path',async()=>{
 const {system}=await ask('Work out 3/4 - 1/6',{path:'calc1'});
 assert.match(system,/Add and subtract fractions/);assert.doesNotMatch(system,/Calculus I/);
 assert.ok(system.includes(voiceOf('maths',undefined).who),'the calc1 learner\'s teen voice');
});

test('6: GUARD - a linear task takes the path\'s stance, and a double leak still gives the withheld line and an empty next',async()=>{
 const {system}=await ask('Solve for x: 2x + 3 = 11',{path:'calc1'});
 assert.match(system,/Calculus I/);
 const school=await ask('Solve for x: 2x + 3 = 11',{path:'school',age:13});
 assert.match(school.system,/factoring and linear-equations unit/);
 seenText=[];answerText=reply({hint:'The answer is x = 4.',what_to_try_next:'Write x = 4.'});
 const r=await hint('maths','Solve for x: 2x + 3 = 11',{path:'calc1'});
 assert.equal(seenText.length,2,'one re-ask');assert.equal(r.hint,withheldLine('Solve for x: 2x + 3 = 11'));assert.equal(r.next,'');
});

test('7: judgeItem judges one answer with no set, no engine and no learner record',()=>{
 const k=kinds();
 looked=throwing('vision');answerText=throwing('text');
 const before=fs.existsSync(path.join(process.env.DESK_DATA_DIR,'learners.json'))?fs.readFileSync(path.join(process.env.DESK_DATA_DIR,'learners.json'),'utf8'):null;
 const ctx={topic:'frac-add-sub',system:'uk'};
 const school={n:1,question:'Work out 3/4 + 1/6',spec:{shape:'compute',expr:'3/4 + 1/6'}};
 assert.equal(k.judgeItem(school,{studentAnswer:'11/12'},ctx).verdict,'right');
 assert.equal(k.judgeItem(school,{studentAnswer:'5/10'},ctx).verdict,'wrong');
 assert.equal(k.judgeItem(school,{studentAnswer:''},ctx),null,'a blank asks');
 const calc={n:2,question:'Find the derivative of x^2',spec:{shape:'derivative',f:'x^2'}};
 assert.equal(k.judgeItem(calc,{studentAnswer:'3x'},{topic:'calc1-derivative'}).verdict,'wrong');
 assert.equal(k.judgeItem(calc,{studentAnswer:'2x'},{topic:'calc1-derivative'}).verdict,'right');
 assert.equal(k.judgeItem({n:3,question:'x+3=7'},{studentAnswer:'4'},{topic:'linear-one-step'}).verdict,'right');
 assert.equal(k.judgeItem({n:3,question:'x+3=7'},{studentAnswer:'x = 5'},{topic:'linear-one-step'}).verdict,'wrong');
 assert.equal(k.judgeItem({n:3,question:'x+3=7'},{studentAnswer:'five'},{topic:'linear-one-step'}),null);
 const after=fs.existsSync(path.join(process.env.DESK_DATA_DIR,'learners.json'))?fs.readFileSync(path.join(process.env.DESK_DATA_DIR,'learners.json'),'utf8'):null;
 assert.equal(after,before,'learners.json untouched');
});

test('8: mark.ts lands from one place, builds no byN map and counts no unsure by hand',()=>{
 const text=fs.readFileSync(src('lib/desk/mark.ts'),'utf8').split('\n').filter((l)=>!/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
 assert.equal((text.match(/\bland\(/g)||[]).length,2,'the definition and one call');
 assert.equal((text.match(/\bbyN\b/g)||[]).length,0);
 assert.equal((text.match(/unsure\+\+/g)||[]).length,0);
});

// ---- M4c: the chain checker places the pen on a wrong Calculus item with working (rules/kinds judgeItem, rules/chain)
test('M4c-1: a planted-slip Calculus item\'s slipAt lands on the line that slipped (kinds.ts judgeItem)',()=>{
 const k=kinds(),item={n:1,question:'Find the derivative of x^2 sin x',spec:{shape:'derivative',f:'x^2 sin x'}},ctx={topic:'calc1-derivative'};
 const s=k.judgeItem(item,{studentAnswer:'2x cos x',studentWorking:"f(x) = x^2 sin x\nf'(x) = 2x cos x"},ctx);
 assert.equal(s.verdict,'wrong');assert.deepEqual(s.slipAt,{line:1});
 const t=k.judgeItem({n:2,question:'Find the derivative of cos(3x) at x = 0',spec:{shape:'derivative-at',f:'cos(3x)',at:0}},{studentAnswer:'3',studentWorking:"f'(x) = 3 sin(3x)\nf'(0) = 0\n= 3"},{topic:'calc1-derivative'});
 assert.equal(t.verdict,'wrong');assert.deepEqual(t.slipAt,{line:0},'the first line that stops holding, not a later one');
});
test('M4c-2: a wrong answer whose working holds on every line gets no chain pen; a line in words is null',()=>{
 const k=kinds(),item={n:1,question:'Find the derivative of x^3',spec:{shape:'derivative',f:'x^3'}},ctx={topic:'calc1-derivative'};
 const s=k.judgeItem(item,{studentAnswer:'2x',studentWorking:"f(x) = x^3\nf'(x) = 3x^2"},ctx);
 assert.equal(s.verdict,'wrong');assert.equal(s.slipAt,undefined);
 const w=k.judgeItem(item,{studentAnswer:'2x',studentWorking:'use the power rule\nthen simplify'},ctx);
 assert.equal(w.verdict,'wrong');assert.equal(w.slipAt,undefined);
});
test('M4c-3: the verdict is checkAnswer\'s with or without working; a right or unsure item gets no chain pen',()=>{
 const k=kinds(),item={n:1,question:'Find the derivative of x^2',spec:{shape:'derivative',f:'x^2'}},ctx={topic:'calc1-derivative'};
 const working="f(x) = x^2\nf'(x) = 3x";
 for(const a of ['3x','2x','x','2x+1'])assert.equal(k.judgeItem(item,{studentAnswer:a,studentWorking:working},ctx).verdict,k.judgeItem(item,{studentAnswer:a},ctx).verdict);
 assert.equal(k.judgeItem(item,{studentAnswer:'2x',studentWorking:working},ctx).slipAt,undefined,'a right item');
 assert.equal(k.judgeItem(item,{studentAnswer:'',studentWorking:working},ctx),null,'a blank asks');
 const set=k.judgeSet({topic:'calc1-derivative',items:[item]},[{n:1,studentAnswer:'3x',studentWorking:working}],ctx);
 assert.deepEqual(set.items[0].slipAt,{line:1});assert.equal(set.items[0].verdict,'wrong');
});

test('M3a: judgeSet judges a word problem part by part - each part by its own spec, an attempt a settled part, the pen per part (rules/kinds)',()=>{
 const k=kinds(),W=require(src('lib/rules/calc-word.ts'));
 looked=throwing('vision');answerText=throwing('text');
 const w=W.drawWord('cubic-max-min',1),[hi,lo]=W.workedWord('cubic-max-min',1);
 const items=[{n:1,question:'Find f\'(2) for f(x) = x^3.',spec:{shape:'derivative-at',f:'x^3',at:2}},...W.wordItems(w,2)];
 const reads=[{n:1,studentAnswer:'12'},{n:2,studentAnswer:hi},{n:3,studentAnswer:String(Number(lo)+1),studentWorking:`f(x) = ${w.fn}\nf'(x) = 3x^2 + 6x - 20`}];
 const j=k.judgeSet({topic:'calc1-extrema',items},reads,{topic:'calc1-extrema',typed:true});
 assert.deepEqual(j.items.map((i)=>i.verdict),['right','right','wrong']);
 assert.equal(j.attempts.length,3,'one attempt per settled part');assert.equal(j.unsure,0);
 assert.deepEqual(j.items[2].slipAt,{line:1},'the chain pen lands on the part\'s slipped line');
 assert.deepEqual(j.items.map((i)=>[i.stem??null,i.part??null]),[[null,null],[w.stem,'a'],[w.stem,'b']],'judging keeps the parts');
 // a part judged with no set, as any item
 assert.equal(k.judgeItem(items[2],{studentAnswer:lo},{topic:'calc1-extrema'}).verdict,'right');
 assert.equal(k.kindOfSheet(items),'calc');
});

test('HL2 case 1: a maths task no reader reads gets the neutral stance, never the factoring one; an equation keeps today\'s text',async()=>{
 const NEUTRAL=(who)=>`a maths tutor for ${who}. This is a school maths task; prefer the simplest method a school course would use over heavier ones.`;
 const who=voiceOf('maths',13).who;
 for(const q of ['Solve the inequality x^2 - 5x + 6 < 0','Find the 10th term of the arithmetic sequence 3, 7, 11, ...','Find the equation of the line through (1, 2) and (3, 8)']){
  const {system}=await ask(q,{path:'school',age:13});
  assert.ok(system.includes(`You are ${NEUTRAL(who)}`),`${q}: neutral`);assert.doesNotMatch(system,/factoring/);
 }
 const {system}=await ask('Solve for x: 3x - 7 = 11',{path:'school',age:13});
 assert.ok(system.includes(`You are a maths tutor for ${who}. This sheet is a factoring and linear-equations unit; prefer the unit's methods over heavier ones.`),'an equation keeps today\'s text');
 const calc=await ask('Find the 10th term of the arithmetic sequence 3, 7, 11, ...',{path:'calc1'});
 assert.match(calc.system,/Calculus I/,'a Calculus path keeps its stance');
});
