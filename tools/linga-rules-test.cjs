/** Run with npm test in desk/ (directly: node tools/linga-rules-test.cjs). Uses a disposable data directory, never desk/data. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.resolve(__dirname,'../artifacts/linga-rules',String(Date.now()));process.env.DESK_DATA_DIR=data;
const {emptyEnglish}=require(path.join(root,'src/lib/english/types.ts'));
const {eligibleScenes,defaultPreferences}=require(path.join(root,'src/lib/english/curriculum.ts'));
const {cleanEnglish,mergeEvidence,validateObservations}=require(path.join(root,'src/lib/english/rules.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts'));
let answer=async()=>({json:{title:'A practice booking',goal:'Ask for help with a booking.',opening:'Hello. How can I help?'},provider:'test',ms:1});
const realText=engine.text;
engine.text=(req)=>answer(req);
const {englishCommand}=require(path.join(root,'src/lib/english/conversation.ts'));
const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
const {getLearner,recordAttempt}=require(path.join(root,'src/lib/session/learners.ts'));
after(()=>clearInterval(globalThis.__desk.ticker));
let counter=0;
function command(action,extra={}){const s=getSession();return englishCommand({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:`test-${++counter}`,...extra});}
function fresh(){dispatch({type:'reset'});dispatch({type:'subject',subject:'english'});answer=async()=>({json:{title:'A practice booking',goal:'Ask for help with a booking.',opening:'Hello. How can I help?'},provider:'test',ms:1});}
const evidence=(patch={})=>({id:'e1',episodeId:'ep1',turnId:'t1',sceneId:'booking',skill:'request',at:Date.now(),mode:'speech',supported:false,success:true,quote:'Could you help?',note:'Asked for help.',...patch});

test('age and adult confirmation are independent from English level',()=>{
 const teen={id:'t',name:'Teen',type:'high-school',age:16,modules:['english']};
 const prefs={...defaultPreferences(teen),level:'confident',adultConfirmed:true};
 assert(!eligibleScenes(teen,prefs).some(s=>s.id==='date'));
 assert(!eligibleScenes({type:'other'}, {...prefs,adultConfirmed:false}).some(s=>s.id==='date'));
 assert(eligibleScenes({type:'other'},prefs).some(s=>s.id==='date'));
 assert(!eligibleScenes({type:'elementary',age:8},prefs).some(s=>s.id==='interview'));
});
test('text, choices, assisted replies and uncertain observations cannot earn independent speaking',()=>{
 let learning=mergeEvidence(emptyEnglish(),[evidence({mode:'text'}),evidence({id:'e2',mode:'choice'}),evidence({id:'e3',supported:true}),evidence({id:'e4',supported:true})]);
 assert.equal(learning.achievements.request,'with-help');
 const context={episodeId:'ep',turnId:'t',sceneId:'booking',at:1,mode:'speech',supported:false,text:'Could you help?',skills:['request']};
 assert.equal(validateObservations([{skill:'request',quote:'invented',success:true,confidence:'clear',note:'x'}],context).length,0);
 assert.equal(validateObservations([{skill:'request',quote:'Could you help?',success:true,confidence:'uncertain',note:'x'}],context).length,0);
 assert.equal(validateObservations([{skill:'narrate',quote:'Could you help?',success:true,confidence:'clear',note:'x'}],context).length,0);
 learning=mergeEvidence(learning,[evidence({id:'e5'}),evidence({id:'e6'})]);assert.equal(learning.achievements.request,'independent');
 learning=mergeEvidence(learning,[evidence({id:'e7',episodeId:'ep2',sceneId:'team'})]);assert.equal(learning.achievements.request,'transfer');
 learning=mergeEvidence(learning,[evidence({id:'e8',success:false})]);assert.equal(learning.achievements.request,'transfer');
 assert.equal(mergeEvidence(learning,[evidence({id:'e7'})]).evidence.length,learning.evidence.length);
});
test('legacy learner migration discards malformed evidence and keeps safe defaults',()=>{assert.deepEqual(cleanEnglish(undefined),emptyEnglish());assert.equal(cleanEnglish({evidence:[{skill:'request'}]}).evidence.length,0);});
test('adult scenario cannot be started for a minor even by direct API command',async()=>{fresh();await assert.rejects(command('start',{sceneId:'date'}),e=>e.status===403);});
test('duplicate turn commits once, failed reply is retryable, and English preserves Maths across reset',async()=>{
 fresh();recordAttempt('ema','linear-one-step',true);await command('start',{sceneId:'booking'});
 const last=getSession().conversation.turns.at(-1).id;
 answer=async()=>{throw new Error('engine unavailable');};
 const input={text:'Could you help?',mode:'text',lastTurnId:last,commandId:'same-turn'};
 await assert.rejects(command('turn',input));assert.equal(getSession().conversation.turns.length,1);assert.equal(getSession().conversation.pending,null);
 answer=async()=>({json:{reply:'Of course. What is your booking name?',observations:[{skill:'request',quote:'Could you help?',success:true,confidence:'clear',note:'Asked for help.'}]},provider:'test',ms:1});
 await command('turn',input);await command('turn',input);
 assert.equal(getSession().conversation.turns.length,3);assert.equal(getLearner('ema').english.evidence.length,1);
 assert.equal(getLearner('ema').english.achievements.request,'not-tried');
 await command('finish');await command('finish',{commandId:'second-finish'}).catch(()=>{});
 assert.equal(getLearner('ema').english.sessions.length,1);
 dispatch({type:'reset'});assert.equal(getSession().englishLearning.evidence.length,1);assert.equal(getLearner('ema').skills['linear-one-step'].seen,1);
});
test('late model response cannot enter a different learner session',async()=>{
 fresh();let release;answer=()=>new Promise(r=>release=r);
 const pending=command('start',{sceneId:'booking'});
 dispatch({type:'learner.set',id:'jakub'});
 release({json:{title:'Old scene',goal:'Old goal',opening:'Hello.'},provider:'test',ms:1});
 await assert.rejects(pending,e=>e.status===409);assert.equal(getSession().learner.id,'jakub');assert.equal(getSession().conversation,null);
});
test('cancelled request cannot replace a newer scene',async()=>{
 fresh();let release;answer=()=>new Promise(r=>release=r);const old=command('start',{sceneId:'booking'});await command('leave');
 answer=async()=>({json:{title:'New scene',goal:'Find a clue.',opening:'Which clue do you want?'},provider:'test',ms:1});
 await command('start',{sceneId:'rover',replace:true});const id=getSession().conversation.id;
 release({json:{title:'Old scene',goal:'Old goal',opening:'Hello.'},provider:'test',ms:1});
 await assert.rejects(old,e=>e.status===409);assert.equal(getSession().conversation.id,id);assert.equal(getSession().conversation.title,'New scene');
});
test('coach cannot invent the learner quote and stale questions cannot accept new replies',async()=>{
 fresh();await command('start',{sceneId:'team'});const c=getSession().conversation;
 await assert.rejects(command('turn',{text:'A reply',mode:'text',lastTurnId:'old'}),e=>e.status===409);
 answer=async()=>({json:{reply:'What do you suggest?',observations:[]},provider:'test',ms:1});await command('turn',{text:'We can build together.',mode:'text',lastTurnId:c.turns.at(-1).id});
 answer=async()=>({json:{before:'I never said this',after:'An alternative',note:'Try this.'},provider:'test',ms:1});
 await assert.rejects(command('coach'));assert.equal(getSession().conversation.coaching,null);assert.equal(getSession().conversation.pending,null);
});

// ---- the level check, the plan and moments ----
const P=require(path.join(root,'src/lib/english/placement.ts'));
const {recommendScene}=require(path.join(root,'src/lib/english/curriculum.ts'));
const wrap=f=>async req=>({json:f(req),provider:'test',ms:1});
const topic=(title,audience,skill='describe')=>({title,goal:'Talk about it.',why:'You asked for it.',skill,audience,partner:'Sam · Friend',premise:'A friendly chat.',cue:'Try: I like…',quiz:{question:'Which fits?',options:['I like it because it is fun.','Yesterday.'],correct:0}});
const RIGHT='Hi! How are you?';
function checkAnswer(req){const p=JSON.parse(req.prompt);
 if(p.step==='open')throw new Error('the first question is written, never generated');
 if(p.step==='about')return {reply:'Thanks. What do you want to do in English?',selfBand:'B1',goal:'talk with friends online',interest:'games',language:'english',read:'Plays games in English.'};
 if(p.step==='task')return p.kind==='choose'?{prompt:'A friend says hi. What do you say?',line:'',options:[RIGHT,'Hi! I am fine yesterday.'],correct:0}:{prompt:'A '+p.kind+' task at '+p.band,line:p.kind==='listen'?'I left my bag on the bus this morning.':'',options:[],correct:0};
 if(p.step==='judge')return {answered:'yes',english:['A1','A2','B1'].includes(p.band)?p.band:'A2',quote:p.response.slice(0,10),note:'A clear answer.'};
 if(p.step==='summary')return {summary:'You get by in everyday talk.',focus:'Telling stories in the past'};
 if(p.step==='plan')return {topics:[topic('Gaming with friends','all'),topic('A first date','adult','relate'),topic('A job interview','older','narrate'),topic('Planning a trip','all','negotiate')].slice(0,p.count)};
 throw new Error('unexpected step '+p.step);
}
async function answerAbout(times,text='I play games in English every day with my friends.'){for(let i=0;i<times;i++){const k=getSession().check;await command('check-answer',{checkId:k.id,text,mode:'text',lastTurnId:k.turns.at(-1).id});}}

test('the level ladder is bounded, and the same answers always give the same band',()=>{
 const climb=(start,judge)=>{const marks=[];let st=P.staircase(start,marks);while(!st.done){marks.push({band:st.next,verdict:judge(st.next)});assert(marks.length<=P.MAX_TASKS);st=P.staircase(start,marks);}return {st,marks};};
 const top=climb('B2',()=>'pass');assert.equal(top.st.band,'C2');assert(top.marks.every(m=>P.isBand(m.band)));
 const bottom=climb('A1',()=>'fail');assert.equal(bottom.st.band,'A1');assert.equal(bottom.marks.length,2);
 const b1=climb('A2',b=>['A1','A2','B1'].includes(b)?'pass':'fail');assert.equal(b1.st.band,'B1');assert.equal(b1.st.confidence,'high');
 assert.deepEqual(P.staircase('A2',b1.marks),P.staircase('A2',b1.marks));
 assert.equal(P.staircase('A2',[{band:'A2',verdict:'pass'},{band:'B1',verdict:'fail'},{band:'A2',verdict:'pass'},{band:'B1',verdict:'pass'},{band:'B2',verdict:'pass'}]).confidence,'low');
 assert.equal(P.startBand(null),'A2');assert.equal(P.startBand('A1'),'A1');assert.equal(P.startBand('C1'),'B2');
 assert.equal(P.kindFor('B2',[]),'say');assert.equal(P.kindFor('A2',[]),'choose');
});
test('the verdict comes from the English the answer shows, not from how well it argues',()=>{
 const say={kind:'say',band:'B2'},listen={kind:'listen',band:'B1',revealed:false};
 assert.equal(P.verdictFor(say,'yes','C1'),'pass');assert.equal(P.verdictFor(say,'yes','B1'),'partial');assert.equal(P.verdictFor(say,'yes','A2'),'fail');
 assert.equal(P.verdictFor(say,'yes','none'),'fail');assert.equal(P.verdictFor(say,'no','C2'),'fail');assert.equal(P.verdictFor(say,'partly','B2'),'partial');
 assert.equal(P.verdictFor(listen,'yes','A2'),'pass');assert.equal(P.verdictFor(listen,'yes','none'),'partial');assert.equal(P.verdictFor({...listen,revealed:true},'yes','B1'),'partial');
 assert.equal(P.verdictFor({kind:'listen',band:'A2',revealed:true},'yes','A2'),'pass');assert.equal(P.verdictFor(listen,'no','B2'),'fail');
});
test('the level check places the learner, keeps the answer key off the session, and moves no speaking progress',async()=>{
 fresh();const before=getLearner('ema').english;answer=wrap(checkAnswer);
 await command('check-start');assert.equal(getSession().screen,'linga-check');assert.equal(getSession().check.turns.length,1);assert.match(getSession().check.turns[0].text,/^Hi Ema! You can answer in English or in your own language\./);assert.equal(getSession().check.pending,null);
 await answerAbout(3);
 let k=getSession().check;assert.equal(k.stage,'tasks');assert.equal(k.selfBand,'B1');assert.equal(k.goal,'talk with friends online');
 assert.deepEqual(Object.keys(k.task).sort(),['band','id','kind','line','options','prompt','revealed']);
 for(let guard=0;getSession().check.stage==='tasks';guard++){
  assert(guard<P.MAX_TASKS,'the check stops within five tasks');
  k=getSession().check;const t=k.task;assert(t,'a task is on screen');
  if(t.kind==='choose'){const right=t.options.indexOf(RIGHT);await command('check-task',{checkId:k.id,taskId:t.id,option:['A1','A2','B1'].includes(t.band)?right:1-right});}
  else await command('check-task',{checkId:k.id,taskId:t.id,text:'I think it was on the bus this morning.',mode:'speech'});
 }
 const after=getLearner('ema').english;
 assert.equal(getSession().screen,'linga-verdict');assert.equal(after.placement.band,'B1');assert.equal(after.placement.source,'check');assert.equal(after.preferences.level,'B1');
 assert.equal(after.evidence.length,before.evidence.length);assert.deepEqual(after.achievements,before.achievements);
});
test('a judge that misquotes the learner saves nothing, and the same answer can be sent again',async()=>{
 fresh();answer=wrap(req=>{const p=JSON.parse(req.prompt);if(p.step==='about')return {...checkAnswer(req),selfBand:'C1'};if(p.step==='judge')return {answered:'yes',english:'B2',quote:'words never said',note:'x'};return checkAnswer(req);});
 await command('check-start');await answerAbout(3);
 const k=getSession().check,t=k.task;assert.equal(t.kind,'say');assert.equal(t.band,'B2');
 await assert.rejects(command('check-task',{checkId:k.id,taskId:t.id,text:'I would argue that it depends.',mode:'text'}));
 const held=getSession().check;assert.equal(held.tasks.length,0);assert.equal(held.pending,null);assert(held.error);assert.equal(held.task.id,t.id);
 answer=wrap(checkAnswer);await command('check-task',{checkId:k.id,taskId:t.id,text:'I would argue that it depends.',mode:'text'});
 assert.equal(getSession().check.tasks.length,1);
});
test('a failed step mid-check leaves a check that carries on, and a stale check id is refused',async()=>{
 fresh();answer=wrap(checkAnswer);await command('check-start');await answerAbout(2);
 answer=wrap(req=>{if(JSON.parse(req.prompt).step==='task')throw new Error('engine down');return checkAnswer(req);});
 await assert.rejects(answerAbout(1));
 const mid=getSession().check;assert.equal(mid.stage,'tasks');assert.equal(mid.task,null);assert.equal(mid.pending,null);assert(mid.error);
 await assert.rejects(command('check-retry',{checkId:'old-check'}),e=>e.status===409);
 answer=wrap(checkAnswer);await command('check-retry',{checkId:mid.id});assert(getSession().check.task);
});
test('generated topics are filtered by age before any screen sees them, and the agreed plan leads the next conversation',async()=>{
 fresh();answer=wrap(checkAnswer);
 await command('plan-propose');const k=getSession().check;
 assert.deepEqual(k.topics.map(t=>t.title),['Gaming with friends','A job interview','Planning a trip']);
 await command('plan-agree',{checkId:k.id});assert.equal(getSession().check,null);
 const l=getLearner('ema').english;assert.equal(l.plan.topics.length,3);
 assert.equal(recommendScene(getSession().profiles.find(p=>p.id==='ema'),l).name,'Gaming with friends');
 answer=async()=>({json:{title:'Gaming',goal:'Talk about games.',opening:'Hi! What do you play?'},provider:'test',ms:1});
 await command('start');const c=getSession().conversation;assert.equal(c.sceneId,l.plan.topics[0].id);assert.equal(c.scene.premise,'A friendly chat.');
});
test('a hand-picked level is stored as self-chosen, and old three-word levels read as bands',async()=>{
 fresh();await command('level-self',{band:'B2'});
 const l=getLearner('ema').english;assert.equal(l.placement.source,'self');assert.equal(l.placement.band,'B2');assert.equal(l.preferences.level,'B2');
 await assert.rejects(command('level-self',{band:'Z9'}));
 assert.equal(cleanEnglish({preferences:{level:'developing',interest:'',goal:'',creativity:'familiar',challenge:'supportive',correction:'pauses',adultConfirmed:false}}).preferences.level,'B1');
 assert.equal(cleanEnglish({placement:{band:'Q1',at:1}}).placement,null);assert.equal(cleanEnglish({plan:{band:'B1',at:1,topics:[{title:'no id'}]}}).plan,null);
});
test('a moment needs an exact quote, holds the scene, is spaced out, and makes the next reply supported',async()=>{
 fresh();answer=async()=>({json:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'},provider:'test',ms:1});
 await command('start',{sceneId:'booking',replace:true});let c=getSession().conversation;
 answer=async()=>({json:{reply:'Sure, what name?',observations:[],moment:{kind:'fix',said:'not in the reply',better:'x',why:'y'}},provider:'test',ms:1});
 await command('turn',{text:'I have booking yesterday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 c=getSession().conversation;assert.equal(c.moment,null);assert.equal(c.turns.length,3);assert.equal(getSession().screen,'linga-talk');
 const taught=getLearner('ema').english.taught.length;
 answer=async()=>({json:{reply:'What date was it?',observations:[],moment:{kind:'fix',said:'I have booking',better:'I have a booking',why:'A booking is one thing, so it takes "a".'}},provider:'test',ms:1});
 await command('turn',{text:'I have booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 c=getSession().conversation;assert.equal(getSession().screen,'linga-moment');assert.equal(c.moment.better,'I have a booking');assert.equal(c.supported,true);
 assert.equal(getLearner('ema').english.taught.length,taught+1);
 await assert.rejects(command('turn',{text:'Another reply',mode:'text',lastTurnId:c.turns.at(-1).id}),e=>e.status===409);
 await command('moment-done');c=getSession().conversation;assert.equal(c.moment,null);assert.equal(getSession().screen,'linga-talk');
 await command('turn',{text:'I have booking for Friday, yes.',mode:'text',lastTurnId:c.turns.at(-1).id});
 assert.equal(getSession().conversation.moment,null,'no second moment on the very next turn');
});
test('an optional moment or observation that overruns its limit is dropped, and the turn still lands (real text(), stub provider)',async()=>{
 fresh();answer=async()=>({json:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'},provider:'test',ms:1});
 await command('start',{sceneId:'booking',replace:true});const c=getSession().conversation;
 const reg=require(path.join(root,'src/lib/engines/registry.ts'));
 reg.useProvider('text',{name:'stub',run:async()=>({raw:JSON.stringify({reply:'What name is it under?',supportProvided:false,
  observations:[{skill:'request',quote:'I has booking',success:false,confidence:'clear',note:'n'.repeat(400)}],
  moment:{kind:'fix',said:'I has booking',better:'I have a booking',why:'w'.repeat(300)}})})});
 engine.text=realText;
 try{await command('turn',{text:'I has booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});}
 finally{engine.text=(req)=>answer(req);reg.resetProviders();}
 const after=getSession().conversation;
 assert.equal(after.error,'');assert.equal(after.turns.length,3);assert.equal(after.turns.at(-1).text,'What name is it under?');
 assert.equal(after.moment,null,'the over-long moment is dropped, not the turn');
});
test('a topic in the learner\'s own words may run long, and a too-long one names the limit',async()=>{
 fresh();answer=wrap(req=>{const p=JSON.parse(req.prompt);return p.step==='plan'&&p.learnerAsked?{topics:[topic('A logistics job interview','all','narrate')]}:checkAnswer(req);});
 await command('plan-propose');const k=getSession().check,before=k.topics.length;
 await assert.rejects(command('plan-add',{checkId:k.id,text:'x'.repeat(P.TOPIC_ASK_MAX+1)}),e=>e.status===400&&e.message.includes(String(P.TOPIC_ASK_MAX)));
 const long='I have a job interview on Friday for a logistics coordinator role and want to practise explaining my experience, a delivery problem I solved, and asking about shifts.';
 assert(long.length>160&&long.length<=P.TOPIC_ASK_MAX);
 await command('plan-add',{checkId:k.id,text:long});assert.equal(getSession().check.topics.length,before+1);
});
test('the partner is told the limits that topic filtering cannot enforce',async()=>{
 fresh();let system='';answer=async req=>{system=req.system;return {json:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'},provider:'test',ms:1};};
 await command('start',{sceneId:'booking',replace:true});
 assert.match(system,/not an adult\. Never propose, agree to, plan or play dating/);assert.match(system,/never promise, imply or agree to a romantic relationship/);
 dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true},notes:[]});
 await command('start',{sceneId:'date',replace:true});
 assert.doesNotMatch(system,/not an adult/);assert.match(system,/never express romantic or sexual attraction/);
});
test('beginners meet fewer moments: at most two a rehearsal, three replies apart',async()=>{
 fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),level:'A2',correction:'as-needed'},notes:[]});
 answer=async()=>({json:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'},provider:'test',ms:1});
 await command('start',{sceneId:'booking',replace:true});
 answer=async()=>({json:{reply:'I see. Anything else?',observations:[],moment:{kind:'fix',said:'I has booking',better:'I have a booking',why:'"I" goes with "have".'}},provider:'test',ms:1});
 const stoppedAt=[];
 for(let i=1;i<=10;i++){const c=getSession().conversation;await command('turn',{text:'I has booking number '+i+'.',mode:'text',lastTurnId:c.turns.at(-1).id});if(getSession().conversation.moment){stoppedAt.push(i);await command('moment-done');}}
 assert.deepEqual(stoppedAt,[1,5]);
});
test('topics for a learner with no known goal wait for one, and the goal they give reaches the plan',async()=>{
 fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true},notes:[]});
 let planPrompt=null;answer=async req=>{const p=JSON.parse(req.prompt);if(p.step!=='plan')throw new Error('unexpected '+p.step);planPrompt=p;return {json:{topics:[topic('A logistics job interview','all','narrate')]},provider:'test',ms:1};};
 await command('plan-propose');let k=getSession().check;
 assert.equal(k.askGoal,true);assert.equal(k.topics.length,0);assert.equal(planPrompt,null,'no topics are cut before the goal is known');
 await command('plan-goal',{checkId:k.id,text:'A job interview for a logistics role on Friday'});
 k=getSession().check;assert.equal(k.askGoal,false);assert.equal(k.topics.length,1);assert.equal(planPrompt.learner.goal,'A job interview for a logistics role on Friday');
 assert.equal(getLearner('jakub').english.preferences.goal,'A job interview for a logistics role on Friday');
 const plan=answer;fresh();answer=plan;dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('plan-propose');assert.equal(getSession().check.askGoal,false,'a goal once given is not asked again');assert.equal(getSession().check.topics.length,1);
});

// ---- one screen model: the TV, the phone home, the PC test bar and the LT driver all read lib/english/view.ts
const view=()=>require(path.join(root,'src/lib/english/view.ts'));
const {saveEnglish}=require(path.join(root,'src/lib/session/learners.ts'));
const DRIVER=path.resolve(__dirname,'../uat/driver/linga-text.cjs');
const placed=(band='B1')=>({at:1,band,selfBand:null,confidence:'medium',source:'check',summary:'You get by in everyday talk.',focus:'Telling stories',tasks:[]});
const planned=(...ids)=>({at:1,band:'B1',topics:ids.map(id=>({id,...topic('Topic '+id,'all')}))});
const played=(...ids)=>ids.map((sceneId,i)=>({id:'s'+i,sceneId,title:sceneId,at:i+1,turns:2}));
const convo=(patch={})=>({id:'c1',learnerId:'ema',sceneId:'booking',title:'A booking',goal:'Fix the booking.',partner:'Robin · Receptionist',focusSkill:'request',reviewSkill:'repair',preferences:defaultPreferences(),turns:[{id:'p1',role:'partner',text:'Hello. How can I help?'}],coaching:null,moment:null,moments:[],phase:'conversation',pending:null,error:'',paused:false,capture:false,captureAt:0,audioNonce:0,supported:false,cue:'',quizOpen:false,commands:[],evidence:[],startedAt:1,...patch});
const checkOf=(patch={})=>({id:'k1',learnerId:'ema',stage:'about',turns:[{id:'q1',role:'tutor',text:'Where do you use English in your life?'}],selfBand:null,goal:'',interest:'',read:'',task:null,tasks:[],placement:null,topics:[],pending:null,error:'',commands:[],audioNonce:0,startedAt:1,...patch});
const chooseTask={id:'t1',band:'A2',kind:'choose',prompt:'A friend says hi. What do you say?',line:'',options:[RIGHT,'Hi! I am fine yesterday.'],revealed:false};
/** A fixture as a session the view reads; install() puts the same state in the store so a command can run on it. */
const fixture=(screen,{conversation=null,check=null,...learning}={})=>({screen,conversation,check,learning:{...emptyEnglish(),...learning}});
function sessionOf(fx){fresh();return {...getSession(),screen:fx.screen,conversation:fx.conversation,check:fx.check,englishLearning:fx.learning};}
function install(fx){fresh();saveEnglish('ema',fx.learning);dispatch({type:'linga.changed',conversation:fx.conversation,check:fx.check,screen:fx.screen});return getSession();}
const HOMES={
 'resume':fixture('linga',{conversation:convo({paused:true}),placement:placed(),plan:planned('p-a','p-b')}),
 'check-part-way':fixture('linga',{check:checkOf({stage:'tasks',turns:[],task:chooseTask})}),
 'no-placement':fixture('linga'),
 'no-plan':fixture('linga',{placement:placed()}),
 'plan-done':fixture('linga',{placement:placed(),plan:planned('p-a','p-b'),sessions:played('p-a','p-b')}),
 'next-topic':fixture('linga',{placement:placed(),plan:planned('p-a','p-b'),sessions:played('p-a')}),
};
const SWEEP={...HOMES,
 about:fixture('linga-check',{check:checkOf()}),
 choose:fixture('linga-check',{check:checkOf({stage:'tasks',turns:[],task:chooseTask})}),
 verdict:fixture('linga-verdict',{placement:placed(),check:checkOf({stage:'verdict',turns:[],placement:placed()})}),
 topics:fixture('linga-plan',{placement:placed(),check:checkOf({stage:'plan',turns:[],topics:planned('p-a','p-b').topics})}),
 quiz:fixture('linga-talk',{placement:placed(),conversation:convo({quizOpen:true,cue:'Try: Could you check?'})}),
 paused:fixture('linga-talk',{placement:placed(),conversation:convo({paused:true,error:'The tutor could not complete that turn.'})}),
 recap:fixture('linga-recap',{placement:placed(),conversation:convo({phase:'finished',moments:[{id:'m1',kind:'fix',said:'I has booking',better:'I have a booking',why:'"I" goes with "have".',turnId:'l1',at:1},{id:'m2',kind:'word',said:'rezervace',better:'reservation',why:'The booking itself.',turnId:'l2',at:2}]})}),
 scenes:fixture('linga-scenes',{placement:placed()}),
};
const offeredBy=v=>[...v.actions,...v.footer,...v.phone];

