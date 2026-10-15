/**
 * Run with npm run test:rules in desk/ (directly: node tools/linga-duet-test.cjs). L2, pool P05: two people in the room
 * (lib/english/duet.ts). A duet alternates the seated learner's beat and a co-star's in the turn table, the host answers
 * each PAIR with one model call, the co-star helper is the rescue ladder with no call, and evidence lands only on the
 * speaker's own record. No live model call (the engine is stubbed at its seam); a disposable data directory under the OS
 * temp dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'linga-duet-'));
process.env.DESK_DATA_DIR=dataDir;
const engine=require(path.join(root,'src/lib/engines/text.ts'));
const calls=[];
let answer=async()=>({json:{},provider:'test',ms:1});
engine.text=(req)=>{calls.push({use:req.use,system:req.system,prompt:JSON.parse(req.prompt),schema:req.schema});return answer(req);};
const {englishCommand}=require(path.join(root,'src/lib/english/conversation.ts'));
const {accepts,refusal,turnState}=require(path.join(root,'src/lib/english/turn.ts'));
const D=require(path.join(root,'src/lib/english/duet.ts'));
const {lingaView,viewText}=require(path.join(root,'src/lib/english/view.ts'));
const {REDIRECT_LINE}=require(path.join(root,'src/lib/english/gate.ts'));
const {emptyEnglish}=require(path.join(root,'src/lib/english/types.ts'));
const {defaultPreferences}=require(path.join(root,'src/lib/english/curriculum.ts'));
const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
const {getLearner,saveEnglish}=require(path.join(root,'src/lib/session/learners.ts'));
after(()=>{clearInterval(globalThis.__desk?.ticker);try{fs.rmSync(dataDir,{recursive:true,force:true});}catch(e){console.warn('linga-duet-test: temp dir left behind',e.message);}});

const HOST='Hello, both of you. Ema, what is the name on the booking?';
const LADDER={simpler:'What name is on the booking?',meaning:'booking: a place you saved for later',starter:'The booking is under …'};
const opening=()=>({json:{title:'A missing booking',goal:'Find the booking together.',opening:HOST,supportProvided:false,help:LADDER},provider:'test',ms:1});
/** One pair's answer: the host line, its ladder, and whatever observations, moment and co-star observations the case wants. */
const pairAnswer=(patch={})=>async()=>({json:{reply:'Thank you both. When did you book it?',supportProvided:false,observations:[],moment:{kind:'none',said:'',better:'',why:''},help:{simpler:'When did you book?',meaning:'',starter:'I booked it on …'},...patch},provider:'test',ms:1});
let counter=0;
const id=()=>`duet-${++counter}`;
function command(action,extra={}){const s=getSession();return englishCommand({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:id(),...extra});}
const said=(text,extra={})=>command('turn',{text,mode:'text',lastTurnId:getSession().conversation.turns.at(-1).id,...extra});
/** A fresh desk with `who` seated; every learner record wiped, so each case starts from nothing. */
function fresh(who='ema'){
  for(const p of ['ema','jakub'])saveEnglish(p,emptyEnglish());
  dispatch({type:'reset'});dispatch({type:'learner.set',id:who});dispatch({type:'subject',subject:'english'});
  calls.length=0;answer=async()=>opening();
}
const conv=()=>getSession().conversation;
const rejects=(p,status,re)=>assert.rejects(p,e=>e.status===status&&(!re||re.test(e.message)));

test('a duet starts with one opening call: the host welcomes both, and the co-star\'s name reaches the tutor as data',async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStar:'  Mum!! '}});
  const c=conv();
  assert.deepEqual(c.duet,{coStar:'Mum',beat:'learner'});
  assert.equal(calls.length,1);assert.equal(calls[0].use,'linga-opening');
  assert.deepEqual(calls[0].prompt.duet,{coStar:'Mum',coStarIsLearner:false});
  assert.match(calls[0].prompt.task,/welcomes both the learner and the co-star/);
  assert(calls[0].system.includes(D.DUET_SYSTEM),'the system prompt carries the host contract');
  assert(!calls[0].system.includes('Mum'),'the name is data in the input, never in the system prompt');
  assert.equal(turnState(c),'your-turn');
});

