/**
 * The Calculus expression engine (desk/src/lib/rules/calc-expr.ts): the plain notation our prompts ask the models
 * for and learners write, read into an expression the desk can evaluate, and the numerics a checker needs -
 * derivative at a point, definite integral, limits, roots and extrema on an interval, and function equivalence by
 * sampling. Pure: no store, no route, no model. Run with npm test in desk/ (directly: node tools/calc-expr-test.cjs).
 *
 * Tolerances used below are the engine's own stated ones: derivativeAt 1e-7 relative on smooth functions, integrate
 * 1e-9, sameFunction 1e-7 relative. Timing budgets: 20 ms per numeric call on the corpus, 50 ms per call in the fuzz.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const E=require(path.join(root,'src/lib/rules/calc-expr.ts'));
const V=require(path.join(root,'src/lib/desk/verify.ts'));

/** Relative closeness at a stated tolerance, floor 1 so a value near zero is compared absolutely. */
const near=(a,b,tol)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b));
const at=(s,x)=>{const e=E.compile(s);assert.ok(e,`compiles: ${s}`);return e.at(x);};
const ms=(fn)=>{const t=process.hrtime.bigint();const v=fn();return {v,ms:Number(process.hrtime.bigint()-t)/1e6};};
/**
 * A timing ledger: every call is timed once; at the end the 12 slowest are re-timed three more times and the least
 * of the four kept, so a garbage-collection pause landing inside one call is not reported as that call being slow.
 */
function ledger(){
 const all=[];
 const note=(what,fn)=>{let m;try{m=ms(fn);}catch(err){assert.fail(`${what} threw: ${err&&err.message}`);}all.push({what,fn,ms:m.ms});return m.v;};
 const worst=()=>{all.sort((a,b)=>b.ms-a.ms);let w={ms:0,what:'none',first:0};for(const c of all.slice(0,12)){let best=c.ms;for(let k=0;k<3;k++)best=Math.min(best,ms(c.fn).ms);if(best>w.ms)w={ms:best,what:c.what,first:c.ms};}return w;};
 return {note,worst};
}

// ------------------------------------------------------------------ the parse corpus
/**
 * Formula strings COPIED from desk/src/lib/library/calculus1.ts (the example id in each comment): the formula part of
 * a plain form - after 'f(x) =', after lim_(...), the integrand after int_a^b, a working line's side, an answer.
 * Where the corpus's variable is t, u, r or theta the formula is copied with x in its place (marked 'in x'), since the
 * engine reads one variable, x.
 */
