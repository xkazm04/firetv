/**
 * The limit of a sequence (v2 M3b-3c; desk/src/lib/rules/calc2.ts 'sequence-limit', the topic calc2-sequences): the second
 * Calculus 2 shape. Hand values are Stewart 9e 11.1 (n/(n+1) at 1, ln(n)/n at 0, (1+1/n)^n at e, 2^n/n^3 at infinity).
 * The first row is the base (step 1, before any desk/src change): Calculus 1's reader reads none of the four printed
 * sequence questions, and limitInf gives the App Master's probe values. Offline: no model, no server; the data directory is
 * disposable. Run with npm run test:rules in desk/ (directly: node tools/calc2-sequence-test.cjs).
 */
const path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);require('node:fs').rmSync(data,{recursive:true,force:true});});

const root=path.resolve(__dirname,'../desk'),src=(f)=>path.join(root,'src',f);
require('./ts-load.cjs');
const C=require(src('lib/rules/calc.ts'));
const X=require(src('lib/rules/calc-expr.ts'));

const FIXTURES=['n/(n+1)','ln(n)/n','(1+1/n)^n','(n^2+1)/(2n^2)','2^n/n^3','n^(1/n)','(1/2)^n'];
// the f of each, in x
const FX=['x/(x+1)','ln(x)/x','(1+1/x)^x','(x^2+1)/(2x^2)','2^x/x^3','x^(1/x)','(1/2)^x'];
const PROBE=[1,2.3258e-8,2.718281828205865,0.5,'inf',1.0000000233,0];
const DNE=['cos(pi*x)','sin(pi*x)+1','(-1)^x'];

test('base: Calculus 1 reads none of the four printed sequence questions as a Calculus 1 shape; limitInf gives the probe values of the fixtures',()=>{
 for(const text of ['Find the limit of the sequence a_n = n/(n+1).','Determine whether the sequence a_n = ln(n)/n converges or diverges. If it converges, find the limit.','Find lim_(n->infinity) (1+1/n)^n','Find the limit as n approaches infinity of (n^2+1)/(2n^2).'])
  // OLD (step 1, the base): null. NEW (step 2): Calculus 1's reader still finds no Calculus 1 spec, so what it returns is null or a calc2 sequence-limit spec
  {const got=C.specFromQuestion(text);assert.ok(got===null||got.shape==='sequence-limit',text);}
 FX.forEach((f,i)=>{
  const L=X.limitInf(X.compile(f),1);
  if(PROBE[i]==='inf')assert.deepEqual(L,{kind:'inf',sign:1},f);
  else{assert.equal(L.kind,'value',f);assert.ok(Math.abs(L.v-PROBE[i])<=1e-9,`${f}: ${L.v}`);}
 });
 for(const f of DNE)assert.deepEqual(X.limitInf(X.compile(f),1),{kind:'dne'},f);
});

// ------------------------------------------------------------------ the shape (rules/calc2.ts), by hand values

const C2=require(src('lib/rules/calc2.ts'));
const M=require(src('lib/rules/maths.ts'));
const K=require(src('lib/rules/kinds.ts'));
const CH=require(src('lib/rules/chain.ts'));
const SL=(f)=>({shape:'sequence-limit',f});
const NN=SL('x/(x+1)'),LNN=SL('ln(x)/x'),EN=SL('(1+1/x)^x'),HALF=SL('(x^2+1)/(2x^2)'),EXP=SL('2^x/x^3'),ROOT=SL('x^(1/x)'),GEO=SL('(1/2)^x');
const KEPT=[NN,LNN,EN,HALF,EXP,ROOT,GEO];
const verdict=(spec,a)=>C.checkAnswer(spec,a).verdict;

test('truth: the kept fixtures are well formed, with the limits Stewart 11.1 gives (1, 0, e, 1/2, infinity, 1, 0)',()=>{
 for(const spec of KEPT)assert.deepEqual(C.wellFormed(spec),{ok:true},spec.f);
 const want=[1,0,Math.E,0.5,'inf',1,0];
 KEPT.forEach((spec,i)=>{
  const L=X.limitInf(X.compile(spec.f),1);
  if(want[i]==='inf')assert.deepEqual(L,{kind:'inf',sign:1});
  else assert.ok(Math.abs(L.v-want[i])<=1e-7,`${spec.f}: ${L.v}`);
 });
});