test('the turn table alternates the beats: the co-star is refused on the learner\'s beat and the learner on the co-star\'s, and one call answers each pair',async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStar:'Mum'}});
  calls.length=0;answer=pairAnswer();
  let c=conv();
  assert.equal(accepts(c,'turn',undefined,undefined,'costar'),false);assert.equal(accepts(c,'turn',undefined,undefined,'learner'),true);
  await rejects(said('Smith, I think.',{speaker:'costar'}),409,/not Mum's turn yet/);
  assert.equal(calls.length,0,'a refused line costs no call');
  await said('It is under Novak.');
  c=conv();
  assert.equal(calls.length,0,'the learner\'s beat holds the line with no model call');
  assert.equal(c.duet.beat,'costar');assert.equal(c.duet.held.text,'It is under Novak.');
  assert.equal(c.turns.length,1,'the held line is not a turn yet: the host line is still the one on screen');
  assert.equal(accepts(c,'turn'),false);assert.equal(accepts(c,'turn',undefined,undefined,'costar'),true);
  await rejects(said('Novak, yes.'),409,/Mum's turn now/);
  await rejects(said('Novak, yes.',{speaker:'learner'}),409,/Mum's turn now/);
  for(const a of ['coach','quiz'])assert.equal(accepts(c,a),false,`${a} waits for the co-star's line`);
  assert.equal(calls.length,0);
  await said('Yes, Novak with a K.',{speaker:'costar'});
  c=conv();
  assert.equal(calls.length,1,'exactly one call for the pair');assert.equal(calls[0].use,'linga-turn');
  assert.equal(calls[0].prompt.submittedReply,'It is under Novak.');assert.equal(calls[0].prompt.coStarReply,'Yes, Novak with a K.');
  assert.match(calls[0].prompt.task,/^Two people spoke in turn/);
  assert.deepEqual(c.turns.map(t=>t.role),['partner','learner','costar','partner']);
  assert.deepEqual(c.duet,{coStar:'Mum',beat:'learner'});
  // a second pair: one more call, never one per line
  await said('Last Monday.');assert.equal(calls.length,1);
  await said('It was Monday, yes.',{speaker:'costar'});assert.equal(calls.length,2);
  assert.deepEqual(conv().turns.map(t=>t.role),['partner','learner','costar','partner','learner','costar','partner']);
});

test('the co-star helper climbs the help.ts ladder with zero engine calls, and a starter makes the learner\'s reply supported',async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStar:'Mum'}});
  calls.length=0;
  assert.equal(conv().supported,false);
  await command('cue');assert.equal(conv().cue,LADDER.simpler);assert.equal(conv().supported,false,'the simpler line supplies no wording');
  await command('cue');assert.equal(conv().cue,LADDER.meaning);
  await command('cue');assert.equal(conv().cue,LADDER.starter);assert.equal(conv().supported,true,'a way to start is help, as the learner\'s own tap is');
  assert.equal(calls.length,0,'the helper is the ladder already held: no model call');
  answer=pairAnswer({observations:[{skill:'request',quote:'The booking is under Novak, please',success:true,confidence:'clear',note:'Gave the name.'}]});
  await said('The booking is under Novak, please.');
  assert.equal(conv().duet.held.supported,true,'the held line keeps the help it had when it was said');
  await said('Novak.',{speaker:'costar'});
  const ev=getLearner('ema').english.evidence;
  assert.equal(ev.length,1);assert.equal(ev[0].supported,true,'credit stays honest: the reply after a starter is supported');
  assert.equal(conv().turns.find(t=>t.role==='learner').supported,true);
});

test('help the co-star asks for on their own beat never touches the learner\'s line',async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStar:'Mum'}});
  answer=pairAnswer({observations:[{skill:'request',quote:'Could you check the name Novak',success:true,confidence:'clear',note:'Asked.'}]});
  await said('Could you check the name Novak?');
  for(let i=0;i<3;i++)await command('cue');
  assert.equal(conv().supported,true);
  await said('Novak.',{speaker:'costar'});
  const ev=getLearner('ema').english.evidence;
  assert.equal(ev.length,1);assert.equal(ev[0].supported,false,'the learner\'s line was said before the help');
});

