/**
 * The Calculus shapes and their checks (desk/src/lib/rules/calc.ts): a practice item is a SPEC - a shape and its
 * parameters - that the desk prints itself (question) and judges itself (checkAnswer), recomputing the truth
 * numerically every time, so no stored answer exists to reach a screen and a model never decides a verdict. The same
 * shapes carry the leak check (leaksCalc) and the closed slip vocabulary (CALC_SLIPS, slipsFor).
 * Pure: no store, no route, no model. Run with npm test in desk/ (directly: node tools/calc-rules-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const C=require(path.join(root,'src/lib/rules/calc.ts'));
const T=require(path.join(root,'src/maths/typeset.ts'));
const {CALCULUS_1}=require(path.join(root,'src/lib/library/calculus1.ts'));

// ------------------------------------------------------------------ the typeset check (as tools/maths-calculus-test.cjs)
const UNI={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ˣ':'x','ⁿ':'n','₀':'0','₁':'1','₂':'2','₃':'3','ₙ':'n','½':'12','¼':'14','¾':'34','⅓':'13'};
const PLAIN_SIGNS=/(?<![a-zA-Z])(sqrt|cbrt|int|sum|prod|infinity|inf|pi|alpha|beta|gamma|delta|epsilon|theta|lambda|rho|sigma|tau|phi|omega|Gamma|Delta|Theta|Lambda|Sigma|Phi|Omega)(?![a-zA-Z])/g;
function expected(src,tex){let s=[...src].map(c=>UNI[c]??c).join('');s=tex?s.replace(/\\(begin|end)\{[^}]*\}/g,' ').replace(/\\[a-zA-Z]+/g,' ').replace(/\\./g,' '):s.replace(PLAIN_SIGNS,' ');return s.replace(/[^0-9a-zA-Z]/g,'');}
const alnum=(s)=>s.replace(/[^0-9a-zA-Z]/g,'');
function subsequence(needle,hay){let i=0;for(const c of hay)if(c===needle[i])i++;return i===needle.length;}
function leaves(nodes){const out=[];T.walk(nodes,n=>{if('v' in n)out.push(n);});return out;}
/** Why a line does not typeset cleanly: '' when every letter and digit survives and no command text reaches the TV. */
function typesetFault(line,tex){
 let nodes;try{nodes=T.parseMath(line);T.flatten(nodes);}catch(e){return `throws: ${e.message}`;}
 if(!subsequence(expected(line,tex),alnum(T.flatten(nodes))))return `dropped: ${T.flatten(nodes)}`;
 const ls=leaves(nodes);
 if(ls.some(n=>String(n.v).includes('\\'))||ls.some(n=>n.t==='text'&&/^(d|t)?frac$|^sqrt$/.test(n.v)))return 'raw-tex';
 if(tex){const cmds=new Set([...line.matchAll(/\\([a-zA-Z]+)/g)].map(m=>m[1]).filter(c=>c!=='text'));if(ls.some(n=>n.t==='text'&&cmds.has(n.v)))return 'unknown-tex';}
 return '';
}

// ------------------------------------------------------------------ specs used below
const D={shape:'derivative',f:'x^3 + x^2'};
const DA={shape:'derivative-at',f:'x^3 + x^2',at:2};
const EV={shape:'evaluate',f:'x^2 + 1',at:3};
const EVS={shape:'evaluate',f:'sin(x)',at:'pi/4'};
const AD={shape:'antiderivative',f:'x'};
const DI={shape:'definite-integral',f:'x^2',a:0,b:1};
const LS={shape:'limit',f:'sin(x)/x',at:0};
const LI={shape:'limit',f:'1/x^2',at:0};
const CP={shape:'critical-point',f:'x^2 - 4x + 1',on:[0,5]};
const EX={shape:'extremum',f:'x^3 - 12x',on:[-3,0],kind:'max'};
const NW={shape:'newton-step',f:'x^2 - 2',x0:1,steps:1};

