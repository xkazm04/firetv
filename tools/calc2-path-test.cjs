/**
 * The Calculus 2 path (v2 M3b-2; desk/src/lib/library/calculus2.spine.ts, paths.ts): integration techniques on the two
 * integral shapes the Calculus engine already has - parts, trigonometric integrals, trigonometric substitution, partial
 * fractions, and choosing between them (Stewart 9e 7.1-7.5, OpenStax Calculus Volume 2 3.1-3.5). A path judged 'calc'
 * follows the existing seams: this suite pins what is new - the spine, a worked fixture per topic that checkAnswer marks,
 * the stubbed set, the prompt words each Calculus path owns (Calculus 1's byte for byte) and the id sweep.
 * Offline: no model (the text engine is stubbed at the provider seam), no server; the data directory is disposable.
 * Run with npm test in desk/ (directly: node tools/calc2-path-test.cjs).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=fs.mkdtempSync(path.join(os.tmpdir(),'desk-calc2-'));process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const SRC=path.join(root,'src'),src=(f)=>path.join(SRC,f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));
const store=require(src('lib/session/store.ts'));
const kinds=require(src('lib/rules/kinds.ts'));
const maths=require(src('lib/rules/maths.ts'));
const C=require(src('lib/rules/calc.ts'));
const C2=require(src('lib/rules/calc2.ts'));
const items=require(src('lib/desk/items.ts'));
const {hint,HINT_WITHHOLD}=require(src('lib/desk/hint.ts'));
const P=require(src('lib/library/paths.ts'));
const {CALC2_SPINE}=require(src('lib/library/calculus2.spine.ts'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});

const stubText=(answer)=>{const seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);return {raw:JSON.stringify(answer)};}});return seen;};
const code=(file)=>fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
const A=(f)=>({shape:'antiderivative',f}),D=(f,a,b)=>({shape:'definite-integral',f,a,b}),AI=(f,a,b,pieces,rule)=>({shape:'approx-integral',f,a,b,pieces,rule}),SQ=(f)=>({shape:'sequence-limit',f});

/**
 * One worked answer per spec, by hand (not by the engine): `right` is the antiderivative with its constant, or the value;
 * `wrong` is an answer that is not it. The sign slip and the lost-constant slip are derived from `right` below.
 * `ref` is the section the fixture is an example of, Stewart 9e then OpenStax Volume 2.
 */
