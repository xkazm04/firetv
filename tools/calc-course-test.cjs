/**
 * The whole Calculus 1 course as ONE flow, through the real route handlers: for each of the 22 topics a learner on the
 * calc1 path gets a practice set (POST /api/practice - the model gives specs, code prints, checks and orders them),
 * marks it from a photographed page (POST /api/mark - the model only reads the page, rules/calc checkAnswer decides),
 * settles an unsure item by saying their answer (POST /api/explain), asks for a hint on a page item of the topic
 * (POST /api/hint - leaksCalc on every line, one re-ask, then the shape's fixed sentence, no lesson pick), and after
 * enough right work the topic latches secure and the path moves on, until Tonight says every topic is secure.
 * Every model call is stubbed at the provider seam, every verdict is the desk's, and after every step the session as
 * the TV, a phone and a guest see it carries no truth. The school path runs beside it, unchanged.
 * Run with npm test in desk/ (directly: node tools/calc-course-test.cjs). No server, no browser, no model; the data
 * directory is disposable, under the OS temp dir, and the learners are scratch ids.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=fs.mkdtempSync(path.join(os.tmpdir(),'desk-calc-course-'));process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const {view}=require(src('lib/session/pairing.ts'));
const C=require(src('lib/rules/calc.ts'));
const M=require(src('lib/rules/maths.ts'));
const T=require(src('maths/typeset.ts'));
const P=require(src('lib/library/paths.ts'));
const {CALC1_SPINE}=require(src('lib/library/calculus1.spine.ts'));
const {topicStates,secureTitle,pathSecure}=require(src('tv/mathsRows.ts'));
const {topicStops,topicsFocus}=require(src('tv/keys.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());

const post=async(name,body)=>{const r=await route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};};
const drain=async()=>{for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));};
const PHOTO={image:'data:image/jpeg;base64,AAAA',w:100,h:100};
const CALC='calc-course-scratch-calc',SCHOOL='calc-course-scratch-school';

// ------------------------------------------------------------------ the table: two or three specs per calc1 topic
/**
 * The course's own table, written by hand: for every calc1 topic specs of shapes on its list (calculus1.spine), each
 * with a right answer in a different-looking equivalent form and a wrong one. Points are as the model writes them
 * (strings) in `raw`; `spec` is what the desk keeps. The self-check below proves the table does not lie.
 */
