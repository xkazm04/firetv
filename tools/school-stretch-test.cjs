/**
 * The STEP-UP (Family W8): how hard a school set is, set by CODE from the learner's school year and the unit's year
 * (rules/stretch baselineMix, stepUpMix, tierCounts, setMix), and a second, latched record for sets asked for as "a step up"
 * (lib/session/learners.ts SkillRecord.stretch, recordAttempt with { stretch }). The baseline is four tier-1 and two tier-2
 * items when the unit is ahead of the learner's year, three and three otherwise (and when the year is unknown); a step up
 * is one rung harder (standard -> two and four, easier -> three and three). A step-up attempt moves only the step-up
 * record and a usual attempt only the usual one, so a slip at step-up can never unset the usual record; the step-up
 * record latches by the same rule and never unlatches. The flag rides the set and each item from the practice route
 * through the store, typed and photo marking, and an explanation's settle. No number and no points reach the history.
 * Run with npm test in desk/ (directly: node tools/school-stretch-test.cjs). No model is called - the text and vision
 * engines are stubbed at the provider registry and THROW where a school set must not call them - and the data directory
 * is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`desk-school-stretch-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const R=require(src('lib/rules/stretch.ts'));
const S=require(src('lib/rules/school.ts'));
const Y=require(src('lib/library/syllabus.ts'));
const P=require(src('lib/library/paths.ts'));
const {makeItems,makeSchoolItems}=require(src('lib/desk/items.ts'));
const {markTyped}=require(src('lib/desk/mark.ts'));
const X=require(src('lib/desk/explain.ts'));
const {recapRows,recapLine}=require(src('tv/recapRows.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const SYSTEMS=['us','uk','cz','de'];
const UNITS=Object.keys(S.SCHOOL_GENERATORS);
const UNIT='frac-add-sub';
let seen=[];
/** Every engine throws: a school set, typed marking and the route must reach none of them. */
const noModel=()=>{seen=[];for(const kind of ['text','vision'])reg.useProvider(kind,{name:'stub',run:async(req)=>{seen.push(req);throw new Error(`the ${kind} engine was called`);}});};
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
let LEARNER='school-stretch-scratch',seats=0;
function seat(patch={}){
 LEARNER=`school-stretch-scratch-${++seats}`;
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Mia',type:'elementary',age:12,system:'uk',modules:['maths'],...patch}});store.dispatch({type:'profile.save'});
}
const tiers=(items)=>items.map((i)=>i.tier);
const twos=(items)=>items.filter((i)=>i.tier===2).length;
/** The usual record's own fields, as JSON: everything but the step-up record. */
const usual=(rec)=>{if(!rec)return 'none';const {stretch,...rest}=rec;return JSON.stringify(rest);};
/** A right answer to a generated a/b +- c/d, unsimplified (gen asks no simplest form). */
const answerOf=(spec)=>{const m=/^(\d+)\/(\d+) ([-+]) (\d+)\/(\d+)$/.exec(spec.expr);assert.ok(m,spec.expr);const [a,b,c,d]=[+m[1],+m[2],+m[4],+m[5]];return `${m[3]==='+'?a*d+c*b:a*d-c*b}/${b*d}`;};

