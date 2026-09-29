/**
 * A learner ON a Math course: the profile's mathPath ('school' by default, 'calc1' for Calculus 1) chosen on the TV with
 * the D-pad, kept by the session, and read by the reducers and the keys instead of the global SYLLABUS - the Topics
 * screen walks the learner's own path, "Teach me something" opens it at the learner's frontier, and a set's topic is
 * named on whichever path it belongs to. The school path behaves exactly as before.
 * Run with npm test in desk/ (directly: node tools/maths-course-test.cjs). No model is called; the data directory is
 * disposable, under the OS temp dir, and every learner here is a scratch one.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
const opts={compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),opts).outputText,file);
const data=path.join(os.tmpdir(),`desk-course-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
fs.mkdirSync(data,{recursive:true});
// a desk saved with one junk mathPath and one real one: load() keeps only 'school' and 'calc1'
fs.writeFileSync(path.join(data,'session.json'),JSON.stringify({learner:null,profiles:[
 {id:'course-junk',name:'Junk',type:'other',modules:['maths'],mathPath:'algebra-2'},
 {id:'course-calc',name:'Calc',type:'other',modules:['maths'],mathPath:'calc1'},
 {id:'course-school',name:'School',type:'high-school',age:16,modules:['maths'],mathPath:'school'},
]}));

const src=(f)=>path.join(root,'src',f);
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const P=require(src('lib/library/paths.ts'));
const {SYLLABUS,topic:topicById}=require(src('lib/library/syllabus.ts'));
const keys=()=>require(src('tv/keys.ts'));
const {profileRows,locate,flat}=require(src('tv/profileRows.ts'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});

const LOCAL={busy:false,table:false,hintInFlight:false};
const CALC=P.topicsOf('calc1');
const CALC_P={id:'calc-a',name:'Calc A',type:'other',modules:['maths'],mathPath:'calc1'};
const SCHOOL_P={id:'school-a',name:'School A',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']};
/** A plain session (no store) with one learner at the desk. */
function session(profile,patch={}){
 return {subject:'maths',screen:'landing',focus:0,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,
  learner:{id:profile.id,name:profile.name},profiles:[profile],draft:null,
  timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,
  english:null,essay:null,practice:null,topic:null,walkIx:0,skills:{},history:[],jobs:{},log:{started:null,minutes:0,problems:[],hard:[],hints:0},...patch};
}
/** Skills with these topic ids latched secure. */
const secure=(ids)=>Object.fromEntries(ids.map((id)=>[id,{topic:id,seen:6,right:6,estimate:0.9,secure:true,lastSeen:1,slips:[]}]));
/** The focus after a step: the last focus event, or where it was. */
const focusAfter=(s,step)=>{const f=step.events.filter(e=>e.type==='focus');return f.length?f.at(-1).focus:s.focus;};
/** A desk (the store's own reducer) with this profile saved and seated. */
const seated=(profile)=>[{type:'profile.draft',patch:profile},{type:'profile.save'}].reduce((s,e)=>store.reduce(s,e),store.fresh());

// ---- the profile keeps the path ----
test('1: profile.draft {mathPath: calc1} then profile.save keeps it; a junk mathPath is dropped at load and in a draft',()=>{
 const s=seated(CALC_P);
 assert.equal(s.profiles.find((p)=>p.id==='calc-a').mathPath,'calc1','saved with the learner');
 assert.equal(s.learner.id,'calc-a');
 assert.equal(P.learnerPath(s),'calc1','the seated learner is on Calculus 1');
 // the desk loaded from session.json
 const loaded=store.getSession().profiles;
 assert.equal('mathPath' in loaded.find((p)=>p.id==='course-junk'),false,'a junk mathPath is dropped at load');
 assert.equal(loaded.find((p)=>p.id==='course-calc').mathPath,'calc1','calc1 survives the load');
 assert.equal(loaded.find((p)=>p.id==='course-school').mathPath,'school','school survives the load');
 const d=store.reduce(store.fresh(),{type:'profile.draft',patch:{name:'X',mathPath:'algebra-2'}}).draft;
 assert.equal('mathPath' in d,false,'a junk mathPath is not kept on a draft either');
});