const CORPUS=[
 'x^2 + 1','sqrt(x - 3)','(sqrt(x - 3))^2 + 1','x - 3 + 1','x - 2','|x - 2| - 1','|x|',                  // c01
 'sin(x)/cos(x)','sin^2(x) + cos^2(x)','tan(x)','2sin(x) - 1','1/2','pi/6','5pi/6','2pi',              // c02 (in x)
 'e^(2x)','ln(7)','ln(7)/2','log_2(8) + log_3(1/9)','(2x + 1)/(x - 3)','2x',                          // c03
 '(x^2 - 4)/(x - 2)','(x - 2)(x + 2)/(x - 2)','x + 2','1/x','(x + 2)',                                // c04
 'x^2 sin(1/x)','sin(1/x)','-x^2','(sqrt(x + 1) - 2)/(x - 3)','(1/(x + 1) - 1)/x','sin(x)/x','|x - 2|', // c05
 '(3x^2 - x)/(2x^2 + 5)','3/2','(x + 1)/(x - 3)','x^3 - x - 1','cx + 1'.replace('c','2'),'x^2 - 1',   // c06 (c as 2)
 'x^2 + 3x','2x + 3',                                                                                 // c07
 '(x^2 + 1)/(x - 1)','(2x(x - 1) - (x^2 + 1)(1))/(x - 1)^2','(2x^2 - 2x - x^2 - 1)/(x - 1)^2','(x^2 - 2x - 1)/(x - 1)^2','x^(-1/2)','-1/2 x^(-3/2)', // c08
 'x^2 e^x sin(x)','2x e^x sin(x) + x^2 e^x sin(x) + x^2 e^x cos(x)','(1 - cos(x))/x','sec(x) tan(x)','sec^2(x)','sec(x)', // c09 (theta in x)
 'cbrt(1 + x^2)','2x/(3(1 + x^2)^(2/3))','sin(x^3)','3x^2 cos(x^3)','2e^(2x)','-x',                   // c10
 'ln(x)/x','(1 - ln(x))/x^2','((1/x)(x) - ln(x)(1))/x^2','x^x','x^x (ln(x) + 1)','100e^(-0.05x)','ln(2)/0.05', // c11 (t in x)
 '(4/3) pi x^3','4 pi x^2','sqrt(4.1)','2 + (1/4)(0.1)','1/pi',                                        // c12 (r in x)
 'x^3 - 12x','3x^2 - 12',                                                                             // c13
 '(e^x - 1 - x)/x^2','(e^x - 1)/(2x)','e^x/2','x^4 - 6x^2',                                           // c14
 'x(20 - x)','20x - x^2','20 - 2x','x(12 - 2x)^2',                                                    // c15
 'x^2 - 2','1 - (1 - 2)/2','3/2 - (9/4 - 2)/3','17/12','577/408',                                     // c16
 '3x^2 - 4/x','x^3 - 4ln(x) + 1','x^3 - 4 ln(x) + C','2 sqrt(x) + C','tan(x) + C',                    // c17
 'x^2','8/3','(2x)^2',                                                                                // c18
 'x^2 + 1','x^3/3 + x','1/2 + 2','5/2',                                                               // c19 (t in x)
 '2x + 1/sqrt(x)','2x + x^(-1/2)','x^2 + 2 sqrt(x)','(16 + 4) - (1 + 2)','2x cos(x^2)','cos(x)','x^2 - 4','x^3/3 - 4x', // c20 (t in x)
 '2x (x^2 + 1)^3','x^4/4','16/4 - 1/4','15/4','sin(x) cos(x)','sin^2(x)/2 + C','x/sqrt(1 - x^2)','-sqrt(1 - x^2) + C', // c21 (u in x)
 'x - x^2','x^2/2 - x^3/3','1/6','2/pi','sin(x)','(1/(3 - 0)) * (x^2)',                                // c22
];

