/**
 * School practice the desk WRITES ITSELF (Family W5b): a set on a school unit with a generator - "Add and subtract
 * fractions" (frac-add-sub) today - is written by code with NO model call (desk/src/lib/desk/items.ts makeSchoolItems,
 * rules/school gen and question): three tier-1 and three tier-2 specs from a fresh seed, six distinct, provider "code",
 * the tier the one code asked for. The spec rides on the item through the store (session/store specShown dispatches on
 * `shape`: a school spec keeps its own keys and is re-validated by rules/school wellFormed, a Calculus spec is kept as
 * it always was), so marking can judge later. The linear topics keep their model route unchanged.
 * Run with npm test in desk/ (directly: node tools/school-practice-test.cjs). No model is called - the text engine is
 * stubbed at the provider registry, and for the school unit the stub THROWS, so a single call fails the suite - and the
 * data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-school-practice-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));
const storeFile=src('lib/session/store.ts');
let store=require(storeFile);
const {makeItems,makeSchoolItems}=require(src('lib/desk/items.ts'));
const S=require(src('lib/rules/school.ts'));
const C=require(src('lib/rules/calc.ts'));
const T=require(src('maths/typeset.ts'));
const P=require(src('lib/library/paths.ts'));
const {SYLLABUS}=require(src('lib/library/syllabus.ts'));
const practice=()=>require(src('app/api/practice/route.ts'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const UNIT='frac-add-sub';
/** Every text engine request, kept; the school stub throws on any. */
let seen=[];
const noModel=()=>{seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);throw new Error('the text engine was called for a school unit');}});};
const answering=(json)=>{seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);return {raw:JSON.stringify(json)};}});};
const post=(body)=>practice().POST(new Request('http://desk/api/practice',{method:'POST',body:JSON.stringify(body)}));
const LEARNER='school-practice-scratch';
function seat(){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Mia',type:'elementary',age:12,system:'uk',modules:['maths']}});store.dispatch({type:'profile.save'});
}
/** The two operands' bottoms of a generated `a/b ± c/d`. */
const bottoms=(spec)=>{const m=/^(\d+)\/(\d+) [-+] (\d+)\/(\d+)$/.exec(spec.expr);assert.ok(m,spec.expr);return [Number(m[2]),Number(m[4])];};
/** Tier 1: the same bottom or one a multiple of the other; tier 2: neither divides the other (rules/school gen). */
const tierOf=(spec)=>{const [b,d]=bottoms(spec);return b%d===0||d%b===0?1:2;};
const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];

// ------------------------------------------------------------------ the path: the unit is on it, with no lesson
test('1: "Add and subtract fractions" is on the school path "School maths" (third since W7, after equivalent fractions and a fraction of an amount), with a generator and no lesson',()=>{
 assert.equal(P.PATHS.school.name,'School maths');
 // W7 batch 1 put equivalent fractions and a fraction of an amount before it (years never go down along the path)
 assert.equal(SYLLABUS[2].id,UNIT);assert.equal(P.topicsOf('school')[2].id,UNIT);
 assert.equal(P.pathOfTopic(UNIT),'school');
 const t=P.topicIn(UNIT);
 assert.equal(t.name,'Add and subtract fractions');assert.equal(t.strand,'Fractions');assert.deepEqual(t.prereq,['frac-equivalent'],'W7: rewriting over a common bottom is equivalent fractions');
 assert.ok(!('lessonId' in t),'the lesson library has no fractions lesson, so the topic names none');
 assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,'one sentence');
 assert.deepEqual(t.year,{us:5,uk:6,cz:5,de:5});
 assert.equal(typeof S.generatorFor(UNIT),'function');
 for(const id of ['linear-one-step','linear-two-step','linear-both-sides','calc1-functions','constructor','',undefined])assert.equal(S.generatorFor(id),null,String(id));
});

// ------------------------------------------------------------------ the set: six, by code, no model call
test('2: makeItems on frac-add-sub writes six distinct items by code - three tier 1, then three tier 2 - with zero engine calls',async()=>{
 seat();noModel();
 for(let k=0;k<20;k++){
  const r=await makeItems(UNIT,LEARNER);
  assert.equal(seen.length,0,'no text engine call');
  assert.equal(r.provider,'code');assert.equal(r.tries,0,'no model round');
  assert.equal(r.items.length,6);
  assert.deepEqual(r.items.map((i)=>i.n),[1,2,3,4,5,6]);
  assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2],'tier 1 first, then tier 2');
  assert.equal(new Set(r.items.map((i)=>i.question.replace(/\s+/g,''))).size,6,'six distinct questions');
  for(const it of r.items){
   assert.equal(it.spec.shape,'compute');assert.ok(S.wellFormed(it.spec).ok,it.spec.expr);
   assert.deepEqual(Object.keys(it.spec).sort(),['expr','shape'],'the spec carries its expression and nothing else');
   assert.equal(it.question,S.question(it.spec).plain,'the question is printed by code from the spec');
   assert.match(it.question,/^Work out \d+\/\d+ [-+] \d+\/\d+\.$/);
   assert.equal(it.tier,tierOf(it.spec),`${it.spec.expr}: the stored tier is the one its bottoms give, computed by code`);
   assert.equal(S.leaksSchool(it.spec,it.question),false,'the question does not state its own answer');
   assert.ok(!('difficulty' in it)&&!('answer' in it),'no model difficulty, no answer');
   let fr=0;T.walk(T.parseMath(it.question),(x)=>{if(x.t==='frac')fr++;});
   assert.equal(fr,2,`${it.question}: both operands are set as stacked fractions`);
  }
 }
});

test('3: a fresh seed per set - the same seed gives the same set, different seeds different sets',()=>{
 const q=(seed)=>makeSchoolItems(UNIT,6,seed).items.map((i)=>i.question).join('|');
 assert.equal(q(7),q(7),'pure for a seed');
 const sets=new Set([1,1000,99999,123456789,4000000000].map(q));
 assert.equal(sets.size,5,'five seeds, five different sets');
 // a seed near the top of the range wraps, and still gives six
 assert.equal(makeSchoolItems(UNIT,6,0xffffffff).items.length,6);
 // n is honoured: the first half (rounded up) at tier 1
 assert.deepEqual(makeSchoolItems(UNIT,5,3).items.map((i)=>i.tier),[1,1,1,2,2]);
 assert.deepEqual(makeSchoolItems('linear-one-step',6,3).items,[],'no generator, no items from this road');
});

test('4: the practice route reports code and zero tries for a school unit, and the set lands with its specs and tiers',async()=>{
 seat();noModel();
 const r=await post({topic:UNIT});
 assert.equal(r.status,200);
 const body=await r.json();
 assert.deepEqual(Object.keys(body).sort(),['items','ms','provider','tries'],'the route answers its four keys, as always');
 assert.equal(body.items,6);assert.equal(body.provider,'code');assert.equal(body.tries,0,'zero model calls');
 assert.equal(seen.length,0,'the engine was never reached');
 const p=store.getSession().practice;
 assert.equal(p.topic,UNIT);assert.equal(p.items.length,6);assert.equal(store.getSession().screen,'practice');
 for(const it of p.items){assert.ok(S.wellFormed(it.spec).ok);assert.ok(it.tier===1||it.tier===2);}
 assert.ok(!keysIn(store.getSession()).includes('answer'));
});

