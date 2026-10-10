/**
 * A photographed Calculus page is marked by CODE (desk/src/lib/desk/mark.ts, the spec branch). The vision model is
 * asked only to READ the page - the final answer as plain text, the working line by line, and a slip id from the
 * topic's closed list - never to solve and never for a verdict; a verdict or a solution it volunteers is never read.
 * The verdict is rules/calc checkAnswer(spec, studentAnswer): right, wrong, or unsure when the answer cannot be read or
 * compared (ASK, no attempt recorded). The slip on a wrong item is code's own (sign, lost-constant) where code names
 * one, else the model's pick only when it is in the topic's vocabulary (rules/maths slipsFor, which now serves the
 * calc1 topics). An explanation settles an unsure Calculus item the same way from the answer the learner says they
 * got, and a reply that states the answer (rules/calc leaksCalc) is replaced by the item's own line.
 * Run with npm test in desk/ (directly: node tools/calc-marking-test.cjs). No model is called - the vision and text
 * engines are stubbed at the provider registry - and the data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-calc-marking-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const {view}=require(src('lib/session/pairing.ts'));
const C=require(src('lib/rules/calc.ts'));
const M=require(src('lib/rules/maths.ts'));
const {NOT_HEARD_LINE}=require(src('lib/desk/explain.ts'));
const CANNOT_READ='The desk cannot read this answer as mathematics, and it does not guess.';
const {topicIn}=require(src('lib/library/paths.ts'));
const {CALC1_SPINE}=require(src('lib/library/calculus1.spine.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const PHOTO={image:'data:image/jpeg;base64,AAAA',w:100,h:100};
const LEARNER='calc-mark-scratch';
function seat(){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Calc',type:'other',modules:['maths'],mathPath:'calc1'}});store.dispatch({type:'profile.save'});
}
/** Every key anywhere in a value, however deep. */
const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];
/** Every string anywhere in a value, however deep. */
const stringsIn=(o)=>typeof o==='string'?[o]:o&&typeof o==='object'?Object.values(o).flatMap(stringsIn):[];

/** The vision stub: every request is kept, the answer is a function of it. */
let seenVision=[];
const stubVision=(f)=>{seenVision=[];reg.useProvider('vision',{name:'stub',run:async(req)=>{seenVision.push(req);return {raw:JSON.stringify(await f(req))};}});};
let seenText=[];
const stubText=(f)=>{seenText=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seenText.push(req);return {raw:JSON.stringify(await f(req))};}});};

/** A spec built by rules/calc: it must be one the desk can print and judge. */
function spec(s){const w=C.wellFormed(s);assert.ok(w.ok,`${JSON.stringify(s)}: ${w.why}`);return s;}
/**
 * One topic per shape: its spec, and a page's answers - an equivalent right form, two wrong answers, the sign slip -
 * plus (antiderivative) a correct function without +C. `truth` is only what the stub volunteers as its 'solution';
 * `inVocab` a slip id on the topic's list (not code's own), `outVocab` one that is not.
 */
