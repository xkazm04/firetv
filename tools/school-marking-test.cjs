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
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-school-marking-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const S=require(src('lib/rules/school.ts'));
const C=require(src('lib/rules/calc.ts'));
const M=require(src('lib/rules/maths.ts'));
/** The line on an item that is neither right nor slipped: a blank has no answer yet, an unsure one gives the engine's reason, a wrong one with no slip asks. */
const elseLine=(verdict,a,n)=>verdict!=='unsure'?M.ASK(n):a.trim()===''?M.BLANK(n):null;
const assertElse=(it,verdict,a,n,msg)=>{const want=elseLine(verdict,a,n);if(want!==null)return assert.equal(it.said,want,msg);assert.ok(it.said.startsWith(`The desk is not sure about number ${n}. `)&&!it.said.endsWith('How did you get there?'),`${msg||''} ${it.said}`);};
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
   else assertElse(it,verdict,p.a,i+1,'unsure says why, a blank has no answer yet, wrong with no known slip asks');
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
 // W7 batch 2: '0.5 + 0.25' (refused in W5b) reads as "Add, subtract and multiply decimals" now; its row is in W7b 4 below
 ['3 + 4',null],['1/2 + 1/3 + 1/4',null],['three quarters plus one sixth',null],['3/4 + x',null],['Solve x + 1/2 = 3/4',null],
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
 assert.match(seenText[0].system,/This is a school maths task; prefer the simplest method/,'an unread task gets the neutral stance (HL2)');assert.doesNotMatch(seenText[0].system,/factoring/);
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
  ['an empty image',{image:'',w:100,h:100},/did not get a photo/],
  ['an image that is a number',{image:123,w:100,h:100},/did not get a photo/],
  ['an image that is null',{image:null,w:100,h:100},/did not get a photo/],
  ['a data URL with no data',{image:'data:image/jpeg;base64,',w:100,h:100},/did not get a photo/],
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
 const none=await raw({answers:typedOf()});assert.equal(none.status,400);assert.match((await none.json()).error,/Start a practice set/);
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
 assert.deepEqual([it.verdict,it.said,it.studentAnswer,it.slip],['unsure',M.BLANK(1),'',undefined],'whitespace only is a blank');
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
  // W7 batch 3: 'Simplify 18:24' (refused here in batch 1) reads as "Ratio and sharing" now; its row is in W7c 4
  ['Write 3/4 with a denominator of 10',null],['3/4 = ?/4',null],['Simplify 18/24 and 6/8',null],['Write 18/24 as a decimal',null],
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
  // W7 batch 2: 'Find 60% of 40' (refused here in batch 1) reads as "A percent of an amount" now; its row is in W7b 4
  ['Find three fifths of 40',null],['Find 0.6 of 40',null],['Find 3/5 of 40.5',null],['Find 3/5 of 1,000',null],['Find 3/5 of 40 percent',null],
  ['Find 3/5 of 40 kg in grams',null],['Find 1/2 of 3/4',null],['Find 3/5 of 60p',null],['Find 3/5 of 40 pounds',null],['Find 3/5 of 40 x',null],['Find 3/5 of 040',null],['3/5 : 40',null],
 ],
 'frac-mul-div':[
  ['Work out 2/3 × 3/4.',cs('2/3 × 3/4')],['2/3 × 3/4',cs('2/3 × 3/4')],['2/3 x 3/4',cs('2/3 × 3/4')],['2/3 * 3/4',cs('2/3 × 3/4')],['2/3 times 3/4',cs('2/3 × 3/4')],
  ['Calculate 2/3 × 3/4',cs('2/3 × 3/4')],['What is 2/3 × 3/4?',cs('2/3 × 3/4')],['Multiply 2/3 by 3/4',cs('2/3 × 3/4')],['Multiply 2/3 and 3/4',cs('2/3 × 3/4')],
  ['Find the product of 2/3 and 3/4',cs('2/3 × 3/4')],['3/4 ÷ 1/2',cs('3/4 ÷ 1/2')],['Work out 3/4 ÷ 1/2',cs('3/4 ÷ 1/2')],['3/4 divided by 1/2',cs('3/4 ÷ 1/2')],
  ['Divide 3/4 by 1/2',cs('3/4 ÷ 1/2')],['Work out 2/3 × 3/4. Give your answer in its simplest form.',cs('2/3 × 3/4',{form:'simplest'})],['2/3 × 3/4 =',cs('2/3 × 3/4')],
  ['2/3 × 3/4 = ?',cs('2/3 × 3/4')],['(a) 2/3 × 3/4',cs('2/3 × 3/4')],['⅔ × ¾',cs('2/3 × 3/4')],['Evaluate 5/6 ÷ 2/3',cs('5/6 ÷ 2/3')],['3/4 : 1/2',cs('3/4 ÷ 1/2')],
  // refused
  ['2/3 × 3/4 × 1/2',null],['1 1/2 × 2/3',null],['2/3 × 3/4 = 1/2',null],['Divide 3/4 into 1/2',null],['2/3 ÷ 2',null],['3/4 ÷ 0/2',null],
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
   if(verdict==='right')assert.equal(it.said,M.RIGHT(i+1));else if(slip)assert.equal(it.said,S.SCHOOL_SLIPS.find((x)=>x.id===slip).says);else assertElse(it,verdict,p.a,i+1);
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

// ------------------------------------------------------------------ 8. Family W7 batch 2: decimals and percent, read, withheld and marked
const cv=(expr,to)=>({shape:'convert',expr,to}),po=(expr,unit)=>({shape:'percent-of',expr,...(unit?{unit}:{})}),pc=(expr,unit)=>({shape:'percent-change',expr,...(unit?{unit}:{})});
/** [task text, the spec it reads as (null: refused)] per unit; each spec's value is worked in school-rules-test. */
const B2_TASKS={
 'dec-arith':[
  ['Work out 4.35 + 2.8',cs('4.35 + 2.8')],['Work out 4.35 + 2.8.',cs('4.35 + 2.8')],['4.35 + 2.8',cs('4.35 + 2.8')],['4.35 + 2.8 =',cs('4.35 + 2.8')],['4.35 + 2.8 = ?',cs('4.35 + 2.8')],
  ['Calculate 3.6 × 0.4',cs('3.6 × 0.4')],['3.6 x 0.4',cs('3.6 × 0.4')],['3.6 * 0.4',cs('3.6 × 0.4')],['3.6 times 0.4',cs('3.6 × 0.4')],['What is 7.5 - 2.25?',cs('7.5 - 2.25')],
  ['7.5 minus 2.25',cs('7.5 - 2.25')],['7.5 − 2.25',cs('7.5 - 2.25')],['Subtract 2.25 from 7.5',cs('7.5 - 2.25')],['Take 2.25 away from 7.5',cs('7.5 - 2.25')],['Add 4.35 and 2.8',cs('4.35 + 2.8')],
  ['Add 2.8 to 4.35',cs('2.8 + 4.35')],['Find the sum of 4.35 and 2.8',cs('4.35 + 2.8')],['Multiply 3.6 by 0.4',cs('3.6 × 0.4')],['Find the product of 3.6 and 0.4',cs('3.6 × 0.4')],
  ['Work out €4.35 + €2.80.',cs('4.35 + 2.80',{unit:'€'})],['£3.45 × 4',cs('3.45 × 4',{unit:'£'})],['(b) 12.6 + 0.75',cs('12.6 + 0.75')],['3. 0.7 × 0.3',cs('0.7 × 0.3')],
  ['Evaluate 8.45 - 2.3',cs('8.45 - 2.3')],['4 × 0.25',cs('4 × 0.25')],['0.5 + 0.25',cs('0.5 + 0.25')],
  // refused
  ['4.35 + 2.8 + 1.2',null],['4.35 + 2.8 = 7.15',null],['3.6 ÷ 0.4',null],['4,35 + 2,8',null],['3 + 4',null],['1/2 + 0.25',null],['4 × £3.45',null],['€4.35 + 2.80',null],
  ['€4.35 + £2.80',null],['2.25 - 7.5',null],['4.3567 + 1',null],['Work out 4.35 + 2.8 please',null],['Add 4.35',null],['A pen costs £1.35. How much do 4 pens cost?',null],
  ['4.35 + x',null],['3.6 : 0.4',null],['£3.45 × 4.5',null],['1.5.2 + 3',null],['4.35 + 2.8. Give your answer as a fraction.',null],['Work out 04.35 + 2.8',null],
 ],
 'dec-convert':[
  ['Write 3/8 as a decimal',cv('3/8','decimal')],['Write 3/8 as a decimal.',cv('3/8','decimal')],['Convert 3/8 to a decimal',cv('3/8','decimal')],['Change 3/8 into a decimal',cv('3/8','decimal')],
  ['Express 3/8 as a decimal',cv('3/8','decimal')],['What is 3/8 as a decimal?',cv('3/8','decimal')],['Write 7/20 as a percentage',cv('7/20','percent')],['Write 7/20 as a percent',cv('7/20','percent')],
  ['Convert 7/20 to a percentage.',cv('7/20','percent')],['Write 0.35 as a fraction',cv('0.35','fraction')],['Write 0.35 as a fraction in its simplest form.',cv('0.35','fraction')],
  ['What is 0.35 as a fraction?',cv('0.35','fraction')],['Write 0.35 as a fraction in lowest terms',cv('0.35','fraction')],['Express 0.6 as a percentage',cv('0.6','percent')],['Write 0.6 as a percent',cv('0.6','percent')],
  ['Change 35% into a decimal',cv('35%','decimal')],['Write 35% as a decimal',cv('35%','decimal')],['Write 35 % as a decimal',cv('35%','decimal')],['Write 35 percent as a fraction',cv('35%','fraction')],
  ['Write 12.5% as a fraction in its simplest form',cv('12.5%','fraction')],['Write 0.35 as a simplified fraction.',cv('0.35','fraction')],['(a) Write 3/8 as a decimal',cv('3/8','decimal')],['Write ⅜ as a decimal',cv('3/8','decimal')],['Turn 5/4 into a percentage',cv('5/4','percent')],
  ['Write 0.125 as a fraction',cv('0.125','fraction')],['Write 3 / 8 as a decimal',cv('3/8','decimal')],
  // refused
  ['Write 1/3 as a decimal',null],['Write 2/3 as a percentage',null],['Write 0.35 as a decimal',null],['Write 6/8 as a decimal',null],['Write 3/8 as a decimal to 2 decimal places',null],
  ['Write 3/8 as a decimal in its simplest form',null],['Write 0.50 as a fraction',null],['Write 100% as a decimal',null],['Write 0.35 as a fraction and a percentage',null],['Write 3 as a percentage',null],
  ['Write 0,35 as a fraction',null],['Write 35% as a decimal please',null],['Write 3/8 as a ratio',null],['A shop takes 35% off. Write this as a decimal.',null],['Write x/8 as a decimal',null],
  ['Write 0.3535 as a fraction',null],['What percentage is 7 out of 20?',null],['Write 12.25% as a fraction',null],
 ],
 'pct-of-amount':[
  ['Find 35% of 80',po('35% of 80')],['Find 35% of 80.',po('35% of 80')],['What is 35% of 80?',po('35% of 80')],['Work out 35% of 80',po('35% of 80')],['Calculate 35% of 80',po('35% of 80')],
  ['35% of 80',po('35% of 80')],['Find 35 % of 80',po('35% of 80')],['Find 35 percent of 80',po('35% of 80')],['Find 35 per cent of 80',po('35% of 80')],['Find 15% of €60',po('15% of 60','€')],
  ['What is 15% of £60?',po('15% of 60','£')],['Find 12% of 250 kg',po('12% of 250','kg')],['Find 12.5% of 40 kg',po('12.5% of 40','kg')],['Find 35% of 80 sweets',po('35% of 80')],
  ['Find 20% of 60 minutes',po('20% of 60','min')],['(c) Find 35% of 80',po('35% of 80')],['Find 35% of 80 metres',po('35% of 80','m')],['Find 5% of 20',po('5% of 20')],['Find 60% of 40',po('60% of 40')],
  ['find 35% of 80',po('35% of 80')],['Find 99% of €170',po('99% of 170','€')],['Calculate: 30% of 140',po('30% of 140')],['Find 35% of 7',po('35% of 7')],
  // refused
  ['Find 35% of 80 and 20% of 60',null],['What percentage of 80 is 28?',null],['Find 100% of 80',null],['Find 0% of 80',null],['Find 35% of 80.5',null],['Find 35% of 3/4',null],
  ['A jacket costs 80 euro. It goes down by 25%. What is the new price?',null],['Find 35% of 80 = 28',null],['Find 35%',null],['Find 35% of x',null],['Find 35% of 1,000',null],
  ['Find 35% of 80 pounds',null],['Find 150% of 80',null],['Find 35.25% of 80',null],['Find 12.5% of 7',null],['Find 20% of 100',null],['80 is 35% of what?',null],
 ],
 'pct-change':[
  ['Increase 60 by 15%',pc('increase 60 by 15%')],['Increase 60 by 15%.',pc('increase 60 by 15%')],['Increase 60 by 15 %',pc('increase 60 by 15%')],['Increase 60 by 15 percent',pc('increase 60 by 15%')],
  ['Increase 60 by 15 per cent',pc('increase 60 by 15%')],['Decrease 80 by 25%',pc('decrease 80 by 25%')],['Reduce 80 by 25%',pc('decrease 80 by 25%')],['Decrease €80 by 25%',pc('decrease 80 by 25%','€')],
  ['Increase £50 by 35%',pc('increase 50 by 35%','£')],['Reduce 250 kg by 12%',pc('decrease 250 by 12%','kg')],['What is 60 increased by 15%?',pc('increase 60 by 15%')],['Work out 80 decreased by 25%',pc('decrease 80 by 25%')],
  ['Calculate 80 reduced by 25%',pc('decrease 80 by 25%')],['60 increased by 15%',pc('increase 60 by 15%')],['(d) Increase 60 by 15%',pc('increase 60 by 15%')],['increase 60 by 15%',pc('increase 60 by 15%')],
  ['Increase 240 by 12.5%',pc('increase 240 by 12.5%')],['Increase 80 by 100%',pc('increase 80 by 100%')],['Decrease 140 by 30%',pc('decrease 140 by 30%')],['Increase 60 metres by 15%',pc('increase 60 by 15%','m')],
  ['Find 60 increased by 15%',pc('increase 60 by 15%')],
  // refused
  ['Increase 60 by 15',null],['Increase 60% by 15%',null],['Increase 60 by 15% then decrease by 10%',null],['A jacket costs 80 euro. It goes down by 25%. What is the new price?',null],
  ['60 is increased by 15%. Find the original amount.',null],['After a 15% increase a price is 69. Find the original price.',null],['Decrease 80 by 100%',null],['Decrease 80 by 150%',null],
  ['Increase 60.5 by 15%',null],['Increase 60 by 15.25%',null],['Increase 60 by 15% and 10%',null],['Increase x by 15%',null],['Increase 60 pounds by 15%',null],['Increase 60 by 0%',null],
  ['Increase 60 by 15% = 69',null],['Increase 1,000 by 15%',null],
 ],
};
const B2GEN={'dec-arith':S.genDecimal,'dec-convert':S.genConvert,'pct-of-amount':S.genPercentOf,'pct-change':S.genPercentChange};
for(const unit of Object.keys(B2_TASKS)){
 const rows=B2_TASKS[unit];
 test(`W7b 4-${unit}: specFromQuestion reads the unit's tasks conservatively - ${rows.length} phrasings, ${rows.filter((t)=>t[1]===null).length} of them refused`,()=>{
  assert.ok(rows.length>=25&&rows.filter((t)=>t[1]===null).length>=10);
  for(const [text,want] of rows){
   const got=S.specFromQuestion(text);
   if(want===null){assert.equal(got,null,`refused: ${JSON.stringify(text)}`);continue;}
   assert.deepEqual(got,want,text);
   assert.ok(S.wellFormed(got).ok);assert.equal(S.unitOf(got),unit,`${text} is a ${unit} task`);
   assert.equal(C.specFromQuestion(text),null,`${text}: not a Calculus task`);
  }
  for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=B2GEN[unit](seed,tier);assert.deepEqual(S.specFromQuestion(S.question(sp).plain),sp,`${unit} ${tier}/${seed}`);}
 });
 test(`W7b 5-${unit}: the withheld sentence names the unit's method, carries no number, and leaks nothing on any generated item`,()=>{
  const line=S.SCHOOL_WITHHELD[unit];
  assert.equal(typeof line,'string');assert.doesNotMatch(line,/\d/);assert.match(line,/The answer is yours to work out\.$/);
  for(const other of Object.keys(S.SCHOOL_UNIT_SLIPS))if(other!==unit)assert.notEqual(S.SCHOOL_WITHHELD[other],line,'each unit has its own line');
  for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=B2GEN[unit](seed,tier);assert.equal(S.leaksSchool(sp,line),false,`${unit} ${tier}/${seed}`);assert.equal(S.withheldSchool(sp),line);}
  for(const [,sp] of rows.filter((r)=>r[1]))assert.equal(S.withheldSchool(sp),line);
 });
}

