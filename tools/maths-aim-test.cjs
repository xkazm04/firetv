/**
 * A slip is set again on purpose, and rubbed out of the ruler when it stops (challenge-2026-10-07 math-buddy-A).
 * Six more on a school unit is drawn in code so the learner's own slips would show (desk/src/lib/desk/items.ts
 * makeSchoolItems with an aim), a school attempt carries the slips its item shows (rules/kinds Attempt.shows), three
 * usual right answers on items that show a slip rub it out of the record (rules/slips.ts, applied in
 * session/learners.ts), and the ruler draws the NEWEST four live slips. rules/school slipShows and slipValue are
 * pinned against check() itself, so 'shows' always means 'check would name it'.
 * Run with npm test in desk/ (directly: node tools/maths-aim-test.cjs). No model is called - the text and vision engines
 * are stubbed at the provider registry and THROW - and the data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
const jsx={module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:jsx}).outputText,file);
require.extensions['.tsx']=require.extensions['.ts'];
// next/font runs only under Next: the face module answers with its class names
for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
const data=path.join(os.tmpdir(),`desk-maths-aim-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const S=require(src('lib/rules/school.ts'));
const {makeSchoolItems}=require(src('lib/desk/items.ts'));
const {markTyped}=require(src('lib/desk/mark.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

let seen=[];
/** Every engine throws: an aimed set, typed marking and the route must reach none of them. */
const noModel=()=>{seen=[];for(const kind of ['text','vision'])reg.useProvider(kind,{name:'stub',run:async(req)=>{seen.push(req);throw new Error(`the ${kind} engine was called`);}});};
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
let LEARNER='maths-aim-scratch',seats=0;
function seat(){
 LEARNER=`maths-aim-scratch-${++seats}`;
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Mia',type:'elementary',age:12,system:'uk',modules:['maths']}});store.dispatch({type:'profile.save'});
}
const UNITS=Object.keys(S.SCHOOL_GENERATORS);
const shows=(items,slip)=>items.filter((i)=>S.slipShows(i.spec,slip)).length;
const slipsOf=(id,topic)=>learners.getLearner(id).skills[topic]?.slips??[];
const heldOf=(id,topic)=>learners.getLearner(id).skills[topic]?.held;
/** A scratch learner who has made `slip` on `topic` once, as a marked wrong answer records it. */
const made=(id,topic,slip)=>learners.recordAttempt(id,topic,false,slip);

// ------------------------------------------------------------------ 1. the pure rules, pinned against check
test('case 1: slipShows and slipValue are pinned against check(); 46 of 46 slips show on a drawn spec; another unit\'s slip and junk give false, never a throw',()=>{
 assert.equal(typeof S.slipShows,'function');assert.equal(typeof S.slipValue,'function');
 assert.equal(UNITS.length,12);
 const all=UNITS.flatMap((u)=>S.SCHOOL_UNIT_SLIPS[u].map((s)=>[u,s]));
 assert.equal(all.length,46);
 const reached=new Set();
 for(const u of UNITS)for(let seed=0;seed<200;seed++)for(const tier of [1,2]){
  const spec=S.SCHOOL_GENERATORS[u](seed,tier);if(!spec)continue;
  for(const slip of S.SCHOOL_UNIT_SLIPS[u]){
   if(!S.slipShows(spec,slip))continue;
   reached.add(slip);
   const v=S.check(spec,S.slipValue(spec,slip),'uk');
   assert.equal(v.verdict,'wrong',`${u} ${spec.expr} ${slip}: check says ${v.verdict}`);
   assert.equal(v.slip,slip,`${u} ${spec.expr}: check names ${v.slip}, not ${slip}`);
  }
 }
 assert.deepEqual(all.map(([,s])=>s).filter((s)=>!reached.has(s)),[],'every one of the 46 slips shows on at least one drawn spec');
 for(const s of ['ratio-split-each','ratio-as-amounts','ratio-by-difference'])assert.ok(reached.has(s),`${s} is a checkRatio pair and shows`);
 // another unit's slip, an unknown id, junk specs: false, no throw
 const frac=S.SCHOOL_GENERATORS['frac-add-sub'](3,1),dec=S.SCHOOL_GENERATORS['dec-arith'](3,1);
 assert.equal(S.slipShows(frac,'dec-lined-up'),false);assert.equal(S.slipShows(dec,'tops-and-bottoms'),false);
 const junk=[null,undefined,0,'x',[],{},{shape:'compute'},{shape:'compute',expr:'junk'},{shape:'nope',expr:'1/2 + 1/3'},{shape:'ratio',expr:'1:0'}];
 for(const j of junk)for(const slip of ['tops-and-bottoms','dec-lined-up',undefined,null,42,'constructor','__proto__']){
  assert.doesNotThrow(()=>S.slipShows(j,slip));assert.equal(S.slipShows(j,slip),false);
  assert.doesNotThrow(()=>S.slipValue(j,slip));
 }
});