// ------------------------------------------------------------------ W7: the route writes each new unit's set by code
/** Each unit's tier, as its generator documents it (rules/school), read back from the spec alone. */
const W7_TIER={
 'frac-equivalent':(sp)=>{if(sp.shape==='simplify')return 2;const m=/^(\d+)\/(\d+) = (\?|\d+)\/(\?|\d+)$/.exec(sp.expr);const [a,b]=[+m[1],+m[2]];const known=+(m[3]==='?'?m[4]:m[3]);return (m[3]==='?'?known/b:known/a)>1?1:2;},
 'frac-of-amount':(sp)=>(sp.unit===undefined?1:2),
 'frac-mul-div':(sp)=>(/×/.test(sp.expr)?1:2),
};
for(const unit of ['frac-equivalent','frac-of-amount','frac-mul-div']){
 test(`W7 3-${unit}: makeItems and the practice route write the unit's set by code - provider code, zero tries, six items with specs and tiers - and the engine is never reached`,async()=>{
  seat();noModel();
  for(let k=0;k<10;k++){
   const r=await makeItems(unit,LEARNER);
   assert.equal(seen.length,0,'no text engine call');assert.equal(r.provider,'code');assert.equal(r.tries,0);
   assert.equal(r.items.length,6);assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2]);
   assert.equal(new Set(r.items.map((i)=>i.question)).size,6);
   for(const it of r.items){assert.equal(S.unitOf(it.spec),unit);assert.equal(it.tier,W7_TIER[unit](it.spec));}
  }
  const res=await post({topic:unit});
  assert.equal(res.status,200);
  const body=await res.json();
  assert.deepEqual([body.items,body.provider,body.tries],[6,'code',0]);assert.equal(seen.length,0,'the engine was never reached');
  const p=store.getSession().practice;
  assert.equal(p.topic,unit);assert.equal(p.items.length,6);assert.equal(store.getSession().screen,'practice');
  for(const it of p.items){assert.ok(S.wellFormed(it.spec).ok);assert.ok(it.tier===1||it.tier===2);assert.equal(S.unitOf(it.spec),unit);}
  assert.ok(!keysIn(store.getSession()).includes('answer'));
 });
}

// W7 batch 2: before test 5 below, which reloads the store (the practice route keeps the store it was first loaded with)
for(const unit of ['dec-arith','dec-convert','pct-of-amount','pct-change']){
 test(`W7b 3-${unit}: makeItems and the practice route write the unit's set by code - provider code, zero tries, six items with specs and tiers - and the engine is never reached`,async()=>{
  seat();noModel();
  for(let k=0;k<10;k++){
   const r=await makeItems(unit,LEARNER);
   assert.equal(seen.length,0,'no text engine call');assert.equal(r.provider,'code');assert.equal(r.tries,0);
   assert.equal(r.items.length,6);assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2]);
   assert.equal(new Set(r.items.map((i)=>i.question)).size,6);
   for(const it of r.items){assert.equal(S.unitOf(it.spec),unit);assert.equal(it.tier,B2_TIER[unit](it.spec));}
  }
  const res=await post({topic:unit});
  assert.equal(res.status,200);
  const body=await res.json();
  assert.deepEqual([body.items,body.provider,body.tries],[6,'code',0]);assert.equal(seen.length,0,'the engine was never reached');
  const p=store.getSession().practice;
  assert.equal(p.topic,unit);assert.equal(p.items.length,6);assert.equal(store.getSession().screen,'practice');
  for(const it of p.items){assert.ok(S.wellFormed(it.spec).ok);assert.ok(it.tier===1||it.tier===2);assert.equal(S.unitOf(it.spec),unit);}
  assert.ok(!keysIn(store.getSession()).includes('answer'));
 });
}

// W7 batch 3: before test 5 below, as batch 2's route tests are
for(const unit of ['ratio-share','unit-rate','area','mean-range']){
 test(`W7c 3-${unit}: makeItems and the practice route write the unit's set by code - provider code, zero tries, six items with specs and tiers - and the engine is never reached`,async()=>{
  seat();noModel();
  for(let k=0;k<10;k++){
   const r=await makeItems(unit,LEARNER);
   assert.equal(seen.length,0,'no text engine call');assert.equal(r.provider,'code');assert.equal(r.tries,0);
   assert.equal(r.items.length,6);assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2]);
   assert.equal(new Set(r.items.map((i)=>i.question)).size,6);
   for(const it of r.items){assert.equal(S.unitOf(it.spec),unit);assert.equal(it.tier,B3_TIER[unit](it.spec));}
  }
  const res=await post({topic:unit});
  assert.equal(res.status,200);
  const body=await res.json();
  assert.deepEqual([body.items,body.provider,body.tries],[6,'code',0]);assert.equal(seen.length,0,'the engine was never reached');
  const p=store.getSession().practice;
  assert.equal(p.topic,unit);assert.equal(p.items.length,6);assert.equal(store.getSession().screen,'practice');
  for(const it of p.items){assert.ok(S.wellFormed(it.spec).ok);assert.ok(it.tier===1||it.tier===2);assert.equal(S.unitOf(it.spec),unit);}
  assert.ok(!keysIn(store.getSession()).includes('answer'));
 });
}

// ------------------------------------------------------------------ the spec through the store
test('5: a school spec survives the store - practice.set, practice.marked, practice.settle and a reload from session.json',()=>{
 seat();
 const specs=[{shape:'compute',expr:'3/4 + 1/6'},{shape:'compute',expr:'5/6 - 1/4',form:'simplest'},{shape:'compute',expr:'3/4 + 1/2',unit:'m'},{shape:'compute',expr:'1/4 - 3/4',allowNegative:true}];
 const items=specs.map((spec,i)=>({n:i+1,question:S.question(spec).plain,spec,tier:1+(i%2)}));
 store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,items}});
 const got=()=>store.getSession().practice.items;
 assert.deepEqual(got().map((i)=>i.spec),specs,'practice.set keeps every school key');
 assert.deepEqual(got().map((i)=>i.tier),[1,2,1,2]);
 store.dispatch({type:'practice.marked',items:got().map((it)=>({...it,verdict:'unsure',said:'x'}))});
 assert.deepEqual(got().map((i)=>i.spec),specs,'practice.marked keeps them');
 store.dispatch({type:'practice.settle',n:1,reply:'ok',verdict:'right',said:'Number 1 is right.'});
 assert.deepEqual(got()[0].spec,specs[0],'practice.settle keeps it');
 // a desk restarted: the spec is read back from session.json and re-validated
 const saved=path.join(data,'session.json');
 assert.ok(JSON.parse(fs.readFileSync(saved,'utf8')).practice.items.every((it,i)=>JSON.stringify(it.spec)===JSON.stringify(specs[i])),'written to disk whole');
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];store=require(storeFile);
 assert.deepEqual(store.getSession().practice.items.map((i)=>i.spec),specs,'loaded from session.json');
 assert.deepEqual(store.getSession().practice.items.map((i)=>i.tier),[1,2,1,2]);
});