/** A full set per unit: right, each of its slips, unsure, blank. Expected verdicts worked by hand (school-rules-test comments). */
const B2_PAGES={
 'dec-arith':[
  {spec:cs('4.35 + 2.8'),a:'7.15',want:['right']},{spec:cs('4.35 + 2.8'),a:'4.63',want:['wrong','dec-lined-up']},{spec:cs('3.6 × 0.4'),a:'14.4',want:['wrong','dec-point-product']},
  {spec:cs('3.6 × 0.4'),a:'144',want:['wrong','dec-point-dropped']},{spec:cs('4.35 + 2.80',{unit:'€'}),a:'€7.15',want:['right']},{spec:cs('3.45 × 4',{unit:'£'}),a:'£13.8',want:['right']},
  {spec:cs('4.35 + 2.8'),a:'7.2',want:['unsure']},{spec:cs('3.6 × 0.4'),a:'',want:['unsure']},{spec:cs('3.45 × 4',{unit:'£'}),a:'€13.80',want:['unsure']},
 ],
 'dec-convert':[
  {spec:cv('3/8','decimal'),a:'0.375',want:['right']},{spec:cv('3/8','decimal'),a:'2.67',want:['wrong','conv-flipped']},{spec:cv('7/20','percent'),a:'0.35%',want:['wrong','conv-not-scaled']},
  {spec:cv('35%','decimal'),a:'3500',want:['wrong','conv-wrong-way']},{spec:cv('35%','decimal'),a:'3.5',want:['wrong','conv-ten-times']},{spec:cv('7/20','decimal'),a:'7.2',want:['wrong','conv-top-dot-bottom']},
  {spec:cv('7/20','percent'),a:'35',want:['unsure']},{spec:cv('0.35','fraction'),a:'',want:['unsure']},{spec:cv('0.35','fraction'),a:'7/20',want:['right']},{spec:cv('0.6','percent'),a:'60%',want:['right']},
 ],
 'pct-of-amount':[
  {spec:po('35% of 80'),a:'28',want:['right']},{spec:po('35% of 80'),a:'2.29',want:['wrong','pct-divided']},{spec:po('35% of 80'),a:'2800',want:['wrong','pct-times-whole']},
  {spec:po('35% of 80'),a:'8',want:['wrong','pct-ten-stopped']},{spec:po('35% of 80'),a:'52',want:['wrong','pct-rest']},{spec:po('15% of 60','€'),a:'€9',want:['right']},
  {spec:po('35% of 80'),a:'28%',want:['unsure']},{spec:po('12.5% of 40','kg'),a:'',want:['unsure']},{spec:po('12.5% of 40','kg'),a:'5000 g',want:['unsure']},
 ],
 'pct-change':[
  {spec:pc('increase 60 by 15%'),a:'69',want:['right']},{spec:pc('increase 60 by 15%'),a:'9',want:['wrong','change-only']},{spec:pc('increase 60 by 15%'),a:'51',want:['wrong','change-wrong-way']},
  {spec:pc('increase 60 by 15%'),a:'75',want:['wrong','change-as-number']},{spec:pc('decrease 80 by 25%','€'),a:'€60',want:['right']},{spec:pc('increase 50 by 35%','£'),a:'£67.50',want:['right']},
  {spec:pc('increase 60 by 15%'),a:'69%',want:['unsure']},{spec:pc('decrease 250 by 12%','kg'),a:'',want:['unsure']},{spec:pc('decrease 250 by 12%','kg'),a:'220 m',want:['unsure']},
 ],
};
for(const unit of Object.keys(B2_PAGES)){
 const page=B2_PAGES[unit];
 test(`W7b 6-${unit}: a full set (right, every slip, unsure, blank) is marked by code the same from a read photo and from typed answers, and calls no model when typed`,async()=>{
  const ids=[...new Set(page.filter((p)=>p.want[1]).map((p)=>p.want[1]))];
  assert.deepEqual(ids.sort(),[...S.SCHOOL_UNIT_SLIPS[unit]].sort(),'the set shows every slip of the unit');
  assert.ok(page.some((p)=>p.want[0]==='right')&&page.some((p)=>p.want[0]==='unsure')&&page.some((p)=>!p.a),'right, unsure and blank are on it');
  assert.deepEqual(M.slipsFor(unit).map((s)=>s.id),[...S.SCHOOL_UNIT_SLIPS[unit]],'slipsFor is the unit\'s closed list');
  for(const s of M.slipsFor(unit)){assert.deepEqual(s.topics,[unit]);assert.doesNotMatch(s.says+s.name+s.points,/\d/,`${s.id}: no value on it`);}
  const put=()=>store.dispatch({type:'practice.set',practice:{topic:unit,marked:false,items:page.map((p,i)=>({n:i+1,question:question(p.spec),spec:p.spec,tier:1}))}});
  seat('uk');put();
  stubVision(()=>({items:page.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:'',verdict:'right',solution:'1',slip:'dec-lined-up'}))}));
  stubText(()=>{throw new Error('no text call while marking');});
  assert.equal((await post('mark',PHOTO)).status,200);
  assert.equal(seenVision.length,1);assert.equal(seenText.length,0);
  const photo=verdicts(),photoSkill={...learners.getLearner(LEARNER).skills[unit]};
  seat('uk');put();noModel();
  const r=await post('mark',{answers:page.map((p)=>p.a)});
  assert.equal(r.status,200);assert.equal(seenVision.length+seenText.length,0,'no model call');
  assert.equal((await r.json()).provider,'code');
  const typed=verdicts();
  assert.deepEqual(typed,photo,'the same verdicts, slips and lines from a photo and from typing');
  page.forEach((p,i)=>{
   const [verdict,slip]=p.want,it=typed[i];
   assert.equal(it.verdict,verdict,`#${i+1} ${JSON.stringify(p.a)} on ${p.spec.expr}`);assert.equal(it.slip,slip,`#${i+1}: the slip code detected`);
   if(verdict==='right')assert.equal(it.said,M.RIGHT(i+1));else if(slip)assert.equal(it.said,S.SCHOOL_SLIPS.find((x)=>x.id===slip).says);else assertElse(it,verdict,p.a,i+1);
  });
  const settledN=page.filter((p)=>p.want[0]!=='unsure').length,right=page.filter((p)=>p.want[0]==='right').length;
  const sk=learners.getLearner(LEARNER).skills[unit];
  assert.equal(sk.seen,settledN,'only settled items reach the record');assert.equal(sk.seen,photoSkill.seen);assert.equal(sk.right,right);
  assert.equal(lastLine().detail,`${right} of ${page.length} right, ${page.length-settledN} not sure`);
  store.getSession().practice.items.forEach((it,i)=>assert.deepEqual(it.spec,page[i].spec,'the spec survives marking'));
  assert.equal(lastLine().label,topicIn(unit).name,'the history line names the unit as the path does');
 });
}