// ---- the reducer opens a topic on the learner's path ----
test('2: topic.open for calc1-chain on a calc1 learner focuses index 9; a school id clamps to 0; the school path is unchanged',()=>{
 assert.equal(CALC.findIndex((t)=>t.id==='calc1-chain'),9,'the spine order this case reads');
 const c=seated(CALC_P);
 const open=(s,topic)=>store.reduce(s,{type:'topic.open',topic});
 assert.equal(open(c,'calc1-chain').focus,9);
 assert.equal(open(c,'calc1-chain').topic,'calc1-chain');
 assert.equal(open(c,'linear-two-step').focus,0,'a topic of the other path clamps to 0');
 assert.equal(open(c,'no-such-topic').focus,0,'an unknown id clamps to 0');
 const sc=seated(SCHOOL_P);
 SYLLABUS.forEach((t,i)=>assert.equal(open(sc,t.id).focus,i,`school ${t.id}`));
 assert.equal(open(sc,'calc1-chain').focus,0,'a calc id on a school learner clamps to 0');
});

// ---- the keys walk the learner's path ----
test('3: Topics walks topicStops(s) - 22 on Calculus 1 (Right x21 reaches the last, Select opens it), 3 on the school path',()=>{
 const {tvKey,topicStops,TOPIC_STOPS}=keys();
 assert.equal(TOPIC_STOPS,SYLLABUS,'TOPIC_STOPS stays the school syllabus for the existing tests');
 let s=session(CALC_P,{screen:'topics',focus:0});
 assert.deepEqual(topicStops(s).map((t)=>t.id),CALC.map((t)=>t.id));
 assert.equal(topicStops(s).length,22);
 for(let i=0;i<21;i++){const f=focusAfter(s,tvKey(s,'right',LOCAL));assert.equal(f,i+1,`Right ${i+1}`);s={...s,focus:f};}
 assert.equal(focusAfter(s,tvKey(s,'right',LOCAL)),21,'Right on the last stop stays');
 const sel=tvKey(s,'select',LOCAL);
 assert.deepEqual(sel.events,[{type:'topic.open',topic:'calc1-area-average'}]);
 assert.deepEqual(sel.calls.map((c)=>c.body),[{topic:'calc1-area-average'}]);
 let sc=session(SCHOOL_P,{screen:'topics',focus:0});
 assert.equal(topicStops(sc).length,3,'a school learner still has 3 stops');
 for(let i=0;i<5;i++)sc={...sc,focus:focusAfter(sc,tvKey(sc,'right',LOCAL))};
 assert.equal(sc.focus,2);
 assert.deepEqual(tvKey(sc,'select',LOCAL).events,[{type:'topic.open',topic:SYLLABUS[2].id}]);
 assert.equal(topicStops(session({...SCHOOL_P,mathPath:undefined})).length,3,'no mathPath is the school path');
});

test('4: "Teach me something" opens Topics at the frontier - 0, 7 and 22 secure on Calculus 1; 0 with nothing secure on school',()=>{
 const {tvKey,tonightStops}=keys();
 const teach=(profile,skills)=>{const s=session(profile,{screen:'tonight',skills});const f=tonightStops(s).indexOf('teach');return tvKey({...s,focus:f},'select',LOCAL).events;};
 const to=(focus)=>[{type:'subject',subject:'maths'},{type:'nav',screen:'topics',focus}];
 assert.deepEqual(teach(CALC_P,{}),to(0),'nothing secure: the first topic');
 assert.deepEqual(teach(CALC_P,secure(CALC.slice(0,7).map((t)=>t.id))),to(7),'the first seven latched: the eighth');
 assert.equal(CALC[7].id,'calc1-rules');
 assert.deepEqual(teach(CALC_P,secure(CALC.map((t)=>t.id))),to(0),'every topic secure: back to the first');
 assert.deepEqual(teach(SCHOOL_P,{}),to(0),'the school path with empty skills still sees focus 0');
 assert.deepEqual(teach(SCHOOL_P,secure([SYLLABUS[0].id])),to(1),'the school path has a frontier too');
 // a record not latched is not secure; a record on the other path is not read
 const notLatched={[CALC[0].id]:{...secure([CALC[0].id])[CALC[0].id],secure:false}};
 assert.deepEqual(teach(CALC_P,notLatched),to(0));
 assert.deepEqual(teach(CALC_P,secure(SYLLABUS.map((t)=>t.id))),to(0));
});

