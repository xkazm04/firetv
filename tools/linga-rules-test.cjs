/** Run with npm test in desk/ (directly: node tools/linga-rules-test.cjs). Uses a disposable data directory, never desk/data. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.resolve(__dirname,'../artifacts/linga-rules',String(Date.now()));process.env.DESK_DATA_DIR=data;
const {emptyEnglish}=require(path.join(root,'src/lib/english/types.ts'));
const {eligibleScenes,defaultPreferences}=require(path.join(root,'src/lib/english/curriculum.ts'));
const {cleanEnglish,mergeEvidence,validateObservations}=require(path.join(root,'src/lib/english/rules.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts'));
let answer=async()=>({json:{title:'A practice booking',goal:'Ask for help with a booking.',opening:'Hello. How can I help?'},provider:'test',ms:1});
const realText=engine.text;
engine.text=(req,after)=>answer(req,after);
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
test('an unreadable learner file stops a Linga command before any model call, and says so',async()=>{
 const L=require(path.join(root,'src/lib/session/learners.ts')),{LINGA_UNREAD}=require(path.join(root,'src/lib/english/errors.ts'));
 fresh();
 // the book as it was before this test, restored after: later tests count what is in it
 const f=path.join(data,'learners.json'),before=fs.existsSync(f)?fs.readFileSync(f):null;
 if(!before)L.saveEnglish('ema',L.blank('ema').english);
 const was=fs.readFileSync(f);fs.writeFileSync(f,was.subarray(0,was.length-5));
 let calls=0;answer=async()=>{calls++;return {json:{},provider:'test',ms:1};};
 const real=console.error;console.error=()=>{};
 try{
  await assert.rejects(command('start',{sceneId:'booking'}),(e)=>e instanceof L.LearnersUnread);
  assert.equal(calls,0,'no model call is paid for a turn that could not be saved');
  const c=getSession().conversation;if(c)assert.equal(c.error,LINGA_UNREAD);
 }finally{console.error=real;if(before)fs.writeFileSync(f,before);else fs.rmSync(f,{force:true});}
});
test('the scene premise and partner reach the tutor as input data, never in its system prompt',async()=>{
 fresh();const seen=[];
 answer=async(req)=>{seen.push(req);return {json:{title:'A practice booking',goal:'Ask for help with a booking.',opening:'Hello. How can I help?'},provider:'test',ms:1};};
 await command('start',{sceneId:'booking'});
 assert(seen.length>=1);
 for(const req of seen){
  const input=JSON.parse(req.prompt);
  assert.equal(typeof input.scene.premise,'string');assert(input.scene.premise.length>10,'the premise is in the input');
  assert(!req.system.includes(input.scene.premise),'and not in the system prompt');assert(!req.system.includes(input.scene.partner),'nor the partner');
  assert.match(req.system,/scene\.premise in the input JSON/);
 }
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
 const b1=climb('A2',b=>['A1','A2','B1'].includes(b)?'pass':'fail');assert.equal(b1.st.band,'B1');assert.equal(b1.st.confidence,'medium','two passes at B1 under a fail: few strong passes, no longer high');
 assert.deepEqual(P.staircase('A2',b1.marks),P.staircase('A2',b1.marks));
 assert.equal(P.staircase('A2',[{band:'A2',verdict:'pass'},{band:'B1',verdict:'fail'},{band:'A2',verdict:'pass'},{band:'B1',verdict:'pass'},{band:'B2',verdict:'pass'}]).confidence,'low');
 assert.equal(P.startBand(null),'A2');assert.equal(P.startBand('A1'),'A1');assert.equal(P.startBand('C1'),'B2');
 assert.equal(P.kindFor('B2',[]),'say');assert.equal(P.kindFor('A2',[]),'choose');
});
test('a skip is no evidence, a weak pass is not strong, and two partials end the check (PC1 to PC4)',()=>{
 const skip=band=>({band,verdict:'fail',kind:'say',response:'',skipped:true});
 const say=(band,verdict)=>({band,verdict,kind:'say',response:'I go to school by bus every day.'});
 const floor=P.staircase('A1',[skip('A1'),skip('A1')]);
 assert.equal(floor.done,false,'two skipped A1 tasks do not floor the check');assert.equal(floor.confidence,'low');assert.equal(floor.band,'A1');assert.equal(floor.next,'A1');
 assert.equal(P.staircase('B1',[skip('B1')]).next,'A2','a skip still moves the ladder down one band');
 const weak=P.staircase('B1',[skip('B1'),{band:'A2',verdict:'pass',kind:'choose',response:'Yes please'},{band:'A2',verdict:'pass',kind:'listen',response:' Tuesday '}]);
 assert.notEqual(weak.confidence,'high');assert.equal(weak.confidence,'low');
 assert.equal(P.staircase('B1',[say('B1','pass'),say('B1','pass'),say('B2','fail')]).confidence,'medium','two say passes under a say fail: medium, only a few strong passes');
 assert.equal(P.staircase('B1',[say('B1','pass'),say('B1','pass'),say('B1','pass'),say('B2','fail')]).confidence,'high','three say passes under a say fail: high');
 assert.notEqual(P.staircase('B1',[say('B1','pass'),say('B1','pass'),skip('B2')]).confidence,'high','a skip above is not a ceiling');
 const two=P.staircase('B1',[say('B1','partial'),say('B1','partial')]);
 assert.equal(two.done,true);assert.equal(two.band,'B1');assert.equal(two.confidence,'low');
 assert.equal(P.staircase('B1',[{band:'B1',verdict:'pass',kind:'listen',response:'Tuesday'}]).next,'B1','a one-word listen pass does not climb into a say task');
 assert.equal(P.staircase('B1',[{band:'B1',verdict:'pass',kind:'listen',response:'On Tuesday morning'}]).next,'B2','a longer listen pass is strong');
 assert.equal(P.staircase('A2',[{band:'A2',verdict:'pass',kind:'choose',response:'x'}]).next,'B1','a weak pass still climbs when the next task is not a say task');
 const task={id:'t',band:'A1',kind:'choose',prompt:'p',line:'',options:[],response:'',mode:'text',verdict:'fail',quote:'',note:'n',at:1,skipped:true};
 const kept=P.cleanPlacement({at:1,band:'A1',selfBand:null,confidence:'low',source:'check',summary:'s',focus:'f',tasks:[task,{...task,id:'u',skipped:false}]});
 assert.equal(kept.tasks[0].skipped,true);assert.equal('skipped' in kept.tasks[1],false);
});
test('the verdict line says what a not-high read rests on, in plain words (PC5)',()=>{
 const t=(band,verdict,kind,response='',skipped)=>({band,verdict,kind,response,...(skipped?{skipped:true}:{})});
 const say=(band,verdict)=>t(band,verdict,'say','I go to school by bus.');
 const shapes={
  skips:[P.restsLine('low',[t('A1','fail','choose','',true),t('A1','fail','choose','',true)]),/skipped/],
  choice:[P.restsLine('low',[t('A2','pass','choose','Yes'),t('A2','pass','choose','No')]),/two options/],
  oneWord:[P.restsLine('low',[t('B1','pass','listen','Tuesday'),t('B1','pass','listen','Monday')]),/one-word/],
  mixed:[P.restsLine('low',[t('B1','fail','say','x'),t('A2','pass','choose','Yes'),t('A2','pass','listen','Tuesday')]),/./],
  partly:[P.restsLine('low',[say('B1','partial'),say('B1','partial')]),/partly/],
  disagreed:[P.restsLine('low',[say('A2','fail'),say('B1','pass')]),/disagreed/],
  above:[P.restsLine('medium',[say('B1','pass'),say('B1','pass'),t('B2','fail','say','',true)]),/skipped task/],
 };
 for(const [name,[line,re]] of Object.entries(shapes)){
  assert(re.test(line),name+': '+line);assert(line.split(/\s+/).length<=16,name+' is at most sixteen words');
  assert(!/\d/.test(line)&&!line.includes(String.fromCharCode(8212)),name+' has no digit and no em dash');assert(!/fail/i.test(line),name+' never says failed');
 }
 assert.equal(P.restsLine('high',[]),'Your answers agreed with each other.');
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
// ---- UD-11: the level summary is built from what the learner wrote and said, and a focus that quotes is checked in code ----
async function runCheck(summary){
 fresh();let sent=null;
 answer=wrap(req=>{const p=JSON.parse(req.prompt);if(p.step==='summary'){sent=p;return summary;}return checkAnswer(req);});
 await command('check-start');await answerAbout(3);
 for(let guard=0;getSession().check.stage==='tasks'&&guard<8;guard++){
  const k=getSession().check,t=k.task;
  if(t.kind==='choose'){const right=t.options.indexOf(RIGHT);await command('check-task',{checkId:k.id,taskId:t.id,option:['A1','A2','B1'].includes(t.band)?right:1-right});}
  else await command('check-task',{checkId:k.id,taskId:t.id,text:'I think it was on the bus this morning.',mode:'speech'});
 }
 return {sent,focus:getLearner('ema').english.placement.focus};
}
test('UD-11: the summary call carries each task\'s answer and the goal; a focus quoting words never written is cut',async()=>{
 const ok=await runCheck({summary:'You get by in everyday talk.',focus:'Say more than "on the bus this morning" next time'});
 assert.equal(ok.sent.goal,'talk with friends online');
 assert(ok.sent.tasks.length>0&&ok.sent.tasks.every(t=>typeof t.answer==='string'),'every task carries an answer key');
 assert(ok.sent.tasks.some(t=>t.answer==='I think it was on the bus this morning.'),'the answer is the learner\'s own words');
 assert.match(ok.focus,/on the bus this morning/,'a quote found in the answers stays');
 const bad=await runCheck({summary:'You get by in everyday talk.',focus:'Fix "I goed to the shop" next time'});
 assert.doesNotMatch(bad.focus,/goed/,'a quote the learner never wrote is cut');
 assert(bad.focus.length>0,'the placement still has a focus');
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
test('a moment needs an exact quote, holds the scene, is spaced out, and never makes the next reply supported by itself',async()=>{
 fresh();answer=async()=>({json:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'},provider:'test',ms:1});
 await command('start',{sceneId:'booking',replace:true});let c=getSession().conversation;
 answer=async()=>({json:{reply:'Sure, what name?',observations:[],moment:{kind:'fix',said:'not in the reply',better:'x',why:'y'}},provider:'test',ms:1});
 await command('turn',{text:'I have booking yesterday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 c=getSession().conversation;assert.equal(c.moment,null);assert.equal(c.turns.length,3);assert.equal(getSession().screen,'linga-talk');
 const taught=getLearner('ema').english.taught.length;
 answer=async()=>({json:{reply:'What date was it?',observations:[],moment:{kind:'fix',said:'I have booking',better:'I have a booking',why:'A booking is one thing, so it takes "a".'}},provider:'test',ms:1});
 await command('turn',{text:'I have booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 // K2 revised this row on purpose: a fix waits for the learner's try (repair.ts), so its better is not on the moment and its
 // Taught item is written when the moment closes; it read better on the moment and taught+1 at once before
 c=getSession().conversation;assert.equal(getSession().screen,'linga-moment');assert.equal(c.moment.better,'','the fix waits for a try');assert.equal(c.supported,false,'a moment is not help the learner used (lt-swap-2/recert-1: it read true before)');
 assert.equal(getLearner('ema').english.taught.length,taught,'nothing kept while the moment is open');
 await assert.rejects(command('turn',{text:'Another reply',mode:'text',lastTurnId:c.turns.at(-1).id}),e=>e.status===409);
 await command('moment-done');c=getSession().conversation;assert.equal(c.moment,null);assert.equal(getSession().screen,'linga-talk');
 assert.equal(getLearner('ema').english.taught.length,taught+1,'kept when it closes');assert.equal(c.moments.at(-1).better,'I have a booking');
 await command('turn',{text:'The room is nice, yes.',mode:'text',lastTurnId:c.turns.at(-1).id});
 assert.equal(getSession().conversation.moment,null,'no second moment on the very next turn');
});
test('an optional moment or observation that overruns its limit is dropped, and the turn still lands (real text(), stub provider)',async()=>{
 fresh();answer=async()=>({json:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'},provider:'test',ms:1});
 await command('start',{sceneId:'booking',replace:true});const c=getSession().conversation;
 const reg=require(path.join(root,'src/lib/engines/registry.ts'));
 reg.useProvider('text',{name:'stub',run:async()=>({raw:JSON.stringify({reply:'What name is it under?',
  observations:[{skill:'request',quote:'I has booking',success:false,confidence:'clear',note:'n'.repeat(400)}],
  moment:{kind:'fix',said:'I has booking',better:'I have a booking',why:'w'.repeat(300)}})})});
 engine.text=realText;
 try{await command('turn',{text:'I has booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});}
 finally{engine.text=(req,after)=>answer(req,after);reg.resetProviders();}
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
 // a different slip every reply, so the gap and cap are what is tested (a slip said again may stop inside the gap: linga-moment-test.cjs)
 let n=0;answer=async()=>({json:{reply:'I see. Anything else?',observations:[],moment:{kind:'fix',said:`Room${n} are cold`,better:`Room${n} is cold`,why:'One room takes "is".'}},provider:'test',ms:1});
 const stoppedAt=[];
 for(let i=1;i<=10;i++){const c=getSession().conversation;n=i;await command('turn',{text:`Room${i} are cold.`,mode:'text',lastTurnId:c.turns.at(-1).id});if(getSession().conversation.moment){stoppedAt.push(i);await command('moment-done');}}
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
test("the interest re-ask spends what is left of the plan call's deadline: it carries that answer's ticket",async()=>{
 fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true,goal:'speak more fluently in meetings',interest:'travelling and cooking'},notes:[]});
 const work=[topic('Share your idea in a team meeting','all','relate'),topic('Summarise a project update','all','narrate')];
 const ticket={deadlineAt:Date.now()+60000,try:2},seen=[];
 answer=async(req,after)=>{const p=JSON.parse(req.prompt);if(p.step!=='plan')throw new Error('unexpected '+p.step);seen.push(after);return {json:{topics:work.slice(0,p.count)},provider:'test',ms:1,again:ticket};};
 await command('plan-propose');
 assert.equal(seen.length,2);assert.equal(seen[0],undefined,'the first plan call starts its own deadline');assert.equal(seen[1],ticket,"the re-ask is handed the first answer's ticket");
});
test('a plan swap drops the old topic, brings a different one, and never brings back a rejected title',async()=>{
 fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true,goal:'speak more fluently in meetings',interest:''},notes:[]});
 const base=[topic('Share your idea in a team meeting','all','relate'),topic('Summarise a project update','all','narrate')];
 let queue=[],asks=[];answer=async req=>{const p=JSON.parse(req.prompt);if(p.step!=='plan')throw new Error('unexpected '+p.step);asks.push(p);const next=p.count>1?base:(queue.shift()||[]);return {json:{topics:next},provider:'test',ms:1};};
 await command('plan-propose');let k=getSession().check;const keep=k.topics[1];const rejected=[];
 // each round the model first hands back the swapped title or an earlier rejection, then a real replacement
 const answers=[['Share your idea in a team meeting','Chair a short stand-up'],['Chair a short stand-up','Share your idea in a team meeting','Order food at a cafe'],['Order food at a cafe','Chair a short stand-up','Explain a delay to a client']];
 for(const names of answers){
  const old=getSession().check.topics.find(t=>t.id!==keep.id);
  queue=[names.map(n=>topic(n,'all','request'))];
  asks=[];await command('plan-swap',{checkId:getSession().check.id,topicId:old.id});
  const now=getSession().check;rejected.push(old.title);
  assert(!now.topics.some(t=>t.id===old.id),'old id gone');
  for(const r of rejected)assert(!now.topics.some(t=>t.title===r),'rejected title '+r+' stays out');
  assert.equal(now.topics.length,2);assert(now.topics.some(t=>t.id===keep.id),'the other topic is untouched');
  assert(asks[0].avoid.includes(old.title),'the model is told to avoid the swapped title');
 }
 const titles=getSession().check.topics.map(t=>t.title);assert(titles.includes('Explain a delay to a client'));
});
test('a plan swap that gets no different topic back says so and leaves the list as it was',async()=>{
 fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),adultConfirmed:true,goal:'speak more fluently in meetings',interest:''},notes:[]});
 const base=[topic('Share your idea in a team meeting','all','relate'),topic('Summarise a project update','all','narrate')];
 let swapAnswer=[];answer=async req=>{const p=JSON.parse(req.prompt);if(p.step!=='plan')throw new Error('unexpected '+p.step);return {json:{topics:p.count>1?base:swapAnswer},provider:'test',ms:1};};
 await command('plan-propose');const before=getSession().check.topics.map(t=>t.id+'|'+t.title);const target=getSession().check.topics[0];
 for(const same of [[topic(target.title,'all','relate')],[]]){
  swapAnswer=same;await assert.rejects(()=>command('plan-swap',{checkId:getSession().check.id,topicId:target.id}));
  const now=getSession().check;assert.deepEqual(now.topics.map(t=>t.id+'|'+t.title),before,'the list is unchanged');
  assert.match(now.error,/no different topic.*unchanged/i);assert.equal(now.pending,null);
 }
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
/** TL-12: the session as the TV leaves it while the phone is asked for the learner's line: the reply hand-off is open, so the phone draws its reply box. */
function withReply(s){return {...s,ask:{id:'ask-1',kind:'reply',learner:s.learner?.id??null,screen:s.screen,at:0,phase:'open'}};}
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
// ---- S2: conversations start at the band the learner spoke; the placement's band and the staircase stay as they are ----
const LT_RUN=path.resolve(__dirname,'../uat/runs/2026-10-14-lt');
/**
 * The ten stored LT placements. Their tasks were stored before the judge's readings were kept, so each say task's
 * `answered` and `english` are RECONSTRUCTED here from its verdict and band, as P23 proposed: a pass reads as English
 * at the task's band, a partial as one band below, a fail as two below, all answered "yes". It is the lowest English
 * each verdict allows, and the test checks that verdictFor gives the stored verdict back from it. Listen and choose
 * tasks are left without readings: they never count as production.
 */
function ltPlacements(){
 const find=o=>{if(!o||typeof o!=='object')return null;if(Array.isArray(o.tasks)&&o.band&&o.source)return o;for(const v of Object.values(o)){const r=find(v);if(r)return r;}return null;};
 const back={pass:0,partial:-1,fail:-2};
 return fs.readdirSync(LT_RUN).filter(f=>f.endsWith('.json')&&!['findings.json','run.json'].includes(f)).map(f=>{
  const p=find(JSON.parse(fs.readFileSync(path.join(LT_RUN,f),'utf8')));assert(p,f+' holds a placement');
  const tasks=p.tasks.map(t=>{
   if(t.kind!=='say'||t.skipped||t.english!==undefined)return t;
   const r={...t,answered:'yes',english:P.shift(t.band,back[t.verdict])};
   assert.equal(P.verdictFor(r,r.answered,r.english),t.verdict,f+': the reconstruction gives the stored verdict back');
   return r;
  });
  // the run's facts keep the placement's band, source and tasks (no dates or ids), which is all the S2 rule reads
  return {who:f.split('-')[0],placement:{band:p.band,source:p.source,tasks}};
 });
}
test('S2: the ten stored LT placements - Lukas spoke B2 under a C1 read, Petra A2, Jana and Tomas unchanged',()=>{
 const rows=ltPlacements().map(({who,placement})=>({who,placed:placement.band,spoke:P.spokenBand(placement.tasks),start:P.conversationBand(placement)}));
 console.log('S2 per-Character result (english reconstructed from verdict + task band):\n'+rows.map(r=>`  ${r.who.padEnd(7)} placed ${r.placed}  spoke ${r.spoke??'none'}  conversations start ${r.start}${r.start!==r.placed?'  (lowered)':''}`).join('\n'));
 const want={adela:['C1','C1','C1'],jana:['C2','C2','C2'],klara:['B1','B1','B1'],lukas:['C1','B2','B2'],martin:['B2','B2','B2'],oksana:['B2','B2','B2'],ondrej:['B2','B2','B2'],petra:['B1','A2','A2'],tomas:['A1',null,'A1'],viktor:['A2','A2','A2']};
 assert.equal(rows.length,10);
 for(const r of rows)assert.deepEqual([r.placed,r.spoke,r.start],want[r.who],r.who);
 // the placement's own band is the staircase's, untouched: Lukas is still placed C1
 const lukas=ltPlacements().find(x=>x.who==='lukas').placement;assert.equal(lukas.band,'C1');assert.equal(P.playBand(lukas,'C1'),'C1','his own pick of the read still wins');assert.equal(P.playBand(lukas,'A1'),'B2');
});
// ---- LG-48: the recert's stored placements (2026-10-14-lt/recert-1), replayed through the ladder; no model call ----
const RECERT_RUNS=['recert-1','recert-2','recert-3'],RECERT_RUN=path.join(LT_RUN,'recert-1'),BANDS=['A1','A2','B1','B2','C1','C2'];
/** Each recert-1 Character's J1 placement as ladder marks. The facts keep no `skipped` flag: a task with no response whose note starts "Skipped" was one. */
function recertMarks(runs=['recert-1'],base=LT_RUN){
 return runs.flatMap(run=>fs.readdirSync(path.join(base,run)).filter(f=>/-\d+\.json$/.test(f)).map(f=>{
  const j=JSON.parse(fs.readFileSync(path.join(base,run,f),'utf8'));
  const p=Object.values(j.journeys).map(J=>J.facts&&J.facts.placement).find(Boolean);if(!p)return null;
  const marks=p.tasks.map(t=>({band:t.band,verdict:t.verdict,kind:t.kind,response:t.response,...(t.skipped||(t.response===''&&/^Skipped/.test(t.note))?{skipped:true}:{})}));
  return {run,who:f.replace(/\.json$/,''),trueBand:j.trueBand,stored:p.band,storedConfidence:p.confidence,read:p.selfBand||null,marks};
 })).filter(Boolean);
}
/** The ladder at the start of the LG-48 follow-up (dba8c1de) on every recert placement that carries marks: [band, confidence]. The new rules are measured against it, not against the older stored bands. */
const HEAD_LADDER={'recert-1/adela-17':['C1','high'],'recert-1/jana-29':['C2','high'],'recert-1/klara-13':['B1','medium'],'recert-1/lukas-24':['C1','low'],'recert-1/martin-45':['B1','high'],'recert-1/oksana-34':['C1','low'],'recert-1/ondrej-16':['B1','low'],'recert-1/petra-38':['B1','high'],'recert-1/tomas-9':['A2','low'],'recert-1/viktor-67':['A2','low'],
 'recert-2/tomas-9':['A2','low'],'recert-3/jana-29':['C2','high'],'recert-3/klara-13':['B1','high'],'recert-3/lukas-24':['C1','low'],'recert-3/martin-45':['B1','high'],'recert-3/oksana-34':['B2','high'],'recert-3/viktor-67':['A1','medium']};
test('LG-48: Tomas (A1, age 9) is placed no higher than A2 on his stored marks, and not with high confidence',()=>{
 const tomas=recertMarks().find(r=>r.who==='tomas-9');
 // the stored J1 check (J2-J4 carry it): A1 choose fail on "want play", A1 listen pass in Czech and English, A2 choose
 // pass, B1 listen pass on the two words "Creeper! Boom.", B2 say skipped. Stored: B1, low.
 assert.deepEqual(tomas.marks.map(m=>`${m.band} ${m.kind} ${m.skipped?'skip':m.verdict}`),['A1 choose fail','A1 listen pass','A2 choose pass','B1 listen pass','B2 say skip']);
 assert.equal(tomas.marks[3].response,'Creeper! Boom.');
 const st=P.staircase('A2',tomas.marks);
 assert(BANDS.indexOf(st.band)<=BANDS.indexOf('A2'),`Tomas placed ${st.band}, true A1`);
 assert.notEqual(st.confidence,'high');
 assert(P.weakPass(tomas.marks[3]),'a two-word listening pass is weak');
});
test('placement rework: over recert-1, -2 and -3 no learner moves farther from their true band, no unproven read keeps high, and one-band-high misses land',()=>{
 const far=(a,b)=>Math.abs(BANDS.indexOf(a)-BANDS.indexOf(b));
 const rows=recertMarks(RECERT_RUNS).map(r=>{const head=HEAD_LADDER[r.run+'/'+r.who];assert(head,r.run+'/'+r.who+' has a HEAD reading');return {...r,head,now:P.staircase('A2',r.marks,r.read)};});
 assert.equal(rows.length,17,'every recert placement that carries marks (ondrej-16 of recert-3 stored none)');
 const table=rows.map(r=>[(r.run+' '+r.who).padEnd(20),r.trueBand,(r.head[0]+' ('+r.head[1]+')').padEnd(11),(r.now.band+' ('+r.now.confidence+')').padEnd(11),far(r.head[0],r.trueBand)+' -> '+far(r.now.band,r.trueBand)].join(' | '));
 console.log('placement replay (character | true band | HEAD band (confidence) | new band (confidence) | distance before -> after):\n  '+table.join('\n  '));
 // (b) no learner farther from the true band than the HEAD placement
 for(const r of rows)assert(far(r.now.band,r.trueBand)<=far(r.head[0],r.trueBand),`${r.run}/${r.who}: ${r.head[0]} -> ${r.now.band}, true ${r.trueBand}`);
 // (a) a placement above the true band, or one the read disagrees with, or one resting on fewer than three strong passes, is never high
 for(const r of rows){
  const strong=r.marks.filter(m=>m.band===r.now.band&&m.verdict==='pass'&&!m.skipped&&!P.weakPass(m)).length;
  if(BANDS.indexOf(r.now.band)>BANDS.indexOf(r.trueBand)||(r.read&&r.read!==r.now.band)||strong<P.HIGH_STRONG_PASSES)assert.notEqual(r.now.confidence,'high',`${r.run}/${r.who}: ${r.now.band} must not be high`);
 }
 // (c) the recorded one-band-high misses now land on their true band
 const high=rows.filter(r=>BANDS.indexOf(r.head[0])===BANDS.indexOf(r.trueBand)+1),landed=high.filter(r=>r.now.band===r.trueBand);
 assert(high.length>=5);assert(landed.length>=1,'at least one one-band-high miss lands on its true band');
 for(const w of ['adela-17','jana-29','lukas-24'])assert(landed.some(r=>r.who===w),w+' lands on the true band');
 // the lean needs a strong pass one band down: Ondrej (B1, read A2, A2 held by a choice only) is not pushed below his true band
 assert.equal(rows.find(r=>r.run==='recert-1'&&r.who==='ondrej-16').now.band,'B1');
 // the lines for the new reasons stay short and say what holds
 const say=(band,verdict)=>({band,verdict,kind:'say',response:'I usually go to school by bus with my friends.'});
 const lean=P.staircase('B1',[say('B1','pass'),say('B2','pass')],'B1');assert.equal(lean.band,'B1');assert.equal(lean.rests,'lean');assert.equal(lean.confidence,'low');
 const agree=[say('B1','pass'),say('B1','pass'),say('B1','pass'),say('B2','fail')];
 assert.equal(P.staircase('B1',agree,'B1').confidence,'high');
 const clash=P.staircase('B1',agree,'A2');assert.equal(clash.band,'B1');assert.equal(clash.rests,'read');assert.equal(clash.confidence,'medium');
 for(const [conf,marks,read,re] of [['medium',[say('B1','pass'),say('B1','pass'),say('B2','fail')],null,/few strong/],['medium',[say('B1','pass'),say('B1','pass'),say('B1','pass'),say('B2','fail'),say('B1','pass')],'B2',/start pointed elsewhere/],['low',[say('B1','pass'),say('B2','pass')],'B1',/only one was strong/]])
  {const line=P.restsLine(conf,marks,read);assert.match(line,re);assert(line.split(' ').length<=16,line);}
 // one strong say pass above a lower fail is thin: the learner leans down to the band under it, which holds a strong pass; a second one holds the band
 assert.equal(P.staircase('A2',[{band:'A2',verdict:'fail',kind:'choose',response:'x'},{band:'A1',verdict:'pass',kind:'choose',response:'y'},{band:'A2',verdict:'pass',kind:'choose',response:'z'},{band:'B1',verdict:'pass',kind:'listen',response:'He missed the bus'},say('B2','pass')]).band,'B1');
 const climber=P.staircase('A2',[{band:'A2',verdict:'fail',kind:'choose',response:'x'},{band:'A1',verdict:'pass',kind:'choose',response:'y'},{band:'A2',verdict:'pass',kind:'choose',response:'z'},say('B2','pass'),say('B2','pass')]);
 assert.equal(climber.band,'B2');assert.notEqual(climber.confidence,'high');
});
// ---- the A2/B1 boundary: every stored placement (17 recert + 6 out of sample), replayed through the ladder; no model call ----
const OOS_RUN='2026-10-16-lt-placement-oos';
/** The ladder at db604738 on every stored placement: [band, confidence]. Every A2 Character placed B1; the boundary rule is measured against it. */
const HEAD_BOUNDARY={'recert-1/adela-17':['B2','medium'],'recert-1/jana-29':['C1','medium'],'recert-1/klara-13':['B1','low'],'recert-1/lukas-24':['B2','low'],'recert-1/martin-45':['B1','medium'],'recert-1/oksana-34':['B2','low'],'recert-1/ondrej-16':['B1','low'],'recert-1/petra-38':['B1','medium'],'recert-1/tomas-9':['A1','low'],'recert-1/viktor-67':['A1','low'],
 'recert-2/tomas-9':['A1','low'],'recert-3/jana-29':['C1','medium'],'recert-3/klara-13':['B1','medium'],'recert-3/lukas-24':['B2','low'],'recert-3/martin-45':['B1','medium'],'recert-3/oksana-34':['B2','medium'],'recert-3/viktor-67':['A1','low'],
 [OOS_RUN+'/dominik-17']:['B2','low'],[OOS_RUN+'/hana-41']:['B1','medium'],[OOS_RUN+'/klara-13']:['B1','medium'],[OOS_RUN+'/oksana-34']:['B2','low'],[OOS_RUN+'/petra-38']:['B1','low'],[OOS_RUN+'/sofie-11']:['B1','low']};
