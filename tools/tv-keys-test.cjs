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
 const tonight=fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8').split('export function Tonight')[1].split('\nexport function')[0];
 assert.match(tonight,/tonightStops\(s\)/,'Tonight renders from the same stop list');
 assert.doesNotMatch(tonight,/const off = /,'Tonight no longer re-derives the continue offset');
});

test('case 1b: Menu is Tonight\'s door to the lessons on file - the lamp on the next one to watch - and Tonight names it in one chip',()=>{
 const {tvKey,TONIGHT_MENU,unitsFocus}=keys();
 const {LESSONS}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const maths=LESSONS.filter((l)=>l.subject==='maths');
 assert.deepEqual(tvKey(session({screen:'tonight',focus:1}),'menu',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'units',focus:0}],'nothing watched: the first lesson');
 const watched=[{at:1,kind:'lesson',label:maths[0].title,detail:'watched',ref:maths[0].id}];
 assert.equal(unitsFocus(session({history:watched})),1);
 assert.deepEqual(tvKey(session({screen:'tonight',pages:[page()],history:watched}),'menu',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'units',focus:1}],'the next lesson, with the continue card up too');
 assert.deepEqual(tvKey(session({screen:'tonight',subject:'english'}),'menu',LOCAL).events,[],'Linga\'s Tonight is Linga\'s');
 assert.deepEqual(tvKey(session({screen:'units',focus:0}),'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}],'and Back comes home');
 const mtv=fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8'),tonight=mtv.split('export function Tonight')[1].split('\nexport function')[0];
 assert.match(tonight,/menu=\{TONIGHT_MENU\}/,'Tonight carries the one label');assert.equal(TONIGHT_MENU,'Lessons');
 const units=mtv.split('export function Units')[1].split('\nexport function')[0];
 assert.doesNotMatch(units+fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8'),/Tonight(’|&apos;|')s units/,'the list is not "tonight\'s"');
 assert.match(units,/lessonStates\(list, s\.history\)/,'Units ticks from the learner\'s history');
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

test('case 6: keyOf maps the keyboard to the remote, and Play is the clock except on the lesson (and the landing, nav 6)',()=>{
 const {keyOf,tvKey}=keys();
 const want={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'select',Backspace:'back',Escape:'back',m:'menu',M:'menu',' ':'play'};
 for(const [k,v] of Object.entries(want))assert.equal(keyOf(k),v,k);
 for(const k of ['a','Tab','Shift','Delete','PageDown','x','0',''])assert.equal(keyOf(k),null,k);
 for(const screen of ['tonight','page','hint','topics','walk','recap','break']){
  assert.deepEqual(tvKey(session({screen}),'play',LOCAL).events,[{type:'timer.start'}],screen);
  assert.deepEqual(tvKey(session({screen,timer:{running:true,left:10,phase:'work'}}),'play',LOCAL).events,[{type:'timer.pause'}],screen);
 }
 assert.deepEqual(tvKey(session({screen:'lesson',lessonPaused:false,lesson:{id:'l',title:'L',t:0,text:'',why:''}}),'play',LOCAL).events,[{type:'lesson.pause',paused:true}]);
 assert.deepEqual(tvKey(session({screen:'lesson',lessonPaused:true,lesson:{id:'l',title:'L',t:0,text:'',why:''}}),'play',LOCAL).events,[{type:'lesson.pause',paused:false}]);
});

test('maths 1: mathsOwns names Math Buddy\'s screens, the shared ones only while maths is on them, and the TV routes them to their own module',()=>{
 const {mathsOwns,lingaOwns,essayOwns,MATHS_SCREENS}=keys();
 assert.deepEqual([...MATHS_SCREENS],['tonight','topics','practice','sheet','walk','calendar']);
 for(const screen of SCREENS)for(const subject of ['maths','english','essay']){
  const s=session({screen,subject,pages:[page(subject)]});
  const want=!lingaOwns(s)&&(MATHS_SCREENS.includes(screen)||(['page','hint','units','lesson'].includes(screen)&&subject==='maths'));
  assert.equal(mathsOwns(s),want,`${screen}/${subject}`);
  assert.ok(!(mathsOwns(s)&&(lingaOwns(s)||essayOwns(s))),`${screen}/${subject} has one owner`);
 }
 assert.equal(mathsOwns(session({screen:'page',subject:'english',pages:[page('maths')]})),true,'the page decides a page screen, not the subject');
 for(const screen of ['landing','pair','joined','learner','profile','break','recap'])assert.equal(mathsOwns(session({screen})),false,`${screen} stays in the shell`);
 const tv=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');
 assert.match(tv,/mathsOwns\(s\)/,'page.tsx asks the keymap');assert.match(tv,/@\/maths\/MathsTV/);
 const screens=fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8');
 for(const n of ['Tonight','Topics','PracticeScreen','Sheet','Walk','Calendar'])assert.doesNotMatch(screens,new RegExp(`export function ${n}\\b`),`${n} left the shared screens`);
});

// ---- Essay Master (essay/EssayTV.tsx): the lens home, one sentence at a time, the playbook, the x-ray ----
const {PLAYBOOK}=require(path.join(root,'src/lib/library/lessons.data.ts'));
const TEXTS=['Many students arrive at school exhausted.','Research found the body clock shifts later.','An early start therefore cuts into sleep.','Of course, teenagers just stay up on their phones, so it is their own fault.','Schools that moved the start saw attendance rise.','A later start is a way of teaching them when they can learn.'];
const reading=(verdicts,type='argument')=>({text:TEXTS.join(' '),type,summary:'s',stats:{sentences:6},
 sentences:TEXTS.map((text,i)=>({n:i+1,text,words:text.split(' ').length,connectors:[],role:['claim','evidence','link'][i%3]})),verdicts});
const SIXV=[{n:1,verdict:'strong',note:'clear'},{n:3,verdict:'neutral',note:''},{n:4,verdict:'faulty',note:'other side',fix:{move:'Concede, then turn it back',pattern:'Although [the other side], [why your claim still holds].'}},{n:6,verdict:'faulty',note:'x'}];
const essay=(patch={})=>session({subject:'essay',essay:reading(SIXV),essayAt:null,...patch});
const at=(s,step)=>{const e=step.events.filter(x=>x.type==='essay.at');return e.length?e.at(-1).n:undefined;};

test('essay 1: essayOwns names exactly the four Essay Master screens, and the TV routes them to their own module',()=>{
 const {essayOwns,ESSAY_SCREENS}=keys();
 assert.deepEqual([...ESSAY_SCREENS],['essaytype','forensic','playbook','xray']);
 for(const screen of SCREENS)assert.equal(essayOwns(session({screen,subject:'essay'})),ESSAY_SCREENS.includes(screen),screen);
 const page=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');
 assert.match(page,/essayOwns\(s\)/,'page.tsx asks the keymap, not a list of its own');
 assert.match(page,/@\/essay\/EssayTV/);
 const screens=fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8');
 for(const n of ['EssayType','Forensic','Playbook','Xray'])assert.doesNotMatch(screens,new RegExp(`export function ${n}\\b`),`${n} left the shared screens`);
});

test('essay 2: the lens home is four lenses top to bottom, and Right reaches the last paragraph only when there is one',()=>{
 const {tvKey,lensStops}=keys();
 assert.equal(lensStops(session({screen:'essaytype'})).length,4,'nothing read: no card to reach');
 assert.deepEqual(lensStops(essay({screen:'essaytype'})).at(-1),'last');
 const first=session({screen:'essaytype',subject:'essay',focus:0});
 assert.equal(focusAfter(first,tvKey(first,'down',LOCAL)),1);
 assert.equal(focusAfter(first,tvKey(first,'up',LOCAL)),0,'Up on the first lens stays');
 const bottom=session({screen:'essaytype',subject:'essay',focus:3});
 assert.equal(focusAfter(bottom,tvKey(bottom,'down',LOCAL)),3,'Down on the last lens never reaches the card');
 assert.deepEqual(tvKey(bottom,'right',LOCAL).events,[],'no card without a reading');
 const s=essay({screen:'essaytype',focus:2});
 assert.equal(focusAfter(s,tvKey(s,'right',LOCAL)),4);
 const card=essay({screen:'essaytype',focus:4});
 assert.equal(focusAfter(card,tvKey(card,'left',LOCAL)),ESSAY_TYPES.findIndex(t=>t.id==='argument'),'Left from the card lands on the lens it was read through');
 assert.deepEqual(tvKey(card,'select',LOCAL).events,[{type:'essay.at',n:null},{type:'nav',screen:'forensic',focus:0}],'the card opens its reading on the first faulty sentence');
 assert.deepEqual(tvKey(card,'down',LOCAL).events,[],'Up/Down do nothing on the card');
 assert.deepEqual(tvKey(s,'menu',LOCAL).events,[{type:'nav',screen:'playbook',focus:0,from:'essaytype'}]);
 assert.deepEqual(tvKey(s,'back',LOCAL).events,[{type:'nav',screen:'landing',focus:2}],'Back leaves the app for the landing, on Essay Master');
});

test('essay 3: the forensic page opens on the first faulty sentence, and Up/Down walk the paragraph, clamped',()=>{
 const {tvKey,forensicAt}=keys();
 assert.equal(forensicAt(essay({screen:'forensic'})),3,'sentence 4 is the first faulty one');
 assert.equal(forensicAt(essay({screen:'forensic',essayAt:2})),1,'a walked-to sentence wins');
 assert.equal(forensicAt(essay({screen:'forensic',essayAt:99})),3,'a number the paragraph lacks is the default');
 assert.equal(forensicAt(session({subject:'essay',essay:reading([{n:2,verdict:'strong',note:'x'}])})),0,'no faulty sentence: the first');
 assert.equal(forensicAt(session({essay:null})),0);
 const s=essay({screen:'forensic',focus:0});
 assert.equal(at(s,tvKey(s,'down',LOCAL)),5);assert.equal(at(s,tvKey(s,'up',LOCAL)),3);
 assert.deepEqual(tvKey(essay({screen:'forensic',essayAt:1}),'up',LOCAL).events,[],'Up on sentence 1 stays');
 assert.deepEqual(tvKey(essay({screen:'forensic',essayAt:6}),'down',LOCAL).events,[],'Down on the last sentence stays');
 assert.ok(tvKey(s,'down',LOCAL).events.every(e=>e.type==='essay.at'),'walking the paragraph never moves the action focus');
});

test('essay 4: Left/Right walk the four actions, and each action does its one thing',()=>{
 const {tvKey,FORENSIC_STOPS,rewriteStatus,PLAYBOOK_STOPS}=keys();
 assert.deepEqual([...FORENSIC_STOPS],['rewrite','why','next','back']);
 const f=(focus,patch={})=>essay({screen:'forensic',focus,...patch});
 assert.equal(focusAfter(f(0),tvKey(f(0),'right',LOCAL)),1);assert.equal(focusAfter(f(0),tvKey(f(0),'left',LOCAL)),0);
 assert.equal(focusAfter(f(3),tvKey(f(3),'right',LOCAL)),3,'Right on the last action stays');
 assert.deepEqual(tvKey(f(0),'select',LOCAL).events,[{type:'status',text:rewriteStatus(4)}],'Rewrite on my phone names the sentence on screen');
 assert.doesNotMatch(rewriteStatus(4),/Although|Concede/,'the status never carries a rewrite');
 const why=tvKey(f(1),'select',LOCAL).events;
 assert.deepEqual(why,[{type:'nav',screen:'playbook',focus:PLAYBOOK_STOPS.findIndex(p=>p.id==='thesis'),from:'forensic'}],'Why this matters opens the lesson the lens teaches through');
 assert.deepEqual(tvKey(f(1,{essay:reading(SIXV,'structure')}),'select',LOCAL).events[0].focus,PLAYBOOK.findIndex(p=>p.id==='para'));
 assert.equal(at(f(2),tvKey(f(2),'select',LOCAL)),5,'Next sentence');
 assert.equal(at(f(2,{essayAt:6}),tvKey(f(2,{essayAt:6}),'select',LOCAL)),1,'Next sentence from the last goes round to the first');
 assert.deepEqual(tvKey(f(3),'select',LOCAL).events,[{type:'nav',screen:'essaytype',focus:1}],'Back to the paragraph returns to the lens home, on the lens it was read through');
 assert.deepEqual(tvKey(f(2),'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:1}]);
});

test('essay 4b: a rewrite that holds hands focus to Next sentence while another sentence is faulty; one still faulty keeps it on Rewrite',()=>{
 const {focusAfterRewrite,FORENSIC_STOPS}=keys();
 const fix={move:'Concede, then turn it back',pattern:'Although [the other side], [why your claim still holds].'};
 const was={text:'Some people say early starts teach discipline.',verdict:'faulty',fix};
 const after=(v4,v6)=>reading([{n:1,verdict:'strong',note:'clear'},{n:4,note:'x',was,...v4},{n:6,verdict:'faulty',note:'x',...v6}]);
 const next=FORENSIC_STOPS.indexOf('next');
 assert.equal(focusAfterRewrite(after({verdict:'strong'}),4,0),next,'holds, sentence 6 still faulty: Next sentence');
 assert.equal(focusAfterRewrite(after({verdict:'neutral'}),4,0),next,'a neutral re-reading holds too');
 assert.equal(focusAfterRewrite(after({verdict:'faulty',fix}),4,0),0,'still faulty: focus stays on Rewrite');
 assert.equal(focusAfterRewrite(after({verdict:'strong'},{verdict:'strong'}),4,0),0,'holds but nothing else faulty: focus stays');
 assert.equal(focusAfterRewrite(after({verdict:'strong'},{verdict:'strong'}),4,3),3,'... wherever it was');
 assert.equal(focusAfterRewrite(reading(SIXV),4,1),1,'no rewrite yet (no was): unchanged');
 const store=fs.readFileSync(path.join(root,'src/lib/session/store.ts'),'utf8');
 assert.match(store,/case "essay\.revised":[^\n]*\n\s+n\.focus = focusAfterRewrite\(e\.analysis, e\.n, s\.screen === "forensic" \? s\.focus : 0\)/,'the essay.revised reducer moves focus through the keymap\'s rule');
});

test('essay 5: Menu is the table; there Up/Down still walk, Select or Back close it, Left/Right do nothing',()=>{
 const {tvKey}=keys();
 const s=essay({screen:'forensic',focus:1}),T={...LOCAL,table:true};
 assert.deepEqual(tvKey(s,'menu',LOCAL),{events:[],calls:[],local:{table:true}});
 assert.deepEqual(tvKey(s,'menu',T).local,{table:false});
 assert.equal(at(s,tvKey(s,'down',T)),5);
 assert.deepEqual(tvKey(s,'right',T).events,[]);assert.deepEqual(tvKey(s,'left',T).events,[]);
 assert.deepEqual(tvKey(s,'select',T),{events:[],calls:[],local:{table:false}},'Select opens the focused row as the page');
 assert.deepEqual(tvKey(s,'back',T),{events:[],calls:[],local:{table:false}},'Back closes the table before it leaves');
 const none=session({screen:'forensic',subject:'essay',essay:null});
 for(const k of ['up','down','left','right','select'])assert.deepEqual(tvKey(none,k,LOCAL).events,[],`no reading: ${k} does nothing`);
 assert.deepEqual(tvKey(none,'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:0}]);
});

test('essay 6: the playbook is four structures top to bottom; the x-ray keeps its place; Back returns where it came from',()=>{
 const {tvKey,PLAYBOOK_STOPS}=keys();
 assert.deepEqual(PLAYBOOK_STOPS.map(p=>p.id),['thesis','para','order','concl']);
 const p=(focus,patch={})=>essay({screen:'playbook',focus,...patch});
 assert.equal(focusAfter(p(1),tvKey(p(1),'down',LOCAL)),2);assert.equal(focusAfter(p(3),tvKey(p(3),'down',LOCAL)),3);assert.equal(focusAfter(p(0),tvKey(p(0),'up',LOCAL)),0);
 assert.deepEqual(tvKey(p(1),'right',LOCAL).events,[],'no second column');
 assert.deepEqual(tvKey(p(2),'select',LOCAL).events,[{type:'nav',screen:'xray',focus:2}]);
 assert.deepEqual(tvKey(essay({screen:'xray',focus:2}),'back',LOCAL).events,[{type:'nav',screen:'playbook',focus:2}]);
 assert.deepEqual(tvKey(p(0,{back:'forensic'}),'back',LOCAL).events,[{type:'nav',screen:'forensic',focus:1}],'back to the page, on Why this matters');
 assert.deepEqual(tvKey(p(0,{back:'essaytype'}),'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:1}]);
 assert.deepEqual(tvKey(session({screen:'playbook',subject:'essay',back:'forensic'}),'menu',LOCAL).events,[{type:'nav',screen:'essaytype',focus:0}],'no reading: the lens home');
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

// ---- the landing (landing/LandingTV.tsx): the desk, the lamp resting on what was left, the place card, the phone ----
const LROWS=path.join(root,'src/tv/landingRows.ts');
const rows=()=>require(LROWS);
const JAKUB={id:'jakub',name:'Jakub',type:'other',modules:['english','essay']};
const EMA={id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']};
const noEnglish={preferences:null,notes:[],evidence:[],achievements:{},sessions:[],placement:null,plan:null,taught:[]};
const desk=(patch={})=>session({screen:'landing',focus:-1,profiles:[EMA,JAKUB],englishLearning:noEnglish,conversation:null,check:null,writing:{},...patch});
const marked={topic:'linear-two-step',marked:true,items:[{n:1,question:'2x + 3 = 11',studentAnswer:'x = 4',verdict:'right'},{n:2,question:'5x - 4 = 21',studentAnswer:'x = 3',verdict:'wrong',slip:'arithmetic-slip'},{n:3,question:'3x + 7 = 1',verdict:'unsure'}]};
const talk={id:'c1',learnerId:'jakub',sceneId:'interview',title:'Beyond the rehearsed answer',goal:'g',partner:'Jordan · Interviewer',focusSkill:'narrate',preferences:{level:'C1'},
 turns:[{id:'t1',role:'partner',text:'Tell me about a project.'},{id:'t2',role:'learner',text:'I led one.'},{id:'t3',role:'partner',text:'What did you change?'}],coaching:null,moment:null,moments:[],phase:'conversation',pending:null,error:'',paused:true,capture:false,captureAt:0,audioNonce:0,supported:false,cue:'',quizOpen:false,commands:[],evidence:[],startedAt:Date.UTC(2026,8,20)};
const readIt={at:Date.UTC(2026,8,21),kind:'writing',label:'Argument',detail:'1 of 6 sentences to fix'};

test('landing 1: the stops are the apps on the profile, left to right, then the place card, then the phone while unpaired',()=>{
 const {landingStops}=rows();
 assert.deepEqual(landingStops(desk()),['maths','english','essay','place']);
 assert.deepEqual(landingStops(desk({joined:false})),['maths','english','essay','place','phone']);
 assert.deepEqual(landingStops(desk({learner:{id:'jakub',name:'Jakub'}})),['english','essay','place'],'only the apps on Jakub\'s profile');
 assert.deepEqual(landingStops(desk({profiles:[{...EMA,modules:['essay','maths']}]})),['maths','essay','place'],'the desk keeps its left-to-right order whatever order the profile lists');
 assert.deepEqual(landingStops(desk({profiles:[{...EMA,modules:[]}],joined:false})),['place','phone']);
 const {LANDING_STOPS}=keys();assert.equal(LANDING_STOPS,undefined,'no fixed stop list with a Continue button is left');
});

test('landing 2: the lamp rests on what was left - marked, then resume, then next, then last - and only the learner\'s own',()=>{
 const {continueStop,landingAt,deskWaiting}=rows();
 assert.deepEqual(continueStop(desk()),{app:'maths',tagged:false},'nothing waiting anywhere: no tag, the lamp on the first app');
 assert.deepEqual(continueStop(desk({practice:marked,history:[readIt]})),{app:'maths',tagged:true},'a marked set beats a reading');
 assert.deepEqual(continueStop(desk({history:[readIt]})),{app:'essay',tagged:true},'the last reading, when nothing asks more');
 const jakub=desk({learner:{id:'jakub',name:'Jakub'},conversation:talk,history:[readIt]});
 assert.deepEqual(continueStop(jakub),{app:'english',tagged:true},'a conversation left mid-way beats the last reading');
 assert.equal(landingAt(jakub),0);assert.equal(landingAt({...jakub,focus:1}),1,'a named stop is kept');
 assert.equal(continueStop(desk({conversation:talk})).app,'maths','Jakub\'s conversation is not Ema\'s');
 assert.equal(landingAt(desk({practice:marked})),0);assert.equal(landingAt(desk({history:[readIt]})),2);
 const w=deskWaiting(desk({practice:marked}));
 assert.deepEqual(w.map(x=>x.kind),['marked','none','none']);
 assert.deepEqual(w[0].lines.map(l=>[l.n,l.question,l.answer,l.verdict]),[[1,'2x + 3 = 11','x = 4','right'],[2,'5x - 4 = 21','x = 3','wrong'],[3,'3x + 7 = 1',undefined,'unsure']],'the sheet is the real set, verdicts and all');
 assert.deepEqual([w[0].right,w[0].of],[1,3]);
 const blank=deskWaiting(desk());
 assert.deepEqual([blank[0].lines,blank[0].empty],[[],'Not started'],'an empty desk: a blank sheet, never an invented equation');
 assert.equal(blank[1].empty,'Not started');assert.equal(blank[1].art,'check','Linga before a level: its own open door');
 assert.deepEqual([blank[2].empty,blank[2].rail],['Nothing read',null]);
 const r=deskWaiting(jakub);assert.deepEqual([r[0].kind,r[0].art,r[0].partner,r[0].midway],['resume','interview','Jordan · Interviewer',true],'the scene of the conversation left mid-way');
});

test('landing 3: the D-pad moves the lamp between the objects, and Select opens what is lit',()=>{
 const {tvKey}=keys();
 const at=(focus,patch={})=>desk({focus,...patch});
 assert.equal(focusAfter(at(0),tvKey(at(0),'right',LOCAL)),1);assert.equal(focusAfter(at(2),tvKey(at(2),'right',LOCAL)),2,'Right on the last app stays');
 assert.equal(focusAfter(at(0),tvKey(at(0),'left',LOCAL)),0);
 assert.equal(focusAfter(at(1),tvKey(at(1),'up',LOCAL)),3,'Up is the place card');
 assert.equal(focusAfter(at(3),tvKey(at(3),'down',LOCAL)),1,'Down from the place card is the app under it');
 assert.deepEqual(tvKey(at(3),'left',LOCAL).events,[]);
 assert.deepEqual(tvKey(at(1),'down',LOCAL).events,[],'a paired phone is not a stop');
 const fresh=(f)=>at(f,{joined:false});
 assert.equal(focusAfter(fresh(0),tvKey(fresh(0),'down',LOCAL)),4,'Down reaches the unpaired phone');
 assert.equal(focusAfter(fresh(4),tvKey(fresh(4),'up',LOCAL)),2);
 assert.deepEqual(tvKey(fresh(4),'select',LOCAL).events,[{type:'nav',screen:'pair',focus:0,from:'landing'}],'the phone opens the pairing screen');
 for(const [f,sub,home] of [[0,'maths','tonight'],[1,'english','linga'],[2,'essay','essaytype']])
  assert.deepEqual(tvKey(at(f),'select',LOCAL).events,[{type:'subject',subject:sub},{type:'nav',screen:home,focus:0}],sub);
 assert.deepEqual(tvKey(at(3),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}],'the place card hands the desk to someone else');
 const rest=desk({focus:-1,history:[readIt]});
 assert.deepEqual(tvKey(rest,'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'nav',screen:'essaytype',focus:0}],'at rest Select opens the CONTINUE object');
 assert.equal(focusAfter(rest,tvKey(rest,'left',LOCAL)),1,'at rest the arrows move from the CONTINUE object');
 assert.equal(focusAfter(at(3,{history:[readIt]}),tvKey(at(3,{history:[readIt]}),'back',LOCAL)),2,'Back brings the lamp home to the CONTINUE object');
 const j=(f)=>desk({focus:f,learner:{id:'jakub',name:'Jakub'}});
 assert.equal(focusAfter(j(1),tvKey(j(1),'right',LOCAL)),1,'Jakub has two apps');assert.equal(focusAfter(j(2),tvKey(j(2),'down',LOCAL)),0);
 assert.deepEqual(tvKey(j(0),'select',LOCAL).events,[{type:'subject',subject:'english'},{type:'nav',screen:'linga',focus:0}]);
});

test('landing 4: Back from each app, the switcher and the pairing screen lands on the object it came from',()=>{
 const {tvKey}=keys();
 assert.deepEqual(tvKey(session({screen:'tonight'}),'back',LOCAL).events,[{type:'nav',screen:'landing',focus:0}],'Math Buddy -> the sheet');
 assert.deepEqual(tvKey(session({screen:'essaytype',subject:'essay',profiles:[EMA,JAKUB],learner:{id:'jakub',name:'Jakub'}}),'back',LOCAL).events,[{type:'nav',screen:'landing',focus:1}],'Jakub\'s essay card is his second object');
 assert.deepEqual(tvKey(session({screen:'learner',back:'landing'}),'back',LOCAL).events,[{type:'nav',screen:'landing',focus:3}],'the switcher -> the place card');
 assert.deepEqual(tvKey(session({screen:'learner',back:'tonight'}),'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}]);
 assert.deepEqual(tvKey(session({screen:'pair',back:'landing',joined:false}),'back',LOCAL).events,[{type:'nav',screen:'landing',focus:4}],'pairing -> the phone');
 assert.deepEqual(tvKey(session({screen:'pair',back:'profile',joined:false}),'back',LOCAL).events,[{type:'nav',screen:'profile',focus:0}]);
 const linga=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.match(linga,/screen:"landing",focus:landingFocus\(s,"english"\)/,'Linga\'s home Back lands on Linga\'s card');
 const {landingFocus}=rows();assert.equal(landingFocus(desk({learner:{id:'jakub',name:'Jakub'}}),'english'),0);assert.equal(landingFocus(desk(),'english'),1);
 assert.equal(landingFocus(desk({learner:{id:'jakub',name:'Jakub'}}),'maths'),-1,'an app not on the desk: the lamp rests');
 const store=fs.readFileSync(path.join(root,'src/lib/session/store.ts'),'utf8');
 assert.match(store,/e\.focus \?\? \(e\.screen === "landing" \? LANDING_REST : 0\)/,'a nav to the landing without a stop rests the lamp');
 assert.match(store,/screen: "landing", focus: LANDING_REST/,'a fresh desk starts at rest');
 const tv=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');assert.match(tv,/@\/landing\/LandingTV/,'the TV routes the landing to its own module');
 assert.doesNotMatch(fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8'),/export function Landing\b/,'the On Air landing is gone');
});

test('landing 5 (S34 T5): with nothing waiting and no phone paired the lamp rests on the phone; paired, on the first app as before',()=>{
 const {landingAt,landingStops,restStop}=rows();const {tvKey}=keys();
 const unpaired=desk({joined:false});
 assert.equal(landingStops(unpaired)[landingAt(unpaired)],'phone','a fresh, unpaired desk: the lamp is on the phone');
 assert.equal(restStop(unpaired),4);
 assert.equal(landingAt(desk()),0,'paired, nothing waiting: the first app, unchanged');
 assert.equal(landingAt(desk({joined:false,history:[readIt]})),2,'something waiting beats the phone: the CONTINUE object');
 assert.equal(landingAt(desk({joined:false,focus:1})),1,'a named stop is kept');
 assert.equal(focusAfter(desk({joined:false,focus:0}),tvKey(desk({joined:false,focus:0}),'back',LOCAL)),4,'Back on the desk goes home to the phone while nothing is waiting');
 const none=desk({joined:false,learner:null});
 assert.equal(landingStops(none)[landingAt(none)],'phone','a desk no one sits at yet rests on the phone too');
 assert.equal(landingAt(desk({learner:null})),0,'...and paired, on the first app');
 const doc=fs.readFileSync(path.join(root,'../docs/DESIGN-STUDY-DESK.md'),'utf8');
 assert.match(doc,/no phone paired and nothing waiting[^.]*lamp rests on the phone/i,'the design doc says where the lamp rests on an unpaired desk');
});

test('landing 6 (S34 T4): a desk with no one at it - every app is on it, empty, and any Select asks who is at the desk first',()=>{
 const {landingStops,deskWaiting}=rows();const {tvKey}=keys();
 const none=(patch={})=>desk({learner:null,...patch});
 assert.deepEqual(landingStops(none()),['maths','english','essay','place'],'no profile to read: all three apps lie on the desk');
 assert.deepEqual(deskWaiting(none()).map(w=>w.empty),['Not started','Not started','Nothing read'],'no one\'s work: each object says so in two words');
 for(const f of [0,1,2])assert.deepEqual(tvKey(none({focus:f}),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}],'an app opens the learner switcher first, never the app');
 assert.deepEqual(tvKey(none({focus:3}),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}],'the place card opens the switcher');
 {const m=tvKey(none({focus:0}),'menu',LOCAL);assert.deepEqual([m.events,m.calls],[[],[]],'no one\'s evening to end');}
 const card=fs.readFileSync(path.join(root,'src/landing/LandingTV.tsx'),'utf8');
 assert.match(card,/s\.learner \? `\$\{s\.learner\.name\}’s desk` : "Whose desk\?"/,'the place card invites when no one sits at the desk');
});

test('GUARD: the landing rows stay free of the filesystem-backed session modules',()=>{
 const out=ts.transpileModule(fs.readFileSync(LROWS,'utf8'),opts).outputText;
 assert.doesNotMatch(out,/require\([^)]*lib\/session\/(store|learners)/);
 rows();assert.ok(!Object.keys(require.cache).some(k=>/session[\\/](store|learners)\.ts$/.test(k)),'loading the landing rows pulled the store in');
});

// ---- T14: navigation oddities read from the code ----
test('nav 1 (T14): Back on the learner switcher never returns to a profile screen it was left from - the loop Profile > Pair > Profile > switcher',()=>{
 const {tvKey}=keys();
 // the switcher's Menu edits a profile, the profile's Menu opens the pair screen (back = profile), Back from there and from the profile: the switcher still holds back = profile
 assert.deepEqual(tvKey(session({screen:'learner',back:'profile'}),'back',LOCAL).events,[{type:'nav',screen:'landing',focus:3}],'the desk, the lamp on the place card');
 for(const back of ['pair','essaytype','forensic'])assert.equal(tvKey(session({screen:'learner',back}),'back',LOCAL).events[0].screen,'landing',back);
 assert.deepEqual(tvKey(session({screen:'learner',back:'tonight'}),'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}],'opened from Tonight, Back is Tonight');
});

test('nav 2 (T14): Back from an Essay Master page or its units is Essay Master\'s home, never Math Buddy\'s Tonight',()=>{
 const {tvKey}=keys();
 const essayPage=session({screen:'page',subject:'essay',pages:[page('essay')]});
 assert.deepEqual(tvKey(essayPage,'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:0}]);
 assert.deepEqual(tvKey(essayPage,'left',LOCAL).events,[{type:'nav',screen:'essaytype',focus:0}],'Left off the first page too');
 assert.deepEqual(tvKey(session({screen:'page',subject:'essay'}),'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:0}],'no page left');
 for(const k of ['back','left'])assert.deepEqual(tvKey(session({screen:'units',subject:'essay'}),k,LOCAL).events,[{type:'nav',screen:'essaytype',focus:0}],k);
 assert.deepEqual(tvKey(session({screen:'page',pages:[page()]}),'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}],'a maths page still goes to Tonight');
 assert.deepEqual(tvKey(session({screen:'units'}),'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}],'maths units still go to Tonight');
});

test('nav 3 (T14): Back always works on a page being read - it leaves the screen; the other keys wait for the read',()=>{
 const {tvKey}=keys();
 const reading=session({screen:'page',pages:[page()],reading:true});
 assert.deepEqual(tvKey(reading,'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}]);
 for(const k of ['up','down','right','select','menu'])assert.deepEqual(tvKey(reading,k,LOCAL).events,[],k);
});

test('nav 4 (T14): Back from Sentence help goes back to Linga, not to the English units',()=>{
 const {tvKey}=keys();
 assert.deepEqual(tvKey(session({screen:'sentence',subject:'english'}),'back',LOCAL).events,[{type:'nav',screen:'linga',focus:0}]);
});

test('nav 5 (T14): Back from a lesson with no hint lands Units on the unit that was playing',()=>{
 const {tvKey,unitStops}=keys();
 const s=session({screen:'units'}),units=unitStops(s);
 for(const ix of [0,2,units.length-1]){
  const l=units[ix],lesson={id:l.id,title:l.title,t:0,text:'',why:''};
  assert.deepEqual(tvKey(session({screen:'lesson',lesson}),'back',LOCAL).events,[{type:'nav',screen:'units',focus:ix}],l.id);
 }
 const hint={stage:1};
 assert.deepEqual(tvKey(session({screen:'lesson',hint,lesson:{id:units[0].id,title:'',t:0,text:'',why:''}}),'back',LOCAL).events,[{type:'nav',screen:'hint',focus:1}],'with a hint up, Back is the hint on its lesson stop');
});

test('nav 6 (T14): Play/Pause on the landing does nothing - the desk draws no clock',()=>{
 const {tvKey}=keys();
 for(const timer of [{running:false,left:1500,phase:'work'},{running:true,left:10,phase:'work'}]){const r=tvKey(session({screen:'landing',timer}),'play',LOCAL);assert.deepEqual([r.events,r.calls],[[],[]]);}
});

test('nav 7 (T14): no stale focus comment on the profile screen, no unused shownTasks',()=>{
 assert.doesNotMatch(fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8'),/Focus: 0-2 the type of student/);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'src/tv/profileRows.ts'),'utf8'),/shownTasks/);
});

test('course lessons 1: Units and the Calendar list the lessons of the learner\'s path - the school list as today, none on Calculus 1',()=>{
 const {tvKey,unitStops,calendarStops,unitsFocus,lessonsOn}=keys();
 const {LESSONS}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const SCHOOL=['jWpiMu5LNdg','bAerID24QJ0','qsL_5Y8uWPU','D3a8NnpQ2vU','u1SAo2GiX8A','2ZzuZvz33X0','uzyd_mIJaoc','V7H1oUHXPkg'];
 const calc=(patch={})=>session({profiles:[{id:'ema',name:'Ema',type:'other',age:19,system:'uk',modules:['maths'],mathPath:'calc1'}],...patch});
 assert.equal(typeof lessonsOn,'function','the lesson filter by path is one helper in tv/keys.ts');
 assert.deepEqual(lessonsOn('maths','school').map(l=>l.id),SCHOOL,'the school path lists what it lists today, in order');
 assert.deepEqual(lessonsOn('maths','calc1'),[],'no Calculus lesson library, none invented');
 assert.deepEqual(lessonsOn('english','calc1').map(l=>l.id),LESSONS.filter(l=>l.subject==='english').map(l=>l.id),'a path is a maths thing: other modules keep their units');
 const extra=[...LESSONS,{id:'c1',subject:'maths',unit:1,title:'Limits',minutes:5,concepts:[],path:'calc1'}];
 assert.deepEqual(lessonsOn('maths','calc1',extra).map(l=>l.id),['c1'],'a lesson tagged with a path is that path\'s only');
 assert.deepEqual(lessonsOn('maths','school',extra).map(l=>l.id),SCHOOL);
 // the stop lists take the session
 assert.deepEqual(unitStops(session()).map(l=>l.id),SCHOOL);assert.deepEqual(calendarStops(session()).map(l=>l.id),SCHOOL);
 assert.deepEqual(unitStops(calc()),[]);assert.deepEqual(calendarStops(calc()),[]);
 assert.deepEqual(unitStops(session({subject:'english'})).map(l=>l.id),LESSONS.filter(l=>l.subject==='english').map(l=>l.id));
 assert.equal(unitsFocus(calc()),0);
 // the empty lists hold no focusable item, and Back still works
 // (Play is the clock's key on every screen, not a stop, so it is not asked here)
 for(const k of ['up','down','right','select'])assert.deepEqual(tvKey(calc({screen:'units'}),k,LOCAL).events,[],`units ${k}`);
 assert.deepEqual(tvKey(calc({screen:'units'}),'left',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}],'Left on Units is Back, as on the school path');
 for(const k of ['up','down','left','right','select'])assert.deepEqual(tvKey(calc({screen:'calendar'}),k,LOCAL).events,[],`calendar ${k}`);
 assert.deepEqual(tvKey(calc({screen:'units'}),'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}]);
 assert.deepEqual(tvKey(calc({screen:'units'}),'menu',LOCAL).events,[{type:'nav',screen:'calendar',focus:0}]);
 assert.deepEqual(tvKey(calc({screen:'calendar'}),'back',LOCAL).events,[{type:'nav',screen:'units',focus:0}]);
 assert.deepEqual(tvKey(calc({screen:'tonight',focus:1}),'menu',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'units',focus:0}]);
 // the school path's keys, as before
 assert.deepEqual(tvKey(session({screen:'calendar',focus:0}),'right',LOCAL).events,[{type:'focus',focus:1}]);
 assert.equal(tvKey(session({screen:'units',focus:2}),'select',LOCAL).events.at(-1).screen,'lesson');
 // a comment-stripped scan: both stop lists take the session, and every caller hands it over
 const strip=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`\\])\/\/.*$/gm,'$1');
 const k=strip(fs.readFileSync(KEYS,'utf8')),tv=strip(fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8'));
 assert.match(k,/export function unitStops\(s: Session\)/);assert.match(k,/export function calendarStops\(s: Session\)/);
 for(const src of [k,tv,strip(fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8'))])assert.doesNotMatch(src,/(?:unitStops|calendarStops)\(\s*\)/,'no stop list asked without the session');
});

test('course lessons 2: the Math Buddy blurb speaks for either path - no "school maths"',()=>{
 const {MODULE_BLURB}=require(path.join(root,'src/tv/profileRows.ts'));
 assert.doesNotMatch(MODULE_BLURB.maths,/school maths/i);
 assert.match(MODULE_BLURB.maths,/never the answer/,'the promise stays');
 assert.ok(MODULE_BLURB.maths.split(/(?<=\.)\s/).length<=2,'short: at most two sentences');
});
