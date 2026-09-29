/**
 * Math Buddy's television, the pure parts (desk/src/maths/prose.ts, desk/src/tv/mathsRows.ts): the desk's sentences
 * re-spell maths without changing it, the topic path takes "Secure" only from the learner's latched record, and a
 * line too long for the paper is fitted to it. Run with npm test in desk/ (directly: node tools/maths-tv-test.cjs).
 * Pure: no store, no route, no model, no browser.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
// loaded per test, so a missing module fails each case on its own
const P=()=>require(path.join(root,'src/maths/prose.ts'));
const T=()=>require(path.join(root,'src/maths/typeset.ts'));
const R=()=>require(path.join(root,'src/tv/mathsRows.ts'));

const NB=' ';
/** The digits of a string in order, a superscript or subscript digit read as its digit. */
const digits=(s)=>[...String(s)].map(c=>{const u='⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c),d='₀₁₂₃₄₅₆₇₈₉'.indexOf(c);return u>=0?String(u):d>=0?String(d):c;}).filter(c=>/[0-9]/.test(c)).join('');

// ---------------------------------------------------------------- 1. prose: exponents and TeX in a caption

test('prose 1: a braced power is printed whole or not at all - never a partial superscript',()=>{
 const {prose}=P();
 assert.equal(prose('x^{n+1}'),'xⁿ⁺¹','the power-rule exponent is raised whole');
 assert.equal(prose('x^{-1/2}'),'x^(−1/2)','a power with no printed superscript form stays on the line, bracketed, with a real minus');
 assert.equal(prose('e^(2x)'),'e²ˣ','a bracketed power');
 assert.equal(prose('x^2y'),'x²y','an unbraced power is one number: the y stays on the line');
 assert.equal(prose('x^2x'),'x²x','an unbraced power is one number, or one letter');
 assert.equal(prose('x^n'),'xⁿ');
 assert.equal(prose('x^-1'),'x⁻¹');
 assert.equal(prose('x^10'),'x¹⁰');
 assert.equal(prose('x**2 + 1'),`x²${NB}+${NB}1`,'** is a power');
 assert.equal(prose('**Solve** it'),'Solve it','** round a word is markdown bold');
});

test('prose 2: the Calculus 1 hint reads cleanly - the power rule, nothing left dangling',()=>{
 const {prose}=P();
 const h=prose('Use the power rule: the derivative of x^n is n x^{n-1}, so x^{n+1} becomes (n+1)x^n.');
 assert.ok(!/[{}^]/.test(h),`no brace or caret is left over: ${h}`);
 assert.ok(h.includes('xⁿ⁻¹')&&h.includes('xⁿ⁺¹'),h);
 assert.equal(prose('the derivative of x^{-1/2} is -1/2 x^{-3/2}'),`the derivative of x^(−1/2) is −1/2 x^(−3/2)`);
});

test('prose 3: "x = −7" keeps its non-breaking spaces and its real minus',()=>{
 const {prose}=P();
 assert.equal(prose('x = -7'),`x${NB}=${NB}−7`);
 assert.equal(prose('3x - 7 = 11'),`3x${NB}−${NB}7${NB}=${NB}11`);
 assert.equal(prose('so x = -7 or x = 5.'),`so x${NB}=${NB}−7 or x${NB}=${NB}5.`);
});

test('prose 4: TeX in a caption never shows a raw backslash command',()=>{
 const {prose}=P();
 assert.equal(prose('$\\frac12$'),'1/2');
 assert.equal(prose('take $\\frac{1}{2}$ of both sides'),'take 1/2 of both sides');
 assert.equal(prose('$\\frac{n+1}{2}$'),'(n+1)/2','a numerator with an operator keeps its bracket');
 assert.equal(prose('$\\frac{dy}{dx} = 3x^2$'),`dy/dx${NB}=${NB}3x²`);
 assert.equal(prose('$x^{\\frac12}$'),'x^(1/2)','a fraction in a power stays readable');
 assert.equal(prose('$\\sqrt{x+1}$ and $\\sqrt{x}$'),'√(x+1) and √x');
 assert.equal(prose('$\\sqrt[3]{8}$'),'³√8','a root index is kept (as a raised digit)');
 assert.equal(prose('$2 \\cdot 3$, $a \\times b$, $x \\le 4$, $\\theta$, $\\pi r^2$'),`2${NB}·${NB}3, a${NB}×${NB}b, x${NB}≤${NB}4, θ, π r²`);
 assert.equal(prose('$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$'),`lim_(x${NB}→${NB}0) (sin x)/x${NB}=${NB}1`,'a limit\'s subscript with no printed form stays on the line, bracketed; a spaced numerator keeps a bracket');
 assert.equal(prose('$\\text{area} = \\pi r^2$'),`area${NB}=${NB}π r²`);
 assert.equal(prose('$\\left( x+1 \\right)^2$'),'( x+1 )²');
 assert.equal(prose('$\\int x\\,dx$'),'∫ x dx');
 assert.equal(prose('$\\log_{2} 8 = 3$'),`log₂ 8${NB}=${NB}3`,'a subscript with a printed form is lowered');
 assert.equal(prose('$\\foo{x}$'),'foo x','a command the desk does not know keeps its name as a word');
 for(const s of ['$\\frac12$','$\\alpha + \\beta$','$\\sqrt{2}$','\\quad x \\, y','$\\mathrm{d}x$','$\\left\\{1,2\\right\\}$','$\\displaystyle\\sum_{i=1}^{n} i$','$\\foo\\bar$'])
  assert.ok(!/\\/.test(prose(s)),`no backslash survives: ${JSON.stringify(s)} -> ${JSON.stringify(prose(s))}`);
});

test('prose 5: prose only re-spells characters - never adds, drops or reorders a digit',()=>{
 const {prose}=P();
 const CORPUS=['x^{n+1}','x^{-1/2}','e^(2x)','x^2y','x = -7','3x - 7 = 11','$\\frac12$','$\\frac{12}{35}$','$\\sqrt[3]{27}$','x^{10} + 2^{3}',
  'Number 4: 2(x - 3) = 10 so x = 8','$\\log_{10} 1000 = 3$','a_{n+1} = 2a_n','x^{2.5}','$x^{-1/2}$','x**-3','sum from 1 to 10','x^{12x}','$\\frac{d}{dx}x^{3} = 3x^{2}$'];
 for(const s of CORPUS) assert.equal(digits(prose(s)),digits(s),`digits in = digits out for ${JSON.stringify(s)} -> ${JSON.stringify(prose(s))}`);
});

test('prose 6: the maths reader reads the respelled power as the same maths as the original',()=>{
 const {prose}=P(),{parseMath,flatten}=T();
 const same=(a,b)=>assert.equal(flatten(parseMath(a)).replace(/\s+/g,''),flatten(parseMath(b)).replace(/\s+/g,''),`${a} and ${b} read the same`);
 for(const s of ['x^{n+1}','x^{-1/2}','e^(2x)','x^2y','x^{2n}','x^-1','x^10']) same(prose(s),s);
});

// ---------------------------------------------------------------- 2. the ruler: one rule for "Secure"

const rec=(topic,estimate,secure,seen=6)=>({topic,seen,right:Math.round(seen*estimate),estimate,secure,lastSeen:0,slips:[]});
/** A marked set on `topic` with `right` of six right. */
const tonight=(topic,right)=>({topic,marked:true,items:Array.from({length:6},(_,k)=>({n:k+1,question:`x + ${k} = ${k+3}`,verdict:k<right?'right':'wrong'}))});
const TS=(skills,practice=null,topic=null)=>({skills,practice,topic});

test('ruler 1: tonight\'s 5 of 6 right does not make a topic Secure - only the latched record does',()=>{
 const {topicStates,stateWord}=R();
 const s=TS({'linear-one-step':rec('linear-one-step',0.58,false)},tonight('linear-one-step',5),'linear-one-step');
 const st=topicStates(s);
 assert.notEqual(st['linear-one-step'],'secure','the groove is hatched, so the word is not Secure');
 assert.equal(stateWord(s,'linear-one-step',st),'In progress');
 const s2=TS({'linear-one-step':rec('linear-one-step',0.9,true)},tonight('linear-one-step',5),'linear-one-step');
 const st2=topicStates(s2);
 assert.equal(st2['linear-one-step'],'secure');
 assert.equal(stateWord(s2,'linear-one-step',st2),'Secure');
 // the same record without tonight's set: the word never depends on the set
 assert.equal(stateWord(TS({'linear-one-step':rec('linear-one-step',0.9,true)}),'linear-one-step',topicStates(TS({'linear-one-step':rec('linear-one-step',0.9,true)}))),'Secure');
 assert.equal(stateWord(TS({}),'linear-two-step',topicStates(TS({}))),'Not started');
});

test('ruler 2: "next" is derived only from latched secure topics',()=>{
 const {topicStates}=R();
 assert.equal(topicStates(TS({'linear-one-step':rec('linear-one-step',0.58,false)},tonight('linear-one-step',6)))['linear-two-step'],'later','a perfect set tonight does not open the next topic on its own');
 assert.equal(topicStates(TS({'linear-one-step':rec('linear-one-step',0.9,true)}))['linear-two-step'],'next');
 assert.equal(topicStates(TS({}))['linear-one-step'],'next','a topic with no prerequisites is next from the start');
});

test('ruler 3: the TV no longer re-decides Secure from a count of right answers',()=>{
 const src=fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`])\/\/.*$/gm,'$1');
 assert.ok(!/>=\s*5/.test(src),'MathsTV.tsx holds no ">= 5" rule');
 assert.ok(!/function topicStates/.test(src),'topicStates lives in tv/mathsRows.ts');
 assert.ok(/topicStates/.test(src)&&/from "@\/tv\/mathsRows"/.test(src),'MathsTV.tsx reads the states from tv/mathsRows.ts');
});

// ---------------------------------------------------------------- 3. a long line is fitted to the paper

/** The usable width of a row on the Walk's paper: 1130 px of paper less the 144 px margin, less the pen's overhang. */
const ROOM=1130-144-16;
/** A line measured the way the browser does: every em scales, but scripts never compute under 28 px (the floor). */
const measure=(chars,scripts=0)=>(px)=>chars*0.46*px+scripts*0.6*Math.max(0.6*px,28);

test('fit 1: a 40-character working line at 72 px is fitted inside the paper, never under 28 px',()=>{
 const {fitRow,FIT_FLOOR}=R();
 assert.equal(FIT_FLOOR,28);
 const w=measure(40,3);
 assert.ok(w(72)>ROOM,`the line overflows at 72 px (${w(72)} > ${ROOM})`);
 const f=fitRow(72,ROOM,w);
 assert.equal(f.wrap,false);
 assert.ok(f.size>=28&&f.size<72,`fitted to ${f.size} px`);
 assert.ok(w(f.size)<=ROOM,`scrollWidth ${w(f.size)} <= ${ROOM} after fitting`);
 assert.ok(w(f.size+2)>ROOM||f.size+2>72,'and as large as it can be, to the 2 px step');
});

test('fit 2: a 72 px line that already fits is unchanged, and measured once',()=>{
 const {fitRow}=R();
 let calls=0;const w=(px)=>{calls++;return measure(18)(px);};
 assert.deepEqual(fitRow(72,ROOM,w),{size:72,wrap:false});
 assert.equal(calls,1);
 assert.deepEqual(fitRow(46,ROOM,measure(30)),{size:46,wrap:false},'a printed question that fits');
});

test('fit 3: a line that cannot fit at 28 px stays at 28 px and wraps',()=>{
 const {fitRow}=R();
 const w=measure(120);
 assert.ok(w(28)>ROOM);
 assert.deepEqual(fitRow(72,ROOM,w),{size:28,wrap:true});
 assert.deepEqual(fitRow(24,ROOM,measure(200)),{size:24,wrap:true},'a size already under the floor is never inflated');
 assert.deepEqual(fitRow(72,0,measure(10)),{size:72,wrap:false},'no measured room (not laid out yet): left as it is');
});

test('fit 4: the "=" margin comes out of the room, so an aligned continued line still fits',()=>{
 const {fitRow}=R();
 const w=measure(30),margin=300;
 const f=fitRow(72,ROOM-margin,w);
 assert.ok(w(f.size)+margin<=ROOM,`${w(f.size)} + ${margin} <= ${ROOM}`);
});

test('fit 5: the paper wires the fit - MathsTV measures each row with fitRow, the CSS has the wrap and no fixed 40 px on the maths',()=>{
 const strip=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`])\/\/.*$/gm,'$1');
 const tv=strip(fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8'));
 assert.ok(/fitRow\(/.test(tv)&&/import \{[^}]*fitRow[^}]*\} from "@\/tv\/mathsRows"/.test(tv),'MathsTV.tsx calls fitRow from tv/mathsRows.ts');
 const css=strip(fs.readFileSync(path.join(root,'src/design/maths-lamplight.css'),'utf8'));
 assert.ok(/\.mb-row\[data-fit="wrap"\]/.test(css),'a row that cannot fit at the floor wraps');
 assert.ok(!/\.mx\.print\s*\{[^}]*font-size:\s*40px/.test(css),'the right item sets its size on the row, so a fitted size reaches the maths');
});

