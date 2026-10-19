/** Run with npm run test:rules in desk/ (directly: node tools/linga-moment-test.cjs). Code only: no model call, no desk/data. */
const path=require('node:path'),assert=require('node:assert/strict'),{test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/linga-moment',String(Date.now()));
const {momentAllowed}=require(path.join(root,'src/lib/english/conversation.ts'));
const {fossilOf,slipsAgain}=require(path.join(root,'src/lib/english/review.ts'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);});

const learner=(n,text)=>({id:`t${n}`,role:'learner',text});
const partner=(n,text)=>({id:`p${n}`,role:'partner',text});
const fix=(turnId,said,better)=>({id:`${turnId}:moment`,kind:'fix',said,better,why:'x',turnId,at:1});
function scene(level,lines,moments){
  const turns=[];lines.forEach((l,i)=>{turns.push(learner(i,l));turns.push(partner(i,'Okay, tell me more.'))});
  return {preferences:{correction:'as-needed',level},turns,moments};
}
const MARTIN='I think he don\'t agree with the plan.',ONDREJ='This train is more better than the bus.';

test('a fossil (martin: he don\'t agree) found by code stops one turn after a moment, inside the gap',()=>{
  const c=scene('B1',['I think he don\'t agree.','What do you mean?'],[fix('t0','he don\'t agree','he doesn\'t agree')]);
  assert.equal(momentAllowed(c),false,'the plain gap is not met');
  assert.equal(momentAllowed(c,true),true,'a repeated slip may stop inside the gap');
  const again=slipsAgain(MARTIN,c,[]);
  assert.ok(fossilOf(MARTIN,c,again),'the repeat is a fossil');
});

test('ondrej: more better said twice is a fossil with no moment yet, and only a repeat is let through',()=>{
  const c=scene('B1',['The bus is more better.','Yes, a long way.'],[]);
  const f=fossilOf(ONDREJ,c,slipsAgain(ONDREJ,c,[]));
  assert.ok(f);assert.equal(f.better,'better');
  assert.equal(momentAllowed(c),true);
});

test('the cap holds even for a repeat, and the beginner cap is lower than the adult one',()=>{
  const m=(n)=>Array.from({length:n},(_,i)=>fix(`t${i}`,'he don\'t agree','he doesn\'t agree'));
  const lines=['a','b','c','d','e'];
  assert.equal(momentAllowed(scene('A1',lines,m(2)),true),false);
  assert.equal(momentAllowed(scene('A1',lines,m(1)),true),true);
  assert.equal(momentAllowed(scene('B1',lines,m(2)),true),true);
  assert.equal(momentAllowed(scene('B1',lines,m(3)),true),true);
  assert.equal(momentAllowed(scene('B1',lines,m(4)),true),false);
  const off=scene('B1',lines,[]);off.preferences.correction='never';
  assert.equal(momentAllowed(off,true),false);
});

test('the moment task: a beginner may stop on a repeated grammar slip; B1 and above must stop on a basic error; no new categories',()=>{
  const {momentTaskFor}=require(path.join(root,'src/lib/english/conversation.ts'));
  const a=momentTaskFor(true),b=momentTaskFor(false);
  assert.ok(!/stop only for a word or phrase/.test(a));
  assert.match(a,/grammar slip is a stop for a beginner only when they have made it more than once/);
  assert.match(b,/at B1 and above, a basic error their level should already control/);
  assert.ok(!/beginner/.test(b));
  for(const t of [a,b])assert.match(t,/Never stop for a valid alternative, a style or register choice/);
});

// ---- LG-23 Option 1, save fixes for the end (delegate ruling 2026-10-17): the limiter rows of
// uat/runs/2026-10-17-lt-swap-2/recert-3/limiter.md, replayed on the gate as it runs, with the tutor's fix as the model gave it
const C=require(path.join(root,'src/lib/english/conversation.ts'));
const {keywordAudience}=require(path.join(root,'src/lib/english/gate.ts'));
/** the audience gate for a learner who is not an adult (gate.ts keywordAudience, as conversation.ts audienceFor holds it) */
const minorSafe=x=>{const a=keywordAudience(x);return a!==null&&a!=='adult';};
/** A transcript as the run kept it: partner first, then learner and partner lines in turn; moments on the named learner lines. */
function run(level,partnerOpening,pairs,moments){
  const turns=[{id:'p0',role:'partner',text:partnerOpening}];
  pairs.forEach(([l,p],i)=>{turns.push(learner(i+1,l));if(p)turns.push(partner(i+1,p));});
  return {preferences:{correction:'as-needed',level},turns,moments};
}
/** The gate exactly as englishCommand runs it on a turn (conversation.ts): stopsRepeat, the fossil, mayStop. */
function gate(c,reply){
  const stopsRepeat=C.momentAllowed(c,true),fossil=stopsRepeat?fossilOf(reply,c,slipsAgain(reply,c,[])):null;
  return {fossil,mayStop:stopsRepeat&&(!!fossil||C.momentAllowed(c))};
}
/** What the turn kept before LG-23 for the same model output: a moment only where mayStop, nothing otherwise. */
const before=(g,o)=>g.mayStop?C.momentOutcome(o.c,{...o,...g}).moment:null;
const word=(turnId,said,better)=>({...fix(turnId,said,better),kind:'word'});

