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
const L=require('./ts-load.cjs'),ts=L.ts(),{transpile}=L,opts=L.options;
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
  {app:'maths',empty:null,sets:[{right:4,of:6}],pages:1,hints:3,second:1,hinted:[{name:null,second:false},{name:null,second:false}],slipped:[]},
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
 assert.deepEqual(quiet[0],{app:'maths',empty:'Not tonight',sets:[],pages:0,hints:0,second:0,hinted:[],slipped:[]},'no counts invented');
 for(const t of quiet)assert.equal(t.empty,'Not tonight');
 assert.equal(words('Not tonight').length,2);
});

// the static words a screen's JSX can show: text nodes with each {...} removed, and a string or template literal that is a whole child with each ${...} removed; '=>' starts no text node
function staticText(src){
 const strip=(t)=>{let o;do{o=t;t=t.replace(/\{[^{}]*\}/g,' ');}while(t!==o);return t.replace(/{[^{}]*$/,' ');};
 return [...src.matchAll(/(?<!=)>([^<>]*)</g)].map((m)=>{
  const lit=m[1].match(/^\s*\{\s*(?:`([^`]*)`|"([^"]*)"|'([^']*)')\s*\}\s*$/);
  return lit?(lit[1]??lit[2]??lit[3]).replace(/\$\{[^}]*\}/g,' '):strip(m[1]);
 }).filter((t)=>/[A-Za-z]/.test(t)&&!/[=;()]/.test(t));
}
test('13-i-b: the Recap word check counts static words in text with expressions and in whole-child literals, and not code',()=>{
 const count=(x)=>words(staticText(x).join(' ')).length;
 assert.equal(count('<div>and {n} earlier</div>'),2);
 assert.equal(count('<div>{`and ${n} earlier`}</div>'),2);
 assert.equal(count('<i>{x}</i>'),0);
 assert.equal(count('(_, i) => i < t.second'),0);
 assert.equal(count('<p>Back to the desk</p>'),4);
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
 const jsxText=staticText(sec);
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
 // the paragraph is the seated learner's by construction (store.ts MathsSlot), so no history is consulted: ownReading reads s.essay alone
 const {ownReading}=recap();
 assert.equal(ownReading(session({essay:reading,history:[]})),true,'sentences on the desk, an empty history: it is theirs');
 assert.equal(ownReading(session({essay:null,history:[{at:TODAY(19),kind:'writing',label:'Argument',detail:'1 of 3 sentences to fix'}]})),false,'no paragraph: nothing to open, whatever the history says');
 assert.equal(ownReading(session({essay:{...reading,sentences:[]}})),false,'a paragraph with no sentences is not opened');
 assert.deepEqual(tvKey(at(2,{essay:null,history:[]}),'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'nav',screen:'essaytype',focus:0}],'nothing on the desk: the lens home');
 const j=jakub({screen:'recap',focus:1,essay:reading,history:[{at:TODAY(19),kind:'writing',label:'Argument',detail:'1 of 3 sentences to fix'}]});
 assert.deepEqual(tvKey(j,'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'essay.at',n:null},{type:'nav',screen:'forensic',focus:0}]);
});

test('landing-B 6: the recap tile and the landing open the same screen on the same focus, for every app that has something waiting',()=>{
 const {tvKey}=keys();
 const paper={topic:'linear-two-step',items:[{n:1,question:'2x + 3 = 11'}]};
 const snapped={id:'p1',subject:'maths',title:'Sheet one',img:'',w:100,h:100,items:[{n:1,key:'k1',text:'x + 1 = 2',band:[0,10]}]};
 const read=[{at:TODAY(19),kind:'writing',label:'Argument',detail:'1 of 3 sentences to fix'}];
 const states=[['maths',0,{practice:marked}],['maths',0,{practice:paper}],['maths',0,{practice:null,pages:[snapped]}],['essay',2,{essay:reading}],['essay',2,{essay:null,history:read}]];
 for(const [app,focus,patch] of states){
  const base={practice:null,essay:null,history:[],...patch};
  const land=tvKey(session({...base,screen:'landing',focus}),'select',LOCAL).events;
  const tile=tvKey(session({...base,screen:'recap',focus}),'select',LOCAL).events;
  assert.deepEqual(tile,land,`${app} ${JSON.stringify(Object.keys(patch))}`);
  assert.equal(land[0].subject,app);
 }
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
 assert.match(phone,/tiles\.some\(\(t\) => !t\.empty\) \|\| \(s\.log\.endedAt \?\? 0\) >= startOfDay\(now\)/,'M7: the phone\'s Recap shows for a tile with work or an evening ended since local midnight, whatever the TV shows');
 assert.doesNotMatch(phone,/s\.screen === "recap" \|\| s\.log\.problems\.length/,'M7: not tied to the TV\'s screen or the log');
 assert.match(phone,/t\.app === "maths" && !t\.empty \? <ul key="hinted"><li data-role="phone-hinted">\{hintedLine\(t\)\}/,'M7 (MB-B23): the hinted-problems line only when the maths tile is not empty');
 assert.match(phone,/post\(\{ type: "session\.end" \}\)/,'End session on the phone');
});

test('extra: the recap rows stay free of the filesystem-backed session modules',()=>{
 const out=transpile(fs.readFileSync(RECAP,'utf8'),opts).outputText;
 assert.doesNotMatch(out,/require\([^)]*lib\/session\/(store|learners)/);
});

// ---- follow-up 2026-09-25 (tv-recap): the recap draws without the model, and asks it at most once an evening; the shell and the modules import no cycle
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
let asked=0,lastReq=null;
function engine(answer){asked=0;lastReq=null;delete process.env.DESK_TEXT_ENGINE;require(path.join(root,'src/lib/desk/memory.ts'));
 reg().useProvider('text',{name:'stub',run:async(req)=>{asked++;lastReq=req;return {raw:answer()};}});}
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
const linedNew=()=>JSON.stringify({lines:['They read an argument one sentence at a time.']});

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
  seat({practice:null,topic:null,history:[],englishLearning:noEnglish,log:{started:null,minutes:0,problems:[],hard:[],hints:0}});engine(lined);
  const r=await require(path.join(root,'src/app/api/memory/route.ts')).POST(new Request('http://desk/api/memory',{method:'POST',body:'{}'}));
  assert.equal(r.status,200);assert.deepEqual(await r.json(),{lines:[],asked:false});
  assert.equal(asked,0,`engine calls: ${asked}`);
 }finally{reg().resetProviders();}
});

const memoryPost=async()=>{const r=await require(path.join(root,'src/app/api/memory/route.ts')).POST(new Request('http://desk/api/memory',{method:'POST',body:'{}'}));return {status:r.status,body:await r.json()};};
const noMaths={practice:null,topic:null,log:{started:null,minutes:0,problems:[],hard:[],hints:0}};

test('M2: an Essay-only evening and a Linga-only evening are written down too; the prompt carries counts and lens names, never a learner text',async()=>{
 try{
  seat({...noMaths,englishLearning:noEnglish,history:[{at:Date.now()-1000,kind:'writing',label:'Argument',detail:'1 of 5 sentences to fix, 1 fixed'}]});engine(linedNew);
  let r=await memoryPost();
  assert.equal(r.status,200);assert.deepEqual(r.body,{lines:['They read an argument one sentence at a time.'],asked:true});
  assert.equal(asked,1,'an Essay line is work');
  assert.match(lastReq.prompt,/Essay Master tonight/);assert.match(lastReq.prompt,/Argument lens: 5 sentences read, 2 to fix when read, 1 after rewrites/);
  assert.doesNotMatch(lastReq.prompt,/Topic worked on tonight/,'no maths section for an evening with no maths');
  assert.doesNotMatch(lastReq.prompt,/Linga tonight/);
  r=await memoryPost();assert.deepEqual(r.body,{lines:[],asked:true,already:true},'the same evening is not written twice, and the answer says it was written already');assert.equal(asked,1);
  // a new Essay line is new work: the evening key covers it
  globalThis.__desk.session={...store().getSession(),history:[...store().getSession().history,{at:Date.now()-500,kind:'writing',label:'Evidence',detail:'2 of 4 sentences to fix'}]};
  await memoryPost();assert.equal(asked,2,'a new reading is new work');
  seat({...noMaths,history:[],englishLearning:{...noEnglish,sessions:[{id:'a',sceneId:'cafe',title:'At the cafe',at:Date.now()-1000,turns:7},{id:'b',sceneId:'station',title:'At the station',at:Date.now()-900,turns:4}]}});engine(lined);
  r=await memoryPost();assert.equal(r.body.asked,true);assert.equal(asked,1,'a Linga conversation is work');
  assert.match(lastReq.prompt,/Linga tonight: 2 English conversations, 11 replies/);
  assert.doesNotMatch(lastReq.prompt,/cafe|station|Essay Master tonight|Topic worked on tonight/i,'no scene, no other app');
  // yesterday's work is not tonight's
  seat({...noMaths,englishLearning:noEnglish,history:[{at:YESTERDAY,kind:'writing',label:'Argument',detail:'2 of 5 sentences to fix'}]});engine(lined);
  r=await memoryPost();assert.deepEqual(r.body,{lines:[],asked:false});assert.equal(asked,0);
 }finally{reg().resetProviders();}
});

test('M3: the phone\'s What the desk noticed has five states, and a failed write never reads as an empty evening',()=>{
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 assert.match(phone,/Nothing new to note tonight\./,'the model was asked and returned none');
 assert.match(phone,/Nothing worked on tonight\./,'nothing was asked');
 assert.match(phone,/Tonight is already written down\./,'End session after the TV Menu wrote the evening says it was written, not that there was nothing');
 assert.match(phone,/already: j\.already === true/,'the route\'s already flag reaches the panel');
 assert.doesNotMatch(phone,/Nothing written down tonight/,'the old catch-all is gone');
 assert.match(phone,/asked: j\.asked !== false/,'the route says which case it is');
 assert.match(phone,/\{ error: j\.error \?\? /,'a non-ok answer shows the desk\'s own sentence');
 assert.match(phone,/catch \{ setMemory\(\{ error: /,'a thrown fetch is a failure too, not an empty evening');
 assert.doesNotMatch(phone,/memory\.map\(\(l\) => <li key=\{l\}>/,'a list key is never the line text');
 assert.match(phone,/memory\.lines\.map\(\(l, i\) => <li key=\{i\}>/);
});

test('M4: the phone End session ends the evening first, then writes it down, as the TV Menu does',()=>{
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 const body=/const endSession = async \(\) => \{([\s\S]*?)\n  \};/.exec(phone)?.[1]??'';
 assert.ok(body,'endSession found');
 const end=body.indexOf('post({ type: "session.end" })'),mem=body.indexOf('call("/api/memory"'),busy=body.indexOf('setBusy(true)');
 assert.ok(end>=0&&mem>end,'session.end is posted before /api/memory is called');
 assert.ok(busy>=0&&busy<end,'busy is on from the first tap, before session.end is posted (a second tap in that round trip must not post another)');
 assert.match(body.slice(0,end),/if \(ending\.current\) return;\s*ending\.current = true;/,'a ref guard answers a second tap at once, before the first render');
 assert.match(body.slice(mem),/finally \{ setBusy\(false\); ending\.current = false; \}/,'busy and the guard are released together when the memory call is done');
 assert.equal((body.match(/setBusy\(true\)/g)||[]).length,1,'busy is turned on once');
 assert.doesNotMatch(body.slice(end),/setBusy\(true\)/,'the old shape, busy only around the memory call, is gone');
 assert.match(body.slice(0,mem),/try \{ await post\(\{ type: "session\.end" \}\); \} catch \(e\) \{ setMsg\(/,'a failed session.end is caught and shown in the status line');
 assert.doesNotMatch(body.slice(mem),/session\.end/,'nothing ends the evening after the memory');
 assert.match(phone,/busy \? "Writing tonight down…" : "End session"/);
 const tv=fs.readFileSync(path.join(root,'src/tv/keys.ts'),'utf8');
 assert.ok(tv.indexOf('o.ev({ type: "session.end" }); o.calls.push({ url: "/api/memory"')>0,'the TV does the same order');
 assert.match(fs.readFileSync(path.join(root,'src/lib/desk/memory.ts'),'utf8'),/model: "fast", thinking: false/,'writeMemory does not think');
});

test('M5: the evening log belongs to one evening - the first event of a later day clears it, session.end does not',()=>{
 const {reduce}=store(),real=Date.now,at=(d,h)=>new Date(2026,8,d,h,0,0).getTime();
 const hint=(key,stage=1)=>({type:'hint.set',hint:{key,problem:'3x + 7 = 1',stage,hint1:null,hint2:null,askedQ:'',owner:'ema'}});
 try{
  Date.now=()=>at(24,19);
  let s=session({timer:{running:false,left:1500,phase:'work'},away:{jakub:{pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,noLesson:false,lessonPaused:false,topic:null,practice:null,walkIx:0,tasks:[],log:{problems:['j1'],hints:2,hard:['j-hard']}}}});
  s=reduce(s,hint('k1'));s=reduce(s,{type:'hint.stage',stage:2});
  assert.equal(s.log.hints,1);assert.deepEqual(s.log.hard,['3x + 7 = 1']);assert.equal(s.log.day,'2026-9-24','stamped with the local day on the first write');
  Date.now=()=>at(24,23);
  s=reduce(s,{type:'session.end'});
  assert.equal(s.log.hints,1,'session.end clears nothing: the recap still reads it');assert.equal(s.away.jakub.log.hints,2);assert.equal(s.log.endedAt,at(24,23));
  {Date.now=()=>at(25,9);const e=reduce(s,{type:'session.end'}),{recapRows:rr,recapCaption:rc}=recap();assert.equal(e.log.hints,0,'UD-13: ending on a later day clears the old log first');assert.equal(rc(rr(e,at(25,10))),'A quiet evening.');Date.now=()=>at(24,23);}
  const same=reduce(s,{type:'focus',focus:0});assert.equal(same.log.hints,1,'later the same evening: kept');
  Date.now=()=>at(25,17);
  const next=reduce(s,{type:'focus',focus:0});
  assert.deepEqual([next.log.hints,next.log.problems,next.log.hard,next.log.minutes,next.log.started],[0,[],[],0,null],'the first event of the next day clears the seated log');
  assert.deepEqual(next.away.jakub.log,{problems:[],hints:0,hard:[]},'and every away slot\'s');
  const {recapRows,recapCaption}=recap();
  const tiles=recapRows(next,at(25,18));
  assert.equal(recapCaption(tiles),'A quiet evening.');
  assert.equal(tiles.find((t)=>t.app==='maths').hints,0);
  // the second evening's own work is its own
  const again=reduce(next,hint('k9'));assert.equal(again.log.hints,1);assert.equal(again.log.day,'2026-9-25');
  // a log from before the stamp is dated by the day its timer started
  const old=reduce(session({log:{started:at(23,16),minutes:30,problems:['a'],hard:[],hints:2}}),{type:'focus',focus:0});
  assert.equal(old.log.hints,0);
 }finally{Date.now=real;}
});

test('M6: "all of it right" needs a marked item; a hints-only, a homework-only and a Linga-only evening each say what they were',()=>{
 const {recapRows,recapCaption}=recap(),cap=(s)=>recapCaption(recapRows(s,NOW));
 const bare={practice:null,history:[],englishLearning:noEnglish,log:{started:null,minutes:0,problems:[],hard:[],hints:0}};
 assert.equal(cap(session({...bare,history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'6 of 6 right'}]})),'Good evening\'s work - all of it right.');
 assert.equal(cap(session({...bare,log:{...bare.log,hints:3}})),'Worked through with 3 hints; nothing was marked.');
 assert.equal(cap(session({...bare,log:{...bare.log,hints:1}})),'Worked through with 1 hint; nothing was marked.');
 assert.equal(cap(session({...bare,history:[{at:TODAY(18),kind:'homework',label:'Sheet one',detail:'8 problems read'}]})),'Read 1 page; nothing was marked.');
 assert.equal(cap(session({...bare,englishLearning:{...noEnglish,sessions:[{id:'a',sceneId:'cafe',title:'x',at:TODAY(17),turns:7},{id:'b',sceneId:'station',title:'y',at:TODAY(18),turns:4}]}})),'Two conversations in English; nothing to mark.');
 for(const c of [session({...bare,log:{...bare.log,hints:3}}),session({...bare,history:[{at:TODAY(18),kind:'homework',label:'Sheet one',detail:'8 problems read'}]})])assert.doesNotMatch(cap(c),/all of it right/);
 assert.equal(cap(session({...bare,history:[{at:TODAY(19),kind:'writing',label:'Argument',detail:'2 of 5 sentences to fix'}]})),'Good evening\'s work - two to look at together.');
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
const TONIGHT=[{verdict:'right'},{verdict:'right'},{verdict:'right'},{verdict:'wrong'},{verdict:'unsure',studentAnswer:'4/22'},{verdict:'unsure',studentAnswer:'1.33'}]; // MB-B1: answers the desk could not call (an unsure item with no answer is skipped)
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
  'Math Buddy - one set: 3 right, 1 slip, 2 the desk was not sure of; 3 pages; 1 hint, 1 needed a second',
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

test('S78: the parent\'s Recap gets one line for tonight\'s list - how many done, the open ones by name; no tasks, no line; never a TV tile',()=>{
 const {recapRows,recapLine,tasksLine}=recap();
 const T=(id,name,done=false)=>({id,sub:'maths',name,min:10,done});
 assert.equal(tasksLine([T('a','Algebra 4.2',true),T('b','Unit 6'),T('c','Essay draft',true)]),'Tonight\'s list - 2 of 3 done; still to do: Unit 6');
 assert.equal(tasksLine([T('a','Algebra 4.2'),T('b','Unit 6')]),'Tonight\'s list - 0 of 2 done; still to do: Algebra 4.2 · Unit 6');
 assert.equal(tasksLine([T('a','Algebra 4.2',true)]),'Tonight\'s list - 1 of 1 done','all done: no still-to-do');
 assert.equal(tasksLine([]),null,'no tasks, no line');assert.equal(tasksLine(undefined),null);
 // the TV stays one tile per app: tasks add no tile and change no tile's line
 const s=evening({tasks:[T('a','Algebra 4.2'),T('b','Unit 6',true)]});
 assert.deepEqual(recapRows(s,NOW).map((t)=>t.app),['maths','english','essay']);
 assert.deepEqual(recapRows(s,NOW).map(recapLine),recapRows(evening(),NOW).map(recapLine));
 // the phone draws the line from the same module, after the tiles, and only when there is one
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 const sec=phone.split('screen === "parent"')[1]?.split('</div>}')[0]??'';
 assert.ok(sec.includes('tasksLine(s.tasks)'),'the parent panel calls tasksLine');
 assert.match(sec,/\{list && <li/,'no tasks, no line');
});

test('S78: tonight\'s list is this learner\'s - the seated learner adds and ticks their own, a switch takes it along and switching back restores it',()=>{
 const {reduce,settleOwners}=store(),{tasksLine}=recap();
 let x=session({tasks:[]});
 x=reduce(x,{type:'task.add',name:'Algebra 4.2',sub:'maths',min:10});
 x=reduce(x,{type:'task.add',name:'Unit 6',sub:'english',min:10});
 x=reduce(x,{type:'task.done',id:x.tasks[0].id,done:true});
 const emas=x.tasks;assert.equal(tasksLine(emas),'Tonight\'s list - 1 of 2 done; still to do: Unit 6');
 const jak=reduce(x,{type:'learner.set',id:'jakub'});
 assert.deepEqual(jak.tasks,[],'Jakub sits down to his own (empty) list, not Ema\'s');assert.equal(tasksLine(jak.tasks),null,'so his recap has no list line');
 assert.deepEqual(jak.away.ema.tasks,emas,'Ema\'s list waits for her');
 let j=reduce(jak,{type:'task.add',name:'Irregular verbs',sub:'english',min:10});
 j=reduce(j,{type:'task.done',id:emas[1].id,done:true});
 assert.equal(j.tasks.length,1);assert.equal(j.tasks[0].done,false,'a tick for an id not on his list changes nothing');
 const back=reduce(j,{type:'learner.set',id:'ema'});
 assert.deepEqual(back.tasks,emas,'switching back restores her list, untouched');assert.equal(back.away.jakub.tasks[0].name,'Irregular verbs');
 assert.equal(reduce(back,{type:'learner.set',id:'jakub'}).tasks[0].name,'Irregular verbs','and his waits for him');
 // a learner with only a list is not "empty": it is kept in away; a saved session without tasks in a slot reads as none
 const settled=settleOwners({...session({tasks:emas}),pages:[{id:'maths-1',subject:'maths',title:'p',img:'',w:1,h:1,items:[]}]},()=>[]);
 assert.deepEqual(settled.tasks,emas,'an unstamped desk keeps its list with the learner at the desk');
 // no screen is sent another learner's list
 const {view}=require(path.join(root,'src/lib/session/pairing.ts'));
 for(const role of ['tv','phone'])assert.ok(!JSON.stringify(view(jak,role)).includes('Unit 6'),role);
});

test('S78: a task id is unique across everything the desk holds - many adds in one tick, across a learner switch, never share one',()=>{
 const {reduce}=store();
 // the clock is pinned so every add lands in the same millisecond: the worst case for a "t"+Date.now() id
 const real=Date.now,T=real.call(Date);Date.now=()=>T;
 try{
  let x=session({tasks:[]});
  const add=(name)=>{x=reduce(x,{type:'task.add',name,sub:'maths',min:10});};
  for(let i=0;i<5;i++)add('ema '+i);
  x=reduce(x,{type:'learner.set',id:'jakub'});
  for(let i=0;i<5;i++)add('jakub '+i);
  x=reduce(x,{type:'learner.set',id:'ema'});
  for(let i=0;i<5;i++)add('ema again '+i);
  const held=[...x.tasks,...Object.values(x.away).flatMap((slot)=>slot.tasks)];
  assert.equal(held.length,15,'every add landed on a list');
  assert.equal(new Set(held.map((t)=>t.id)).size,15,'and none shares an id, in one list or across the two');
  assert.ok(held.every((t)=>/^t\d+(-\d+)?$/.test(t.id)),'the id keeps its "t" and digits shape');
  // a tick for Ema's task never lands on Jakub's
  const jak=reduce(x,{type:'learner.set',id:'jakub'});
  const ticked=reduce(jak,{type:'task.done',id:jak.away.ema.tasks[0].id,done:true});
  assert.ok(ticked.tasks.every((t)=>!t.done),'a tick for an id on another learner\'s list changes nothing on his');
  // a task the desk already holds (a saved session, or the clock stepping back) is never issued again
  const y=reduce(session({tasks:[{id:'t'+T,sub:'maths',name:'old',min:5,done:false},{id:'t'+T+'-1',sub:'maths',name:'old2',min:5,done:false}]}),{type:'task.add',name:'new',sub:'maths',min:10});
  assert.equal(new Set(y.tasks.map((t)=>t.id)).size,3,'a fresh id beside two held ones');
 }finally{Date.now=real;}
});

const WR=(h,label,detail)=>({at:TODAY(h),kind:'writing',label,detail});
const phoneEssay=(history)=>{const {recapRows,recapLine}=recap();return recapLine(recapRows(session({history}),NOW)[2]);};
test('13-i RC1: the essay phone line never sums counts across readings; each count is one reading, in the order read',()=>{
 assert.equal(phoneEssay([WR(19,'Argument','2 of 5 sentences to fix')]),'Essay Master - one reading (Argument): 2 of 5 sentences to fix');
 assert.equal(phoneEssay([WR(17,'Evidence','3 of 5 sentences to fix'),WR(18,'Evidence','1 of 5 sentences to fix')]),'Essay Master - two readings (Evidence): 3 of 5, then 1 of 5 sentences to fix');
 assert.equal(phoneEssay([WR(17,'Structure','2 of 5 sentences to fix'),WR(18,'Evidence','1 of 4 sentences to fix')]),'Essay Master - two readings: Structure 2 of 5, then Evidence 1 of 4 sentences to fix');
 const five=[3,2,1].length&&[WR(10,'Evidence','4 of 5 sentences to fix'),WR(11,'Evidence','4 of 5 sentences to fix'),WR(12,'Evidence','3 of 5 sentences to fix'),WR(13,'Evidence','2 of 5 sentences to fix'),WR(14,'Evidence','1 of 5 sentences to fix')];
 assert.equal(phoneEssay(five),'Essay Master - five readings (Evidence), the last three: 3 of 5, then 2 of 5, then 1 of 5 sentences to fix');
 const mixed=[WR(10,'Structure','4 of 5 sentences to fix'),WR(11,'Evidence','4 of 5 sentences to fix'),WR(12,'Structure','2 of 5 sentences to fix'),WR(13,'Evidence','3 of 4 sentences to fix'),WR(14,'Structure','1 of 5 sentences to fix')];
 assert.equal(phoneEssay(mixed),'Essay Master - five readings, the last three: Structure 2 of 5, then Evidence 3 of 4, then Structure 1 of 5 sentences to fix');
 assert.equal(phoneEssay([WR(17,'Evidence','3 of 5 sentences to fix, 1 fixed'),WR(18,'Evidence','1 of 5 sentences to fix, 2 fixed')]),'Essay Master - two readings (Evidence): 3 of 5, then 1 of 5 sentences to fix, 3 fixed tonight','fixed stays summed over tonight');
 // the recap lists lenses in history order, the order read
 assert.match(phoneEssay([WR(17,'Structure','2 of 5 sentences to fix'),WR(18,'Argument','1 of 5 sentences to fix')]),/Structure 2 of 5, then Argument 1 of 5/);
});
test('13-i RC2: the caption counts only the last reading, so one paragraph read twice is not counted twice',()=>{
 const {recapRows,recapCaption}=recap();
 const cap=(h)=>recapCaption(recapRows(session({practice:null,englishLearning:noEnglish,log:{started:null,minutes:0,problems:[],hard:[],hints:0},history:h}),NOW));
 assert.equal(cap([WR(18,'Evidence','3 of 5 sentences to fix'),WR(19,'Evidence','1 of 5 sentences to fix')]),'Good evening\'s work - one to look at together.');
});
test('13-i RC7: the phone\'s maths line says how many hints needed a second; no second, no clause',()=>{
 const {recapRows,recapLine}=recap(),line=(log)=>recapLine(recapRows(session({log:{started:null,minutes:0,problems:['k'],hard:[],hints:0,...log}}),NOW)[0]);
 assert.equal(line({hints:3,hard:['a']}),'Math Buddy - 3 hints, 1 needed a second');
 assert.equal(line({hints:1}),'Math Buddy - 1 hint');
});

test('13-i RC4: railOf keeps a reading with something to fix citron and a clean one never',()=>{
 const {railOf}=recap();
 for(const [of,against,arrows,back] of [[5,2,5,2],[12,3,12,3],[14,2,12,2],[14,14,12,12],[30,1,12,1],[30,29,12,11],[20,0,12,0],[0,0,0,0]])
  assert.deepEqual(railOf(of,against),{arrows,back},`railOf(${of},${against})`);
});
test('13-i RC3: five readings draw the last three rails and "2 earlier"; maths sets do the same',()=>{
 const hist=[10,11,12,13,14].map((h,i)=>WR(h,'Evidence',`${i+1} of 14 sentences to fix`));
 const html=draw(session({history:hist}),NOW);
 assert.equal((html.match(/data-role="recap-reading"/g)||[]).length,3);
 assert.equal((html.match(/data-role="recap-earlier"/g)||[]).length,1);
 assert.match(html,/2 earlier/);
 const sets=[10,11,12,13,14].map((h)=>({at:TODAY(h),kind:'practice',label:'Two-step equations',detail:'3 of 6 right'}));
 const m=draw(session({history:sets}),NOW);
 assert.equal((m.match(/data-role="recap-set"/g)||[]).length,3);
 assert.match(m,/2 earlier/);
 assert.doesNotMatch(draw(session({history:hist.slice(0,3)}),NOW),/recap-earlier/,'three readings need no earlier line');
});
// SW5 (scan-sweep optimize 2026-10-13): the Linga tile draws its last five talks and, like the other two tiles, says how many came before
test('SW5: seven talks tonight draw the last five marks and "2 earlier"; five or fewer draw no earlier line',()=>{
 const talks=(n)=>Array.from({length:n},(_,i)=>({id:`t${i}`,sceneId:'cafe',title:'At the cafe',at:TODAY(10+i),turns:3+i}));
 const html=draw(session({englishLearning:{...noEnglish,sessions:talks(7)}}),NOW);
 const tile=html.slice(html.indexOf('data-app="english"'),html.indexOf('data-app="essay"'));
 assert.equal((tile.match(/data-role="recap-talk"/g)||[]).length,5,'the last five talks');
 assert.match(tile,/data-role="recap-earlier"[^>]*>2 earlier</,'and the two before them, counted');
 const five=draw(session({englishLearning:{...noEnglish,sessions:talks(5)}}),NOW);
 const t5=five.slice(five.indexOf('data-app="english"'),five.indexOf('data-app="essay"'));
 assert.equal((t5.match(/data-role="recap-talk"/g)||[]).length,5);assert.doesNotMatch(t5,/recap-earlier/,'five need no earlier line');
});
// SW6 (scan-sweep optimize 2026-10-13): the shell's lesson ticker asks nothing the phone cannot do and names the remote's button
test('SW6: the lesson ticker - paused or playing - names Play, not the bench keyboard, and asks no circle on the phone',()=>{
 const {LessonScreen}=require(path.join(root,'src/tv/screens.tsx'));
 const lesson={id:'l1',title:'Past simple',t:0,text:'yesterday · ago',why:'Unit 6.',youtube:null};
 const ticker=(paused)=>{const h=renderToStaticMarkup(createElement(LessonScreen,{s:session({subject:'english',screen:'lesson',lesson,lessonPaused:paused})}));return h.slice(h.indexOf('class="ticker"'));};
 for(const paused of [false,true]){
  const t=ticker(paused);
  // no phone panel circles a lesson frame (tools/phone-panel-test.cjs NO_PANEL): the TV must not ask for one
  assert.doesNotMatch(t,/circle on the phone/i,`paused=${paused}: no ask the phone cannot answer`);
  assert.doesNotMatch(t,/\bSpace\b/,`paused=${paused}: the remote has no Space key`);
  assert.match(t,/\bPlay\b/,`paused=${paused}: the remote's own button`);
 }
 assert.match(ticker(true),/paused/);assert.match(ticker(false),/playing/);
});
// SW11 (scan-sweep optimize 2026-10-13, tv-surface): Play/Pause reaches the player - the embed accepts commands and the lesson screens send them
/** A TS/TSX source with block comments and whole-line or trailing // comments removed (a URL's // is kept). */
const noComments=(t)=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`])\/\/.*$/gm,'$1');
test('SW11: the lesson embed enables the player API and both lesson screens send pauseVideo/playVideo when lessonPaused changes',()=>{
 const {LessonScreen}=require(path.join(root,'src/tv/screens.tsx')),M=require(path.join(root,'src/maths/MathsTV.tsx'));
 const lesson={id:'l1',title:'Past simple',t:0,text:'yesterday · ago',why:'Unit 6.',youtube:'abc123',concepts:[]};
 const shellHtml=renderToStaticMarkup(createElement(LessonScreen,{s:session({subject:'english',screen:'lesson',lesson})}));
 const mathsHtml=renderToStaticMarkup(createElement(M.LessonScreen,{s:session({subject:'maths',screen:'lesson',lesson})}));
 for(const [name,h] of [['shell',shellHtml],['maths',mathsHtml]]){
  const src=(h.match(/<iframe[^>]*src="([^"]*)"/)||[])[1];
  assert.ok(src,`${name}: the embed is drawn`);
  assert.match(src,/(\?|&amp;|&)enablejsapi=1(&amp;|&|$)/,`${name}: the embed accepts player commands`);
 }
 // the command the player takes, as the IFrame API's postMessage form
 const {playerCommand}=keys();
 assert.equal(typeof playerCommand,'function','keys.ts names the command');
 assert.deepEqual(JSON.parse(playerCommand(true)),{event:'command',func:'pauseVideo',args:''});
 assert.deepEqual(JSON.parse(playerCommand(false)),{event:'command',func:'playVideo',args:''});
 // each lesson screen posts it to the embed's window
 for(const f of ['src/tv/screens.tsx','src/maths/MathsTV.tsx']){
  const t=noComments(fs.readFileSync(path.join(root,f),'utf8'));
  assert.match(t,/playerCommand\(/,`${f}: sends the command`);
  assert.match(t,/postMessage\(/,`${f}: posts it to the iframe`);
 }
});
// SW12 (scan-sweep optimize 2026-10-13, tv-surface): Math Buddy's lesson says what SW6 holds for the shell - Play, no circle on the phone, no Space
test('SW12: the maths lesson line - paused or playing - names Play, not the bench keyboard, and asks no circle on the phone',()=>{
 const M=require(path.join(root,'src/maths/MathsTV.tsx'));
 const lesson={id:'l1',title:'Past simple',t:0,text:'yesterday · ago',why:'Unit 6.',youtube:null,concepts:[]};
 const line=(paused)=>{const h=renderToStaticMarkup(createElement(M.LessonScreen,{s:session({subject:'maths',screen:'lesson',lesson,lessonPaused:paused})}));const i=h.indexOf('class="mb-paused"');return h.slice(i,h.indexOf('</div>',i));};
 for(const paused of [false,true]){
  const t=line(paused);
  assert.ok(t.length>0,`paused=${paused}: the line is drawn`);
  assert.doesNotMatch(t,/circle on the phone/i,`paused=${paused}: no ask the phone cannot answer`);
  assert.doesNotMatch(t,/\bSpace\b/,`paused=${paused}: the remote has no Space key`);
  assert.match(t,/\bPlay\b/,`paused=${paused}: the remote's own button`);
 }
});
// SW14 (scan-sweep optimize 2026-10-13, tv-surface): the hint and lesson screens draw an empty state, as the page and sentence screens do
test('SW14: hint and lesson with their data gone draw a band, a title and a caption naming Back - not an empty stage',()=>{
 const {HintScreen,LessonScreen,PageScreen,SentenceScreen}=require(path.join(root,'src/tv/screens.tsx'));
 const drawn=[['hint',createElement(HintScreen,{s:session({subject:'english',screen:'hint',hint:null}),focus:0})],['lesson',createElement(LessonScreen,{s:session({subject:'english',screen:'lesson',lesson:null})})],
  ['page',createElement(PageScreen,{s:session({screen:'page',pages:[]}),view:'band'})],['sentence',createElement(SentenceScreen,{s:session({subject:'english',screen:'sentence',english:null}),focus:0})]];
 const empty=drawn.filter(([,el])=>renderToStaticMarkup(el)==='').map(([n])=>n);
 assert.deepEqual(empty,[],'no data screen draws nothing');
 for(const [n,el] of drawn.slice(0,2)){
  const h=renderToStaticMarkup(el);
  assert.match(h,/class="band /,`${n}: the band`);
  assert.match(h,/class="title"/,`${n}: a title`);
  assert.match(h,/class="cap"[^]*Back/,`${n}: a caption that names Back`);
 }
});
// SW15 (scan-sweep optimize 2026-10-13, tv-surface): a label that carries the meaning alone is at or above On Air's 28 px floor (docs/DESIGN-ON-AIR.md: furniture labels only go to 20-22 px)
/** [selector, px] for every rule of a stylesheet that draws generated text from an attribute and sets a px font size. */
function attrLabelSizes(css){
 const out=[];
 for(const m of css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  if(!/content:\s*attr\(/.test(m[2]))continue;
  const px=m[2].match(/font-size:\s*(\d+(?:\.\d+)?)px/);
  if(px)out.push([m[1].trim(),Number(px[1])]);
 }
 return out;
}
test('SW15: the sentence screen\'s tense label (.tok::after, content attr(data-l)) is at least 28 px',()=>{
 const css=fs.readFileSync(path.join(root,'src/design/on-air.css'),'utf8');
 const rows=attrLabelSizes(css);
 assert.ok(rows.some(([sel])=>/\.tok::after/.test(sel)),'control: the scan finds the label rule');
 assert.deepEqual(rows.filter(([,px])=>px<28),[],'no attribute-drawn label is under the floor');
 // the scan bites: a seeded 26 px label is found, the same rule in a comment is not
 assert.deepEqual(attrLabelSizes('.x::after { content: attr(data-l); font-size: 26px; }'),[['.x::after',26]]);
 assert.deepEqual(attrLabelSizes('/* .x::after { content: attr(data-l); font-size: 26px; } */'),[]);
});
// SW16 (scan-sweep optimize 2026-10-13, tv-surface): the /probe hydration check is a dev-server tool - a production build answers 404
test('SW16: /probe renders in development and throws notFound() in production',()=>{
 const Probe=require(path.join(root,'src/app/probe/page.tsx')).default;
 const was=process.env.NODE_ENV;
 try{
  process.env.NODE_ENV='development';
  assert.match(renderToStaticMarkup(createElement(Probe)),/probe:/,'control: the dev page is drawn');
  process.env.NODE_ENV='production';
  let err=null;try{renderToStaticMarkup(createElement(Probe));}catch(e){err=e;}
  assert.ok(err,'production does not draw the diagnostic page');
  assert.match(String(err.digest??''),/NEXT_(HTTP_ERROR_FALLBACK|NOT_FOUND)/,'it is the framework\'s 404, not another error');
 }finally{process.env.NODE_ENV=was;}
});
// SW9 (scan-sweep optimize 2026-10-13): the page's lower third marks a cut paragraph as cut, and only a cut one (as the lesson text does)
test('SW9: an essay paragraph on the page screen ends in an ellipsis only when it was cut',()=>{
 const {PageScreen}=require(path.join(root,'src/tv/screens.tsx'));
 const pg=(text)=>({id:'e1',subject:'essay',day:'x',title:'My essay',img:'',w:100,h:100,readMs:2000,items:[{n:1,key:'k1',text,band:[0,10]}]});
 const lt=(text)=>{const h=renderToStaticMarkup(createElement(PageScreen,{s:session({screen:'page',pages:[pg(text)]}),view:'band'}));const m=h.match(/class="txt"[^>]*>([^<]*)</);return m&&m[1];};
 assert.equal(lt('Cats sleep a lot.'),'Cats sleep a lot.','a short paragraph is shown whole, with no ellipsis');
 const long='word '.repeat(40).trim();
 assert.equal(lt(long),long.slice(0,110)+'…','a long one is cut at 110 and says so');
});
// SW10 (scan-sweep optimize 2026-10-13): On Air's stylesheet carries only rules some screen draws - it ships on every page, the phone's too
/** The class names desk/src hands to className (JSX attributes, className props, and the consts they name), comments ignored by the parser. */
function drawnClasses(){
 const used=new Set(),words=(t)=>t.split(/\s+/).forEach((w)=>w&&used.add(w)),files=[];
 const walk=(d)=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p);else if(/\.tsx?$/.test(f.name))files.push(p);}};walk(path.join(root,'src'));
 for(const f of files){
  const sf=ts.createSourceFile(f,fs.readFileSync(f,'utf8'),ts.ScriptTarget.Latest,true,f.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const decl=new Map();(function d(n){if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer)decl.set(n.name.text,n.initializer);ts.forEachChild(n,d);})(sf);
  const seen=new Set();
  const strings=(n)=>{if(!n)return;if(ts.isStringLiteralLike(n))words(n.text);else if(ts.isTemplateExpression(n)){words(n.head.text);n.templateSpans.forEach((s)=>{strings(s.expression);words(s.literal.text);});}
   else if(ts.isIdentifier(n)&&decl.has(n.text)&&!seen.has(n.text)){seen.add(n.text);strings(decl.get(n.text));}else ts.forEachChild(n,strings);};
  (function v(n){if((ts.isJsxAttribute(n)&&n.name.getText()==='className')||(ts.isPropertyAssignment(n)&&/className/i.test(n.name.getText())))strings(n.initializer);ts.forEachChild(n,v);})(sf);
 }
 return used;
}
const deadIn=(css,used)=>[...new Set([...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m)=>m[1]))].filter((c)=>!used.has(c));
test('SW10: every class On Air styles is drawn by some screen - no dead rules shipped to the TV and the phone',()=>{
 const css=fs.readFileSync(path.join(root,'src/design/on-air.css'),'utf8'),used=drawnClasses();
 assert.deepEqual(deadIn(css,used),[],'on-air.css styles classes nothing draws');
 // the scan bites: a seeded rule nobody draws is found, and the same rule in a comment is not
 assert.deepEqual(deadIn(css+'\n.sw-seeded-dead { color: red; }',used),['sw-seeded-dead']);
 assert.deepEqual(deadIn(css+'\n/* .sw-seeded-dead { color: red; } */',used),[]);
 assert.ok(used.has('rc-tile')&&used.has('band-corner')&&used.has('btn'),'control: classes the screens draw are seen');
});