const FIX=[
 {topic:'calc1-functions',spec:spec({shape:'evaluate',f:'x^2 + 3x',at:'2'}),right:'20/2',wrong:'11',wrong2:'12',sign:'-10',truth:'10',inVocab:'arithmetic-slip',outVocab:'forgot-chain'},
 {topic:'calc1-limit-idea',spec:spec({shape:'limit',f:'sin(3x)/x',at:'0'}),right:'6/2',wrong:'1',wrong2:'0',sign:'-3',truth:'3',inVocab:'limit-substituted-early',outVocab:'bounds-swapped'},
 {topic:'calc1-rules',spec:spec({shape:'derivative',f:'3x^2 + 2x'}),right:'2(3x + 1)',wrong:'6x',wrong2:'3x^2 + 2',sign:'-6x - 2',truth:'6x + 2',inVocab:'forgot-chain',outVocab:'bounds-swapped'},
 {topic:'calc1-related-rates',spec:spec({shape:'derivative-at',f:'x^3',at:'2'}),right:'24/2',wrong:'8',wrong2:'6',sign:'-12',truth:'12',inVocab:'product-as-product',outVocab:'lost-inner-factor'},
 {topic:'calc1-extrema',spec:spec({shape:'critical-point',f:'x^2 - 4x + 1',on:['0','5']}),right:'4/2',wrong:'3',wrong2:'1',sign:'-2',truth:'2',inVocab:'forgot-second-derivative-check',outVocab:'limit-substituted-early'},
 {topic:'calc1-optimisation',spec:spec({shape:'extremum',f:'-x^2 + 4x',on:['0','5'],kind:'max'}),right:'8/2',wrong:'5',wrong2:'3',sign:'-4',truth:'4',inVocab:'forgot-second-derivative-check',outVocab:'lost-constant'},
 {topic:'calc1-newton',spec:spec({shape:'newton-step',f:'x^2 - 2',x0:'1',steps:1}),right:'3/2',wrong:'2',wrong2:'1.25',sign:'-1.5',truth:'1.5',inVocab:'decimal-newton-slip',outVocab:'bounds-swapped'},
 {topic:'calc1-antiderivatives',spec:spec({shape:'antiderivative',f:'2x'}),right:'x^2 + C',wrong:'x^2/2 + C',wrong2:'2x^2 + C',sign:'-x^2 + C',bare:'x^2',truth:'x^2 + C',inVocab:'power-off-by-one',outVocab:'forgot-chain'},
 {topic:'calc1-definite-integral',spec:spec({shape:'definite-integral',f:'2x',a:'0',b:'3'}),right:'18/2',wrong:'6',wrong2:'3',sign:'-9',truth:'9',inVocab:'bounds-swapped',outVocab:'limit-substituted-early'},
];
const shapesOf=(topic)=>CALC1_SPINE.find((t)=>t.id===topic).shapes;
const calcIds=(topic)=>[...new Set(shapesOf(topic).flatMap((sh)=>C.slipsFor(sh)))];
const BLANK='',UNREADABLE='squiggle ## ~';
/** What the stub volunteers as its own worked answer: it must never reach a verdict, a screen or the record. */
const SOLVED=(t)=>`SOLVED ${t}`;

/**
 * A page for one topic: n, the answer written, what code must decide, the slip it must keep, and the model's word -
 * a verdict that is always the opposite of the truth (or 'right' on an unreadable page), a slip pick, a solution.
 */
function page(fx){
 const rows=[
  {a:fx.right,verdict:'right',slip:undefined,model:{verdict:'wrong',slip:fx.inVocab}},
  {a:fx.wrong,verdict:'wrong',slip:undefined,model:{verdict:'right',slip:fx.outVocab}},
  {a:fx.wrong2,verdict:'wrong',slip:fx.inVocab,model:{verdict:'right',slip:fx.inVocab}},
  {a:fx.sign,verdict:'wrong',slip:'sign',model:{verdict:'right',slip:fx.inVocab}},
  {a:BLANK,verdict:'unsure',slip:undefined,model:{verdict:'right',slip:fx.inVocab}},
  {a:UNREADABLE,verdict:'unsure',slip:undefined,model:{verdict:'right',slip:fx.inVocab}},
 ];
 if(fx.bare)rows.push({a:fx.bare,verdict:'wrong',slip:'lost-constant',model:{verdict:'right',slip:fx.inVocab}});
 return rows.map((r,i)=>({...r,n:i+1}));
}
const question=(s)=>C.question(s).plain;
/** Put a calc set on the desk the way the practice route does (practice.set, the spec on every item). */
function setOn(topic,s,count){store.dispatch({type:'practice.set',practice:{topic,marked:false,items:Array.from({length:count},(_,i)=>({n:i+1,question:question(s),spec:s}))}});}
const skill=(topic)=>learners.getLearner(LEARNER).skills[topic]??{seen:0,right:0,slips:[]};