// ondrej-16 J3 L3 (limiter row 6, class A gap): B1, 0 learner turns since the L2 moment
const ONDREJ_L3='maybe on saturday? I have no school then, so we can play more long. after I finish my football training';
const ondrej=()=>run('B1','Hey! Ranked matches tonight? I\'m thinking we play all night, like until the sun comes up. What do you think?',[
  ['all night? no way man, I have school tomorrow and my mom will kill me. I can play only to ten maybe','That\'s so early! Fine, but can we finish one more match first?'],
  ['ok one more match is fine. but only two matches after, then I must go. I don\'t want my mom be angry','Deal, two matches after this one! So when can we play next time?'],
],[fix('t2','I don\'t want my mom be angry','I don\'t want my mom to be angry')]);
// martin-45 J3 L3 (limiter row 1, class A gap): B2, 0 learner turns since the L2 moment
const MARTIN_L3='On our side the owner will be Petr, he is our logistic coordinator. He don\'t have a problem to prepare the summary until Friday, but we need from you the new delivery date. Can you confirm it today, please?';
const martin=()=>run('B2','Hi, thanks for setting this up. Our packaging summary is late, and I know your director also wants to talk about quality. Where would you like to start?',[
  ['Hello Elena, thank you for coming. I think we should start with the packaging summary, because this delay is making a problem for our production.','Ten minutes each sounds fair to me. What is the biggest effect of this delay on your production?'],
  ['The biggest effect is that we was waiting for your packaging material already two weeks, so our line is staying idle.','Two weeks with your line stopped is serious. Who on our side should take the packaging summary?'],
],[fix('t2','we was waiting for your packaging material already two weeks','we have been waiting for your packaging material for two weeks')]);
// tomas-9 J3 L7 (limiter row 21, class A cap): A1, two word moments (L1, L5), the A1 cap
const TOMAS_L7='Rex. My dog Rex. Je to brown dog';
const tomas=()=>run('A1','What is in your world?',[
  ['creeper. I like creeper. A dům... house','What colour is it?'],['green. Creeper is green','What did you make?'],
  ['I make house. Dům je green. Creeper','Where is it?'],['Minecraft. Je to v... house. Green house','Oh, green! Is it near the water?'],
  ['Ano... yes. Water. Je to blue water','Blue water is cool! Is there a dog too?'],['Yes! Dog. I like dog. Pes je brown.','What is your dog called?'],
],[word('t1','A dům... house','house'),word('t5','Je to blue water','It is blue water')]);
const ROWS=[
  {name:'ondrej-16 J3 L3 (row 6, gap)',c:ondrej,reply:ONDREJ_L3,turnId:'t3',raw:{kind:'fix',said:'we can play more long',better:'we can play longer',why:'One word: longer.'},why:'gap'},
  {name:'martin-45 J3 L3 (row 1, gap)',c:martin,reply:MARTIN_L3,turnId:'t3',raw:{kind:'fix',said:'He don\'t have a problem',better:'He doesn\'t have a problem',why:'He goes with doesn\'t.'},why:'gap'},
  {name:'tomas-9 J3 L7 (row 21, cap)',c:tomas,reply:TOMAS_L7,turnId:'t7',raw:{kind:'word',said:'Je to brown dog',better:'It is a brown dog',why:'Je to means it is.'},why:'cap'},
];
for(const r of ROWS)test(`LG-23 ${r.name}: the gate still says no; the fix is held, is not a stop, and the screen and stop count do not move`,()=>{
  const c=r.c(),g=gate(c,r.reply);
  assert.equal(g.mayStop,false,'the gate blocks this turn, as in the run');assert.equal(g.fossil,null);
  if(r.why==='cap')assert.equal(C.momentAllowed(c,true),false,'the cap is what blocks');else assert.equal(C.momentAllowed(c,true),true,'only the gap blocks');
  const o={c,raw:r.raw,reply:r.reply,turnId:r.turnId,safe:minorSafe},out=C.momentOutcome(c,{...o,...g});
  assert.equal(before(g,o),null,'before LG-23 the fix was thrown away');
  assert.equal(out.moment,null,'never a stop: no moment, so the screen stays linga-talk');
  assert.deepEqual(out.held,{id:`${r.turnId}:held`,kind:r.raw.kind,said:r.raw.said,better:r.raw.better,why:r.raw.why,turnId:r.turnId,at:out.held.at},'held, with its turn id');
  // the next turn's gate reads the moments only: holding a fix spends no gap and no cap
  const after={...c,turns:[...c.turns,learner(r.turnId.slice(1),r.reply)],heldFixes:C.keepHeld(c.heldFixes,out.held)};
  assert.equal(C.momentAllowed(after),C.momentAllowed({...after,heldFixes:undefined}));
  assert.equal(C.momentAllowed(after,true),C.momentAllowed({...after,heldFixes:undefined},true));
  assert.equal(after.moments.length,c.moments.length,'the stop count is unchanged');
  // (3) said not an exact excerpt of the reply: dropped, as a moment would be
  assert.equal(C.momentOutcome(c,{...o,...g,raw:{...r.raw,kind:'fix',said:r.raw.said+' really'}}).held,null);
  // (4) a field the audience gate holds: dropped, as a moment would be
  for(const k of ['better','why'])assert.equal(C.momentOutcome(c,{...o,...g,raw:{...r.raw,[k]:`${r.raw[k]} and a beer`}}).held,null,`${k} held by the audience gate`);
  const beer={...o,...g,reply:`${r.reply} and a beer`,raw:{...r.raw,kind:'fix',said:'and a beer'}};
  assert.equal(C.momentOutcome(c,beer).held,null,'said held by the audience gate');
  assert.ok(C.momentOutcome(c,{...beer,safe:()=>true}).held,'for an adult the same fix is held: the gate is what dropped it');
  // (6) correction off: nothing is held, and no stop either
  const off={...c,preferences:{...c.preferences,correction:'pauses'}},go=gate(off,r.reply);
  assert.deepEqual(C.momentOutcome(off,{...o,...go,c:off}),{moment:null,held:null});
});

test('LG-23: where the gate lets a stop through, the turn is a moment exactly as before and nothing is held; a fossil still stops',()=>{
  // ondrej-16 J3 L2, the run's caught moment: no moment yet, so the gate is open
  const c=ondrej();c.moments=[];c.turns=c.turns.slice(0,4);
  const reply=c.turns[3].text;c.turns=c.turns.slice(0,3);
  const g=gate(c,reply);assert.equal(g.mayStop,true);
  const o={c,raw:{kind:'fix',said:'I don\'t want my mom be angry',better:'I don\'t want my mom to be angry',why:'want someone to be.'},reply,turnId:'t2',safe:minorSafe};
  const out=C.momentOutcome(c,{...o,...g});
  assert.equal(out.held,null);assert.equal(out.moment.said,o.raw.said);assert.deepEqual(out.moment,{...before(g,o),at:out.moment.at});
  // martin: "he don't agree" said again after its moment, one turn later: code's fossil stops inside the gap, over the model's fix
  const m=scene('B1',['I think he don\'t agree.','What do you mean?'],[fix('t0','he don\'t agree','he doesn\'t agree')]),gm=gate(m,MARTIN);
  assert.equal(gm.mayStop,true);assert.ok(gm.fossil);
  const fo=C.momentOutcome(m,{c:m,raw:{kind:'fix',said:'with the plan',better:'with this plan',why:'x'},reply:MARTIN,turnId:'t2',safe:minorSafe,...gm});
  assert.equal(fo.held,null);assert.deepEqual(fo.moment,{...require(path.join(root,'src/lib/english/review.ts')).fossilMoment(gm.fossil,'t2'),at:fo.moment.at},'the moment is the fossil, never the model fix');
});