test('6: the store cleans a school spec by its own rules - an answer key stops, a malformed spec is dropped, a Calculus spec is untouched',()=>{
 seat();
 const put=(spec,extra={})=>{store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,items:[{n:1,question:'q',spec,...extra}]}});return store.getSession().practice.items[0];};
 assert.deepEqual(put({shape:'compute',expr:'3/4 + 1/6',answer:'11/12',truth:'11/12',junk:1}).spec,{shape:'compute',expr:'3/4 + 1/6'},'only the school keys pass');
 for(const bad of [{shape:'compute',expr:'3/4 +'},{shape:'compute',expr:'3/0 + 1/2'},{shape:'compute',expr:'1/2 - 3/4'},{shape:'compute',expr:'3/4 + 1/6',form:'fancy'},{shape:'compute',expr:'3/4 + 1/6',unit:'parsec'},{shape:'compute',expr:'3/4 + 1/6',allowNegative:false},{shape:'compute'},{shape:'percent',expr:'25% of 80'}]){
  const it=put(bad);assert.equal(it.spec,undefined,JSON.stringify(bad));assert.equal(it.tier,undefined,'no spec, no tier');
 }
 assert.equal(put({shape:'compute',expr:'3/4 + 1/6'},{tier:3}).tier,undefined,'a tier is 1 or 2');
 assert.equal(put({shape:'compute',expr:'3/4 + 1/6'},{tier:'2'}).tier,undefined);
 // the Calculus spec keeps exactly what it kept before W5b
 const calc={shape:'limit',f:'sin(3x)/x',at:0,side:'+',answer:'3'};
 assert.deepEqual(put(calc).spec,{shape:'limit',f:'sin(3x)/x',at:0,side:'+'});
 const calc2={shape:'critical-point',f:'x^2 - 4x + 1',on:[0,5]};
 assert.deepEqual(put(calc2).spec,calc2);
 // each engine refuses the other's spec, so a dispatch on shape can never cross
 assert.equal(C.wellFormed({shape:'compute',expr:'3/4 + 1/6'}).ok,false,'a school spec is not a Calculus spec');
 assert.equal(S.wellFormed(calc2).ok,false,'a Calculus spec is not a school spec');
 for(const sh of S.SCHOOL_SHAPES)assert.ok(!C.CALC_SHAPES.includes(sh),`${sh} is not a Calculus shape`);
});

// ------------------------------------------------------------------ the linear topics keep their model route
test('7: a linear topic still asks the engine as before - one call, its own prompt, no spec and no tier on the items',async()=>{
 seat();
 const STATED=[['x + 3 = 7','4'],['x - 2 = 5','7'],['3x = 12','4'],['x/2 = 6','12'],['x + 9 = 4','-5'],['5x = 35','7'],['x - 8 = -3','5'],['2x = 9','9/2'],['x + 1 = 1','0']].map(([question,answer])=>({question,answer}));
 answering({items:STATED});
 const r=await makeItems('linear-one-step',LEARNER);
 assert.equal(seen.length,1,'one model call, as before');
 assert.equal(r.provider,'stub');assert.equal(r.tries,1);assert.equal(r.items.length,6);
 assert.match(seen[0].prompt,/^Topic: One-step equations\n/);
 assert.match(seen[0].system,/Each question is a single equation in x\./);
 for(const it of r.items){assert.ok(!('spec' in it),'no spec');assert.ok(!('tier' in it),'no tier');}
});

// ------------------------------------------------------------------ Family W7 batch 1: three more units whose sets code writes
const W7_SHAPE={'frac-equivalent':/^(?:Fill in the missing number: \d+\/\d+ = (?:\?\/\d+|\d+\/\?)\.|Write \d+\/\d+ in its simplest form\.)$/,'frac-of-amount':/^Find \d+\/\d+ of (?:[€£$]\d+|\d+(?: [a-z]+)?)\.$/,'frac-mul-div':/^Work out \d+\/\d+ [×÷] \d+\/\d+\.$/};
for(const unit of Object.keys(W7_TIER)){
 test(`W7 2-${unit}: makeSchoolItems writes six distinct items by code - three tier 1, then three tier 2 - pure for a seed, with no engine call`,()=>{
  noModel();
  for(let seed=1;seed<=40;seed++){
   const r=makeSchoolItems(unit,6,seed*7919);
   assert.equal(seen.length,0,'no text engine call');
   assert.equal(r.provider,'code');assert.equal(r.tries,0);assert.equal(r.items.length,6);
   assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2],'tier 1 first, then tier 2');
   assert.equal(new Set(r.items.map((i)=>i.question.replace(/\s+/g,''))).size,6,'six distinct questions');
   for(const it of r.items){
    assert.ok(S.wellFormed(it.spec).ok,JSON.stringify(it.spec));assert.equal(S.unitOf(it.spec),unit);
    assert.equal(it.question,S.question(it.spec).plain,'the question is printed by code from the spec');
    assert.match(it.question,W7_SHAPE[unit]);
    assert.equal(it.tier,W7_TIER[unit](it.spec),`${it.spec.expr}: the stored tier is the one its spec shows, computed by code`);
    assert.equal(S.leaksSchool(it.spec,it.question),false,'the question does not state its own answer');
    assert.ok(!('difficulty' in it)&&!('answer' in it),'no model difficulty, no answer');
    assert.deepEqual(Object.keys(it.spec).filter((k)=>!['shape','expr','unit'].includes(k)),[],'the spec carries its shape, expression and unit, nothing else');
   }
   assert.deepEqual(makeSchoolItems(unit,6,seed*7919).items,r.items,'the same seed gives the same set');
  }
  const sets=new Set([1,1000,99999,123456789,4000000000].map((s)=>makeSchoolItems(unit,6,s).items.map((i)=>i.question).join('|')));
  assert.equal(sets.size,5,'five seeds, five different sets');
  assert.equal(makeSchoolItems(unit,6,0xffffffff).items.length,6);
  if(unit==='frac-equivalent'){
   // a set on equivalent fractions asks both ways: a missing number, and (most sets) a simplify of its own
   const withSimplify=[...Array(40).keys()].filter((k)=>makeSchoolItems(unit,6,k*104729).items.some((i)=>i.spec.shape==='simplify')).length;
   assert.ok(withSimplify>=34,`a simplify item in ${withSimplify} of 40 sets`);
  }
 });
}