// ------------------------------------------------------------------ the vocabulary: rules/maths serves the calc1 topics
/** Is this id a line of the prompt's vocabulary (one slip per line, id first)? */
const listed=(vocab,id)=>vocab.split('\n').some((l)=>l.startsWith(`${id}: `));
test('1: slipsFor, slipVocabulary and slip() serve the calc1 topics from CALC_SLIPS; the school ids are untouched',()=>{
 for(const fx of FIX){
  const ids=M.slipsFor(fx.topic).map((s)=>s.id);
  assert.deepEqual([...ids].sort(),calcIds(fx.topic).sort(),`${fx.topic}: the ids that apply to its shapes`);
  for(const s of M.slipsFor(fx.topic)){
   const c=C.CALC_SLIPS.find((x)=>x.id===s.id);
   assert.deepEqual([s.says,s.points,s.name],[c.says,c.points,c.name],`${fx.topic} ${s.id}: the calc slip's own words`);
   assert.ok(Array.isArray(s.topics)&&s.topics.includes(fx.topic),`${fx.topic} ${s.id}: tagged with the topic`);
  }
  const vocab=M.slipVocabulary(fx.topic);
  assert.ok(listed(vocab,fx.inVocab),`${fx.topic}: ${fx.inVocab} is on its list`);
  assert.ok(!listed(vocab,fx.outVocab),`${fx.topic}: ${fx.outVocab} is not`);
 }
 assert.ok(listed(M.slipVocabulary('calc1-antiderivatives'),'lost-constant'));
 assert.equal(M.slip('lost-constant')?.name,'The constant left off');
 assert.equal(M.slip('forgot-chain')?.name,'The inside not differentiated');
 // the school table and its three ids: exactly as before
 for(const t of ['linear-one-step','linear-two-step','linear-both-sides']){
  assert.deepEqual(M.slipsFor(t),M.SLIPS.filter((s)=>s.topics.includes(t)),t);
  for(const c of C.CALC_SLIPS.filter((c)=>!M.SLIPS.some((s)=>s.id===c.id)))assert.ok(!listed(M.slipVocabulary(t),c.id),`${t}: no ${c.id}`);
 }
 assert.equal(M.slip('arithmetic-slip').says,M.SLIPS.find((s)=>s.id==='arithmetic-slip').says,'a shared id still reads as the school slip where no topic is named');
 assert.deepEqual(M.slipsFor('no-such-topic'),[]);
});

// ------------------------------------------------------------------ marking
test('2: a photographed page on each shape is marked by checkAnswer; the model\'s verdict and solution are never read',async()=>{
 assert.deepEqual(FIX.map((fx)=>fx.spec.shape).sort(),[...C.CALC_SHAPES].sort(),'one topic per shape');
 for(const fx of FIX)assert.ok(shapesOf(fx.topic).includes(fx.spec.shape),`${fx.topic}: ${fx.spec.shape} is its own shape`);
 for(const fx of FIX){
  seat();
  const rows=page(fx);
  setOn(fx.topic,fx.spec,rows.length);
  const was=skill(fx.topic),lines=learners.getLearner(LEARNER).history.length;
  stubVision(()=>({items:rows.map((r)=>({n:r.n,studentAnswer:r.a,studentWorking:r.a?`first line\nsecond line`:'',verdict:r.model.verdict,solution:SOLVED(fx.truth),slip:r.model.slip}))}));
  const res=await post('mark',PHOTO);
  assert.equal(res.status,200,fx.topic);
  const body=await res.json();
  const wrong=rows.filter((r)=>r.verdict==='wrong').length,unsure=rows.filter((r)=>r.verdict==='unsure').length;
  assert.deepEqual([body.right,body.wrong,body.unsure],[1,wrong,unsure],`${fx.topic}: the counts are code's`);

  // the one vision call asks only to READ the page
  assert.equal(seenVision.length,1);
  const req=seenVision[0];
  assert.match(req.prompt,new RegExp(`a photo of a student's handwritten working on these ${rows.length} Calculus questions`),fx.topic);
  assert.ok(req.prompt.includes(question(fx.spec)),`${fx.topic}: the questions are listed`);
  assert.deepEqual(Object.keys(req.schema.properties.items.items.properties).sort(),['n','slip','studentAnswer','studentWorking'],`${fx.topic}: no verdict, no solution asked for`);
  for(const w of [/\+C/,/\^/,/sqrt\(\)/,/\bln\b/,/LaTeX/,/one step per line/,/unclear/])assert.match(req.prompt,w,`${fx.topic}: ${w}`);
  for(const w of [/verdict/i,/solution/i,/YOUR OWN/,/value of x/i,/equations/i,/"right"/])assert.doesNotMatch(req.prompt,w,`${fx.topic}: ${w}`);
  assert.match(req.prompt,/do not solve/i);
  assert.ok(req.prompt.includes(M.slipVocabulary(fx.topic)),`${fx.topic}: the topic's own vocabulary`);

  const s=store.getSession(),items=s.practice.items;
  assert.equal(s.practice.marked,true);
  for(const r of rows){
   const it=items[r.n-1],where=`${fx.topic} #${r.n} "${r.a}"`;
   assert.equal(it.verdict,r.verdict,where);
   assert.equal(it.slip,r.slip,`${where}: slip`);
   if(r.verdict==='unsure')assert.ok(r.a.trim()===''?it.said===M.BLANK(r.n):it.said.startsWith(M.NOT_SURE(r.n,'x').slice(0,-1))&&!it.said.includes('something different'),`${where}: said ${it.said}`);
   else assert.equal(it.said,r.verdict==='right'?M.RIGHT(r.n):r.slip?M.slipsFor(fx.topic).find((x)=>x.id===r.slip).says:M.ASK(r.n),`${where}: said`);
   assert.equal(it.slipAt,undefined,`${where}: the pen has no position on a Calculus item`);
   assert.equal(it.studentAnswer,r.a,where);
   if(r.slip)assert.ok(M.slip(r.slip)?.name,`${where}: its name can be shown`);
  }
  // only right and wrong items reach the record, once each
  const now=skill(fx.topic);
  assert.equal(now.seen-was.seen,1+wrong,`${fx.topic}: attempts`);assert.equal(now.right-was.right,1,`${fx.topic}: right`);
  const h=learners.getLearner(LEARNER).history;
  assert.equal(h.length,lines+1,`${fx.topic}: one history line`);
  assert.equal(h.at(-1).label,topicIn(fx.topic).name,`${fx.topic}: labelled with the topic's name`);
  assert.equal(h.at(-1).detail,M.rightLine(items),`${fx.topic}: the restated line`);
  assert.equal(h.at(-1).detail,`1 of ${rows.length} right, 2 not sure`);

  // no view of the marked set holds a truth or an answer key; the volunteered solution went nowhere
  for(const [where,v] of [['tv',view(s,'tv')],['phone',view(s,'phone')]]){
   const keys=keysIn(v.practice);
   for(const k of ['answer','solution','truth','value'])assert.equal(keys.includes(k),false,`${fx.topic} ${where}: a ${k} key`);
   const strings=stringsIn(v);
   assert.ok(!strings.some((x)=>x.includes('SOLVED')),`${fx.topic} ${where}: the model's solution reached the view`);
   // every line on an item is the desk's own (RIGHT, ASK or the slip's words - asserted above), never a model's text
   const own=new Set([...rows.map((r)=>M.RIGHT(r.n)),...rows.map((r)=>M.ASK(r.n)),...rows.map((r)=>M.BLANK(r.n)),...M.slipsFor(fx.topic).map((x)=>x.says)]);
   for(const it of v.practice.items)assert.ok(own.has(it.said)||it.said.startsWith(`The desk is not sure about number ${it.n}. `),`${fx.topic} ${where}: "${it.said}"`);
  }
  assert.ok(!stringsIn(learners.getLearner(LEARNER)).some((x)=>x.includes('SOLVED')),`${fx.topic}: the model's solution reached the record`);
 }
});

