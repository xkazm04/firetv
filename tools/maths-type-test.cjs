/**
 * Math Buddy's maths reader (desk/src/maths/typeset.ts) and the paper's pen (desk/src/maths/working.ts): the
 * product's plain notation and TeX both read into the same tree, stacked fractions only where a slash is clearly
 * one, nothing dropped, nothing thrown, and the desk's mark placed only where the data puts it. The A-level lines
 * are the contest winner's round-3 set (Tom, Year 12), as text and as TeX. Run with npm test in desk/
 * (directly: node tools/maths-type-test.cjs). Pure: no store, no route, no model.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
const T=require(path.join(root,'src/maths/typeset.ts'));
const W=require(path.join(root,'src/maths/working.ts'));
/** A line as the TV sets it (MathText, server-rendered): what the stacked scripts, limits and root indices look like. */
const html=(s,voice='print')=>{const React=require(path.join(root,'node_modules/react'));const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));const {MathText}=require(path.join(root,'src/maths/MathText.tsx'));return renderToStaticMarkup(React.createElement(MathText,{text:s,voice}));};

const types=(nodes)=>{const out=[];T.walk(nodes,n=>out.push(n.t));return out;};
const count=(nodes,t)=>types(nodes).filter(x=>x===t).length;
const flat=(s)=>T.flatten(T.parseMath(s));
/** Letters and digits in order: what must survive any reading (keywords aside). */
const alnum=(s)=>s.replace(/[^0-9a-zA-Z]/g,'');

// the round-3 A-level set: every question and working line, as the product's plain text and as TeX
const ALEVEL=[
 {text:'Solve 3x² − 5x − 2 = 0',tex:'\\text{Solve } 3x^2 - 5x - 2 = 0'},
 {text:'(3x + 1)(x − 2) = 0',tex:'(3x + 1)(x - 2) = 0'},
 {text:'x = −1/3  or  x = 2',tex:'x = -\\tfrac{1}{3} \\quad\\text{or}\\quad x = 2'},
 {text:'Differentiate y = (3x² − 1)⁴',tex:'\\text{Differentiate } y = (3x^2 - 1)^4'},
 {text:'dy/dx = 4(3x² − 1)³',tex:'\\frac{dy}{dx} = 4(3x^2 - 1)^3'},
 {text:'= 4(27x⁶ − 27x⁴ + 9x² − 1)',tex:'= 4(27x^6 - 27x^4 + 9x^2 - 1)'},
 {text:'= 108x⁶ − 108x⁴ + 36x² − 4',tex:'= 108x^6 - 108x^4 + 36x^2 - 4'},
 {text:'Find ∫ x·e²ˣ dx',tex:'\\text{Find } \\int x\\,e^{2x}\\,dx'},
 {text:'u = x,   dv = e²ˣ dx',tex:'u = x, \\qquad dv = e^{2x}\\,dx'},
 {text:'du = dx,   v = ½e²ˣ',tex:'du = dx, \\qquad v = \\tfrac{1}{2}e^{2x}'},
 {text:'∫ x·e²ˣ dx = ½x·e²ˣ + ∫ ½e²ˣ dx',tex:'\\int x\\,e^{2x}\\,dx = \\tfrac{1}{2}x\\,e^{2x} + \\int \\tfrac{1}{2}e^{2x}\\,dx'},
 {text:'= ½x·e²ˣ + ¼e²ˣ + C',tex:'= \\tfrac{1}{2}x\\,e^{2x} + \\tfrac{1}{4}e^{2x} + C'},
 {text:'Solve log₂(x + 3) + log₂(x − 1) = 5',tex:'\\text{Solve } \\log_2(x + 3) + \\log_2(x - 1) = 5'},
 {text:'log₂((x + 3)(x − 1)) = 5',tex:'\\log_2\\big((x + 3)(x - 1)\\big) = 5'},
 {text:'x² + 2x − 35 = 0',tex:'x^2 + 2x - 35 = 0'},
 {text:'x = −7  or  x = 5',tex:'x = -7 \\quad\\text{or}\\quad x = 5'},
 {text:'Solve 2sin²x − sin x − 1 = 0 for 0 ≤ x < 2π',tex:'\\text{Solve } 2\\sin^2 x - \\sin x - 1 = 0, \\quad 0 \\le x < 2\\pi'},
 {text:'sin x = −½  or  sin x = 1',tex:'\\sin x = -\\tfrac{1}{2} \\quad\\text{or}\\quad \\sin x = 1'},
 {text:'x = 7π/6,   x = π/2',tex:'x = \\tfrac{7\\pi}{6}, \\qquad x = \\tfrac{\\pi}{2}'},
 {text:'Solve x² − x − 6 > 0',tex:'\\text{Solve } x^2 - x - 6 > 0'},
];

test('1: a two-step linear equation reads as numbers, a variable, operators and a relation, in order',()=>{
 const n=T.parseMath('3x - 7 = 11');
 assert.deepEqual(n.map(x=>x.t),['num','var','bin','num','rel','num']);
 assert.equal(n[2].v,'−','a hyphen is set as a real minus');
 assert.equal(T.flatten(n),'3x−7=11');
 assert.equal(flat('Solve for x:  5(x - 2) = 3x + 8').replace(/\s+/g,' '),'Solve for x: 5(x−2)=3x+8','words stay words, the colon stays');
 assert.deepEqual(T.parseMath('Solve for x: 3x - 7 = 11').slice(0,5).map(x=>x.t),['text','sp','text','sp','var']);
});

test('2: powers - the caret, a braced or bracketed exponent, a power on a bracket, **, and Unicode superscripts',()=>{
 assert.equal(flat('x^2 + 7x + 12'),'x^(2)+7x+12');
 assert.equal(flat('2x**2 - 5x - 3 = 0'),'2x^(2)−5x−3=0','x**2 is a power');
 assert.equal(flat('**Simplify** 3x'),'Simplify 3x','markdown bold is not a power');
 assert.equal(flat('e^(2x) + x^-1 + y^{n+1}'),'e^(2x)+x^(−1)+y^(n+1)');
 const b=T.parseMath('(3x^2 - 1)^4');const close=b.find(x=>x.t==='close');
 assert.ok(close.sup,'the power sits on the bracket');assert.equal(T.flatten(close.sup),'4');
 assert.equal(flat('x² + 2x − 35 = 0'),flat('x^2 + 2x - 35 = 0'),'x² reads as x^2');
 assert.equal(flat('e²ˣ'),'e^(2x)');
 assert.equal(flat('(3x²y)(4xy³)'),'(3x^(2)y)(4xy^(3))');
});

