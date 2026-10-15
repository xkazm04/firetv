/**
 * Approximate integration (v2 M3b-3b; desk/src/lib/rules/calc2.ts 'approx-integral', the topic calc2-approx): the first
 * Calculus 2 shape. Hand values are Stewart 9e 7.7 (1/x over [1, 2]) and x^2 over [0, 2] and [0, 4], each checked
 * by an independent script. The frozen set requests (tools/calc-sets-frozen.json, written at the base by
 * tools/calc-sets-frozen-gen.cjs before any desk/src change) are recomputed and must be equal byte for byte. Offline:
 * no model, no server; the data directory is disposable.
 * Run with npm run test:rules in desk/ (directly: node tools/calc2-approx-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const G=require('./calc-sets-frozen-gen.cjs');
after(()=>G.cleanup());

const root=path.resolve(__dirname,'../desk'),src=(f)=>path.join(root,'src',f);
const C=require(src('lib/rules/calc.ts'));
const C2=require(src('lib/rules/calc2.ts'));
const M=require(src('lib/rules/maths.ts'));
const K=require(src('lib/rules/kinds.ts'));
const CH=require(src('lib/rules/chain.ts'));

test('frozen sets: every Calculus 1 topic and the five Calculus 2 topics send the request they sent at the base, byte for byte',async()=>{
 const onDisk=fs.readFileSync(G.OUT,'utf8');
 const frozen=JSON.parse(onDisk);
 assert.equal(frozen.topics,27,'22 Calculus 1 topics and the five Calculus 2 topics');
 const now=G.text(await G.table());
 assert.equal(now===onDisk,true,'tools/calc-sets-frozen.json differs from what a set now sends: an existing set request moved');
});

// ------------------------------------------------------------------ the shape (rules/calc2.ts), by hand values

const AI=(f,a,b,pieces,rule)=>({shape:'approx-integral',f,a,b,pieces,rule});
const T5=AI('1/x',1,2,5,'trapezoid'),M5=AI('1/x',1,2,5,'midpoint'),S4=AI('1/x',1,2,4,'simpson');
const T4X2=AI('x^2',0,2,4,'trapezoid'),T4X2B=AI('x^2',0,4,4,'trapezoid');
const verdict=(spec,a)=>C.checkAnswer(spec,a).verdict;

test('right: the decimals Stewart 7.7 gives, to four places (and a fifth), on T_5, M_5, S_4 and T_4 of x^2',()=>{
 assert.equal(verdict(T5,'0.6956'),'right');
 assert.equal(verdict(M5,'0.6919'),'right');
 assert.equal(verdict(S4,'0.6933'),'right');
 assert.equal(verdict(T4X2,'2.75'),'right');
 assert.equal(verdict(T5,'0.69563'),'right');
 assert.equal(verdict(T5,'T_5 = 0.6956.'),'right','a leading "T_5 =" and a closing stop are read away');
});

test('wrong: on T_5 the exact integral, another rule\'s value and a value off in the fourth place are wrong, with no unsure band',()=>{
 for(const a of ['0.6931','ln(2)','0.6919','0.6957','0.7','1/2']){
  const v=C.checkAnswer(T5,a);
  assert.equal(v.verdict,'wrong',a);assert.equal(v.slip,undefined,a);
 }
});

test('absolute: a decimal is held to 5e-5 at any size of value (T_4 of x^2 on [0, 4] is 22)',()=>{
 for(const a of ['22','22.0000','22.00004','21.99996'])assert.equal(verdict(T4X2B,a),'right',a);
 for(const a of ['22.0006','22.0001','21.9999'])assert.equal(verdict(T4X2B,a),'wrong',a);
 assert.equal(verdict(T4X2B,'44/2'),'right','a fraction is right within 1e-6, relative');
});

test('sign: the negated value is wrong with slip sign, in a decimal, in brackets',()=>{
 for(const a of ['-0.6956','-(0.6956)','(-0.6956)','- 0.6956']){
  const v=C.checkAnswer(T5,a);
  assert.deepEqual([v.verdict,v.slip],['wrong','sign'],a);
 }
 assert.deepEqual(C.slipsFor('approx-integral'),['arithmetic-slip','sign']);
 assert.deepEqual(C2.calc2SlipsFor('approx-integral'),['arithmetic-slip','sign']);
});

test('unsure: an empty, unreadable or x answer is unsure, as in Calculus 1',()=>{
 for(const a of ['','   ','x','banana','x^2'])assert.equal(verdict(T5,a),'unsure',JSON.stringify(a));
 assert.equal(C.checkAnswer(T5,null).verdict,'unsure');
});

test('degenerate: S_10 of 1/x, Simpson on a cubic and the trapezoid on a line are refused; S_4, T_5 and M_5 are kept',()=>{
 for(const spec of [AI('1/x',1,2,10,'simpson'),AI('x^2',0,2,4,'simpson'),AI('x^3',0,2,4,'simpson'),AI('2x+1',0,2,4,'trapezoid'),AI('2x+1',0,2,4,'midpoint')]){
  assert.equal(C.wellFormed(spec).ok,false,JSON.stringify(spec));
  assert.equal(C.checkAnswer(spec,'1').verdict,'unsure');
 }
 for(const spec of [S4,T5,M5,T4X2,T4X2B])assert.equal(C.wellFormed(spec).ok,true,JSON.stringify(spec));
});

test('refused: pieces off the range, an odd Simpson, an unknown rule, a reversed interval, a pole in the grid, a spec carrying a value',()=>{
 const bad=[AI('1/x',1,2,1,'trapezoid'),AI('1/x',1,2,11,'trapezoid'),AI('1/x',1,2,2.5,'trapezoid'),AI('1/x',1,2,5,'simpson'),AI('1/x',1,2,4,'left'),
  AI('1/x',2,1,4,'trapezoid'),AI('1/x',1,1,4,'trapezoid'),AI('1/x',-1,1,2,'trapezoid'),{...T5,value:0.6956},{...T5,answer:'0.6956'},{...T5,result:1},
  AI('x^2 + C',0,2,4,'trapezoid'),AI('5',0,2,4,'trapezoid'),AI('x^2',0,'x',4,'trapezoid')];
 for(const spec of bad){
  const w=C.wellFormed(spec);
  assert.equal(w.ok,false,JSON.stringify(spec));assert.equal(typeof w.why,'string');
  assert.equal(C.checkAnswer(spec,'0.6956').verdict,'unsure');
 }
 assert.equal(C.wellFormed(AI('x^2+1','pi/4','pi/2',4,'trapezoid')).ok,true,'a constant bound reads');
});

test('question: the plain and tex of T_5 equal their literals; the text names the rule, n and four places, and never the value',()=>{
 assert.deepEqual(C.question(T5),{
  plain:'Use the trapezoid rule with n = 5 to approximate int_1^2 1/x dx, to four decimal places.',
  tex:'\\text{Use the trapezoid rule with } n = 5 \\text{ to approximate } \\int_{1}^{2} \\frac{1}{x}\\,dx\\text{, to four decimal places.}',
 });
 assert.equal(C.question(S4).plain,"Use Simpson's rule with n = 4 to approximate int_1^2 1/x dx, to four decimal places.");
 assert.equal(C.question(M5).plain,'Use the midpoint rule with n = 5 to approximate int_1^2 1/x dx, to four decimal places.');
 assert.equal(C.question(AI('x^2 + 1',-1,'pi',4,'trapezoid')).plain,'Use the trapezoid rule with n = 4 to approximate int_(-1)^(pi) (x^2 + 1) dx, to four decimal places.');
 assert.equal(C.question(AI('1/x',1,2,1,'trapezoid')),null,'a malformed spec does not print');
 assert.equal(C.question({shape:'approx-integral'}),null);
});

test('reader: every fixture reads back from its own plain question; the six page phrasings read; a text with a part wrong does not',()=>{
 const fixtures=[T5,M5,S4,T4X2,T4X2B,AI('x^2 + 1',-1,'pi',4,'trapezoid'),AI('sin(x)',0,'pi/2',2,'simpson'),AI('e^x',0,1,3,'midpoint'),AI('sqrt(x)',1,4,4,'simpson')];
 for(const spec of fixtures){
  assert.equal(C.wellFormed(spec).ok,true,JSON.stringify(spec));
  assert.deepEqual(C.specFromQuestion(C.question(spec).plain),spec,JSON.stringify(spec));
 }
 const probes=[
  ['Use the trapezoid rule with n = 4 to approximate int_1^2 1/x dx, to four decimal places.',AI('1/x',1,2,4,'trapezoid')],
  ['Use the Trapezoidal Rule with n = 5 to approximate the integral from 1 to 2 of 1/x dx.',T5],
  ['Use the midpoint rule with n = 4 to approximate ∫_0^2 x^2 dx',AI('x^2',0,2,4,'midpoint')],
  ["Use Simpson's rule with n = 4 to approximate the integral of 1/x from 1 to 2",S4],
  ['Approximate ∫_1^2 1/x dx using the trapezoid rule with n = 4',AI('1/x',1,2,4,'trapezoid')],
  ['Estimate ∫_1^2 1/x dx with the midpoint rule, n = 4',AI('1/x',1,2,4,'midpoint')],
 ];
 for(const [text,spec] of probes){
  const got=C.specFromQuestion(text);
  assert.deepEqual(got,spec,text);
  assert.equal(C.wellFormed(got).ok,true,text);
 }
 const first=C.specFromQuestion(probes[0][0]);
 assert.deepEqual([first.shape,first.rule,first.pieces,first.a,first.b,first.f],['approx-integral','trapezoid',4,1,2,'1/x']);
 for(const text of ["Use Simpson's rule with n = 5 to approximate int_1^2 1/x dx, to four decimal places.",'Use the trapezoid rule with n = 4 to approximate int_2^1 1/x dx','Use the left rule with n = 4 to approximate int_1^2 1/x dx','Use the trapezoid rule with n = 1 to approximate int_1^2 1/x dx','Use the trapezoid rule with n = 4 to approximate int_1^2 y dx','Use the trapezoid rule to approximate int_1^2 1/x dx',''])
  assert.equal(C.specFromQuestion(text),null,text);
 // Calculus 1's reading is first and unchanged
 assert.deepEqual(C.specFromQuestion('Evaluate int_0^3 2x dx.'),{shape:'definite-integral',f:'2x',a:0,b:3});
 // the kinds see a calc2 question as Calculus
 assert.equal(K.kindOfQuestion(C.question(T5).plain),'calc');
});

test('leak: the value, rounded to four places or more, or its negation, leaks; the exact integral and the question\'s own notation do not',()=>{
 for(const line of ['it comes to 0.6956','0.69563','-0.6956','The trapezoid rule gives about 0.6956 here','so T_5 = 0.69563'])assert.equal(C.leaksCalc(T5,line),true,line);
 for(const line of ['the exact value is ln 2, about 0.6931','use n = 5 on [1, 2] with the trapezoid rule','add h times the weighted values','Use the trapezoid rule with n = 5 to approximate int_1^2 1/x dx, to four decimal places.','the midpoint rule gives 0.6919','h = 0.2 and f(1.2) = 0.8333',''])assert.equal(C.leaksCalc(T5,line),false,line);
 assert.equal(C.leaksCalc(T4X2,'the sum is 2.75'),true);
 assert.equal(C.leaksCalc(T4X2,'the sum is 2.7'),false,'a hint rounded to fewer than four places is the recorded residual');
 const withheld=C.withheldCalc(T5);
 assert.equal(typeof withheld,'string');assert.equal(C.leaksCalc(T5,withheld),false);assert.doesNotMatch(withheld,/\d/);
 assert.equal(C.withheldCalc(T4X2B),withheld,'a fixed sentence, the same for every approx-integral spec');
});

test('chain: a calc2 spec has no chain - every working line is null, so the working stays bare',()=>{
 assert.deepEqual(CH.chainChecks(T5,['f(1) = 1','h = 0.2']),[null,null]);
 assert.equal(CH.chainPen(T5,['f(1) = 1','h = 0.2']),null);
});

test('dispatch: isCalcSpec is true, kindOfSpec is calc, and calc.ts gives calc2\'s own verdicts',()=>{
 assert.equal(M.isCalcSpec(T5),true);assert.equal(K.kindOfSpec(T5),'calc');
 assert.deepEqual(C.wellFormed(T5),C2.calc2WellFormed(T5));
 assert.deepEqual(C.checkAnswer(T5,'0.6956'),C2.calc2CheckAnswer(T5,'0.6956'));
 assert.deepEqual(C.checkAnswer(T5,'0.6956'),{verdict:'right',why:'It agrees with what the desk worked out for itself.'});
 assert.deepEqual(C.question(T5),C2.calc2Question(T5));
 assert.equal(C.leaksCalc(T5,'0.6956'),C2.calc2LeaksCalc(T5,'0.6956'));
 assert.equal(C.withheldCalc(T5),C2.calc2Withheld(T5));
 assert.equal(C.CALC_SHAPES.includes('approx-integral'),false,'Calculus 1\'s list is unchanged');
});

// ------------------------------------------------------------------ the topic: a stubbed set, and the spec on the screen

const reg=require(src('lib/engines/registry.ts'));
const store=require(src('lib/session/store.ts'));
const items=require(src('lib/desk/items.ts'));
const P=require(src('lib/library/paths.ts'));
const stubText=(answer)=>{const seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);return {raw:JSON.stringify(answer)};}});return seen;};
const asSpec=(s,difficulty)=>({shape:s.shape,f:s.f,a:String(s.a),b:String(s.b),pieces:s.pieces,rule:s.rule,difficulty});

test('set: a stubbed calc2-approx set asks for approx-integral alone, in Calculus 2\'s words, and keeps only the well-formed specs',async()=>{
 reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
 try{
  const t=P.topicIn('calc2-approx');
  assert.deepEqual([P.pathOfTopic('calc2-approx'),t.prereq,t.shapes,t.sections],['calc2',[],['approx-integral'],undefined]);
  assert.deepEqual(P.shapesOfTopic('calc2-approx'),['approx-integral']);
  {const ids=P.topicsOf('calc2').map(x=>x.id);assert.equal(ids.indexOf('calc2-approx'),ids.indexOf('calc2-strategy')+1,'after calc2-strategy');} // OLD: .at(-1) was calc2-approx; calc2-sequences (M3b-3c) comes after it
  assert.equal(P.PATHS.calc2.calcWords.methods,"integration by parts, trigonometric integrals, trigonometric substitution, partial fractions, the trapezoid, midpoint and Simpson's rules, and limits of sequences"); // OLD: '... partial fractions, and the trapezoid, midpoint and Simpson's rules'
  store.dispatch({type:'reset'});
  store.dispatch({type:'profile.draft',patch:{id:'approx-learner',name:'Approx',type:'other',modules:['maths'],mathPath:'calc2'}});store.dispatch({type:'profile.save'});
  // T_5, M_5 and S_4 are well formed; S_10 is degenerate; Simpson with 5 pieces is malformed
  const seen=stubText({specs:[asSpec(T5,1),asSpec(M5,2),asSpec(S4,3),asSpec(AI('1/x',1,2,10,'simpson'),2),asSpec(AI('1/x',1,2,5,'simpson'),2)]});
  const got=await items.makeItems('calc2-approx','approx-learner',3,{word:false});
  assert.equal(seen.length,1,'one round is enough');
  const req=seen[0];
  assert.deepEqual(req.schema.properties.specs.items.properties.shape.enum,['approx-integral']);
  const props=req.schema.properties.specs.items.properties;
  assert.deepEqual(props.pieces,{type:'integer',minimum:2,maximum:10});
  assert.deepEqual(props.rule,{type:'string',enum:['trapezoid','midpoint','simpson']});
  assert.deepEqual([...req.prompt.matchAll(/^- ([a-z-]+): /gm)].map(m=>m[1]),['approx-integral'],'only its own line');
  assert.match(req.prompt,/- approx-integral: f, a, b, pieces \(2 to 10, even for simpson\) and rule \(trapezoid, midpoint or simpson\) - the question is that rule with that many subintervals, given to four decimal places\./);
  assert.ok(req.system.includes('a university Calculus 2 desk'));assert.doesNotMatch(req.system,/Calculus 1/);
  assert.doesNotMatch(req.prompt+req.system,/0\.69/,'no value is ever in the prompt');
  assert.equal(got.items.length,3);
  assert.deepEqual(got.items.map(i=>i.spec).map(s=>[s.shape,s.pieces,s.rule]).sort(),[['approx-integral',4,'simpson'],['approx-integral',5,'midpoint'],['approx-integral',5,'trapezoid']]);
  for(const i of got.items){assert.equal(C.wellFormed(i.spec).ok,true);assert.equal(i.question,C.question(i.spec).plain);}
 }finally{reg.resetProviders();}
});

test('specShown: a practice set on the screen keeps pieces and rule, and still no answer field',()=>{
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'shown-learner',name:'Shown',type:'other',modules:['maths'],mathPath:'calc2'}});store.dispatch({type:'profile.save'});
 store.dispatch({type:'practice.set',practice:{topic:'calc2-approx',marked:false,items:[{n:1,question:C.question(T5).plain,spec:{...T5,answer:'0.6956',value:0.6956}}]}});
 const spec=store.getSession().practice.items[0].spec;
 assert.deepEqual(spec,T5,'pieces and rule kept; answer and value dropped');
 assert.equal(C.checkAnswer(spec,'0.6956').verdict,'right');
});
