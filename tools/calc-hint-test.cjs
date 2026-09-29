/**
 * A photographed Calculus page gets a hint whose leak check works. A Calculus task is read from its printed text into
 * a spec in code (rules/calc.ts specFromQuestion - conservative, null when unsure), the hint runs the shape-aware leak
 * check (leaksCalc) beside the one leak rule, a second leak gets a fixed sentence chosen in code from the shape
 * (withheldCalc), the prompt takes a university Calculus stance on the learner's calc1 path, and the lesson picker is
 * not asked for a school algebra video for a Calculus problem.
 * Run with npm test in desk/ (directly: node tools/calc-hint-test.cjs). No model is called - the text engine is
 * stubbed at the provider seam; a disposable data directory under the OS temp dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-calc-hint-'));delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));
const C=require(src('lib/rules/calc.ts'));
const maths=require(src('lib/rules/maths.ts'));
const {compile}=require(src('lib/rules/calc-expr.ts'));
const {hint}=require(src('lib/desk/hint.ts'));
const {CALCULUS_1}=require(src('lib/library/calculus1.ts'));
const store=require(src('lib/session/store.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());

// ------------------------------------------------------------------ the lot-A corpus, read from its own suite
/**
 * Every spec in tools/calc-rules-test.cjs (its CHECKS, WELL and SWEEP tables), loaded by compiling that file with a
 * no-op node:test so none of its tests run here - the round trip follows the corpus as it grows.
 */
function lotACorpus(){
 const file=path.join(__dirname,'calc-rules-test.cjs');
 const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);
 const real=m.require.bind(m);
 m.require=(id)=>id==='node:test'?{test(){},after(){},afterEach(){},before(){},beforeEach(){}}:real(id);
 m._compile(fs.readFileSync(file,'utf8')+'\n;module.exports={CHECKS,WELL,SWEEP};',file);
 const {CHECKS,WELL,SWEEP}=m.exports;
 return [...CHECKS.map(c=>c[0]),...WELL.map(w=>w[0]),...Object.values(SWEEP)].filter(s=>s&&typeof s==='object');
}

/** A grid of specs of every shape: each function against each shape's parameters, kept only when well formed. */
function grid(){
 const F=['x^2','x^3 + x^2','3x^2 - 4/x','sin(3x)','e^(2x)','ln(x)/x','(x^2 + 1)/(x - 1)','x^2 - 4x + 1','2x + 1/sqrt(x)','cos(x) + x','x e^x','sqrt(x + 1)','x^3 - 12x','1/(x + 2)','tan(x)','x^2 - 2','x - x^2','x^3 - x - 1','20x - x^2','x^3','(x^2 - 4)/(x - 2)','sin(x)/x','(3x^2 - x)/(2x^2 + 5)'];
 const out=[];
 for(const f of F){
  out.push({shape:'derivative',f},{shape:'antiderivative',f});
  for(const at of [1,2,-1,'pi/4','pi/6',0.5])out.push({shape:'evaluate',f,at},{shape:'derivative-at',f,at});
  for(const [a,b] of [[0,1],[1,4],[-1,2],[0,'pi/2'],[2,3],[-1,1]])out.push({shape:'definite-integral',f,a,b});
  for(const at of [0,1,2,-1,'inf','-inf','pi'])out.push({shape:'limit',f,at});
  for(const side of ['+','-'])out.push({shape:'limit',f,at:0,side},{shape:'limit',f,at:2,side});
  for(const on of [[0,5],[-3,0],[0,20],[1,3],[-1,2],[0,'pi']]){out.push({shape:'critical-point',f,on});for(const kind of ['max','min'])out.push({shape:'extremum',f,on,kind});}
  for(const x0 of [1,2,-1,3])for(const steps of [1,2,3])out.push({shape:'newton-step',f,x0,steps});
 }
 return out.filter(s=>C.wellFormed(s).ok);
}

/** The spec as the reader should give it back: its function tidied; a zero integral carries its flag. */
const canon=(s)=>({...s,f:s.f.trim().replace(/\s+/g,' ')});