// ---- MB-B1: an item left empty is skipped - counted and said apart from the desk's doubt, never a slip, never "all right"
const SKIPPY=[{verdict:'right',studentAnswer:'4'},{verdict:'right',studentAnswer:'5'},{verdict:'right',studentAnswer:'6'},{verdict:'right',studentAnswer:'7'},{verdict:'unsure',studentAnswer:''}];
test('MB-B1 recap 1: "4 of 5 right, 1 skipped" - the recap says "4 right, 1 skipped", not "1 the desk was not sure of", and never "all of it right"',()=>{
 const {rightLine}=require(path.join(root,'src/lib/rules/maths.ts')),{parseDetail,recapRows,recapLine,recapCaption,toLook,slipsOf}=recap();
 const line=rightLine(SKIPPY);
 assert.equal(line,'4 of 5 right, 1 skipped');
 assert.deepEqual(parseDetail('practice',line),{right:4,of:5,skipped:1});
 const s=evening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:line}],log:{...evening().log,hints:0,hard:[]}});
 const rows=recapRows(s,NOW);
 assert.deepEqual(rows[0].sets,[{right:4,of:5,skipped:1}]);assert.equal(slipsOf(rows[0].sets[0]),0,'no slip');
 assert.equal(recapLine(rows[0]),'Math Buddy - one set: 4 right, 1 skipped');
 assert.doesNotMatch(recapLine(rows[0]),/not sure|slip/);
 assert.doesNotMatch(recapCaption(rows),/all of it right/,'a skipped item is not right');
 assert.ok(toLook(rows)>=1,'the skipped item is still one to go through together');
});
test('MB-B1 recap 2: a set with a slip, a doubt and a skip says all three apart; an all-skipped set; an older line keeps its "not sure"',()=>{
 const {rightLine}=require(path.join(root,'src/lib/rules/maths.ts')),{parseDetail,recapRows,recapLine}=recap();
 const mix=[{verdict:'right',studentAnswer:'4'},{verdict:'wrong',studentAnswer:'5'},{verdict:'unsure',studentAnswer:'4/22'},{verdict:'unsure',studentAnswer:' '}];
 assert.equal(rightLine(mix),'1 of 4 right, 1 not sure, 1 skipped');
 assert.deepEqual(parseDetail('practice','1 of 4 right, 1 not sure, 1 skipped'),{right:1,of:4,unsure:1,skipped:1});
 const s=evening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:rightLine(mix)}]});
 assert.match(recapLine(recapRows(s,NOW)[0]),/one set: 1 right, 1 slip, 1 the desk was not sure of, 1 skipped;/);
 const none=[{verdict:'unsure',studentAnswer:''},{verdict:'unsure'}];
 assert.equal(rightLine(none),'0 of 2 right, 2 skipped');
 assert.deepEqual(parseDetail('practice','0 of 2 right, 2 skipped'),{right:0,of:2,skipped:2});
 const all=evening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'0 of 2 right, 2 skipped'}]});
 assert.match(recapLine(recapRows(all,NOW)[0]),/one set: 0 right, 2 skipped;/);
 // counts past the set, out of order, or unparseable give nothing, as before
 for(const d of ['1 of 2 right, 1 not sure, 1 skipped','1 of 4 right, 1 skipped, 1 not sure','1 of 4 right, skipped','1 of 4 right, 1 skip'])assert.deepEqual(parseDetail('practice',d),{},d);
 // a line written before skipped existed still reads as it did: its blanks stay in its "not sure"
 assert.deepEqual(parseDetail('practice','3 of 6 right, 2 not sure'),{right:3,of:6,unsure:2});
});
test('MB-B1 recap 3: the TV tile draws a skipped item as the empty answer line, after the slips and the doubt, never a ring',()=>{
 const {setMarks}=recap();
 assert.deepEqual(setMarks({right:1,of:4,unsure:1,skipped:1}),['right','wrong','unsure','skipped']);
 assert.deepEqual(setMarks({right:0,of:2,skipped:2}),['skipped','skipped']);
 assert.deepEqual(setMarks({right:3,of:6}),['right','right','right','wrong','wrong','wrong'],'an older line: as before');
 assert.equal(setMarks({right:10,of:20,skipped:5}).length,12,'at most twelve marks a set');
 const s=evening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'1 of 4 right, 1 not sure, 1 skipped'}]});
 assert.deepEqual(marksOf(draw(s,NOW)),[['right:rc-tk','look:rc-ring','unsure:rc-ask','skipped:rc-skip']]);
 const all=evening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'0 of 2 right, 2 skipped'}]});
 assert.deepEqual(marksOf(draw(all,NOW)),[['skipped:rc-skip','skipped:rc-skip']],'an all-skipped set: no ring, no tick');
});

