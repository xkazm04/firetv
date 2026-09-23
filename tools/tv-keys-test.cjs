/**
 * The TV's D-pad as a pure keymap: keyOf, tvKey, the per-screen stop lists and the runStep
 * executor. Run with npm test in desk/ (directly: node tools/tv-keys-test.cjs). No session store is
 * loaded - sessions here are plain objects - and no route or model is called.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
const opts={compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),opts).outputText,file);
const KEYS=path.join(root,'src/tv/keys.ts'),ROWS=path.join(root,'src/tv/mathsRows.ts');
// loaded per test, so a missing module fails each case on its own
const keys=()=>require(KEYS);
const {SYLLABUS}=require(path.join(root,'src/lib/library/syllabus.ts'));
const {ESSAY_TYPES}=require(path.join(root,'src/lib/library/lessons.data.ts'));
const {profileRows,locate,flat}=require(path.join(root,'src/tv/profileRows.ts'));

const LOCAL={busy:false,table:false,hintInFlight:false};
const page=(subject='maths')=>({id:'p1',subject,title:'Sheet one',img:'',w:100,h:100,items:[{n:1,key:'k1',text:'x + 1 = 2',band:[0,10]},{n:2,key:'k2',text:'x + 2 = 5',band:[10,20]}]});
function session(patch={}){
 return {subject:'maths',screen:'landing',focus:0,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,
  learner:{id:'ema',name:'Ema'},profiles:[{id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']}],draft:null,
  timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,
  english:null,essay:null,practice:null,topic:null,walkIx:0,skills:{},history:[],log:{started:false,minutes:0,problems:[],hard:[],hints:0},...patch};
}
/** The focus a step leaves the screen on: the last focus event, or where it was. */
const focusAfter=(s,step)=>{const f=step.events.filter(e=>e.type==='focus');return f.length?f.at(-1).focus:s.focus;};
const SCREENS=(()=>{const src=fs.readFileSync(path.join(root,'src/lib/session/store.ts'),'utf8');const m=src.match(/export type Screen =([^;]+);/);return [...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);})();