test('W7 5b: the new shapes survive the store - practice.set, practice.marked, practice.settle and a reload - and add no store key; a Calculus spec is untouched',()=>{
 seat();
 const specs=[{shape:'missing',expr:'3/4 = ?/12'},{shape:'missing',expr:'3/4 = 15/?'},{shape:'simplify',expr:'18/24'},{shape:'fraction-of',expr:'3/5 of 40'},
  {shape:'fraction-of',expr:'5/8 of 72',unit:'€'},{shape:'compute',expr:'2/3 × 3/4'},{shape:'compute',expr:'3/4 ÷ 1/2',form:'simplest'}];
 const calc={shape:'critical-point',f:'x^2 - 4x + 1',on:[0,5]};
 const items=[...specs.map((spec,i)=>({n:i+1,question:S.question(spec).plain,spec,tier:1+(i%2)})),{n:8,question:'q',spec:calc}];
 store.dispatch({type:'practice.set',practice:{topic:'frac-equivalent',marked:false,items}});
 const got=()=>store.getSession().practice.items;
 assert.deepEqual(got().slice(0,7).map((i)=>i.spec),specs,'practice.set keeps every school key of the new shapes');
 assert.deepEqual(got()[7].spec,calc,'and a Calculus spec as it always was');
 store.dispatch({type:'practice.marked',items:got().map((it)=>({...it,verdict:'unsure',said:'x'}))});
 assert.deepEqual(got().slice(0,7).map((i)=>i.spec),specs,'practice.marked keeps them');
 store.dispatch({type:'practice.settle',n:3,reply:'ok',verdict:'right',said:'Number 3 is right.'});
 assert.deepEqual(got()[2].spec,specs[2]);
 const saved=path.join(data,'session.json');
 assert.ok(JSON.parse(fs.readFileSync(saved,'utf8')).practice.items.slice(0,7).every((it,i)=>JSON.stringify(it.spec)===JSON.stringify(specs[i])),'written to disk whole');
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];store=require(storeFile);
 assert.deepEqual(store.getSession().practice.items.slice(0,7).map((i)=>i.spec),specs,'loaded from session.json and re-validated');
 assert.deepEqual(store.getSession().practice.items[7].spec,calc,'the Calculus spec is untouched by the reload');
 assert.deepEqual(store.getSession().practice.items.slice(0,7).map((i)=>i.tier),[1,2,1,2,1,2,1]);
 // the store cleans each new shape by its own rules: an answer stops, a key the shape does not take drops the spec
 const put=(spec)=>{store.dispatch({type:'practice.set',practice:{topic:'frac-equivalent',marked:false,items:[{n:1,question:'q',spec,tier:1}]}});return store.getSession().practice.items[0];};
 assert.deepEqual(put({shape:'missing',expr:'3/4 = ?/12',answer:'9',truth:9}).spec,{shape:'missing',expr:'3/4 = ?/12'},'only the school keys pass');
 assert.deepEqual(put({shape:'fraction-of',expr:'3/5 of 40',unit:'kg',solution:'24'}).spec,{shape:'fraction-of',expr:'3/5 of 40',unit:'kg'});
 for(const bad of [{shape:'missing',expr:'3/4 = ?/13'},{shape:'missing',expr:'3/4 = ?/12',form:'simplest'},{shape:'simplify',expr:'3/4'},{shape:'simplify',expr:'18/24',unit:'kg'},
  {shape:'fraction-of',expr:'5/3 of 40'},{shape:'fraction-of',expr:'3/5 of 40',unit:'parsec'},{shape:'fraction-of',expr:'3/5 of 40',allowNegative:true},{shape:'missing'}]){
  const it=put(bad);assert.equal(it.spec,undefined,JSON.stringify(bad));assert.equal(it.tier,undefined,'no spec, no tier');
 }
 const src=fs.readFileSync(storeFile,'utf8');
 // the W7 batch-1 shapes needed no new store key; W7 batch 2 adds exactly one, `to` (a conversion's asked form: W7b 5b below)
 assert.match(src,/const SCHOOL_SPEC_KEYS = \["expr", "form", "unit", "allowNegative", "to"\] as const;/,'W7 batch 2 adds only `to`');
 for(const sh of ['missing','simplify','fraction-of']){assert.ok(S.SCHOOL_SHAPES.includes(sh));assert.ok(!C.CALC_SHAPES.includes(sh),`${sh} is not a Calculus shape`);assert.equal(C.wellFormed({shape:sh,expr:'3/4'}).ok,false);}
});

// ------------------------------------------------------------------ W7: the three units on the path, and the route that writes their sets
test('W7 1: the school path has seventeen topics since v2 M2b (fifteen since W7 batch 3) - four fractions units, one-step, the decimals and percent strand, ratio and rates, geometry and data, the other two linear topics - each batch-1 unit with a generator, a one-sentence blurb, honest prerequisites and no lesson',()=>{
 assert.deepEqual(P.topicsOf('school').map((t)=>t.id),['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div','linear-one-step','dec-arith','dec-convert','pct-of-amount','pct-change','ratio-share','unit-rate','area','mean-range','linear-two-step','linear-both-sides','pythagoras','probability']);
 const want={
  'frac-equivalent':['Equivalent fractions',[],{us:4,uk:5,cz:5,de:5}],
  'frac-of-amount':['A fraction of an amount',[],{us:5,uk:5,cz:5,de:5}],
  'frac-mul-div':['Multiply and divide fractions',['frac-equivalent'],{us:6,uk:7,cz:6,de:5}],
 };
 for(const [id,[name,prereq,year]] of Object.entries(want)){
  const t=P.topicIn(id);
  assert.equal(t.name,name);assert.equal(t.strand,'Fractions');assert.deepEqual(t.prereq,prereq,`${id}: prerequisites`);assert.deepEqual(t.year,year,`${id}: years (from memory, a teacher checks)`);
  assert.ok(!('lessonId' in t),`${id}: the lesson library has no fractions lesson`);
  assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,`${id}: one sentence`);assert.doesNotMatch(t.blurb,/\d/,`${id}: no number in the blurb`);
  assert.equal(P.pathOfTopic(id),'school');assert.equal(typeof S.generatorFor(id),'function');
  assert.equal(SYLLABUS.find((x)=>x.id===id).bands.us.startsWith('Grade '),true);
 }
 assert.equal(P.PATHS.school.blurb,'School maths from equivalent fractions through equations to Pythagoras\' theorem and the probability of an event.');
});