// ------------------------------------------------------------------ 1. the baseline mix, by code
test('1: the baseline mix - four and two when the unit is ahead of the learner\'s school year, three and three at or past it and when the year is unknown - across every unit, year and system',()=>{
 assert.deepEqual([...R.MIXES],['easier','standard','harder']);
 assert.deepEqual(R.tierCounts('easier'),{tier1:4,tier2:2});
 assert.deepEqual(R.tierCounts('standard'),{tier1:3,tier2:3});
 assert.deepEqual(R.tierCounts('harder'),{tier1:2,tier2:4});
 assert.deepEqual(R.tierCounts('standard',5),{tier1:3,tier2:2},'n is honoured: the first half rounded up, as before W8');
 assert.deepEqual([R.tierCounts('harder',1),R.tierCounts('easier',1),R.tierCounts('standard',0)],[{tier1:0,tier2:1},{tier1:1,tier2:0},{tier1:0,tier2:0}]);
 // the pure rule on two years
 for(const [u,l,want] of [[6,8,'standard'],[8,8,'standard'],[9,8,'easier'],[7,6,'easier'],[5,undefined,'standard'],[undefined,7,'standard'],[NaN,7,'standard'],[7,Infinity,'standard']])assert.equal(R.baselineMix(u,l),want,`${u}/${l}`);
 assert.deepEqual(['easier','standard','harder'].map(R.stepUpMix),['standard','harder','harder']);
 // the learner's school year is the SCHOOL tick's: age - SYSTEM_START + 1
 assert.deepEqual(SYSTEMS.map((sys)=>Y.schoolYear(sys,12)),[7,8,7,7]);
 assert.equal(R.learnerYear({age:12,system:'uk'}),8);assert.equal(R.learnerYear({age:12}),8,'no system is the UK default');
 assert.equal(R.learnerYear({}),undefined);assert.equal(R.learnerYear({age:12,system:'xx'}),undefined);
 // the table over every unit with a generator, ages 10-14 and none, in all four systems
 let rows=0,easier=0;
 for(const unit of UNITS)for(const system of SYSTEMS)for(const age of [10,11,12,13,14,undefined]){
  const uy=Y.topic(unit).year[system],ly=age===undefined?undefined:age-Y.SYSTEM_START[system]+1;
  const want=ly!==undefined&&ly<uy?'easier':'standard';
  assert.equal(R.setMix(unit,{age,system},false),want,`${unit} ${system} age ${age}`);rows++;if(want==='easier')easier++;
 }
 assert.equal(rows,UNITS.length*4*6);assert.ok(easier>20&&easier<rows-20,`both rungs occur in the table (${easier} easier of ${rows})`);
 // spot rows a teacher can read
 const at=(unit,age,system)=>R.setMix(unit,{age,system},false);
 assert.equal(at('frac-add-sub',12,'uk'),'standard','a UK 12-year-old (Year 8) on a Year 6 unit');
 assert.equal(at('pct-change',11,'uk'),'easier','a UK 11-year-old (Year 7) on a Year 8 unit');
 assert.equal(at('ratio-share',11,'us'),'easier','a US 11-year-old (Grade 6) on a Grade 7 unit');
 assert.equal(at('area',12,'cz'),'standard','a Czech 12-year-old (7. ročník) on a 7. ročník unit');
 assert.equal(at('dec-arith',10,'de'),'easier','a German 10-year-old (Klasse 5) on a Klasse 6 unit');
 assert.equal(at('mean-range',11,'de'),'standard','a German 11-year-old (Klasse 6) on a Klasse 6 unit');
 assert.equal(at('frac-equivalent',undefined,'cz'),'standard','no age: the standard mix');
 assert.equal(R.setMix('linear-one-step',{age:10,system:'uk'},false),'easier','a linear topic has a year too (its set has no tiers: the model writes it)');
 assert.equal(R.setMix('calc1-limits',{age:10,system:'uk'},false),'standard','a course topic has no school year');
});