test('LG-23: the held-fix task asks for the one fix and says the scene does not stop; the stop task is unchanged',()=>{
  for(const b of [true,false]){
    const h=C.heldTaskFor(b);assert.ok(h.startsWith(C.momentTaskFor(b)),'the same criteria as a stop');
    assert.match(h,/does not stop the scene/);assert.match(h,/held for the end of the scene/);assert.doesNotMatch(h,/—/);
  }
  assert.doesNotMatch(C.momentTaskFor(false),/held for the end/);
});

test('LG-23 / council-lite r3 must-address 2: the held-fix task holds a clear error made once, a beginner\'s grammar slip included; a petra-38 recert-7 t11 slip is held, not a stop',()=>{
  for(const b of [true,false]){const h=C.heldTaskFor(b);assert.match(h,/the limits on a stop above do not apply/);assert.match(h,/a grammar slip made only once included/);}
  assert.doesNotMatch(C.momentTaskFor(true),/made only once included/,'the stop task is unchanged');
  // petra-38 recert-7: the t4 moment, then t7 and t9; at t11 the A2 gap (4) shuts the stop and the held task is asked
  const c=run('A2','How can I help you?',[
    ['Hello, I have a problem. The room is not clean and I want other room, please.','I am sorry. Is the room cold?'],
    ['I want leave the room today, please. I want other room.','Good. What kind of room do you want, small or big?'],
    ['A big room, please. Sorry, my English is not good.','No problem. Is the heater broken?'],
    ['No, the heater is not broken. The room is just not clean. Sorry.','I see. What do you want?'],
  ],[fix('t2','I want other room.','I want another room.')]);
  const reply='I want a new room, please. I can not sleep because the room is dirty and smell bad.',g=gate(c,reply);
  assert.equal(g.mayStop,false,'the gap shuts the stop, as in the run');
  const out=C.momentOutcome(c,{c,raw:{kind:'fix',said:'the room is dirty and smell bad',better:'the room is dirty and smells bad',why:'The room smells: add s.'},reply,turnId:'t5',safe:minorSafe,...g});
  assert.equal(out.moment,null);assert.equal(out.held.said,'the room is dirty and smell bad');
});

test('LG-23 / council-lite r3 must-address 2: where a stop may happen, a fix the model marks hold is held, not a stop; unmarked it stops as before (recert-7 petra-38 t1)',()=>{
  // petra-38 recert-7 t1: no moment yet, the gate open; the beginner limit declined the one-off slip as a stop
  const c=run('A2','How can I help you?',[],[]),reply='Hello, I have a problem. The room is not clean and I want other room, please.',g=gate(c,reply);
  assert.equal(g.mayStop,true);
  const raw={kind:'fix',said:'I want other room',better:'I want another room',why:'One more room: another.'},o={c,reply,turnId:'t1',safe:minorSafe,...g};
  const held=C.momentOutcome(c,{...o,raw:{...raw,hold:true}});
  assert.equal(held.moment,null,'no stop: the gap and the cap are not spent');assert.equal(held.held.said,'I want other room');
  const stop=C.momentOutcome(c,{...o,raw:{...raw,hold:false}});assert.equal(stop.held,null);assert.equal(stop.moment.said,'I want other room');
  assert.equal(C.momentOutcome(c,{...o,raw}).moment.said,'I want other room','no hold field: a stop, as before');
  const off={...c,preferences:{...c.preferences,correction:'pauses'}};
  assert.deepEqual(C.momentOutcome(off,{...o,c:off,mayStop:false,raw:{...raw,hold:true}}),{moment:null,held:null},'correction off holds nothing');
  assert.match(C.OPEN_HOLD,/hold true/);assert.match(C.OPEN_HOLD,/never hold what the rules above say to stop for/);
});

test('LG-23: the same words held twice are listed once, oldest first',()=>{
  const a={id:'t1:held',kind:'fix',said:'more long',better:'longer',why:'x',turnId:'t1',at:1},b={...a,id:'t3:held',turnId:'t3'};
  assert.deepEqual(C.keepHeld(undefined,null),[]);assert.deepEqual(C.keepHeld(undefined,a),[a]);
  assert.deepEqual(C.keepHeld([a],b),[a]);const other={...b,said:'is ok for you',better:'is that ok for you'};
  assert.deepEqual(C.keepHeld([a],other),[a,other]);
});

// ---- LG-23 wired: the ondrej-16 J3 run replayed through englishCommand, the engine stubbed (no model is called)
const ONDREJ_LINES=[
  ['all night? no way man, I have school tomorrow and my mom will kill me. I can play only to ten maybe','That\'s so early! Fine, but can we finish one more match first?',{kind:'none',said:'',better:'',why:''}],
  ['ok one more match is fine. but only two matches after, then I must go. I don\'t want my mom be angry','Deal, two matches after this one! So when can we play next time?',{kind:'fix',said:'I don\'t want my mom be angry',better:'I don\'t want my mom to be angry',why:'want someone to do something.'}],
  [ONDREJ_L3,'Saturday works for me! So tonight, what time do you want to finish?',{kind:'fix',said:'we can play more long',better:'we can play longer',why:'One word: longer.'}],
  ['tonight we finish at ten, no more. and next time saturday at six, after I eat dinner. is ok for you?','Deal, we stop at ten, no more!',{kind:'fix',said:'is ok for you?',better:'is that ok for you?',why:'A question needs its subject.'}],
];
async function replayOndrej(correction){
  const engine=require(path.join(root,'src/lib/engines/text.ts')),real=engine.text,prompts=[];
  const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
  const {getLearner,saveEnglish}=require(path.join(root,'src/lib/session/learners.ts'));
  const {emptyEnglish}=require(path.join(root,'src/lib/english/types.ts')),{defaultPreferences}=require(path.join(root,'src/lib/english/curriculum.ts'));
  dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});
  const profile=getSession().profiles.find(p=>p.id==='ema');
  saveEnglish('ema',{...emptyEnglish(),preferences:{...defaultPreferences(profile),level:'B1',correction}});
  engine.text=async req=>{
    const p=JSON.parse(req.prompt);
    // LG-4: Back on the moment asks for a replay; this run answers it with nothing usable, so the scene carries on as it did
    if(p.task===C.REPLAY_TASK)return {json:{},provider:'test',ms:1};
    prompts.push(p);
    if(!p.submittedReply)return {json:{title:'Ranked tonight',goal:'Agree when to stop playing.',opening:'Hey! Ranked matches tonight? What do you think?'},provider:'test',ms:1};
    const [,reply,moment]=ONDREJ_LINES.find(l=>l[0]===p.submittedReply);
    return {json:{reply,observations:[],moment},provider:'test',ms:1};
  };
  let n=0;const cmd=(action,extra={})=>{const s=getSession();return C.englishCommand({action,learnerId:'ema',episodeId:s.conversation?.id,commandId:`lg23-${correction}-${++n}`,...extra});};
  const screens=[];
  try{
    await cmd('start',{sceneId:'booking',replace:true});
    for(const [text] of ONDREJ_LINES){
      await cmd('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
      screens.push(getSession().screen);
      if(getSession().conversation.moment)await cmd('moment-done');
    }
    const live=getSession().conversation;
    await cmd('finish');
    return {prompts,screens,live,done:getSession(),learning:getLearner('ema').english};
  }finally{engine.text=real;}
}