test('3: the model\'s verdict is not a fallback either: an answer the desk cannot read stays unsure however sure the model is',async()=>{
 seat();
 const fx=FIX[2];
 setOn(fx.topic,fx.spec,2);
 const was=skill(fx.topic);
 stubVision(()=>({items:[{n:1,studentAnswer:'',studentWorking:'',verdict:'right',solution:'6x + 2',slip:'unclear'},{n:2,studentAnswer:'???',studentWorking:'',verdict:'wrong',solution:'6x + 2',slip:'forgot-chain'}]}));
 assert.equal((await post('mark',PHOTO)).status,200);
 const items=store.getSession().practice.items;
 assert.deepEqual(items.map((i)=>[i.verdict,i.slip,i.said]),[['unsure',undefined,M.BLANK(1)],['unsure',undefined,M.NOT_SURE(2,CANNOT_READ)]]);
 assert.equal(skill(fx.topic).seen,was.seen,'no attempt recorded for an unsure item');
});

// ------------------------------------------------------------------ the explanation
test('4: an explanation settles an unsure Calculus item from the answer the learner says, by checkAnswer; a leaking reply is replaced',async()=>{
 seat();
 const fx=FIX[2];
 setOn(fx.topic,fx.spec,4);
 stubVision(()=>({items:[1,2,3,4].map((n)=>({n,studentAnswer:'?',studentWorking:'',verdict:'right',solution:'6x + 2',slip:'unclear'}))}));
 assert.equal((await post('mark',PHOTO)).status,200);
 assert.ok(store.getSession().practice.items.every((i)=>i.verdict==='unsure'));
 const lines=()=>learners.getLearner(LEARNER).history;
 const n0=lines().length,was=skill(fx.topic);

 // a spoken right answer (in another form) settles it right
 stubText(()=>({reply:'Good - you used the power rule on each term.',slip:'unclear',value:'2(3x+1)'}));
 let r=await post('explain',{transcript:'I brought the powers down and got two lots of three x plus one',n:0});
 assert.equal(r.status,200);let b=await r.json();
 assert.equal(b.settled,'right');assert.equal(b.reply,'The desk heard 2(3x+1). Good - you used the power rule on each term.');
 const req=seenText[0];
 assert.match(req.system,/first-year university student/);assert.match(req.system,/Calculus 1/);
 assert.ok(req.prompt.includes(topicIn(fx.topic).name)&&req.prompt.includes(topicIn(fx.topic).blurb),'the topic from topicIn');
 assert.ok(req.prompt.includes(M.slipVocabulary(fx.topic)),'the topic\'s own slip list');
 assert.match(req.prompt,/final answer/);assert.doesNotMatch(req.prompt,/value of x/);
 let s=store.getSession();
 assert.deepEqual([s.practice.items[0].verdict,s.practice.items[0].said],['right',M.RIGHT(1)]);
 assert.equal(skill(fx.topic).seen,was.seen+1);assert.equal(skill(fx.topic).right,was.right+1);
 assert.equal(lines().length,n0,'no new history line');assert.equal(lines().at(-1).detail,'1 of 4 right, 3 not sure','the line is restated');

 // a spoken wrong one settles it wrong, with a slip from the topic's vocabulary
 stubText(()=>({reply:'Look at what happens to the constant in front of each term.',slip:'forgot-chain',value:'6x'}));
 r=await post('explain',{transcript:'I got six x',n:1});b=await r.json();
 assert.equal(b.settled,'wrong');
 s=store.getSession();
 const chain=M.slipsFor(fx.topic).find((x)=>x.id==='forgot-chain');
 assert.deepEqual([s.practice.items[1].verdict,s.practice.items[1].slip,s.practice.items[1].said],['wrong','forgot-chain',chain.says]);
 assert.equal(skill(fx.topic).seen,was.seen+2);assert.ok(skill(fx.topic).slips.includes('forgot-chain'));
 assert.equal(lines().at(-1).detail,'1 of 4 right, 2 not sure');

 // on the item already wrong, a slip the conversation names from the vocabulary renames it; no attempt
 stubText(()=>({reply:'Check the rule you used on the product.',slip:'product-as-product',value:''}));
 await post('explain',{transcript:'I multiplied them',n:1});
 s=store.getSession();assert.equal(s.practice.items[1].slip,'product-as-product');assert.equal(s.practice.items[1].verdict,'wrong');
 assert.equal(skill(fx.topic).seen,was.seen+2);

 // a value the desk cannot read leaves the item unsure, and nothing is recorded
 stubText(()=>({reply:'Tell me what you did to the first term.',slip:'unclear',value:'something like six-ish'}));
 r=await post('explain',{transcript:'something like six-ish',n:2});b=await r.json();
 assert.equal(b.settled,undefined);assert.equal(store.getSession().practice.items[2].verdict,'unsure');
 assert.equal(skill(fx.topic).seen,was.seen+2);

 // a reply that states the answer is replaced by the item's own line
 stubText(()=>({reply:'The derivative is 6x + 2, so check your last line.',slip:'unclear',value:''}));
 r=await post('explain',{transcript:'I do not know',n:3});b=await r.json();
 assert.equal(b.reply,M.NOT_SURE(4,CANNOT_READ)+' '+NOT_HEARD_LINE.en);assert.equal(store.getSession().practice.items[3].reply,M.NOT_SURE(4,CANNOT_READ)+' '+NOT_HEARD_LINE.en);
 assert.equal(store.getSession().practice.items[3].verdict,'unsure');
 // and for a number shape, the spoken number is the leak
 seat();
 const ev=FIX[0];setOn(ev.topic,ev.spec,1);
 stubVision(()=>({items:[{n:1,studentAnswer:'?',studentWorking:'',slip:'unclear'}]}));
 assert.equal((await post('mark',PHOTO)).status,200);
 stubText(()=>({reply:'You should have got ten.',slip:'unclear',value:''}));
 b=await (await post('explain',{transcript:'no idea',n:0})).json();
 assert.equal(b.reply,M.NOT_SURE(1,CANNOT_READ)+' '+NOT_HEARD_LINE.en);
});

