/**
 * Math paths (desk/src/lib/library/paths.ts, desk/src/lib/library/calculus1.spine.ts): a learner's Math course is a
 * PATH the desk can name - the school linear-equation spine (SYLLABUS, unchanged) or Calculus 1 (CALC1_SPINE) - and
 * every screen and pipeline will look topics up through paths.ts instead of reading SYLLABUS directly. Offline: no
 * model, no server, no store. Run with npm test in desk/.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
const {transpile,options:opts}=require('./ts-load.cjs');
const LIB=path.join(root,'src/lib/library');
const SPINE_FILE=path.join(LIB,'calculus1.spine.ts'),PATHS_FILE=path.join(LIB,'paths.ts');
const {CALC1_SPINE}=require(SPINE_FILE);
const P=require(PATHS_FILE);
const {SYLLABUS,expectedIndex}=require(path.join(LIB,'syllabus.ts'));
const {CALCULUS_1}=require(path.join(LIB,'calculus1.ts'));

/**
 * The practice shapes a Calculus topic may use. THIS LIST IS THE CONTRACT WITH desk/src/lib/rules/calc.ts (the
 * expression engine that generates and checks each shape): a shape added here needs a generator there, and a shape
 * renamed there must be renamed here. Deliberately not imported from calc.ts - the spine is client-safe data.
 */
const SHAPES=['evaluate','derivative','derivative-at','antiderivative','definite-integral','limit','critical-point','extremum','newton-step'];
const SPINE_KEYS=['blurb','id','name','prereq','sections','sessions','shapes','strand'];

/** Source with comments removed, so a word in a comment never passes or fails a scan. */
const code=(file)=>fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');

test('1: 22 Calculus topics and 17 school topics, ids unique across paths and no id in two paths',()=>{
 assert.equal(CALC1_SPINE.length,22);
 assert.deepEqual(Object.keys(P.PATHS).sort(),['calc1','school']);
 assert.equal(P.PATHS.calc1.topics.length,22);
 // W5b: 'Add and subtract fractions' joined the school path in place (owner decision D5); W7 batch 1 added three more
 // fractions units, equivalent fractions first (years never go down along the path)
 // W7 batch 2 added the decimals and percent strand, W7 batch 3 ratio and rates and geometry and data: fifteen
 // v2 M2b added Pythagoras' theorem and probability after the equations: seventeen
 assert.equal(P.PATHS.school.topics.length,17,'v2 M2b: Pythagoras and probability, two more (fifteen since W7 batch 3)');
 assert.equal(P.PATHS.school.topics[0].id,'frac-equivalent');
 const ids=[...P.PATHS.school.topics,...P.PATHS.calc1.topics].map(t=>t.id);
 assert.equal(new Set(ids).size,39,'every topic id is unique across both paths');
 for(const t of P.PATHS.school.topics)assert.ok(!P.PATHS.calc1.topics.some(c=>c.id===t.id),`${t.id} is in two paths`);
 assert.equal(P.PATHS.school.name,'School maths','renamed in W5b (owner decision D5)');assert.equal(P.PATHS.school.school,true);assert.equal(P.PATHS.school.id,'school');
 assert.equal(P.PATHS.calc1.name,'Calculus 1');assert.equal(P.PATHS.calc1.school,false);assert.equal(P.PATHS.calc1.id,'calc1');
 for(const p of Object.values(P.PATHS))assert.match(p.blurb,/^[A-Z][^.!?]*[.!?]$/,`${p.id}: the blurb is one sentence`);
});

test('2: the school path is SYLLABUS unchanged - same ids, order, names and prereqs, year kept - and a course topic has no year',()=>{
 assert.deepEqual(P.PATHS.school.topics.map(t=>t.id),SYLLABUS.map(t=>t.id));
 SYLLABUS.forEach((s,i)=>{const t=P.PATHS.school.topics[i];
  for(const k of ['name','strand','blurb','lessonId'])assert.equal(t[k],s[k],`${s.id}.${k}`);
  assert.deepEqual(t.prereq,s.prereq);assert.deepEqual(t.year,s.year);});
 for(const t of P.PATHS.calc1.topics){assert.equal(t.year,undefined,`${t.id} carries a school year`);assert.ok(!('year' in t),`${t.id} has a year key`);}
});

test('3: each path\'s prerequisite graph is a DAG that only points at earlier topics of the same path',()=>{
 for(const p of Object.values(P.PATHS)){
  const before=new Set();
  for(const t of p.topics){
   for(const q of t.prereq)assert.ok(before.has(q),`${p.id}/${t.id}: prereq ${q} is an earlier topic of the same path`);
   before.add(t.id);
  }
 }
});

