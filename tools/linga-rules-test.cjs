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
function fresh(){dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});answer=async()=>({json:{title:'A practice booking',goal:'Ask for help with a booking.',opening:'Hello. How can I help?'},provider:'test',ms:1});}
const evidence=(patch={})=>({id:'e1',episodeId:'ep1',turnId:'t1',sceneId:'booking',skill:'request',at:Date.now(),mode:'speech',supported:false,success:true,quote:'Could you help?',note:'Asked for help.',...patch});

test('age and adult confirmation are independent from English level',()=>{
 const teen={id:'t',name:'Teen',type:'high-school',age:16,modules:['english']};
 const prefs={...defaultPreferences(teen),level:'confident',adultConfirmed:true};
 assert(!eligibleScenes(teen,prefs).some(s=>s.id==='date'));
 assert(!eligibleScenes({type:'other'}, {...prefs,adultConfirmed:false}).some(s=>s.id==='date'));
 assert(eligibleScenes({type:'other'},prefs).some(s=>s.id==='date'));
 assert(!eligibleScenes({type:'elementary',age:8},prefs).some(s=>s.id==='interview'));
});
// Family W10 (owner decision D4) revised this row on purpose: typed replies now count toward "on your own" as spoken
// ones do; choices, assisted replies and uncertain observations still never do. It pinned "speech only" before.
test('choices, assisted replies and uncertain observations cannot earn "on your own"; a typed reply counts as a spoken one (D4)',()=>{
 let learning=mergeEvidence(emptyEnglish(),[evidence({mode:'text'}),evidence({id:'e2',mode:'choice',supported:false}),evidence({id:'e3',supported:true}),evidence({id:'e4',supported:true})]);
 assert.equal(learning.achievements.request,'with-help','one unsupported typed reply is not yet two');
 assert.equal(mergeEvidence(emptyEnglish(),[evidence({mode:'text'}),evidence({id:'e2',mode:'text'})]).achievements.request,'independent','two unsupported typed replies are on your own');
 assert.equal(mergeEvidence(emptyEnglish(),['c1','c2','c3'].map(id=>evidence({id,mode:'choice',supported:false}))).achievements.request,'not-tried','a picked phrase never counts, not even unsupported');
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
 assert.equal(getLearner('ema').english.achievements.request,'with-help','a typed reply after a supported opening counts, as helped (D4; it read not-tried while only speech counted)');
 await command('finish');await command('finish',{commandId:'second-finish'}).catch(()=>{});
 assert.equal(getLearner('ema').english.sessions.length,1);
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});assert.equal(getSession().englishLearning.evidence.length,1);assert.equal(getLearner('ema').skills['linear-one-step'].seen,1);
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
const scene=(title,premise='A chat in the office.')=>({title,premise});
test('a topic touches the interest when its title or premise names one of the interest\'s words, in any common form',()=>{
 assert.deepEqual(P.interestWords('travelling and cooking'),['travel','cook']);
 assert.deepEqual(P.interestWords('I love really good video games'),['video','gam']);
 assert.deepEqual(P.interestWords(''),[]);assert.deepEqual(P.interestWords('  and the  '),[],'stop words alone are no interest');
 const w=P.interestWords('travelling and cooking');
 assert(P.touchesInterest(scene('Cooking dinner for friends'),w));
 assert(P.touchesInterest(scene('Asking for directions','You are a traveller lost in Porto and ask a local the way.'),w),'the premise counts');
 assert(P.touchesInterest(scene('Travel plans with a colleague'),w));assert(P.touchesInterest(scene('Sharing a recipe','You cooked a new dish and explain it.'),w));
 assert(!P.touchesInterest(scene('Share your idea in a team meeting'),w));
 assert(!P.touchesInterest({title:'A meeting at work',premise:'Agree next steps with your manager.',why:'You love cooking.'},w),'why is not the scene');
 assert(!P.touchesInterest(scene('Booking a table','A trip to Rome with a recipe book.'),w),'known limit: related words (trip, recipe) do not count');
 assert(!P.touchesInterest(scene('Cooking dinner'),[]),'no interest known: nothing touches it');
 assert(P.touchesInterest(scene('Gaming with friends'),P.interestWords('games')));
 const plan=[scene('Share your idea in a team meeting'),scene('Summarise a project update'),scene('Cooking for your team'),scene('Planning a trip')];
 assert.equal(plan.filter(t=>P.touchesInterest(t,w)).length,1);
 assert.equal(plan.slice(0,2).filter(t=>P.touchesInterest(t,w)).length,0);
});
test('a plan that misses a known interest is asked for once more with the gap named; no topic is written by the desk',async()=>{
 const setUp=async interest=>{fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
  await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true,goal:'speak more fluently in meetings',interest},notes:[]});};
 const work=[topic('Share your idea in a team meeting','all','relate'),topic('Summarise a project update','all','narrate')];
 const withCooking=[topic('Share your idea in a team meeting','all','relate'),topic('Cooking dinner for your team','all','describe')];
 let calls=[];const plans=(...answers)=>{calls=[];answer=async req=>{const p=JSON.parse(req.prompt);if(p.step!=='plan')throw new Error('unexpected '+p.step);calls.push(p);return {json:{topics:answers[Math.min(calls.length-1,answers.length-1)].slice(0,p.count)},provider:'test',ms:1};};};
 await setUp('travelling and cooking');plans(work,withCooking);await command('plan-propose');
 assert.equal(calls.length,2);assert.match(calls[0].task,/set at least two in their interest/);assert.match(calls[1].task,/no topic set in the learner's interest/);assert.match(calls[1].task,/Share your idea in a team meeting/);
 assert.deepEqual(getSession().check.topics.map(t=>t.title),withCooking.map(t=>t.title),'the second answer, which carries the interest, is the plan');
 await setUp('travelling and cooking');plans(work,work);await command('plan-propose');
 assert.equal(calls.length,2);assert.deepEqual(getSession().check.topics.map(t=>t.title),work.map(t=>t.title),'a second miss keeps the first plan: no topic is made up');
 await setUp('travelling and cooking');plans(withCooking);await command('plan-propose');assert.equal(calls.length,1,'a plan that carries the interest is not asked again');
 let k=getSession().check;const workTopic=k.topics.find(t=>t.title.startsWith('Share'));plans([topic('Chair a short stand-up','all','request')]);
 await command('plan-swap',{checkId:k.id,topicId:workTopic.id});assert.equal(calls.length,1,'a swap that leaves an interest topic in the plan is free');
 k=getSession().check;const cookTopic=k.topics.find(t=>t.title.startsWith('Cooking'));plans([topic('Chair a long meeting','all','request')],[topic('Travel tips at lunch','all','request')]);
 await command('plan-swap',{checkId:k.id,topicId:cookTopic.id});assert.equal(calls.length,2,'swapping out the last interest topic asks for one back');
 assert(getSession().check.topics.some(t=>t.title==='Travel tips at lunch'));
 await setUp('');plans(work);await command('plan-propose');assert.equal(calls.length,1,'no interest known: no requirement');assert.doesNotMatch(calls[0].task,/interest/);
 k=getSession().check;plans([topic('Talk about cooking','all','describe')]);await command('plan-add',{checkId:k.id,text:'my weekend'});assert.equal(calls.length,1);
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
const CERT_OLD={id:'cert-A2-old',at:new Date(2026,5,12).getTime(),band:'A2',topics:['Topic p-a'],skills:[{skill:'contact',mode:'spoken',quote:'Hi, I am Ema.',at:1}],checkAt:1};
const CERT_NEW={id:'cert-B1-new',at:new Date(2026,8,20).getTime(),band:'B1',topics:['Topic p-a','Topic p-b'],skills:[{skill:'contact',mode:'written',quote:'Nice to meet you.',at:2}],checkAt:2};
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
 // Family W10: a certificate not yet opened on home, the plate, and the list of them (tools/cert-rules-test.cjs has the rules)
 'cert-home':fixture('linga',{placement:placed(),plan:planned('p-a','p-b'),sessions:played('p-a'),certificates:[CERT_OLD,CERT_NEW],seenIds:[CERT_OLD.id]}),
 cert:fixture('linga-cert',{placement:placed(),certificates:[CERT_OLD,CERT_NEW],seenIds:[CERT_OLD.id,CERT_NEW.id]}),
 certs:fixture('linga-certs',{placement:placed(),certificates:[CERT_OLD,CERT_NEW],seenIds:[CERT_OLD.id,CERT_NEW.id]}),
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
 const uiKeys=['menu','picking','sceneIndex','chapter','cert'];
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

// ---- help that answers the question on screen: a code-run rescue ladder per partner line
const BOOKING_CUE='Try asking: Could you check the date, please?';
const LADDER={simpler:'What day do you come?',meaning:'date: the day, like Friday',starter:'I need the room on …'};
let calls=0;
/** A stubbed engine that counts its calls: the opening, then every turn answers with `reply` and `help`. */
function ladderEngine(turn,opening={title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?',supportProvided:false}){
 calls=0;answer=async req=>{calls++;const p=JSON.parse(req.prompt);return {json:p.submittedReply?turn(p):opening,provider:'test',ms:1};};
}
async function booked(turn,opening){fresh();ladderEngine(turn,opening);await command('start',{sceneId:'booking',replace:true});}
const reply=(text='I need a room.')=>command('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
const said=(text,patch={})=>()=>({reply:text,supportProvided:false,observations:[],...patch});
const observed=q=>[{skill:'request',quote:q,success:true,confidence:'clear',note:'Asked clearly.'}];

test('ladder case 1: three cues walk simpler, meaning, starter; only the starter makes the reply supported',async()=>{
 await booked(said('Which date do you need?',{help:LADDER}));await reply();
 const V=view(),walk=[];
 for(let i=0;i<3;i++){await command('cue');const c=getSession().conversation;walk.push([c.cue,c.help&&c.help.rung,c.supported,V.lingaView(getSession(),{}).captionTag]);}
 assert.deepEqual(walk,[[LADDER.simpler,1,false,'Said more simply'],[LADDER.meaning,2,false,'What it means'],[LADDER.starter,3,true,'A way to start']]);
});
test('ladder case 2: help follows the partner\'s current question, never the last one or the scene\'s static cue (the Tomas case)',async()=>{
 const A={simpler:'Your dog\'s name?',meaning:'name: what you call him',starter:'My dog is called …'};
 const B={simpler:'Does he like his ball?',meaning:'ball: the round toy he plays with',starter:'He likes …'};
 await booked(said('Does Pip play with his ball every day?',{help:B}),{title:'A new dog',goal:'Talk about a dog.',opening:'What is your dog\'s name, then?',supportProvided:false,help:A});
 await command('cue');assert.equal(getSession().conversation.cue,A.simpler);
 await reply('His name is Pip.');await command('cue');
 const cue=getSession().conversation.cue;
 assert.equal(cue,B.simpler);
 for(const x of [...Object.values(A),BOOKING_CUE])assert.notEqual(cue,x);
});
test('ladder case 3: a reply after the meaning rung is independent evidence; after the starter it is supported',async()=>{
 await booked(p=>({reply:'Which date do you need?',supportProvided:false,observations:observed(p.submittedReply),help:LADDER}));
 await reply('Could you check my booking?');await command('cue');await command('cue');
 await reply('Could you check it for Friday?');
 let c=getSession().conversation,learner=c.turns.at(-2);
 assert.equal(learner.supported,false);assert(c.evidence.length&&c.evidence.filter(e=>e.turnId===learner.id).every(e=>e.supported===false));
 await command('cue');await command('cue');await command('cue');
 await reply('Could you check the Friday room?');
 c=getSession().conversation;learner=c.turns.at(-2);
 assert.equal(learner.supported,true);assert(c.evidence.filter(e=>e.turnId===learner.id).length&&c.evidence.filter(e=>e.turnId===learner.id).every(e=>e.supported===true));
});
test('ladder case 4: unrevealed rungs stay in server memory, off the session',async()=>{
 await booked(said('Which date do you need?',{help:LADDER}));await reply();
 let json=JSON.stringify(getSession());for(const x of Object.values(LADDER))assert(!json.includes(x),`not yet on the session: ${x}`);
 await command('cue');json=JSON.stringify(getSession());
 assert(json.includes(LADDER.simpler));assert(!json.includes(LADDER.meaning));assert(!json.includes(LADDER.starter));
});
test('ladder case 5: help.ts drops a malformed rung and the turn still lands; with no valid rung the cue falls back to the scene cue',async()=>{
 const partner='Which date do you need?';
 await booked(p=>({reply:partner,supportProvided:false,observations:observed(p.submittedReply),help:{simpler:partner,meaning:LADDER.meaning,starter:'I need a room for Friday.'}}));
 await reply('Could you check my booking?');
 let c=getSession().conversation;assert.equal(c.turns.at(-1).text,partner);assert.equal(c.evidence.length,1);
 await command('cue');c=getSession().conversation;assert.equal(c.cue,LADDER.meaning);assert.equal(c.supported,false);
 await command('cue');c=getSession().conversation;assert.equal(c.cue,LADDER.meaning,'no rung past the last valid one');
 ladderEngine(said(partner,{help:{simpler:partner,meaning:'',starter:'I need a room for Friday.'}}));
 await reply('Friday, please.');await command('cue');
 c=getSession().conversation;assert.equal(c.cue,BOOKING_CUE);assert.equal(c.supported,true);
 // through the real engine: help is optional and unchecked there, so a help the schema would refuse costs a rung, not the turn
 const reg=require(path.join(root,'src/lib/engines/registry.ts'));
 reg.useProvider('text',{name:'stub',run:async()=>({raw:JSON.stringify({reply:'And for how many nights?',supportProvided:false,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'x'.repeat(400),meaning:'nights: how many times you sleep there',starter:7}})})});
 engine.text=realText;
 try{await reply('For Friday.');}finally{engine.text=(req)=>answer(req);reg.resetProviders();}
 c=getSession().conversation;assert.equal(c.error,'');assert.equal(c.turns.at(-1).text,'And for how many nights?');
 await command('cue');assert.equal(getSession().conversation.cue,'nights: how many times you sleep there');
});
test('ladder case 6: a cue makes no engine call, and a ladder lost to a restart falls back to the scene cue',async()=>{
 await booked(said('Which date do you need?',{help:LADDER}));await reply();
 const before=calls;await command('cue');await command('cue',{commandId:'same-cue'});await command('cue',{commandId:'same-cue'});assert.equal(calls,before);
 assert.equal(getSession().conversation.help.rung,2,'a retried cue climbs one rung, not two');
 await reply('Friday.');globalThis.__lingaHelp.clear();
 await command('cue');const c=getSession().conversation;assert.equal(c.cue,BOOKING_CUE);assert.equal(c.supported,true);assert.equal(calls,before+1);
});
test('ladder case 7 GUARD: a partner line with no help gives today\'s scene cue, supported',async()=>{
 await booked(said('Which date do you need?'));await reply();
 await command('cue');const c=getSession().conversation;assert.equal(c.cue,BOOKING_CUE);assert.equal(c.supported,true);
});

// ---- the turn: one named state and one table (lib/english/turn.ts) the server enforces and the view reads
const turn=()=>require(path.join(root,'src/lib/english/turn.ts'));
const REPLIED=[{id:'p1',role:'partner',text:'Hello. How can I help?'},{id:'l1',role:'learner',text:'I am work in hotel',mode:'text'},{id:'p2',role:'partner',text:'Which hotel is it?'}];
const MOMENT={id:'l1:moment',kind:'fix',said:'I am work',better:'I work',why:'Work is the verb here.',turnId:'l1',at:1};
/** One conversation per turn state, and the screen it stands on. */
const TURN_STATES={
 preparing:['linga-talk',convo({turns:[],pending:'held'})],
 waiting:['linga-talk',convo({turns:REPLIED,pending:'held'})],
 paused:['linga-talk',convo({turns:REPLIED,paused:true})],
 moment:['linga-moment',convo({turns:REPLIED,moment:MOMENT,moments:[MOMENT]})],
 coaching:['linga-coach',convo({turns:REPLIED,phase:'coaching',coaching:{before:'I am work in hotel',after:'I work in a hotel',note:'Say what you do with the verb alone.'}})],
 quiz:['linga-talk',convo({turns:REPLIED,quizOpen:true,cue:'Try: Could you check?'})],
 'your-turn':['linga-talk',convo({turns:REPLIED})],
 finished:['linga-recap',convo({turns:REPLIED,phase:'finished'})],
 unprepared:['linga-talk',convo({turns:[]})],
};
const CONVERSATION_ACTIONS=['turn','cue','quiz','choice','coach','replay','capture','pause','resume','repeat','leave','finish','moment-done'];
/** A stub engine that answers every conversation call well: the opening, a turn, a coach that quotes the reply, a replay. */
function answerAll(){answer=async req=>{const p=JSON.parse(req.prompt);return {json:/^Coach/.test(p.task??'')?{before:p.submittedReply.slice(0,6),after:'I work in a hotel',note:'Try the verb alone.'}:{title:'T',goal:'G',opening:'Hi?',reply:'Ok. And then?',observations:[]},provider:'test',ms:1};};}
const extraFor=(action,c)=>action==='turn'?{text:'I like it.',mode:'text',lastTurnId:c.turns.at(-1)?.id}:action==='choice'?{option:0}:action==='capture'?{active:true}:{};

test('turn case 1: each fixture names its state, and paused while a reply is pending is waiting',()=>{
 const T=turn();
 for(const [name,[,c]] of Object.entries(TURN_STATES))assert.equal(T.turnState(c),name,name);
 assert.equal(T.turnState(convo({turns:REPLIED,paused:true,pending:'held'})),'waiting','precedence: a pending reply wins over paused');
});
test('turn case 2: pause during a turn in flight is refused, and the turn lands with its evidence',async()=>{
 fresh();await command('start',{sceneId:'booking',replace:true});
 let release;answer=()=>new Promise(r=>release=r);
 const inflight=command('turn',{text:'Could you help?',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id,commandId:'held-turn'});
 await assert.rejects(command('pause'),e=>e.status===409);
 assert.equal(getSession().conversation.paused,false);
 release({json:{reply:'Of course. What is the name?',observations:[{skill:'request',quote:'Could you help?',success:true,confidence:'clear',note:'Asked for help.'}]},provider:'test',ms:1});
 await inflight;
 const c=getSession().conversation;assert.equal(c.turns.length,3);assert.equal(c.evidence.length,1);assert.equal(c.pending,null);
});
test('turn case 3: resume during a turn in flight is refused, the token stays, and the reply lands',async()=>{
 fresh();await command('start',{sceneId:'booking',replace:true});
 let release;answer=()=>new Promise(r=>release=r);
 const inflight=command('turn',{text:'Could you help?',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id,commandId:'held-reply'});
 await assert.rejects(command('resume'),e=>e.status===409);
 assert.equal(getSession().conversation.pending,'held-reply');
 release({json:{reply:'Of course. What is the name?',observations:[]},provider:'test',ms:1});
 await inflight;
 assert.equal(getSession().conversation.turns.length,3);
});
test('turn case 4: in every state the view offers, an enabled conversation action is one the server accepts',async()=>{
 const V=view(),sample={text:'I like it.',option:0,band:'B1',topicId:'p-a',sceneId:'booking'};
 const sweep={...SWEEP,...Object.fromEntries(Object.entries(TURN_STATES).map(([name,[screen,c]])=>['turn '+name,fixture(screen,{placement:placed(),conversation:c})])),
  'paused+pending':fixture('linga-talk',{placement:placed(),conversation:convo({turns:REPLIED,paused:true,pending:'held'})})};
 let checked=0;
 for(const [name,fx] of Object.entries(sweep))for(const ui of [{},{menu:true}]){
  const v=V.lingaView(sessionOf(fx),ui);
  const all=[...offeredBy(v),...(v.answer?[{id:'answer',run:{command:{action:v.answer.action,extra:{lastTurnId:v.answer.lastTurnId}}},needs:'text'}]:[])];
  for(const a of all){
   if(a.disabled||!a.run.command||!CONVERSATION_ACTIONS.includes(a.run.command.action))continue;
   const where=`${name}${ui.menu?' (menu)':''} · ${a.id} (${a.run.command.action})`;
   const s=install(fx);answerAll();
   const extra={...extraFor(a.run.command.action,s.conversation),...(a.run.command.extra??{}),...(a.needs?{[a.needs]:sample[a.needs]}:{}),...(a.needs==='text'?{mode:'text'}:{})};
   try{await englishCommand({action:a.run.command.action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:`turn-sweep-${++counter}`,...extra});}
   catch(e){assert(e.status!==409||/A new question arrived/.test(e.message),`${where} is offered enabled but refused: ${e.message}`);}
   checked++;
  }
 }
 assert(checked>30,`swept ${checked} conversation actions`);
});
test('turn case 5: the server refuses 409 exactly what the table refuses, in every state',async()=>{
 const T=turn(),wrong=[];
 for(const [name,[screen,c]] of Object.entries(TURN_STATES))for(const action of CONVERSATION_ACTIONS){
  const s=install(fixture(screen,{placement:placed(),conversation:c}));answerAll();
  const ok=T.accepts(c,action);
  let got='accepted';
  try{await englishCommand({action,learnerId:s.learner.id,episodeId:c.id,commandId:`turn-table-${++counter}`,...extraFor(action,c)});}
  catch(e){got=e.status===409?'refused':`error ${e.status}: ${e.message}`;}
  if(got!==(ok?'accepted':'refused'))wrong.push(`${name} · ${action}: table ${ok?'accepts':'refuses'}, server ${got}`);
 }
 assert.deepEqual(wrong,[]);
});
test('turn case 6: a paused scene with a reply pending draws Resume disabled, and no enabled phone control sends pause, resume or finish',()=>{
 const S=require(path.resolve(__dirname,'../uat/driver/surface.cjs'));
 const sf=S.surfaceOf(sessionOf(fixture('linga-talk',{placement:placed(),conversation:convo({turns:REPLIED,paused:true,pending:'held'})})));
 const resume=sf.controls.find(c=>c.side==='phone'&&c.label==='Resume conversation');
 assert(resume,'the phone draws Resume');assert.equal(resume.disabled,true,'Resume is disabled while the reply is pending');
 const sends=sf.controls.filter(c=>c.side==='phone'&&!c.disabled&&['pause','resume','finish'].includes(c.effect?.run?.action)).map(c=>c.label);
 assert.deepEqual(sends,[]);
});
test('turn case 7 GUARD: leave during a turn in flight cancels it, and the late reply is dropped by its id',async()=>{
 fresh();await command('start',{sceneId:'booking',replace:true});
 let release;answer=()=>new Promise(r=>release=r);
 const inflight=command('turn',{text:'Could you help?',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 await command('leave');
 let c=getSession().conversation;assert.equal(c.pending,null);assert.equal(c.paused,true);
 release({json:{reply:'Of course.',observations:[]},provider:'test',ms:1});
 await assert.rejects(inflight,e=>e.status===409);
 c=getSession().conversation;assert.equal(c.turns.length,1);assert.equal(c.pending,null);
});

// ---- taught phrases come back: review.ts picks one due item, the partner invites it, code sees it reused
const review=()=>require(path.join(root,'src/lib/english/review.ts'));
const TAUGHT_A={id:'old1:t1:moment',kind:'fix',said:'I has booking',better:'I have a booking',why:'"I" goes with "have".',turnId:'old1:t1',at:10,sceneId:'booking',title:'A hotel booking'};
/** older than A, but already used again: never due */
const TAUGHT_B={id:'old2:t2:moment',kind:'word',said:'rezervace',better:'reservation',why:'The booking itself.',turnId:'old2:t2',at:5,sceneId:'booking',title:'A hotel booking',offered:1,reusedAt:6,reusedIn:'old3',reusedQuote:'reservation'};
const TAUGHT_C={id:'old4:t4:moment',kind:'word',said:'svačina',better:'a snack',why:'Food you eat between meals.',turnId:'old4:t4',at:20,sceneId:'weekend',title:'A weekend plan'};
const REUSED='Hi, I have a booking for Friday.';
const REVIEW={id:TAUGHT_A.id,kind:'fix',better:'I have a booking',fromTitle:'A hotel booking'};
/** a learner whose record holds these taught items, and an engine that keeps every prompt it was sent */
let prompts=[];
async function taughtStart(taught,opening={title:'Rover',goal:'Find the rover.',opening:'Hello there. Where are you going?',supportProvided:false},turnReply='Lovely. And what name is it under?'){
 fresh();saveEnglish('ema',{...emptyEnglish(),taught});prompts=[];
 answer=async req=>{const p=JSON.parse(req.prompt);prompts.push(p);return {json:p.submittedReply?{reply:turnReply,supportProvided:false,observations:[]}:opening,provider:'test',ms:1};};
 await command('start',{sceneId:'rover',replace:true});
 return getSession().conversation;
}
const taughtOf=id=>getLearner('ema').english.taught.find(t=>t.id===id);

test('review case 1: start picks the due taught item, the opening prompt invites it without saying it, and the item is counted as offered',async()=>{
 const c=await taughtStart([TAUGHT_B,TAUGHT_A]);
 assert.equal(c.review.id,TAUGHT_A.id);assert.equal(c.review.better,'I have a booking');assert.equal(c.review.fromTitle,'A hotel booking');
 const bring=prompts[0].bringBack;
 assert(bring,'the opening prompt carries bringBack');assert.equal(bring.phrase,'I have a booking');
 assert.match(bring.task,/invite/i);assert.match(bring.task,/never say it/i);
 assert.equal(taughtOf(TAUGHT_A.id).offered,1);assert.equal(taughtOf(TAUGHT_B.id).offered,1,'the reused item is not offered again');
});
test('review case 2: an unsupported reply that uses the phrase is recorded by code, on the record and on the scene',async()=>{
 const c=await taughtStart([TAUGHT_B,TAUGHT_A]);
 await reply(REUSED);
 assert.equal(prompts[1].bringBack.phrase,'I have a booking','every turn prompt carries it while it is not yet used');
 const t=taughtOf(TAUGHT_A.id);
 assert.equal(typeof t.reusedAt,'number');assert.equal(t.reusedIn,c.id);assert.equal(t.reusedQuote,'I have a booking');
 const now=getSession().conversation;assert.equal(now.review.used,REUSED);assert.equal(now.review.usedTurn,now.turns.at(-2).id);
 await reply('Smith. S, M, I, T, H.');assert.equal(prompts[2].bringBack,undefined,'once used, the partner stops inviting it');
 // normalised containment, in code: case, spacing, punctuation and curly apostrophes do not matter; a near miss is no reuse
 const R=review(),scene=convo({turns:[{id:'p1',role:'partner',text:'Hello. How can I help?'}],review:REVIEW});
 assert.equal(R.reuseOf('Hello!  I HAVE   a booking, yes.',scene),'I HAVE   a booking');
 assert.equal(R.reuseOf('I have booking.',scene),null);assert.equal(R.reuseOf('I have a bookings list',scene),null);
 assert.equal(R.reuseOf('I don’t know',convo({review:{...REVIEW,better:"I don't know"}})),'I don’t know');
});
test('review case 3: no reuse after the starter rung, or after the partner already said the phrase in this scene',async()=>{
 let c=await taughtStart([TAUGHT_A],{title:'Booking',goal:'Fix a booking.',opening:'Which date do you need?',supportProvided:false,help:LADDER});
 assert.equal(c.review.id,TAUGHT_A.id);
 await command('cue');await command('cue');await command('cue');assert.equal(getSession().conversation.supported,true);
 await reply(REUSED);
 assert.equal(taughtOf(TAUGHT_A.id).reusedAt,undefined,'a supported reply is not reuse');assert.equal(getSession().conversation.review.used,undefined);
 c=await taughtStart([TAUGHT_A],{title:'Booking',goal:'Fix a booking.',opening:'Good evening. I have a booking list here. Your name?',supportProvided:false});
 assert.equal(c.review.id,TAUGHT_A.id);
 await reply(REUSED);
 assert.equal(taughtOf(TAUGHT_A.id).reusedAt,undefined,'a copy of the partner\'s own words is not reuse');assert.equal(getSession().conversation.review.used,undefined);
});
test('review case 4: the recap is the before-and-after picture when used, and the sentence to take with you when not',()=>{
 const V=view(),turns=[{id:'p1',role:'partner',text:'Hello. How can I help?'},{id:'l1',role:'learner',text:REUSED,mode:'speech'},{id:'p2',role:'partner',text:'Which name is it under?'}];
 let v=V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),taught:[TAUGHT_A],conversation:convo({phase:'finished',turns,review:{...REVIEW,used:REUSED,usedTurn:'l1'}})})),{});
 assert.equal(v.hero.kind,'comparison');
 assert.deepEqual(v.hero.before,{kicker:'Linga taught · A hotel booking',quote:'I have a booking'});
 assert.deepEqual(v.hero.after,{kicker:'You said it tonight',quote:REUSED});
 assert.equal(v.hero.art,'done','the arch shows the star-burst');
 assert.match(v.hero.data,/1 spoken/,'the counts stay in the data line');
 const text=V.viewText(v);assert(text.includes('"I have a booking"'));assert(text.includes(`"${REUSED}"`));
 assert(v.baseCaption.split(/\s+/).length<=25,'the caption stays short');
 v=V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),taught:[TAUGHT_A],conversation:convo({phase:'finished',turns,review:REVIEW})})),{});
 assert.equal(v.hero.kind,'track');assert.equal(v.hero.sentence,'I have a booking');assert.match(v.hero.subtitle,/1 spoken/);
 assert(V.viewText(v).includes('I have a booking'));assert(v.baseCaption.split(/\s+/).length<=25);
});
test('review case 5: withholding - during the scene the phrase is on no screen until the learner has used it',()=>{
 const V=view();
 for(const [screen,c] of [['linga-talk',convo({turns:REPLIED})],['linga-talk',convo({turns:REPLIED,quizOpen:true})],['linga-talk',convo({turns:REPLIED,paused:true})],['linga-coach',TURN_STATES.coaching[1]],['linga-moment',TURN_STATES.moment[1]]])
  for(const ui of [{},{menu:true}]){
   const v=V.lingaView(sessionOf(fixture(screen,{placement:placed(),taught:[TAUGHT_A],conversation:{...c,review:REVIEW}})),ui);
   assert(!JSON.stringify(v).includes('I have a booking'),`${screen}${ui.menu?' (menu)':''} withholds the phrase`);
   assert(!V.viewText(v).includes('I have a booking'));
  }
 const turns=[{id:'p1',role:'partner',text:'Hello. How can I help?'},{id:'l1',role:'learner',text:REUSED,mode:'speech'},{id:'p2',role:'partner',text:'Which name is it under?'}];
 const v=V.lingaView(sessionOf(fixture('linga-talk',{placement:placed(),taught:[TAUGHT_A],conversation:convo({turns,review:{...REVIEW,used:REUSED,usedTurn:'l1'}})})),{});
 assert(v.baseCaption.includes('I have a booking'),'once used, the next screen says so');assert.equal(v.captionTag,'Used again');
 assert(v.baseCaption.split(/\s+/).length<=25);
});
test('review case 6: an item offered in two scenes without reuse is not due a third time',async()=>{
 const R=review();
 assert.equal(R.dueTaught([{...TAUGHT_A,offered:2},TAUGHT_C],'new').id,TAUGHT_C.id);
 assert.equal(R.dueTaught([TAUGHT_C,TAUGHT_A],'new').id,TAUGHT_A.id,'oldest first');
 assert.equal(R.dueTaught([TAUGHT_A],'old1'),null,'never from the rehearsal that taught it');
 let c=await taughtStart([{...TAUGHT_A,offered:2},TAUGHT_C]);assert.equal(c.review.id,TAUGHT_C.id);
 c=await taughtStart([{...TAUGHT_A,offered:2},TAUGHT_B]);assert.equal(c.review,null);assert.equal(prompts[0].bringBack,undefined);
 assert.equal(taughtOf(TAUGHT_A.id).offered,2);
});
test('review case 7: cleanEnglish keeps a taught item\'s review fields and drops one with a malformed reusedAt',()=>{
 const kept={...TAUGHT_A,offered:1,reusedAt:99,reusedIn:'c9',reusedQuote:'I have a booking'};
 const taught=cleanEnglish({taught:[kept,{...TAUGHT_A,id:'bad',reusedAt:'yesterday'},TAUGHT_C]}).taught;
 assert.deepEqual(taught.map(t=>t.id),[TAUGHT_A.id,TAUGHT_C.id]);
 assert.deepEqual(taught[0],kept);assert.deepEqual(taught[1],TAUGHT_C,'an item never offered keeps no review fields');
});
test('review case 8 GUARD: a learner with no taught items gets no review and no bringBack',async()=>{
 const c=await taughtStart([]);
 assert.equal(c.review??null,null);assert(!('bringBack' in prompts[0]));
 await reply(REUSED);assert(!('bringBack' in prompts[1]));
});