test('5: the explanation never takes the model\'s word for the verdict: a stated verdict or solution in the reply is not read',async()=>{
 seat();
 const fx=FIX[7];
 setOn(fx.topic,fx.spec,1);
 stubVision(()=>({items:[{n:1,studentAnswer:'?',studentWorking:'',slip:'unclear'}]}));
 assert.equal((await post('mark',PHOTO)).status,200);
 // the correct function without +C: code says wrong, slip lost-constant - whatever else the model sends
 stubText(()=>({reply:'Nearly there.',slip:'power-off-by-one',value:'x^2',verdict:'right',solution:'x^2 + C'}));
 const b=await (await post('explain',{transcript:'x squared',n:0})).json();
 assert.equal(b.settled,'wrong');
 const it=store.getSession().practice.items[0];
 assert.deepEqual([it.verdict,it.slip],['wrong','lost-constant'],'code\'s own slip over the model\'s pick');
});

test('6: the evening note names a Calculus topic by topicIn and a Calculus slip in its own words; a school topic as before',async()=>{
 const {writeMemory}=require(src('lib/desk/memory.ts'));
 stubText(()=>({lines:[]}));
 await writeMemory(LEARNER,{topic:'calc1-antiderivatives',items:[{n:1,question:question(FIX[7].spec),verdict:'wrong',slip:'lost-constant'}],hintsUsed:0});
 const lost=C.CALC_SLIPS.find((x)=>x.id==='lost-constant');
 assert.match(seenText[0].prompt,new RegExp(`^Topic worked on tonight: ${topicIn('calc1-antiderivatives').name}\\n`));
 assert.ok(seenText[0].prompt.includes(`(lost-constant: ${lost.says})`),'the slip in the desk\'s words');
 stubText(()=>({lines:[]}));
 await writeMemory(LEARNER,{topic:'linear-one-step',items:[{n:1,question:'x+3=7',verdict:'wrong',slip:'arithmetic-slip'}],hintsUsed:0});
 const school=M.SLIPS.find((x)=>x.id==='arithmetic-slip');
 assert.match(seenText[0].prompt,new RegExp(`^Topic worked on tonight: ${topicIn('linear-one-step').name}\\n`));
 assert.ok(seenText[0].prompt.includes(`(arithmetic-slip: ${school.says})`),'a shared id reads in the school words on a school topic');
});

