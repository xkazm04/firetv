/**
 * Six like this one (challenge-2026-10-07 math-buddy-B): a homework problem's unit, practised in one press.
 * On the Hint screen a task that reads as a school unit with a code generator, on the learner's own path, has a second
 * stop that asks for a set on that unit (keys.ts, through the existing set() call with stay), the pill says so
 * (MathsTV HintScreen), and the Page card names the unit beside the number. rules/kinds likeTopic is the one pure reader.
 * Run with npm test in desk/ (directly: node tools/maths-like-test.cjs). No model is called: the vision engine THROWS,
 * the text engine is stubbed for the hint only, and the data directory is disposable, under the OS temp dir.
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
const data=path.join(os.tmpdir(),`desk-maths-like-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const S=require(src('lib/rules/school.ts'));
const K=require(src('lib/rules/kinds.ts'));
const keys=require(src('tv/keys.ts'));
const {markTyped}=require(src('lib/desk/mark.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const UNITS=Object.keys(S.SCHOOL_GENERATORS);
const FRAC='3/4 + 1/6 =';
const LOCAL={busy:false,table:false,hintInFlight:false};
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const drain=async()=>{for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));};
let seenText=[],seenVision=[];
/** The text engine answers the hint only; vision throws. Every call is counted. */
const stubEngines=()=>{
 seenText=[];seenVision=[];
 reg.useProvider('text',{name:'stub',run:async(req)=>{seenText.push(req);return {raw:JSON.stringify({hint:'What do both bottoms go into?',what_to_try_next:'Write the bottoms down.'})};}});
 reg.useProvider('vision',{name:'stub',run:async(req)=>{seenVision.push(req);throw new Error('the vision engine was called');}});
};
let seats=0,LEARNER='';
function seat(){
 LEARNER=`maths-like-scratch-${++seats}`;
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Mia',type:'elementary',age:12,system:'uk',modules:['maths']}});store.dispatch({type:'profile.save'});
}

// a plain session for the keymap and the renders, as tools/tv-keys-test.cjs and maths-tv-test.cjs build them
const item=(text,n=1)=>({n,key:`k${n}`,text,band:[0,10]});
function session(text,patch={}){
 const {mathPath,...rest}=patch;
 const profile={id:'ema',name:'Ema',type:'high-school',age:14,system:'uk',modules:['maths'],...(mathPath?{mathPath}:{})};
 return {subject:'maths',screen:'hint',focus:1,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,learner:{id:'ema',name:'Ema'},profiles:[profile],draft:null,
  timer:{running:false,left:1500,phase:'work'},pages:[{id:'p1',subject:'maths',title:'Sheet one',img:'',w:100,h:100,items:[item(text)]}],pageIx:0,itemIx:0,reading:false,
  hint:{key:'k1',problem:text,stage:1,hint1:{hint:'What do both bottoms go into?',next:'Write the bottoms down.'},hint2:null,askedQ:''},
  lesson:null,lessonPaused:false,noLesson:true,english:null,essay:null,practice:null,topic:null,walkIx:0,skills:{},history:[],jobs:{},status:'',
  log:{started:null,minutes:0,problems:[],hard:[],hints:0},...rest};
}
function draw(name,s){
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server')),{createElement}=require(path.join(root,'node_modules/react'));
 const M=require(src('maths/MathsTV.tsx'));
 return renderToStaticMarkup(createElement(M[name],{s,focus:s.focus}));
}
const text=(html)=>html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
/** The second action pill of the Hint screen: its attributes and what it holds. */
const pill=(html)=>{const m=/<div class="mb-act" data-role="maths-secondary"([^>]*)>(.*?)<\/div>/.exec(html);return m?{attrs:m[1],inner:m[2],label:text(m[2])}:null;};
const cardOf=(html)=>{const i=html.indexOf('data-role="maths-hint"');return html.slice(i,html.indexOf('</aside>',i));};
const job=(phase,key,error)=>({practice:{id:'j1',phase,startedAt:1,key,...(error?{error}:{})}});