// ------------------------------------------------------------------ Family W7 batch 2: decimals and percent, written by code
/** Each unit's tier, as its generator documents it (rules/school), read back from the spec alone. */
const B2_TIER={
 'dec-arith':(sp)=>(/×/.test(sp.expr)?2:1),
 // tier 1: a value below one whose lowest bottom goes into a hundred; tier 2 anything else (eighths .. eightieths, or over one)
 'dec-convert':(sp)=>{const f=/^(\d+)\/(\d+)$/.exec(sp.expr),d=/^(\d+)\.(\d+)$/.exec(sp.expr),p=/^(\d+)(?:\.(\d))?%$/.exec(sp.expr);
  let n,den;if(f){n=+f[1];den=+f[2];}else if(d){n=Number(d[1]+d[2]);den=10**d[2].length;}else{n=Number(p[1]+(p[2]??''));den=100*10**(p[2]??'').length;}
  const g=(a,b)=>(b?g(b,a%b):a),k=g(n,den);n/=k;den/=k;return 100%den===0&&n<den?1:2;},
 // tier 1 carries no unit, tier 2 always one
 'pct-of-amount':(sp)=>(sp.unit===undefined?1:2),
 'pct-change':(sp)=>(sp.unit===undefined?1:2),
};
/** The printed question of each unit, and the keys its spec may carry. */
const B2_SHAPE={
 'dec-arith':[/^Work out (?:[€£]?\d+\.\d+ [-+] [€£]?\d+\.\d+|[€£]?\d+(?:\.\d+)? × \d+(?:\.\d+)?)\.$/,['shape','expr','unit']],
 'dec-convert':[/^Write (?:\d+\/\d+|\d+\.\d+|\d+(?:\.\d)?%) as (?:a decimal|a percentage|a simplified fraction)\.$/,['shape','expr','to']],
 'pct-of-amount':[/^Find \d+(?:\.5)?% of (?:[€£]\d+|\d+(?: [a-z]+)?)\.$/,['shape','expr','unit']],
 'pct-change':[/^(?:Increase|Decrease) (?:[€£]\d+|\d+(?: [a-z]+)?) by \d+(?:\.5)?%\.$/,['shape','expr','unit']],
};
for(const unit of Object.keys(B2_TIER)){
 test(`W7b 2-${unit}: makeSchoolItems writes six distinct items by code - three tier 1, then three tier 2 - pure for a seed, with no engine call`,()=>{
  noModel();
  for(let seed=1;seed<=40;seed++){
   const r=makeSchoolItems(unit,6,seed*7919);
   assert.equal(seen.length,0,'no text engine call');
   assert.equal(r.provider,'code');assert.equal(r.tries,0);assert.equal(r.items.length,6);
   assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2],'tier 1 first, then tier 2');
   assert.equal(new Set(r.items.map((i)=>i.question.replace(/\s+/g,''))).size,6,'six distinct questions');
   for(const it of r.items){
    assert.ok(S.wellFormed(it.spec).ok,JSON.stringify(it.spec));assert.equal(S.unitOf(it.spec),unit);
    assert.equal(it.question,S.question(it.spec).plain,'the question is printed by code from the spec');
    assert.match(it.question,B2_SHAPE[unit][0]);
    assert.equal(it.tier,B2_TIER[unit](it.spec),`${it.question}: the stored tier is the one its spec shows, computed by code`);
    assert.equal(S.leaksSchool(it.spec,it.question),false,'the question does not state its own answer');
    assert.ok(!('difficulty' in it)&&!('answer' in it),'no model difficulty, no answer');
    assert.deepEqual(Object.keys(it.spec).filter((k)=>!B2_SHAPE[unit][1].includes(k)),[],'the spec carries only its own keys');
   }
   assert.deepEqual(makeSchoolItems(unit,6,seed*7919).items,r.items,'the same seed gives the same set');
  }
  const sets=new Set([1,1000,99999,123456789,4000000000].map((s)=>makeSchoolItems(unit,6,s).items.map((i)=>i.question).join('|')));
  assert.equal(sets.size,5,'five seeds, five different sets');
  assert.equal(makeSchoolItems(unit,6,0xffffffff).items.length,6);
 });
}

test('W7b 1: the four decimals and percent units are on the school path after one-step equations - strand, one-sentence blurb, honest prerequisites, years that never go down, a generator and no lesson',()=>{
 const want={
  'dec-arith':['Add, subtract and multiply decimals',[],{us:6,uk:7,cz:6,de:6}],
  'dec-convert':['Fractions, decimals and percent',['frac-equivalent'],{us:6,uk:7,cz:7,de:6}],
  'pct-of-amount':['A percent of an amount',['dec-convert'],{us:6,uk:7,cz:7,de:6}],
  'pct-change':['Percent increase and decrease',['pct-of-amount'],{us:7,uk:8,cz:7,de:6}],
 };
 const order=P.topicsOf('school').map((t)=>t.id);
 assert.deepEqual(order.slice(4,10),['linear-one-step','dec-arith','dec-convert','pct-of-amount','pct-change','ratio-share'],'after one-step equations, before the W7 batch-3 strands');
 for(const [id,[name,prereq,year]] of Object.entries(want)){
  const t=P.topicIn(id);
  assert.equal(t.name,name);assert.equal(t.strand,'Decimals and percent');assert.deepEqual(t.prereq,prereq,`${id}: prerequisites`);assert.deepEqual(t.year,year,`${id}: years (from memory, a teacher checks)`);
  assert.ok(!('lessonId' in t),`${id}: the lesson library has no decimals or percent lesson`);
  assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,`${id}: one sentence`);assert.doesNotMatch(t.blurb,/\d/,`${id}: no number in the blurb`);
  assert.equal(P.pathOfTopic(id),'school');assert.equal(typeof S.generatorFor(id),'function');
  const row=SYLLABUS.find((x)=>x.id===id);assert.ok(row.bands.us.startsWith('Grade ')&&row.bands.uk.startsWith('Year ')&&/ročník/.test(row.bands.cz)&&/^Klasse/.test(row.bands.de));
  for(const p of prereq)assert.ok(order.indexOf(p)<order.indexOf(id),`${id} needs ${p}, which comes earlier`);
 }
 // the unit a reader says a spec belongs to is the topic on the path, so the hint's stance and the history line name it
 for(const [spec,id] of [[{shape:'compute',expr:'4.35 + 2.8'},'dec-arith'],[{shape:'convert',expr:'3/8',to:'decimal'},'dec-convert'],[{shape:'percent-of',expr:'35% of 80'},'pct-of-amount'],[{shape:'percent-change',expr:'increase 60 by 15%'},'pct-change']])
  assert.equal(P.topicIn(S.unitOf(spec)).id,id);
});

test('W7b 5b: the batch-2 specs survive the store - practice.set, practice.marked, practice.settle and a reload - and a Calculus spec and the batch-1 specs are untouched',()=>{
 seat();
 const specs=[{shape:'compute',expr:'4.35 + 2.8'},{shape:'compute',expr:'4.35 + 2.80',unit:'€'},{shape:'compute',expr:'3.45 × 4',unit:'£'},{shape:'compute',expr:'3.6 × 0.4'},
  {shape:'convert',expr:'3/8',to:'decimal'},{shape:'convert',expr:'0.35',to:'fraction'},{shape:'convert',expr:'12.5%',to:'fraction'},{shape:'convert',expr:'7/20',to:'percent'},
  {shape:'percent-of',expr:'35% of 80'},{shape:'percent-of',expr:'15% of 60',unit:'€'},{shape:'percent-of',expr:'12.5% of 40',unit:'kg'},
  {shape:'percent-change',expr:'increase 60 by 15%'},{shape:'percent-change',expr:'decrease 80 by 25%',unit:'€'},
  {shape:'missing',expr:'3/4 = ?/12'},{shape:'fraction-of',expr:'5/8 of 72',unit:'€'}];
 const calc={shape:'critical-point',f:'x^2 - 4x + 1',on:[0,5]};
 const N=specs.length;
 const items=[...specs.map((spec,i)=>({n:i+1,question:S.question(spec).plain,spec,tier:1+(i%2)})),{n:N+1,question:'q',spec:calc}];
 store.dispatch({type:'practice.set',practice:{topic:'dec-arith',marked:false,items}});
 const got=()=>store.getSession().practice.items;
 assert.deepEqual(got().slice(0,N).map((i)=>i.spec),specs,'practice.set keeps every key');
 store.dispatch({type:'practice.marked',items:got().map((it)=>({...it,verdict:'unsure',said:'x'}))});
 assert.deepEqual(got().slice(0,N).map((i)=>i.spec),specs,'practice.marked keeps them');
 store.dispatch({type:'practice.settle',n:2,reply:'ok',verdict:'right',said:'Number 2 is right.'});
 assert.deepEqual(got()[1].spec,specs[1]);
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];store=require(storeFile);
 assert.deepEqual(store.getSession().practice.items.slice(0,N).map((i)=>i.spec),specs,'loaded from session.json and re-validated');
 assert.deepEqual(store.getSession().practice.items[N].spec,calc,'the Calculus spec is untouched by the reload');
 assert.deepEqual(store.getSession().practice.items.slice(0,N).map((i)=>i.tier),specs.map((_,i)=>1+(i%2)));
 const put=(spec)=>{store.dispatch({type:'practice.set',practice:{topic:'dec-arith',marked:false,items:[{n:1,question:'q',spec,tier:1}]}});return store.getSession().practice.items[0];};
 assert.deepEqual(put({shape:'compute',expr:'4.35 + 2.8',answer:'7.15',value:7.15}).spec,{shape:'compute',expr:'4.35 + 2.8'},'an answer stops at the store');
 assert.deepEqual(put({shape:'convert',expr:'3/8',to:'decimal',answer:'0.375'}).spec,{shape:'convert',expr:'3/8',to:'decimal'},'a conversion keeps `to`, and only its keys');
 for(const bad of [{shape:'compute',expr:'4.3567 + 1'},{shape:'compute',expr:'2.25 - 7.5'},{shape:'compute',expr:'4.35 + 2.8',unit:'CZK'},
  {shape:'convert',expr:'1/3',to:'decimal'},{shape:'convert',expr:'0.35',to:'decimal'},{shape:'convert',expr:'3/8',to:'ratio'},{shape:'convert',expr:'3/8'},{shape:'compute',expr:'3/4 + 1/6',to:'decimal'},
  {shape:'percent-of',expr:'100% of 80'},{shape:'percent-of',expr:'35% of 80',unit:'parsec'},{shape:'percent-of',expr:'35% of 80',to:'decimal'},{shape:'percent-of',expr:'12.5% of 7'},
  {shape:'percent-change',expr:'decrease 80 by 100%'},{shape:'percent-change',expr:'increase 60 by 15'},{shape:'percent-change',expr:'increase 60 by 15%',form:'decimal'}]){
  const it=put(bad);assert.equal(it.spec,undefined,JSON.stringify(bad));assert.equal(it.tier,undefined,'no spec, no tier');
 }
});


