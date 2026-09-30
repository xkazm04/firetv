/**
 * The School maths ruler after Family W5b put "Add and subtract fractions" before the linear equations:
 *   - the needle rule: on a school path the needle (and where "Teach me something" opens Topics) is the first topic not
 *     latched secure AFTER the last latched one, else the first topic - so a learner who secured one-step equations
 *     keeps their place on two-step equations instead of being sent back to the new first unit. One rule, in
 *     library/paths.ts (`afterLastSecure`, `frontierOn`), read by the ruler (tv/rulerRows `rulerFrontier`), Tonight's
 *     strip (`stripModel`) and Topics' first focus (tv/keys `topicsFocus`). The Calculus path is unchanged;
 *   - the gap line waits for a placement (owner decision D2): the SCHOOL tick is drawn for every school system, the gap
 *     line between the needle and the tick is not, because Phase 1 has no Math placement (tv/mathsRows `mathPlaced`).
 *     The gap line's code stays; `schoolMarks` draws it once a placement exists.
 * The TV is rendered to static markup (react-dom/server) as MathsTV draws it, so the tick, the gap line and the needle
 * are read off the real component. Run with npm test in desk/ (directly: node tools/school-ruler-test.cjs). No model,
 * no server; the store writes to a scratch DESK_DATA_DIR under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
const opts={module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:opts}).outputText,file);
require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{...opts,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-school-ruler-'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
// next/font runs only under Next: here each face module answers with its class names (as tools/tv-recap-test.cjs does)
for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}],['landing/themes/blueprint/fonts.ts',{BLUEPRINT_FONTS:'bp-fonts'}]]){
 const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}

const src=(f)=>path.join(root,'src',f);
const P=require(src('lib/library/paths.ts'));
const RR=require(src('tv/rulerRows.ts'));
const R=require(src('tv/mathsRows.ts'));
const K=require(src('tv/keys.ts'));
const store=require(src('lib/session/store.ts'));
const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
const {createElement}=require(path.join(root,'node_modules/react'));

const SCHOOL=P.topicsOf('school'),CALC=P.topicsOf('calc1');
const ids=(ts)=>ts.map((t)=>t.id);
const [F,ONE,TWO,BOTH]=ids(SCHOOL);
/** A latched-secure record (the TV reads only `secure`, `estimate`, `slips`). */
const rec=(topic,secure=true,estimate=secure?1:0.4)=>({topic,seen:6,right:5,estimate,secure,lastSeen:1,slips:[]});
const skillsOf=(list)=>Object.fromEntries(list.map((id)=>[id,rec(id)]));
/** The frontier as the ruler drew it before W5b: the first topic not secure, else the last. */
const oldRuler=(topics,secure)=>{const i=topics.findIndex((t)=>!secure.includes(t.id));return i<0?topics.length-1:i;};

function seated({age=12,system='uk',type='elementary',mathPath}={}){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'ruler-scratch',name:'Mia',type,age,system,modules:['maths'],...(mathPath?{mathPath}:{})}});store.dispatch({type:'profile.save'});
 return store.getSession();
}