/** Edge cases: each function name glued and spaced, unary minus and powers, nested fractions, glyphs. [src, x, value]. */
const S3=Math.sqrt(3),EDGE=[
 ['sinx',0.5,Math.sin(0.5)],['sin x',0.5,Math.sin(0.5)],['cosx',0.5,Math.cos(0.5)],['cos x',0.5,Math.cos(0.5)],
 ['tanx',0.5,Math.tan(0.5)],['tan x',0.5,Math.tan(0.5)],['secx',0.5,1/Math.cos(0.5)],['csc x',0.5,1/Math.sin(0.5)],
 ['cot x',0.5,1/Math.tan(0.5)],['cotx',0.5,1/Math.tan(0.5)],['asin(x)',0.5,Math.asin(0.5)],['arcsin x',0.5,Math.asin(0.5)],
 ['acos x',0.5,Math.acos(0.5)],['arccos(x)',0.5,Math.acos(0.5)],['atan x',0.5,Math.atan(0.5)],['arctanx',0.5,Math.atan(0.5)],
 ['sinh x',0.5,Math.sinh(0.5)],['coshx',0.5,Math.cosh(0.5)],['tanh(x)',0.5,Math.tanh(0.5)],['ln x',2,Math.log(2)],
 ['lnx',2,Math.log(2)],['log x',2,Math.log(2)],['log_2(x)',8,3],['log_2 x',8,3],['log₂(x)',8,3],['log_(10) x',1000,3],
 ['exp(x)',1,Math.E],['exp x',1,Math.E],['sqrt x',9,3],['sqrt(x+7)',9,4],['√x',9,3],['√(x+7)',9,4],['2√x',9,6],
 ['cbrt x',-8,-2],['∛x',27,3],['abs(x)',-3,3],['|x|',-3,3],['|x - 5|',2,3],['2pi',0,2*Math.PI],['2π',0,2*Math.PI],['pi x',2,2*Math.PI],
 ['3e^x',1,3*Math.E],['e',0,Math.E],['x(x+1)',2,6],['(x+1)(x-1)',3,8],['2sin(x)',0.5,2*Math.sin(0.5)],['2 sin x',0.5,2*Math.sin(0.5)],
 ['-x^2',3,-9],['- x^2',3,-9],['(-x)^2',3,9],['x^-1',4,0.25],['e^-x',1,1/Math.E],['2^-2',0,0.25],['-2^2',0,-4],
 ['sin^2 x',0.5,Math.sin(0.5)**2],['sin^2(x)',0.5,Math.sin(0.5)**2],['sin²x',0.5,Math.sin(0.5)**2],['sin(x)^2',0.5,Math.sin(0.5)**2],
 ['cos^3(2x)',0.3,Math.cos(0.6)**3],['sin^-1 x',0.5,Math.asin(0.5)],['x^-1/2',4,0.125],['x^(-1/2)',4,0.5],
 ['x²',3,9],['x³ + x⁻¹',2,8.5],['e²ˣ',0.5,Math.E],['x⁽²⁾',3,9],['2^3^2',0,512],['1/2/4',0,0.125],['x/2x',3,4.5],
 ['x·x',3,9],['x×2',3,6],['6÷x',3,2],['5 − x',2,3],['x ∗ 2',3,6],['.5x',4,2],['3.25x',2,6.5],['0.5 x^2',2,2],
 ['sin(3x)/x',0.1,Math.sin(0.3)/0.1],['sin 3x',0.1,Math.sin(0.3)],['sin x cos x',0.5,Math.sin(0.5)*Math.cos(0.5)],['ln x/x',2,Math.log(2)/2],
 ['sin x^2',1.5,Math.sin(2.25)],['e^sin x',1,Math.exp(Math.sin(1))],['ln ln x',10,Math.log(Math.log(10))],['sqrt(x)sqrt(x)',5,5],
 ['1/(1 + 1/(1 + 1/x))',1,2/3],['((x))',7,7],['[x + 1]^2',2,9],['{x}',4,4],['X^2',3,9],['x ^ 2',3,9],['3 x',2,6],
 ['sec^2 x - tan^2 x',0.7,1],['1/sqrt(3)',0,1/S3],['sqrt 3/2',0,S3/2],['x^x',2,4],['(x^2)^(1/2)',-3,3],
];

/** Readings that must refuse: an unknown letter, a dangling operator, empty, a number juxtaposed with a number. */
const REFUSE=['','   ','y + 1','x +','* x','(x + 1','x + 1)','f(x)','sin','sin()','2 3','x 2','3..4','x^','log_(x',
 'C','x C','Cx + 1','x + C + 1','dx','theta','1 = 1','x, y','x;1',];

test('1: every formula copied from the Calculus 1 corpus compiles, and evaluates like verify.ts wherever verify can read it',()=>{
 assert.ok(CORPUS.length>=80,`at least 80 corpus formulas (${CORPUS.length})`);
 const failed=CORPUS.filter(s=>!E.compile(s));
 assert.deepEqual(failed,[],'every corpus formula compiles');
 for(const s of CORPUS){
  const e=E.compile(s);
  for(const x of [0.37,1.9,4.3]){
   const v=e.at(x),w=V.evaluate(s,x);
   assert.equal(typeof v,'number');
   if(w!==null)assert.ok(near(v,w,1e-12),`${s} at ${x}: ${v} vs verify ${w}`);
  }
 }
});

test('2: at least 40 edge cases read by the stated rules, each pinned to its value',()=>{
 assert.ok(EDGE.length>=40);
 const wrong=[];
 for(const [s,x,want] of EDGE){const e=E.compile(s);const v=e?e.at(x):null;if(!e||!near(v,want,1e-12))wrong.push(`${s} @${x}: got ${v} want ${want}`);}
 assert.deepEqual(wrong,[]);
});

