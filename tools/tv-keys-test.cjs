/**
 * The TV's D-pad as a pure keymap: keyOf, tvKey, the per-screen stop lists and the runStep
 * executor. Run with npm test in desk/ (directly: node tools/tv-keys-test.cjs). No session store is
 * loaded - sessions here are plain objects - and no route or model is called.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
const {transpile,options:opts}=require('./ts-load.cjs');
const KEYS=path.join(root,'src/tv/keys.ts'),ROWS=path.join(root,'src/tv/mathsRows.ts');
// loaded per test, so a missing module fails each case on its own
const keys=()=>require(KEYS);
const {SYLLABUS}=require(path.join(root,'src/lib/library/syllabus.ts'));
const {ESSAY_TYPES}=require(path.join(root,'src/lib/library/lessons.data.ts'));
const {profileRows,locate,flat,likelyIx}=require(path.join(root,'src/tv/profileRows.ts'));

const LOCAL={busy:false,table:false,hintInFlight:false};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
const page=(subject='maths')=>({id:'p1',subject,day:today(),title:'Sheet one',img:'',w:100,h:100,items:[{n:1,key:'k1',text:'x + 1 = 2',band:[0,10]},{n:2,key:'k2',text:'x + 2 = 5',band:[10,20]}]});
function session(patch={}){
 return {subject:'maths',screen:'landing',focus:0,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,
  learner:{id:'ema',name:'Ema'},profiles:[{id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']}],draft:null,
  timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,
  english:null,essay:null,practice:null,topic:null,walkIx:0,skills:{},history:[],log:{started:false,minutes:0,problems:[],hard:[],hints:0},...patch};
}
/** The focus a step leaves the screen on: the last focus event, or where it was. */
const focusAfter=(s,step)=>{const f=step.events.filter(e=>e.type==='focus');return f.length?f.at(-1).focus:s.focus;};
const SCREENS=(()=>{const src=fs.readFileSync(path.join(root,'src/lib/session/store.ts'),'utf8');const m=src.match(/export type Screen =([^;]+);/);return [...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);})();