test('W7b 8: a hint on each decimals and percent task names the unit in its stance, and a hint that gives the answer away twice becomes the unit\'s own fixed sentence',async()=>{
 const CASES=[
  ['dec-arith','Work out 4.35 + 2.8.','It comes to seven point one five.','Line up the decimal points first.'],
  ['dec-arith','Work out £3.45 × 4.','345 × 4 = 1380, so £13.80.','Multiply the pounds and the pence separately.'],
  ['dec-convert','Write 3/8 as a decimal.','3 ÷ 8 = 0.375','Divide the top by the bottom.'],
  ['dec-convert','Write 0.35 as a simplified fraction.','It is seven twentieths.','Write 0.35 as hundredths first, then simplify.'],
  ['pct-of-amount','Find 35% of 80.','10% is 8, so 35% is 28.','Find 10% of 80 first.'],
  ['pct-change','Increase 60 by 15%.','15% of 60 is 9, and 60 + 9 = 69.','Find 15% of 60 first: that is the change.'],
 ];
 for(const [unit,task,leaky,clean] of CASES){
  stubText(()=>({hint:leaky,what_to_try_next:'Write it down.'}));
  let h=await H.hint('maths',task,{path:'school',age:12});
  assert.equal(seenText.length,2,`${task}: asked, then asked again once`);
  assert.equal(h.hint,S.SCHOOL_WITHHELD[unit],`${task}: the unit's own line`);assert.equal(h.next,'');
  assert.match(seenText[0].system,new RegExp(`This sheet is the unit "${topicIn(unit).name}"; prefer the unit's methods over heavier ones\\.`),`${task}: the stance names the unit`);
  assert.match(seenText[0].system,/a learner aged 11 to 13/,'the W2 young voice');
  stubText(()=>({hint:clean,what_to_try_next:'Write your working under the question.'}));
  h=await H.hint('maths',task,{path:'school',age:12});
  assert.equal(seenText.length,1,`${task}: a legit hint passes on the first ask`);assert.equal(h.hint,clean);
 }
});