test('3: unreadable input is null, never a throw; over 200 characters and deeper than 40 are null',()=>{
 const got=REFUSE.filter(s=>E.compile(s)!==null);
 assert.deepEqual(got,[],'every refusal is null');
 assert.equal(E.compile(null),null);assert.equal(E.compile(42),null);assert.equal(E.compile(undefined),null);
 assert.equal(E.compile('x+'.repeat(100)+'x'),null,'201 characters');
 assert.ok(E.compile('x+'.repeat(99)+'x'),'199 characters is read');
 assert.equal(E.compile('('.repeat(41)+'x'+')'.repeat(41)),null,'41 deep');
 assert.ok(E.compile('('.repeat(39)+'x'+')'.repeat(39)),'39 deep is read');
});

test('4: the arbitrary constant is recognised and reported, never evaluated as a variable',()=>{
 for(const s of ['x^2/2 + C','x^2/2+C','x^2/2 + c','x^2/2 - C','-cos(x) + C']){
  const e=E.compile(s);assert.ok(e,s);assert.equal(e.constant,true,s);
 }
 assert.equal(E.compile('x^2/2').constant,false);
 assert.ok(near(E.compile('x^2/2 + C').at(2),2,1e-15),'the constant is not a value');
 assert.equal(E.compile('3x').usesX,true);assert.equal(E.compile('ln 2').usesX,false);
});

test('5: at() never throws and is NaN outside the domain',()=>{
 assert.ok(Number.isNaN(at('ln(x)',-1)));assert.ok(Number.isNaN(at('sqrt(x)',-1)));assert.ok(Number.isNaN(at('1/x',0)));
 assert.ok(Number.isNaN(at('ln(0)',0)),'ln 0 is not a number');assert.ok(Number.isNaN(at('asin(x)',2)));
 assert.ok(Number.isNaN(at('9^9^9',0)),'overflow is not a number');assert.equal(at('0^0',0),1);
 assert.ok(Number.isNaN(E.compile('x+1').at()),'x missing is NaN');assert.equal(E.compile('2+1').at(),3);
});

test('6: the pinned values - derivative, integral, limits, sameFunction, sameUpToConstant',()=>{
 const c=E.compile;
 assert.ok(near(E.derivativeAt(c('x^3+x^2'),2),16,1e-7),`d/dx x^3+x^2 at 2 = 16, got ${E.derivativeAt(c('x^3+x^2'),2)}`);
 assert.ok(near(E.integrate(c('x^2'),0,1),1/3,1e-9),'int_0^1 x^2 = 1/3');
 assert.deepEqual(r(E.limitAt(c('sin(x)/x'),0)),{kind:'value',v:1});
 assert.deepEqual(r(E.limitAt(c('(x^2-4)/(x-2)'),2)),{kind:'value',v:4});
 assert.deepEqual(E.limitAt(c('1/x^2'),0),{kind:'inf',sign:1});
 const L=E.limitInf(c('(1+1/x)^x'),1);assert.equal(L.kind,'value');assert.ok(near(L.v,Math.E,1e-6),`(1+1/x)^x -> e, got ${L.v}`);
 assert.deepEqual(E.limitAt(c('|x|/x'),0),{kind:'dne'});
 assert.deepEqual(r(E.limitAt(c('|x|/x'),0,'+')),{kind:'value',v:1});
 assert.deepEqual(r(E.limitAt(c('|x|/x'),0,'-')),{kind:'value',v:-1});
 assert.equal(E.sameFunction(c('3x^2+2x'),c('2x+3x^2')),true);
 assert.equal(E.sameFunction(c('3x^2+2x'),c('3x^2+x')),false);
 assert.equal(E.sameFunction(c('sin(x)^2+cos(x)^2'),c('1')),true);
 assert.equal(E.sameUpToConstant(c('x^2/2'),c('x^2/2+7')),true);
});
/** A limit's value rounded to 9 places, so a numerically found 1 is compared as 1. */
function r(L){return L&&L.kind==='value'?{kind:'value',v:Math.round(L.v*1e9)/1e9+0}:L;}

