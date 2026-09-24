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
const T=require(path.join(root,'src/maths/typeset.ts'));
const W=require(path.join(root,'src/maths/working.ts'));

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
 assert.equal(W.lineOfPoints('the second line',3),1);assert.equal(W.lineOfPoints('the last line',3),2);assert.equal(W.lineOfPoints('the first line of working',3),0);
 assert.equal(W.lineOfPoints('the line where the term moved',3),null,'a place, not a line');assert.equal(W.lineOfPoints('the third line',2),null,'a line the working does not have');
 const base={n:1,question:'3x - 7 = 11',studentWorking:'3x = 11 - 7\n3x = 4\nx = 4/3'};
 const right=W.working({...base,verdict:'right'});assert.deepEqual(right.ticks,[false,false,true],'right: the answer line is ticked, nothing else claimed');assert.equal(right.mark,null);
 const unsure=W.working({...base,verdict:'unsure'});assert.equal(unsure.mark,null);assert.ok(unsure.ticks.every(x=>!x));
 const pts=W.working({...base,verdict:'wrong',slip:'sign-lost-moving'},'the second line');
 assert.equal(pts.at,1);assert.deepEqual(pts.mark,{kind:'line'});assert.deepEqual(pts.ticks,[true,false,false]);assert.equal(pts.placed,'points');
 const place=W.working({...base,verdict:'wrong',slip:'sign-lost-moving'},'the line where the term moved');
 assert.equal(place.at,2,'no line named: the answer line, which the verdict is about');assert.equal(place.placed,'answer');assert.ok(place.ticks.every(x=>!x));
 const at=W.working({...base,verdict:'wrong',slip:'sign-lost-moving',slipAt:{line:0,span:'- 7',kind:'sign'}},'the second line');
 assert.equal(at.at,0);assert.deepEqual(at.mark,{kind:'sign',span:'- 7'});assert.equal(at.placed,'slipAt','a named place wins over the rulebook');
 const check=W.working({...base,verdict:'wrong',slip:'answer-not-checked'},'the original equation');
 assert.equal(check.mark.kind,'missing');assert.equal(check.at,2,'the check belongs after the last line');
 assert.equal(W.working({...base,verdict:'wrong',slipAt:{line:9,kind:'sign',span:'x'}}).placed,'answer','a line past the working is not trusted');
});