// ------------------------------------------------------------------ 1. the pure reader
test('case 1: likeTopic reads the unit of a printed task, on the learner\'s path, with a code generator, else null (kinds.ts likeTopic)',()=>{
 assert.equal(typeof K.likeTopic,'function','likeTopic is exported by rules/kinds.ts');
 assert.equal(K.likeTopic(FRAC,'school'),'frac-add-sub');
 assert.equal(K.likeTopic('Work out 3/4 - 1/6','school'),'frac-add-sub');
 assert.equal(UNITS.length,14);
 for(const unit of UNITS)for(let seed=0;seed<20;seed++)for(const tier of [1,2]){
  const spec=S.SCHOOL_GENERATORS[unit](seed,tier);if(!spec)continue;
  const q=S.question(spec).plain;
  assert.equal(K.likeTopic(q,'school'),unit,`${unit} seed ${seed} tier ${tier}: "${q}"`);
 }
 assert.equal(K.likeTopic('Solve for x: 2x + 3 = 11','school'),null,'linear: no generator');
 assert.equal(K.likeTopic('Find the derivative of x^2','school'),null,'Calculus: no unit named by code');
 assert.equal(K.likeTopic('Find the derivative of x^2','calc1'),null);
 assert.equal(K.likeTopic(FRAC,'calc1'),null,'a school task on the calc1 path: not on the learner\'s path');
 for(const j of [null,undefined,0,42,'',' ','junk',{},[],'x'.repeat(5000),'3/0 + 1/2 =','\u0000'])for(const p of ['school','calc1',undefined,null,'nope'])assert.doesNotThrow(()=>K.likeTopic(j,p),`junk ${String(j).slice(0,12)}`);
 for(const j of [null,undefined,0,'',{},'junk'])assert.equal(K.likeTopic(j,'school'),null);
});

// ------------------------------------------------------------------ 2. one press
test('case 2: Select on the hint\'s second stop of a school-unit task asks /api/practice {topic} and posts topic.open {stay}; the screen stays hint (keys.ts hint handler)',()=>{
 const step=keys.tvKey(session(FRAC),'select',LOCAL);
 assert.deepEqual(step.calls.map((c)=>[c.url,c.body]),[['/api/practice',{topic:'frac-add-sub'}]],'one call to /api/practice');
 assert.deepEqual(step.events,[{type:'topic.open',topic:'frac-add-sub',stay:true}]);
 assert.ok(!step.events.some((e)=>e.type==='nav'),'no navigation: the screen stays hint');
 assert.equal(step.local.busy,true);
 // the store keeps the screen on topic.open with stay
 seat();store.dispatch({type:'nav',screen:'hint',focus:1});
 store.dispatch({type:'topic.open',topic:'frac-add-sub',stay:true});
 assert.equal(store.getSession().screen,'hint');
 // the first stop is the hint's own and is unchanged
 assert.deepEqual(keys.tvKey(session(FRAC,{focus:0}),'select',LOCAL).calls.map((c)=>[c.url,c.body]),[['/api/hint',{stage:2}]]);
});

test('GUARD case 3: a linear task keeps today\'s second stop; busy and a running practice job ask nothing',()=>{
 const LIN='2x + 3 = 11',lesson={id:'l1',title:'One-step equations',why:'x',t:0,text:'x'};
 const withLesson=keys.tvKey(session(LIN,{lesson,noLesson:false}),'select',LOCAL);
 assert.deepEqual(withLesson.events,[{type:'nav',screen:'lesson',focus:0}]);assert.deepEqual(withLesson.calls,[]);
 const none=keys.tvKey(session(LIN),'select',LOCAL);
 assert.deepEqual([none.events,none.calls],[[],[]],'no lesson: Select does nothing');
 const busy=keys.tvKey(session(FRAC),'select',{...LOCAL,busy:true});
 assert.deepEqual([busy.events,busy.calls],[[],[]],'local.busy asks nothing');
 const running=keys.tvKey(session(FRAC,{jobs:job('running','area')}),'select',LOCAL);
 assert.deepEqual([running.events,running.calls],[[],[]],'a running practice job asks nothing');
});

// ------------------------------------------------------------------ 4. the pill
test('case 4: the second pill reads Six like this (six icon); Writing six like it while the job runs and the card keeps the hint; the job\'s own error on failure; a linear task\'s is today\'s (MathsTV HintScreen)',()=>{
 const idle=draw('HintScreen',session(FRAC));
 const p=pill(idle);assert.ok(p);
 assert.equal(p.label,'Six like this');assert.ok(!/data-disabled/.test(p.attrs),'not disabled');
 assert.ok(/<svg viewBox="0 0 46 46"/.test(p.inner),'the six icon');
 const run=draw('HintScreen',session(FRAC,{jobs:job('running','frac-add-sub')}));
 assert.equal(pill(run).label,'Writing six like it');
 assert.ok(cardOf(run).includes('What do both bottoms go into?'),'the taped card keeps the hint');
 const sentence='The desk could not write a set. Try again.';
 const failed=draw('HintScreen',session(FRAC,{jobs:job('failed','frac-add-sub',sentence)}));
 assert.equal(pill(failed).label,'Six like this','a failed job leaves the pill to press again');
 assert.ok(text(cardOf(failed)).includes(sentence),'the quiet line is the job\'s own sentence');
 assert.ok(cardOf(failed).includes('class="quiet"'));
 // another unit's job is not this one's
 assert.equal(pill(draw('HintScreen',session(FRAC,{jobs:job('running','area')}))).label,'Six like this');
 // linear: exactly today's
 const LIN='2x + 3 = 11';
 const lin=pill(draw('HintScreen',session(LIN)));assert.equal(lin.label,'No lesson for this');assert.match(lin.attrs,/data-disabled/);
 const finding=pill(draw('HintScreen',session(LIN,{noLesson:false})));assert.equal(finding.label,'Finding the lesson…');
 const has=pill(draw('HintScreen',session(LIN,{noLesson:false,lesson:{id:'l1',title:'t',why:'w',t:0,text:'x'}})));assert.equal(has.label,'Show me the lesson');
 assert.ok(!/46 46/.test(lin.inner),'no six icon on a linear task');
});