// ------------------------------------------------------------------ 2. a step up is harder, same content, zero calls
test('2: a step-up set is strictly harder than the baseline for every unit with a generator, for every learner - still six distinct items, and no model call',async()=>{
 for(const unit of UNITS)for(const system of SYSTEMS)for(const age of [10,11,12,13,14,undefined]){
  const base=R.tierCounts(R.setMix(unit,{age,system},false)),up=R.tierCounts(R.setMix(unit,{age,system},true));
  assert.ok(up.tier2>base.tier2&&up.tier1+up.tier2===6,`${unit} ${system} ${age}: ${JSON.stringify(base)} -> ${JSON.stringify(up)}`);
 }
 seat();noModel();
 for(const unit of UNITS){
  for(const [who,wantBase,wantUp] of [[{age:12,system:'uk'},null,null],[{age:10,system:'de'},null,null],[{},[1,1,1,2,2,2],[1,1,2,2,2,2]]]){
   const b=await makeItems(unit,LEARNER,6,who),u=await makeItems(unit,LEARNER,6,{...who,stretch:true});
   assert.equal(seen.length,0,'no engine was called');
   for(const r of [b,u]){assert.equal(r.provider,'code');assert.equal(r.tries,0);assert.equal(r.items.length,6,`${unit}: six items`);assert.equal(new Set(r.items.map((i)=>i.question)).size,6,`${unit}: six distinct`);
    for(const it of r.items){assert.equal(S.unitOf(it.spec),unit,'the same unit: the mix, not new content');assert.ok(S.wellFormed(it.spec).ok);}}
   assert.ok(twos(u.items)>twos(b.items),`${unit} ${JSON.stringify(who)}: ${tiers(b.items)} -> ${tiers(u.items)}`);
   if(wantBase){assert.deepEqual(tiers(b.items),wantBase);assert.deepEqual(tiers(u.items),wantUp);}
   assert.ok(b.items.every((i)=>!('stretch' in i)),'a usual item carries no flag');
   assert.ok(u.items.every((i)=>i.stretch===true),'every step-up item carries the flag beside its tier');
  }
 }
 // the pure writer at each rung, from one seed
 assert.deepEqual(tiers(makeSchoolItems(UNIT,6,11,'easier').items),[1,1,1,1,2,2]);
 assert.deepEqual(tiers(makeSchoolItems(UNIT,6,11).items),[1,1,1,2,2,2],'the default is the standard mix');
 assert.deepEqual(tiers(makeSchoolItems(UNIT,6,11,'harder',true).items),[1,1,2,2,2,2]);
});

test('2b: the practice route writes a step up from the seated profile\'s year - the set and each item flagged, zero calls - and a usual set exactly as before',async()=>{
 seat({age:12,system:'uk'});noModel();
 let r=await post('practice',{topic:UNIT,stretch:true});
 assert.equal(r.status,200);assert.deepEqual(await r.json().then((b)=>[b.items,b.provider,b.tries]),[6,'code',0]);
 assert.equal(seen.length,0,'the engine was never reached');
 let p=store.getSession().practice;
 assert.equal(p.stretch,true);assert.deepEqual(tiers(p.items),[1,1,2,2,2,2],'a UK Year 8 on a Year 6 unit: a step up from three and three');
 assert.ok(p.items.every((i)=>i.stretch===true));
 assert.deepEqual(store.getSession().jobs.practice.input,{topic:UNIT,stretch:1},'a failed step up is retried as a step up (a job input keeps numbers)');
 r=await post('practice',{topic:UNIT});p=store.getSession().practice;
 assert.equal(r.status,200);assert.ok(!('stretch' in p)&&p.items.every((i)=>!('stretch' in i)),'a usual set has no flag anywhere');
 assert.deepEqual(tiers(p.items),[1,1,1,2,2,2]);assert.deepEqual(store.getSession().jobs.practice.input,{topic:UNIT});
 for(const junk of ['yes',0,null,{},[true]]){await post('practice',{topic:UNIT,stretch:junk});assert.ok(!('stretch' in store.getSession().practice),`stretch ${JSON.stringify(junk)} is a usual set`);}
 await post('practice',{topic:UNIT,stretch:1});assert.equal(store.getSession().practice.stretch,true,'1 is the retried step up');
 // a unit ahead of the learner: an 11-year-old in Year 7 on a Year 8 unit gets four and two, and a step up three and three
 seat({age:11,system:'uk'});noModel();
 await post('practice',{topic:'pct-change'});assert.deepEqual(tiers(store.getSession().practice.items),[1,1,1,1,2,2]);
 await post('practice',{topic:'pct-change',stretch:true});assert.deepEqual(tiers(store.getSession().practice.items),[1,1,1,2,2,2]);
 // a learner who is not at school: no year, the standard mix
 seat({type:'other',age:undefined,system:undefined});noModel();
 await post('practice',{topic:'pct-change'});assert.deepEqual(tiers(store.getSession().practice.items),[1,1,1,2,2,2]);
 assert.equal(seen.length,0);
 // the store keeps the flag only as true: an event carrying junk is a usual set
 store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,stretch:'yes',items:[{n:1,question:'Work out 1/2 + 1/4.',spec:{shape:'compute',expr:'1/2 + 1/4'},tier:1,stretch:1}]}});
 p=store.getSession().practice;assert.ok(!('stretch' in p)&&!('stretch' in p.items[0]));
});