test('W7b 9: an unsure decimals or percent item is explained in the school stance and settled by check from the value said, the percent sign kept',async()=>{
 const items=[{spec:cv('7/20','percent'),a:'35'},{spec:po('35% of 80'),a:'28%'},{spec:cs('4.35 + 2.8'),a:'7.2'}];
 seat('uk');store.dispatch({type:'practice.set',practice:{topic:'dec-convert',marked:false,items:items.map((p,i)=>({n:i+1,question:question(p.spec),spec:p.spec,tier:1}))}});noModel();
 assert.equal((await post('mark',{answers:items.map((p)=>p.a)})).status,200);
 assert.deepEqual(store.getSession().practice.items.map((i)=>i.verdict),['unsure','unsure','unsure']);
 // "thirty-five percent" said aloud for "Write 7/20 as a percentage": the value is transcribed with its sign and settles right
 stubText(()=>({reply:'Look at how you turned twentieths into hundredths.',value:'35%'}));
 const r=await post('explain',{transcript:'I made it thirty-five percent',n:0});
 assert.equal(r.status,200);assert.equal((await r.json()).settled,'right');
 assert.match(seenText[0].prompt,/thirty-five percent is 35%/,'the explain prompt asks for a percentage with its sign');
 assert.match(seenText[0].prompt,/^Topic: Fractions, decimals and percent\n/);
 assert.equal(store.getSession().practice.items[0].verdict,'right');
 // the reply is leak-checked against the item's own spec: one that says the answer is replaced by the item's line
 stubText(()=>({reply:'Yes: 7.15 exactly.',value:'7.15'}));
 await post('explain',{transcript:'seven point one five',n:2});
 const it=store.getSession().practice.items[2];assert.equal(it.verdict,'right');assert.equal(it.reply,M.RIGHT(3),'the leaking reply is not shown');
});

