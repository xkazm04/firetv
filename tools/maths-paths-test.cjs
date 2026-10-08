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
 // THE length pins, one per path: every other suite derives a path's length from PATHS[x].topics.length, so growing a
 // path is a deliberate, reviewed edit of this one line (v2 M3a step 0, architecture card 5 part b)
 assert.equal(P.PATHS.calc1.topics.length,22,'the Calculus 1 path length pin');
 assert.equal(CALC1_SPINE.length,P.PATHS.calc1.topics.length);
 assert.equal(P.PATHS.calc2.topics.length,5,'the Calculus 2 path length pin (v2 M3b-2: integration techniques, 7.1-7.5)');
 assert.deepEqual(Object.keys(P.PATHS).sort(),['calc1','calc2','school']);
 // W5b: 'Add and subtract fractions' joined the school path in place (owner decision D5); W7 batch 1 added three more
 // fractions units, equivalent fractions first (years never go down along the path)
 // W7 batch 2 added the decimals and percent strand, W7 batch 3 ratio and rates and geometry and data: fifteen
 // v2 M2b added Pythagoras' theorem and probability after the equations: seventeen
 // the school path length pin (THE one; see above)
 assert.equal(P.PATHS.school.topics.length,17,'v2 M2b: Pythagoras and probability, two more (fifteen since W7 batch 3)');
 assert.equal(P.PATHS.school.topics[0].id,'frac-equivalent');
 const ids=Object.values(P.PATHS).flatMap(p=>p.topics.map(t=>t.id));
 assert.equal(new Set(ids).size,Object.values(P.PATHS).reduce((n,p)=>n+p.topics.length,0),'every topic id is unique across every path');
 for(const t of P.PATHS.school.topics)assert.ok(!Object.values(P.PATHS).some(p=>p.id!=='school'&&p.topics.some(c=>c.id===t.id)),`${t.id} is in two paths`);
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
  assert.doesNotMatch(out,/require\(["'](?!\.\/(syllabus|calculus[12]\.spine)["'])/,`${name}: requires something other than the library files at runtime`);
 }
 assert.doesNotMatch(code(SPINE_FILE),/import\s/,'the spine imports nothing');
 assert.ok(!Object.keys(require.cache).some(k=>/session[\\/](store|learners)\.ts$|[\\/]engines?[\\/]|[\\/]rules[\\/]/.test(k)),'loading paths.ts pulled a server module in');
});

// ------------------------------------------------------------------ v2 M3b-1: the path's judge on the PATHS record
// (architecture card 5 part a). Every site that asks "is this Calculus?" reads the record's judge, never the string
// 'calc1'. These rows run after 12 (node:test runs a file's tests in order), so the client-safe check above still sees
// a require cache with no server module in it; the store, the rules and the desk jobs are required here, lazily.
const {after:afterAll}=require('node:test');
const os=require('node:os');
const SRC=path.join(root,'src'),at=(f)=>path.join(SRC,f);
let scratch=null;
/** The desk modules these rows read, required once, on first use, against a disposable data directory (never desk/data). */
function desk(){
 if(scratch)return scratch;
 process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-paths-judge-'));delete process.env.DESK_TEXT_ENGINE;
 const reg=require(at('lib/engines/registry.ts'));
 require(at('lib/engines/text.ts'));require(at('lib/engines/embed.ts'));
 scratch={reg,kinds:require(at('lib/rules/kinds.ts')),maths:require(at('lib/rules/maths.ts')),calc:require(at('lib/rules/calc.ts')),
  school:require(at('lib/rules/school.ts')),store:require(at('lib/session/store.ts')),items:require(at('lib/desk/items.ts')),
  hint:require(at('lib/desk/hint.ts')).hint,explain:require(at('lib/desk/explain.ts')).explain,rows:require(at('tv/profileRows.ts'))};
 return scratch;
}
afterAll(()=>{if(!scratch)return;if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
/** The text engine stubbed at the provider seam: every request kept, each answered with `answer`. */
function stubText(d,answer){const seen=[];d.reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);return {raw:JSON.stringify(answer)};}});return seen;}
const JUDGES=['school','calc'];
const everyTopic=()=>Object.values(P.PATHS).flatMap(p=>p.topics.map(t=>({path:p.id,judge:p.judge,t})));
const CALC_STANCE_TEXT=/first-year university student in Calculus I/;