test('3: a slash is a stacked fraction only where it is clearly one',()=>{
 const f=T.parseMath('x/4 + 3 = 8');assert.equal(f[0].t,'frac');assert.equal(T.flatten(f[0].num),'x');assert.equal(T.flatten(f[0].den),'4');
 const g=T.parseMath('(a + b)/c')[0];assert.equal(g.t,'frac');assert.equal(T.flatten(g.num),'a+b','the bracket around a numerator is only grouping');
 assert.equal(T.parseMath('(x+1)/(x-1)')[0].t,'frac');
 const d=T.parseMath('dy/dx = 4(3x² − 1)³')[0];assert.equal(d.t,'frac');assert.equal(T.flatten(d.num),'dy');assert.equal(T.flatten(d.den),'dx');
 const p=T.parseMath('x = 7π/6,   x = π/2');assert.equal(count(p,'frac'),2);assert.equal(T.flatten(p.find(x=>x.t==='frac').num),'7π');
 assert.equal(count(T.parseMath('2(x+1)/3 = 4'),'frac'),1);
 assert.equal(count(T.parseMath('3 / 4'),'frac'),0,'spaces around the slash: a division sign, not a fraction');
 assert.equal(count(T.parseMath('and/or'),'frac'),0,'words are never a fraction');
 assert.equal(count(T.parseMath('x = −½  or  y = ¾'),'frac'),2,'vulgar fractions stack');
 assert.equal(flat('1/2x'),'(1)/(2)x','a number over a number, then x');
});

test('4: roots, pi, integrals, logs with a base, trig, ≤ ≥ ≠, × ÷ and *',()=>{
 assert.equal(flat('sqrt(x + 1)'),'√(x+1)');assert.equal(flat('sqrt((x+1)(x-1))'),'√((x+1)(x−1))','brackets inside a root');
 assert.equal(flat('√x + √(2x)'),'√(x)+√(2x)');
 assert.equal(flat('2pi r'),'2π r');assert.equal(flat('2π'),'2π');
 assert.equal(count(T.parseMath('int x dx'),'int'),1);assert.equal(count(T.parseMath('∫ x dx'),'int'),1);
 const l=T.parseMath('log_2(x) + log₂(y) + ln x');assert.equal(l.filter(x=>x.t==='fn').length,3);
 assert.equal(T.flatten(l[0].sub),'2');assert.equal(T.flatten(l.find((x,i)=>i>0&&x.t==='fn').sub),'2','log₂ has its base');
 assert.equal(flat('2sin²x − sinx'),'2sin^(2)x−sinx');
 assert.equal(T.parseMath('logs of cost').filter(x=>x.t==='text').length,3,'"logs" and "cost" are words, not log s and cos t');
 assert.equal(flat('x <= 5, y >= 2, z != 0'),'x≤5, y≥2, z≠0');
 assert.equal(flat('3*4 = 12'),'3×4=12');assert.equal(flat('x*y'),'x·y');assert.equal(flat('12 ÷ 4'),'12÷4');
 assert.equal(flat('A rectangle has perimeter 34 cm').split(' ')[0],'A');
 assert.equal(T.parseMath('A rectangle')[0].t,'text','the article is English, not a variable A');
});

test('5: the whole A-level set reads - as the product\'s plain text and as TeX - with its fractions, powers and integrals',()=>{
 for(const l of ALEVEL){
  const plain=T.parseMath(l.text),tex=T.parseMath(l.tex);
  assert.ok(plain.length&&tex.length,l.text);
  assert.ok(T.looksTex(l.tex)||!/\\/.test(l.tex),`${l.tex} is read as TeX`);
  assert.equal(count(plain,'frac'),count(tex,'frac'),`${l.text}: the same fractions either way`);
  assert.equal(count(plain,'int'),count(tex,'int'),`${l.text}: the same integrals either way`);
  assert.ok(!types(tex).includes('text')||/\\text|Solve|Find|Differentiate/.test(l.tex),`${l.tex}: no stray words`);
 }
 const ibp=T.parseMath(ALEVEL[10].tex);
 assert.equal(count(ibp,'int'),2);assert.equal(count(ibp,'frac'),2);assert.ok(T.isTall(ibp),'a line with a fraction or an integral takes three squares');
 assert.ok(!T.isTall(T.parseMath('3x - 7 = 11')));
 assert.equal(T.flatten(T.parseMath(ALEVEL[13].tex)).replace(/\s/g,''),'log_(2)((x+3)(x−1))=5','\\big( is a bracket');
});

test('6: nothing is dropped - every letter and digit survives, in order, whatever the line',()=>{
 const lines=[...ALEVEL.map(l=>l.text),'Solve for x: 3x - 7 = 11','A rectangle has perimeter 34 cm and width 5 cm. Find its length.','Find the slope of the line through (2, 5) and (6, 13)','x/4 + 3 = 8','(3x^2 - 1)^4','2x**2 + 3.5x - 0.25 = 0','50% of 3x is 12!','x = 5 → check: 3(5) - 7 = 8 ✓','a/b/c','((x)','x)^2(','@#~ ÷ ≈ ∞ θ'];
 for(const s of lines){
  const f=T.flatten(T.parseMath(s));
  assert.equal(alnum(f),alnum(s.replace(/[²³⁴⁶ˣ₂]/g,m=>({'²':'2','³':'3','⁴':'4','⁶':'6','ˣ':'x','₂':'2'})[m]).replace(/[½¼]/g,m=>m==='½'?'12':'14')),`${s} -> ${f}`);
 }
 for(const s of ['@#~','✓','⋯']) assert.ok(T.flatten(T.parseMath(s)).includes([...s][0]),`${s} is kept as itself`);
});