test('5: Menu-edit of an existing learner copies mathPath with the other fields',()=>{
 const {tvKey,learnerStops}=keys();
 const s=session(CALC_P,{screen:'learner'});
 const f=learnerStops(s).findIndex((x)=>x!=='add'&&x.id==='calc-a');
 const ev=tvKey({...s,focus:f},'menu',LOCAL).events;
 assert.equal(ev[0].type,'profile.draft');assert.equal(ev[0].patch.mathPath,'calc1');assert.equal(ev[0].patch.id,'calc-a');
 assert.deepEqual(ev[1],{type:'nav',screen:'profile',focus:0});
 // and the store keeps it through the edit and the save
 let d=store.reduce(seated(CALC_P),ev[0]);d=store.reduce(d,{type:'profile.save'});
 assert.equal(d.profiles.find((p)=>p.id==='calc-a').mathPath,'calc1','editing does not silently reset the path');
});

test('6: the profile has a Maths course row only with Maths on - two cells, the PATHS names and blurbs - and its cell posts the patch',()=>{
 const {tvKey}=keys();
 const on={id:'n',name:'',type:'high-school',age:16,system:'uk',modules:['maths']};
 const rows=profileRows(on),r=rows.findIndex((x)=>x.title==='Maths course');
 assert.ok(r>=0,'the row is there with Maths on');
 assert.deepEqual(rows[r].cells.map((c)=>[c.kind,c.label,c.blurb,c.path]),[['path','Linear equations',P.PATHS.school.blurb,'school'],['path','Calculus 1',P.PATHS.calc1.blurb,'calc1']]);
 assert.equal(profileRows({...on,modules:['english','essay']}).some((x)=>x.title==='Maths course'),false,'no row with Maths off');
 assert.equal(profileRows(null).some((x)=>x.title==='Maths course'),true,'a fresh draft has every module on, Maths too');
 const f=flat(rows,r,1),s=session(SCHOOL_P,{screen:'profile',draft:on,focus:f});
 assert.deepEqual(tvKey(s,'select',LOCAL).events,[{type:'profile.draft',patch:{mathPath:'calc1'}}]);
 assert.deepEqual(tvKey({...s,focus:flat(rows,r,0)},'select',LOCAL).events,[{type:'profile.draft',patch:{mathPath:'school'}}]);
 // Up/Down stay derived from the shared rows (tools/tv-keys-test.cjs GUARD): from the course row, Down is the actions row
 assert.equal(focusAfter(s,tvKey(s,'down',LOCAL)),flat(rows,r+1,1));assert.equal(focusAfter(s,tvKey(s,'up',LOCAL)),flat(rows,r-1,1));
 assert.equal(locate(rows,f).r,r);
 // the screen highlights the chosen path (school by default) and captions the focused cell with its blurb
 const scr=fs.readFileSync(src('tv/screens.tsx'),'utf8').split('export function ProfileScreen')[1];
 assert.match(scr,/c\.kind === "path" && pathOf\(d\) === c\.path/,'the chosen path is highlighted, school by default');
 assert.doesNotMatch(scr,/<input/,'the desk never asks for typing');
});