test('case 1: Tonight has one stop list - continue card, homework, teach - and Select on teach opens the topics',()=>{
 const {tvKey,tonightStops}=keys();
 const withCont=session({screen:'tonight',pages:[page()],focus:2});
 assert.deepEqual(tonightStops(withCont),['continue','homework','teach']);
 assert.deepEqual(tonightStops(session({screen:'tonight'})),['homework','teach']);
 const r=tvKey(withCont,'right',LOCAL);
 assert.ok(r.events.every(e=>e.type!=='focus'||e.focus<=2),'Right on the last stop never moves past it');
 assert.equal(focusAfter(withCont,r),2);
 assert.deepEqual(tvKey(withCont,'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'topics',focus:0}]);
 assert.deepEqual(tvKey(session({screen:'tonight',focus:1}),'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'topics',focus:0}]);
 assert.deepEqual(tvKey(session({screen:'tonight',pages:[page()],focus:0}),'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'page.select',pageIx:0},{type:'nav',screen:'page',focus:0}],'the continue card opens the sheet it names');
 const tonight=fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8').split('export function Tonight')[1].split('\nexport function')[0];
 assert.match(tonight,/tonightStops\(s\)/,'Tonight renders from the same stop list');
 assert.doesNotMatch(tonight,/const off = /,'Tonight no longer re-derives the continue offset');
});

test('case 2: Select on the lens screen posts ESSAY_TYPES[f], and the keymap holds no lens-id list',()=>{
 const {tvKey}=keys();
 for(let f=0;f<4;f++)assert.deepEqual(tvKey(session({screen:'essaytype',subject:'essay',focus:f}),'select',LOCAL).events[0],{type:'essay.type',essayType:ESSAY_TYPES[f].id});
 const src=fs.readFileSync(KEYS,'utf8');
 for(const t of ESSAY_TYPES)assert.doesNotMatch(src,new RegExp(`["'\`]${t.id}["'\`]`),`keys.ts spells the ${t.id} lens itself`);
});

test('case 3: Select on a topic asks for a set once, and a failed set gives Select back',async()=>{
 const {tvKey,runStep}=keys();
 const s=session({screen:'topics',focus:1});
 const step=tvKey(s,'select',{...LOCAL,busy:false});
 assert.deepEqual(step.events,[{type:'topic.open',topic:SYLLABUS[1].id}]);
 assert.deepEqual(step.calls,[{url:'/api/practice',body:{topic:SYLLABUS[1].id},onFail:{busy:false}}]);
 assert.deepEqual(step.local,{busy:true});
 const busy=tvKey(s,'select',{...LOCAL,busy:true});assert.deepEqual([busy.events,busy.calls],[[],[]],'a second Select while the set is written does nothing');
 let local={...LOCAL};const posted=[],called=[];let during;
 await runStep(step,{post:async e=>{posted.push(e);during=local.busy;},call:async(url,body)=>{called.push([url,body]);return {ok:false,status:500};},apply:p=>{local={...local,...p};}});
 assert.equal(during,true,'the wait is on screen while the set is asked for');
 assert.deepEqual(posted,[{type:'topic.open',topic:SYLLABUS[1].id}]);assert.equal(called.length,1);
 assert.equal(local.busy,false,'a 500 from /api/practice clears the wait');
 local={...LOCAL};await runStep(step,{post:async()=>{},call:async()=>{throw new Error('offline');},apply:p=>{local={...local,...p};}});
 assert.equal(local.busy,false,'a network failure clears the wait too');
});

test('case 4: a hint is asked for once while one is in flight',async()=>{
 const {tvKey,runStep}=keys();
 const onPage=session({screen:'page',pages:[page()],reading:false});
 assert.deepEqual(tvKey(onPage,'select',{...LOCAL,hintInFlight:true}).calls,[]);
 const first=tvKey(onPage,'select',{...LOCAL,hintInFlight:false});
 assert.equal(first.calls.length,1);assert.equal(first.calls[0].url,'/api/hint');assert.deepEqual(first.local,{hintInFlight:true});
 const onHint=session({screen:'hint',pages:[page()],focus:0,hint:{key:'k1',problem:'x + 1 = 2',stage:1,hint1:{hint:'Undo the +1.'},hint2:null,askedQ:''}});
 assert.deepEqual(tvKey(onHint,'select',{...LOCAL,hintInFlight:true}).calls,[]);
 const two=tvKey(onHint,'select',{...LOCAL,hintInFlight:false});
 assert.equal(two.calls.length,1);assert.equal(two.calls[0].url,'/api/hint');assert.deepEqual(two.calls[0].body,{stage:2});assert.deepEqual(two.local,{hintInFlight:true});
 for(const ok of [true,false]){let local={...LOCAL};await runStep(first,{post:async()=>{},call:async()=>({ok,status:ok?200:502}),apply:p=>{local={...local,...p};}});
  assert.equal(local.hintInFlight,false,`the guard lifts when the hint call settles (${ok?'ok':'502'})`);}
});

test('case 5: lingaOwns names the Linga screens once, and the TV map never fires under Linga',()=>{
 const {tvKey,lingaOwns}=keys();
 assert.ok(SCREENS.length>20&&SCREENS.includes('linga-talk'),'the Screen union was read from the store');
 for(const screen of SCREENS)for(const subject of ['maths','english','essay']){
  const s=session({screen,subject});
  const want=screen.startsWith('linga')||(screen==='tonight'&&subject==='english');
  assert.equal(lingaOwns(s),want,`${screen}/${subject}`);
  if(want)for(const k of ['select','back','up','down','left','right','menu','play'])assert.deepEqual(tvKey(s,k,LOCAL),{events:[],calls:[],local:{}},`${screen}/${subject} ${k}`);
 }
 const page=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');
 assert.doesNotMatch(page,/startsWith\("linga"\)/,'page.tsx no longer spells the Linga predicate');
});

test('case 6: keyOf maps the keyboard to the remote, and Play is the clock except on the lesson',()=>{
 const {keyOf,tvKey}=keys();
 const want={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'select',Backspace:'back',Escape:'back',m:'menu',M:'menu',' ':'play'};
 for(const [k,v] of Object.entries(want))assert.equal(keyOf(k),v,k);
 for(const k of ['a','Tab','Shift','Delete','PageDown','x','0',''])assert.equal(keyOf(k),null,k);
 for(const screen of ['landing','tonight','page','hint','topics','walk','recap','break']){
  assert.deepEqual(tvKey(session({screen}),'play',LOCAL).events,[{type:'timer.start'}],screen);
  assert.deepEqual(tvKey(session({screen,timer:{running:true,left:10,phase:'work'}}),'play',LOCAL).events,[{type:'timer.pause'}],screen);
 }
 assert.deepEqual(tvKey(session({screen:'lesson',lessonPaused:false,lesson:{id:'l',title:'L',t:0,text:'',why:''}}),'play',LOCAL).events,[{type:'lesson.pause',paused:true}]);
 assert.deepEqual(tvKey(session({screen:'lesson',lessonPaused:true,lesson:{id:'l',title:'L',t:0,text:'',why:''}}),'play',LOCAL).events,[{type:'lesson.pause',paused:false}]);
});

test('GUARD: the profile screen moves exactly as its shared rows say',()=>{
 const {tvKey}=keys();
 for(const draft of [{id:'n',name:'',type:'high-school',age:16,system:'uk',modules:['maths']},{id:'n',name:'',type:'other',modules:[]}]){
  const rows=profileRows(draft);const n=rows.reduce((a,r)=>a+r.cells.length,0);
  for(let f=0;f<n;f++){const at=locate(rows,f),s=session({screen:'profile',draft,focus:f});
   const today={right:flat(rows,at.r,at.c+1),left:flat(rows,at.r,at.c-1),down:at.r<rows.length-1?flat(rows,at.r+1,at.c):f,up:at.r>0?flat(rows,at.r-1,at.c):f};
   for(const [k,v] of Object.entries(today))assert.equal(focusAfter(s,tvKey(s,k,LOCAL)),v,`${draft.type} focus ${f} ${k}`);}
 }
});

test('GUARD: the keymap and the maths rows stay free of the filesystem-backed session modules',()=>{
 for(const file of [KEYS,ROWS]){
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),opts).outputText;
  assert.doesNotMatch(out,/require\([^)]*lib\/session\/(store|learners)/,`${path.basename(file)} requires the store at runtime`);
 }
 keys();require(ROWS);
 assert.ok(!Object.keys(require.cache).some(k=>/session[\\/](store|learners)\.ts$/.test(k)),'loading the keymap pulled the store in');
});
