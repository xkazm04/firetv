/** Run with npm run test:rules in desk/ (directly: node tools/linga-mission-test.cjs). A scene's mission is decided in code (lib/english/mission.ts). No live model call; a disposable data directory, never desk/data. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/linga-mission',String(Date.now()));
const engine=require(path.join(root,'src/lib/engines/text.ts'));
let answer=async()=>({json:{},provider:'test',ms:1});
const prompts=[];
engine.text=(req)=>{prompts.push(JSON.parse(req.prompt));return answer(req);};
const {englishCommand}=require(path.join(root,'src/lib/english/conversation.ts'));
const {ENGLISH_SCENES}=require(path.join(root,'src/lib/english/curriculum.ts'));
const {lingaView,progressDots}=require(path.join(root,'src/lib/english/view.ts'));
const {accepts}=require(path.join(root,'src/lib/english/turn.ts'));
const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
const {getLearner,saveEnglish}=require(path.join(root,'src/lib/session/learners.ts'));
after(()=>clearInterval(globalThis.__desk.ticker));
let counter=0;
function command(action,extra={}){const s=getSession();return englishCommand({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:`mission-${++counter}`,...extra});}
function fresh(){dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});}
const rover=ENGLISH_SCENES.find(x=>x.id==='rover');
async function begin(sceneId,extra={}){
 answer=async()=>({json:{title:'T',goal:'G',opening:'Pip beeps. The rover is near a bridge. Do you see it?',supportProvided:false,...extra},provider:'test',ms:1});
 await command('start',{sceneId,replace:true});
}
/** One reply `text`; the stub returns a partner line and `step` (omitted when undefined). */
async function say(text,step){
 answer=async()=>({json:{reply:'Pip beeps again.',supportProvided:false,observations:[],...(step?{step}:{})},provider:'test',ms:1});
 await command('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
}
const claim=(quote)=>({reached:true,quote});
const mission=()=>getSession().conversation.mission;
const view=()=>lingaView(getSession(),{});

test('mission case 1: a built-in scene starts with its authored steps, none reached, the first dot current (mission.ts missionOf; conversation.ts opening commit)',async()=>{
 fresh();await begin('rover');
 assert.deepEqual(mission().steps,rover.steps);assert.equal(rover.steps.length,3);assert.deepEqual(mission().reached,[]);
 const s=getSession();assert.equal(s.screen,'linga-talk');
 assert.deepEqual(progressDots(s),['current','open','open']);
 const h=view().hero;assert.equal(h.kind,'scene');assert.equal(h.subtitle,rover.steps[0]);
});
test('mission case 2: a reply that quotes itself lights step 1 and the next prompt carries only step 2 (mission.ts applyStep; conversation.ts turn)',async()=>{
 fresh();await begin('rover');
 await say('Where did you see it last?',claim('Where did you see it last'));
 const c=getSession().conversation,learner=c.turns.find(t=>t.role==='learner');
 assert.deepEqual(mission().reached,[{turnId:learner.id,quote:'Where did you see it last'}]);
 assert.deepEqual(progressDots(getSession()),['done','current','open']);
 await say('Which way should I go?');
 const p=prompts.at(-1);assert.equal(p.currentStep,rover.steps[1]);
 const text=JSON.stringify(p);assert.ok(!text.includes(rover.steps[2]),'a later step is never sent');
});
test('mission case 3: a quote not in the reply, or under two words, changes nothing and the turn still lands (mission.ts applyStep)',async()=>{
 fresh();await begin('rover');
 await say('Where did you see it last?',claim('Pip saw it by the bridge'));
 assert.deepEqual(mission().reached,[]);
 await say('Which way?',claim('Which'));
 assert.deepEqual(mission().reached,[]);
 await say('Hello there',{reached:true});
 await say('Hello again',{reached:'yes',quote:42});
 assert.deepEqual(mission().reached,[]);
 assert.equal(getSession().conversation.turns.filter(t=>t.role==='partner').length,5,'every turn landed its partner line');
});
test('mission case 4: one step per reply, in order; a finished mission takes no more (mission.ts applyStep)',async()=>{
 fresh();await begin('rover');
 await say('Where did you see it last?',claim('Where did you see it last'));
 await say('Which way should I go?',claim('Which way should I go'));
 await say('I see a big blue bridge',claim('I see a big blue bridge'));
 assert.equal(mission().reached.length,3);
 assert.deepEqual(progressDots(getSession()),['done','done','done']);
 await say('And I see the rover now',claim('I see the rover now'));
 assert.equal(mission().reached.length,3);
 // a reply lights only one step even when the model claims more
 fresh();await begin('rover');
 await say('Where did you see it? Which way do I go?',claim('Where did you see it'));
 assert.equal(mission().reached.length,1);
});
test('mission case 5: a done mission offers "See what you did" first and a turn is still accepted (view.ts; turn.ts accepts)',async()=>{
 fresh();await begin('rover');
 await say('Where did you see it last?',claim('Where did you see it last'));
 await say('Which way should I go?',claim('Which way should I go'));
 assert.notEqual(view().actions[0].label,'See what you did');
 await say('I see a big blue bridge',claim('I see a big blue bridge'));
 const v=view(),a=v.actions[0];
 assert.equal(a.id,'finish');assert.equal(a.label,'See what you did');assert.ok(!a.disabled);
 assert.ok(/mission/i.test(v.baseCaption)&&v.baseCaption.split(/\s+/).length<=12,v.baseCaption);
 assert.equal(accepts(getSession().conversation,'turn'),true);
});
function planned(){
 fresh();const l=getLearner('ema').english;
 saveEnglish('ema',{...l,plan:{at:1,band:'A2',topics:[{id:'topic-match',title:'The match',goal:'Plan a visit to the match.',why:'x',skill:'negotiate',audience:'all',partner:'Alex · Friend',premise:'A friendly chat.',cue:'Try: Shall we go?',quiz:{question:'Q?',options:['A','B'],correct:0}}]}});
}
test('mission case 6: a scene with no authored steps takes 2-3 valid generated ones, else no mission at all (mission.ts missionOf)',async()=>{
 planned();await begin('topic-match',{steps:['Say hello','Ask about the match','Agree a time']});
 assert.deepEqual(mission().steps,['Say hello','Ask about the match','Agree a time']);assert.deepEqual(mission().reached,[]);
 assert.ok(JSON.stringify(prompts.at(-1)).includes('steps'),'the opening asked for steps');
 planned();await begin('topic-match',{steps:['a','b','c','d']});
 assert.equal(getSession().conversation.mission,undefined);assert.equal(progressDots(getSession()),null);assert.equal(getSession().conversation.turns.length,1);
 planned();await begin('topic-match',{steps:['Say hello','x'.repeat(90)]});
 assert.equal(getSession().conversation.mission,undefined);
 // an authored scene keeps its own steps whatever the opening returns
 fresh();await begin('rover',{steps:['one','two']});assert.deepEqual(mission().steps,rover.steps);
});
const grams=(text)=>{const w=text.toLowerCase().replace(/[^a-z0-9' ]/g,' ').split(/\s+/).filter(Boolean);return new Set(w.slice(0,Math.max(0,w.length-3)).map((_,i)=>w.slice(i,i+4).join(' ')));};
test('mission case 7: no step gives away the cue or the quiz answer, and none is over 48 characters (curriculum.ts steps)',()=>{
 assert.equal(ENGLISH_SCENES.length,11);
 for(const sc of ENGLISH_SCENES){
  assert.equal(sc.steps?.length,3,`${sc.id} has three steps`);
  const hidden=[...grams(sc.cue),...grams(sc.quiz.options[sc.quiz.correct])];
  for(const step of sc.steps){
   assert.ok(step.length<=48,`${sc.id}: "${step}" is ${step.length} characters`);
   const shared=[...grams(step)].filter(g=>hidden.includes(g));
   assert.deepEqual(shared,[],`${sc.id}: "${step}" shares ${shared}`);
  }
 }
});
test('mission case 8: GUARD: a step writes no evidence, and a conversation saved without mission renders as today (view.ts progressDots; conversation.ts)',async()=>{
 fresh();await begin('rover');
 const before=JSON.stringify(getLearner('ema').english.evidence);
 await say('Where did you see it last?',claim('Where did you see it last'));
 assert.equal(JSON.stringify(getLearner('ema').english.evidence),before);assert.equal(getSession().conversation.evidence.length,0);
 // saved before missions: no mission field
 const c=getSession().conversation,{mission:_m,...old}=c;
 dispatch({type:'linga.changed',conversation:old,screen:'linga-talk'});
 const s=getSession();assert.equal(progressDots(s),null);
 const v=view();assert.equal(v.hero.subtitle,old.goal);assert.notEqual(v.actions[0].label,'See what you did');
 assert.ok(!/mission/i.test(v.baseCaption));
});