test('1: specFromQuestion reads back every question the desk prints - the lot-A corpus and a grid of every shape (property)',()=>{
 const corpus=lotACorpus().filter(s=>C.wellFormed(s).ok),g=grid();
 assert.ok(corpus.length>=60,`lot-A corpus: ${corpus.length} well-formed specs`);
 assert.ok(g.length>=300,`grid: ${g.length} well-formed specs`);
 const bad=[];
 for(const spec of [...corpus,...g]){
  const q=C.question(spec);
  if(!q){bad.push(`no question: ${JSON.stringify(spec)}`);continue;}
  const got=C.specFromQuestion(q.plain);
  if(!got||got.shape!==spec.shape||got.f!==canon(spec).f)bad.push(`${q.plain} -> ${JSON.stringify(got)} (want ${spec.shape} ${spec.f})`);
  else try{assert.deepEqual(got,canon(spec));}catch{bad.push(`${q.plain} -> ${JSON.stringify(got)} (want ${JSON.stringify(canon(spec))})`);}
 }
 assert.deepEqual(bad.slice(0,20),[],`${bad.length} of ${corpus.length+g.length} did not read back`);
 const shapes=new Set([...corpus,...g].map(s=>s.shape));
 for(const s of C.CALC_SHAPES)assert.ok(shapes.has(s),`round-tripped: ${s}`);
});