test('LG-23 wired (ondrej-16 J3, rows 6 and 7): one stop as before, the two gap-blocked fixes held, on no screen until the recap, which lists them apart',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  const {prompts,screens,live,done,learning}=await replayOndrej('as-needed');
  assert.deepEqual(screens,['linga-talk','linga-moment','linga-talk','linga-talk'],'the stop is on L2 only, as in the run');
  assert.match(prompts[3].task,/does not stop the scene/,'L3: the gate shut, the fix is still asked for');assert.match(prompts[4].task,/does not stop the scene/);
  assert.doesNotMatch(prompts[2].task,/does not stop the scene/,'L2: the stop task as before');
  assert.ok(prompts[2].task.includes(C.OPEN_HOLD),'L2: a fix the stop rules decline may be held');
  assert.equal(live.moments.length,1,'one stop, as in the run');assert.equal(live.moment,null);
  assert.deepEqual(live.heldFixes.map(h=>[h.said,h.better,h.turnId]),[['we can play more long','we can play longer',live.turns[5].id],['is ok for you?','is that ok for you?',live.turns[7].id]]);
  // (5) the recap view-model: the held fixes, apart from the moments
  const v=V.lingaView(done,{});
  assert.deepEqual(v.recap.moments.map(m=>m.said),['I don\'t want my mom be angry']);
  assert.deepEqual(v.recap.held,[{kind:'fix',said:'we can play more long',better:'we can play longer',why:'One word: longer.'},{kind:'fix',said:'is ok for you?',better:'is that ok for you?',why:'A question needs its subject.'}]);
  const text=V.viewText(v);
  assert.match(text,/On the phone, from this rehearsal:\n  "I don't want my mom be angry"/);
  assert.match(text,/On the phone, saved for the end:\n  "we can play more long" → "we can play longer" \(One word: longer\.\)\n  "is ok for you\?" → "is that ok for you\?"/);
  // the record: the held fixes on the sessions entry, the one moment the only taught item
  assert.deepEqual(learning.sessions.at(-1).held.map(h=>h.said),['we can play more long','is ok for you?']);
  assert.deepEqual(learning.taught.filter(t=>!t.line).map(t=>t.said),['I don\'t want my mom be angry'],'the room line (K4) aside');
  const {cleanEnglish}=require(path.join(root,'src/lib/english/rules.ts'));
  assert.deepEqual(cleanEnglish(JSON.parse(JSON.stringify(learning))).sessions.at(-1).held,learning.sessions.at(-1).held,'a reload keeps them');
});

test('LG-23 wired: during the scene no view lists a held fix; with correction off nothing is held and nothing stops',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  const on=await replayOndrej('as-needed');
  const talking={...on.done,screen:'linga-talk',conversation:{...on.live,phase:'conversation'}};
  const shown=V.viewText(V.lingaView(talking,{}));
  assert.doesNotMatch(shown,/play longer|is that ok for you/,'the talk screen shows no held fix');
  assert.equal(V.lingaView(talking,{}).recap,null);
  const off=await replayOndrej('pauses');
  assert.equal(off.live.heldFixes,undefined);assert.equal(off.live.moments.length,0);
  assert.ok(off.prompts.slice(1).every(p=>/moment: kind none with empty fields/.test(p.task)&&!/hold true/.test(p.task)),'no fix is asked for');
  assert.equal(off.learning.sessions.at(-1).held,undefined);
  assert.deepEqual(V.lingaView(off.done,{}).recap.held,[]);
});

// ---- LG-4, path from the moment to Replay (owner ruling 2026-10-18): Back on a moment hands off to the existing Replay with
// a fresh question built on the moment's form; the recap records the reply to it. A stubbed engine, no live model.
const SLIP='I am work in a hotel.',REPLAY_Q='And where do you work every morning?',ON_SCREEN='Which hotel is it?';
/** A B1 scene whose first reply stops on a fix; `replay` answers the replay call (or throws), every other turn gets a plain reply. */
async function lg4(replay,{slip=SLIP,moment={kind:'fix',said:'I am work',better:'I work',why:'Work is the verb here.'}}={}){
  const engine=require(path.join(root,'src/lib/engines/text.ts')),real=engine.text,calls=[];
  const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
  const {getLearner,saveEnglish}=require(path.join(root,'src/lib/session/learners.ts'));
  const {emptyEnglish}=require(path.join(root,'src/lib/english/types.ts')),{defaultPreferences}=require(path.join(root,'src/lib/english/curriculum.ts'));
  dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});
  const profile=getSession().profiles.find(p=>p.id==='ema');
  saveEnglish('ema',{...emptyEnglish(),preferences:{...defaultPreferences(profile),level:'B1',correction:'as-needed'}});
  engine.text=async req=>{
    const p=JSON.parse(req.prompt);calls.push({req,p});
    if(p.task===C.REPLAY_TASK)return replay(p);
    if(!p.submittedReply)return {json:{title:'Front desk',goal:'Talk about your job.',opening:'Hello! Where do you work?'},provider:'test',ms:1};
    if(p.submittedReply===slip)return {json:{reply:ON_SCREEN,observations:[],moment},provider:'test',ms:1};
    return {json:{reply:'Nice. Tell me more.',observations:[],moment:{kind:'none',said:'',better:'',why:''}},provider:'test',ms:1};
  };
  let n=0;
  const cmd=(action,extra={})=>{const s=getSession();return C.englishCommand({action,learnerId:'ema',episodeId:s.conversation?.id,commandId:`lg4-${Date.now()}-${++n}`,...extra});};
  const say=text=>cmd('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id});
  await cmd('start',{sceneId:'booking',replace:true});
  await say(slip);
  assert.ok(getSession().conversation.moment,'the reply stops the scene');
  return {calls,cmd,say,getSession,getLearner,done:()=>{engine.text=real;}};
}
const replays=calls=>calls.filter(x=>x.p.task===C.REPLAY_TASK);
/** a replay answer; `form` (LG-4 recert-7) names the after words the answer should use, 'I work' unless a test says otherwise */
const asked=(reply,form='I work')=>()=>({json:{reply,form},provider:'test',ms:1});