// ------------------------------------------------------------------ M3a: a word problem's parts are marked as items

const W=require(src('lib/rules/calc-word.ts'));
/** A calc1-optimisation set of two single items and the rectangle word problem's two parts (items 3 and 4). */
function wordSet(){
 const w=W.drawWord('rectangle-perimeter',7),worked=W.workedWord('rectangle-perimeter',7);
 const singles=[spec({shape:'extremum',f:'x(10 - x)',on:[0,10],kind:'max'}),spec({shape:'extremum',f:'x^2 - 6x + 13',on:[0,5],kind:'min'})];
 const items=[...singles.map((s,i)=>({n:i+1,question:question(s),spec:s})),...W.wordItems(w,3)];
 store.dispatch({type:'practice.set',practice:{topic:'calc1-optimisation',marked:false,items}});
 return {w,worked,items};
}

test('M3a 1: a word problem on a snapped sheet - the stem is listed once, each part is read by its own number and marked by its own spec; one attempt a part',async()=>{
 seat();
 const {w,worked}=wordSet();
 const s0=store.getSession().practice.items;
 assert.deepEqual(s0.map((i)=>[i.n,i.part??null,i.stem===w.stem]),[[1,null,false],[2,null,false],[3,'a',true],[4,'b',true]],'the stem and the letter ride on the parts through practice.set');
 const was=skill('calc1-optimisation');
 // item 1 right, item 2 wrong, part (a) right, part (b) wrong (the side, not the diagonal)
 const P=w.drawn[0];
 const reads=[['25','x = 5\nA = 25'],['3','f(3) = 3'],[worked[0],`A = x(${P/2} - x)\nx = ${P/4}`],[String(P/4),'x = 7']];
 stubVision(()=>({items:reads.map(([a,wk],i)=>({n:i+1,studentAnswer:a,studentWorking:wk,slip:'unclear'}))}));
 const res=await post('mark',PHOTO);
 assert.equal(res.status,200);
 const items=store.getSession().practice.items;
 assert.deepEqual(items.map((i)=>i.verdict),['right','wrong','right','wrong'],'each part judged by checkAnswer on its own spec');
 assert.equal(C.checkAnswer(w.parts[1].spec,String(P/4)).verdict,'wrong');
 assert.deepEqual(items.map((i)=>i.part??null),[null,null,'a','b'],'marking keeps the parts');
 assert.ok(items.slice(2).every((i)=>i.stem===w.stem));
 // the read prompt lists the stem once and names each part by its item number
 const p=seenVision[0].prompt;
 assert.equal(p.split(w.stem).length-1,1,'the stem is printed once');
 for(const line of [`Question 3, in parts: ${w.stem}`,`3. Part (a) of question 3: ${w.parts[0].line}`,`4. Part (b) of question 3: ${w.parts[1].line}`,'part (a) of question 3 as item 3, part (b) of question 3 as item 4'])assert.ok(p.includes(line),line);
 assert.match(p,/on these 4 Calculus items:/);
 assert.ok(p.includes(`1. ${question({shape:'extremum',f:'x(10 - x)',on:[0,10],kind:'max'})}`),'a single item is listed as before');
 // one attempt per part: four settled items, two right
 const now=skill('calc1-optimisation');
 assert.equal(now.seen-was.seen,4);assert.equal(now.right-was.right,2);
 assert.equal(learners.getLearner(LEARNER).history.at(-1).detail,M.rightLine(items));
 // no view carries a worked answer of a part
 for(const v of [view(store.getSession(),'tv'),view(store.getSession(),'phone')]){
  const strings=stringsIn(v.practice);
  for(const [i,a] of worked.entries())assert.ok(!strings.some((x)=>x===a&&x!==items[2+i].studentAnswer),`${a} only as the learner's own answer`);
  for(const it of items.slice(2))for(const x of [it.stem,it.question])assert.equal(C.leaksCalc(it.spec,x),false,x);
 }
});