test('7: never throws - TeX it cannot read is read as plain text, and random strings come back',()=>{
 const bad=T.parseMath('\\unknown{x} + 1');assert.ok(T.flatten(bad).includes('unknown'),'the command name is kept');
 assert.ok(T.flatten(T.parseMath('\\frac{1}{')).includes('1'),'an unclosed fraction falls back');
 assert.deepEqual(T.parseMath(''),[]);assert.deepEqual(T.parseMath('   '),[]);assert.deepEqual(T.parseMath(undefined),[]);
 const chars='0123456789xyzabc+-*/^_()[]{}=<>≤≥,.;:√∫π²³½ \\$|!\'';
 let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
 for(let k=0;k<3000;k++){
  let s='';const len=1+Math.floor(rnd()*24);for(let j=0;j<len;j++)s+=chars[Math.floor(rnd()*chars.length)];
  assert.doesNotThrow(()=>{const n=T.parseMath(s);T.flatten(n);T.isTall(n);T.markLine(s,{kind:'sign',span:s.slice(0,3)});},s);
 }
});

test('8: the pen inside a line - a flipped sign is flagged, an extra part struck, a missing part opens a gap after its span',()=>{
 const sign=T.markLine('∫ x·e²ˣ dx = ½x·e²ˣ + ∫ ½e²ˣ dx',{kind:'sign',span:'+ ∫'});
 assert.equal(sign.kind,'sign');const flagged=sign.mid.filter(n=>n.flag);assert.equal(flagged.length,1);assert.equal(flagged[0].v,'+','only the one symbol is ringed');
 assert.equal(count(sign.pre,'int'),1);assert.equal(count(sign.pre,'frac'),1);
 const tex=T.markLine(ALEVEL[10].tex,{kind:'sign',span:'+ \\int'});assert.equal(tex.kind,'sign','a TeX line is marked the same way');assert.ok(tex.mid.some(n=>n.flag));
 const extra=T.markLine('x = −7  or  x = 5',{kind:'extra',span:'x = −7'});
 assert.equal(extra.kind,'extra');assert.equal(T.flatten(extra.mid),'x=−7');assert.ok(extra.post[0].t==='sp'&&extra.post[0].w===1,'the wide gap before "or" is kept');
 const miss=T.markLine('x = 7π/6,   x = π/2',{kind:'missing',span:'x = 7π/6'});
 assert.equal(miss.kind,'missing');assert.deepEqual(miss.trail.map(n=>n.v),[','],'the comma stays with its span, before the gap');
 assert.equal(count(miss.mid,'frac'),1);
 const chain=T.markLine('dy/dx = 4(3x² − 1)³',{kind:'missing',span:'4(3x² − 1)³'});assert.equal(chain.kind,'missing');assert.equal(chain.post.length,0);
 assert.equal(T.markLine('3x = 15',{kind:'sign',span:'nowhere'}).kind,'line','a span the line does not hold marks the line - no guessed place');
 assert.equal(T.markLine('3x = 15',{kind:'line'}).kind,'line');
});

test('9: the working as lines, and the pen placed only where the data puts it',()=>{
 assert.deepEqual(W.workingLines({studentWorking:'3x - 7 = 11\n3x = 18; x = 6'}),['3x - 7 = 11','3x = 18','x = 6']);
 assert.deepEqual(W.workingLines({studentWorking:'3x = 18 -> x = 6'}),['3x = 18','x = 6']);
 assert.deepEqual(W.workingLines({studentWorking:'',studentAnswer:'6'}),['x = 6'],'a bare value is a value of x');
 assert.deepEqual(W.workingLines({studentWorking:''}),[]);
 const base={n:1,question:'3x - 7 = 11',studentWorking:'3x = 11 - 7\n3x = 4\nx = 4/3'};
 const right=W.working({...base,verdict:'right'});assert.deepEqual(right.ticks,[false,false,true],'right: the answer line is ticked, nothing else claimed');assert.equal(right.mark,null);
 const unsure=W.working({...base,verdict:'unsure'});assert.equal(unsure.mark,null);assert.ok(unsure.ticks.every(x=>!x));
 const place=W.working({...base,verdict:'wrong',slip:'sign-lost-moving'},'the line where the term moved');
 assert.equal(place.at,2,'no line named: the answer line, which the verdict is about');assert.equal(place.placed,'answer');assert.ok(place.ticks.every(x=>!x));
 const at=W.working({...base,verdict:'wrong',slip:'sign-lost-moving',slipAt:{line:0,span:'- 7',kind:'sign'}},'the second line');
 assert.equal(at.at,0);assert.deepEqual(at.mark,{kind:'sign',span:'- 7'});assert.equal(at.placed,'slipAt','a named place wins over the rulebook');
 const check=W.working({...base,verdict:'wrong',slip:'answer-not-checked'},'the original equation');
 assert.equal(check.mark.kind,'missing');assert.equal(check.at,2,'the check belongs after the last line');
 assert.equal(W.working({...base,verdict:'wrong',slipAt:{line:9,kind:'sign',span:'x'}}).placed,'answer','a line past the working is not trusted');
});

test('10 (pen case 8): no prose ordinal places the pen or earns a tick, the card agrees with the pen, and the slip names are kept once',()=>{
 const M=require(path.join(root,'src/lib/rules/maths.ts'));
 const base={n:1,question:'3x - 7 = 11',studentWorking:'3x = 11 - 7\n3x = 4\nx = 4/3'};
 const pts=W.working({...base,verdict:'wrong',slip:'sign-lost-moving'},'the second line');
 assert.equal(pts.placed,'answer');assert.equal(pts.at,2);assert.deepEqual(pts.mark,{kind:'line'});assert.deepEqual(pts.ticks,[false,false,false],'no tick the desk did not check');
 assert.equal(typeof W.lookAt,'function');
 assert.equal(W.lookAt({...base,verdict:'wrong',slip:'sign-lost-moving',slipAt:{line:0,span:'- 7',kind:'sign'}},'the second line'),'Look where the pen is.');
 assert.equal(W.lookAt({...base,verdict:'wrong',slip:'sign-lost-moving'},'the second line'),'Look at the second line.');
 assert.equal(W.lookAt({...base,verdict:'right'},'the second line'),null);
 // the line split is one rule, shared by the server's locate and the TV's pen
 assert.equal(typeof M.workingLines,'function');assert.equal(W.workingLines,M.workingLines);
 // ticks before a located slip only on the lines the desk could read as arithmetic
 assert.deepEqual(W.working({...base,studentWorking:'3x = 18\nx = -6',verdict:'wrong',slipAt:{line:1}}).ticks,[true,false]);
 assert.deepEqual(W.working({...base,studentWorking:'take 7 from both sides\n3x = 4\nx = 4/3',verdict:'wrong',slipAt:{line:1}}).ticks,[false,false,false]);
 const TODAY={
  'undo-wrong-order':'Undone in the wrong order','sign-lost-moving':'Sign lost crossing the equals','divided-one-term':'Only one term divided',
  'bracket-first-term-only':'Bracket on the first term only','collect-x-wrong-sign':'x-terms gathered with the wrong sign',
  'multiplied-not-divided':'Multiplied instead of divided','added-not-subtracted':'Done again instead of undone','one-side-only':'Done to one side only',
  'arithmetic-slip':'A number came out wrong','negative-mishandled':'A minus sign dropped','fraction-not-cleared':'The fraction left in place',
  'answer-not-checked':'The answer not checked',
 };
 assert.deepEqual(Object.fromEntries(M.SLIPS.map(s=>[s.id,s.name])),TODAY);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8'),/SLIP_NAME/,'one list, in rules/maths');
});

