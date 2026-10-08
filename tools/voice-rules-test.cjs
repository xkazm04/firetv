/**
 * The tutor's voice fits the learner's age (Family mode, Phase 1, W2; owner decision D6: the young voice is for 11-13).
 * rules/voice bands the age (young: known and <= 13; teen: 14+ and an unknown age) and hands the engines the words that
 * name the learner plus one manner paragraph. What this suite pins:
 *   - the rules never move: every band's assembled prompt holds each withholding clause verbatim, the exact constants the
 *     engines build the prompt from, and a young prompt is the teen prompt with the learner's name-words swapped and the
 *     manner appended, nothing else - so a band cannot loosen a rule;
 *   - 14, 15, 17, 25 and no age at all get today's prompts byte for byte (literals captured from git HEAD c1d8641, before W2);
 *   - 12 and 13 never read "15-year-old" or "teenager"; a Calculus learner is spoken to as the course's student at any age;
 *   - the seated profile's age reaches the prompt through the routes.
 * Tone is not test-decidable: a person reads the young voice aloud. Run with npm test in desk/ (directly: node
 * tools/voice-rules-test.cjs). No model is called - the text engine is stubbed at the provider seam; a disposable data
 * directory under the OS temp dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-voice-'));delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));
const V=require(src('lib/rules/voice.ts'));
const H=require(src('lib/desk/hint.ts'));
const E=require(src('lib/desk/essay.ts'));
const X=require(src('lib/desk/explain.ts'));
const EN=require(src('lib/desk/english.ts'));
const store=require(src('lib/session/store.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());

// ------------------------------------------------------------------ today's system prompts, from git HEAD before W2
// One entry per engine prompt (hint 2 shares hint 1's system; the english hint is shown without a rule card, which is appended unchanged).
const TODAY={
 "hint.maths.1":"You are a maths tutor for a 15-year-old. This sheet is a factoring and linear-equations unit; prefer the unit's methods over heavier ones.. Socratic rules, absolute: never state the final answer, never write the completed solution, never fill in a blank, never state a verb form or an ending. Point at the method, the next step, or the mistake to avoid. Two or three sentences at most. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.\n\nWho reads it: the learner, on the TV and aloud - both the hint and what_to_try_next. Speak to them as \"you\". Never refer to the learner in the third person and never write instructions for a teacher, parent or tutor. what_to_try_next is one concrete thing the learner can do on their paper now: WHERE to look or WHAT to write down (circle a term, copy a line, write the two sides one under the other, write their own answer to the hint's question). The hint asks the learner a question; what_to_try_next must never answer it. Never name in it the operation, the number or the result the hint's question is asking for - if the hint asks \"what undoes the + 5?\", what_to_try_next does not say \"subtract 5\"; it says where to write their answer. You have not seen their work and they have not answered you: do not open with praise, agreement or a verdict (no \"Perfect\", \"Great\", \"Right\", \"Good\"); start with the maths.",
 "hint.maths.calc":"You are a maths tutor for a first-year university student in Calculus I. Use the course's methods and notation - limits, the derivative rules, antiderivatives and the Fundamental Theorem - and name the rule that applies. Socratic rules, absolute: never state the final answer, never write the completed solution, never fill in a blank, never state a verb form or an ending. Point at the method, the next step, or the mistake to avoid. Two or three sentences at most. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.\n\nWho reads it: the learner, on the TV and aloud - both the hint and what_to_try_next. Speak to them as \"you\". Never refer to the learner in the third person and never write instructions for a teacher, parent or tutor. what_to_try_next is one concrete thing the learner can do on their paper now: WHERE to look or WHAT to write down (circle a term, copy a line, write the two sides one under the other, write their own answer to the hint's question). The hint asks the learner a question; what_to_try_next must never answer it. Never name in it the operation, the number or the result the hint's question is asking for - if the hint asks \"what undoes the + 5?\", what_to_try_next does not say \"subtract 5\"; it says where to write their answer. You have not seen their work and they have not answered you: do not open with praise, agreement or a verdict (no \"Perfect\", \"Great\", \"Right\", \"Good\"); start with the maths.",
 "hint.essay":"You are a writing tutor for a 15-year-old. Socratic rules, absolute: never state the final answer, never write the completed solution, never fill in a blank, never state a verb form or an ending. Point at the method, the next step, or the mistake to avoid. Two or three sentences at most. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.\n\nWho reads it: the learner, on the TV and aloud - both the hint and what_to_try_next. Speak to them as \"you\". Never refer to the learner in the third person and never write instructions for a teacher, parent or tutor. what_to_try_next is one concrete thing the learner can do on their paper now: WHERE to look or WHAT to write down (circle a term, copy a line, write the two sides one under the other, write their own answer to the hint's question). The hint asks the learner a question; what_to_try_next must never answer it. Never name in it the operation, the number or the result the hint's question is asking for - if the hint asks \"what undoes the + 5?\", what_to_try_next does not say \"subtract 5\"; it says where to write their answer. You have not seen their work and they have not answered you: do not open with praise, agreement or a verdict (no \"Perfect\", \"Great\", \"Right\", \"Good\"); start with the maths.",
 "hint.english":"You are an English tutor for a Czech teenager learning English; explain in plain English, examples in English. Socratic rules, absolute: never state the final answer, never write the completed solution, never fill in a blank, never state a verb form or an ending. Point at the method, the next step, or the mistake to avoid. Two or three sentences at most. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.\n\nWho reads it: the learner, on the TV and aloud - both the hint and what_to_try_next. Speak to them as \"you\". Never refer to the learner in the third person and never write instructions for a teacher, parent or tutor. what_to_try_next is one concrete thing the learner can do on their paper now: WHERE to look or WHAT to write down (circle a term, copy a line, write the two sides one under the other, write their own answer to the hint's question). The hint asks the learner a question; what_to_try_next must never answer it. Never name in it the operation, the number or the result the hint's question is asking for - if the hint asks \"what undoes the + 5?\", what_to_try_next does not say \"subtract 5\"; it says where to write their answer. You have not seen their work and they have not answered you: do not open with praise, agreement or a verdict (no \"Perfect\", \"Great\", \"Right\", \"Good\"); start with the maths.",
 "essay.reading":"You are a writing tutor for a 15-year-old. Lens for this reading: Structure — Judge each sentence by its role in the paragraph: is there a claim, is it followed by evidence, is there a link back to the argument? Observe each sentence by its number and report only what you see; the desk decides what is done well and what needs fixing. For each sentence, report the job it does: job is claim, evidence, link, context or none. Each note is one short sentence a student can act on, no praise-padding. Never rewrite their sentences for them. For a 'faulty' verdict only, add a fix to a sentence you see a problem in: 'move' names the technique in 2 to 6 words (for example \"Concede, then turn it back\"), and 'pattern' is a sentence frame with the content left as bracketed slots for the student to fill (for example \"Although [the other side], [why your claim still holds].\"). A pattern is a template, never their sentence rewritten: none of their words, at least one [slot], at most ten words outside the slots. No fix on strong or neutral verdicts. Then one summary sentence. Plain text, to be read aloud.",
 "essay.revise":"You are a writing tutor for a 15-year-old. Lens for this reading: Structure — Judge each sentence by its role in the paragraph: is there a claim, is it followed by evidence, is there a link back to the argument? The student has rewritten one sentence of their paragraph, sentence 2. Observe sentence 2 alone, in the context of the paragraph, and give exactly one observation, for sentence 2; report only what you see, the desk decides whether it now does its job. For each sentence, report the job it does: job is claim, evidence, link, context or none. Do not observe the other sentences. The note is one short sentence a student can act on, no praise-padding. Never rewrite their sentences for them. For a 'faulty' verdict only, add a fix to a sentence you see a problem in: 'move' names the technique in 2 to 6 words, and 'pattern' is a sentence frame with the content left as bracketed slots. A pattern is a template, never their sentence rewritten: none of their words, at least one [slot], at most ten words outside the slots. No fix on strong or neutral verdicts. Plain text, to be read aloud.",
 "explain.school":"You are a maths tutor listening to a school student explain their own working out loud. Socratic rules, absolute: never state the final answer, never give the completed line, never say whether they are right or wrong. Point at the step they should look at again, or at the step that was the good one. One or two sentences. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.",
 "explain.calc":"You are a calculus tutor listening to a first-year university student on the Calculus 1 course explain their own working out loud. Socratic rules, absolute: never state the final answer, never give the completed line, never say whether they are right or wrong. Point at the step they should look at again, or at the step that was the good one. One or two sentences. Plain text only — no LaTeX, no markdown; write x^2 as x². This will be read aloud.",
 "english.sentence":"You are an English tutor talking to a Czech teenager about the sentence they just wrote; your words are the caption under it on a TV screen, read aloud. Speak to them directly as \"you\"; never call them the student, the learner, he, she or they. At most two short sentences, 30 words in total. Plain English, no markdown. Write only the caption itself, never a description of what you did or of these rules, and never mention the rule card. Socratic rules, absolute: never write the corrected sentence, never state a verb form or an ending, not even as an example (no \"go → went\"), never repeat a form from the rule card; you may quote only words they wrote. Point at the time word and the tense it asks for, and leave the form for them to find. The rule card is final: do not contradict it and do not decide the tense yourself.",
};
TODAY['hint.maths.2']=TODAY['hint.maths.1'];

// ------------------------------------------------------------------ the engines, stubbed at the provider seam
let seen=[];
function stub(){seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{
 seen.push(req);const p=Object.keys(req.schema?.properties??{});
 let a={hint:'h',what_to_try_next:'w'};
 if(p.includes('observations'))a={observations:[{n:2,job:'claim',note:'n',fix:{move:'Concede, then turn it back',pattern:'Although [a], [b].'}}],summary:'s'};
 if(p.includes('reply'))a={reply:'r',slip:'unclear',value:''};
 if(p.includes('explanation'))a={explanation:'e'};
 return {raw:JSON.stringify(a)};
}});}
const PARA='The school day starts too early. Research found that teenagers fall asleep later. Therefore the start should move.';
const P='Solve for x:  3x − 7 = 11';
const sys=async(fn)=>{stub();await fn();assert.equal(seen.length,1,'one model call, as before');return seen[0].system;};
/** Every engine prompt at one age, keyed like TODAY (the english hint without a rule card). */
async function prompts(age){
 const o={};
 o['hint.maths.1']=await sys(()=>H.hint('maths',P,{age}));
 o['hint.maths.2']=await sys(()=>H.hint('maths',P,{previous:'Look at the sign next to x.',age}));
 o['hint.maths.calc']=await sys(()=>H.hint('maths','Differentiate f(x) = x^3',{path:'calc1',age}));
 o['hint.essay']=await sys(()=>H.hint('essay','My essay',{age}));
 o['hint.english']=await sys(()=>H.hint('english','I go to school yesterday.',{age}));
 let reading;
 o['essay.reading']=await sys(async()=>{reading=await E.analyseEssay(PARA,'claim','voice-test-learner',age);});
 o['essay.revise']=await sys(()=>E.reviseSentence(reading,2,'A 2019 study found that teenagers fall asleep two hours later.',age));
 o['explain.school']=await sys(()=>X.explain('Solve 3x-7=11','I added seven','linear-two-step','voice-test-learner',false,age));
 o['explain.calc']=await sys(()=>X.explain('Differentiate x^3','I used the power rule','power-rule','voice-test-learner',true,age));
 o['english.sentence']=await sys(()=>EN.analyseSentence('I go to school yesterday.',age));
 return o;
}
const TEEN_AGES=[undefined,14,15,17,25],YOUNG_AGES=[12,13];
const CALC_KEYS=['hint.maths.calc','explain.calc'];