// ------------------------------------------------------------------ 1. the needle rule
test('1: the school frontier is the first topic not secure after the last secure one - the same on the ruler, the strip and Topics',()=>{
 assert.deepEqual(ids(SCHOOL),['frac-add-sub','linear-one-step','linear-two-step','linear-both-sides']);
 // [secure ids, frontierOn id (undefined: none left), the ruler's topic, Teach me something's focus]
 const CASES=[
  [[],F,0,0,'a fresh learner starts on fractions'],
  [[ONE],TWO,2,2,'one-step equations secure: the needle stays on two-step equations, not back at fractions'],
  [[F],ONE,1,1,'only fractions secure: on to one-step equations'],
  [[F,ONE],TWO,2,2],
  [[ONE,TWO],BOTH,3,3],
  [[F,ONE,TWO],BOTH,3,3],
  [[F,ONE,TWO,BOTH],undefined,3,0,'everything secure: the needle at the end, Topics on the first stop'],
  [[BOTH],undefined,3,0,'the last topic secure: nothing after it'],
  [[F,TWO],BOTH,3,3,'a gap before the last secure topic does not pull the needle back'],
 ];
 for(const [secure,next,ruler,focus,why] of CASES){
  const label=why??JSON.stringify(secure);
  assert.equal(P.frontierOn('school',secure)?.id,next,`frontierOn: ${label}`);
  assert.equal(RR.rulerFrontier(SCHOOL,(id)=>secure.includes(id),true),ruler,`ruler: ${label}`);
  assert.equal(K.topicsFocus({profiles:[{id:'a',mathPath:undefined}],learner:{id:'a'},skills:skillsOf(secure)}),focus,`Topics focus: ${label}`);
  const strip=RR.stripModel(SCHOOL,Object.fromEntries(SCHOOL.map((t)=>[t.id,secure.includes(t.id)?'secure':'later'])),true);
  assert.equal(strip.needle.index,next===undefined?SCHOOL.length:SCHOOL.findIndex((t)=>t.id===next),`strip: ${label}`);
 }
 // what W5b would have done without the rule: one-step equations secure sent the needle back to fractions
 assert.equal(oldRuler(SCHOOL,[ONE]),0);
 assert.equal(P.afterLastSecure([],()=>true),0);assert.equal(P.afterLastSecure(['a','b','c'],(x)=>x==='b'),2);
});

test('2: the Calculus path is unchanged - the ruler\'s first-not-secure, and the strip and Topics\' prerequisite frontier',()=>{
 const calc=ids(CALC);
 for(let n=0;n<=calc.length;n++){
  const secure=calc.slice(0,n);
  assert.equal(RR.rulerFrontier(CALC,(id)=>secure.includes(id),false),oldRuler(CALC,secure),`ruler at ${n} secure`);
  assert.equal(P.frontierOn('calc1',secure)?.id,P.nextOn('calc1',secure)?.id,`frontierOn is nextOn at ${n}`);
  const st=Object.fromEntries(calc.map((id)=>[id,secure.includes(id)?'secure':'later']));
  assert.deepEqual(RR.stripModel(CALC,st,false),RR.stripModel(CALC,st),'the strip\'s default is the course rule');
 }
 // out of order: a Calculus topic secured ahead leaves every Calculus needle where it was (pinned in maths-ruler-test too)
 let seed=7;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
 for(let k=0;k<200;k++){
  const secure=calc.filter(()=>rnd()<0.4);
  assert.equal(RR.rulerFrontier(CALC,(id)=>secure.includes(id),false),oldRuler(CALC,secure));
  assert.equal(P.frontierOn('calc1',secure)?.id,P.nextOn('calc1',secure)?.id);
 }
 const odd=[calc[15]];
 assert.equal(K.topicsFocus({profiles:[{id:'c',mathPath:'calc1'}],learner:{id:'c'},skills:skillsOf(odd)}),0,'Newton secure alone: Topics still opens at the first topic whose prereqs are met');
});

// ------------------------------------------------------------------ 2. the gap line waits for a placement
test('3: schoolMarks - the tick with a school year, the gap line only with a placement; Phase 1 has no Math placement',()=>{
 assert.deepEqual(RR.schoolMarks(null,false),{tick:false,gap:false},'a course, or no age: nothing');
 assert.deepEqual(RR.schoolMarks(null,true),{tick:false,gap:false});
 for(const e of [-1,0,1,3,4])assert.deepEqual(RR.schoolMarks(e,false),{tick:true,gap:false},`exp ${e}: the tick, no gap line`);
 assert.deepEqual(RR.schoolMarks(3,true),{tick:true,gap:true},'the machinery is kept for a placement');
 assert.equal(R.mathPlaced(store.getSession()),false);assert.equal(R.mathPlaced(),false);
});

