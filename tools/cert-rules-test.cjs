/**
 * LINGA CERTIFICATION (Family W10), the rules under it. Part 1: typed evidence counts toward "on your own" (owner
 * decision D4) and every level check is kept in an append-only record (`placements`, placement.ts). What counts is
 * decided by code (rules.ts evidenceProgress): a spoken or typed reply, unsupported, in a conversation; never a picked
 * phrase, never a level-check task. The record keeps date, band, confidence, source and the check's one sentence,
 * never a task or an answer; a band picked by hand is kept as "self"; a re-check never removes an earlier entry.
 * Run with npm test in desk/ (directly: node tools/cert-rules-test.cjs). No model is called: the providers throw and
 * the text engine is a fixed local stub. The data directory is disposable, under the OS temp dir; never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`desk-cert-rules-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
assert(!path.resolve(data).startsWith(path.resolve(root,'data')),'never desk/data');

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
const engine=require(src('lib/engines/text.ts'));require(src('lib/engines/vision.ts'));
for(const kind of ['text','vision','embed'])reg.useProvider(kind,{name:'stub',run:async()=>{throw new Error(`the ${kind} engine was called`);}});
/** The only "model" here: a fixed local function per step, so a test decides every answer. */
let answer=async()=>{throw new Error('the text engine was called');};
engine.text=(req)=>answer(req);
const {emptyEnglish}=require(src('lib/english/types.ts'));
const {cleanEnglish,mergeEvidence,evidenceProgress}=require(src('lib/english/rules.ts'));
const P=require(src('lib/english/placement.ts'));
const {englishCommand}=require(src('lib/english/conversation.ts'));
const {dispatch,getSession}=require(src('lib/session/store.ts'));
const {getLearner,saveEnglish}=require(src('lib/session/learners.ts'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});

let counter=0;
function command(action,extra={}){const s=getSession();return englishCommand({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:`cert-${++counter}`,...extra});}
function seat(id='ema'){dispatch({type:'reset'});dispatch({type:'learner.set',id});dispatch({type:'subject',subject:'english'});}
const ev=(patch={})=>({id:'e1',episodeId:'ep1',turnId:'t1',sceneId:'booking',skill:'request',at:1000,mode:'speech',supported:false,success:true,quote:'Could you help me?',note:'Asked for help.',...patch});

// ---- the level check, stubbed step by step: every judged answer is at the task's band up to B1, so it lands on B1
const RIGHT='Hi! How are you?';
function checkAnswer(req){const p=JSON.parse(req.prompt);
 if(p.step==='about')return {reply:'Thanks. What do you want to do in English?',selfBand:'B1',goal:'talk with friends',interest:'games',language:'english',read:'Plays games in English.'};
 if(p.step==='task')return p.kind==='choose'?{prompt:'A friend says hi. What do you say?',line:'',options:[RIGHT,'Hi! I am fine yesterday.'],correct:0}:{prompt:'A '+p.kind+' task at '+p.band,line:p.kind==='listen'?'I left my bag on the bus this morning.':'',options:[],correct:0};
 if(p.step==='judge')return {answered:'yes',english:['A1','A2','B1'].includes(p.band)?p.band:'A2',quote:p.response.slice(0,10),note:'A clear answer.'};
 if(p.step==='summary')return {summary:'You get by in everyday talk.',focus:'Telling stories in the past'};
 throw new Error('unexpected step '+p.step);
}
const wrap=f=>async req=>({json:f(req),provider:'test',ms:1});
/** A whole level check, every free answer TYPED (mode text), so D4 cannot let it leak into progress. */
async function runCheck(){
 answer=wrap(checkAnswer);await command('check-start');
 for(let i=0;i<3;i++){const k=getSession().check;await command('check-answer',{checkId:k.id,text:'I play games in English every day with my friends.',mode:'text',lastTurnId:k.turns.at(-1).id});}
 for(let guard=0;getSession().check.stage==='tasks';guard++){
  assert(guard<P.MAX_TASKS);const k=getSession().check,t=k.task;
  if(t.kind==='choose'){const right=t.options.indexOf(RIGHT);await command('check-task',{checkId:k.id,taskId:t.id,option:['A1','A2','B1'].includes(t.band)?right:1-right});}
  else await command('check-task',{checkId:k.id,taskId:t.id,text:'I think it was on the bus this morning.',mode:'text'});
 }
 assert.equal(getSession().screen,'linga-verdict');
}