test('7: derivativeAt - 1e-7 relative on smooth functions, null where there is no derivative',()=>{
 const c=E.compile;
 const cases=[['sin(x)',1,Math.cos(1)],['e^x',3,Math.exp(3)],['ln(x)',0.01,100],['x^x',2,4*(Math.log(2)+1)],['sqrt(x)',1e-3,0.5/Math.sqrt(1e-3)],
  ['1/x',-0.5,-4],['x^10',2,10*512],['tan(x)',1.5,1/Math.cos(1.5)**2],['atan(x)',100,1/10001],['e^(-x^2)',1,-2/Math.E],['(x^2+1)/(x-1)',3,(9-6-1)/4],
  ['2x/(3(1 + x^2)^(2/3))',0.7,null],['1000x^3',0.001,3e-3]];
 for(const [s,x,want] of cases){
  const d=E.derivativeAt(c(s),x);
  if(want===null){assert.ok(Number.isFinite(d),s);continue;}
  assert.ok(near(d,want,1e-7)||Math.abs(d-want)<=1e-7*Math.abs(want),`${s} at ${x}: ${d} vs ${want}`);
 }
 assert.equal(E.derivativeAt(c('|x|'),0),null,'a corner has no derivative');
 assert.equal(E.derivativeAt(c('sqrt(x)'),-1),null,'outside the domain');
 assert.equal(E.derivativeAt(c('1/x'),0),null,'at a pole');
 assert.ok(near(E.derivativeAt((x)=>x*x,3),6,1e-7),'a plain function is accepted');
});

test('8: integrate - adaptive Simpson to 1e-9; null on an improper interval or a non-finite integrand',()=>{
 const c=E.compile;
 const cases=[['2x',0,3,9],['sin(x)',0,Math.PI,2],['1/x',1,Math.E,1],['e^x',0,1,Math.E-1],['2x (x^2 + 1)^3',0,1,15/4],['2x + 1/sqrt(x)',1,4,17],
  ['x - x^2',0,1,1/6],['sqrt(x)',0,1,2/3],['x ln(x)',1,2,2*Math.log(2)-0.75],['|x|',-1,2,5/2],['x^2 - 4',0,3,-3],['sin(x)',0,0,0],['x^2',1,0,-1/3],['cos(x)^2',0,2*Math.PI,Math.PI],['e^(-x^2)',-3,3,1.7724146965190428]];
 for(const [s,a,b,want] of cases){const v=E.integrate(c(s),a,b);assert.ok(near(v,want,1e-9),`int ${s} on [${a},${b}]: ${v} vs ${want}`);}
 assert.equal(E.integrate(c('1/x'),-1,1),null,'a pole inside');
 assert.equal(E.integrate(c('1/sqrt(x)'),0,1),null,'an improper integrand at the end');
 assert.equal(E.integrate(c('1/(x-0.3)'),0,1),null,'a pole not on a sample point');
 assert.equal(E.integrate(c('x'),0,Infinity),null,'an improper interval');
 assert.equal(E.integrate(c('ln(x)'),-1,1),null,'undefined on part of the interval');
});