/** The A2 placements the boundary rule moves down to A2. oos petra-38 (A2 choice, B1 listen and say partial, read B1) is Ondrej's shape (B1 exact) and stays. */
const BOUNDARY_MOVED=['recert-1/klara-13','recert-1/petra-38','recert-3/klara-13',OOS_RUN+'/klara-13',OOS_RUN+'/sofie-11'];
test('A2/B1 boundary: over all 23 stored placements every exact one stays, none moves farther or below its true band, none turns high, and the A2 learners held at B1 land on A2',()=>{
 const far=(a,b)=>Math.abs(BANDS.indexOf(a)-BANDS.indexOf(b));
 const rows=[...recertMarks(RECERT_RUNS),...recertMarks([OOS_RUN],path.resolve(LT_RUN,'..'))].map(r=>{const key=r.run+'/'+r.who,head=HEAD_BOUNDARY[key];assert(head,key+' has a HEAD reading');return {...r,key,head,now:P.staircase('A2',r.marks,r.read)};});
 assert.equal(rows.length,23,'17 recert placements with marks and the six out of sample');
 console.log('A2/B1 boundary replay (character | true | HEAD (confidence) | now (confidence)):\n  '+rows.map(r=>[r.key.padEnd(38),r.trueBand,(r.head[0]+' ('+r.head[1]+')').padEnd(11),r.now.band+' ('+r.now.confidence+')'].join(' | ')).join('\n  '));
 const exact=rows.filter(r=>r.head[0]===r.trueBand);
 assert.equal(exact.length,14,'the placements exact at HEAD');
 for(const w of ['hana-41','dominik-17','ondrej-16','martin-45','adela-17','jana-29','lukas-24'])assert(exact.some(r=>r.who===w),w+' is exact at HEAD');
 for(const r of rows){
  if(r.head[0]===r.trueBand)assert.equal(r.now.band,r.trueBand,`(i) ${r.key} was exact at ${r.trueBand}, now ${r.now.band}`);
  assert(far(r.now.band,r.trueBand)<=far(r.head[0],r.trueBand),`(ii) ${r.key}: ${r.head[0]} -> ${r.now.band}, true ${r.trueBand}`);
  assert(BANDS.indexOf(r.now.band)>=BANDS.indexOf(r.trueBand)||r.now.band===r.head[0],`(iii) ${r.key} moved below its true ${r.trueBand} to ${r.now.band}`);
  if(r.head[1]!=='high')assert.notEqual(r.now.confidence,'high',`(iv) ${r.key} turned high`);
 }
 for(const k of BOUNDARY_MOVED){const r=rows.find(x=>x.key===k);assert.equal(r.trueBand,'A2');assert.equal(r.now.band,'A2',`(v) ${k} lands on A2 (HEAD ${r.head[0]})`);}
 for(const r of rows)if(!BOUNDARY_MOVED.includes(r.key))assert.equal(r.now.band,r.head[0],`${r.key} does not move`);
});
test('S2: spokenBand reads answered say tasks only, at their highest; conversationBand lowers at most one band, only when asked to speak at the level',()=>{
 const say=(band,english,patch={})=>({band,kind:'say',answered:'yes',english,...patch});
 assert.equal(P.spokenBand([]),null);
 assert.equal(P.spokenBand([{band:'B1',kind:'listen',answered:'yes',english:'B1'},{band:'A2',kind:'choose'}]),null,'listening and choosing are not production');
 assert.equal(P.spokenBand([say('B1','A2',{skipped:true}),say('B1','B1',{answered:'no'}),say('B1','none')]),null,'a skip, an off-task answer and no English give no band');
 assert.equal(P.spokenBand([{band:'B1',kind:'say',verdict:'partial'}]),null,'a task stored before the readings were kept counts for nothing');
 assert.equal(P.spokenBand([say('B2','A2'),say('B1','B1',{answered:'partly'}),say('B2','A2')]),'B1','the highest band spoken');
 const placed=(band,tasks,source='check')=>({band,source,tasks});
 assert.equal(P.conversationBand(placed('B1',[say('B1','A1')])),'A2','never more than one band below the read');
 assert.equal(P.conversationBand(placed('B1',[say('A2','A2')])),'B1','an easier say task cannot show the higher band: no change');
 assert.equal(P.conversationBand(placed('B1',[say('B1','A2')],'self')),'B1','a band picked by hand is kept as picked');
 assert.equal(P.conversationBand(placed('B1',[say('B2','C1')])),'B1','spoken higher never lifts the start');
 // the cleaner keeps the readings, tolerates their absence, and drops a malformed one without dropping the task
 const task={id:'t',band:'B1',kind:'say',prompt:'p',line:'',options:[],response:'I went there.',mode:'speech',verdict:'partial',quote:'I went there.',note:'n',at:1};
 const kept=P.cleanPlacement({at:1,band:'B1',selfBand:null,confidence:'low',source:'check',summary:'s',focus:'f',tasks:[{...task,answered:'partly',english:'A2'},task,{...task,id:'u',answered:'maybe',english:'Z9'},{...task,id:'v',english:'none'}]});
 assert.equal(kept.tasks.length,4);
 assert.equal(kept.tasks[0].answered,'partly');assert.equal(kept.tasks[0].english,'A2');
 assert.equal('english' in kept.tasks[1],false);assert.equal('answered' in kept.tasks[2],false);assert.equal('english' in kept.tasks[2],false);assert.equal(kept.tasks[3].english,'none');
});
test('S2: a check that heard A2 under a B1 read keeps B1, starts conversations and topics at A2, and a Set up save keeps it the check\'s',async()=>{
 fresh();const plans=[];
 answer=wrap(req=>{const p=JSON.parse(req.prompt);
  if(p.step==='judge')return {answered:'yes',english:p.kind==='say'?'A2':p.band,quote:p.response.slice(0,10),note:'A clear answer.'};
  if(p.step==='plan')plans.push(p);
  return checkAnswer(req);});
 await command('check-start');await answerAbout(3);
 for(let guard=0;getSession().check.stage==='tasks';guard++){
  assert(guard<P.MAX_TASKS);const k=getSession().check,t=k.task;
  if(t.kind==='choose')await command('check-task',{checkId:k.id,taskId:t.id,option:t.options.indexOf(RIGHT)});
  else await command('check-task',{checkId:k.id,taskId:t.id,text:'I think it was on the bus this morning.',mode:'speech'});
 }
 let l=getLearner('ema').english;
 assert.equal(l.placement.band,'B1','the check\'s read is unchanged');assert.equal(l.placement.source,'check');
 assert.equal(l.preferences.level,'A2','conversations start at the band spoken');
 const says=l.placement.tasks.filter(t=>t.kind==='say');assert(says.length>=2&&says.some(t=>['B1','B2','C1','C2'].includes(t.band)));
 assert(says.every(t=>t.answered==='yes'&&t.english==='A2'),'each say task keeps the judge\'s readings');
 assert(l.placement.tasks.filter(t=>t.kind==='choose').every(t=>!('english' in t)),'a choice has no judge reading');
 // the verdict on the TV: both bands in the picture, the start band in the caption
 const v=view().lingaView(getSession());
 assert.equal(getSession().screen,'linga-verdict');assert.equal(v.hero.kind,'ladder');assert.equal(v.hero.band,'B1');assert.equal(v.hero.spoke,'A2');
 assert.match(v.hero.kicker,/^Understood B1 · spoke A2/);assert.equal(v.caption,'Conversations start at A2, where your spoken answers were.');
 // Set up saved after the split check, at either band: still the check's
 await command('preferences',{preferences:{...l.preferences,level:'A2'},notes:[]});
 l=getLearner('ema').english;assert.equal(l.placement.source,'check');assert.equal(l.placement.band,'B1');assert.equal(l.preferences.level,'A2');
 await command('plan-propose');assert.equal(plans.at(-1).band,'A2','the topic plan is pitched at the band spoken');assert.match(plans.at(-1).bandGuide,/^A2:/);
 await command('check-leave',{checkId:getSession().check.id});
 await command('preferences',{preferences:{...l.preferences,level:'B1'},notes:[]});
 l=getLearner('ema').english;assert.equal(l.placement.source,'check','the read itself is the check\'s too');assert.equal(l.preferences.level,'B1');
 // the conversation plays at the preference: the tutor's pitch and the moment rate follow it
 const seen=[];answer=async req=>{seen.push(req);return {json:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'},provider:'test',ms:1};};
 await command('preferences',{preferences:{...l.preferences,level:'A2'},notes:[]});
 await command('start',{sceneId:'booking',replace:true});
 assert.match(seen.at(-1).system,/Level: A2 on the CEFR scale/);assert.equal(getSession().conversation.preferences.level,'A2');
 assert.equal(JSON.parse(seen.at(-1).prompt).levelCheck.band,'B1');assert.equal(JSON.parse(seen.at(-1).prompt).levelCheck.spokenAnswersAt,'A2');
 // any other band by hand is the learner's own pick, as before
 await command('preferences',{preferences:{...l.preferences,level:'B2'},notes:[]});
 l=getLearner('ema').english;assert.equal(l.placement.source,'self');assert.equal(l.placement.band,'B2');
});
test('LG-49: the TV home calls the read band "Your level" and names the spoken band only as a second line, only when it differs',()=>{
 const V=view(),say=(band,english)=>({id:'s'+band+english,band,kind:'say',prompt:'p',line:'',options:[],response:'I like it.',mode:'speech',verdict:'partial',quote:'I like it.',note:'n',at:1,answered:'yes',english});
 const home=(placement)=>{const v=V.lingaView(sessionOf(fixture('linga',{placement,plan:planned('p-a','p-b'),sessions:played('p-a')})),{});return {v,text:V.viewText(v)};};
 const split=home({...placed('B1'),tasks:[say('B1','A2')]});
 assert.equal(split.v.home,'next-topic');
 assert.match(split.v.hero.kicker,/^B1 · /,'the hero names the read band');
 assert(!/^A2/.test(split.v.hero.kicker),'the spoken band is not the level');
 assert.match(split.v.hero.subtitle,/Talking today at A2 · /);
 assert.match(split.text,/Talking today at A2/);
 const plain=home({...placed('B1'),tasks:[say('B1','B1')]});
 assert.match(plain.v.hero.kicker,/^B1 · /);
 assert(!/Talking today/.test(plain.text),'matching bands: no second line');
});
test('LG-49: the TV menu entry "My level" describes the read (placed) band, not the band Linga plays at',()=>{
 const V=view(),say=(band,english)=>({id:'s'+band+english,band,kind:'say',prompt:'p',line:'',options:[],response:'I like it.',mode:'speech',verdict:'partial',quote:'I like it.',note:'n',at:1,answered:'yes',english});
 const entry=(placement)=>V.lingaView(sessionOf(fixture('linga',{placement,plan:planned('p-a','p-b'),sessions:played('p-a')})),{menu:true}).actions.find(a=>a.id==='my-level');
 const split=entry({...placed('B1'),tasks:[say('B1','A2')]});
 assert(split.help.startsWith(`B1 · ${P.BAND_NAME.B1}.`),split.help);
 // the spoken band lowers what Linga plays at; the menu still names the read
 const lowered=entry({...placed('B1'),tasks:[say('B1','A2')]});
 assert(!/A2/.test(lowered.help),'the spoken band is not the level');
 assert(entry(placed('C1')).help.startsWith(`C1 · ${P.BAND_NAME.C1}.`));
});
test('S2 view: the verdict shows the read and the band spoken when they differ, and only the read when they agree',()=>{
 const V=view(),say=(band,english,mode='speech')=>({id:'s'+band+english,band,kind:'say',prompt:'p',line:'',options:[],response:'I like it.',mode,verdict:'partial',quote:'I like it.',note:'n',at:1,answered:'yes',english});
 const split={...placed('B1'),tasks:[say('B1','A2')]};
 let v=V.lingaView(sessionOf(fixture('linga-verdict',{placement:split,check:checkOf({stage:'verdict',turns:[],placement:split})})));
 assert.equal(v.hero.spoke,'A2');assert.equal(v.hero.band,'B1');assert.equal(v.title,'B1 · Getting by');
 assert.match(v.hero.kicker,/Understood B1 · spoke A2/);
 assert.equal(v.caption,'Conversations start at A2, where your spoken answers were.');
 assert(!/\d/.test(v.caption.replace(/\b[ABC][12]\b/g,'')),'no figure but band names');
 assert.match(V.viewText(v),/marker on B1, second mark on A2/);
 const clamped={...placed('B1'),tasks:[say('B1','A1')]};
 v=V.lingaView(sessionOf(fixture('linga-verdict',{placement:clamped})));assert.equal(v.hero.spoke,'A1');assert.equal(v.caption,'Conversations start at A2, one step below the level you understood.');
 const typed={...placed('B1'),tasks:[say('B1','A2','text')]};
 v=V.lingaView(sessionOf(fixture('linga-verdict',{placement:typed})));assert.match(v.hero.kicker,/wrote A2/);assert.match(v.caption,/written answers/);
 const agree={...placed('B1'),tasks:[say('B1','B1')]};
 v=V.lingaView(sessionOf(fixture('linga-verdict',{placement:agree})));assert.equal('spoke' in v.hero,false);assert.equal(v.hero.kicker,"Linga's read · not a certificate");
 const self={...split,source:'self'};
 v=V.lingaView(sessionOf(fixture('linga-verdict',{placement:self})));assert.equal('spoke' in v.hero,false);
});
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
 // TL-12: the six states are the TV's alone; the phone holds no home panel
 const phone=fs.readFileSync(path.join(root,'src/english/LingaPhone.tsx'),'utf8');
 assert.doesNotMatch(phone,/function StartPanel|lingaHome\(/,'the phone has no home panel');
 for(const state of V.HOME_STATES)assert(want[state].length>0,`the TV row names ${state}`);
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
   assert.equal(typeof a.run,'object',where);assert(a.run.command||a.run.nav||a.run.ui||a.run.ask||a.run.focus!==undefined,`${where} does something`);
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
function ladderEngine(turn,opening={title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'}){
 calls=0;answer=async req=>{calls++;const p=JSON.parse(req.prompt);return {json:p.submittedReply?turn(p):opening,provider:'test',ms:1};};
}
// LG-5 recert-9: the learner starts with no band known, so no hold applies: at A1-A2 rung 1 is a say-back, not the simpler line, and
// an earlier test's level left on the shared learner would decide which ladder these cases walk
async function booked(turn,opening){fresh();saveEnglish('ema',emptyEnglish());ladderEngine(turn,opening);await command('start',{sceneId:'booking',replace:true});}
const reply=(text='I need a room.')=>command('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
const said=(text,patch={})=>()=>({reply:text,observations:[],...patch});
const observed=q=>[{skill:'request',quote:q,success:true,confidence:'clear',note:'Asked clearly.'}];

test('ladder case 1: three cues walk simpler, meaning, starter; any revealed rung makes the reply supported (ruling (a))',async()=>{
 await booked(said('Which date do you need?',{help:LADDER}));await reply();
 const V=view(),walk=[];
 for(let i=0;i<3;i++){await command('cue');const c=getSession().conversation;walk.push([c.cue,c.help&&c.help.rung,c.supported,V.lingaView(getSession(),{}).captionTag]);}
 assert.deepEqual(walk,[[LADDER.simpler,1,true,'Said more simply'],[LADDER.meaning,2,true,'What it means'],[LADDER.starter,3,true,'A way to start']]);
});
test('ladder case 2: help follows the partner\'s current question, never the last one or the scene\'s static cue (the Tomas case)',async()=>{
 const A={simpler:'Your dog\'s name?',meaning:'name: what you call him',starter:'My dog is called …'};
 const B={simpler:'Does he like his ball?',meaning:'ball: the round toy he plays with',starter:'He likes …'};
 await booked(said('Does Pip play with his ball every day?',{help:B}),{title:'A new dog',goal:'Talk about a dog.',opening:'What is your dog\'s name, then?',help:A});
 await command('cue');assert.equal(getSession().conversation.cue,A.simpler);
 await reply('His name is Pip.');await command('cue');
 const cue=getSession().conversation.cue;
 assert.equal(cue,B.simpler);
 for(const x of [...Object.values(A),BOOKING_CUE])assert.notEqual(cue,x);
});
test('ladder case 3: a reply with no rung revealed is independent; after the meaning rung it is supported, as after the starter (ruling (a))',async()=>{
 await booked(p=>({reply:'Which date do you need?',observations:observed(p.submittedReply),help:LADDER}));
 await reply('Could you check my booking?');
 let c=getSession().conversation,learner=c.turns.at(-2);
 assert.equal(learner.supported,false,'no rung revealed: unaided');assert(c.evidence.length&&c.evidence.filter(e=>e.turnId===learner.id).every(e=>e.supported===false));
 await command('cue');await command('cue');
 await reply('Could you check it for Friday?');
 c=getSession().conversation;learner=c.turns.at(-2);
 assert.equal(learner.supported,true,'the meaning rung is help');assert(c.evidence.filter(e=>e.turnId===learner.id).length&&c.evidence.filter(e=>e.turnId===learner.id).every(e=>e.supported===true));
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
 await booked(p=>({reply:partner,observations:observed(p.submittedReply),help:{simpler:partner,meaning:LADDER.meaning,starter:'I need a room for Friday.'}}));
 await reply('Could you check my booking?');
 let c=getSession().conversation;assert.equal(c.turns.at(-1).text,partner);assert.equal(c.evidence.length,1);
 await command('cue');c=getSession().conversation;assert.equal(c.cue,LADDER.meaning);assert.equal(c.supported,true,'any revealed rung is help (ruling (a))');
 await command('cue');c=getSession().conversation;assert.equal(c.cue,LADDER.meaning,'no rung past the last valid one');
 ladderEngine(said(partner,{help:{simpler:partner,meaning:'',starter:'I need a room for Friday.'}}));
 await reply('Friday, please.');await command('cue');
 c=getSession().conversation;assert.equal(c.cue,BOOKING_CUE);assert.equal(c.supported,true);
 // through the real engine: help is optional and unchecked there, so a help the schema would refuse costs a rung, not the turn
 const reg=require(path.join(root,'src/lib/engines/registry.ts'));
 reg.useProvider('text',{name:'stub',run:async()=>({raw:JSON.stringify({reply:'And for how many nights?',observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'x'.repeat(400),meaning:'nights: how many times you sleep there',starter:7}})})});
 engine.text=realText;
 try{await reply('For Friday.');}finally{engine.text=(req,after)=>answer(req,after);reg.resetProviders();}
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
const CONVERSATION_ACTIONS=['turn','cue','quiz','choice','coach','replay','capture','pause','resume','repeat','leave','finish','moment-done','moment-try','moment-show'];
/** A stub engine that answers every conversation call well: the opening, a turn, a coach that quotes the reply, a replay. */
function answerAll(){answer=async req=>{const p=JSON.parse(req.prompt);return {json:/^Coach/.test(p.task??'')?{before:p.submittedReply.slice(0,6),after:'I work in a hotel',note:'Try the verb alone.'}:{title:'T',goal:'G',opening:'Hi?',reply:'Ok. And then?',observations:[]},provider:'test',ms:1};};}
const extraFor=(action,c)=>action==='moment-try'?{text:'I work in a hotel.',mode:'text',lastTurnId:c.moment?.turnId}:action==='turn'?{text:'I like it.',mode:'text',lastTurnId:c.turns.at(-1)?.id}:action==='choice'?{option:0}:action==='capture'?{active:true}:{};

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
  'paused+pending':fixture('linga-talk',{placement:placed(),conversation:convo({turns:REPLIED,paused:true,pending:'held'})}),
  // K2: a fix moment withheld, on its clue, shown, and held (repair.ts)
  ...Object.fromEntries([0,1].map(rung=>[`moment withheld ${rung}`,fixture('linga-moment',{placement:placed(),conversation:convo({turns:REPLIED,moment:{...MOMENT,better:'',fix:undefined,slip:'am work',repair:{rung}}})})])),
  'moment shown':fixture('linga-moment',{placement:placed(),conversation:convo({turns:REPLIED,moment:{...MOMENT,repair:{rung:2}}})}),
  'moment held':fixture('linga-moment',{placement:placed(),conversation:convo({turns:REPLIED,moment:{...MOMENT,repair:{rung:0,tried:'I work in a hotel.',held:true,selfRepaired:true,spent:true}}})})};
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
test('turn case 6: a paused scene with a reply pending offers Cancel alone on the TV, and the phone draws no control (TL-12)',()=>{
 const S=require(path.resolve(__dirname,'../uat/driver/surface.cjs'));
 const s=sessionOf(fixture('linga-talk',{placement:placed(),conversation:convo({turns:REPLIED,paused:true,pending:'held'})}));
 const row=view().lingaView(s).actions;
 assert.deepEqual(row.filter(a=>!a.disabled).map(a=>a.id),['cancel'],'the TV row is Cancel alone while the reply is pending: no Resume to press');assert.ok(!row.find(a=>a.id==='cancel').disabled,'and Cancel works');
 const sf=S.surfaceOf(s);
 assert.deepEqual(sf.controls.filter(c=>c.side==='phone'),[],'the phone draws no control');
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
const TAUGHT_B={id:'old2:t2:moment',kind:'word',said:'rezervace',better:'reservation',why:'The booking itself.',turnId:'old2:t2',at:5,sceneId:'booking',title:'A hotel booking',offered:1,reusedAt:Date.now(),reusedIn:'old3',reusedQuote:'reservation'};
const TAUGHT_C={id:'old4:t4:moment',kind:'word',said:'svačina',better:'a snack',why:'Food you eat between meals.',turnId:'old4:t4',at:20,sceneId:'weekend',title:'A weekend plan'};
const REUSED='Hi, I have a booking for Friday.';
const REVIEW={id:TAUGHT_A.id,kind:'fix',better:'I have a booking',fromTitle:'A hotel booking'};
/** a learner whose record holds these taught items, and an engine that keeps every prompt it was sent */
let prompts=[];
async function taughtStart(taught,opening={title:'Rover',goal:'Find the rover.',opening:'Hello there. Where are you going?'},turnReply='Lovely. And what name is it under?'){
 fresh();saveEnglish('ema',{...emptyEnglish(),taught});prompts=[];
 answer=async req=>{const p=JSON.parse(req.prompt);prompts.push(p);return {json:p.submittedReply?{reply:turnReply,observations:[]}:opening,provider:'test',ms:1};};
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
 assert.equal(taughtOf(TAUGHT_A.id).offered,1);assert.equal(taughtOf(TAUGHT_B.id).offered,1,'the item used again today is not due before tomorrow (K3)');
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
 let c=await taughtStart([TAUGHT_A],{title:'Booking',goal:'Fix a booking.',opening:'Which date do you need?',help:LADDER});
 assert.equal(c.review.id,TAUGHT_A.id);
 await command('cue');await command('cue');await command('cue');assert.equal(getSession().conversation.supported,true);
 await reply(REUSED);
 assert.equal(taughtOf(TAUGHT_A.id).reusedAt,undefined,'a supported reply is not reuse');assert.equal(getSession().conversation.review.used,undefined);
 // LG-56: the fixture line fits the A1 band, so the hold keeps the words this row is about
 c=await taughtStart([TAUGHT_A],{title:'Booking',goal:'Fix a booking.',opening:'I have a booking list here. Your name?'});
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
test('UD-15: the TV recap\'s track hero names the scene the brought-back sentence was taught in',()=>{
 const V=view(),turns=convo().turns;
 const v=V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),taught:[TAUGHT_A],conversation:convo({phase:'finished',turns,review:REVIEW})})),{});
 assert.equal(v.hero.kind,'track');assert.equal(v.hero.sentence,'I have a booking');assert.equal(v.hero.from,REVIEW.fromTitle);
 const tv=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.equal(v.hero.label,'From an earlier scene: A hotel booking');assert.match(tv,/label=\{h\.label\?\?/,'the card labels its source');
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
test('review case 6 (K3): an item invited twice without a use is snoozed, not retired; an item saved retired comes back',async()=>{
 const R=review(),now=Date.now();
 const missed=R.offer(R.offer([TAUGHT_A],TAUGHT_A.id,now-2*R.DAY_MS),TAUGHT_A.id,now-R.DAY_MS)[0];
 assert.equal(missed.offered,2);assert.equal(missed.nextDueAt,now-R.DAY_MS+R.SNOOZE_MS,'snoozed from its second invitation');assert.equal(missed.misses,0,'the count starts again');
 assert.equal(R.dueTaught([missed,TAUGHT_C],'new').id,TAUGHT_C.id);
 assert.equal(R.dueTaught([TAUGHT_C,TAUGHT_A],'new').id,TAUGHT_A.id,'oldest first');
 assert.equal(R.dueTaught([TAUGHT_A],'old1'),null,'never from the rehearsal that taught it');
 let c=await taughtStart([missed,TAUGHT_C]);assert.equal(c.review.id,TAUGHT_C.id);
 c=await taughtStart([missed,TAUGHT_B]);assert.equal(c.review,null);assert.equal(prompts[0].bringBack,undefined);
 assert.equal(taughtOf(TAUGHT_A.id).offered,2);
 assert.equal(R.dueTaught([missed],'new',undefined,missed.nextDueAt).id,TAUGHT_A.id,'back when the snooze ends');
 // a record saved before K3 with an item offered twice (retired, then) is snoozed from the day it was taught: long past here
 const legacy=cleanEnglish({taught:[{...TAUGHT_A,offered:2}]}).taught[0];
 assert.equal(legacy.nextDueAt,TAUGHT_A.at+R.SNOOZE_MS);assert.equal(R.dueTaught([legacy],'new').id,TAUGHT_A.id);
});
test('review case 7: cleanEnglish keeps a taught item\'s review fields, schedules an item saved before K3, and drops a malformed one',()=>{
 const R=review(),kept={...TAUGHT_A,offered:1,reusedAt:99,reusedIn:'c9',reusedQuote:'I have a booking'};
 const taught=cleanEnglish({taught:[kept,{...TAUGHT_A,id:'bad',reusedAt:'yesterday'},{...TAUGHT_A,id:'bad2',reuses:[{at:'x'}]},{...TAUGHT_A,id:'bad3',nextDueAt:'soon'},TAUGHT_C]}).taught;
 assert.deepEqual(taught.map(t=>t.id),[TAUGHT_A.id,TAUGHT_C.id]);
 // K1: a fix's slip keys are worked out again on every load (slip.ts), so a record saved before them gets them; a word gets none.
 // K3: the use it kept becomes the first of its history, due one interval after it
 assert.deepEqual(taught[0],{...kept,slip:'i has booking',fix:'i have a booking',reuses:[{at:99,conversationId:'c9',quote:'I have a booking'}],misses:0,nextDueAt:99+R.REUSE_INTERVALS_MS[0]});
 assert.deepEqual(taught[1],TAUGHT_C,'an item never offered keeps no review fields');
 assert.deepEqual(cleanEnglish({taught:[taught[0]]}).taught[0],taught[0],'a scheduled item loads as it was saved');
});
test('review case 8 GUARD: a learner with no taught items gets no review and no bringBack',async()=>{
 const c=await taughtStart([]);
 assert.equal(c.review??null,null);assert(!('bringBack' in prompts[0]));
 await reply(REUSED);assert(!('bringBack' in prompts[1]));
});

// ---- K1 slip keys: a taught fix is judged by the words that changed (slip.ts), not by its whole sentence
const slipMod=()=>require(path.join(root,'src/lib/english/slip.ts'));
/** Viktor's fix from the 2026-10-14 LT run, as the record keeps it */
const VIKTOR={id:'v1:t1:moment',kind:'fix',said:'My tomatoes is one metr.',better:'My tomatoes are one metre tall.',why:'A plural subject like tomatoes takes are, not is.',turnId:'v1:t1',at:30,sceneId:'garden',title:'Show my tomato plants'};
/** a learner whose record holds `taught`, and an engine that keeps every prompt and answers each turn with `turn()` */
async function slipStart(taught,turn=()=>({reply:'Lovely! What colour are they?',observations:[]})){
 fresh();saveEnglish('ema',{...emptyEnglish(),taught:cleanEnglish({taught}).taught});prompts=[];
 answer=async req=>{const p=JSON.parse(req.prompt);prompts.push(p);return {json:p.submittedReply?turn(p):{title:'Garden',goal:'Show the garden.',opening:'Hi Grandpa! What is growing there?'},provider:'test',ms:1};};
 await command('start',{sceneId:'rover',replace:true});
 return getSession().conversation;
}
test('K1 case 1: slipOf keeps the changed words with a neighbour - a change one, a drop or an addition both - and folds number words',()=>{
 const S=slipMod();
 assert.deepEqual(S.slipOf('My tomatoes is one metre','My tomatoes are one metre'),{slip:'tomatoes is',fix:'tomatoes are'});
 assert.deepEqual(S.slipOf(VIKTOR.said,VIKTOR.better),{slip:'tomatoes is',fix:'tomatoes are'},'of two changes, the first whose own key is guarded');
 assert.deepEqual(S.slipOf('saturday is more better for me','Saturday is better for me'),{slip:'is more better',fix:'is better'},'a dropped word keeps both neighbours');
 assert.deepEqual(S.slipOf('I like creeper','I like the creeper.'),{slip:'like creeper',fix:'like the creeper'},'an added word keeps both neighbours');
 assert.deepEqual(S.slipOf('we was discussing about this venue','we were discussing this venue'),{slip:'we was',fix:'we were'},'a known pair needs no content word');
 assert.deepEqual(S.slipOf('He come with a car','He comes with a car'),{slip:'he come',fix:'he comes'});
 assert.deepEqual(S.slipOf('I has booking','I have a booking'),{slip:'i has booking',fix:'i have a booking'},'a function-word key grows to a content word');
 assert.equal(S.slipOf('I like it','I like it.'),null,'nothing changed');
 assert.equal(S.slipOf('rezervace','reservation'),null,'a key needs two said-side words');
 const k=S.slipOf('It is one metres','It is one metre');
 assert.equal(S.slipIn('They are two metres now.',k),'two metres','number words are one class');
});
test('K1 case 2: the record tier refuses function-word-only keys and words the partner said; "Did he come" is no "he come"; the fix said raises nothing',()=>{
 const S=slipMod();
 assert.equal(S.guarded('i will'),false,'function words only: most stored "i will" are right English');
 assert.equal(S.guarded('is more'),false);assert.equal(S.guarded('we was'),true,'on the teacher list');assert.equal(S.guarded('tomatoes is'),true);
 const tom={slip:'tomatoes is',fix:'tomatoes are'},come={slip:'he come',fix:'he comes'};
 assert.equal(S.recordTier(tom,['Grandpa, how big are the tomatoes?']),true);
 assert.equal(S.recordTier(tom,['Look, the tomatoes is what I mean!']),false,'a key the partner said in this scene is never judged on the record');
 assert.equal(S.recordTier({slip:'i will',fix:'i would'},[]),false);
 assert.equal(S.slipIn('Did he come with the car?',come),null,'after an auxiliary the bare form is right');
 assert.equal(S.slipIn('Can he come at six?',come),null);
 assert.equal(S.slipIn('Please sit here, he come in ten minutes.',come),'he come');
 assert.equal(S.slipIn('The tomatoes are green.',tom),null,'the fix said is no slip');
 assert.equal(S.slipIn('Tomatoes is green, but tomatoes are sweet.',tom),null,'a reply that holds the fix is not flagged');
 assert.equal(S.slipIn('Tomatoes is green.',tom),'Tomatoes is');
 assert.equal(S.findKey('My TOMATOES   are big.',tom.fix),'TOMATOES   are');
 assert(S.sameSlip('tomatoes is','my tomatoes is'));assert(!S.sameSlip('tomatoes is','tomato is'));
});
test('K1 case 3 GATE: replaying the 2026-10-14 LT moments over the stored learner lines flags the known recurrences; on other learners\' lines only two true "is more better" slips',()=>{
 const S=slipMod(),dir=path.resolve(__dirname,'../uat/runs/2026-10-14-lt');
 const people=fs.readdirSync(dir).filter(f=>/-\d+\.json$/.test(f)).sort().map(f=>({who:f.replace('.json',''),run:JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))}));
 // each learner's lines in run order, with that scene's partner lines; a moment sits on the first line that quotes it
 for(const p of people){p.lines=[];p.moments=[];
  for(const j of p.run.journeys){const c=j.facts?.conversation;
   if(!c){for(const st of j.steps)if(typeof st.args?.text==='string')p.lines.push({scene:j.id,text:st.args.text,partner:[]});continue;}
   const partner=c.turns.filter(t=>t.role==='partner').map(t=>t.text);
   for(const t of c.turns)if(t.role==='learner'){p.lines.push({scene:j.id,text:t.text,partner});for(const m of c.moments??[])if(!p.moments.some(x=>x.m===m)&&t.text.includes(m.said))p.moments.push({m,at:p.lines.length-1});}}}
 assert.equal(people.reduce((n,p)=>n+p.moments.length,0),17,'the corpus holds 17 stored moments');
 const own=[],other=[];
 for(const p of people)for(const {m,at} of p.moments){
  const keys=S.slipOf(m.said,m.better);if(!keys)continue;
  for(const l of p.lines.slice(at+1))if(S.slipIn(l.text,keys))own.push({who:p.who,slip:keys.slip,text:l.text,record:S.recordTier(keys,l.partner)});
  for(const q of people)if(q!==p)for(const l of q.lines)if(S.slipIn(l.text,keys))other.push({who:q.who,from:p.who,slip:keys.slip,text:l.text,record:S.recordTier(keys,l.partner)});
 }
 // the six P06 names: Viktor 'tomatoes is' twice, Petra 'he come' once, Tomas 'I like creeper' three times
 const known=[['viktor-67','tomatoes is','Tomatoes is green. And red. Red, I like.'],['viktor-67','tomatoes is','I have tomatoes. My tomatoes is big.'],['petra-38','he come','Sorry. I ask my colleague now. Please sit here, he come in ten minutes. I think it is okay.'],['tomas-9','like creeper','Creeper. I like creeper. Kráva ne.'],['tomas-9','like creeper','Yes! Creeper! I like creeper. Creeper boom!'],['tomas-9','like creeper','Yes! Creeper is my favourite. I like creeper.']];
 for(const [who,slip,text] of known)assert(own.some(h=>h.who===who&&h.slip===slip&&h.text===text&&h.record),`${who} "${slip}" flagged on the record: ${text}`);
 // one more the six did not name: Tomas's 'I like dog.' said again the next reply
 assert.deepEqual(own.map(h=>`${h.who} ${h.slip}`).sort(),[...known.map(([w,s])=>`${w} ${s}`),'tomas-9 like dog'].sort());
 assert(own.every(h=>h.record),'every recurrence is record tier');
 // other learners' lines: the only flags are Martin's own "is more better" (a double comparative, wrong in any sentence) on Ondrej's key
 assert.deepEqual(other.map(h=>`${h.from}->${h.who} ${h.slip} ${h.record?'record':'soft'}`),['ondrej-16->martin-45 is more better record','ondrej-16->martin-45 is more better record']);
 assert(other.every(h=>/\bmore better\b/i.test(h.text)),'no flag on another learner\'s line is a false match');
 console.log(`# K1 replay: ${own.length} recurrences flagged (${own.filter(h=>h.record).length} record tier) over ${people.reduce((n,p)=>n+p.lines.length,0)} learner lines; other learners: ${other.filter(h=>h.record).length} record-tier flags, ${other.filter(h=>!h.record).length} soft, all true "is more better" slips`);
});
// LG-57 revised this row on purpose: where a moment may stop the scene, a record-tier slip said again is now a fossil and
// stops it (code's moment, FOSSIL_TASK); the soft recast this row pins is what is left when no moment may, as here
test('K1 case 4: a taught slip said again reaches the turn prompt as slipAgain, counts once a reply on the record, and the fix said raises nothing',async()=>{
 await slipStart([VIKTOR]);getSession().conversation.preferences.correction='pauses';
 await reply('Tomatoes is green. And red.');
 const again=prompts.at(-1).slipAgain;
 assert.deepEqual({said:again.said,better:again.better},{said:'Tomatoes is',better:'tomatoes are'},'the learner\'s exact words and the fix key');
 assert.match(again.task,/right form/);assert.match(again.task,/Do not stop/);
 let t=taughtOf(VIKTOR.id);assert.equal(t.slips,1);assert.equal(typeof t.slipAt,'number');
 const first=t.slipAt;
 await reply('The tomatoes are green.');
 assert.equal(prompts.at(-1).slipAgain,undefined,'the right form raises nothing');assert.equal(taughtOf(VIKTOR.id).slips,1);
 await reply('My tomatoes is red now.');
 t=taughtOf(VIKTOR.id);assert.equal(t.slips,2,'the count only rises');assert(t.slipAt>=first);
 assert.equal(getLearner('ema').english.taught.length,1);
});
test('K1 case 5: a function-word-only slip may ask for a soft recast but never writes the record',async()=>{
 const WILL={...VIKTOR,id:'w1:t1:moment',said:'I will',better:'I would',turnId:'w1:t1'};
 assert.deepEqual(slipMod().slipOf(WILL.said,WILL.better),{slip:'i will',fix:'i would'});
 await slipStart([WILL]);
 await reply('I will go there.');
 assert.equal(prompts.at(-1).slipAgain.said,'I will','soft tier: the partner may recast');
 assert.equal(taughtOf(WILL.id).slips,undefined,'record tier refused');
});
test('K1 case 6: a slip taught twice merges into one Taught item; "My tomatoes are big." in a later scene marks Viktor\'s item reused',async()=>{
 const R=review();
 assert.equal(R.findPhrase('My tomatoes are big.',VIKTOR.better),null,'today\'s whole-sentence test: null');
 // the moment Linga made in the next scene on the same slip, said in a new sentence
 let c=await slipStart([VIKTOR],()=>({reply:'Lovely! How big is it now?',observations:[],moment:{kind:'fix',said:'My tomatoes is big.',better:'My tomatoes are big.',why:'Tomatoes is plural, so it takes are.'}}));
 assert.equal(c.review.id,VIKTOR.id);assert.equal(c.review.fix,'tomatoes are');
 await reply('I have tomatoes. My tomatoes is big.');
 // K2: the moment joins the scene's moments, and merges into the record, when it closes
 assert(getSession().conversation.moment,'the stop itself still happens');await command('moment-done');
 c=getSession().conversation;
 assert.equal(c.moments.length,1,'the stop itself still happens');assert.equal(c.moments[0].slip,'tomatoes is');assert.equal(c.moments[0].fix,'tomatoes are');
 const taught=getLearner('ema').english.taught;
 assert.equal(taught.length,1,'taught once, not twice');assert.equal(taught[0].id,VIKTOR.id);assert.equal(taught[0].slips,1,'one reply counts once');
 assert.equal(c.review.used,undefined,'the slip said is no reuse');
 // a later scene: the fix key said unaided, in a sentence Linga never taught
 c=await slipStart([VIKTOR]);
 assert.equal(c.review.id,VIKTOR.id);
 await reply('My tomatoes are big.');
 const t=taughtOf(VIKTOR.id);
 assert.equal(typeof t.reusedAt,'number');assert.equal(t.reusedQuote,'tomatoes are');
 assert.equal(getSession().conversation.review.used,'My tomatoes are big.');
 // the same guards as before: not after the partner said the fix key in this scene, not on a supported reply
 const scene=convo({turns:[{id:'p1',role:'partner',text:'Your tomatoes are lovely!'}],review:R.reviewOf(cleanEnglish({taught:[VIKTOR]}).taught[0])});
 assert.equal(R.reuseOf('My tomatoes are big.',scene),null,'the partner said it first');
 assert.equal(R.reuseOf('My tomatoes are big.',{...scene,turns:convo().turns,supported:true}),null,'supported');
 assert.equal(R.reuseOf('My tomatoes are big.',{...scene,turns:convo().turns}),'tomatoes are');
 // a word item keeps today's whole-phrase test
 assert.equal(R.reuseOf('I have a snack.',convo({review:R.reviewOf(TAUGHT_C)})),'a snack');assert.equal(R.reviewOf(TAUGHT_C).fix,undefined);
});

// ---- K3: taught items keep coming back until they hold (review.ts schedule; a fake clock, no model)
const T0=Date.UTC(2026,9,1,9),HOUR=3600e3;
test('K3 case 1: a first reuse schedules another invitation a day later, not before; then three and seven days; a use at the end of the ladder rests',()=>{
 const R=review(),id=TAUGHT_A.id;let t=[{...TAUGHT_A,at:T0}];
 assert.equal(R.dueTaught(t,'s1',undefined,T0+1).id,id,'a new item is due at once');
 t=R.offer(t,id,T0+HOUR);
 let used=T0+2*HOUR;t=R.markReused(t,id,'c1','I have a booking',used,'booking');
 assert.equal(t[0].reusedAt,used);assert.deepEqual(t[0].reuses,[{at:used,conversationId:'c1',quote:'I have a booking',sceneId:'booking'}]);assert.equal(t[0].misses,0);
 const ladder=[];
 for(const [n,days] of [[1,1],[2,3],[3,7]]){
  assert.equal(t[0].nextDueAt,used+days*R.DAY_MS,`use ${n}: due ${days} days later`);
  assert.equal(R.dueTaught(t,'s',undefined,used+days*R.DAY_MS-1),null,`use ${n}: nothing comes due early`);
  assert.equal(R.dueTaught(t,'s',undefined,used+days*R.DAY_MS).id,id,`use ${n}: due on the day`);
  ladder.push(days);
  used=used+days*R.DAY_MS+HOUR;t=R.offer(t,id,used-HOUR);t=R.markReused(t,id,`c${n+1}`,'I have a booking',used,'booking');
 }
 assert.deepEqual(ladder,[1,3,7]);
 assert.equal(t[0].reuses.length,4);assert.equal(t[0].reusedAt,used,'reusedAt is the latest use');assert.equal(t[0].reusedIn,'c4');
 assert.equal(t[0].nextDueAt,undefined);assert.equal(R.rests(t[0]),true);
 assert.equal(R.dueTaught(t,'s',undefined,used+365*R.DAY_MS),null,'a use at the end of the ladder rests the item');
 assert.deepEqual(cleanEnglish({taught:t}).taught[0].reuses.map(r=>r.conversationId),['c1','c2','c3','c4'],'the history survives a load, for a later "yours" rule (L1)');
});
test('K3 case 2: two invitations without a use snooze the item; it returns when the snooze ends, and two more misses snooze it again',()=>{
 const R=review(),id=TAUGHT_A.id;let t=[{...TAUGHT_A,at:T0}];
 t=R.offer(t,id,T0+HOUR);assert.equal(R.dueTaught(t,'s',undefined,T0+2*HOUR).id,id,'one miss: still due');
 t=R.offer(t,id,T0+2*HOUR);
 assert.equal(R.dueTaught(t,'s',undefined,T0+2*HOUR+R.SNOOZE_MS-1),null,'snoozed, nothing early');
 assert.equal(R.dueTaught(t,'s',undefined,T0+2*HOUR+R.SNOOZE_MS).id,id,'back after the snooze, not retired');
 const back=T0+2*HOUR+R.SNOOZE_MS;
 t=R.offer(t,id,back);assert.equal(R.dueTaught(t,'s',undefined,back+HOUR).id,id,'the count started again');
 t=R.offer(t,id,back+HOUR);assert.equal(R.dueTaught(t,'s',undefined,back+2*HOUR),null);assert.equal(t[0].offered,4);
 // a use in the scene that snoozed it replaces the snooze with the ladder
 t=R.markReused(R.offer(R.offer([{...TAUGHT_A,at:T0}],id,T0+HOUR),id,T0+2*HOUR),id,'c1','I have a booking',T0+3*HOUR);
 assert.equal(t[0].nextDueAt,T0+3*HOUR+R.DAY_MS);
});
test('K3 case 3: a slipping item outranks an older due one, even snoozed or resting; a slip before its last invitation does not',()=>{
 const R=review(),old={...TAUGHT_C,at:T0};
 const snoozed={...TAUGHT_A,at:T0+5,offered:2,misses:0,offeredAt:T0+10,nextDueAt:T0+10+R.SNOOZE_MS};
 assert.equal(R.dueTaught([old,snoozed],'s',undefined,T0+30).id,old.id,'without a slip: the older due item');
 assert.equal(R.dueTaught([old,{...snoozed,slips:1,slipAt:T0+20}],'s',undefined,T0+30).id,snoozed.id,'its slip came back after the invitation: first');
 assert.equal(R.dueTaught([old,{...snoozed,slips:1,slipAt:T0+8}],'s',undefined,T0+30).id,old.id,'a slip before the last invitation is spent');
 const resting={...TAUGHT_A,at:T0,reuses:[1,2,3,4].map(n=>({at:T0+n,conversationId:'c'+n,quote:'I have a booking'})),reusedAt:T0+4};
 assert.equal(R.dueTaught([old,resting],'s',undefined,T0+30).id,old.id);
 assert.equal(R.dueTaught([old,{...resting,slips:1,slipAt:T0+9}],'s',undefined,T0+30).id,resting.id,'a resting item whose slip comes back is invited again');
 // with two slipping, the latest slip first; the record-tier slip count comes from K1 markSlipped
 const a={...snoozed,id:'a',slipAt:T0+20},b={...snoozed,id:'b',slipAt:T0+25};
 assert.equal(R.dueTaught([a,b,old],'s',undefined,T0+30).id,'b');
 assert.equal(R.dueTaught(R.markSlipped([old,{...snoozed}],'i has booking',T0+40),'s',undefined,T0+50).id,snoozed.id,'markSlipped makes it slip');
});
test('K3 case 4: a seeded run on a fake clock - used, not invited the same day, invited the next day; one model call per start and per turn, as before',async()=>{
 const realNow=Date.now;let clock=T0;Date.now=()=>clock;
 try{
  let c=await taughtStart([{...TAUGHT_A,at:T0-review().DAY_MS}]);
  assert.equal(c.review.id,TAUGHT_A.id);assert.equal(prompts.length,1,'the opening: one call');
  clock+=HOUR;await reply(REUSED);assert.equal(prompts.length,2,'a turn: one call');
  let t=taughtOf(TAUGHT_A.id);assert.equal(t.reusedAt,clock);assert.equal(t.nextDueAt,clock+review().DAY_MS);assert.equal(t.reuses.length,1);
  const used=clock;
  clock+=2*HOUR;prompts=[];await command('start',{sceneId:'booking',replace:true});
  assert.equal(getSession().conversation.review,null,'not invited again the same day');assert.equal(prompts.length,1);assert.equal(prompts[0].bringBack,undefined);
  clock=used+review().DAY_MS;prompts=[];await command('start',{sceneId:'rover',replace:true});
  c=getSession().conversation;assert.equal(c.review.id,TAUGHT_A.id,'invited again a day after the use');assert.equal(prompts.length,1);assert.equal(prompts[0].bringBack.phrase,'I have a booking');
  t=taughtOf(TAUGHT_A.id);assert.equal(t.offered,2);assert.equal(t.offeredAt,clock);assert.equal(t.misses,1);
  await reply('Yes, I have a booking for two.');assert.equal(prompts.length,2,'still one call a turn');
  t=taughtOf(TAUGHT_A.id);assert.equal(t.reuses.length,2);assert.equal(t.nextDueAt,clock+3*review().DAY_MS,'the second use: three days');
  assert.notEqual(t.reuses[0].conversationId,t.reuses[1].conversationId,'two scenes in the history');
 }finally{Date.now=realNow;}
});

// ---- K4: one line in every room (line.ts). A stubbed engine, no live model.
const lineMod=()=>require(path.join(root,'src/lib/english/line.ts'));
const BRIDGE='Which bridge do you mean?';
const ROVER_OPENING={title:'Rover',goal:'Find the rover.',opening:'Hello there. Where are you going?'};
/** a learner whose record is `learning`, a rover scene started on an engine that keeps every prompt and request */
let requests=[];
async function roomStart(learning={},opening=ROVER_OPENING,turn=()=>({reply:'Good. Then turn left at the tree. What do you see?',observations:[]})){
 fresh();saveEnglish('ema',{...emptyEnglish(),...learning});prompts=[];requests=[];
 answer=async req=>{requests.push(req);const p=JSON.parse(req.prompt);prompts.push(p);return {json:p.submittedReply?turn(p):opening,provider:'test',ms:1};};
 await command('start',{sceneId:'rover',replace:true});
 return getSession().conversation;
}
const withoutScene=c=>JSON.stringify({...c,scene:undefined});
test('K4 case 1: the rover scene hides its quiz answer; an unsupported reply that says its key words finds it - the recap pictures it and one Taught item is kept, unreused',async()=>{
 const L=lineMod();
 assert.equal(L.lineKey(BRIDGE),'bridge do you mean');assert.equal(L.lineKey('Could I have the bill, please?'),'the bill');assert.equal(L.lineKey('Yes, I am.'),null);
 const c=await roomStart();
 assert.deepEqual(c.line,{source:'quiz'},'the session knows the source only');
 assert.equal(L.heldLine(c.id).text,BRIDGE);assert.equal(L.heldLine(c.id).key,'bridge do you mean');
 assert(!withoutScene(getSession().conversation).includes('bridge do you mean')&&!withoutScene(getSession().conversation).includes(BRIDGE),'the line is in server memory, not the conversation (the scene contract carries its quiz, as before)');
 assert.equal(prompts[0].roomLine.phrase,BRIDGE);assert.match(prompts[0].roomLine.task,/never say it/i);assert.match(prompts[0].roomLine.task,/one question/i);
 assert.equal(prompts[0].bringBack,undefined,'no taught item: the review is untouched');
 const before=getLearner('ema').english.taught.length;
 await reply('Sorry, which bridge do you mean?');
 assert.equal(prompts.length,2,'one call to open, one for the turn: no second call');
 let now=getSession().conversation;assert.equal(now.line.found,'Sorry, which bridge do you mean?');assert.equal(now.line.text,BRIDGE);assert.equal(L.heldLine(c.id),null);
 const taught=getLearner('ema').english.taught;assert.equal(taught.length,before+1,'one Taught item');
 const item=taught.at(-1);
 assert.equal(item.better,BRIDGE);assert.equal(item.reusedAt,undefined,'found here, not yet reused: a later room invites it');assert.equal(item.offered,undefined);
 assert.equal(item.line,'quiz');assert.equal(item.key,'bridge do you mean');assert.equal(item.said,'');assert.equal(item.kind,'word');
 await reply('The old one.');assert.equal(prompts[2].roomLine,undefined,'once found, the partner stops inviting it');
 await command('finish');
 const v=view().lingaView(getSession(),{});
 assert.equal(v.hero.kind,'comparison');assert.equal(v.title,'You found it');
 assert.deepEqual(v.hero.before,{kicker:'The line in this room',quote:BRIDGE});assert.deepEqual(v.hero.after,{kicker:'You said it tonight',quote:'Sorry, which bridge do you mean?'});
 const text=view().viewText(v);assert(text.includes(`"${BRIDGE}"`));assert(text.includes('"Sorry, which bridge do you mean?"'));
 assert.equal(getLearner('ema').english.taught.length,before+1,'finishing keeps it once');
 // the item comes back in a later room, judged on its key words (review.ts reuseOf)
 const R=review(),stored=cleanEnglish({taught:[item]}).taught[0];assert.deepEqual(stored,item,'it loads as it was kept');
 const rv=R.reviewOf(stored);assert.equal(rv.key,'bridge do you mean');
 assert.equal(R.reuseOf('So which bridge do you mean, the red one?',convo({review:rv})),'bridge do you mean');
 assert.equal(R.reuseOf('Which bridge?',convo({review:rv})),null);
});
test('K4 case 2: no find after a partner line said it, after the quiz showed it, or on a supported reply; the partner stops inviting a shown line',async()=>{
 // LG-56: the fixture line fits the A1 band, so the hold keeps the words this row is about
 let c=await roomStart({},{...ROVER_OPENING,opening:'Two bridges here. Which bridge do you mean?'});
 await reply('Which bridge do you mean?');
 assert.equal(getSession().conversation.line.found,undefined,'the partner said it first');assert.equal(getLearner('ema').english.taught.length,0);
 c=await roomStart({},ROVER_OPENING,()=>({reply:'Which bridge do you mean? There are two.',observations:[]}));
 await reply('I want the bridge.');await reply('Which bridge do you mean?');
 assert.equal(getSession().conversation.line.found,undefined,'a partner line already said it');
 // LG-5 recert-9 revised this row on purpose: the quiz is the line's own (help.ts quizFor), so its option shows the key here
 c=await roomStart({},{...ROVER_OPENING,help:{fits:'To the river. Which bridge do you mean?',misfit:'I am nine.'}});
 await command('quiz');assert.equal(getSession().conversation.line.shown,true,'the quiz put it on screen');
 await reply('I go to the river.');await reply('Which bridge do you mean?');
 assert.equal(getSession().conversation.line.found,undefined,'shown by the quiz two turns ago');assert.equal(prompts.at(-1).roomLine,undefined);
 c=await roomStart();await command('cue');// help the learner used (lt-swap-2/recert-1: an opening line is no help)
 await reply('Which bridge do you mean?');assert.equal(getSession().conversation.line.found,undefined,'a supported reply');
 assert.deepEqual(getSession().conversation.line,{source:'quiz'},'not found, not handed over: the session holds no words of it');
});
test('K4 case 3: a zero-moment scene\'s recap hands over the line as the sentence to take, and keeps it as invited once; without a line it is today\'s bare track',async()=>{
 await roomStart();
 await reply('I go left at the big tree.');await command('finish');
 const s=getSession(),c=s.conversation;assert.equal(c.moments.length,0);assert.equal(c.line.text,BRIDGE);assert.equal(c.line.found,undefined);
 const v=view().lingaView(s,{});assert.equal(v.hero.kind,'track');assert.equal(v.hero.sentence,BRIDGE);assert.equal('from' in v.hero,false);
 assert(view().viewText(v).includes(`The line hidden in this room: "${BRIDGE}"`));
 const item=getLearner('ema').english.taught.at(-1);assert.equal(item.better,BRIDGE);assert.equal(item.offered,1);assert.equal(item.misses,1);assert.equal(typeof item.offeredAt,'number');assert.equal(item.reusedAt,undefined);
 // today, with no review and no line, the recap is a track with no sentence
 const bare=view().lingaView(sessionOf(fixture('linga-recap',{placement:placed(),conversation:convo({phase:'finished',turns:REPLIED})})),{});
 assert.equal(bare.hero.kind,'track');assert.equal(bare.hero.sentence,undefined);
 // a scene left with no reply hands nothing over and keeps nothing
 await roomStart();await command('finish');assert.equal(getSession().conversation.line,null);assert.equal(getLearner('ema').english.taught.length,0);
});
test('K4 case 4: the check focus \'Try "he needs" instead of "he need"\' - the verdict shows "he need", and the first room hides "he needs" on its fix key',async()=>{
 const L=lineMod(),task={id:'s1',band:'A2',kind:'say',prompt:'Tell me about your family.',line:'',options:[],response:'My brother he need a new bike.',mode:'speech',verdict:'partial',quote:'he need',note:'n',at:1};
 const focus='Try "he needs" instead of "he need"',pl={...placed('A2'),focus,tasks:[task]};
 assert.deepEqual(L.focusParts(focus,[task]),{focus,quote:'he need',line:'he needs'});
 const {quotedFocus}=require(path.join(root,'src/lib/english/check.ts'));
 assert.equal(quotedFocus(focus,[task]),focus,'a second quote no answer holds is the line, not a misquote');
 assert.equal(quotedFocus('Try "a beer with friends" instead of "he need"',[task],l=>!/beer/.test(l)),L.FOCUS_FALLBACK,'a line the audience gate refuses takes the focus with it');
 assert.equal(quotedFocus('Try "he needs" or "he wants" for "he need"',[task]),L.FOCUS_FALLBACK,'two unheld spans: a misquote');
 assert.equal(quotedFocus('Try "he need a new bike please" not "he need"',[task]),L.FOCUS_FALLBACK,'a line that holds the learner\'s words');
 let v=view().lingaView(sessionOf(fixture('linga-verdict',{placement:pl,check:checkOf({stage:'verdict',turns:[],placement:pl})})),{});
 assert.equal(v.caption,'Try saying: “he needs”.');assert.equal(v.captionTag,'Try saying');assert(!view().viewText(v).includes('Your words'));
 v=view().lingaView(sessionOf(fixture('linga-verdict',{placement:{...pl,focus:L.FOCUS_FALLBACK}})),{});
 assert(!v.caption.includes(L.FOCUS_FALLBACK),'the fallback focus is never the caption');
 // the first room: no taught item due, so the check's line is hidden, keyed on its fix key, its slip absent
 const c=await roomStart({placement:pl});
 assert.deepEqual(c.line,{source:'check'});const h=L.heldLine(c.id);
 assert.equal(h.text,'he needs');assert.equal(h.key,'he needs');assert.equal(h.slip,'he need');assert.equal(prompts[0].roomLine.phrase,'he needs');
 await reply('He need a map.');assert.equal(getSession().conversation.line.found,undefined,'the slip again is no find');
 await reply('My robot friend, he needs a map too.');
 const now=getSession().conversation;assert.equal(now.line.found,'My robot friend, he needs a map too.');
 const item=getLearner('ema').english.taught.at(-1);
 assert.equal(item.kind,'fix');assert.equal(item.said,'he need');assert.equal(item.better,'he needs');assert.equal(item.title,'Your level check');assert.equal(item.slip,'he need');assert.equal(item.fix,'he needs');
 await command('finish');
 v=view().lingaView(getSession(),{});assert.deepEqual(v.hero.before,{kicker:'From your level check',quote:'he needs'});
 // once kept, the check's line does not seed a room again; the fallback focus never seeds one
 assert.equal(L.checkLine(pl,getLearner('ema').english.taught),null);
 const c2=await roomStart({placement:{...pl,focus:L.FOCUS_FALLBACK}});assert.deepEqual(c2.line,{source:'quiz'});
 // a due taught item stays the room's line (source 1): nothing is held beside it
 const c3=await roomStart({placement:pl,taught:[TAUGHT_A]});assert.equal(c3.review.id,TAUGHT_A.id);assert.equal(c3.line,undefined);assert.equal(prompts[0].roomLine,undefined);
});
test('K4 case 5: the summary task asks for the better phrase in a second pair of quotes, and a check whose answers hold the first keeps the focus',async()=>{
 const r=await runCheck({summary:'You get by in everyday talk.',focus:'Say "on the bus that morning" for "on the bus this morning"'});
 assert.match(r.sent.task,/second pair of double quotes after the learner's words/);
 assert.equal(r.focus,'Say "on the bus that morning" for "on the bus this morning"');
 const p=getLearner('ema').english.placement;assert.deepEqual(lineMod().focusParts(p.focus,p.tasks),{focus:p.focus,quote:'on the bus this morning',line:'on the bus that morning'});
});
const OFFER='Is it near the landing site?';
const B2={preferences:{...defaultPreferences(),level:'B2'}};
test('K4 case 6: B2-C2 only - the opening offers a line, held off the session until found or handed over; a bad offer falls back to the quiz answer',async()=>{
 const L=lineMod();
 let c=await roomStart(B2,{...ROVER_OPENING,offer:OFFER});
 assert.equal(requests[0].schema.properties.offer.maxLength,80);assert(requests[0].schema.required.includes('offer'));assert.match(prompts[0].task,/offer: one line/);
 assert.deepEqual(c.line,{source:'offer'});assert.equal(L.heldLine(c.id).text,OFFER);assert.equal(L.heldLine(c.id).key,'near the landing site');
 assert(!JSON.stringify(getSession()).includes(OFFER)&&!/landing site/i.test(JSON.stringify(getSession())),'absent from the whole session');
 for(const ui of [{},{menu:true}]){const v=view().lingaView(getSession(),ui);assert(!JSON.stringify(v).includes('landing site'));}
 await reply('I am looking for the rover.');assert(!JSON.stringify(getSession()).includes(OFFER),'still absent after a turn');assert.equal(prompts[1].roomLine.phrase,OFFER);
 await reply('Is the rover near the landing site?');
 assert.equal(getSession().conversation.line.found,'Is the rover near the landing site?');assert(JSON.stringify(getSession()).includes(OFFER),'found: now it may show');
 // handed over: absent until the recap
 c=await roomStart(B2,{...ROVER_OPENING,offer:OFFER});await reply('I am looking for the rover.');
 assert(!JSON.stringify(getSession()).includes(OFFER));await command('finish');assert.equal(getSession().conversation.line.text,OFFER);
 // dropped: too long, about the learner, in the cue, or refused by the audience gate - the quiz answer instead
 for(const bad of ['x'.repeat(30)+' landing site '+'y'.repeat(40),'You are a brave explorer.','Which way should I go?','Shall we celebrate with a beer at the landing site?']){
  c=await roomStart(B2,{...ROVER_OPENING,offer:bad});assert.deepEqual(c.line,{source:'quiz'},bad);assert.equal(L.heldLine(c.id).text,BRIDGE);
 }
 c=await roomStart(B2,ROVER_OPENING);assert.deepEqual(c.line,{source:'quiz'},'no offer given');
 // below B2 the opening is never asked
 c=await roomStart({},{...ROVER_OPENING,offer:OFFER});assert.equal(requests[0].schema.properties.offer,undefined);assert.doesNotMatch(prompts[0].task,/offer:/);assert.deepEqual(c.line,{source:'quiz'});
});
test('K4 case 7: a restart loses the line - no invitation, no find, and the recap falls back to today\'s',async()=>{
 const c=await roomStart();lineMod().forgetLine(c.id);
 await reply('Which bridge do you mean?');assert.equal(prompts[1].roomLine,undefined);assert.equal(getSession().conversation.line.found,undefined);
 await command('finish');assert.equal(getSession().conversation.line,null);
 const v=view().lingaView(getSession(),{});assert.equal(v.hero.kind,'track');assert.equal(v.hero.sentence,undefined);assert.equal(getLearner('ema').english.taught.length,0);
});
test('K4 case 8: a fix moment keeps the recap\'s moment slot over a found line; the line goes on the phone; a word moment does not',()=>{
 const V=view(),turns=[...REPLIED,{id:'l2',role:'learner',text:BRIDGE,mode:'speech'},{id:'p3',role:'partner',text:'The red one.'}];
 const found={source:'quiz',found:BRIDGE,foundTurn:'l2',text:BRIDGE};
 const fix={id:'m1',kind:'fix',said:'I am work in hotel',better:'I work in a hotel',why:'Work is the verb.',turnId:'l1',at:1};
 let v=V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),conversation:convo({phase:'finished',turns,moments:[fix],line:found})})),{});
 assert.equal(v.hero.kind,'comparison');assert.equal(v.hero.before.quote,fix.said);assert(v.details.some(d=>d.includes(BRIDGE)),'the line is still the learner\'s, on the phone');
 v=V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),conversation:convo({phase:'finished',turns,moments:[{...fix,kind:'word',said:'most',better:'bridge'}],line:found})})),{});
 assert.equal(v.title,'You found it');assert.equal(v.hero.before.quote,BRIDGE);
 const phone=fs.readFileSync(path.join(root,'src/english/LingaPhone.tsx'),'utf8');assert.doesNotMatch(phone,/data-role="linga-line"/,'the phone draws no recap (TL-12)');
});