// ------------------------------------------------------------------ 9. Family W7 batch 3: ratio, rates, area, mean and range - read, withheld and marked
const ra=(expr,unit)=>({shape:'ratio',expr,...(unit?{unit}:{})}),rt=(expr,unit)=>({shape:'rate',expr,unit}),ar=(expr,unit='cm2')=>({shape:'area',expr,unit}),st=(expr)=>({shape:'stat',expr});
/** [task text, the spec it reads as (null: refused)] per unit; each spec's value is worked in school-rules-test. */
const B3_TASKS={
 'ratio-share':[
  ['Simplify 12:18',ra('12:18')],['Simplify 12:18.',ra('12:18')],['Simplify the ratio 12:18',ra('12:18')],['Simplify 12 : 18',ra('12:18')],['Simplify 12:18 fully',ra('12:18')],
  ['Simplify 12:18 to its simplest form',ra('12:18')],['Reduce 12:18 to lowest terms',ra('12:18')],['Write 12:18 in its simplest form',ra('12:18')],['Write the ratio 12:18 in its simplest form.',ra('12:18')],
  ['Express 12:18 in its lowest terms',ra('12:18')],['Simplify 18:24',ra('18:24')],['(a) Simplify 15:25',ra('15:25')],['Share 60 in the ratio 2:3',ra('60 in 2:3')],['Share 60 in the ratio 2:3.',ra('60 in 2:3')],
  ['Share £60 in the ratio 2:3',ra('60 in 2:3','£')],['Share €45 in the ratio 4:5',ra('45 in 4:5','€')],['Divide 60 in the ratio 2:3',ra('60 in 2:3')],['Split 70 kg in the ratio 2 : 5',ra('70 in 2:5','kg')],
  ['Share 60 sweets in the ratio 2:3',ra('60 in 2:3')],['Fill in the missing number: 2:3 = ?:15',ra('2:3 = ?:15')],['2:3 = ?:15',ra('2:3 = ?:15')],['2 : 3 = □ : 15',ra('2:3 = ?:15')],
  ['Complete: 4:5 = 12:?',ra('4:5 = 12:?')],['4:5 = 12:___',ra('4:5 = 12:?')],['3. 2:5 = 8:?',ra('2:5 = 8:?')],['Find the missing number: 2:3 = ?:15.',ra('2:3 = ?:15')],
  // refused
  ['12:18',null],['Simplify 2:3',null],['Simplify 12:18:24',null],['Simplify 1.2:1.8',null],['Share 60 in the ratio 2:3:5',null],['Share 61 in the ratio 2:3',null],['Share 60 in the ratio 3:3',null],
  ['Share 60 in the ratio 4:6',null],['Tom and Sam share 60 sweets in the ratio 2:3. How many does Tom get?',null],['Share 60 between Tom and Sam in the ratio 2:3',null],['2:3 = ?:?',null],['2:3 = 10:15',null],
  ['2:3 = ?:16',null],['Simplify 12:18 and 15:25',null],['Write 12:18 as a fraction',null],['Share 60 in the ratio 2 to 3',null],['Share 60 pounds in the ratio 2:3',null],['Divide 60 by the ratio 2:3',null],
 ],
 'unit-rate':[
  ['5 pens cost €3.50. What do 8 pens cost?',rt('5 pens cost 3.50, 8','€')],['5 pens cost €3.50. What do 8 pens cost',rt('5 pens cost 3.50, 8','€')],['5 pens cost €3.50. Find the cost of 8 pens.',rt('5 pens cost 3.50, 8','€')],
  ['5 pens cost €3.50, find the cost of 8 pens',rt('5 pens cost 3.50, 8','€')],['If 5 pens cost €3.50, what do 8 pens cost?',rt('5 pens cost 3.50, 8','€')],['5 pens cost €3.50. How much do 8 pens cost?',rt('5 pens cost 3.50, 8','€')],
  ['5 pens cost € 3.50. What do 8 pens cost?',rt('5 pens cost 3.50, 8','€')],['5 pens cost 3.50 euros. What do 8 pens cost?',rt('5 pens cost 3.50, 8','€')],['12 kg cost €30. What does 1 kg cost?',rt('12 kg cost 30, 1','€')],
  ['12 kg cost 30 euro, what is the price of 1 kg?',rt('12 kg cost 30, 1','€')],['12 kg cost €30. Find the cost of 1 kg.',rt('12 kg cost 30, 1','€')],['4 books cost £18. What do 7 books cost?',rt('4 books cost 18, 7','£')],
  ['(b) 4 books cost £18. What do 7 books cost?',rt('4 books cost 18, 7','£')],['3 pens cost £2.40. What does 1 pen cost?',rt('3 pens cost 2.40, 1','£')],['6 cups cost €9. What do 10 cups cost?',rt('6 cups cost 9, 10','€')],
  ['240 km in 3 hours. How far in 5 hours?',rt('240 km in 3 h, 5','km')],['240 km takes 3 hours. How far in 5 hours?',rt('240 km in 3 h, 5','km')],['240 km in 3 hours at a steady speed. How far in 5 hours?',rt('240 km in 3 h, 5','km')],
  ['240 km in 3 hours. How far in 5 hours at the same speed?',rt('240 km in 3 h, 5','km')],['150 km in 4 hours. How far in 1 hour?',rt('150 km in 4 h, 1','km')],['2. 90 km in 2 hours. How far in 7 hours?',rt('90 km in 2 h, 7','km')],
  ['5 apples cost €2.50. What do 3 apples cost?',rt('5 apples cost 2.50, 3','€')],
  // refused
  ['A car travels 240 km in 3 hours. How far does it go in 5 hours?',null],['Sam buys 5 pens for €3.50. How much do 8 pens cost?',null],['5 pens cost €3.50. What do 8 pencils cost?',null],
  ['5 pens cost 3.50. What do 8 pens cost?',null],['5 pens cost 3.50 pounds. What do 8 pens cost?',null],['5 pens cost €3.5. What do 8 pens cost?',null],['5 pens cost €3.50. What do 5 pens cost?',null],
  ['1 pen costs €0.70. What do 8 pens cost?',null],['240 km in 3 hours. What is the speed?',null],['3 workers take 12 days. How long do 4 workers take?',null],['5 pens cost €3.50',null],
  ['5 sweets cost €3.50. What do 8 sweets cost?',null],['5 pens cost €3.50. What do 8 pens and 2 books cost?',null],['3 pens cost €1. What does 1 pen cost?',null],['240 km in 3 hours. How far in 5 minutes?',null],
  ['5 pens cost €3.50 and 3 books cost €6. What do 8 pens cost?',null],
 ],
 'area':[
  ['Find the area of a rectangle 7 cm by 4 cm',ar('rectangle 7 by 4')],['Find the area of a rectangle 7 cm by 4 cm.',ar('rectangle 7 by 4')],['Work out the area of a rectangle 7 cm by 4 cm',ar('rectangle 7 by 4')],
  ['What is the area of a rectangle 7 cm by 4 cm?',ar('rectangle 7 by 4')],['Calculate the area of a rectangle measuring 7 cm by 4 cm',ar('rectangle 7 by 4')],['Find the area of a 7 cm by 4 cm rectangle',ar('rectangle 7 by 4')],
  ['Find the area of a rectangle with length 7 cm and width 4 cm',ar('rectangle 7 by 4')],['Find the area of a rectangle 7cm by 4cm',ar('rectangle 7 by 4')],['Find the area of a rectangle 12 m by 9 m',ar('rectangle 12 by 9','m2')],
  ['Find the area of a rectangle 12 metres by 9 metres',ar('rectangle 12 by 9','m2')],['Find the area of a rectangle 7.5 cm by 4 cm',ar('rectangle 7.5 by 4')],['Find the area of a triangle, base 10 cm, height 6 cm',ar('triangle base 10 height 6')],
  ['Find the area of a triangle with base 10 cm and height 6 cm',ar('triangle base 10 height 6')],['Find the area of a triangle base 10 cm height 6 cm',ar('triangle base 10 height 6')],
  ['Find the area of a triangle, base 5 cm, height 3 cm.',ar('triangle base 5 height 3')],['Find the total area of rectangles 8 cm by 3 cm and 4 cm by 2 cm',ar('rectangles 8 by 3 and 4 by 2')],
  ['(c) Find the area of a rectangle 7 cm by 4 cm',ar('rectangle 7 by 4')],['Find the area of a rectangle 7 centimetres by 4 centimetres',ar('rectangle 7 by 4')],
  ['Work out the total area of rectangles 6 cm by 5 cm and 9 cm by 7 cm.',ar('rectangles 6 by 5 and 9 by 7')],['find the area of a rectangle 7 cm by 4 cm',ar('rectangle 7 by 4')],
  ['What is the area of a triangle with base 9 cm and height 7 cm?',ar('triangle base 9 height 7')],['Find the area of an 8 cm by 3 cm rectangle',ar('rectangle 8 by 3')],
  // refused
  ['Find the area of a rectangle 7 by 4',null],['Find the area of a rectangle 7 cm by 40 mm',null],['Find the area of a rectangle 7 m by 40 cm',null],['Find the perimeter of a rectangle 7 cm by 4 cm',null],
  ['Find the area of a square with side 5 cm',null],['Find the area of a circle with radius 3 cm',null],['Find the area of a parallelogram, base 10 cm, height 6 cm',null],['Find the volume of a cuboid 7 cm by 4 cm by 2 cm',null],
  ['A garden is 7 m by 4 m. Find its area.',null],['Find the area of a rectangle 7.25 cm by 4 cm',null],['Find the area of a rectangle 0 cm by 4 cm',null],['Find the area of a triangle, base 10 cm, height 6 cm, side 8 cm',null],
  ['Find the area of rectangles 8 cm by 3 cm and 4 cm by 2 cm',null],['Find the area of a rectangle 7 cm by 4 cm and a triangle, base 10 cm, height 6 cm',null],['Find the area of a rectangle 7 inches by 4 inches',null],
 ],
 'mean-range':[
  ['Work out the mean of 4, 7, 9 and 10',st('mean 4, 7, 9, 10')],['Work out the mean of 4, 7, 9 and 10.',st('mean 4, 7, 9, 10')],['Find the mean of 4, 7, 9, 10',st('mean 4, 7, 9, 10')],
  ['Calculate the mean of 4, 7, 9 and 10',st('mean 4, 7, 9, 10')],['What is the mean of 4, 7, 9 and 10?',st('mean 4, 7, 9, 10')],['Find the mean of these numbers: 4, 7, 9, 10',st('mean 4, 7, 9, 10')],
  ['Find the mean of 4, 7, 9, and 10',st('mean 4, 7, 9, 10')],['find the mean of 4, 7, 9 and 10',st('mean 4, 7, 9, 10')],['(a) Find the mean of 4, 7, 9 and 10',st('mean 4, 7, 9, 10')],
  ['Work out the mean of 2, 9, 4, 6 and 4',st('mean 2, 9, 4, 6, 4')],['Find the mean of 12, 17, 11, 14',st('mean 12, 17, 11, 14')],['Find the range of 12, 5, 9, 20 and 7',st('range 12, 5, 9, 20, 7')],
  ['Work out the range of 12, 5, 9, 20, 7',st('range 12, 5, 9, 20, 7')],['What is the range of 12, 5, 9, 20 and 7?',st('range 12, 5, 9, 20, 7')],['Find the range of these numbers: 12, 5, 9, 20, 7',st('range 12, 5, 9, 20, 7')],
  ['Calculate the range of 31, 18, 52 and 27',st('range 31, 18, 52, 27')],['3. Find the range of 9, 3, 6, 11',st('range 9, 3, 6, 11')],['Find the mean of 4, 8, 6, 15, 3 and 9',st('mean 4, 8, 6, 15, 3, 9')],
  ['Work out the mean of 0, 7, 9 and 12',st('mean 0, 7, 9, 12')],
  // refused
  ['Find the median of 4, 7, 9 and 10',null],['Find the mode of 4, 7, 9 and 10',null],['Find the mean and range of 4, 7, 9 and 10',null],['Find the mean of 4, 7, 9 and x',null],
  ['Find the mean of 4.5, 7, 9 and 10',null],['Find the mean of -4, 7, 9 and 10',null],['Find the mean of 4,7,9,10',null],['Find the average of 4, 7, 9 and 10',null],
  ['The mean of 4, 7, x and 10 is 8. Find x.',null],['Tom scored 4, 7, 9 and 10. What is his mean score?',null],['Find the mean of 4 and 7',null],['Find the mean of 1, 2 and 4',null],
  ['Find the range of 5, 5, 5 and 5',null],['Find the mean of 4, 7, 9 and 10 cm',null],['Find the range of 12, 5, 9, 20 and 7 and the mean',null],['Work out the mean of 04, 7, 9 and 10',null],
 ],
};
const B3GEN={'ratio-share':S.genRatio,'unit-rate':S.genRate,'area':S.genArea,'mean-range':S.genStat};
for(const unit of Object.keys(B3_TASKS)){
 const rows=B3_TASKS[unit];
 test(`W7c 4-${unit}: specFromQuestion reads the unit's tasks conservatively - ${rows.length} phrasings, ${rows.filter((t)=>t[1]===null).length} of them refused`,()=>{
  assert.ok(rows.length>=25&&rows.filter((t)=>t[1]===null).length>=10);
  for(const [text,want] of rows){
   const got=S.specFromQuestion(text);
   if(want===null){assert.equal(got,null,`refused: ${JSON.stringify(text)}`);continue;}
   assert.deepEqual(got,want,text);
   assert.ok(S.wellFormed(got).ok);assert.equal(S.unitOf(got),unit,`${text} is a ${unit} task`);
   assert.equal(C.specFromQuestion(text),null,`${text}: not a Calculus task`);
  }
  for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=B3GEN[unit](seed,tier);assert.deepEqual(S.specFromQuestion(S.question(sp).plain),sp,`${unit} ${tier}/${seed}`);}
 });
 test(`W7c 5-${unit}: the withheld sentence names the unit's method, carries no number, and leaks nothing on any generated item`,()=>{
  const line=S.SCHOOL_WITHHELD[unit];
  assert.equal(typeof line,'string');assert.doesNotMatch(line,/\d/);assert.match(line,/The answer is yours to work out\.$/);
  for(const other of Object.keys(S.SCHOOL_UNIT_SLIPS))if(other!==unit)assert.notEqual(S.SCHOOL_WITHHELD[other],line,'each unit has its own line');
  for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=B3GEN[unit](seed,tier);assert.equal(S.leaksSchool(sp,line),false,`${unit} ${tier}/${seed}`);assert.equal(S.withheldSchool(sp),line);}
  for(const [,sp] of rows.filter((r)=>r[1]))assert.equal(S.withheldSchool(sp),line);
 });
}

