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
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
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
 [{shape:'antiderivative',f:'3x^2 - 4/x'},'x^3 - 4ln(x) + C','right'],[{shape:'antiderivative',f:'3x^2 - 4/x'},'x^3 - 4ln|x| + C','right'],[{shape:'antiderivative',f:'3x^2 - 4/x'},'x^3 - 4 ln(x)','wrong','lost-constant'],
 [{shape:'antiderivative',f:'cos(x)'},'sin(x) + C','right'],[{shape:'antiderivative',f:'cos(x)'},'-sin(x) + C','wrong','sign'],[{shape:'antiderivative',f:'cos(x)'},'sin x','wrong','lost-constant'],
 [{shape:'antiderivative',f:'2x (x^2 + 1)^3'},'(x^2 + 1)^4/4 + C','right'],[{shape:'antiderivative',f:'2x (x^2 + 1)^3'},'(x^2 + 1)^4 + C','wrong'],
 [DI,'1/3','right'],[DI,'0.333','right'],[DI,'0.3','wrong'],[DI,'-1/3','wrong','sign'],[DI,'1/2','wrong'],[DI,'','unsure'],
 [{shape:'definite-integral',f:'2x + 1/sqrt(x)',a:1,b:4},'17','right'],[{shape:'definite-integral',f:'sin(x)',a:0,b:'pi'},'2','right'],
 [{shape:'definite-integral',f:'sin(x)',a:0,b:'pi'},'-2','wrong','sign'],[{shape:'definite-integral',f:'x^2',a:1,b:0},'-1/3','right'],
 [LS,'1','right'],[LS,'0','wrong'],[LS,'-1','wrong','sign'],[LS,'inf','wrong'],[LS,'dne','wrong'],[LS,'1.0','right'],
 [{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},'4','right'],[{shape:'limit',f:'(x^2 - 4)/(x - 2)',at:2},'4.00','right'],
 [LI,'inf','right'],[LI,'infinity','right'],[LI,'∞','right'],[LI,'+∞','right'],[LI,'-inf','wrong','sign'],[LI,'100000','wrong'],[LI,'Infinity','right'],
 [{shape:'limit',f:'1/x',at:0,side:'-'},'-infinity','right'],[{shape:'limit',f:'1/x',at:0,side:'-'},'infinity','wrong','sign'],
 [{shape:'limit',f:'(1 + 1/x)^x',at:'inf'},'e','right'],[{shape:'limit',f:'(1 + 1/x)^x',at:'inf'},'2.718','right'],[{shape:'limit',f:'(1 + 1/x)^x',at:'inf'},'2.7','wrong'],
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