// ------------------------------------------------------------------ 1: the module
test('1: voiceOf - the bands, today\'s words for teen, a different voice for young, pure',()=>{
 for(const a of TEEN_AGES)assert.equal(V.bandOf(a),'teen',String(a));
 for(const a of [0,5,10,11,12,13])assert.equal(V.bandOf(a),'young',String(a));
 for(const a of [null,undefined,NaN,Infinity,14])assert.equal(V.bandOf(a),'teen',String(a));
 assert.equal(V.YOUNG_MAX_AGE,13);
 const TODAY_WHO={maths:'a 15-year-old',essay:'a 15-year-old',english:'a Czech teenager'};
 for(const subject of ['maths','essay','english']){
  for(const a of TEEN_AGES){
   const v=V.voiceOf(subject,a);
   assert.deepEqual(v,{band:'teen',who:TODAY_WHO[subject],manner:''},`${subject} at ${a}: today's words, nothing added`);
  }
  const teen=V.voiceOf(subject),young=V.voiceOf(subject,12);
  assert.equal(young.band,'young');
  assert.notEqual(young.who,teen.who);assert.notEqual(young.manner,teen.manner);assert.ok(young.manner.length>200,'a young voice says how to sound');
  assert.deepEqual(V.voiceOf(subject,12),young,'same input, same output');
  assert.deepEqual(V.voiceOf(subject,13),young,'12 and 13 are one voice');
  assert.doesNotMatch(young.who+young.manner,/15-year-old|teenager/i);
  assert.match(young.manner,/every rule above still holds/,'the manner says the rules are not touched');
  // the manner tells HOW to sound; it holds no rule text of its own to drift from the prompts'
  assert.doesNotMatch(young.manner,/Socratic rules, absolute/);
 }
 assert.equal(V.withManner('SYS',V.voiceOf('maths')),'SYS');
 assert.equal(V.withManner('SYS',V.voiceOf('maths',12)),'SYS\n\n'+V.voiceOf('maths',12).manner);
 // maths keeps the answer back, essay keeps the sentences the learner's own
 assert.match(V.voiceOf('maths',12).manner,/never state the final answer/);
 assert.match(V.voiceOf('essay',12).manner,/never rewrite or improve their sentences/);
});

