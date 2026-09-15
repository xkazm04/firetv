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