// ------------------------------------------------------------------ Family W7 batch 3: ratio, rates, area, mean and range, written by code
/** Each unit's tier, as its generator documents it (rules/school), read back from the spec alone. */
const B3_TIER={
 // tier 1: equal ratios (simplify, or a missing term); tier 2: sharing an amount
 'ratio-share':(sp)=>(/ in /.test(sp.expr)?2:1),
 // tier 1: the value of a single one is whole (a whole price an item, a speed a multiple of 5); tier 2: it is not
 'unit-rate':(sp)=>{const c=/^(\d+) [a-z]+ cost (\d+)(?:\.(\d\d))?, \d+$/.exec(sp.expr);if(c){const each=(Number(c[2])*100+Number(c[3]??0))/Number(c[1]);return each%100===0?1:2;}
  const d=/^(\d+) km in (\d+) h, \d+$/.exec(sp.expr);return (2*Number(d[1])/Number(d[2]))%2===0?1:2;},
 // tier 1: a rectangle with whole sides or a triangle with a whole area; tier 2: two rectangles, a half in the area or a side
 'area':(sp)=>{if(/^rectangles /.test(sp.expr)||/\.5/.test(sp.expr))return 2;const t=/^triangle base (\d+) height (\d+)$/.exec(sp.expr);return t&&(Number(t[1])*Number(t[2]))%2===1?2:1;},
 // tier 1: a whole mean, or the range of four or five numbers; tier 2: a mean that is not whole, or the range of six
 'mean-range':(sp)=>{const [k,list]=[sp.expr.split(' ')[0],sp.expr.slice(sp.expr.indexOf(' ')+1).split(', ').map(Number)];
  return k==='range'?(list.length===6?2:1):(list.reduce((a,b)=>a+b,0)%list.length===0?1:2);},
};
/** The printed question of each unit, and the keys its spec may carry. */
const B3_SHAPE={
 'ratio-share':[/^(?:Write \d+:\d+ in its simplest form\.|Fill in the missing number: \d+:\d+ = (?:\?:\d+|\d+:\?)\.|Share (?:[€£]\d+|\d+(?: [a-z]+)?) in the ratio \d+:\d+\.)$/,['shape','expr','unit']],
 'mean-range':[/^(?:Work out the mean|Find the range) of \d+(?:, \d+)* and \d+\.$/,['shape','expr']],
 'area':[/^(?:Find the area of a rectangle \d+(?:\.5)? (?:cm|metres) by \d+(?:\.5)? (?:cm|metres)\.|Find the area of a triangle, base \d+ cm, height \d+ cm\.|Find the total area of rectangles \d+ cm by \d+ cm and \d+ cm by \d+ cm\.)$/,['shape','expr','unit']],
 'unit-rate':[/^(?:\d+ (pens|books|cards|eggs|cups|kg) cost [€£]\d+(?:\.\d\d)?\. What (?:do \d+ \1|does 1 (?:pen|book|card|egg|cup|kg)) cost\?|\d+ km in \d+ hours\. How far in (?:1 hour|\d+ hours)\?)$/,['shape','expr','unit']],
};
/** Each unit's kinds (the figure, the question asked): a set's tier-1 half mixes them, because the kind turns with the seed alone. */
const B3_KIND={
 'ratio-share':(sp)=>(/ in /.test(sp.expr)?'share':/=/.test(sp.expr)?'missing':'simplify'),
 'unit-rate':(sp)=>(/ km /.test(sp.expr)?'distance':'cost'),
 'area':(sp)=>sp.expr.split(' ')[0],
 'mean-range':(sp)=>sp.expr.split(' ')[0],
};
for(const unit of Object.keys(B3_TIER)){
 test(`W7c 2-${unit}: makeSchoolItems writes six distinct items by code - three tier 1, then three tier 2 - pure for a seed, with no engine call`,()=>{
  noModel();
  let mixed=0;
  for(let seed=1;seed<=40;seed++){
   // the capture found a set of three rectangles (a retried draw turned the kind): the kind now turns with the seed alone
   if(new Set(makeSchoolItems(unit,6,seed*7919).items.map((i)=>B3_KIND[unit](i.spec))).size>1)mixed++;
   const r=makeSchoolItems(unit,6,seed*7919);
   assert.equal(seen.length,0,'no text engine call');
   assert.equal(r.provider,'code');assert.equal(r.tries,0);assert.equal(r.items.length,6);
   assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2],'tier 1 first, then tier 2');
   assert.equal(new Set(r.items.map((i)=>i.question.replace(/\s+/g,''))).size,6,'six distinct questions');
   for(const it of r.items){
    assert.ok(S.wellFormed(it.spec).ok,JSON.stringify(it.spec));assert.equal(S.unitOf(it.spec),unit);
    assert.equal(it.question,S.question(it.spec).plain,'the question is printed by code from the spec');
    assert.match(it.question,B3_SHAPE[unit][0]);
    assert.equal(it.tier,B3_TIER[unit](it.spec),`${it.question}: the stored tier is the one its spec shows, computed by code`);
    assert.equal(S.leaksSchool(it.spec,it.question),false,'the question does not state its own answer');
    assert.ok(!('difficulty' in it)&&!('answer' in it),'no model difficulty, no answer');
    assert.deepEqual(Object.keys(it.spec).filter((k)=>!B3_SHAPE[unit][1].includes(k)),[],'the spec carries only its own keys');
   }
   assert.deepEqual(makeSchoolItems(unit,6,seed*7919).items,r.items,'the same seed gives the same set');
  }
  assert.equal(mixed,40,`${unit}: every set mixes its kinds (${mixed} of 40)`);
  const sets=new Set([1,1000,99999,123456789,4000000000].map((s)=>makeSchoolItems(unit,6,s).items.map((i)=>i.question).join('|')));
  assert.equal(sets.size,5,'five seeds, five different sets');
  assert.equal(makeSchoolItems(unit,6,0xffffffff).items.length,6);
 });
}