/** A full set per unit: right, each of its slips, unsure, blank. Expected verdicts worked by hand (school-rules-test comments). */
const B3_PAGES={
 'ratio-share':[
  {spec:ra('12:18'),a:'2:3',want:['right']},{spec:ra('60 in 2:3'),a:'30 and 20',want:['wrong','ratio-split-each']},{spec:ra('60 in 2:3'),a:'2 and 3',want:['wrong','ratio-as-amounts']},
  {spec:ra('12:18'),a:'3:2',want:['wrong','ratio-swapped']},{spec:ra('60 in 2:3'),a:'120 and 180',want:['wrong','ratio-by-difference']},{spec:ra('2:3 = ?:15'),a:'14',want:['wrong','ratio-added-same']},
  {spec:ra('12:18'),a:'4:6',want:['unsure']},{spec:ra('60 in 2:3'),a:'',want:['unsure']},{spec:ra('45 in 4:5','€'),a:'€20 and €25',want:['right']},{spec:ra('60 in 2:3'),a:'36 and 24',want:['unsure']},
  {spec:ra('2:3 = ?:15'),a:'10:15',want:['right']},
 ],
 'unit-rate':[
  {spec:rt('5 pens cost 3.50, 8','€'),a:'€5.60',want:['right']},{spec:rt('5 pens cost 3.50, 8','€'),a:'11.43',want:['wrong','rate-wrong-way']},{spec:rt('5 pens cost 3.50, 8','€'),a:'140',want:['wrong','rate-multiplied']},
  {spec:rt('5 pens cost 3.50, 8','€'),a:'2.19',want:['wrong','rate-other-quantity']},{spec:rt('240 km in 3 h, 5','km'),a:'400 km',want:['right']},{spec:rt('12 kg cost 30, 1','€'),a:'0.4',want:['wrong','rate-wrong-way']},
  {spec:rt('5 pens cost 3.50, 8','€'),a:'£5.60',want:['unsure']},{spec:rt('240 km in 3 h, 5','km'),a:'',want:['unsure']},{spec:rt('5 pens cost 3.50, 8','€'),a:'560',want:['unsure']},
  {spec:rt('240 km in 3 h, 5','km'),a:'3600',want:['wrong','rate-multiplied']},
 ],
 'area':[
  {spec:ar('rectangle 7 by 4'),a:'28 cm2',want:['right']},{spec:ar('rectangle 7 by 4'),a:'22',want:['wrong','area-added-sides']},{spec:ar('triangle base 10 height 6'),a:'60',want:['wrong','area-no-half']},
  {spec:ar('rectangles 8 by 3 and 4 by 2'),a:'24',want:['wrong','area-one-part']},{spec:ar('triangle base 5 height 3'),a:'7.5',want:['right']},{spec:ar('rectangle 7 by 4'),a:'28 cm',want:['unsure']},
  {spec:ar('rectangles 8 by 3 and 4 by 2'),a:'',want:['unsure']},{spec:ar('rectangle 12 by 9','m2'),a:'108 m²',want:['right']},{spec:ar('rectangle 7 by 4'),a:'28 m2',want:['unsure']},
  {spec:ar('triangle base 10 height 6'),a:'16',want:['wrong','area-added-sides']},
 ],
 'mean-range':[
  {spec:st('mean 4, 7, 9, 10'),a:'7.5',want:['right']},{spec:st('mean 4, 7, 9, 10'),a:'30',want:['wrong','stat-not-divided']},{spec:st('mean 4, 7, 9, 10'),a:'10',want:['wrong','stat-wrong-count']},
  {spec:st('mean 12, 17, 11, 14'),a:'13',want:['wrong','stat-median']},{spec:st('range 12, 5, 9, 20, 7'),a:'20',want:['wrong','range-largest']},{spec:st('range 12, 5, 9, 20, 7'),a:'-15',want:['wrong','range-backwards']},
  {spec:st('range 12, 5, 9, 20, 7'),a:'15',want:['right']},{spec:st('mean 4, 7, 9, 10'),a:'7.5 cm',want:['unsure']},{spec:st('range 12, 5, 9, 20, 7'),a:'',want:['unsure']},{spec:st('mean 4, 7, 9, 10'),a:'7,5',want:['unsure']},
 ],
};
for(const unit of Object.keys(B3_PAGES)){
 const page=B3_PAGES[unit];
 test(`W7c 6-${unit}: a full set (right, every slip, unsure, blank) is marked by code the same from a read photo and from typed answers, and calls no model when typed`,async()=>{
  const ids=[...new Set(page.filter((p)=>p.want[1]).map((p)=>p.want[1]))];
  assert.deepEqual(ids.sort(),[...S.SCHOOL_UNIT_SLIPS[unit]].sort(),'the set shows every slip of the unit');
  assert.ok(page.some((p)=>p.want[0]==='right')&&page.some((p)=>p.want[0]==='unsure')&&page.some((p)=>!p.a),'right, unsure and blank are on it');
  assert.ok(page.length<=12,'a typed set carries at most twelve answers');
  assert.deepEqual(M.slipsFor(unit).map((s)=>s.id),[...S.SCHOOL_UNIT_SLIPS[unit]],'slipsFor is the unit\'s closed list');
  for(const s of M.slipsFor(unit)){assert.deepEqual(s.topics,[unit]);assert.doesNotMatch(s.says+s.name+s.points,/\d/,`${s.id}: no value on it`);}
  const put=()=>store.dispatch({type:'practice.set',practice:{topic:unit,marked:false,items:page.map((p,i)=>({n:i+1,question:question(p.spec),spec:p.spec,tier:1}))}});
  seat('uk');put();
  stubVision(()=>({items:page.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:'',verdict:'right',solution:'1',slip:'ratio-swapped'}))}));
  stubText(()=>{throw new Error('no text call while marking');});
  assert.equal((await post('mark',PHOTO)).status,200);
  assert.equal(seenVision.length,1);assert.equal(seenText.length,0);
  const photo=verdicts(),photoSkill={...learners.getLearner(LEARNER).skills[unit]};
  seat('uk');put();noModel();
  const r=await post('mark',{answers:page.map((p)=>p.a)});
  assert.equal(r.status,200);assert.equal(seenVision.length+seenText.length,0,'no model call');
  assert.equal((await r.json()).provider,'code');
  const typed=verdicts();
  assert.deepEqual(typed,photo,'the same verdicts, slips and lines from a photo and from typing');
  page.forEach((p,i)=>{
   const [verdict,slip]=p.want,it=typed[i];
   assert.equal(it.verdict,verdict,`#${i+1} ${JSON.stringify(p.a)} on ${p.spec.expr}`);assert.equal(it.slip,slip,`#${i+1}: the slip code detected`);
   if(verdict==='right')assert.equal(it.said,M.RIGHT(i+1));else if(slip)assert.equal(it.said,S.SCHOOL_SLIPS.find((x)=>x.id===slip).says);else assertElse(it,verdict,p.a,i+1);
  });
  const settledN=page.filter((p)=>p.want[0]!=='unsure').length,right=page.filter((p)=>p.want[0]==='right').length;
  const sk=learners.getLearner(LEARNER).skills[unit];
  assert.equal(sk.seen,settledN,'only settled items reach the record');assert.equal(sk.seen,photoSkill.seen);assert.equal(sk.right,right);
  assert.equal(lastLine().detail,`${right} of ${page.length} right, ${page.length-settledN} not sure`);
  store.getSession().practice.items.forEach((it,i)=>assert.deepEqual(it.spec,page[i].spec,'the spec survives marking'));
  assert.equal(lastLine().label,topicIn(unit).name,'the history line names the unit as the path does');
 });
}


