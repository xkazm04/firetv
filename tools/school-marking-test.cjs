/**
 * School items are MARKED, HINTED and EXPLAINED by code-first rules (Family W5b). A photographed fractions sheet is read
 * by the vision model with the school prompt - the child's final answer and working exactly as written, never an
 * expression in x, never a verdict, a solution or a slip - and each item is judged by rules/school check(spec, answer,
 * system), the system being the seated learner's (a '0,75' is 3/4 in cz, unsure in us and uk). A slip is only the one
 * code detects from the spec's operands, from the unit's closed list (rules/maths slipsFor). The dispatch is by the
 * spec's shape: a school spec is never read by Calculus code and a Calculus spec never by school code. A hint on a
 * fractions task reads it back into a spec (rules/school specFromQuestion), passes leaksSchool, gives the unit's fixed
 * sentence after a second leak and names the unit in its stance; an explanation takes the school stance with the age
 * voice, settles an unsure item by check and replaces a reply that states the answer. The Calculus prompts are byte for
 * byte what they were.
 * Typed answers (Family W6, tests 10-15): POST /api/mark takes a photo XOR six typed strings; markTyped judges each by the same
 * checkers a photo's transcribed strings reach (settleSpec under the learner's system, the substitution rule for a linear
 * item), lands through the same path, and calls no model - the vision and text engines are made to throw.
 * Run with npm test in desk/ (directly: node tools/school-marking-test.cjs). No model is called - the vision and text
 * engines are stubbed at the provider registry - and the data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`desk-school-marking-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const S=require(src('lib/rules/school.ts'));
const C=require(src('lib/rules/calc.ts'));
const M=require(src('lib/rules/maths.ts'));
const H=require(src('lib/desk/hint.ts'));
const X=require(src('lib/desk/explain.ts'));
const {PATHS,topicIn}=require(src('lib/library/paths.ts'));
const {DEFAULT_SYSTEM}=require(src('tv/profileRows.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const drain=async()=>{for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));};
const PHOTO={image:'data:image/jpeg;base64,AAAA',w:100,h:100};
const UNIT='frac-add-sub';
/** A fresh scratch learner per seating: the learner record outlives a desk reset, and each case counts its own attempts. */
let LEARNER='school-mark-scratch',seats=0;
function seat(system){
 LEARNER=`school-mark-scratch-${++seats}`;
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Mia',type:'elementary',age:12,...(system?{system}:{}),modules:['maths']}});store.dispatch({type:'profile.save'});
}
let seenVision=[];
const stubVision=(f)=>{seenVision=[];reg.useProvider('vision',{name:'stub',run:async(req)=>{seenVision.push(req);return {raw:JSON.stringify(await f(req))};}});};
let seenText=[];
const stubText=(f)=>{seenText=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seenText.push(req);return {raw:JSON.stringify(await f(req,seenText.length))};}});};
const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];

const cs=(expr,extra={})=>({shape:'compute',expr,...extra});
const A=cs('3/4 + 1/6');   // 9/12 + 2/12 = 11/12
const B=cs('5/6 - 1/4');   // 10/12 - 3/12 = 7/12
const Cq=cs('1/2 + 1/4');  // 3/4
const question=(spec)=>S.question(spec).plain;

// ------------------------------------------------------------------ 1. the slips: a closed list per unit
test('1: slipsFor(frac-add-sub) is the unit\'s closed list in rules/school\'s own words; no other topic gains a school slip',()=>{
 const ids=M.slipsFor(UNIT).map((s)=>s.id);
 assert.deepEqual(ids,['tops-and-bottoms','top-not-scaled','tops-one-bottom','wrong-direction']);
 assert.deepEqual(ids,[...S.SCHOOL_UNIT_SLIPS[UNIT]]);
 for(const s of M.slipsFor(UNIT)){
  const w=S.SCHOOL_SLIPS.find((x)=>x.id===s.id);
  assert.deepEqual([s.name,s.says,s.points],[w.name,w.says,w.points],`${s.id}: school.ts's own words`);
  assert.deepEqual(s.topics,[UNIT]);
  assert.doesNotMatch(s.says+s.name+s.points,/\d/,`${s.id}: no value on it`);
 }
 const vocab=M.slipVocabulary(UNIT);
 for(const id of ids)assert.ok(vocab.split('\n').some((l)=>l.startsWith(`${id}: `)),id);
 assert.equal(vocab.split('\n').length,4,'nothing else on the list');
 assert.equal(M.slip('tops-and-bottoms').name,'Added the tops and the bottoms','the TV names a slip by id (MathsTV slipName)');
 assert.equal(M.slip('wrong-direction',UNIT).says,S.SCHOOL_SLIPS[3].says);
 // closed: nothing outside the list can be named on a fractions item
 for(const out of ['sign-lost-moving','arithmetic-slip','sign','lost-constant','made-up','constructor','']){
  const st=M.settled(3,false,out,UNIT);
  assert.equal(st.slip,undefined,`${out||'(empty)'} is not on the unit's list`);assert.equal(st.said,M.ASK(3));
 }
 // the other topics' lists are as they were
 for(const t of ['linear-one-step','linear-two-step','linear-both-sides'])assert.deepEqual(M.slipsFor(t),M.SLIPS.filter((s)=>s.topics.includes(t)),t);
 for(const t of [...PATHS.calc1.topics.map((x)=>x.id),'linear-one-step','linear-two-step','linear-both-sides'])
  for(const id of ids)assert.ok(!M.slipsFor(t).some((s)=>s.id===id),`${t} has no ${id}`);
 assert.equal(M.slip('arithmetic-slip').says,M.SLIPS.find((s)=>s.id==='arithmetic-slip').says,'a shared id reads as before');
});

// ------------------------------------------------------------------ 2. the dispatch by shape
test('2: settleSpec dispatches on the spec\'s shape - check for a school spec (by system), checkAnswer for a Calculus one, never the other',()=>{
 assert.equal(M.isCalcSpec(A),false);assert.equal(S.isSchoolSpec(A),true);
 const calc={shape:'evaluate',f:'x^2 + 3x',at:2};
 assert.equal(M.isCalcSpec(calc),true);assert.equal(S.isSchoolSpec(calc),false);
 for(const junk of [null,undefined,{},{shape:'nope'},'compute',{shape:['compute']}]){assert.equal(M.isCalcSpec(junk),false);assert.equal(S.isSchoolSpec(junk),false);}
 // each engine refuses the other's spec: a crossed dispatch could only ever be unsure
 assert.equal(C.checkAnswer(A,'11/12').verdict,'unsure');assert.equal(S.check(calc,'10','uk').verdict,'unsure');
 // school: check decides, by the system
 assert.deepEqual(M.settleSpec(1,A,'11/12',undefined,UNIT),{verdict:'right',slip:undefined,said:M.RIGHT(1)});
 assert.equal(M.settleSpec(1,A,'22/24',undefined,UNIT).verdict,'right');
 assert.equal(M.settleSpec(1,Cq,'0,75',undefined,UNIT,'cz').verdict,'right','0,75 is three quarters in cz');
 assert.equal(M.settleSpec(1,Cq,'0,75',undefined,UNIT,'de').verdict,'right');
 assert.equal(M.settleSpec(1,Cq,'0,75',undefined,UNIT,'us'),null,'0,75 is unsure in us: nothing settles');
 assert.equal(M.settleSpec(1,Cq,'0,75',undefined,UNIT),null,'the default system is UK');
 assert.equal(S.DEFAULT_SCHOOL_SYSTEM,DEFAULT_SYSTEM,'the desk has one default system');
 assert.equal(M.settleSpec(1,A,'0.9167',undefined,UNIT),null,'a rounding is unsure');
 assert.equal(M.settleSpec(1,A,'',undefined,UNIT),null);
 // the slip is code's own; a pick offered is ignored, whether on the list or not
 assert.deepEqual(M.settleSpec(2,A,'4/10',undefined,UNIT),{verdict:'wrong',slip:'tops-and-bottoms',said:S.SCHOOL_SLIPS[0].says});
 assert.deepEqual(M.settleSpec(2,A,'11/13','tops-and-bottoms',UNIT),{verdict:'wrong',slip:undefined,said:M.ASK(2)},'a model pick is not a school slip');
 assert.equal(M.settleSpec(2,A,'4/10','top-not-scaled',UNIT).slip,'tops-and-bottoms','code\'s slip, not the pick');
 // Calculus: as it always was
 assert.equal(M.settleSpec(1,calc,'10',undefined,'calc1-functions').verdict,'right');
 assert.equal(M.settleSpec(1,calc,'-10',undefined,'calc1-functions').slip,'sign');
 assert.equal(M.settleSpec(1,{shape:'nope'},'1',undefined,UNIT),null);
});