// ------------------------------------------------------------------ 5. homework reaches the ruler
test('case 5: a snapped 3/4 + 1/6 -> hint, one press -> six code-written frac-add-sub items, screen practice, and a typed set reaches skills (api/hint, api/practice, markTyped)',async()=>{
 seat();stubEngines();
 const page={id:'maths-frac',subject:'maths',title:'Sheet',img:'',w:100,h:100};
 store.dispatch({type:'page.reading',page});store.dispatch({type:'page.read',id:page.id,items:[{n:1,text:FRAC,cx:0,cy:0,band:[0,10],key:'k1'}],readMs:1,provider:'test'});
 assert.equal((await post('hint',{})).status,200);await drain();
 assert.equal(seenText.length,1,'the hint is the one engine call');
 store.dispatch({type:'nav',screen:'hint',focus:1});
 const step=keys.tvKey(store.getSession(),'select',LOCAL);
 assert.equal(step.calls.length,1);
 for(const e of step.events)store.dispatch(e);
 assert.equal(store.getSession().screen,'hint','the hint stays while the set is written');
 const r=await post('practice',step.calls[0].body);assert.equal(r.status,200);
 const b=await r.json();assert.equal(b.provider,'code');
 assert.equal(seenText.length,1,'zero engine calls in the practice step');assert.equal(seenVision.length,0);
 const s=store.getSession(),pr=s.practice;
 assert.equal(s.screen,'practice');assert.equal(pr.topic,'frac-add-sub');assert.equal(pr.items.length,6);
 assert.ok(pr.items.every((i)=>S.unitOf(i.spec)==='frac-add-sub'),'six items of the unit');
 const answer=(spec)=>{const m=/^(\d+)\/(\d+) ([-+]) (\d+)\/(\d+)$/.exec(spec.expr);const [a,bb,c,d]=[+m[1],+m[2],+m[4],+m[5]];return `${m[3]==='+'?a*d+c*bb:a*d-c*bb}/${bb*d}`;};
 assert.equal(learners.getLearner(LEARNER).skills['frac-add-sub']?.seen??0,0,'nothing on the record yet');
 markTyped(pr.items.map((i)=>answer(i.spec)),pr,LEARNER,()=>true,'uk');
 assert.equal(learners.getLearner(LEARNER).skills['frac-add-sub'].seen,6,'the homework night reaches the ruler');
 assert.equal(seenVision.length,0);
});

// ------------------------------------------------------------------ 6. the Page card
test('case 6: the Page side kicker reads "Number 1 · Add and subtract fractions" for a unit on the path, "Number 1" otherwise (MathsTV PageScreen)',()=>{
 const page=(t,patch)=>session(t,{screen:'page',focus:0,hint:null,...patch});
 const side=(html)=>text(html.slice(html.indexOf('<aside')));
 assert.match(side(draw('PageScreen',page(FRAC))),/Number 1 · Add and subtract fractions/);
 const lin=side(draw('PageScreen',page('2x + 3 = 11')));
 assert.match(lin,/Number 1/);assert.ok(!/Number 1 ·/.test(lin),'a linear task is named by its number alone');
 const calc=side(draw('PageScreen',page(FRAC,{mathPath:'calc1'})));
 assert.match(calc,/Number 1/);assert.ok(!/Number 1 ·/.test(calc),'off the learner\'s path: the number alone');
});

// ------------------------------------------------------------------ 7. the Calculus learner
test('case 7: a Calculus-1 learner photographing a fractions task gets no Six like this, and Select asks nothing; a calc1 task stays as today',()=>{
 const s=session(FRAC,{mathPath:'calc1'});
 const p=pill(draw('HintScreen',s));assert.equal(p.label,'No lesson for this');assert.match(p.attrs,/data-disabled/);
 const step=keys.tvKey(s,'select',LOCAL);assert.deepEqual([step.events,step.calls],[[],[]]);
 const c=session('Find the derivative of x^2',{mathPath:'calc1'});
 assert.equal(pill(draw('HintScreen',c)).label,'No lesson for this');
 const cs=keys.tvKey(c,'select',LOCAL);assert.deepEqual([cs.events,cs.calls],[[],[]]);
});