// ---- a set's topic named on its own path ----
test('7: settleOwners and restateMarked name a calc topic by its name (and the school rule is still mark.ts\'s)',()=>{
 // the rule is topicIn(id)?.name ?? id; for every school id it is exactly mark.ts's topicById(id)?.name ?? id
 for(const t of SYLLABUS)assert.equal(P.topicIn(t.id).name,topicById(t.id).name,t.id);
 const name=P.topicIn('calc1-chain').name;
 // settleOwners: a marked set with no owner goes to the learner whose practice line names its topic
 const two=[{...CALC_P},{...CALC_P,id:'calc-b',name:'Calc B'}];
 const s={...store.fresh(),learner:{id:'calc-a',name:'Calc A'},profiles:two,practice:{topic:'calc1-chain',items:[{n:1,question:'Differentiate f(x) = sin(x^2).'}],marked:true}};
 const hist={'calc-a':[],'calc-b':[{at:5,kind:'practice',label:name,detail:'1 of 1 right'}]};
 const n=store.settleOwners(s,(id)=>hist[id]??[]);
 assert.equal(n.practice,null,'the set left the seated learner');
 assert.equal(n.away['calc-b'].practice.owner,'calc-b','owned by the learner whose line names the topic');
 // restateMarked: a settle restates the line marking wrote, under the topic's name
 for(const label of [name,'calc1-chain']){
  store.dispatch({type:'reset'});
  store.dispatch({type:'profile.draft',patch:{...CALC_P,id:'restate-calc'}});store.dispatch({type:'profile.save'});
  const items=Array.from({length:6},(_,i)=>({n:i+1,question:`Differentiate f(x) = x^${i+2}.`}));
  store.dispatch({type:'practice.set',practice:{topic:'calc1-chain',items,marked:false}});
  store.dispatch({type:'practice.marked',items:items.map((it,i)=>({...it,verdict:i===0?'right':'unsure'}))});
  learners.addHistory('restate-calc',{at:Date.now(),kind:'practice',label,detail:'1 of 6 right, 5 not sure'});
  store.dispatch({type:'practice.settle',n:2,reply:'Right.',verdict:'right'});
  assert.equal(learners.getLearner('restate-calc').history.findLast((h)=>h.kind==='practice').detail,'2 of 6 right, 4 not sure',`label ${label}`);
 }
});

test('8: the landing and the phone name a set\'s topic on its own path',()=>{
 const {mathsWaiting}=require(src('tv/landingRows.ts'));
 const name=P.topicIn('calc1-chain').name;
 const s=session(CALC_P,{practice:{topic:'calc1-chain',items:[{n:1,question:'Differentiate f(x) = sin(x^2).'}],marked:false}});
 assert.equal(mathsWaiting(s).title,name,'an open calc set');
 const m=session(CALC_P,{practice:{topic:'calc1-chain',items:[{n:1,question:'q',verdict:'right'}],marked:true}});
 assert.equal(mathsWaiting(m).title,name,'a marked calc set');
 const sc=session(SCHOOL_P,{practice:{topic:'linear-one-step',items:[{n:1,question:'x+1=2'}],marked:false}});
 assert.equal(mathsWaiting(sc).title,topicById('linear-one-step').name,'school ids unchanged');
 const phone=fs.readFileSync(src('app/phone/page.tsx'),'utf8');
 assert.match(phone,/topicIn\(pr\.topic\)\?\.name/,'the phone names the set with topicIn');
 assert.doesNotMatch(phone,/SYLLABUS\.find/,'no SYLLABUS lookup for a name');
});

// ---- GUARD: the TV modules stay free of the filesystem-backed session modules ----
/** Source without comments, strings kept: a block comment, then a line comment not inside a string or a URL. */
const stripComments=(t)=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`\\])\/\/.*$/gm,'$1');
test('GUARD 9: keys.ts and mathsRows.ts import the store and learners for types only',()=>{
 for(const f of ['tv/keys.ts','tv/mathsRows.ts']){
  const code=stripComments(fs.readFileSync(src(f),'utf8'));
  const runtime=[...code.matchAll(/^\s*import\s+(?!type\b)([^;]*?)from\s+["']([^"']+)["']/gm)].filter((m)=>/session\/(store|learners)$/.test(m[2]));
  assert.deepEqual(runtime.map((m)=>m[0].trim()),[],`${f} imports the store or learners at runtime`);
  assert.doesNotMatch(code,/require\(\s*["'][^"']*session\/(store|learners)/,`${f} requires the store`);
 }
 // the scan itself goes red on a seeded violation, and a comment naming the store does not trip it
 const seed='// import { getSession } from "@/lib/session/store";\nimport { getSession } from "@/lib/session/store";';
 assert.equal([...stripComments(seed).matchAll(/^\s*import\s+(?!type\b)([^;]*?)from\s+["']([^"']+)["']/gm)].filter((m)=>/session\/(store|learners)$/.test(m[2])).length,1);
 assert.equal([...stripComments('// import { x } from "@/lib/session/store";').matchAll(/^\s*import\s+(?!type\b)([^;]*?)from\s+["']([^"']+)["']/gm)].length,0);
});