test('9: limits - two-sided, one-sided, at infinity, to infinity, and does-not-exist',()=>{
 const c=E.compile;
 const val=[['(sqrt(x + 1) - 2)/(x - 3)',3,1/4],['(1/(x + 1) - 1)/x',0,-1],['x^2 sin(1/x)',0,0],['(1 - cos(x))/x',0,0],['(e^x - 1 - x)/x^2',0,0.5],
  ['sin(3x)/x',0,3],['x^2',3,9],['(x^3-8)/(x-2)',2,12],['tan(x)/x',0,1]];
 for(const [s,a,want] of val){const L=E.limitAt(c(s),a);assert.equal(L.kind,'value',s);assert.ok(near(L.v,want,1e-6),`${s} -> ${want}, got ${L.v}`);}
 assert.deepEqual(E.limitAt(c('1/x'),0,'+'),{kind:'inf',sign:1});
 assert.deepEqual(E.limitAt(c('1/x'),0,'-'),{kind:'inf',sign:-1});
 assert.deepEqual(E.limitAt(c('1/x'),0),{kind:'dne'},'the two sides disagree');
 assert.deepEqual(E.limitAt(c('-1/x^2'),0),{kind:'inf',sign:-1});
 assert.deepEqual(E.limitAt(c('ln(x)'),0,'+'),{kind:'inf',sign:-1});
 assert.deepEqual(E.limitAt(c('sin(1/x)'),0),{kind:'dne'});
 assert.equal(E.limitAt(c('x^x'),0,'+').kind,'value');
 const inf=[['(3x^2 - x)/(2x^2 + 5)',1,1.5],['e^-x',1,0],['x sin(1/x)',1,1],['(2x+1)/(x-3)',-1,2],['atan(x)',-1,-Math.PI/2]];
 for(const [s,sg,want] of inf){const L=E.limitInf(c(s),sg);assert.equal(L.kind,'value',s);assert.ok(near(L.v,want,1e-6),`${s} at ${sg}inf -> ${want}, got ${L.v}`);}
 assert.deepEqual(E.limitInf(c('x^2'),-1),{kind:'inf',sign:1});
 assert.deepEqual(E.limitInf(c('e^x'),1),{kind:'inf',sign:1});
 assert.deepEqual(E.limitInf(c('ln(x)'),1),{kind:'inf',sign:1});
 assert.deepEqual(E.limitInf(c('sin(x)'),1),{kind:'dne'});
 assert.equal(E.limitAt(c('ln(x)'),-1),null,'no side of the point is in the domain');
});

test('10: rootIn and extremumIn - scan then refine',()=>{
 const c=E.compile;
 assert.ok(near(E.rootIn(c('x^2 - 2'),0,3),Math.SQRT2,1e-10));
 assert.ok(near(E.rootIn(c('x^3 - x - 1'),1,2),1.324717957244746,1e-10));
 assert.ok(near(E.rootIn(c('cos(x)'),0,3),Math.PI/2,1e-10));
 assert.ok(near(E.rootIn(c('x^2'),-1,1.3),0,1e-6),'a double root, found without a sign change');
 assert.equal(E.rootIn(c('tan(x)'),1,2),null,'a pole is not a root');
 assert.equal(E.rootIn(c('x^2 + 1'),-5,5),null);
 assert.deepEqual(E.rootsIn(c('x^2 - 1'),-3,3).map(v=>Math.round(v*1e9)/1e9),[-1,1]);
 const mx=E.extremumIn(c('x^3 - 12x'),-3,0,'max');assert.ok(near(mx.x,-2,1e-6)&&near(mx.y,16,1e-9),JSON.stringify(mx));
 const mn=E.extremumIn(c('x^2 - 4x + 1'),0,5,'min');assert.ok(near(mn.x,2,1e-6)&&near(mn.y,-3,1e-9),JSON.stringify(mn));
 const end=E.extremumIn(c('x^3 - 12x'),-3,5,'max');assert.equal(end.x,5);assert.ok(near(end.y,65,1e-12));
 assert.equal(E.extremumIn(c('1/x'),-1,1,'max'),null,'unbounded near a pole');
});