test('2: learnerAge reads the seated profile, undefined for nobody, no profile or no age',()=>{
 const profiles=[{id:'a',age:12},{id:'b'},{id:'c',age:16}];
 assert.equal(V.learnerAge({profiles,learner:{id:'a'}}),12);
 assert.equal(V.learnerAge({profiles,learner:{id:'c'}}),16);
 assert.equal(V.learnerAge({profiles,learner:{id:'b'}}),undefined);
 assert.equal(V.learnerAge({profiles,learner:{id:'zz'}}),undefined);
 assert.equal(V.learnerAge({profiles,learner:null}),undefined);
 assert.equal(V.learnerAge({}),undefined);
 assert.equal(V.learnerAge({profiles:[{id:'a',age:NaN}],learner:{id:'a'}}),undefined);
});

// ------------------------------------------------------------------ 3: 14+ and no age: byte for byte
test('3: 14, 15, 17, 25 and no age get today\'s prompts byte for byte',async()=>{
 for(const age of TEEN_AGES){
  const got=await prompts(age);
  for(const k of Object.keys(TODAY))assert.equal(got[k],TODAY[k],`${k} at age ${age}`);
  assert.equal(got['hint.maths.2'],TODAY['hint.maths.1'],'hint 2 shares hint 1\'s system prompt');
 }
 // the fragment itself, once each
 assert.ok(TODAY['hint.maths.1'].startsWith('You are a maths tutor for a 15-year-old. This sheet is a factoring and linear-equations unit; prefer the unit\'s methods over heavier ones.. Socratic rules, absolute:'),'today\'s text, its double stop included');
 assert.ok(TODAY['essay.reading'].startsWith('You are a writing tutor for a 15-year-old. Lens for this reading:'));
 assert.ok(TODAY['english.sentence'].startsWith('You are an English tutor talking to a Czech teenager about the sentence'));
});