test('2c: a step up on a topic with no generator asks the model road exactly as usual and only flags the set',async()=>{
 seat();
 const asked=[];
 reg.useProvider('text',{name:'stub',run:async(req)=>{asked.push(req);return {raw:JSON.stringify({items:[1,2,3,4,5,6,7].map((k)=>({question:`x + ${k} = ${k+3}`,answer:'3'}))})};}});
 const u=await makeItems('linear-one-step',LEARNER,6,{age:12,system:'uk',stretch:true});
 const b=await makeItems('linear-one-step',LEARNER,6,{age:12,system:'uk'});
 assert.equal(asked.length,2);assert.equal(asked[0].prompt,asked[1].prompt,'the same prompt: the model road has no tiers');
 assert.ok(u.items.length>0&&u.items.every((i)=>i.stretch===true&&!('tier' in i)));
 assert.ok(b.items.every((i)=>!('stretch' in i)));
});

// ------------------------------------------------------------------ 3. two records, never crossed
test('3: a step-up attempt moves only the step-up record - the usual record is byte-identical - and a usual attempt only the usual one',()=>{
 const id='stretch-rec-1',topic=UNIT;
 // a fresh topic: a step-up attempt leaves the usual fields at nothing seen
 let r=learners.recordAttempt(id,topic,true,undefined,{stretch:true,tier:2});
 assert.deepEqual({...r,stretch:{...r.stretch,lastSeen:0}},{topic,seen:0,right:0,estimate:0,secure:false,lastSeen:0,slips:[],stretch:{seen:1,right:1,estimate:0.3,secure:false,lastSeen:0}});
 for(let k=0;k<3;k++)learners.recordAttempt(id,topic,k!==1,k===1?'tops-and-bottoms':undefined);
 const u0=learners.getLearner(id).skills[topic];
 assert.equal(u0.seen,3);assert.deepEqual(u0.slips,['tops-and-bottoms']);
 const s0=JSON.stringify(u0.stretch);
 assert.equal(s0,JSON.stringify(r.stretch),'three usual attempts left the step-up record byte-identical');
 // step-up attempts, right, wrong, with a slip: the usual record does not move by a byte
 for(const [right,slip] of [[true],[false,'top-not-scaled'],[true],[false]]){
  learners.recordAttempt(id,topic,right,slip,{stretch:true,tier:1});
  assert.equal(usual(learners.getLearner(id).skills[topic]),usual(u0),'the usual record is byte-identical');
 }
 const after=learners.getLearner(id).skills[topic];
 assert.equal(after.stretch.seen,5);assert.equal(after.stretch.right,3);
 assert.deepEqual(after.slips,['tops-and-bottoms'],'a slip at step-up is not added to the usual slips');
 // and back: a usual attempt leaves the step-up record byte-identical
 const s1=JSON.stringify(after.stretch);
 learners.recordAttempt(id,topic,false,'tops-one-bottom');learners.recordAttempt(id,topic,true);
 assert.equal(JSON.stringify(learners.getLearner(id).skills[topic].stretch),s1);
 // no flag, false, or junk: a usual attempt, as every call before W8
 const before=JSON.stringify(learners.getLearner(id).skills[topic].stretch);
 learners.recordAttempt(id,topic,true);learners.recordAttempt(id,topic,true,undefined,{});learners.recordAttempt(id,topic,true,undefined,{stretch:false});learners.recordAttempt(id,topic,true,undefined,{stretch:'yes'});
 assert.equal(JSON.stringify(learners.getLearner(id).skills[topic].stretch),before);
 assert.equal(learners.getLearner(id).skills[topic].seen,9);
});