const FIXTURES=[
 // 7.1 / 3.1 integration by parts
 {topic:'calc2-parts',ref:'7.1/3.1',spec:A('x*e^x'),right:'x*e^x - e^x + C',wrong:'x*e^x + C'},
 {topic:'calc2-parts',ref:'7.1/3.1',spec:A('x*sin(x)'),right:'sin(x) - x*cos(x) + C',wrong:'sin(x) + x*cos(x) + C'},
 {topic:'calc2-parts',ref:'7.1/3.1',spec:A('ln(x)'),right:'x*ln(x) - x + C',wrong:'1/x + C'},
 {topic:'calc2-parts',ref:'7.1/3.1',spec:D('x*e^x',0,1),right:'1',wrong:'2'},
 {topic:'calc2-parts',ref:'7.1/3.1',spec:D('ln(x)',1,2),right:'2ln(2) - 1',wrong:'1'},
 // 7.2 / 3.2 trigonometric integrals
 {topic:'calc2-trig-integrals',ref:'7.2/3.2',spec:A('sin(x)^2'),right:'x/2 - sin(2x)/4 + C',wrong:'x/2 + sin(2x)/4 + C'},
 {topic:'calc2-trig-integrals',ref:'7.2/3.2',spec:A('cos(x)^3'),right:'sin(x) - sin(x)^3/3 + C',wrong:'sin(x) + sin(x)^3/3 + C'},
 {topic:'calc2-trig-integrals',ref:'7.2/3.2',spec:A('sin(x)*cos(x)'),right:'sin(x)^2/2 + C',wrong:'sin(x)^2 + C'},
 {topic:'calc2-trig-integrals',ref:'7.2/3.2',spec:D('sin(x)^2',0,'pi'),right:'pi/2',wrong:'pi'},
 // 7.3 / 3.3 trigonometric substitution
 {topic:'calc2-trig-sub',ref:'7.3/3.3',spec:A('sqrt(4 - x^2)'),right:'x/2*sqrt(4 - x^2) + 2*asin(x/2) + C',wrong:'x/2*sqrt(4 - x^2) + 2*atan(x/2) + C'},
 {topic:'calc2-trig-sub',ref:'7.3/3.3',spec:A('1/(x^2 + 4)'),right:'atan(x/2)/2 + C',wrong:'atan(x/2) + C'},
 {topic:'calc2-trig-sub',ref:'7.3/3.3',spec:D('sqrt(4 - x^2)',0,2),right:'pi',wrong:'2'},
 {topic:'calc2-trig-sub',ref:'7.3/3.3',spec:D('1/sqrt(4 - x^2)',0,1),right:'pi/6',wrong:'pi/3'},
 // 7.4 / 3.4 partial fractions
 {topic:'calc2-partial-fractions',ref:'7.4/3.4',spec:A('1/(x^2 - 1)'),right:'ln(abs(x - 1))/2 - ln(abs(x + 1))/2 + C',wrong:'ln(abs(x - 1))/2 + ln(abs(x + 1))/2 + C'},
 {topic:'calc2-partial-fractions',ref:'7.4/3.4',spec:A('1/(x*(x+1))'),right:'ln(x) - ln(x+1) + C',wrong:'ln(x) + ln(x+1) + C'},
 {topic:'calc2-partial-fractions',ref:'7.4/3.4',spec:D('1/(x^2 - 1)',2,3),right:'ln(3/2)/2',wrong:'ln(3/2)'},
 {topic:'calc2-partial-fractions',ref:'7.4/3.4',spec:D('1/(x*(x+1))',1,2),right:'ln(4/3)',wrong:'ln(3/4) + 1'},
 // 7.5 / 3.5 choosing a technique
 {topic:'calc2-strategy',ref:'7.5/3.5',spec:A('x*e^(x^2)'),right:'e^(x^2)/2 + C',wrong:'e^(x^2) + C'},
 {topic:'calc2-strategy',ref:'7.5/3.5',spec:A('x^2*ln(x)'),right:'x^3*ln(x)/3 - x^3/9 + C',wrong:'x^3*ln(x)/3 + C'},
 {topic:'calc2-strategy',ref:'7.5/3.5',spec:D('x^2*e^x',0,1),right:'e - 2',wrong:'e - 1'},
 // 7.7 / 3.6 approximate integration (v2 M3b-3b): Stewart's 1/x over [1, 2], to four decimal places
 {topic:'calc2-approx',ref:'7.7/3.6',spec:AI('1/x',1,2,5,'trapezoid'),right:'0.6956',wrong:'0.6931'},
 {topic:'calc2-approx',ref:'7.7/3.6',spec:AI('1/x',1,2,4,'simpson'),right:'0.6933',wrong:'0.6931'},
 // 11.1 / 5.1 sequences (v2 M3b-3c): a_n = n/(n+1) tends to 1; 2^n/n^3 grows without bound
 {topic:'calc2-sequences',ref:'11.1/5.1',spec:SQ('x/(x+1)'),right:'1',wrong:'0'},
 {topic:'calc2-sequences',ref:'11.1/5.1',spec:SQ('2^x/x^3'),right:'infinity',wrong:'dne'},
];
const NO_C=(r)=>r.replace(/\s*\+\s*C$/,'');