/** [spec, the learner's answer, verdict, slip] - every shape, right / wrong / unsure / rounding / sign / lost-constant. */
const CHECKS=[
 [D,'3x^2 + 2x','right'],[D,'2x + 3x^2','right'],[D,"f'(x) = 3x^2 + 2x",'right'],[D,'x(3x + 2)','right'],[D,'3x² + 2x','right'],
 [D,'-3x^2 - 2x','wrong','sign'],[D,'3x^2 + x','wrong'],[D,'3x^2','wrong'],[D,'','unsure'],[D,'banana','unsure'],[D,'3x^2 + 2x + C','wrong'],
 [{shape:'derivative',f:'sin(3x)'},'3cos(3x)','right'],[{shape:'derivative',f:'sin(3x)'},'cos(3x)','wrong'],[{shape:'derivative',f:'sin(3x)'},'-3cos(3x)','wrong','sign'],
 [{shape:'derivative',f:'e^(2x)'},'2e^(2x)','right'],[{shape:'derivative',f:'e^(2x)'},'2e²ˣ','right'],[{shape:'derivative',f:'e^(2x)'},'e^(2x)','wrong'],
 [{shape:'derivative',f:'ln(x)/x'},'(1 - ln(x))/x^2','right'],[{shape:'derivative',f:'cbrt(1 + x^2)'},'2x/(3(1 + x^2)^(2/3))','right'],
 [{shape:'derivative',f:'x^2 e^x sin(x)'},'2x e^x sin(x) + x^2 e^x sin(x) + x^2 e^x cos(x)','right'],[{shape:'derivative',f:'(x^2 + 1)/(x - 1)'},'(x^2 - 2x - 1)/(x - 1)^2','right'],
 [{shape:'derivative',f:'(x^2 + 1)/(x - 1)'},'(-x^2 + 2x + 1)/(x - 1)^2','wrong','sign'],
 [DA,'16','right'],[DA,'16.0','right'],[DA,'-16','wrong','sign'],[DA,'15','wrong'],[DA,'16.001','unsure'],[DA,'x','unsure'],[DA,'1/0','unsure'],[DA,'x = 16','right'],
 [{shape:'derivative-at',f:'sin(x)',at:'pi/3'},'1/2','right'],[{shape:'derivative-at',f:'sin(x)',at:'pi/3'},'0.5','right'],[{shape:'derivative-at',f:'sin(x)',at:'pi/3'},'sqrt(3)/2','wrong'],
 [EV,'10','right'],[EV,'-10','wrong','sign'],[EV,'9','wrong'],[EV,'ten','unsure'],[EV,'  10  ','right'],
 [EVS,'sqrt(2)/2','right'],[EVS,'1/sqrt(2)','right'],[EVS,'√2/2','right'],[EVS,'0.7071','unsure'],[EVS,'-sqrt(2)/2','wrong','sign'],
 [AD,'x^2/2 + C','right'],[AD,'x^2/2','wrong','lost-constant'],[AD,'0.5x^2 + c','right'],[AD,'-x^2/2 + C','wrong','sign'],[AD,'x^2 + C','wrong'],[AD,'x^2/2 + 5','wrong','lost-constant'],
 [AD,'','unsure'],[AD,"F(x) = x^2/2 + C",'right'],[AD,'x^2/2 +','unsure'],
 [{shape:'antiderivative',f:'3x^2 - 4/x'},'x^3 - 4ln(x) + C','unsure'],[{shape:'antiderivative',f:'3x^2 - 4/x'},'x^3 - 4ln|x| + C','right'],[{shape:'antiderivative',f:'3x^2 - 4/x'},'x^3 - 4 ln(x)','wrong','lost-constant'],
 [{shape:'antiderivative',f:'cos(x)'},'sin(x) + C','right'],[{shape:'antiderivative',f:'cos(x)'},'-sin(x) + C','wrong','sign'],[{shape:'antiderivative',f:'cos(x)'},'sin x','wrong','lost-constant'],
 [{shape:'antiderivative',f:'2x (x^2 + 1)^3'},'(x^2 + 1)^4/4 + C','right'],[{shape:'antiderivative',f:'2x (x^2 + 1)^3'},'(x^2 + 1)^4 + C','wrong'],
 // [DI,'0.3']: OLD wrong -> NEW unsure (D2 R1a: 0.3 is 1/3 correctly rounded, one significant figure)
 [DI,'1/3','right'],[DI,'0.333','right'],[DI,'0.3','unsure'],[DI,'-1/3','wrong','sign'],[DI,'1/2','wrong'],[DI,'','unsure'],
 [{shape:'definite-integral',f:'2x + 1/sqrt(x)',a:1,b:4},'17','right'],[{shape:'definite-integral',f:'sin(x)',a:0,b:'pi'},'2','right'],
 [{shape:'definite-integral',f:'sin(x)',a:0,b:'pi'},'-2','wrong','sign'],[{shape:'definite-integral',f:'x^2',a:1,b:0},'-1/3','right'],
 [LS,'1','right'],[LS,'0','wrong'],[LS,'-1','wrong','sign'],[LS,'inf','wrong'],[LS,'dne','wrong'],[LS,'1.0','right'],
 [{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},'4','right'],[{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},'4.00','right'],
 [LI,'inf','right'],[LI,'infinity','right'],[LI,'∞','right'],[LI,'+∞','right'],[LI,'-inf','wrong','sign'],[LI,'100000','wrong'],[LI,'Infinity','right'],
 [{shape:'limit',f:'1/x',at:0,side:'-'},'-infinity','right'],[{shape:'limit',f:'1/x',at:0,side:'-'},'infinity','wrong','sign'],
 [{shape:'limit',f:'(1 + 1/x)^x',at:'inf'},'e','right'],[{shape:'limit',f:'(1 + 1/x)^x',at:'inf'},'2.718','right'],[{shape:'limit',f:'(1 + 1/x)^x',at:'inf'},'2.7','right'],
 [{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'},'3/2','right'],[{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'},'1.5','right'],
 [{shape:'limit',f:'(e^x - 1 - x)/x^2',at:0},'1/2','right'],[{shape:'limit',f:'(sqrt(x + 1) - 2)/(x - 3)',at:3},'1/4','right'],
 [CP,'2','right'],[CP,'x = 2','right'],[CP,'-2','wrong','sign'],[CP,'3','wrong'],[CP,'2.0001','unsure'],
 [{shape:'critical-point',f:'x^3 - 12x',on:[0,5]},'2','right'],
 [EX,'16','right'],[EX,'-16','wrong','sign'],[EX,'-2','wrong'],[{shape:'extremum',f:'x(20 - x)',on:[0,20],kind:'max'},'100','right'],
 [{shape:'extremum',f:'x^2 - 4x + 1',on:[0,5],kind:'min'},'-3','right'],[{shape:'extremum',f:'x^2 - 4x + 1',on:[0,5],kind:'min'},'3','wrong','sign'],
 [NW,'3/2','right'],[NW,'1.5','right'],[NW,'1.4','wrong'],[NW,'-3/2','wrong','sign'],[NW,'1.41421','wrong'],
 [{shape:'newton-step',f:'x^3 - x - 1',x0:1,steps:2},'1.3478','right'],[{shape:'newton-step',f:'x^3 - x - 1',x0:1,steps:2},'31/23','right'],
 [{shape:'derivative',f:'y + 1'},'1','unsure'],[{shape:'limit',f:'|x|/x',at:0},'0','unsure'],
];

test('1: checkAnswer - every shape, right / wrong / unsure / rounding / sign / lost-constant, the why never carries a value',()=>{
 assert.ok(CHECKS.length>=90,`at least 90 checked cases (${CHECKS.length})`);
 const bad=[];
 for(const [spec,ans,verdict,slip] of CHECKS){
  const r=C.checkAnswer(spec,ans);
  if(!r||r.verdict!==verdict||(r.slip??undefined)!==slip)bad.push(`${spec.shape} ${spec.f} :: ${JSON.stringify(ans)} -> ${JSON.stringify(r)} (want ${verdict}${slip?' '+slip:''})`);
  else if(typeof r.why!=='string'||!r.why||/\d/.test(r.why))bad.push(`why carries a value or is empty: ${JSON.stringify(r)}`);
 }
 assert.deepEqual(bad,[]);
 const shapes=new Set(CHECKS.map(c=>c[0].shape));
 for(const s of C.CALC_SHAPES)assert.ok(shapes.has(s),`checked: ${s}`);
});