test('LG-4 (a, c): Back on a moment runs the replay step with the moment as coaching and sets phase replay; Finish over a moment has no replay',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  const r=await lg4(asked(REPLAY_Q));
  try{
    await r.cmd('moment-done');
    const c=r.getSession().conversation,[call]=replays(r.calls);
    assert.ok(call,'Back asks for the replay (LT-tomas-9-J4-1)');
    assert.deepEqual(call.p.coaching,{before:'I am work',after:'I work',note:'Work is the verb here.'},'the coaching is the closed moment: said, better, why');
    assert.equal(call.req.use,'linga-replay');assert.equal(call.req.thinking,false);
    assert.ok(call.p.askedBefore.includes(ON_SCREEN),'the question on screen is passed as one to avoid (LT-petra-38-J4-2)');
    assert.match(call.p.task,/must not be any line in askedBefore, nor a rephrase of one/);assert.match(call.p.task,/only by using the after form/);assert.match(call.p.task,/Do not supply the learner's answer/);
    assert.equal(c.phase,'replay');assert.equal(c.moment,null);assert.equal(c.pending,null);assert.equal(c.error,'');
    assert.equal(c.turns.at(-1).text,REPLAY_Q);assert.equal(c.turns.at(-1).role,'partner');
    assert.equal(r.getSession().screen,'linga-talk');assert.equal(c.coaching,null,'no coach screen: the moment is the coaching');
    assert.deepEqual(c.moments.map(m=>[m.said,m.better,m.replay?.question]),[['I am work','I work',REPLAY_Q]]);
    assert.equal(r.getLearner('ema').english.taught.filter(t=>!t.line).length,1,'the moment is kept on the record as before');
    assert.equal(V.lingaView(r.getSession(),{}).tag,'Try it again','the existing Replay screen');
  }finally{r.done();}
  const f=await lg4(()=>{throw new Error('no replay on Finish');});
  try{
    await f.cmd('finish');
    assert.equal(replays(f.calls).length,0,'Finish over a moment has no replay');
    assert.deepEqual(V.lingaView(f.getSession(),{}).recap.moments,[{kind:'fix',said:'I am work',better:'I work',why:'Work is the verb here.'}],'its recap shows what it showed before');
  }finally{f.done();}
});

test('LG-4 (b): a failed, empty or repeated replay leaves Back where it was: the conversation, no error, no replay kept',async()=>{
  const outcomes={failed:()=>{throw new Error('timed out');},empty:()=>({json:{},provider:'test',ms:1}),repeated:asked(ON_SCREEN)};
  for(const [name,replay] of Object.entries(outcomes)){
    const r=await lg4(replay);
    try{
      const before=r.getSession().conversation.turns.length;
      await r.cmd('moment-done');
      const c=r.getSession().conversation;
      assert.equal(replays(r.calls).length,1,`${name}: the replay was asked for`);
      assert.equal(c.phase,'conversation',name);assert.equal(c.pending,null,name);assert.equal(c.error,'',`${name}: no error screen`);
      assert.equal(c.moment,null,name);assert.equal(c.turns.length,before,`${name}: no new partner line`);assert.equal(c.turns.at(-1).text,ON_SCREEN);
      assert.equal(r.getSession().screen,'linga-talk',name);
      assert.equal(c.moments.length,1,`${name}: the moment closed as before`);assert.equal(c.moments[0].replay,undefined,name);
      await r.say('I work at the Grand.');
      assert.equal(r.getSession().conversation.turns.length,before+2,`${name}: the scene carries on`);
    }finally{r.done();}
  }
});

test('LG-4 (d): the reply to the replay question is kept on the moment with whether it used the form, decided in code, and the recap shows it',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  for(const [reply,used] of [['Every morning I work at the front desk.',true],['Every morning I check in the guests.',false]]){
    const r=await lg4(asked(REPLAY_Q));
    try{
      await r.cmd('moment-done');await r.say(reply);
      const c=r.getSession().conversation;
      assert.equal(c.phase,'conversation','the replay is answered');
      assert.deepEqual(c.moments[0].replay,{question:REPLAY_Q,turnId:c.turns.at(-3).id,reply,used},reply);
      assert.equal(c.turns.at(-2).supported,false,'(6) the replay answer is supported only by the turn rules: no help used here');
      await r.say('I like it, I work there.');
      assert.equal(r.getSession().conversation.moments[0].replay.reply,reply,'a later reply does not overwrite it');
      await r.cmd('finish');
      const v=V.lingaView(r.getSession(),{});
      assert.deepEqual(v.recap.moments,[{kind:'fix',said:'I am work',better:'I work',why:'Work is the verb here.',tried:reply,used}]);
      assert.ok(V.viewText(v).includes(`  "I am work" → "I work" (Work is the verb here.)\n      Tried again: “${reply}”${used?' · you used it':''}\n`),'one short line on the recap moment');
    }finally{r.done();}
  }
});

// ---- LG-4 recert-7 (LT-petra-38-J4-2): the replay after a moment must call for the coached form. In recert-7 the question
// was fresh but asked nothing the form answers, and 0 of 4 replies used it. Code holds the replay's `form` to the coaching.
test('LG-4 recert-7 rules: replayRefused passes a replay whose form names the after form, and refuses no overlap, no form, or a question that says it',()=>{
  const {replayRefused,contentWords}=require(path.join(root,'src/lib/english/replay.ts'));
  assert.equal(replayRefused(REPLAY_Q,'I work','I work'),null,'good: the form is the after form');
  assert.equal(replayRefused(REPLAY_Q,'WORK','I work'),null,'case apart, one content word is enough');
  assert.equal(replayRefused('What do you check every day?','doesn\'t check','he doesn\'t check'),null);
  assert.match(replayRefused(REPLAY_Q,'the hotel','I work'),/did not call for the coached form/,'a form with no overlap with the after form');
  assert.match(replayRefused(REPLAY_Q,'I','I work'),/did not call for the coached form/,'a light word alone names no form');
  for(const form of [undefined,'',42])assert.match(replayRefused(REPLAY_Q,form,'I work'),/did not call/,`no form: ${form}`);
  assert.match(replayRefused('So you say I work there, yes?','I work','I work'),/said the coached form itself/,'the partner never supplies the answer');
  assert.match(replayRefused('Do you i WORK at night?','I work','I work'),/said the coached form/,'case apart');
  assert.deepEqual(contentWords('on the'),['on','the'],'an after form of light words is held to all its words');
});

