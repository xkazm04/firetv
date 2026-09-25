/**
 * Tonight, done: the whole evening as one picture, ended and acted on from the TV. recapRows reads what each app
 * on the desk did since the start of today into one tile per app, parseDetail reads the history's own one-line
 * counts, and the recap's keys end the evening from the landing (Menu), open what a tile names and go back to the
 * desk at rest. Run with npm test in desk/ (directly: node tools/tv-recap-test.cjs). The store writes to a scratch
 * DESK_DATA_DIR under the OS temp dir, never desk/data. The follow-ups open the recap the way the TV does, through
 * /api/memory with the text engine stubbed at the provider registry - no model is called - and scan the shell's and
 * the module screens' imports for cycles.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
const opts={compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),opts).outputText,file);
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-tv-recap-'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
// loaded per test, so a missing module fails each case on its own
const RECAP=path.join(root,'src/tv/recapRows.ts');
const recap=()=>require(RECAP);
const keys=()=>require(path.join(root,'src/tv/keys.ts'));
const store=()=>require(path.join(root,'src/lib/session/store.ts'));
const {firstToLook}=require(path.join(root,'src/tv/sheetRows.ts'));

const LOCAL={busy:false,table:false,hintInFlight:false};
const EMA={id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']};
const JAKUB={id:'jakub',name:'Jakub',type:'other',modules:['english','essay']};
const noEnglish={preferences:null,notes:[],evidence:[],achievements:{},sessions:[],placement:null,plan:null,taught:[]};
// 20:00 local on a Thursday; "today" starts at local midnight
const NOW=new Date(2026,8,24,20,0,0).getTime();
const TODAY=(h)=>new Date(2026,8,24,h,0,0).getTime(), YESTERDAY=new Date(2026,8,23,19,0,0).getTime();
const HARD=['3x + 7 = 1 (the one that needed a second hint)'];
const marked={topic:'linear-two-step',marked:true,items:[
 {n:1,question:'2x + 3 = 11',studentAnswer:'x = 4',verdict:'right'},{n:2,question:'5x - 4 = 21',studentAnswer:'x = 3',verdict:'wrong',slip:'arithmetic-slip'},
 {n:3,question:'3x + 7 = 1',studentAnswer:'x = -2',verdict:'right'},{n:4,question:'4x - 1 = 15',studentAnswer:'x = 4',verdict:'right'},
 {n:5,question:'6x + 2 = 20',studentAnswer:'x = 2',verdict:'unsure'},{n:6,question:'7x = 49',studentAnswer:'x = 7',verdict:'right'}]};
const reading={type:'argument',text:'p',sentences:[{n:1,text:'Cats sleep.'},{n:2,text:'Dogs bark.'},{n:3,text:'So cats win.'}],
 verdicts:[{n:1,verdict:'supports'},{n:2,verdict:'faulty'},{n:3,verdict:'supports'}],stats:{},summary:'It argues one way.'};
function session(patch={}){
 return {subject:'maths',screen:'landing',focus:-1,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,
  learner:{id:'ema',name:'Ema'},profiles:[EMA,JAKUB],draft:null,
  timer:{running:true,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,
  english:null,essay:null,essayType:null,essayAt:null,englishLearning:noEnglish,conversation:null,check:null,practice:null,topic:null,walkIx:0,
  skills:{},writing:{},memory:[],history:[],jobs:{},status:'',log:{started:null,minutes:0,problems:[],hard:[],hints:0},...patch};
}
/** Ema's evening: a marked set, a snapped sheet, a reading, two talks today - and yesterday's work, which is not tonight's. */
const evening=(patch={})=>session({
 practice:marked,
 history:[
  {at:YESTERDAY,kind:'practice',label:'One-step equations',detail:'3 of 6 right'},
  {at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'4 of 6 right'},
  {at:TODAY(18),kind:'homework',label:'Sheet one',detail:'8 problems read'},
  {at:TODAY(19),kind:'writing',label:'Argument',detail:'2 of 5 sentences to fix'},
 ],
 englishLearning:{...noEnglish,sessions:[
  {id:'y',sceneId:'cafe',title:'At the cafe',at:YESTERDAY,turns:9},
  {id:'a',sceneId:'interview',title:'Interview',at:TODAY(17),turns:7},
  {id:'b',sceneId:'station',title:'At the station',at:TODAY(18),turns:4}]},
 log:{started:TODAY(16),minutes:42,problems:['k1','k2'],hard:HARD,hints:3},...patch});