test('11: a stacked fraction never splits a function from its bracketed argument',()=>{
 const frac=(s)=>T.parseMath(s).find(x=>x.t==='frac');
 const a=T.parseMath('sin(x)/x');assert.equal(a.length,1,'sin(x)/x is one fraction, not sin beside a fraction');
 assert.equal(T.flatten(a[0].num),'sin(x)');assert.equal(T.flatten(a[0].den),'x');
 const b=frac('ln(x+1)/(x+1)');assert.equal(T.flatten(b.num),'ln(x+1)');assert.equal(T.flatten(b.den),'x+1');
 assert.equal(T.flatten(frac('2sin(x)/3').num),'2sin(x)');
 assert.equal(T.flatten(frac('log_2(x)/x').num),'log_(2)(x)','a function with its base keeps its argument too');
 // what did not change: a bare function name glued to its argument, and every earlier fraction
 assert.equal(flat('2sin²x − sinx'),'2sin^(2)x−sinx');
 assert.equal(flat('(x+1)/(x-1)'),'(x+1)/(x−1)');assert.equal(flat('dy/dx'),'(dy)/(dx)');assert.equal(flat('7pi/6'),'(7π)/(6)');assert.equal(flat('x/4'),'(x)/(4)');
});

// ---- Calculus 1: the notation it is written in

test('12: arrows and limits - x->a is an arrow, and the limit sits under lim',()=>{
 const arrow=(s)=>T.parseMath(s).some(n=>n.t==='rel'&&n.v==='→');
 assert.ok(arrow('x->a'),'x->a is one arrow, not x - > a');assert.equal(flat('x->a'),'x→a');
 assert.ok(arrow('x \\to a'));assert.ok(arrow('x \\rightarrow a'));
 const l=T.parseMath('lim_(x->0) sin(x)/x');
 assert.equal(l[0].t,'fn');assert.equal(l[0].v,'lim');assert.equal(T.flatten(l[0].sub),'x→0');
 assert.equal(T.flatten(l.find(n=>n.t==='frac').num),'sin(x)');
 const lt=T.parseMath('\\lim_{x\\to 0} \\frac{\\sin x}{x}');
 assert.equal(lt[0].v,'lim');assert.equal(T.flatten(lt[0].sub).replace(/\s/g,''),'x→0');assert.equal(count(lt,'frac'),1);
 assert.ok(T.isTall(T.parseMath('lim_(x->a) f(x)')),'a limit under lim takes three squares');
 for(const s of ['lim_(x->0) sin(x)/x','\\lim_{x\\to 0} \\frac{\\sin x}{x}']){
  const h=html(s);
  assert.match(h,/<span class="mlim"><span class="mfn">lim<\/span><span class="sub">.*→.*<\/span><\/span>/,`${s}: the limit is set under lim`);
  assert.doesNotMatch(h,/class="msc"><span class="mfn">lim/,`${s}: never a subscript beside lim`);
 }
});

test('13: roots carry their index - a cube root is never shown as a square root',()=>{
 const root=(s)=>{let r=null;T.walk(T.parseMath(s),n=>{if(!r&&n.t==='sqrt')r=n;});return r;};
 for(const [s,i,b] of [['\\sqrt[3]{x}','3','x'],['\\sqrt[n]{x}','n','x'],['sqrt[3](x)','3','x'],['cbrt(x)','3','x'],['∛x','3','x'],['∛(x+1)','3','x+1'],['∜(16)','4','16']]){
  const r=root(s);assert.ok(r,`${s} is a root`);assert.equal(T.flatten(r.idx||[]),i,`${s} has index ${i}`);assert.equal(T.flatten(r.body),b,`${s}: its radicand`);
 }
 assert.equal(root('\\sqrt{x}').idx,undefined);assert.equal(root('sqrt(x)').idx,undefined);assert.equal(flat('sqrt(x + 1)'),'√(x+1)','a square root flattens as before');
 assert.equal(flat('\\sqrt[3]{x}'),'√[3](x)','the index is a character, and it is kept');
 for(const v of ['print','hand']){
  const h=html('\\sqrt[3]{x}',v);
  assert.match(h,/<span class="msq"><span class="msq-i">.*3.*<\/span>.*<span class="msq-b">/,`${v}: the index is set at the root's top-left, before the radicand`);
 }
 assert.doesNotMatch(html('sqrt(x)'),/msq-i/);
});

test('14: a symbol with a subscript and a superscript sets them in one column, the superscript above',()=>{
 const both=(s)=>{let r=null;T.walk(T.parseMath(s),n=>{if(!r&&n.sup&&n.sub)r=n;});return r;};
 for(const [s,t,sub,sup] of [['x_n^2','var','n','2'],['int_0^1 x dx','int','0','1'],['[F(x)]_a^b','close','a','b'],['sum_{i=1}^n i','op','i=1','n'],['\\int_0^1 x\\,dx','int','0','1']]){
  const n=both(s);assert.ok(n,`${s} holds both scripts on one symbol`);assert.equal(n.t,t,s);assert.equal(T.flatten(n.sub),sub);assert.equal(T.flatten(n.sup),sup);
  const h=html(s);
  assert.match(h,/<span class="mst"><span class="sup[^"]*">((?!<span class="sub").)*<\/span><span class="sub">/,`${s}: one column, superscript first (above)`);
  assert.ok(T.isTall(T.parseMath(s)),`${s}: a stacked pair takes three squares`);
 }
 assert.doesNotMatch(html('x^2 + y_1'),/class="mst"/,'a single script stays where it was');
 assert.ok(!T.isTall(T.parseMath('x^2 + y_1')));
});