/** The batch-3 specs a round trip carries, and the ones the store must drop (a key the shape does not take, a malformed one). */
const B3_STORE={
 'mean-range':{
  keep:[{shape:'stat',expr:'mean 4, 7, 9, 10'},{shape:'stat',expr:'range 12, 5, 9, 20, 7'},{shape:'stat',expr:'mean 4, 8, 6, 15, 3, 9'}],
  answer:[{shape:'stat',expr:'mean 4, 7, 9, 10',answer:'7.5',value:7.5},{shape:'stat',expr:'mean 4, 7, 9, 10'}],
  drop:[{shape:'stat',expr:'mean 1, 2, 4'},{shape:'stat',expr:'range 5, 5, 5'},{shape:'stat',expr:'mean 4, 7, 9, 10',unit:'cm'},{shape:'stat',expr:'median 4, 7, 9'},{shape:'stat',expr:'mean 4, 7, 9, 10',to:'decimal'},{shape:'stat',expr:'mean 4, 7'}],
 },
 'area':{
  keep:[{shape:'area',expr:'rectangle 7 by 4',unit:'cm2'},{shape:'area',expr:'rectangle 12 by 9',unit:'m2'},{shape:'area',expr:'triangle base 5 height 3',unit:'cm2'},{shape:'area',expr:'rectangles 8 by 3 and 4 by 2',unit:'cm2'}],
  answer:[{shape:'area',expr:'rectangle 7 by 4',unit:'cm2',answer:'28',value:28},{shape:'area',expr:'rectangle 7 by 4',unit:'cm2'}],
  drop:[{shape:'area',expr:'rectangle 7 by 4'},{shape:'area',expr:'rectangle 7 by 4',unit:'cm'},{shape:'area',expr:'square 5',unit:'cm2'},{shape:'area',expr:'rectangle 7 by 4',unit:'cm2',to:'decimal'},{shape:'area',expr:'rectangle 0 by 4',unit:'cm2'}],
 },
 'unit-rate':{
  keep:[{shape:'rate',expr:'5 pens cost 3.50, 8',unit:'€'},{shape:'rate',expr:'12 kg cost 30, 1',unit:'£'},{shape:'rate',expr:'240 km in 3 h, 5',unit:'km'}],
  answer:[{shape:'rate',expr:'5 pens cost 3.50, 8',unit:'€',answer:'5.60',value:5.6},{shape:'rate',expr:'5 pens cost 3.50, 8',unit:'€'}],
  drop:[{shape:'rate',expr:'5 pens cost 3.50, 8'},{shape:'rate',expr:'5 pens cost 3.50, 5',unit:'€'},{shape:'rate',expr:'5 sweets cost 3.50, 8',unit:'€'},{shape:'rate',expr:'5 pens cost 3.50, 8',unit:'€',to:'decimal'},{shape:'rate',expr:'240 km in 3 h, 5',unit:'€'}],
 },
 'ratio-share':{
  keep:[{shape:'ratio',expr:'12:18'},{shape:'ratio',expr:'60 in 2:3'},{shape:'ratio',expr:'45 in 4:5',unit:'€'},{shape:'ratio',expr:'2:3 = ?:15'},{shape:'ratio',expr:'4:5 = 12:?'}],
  answer:[{shape:'ratio',expr:'60 in 2:3',answer:'24 and 36',pair:[24,36]},{shape:'ratio',expr:'60 in 2:3'}],
  drop:[{shape:'ratio',expr:'2:3'},{shape:'ratio',expr:'61 in 2:3'},{shape:'ratio',expr:'12:18',unit:'kg'},{shape:'ratio',expr:'12:18',form:'simplest'},{shape:'ratio',expr:'12:18',to:'decimal'},{shape:'ratio'}],
 },
};
test('W7c 5b: the batch-3 specs survive the store - practice.set, practice.marked, practice.settle and a reload - add no store key, and a Calculus spec and the earlier specs are untouched',()=>{
 seat();
 const specs=[...Object.values(B3_STORE).flatMap((u)=>u.keep),{shape:'percent-change',expr:'decrease 80 by 25%',unit:'€'},{shape:'missing',expr:'3/4 = ?/12'},{shape:'compute',expr:'4.35 + 2.8'}];
 const calc={shape:'critical-point',f:'x^2 - 4x + 1',on:[0,5]};
 const N=specs.length;
 const items=[...specs.map((spec,i)=>({n:i+1,question:S.question(spec).plain,spec,tier:1+(i%2)})),{n:N+1,question:'q',spec:calc}];
 store.dispatch({type:'practice.set',practice:{topic:'ratio-share',marked:false,items}});
 const got=()=>store.getSession().practice.items;
 assert.deepEqual(got().slice(0,N).map((i)=>i.spec),specs,'practice.set keeps every key');
 store.dispatch({type:'practice.marked',items:got().map((it)=>({...it,verdict:'unsure',said:'x'}))});
 assert.deepEqual(got().slice(0,N).map((i)=>i.spec),specs,'practice.marked keeps them');
 store.dispatch({type:'practice.settle',n:2,reply:'ok',verdict:'right',said:'Number 2 is right.'});
 assert.deepEqual(got()[1].spec,specs[1]);
 clearInterval(globalThis.__desk.ticker);delete globalThis.__desk;delete require.cache[storeFile];store=require(storeFile);
 assert.deepEqual(store.getSession().practice.items.slice(0,N).map((i)=>i.spec),specs,'loaded from session.json and re-validated');
 assert.deepEqual(store.getSession().practice.items[N].spec,calc,'the Calculus spec is untouched by the reload');
 assert.deepEqual(store.getSession().practice.items.slice(0,N).map((i)=>i.tier),specs.map((_,i)=>1+(i%2)));
 const put=(spec)=>{store.dispatch({type:'practice.set',practice:{topic:'ratio-share',marked:false,items:[{n:1,question:'q',spec,tier:1}]}});return store.getSession().practice.items[0];};
 for(const {answer:[withAnswer,clean],drop} of Object.values(B3_STORE)){
  assert.deepEqual(put(withAnswer).spec,clean,'an answer stops at the store');
  for(const bad of drop){const it=put(bad);assert.equal(it.spec,undefined,JSON.stringify(bad));assert.equal(it.tier,undefined,'no spec, no tier');}
 }
 const src=fs.readFileSync(storeFile,'utf8');
 assert.match(src,/const SCHOOL_SPEC_KEYS = \["expr", "form", "unit", "allowNegative", "to"\] as const;/,'W7 batch 3 adds no store key: expr and unit carry every new shape');
 for(const sh of ['ratio','rate','area','stat']){assert.ok(S.SCHOOL_SHAPES.includes(sh));assert.ok(!C.CALC_SHAPES.includes(sh),`${sh} is not a Calculus shape`);assert.equal(C.wellFormed({shape:sh,expr:'12:18'}).ok,false);}
});