const jakub=(patch={})=>session({learner:{id:'jakub',name:'Jakub'},subject:'english',...patch});
const words=(t)=>t.split(/\s+/).filter((w)=>/[A-Za-z0-9]/.test(w));

test('critic revise: parseDetail reads the history\'s own counts, and a line it does not know gives no counts',()=>{
 const {parseDetail,recapRows}=recap();
 assert.deepEqual(parseDetail('practice','4 of 6 right'),{right:4,of:6});
 assert.deepEqual(parseDetail('homework','8 problems read'),{pages:1,problems:8});
 assert.deepEqual(parseDetail('homework','1 problem read'),{pages:1,problems:1});
 assert.deepEqual(parseDetail('writing','2 of 5 sentences to fix'),{against:2,of:5});
 assert.deepEqual(parseDetail('writing','0 of 1 sentence to fix'),{against:0,of:1});
 for(const [k,d] of [['practice','all done'],['practice','2 of 5 sentences to fix'],['writing','4 of 6 right'],['homework',''],['homework','a page read'],['practice','9 of 6 right']])
  assert.deepEqual(parseDetail(k,d),{},`${k}: "${d}" gives no counts`);
 const odd=recapRows(session({history:[{at:TODAY(18),kind:'practice',label:'Two-step equations',detail:'marked by hand'}]}),NOW);
 assert.equal(odd[0].app,'maths');assert.deepEqual(odd[0].sets,[],'no set is invented from a line it cannot read');
 assert.equal(odd[0].empty,null,'the tile still draws: something was done tonight');
});

test('case 1: recapRows draws tonight\'s work per app - sets, pages, hints, talks, readings - and none of yesterday\'s',()=>{
 const {recapRows}=recap();
 const s=evening();
 assert.deepEqual(recapRows(s,NOW),[
  {app:'maths',empty:null,sets:[{right:4,of:6}],pages:1,hints:3,second:1},
  {app:'english',empty:null,talks:[7,4]},
  {app:'essay',empty:null,readings:[{lens:'Argument',against:2,of:5}]},
 ]);
});

test('case 2: only the apps on the learner\'s profile, in the desk\'s order; an app with nothing tonight says "Not tonight"',()=>{
 const {recapRows}=recap();
 assert.deepEqual(recapRows(jakub(),NOW),[{app:'english',empty:'Not tonight',talks:[]},{app:'essay',empty:'Not tonight',readings:[]}]);
 assert.deepEqual(recapRows(jakub({history:evening().history,englishLearning:evening().englishLearning}),NOW).map((t)=>t.app),['english','essay'],'Jakub never gets a Math Buddy tile, whatever his history holds');
 assert.deepEqual(recapRows(session({profiles:[{...EMA,modules:['essay','maths']}]}),NOW).map((t)=>t.app),['maths','essay'],'the desk\'s left-to-right order, not the profile\'s');
 const quiet=recapRows(session(),NOW);
 assert.deepEqual(quiet[0],{app:'maths',empty:'Not tonight',sets:[],pages:0,hints:0,second:0},'no counts invented');
 for(const t of quiet)assert.equal(t.empty,'Not tonight');
 assert.equal(words('Not tonight').length,2);
});

test('case 3: the recap is a picture - no problem text, question or answer in its rows, and 25 words or fewer on screen',()=>{
 const {recapRows,recapCaption,RECAP_EMPTY}=recap();
 const s=evening();
 const flat=JSON.stringify(recapRows(s,NOW))+recapCaption(recapRows(s,NOW));
 for(const h of s.log.hard)assert.ok(!flat.includes(h),'a hinted problem\'s text');
 for(const i of s.practice.items){assert.ok(!flat.includes(i.question),i.question);assert.ok(!flat.includes(i.studentAnswer),i.studentAnswer);}
 // the Recap section of screens.tsx: its JSX text, with the longest caption the rows can give and the two-word empty
 const src=fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8');
 const sec=src.split('// ---- T12 Recap')[1]?.split('// ---- T13')[0];
 assert.ok(sec,'screens.tsx has its Recap section');
 assert.doesNotMatch(sec,/log\.hard/,'the hinted problems are not listed');
 assert.doesNotMatch(sec,/Send to parent/,'no fake send');
 const jsxText=[...sec.matchAll(/>([^<>{}]*)</g)].map((m)=>m[1]).filter((t)=>/[A-Za-z]/.test(t)&&!/[=;()]/.test(t));
 const captions=[session(),evening(),evening({history:[{at:TODAY(17),kind:'practice',label:'T',detail:'6 of 6 right'}],englishLearning:noEnglish,log:{...evening().log,hard:[],hints:0}}),jakub(),
  evening({history:[...evening().history,{at:TODAY(19),kind:'practice',label:'T',detail:'0 of 12 right'},{at:TODAY(19),kind:'writing',label:'Evidence',detail:'9 of 9 sentences to fix'}]})]
  .map((x)=>recapCaption(recapRows(x,NOW)));
 const longest=Math.max(...captions.map((c)=>words(c).length));
 const n=words(jsxText.join(' ')).length+1/* the learner's name */+longest+words(RECAP_EMPTY).length;
 assert.ok(n<=25,`visible copy ${n} words: ${JSON.stringify(jsxText)} + "${captions.join('" / "')}"`);
 for(const c of captions)assert.ok(words(c).length<=12,c);
});