// ------------------------------------------------------------------ 3. marking a full set through the route
/** The page the stub reads, n -> what is written, and what code must decide. The stub also volunteers a verdict, a solution and a slip. */
const PAGE=[
 {spec:A,a:'11/12',uk:['right'],cz:['right'],us:['right']},
 {spec:A,a:'4/10',uk:['wrong','tops-and-bottoms'],cz:['wrong','tops-and-bottoms'],us:['wrong','tops-and-bottoms']},
 {spec:A,a:'5/6',uk:['wrong','top-not-scaled'],cz:['wrong','top-not-scaled'],us:['wrong','top-not-scaled']},
 {spec:A,a:'4/6',uk:['wrong','tops-one-bottom'],cz:['wrong','tops-one-bottom'],us:['wrong','tops-one-bottom']},
 {spec:B,a:'-7/12',uk:['wrong','wrong-direction'],cz:['wrong','wrong-direction'],us:['wrong','wrong-direction']},
 {spec:Cq,a:'0,75',uk:['unsure'],cz:['right'],us:['unsure']},
 {spec:A,a:'',uk:['unsure'],cz:['unsure'],us:['unsure']},
 {spec:A,a:'11/13',uk:['wrong'],cz:['wrong'],us:['wrong']},
 {spec:A,a:'0.9167',uk:['unsure'],cz:['unsure'],us:['unsure']},
];
function setOn(){store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,items:PAGE.map((p,i)=>({n:i+1,question:question(p.spec),spec:p.spec,tier:1}))}});}
for(const system of ['uk','cz','us']){
 test(`3.${system}: a photographed fractions sheet is marked by check under ${system} - one vision call, the school prompt, the model's verdict never read`,async()=>{
  seat(system);setOn();
  stubVision(()=>({items:PAGE.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:p.a?`9/12 + 2/12\n${p.a}`:'',verdict:'right',solution:'11/12',slip:'tops-and-bottoms'}))}));
  stubText(()=>{throw new Error('no text call while marking');});
  const r=await post('mark',PHOTO);
  assert.equal(r.status,200);
  assert.equal(seenVision.length,1,'one vision call per sheet');assert.equal(seenText.length,0);
  const req=seenVision[0];
  assert.match(req.prompt,/school maths questions/);assert.match(req.prompt,/copied exactly as written/);
  assert.doesNotMatch(req.prompt,/expression in x|Calculus|\+C/,'not the Calculus reading prompt');
  for(let i=0;i<PAGE.length;i++)assert.ok(req.prompt.includes(`${i+1}. ${question(PAGE[i].spec)}`),'the sheet as printed');
  assert.deepEqual(Object.keys(req.schema.properties.items.items.properties).sort(),['n','studentAnswer','studentWorking'],'no verdict, solution or slip asked for');
  const items=store.getSession().practice.items;
  PAGE.forEach((p,i)=>{
   const [verdict,slip]=p[system],it=items[i];
   assert.equal(it.verdict,verdict,`${i+1} ${p.a||'(blank)'} under ${system}`);
   assert.equal(it.slip,slip,`${i+1}: the slip code detected`);
   assert.equal(it.studentAnswer,p.a,'the answer as the page gives it');
   assert.deepEqual(it.spec,p.spec,'the spec survives marking');
   if(verdict==='right')assert.equal(it.said,M.RIGHT(i+1));
   else if(slip)assert.equal(it.said,S.SCHOOL_SLIPS.find((x)=>x.id===slip).says);
   else assert.equal(it.said,M.ASK(i+1),'unsure, or wrong with no known slip: the desk asks');
   assert.equal(it.slipAt,undefined,'no pen position on a school item');
  });
  const settledN=PAGE.filter((p)=>p[system][0]!=='unsure').length,right=PAGE.filter((p)=>p[system][0]==='right').length,unsure=PAGE.length-settledN;
  const rec=learners.getLearner(LEARNER).skills[UNIT];
  assert.equal(rec.seen,settledN,'only settled items reach the record');
  const h=learners.getLearner(LEARNER).history.filter((e)=>e.kind==='practice').pop();
  assert.equal(h.label,'Add and subtract fractions');assert.equal(h.detail,`${right} of ${PAGE.length} right, ${unsure} not sure`);
  for(const v of [store.getSession()])assert.ok(!keysIn(v).includes('solution')&&!keysIn(v).includes('answer'),'the model\'s solution never lands');
 });
}