test('4: the step-up record latches by the same rule - an estimate of 0.85 with four seen - and never unlatches; a wrong answer at step-up leaves the usual record secure',()=>{
 const id='stretch-rec-2',topic='area';
 // the usual record secure first: six right in a row (1 - 0.7^6 = 0.88)
 for(let k=0;k<6;k++)learners.recordAttempt(id,topic,true);
 const u=learners.getLearner(id).skills[topic];assert.equal(u.secure,true);
 // the step-up record needs the same: five right is 0.83 (not yet), six is 0.88
 for(let k=0;k<5;k++){const r=learners.recordAttempt(id,topic,true,undefined,{stretch:true});assert.equal(r.stretch.secure,false,`after ${k+1}`);}
 let r=learners.recordAttempt(id,topic,true,undefined,{stretch:true});
 assert.equal(r.stretch.secure,true);assert.ok(r.stretch.estimate>=0.85&&r.stretch.seen>=4);
 // a run of wrong answers at step-up: the step-up estimate falls, its latch holds, the usual record does not move
 for(let k=0;k<8;k++)r=learners.recordAttempt(id,topic,false,'area-halved',{stretch:true});
 assert.ok(r.stretch.estimate<0.1);assert.equal(r.stretch.secure,true,'latched: once secure, always secure');
 assert.equal(usual(r),usual(u),'a slip at step-up never touches the usual record');assert.equal(r.secure,true);
 // four right at step-up on a fresh topic is not enough (0.76), the same as the usual rule
 let q;for(let k=0;k<4;k++)q=learners.recordAttempt(id,'ratio-share',true,undefined,{stretch:true});
 assert.equal(q.stretch.secure,false);assert.equal(q.secure,false);
 // the usual record never latches from step-up work, and the step-up one never from usual work
 for(let k=0;k<8;k++)q=learners.recordAttempt(id,'ratio-share',true,undefined,{stretch:true});
 assert.equal(q.stretch.secure,true);assert.equal(q.secure,false);assert.equal(q.seen,0);
 for(let k=0;k<8;k++)q=learners.recordAttempt(id,'mean-range',true);
 assert.equal(q.secure,true);assert.equal(q.stretch,undefined);
});

// ------------------------------------------------------------------ 5. the file
test('5: learners.json keeps and sanitises the step-up record, drops junk, loads a file from before W8 unchanged, and stays valid JSON',()=>{
 const FILE=path.join(data,'learners.json');
 const book=JSON.parse(fs.readFileSync(FILE,'utf8'));
 const old={topic:'frac-equivalent',seen:5,right:4,estimate:0.8,secure:false,lastSeen:1700000000000,slips:['added-same']};
 book['old-file']={id:'old-file',skills:{'frac-equivalent':old},writing:{},memory:['They like pictures.'],history:[{at:1,kind:'practice',label:'Equivalent fractions',detail:'4 of 6 right'}]};
 book['junk']={id:'junk',skills:{
  a:{...old,topic:'a',stretch:{seen:5.7,right:3,estimate:0.9,secure:true,lastSeen:123,points:40,difficulty:5}},
  b:{...old,topic:'b',stretch:{seen:-3,right:10,estimate:7,secure:'yes',lastSeen:'x'}},
  c:{...old,topic:'c',stretch:[1,2]},d:{...old,topic:'d',stretch:'secure'},e:{...old,topic:'e',stretch:null},f:{...old,topic:'f',stretch:{}},
  g:{...old,topic:'g',stretch:{seen:2,right:7,estimate:-1,secure:true,lastSeen:Infinity}},
 },writing:{},memory:[],history:[]};
 fs.writeFileSync(FILE,JSON.stringify(book));
 const o=learners.getLearner('old-file');
 assert.deepEqual(o.skills['frac-equivalent'],old,'an old record loads unchanged, with no step-up record');
 assert.ok(!('stretch' in o.skills['frac-equivalent']));
 const j=learners.getLearner('junk').skills;
 assert.deepEqual(j.a.stretch,{seen:5,right:3,estimate:0.9,secure:true,lastSeen:123},'whole counts; an unknown key inside it is dropped');
 assert.deepEqual(j.b.stretch,{seen:0,right:0,estimate:1,secure:false,lastSeen:0},'negative counts, a too-high estimate and a non-true secure');
 for(const k of ['c','d','e'])assert.ok(!('stretch' in j[k]),`${k}: junk is no step-up record`);
 assert.deepEqual(j.f.stretch,{seen:0,right:0,estimate:0,secure:false,lastSeen:0});
 assert.deepEqual(j.g.stretch,{seen:2,right:2,estimate:0,secure:true,lastSeen:0},'right is never more than seen');
 for(const k of Object.keys(j))assert.equal(usual(j[k]),usual({...old,topic:k}),`${k}: the usual fields as they were`);
 // a round trip: save, read the file as JSON, load again
 learners.saveLearner(learners.getLearner('junk'));
 const text=fs.readFileSync(FILE,'utf8');const parsed=JSON.parse(text);
 assert.deepEqual(parsed.junk.skills.a.stretch,{seen:5,right:3,estimate:0.9,secure:true,lastSeen:123});
 assert.deepEqual(learners.getLearner('junk'),learners.getLearner('junk'));
 assert.deepEqual(learners.getLearner('junk').skills,j,'what was saved loads back the same');
});

