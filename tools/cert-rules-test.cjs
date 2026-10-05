/**
 * LINGA CERTIFICATION (Family W10), the rules under it. Part 1: typed evidence counts toward "on your own" (owner
 * decision D4) and every level check is kept in an append-only record (`placements`, placement.ts). What counts is
 * decided by code (rules.ts evidenceProgress): a spoken or typed reply, unsupported, in a conversation; never a picked
 * phrase, never a level-check task. The record keeps date, band, confidence, source and the check's one sentence,
 * never a task or an answer; a band picked by hand is kept as "self"; a re-check never removes an earlier entry.
 * Part 2: the certificate (cert.ts). The base-skill table; the requirement widened by the topics chosen; issue only from
 * the latest check (never "self", never low confidence), only when every required skill is on its own with an own
 * quote that holds; idempotent, append-only, surviving the evidence cap; strict cleaning; issued at a conversation's
 * finish and a check's completion, never at read time; seenIds apart from the certificate; the plate and the phone's
 * words with no digit but the band's and no game word; exactly one focused action; every action a declared view id.
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

// ================================================================== Part 2: the certificate (lib/english/cert.ts)
const C=require(src('lib/english/cert.ts'));
const V=require(src('lib/english/view.ts'));
const {BAND_CAN}=P;
const {BANDS}=require(src('lib/english/types.ts'));
const {ENGLISH_SKILLS}=require(src('lib/english/curriculum.ts'));
const SKILLS=ENGLISH_SKILLS.map(s=>s.id);
const LINES={contact:'Hi, I am Ema and I like drawing.',repair:'Sorry, could you say that again?',request:'Could you check my booking, please?',describe:'I like football because it is fast.',narrate:'First we missed the bus, so we walked.',negotiate:'How about we meet after school?',relate:'I see it differently, but that is fine.',resolve:'I need this part by Friday, can we agree?'};
const topicOf=(id,skill,title)=>({id,title:title??`Topic ${id}`,goal:'Talk about it.',why:'You asked for it.',skill,audience:'all',partner:'Sam · Friend',premise:'A friendly chat.',cue:'Try: I like…',quiz:{question:'Which fits?',options:['I like it.','Yesterday.'],correct:0}});
const check=(band='A2',confidence='high',at=5000)=>({at,band,confidence,source:'check',summary:'You handle short exchanges.'});
/** Two unsupported, successful replies per skill (the first spoken, the second typed and newer), each quote the learner's own. */
function evidenceFor(skills,{mode2='text',supported=false,at=10000}={}){
 return skills.flatMap((skill,i)=>[ev({id:`${skill}-1`,episodeId:'ep1',turnId:`${skill}-t1`,sceneId:'meet',skill,mode:'speech',supported,quote:LINES[skill],at:at+i*10}),
  ev({id:`${skill}-2`,episodeId:'ep2',turnId:`${skill}-t2`,sceneId:'lost',skill,mode:mode2,supported,quote:LINES[skill],at:at+i*10+5})]);
}
/** A learner who has earned the band, with a plan of topics in the given skills. */
function earned({band='A2',plan=['describe','negotiate'],placements=[check(band)],extra=[],ev:evs}={}){
 const topics=plan.map((skill,i)=>topicOf(`p${i}`,skill,`My ${['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','next','next','next','next'][i]} topic`));
 const need=[...new Set([...C.BASE_SKILLS[band],...plan,...extra])];
 return mergeEvidence({...emptyEnglish(),placements,plan:topics.length?{at:1,band,topics}:null},evs??evidenceFor(need));
}
const FORBIDDEN=/points?\b|score|streak|level up|badge|reward|percent|%|\bxp\b|trophy|\bwin\b|rank/i;
const withoutBand=(text,band)=>text.split(band).join('');