// ------------------------------------------------------------------ 4. hints: the reader, the leak check, the stance
/** [task text, the expr it reads as (null: refused), the form] */
const TASKS=[
 ['3/4 + 1/6','3/4 + 1/6'],['Work out 3/4 - 1/6','3/4 - 1/6'],['Work out 3/4 + 1/6.','3/4 + 1/6'],['Calculate 2/3 + 1/5','2/3 + 1/5'],
 ['calculate: 5/6 - 1/4','5/6 - 1/4'],['Add 3/4 and 1/6','3/4 + 1/6'],['Add 1/6 to 3/4','1/6 + 3/4'],['Subtract 1/6 from 3/4','3/4 - 1/6'],
 ['3/4 + 1/6 =','3/4 + 1/6'],['3/4 + 1/6 = ?','3/4 + 1/6'],['3/4 + 1/6 = ___','3/4 + 1/6'],['1. 3/4 + 1/6','3/4 + 1/6'],['(b) 5/6 - 1/4','5/6 - 1/4'],
 ['3/4+1/6','3/4 + 1/6'],['¾ + ⅙','3/4 + 1/6'],['3⁄4 − 1⁄6','3/4 - 1/6'],['Work out 3/4 + 1/6. Give your answer in its simplest form.','3/4 + 1/6','simplest'],
 ['What is 1/2 + 1/4?','1/2 + 1/4'],['Evaluate 7/10 - 2/5','7/10 - 2/5'],['3/4 plus 1/6','3/4 + 1/6'],['5/6 minus 1/4','5/6 - 1/4'],['Take 1/4 away from 5/6','5/6 - 1/4'],
 ['Find the sum of 2/3 and 1/5','2/3 + 1/5'],['Work out 1/2 + 3/4. Give your answer as a decimal.','1/2 + 3/4','decimal'],['c) 2 / 3 + 1 / 5','2/3 + 1/5'],
 // W7: multiply and divide fractions is a unit now, so these two (refused in W5b) read as its specs
 ['3/4 × 1/6','3/4 × 1/6'],['3/4 ÷ 1/6','3/4 ÷ 1/6'],
 // refused: not two fractions combined, or not read with one meaning
 ['3 + 4',null],['0.5 + 0.25',null],['1/2 + 1/3 + 1/4',null],['three quarters plus one sixth',null],['3/4 + x',null],['Solve x + 1/2 = 3/4',null],
 ['(3/4 + 1/6',null],['3/4 + 1/6)',null],['1 1/2 + 3/4',null],['3/4 + 1/6 = 11/12',null],['1/6 - 3/4',null],
 ['3/0 + 1/6',null],['Find the difference between 3/4 and 1/6',null],['',null],['3/4 + 1/6 and 1/2',null],['2 + 3/4',null],['Work out 3/4 + 1/6 please',null],
 ['3/1 + 1/6',null],['03/4 + 1/6',null],['Differentiate x^2 + 1/2',null],['Solve for x:  3x − 7 = 11',null],['Work out 1/3 + 1/5. Give your answer as a decimal.',null],
 ['3/4 - 3/4',null],['1/2 + 1/2 + ',null],['Add 3/4',null],['1/2 + 1/4 = 3/4 ?',null],
];
test('4: specFromQuestion reads a fractions task conservatively - '+TASKS.length+' phrasings, '+TASKS.filter((t)=>t[1]===null).length+' of them refused (W7 units below)',()=>{
 assert.ok(TASKS.length>=25&&TASKS.filter((t)=>t[1]===null).length>=15);
 for(const [text,expr,form] of TASKS){
  const got=S.specFromQuestion(text);
  if(expr===null){assert.equal(got,null,`refused: ${JSON.stringify(text)}`);continue;}
  assert.deepEqual(got,{shape:'compute',expr,...(form?{form}:{})},text);
  assert.ok(S.wellFormed(got).ok);
  assert.equal(C.specFromQuestion(text),null,`${text}: not a Calculus task`);
 }
 for(const junk of [null,undefined,42,{},['3/4 + 1/6'],'x'.repeat(500)])assert.equal(S.specFromQuestion(junk),null);
 // Calculus tasks are not school tasks
 for(const t of ['Differentiate f(x) = x^3','Find f(2) for f(x) = x^2 + 3x','Evaluate lim_(x->0) sin(3x)/x'])assert.equal(S.specFromQuestion(t),null,t);
 // every question a set prints reads back to its own spec
 for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=S.gen(seed,tier);assert.deepEqual(S.specFromQuestion(S.question(sp).plain),sp,`${tier}/${seed}`);}
 assert.equal(S.unitOf(A),UNIT);assert.equal(S.unitOf(cs('2 + 3/4')),null);assert.equal(S.unitOf({shape:'evaluate',f:'x',at:1}),null);
});

test('5: the withheld sentence names the method, carries no number, and leaks nothing on any generated item',()=>{
 const line=S.SCHOOL_WITHHELD[UNIT];
 assert.doesNotMatch(line,/\d/);
 for(const tier of [1,2])for(let seed=0;seed<200;seed++)assert.equal(S.leaksSchool(S.gen(seed,tier),line),false,`${tier}/${seed}`);
 assert.equal(S.withheldSchool(A),line);assert.equal(S.withheldSchool(cs('2 + 3/4')),S.SCHOOL_WITHHELD.any);assert.equal(S.withheldSchool(null),S.SCHOOL_WITHHELD.any);
});

test('6: a hint that gives a fractions answer away twice becomes the unit\'s fixed sentence; once, the re-ask stands; the stance names the unit',async()=>{
 const task='Work out 3/4 + 1/6.';
 stubText(()=>({hint:'Nine twelfths and two twelfths make eleven twelfths.',what_to_try_next:'Write 11/12.'}));
 let h=await H.hint('maths',task,{path:'school',age:12});
 assert.equal(seenText.length,2,'asked, then asked again once');
 assert.equal(h.hint,S.SCHOOL_WITHHELD[UNIT]);assert.equal(h.next,'');
 assert.match(seenText[1].prompt,/gave the answer away/);
 const sys=seenText[0].system;
 assert.match(sys,/This sheet is the unit "Add and subtract fractions"; prefer the unit's methods over heavier ones\./);
 assert.doesNotMatch(sys,/factoring and linear-equations/);
 assert.match(sys,/a learner aged 11 to 13/,'the W2 voice stays');
 // leaks once, then a clean re-ask: the re-ask is the hint
 stubText((req,k)=>k===1?{hint:'It is 0.92 near enough.',what_to_try_next:'Check.'}:{hint:'What number do both bottoms go into?',what_to_try_next:'Write the bottoms one under the other.'});
 h=await H.hint('maths',task,{path:'school',age:12});
 assert.equal(seenText.length,2);assert.equal(h.hint,'What number do both bottoms go into?');
 // a legit hint passes on the first ask
 stubText(()=>({hint:'Rewrite 3/4 as twelfths first.',what_to_try_next:'Write 3/4 = ?/12.'}));
 h=await H.hint('maths','Add 3/4 and 1/6',{path:'school'});
 assert.equal(seenText.length,1);assert.equal(h.hint,'Rewrite 3/4 as twelfths first.');
 assert.match(seenText[0].system,/a 15-year-old\. This sheet is the unit "Add and subtract fractions"/,'no age: the teen words, the unit named');
 // a task no reader reads gets no school check, exactly as before: the same line passes
 stubText(()=>({hint:'Think about 17/12 as a check.',what_to_try_next:'Add them in pairs.'}));
 h=await H.hint('maths','Work out 3/4 + 1/6 + 1/2',{path:'school'});
 assert.equal(seenText.length,1);assert.equal(h.hint,'Think about 17/12 as a check.');
 assert.match(seenText[0].system,/factoring and linear-equations unit/,'an unread task keeps today\'s stance');
 // a linear task: today's stance and fallback, untouched
 stubText(()=>({hint:'x is 6.',what_to_try_next:'Write x = 6.'}));
 h=await H.hint('maths','Solve for x:  3x − 7 = 11',{path:'school'});
 assert.equal(seenText.length,2);assert.equal(h.hint,M.withheldLine('Solve for x:  3x − 7 = 11'));
 assert.match(seenText[0].system,/This sheet is a factoring and linear-equations unit; prefer the unit's methods over heavier ones\./);
});

test('7: the hint route asks no lesson pick for a fractions task (no lesson in the library): "No lesson for this"',async()=>{
 seat('uk');
 const page={id:'maths-frac',subject:'maths',title:'Sheet',img:'',w:100,h:100};
 store.dispatch({type:'page.reading',page});store.dispatch({type:'page.read',id:page.id,items:[{n:1,text:'3/4 + 1/6 =',cx:0,cy:0,band:[0,10],key:'k1'}],readMs:1,provider:'test'});
 let lesson=0,hints=0;
 reg.useProvider('text',{name:'stub',run:async(req)=>{if(Object.keys(req.schema?.properties??{}).includes('lesson')){lesson++;return {raw:JSON.stringify({lesson:'none',why:'x'})};}hints++;return {raw:JSON.stringify({hint:'What do both bottoms go into?',what_to_try_next:'Write the bottoms down.'})};}});
 assert.equal((await post('hint',{})).status,200);await drain();
 const s=store.getSession();
 assert.equal(hints,1);assert.equal(lesson,0,'no pickLesson call');
 assert.equal(s.noLesson,true);assert.equal(s.lesson,null);assert.equal(s.jobs?.lesson?.phase,'done');
});

// ------------------------------------------------------------------ 5. explanations
test('8: an unsure fractions item is explained in the school stance and settled by check; a reply that states the answer is replaced',async()=>{
 seat('uk');setOn();
 stubVision(()=>({items:PAGE.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:''}))}));
 assert.equal((await post('mark',PHOTO)).status,200);
 // item 6 ('0,75' under uk) is unsure; the learner says "three quarters"
 stubText(()=>({reply:'Good - look again at how you made the bottoms match.',value:'3/4',slip:'tops-and-bottoms'}));
 let r=await post('explain',{transcript:'I made them quarters and got three quarters',n:5});
 assert.equal(r.status,200);
 const b=await r.json();assert.equal(b.settled,'right');
 const req=seenText[0];
 assert.doesNotMatch(req.system,/first-year university student/,'not the Calculus stance');
 assert.match(req.system,/listening to a school student explain/);
 assert.match(req.system,/a child of about 12/,'the W2 young voice');
 assert.match(req.prompt,/^Topic: Add and subtract fractions\n/);
 assert.match(req.prompt,/eleven twelfths is 11\/12/);assert.doesNotMatch(req.prompt,/value of x/);
 assert.doesNotMatch(req.prompt,/name the mistake/,'no slip asked for');
 assert.deepEqual(Object.keys(req.schema.properties).sort(),['reply','value']);
 assert.equal(store.getSession().practice.items[5].verdict,'right');
 assert.equal(learners.getLearner(LEARNER).skills[UNIT].seen,PAGE.filter((p)=>p.uk[0]!=='unsure').length+1,'the settle recorded once');
 // item 9 (0.9167, a rounding): the learner says eleven twelfths, but the reply gives it away - replaced by the item's own line
 stubText(()=>({reply:'Yes, it comes to 11/12.',value:'11/12'}));
 r=await post('explain',{transcript:'eleven twelfths',n:8});
 const it9=store.getSession().practice.items[8];
 assert.equal(it9.verdict,'right');assert.equal(it9.reply,M.RIGHT(9),'the leaking reply is not shown');
 assert.equal((await r.json()).reply,M.RIGHT(9));
 // item 8 (11/13, wrong with no slip): a slip the conversation names does not rename a school item
 stubText(()=>({reply:'Look at the tops.',value:'',slip:'tops-and-bottoms'}));
 await post('explain',{transcript:'I added them',n:7});
 const it8=store.getSession().practice.items[7];
 assert.equal(it8.verdict,'wrong');assert.equal(it8.slip,undefined,'a school slip is only code\'s');assert.equal(it8.reply,'Look at the tops.');
 // '0,75' said by a cz learner reads as three quarters too
 seat('cz');setOn();
 stubVision(()=>({items:PAGE.map((p,i)=>({n:i+1,studentAnswer:i===6?'':p.a,studentWorking:''}))}));
 await post('mark',PHOTO);
 stubText(()=>({reply:'Look at the bottoms.',value:'0,9167'}));
 await post('explain',{transcript:'nula cela devet',n:6});
 assert.equal(store.getSession().practice.items[6].verdict,'unsure','a rounding said aloud is still unsure');
 stubText(()=>({reply:'Look at the bottoms.',value:'0,5'}));
 await post('explain',{transcript:'nula cela pet',n:6});
 assert.equal(store.getSession().practice.items[6].verdict,'wrong','0,5 is a half in cz, and 3/4 + 1/6 is not a half');
});