test('LG-4 recert-7 wired: Back asks with the after form named and a required form; a replay that does not call for it, or says it, leaves the conversation as a failed one does',async()=>{
  const r=await lg4(asked(REPLAY_Q));
  try{
    await r.cmd('moment-done');
    const [call]=replays(r.calls);
    assert.equal(call.p.afterForm,'I work','the after form, given in the task data');
    assert.match(call.p.task,/afterForm/);assert.match(call.p.task,/GOOD/);assert.match(call.p.task,/BAD/);
    assert.ok(call.req.schema.required.includes('form'),'the replay schema requires form');
    assert.ok('form' in call.req.accept.properties,'and the answer may carry it');
    const c=r.getSession().conversation;
    assert.equal(c.phase,'replay');assert.equal(c.moments[0].replay.question,REPLAY_Q);
    assert.ok(!JSON.stringify(c).includes('"form"'),'form is internal: it is not kept on the scene');
  }finally{r.done();}
  for(const [name,replay] of Object.entries({'no overlap':asked(REPLAY_Q,'the hotel'),'no form':()=>({json:{reply:REPLAY_Q},provider:'test',ms:1}),'says the form':asked('So you say I work at the desk?')})){
    const r=await lg4(replay);
    try{
      const before=r.getSession().conversation.turns.length;
      await r.cmd('moment-done');
      const c=r.getSession().conversation;
      assert.equal(c.phase,'conversation',name);assert.equal(c.error,'',`${name}: no error screen`);assert.equal(c.pending,null,name);
      assert.equal(c.turns.length,before,`${name}: no new partner line`);assert.equal(c.moments[0].replay,undefined,name);
    }finally{r.done();}
  }
});

test('LG-4 recert-7: Take Two keeps replaySchema and replayAccept, with no form, so a take answer without form is still accepted',()=>{
  const fs=require('node:fs'),cv=fs.readFileSync(path.join(root,'src/lib/english/conversation.ts'),'utf8');
  assert.ok(cv.includes('const replaySchema=schema({reply:str(230),help:helpSchema}),replayAccept=loose({reply:str(230)});'),'replaySchema unchanged');
  assert.match(cv,/task:TAKE_TASK,submittedReply:reply\}\),schema:replaySchema,accept:replayAccept,[^\n]*use:"linga-take"/,'the Take Two call keeps them');
  const {validate,schema,str}=require(path.join(root,'src/lib/engines/shape.ts'));
  const accept={...schema({reply:str(230)}),properties:{reply:str(230),help:{}}};
  assert.deepEqual(validate({reply:'Fine, and you?'},accept),[],'a take answer without form fits replayAccept');
});

test('LG-4 recert-7: Back answers at once with the partner thinking of a new question, on the TV and the phone, gone when the replay lands or fails',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts')),fs=require('node:fs');
  const {getSession}=require(path.join(root,'src/lib/session/store.ts'));
  /** the TV caption and the phone's line while the call runs, then the replay's own outcome */
  const during=[],watch=outcome=>p=>{const s=getSession(),v=V.lingaView(s,{});during.push({screen:s.screen,caption:v.baseCaption,tag:v.captionTag,phone:V.replayThinking(s.conversation),waiting:v.waiting});return outcome(p);};
  for(const [name,outcome] of Object.entries({landed:asked(REPLAY_Q),failed:()=>{throw new Error('timed out');}})){
    during.length=0;
    const r=await lg4(watch(outcome));
    try{
      const who=r.getSession().conversation.partner.split(' · ')[0],line=`${who} is thinking of a new question.`;
      await r.cmd('moment-done');
      assert.deepEqual(during,[{screen:'linga-talk',caption:line,tag:'Thinking',phone:line,waiting:true}],`${name}: the same scene screen, waiting, with the line`);
      const s=r.getSession(),v=V.lingaView(s,{});
      assert.equal(s.conversation.pending,null,name);assert.equal(s.conversation.replayFor,undefined,`${name}: no marker left behind`);
      assert.equal(V.replayThinking(s.conversation),null,`${name}: the line is gone`);
      assert.notEqual(v.baseCaption,line,name);assert.equal(v.waiting,false,`${name}: not stuck waiting`);
      assert.equal(v.answer?.action,'turn',`${name}: the scene takes a reply`);
    }finally{r.done();}
  }
  // a marker from an earlier command never shows: only the call in flight owns the line
  const r=await lg4(asked(REPLAY_Q));
  try{
    const c=r.getSession().conversation;
    assert.equal(V.replayThinking({...c,pending:'other',replayFor:'old'}),null);
    assert.equal(V.replayThinking({...c,pending:null,replayFor:'old'}),null);
    assert.match(V.replayThinking({...c,pending:'x',replayFor:'x'}),/ is thinking of a new question\.$/);
  }finally{r.done();}
  assert.match(fs.readFileSync(path.join(root,'src/english/LingaPhone.tsx'),'utf8'),/replayThinking\(c\)\?\?"Your partner is preparing a reply…"/,'the phone shows the same line');
});

test('LG-4 recert-7: the TV recap draws the phone\'s "Tried again" line under the moment it shows, in the same words (replayLine)',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts')),fs=require('node:fs');
  for(const [reply,used] of [['Every morning I work at the front desk.',true],['Every morning I check in the guests.',false]]){
    const r=await lg4(asked(REPLAY_Q));
    try{
      await r.cmd('moment-done');await r.say(reply);await r.cmd('finish');
      const v=V.lingaView(r.getSession(),{});
      assert.equal(v.hero.kind,'comparison');assert.equal(v.hero.before.quote,'I am work');
      assert.equal(v.hero.tried,V.replayLine(reply,used),'one wording, the phone\'s');
      assert.ok(V.viewText(v).includes(`"I work"\nWork is the verb here.\n${V.replayLine(reply,used)}\n`),'the driver reads it under the moment on the TV');
    }finally{r.done();}
  }
  const none=await lg4(asked(REPLAY_Q));
  try{await none.cmd('finish');assert.equal(V.lingaView(none.getSession(),{}).hero.tried,undefined,'no replay, no line');}finally{none.done();}
  assert.match(fs.readFileSync(path.join(root,'src/english/LingaTV.tsx'),'utf8'),/h\.tried&&<DataLine>\{h\.tried\}<\/DataLine>/,'the TV draws it');
});