// ---- T10: the tutor's calls run with thinking off, and only they do ----
test('thinking case 1: opening, turn, coach and replay ask for thinking off; the level check and its plan do not',async()=>{
 const seen=[];
 const partner=()=>({reply:'Which dates did you book?',supportProvided:false,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'',meaning:'',starter:''}});
 fresh();answer=async(req)=>{const p=JSON.parse(req.prompt);seen.push({who:'linga',task:p.task.slice(0,12),thinking:req.thinking});
  return {json:/^Prepare/.test(p.task)?{title:'A practice booking',goal:'Ask for help with a booking.',opening:'Hello. How can I help?'}:/^Coach/.test(p.task)?{before:'two nights',after:'two nights, please',note:'Clear. Add please.'}:partner(),provider:'test',ms:1};};
 await command('start',{sceneId:'booking'});
 await command('turn',{text:'I booked two nights.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 await command('coach');await command('replay');
 assert.equal(seen.length,4,'one model call each for opening, turn, coach and replay');
 for(const c of seen)assert.equal(c.thinking,false,`${c.task} asks for thinking off`);
 fresh();answer=async(req)=>{seen.push({who:'check',step:JSON.parse(req.prompt).step,thinking:req.thinking});return wrap(checkAnswer)(req);};
 await command('check-start');await answerAbout(3);
 const others=seen.filter(c=>c.who==='check');
 assert(others.length>=3,'the level check asked the model');
 for(const c of others)assert.equal(c.thinking,undefined,`the ${c.step} step keeps the model's own thinking`);
});
test('thinking case 2: no text() caller outside the conversation asks for thinking off',()=>{
 const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]);
 const callers=walk(path.join(root,'src')).filter(f=>!f.includes(path.join('lib','engines'))&&/thinking\s*:\s*false/.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(root,f).split(path.sep).join('/'));
 // the conversation (wave S59: 4-6 s a turn instead of 52-90 s) and Calculus spec writing (2026-09-29, tools/calc-model-yield.cjs
 // on 6 topics: 7-14 s instead of 62-90 s with two engine timeouts; the desk checks every spec in code, so a hasty spec costs
 // one refused spec, never a wrong verdict). Hints, marking, the school question writer and the level check keep their thinking.
 // and the worked lesson's idea (v2 M1, 2026-10-07): its words are checked in code (lib/desk/worked.ts cleanIdea: no
 // digit, three sentences) and fall back to the authored idea, so a hasty idea costs the model's wording, never a wrong number.
 assert.deepEqual(callers,['src/lib/desk/items.ts','src/lib/desk/worked.ts','src/lib/english/conversation.ts']);
 const items=fs.readFileSync(path.join(root,'src/lib/desk/items.ts'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`])\/\/.*$/gm,'$1');
 assert.equal((items.match(/thinking\s*:\s*false/g)||[]).length,1,'items.ts asks for thinking off once: the Calculus spec writer');
 assert.match(items.split('function askCalc')[1]??'',/thinking:\s*false/,'and that one is in askCalc, not the school question writer');
});

// ---- Family mode, W1: three school situations, offered to learners under 18 and to no one else
const {ENGLISH_SCENES,ENGLISH_SKILLS,audienceAllowed}=require(path.join(root,'src/lib/english/curriculum.ts'));
const SCHOOL=['teacher','project','lost'];
// the three free school situations; Speaking practice (v2 L2, speaking.ts) is school-audience too and has its own suite (cambridge-rules)
const schoolIds=list=>list.filter(x=>x.audience==='school'&&!x.practice).map(x=>x.id);
const prefsOf=p=>defaultPreferences(p);
test('scene ids are unique, and the three school situations are authored to the scene contract',()=>{
 const ids=ENGLISH_SCENES.map(x=>x.id);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(schoolIds(ENGLISH_SCENES),SCHOOL,'exactly the three school situations, in this order');
 const skills=ENGLISH_SKILLS.map(x=>x.id);
 for(const id of SCHOOL){
  const x=ENGLISH_SCENES.find(s=>s.id===id);
  assert(skills.includes(x.skill),`${id}: a known skill`);
  assert.equal(x.quiz.options.length,2,`${id}: two options`);assert([0,1].includes(x.quiz.correct),`${id}: correct is 0 or 1`);
  assert(x.quiz.options.every(o=>typeof o==='string'&&o.trim())&&x.quiz.question.trim(),`${id}: a question and two phrases`);
  assert.match(x.cue,/^Try(?: asking)?:/,`${id}: the cue starts like the others`);
  assert.match(x.minutes,/^(6–8|8–10)$/,`${id}: minutes`);
  assert.match(x.premise,/classmate|teacher|school (?:staff|helper)/i,`${id}: the premise names the partner's part`);
  assert.match(x.premise,/fictional|made-up/i,`${id}: fictional`);
  assert.doesNotMatch(x.premise+x.goal+x.cue+x.partner,/date|romanc|flirt|alcohol|gambl/i,`${id}: family-safe words`);
 }
 assert.deepEqual(['teacher','project','lost'].map(id=>ENGLISH_SCENES.find(s=>s.id===id).skill),['repair','negotiate','request']);
});
test('each school situation resolves a picture that exists: teacher and lost have their own, project borrows the team\'s',()=>{
 const {artOf,SCENE_ART,SKILL_ART}=view(),art=fs.readFileSync(path.join(root,'src/english/art/index.tsx'),'utf8');
 const pick=id=>{const x=ENGLISH_SCENES.find(s=>s.id===id);return artOf(x.id,x.skill);};
 for(const id of SCHOOL){
  const key=pick(id);
  assert(SCENE_ART.includes(key),`${id} -> ${key} is a scene picture`);
  assert(new RegExp('^\\s*'+key+':\\s*\\{\\s*Art:','m').test(art),`${key} has a drawing in art/index.tsx`);
 }
 assert.equal(pick('teacher'),'teacher','Ms Hale has her own classroom, not the rover');
 assert.equal(pick('lost'),'lost','Mr Ortiz has his own corridor, not the hotel desk');
 assert.equal(pick('project'),'team','the group project still borrows the planning room');
 assert(SCENE_ART.includes('teacher')&&SCENE_ART.includes('lost')&&!SCENE_ART.includes('project'));
 for(const key of ['teacher','lost']){
  const label=new RegExp('^\\s*'+key+':\\s*\\{[^\\n]*label:\\s*"([^"]+)"','m').exec(art)?.[1];
  assert(label&&label.length>40,`${key} has a screen-reader label that describes it`);
  assert.doesNotMatch(label,/hotel|robot|moon|rover|suitcase|reception|Pip|Robin/i,`${key}'s label describes its own picture`);
 }
 assert.match(art,/teacher:[^\n]*Ms Hale/);assert.match(art,/lost:[^\n]*Mr Ortiz/);
});
test('own pictures for teacher and lost change no other scene and no plan topic',()=>{
 const {artOf,SCENE_ART,SKILL_ART}=view();
 assert.deepEqual(SKILL_ART,{contact:'meet',describe:'weekend',repair:'rover',negotiate:'team',request:'booking',narrate:'interview',relate:'date',resolve:'conflict'},'the skill pictures a plan topic borrows are exactly as before');
 assert.deepEqual(SCENE_ART.slice(0,8),['meet','weekend','rover','team','booking','interview','date','conflict'],'the first eight pictures keep their keys');
 for(const x of ENGLISH_SCENES.filter(s=>!['teacher','lost'].includes(s.id))) assert.equal(artOf(x.id,x.skill),SCENE_ART.slice(0,8).includes(x.id)?x.id:SKILL_ART[x.skill],`${x.id} keeps the picture it had`);
 for(const skill of Object.keys(SKILL_ART)) for(const id of ['topic-1','plan-abc','teachers','lost-and-found','']) assert.equal(artOf(id,skill),SKILL_ART[skill],`a plan topic "${id}" of skill ${skill} still borrows ${SKILL_ART[skill]}`);
});
test('school situations go to learners under 18 (age 15 counts) and never to "other" or an adult',()=>{
 const yes=[{type:'high-school',age:12},{type:'elementary',age:9},{type:'elementary',age:13},{type:'high-school',age:15},{type:'high-school',age:17},{type:'elementary'},{type:'high-school'}];
 const no=[{type:'other'},{type:'other',age:12},{type:'high-school',age:18},{type:'high-school',age:19},{type:'elementary',age:18},undefined];
 for(const p of yes){assert.deepEqual(schoolIds(eligibleScenes(p,prefsOf(p))),SCHOOL,JSON.stringify(p));assert(audienceAllowed(p,prefsOf(p),'school'));}
 for(const p of no){assert.deepEqual(schoolIds(eligibleScenes(p,prefsOf(p))),[],JSON.stringify(p));assert(!audienceAllowed(p,prefsOf(p),'school'));}
 assert(!audienceAllowed({type:'other'},{...prefsOf({type:'other'}),adultConfirmed:true},'school'),'a confirmed adult "other" is not offered a classroom either');
 assert.deepEqual(schoolIds(eligibleScenes({id:'t',name:'Teen',type:'high-school',age:15},prefsOf({type:'high-school'}))),SCHOOL,'age 15 is under 18, so a 15-year-old gets them');
});
test('the school branch leaves all, older and adult exactly as they were',()=>{
 const rows=[{type:'elementary',age:8},{type:'elementary',age:12},{type:'high-school',age:15},{type:'high-school',age:18},{type:'other'},{type:'elementary'},{type:'high-school'}];
 for(const p of rows)for(const confirmed of [false,true]){
  const prefs={...prefsOf(p),adultConfirmed:confirmed};
  assert.equal(audienceAllowed(p,prefs,'all'),true);
  assert.equal(audienceAllowed(p,prefs,'older'),(p.age??0)>=15||p.type==='other');
  assert.equal(audienceAllowed(p,prefs,'adult'),p.age!==undefined?p.age>=18:p.type==='other'&&confirmed);
 }
 assert(!eligibleScenes({type:'other'},{...prefsOf(),adultConfirmed:true}).some(s=>s.audience==='school'));
 assert.equal(eligibleScenes({type:'other'},{...prefsOf(),adultConfirmed:true}).length,ENGLISH_SCENES.length-3,'an adult sees every situation but the three school ones');
});
test('a first-time learner keeps today\'s first scene, and says school in their own words to start with a school one',()=>{
 const kid={type:'elementary',age:12},teen={type:'high-school',age:16},adult={type:'other'};
 assert.equal(recommendScene(kid,emptyEnglish()).id,'rover');assert.equal(recommendScene(teen,emptyEnglish()).id,'team');assert.equal(recommendScene(adult,emptyEnglish()).id,'booking');
 const wish=(p,interest)=>recommendScene(p,{...emptyEnglish(),preferences:{...prefsOf(p),interest}});
 assert.equal(wish(kid,'my teacher talks fast').id,'teacher');assert.equal(wish(teen,'a science project with classmates').id,'project');assert.equal(wish(kid,'I lost things').id,'lost');
 assert.equal(wish(adult,'my teacher and homework').id,'booking','an adult who says school is not given a classroom');
});
test('the conversation route refuses a school situation for "other" and for an 18+ profile, and serves it under 18',async()=>{
 const seat=(id,patch)=>{dispatch({type:'profile.draft',patch:{id,name:id,modules:['english'],...patch}});dispatch({type:'profile.save'});dispatch({type:'subject',subject:'english'});};
 fresh();assert.equal(getSession().profiles.find(p=>p.id==='jakub').type,'other');
 dispatch({type:'learner.set',id:'jakub'});
 for(const id of SCHOOL)await assert.rejects(command('start',{sceneId:id}),e=>e.status===403&&/not available/.test(e.message),`other: ${id}`);
 assert.equal(getSession().conversation,null);
 fresh();seat('grown',{type:'high-school',age:18});
 for(const id of SCHOOL)await assert.rejects(command('start',{sceneId:id}),e=>e.status===403,`18: ${id}`);
 assert.equal(getSession().conversation,null);
 fresh();seat('kid12',{type:'elementary',age:12});
 for(const id of SCHOOL){answer=async()=>({json:{title:'At school',goal:'Practise.',opening:'Hello there.'},provider:'test',ms:1});await command('start',{sceneId:id,replace:true});assert.equal(getSession().conversation.sceneId,id);assert.equal(getSession().conversation.scene.audience,'school');}
 // the second check, on a scene already running: a profile that stops being entitled is refused at the next command
 getSession().profiles.find(p=>p.id==='kid12').age=18;
 const last=getSession().conversation.turns.at(-1).id;
 await assert.rejects(command('turn',{text:'Could you say that again?',mode:'text',lastTurnId:last}),e=>e.status===403&&/no longer available/.test(e.message));
});
test('the speech routes answer a bad request with 400 and a failed engine with a sentence, never its raw error',async()=>{
 const had=process.env.ELEVENLABS_API_KEY;process.env.ELEVENLABS_API_KEY||='test-key';
 const reg=require(path.join(root,'src/lib/engines/registry.ts'));
 const speak=require(path.join(root,'src/app/api/speak/route.ts'));
 const listenRoute=require(path.join(root,'src/app/api/listen/route.ts'));
 const leak='upstream said 401: invalid api key sk-live-SECRET';
 reg.useProvider('speak',{name:'stub',run:async()=>{throw new Error(leak);}});
 reg.useProvider('listen',{name:'stub',run:async()=>{throw new Error(leak);}});
 const logged=[];const orig=console.error;console.error=(...a)=>logged.push(a.map(String).join(' '));
 try{
  const post=body=>speak.POST(new Request('http://desk/api/speak',{method:'POST',body,headers:{'Content-Type':'application/json'}}));
  for(const body of ['hello','{}','{"text":5}','{"text":"   "}']){const r=await post(body);assert.equal(r.status,400,body);assert.equal((await r.text()).includes('sk-live'),false,body);}
  let r=await post('{"text":"Which date?"}');assert.equal(r.status,502);const said=await r.text();assert.equal(said.includes('sk-live'),false,'speak leaks the engine error');assert.match(said,/could not say/i);
  const form=new FormData();form.append('file',new Blob(['audio']),'a.webm');
  r=await listenRoute.POST(new Request('http://desk/api/listen',{method:'POST',body:form}));assert.equal(r.status,502);const heard=await r.text();assert.equal(heard.includes('sk-live'),false,'listen leaks the engine error');assert.match(heard,/Speech-to-text failed/);
  assert.equal(logged.length,2,'both engine failures are in the server log');
  assert.equal(logged.every(line=>line.includes('sk-live-SECRET')),true);
 }finally{console.error=orig;reg.resetProviders();if(had===undefined)delete process.env.ELEVENLABS_API_KEY;}
});
test('the reply box stays closed until the scene is ready',()=>{
 require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
 const React=require(path.join(root,'node_modules/react'));
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {ReplyBox}=require(path.join(root,'src/english/ReplyBox.tsx'));
 const html=ready=>renderToStaticMarkup(React.createElement(ReplyBox,{ready,busy:false,onSend:async()=>true}));
 const field=h=>{const i=h.indexOf('<textarea');return h.slice(i,h.indexOf('>',i)+1);};
 const closed=html(false),open=html(true);
 assert.match(field(closed),/disabled/,'an unprepared scene still takes a typed reply');
 assert.doesNotMatch(field(open),/disabled/);
 assert.match(closed,/Not yet/);
 assert.equal(open.includes('Not yet'),false);
});
test('MH-4: a finished capture pre-ticks the confirmation, an edit makes a typed reply',()=>{
 require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
 const {afterCapture,afterEdit}=require(path.join(root,'src/english/ReplyBox.tsx'));
 assert.deepEqual(afterCapture('which bridge do you mean'),{mode:'speech',confirmed:true,sendable:true});
 assert.deepEqual(afterCapture('   '),{mode:'speech',confirmed:false,sendable:false});
 assert.deepEqual(afterCapture(''),{mode:'speech',confirmed:false,sendable:false});
 assert.deepEqual(afterEdit('which bridge'),{mode:'text',confirmed:false,sendable:true});
 assert.equal(afterEdit('').sendable,false);
 // the component itself is state-driven (effects and speech events), so the rendered tick after a capture needs a DOM: the browser harness covers it
});
test('the map and the print name spoken practice, not only written and choice',()=>{
 const {practiceLine}=require(path.join(root,'src/lib/english/rules.ts'));
 const ev=mode=>({id:mode,episodeId:'ep',turnId:'t',sceneId:'booking',skill:'request',at:1,mode,supported:false,success:true,quote:'q',note:'n'});
 assert.equal(practiceLine([ev('speech'),ev('text'),ev('choice')],'request','phone'),'1 spoken · 1 written · 1 choice observations');
 assert.equal(practiceLine([ev('speech'),ev('text'),ev('choice')],'request','print'),'1 spoken\n1 written\n1 choices');
 assert.equal(practiceLine([ev('speech'),ev('speech')],'request','phone'),'2 spoken · 0 written · 0 choice observations');
 assert.equal(practiceLine([ev('text')],'narrate','phone'),'0 spoken · 0 written · 0 choice observations');
 const strip=file=>fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 const phoneSrc=strip(path.join(root,'src/english/LingaPhone.tsx'));
 const printSrc=strip(path.join(root,'src/app/english/print/page.tsx'));
 assert.match(phoneSrc,/practiceLine\(/);
 assert.match(printSrc,/practiceLine\(/);
 assert.equal(/mode==="text"/.test(phoneSrc),false,'the phone still counts written by hand');
 assert.equal(/mode==="text"/.test(printSrc),false,'the print still counts written by hand');
});
test('a skill practised more than three days ago is due, and the same wait is written once',()=>{
 const {oldestDue,DUE_MS,recommendScene}=require(path.join(root,'src/lib/english/curriculum.ts'));
 const day=86400000,now=Date.now();
 const ev=(skill,age,success=true)=>({id:skill+age,episodeId:'ep',turnId:'t',sceneId:'booking',skill,at:now-age,mode:'speech',supported:false,success,quote:'q',note:'n'});
 const rows=[ev('describe',5*day),ev('request',4*day),ev('narrate',day),ev('repair',6*day,false)];
 assert.equal(oldestDue(rows).skill,'describe','the oldest success is due');
 assert.equal(oldestDue(rows,'describe').skill,'request','review skips the scene\'s own skill');
 assert.equal(oldestDue([ev('narrate',day)]),undefined);
 assert.equal(oldestDue([ev('request',DUE_MS-60000)]),undefined,'three days is not yet due');
 assert.equal(oldestDue([ev('request',DUE_MS+60000)]).skill,'request');
 const kid={type:'elementary',age:12};
 const learning=evidence=> ({...emptyEnglish(),evidence,sessions:[{id:'s1',sceneId:'weekend',title:'Weekend',at:1,turns:1}]});
 assert.equal(recommendScene(kid,learning([ev('request',4*day)])).id,'booking','four days returns the due situation');
 assert.equal(recommendScene(kid,learning([ev('request',day)])).id,'rover','one day rotates to the next situation');
 assert.equal(recommendScene(kid,learning([ev('request',4*day,false)])).id,'rover','a failed reply is not due');
 const quiz={question:'Which fits?',options:['I like it because it is fun.','Yesterday.'],correct:0};
 const planTopic=(id,skill)=>({id,title:id,goal:'Talk about it.',why:'You asked for it.',skill,audience:'all',partner:'Sam · Friend',premise:'A friendly chat.',cue:'Try: I like…',quiz});
 const plan=(evidence,last='t-weekend')=>{
  const sessions=['t-rover','t-booking','t-weekend'].filter(id=>id!==last).map((sceneId,i)=>({id:'s'+i,sceneId,title:sceneId,at:i+1,turns:1}));
  sessions.push({id:'last',sceneId:last,title:last,at:9,turns:1});
  return {...emptyEnglish(),evidence,plan:{at:1,band:'B1',topics:[planTopic('t-weekend','describe'),planTopic('t-rover','repair'),planTopic('t-booking','request')]},sessions};
 };
 assert.equal(recommendScene(kid,plan([ev('request',4*day)])).id,'t-booking');
 assert.equal(recommendScene(kid,plan([ev('request',day)])).id,'t-rover');
 assert.equal(recommendScene(kid,plan([ev('describe',5*day),ev('request',4*day)],'t-rover')).id,'t-weekend','the older success leads');
 const strip=file=>fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 const src=[path.join(root,'src/lib/english/curriculum.ts'),path.join(root,'src/lib/english/conversation.ts')].map(strip);
 assert.equal(src.join('\n').match(/86400000/g).length,1,'the three-day wait is written once');
 assert.match(src[0],/oldestDue\(/);assert.match(src[1],/oldestDue\(/);
});

// ---- who holds the desk: one owner for the phone, and one table for the level check (lib/english/activity.ts)
const activity=()=>require(path.join(root,'src/lib/english/activity.ts'));
/** A stub engine that answers the level check's steps and a conversation's calls. */
function stubAll(){answer=async req=>{let p={};try{p=JSON.parse(req.prompt);}catch{}return p.step?{json:checkAnswer(req),provider:'test',ms:1}:{json:{title:'T',goal:'G',opening:'Hi?',reply:'Ok. And then?',observations:[]},provider:'test',ms:1};};}
/** A check left at the topic question, then a scene started: the state the card's probe walks. */
async function leftAtGoalThenScene(){
 fresh();stubAll();
 await command('level-self',{band:'A2'});await command('plan-propose');
 const k=getSession().check;assert.equal(k.askGoal,true,'no goal is known, so the topic question is asked');
 await command('check-leave',{checkId:k.id});
 await command('start',{sceneId:'booking',replace:true});
 return getSession();
}
test('owner case 1: a check left at the topic question gives the phone to the scene that starts after it',async()=>{
 const V=view(),s=await leftAtGoalThenScene();
 assert.equal(V.phonePanel(s),'talk');
 const a=V.lingaView(s).answer;
 assert.deepEqual(a&&{action:a.action,lastTurnId:a.lastTurnId},{action:'turn',lastTurnId:s.conversation.turns.at(-1).id});
});
test('owner case 2: the phone\'s reply to the partner lands in the conversation and is never saved as the learner\'s goal',async()=>{
 const V=view(),s=await leftAtGoalThenScene(),a=V.lingaView(s).answer;
 await englishCommand({action:a.action,learnerId:s.learner.id,episodeId:s.conversation.id,commandId:`owner-${++counter}`,text:'Could you check my room, please?',mode:'text',lastTurnId:a.lastTurnId});
 assert.equal(getSession().conversation.turns.length,3,'the reply and the partner\'s answer are in the conversation');
 assert.equal(getLearner('ema').english.preferences.goal,'');
});
test('owner case 3: Find my level pauses a live scene, and resuming the scene parks the check and hands the phone back',async()=>{
 const V=view();fresh();stubAll();
 await command('start',{sceneId:'booking',replace:true});
 await command('check-start');
 let s=getSession();assert.equal(s.conversation.paused,true,'the scene pauses when a check opens');assert.equal(V.phonePanel(s),'check');
 await command('resume');s=getSession();
 assert.equal(s.check.parked,true);assert.equal(V.phonePanel(s),'talk');assert.equal(V.lingaView(s).answer.action,'turn');
});
test('owner case 4: over every three commands, an unparked check and a live scene never hold the desk together, and the phone follows the TV',async()=>{
 const V=view(),names=['start','resume','check-start','check-resume','plan-propose','check-leave','leave'];
 const onCheck=['linga-check','linga-verdict','linga-plan'];
 let sequences=0,commands=0;
 const step=async name=>{
  const s=getSession(),k=s.check,c=s.conversation;
  const extra={start:{sceneId:'booking',replace:true},'check-resume':{checkId:k?.id},'check-leave':{checkId:k?.id}}[name]??{};
  try{await englishCommand({action:name,learnerId:s.learner.id,episodeId:c?.id,commandId:`seq-${++counter}`,...extra});}
  catch(e){if(e.status===409)return;throw e;}
  commands++;
  const now=getSession(),liveCheck=!!now.check&&!now.check.parked,liveScene=!!now.conversation&&now.conversation.phase!=='finished'&&!now.conversation.paused;
  assert(!(liveCheck&&liveScene),`after ${name}: an unparked check and a live scene both hold the desk`);
  const panel=V.phonePanel(now);
  if(now.check&&onCheck.includes(now.screen))assert.equal(panel,'check',`after ${name}: the TV is on ${now.screen}`);
  if(now.conversation&&['linga-talk','linga-coach'].includes(now.screen))assert.equal(panel,'talk',`after ${name}: the TV is on ${now.screen}`);
  if(now.conversation&&now.screen==='linga-moment')assert.equal(panel,'moment',`after ${name}: the TV is on the moment`);
 };
 for(const a of names)for(const b of names)for(const c of names){
  fresh();stubAll();sequences++;
  for(const name of [a,b,c])await step(name).catch(e=>{e.message=`${a} > ${b} > ${c}: ${e.message}`;throw e;});
 }
 assert.equal(sequences,343);assert(commands>400,`ran ${commands} accepted commands`);
});

const CHECK_COMMANDS=['check-leave','check-resume','check-repeat','check-retry','check-reveal','check-answer','check-task','plan-goal','plan-swap','plan-add','plan-renew','plan-agree'];
const listenTask={id:'t2',band:'A2',kind:'listen',prompt:'Where was the bag?',line:'I left my bag on the bus.',options:[],revealed:false};
const sayTask={id:'t3',band:'A2',kind:'say',prompt:'Tell Linga about your day.',line:'',options:[],revealed:false};
/** One level check per state the table names: what the learner is looking at. */
const CHECK_STATES={
 'about preparing':checkOf({turns:[]}),
 'about asked':checkOf(),
 reading:checkOf({pending:'held'}),
 'tasks between':checkOf({stage:'tasks',turns:[]}),
 say:checkOf({stage:'tasks',turns:[],task:sayTask}),
 listen:checkOf({stage:'tasks',turns:[],task:listenTask}),
 choose:checkOf({stage:'tasks',turns:[],task:chooseTask}),
 verdict:checkOf({stage:'verdict',turns:[],placement:placed()}),
 'plan asking goal':checkOf({stage:'plan',turns:[],askGoal:true}),
 'plan topics':checkOf({stage:'plan',turns:[],topics:planned('p-a','p-b').topics}),
 'plan empty':checkOf({stage:'plan',turns:[]}),
};
const checkScreen=k=>k.stage==='verdict'?'linga-verdict':k.stage==='plan'?'linga-plan':'linga-check';
const checkExtra=(action,k)=>({checkId:k.id,...(action==='check-answer'?{text:'I play games.',mode:'text',lastTurnId:k.turns.at(-1)?.id}
 :action==='check-task'?{taskId:k.task?.id,text:'I think it was the bus.',mode:'text',option:0}:action==='plan-goal'?{text:'A job interview'}
 :action==='plan-swap'?{topicId:k.topics[0]?.id}:action==='plan-add'?{text:'football talk'}:{})});
async function sendCheck(action,k){
 const s=install(fixture(checkScreen(k),{placement:placed(),check:k}));stubAll();
 try{await englishCommand({action,learnerId:s.learner.id,commandId:`check-table-${++counter}`,...checkExtra(action,k)});return 'accepted';}
 catch(e){return e.status===409?'refused':'accepted';}
}
test('owner case 5: the server refuses 409 exactly what the check table refuses, in every state',async()=>{
 // named first, so the red before the table is not only a missing module: these three answered 200 and did nothing, or added a topic under a screen that never shows it
 assert.equal(await sendCheck('plan-renew',CHECK_STATES['plan asking goal']),'refused','plan-renew while the goal is asked');
 assert.equal(await sendCheck('plan-add',CHECK_STATES['plan asking goal']),'refused','plan-add while the goal is asked');
 assert.equal(await sendCheck('check-retry',CHECK_STATES.verdict),'refused','check-retry on the verdict');
 const A=activity(),wrong=[];
 assert.deepEqual([...A.CHECK_COMMANDS].sort(),[...CHECK_COMMANDS].sort());
 for(const [name,k] of Object.entries(CHECK_STATES))for(const action of CHECK_COMMANDS){
  const want=A.checkAccepts(k,action)?'accepted':'refused',got=await sendCheck(action,k);
  if(got!==want)wrong.push(`${name} · ${action}: table ${want}, server ${got}`);
 }
 assert.deepEqual(wrong,[]);
});
test('owner case 6: in every check state and in the menu, an enabled check action the view offers is one the table accepts',()=>{
 const V=view(),A=activity();let checked=0;
 for(const [name,k] of Object.entries(CHECK_STATES))for(const ui of [{},{menu:true}]){
  const v=V.lingaView(sessionOf(fixture(checkScreen(k),{placement:placed(),check:k})),ui);
  const all=[...offeredBy(v),...(v.answer?[{id:'answer',run:{command:{action:v.answer.action}}}]:[])];
  for(const a of all){
   const action=a.run.command?.action;
   if(a.disabled||!action||!CHECK_COMMANDS.includes(action))continue;
   assert(A.checkAccepts(k,action),`${name}${ui.menu?' (menu)':''} · ${a.id} (${action}) is offered enabled but the table refuses it`);
   checked++;
  }
 }
 assert(checked>25,`checked ${checked} offered check actions`);
});
test('owner case 7 GUARD: with the TV on Linga home and a check left part-way, the phone still holds the check',()=>{
 const V=view(),s=sessionOf(fixture('linga',{check:checkOf()}));
 assert.equal(V.lingaHome(s),'check-part-way');assert.equal(V.phonePanel(s),'check');
 const a=V.lingaView(s).answer;assert.equal(a.action,'check-answer');assert.equal(a.lastTurnId,'q1');
});
test('owner case 8 GUARD: leaving the check keeps it, and carrying on resumes the same question',async()=>{
 fresh();stubAll();await command('check-start');await answerAbout(1);
 const k=getSession().check,asked=k.turns.at(-1).id;
 await command('check-leave',{checkId:k.id});
 assert.equal(getSession().screen,'linga');assert.equal(getSession().check.id,k.id);assert.equal(getSession().check.turns.length,k.turns.length);
 await command('check-resume',{checkId:k.id});
 assert.equal(getSession().screen,'linga-check');assert.equal(getSession().check.turns.at(-1).id,asked);assert.equal(!!getSession().check.parked,false);
});

// ---- MH-2: a topic's audience is the stricter of its words and the model's label (gate.ts) ----
const {audienceOf}=require(path.join(root,'src/lib/english/gate.ts'));
const GATE_TABLE=[
 // adult
 ['Two people meet at a cafe. One hopes it turns into romance and tries to flirt a little.','all','adult'],
 ['You are on a first date and want to keep the conversation going.','all','adult'],
 ['Talk about dating apps with a friend.','all','adult'],
 ['Ask your girlfriend what she wants for dinner.','all','adult'],
 ['Tell your boyfriend you are running late.','all','adult'],
 ['A romantic dinner for two at a restaurant.','older','adult'],
 ['Order a beer at the bar.','all','adult'],
 ['Choose a wine to go with the meal.','all','adult'],
 ['A friend has had too much and is drunk at the party.','all','adult'],
 ['Say no politely when someone offers you drugs.','all','adult'],
 ['Explain why you do not like gambling.','all','adult'],
 ['A night at the casino with colleagues.','all','adult'],
 ['Betting on a football match with friends.','all','adult'],
 ['A talk about sexual health at a clinic.','all','adult'],
 ['Sex education questions.','all','adult'],
 ['She wants to kiss him goodnight.','all','adult'],
 ['A pub that serves alcohol asks for your ID.','all','adult'],
 ['Flirting with a stranger on a train.','older','adult'],
 ['Planning a second date after dinner.','all','adult'],
 ['A date night with your partner.','all','adult'],
 // older
 ['Prepare for a job interview at a warehouse.','all','older'],
 ['You answer questions in a JOB INTERVIEW for a shop.','all','older'],
 ['A sharp disagreement at work about who finishes the report.','all','older'],
 ['Settle a conflict at work with a colleague.','all','older'],
 ['A workplace conflict over the shift list.','all','older'],
 ['Argue with a colleague about the schedule.','all','older'],
 // stays all: benign near-misses
 ['Write the date on the calendar and tell your teacher.','all','all'],
 ['What is the date today? Check the calendar.','all','all'],
 ['Updating data in a spreadsheet for the class.','all','all'],
 ['Read the menu at the coffee bar and order a latte.','all','all'],
 ['Join the school band and talk about your instrument.','all','all'],
 ['Ask a classmate to share their notes.','all','all'],
 ['Order a pizza for the family.','all','all'],
 ['A trip to the zoo with your class.','all','all'],
 ['Buying a train ticket for tomorrow.','all','all'],
 ['Talk about your favourite games with friends.','all','all'],
 ['Sort the bottles in the recycling bin.','all','all'],
 ['A sweet bakery order: two rolls and a juice.','all','all'],
 ['Describe your weekend hobby.','all','all'],
 ['The expiry date on the milk is today.','all','all'],
 ['Sexton Street is where the library is.','all','all'],
 ['Wine-coloured curtains in the shop window.','all','adult'],
 // the label alone still holds when the words are clean
 ['Talk about your weekend plans.','adult','adult'],
 ['Talk about your hobbies.','older','older'],
 ['Chatting about a quiet evening at home.','school','school'],
 // the stricter wins
 ['Prepare for a job interview.','adult','adult'],
 ['Bring a beer to the barbecue.','older','adult'],
];
test('the audience gate: the stricter of the words and the label wins, near-misses stay "all" (MH-2)',()=>{
 assert(GATE_TABLE.length>=40);
 for(const [text,label,want] of GATE_TABLE)assert.equal(audienceOf(text,label),want,`${label} + "${text}"`);
 for(const a of ['all','older','adult'])assert.equal(audienceOf('',a),a);
});
test('a romance premise the model labels "all" never reaches a 12-year-old\'s plan, and an adult\'s plan holds it (MH-2)',async()=>{
 const romance={...topic('A coffee with Alex','all','relate'),premise:'Two people meet at a cafe. The learner hopes it turns into romance and tries to flirt a little.'};
 const plan=req=>{const p=JSON.parse(req.prompt);return p.step==='plan'?{topics:[romance,topic('Gaming with friends','all'),topic('Planning a trip','all','negotiate')].slice(0,p.count)}:checkAnswer(req);};
 fresh();answer=wrap(plan);const propose=async()=>{await command('plan-propose');const g=getSession().check;if(g.askGoal)await command('plan-goal',{checkId:g.id,text:'talk with friends online'});return getSession().check;};
 let k=await propose();
 assert(!k.topics.some(t=>t.title==='A coffee with Alex'),'kept out of the proposal');
 await command('plan-agree',{checkId:k.id});assert(!getLearner('ema').english.plan.topics.some(t=>t.title==='A coffee with Alex'));
 fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true},notes:[]});
 answer=wrap(plan);k=await propose();
 const held=k.topics.find(t=>t.title==='A coffee with Alex');assert(held,'an adult\'s plan holds it');assert.equal(held.audience,'adult');
 await command('plan-agree',{checkId:k.id});assert(getLearner('jakub').english.plan.topics.some(t=>t.title==='A coffee with Alex'));
 // a stale plan that already holds the topic as "all" is re-derived at agreement
 fresh();answer=wrap(checkAnswer);k=await propose();
 getSession().check.topics.push({...romance,id:'plan-stale',why:'x',audience:'all'});
 await command('plan-agree',{checkId:k.id});assert(!getLearner('ema').english.plan.topics.some(t=>t.id==='plan-stale'));
});

// ---- MH-3: the TV recap shows one thing learned tonight ----
test('the recap hero is the latest moment or coaching change as a picture; "It came back" wins, and with neither the track stays (MH-3)',()=>{
 const V=view(),turns=[{id:'p1',role:'partner',text:'Hello. How can I help?'},{id:'l1',role:'learner',text:'I has booking',mode:'speech'},{id:'p2',role:'partner',text:'Which name is it under?'}];
 const fix={id:'m1',kind:'fix',said:'I has booking',better:'I have a booking',why:'"I" goes with "have".',turnId:'l1',at:1},word={id:'m2',kind:'word',said:'rezervace',better:'reservation',why:'The booking itself.',turnId:'l1',at:2};
 const recap=patch=>V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),taught:[TAUGHT_A],conversation:convo({phase:'finished',turns,...patch})})),{});
 let v=recap({moments:[fix]});
 assert.equal(v.hero.kind,'comparison');assert.deepEqual(v.hero.before,{kicker:'You said',quote:'I has booking'});assert.deepEqual(v.hero.after,{kicker:'Try',quote:'I have a booking'});
 assert.equal(v.hero.note,'"I" goes with "have".');assert.equal(v.hero.art,'done');assert.match(v.hero.data,/1 spoken/);assert.match(v.hero.data,/1 moment to keep/);
 v=recap({moments:[fix,word]});assert.deepEqual(v.hero.before,{kicker:'You wanted to say',quote:'rezervace'});assert.deepEqual(v.hero.after,{kicker:'In English',quote:'reservation'});
 v=recap({moments:[fix],coaching:{before:'I want room',after:'Could I have a room, please?',note:'A polite request.'}});
 assert.deepEqual(v.hero.before,{kicker:'You said',quote:'I want room'});assert.deepEqual(v.hero.after,{kicker:'One way to try it',quote:'Could I have a room, please?'});assert.equal(v.hero.note,'A polite request.');
 v=recap({moments:[fix],review:{...REVIEW,used:REUSED,usedTurn:'l1'}});assert.equal(v.hero.kind,'comparison');assert.deepEqual(v.hero.after,{kicker:'You said it tonight',quote:REUSED});
 v=recap({});assert.equal(v.hero.kind,'track');
});