/** [the printed text, the spec it is (or null)] - Calculus 1's own questions and page lines, page phrasings, and the ones that must stay null. */
const PHRASES=[
 // Calculus 1 corpus questions (calculus1.ts, kind 'question') - the shapes
 ['Find lim_(x->2) (x^2 - 4)/(x - 2).',{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2}],
 ['Find lim_(x->3) (sqrt(x + 1) - 2)/(x - 3).',{shape:'limit',f:'(sqrt(x + 1) - 2)/(x - 3)',at:3}],
 ['Find lim_(x->0) (1/(x + 1) - 1)/x.',{shape:'limit',f:'(1/(x + 1) - 1)/x',at:0}],
 ['Find lim_(x->0) (e^x - 1 - x)/x^2.',{shape:'limit',f:'(e^x - 1 - x)/x^2',at:0}],
 ["Use the definition to find f'(x) for f(x) = x^2 + 3x.",{shape:'derivative',f:'x^2 + 3x'}],
 ['Differentiate y = (x^2 + 1)/(x - 1).',{shape:'derivative',f:'(x^2 + 1)/(x - 1)'}],
 ['Differentiate f(x) = x^2 e^x sin(x).',{shape:'derivative',f:'x^2 e^x sin(x)'}],
 ['Differentiate y = cbrt(1 + x^2).',{shape:'derivative',f:'cbrt(1 + x^2)'}],
 ['Differentiate y = ln(x)/x.',{shape:'derivative',f:'ln(x)/x'}],
 ['Differentiate y = x^x for x > 0.',{shape:'derivative',f:'x^x'}],
 ['Evaluate int_1^4 (2x + 1/sqrt(x)) dx.',{shape:'definite-integral',f:'2x + 1/sqrt(x)',a:1,b:4}],
 ['Evaluate int_0^1 2x (x^2 + 1)^3 dx.',{shape:'definite-integral',f:'2x (x^2 + 1)^3',a:0,b:1}],
 // derivative, as pages print it
 ['Differentiate f(x) = x^3 + x^2',{shape:'derivative',f:'x^3 + x^2'}],
 ['3. Differentiate f(x) = x³ + x²',{shape:'derivative',f:'x³ + x²'}],
 ['Find the derivative of f(x) = sin(3x).',{shape:'derivative',f:'sin(3x)'}],
 ['Find the derivative of e^(2x)',{shape:'derivative',f:'e^(2x)'}],
 ['Find dy/dx for y = x^2 ln(x).',{shape:'derivative',f:'x^2 ln(x)'}],
 ["Find f'(x) for f(x) = tan(x) + x.",{shape:'derivative',f:'tan(x) + x'}],
 ["Find g'(x) if g(x) = sqrt(x + 1)",{shape:'derivative',f:'sqrt(x + 1)'}],
 ['Differentiate: y = x e^x',{shape:'derivative',f:'x e^x'}],
 ['d/dx (x^3 - 12x)',{shape:'derivative',f:'x^3 - 12x'}],
 // derivative at a point
 ["Find f'(2) for f(x) = x^3 + x^2.",{shape:'derivative-at',f:'x^3 + x^2',at:2}],
 ["Find f'(pi/3) for f(x) = sin(x)",{shape:'derivative-at',f:'sin(x)',at:'pi/3'}],
 ['Find the slope of the tangent to y = x^2 + 1 at x = 3.',{shape:'derivative-at',f:'x^2 + 1',at:3}],
 ['Find the slope of the tangent line to the curve y = ln(x) at x = 1',{shape:'derivative-at',f:'ln(x)',at:1}],
 ['Find the derivative of f(x) = x^3 at x = -1.',{shape:'derivative-at',f:'x^3',at:-1}],
 // limits
 ['Find lim_(x->0) sin(x)/x',{shape:'limit',f:'sin(x)/x',at:0}],
 ['Find lim_(x→0) sin(x)/x.',{shape:'limit',f:'sin(x)/x',at:0}],
 ['lim_(x->infinity) (3x^2 - x)/(2x^2 + 5)',{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'}],
 ['Find lim_(x->∞) (1 + 1/x)^x.',{shape:'limit',f:'(1 + 1/x)^x',at:'inf'}],
 ['Find lim_(x->0+) 1/x.',{shape:'limit',f:'1/x',at:0,side:'+'}],
 ['Find lim_(x->0-) 1/x',{shape:'limit',f:'1/x',at:0,side:'-'}],
 ['Evaluate the limit as x approaches 2 of (x^2 - 4)/(x - 2).',{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2}],
 ['Find the limit of 1/x as x approaches 0 from the right.',{shape:'limit',f:'1/x',at:0,side:'+'}],
 ['Find the limit of (3x^2 - x)/(2x^2 + 5) as x approaches infinity',{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'}],
 ['Find lim_(x->-infinity) (e^x - 1 - x).',{shape:'limit',f:'e^x - 1 - x',at:'-inf'}],
 // antiderivatives
 ['Find the integral of 3x^2 - 4/x.',{shape:'antiderivative',f:'3x^2 - 4/x'}],
 ['Find the antiderivative of cos(x)',{shape:'antiderivative',f:'cos(x)'}],
 ['Find ∫ x^(-1/2) dx.',{shape:'antiderivative',f:'x^(-1/2)'}],
 ['∫ (2x + 1) dx',{shape:'antiderivative',f:'2x + 1'}],
 ['Find int (3x^2 - 4/x) dx.',{shape:'antiderivative',f:'3x^2 - 4/x'}],
 ['Find the indefinite integral of x e^x dx',{shape:'antiderivative',f:'x e^x'}],
 // definite integrals
 ['Evaluate int_0^3 2x dx.',{shape:'definite-integral',f:'2x',a:0,b:3}],
 ['Evaluate ∫_0^1 x^2 dx',{shape:'definite-integral',f:'x^2',a:0,b:1}],
 ['Evaluate int_(-1)^2 (x^2 + 1) dx.',{shape:'definite-integral',f:'x^2 + 1',a:-1,b:2}],
 ['int_0^(pi/2) sin(x) dx',{shape:'definite-integral',f:'sin(x)',a:0,b:'pi/2'}],
 ['Find the integral of 2x from 0 to 3.',{shape:'definite-integral',f:'2x',a:0,b:3}],
 ['Evaluate the definite integral of x^2 dx from 1 to 2',{shape:'definite-integral',f:'x^2',a:1,b:2}],
 // critical point, extremum, Newton
 ['Find the critical point of f(x) = x^2 - 4x + 1 on [0, 5].',{shape:'critical-point',f:'x^2 - 4x + 1',on:[0,5]}],
 ['Find the critical number of f(x) = 20x - x^2 on the interval [0, 20]',{shape:'critical-point',f:'20x - x^2',on:[0,20]}],
 ['Find the maximum value of f(x) = x^3 - 12x on [-3, 0].',{shape:'extremum',f:'x^3 - 12x',on:[-3,0],kind:'max'}],
 ['Find the minimum value of x^2 - 4x + 1 on [0, 5]',{shape:'extremum',f:'x^2 - 4x + 1',on:[0,5],kind:'min'}],
 ['Find the absolute maximum value of f(x) = x(20 - x) on [0, 20].',{shape:'extremum',f:'x(20 - x)',on:[0,20],kind:'max'}],
 ["Use Newton's method on x^2 - 2 = 0 with x_1 = 1 to find x_2.",{shape:'newton-step',f:'x^2 - 2',x0:1,steps:1}],
 ["Use Newton’s method on f(x) = x^3 - x - 1 with x_1 = 1 to find x_3",{shape:'newton-step',f:'x^3 - x - 1',x0:1,steps:2}],
 // must be null: not a shape, more than one part, another variable, or not well formed
 ['If f(x) = x^2 + 1 and g(x) = sqrt(x - 3), find (f∘g)(x).',null],
 ['Solve 2sin(theta) - 1 = 0 for 0 <= theta < 2pi.',null],
 ['Solve e^(2x) = 7.',null],
 ['Evaluate log_2(8) + log_3(1/9).',null],
 ['Find c so that f is continuous: f(x) = { cx + 1 if x < 2;  x^2 - c if x >= 2 }',null],
 ['Find dy/dx if x^2 + y^2 = 25.',null],
 ['Find lim_(theta->0) (1 - cos(theta))/theta.',null],
 ['Air fills a sphere at 100 cm^3/s. How fast is r growing when r = 5 cm?',null],
 ['Find the absolute maximum and minimum of f(x) = x^3 - 12x on [-3, 5].',null],
 ['Find the x-values of the inflection points of f(x) = x^4 - 6x^2.',null],
 ['A rectangle has perimeter 40 m. Find the sides that give the largest area.',null],
 ["Use Newton's method on x^2 - 2 = 0 with x_1 = 1 to find x_3.",null],
 ["Find f if f'(x) = 3x^2 - 4/x and f(1) = 2, for x > 0.",null],
 ['Write the right-endpoint sum for int_0^2 x^2 dx with n rectangles and find its limit.',null],
 ['Let g(x) = int_0^x (t^2 + 1) dt. Find g(3).',null],
 ['Find the area between y = x and y = x^2.',null],
 // Calculus 1 page lines (kind 'page'): statements, not tasks
 ['lim_(x->0) sin(x)/x = 1',null],
 ['lim_(x->0+) 1/x = infinity,   lim_(x->0-) 1/x = -infinity',null],
 ["f'(a) = lim_(h->0) (f(a + h) - f(a))/h",null],
 ['int x^(-1/2) dx = 2 sqrt(x) + C,   int sec^2(x) dx = tan(x) + C',null],
 ['int_(-1)^2 |x| dx = 1/2 + 2 = 5/2',null],
 ['d/dx int_0^(x^2) cos(t) dt = 2x cos(x^2)',null],
 ['f(b) - f(a) = f\'(c)(b - a) for some c in (a, b)',null],
 // school items stay with the school rules
 ['Solve for x:  3x − 7 = 11',null],
 ['Factor completely:  x² + 7x + 12',null],
 ['Expand:  (x + 4)(x − 3)',null],
 ['Find the slope of the line through (2, 5) and (6, 13)',null],
 ['2x+3=11',null],
 // multi-part, and specs the desk refuses
 ["Differentiate f(x) = x^2. Then find f'(1).",null],
 ["(a) Differentiate f(x) = x^2 (b) find f'(1)",null],
 ['Differentiate f(x) = x^2 and x^3.',null],
 ['Find lim_(x->0) |x|/x.',null],
 ['Differentiate f(x) = sin(x)^2 + cos(x)^2.',null],
 ['Find the critical point of f(x) = x^3 - 3x on [-2, 2].',null],
 ['Find the maximum value of f(x) = x^2 on [1, 3].',null],
 ['Find the derivative of y^2 + 1.',null],
 ['Find the local maximum value of f(x) = x^3 - 12x on [-3, 0].',null],
 ['',null],
];

test('2: specFromQuestion - a table of page phrasings: every shape the way pages print it, and the ones that must stay null',()=>{
 assert.ok(PHRASES.length>=60,`${PHRASES.length} phrasings`);
 assert.ok(PHRASES.filter(p=>p[1]===null).length>=25,'at least 25 that must be null');
 const fromCorpus=CALCULUS_1.topics.flatMap(t=>t.examples).filter(e=>e.kind==='question'||e.kind==='page').map(e=>e.plain);
 assert.ok(PHRASES.filter(p=>fromCorpus.includes(p[0])).length>=30,'drawn from Calculus 1\'s own question and page examples');
 const bad=[];
 for(const [text,want] of PHRASES){
  const got=C.specFromQuestion(text);
  try{assert.deepEqual(got,want);}catch{bad.push(`${JSON.stringify(text)} -> ${JSON.stringify(got)} (want ${JSON.stringify(want)})`);}
  if(got&&!C.wellFormed(got).ok)bad.push(`${text}: not well formed`);
 }
 assert.deepEqual(bad,[]);
});

test('3: specFromQuestion is pure and conservative - the same answer twice, null for anything that is not text',()=>{
 for(const x of [undefined,null,42,{},['Differentiate x^2'],'   ','x'.repeat(400)])assert.equal(C.specFromQuestion(x),null,String(x).slice(0,20));
 const t='Find lim_(x->0) sin(x)/x';
 assert.deepEqual(C.specFromQuestion(t),C.specFromQuestion(t));
 assert.notEqual(C.specFromQuestion(t),C.specFromQuestion(t),'a fresh object each time: no shared state to mutate');
});

test('4: the fallback for a spec is a fixed sentence per shape, chosen in code - no value, no number word, and it never leaks',()=>{
 const specs=[...lotACorpus(),...grid()].filter(s=>C.wellFormed(s).ok);
 const NUMBER_WORD=/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|half|once|twice)\b/i;
 for(const shape of C.CALC_SHAPES){
  const line=C.CALC_WITHHELD[shape];
  assert.equal(typeof line,'string',shape);assert.ok(line.length>0,shape);
  assert.ok(!/\d/.test(line)&&!NUMBER_WORD.test(line),`${shape}: ${line}`);
  assert.ok(line.trim().split(/\s+/).length<=25,`${shape}: at most 25 words`);
 }
 const bad=[];
 for(const s of specs){const line=C.withheldCalc(s);if(line!==C.CALC_WITHHELD[s.shape])bad.push(`${s.shape}: not its shape's line`);else if(C.leaksCalc(s,line))bad.push(`${s.shape} ${s.f}: leaks`);}
 assert.deepEqual(bad,[]);
 assert.equal(C.withheldCalc({shape:'derivative',f:'x^2'}),'Name the rule the expression is built with, then say the first step out loud.');
 assert.equal(typeof C.withheldCalc(null),'string','a line even with no spec');
});

// ------------------------------------------------------------------ hint(): the engine stubbed at the provider seam
let seen=[];
function stub(...answers){seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);const a=answers[Math.min(seen.length-1,answers.length-1)];return {raw:JSON.stringify(a)};}});}
const DIFF='Differentiate f(x) = x^3 + x^2',LIM='Find lim_(x->0) sin(x)/x';
const SCHOOL_STANCE='You are a maths tutor for a 15-year-old. This sheet is a factoring and linear-equations unit; prefer the unit\'s methods over heavier ones.';
const CALC_STANCE=/first-year university student in Calculus I/;