// ------------------------------------------------------------------ 6. the flag through marking, typed and photo, and the explanation
test('6: a typed step-up set records on the step-up record only, with no model call, and writes the same history line and recap as a usual set',()=>{
 seat();noModel();
 const set=(stretch)=>{const r=makeSchoolItems(UNIT,6,4242,stretch?'harder':'standard',stretch);return {topic:UNIT,items:r.items,marked:false,...(stretch?{stretch:true}:{})};};
 const answers=(p)=>p.items.map((it,i)=>i===1?'1/1000':answerOf(it.spec));
 const U=set(false),T=set(true);
 const usualId=`${LEARNER}-u`,stretchId=`${LEARNER}-t`;
 const mu=markTyped(answers(U),U,usualId,()=>true,'uk'),mt=markTyped(answers(T),T,stretchId,()=>true,'uk');
 assert.equal(seen.length,0,'typed marking calls no engine');
 assert.deepEqual(mu.items.map((i)=>i.verdict),['right','wrong','right','right','right','right']);
 assert.deepEqual(mt.items.map((i)=>i.verdict),mu.items.map((i)=>i.verdict));
 assert.ok(mt.items.every((i)=>i.stretch===true),'the flag stays on the marked items');
 const ru=learners.getLearner(usualId).skills[UNIT],rt=learners.getLearner(stretchId).skills[UNIT];
 assert.equal(ru.seen,6);assert.equal(ru.stretch,undefined);
 assert.equal(rt.seen,0);assert.equal(rt.right,0);assert.equal(rt.stretch.seen,6);assert.equal(rt.stretch.right,5);
 // the history line: the same shape and words - the topic's name and the count of right, no number of points
 const hu=learners.getLearner(usualId).history.at(-1),ht=learners.getLearner(stretchId).history.at(-1);
 assert.deepEqual(Object.keys(ht).sort(),Object.keys(hu).sort());
 assert.deepEqual({...ht,at:0},{...hu,at:0});
 assert.equal(ht.label,'Add and subtract fractions');
 for(const h of [hu,ht])assert.doesNotMatch(JSON.stringify(h),/point|stretch|step|bonus|%/i);
 // the recap drawn from each history reads the same
 const now=Date.now(),s=store.getSession();
 const tile=(id)=>recapRows({...s,history:learners.getLearner(id).history},now).find((t)=>t.app==='maths');
 assert.deepEqual(tile(stretchId),tile(usualId));
 assert.doesNotMatch(recapLine(tile(stretchId)),/point|stretch|step up|bonus|%/i);
});