test('W7c 1: the four batch-3 units are on the school path after the percent units and before two-step equations - two strands, one-sentence blurbs, honest prerequisites, years that never go down, a generator and no lesson',()=>{
 const want={
  'ratio-share':['Ratio and sharing','Ratio and rates',['frac-equivalent']],
  'unit-rate':['Unit rates and direct proportion','Ratio and rates',['ratio-share','dec-arith']],
  'area':['Area of rectangles, triangles and composite shapes','Geometry and data',[]],
  'mean-range':['Mean and range','Geometry and data',['dec-arith']],
 };
 const order=P.topicsOf('school').map((t)=>t.id);
 assert.deepEqual(order.slice(8,14),['pct-change','ratio-share','unit-rate','area','mean-range','linear-two-step'],'after percent change, before two-step equations');
 for(const [id,[name,strand,prereq]] of Object.entries(want)){
  const t=P.topicIn(id);
  assert.equal(t.name,name);assert.equal(t.strand,strand);assert.deepEqual(t.prereq,prereq,`${id}: prerequisites`);
  // every system's year is fixed between percent change and two-step equations (from memory, a teacher checks)
  assert.deepEqual(t.year,{us:7,uk:8,cz:7,de:6},`${id}: years`);
  assert.ok(!('lessonId' in t),`${id}: the lesson library has no lesson for it`);
  assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,`${id}: one sentence`);assert.doesNotMatch(t.blurb,/\d/,`${id}: no number in the blurb`);
  assert.equal(P.pathOfTopic(id),'school');assert.equal(typeof S.generatorFor(id),'function');
  const row=SYLLABUS.find((x)=>x.id===id);assert.ok(row.bands.us.startsWith('Grade ')&&row.bands.uk.startsWith('Year ')&&/ročník/.test(row.bands.cz)&&/^Klasse/.test(row.bands.de));
  for(const p of prereq)assert.ok(order.indexOf(p)<order.indexOf(id),`${id} needs ${p}, which comes earlier`);
 }
 // the multiply-and-divide blurb is one sentence with one main clause (batch 1's read as two joined by "and")
 assert.equal(P.topicIn('frac-mul-div').blurb,'Fractions are multiplied top by top and bottom by bottom, which is also how you divide once the fraction you divide by is turned upside down.');
 for(const t of P.topicsOf('school'))assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,`${t.id}: one sentence`);
 // the unit a reader says a spec belongs to is the topic on the path, so the hint's stance and the history line name it
 for(const [spec,id] of [[{shape:'ratio',expr:'60 in 2:3'},'ratio-share'],[{shape:'rate',expr:'5 pens cost 3.50, 8',unit:'€'},'unit-rate'],[{shape:'area',expr:'rectangle 7 by 4',unit:'cm2'},'area'],[{shape:'stat',expr:'mean 4, 7, 9, 10'},'mean-range']])
  assert.equal(P.topicIn(S.unitOf(spec)).id,id);
 // every school unit has a generator now: the path's only topics left to the model are the three linear ones
 assert.deepEqual(order.filter((id)=>!S.generatorFor(id)),['linear-one-step','linear-two-step','linear-both-sides']);
});

// ------------------------------------------------------------------ v2 M2b: Pythagoras' theorem and the probability of an event join the path
test('M2b 1: the path grows by two units after the equations - their names, strand, years (from memory, a teacher checks), honest prerequisites, no lesson, a generator, a worked method and an act; no learner-visible string names the exam',()=>{
 const {hasWorked,WORKED_METHODS}=require(src('lib/library/worked.ts'));
 const {DO_IT}=require(src('lib/rules/week.ts'));
 const order=P.topicsOf('school').map((t)=>t.id);
 assert.deepEqual(order.slice(-3),['linear-both-sides','pythagoras','probability']);
 const want={
  'pythagoras':["Pythagoras' theorem",['area'],{us:8,uk:9,cz:8,de:8}],
  'probability':['Probability of an event',['frac-equivalent','dec-convert'],{us:8,uk:9,cz:9,de:8}],
 };
 for(const [id,[name,prereq,year]] of Object.entries(want)){
  const t=P.topicIn(id),row=SYLLABUS.find((x)=>x.id===id);
  assert.equal(t.name,name);assert.equal(t.strand,'Geometry and data');assert.deepEqual(t.prereq,prereq,`${id}: prerequisites`);assert.deepEqual(t.year,year,`${id}: years`);
  assert.ok(!('lessonId' in t),`${id}: no lesson in the library`);
  assert.ok(row.bands.us.startsWith('Grade ')&&row.bands.uk.startsWith('Year ')&&/ročník/.test(row.bands.cz)&&/^Klasse/.test(row.bands.de),`${id}: bands`);
  assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,`${id}: one sentence`);assert.doesNotMatch(t.blurb,/\d/,`${id}: no number in the blurb`);
  assert.equal(P.pathOfTopic(id),'school');assert.equal(typeof S.generatorFor(id),'function');assert.ok(S.SCHOOL_UNIT_SLIPS[id].length>=3);
  assert.ok(hasWorked(id));assert.equal(WORKED_METHODS[id].steps.length,3);assert.ok(DO_IT[id]);
  assert.doesNotMatch([t.name,t.blurb,...Object.values(row.bands),WORKED_METHODS[id].idea,...WORKED_METHODS[id].steps,DO_IT[id],S.SCHOOL_WITHHELD[id]].join(' '),/GCSE|1MA1|Edexcel|certified/i,`${id}: no exam named`);
  // a set is written by code: six distinct questions over the two tiers, none naming the exam, each its unit's own, every spec well formed
  for(const seed of [0,1,7,99,0xffffffff]){
   const set=makeSchoolItems(id,6,seed);
   assert.equal(set.provider,'code');assert.equal(set.items.length,6,`${id} seed ${seed}`);
   assert.equal(new Set(set.items.map((i)=>i.question)).size,6,'six distinct questions');
   assert.deepEqual(set.items.map((i)=>i.tier),[1,1,1,2,2,2]);
   for(const it of set.items){assert.equal(S.unitOf(it.spec),id);assert.deepEqual(S.wellFormed(it.spec),{ok:true});assert.doesNotMatch(it.question,/GCSE|1MA1|Edexcel/i);assert.equal(S.check(it.spec,S.workedAnswer(it.spec,'uk'),'uk').verdict,'right');}
  }
 }
 // every generated unit but the three linear ones is on the path with its generator, as before
 assert.deepEqual(order.filter((id)=>!S.generatorFor(id)),['linear-one-step','linear-two-step','linear-both-sides']);
 assert.equal(Object.keys(S.SCHOOL_GENERATORS).length,14);
 // the gap years: probability is held later than usual in us, uk and de, to keep the list from going down (the unit's comment says so)
 const prob=SYLLABUS.find((x)=>x.id==='probability'),pyth=SYLLABUS.find((x)=>x.id==='pythagoras'),both=SYLLABUS.find((x)=>x.id==='linear-both-sides');
 for(const k of ['us','uk','cz','de']){assert.ok(pyth.year[k]>=both.year[k]&&prob.year[k]>=pyth.year[k],`${k}: the list never goes down`);}
 const src2=fs.readFileSync(src('lib/library/syllabus.ts'),'utf8');
 assert.match(src2,/HELD LATER THAN USUAL in three systems/);assert.match(src2,/a teacher reads these four before release/);
});