test('evidence is bound to the speaker: only exact quotes of the learner\'s own line count for the learner, and a co-star named in free text earns nothing',async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStar:'Mum'}});
  answer=pairAnswer({
    observations:[{skill:'request',quote:'please check my booking',success:true,confidence:'clear',note:'Asked for a check.'},{skill:'repair',quote:'Could you say the date again',success:true,confidence:'clear',note:'The co-star\'s line.'}],
    moment:{kind:'fix',said:'Could you say the date again',better:'Could you say the date again, please?',why:'Not the learner\'s line.'},
    coStarObservations:[{skill:'repair',quote:'Could you say the date again',success:true,confidence:'clear',note:'x'}],
  });
  await said('Can you please check my booking?');
  calls.length=0;
  await said('Could you say the date again?',{speaker:'costar'});
  assert(!('coStarObservations' in calls[0].schema.properties),'a named co-star is not even assessed');
  const ema=getLearner('ema').english;
  assert.deepEqual(ema.evidence.map(e=>e.quote),['please check my booking'],'the co-star\'s words never land on the learner\'s record');
  assert.equal(ema.evidence[0].turnId,conv().turns.find(t=>t.role==='learner').id,'bound to the learner\'s own turn');
  assert.equal(conv().moment,null,'a moment quoting the co-star\'s line is no moment');
  assert.deepEqual(ema.taught.map(t=>t.line),['quiz'],"the room's hidden line was found in the learner's own words, and only that is kept");
  assert.equal(conv().line.found,'Can you please check my booking?');
  assert.equal(getLearner('jakub').english.evidence.length,0,'no other record gains anything');
});

test("the room's hidden line is the learner's to find: the co-star saying it earns no find, and makes it shown",async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStar:'Mum'}});
  assert.equal(conv().line?.source,'quiz','the scene hides its quiz line');
  answer=pairAnswer();
  await said('Hello, my name is Ema.');
  await said('Could you check my booking, please?',{speaker:'costar'});
  assert.equal(conv().line.found,undefined,"the co-star's line is no find");
  await said('Yes, check my booking.');await said('Thank you.',{speaker:'costar'});
  assert.equal(conv().line.found,undefined,"reading back the co-star's words is no find either");
  assert.equal(getLearner('ema').english.taught.length,0);
});

test('a co-star who is a learner profile earns observations from their own line, on their own record, and only there',async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStarLearnerId:'jakub'}});
  assert.deepEqual(conv().duet,{coStar:'Jakub',coStarLearnerId:'jakub',beat:'learner'});
  answer=pairAnswer({
    observations:[{skill:'request',quote:'I need my booking',success:true,confidence:'clear',note:'Asked.'}],
    moment:{kind:'fix',said:'I need my booking',better:'I need to find my booking',why:'Say what you need to do.'},
    coStarObservations:[{skill:'repair',quote:'Sorry, what date did you book it?',success:true,confidence:'clear',note:'Asked to confirm.'},{skill:'request',quote:'I need my booking',success:true,confidence:'clear',note:'The learner\'s words.'}],
  });
  await said('I need my booking.');
  calls.length=0;
  await said('Sorry, what date did you book it?',{speaker:'costar'});
  assert('coStarObservations' in calls[0].schema.properties,'a profiled co-star is assessed apart');
  assert.match(calls[0].prompt.task,/coStarObservations: the same assessment of coStarReply alone/);
  const ema=getLearner('ema').english,jakub=getLearner('jakub').english;
  assert.deepEqual(ema.evidence.map(e=>e.quote),['I need my booking']);
  assert.deepEqual(jakub.evidence.map(e=>e.quote),['Sorry, what date did you book it?'],'only a quote of the co-star\'s own line, on their record');
  assert.equal(jakub.evidence[0].turnId,conv().turns.find(t=>t.role==='costar').id);
  assert.equal(conv().moment?.said,'I need my booking','a moment on the learner\'s own line still stops the scene');
  assert.equal(ema.taught.length,1);assert.equal(jakub.taught.length,0);
});