test('right: 1, 0, e and 2.718, 1/2 and 0.5, inf, infinity and the infinity sign are right',()=>{
 for(const [spec,a] of [[NN,'1'],[LNN,'0'],[EN,'e'],[EN,'2.718'],[HALF,'1/2'],[HALF,'0.5'],[EXP,'inf'],[EXP,'infinity'],[EXP,'∞'],[EXP,'+infinity'],[NN,'lim = 1.'],[ROOT,'1'],[GEO,'0']])
  assert.equal(verdict(spec,a),'right',`${spec.f} ${a}`);
});

test('wrong: 0 and dne on n/(n+1), -inf on 2^n/n^3, 1 on (1+1/n)^n, a number on an infinite limit',()=>{
 for(const [spec,a] of [[NN,'0'],[NN,'dne'],[EXP,'-inf'],[EN,'1'],[EXP,'5'],[NN,'inf'],[HALF,'1']])
  assert.equal(verdict(spec,a),'wrong',`${spec.f} ${a}`);
 assert.equal(C.checkAnswer(NN,'0').slip,undefined);
 assert.equal(C.checkAnswer(EXP,'-inf').slip,'sign','the opposite infinity is the sign slip, as in Calculus 1');
});

test('sign: -1/2 on (n^2+1)/(2n^2) is wrong with slip sign; so is -1 on n/(n+1)',()=>{
 for(const [spec,a] of [[HALF,'-1/2'],[HALF,'-0.5'],[NN,'-1']]){
  const v=C.checkAnswer(spec,a);
  assert.deepEqual([v.verdict,v.slip],['wrong','sign'],a);
 }
 assert.deepEqual(C.slipsFor('sequence-limit'),['arithmetic-slip','sign']);
 assert.deepEqual(C2.calc2SlipsFor('sequence-limit'),['arithmetic-slip','sign']);
});

test('unsure: an empty, unreadable or n or x answer is unsure',()=>{
 for(const a of ['','   ','x','n','banana','x^2'])assert.equal(verdict(NN,a),'unsure',JSON.stringify(a));
 assert.equal(C.checkAnswer(NN,null).verdict,'unsure');
});

const ANSWERS=['1','0','e','2.718','1/2','0.5','inf','infinity','∞','dne','-inf','-1/2','-1','diverges','','x','banana','n','0.99','0.998','1.0001','-infinity','+inf','2.72','3','does not exist','1.','x = 1','lim = 1','0.0000001'];

test('parity: for every kept fixture and every answer in a fixed list, the verdict and slip equal Calculus 1\'s limit at inf',()=>{
 for(const spec of KEPT)for(const a of ANSWERS){
  const mine=C.checkAnswer(spec,a),theirs=C.checkAnswer({shape:'limit',f:spec.f,at:'inf'},a);
  assert.deepEqual(mine,theirs,`${spec.f} ${JSON.stringify(a)}`);
 }
});

test('refused: a limit that does not exist, a term not finite at a whole n, a constant, a +C, and a spec carrying a value',()=>{
 for(const f of ['cos(pi*x)','sin(pi*x)+1','(-1)^x']){
  const w=C.wellFormed(SL(f));
  assert.equal(w.ok,false,f);assert.equal(w.why,'The limit does not exist.',f);
  assert.equal(C.checkAnswer(SL(f),'1').verdict,'unsure');
 }
 for(const spec of [SL('1/(x-2)'),SL('ln(x-1)'),SL('3'),SL('x + C'),SL('banana'),SL(7),{...NN,value:1},{...NN,answer:'1'},{...NN,truth:1},{...NN,solution:'1'},{...NN,result:1},{shape:'sequence-limit'}]){
  const w=C.wellFormed(spec);
  assert.equal(w.ok,false,JSON.stringify(spec));assert.equal(typeof w.why,'string');
  assert.equal(C.checkAnswer(spec,'1').verdict,'unsure');
 }
 assert.match(C.wellFormed(SL('1/(x-2)')).why,/not defined at every whole n/);
 assert.match(C.wellFormed(SL('ln(x-1)')).why,/not defined at every whole n/);
 assert.equal(C.question({shape:'sequence-limit'}),null,'a malformed spec does not print');
 assert.equal(C.question({...NN,value:1}),null);
});