test('9: the Calculus explanation prompt is byte for byte what it was, and a linear item keeps its own',async()=>{
 const topic='calc1-rules',t=topicIn(topic),q='Differentiate f(x) = 3x^2 + 2x.',tr='I brought the power down';
 stubText(()=>({reply:'Look at the second term.',slip:'unclear',value:'6x + 2'}));
 const item={n:1,question:q,spec:{shape:'derivative',f:'3x^2 + 2x'},verdict:'unsure'};
 await X.explainItem(item,tr,topic,LEARNER,()=>false,12,'cz');
 const req=seenText[0];
 const system=`You are a calculus tutor listening to a first-year university student on the Calculus 1 course explain their own working out loud. `+
  `${X.EXPLAIN_WITHHOLD} `+
  `Point at the step they should look at again, or at the step that was the good one. `+
  `One or two sentences. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.`;
 const mem=learners.getLearner(LEARNER).memory;
 const prompt=`Topic: ${t.name}\n${t.blurb}\n\n`+
  `The question: ${q}\n\n`+
  `What the student said, transcribed from speech. The transcription may be rough or misheard — read it charitably `+
  `and answer what they meant:\n«${tr}»\n\n`+
  (mem.length?`What the desk has learned about this student:\n${mem.map((m)=>`- ${m}`).join('\n')}\n\n`:'')+
  `Reply to them in one or two sentences that point at the step, not the answer.\n\n`+
  `You may also name the mistake you heard, as an id from this list — or the word "unclear" if none of them fits `+
  `or their reasoning was sound:\n${M.slipVocabulary(topic)}\n\n`+
  `value: the final answer the student says they got, as plain text - an expression in x using ^ for powers, sqrt(), `+
  `e^, ln, sin, cos and so on, or a number or a fraction (six x plus two is 6x + 2, minus three is -3, seven halves is `+
  `7/2, x squared plus C is x^2 + C; include +C if they say it). Their answer, not yours — do not work it out. `+
  `An empty string if they did not say one.`;
 assert.equal(req.system,system,'the Calculus system prompt, unchanged (no age voice, whatever the age)');
 assert.equal(req.prompt,prompt,'the Calculus prompt, unchanged');
 assert.deepEqual(Object.keys(req.schema.properties).sort(),['reply','slip','value']);
 // a linear item: the school system in the learner's voice, the value of x, as before
 stubText(()=>({reply:'Look at the first line.',slip:'unclear',value:'6'}));
 await X.explainItem({n:1,question:'Solve for x: 3x - 7 = 11',verdict:'unsure'},'I added seven','linear-two-step',LEARNER,()=>false,12);
 assert.match(seenText[0].system,/listening to a school student explain/);assert.match(seenText[0].prompt,/the final value of x the student says they got/);
 assert.match(seenText[0].prompt,/^Topic: Two-step equations\n/);
});