test('2: tolerances are named per shape - exact 1e-6, newton and rounded integrals and limits 5e-3',()=>{
 assert.equal(C.TOLERANCE['derivative-at'].exact,1e-6);assert.equal(C.TOLERANCE.evaluate.exact,1e-6);
 assert.equal(C.TOLERANCE['newton-step'].exact,5e-3);assert.equal(C.TOLERANCE['newton-step'].rounded,5e-3);
 assert.equal(C.TOLERANCE['definite-integral'].rounded,5e-3);assert.equal(C.TOLERANCE.limit.rounded,5e-3);
 assert.equal(C.TOLERANCE['critical-point'].rounded,1e-6,'an exact shape is not loosened for a decimal');
});

/** [spec, ok, why-fragment] */
const WELL=[
 [D,true],[DA,true],[EV,true],[EVS,true],[AD,true],[DI,true],[LS,true],[LI,true],[CP,true],[EX,true],[NW,true],
 [{shape:'limit',f:'(1 + 1/x)^x',at:'inf'},true],[{shape:'limit',f:'1/x',at:0,side:'+'},true],
 [{shape:'definite-integral',f:'x^3',a:-1,b:1,zero:true},true],
 [{shape:'derivative',f:'sin(x)^2 + cos(x)^2'},false,'zero'],
 [{shape:'derivative',f:'x - x'},false,'zero'],
 [{shape:'limit',f:'|x|/x',at:0},false,'exist'],
 [{shape:'limit',f:'sin(1/x)',at:0},false,'exist'],
 [{shape:'limit',f:'1/x',at:0},false,'exist'],
 [{shape:'critical-point',f:'x^3 - 3x',on:[-2,2]},false,'unique'],
 [{shape:'critical-point',f:'x^2 + 1',on:[1,3]},false,'unique'],
 [{shape:'extremum',f:'x^3 - 12x',on:[-3,5],kind:'max'},false,'endpoint'],
 [{shape:'extremum',f:'x^2',on:[1,3],kind:'min'},false,'endpoint'],
 [{shape:'definite-integral',f:'x^3',a:-1,b:1},false,'zero'],
 [{shape:'definite-integral',f:'x^2',a:0,b:1,zero:true},false,'zero'],
 [{shape:'definite-integral',f:'x',a:2,b:2},false,'interval'],
 [{shape:'definite-integral',f:'1/x',a:-1,b:1},false,'finite'],
 [{shape:'derivative-at',f:'|x|',at:0},false,'finite'],
 [{shape:'evaluate',f:'ln(x)',at:-1},false,'finite'],
 [{shape:'derivative',f:'y^2'},false,'read'],
 [{shape:'derivative',f:'3'},false,'x'],
 [{shape:'antiderivative',f:'x + C'},false,'constant'],
 [{shape:'newton-step',f:'x^2 - 2',x0:1,steps:2},false,'next'],
 [{shape:'newton-step',f:'x^2 - 2',x0:0,steps:1},false,'finite'],
 [{shape:'newton-step',f:'x^2 - 2',x0:1,steps:0},false,'steps'],
 [{shape:'newton-step',f:'x^2 - 2',x0:1,steps:1.5},false,'steps'],
 [{shape:'limit',f:'1/x',at:'inf',side:'+'},false,'side'],
 [{shape:'evaluate',f:'x',at:'pi/0'},false,'number'],
 [{shape:'derivative',f:'x',answer:'1'},false,'answer'],
 [{shape:'tangent-line',f:'x'},false,'shape'],
 [null,false,'shape'],
];

test('3: wellFormed accepts a spec with a finite, non-degenerate truth and rejects the degenerate ones, naming why',()=>{
 const bad=[];
 for(const [spec,ok,frag] of WELL){
  const r=C.wellFormed(spec);
  if(!r||r.ok!==ok)bad.push(`${JSON.stringify(spec)} -> ${JSON.stringify(r)} (want ${ok})`);
  else if(!ok&&(!r.why||!r.why.toLowerCase().includes(frag)))bad.push(`${JSON.stringify(spec)} why "${r.why}" lacks "${frag}"`);
  else if(!ok&&/\d/.test(r.why))bad.push(`why carries a value: ${r.why}`);
 }
 assert.deepEqual(bad,[]);
});