/** Tonight or Topics as MathsTV draws it for this session. */
function draw(s){const {MathsTV}=require(src('maths/MathsTV.tsx'));const q=console.error;console.error=()=>{};try{return renderToStaticMarkup(createElement(MathsTV,{s,busy:false}));}finally{console.error=q;}}
const leftOf=(html,cls)=>{const m=new RegExp(`class="${cls}"[^>]*style="left:\\s*([\\d.]+)px`).exec(html);return m?Number(m[1]):null;};

test('4: on the TV, for a 12-year-old in each school system: the SCHOOL tick is drawn, the gap line is not, the needle at the frontier',()=>{
 const span=(1728-52)/SCHOOL.length;
 for(const system of ['us','uk','cz','de']){
  for(const screen of ['tonight','topics']){
   const s={...seated({system}),screen,focus:0,skills:skillsOf([ONE])};
   const html=draw(s);
   assert.match(html,/data-role="maths-ruler"/,`${system} ${screen}: the ruler`);
   assert.match(html,/class="mb-flag"[^>]*>.*?<div class="mc">School<\/div>/,`${system} ${screen}: the SCHOOL tick is drawn`);
   assert.doesNotMatch(html,/mb-gapline/,`${system} ${screen}: no gap line (D2: no placement in Phase 1)`);
   const exp=P.expectedOn('school',system,12);
   assert.equal(leftOf(html,'mb-flag'),26+Math.max(0,Math.min(SCHOOL.length,exp))*span,`${system}: the tick after ${exp} topics`);
   assert.equal(leftOf(html,'mb-marker'),26+2*span,`${system} ${screen}: the needle at the start of two-step equations, not at fractions`);
   for(const t of SCHOOL)assert.ok(html.includes(t.name),`${t.name} is on the ruler`);
  }
 }
 // a fresh learner: the needle at the start of the ruler (fractions), the tick still drawn, no gap line
 const fresh=draw({...seated({system:'uk'}),screen:'topics',focus:0,skills:{}});
 assert.equal(leftOf(fresh,'mb-marker'),26);assert.match(fresh,/class="mb-flag"/);assert.doesNotMatch(fresh,/mb-gapline/);
 // with fractions secure and one-step equations in progress, the needle is part way through one-step equations
 const inProgress=draw({...seated({system:'cz'}),screen:'tonight',focus:0,skills:{[F]:rec(F),[ONE]:rec(ONE,false,0.5)}});
 assert.equal(leftOf(inProgress,'mb-marker'),26+(1+0.5)*span);
 // "other" has no school year: no tick, no gap line (as before)
 const other=draw({...seated({type:'other',age:30}),screen:'topics',focus:0,skills:{}});
 assert.doesNotMatch(other,/class="mb-flag"/);assert.doesNotMatch(other,/mb-gapline/);
 // a Calculus learner: no tick, no gap line, and the ruler pans (as before)
 const calc=draw({...seated({type:'other',age:19,mathPath:'calc1'}),screen:'topics',focus:0,skills:{}});
 assert.doesNotMatch(calc,/class="mb-flag"/);assert.doesNotMatch(calc,/mb-gapline/);assert.match(calc,/data-pan="true"/);
});

test('4b: the focused name is fitted whole on the big ruler whether it pans or not (the fourth school topic in a 419 px slot)',()=>{
 const tv=fs.readFileSync(src('maths/MathsTV.tsx'),'utf8');
 assert.match(tv,/useNameFit\(m\.pan \|\| !!big,/,'the fit runs on the big ruler, panning or not');
 assert.match(tv,/ref=\{big \? win : undefined\}/,'the non-panning big ruler carries the fit');
 assert.equal((1728-52)/SCHOOL.length,419);
});

test('5: the first evening\'s title is the path\'s own name, and a learner with one-step equations secure counts one of four',()=>{
 assert.match(draw({...seated(),screen:'tonight',focus:0,skills:{}}),/School maths, from the first/);
 assert.match(draw({...seated(),screen:'tonight',focus:0,skills:skillsOf([ONE])}),/One of 4 topics/);
});