test('cert 1: BASE_SKILLS covers the six bands, known skills only, 3 to 8 each, each band holding the one below; each row cites its can-do line',()=>{
 assert.deepEqual(Object.keys(C.BASE_SKILLS),[...BANDS]);
 let below=[];
 for(const b of BANDS){
  const row=C.BASE_SKILLS[b];
  assert(row.every(s=>SKILLS.includes(s)),`${b}: known skills`);assert.equal(new Set(row).size,row.length,`${b}: no repeats`);
  assert(row.length>=3&&row.length<=8,`${b}: ${row.length} skills`);
  assert(below.every(s=>row.includes(s)),`${b} keeps every skill of the band below`);
  below=row;
 }
 const source=fs.readFileSync(src('lib/english/cert.ts'),'utf8');
 for(const b of BANDS)assert(source.includes(`// ${b} "${BAND_CAN[b]}"`),`${b}'s row cites BAND_CAN verbatim`);
 assert.match(source,/A TEACHER MUST READ THIS\s+\* TABLE/);
 assert.deepEqual(C.BASE_SKILLS.A1,['contact','repair','request']);
});
test('cert 2: the requirement is the base widened by the skills of the topics chosen; a custom topic counts by its skill; never more than eight',()=>{
 const base=earned({plan:[]});assert.deepEqual(C.requirementFor(base),C.BASE_SKILLS.A2);
 const same=earned({plan:['contact','describe']});assert.deepEqual(C.requirementFor(same),C.BASE_SKILLS.A2,'topics in base skills widen nothing');
 const wide=earned({plan:['narrate','resolve','describe']});
 assert.deepEqual(C.requirementFor(wide),['contact','repair','request','describe','narrate','resolve'],'in the order of the eight');
 // a topic the learner asked for in their own words (plan-add) or swapped in is a PlanTopic like any other
 const custom={...wide,plan:{...wide.plan,topics:[...wide.plan.topics,topicOf('mine','relate','A logistics job interview')]}};
 assert(C.requirementFor(custom).includes('relate'));
 const all=earned({band:'A1',plan:SKILLS.concat(SKILLS)});assert.equal(C.requirementFor(all).length,8,'capped at the eight skills');
 assert.deepEqual(C.requirementFor({...emptyEnglish()}),[],'no band, no requirement');
});
test('cert 3: issued when every required skill is on its own, spoken or typed; the snapshot keeps band, topics, mode and one own quote per skill',()=>{
 const l=earned({plan:['describe','narrate']});
 const c=C.issue(l,Date.UTC(2026,8,30,12));
 assert(c,'issued');
 assert.equal(c.band,'A2');assert.equal(c.checkAt,5000);
 assert.deepEqual(c.topics,['My first topic','My second topic']);
 assert.deepEqual(c.skills.map(s=>s.skill),['contact','repair','request','describe','narrate']);
 for(const s of c.skills){assert.equal(s.quote,LINES[s.skill]);assert.equal(s.mode,'written','the newest own reply for each skill was typed');}
 const spoken=C.issue(earned({plan:['describe','narrate'],ev:evidenceFor([...C.BASE_SKILLS.A2,'narrate'],{mode2:'speech'})}),1);
 assert(spoken.skills.every(s=>s.mode==='spoken'));
 assert.deepEqual(Object.keys(c).sort(),['at','band','checkAt','id','skills','topics'],'no count, score, percent or streak field');
 assert.deepEqual(Object.keys(c.skills[0]).sort(),['at','mode','quote','skill']);
});
test('cert 4: never from a band picked by hand, a low-confidence check, or an older stronger check',()=>{
 assert.equal(C.issue(earned({placements:[check('A2'),{at:6000,band:'A2',confidence:'low',source:'self'}]}),1),null,'the latest is self: the older check does not count');
 assert.equal(C.issue(earned({placements:[check('A2','low')]}),1),null,'low confidence');
 assert.equal(C.issue(earned({placements:[]}),1),null,'no record of a check');
 assert.equal(C.issue(earned({placements:[check('B1','high',1),check('A2','low',2)]}),1),null,'an older B1 does not certify when the latest check is low');
 const stepDown=C.issue(earned({placements:[check('B1','high',1),check('A2','medium',2)]}),1);
 assert.equal(stepDown.band,'A2','the latest check names the band, never an older stronger one');
 // a live placement from before W10 is not in the record, so it cannot certify (no back-fill)
 const old=earned({placements:[]});old.placement={at:1,band:'A2',selfBand:null,confidence:'high',source:'check',summary:'',focus:'',tasks:[]};
 assert.equal(C.issue(old,1),null);
});
test('cert 5: not issued while one required skill is only with help, or only shown by picking a phrase',()=>{
 const need=[...C.BASE_SKILLS.A2];
 const helped=[...evidenceFor(need.filter(s=>s!=='repair')),...evidenceFor(['repair'],{supported:true})];
 assert.equal(C.issue(earned({plan:['describe'],ev:helped}),1),null,'repair only with help');
 const picked=[...evidenceFor(need.filter(s=>s!=='repair')),...['c1','c2','c3'].map(id=>ev({id,skill:'repair',mode:'choice',supported:false,quote:LINES.repair}))];
 assert.equal(C.issue(earned({plan:['describe'],ev:picked}),1),null,'repair only by picking a phrase');
 assert(C.issue(earned({plan:['describe']}),1),'and with both on its own, issued');
});
test('cert 6: idempotent for a band and a requirement; a wider plan later earns a new one for the same band; nothing is ever removed',()=>{
 let l=earned({plan:['describe']});
 const first=C.withCertificate(l,100);assert(first.cert);l=first.learning;
 assert.equal(C.withCertificate(l,200).cert,null,'the same band and the same requirement: not again');
 assert.equal(C.withCertificate(l,200).learning,l,'untouched when nothing is earned');
 // the learner agrees a plan with a narrate topic, and shows it on their own
 l=mergeEvidence({...l,plan:{at:2,band:'A2',topics:[...l.plan.topics,topicOf('p9','narrate','A trip that went wrong')]}},evidenceFor(['narrate'],{at:20000}));
 const second=C.withCertificate(l,300);assert(second.cert,'a widened requirement, met: a new certificate');
 assert.deepEqual(second.learning.certificates.map(c=>c.band),['A2','A2']);
 assert.deepEqual(second.learning.certificates[0],first.cert,'the first is unchanged');
 // a later, lower check never takes a certificate away
 const lower={...second.learning,placements:[...second.learning.placements,check('A1','high',9000)]};
 assert.equal(cleanEnglish(lower).certificates.length,2);
 assert.equal(C.issue(lower,400).band,'A1','a check at another band can earn that band');
 // the cap: twelve kept, the oldest dropped
 let many={...second.learning};for(let i=0;i<15;i++)many={...many,certificates:[...many.certificates,{...first.cert,id:'c'+i}].slice(-C.CERT_CAP)};
 assert.equal(cleanEnglish(many).certificates.length,C.CERT_CAP);
});
test('cert 7: a quote that is not in the learner\'s own reply blocks the certificate (a tampered record); the real reply lets it through',()=>{
 const l=earned({plan:['describe']});
 const tampered={...l,evidence:l.evidence.map(e=>e.skill==='repair'?{...e,quote:'I never said this'}:e)};
 const words=Object.fromEntries(l.evidence.filter(e=>e.skill==='repair').map(e=>[e.turnId,LINES.repair]));
 assert.equal(C.issue(tampered,1,words),null,'both repair quotes fail against the replies as sent');
 assert(C.issue(l,1,words),'the true quotes pass');
 assert.equal(C.quoteOk({quote:'   ',turnId:'x'}),false);assert.equal(C.quoteOk({quote:'x'.repeat(241),turnId:'x'}),false);
 assert.equal(C.quoteOk({quote:'...',turnId:'x'}),false,'no letter, no words');assert.equal(C.quoteOk({quote:'Hi\u0007there',turnId:'x'}),false);
 // a digit is never the one quote shown when a line without one exists
 const digits=mergeEvidence(l,[ev({id:'d1',skill:'describe',mode:'text',quote:'I have 2 cats and I love them.',at:99999,turnId:'dt'})]);
 const c=C.issue(digits,1);assert.equal(c.skills.find(s=>s.skill==='describe').quote,LINES.describe);
});
test('cert 8: the snapshot survives the evidence cap: 400 newer pieces push its evidence out, the certificate is unchanged',()=>{
 const got=C.withCertificate(earned({plan:['describe']}),100);
 let l=got.learning;
 const flood=Array.from({length:420},(_,i)=>ev({id:'f'+i,skill:'contact',mode:'choice',quote:'Hello.',at:50000+i}));
 l=mergeEvidence(l,flood);
 assert.equal(l.evidence.length,400);assert(!l.evidence.some(e=>e.skill==='repair'),'the repair evidence is gone');
 const back=cleanEnglish(JSON.parse(JSON.stringify(l)));
 assert.deepEqual(back.certificates,[got.cert],'kept whole through the file');
 assert.equal(C.issue(back,200),null,'and never issued twice');
});
test('cert 9: cleanEnglish keeps good certificates, drops junk ones whole, strips unknown fields; old files load empty; seen ids point at kept ones',()=>{
 const good=C.issue(earned({plan:['describe']}),Date.UTC(2026,8,30));
 const bad=[{...good,id:'b1',band:'Z9'},{...good,id:'b2',skills:[{...good.skills[0],skill:'juggle'}]},{...good,id:'b3',skills:[{...good.skills[0],mode:'sung'}]},
  {...good,id:'b4',skills:[{...good.skills[0],quote:'   '}]},{...good,id:'b5',at:NaN},{...good,id:'b6',topics:'not a list'},{...good,id:'b7',skills:[]},{...good,id:'b8',checkAt:'yesterday'},
  {...good,id:good.id},{...good,id:'b9',topics:[42]},null,'cert',[]];
 const l=cleanEnglish({certificates:[good,...bad,{...good,id:'b10',score:99,points:3,topics:['  Spaced title  ','x'.repeat(200)],skills:[...good.skills,{...good.skills[0]}]}],seenIds:[good.id,'b1','ghost',7]});
 assert.deepEqual(l.certificates.map(c=>c.id),[good.id,'b10']);
 assert.deepEqual(l.certificates[0],good);
 const tidy=l.certificates[1];
 assert.equal('score' in tidy||'points' in tidy,false,'unknown fields never survive');
 assert.deepEqual(tidy.topics,['Spaced title','x'.repeat(C.TITLE_MAX)]);assert.equal(tidy.skills.length,good.skills.length,'one entry per skill');
 assert.deepEqual(l.seenIds,[good.id],'seen ids only for certificates kept');
 const old=cleanEnglish({evidence:[],placement:null});assert.deepEqual([old.certificates,old.seenIds],[[],[]]);
});