// ------------------------------------------------------------------ 6. typed answers (Family W6): no camera, no model
const {working,lookAt}=require(src('maths/working.ts'));
const {sheetTiles,firstToLook}=require(src('tv/sheetRows.ts'));
const throwing=(what)=>()=>{throw new Error(`${what}: a typed mark must not call a model`);};
const noModel=()=>{stubVision(throwing('vision'));stubText(throwing('text'));};
const raw=(body)=>route('mark').POST(new Request('http://desk/api/mark',{method:'POST',body:typeof body==='string'?body:JSON.stringify(body)}));
const deskWords=(msg)=>{assert.match(msg,/^[A-Z][^]*[.?]$/,`a plain sentence: ${msg}`);assert.doesNotMatch(msg,/[—–]|undefined|\[object|Error/,`no dash, no leak: ${msg}`);};
const typedOf=()=>PAGE.map((p)=>p.a);
/** The set as it stands on the desk after a mark, reduced to what a verdict is: no working, which only a photo has. */
const verdicts=()=>store.getSession().practice.items.map((it)=>({n:it.n,verdict:it.verdict,slip:it.slip,said:it.said,studentAnswer:it.studentAnswer}));
const lastLine=()=>learners.getLearner(LEARNER).history.filter((e)=>e.kind==='practice').pop();

test('10: POST /api/mark takes a photo XOR typed answers - a table of what is refused in a plain sentence, and what is not',async()=>{
 seat('uk');setOn();noModel();
 const n=PAGE.length,ok=Array.from({length:n},()=>'1');
 const A9=Array.from({length:n},(_,i)=>String(i));
 const refused=[
  ['both a photo and answers',{...PHOTO,answers:ok},/photo and typed answers together/],
  ['neither',{},/neither a photo/],
  ['neither, only the size',{w:1,h:1},/neither a photo/],
  ['too few answers',{answers:ok.slice(0,n-1)},/has 9 questions and 8 answers/],
  ['too many for the set',{answers:[...ok,'1']},/has 9 questions and 10 answers/],
  ['more than the cap',{answers:Array.from({length:13},()=>'1')},/more than 12 answers/],
  ['a number among them',{answers:[...A9.slice(0,3),4,...A9.slice(4)]},/not text/],
  ['a null among them',{answers:[...A9.slice(0,3),null,...A9.slice(4)]},/not text/],
  ['an object among them',{answers:[...A9.slice(0,3),{a:1},...A9.slice(4)]},/not text/],
  ['answers that are a string',{answers:'11/12'},/as a list/],
  ['answers that are null',{answers:null},/as a list/],
  ['answers that are an object',{answers:{0:'1'}},/as a list/],
  ['an empty list',{answers:[]},/has 9 questions and 0 answers/],
  ['an answer of 41 characters',{answers:[...A9.slice(0,2),'1'.repeat(41),...A9.slice(3)]},/Answer 3 is longer than 40 characters/],
  ['a body that is not JSON','{no',/did not get a photo/],
  ['a body that is an array','[1]',/neither a photo/],
 ];
 for(const [why,body,words] of refused){
  const r=await raw(body);assert.equal(r.status,400,why);
  const msg=(await r.json()).error;assert.match(msg,words,why);deskWords(msg);
  assert.equal(store.getSession().practice.marked,false,`${why}: the set is still open`);
  assert.equal(store.getSession().jobs?.mark,undefined,`${why}: no job was started`);
 }
 assert.equal(seenVision.length+seenText.length,0,'a refusal calls no model');
 assert.equal(learners.getLearner(LEARNER).skills[UNIT]?.seen??0,0,'and records nothing');
 // the cap is inclusive: an answer of exactly 40 characters is taken whole (and is not sure, being no number)
 const r40=await raw({answers:[...A9.slice(0,2),'1'.repeat(40),...A9.slice(3)]});assert.equal(r40.status,200,'40 characters is allowed');
 assert.equal(store.getSession().practice.items[2].studentAnswer.length,40,'kept whole, never cut');
 // a set already marked is refused before anything; and no set at all is a plain 400
 const again=await raw({answers:typedOf()});assert.equal(again.status,409);assert.match((await again.json()).error,/already marked/);
 store.dispatch({type:'practice.clear'});
 const none=await raw({answers:typedOf()});assert.equal(none.status,400);assert.match((await none.json()).error,/no practice set/);
 // valid: 200, the counts code decided, "code" as the provider, no time spent, no model
 seat('uk');setOn();noModel();
 const good=await raw({answers:typedOf()});assert.equal(good.status,200);
 const body=await good.json();
 assert.deepEqual([body.right,body.wrong,body.unsure,body.provider,body.ms],[1,5,3,'code',0]);
 assert.equal(seenVision.length+seenText.length,0,'no model call on the way');
});

test('11: a typed set is marked as a photographed one is fed the same strings - same verdicts, slips, lines, record - and calls no model (uk, cz, us)',async()=>{
 for(const system of ['uk','cz','us']){
  // the photo path, the vision reader stubbed to read exactly these strings
  seat(system);setOn();
  stubVision(()=>({items:PAGE.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:''}))}));
  assert.equal((await post('mark',PHOTO)).status,200);
  const photo=verdicts(),photoLine=lastLine().detail,photoSkill={...learners.getLearner(LEARNER).skills[UNIT]};
  // the typed path, with every engine that could read a photo made to throw
  seat(system);setOn();noModel();
  const r=await post('mark',{answers:typedOf()});
  assert.equal(r.status,200,system);
  assert.equal(seenVision.length,0,'no vision call');assert.equal(seenText.length,0,'no text call');
  const typed=verdicts();
  assert.deepEqual(typed,photo,`${system}: every item is judged as the photo path judges the same strings`);
  PAGE.forEach((p,i)=>{
   const [verdict,slip]=p[system];
   assert.equal(typed[i].verdict,verdict,`${system} #${i+1} "${p.a||'(blank)'}"`);assert.equal(typed[i].slip,slip,`${system} #${i+1}: the slip code detected`);
  });
  // the history line: the same form as a photographed set's, "k of n right, u not sure"
  assert.equal(lastLine().detail,photoLine);assert.match(lastLine().detail,/^\d+ of 9 right(, \d+ not sure)?$/);
  assert.equal(lastLine().label,'Add and subtract fractions');
  const sk=learners.getLearner(LEARNER).skills[UNIT];
  assert.equal(sk.seen,photoSkill.seen,'the same attempts reach the learner record');assert.equal(sk.right,photoSkill.right);
  assert.equal(sk.seen,PAGE.filter((p)=>p[system][0]!=='unsure').length,'only settled items count');
  // what the item carries: the typed string as the answer, no working, no pen, its spec kept
  store.getSession().practice.items.forEach((it,i)=>{
   assert.equal(it.studentAnswer,PAGE[i].a);assert.equal(it.studentWorking,'');assert.equal(it.slipAt,undefined,'no pen position');assert.deepEqual(it.spec,PAGE[i].spec);
  });
  assert.equal(store.getSession().screen,'sheet','the TV lands on the sheet, as after a photo');assert.equal(store.getSession().practice.marked,true);
  assert.equal(store.getSession().jobs.mark.phase,'done');
 }
});

test('12: a typed decimal comma is read by the seated learner\'s system: 0,75 is right in cz and de, not sure in us and uk; a lone point before three digits in cz is not guessed; a blank is not sure',async()=>{
 const cases=[['cz','0,75','right'],['de','0,75','right'],['us','0,75','unsure'],['uk','0,75','unsure'],['us','0.75','right'],['uk','0.75','right'],['cz','1.500','unsure']];
 for(const [system,a,verdict] of cases){
  seat(system);store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,items:[{n:1,question:question(Cq),spec:Cq,tier:1}]}});noModel();
  assert.equal((await post('mark',{answers:[a]})).status,200);
  assert.equal(store.getSession().practice.items[0].verdict,verdict,`${system} "${a}"`);
  assert.equal(store.getSession().practice.items[0].studentAnswer,a);
 }
 // a blank is unsure in every system, never wrong, and records no attempt
 seat('cz');store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,items:[{n:1,question:question(A),spec:A,tier:1}]}});noModel();
 await post('mark',{answers:['   ']});
 const it=store.getSession().practice.items[0];
 assert.deepEqual([it.verdict,it.said,it.studentAnswer,it.slip],['unsure',M.ASK(1),'',undefined],'whitespace only is a blank');
 assert.equal(learners.getLearner(LEARNER).skills[UNIT]?.seen??0,0);
 assert.equal(lastLine().detail,'0 of 1 right, 1 not sure');
 // a newline or tab typed into a box is the keyboard's: the answer is read on one line
 seat('uk');store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,items:[{n:1,question:question(A),spec:A,tier:1}]}});noModel();
 await post('mark',{answers:[' 11/12\n\t']});
 assert.deepEqual([store.getSession().practice.items[0].verdict,store.getSession().practice.items[0].studentAnswer],['right','11/12']);
});