const R=(topic,difficulty,spec,right,wrong)=>({topic,difficulty,spec,right,wrong});
const TABLE=[
 R('calc1-functions',1,{shape:'evaluate',f:'x^2 + 3x',at:2},'20/2','11'),
 R('calc1-functions',3,{shape:'evaluate',f:'(x + 1)/(x - 1)',at:3},'sqrt(4)','1'),
 R('calc1-trig',2,{shape:'evaluate',f:'2sin(x) + 1',at:'pi/6'},'1 + 1','3'),
 R('calc1-trig',3,{shape:'evaluate',f:'cos(2x)',at:'pi/3'},'-0.5','-1'),
 R('calc1-exp-log',2,{shape:'evaluate',f:'e^(2x)',at:'ln(3)'},'3^2','6'),
 R('calc1-exp-log',3,{shape:'evaluate',f:'ln(x) + 1',at:'e'},'6/3','1'),
 R('calc1-limit-idea',1,{shape:'limit',f:'(x^2 - 9)/(x - 3)',at:3},'12/2','0'),
 R('calc1-limit-idea',3,{shape:'limit',f:'sin(5x)/x',at:0},'10/2','1'),
 R('calc1-limit-laws',4,{shape:'limit',f:'(sqrt(x + 1) - 2)/(x - 3)',at:3},'0.25','1/2'),
 R('calc1-limit-laws',3,{shape:'limit',f:'(x^2 + 2x)/(x^2 - 4)',at:-2},'2/4','1'),
 R('calc1-continuity',2,{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'},'1.5','3'),
 R('calc1-continuity',4,{shape:'limit',f:'1/x',at:0,side:'+'},'+∞','0'),
 R('calc1-derivative',1,{shape:'derivative',f:'x^2 + 3x'},'3 + 2x','2x'),
 R('calc1-derivative',2,{shape:'derivative-at',f:'x^3 - 2x',at:2},'5*2','8'),
 R('calc1-rules',4,{shape:'derivative',f:'(x^2 + 1)/(x - 1)'},'1 - 2/(x - 1)^2','2x'),
 R('calc1-rules',2,{shape:'derivative',f:'4x^3 - 5x^2 + 7'},'x(12x - 10)','12x^2 - 10'),
 R('calc1-trig-derivatives',3,{shape:'derivative',f:'x sin(x)'},'sin(x) + x cos(x)','cos(x)'),
 R('calc1-trig-derivatives',3,{shape:'derivative',f:'tan(x) + cos(x)'},'1/cos(x)^2 - sin(x)','1 + sin(x)'),
 R('calc1-chain',2,{shape:'derivative',f:'(2x + 1)^3'},'6(2x + 1)^2','3(2x + 1)^2'),
 R('calc1-chain',3,{shape:'derivative',f:'sin(x^2)'},'2x cos(x^2)','cos(x^2)'),
 R('calc1-log-derivative',4,{shape:'derivative',f:'ln(x)/x'},'1/x^2 - ln(x)/x^2','1/x'),
 R('calc1-log-derivative',2,{shape:'derivative-at',f:'x e^x',at:0},'e^0','0'),
 R('calc1-related-rates',3,{shape:'derivative-at',f:'(4/3) pi x^3',at:3},'pi*36','12pi'),
 R('calc1-related-rates',4,{shape:'derivative-at',f:'sqrt(x^2 + 9)',at:4},'0.8','5'),
 R('calc1-extrema',1,{shape:'critical-point',f:'x^2 - 6x + 2',on:[0,5]},'6/2','2'),
 R('calc1-extrema',3,{shape:'extremum',f:'x^3 - 3x',on:[-2,0],kind:'max'},'sqrt(4)','-1'),
 R('calc1-shape',4,{shape:'limit',f:'(e^x - 1 - x)/x^2',at:0},'0.5','1'),
 R('calc1-shape',3,{shape:'limit',f:'(1 - cos(x))/x^2',at:0},'2/4','0'),
 R('calc1-optimisation',2,{shape:'extremum',f:'x(12 - x)',on:[0,12],kind:'max'},'6^2','6'),
 R('calc1-optimisation',4,{shape:'extremum',f:'x + 9/x',on:[1,5],kind:'min'},'12/2','3'),
 R('calc1-newton',1,{shape:'newton-step',f:'x^2 - 5',x0:2,steps:1},'9/4','2.5'),
 R('calc1-newton',3,{shape:'newton-step',f:'x^3 - 2x - 5',x0:3,steps:1},'59/25','2.4'),
 R('calc1-newton',5,{shape:'newton-step',f:'cos(x) - x',x0:1,steps:1},'0.7504','0.5'),
 R('calc1-antiderivatives',1,{shape:'antiderivative',f:'3x^2 + 4x'},'x^2(x + 2) + C','6x + 4 + C'),
 R('calc1-antiderivatives',3,{shape:'antiderivative',f:'cos(3x)'},'sin(3x)/3 + C','sin(3x) + C'),
 R('calc1-definite-integral',1,{shape:'definite-integral',f:'x^2',a:0,b:3},'27/3','3'),
 R('calc1-definite-integral',3,{shape:'definite-integral',f:'sin(x)',a:0,b:'pi/2'},'2/2','0'),
 R('calc1-area-so-far',2,{shape:'definite-integral',f:'x^2 + 1',a:0,b:3},'24/2','9'),
 R('calc1-area-so-far',3,{shape:'definite-integral',f:'4 - x^2',a:-2,b:2},'10 + 2/3','8'),
 R('calc1-ftc',4,{shape:'definite-integral',f:'2x + 1/sqrt(x)',a:1,b:4},'34/2','15'),
 R('calc1-ftc',3,{shape:'definite-integral',f:'e^x',a:0,b:'ln(2)'},'e^(ln(2)) - 1','2'),
 R('calc1-substitution',4,{shape:'antiderivative',f:'2x (x^2 + 1)^3'},'(x^2 + 1)^4/4 + C','(x^2 + 1)^4 + C'),
 R('calc1-substitution',5,{shape:'definite-integral',f:'x cos(x^2)',a:0,b:'sqrt(pi/2)'},'0.5','1'),
 R('calc1-area-average',2,{shape:'definite-integral',f:'x - x^2',a:0,b:1},'0.1667','1/2'),
 R('calc1-area-average',3,{shape:'definite-integral',f:'2x - x^2',a:0,b:2},'1 + 1/3','2'),
];
const shapesOf=(topic)=>CALC1_SPINE.find((t)=>t.id===topic).shapes;
/** A spec as the model sends it: points as strings in the plain notation, a two-sided limit's side '', a difficulty. */
const rawOf=(row)=>{const s=row.spec,o={...s,difficulty:row.difficulty};for(const k of ['at','a','b','x0'])if(typeof s[k]==='number')o[k]=String(s[k]);if(s.on)o.on=s.on.map(String);if(s.shape==='limit'&&!s.side)o.side='';return o;};
const questionOf=(spec)=>C.question(spec).plain;
const byQuestion=new Map(TABLE.map((r)=>[questionOf(r.spec),r]));
/** What the stub returns for a topic: its own specs first, then the table's others of shapes on its list - at most n + 3. */
const specsFor=(topic)=>[...TABLE.filter((r)=>r.topic===topic),...TABLE.filter((r)=>r.topic!==topic&&shapesOf(topic).includes(r.spec.shape))].slice(0,9);
/** The set the desk should make of them: easy to hard - difficulty, then the function's length - the first six. */
const expectedSet=(topic)=>[...specsFor(topic)].sort((a,b)=>a.difficulty-b.difficulty||a.spec.f.length-b.spec.f.length).slice(0,6);

// ------------------------------------------------------------------ the typeset check (as tools/calc-practice-test.cjs)
const UNI={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ˣ':'x','ⁿ':'n','₀':'0','₁':'1','₂':'2','₃':'3','ₙ':'n','½':'12','¼':'14','¾':'34','⅓':'13'};
const PLAIN_SIGNS=/(?<![a-zA-Z])(sqrt|cbrt|int|sum|prod|infinity|inf|pi|alpha|beta|gamma|delta|epsilon|theta|lambda|rho|sigma|tau|phi|omega|Gamma|Delta|Theta|Lambda|Sigma|Phi|Omega)(?![a-zA-Z])/g;
const expected=(s)=>[...s].map(c=>UNI[c]??c).join('').replace(PLAIN_SIGNS,' ').replace(/[^0-9a-zA-Z]/g,'');
const alnum=(s)=>s.replace(/[^0-9a-zA-Z]/g,'');
function subsequence(needle,hay){let i=0;for(const c of hay)if(c===needle[i])i++;return i===needle.length;}
function leaves(nodes){const out=[];T.walk(nodes,n=>{if('v' in n)out.push(n);});return out;}
function typesetFault(line){
 let nodes;try{nodes=T.parseMath(line);T.flatten(nodes);}catch(e){return `throws: ${e.message}`;}
 if(!subsequence(expected(line),alnum(T.flatten(nodes))))return `dropped: ${T.flatten(nodes)}`;
 const ls=leaves(nodes);
 if(ls.some(n=>String(n.v).includes('\\'))||ls.some(n=>n.t==='text'&&/^(d|t)?frac$|^sqrt$/.test(n.v)))return 'raw-tex';
 return '';
}

test('1: the table cannot lie - 44+ specs, two or more per calc1 topic on its own shapes, each well formed, typeset, read back, its right answer right and leaking, its wrong one wrong',()=>{
 assert.ok(TABLE.length>=44,`at least 44 specs (${TABLE.length})`);
 const bad=[];
 for(const t of CALC1_SPINE)if(TABLE.filter((r)=>r.topic===t.id).length<2)bad.push(`${t.id}: fewer than two specs`);
 assert.equal(new Set(TABLE.map((r)=>r.topic)).size,CALC1_SPINE.length,'every topic, and no stale id');
 assert.equal(byQuestion.size,TABLE.length,'no two specs print the same question');
 for(const r of TABLE){
  const where=`${r.topic} ${r.spec.shape} ${r.spec.f}`;
  if(!shapesOf(r.topic).includes(r.spec.shape))bad.push(`${where}: not a shape of its topic`);
  const w=C.wellFormed(r.spec);if(!w.ok){bad.push(`${where}: ${w.why}`);continue;}
  const q=C.question(r.spec);
  const fp=typesetFault(q.plain);if(fp)bad.push(`${where}: ${q.plain}: ${fp}`);
  if(C.leaksCalc(r.spec,q.plain))bad.push(`${where}: the question states its own result`);
  const back=C.specFromQuestion(q.plain);
  if(!back||back.shape!==r.spec.shape||!C.wellFormed(back).ok)bad.push(`${where}: the page reader does not read "${q.plain}" back (${JSON.stringify(back)})`);
  const right=C.checkAnswer(r.spec,r.right),wrong=C.checkAnswer(r.spec,r.wrong);
  if(right.verdict!=='right')bad.push(`${where}: right "${r.right}" -> ${JSON.stringify(right)}`);
  if(wrong.verdict!=='wrong')bad.push(`${where}: wrong "${r.wrong}" -> ${JSON.stringify(wrong)}`);
  if(r.right.replace(/\s+/g,'')===String(r.spec.f).replace(/\s+/g,''))bad.push(`${where}: the right answer is the function`);
  // the right answer said as a hint or a reply is a leak the desk must catch
  if(!C.leaksCalc(r.spec,r.right))bad.push(`${where}: "${r.right}" does not read as a leak`);
 }
 assert.deepEqual(bad,[]);
 for(const t of CALC1_SPINE)assert.ok(expectedSet(t.id).length>=3,`${t.id}: a set of at least three (right, wrong and unsure in one mark)`);
});

// ------------------------------------------------------------------ the stubs: one text engine, one vision engine
/** What the text stub answers, by the request's schema; each kind's calls are counted. */
const calls={practice:0,explain:0,hint:0,lesson:0,other:0,vision:0};
let textPlan={};
function stubEngines(){
 reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
 reg.useProvider('text',{name:'stub',run:async(req)=>{
  const p=Object.keys(req.schema?.properties??{});
  const kind=p.includes('specs')?'practice':p.includes('reply')?'explain':p.includes('lesson')?'lesson':p.includes('hint')?'hint':p.includes('items')?'practice':'other';
  calls[kind]++;
  if(kind==='lesson')return {raw:JSON.stringify({lesson:'none',why:'none covers it'})};
  const a=textPlan[kind];
  const v=typeof a==='function'?a(req):Array.isArray(a)?a.shift():a;
  if(v===undefined)throw new Error(`stub: no ${kind} answer planned`);
  return {raw:JSON.stringify(v)};
 }});
}
let visionPlan=null;
const stubVision=()=>reg.useProvider('vision',{name:'stub',run:async()=>{calls.vision++;return {raw:JSON.stringify(visionPlan)};}});

// ------------------------------------------------------------------ withholding, after every step
const SHOWN=new Set(['n','question','studentAnswer','studentWorking','verdict','slip','said','reply','slipAt','spec']);
const SPEC_KEYS=new Set(['shape','f','at','a','b','side','on','kind','x0','steps']);
const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];
/** The desk's own lines for a set on this topic: RIGHT, ASK, and the topic's slips in their own words. */
const ownLines=(topic,n)=>new Set([...Array.from({length:n},(_,i)=>[M.RIGHT(i+1),M.ASK(i+1)]).flat(),...M.slipsFor(topic).map((s)=>s.says)]);
let scans=0;
function scan(where){
 const s=store.getSession();
 for(const role of ['tv','phone','guest']){
  const v=view(s,role),at=`${where} (${role})`;
  scans++;
  for(const k of ['answer','solution','truth','zero'])assert.equal(keysIn(v).includes(k),false,`${at}: a key named ${k}`);
  assert.equal('away' in v,false,`${at}: another learner's work reached a screen`);
  if(role==='guest'){assert.equal(v.practice,null,`${at}: a guest sees no practice`);assert.deepEqual(v.skills,{},`${at}: nor any skill`);continue;}
  const items=v.practice?.items??[];
  const own=v.practice?ownLines(v.practice.topic,items.length):new Set();
  for(const it of items){
   for(const k of Object.keys(it))assert.ok(SHOWN.has(k),`${at}: item ${it.n} carries ${k}`);
   if(it.spec){
    for(const k of Object.keys(it.spec))assert.ok(SPEC_KEYS.has(k),`${at}: item ${it.n}'s spec carries ${k}`);
    assert.equal(C.leaksCalc(it.spec,it.question),false,`${at}: item ${it.n}'s question states its result: ${it.question}`);
   }
   if(it.said!==undefined)assert.ok(own.has(it.said),`${at}: item ${it.n} said "${it.said}" - not the desk's own line`);
   // a reply is the desk's own line, or a model's reply the item's leak rule has passed (the course's replies all leak, so they are the desk's)
   if(it.reply!==undefined)assert.ok(own.has(it.reply)||!(it.spec?C.leaksCalc(it.spec,it.reply):M.leaks(it.question,it.reply)),`${at}: item ${it.n} reply "${it.reply}" states the answer`);
  }
 }
}

// ------------------------------------------------------------------ steps, timed
const times=[];
async function step(label,fn){const t=process.hrtime.bigint();const out=await fn();times.push([Number(process.hrtime.bigint()-t)/1e6,label]);scan(label);return out;}
const skill=(id,topic)=>learners.getLearner(id).skills[topic]??{seen:0,right:0,slips:[],secure:false,estimate:0};
function seat(id,mathPath){
 store.dispatch({type:'profile.draft',patch:{id,name:id===CALC?'Calc':'School',type:'other',modules:['maths'],...(mathPath?{mathPath}:{})}});
 store.dispatch({type:'profile.save'});
 assert.equal(store.getSession().learner.id,id);
}
function onPage(key,text){
 const page={id:`page-${key}`,subject:'maths',title:'Sheet',img:'',w:100,h:100};
 store.dispatch({type:'page.reading',page});store.dispatch({type:'page.read',id:page.id,items:[{n:1,text,cx:0,cy:0,band:[0,10],key}],readMs:1,provider:'test'});
}
/** A page reading: for each item the answer written, working, a slip pick, and the model's own unasked verdict and solution. */
const reading=(answers)=>({items:answers.map((a,i)=>({n:i+1,studentAnswer:a,studentWorking:a?'first line\nsecond line':'',slip:'arithmetic-slip',verdict:'right',solution:'SOLVED 42'}))});
const UNREADABLE='squiggle ## ~';
const CLEAN={hint:'Name the rule that applies here, then take only the first step.',what_to_try_next:'Write that first line on your paper.'};

// ------------------------------------------------------------------ the school path first: its learner's record is watched all through
let schoolSkills=null;
const SCHOOL_SET=[{question:'2x+3=11',answer:'4'},{question:'3x-5=10',answer:'5'},{question:'4x+1=9',answer:'2'},{question:'5x-2=13',answer:'3'},{question:'2x-7=1',answer:'4'},{question:'6x+5=23',answer:'3'}];
test('2: the school path through the same routes - linear-two-step practice, mark, explain and hint behave as before',async()=>{
 stubEngines();stubVision();
 store.dispatch({type:'reset'});
 await step('school seat',()=>seat(SCHOOL));
 assert.equal(P.learnerPath(store.getSession()),'school');
 textPlan={practice:{items:SCHOOL_SET}};
 let r=await step('school practice',()=>post('practice',{topic:'linear-two-step'}));
 assert.equal(r.status,200,JSON.stringify(r.body));
 let s=store.getSession();
 assert.deepEqual(s.practice.items.map((i)=>i.question),SCHOOL_SET.map((c)=>c.question));
 assert.ok(s.practice.items.every((i)=>!('spec' in i)),'a school item has no spec');
 // the old reading: the model's own solution and verdict, which the substitution checks
 visionPlan={items:[
  {n:1,studentAnswer:'4',studentWorking:'2x = 8\nx = 4',verdict:'right',solution:'4',slip:'unclear'},
  {n:2,studentAnswer:'3',studentWorking:'3x = 5 + 10 - 6\nx = 3',verdict:'right',solution:'5',slip:'undo-wrong-order'},
  {n:3,studentAnswer:'',studentWorking:'',verdict:'right',solution:'2',slip:'unclear'},
  {n:4,studentAnswer:'3',studentWorking:'5x = 15',verdict:'right',solution:'3',slip:'unclear'},
  {n:5,studentAnswer:'4',studentWorking:'2x = 8',verdict:'right',solution:'4',slip:'unclear'},
  {n:6,studentAnswer:'3',studentWorking:'6x = 18',verdict:'right',solution:'3',slip:'unclear'},
 ]};
 r=await step('school mark',()=>post('mark',PHOTO));
 assert.equal(r.status,200);assert.deepEqual([r.body.right,r.body.wrong,r.body.unsure],[4,1,1]);
 s=store.getSession();
 const undo=M.slipsFor('linear-two-step').find((x)=>x.id==='undo-wrong-order');
 assert.deepEqual(s.practice.items.map((i)=>i.verdict),['right','wrong','unsure','right','right','right']);
 assert.deepEqual([s.practice.items[1].slip,s.practice.items[1].said],['undo-wrong-order',undo.says],'a wrong one wrong with a school slip');
 assert.equal(skill(SCHOOL,'linear-two-step').seen,5,'the unsure item is not an attempt');
 textPlan={explain:{reply:'Look at what you did to both sides first.',slip:'unclear',value:'2'}};
 r=await step('school explain',()=>post('explain',{transcript:'I took one off and got two',n:2}));
 assert.equal(r.status,200);assert.equal(r.body.settled,'right');assert.equal(r.body.reply,'Look at what you did to both sides first.');
 assert.equal(skill(SCHOOL,'linear-two-step').right,5);
 onPage('school-k','Solve for x:  2x + 3 = 11');
 textPlan={hint:[{hint:'What is being done to x first?',what_to_try_next:'Write the two sides one under the other.'}]};
 const before={...calls};
 r=await step('school hint',async()=>{const x=await post('hint',{});await drain();return x;});
 assert.equal(r.status,200);assert.equal(r.body.hint,'What is being done to x first?');
 assert.deepEqual([calls.hint-before.hint,calls.lesson-before.lesson],[1,1],'one hint call and, on the school path, one lesson pick');
 textPlan={hint:[{hint:'So x = 4.',what_to_try_next:'Check it.'},{hint:'It is 4.',what_to_try_next:'Done.'}]};
 r=await step('school hint withheld',async()=>{const x=await post('hint',{});await drain();return x;});
 assert.deepEqual([r.body.hint,r.body.next],[M.withheldLine('Solve for x:  2x + 3 = 11'),''],'a second leak gets the school line');
 schoolSkills=structuredClone(learners.getLearner(SCHOOL).skills);
 assert.deepEqual(Object.keys(schoolSkills),['linear-two-step']);
});

// ------------------------------------------------------------------ the course
test('3: the whole Calculus 1 course - 22 topics practised, marked, explained, hinted and latched secure in the spine\'s order',async()=>{
 assert.ok(schoolSkills,'the school test ran first');
 stubEngines();stubVision();
 await step('calc seat',()=>seat(CALC,'calc1'));
 assert.equal(P.learnerPath(store.getSession()),'calc1');
 assert.deepEqual(topicStops(store.getSession()).map((t)=>t.id),CALC1_SPINE.map((t)=>t.id),'Topics walks the course');
 const secured=[];
 for(const t of CALC1_SPINE){
  const topic=t.id;
  // the path is followable: the topic is open next before it is started
  let st=topicStates(view(store.getSession(),'tv'));
  assert.equal(st[topic],'next',`${topic}: open next before it is started (its prereqs ${t.prereq.join(', ')||'none'})`);

  // ---- practice: specs from the model, printed, checked and ordered by code
  const want=expectedSet(topic);
  textPlan={practice:()=>({specs:specsFor(topic).map(rawOf)})};
  let r=await step(`${topic} practice`,()=>post('practice',{topic}));
  assert.equal(r.status,200,`${topic}: ${JSON.stringify(r.body)}`);
  let s=store.getSession();
  assert.equal(s.practice.topic,topic);
  assert.deepEqual(s.practice.items.map((i)=>i.question),want.map((w)=>questionOf(w.spec)),`${topic}: the set, easy to hard, printed by code`);
  assert.deepEqual(s.practice.items.map((i)=>i.spec),want.map((w)=>w.spec),`${topic}: each item carries its spec as the desk reads it`);
  const k=want.length;

  // ---- a mixed page: right, wrong, blank, unreadable, right, wrong - checkAnswer decides, the model's 'right' never counts
  const plan=['right','wrong','blank','unreadable','right','wrong'].slice(0,k);
  const answers=plan.map((p,i)=>p==='right'?want[i].right:p==='wrong'?want[i].wrong:p==='blank'?'':UNREADABLE);
  const verdicts=answers.map((a,i)=>C.checkAnswer(want[i].spec,a).verdict);
  assert.deepEqual(verdicts,plan.map((p)=>p==='right'?'right':p==='wrong'?'wrong':'unsure'),`${topic}: the mix is right, wrong and unsure`);
  const was=skill(CALC,topic);
  visionPlan=reading(answers);
  r=await step(`${topic} mark`,()=>post('mark',PHOTO));
  assert.equal(r.status,200,`${topic}: ${JSON.stringify(r.body)}`);
  const count=(v)=>verdicts.filter((x)=>x===v).length;
  assert.deepEqual([r.body.right,r.body.wrong,r.body.unsure],[count('right'),count('wrong'),count('unsure')],`${topic}: the counts are code's`);
  s=store.getSession();
  assert.deepEqual(s.practice.items.map((i)=>i.verdict),verdicts,`${topic}: every verdict is checkAnswer's`);
  const vocab=M.slipsFor(topic);
  for(const it of s.practice.items.filter((i)=>i.verdict==='wrong')){
   const sl=vocab.find((x)=>x.id===it.slip);
   assert.ok(sl,`${topic} #${it.n}: the shown slip ${it.slip} is from the topic's vocabulary`);
   assert.equal(it.said,sl.says,`${topic} #${it.n}: said in the slip's own words`);
  }
  assert.equal(skill(CALC,topic).seen-was.seen,count('right')+count('wrong'),`${topic}: an unsure item is no attempt`);
  assert.equal(skill(CALC,topic).right-was.right,count('right'),`${topic}: right attempts`);

  // ---- the blank item is settled by what the learner says they got; a reply that states it is the desk's own line
  const blank=plan.indexOf('blank');
  textPlan={explain:{reply:want[blank].right,slip:'unclear',value:want[blank].right}};
  r=await step(`${topic} explain`,()=>post('explain',{transcript:'this is what I got',n:blank}));
  assert.equal(r.status,200);assert.equal(r.body.settled,'right',`${topic}: settled from the spoken answer`);
  assert.equal(r.body.reply,M.RIGHT(blank+1),`${topic}: the reply stated the answer, so the desk's own line stands in`);
  s=store.getSession();
  assert.deepEqual([s.practice.items[blank].verdict,s.practice.items[blank].said,s.practice.items[blank].reply],['right',M.RIGHT(blank+1),M.RIGHT(blank+1)]);
  assert.equal(skill(CALC,topic).secure,false,`${topic}: one mixed evening does not latch it`);

  // ---- a hint on a page item of the topic's question: clean kept; a leak re-asked once; a second leak the shape's sentence
  const hq=questionOf(want[0].spec),hspec=want[0].spec;
  onPage(`k-${topic}`,hq);
  const before={...calls};
  textPlan={hint:[CLEAN]};
  r=await step(`${topic} hint`,async()=>{const x=await post('hint',{});await drain();return x;});
  assert.equal(r.status,200);assert.deepEqual([r.body.hint,r.body.next],[CLEAN.hint,CLEAN.what_to_try_next]);
  assert.equal(C.leaksCalc(hspec,r.body.hint)||C.leaksCalc(hspec,r.body.next),false);
  textPlan={hint:[{hint:want[0].right,what_to_try_next:'Check it.'},CLEAN]};
  r=await step(`${topic} hint re-asked`,async()=>{const x=await post('hint',{});await drain();return x;});
  assert.deepEqual([r.body.hint,r.body.next],[CLEAN.hint,CLEAN.what_to_try_next],`${topic}: the re-ask's clean hint`);
  textPlan={hint:[{hint:want[0].right,what_to_try_next:'Check it.'},{hint:'Look.',what_to_try_next:want[0].right}]};
  r=await step(`${topic} hint withheld`,async()=>{const x=await post('hint',{});await drain();return x;});
  assert.deepEqual([r.body.hint,r.body.next],[C.withheldCalc(hspec),''],`${topic}: the shape's fixed sentence`);
  assert.equal(calls.hint-before.hint,5,`${topic}: 1 + 2 + 2 hint calls, no third ask`);
  assert.equal(calls.lesson-before.lesson,0,`${topic}: no pickLesson call on the calc1 path`);
  assert.equal(store.getSession().noLesson,true);

  // ---- mastery: four evenings of right work latch the topic
  for(let round=1;round<=4;round++){
   textPlan={practice:()=>({specs:specsFor(topic).map(rawOf)})};
   r=await step(`${topic} practice ${round}`,()=>post('practice',{topic}));
   assert.equal(r.status,200);
   visionPlan=reading(want.map((w)=>w.right));
   r=await step(`${topic} mark ${round}`,()=>post('mark',PHOTO));
   assert.deepEqual([r.body.right,r.body.wrong,r.body.unsure],[k,0,0],`${topic} round ${round}`);
  }
  const rec=skill(CALC,topic);
  assert.equal(rec.secure,true,`${topic}: secure after four evenings (estimate ${rec.estimate.toFixed(3)}, ${rec.seen} seen)`);
  assert.ok(rec.estimate>=0.85&&rec.seen>=4,'the latch: 0.85 with four attempts seen');
  secured.push(topic);

  // ---- the TV reads it: secure, and next for every topic whose prereqs are now all secure (the spine's order)
  const v=view(store.getSession(),'tv');
  assert.equal(v.skills[topic]?.secure,true,`${topic}: the session's record says secure`);
  st=topicStates(v);
  for(const u of CALC1_SPINE){
   const wantState=secured.includes(u.id)?'secure':u.prereq.every((p)=>secured.includes(p))?'next':'later';
   assert.equal(st[u.id],wantState,`after ${topic}: ${u.id}`);
  }
  const frontier=P.nextOn('calc1',secured);
  assert.equal(topicsFocus(v),frontier?CALC1_SPINE.findIndex((u)=>u.id===frontier.id):0,`after ${topic}: Teach opens Topics at the frontier`);
 }

 // ---- the end of the course
 const v=view(store.getSession(),'tv'),ps=pathSecure(v);
 assert.equal(ps.path,'calc1');assert.equal(ps.secure.length,22);assert.equal(ps.topics.length,22);
 assert.equal(secureTitle(ps.secure.length,ps.topics.length,ps.first),'Every topic on the path is secure');
 assert.equal(topicsFocus(v),0,'every topic secure: the teach door opens Topics at 0, as designed');
 assert.ok(Object.values(topicStates(v)).every((x)=>x==='secure'));

 // ---- neither path touched the other's record
 const calcSkills=learners.getLearner(CALC).skills;
 assert.deepEqual(Object.keys(calcSkills).filter((k)=>k.startsWith('linear-')),[],'the calc learner has no school record');
 assert.deepEqual(learners.getLearner(SCHOOL).skills,schoolSkills,'the school learner\'s record is untouched by the course');

 // ---- a profile moved from calc1 to school and back keeps each path's skills
 seat(CALC,'school');
 let w=view(store.getSession(),'tv'),q=pathSecure(w);
 assert.equal(q.path,'school');assert.equal(q.secure.length,0,'the school path reads only school records');
 assert.deepEqual(Object.keys(topicStates(w)),P.topicsOf('school').map((t)=>t.id));
 assert.equal(Object.keys(learners.getLearner(CALC).skills).length,22,'the calc1 record is kept while on the school path');
 seat(CALC,'calc1');
 w=view(store.getSession(),'tv');q=pathSecure(w);
 assert.equal(q.secure.length,22,'back on calc1: every topic still secure');
 assert.equal(secureTitle(q.secure.length,q.topics.length,q.first),'Every topic on the path is secure');
 // and the school learner, seated again, finds their own record as they left it
 seat(SCHOOL);
 assert.deepEqual(learners.getLearner(SCHOOL).skills,schoolSkills);
 assert.equal(store.getSession().skills['linear-two-step']?.seen,schoolSkills['linear-two-step'].seen,'the session reads the school learner\'s record');
 assert.ok(!Object.keys(store.getSession().skills).some((k)=>k.startsWith('calc1-')),'and none of the calc learner\'s');

 const slow=[...times].sort((a,b)=>b[0]-a[0])[0];
 const total=times.reduce((n,[ms])=>n+ms,0);
 console.log(`# course: ${times.length} steps, ${scans} view scans, ${(total/1000).toFixed(1)} s in steps; slowest ${slow[0].toFixed(0)} ms (${slow[1]}); model calls stubbed: ${JSON.stringify(calls)}`);
});