test('printer: the plain in n, renamed back, is the same function; no variable is glued to a letter; ln(x)/x prints ln(n)',()=>{
 const more=['cos(pi*x)','-x^2+3x','sin(x)^2/x','exp(-x)*x','x*sin(1/x)','log_2(x)/x','pi*x/e^x','2x+1','(x+1)^(x+2)','x/(1+(1/x))','sqrt(x)/x','abs(x-3)/x','e^x/x^2','x^2*pi'];
 for(const f of [...KEPT.map(s=>s.f),...more]){
  const e=X.compile(f);
  const plain=X.toPlain(e,'n');
  const back=X.compile(plain.replace(/(?<![A-Za-z])n(?![A-Za-z])/g,'x'));
  assert.ok(back,f+' -> '+plain);
  assert.equal(X.sameFunction(back,e),true,f+' -> '+plain);
  const rest=plain.replace(/(?<![A-Za-z])(sinh|cosh|tanh|sin|cos|tan|sec|csc|cot|asin|acos|atan|ln|log|exp|sqrt|cbrt|abs|pi|e)(?![A-Za-z])/g,' ');
  assert.doesNotMatch(rest,/[A-Za-z]{2}/,'n is a token of its own: '+plain);
 }
 assert.doesNotMatch(X.toPlain(X.compile('cos(pi*x)'),'n'),/pin/);
 assert.match(X.toPlain(X.compile('ln(x)/x'),'n'),/ln\(n\)/);
 assert.equal(X.toPlain(X.compile('x/(x+1)')),'x/(x + 1)','the variable defaults to x');
 assert.equal(X.toTex(X.compile('x/(x+1)')),'\\frac{x}{x + 1}','toTex with one argument is as it was');
 assert.equal(X.toTex(X.compile('x/(x+1)'),'n'),'\\frac{n}{n + 1}');
});

test('question: the plain and tex of n/(n+1) equal their literals; the fixtures print their terms in n',()=>{
 assert.deepEqual(C.question(NN),{
  plain:'Find lim_(n->infinity) a_n, where a_n = n/(n + 1).',
  tex:'\\text{Find } \\lim_{n \\to \\infty} a_n \\text{, where } a_n = \\frac{n}{n + 1}.',
 });
 assert.equal(C.question(LNN).plain,'Find lim_(n->infinity) a_n, where a_n = ln(n)/n.');
 assert.equal(C.question(EN).plain,'Find lim_(n->infinity) a_n, where a_n = (1 + 1/n)^n.');
 assert.equal(C.question(HALF).plain,'Find lim_(n->infinity) a_n, where a_n = (n^2 + 1)/(2n^2).');
 for(const spec of KEPT){const q=C.question(spec);assert.doesNotMatch(q.plain,/x/,spec.f);assert.doesNotMatch(q.tex.replace(/text\{[^}]*\}/g,''),/x/,spec.f);}
});

test('reader: every fixture reads back from its own plain question; the four page texts read; sin and tan stay functions',()=>{
 for(const spec of KEPT){
  const got=C.specFromQuestion(C.question(spec).plain);
  assert.equal(got.shape,'sequence-limit',spec.f);
  assert.equal(X.sameFunction(X.compile(got.f),X.compile(spec.f)),true,spec.f);
  assert.equal(C.question(got).plain,C.question(spec).plain,spec.f);
  assert.deepEqual(Object.keys(got),['shape','f']);
 }
 const probes=[
  ['Find the limit of the sequence a_n = n/(n+1).',NN],
  ['Determine whether the sequence a_n = ln(n)/n converges or diverges. If it converges, find the limit.',LNN],
  ['Find lim_(n->infinity) (1+1/n)^n',EN],
  ['Find the limit as n approaches infinity of (n^2+1)/(2n^2).',HALF],
  ['Find the limit of the sequence a_n = sin(n)/n.',SL('sin(x)/x')],
  ['Find the limit of the sequence a_n = tan(1/n).',SL('tan(1/x)')],
  ['Find lim_(n→∞) 2^n/n^3',EXP],
  ['Find the limit of a_n = (1/2)^n as n tends to infinity',GEO],
 ];
 for(const [text,spec] of probes){
  const got=C.specFromQuestion(text);
  assert.ok(got,text);
  assert.equal(got.shape,'sequence-limit',text);
  assert.equal(X.sameFunction(X.compile(got.f),X.compile(spec.f)),true,text);
  assert.equal(C.wellFormed(got).ok,true,text);
 }
 assert.match(C.specFromQuestion(probes[4][0]).f,/sin/);assert.match(C.specFromQuestion(probes[5][0]).f,/tan/);
 // an n inside a letter run is left as it is, and that term does not read; a sequence that does not exist is not claimed
 for(const text of ['Find the limit of the sequence a_n = pin/(n+1).','Find the limit of the sequence a_n = en/(n+1).','Find the limit of the sequence a_n = cos(pi*n).','Find the limit of the sequence a_n = 1/(n-2).','Find the limit of the sequence a_n = 5.','Find the limit of the sequence a_n = x/(n+1).','Find the limit of the sequence a_n.',''])
  assert.equal(C.specFromQuestion(text),null,text);
 // Calculus 1 and the approx reader come first and are unchanged
 assert.deepEqual(C.specFromQuestion('Find lim_(x->infinity) x/(x+1).'),{shape:'limit',f:'x/(x+1)',at:'inf'});
 assert.equal(C.specFromQuestion('Use the trapezoid rule with n = 4 to approximate int_1^2 1/x dx').shape,'approx-integral');
 for(const [text] of probes)assert.equal(K.kindOfQuestion(text),'calc',text);
});