// ------------------------------------------------------------------ 2. the set is aimed, in code
test('case 2: makeSchoolItems with an aim draws at least 3 of 6 where the slip shows, in 100 of 100 sets; tiers 3 and 3, six distinct, code, no engine call',()=>{
 noModel();
 const run=(unit,slip,aim)=>{
  let aimed=0;
  for(let k=0;k<100;k++){
   const r=makeSchoolItems(unit,6,7919*k,'standard',false,aim?[slip]:undefined);
   assert.equal(r.provider,'code');assert.equal(r.tries,0);assert.equal(r.items.length,6);
   assert.deepEqual(r.items.map((i)=>i.tier),[1,1,1,2,2,2],'tiers still 3 and 3');
   assert.equal(new Set(r.items.map((i)=>i.question.replace(/\s+/g,''))).size,6,'six distinct questions');
   assert.deepEqual(r.items.map((i)=>i.n),[1,2,3,4,5,6]);
   if(shows(r.items,slip)>=3)aimed++;
  }
  return aimed;
 };
 const before=[run('dec-arith','dec-lined-up',false),run('dec-convert','conv-top-dot-bottom',false)];
 const after_=[run('dec-arith','dec-lined-up',true),run('dec-convert','conv-top-dot-bottom',true)];
 console.log(`case 2 sets with >= 3 aimed items of 100: before ${before.join(' and ')}, after ${after_.join(' and ')}`);
 assert.deepEqual(after_,[100,100]);
 assert.ok(before[0]<100&&before[1]<100,'without an aim the sets are not aimed');
 assert.equal(seen.length,0,'zero engine calls');
});

// ------------------------------------------------------------------ 3. Six more reaches it
test('case 3: POST /api/practice for a learner holding wrong-direction puts a set on the desk with >= 3 items where it shows; no slips, an unaimed set',async()=>{
 seat();noModel();
 made(LEARNER,'frac-add-sub','wrong-direction');
 assert.deepEqual(slipsOf(LEARNER,'frac-add-sub'),['wrong-direction']);
 for(let k=0;k<30;k++){
  const r=await post('practice',{topic:'frac-add-sub'});assert.equal(r.status,200);
  const p=store.getSession().practice;
  assert.equal(p.items.length,6);assert.equal(p.owner,LEARNER);
  assert.ok(shows(p.items,'wrong-direction')>=3,`set ${k}: ${shows(p.items,'wrong-direction')} items show wrong-direction`);
 }
 seat();noModel();
 let reach=0;
 for(let k=0;k<40;k++){
  const r=await post('practice',{topic:'frac-add-sub'});assert.equal(r.status,200);
  if(shows(store.getSession().practice.items,'wrong-direction')>=3)reach++;
 }
 assert.ok(reach<40,`a learner with no slips gets random sets (${reach} of 40 reach 3)`);
 assert.equal(seen.length,0,'no engine called');
});