test('W7c 8: a hint on each batch-3 task names the unit in its stance, and a hint that gives the answer away twice becomes the unit\'s own fixed sentence',async()=>{
 const CASES=[
  ['ratio-share','Share 60 in the ratio 2:3.','One part is 12, so the shares are 24 and 36.','Add the parts of the ratio first.'],
  ['ratio-share','Write 12:18 in its simplest form.','Divide both by 6 to get 2:3.','Find a number that goes into both 12 and 18.'],
  ['unit-rate','5 pens cost €3.50. What do 8 pens cost?','One pen is 70p, so 8 pens cost €5.60.','Find the cost of one pen first.'],
  ['unit-rate','240 km in 3 hours. How far in 5 hours?','80 × 5 = 400 km.','Find how far you go in one hour first.'],
  ['area','Find the area of a triangle, base 10 cm, height 6 cm.','Half of 60 is 30 cm2.','Multiply the base by the height, then halve it.'],
  ['area','Find the total area of rectangles 8 cm by 3 cm and 4 cm by 2 cm.','24 + 8 = 32.','Find the area of each rectangle first.'],
  ['mean-range','Work out the mean of 4, 7, 9 and 10.','30 ÷ 4 = 7.5','Add the numbers, then divide by how many there are.'],
  ['mean-range','Find the range of 12, 5, 9, 20 and 7.','20 take away 5 is 15.','Find the largest and the smallest numbers.'],
 ];
 for(const [unit,task,leaky,clean] of CASES){
  stubText(()=>({hint:leaky,what_to_try_next:'Write it down.'}));
  let h=await H.hint('maths',task,{path:'school',age:12});
  assert.equal(seenText.length,2,`${task}: asked, then asked again once`);
  assert.equal(h.hint,S.SCHOOL_WITHHELD[unit],`${task}: the unit's own line`);assert.equal(h.next,'');
  assert.match(seenText[0].system,new RegExp(`This sheet is the unit "${topicIn(unit).name}"; prefer the unit's methods over heavier ones\\.`),`${task}: the stance names the unit`);
  assert.match(seenText[0].system,/a learner aged 11 to 13/,'the W2 young voice');
  stubText(()=>({hint:clean,what_to_try_next:'Write your working under the question.'}));
  h=await H.hint('maths',task,{path:'school',age:12});
  assert.equal(seenText.length,1,`${task}: a legit hint passes on the first ask`);assert.equal(h.hint,clean);
 }
});

test('W7c 9: an unsure ratio, area or mean item is explained in the school stance and settled by check from the value said - two amounts, a ratio, a square unit',async()=>{
 const items=[{spec:ra('60 in 2:3'),a:'36 and 24'},{spec:ar('rectangle 7 by 4'),a:'28 cm'},{spec:st('mean 4, 7, 9, 10'),a:'7,5'}];
 seat('uk');store.dispatch({type:'practice.set',practice:{topic:'ratio-share',marked:false,items:items.map((p,i)=>({n:i+1,question:question(p.spec),spec:p.spec,tier:1}))}});noModel();
 assert.equal((await post('mark',{answers:items.map((p)=>p.a)})).status,200);
 assert.deepEqual(store.getSession().practice.items.map((i)=>i.verdict),['unsure','unsure','unsure']);
 // "twenty-four and thirty-six" said aloud: the value is transcribed as two amounts and settles right
 stubText(()=>({reply:'Look at which share goes with the 2.',value:'24 and 36'}));
 const r=await post('explain',{transcript:'the first one gets twenty-four and the other thirty-six',n:0});
 assert.equal(r.status,200);assert.equal((await r.json()).settled,'right');
 assert.match(seenText[0].prompt,/twenty-four and thirty-six is 24 and 36/,'the explain prompt asks for two amounts as said');
 assert.match(seenText[0].prompt,/^Topic: Ratio and sharing\n/);
 assert.equal(store.getSession().practice.items[0].verdict,'right');
 // the area said with its square unit settles right; a reply that states the answer is replaced by the item's line
 stubText(()=>({reply:'Yes, 28 square centimetres.',value:'28 cm2'}));
 await post('explain',{transcript:'twenty-eight square centimetres',n:1});
 const it=store.getSession().practice.items[1];assert.equal(it.verdict,'right');assert.equal(it.reply,M.RIGHT(2),'the leaking reply is not shown');
});

test('HL6: every frac-* withheld line is 25 words or fewer, keeps the closing sentence, names no number, and leaks nothing on its unit',()=>{
 const gens={'frac-equivalent':S.genEquivalent,'frac-of-amount':S.genOfAmount,'frac-add-sub':S.gen,'frac-mul-div':S.genMulDiv};
 for(const [unit,gen] of Object.entries(gens)){
  const line=S.SCHOOL_WITHHELD[unit];
  assert.ok(line.split(/\s+/).length<=25,`${unit}: ${line.split(/\s+/).length} words`);
  assert.match(line,/The answer is yours to work out\.$/);assert.doesNotMatch(line,/\d/);
  for(const tier of [1,2])for(let seed=0;seed<200;seed++){const sp=gen(seed,tier);assert.equal(S.unitOf(sp),unit);assert.equal(S.leaksSchool(sp,line),false,`${unit} ${tier}/${seed}`);}
 }
});