// ------------------------------------------------------------------ 4: 12 and 13: a different voice, the same rules
/** The clauses that keep the answer back, by prompt: the constants the engines build the prompts from. */
const WITHHOLD={
 'hint.maths.1':[H.HINT_WITHHOLD],'hint.maths.2':[H.HINT_WITHHOLD],'hint.essay':[H.HINT_WITHHOLD],'hint.english':[H.HINT_WITHHOLD],
 'essay.reading':[E.NEVER_REWRITE,E.PATTERN_RULE],'essay.revise':[E.NEVER_REWRITE,E.PATTERN_RULE],
 'explain.school':[X.EXPLAIN_WITHHOLD],'english.sentence':[EN.ENGLISH_WITHHOLD.trim()],
};
const SUBJECT={'hint.maths.1':'maths','hint.maths.2':'maths','hint.essay':'essay','hint.english':'english','essay.reading':'essay','essay.revise':'essay','explain.school':'maths','english.sentence':'english'};
test('4: 12 and 13 - no "15-year-old" or "teenager", every withholding clause verbatim, and nothing else changed but the name-words and the manner',async()=>{
 for(const age of YOUNG_AGES){
  const got=await prompts(age);
  assert.equal(got['hint.maths.2'],got['hint.maths.1']);
  for(const [k,clauses] of Object.entries(WITHHOLD)){
   const p=got[k];
   assert.doesNotMatch(p,/15-year-old|teenager/i,`${k} at ${age}`);
   for(const c of clauses){assert.ok(c.length>20,'the clause is a real string');assert.ok(p.includes(c),`${k} at ${age} keeps: ${c.slice(0,50)}`);assert.ok(TODAY[k].includes(c),'and it is today\'s text');}
   // the rules are shared, not copied: the young prompt is today's with the name-words swapped, plus the manner
   const teen=V.voiceOf(SUBJECT[k]),young=V.voiceOf(SUBJECT[k],age);
   assert.equal(p,TODAY[k].replace(teen.who,young.who)+'\n\n'+young.manner,`${k} at ${age}`);
   assert.notEqual(p,TODAY[k]);
  }
  // the hint's own further rules ride along too
  for(const clause of ['what_to_try_next must never answer it','do not open with praise, agreement or a verdict','Never refer to the learner in the third person'])assert.ok(got['hint.maths.1'].includes(clause),clause);
  // the withholding clauses of the reading stay in the reading's first paragraph, before the manner
  assert.ok(got['essay.reading'].indexOf(E.NEVER_REWRITE)<got['essay.reading'].indexOf(V.voiceOf('essay',age).manner));
  // the young voice reads differently
  assert.notEqual(V.voiceOf('maths',age).manner,V.voiceOf('maths').manner);
 }
});