test('LG-4 (e): "Mission done" does not end the scene while the replay question is open (LT-tomas-9-J4-1)',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  const r=await lg4(asked(REPLAY_Q));
  try{
    await r.cmd('moment-done');
    const s=r.getSession(),done={steps:['say where you work','say what you do'],reached:[{turnId:'a',quote:'I work'},{turnId:'b',quote:'I do'}]};
    assert.equal(s.conversation.phase,'replay');
    const open=V.lingaView({...s,conversation:{...s.conversation,mission:done}},{});
    assert.ok(!open.actions.some(a=>a.id==='finish'),'no "See what you did" over the replay question');
    assert.notEqual(open.baseCaption,'Mission done. See what you did tonight.');
    assert.equal(open.answer?.action,'turn','the replay question takes the reply');
    const answered=V.lingaView({...s,conversation:{...s.conversation,phase:'conversation',mission:done}},{});
    assert.equal(answered.actions[0].id,'finish','once it is answered, the mission is done as before');
  }finally{r.done();}
});

test('LG-4 recert-7 (adela-17 J4 #12): the Now row reads the replay, not "Mission done", until the replay question is answered',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  const r=await lg4(asked(REPLAY_Q));
  try{
    await r.cmd('moment-done');
    const s=r.getSession(),done={steps:['say where you work','say what you do'],reached:[{turnId:'a',quote:'I work'},{turnId:'b',quote:'I do'}]};
    assert.equal(s.conversation.phase,'replay');
    const open=V.lingaView({...s,conversation:{...s.conversation,mission:done}},{});
    assert.equal(open.hero.subtitle,'Try it again','the replay is the current thing');
    assert.ok(V.viewText(open).includes('\nNow: Try it again\n'),'the driver reads the same Now row');
    assert.doesNotMatch(V.viewText(open),/Mission done/);
    const step=V.lingaView({...s,conversation:{...s.conversation,mission:{...done,reached:done.reached.slice(0,1)}}},{});
    assert.equal(step.hero.subtitle,'say what you do','a step still open stays the Now row');
    const answered=V.lingaView({...s,conversation:{...s.conversation,phase:'conversation',mission:done}},{});
    assert.equal(answered.hero.subtitle,'Mission done','once it is answered, Mission done as before');
  }finally{r.done();}
});

test('LG-4: the moment\'s Back says the scene continues with a question to try the fix; a lost fix goes back as before',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  const r=await lg4(asked(REPLAY_Q));
  try{
    const s=r.getSession(),back=m=>V.lingaView({...s,conversation:{...s.conversation,moment:m}},{}).actions.find(a=>a.id==='back');
    assert.equal(back(s.conversation.moment).label,'Back to the conversation','the button keeps its place and name');
    assert.match(back(s.conversation.moment).help,/new question to try this/);
    assert.equal(back({...s.conversation.moment,better:'',repair:{rung:0,lost:true}}).help,'Carry on from where the scene stopped.');
  }finally{r.done();}
});

// ---- LG-4 recert-8 (docs/uat-insights/2026-10-19-lt-recert-8.md): 0 of 4 replies used the coached form, as in recert-7, with
// ee6a6fed's prompt in the product. Each replay question was fresh but answerable without the fix. Code now reads the
// question for the coached frame (replay.ts frameOf), asks once more when it does not invite it, and replay.used reads the
// frame, not only the exact key. Fixtures: the four moments and replays of uat/runs/2026-10-17-lt-swap-2/recert-8.
const R8={
  viktor:{moment:{kind:'fix',said:'I have cat in garden.',better:'I have a cat in the garden.',why:'x',slip:'have cat',fix:'have a cat'},question:'Cool! What do you have in your garden?',reply:'I have tomato and flowers. My garden is big.',good:'Do you have a cat or a dog at home?',uses:'Yes, I have a dog in the garden.'},
  petra:{moment:{kind:'fix',said:'I think is not repair today',better:'I think it cannot be repaired today',why:'x',slip:'think is not repair',fix:'think it cannot be repaired'},question:'Thank you. Why do you want a new room, not a repair today?',reply:'Because the shower is cold and the water is not hot.',good:'Do you think the shower can be repaired today?',uses:'No, I think it can\'t be repaired tonight.'},
  tomas:{moment:{kind:'word',said:'Já nevím...',better:'I don\'t know',why:'x'},question:'Nice! Where are the diamonds in the game?',reply:'I like diamond. I can... já, nevím. I like Minecraft.',good:'Do you know where the diamonds are?',uses:'I don\'t know.'},
  adela:{moment:{kind:'word',said:'eventually',better:'often',why:'x'},question:'Staying up late on your phone does affect many teens, I agree. When friends message you at night, what do you usually do?',reply:'Usually I don\'t answer straight away, because I\'d rather get enough sleep.',good:'Do you often answer friends late at night?',uses:'I often check who wrote, but I answer in the morning.'},
};
test('LG-4 recert-8 rules: each recert-8 replay question is refused for not inviting the coached frame, a question that names it passes, and replay.used reads the frame',()=>{
  const {frameOf,invitesFrame,replayRefused,usesFrame}=require(path.join(root,'src/lib/english/replay.ts'));
  const {usesForm}=require(path.join(root,'src/lib/english/review.ts'));
  assert.deepEqual(frameOf(R8.viktor.moment),{words:['have','a',null],anchors:['have','cat'],slip:'have cat'},'the article kept, the thing open');
  assert.deepEqual(frameOf(R8.petra.moment).anchors,['repaired']);
  assert.deepEqual(frameOf(R8.tomas.moment).anchors,['know']);
  assert.deepEqual(frameOf(R8.adela.moment).anchors,['often']);
  for(const [who,x] of Object.entries(R8)){
    const frame=frameOf(x.moment);
    assert.match(replayRefused(x.question,x.moment.better,x.moment.better,frame),/did not invite the coached frame/,`${who}: the recert-8 question`);
    assert.equal(invitesFrame(x.good,frame),true,`${who}: ${x.good}`);
    assert.equal(replayRefused(x.good,x.moment.better,x.moment.better,frame),null,`${who}: a question that names the frame is a replay`);
    assert.equal(usesForm(x.reply,x.moment)??usesFrame(x.reply,frame),null,`${who}: the recert-8 reply did not use it`);
    assert.ok(usesForm(x.uses,x.moment)??usesFrame(x.uses,frame),`${who}: ${x.uses}`);
  }
  assert.equal(usesForm(R8.viktor.uses,R8.viktor.moment),null,'the exact key alone misses "I have a dog"');
  assert.equal(usesFrame(R8.viktor.uses,frameOf(R8.viktor.moment)),'have a dog');
  assert.equal(usesFrame('I have cat and a dog.',frameOf(R8.viktor.moment)),null,'the slip said again is no use of the form');
  assert.equal(usesFrame('I want a dog.',frameOf(R8.viktor.moment)),null,'the words before the change stay whole');
  assert.deepEqual(frameOf({kind:'fix',said:'I am work',better:'I work',slip:'i am work',fix:'i work'}).words,['i','work'],'a dropped word keeps the key whole');
  assert.match(replayRefused('So you have a cat? I have a cat in the garden too.','have a cat','I have a cat in the garden.',frameOf(R8.viktor.moment)),/said the coached form itself/,'the whole after form is still never said');
});