test('Family mode: a co-star profile makes the room the stricter of the two; a named co-star leaves the learner\'s mode',async()=>{
  // Jakub is an adult who chose Adult mode; Ema is 16
  const adult={...defaultPreferences({type:'other'}),adultConfirmed:true};
  const seatJakub=()=>{fresh('jakub');saveEnglish('jakub',{...emptyEnglish(),preferences:adult});};
  seatJakub();
  await rejects(command('start',{sceneId:'date',duet:{coStarLearnerId:'ema'}}),403,/not available for Ema/);
  assert.equal(calls.length,0);
  answer=async()=>({json:{title:'A booking',goal:'Sort it out.',opening:'Shall we discuss it over a beer?',supportProvided:false,help:{}},provider:'test',ms:1});
  await command('start',{sceneId:'booking',duet:{coStarLearnerId:'ema'}});
  assert.equal(conv().turns[0].text,REDIRECT_LINE,'with Ema in the room the gate holds an adult line');
  assert.match(calls[0].system,/This desk is in Family mode|not an adult/);
  seatJakub();
  answer=async()=>({json:{title:'A booking',goal:'Sort it out.',opening:'Shall we discuss it over a beer?',supportProvided:false,help:{}},provider:'test',ms:1});
  await command('start',{sceneId:'booking',duet:{coStar:'Sam'}});
  assert.equal(conv().turns[0].text,'Shall we discuss it over a beer?','a named co-star has no profile: the learner\'s Adult mode stands');
  // and a duet takes no Cut, even in Adult mode
  answer=pairAnswer();
  await said('Yes, sure.');await said('Fine by me.',{speaker:'costar'});
  const c=conv();
  assert.equal(accepts(c,'cut','adult'),false);assert.match(refusal(c,'cut','adult'),/duet/);
  await rejects(command('cut'),409,/duet/);
});

test('a duet cannot start the lost jacket, cannot name a profile that is not at the desk, and needs a name',async()=>{
  fresh();
  await rejects(command('start',{sceneId:'lost',duet:{coStar:'Mum'}}),400,/lost jacket is played on your own/);
  await rejects(command('start',{sceneId:'booking',duet:{coStarLearnerId:'nobody'}}),400);
  await rejects(command('start',{sceneId:'booking',duet:{coStarLearnerId:'ema'}}),400,/someone else/);
  await rejects(command('start',{sceneId:'booking',duet:{coStar:'%%%'}}),400,/name/);
  await rejects(command('start',{sceneId:'booking',duet:{coStar:'Sexy Sam'}}),400,/another name/);
  assert.equal(calls.length,0,'every refusal comes before any call');
  assert.equal(D.cleanCoStar('  Grandpa   Joe the Third  '),'Grandpa Joe the');
  assert.equal(D.cleanCoStar('Ema <script>'),'Ema script');
});

test('a scene without a duet behaves as before: one call per line, and no line may claim the co-star\'s beat',async()=>{
  fresh();
  await command('start',{sceneId:'booking'});
  const c=conv();assert.equal(c.duet,undefined);
  calls.length=0;answer=pairAnswer();
  await rejects(said('Hello.',{speaker:'costar'}),409,/no co-star/);
  await said('Hello, I lost my booking.');
  assert.equal(calls.length,1);assert.equal(calls[0].prompt.coStarReply,undefined);assert.equal(calls[0].prompt.duet,undefined);
  assert(!calls[0].system.includes('DUET'),'no duet paragraph');
  assert.deepEqual(conv().turns.map(t=>t.role),['partner','learner','partner']);
});

test('the TV and phone say whose turn it is; the reply box sends the beat\'s speaker',async()=>{
  fresh();
  await command('start',{sceneId:'booking',duet:{coStar:'Mum'}});
  let v=lingaView({...getSession(),screen:'linga-talk'});
  assert.equal(v.captionTag,"Ema's turn");assert.equal(v.answer.speaker,'learner');assert.equal(v.answer.label,'Reply to Robin · Receptionist');
  answer=pairAnswer();
  await said('It is under Novak.');
  v=lingaView({...getSession(),screen:'linga-talk'});
  assert.equal(v.captionTag,"Mum's turn");assert.equal(v.answer.speaker,'costar');assert.match(v.answer.label,/^Mum replies to/);
  assert.match(viewText(v),/Mum's turn: Mum answers on the phone/);
  assert.equal(v.spoken.line,HOST,'the host line stays on the speaker through both beats');
  assert(v.phone.find(a=>a.id==='coach')?.disabled,'coach waits for the pair');
  // the rendered TV and phone draw exactly what the view offers, in both beats
  const S=require(path.resolve(__dirname,'../uat/driver/surface.cjs'));
  for(const beat of ['costar','learner']){
    if(beat==='learner')await said('Novak.',{speaker:'costar'});
    const sf=S.surfaceOf({...getSession(),screen:'linga-talk'});
    assert.deepEqual(sf.strays,[],`${beat}: no stray control`);assert.deepEqual(sf.unrendered,[],`${beat}: nothing unrendered`);
    assert.match(sf.phone,beat==='costar'?/Mum's turn/:/Ema's turn/);
    if(beat==='learner')assert.match(sf.phone,/Co-star helper/);
  }
});