// MB-B23: the recap names which problems had a hint, by the name the learner knows them - never their text
const HP=(id,items)=>({id,subject:'maths',title:'Sheet',img:'',w:1,h:1,items:items.map(([n,label,text],i)=>({n,...(label?{label}:{}),text,cx:0,cy:i,band:[i,i],key:`${id}:${n}${label?`:${label}`:''}`}))});
const SHEET=HP('pA',[[3,null,'2x + 1 = 7'],[5,'a)','x/2 = 4'],[5,'b)','3x - 2 = 10']]);
const hintTile=(log,pages=[SHEET])=>recap().recapRows(session({pages,log:{started:null,minutes:0,problems:[],hard:[],hints:0,...log}}),NOW)[0];
test('MB-B23 rows 1: the hinted problems are named in page order, a lettered part with its number, and the second hint by name',()=>{
 const {hintedLine}=recap();
 const t=hintTile({problems:['pA:5:b)','pA:3'],hard:['3x - 2 = 10'],hints:3});
 assert.deepEqual(t.hinted,[{name:'3',second:false},{name:'5b',second:true}]);
 assert.equal(hintedLine(t),'Hints on 3 and 5b; a second on 5b.');
 assert.equal(hintedLine(hintTile({problems:['pA:3'],hints:1})),'A hint on 3; none needed a second.');
 assert.equal(hintedLine(hintTile({problems:['pA:5:a)'],hard:['x/2 = 4'],hints:2})),'Hints on 5a; a second on 5a.');
 const flat=hintedLine(t)+JSON.stringify(t.hinted);
 for(const [,, text] of [[3,null,'2x + 1 = 7'],[5,'a)','x/2 = 4'],[5,'b)','3x - 2 = 10']])assert.ok(!flat.includes(text),'never a problem\'s text');
});
test('MB-B23 rows 2: an empty evening, an unnameable hint, a page gone and two pages with the same number',()=>{
 const {hintedLine,problemName}=recap();
 assert.equal(hintedLine(hintTile({})),'No hints tonight.');
 assert.deepEqual(hintTile({}).hinted,[]);
 assert.equal(hintedLine(hintTile({problems:['k1'],hints:1})),'Nothing needed a second hint.','a key that names nothing is counted, never guessed');
 assert.equal(hintedLine(hintTile({problems:['k1'],hard:['some text'],hints:2})),'1 problem needed a second hint.');
 assert.equal(hintedLine(hintTile({problems:['gone:4:c)'],hints:1},[])),'A hint on 4c; none needed a second.','a page no longer held: named from its key');
 const two=hintTile({problems:['pA:3','pB:3'],hard:['y = 2'],hints:3},[SHEET,HP('pB',[[3,null,'y = 2']])]);
 assert.equal(hintedLine(two),'Hints on 3 on page 1 and 3 on page 2; a second on 3 on page 2.');
 assert.equal(problemName(5,'(b)'),'5b');assert.equal(problemName(2,'3b'),'3b');assert.equal(problemName(7),'7');assert.equal(problemName(7,'part one'),'7');
});
test('MB-B23 rows 3: a long evening names six and says how many more; a second hint past the six is counted',()=>{
 const {hintedLine}=recap();
 const page=HP('pL',Array.from({length:9},(_,i)=>[i+1,null,`q${i+1}`]));
 const t=hintTile({problems:page.items.map((x)=>x.key).reverse(),hard:['q2','q9'],hints:11},[page]);
 assert.equal(hintedLine(t),'Hints on 1, 2, 3, 4, 5, 6 and 3 more; 2 problems needed a second.');
 assert.equal(hintedLine(hintTile({problems:page.items.slice(0,7).map((x)=>x.key),hard:['q2'],hints:8},[page])),'Hints on 1, 2, 3, 4, 5, 6 and 1 more; a second on 2.');
});
test('MB-B23 rows 4: the names are the seated learner\'s - a learner switch takes the hints away with the pages',()=>{
 const {reduce}=store(),{hintedLine}=recap();
 const s=session({profiles:[EMA,{...JAKUB,modules:['maths','english','essay']}],pages:[SHEET],log:{started:null,minutes:0,problems:['pA:3'],hard:[],hints:1}});
 const j=reduce(s,{type:'learner.set',id:'jakub'});
 assert.equal(hintedLine(recap().recapRows(j,NOW).find((t)=>t.app==='maths')),'No hints tonight.');
 const back=reduce(j,{type:'learner.set',id:'ema'});
 assert.equal(hintedLine(recap().recapRows(back,NOW).find((t)=>t.app==='maths')),'A hint on 3; none needed a second.');
});
const lampsOf=(html)=>[...html.matchAll(/<span class="rc-lamp"( data-second="true")?(?: data-page="(\d+)")?><b><\/b><em>([^<]*)(?:<small>.*?<\/small>)?<\/em><\/span>/g)].map((m)=>`${m[3]}${m[2]?` p${m[2]}`:''}${m[1]?'!':''}`);
test('MB-B23 TV: a lamp per hinted problem with its name beneath, the second-hint lamp ringed, five at most then "k more"',()=>{
 const one=draw(session({pages:[SHEET],log:{started:null,minutes:0,problems:['pA:5:b)','pA:3'],hard:['3x - 2 = 10'],hints:3}}),NOW);
 assert.deepEqual(lampsOf(one),['3','5b!']);
 for(const text of ['2x + 1 = 7','3x - 2 = 10'])assert.ok(!one.includes(text),'never a problem\'s text on the TV');
 const page=HP('pL',Array.from({length:8},(_,i)=>[i+1,null,`q${i+1}`]));
 const many=draw(session({pages:[page],log:{started:null,minutes:0,problems:page.items.map((x)=>x.key),hard:[],hints:8}}),NOW);
 assert.deepEqual(lampsOf(many),['1','2','3','4','5']);
 assert.match(many,/data-role="recap-hints-more">3 more</);
 const two=draw(session({pages:[SHEET,HP('pB',[[3,null,'y = 2']])],log:{started:null,minutes:0,problems:['pA:3','pB:3'],hard:[],hints:2}}),NOW);
 assert.deepEqual(lampsOf(two),['3 p1','3 p2'],'two problems called 3: the page under each');
 // a log written before the names (no key the session can read): a lamp per hint as before, no label
 const old=draw(session({log:{started:null,minutes:0,problems:['k1'],hard:['t'],hints:2}}),NOW);
 assert.deepEqual(lampsOf(old),[]);assert.equal([...old.matchAll(/<b( data-second="true")?><\/b>/g)].length,2);
 const css=fs.readFileSync(path.join(root,'src/design/on-air.css'),'utf8'),em=/\.rc \.rc-lamp em \{[^}]*?(\d+)px/.exec(css);
 assert.ok(em&&+em[1]>=28,'the name under a lamp is 28px or more');
});
test('MB-B23 phone: the Recap tab says which problems had a hint by name, from hintedLine - never the problem\'s text',()=>{
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 const sec=phone.split('screen === "parent"')[1]?.split('<WeekPage')[0]??'';
 assert.match(sec,/hintedLine\(/,'the parent panel calls hintedLine');
 assert.doesNotMatch(sec,/log\.hard\.map|Needed a second hint: \{/,'no hinted problem\'s text on the phone');
 assert.match(sec,/data-role="phone-hinted"/);
});

// cycle 19: the recap names a step up's slips - the ringed item's number and the slip's short label from rules, never a value
const PCT={topic:'pct-change',marked:true,stretch:true,items:[
 {n:1,question:'Increase 80 by 25%.',studentAnswer:'100',verdict:'right',tier:3,stretch:true},
 {n:2,question:'Increase 200 by 10% then by 20%.',studentAnswer:'260',verdict:'wrong',slip:'pct-added',tier:3,stretch:true},
 {n:3,question:'After a 20% rise it costs 60. What did it cost before?',studentAnswer:'48',verdict:'wrong',slip:'pct-of-new',tier:3,stretch:true},
 {n:4,question:'Decrease 50 by 10%.',studentAnswer:'40',verdict:'wrong',slip:'pct-ten-stopped'},
 {n:5,question:'Increase 30 by 10%.',studentAnswer:'34',verdict:'wrong'}]};
const pctEvening=(patch={})=>session({practice:PCT,history:[{at:TODAY(17),kind:'practice',label:'Percent increase and decrease',detail:'1 of 5 right'}],...patch});
test('cycle 19 rules: a short label on the top-rung and Pythagoras slips only - lowercase, four words at most, no digit',()=>{
 const S=require(path.join(root,'src/lib/rules/school.ts')),{slip}=require(path.join(root,'src/lib/rules/maths.ts'));
 const shorts=S.SCHOOL_SLIPS.filter((x)=>x.short).map((x)=>x.id).sort();
 const want=[...Object.values(S.SCHOOL_TOP_SLIPS).flat(),...S.SCHOOL_UNIT_SLIPS.pythagoras].sort();
 assert.deepEqual(shorts,want,'every top-rung slip and every Pythagoras slip, and no other');
 for(const x of S.SCHOOL_SLIPS.filter((y)=>y.short)){
  assert.equal(x.short,x.short.toLowerCase(),x.id);assert.doesNotMatch(x.short,/\d/,x.id);
  assert.ok(x.short.split(/\s+/).length<=S.SHORT_WORDS&&x.short.length<=S.SHORT_CHARS,`${x.id}: "${x.short}" fits`);
 }
 assert.equal(slip('pct-added','pct-change').short,'added the percentages','carried through rules/maths slip()');
 assert.equal(slip('arithmetic-slip').short,undefined,'a linear slip has none');
});
test('cycle 19 rows: tonight\'s set names its ringed items whose slip has a short, in the set\'s order; nothing else',()=>{
 const {recapRows,slippedOf}=recap();
 const t=recapRows(pctEvening(),NOW)[0];
 assert.deepEqual(t.slipped,[{name:'2',slip:'added the percentages'},{name:'3',slip:'percent of the new'}],'a unit slip without a short and a ring with no slip are not named');
 const flat=JSON.stringify(t);
 for(const i of PCT.items){assert.ok(!flat.includes(i.question),i.question);assert.ok(!flat.includes(`"${i.studentAnswer}"`),i.studentAnswer);}
 assert.deepEqual(slippedOf(pctEvening({history:[{at:YESTERDAY,kind:'practice',label:'Percent increase and decrease',detail:'1 of 5 right'}]}),NOW),[],'yesterday\'s set names nothing tonight');
 assert.deepEqual(slippedOf(pctEvening({history:[{at:TODAY(17),kind:'practice',label:'Two-step equations',detail:'4 of 6 right'}]}),NOW),[],'tonight\'s line is another set\'s');
 assert.deepEqual(slippedOf(pctEvening({history:[{at:TODAY(17),kind:'practice',label:'pct-change',detail:'1 of 5 right'}]}),NOW).length,2,'a line under the bare id is the set\'s too');
 assert.deepEqual(slippedOf(pctEvening({practice:{...PCT,marked:false}}),NOW),[],'an unmarked set names nothing');
 const py={topic:'pythagoras',marked:true,items:[{n:1,question:'q',verdict:'wrong',slip:'pyth-no-root'},{n:2,question:'q',verdict:'right',slip:'pyth-sides-added'}]};
 assert.deepEqual(slippedOf(session({practice:py,history:[{at:TODAY(18),kind:'practice',label:"Pythagoras' theorem",detail:'1 of 2 right'}]}),NOW),[{name:'1',slip:'no square root'}],'a usual Pythagoras item\'s slip is named too; a right item never');
 assert.deepEqual(recapRows(evening(),NOW)[0].slipped,[],'a linear set\'s arithmetic slip has no short');
});
const slipsOfHtml=(html)=>[...html.matchAll(/<span class="rc-lamp" data-slip="true"><i data-v="look"><svg class="rc-ring"[^>]*>.*?<\/svg><\/i><em>([^<]*)<small>([^<]*)<\/small><\/em><\/span>/g)].map((m)=>`${m[1]} · ${m[2]}`);
test('cycle 19 TV: under the rail, the pen\'s ring with the item\'s number and the slip\'s short label - two at most, then "k more"; never a value',()=>{
 const html=draw(pctEvening(),NOW);
 assert.deepEqual(slipsOfHtml(html),['2 · added the percentages','3 · percent of the new']);
 assert.doesNotMatch(html,/recap-slips-more/);
 for(const i of PCT.items){assert.ok(!html.includes(i.question),i.question);}
 assert.ok(!/>(260|48|100)</.test(html),'no answer drawn');
 const three={...PCT,items:[...PCT.items,{n:6,question:'q6',studentAnswer:'1',verdict:'wrong',slip:'pct-added',tier:3,stretch:true}]};
 const many=draw(pctEvening({practice:three}),NOW);
 assert.deepEqual(slipsOfHtml(many),['2 · added the percentages','3 · percent of the new']);
 assert.match(many,/data-role="recap-slips-more">1 more</);
 assert.doesNotMatch(draw(evening(),NOW),/recap-slips/,'no named slip: no row');
 const css=fs.readFileSync(path.join(root,'src/design/on-air.css'),'utf8');
 const rules=[...css.matchAll(/\.rc \.rc-lamp\[data-slip\][^{]*\{([^}]*)\}/g)].map((m)=>m[1]).join(' ');
 assert.ok(rules,'the slip label has its own rules');
 assert.doesNotMatch(rules,/ellipsis|text-overflow|word-break:\s*break-all|nowrap/,'a label is never cut mid-word');
 for(const px of rules.matchAll(/font[^;]*?(\d+)px/g))assert.ok(+px[1]>=28,`${px[0]}: 28px or more`);
 assert.match(rules,/font-size: 28px/);
});