test('4: question() prints every shape in the typesetter\'s notation, and every form typesets with nothing dropped',()=>{
 const want=[
  [{shape:'derivative',f:'3x^2 + 2x'},'Differentiate f(x) = 3x^2 + 2x.','\\text{Differentiate } f(x) = 3x^{2} + 2x.'],
  [{shape:'limit',f:'sin(3x)/x',at:0},'Find lim_(x->0) sin(3x)/x.','\\text{Find } \\lim_{x \\to 0} \\frac{\\sin(3x)}{x}.'],
  [{shape:'definite-integral',f:'2x',a:0,b:3},'Evaluate int_0^3 2x dx.','\\text{Evaluate } \\int_{0}^{3} 2x\\,dx.'],
  [{shape:'critical-point',f:'x^2 - 4x + 1',on:[0,5]},'Find the critical point of f(x) = x^2 - 4x + 1 on [0, 5].','\\text{Find the critical point of } f(x) = x^{2} - 4x + 1 \\text{ on } [0, 5].'],
  [EV,'Find f(3) for f(x) = x^2 + 1.',null],[DA,"Find f'(2) for f(x) = x^3 + x^2.",null],[AD,'Find int x dx.',null],
  [{shape:'antiderivative',f:'3x^2 - 4/x'},'Find int (3x^2 - 4/x) dx.',null],
  [{shape:'limit',f:'1/x',at:0,side:'+'},'Find lim_(x->0+) 1/x.','\\text{Find } \\lim_{x \\to 0^+} \\frac{1}{x}.'],
  [{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'},'Find lim_(x->infinity) (3x^2 - x)/(2x^2 + 5).',null],
  [{shape:'limit',f:'e^x - 1 - x',at:'-inf'},'Find lim_(x->-infinity) (e^x - 1 - x).',null],
  [{shape:'definite-integral',f:'sin(x)',a:0,b:'pi/2'},'Evaluate int_0^(pi/2) sin(x) dx.',null],
  [{shape:'definite-integral',f:'x^2 + 1',a:-1,b:2},'Evaluate int_(-1)^2 (x^2 + 1) dx.',null],
  [EX,'Find the maximum value of f(x) = x^3 - 12x on [-3, 0].',null],
  [NW,"Use Newton's method on x^2 - 2 = 0 with x_1 = 1 to find x_2.","\\text{Use Newton's method on } x^{2} - 2 = 0 \\text{ with } x_1 = 1 \\text{ to find } x_{2}."],
 ];
 const bad=[];
 for(const [spec,plain,tex] of want){
  const q=C.question(spec);
  if(!q){bad.push(`no question: ${JSON.stringify(spec)}`);continue;}
  if(q.plain!==plain)bad.push(`plain: ${q.plain} (want ${plain})`);
  if(tex&&q.tex!==tex)bad.push(`tex: ${q.tex} (want ${tex})`);
  const fp=typesetFault(q.plain,false),ft=typesetFault(q.tex,true);
  if(fp)bad.push(`plain ${q.plain}: ${fp}`);if(ft)bad.push(`tex ${q.tex}: ${ft}`);
 }
 assert.deepEqual(bad,[]);
 assert.equal(C.question({shape:'derivative',f:'y + 1'}),null,'an unreadable spec prints nothing');
 const shapes=new Set(want.map(w=>w[0].shape));for(const s of C.CALC_SHAPES)assert.ok(shapes.has(s),`printed: ${s}`);
});

/** [spec, line, leaks] - the brief's pinned guards, then more lines. */
const LEAKS=[
 [D,'Use the power rule',false],[D,'multiply by the derivative of the inside',false],[D,'it comes to 3x^2 + 2x',true],
 [AD,'x^2/2 + C',true],[AD,'x^2/2',true],[LS,'the limit is 1',true],[LI,'the limit is infinity',true],
 [D,'Differentiate x^3 + x^2 term by term.',false],[LS,'Look again at lim_(x->0) sin(x)/x.',false],
 [D,'the answer is 2x + 3x^2',true],[D,"f'(x) = x(3x + 2)",true],[D,'Bring each power down and lower it by one.',false],
 [AD,'Raise the power by one and divide by the new power.',false],[AD,'Remember the + C at the end.',false],[AD,'It is 0.5x^2 + C.',true],
 [LS,'the limit is one',true],[LS,'Compare sin(x) with x when x is small.',false],[LS,'It tends to 1.',true],[LS,'about 0.99',false],[LS,'0.9999',true],
 [LI,'it blows up to ∞',true],[LI,'look at the sign of x^2 near 0',false],[LI,'the limit is 0',false],
 [{shape:'definite-integral',f:'2x',a:0,b:3},'the area is 9',true],[{shape:'definite-integral',f:'2x',a:0,b:3},'nine square units',true],
 [{shape:'definite-integral',f:'2x',a:0,b:3},'x^2 from 0 to 3',false],[{shape:'definite-integral',f:'2x',a:0,b:3},'it is 3^2',true],
 [{shape:'definite-integral',f:'2x',a:0,b:3},'Evaluate int_0^3 2x dx.',false],
 [EVS,'sqrt(2)/2',true],[EVS,'It is 1/sqrt(2).',true],[EVS,'about 0.707',true],[EVS,'the sine of 45 degrees',false],
 [CP,'set the derivative to zero',false],[CP,'x = 2',true],[CP,'only look on [0, 5]',false],[CP,'x=2',true],
 [NW,'x_2 = 3/2',true],[NW,'start from x_1 = 1',false],[NW,'one and a half',true],
 [{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},'as x approaches 2, factor the top',false],[{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},'x + 2 at 2 gives 4',true],
 [{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},'lim_(x->2) (x + 2)',false],
 [EX,'f(-2) = 16',true],[EX,'check f at -3, -2 and 0',false],[EX,'sixteen',true],[EX,'minus sixteen',true],
 [{shape:'derivative',f:'e^x'},'e^x',true],[DA,'the slope there is 16',true],[DA,'put x = 2 into the derivative',false],
 [D,'',false],[D,null,false],[{shape:'derivative',f:'y'},'y',false],
];

test('5: leaksCalc - the brief\'s guards and more: numbers, spoken numbers, function windows, infinity; the question quoted back never leaks',()=>{
 assert.ok(LEAKS.length>=27);
 const bad=LEAKS.filter(([spec,line,want])=>C.leaksCalc(spec,line)!==want).map(([spec,line,want])=>`${spec.shape} ${spec.f}: ${JSON.stringify(line)} should ${want?'':'not '}leak`);
 assert.deepEqual(bad,[]);
});

test('6: the slip vocabulary - at least 12 ids, the named ones, no value in any line, slipsFor names only known ids',()=>{
 const ids=C.CALC_SLIPS.map(s=>s.id);
 assert.ok(ids.length>=12);assert.equal(new Set(ids).size,ids.length,'ids are unique');
 for(const id of ['lost-constant','sign','forgot-chain','product-as-product','quotient-order','power-off-by-one','wrong-trig-sign','lost-inner-factor','limit-substituted-early','bounds-swapped','forgot-second-derivative-check','decimal-newton-slip'])assert.ok(ids.includes(id),id);
 for(const s of C.CALC_SLIPS){for(const k of ['id','name','says','points'])assert.ok(typeof s[k]==='string'&&s[k].length,`${s.id}.${k}`);assert.ok(!/\d/.test(s.says+s.points+s.name),`${s.id} carries no value`);}
 for(const shape of C.CALC_SHAPES){const l=C.slipsFor(shape);assert.ok(Array.isArray(l)&&l.length>=2,shape);for(const id of l)assert.ok(ids.includes(id),`${shape}: ${id}`);}
 assert.ok(C.slipsFor('antiderivative').includes('lost-constant'));assert.ok(!C.slipsFor('limit').includes('lost-constant'));
 assert.ok(C.slipsFor('newton-step').includes('decimal-newton-slip'));assert.ok(C.slipsFor('definite-integral').includes('bounds-swapped'));
 assert.deepEqual(C.slipsFor('nonsense'),[]);
 // every slip checkAnswer sets is in its shape's list
 for(const [spec,,,slip] of CHECKS)if(slip)assert.ok(C.slipsFor(spec.shape).includes(slip),`${spec.shape} may carry ${slip}`);
});

/**
 * The sweep: for every CALCULUS_1 topic, a spec of a shape that topic uses (the topic's own example, reshaped where
 * the example is not a shape - a composition is evaluated, a related rate is a derivative at a point). Each passes
 * wellFormed, its question typesets in both forms, and the question quoted back does not leak its own answer.
 */
const SWEEP={
 'calc1-functions':{shape:'evaluate',f:'(sqrt(x - 3))^2 + 1',at:7},
 'calc1-trig':{shape:'evaluate',f:'2sin(x) - 1',at:'pi/6'},
 'calc1-exp-log':{shape:'evaluate',f:'e^(2x)',at:'ln(7)/2'},
 'calc1-limit-idea':{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},
 'calc1-limit-laws':{shape:'limit',f:'(sqrt(x + 1) - 2)/(x - 3)',at:3},
 'calc1-continuity':{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'},
 'calc1-derivative':{shape:'derivative',f:'x^2 + 3x'},
 'calc1-rules':{shape:'derivative',f:'(x^2 + 1)/(x - 1)'},
 'calc1-trig-derivatives':{shape:'derivative',f:'x^2 e^x sin(x)'},
 'calc1-chain':{shape:'derivative',f:'cbrt(1 + x^2)'},
 'calc1-log-derivative':{shape:'derivative',f:'ln(x)/x'},
 'calc1-related-rates':{shape:'derivative-at',f:'(4/3) pi x^3',at:5},
 'calc1-extrema':{shape:'extremum',f:'x^3 - 12x',on:[-3,0],kind:'max'},
 'calc1-shape':{shape:'limit',f:'(e^x - 1 - x)/x^2',at:0},
 'calc1-optimisation':{shape:'critical-point',f:'20x - x^2',on:[0,20]},
 'calc1-newton':{shape:'newton-step',f:'x^2 - 2',x0:1,steps:1},
 'calc1-antiderivatives':{shape:'antiderivative',f:'3x^2 - 4/x'},
 'calc1-definite-integral':{shape:'definite-integral',f:'x^2',a:0,b:2},
 'calc1-area-so-far':{shape:'definite-integral',f:'x^2 + 1',a:0,b:3},
 'calc1-ftc':{shape:'definite-integral',f:'2x + 1/sqrt(x)',a:1,b:4},
 'calc1-substitution':{shape:'definite-integral',f:'2x (x^2 + 1)^3',a:0,b:1},
 'calc1-area-average':{shape:'definite-integral',f:'x - x^2',a:0,b:1},
};

test('7: the sweep - every Calculus 1 topic has a well-formed spec whose question typesets and does not leak',()=>{
 const bad=[];
 for(const t of CALCULUS_1.topics){
  const spec=SWEEP[t.id];
  if(!spec){bad.push(`${t.id}: no spec`);continue;}
  const w=C.wellFormed(spec);if(!w.ok)bad.push(`${t.id}: ${w.why}`);
  const q=C.question(spec);if(!q){bad.push(`${t.id}: no question`);continue;}
  const fp=typesetFault(q.plain,false),ft=typesetFault(q.tex,true);
  if(fp)bad.push(`${t.id} plain ${q.plain}: ${fp}`);if(ft)bad.push(`${t.id} tex ${q.tex}: ${ft}`);
  if(C.leaksCalc(spec,q.plain))bad.push(`${t.id}: the question leaks its own answer: ${q.plain}`);
 }
 assert.deepEqual(bad,[]);
 assert.deepEqual(Object.keys(SWEEP).filter(k=>!CALCULUS_1.topics.some(t=>t.id===k)),[],'no stale topic ids');
});

test('8: a spec carries no answer, and the checks are fast enough for a request handler',()=>{
 assert.equal(C.wellFormed({...D,answer:'3x^2 + 2x'}).ok,false,'an answer field is refused');
 let worst=0,what='';
 const time=(label,fn)=>{let best=Infinity;for(let k=0;k<3;k++){const t=process.hrtime.bigint();fn();best=Math.min(best,Number(process.hrtime.bigint()-t)/1e6);}if(best>worst){worst=best;what=label;}};
 for(const [spec,ans] of CHECKS)time(`check ${spec.shape} ${ans}`,()=>C.checkAnswer(spec,ans));
 for(const spec of Object.values(SWEEP))time(`well ${spec.shape} ${spec.f}`,()=>C.wellFormed(spec));
 const long='Think about it: '+Array.from({length:40},(_,i)=>`step ${i} uses x^2 + ${i}x and sin(x)`).join(', ');
 for(const spec of [D,AD,LS,DI,CP])time(`leak ${spec.shape} (long line)`,()=>C.leaksCalc(spec,long));
 console.log(`# slowest check: ${worst.toFixed(2)} ms (${what}), least of three timings`);
 assert.ok(worst<50,`${what}: ${worst} ms`);
});

/**
 * Never throws (property): rules/calc promises a malformed spec is a null, an 'unsure' or a refusal - never a 500. Specs
 * reach it from a model (items.ts), from a session file (PracticeItem.spec after a restart) and from a page reader, so
 * every public function is fed junk: non-objects, each shape with each field removed and each field replaced by junk,
 * bad intervals, type swaps, extra keys, and 3000 seeded random mutations of valid specs. No call throws, each returns
 * within 50 ms (least of three timings when the first is slow), and a spec malformed by construction is refused by
 * wellFormed with a why, printed by question as null, judged 'unsure' by checkAnswer and never leaks.
 */
test('9: never throws - every public function on malformed and randomly mutated specs (property, 3000 mutations)',()=>{
 const util=require('node:util');
 const show=(v)=>util.inspect(v,{maxStringLength:40,maxArrayLength:6,depth:4,breakLength:Infinity});
 const BIG='x'.repeat(10000),HUGE=1e308;
 const BASES=[EV,D,DA,AD,DI,LS,{shape:'limit',f:'(3x^2 - x)/(2x^2 + 5)',at:'inf'},CP,EX,NW];
 const NUM_FIELDS=new Set(['at','a','b','x0']);
 const JUNK=[null,undefined,NaN,Infinity,-Infinity,{},{a:1},BIG,[[1,[2,[3]]]],[],true];
 const ANSWERS=['1','','x^2 + C','inf',BIG,null,5];
 const LINES=['the answer is 1','x^2','it goes to infinity','',null,BIG];
 const failures=[];
 let calls=0,slowest=0,slowWhat='';
 /** Call fn; record a throw (with the input) or a call slower than 50 ms (least of three), else return its value. */
 const call=(name,args,fn)=>{
  calls++;
  let out,best=Infinity;
  for(let k=0;k<3;k++){
   const t=process.hrtime.bigint();
   try{out=fn();}catch(e){failures.push(`${name}(${args.map(show).join(', ')}) threw ${e&&e.constructor&&e.constructor.name}: ${e&&e.message}`);return {threw:true};}
   best=Math.min(best,Number(process.hrtime.bigint()-t)/1e6);
   if(best<=50)break;
  }
  if(best>slowest){slowest=best;slowWhat=`${name}(${show(args[0])})`;}
  if(best>50)failures.push(`${name}(${args.map(show).join(', ')}) took ${best.toFixed(1)} ms`);
  return {out};
 };
 /** Every public function on one input; `malformed` asserts the refusals, otherwise only the invariants. */
 const probe=(spec,malformed,label,lite)=>{
  const w=call('wellFormed',[spec],()=>C.wellFormed(spec));
  const q=call('question',[spec],()=>C.question(spec));
  const answers=lite?['1','x^2 + C']:ANSWERS,lines=lite?['the answer is 1']:LINES;
  const verdicts=answers.map(a=>call('checkAnswer',[spec,a],()=>C.checkAnswer(spec,a)));
  const leaks=lines.map(l=>call('leaksCalc',[spec,l],()=>C.leaksCalc(spec,l)));
  call('specFromQuestion',[spec],()=>C.specFromQuestion(spec));
  const wh=call('withheldCalc',[spec],()=>C.withheldCalc(spec));
  const shape=spec&&typeof spec==='object'?spec.shape:spec;
  const sl=call('slipsFor',[shape],()=>C.slipsFor(shape));
  if(w.threw)return;
  const ok=w.out&&w.out.ok===true;
  if(!ok&&!(w.out&&w.out.ok===false&&typeof w.out.why==='string'&&w.out.why))failures.push(`${label}: wellFormed(${show(spec)}) -> ${show(w.out)}, not {ok:false, why}`);
  if(malformed&&ok)failures.push(`${label}: wellFormed(${show(spec)}) accepted a malformed spec`);
  if(!wh.threw&&(typeof wh.out!=='string'||!wh.out))failures.push(`${label}: withheldCalc(${show(spec)}) -> ${show(wh.out)}`);
  if(!sl.threw&&!Array.isArray(sl.out))failures.push(`${label}: slipsFor(${show(shape)}) -> ${show(sl.out)}`);
  if(ok){
   if(!q.threw&&!(q.out&&typeof q.out.plain==='string'&&typeof q.out.tex==='string'))failures.push(`${label}: question(${show(spec)}) of a well-formed spec -> ${show(q.out)}`);
   else if(!q.threw&&!lite){const back=call('specFromQuestion',[q.out.plain],()=>C.specFromQuestion(q.out.plain));if(!back.threw&&back.out!==null&&!C.wellFormed(back.out).ok)failures.push(`${label}: specFromQuestion read back a spec wellFormed refuses: ${show(back.out)}`);}
   return;
  }
  // malformed by construction prints nothing; a refused mutation may be merely degenerate (it still prints), never junk
  if(!q.threw&&malformed&&q.out!==null)failures.push(`${label}: question(${show(spec)}) of a malformed spec -> ${show(q.out)}, want null`);
  if(!q.threw&&q.out!==null&&!(typeof q.out.plain==='string'&&typeof q.out.tex==='string'&&!/undefined|NaN|\[object|Infinity|null/.test(q.out.plain+q.out.tex)))failures.push(`${label}: question(${show(spec)}) printed junk: ${show(q.out)}`);
  verdicts.forEach((v,i)=>{if(!v.threw&&!(v.out&&v.out.verdict==='unsure'))failures.push(`${label}: checkAnswer(${show(spec)}, ${show(answers[i])}) -> ${show(v.out)}, want unsure`);});
  leaks.forEach((l,i)=>{if(!l.threw&&l.out!==false)failures.push(`${label}: leaksCalc(${show(spec)}, ${show(lines[i])}) -> ${show(l.out)}, want false`);});
 };
 // non-objects and empty containers
 for(const v of [null,undefined,0,42,NaN,Infinity,HUGE,'derivative','x^2',BIG,[],[D],[[1,[2]]],true,{},()=>1])probe(v,true,'non-spec');
 // per shape: each field removed, each field replaced by junk, type swaps, answer keys
 let built=0;
 for(const base of BASES){
  probe(base,false,'base');
  for(const k of Object.keys(base)){
   const {[k]:_,...rest}=base;void _;probe(rest,true,`${base.shape} without ${k}`);built++;
   for(const j of JUNK){probe({...base,[k]:j},true,`${base.shape}.${k}=junk`);built++;}
   // a huge number: malformed where a number does not belong; where one does, only the invariants hold
   probe({...base,[k]:HUGE},!NUM_FIELDS.has(k),`${base.shape}.${k}=huge`);built++;
   // a string where a number belongs, a number where a string belongs
   probe({...base,[k]:NUM_FIELDS.has(k)||k==='steps'?'three':7},true,`${base.shape}.${k} type-swapped`);built++;
  }
  for(const k of ['answer','truth','solution','value']){probe({...base,[k]:'1'},true,`${base.shape} with ${k}`);built++;}
  // extra unknown keys change nothing
  const extra={...base,difficulty:'easy',foo:{bar:[1]},note:BIG};
  probe(extra,false,`${base.shape} with extra keys`);built++;
  assert.deepEqual(C.wellFormed(extra),C.wellFormed(base),`${base.shape}: extra keys change nothing`);
  if(Array.isArray(base.on)){
   const [a,b]=base.on;
   for(const on of [[],[a],[a,b,b+1],[b,a],[a,a],[a,'banana'],['banana',b],[a,[b]],[{},b],[a,null],[a,NaN],[a,Infinity],[BIG,b]]){probe({...base,on},true,`${base.shape}.on=${show(on)}`);built++;}
   for(const on of [{0:a,1:b,length:2},`${a},${b}`]){probe({...base,on},true,`${base.shape}.on not an array`);built++;}
  }
 }
 // 3000 seeded random mutations of valid specs: the invariants only (a mutation may happen to be valid)
 let seed=20260929;
 const rnd=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
 const pick=(a)=>a[Math.floor(rnd()*a.length)];
 const POOL=[0,1,-1,2,3,0.5,-2.5,5,10,1e6,-1e6,HUGE,-HUGE,1e-300,NaN,Infinity,null,undefined,'pi','pi/4','2','-1','ln(2)','x','x^2','inf','-inf','+','-','max','min','banana','',BIG,[],[0,5],[5,0],[0],[0,1,2],['pi',4],{},true,'sin(x)','1/x','x^3 - 12x','e^x',...C.CALC_SHAPES];
 const KEYS=['shape','f','at','a','b','on','kind','x0','steps','side','zero'];
 let valid=0;
 for(let n=0;n<3000;n++){
  const s=structuredClone(pick(BASES));
  for(let m=1+Math.floor(rnd()*3);m>0;m--){
   const op=rnd();
   if(op<0.2){const ks=Object.keys(s);if(ks.length)delete s[pick(ks)];}
   else if(op<0.6)s[pick(KEYS)]=pick(POOL);
   else if(op<0.75)s.shape=pick(C.CALC_SHAPES);
   else if(op<0.85&&Array.isArray(s.on)){const o=rnd();s.on=o<0.3?s.on.slice().reverse():o<0.6?s.on.slice(0,Math.floor(rnd()*2)):[...s.on,pick(POOL)];}
   else if(op<0.95){const ks=Object.keys(s).filter(k=>k!=='shape');if(ks.length>1){const x=pick(ks),y=pick(ks);[s[x],s[y]]=[s[y],s[x]];}}
   else s[pick(['foo','difficulty','zero','side'])]=pick(POOL);
  }
  if(C.wellFormed(s).ok)valid++;
  probe(s,false,`mutation ${n}`,true);
 }
 console.log(`# never-throws: ${calls} calls, ${built} constructed malformed specs, 3000 mutations (${valid} still valid), slowest ${slowest.toFixed(2)} ms (${slowWhat})`);
 // throws first: they are the 500s
 failures.sort((p,q)=>Number(q.includes(') threw '))-Number(p.includes(') threw ')));
 if(failures.length)console.log(`# ${failures.filter(f=>f.includes(') threw ')).length} throws, ${failures.length} failures in all`);
 if(failures.length)console.log(failures.slice(0,15).map(f=>`# FAIL ${f}`).join('\n'));
 assert.deepEqual(failures.slice(0,15),[],`${failures.length} failures`);
});

// ------------------------------------------------------------------ MB-B16, the Calculus half: two factors, or a product split across words
test('MB-B16 leaksCalc: a line naming both factors of the answer, or the answer as a product split across words, leaks; one factor alone passes',()=>{
 const CH={shape:'derivative',f:'sin(x^2)'};                 // cos(x^2) * 2x
 const SUBST={shape:'antiderivative',f:'x e^(x^2)'};         // (1/2)e^(x^2) + C
 const rows=[
  [CH,'Differentiate the outside to get cos(x^2), then multiply by 2x, the derivative of the inside.',true],
  [CH,'Multiply cos(x^2) by 2x.',true],
  [SUBST,'Substitute u = x^2 … = (1/2)e^u + C.',true],
  [CH,'Use the chain rule: differentiate the outside, then multiply by the derivative of the inside.',false],
  [CH,'The inside function is x^2.',false],
  [CH,'The outer derivative is cos(x^2).',false],
  [CH,'The derivative of the inside is 2x.',false],
  [SUBST,'Let u = x^2, then du = 2x dx.',false],
  [SUBST,'Substitute u = x^2.',false],
  [SUBST,'Try a substitution for the inside of the exponent.',false],
 ];
 const bad=rows.filter(([s,l,want])=>C.leaksCalc(s,l)!==want).map(([s,l,want])=>`${s.f}: ${l} should ${want?'':'not '}leak`);
 assert.deepEqual(bad,[]);
});

// ------------------------------------------------------------------ HL3: a function-shape answer said in words
test('HL3 leaksCalc: the derivative of x^3 + x^2 said in words leaks; the item\'s own function said in words passes',()=>{
 const rows=[
  [D,'three x squared plus two x',true],
  [D,'The derivative is three x squared plus two x.',true],
  [D,'It is 3 x to the power of 2 plus 2 x.',true],
  [D,'x cubed plus x squared',false],
  [D,'Differentiate x cubed plus x squared term by term.',false],
  [D,'Bring each power down and lower it by one.',false],
  [{shape:'derivative',f:'x^2'},'two times x',true],
  [{shape:'derivative',f:'x^2'},'x squared is the function you start from',false],
 ];
 const bad=rows.filter(([s,l,want])=>C.leaksCalc(s,l)!==want).map(([s,l,want])=>`${s.f}: ${l} should ${want?'':'not '}leak`);
 assert.deepEqual(bad,[]);
});

test('D2-1 (R1a): a correct rounding of a limit or an integral at its own decimals is never wrong - right with two significant figures, not sure with fewer',()=>{
 const lim=(f)=>({shape:'limit',f,at:0}),v=(spec,a)=>C.checkAnswer(spec,a);
 const L38=lim('3/8 + x'),L13=lim('1/3 + x'),L32=lim('1/32 + x'),LE={shape:'limit',f:'(1 + 1/x)^x',at:'inf'},L3={shape:'limit',f:'sin(3x)/x',at:0};
 const I38={shape:'definite-integral',f:'3x/4',a:0,b:1};
 // must-address 2: the halfway 3/8 rounded at two places is right, as a limit and as an integral
 for(const spec of [L38,I38])for(const a of ['0.38','0.37','0.375','0.3750'])assert.equal(v(spec,a).verdict,'right',`3/8: ${a}`);
 for(const a of ['2.7','2.72','2.718'])assert.equal(v(LE,a).verdict,'right',`e: ${a}`);
 assert.equal(v(L3,'3.0').verdict,'right');
 // fewer than two significant figures: not sure, with the rounded line
 for(const [spec,a] of [[L13,'0.3'],[L32,'0.0'],[L38,'0.4'],[I38,'0.4']]){const r=v(spec,a);assert.equal(r.verdict,'unsure',`${spec.f} ${a}`);assert.match(r.why,/rounded decimal/);}
 // not a correct rounding: today's path
 assert.equal(v(LE,'2.8').verdict,'wrong');assert.equal(v(L3,'2.999').verdict,'unsure');assert.equal(v(L38,'0.39').verdict,'wrong');
 // the leak check refuses every decimal the judge now calls right
 assert.equal(C.leaksCalc(L38,'It comes to 0.38.'),true);assert.equal(C.leaksCalc(I38,'about 0.38'),true);
 assert.equal(C.leaksCalc(LE,'roughly 2.7'),true);assert.equal(C.leaksCalc(L38,'minus 0.38'),true);
 assert.equal(C.leaksCalc(L38,'it is near 0.39'),false,'a decimal that is not a rounding is not the answer');
});

test('D2-1: the two judges (calc.ts judgeNumber, calc2.ts judgeLimit) give the same verdict on a fixed grid of truths and decimals',()=>{
 // f in x with the limit at infinity as truth; the same f as a Calculus 1 limit at inf and as a sequence limit
 const truths=['3/8 + 1/x','1/3 + 1/x','1/32 + 1/x','(1 + 1/x)^x','3 + 1/x','1/2 + 1/x','107/40 + 1/x','62/5 + 1/x','-3/8 + 1/x','1/x','2/3 + 1/x','1/8 + 1/x'];
 const decimals=['0.38','0.37','0.375','0.4','0.39','0.3','0.33','0.333','0.334','0.0','0.03','0.031','0.032','2.7','2.72','2.718','2.71','2.8','3.0','3.00','2.999','3.01','0.5','0.50','0.4996','0.502','2.67','2.68','2.671','2.675','-0.38','-0.375','-0.4','12.4','12.0','12.40','0.1','0.13','0.12','0.67','0.6667','0.7','0.00','-0.0','.38','.5'];
 const diff=[];
 for(const f of truths)for(const a of decimals){
  const one=C.checkAnswer({shape:'limit',f,at:'inf'},a),two=C.checkAnswer({shape:'sequence-limit',f},a);
  if(one.verdict!==two.verdict||one.slip!==two.slip)diff.push(`${f} ${a}: ${one.verdict}/${two.verdict}`);
 }
 assert.deepEqual(diff,[]);
 // the grid is not trivial: each verdict occurs
 const seen=new Set(truths.flatMap((f)=>decimals.map((a)=>C.checkAnswer({shape:'sequence-limit',f},a).verdict)));
 assert.deepEqual([...seen].sort(),['right','unsure','wrong']);
});

test('MB-B27: an antiderivative undefined where the integrand is defined is not sure, with a domain line; the absolute value is right',()=>{
 const S={shape:'antiderivative',f:'1/x'},dom=/not defined everywhere/;
 for(const a of ['ln x + C','ln(x) + C','ln(x)+C']){const r=C.checkAnswer(S,a);assert.equal(r.verdict,'unsure',a);assert.match(r.why,dom);assert.ok(!/abs|absolute|\|/.test(r.why)&&!/ln/.test(r.why),'the line names neither the absolute value nor the answer');}
 for(const a of ['ln|x| + C','ln(abs(x)) + C'])assert.equal(C.checkAnswer(S,a).verdict,'right',a);
 // one direction only: an answer defined where the truth is not stays right
 assert.equal(C.checkAnswer({shape:'derivative',f:'ln(x)'},'1/x').verdict,'right');
 // an answer that is wrong anyway is still wrong, not softened to unsure
 assert.equal(C.checkAnswer(S,'ln x').verdict,'wrong');
 assert.equal(C.checkAnswer(S,'-ln|x| + C').slip,'sign');
});

test('MB-B28: a decimal for a limit or a definite integral is right only as the exact value correctly rounded at its own written precision',()=>{
 const L3={shape:'limit',f:'sin(3x)/x',at:0},LH={shape:'limit',f:'(x^2 + 1)/(2x^2 + 3)',at:'inf'},LE={shape:'limit',f:'(1 + 1/x)^x',at:'inf'};
 const IE={shape:'definite-integral',f:'e^x/2',a:0,b:1},NINE={shape:'definite-integral',f:'x^2',a:0,b:3};
 const v=(spec,a)=>C.checkAnswer(spec,a).verdict;
 for(const [spec,a] of [[L3,'3'],[L3,'3.00'],[L3,'3.0'],[LH,'0.5'],[LH,'0.50'],[LE,'2.718'],[LE,'2.72'],[LE,'2.7183'],[IE,'0.859'],[IE,'0.86'],[IE,'0.8591'],[NINE,'9.00']])assert.equal(v(spec,a),'right',`${spec.f} ${a}`);
 for(const a of ['2.999','3.01','3.014','2.986','2.9996','3.0004'])assert.equal(v(L3,a),'unsure',`3: ${a}`);
 for(const a of ['0.4996','0.498','0.502','0.4975'])assert.equal(v(LH,a),'unsure',`1/2: ${a}`);
 for(const a of ['2.717','2.71'])assert.equal(v(LE,a),'unsure',`e: ${a}`);
 for(const a of ['8.99','9.04'])assert.equal(v(NINE,a),'unsure',`9: ${a}`);
 assert.match(C.checkAnswer(L3,'3.01').why,/rounded decimal/);
 // OLD wrong -> NEW right (D2 R1a): 2.7 is e correctly rounded at one decimal, two significant figures
 assert.equal(v(LE,'2.7'),'right','2.7 for e is a correct rounding');assert.equal(v(LE,'2.8'),'wrong');
 // halfway: either neighbour is right
 const HALFWAY={shape:'definite-integral',f:'5.35x',a:0,b:1};   // 2.675
 assert.equal(v(HALFWAY,'2.67'),'right');assert.equal(v(HALFWAY,'2.68'),'right');assert.equal(v(HALFWAY,'2.671'),'unsure');
 // exact answers and the exact shapes are unchanged
 assert.equal(v(LE,'e'),'right');assert.equal(v(LH,'1/2'),'right');assert.equal(v(IE,'(e - 1)/2'),'right');
 assert.equal(v({shape:'derivative-at',f:'x^2',at:6},'12.01'),'unsure');
});