test('5: a Calculus page\'s hint that states the derivative is re-asked once; a second leak gets the shape\'s fixed sentence, next empty',async()=>{
 const clean={hint:'Use the power rule on each term.',what_to_try_next:'Write each term\'s new power above it.'};
 stub({hint:'it comes to 3x^2 + 2x',what_to_try_next:'Check it.'},clean);
 let h=await hint('maths',DIFF,{path:'calc1'});
 assert.equal(seen.length,2,'exactly one re-ask');
 assert.match(seen[1].prompt,/previous hint gave the answer away \(in the hint\)/i);
 assert.doesNotMatch(seen[1].prompt,/3x\^2 \+ 2x/,'the re-ask does not hand the leaked line back');
 assert.deepEqual([h.hint,h.next],[clean.hint,clean.what_to_try_next]);
 stub({hint:'it comes to 3x^2 + 2x',what_to_try_next:'Check it.'},{hint:'So you get 2x + 3x^2.',what_to_try_next:'Done.'});
 h=await hint('maths',DIFF,{path:'calc1'});
 assert.equal(seen.length,2,'no third model call');
 assert.deepEqual([h.hint,h.next],[C.withheldCalc(C.specFromQuestion(DIFF)),'']);
 assert.equal(h.hint,'Name the rule the expression is built with, then say the first step out loud.');
 // a leak in what_to_try_next alone is caught too, and the path does not gate the check - the page's text does
 stub({hint:'Look at each term.',what_to_try_next:"so f'(x) = x(3x + 2)"},clean);
 h=await hint('maths',DIFF,{});
 assert.equal(seen.length,2);assert.match(seen[1].prompt,/what to try next/i);assert.equal(h.hint,clean.hint);
});