test('4: every Calculus topic has at least one shape, each one of the nine the engine knows (the contract with rules/calc.ts)',()=>{
 const want={
  'calc1-functions':['evaluate'],'calc1-trig':['evaluate'],'calc1-exp-log':['evaluate'],
  'calc1-limit-idea':['limit'],'calc1-limit-laws':['limit'],'calc1-continuity':['limit'],
  'calc1-derivative':['derivative','derivative-at'],'calc1-rules':['derivative'],'calc1-trig-derivatives':['derivative'],'calc1-chain':['derivative'],
  'calc1-log-derivative':['derivative','derivative-at'],'calc1-related-rates':['derivative-at'],
  'calc1-extrema':['critical-point','extremum'],'calc1-shape':['limit'],'calc1-optimisation':['extremum'],'calc1-newton':['newton-step'],
  'calc1-antiderivatives':['antiderivative'],'calc1-definite-integral':['definite-integral'],'calc1-area-so-far':['definite-integral'],
  'calc1-ftc':['definite-integral'],'calc1-substitution':['antiderivative','definite-integral'],'calc1-area-average':['definite-integral'],
 };
 assert.deepEqual(CALC1_SPINE.map(t=>t.id),Object.keys(want),'the spine keeps the order of calculus1.ts');
 for(const t of CALC1_SPINE){
  assert.ok(Array.isArray(t.shapes)&&t.shapes.length>=1,`${t.id} has a shape`);
  for(const s of t.shapes)assert.ok(SHAPES.includes(s),`${t.id}: ${s} is not one of the nine shapes`);
  assert.equal(new Set(t.shapes).size,t.shapes.length,`${t.id}: a shape listed twice`);
  assert.deepEqual(t.shapes,want[t.id],`${t.id} shapes`);
 }
 assert.deepEqual([...new Set(CALC1_SPINE.flatMap(t=>t.shapes))].sort(),[...SHAPES].sort(),'every one of the nine shapes is practised somewhere');
});

test('5: the spine is small and carries no examples or answers - exactly the eight spine fields per topic',()=>{
 const json=JSON.stringify(CALC1_SPINE);
 assert.ok(Buffer.byteLength(json,'utf8')<24*1024,`CALC1_SPINE serialises to ${Buffer.byteLength(json,'utf8')} bytes`);
 for(const t of CALC1_SPINE){
  assert.ok(!('examples' in t)&&!('answer' in t),`${t.id} carries examples or an answer`);
  assert.deepEqual(Object.keys(t).sort(),SPINE_KEYS,`${t.id}: exactly the spine fields`);
 }
 assert.doesNotMatch(json,/"(examples|answer)"\s*:/,'no examples or answer key anywhere in the spine');
});