test('11: sameFunction and sameUpToConstant - irrational samples, defined-ness on the positive side',()=>{
 const c=E.compile,sf=(a,b)=>E.sameFunction(c(a),c(b)),su=(a,b)=>E.sameUpToConstant(c(a),c(b));
 assert.ok(E.SAMPLES.length>=9&&E.SAMPLES.some(x=>x<0)&&E.SAMPLES.some(x=>x>0));
 assert.equal(sf('(x^2 - 4)/(x - 2)','x + 2'),true);
 assert.equal(sf('sqrt(x)^2','x'),true,'undefined for negative x only: compared only where both are defined');
 assert.equal(sf('ln(x^2)','2ln(x)'),true,'the same where both are defined');
 assert.equal(sf('ln(x)','ln(-x)'),false,'different defined-ness on the positive samples');
 assert.equal(sf('x^3','x^3 + 0.001'),false);
 assert.equal(sf('2sin(x)cos(x)','sin(2x)'),true);assert.equal(sf('e^(2x)','(e^x)^2'),true);
 assert.equal(sf('x^2/2 + C','x^2/2'),true,'the constant is not a value');
 assert.equal(su('-cos(x)','1 - cos(x)'),true);assert.equal(su('sin(x)^2','-cos(x)^2'),true);
 assert.equal(su('x^2','x^2 + x'),false);assert.equal(su('ln(x)','ln(3x)'),true);
});

test('12: toTex - the typesetter\'s TeX for an expression',()=>{
 const c=E.compile;
 assert.equal(E.toTex(c('sin(3x)/x')),'\\frac{\\sin(3x)}{x}');
 assert.equal(E.toTex(c('3x^2 + 2x')),'3x^{2} + 2x');
 assert.equal(E.toTex(c('sqrt(x+1)')),'\\sqrt{x + 1}');
 assert.equal(E.toTex(c('e^(2x)')),'e^{2x}');
 assert.equal(E.toTex(c('2pi')),'2\\pi');
 assert.equal(E.toTex(c('|x|')),'\\lvert x \\rvert');
 assert.equal(E.toTex(c('sin^2 x')),'\\sin^{2}(x)');
});

test('13: numerics are under 20 ms per call on the corpus',()=>{
 const L=ledger(),note=L.note;
 for(let pass=0;pass<2;pass++)for(const s of CORPUS){
  const e=E.compile(s);
  note(`d ${s}`,()=>E.derivativeAt(e,1.3));note(`int ${s}`,()=>E.integrate(e,0.5,2.5));note(`lim ${s}`,()=>E.limitAt(e,0.5));
  note(`inf ${s}`,()=>E.limitInf(e,1));note(`root ${s}`,()=>E.rootIn(e,-2,2));note(`ext ${s}`,()=>E.extremumIn(e,0.5,3,'max'));
  note(`same ${s}`,()=>E.sameFunction(e,e));
 }
 const worst=L.worst();
 console.log(`# worst numeric call on the corpus: ${worst.ms.toFixed(2)} ms, least of four timings (${worst.what}; first timing ${worst.first.toFixed(2)} ms)`);
 assert.ok(worst.ms<20,`${worst.what}: ${worst.ms} ms`);
});

test('15: a grammatical fuzz - 1500 generated expressions all compile, and no numeric on them throws or takes 50 ms',()=>{
 let seed=424242;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);const pick=(a)=>a[Math.floor(rnd()*a.length)];
 const FN=['sin','cos','tan','sec','ln','exp','sqrt','cbrt','abs','atan','arcsin','sinh','log'];
 const gen=(d)=>{const r=rnd();if(d>3||r<0.3)return pick(['x','2','3.5','pi','e','x^2','1/x','0']);
  if(r<0.5)return `${gen(d+1)} ${pick(['+','-','*','/'])} ${gen(d+1)}`;if(r<0.65)return `(${gen(d+1)})^${pick(['2','-1','(1/2)','x'])}`;
  if(r<0.85)return `${pick(FN)}(${gen(d+1)})`;return `${pick(['2','3'])}${pick(['x','sin(x)','(x+1)','e^x'])}`;};
 const L=ledger(),note=L.note;
 const bad=[];
 for(let i=0;i<1500;i++){
  const s=gen(0);const e=E.compile(s);if(!e){if(s.length<=200)bad.push(s);continue;}
  note(`d ${s}`,()=>E.derivativeAt(e,0.7));note(`int ${s}`,()=>E.integrate(e,-1,2));note(`lim ${s}`,()=>E.limitAt(e,0));
  note(`inf ${s}`,()=>E.limitInf(e,1));note(`roots ${s}`,()=>E.rootsIn(e,-2,2));note(`ext ${s}`,()=>E.extremumIn(e,0.1,2,'max'));
  note(`same ${s}`,()=>E.sameFunction(e,e));
 }
 const worst=L.worst();
 console.log(`# grammatical fuzz: worst call ${worst.ms.toFixed(2)} ms, least of four timings (${worst.what}; first timing ${worst.first.toFixed(2)} ms)`);
 assert.deepEqual(bad,[],'a well-formed expression always compiles');
 assert.ok(worst.ms<50,`${worst.what}: ${worst.ms} ms`);
});