test('1: the spine - seven topics, plain data, our own blurbs, sections cited, shapes only the two integral shapes or a Calculus 2 shape, prerequisites only earlier calc2 topics',()=>{
 assert.deepEqual(CALC2_SPINE.map(t=>t.id),['calc2-parts','calc2-trig-integrals','calc2-trig-sub','calc2-partial-fractions','calc2-strategy','calc2-approx','calc2-sequences']); // OLD: six ids, ending calc2-approx
 assert.deepEqual(CALC2_SPINE.map(t=>t.sections),[['7.1'],['7.2'],['7.3'],['7.4'],['7.5'],['7.7'],['11.1']],'Stewart 9e chapter 7, then 11.1' /* OLD: six sections, ending 7.7 */);
 assert.deepEqual(CALC2_SPINE.map(t=>t.openstax),[['3.1'],['3.2'],['3.3'],['3.4'],['3.5'],['3.6'],['5.1']],'OpenStax Calculus Volume 2 chapter 3, then 5.1' /* OLD: six sections, ending 3.6 */);
 const seen=new Set();
 for(const t of CALC2_SPINE){
  assert.deepEqual(Object.keys(t).sort(),['blurb','id','name','openstax','prereq','sections','shapes','strand'],`${t.id}: the spine fields and nothing else`);
  assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,`${t.id}: the blurb is one sentence`);
  assert.ok(t.shapes.length>=1&&t.shapes.every(s=>(['antiderivative','definite-integral'].includes(s)&&C.CALC_SHAPES.includes(s))||C2.CALC2_SHAPES.includes(s)),`${t.id}: only the two integral shapes or a CALC2_SHAPES id`);
  assert.ok(t.prereq.every(p=>seen.has(p)),`${t.id}: a prerequisite that is not an earlier calc2 topic`);
  seen.add(t.id);
 }
 assert.doesNotMatch(code(path.join(SRC,'lib/library/calculus2.spine.ts')),/import\s/,'the spine imports nothing');
});

test('2: the record - calc2 is judged Calculus, has no school year, says it follows Calculus 1, and its topics carry the spine\'s shapes',()=>{
 const p=P.PATHS.calc2;
 assert.equal(p.id,'calc2');assert.equal(p.name,'Calculus 2');assert.equal(p.judge,'calc');assert.equal(p.school,false);
 assert.match(p.blurb,/follows Calculus 1/);
 assert.deepEqual(p.topics.map(t=>t.id),CALC2_SPINE.map(t=>t.id));
 for(const t of CALC2_SPINE){
  assert.deepEqual(P.shapesOfTopic(t.id),t.shapes);assert.equal(P.judgeOfTopic(t.id),'calc');assert.equal(P.pathOfTopic(t.id),'calc2');
  assert.equal(kinds.kindOfTopic(t.id),'calc');assert.equal(P.topicIn(t.id).lessonId,undefined,'no Calculus 2 lessons (ruling 4)');
 }
 assert.equal(P.nextOn('calc2',[]).id,'calc2-parts');
 assert.equal(P.frontierOn('calc2',['calc2-parts']).id,'calc2-trig-integrals');
 assert.equal(P.expectedOn('calc2','us',17),null);
});

test('3: every fixture is well formed, prints a question, and belongs to a shape its topic may use; every topic has each of its shapes worked',()=>{
 for(const f of FIXTURES){
  const w=C.wellFormed(f.spec);assert.ok(w.ok,`${f.topic} ${JSON.stringify(f.spec)}: ${w.why}`);
  assert.ok(C.question(f.spec),`${JSON.stringify(f.spec)} prints a question`);
  assert.ok(P.shapesOfTopic(f.topic).includes(f.spec.shape),`${f.topic}: ${f.spec.shape} is on its list`);
  const sec=CALC2_SPINE.find(t=>t.id===f.topic);
  assert.equal(f.ref,`${sec.sections[0]}/${sec.openstax[0]}`,`${f.topic}: the fixture names its section`);
 }
 for(const t of CALC2_SPINE)for(const shape of t.shapes)assert.ok(FIXTURES.some(f=>f.topic===t.id&&f.spec.shape===shape),`${t.id}: a ${shape} fixture`);
});