// ------------------------------------------------------------------ 4. the lifecycle
test('case 4: three usual right attempts on items that show a slip rub it out; making it again resets the count; a right attempt where it does not show moves nothing',()=>{
 const T='frac-add-sub',SL='tops-and-bottoms',on=(id,right,slip,showsIt=true)=>learners.recordAttempt(id,T,right,slip,{shows:showsIt?[SL]:[]});
 // pure module
 const R=require(src('lib/rules/slips.ts'));
 assert.equal(R.HOLD_AT,3);
 const step=(st,a)=>R.stepSlips(st,a);
 let st={slips:[SL]};
 st=step(st,{right:true,shows:[SL]});assert.deepEqual(st,{slips:[SL],held:{[SL]:1}});
 st=step(st,{right:true,shows:[]});assert.deepEqual(st,{slips:[SL],held:{[SL]:1}},'it does not show: nothing moves');
 st=step(st,{right:true});assert.deepEqual(st,{slips:[SL],held:{[SL]:1}},'no shows at all: nothing moves');
 st=step(st,{right:false,shows:[SL]});assert.deepEqual(st,{slips:[SL],held:{[SL]:1}},'a wrong answer with no slip moves nothing');
 st=step(st,{right:true,shows:[SL]});st=step(st,{right:true,shows:[SL]});
 assert.deepEqual(st.slips,[],'the third right attempt rubs it out');assert.ok(!st.held||Object.keys(st.held).length===0,'no held count left');
 // the record
 seat();made(LEARNER,T,SL);
 on(LEARNER,true);on(LEARNER,true);
 assert.deepEqual(slipsOf(LEARNER,T),[SL],'two are not three');assert.equal(heldOf(LEARNER,T)[SL],2);
 on(LEARNER,true,undefined,false);
 assert.equal(heldOf(LEARNER,T)[SL],2,'an item where it does not show moves nothing');
 on(LEARNER,true);
 assert.deepEqual(slipsOf(LEARNER,T),[],'rubbed out');assert.equal(heldOf(LEARNER,T),undefined,'no held count left');
 // two, then made again: the count resets, and it is the newest
 seat();made(LEARNER,T,SL);learners.recordAttempt(LEARNER,T,false,'wrong-direction');
 assert.deepEqual(slipsOf(LEARNER,T),[SL,'wrong-direction']);
 on(LEARNER,true);on(LEARNER,true);
 on(LEARNER,false,SL);
 assert.deepEqual(slipsOf(LEARNER,T),['wrong-direction',SL],'made again: it is the newest');
 assert.ok(!heldOf(LEARNER,T)||!(SL in heldOf(LEARNER,T)),'its count is reset');
 on(LEARNER,true);on(LEARNER,true);
 assert.deepEqual(slipsOf(LEARNER,T),['wrong-direction',SL],'it needs three more');
 on(LEARNER,true);
 assert.deepEqual(slipsOf(LEARNER,T),['wrong-direction']);
});

// ------------------------------------------------------------------ 5. end to end, and the ruler
require.extensions['.tsx']=require.extensions['.ts'];
function drawMaths(name,s,extra={}){
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server')),{createElement}=require(path.join(root,'node_modules/react'));
 const M=require(src('maths/MathsTV.tsx'));
 return renderToStaticMarkup(createElement(M[name],{s,focus:s.focus??0,busy:false,...extra}));
}
const seated=(skills,extra={})=>({...store.getSession(),skills,focus:0,...extra});
const scratches=(html)=>{const m=/<div class="mb-slips"[^>]*>/.exec(html);return m?m[0]:null;};