// ---- through the desk: where a certificate is issued, and where it is not
const PROFILE_ID='ema';
function prime(learning){seat(PROFILE_ID);saveEnglish(PROFILE_ID,learning);seat(PROFILE_ID);}
test('cert 10: finishing a conversation issues it, checked against tonight\'s replies; a tampered stored quote blocks it; reading the record never issues',async()=>{
 // A1, a plan with a request topic; contact and repair already on their own from earlier evenings, request not yet
 const run=async(tamper)=>{
  prime(mergeEvidence({...emptyEnglish(),placements:[check('A1','high')],plan:{at:1,band:'A1',topics:[topicOf('p0','request','Lost and found')]}},evidenceFor(['contact','repair'])));
  assert.equal(getLearner(PROFILE_ID).english.certificates.length,0,'loading the record issues nothing');
  assert.notEqual(V.lingaView({...getSession(),screen:'linga'}).actions[0].id,'your-certificate','nor does drawing home');
  answer=async()=>({json:{title:'Booking',goal:'Fix it.',opening:'Hello, can I help?',supportProvided:false},provider:'test',ms:1});
  await command('start',{sceneId:'booking',replace:true});
  for(const text of ['Could you check my booking, please?','Could you check the date for me?']){
   answer=async()=>({json:{reply:'Of course. What else?',supportProvided:false,observations:[{skill:'request',quote:'Could you check',success:true,confidence:'clear',note:'Asked.'}]},provider:'test',ms:1});
   await command('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
  }
  if(tamper){const l=getLearner(PROFILE_ID).english;saveEnglish(PROFILE_ID,{...l,evidence:l.evidence.map(e=>e.skill==='request'?{...e,quote:'Please give me a free room'}:e)});}
  answer=async()=>{throw new Error('finish asks no model');};
  await command('finish');
  return getLearner(PROFILE_ID).english;
 };
 const ok=await run(false);
 assert.equal(ok.certificates.length,1);assert.equal(ok.certificates[0].band,'A1');
 assert.deepEqual(ok.certificates[0].skills.map(s=>[s.skill,s.mode]),[['contact','written'],['repair','written'],['request','written']]);
 assert.equal(ok.certificates[0].skills[2].quote,'Could you check');
 assert.deepEqual(ok.certificates[0].topics,['Lost and found']);
 const blocked=await run(true);
 assert.equal(blocked.certificates.length,0,'a quote not in the reply as sent issues nothing');
});
test('cert 11: a level check that completes can issue from evidence already held; a band picked by hand never does',async()=>{
 prime(mergeEvidence({...emptyEnglish()},evidenceFor(C.BASE_SKILLS.B1)));
 await command('level-self',{band:'B1'});
 assert.equal(getLearner(PROFILE_ID).english.certificates.length,0,'self: never');
 await runCheck();
 const l=getLearner(PROFILE_ID).english;
 assert.equal(l.placements.at(-1).source,'check');
 assert.equal(l.certificates.length,1);assert.equal(l.certificates[0].band,l.placements.at(-1).band);
 assert.equal(l.certificates[0].checkAt,l.placements.at(-1).at);
});
test('cert 12: opening marks it seen in seenIds and never edits the certificate; home offers the door once per new certificate',async()=>{
 const got=C.withCertificate(earned({plan:['describe']}),Date.UTC(2026,8,30));
 prime({...got.learning,placement:{at:5000,band:'A2',selfBand:null,confidence:'high',source:'check',summary:'',focus:'',tasks:[]}});
 dispatch({type:'nav',screen:'linga'});
 let v=V.lingaView(getSession());
 assert.equal(v.actions[0].id,'your-certificate','the new certificate is home\'s first door');assert.equal(v.actions.length,2);
 assert.equal(v.hero.art,'cert');
 const before=JSON.stringify(getLearner(PROFILE_ID).english.certificates);
 await command(v.actions[0].run.command.action,v.actions[0].run.command.extra);
 assert.equal(getSession().screen,'linga-cert');
 const l=getLearner(PROFILE_ID).english;
 assert.deepEqual(l.seenIds,[got.cert.id]);assert.equal(JSON.stringify(l.certificates),before,'the certificate itself is untouched');
 dispatch({type:'nav',screen:'linga'});
 assert.notEqual(V.lingaView(getSession()).actions[0].id,'your-certificate','seen: the door is gone');
 // a second, new certificate brings the door back, once
 const next=C.issue({...l,placements:[...l.placements,check('A1','high',7000)]},Date.UTC(2026,9,2));
 assert(next,'an A1 certificate');
 saveEnglish(PROFILE_ID,{...l,certificates:[...l.certificates,next]});seat(PROFILE_ID);dispatch({type:'nav',screen:'linga'});
 assert.equal(V.lingaView(getSession()).actions[0].id,'your-certificate');
 await assert.rejects(command('cert-open',{certId:'no-such-cert'}),e=>e.status===404);
});
/** The plate as the TV draws it, in words: everything the screen model puts on the stage. */
function plateText(v){return [v.tag,v.title,v.captionTag,v.caption,JSON.stringify(v.hero),...v.actions.map(a=>`${a.label} ${a.help}`),...v.footer.map(a=>a.label)].join('\n');}
test('cert 13: the plate carries no digit but the band\'s, no game word, one caption sentence without a dash, and exactly one focused action',()=>{
 for(const plan of [['describe'],['describe','narrate','resolve','relate','negotiate','request']]){
  const got=C.withCertificate(earned({plan}),Date.UTC(2026,8,30));
  for(const certs of [[got.cert],[{...got.cert,id:'older',band:'A1'},got.cert]]){
   const s={...getSession(),screen:'linga-cert',focus:0,conversation:null,check:null,englishLearning:{...got.learning,certificates:certs}};
   const v=V.lingaView(s);
   assert.equal(v.hero.kind,'cert');assert.equal(v.title,'A2 Everyday basics');
   const text=plateText(v)+'\n'+V.viewText(v);
   assert.doesNotMatch(withoutBand(text,'A2'),/\d/,`no digit but the band's:\n${text}`);
   assert.doesNotMatch(text,FORBIDDEN);assert.doesNotMatch(text,/—/,'no em dash');
   assert.match(v.caption,/^Issued from what you (said and wrote|said|wrote), not from an exam[.]$/);
   assert.equal(v.caption.split(/[.!?](?:\s|$)/).filter(x=>x.trim()).length,1,'one sentence in the caption slot');
   assert.equal(v.actions.filter((a,i)=>i===s.focus&&!a.disabled).length,1,'one focused action');
   assert.deepEqual(v.actions.map(a=>a.id),certs.length>1?['certificate-back','earlier-certificates']:['certificate-back']);
   assert(v.hero.topics.length<=C.PLATE_TOPICS);
   assert(v.hero.quote&&Object.values(LINES).includes(v.hero.quote.text),'one of the learner\'s own lines');
   assert.equal(v.hero.skills.length,C.requirementFor(got.learning).length);assert(v.hero.skills.every(x=>['spoken','written'].includes(x.mode)));
  }
 }
});
test('cert 14: the list names each certificate by band and date in words, one door each, newest first; every action is a declared view id',()=>{
 const got=C.withCertificate(earned({plan:['describe']}),new Date(2026,8,30,12).getTime());
 const older={...got.cert,id:'older',band:'A1',at:new Date(2026,5,12,12).getTime()};
 const base={...getSession(),focus:0,conversation:null,check:null,englishLearning:{...got.learning,certificates:[older,got.cert]}};
 const list=V.lingaView({...base,screen:'linga-certs'});
 assert.deepEqual(list.actions.map(a=>a.label),['A2 Everyday basics · 30 September','A1 First words · 12 June','Back to Linga']);
 assert.doesNotMatch(plateText(list),FORBIDDEN);
 for(const screen of ['linga-cert','linga-certs','linga'])for(const ui of [{},{menu:true}]){
  const v=V.lingaView({...base,screen},ui);
  for(const a of V.offeredActions(v))assert(V.VIEW_ACTION_IDS.includes(a.id),`${screen}: ${a.id}`);
 }
 const menu=V.lingaView({...base,screen:'linga'},{menu:true});
 assert(menu.actions.some(a=>a.id==='my-certificate'&&a.run.command.action==='cert-open'),'the menu reaches it');
 // REVISED on purpose (linga-B, owner-approved): it used to pin "says nothing before there is one". The door now
 // opens for any learner with a record of checks, and runs a nav to the outline of the certificate when none is held;
 // a learner with no record of a check still has no door.
 const held0={...got.learning,certificates:[]};
 const none=V.lingaView({...base,screen:'linga',englishLearning:{...held0,placements:[]}},{menu:true});
 assert(!none.actions.some(a=>a.id==='my-certificate'),'no record of a check, no door');
 const outline=V.lingaView({...base,screen:'linga',englishLearning:held0},{menu:true}).actions.find(a=>a.id==='my-certificate');
 assert(outline&&outline.run.nav&&outline.run.nav.screen==='linga-cert'&&!outline.run.command,'a record of checks and no certificate: the door goes to the outline');
 assert.equal(V.lingaView({...base,screen:'linga-cert'},{cert:'older'}).title,'A1 First words','an earlier one opens by id');
});
test('cert 15: the phone\'s My map says the certificate in words (band, topics, skills with spoken or written, one quote) with no count',()=>{
 const got=C.withCertificate(earned({plan:['describe','narrate']}),Date.UTC(2026,8,30,12));
 const words=C.certWords(got.cert);
 assert.equal(words[0],'Certificate · A2 Everyday basics');
 assert(words.some(w=>w.startsWith('Your topics: My first topic, My second topic')));
 assert(words.some(w=>/Make contact \(written\)/.test(w)));
 assert(words.some(w=>/^In your own words, .+: “.+”$/.test(w)));
 const all=words.join('\n');
 assert.doesNotMatch(withoutBand(all,'A2'),/\d/,'no digit, no count');assert.doesNotMatch(all,FORBIDDEN);assert.doesNotMatch(all,/—/);
 const phone=fs.readFileSync(src('english/LingaPhone.tsx'),'utf8');
 assert.match(phone,/certWords\(latest\)/,'the phone reads the same words');
 const part=phone.slice(phone.indexOf('function CertificateWords'),phone.indexOf('/** Finding the level'));
 assert.doesNotMatch(part,/\.length\}|\{held\.length|of \{/,'the phone prints no count of certificates');
});



// ================================================================== linga-B: the certificate shows what it still needs
const {recommendScene,planScenes,ENGLISH_SCENES}=require(src('lib/english/curriculum.ts'));
/** the next scene as the desk now picks it; before linga-B this is the plain recommendation (so the GUARD case is green before) */
const nextScene=(p,l)=>C.recommendFor?C.recommendFor(p,l):recommendScene(p,l);
const PLACED=(band,confidence='medium',source='check')=>({at:5000,band,selfBand:null,confidence,source,summary:'',focus:'',tasks:[]});
const sessionsFor=(topics)=>topics.map((t,i)=>({id:`s${i}`,sceneId:t.id,title:t.title,at:20000+i,turns:5}));
/** B1, a medium-confidence check, a six-topic plan over contact, request, describe, narrate, describe, request (all started), those four skills on their own */
function gapLearner({started=6,band='B1',confidence='medium',source='check'}={}){
 const plan=['contact','request','describe','narrate','describe','request'];
 const l=earned({band,plan,placements:[{at:5000,band,confidence,source,summary:'You get by.'}],ev:evidenceFor(['contact','request','describe','narrate'])});
 return {...l,placement:PLACED(band,confidence,source),sessions:sessionsFor(l.plan.topics.slice(0,started))};
}
const wordCount=(text)=>text.split(/\s+/).filter(Boolean).length;
const oneSentence=(text)=>text.split(/[.!?](?:\s|$)/).filter(x=>x.trim()).length===1;
const certScreen=(l,extra={})=>V.lingaView({...getSession(),screen:'linga-cert',focus:0,conversation:null,check:null,englishLearning:l,...extra});

test('cert 16: certGap of a B1 learner who has shown four of the six skills names the band, the four shown and the two open',()=>{
 assert.equal(typeof C.certGap,'function','certGap exists');
 assert.deepEqual(C.certGap(gapLearner()),{band:'B1',blocker:null,shown:['contact','request','describe','narrate'],open:['repair','negotiate']});
});
test('cert 17: certGap blockers: a hand-picked band is "self", a low-confidence check "low", no record "no-check"; a held certificate leaves nothing open',()=>{
 assert.equal(typeof C.certGap,'function','certGap exists');
 const own=['contact','repair','request','describe','narrate','negotiate'];
 assert.equal(C.certGap(gapLearner({source:'self',confidence:'low'})).blocker,'self');
 assert.equal(C.certGap(gapLearner({confidence:'low'})).blocker,'low');
 assert.equal(C.certGap({...gapLearner(),placements:[],placement:null}).blocker,'no-check');
 const blocked=C.certGap(gapLearner({source:'self',confidence:'low'}));
 assert.deepEqual([blocked.band,blocked.shown,blocked.open],['B1',[],[]],'a blocker leaves no slots to fill');
 const got=C.withCertificate(earned({band:'B1',plan:['describe'],ev:evidenceFor(own)}),Date.UTC(2026,8,30));
 assert(got.cert,'a B1 certificate');
 const held=C.certGap(got.learning);
 assert.deepEqual([held.blocker,held.open],[null,[]],'already held for that band and requirement: nothing open');
});
test('cert 18: the next scene for that learner practises a skill the certificate still needs, not plan topic one again',()=>{
 const l=gapLearner();
 assert.equal(recommendScene(undefined,l).id,'p0','the plain recommendation is the first topic again');
 const next=nextScene(undefined,l);
 assert(['repair','negotiate'].includes(next.skill),`got ${next.id} (${next.skill})`);
 assert(ENGLISH_SCENES.some(x=>x.id===next.id)||planScenes(l).some(x=>x.id===next.id),'a scene the desk can start');
});
test('cert 19 GUARD: an unstarted plan topic still leads whatever the gap, and a learner with no check gets the plain recommendation',()=>{
 const l=gapLearner({started:5});
 assert.equal(nextScene(undefined,l).id,'p5','the unstarted topic first');
 const none={...gapLearner(),placements:[],placement:null};
 assert.deepEqual(nextScene(undefined,none),recommendScene(undefined,none),'no check, today\'s recommendation');
 const self=gapLearner({source:'self',confidence:'low'});
 assert.deepEqual(nextScene(undefined,self),recommendScene(undefined,self),'a blocked certificate steers nothing');
});
test('cert 20: the certificate screen with none held draws the plate in outline: the shown skills with how, the open ones as empty slots, one sentence, one focused action, no figure but the band',()=>{
 const v=certScreen(gapLearner());
 assert.equal(v.hero.kind,'cert');assert.equal(v.title,'B1 Getting by');
 assert.deepEqual(v.hero.open,['Understand and repair','Make a plan']);
 assert.deepEqual(v.hero.skills.map(x=>x.name),['Make contact','Get something done','Share your world','Tell what happened']);
 assert(v.hero.skills.every(x=>['spoken','written'].includes(x.mode)));
 assert(v.hero.quote===null,'no quote on an outline: nothing is issued');
 assert(wordCount(v.caption)<=25&&oneSentence(v.caption),`one sentence of at most 25 words: ${v.caption}`);
 const text=plateText(v)+'\n'+V.viewText(v);
 assert.doesNotMatch(withoutBand(text,'B1'),/\d/,`no digit but the band's:\n${text}`);
 assert.doesNotMatch(text,FORBIDDEN);assert.doesNotMatch(text,/—/);assert.doesNotMatch(text,/\bcount/i);
 assert.equal(v.actions.filter((a,i)=>i===0&&!a.disabled).length,1,'one focused action');
 for(const a of V.offeredActions(v))assert(V.VIEW_ACTION_IDS.includes(a.id),a.id);
});
test('cert 21: a hand-picked band gets the plate with no slots, one sentence that a certificate rests on a level check taken with Linga, and Find my level; the menu door opens for it',()=>{
 const l=gapLearner({source:'self',confidence:'low'});
 const v=certScreen(l);
 assert.equal(v.hero.kind,'cert');assert.deepEqual([v.hero.open,v.hero.skills],[[],[]]);
 assert(wordCount(v.caption)<=25&&oneSentence(v.caption)&&/certificate rests on a level check/.test(v.caption)&&/Linga/.test(v.caption),v.caption);
 assert.equal(v.actions[0].id,'find-level');assert.equal(v.actions[0].run.command.action,'check-start');
 assert.doesNotMatch(withoutBand(plateText(v),'B1'),/\d/);assert.doesNotMatch(plateText(v),FORBIDDEN);
 for(const learner of [l,gapLearner()]){
  const menu=V.lingaView({...getSession(),screen:'linga',focus:0,conversation:null,check:null,englishLearning:learner},{menu:true});
  const door=menu.actions.find(a=>a.id==='my-certificate');
  assert(door&&door.run.nav&&door.run.nav.screen==='linga-cert','the menu door runs a nav to the certificate screen');
 }
});
test('cert 22: the plan-done home\'s "Talk again" starts a scene for an open skill, and the caption is that scene\'s goal',()=>{
 const l=gapLearner();
 const v=V.lingaView({...getSession(),screen:'linga',focus:1,conversation:null,check:null,englishLearning:l});
 assert.equal(v.home,'plan-done');
 const again=v.actions.find(a=>a.id==='talk-again');
 const scene=[...planScenes(l),...ENGLISH_SCENES].find(x=>x.id===again.run.command.extra.sceneId);
 assert(scene&&C.certGap&&C.certGap(l).open.includes(scene.skill),`talk again starts ${scene&&scene.id}`);
 assert.equal(v.caption,scene.goal);
});