test('13: every path has a judge - school is judged as school, calc1 as Calculus - and only a Calculus path\'s topics carry shapes',()=>{
 assert.equal(P.PATHS.school.judge,'school');
 assert.equal(P.PATHS.calc1.judge,'calc');
 for(const p of Object.values(P.PATHS)){
  assert.ok(JUDGES.includes(p.judge),`${p.id}: judge ${p.judge} is one of ${JUDGES}`);
  for(const t of p.topics){
   if(p.judge==='calc')assert.ok(Array.isArray(t.shapes)&&t.shapes.length>=1&&t.shapes.every(s=>SHAPES.includes(s)),`${p.id}/${t.id}: a Calculus topic carries its shapes`);
   else assert.ok(!('shapes' in t),`${p.id}/${t.id}: a school topic carries no shapes`);
   assert.equal(P.judgeOfTopic(t.id),p.judge,`${t.id}: judgeOfTopic`);
  }
  assert.equal(P.judgeOf(p.id),p.judge);
 }
 // the record's shapes are the spine's own lists, and the helpers hand out copies
 for(const s of CALC1_SPINE){
  assert.deepEqual(P.PATHS.calc1.topics.find(t=>t.id===s.id).shapes,s.shapes,`${s.id}: shapes from the spine`);
  const a=P.shapesOfTopic(s.id);a.push('x');assert.deepEqual(P.shapesOfTopic(s.id),s.shapes,`${s.id}: shapesOfTopic is a copy`);
 }
 assert.equal(P.judgeOf(undefined),'school','no path is the school path');assert.equal(P.judgeOfTopic('nope'),undefined);
 assert.deepEqual(P.shapesOfTopic('linear-two-step'),[]);assert.deepEqual(P.shapesOfTopic('nope'),[]);
 assert.deepEqual(P.calcTopics().map(t=>t.id),Object.values(P.PATHS).filter(p=>p.judge==='calc').flatMap(p=>p.topics.map(t=>t.id)));
});

test('14: kindOfTopic, the Calculus slips and pathOf agree with the record for every topic of every path',()=>{
 const d=desk();
 const calcIds=new Set(d.calc.CALC_SLIPS.map(c=>c.id));
 for(const {path:p,judge,t} of everyTopic()){
  const kind=d.kinds.kindOfTopic(t.id);
  if(judge==='calc')assert.equal(kind,'calc',`${t.id}: a topic on a Calculus path is a Calculus item`);
  else assert.equal(kind,d.school.generatorFor(t.id)?'school':'linear',`${t.id}: a school path's topic is school with a generator, else linear`);
  // isCalcTopic, through slipsFor: a Calculus topic's closed list is the Calculus slips of its own shapes, and only those
  const slips=d.maths.slipsFor(t.id).map(s=>s.id);
  if(judge==='calc'){
   const want=[...new Set(t.shapes.flatMap(sh=>d.calc.slipsFor(sh)))];
   assert.deepEqual([...slips].sort(),[...want].sort(),`${t.id}: the slips of its shapes`);
   assert.ok(slips.length>=1&&slips.every(id=>calcIds.has(id)),`${t.id}: only Calculus slips`);
  }
  // the words decide whose slip it is ('arithmetic-slip' is an id in both the linear and the Calculus tables)
  const own=judge==='calc'?d.calc.CALC_SLIPS:[...d.maths.SLIPS,...d.school.SCHOOL_SLIPS];
  for(const s of d.maths.slipsFor(t.id))assert.ok(own.some(x=>x.id===s.id&&x.says===s.says),`${t.id}: ${s.id} is in its judge's own words`);
  assert.equal(P.pathOf({mathPath:p}),p,`${t.id}: pathOf its own path`);
  assert.equal(P.pathOfTopic(t.id),p);
 }
 for(const junk of ['toString','constructor','__proto__','hasOwnProperty','calc3',' calc1','calc1 ',''])assert.equal(P.pathOf({mathPath:junk}),'school',`${JSON.stringify(junk)} is no path`);
 for(const k of Object.keys(P.PATHS))assert.equal(P.isPath(k),true);
});