test('case 5: a typed set of six frac-add-sub items, three showing tops-and-bottoms, all right, rubs the slip out and the Topics ruler draws no scratch',()=>{
 const T='frac-add-sub',SL='tops-and-bottoms';
 seat();noModel();made(LEARNER,T,SL);
 const items=makeSchoolItems(T,6,4242).items;
 assert.ok(shows(items,SL)>=3,'the set shows the slip three times or more');
 const answer=(spec)=>{const m=/^(\d+)\/(\d+) ([-+]) (\d+)\/(\d+)$/.exec(spec.expr);const [a,b,c,d]=[+m[1],+m[2],+m[4],+m[5]];return `${m[3]==='+'?a*d+c*b:a*d-c*b}/${b*d}`;};
 const set={topic:T,items,marked:false};
 // before: the scratch is on the topic's groove
 assert.ok(scratches(drawMaths('Topics',seated(learners.getLearner(LEARNER).skills))),'the scratch is drawn while the slip is live');
 const r=markTyped(items.map((i)=>answer(i.spec)),set,LEARNER,()=>true,'uk');
 assert.equal(seen.length,0,'typed marking calls no engine');
 assert.ok(r.items.every((i)=>i.verdict==='right'));
 assert.deepEqual(slipsOf(LEARNER,T),[],'the slip is gone from the record');
 assert.equal(scratches(drawMaths('Topics',seated(learners.getLearner(LEARNER).skills))),null,'.mb-slips is absent');
 assert.ok(!/mb-slips/.test(drawMaths('Topics',seated(learners.getLearner(LEARNER).skills))));
});

test('case 6: the ruler draws the NEWEST four live slips; Six more names the slip it aims at in <= 25 words, and claims no aim where there is none',()=>{
 const RR=require(src('tv/mathsRows.ts'));
 seat();
 const ids=['sa','sb','sc','sd','se'];
 const html=drawMaths('Topics',seated({'frac-add-sub':{topic:'frac-add-sub',seen:5,right:1,estimate:0.2,secure:false,lastSeen:1,slips:ids}}));
 const tag=scratches(html);assert.ok(tag,'the scratches are drawn');
 assert.match(tag,/data-slips="sb sc sd se"/,'slips [a,b,c,d,e] draw b..e');
 assert.equal((html.match(/<div class="mb-slips"[^>]*>(.*?)<\/div>/)[1].match(/<span>/g)??[]).length,4);
 const words=(t)=>t.split(/\s+/).filter(Boolean).length;
 const name='Add and subtract fractions';
 const aimed=RR.moreLine('frac-add-sub',name,['wrong-direction','tops-and-bottoms']);
 assert.ok(aimed.includes('Added the tops and the bottoms'),`names the newest live slip: ${aimed}`);
 assert.ok(words(aimed)<=25,`${words(aimed)} words`);
 // every school slip's line fits
 for(const u of UNITS)for(const sl of S.SCHOOL_UNIT_SLIPS[u]){const l=RR.moreLine(u,'Add and subtract fractions',[sl]);assert.ok(words(l)<=25,`${u} ${sl}: ${words(l)} words: ${l}`);}
 const none=RR.moreLine('frac-add-sub',name,[]);
 assert.ok(!/aimed/i.test(none),`no 'aimed' claim: ${none}`);
 assert.ok(!/aimed/i.test(RR.moreLine('frac-add-sub',name,['not-a-slip-of-this-unit'])),'a slip of no school unit is no live slip');
 for(const t of ['linear-one-step','calc1-functions'])assert.equal(RR.moreLine(t,'X',['sign-lost-moving']),'Six new questions on X, aimed at the slips the desk has seen. Work them on paper, like this set.','linear and Calculus keep today\'s line');
 // drawn on the Sheet
 seat();
 const items=makeSchoolItems('frac-add-sub',6,9).items.map((it)=>({...it,studentAnswer:'1',verdict:'right',said:'ok'}));
 const K=require(src('tv/keys.ts')),practice={topic:'frac-add-sub',items,marked:true};
 const f=[...Array(30).keys()].find((i)=>K.stopAt(K.sheetStops(practice),i)==='more');assert.notEqual(f,undefined);
 const sheet=(slips)=>drawMaths('Sheet',seated({'frac-add-sub':{topic:'frac-add-sub',seen:5,right:1,estimate:0.2,secure:false,lastSeen:1,slips}},{practice,focus:f,topic:'frac-add-sub'}));
 assert.ok(sheet(['tops-and-bottoms']).includes('Added the tops and the bottoms'));
 assert.ok(!/aimed/i.test(sheet([])));
});