test('view case 1: home decides six named states, the TV actions follow them, and the phone StartPanel renders all six',()=>{
 const V=view();
 assert.deepEqual([...V.HOME_STATES],Object.keys(HOMES));
 const want={'resume':['carry-on','choose-situation'],'check-part-way':['carry-on-check','restart-check'],'no-placement':['find-level','pick-level'],'no-plan':['see-topics','choose-situation'],'plan-done':['new-topics','talk-again'],'next-topic':['start-talking','choose-situation']};
 for(const [state,fx] of Object.entries(HOMES)){
  const s=sessionOf(fx);
  assert.equal(V.lingaHome(s),state);
  assert.deepEqual(V.lingaView(s,{}).actions.map(a=>a.id),want[state],state);
 }
 const phone=fs.readFileSync(path.join(root,'src/english/LingaPhone.tsx'),'utf8'),start=phone.slice(phone.indexOf('function StartPanel'));
 assert.match(start,/lingaHome\(/,'the phone StartPanel asks the view which home it is');
 for(const state of V.HOME_STATES)assert.match(start,new RegExp(`case "${state}"`),`the phone renders ${state}`);
});
test('view case 2: Resume on a paused scene runs the resume command, which clears the error',async()=>{
 const V=view(),s=install(SWEEP.paused),resume=V.lingaView(s,{}).actions.find(a=>a.id==='resume');
 assert(resume,'a paused scene offers Resume');assert.equal(resume.run.command.action,'resume');
 await command(resume.run.command.action,resume.run.command.extra??{});
 const c=getSession().conversation;assert.equal(c.paused,false);assert.equal(c.error,'');
});
test('view case 3: the recap text carries each moment to keep, as the phone lists them',()=>{
 const V=view(),text=V.viewText(V.lingaView(sessionOf(SWEEP.recap),{}));
 for(const m of SWEEP.recap.conversation.moments){assert(text.includes(m.said),m.said);assert(text.includes(m.better),m.better);}
});
test('view case 4: the quiz keeps a typed answer, as on the phone, and the test bar takes it from the view',()=>{
 const V=view(),a=V.lingaView(sessionOf(SWEEP.quiz),{}).answer;
 assert(a,'an answer target during the quiz');assert.equal(a.action,'turn');assert.equal(a.lastTurnId,'p1');
 assert.match(fs.readFileSync(path.join(root,'src/english/LingaTestBar.tsx'),'utf8'),/lingaView\(/);
});
test('view case 5: every offered action is a real command, a nav to a real screen, or a declared local step',async()=>{
 const V=view(),store=fs.readFileSync(path.join(root,'src/lib/session/store.ts'),'utf8');
 const screens=[...store.match(/export type Screen = ([^;]+);/)[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
 const sample={text:'I like it.',option:0,band:'B1',topicId:'p-a',sceneId:'booking'};
 const uiKeys=['menu','picking','sceneIndex','chapter'];
 answer=async req=>{let p={};try{p=JSON.parse(req.prompt);}catch{}return {json:p.step?checkAnswer(req):{title:'T',goal:'G',opening:'Hi?',reply:'Ok?',observations:[],before:'I like',after:'I really like',note:'n'},provider:'test',ms:1};};
 let checked=0;
 for(const [name,fx] of Object.entries(SWEEP))for(const ui of [{},{menu:true},{picking:'B1'}]){
  const v=V.lingaView(sessionOf(fx),ui);
  const all=[...offeredBy(v),...(v.answer?[{id:'answer',run:{command:{action:v.answer.action,extra:{lastTurnId:v.answer.lastTurnId,taskId:v.answer.taskId}}},needs:'text'}]:[])];
  for(const a of all){
   const where=`${name}${ui.menu?' (menu)':ui.picking?' (picker)':''} · ${a.id}`;
   assert.equal(typeof a.run,'object',where);assert(a.run.command||a.run.nav||a.run.ui||a.run.focus!==undefined,`${where} does something`);
   if(a.run.nav)assert(screens.includes(a.run.nav.screen),`${where} goes to a real screen`);
   if(a.run.ui)assert(Object.keys(a.run.ui).every(k=>uiKeys.includes(k)),`${where} is a declared local step`);
   if(a.run.command){
    const s=install(fx);
    const extra={...(a.run.command.extra??{}),...(a.needs?{[a.needs]:sample[a.needs]}:{}),...(a.needs==='text'?{mode:'text'}:{})};
    try{await englishCommand({action:a.run.command.action,learnerId:s.learner.id,episodeId:s.conversation?.id,checkId:s.check?.id,commandId:`sweep-${++counter}`,...extra});}
    catch(e){assert.doesNotMatch(String(e.message),/Unknown .*action/,where);}
   }
   checked++;
  }
 }
 assert(checked>60,`swept ${checked} actions`);
});
test('view case 6: the driver\'s action list is the view\'s id list, not a hand copy',()=>{
 const V=view(),seen=new Set();
 for(const fx of Object.values(SWEEP))for(const ui of [{},{menu:true},{picking:'A2'}]){const v=V.lingaView(sessionOf(fx),ui);offeredBy(v).forEach(a=>seen.add(a.id));if(v.answer)seen.add(v.answer.id);}
 for(const id of seen)assert(V.VIEW_ACTION_IDS.includes(id),`${id} is declared in VIEW_ACTION_IDS`);
 const src=fs.readFileSync(DRIVER,'utf8');
 assert.match(src,/require\.main === module/,'the driver only runs when it is the main module');
 assert.doesNotMatch(src,/const ACTIONS = \[/,'no hand list of action ids');
 require('node:child_process').execFileSync(process.execPath,['--check',DRIVER]);
 assert.deepEqual(require(DRIVER).actionIds(),[...V.VIEW_ACTION_IDS,'done']);
});
test('view case 7 GUARD: the check speaks its question, and a paused scene stays silent',()=>{
 const V=view();
 const about=V.lingaView(sessionOf(SWEEP.about),{}).spoken;assert.equal(about.line,'Where do you use English in your life?');assert.equal(about.blocked,false);
 assert.equal(V.lingaView(sessionOf(SWEEP.paused),{}).spoken.blocked,true);
});
test('view case 8 GUARD: a choose task shows both replies and never which one is right',()=>{
 const V=view(),v=V.lingaView(sessionOf(SWEEP.choose),{});
 assert.deepEqual(v.hero.options,chooseTask.options);
 assert.doesNotMatch(JSON.stringify(v),/"correct"/);
 assert.deepEqual(v.actions.filter(a=>a.id==='choose').map(a=>a.run.command.extra.option),[0,1]);
});