test('6: calculus1.ts agrees with the spine on id, name, strand, blurb, prereq, sessions and sections - and keeps its own shape',()=>{
 assert.equal(CALCULUS_1.topics.length,CALC1_SPINE.length);
 CALCULUS_1.topics.forEach((t,i)=>{const s=CALC1_SPINE[i];
  for(const k of ['id','name','strand','blurb'])assert.equal(t[k],s[k],`${s.id}.${k}`);
  for(const k of ['prereq','sessions','sections'])assert.deepEqual(t[k],s[k],`${s.id}.${k}`);
  assert.deepEqual(Object.keys(t).sort(),['blurb','examples','id','name','prereq','sections','sessions','strand'],`${t.id}: CALCULUS_1 topic shape unchanged`);
 });
 assert.equal(CALCULUS_1.topics.reduce((a,t)=>a+t.examples.length,0),108,'every example still reaches its topic by id');
 // no duplicated spine text: calculus1.ts takes its names and blurbs from the spine, it does not restate them
 const src=code(path.join(LIB,'calculus1.ts'));
 for(const s of CALC1_SPINE)assert.ok(!src.includes(s.blurb),`calculus1.ts restates the blurb of ${s.id}`);
 assert.match(src,/from\s+["']\.\/calculus1\.spine["']/,'calculus1.ts reads the spine');
});

test('7: pathOf reads a profile\'s mathPath - only the string calc1 is Calculus, anything else is school',()=>{
 for(const p of [undefined,null,{},{mathPath:'x'},{mathPath:'school'},{mathPath:1},{mathPath:'CALC1'}])assert.equal(P.pathOf(p),'school',JSON.stringify(p));
 assert.equal(P.pathOf({mathPath:'calc1'}),'calc1');
 assert.equal(P.topicsOf('calc1'),P.PATHS.calc1.topics);assert.equal(P.topicsOf('school'),P.PATHS.school.topics);
});

test('8: topicIn and pathOfTopic look up across every path',()=>{
 assert.equal(P.topicIn('linear-two-step').name,'Two-step equations');
 assert.equal(P.topicIn('calc1-ftc').name,'The fundamental theorem and net change');
 assert.equal(P.topicIn('nope'),undefined);
 assert.equal(P.pathOfTopic('linear-one-step'),'school');
 assert.equal(P.pathOfTopic('calc1-chain'),'calc1');
 assert.equal(P.pathOfTopic('nope'),undefined);
});

test('9: nextOn is the first topic not secure whose prereqs are all secure',()=>{
 assert.equal(P.nextOn('calc1',[]).id,'calc1-functions');
 const onlyFunctions=P.PATHS.calc1.topics.find(t=>t.prereq.length===1&&t.prereq[0]==='calc1-functions');
 assert.equal(P.nextOn('calc1',['calc1-functions']).id,onlyFunctions.id);
 assert.equal(onlyFunctions.id,'calc1-trig');
 // W5b: fractions come first; W7: equivalent fractions needs nothing, add and subtract and multiply and divide need it
 assert.equal(P.nextOn('school',[]).id,'frac-equivalent');
 assert.equal(P.nextOn('school',['frac-equivalent']).id,'frac-of-amount');
 assert.equal(P.nextOn('school',['frac-of-amount']).id,'frac-equivalent');
 assert.equal(P.nextOn('school',['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div']).id,'linear-one-step');
 // W7 batch 2: the decimals and percent strand comes after one-step equations
 assert.equal(P.nextOn('school',['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div','linear-one-step']).id,'dec-arith');
 // W7 batch 3: ratio and rates, then geometry and data, come after the percent units and before two-step equations
 const DP=['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div','linear-one-step','dec-arith','dec-convert','pct-of-amount','pct-change'];
 assert.equal(P.nextOn('school',DP).id,'ratio-share');
 assert.equal(P.nextOn('school',[...DP,'ratio-share']).id,'unit-rate');
 assert.equal(P.nextOn('school',[...DP,'ratio-share','unit-rate','area','mean-range']).id,'linear-two-step');
 assert.equal(P.nextOn('school',['frac-equivalent','ratio-share']).id,'frac-of-amount','the first open topic, not the new strand');
 assert.equal(P.nextOn('school',[...DP.filter((t)=>t!=='dec-arith'),'ratio-share']).id,'dec-arith','unit rates need the decimals unit too');
 assert.equal(P.nextOn('school',[...DP.slice(0,5),'area']).id,'dec-arith','area needs nothing, and mean and range wait for the decimals unit');
 assert.equal(P.nextOn('school',['frac-equivalent','dec-arith']).id,'frac-of-amount');
 assert.equal(P.nextOn('school',['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div','linear-one-step','dec-arith','pct-of-amount']).id,'dec-convert','a percent of an amount needs the conversion first');
 assert.equal(P.nextOn('school',SYLLABUS.map(t=>t.id)),undefined,'nothing left');
 assert.equal(P.nextOn('calc1',CALC1_SPINE.map(t=>t.id)),undefined);
});

test('10: expectedOn - the school path is expectedIndex, a course path has no school year',()=>{
 assert.equal(P.expectedOn('calc1','us',17),null);
 assert.equal(P.expectedOn('calc1','uk',30),null);
 for(const [sys,age] of [['uk',13],['us',6],['cz',14],['de',20],['us',3]])assert.equal(P.expectedOn('school',sys,age),expectedIndex(sys,age),`${sys} ${age}`);
});

test('11: learnerPath is the path of the learner at the desk, else school',()=>{
 const profiles=[{id:'ada',mathPath:'calc1'},{id:'ben'},{id:'cy',mathPath:'school'}];
 assert.equal(P.learnerPath({profiles,learner:{id:'ada'}}),'calc1');
 assert.equal(P.learnerPath({profiles,learner:{id:'ben'}}),'school');
 assert.equal(P.learnerPath({profiles,learner:{id:'cy'}}),'school');
 assert.equal(P.learnerPath({profiles,learner:{id:'nobody'}}),'school','no profile for the learner');
 assert.equal(P.learnerPath({profiles,learner:null}),'school','no learner at the desk');
 assert.equal(P.learnerPath({}),'school');
});

test('12: the spine and paths.ts are client-safe - no Node module, no store, no learners, no engine at runtime',()=>{
 for(const file of [SPINE_FILE,PATHS_FILE]){
  const src=code(file),name=path.basename(file);
  assert.doesNotMatch(src,/from\s+["'](node:|fs|path|os|child_process)/,`${name}: no Node import`);
  assert.doesNotMatch(src,/require\(/,`${name}: no require`);
  assert.doesNotMatch(src,/import\s+(?!type\b)[^;]*from\s+["'][^"']*(session\/|desk\/|engines?\/|rules\/|learners)/,`${name}: a runtime import of the store, learners, a job, an engine or a rule`);
  const out=transpile(fs.readFileSync(file,'utf8'),opts).outputText;
  assert.doesNotMatch(out,/require\(["'](?!\.\/(syllabus|calculus1\.spine)["'])/,`${name}: requires something other than the library files at runtime`);
 }
 assert.doesNotMatch(code(SPINE_FILE),/import\s/,'the spine imports nothing');
 assert.ok(!Object.keys(require.cache).some(k=>/session[\\/](store|learners)\.ts$|[\\/]engines?[\\/]|[\\/]rules[\\/]/.test(k)),'loading paths.ts pulled a server module in');
});