test('15: shapesOf - a set on a Calculus path\'s topic asks for that topic\'s own shapes from the record; no school path\'s topic asks for a shape',async()=>{
 const d=desk();
 d.reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
 try{
  for(const p of Object.values(P.PATHS)){
   const id=`paths-judge-${p.id}`;
   d.store.dispatch({type:'reset'});
   d.store.dispatch({type:'profile.draft',patch:{id,name:'Judge',type:'other',modules:['maths'],mathPath:p.id}});d.store.dispatch({type:'profile.save'});
   for(const t of p.topics){
    const seen=stubText(d,{specs:[],items:[]});
    try{await d.items.makeItems(t.id,id,6,{word:false});}catch{/* an empty stubbed set may fail: only the request is read */}
    const enums=seen.map(r=>r.schema?.properties?.specs?.items?.properties?.shape?.enum).filter(Boolean);
    if(p.judge==='calc'){assert.ok(seen.length>=1,`${t.id}: a Calculus set asks the model`);assert.deepEqual(enums[0],t.shapes,`${t.id}: the shape enum is the record's list`);}
    else assert.deepEqual(enums,[],`${t.id}: a school path's set asks for no Calculus shape`);
   }
  }
 }finally{d.reg.resetProviders();}
});

test('16: the hint - the stance, the voice and the route\'s lesson skip follow the learner\'s path\'s judge',async()=>{
 const d=desk();
 const LINEAR='Solve for x:  3x − 7 = 11',reply={hint:'Undo the subtraction first.',what_to_try_next:'Write the new line.'};
 try{
  for(const p of Object.values(P.PATHS)){
   let seen=stubText(d,reply);await d.hint('maths',LINEAR,{path:p.id});
   const plain=seen[0].system;
   if(p.judge==='calc')assert.match(plain,CALC_STANCE_TEXT,`${p.id}: a Calculus path's learner gets the Calculus stance on any maths task`);
   else assert.doesNotMatch(plain,CALC_STANCE_TEXT,`${p.id}: the school stance`);
   seen=stubText(d,reply);await d.hint('maths',LINEAR,{path:p.id,age:12});
   if(p.judge==='calc')assert.equal(seen[0].system,plain,`${p.id}: a Calculus learner is spoken to as the course's student, whatever their age`);
   else assert.notEqual(seen[0].system,plain,`${p.id}: the school voice follows the age`);
   // the route: the path comes from the seated profile; a Calculus path has no lesson library, so no lesson pick
   d.store.dispatch({type:'reset'});
   d.store.dispatch({type:'profile.draft',patch:{id:`paths-hint-${p.id}`,name:'Scratch',type:'other',mathPath:p.id}});d.store.dispatch({type:'profile.save'});
   const page={id:`maths-${p.id}`,subject:'maths',title:'Sheet',img:'',w:100,h:100};
   d.store.dispatch({type:'page.reading',page});d.store.dispatch({type:'page.read',id:page.id,items:[{n:1,text:LINEAR,cx:0,cy:0,band:[0,10],key:'k1'}],readMs:1,provider:'test'});
   const calls={hint:0,lesson:0};
   d.reg.useProvider('text',{name:'stub',run:async(req)=>{
    if(Object.keys(req.schema?.properties??{}).includes('lesson')){calls.lesson++;return {raw:JSON.stringify({lesson:'none',why:'x'})};}
    calls.hint++;return {raw:JSON.stringify(reply)};
   }});
   const res=await require(at('app/api/hint/route.ts')).POST(new Request('http://desk/api/hint',{method:'POST',body:JSON.stringify({})}));
   assert.equal(res.status,200);
   for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));
   assert.equal(calls.hint,1);
   assert.equal(calls.lesson,p.judge==='calc'?0:1,`${p.id}: the lesson pick ${p.judge==='calc'?'skipped':'asked'}`);
  }
 }finally{d.reg.resetProviders();}
});