test('15: sums and products - the sign with its limits stacked, and the TeX line keeps its fraction',()=>{
 const s=T.parseMath('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}');
 assert.equal(s[0].t,'op');assert.equal(s[0].v,'∑');assert.equal(T.flatten(s[0].sub),'i=1');assert.equal(T.flatten(s[0].sup),'n');
 assert.equal(count(s,'frac'),1,'one command the reader did not know used to collapse this line to raw text');
 const p=T.parseMath('sum_(i=1)^n i');assert.equal(p[0].t,'op');assert.equal(T.flatten(p[0].sub),'i=1');assert.equal(T.flatten(p[0].sup),'n');
 assert.equal(T.parseMath('\\prod_{k=1}^{n} k')[0].v,'∏');assert.equal(T.parseMath('∑_(k=0)^9 k')[0].t,'op');
 assert.ok(!types(T.parseMath('Find the sum of 3 and 4')).includes('op'),'"sum" in a sentence stays a word');
 assert.match(html('\\sum_{i=1}^{n} i'),/<span class="mop">∑<\/span><span class="mst">/);
});

test('16: an unknown TeX command degrades to its name, and the rest of the line is still typeset',()=>{
 const n=T.parseMath('\\frac{1}{2} + \\weird x');
 assert.equal(count(n,'frac'),1,'the fraction survives the unknown command');
 assert.ok(n.some(x=>x.t==='text'&&x.v==='weird'),'the command keeps its name, as a word');assert.ok(!T.flatten(n).includes('\\'),'no backslash on the TV');
 assert.ok(T.flatten(T.parseMath('\\unknown{x} + 1')).includes('unknown'));
 const c=T.parseMath('f(x) = \\begin{cases} x^2 & x < 0 \\\\ x & x \\ge 0 \\end{cases}');
 const cf=T.flatten(c);assert.ok(!cf.includes('\\'),`cases degrades to readable text: ${cf}`);assert.ok(!/begin|cases/.test(cf),cf);
 assert.match(cf.replace(/\s/g,''),/x<0.*x≥0/);
 assert.equal(count(T.parseMath('\\left| x - 1 \\right| \\le \\epsilon'),'open'),1,'\\left| opens');
 // the Calculus vocabulary, shuffled: never a throw, from the reader or from the TV's setter
 const bits=['\\sum','\\prod','\\sqrt[','\\sqrt','\\lim','\\limits','_','^','{','}','[',']','(',')','->','\\to','\\left','\\right','|','\\lvert','\\rvert','\\abs','\\begin{cases}','\\end{cases}','&','\\\\','∛','∑','Σ','theta','sum','cbrt','sqrt','lim','x','n','1','0','+','=','/','\\frac','\\weird','\\prime','\\partial','²',' '];
 let seed=11;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
 for(let k=0;k<2000;k++){
  let s='';const len=1+Math.floor(rnd()*12);for(let j=0;j<len;j++)s+=bits[Math.floor(rnd()*bits.length)];
  assert.doesNotThrow(()=>{const n=T.parseMath(s);T.flatten(n);T.isTall(n);T.markLine(s,{kind:'extra',span:s.slice(0,4)});if(k%8===0)html(s,k%16?'print':'hand');},s);
 }
});

test('17: Greek - every letter the reader knows has a TeX name, and a Greek word in a sentence stays English',()=>{
 const names=['alpha','beta','gamma','delta','epsilon','varepsilon','theta','lambda','mu','rho','sigma','tau','phi','omega','Delta','Sigma','Omega'];
 const glyph=(name)=>{const n=T.parseMath('\\'+name+' + 1')[0];return n.v;};
 for(const name of names){const g=glyph(name);assert.ok(g&&T.GREEK.includes(g),`\\${name} -> ${g} is a letter the plain reader knows`);}
 for(const ch of T.GREEK) assert.ok(Object.values(T.GREEK_TEX).includes(ch),`${ch} has a TeX name`);
 for(const ch of T.GREEK) assert.equal(T.parseMath('2'+ch)[1].t,'var',`${ch} typed as a glyph is a variable`);
 // a typed name is the letter only beside maths
 assert.equal(flat('sin(theta)'),'sin(θ)');assert.equal(flat('2theta'),'2θ');assert.equal(flat('theta = 30'),'θ=30');assert.equal(flat('cos theta'),'cosθ');
 assert.equal(flat('delta x'),'δ x');assert.equal(flat('epsilon > 0'),'ε>0');assert.equal(flat('Delta y = 3 Delta x'),'Δ y=3 Δ x');
 assert.equal(flat('the delta of the river'),'the delta of the river','English stays English');
 assert.equal(flat('Find theta.'),'Find theta.');assert.equal(flat('beta version'),'beta version');
});

test('18: prime, partial, absolute value, and every arc function',()=>{
 const f=T.parseMath("f^{\\prime}(x) = 2x \\cdot g'(x)");assert.equal(T.flatten(f[0].sup),'′');
 assert.ok(T.flatten(T.parseMath('\\frac{\\partial f}{\\partial x}')).includes('∂'));assert.ok(T.parseMath('∂f').some(n=>n.t==='sym'&&n.v==='∂'));
 assert.equal(T.flatten(T.parseMath('\\lvert x \\rvert = 3')).replace(/\s/g,''),'|x|=3');
 assert.equal(T.flatten(T.parseMath('\\abs{x - 1} < \\delta')).replace(/\s/g,''),'|x−1|<δ');
 for(const fn of ['arcsec','arccot','arccsc','arcsin']){const n=T.parseMath(fn+'(x)');assert.equal(n[0].t,'fn',fn);assert.equal(n[0].v,fn);}
 assert.equal(T.parseMath('arcsecx')[0].v,'arcsec','glued like arcsinx');
});