test('case 4: Menu on the landing ends the evening - session.end, then /api/memory - and the recap opens on the first tile',()=>{
 const {tvKey}=keys(),{reduce}=store(),{recapStops}=recap();
 for(const focus of [-1,0,2,3]){
  const s=evening({focus});
  const step=tvKey(s,'menu',LOCAL);
  assert.deepEqual(step.events,[{type:'session.end'}],`focus ${focus}`);
  assert.deepEqual(step.calls,[{url:'/api/memory',body:{}}]);
  const out=reduce(s,step.events[0]);
  assert.equal(out.screen,'recap');assert.equal(out.focus,0);
  assert.equal(recapStops(out)[out.focus],'maths','the focus is on the first tile');
  assert.equal(out.timer.running,false,'the clock stops');
 }
 const j=reduce(jakub(),tvKey(jakub(),'menu',LOCAL).events[0]);
 assert.equal(recapStops(j)[j.focus],'english','Jakub\'s first tile');
});

test('case 5: on the recap Left/Right walk the tiles then the desk, and Select opens what each tile names',()=>{
 const {tvKey}=keys(),{recapStops}=recap();
 const at=(focus,patch={})=>evening({screen:'recap',focus,...patch});
 assert.deepEqual(recapStops(at(0)),['maths','english','essay','desk']);
 assert.deepEqual(recapStops(jakub({screen:'recap'})),['english','essay','desk']);
 assert.deepEqual(tvKey(at(0),'right',LOCAL).events,[{type:'focus',focus:1}]);
 assert.deepEqual(tvKey(at(2),'right',LOCAL).events,[{type:'focus',focus:3}],'the desk after the last tile');
 assert.deepEqual(tvKey(at(3),'right',LOCAL).events,[],'clamped at the desk');
 assert.deepEqual(tvKey(at(0),'left',LOCAL).events,[],'clamped at the first tile');
 assert.deepEqual(tvKey(at(3),'left',LOCAL).events,[{type:'focus',focus:2}]);
 assert.deepEqual(tvKey(at(0),'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'sheet',focus:firstToLook(marked.items)}],'the marked set, on the first one to look at');
 assert.equal(firstToLook(marked.items),1);
 const own=at(2,{essay:reading});
 assert.deepEqual(tvKey(own,'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'essay.at',n:null},{type:'nav',screen:'forensic',focus:0}],'this learner\'s reading');
 assert.deepEqual(tvKey(at(1),'select',LOCAL).events,[{type:'subject',subject:'english'},{type:'nav',screen:'linga',focus:0}]);
 // nothing waiting: the app's home, never a reading that is someone else's
 assert.deepEqual(tvKey(at(0,{practice:null}),'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'tonight',focus:0}]);
 assert.deepEqual(tvKey(at(2,{essay:reading,history:[]}),'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'nav',screen:'essaytype',focus:0}],'a reading not in this learner\'s history is not theirs');
 const j=jakub({screen:'recap',focus:1,essay:reading,history:[{at:TODAY(19),kind:'writing',label:'Argument',detail:'1 of 3 sentences to fix'}]});
 assert.deepEqual(tvKey(j,'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'essay.at',n:null},{type:'nav',screen:'forensic',focus:0}]);
});

test('case 6: Back, and Select on the desk, go to the landing at rest - for Ema and Jakub - and no key claims a send',()=>{
 const {tvKey}=keys(),{reduce,fresh}=store();
 const home=[{type:'nav',screen:'landing'}];
 for(const s of [evening({screen:'recap',focus:0}),evening({screen:'recap',focus:2}),jakub({screen:'recap',focus:1})])
  assert.deepEqual(tvKey(s,'back',LOCAL).events,home);
 assert.deepEqual(tvKey(evening({screen:'recap',focus:3}),'select',LOCAL).events,home,'Ema\'s desk stop');
 assert.deepEqual(tvKey(jakub({screen:'recap',focus:2}),'select',LOCAL).events,home,'Jakub\'s desk stop');
 assert.deepEqual(tvKey(evening({screen:'recap',focus:9}),'select',LOCAL).events,home,'a focus past the end is the desk');
 const landed=reduce({...fresh(),screen:'recap',focus:2},home[0]);
 assert.deepEqual([landed.screen,landed.focus],['landing',-1],'the lamp rests');
 for(const k of ['select','back','left','right','up','down','menu'])for(const f of [0,1,2,3])
  assert.ok(!tvKey(evening({screen:'recap',focus:f}),k,LOCAL).events.some((e)=>e.type==='status'),`recap ${k} @${f} posts no status`);
 const src=fs.readFileSync(path.join(root,'src/tv/keys.ts'),'utf8');
 assert.doesNotMatch(src,/recap sent/);
 for(const s of [evening({screen:'recap',focus:0}),jakub({screen:'recap',focus:0})])
  assert.ok(!tvKey(s,'back',LOCAL).events.some((e)=>e.type==='nav'&&e.screen==='tonight'),'never Math Buddy\'s tonight');
});

test('GUARD: the phone still receives the recap, and its End session still posts session.end',()=>{
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 assert.match(phone,/s\.screen === "recap"/,'the phone\'s Recap panel opens while the TV is on the recap');
 assert.match(phone,/post\(\{ type: "session\.end" \}\)/,'End session on the phone');
});

test('extra: the recap rows stay free of the filesystem-backed session modules',()=>{
 const out=ts.transpileModule(fs.readFileSync(RECAP,'utf8'),opts).outputText;
 assert.doesNotMatch(out,/require\([^)]*lib\/session\/(store|learners)/);
});

// ---- follow-up 2026-09-25 (tv-recap): the recap draws without the model, and asks it at most once an evening; the shell and the modules import no cycle
require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{...opts.compilerOptions,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
// next/font runs only under Next: here each face module answers with its class names
for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){
 const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
const reg=()=>require(path.join(root,'src/lib/engines/registry.ts'));
const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
const {createElement}=require(path.join(root,'node_modules/react'));
/** The Recap screen as the TV draws it, at `now` (its clock is Date.now, as on the TV). */
function draw(s,now){const {Recap}=require(path.join(root,'src/tv/screens.tsx'));const real=Date.now;if(now)Date.now=()=>now;
 try{return renderToStaticMarkup(createElement(Recap,{s,focus:0}));}finally{Date.now=real;}}
/** The text engine, stubbed at the provider seam; `asked` counts the calls that reached it. */
let asked=0;
function engine(answer){asked=0;delete process.env.DESK_TEXT_ENGINE;require(path.join(root,'src/lib/desk/memory.ts'));
 reg().useProvider('text',{name:'stub',run:async()=>{asked++;return {raw:answer()};}});}
const SCRATCH='recap-scratch',DAYS2=2*86400000;
/** Ema's evening at the real clock (the routes read the store, not a fixed now), on a scratch learner id. */
function seat(patch={}){
 const now=Date.now(),e=evening(),at=(x)=>x===YESTERDAY?now-DAYS2:now;
 globalThis.__desk.session={...store().fresh(),...e,learner:{id:SCRATCH,name:'Ema'},profiles:[{...EMA,id:SCRATCH},JAKUB],screen:'landing',focus:-1,
  history:e.history.map((h)=>({...h,at:at(h.at)})),
  englishLearning:{...noEnglish,sessions:e.englishLearning.sessions.map((x)=>({...x,at:at(x.at)}))},jobs:{},...patch};
}
/** Menu on the landing, as the TV does it: the key's events into the store, then its calls to their routes. */
async function openRecap(){
 const s=store().getSession(),step=keys().tvKey(s,'menu',LOCAL),status=[];
 for(const e of step.events)store().dispatch(e);
 for(const c of step.calls)status.push((await require(path.join(root,'src/app',c.url,'route.ts')).POST(new Request(`http://desk${c.url}`,{method:'POST',body:JSON.stringify(c.body)}))).status);
 return {s:store().getSession(),status};
}
const backToDesk=()=>{for(const e of keys().tvKey(store().getSession(),'back',LOCAL).events)store().dispatch(e);};
const lined=()=>JSON.stringify({lines:['They undo the constant first once they see it.']});

test('follow-up 1: the recap opens with the text engine down - every tile and the caption drawn',async()=>{
 const {recapRows,recapCaption}=recap();
 try{
  seat();engine(()=>{throw new Error('engine down');});
  const {s}=await openRecap();
  assert.equal(s.screen,'recap');
  const html=draw(s);
  assert.equal((html.match(/data-role="recap-tile"/g)??[]).length,3,'a tile per app on the desk');
  for(const app of ['maths','english','essay'])assert.match(html,new RegExp(`data-app="${app}"`));
  assert.equal((html.match(/data-role="recap-set"/g)??[]).length,1);assert.equal((html.match(/data-role="recap-talk"/g)??[]).length,2);
  const cap=/<div class="cap-text">([^<]+)<\/div>/.exec(html);
  assert.ok(cap&&cap[1].trim(),'a caption');
  assert.equal(cap[1],recapCaption(recapRows(s,Date.now())).replace(/'/g,'&#x27;'),'the caption is the rows\' own sentence');
 }finally{reg().resetProviders();}
});

test('follow-up 2: two opens of the same evening -> at most one engine call',async()=>{
 try{
  seat();engine(lined);
  assert.deepEqual((await openRecap()).status,[200]);backToDesk();
  assert.deepEqual((await openRecap()).status,[200]);
  assert.ok(asked<=1,`engine calls for two opens: ${asked}`);
  assert.equal(asked,1,'the evening is still written down once');
 }finally{reg().resetProviders();}
});

test('follow-up 3: an evening with nothing to note (no marked set, no hint) opens with no engine call',async()=>{
 try{
  seat({practice:null,topic:null,log:{started:null,minutes:0,problems:[],hard:[],hints:0}});engine(lined);
  const r=await require(path.join(root,'src/app/api/memory/route.ts')).POST(new Request('http://desk/api/memory',{method:'POST',body:'{}'}));
  assert.equal(r.status,200);assert.deepEqual(await r.json(),{lines:[]});
  assert.equal(asked,0,`engine calls: ${asked}`);
 }finally{reg().resetProviders();}
});

test('GUARD: new work after an open, or a write that failed, is still written down',async()=>{
 try{
  seat();engine(lined);
  await openRecap();backToDesk();
  globalThis.__desk.session={...store().getSession(),log:{...store().getSession().log,hints:4}};
  await openRecap();
  assert.equal(asked,2,'a hint asked since is new: the desk writes again');
  seat();let fail=true;engine(()=>{if(fail){fail=false;throw new Error('engine down');}return lined();});
  assert.deepEqual((await openRecap()).status,[502]);backToDesk();
  assert.deepEqual((await openRecap()).status,[200]);
  assert.equal(asked,2,'a failed write is asked again');
 }finally{reg().resetProviders();}
});

// The markup the Recap drew for these evenings before the follow-up (recorded at ad6c731): the tiles, the marks and
// the caption do not change with where the marks' code lives or with how the memory is written.
const GOLDEN={ema:'6584d25f6a2d4cd2',jakub:'459bdc34371da4e6'};
test('GUARD: the recap\'s tiles are drawn exactly as before - Ema\'s evening and Jakub\'s quiet one',()=>{
 const hash=(x)=>require('node:crypto').createHash('sha256').update(x).digest('hex').slice(0,16);
 assert.equal(hash(draw(evening(),NOW)),GOLDEN.ema);
 assert.equal(hash(draw(jakub(),NOW)),GOLDEN.jakub);
});

/** Every static import and re-export among `files`, as edges. Comments never count: the parser skips them. */
function importGraph(files,read){
 const g=new Map(files.map((f)=>[f,[]]));
 for(const f of files){
  const sf=ts.createSourceFile(f,read(f),ts.ScriptTarget.ES2022,false,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  for(const st of sf.statements){
   const id=(ts.isImportDeclaration(st)||ts.isExportDeclaration(st))&&st.moduleSpecifier&&ts.isStringLiteral(st.moduleSpecifier)?st.moduleSpecifier.text:null;
   if(!id||!(id.startsWith('@/')||id.startsWith('.')))continue;
   const base=id.startsWith('@/')?path.join(root,'src',id.slice(2)):path.resolve(path.dirname(f),id);
   const to=[base,base+'.ts',base+'.tsx',path.join(base,'index.ts'),path.join(base,'index.tsx')].map((x)=>path.normalize(x)).find((x)=>g.has(x));
   if(to)g.get(f).push(to);
  }
 }
 return g;
}
/** The cycles a depth-first walk closes: none exactly when the graph has none. */
function cycles(g){
 const out=[],state=new Map(),stack=[];
 const walk=(v)=>{state.set(v,1);stack.push(v);for(const w of g.get(v)){if(state.get(w)===1)out.push([...stack.slice(stack.indexOf(w)),w]);else if(!state.get(w))walk(w);}stack.pop();state.set(v,2);};
 for(const v of g.keys())if(!state.get(v))walk(v);
 return out;
}
const SCANNED=['tv','maths','essay','landing'].map((d)=>path.join(root,'src',d));
const scanned=()=>SCANNED.flatMap((d)=>fs.readdirSync(d).filter((f)=>/\.tsx?$/.test(f)).map((f)=>path.normalize(path.join(d,f))));
const named=(c)=>c.map((x)=>path.relative(path.join(root,'src'),x).replace(/\\/g,'/')).join(' -> ');

test('follow-up 4: the shell and the module screens import no cycle - tv, maths, essay, landing',()=>{
 assert.deepEqual(cycles(importGraph(scanned(),(f)=>fs.readFileSync(f,'utf8'))).map(named),[]);
 // the marks both sides draw are a leaf: no import at all
 const marks=path.join(root,'src/tv/marks.tsx');
 assert.equal(ts.preProcessFile(fs.readFileSync(marks,'utf8'),true,true).importedFiles.length,0,'tv/marks.tsx imports nothing');
});

test('follow-up 4, the scan bites: a seeded import cycle is found, and the same import in a comment is not',()=>{
 const files=scanned(),rows=files.find((f)=>f.endsWith('recapRows.ts')),read=(f)=>fs.readFileSync(f,'utf8');
 const seed=(line)=>(f)=>f===rows?`${line}\n${read(f)}`:read(f);
 const through=(c)=>c.some((x)=>x===rows);
 assert.ok(cycles(importGraph(files,seed('import { day } from "@/tv/screens";'))).some(through),'recapRows -> screens -> recapRows');
 assert.ok(!cycles(importGraph(files,seed('// import { day } from "@/tv/screens";\n/* import { day } from "./screens"; */'))).some(through),'a commented import is not an edge');
});

// ---- S76 (cx): the desk's "not sure" reaches the recap - a dashed ring, never a slip; an older line draws as it always did
const TONIGHT=[{verdict:'right'},{verdict:'right'},{verdict:'right'},{verdict:'wrong'},{verdict:'unsure'},{verdict:'unsure'}];
const marksOf=(html)=>[...html.matchAll(/data-role="recap-set">(.*?)<\/div>/g)].map((m)=>[...m[1].matchAll(/data-v="(\w+)"><svg class="(rc-\w+)"/g)].map((x)=>`${x[1]}:${x[2]}`));
test('S76 case 1: a set marked 3 right, 1 wrong, 2 not sure draws 3 ticks, 1 pen ring and 2 dashed rings',()=>{
 const {rightLine}=require(path.join(root,'src/lib/rules/maths.ts')),{parseDetail,recapRows,recapCaption}=recap();
 const line=rightLine(TONIGHT);
 assert.equal(line,'3 of 6 right, 2 not sure','the line marking writes');
 assert.deepEqual(parseDetail('practice',line),{right:3,of:6,unsure:2},'the recap reads back what marking wrote');
 for(const d of ['3 of 6 right, 4 not sure','3 of 6 right, not sure','3 of 6 right, 2 unsure','3 of 6 right,2 not sure'])
  assert.deepEqual(parseDetail('practice',d),{},`"${d}" gives no counts`);
 const s=evening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:line}]});
 const rows=recapRows(s,NOW);
 assert.deepEqual(rows[0].sets,[{right:3,of:6,unsure:2}]);
 assert.deepEqual(marksOf(draw(s,NOW)),[['right:rc-tk','right:rc-tk','right:rc-tk','look:rc-ring','unsure:rc-ask','unsure:rc-ask']],'no tick and no slip for what the desk could not decide');
 assert.match(recapCaption(rows),/three to look at together/,'the not-sure items still want talking through: 1 slip + 2 not sure');
 const {mathsWaiting}=require(path.join(root,'src/tv/landingRows.ts'));
 assert.equal(mathsWaiting({...s,practice:null}).line,'Last time: Two-step equations · 3 of 6 right, 2 not sure.','the landing reads the line whole');
});
test('S76 case 2: an older line, "3 of 6 right", parses and draws exactly as before - three ticks, three pen rings, no dashed ring',()=>{
 const {parseDetail,recapRows}=recap(),{restatedLine}=require(path.join(root,'src/lib/rules/maths.ts'));
 assert.deepEqual(parseDetail('practice','3 of 6 right'),{right:3,of:6},'no unsure count is guessed');
 const s=evening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'3 of 6 right'}]});
 assert.deepEqual(recapRows(s,NOW)[0].sets,[{right:3,of:6}]);
 assert.deepEqual(marksOf(draw(s,NOW)),[['right:rc-tk','right:rc-tk','right:rc-tk','look:rc-ring','look:rc-ring','look:rc-ring']]);
 assert.equal(restatedLine('3 of 6 right',TONIGHT),'3 of 6 right, 2 not sure','a settle restates an older line in the new form');
 assert.equal(restatedLine('3 of 6 right, 2 not sure',TONIGHT.slice(0,5)),null,'a line for another n is not this set\'s');
});

test('S77: the phone\'s Recap is the TV\'s tiles in words - a line per app, the TV\'s caption, no problem text, plurals right',()=>{
 const {recapRows,recapLine,recapCaption,counted}=recap();
 const lines=(s)=>recapRows(s,NOW).map(recapLine);
 const s=evening({history:[...evening().history.filter((h)=>h.kind!=='practice'),
  {at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'3 of 6 right, 2 not sure'},
  {at:TODAY(18),kind:'homework',label:'Sheet two',detail:'1 problem read'},{at:TODAY(18),kind:'homework',label:'Sheet three',detail:'2 problems read'}],
  log:{...evening().log,hints:1}});
 assert.deepEqual(lines(s),[
  'Math Buddy - one set: 3 right, 1 slip, 2 the desk was not sure of; 3 pages; 1 hint',
  'Linga - two conversations, 11 replies',
  'Essay Master - one reading (Argument): 2 of 5 sentences to fix']);
 assert.deepEqual(lines(jakub()),['Linga - not tonight','Essay Master - not tonight'],'an app with nothing tonight says so');
 assert.deepEqual(lines(session({log:{started:null,minutes:0,problems:['k'],hard:[],hints:1}})),['Math Buddy - 1 hint','Linga - not tonight','Essay Master - not tonight']);
 // one line per tile, in the tiles' order: the phone draws from recapRows, it does not re-read the session
 for(const x of [s,evening(),jakub(),session()]){const t=recapRows(x,NOW);assert.equal(t.map(recapLine).length,t.length);}
 // no problem text, question, answer or hinted problem in the lines or the caption
 const flat=lines(s).join('\n')+recapCaption(recapRows(s,NOW));
 for(const h of s.log.hard)assert.ok(!flat.includes(h),'a hinted problem\'s text');
 for(const i of s.practice.items){assert.ok(!flat.includes(i.question),i.question);assert.ok(!flat.includes(i.studentAnswer),i.studentAnswer);}
 assert.equal(counted(1,'hint'),'1 hint');assert.equal(counted(2,'problem'),'2 problems');assert.equal(counted(1,'reply','replies'),'1 reply');
 // the phone renders these, and the TV's caption, from the same module - not rules of its own
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 const sec=phone.split('screen === "parent"')[1]?.split('</div>}')[0]??'';
 assert.match(phone,/from "@\/tv\/recapRows"/,'the phone imports the recap rows');
 for(const f of ['recapRows(s','recapLine(t)','recapCaption(tiles)'])assert.ok(sec.includes(f),`the parent panel calls ${f}`);
 assert.doesNotMatch(sec,/\} problems ·|\} hints\b/,'no hand-made plural');
 assert.match(sec,/mins > 0/,'minutes only when the timer ran');
 assert.match(phone,/Arrives when the session ends\./);
});