test('13: a Calculus set typed in x^2 style is settled by checkAnswer as its photo is; a blank and a junk answer are not sure',async()=>{
 const topic='calc1-rules';
 const ITEMS=[['3x^2 + 2x','6x + 2','right'],['3x^2 + 2x','6x^2 + 2','wrong'],['x^3','3x²','right'],['x^3','3*x^2','right'],['x^3','banana','unsure'],['x^3','','unsure']];
 const set=()=>store.dispatch({type:'practice.set',practice:{topic,marked:false,items:ITEMS.map(([f],i)=>{const spec={shape:'derivative',f};return {n:i+1,question:C.question(spec).plain,spec};})}});
 seat('uk');set();
 stubVision(()=>({items:ITEMS.map(([,a],i)=>({n:i+1,studentAnswer:a,studentWorking:'',slip:'unclear'}))}));
 await post('mark',PHOTO);const photo=verdicts(),photoLine=lastLine().detail;
 seat('uk');set();noModel();
 const r=await post('mark',{answers:ITEMS.map((x)=>x[1])});assert.equal(r.status,200);
 assert.equal(seenVision.length+seenText.length,0);
 assert.deepEqual(verdicts(),photo,'the same verdicts, slips and words as the photo path');
 assert.deepEqual(verdicts().map((v)=>v.verdict),ITEMS.map((x)=>x[2]));
 assert.equal(lastLine().detail,photoLine);assert.equal(lastLine().detail,'3 of 6 right, 2 not sure');
 assert.equal(lastLine().label,topicIn(topic).name);
 assert.ok(store.getSession().practice.items.every((it)=>it.slipAt===undefined&&it.studentWorking===''));
});

test('14: a linear item (no spec) is settled by the substitution rule from the typed value; anything the desk cannot solve by itself is not sure',async()=>{
 const topic='linear-two-step';
 const ITEMS=[['2x + 3 = 11','4','right'],['2x + 3 = 11','x = 4','right'],['2x + 3 = 11','x=4','right'],['3x + 7 = 1','-2','right'],['2x + 3 = 11','5','wrong'],['2x + 3 = 11','8x','unsure'],
  ['2x + 3 = 11','about four','unsure'],['2x + 3 = 11','','unsure'],['2(x + 1) = 2x + 2','7','unsure'],['2x + 1 = 2x + 3','1','unsure'],['Explain why 2x + 3 = 11','4','unsure']];
 seat('uk');
 store.dispatch({type:'practice.set',practice:{topic,marked:false,items:ITEMS.slice(0,6).map(([q],i)=>({n:i+1,question:q}))}});
 noModel();
 assert.equal((await post('mark',{answers:ITEMS.slice(0,6).map((x)=>x[1])})).status,200);
 assert.deepEqual(store.getSession().practice.items.map((i)=>i.verdict),ITEMS.slice(0,6).map((x)=>x[2]));
 const wrong=store.getSession().practice.items[4];
 assert.equal(wrong.slipAt,undefined,'a wrong typed value has no pen position: there is no working to put it on');
 assert.equal(wrong.said,M.ASK(5),'a wrong item with no slip asks how they got there');assert.equal(wrong.slip,undefined);
 assert.equal(wrong.studentAnswer,'5');assert.equal(wrong.studentWorking,'');
 assert.equal(store.getSession().practice.items[1].studentAnswer,'x = 4','the answer is kept as typed');
 assert.equal(lastLine().detail,'4 of 6 right, 1 not sure');assert.equal(lastLine().label,'Two-step equations');
 assert.equal(learners.getLearner(LEARNER).skills[topic].seen,5,'five settled items reach the record; the unsure one does not');
 // an equation the desk cannot solve on its own (an identity, a contradiction, words) settles nothing whatever is typed
 seat('uk');
 store.dispatch({type:'practice.set',practice:{topic,marked:false,items:ITEMS.slice(6).map(([q],i)=>({n:i+1,question:q}))}});
 assert.equal((await post('mark',{answers:ITEMS.slice(6).map((x)=>x[1])})).status,200);
 assert.deepEqual(store.getSession().practice.items.map((i)=>i.verdict),ITEMS.slice(6).map((x)=>x[2]));
 assert.equal(learners.getLearner(LEARNER).skills[topic]?.seen??0,0,'no attempt from an unsure item');
});

test('15: an item with an answer and no located slip draws on the sheet and the walk without breaking, on every kind of set',async()=>{
 const kinds=[
  [UNIT,PAGE.map((p,i)=>({n:i+1,question:question(p.spec),spec:p.spec,tier:1})),typedOf()],
  ['calc1-rules',[['3x^2 + 2x'],['3x^2 + 2x'],['x^3']].map(([f],i)=>{const spec={shape:'derivative',f};return {n:i+1,question:C.question(spec).plain,spec};}),['6x + 2','6x','']],
  ['linear-two-step',['2x + 3 = 11','2x + 3 = 11','2x + 3 = 11'].map((q,i)=>({n:i+1,question:q})),['4','5','']],
 ];
 for(const [topic,items,answers] of kinds){
  seat('uk');store.dispatch({type:'practice.set',practice:{topic,marked:false,items}});noModel();
  assert.equal((await post('mark',{answers})).status,200,topic);
  const p=store.getSession().practice;
  assert.equal(sheetTiles(p).length,items.length);assert.ok(firstToLook(p.items)<=items.length);
  for(const it of p.items){
   const w=working(it),look=lookAt(it,'the line');
   if(it.verdict==='right'){assert.equal(w.lines.length,1,'the answer is the one line');assert.equal(w.ticks[0],true,'a right answer is ticked');}
   if(it.verdict==='wrong'){assert.equal(w.placed,'answer',`${topic} #${it.n}: no located slip, so the answer line is marked`);assert.deepEqual(w.mark,{kind:'line'});assert.equal(look,'Look at the line.','the card points in words, not at a pen');}
   if(it.verdict==='unsure'){assert.equal(w.placed,null,'unsure is drawn without a mark');assert.equal(look,null);}
   if(!it.studentAnswer)assert.deepEqual(w.lines,[],'a blank answer has no line to draw');
  }
 }
});