// ------------------------------------------------------------------ X1: the explain reply goes through the same leak checks
test('X1: explainItem replaces a reply the shared leak checks refuse - Czech fraction words, a rooted squared total, a split product, a Czech solution - and shows a clean one',async()=>{
 seat('cz');
 const own='This one is yours to finish.';
 const items=[
  {name:'3/13 item',topic:'probability',item:{n:1,question:'A bag has 3 red and 10 blue counters. Find the probability that one taken at random is red.',spec:{shape:'probability',expr:'bag red 3, blue 10 ask red'}},
   leak:'Pravděpodobnost je tři třináctiny.',leak2:'Pravdepodobnost je tri trinactiny.',clean:'Count the red counters, then all the counters.'},
  {name:'16/30 mm item',topic:'pythagoras',item:{n:1,question:'A right-angled triangle has shorter sides 16 mm and 30 mm. Find the longest side.',spec:{shape:'pythagoras',expr:'longest 16 30',unit:'mm'}},
   leak:'The longest side is the square root of 1156.',leak2:'c² = 16² + 30² = 1156, teď odmocni.',clean:'Square both shorter sides and add them.'},
  {name:'sin(x^2) item',topic:'calc1-rules',item:{n:1,question:'Differentiate f(x) = sin(x^2).',spec:{shape:'derivative',f:'sin(x^2)'}},
   leak:'Multiply cos(x^2) by 2x.',leak2:'Differentiate the outside to get cos(x^2), then multiply by 2x, the derivative of the inside.',clean:'Use the chain rule: differentiate the outside, then multiply by the derivative of the inside.'},
  {name:'Czech equation item',topic:'linear-two-step',item:{n:1,question:'Řeš rovnici 3(x - 2) = 2x + 5'},
   leak:'Takže x = 11.',leak2:'x = 11.',clean:'Rozlož závorku a převeď členy s x na jednu stranu.'},
 ];
 for(const t of items){
  for(const line of [t.leak,t.leak2]){
   stubText(()=>({reply:line,value:'',slip:'unclear'}));
   const r=await X.explainItem({...t.item,verdict:'unsure',said:own},'I did it in my head',t.topic,LEARNER,()=>false,12,'cz');
   assert.equal(r.reply,own,`${t.name}: replaced: ${line}`);
  }
  stubText(()=>({reply:t.clean,value:'',slip:'unclear'}));
  const r=await X.explainItem({...t.item,verdict:'unsure',said:own},'I did it in my head',t.topic,LEARNER,()=>false,12,'cz');
  assert.equal(r.reply,t.clean,`${t.name}: a clean reply is shown`);
 }
});

// ------------------------------------------------------------------ MK11: a photo with no answers on it is a failed mark
const {EMPTY_MARK}=require(path.join(root,'src/lib/desk/mark.ts'));
const digestOf=()=>learners.getLearner(LEARNER).digest.length;
const linesOf=()=>learners.getLearner(LEARNER).history.filter((e)=>e.kind==='practice').length;
test('12: MK11 a photo read with no answer to any question is refused (502, EMPTY_MARK), records nothing, and the next good snap marks',async()=>{
 const reads={
  'no items':()=>({items:[]}),
  'items numbered outside the set':()=>({items:[{n:90,studentAnswer:'11/12',studentWorking:''},{n:0,studentAnswer:'1',studentWorking:''}]}),
  'every answer blank':()=>({items:PAGE.map((p,i)=>({n:i+1,studentAnswer:i%2?'':'   ',studentWorking:'9/12'}))}),
 };
 for(const [why,read] of Object.entries(reads)){
  seat('uk');setOn();
  stubVision(read);
  const r=await post('mark',PHOTO);
  assert.equal(r.status,502,why);
  const msg=(await r.json()).error;assert.equal(msg,EMPTY_MARK,why);deskWords(msg);
  const s=store.getSession();
  assert.equal(s.practice.marked,false,`${why}: still open`);
  assert.equal(s.jobs.mark.phase,'failed',why);assert.equal(s.jobs.mark.error,EMPTY_MARK,why);
  assert.equal(linesOf(),0,`${why}: no history line`);assert.equal(digestOf(),0,`${why}: no digest entry`);
  assert.equal(learners.getLearner(LEARNER).skills[UNIT]?.seen??0,0,`${why}: no attempt`);
  stubVision(()=>({items:PAGE.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:''}))}));
  assert.equal((await post('mark',PHOTO)).status,200,`${why}: the next good snap marks`);
  assert.equal(store.getSession().practice.marked,true);assert.equal(linesOf(),1);assert.equal(digestOf(),1);
 }
});
test('13: MK11 ruled limit - one non-blank answer to a question of the set still lands (marking has no completeness check)',async()=>{
 seat('uk');setOn();
 stubVision(()=>({items:[{n:1,studentAnswer:'11/12',studentWorking:''},{n:99,studentAnswer:'5',studentWorking:''}]}));
 assert.equal((await post('mark',PHOTO)).status,200);
 assert.equal(store.getSession().practice.marked,true);assert.equal(linesOf(),1);assert.equal(digestOf(),1);
});

// ------------------------------------------------------------------ D3-3: a failed vision call
const {EngineError}=require(path.join(root,'src/lib/engines/types.ts'));
for(const [why,sentence,fail] of [
 ['a timeout','The desk could not mark the set. It took too long.',()=>{reg.useProvider('vision',{name:'stub',run:async()=>{throw new EngineError('timeout','stub','timed out');}});}],
 ['an answer that is not JSON','The desk could not mark the set. The answer came back in pieces.',()=>{reg.useProvider('vision',{name:'stub',run:async()=>({raw:'this is not json at all'})});}],
]){
 test(`14: D3-3 vision fails with ${why}: 502 in desk words, job failed, nothing recorded, the next good snap marks`,async()=>{
  seat('uk');setOn();fail();
  const r=await post('mark',PHOTO);assert.equal(r.status,502);
  assert.equal((await r.json()).error,sentence);
  const s=store.getSession();
  assert.equal(s.jobs.mark.phase,'failed');assert.equal(s.jobs.mark.error,sentence);
  assert.equal(s.practice.marked,false);assert.equal(linesOf(),0);assert.equal(digestOf(),0);
  stubVision(()=>({items:PAGE.map((p,i)=>({n:i+1,studentAnswer:p.a,studentWorking:''}))}));
  assert.equal((await post('mark',PHOTO)).status,200);assert.equal(linesOf(),1);
 });
}

test('MK10: an unsure item says why the desk is not sure, in the engine\'s words, through the real judgeSet; a blank has no answer yet; a wrong item with no slip still asks',()=>{
 const K=require(src('lib/rules/kinds.ts'));
 const judge=(spec,a,system='uk',topic=UNIT)=>K.judgeSet({topic,items:[{n:1,question:question(spec),spec,tier:1}]},[{n:1,studentAnswer:a}],{topic,system,typed:true}).items[0];
 // (a) a right value not in its simplest form: the engine's own reason, no value, never 'something different'
 const T={shape:'simplify',expr:'6/33'},why=S.check(T,'4/22','uk').why;
 assert.equal(S.check(T,'4/22','uk').verdict,'unsure');assert.ok(why.length>10);
 const u=judge(T,'4/22');
 assert.equal(u.verdict,'unsure');assert.equal(u.said,M.NOT_SURE(1,why));
 assert.match(u.said,/^The desk is not sure about number 1\. /);assert.doesNotMatch(u.said,/something different|4\/22|2\/11/);
 // (c) a blank answer has no answer yet
 assert.equal(judge(T,'   ').said,M.BLANK(1));assert.equal(judge(T,'').said,M.BLANK(1));
 // (d) a linear item the desk cannot solve: not sure, no reason
 const lin=K.judgeSet({topic:'linear-one-step',items:[{n:2,question:'x*x=4'}]},[{n:2,studentAnswer:'2'}],{topic:'linear-one-step'}).items[0];
 assert.equal(lin.verdict,'unsure');assert.equal(lin.said,M.NOT_SURE(2));
 // (c) a blank linear item
 assert.equal(K.judgeSet({topic:'linear-one-step',items:[{n:3,question:'2x+3=11'}]},[],{topic:'linear-one-step'}).items[0].said,M.BLANK(3));
 // (e) control: wrong with no known slip asks
 const w=judge(T,'7/9');
 assert.equal(w.verdict,'wrong');assert.equal(w.slip,undefined);assert.equal(w.said,M.ASK(1));
 // the part name still renames it
 assert.match(require(src('lib/rules/calc-word.ts')).namedLine(u.said,1,'5(b)'),/^The desk is not sure about number 5\(b\)\. /);
});