// ---------------------------------------------------------------- 4. the Practice paper, and rows of whole squares

const stripSrc=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`\\])\/\/.*$/gm,'$1');
const tvSrc=()=>stripSrc(fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8'));
const cssSrc=()=>stripSrc(fs.readFileSync(path.join(root,'src/design/maths-lamplight.css'),'utf8'));
/** The body of one function in MathsTV.tsx, up to the next top-level function. */
const fnBody=(src,name)=>{const i=src.search(new RegExp(`function ${name}\\b`));assert.ok(i>=0,`MathsTV.tsx has ${name}`);const j=src.slice(i+1).search(/\n(?:export )?function /);return src.slice(i,j<0?undefined:i+1+j);};

test('fit 6: a printed Practice question (52 px) takes the same fit - it shrinks, never under 28 px, and wraps only when 28 px is too wide',()=>{
 const {fitRow}=R();
 const PRACTICE_ROOM=1140-144-16;
 // calc1-extrema: 1644 px at 52 px
 const w=(px)=>1644*px/52;
 const f=fitRow(52,PRACTICE_ROOM,w);
 assert.equal(f.wrap,false);assert.ok(f.size>=28&&w(f.size)<=PRACTICE_ROOM,`fitted to ${f.size} px`);
 // calc1-definite-integral: 1805 px at 52, its scripts already at the floor, so 28 px is still too wide
 const w2=(px)=>1805*px/52+120*(1-px/52)*3;
 assert.deepEqual(fitRow(52,PRACTICE_ROOM,w2),{size:28,wrap:true});
});

test('rows 1: a line taller than its squares grows to the next whole square, never under its own minimum',()=>{
 const {rowSquares,SQUARE}=R();
 assert.equal(SQUARE,48,'the paper\'s square (--mb-sq)');
 assert.equal(rowSquares(172,48,3),4,'calc1-newton: a 172 px hand line in a three-square row takes four');
 assert.equal(rowSquares(150,48,2),4,'150 px is more than three squares');
 assert.equal(rowSquares(90,48,2),2,'a short line keeps its two squares');
 assert.equal(rowSquares(120,48,3),3,'a tall row never shrinks under three');
 assert.equal(rowSquares(144.6,48,3),3,'a sub-pixel over its row is not a new square');
 assert.equal(rowSquares(0,48,2),2,'nothing measured: the minimum');
 assert.equal(rowSquares(105,40,3),3,'on smaller squares');
});

test('rows 2: the Practice paper keeps all six questions inside the safe zone by taking smaller squares, largest first',()=>{
 const {paperSquare,PAPER_SQUARES}=R();
 assert.equal(PAPER_SQUARES[0],48,'the first try is the paper as drawn');
 assert.ok(PAPER_SQUARES.every((x,i)=>i===0||x<PAPER_SQUARES[i-1]),'largest first');
 const six=(h,min)=>Array.from({length:6},()=>({h,min}));
 // calc1-limit-laws: six limits, each about 105 px, each a tall (three-square) row; 3 squares of chrome
 assert.equal(paperSquare(six(105,3),3,864),40,'(3 + 18) x 40 = 840 <= 864; at 42 it is 882');
 assert.equal(paperSquare(six(40,2),3,864),48,'six plain questions fit on the paper as drawn');
 assert.equal(paperSquare(six(400,2),3,864),PAPER_SQUARES[PAPER_SQUARES.length-1],'nothing fits: the smallest square');
});

test('rows 3: the Practice screen is fitted by usePaper like the Sheet and the Walk, row heights are whole squares, and a wrapped line breaks a long token',()=>{
 const tv=tvSrc();
 assert.match(fnBody(tv,'PracticeScreen'),/usePaper\(/,'PracticeScreen measures its paper with usePaper');
 assert.match(fnBody(tv,'PracticeScreen'),/ref=\{pan\}/,'and hands it the paper');
 assert.match(fnBody(tv,'usePaper'),/fitRows\(/,'usePaper lays the rows with fitRows');
 assert.match(fnBody(tv,'fitRows'),/fitRow\(/,'which fits each line (fitRow)');
 assert.match(fnBody(tv,'fitRows'),/rowSquares\(/,'and rounds each row to whole squares in the same pass (tv/mathsRows.ts rowSquares)');
 assert.match(fnBody(tv,'usePaper'),/paperSquare\(/,'and a paper with a room to it is fitted, not panned (paperSquare)');
 const css=cssSrc();
 assert.match(css,/\.mb-row\[data-fit="wrap"\][^{]*\.mx[^{]*\{[^}]*overflow-wrap:\s*anywhere/,'a row wrapped at the floor breaks an unbreakable token');
 assert.match(css,/\.mb-row\.q\.wrap[^{]*\.mx[^{]*\{[^}]*overflow-wrap:\s*anywhere/,'so does a printed line that wraps at its word spaces');
 assert.doesNotMatch(css.replace(/\.mb-row(\[data-fit="wrap"\]|\.q\.wrap)[^{]*\{[^}]*\}/g,''),/overflow-wrap:\s*anywhere/,'and a normal fitted line is left as it is');
});

// ---------------------------------------------------------------- 5. marking and explaining, on the TV

const job=(phase,extra={})=>({id:'j-'+phase,phase,startedAt:1000,...(phase==='running'?{}:{endedAt:2000}),...extra});
const unmarked={topic:'linear-one-step',marked:false,items:[{n:1,question:'x + 1 = 3'}]};
const markedSet={topic:'linear-one-step',marked:true,items:[{n:1,question:'x + 1 = 3',verdict:'unsure'},{n:2,question:'x + 2 = 5',verdict:'wrong'}]};

test('jobs 1: while the set is being marked Practice says so; a failed mark shows its own sentence and that snapping again tries again',()=>{
 const {markLine}=R();
 assert.equal(markLine({practice:unmarked,jobs:{}}),null,'nothing asked: the caption is unchanged');
 const run=markLine({practice:unmarked,jobs:{mark:job('running')}});
 assert.equal(run.phase,'running');assert.match(run.text,/marking the set/,run.text);
 assert.doesNotMatch(run.text,/\d+\s*(s|sec|seconds|min)/,'no invented timer');
 const bad=markLine({practice:unmarked,jobs:{mark:job('failed',{error:'The desk could not mark the set. It took too long.'})}});
 assert.equal(bad.phase,'failed');
 assert.ok(bad.text.startsWith('The desk could not mark the set. It took too long.'),`the job's own sentence first: ${bad.text}`);
 assert.match(bad.text,/[Ss]nap(ping)? the sheet again/,'and that snapping again tries again');
 const plain=markLine({practice:unmarked,jobs:{mark:job('failed',{error:'The desk could not mark the set. Try again.'})}});
 assert.doesNotMatch(plain.text,/Try again\..*Snap/,'"Try again." is not said twice: the snap line says how');
 assert.equal(markLine({practice:unmarked,jobs:{mark:job('done')}}),null,'a done mark: unchanged');
});