test('leak: the limit, said, leaks; the question\'s own notation and the method do not',()=>{
 for(const line of ['the limit is 1','it tends to 1','so a_n goes to 1','about 0.999','one'])assert.equal(C.leaksCalc(NN,line),true,line);
 for(const line of ['as n approaches infinity','lim_(n->infinity) a_n','divide the top and bottom by n','Find lim_(n->infinity) a_n, where a_n = n/(n + 1).','the terms are n/(n + 1)','compare the leading terms','n = 100 gives 0.99','a_n = n/(n+1)',''])assert.equal(C.leaksCalc(NN,line),false,line);
 for(const line of ['it goes to infinity','it diverges to ∞','the limit is inf'])assert.equal(C.leaksCalc(EXP,line),true,line);
 for(const line of ['compare the powers of n','the exponential wins','apply the rule three times'])assert.equal(C.leaksCalc(EXP,line),false,line);
 const withheld=C.withheldCalc(NN);
 assert.equal(withheld,'Say what the terms do as n grows, then name the step that makes it clear. The limit is yours to find.');
 for(const spec of KEPT){assert.equal(C.leaksCalc(spec,withheld),false,spec.f);assert.equal(C.withheldCalc(spec),withheld);}
 assert.doesNotMatch(withheld,/\d/);
});

test('leak parity: on lines with no variable, the leak check equals Calculus 1\'s limit at inf with the same f',()=>{
 const lines=['the limit is 1','it tends to 1','about 0.5','one half','minus one half','e','2.718','0','it is zero','it goes to infinity','the sequence diverges to infinity','compare the leading terms','divide through by the highest power','as the terms grow the ratio settles','the value is 0.999','1/2','-0.5','three halves','2.7','2.73','','   ','the answer is not 4','use the rule'];
 for(const spec of KEPT)for(const line of lines)
  assert.equal(C2.calc2LeaksCalc(spec,line),C.leaksCalc({shape:'limit',f:spec.f,at:'inf'},line),`${spec.f}: ${line}`);
});

test('chain: a sequence-limit spec has no chain - every working line is null',()=>{
 assert.deepEqual(CH.chainChecks(NN,['a_1 = 1/2','a_100 = 100/101']),[null,null]);
 assert.equal(CH.chainPen(NN,['a_1 = 1/2']),null);
});

test('dispatch: isCalcSpec is true, kindOfSpec is calc, and calc.ts gives calc2\'s own verdicts',()=>{
 assert.equal(M.isCalcSpec(NN),true);assert.equal(K.kindOfSpec(NN),'calc');
 assert.deepEqual(C.wellFormed(NN),C2.calc2WellFormed(NN));
 assert.deepEqual(C.checkAnswer(NN,'1'),C2.calc2CheckAnswer(NN,'1'));
 assert.deepEqual(C.checkAnswer(NN,'1'),{verdict:'right',why:'It agrees with what the desk worked out for itself.'});
 assert.deepEqual(C.question(NN),C2.calc2Question(NN));
 assert.equal(C.leaksCalc(NN,'1'),C2.calc2LeaksCalc(NN,'1'));
 assert.equal(C.withheldCalc(NN),C2.calc2Withheld(NN));
 assert.deepEqual(C2.CALC2_SHAPES,['approx-integral','sequence-limit']);
 assert.equal(C.CALC_SHAPES.includes('sequence-limit'),false,'Calculus 1\'s list is unchanged');
 assert.equal(C2.isCalc2Spec(NN),true);
});