test('M3a 2: the same parts typed are judged as the photo judges them, with no model; a single-item set\'s read prompt is unchanged byte for byte',async()=>{
 seat();
 const {w,worked}=wordSet();
 reg.useProvider('vision',{name:'stub',run:async()=>{throw new Error('no vision call on the typed path');}});
 reg.useProvider('text',{name:'stub',run:async()=>{throw new Error('no text call on the typed path');}});
 const P=w.drawn[0];
 const res=await post('mark',{answers:['25','3',worked[0],String(P/4)]});
 assert.equal(res.status,200);
 const items=store.getSession().practice.items;
 assert.deepEqual(items.map((i)=>i.verdict),['right','wrong','right','wrong']);
 assert.deepEqual(items.map((i)=>i.studentAnswer),['25','3',worked[0],String(P/4)]);
 // a part answered with its unit does not read: unsure, as any unreadable answer (the part line names the unit)
 seat();wordSet();
 await post('mark',{answers:['25','3',`${worked[0]} square metres`,worked[1]]});
 assert.deepEqual(store.getSession().practice.items.map((i)=>i.verdict),['right','wrong','unsure','right']);
 // a set with no parts: the read prompt is exactly the one before M3a
 seat();
 const fx=FIX[0];setOn(fx.topic,fx.spec,3);
 stubVision(()=>({items:[]}));await post('mark',PHOTO);
 const sheet=[1,2,3].map((n)=>`${n}. ${question(fx.spec)}`).join('\n');
 assert.ok(seenVision[0].prompt.startsWith(`This is a photo of a student's handwritten working on these 3 Calculus questions:\n${sheet}\n\nRead the page. For each numbered item, report:\n`));
 assert.doesNotMatch(seenVision[0].prompt,/in parts|Part \(/);
});

test('M3a 3: shown() keeps a part\'s stem and letter together or not at all - junk is a single item',()=>{
 seat();
 const s=spec({shape:'extremum',f:'x(10 - x)',on:[0,10],kind:'max'}),q=question(s);
 const set=(extra)=>{store.dispatch({type:'practice.set',practice:{topic:'calc1-optimisation',marked:false,items:[{n:1,question:q,spec:s,...extra}]}});const it=store.getSession().practice.items[0];return [it.stem??null,it.part??null];};
 assert.deepEqual(set({stem:'A rectangle has a perimeter of 20 metres.',part:'a'}),['A rectangle has a perimeter of 20 metres.','a']);
 for(const junk of [{part:'a'},{stem:'A rectangle.'},{stem:'A rectangle.',part:'z'},{stem:'A rectangle.',part:1},{stem:'   ',part:'a'},{stem:'x'.repeat(401),part:'a'},{stem:42,part:'b'}])assert.deepEqual(set(junk),[null,null],JSON.stringify(junk).slice(0,60));
});

test('MK11: a Calculus photo read with no answer to any question is refused (502, EMPTY_MARK), records nothing, and the next good snap marks',async()=>{
 const {EMPTY_MARK}=require(src('lib/desk/mark.ts'));
 const fx=FIX[2];
 const reads={
  'no items':()=>({items:[]}),
  'items numbered outside the set':()=>({items:[{n:9,studentAnswer:'6x',studentWorking:'',slip:'unclear'}]}),
  'every answer blank':()=>({items:[1,2,3].map((n)=>({n,studentAnswer:n===2?'   ':'',studentWorking:'6x',slip:'unclear'}))}),
 };
 const lines=()=>learners.getLearner(LEARNER).history.filter((e)=>e.kind==='practice').length,digests=()=>learners.getLearner(LEARNER).digest.length;
 for(const [why,read] of Object.entries(reads)){
  seat();setOn(fx.topic,fx.spec,3);
  const l0=lines(),d0=digests(),k0=skill(fx.topic).seen;
  stubVision(read);
  const r=await post('mark',PHOTO);
  assert.equal(r.status,502,why);assert.equal((await r.json()).error,EMPTY_MARK,why);
  const s=store.getSession();
  assert.equal(s.practice.marked,false,why);assert.equal(s.jobs.mark.phase,'failed');assert.equal(s.jobs.mark.error,EMPTY_MARK);
  assert.equal(lines(),l0,`${why}: no history line`);assert.equal(digests(),d0,`${why}: no digest entry`);
  assert.equal(skill(fx.topic).seen,k0,`${why}: no attempt`);
  stubVision(()=>({items:[1,2,3].map((n)=>({n,studentAnswer:'?',studentWorking:'',slip:'unclear'}))}));
  {const rr=await post('mark',PHOTO);assert.equal(rr.status,200,`${why}: the next snap marks ${JSON.stringify(await rr.clone().json())}`);}
  assert.equal(store.getSession().practice.marked,true);assert.equal(lines(),l0+1);assert.equal(digests(),d0+1);
 }
 // the ruled limit: one non-blank answer of the set lands the set
 seat();setOn(fx.topic,fx.spec,3);const l1=lines();
 stubVision(()=>({items:[{n:1,studentAnswer:'?',studentWorking:'',slip:'unclear'}]}));
 assert.equal((await post('mark',PHOTO)).status,200);assert.equal(lines(),l1+1);
});

test('MK4: settleSpec reads a decimal comma in a one-number answer only for a cz or de learner',()=>{
 const E=spec({shape:'limit',f:'(1 + 1/x)^x',at:'inf'});
 const s=M.settleSpec(1,E,'2,718',null,'calc1-limits','cz');
 assert.equal(s?.verdict,'right','cz settles it right');
 assert.equal(M.settleSpec(1,E,'2,718',null,'calc1-limits','uk'),null);
 assert.equal(M.settleSpec(1,E,'2,718',null,'calc1-limits'),null);
});

test('MK10: a Calculus item the desk is not sure of says why, in the engine\'s words, through the real judgeSet; a blank has no answer yet',()=>{
 const K=require(src('lib/rules/kinds.ts'));
 const judge=(s,a,topic='calc1-functions')=>K.judgeSet({topic,items:[{n:1,question:question(s),spec:s}]},[{n:1,studentAnswer:a}],{topic,system:'uk',typed:true}).items[0];
 // (b) a rounded decimal MK5 leaves unsure
 const third=spec({shape:'definite-integral',f:'x^2',a:'0',b:'1'}),r=C.checkAnswer(third,'0.3','uk');
 assert.equal(r.verdict,'unsure','rounded');
 const a=judge(third,'0.3','calc1-definite-integral');
 assert.equal(a.verdict,'unsure');assert.equal(a.said,M.NOT_SURE(1,r.why));assert.match(r.why,/rounded decimal/);
 assert.doesNotMatch(a.said,/something different|0\.3|1\/3/);
 // ln(x) + C for 1/x: the domain reason
 const inv=spec({shape:'antiderivative',f:'1/x'}),d=C.checkAnswer(inv,'ln(x) + C','uk');
 assert.equal(d.verdict,'unsure','domain');
 const b=judge(inv,'ln(x) + C','calc1-antiderivatives');
 assert.equal(b.said,M.NOT_SURE(1,d.why));assert.notEqual(d.why,r.why,'a different reason for a different doubt');
 // (c) a blank
 assert.equal(judge(third,'  ').said,M.BLANK(1));
});