// ---- MH-1: the phone is served over https when DESK_HTTPS=1 ----
test('phoneUrl is https:// with DESK_HTTPS=1 and http:// without it (MH-1)',()=>{
 const was=process.env.DESK_HTTPS;
 try{
  process.env.DESK_HTTPS='1';dispatch({type:'reset'});assert.match(getSession().phoneUrl,/^https:\/\/.+\/phone$/);
  delete process.env.DESK_HTTPS;dispatch({type:'reset'});assert.match(getSession().phoneUrl,/^http:\/\/.+\/phone$/);
  process.env.DESK_HTTPS='0';dispatch({type:'reset'});assert.match(getSession().phoneUrl,/^http:\/\//,'only "1" switches it on');
 }finally{if(was===undefined)delete process.env.DESK_HTTPS;else process.env.DESK_HTTPS=was;dispatch({type:'reset'});}
});

// ---- v2 L3: pitch a scene, played now (lib/english/pitch.ts; conversation.ts "pitch"; check.ts pitchAsk)
const PITCH=()=>require(path.join(root,'src/lib/english/pitch.ts'));
const pitchTopic=(patch={})=>({id:'pitch-a1',title:'The dragon at the bank',goal:'Open an account for a dragon.',why:'Your own scene.',skill:'request',audience:'all',partner:'Mo · Bank clerk',premise:'A dragon wants to open a bank account; the learner translates for it.',cue:'Try: My friend would like to…',quiz:{question:'Which asks politely?',options:['Could you help us?','Give me money.'],correct:0},...patch});
/** jakub is type "other": with the adult box ticked he is in Adult mode (rules/mode.ts modeOf). */
async function adultAtDesk(){fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true},notes:[]});}
test('pitch case 1: with a stubbed engine, a pitch is shaped once, kept as "pitch-", and started at once over the current scene',async()=>{
 await adultAtDesk();await command('start',{sceneId:'booking'});const before=getSession().conversation.id;
 const seen=[];answer=async req=>{const p=JSON.parse(req.prompt);seen.push({step:p.step??'opening',thinking:req.thinking});
  if(p.step==='plan'){const {id,...t}=pitchTopic();return {json:{topics:[t]},provider:'test',ms:1};}
  return {json:{title:'The dragon at the bank',goal:'Open the account.',opening:'Next, please. Oh. Is that a dragon?'},provider:'test',ms:1};};
 await command('pitch',{text:'A dragon wants to open a bank account and I translate'});
 const c=getSession().conversation,kept=getLearner('jakub').english.pitches;
 assert.deepEqual(seen.map(x=>x.step),['plan','opening'],'one shaping call, then the opening start makes');
 assert.equal(seen[0].thinking,false,'the shaping call runs with thinking off, as every conversation call');
 assert.notEqual(c.id,before,'the pitch replaced the scene that was running');
 assert.match(c.sceneId,/^pitch-[0-9a-f]{8}$/);assert.equal(kept.length,1);assert.equal(kept[0].id,c.sceneId);
 assert.equal(c.scene.premise,pitchTopic().premise,'the scene contract is the shaped pitch');assert.equal(c.turns.length,1);
 const profile=getSession().profiles.find(p=>p.id==='jakub'),prefs=getLearner('jakub').english.preferences;
 const ids=eligibleScenes(profile,prefs,getLearner('jakub').english).map(x=>x.id);
 assert(ids.includes(c.sceneId),'start resolves it through eligibleScenes');
 assert(ids.indexOf(c.sceneId)<ids.indexOf('meet'),'after the plan topics, before the authored situations');
});
test('pitch case 2: pitches are capped at 12 and the newest are kept; the newest leads the list',()=>{
 const {keepPitch,pitchScenes,PITCHES_CAP}=PITCH();
 let l=emptyEnglish();for(let i=1;i<=14;i++)l=keepPitch(l,pitchTopic({id:`pitch-${i}`,title:`Scene ${i}`}));
 assert.equal(PITCHES_CAP,12);assert.equal(l.pitches.length,12);
 assert.deepEqual(l.pitches.map(t=>t.id),Array.from({length:12},(_,i)=>`pitch-${i+3}`),'the two oldest went');
 assert.equal(pitchScenes(l)[0].id,'pitch-14');
 assert.equal(keepPitch(l,pitchTopic({id:'pitch-14',title:'Again'})).pitches.length,12,'the same id is replaced, not doubled');
});
test('pitch case 3: cleanEnglish keeps and trims pitches; a record without any stays without the field',()=>{
 const raw={pitches:[...Array.from({length:14},(_,i)=>pitchTopic({id:`pitch-${i}`})),pitchTopic({id:'plan-x'}),pitchTopic({id:'pitch-bad',premise:'A naked dragon.'}),{id:'pitch-junk'},'junk',pitchTopic({id:'pitch-13'})]};
 const kept=cleanEnglish(raw).pitches;
 assert.equal(kept.length,12,'trimmed to the newest 12');
 assert.deepEqual(kept.map(t=>t.id),Array.from({length:12},(_,i)=>`pitch-${i+2}`),'no plan id, no never-list pitch, no malformed one, no duplicate');
 assert.equal('pitches' in cleanEnglish({}),false);assert.deepEqual(cleanEnglish(undefined),emptyEnglish());
 assert.equal(cleanEnglish({pitches:[pitchTopic({premise:'Two strangers flirt at a bar in the station.'})]}).pitches[0].audience,'adult','the gate reads a pitch on load too');
});
test('pitch case 4 GUARD: a pitch on the record is offered only in Adult mode; a Family profile never sees it',()=>{
 const l={...emptyEnglish(),pitches:[pitchTopic()]};
 const adult={id:'a',name:'A',type:'other',modules:['english'],mode:'adult'};
 assert(eligibleScenes(adult,defaultPreferences(adult),l).some(x=>x.id==='pitch-a1'));
 for(const p of [{...adult,mode:'family'},{id:'k',name:'K',type:'elementary',age:12,modules:['english']},{id:'t',name:'T',type:'high-school',age:16,modules:['english']}])
  assert(!eligibleScenes(p,defaultPreferences(p),l).some(x=>x.id==='pitch-a1'),`${p.type} ${p.mode??''}`);
 assert.deepEqual(eligibleScenes(adult,defaultPreferences(adult),emptyEnglish()).map(x=>x.id),eligibleScenes(adult,defaultPreferences(adult)).map(x=>x.id),'no pitch, no change');
});