test('19: the ten-foot floor - an exponent, a subscript, a root index or a fraction part never computes under 28 px',()=>{
 // the stylesheet as rules, comments stripped first so a commented-out floor never counts
 const css=fs.readFileSync(path.join(root,'src/design/maths-lamplight.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m=>({sels:m[1].split(',').map(s=>s.trim().replace(/\s+/g,' ')),decl:m[2]}));
 /** The font-size a rule gives at a parent size: max(a em, b px), a em, or b px. */
 const sizer=(v)=>{
  const mx=/^max\(\s*([\d.]+)em\s*,\s*([\d.]+)px\s*\)$/.exec(v);if(mx)return (b)=>Math.max(+mx[1]*b,+mx[2]);
  const em=/^([\d.]+)em$/.exec(v);if(em)return (b)=>+em[1]*b;
  const px=/^([\d.]+)px$/.exec(v);if(px)return ()=>+px[1];
  throw new Error('unreadable font-size '+v);
 };
 const fontSize=(sel)=>{let f=null;for(const r of rules){if(!r.sels.includes(sel))continue;const m=/(?:^|;)\s*font-size\s*:\s*([^;]+?)\s*(?:;|$)/.exec(r.decl);if(m)f=sizer(m[1]);}assert.ok(f,`${sel} sets a font-size`);return f;};
 const sup=fontSize('.maths-tv .mx .sup'),sub=fontSize('.maths-tv .mx .sub'),fl=fontSize('.maths-tv .mx .mf.l'),fs_=fontSize('.maths-tv .mx .mf.s'),idx=fontSize('.maths-tv .mx .msq-i');
 // every later rule that resizes a script or a fraction part must keep the floor too
 for(const r of rules) for(const s of r.sels){
  if(!/\.(sup|sub|msq-i|mf\.[ls])$/.test(s))continue;const m=/(?:^|;)\s*font-size\s*:\s*([^;]+?)\s*(?:;|$)/.exec(r.decl);if(!m)continue;
  assert.ok(sizer(m[1])(20)>=28,`${s} { font-size: ${m[1]} } loses the 28px floor`);
 }
 const print=46,right=40,hand=72;
 for(const [what,px] of [['a 46 px printed exponent',sup(print)],['a 46 px printed subscript',sub(print)],['a 40 px right-item exponent',sup(right)],
  ['an exponent inside a printed fraction',sup(fl(print))],['an exponent inside a right item\'s fraction',sup(fl(right))],['an exponent inside a small fraction',sup(fs_(print))],
  ['a printed fraction part',fl(print)],['a small printed fraction part',fs_(print)],['a root index in print',idx(print)],
  ['a Tonight row exponent (31 px print)',sup(31)],['a Tonight box exponent (34 px hand)',sup(34)],['a Tonight row exponent (35 px hand)',sup(35)],['a Tonight fraction part (31 px)',fl(31)]])
  assert.ok(px>=28,`${what} computes to ${px.toFixed(1)} px, under the ten-foot floor`);
 // the floor never inflates big text: the hand at 72 px keeps its 60% scripts and 78% fractions
 assert.equal(+sup(hand).toFixed(2),43.2);assert.equal(+sub(hand).toFixed(2),43.2);assert.equal(+fl(hand).toFixed(2),56.16);assert.equal(+idx(hand).toFixed(2),36);
});

test('20: the pen rings the sign the server found, not the first sign that reads the same',()=>{
 const M=require(path.join(root,'src/lib/rules/maths.ts'));
 const V=require(path.join(root,'src/lib/desk/verify.ts'));
 // the reproduction: the slip is the right-hand "- 1"; the left one is correct
 const q='x - 1 = 2',line='2x - 1 = 2 + 2 - 1';
 const at=M.locate(q,[line]);
 assert.deepEqual(at,{line:0,span:'- 1',kind:'sign',nth:1},'locate names the second "- 1"');
 const rels=(nodes)=>count(nodes,'rel');
 const m=T.markLine(line,{kind:'sign',span:'- 1',nth:1});
 assert.equal(m.kind,'sign');assert.equal(rels(m.pre),1,'the ringed "- 1" is after the equals sign');assert.ok(m.mid.some(n=>n.flag));
 // through the paper: the item's slipAt reaches the mark with its occurrence
 const w=W.working({n:1,question:q,studentWorking:line,verdict:'wrong',slipAt:at});
 assert.deepEqual(w.mark,{kind:'sign',span:'- 1',nth:1});
 assert.equal(rels(T.markLine(line,w.mark).pre),1);
 // an old slipAt with no occurrence rings the first match, as before; a single match is unchanged
 assert.equal(rels(T.markLine(line,{kind:'sign',span:'- 1'}).pre),0,'no nth: the first match');
 assert.deepEqual(M.locate('3x - 7 = 11',['3x = 11 - 7','3x = 4','x = 4/3']),{line:0,span:'- 7',kind:'sign'},'one match: no nth, as today');
 assert.equal(rels(T.markLine('3x = 11 - 7',{kind:'sign',span:'- 7'}).pre),1);
 // an occurrence the line does not hold marks the whole line - the pen never guesses
 assert.equal(T.markLine(line,{kind:'sign',span:'- 1',nth:2}).kind,'line');
 // brute force over simple linear lines: wherever locate names a sign, flipping the one the pen rings repairs the line
 let named=0,later=0;
 const sg=['+','-'],num=[1,2,3];
 for(const q2 of ['x - 1 = 2','x + 2 = 5','2x - 1 = 5','3x + 1 = 7','x - 3 = 1'])
  for(const p of [1,2,3])for(const o1 of sg)for(const a of num)for(const b of num)for(const o2 of sg)for(const c of num)for(const o3 of sg)for(const d of num){
   const l=`${p===1?'':p}x ${o1} ${a} = ${b} ${o2} ${c} ${o3} ${d}`;
   const s=M.locate(q2,[l]);if(!s||s.kind!=='sign')continue;
   named++;if(s.nth)later++;
   const mk=T.markLine(l,{kind:'sign',span:s.span,...(s.nth!==undefined?{nth:s.nth}:{})});
   assert.equal(mk.kind,'sign',l);
   // where the ringed span starts in the line: the letters and digits before it are the ones the pen set before it
   const before=alnum(T.flatten(mk.pre)).length;
   let pos=-1;for(let j=0;j<l.length;j++)if(l.startsWith(s.span,j)&&alnum(l.slice(0,j)).length===before){pos=j;break;}
   assert.ok(pos>=0,`${l}: the ringed span is in the line`);
   const fixed=l.slice(0,pos)+(l[pos]==='+'?'-':'+')+l.slice(pos+1),[L,R]=fixed.split('='),x=M.rootOf(q2);
   assert.ok(Math.abs(V.evaluate(L,x)-V.evaluate(R,x))<1e-9,`${q2} | ${l}: flipping the ringed sign (${s.span}, nth ${s.nth??0}) repairs the line`);
  }
 assert.ok(named>=100,`the brute force names a sign on ${named} lines`);assert.ok(later>=20,`${later} of them are a later occurrence`);
});

test('21: the pen never cuts through a TeX construct - a span inside one marks the whole line, a balanced span is still ringed',()=>{
 const {CALCULUS_1}=require(path.join(root,'src/lib/library/calculus1.ts'));
 // each part the pen sets, on its own (a plain "s" before "qrt" is two parts, not the word sqrt)
 const parts=(m)=>m.kind==='line'?[m.nodes]:[m.pre,m.mid,m.post,m.trail];
 const raw=(m)=>{const f=parts(m).map(p=>T.flatten(p));return f.some(x=>/\\|frac|sqrt/.test(x))?f.join(' | '):null;};
 // the live offenders: calc1-log-derivative (c11-w1) and calc1-shape (c14-w1), marked inside a \frac
 const log="y' = \\frac{\\frac{1}{x}\\cdot x - \\ln x \\cdot 1}{x^2}";
 const cut=T.markLine(log,{kind:'sign',span:'- \\ln'});
 assert.equal(cut.kind,'line','a span inside a \\frac argument marks the whole line');assert.equal(raw(cut),null);
 const lim='\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2} = \\lim_{x \\to 0} \\frac{e^x - 1}{2x}';
 assert.equal(T.markLine(lim,{kind:'sign',span:'- 1 - x'}).kind,'line');
 assert.equal(T.markLine(lim,{kind:'extra',span:'x}{x^2} ='}).kind,'line','a span that closes a group it did not open');
 // a \left without its \right inside the span, and a span that starts inside a command's name
 const sq='f(g(x)) = \\left(\\sqrt{x - 3}\\right)^2 + 1';
 assert.equal(T.markLine(sq,{kind:'extra',span:'\\left(\\sqrt{x - 3}'}).kind,'line','a \\left whose \\right is outside the span');
 assert.equal(T.markLine('x = \\frac{\\ln 7}{2}',{kind:'extra',span:'frac{\\ln 7}{2}'}).kind,'line','a span that starts inside \\frac');
 // balanced spans are still ringed: a whole \frac, a whole \left...\right, and a span outside every group
 const whole=T.markLine('\\frac{dy}{dx} = -\\frac{x}{y}',{kind:'sign',span:'-\\frac{x}{y}'});
 assert.equal(whole.kind,'sign');assert.equal(count(whole.mid,'frac'),1);assert.ok(whole.mid.some(n=>n.flag));assert.equal(raw(whole),null);
 const pair=T.markLine(sq,{kind:'extra',span:'\\left(\\sqrt{x - 3}\\right)^2'});
 assert.equal(pair.kind,'extra');assert.equal(count(pair.mid,'sqrt'),1);assert.equal(raw(pair),null);
 const out=T.markLine(lim,{kind:'missing',span:'= \\lim_{x \\to 0}'});assert.equal(out.kind,'missing');assert.equal(count(out.pre,'frac'),1);assert.equal(raw(out),null);
 // brute force: every working line of the Calculus corpus, TeX and plain, marked at every span it holds
 let spans=0,rung=0;const kinds=['sign','extra','missing'];
 for(const topic of CALCULUS_1.topics)for(const ex of topic.examples){
  if(ex.kind!=='working')continue;
  for(const form of [ex.tex,ex.plain])for(const line of (form||'').split('\n')){
   for(let a=0;a<line.length;a++)for(let b=a+1;b<=line.length;b++){
    const span=line.slice(a,b);if(!span.trim())continue;
    const m=T.markLine(line,{kind:kinds[(a+b)%3],span});spans++;if(m.kind!=='line')rung++;
    const bad=raw(m);if(bad!==null)assert.fail(`${ex.id} | ${line} | span ${JSON.stringify(span)} sets ${bad}`);
   }
  }
 }
 assert.ok(spans>=50000,`${spans} spans tried`);assert.ok(rung>=spans/4,`${rung} of ${spans} spans are still ringed`);
});

test('12 (answer line per course): a Calculus item with no working shows its answer as written, never as a value of x; the school line is unchanged',()=>{
 const spec={shape:'derivative',f:'3x^2 + 2x'},lim={shape:'limit',f:'sin(3x)/x',at:'0'};
 assert.deepEqual(W.workingLines({spec,studentWorking:'',studentAnswer:'3x^2 + 2x'}),['3x^2 + 2x']);
 assert.deepEqual(W.workingLines({spec:lim,studentWorking:'',studentAnswer:'3'}),['3'],'a limit of 3 is not x = 3');
 assert.deepEqual(W.workingLines({spec,studentWorking:'',studentAnswer:' 12 '}),['12']);
 assert.deepEqual(W.workingLines({spec,studentWorking:'',studentAnswer:"f'(x) = 6x + 2"}),["f'(x) = 6x + 2"],'what the learner wrote is kept as written');
 assert.deepEqual(W.workingLines({spec,studentWorking:'',studentAnswer:'y = 6x + 2'}),['y = 6x + 2']);
 assert.deepEqual(W.workingLines({spec,studentWorking:''}),[]);
 assert.deepEqual(W.workingLines({spec,studentWorking:'d/dx 3x^2 = 6x\nd/dx 2x = 2',studentAnswer:'6x + 2'}),['d/dx 3x^2 = 6x','d/dx 2x = 2'],'working lines are used as before');
 // the school path, byte for byte
 assert.deepEqual(W.workingLines({studentWorking:'',studentAnswer:'4'}),['x = 4']);
 assert.deepEqual(W.workingLines({studentWorking:'',studentAnswer:'-7/2'}),['x = -7/2']);
 assert.deepEqual(W.workingLines({studentWorking:'',studentAnswer:'x = 4'}),['x = 4']);
 assert.deepEqual(W.workingLines({spec:undefined,studentWorking:'',studentAnswer:'4'}),['x = 4'],'an absent spec is the school path');
 // the walk state the TV draws for a Calculus item holds no invented x
 for(const verdict of ['right','wrong','unsure']){
  const w=W.working({n:1,question:'Find the limit as x → 0 of sin(3x)/x',spec:lim,studentWorking:'',studentAnswer:'3',verdict});
  assert.deepEqual(w.lines,['3'],verdict);assert.ok(w.lines.every(l=>!/x\s*=/.test(l)),`${verdict}: ${JSON.stringify(w.lines)}`);
 }
 assert.deepEqual(W.working({n:1,question:'3x - 7 = 11',studentWorking:'',studentAnswer:'6',verdict:'right'}).lines,['x = 6']);
});

// ---- v2 M4b (2026-10-07): environments set as rows and columns ----
test('M4b: cases, the matrices and aligned are tables of typeset cells, with their delimiters',()=>{
 const one=(s)=>{const n=T.parseMath(s);const t=[];T.walk(n,x=>{if(x.t==='table')t.push(x);});return {n,t};};
 let r=one('f(x) = \\begin{cases} x^2 & x < 0 \\\\ \\sqrt{x} & x \\ge 0 \\end{cases}');
 assert.equal(r.t.length,1);assert.equal(r.t[0].env,'cases');assert.equal(r.t[0].open,'{');assert.equal(r.t[0].close,undefined);
 assert.equal(r.t[0].rows.length,2);assert.equal(r.t[0].rows[0].length,2);assert.equal(T.flatten(r.t[0].rows[1][0]),'√(x)');
 assert.equal(T.isTall(r.n),true,'a table takes three squares');
 r=one('\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}');assert.deepEqual([r.t[0].open,r.t[0].close],['(',')']);assert.equal(T.flatten(r.n),'(1 2; 3 4)');
 r=one('\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\\\ \\end{bmatrix}');assert.equal(r.t[0].rows.length,3,'a trailing \\\\ is not a fourth row');assert.equal(r.t[0].rows[2].length,3);
 r=one('\\begin{vmatrix} 1 & \\frac{1}{2} \\\\ 0 & 1 \\end{vmatrix}');assert.deepEqual([r.t[0].open,r.t[0].close],['|','|']);assert.equal(r.t[0].rows[0][1][0].t,'frac','a cell holds any typesetting');
 r=one('\\begin{aligned} y &= x^2 \\\\ &= x \\cdot x \\end{aligned}');assert.equal(r.t[0].env,'aligned');assert.equal(r.t[0].rows.length,2);
 r=one('\\begin{cases} \\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix} & a \\\\ 0 & b \\end{cases}');assert.equal(r.t.length,2,'a matrix inside cases');assert.equal(r.t[0].rows.length,2,'its rows do not split the outer table');
 r=one('\\begin{matrix} \\{1\\} & 2 \\end{matrix}');assert.equal(r.t[0].rows[0].length,2);
});
test('M4b: an environment the desk does not set as a table reads as it always did; a missing \\end does not throw',()=>{
 assert.equal(T.flatten(T.parseMath('\\begin{weird} x \\end{weird}')),' x ');
 assert.doesNotThrow(()=>T.parseMath('\\begin{pmatrix} 1 & 2'));
 assert.equal(T.parseMath('\\begin{pmatrix} 1 & 2').some(n=>n.t==='table'),false,'no end: not a table');
});
test('M4b: a table renders as a grid with drawn delimiters, in both voices',()=>{
 for(const voice of ['print','hand']){
  const h=html('A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}',voice);
  assert.match(h,/data-role="maths-table"/);assert.match(h,/data-env="bmatrix"/);assert.match(h,/grid-template-columns:repeat\(2, auto\)/);
  assert.equal((h.match(/class="mtab-d /g)||[]).length,2,'two delimiters');assert.equal((h.match(/class="mtab-c"/g)||[]).length,4);
 }
 assert.equal((html('\\begin{cases} 1 & a \\\\ 2 & b \\end{cases}').match(/class="mtab-d /g)||[]).length,1,'cases: a brace on the left only');
});
test('M4c: a Calculus paper ticks the lines the chain checker says hold, leaves a line it cannot tell bare, and the school and linear papers are unchanged',()=>{
 const calc={n:1,question:'Find the derivative of x^2 sin x',spec:{shape:'derivative',f:'x^2 sin x'},studentAnswer:'2x cos x',verdict:'wrong'};
 const lines="f(x) = x^2 sin x\nuse the product rule\nf'(x) = 2x sin x + x^2 cos x\nf'(x) = 2x cos x";
 const w=W.working({...calc,studentWorking:lines,slipAt:{line:3}});
 assert.deepEqual(w.ticks,[true,false,true,false],'line 0 and line 2 hold; the line in words is bare; the pen line is not ticked');
 assert.equal(w.at,3);assert.equal(w.placed,'slipAt');
 const first=W.working({...calc,studentWorking:"f(x) = x^2 sin x\nf'(x) = 2x cos x",slipAt:{line:1}});
 assert.deepEqual(first.ticks,[true,false]);
 const bare=W.working({...calc,studentWorking:'use the product rule\nthen differentiate\n2x cos x',slipAt:{line:2}});
 assert.deepEqual(bare.ticks,[false,false,false],'lines the chain cannot tell get no tick');
 const noChain=W.working({...calc,studentWorking:"f(x) = x^2 sin x\nf'(x) = 2x sin x + x^2 cos x"});
 assert.deepEqual(noChain.ticks,[false,false],'no chain pen: the paper behaves as it did (pen on the answer line, no tick)');assert.equal(noChain.placed,'answer');
 const right=W.working({...calc,verdict:'right',studentWorking:lines});
 assert.deepEqual(right.ticks,[false,false,false,true],'a right Calculus item still ticks its answer line only');
 // school and linear papers: the arithmetic ticks, exactly as before
 const lin={n:2,question:'3x + 7 = 11',studentAnswer:'6',verdict:'wrong'};
 assert.deepEqual(W.working({...lin,studentWorking:'3x = 18\nx = -6',slipAt:{line:1}}).ticks,[true,false]);
 const school={n:3,question:'Work out 3/4 + 1/6',spec:{shape:'compute',expr:'3/4 + 1/6'},studentAnswer:'5/10',verdict:'wrong'};
 assert.deepEqual(W.working({...school,studentWorking:'3/4 = 9/12\n1/6 = 2/12\n9/12 + 2/12 = 5/10',slipAt:{line:2}}).ticks,[true,true,false]);
});