test('LG-4 recert-8 wired: a Back replay that does not invite the frame is asked for once more, frameWords and the refusal named; a second refusal is no replay',async()=>{
  const x=R8.viktor,slip='Yes, I like cat. I have cat in garden.',opts={slip,moment:{kind:'fix',said:x.moment.said,better:x.moment.better,why:'One cat needs a.'}};
  let n=0;
  const r=await lg4(()=>({json:{reply:++n===1?x.question:x.good,form:'I have a cat'},provider:'test',ms:1}),opts);
  try{
    await r.cmd('moment-done');
    const calls=replays(r.calls);
    assert.equal(calls.length,2,'asked once more');
    assert.deepEqual(calls[0].p.frameWords,['have','cat'],'the anchors go to the model');
    assert.equal(calls[0].p.refused,undefined);
    assert.equal(calls[1].p.refused.question,x.question);assert.match(calls[1].p.refused.why,/did not invite the coached frame/);
    let c=r.getSession().conversation;
    assert.equal(c.phase,'replay');assert.equal(c.turns.at(-1).text,x.good);assert.equal(c.moments[0].replay.question,x.good);
    await r.say(x.uses);
    c=r.getSession().conversation;
    assert.equal(c.moments[0].replay.used,true,'"I have a dog" uses "have a ___"');assert.equal(c.moments[0].replay.reply,x.uses);
  }finally{r.done();}
  const twice=await lg4(()=>({json:{reply:x.question,form:'I have a cat'},provider:'test',ms:1}),opts);
  try{
    const before=twice.getSession().conversation.turns.length;
    await twice.cmd('moment-done');
    const c=twice.getSession().conversation;
    assert.equal(replays(twice.calls).length,2,'once more, never a third time');
    assert.equal(c.phase,'conversation');assert.equal(c.error,'');assert.equal(c.turns.length,before);assert.equal(c.moments[0].replay,undefined);
  }finally{twice.done();}
  const answered=await lg4(()=>({json:{reply:x.good,form:'I have a cat'},provider:'test',ms:1}),opts);
  try{
    await answered.cmd('moment-done');await answered.say(x.reply);
    const c=answered.getSession().conversation;
    assert.equal(replays(answered.calls).length,1,'a question that invites the frame is asked once');
    assert.equal(c.moments[0].replay.used,false,'"I have tomato" does not use it');
  }finally{answered.done();}
});

// ---- LG-4 recert-8 (adela-17 J4 #15): the recap's "Tried again" quote ended mid-sentence, "it depends on whether ", on the TV
// and the phone alike: a reply over USED_MAX that used no form was cut at 180 characters. Fixtures: her reply and its stored cut.
const ADELA='Usually I don\'t answer straight away, because I\'d rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode. I think it depends on whether the message is urgent. Was my answer correct?';
const ADELA_TWO='Usually I don\'t answer straight away, because I\'d rather get enough sleep. Although I sometimes check who wrote to me, I put my phone on silent mode.';
test('LG-4 recert-8 rules: a long reply is cut at a sentence or clause end, never mid-sentence; a quote stored with the old cut is cut back',()=>{
  const R=require(path.join(root,'src/lib/english/review.ts')),V=require(path.join(root,'src/lib/english/view.ts'));
  assert.equal(R.usedLine(ADELA,ADELA),ADELA_TWO,'adela-17 #15: the two sentences that fit');
  assert.equal(R.usedLine(ADELA,'often'),'often','a found form short of its sentence is kept as before');
  const stored=ADELA.slice(0,R.USED_MAX);
  assert.match(stored,/depends on whether $/,'the recert-8 quote as stored');
  assert.equal(R.recapQuote(stored),ADELA_TWO,'cut back to its last sentence end');
  assert.equal(V.replayLine(stored,false),`Tried again: “${ADELA_TWO}”`,'the one wording, TV and phone');
  assert.equal(R.recapQuote('I have tomato and flowers'),'I have tomato and flowers','a short quote is left alone');
  const long='Well, when my friends message me late at night about homework or games or anything else that happens to come up, I usually wait, because sleep matters more to me than any chat that could easily wait until morning';
  assert.equal(R.clauseCut(long),'Well, when my friends message me late at night about homework or games or anything else that happens to come up, I usually wait…','no sentence end: the last clause end');
  const run='a'.repeat(10)+' '+'b'.repeat(200);
  assert.equal(R.clauseCut(run),'a'.repeat(10)+'…','no clause end: the last whole word');
  for(const x of [R.usedLine(ADELA,ADELA),R.recapQuote(stored),R.clauseCut(long),R.clauseCut(run)])assert.ok(x.length<=R.USED_MAX,x);
});
test('LG-4 recert-8 wired: Adela\'s long replay reply reaches the recap as whole sentences, on the TV and the phone',async()=>{
  const V=require(path.join(root,'src/lib/english/view.ts'));
  const r=await lg4(asked(REPLAY_Q));
  try{
    await r.cmd('moment-done');await r.say(ADELA);await r.cmd('finish');
    const c=r.getSession().conversation,v=V.lingaView(r.getSession(),{});
    assert.equal(c.moments[0].replay.reply,ADELA_TWO);
    assert.equal(v.hero.tried,`Tried again: “${ADELA_TWO}”`,'the TV');
    assert.equal(v.recap.moments[0].tried,ADELA_TWO,'the phone');
    assert.doesNotMatch(V.viewText(v),/whether/);
  }finally{r.done();}
});
