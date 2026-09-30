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
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
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
test('1: "Add and subtract fractions" is the first topic of the school path "School maths", with a generator and no lesson',()=>{
 assert.equal(P.PATHS.school.name,'School maths');
 assert.equal(SYLLABUS[0].id,UNIT);assert.equal(P.topicsOf('school')[0].id,UNIT);
 assert.equal(P.pathOfTopic(UNIT),'school');
 const t=P.topicIn(UNIT);
 assert.equal(t.name,'Add and subtract fractions');assert.equal(t.strand,'Fractions');assert.deepEqual(t.prereq,[]);
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