test('D4 1: two unsupported typed replies are "on your own", as two spoken ones are; mixed spoken and typed count together',()=>{
 const typed=mergeEvidence(emptyEnglish(),[ev({mode:'text'}),ev({id:'e2',mode:'text'})]);
 assert.equal(typed.achievements.request,'independent');
 assert.equal(mergeEvidence(emptyEnglish(),[ev(),ev({id:'e2'})]).achievements.request,'independent');
 assert.equal(mergeEvidence(emptyEnglish(),[ev(),ev({id:'e2',mode:'text'})]).achievements.request,'independent');
 // transfer keeps every other condition: three unsupported, two episodes, two scenes
 assert.equal(evidenceProgress([ev({mode:'text'}),ev({id:'e2',mode:'text'}),ev({id:'e3',mode:'text',episodeId:'ep2',sceneId:'team'})],'request'),'transfer');
 assert.equal(evidenceProgress([ev({mode:'text'}),ev({id:'e2',mode:'text'}),ev({id:'e3',mode:'text',sceneId:'team'})],'request'),'independent','one episode only is not transfer');
 // the mode stays on the evidence, so a certificate can say spoken or written
 assert.deepEqual(typed.evidence.map(e=>e.mode),['text','text']);
});
test('D4 2: a picked phrase never counts, a supported typed reply is only "with help", an unsuccessful one is nothing',()=>{
 assert.equal(evidenceProgress([ev({mode:'choice'}),ev({id:'e2',mode:'choice'}),ev({id:'e3',mode:'choice'})],'request'),'not-tried','choice, even unsupported, is not production');
 assert.equal(evidenceProgress([ev({mode:'text',supported:true}),ev({id:'e2',mode:'text',supported:true}),ev({id:'e3',mode:'text',supported:true})],'request'),'with-help');
 assert.equal(evidenceProgress([ev({mode:'text',success:false}),ev({id:'e2',mode:'text',success:false})],'request'),'not-tried');
 assert.equal(evidenceProgress([ev({mode:'text'}),ev({id:'e2',mode:'choice'})],'request'),'with-help','one typed plus a picked phrase is not two');
});
test('D4 3: a level check answered by typing moves no evidence and no progress, and a typed conversation reply does',async()=>{
 seat();const before=getLearner('ema').english;
 await runCheck();
 const after_=getLearner('ema').english;
 assert.equal(after_.evidence.length,before.evidence.length,'a placement task is never evidence');
 assert.deepEqual(after_.achievements,before.achievements);
 // the same learner, a conversation: an unsupported typed reply with a clear, quoted observation is evidence with mode text
 answer=async()=>({json:{title:'Booking',goal:'Fix it.',opening:'Hello, can I help?',supportProvided:false},provider:'test',ms:1});
 await command('start',{sceneId:'booking',replace:true});
 answer=async()=>({json:{reply:'Of course. What name?',supportProvided:false,observations:[{skill:'request',quote:'Could you check my booking',success:true,confidence:'clear',note:'Asked for help.'}]},provider:'test',ms:1});
 await command('turn',{text:'Could you check my booking, please?',mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
 const e=getLearner('ema').english.evidence.at(-1);
 assert.deepEqual([e.mode,e.supported,e.quote],['text',false,'Could you check my booking']);
});

test('record 1: a completed check appends a snapshot (date, band, confidence, source, its sentence; no tasks), and a re-check keeps the first',async()=>{
 seat('jakub');
 assert.deepEqual(getLearner('jakub').english.placements,[]);
 await runCheck();
 let l=getLearner('jakub').english;
 assert.equal(l.placements.length,1);
 const first=l.placements[0];
 assert.deepEqual(Object.keys(first).sort(),['at','band','confidence','source','summary']);
 assert.deepEqual([first.band,first.source,first.summary],[l.placement.band,'check','You get by in everyday talk.']);
 assert.equal(first.at,l.placement.at);
 assert.doesNotMatch(JSON.stringify(l.placements),/task|response|bus this morning|prompt/,'no task content and no answer in the record');
 await runCheck();
 l=getLearner('jakub').english;
 assert.equal(l.placements.length,2,'a re-check appends');
 assert.deepEqual(l.placements[0],first,'the earlier snapshot is kept unchanged');
 assert.equal(l.placement.at,l.placements[1].at,'the live placement is the latest check');
});
test('record 2: a band picked by hand (the TV picker, or Set up) is appended with source "self" and no sentence',async()=>{
 seat('jakub');const n=getLearner('jakub').english.placements.length;
 await command('level-self',{band:'A2'});
 let l=getLearner('jakub').english;
 assert.equal(l.placements.length,n+1);
 assert.deepEqual(l.placements.at(-1),{at:l.placement.at,band:'A2',confidence:'low',source:'self'});
 // Set up: the same band again appends nothing; a changed band is a hand-picked one
 const prefs=l.preferences;
 await command('preferences',{preferences:{...prefs,level:'A2'},notes:[]});
 assert.equal(getLearner('jakub').english.placements.length,n+1,'an unchanged band is not a new pick');
 await command('preferences',{preferences:{...prefs,level:'B2'},notes:[]});
 l=getLearner('jakub').english;
 assert.equal(l.placements.length,n+2);
 assert.deepEqual([l.placements.at(-1).band,l.placements.at(-1).source],['B2','self']);
});
test('record 3: the cap keeps the newest twelve, oldest dropped; junk entries are dropped; numbers clamped; sentences cut',()=>{
 const good=(i,patch={})=>({at:1000+i,band:'B1',confidence:'medium',source:'check',summary:'Fine.',...patch});
 const many=Array.from({length:20},(_,i)=>good(i));
 const kept=P.cleanPlacements(many);
 assert.equal(kept.length,P.PLACEMENTS_CAP);assert.equal(P.PLACEMENTS_CAP,12);
 assert.deepEqual(kept.map(p=>p.at),many.slice(-12).map(p=>p.at),'oldest dropped');
 const junk=[good(1,{band:'Z9'}),good(2,{band:'b1'}),good(3,{confidence:'sure'}),good(4,{source:'model'}),good(5,{at:'1000'}),good(6,{at:NaN}),good(7,{at:Infinity}),good(8,{summary:42}),null,'B1',[],{}];
 assert.deepEqual(P.cleanPlacements(junk),[],'every malformed entry dropped');
 assert.deepEqual(P.cleanPlacements([good(0,{at:-50})])[0].at,0,'a date before the epoch is clamped');
 assert.equal(P.cleanPlacements([good(0,{summary:'x'.repeat(500)})])[0].summary.length,P.SUMMARY_MAX);
 assert.deepEqual(P.cleanPlacements([good(0,{source:'self',summary:'a self pick carries no sentence'})])[0],{at:1000,band:'B1',confidence:'medium',source:'self'});
 assert.deepEqual(P.cleanPlacements([{...good(0),tasks:[{prompt:'x'}],evil:'<script>'}])[0],{at:1000,band:'B1',confidence:'medium',source:'check',summary:'Fine.'},'unknown fields never survive');
 assert.deepEqual(P.cleanPlacements('not a list'),[]);
 // appending past the cap
 let list=[];for(let i=0;i<15;i++)list=P.appendPlacement(list,{at:i,band:'A2',confidence:'high',source:'check',summary:''});
 assert.equal(list.length,12);assert.equal(list[0].at,3);assert.equal('summary' in list[0],false,'an empty sentence is left out');
});
test('record 4: an old learner file (no record) loads unchanged with an empty record; its check placement is NOT back-filled',()=>{
 const placement={at:5,band:'B1',selfBand:null,confidence:'high',source:'check',summary:'You get by.',focus:'Stories',tasks:[]};
 const old=cleanEnglish({placement,evidence:[ev()],achievements:{request:'with-help'}});
 assert.deepEqual(old.placements,[]);
 assert.equal(old.placement.band,'B1');assert.equal(old.evidence.length,1);assert.equal(old.achievements.request,'with-help');
 assert.deepEqual(cleanEnglish(undefined),emptyEnglish());assert.deepEqual(emptyEnglish().placements,[]);
});
test('record 5: a round trip through the learner file keeps the record exactly',()=>{
 seat('ema');
 const placements=[{at:10,band:'A2',confidence:'medium',source:'check',summary:'You handle short exchanges.'},{at:20,band:'B1',confidence:'low',source:'self'}];
 saveEnglish('ema',{...getLearner('ema').english,placements});
 assert.deepEqual(getLearner('ema').english.placements,placements);
 const file=JSON.parse(fs.readFileSync(path.join(data,'learners.json'),'utf8'));
 assert.deepEqual(file.ema.english.placements,placements,'written as JSON, valid');
});