test('case 1: Tonight has one stop list - continue card, homework, teach, and (a school path, W8) get ready for school - and Select on teach opens the topics',()=>{
 const {tvKey,tonightStops}=keys();
 const withCont=session({screen:'tonight',pages:[page()],focus:3});
 // Family W8: a learner on the school path has a third door, Get ready for school, after the two it always had
 assert.deepEqual(tonightStops(withCont),['continue','homework','teach','prepare']);
 assert.deepEqual(tonightStops(session({screen:'tonight'})),['homework','teach','prepare']);
 const r=tvKey(withCont,'right',LOCAL);
 assert.ok(r.events.every(e=>e.type!=='focus'||e.focus<=3),'Right on the last stop never moves past it');
 assert.equal(focusAfter(withCont,r),3);
 // a learner inside the path (12): Ema is 16, past the path's end, whose Topics open on the last topic (MB-B19)
 const young=(p={})=>session({profiles:[{...session().profiles[0],age:12}],...p});
 assert.deepEqual(tvKey({...young({screen:'tonight',pages:[page()]}),focus:2},'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'topics',focus:0}]);
 assert.deepEqual(tvKey(young({screen:'tonight',focus:1}),'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'topics',focus:0}]);
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

// v2 M1 (2026-10-07) moved this case to a topic with no worked lesson: a generated school unit is now taught first
// (tools/worked-rules-test.cjs pins that), and a linear topic still asks for its set at once, as this case always pinned.
test('case 3: Select on a topic asks for a set once, and a failed set gives Select back',async(t)=>{
 // every school unit has a worked lesson now (L1-owen-17-MB2-1): leave 'linear-one-step' without one for this test, to reach the no-lesson branch
 const WM=require(path.join(root,'src/lib/library/worked.ts')).WORKED_METHODS,WMsaved=WM['linear-one-step'];delete WM['linear-one-step'];t.after(()=>{WM['linear-one-step']=WMsaved;});
 const {tvKey,runStep}=keys();
 const L=SYLLABUS.findIndex(t=>t.id==='linear-one-step');assert(L>=0);
 const s=session({screen:'topics',focus:L});
 const step=tvKey(s,'select',{...LOCAL,busy:false});
 assert.deepEqual(step.events,[{type:'topic.open',topic:SYLLABUS[L].id}]);
 assert.deepEqual(step.calls,[{url:'/api/practice',body:{topic:SYLLABUS[L].id},onFail:{busy:false}}]);
 assert.deepEqual(step.local,{busy:true});
 const busy=tvKey(s,'select',{...LOCAL,busy:true});assert.deepEqual([busy.events,busy.calls],[[],[]],'a second Select while the set is written does nothing');
 let local={...LOCAL};const posted=[],called=[];let during;
 await runStep(step,{post:async e=>{posted.push(e);during=local.busy;},call:async(url,body)=>{called.push([url,body]);return {ok:false,status:500};},apply:p=>{local={...local,...p};}});
 assert.equal(during,true,'the wait is on screen while the set is asked for');
 assert.deepEqual(posted,[{type:'topic.open',topic:SYLLABUS[L].id}]);assert.equal(called.length,1);
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
 assert.deepEqual([...MATHS_SCREENS],['tonight','topics','prepare','practice','sheet','walk','calendar','worked'],'Family W8 adds Get ready for school; v2 M1 the worked lesson');
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

test('essay 1: essayOwns names exactly the Essay Master screens (the lenses, the Paragraph plan and, v2 T2, the Workroom), and the TV routes them to their own module',()=>{
 const {essayOwns,ESSAY_SCREENS}=keys();
 assert.deepEqual([...ESSAY_SCREENS],['essaytype','essayplan','forensic','playbook','xray','workroom']);
 for(const screen of SCREENS)assert.equal(essayOwns(session({screen,subject:'essay'})),ESSAY_SCREENS.includes(screen),screen);
 const page=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');
 assert.match(page,/essayOwns\(s\)/,'page.tsx asks the keymap, not a list of its own');
 assert.match(page,/@\/essay\/EssayTV/);
 const screens=fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8');
 for(const n of ['EssayType','Forensic','Playbook','Xray'])assert.doesNotMatch(screens,new RegExp(`export function ${n}\\b`),`${n} left the shared screens`);
});

test('essay 2: the lens home is four lenses top to bottom, and Right reaches the last paragraph only when there is one',()=>{
 const {tvKey,lensStops}=keys();
 assert.equal(lensStops(session({screen:'essaytype'})).length,6,'nothing read: the plan is the fifth stop, no card to reach, and Write from a prompt the sixth');
 assert.deepEqual(lensStops(essay({screen:'essaytype'})).slice(-2),['last','write']);
 const first=session({screen:'essaytype',subject:'essay',focus:0});
 assert.equal(focusAfter(first,tvKey(first,'down',LOCAL)),1);
 assert.equal(focusAfter(first,tvKey(first,'up',LOCAL)),0,'Up on the first lens stays');
 const bottom=session({screen:'essaytype',subject:'essay',focus:3});
 assert.equal(focusAfter(bottom,tvKey(bottom,'down',LOCAL)),4,'Down on the last lens reaches the plan, never the card');
 assert.deepEqual(tvKey(bottom,'right',LOCAL).events,[],'no card without a reading');
 const s=essay({screen:'essaytype',focus:2});
 assert.equal(focusAfter(s,tvKey(s,'right',LOCAL)),4);
 const card=essay({screen:'essaytype',focus:4});
 assert.equal(focusAfter(card,tvKey(card,'left',LOCAL)),ESSAY_TYPES.findIndex(t=>t.id==='argument'),'Left from the card lands on the lens it was read through');
 assert.deepEqual(tvKey(card,'select',LOCAL).events,[{type:'essay.at',n:null},{type:'nav',screen:'forensic',focus:0}],'the card opens its reading on the first faulty sentence');
 assert.deepEqual(tvKey(card,'up',LOCAL).events,[],'Up does nothing on the card; Down reaches Write from a prompt');
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
 assert.deepEqual(tvKey(f(0),'select',LOCAL).events,[{type:'status',text:rewriteStatus(4)},{type:'ask.open',kind:'rewrite',detail:{n:4}}],'Rewrite on my phone names the sentence on screen and opens its hand-off (TL-7)');
 assert.doesNotMatch(rewriteStatus(4),/Although|Concede/,'the status never carries a rewrite');
 const why=tvKey(f(1),'select',LOCAL).events;
 assert.deepEqual(why,[{type:'nav',screen:'playbook',focus:PLAYBOOK_STOPS.findIndex(p=>p.id==='thesis'),from:'forensic'}],'Why this matters opens the lesson the lens teaches through');
 assert.deepEqual(tvKey(f(1,{essay:reading(SIXV,'structure')}),'select',LOCAL).events[0].focus,PLAYBOOK.findIndex(p=>p.id==='para'));
 assert.equal(at(f(2),tvKey(f(2),'select',LOCAL)),6,'Next sentence: from 4 to the next faulty one, 6');
 assert.equal(at(f(2,{essayAt:6}),tvKey(f(2,{essayAt:6}),'select',LOCAL)),4,'Next sentence from the last faulty one goes round to the first faulty one');
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

test('essay 4c (L1-eliska-12-EM2-2): Next sentence goes to the next faulty sentence, wrapping; with no other faulty one it steps to n+1',()=>{
 const {tvKey}=keys();
 const two=reading([{n:2,verdict:'faulty',note:'x'},{n:5,verdict:'faulty',note:'x'}]);
 const f=(essayAt,e)=>essay({screen:'forensic',focus:2,essayAt,essay:e});
 assert.equal(at(f(1,two),tvKey(f(1,two),'select',LOCAL)),2,'from 1 to 2');
 assert.equal(at(f(2,two),tvKey(f(2,two),'select',LOCAL)),5,'from 2 to 5, skipping 3 and 4');
 assert.equal(at(f(5,two),tvKey(f(5,two),'select',LOCAL)),2,'from 5 wraps to 2');
 const one=reading([{n:3,verdict:'faulty',note:'x'}]);
 assert.equal(at(f(3,one),tvKey(f(3,one),'select',LOCAL)),4,'no other faulty sentence: n+1 as before');
 assert.equal(at(f(6,one),tvKey(f(6,one),'select',LOCAL)),3,'... wrapping: 6 goes to 3 as the only faulty one');
 const none=reading([{n:1,verdict:'strong',note:'x'}]);
 assert.equal(at(f(6,none),tvKey(f(6,none),'select',LOCAL)),1,'none faulty: n+1 wraps');
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
  const out=transpile(fs.readFileSync(file,'utf8'),opts).outputText;
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

test('landing 1: the stops are the apps on the profile, left to right, then the place card, then the phone - always (TL-3)',()=>{
 const {landingStops}=rows();
 assert.deepEqual(landingStops(desk()),['maths','english','essay','place','phone'],'paired: the phone stop stays; Essay Master is the one writing tile (2026-10-22: Writing is off the desk)');
 assert.deepEqual(landingStops(desk({joined:false})),['maths','english','essay','place','phone']);
 assert.deepEqual(landingStops(desk({learner:{id:'jakub',name:'Jakub'}})),['english','essay','place','phone'],'only the apps on Jakub\'s profile');
 assert.deepEqual(landingStops(desk({profiles:[{...EMA,modules:['essay','maths']}]})),['maths','essay','place','phone'],'the desk keeps its left-to-right order whatever order the profile lists');
 assert.deepEqual(landingStops(desk({profiles:[{...EMA,modules:['maths','english']}]})),['maths','english','place','phone'],'no Essay Master on the profile: no writing tile');
 assert.deepEqual(landingStops(desk({profiles:[{...EMA,modules:[]}],joined:false})),['place','phone']);
 const {LANDING_STOPS}=keys();assert.equal(LANDING_STOPS,undefined,'no fixed stop list with a Continue button is left');
});

test('TL-3: Select on the paired phone stop opens pair with the landing behind it; on pair, Down then Select forgets every phone',()=>{
 const {tvKey}=keys();
 const at=desk({focus:5});
 assert.deepEqual(tvKey(at,'select',LOCAL).events,[{type:'nav',screen:'pair',focus:0,from:'landing'}],'paired: the phone stop opens pair');
 const pair=desk({screen:'pair',focus:0,back:'landing'});
 assert.deepEqual(tvKey(pair,'select',LOCAL).events,[],'Pair another: the code is already up');
 assert.deepEqual(tvKey(pair,'down',LOCAL).events,[{type:'focus',focus:1}]);
 assert.deepEqual(tvKey({...pair,focus:1},'select',LOCAL).events,[{type:'phones.forget'}]);
 assert.deepEqual(tvKey({...pair,focus:1},'up',LOCAL).events,[{type:'focus',focus:0}]);
 // stick walk 2026-10-22: the two buttons stand side by side, so Right reaches Forget and Left comes back
 assert.deepEqual(tvKey(pair,'right',LOCAL).events,[{type:'focus',focus:1}],'Right: Forget every phone');
 assert.deepEqual(tvKey({...pair,focus:1},'left',LOCAL).events,[{type:'focus',focus:0}],'Left: Pair another');
 assert.deepEqual(tvKey({...pair,joined:false,focus:1},'select',LOCAL).events,[],'unpaired: no forget');
 assert.deepEqual(tvKey({...pair,focus:1},'back',LOCAL).events.map(e=>e.screen),['landing'],'Back still leaves');
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

test('landing rows: a waiting field stays only when a theme reads it',()=>{
 const src=fs.readFileSync(LROWS,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 for(const name of ['dots','ghosts'])assert.doesNotMatch(src,new RegExp(`\\b${name}\\b`),`${name} is written on the waiting object and no theme reads it`);
});

test('landing 3: the D-pad moves the lamp between the objects, and Select opens what is lit',()=>{
 const {tvKey}=keys();
 const at=(focus,patch={})=>desk({focus,...patch});
 assert.equal(focusAfter(at(0),tvKey(at(0),'right',LOCAL)),1);assert.equal(focusAfter(at(2),tvKey(at(2),'right',LOCAL)),2,'Right on the last app (Essay Master) stays');
 assert.equal(focusAfter(at(0),tvKey(at(0),'left',LOCAL)),0);
 assert.equal(focusAfter(at(1),tvKey(at(1),'down',LOCAL)),3,'Down is Someone else (the place)');
 assert.equal(focusAfter(at(3),tvKey(at(3),'up',LOCAL)),1,'Up from Someone else is the app above it');
 assert.deepEqual(tvKey(at(3),'left',LOCAL).events,[]);
 assert.equal(focusAfter(at(1),tvKey(at(1),'up',LOCAL)),4,'a paired phone is a stop too (TL-3)');
 const fresh=(f)=>at(f,{joined:false});
 assert.equal(focusAfter(fresh(0),tvKey(fresh(0),'up',LOCAL)),4,'Up reaches the unpaired phone (top right)');
 assert.equal(focusAfter(fresh(5),tvKey(fresh(4),'down',LOCAL)),2,'Down from the phone is the last app on the shelf');
 assert.deepEqual(tvKey(fresh(4),'select',LOCAL).events,[{type:'nav',screen:'pair',focus:0,from:'landing'}],'the phone opens the pairing screen');
 for(const [f,sub,home] of [[0,'maths','tonight'],[1,'english','linga'],[2,'essay','essaytype']])
  assert.deepEqual(tvKey(at(f),'select',LOCAL).events,[{type:'subject',subject:sub},{type:'nav',screen:home,focus:0}],sub);
 assert.deepEqual(tvKey(at(3),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}],'the place card hands the desk to someone else');
 const rest=desk({focus:-1,history:[readIt]});
 assert.deepEqual(tvKey(rest,'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'nav',screen:'essaytype',focus:1}],'at rest Select opens the CONTINUE object, the lamp on the lens last read (Argument)');
 assert.equal(focusAfter(rest,tvKey(rest,'left',LOCAL)),1,'at rest the arrows move from the CONTINUE object');
 assert.equal(focusAfter(at(3,{history:[readIt]}),tvKey(at(3,{history:[readIt]}),'back',LOCAL)),2,'Back brings the lamp home to the CONTINUE object');
 const j=(f)=>desk({focus:f,learner:{id:'jakub',name:'Jakub'}});
 assert.equal(focusAfter(j(0),tvKey(j(0),'right',LOCAL)),1,'Jakub has two apps');assert.equal(focusAfter(j(1),tvKey(j(1),'right',LOCAL)),1,'Right on his last app stays');assert.equal(focusAfter(j(2),tvKey(j(2),'up',LOCAL)),0,'Up from his place card: the middle of two objects');
 assert.deepEqual(tvKey(j(0),'select',LOCAL).events,[{type:'subject',subject:'english'},{type:'nav',screen:'linga',focus:0}]);
});

// ---- landing-B: Select opens what is waiting, through one helper Tonight's continue card and the recap share ----
const paper={topic:'linear-two-step',items:[{n:1,question:'2x + 3 = 11'},{n:2,question:'5x - 4 = 21'}]};
const snapped={id:'p1',subject:'maths',day:today(),title:'Sheet one',img:'',w:100,h:100,items:[{n:1,key:'k1',text:'x + 1 = 2',band:[0,10]}]};
const ownParagraph={type:'argument',text:'p',sentences:[{n:1,text:'Cats sleep.'},{n:2,text:'Dogs bark.'}],verdicts:[{n:1,verdict:'supports'},{n:2,verdict:'faulty'}],stats:{},summary:'It argues one way.'};
const MATHS_STATES=[
 ['a marked set',{practice:marked},[{type:'subject',subject:'maths'},{type:'nav',screen:'sheet',focus:1}]],
 ['a set on paper',{practice:paper},[{type:'subject',subject:'maths'},{type:'nav',screen:'practice',focus:0}]],
 ['a snapped page',{pages:[snapped]},[{type:'subject',subject:'maths'},{type:'page.select',pageIx:0},{type:'nav',screen:'page',focus:0}]],
];
test('landing-B 1-3: Select on Math Buddy opens the marked sheet, the set on paper or the snapped page, not Tonight',()=>{
 const {tvKey}=keys();
 for(const [name,patch,want] of MATHS_STATES)assert.deepEqual(tvKey(desk({focus:0,...patch}),'select',LOCAL).events,want,name);
 assert.equal(require(path.join(root,'src/tv/sheetRows.ts')).firstToLook(marked.items),1,'the marked set opens on the first slip to look at');
});
test('landing-B 4-5: Select on Essay Master opens the learner\'s paragraph, else the lens home on the lens last read',()=>{
 const {tvKey,LENS_STOPS}=keys();
 assert.deepEqual(tvKey(desk({focus:2,essay:ownParagraph,history:[readIt]}),'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'essay.at',n:null},{type:'nav',screen:'forensic',focus:0}],'the paragraph is on the desk: its forensic page');
 const lens=LENS_STOPS.findIndex(t=>t.id==='argument');assert.equal(lens,1);
 assert.deepEqual(tvKey(desk({focus:2,history:[readIt]}),'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'nav',screen:'essaytype',focus:lens}],'only the history line: the lamp on Argument, so a second Select starts the lens that was read');
});
test('landing-B 6: the landing and Tonight\'s continue card open the same screen on the same focus',()=>{
 const {tvKey}=keys();
 for(const [name,patch] of MATHS_STATES){
  const land=tvKey(desk({focus:0,...patch}),'select',LOCAL).events.filter(e=>e.type!=='subject');
  const tonight=tvKey(desk({screen:'tonight',focus:0,...patch}),'select',LOCAL).events.filter(e=>e.type!=='subject');
  assert.deepEqual(land,tonight,name);
 }
});
test('GUARD landing-B 7: nothing waiting, a Linga conversation left part way, no learner: Select opens the front door as before',()=>{
 const {tvKey}=keys();
 assert.deepEqual(tvKey(desk({focus:0}),'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'tonight',focus:0}]);
 assert.deepEqual(tvKey(desk({focus:0,learner:{id:'jakub',name:'Jakub'},conversation:talk}),'select',LOCAL).events,[{type:'subject',subject:'english'},{type:'nav',screen:'linga',focus:0}]);
 assert.deepEqual(tvKey(desk({focus:0,learner:null,practice:marked}),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}]);
 assert.deepEqual(tvKey(desk({focus:2}),'select',LOCAL).events,[{type:'subject',subject:'essay'},{type:'nav',screen:'essaytype',focus:0}],'no reading anywhere: the first lens');
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
});

test('landing 6 (S34 T4): a desk with no one at it - every app is on it, empty, and any Select asks who is at the desk first',()=>{
 const {landingStops,deskWaiting}=rows();const {tvKey}=keys();
 const none=(patch={})=>desk({learner:null,...patch});
 assert.deepEqual(landingStops(none()),['maths','english','essay','place','phone'],'no profile to read: all three apps lie on the desk');
 assert.deepEqual(deskWaiting(none()).map(w=>w.empty),['Not started','Not started','Nothing read'],'no one\'s work: each object says so in two words');
 for(const f of [0,1,2])assert.deepEqual(tvKey(none({focus:f}),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}],'an app opens the learner switcher first, never the app');
 assert.deepEqual(tvKey(none({focus:3}),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}],'the place card opens the switcher');
 {const m=tvKey(none({focus:0}),'menu',LOCAL);assert.deepEqual([m.events,m.calls],[[],[]],'no one\'s evening to end');}
 const {landingView}=require(path.join(root,'src/landing/model.ts'));
 {const v=landingView(none()),w=landingView(desk());assert.deepEqual([v.place,v.primary],['Choose who','Choose who is studying'],'the second action invites when no one sits at the desk');assert.deepEqual([w.place,w.primary],['Someone else','Start as Ema'],'and offers someone else when one does');}
});

test('GUARD: the landing rows stay free of the filesystem-backed session modules',()=>{
 const out=transpile(fs.readFileSync(LROWS,'utf8'),opts).outputText;
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

test('profile system: every blurb names its decimal convention, Save names the system it saves, the layout is unchanged',()=>{
 const {SYSTEM_BLURB,SYSTEMS,profileRows}=require(path.join(root,'src/tv/profileRows.ts'));
 for(const s of SYSTEMS)assert.match(SYSTEM_BLURB[s],s==='cz'||s==='de'?/0,5 is a half \(decimal comma\)\./:/0\.5 is a half \(decimal point\)\./,s);
 const save=(d)=>profileRows(d).at(-1).cells[0].blurb;
 assert.match(save({id:'p',name:'P',type:'high-school',age:16,modules:['maths']}),/United Kingdom/,'no system: says UK');
 assert.match(save({id:'p',name:'P',type:'high-school',age:16,modules:['maths']}),/pick a school system above/);
 assert.match(save({id:'p',name:'P',type:'high-school',age:16,system:'cz',modules:['maths']}),/Czech Republic \(0,5 is a half\)/);
 assert.doesNotMatch(save({id:'p',name:'P',type:'high-school',age:16,system:'cz',modules:['maths']}),/pick a school system/);
 const rows=profileRows({id:'p',name:'P',type:'high-school',age:16,modules:['maths']});
 assert.deepEqual(rows.map((r)=>r.cells.length),[1,3,5,3,4,3,rows[6].cells.length,2],'row and cell counts (the Name row first, the School year row under the age, no Mode row under 18)');
 assert.equal(rows.length,8);
});

test('course lessons 3:the landing card for Math Buddy says the same as the profile blurb - no "school maths" on either',()=>{
 // only the code lines that assign a blurb are read: a line comment may quote the old wording, a string may not
 const landing=fs.readFileSync(path.join(root,'src/tv/landingRows.ts'),'utf8').split('\n').filter((l)=>/^\s*(maths|english|essay):\s*"/.test(l)).join('\n');
 assert.doesNotMatch(landing,/school maths/i,'the landing blurb does not assume the school path');
 assert.match(landing,/maths: "Learn and practise maths on your own path, one step at a time\."/,'its first sentence is the profile blurb\'s first sentence');
});

// ---- Family W8: the third door, Get ready for school, and the step-up ask ----
const calcW8=(patch={})=>session({profiles:[{id:'ema',name:'Ema',type:'other',age:19,system:'uk',modules:['maths'],mathPath:'calc1'}],...patch});
const uk12=(patch={})=>session({profiles:[{id:'ema',name:'Ema',type:'elementary',age:12,system:'uk',modules:['maths']}],...patch});

test('W8 1: a school learner\'s Tonight has three doors, Left/Right walk them clamped, Select on the third opens Get ready for school; a Calculus learner keeps the two doors exactly',()=>{
 const {tvKey,tonightStops}=keys();
 const s=uk12({screen:'tonight',focus:0});
 assert.deepEqual(tonightStops(s),['homework','teach','prepare']);
 assert.deepEqual(tonightStops({...s,pages:[page()]}),['continue','homework','teach','prepare']);
 assert.deepEqual(tvKey({...s,focus:1},'right',LOCAL).events,[{type:'focus',focus:2}]);
 assert.deepEqual(tvKey({...s,focus:2},'right',LOCAL).events,[],'clamped at the third door');
 assert.deepEqual(tvKey({...s,focus:0},'left',LOCAL).events,[],'clamped at the first');
 const open=tvKey({...s,focus:2},'select',LOCAL);
 assert.deepEqual(open.events,[{type:'subject',subject:'maths'},{type:'nav',screen:'prepare',focus:0}]);
 assert.deepEqual(open.local,{prepareAsk:null},'the question starts closed');assert.deepEqual(open.calls,[]);
 // Up and Down as today
 assert.deepEqual(tvKey({...s,focus:2},'up',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'tonight'}]);
 assert.deepEqual(tvKey({...s,focus:2,joined:false},'down',LOCAL).events,[{type:'nav',screen:'paper',focus:0,from:'tonight'}],'TL-13: unpaired Down opens the paper, not the pair screen (pairing is on the landing)');
 // a Calculus learner: the two doors, byte for byte what they were, and no way to Get ready for school
 const c=calcW8({screen:'tonight',focus:1});
 assert.deepEqual(tonightStops(c),['homework','teach']);assert.deepEqual(tonightStops({...c,pages:[page()]}),['continue','homework','teach']);
 assert.deepEqual(tvKey(c,'right',LOCAL).events,[],'no third door to move to');
 assert.deepEqual(tvKey(c,'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'topics',focus:0}]);
 for(let f=0;f<3;f++)for(const k of ['select','left','right','up','down','back','menu'])assert.ok(tvKey(calcW8({screen:'tonight',focus:f}),k,LOCAL).events.every((e)=>e.type!=='nav'||e.screen!=='prepare'),`calc tonight ${f} ${k}`);
 // no profile is the school path, as learnerPath says
 assert.deepEqual(tonightStops(session({screen:'tonight',profiles:[],learner:null})),['homework','teach','prepare']);
});

test('W8 2: Get ready for school - Left/Right walk the units (clamped), Select asks "The usual" or "A step up", Back closes the question on the same unit, and Up/Back/Menu go home to this door',(t)=>{
 // every school unit has a worked lesson now (L1-owen-17-MB2-1): leave 'linear-one-step' without one for this test, to reach the no-lesson branch
 const WM=require(path.join(root,'src/lib/library/worked.ts')).WORKED_METHODS,WMsaved=WM['linear-one-step'];delete WM['linear-one-step'];t.after(()=>{WM['linear-one-step']=WMsaved;});
 const {tvKey}=keys();
 const {prepareStops}=require(path.join(root,'src/tv/prepareRows.ts'));
 const s=uk12({screen:'prepare',focus:0}),stops=prepareStops(s),N=stops.length;
 // a unit with no worked lesson (GR1, MB-B39): the question is the two cells this test pins; the lesson cell has its own test
 const {hasWorked}=require(path.join(root,'src/lib/library/worked.ts'));
 const U=stops.findIndex((u)=>!hasWorked(u.id));
 assert.ok(U>=0,'some school unit has no worked lesson');
 assert.equal(N,require(path.join(root,'src/lib/library/paths.ts')).PATHS.school.topics.length,'every school unit is a stop');
 assert.deepEqual(tvKey(s,'right',LOCAL).events,[{type:'focus',focus:1}]);
 assert.deepEqual(tvKey(s,'left',LOCAL).events,[],'clamped at the first unit');
 assert.deepEqual(tvKey({...s,focus:N-1},'right',LOCAL).events,[],'clamped at the last unit');
 // the list: Select opens the question, lit on "The usual"; nothing is posted and nothing is called yet
 const sel=tvKey({...s,focus:U},'select',LOCAL);
 assert.deepEqual([sel.events,sel.calls,sel.local],[[],[],{prepareAsk:0}]);
 // the question: Left/Right between the two cells, clamped, the unit's focus untouched
 const at0={...LOCAL,prepareAsk:0},at1={...LOCAL,prepareAsk:1};
 assert.deepEqual(tvKey({...s,focus:U},'right',at0).local,{prepareAsk:1});
 assert.deepEqual(tvKey({...s,focus:U},'right',at1).local,{},'clamped at "A step up"');
 assert.deepEqual(tvKey({...s,focus:U},'left',at1).local,{prepareAsk:0});
 assert.deepEqual(tvKey({...s,focus:U},'left',at0).local,{},'clamped at "The usual"');
 for(const k of ['right','left'])assert.deepEqual(tvKey({...s,focus:U},k,at0).events,[],'the unit keeps its place');
 // Back from the question: the list, on the same unit (no focus event, no nav)
 const back=tvKey({...s,focus:U},'back',at1);
 assert.deepEqual([back.events,back.calls,back.local],[[],[],{prepareAsk:null}]);
 // Select on "The usual" writes the set exactly as Topics does, staying on this screen; on "A step up" with the flag
 const usual=tvKey({...s,focus:U},'select',at0),up=tvKey({...s,focus:U},'select',at1),id=stops[U].id;
 assert.deepEqual(usual.events,[{type:'topic.open',topic:id,stay:true}]);
 assert.deepEqual(usual.calls,[{url:'/api/practice',body:{topic:id},onFail:{busy:false}}],'the usual set: the same body as Topics');
 assert.deepEqual(usual.local,{busy:true});
 assert.deepEqual(up.calls,[{url:'/api/practice',body:{topic:id,stretch:true},onFail:{busy:false}}]);
 // while it is written nothing else is asked; Back still closes the question
 for(const busy of [{...at1,busy:true},at1]){
  const run=busy.busy?s:{...s,jobs:{practice:{id:'j',phase:'running',startedAt:1}}};
  for(const k of ['select','left','right'])assert.deepEqual(tvKey({...run,focus:U},k,busy),{events:[],calls:[],local:{}},`writing: ${k}`);
  assert.deepEqual(tvKey({...run,focus:U},'back',busy).local,{prepareAsk:null});
  assert.deepEqual(tvKey({...run,focus:U},'select',{...LOCAL,busy:busy.busy}).local,{},'no question opens while a set is written');
 }
 // Up, Menu and Back on the list go home, the lamp on this door (after the continue card when one is up)
 for(const k of ['up','menu','back'])assert.deepEqual(tvKey({...s,focus:5},k,LOCAL).events,[{type:'nav',screen:'tonight',focus:2}],k);
 assert.deepEqual(tvKey({...s,focus:5,pages:[page()]},'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:3}]);
 // Down does nothing: there is no row below, and the TV never asks for typing
 assert.deepEqual(tvKey({...s,focus:5},'down',LOCAL),{events:[],calls:[],local:{}});
 // no step on this screen posts anything but focus, nav or the topic it is asking a set for
 for(const f of [0,7,14])for(const l of [LOCAL,at0,at1])for(const k of ['up','down','left','right','select','back','menu'])
  for(const e of tvKey({...s,focus:f},k,l).events)assert.ok(['focus','nav','topic.open'].includes(e.type),`${k}: ${e.type}`);
});

test('GR1: Get ready for school offers the worked lesson first (MB-B39)',(t)=>{
 // every school unit has a worked lesson now (L1-owen-17-MB2-1): leave 'linear-one-step' without one for this test, to reach the no-lesson branch
 const WM=require(path.join(root,'src/lib/library/worked.ts')).WORKED_METHODS,WMsaved=WM['linear-one-step'];delete WM['linear-one-step'];t.after(()=>{WM['linear-one-step']=WMsaved;});
 const K=keys(),{tvKey,topicStops}=K;
 const {prepareStops,choicesFor,choiceLine}=require(path.join(root,'src/tv/prepareRows.ts'));
 const {hasWorked}=require(path.join(root,'src/lib/library/worked.ts'));
 const s=uk12({screen:'prepare',focus:0}),stops=prepareStops(s);
 const W=stops.findIndex((u)=>hasWorked(u.id)),U=stops.findIndex((u)=>!hasWorked(u.id)),id=stops[W].id;
 assert.ok(W>=0&&U>=0);
 const at=(n)=>({...LOCAL,prepareAsk:n});
 // Select on a unit with a lesson opens the question lit on the lesson cell; on a unit without, as before
 const sel=tvKey({...s,focus:W},'select',LOCAL);
 assert.deepEqual([sel.events,sel.calls,sel.local],[[],[],{prepareAsk:-1}]);
 assert.deepEqual(tvKey({...s,focus:U},'select',LOCAL).local,{prepareAsk:0});
 // Right and Left walk -1, 0, 1, clamped at both ends
 assert.deepEqual(tvKey({...s,focus:W},'right',at(-1)).local,{prepareAsk:0});
 assert.deepEqual(tvKey({...s,focus:W},'right',at(0)).local,{prepareAsk:1});
 assert.deepEqual(tvKey({...s,focus:W},'right',at(1)).local,{});
 assert.deepEqual(tvKey({...s,focus:W},'left',at(1)).local,{prepareAsk:0});
 assert.deepEqual(tvKey({...s,focus:W},'left',at(0)).local,{prepareAsk:-1});
 assert.deepEqual(tvKey({...s,focus:W},'left',at(-1)).local,{});
 assert.deepEqual(tvKey({...s,focus:U},'left',at(0)).local,{},'no lesson cell to the left of a unit without a lesson');
 assert.deepEqual(tvKey({...s,focus:W},'back',at(-1)).local,{prepareAsk:null});
 // the cells and the line
 assert.deepEqual(choicesFor(true).map((c)=>[c.cell,c.t]),[[-1,'See how first'],[0,'The usual'],[1,'A step up']]);
 assert.equal(choicesFor(true)[0].k,'A worked lesson');
 assert.deepEqual(choicesFor(false).map((c)=>c.cell),[0,1]);
 assert.equal(choiceLine(-1),'A short worked example first, then six questions at your usual level.');
 // Select on the lesson cell teaches exactly as Topics does, and records where it came from
 const teach=tvKey({...s,focus:W},'select',at(-1)),topics=tvKey({...s,screen:'topics',focus:topicStops(s).findIndex((t)=>t.id===id)},'select',LOCAL);
 assert.deepEqual(teach.events,[{type:'topic.open',topic:id,stay:true}]);
 assert.deepEqual(teach.calls,[{url:'/api/worked',body:{topic:id},onFail:{busy:false},onDone:{busy:false}}]);
 assert.deepEqual(teach.events,topics.events);assert.deepEqual(teach.calls,topics.calls);
 assert.deepEqual(teach.local,{busy:true,lessonFrom:'prepare'});
 assert.deepEqual(topics.local,{busy:true},'Topics with no origin leaves Local as it was');
 // the usual set and a step up, as W8 2 pins them
 const usual=tvKey({...s,focus:W},'select',at(0)),up=tvKey({...s,focus:W},'select',at(1));
 assert.deepEqual(usual.events,[{type:'topic.open',topic:id,stay:true}]);
 assert.deepEqual(usual.calls,[{url:'/api/practice',body:{topic:id},onFail:{busy:false}}]);assert.deepEqual(usual.local,{busy:true});
 assert.deepEqual(up.calls,[{url:'/api/practice',body:{topic:id,stretch:true},onFail:{busy:false}}]);
 // while a lesson or a set is written the question asks nothing else; a running teach job counts
 for(const [run,l] of [[s,{...at(-1),busy:true}],[{...s,jobs:{teach:{id:'j',phase:'running',startedAt:1}}},at(-1)],[{...s,jobs:{teach:{id:'j',phase:'running',startedAt:1}}},at(0)]])
  for(const k of ['select','left','right'])assert.deepEqual(tvKey({...run,focus:W},k,l),{events:[],calls:[],local:{}},`writing: ${k}`);
 assert.deepEqual(tvKey({...s,focus:W,jobs:{teach:{id:'j',phase:'running',startedAt:1}}},'select',LOCAL).local,{},'no question opens while a lesson is written');
 // the lesson: from Get ready for school every way back goes there, on the unit, and clears the origin
 const lesson={topic:id,title:'T',idea:'x',own:false,steps:[],examples:[]};
 const ws=(focus)=>({...s,screen:'worked',focus,worked:lesson});
 const from={...LOCAL,lessonFrom:'prepare'};
 for(const [focus,k] of [[1,'select'],[0,'back'],[0,'up'],[0,'menu'],[1,'back']]){
  const r=tvKey(ws(focus),k,from);
  assert.deepEqual(r.events,[{type:'nav',screen:'prepare',focus:W}],`${focus} ${k}`);assert.deepEqual(r.local,{lessonFrom:null});assert.deepEqual(r.calls,[]);
 }
 assert.deepEqual(tvKey(ws(1),'back',{...from,prepareAsk:-1}).local,{lessonFrom:null,prepareAsk:null},'a question left open is closed');
 // with no origin they go to Topics as today
 for(const [focus,k] of [[1,'select'],[0,'back'],[0,'up'],[0,'menu']]){
  const r=tvKey(ws(focus),k,LOCAL);assert.deepEqual([r.events,r.local],[[{type:'nav',screen:'topics',focus:0}],{}],`${focus} ${k}`);
 }
 // Try six writes the usual set as today, and clears the origin only when it was set
 const six=tvKey(ws(0),'select',LOCAL),six2=tvKey(ws(0),'select',from);
 assert.deepEqual(six.calls,[{url:'/api/practice',body:{topic:id},onFail:{busy:false}}]);
 assert.deepEqual(six.events,[{type:'topic.open',topic:id}]);assert.deepEqual(six.local,{busy:true});
 assert.deepEqual([six2.events,six2.calls],[six.events,six.calls]);assert.deepEqual(six2.local,{busy:true,lessonFrom:null});
 // Topics' own teach clears an origin left over
 assert.deepEqual(tvKey({...s,screen:'topics',focus:topicStops(s).findIndex((t)=>t.id===id)},'select',from).local,{busy:true,lessonFrom:null});
});

test('W8 3: "Six more" on a step-up set asks for a step up again; on a usual set exactly as before',()=>{
 const {tvKey}=keys();
 const {sheetStops}=require(path.join(root,'src/tv/sheetRows.ts'));
 const items=[1,2,3,4,5,6].map((n)=>({n,question:`Q${n}`,verdict:'right'}));
 const usual={topic:'frac-add-sub',items,marked:true},up={...usual,stretch:true,items:items.map((i)=>({...i,stretch:true}))};
 const more=sheetStops(usual).indexOf('more');
 assert.deepEqual(tvKey(uk12({screen:'sheet',practice:usual,focus:more}),'select',LOCAL).calls,[{url:'/api/practice',body:{topic:'frac-add-sub'},onFail:{busy:false}}]);
 assert.deepEqual(tvKey(uk12({screen:'sheet',practice:up,focus:more}),'select',LOCAL).calls,[{url:'/api/practice',body:{topic:'frac-add-sub',stretch:true},onFail:{busy:false}}]);
 assert.deepEqual(tvKey(uk12({screen:'sheet',practice:up,focus:more}),'select',LOCAL).events,[{type:'topic.open',topic:'frac-add-sub'}],'Six more opens Topics as before');
});

// ---- Essay plan slots (challenge essay-master-B) ----
const planned=(slots,patch={})=>essay({screen:'essayplan',essay:null,essayPlan:{lens:'argument',slots},...patch});
const W=['Schools should start later.','Research found that teenagers fall asleep later.','A later start fits how they sleep.'];

test('plan case 5: Read it with all three written pushes one analyse call of the learner\'s sentences; with a slot empty it pushes nothing and focuses the first empty one',()=>{
 const {tvKey,planStops}=keys();
 const full=planned(W,{focus:3});
 const r=tvKey(full,'select',LOCAL);
 assert.deepEqual(r.calls,[{url:'/api/analyse',body:{kind:'essay',text:W.join(' '),type:'argument'}}]);
 const gap=planned([W[0],'',W[2]],{focus:3});
 const g=tvKey(gap,'select',LOCAL);
 assert.deepEqual(g.calls,[],'no model call with a slot empty');
 assert.equal(focusAfter(gap,g),1,'the first empty slot');
 assert.equal(planStops(full).length,5,'three slots, Read it, Back');
 assert.deepEqual(tvKey(planned(W,{focus:4}),'select',LOCAL).events,[{type:'nav',screen:'essaytype',focus:4}],'Back returns to the lens home, on the plan');
 assert.deepEqual(tvKey(planned(W,{focus:1}),'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:4}]);
 const walk=planned(['','',''],{focus:0});
 assert.equal(focusAfter(walk,tvKey(walk,'down',LOCAL)),1);
 assert.equal(focusAfter(walk,tvKey(walk,'up',LOCAL)),0,'Up on the first slot stays');
 const sel=tvKey(planned(['','',''],{focus:1}),'select',LOCAL);
 assert.equal(sel.events[0].type,'status');assert.deepEqual(sel.calls,[],'Select on a slot asks for nothing: the sentence comes from the phone');
});

test('plan case 7 (keys): with nothing read the lens home ends in plan, and Select there opens an empty plan on the chosen lens',()=>{
 const {tvKey,lensStops}=keys();
 assert.deepEqual(lensStops(session({screen:'essaytype'})).slice(-2),['plan','write']);
 assert.equal(lensStops(essay({screen:'essaytype'})).includes('plan'),false,'a paragraph read: the last card takes the place');
 const home=session({screen:'essaytype',subject:'essay',focus:4,essayType:'argument'});
 assert.deepEqual(tvKey(home,'select',LOCAL).events,[{type:'essay.plan',lens:'argument'},{type:'nav',screen:'essayplan',focus:0,from:'essaytype'}]);
 const bottom=session({screen:'essaytype',subject:'essay',focus:3});
 assert.equal(focusAfter(bottom,tvKey(bottom,'down',LOCAL)),4,'Down from the last lens reaches the plan');
 assert.equal(focusAfter(home,tvKey(home,'up',LOCAL)),3,'Up returns to the last lens');
 assert.equal(focusAfter(home,tvKey(home,'down',LOCAL)),5,'Down from the plan reaches Write from a prompt');
 assert.deepEqual(tvKey(session({screen:'essaytype',subject:'essay',focus:4}),'select',LOCAL).events[0],{type:'essay.plan',lens:ESSAY_TYPES[0].id},'no lens chosen: the first');
});

test('HW4: the continue card opens the sheet of tonight, never an older one; no sheet tonight, no card',()=>{
 const {tvKey,tonightStops}=keys();const {continueCard,tonightsSheet}=require(ROWS);
 const monday={...page(),id:'mon',day:'2000-1-3'},tonight={...page(),id:'tue',title:'Tuesday sheet'};
 const old=session({screen:'tonight',pages:[monday]});
 assert.equal(continueCard(old),null,'a Monday sheet and no sheet today: no card');
 assert.deepEqual(tonightStops(old),['homework','teach','prepare'],'the D-pad row has no continue stop');
 const both=session({screen:'tonight',pages:[monday,tonight]});
 const card=continueCard(both);
 assert.equal(card.pageIx,tonightsSheet(both).ix,'the same answer the door uses');
 assert.equal(card.pageIx,1);assert.equal(card.go,'page');
 assert.deepEqual(tvKey(both,'select',LOCAL).events.find(e=>e.type==='page.select'),{type:'page.select',pageIx:1});
 const reading=session({screen:'page',pages:[monday,{...tonight,items:[]}],pageIx:1,reading:true});
 assert.ok(tonightsSheet(reading),'a page being read is the sheet of tonight for the door');
 assert.equal(continueCard(reading),null,'but with no problems read yet it gets no card');
 assert.ok(!/where you were/i.test(card.cap),card.cap);assert.ok(!/—/.test(card.cap));
 const tomorrow=Date.now()+36*3600*1000;
 assert.equal(continueCard(both,tomorrow),null,'now is a parameter: the same pages a day on offer no card');
 assert.equal(both.pages.length,2,'older pages stay on the desk');
});
test('HW6 (F8): a failed read names the TV Select key as the retry for maths and English (TL-13), and promises none the desk will not make; an essay page names the paste panel',()=>{
 const {failedReadLine}=require(path.join(root,'src/tv/pageLines.ts'));
 const maths=fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8');
 assert.match(maths,/failedReadLine\("maths", read\.retry\)/,'the Math Buddy page draws the same line');
 assert.ok(!maths.includes('Open Try again on the phone'),'the phone is no longer where the retry is');
 for(const subject of ['maths','english']){
  for(const retry of [undefined,true])assert.equal(failedReadLine(subject,retry),'The desk could not read this page. Select to try again.',`${subject} retry ${retry}`);
  assert.equal(failedReadLine(subject,false),'The desk could not read this page. Take a new photo of the page on the phone.',`${subject}: a read the desk will not repeat`);
  assert.doesNotMatch(failedReadLine(subject,false),/try again/i);
 }
 for(const retry of [undefined,true,false])assert.equal(failedReadLine('essay',retry),'The desk could not read this page. Paste or type it on the phone.','the paste panel line as it was');
 for(const subject of ['maths','english','essay'])for(const retry of [undefined,false])assert.ok(!/—|snap it again/.test(failedReadLine(subject,retry)),subject);
 assert.match(fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8'),/failedReadLine\(p\.subject, read\.retry\)/,'the page screen uses it');
});

test('essay 4 (6c, E4-b): Rewrite on a sentence of a paragraph the desk did not rule puts that paragraph line on the status line; a ruled one says rewriteStatus',()=>{
 const {tvKey,rewriteStatus}=keys();
 const piece={paragraphs:2,read:[0],failed:[1]};
 const sentences=TEXTS.map((text,i)=>({n:i+1,text,words:text.split(' ').length,connectors:[],role:'claim',para:i<3?0:1}));
 const r={...reading(SIXV),sentences,piece};
 const f=(essayAt)=>essay({screen:'forensic',focus:0,essay:r,essayAt});
 assert.deepEqual(tvKey(f(5),'select',LOCAL).events,[{type:'status',text:'Paragraph 2 did not come back. Send it again from the phone.'}],'an unruled sentence');
 assert.deepEqual(tvKey(f(2),'select',LOCAL).events,[{type:'status',text:rewriteStatus(2)},{type:'ask.open',kind:'rewrite',detail:{n:2}}],'a ruled sentence (TL-7: it also opens the hand-off)');
 assert.equal(at(f(2),tvKey(essay({screen:'forensic',focus:2,essay:r,essayAt:5}),'select',LOCAL)),6,'Next sentence still walks every sentence, unruled ones too');
});

// ---- MB-B19: a learner past the end of the school path
const learnerOf=(system,age,extra={})=>session({profiles:[{id:'ema',name:'Ema',type:'high-school',age,system,modules:['maths'],...extra}]});
const secureRec=(topic)=>({topic,seen:6,right:6,estimate:0.9,secure:true,lastSeen:1,slips:[]});

test('MB-B19 1: past the path\'s end with nothing secure, Get ready for school opens on the last topic, Teach me something on the first (the ruler\'s needle, stick walk 2026-10-23), and one line says the path ends',()=>{
 const {topicsFocus,tvKey}=keys();
 const PR=require(path.join(root,'src/tv/prepareRows.ts'));
 const {topicsOf}=require(path.join(root,'src/lib/library/paths.ts'));
 for(const [system,age] of [['cz',18],['uk',17]]){
  const s=learnerOf(system,age),topics=topicsOf('school'),last=topics[topics.length-1];
  assert.equal(topicsFocus(s),0,`${system} ${age}: Topics opens on the first topic, not Probability`);
  assert.deepEqual(tvKey({...s,screen:'tonight',focus:1},'select',LOCAL).events.at(-1),{type:'nav',screen:'topics',focus:0},`${system} ${age}: the Teach door`);
  const ix=PR.prepareStops(s).findIndex((u)=>u.id===last.id);
  assert.ok(ix>0);
  const open=tvKey({...s,screen:'tonight',focus:2},'select',LOCAL);
  assert.deepEqual(open.events,[{type:'subject',subject:'maths'},{type:'nav',screen:'prepare',focus:ix}],`${system} ${age}: the door`);
  const line=PR.pathEndsLine(s);
  assert.equal(line,`This path ends at ${PR.SYS_WORD[system](last.year)}; your year is past it.`);
  assert.ok(line.split(/\s+/).length<=25);assert.doesNotMatch(line,/2014/);
  assert.match(line,/^[A-Z][^!?]*\.$/,'one sentence');
 }
 assert.match(PR.pathEndsLine(learnerOf('cz',18)),/9\. ročník/);
});

test('MB-B19 2: past the end with one topic secure, Topics follow the frontier and Prepare still opens on the last topic',()=>{
 const {topicsFocus,tvKey}=keys();
 const PR=require(path.join(root,'src/tv/prepareRows.ts'));
 const {topicsOf,frontierOn}=require(path.join(root,'src/lib/library/paths.ts'));
 const topics=topicsOf('school'),first=topics[0].id;
 const s=session({...learnerOf('uk',17),skills:{[first]:secureRec(first)}});
 const next=frontierOn('school',[first]);
 assert.equal(topicsFocus(s),topics.findIndex((t)=>t.id===next.id));
 assert.notEqual(topicsFocus(s),topics.length-1);
 const ix=PR.prepareStops(s).findIndex((u)=>u.id===topics[topics.length-1].id);
 assert.deepEqual(tvKey({...s,screen:'tonight',focus:2},'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'prepare',focus:ix}]);
});

test('MB-B19 3: a younger learner, one with no age and a calc1 learner keep focus 0 and have no line',()=>{
 const {topicsFocus,tvKey}=keys();
 const PR=require(path.join(root,'src/tv/prepareRows.ts'));
 const noAge=session({profiles:[{id:'ema',name:'Ema',type:'high-school',system:'uk',modules:['maths']}]});
 for(const [name,s] of [['uk 12',learnerOf('uk',12)],['no age',noAge],['calc1',calcW8()]]){
  assert.equal(topicsFocus(s),0,name);assert.equal(PR.pathEndsLine(s),null,name);assert.equal(PR.pastPathEnd(s),null,name);
 }
 for(const s of [learnerOf('uk',12),noAge])
  assert.deepEqual(tvKey({...s,screen:'tonight',focus:2},'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'prepare',focus:0}]);
});

// SW7 (scan-sweep optimize 2026-10-13): each spoken line's audio blob is let go when the next one replaces it
test('SW7: the TV speaks line after line and holds at most one audio blob URL, the one playing',async()=>{
 const ts=require('./ts-load.cjs').ts();
 const src=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');
 const a=src.indexOf('useEffect(() => {',src.indexOf('// speak what is new')),e=src.indexOf('}, [s, voice]);',a);
 assert.ok(a>0&&e>a,'the speak effect is where the test expects it');
 const js=ts.transpileModule(src.slice(a,e+'}, [s, voice]);'.length),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const live=new Set();let n=0;
 const URL_={createObjectURL:()=>{const u=`blob:${++n}`;live.add(u);return u;},revokeObjectURL:(u)=>live.delete(u)};
 class Audio_{constructor(src){this.src=src;this.onended=null;}pause(){}play(){return Promise.resolve();}}
 const audio={current:null},spoken={current:''},ducks=[],fxNow={current:{duck:(d)=>ducks.push(d)}};
 const say=async(line)=>{let effect;new Function('useEffect','s','voice','spokenLine','spoken','call','audio','URL','Audio','speechSynthesis','SpeechSynthesisUtterance','fxNow',js)(
  (f)=>{effect=f;},{line},true,(s)=>s.line,spoken,async()=>({ok:true,blob:async()=>({})}),audio,URL_,Audio_,{cancel(){},speak(){}},class{},fxNow);
  effect();for(let i=0;i<5;i++)await new Promise((r)=>setImmediate(r));};
 for(const l of ['one','two','three','four'])await say(l);
 assert.equal(n,4,'four lines, four blobs');
 assert.deepEqual([...live],[audio.current.src],'only the line playing still holds its blob');
 audio.current.onended?.({currentTarget:audio.current});
 assert.equal(live.size,0,'and it is let go when it ends');
 assert.deepEqual(ducks,[true,true,true,true,false],'the music ducks under each line and comes back when the last one ends');
});

// SW8 (scan-sweep optimize 2026-10-13): the stream's debug trace on window.__desk is bounded - the clock ticks every second
test('SW8: an evening of session messages leaves a bounded window.__desk.events, newest last',()=>{
 const ts=require('./ts-load.cjs').ts();
 const src=fs.readFileSync(path.join(root,'src/tv/useSession.ts'),'utf8');
 const a=src.indexOf('useEffect(() => {'),e=src.indexOf('}, []);',a);
 assert.ok(a>0&&e>a,'the stream effect is where the test expects it');
 const js=ts.transpileModule(src.slice(a,e+'}, []);'.length),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 let es=null;class ES{constructor(){es=this;}close(){}}
 const win={};let effect;
 new Function('useEffect','window','EventSource','setS','setConnected','reopen','setTimeout',js)((f)=>{effect=f;},win,ES,()=>{},()=>{},{current:null},()=>{});
 effect();
 const N=3*3600;for(let i=0;i<N;i++)es.onmessage({data:`{"tick":${i}}`});
 const ev=win.__desk.events;
 assert.ok(ev.length<=500,`three hours of ticks keep ${ev.length} lines, not ${N+1}`);
 assert.equal(ev.at(-1),`msg ${`{"tick":${N-1}}`.length}`,'the newest line is kept');
});

// SW13 (scan-sweep optimize 2026-10-13, tv-surface): the D-pad listener is bound once, not swapped on every session message
test('SW13: 100 session updates leave the TV page with one keydown binding, and a key pressed after them is handled against the newest session',()=>{
 const ts=require('./ts-load.cjs').ts();
 const src=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');
 const a=src.indexOf('// ---- D-pad'),r=src.indexOf('removeEventListener("keydown", onKey)',a);
 assert.ok(a>0&&r>a,'the D-pad effect is where the test expects it');
 const end=src.slice(r).match(/\}, \[[^\]]*\]\);/);
 assert.ok(end,'the effect closes with its dependency list');
 const js=ts.transpileModule(src.slice(a,r+end.index+end[0].length),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 // a minimal hooks driver: refs persist across renders; an effect re-runs (after its cleanup) only when a dependency changed
 const refs=[],effs=[];let adds=0,removes=0,handler=null;
 const seen=[];
 const world={
  addEventListener:(t,f)=>{adds++;handler=f;},removeEventListener:()=>{removes++;handler=null;},
  notTheTV:()=>false,lingaOwns:()=>false,keyOf:()=>'play',tvKey:(s)=>{seen.push(s.n);return {events:[]};},
  landingStops:()=>[],landingAt:()=>0,runStep:async()=>{},matchMedia:()=>({matches:false}),setZoom:()=>{},setTimeout:()=>0,
  local:{current:{}},zooming:{current:false},post:()=>{},call:()=>{},apply:()=>{},ZOOM_MS:0,
 };
 const names=Object.keys(world);
 const render=(s)=>{
  let ri=0,ei=0;
  const useRef=(v)=>{const i=ri++;return refs[i]??(refs[i]={current:v});},useEffect=(f,deps)=>{
   const i=ei++,e=effs[i]??(effs[i]={deps:null,clean:null});
   if(e.deps&&deps&&e.deps.length===deps.length&&e.deps.every((d,k)=>Object.is(d,deps[k])))return;
   e.clean?.();e.deps=deps;e.clean=f()||null;
  };
  new Function('useEffect','useRef','s',...names,js)(useEffect,useRef,s,...names.map((n)=>world[n]));
 };
 for(let i=0;i<100;i++)render({n:i,screen:'lesson'});
 assert.equal(adds,1,`100 session messages made ${adds} keydown bindings, not one per message`);
 assert.equal(adds-removes,1,'and exactly one is live');
 handler({key:' ',preventDefault(){}});
 assert.deepEqual(seen,[99],'the key is read against the newest session');
});

test('workroom 1 (recert-6/L1-helena-46-EM5-2): in Adult mode a reading on the desk still leaves a remote path back to the Workroom; Family mode keeps Back to the desk',()=>{
 const {tvKey}=keys();
 const ADULT={id:'hel',name:'Helena',type:'adult',age:34,system:'uk',modules:['essay'],mode:'adult'};
 const adult=(patch={})=>essay({profiles:[ADULT],learner:{id:'hel',name:'Helena'},...patch});
 // landing -> forensic: with the paragraph on the desk, Select on the essay card opens the forensic page first
 const landing=adult({screen:'landing',focus:0});
 assert.deepEqual(tvKey(landing,'select',LOCAL).events.at(-1),{type:'nav',screen:'forensic',focus:0});
 // forensic Back -> the lens home, and from there Back reaches the Workroom (the desk opens it, titles and counts only)
 const back=tvKey(adult({screen:'forensic'}),'back',LOCAL);
 assert.equal(back.events.at(-1).screen,'essaytype');
 const toRoom=tvKey(adult({screen:'essaytype'}),'back',LOCAL);
 assert.deepEqual(toRoom.events,[]);
 assert.deepEqual(toRoom.calls,[{url:'/api/twin',body:{open:true}}]);
 // Family mode is unchanged: Back from the lens home is the desk
 const fam=tvKey(essay({screen:'essaytype'}),'back',LOCAL);
 assert.deepEqual(fam.calls,[]);
 assert.equal(fam.events.at(-1).screen,'landing');
});

test('workroom 2 (recert-6/L1-helena-46-EM5-3): OK on a piece row reads that piece on the TV (the id only, never its text); OK on the lenses, Back and Menu are as before',()=>{
 const {tvKey}=keys();
 const ADULT={id:'hel',name:'Helena',type:'adult',age:34,system:'uk',modules:['essay'],mode:'adult'};
 const piece=(id,title)=>({id,title,format:'email',versions:2,paragraphs:3});
 const room=(patch={})=>session({subject:'essay',screen:'workroom',profiles:[ADULT],learner:{id:'hel',name:'Helena'},
  workroom:{owner:'hel',pieces:[piece('t-a','First'),piece('t-b','Second')],channels:[],born:false,need:3},...patch});
 // the second piece row: one call, its id, no event (the desk opens the reading when a paragraph comes back)
 const ok=tvKey(room({focus:1}),'select',LOCAL);
 assert.deepEqual(ok.events,[]);
 assert.deepEqual(ok.calls,[{url:'/api/analyse',body:{kind:'shelf-piece',pieceId:'t-b'}}]);
 // a reading already running sends nothing more
 const busy=tvKey(room({focus:0,jobs:{analyse:{phase:'running',key:'essay',by:'hel'}}}),'select',LOCAL);
 assert.deepEqual(busy.calls,[]);
 // the lenses stop: as today, the lens home, no call
 const lenses=tvKey(room({focus:2}),'select',LOCAL);
 assert.deepEqual(lenses.calls,[]); assert.deepEqual(lenses.events.at(-1),{type:'nav',screen:'essaytype',focus:0});
 // Menu and Back are unchanged
 assert.equal(tvKey(room({focus:0}),'menu',LOCAL).events.at(-1).screen,'essaytype');
 const back=tvKey(room({focus:0}),'back',LOCAL); assert.deepEqual(back.calls,[]); assert.equal(back.events.at(-1).screen,'landing');
});

test('profile setup (L1-radka-41-MB5-1, TV half): the rows start on the likely value - a 12-year-old elementary cz maths-only child takes 13 presses, not 21',()=>{
 const {tvKey}=keys();const {AGE_RANGE}=require(path.join(root,'src/tv/profileRows.ts'));
 let s=session({screen:'profile',focus:1,profiles:[],learner:null,draft:{id:'n',name:'',type:'high-school',modules:['maths','english','essay']}});
 let presses=0; // focus 1 is the first type cell: the Name row now holds focus 0
 const press=(k)=>{presses++;for(const e of tvKey(s,k,LOCAL).events){
  if(e.type==='focus')s={...s,focus:e.focus};
  else if(e.type==='profile.draft'){const d={...s.draft,...e.patch};const r=AGE_RANGE[d.type];if(r&&d.age!==undefined&&(d.age<r[0]||d.age>r[1]))delete d.age;s={...s,draft:d};}}};
 const here=()=>{const rows=profileRows(s.draft),at=locate(rows,s.focus);return {title:rows[at.r].title,cell:rows[at.r].cells[at.c]};};
 const pick=(pred)=>{for(let g=0;g<60;g++){const rows=profileRows(s.draft),at=locate(rows,s.focus);let tr=-1,tc=-1;
   rows.forEach((r,i)=>r.cells.forEach((c,j)=>{if(tr<0&&pred(c)){tr=i;tc=j;}}));assert.ok(tr>=0,'target exists');
   if(at.r!==tr)press(at.r<tr?'down':'up');else if(at.c!==tc)press(at.c<tc?'right':'left');else return press('select');}
  assert.fail('lost on the profile screen');};
 pick(c=>c.kind==='type'&&c.type==='elementary');
 assert.equal(presses,1);
 assert.deepEqual([here().title,here().cell.age],['Age',10],'after a type, the lamp is on the middle of the age range, one press to the row');
 pick(c=>c.kind==='age'&&c.age===12);
 assert.equal(presses,4);
 assert.deepEqual([here().title,here().cell.system],['School system','uk'],'after an age, the system row on its default');
 pick(c=>c.kind==='system'&&c.system==='cz');
 assert.equal(presses,6);
 assert.equal(here().title,'Interested in');
 pick(c=>c.kind==='interest'&&c.sub==='english');pick(c=>c.kind==='interest'&&c.sub==='essay');
 assert.deepEqual(s.draft.modules,['maths']);
 assert.ok(!profileRows(s.draft).some(r=>r.title==='Maths course'),'no university course row for an elementary child');
 pick(c=>c.kind==='save');
 assert.equal(presses,13,'was 21 before the rows started on the likely value');
 // the middles named by the finding; the high-school landing is 17; the Maths course is kept for a learner who can use it
 for(const [type,mid] of [['elementary',10],['high-school',17]]){
  const d={id:'n',name:'',type:'other',modules:['maths']};const t=session({screen:'profile',focus:0,draft:d});
  const rows=profileRows({...d,type});const ix=1+rows[1].cells.findIndex(c=>c.type===type);
  const ev=tvKey({...t,focus:ix},'select',LOCAL).events;
  assert.equal(rows[2].cells[locate(rows,focusAfter(t,{events:ev})).c].age,mid,`${type} lands on ${mid}`);}
 assert.ok(profileRows({id:'n',name:'',type:'high-school',modules:['maths']}).some(r=>r.title==='Maths course'));
 assert.ok(profileRows({id:'n',name:'',type:'elementary',modules:['maths'],mathPath:'calc1'}).some(r=>r.title==='Maths course'),'a draft already on a course keeps its row');
});

// ---- TL-1 (TV-led design 5.2): every remote button reaches every screen ----
test('TL-1: keyOf maps the remote\'s own names - MediaPlayPause, ContextMenu, GoBack, BrowserBack',()=>{
 const {keyOf}=keys();
 const want={MediaPlayPause:'play',ContextMenu:'menu',GoBack:'back',BrowserBack:'back'};
 for(const [k,v] of Object.entries(want))assert.equal(keyOf(k),v,k);
});

test('TL-1: on the break, Back skips it as Select does',()=>{
 const {tvKey}=keys();
 const s=session({screen:'break'});
 assert.deepEqual(tvKey(s,'back',LOCAL).events,[{type:'timer.skipbreak'}]);
 assert.deepEqual(tvKey(s,'select',LOCAL).events,[{type:'timer.skipbreak'}]);
});

test('TL-1: LingaTV reads its keys through keyOf and spells no arrow key itself',()=>{
 const src=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.match(src,/import \{[^}]*\bkeyOf\b[^}]*\} from "@\/tv\/keys"/,'LingaTV imports keyOf');
 assert.doesNotMatch(src,/"ArrowLeft"/,'LingaTV holds no "ArrowLeft" literal');
});

// ---- TL-6 (TV-led design 6): Math Buddy opens its hand-offs from the TV ----
const askOf=(kind,screen,detail)=>({id:'a1',kind,learner:'ema',screen,at:1,phase:'open',...(detail?{detail}:{})});
const setOf=(verdicts,patch={})=>session({screen:'walk',practice:{topic:'linear-one-step',marked:true,items:verdicts.map((v,i)=>({n:i+1,question:`q${i}`,verdict:v}))},walkIx:0,...patch});

test('TL-6: Select on I have homework with no sheet posts page.ask and ask.open page, the subject in its detail',()=>{
 const {tvKey}=keys();
 assert.deepEqual(tvKey(session({screen:'tonight',focus:0}),'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'page.ask',subject:'maths'},{type:'ask.open',kind:'page',detail:{subject:'maths'}}]);
});

test('TL-6: the practice card has two stops - Snap the sheet, Type my answers - and Select opens sheet or answers',()=>{
 const {tvKey,PRACTICE_STOPS}=keys();
 assert.deepEqual([...PRACTICE_STOPS],['sheet','answers']);
 const set={topic:'linear-one-step',marked:false,items:[{n:1,question:'q'}]};
 const on=(focus,extra={})=>session({screen:'practice',practice:set,focus,...extra});
 assert.deepEqual(tvKey(on(0),'select',LOCAL).events,[{type:'ask.open',kind:'sheet'}]);
 assert.deepEqual(tvKey(on(1),'select',LOCAL).events,[{type:'ask.open',kind:'answers'}]);
 assert.deepEqual(tvKey(on(0),'right',LOCAL).events,[{type:'focus',focus:1}],'the D-pad reaches the second stop');
 assert.deepEqual(tvKey(on(1),'left',LOCAL).events,[{type:'focus',focus:0}]);
 assert.deepEqual(tvKey(on(0,{jobs:{mark:{phase:'running',startedAt:1,key:'k'}}}),'select',LOCAL).events,[],'no ask while the desk is marking');
 assert.deepEqual(tvKey(on(0),'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}],'Back keeps the set and leaves');
});

test('TL-6: Ask in words is the last stop of the hint, and the Page reaches it with Down from the last problem',()=>{
 const {tvKey,HINT_STOPS,PAGE_ASK}=keys();
 assert.deepEqual([...HINT_STOPS],['stuck','lesson','ask']);
 const hint={key:'k2',problem:'x + 2 = 5',stage:1,hint1:{hint:'h'},hint2:null,askedQ:''};
 const onHint=(focus)=>session({screen:'hint',pages:[page()],itemIx:1,focus,hint});
 assert.deepEqual(tvKey(onHint(2),'select',LOCAL).events,[{type:'ask.open',kind:'question',detail:{n:2}}]);
 assert.deepEqual(tvKey(onHint(1),'right',LOCAL).events,[{type:'focus',focus:2}]);
 const onPage=(extra)=>session({screen:'page',pages:[page()],...extra});
 assert.deepEqual(tvKey(onPage({itemIx:0}),'down',LOCAL).events,[{type:'item',itemIx:1}],'Down still walks the problems');
 assert.deepEqual(tvKey(onPage({itemIx:1}),'down',LOCAL).events,[{type:'focus',focus:PAGE_ASK}]);
 assert.deepEqual(tvKey(onPage({itemIx:1,focus:PAGE_ASK}),'select',LOCAL).events,[{type:'ask.open',kind:'question',detail:{n:2}}]);
 assert.deepEqual(tvKey(onPage({itemIx:1,focus:PAGE_ASK}),'up',LOCAL).events,[{type:'focus',focus:0}]);
 assert.deepEqual(tvKey(session({screen:'page',subject:'essay',pages:[page('essay')],itemIx:1}),'down',LOCAL).events,[{type:'item',itemIx:1}],'an Essay page has no such stop');
});

test('TL-6: a walk item that is wrong or unsure has Tell the desk how and Type my second go, each with its walkIx; a right one has neither',()=>{
 const {tvKey,walkStops}=keys();
 const s=setOf(['right','wrong','unsure']);
 assert.deepEqual(walkStops(s),[],'right, not last');
 assert.deepEqual(walkStops({...s,walkIx:1}),['explain','second']);
 assert.deepEqual(walkStops({...s,walkIx:2}),['sheet','explain','second'],'the last item keeps Back to the sheet first');
 assert.deepEqual(walkStops(setOf(['wrong'],{practice:{topic:'t',marked:true,items:[{n:1,question:'q',verdict:'wrong',second:'right'}]}})),['sheet'],'a second go that held is done');
 const at=(focus)=>({...s,walkIx:1,focus});
 assert.deepEqual(tvKey(at(0),'select',LOCAL).events,[{type:'ask.open',kind:'explain',detail:{walkIx:1}}]);
 assert.deepEqual(tvKey(at(1),'select',LOCAL).events,[{type:'ask.open',kind:'second',detail:{walkIx:1}}]);
 assert.deepEqual(tvKey(at(0),'down',LOCAL).events,[{type:'focus',focus:1}]);
 assert.deepEqual(tvKey({...s,walkIx:2,focus:0},'select',LOCAL).events,[{type:'nav',screen:'sheet',focus:2}],'Select on the last item still goes back to the sheet');
 assert.deepEqual(tvKey({...at(1),ask:askOf('second','walk',{walkIx:1})},'right',LOCAL).events,[{type:'ask.cancel',id:'a1'},{type:'walk',ix:2},{type:'focus',focus:0}],'another item closes this items hand-off');
});

test('TL-6: the first Back with an ask open emits ask.cancel and stays; the next Back leaves as it did',()=>{
 const {tvKey}=keys();
 const hint={key:'k1',problem:'x',stage:1,hint1:{hint:'h'},hint2:null,askedQ:''};
 const set={topic:'linear-one-step',marked:false,items:[{n:1,question:'q'}]};
 const cases=[
  ['page',session({screen:'page',pages:[page()]}),askOf('question','page'),{type:'nav',screen:'tonight',focus:0}],
  ['hint',session({screen:'hint',pages:[page()],hint}),askOf('question','hint'),{type:'nav',screen:'page',focus:0}],
  ['practice',session({screen:'practice',practice:set}),askOf('sheet','practice'),{type:'nav',screen:'tonight',focus:0}],
  ['practice answers',session({screen:'practice',practice:set}),askOf('answers','practice'),{type:'nav',screen:'tonight',focus:0}],
  ['walk',setOf(['wrong']),askOf('explain','walk',{walkIx:0}),{type:'nav',screen:'sheet',focus:0}],
 ];
 for(const [name,s,ask,leave] of cases){
  assert.deepEqual(tvKey({...s,ask},'back',LOCAL).events,[{type:'ask.cancel',id:'a1'}],`${name}: the first Back cancels and does not leave`);
  assert.deepEqual(tvKey(s,'back',LOCAL).events,[leave],`${name}: the next Back leaves`);
 }
 // Tonight keeps page.unask and adds ask.cancel beside it
 const tonight=session({screen:'tonight',awaiting:'maths'});
 assert.deepEqual(tvKey({...tonight,ask:askOf('page','tonight',{subject:'maths'})},'back',LOCAL).events,[{type:'ask.cancel',id:'a1'},{type:'page.unask'}]);
 assert.deepEqual(tvKey(tonight,'back',LOCAL).events,[{type:'page.unask'}],'no ask open: as it was');
 // an ask another screen opened is not this screen to cancel
 assert.deepEqual(tvKey({...session({screen:'practice',practice:set}),ask:askOf('sheet','tonight')},'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}]);
});

test('TL-6: with no phone connected, Up on the asking screen goes to pairing, as the caption says',()=>{
 const {tvKey}=keys();
 const s=session({screen:'tonight',awaiting:'maths',ask:askOf('page','tonight'),phonesLive:0});
 assert.deepEqual(tvKey(s,'up',LOCAL).events,[{type:'nav',screen:'pair',focus:0,from:'tonight'}]);
 assert.deepEqual(tvKey({...s,phonesLive:1},'up',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'tonight'}],'a phone is live: Up is what it was');
});

// ---- TL-7 (TV-led design 6): Essay Master and its sentence flows open their hand-offs from the TV ----
const ADULT7={id:'hel',name:'Helena',type:'adult',age:34,system:'uk',modules:['essay'],mode:'adult'};
const kept=()=>({...reading(SIXV),piece:{paragraphs:1,read:[0],failed:[],pieceId:'p1'}});
const curtained=(patch={})=>essay({profiles:[ADULT7],learner:{id:'hel',name:'Helena'},essay:kept(),screen:'forensic',focus:0,...patch});

test('TL-7: Select on a lens opens the paragraph hand-off beside the lens and its caption',()=>{
 const {tvKey}=keys();
 for(let f=0;f<4;f++){
  const ev=tvKey(session({screen:'essaytype',subject:'essay',focus:f}),'select',LOCAL).events;
  assert.deepEqual(ev.map(e=>e.type),['essay.type','status','ask.open'],'the status sentence stays as the caption');
  assert.deepEqual(ev[2],{type:'ask.open',kind:'paragraph'});
 }
});

test('TL-7: Rewrite on my phone opens rewrite {n}; an unruled sentence opens nothing',()=>{
 const {tvKey}=keys();
 const f=(essayAt)=>essay({screen:'forensic',focus:0,essayAt});
 assert.deepEqual(tvKey(f(2),'select',LOCAL).events.at(-1),{type:'ask.open',kind:'rewrite',detail:{n:2}});
 assert.deepEqual(tvKey(f(null),'select',LOCAL).events.at(-1),{type:'ask.open',kind:'rewrite',detail:{n:4}},'the sentence on screen');
 const sentences=TEXTS.map((text,i)=>({n:i+1,text,words:text.split(' ').length,connectors:[],role:'claim',para:i<3?0:1}));
 const r={...reading(SIXV),sentences,piece:{paragraphs:2,read:[0],failed:[1]}};
 assert.equal(tvKey(essay({screen:'forensic',focus:0,essay:r,essayAt:5}),'select',LOCAL).events.some(e=>e.type==='ask.open'),false);
});

test('TL-7: Select on a slot opens slot {i}; Up/Down to another slot cancels it; Back cancels first',()=>{
 const {tvKey}=keys();
 for(const i of [0,1,2])assert.deepEqual(tvKey(planned(['','',''],{focus:i}),'select',LOCAL).events.at(-1),{type:'ask.open',kind:'slot',detail:{i}});
 const open=(focus)=>planned(['','',''],{focus,ask:askOf('slot','essayplan',{i:focus})});
 assert.deepEqual(tvKey(open(1),'down',LOCAL).events,[{type:'ask.cancel',id:'a1'},{type:'focus',focus:2}]);
 assert.deepEqual(tvKey(open(1),'up',LOCAL).events,[{type:'ask.cancel',id:'a1'},{type:'focus',focus:0}]);
 assert.deepEqual(tvKey(open(0),'up',LOCAL).events,[],'Up on the first slot stays on it: the ask stays');
 assert.deepEqual(tvKey(open(1),'back',LOCAL).events,[{type:'ask.cancel',id:'a1'}],'the first Back cancels');
 assert.deepEqual(tvKey(planned(['','',''],{focus:1}),'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:4}],'the next one leaves');
});

test('TL-7: Try a sentence on the sentence screen opens sentence; Back cancels it first',()=>{
 const {tvKey}=keys();
 const sent=(patch={})=>session({screen:'sentence',focus:0,...patch});
 assert.deepEqual(tvKey(sent(),'select',LOCAL).events.at(-1),{type:'ask.open',kind:'sentence'});
 assert.deepEqual(tvKey(sent({ask:askOf('sentence','sentence')}),'back',LOCAL).events,[{type:'ask.cancel',id:'a1'}]);
 assert.deepEqual(tvKey(sent(),'back',LOCAL).events,[{type:'nav',screen:'linga',focus:0}]);
});

test('TL-7: Up/Down to another sentence cancels a rewrite ask that names a different n, beside its essay.at; Back cancels first',()=>{
 const {tvKey}=keys();
 const on=(essayAt,kind='rewrite')=>essay({screen:'forensic',focus:0,essayAt,ask:askOf(kind,'forensic',{n:essayAt})});
 assert.deepEqual(tvKey(on(3),'down',LOCAL).events,[{type:'essay.at',n:4},{type:'ask.cancel',id:'a1'}]);
 assert.deepEqual(tvKey(on(3),'up',LOCAL).events,[{type:'essay.at',n:2},{type:'ask.cancel',id:'a1'}]);
 assert.deepEqual(tvKey(on(1),'up',LOCAL).events,[],'Up on sentence 1 stays: the ask stays');
 // an ask that names the sentence the page is NOT on is already not this page's to cancel again
 assert.deepEqual(tvKey({...on(3),ask:askOf('rewrite','forensic',{n:6})},'down',LOCAL).events,[{type:'essay.at',n:4}]);
 assert.deepEqual(tvKey(on(3),'back',LOCAL).events,[{type:'ask.cancel',id:'a1'}],'the first Back cancels and stays');
 assert.deepEqual(tvKey(essay({screen:'forensic',focus:0,essayAt:3}),'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:1}],'no ask: as it was');
 // the lens home: Back cancels the paragraph ask before it leaves
 assert.deepEqual(tvKey(session({screen:'essaytype',subject:'essay',ask:askOf('paragraph','essaytype')}),'back',LOCAL).events,[{type:'ask.cancel',id:'a1'}]);
});

test('TL-7: with the curtain on, Show the words on my phone is the stop before Back and opens private; with it off there is no such stop',()=>{
 const {tvKey,forensicStops,FORENSIC_STOPS}=keys();
 assert.deepEqual([...forensicStops(curtained())],['rewrite','why','next','private','back']);
 assert.deepEqual([...forensicStops(essay({screen:'forensic'}))],[...FORENSIC_STOPS],'curtain off: the four actions, none private');
 assert.deepEqual(tvKey(curtained({focus:3}),'select',LOCAL).events,[{type:'ask.open',kind:'private',detail:{n:4}}]);
 // curtain off: walking the whole row never reaches it, and a focus past the end is Back
 let s=essay({screen:'forensic',focus:0});
 for(let k=0;k<8;k++){const r=tvKey(s,'right',LOCAL);s={...s,focus:focusAfter(s,r)};}
 assert.equal(s.focus,3);
 assert.equal(tvKey(s,'select',LOCAL).events.some(e=>e.type==='ask.open'),false);
 // a kept piece but a School/Family learner is not curtained either
 assert.equal(forensicStops(essay({screen:'forensic',essay:kept()})).includes('private'),false);
});

test('TL-7: the Essay screens draw the On your phone chip while the ask matches, and the sentence screen too',()=>{
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8'),scr=fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8');
 assert.match(tv,/essayHandoffOf\(s\)\s*\n?\s*\? <div className="em-pill lit" data-role="essay-onphone">\{PHONE\}<span>On your phone<\/span>/);
 assert.match(tv,/essayHandoffLine\(s\)/);
 assert.match(scr,/essayHandoffOf\(s\) && /);
 const {essayHandoffOf,essayHandoffLine}=keys();
 const s=essay({screen:'essaytype',ask:askOf('paragraph','essaytype'),phonesLive:1});
 assert.ok(essayHandoffOf(s));assert.match(essayHandoffLine(s),/^On the phone: .*Back cancels\.$/);
 assert.equal(essayHandoffOf({...s,screen:'forensic'}),null,'an ask another screen opened');
 assert.equal(essayHandoffOf({...s,ask:askOf('slot','essaytype')}),null,'a kind this screen does not open');
 assert.match(essayHandoffLine({...s,phonesLive:0}),/No phone is connected/);
});

test('TL-8: the profile opens with a Name row; Add a learner drafts then asks for the name; Select on Name asks again; Back is two-step; Save waits',()=>{
 const {tvKey}=keys();
 const rows=profileRows({id:'n',name:'',type:'high-school',modules:[]});
 assert.equal(rows[0].title,'Name');assert.equal(rows[0].cells[0].kind,'name');
 assert.equal(rows[1].title,'Type of student','the picks follow the Name row');
 const add=tvKey(session({screen:'learner',focus:1}),'select',LOCAL).events;
 assert.deepEqual(add.map((e)=>e.type),['profile.draft','nav','ask.open'],'draft, then the screen, then the ask (the ask belongs to the profile screen)');
 assert.deepEqual(add[2],{type:'ask.open',kind:'name'});
 const draft={id:'n',name:'',type:'high-school',modules:[]};
 assert.deepEqual(tvKey(session({screen:'profile',focus:0,draft}),'select',LOCAL).events,[{type:'ask.open',kind:'name'}],'Select on the Name row asks');
 const ask={id:'k1',kind:'name',learner:null,screen:'profile',at:0,phase:'open'};
 assert.deepEqual(tvKey(session({screen:'profile',focus:0,draft,ask}),'select',LOCAL).events,[],'an open name ask is not asked twice');
 assert.deepEqual(tvKey(session({screen:'profile',focus:0,draft,ask}),'back',LOCAL).events,[{type:'ask.cancel',id:'k1'}],'the first Back puts the ask down');
 assert.deepEqual(tvKey(session({screen:'profile',focus:0,draft}),'back',LOCAL).events,[{type:'profile.discard'}],'the next one throws the draft away');
 // a pick below the new row moves the lamp exactly as before: the type pick lands on the age row's middle
 const t=tvKey(session({screen:'profile',focus:1,draft}),'select',LOCAL).events;
 assert.deepEqual(t.map((e)=>e.type),['profile.draft','focus']);
 const next=profileRows({...draft,type:'elementary'});assert.equal(t[1].focus,flat(next,2,likelyIx(next[2],{...draft,type:'elementary'})),'focus after a pick: the next row, one below the Name row');
 assert.equal(next[2].title,'Age');
 // Save with no name is still the reducer's to refuse
 const sv=profileRows(draft).length-1;
 assert.deepEqual(tvKey(session({screen:'profile',focus:flat(profileRows(draft),sv,0),draft}),'select',LOCAL).events,[{type:'profile.save'}]);
});

// ---- TL-13 (TV-led design 6): Math Buddy's last phone-only steps ----
test('TL-13: Select on a failed read posts the retry only when the desk may repeat it',()=>{
 const {tvKey}=keys();
 const failed=(patch={})=>session({screen:'page',pages:[page()],jobs:{read:{id:'j1',kind:'read',phase:'failed',key:'p1',error:'x',startedAt:0,...patch}}});
 const r=tvKey(failed(),'select',LOCAL);
 assert.deepEqual(r.calls,[{url:'/api/session/retry',body:{kind:'read'}}]);assert.deepEqual(r.events,[],'no hint is asked on a page that failed');
 assert.deepEqual(tvKey(failed({retry:true}),'select',LOCAL).calls.length,1);
 assert.deepEqual(tvKey(failed({retry:false}),'select',LOCAL).calls,[],'a read the desk will not repeat posts nothing');
 assert.deepEqual(tvKey(failed(),'down',LOCAL).calls,[],'only Select asks again');
 assert.deepEqual(tvKey(session({screen:'page',pages:[page()],jobs:{read:{id:'j1',kind:'read',phase:'failed',key:'other',startedAt:0}}}),'select',LOCAL).calls.map(c=>c.url),['/api/hint'],'another page\'s failed read is not this page\'s');
 assert.deepEqual(tvKey(session({screen:'page',pages:[page()],jobs:{read:{id:'j1',kind:'read',phase:'done',key:'p1',startedAt:0}}}),'select',LOCAL).calls.map(c=>c.url),['/api/hint'],'a read that did not fail: the hint as it was');
});

test('TL-13: Down on Tonight opens the paper, paired or not',()=>{
 const {tvKey}=keys();
 for(const joined of [true,false])assert.deepEqual(tvKey(session({screen:'tonight',focus:0,joined}),'down',LOCAL).events,[{type:'nav',screen:'paper',focus:0,from:'tonight'}],`joined ${joined}: the paper knows it was opened from Tonight (F10)`);
});

test('TL-13: the paper screen ends on Type a paper; Select opens the paper ask; the first Back cancels it and stays',()=>{
 const {tvKey}=keys();
 const empty=session({screen:'paper',focus:0,paper:null});
 assert.deepEqual(tvKey(empty,'select',LOCAL).events,[{type:'ask.open',kind:'paper'}],'with no paper the one stop is Type a paper');
 assert.deepEqual(tvKey(empty,'down',LOCAL).events,[],'nothing past it');
 const open={...empty,ask:askOf('paper','paper')};
 assert.deepEqual(tvKey(open,'back',LOCAL).events,[{type:'ask.cancel',id:'a1'}],'the first Back puts it down and stays');
 assert.deepEqual(tvKey(empty,'back',LOCAL).events,[{type:'nav',screen:'prepare',focus:0}],'the next Back leaves as it did when Tonight did not open it');
 assert.deepEqual(tvKey(open,'select',LOCAL).events,[],'an ask already open is not opened twice');
 assert.deepEqual(tvKey({...open,phonesLive:0},'up',LOCAL).events,[{type:'nav',screen:'pair',focus:0,from:'paper'}],'no phone: Up pairs');
 // an ask another screen opened is not this screen to cancel: Back leaves, to where the paper was opened from
 assert.deepEqual(tvKey({...empty,ask:askOf('paper','tonight')},'back',LOCAL).events,[{type:'nav',screen:'prepare',focus:0}]);
 assert.deepEqual(tvKey({...empty,back:'tonight',ask:askOf('paper','tonight')},'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}]);
});

test('F10: the second Back from the paper goes back to where it was opened: Tonight after Down on Tonight, Get ready for school otherwise',()=>{
 const {tvKey}=keys();
 const empty=session({screen:'paper',focus:0,paper:null});
 const fromTonight={...empty,back:'tonight'},fromPrepare={...empty,back:'prepare'};
 assert.deepEqual(tvKey(fromTonight,'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}],'opened from Tonight: Back is Tonight');
 assert.deepEqual(tvKey(fromPrepare,'back',LOCAL).events,[{type:'nav',screen:'prepare',focus:0}],'opened from Get ready for school: Back is there');
 // the two-step Back holds for both: an open paper ask is put down first, and the screen stays
 for(const s of [fromTonight,fromPrepare])assert.deepEqual(tvKey({...s,ask:askOf('paper','paper')},'back',LOCAL).events,[{type:'ask.cancel',id:'a1'}],`from ${s.back}: the first Back cancels`);
 // the reducer keeps a nav's `from` as the session's `back` (store.ts nav): Down on Tonight's from is what this Back reads
 assert.match(fs.readFileSync(path.join(root,'src/lib/session/store.ts'),'utf8'),/if \(e\.from\) n\.back = e\.from;/);
 assert.deepEqual(tvKey(fromTonight,'menu',LOCAL).events,[{type:'nav',screen:'prepare',focus:0}],'Menu is unchanged: the first unit');
});

test('stick pass 2026-10-20: Select on Joined with no one seated opens the learner cards, as its line says; seated, it is the desk',()=>{
 const {tvKey,LANDING_REST}=keys();
 const shown=fs.readFileSync(path.join(root,'src/tv/screens.tsx'),'utf8');
 assert.match(shown,/Paired\. Select: choose who is studying/,'the line this case holds the key to');
 assert.deepEqual(tvKey(session({screen:'joined',learner:null}),'select',LOCAL).events,[{type:'nav',screen:'learner',focus:0,from:'landing'}]);
 const rest=tvKey(session({screen:'joined'}),'select',LOCAL).events;
 assert.equal(rest.length,1);assert.equal(rest[0].screen,'landing','a seated learner goes to the desk');
 assert.equal(tvKey(session({screen:'joined',learner:null}),'back',LOCAL).events[0].screen,'landing','Back is the desk, seated or not');
});

test('stick pass 2026-10-20: Sentence help with nothing checked yet draws its one stop, Try a sentence; Select opens the ask, the lamp stays on it, and the caption follows the open ask',()=>{
 const {tvKey}=keys();
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {createElement}=require(path.join(root,'node_modules/react'));
 // next/font runs only under Next: each face module answers with its class names, as in tv-recap-test
 for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){
  const file=path.join(root,'src',f);if(require.cache[file])continue;const m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
 const {SentenceScreen}=require(path.join(root,'src/tv/screens.tsx'));
 const empty=session({subject:'english',screen:'sentence',english:null,focus:0,phonesLive:1});
 const h=renderToStaticMarkup(createElement(SentenceScreen,{s:empty,focus:0}));
 assert.match(h,/<button class="btn" data-focused="true">Try a sentence<\/button>/,'the stop Select acts on is drawn and lit');
 assert.match(h,/Select: say one sentence on your phone/);
 assert.deepEqual(tvKey(empty,'select',LOCAL).events.filter(e=>e.type==='ask.open'),[{type:'ask.open',kind:'sentence'}]);
 for(const k of ['left','right'])assert.deepEqual(tvKey(empty,k,LOCAL).events,[],`${k}: no hidden Show me the unit to walk to`);
 assert.deepEqual(tvKey({...empty,focus:1},'select',LOCAL).events.filter(e=>e.type==='nav'),[],'a stale focus does not open the unit with no sentence');
 const asked={...empty,ask:{id:'a1',kind:'sentence',learner:'ema',screen:'sentence',at:0,phase:'open'}};
 assert.match(renderToStaticMarkup(createElement(SentenceScreen,{s:asked,focus:0})),/On the phone: your sentence\. Back cancels\./,'while the ask is open the caption says so');
});

test('stick pass 2026-10-20: the paired pair screen stands its two buttons under the address, and its ticker does not say it waits for a phone while one is here',()=>{
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {createElement}=require(path.join(root,'node_modules/react'));
 for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){
  const file=path.join(root,'src',f);if(require.cache[file])continue;const m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
 const {Pair}=require(path.join(root,'src/tv/screens.tsx'));
 const draw=(p)=>renderToStaticMarkup(createElement(Pair,{s:session({screen:'pair',phoneUrl:'http://10.0.0.2:3000/phone',...p})}));
 const here=draw({joined:true,phonesLive:1});
 assert.match(here,/1 phone here/);
 assert.match(here,/class="ticker"><span>Ready for another phone<\/span>/);
 const addr=here.indexOf('type the code.'),acts=here.indexOf('data-role="pair-actions"');
 assert.ok(addr>0&&acts>addr,'the buttons follow the address line in the column');
 assert.doesNotMatch(here,/class="actions"/,'not pinned to the safe edge, where they cut the address');
 assert.match(draw({joined:true,phonesLive:0}),/class="ticker"><span>Waiting for a phone<\/span>/,'no phone here: it waits');
 const unpaired=draw({joined:false,phonesLive:0});
 assert.match(unpaired,/Waiting for a phone/);assert.doesNotMatch(unpaired,/Forget every phone/);
});

test('stick pass 2026-10-20: the rewrite status names the phone, not the Essay tab the shell dropped (TL-10), nor an analyse the phone\'s Send already runs',()=>{
 const {rewriteStatus}=keys();
 assert.equal(rewriteStatus(1),'sentence 1: rewrite it in your own words on the phone');
 assert.doesNotMatch(rewriteStatus(3),/tab|analyse again/);
 // the status stays a phone-naming one, so a desk restart still drops it (store.ts namesPhone, D2)
 assert.match(rewriteStatus(2),/\bphone\b/i);
});

test('optimize 2026-10-21: the learner switcher names the remote\'s Select, never a keyboard key the remote does not have',()=>{
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {createElement}=require(path.join(root,'node_modules/react'));
 for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){
  const file=path.join(root,'src',f);if(require.cache[file])continue;const m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
 const {Learner}=require(path.join(root,'src/tv/screens.tsx'));
 const JAKUB={id:'jakub',name:'Jakub',type:'other',modules:['english']};
 const s=session({screen:'learner',profiles:[...session().profiles,JAKUB]});
 // the seated learner's card, the other learner's card, and Add a learner: every caption the screen can draw
 for(const focus of [0,1,2]){
  const h=renderToStaticMarkup(createElement(Learner,{s,focus}));
  assert.doesNotMatch(h,/\bEnter\b/,`focus ${focus}: the Fire TV remote has no Enter key`);
  if(focus<2)assert.match(h,/Select (goes back to the desk|to sit at this desk)/,`focus ${focus}: the caption names Select`);
 }
});

/**
 * useSession run outside React: its own source, transpiled, with a three-hook stand-in for react (state, ref, effect),
 * a fake EventSource that counts what is open, and a timer queue the test runs by hand. Returns the hook's mount and
 * unmount, the streams made, and the pending timers.
 */
function runUseSession(){
 const {transpile,options}=require('./ts-load.cjs');
 const file=path.join(root,'src/tv/useSession.ts');
 const js=transpile(fs.readFileSync(file,'utf8'),{...options,fileName:file}).outputText;
 const effects=[];
 const react={useState:(v)=>[typeof v==='function'?v():v,()=>{}],useRef:(v)=>({current:v}),useEffect:(fn)=>{effects.push(fn);}};
 const streams=[],timers=[];
 class FakeES{constructor(url){this.url=url;this.closed=false;this.readyState=0;streams.push(this);}close(){this.closed=true;this.readyState=2;}}
 const g={window:{},EventSource:FakeES,setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimeout:()=>{},fetch:()=>Promise.resolve({ok:true}),Date};
 const mod={exports:{}};
 new Function('require','module','exports',...Object.keys(g),js)((id)=>id==='react'?react:require(id),mod,mod.exports,...Object.values(g));
 mod.exports.useSession();
 const cleanups=effects.map((fn)=>fn()).filter((x)=>typeof x==='function');
 return {streams,timers,unmount:()=>cleanups.forEach((c)=>c())};
}
test('optimize 2026-10-21: a reopen the stream had scheduled before the page went does not open a stream nobody owns (realtime-events subscription-lifecycle)',()=>{
 const h=runUseSession();
 assert.equal(h.streams.length,1,'control: mounting opens one stream');
 h.streams[0].onerror();
 assert.equal(h.timers.length,1,'control: an error schedules the reopen');
 h.unmount();
 assert.ok(h.streams.every((x)=>x.closed),'unmounting closes the stream it holds');
 h.timers.splice(0).forEach((t)=>t.fn());
 assert.deepEqual(h.streams.filter((x)=>!x.closed).map((x)=>x.url),[],'the late reopen leaves no stream open after the unmount');
 // while mounted the same error still reopens: the guard is for a dead owner only
 const live=runUseSession();live.streams[0].onerror();live.timers.splice(0).forEach((t)=>t.fn());
 assert.equal(live.streams.length,2,'a mounted page reopens after an error');assert.equal(live.streams[1].closed,false);
});

/**
 * Who draws a screen: the TV page's own owners (the landing, Essay Master, Math Buddy, the paper, Linga) or a case of its
 * ScreenFor switch. A screen none of them draws falls to `default: return null`, a blank stage; derived from the store's
 * Screen union, not from a list kept here.
 */
function undrawn(pageSrc){
 const {essayOwns,mathsOwns,paperOwns,lingaOwns}=keys();
 const strip=pageSrc.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 const body=strip.slice(strip.indexOf('function ScreenFor'));
 const cases=[...body.matchAll(/case "([^"]+)": return </g)].map((m)=>m[1]);
 const gaps=[];
 for(const screen of SCREENS)for(const subject of ['maths','english','essay']){
  const s=session({screen,subject});
  if(!(screen==='landing'||essayOwns(s)||mathsOwns(s)||paperOwns(s)||lingaOwns(s)||cases.includes(screen)))gaps.push(`${screen}/${subject}`);
 }
 return {cases,gaps};
}
test('optimize 2026-10-21: every screen of the store is drawn on the TV for every subject - none falls to a blank stage',()=>{
 const page=fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8');
 const {cases,gaps}=undrawn(page);
 assert.ok(cases.length>=10&&cases.includes('recap'),'control: the switch\'s cases were read');
 assert.deepEqual(gaps,[],'a screen no owner and no case draws');
 // the check bites: the same page with one case gone leaves that screen blank for every subject
 const seeded=undrawn(page.replace(/case "break": return [^\n]*\n/,''));
 assert.deepEqual(seeded.gaps,['break/maths','break/english','break/essay']);
});

test('essay write door (2026-10-22): Write from a prompt is the last stop of the lens home; Down reaches it, Select opens Writing, Back from Writing returns to it, Adult mode has none',()=>{
 const {tvKey,lensStops}=keys();
 const bottom=session({screen:'essaytype',subject:'essay',focus:3});
 assert.equal(focusAfter(bottom,tvKey(bottom,'down',LOCAL)),4,'nothing read: Down from the last lens is the plan');
 const door=session({screen:'essaytype',subject:'essay',focus:5});
 assert.equal(lensStops(door)[5],'write');
 assert.equal(focusAfter(door,tvKey(door,'up',LOCAL)),4,'Up returns to the plan');
 assert.deepEqual(tvKey(door,'select',LOCAL).events,[{type:'nav',screen:'writing',focus:0,from:'essaytype'}]);
 const fin=session({screen:'essaytype',subject:'essay',focus:5,writingTv:{promptId:'screens',stage:'finished'}});
 assert.deepEqual(tvKey(fin,'select',LOCAL).events,[{type:'writing.clear'},{type:'nav',screen:'writing',focus:0,from:'essaytype'}],'a finished episode starts over');
 assert.deepEqual(tvKey(session({screen:'writing',subject:'essay'}),'back',LOCAL).events,[{type:'nav',screen:'essaytype',focus:5}],'Back from Writing: the lens home, the lamp on the door');
 const read=essay({screen:'essaytype',focus:4});
 assert.equal(focusAfter(read,tvKey(read,'down',LOCAL)),5,'a paragraph read: Down from the last card reaches the door');
 const readDoor=essay({screen:'essaytype',focus:5});
 assert.equal(focusAfter(readDoor,tvKey(readDoor,'up',LOCAL)),4,'Up returns to the last card');
 assert.deepEqual(tvKey(session({screen:'essaytype',subject:'essay',focus:5}),'back',LOCAL).events,[{type:'nav',screen:'landing',focus:tvKey(session({screen:'essaytype',subject:'essay',focus:5}),'back',LOCAL).events[0].focus}],'Back from the door still leaves for the landing');
 const adult=session({screen:'essaytype',subject:'essay',profiles:[{id:'ema',name:'Ema',type:'adult',age:40,system:'uk',modules:['maths','english','essay']}]});
 const {isAdultHere}=keys();
 if(isAdultHere(adult))assert.equal(lensStops(adult).includes('write'),false,'Adult mode: no school prompts, no door');
});