test('4: checkAnswer marks each fixture\'s own worked answer right, a wrong answer wrong, and the named slips (lost-constant, sign) as those slips',()=>{
 for(const f of FIXTURES){
  const tag=`${f.topic} ${JSON.stringify(f.spec)}`;
  assert.equal(C.checkAnswer(f.spec,f.right).verdict,'right',`${tag}: ${f.right}`);
  const w=C.checkAnswer(f.spec,f.wrong);assert.equal(w.verdict,'wrong',`${tag}: ${f.wrong}`);
  // the slips are in the topic's closed list, so a marked slip is one the topic may name
  const closed=maths.slipsFor(f.topic).map(s=>s.id);
  if(f.spec.shape==='antiderivative'){
   const lost=C.checkAnswer(f.spec,NO_C(f.right));
   assert.deepEqual([lost.verdict,lost.slip],['wrong','lost-constant'],`${tag}: no constant`);assert.ok(closed.includes('lost-constant'));
   const neg=C.checkAnswer(f.spec,`-(${NO_C(f.right)}) + C`);
   assert.deepEqual([neg.verdict,neg.slip],['wrong','sign'],`${tag}: negated`);
  }else{
   const neg=C.checkAnswer(f.spec,/^[a-z]+$/.test(f.right)?`-${f.right}`:`-(${f.right})`); // OLD: always -(right); an infinity is written -infinity
   assert.deepEqual([neg.verdict,neg.slip],['wrong','sign'],`${tag}: negated`);
  }
  assert.ok(closed.includes('sign'));
 }
});

test('5: a stubbed calc2 set is judged Calculus and its prompt asks only for the topic\'s shapes, in Calculus 2\'s words',async()=>{
 reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
 try{
  store.dispatch({type:'reset'});
  store.dispatch({type:'profile.draft',patch:{id:'calc2-learner',name:'Two',type:'other',modules:['maths'],mathPath:'calc2'}});store.dispatch({type:'profile.save'});
  for(const t of CALC2_SPINE){
   const specs=FIXTURES.filter(f=>f.topic===t.id).map((f,i)=>({shape:f.spec.shape,f:f.spec.f,at:'',a:String(f.spec.a??''),b:String(f.spec.b??''),...(f.spec.pieces!==undefined?{pieces:f.spec.pieces,rule:f.spec.rule}:{}),difficulty:1+i%3}));
   const seen=stubText({specs});
   const got=await items.makeItems(t.id,'calc2-learner',3,{word:false});
   assert.equal(kinds.kindOfTopic(t.id),'calc');
   assert.ok(seen.length>=1,`${t.id}: a Calculus set asks the model`);
   assert.deepEqual(seen[0].schema.properties.specs.items.properties.shape.enum,t.shapes,`${t.id}: the shape enum`);
   const asked=[...seen[0].prompt.matchAll(/^- ([a-z-]+): /gm)].map(m=>m[1]);
   assert.deepEqual(asked,t.shapes,`${t.id}: the prompt lists only the topic's shapes`);
   assert.ok(seen[0].system.includes('a university Calculus 2 desk'),`${t.id}: the set's prompt names Calculus 2`);
   assert.doesNotMatch(seen[0].system,/Calculus 1/,`${t.id}: and not Calculus 1`);
   assert.ok(got.items.length>=1&&got.items.every(i=>i.spec&&t.shapes.includes(i.spec.shape)),`${t.id}: the kept items are on the topic's shapes`);
  }
 }finally{reg.resetProviders();}
});

// Calculus 1's text at 37880327 (before the prompt words moved onto the PATHS record), pinned whole
const CALC1_SYSTEM=
 "You choose practice questions for a university Calculus 1 desk, as specs the desk prints and checks itself. "+
 "Give only the specs as JSON. Never write a question in words, and never work a question out or state what it comes to: the desk does that itself. "+
 "Write every function in x in plain notation on one line: powers with ^ (x^2, x^(1/2)), sqrt(x), e^(2x), sin(x), cos(x), tan(x), ln(x), "+
 "an implicit product written as 3x or 2sin(x), and brackets wherever they are needed. No LaTeX, no markdown, no dollar signs, and no words inside an expression.";