test('6b: a photographed step-up set is read by the model, marked by code and recorded on the step-up record; the store keeps the flag through practice.marked',async()=>{
 seat();
 const made=await (noModel(),post('practice',{topic:UNIT,stretch:true}));assert.equal(made.status,200);
 const p=store.getSession().practice;
 reg.useProvider('vision',{name:'stub',run:async()=>({raw:JSON.stringify({items:p.items.map((it)=>({n:it.n,studentAnswer:answerOf(it.spec),studentWorking:''}))})})});
 const r=await post('mark',{image:'data:image/jpeg;base64,AAAA',w:100,h:100});
 assert.equal(r.status,200);
 const after=store.getSession().practice;
 assert.equal(after.marked,true);assert.equal(after.stretch,true);assert.ok(after.items.every((i)=>i.stretch===true&&i.verdict==='right'));
 const rec=learners.getLearner(LEARNER).skills[UNIT];
 assert.equal(rec.seen,0);assert.equal(rec.stretch.seen,6);assert.equal(rec.stretch.right,6);
 assert.deepEqual(store.getSession().skills[UNIT].stretch,rec.stretch,'the TV\'s copy of the record carries it');
});

test('6c: an explanation that settles an unsure step-up item records on the step-up record only; a usual one on the usual record',async()=>{
 seat();
 const spec=S.gen(99,2),q=S.question(spec).plain,value=answerOf(spec);
 reg.useProvider('text',{name:'stub',run:async()=>({raw:JSON.stringify({reply:'Look at the bottoms.',value})})});
 const a=await X.explainItem({n:1,question:q,spec,tier:2,stretch:true,verdict:'unsure'},'I made the bottoms the same',UNIT,LEARNER,()=>true,12,'uk');
 assert.equal(a.settled.verdict,'right');
 let rec=learners.getLearner(LEARNER).skills[UNIT];
 assert.equal(rec.seen,0);assert.deepEqual([rec.stretch.seen,rec.stretch.right],[1,1]);
 const b=await X.explainItem({n:1,question:q,spec,tier:2,verdict:'unsure'},'I made the bottoms the same',UNIT,LEARNER,()=>true,12,'uk');
 assert.equal(b.settled.verdict,'right');
 rec=learners.getLearner(LEARNER).skills[UNIT];
 assert.deepEqual([rec.seen,rec.right,rec.stretch.seen],[1,1,1]);
});

// ------------------------------------------------------------------ 7. the tier is code's, never a model's
test('7: nothing in the school and step-up code reads a model\'s difficulty; the mix comes from years, not from a reply',()=>{
 const read=(f)=>fs.readFileSync(src(f),'utf8');
 const items=read('lib/desk/items.ts'),school=items.split('// ------------------------------------------------------------------ school units')[1];
 assert.ok(school&&/makeSchoolItems/.test(school),'the school section of items.ts was found');
 const code={
  'lib/rules/stretch.ts':read('lib/rules/stretch.ts'),'lib/rules/school.ts':read('lib/rules/school.ts'),'items.ts (school section)':school,
  'the makeItems dispatch':items.split('export async function makeItems')[1].split('async function makeLinearItems')[0],
  'mark.ts land':read('lib/desk/mark.ts').split('function land(')[1],'learners.ts':read('lib/session/learners.ts'),'api/practice':read('app/api/practice/route.ts'),
 };
 for(const [name,text] of Object.entries(code))assert.doesNotMatch(text,/difficulty/i,`${name} never reads a difficulty`);
 assert.doesNotMatch(code['lib/rules/stretch.ts'],/engines\/|\btext\(|\bvision\(/,'the mix rule calls no engine');
 // the Calculus road still sorts by the model's own difficulty - and that is all it does there: it is no reward lever
 assert.match(items.split('async function makeCalcItems')[1].split('// ----')[0],/sort\(\(a, b\) => a\.difficulty - b\.difficulty/);
});