test('6: a clean Calculus hint is kept verbatim in one call; a limit hint that says the limit is re-asked',async()=>{
 stub({hint:'Use the power rule on each term',what_to_try_next:'Write the first term\'s derivative.'});
 const h=await hint('maths',DIFF,{path:'calc1'});
 assert.equal(seen.length,1);assert.equal(h.hint,'Use the power rule on each term');
 const clean={hint:'Compare sin(x) with x when x is small.',what_to_try_next:'Sketch both near the origin.'};
 stub({hint:'the limit is 1',what_to_try_next:'Check it.'},clean);
 const l=await hint('maths',LIM,{path:'calc1'});
 assert.equal(seen.length,2,'re-asked');assert.equal(l.hint,clean.hint);
 stub({hint:'the limit is 1',what_to_try_next:'Check it.'},{hint:'It tends to one.',what_to_try_next:'x'});
 const w=await hint('maths',LIM,{path:'calc1'});
 assert.deepEqual([w.hint,w.next],[C.CALC_WITHHELD.limit,'']);
 assert.equal(maths.leaks(LIM,'the limit is 1'),false,'the school rule alone misses it - the reason this suite exists');
});

test('7: the stance follows the learner\'s path - Calculus I on calc1, today\'s school text byte for byte otherwise',async()=>{
 const reply={hint:'Use the power rule on each term',what_to_try_next:'Write it.'};
 stub(reply);await hint('maths',DIFF,{path:'calc1'});
 assert.match(seen[0].system,CALC_STANCE);assert.ok(!seen[0].system.includes(SCHOOL_STANCE));
 for(const opts of [{},{path:'school'}]){
  stub(reply);await hint('maths','Solve for x:  3x − 7 = 11',opts);
  assert.ok(seen[0].system.startsWith(SCHOOL_STANCE+'. Socratic rules, absolute:'),JSON.stringify(opts)+' - the text as it is today, its double stop included');
  assert.doesNotMatch(seen[0].system,CALC_STANCE);
 }
 // English and essay keep their stance whatever the path
 stub(reply);await hint('essay','My essay',{path:'calc1'});assert.ok(seen[0].system.startsWith('You are a writing tutor for a 15-year-old.'));
});