// ------------------------------------------------------------------ 7. the guards
test('GUARD case 7: a step-up attempt never moves slips or held counts; linear and Calculus never rub a slip out; no aim is byte-identical to today\'s items',()=>{
 const T='frac-add-sub',SL='tops-and-bottoms';
 seat();made(LEARNER,T,SL);learners.recordAttempt(LEARNER,T,true,undefined,{shows:[SL]});
 const before=JSON.stringify(learners.getLearner(LEARNER).skills[T]);
 const usual=(rec)=>{const {stretch,...rest}=rec;return JSON.stringify(rest);};
 for(let k=0;k<5;k++)learners.recordAttempt(LEARNER,T,true,undefined,{stretch:true,shows:[SL]});
 learners.recordAttempt(LEARNER,T,false,'wrong-direction',{stretch:true,shows:[SL]});
 const after_=learners.getLearner(LEARNER).skills[T];
 assert.equal(usual(after_),before,'the usual record, slips and held count, byte-identical');
 assert.ok(after_.stretch.seen>=6);
 // an attempt on a topic whose items carry no shows (linear, Calculus) only appends
 for(const topic of ['linear-one-step','calc1-functions']){
  seat();made(LEARNER,topic,'sign-lost-moving');
  for(let k=0;k<6;k++)learners.recordAttempt(LEARNER,topic,true);
  assert.deepEqual(slipsOf(LEARNER,topic),['sign-lost-moving'],`${topic}: append-only`);assert.equal(heldOf(LEARNER,topic),undefined);
 }
 // marking: a linear item and a school item without shows never rub out
 // no aim: the same items as an empty aim and as undefined, for the same seed and mix
 for(const u of UNITS)for(const mix of ['standard','easier','harder'])for(const seed of [1,77,4242]){
  const a=JSON.stringify(makeSchoolItems(u,6,seed,mix,false)),b=JSON.stringify(makeSchoolItems(u,6,seed,mix,false,undefined)),c=JSON.stringify(makeSchoolItems(u,6,seed,mix,false,[]));
  const strip=(x)=>JSON.stringify({...JSON.parse(x),ms:0});
  assert.equal(strip(a),strip(b));assert.equal(strip(a),strip(c),`${u} ${mix} ${seed}: an empty aim is no aim`);
 }
 // an aim another unit's slip leaves the set as it was
 const plain=makeSchoolItems('frac-add-sub',6,99),stray=makeSchoolItems('frac-add-sub',6,99,'standard',false,['dec-lined-up']);
 assert.deepEqual(stray.items,plain.items,'an aim the unit cannot show changes nothing');
});

// ------------------------------------------------------------------ 8. learners.json
test('case 8: a held count survives a reload only as a whole number >= 0 for an id still in slips; junk is dropped; an old file loads unchanged',()=>{
 const FILE=path.join(data,'learners.json');
 fs.mkdirSync(data,{recursive:true});
 const rec=(extra)=>({topic:'t',seen:3,right:1,estimate:0.4,secure:false,lastSeen:5,slips:['a','b'],...extra});
 const book={
  old:{id:'old',skills:{t:rec({})}},
  good:{id:'good',skills:{t:rec({held:{a:2,b:0}})}},
  junk:{id:'junk',skills:{t:rec({held:{a:-1,b:1.5,zzz:2}}),u:rec({held:'x'}),v:rec({held:[1,2]}),w:rec({held:{a:'2',b:null}}),x:rec({held:null})}},
 };
 fs.writeFileSync(FILE,JSON.stringify(book));
 assert.deepEqual(learners.getLearner('old').skills.t,rec({}),'a file written before this loads unchanged (no held field appears)');
 assert.ok(!('held' in learners.getLearner('old').skills.t));
 assert.deepEqual(learners.getLearner('good').skills.t.held,{a:2,b:0});
 const j=learners.getLearner('junk').skills;
 for(const k of Object.keys(j))assert.ok(!('held' in j[k])||Object.keys(j[k].held).length===0,`${k}: junk held dropped`);
 // a round trip keeps what is kept
 learners.saveLearner(learners.getLearner('good'));
 assert.deepEqual(JSON.parse(fs.readFileSync(FILE,'utf8')).good.skills.t.held,{a:2,b:0});
});