test('14: robustness - a 3000-string fuzz and 200 adversarial strings never throw, each call within 50 ms',()=>{
 let seed=20260929;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
 const PIECES=['x','x','1','2','3','9','0','.','+','-','*','/','^','(',')','(',')',' ','sin','cos','tan','ln','log','log_','exp','sqrt','cbrt','abs','pi','e','|','²','√','π','−','×','C','+C','sin^2','arcsin','sec','_','[',']',',','∞','ˣ','⁻¹','∛','a','y'];
 const fuzz=[];for(let i=0;i<3000;i++){let s='';const n=1+Math.floor(rnd()*24);for(let k=0;k<n;k++)s+=PIECES[Math.floor(rnd()*PIECES.length)];fuzz.push(s);}
 const adv=['(((','))) ','(x','x)','1/0','0^0','ln(0)','9^9^9','..','x..2','1e999','∞','x'.repeat(10000),'('.repeat(500)+'x'+')'.repeat(500),'('.repeat(40)+'x'+')'.repeat(40),
  '\u0000','😀','sin(','sin(x','|x','||','|||x|||','log_','log_0(x)','log_1(x)','log_(-2)(x)','sqrt(-1)','asin(2)','e^e^e^e^e','10^400','x^-','--x','+-+-x','-'.repeat(150)+'x',
  '^'.repeat(50),'sin^','sin^2','sin^(2','x^(1/0)','0/0','tan(pi/2)','1/(x-x)','(x^2-4)/(x-2)'.repeat(10),'\t\n x \r','null','undefined','NaN','Infinity','constructor','__proto__','toString',
  'x²²²²²²','⁻⁻⁻','√√√√x','∛∛x','π^π^π','e^(9^9^9)','1'.repeat(199),'1'.repeat(400),'.5.5','5.','x.','.x','1,5','x=1','C+x','x+C+C','xC','CCC'];
 for(let i=0;adv.length<200;i++)adv.push(('(x+'.repeat(i%45))+'sin(x)'+(')'.repeat(i%47))+'^'+String(i));
 let compiled=0;const L=ledger(),note=L.note;
 for(const s of [...fuzz,...adv]){
  const e=note(`compile ${JSON.stringify(s).slice(0,40)}`,()=>E.compile(s));
  if(!e)continue;compiled++;
  const q=JSON.stringify(s).slice(0,40);
  note(`at ${q}`,()=>e.at(0.7));note(`d ${q}`,()=>E.derivativeAt(e,0.7));note(`int ${q}`,()=>E.integrate(e,0,1));
  note(`lim ${q}`,()=>E.limitAt(e,0));note(`inf ${q}`,()=>E.limitInf(e,-1));note(`root ${q}`,()=>E.rootIn(e,-1,1));
  note(`ext ${q}`,()=>E.extremumIn(e,-1,1,'min'));note(`same ${q}`,()=>E.sameUpToConstant(e,e));
 }
 const worst=L.worst();
 console.log(`# fuzz: ${fuzz.length} random + ${adv.length} adversarial, ${compiled} compiled; worst call ${worst.ms.toFixed(2)} ms, least of four timings (${worst.what}; first timing ${worst.first.toFixed(2)} ms)`);
 assert.equal(adv.length,200);
 assert.ok(worst.ms<50,`${worst.what}: ${worst.ms} ms`);
});