// ---- T10: the tutor's calls run with thinking off, and only they do ----
test('thinking case 1: opening, turn, coach and replay ask for thinking off; the level check and its plan do not',async()=>{
 const seen=[];
 const partner=()=>({reply:'Which dates did you book?',observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'',meaning:'',starter:''}});
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
 // and the evening's memory note (M4, 2026-10-09): a few plain sentences from counts, as the TV's recap also asks for it, held to nothing by the phone's End session.
 assert.deepEqual(callers,['src/lib/desk/items.ts','src/lib/desk/memory.ts','src/lib/desk/worked.ts','src/lib/english/conversation.ts']);
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
 assert.doesNotMatch(phoneSrc,/practiceLine\(/,"the map is the TV's (TL-12)");
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
 assert.equal(V.lingaView(s).answer,null,'TL-12: the TV leads, so on home the phone is not asked; Carry on on the TV resumes the check');
 const a=V.lingaView(sessionOf(fixture('linga-check',{check:checkOf()}))).answer;assert.equal(a.action,'check-answer');assert.equal(a.lastTurnId,'q1');
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
test('pitch case 5 (TL-12): the TV offers Pitch a scene in Adult mode only, as a words hand-off; the phone takes the text; the TV marks a pitched card as the learner own',()=>{
 const V=view(),adultPrefs={...defaultPreferences({type:'other'}),adultConfirmed:true};
 const asJakub=(fx)=>{const s=sessionOf(fx);return {...s,learner:{...s.learner,id:'jakub',name:'Jakub'}};};
 const askOf=(s,kind,screen)=>({...s,ask:{id:'a1',kind,learner:'jakub',screen,at:0,phase:'open'}});
 const home=asJakub(fixture('linga-scenes',{placement:placed(),preferences:adultPrefs,pitches:[pitchTopic()]}));
 const pitch=V.lingaView(home).actions.find(a=>a.id==='ask-pitch');
 assert(pitch,'Adult mode: the TV offers a pitch');assert.deepEqual(pitch.run,{ask:{kind:'words'}},'it opens the words hand-off and runs no command');assert(!pitch.run.nav&&!pitch.run.command);
 assert(V.VIEW_ACTION_IDS.includes('ask-pitch')&&V.VIEW_ACTION_IDS.includes('pitch-scene'));
 const offered=V.lingaView(askOf(home,'words','linga-scenes')).phone.find(a=>a.id==='pitch-scene');
 assert(offered,'with the words hand-off open the phone takes the pitch');assert.equal(offered.run.command.action,'pitch');assert.equal(offered.needs,'text');
 assert(!V.lingaView(home).phone.some(a=>a.id==='pitch-scene'),'no hand-off open: the phone offers nothing');
 assert(!V.lingaView(sessionOf(fixture('linga-scenes',{placement:placed()}))).actions.some(a=>a.id==='ask-pitch'),'Family: no pitch');
 assert(!V.lingaView(asJakub(fixture('linga-scenes',{placement:placed(),preferences:{...adultPrefs,adultConfirmed:false}}))).actions.some(a=>a.id==='ask-pitch'),'"other" unconfirmed is Family');
 assert(!V.lingaView(askOf(asJakub(fixture('linga-talk',{placement:placed(),preferences:adultPrefs,conversation:convo({learnerId:'jakub'})})),'words','linga-talk')).phone.some(a=>a.id==='pitch-scene'),'not over a live scene');
 const scenes=asJakub(fixture('linga-scenes',{placement:placed(),preferences:adultPrefs,pitches:[pitchTopic()]}));
 const first=V.lingaView(scenes,{sceneIndex:0});
 assert.equal(first.title,'The dragon at the bank','no plan: the pitched scene leads the list');assert.equal(first.hero.own,true);
 assert.match(V.viewText(first),/Your own scene/);
 const authored=V.lingaView(scenes,{sceneIndex:1});assert.equal(authored.hero.own,undefined,'an authored situation is not marked');
 assert.match(fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8'),/h\.own\?"Your own scene · ":""/,'the TV card draws the mark');
});

// ---- v2 L3: Cut and three notes (lib/english/notes.ts cleanNotes; turn.ts "cut")
const NOTES=()=>require(path.join(root,'src/lib/english/notes.ts'));
const TAKE=[{id:'p1',role:'partner',text:'Welcome to the bank. How can I help you today?'},{id:'l1',role:'learner',text:'Yesterday I go to the shop. My dragon want a account.',mode:'text'},{id:'p2',role:'partner',text:'A dragon? Does your dragon have an address?'},{id:'l2',role:'learner',text:'He live in a cave, very cosy, very hot.',mode:'speech'},{id:'p3',role:'partner',text:'I see. Please sign here.'}];
const note=(patch={})=>({turnId:'l1',quote:'My dragon want a account',kind:'word',note:'Say an account before a vowel sound.',better:'My dragon wants an account',...patch});
test('notes case 1: a misquote is dropped, and so is a quote of a partner line',()=>{
 const {cleanNotes}=NOTES();
 assert.equal(cleanNotes([note({quote:'My dragon wants a account'})],TAKE).length,0,'not character for character');
 assert.equal(cleanNotes([note({quote:'He live in a cave'})],TAKE).length,0,'words of another learner turn under this turnId');
 assert.equal(cleanNotes([note({turnId:'p2',quote:'Does your dragon have an address'})],TAKE).length,0,'a partner line is never quoted back as the learner\'s');
 assert.equal(cleanNotes([note({turnId:'p3',quote:'Please sign here'}),note({turnId:'nope'})],TAKE).length,0,'a partner turn or an unknown turn');
 assert.equal(cleanNotes([note({quote:''}),note({quote:'   '})],TAKE).length,0,'an empty quote');
 assert.equal(cleanNotes([note({kind:'grammar'}),note({note:''}),note({note:'Good. Now try the article.'})],TAKE).length,0,'an unknown kind, no note, two sentences');
 const [kept]=cleanNotes([note()],TAKE);
 assert.deepEqual(kept,{turnId:'l1',quote:'My dragon want a account',kind:'word',note:'Say an account before a vowel sound.',better:'My dragon wants an account'});
 assert.deepEqual(cleanNotes({notes:[note()]},TAKE),[kept],'the shaped answer { notes } is read too');
 assert.deepEqual(cleanNotes('junk',TAKE),[]);assert.deepEqual(cleanNotes(undefined,TAKE),[]);
});
test('notes case 2: a fourth note is dropped, and so is a duplicate quote (notes do not pile on one slip)',()=>{
 const {cleanNotes,NOTES_MAX}=NOTES();
 assert.equal(NOTES_MAX,3);
 const four=[note(),note({turnId:'l2',quote:'He live in a cave',kind:'meaning',note:'Lives, with an s, for one dragon.'}),note({quote:'Yesterday I go',kind:'register',note:'Fine at a bank counter.'}),note({turnId:'l2',quote:'very hot',kind:'word',note:'Cosy and hot is a nice pair.'})];
 assert.deepEqual(cleanNotes(four,TAKE).map(n=>n.quote),['My dragon want a account','He live in a cave','Yesterday I go'],'the fourth is dropped');
 const twice=[note(),note({kind:'meaning',note:'The same slip again.'}),note({quote:'my dragon want a account',note:'And again, in lower case.'})];
 assert.equal(cleanNotes(twice,TAKE).length,1,'the same quote twice, or in another case, is one note');
 assert.equal(cleanNotes([note({quote:'nothing like it'}),note(),note({quote:'My dragon want a account',note:'Again.'})],TAKE).length,1,'a dropped note does not take a quote');
});
test('notes case 3: a "form" note stays form only where the tense rule finds a conflict; otherwise it is meaning, labelled a reading',()=>{
 const {cleanNotes,sentenceWith}=NOTES(),{resolveEnglish}=require(path.join(root,'src/lib/rules/english.ts'));
 assert.equal(sentenceWith(TAKE[1].text,'Yesterday I go'),'Yesterday I go to the shop.');
 assert.notEqual(resolveEnglish('Yesterday I go to the shop.').conflict,null,'the fixture: the rule sees go against yesterday');
 assert.equal(resolveEnglish('My dragon want a account.').conflict,null,'the fixture: no tense conflict here');
 const [ruled]=cleanNotes([note({quote:'Yesterday I go',kind:'form',note:'Yesterday asks for went.',better:'Yesterday I went'})],TAKE);
 assert.equal(ruled.kind,'form');assert.equal(ruled.reading,undefined);
 const [read]=cleanNotes([note({kind:'form',note:'Wants, for one dragon.'})],TAKE);
 assert.equal(read.kind,'meaning','no rule conflict: not form');assert.equal(read.reading,true,'and labelled a reading');
 const [crossing]=cleanNotes([note({quote:'shop. My dragon',kind:'form',note:'Two sentences run together.'})],TAKE);
 assert.equal(crossing.kind,'form','a quote across a sentence end is read against the whole turn, where yesterday clashes');
});
test('cut case 1: turnState and accepts for "cut" in every state - Adult mode, a reply of the learner\'s, the learner\'s turn, the quiz or a pause',()=>{
 const T=turn();
 assert(T.TURN_ACTIONS.includes('cut'));
 const want={finished:false,preparing:false,waiting:false,unprepared:false,moment:false,paused:true,coaching:false,quiz:true,'your-turn':true};
 for(const [name,[,c]] of Object.entries(TURN_STATES)){
  assert.equal(T.turnState(c),name);
  assert.equal(T.accepts(c,'cut','adult'),want[name],`adult · ${name}`);
  assert.equal(T.ACCEPTS[name].includes('cut'),want[name],`the table · ${name}`);
 }
 for(const [name,c] of [['your-turn, no reply yet',convo()],['quiz, no reply yet',convo({quizOpen:true})],['paused, no reply yet',convo({paused:true})]]){
  assert.equal(T.accepts(c,'cut','adult'),false,name);assert.match(T.refusal(c,'cut','adult'),/Say a line in the scene first/,name);
 }
});
test('cut case 2: Family mode refuses "cut" in every state, and so does a caller that names no mode',()=>{
 const T=turn();
 for(const [name,[,c]] of Object.entries(TURN_STATES)){
  assert.equal(T.accepts(c,'cut','family'),false,`family · ${name}`);assert.equal(T.accepts(c,'cut'),false,`no mode · ${name}`);
  assert.equal(T.refusal(c,'cut','family'),'Cut is part of Adult mode.');
 }
 for(const a of CONVERSATION_ACTIONS)for(const [name,[,c]] of Object.entries(TURN_STATES))assert.equal(T.accepts(c,a,'adult'),T.accepts(c,a),`the mode changes no other action: ${a} · ${name}`);
});
/** The adult at the desk in a booking scene with two replies of his own; `cutAnswer` is what the Cut call returns. */
async function adultTake(cutAnswer){
 await adultAtDesk();
 const calls=[];answer=async req=>{const p=JSON.parse(req.prompt);calls.push({task:(p.task??'').slice(0,4),thinking:req.thinking,prompt:p});
  if(/^Cut:/.test(p.task??''))return cutAnswer(p);
  if(p.submittedReply)return {json:{reply:'Of course. Which date was it?',observations:[]},provider:'test',ms:1};
  return {json:{title:'A practice booking',goal:'Ask for help with a booking.',opening:'Hello. How can I help?'},provider:'test',ms:1};};
 await command('start',{sceneId:'booking',replace:true});
 for(const text of ['Yesterday I book a room here.','I want check the date please.'])await command('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 return calls;
}
const GOOD_NOTES=p=>{const [a,b]=p.learnerTurns;return {json:{notes:[
 {turnId:a.turnId,quote:'Yesterday I book',kind:'form',note:'Yesterday asks for the past: booked.',better:'Yesterday I booked'},
 {turnId:b.turnId,quote:'I want check',kind:'form',note:'Say want to before another verb.',better:'I want to check'},
 {turnId:b.turnId,quote:'Which date was it',kind:'meaning',note:'Not your words.',better:''},
 {turnId:a.turnId,quote:'a room hear',kind:'word',note:'A misquote.',better:''}]},provider:'test',ms:1};};
test('cut case 3: Cut in Adult mode asks once over the learner\'s lines, keeps the notes that quote them, and ends the take as finish does',async()=>{
 const calls=await adultTake(GOOD_NOTES);
 const before=getLearner('jakub').english,c0=getSession().conversation;
 await command('cut');
 const c=getSession().conversation,after=getLearner('jakub').english,cut=calls.filter(x=>x.task==='Cut:');
 assert.equal(cut.length,1,'one call');assert.equal(cut[0].thinking,false,'fast, thinking off');
 assert.deepEqual(cut[0].prompt.learnerTurns.map(x=>x.text),['Yesterday I book a room here.','I want check the date please.'],'the learner\'s turns only, never the partner\'s');
 assert.equal(c.phase,'finished');assert.equal(getSession().screen,'linga-recap');
 assert.deepEqual(c.cut.notes.map(n=>[n.quote,n.kind,n.reading??false]),[['Yesterday I book','form',false],['I want check','meaning',true]],'the partner quote and the misquote are dropped; a form note without a tense conflict is a reading');
 assert(c.cut.notes.every(n=>c0.turns.some(t=>t.id===n.turnId&&t.role==='learner')),'each note keeps the turnId it quotes (Take Two forks from it)');
 assert.equal(after.sessions.filter(x=>x.id===c.id).length,1,'the session is recorded, as finish records it');
 assert.deepEqual(after.evidence,before.evidence,'notes never write evidence');assert.deepEqual(after.achievements,before.achievements,'nor move a skill');
 await assert.rejects(command('cut'),e=>e.status===409,'a finished take takes no second Cut');
});
test('cut case 4: a failed or empty Cut makes up no note; the take stays as it was with the error line, and Cut can be pressed again',async()=>{
 await adultTake(async()=>{throw new Error('engine down');});
 const turns=getSession().conversation.turns.length;
 await assert.rejects(command('cut'));
 let c=getSession().conversation;
 assert.equal(c.phase,'conversation');assert.equal(c.pending,null);assert.equal(c.turns.length,turns);assert.equal(c.cut,undefined);
 assert.match(c.error,/could not give notes on this take/);assert.equal(getLearner('jakub').english.sessions.some(x=>x.id===c.id),false,'nothing recorded');
 answer=async req=>({json:{notes:[{turnId:'nope',quote:'invented',kind:'word',note:'Made up.',better:''}]},provider:'test',ms:1});
 await assert.rejects(command('cut'),e=>e.kind==='shape'&&e.status===undefined,'an unusable answer is a model failure (shape), never a learner refusal');
 c=getSession().conversation;assert.equal(c.phase,'conversation');assert.equal(c.cut,undefined,'no note survived, so none is shown');
 assert(turn().accepts(c,'cut','adult'),'Cut is offered again');
 answer=async req=>GOOD_NOTES(JSON.parse(req.prompt));await command('cut');
 assert.equal(getSession().conversation.cut.notes.length,2);
});
test("taxonomy: a Linga model failure carries failure and retry like the desk jobs; a cut-off or refusal is not offered again",async()=>{
 const {EngineError}=require(path.join(root,'src/lib/engines/types.ts'));
 const {LINGA_NOT_AGAIN}=require(path.join(root,'src/lib/english/errors.ts'));
 const {POST}=require(path.join(root,'src/app/api/english/route.ts'));
 const post=async(action,extra={})=>{const s=getSession();const r=await POST(new Request('http://desk/api/english',{method:'POST',body:JSON.stringify({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:'tx-'+(++counter),...extra})}));return {status:r.status,body:await r.json()};};
 for(const [kind,retry] of [['cutoff',false],['declined',false],['timeout',true],['shape',true]]){
  fresh();answer=async()=>{throw new EngineError(kind,'stub','x');};
  const r=await post('start',{sceneId:'booking'});
  assert.equal(r.status,502,kind);assert.equal(r.body.failure,kind);assert.equal(r.body.retry,retry,kind);
  const line=getSession().conversation.error;
  if(retry){assert.notEqual(r.body.error,LINGA_NOT_AGAIN,kind);assert.equal(line,'The scene could not be prepared. Try again or choose another situation.',kind+': its own line, as before');}
  else{assert.equal(r.body.error,LINGA_NOT_AGAIN,kind);assert.equal(line,LINGA_NOT_AGAIN,kind+': the session line says so too');}
 }
 fresh();answer=async()=>{throw new Error('boom');};
 const u=await post('start',{sceneId:'booking'});
 assert.deepEqual([u.status,u.body.failure,u.body.retry],[502,'unknown',true]);assert.match(u.body.error,/please retry/);
 fresh();const refusal=await post('start',{sceneId:'date'});
 assert.equal(refusal.status,403,'a refusal stays a 4xx with no failure value');assert.equal(refusal.body.failure,undefined);
});
test('cut case 5: Family mode refuses Cut on the server with a plain reason and no model call',async()=>{
 fresh();await command('start',{sceneId:'booking'});
 answer=async()=>({json:{reply:'Of course. Which date?',observations:[]},provider:'test',ms:1});
 await command('turn',{text:'Could you help?',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 assert(turn().accepts(getSession().conversation,'cut','adult'),'the same take would take Cut in Adult mode');
 let calls=0;answer=async()=>{calls++;throw new Error('no call expected');};
 await assert.rejects(command('cut'),e=>e.status===403&&e.message==='Cut is part of Adult mode.');
 assert.equal(calls,0);assert.equal(getSession().conversation.phase,'conversation');
});
test('cut case 6: the view offers Cut in Adult mode only, and the Cut recap is a tape: up to three pins, one caption, one sentence each',()=>{
 const V=view(),adultPrefs={...defaultPreferences({type:'other'}),adultConfirmed:true};
 const asJakub=(fx)=>{const s=sessionOf(fx);return {...s,learner:{...s.learner,id:'jakub',name:'Jakub'}};};
 assert(V.VIEW_ACTION_IDS.includes('cut')&&V.VIEW_ACTION_IDS.includes('note'));
 for(const [name,[screen,c]] of Object.entries(TURN_STATES))for(const ui of [{},{menu:true}])
  assert(!V.offeredActions(V.lingaView(sessionOf(fixture(screen,{placement:placed(),conversation:c})),ui)).some(a=>a.id==='cut'),`Family · ${name}: no Cut`);
 const talk=V.lingaView(asJakub(fixture('linga-talk',{placement:placed(),preferences:adultPrefs,conversation:convo({learnerId:'jakub',turns:REPLIED})})));
 const tvCut=talk.actions.find(a=>a.id==='cut');assert(tvCut&&!tvCut.disabled,'Adult · your turn: Cut on the TV row');assert.equal(tvCut.run.command.action,'cut');
 assert(!V.lingaView(asJakub(fixture('linga-talk',{placement:placed(),preferences:adultPrefs,conversation:convo({learnerId:'jakub'})}))).actions.some(a=>a.id==='cut'),'no line of the learner\'s yet: no Cut');
 const pausedCut=V.lingaView(asJakub(fixture('linga-talk',{placement:placed(),preferences:adultPrefs,conversation:convo({learnerId:'jakub',turns:REPLIED,paused:true})}))).actions.find(a=>a.id==='cut');
 assert(pausedCut&&!pausedCut.disabled,'Adult · paused: Cut');
 const notes=[{turnId:'l1',quote:'I am work',kind:'form',note:'Say I work, with no am.',better:'I work'},{turnId:'l1',quote:'in hotel',kind:'word',note:'Say in a hotel.',better:'in a hotel'},{turnId:'l1',quote:'work in hotel',kind:'meaning',note:'Clear enough to be understood.',reading:true}];
 const recap=asJakub(fixture('linga-recap',{placement:placed(),preferences:adultPrefs,conversation:convo({learnerId:'jakub',turns:REPLIED,phase:'finished',cut:{at:1,notes}})}));
 const v=V.lingaView(recap);
 assert.equal(v.hero.kind,'tape');assert.equal(v.hero.pins.length,3);
 assert.deepEqual(v.hero.pins.map(x=>x.label),['Form','Word','A reading']);
 assert.equal(v.baseCaption,'Say I work, with no am.','the caption slot holds one note: the first, at rest');assert.equal(v.captionTag,'Form');
 assert.deepEqual(v.actions.map(a=>a.id),['note','note','note','take-two','take-two','take-two','choose-situation','learning-map']);
 const second=V.lingaView({...recap,focus:1});assert.equal(second.caption,'Say in a hotel.');assert.equal(second.captionTag,'Word');assert.equal(second.hero.selected,1);
 for(const n of notes)assert(!/[.!?]\s+\S/.test(n.note),'one sentence per caption');
 assert.match(V.viewText(v),/pin 1 · Form: "I am work" → "I work"\n      note: Say I work, with no am\./);
 const tv=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.match(tv,/h\.kind==="topics"\|\|h\.kind==="tape"\?"plan"/,'the tape takes the row-of-doors layout');assert.match(tv,/data-role="linga-tape"/);
});

// ---- v2 L4: Take Two (lib/english/take.ts heldOf and forkOf; turn.ts "take-two" and "take-end")
const TAKES=()=>require(path.join(root,'src/lib/english/take.ts'));
const FORM={turnId:'l1',quote:'Yesterday I book',kind:'form',note:'Yesterday asks for the past.',better:'Yesterday I booked'};
const WORD={turnId:'l1',quote:'a account',kind:'word',note:'Say an before a vowel sound.',better:'an account'};
const MEANING={turnId:'l2',quote:'I want check',kind:'meaning',note:'Say want to before another verb.',better:'I want to check',reading:true};
const REGISTER={turnId:'l2',quote:'Give me the key',kind:'register',note:'Too blunt for a hotel desk.',better:'Could I have the key, please?'};
/** [why, note, the learner's line in the take, the noted turn's text (form notes), heldOf's answer] */
const HELD=[
 // form: the tense rule decides, on the sentences that carry the noted sentence's own time marker
 ['form · the past form now, with the same marker',FORM,'Yesterday I booked a room here.','Yesterday I book a room here.',true],
 ['form · the same clash again',FORM,'Yesterday I book a room here.','Yesterday I book a room here.',false],
 ['form · the better phrase parroted, and the clash still there in the next sentence',FORM,'Yesterday I booked a room, as you say. Yesterday I go to the bank.','Yesterday I book a room here.',false],
 ['form · another clash with the same marker (present perfect with yesterday)',FORM,'Yesterday I have booked a room.','Yesterday I book a room here.',false],
 ['form · an irregular past form',FORM,'Yesterday I went to the hotel and booked a room.','Yesterday I book a room here.',true],
 ['form · two sentences with the marker, both agree',FORM,'Yesterday I booked it. Yesterday I paid for it.','Yesterday I book a room here.',true],
 ['form · the marker in the middle of the sentence',{...FORM,quote:'We go',better:'We went'},'We went to the cinema last week.','We go to the cinema last week.',true],
 ['form · the marker in the middle, the clash again',{...FORM,quote:'We go',better:'We went'},'We go to the cinema last week.','We go to the cinema last week.',false],
 ['form · present perfect with yesterday, mended',{...FORM,quote:'has gone',better:'went'},'She went to Paris yesterday.','She has gone to Paris yesterday.',true],
 ['form · present perfect with yesterday, again',{...FORM,quote:'has gone',better:'went'},'She has gone to Paris yesterday.','She has gone to Paris yesterday.',false],
 ['form · since asks for the present perfect, and gets it',{...FORM,quote:'I live',better:'I have lived'},'I have lived here since 2019.','I live here since 2019.',true],
 ['form · since, and the present simple again',{...FORM,quote:'I live',better:'I have lived'},'I live here since 2019.','I live here since 2019.',false],
 ['form · no sentence carries the marker: code cannot tell which one is the line again',FORM,'I booked a room here.','Yesterday I book a room here.',null],
 ['form · another marker is not the noted one',FORM,'Last week I book a room.','Yesterday I book a room here.',null],
 ['form · the marker, but no verb form the rule reads',FORM,'Yesterday, the room.','Yesterday I book a room here.',null],
 ['form · "every" is not the marker "ever"',{...FORM,quote:'Have you ever see',better:'Have you ever seen'},'Every day I see it.','Have you ever see a dragon?',null],
 ['form · a noted sentence with no clash is no rule to hold',{...FORM,quote:'I like',better:'I love'},'I love tea.','I like tea.',null],
 ['form · an empty line',FORM,'   ','Yesterday I book a room here.',null],
 // word: the quoted words gone and the better phrase said
 ['word · the better words, the quote gone',WORD,'My dragon wants an account.',undefined,true],
 ['word · the better words in capitals and with punctuation',WORD,'AN ACCOUNT, for my dragon!',undefined,true],
 ['word · the quote again',WORD,'My dragon wants a account.',undefined,false],
 ['word · the better words said, and the quote too',WORD,'An account, please, not a account.',undefined,false],
 ['word · the quote gone, but the better words not said',WORD,'My dragon wants a bank account.',undefined,null],
 ['word · no better phrase on the note',{...WORD,better:undefined},'My dragon wants an account.',undefined,null],
 ['word · the better phrase says the quote: looked for outside it',{...WORD,quote:'account',better:'an account'},'He wants an account.',undefined,true],
 ['word · the better phrase says the quote, and the bare quote is said again outside it',{...WORD,quote:'account',better:'an account'},'He wants an account, and one more account.',undefined,false],
 ['word · the bare quote, the better phrase not said',{...WORD,quote:'account',better:'an account'},'He wants account.',undefined,false],
 ['word · a missing article mended',{...WORD,quote:'in hotel',better:'in a hotel'},'I work in a hotel.',undefined,true],
 ['word · the missing article again',{...WORD,quote:'in hotel',better:'in a hotel'},'I work in hotel.',undefined,false],
 ['word · something else said: code cannot tell',{...WORD,quote:'in hotel',better:'in a hotel'},'I work at the station.',undefined,null],
 ['word · an own-language word gone, the English said',{...WORD,quote:'Bahnhof',better:'station'},'Where is the station?',undefined,true],
 ['word · the own-language word again',{...WORD,quote:'Bahnhof',better:'station'},'Where is the Bahnhof?',undefined,false],
 // meaning (a reading too): the better phrase contained, else not decided
 ['meaning · the better phrase said',MEANING,'I want to check the date.',undefined,true],
 ['meaning · the better phrase in another case',MEANING,'i WANT to check, please',undefined,true],
 ['meaning · the same words again: no rule says it is wrong',MEANING,'I want check the date.',undefined,null],
 ['meaning · something else said',MEANING,'Can I see the date?',undefined,null],
 ['meaning · no better phrase on the note',{...MEANING,better:undefined},'I want to check the date.',undefined,null],
 ['meaning · a note that was never a reading',{...MEANING,quote:'He live in a cave',better:'He lives in a cave',reading:undefined},'He lives in a cave, very cosy.',undefined,true],
 // register: no rule reads register
 ['register · the better phrase said',REGISTER,'Could I have the key, please?',undefined,null],
 ['register · the same words again',REGISTER,'Give me the key.',undefined,null],
 ['register · no better phrase',{...REGISTER,better:undefined},'Could you give me the key?',undefined,null],
];
test(`take case 1: heldOf, the table (${HELD.length} rows): held, not held, or null where code cannot tell`,()=>{
 const {heldOf}=TAKES(),counts={};
 assert(HELD.length>=30,'at least 30 rows');
 for(const [why,n,line,noted,want] of HELD){
  assert.equal(heldOf(n,line,noted),want,why);
  const k=(counts[n.kind]??={held:0,'not held':0,null:0});k[want===true?'held':want===false?'not held':'null']++;
 }
 assert(HELD.filter(r=>r[4]===null).length>=8,'at least 8 null rows');
 for(const kind of ['form','word','meaning','register'])assert(counts[kind],`rows of kind ${kind}`);
 assert.equal(heldOf(FORM,'Yesterday I booked a room, as you say. Yesterday I go to the bank.','Yesterday I book a room here.'),false,'the parrot row: a form note is the rule\'s, never the phrase\'s');
 console.log('# heldOf table, per kind (held / not held / null):',Object.entries(counts).map(([k,c])=>`${k} ${c.held}/${c['not held']}/${c.null}`).join(', '));
});
test('take case 2: forkOf is the partner line nearest before the noted learner turn',()=>{
 const {forkOf}=TAKES();
 assert.equal(forkOf({...WORD,turnId:'l1'},TAKE).id,'p1');
 assert.equal(forkOf({...WORD,turnId:'l2'},TAKE).id,'p2');
 assert.equal(forkOf({...WORD,turnId:'p2'},TAKE),null,'a partner turn is no noted turn');
 assert.equal(forkOf({...WORD,turnId:'gone'},TAKE),null,'an unknown turn');
 assert.equal(forkOf({...WORD,turnId:'l1'},TAKE.slice(1)),null,'no partner line before it');
 const two=[TAKE[0],TAKE[1],{id:'l1b',role:'learner',text:'And a card.',mode:'text'}];
 assert.equal(forkOf({...WORD,turnId:'l1b'},two).id,'p1','two learner turns in a row: the partner line before both');
});
/** Fixtures for Take Two's place in the turn table: a finished take with a Cut, one with a take running, one waiting inside it. */
const CUT_NOTES=[{turnId:'l1',quote:'I am work',kind:'form',note:'Say I work, with no am.',better:'I work'},{turnId:'l1',quote:'in hotel',kind:'word',note:'Say in a hotel.',better:'in a hotel'}];
const RUNNING={note:0,from:'p1',turns:[{id:'p1:take',role:'partner',text:'Hello. How can I help?'}],held:null,at:2};
const TAKE_STATES={
 'finished, cut':convo({turns:REPLIED,phase:'finished',cut:{at:1,notes:CUT_NOTES}}),
 'take-two':convo({turns:REPLIED,phase:'finished',cut:{at:1,notes:CUT_NOTES},takes:[RUNNING]}),
 'waiting, in a take':convo({turns:REPLIED,phase:'finished',cut:{at:1,notes:CUT_NOTES},takes:[RUNNING],pending:'held'}),
 'paused, in a take (a reload pauses every conversation)':convo({turns:REPLIED,phase:'finished',cut:{at:1,notes:CUT_NOTES},takes:[RUNNING],paused:true}),
};
test('take case 3: turnState, accepts and refusal for "take-two" and "take-end" in every state',()=>{
 const T=turn();
 assert(T.TURN_ACTIONS.includes('take-two')&&T.TURN_ACTIONS.includes('take-end')&&T.TURN_STATES.includes('take-two'));
 assert(!T.TURN_ACTIONS.includes('take'),'its own name');
 assert.equal(T.turnState(TAKE_STATES['finished, cut']),'finished');
 assert.equal(T.turnState(TAKE_STATES['take-two']),'take-two');
 assert.equal(T.turnState(TAKE_STATES['waiting, in a take']),'waiting');
 assert.equal(T.turnState(TAKE_STATES['paused, in a take (a reload pauses every conversation)']),'take-two','a take is not paused');
 // the table: only a finished take starts one, only a running one ends one
 for(const state of T.TURN_STATES){
  assert.equal(T.ACCEPTS[state].includes('take-two'),state==='finished',`the table · take-two · ${state}`);
  assert.equal(T.ACCEPTS[state].includes('take-end'),state==='take-two',`the table · take-end · ${state}`);
 }
 assert.deepEqual([...T.ACCEPTS['take-two']].sort(),['capture','repeat','take-end','turn'],'inside a take: a line, the microphone, the audio again, and back to the notes');
 // every state of a live scene refuses both, in either mode, with a plain reason
 for(const [name,[,c]] of Object.entries(TURN_STATES))for(const mode of ['adult','family',undefined]){
  assert.equal(T.accepts(c,'take-two',mode,0),false,`take-two · ${name} · ${mode}`);assert.equal(T.accepts(c,'take-end',mode),false,`take-end · ${name} · ${mode}`);
  assert(T.refusal(c,'take-two',mode,0).length>10,`a reason · ${name}`);
 }
 assert.equal(T.refusal(TURN_STATES['your-turn'][1],'take-two','adult',0),'Take Two starts from a note at Cut.');
 assert.equal(T.refusal(TURN_STATES.finished[1],'take-two','adult',0),'Take Two starts from a note at Cut, and this take has none.','finished by Finish: no cut');
 assert.equal(T.refusal(TURN_STATES.waiting[1],'take-two','adult',0),'The partner is preparing a reply. You can cancel and return later.','a reply in flight');
 assert.equal(T.refusal(TURN_STATES['your-turn'][1],'take-end','adult'),'There is no take running.');
 // a finished take with its notes: Adult mode, a note of this take's that has not had its take
 const cut=TAKE_STATES['finished, cut'];
 assert.equal(T.accepts(cut,'take-two','adult',0),true);assert.equal(T.accepts(cut,'take-two','adult',1),true);
 for(const mode of ['family',undefined]){assert.equal(T.accepts(cut,'take-two',mode,0),false,`${mode}`);assert.equal(T.refusal(cut,'take-two',mode,0),'Take Two is part of Adult mode.');}
 for(const bad of [2,-1,0.5,undefined,'0']){assert.equal(T.accepts(cut,'take-two','adult',bad),false,`note ${bad}`);assert.equal(T.refusal(cut,'take-two','adult',bad),'Choose one of the notes on this take.');}
 const had=convo({turns:REPLIED,phase:'finished',cut:{at:1,notes:CUT_NOTES},takes:[{...RUNNING,endedAt:3}]});
 assert.equal(T.turnState(had),'finished','an ended take leaves the rehearsal finished');
 assert.equal(T.accepts(had,'take-two','adult',0),false);assert.equal(T.refusal(had,'take-two','adult',0),'This note has had its Take Two.');
 assert.equal(T.accepts(had,'take-two','adult',1),true,'another note still can');
 const orphan=convo({turns:[REPLIED[1],REPLIED[2]],phase:'finished',cut:{at:1,notes:CUT_NOTES}});
 assert.equal(T.accepts(orphan,'take-two','adult',0),false);assert.equal(T.refusal(orphan,'take-two','adult',0),'This note has no line of the scene to go back to.');
 // a take running: a second one is refused; inside it only its own four actions
 const run=TAKE_STATES['take-two'];
 assert.equal(T.accepts(run,'take-two','adult',1),false);assert.equal(T.refusal(run,'take-two','adult',1),'A take is already running. Finish it first.');
 for(const a of T.TURN_ACTIONS.filter(x=>x!=='take-two'))assert.equal(T.accepts(run,a,'adult'),['turn','capture','repeat','take-end'].includes(a),`inside a take · ${a}`);
 for(const a of ['cut','coach','replay','quiz','cue','pause','finish'])assert.equal(T.refusal(run,a,'adult'),'Say your line again on your phone, or go back to the notes.',a);
 const wait=TAKE_STATES['waiting, in a take'];
 assert.deepEqual(T.TURN_ACTIONS.filter(a=>T.accepts(wait,a,'adult',1)),['repeat','leave'],'a reply in flight inside a take: cancel it, or hear the line again');
 assert.equal(T.refusal(wait,'take-two','adult',1),'The partner is preparing a reply. You can cancel and return later.');
 // a spent take (both cast turns played): still take-two, and only Back to the notes and Repeat are taken
 const SPENT_TURNS=[{id:'p1:take',role:'partner',text:'Hello.'},{id:'s1',role:'learner',text:'Yesterday I booked it.',mode:'text'},{id:'s2',role:'partner',text:'Cast 1.'},{id:'s3',role:'learner',text:'Yes.',mode:'text'},{id:'s4',role:'partner',text:'Cast 2.'}];
 const spentC=convo({turns:REPLIED,phase:'finished',cut:{at:1,notes:CUT_NOTES},takes:[{...RUNNING,turns:SPENT_TURNS}]});
 assert.equal(T.turnState(spentC),'take-two','a spent take is still in the take');
 for(const a of T.TURN_ACTIONS.filter(x=>x!=='take-two'))assert.equal(T.accepts(spentC,a,'adult'),['repeat','take-end'].includes(a),`spent take · ${a}`);
 assert.equal(T.refusal(spentC,'turn','adult'),'That was the take. Go back to the notes.');assert.equal(T.refusal(spentC,'capture','adult'),'That was the take. Go back to the notes.');
 // the mode still changes no other action, with a take in the fixtures too
 for(const a of CONVERSATION_ACTIONS)for(const c of Object.values(TAKE_STATES))assert.equal(T.accepts(c,a,'adult'),T.accepts(c,a),`the mode changes no other action: ${a}`);
});
/** The adult's take with notes on both lines, cut; the stub answers the cast in a take as `Cast N.`; every call is listed. */
async function cutTake(){
 const calls=await adultTake(GOOD_NOTES);await command('cut');
 let cast=0;answer=async req=>{const p=JSON.parse(req.prompt);calls.push({task:(p.task??'').slice(0,4),thinking:req.thinking,prompt:p,schema:req.schema});
  if(/^Take Two:/.test(p.task??''))return {json:{reply:`Cast ${++cast}. And then?`,help:{simpler:'',meaning:'',starter:''}},provider:'test',ms:1};
  throw new Error('no other call expected');};
 return calls;
}
test('take case 4: one full stubbed run - a scene, Cut, Take Two on one note, the line again with no call, two cast turns, the end; nothing reaches the learner record',async()=>{
 const calls=await cutTake(),T=turn();
 const c0=getSession().conversation,english0=JSON.parse(JSON.stringify(getLearner('jakub').english)),turns0=JSON.parse(JSON.stringify(c0.turns)),cut0=JSON.parse(JSON.stringify(c0.cut));
 const evidence0=JSON.parse(JSON.stringify(c0.evidence)),before=calls.length;
 assert.equal(c0.phase,'finished');assert.equal(getSession().screen,'linga-recap');assert.equal(c0.cut.notes[0].quote,'Yesterday I book');
 // Take Two on the first note: the partner line before the noted turn, its stored text, no call, the audio again
 await command('take-two',{note:0});
 let c=getSession().conversation;const fork=c0.turns[c0.turns.findIndex(t=>t.id===c0.cut.notes[0].turnId)-1];
 assert.equal(calls.length,before,'the line again is no model call');
 assert.equal(getSession().screen,'linga-talk');assert.equal(T.turnState(c),'take-two');
 assert.equal(c.takes.length,1);assert.equal(c.takes[0].from,fork.id);assert.equal(c.takes[0].note,0);assert.equal(c.takes[0].held,null);
 assert.deepEqual(c.takes[0].turns.map(t=>[t.role,t.text]),[['partner',fork.text]],'the stored text, word for word');
 assert.equal(fork.text,'Hello. How can I help?');assert.equal(c.audioNonce,c0.audioNonce+1,'the audio, by a new nonce');
 // the learner says the line again, the cast answers; then a second line and a second cast turn, and the take ends
 await command('turn',{text:'Yesterday I booked a room here.',mode:'speech',lastTurnId:c.takes[0].turns.at(-1).id});
 c=getSession().conversation;assert.equal(T.turnState(c),'take-two');assert.equal(getSession().screen,'linga-talk');
 assert.equal(c.takes[0].held,true,'the form note held: the past form with yesterday');
 await assert.rejects(command('turn',{text:'Late.',mode:'text',lastTurnId:fork.id}),e=>e.status===409,'a line answered to an older line');
 await command('turn',{text:'Yesterday I go there, I think.',mode:'text',lastTurnId:c.takes[0].turns.at(-1).id});
 c=getSession().conversation;
 assert.deepEqual(c.takes[0].turns.map(t=>[t.role,t.text]),[['partner',fork.text],['learner','Yesterday I booked a room here.'],['partner','Cast 1. And then?'],['learner','Yesterday I go there, I think.'],['partner','Cast 2. And then?']]);
 assert.equal(c.takes[0].held,true,'held is decided on the first line of the take');
 assert.equal(c.takes[0].endedAt,undefined,'two cast turns: the take is spent but does not end by itself');
 assert.equal(T.turnState(c),'take-two');assert.equal(getSession().screen,'linga-talk');
 const spentView=view().lingaView(getSession());
 assert.equal(spentView.spoken.line,'Cast 2. And then?');assert.equal(spentView.spoken.blocked,false);assert.equal(spentView.audible,true,'the last cast line is heard');
 const take=calls.slice(before);
 await assert.rejects(command('turn',{text:'More.',mode:'text',lastTurnId:c.takes[0].turns.at(-1).id}),e=>e.status===409&&e.message==='That was the take. Go back to the notes.');
 await assert.rejects(command('capture',{active:true}),e=>e.status===409&&e.message==='That was the take. Go back to the notes.');
 assert.equal(calls.length,before+2,'a third turn makes no call');
 await command('repeat');assert.equal(getSession().conversation.audioNonce,c.audioNonce+1,'repeat bumps the nonce');
 await command('take-end');c=getSession().conversation;
 assert.equal(typeof c.takes[0].endedAt,'number','Back to the notes ends the spent take');
 assert.equal(T.turnState(c),'finished');assert.equal(getSession().screen,'linga-recap');assert.equal(calls.length,before+2);
 assert.equal(take.length,2,'two calls: one per cast turn');assert(take.length<=3,'at most 3 calls');
 for(const x of take){assert.equal(x.thinking,false,'fast, thinking off');assert.equal(x.task,'Take');assert.equal(x.prompt.bringBack,undefined,'no taught phrase invited');assert.deepEqual(Object.keys(x.schema.properties).sort(),['help','reply'],'the replay schema: no observations, no moment');}
 assert.deepEqual(take[0].prompt.transcript.map(t=>t.text),[fork.text],"the scene up to the fork, the fork line once (UD-17), the learner's line only as submittedReply; the first take's noted line is not in it");
 // never evidence, and the first take is as it was
 assert.deepEqual(getLearner('jakub').english,english0,"the learner record's english is deep-equal before and after");
 assert.deepEqual(c.turns,turns0,"the first take's turns are unchanged");assert.deepEqual(c.cut,cut0,'and its notes');
 assert.deepEqual(c.evidence,evidence0,'no evidence on the conversation either');
 // at most one take per note; another note still can, and Back to the notes ends it early with no call
 await assert.rejects(command('take-two',{note:0}),e=>e.status===409&&e.message==='This note has had its Take Two.');
 await command('take-two',{note:1});c=getSession().conversation;
 assert.equal(c.takes[1].from,c0.turns[c0.turns.findIndex(t=>t.id===c0.cut.notes[1].turnId)-1].id,'the second note forks at the partner line before its own turn');
 await command('take-end');c=getSession().conversation;
 assert.equal(typeof c.takes[1].endedAt,'number');assert.equal(c.takes[1].held,null,'ended before the line again: not decided');
 assert.equal(getSession().screen,'linga-recap');assert.equal(calls.length,before+2,'no call to start or end a take');
 assert.deepEqual(getLearner('jakub').english,english0,'still nothing on the learner record');
 await assert.rejects(command('take-two',{note:2}),e=>e.status===409&&/Choose one of the notes/.test(e.message));
});
test('take case 9: a spent take on the TV shows the last cast line, the spent caption and Back to the notes; the phone takes no reply',()=>{
 const V=view();
 const spentTake={note:1,from:'p1',turns:[{id:'p1:take',role:'partner',text:'Hello.'},{id:'s1',role:'learner',text:'I work in a hotel.',mode:'text'},{id:'s2',role:'partner',text:'Cast 1.'},{id:'s3',role:'learner',text:'Yes.',mode:'text'},{id:'s4',role:'partner',text:'Cast 2. And then?'}],held:true,at:2};
 const v=V.lingaView(takeView('linga-talk',{takes:[spentTake]}));
 assert.equal(v.hero.said,'Cast 2. And then?');assert.equal(v.captionTag,'Take done');assert.equal(v.caption,'That was the take. Go back to the notes when you are ready.');
 assert.deepEqual(v.actions.map(a=>[a.id,a.run.command?.action,!!a.disabled]),[['take-end','take-end',false]]);assert.equal(v.answer,null);
 assert.equal(v.spoken.line,'Cast 2. And then?');assert.equal(v.spoken.blocked,false);assert.equal(v.audible,true);
 const ids=V.offeredActions(v).map(a=>a.id);assert(ids.includes('take-end')&&ids.includes('repeat'),'Back to the notes and Repeat audio stay');
 for(const id of ['turn','capture','answer'])assert(!ids.includes(id),`no ${id}`);
 const sf=require(path.resolve(__dirname,'../uat/driver/surface.cjs')).surfaceOf(takeView('linga-talk',{takes:[spentTake]}));assert.deepEqual(sf.strays,[]);assert.deepEqual(sf.unrendered,[]);
});
test('take case 5: inside a take the server refuses Cut, the coach, the quiz, pause and finish; Leave cancels a reply in flight and keeps the take',async()=>{
 await cutTake();await command('take-two',{note:0});
 for(const action of ['cut','coach','quiz','cue','pause','finish','replay','resume'])
  await assert.rejects(command(action),e=>e.status===409&&e.message==='Say your line again on your phone, or go back to the notes.',action);
 let release;answer=()=>new Promise(r=>release=r);
 const take=getSession().conversation.takes[0];
 const inflight=command('turn',{text:'Yesterday I booked it.',mode:'text',lastTurnId:take.turns.at(-1).id,commandId:'held-take'});
 assert.equal(turn().turnState(getSession().conversation),'waiting');
 await assert.rejects(command('take-end'),e=>e.status===409,'not while the cast is answering');
 await command('leave');
 const c=getSession().conversation;
 assert.equal(c.pending,null);assert.equal(turn().turnState(c),'take-two','the take stays');assert.equal(getSession().screen,'linga-talk');
 release({json:{reply:'Too late.'},provider:'test',ms:1});
 await assert.rejects(inflight,e=>e.status===409);
 assert.deepEqual(getSession().conversation.takes[0].turns,take.turns,'the late reply is dropped');
});
/** The adult's recap after Cut, with `takes` on it, and the same take on the talk screen; as the view and the surface read them. */
const TAKE_NOTES=[{turnId:'l1',quote:'I am work',kind:'form',note:'Say I work, with no am.',better:'I work'},{turnId:'l1',quote:'in hotel',kind:'word',note:'Say in a hotel.',better:'in a hotel'},{turnId:'l1',quote:'work in hotel',kind:'meaning',note:'Clear enough to be understood.',reading:true}];
const ENDED=(note,held,again)=>({note,from:'p1',turns:[{id:`p1:take${note}`,role:'partner',text:'Hello. How can I help?'},...(again?[{id:`c1:t${note}`,role:'learner',text:again,mode:'text'},{id:`c1:r${note}`,role:'partner',text:'Nice. Which one?'}]:[])],held,at:2+note,endedAt:3+note});
function takeView(screen,patch,ui={},mode='adult'){
 const prefs={...defaultPreferences({type:'other'}),adultConfirmed:mode==='adult'};
 const s=sessionOf(fixture(screen,{placement:placed(),preferences:prefs,conversation:convo({learnerId:'jakub',turns:REPLIED,phase:'finished',cut:{at:1,notes:TAKE_NOTES},...patch})}));
 const at={...s,learner:{...s.learner,id:'jakub',name:'Jakub'},...ui};
 if(mode==='family')at.profiles=at.profiles.map(p=>p.id==='jakub'?{...p,mode:'family'}:p);
 return at;
}
test('take case 6: the recap marks each note that had its take - struck when held, open, or "Not decided" - and draws the take as a branch; no count',()=>{
 const V=view();
 const s=takeView('linga-recap',{takes:[ENDED(0,true,'I work in a hotel.'),ENDED(1,null,''),ENDED(2,false,'I work in hotel.')]});
 const v=V.lingaView(s);
 assert.equal(v.hero.kind,'tape');
 assert.deepEqual(v.hero.pins.map(x=>x.mark),['held','undecided','open']);
 assert.deepEqual(v.hero.branch,{pin:0,partner:'Robin · Receptionist',from:'Hello. How can I help?',again:'I work in a hotel.'},'at rest the first pin: its take, from the line it forked at');
 assert.deepEqual(V.lingaView({...s,focus:2}).hero.branch,{pin:2,partner:'Robin · Receptionist',from:'Hello. How can I help?',again:'I work in hotel.'},'the focused pin\'s take');
 assert.deepEqual(v.actions.map(a=>a.id),['note','note','note','take-two','take-two','take-two','choose-situation','learning-map'],'the TV row is the tape\'s, as before');
 const text=V.viewText(v);
 assert.match(text,/pin 1 · Form: "I am work" → "I work"\n      note: Say I work, with no am\.\n      Take Two: held, the quote struck through/);
 assert.match(text,/Take Two: not decided/);assert.match(text,/Take Two: still open/);
 assert.match(text,/Take Two of pin 1, a branch from it: Robin · Receptionist says "Hello. How can I help\?"; you again: "I work in a hotel\."/);
 assert.doesNotMatch(text,/\d+ (of|out of) \d+|held \d|\d+ held/,'no count of held notes anywhere');
 // a note with no take carries no mark, and with no take at all there is no branch
 const one=V.lingaView(takeView('linga-recap',{takes:[ENDED(1,true,'I work in a hotel.')]}));
 assert.deepEqual(one.hero.pins.map(x=>x.mark),[undefined,'held',undefined]);assert.equal(one.hero.branch.pin,1,'the latest take, when the focused pin has none');
 assert.equal(V.lingaView(takeView('linga-recap',{})).hero.branch,undefined);
 // the TV draws the mark and the branch; the phone draws no recap (TL-12)
 const S=require(path.resolve(__dirname,'../uat/driver/surface.cjs')),sf=S.surfaceOf(s);
 assert.match(sf.tv,/Not decided/);assert.match(sf.tv,/You again/);assert.match(sf.tv,/Take Two · Form/);assert.doesNotMatch(sf.phone,/Not decided/);
 assert.doesNotMatch(sf.shown,/\d+ (of|out of) \d+ (notes|held)/,'no count on either device');
 const tv=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.match(tv,/<s data-role="linga-struck">/);assert.match(tv,/data-role="linga-branch"/);
});
test('take case 7 (TL-12): the TV row offers Take Two per note in Adult mode, disabled with the refusal where refused, and the phone offers none; Family is offered none',()=>{
 const V=view(),S=require(path.resolve(__dirname,'../uat/driver/surface.cjs'));
 const s=takeView('linga-recap',{takes:[ENDED(0,true,'I work in a hotel.')]});
 const offers=V.lingaView(s).actions.filter(a=>a.id==='take-two');
 assert.deepEqual(offers.map(a=>[a.label,a.disabled,a.run.command]),[['Take Two · note 1',true,{action:'take-two',extra:{note:0}}],['Take Two · note 2',false,{action:'take-two',extra:{note:1}}],['Take Two · note 3',false,{action:'take-two',extra:{note:2}}]]);
 assert.equal(offers[0].help,'This note has had its Take Two.','the refusal, as the server says it');
 assert.equal(V.lingaView(s).phone.some(a=>a.id==='take-two'),false,'the phone offers no Take Two');
 const sf=S.surfaceOf(s);
 assert.deepEqual(sf.strays,[]);assert.deepEqual(sf.unrendered,[]);
 assert.deepEqual(sf.controls.filter(c=>c.side==='tv'&&c.label.includes('Take Two')).map(c=>[c.label.trim(),c.disabled]),[['Take Two · note 1',true],['Take Two · note 2',false],['Take Two · note 3',false]]);
 assert.deepEqual(sf.offered.filter(o=>o.id==='take-two').map(o=>o.run.command.extra.note),[1,2],'the enabled ones are offered to pick');
 // a take running elsewhere would make every note wait; Family mode is offered none
 assert(!V.offeredActions(V.lingaView(takeView('linga-recap',{},{},'family'))).some(a=>a.id==='take-two'),'Family: no Take Two');
 assert(!V.offeredActions(V.lingaView(takeView('linga-recap',{cut:undefined}))).some(a=>a.id==='take-two'),'finished by Finish: no notes, no Take Two');
});
test('take case 8: inside a take the TV shows the line again and Back to the notes, and nothing else of the scene is offered',()=>{
 const V=view(),S=require(path.resolve(__dirname,'../uat/driver/surface.cjs'));
 const running={note:1,from:'p1',turns:[{id:'p1:take',role:'partner',text:'Hello. How can I help?'}],held:null,at:2};
 const s=takeView('linga-talk',{takes:[running],audioNonce:1});
 const v=V.lingaView(s);
 assert.equal(v.tag,'Take Two');assert.equal(v.hero.kind,'scene');assert.equal(v.hero.take,true);
 assert.equal(v.hero.said,'Hello. How can I help?');assert.equal(v.hero.subtitle,'“in hotel”','the noted quote under the line');
 assert.equal(v.spoken.line,'Hello. How can I help?');assert.equal(v.spoken.blocked,false);assert.match(v.spoken.key,/p1:take:1$/,'a new key: the line plays again');
 assert.deepEqual(v.actions.map(a=>[a.id,a.run.command?.action,!!a.disabled]),[['take-end','take-end',false]]);
 assert.equal(v.answer.action,'turn');assert.equal(v.answer.lastTurnId,'p1:take','the reply box answers the take\'s line');
 const ids=V.offeredActions(v).map(a=>a.id);
 for(const id of ['cut','coach','quiz','cue','replay','finish','resume','pick-phrase'])assert(!ids.includes(id),`no ${id} inside a take`);
 const sf=S.surfaceOf(withReply(s));assert.deepEqual(sf.strays,[]);assert.deepEqual(sf.unrendered,[]);
 assert.match(sf.tv,/Take Two · A booking/);assert.match(sf.phone,/Hello. How can I help/,'the phone holds the line beside its reply box');
 // the cast answering: Cancel on the TV row, the take stays
 const wait=V.lingaView(takeView('linga-talk',{takes:[{...running,turns:[...running.turns,{id:'c1:x',role:'learner',text:'I work in a hotel.',mode:'text'}]}],pending:'held'}));
 assert.deepEqual(wait.actions.map(a=>[a.id,a.run.command?.action]),[['cancel','leave']]);assert.equal(wait.answer,null);
 const sw=S.surfaceOf(takeView('linga-talk',{takes:[{...running,turns:[...running.turns,{id:'c1:x',role:'learner',text:'I work in a hotel.',mode:'text'}]}],pending:'held'}));
 assert.deepEqual(sw.strays,[]);assert.deepEqual(sw.unrendered,[]);
});
test('LG-12: the tag Try it again ends with the first reply after a replay',async()=>{
 fresh();answerAll();
 await command('start',{sceneId:'booking',replace:true});
 await command('turn',{text:'I booked two nights.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 await command('coach');await command('replay');
 const V=view();
 assert.equal(getSession().conversation.phase,'replay');
 assert.equal(V.lingaView(getSession(),{}).tag,'Try it again');
 await command('turn',{text:'I booked three nights.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 assert.equal(getSession().conversation.phase,'conversation','LG-12: the first reply after a replay ends the replay');
 assert.equal(V.lingaView(getSession(),{}).tag,'Conversation','LG-12: the TV tag says Conversation again');
});

// ---- LG-20: the minor boundary on partner lines is code, not only the prompt (gate.ts partnerLine)
const {REDIRECT_LINE,partnerLine}=require(path.join(root,'src/lib/english/gate.ts'));
const DATING='Would you like to go on a date with me tonight?',NEVERLINE='Let me show you something nude and explicit.';
/** an engine that gives `line` as the opening and as every reply, with a help ladder written for that line */
function says(line){answer=async req=>({json:{title:'A booking',goal:'Fix a booking.',opening:line,reply:line,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'Say yes.',meaning:'a date: a romantic meeting',starter:'I would like to'},before:'I booked',after:'I booked two nights',note:'Clear.'},provider:'test',ms:1});}
const partnerSaid=()=>getSession().conversation.turns.filter(t=>t.role==='partner').map(t=>t.text);
test('LG-20: the redirect is one plain sentence, no em dash, and itself passes the gate',()=>{
 assert.doesNotMatch(REDIRECT_LINE,/—|–/);assert.equal(REDIRECT_LINE.split(/[.!?]/).filter(Boolean).length,1);
 assert.equal(partnerLine(REDIRECT_LINE,false),REDIRECT_LINE);
 assert.equal(partnerLine('a bar of chocolate',false),'a bar of chocolate');
 assert.equal(partnerLine('Which hotel is it?',false),'Which hotel is it?');
});
for(const [name,line] of [['dating',DATING],['never-list',NEVERLINE]]){
 test(`LG-20: a ${name} line to a 13-year-old is replaced at the opening, a turn and a replay, shown and stored as the redirect`,async()=>{
  fresh();getSession().profiles.find(p=>p.id==='ema').age=13;
  says(line);await command('start',{sceneId:'booking',replace:true});
  assert.deepEqual(partnerSaid(),[REDIRECT_LINE],'opening');assert.equal(getSession().conversation.help?.simpler,undefined,'no help written for the held line');
  await command('turn',{text:'I booked two nights.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
  assert.deepEqual(partnerSaid(),[REDIRECT_LINE,REDIRECT_LINE],'turn');assert.equal(getSession().conversation.phase,'conversation','the scene goes on');
  await command('coach');await command('replay');
  assert.deepEqual(partnerSaid(),[REDIRECT_LINE,REDIRECT_LINE,REDIRECT_LINE],'replay');
  assert(!JSON.stringify(getSession().conversation).includes(line),'the model text is stored nowhere on the conversation');
 });
}
// LG-56: at B1, so the band hold (A1-A2 only) leaves the lines as they came and this row pins the audience gate alone
test('LG-20: the same lines pass unchanged to an adult outside Family mode, and are held again in Family mode',async()=>{
 fresh();dispatch({type:'learner.set',id:'jakub'});dispatch({type:'subject',subject:'english'});
 await command('preferences',{preferences:{...defaultPreferences({type:'other'}),level:'B1',adultConfirmed:true},notes:[]});
 for(const line of [DATING,NEVERLINE]){
  says(line);await command('start',{sceneId:'booking',replace:true});
  await command('turn',{text:'I booked two nights.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
  await command('coach');await command('replay');
  assert.deepEqual(partnerSaid(),[line,line,line]);
 }
 getSession().profiles.find(p=>p.id==='jakub').mode='family';
 says(DATING);await command('start',{sceneId:'booking',replace:true});
 await command('turn',{text:'I booked two nights.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 assert.deepEqual(partnerSaid(),[REDIRECT_LINE,REDIRECT_LINE],'Family mode holds it at 18+');
});
test('LG-20: the Take Two cast line is held too when the desk went to Family mode after the take began',async()=>{
 const calls=await cutTake();
 await command('take-two',{note:0});
 answer=async()=>({json:{reply:DATING,help:{simpler:'',meaning:'',starter:''}},provider:'test',ms:1});
 getSession().profiles.find(p=>p.id==='jakub').mode='family';
 const c=getSession().conversation;
 await command('turn',{text:'Yesterday I booked a room here.',mode:'speech',lastTurnId:c.takes[0].turns.at(-1).id});
 assert.equal(getSession().conversation.takes[0].turns.at(-1).text,REDIRECT_LINE);
 assert(!JSON.stringify(getSession().conversation).includes(DATING));
});

// ------------------------------------------------------------------ UAT 2026-10-14: UD-4 and UD-10 (conversation.ts)
test('UD-4: a moment, a title, a goal and a coaching note carrying a list word never reach a 13-year-old; an adult keeps them',async()=>{
 fresh();getSession().profiles.find(p=>p.id==='ema').age=13;
 answer=async()=>({json:{title:'Beer with friends',goal:'Order a beer.',opening:'Hello. How can I help?'},provider:'test',ms:1});
 await command('start',{sceneId:'booking',replace:true});let c=getSession().conversation;
 assert.doesNotMatch(c.title+c.goal,/beer/i,'title and goal fall back to the scene');
 answer=async()=>({json:{reply:'What name is it under?',observations:[],moment:{kind:'fix',said:'I have booking',better:'Have a beer!',why:'A drink.'}},provider:'test',ms:1});
 await command('turn',{text:'I have booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 c=getSession().conversation;assert.equal(c.moment,null);assert.equal(c.moments.length,0);
 assert(!JSON.stringify(getLearner('ema').english.taught).includes('beer'),'not stored for review either');
 answer=async()=>({json:{before:'I have booking',after:'I have a booking',note:'Next time, have a beer.'},provider:'test',ms:1});
 await assert.rejects(command('coach'));assert.equal(getSession().conversation.coaching,null);
});
test('UD-10: context() carries this scene\'s moments as taughtThisScene, and the turn prompt sends them',async()=>{
 fresh();await command('start',{sceneId:'booking',replace:true});let c=getSession().conversation;
 answer=async()=>({json:{reply:'What date was it?',observations:[],moment:{kind:'fix',said:'I have booking',better:'I have a booking',why:'A booking takes "a".'}},provider:'test',ms:1});
 await command('turn',{text:'I have booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 await command('moment-done');c=getSession().conversation;
 let sent;answer=async(req)=>{sent=JSON.parse(req.prompt);return {json:{before:'I have booking',after:'I have a booking',note:'Good.'},provider:'test',ms:1};};
 await command('coach');
 assert.deepEqual(sent.taughtThisScene,[{said:'I have booking',better:'I have a booking'}]);
});

// ---- K2 self-repair: a fix moment asks for the learner's line before it shows the fix (repair.ts; LG-4, the withhold option)
/** The 2026-10-14 LT moment on Viktor's line, as the tutor would return it for this reply. */
const TOMATO={said:'My tomatoes is one metre',better:'My tomatoes are one metre',why:'Tomatoes is plural, so it takes are.'};
let k2Calls=0;
/** A learner at `level` in a scene where the next reply yields the tomato moment; every model call is counted. */
async function k2Moment({level='B1',partner='Lovely! Is that big for a tomato plant?',moment={kind:'fix',...TOMATO},observations=[]}={}){
 fresh();saveEnglish('ema',{...emptyEnglish(),preferences:{...defaultPreferences(),level}});k2Calls=0;
 answer=async req=>{k2Calls++;const p=JSON.parse(req.prompt);return {json:p.submittedReply?{reply:partner,observations,moment}:{title:'Garden',goal:'Show the garden.',opening:'Hi Grandpa! How tall are your plants?'},provider:'test',ms:1};};
 await command('start',{sceneId:'weekend',replace:true});
 await command('turn',{text:'My tomatoes is one metre.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 k2Calls=0;return getSession().conversation;
}
const momentTry=text=>command('moment-try',{text,mode:'text',lastTurnId:getSession().conversation.moment.turnId});
/** better and the fix key, absent from everything the TV and the phone read */
function withheldEverywhere(where){
 const json=JSON.stringify(getSession());
 assert(!json.includes(TOMATO.better),`${where}: better is not in the session`);
 assert(!/tomatoes are/i.test(json),`${where}: nor is the fix key`);
}
test('K2 case 1 GATE: the session has no better until a try holds; "My tomatoes are one metre." holds before the fix is shown, frees the next reply, with no model call',async()=>{
 let c=await k2Moment();
 assert.equal(getSession().screen,'linga-moment');assert.equal(c.moment.kind,'fix');assert.equal(c.moment.slip,'tomatoes is');
 assert.deepEqual(c.moment.repair,{rung:0},'B1 starts at "say it again"');assert.equal(c.supported,false,'a moment alone supports no reply (lt-swap-2/recert-1)');
 withheldEverywhere('after the turn');
 assert.equal(c.moments.length,0,'not one of the scene\'s moments while open');assert.equal(getLearner('ema').english.taught.length,0,'not on the record while open');
 const V=view();let v=V.lingaView(getSession());
 assert.equal(v.hero.after.quote,'');assert.equal(v.hero.open,true,'the after slot is an empty frame');assert.equal(v.hero.note,'','no clue yet');
 assert.deepEqual(v.answer,{id:'answer',action:'moment-try',label:'Say it again',lastTurnId:c.moment.turnId});
 assert.deepEqual(v.actions.map(a=>a.id),['show-me','back'],'Show me and Back, on the TV row and so on the phone');
 assert.doesNotMatch(V.viewText(v),/tomatoes are/i,'nor in the words the LT driver reads');
 await momentTry('My tomatoes are one metre.');
 c=getSession().conversation;
 assert.equal(k2Calls,0,'judged by code: no model call');
 assert.equal(c.moment.repair.held,true);assert.equal(c.moment.repair.selfRepaired,true);assert.equal(c.moment.repair.tried,'My tomatoes are one metre.');
 assert.equal(c.supported,false,'an unshown self-repair clears supported');
 assert.equal(c.turns.filter(t=>t.role==='learner').length,1,'a try is never a turn');assert.equal(getLearner('ema').english.evidence.length,0,'nor evidence');
 v=V.lingaView(getSession());
 assert.deepEqual(v.hero.before,{kicker:'You said',quote:TOMATO.said,struck:'tomatoes is'},'the slip struck');
 assert.deepEqual(v.hero.after,{kicker:'Your try',quote:'My tomatoes are one metre.'},'the learner own line, under a neutral label');assert.equal(v.captionTag,'You fixed “tomatoes are”','the claim is the fixed words');
 assert.equal(v.hero.open,undefined);assert.equal(v.answer,null,'no more tries');assert.deepEqual(v.actions.map(a=>a.id),['back']);
 assert.doesNotMatch(JSON.stringify(v.hero)+v.caption,/\d+ (of|tries|try)/,'a picture, no count');
 await command('moment-done');c=getSession().conversation;
 const t=getLearner('ema').english.taught;
 assert.equal(t.length,1);assert.equal(t[0].better,TOMATO.better);assert.equal(t[0].selfRepaired,true);assert.equal(t[0].tried,'My tomatoes are one metre.');assert.equal(t[0].repair,undefined);
 assert.equal(c.moments.length,1);assert.equal(c.moments[0].better,TOMATO.better,'the fix joins the scene\'s moments when it closes');
 assert.equal(c.supported,false,'still free after Back');
 // the next reply is the learner's own: its observation is unsupported
 answer=async()=>({json:{reply:'And the beans?',observations:[{skill:'describe',quote:'My tomatoes are very tall',success:true,confidence:'clear',note:'Described the plants.'}]},provider:'test',ms:1});
 await reply('My tomatoes are very tall now.');
 const e=getSession().conversation.evidence.at(-1);assert.equal(e?.quote,'My tomatoes are very tall');assert.equal(e.supported,false,'own-words credit after a self-repair');
 console.log(`# K2 case 1: held "${t[0].tried}" selfRepaired=${t[0].selfRepaired} supported=${c.supported} modelCalls=0`);
});
test('K2 case 2: "My tomatoes is one metre." is not held; misses climb to the clue, then the fix, then one more try',async()=>{
 let c=await k2Moment();const V=view();
 await momentTry('My tomatoes is one metre.');c=getSession().conversation;
 assert.equal(c.moment.repair.held,undefined,'the slip still stands: not held');assert.equal(c.moment.repair.rung,1,'the clue');
 withheldEverywhere('after a miss');assert.equal(V.lingaView(getSession()).hero.note,TOMATO.why,'the why is the clue');
 await momentTry('My plants are one metre.');c=getSession().conversation;
 assert.equal(c.moment.repair.held,undefined,'undecided: the fix key is not said');assert.equal(c.moment.repair.rung,2);
 assert.equal(c.moment.better,TOMATO.better,'a second miss shows the fix');assert.equal(c.supported,false,'the shown fix helps the try, not the next reply');
 const v=V.lingaView(getSession());assert.deepEqual(v.hero.after,{kicker:'Try',quote:TOMATO.better});assert.equal(v.answer.label,'Say it once more');assert.deepEqual(v.actions.map(a=>a.id),['back']);
 await momentTry('My tomatoes is one metre!');c=getSession().conversation;
 assert.equal(c.moment.repair.spent,true);assert.equal(c.moment.repair.held,undefined);
 await assert.rejects(momentTry('My tomatoes are one metre.'),e=>e.status===409,'one more try, no more');
 assert.equal(k2Calls,0);
 await command('moment-done');
 const t=getLearner('ema').english.taught[0];assert.equal(t.selfRepaired,false);assert.equal(t.tried,'My tomatoes is one metre!');
 assert.equal(getSession().conversation.supported,false,'a revealed fix alone leaves the next reply unhelped (lt-swap-2/recert-1)');
 // the next reply that reads the revealed fix back is supported, by code (credit.ts copiesShown over the scene's shown lines)
 answer=async()=>({json:{reply:'And the beans?',observations:[]},provider:'test',ms:1});
 await reply('Yes, my tomatoes are one metre.');assert.equal(getSession().conversation.turns.filter(t=>t.role==='learner').at(-1).supported,true,'a read-back of the fix');
 console.log(`# K2 case 2: "My tomatoes is one metre." not held -> rung 1; undecided -> rung 2 (shown); one more try, then spent; modelCalls=${k2Calls}`);
});
test('K2 case 3: after Show me, a bare repeat of the fix key is not held; the learner\'s sentence holds, unshown never; Show me supports no next reply',async()=>{
 let c=await k2Moment();
 await command('moment-show');c=getSession().conversation;
 assert.equal(c.moment.better,TOMATO.better);assert.equal(c.moment.fix,'tomatoes are');assert.equal(c.moment.repair.rung,2);
 await momentTry('tomatoes are');c=getSession().conversation;
 assert.equal(c.moment.repair.held,undefined,'the bare fix key read off the card is no repair');assert.equal(c.supported,false,'Show me helps the try, not the next reply');assert.equal(c.moment.repair.spent,true);
 await command('moment-done');assert.equal(getLearner('ema').english.taught[0].selfRepaired,false);
 // the full sentence after the fix was shown holds, but it was shown: no self-repair
 await k2Moment();await command('moment-show');await momentTry('My tomatoes are one metre.');c=getSession().conversation;
 assert.equal(c.moment.repair.held,true);assert.equal(c.moment.repair.selfRepaired,false);assert.equal(c.supported,false);
 assert.equal(view().lingaView(getSession()).hero.after.kicker,'Your try');
 // the judge itself (repair.ts judgeTry), on the 10-14 LT pairs
 const {judgeTry}=require(path.join(root,'src/lib/english/repair.ts')),S=slipMod();
 const tom={...TOMATO,...S.slipOf(TOMATO.said,TOMATO.better)};
 assert.equal(judgeTry(tom,'My tomatoes are one metre.',false),true);assert.equal(judgeTry(tom,'My tomatoes is one metre.',false),false);
 assert.equal(judgeTry(tom,'tomatoes are',false),true,'before the fix is shown, finding the key is the learner\'s own');
 assert.equal(judgeTry(tom,'tomatoes are',true),null,'after it, a bare echo is not held');assert.equal(judgeTry(tom,'Tomatoes are.',true),null);
 const venue={said:'we was discussing about this venue',better:'we were discussing this venue'};
 assert.equal(judgeTry({...venue,...S.slipOf(venue.said,venue.better)},'we were discussing this venue',false),true,'P07\'s third fixture');
 // a fix with no guarded key falls back to take.ts heldOf, kind word, over (said, better)
 const plain={said:'I will',better:'I would'},pk={...plain,...S.slipOf(plain.said,plain.better)};
 assert.equal(judgeTry(pk,'I would',false),true);assert.equal(judgeTry(pk,'I will',false),false);assert.equal(judgeTry(pk,'Maybe later.',false),null);
});
test('K2 case 4: a word moment still shows its better at once and takes no try; A1 starts at the clue rung',async()=>{
 let c=await k2Moment({moment:{kind:'word',said:'rajčata',better:'tomatoes',why:'The red fruit in your garden.'}});
 assert.equal(c.moment.better,'tomatoes');assert.equal(c.moment.repair,undefined);assert(JSON.stringify(getSession()).includes('"better":"tomatoes"'));
 await assert.rejects(momentTry('My tomatoes.'),e=>e.status===409);
 assert.equal(view().lingaView(getSession()).answer,null);
 c=await k2Moment({level:'A1'});
 assert.equal(c.moment.repair.rung,1,'A1-A2 start on the clue');withheldEverywhere('A1');
 const v=view().lingaView(getSession());assert.equal(v.hero.note,TOMATO.why);assert.equal(v.hero.open,true);
 await momentTry('My tomatoes is big.');assert.equal(getSession().conversation.moment.repair.rung,2,'one miss on the clue shows the fix');
 assert.equal(getSession().conversation.moment.better,TOMATO.better);
});
test('K2 case 5: a fix the partner\'s line or an observation note already said is shown at once; nothing else on the session echoes a withheld fix',async()=>{
 let c=await k2Moment({partner:'Wow, your tomatoes are one metre tall!'});
 assert.equal(c.moment.repair,undefined,'the partner said the fix key: nothing left to withhold');assert.equal(c.moment.better,TOMATO.better);
 c=await k2Moment({observations:[{skill:'describe',quote:'My tomatoes is one metre',success:false,confidence:'clear',note:'Say "tomatoes are".'}]});
 assert.equal(c.moment.repair,undefined,'an observation note said it');
 c=await k2Moment({moment:{kind:'fix',...TOMATO,why:'Say "tomatoes are": more than one.'}});
 assert.equal(c.moment.repair,undefined,'its own why said it: the clue would be the fix');
 // the turn prompt asks the tutor not to say it
 let prompt;fresh();await command('start',{sceneId:'booking',replace:true});
 answer=async req=>{prompt=JSON.parse(req.prompt);return {json:{reply:'Ok.',observations:[]},provider:'test',ms:1};};
 await reply('I has booking.');
 assert.match(prompt.task,/never say better or its corrected words in your reply or in an observation note/);
 // while withheld: not in shownLines, and neither device draws it
 c=await k2Moment();
 assert(!review().shownLines(c).some(x=>/tomatoes are/i.test(x)));
 const sf=require(path.resolve(__dirname,'../uat/driver/surface.cjs')).surfaceOf(withReply(getSession()));
 assert.doesNotMatch(sf.shown,/tomatoes are/i,'neither device draws it');assert.deepEqual(sf.strays,[]);assert.deepEqual(sf.unrendered,[]);
 assert.match(sf.tv,/Say it again on your phone, your way/);assert.match(sf.tv,/Show me/);
});
test('K2 case 6: a self-repaired fix is not a shown line; Finish over an open moment keeps it; a restart that lost the fix says so and keeps nothing',async()=>{
 let c=await k2Moment();await momentTry('My tomatoes are one metre.');await command('moment-done');c=getSession().conversation;
 assert(!review().shownLines(c).includes(TOMATO.better),'the TV showed the learner\'s own line, never the fix');
 c=await k2Moment();await command('finish');
 assert.equal(getLearner('ema').english.taught.filter(t=>t.line===undefined).length,1,'Finish over a moment keeps it (a K4 hidden line handed over at finish is its own item)');assert.equal(getSession().conversation.moments.length,1);
 c=await k2Moment();globalThis.__lingaRepair.clear();
 await command('moment-show');c=getSession().conversation;
 assert.equal(c.moment.repair.lost,true);withheldEverywhere('after a restart');
 const T=turn();assert.equal(T.accepts(c,'moment-try'),false);assert.equal(T.refusal(c,'moment-try'),T.LOST);
 assert.match(view().lingaView(getSession()).caption,/lost this fix/);
 await command('moment-done');assert.equal(getLearner('ema').english.taught.filter(t=>t.line===undefined).length,0,'nothing kept: the fix existed only in memory');
});
test('K2 case 7: the server refuses exactly what the table refuses on a fix moment at every rung',async()=>{
 const T=turn(),wrong=[];
 const fixes={'withheld 0':{rung:0},'withheld 1':{rung:1},shown:{rung:2},spent:{rung:2,tried:'x',spent:true},held:{rung:0,tried:'I work.',held:true,selfRepaired:true,spent:true},lost:{rung:0,lost:true}};
 for(const [name,repair] of Object.entries(fixes))for(const action of CONVERSATION_ACTIONS){
  const withheld=repair.rung<2&&!repair.held;
  const c=convo({turns:REPLIED,moment:{...MOMENT,...(withheld?{better:'',fix:undefined}:{}),repair}});
  const s=install(fixture('linga-moment',{placement:placed(),conversation:c}));answerAll();
  const ok=T.accepts(c,action);let got='accepted';
  try{await englishCommand({action,learnerId:s.learner.id,episodeId:c.id,commandId:`k2-table-${++counter}`,...extraFor(action,c)});}
  catch(e){got=e.status===409?'refused':`error ${e.status}: ${e.message}`;}
  if(got!==(ok?'accepted':'refused'))wrong.push(`${name} · ${action}: table ${ok?'accepts':'refuses'}, server ${got}`);
 }
 assert.deepEqual(wrong,[]);
});

// ---- L1: phrases you own (review.ts yoursOf; own.ts; the recap, the TV home strip, the print page). A fake clock, local days, no model.
const own=()=>require(path.join(root,'src/lib/english/own.ts'));
/** local noon on 5 October 2026, plus `d` days and `h` hours: day boundaries in the desk's own time zone, whatever it is */
const NOON=(d=0,h=0)=>new Date(2026,9,5+d,12+h).getTime();
const BOOKED='I have a booking';
/** one turn as the pipeline runs it: reuseOf decides on the scene as it stood; only a use it counts reaches markReused */
function useIn(t,reply,scene,at){const R=review(),q=R.reuseOf(reply,scene);return q?R.markReused(t,TAUGHT_A.id,scene.id,q,at,scene.sceneId):t;}
const sceneFor=(id,sceneId,patch={})=>convo({id,sceneId,review:review().reviewOf(TAUGHT_A),...patch});
const YOURS_A={...TAUGHT_A,at:NOON(-3),reuses:[{at:NOON(0),conversationId:'cA',sceneId:'booking',quote:BOOKED},{at:NOON(1),conversationId:'cB',sceneId:'rover',quote:BOOKED}],reusedAt:NOON(1),reusedIn:'cB',reusedQuote:BOOKED};
YOURS_A.yours={at:NOON(1),uses:[YOURS_A.reuses[0],YOURS_A.reuses[1]]};
/** an owned item taught in the adult-audience date scene */
const ADULT_OWNED={...YOURS_A,id:'d:1',sceneId:'date',said:'What music you like',better:'What kind of music do you like',reuses:[],yours:{at:NOON(3),uses:[{at:NOON(2),conversationId:'d1',sceneId:'date',quote:'What kind of music do you like'},{at:NOON(3),conversationId:'d2',sceneId:'weekend',quote:'what kind of music do you like'}]}};
test('L1 case 1: used unaided in scene A on day 1 and scene B on day 2 is "yours"; two uses on one day, or in one scene, are not',()=>{
 const R=review(),base=[{...TAUGHT_A,at:NOON(-3)}];
 let t=useIn(base,'Hi, I have a booking for Friday.',sceneFor('cA','booking'),NOON(0));
 assert.equal(t[0].reuses.length,1);assert.equal(t[0].yours,undefined,'one use is not yours');
 t=useIn(t,'Yes, I have a booking here.',sceneFor('cB','rover'),NOON(1));
 assert.deepEqual(t[0].yours,{at:NOON(1),uses:[t[0].reuses[0],t[0].reuses[1]]},'scene A day 1, scene B day 2: yours');
 assert.deepEqual(t[0].yours.uses.map(u=>[u.conversationId,u.sceneId,u.quote]),[['cA','booking',BOOKED],['cB','rover',BOOKED]]);
 // the same uses on one local day, in three scenes: not yours, however many
 let same=useIn(useIn(base,'I have a booking.',sceneFor('c1','booking'),NOON(0,-2)),'I have a booking, yes.',sceneFor('c2','rover'),NOON(0,3));
 same=useIn(same,'I have a booking!',sceneFor('c3','weekend'),NOON(0,5));
 assert.equal(same[0].reuses.length,3);assert.equal(same[0].yours,undefined,'one day is not enough');
 // in one scene on two days: not yours
 const one=useIn(useIn(base,'I have a booking.',sceneFor('c1','booking'),NOON(0)),'I have a booking.',sceneFor('c2','booking'),NOON(4));
 assert.equal(one[0].reuses.length,2);assert.equal(one[0].yours,undefined,'one scene is not enough');
 // day 1 booking, day 1 rover, day 2 booking: the day-2 use is apart from the rover one only
 const mixed=useIn(same.map(x=>({...x,reuses:x.reuses.slice(0,2)})),'I have a booking.',sceneFor('c4','booking'),NOON(1));
 assert.deepEqual(mixed[0].yours.uses.map(u=>u.conversationId),['c2','c4'],'the earliest earlier use in another scene on another day');
 assert.equal(R.yoursOf({...TAUGHT_A,reuses:[{at:NOON(0),conversationId:'x',quote:BOOKED},{at:NOON(2),conversationId:'y',sceneId:'rover',quote:BOOKED}]}),null,'a use kept before K3 names no scene and cannot count');
 assert.equal(R.yoursOf({...TAUGHT_A,reuses:[{at:NOON(0),conversationId:'x',sceneId:'booking',quote:'a booking'},{at:NOON(2),conversationId:'y',sceneId:'rover',quote:BOOKED}]}),null,'a quote that does not say the item cannot count');
});
test('L1 case 2: a supported, already-shown or copied reply never counts toward "yours"; the next unaided one does',()=>{
 const base=[{...TAUGHT_A,at:NOON(-3)}];
 const day1=useIn(base,'Hi, I have a booking for Friday.',sceneFor('cA','booking'),NOON(0));
 const supported=useIn(day1,'I have a booking.',sceneFor('cB','rover',{supported:true}),NOON(1));
 const shown=useIn(day1,'I have a booking.',sceneFor('cB','rover',{turns:[{id:'p1',role:'partner',text:'Do you have a booking? I have a booking list.'}]}),NOON(1));
 const copied=useIn(day1,'You said: I have a booking.',sceneFor('cB','rover',{turns:[{id:'p1',role:'partner',text:'Say after me: I have a booking.'}]}),NOON(1));
 const moment=useIn(day1,'I have a booking.',sceneFor('cB','rover',{moments:[{id:'m',kind:'fix',said:'I has booking',better:'I have a booking',why:'x',turnId:'t',at:1}]}),NOON(1));
 for(const [name,t] of Object.entries({supported,shown,copied,moment})){assert.equal(t[0].reuses.length,1,`${name}: no use recorded`);assert.equal(t[0].yours,undefined,`${name}: not yours`);}
 const later=useIn(supported,'Sorry, I have a booking.',sceneFor('cC','weekend'),NOON(2));
 assert.equal(later[0].yours.uses[1].conversationId,'cC','the next unaided use in another scene on another day');
});
test('L1 case 3: the latch never unsets - more uses, invitations and a slip keep it; a slip after it reopens the item for review first',()=>{
 const R=review(),y=YOURS_A.yours,{keysOf}=require(path.join(root,'src/lib/english/slip.ts'));
 let t=R.markReused([YOURS_A],YOURS_A.id,'cC',BOOKED,NOON(5),'weekend');assert.deepEqual(t[0].yours,y,'a later use keeps the first latch');
 t=R.offer(t,YOURS_A.id,NOON(6));assert.deepEqual(t[0].yours,y);
 t=R.markReused(R.markReused(t,YOURS_A.id,'cD',BOOKED,NOON(9),'booking'),YOURS_A.id,'cE',BOOKED,NOON(20),'rover');
 assert.equal(R.rests(t[0]),true);assert.equal(R.dueTaught(t,'new',undefined,NOON(60)),null,'at the end of the ladder it rests');
 const slipped=R.markSlipped(t,keysOf(TAUGHT_A).slip,NOON(61));
 assert(slipped[0].slipAt>slipped[0].yours.at&&slipped[0].slips===1,'a slip after the latch');
 assert.equal(R.dueTaught([{...TAUGHT_C,at:NOON(-9)},...slipped],'new',undefined,NOON(62)).id,YOURS_A.id,'reopened: the slipping item comes first');
 assert.deepEqual(slipped[0].yours,y,'and it stays yours');
 assert.deepEqual(cleanEnglish({taught:slipped}).taught[0].yours,y,'through a load');
});
test('L1 case 4: the cleaner works the latch out for an old record from its history, keeps one the history no longer holds, and refuses one that breaks the rule',()=>{
 const {yours,...old}=YOURS_A;
 assert.deepEqual(cleanEnglish({taught:[old]}).taught[0].yours,yours,'computed from the history on load');
 assert.deepEqual(cleanEnglish({taught:[{...YOURS_A,reuses:[YOURS_A.reuses[1]]}]}).taught[0].yours,yours,'a latch outlives a trimmed history');
 const bent={...YOURS_A,reuses:[],yours:{at:NOON(1),uses:[{...YOURS_A.reuses[0],sceneId:'rover'},YOURS_A.reuses[1]]}};
 const kept=cleanEnglish({taught:[bent]}).taught;assert.equal(kept.length,1);assert.equal(kept[0].yours,undefined,'one scene twice is no latch, stored or not');
 assert.equal(cleanEnglish({taught:[{...YOURS_A,yours:{at:1,uses:[1]}}]}).taught.length,0,'a malformed latch drops the item, as any malformed field does');
});
test('L1 case 5: the scene whose use completes it shows "Yours now" - the learner\'s two quotes, no digit; one model call a turn, as before',async()=>{
 const realNow=Date.now;let clock=NOON(1);Date.now=()=>clock;
 try{
  const seeded={...TAUGHT_A,at:NOON(-3),reuses:[YOURS_A.reuses[0]],reusedAt:NOON(0),reusedIn:'cA',reusedQuote:BOOKED,nextDueAt:NOON(0)+review().DAY_MS};
  const c=await taughtStart([seeded]);assert.equal(c.review.id,TAUGHT_A.id,'due the next day, invited in the rover scene');
  clock+=HOUR;await reply(REUSED);assert.equal(prompts.length,2,'one call to open, one a turn');
  const t=taughtOf(TAUGHT_A.id);assert(t.yours,'yours');assert.equal(t.yours.uses[1].conversationId,c.id);assert.equal(t.yours.uses[1].sceneId,'rover');
  await command('finish');assert.equal(prompts.length,2,'no call to finish');
  const after=getSession().conversation;assert.equal(after.phase,'finished');
  const V=view(),v=V.lingaView(sessionOf(fixture('linga-recap',{...getLearner('ema').english,conversation:after})),{});
  assert.equal(v.hero.kind,'comparison');assert.equal(v.hero.kicker,'Yours now');assert.equal(v.title,'Yours now');
  assert.deepEqual(v.hero.before,{kicker:'You said it · A booking that is missing',quote:BOOKED},'the earlier scene\'s quote, its scene named');
  assert.deepEqual(v.hero.after,{kicker:'And tonight',quote:REUSED},'tonight\'s line');
  assert(after.turns.some(x=>x.role==='learner'&&x.text.includes(v.hero.after.quote)),'tonight\'s quote is the learner\'s reply');
  assert.doesNotMatch(JSON.stringify(v.hero),/\d/,'no digit on the hero');assert.doesNotMatch(v.baseCaption,/\d/);
  assert(V.viewText(v).includes('Yours now'));
  console.log('# L1 recap hero:',JSON.stringify(v.hero));
  // a later scene that used it again did not make it yours: "It came back", as before
  const later=V.lingaView(sessionOf(fixture('linga-recap',{...getLearner('ema').english,conversation:{...after,id:'cZ'}})),{});
  assert.equal(later.title,'It came back');
  assert.match(fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8'),/<Kicker text=\{h\.kicker\?\?v\.tag\}\/>/,'the TV draws the comparison\'s own kicker');
 }finally{Date.now=realNow;}
});
test('L1 case 6: the TV home draws the owned phrases as a strip with no count and no digit; Adult as a progress line; an adult scene\'s item never in Family',()=>{
 const V=view(),digits={...YOURS_A,id:'n:1',better:'I have a booking for 2',reuses:[]};
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server')),React=require(path.join(root,'node_modules/react'));
 const {Yours}=require(path.join(root,'src/english/OpenDoor.tsx'));
 const v=V.lingaView(sessionOf(fixture('linga',{placement:placed(),taught:[YOURS_A,ADULT_OWNED,digits]})),{});assert.equal(v.home,'no-plan');
 assert.deepEqual(v.hero.yours,{phrases:[BOOKED],style:'objects'},'Family: Open Door objects; the adult scene\'s item and the phrase with a digit are left out');
 assert.doesNotMatch(JSON.stringify(v.hero.yours),/\d/,'no digit on the strip (the band in home\'s kicker is home\'s own, as before)');
 const html=renderToStaticMarkup(React.createElement(Yours,v.hero.yours));
 assert.match(html,/data-role="linga-yours"/);assert(html.includes(BOOKED));
 assert.doesNotMatch(html.replace(/<[^>]*>/g,' '),/\d/,'the drawn strip shows no digit');
 console.log('# L1 home strip:',JSON.stringify(v.hero.yours));
 assert(V.viewText(v).includes(`Yours: "${BOOKED}"`));
 assert.equal(V.lingaView(sessionOf(fixture('linga',{placement:placed()})),{}).hero.yours,undefined,'none owned: home as it was');
 // Adult mode: the list as progress, and an adult scene's item is shown there
 const adultPrefs={...defaultPreferences({type:'other'}),adultConfirmed:true};
 const asJakub=(fx)=>{const s=sessionOf(fx);return {...s,learner:{...s.learner,id:'jakub',name:'Jakub'}};};
 const a=V.lingaView(asJakub(fixture('linga',{placement:placed(),preferences:adultPrefs,taught:[YOURS_A,ADULT_OWNED]})),{});
 assert.equal(a.hero.yours.style,'list');assert.deepEqual(a.hero.yours.phrases,[BOOKED,'What kind of music do you like']);
 assert.match(renderToStaticMarkup(React.createElement(Yours,a.hero.yours)),/Phrases you own/);
 // never over a conversation waiting
 const resume=V.lingaView(sessionOf(fixture('linga',{placement:placed(),taught:[YOURS_A],conversation:convo({turns:REPLIED})})),{});
 assert.equal(resume.home,'resume');assert.equal(resume.hero.yours,undefined);
 assert.match(fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8'),/\{h\.yours&&<Yours phrases=\{h\.yours\.phrases\} style=\{h\.yours\.style\}\/>\}/,'the TV draws the strip under home\'s words');
});
test('L1 case 7: the print page lists each owned phrase with the learner\'s exact words from two uses and the scene names; an adult scene\'s item is absent in Family',()=>{
 const O=own(),{renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server')),React=require(path.join(root,'node_modules/react'));
 const {PhrasesYouOwn}=require(path.join(root,'src/english/PhrasesYouOwn.tsx'));
 const {taughtAllowed}=require(path.join(root,'src/lib/english/curriculum.ts'));
 const l={...emptyEnglish(),taught:[YOURS_A,ADULT_OWNED,{...TAUGHT_C}],sessions:[{id:'cA',sceneId:'booking',title:'A booking that is missing',at:NOON(0),turns:3}]};
 const kid={id:'k',name:'K',type:'elementary',age:10,modules:['english']},adult={id:'a',name:'A',type:'other',modules:['english'],mode:'adult'};
 // the replies still at hand (tonight's conversation cB): a quote from it must be an exact substring of one of them
 const replies={cB:['Yes, I have a booking here.']};
 const fam=O.ownedPhrases(l,taughtAllowed(kid,defaultPreferences(kid),l),replies);
 assert.deepEqual(fam.map(o=>o.id),[YOURS_A.id],'Family: the adult scene\'s item is absent');
 assert.deepEqual(fam[0].uses.map(u=>[u.quote,u.scene]),[[BOOKED,'A booking that is missing'],[BOOKED,'The missing moon rover']]);
 assert(replies.cB.some(r=>r.includes(fam[0].uses[1].quote)),'an exact substring of the reply');
 assert.deepEqual(O.ownedPhrases(l,taughtAllowed(adult,defaultPreferences(adult),l),replies).map(o=>o.id),[YOURS_A.id,'d:1'],'Adult: both');
 assert.equal(O.ownedPhrases(l,()=>true,{cB:['I have booking, yes.']}).some(o=>o.id===YOURS_A.id),false,'a quote not in the reply at hand is never printed');
 const html=renderToStaticMarkup(React.createElement(PhrasesYouOwn,{owned:fam}));
 assert.match(html,/<h2>Phrases you own<\/h2>/);assert(html.includes(`<b>${BOOKED}</b>`));
 assert.equal((html.match(/“I have a booking” · /g)||[]).length,2,'both of the learner\'s quotes');
 assert(html.includes('A booking that is missing')&&html.includes('The missing moon rover'),'the scene names');
 assert(!html.includes('music'),'Family: no adult item');assert.doesNotMatch(html.replace(/<[^>]*>/g,' '),/\d/,'no digit');
 console.log('# L1 print section:',html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
 assert.equal(renderToStaticMarkup(React.createElement(PhrasesYouOwn,{owned:[]})),'','none owned: nothing printed');
 const page=fs.readFileSync(path.join(root,'src/app/english/print/page.tsx'),'utf8');
 assert.match(page,/ownedPhrases\(l,taughtAllowed\(p,l\.preferences\?\?defaultPreferences\(p\),l\),repliesOf\(s\.conversation\)\)/,'the page reads them through the audience rule and the quote check');
 assert.match(page,/<PhrasesYouOwn owned=\{owned\}\/>/);
 // collectibles stay the existing latches only (owner ruling S1): no collectible for "yours"
 assert.doesNotMatch(fs.readFileSync(path.join(root,'src/lib/rules/collect.ts'),'utf8'),/yours/i);
});

test('verdict reason: a non-pass task names why before the note',()=>{
 const t=(p)=>({kind:'say',band:'B2',verdict:'fail',answered:'yes',english:'A2',...p});
 const gap=P.verdictReason(t({}));
 assert(gap.includes('A2')&&gap.includes('B2'),gap);
 assert(gap.length<=100&&!gap.includes('—'));
 assert.match(P.verdictReason(t({answered:'no',english:'B2'})),/not|did/i);
 assert.match(P.verdictReason(t({english:'none'})),/no English/i);
 const partly=P.verdictReason(t({verdict:'partial',answered:'partly',english:'B2'}));
 assert(partly.length>0&&partly.length<=100&&/part/i.test(partly),partly);
 assert(P.verdictReason(t({verdict:'partial',english:'B1'})).includes('B1'));
 assert(P.verdictReason({kind:'listen',band:'B1',verdict:'partial',answered:'yes',english:'B1'}).length>0);
 assert.equal(P.verdictReason(t({verdict:'pass',english:'B2'})),'');
 assert.equal(P.verdictReason(t({skipped:true})),'');
 assert.equal(P.verdictReason({kind:'choose',band:'A1',verdict:'fail'}),'');
 assert.equal(P.verdictReason({kind:'say',band:'B2',verdict:'fail'}),'');
});

test('LG-54 held back: a below-band partial task names the excerpt, a stored task without it keeps the old line',()=>{
 const t=(p)=>({kind:'say',band:'B1',verdict:'partial',answered:'yes',english:'A2',...p});
 const old=P.verdictReason(t({}));
 assert.equal(old,'Your English read as A2 here, and this task was B1.');
 const held=P.verdictReason(t({heldBack:'he go to school yesterday'}));
 assert.equal(held,old+' Held back: "he go to school yesterday".');
 const long=P.verdictReason(t({heldBack:'I think that the first option is better because he go to the shop every day and he buy many things there'}));
 assert(/…".$/.test(long)&&long.length<=old.length+100,long);
 assert.equal(P.verdictReason(t({heldBack:'x',english:'B1'})),'','at the band: no gap line');
 const task={id:'a',band:'B1',kind:'say',prompt:'p',line:'',options:[],response:'r',mode:'text',verdict:'partial',quote:'r',note:'n',at:1,answered:'yes',english:'A2'};
 const clean=(x)=>P.cleanPlacement({at:1,band:'A2',confidence:'low',source:'check',summary:'s',focus:'f',tasks:[x]}).tasks[0];
 assert.equal('heldBack' in clean(task),false,'an older stored task still loads');
 assert.equal(clean({...task,heldBack:'he go'}).heldBack,'he go');
 assert.equal('heldBack' in clean({...task,heldBack:42}),false,'a non-string is dropped');
 assert.equal(P.verdictReason(clean(task)),old);
});
test('LG-54 held back: the excerpt is kept only when the response holds it and the English sits below the band',()=>{
 const r='I think he go to school yesterday and it was fine.';
 assert.equal(P.keepHeldBack('he go to school',r,'A2','B1'),'he go to school');
 assert.equal(P.keepHeldBack('she goes to school',r,'A2','B1'),'','not in the response: dropped');
 assert.equal(P.keepHeldBack('he go to school',r,'B1','B1'),'','at the band: ignored');
 assert.equal(P.keepHeldBack('he go to school',r,'B2','B1'),'','above the band: ignored');
 assert.equal(P.keepHeldBack('he go to school',r,'none','B1'),'');
 assert.equal(P.keepHeldBack(undefined,r,'A2','B1'),'');
 assert.equal(P.keepHeldBack('',r,'A2','B1'),'');
});
test('LG-54 held back: the judge step stores a found excerpt, drops a missing one and never fails the call',async()=>{
 const run=async(heldBack)=>{
  fresh();answer=wrap(req=>{const p=JSON.parse(req.prompt);if(p.step==='about')return {...checkAnswer(req),selfBand:'C1'};if(p.step==='judge')return {answered:'yes',english:'A2',quote:p.response.slice(0,10),heldBack,note:'x'};return checkAnswer(req);});
  await command('check-start');await answerAbout(3);
  const k=getSession().check,t=k.task;assert.equal(t.kind,'say');
  await command('check-task',{checkId:k.id,taskId:t.id,text:'I would argue that it depend on the day.',mode:'text'});
  return getSession().check.tasks[0];
 };
 const good=await run('it depend on');
 assert.equal(good.heldBack,'it depend on');assert.match(P.verdictReason(good),/Held back: "it depend on"\./);
 const bad=await run('words never said');
 assert.equal('heldBack' in bad,false);assert.equal(P.verdictReason(bad),'Your English read as A2 here, and this task was B2.');
 const none=await run(undefined);
 assert.equal('heldBack' in none,false);
});
test('sameTask: a reworded repeat is the same task, two situations on one interest are not',()=>{
 const sofie='You are at a cafe with a friend. Tell me what you like to do at the weekend and why.';
 assert(P.sameTask(sofie,[sofie]),'identical prompts');
 assert(P.sameTask('Tell me what you like to do at the weekend, and why you like it.',[sofie]),'reworded repeat');
 assert(!P.sameTask('A football match is on tonight. What do you say to the person next to you?',['Tell me about your favourite football team and why you follow them.']),'one shared interest word');
 assert(!P.sameTask('You miss your bus to school. What do you say to your teacher?',[sofie,'A friend invites you to dinner. How do you answer?']));
 assert(P.sameTask('Go home',['Go home']),'two identical short prompts');
 assert(!P.sameTask('Go home now',['Go to school']),'short prompts sharing a word');
 assert(!P.sameTask('',['anything at all here']));assert(!P.sameTask('Tell me about your day at school',[]));
});
const OKSANA=['A carrier calls you. You want to ask if the network is down. What do you say?','Your parcel is late. What do you say to the carrier on the phone?','Many carriers now let customers solve problems in an app instead of phoning. Do you think a phone call is still the better way to sort out a delivery problem? Why or why not?','A carrier keeps dropping your calls. Would you prefer to fix it in an app or by phone with a person? Explain why.'];
test('LG-55 second pass: a reworded app-versus-phone comparison is the same task, other situations are not',()=>{
 assert(P.sameTask(OKSANA[3],[OKSANA[2]]),'the oksana-34 #7/#8 pair');assert(P.sameTask(OKSANA[2],[OKSANA[0],OKSANA[3]]),'either way round');
 assert(!P.sameTask('What are you doing on Saturday?',['Would you prefer to play Roblox or watch a film with your friends? Say why.']),'sofie-11 Roblox versus Saturday');
 assert(!P.sameTask('A football match is on tonight. Would you prefer to go or stay home? Say why.',['Tell me about your favourite football team and why you follow them.']),'one shared word, one prompt not a comparison');
 assert(!P.sameTask('Would you prefer to eat pizza or pasta? Why?',['Would you prefer to travel by train or by bus? Why?']),'two different choices');
});
test('LG-55 second pass: an interview goal is untouched by the carrier prompts, touched by an interview prompt',()=>{
 const goal='I need English for a job interview on Friday';
 assert(P.goalUntouched(goal,OKSANA));assert(!P.goalUntouched(goal,[...OKSANA,'Tell me about a problem you solved at work, as you would in an interview.']));
 assert(!P.goalUntouched('',OKSANA),'no goal, nothing required');assert(P.goalUntouched(goal,[]));
 assert(P.goalUntouched(goal,['What are you doing on Friday?']),'a day word is not the goal');
 assert(P.goalTaskDue(goal,'B1','say',OKSANA));assert(!P.goalTaskDue(goal,'A2','say',OKSANA),'below B1');assert(!P.goalTaskDue(goal,'B2','listen',OKSANA));
});
const OKSANA_GOAL='I want to speak better on calls with carriers, for example when delivery is late. Also I need to answer questions on job interview, to tell about my experience and about problem which I solved. And ask about team, salary and shifts.';
const OKSANA_TASKS=["A colleague says, 'The truck is late. Can you call the carrier?' What do you say?",'What is the reason for the delay? The shipment left the warehouse two days ago, but the driver still has not reached the port because of bad weather.','A client has a large order and asks whether to ship it by sea or by air. Which would you recommend, and why?','A new coworker asks what makes a carrier call go well. What is the most important habit you would teach them, and why?'];
test('LG-55 third pass: oksana-34 goal (reconstructed: the about step\'s goal is not in the run JSON) is split into aims; the interview aim is untouched by her carrier tasks',()=>{
 // the compound goal names carriers and calls, so the first task used to touch the whole goal
 assert.equal(P.goalAims(OKSANA_GOAL).length,3,'carrier calls, the interview, the questions to ask');
 assert(P.goalUntouched(OKSANA_GOAL,OKSANA_TASKS.slice(0,1)),'task 1 touches the carrier aim only');
 assert.match(P.goalAim(OKSANA_GOAL,OKSANA_TASKS),/job interview/,'the aim named to the tutor is the interview');
 assert(P.goalTaskDue(OKSANA_GOAL,'B2','say',OKSANA_TASKS),'the next B2 say task is due');
 assert.match(P.goalAim(OKSANA_GOAL,[...OKSANA_TASKS,'Tell me about a job interview you had.']),/team, salary/,'after an interview prompt the next aim is named');
 assert.equal(P.goalAim('speak better and answer questions',['Tell me about your day']),'','generic verbs and framing words are no aim');
 assert.equal(P.goalAim('I need English for a job interview on Friday',[]),'I need English for a job interview on Friday');
 assert.equal(P.goalAim('',[]),'');
});
test('LG-55 second pass: the task request carries the goal instruction exactly when the goal is untouched, and a miss is asked once more',async()=>{
 const run=async(goalText,prompts)=>{fresh();const asks=[];let n=0;
  answer=wrap(req=>{const p=JSON.parse(req.prompt);
   if(p.step==='about')return {...checkAnswer(req),selfBand:'C1',goal:goalText};
   if(p.step==='task'){asks.push(p);return {prompt:prompts[Math.min(n++,prompts.length-1)],line:'',options:[],correct:0};}
   return checkAnswer(req);});
  await command('check-start');await answerAbout(3);return {asks,k:()=>getSession().check};};
 const GOAL=/Set this task in that aim/;
 let r=await run('a job interview on Friday',['A carrier keeps dropping your calls. Do you want to fix it?','Your parcel is late. What do you tell the carrier?']);
 assert.equal(r.asks.length,2);assert.match(r.asks[0].task,GOAL);assert.match(r.asks[1].task,/not set in the learner's goal/);assert.equal(r.k().task.prompt,'Your parcel is late. What do you tell the carrier?');
 r=await run('a job interview on Friday',['Tell me about a problem you solved at work, as you would in an interview.']);
 assert.equal(r.asks.length,1);assert.match(r.asks[0].task,GOAL);
 r=await run('',['A carrier keeps dropping your calls. Do you want to fix it?']);
 assert.equal(r.asks.length,1);assert.doesNotMatch(r.asks[0].task,GOAL);
});
test('a level-check task that repeats an earlier prompt is asked once more, with the earlier prompt named (LG-55)',async()=>{
 fresh();const same='Tell me about a trip you took with your family and what you enjoyed most.',other='Describe your favourite place in town and say why you go there.';
 const asks=[];
 answer=wrap(req=>{const p=JSON.parse(req.prompt);
  if(p.step==='about')return {...checkAnswer(req),selfBand:'C1',goal:''};
  if(p.step==='task'){asks.push(p);const retry=/previous answer repeated/.test(p.task);return {prompt:retry?other:same,line:p.kind==='listen'?'I left my bag on the bus this morning.':'',options:[],correct:0};}
  return checkAnswer(req);});
 await command('check-start');await answerAbout(3);
 let k=getSession().check;assert.equal(k.task.prompt,same);assert.equal(asks.length,1,'the first task is never re-asked');
 await command('check-task',{checkId:k.id,taskId:k.task.id,text:'I would argue that it depends on the trip.',mode:'text'});
 k=getSession().check;
 assert.equal(asks.length,3,'the repeat was asked once more');assert.match(asks[2].task,new RegExp(same.slice(0,30)),'the gap names the earlier prompt');
 assert.equal(k.task.prompt,other,'the second task on screen differs');
 // a second answer that repeats too is kept: the check goes on
 asks.length=0;answer=wrap(req=>{const p=JSON.parse(req.prompt);if(p.step==='task'){asks.push(p);return {prompt:same,line:p.kind==='listen'?'I left my bag on the bus this morning.':'',options:[],correct:0};}return checkAnswer(req);});
 await command('check-task',{checkId:k.id,taskId:k.task.id,text:'I would argue that it depends on the place.',mode:'text'});
 assert.equal(asks.length,2);assert.equal(getSession().check.task.prompt,same,'the repeat is kept rather than failing the check');
});

test('LG-8 slips: keepSlips drops a slip no answer holds, one only in a skipped answer, one that equals its fix, and keeps a valid one',()=>{
 const {keepSlips}=require(path.join(root,'src/lib/english/check.ts'));
 const t=(response,skipped)=>({id:'x'+response.length,band:'A2',kind:'say',prompt:'p',line:'',options:[],response,mode:'text',verdict:'partial',quote:'',note:'n',at:1,...(skipped?{skipped:true}:{})});
 const tasks=[t('I live here for longer time.'),t('She go to work every day.'),t('Yesterday I am tired and stayed home.',true)];
 assert.deepEqual(keepSlips([{said:'for longer time',better:'for a longer time'}],tasks),[{said:'for longer time',better:'for a longer time'}],'a valid slip is kept');
 assert.deepEqual(keepSlips([{said:'He have a car',better:'He has a car'}],tasks),[],'said in no answer');
 assert.deepEqual(keepSlips([{said:'I am tired',better:'I was tired'}],tasks),[],'said only in a skipped answer');
 assert.deepEqual(keepSlips([{said:'She go to work',better:'she  go to work'}],tasks),[],'better equals said after normalising');
 assert.deepEqual(keepSlips([{said:'She GO to  work',better:'She goes to work'}],tasks),[{said:'She GO to  work',better:'She goes to work'}],'matching is case and space blind');
 assert.deepEqual(keepSlips([{said:'She go to work',better:'She goes to the beer bar'}],tasks,l=>!/beer/.test(l)),[],'the audience gate refuses the better form');
 assert.deepEqual(keepSlips('nope',tasks),[]);assert.deepEqual(keepSlips([null,{said:1,better:'x'}],tasks),[]);
});
test('LG-8 third pass: a slip found only in a listen answer is dropped, a repeated slip comes first, the focus follows it',()=>{
 const {keepSlips,focusFollowsSlip}=require(path.join(root,'src/lib/english/check.ts'));
 const t=(kind,response)=>({id:'x'+response.length,band:'B1',kind,prompt:'p',line:'',options:[],response,mode:'text',verdict:'partial',quote:'',note:'n',at:1});
 // martin-45 recert-5: answers as recorded; 'he move' is in the listen answer only
 const martin=[t('listen','Because Thursday is busy for me and my team, so he move the supplier call to Friday. Then my team have more time to check the new prices. This is too easy.'),t('say','I think it is better to accept the change, but not for free. But two weeks delay make a problem for our production, so I will ask some compensation.'),t('say','I prefer cycling, because after the whole day in office I must clear my head. Also it is a good topic for small talk, many people in my company is cycling.')];
 assert.deepEqual(keepSlips([{said:'he move the supplier call',better:'he moves the supplier call'}],martin),[],'a listen-borne slip is no slip');
 // 'we was discussing' is not in martin-45's recorded answers: a stated reconstruction, said in two say answers
 const again=[...martin,t('say','Yesterday we was discussing the price.'),t('say','Last week we was discussing it with the team.')];
 const model=[{said:'he move the supplier call',better:'he moves the supplier call'},{said:'two weeks delay make',better:'two weeks delay makes'},{said:'we was discussing',better:'we were discussing'}];
 const kept=keepSlips(model,again);
 assert.deepEqual(kept.map(x=>x.said),['we was discussing','two weeks delay make'],'the repeated one first, the listen-borne one gone, the model order otherwise');
 assert.equal(focusFollowsSlip('what the real number is',kept,again),'"we was discussing" becomes "we were discussing"','the focus follows the reordered first slip');
 // hana-41 recert-2: 'I have not so much time' is said once; a slip she repeated outranks it (the repeat is a reconstruction)
 const hana=[t('say','I think short daily chats are better. Longer session once a week is difficult for me, I have not so much time.'),t('say','I would tell them that we are helping each other in our team, because everybody can ask a question.'),t('say','I am helping each other when we are busy.')];
 assert.deepEqual(keepSlips([{said:'I have not so much time',better:'I do not have much time'},{said:'we are helping each other',better:'we help each other'}],hana,undefined).map(x=>x.said),['I have not so much time','we are helping each other'],'nothing repeated: the model order stands');
 assert.deepEqual(keepSlips([{said:'I have not so much time',better:'I do not have much time'},{said:'helping each other',better:'help each other'}],hana).map(x=>x.said),['helping each other','I have not so much time'],'said in two answers: first');
 assert.deepEqual(keepSlips([{said:'a b',better:'a c'},{said:'x y',better:'x z'},{said:'a b',better:'a c'}],[t('say','a b and x y')]).map(x=>x.said),['a b','x y'],'listed twice counts as repeated, and is kept once');
});
test('LG-8 slips: cleanPlacement accepts none, keeps 3 valid, trims 5 to 3, drops a malformed item',()=>{
 const base={...placed('B1')},sl=n=>({said:'w'+n+' w',better:'b'+n+' b'});
 assert.equal(P.cleanPlacement(base).slips,undefined,'an older record stays valid');
 assert.equal(P.cleanPlacement({...base,slips:[sl(1),sl(2),sl(3)]}).slips.length,3);
 assert.deepEqual(P.cleanPlacement({...base,slips:[1,2,3,4,5].map(sl)}).slips,[1,2,3].map(sl));
 assert.deepEqual(P.cleanPlacement({...base,slips:[{said:'a'},sl(1),{said:5,better:'x'}]}).slips,[sl(1)]);
});
test('LG-8 focus: follows the first slip when it quotes none of it, keeps one that does, leaves no-slip focus, falls back when long or refused',()=>{
 const C=require(path.join(root,'src/lib/english/check.ts')),F=require(path.join(root,'src/lib/english/line.ts'));
 const t=r=>({id:'x'+r.length,band:'A2',kind:'say',prompt:'p',line:'',options:[],response:r,mode:'text',verdict:'partial',quote:'',note:'n',at:1});
 const tasks=[t('I have meeting at nine.'),t('She go to work every day.')];
 const slips=[{said:'I have meeting',better:'I have a meeting'},{said:'She go to work',better:'She goes to work'}];
 assert.equal(C.focusFollowsSlip('Practise "She go to work" with "She goes to work"',slips,tasks),'"I have meeting" becomes "I have a meeting"','the focus quotes only the second slip');
 assert.equal(C.focusFollowsSlip('what the real number is',slips,tasks),'"I have meeting" becomes "I have a meeting"','a focus quoting none');
 const kept='Practise "I have meeting" as "I have a meeting"';
 assert.equal(C.focusFollowsSlip(kept,slips,tasks),kept,'a focus already quoting the first slip is kept');
 assert.equal(C.focusFollowsSlip('what the real number is',[],tasks),'what the real number is','no slips: untouched');
 assert.equal(C.focusFollowsSlip('x',[{said:'I have meeting',better:'I have a meeting '+'z'.repeat(110)}],tasks),F.FOCUS_FALLBACK,'over 120 characters');
 assert.equal(C.focusFollowsSlip('x',slips,tasks,l=>!/a meeting/.test(l)),F.FOCUS_FALLBACK,'refused by the audience gate');
});
test('LG-8 slips: the TV never shows them (view.ts and LingaTV.tsx do not reference slips)',()=>{
 for(const f of ['src/lib/english/view.ts','src/english/LingaTV.tsx']){const src=fs.readFileSync(path.join(root,f),"utf8");
  assert(!/\bslips\b/.test(src),f);
  assert(!/Your words:|"Your words"/.test(src),f+' still captions a learner\'s own words on the shared TV');}
});
test('recert-4 / LT-sofie-11-J1-2: the shared TV never headlines a learner\'s own error as "Your words"; the phone keeps it beside the better form',()=>{
 const task={id:'s1',band:'A2',kind:'say',prompt:'What do you do at work?',line:'',options:[],response:'In my job we build spaceship every year.',mode:'speech',verdict:'partial',quote:'we build spaceship',note:'n',at:1};
 const withLine='Try "we build spaceships" instead of "we build spaceship"',without='Practise "we build spaceship"';
 const run=(focus,summary)=>{const pl={...placed('A2'),focus,summary:summary??'You can talk about your job.',tasks:[task]};
  return view().lingaView(sessionOf(fixture('linga-verdict',{placement:pl,check:checkOf({stage:'verdict',turns:[],placement:pl})})),{});};
 for(const focus of [withLine,without]){
  const v=run(focus),tvText=view().viewText(v).split('\n').filter(x=>!/^On the phone/.test(x)).join('\n');
  assert(!/Your words/.test(v.caption+v.captionTag+tvText),v.caption+' | '+v.captionTag);
  assert(!/“we build spaceship”|"we build spaceship"/.test(v.caption+tvText),'the TV quotes the error: '+v.caption+tvText);}
 assert.equal(run(withLine).caption,'Try saying: “we build spaceships”.');assert.equal(run(withLine).captionTag,'Try saying');
 assert.equal(run(without).captionTag,'What next');
 // a model-written summary that quotes the learner's words is not the TV's hero note
 const v=run(without,'You said "we build spaceship" and kept going.');
 assert(!v.hero.note.includes('we build spaceship'),v.hero.note);assert.equal(v.hero.note,P.BAND_CAN.A2);
 assert.equal(run(without,'You talk about your work well.').hero.note,'You talk about your work well.','a summary quoting nothing stays');
 // TL-12: the phone draws no verdict; the TV keeps the better form, and the learner's error stays off it
 const phone=fs.readFileSync(path.join(root,'src/english/LingaPhone.tsx'),'utf8');
 assert.doesNotMatch(phone,/placement.focus|Next to practise/,'the phone no longer draws the verdict');
});
test('LG-50/LG-34: an unfound room line and a brought-back review sentence name their origin, never the bare "A sentence to take with you"',()=>{
 const V=view(),L=lineMod(),BARE='A sentence to take with you',turns=convo().turns;
 const recap=patch=>V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),taught:[TAUGHT_A],conversation:convo({phase:'finished',turns,...patch})})),{});
 const cases=[[recap({line:{source:'quiz',text:'Which bridge do you mean'}}),'The line hidden in this room','Which bridge do you mean'],
  [recap({line:{source:'check',text:'on the bus that morning'}}),'From the level check','on the bus that morning'],
  [recap({review:REVIEW}),'From an earlier scene: A hotel booking','I have a booking']];
 for(const [v,label,sentence] of cases){
  assert.equal(v.hero.kind,'track');assert.equal(v.hero.sentence,sentence);assert.equal(v.hero.label,label);
  const text=V.viewText(v);assert(!text.includes(BARE),text);assert(text.includes(`${label}: "${sentence}"`),text);}
 assert.equal(L.originLabel({line:{source:'quiz',text:'x'}}),'The line hidden in this room');
 assert.equal(L.originLabel({line:{source:'check',text:'x'}}),'From the level check');
 assert.equal(L.originLabel({review:REVIEW}),'From an earlier scene: A hotel booking');
 for(const f of ['src/english/LingaPhone.tsx','src/english/LingaTV.tsx']){const src=fs.readFileSync(path.join(root,f),'utf8');
  assert(!/take with you<\/b>|label=\{h\.from\?[^}]*take with you/.test(src),f+' still heads a recap sentence with the bare label');}
});
test('OOS item 1: the lean caveat names the nearly-reached band and its cause',()=>{
 const say=(band,verdict)=>({band,verdict,kind:'say',response:'I usually go to school by bus with my friends.'});
 const choose=(band,verdict)=>({band,verdict,kind:'choose',response:'Yes'});
 const causes={
  oneStrong:[P.restsLine('low',[say('B1','pass'),say('B2','pass')],'B1'),/B2/,/only one/,'B1'],
  noneStrong:[P.restsLine('low',[say('B1','pass'),{band:'B2',verdict:'pass',kind:'choose',response:'Yes'}],'B1'),/B2/,/none/,'B1'],
  readLower:[P.restsLine('medium',[say('B1','pass'),say('B2','pass'),say('B2','pass')],'B1'),/B2/,/said/,'B1'],
  boundary:[P.restsLine('low',[choose('A2','pass'),say('B1','pass'),say('B1','pass'),say('B2','fail')],'A2'),/B1/,/harder task/,'A2'],
 };
 const lines=new Set();
 for(const [name,[line,hi,why,lo]] of Object.entries(causes)){
  assert(hi.test(line),name+' names the higher band: '+line);assert(why.test(line),name+' names its cause: '+line);
  assert(line.includes('at '+lo),name+' names the band Linga starts at: '+line);
  assert(!/to be safe|one level lower/.test(line),name+' keeps the bare rule out: '+line);
  assert(!/\d/.test(line.replace(/[A-C][12]/g,''))&&!line.includes(String.fromCharCode(8212)),name+' has no digit but band names and no em dash');
  lines.add(line);
 }
 assert.equal(lines.size,4,'one line per cause');
 for(const [,[line]] of Object.entries(causes))assert(line.split(/\s+/).length<=20,line);
 assert.equal(P.staircase('B1',[say('B1','pass'),say('B2','pass')],'B1').band,'B1','the ladder is unchanged');
});

test('LG-52: a choose task asks for a meaning choice at A1-A2 and a grammar contrast from B1',()=>{
 const {chooseTaskFor}=require(path.join(root,'src/lib/english/check.ts'));
 for(const b of ['A1','A2']){
  const t=chooseTaskFor(b);
  assert(/does not fit the situation/.test(t),b+' asks for a reply that does not fit: '+t);
  assert(!/learner error/.test(t),b+' does not ask for a learner error: '+t);
  assert(/must not be a grammar error/.test(t),b+' forbids a grammar-error wrong reply: '+t);
  assert(/120 characters/.test(t)&&/two short replies/.test(t)&&/correct: the index/.test(t),b+' keeps the choose contract');
 }
 for(const b of ['B1','B2','C1','C2']){
  const t=chooseTaskFor(b);
  assert(/typical learner error for this band/.test(t),b+' asks for a typical learner error: '+t);
  assert(/120 characters/.test(t)&&/two short replies/.test(t)&&/correct: the index/.test(t),b+' keeps the choose contract');
 }
});

test('LG-51: a direct correctness question gets the line quoted, a yes or no, and the one change',async()=>{
 fresh();await command('start',{sceneId:'booking',replace:true});const c=getSession().conversation;
 let system;answer=async(req)=>{system=req.system;return {json:{reply:'What date was it?',observations:[],moment:{kind:'none',said:'',better:'',why:''}},provider:'test',ms:1};};
 await command('turn',{text:'I have booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 assert(system,'the turn sent the partner prompt');
 const m=/When the learner asks whether[^\n]*/.exec(system);
 assert(m,'the partner prompt has a rule for a direct correctness question');
 const r=m[0];
 assert(/their own line or a word in it was correct/.test(r),'names the question: '+r);
 assert(/quote the line or the words in question exactly/.test(r),'quotes exactly: '+r);
 assert(/say plainly yes or no/.test(r),'plain yes or no: '+r);
 assert(/if no, give the one change that matters most/i.test(r),'the one change: '+r);
 assert(/never answer with general praise such as "sounds natural"/i.test(r),'no general praise: '+r);
 assert(/do not reverse a verdict from an earlier turn without saying you are correcting yourself/i.test(r),'no silent reversal: '+r);
 assert(/then carry on in the scene/i.test(r),'carries on: '+r);
 assert(/keep the quote short/i.test(r)&&/230 characters/.test(r),'says how to fit the reply limits: '+r);
});
test('LG-51 meaning: the prompt checks meaning and false friends from a teacher-widenable list, and a no names the corrected words',async()=>{
 fresh();await command('start',{sceneId:'booking',replace:true});const c=getSession().conversation;
 let system;answer=async(req)=>{system=req.system;return {json:{reply:'What date was it?',observations:[],moment:{kind:'none',said:'',better:'',why:''}},provider:'test',ms:1};};
 await command('turn',{text:'I have booking for Friday.',mode:'text',lastTurnId:c.turns.at(-1).id});
 const r=/When the learner asks whether[^\n]*/.exec(system)[0];
 assert(/each word means what the learner meant in the scene, not only that the grammar is right/i.test(r),'meaning check: '+r);
 assert(/false friend for a Czech or Slavic speaker/i.test(r)&&/makes the answer no/i.test(r),'false friend makes it a no: '+r);
 const {KNOWN_FALSE_FRIENDS}=require(path.join(root,'src/lib/english/slip.ts'));
 assert(KNOWN_FALSE_FRIENDS.length>=5,'a fixed list');
 for(const w of ['eventually','actual','sympathetic','concurrence','become'])assert(KNOWN_FALSE_FRIENDS.some(x=>x.startsWith(w))&&r.includes(KNOWN_FALSE_FRIENDS.find(x=>x.startsWith(w))),'the prompt carries the list entry '+w);
 assert(/a no names the corrected words themselves/i.test(r)&&/never only the category/i.test(r),'a no names the corrected words: '+r);
 assert(/on a yes as well as a no/i.test(r),'quotes on a yes too: '+r);
 assert(/askedAbout\.slips is not empty, the answer is no/i.test(r),'askedAbout slips decide the no: '+r);
 assert(/at most 230 characters/.test(r),'the reply limit stays');
});
test('LG-53: a held self-repair claims the fixed words, not the whole try that keeps another error',()=>{
 const V=view(),said='Okay, I want to discuss the delay of our last delivery. So, without about.',tried='Okay, I want to discuss the delay of our last delivery. So, without about. But this is very small mistake, I think.';
 const mo={id:'l1:moment',kind:'fix',said:'Okay, I want to discuss the delay of our last delivery. So, without about.',better:'Okay, I want to discuss the delay of our last delivery. So, about it.',why:'Say about it.',turnId:'l1',at:1,slip:'without about',fix:'about it'};
 for(const selfRepaired of [true,false]){
  const v=V.lingaView(sessionOf(fixture('linga-moment',{placement:placed(),conversation:convo({turns:REPLIED,moment:{...mo,repair:{rung:selfRepaired?0:2,tried,held:true,selfRepaired,spent:true}}})})));
  const text=JSON.stringify([v.hero.after,v.captionTag,v.caption]);
  assert.doesNotMatch(text,/You found it|You said it|Your own fix/,'no claim on the whole line');
  assert.match(v.captionTag,/about it/,'the caption tag names the fixed words');
  assert.equal(v.hero.after.kicker,'Your try');assert.equal(v.hero.after.quote,tried);
 }
 assert.equal(V.fixedClaim({said:'My tomatoes is one metre',better:'My tomatoes are one metre'}),'You fixed “are”','without a fix key, the changed words of better');
});
test('LG-51 detector: a direct correctness question is found, an ordinary reply is not',()=>{
 const {asksCorrectness}=require(path.join(root,'src/lib/english/review.ts'));
 for(const q of ['Is my sentence correct?','was that right?','Did I say it well?','Is it correct?','Am I saying it right?'])assert(asksCorrectness(q),'fires on: '+q);
 for(const q of ['I need a room for Friday.','The right door is on the left.','Can you repeat that?','I will correct the booking tomorrow.'])assert(!asksCorrectness(q),'quiet on: '+q);
});
// LG-57: no moment may stop this scene (correction "pauses"), so the taught slip said again stays a reply and the question can follow it
test('LG-51 askedAbout: the previous learner line is matched against the taught slips; a clean line gives empty slips; no question gives none',async()=>{
 await slipStart([VIKTOR]);getSession().conversation.preferences.correction='pauses';
 await reply('Tomatoes is green. And red.');
 assert.equal(prompts.at(-1).askedAbout,undefined,'an ordinary reply carries no askedAbout');
 await reply('Is my sentence correct?');
 const a=prompts.at(-1).askedAbout;
 assert.equal(a.line,'Tomatoes is green. And red.');
 assert.deepEqual(a.slips,[{said:'Tomatoes is',better:'tomatoes are'}]);
 await reply('The tomatoes are green.');
 await reply('Is my sentence correct?');
 const b=prompts.at(-1).askedAbout;
 assert.equal(b.line,'The tomatoes are green.');
 assert.deepEqual(b.slips,[],'a clean line holds no slip');
});
const PHONE={id:'a1:t8:moment',kind:'fix',said:'I prefer my phone than my laptop',better:'I prefer my phone to my laptop',why:'Prefer takes to.',turnId:'a1:t8',at:8,slip:'phone than',fix:'phone to'};
const phoneConvo=()=>convo({moments:[PHONE],turns:[{id:'p1',role:'partner',text:'Hello.'},{id:'a1:t8',role:'learner',text:'Is it correct to say "I prefer my phone than my laptop"?'},{id:'p2',role:'partner',text:'Tell me more.'}]});
test('LG-51 askedAbout J4-1: a clean line with the question attached is judged, not the previous learner turn',()=>{
 const {askedAboutFor}=require(path.join(root,'src/lib/english/review.ts'));
 const a=askedAboutFor('I use my phone every day. Was my answer correct?',phoneConvo(),[]);
 assert.equal(a.line,'I use my phone every day.');assert.deepEqual(a.slips,[],'the previous turn\'s slip does not leak');
});
test('LG-51 askedAbout: a quoted line inside the question is the line judged',()=>{
 const {askedAboutFor}=require(path.join(root,'src/lib/english/review.ts'));
 for(const q of ['Is it correct to say "I prefer my phone than my laptop"?','Is it correct to say “I prefer my phone than my laptop”?']){
  const a=askedAboutFor(q,convo({moments:[PHONE]}),[]);
  assert.equal(a.line,'I prefer my phone than my laptop');assert.deepEqual(a.slips,[{said:'phone than',better:'phone to'}]);
 }
});
test('LG-51 askedAbout: a question alone still reads the previous learner turn',()=>{
 const {askedAboutFor}=require(path.join(root,'src/lib/english/review.ts'));
 const c=convo({moments:[PHONE],turns:[{id:'l1',role:'learner',text:'I prefer my phone than my laptop.'}]});
 const a=askedAboutFor('Was that correct?',c,[]);
 assert.equal(a.line,'I prefer my phone than my laptop.');assert.equal(a.slips.length,1);
 assert.equal(askedAboutFor('Was that correct?',convo(),[]),undefined,'no earlier line, no askedAbout');
});

test('LG-55 4th pass: an interview or call aim gets the real-question instruction, an aim with no such situation keeps today\'s text',()=>{
 const C=require(path.join(root,'src/lib/english/check.ts'));
 const iv=C.goalTask('a job interview on Friday for logistics coordinator, where she must explain a problem she solved');
 assert.match(iv,/the question that situation actually asks/);assert.match(iv,/Tell me about a time you solved a problem at work/);assert.match(iv,/never an opinion/);
 assert.match(C.goalTask('speak better on calls with carriers'),/the question that situation actually asks/);
 const plain='travel to Spain and order food';
 assert.equal(C.goalTask(plain),`The learner stated a goal (learner.goal) and no earlier task touches this aim of it: "${plain}". Set this task in that aim, in a situation it names, not in the interest.`);
 assert(P.questionSituation('Friday interview')&&P.questionSituation('an exam')&&!P.questionSituation('read novels'));
});
test('LG-8 4th pass: core slips (agreement, article, preposition) lead, a repeated style slip does not',()=>{
 const {keepSlips,focusFollowsSlip,slipIsStyle}=require(path.join(root,'src/lib/english/check.ts'));
 const t=r=>({id:'x'+r.length,band:'B1',kind:'say',prompt:'p',line:'',options:[],response:r,mode:'text',verdict:'partial',quote:'',note:'n',at:1});
 const tasks=[t('So then I would send it. I am accountant. We was discussing it. I am interested about this.'),t('So then I would call. Then I would send the file.')];
 const model=[{said:'So then I would send',better:'I would send'},{said:'I am accountant',better:'I am an accountant'},{said:'we was discussing',better:'we were discussing'},{said:'interested about',better:'interested in'}];
 assert(slipIsStyle(model[0])&&!slipIsStyle(model[1])&&!slipIsStyle(model[3]));
 const kept=keepSlips(model,tasks);
 assert.deepEqual(kept.map(x=>x.said),['I am accountant','we was discussing','interested about'],'a style slip goes last and is cut by the three-slip limit');
 const style=[{said:'so then I would',better:'I would'},{said:'I am accountant',better:'I am an accountant'}];
 assert.deepEqual(keepSlips(style,tasks).map(x=>x.said),['I am accountant','so then I would'],'a repeated style slip yields to a core one');
 assert.equal(focusFollowsSlip('send faster',kept,tasks),'"I am accountant" becomes "I am an accountant"','the focus leads with the core slip');
});

// ---- council-lite r2 (8f1a2cda) value-1 and value-2: the partner holds a beginner's band, and a repeated error gets a moment
const LENKA="Hi, I'm Lenka from school! I'm new to Minecraft. How many diamonds are in your chest?";
/** a learner at `level` with an empty record, an engine that keeps every request and answers turns with `turn(p)` */
async function bandStart(id,level,opening,turn){
 fresh();dispatch({type:'learner.set',id});dispatch({type:'subject',subject:'english'});
 saveEnglish(id,{...emptyEnglish()});
 const profile=getSession().profiles.find(p=>p.id===id);
 await command('preferences',{preferences:{...defaultPreferences(profile),level,...(id==='jakub'?{adultConfirmed:true}:{})},notes:[]});
 const seen=[];
 answer=async req=>{const p=JSON.parse(req.prompt);seen.push({system:req.system,prompt:p});return {json:p.submittedReply?turn(p):{title:'Minecraft house',goal:'Show your house.',opening,help:{simpler:'',meaning:'',starter:''}},provider:'test',ms:1};};
 await command('start',{sceneId:'booking',replace:true});
 return seen;
}
test('LG-56: bandLine holds an A1-A2 line to two short sentences and one question, prefers a fitting simpler rung, and leaves B1 up alone',()=>{
 const {bandLine}=require(path.join(root,'src/lib/english/gate.ts'));
 // LG-5 (recert-6 LT-tomas-9-J4-3) revised this row on purpose: the reaction and the question are 12 words, over A1's
 // whole-line budget of 8, so the question alone is kept; at A2 the reaction and the question in their order still are
 assert.equal(bandLine(LENKA,'A1'),'How many diamonds are in your chest?','LT-tomas-9-J4-1: the one question');
 assert.equal(bandLine(LENKA,'A2'),"Hi, I'm Lenka from school! How many diamonds are in your chest?",'the reaction and the one question, in their order');
 assert.equal(bandLine(LENKA,'A1','Hi! How many diamonds do you have?'),'Hi! How many diamonds do you have?','a simpler rung that fits wins');
 assert.equal(bandLine('Do you like it? Is it big?','A1'),'Is it big?','one question: the last');
 assert.equal(bandLine('Hello! What do you like?','A1'),'Hello! What do you like?','a line in band is unchanged');
 assert.equal(bandLine(LENKA,'B1'),LENKA,'B1 is not held');
 assert.equal(bandLine('Hi there, I am the new girl in your class, and I really love building houses! What is yours like?','A1'),'What is yours like?','an over-long statement is dropped, the question kept');
});
test('LG-56: a tomas-9-like A1 partner is held at the opening and on a turn through partnerSays; the prompt names the limit; B1 hears the line as it came',async()=>{
 const long='Wow, that is a really big and beautiful house you built for all your friends and pets! What do you keep in it?';
 let seen=await bandStart('ema','A1',LENKA,()=>({reply:long,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'Wow, a big house! What is in it?',meaning:'',starter:''}}));
 assert.match(seen[0].system,/This learner plays at A1: every sentence you say has at most 8 words/);
 assert.equal(partnerSaid()[0],'How many diamonds are in your chest?','LG-5: the question alone, inside the whole-line budget');
 await reply('Many diamonds. I have a house.');
 assert.equal(partnerSaid().at(-1),'Wow, a big house! What is in it?','the simpler rung that fits');
 const {BAND_HOLD}=require(path.join(root,'src/lib/english/gate.ts'));
 for(const l of partnerSaid()){const s=l.split(/(?<=[.!?])\s+/);assert(s.length<=2&&s.every(x=>x.split(/\s+/).length<=BAND_HOLD.A1.words)&&(l.match(/\?/g)||[]).length<=1,l);}
 seen=await bandStart('jakub','B1',LENKA,()=>({reply:long,observations:[],moment:{kind:'none',said:'',better:'',why:''}}));
 assert.doesNotMatch(seen[0].system,/This learner plays at/);
 await reply('I keep my bike in it.');
 assert.deepEqual(partnerSaid(),[LENKA,long],'B1 is not held');
});
test('LG-56: no band hold for an unplaced learner with no level set',async()=>{
 const long='Wow, that is a really big and beautiful house you built for all your friends and pets! What do you keep in it?';
 const turn=()=>({reply:long,observations:[],moment:{kind:'none',said:'',better:'',why:''}});
 const noHold=async(label)=>{
  const seen=[];
  answer=async req=>{const p=JSON.parse(req.prompt);seen.push({system:req.system,prompt:p});return {json:p.submittedReply?turn():{title:'Minecraft house',goal:'Show your house.',opening:long,help:{simpler:'',meaning:'',starter:''}},provider:'test',ms:1};};
  await command('start',{sceneId:'booking',replace:true});
  assert.doesNotMatch(seen[0].system,/plays at/,label+': no band sentence');
  assert.match(seen[0].system,/Level: A1 on the CEFR scale/,label+': the Level line is unchanged');
  await reply('I keep my bike in it.');
  assert.deepEqual(partnerSaid(),[long,long],label+': the over-band line reaches the learner unchanged');
 };
 fresh();dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});
 saveEnglish('ema',{...emptyEnglish()});
 await noHold('never set up');
 // plan-goal saves a goal on top of the defaults: a non-null preferences that still carries only the defaulted A1
 fresh();dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});
 saveEnglish('ema',{...emptyEnglish(),preferences:{...defaultPreferences(getSession().profiles.find(p=>p.id==='ema')),goal:'travel',levelUnset:true}});
 await noHold('goal saved over the defaults');
 assert.equal(cleanEnglish(getLearner('ema').english).preferences.levelUnset,true,'the marker survives a reload');
 // a KNOWN A1 (set by hand) is still held
 const seen=await bandStart('ema','A1',LENKA,turn);
 assert.match(seen[0].system,/This learner plays at A1/);
 await reply('I keep my bike in it.');
 assert.notEqual(partnerSaid().at(-1),long,'an explicit A1 is held');
});
test('LG-5: at A1 a past-tense partner question fails the band hold, the line\'s own simpler rung is taken when it passes, and the A1 prompt names present tense (recert-7 LT-viktor-67-J4-5)',async()=>{
 const {bandLine,pastQuestion}=require(path.join(root,'src/lib/english/gate.ts'));
 for(const q of ['What did you do at school?','Did you play at school?','How was school today?','Were you happy?','What happened at the end?','Who won?','So, where did you go?'])assert(pastQuestion(q),q);
 for(const q of ['What do you do at school?','Do you play at school?','What do you need?','Is it red?','Where is your bed?','Biscuit loved the splash!'])assert(!pastQuestion(q),q);
 assert.equal(bandLine('What did you do at school?','A1','What do you do at school?'),'What do you do at school?','LT-viktor-67-J4-5: the present-tense rung');
 assert.equal(bandLine('Nice! How was school today?','A1','Is school good?'),'Is school good?');
 assert.equal(bandLine('Did you play at school?','A1','Did you play?'),'Did you play at school?','a rung still in the past is no better: the line stays, code adds no words');
 assert.equal(bandLine('What did you do at school?','A2','What do you do?'),'What did you do at school?','A2 may hear the past');
 assert.equal(bandLine('Do you play at school?','A1','Play?'),'Do you play at school?','a present line in band is unchanged');
 const seen=await bandStart('ema','A1','Hello! What do you like?',()=>({reply:'Cool! What did you do at school?',observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'What do you do at school?',meaning:'',starter:''}}));
 assert.match(seen[0].system,/Speak in the present tense, and ask one short question in the present tense/);
 await reply('I like dogs.');
 assert.equal(partnerSaid().at(-1),'What do you do at school?','held through partnerSays');
 const a2=await bandStart('ema','A2','Hello! What do you like?',()=>({reply:'Cool! What did you do at school?',observations:[],moment:{kind:'none',said:'',better:'',why:''}}));
 assert.doesNotMatch(a2[0].system,/present tense/);
});
test('LG-5: at A1 a reaction and a question over 8 words in all is cut to the question; a correctness answer or a slip recast keeps both; the prompt names the budget (recert-6 LT-tomas-9-J4-3)',async()=>{
 const {bandLine}=require(path.join(root,'src/lib/english/gate.ts'));
 assert.equal(bandLine('Sleeping is nice! Where does he sleep at night?','A1'),'Where does he sleep at night?','LT-tomas-9-J4-3: two sentences, 9 words');
 assert.equal(bandLine('Sleeping is nice! Where does he sleep at night?','A1','Where does he sleep?'),'Where does he sleep?','a fitting rung still wins');
 assert.equal(bandLine('Cool! What is his name?','A1'),'Cool! What is his name?','a short reaction and question fit');
 assert.equal(bandLine('Sleeping is nice! Where does he sleep at night?','A2'),'Sleeping is nice! Where does he sleep at night?','A2 has no whole-line budget');
 assert.equal(bandLine("No, say 'I have a dog'. What is his name?",'A1',undefined,true),"No, say 'I have a dog'. What is his name?",'an answer keeps its verdict');
 const seen=await bandStart('ema','A1','Hello! What do you like?',()=>({reply:'Sleeping is nice! Where does he sleep at night?',observations:[],moment:{kind:'none',said:'',better:'',why:''}}));
 assert.match(seen[0].system,/Your whole reply has at most 8 words/);
 await reply('My dog sleep.');
 assert.equal(partnerSaid().at(-1),'Where does he sleep at night?','held through partnerSays');
 answer=async req=>{const p=JSON.parse(req.prompt);return {json:{reply:p.askedAbout?"Yes, 'I like dogs' is right. What is his name?":'x',observations:[],moment:{kind:'none',said:'',better:'',why:''}},provider:'test',ms:1};};
 await reply('I like dogs. Is that right?');
 assert.equal(partnerSaid().at(-1),"Yes, 'I like dogs' is right. What is his name?",'a correctness answer is not cut to its question');
});
test('LG-57: a martin-45-like error said twice in one scene stops the scene with a code-made moment; the partner is told to leave the fix to it',async()=>{
 const {FOSSIL_TASK,FOSSIL_WHY}=review();
 const seen=await bandStart('jakub','B1','Hello, how can I help?',()=>({reply:'I see. When do you need them?',observations:[],moment:{kind:'none',said:'',better:'',why:''}}));
 await reply('We was promised the parts on Monday.');
 assert.equal(getSession().conversation.moment,null,'once is not yet a fossil');assert.equal(seen.at(-1).prompt.slipAgain,undefined);
 await reply('Sorry, but we was told Friday by your colleague.');
 const c=getSession().conversation;
 assert(c.moment,'LT-martin-45-J3-1 (recert-5 "we was promised"): the repeat gets a moment');
 assert.equal(c.moment.kind,'fix');assert.equal(c.moment.said,'we was');assert.equal(c.moment.why,FOSSIL_WHY);assert.equal(c.moment.better,'','the fix waits for a try');
 assert.equal(getSession().screen,'linga-moment');
 assert.deepEqual(seen.at(-1).prompt.slipAgain,{said:'we was',better:'we were',task:FOSSIL_TASK});
 await command('moment-done');
 assert.equal(getSession().conversation.moments.at(-1).better,'we were');
 assert(getLearner('jakub').english.taught.some(t=>t.slip==='we was'),'kept on the record when it closes');
});
test('LG-57: a fix taught in an earlier session said again ("more better") stops the scene, counts once, and adds no second item',async()=>{
 const MARTIN={id:'m1:t1:moment',kind:'fix',said:'this is more better for me',better:'this is better for me',why:'Better already compares.',turnId:'m1:t1',at:30,sceneId:'booking',title:'Supplier call'};
 const seen=await bandStart('jakub','B1','Hello, how can I help?',()=>({reply:'Good. Which day is best for the truck?',observations:[],moment:{kind:'none',said:'',better:'',why:''}}));
 saveEnglish('jakub',{...getLearner('jakub').english,taught:cleanEnglish({taught:[MARTIN]}).taught});
 await reply('Friday is more better for me.');
 const c=getSession().conversation;
 assert(c.moment,'the taught slip said again gets a moment, not only a recast');assert.equal(c.moment.said,'is more better');
 assert.equal(seen.at(-1).prompt.slipAgain.task,review().FOSSIL_TASK);
 await command('moment-done');
 const taught=getLearner('jakub').english.taught;
 assert.equal(taught.length,1,'no second item');assert.equal(taught[0].slips,1,'one reply counts once');
});
// recert-6/LT-tomas-9-J4-3, recert-6/LT-adela-17-J4-3: supported is true exactly when help was used for that reply
test('supported flag: an opening is not supported, and a model that says nothing never supports a reply',async()=>{
 await booked(said('Which date?',{observations:undefined}),{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'});
 assert.equal(getSession().conversation.supported,false,'an opening line is not help');
 await reply('Could you check my booking?');
 let c=getSession().conversation,l=c.turns.at(-2);
 assert.equal(l.supported,false);assert.equal(c.supported,false,'the next reply starts independent');
});
test('supported flag: a cue then a reply is supported; the next unhelped reply is independent again',async()=>{
 await booked(p=>({reply:'Which date do you need?',observations:observed(p.submittedReply)}));
 await command('cue');assert.equal(getSession().conversation.supported,true,'a cue is help');
 await reply('Could you check my booking?');
 let c=getSession().conversation,l=c.turns.at(-2);
 assert.equal(l.supported,true);assert(c.evidence.filter(e=>e.turnId===l.id).every(e=>e.supported===true));
 assert.equal(c.supported,false,'the flag resets after the helped reply');
 await reply('Could you check it for Friday?');
 c=getSession().conversation;l=c.turns.at(-2);
 assert.equal(l.supported,false);assert(c.evidence.filter(e=>e.turnId===l.id).length&&c.evidence.filter(e=>e.turnId===l.id).every(e=>e.supported===false));
 assert.equal(c.supported,false);
});
test('supported flag: the recap splits supported from independent replies',()=>{
 const V=view(),turns=[{id:'p1',role:'partner',text:'Hello.'},{id:'l1',role:'learner',text:'Hello',mode:'speech',supported:true},{id:'p2',role:'partner',text:'Name?'},{id:'l2',role:'learner',text:'Eva',mode:'speech',supported:false},{id:'p3',role:'partner',text:'Date?'},{id:'l3',role:'learner',text:'Friday',mode:'text',supported:false}];
 const v=V.lingaView(sessionOf(fixture('linga-recap',{placement:placed(),conversation:convo({phase:'finished',turns})})),{});
 assert.equal(v.recap.supported,1);assert.equal(v.recap.independent,2);assert.equal(v.recap.replies,3);
 assert.match(v.hero.data??JSON.stringify(v),/2 on your own · 1 with help/);
});
// lt-swap-2/recert-1 (LT-tomas-9-J4-2, recorded against LT-tomas-9-J4-3; LT-adela-17-J4-3, LT-petra-38-J4-3, LT-jana-29-J3-3):
// a learner turn is supported only when that reply came after help the learner used (a cue, a quiz opened or answered, a
// help rung) or reads back a line the scene showed. Never the model's word (the delegate's ruling (c) removed supportProvided
// from the answer's shape), never a moment, coaching or replay alone.
/** A stubbed engine for a recert-1 scene: turns answer with `turn(p)`, coach with `coach`, replay with `again`; every request is kept in `asked`. */
let asked=[];
function recertEngine(turn,{coach,again}={}){
 asked=[];answer=async req=>{const p=JSON.parse(req.prompt);
  const out=String(p.task??'').startsWith('Coach')?coach:p.coaching?{reply:again}:p.submittedReply?{observations:[],moment:{kind:'none',said:'',better:'',why:''},...turn(p)}:{title:'Booking',goal:'Fix a booking.',opening:'Hello, can I help?'};
  asked.push({req,out});return {json:out,provider:'test',ms:1};};
}
async function recertScene(turn,more){fresh();saveEnglish('ema',emptyEnglish());recertEngine(turn,more);await command('start',{sceneId:'booking',replace:true});}
const lastLearner=()=>[...getSession().conversation.turns].reverse().find(t=>t.role==='learner');
const flags=()=>getSession().conversation.turns.filter(t=>t.role==='learner').map(t=>t.supported);
test('supported flag 1 (jana-29 J3, tomas-9 J4 #12): an opening and partner lines never support an unhelped reply, and the answer has no supportProvided',async()=>{
 await recertScene(p=>({reply:p.submittedReply.startsWith('Thanks')?'Could we agree on a fixed day that works for both of us?':'What day would be workable for you?',observations:observed(p.submittedReply)}));
 assert.equal(getSession().conversation.supported,false,'the opening is the model\'s own line, not help the learner used (jana-29 #2)');
 await reply('Could we agree on a firmer handover date?');
 assert.equal(lastLearner().supported,false);assert.equal(getSession().conversation.supported,false,'a partner line is not carried to the next reply as help');
 await reply('Thanks, Wednesday end of day would suit me.');
 await reply('How about Thursday morning then?');
 assert.deepEqual(flags(),[false,false,false],'jana-29 J3: three own replies, none helped');
 // ruling (c): no prompt asks for supportProvided, every stub answer fits the narrowed shape, and the shape refuses the old field
 const {validate}=require(path.join(root,'src/lib/engines/shape.ts'));
 assert.equal(asked.length,4);
 for(const {req,out} of asked){
  const s=req.accept??req.schema;
  assert(!JSON.stringify([req.system,req.prompt,req.schema,req.accept]).includes('supportProvided'),'the model is never asked for supportProvided');
  assert.deepEqual(validate(out,s),[]);
  assert(validate({...out,supportProvided:true},s).some(([p,why])=>p.includes('supportProvided')&&why==='not in the schema'),'an answer still carrying supportProvided is refused');
 }
 const ev=getSession().conversation.evidence;assert.equal(ev.length,3);assert(ev.every(e=>e.supported===false),'own-words evidence stays unsupported');
});
test('supported flag 2 (adela-17 J4 #7, petra-38 J4 #8 #12 #18, tomas-9 J4 #10): a moment, coaching or a replay alone does not support the next reply',async()=>{
 // a fix moment, Back, then an own reply (adela-17 #6-#7, tomas-9 #9-#10)
 await recertScene(p=>p.submittedReply.includes('interested about')?{reply:'What would make you fly anyway?',moment:{kind:'fix',said:'interested about',better:'interested in',why:'We say interested in.'}}:{reply:'And what else?'});
 await reply('I am interested about the environment.');
 assert.equal(getSession().screen,'linga-moment');assert.equal(getSession().conversation.supported,false,'a moment is not help the learner used');
 await command('moment-done');assert.equal(getSession().conversation.supported,false);
 await reply('I would fly only for very long trips.');
 assert.deepEqual(flags(),[false,false],'the reply after the moment is the learner\'s own');
 // Show me on a fix moment, then an own reply on the new question (petra-38 #9-#12, #15-#18): the shown fix helped the try, not the next answer
 await recertScene(p=>p.submittedReply.includes('arrive yesterday')?{reply:'What did you do after that?',moment:{kind:'fix',said:'you arrive yesterday',better:'you arrived yesterday',why:'A finished event takes the past.'}}:{reply:'And then?'});
 await reply('I think you arrive yesterday at four.');
 await command('moment-show');assert.equal(getSession().conversation.supported,false,'Show me helps the try, not the next reply');
 await momentTry('I think you arrived yesterday at four.');await command('moment-done');
 assert.equal(getSession().conversation.supported,false);
 await reply('After that I go to my room and sleep.');
 assert.deepEqual(flags(),[false,false],'petra-38 #12: no help used for this answer');
 // ...but a reply that reads back the shown fix is supported (copiesShown over the scene's shown lines)
 await recertScene(p=>p.submittedReply.includes('arrive yesterday')?{reply:'Is that right?',moment:{kind:'fix',said:'you arrive yesterday at four',better:'you arrived yesterday at four o\'clock',why:'A finished event takes the past.'}}:{reply:'Good.'});
 await reply('I think you arrive yesterday at four.');await command('moment-show');await command('moment-done');
 await reply('Yes, you arrived yesterday at four o\'clock.');
 assert.equal(lastLearner().supported,true,'a line copied from what was shown is help used');
 // coaching then a replay, then an own reply (petra-38 #6-#8)
 await recertScene(()=>({reply:'Were you here yesterday?'}),{coach:{before:'How can I help you',after:'How can I help you? Can you hear me clearly?',note:'Clear opening.'},again:'What time did you arrive yesterday?'});
 await reply('Good morning, Grand Harbour Hotel. How can I help you?');
 await command('coach');assert.equal(getSession().conversation.phase,'coaching');assert.equal(getSession().conversation.supported,false,'coaching alone is not help for the next reply');
 await command('replay');assert.equal(getSession().conversation.phase,'replay');assert.equal(getSession().conversation.supported,false,'a replay alone is not help');
 await reply('I am sorry, I think you came at four.');
 assert.deepEqual(flags(),[false,false],'petra-38 #8: the replay answer is the learner\'s own');
 // the replay answer that reads back the coached line is supported
 await recertScene(()=>({reply:'Were you here yesterday?'}),{coach:{before:'How can I help you',after:'How can I help you? Can you hear me clearly?',note:'Clear opening.'},again:'Can you start the call again?'});
 await reply('Good morning, Grand Harbour Hotel. How can I help you?');await command('coach');await command('replay');
 await reply('Good morning. How can I help you? Can you hear me clearly?');
 assert.equal(lastLearner().supported,true,'the coached line read back is help used');
});
test('supported flag 3 (tomas-9 J4 #2-#8, petra-38 J4 #3-#4): a used cue, an opened or answered quiz and a starter rung support the reply; the flag resets after it',async()=>{
 // LG-5 recert-9: the quiz is the line's own, so the lines come with one (fits, misfit)
 await recertScene(()=>({reply:'Which date do you need?',help:{...LADDER,fits:'On Friday, please.',misfit:'I like trains.'}}));
 await command('cue');await reply('I like the room.');// the scene cue: the opening had no ladder (tomas-9 #2-#4)
 assert.equal(lastLearner().supported,true,'a cue the learner pressed');assert.equal(getSession().conversation.supported,false,'reset once the reply is recorded');
 await reply('Yes. Friday.');assert.equal(lastLearner().supported,false,'tomas-9 #5: no help between the partner line and this reply');
 await command('quiz');await command('choice',{option:1});await reply('My room is big.');
 assert.equal(lastLearner().supported,true,'tomas-9 #6-#8: a quiz opened and answered');
 await command('quiz');await reply('A room for two.');assert.equal(lastLearner().supported,true,'petra-38 #3-#4: a quiz opened, not answered');
 await command('cue');await command('cue');await command('cue');await reply('I need the room on Friday night.');
 assert.equal(lastLearner().supported,true,'a revealed starter rung');
 await reply('Thank you so much.');assert.equal(lastLearner().supported,false);
 assert.deepEqual(flags(),[true,false,true,true,true,false]);
});
test('supported flag 4 (tomas-9 J4 #14): the recap\'s on-your-own and with-help counts are the turns\' flags',async()=>{
 // LG-5 recert-9: the quiz is the line's own, so the lines come with one and no rung (the cue is still the scene's)
 const own={fits:'Yes, he likes meat.',misfit:'At nine.'};
 await recertScene(p=>p.submittedReply.startsWith('My house')?{reply:'What is in your garden?',help:own,moment:{kind:'word',said:'Můj',better:'my',why:'Můj means my.'}}:{reply:'Do you know what Rex likes to eat?',help:own});
 await command('cue');await reply('I like Minecraft.');// #4: helped
 await reply('Yes. Minecraft creeper.');// #5: own
 await command('quiz');await command('choice',{option:1});await reply('My house... Můj house big.');// #8: helped
 if(getSession().screen==='linga-moment')await command('moment-done');
 await reply('Dog. Dog v garden. I like dog.');// #10: own, after a moment
 await reply('Dog... Rex. My dog Rex.');// #11: own
 await reply('Rex like... maso. Dog like meat.');// #12: own, after a partner line alone
 assert.deepEqual(flags(),[true,false,true,false,false,false]);
 await command('finish');
 const v=view().lingaView(getSession(),{});
 assert.equal(v.recap.supported,2);assert.equal(v.recap.independent,4);assert.equal(v.recap.replies,6);
 assert.match(JSON.stringify(v),/4 on your own · 2 with help/);
});
test('supported flag 5: cert credit is unchanged for genuinely unhelped evidence, and helped evidence still earns none',async()=>{
 const {evidenceProgress}=require(path.join(root,'src/lib/english/rules.ts'));
 await recertScene(p=>({reply:'Which date?',observations:observed(p.submittedReply)}));
 await reply('Could you check my booking?');await reply('Could you look for Friday?');
 await command('cue');await reply('Could you find the room?');
 const ev=getSession().conversation.evidence;
 assert.deepEqual(ev.map(e=>e.supported),[false,false,true],'the two own replies count on their own, the cued one is helped');
 assert.equal(evidenceProgress(ev,'request'),'independent','two unhelped typed replies are "on your own", as before');
 assert.equal(evidenceProgress(ev.filter(e=>e.supported),'request'),'with-help','a helped reply alone is only "with help"');
});

// ---- lt-swap-2/recert-2/LT-jana-29-J3-2: a run of a shown line the learner already said herself is her own words, not a read-back
const JANA=[
 'Thanks for joining the review, Owen. I\'d like to hear your take on the new checkout flow. Which part stood out to you, and why?',
 'Thanks for having me. To be fair, I really like that you cut the form down to a single page, because the old one was a bit of a maze. I\'d push back on one thing though, the hidden promo code field, but let me start with what works.',
 'Fair point, and I\'m glad the single page landed well. The promo code field is worth discussing. Where else do you feel the design is holding back?',
 'Well, my main concern is the promo code field. When it\'s sitting there in the middle of the page, people leave to go and look for a code, and then they often don\'t come back. So I\'d suggest collapsing it behind a small link, like "Have a code?", so it doesn\'t distract the people who don\'t have one. Other than that, I think the error messages on the picture are a bit vague too.',
 'Collapsing it sounds sensible, since shoppers leaving to hunt for a code is a real drop-off risk. You mentioned vague error messages too, so is there another spot where you\'d want the design to be bolder?',
 'Good question. To be fair, I\'d say the error messages are the other spot. Right now they just say "something went wrong", which doesn\'t help anyone. I\'d push for specific messages next to each field, in plain language.',
 'Let\'s do it. Who could we invite first?'];
const JANA_MOMENT={kind:'word',said:'on the picture',better:'on the screen',why:'the screens shoppers see during checkout'};
async function janaScene(){
 fresh();const lines=[JANA[2],JANA[4],JANA[6]];let n=0;
 answer=async req=>{const p=JSON.parse(req.prompt);return {json:p.submittedReply?{reply:lines[n++],observations:[],...(n===2?{moment:JANA_MOMENT}:{})}:{title:'Design review',goal:'Give your take on the checkout.',opening:JANA[0]},provider:'test',ms:1};};
 await command('start',{sceneId:'booking',replace:true});
 await reply(JANA[1]);await reply(JANA[3]);
 assert(getSession().conversation.moment,'the moment stops the scene after reply 2');await command('moment-done');
 await reply(JANA[5]);
}
const learnerFlags=()=>getSession().conversation.turns.filter(t=>t.role==='learner').map(t=>t.supported);
test('J3 case 1: "the promo code field" was the learner\'s own word in reply 1; saying it again in reply 2 is not a read-back (conversation.ts copiesShown over her earlier replies)',async()=>{
 await janaScene();
 assert.deepEqual(learnerFlags(),[false,false,false]);
 await command('finish');
 const r=view().lingaView(getSession(),{}).recap;assert.equal(r.independent,3);assert.equal(r.supported,0);
});
test('J3 case 2: the teeth stay: a run of a partner line she never said is a read-back; so is the fix, the cue and the coached line; any help rung supports the next reply',async()=>{
 const {copiesShown,creditOf}=require(path.join(root,'src/lib/english/credit.ts'));
 const shown=['Fair point. The promo code field is worth discussing.'];
 assert.equal(copiesShown('I think the promo code field matters',shown,[]),true,'never said by her: a read-back');
 assert.equal(copiesShown('I think the promo code field matters',shown,['the hidden promo code field']),false,'said by her earlier: her own');
 assert.equal(copiesShown('The promo code field is worth discussing',shown,['the hidden promo code field']),true,'the part she did not say is still a read-back');
 assert.equal(copiesShown('on the screen',['on the screen'],['on the picture']),true,'under four words wholly inside a shown line');
 assert.equal(copiesShown('on the screen',['on the screen'],['I said on the screen once']),false,'under four words she said herself');
 assert.equal(creditOf('the promo code field is bad','describe',shown,['the hidden promo code field']),'own');
 assert.equal(creditOf('the promo code field is bad','describe',shown,[]),'helped');
 // the fix read back after the moment is still supported (K2 case 2 pins the same through the scene); a cue sets the flag, a rung sets it
 await booked(said('Which date do you need?',{help:LADDER}));await reply();await command('cue');await reply('Friday, please.');
 assert.equal(learnerFlags().at(-1),true,'a help rung supports the next reply');
});
// LG-5, turn-level easing: this turn's reply is read by code (ease.ts); only the phrasing of the easier question is the model's.
test('LG-5: a not-understanding reply puts the easing instruction in the turn input; a plain English reply, or one that merely says "know", does not',async()=>{
 const {EASE_INSTRUCTION}=require(path.join(root,'src/lib/english/ease.ts'));
 const seen=[];
 const run=async(replies,opts={})=>{
  await booked(p=>{if(p.submittedReply)seen.push(p.adaptation);return {reply:'Which date do you need?',observations:[],help:LADDER};});
  seen.length=0;
  for(const r of replies){if(opts.cue)await command('cue');await reply(r);}
  return seen.at(-1);
 };
 assert.equal(await run(['Nevím']),EASE_INSTRUCTION,'nevím');
 assert.equal(await run(['nevim']),EASE_INSTRUCTION,'no diacritics');
 assert.equal(await run(['Nerozumím']),EASE_INSTRUCTION,'nerozumím');
 assert.equal(await run(["I don't know"]),EASE_INSTRUCTION,"I don't know");
 assert.equal(await run(['What?']),EASE_INSTRUCTION,'what?');
 assert.equal(await run(['Já mám psa a on je velký']),EASE_INSTRUCTION,'a Czech sentence');
 assert.equal(await run(['I need a room.','Friday, please.'],{cue:true}),EASE_INSTRUCTION,'help asked twice in a row');
 assert.notEqual(await run(['I need a room for Friday.']),EASE_INSTRUCTION,'a plain English reply');
 assert.notEqual(await run(['I know the hotel, it is near the station.']),EASE_INSTRUCTION,'English that merely contains "know"');
 assert.notEqual(await run(['I need a room.','Friday, please.']),EASE_INSTRUCTION,'no help asked');
});
// LG-4 (owner ruling 2026-10-18), recert-6/LT-petra-38-J4-2: the replay question was a rephrase of the earlier ask. The coach's
// replay and the moment's Back share one replay step: the earlier questions go in as askedBefore, the answer is never supplied.
test('LG-4: the coach replay asks a question that needs the coached form, with the earlier questions passed as ones to avoid',async()=>{
 await recertScene(()=>({reply:'Which room was it?'}),{coach:{before:'I booked',after:'I have booked',note:'Say it is done now.'},again:'What have you done about the noise so far?'});
 await reply('I booked two nights.');await command('coach');await command('replay');
 const call=asked.find(x=>x.req.use==='linga-replay'),p=JSON.parse(call.req.prompt);
 assert.deepEqual(p.coaching,{before:'I booked',after:'I have booked',note:'Say it is done now.'});
 assert.deepEqual(p.askedBefore,['Hello, can I help?','Which room was it?'],'the question the coached reply answered and the line on screen');
 assert.match(p.task,/only by using the after form/);assert.match(p.task,/must not be any line in askedBefore, nor a rephrase of one/);assert.match(p.task,/Do not supply the learner's answer/);
 assert.equal(getSession().conversation.phase,'replay');assert.equal(getSession().conversation.turns.at(-1).text,'What have you done about the noise so far?');
});

// ---- LG-5 recert-8 (docs/uat-insights/2026-10-19-lt-recert-8.md): the help cue loop in all four J4 pairs. A line the band hold
// cut lost its ladder whole, so every press fell back to the scene's cue: Viktor (A1) was offered "Try: What did you do at
// school today?" at #5, #10 and #12, after Mia had said "I drew a cat. Do you draw?" (LT-viktor-67-J4-1), and Tomas got
// "Try: I like to build. My favourite block is..." three times on one line (#2-#4). Fixtures from recert-8.
const VIKTOR_CUE='Try: What did you do at school today?',TOMAS_CUE='Try: I like to build. My favourite block is...';
test('LG-5 recert-8 rules: rungs and the scene cue are held to the band (no past-tense question, 8 words at A1); the scene cue is offered once',()=>{
 const H=require(path.join(root,'src/lib/english/help.ts'));
 assert.equal(H.sceneCueFor(VIKTOR_CUE,'A1',false),null,'viktor-67 #5: a past-tense question at A1');
 assert.equal(H.sceneCueFor(VIKTOR_CUE,'A2',false),VIKTOR_CUE,'A2 may read the past');
 assert.equal(H.sceneCueFor(VIKTOR_CUE,undefined,false),VIKTOR_CUE,'no band known, no hold');
 assert.equal(H.sceneCueFor(TOMAS_CUE,'A1',false),TOMAS_CUE,'tomas-9: two short sentences, 8 words, fit A1');
 assert.equal(H.sceneCueFor(TOMAS_CUE,'A1',true),null,'tomas-9 #3-#4: shown once, never again word for word');
 assert.equal(H.sceneCueFor('Try: Can you tell me what you usually like to build with your friends?','A1',false),null,'over 8 words at A1');
 const raw={simpler:'What did you do at school today?',meaning:'school: where children learn',starter:'Today I …'};
 assert.deepEqual(H.validLadder(raw,'How was your day at school, Grandpa asks?',{band:'A1'}),{2:raw.meaning,3:raw.starter},'A1: the past-tense simpler goes');
 // LG-5 recert-9 revised this row on purpose: at A2 rung 1 is words to say back (help.ts sayBackFor), so the simpler line is no rung
 assert.deepEqual(Object.keys(H.validLadder(raw,'How was your day at school, Grandpa asks?',{band:'A2'})),['2','3'],'A2 keeps the rest');
 assert.deepEqual(Object.keys(H.validLadder(raw,'How was your day at school, Grandpa asks?',{band:'B1'})),['1','2','3'],'B1 keeps them');
 // a line the hold cut keeps the rungs that still fit it: a meaning must name a word still in the line
 const mia={simpler:'',meaning:'draw: make a picture with a pencil',starter:'Yes, I draw …'};
 assert.deepEqual(H.validLadder(mia,'Do you draw?',{band:'A1',held:true}),{2:mia.meaning,3:mia.starter});
 assert.deepEqual(H.validLadder({...mia,meaning:'pencil: a thing you draw with'},'Do you draw?',{band:'A1',held:true}),{3:mia.starter},'a meaning for a word the cut took away goes');
});
test('LG-5 recert-8 wired (viktor-67 J4 #9-#12): a line the A1 hold cut keeps its fitting rungs; the past-tense scene cue is never shown, the help gives the quiz instead',async()=>{
 const said='I drew a cat at school today with my friend Anna. Do you draw?';
 await bandStart('ema','A1','Hi Grandpa! Can you see me?',()=>({reply:said,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'',meaning:'draw: make a picture with a pencil',starter:'Yes, I draw …'}}));
 let c=getSession().conversation;dispatch({type:'linga.changed',conversation:{...c,scene:{...c.scene,cue:VIKTOR_CUE}}});
 await command('quiz');
 assert.equal(getSession().conversation.cue,'','viktor-67 #5: the quiz shows no past-tense cue at A1');
 await reply('Hello Mia. Yes, I see you. You school today?');
 c=getSession().conversation;assert.equal(c.turns.at(-1).text,'Do you draw?','the hold cut the line to its question');
 const cues=[];for(let i=0;i<3;i++){await command('cue');cues.push(getSession().conversation.cue);}
 assert.deepEqual(cues,['draw: make a picture with a pencil','Yes, I draw …','Yes, I draw …'],'the cut line\'s own rungs, never the scene cue');
 // a cut line with no rung left: the help gives the quiz, never the past-tense cue (LG-5 recert-9: the line's own quiz)
 answer=async req=>{const p=JSON.parse(req.prompt);return {json:{reply:said,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{fits:'Yes, I draw cats.',misfit:'I am seven.'}},provider:'test',ms:1};};
 await reply('Yes, I draw. I draw garden.');await command('cue');
 c=getSession().conversation;
 assert.notEqual(c.cue,VIKTOR_CUE);assert.equal(c.quizOpen,true,'the recognition fallback');assert.equal(c.supported,true);
});
test('LG-5 recert-8 wired (tomas-9 J4 #2-#4): the scene cue is shown once a scene; pressed again, or for a later line with no ladder, the help gives the quiz and the button goes',async()=>{
 const V=view();
 await bandStart('ema','A1','What do you make?',()=>({reply:'Nice! What do you build?',observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{fits:'I build a house.',misfit:'I am nine.'}}));
 let c=getSession().conversation;dispatch({type:'linga.changed',conversation:{...c,scene:{...c.scene,cue:TOMAS_CUE}}});
 await command('cue');c=getSession().conversation;
 assert.equal(c.cue,TOMAS_CUE,'the first press: the scene cue, it fits A1');assert.equal(c.quizOpen,false);
 assert.equal(V.helpOf(c).offered,false,'shown once: no second Help button');
 // LG-5 recert-9 revised this row on purpose: the opening has no quiz of its own, and the scene's static quiz is never shown
 await command('cue');c=getSession().conversation;
 assert.equal(c.quizOpen,false,'pressed again: no quiz of the line\'s own, and not the scene\'s');assert.equal(V.quizOffered(c),false,'no Choose a phrase either');
 await reply('I like sword.');await command('cue');c=getSession().conversation;
 assert.notEqual(c.cue,TOMAS_CUE,'a later line with no ladder: never the same cue again');assert.equal(c.quizOpen,true);
});

// ---- LG-5 recert-9 (docs/uat-insights/2026-10-19-lt-recert-9.md): the "above band" complaint came from the help around the
// partner. (1) The first rung at A1-A2 is words to say back, never the partner's line said more simply: "Said more simply: Hi
// Grandpa! I am home now." (recert-9/LT-viktor-67-J4-3) and "Said more simply: Do you know where creepers live?"
// (recert-9/LT-tomas-9-J4-3) handed the learner the partner's line. Fixtures from the recert-9 transcripts.
const MIA_LINE='Hi Grandpa! I am home now.',SAM_LINE='Do you know where creepers live?';
test('LG-5 recert-9 rules (1): at A1-A2 the first rung is a reply-shaped say-back, held to fitsBand and pastQuestion; the line said more simply is never a rung there',()=>{
 const H=require(path.join(root,'src/lib/english/help.ts'));
 assert.equal(H.sayBackFor('Hi Mia! Is school good?',MIA_LINE,'A1'),'Hi Mia! Is school good?','viktor-67: words for Viktor to say back to Mia');
 assert.equal(H.sayBackFor(MIA_LINE,MIA_LINE,'A1'),'','viktor-67 #3: the line again is no say-back');
 assert.equal(H.sayBackFor('Hi Mia. I am home now.',MIA_LINE,'A1'),'','one of the line\'s sentences again is not a reply');
 assert.equal(H.sayBackFor(SAM_LINE,SAM_LINE,'A1'),'','tomas-9 #3: the question again');
 assert.equal(H.sayBackFor('Where do creepers live?',SAM_LINE,'A1'),'','a question answered only with a question is not a reply');
 assert.equal(H.sayBackFor("No, I don't know. Do you?",SAM_LINE,'A1'),"No, I don't know. Do you?",'tomas-9: an answer to Sam');
 assert.equal(H.sayBackFor('Hi Mia! What did you do at school?',MIA_LINE,'A1'),'','a past-tense question at A1');
 assert.equal(H.sayBackFor('Hi Mia! What did you do at school?',MIA_LINE,'A2'),'','pastQuestion holds the say-back at A2 too');
 assert.equal(H.sayBackFor('Hello Mia, it is so very nice to see you here at home today!',MIA_LINE,'A1'),'','over 8 words at A1 (fitsBand)');
 const mia={simpler:'Hi! I am home.',meaning:'home: the house you live in',starter:'Hi Mia, …',sayBack:'Hi Mia! Is school good?'};
 assert.deepEqual(H.validLadder(mia,MIA_LINE,{band:'A1'}),{1:mia.sayBack,say:true,2:mia.meaning,3:mia.starter},'A1: the say-back is rung 1');
 assert.deepEqual(H.validLadder({...mia,sayBack:MIA_LINE},MIA_LINE,{band:'A1'}),{2:mia.meaning,3:mia.starter},'A1: no say-back, and never the simpler line in its place');
 // LG-5 recert-9 revised the A2 row of recert-8 on purpose: A2 gives words to say back too, so its rung 1 is the say-back
 assert.deepEqual(Object.keys(H.validLadder({...mia,sayBack:''},MIA_LINE,{band:'A2'})),['2','3'],'A2: no simpler rung');
 assert.deepEqual(H.validLadder(mia,MIA_LINE,{band:'B1'})[1],mia.simpler,'B1 and up keep said more simply');
 assert.equal(H.validLadder(mia,MIA_LINE,{band:'B1'}).say,undefined);
 assert.deepEqual(H.keepLadder('t-mia',H.validLadder(mia,MIA_LINE,{band:'A1'})),{forTurn:'t-mia',rungs:[1,2,3],rung:0,shown:false,say:true});
});
test('LG-5 recert-9 wired (1) (viktor-67 J4 #3): the first Help press at A1 shows words to say back to Mia, tagged as such; the reply after it is supported',async()=>{
 const V=view();
 await bandStart('ema','A1','Hi! Can you see me?',()=>({reply:MIA_LINE,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'Hi! I am home.',meaning:'home: the house you live in',starter:'Hi Mia, …',sayBack:'Hi Mia! Is school good?'}}));
 await reply('Yes. I see you.');
 let c=getSession().conversation;assert.equal(c.turns.at(-1).text,MIA_LINE);
 assert.equal(V.helpOf(c).help,'Get words you could say back, then answer on your phone.');
 await command('cue');c=getSession().conversation;
 assert.equal(c.cue,'Hi Mia! Is school good?','a reply-shaped rung');assert.notEqual(c.cue,MIA_LINE);assert.notEqual(c.cue,'Hi! I am home.');
 assert.equal(V.helpOf(c).tag,'You could say','never "Said more simply"');assert.equal(c.supported,true);
 await command('cue');assert.equal(getSession().conversation.cue,'home: the house you live in','then the ladder goes on');
});

// (2) A per-line phrase quiz. The scene's static quiz was not rebuilt for the line on screen: Viktor's header read "Mia says:
// School was good. I had maths and art.", a line Mia never said (recert-9/LT-viktor-67-J4-1, blocker), Tomas got "Sam asks: What
// do you like to build?" while Sam asked "Do you know where creepers live?" (recert-9/LT-tomas-9-J4-2, blocker), and Petra got
// "What is the best first step?" on three presses (recert-9/LT-petra-38-J4-2). The quiz now comes from the turn's one help output.
const VIKTOR_QUIZ={question:'Mia says: School was good. I had maths and art.',options:['Nice! What did you draw in art?','Goodbye, Mia.'],correct:0};
const TOMAS_QUIZ={question:'Sam asks: What do you like to build?',options:['I like to build a big house.','I build big house.'],correct:0};
const PETRA_LINE='Your room. What is wrong?',PETRA_QUIZ={question:'What is the best first step?',options:['Name the problem clearly','Stay quiet and leave'],correct:0};
test('LG-5 recert-9 rules (2): a line\'s own quiz is two phrases held to the band; its header quotes the line on screen word for word',()=>{
 const H=require(path.join(root,'src/lib/english/help.ts'));
 const mia={fits:'Hi Mia! Is school good?',misfit:'I am seven.'};
 assert.deepEqual(H.quizWordsFor(mia,MIA_LINE,'A1'),mia);
 assert.equal(H.quizWordsFor({...mia,fits:MIA_LINE},MIA_LINE,'A1'),null,'the line again is no option');
 assert.equal(H.quizWordsFor({...mia,fits:'Nice! What did you draw in art?'},MIA_LINE,'A1'),null,'viktor-67 #5: a past-tense question at A1');
 assert.equal(H.quizWordsFor({fits:'Where do they live?',misfit:'I am nine.'},SAM_LINE,'A1'),null,'a question line is answered, not asked back');
 assert.equal(H.quizWordsFor({fits:'I am nine.',misfit:'I am nine.'},SAM_LINE,'A1'),null,'two different phrases');
 assert.equal(H.quizWordsFor({fits:'',misfit:'I am nine.'},SAM_LINE,'A1'),null);
 const help=H.keepLadder('t-sam',H.validLadder({fits:"No, I don't know.",misfit:'I am nine.'},SAM_LINE,{band:'A1'}));
 assert.deepEqual(help,{forTurn:'t-sam',rungs:[],rung:0,shown:false,quiz:true},'a quiz and no rung still keeps the line\'s help');
 const q=H.quizFor(help,{id:'t-sam',role:'partner',text:SAM_LINE},'Sam · Friend');
 assert.equal(q.question,'Sam asks: Do you know where creepers live?','tomas-9: the line on screen, word for word');
 assert.deepEqual([...q.options].sort(),['I am nine.',"No, I don't know."]);assert.equal(q.options[q.correct],"No, I don't know.");
 assert.equal(H.quizFor(help,{id:'t-other',role:'partner',text:'What do you like to build?'},'Sam · Friend'),null,'never a quiz for another line');
 assert.equal(H.quizFor(null,{id:'t-sam',role:'partner',text:SAM_LINE},'Sam · Friend'),null,'no quiz of its own: none, never the scene\'s');
});
/** a scene at `level` whose partner and static quiz are the recert-9 transcript's, its turns answered with `turn(p)`; every request's schema kept */
let schemas=[];
async function quizScene(level,partner,staticQuiz,turn){
 const seen=await bandStart('ema',level,'Hello! Can you see me?',turn);
 const inner=answer;schemas=[];answer=async(req,a)=>{schemas.push(req.schema);return inner(req,a);};
 const c=getSession().conversation;dispatch({type:'linga.changed',conversation:{...c,partner,scene:{...c.scene,quiz:staticQuiz}}});
 return seen;
}
const NO_MOMENT={kind:'none',said:'',better:'',why:''};
test('LG-5 recert-9 wired (2) (viktor-67 J4 #5, #6, #10): Choose a phrase quotes Mia\'s line on screen and its options answer it; never the scene\'s quiz, and no second model call',async()=>{
 const V=view();
 const seen=await quizScene('A1','Mia · Granddaughter',VIKTOR_QUIZ,()=>({reply:MIA_LINE,observations:[],moment:NO_MOMENT,help:{simpler:'',meaning:'',starter:'',sayBack:'Hi Mia! Is school good?',fits:'Hi Mia! Come in.',misfit:'I am seven.'}}));
 await reply('Yes. I see you.');
 assert.deepEqual(Object.keys(schemas[0].properties.help.properties).filter(k=>k==='fits'||k==='misfit'),['fits','misfit'],'the quiz is asked for in the turn\'s own help output');
 let c=getSession().conversation;assert.equal(V.quizOffered(c),true);
 const calls=seen.length;await command('quiz');c=getSession().conversation;
 assert.equal(seen.length,calls,'opening the quiz makes no model call');
 assert.equal(c.quizOpen,true);assert.equal(c.lineQuiz.question,'Mia says: Hi Grandpa! I am home now.');
 const v=V.lingaView(getSession(),{});
 assert.equal(v.hero.prompt,'Mia says: Hi Grandpa! I am home now.','the line on screen, word for word');
 assert.deepEqual([...v.hero.options].sort(),['Hi Mia! Come in.','I am seven.']);
 assert(!JSON.stringify(v).includes('School was good'),'never a line Mia did not say');
 assert.deepEqual(V.offeredActions(v).filter(a=>a.id==='pick-phrase').map(a=>a.help).sort(),['Hi Mia! Come in.','I am seven.'],'the phone picks from the same two');
 const right=c.lineQuiz.options.indexOf('Hi Mia! Come in.');
 await command('choice',{option:1-right});c=getSession().conversation;
 assert.equal(c.cue,'That one does not answer Mia. Try the other option.');assert.equal(c.quizOpen,true);
 await command('choice',{option:right});c=getSession().conversation;
 assert.equal(c.quizOpen,false);assert.equal(c.evidence.at(-1).quote,'Hi Mia! Come in.');assert.equal(c.evidence.at(-1).mode,'choice');
});
test('LG-5 recert-9 wired (2) (tomas-9 J4 #6-#7, petra-38 J4 #5-#7): once the ladder is spent the help gives the quiz of the line on screen, and each new line brings its own',async()=>{
 const V=view();
 const lines=[SAM_LINE,'Creepers are funny! What are you making?'];let n=0;
 await quizScene('A1','Sam · Friend',TOMAS_QUIZ,()=>({reply:lines[n++],observations:[],moment:NO_MOMENT,help:n===1?{simpler:'',meaning:'creeper: a green monster',starter:'',sayBack:'',fits:"No, I don't know.",misfit:'I am nine.'}:{simpler:'',meaning:'',starter:'',sayBack:'',fits:'I am making a house.',misfit:'Yes, it is green.'}}));
 await reply('I like creeper.');
 await command('cue');assert.equal(getSession().conversation.cue,'creeper: a green monster');
 let c=getSession().conversation;
 assert.equal(V.helpOf(c).offered,false,'the ladder is spent');assert.equal(V.quizOffered(c),true,'Choose a phrase takes its place');
 await command('quiz');c=getSession().conversation;
 assert.equal(c.quizOpen,true);
 assert.equal(V.lingaView(getSession(),{}).hero.prompt,'Sam asks: Do you know where creepers live?','tomas-9: Sam\'s question on screen, never "What do you like to build?"');
 await reply('No. I make house.');
 c=getSession().conversation;assert.equal(c.quizOpen,false);
 await command('quiz');
 assert.equal(V.lingaView(getSession(),{}).hero.prompt,'Sam asks: Creepers are funny! What are you making?','petra-38: a new line, a new quiz, not the same one again');
 // petra-38 at A2: "Your room. What is wrong?" got the scene's "What is the best first step?"
 await quizScene('A2','Ms Lee · hotel receptionist',PETRA_QUIZ,()=>({reply:PETRA_LINE,observations:[],moment:NO_MOMENT,help:{simpler:'',meaning:'',starter:'The room is…',sayBack:'The room is cold.',fits:'The heating does not work.',misfit:'I like the city.'}}));
 await reply('Hello. I am in room two one four.');await command('quiz');
 const v=V.lingaView(getSession(),{});
 assert.equal(v.hero.prompt,'Ms Lee asks: Your room. What is wrong?');
 assert(!JSON.stringify(v).includes(PETRA_QUIZ.question)&&!JSON.stringify(v).includes('Stay quiet and leave'),'never the scene\'s quiz');
});

// ---- LG-5 recert-10 (docs/uat-insights/2026-10-19-lt-recert-10.md, question 3): the say-back is the line on screen's own. On
// Lena's "Hi Grandpa! I am happy too." Viktor's first rung was "Hi Lena! Yes, I see you.", a reply to her first line, "Hi
// Grandpa! Can you see me?" (recert-10/LT-viktor-67-J4-2). A say-back that answers an earlier partner line is no rung.
const LENA_FIRST='Hi Grandpa! Can you see me?',LENA_NOW='Hi Grandpa! I am happy too.',VIKTOR_STALE='Hi Lena! Yes, I see you.';
test('LG-5 recert-10 rules (3): a say-back that answers an earlier partner line, not the one on screen, is no rung; one built from the line on screen stays',()=>{
 const H=require(path.join(root,'src/lib/english/help.ts'));
 assert.equal(H.sayBackFor(VIKTOR_STALE,LENA_NOW,'A1'),VIKTOR_STALE,'with no earlier line given, the rung reads as before');
 assert.equal(H.sayBackFor(VIKTOR_STALE,LENA_NOW,'A1',[LENA_FIRST]),'','viktor-67 #8: it answers "Can you see me?", not the line on screen');
 assert.equal(H.sayBackFor('Me too! Is school good?',LENA_NOW,'A1',[LENA_FIRST]),'Me too! Is school good?','built from the line on screen');
 assert.equal(H.sayBackFor('Yes, I can see you.',LENA_FIRST,'A1',[]),'Yes, I can see you.','the first line\'s own say-back');
 assert.equal(H.sayBackFor('Hi Mia! Is school good?',MIA_LINE,'A1',['Hi! Can you see me?']),'Hi Mia! Is school good?','a new topic shares nothing with an earlier line: kept');
 assert.equal(H.answersEarlier('I see my dog.','Is your dog big?',['Can you see me?']),false,'a word of the line on screen keeps it, whatever else it shares');
 assert.deepEqual(H.validLadder({sayBack:VIKTOR_STALE,meaning:'happy: glad',starter:'I am …'},LENA_NOW,{band:'A1',earlier:[LENA_FIRST]}),{2:'happy: glad',3:'I am …'},'the ladder drops the stale say-back and keeps its other rungs');
});
test('LG-5 recert-10 wired (3) (viktor-67 J4 #8): the first Help press on Lena\'s second line never shows a reply to her first line',async()=>{
 const V=view();
 await bandStart('ema','A1',LENA_FIRST,()=>({reply:LENA_NOW,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'',meaning:'happy: glad',starter:'I am …',sayBack:VIKTOR_STALE}}));
 await reply('Hello Lena. I see you. I am happy.');
 let c=getSession().conversation;assert.equal(c.turns.at(-1).text,LENA_NOW);
 await command('cue');c=getSession().conversation;
 assert.notEqual(c.cue,VIKTOR_STALE,'the earlier line\'s say-back is never the rung');assert.equal(c.cue,'happy: glad');
 assert.notEqual(V.helpOf(c).tag,'You could say');
 // the same scene with a say-back built from the line on screen: it is rung 1, tagged as before
 await bandStart('ema','A1',LENA_FIRST,()=>({reply:LENA_NOW,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'',meaning:'',starter:'',sayBack:'Me too! Is school fun?'}}));
 await reply('Hello Lena. I see you. I am happy.');await command('cue');c=getSession().conversation;
 assert.equal(c.cue,'Me too! Is school fun?');assert.equal(V.helpOf(c).tag,'You could say');
});

// ---- Linga rework 7 (recert-12, LT-viktor-67-J4-1): the help ladder serves the scene's task at A1-A2 when the partner's line
// pulls away from it. Viktor, A1, task "Ask Mia one short question about school", Mia says "Hi Mia! Show me your drawing."-shaped.
// Pause & coach's gating is left as it was: it needs a reply by design.
const DRAW_LINE='Hi Grandpa! Look at my drawing.',SCHOOL_TASK='Hi Mia! Is school good?';
test('Linga rework 7 rules: a task phrase is rung 1 and the quiz\'s other option, held by fitsBand; none, and the ladder is as before',()=>{
 const H=require(path.join(root,'src/lib/english/help.ts')),G=require(path.join(root,'src/lib/english/gate.ts'));
 const raw={simpler:'',meaning:'',starter:'',sayBack:'Nice drawing!',fits:'Nice drawing!',misfit:'I am seven.',task:SCHOOL_TASK};
 const l=H.validLadder(raw,DRAW_LINE,{band:'A1'});
 assert.equal(l[1],SCHOOL_TASK,'press 1: the task phrase');assert.equal(l.say,true);assert.equal(l.task,SCHOOL_TASK);
 assert(G.fitsBand(l[1],'A1'),'it fits A1 under fitsBand');
 assert.equal(H.taskPhraseFor('Hi Mia! What did you do at school today?',DRAW_LINE,'A1'),'','a past-tense question at A1 is no task phrase');
 assert.equal(H.taskPhraseFor('Hello Mia, it is so very nice to see you here at home today!',DRAW_LINE,'A1'),'','over band');
 assert.equal(H.taskPhraseFor(DRAW_LINE,DRAW_LINE,'A1'),'','the line again');
 assert.equal(H.taskPhraseFor(SCHOOL_TASK,DRAW_LINE,'B1'),'','B1 keeps its ladder');
 assert.deepEqual(Object.keys(H.validLadder({...raw,task:''},DRAW_LINE,{band:'A1'})),['1','say','quiz'],'no task: as before');
 const help=H.keepLadder('t-draw',l);
 const q=H.quizFor(help,{id:'t-draw',role:'partner',text:DRAW_LINE},'Mia · Granddaughter');
 assert.deepEqual([...q.options].sort(),[SCHOOL_TASK,'Nice drawing!'].sort(),'the quiz offers the task phrase beside the answer, no misfit');
 assert.equal(H.isTaskOption('t-draw',SCHOOL_TASK),true);assert.equal(H.isTaskOption('t-draw','Nice drawing!'),false);
});
test('Linga rework 7 wired (viktor-67 J4 #2-#13): within two presses an on-task phrase shows, and picking it is not "does not answer"',async()=>{
 const V=view();
 await bandStart('ema','A1','Hello! Can you see me?',()=>({reply:DRAW_LINE,observations:[],moment:NO_MOMENT,help:{simpler:'',meaning:'',starter:'',sayBack:'Nice drawing!',fits:'Nice drawing!',misfit:'I am seven.',task:SCHOOL_TASK}}));
 let c=getSession().conversation;dispatch({type:'linga.changed',conversation:{...c,goal:'Ask Mia one short question about school'}});
 await reply('Yes. I see you.');
 await command('cue');c=getSession().conversation;
 assert.equal(c.cue,SCHOOL_TASK,'press 1: the task phrase, not Mia\'s drawing');assert.equal(V.helpOf(c).tag,'You could say');
 await command('quiz');c=getSession().conversation;
 assert.equal(c.quizOpen,true);assert(c.lineQuiz.options.includes(SCHOOL_TASK),'press 2: Choose a phrase offers it too');
 const task=c.lineQuiz.options.indexOf(SCHOOL_TASK);
 await command('choice',{option:task});c=getSession().conversation;
 assert(!/does not answer/.test(c.cue),'an on-task pick is not rejected');assert.equal(c.quizOpen,false);assert.equal(c.evidence.at(-1).success,true);
});

// ---- TL-12: Linga, the TV drives and the phone speaks ----
/** The TV's Linga hand-offs (ask.kind reply, words, prefs) as the session holds one. */
const handoff=(s,kind)=>({...s,ask:{id:'ask-1',kind,learner:s.learner?.id??null,screen:s.screen,at:0,phase:'open'}});
test('TL-12 case 1: no Linga action navigates to the pairing screen, on any screen, in the menu or the level picker',()=>{
 const V=view();let seen=0;
 for(const fx of Object.values(SWEEP))for(const ui of [{},{menu:true},{picking:'B1'}])for(const a of V.offeredActions(V.lingaView(sessionOf(fx),ui))){
  seen++;assert.notEqual(a.run.nav?.screen,'pair',`${a.id} goes to the pairing screen`);}
 assert(seen>100,`swept ${seen} actions`);
});
test('TL-12 case 2: Set up on the phone opens the prefs hand-off and navigates nowhere',()=>{
 const V=view(),v=V.lingaView(sessionOf(SWEEP.paused),{menu:true}),a=v.actions.find(x=>x.id==='phone-setup');
 assert(a,'the menu offers it');assert.equal(a.label,'Set up on the phone');
 assert.deepEqual(a.run,{ask:{kind:'prefs'}},'it opens ask prefs: no nav, no command');
 assert(!v.actions.some(x=>x.label==='Phone setup'),'the old label is gone');
 const src=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.match(src,/if\(r\.ask\)post\(\{type:"ask\.open",kind:r\.ask\.kind\}\)/,'the TV posts the ask the action names');
});
test('TL-12 case 3: Add a topic, the goal and Pitch a scene open the words hand-off from the TV',()=>{
 const V=view(),adultPrefs={...defaultPreferences({type:'other'}),adultConfirmed:true};
 const goal=V.lingaView(sessionOf(fixture('linga-plan',{placement:placed(),check:checkOf({stage:'plan',turns:[],askGoal:true})})));
 assert.deepEqual(goal.actions.map(a=>a.id),['ask-goal','skip-goal','not-now'],'the goal: Type my goal first, Let Linga pick stays on the TV');
 assert.deepEqual(goal.actions[0].run,{ask:{kind:'words'}});
 const topics=V.lingaView(sessionOf(SWEEP.topics)),add=topics.actions.find(a=>a.id==='ask-topic');
 assert(add,'with topics under the cap the TV offers Add a topic');assert.equal(add.label,'Add a topic');assert.deepEqual(add.run,{ask:{kind:'words'}});
 assert.equal(topics.actions[0].id,'agree','Agree stays first');
 const many=planned('a','b','c','d','e','f','g','h','i','j','k','l').topics.slice(0,require(path.join(root,'src/lib/english/placement.ts')).PLAN_MAX);
 const full=V.lingaView(sessionOf(fixture('linga-plan',{placement:placed(),check:checkOf({stage:'plan',turns:[],topics:many})})));
 assert(!full.actions.some(a=>a.id==='ask-topic'),'at the cap there is no Add a topic');
 const s=sessionOf(fixture('linga-scenes',{placement:placed(),preferences:adultPrefs}));
 assert.deepEqual(V.lingaView({...s,learner:{...s.learner,id:'jakub',name:'Jakub'}}).actions.find(a=>a.id==='ask-pitch')?.run,{ask:{kind:'words'}},'Pitch a scene (Adult)');
 const asked=(fx,screen)=>{const w=handoff(sessionOf(fx),'words');return {...w,ask:{...w.ask,screen}};};
 assert.equal(V.wordsJob(asked(SWEEP.topics,'linga-plan')),'plan-add','the job is read from the screen that asked');
 assert.equal(V.wordsJob(asked(fixture('linga-plan',{placement:placed(),check:checkOf({stage:'plan',turns:[],askGoal:true})}),'linga-plan')),'plan-goal');
 assert.equal(V.wordsJob(asked(SWEEP.topics,'linga-talk')),null);
});
test('TL-12 case 4: every learner turn offers Choose a phrase on the TV, and choosing one answers the turn and closes the reply ask',()=>{
 const V=view();
 const talk=conv=>V.lingaView(sessionOf(fixture('linga-talk',{placement:placed(),conversation:conv})));
 const quizOf=v=>v.actions.find(a=>a.id==='quiz');
 for(const [name,conv] of [['the first line',convo()],['after a reply',convo({turns:REPLIED})],['after a reply, no help left',convo({turns:REPLIED,sceneCued:true})]]){
  const q=quizOf(talk(conv));assert(q,`${name}: Choose a phrase is on the row`);assert.equal(q.label,'Choose a phrase');assert.equal(q.run.command.action,'quiz');assert(!q.disabled,name);
 }
 assert.equal(quizOf(talk(convo({turns:REPLIED,help:{forTurn:'p2',rungs:[],rung:0,shown:false}}))),undefined,'a line with no quiz of its own has none to offer (LG-5 recert-9)');
 assert.deepEqual(talk(convo({turns:REPLIED})).actions.map(a=>a.id),['cue','coach','quiz'],'the order: help, coach, the phrase quiz');
 // the quiz open: its options are the phrases; picking one is the TV answering
 const open=talk(convo({turns:REPLIED,quizOpen:true,cue:'Try: Could you check?'}));
 assert(open.actions.every(a=>a.id==='pick-phrase'),'under the quiz the row is the phrases');
 // the TV closes the reply ask with the pick (LingaTV source), and does not ask again for that turn
 const src=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.match(src,/a\.id==="pick-phrase"&&s\.ask\?\.kind==="reply"&&!sentAndWorking\)\{answered\.current=want;post\(\{type:"ask\.cancel",id:s\.ask\.id\}\)/);
});
test('TL-12 case 5: the footer line reads Answer on your phone while a reply is open, and the old wording is gone',()=>{
 const V=view(),s=handoff(sessionOf(SWEEP.paused),'reply');
 assert.equal(V.askLine(s),'Answer on your phone');assert.equal(V.tvStatus(s,{waiting:false,onCheck:false}),'Answer on your phone');
 assert.equal(V.tvStatus(handoff(s,'prefs'),{waiting:false,onCheck:false}),'Setting up on the phone');
 assert.equal(V.tvStatus(handoff(s,'words'),{waiting:false,onCheck:false}),'Typing on the phone');
 const none=V.tvStatus(sessionOf(SWEEP.paused),{waiting:false,onCheck:false});
 assert.equal(none,V.LEADS_LINE);assert.doesNotMatch(none,/Phone speaks/);
 assert.equal(V.tvStatus(s,{waiting:true,onCheck:false}),'Preparing a reply…','a reply in flight is said first');
 assert.equal(V.tvStatus({...s,ask:{...s.ask,kind:'sheet'}},{waiting:false,onCheck:false,audio:'Audio is unavailable. Follow the captions.'}),'Audio is unavailable. Follow the captions.','another module ask is not Linga line');
 const src=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.doesNotMatch(src,/TV shows · Phone speaks/);assert.match(src,/tvStatus\(s,/);
});
test('TL-12 case 6: the reply ask is for the learner turn on the screen the TV is on, and for nothing else',()=>{
 const V=view(),key=fx=>V.replyKey(V.lingaView(sessionOf(fx)));
 assert.match(key(fixture('linga-talk',{placement:placed(),conversation:convo({turns:REPLIED})})),/^turn:p2/,'the learner line in linga-talk');
 assert.match(key(SWEEP.about),/^check-answer:q1/,'a level-check question');
 assert.match(key(fixture('linga-check',{check:checkOf({stage:'tasks',turns:[],task:{id:'t9',band:'A2',kind:'say',prompt:'Say hello.',line:'',options:[],revealed:false}})})),/^check-task:t9/,'a say task');
 assert.equal(key(SWEEP.choose),null,'a choice task is the remote');
 assert.equal(key(fixture('linga-talk',{placement:placed(),conversation:convo({turns:REPLIED,pending:'held'})})),null,'a reply in flight: not the learner turn');
 assert.equal(key(fixture('linga-talk',{placement:placed(),conversation:convo({turns:REPLIED,paused:true})})),null,'paused');
 assert.equal(key(fixture('linga-recap',{placement:placed(),conversation:convo({turns:REPLIED,phase:'finished'})})),null,'finished');
 assert.equal(key(fixture('linga',{placement:placed(),conversation:convo({turns:REPLIED})})),null,'on home the TV has not asked');
 assert.equal(key(fixture('linga-plan',{placement:placed(),check:checkOf({stage:'plan',turns:[],askGoal:true})})),null,'the goal is typed in the words panel, not a reply');
 const src=fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8');
 assert.match(src,/post\(\{type:"ask\.open",kind:"reply"\}\)/,'LingaTV opens it with no key press');
 assert.match(src,/a\?\.kind==="reply"&&!sentAndWorking&&\(a\.phase==="sent"\|\|!want\|\|want===answered\.current\)\)post\(\{type:"ask\.cancel",id:a\.id\}\)/,'and closes it when the turn stops being the learner one');
 assert.match(src,/if\(open\.kind==="reply"\)answered\.current=want;post\(\{type:"ask\.cancel",id:open\.id\}\)/,'and on Linga Back');
});
test('TL-12 case 7: LingaPhone draws the reply, words and prefs panels by ask kind, and posts nothing outside its asks',()=>{
 const strip=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`])\/\/.*$/gm,'$1');
 const phone=strip('src/english/LingaPhone.tsx');
 assert.doesNotMatch(phone,/type:\s*"nav"/);assert.doesNotMatch(phone,/type:\s*"subject"/);
 for(const k of ['reply','words','prefs'])assert.match(phone,new RegExp(`a\\?\\.kind === "${k}"`),`the ${k} panel is drawn by the ask`);
 const calls=new Set([...phone.matchAll(/\brun\(\s*"([a-z-]+)"/g)].map(m=>m[1]));
 assert.deepEqual([...calls].sort(),['capture','preferences'],'the only literal commands are the mic and the preferences');
 assert.match(phone,/\{ \.\.\.extra, askId: a\?\.id \}/,'every post answers the open hand-off');
 for(const word of ['Pause & coach','Finish rehearsal','Repeat audio','Linga on the TV','Help with a sentence','Cancel pending turn','Find my level','Agree to these topics','All new topics','Let Linga pick','Swap','Take Two','I don&apos;t know','Try again','Resume','Replay','My map','Talk</button>'])
  assert(!phone.includes(word),`the phone no longer draws ${word}`);
 assert.doesNotMatch(phone,/linga-buttons|StartPanel|CheckPanel|VerdictPanel|MomentPanel|TakePanel|PitchBox/,'no tabs, no home, check, moment or take panels');
 const page=strip('src/app/phone/page.tsx');
 assert.match(page,/<LingaPhone\b[^>]*\bask=\{s\.ask\}/,'the page passes the open ask in');
});

// TL-12 H3: /api/english takes a phone's command only with the askId of an open hand-off of the kind that answers it
const route=()=>require(path.join(root,'src/app/api/english/route.ts'));
const asPhone=(body,role='phone')=>route().POST(new Request('http://desk.test/api/english',{method:'POST',headers:{'content-type':'application/json',...(role?{'x-desk-role':role}:{})},body:JSON.stringify(body)}));
const phoneTurn=(extra={})=>{const s=getSession();return asPhone({action:'turn',learnerId:s.learner.id,episodeId:s.conversation.id,commandId:`ph-${++counter}`,text:'I need a room.',mode:'text',lastTurnId:s.conversation.turns.at(-1).id,...extra});};
const snap=()=>{const s=getSession();return JSON.stringify([s.conversation,s.ask]);};
test('H3 case 1: a phone turn with no askId, a wrong askId, or the id of a non-Linga ask is 409 and changes nothing',async()=>{
 await booked(said('Which date do you need?'));
 dispatch({type:'ask.open',kind:'reply'});const good=getSession().ask;
 for(const [name,extra] of [['no askId',{}],['wrong askId',{askId:'not-the-ask'}]]){
  const before=snap(),r=await phoneTurn(extra);
  assert.equal(r.status,409,name);assert.equal((await r.json()).error,'The TV is not asking for that now.',name);assert.equal(snap(),before,name+': nothing changed');
 }
 dispatch({type:'ask.cancel',id:good.id});dispatch({type:'ask.open',kind:'page'});
 const page=getSession().ask,before=snap(),r=await phoneTurn({askId:page.id});
 assert.equal(r.status,409,'an open ask of another kind');assert.equal(snap(),before);assert.equal(getSession().ask.phase,'open');
 dispatch({type:'ask.cancel',id:page.id});
 const none=await phoneTurn({askId:page.id});assert.equal(none.status,409,'no ask open at all');
 assert.equal((await phoneTurn({askId:good.id,}) ).status,409,'a closed ask id');
 const other=await asPhone({action:'cue',learnerId:'ema',episodeId:getSession().conversation.id,commandId:'x-1'});assert.equal(other.status,409,'a TV-row command from a phone');
 assert.equal((await asPhone({action:'capture',active:false,learnerId:'ema',episodeId:getSession().conversation.id,commandId:'x-2'})).status,200,'stopping the microphone stays open');
});
test('H3 case 2: a Linga ask goes open -> sent -> closed; a refused answer does not mark it sent; the TV and in-process callers pass as before',async()=>{
 await booked(said('Which date do you need?'));
 dispatch({type:'ask.open',kind:'reply'});const ask=getSession().ask;
 const stale=await phoneTurn({askId:ask.id,lastTurnId:'old'});assert.equal(stale.status,409);
 const kept=getSession().ask;assert.equal(kept.kind,'reply');assert.equal(kept.phase,'open','a refused answer leaves an open ask');
 let seen=null;const was=answer;answer=async req=>{seen=getSession().ask?.phase;return was(req);};
 const ok=await phoneTurn({askId:kept.id});assert.equal(ok.status,200);assert.equal(seen,'sent','marked sent as the work began');
 const after=getSession().ask;assert.equal(after.id,kept.id);assert.equal(after.phase,'sent','sent until a client closes it');
 assert.equal((await phoneTurn({askId:kept.id})).status,409,'a sent ask takes no second answer');
 dispatch({type:'ask.cancel',id:kept.id});assert.equal(getSession().ask,null,'closed');
 const tv=await asPhone({action:'turn',learnerId:'ema',episodeId:getSession().conversation.id,commandId:'tv-1',text:'Friday please.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id},'tv');assert.equal(tv.status,200,'the TV needs no askId');
 const proc=await asPhone({action:'turn',learnerId:'ema',episodeId:getSession().conversation.id,commandId:'tv-2',text:'Nine am.',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id},null);assert.equal(proc.status,200,'no role (in-process) needs no askId');
});
test('H3 case 3: the words and prefs hand-offs gate their own commands and LingaPhone posts the askId on every answer',async()=>{
 fresh();saveEnglish('ema',emptyEnglish());
 dispatch({type:'ask.open',kind:'words'});const w=getSession().ask;
 const base={learnerId:'ema',commandId:'w-1'};
 assert.equal((await asPhone({action:'preferences',...base,preferences:{},notes:[],askId:w.id})).status,409,'prefs answer on a words ask');
 assert.equal((await asPhone({action:'plan-goal',...base})).status,409,'words answer with no askId');
 assert.equal(getSession().ask.phase,'open');
 dispatch({type:'ask.cancel',id:w.id});dispatch({type:'ask.open',kind:'prefs'});const p=getSession().ask;
 assert.equal((await asPhone({action:'preferences',...base,preferences:defaultPreferences(),notes:[],askId:p.id})).status,200,'prefs with its own ask');
 assert.equal(getSession().ask.phase,'sent');
 const phone=fs.readFileSync(path.join(root,'src/english/LingaPhone.tsx'),'utf8');
 assert.match(phone,/run\(action, \{ \.\.\.extra, askId: a\?\.id \}\)/);
 assert.doesNotMatch(phone,/useEnglish\(s\);[\s\S]*\brun\(\s*"(?!capture|preferences)/,'only the gated commands are posted by literal');
});

// ---- Linga rework 8 (recert-13, LT-viktor-67-J4-1, LT-tomas-9-J4-2): at A1-A2 Choose a phrase never repeats a pair on one
// line, offers the scene's task phrase within two presses, says to type when nothing is new, and a pick shows the phrase to send.
// Scenes are recert-13's (uat/runs/2026-10-17-lt-swap-2/recert-13): Viktor A1 (Sam, school), Tomas A1 (Sam, building), Petra A2 (hotel).
const R8_SCENES=[
 // cue: the plan topic's scene cue as the earlier recert runs recorded it (recert-13 did not record scene.cue, only the help rungs);
 // task: the model's own task phrase for the line, as recert-13 viktor-67's cue rung showed it (the real A1 cue is a past-tense question, so sceneTaskFor is empty there)
 {name:'viktor-67 A1',level:'A1',partner:'Sam · grandson',cue:'Try: What did you do at school today?',task:'Hi Sam! How is school today?',line:'Hi Grandpa! I am home from school now.',help:{fits:'Hi Sam! Good to see you.',misfit:'The weather is cold today.',task:'Hi Sam! How is school today?'}},
 {name:'tomas-9 A1',level:'A1',partner:'Sam · Minecraft friend',cue:'Try: I like to build. My favourite block is...',task:'I like to build.',line:'Hi, Sam here. What do you make?',help:{fits:'I make a house.',misfit:'I am nine.'}},
 {name:'petra-38 A2',level:'A2',partner:'Mia · hotel receptionist',cue:'Try: I have a problem. The room is very cold.',task:'I have a problem. The room is very cold.',line:'Your room. What is wrong?',help:{fits:'The bed is very noisy.',misfit:'I like the city.'}},
];
const pairKey=o=>[...o].map(x=>x.toLowerCase()).sort().join('|');
/** the scene at its level with the partner's one line; each press of Choose a phrase is recorded as {options,cue,quizOpen} */
async function r8Presses(sc,n){
 await bandStart('ema',sc.level,'Hello! Can you see me?',()=>({reply:sc.line,observations:[],moment:NO_MOMENT,help:{simpler:'',meaning:'',starter:'',sayBack:'',...sc.help}}));
 const c0=getSession().conversation;dispatch({type:'linga.changed',conversation:{...c0,partner:sc.partner,scene:{...c0.scene,cue:sc.cue}}});
 await reply('Hello. I see you.');
 const out=[];
 for(let i=0;i<n;i++){await command('quiz');const c=getSession().conversation;out.push({options:c.quizOpen&&c.lineQuiz?[...c.lineQuiz.options]:null,cue:c.cue,quizOpen:c.quizOpen});}
 return out;
}
for(const sc of R8_SCENES)test(`Linga rework 8 wired (${sc.name}): Choose a phrase never repeats a pair on one line, offers the scene's task phrase within two presses, and says to type when nothing is new`,async()=>{
 const presses=await r8Presses(sc,5);
 const pairs=presses.filter(p=>p.options).map(p=>pairKey(p.options));
 for(let i=1;i<pairs.length;i++)assert.notEqual(pairs[i],pairs[i-1],`press ${i+1} is not the pair of press ${i}`);
 assert.equal(new Set(pairs).size,pairs.length,'no pair is offered twice on one line');
 assert(presses.slice(0,2).some(p=>p.options?.includes(sc.task)),'the scene\'s task phrase is offered within 2 presses');
 const last=presses.at(-1);assert.equal(last.options,null,'with nothing new the quiz does not open again');assert.equal(last.cue,'You can type your own reply on the phone.','it says to type');
});
for(const sc of R8_SCENES)test(`Linga rework 8 wired (${sc.name}): a pick is followed by the phrase shown ready to send`,async()=>{
 await r8Presses(sc,1);
 let c=getSession().conversation;const i=c.lineQuiz.options.indexOf(c.lineQuiz.options[c.lineQuiz.correct]);
 const picked=c.lineQuiz.options[i];
 await command('choice',{option:i});c=getSession().conversation;
 assert.equal(c.quizOpen,false);assert(c.cue.includes(`"${picked}"`),`the cue shows the phrase to send: ${c.cue}`);assert(/on the phone/.test(c.cue));
});
test('Linga rework 8 rules: the scene task phrase keeps its words (no letter is eaten) and B1 asks nothing of the new path',()=>{
 const H=require(path.join(root,'src/lib/english/help.ts'));
 assert.equal(H.sceneTaskFor('Try: Hi Sam! Is school good?','A1','Hi Grandpa! I am home from school now.'),'Hi Sam! Is school good?');
});
test('Linga rework 8 rules (code-only recert-13): sceneTaskFor over the real scene cues keeps a finished sendable sentence, never a starter, blank, over-band or repeated line',()=>{
 const H=require(path.join(root,'src/lib/english/help.ts'));
 const T=(cue,band,line='Hello! How are you?')=>H.sceneTaskFor(cue,band,line);
 assert.equal(T('Try: I like to build. My favourite block is...','A1'),'I like to build.','tomas-9: the unfinished starter keeps its finished sentence');
 assert.equal(T('Try: What did you do at school today?','A1'),'','viktor-67 A1: a past-tense question is out of band, the quiz task covers it');
 assert.equal(T('Try: What did you do at school today?','A2'),'What did you do at school today?');
 assert.equal(T('Try: I have a problem. The room is very cold.','A2'),'I have a problem. The room is very cold.','petra-38 A2');
 assert.equal(T('Try: I have a problem. The room is very cold.','A1'),'The room is very cold.');
 assert.equal(T('Try: I build a ___. It is ___.','A1'),'','a blank is not a phrase to send');
 assert.equal(T('Try: My name is… I really like… because…','A2'),'','a starter with no finished sentence');
 assert.equal(T('Try: I like to build. My favourite block is...','B1'),'','B1 asks nothing of the path');
 assert.equal(T('Try: I like to build. My favourite block is...','A1','I like to build.'),'','never the partner own line');
});
/** Adela (B1) on the recert-13 inputs: every press of Choose a phrase and every pick, as the learner sees them */
async function r8Adela(){
 const sc={level:'B1',partner:'Sam · grandson',cue:'Try: Hi Sam! Is school good?',line:'Hi Grandpa! I am home from school now.',help:{fits:'Hi Sam! Good to see you.',misfit:'The weather is cold today.',task:'Hi Sam! Is school good?'}};
 await bandStart('ema',sc.level,'Hello! Can you see me?',()=>({reply:sc.line,observations:[],moment:NO_MOMENT,help:{simpler:'',meaning:'',starter:'',sayBack:'Hi Sam! Good to see you.',...sc.help}}));
 const c0=getSession().conversation;dispatch({type:'linga.changed',conversation:{...c0,partner:sc.partner,scene:{...c0.scene,cue:sc.cue}}});
 await reply('Hello. I see you.');
 const out=[],snap=(step,error)=>{const c=getSession().conversation;out.push({step,error:error??null,cue:c.cue,quizOpen:c.quizOpen,options:c.lineQuiz?.options??null,shown:c.help?.shown??null});};
 const go=async(step,action,extra)=>{try{await command(action,extra);snap(step);}catch(e){snap(step,e.message);}};
 await go('cue1','cue');await go('cue2','cue');await go('quiz1','quiz');await go('quiz2','quiz');await go('quiz3','quiz');
 for(const o of [0,1]){await go(`choice${o}`,'choice',{option:o});await go(`quiz-after${o}`,'quiz');}
 return out;
}
// the expected value is the output of the code at 4a6720a0 (the parent of rework 8), read through git show and hard-coded
const ADELA_BEFORE_R8=[{"step":"cue1","error":null,"cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"cue2","error":null,"cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"quiz1","error":null,"cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"quiz2","error":null,"cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"quiz3","error":null,"cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"choice0","error":"Open Choose a phrase first.","cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"quiz-after0","error":null,"cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"choice1","error":"Open Choose a phrase first.","cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null},{"step":"quiz-after1","error":null,"cue":"Try: Hi Sam! Is school good?","quizOpen":false,"options":null,"shown":null}];
test('Linga rework 8 regression: B1 help for the same inputs is byte-identical to its output before rework 8 (Adela)',async()=>{
 const got=await r8Adela();
  assert.equal(JSON.stringify(got),JSON.stringify(ADELA_BEFORE_R8));
});

// ---- Linga stuck coach (recert-13 LT-viktor-67-J4-2): Pause & coach is open before any reply, and asks no model ----
async function stuckStart(cue){
 await bandStart('ema','A1','Hello! Can you see me?',()=>({reply:'Hi Grandpa! I am home from school now.',observations:[],moment:NO_MOMENT}));
 const c0=getSession().conversation;
 dispatch({type:'linga.changed',conversation:{...c0,partner:'Sam · grandson',scene:{...c0.scene,cue}}});
}
const coachAction=()=>view().lingaView(getSession()).actions.find(a=>a.id==='coach');
test('Linga stuck coach: Pause & coach is offered and open before the learner has replied, and a press makes no model call',async()=>{
 await stuckStart('Try: Hi Sam! Is school good?');
 const a=coachAction();assert(a,'Pause & coach is on the row');assert.equal(a.disabled,false,'and it is not disabled');
 let calls=0;const was=answer;answer=async r=>{calls++;return was(r);};
 await command('coach');answer=was;
 const c=getSession().conversation;
 assert.equal(calls,0,'no model call');assert.equal(c.coaching,null);assert.equal(c.phase,'conversation');
 assert(c.cue.includes('"Hi Sam! Is school good?"'),`the scene's phrase to say: ${c.cue}`);assert.equal(c.supported,true);
});
test('Linga stuck coach: a scene whose cue is no sendable phrase gives the help ladder instead, still no model call',async()=>{
 await stuckStart('Try: What did you do at school today?');
 let calls=0;const was=answer;answer=async r=>{calls++;return was(r);};
 await command('coach');answer=was;
 const c=getSession().conversation;assert.equal(calls,0);assert(c.cue!==''||c.quizOpen,'some help came: a cue or the phrase quiz');
});