// ------------------------------------------------------------------ 7. Family W7 batch 1: three more fractions units, read, withheld and marked
const ms=(expr)=>({shape:'missing',expr}),sm=(expr)=>({shape:'simplify',expr}),fo=(expr,unit)=>({shape:'fraction-of',expr,...(unit?{unit}:{})});
/** [task text, the spec it reads as (null: refused)] per unit; a spec's value is worked in school-rules-test. */
const W7_TASKS={
 'frac-equivalent':[
  ['Fill in the missing number: 3/4 = ?/12.',ms('3/4 = ?/12')],['3/4 = ?/12',ms('3/4 = ?/12')],['3/4 = □/12',ms('3/4 = ?/12')],['3/4 = __/12',ms('3/4 = ?/12')],
  ['3/4 = ?/12.',ms('3/4 = ?/12')],['Complete: 3/4 = ?/12',ms('3/4 = ?/12')],['1. 3/4 = ?/12',ms('3/4 = ?/12')],['3/4 = 9/?',ms('3/4 = 9/?')],
  ['Copy and complete 2/5 = ?/20',ms('2/5 = ?/20')],['Write 3/4 with a denominator of 12',ms('3/4 = ?/12')],['Write 3/4 as a fraction with denominator 12',ms('3/4 = ?/12')],
  ['Write 3/4 as an equivalent fraction with a denominator of 12.',ms('3/4 = ?/12')],['Write 3/4 with a numerator of 9',ms('3/4 = 9/?')],['¾ = ?/12',ms('3/4 = ?/12')],
  ['12/16 = ?/4',ms('12/16 = ?/4')],['Simplify 18/24',sm('18/24')],['Simplify 18/24 fully.',sm('18/24')],['Write 18/24 in its simplest form.',sm('18/24')],
  ['Write 18/24 in simplest form',sm('18/24')],['Reduce 18/24 to lowest terms',sm('18/24')],['Reduce 18/24',sm('18/24')],['Cancel 18/24 down',sm('18/24')],
  ['Express 18/24 in its lowest terms.',sm('18/24')],['Simplify: 18/24',sm('18/24')],['(c) Simplify 15/20',sm('15/20')],['Cancel 18/24',sm('18/24')],
  // refused
  ['Simplify 3/4',null],['Simplify 18/12',null],['3/4 = ?/13',null],['3/4 = ?/?',null],['3/4 = 9/12',null],['? = 9/12',null],['?/4 = 9/12',null],
  ['3/4 = ?/12 = ?/16',null],['Simplify 18/24 + 1/2',null],['Simplify x/24',null],['Simplify 1 2/4',null],['Simplify 18/0',null],['Simplify 0.75',null],
  ['Simplify 18:24',null],['Write 3/4 with a denominator of 10',null],['3/4 = ?/4',null],['Simplify 18/24 and 6/8',null],['Write 18/24 as a decimal',null],
  ['Simplify 018/24',null],['Simplify the fraction',null],['3/4 = ? / 12 please',null],
 ],
 'frac-of-amount':[
  ['Find 3/5 of 40.',fo('3/5 of 40')],['Find 3/5 of 40',fo('3/5 of 40')],['3/5 of 40',fo('3/5 of 40')],['What is 3/5 of 40?',fo('3/5 of 40')],['Work out 3/5 of 40',fo('3/5 of 40')],
  ['Calculate 3/5 of 40',fo('3/5 of 40')],['Find 3/5 of 40 kg.',fo('3/5 of 40','kg')],['Find 3/4 of £60',fo('3/4 of 60','£')],['What is 3/4 of €60?',fo('3/4 of 60','€')],
  ['Find 3/4 of 60 minutes',fo('3/4 of 60','min')],['Find 2/3 of 60 metres',fo('2/3 of 60','m')],['Find 3/5 of 40 sweets',fo('3/5 of 40')],['3/5 x 40',fo('3/5 of 40')],
  ['3/5 × 40',fo('3/5 of 40')],['Work out 3/5 × 40',fo('3/5 of 40')],['40 × 3/5',fo('3/5 of 40')],['3/5 * 40',fo('3/5 of 40')],['2) Find 3/5 of 40',fo('3/5 of 40')],
  ['Find 3/4 of 10',fo('3/4 of 10')],['Find 3/5 of 40 pupils.',fo('3/5 of 40')],['Find ⅗ of 40',fo('3/5 of 40')],['Find 5/8 of €72.',fo('5/8 of 72','€')],
  // refused
  ['Find 3/5 of 40 and 1/2 of 10',null],['Find 3/5 of x',null],['Find 3/5 of',null],['Find 5/3 of 40',null],['Find 3/0 of 40',null],['3/5 of 40 = 24',null],
  ['Find three fifths of 40',null],['Find 60% of 40',null],['Find 0.6 of 40',null],['Find 3/5 of 40.5',null],['Find 3/5 of 1,000',null],['Find 3/5 of 40 percent',null],
  ['Find 3/5 of 40 kg in grams',null],['Find 1/2 of 3/4',null],['Find 3/5 of 60p',null],['Find 3/5 of 40 pounds',null],['Find 3/5 of 40 x',null],['Find 3/5 of 040',null],['3/5 : 40',null],
 ],
 'frac-mul-div':[
  ['Work out 2/3 × 3/4.',cs('2/3 × 3/4')],['2/3 × 3/4',cs('2/3 × 3/4')],['2/3 x 3/4',cs('2/3 × 3/4')],['2/3 * 3/4',cs('2/3 × 3/4')],['2/3 times 3/4',cs('2/3 × 3/4')],
  ['Calculate 2/3 × 3/4',cs('2/3 × 3/4')],['What is 2/3 × 3/4?',cs('2/3 × 3/4')],['Multiply 2/3 by 3/4',cs('2/3 × 3/4')],['Multiply 2/3 and 3/4',cs('2/3 × 3/4')],
  ['Find the product of 2/3 and 3/4',cs('2/3 × 3/4')],['3/4 ÷ 1/2',cs('3/4 ÷ 1/2')],['Work out 3/4 ÷ 1/2',cs('3/4 ÷ 1/2')],['3/4 divided by 1/2',cs('3/4 ÷ 1/2')],
  ['Divide 3/4 by 1/2',cs('3/4 ÷ 1/2')],['Work out 2/3 × 3/4. Give your answer in its simplest form.',cs('2/3 × 3/4',{form:'simplest'})],['2/3 × 3/4 =',cs('2/3 × 3/4')],
  ['2/3 × 3/4 = ?',cs('2/3 × 3/4')],['(a) 2/3 × 3/4',cs('2/3 × 3/4')],['⅔ × ¾',cs('2/3 × 3/4')],['Evaluate 5/6 ÷ 2/3',cs('5/6 ÷ 2/3')],
  // refused
  ['2/3 × 3/4 × 1/2',null],['1 1/2 × 2/3',null],['2/3 × 3/4 = 1/2',null],['3/4 : 1/2',null],['Divide 3/4 into 1/2',null],['2/3 ÷ 2',null],['3/4 ÷ 0/2',null],
  ['2x/3 × 3/4',null],['(2/3) × (3/4)',null],['2/3 × 3/4 please',null],['Multiply 2/3 by 3/4 by 1/2',null],['2/3 ÷ 3/1',null],['Find the quotient of 3/4 and 1/2',null],['2/3 of 3/4',null],
 ],
};
const W7GEN={'frac-equivalent':S.genEquivalent,'frac-of-amount':S.genOfAmount,'frac-mul-div':S.genMulDiv};
for(const unit of Object.keys(W7_TASKS)){
 const rows=W7_TASKS[unit];
 test(`W7 4-${unit}: specFromQuestion reads the unit's tasks conservatively - ${rows.length} phrasings, ${rows.filter((t)=>t[1]===null).length} of them refused`,()=>{
  assert.ok(rows.length>=25&&rows.filter((t)=>t[1]===null).length>=10);
  for(const [text,want] of rows){
   const got=S.specFromQuestion(text);
   if(want===null){assert.equal(got,null,`refused: ${JSON.stringify(text)}`);continue;}
   assert.deepEqual(got,want,text);
   assert.ok(S.wellFormed(got).ok);assert.equal(S.unitOf(got),unit,`${text} is a ${unit} task`);
   assert.equal(C.specFromQuestion(text),null,`${text}: not a Calculus task`);
  }
  // every question a set prints reads back to its own spec
  for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=W7GEN[unit](seed,tier);assert.deepEqual(S.specFromQuestion(S.question(sp).plain),sp,`${unit} ${tier}/${seed}`);}
 });
 test(`W7 5-${unit}: the withheld sentence names the unit's method, carries no number, and leaks nothing on any generated item`,()=>{
  const line=S.SCHOOL_WITHHELD[unit];
  assert.equal(typeof line,'string');assert.doesNotMatch(line,/\d/);assert.match(line,/The answer is yours to work out\.$/);
  for(const other of Object.keys(S.SCHOOL_UNIT_SLIPS))if(other!==unit)assert.notEqual(S.SCHOOL_WITHHELD[other],line,'each unit has its own line');
  for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=W7GEN[unit](seed,tier);assert.equal(S.leaksSchool(sp,line),false,`${unit} ${tier}/${seed}`);assert.equal(S.withheldSchool(sp),line);}
  for(const [,sp] of rows.filter((r)=>r[1]))assert.equal(S.withheldSchool(sp),line);
 });
}