test('jobs 2: a failed mark belongs to the set it was for - a newer set, or a marked set, shows none',()=>{
 const {markLine}=R();
 const failed=job('failed',{error:'The desk could not mark the set. Try again.'});
 assert.equal(markLine({practice:unmarked,jobs:{mark:failed,practice:{id:'p',phase:'done',startedAt:2500,endedAt:3000}}}),null,'a set written after the failed mark');
 assert.notEqual(markLine({practice:unmarked,jobs:{mark:failed,practice:{id:'p',phase:'done',startedAt:100,endedAt:500}}}),null,'the set the mark failed on');
 assert.equal(markLine({practice:markedSet,jobs:{mark:job('running')}}),null,'a marked set is on the sheet, not waiting');
 assert.equal(markLine({practice:null,jobs:{mark:job('running')}}),null);
});

test('jobs 3: while an explanation runs the open item shows the desk thinking; a failed one shows its sentence; only for its own item',()=>{
 const {explainLine}=R();
 assert.equal(explainLine({practice:markedSet,jobs:{}},1),null,'nothing asked: unchanged');
 const run=explainLine({practice:markedSet,jobs:{explain:job('running',{key:'1'})}},1);
 assert.equal(run.phase,'running');assert.match(run.text,/^The desk is /,run.text);
 assert.equal(explainLine({practice:markedSet,jobs:{explain:job('running',{key:'1'})}},2),null,'another item on the walk: unchanged');
 const bad=explainLine({practice:markedSet,jobs:{explain:job('failed',{key:'2',error:'The desk could not follow that. It took too long.'})}},2);
 assert.deepEqual(bad,{phase:'failed',text:'The desk could not follow that. It took too long.'},'the job\'s own sentence, nothing added');
 assert.equal(explainLine({practice:markedSet,jobs:{explain:job('done',{key:'1'})}},1),null);
 assert.equal(explainLine({practice:markedSet,jobs:{explain:job('failed',{key:'1',error:'x'}),mark:{id:'m',phase:'done',startedAt:2500,endedAt:3000}}},1),null,'a failure from a set marked before this one is not shown');
});

test('jobs 4: MathsTV draws the two states from tv/mathsRows.ts in the desk\'s voice, and adds no stop',()=>{
 const tv=tvSrc();
 assert.match(tv,/import \{[^}]*markLine[^}]*\} from "@\/tv\/mathsRows"/,'markLine from tv/mathsRows.ts');
 assert.match(tv,/import \{[^}]*explainLine[^}]*\} from "@\/tv\/mathsRows"/,'explainLine from tv/mathsRows.ts');
 assert.match(fnBody(tv,'PracticeScreen'),/markLine\(/,'the Practice caption reads markLine');
 assert.match(fnBody(tv,'Walk'),/explainLine\(/,'the Walk reads explainLine');
 assert.match(tv,/data-role="maths-job"/,'the state line has a hook');
 assert.doesNotMatch(tv.match(/function JobNote[\s\S]*?\n}/)?.[0]??'',/data-focused/,'the state line is not a stop');
 const css=cssSrc();
 assert.match(css,/\.mb-job\s*\{[^}]*font-family:\s*var\(--mb-sans\)/,'set in Manrope, the desk\'s voice');
});