test('17: explain names the topic\'s own Calculus path, in Calculus 1\'s words unchanged',async()=>{
 const d=desk();
 try{
  for(const t of P.calcTopics()){
   const seen=stubText(d,{reply:'Look at the first step again.',slip:'unclear',value:''});
   await d.explain('Differentiate x^2',"I think it's two x",t.id,'paths-explain',true);
   const name=P.PATHS[P.pathOfTopic(t.id)].name;
   assert.ok(seen[0].system.includes(`a first-year university student on the ${name} course explain`),`${t.id}: the course named is ${name}`);
  }
  // Calculus 1's words, byte for byte, and a Calculus item on a school topic still names Calculus 1, as it always has
  for(const id of ['calc1-chain','linear-two-step']){
   const seen=stubText(d,{reply:'Look again.',slip:'unclear',value:''});
   await d.explain('Differentiate x^2','two x',id,'paths-explain',true);
   assert.ok(seen[0].system.startsWith('You are a calculus tutor listening to a first-year university student on the Calculus 1 course explain their own working out loud. '),id);
  }
 }finally{d.reg.resetProviders();}
});

test('18: the store keeps a mathPath that is a key of PATHS and drops anything else; COURSES is the PATHS keys in order',()=>{
 const d=desk();
 for(const k of Object.keys(P.PATHS)){
  const draft=d.store.reduce(d.store.fresh(),{type:'profile.draft',patch:{mathPath:k}}).draft;
  assert.equal(draft.mathPath,k,`${k} is kept`);
 }
 for(const junk of ['toString','constructor','__proto__','calc3','CALC1','',1,null,{},['calc1']]){
  const draft=d.store.reduce(d.store.fresh(),{type:'profile.draft',patch:{mathPath:junk}}).draft;
  assert.ok(!('mathPath' in draft),`${JSON.stringify(junk)} is dropped, key and all`);
 }
 assert.deepEqual(d.rows.COURSES,Object.keys(P.PATHS),'COURSES: the PATHS keys as declared');
 assert.equal(d.rows.COURSES[0],'school','the school path first (the default)');
 const row=d.rows.profileRows({id:'p',name:'P',type:'other',modules:['maths']}).find(r=>r.title==='Maths course');
 assert.deepEqual(row.cells.map(c=>[c.path,c.label,c.blurb]),Object.values(P.PATHS).map(p=>[p.id,p.name,p.blurb]),'the course row: one cell per path, its name and blurb');
});

test('19: no quoted \'calc1\' in desk/src outside paths.ts, calculus1.ts and calculus1.spine.ts (the topic-id prefix calc1- is not the literal)',()=>{
 const allowed=new Set(['lib/library/paths.ts','lib/library/calculus1.ts','lib/library/calculus1.spine.ts']);
 const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):/\.tsx?$/.test(e.name)?[path.join(dir,e.name)]:[]);
 const hits=[];
 for(const file of walk(SRC)){
  const rel=path.relative(SRC,file).split(path.sep).join('/');
  if(allowed.has(rel))continue;
  fs.readFileSync(file,'utf8').split('\n').forEach((line,i)=>{if(/(["'`])calc1\1/.test(line))hits.push(`${rel}:${i+1}`);});
 }
 assert.deepEqual(hits,[],'a site that decides Calculus by the path\'s id: ask the record\'s judge');
 assert.ok(walk(SRC).length>100,'the sweep read the tree');
});
