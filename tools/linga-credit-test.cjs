/** Run with npm run test:rules in desk/ (directly: node tools/linga-credit-test.cjs). Credit is decided in code (lib/english/credit.ts). No live model call; a disposable data directory, never desk/data. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/linga-credit',String(Date.now()));
const {creditOf}=require(path.join(root,'src/lib/english/credit.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts'));
let answer=async()=>({json:{},provider:'test',ms:1});
engine.text=(req)=>answer(req);
const {englishCommand}=require(path.join(root,'src/lib/english/conversation.ts'));
const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
const {getLearner}=require(path.join(root,'src/lib/session/learners.ts'));
after(()=>clearInterval(globalThis.__desk.ticker));
let counter=0;
function command(action,extra={}){const s=getSession();return englishCommand({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:`credit-${++counter}`,...extra});}
function fresh(){dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});}
/** Start `sceneId` with a stubbed opening that offers no support, then reply `text`; the stub observes `observations` of it. */
async function played(sceneId,opening,text,observations,replace=true){
 answer=async()=>({json:{title:'T',goal:'G',opening,supportProvided:false},provider:'test',ms:1});
 await command('start',{sceneId,replace});
 answer=async()=>({json:{reply:'Tell me more.',supportProvided:false,observations},provider:'test',ms:1});
 await command('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
}
const obs=(skill,quote)=>[{skill,quote,success:true,confidence:'clear',note:'Did it.'}];
const evidence=()=>getLearner('ema').english.evidence;

test('credit case 1: a formula alone earns nothing (credit.ts creditOf formula list; conversation.ts:221)',async()=>{
 fresh();await played('meet','Hello, I am Jamie. What is your name?','Yes, thank you',obs('contact','Yes, thank you'));
 assert.equal(evidence().length,0);assert.equal(getSession().conversation.evidence.length,0);
});
test('credit case 2: a request read back from the partner line is stored as helped (credit.ts copiesShown; rules.ts validateObservations)',async()=>{
 fresh();await played('booking','Could you tell me the name on the booking?','Could you tell me the name on the booking',obs('request','Could you tell me the name on the booking'));
 const e=evidence();assert.equal(e.length,1);assert.equal(e[0].supported,true);
 assert.notEqual(getLearner('ema').english.achievements.request,'independent');
 assert.equal(getSession().conversation.turns.find(t=>t.role==='learner').supported,true,'the copied turn is marked supported');
});
test('credit case 3: a repair with no clarifying shape stores nothing (credit.ts REPAIR_MARKERS)',async()=>{
 fresh();await played('rover','Pip beeps. The rover is near a bridge. Do you see it?','I like the blue one',obs('repair','I like the blue one'));
 assert.equal(evidence().filter(e=>e.skill==='repair').length,0);
});
test('credit case 4: a spoken repair with no punctuation is the child\'s own (credit.ts shaped)',async()=>{
 fresh();await played('rover','Pip beeps. The rover is near a bridge. Do you see it?','sorry can you say that again',obs('repair','sorry can you say that again'));
 const e=evidence().filter(x=>x.skill==='repair');assert.equal(e.length,1);assert.equal(e[0].success,true);assert.equal(e[0].supported,false);
});
test('credit case 5: the pure table (credit.ts creditOf)',()=>{
 assert.equal(creditOf('Yes, thanks','contact',[]),'none');
 assert.equal(creditOf('Where did Pip go','repair',[]),'none');
 assert.equal(creditOf('Which bridge do you mean','repair',[]),'own');
 assert.equal(creditOf('Which way should I go','request',['Which way should I go?']),'helped');
 assert.equal(creditOf('I enjoy drawing because it is calm','describe',[]),'own');
});
test('credit case 6: "Yes thank you" in two episodes never reaches on-your-own contact (credit.ts; rules.ts evidenceProgress unchanged)',async()=>{
 fresh();
 await played('meet','Hello, I am Jamie. What is your name?','Yes thank you',obs('contact','Yes thank you'));
 await played('meet','Hi, I am Jamie. Where are you from?','Yes thank you',obs('contact','Yes thank you'));
 assert.equal(getLearner('ema').english.achievements.contact??'not-tried','not-tried');
});