const CALC1_STANCE=
 "a maths tutor for a first-year university student in Calculus I. Use the course's methods and notation - limits, "+
 "the derivative rules, antiderivatives and the Fundamental Theorem - and name the rule that applies";

test('6: Calculus 1\'s assembled set prompt and Calculus stance equal their exact text at 37880327; Calculus 2 names Calculus II and its methods',async()=>{
 reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
 const reply={hint:'Undo the subtraction first.',what_to_try_next:'Write the new line.'},LINEAR='Solve for x:  3x − 7 = 11',CALCQ='Differentiate x^2';
 try{
  store.dispatch({type:'reset'});
  store.dispatch({type:'profile.draft',patch:{id:'calc1-learner',name:'One',type:'other',modules:['maths'],mathPath:'calc1'}});store.dispatch({type:'profile.save'});
  let seen=stubText({specs:[]});
  try{await items.makeItems('calc1-chain','calc1-learner',3,{word:false});}catch{/* an empty stubbed set may fail: only the request is read */}
  assert.equal(seen[0].system,CALC1_SYSTEM,'the Calculus 1 set prompt, whole');
  // the stance: on the Calculus 1 path, on a Calculus question met on the school path, and on no path
  for(const [problem,pth] of [[LINEAR,'calc1'],[CALCQ,'calc1'],[CALCQ,'school'],[CALCQ,undefined]]){
   seen=stubText(reply);await hint('maths',problem,{path:pth});
   assert.ok(seen[0].system.includes(`You are ${CALC1_STANCE}. ${HINT_WITHHOLD}`),`${problem} on ${pth}: Calculus 1's stance, whole`);
  }
  // Calculus 2: its own words, from its record
  seen=stubText(reply);await hint('maths',LINEAR,{path:'calc2'});
  const methods='integration by parts, trigonometric integrals, trigonometric substitution, partial fractions, the trapezoid, midpoint and Simpson\'s rules, and limits of sequences'; // OLD: '... partial fractions, and the trapezoid, midpoint and Simpson rules'
  assert.ok(seen[0].system.includes(`You are a maths tutor for a first-year university student in Calculus II. Use the course's methods and notation - ${methods} - and name the rule that applies. `));
  assert.doesNotMatch(seen[0].system,/Calculus I(?!I)/,'Calculus II, not Calculus I');
  assert.doesNotMatch(seen[0].system,/the Fundamental Theorem/);
  // a Calculus question on the school path is not Calculus 2's
  seen=stubText(reply);await hint('maths',CALCQ,{path:'school'});assert.doesNotMatch(seen[0].system,/Calculus II/);
 }finally{reg.resetProviders();}
});

test('7: the quoted \'calc2\' appears in desk/src only in paths.ts and calculus2.spine.ts (the topic-id prefix calc2- is not the literal)',()=>{
 const allowed=new Set(['lib/library/paths.ts','lib/library/calculus2.spine.ts']);
 const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):/\.tsx?$/.test(e.name)?[path.join(dir,e.name)]:[]);
 const hits=[];
 for(const file of walk(SRC)){
  const rel=path.relative(SRC,file).split(path.sep).join('/');
  if(allowed.has(rel))continue;
  fs.readFileSync(file,'utf8').split('\n').forEach((line,i)=>{if(/(["'`])calc2\1/.test(line))hits.push(`${rel}:${i+1}`);});
 }
 assert.deepEqual(hits,[],'a site that decides by the path\'s id: ask the record');
 assert.ok(walk(SRC).length>100,'the sweep read the tree');
 assert.ok(/"calc2"/.test(fs.readFileSync(path.join(SRC,'lib/library/paths.ts'),'utf8')),'paths.ts holds the literal');
});