// ------------------------------------------------------------------ the route: the path from the session, the lesson pick skipped on calc1
function stubRoute(hintReply){
 const calls={hint:0,lesson:0,prompts:[]};
 reg.useProvider('text',{name:'stub',run:async(req)=>{
  const p=Object.keys(req.schema?.properties??{});
  if(p.includes('lesson')){calls.lesson++;return {raw:JSON.stringify({lesson:'none',why:'x'})};}
  calls.hint++;calls.prompts.push(req.system);return {raw:JSON.stringify(hintReply)};
 }});
 return calls;
}
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const drain=async()=>{for(let i=0;i<40;i++)await new Promise((r)=>setImmediate(r));};
function onPage(mathPath,text){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:`calc-hint-${mathPath}`,name:'Scratch',type:'other',...(mathPath==='calc1'?{mathPath}:{})}});store.dispatch({type:'profile.save'});
 const page={id:`maths-${mathPath}`,subject:'maths',title:'Sheet',img:'',w:100,h:100};
 store.dispatch({type:'page.reading',page});store.dispatch({type:'page.read',id:page.id,items:[{n:1,text,cx:0,cy:0,band:[0,10],key:'k1'}],readMs:1,provider:'test'});
 assert.equal(store.getSession().screen,'page');
}

test('8: the route - no lesson pick on the calc1 path (the lesson job ends as "no lesson"), one on school; the stance comes from the session',async()=>{
 onPage('calc1',DIFF);
 let calls=stubRoute({hint:'Use the power rule on each term',what_to_try_next:'Write it.'});
 assert.equal((await post('hint',{})).status,200);await drain();
 let s=store.getSession();
 assert.equal(calls.lesson,0,'no pickLesson call on calc1');assert.equal(calls.hint,1);
 assert.match(calls.prompts[0],CALC_STANCE,'the calc1 path reached hint() through the route');
 assert.equal(s.jobs?.lesson?.phase,'done','no new failure state');assert.equal(s.noLesson,true);assert.equal(s.lesson,null);
 assert.equal(s.hint.hint1.hint,'Use the power rule on each term');
 // still stuck: the second hint is on the Calculus stance too, and still no lesson pick
 assert.equal((await post('hint',{stage:2})).status,200);await drain();
 assert.equal(calls.lesson,0);assert.match(calls.prompts[1],CALC_STANCE);
 onPage('school','Solve for x:  3x − 7 = 11');
 calls=stubRoute({hint:'Add 7 to both sides, then divide by 3.',what_to_try_next:'Write the new line.'});
 assert.equal((await post('hint',{})).status,200);await drain();
 s=store.getSession();
 assert.equal(calls.lesson,1,'one pickLesson call on the school path');
 assert.ok(calls.prompts[0].startsWith(SCHOOL_STANCE));
 assert.equal(s.jobs?.lesson?.phase,'done');assert.equal(s.noLesson,true,'the stub answered none');
});