/** A full set per unit: right, each of its slips, unsure, blank. Expected verdicts worked by hand (school-rules-test comments). */
const W7_PAGES={
 'frac-equivalent':[
  {spec:ms('3/4 = ?/12'),a:'9',want:['right']},{spec:ms('3/4 = ?/12'),a:'11',want:['wrong','added-same']},{spec:ms('6/8 = ?/12'),a:'6',want:['wrong','one-part-only']},
  {spec:ms('3/4 = ?/12'),a:'36',want:['wrong','wrong-factor']},{spec:sm('18/24'),a:'9/12',want:['unsure']},{spec:sm('18/24'),a:'',want:['unsure']},
  {spec:sm('18/24'),a:'3/4',want:['right']},{spec:ms('3/4 = 15/?'),a:'15/20',want:['right']},{spec:ms('3/4 = ?/12'),a:'0.75',want:['unsure']},{spec:sm('15/20'),a:'3/20',want:['wrong','one-part-only']},
 ],
 'frac-of-amount':[
  {spec:fo('3/5 of 40'),a:'24',want:['right']},{spec:fo('3/5 of 40'),a:'66.67',want:['wrong','of-upside-down']},{spec:fo('3/5 of 40'),a:'8',want:['wrong','of-one-part']},
  {spec:fo('3/5 of 40'),a:'120',want:['wrong','of-not-divided']},{spec:fo('3/5 of 40'),a:'16',want:['wrong','of-rest']},{spec:fo('3/4 of 60','kg'),a:'45 kg',want:['right']},
  {spec:fo('3/4 of 60','kg'),a:'45 g',want:['unsure']},{spec:fo('5/8 of 72','€'),a:'',want:['unsure']},{spec:fo('5/8 of 72','€'),a:'€45',want:['right']},
 ],
 'frac-mul-div':[
  {spec:cs('2/3 × 3/4'),a:'1/2',want:['right']},{spec:cs('2/3 × 3/4'),a:'17/12',want:['wrong','added-not-multiplied']},{spec:cs('3/4 ÷ 1/2'),a:'3/8',want:['wrong','kept-second']},
  {spec:cs('3/4 ÷ 1/2'),a:'2/3',want:['wrong','flipped-first']},{spec:cs('2/3 × 3/4'),a:'6/7',want:['wrong','bottoms-added']},{spec:cs('3/4 ÷ 1/2'),a:'1 1/2',want:['right']},
  {spec:cs('2/5 ÷ 3/4'),a:'0.533',want:['unsure']},{spec:cs('2/3 × 3/4'),a:'',want:['unsure']},{spec:cs('5/6 ÷ 2/3'),a:'1.25',want:['right']},
 ],
};
for(const unit of Object.keys(W7_PAGES)){
 const page=W7_PAGES[unit];
 test(`W7 6-${unit}: a full set (right, every slip, unsure, blank) is marked by code the same from a read photo and from typed answers, and calls no model when typed`,async()=>{
  const ids=[...new Set(page.filter((p)=>p.want[1]).map((p)=>p.want[1]))];
  assert.deepEqual(ids.sort(),[...S.SCHOOL_UNIT_SLIPS[unit]].sort(),'the set shows every slip of the unit');
  assert.ok(page.some((p)=>p.want[0]==='right')&&page.some((p)=>p.want[0]==='unsure')&&page.some((p)=>!p.a),'right, unsure and blank are on it');
  assert.deepEqual(M.slipsFor(unit).map((s)=>s.id),[...S.SCHOOL_UNIT_SLIPS[unit]],'slipsFor is the unit\'s closed list');
  const put=()=>store.dispatch({type:'practice.set',practice:{topic:unit,marked:false,items:page.map((p,i)=>({n:i+1,question:question(p.spec),spec:p.spec,tier:1}))}});
  // the photo path: the vision reader stubbed to read exactly these strings (and to volunteer a verdict, a solution and a slip, never read)
  seat('uk');put();
  stubVision(()=>({items:page.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:'',verdict:'right',solution:'1',slip:'tops-and-bottoms'}))}));
  stubText(()=>{throw new Error('no text call while marking');});
  assert.equal((await post('mark',PHOTO)).status,200);
  assert.equal(seenVision.length,1);assert.equal(seenText.length,0);
  assert.match(seenVision[0].prompt,/school maths questions/);
  const photo=verdicts(),photoSkill={...learners.getLearner(LEARNER).skills[unit]};
  // the typed path: every engine that could read a photo made to throw
  seat('uk');put();noModel();
  const r=await post('mark',{answers:page.map((p)=>p.a)});
  assert.equal(r.status,200);assert.equal(seenVision.length+seenText.length,0,'no model call');
  const body=await r.json();assert.equal(body.provider,'code');
  const typed=verdicts();
  assert.deepEqual(typed,photo,'the same verdicts, slips and lines from a photo and from typing');
  page.forEach((p,i)=>{
   const [verdict,slip]=p.want,it=typed[i];
   assert.equal(it.verdict,verdict,`#${i+1} ${JSON.stringify(p.a)} on ${p.spec.expr}`);assert.equal(it.slip,slip,`#${i+1}: the slip code detected`);
   if(verdict==='right')assert.equal(it.said,M.RIGHT(i+1));else if(slip)assert.equal(it.said,S.SCHOOL_SLIPS.find((x)=>x.id===slip).says);else assert.equal(it.said,M.ASK(i+1));
  });
  const settledN=page.filter((p)=>p.want[0]!=='unsure').length,right=page.filter((p)=>p.want[0]==='right').length;
  const sk=learners.getLearner(LEARNER).skills[unit];
  assert.equal(sk.seen,settledN,'only settled items reach the record');assert.equal(sk.seen,photoSkill.seen);assert.equal(sk.right,right);
  assert.deepEqual([...sk.slips].sort(),[...new Set(page.filter((p)=>p.want[1]).map((p)=>p.want[1]))].sort(),'the record keeps the slips code named');
  assert.equal(lastLine().detail,`${right} of ${page.length} right, ${page.length-settledN} not sure`);
  assert.equal(lastLine().label,topicIn(unit)?.name??unit,'the history line names the unit as the path does');
  store.getSession().practice.items.forEach((it,i)=>assert.deepEqual(it.spec,page[i].spec,'the spec survives marking'));
 });
}

test('W7 8: a hint on each new unit\'s task names the unit in its stance, and a hint that gives the answer away twice becomes the unit\'s own fixed sentence',async()=>{
 const CASES=[
  ['frac-equivalent','Fill in the missing number: 3/4 = ?/12.','Multiply 3 by 3 to get 9.','What was 4 multiplied by to make 12?'],
  ['frac-equivalent','Simplify 18/24','It is three quarters.','Which numbers go into both 18 and 24?'],
  ['frac-of-amount','Find 3/5 of 40 kg.','8 x 3 = 24, so 24 kg.','Divide 40 by 5 first.'],
  ['frac-mul-div','Work out 3/4 ÷ 1/2.','It comes to one and a half.','Turn the fraction you divide by upside down, then multiply 3/4 by 2/1.'],
 ];
 for(const [unit,task,leaky,clean] of CASES){
  stubText(()=>({hint:leaky,what_to_try_next:'Write it down.'}));
  let h=await H.hint('maths',task,{path:'school',age:12});
  assert.equal(seenText.length,2,`${task}: asked, then asked again once`);
  assert.equal(h.hint,S.SCHOOL_WITHHELD[unit],`${task}: the unit's own line`);assert.equal(h.next,'');
  assert.match(seenText[0].system,new RegExp(`This sheet is the unit "${topicIn(unit).name}"; prefer the unit's methods over heavier ones\.`),`${task}: the stance names the unit`);
  assert.match(seenText[0].system,/a learner aged 11 to 13/,'the W2 young voice');
  stubText(()=>({hint:clean,what_to_try_next:'Write your working under the question.'}));
  h=await H.hint('maths',task,{path:'school',age:12});
  assert.equal(seenText.length,1,`${task}: a legit hint passes on the first ask`);assert.equal(h.hint,clean);
 }
});