test('5: a Calculus learner is spoken to as the course\'s student at any age - the Calculus prompts do not move for 12',async()=>{
 for(const age of [...YOUNG_AGES,...TEEN_AGES]){
  const got=await prompts(age);
  for(const k of CALC_KEYS)assert.equal(got[k],TODAY[k],`${k} at age ${age}`);
 }
 assert.match(TODAY['explain.calc'],/first-year university student on the Calculus 1 course/);
 assert.match(TODAY['hint.maths.calc'],/first-year university student in Calculus I/);
 assert.ok(TODAY['explain.calc'].includes(X.EXPLAIN_WITHHOLD),'the Calculus explain prompt is built from the shared withholding constant');
});

// ------------------------------------------------------------------ 6: the seated profile's age reaches the prompt through the routes
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const drain=async()=>{for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));};
function seat(id,age,text){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id,name:'Scratch',type:age===undefined?'other':age<=14?'elementary':'high-school',...(age===undefined?{}:{age})}});store.dispatch({type:'profile.save'});
 if(text){
  const page={id:`maths-${id}`,subject:'maths',title:'Sheet',img:'',w:100,h:100};
  store.dispatch({type:'page.reading',page});store.dispatch({type:'page.read',id:page.id,items:[{n:1,text,cx:0,cy:0,band:[0,10],key:'k1'}],readMs:1,provider:'test'});
 }
}
function captureSystems(){
 const systems=[];
 reg.useProvider('text',{name:'stub',run:async(req)=>{
  systems.push(req.system);const p=Object.keys(req.schema?.properties??{});
  const a=p.includes('observations')?{observations:[{n:1,job:'context',note:'n'}],summary:'s'}:p.includes('explanation')?{explanation:'e'}:p.includes('lesson')?{lesson:'none',why:'x'}:p.includes('reply')?{reply:'Look at the first step again.',slip:'unclear',value:''}:{hint:'Look at the sign.',what_to_try_next:'Write it.'};
  return {raw:JSON.stringify(a)};
 }});
 return systems;
}
test('6: routes - api/hint and api/analyse voice the seated profile\'s age; 14+ or no age is today\'s text',async()=>{
 for(const [age,young] of [[11,true],[12,true],[13,true],[14,false],[16,false],[undefined,false]]){
  seat(`voice-hint-${age}`,age,P);
  let systems=captureSystems();
  assert.equal((await post('hint',{})).status,200);await drain();
  const hintSystem=systems.find((x)=>x.startsWith('You are '));
  assert.ok(hintSystem,'a hint prompt was sent');
  assert.equal(hintSystem===TODAY['hint.maths.1'],!young,`hint at age ${age}`);
  assert.equal(hintSystem.includes(V.voiceOf('maths',12).manner),young);
  if(!young)assert.match(hintSystem,/a maths tutor for a 15-year-old/);
  else assert.match(hintSystem,/a maths tutor for a learner aged 11 to 13/);
  // the second hint (still stuck) is voiced the same way
  systems=captureSystems();
  assert.equal((await post('hint',{stage:2})).status,200);await drain();
  assert.equal(systems.find((x)=>x.startsWith('You are '))===TODAY['hint.maths.1'],!young,`hint 2 at age ${age}`);
  // an essay reading
  seat(`voice-essay-${age}`,age);
  systems=captureSystems();
  assert.equal((await post('analyse',{kind:'essay',text:PARA,type:'claim'})).status,200);await drain();
  assert.equal(systems.length,1);
  assert.equal(systems[0]===TODAY['essay.reading'],!young,`essay reading at age ${age}`);
  assert.equal(systems[0].includes('a writing tutor for a learner aged 11 to 13'),young);
  // an English sentence
  systems=captureSystems();
  assert.equal((await post('analyse',{kind:'english',sentence:'I go to school yesterday.'})).status,200);await drain();
  assert.equal(systems[0]===TODAY['english.sentence'],!young,`english caption at age ${age}`);
 }
});

test('7: routes - api/explain voices the seated profile\'s age on a school item, and never on a Calculus item',async()=>{
 const spec={shape:'evaluate',f:'x^2',a:3,answer:'9',value:9,zero:true};
 for(const [age,young] of [[12,true],[13,true],[14,false],[16,false],[undefined,false]]){
  for(const calc of [false,true]){
   seat(`voice-explain-${age}-${calc}`,age);
   store.dispatch({type:'practice.set',practice:{topic:calc?'power-rule':'linear-two-step',marked:false,items:[{n:1,question:calc?'Differentiate x^3.':'Solve 3x - 7 = 11.',...(calc?{spec}:{})}]}});
   const systems=captureSystems();
   assert.equal((await post('explain',{transcript:'I added seven first',n:0})).status,200);await drain();
   assert.equal(systems.length,1);
   const today=calc?TODAY['explain.calc']:TODAY['explain.school'];
   assert.equal(systems[0]===today,!(young&&!calc),`explain (${calc?'calculus':'school'}) at age ${age}`);
   if(young&&!calc)assert.equal(systems[0],today+'\n\n'+V.voiceOf('maths',age).manner);
  }
 }
});