// ------------------------------------------------------------------ the topic: a stubbed set, and the spec on the screen

const fs=require('node:fs'),os=require('node:os');
const data=fs.mkdtempSync(path.join(os.tmpdir(),'desk-calc2-seq-'));process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));
const store=require(src('lib/session/store.ts'));
const items=require(src('lib/desk/items.ts'));
const P=require(src('lib/library/paths.ts'));
const stubText=(answer)=>{const seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);return {raw:JSON.stringify(answer)};}});return seen;};

test('set: a stubbed calc2-sequences set asks for sequence-limit alone, in Calculus 2\'s words, and keeps only the well-formed specs',async()=>{
 reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
 try{
  const t=P.topicIn('calc2-sequences');
  assert.deepEqual([P.pathOfTopic('calc2-sequences'),t.prereq,t.shapes,t.sections],['calc2',[],['sequence-limit'],undefined]);
  assert.deepEqual(P.shapesOfTopic('calc2-sequences'),['sequence-limit']);
  const ids=P.topicsOf('calc2').map(x=>x.id);
  assert.equal(ids.indexOf('calc2-sequences'),ids.indexOf('calc2-approx')+1,'after calc2-approx');
  assert.equal(P.PATHS.calc2.calcWords.methods,"integration by parts, trigonometric integrals, trigonometric substitution, partial fractions, the trapezoid, midpoint and Simpson's rules, and limits of sequences");
  store.dispatch({type:'reset'});
  store.dispatch({type:'profile.draft',patch:{id:'seq-learner',name:'Seq',type:'other',modules:['maths'],mathPath:'calc2'}});store.dispatch({type:'profile.save'});
  // n/(n+1) is well formed; cos(pi*x) has no limit (the alias guard); 1/(x-2) is not defined at n = 2
  const seen=stubText({specs:[{shape:'sequence-limit',f:'x/(x+1)',difficulty:1},{shape:'sequence-limit',f:'cos(pi*x)',difficulty:2},{shape:'sequence-limit',f:'1/(x-2)',difficulty:2}]});
  const got=await items.makeItems('calc2-sequences','seq-learner',3,{word:false});
  assert.equal(seen.length>=1,true);
  const req=seen[0];
  assert.deepEqual(req.schema.properties.specs.items.properties.shape.enum,['sequence-limit']);
  assert.deepEqual(Object.keys(req.schema.properties.specs.items.properties).sort(),['difficulty','f','shape'],'f is always in the schema; the shape adds no parameter');
  assert.deepEqual([...req.prompt.matchAll(/^- ([a-z-]+): /gm)].map(m=>m[1]),['sequence-limit'],'only its own line');
  assert.match(req.prompt,/- sequence-limit: f, a function of x that the desk prints with n in place of x\. The question is the limit of a_n = f\(n\) as n grows\. Pick one that is defined for every real x >= 1 and that has a limit or grows without bound\./);
  assert.ok(req.system.includes('a university Calculus 2 desk'));assert.doesNotMatch(req.system,/Calculus 1/);
  assert.doesNotMatch(req.prompt+req.system,/(limit is|equals|converges to)/,'no limit is ever in the prompt');
  assert.equal(got.items.length,1);
  assert.deepEqual(got.items.map(i=>i.spec),[{shape:'sequence-limit',f:'x/(x+1)'}]);
  for(const i of got.items){assert.equal(C.wellFormed(i.spec).ok,true);assert.equal(i.question,C.question(i.spec).plain);}
 }finally{reg.resetProviders();}
});

test('specShown: a practice set on the screen keeps f, and still no answer field',()=>{
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'shown-seq-learner',name:'Shown',type:'other',modules:['maths'],mathPath:'calc2'}});store.dispatch({type:'profile.save'});
 store.dispatch({type:'practice.set',practice:{topic:'calc2-sequences',marked:false,items:[{n:1,question:C.question(NN).plain,spec:{...NN,answer:'1',value:1}}]}});
 const spec=store.getSession().practice.items[0].spec;
 assert.deepEqual(spec,NN,'f kept; answer and value dropped');
 assert.equal(C.checkAnswer(spec,'1').verdict,'right');
});
