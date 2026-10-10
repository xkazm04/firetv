/**
 * Math Buddy's television, the pure parts (desk/src/maths/prose.ts, desk/src/tv/mathsRows.ts): the desk's sentences
 * re-spell maths without changing it, the topic path takes "Secure" only from the learner's latched record, and a
 * line too long for the paper is fitted to it. Run with npm test in desk/ (directly: node tools/maths-tv-test.cjs).
 * Pure, except one case that runs the reducer and a stubbed text provider on a temp data dir: no route, no live model, no browser.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
// the settled-reply case below runs explainItem, which writes the learner record: a temp data dir, never desk/data
process.env.DESK_DATA_DIR=path.join(require('node:os').tmpdir(),`desk-maths-tv-${process.pid}-${Date.now()}`);
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

test('prose 7: a caption spells the bars, the norm and a cases brace the reader draws',()=>{
 const {prose}=P(),{parseMath,flatten}=T();
 const same=(src)=>{
  const said=prose(src);
  assert.ok(!/\\/.test(said),`no backslash survives: ${JSON.stringify(src)} -> ${JSON.stringify(said)}`);
  assert.doesNotMatch(said,/\b(?:lvert|rvert|lVert|rVert|Vert|vert|langle|rangle|Leftarrow|abs|norm|mid)\b/,said);
  assert.equal(flatten(parseMath(said)).replace(/\s+/g,''),flatten(parseMath(src)).replace(/\s+/g,''),`${JSON.stringify(src)} -> ${JSON.stringify(said)}`);
 };
 // the twelve commands typeset.ts draws as a glyph and prose used to spell (calc pages c01-p1, c05-p2, c06-q1, c19-p2)
 for(const s of [
  '$\\lvert x \\rvert$',
  '$\\vert x$',
  '$\\lVert v \\rVert$',
  '$\\Vert v$',
  '$\\langle a, b \\rangle$',
  '$A \\Leftarrow B$',
  '$x \\mid y$',
  '$\\abs{x - 1}$',
  '$\\norm{v}$',
  '$\\begin{cases} cx + 1 & x < 2 \\\\ x^2 - c & x \\ge 2 \\end{cases}$',
 ]) same(s);
 assert.equal(prose('$\\sqrt[3]{8}$'),'³√8','a root index stays the printed caption the suite already pins');
 for(const s of ['$\\lvert x - 2 \\rvert - 1$','$\\abs{x - 1}$','$\\begin{cases} cx + 1 & x < 2 \\\\ x^2 - c & x \\ge 2 \\end{cases}$'])
  assert.equal(digits(prose(s)),digits(s),`digits in = digits out for ${s}`);
});

test('prose 8: every printed superscript and subscript is raised, and the reader reads it back',()=>{
 const {prose}=P(),{parseMath,flatten}=T();
 // typeset.ts SUP and SUB. A missing glyph falls back to a bracket the reader also accepts, so the glyph itself has to be required.
 const sup={"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","+":"⁺","-":"⁻","−":"⁻","=":"⁼","(":"⁽",")":"⁾",n:"ⁿ",x:"ˣ",y:"ʸ",i:"ⁱ",k:"ᵏ",a:"ᵃ",b:"ᵇ",t:"ᵗ"};
 const sub={"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","+":"₊","-":"₋","−":"₋","=":"₌","(":"₍",")":"₎",x:"ₓ",n:"ₙ",a:"ₐ",i:"ᵢ",k:"ₖ"};
 for(const [c,g] of Object.entries(sup)){
  const src=`x^{${c}}`, said=prose(src);
  assert.ok(said.includes(g),`${JSON.stringify(src)} should print ${g}, got ${JSON.stringify(said)}`);
  assert.equal(flatten(parseMath(said)).replace(/\s+/g,''),flatten(parseMath(src)).replace(/\s+/g,''),src);
 }
 for(const [c,g] of Object.entries(sub)){
  const src=`x_{${c}}`, said=prose(src);
  assert.ok(said.includes(g),`${JSON.stringify(src)} should print ${g}, got ${JSON.stringify(said)}`);
  assert.equal(flatten(parseMath(said)).replace(/\s+/g,''),flatten(parseMath(src)).replace(/\s+/g,''),src);
 }
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

test('jobs 3b (P14): a running mark or explanation of the learner who left is not shown to the seated learner; their own and a job with no by are',()=>{
 const {markLine,explainLine,MARKING,THINKING}=R();
 const B={id:'bea',name:'Bea'};
 assert.equal(markLine({learner:B,practice:unmarked,jobs:{mark:job('running',{by:'adam'})}}),null,'the mark of A is running, B has an unmarked set');
 assert.equal(explainLine({learner:B,practice:markedSet,jobs:{explain:job('running',{key:'1',by:'adam'})}},1),null,'the explain of A is running on item 1, B is on item 1');
 assert.equal(markLine({learner:B,practice:unmarked,jobs:{mark:job('running',{by:'bea'})}}).text,MARKING,'the own mark of B');
 assert.equal(explainLine({learner:B,practice:markedSet,jobs:{explain:job('running',{key:'1',by:'bea'})}},1).text,THINKING,'the own explain of B');
 assert.equal(markLine({learner:B,practice:unmarked,jobs:{mark:job('running')}}).text,MARKING,'no by: as today');
 assert.equal(explainLine({learner:B,practice:markedSet,jobs:{explain:job('running',{key:'1'})}},1).text,THINKING,'no by: as today');
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

// ---------------------------------------------------------------- 6. counts and weeks from the data, not hand-kept lists

test('data 1: a count above the word list is written in digits, never "undefined"',()=>{
 const {countWord,secureTitle}=R();
 assert.equal(countWord(1),'One');assert.equal(countWord(5),'Five');
 assert.equal(countWord(7),'7');assert.equal(countWord(12),'12');
 assert.equal(secureTitle(7,9),'7 of 9 topics secure');
 assert.equal(secureTitle(12,20),'12 of 20 topics secure');
 assert.equal(secureTitle(2,3),'Two of 3 topics secure','today\'s wording is kept');
 assert.equal(secureTitle(3,3),'Every topic on the path is secure');
 for(const n of [0,1,6,7,12,40])assert.doesNotMatch(secureTitle(n,41),/undefined/);
});

test('data 2: the first evening\'s title is the first topic on the path, from the syllabus',()=>{
 const {secureTitle}=R();const {SYLLABUS}=require(path.join(root,'src/lib/library/syllabus.ts'));
 // owner decision 2026-09-29: the school path's first evening reads the path's name, not its first topic; W5b renamed the
 // path 'School maths' (decision D5), so the title is 'School maths, from the first step'
 assert.equal(secureTitle(0,SYLLABUS.length),'School maths, from the first step');
 assert.equal(secureTitle(0,5,'Limits'),'Limits, from the first step','whatever the first topic is');
});

test('data 3: the calendar\'s weeks come from the lesson count - three a week, the last shorter - so every focusable lesson is drawn',()=>{
 const {calendarWeeks}=R();
 assert.deepEqual(calendarWeeks(8),[['Week 1',0,3],['Week 2',3,6],['Week 3',6,8]],'today\'s eight lessons: the weeks as before');
 assert.deepEqual(calendarWeeks(9),[['Week 1',0,3],['Week 2',3,6],['Week 3',6,9]]);
 const w14=calendarWeeks(14);
 assert.equal(w14.length,5);assert.deepEqual(w14[4],['Week 5',12,14]);
 for(const n of [0,1,8,9,14]){
  const drawn=calendarWeeks(n).flatMap(([,a,b])=>Array.from({length:b-a},(_,k)=>a+k));
  assert.deepEqual(drawn,Array.from({length:n},(_,i)=>i),`every one of ${n} lessons drawn once, in order`);
 }
});

test('data 4: MathsTV keeps no hand list - no COUNT, no fixed weeks, no literal first-evening title',()=>{
 const tv=tvSrc();
 assert.doesNotMatch(tv,/const COUNT\b/,'no COUNT word list');
 assert.doesNotMatch(tv,/HOW_MANY\b/,'no second count word list beside the sheet');
 assert.doesNotMatch(tv,/\["Week 1",\s*0,\s*3\]/,'no fixed weeks');
 assert.doesNotMatch(tv,/(Linear equations|School maths), from the first step/,'no literal title');
 assert.match(fnBody(tv,'Calendar'),/calendarWeeks\(list\.length\)/,'the weeks are the lesson count\'s');
 assert.match(fnBody(tv,'Tonight'),/secureTitle\(/,'the title is secureTitle\'s');
});

// ---------------------------------------------------------------- 7. the Practice card counts the questions it is about

test('count 1: the Practice card says how many questions to work, not a literal "all six"',()=>{
 const {workWhat}=R();
 assert.equal(workWhat(6),'all six');assert.equal(workWhat(3),'all three');assert.equal(workWhat(10),'all ten');
 assert.equal(workWhat(2),'both');assert.equal(workWhat(1),'the question');
 assert.equal(workWhat(11),'all 11','past ten the count is digits');
 for(const n of [0,1,2,3,6,10,11,40])assert.doesNotMatch(workWhat(n),/undefined|NaN/);
 const tv=stripSrc(fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8'));
 assert.doesNotMatch(tv,/Work all six/,'no literal count in the card');
 assert.match(tv,/Work \{workWhat\(p\.items\.length\)\} on paper, then snap the whole sheet with the phone/,'the card says the set\'s own count and still asks for the phone in its own copy (the hand-off test reads it there)');
});

test('count 2: the marked sheet\'s headline uses the same counts as the Practice card',()=>{
 const {sheetHead}=R();
 assert.equal(sheetHead(0,1),'All of it right','one question, all of it right');
 assert.equal(sheetHead(0,2),'Both right');
 assert.equal(sheetHead(0,6),'All six right');
 assert.equal(sheetHead(0,10),'All ten right');
 assert.equal(sheetHead(0,11),'All 11 right','past ten the count is digits');
 assert.equal(sheetHead(1,6),'One to look at');
 assert.equal(sheetHead(2,6),'Two to look at');
 assert.equal(sheetHead(6,6),'Six to look at');
 assert.equal(sheetHead(10,11),'Ten to look at');
 assert.equal(sheetHead(11,11),'11 to look at');
 for(const [look,total] of [[0,1],[0,2],[0,6],[0,11],[1,6],[2,6],[6,6],[11,11]])
  assert.doesNotMatch(sheetHead(look,total),/undefined|NaN|All one right|All two right/);
 const tv=tvSrc();
 assert.match(fnBody(tv,'Sheet'),/sheetHead\(look,\s*tiles\.length\)/,'Sheet asks sheetHead for the headline');
});

// ---------------------------------------------------------------- 8. the TV reads the learner's path (lib/library/paths.ts)

const CALC=[{id:'ada',name:'Ada',type:'other',modules:['maths'],mathPath:'calc1'}],SCHOOL=[{id:'ben',name:'Ben',type:'high-school',modules:['maths']}];
/** A session on a path: the learner at the desk and their skills. */
const onPath=(profiles,skills,topic=null)=>({skills,topic,practice:null,profiles,learner:{id:profiles[0].id,name:profiles[0].name}});
const calcIds=()=>require(path.join(root,'src/lib/library/paths.ts')).topicsOf('calc1').map(t=>t.id);
/** The path lengths, derived (the one pin per path is in tools/maths-paths-test.cjs). */
const nSchool=()=>require(path.join(root,'src/lib/library/paths.ts')).PATHS.school.topics.length;
const nCalc=()=>require(path.join(root,'src/lib/library/paths.ts')).PATHS.calc1.topics.length;

test('path 1: on the calc1 path the states are the Calculus topics - a latched calc1-functions opens the topics whose only prereq it is',()=>{
 const {topicStates,stateWord}=R();
 const s=onPath(CALC,{'calc1-functions':rec('calc1-functions',0.9,true)});
 const st=topicStates(s);
 assert.deepEqual(Object.keys(st),calcIds(),'one state per topic on the learner\'s path, in path order');
 assert.equal(st['calc1-functions'],'secure');
 for(const id of ['calc1-trig','calc1-exp-log','calc1-limit-idea'])assert.equal(st[id],'next',`${id} needs only calc1-functions`);
 assert.equal(st['calc1-limit-laws'],'later');assert.equal(st['calc1-trig-derivatives'],'later','two prereqs, neither secure');
 assert.equal(stateWord(s,'calc1-functions',st),'Secure');
 assert.equal(topicStates(onPath(CALC,{},'calc1-chain'))['calc1-chain'],'here','the topic in hand');
 assert.equal(topicStates(onPath(CALC,{'calc1-functions':rec('calc1-functions',0.9,false)}))['calc1-trig'],'later','an unlatched record opens nothing');
});

test('path 2: a record off the learner\'s path is ignored - calc1 on a school profile, school on a calc1 profile',()=>{
 const {topicStates}=R();
 const school=topicStates(onPath(SCHOOL,{'calc1-functions':rec('calc1-functions',0.9,true)}));
 const SCHOOL_IDS=['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div','linear-one-step','dec-arith','dec-convert','pct-of-amount','pct-change','ratio-share','unit-rate','area','mean-range','linear-two-step','linear-both-sides','pythagoras','probability'];
 assert.deepEqual(Object.keys(school),SCHOOL_IDS,'W5b: fractions first; W7: four fractions units; W7 batch 2: decimals and percent after one-step; W7 batch 3: ratio and rates, geometry and data; v2 M2b: Pythagoras and probability last');
 assert.equal(school['linear-one-step'],'next');assert.equal(school['frac-equivalent'],'next');assert.equal(school['frac-of-amount'],'next');
 // W7: add and subtract, and multiply and divide, need equivalent fractions first, so they wait
 assert.equal(school['frac-add-sub'],'later');assert.equal(school['frac-mul-div'],'later');assert.ok(!('calc1-functions' in school));
 // W7 batch 2: decimals need nothing on the path; the conversion needs equivalent fractions, each percent unit the one before
 assert.equal(school['dec-arith'],'next');assert.equal(school['dec-convert'],'later');assert.equal(school['pct-of-amount'],'later');assert.equal(school['pct-change'],'later');
 // W7 batch 3: area needs nothing on the path; ratio needs equivalent fractions, unit rates ratio and the decimals, mean and range the decimals
 assert.equal(school['area'],'next');assert.equal(school['ratio-share'],'later');assert.equal(school['unit-rate'],'later');assert.equal(school['mean-range'],'later');
 const calc=topicStates(onPath(CALC,{'linear-one-step':rec('linear-one-step',0.9,true)}));
 assert.ok(!('linear-one-step' in calc));assert.equal(calc['calc1-functions'],'next');
 assert.ok(!Object.values(calc).includes('secure'),'nothing on the calc1 path is secure');
 // without profiles or a learner: the school path, as the ruler cases above call it
 assert.deepEqual(Object.keys(topicStates({skills:{},topic:null})),SCHOOL_IDS);
});

test('path 3: a topic is named by its path (topicIn), humanised only when no path knows the id',()=>{
 const {topicName,continueCard}=R();
 assert.equal(topicName('calc1-functions'),'Functions, and new functions from old');
 assert.notEqual(topicName('calc1-functions'),'Calc1 functions');
 assert.equal(topicName('linear-two-step'),'Two-step equations');
 assert.equal(topicName('calc1-no-such-topic'),'Calc1 no such topic','an unknown id is spelled out');
 const s={...onPath(CALC,{}),pages:[],practice:{topic:'calc1-functions',marked:false,items:[{n:1,question:'f(x) = x^2'}]}};
 assert.match(continueCard(s).d,/on Functions, and new functions from old, not marked/);
});

test('path 4: Tonight\'s title counts the learner\'s path - "N of 22", every topic, or the path from the first step',()=>{
 const {secureTitle,pathFirst,pathSecure}=R();const NC=nCalc(),NS=nSchool();
 assert.equal(secureTitle(0,NC,pathFirst('calc1')),'Calculus 1, from the first step');
 assert.equal(secureTitle(7,NC,pathFirst('calc1')),`7 of ${NC} topics secure`);
 assert.equal(secureTitle(NC,NC,pathFirst('calc1')),'Every topic on the path is secure');
 assert.equal(pathFirst('school'),'School maths','the school path reads by its own name, not its first topic (owner decision 2026-09-29; renamed in W5b, D5)');
 const rows=fs.readFileSync(path.join(root,'src/tv/mathsRows.ts'),'utf8');
 const at=rows.indexOf('export function pathFirst');
 assert.ok(at>0,'pathFirst is in tv/mathsRows.ts');
 const said=rows.slice(Math.max(0,at-400),at);
 assert.doesNotMatch(said,/One-step equations/,'pathFirst\'s comment no longer names the school path\'s first topic');
 assert.match(said,/path's own name/,'the comment says what the function returns');
 const seven=Object.fromEntries(calcIds().slice(0,7).map(id=>[id,rec(id,0.9,true)]));
 const title=(s)=>{const p=pathSecure(s);return secureTitle(p.secure.length,p.topics.length,p.first);};
 assert.equal(title(onPath(CALC,{...seven,'linear-one-step':rec('linear-one-step',0.9,true)})),`7 of ${NC} topics secure`,`a school record is not one of the ${NC}`);
 assert.equal(title(onPath(CALC,{})),'Calculus 1, from the first step');
 assert.equal(title(onPath(SCHOOL,seven)),'School maths, from the first step','calc1 records on a school profile count for nothing');
 assert.equal(title(onPath(SCHOOL,{'linear-one-step':rec('linear-one-step',0.9,true)})),`One of ${NS} topics secure`,'v2 M2b: the school path has seventeen topics (fifteen since W7 batch 3)');
 assert.equal(title({skills:{}}),'School maths, from the first step','no learner: the school path');
});

test('path 5: MathsTV names and counts through the path - no topicById, no SYLLABUS, and a year word only for a topic with a year',()=>{
 const tv=tvSrc();
 assert.doesNotMatch(tv,/\btopicById\b/,'no syllabus-only lookup');
 assert.doesNotMatch(tv,/\bSYLLABUS\b/,'no direct read of the school list');
 assert.doesNotMatch(tv,/\bexpectedIndex\b/,'the school comparison is asked through expectedOn');
 assert.match(tv,/expectedOn\(/);
 const calls=[...tv.matchAll(/SYS_WORD\[[^\]]+\]\(([^)]*)\)/g)];
 assert.ok(calls.length>0,'the year word is still drawn on the school path');
 for(const m of calls){
  const arg=m[1].trim();assert.match(arg,/\.year$/,`SYS_WORD is handed a year, not a topic: ${m[0]}`);
  const before=tv.slice(Math.max(0,m.index-120),m.index);
  assert.ok(before.includes(`${arg} &&`)||before.includes(`${arg} ?`),`SYS_WORD is only asked when ${arg} is there: ${before.slice(-60)}${m[0]}`);
 }
 for(const fn of ['Hero','PracticeScreen','Sheet','Walk'])assert.match(fnBody(tv,fn),/topicName\(/,`${fn} names the set with topicName`);
 assert.match(fnBody(tv,'Topics'),/topicIn\(/,'"Most people do X first" reads topicIn');
 assert.match(fnBody(tv,'Tonight'),/pathSecure\(s\)/,'Tonight counts the learner\'s path');
});

test('course copy 1: "Most people do X first" names X in running text - lowercased, unless it opens with a proper name',()=>{
 const {inRunningText}=R();
 assert.equal(typeof inRunningText,'function');
 assert.equal(inRunningText('The chain rule and implicit differentiation'),'the chain rule and implicit differentiation');
 assert.equal(inRunningText('One-step equations'),'one-step equations');
 assert.equal(inRunningText('The second derivative, L\'Hospital\'s rule and curve sketching'),'the second derivative, L\'Hospital\'s rule and curve sketching','a proper name later in the name keeps its capital');
 for(const kept of ['Newton\'s method','L\'Hospital\'s rule','Riemann sums','Riemann','Fermat\'s theorem','Rolle’s theorem'])assert.equal(inRunningText(kept),kept,kept);
 assert.equal(inRunningText(''),'');
 const P=require(path.join(root,'src/lib/library/paths.ts'));
 const PROPER=/^(?:Newton's|L'Hospital's|Riemann|[A-Z][\w']*['’]s)(?=\s|,|$)/;
 const names=[...P.topicsOf('school'),...P.topicsOf('calc1')].map(t=>t.name);
 assert.ok(names.length>=25);
 for(const name of names){
  const got=inRunningText(name);
  assert.equal(got.slice(1),name.slice(1),`only the first letter may change: ${name}`);
  if(PROPER.test(name))assert.equal(got,name,`no lowercased proper name: ${name}`);
  else assert.equal(got[0],name[0].toLowerCase(),`no capital mid-sentence: ${name}`);
  assert.doesNotMatch(` Most people do ${got} first.`,/do [A-Z](?![\w]*['’]s)(?!iemann)/,name);
 }
 assert.match(fnBody(tvSrc(),'Topics'),/Most people do \$\{inRunningText\(before\.name\)\} first\./,'Topics uses the rule');
});

test('course copy 2: Units and the Calendar take the session and say plainly when a path has no lessons; the Topics comment names topicStops',()=>{
 const {noLessonsLine}=R();
 assert.equal(noLessonsLine('calc1'),'No lessons for Calculus 1 yet. The desk explains a step when you ask.');
 const tv=tvSrc();
 assert.match(fnBody(tv,'Units'),/unitStops\(s\)/);assert.match(fnBody(tv,'Calendar'),/calendarStops\(s\)/);
 for(const fn of ['Units','Calendar'])assert.match(fnBody(tv,fn),/noLessonsLine\(learnerPath\(s\)\)/,`${fn} draws the empty state`);
 const raw=fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8');
 assert.doesNotMatch(raw,/TOPIC_STOPS/,'the D-pad walks topicStops(s), not TOPIC_STOPS');
});

// ---------------------------------------------------------------- Family W8: Get ready for school and the step-up line, the pure parts

const PR=()=>require(path.join(root,'src/tv/prepareRows.ts'));
const onW8=(profile,skills={})=>({profiles:[{id:'a',name:'A',type:'elementary',age:12,system:'uk',modules:['maths'],...profile}],learner:{id:'a'},skills});
const wordsOf=(t)=>t.trim().split(/\s+/).length;

test('W8 prepare 1: the units grouped by strand - strands in the order the path meets them, every school unit once, the three linear topics one Equations group - and none for a Calculus learner',()=>{
 const {prepareGroups,prepareStops}=PR();
 const P=require(path.join(root,'src/lib/library/paths.ts'));
 const g=prepareGroups(onW8({}));
 assert.deepEqual(g.map((x)=>x.strand),['Fractions','Equations','Decimals and percent','Ratio and rates','Geometry and data']);
 assert.deepEqual(g.map((x)=>x.units.map((u)=>u.id)),[
  ['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div'],['linear-one-step','linear-two-step','linear-both-sides'],
  ['dec-arith','dec-convert','pct-of-amount','pct-change'],['ratio-share','unit-rate'],['area','mean-range','pythagoras','probability']]);
 const ids=prepareStops(onW8({})).map((u)=>u.id);
 assert.deepEqual([...ids].sort(),P.topicsOf('school').map((t)=>t.id).sort(),'every school unit, once');
 assert.deepEqual(prepareGroups(onW8({mathPath:'calc1',type:'other',age:19})),[]);assert.deepEqual(prepareStops(onW8({mathPath:'calc1'})),[]);
 assert.equal(prepareStops({skills:{}}).length,nSchool(),'no learner: the school path');
});

test('W8 prepare 2: each unit carries the learner\'s own year word - Grade, Year, ročník, Klasse - from its year in their system',()=>{
 const {prepareStops,SYS_WORD}=PR();
 const units=prepareStops(onW8({}));
 const want={us:(t)=>`Grade ${t.year.us}`,uk:(t)=>`Year ${t.year.uk}`,cz:(t)=>`${t.year.cz}. ročník`,de:(t)=>`Klasse ${t.year.de}`};
 for(const sys of ['us','uk','cz','de'])for(const u of units)assert.equal(SYS_WORD[sys](u.year),want[sys](u),`${sys} ${u.id}`);
 const at=(id)=>units.find((u)=>u.id===id);
 assert.deepEqual(['us','uk','cz','de'].map((sys)=>SYS_WORD[sys](at('frac-add-sub').year)),['Grade 5','Year 6','5. ročník','Klasse 5']);
 assert.deepEqual(['us','uk','cz','de'].map((sys)=>SYS_WORD[sys](at('area').year)),['Grade 7','Year 8','7. ročník','Klasse 6']);
 // MathsTV reads the one word list (no second copy)
 const tv=fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8');
 assert.doesNotMatch(tv,/const SYS_WORD/);assert.match(tv,/import \{[^}]*SYS_WORD[^}]*\} from "@\/tv\/prepareRows"/);
});

test('W8 prepare 3: the scroller pans like the Topics ruler - the focused card under the lamp, neither end showing a gap, strands apart',()=>{
 const {prepareGroups,prepareModel,WINDOW,CARD,CARD_GAP,GROUP_GAP,EDGE}=PR();
 const g=prepareGroups(onW8({})),NS=nSchool();
 const m0=prepareModel(g,0);
 assert.equal(m0.cards.length,NS);assert.equal(m0.offset,0);assert.deepEqual(m0.more,{l:false,r:true});
 assert.equal(m0.cards[0].x,EDGE);assert.ok(m0.trackWidth>WINDOW,'seventeen cards pan');
 // a strand break is wider than a card gap; strand headings span their cards
 assert.equal(m0.cards[4].x-(m0.cards[3].x+CARD),GROUP_GAP,'Fractions to Equations');assert.equal(m0.cards[2].x-(m0.cards[1].x+CARD),CARD_GAP);
 m0.strands.forEach((s,i)=>{const cs=m0.cards.filter((c)=>c.group===i);assert.equal(s.x,cs[0].x);assert.equal(s.w,cs.at(-1).x+CARD-cs[0].x);});
 for(let f=0;f<NS;f++){
  const m=prepareModel(g,f),c=m.cards[f];
  assert.ok(m.offset>=0&&m.offset<=m.trackWidth-WINDOW,`${f}: clamped`);
  assert.ok(c.x-m.offset>=0&&c.x+c.w-m.offset<=WINDOW,`${f}: the focused card is on the stage`);
  if(m.offset>0&&m.offset<m.trackWidth-WINDOW)assert.equal(c.x+c.w/2-m.offset,WINDOW/2,`${f}: under the lamp`);
 }
 const last=prepareModel(g,NS-1);assert.equal(last.offset,last.trackWidth-WINDOW);assert.deepEqual(last.more,{l:true,r:false});
 // a strand heading: at its strand's start, or - when the strand starts off the stage - kept past the left fade while it fits over its cards
 const {FADE,HEAD_CH}=PR();
 for(let f=0;f<NS;f++){const m=prepareModel(g,f);for(const s of m.strands){
  assert.ok(s.labelX>=s.x&&s.labelX<=s.x+s.w,`${f} ${s.strand}: over its cards`);
  if(m.offset===0)assert.equal(s.labelX,s.x);
  else if(s.x<m.offset+FADE&&s.x+s.w-s.strand.length*HEAD_CH>=m.offset+FADE)assert.equal(s.labelX,m.offset+FADE,`${f} ${s.strand}: kept on the stage`);
 }}
 assert.ok(prepareModel(g,13).strands.some((s)=>s.labelX>s.x),'panned to area, a heading has moved on to the stage');
 assert.deepEqual(prepareModel([],0),{cards:[],strands:[],trackWidth:WINDOW,offset:0,more:{l:false,r:false}});
});

test('W8 prepare 4: the words - one sentence per caption slot, 25 words or fewer, no digit, no em dash, no points; two cells, "The usual" first',()=>{
 const {PREPARE_CHOICES,PREPARE_DOOR,choiceLine}=PR();
 assert.deepEqual(PREPARE_CHOICES.map((c)=>c.t),['The usual','A step up']);
 for(const line of [PREPARE_DOOR,choiceLine(0),choiceLine(1),...PREPARE_CHOICES.flatMap((c)=>[c.t,c.k])]){
  assert.ok(wordsOf(line)<=25,line);assert.doesNotMatch(line,/[0-9]|—|point|score|%/i,line);
 }
 for(const line of [PREPARE_DOOR,choiceLine(0),choiceLine(1)])assert.match(line,/^[A-Z][^.!?]*\.$/,`one sentence: ${line}`);
 assert.notEqual(choiceLine(0),choiceLine(1));
});

test('W8 ruler 1: stretchSecure reads the latched step-up record alone, on the learner\'s path - whatever the usual record says',()=>{
 const {stretchSecure,usualSeen,topicStates}=R();
 const rec=(topic,usual,up)=>({topic,seen:usual?6:0,right:usual?6:0,estimate:usual?0.9:0,secure:usual,lastSeen:1,slips:[],...(up===undefined?{}:{stretch:{seen:6,right:6,estimate:up?0.9:0.5,secure:up,lastSeen:1}})});
 const skills={'frac-add-sub':rec('frac-add-sub',true),'area':rec('area',false,true),'ratio-share':rec('ratio-share',true,true),'unit-rate':rec('unit-rate',false,false),'calc1-functions':rec('calc1-functions',true,true)};
 assert.deepEqual([...stretchSecure(onW8({},skills))].sort(),['area','ratio-share'],'step-up secure alone, and both; not a step-up in progress, not another path');
 assert.deepEqual([...stretchSecure(onW8({mathPath:'calc1'},skills))],['calc1-functions']);
 assert.deepEqual([...stretchSecure(onW8({},{}))],[]);
 // a usual record with nothing seen (made by a step-up attempt) is not seen, and never Secure
 assert.equal(usualSeen({skills},'area'),false);assert.equal(usualSeen({skills},'frac-add-sub'),true);assert.equal(usualSeen({skills},'mean-range'),false);
 const st=topicStates({...onW8({},skills),topic:null});
 assert.equal(st['area']==='secure',false,'the Topics word and Tonight\'s count stay about the usual record');assert.equal(st['ratio-share'],'secure');
});

test('W8 ruler 2: the strip carries each strand\'s share of step-up-secure topics as a length - the usual bars unchanged',()=>{
 const RR=require(path.join(root,'src/tv/rulerRows.ts'));
 const P=require(path.join(root,'src/lib/library/paths.ts'));
 const SCHOOL=P.topicsOf('school'),st=Object.fromEntries(SCHOOL.map((t)=>[t.id,t.id==='frac-add-sub'?'secure':'later']));
 const plain=RR.stripModel(SCHOOL,st,true),up=RR.stripModel(SCHOOL,st,true,(id)=>['area','ratio-share','unit-rate','frac-equivalent'].includes(id));
 assert.deepEqual(up.segments.map((g)=>[g.name,g.stretch,g.stretchShare]),[['Fractions',1,0.25],['Equations',0,0],['Decimals and percent',0,0],['Ratio and rates',2,1],['Geometry and data',1,0.5],['Equations',0,0],['Geometry and data',0,0]]);
 assert.deepEqual(plain.segments.map((g)=>[g.stretch,g.stretchShare]),plain.segments.map(()=>[0,0]),'no step-up record: nothing to draw');
 const strip=(m)=>m.segments.map(({stretch,stretchShare,...rest})=>rest);
 assert.deepEqual(strip(up),strip(plain),'the bars, their ink, labels and the needle are the usual record\'s alone');assert.deepEqual(up.needle,plain.needle);
});

// ---------------------------------------------------------------- 8. the second go (challenge-2026-10-05 math-buddy-B): the ring wears a tick, drawn as a picture

// next/font runs only under Next: the face module answers with its class names
for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
after(()=>{clearInterval(globalThis.__desk?.ticker);require('node:fs').rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
const SECOND_Q=['x+3=7','x-5=2','3x=18','x/2=4','x+1=10','5x=35'];
/** The marked sheet as the TV is given it: items 2 and 4 are ringed; `second` is item 2's second go (or none). */
function secondSession(second,screen='sheet',extra={}){
 const items=SECOND_Q.map((question,ix)=>{const wrong=ix===1||ix===3;return {n:ix+1,question,studentAnswer:wrong?'5':String(ix+2),studentWorking:'x = '+(wrong?'5':String(ix+2)),verdict:wrong?'wrong':'right',...(wrong?{slip:'sign-lost-moving',said:`Number ${ix+1}.`}:{said:`Number ${ix+1}.`}),...(ix===1&&second?{second}:{})};});
 return {subject:'maths',screen,focus:1,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,learner:{id:'ema',name:'Ema'},profiles:[],draft:null,
  timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,english:null,essay:null,
  practice:{topic:'linear-one-step',marked:true,items},topic:'linear-one-step',walkIx:1,skills:{},history:[],jobs:{},status:'',log:{started:null,minutes:0,problems:[],hard:[],hints:0},...extra};
}
function drawMaths(name,s){
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server')),{createElement}=require(path.join(root,'node_modules/react'));
 const M=require(path.join(root,'src/maths/MathsTV.tsx'));
 return renderToStaticMarkup(createElement(M[name],{s,focus:s.focus}));
}
const tags=(html,cls)=>html.match(new RegExp(`<div class="${cls}"[^>]*>`,'g'))??[];
const words=(html)=>html.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean);
/** The number element of item `n` and what it holds (the ring is `.nr`, the tick `maths-tick`). */
const numOf=(html,n)=>{const m=new RegExp(`<div class="num"[^>]*>${n}(.*?)</div>`).exec(html);return m?{tag:/<div class="num"[^>]*>/.exec(m[0])[0],inner:m[1]}:null;};
const ticks=(html)=>(html.match(/data-role="maths-tick"/g)??[]).length;
const cardOf=(html)=>{const i=html.indexOf('data-role="maths-hint"');return html.slice(i,html.indexOf('</aside>',i));};

test('second 1: a second go that held - the number and the tally mark carry data-second="right", the ring stays and a tick is drawn, the card is at most 25 words',()=>{
 for(const screen of ['sheet','walk']){
  const html=drawMaths(screen==='sheet'?'Sheet':'Walk',secondSession('right',screen));
  const mark=tags(html,'mb-tm')[1];assert.ok(mark&&/data-second="right"/.test(mark),`${screen}: tally mark 2 carries data-second: ${mark}`);
  assert.ok(!/data-second/.test(tags(html,'mb-tm')[3]),`${screen}: the other ringed item is unmarked`);
  const num=numOf(html,2);assert.ok(num&&/data-second="right"/.test(num.tag),`${screen}: number 2 carries data-second`);
  assert.ok(/class="nr"/.test(num.inner),`${screen}: the ring is still drawn`);
  assert.ok(/data-role="maths-tick"/.test(num.inner),`${screen}: and wears a tick`);
  const plainHtml=drawMaths(screen==='sheet'?'Sheet':'Walk',secondSession(null,screen));
  assert.equal(ticks(html),ticks(plainHtml)+1,`${screen}: one tick more than the same set with no second go`);
  assert.ok(!/data-role="maths-tick"/.test(numOf(html,4).inner),`${screen}: the unfixed ringed item wears none`);
  assert.ok(words(cardOf(html)).length<=25,`${screen}: the taped card is ${words(cardOf(html)).length} words`);
 }
 const walk=drawMaths('Walk',secondSession('right','walk'));
 assert.ok(/holds/i.test(words(cardOf(walk)).join(' ')),'the card says it holds now');
 assert.ok(!/\b(x\s*=\s*7|7)\b/.test(cardOf(walk).replace(/Number 2/g,'')),'the card never says the value');
});

test('second 2: a second go that missed - data-second="wrong", no tick, and the card sends the learner to say how they got there',()=>{
 const walk=drawMaths('Walk',secondSession('wrong','walk')),sheet=drawMaths('Sheet',secondSession('wrong','sheet'));
 for(const html of [walk,sheet]){
  assert.ok(/data-second="wrong"/.test(tags(html,'mb-tm')[1]));assert.ok(/data-second="wrong"/.test(numOf(html,2).tag));
  assert.equal(ticks(html),ticks(drawMaths(html===walk?'Walk':'Sheet',secondSession(null,html===walk?'walk':'sheet'))),'no tick more than the same set with no second go');
  assert.ok(!/data-role="maths-tick"/.test(numOf(html,2).inner),'no tick on the number');
  assert.ok(/class="nr"/.test(numOf(html,2).inner),'the ring stays');
 }
 const card=words(cardOf(walk)).join(' ');
 assert.match(card,/how you got there/i);assert.ok(words(cardOf(walk)).length<=25);
});

test('second 3: no second go draws as before; with one fixed the sheet head counts it out and the line keeps the first attempt',()=>{
 const plain=drawMaths('Sheet',secondSession(null,'sheet'));
 assert.ok(!/data-second/.test(plain),'no second go, no new mark');assert.ok(!/maths-tick/.test(numOf(plain,2).inner));
 assert.match(plain,/Two to look at/);
 const fixed=drawMaths('Sheet',secondSession('right','sheet'));
 assert.match(fixed,/One to look at/);
 assert.match(words(fixed).join(' '),/4 right/,'the line under the actions keeps the first attempt');
 assert.match(words(fixed).join(' '),/1 fixed/);
});

test('second 4: the stylesheet draws the tick and the second ring, and adds no text under the 28 px floor',()=>{
 const css=cssSrc();
 assert.match(css,/\[data-second="right"\]/);assert.match(css,/\[data-second="wrong"\]/);
 for(const rule of css.match(/[^{}]*\[data-second[^{}]*\{[^}]*\}/g)??[]){
  const m=/font-size:\s*(\d+)px/.exec(rule);assert.ok(!m||Number(m[1])>=28,`a second-go rule sets text under the floor: ${rule.trim()}`);
 }
});

// ---------------------------------------------------------------- M3a: a word problem on the paper (the stem once, its parts by letter)

const esc=(t)=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
/** A calc1 set of one single item and a word problem's two parts (items 2 and 3); marked: 1 right, 2(a) right, 2(b) wrong with the pen on its line 1. */
function wordSession(template,screen,marked){
 const W=require(path.join(root,'src/lib/rules/calc-word.ts'));
 const w=W.drawWord(template,1),[a]=W.workedWord(template,1);
 const single={n:1,question:'Find f\'(2) for f(x) = x^3.',spec:{shape:'derivative-at',f:'x^3',at:2}};
 const [pa,pb]=W.wordItems(w,2);
 const items=marked?[{...single,studentAnswer:'12',verdict:'right',said:'Number 1 is right.'},{...pa,studentAnswer:a,verdict:'right',said:'Number 2 is right.'},
  {...pb,studentAnswer:'1',studentWorking:'first line\nsecond line',verdict:'wrong',said:'I got something different for number 3. How did you get there?',slipAt:{line:1}}]:[single,pa,pb];
 return {w,s:secondSession(null,screen,{practice:{topic:w.topic,marked,items},topic:w.topic,walkIx:2,focus:2})};
}
const count=(html,needle)=>html.split(needle).length-1;

test('M3a 1: the Practice paper prints a word problem\'s stem once, as prose in the wrapping row, and its parts labelled (a) and (b), each a wrapped line',()=>{
 const P=require(path.join(root,'src/maths/prose.ts'));
 for(const t of ['sphere-rates','rectangle-perimeter','cubic-max-min']){
  const {w,s}=wordSession(t,'practice',false);
  const html=drawMaths('PracticeScreen',s);
  assert.equal(count(html,esc(P.prose(w.stem))),1,`${t}: the stem once, through prose()`);
  assert.equal(count(html,'<div class="mb-row q wrap" data-role="maths-stem">'),1,`${t}: in the wrapping row`);
  assert.equal(count(html,'data-role="maths-part"'),2,`${t}: two part lines`);
  for(const p of w.parts)assert.ok(html.includes(esc(P.prose(p.line))),`${t}: (${p.part}) printed as prose`);
  assert.match(html,/<section class="mb-item" data-stem="2"><div class="num">2<\/div>/,`${t}: the stem carries the question's number`);
  assert.match(html,/<section class="mb-item" data-part="a"><div class="num">\(a\)<\/div>/);assert.match(html,/<section class="mb-item" data-part="b"><div class="num">\(b\)<\/div>/);
  // the nowrap question row holds the single item only: no sentence of the story is set in it
  assert.equal(count(html,'<div class="mb-row q"'),1,`${t}: one nowrap question row, the single item's`);
  assert.ok(html.indexOf('data-role="maths-stem"')<html.indexOf('data-part="a"'),'the stem sits above its parts');
 }
});

test('M3a 2: the marked paper - each part its own answer line, tick and pen; the tally names 2a and 2b; the card names 2(b); a story draws no graph, the cubic does',()=>{
 for(const t of ['rectangle-perimeter','cubic-max-min']){
  const sheet=wordSession(t,'sheet',true),walk=wordSession(t,'walk',true);
  const sh=drawMaths('Sheet',sheet.s),wk=drawMaths('Walk',walk.s);
  for(const html of [sh,wk]){
   assert.equal(count(html,'data-role="maths-stem"'),1,`${t}: the stem once`);
   assert.ok(numOf(html,'\\(a\\)')&&numOf(html,'\\(b\\)'),`${t}: the parts by their letters`);
   assert.match(numOf(html,'\\(b\\)').inner,/class="nr"/,`${t}: the wrong part's letter is ringed`);
   assert.doesNotMatch(numOf(html,'\\(a\\)').inner,/class="nr"/,`${t}: the right part's is not`);
   assert.ok(html.includes('<span>2a</span>')&&html.includes('<span>2b</span>')&&html.includes('<span>1</span>'),`${t}: the tally names the parts`);
  }
  // the right part's line is ticked on the folded sheet, on its own row
  assert.match(sh,/data-part="a"[^>]*>[\s\S]*?data-role="maths-part"[\s\S]*?data-role="maths-tick"/,`${t}: part (a) ticked`);
  // the walk is on part (b): its card names it as the paper does; the stored line is left alone
  assert.match(cardOf(wk),/number 2\(b\)\. How did you get there\?/);
  assert.match(wk,/Number 2\(b\) needs another <em>look<\/em>/);
  assert.equal(walk.s.practice.items[2].said,'I got something different for number 3. How did you get there?');
  // the pen sits in part (b)'s working: the open item shows its lines with the margin arrow
  assert.match(wk,/data-part="b"[^>]*data-open="true"|data-open="true"[^>]*data-part="b"/,`${t}: part (b) is open under the lamp`);
  assert.equal(wk.includes('data-role="maths-plot"'),t==='cubic-max-min',`${t}: a graph only where the stem prints the function`);
 }
});

test('M3a 3: a set with no parts draws as before - numbers, nowrap rows, no stem, no part, the card says "Number 2"',()=>{
 const items=[1,2,3].map((n)=>({n,question:`Find f'(${n}) for f(x) = x^3.`,spec:{shape:'derivative-at',f:'x^3',at:n}}));
 const s=secondSession(null,'practice',{practice:{topic:'calc1-related-rates',marked:false,items},topic:'calc1-related-rates'});
 const html=drawMaths('PracticeScreen',s);
 assert.equal(count(html,'<div class="mb-row q"'),3);
 for(const n of [1,2,3])assert.match(html,new RegExp(`<section class="mb-item"><div class="num">${n}</div><div class="mb-row q"`));
 for(const r of ['maths-stem','maths-part','data-part','data-stem'])assert.equal(html.includes(r),false,r);
 const walk=drawMaths('Walk',secondSession('wrong','walk'));
 assert.equal(walk.includes('data-part'),false);assert.match(walk,/<span>2<\/span>/);
});

// ---------------------------------------------------------------- v2 M5b: the recovery list (screen "paper")

const PAPER=()=>require(path.join(root,'src/tv/paperRows.ts'));
const REC=()=>require(path.join(root,'src/lib/rules/recovery.ts'));
const STM=()=>require(path.join(root,'src/lib/library/gcse.ts'));
/** The session the paper screen is drawn from: the learner's cleaned paper (what the record keeps) and their skills. */
function paperSession(raw,skills={},focus=0){
 const c=raw===null?null:(()=>{const x=REC().cleanPaper(raw);return {at:1,items:x.items,unmapped:x.unmapped};})();
 return {...secondSession(null,'paper'),focus,practice:null,paper:c,skills};
}
const it=(q,marks,outOf,codes)=>({q,marks,outOf,codes});

test('paper 1: the list is in recovery()\'s order - a prerequisite pulled ahead of a heavier loss - and is never re-sorted',()=>{
 const {paperView}=PAPER(),{recovery}=REC(),{STATEMENTS}=STM();
 // find a paper whose recovery order is NOT plain most-lost-first, so this row means something
 let found=null;
 const codes=STATEMENTS.filter(x=>x.touches.length).map(x=>x.code);
 outer:for(const a of codes)for(const b of codes){
  if(a===b)continue;const raw=[it('1',0,2,[a]),it('2',0,5,[b])];const r=recovery(raw);
  const byLost=[...r.topics].sort((x,y)=>y.lost-x.lost).map(t=>t.id).join();
  if(r.topics.map(t=>t.id).join()!==byLost){found=raw;break outer;}
 }
 assert.ok(found,'some pair of statements pulls a prerequisite forward');
 const v=paperView(paperSession(found));
 assert.deepEqual(v.topics.map(t=>t.id),recovery(found).topics.map(t=>t.id),'the view is recovery()\'s order');
 assert.deepEqual(v.topics.map(t=>t.lost),recovery(found).topics.map(t=>t.lost));
 const html=drawMaths('PaperScreen',paperSession(found));
 const ids=[...html.matchAll(/data-id="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(ids,v.topics.slice(0,ids.length).map(t=>t.id),'the screen draws them in that order');
});

test('paper 2: each topic shows its lost marks and the questions behind it; the paper shows its marks, out of and lost',()=>{
 const {paperView,scoreLine}=PAPER();
 const raw=[it('5(b)',1,3,['N12']),it('7',0,2,['N12','N2']),it('9',4,4,['A1'])];
 const v=paperView(paperSession(raw));
 const t=v.topics.find(x=>x.id==='pct-of-amount');
 assert.ok(t,'N12 leads to a topic on the path');assert.equal(t.lost,4);assert.equal(t.from,'5(b), 7');
 assert.deepEqual([v.marks,v.outOf,v.lost],[5,9,4]);
 const html=drawMaths('PaperScreen',paperSession(raw));
 assert.match(html,/4 marks lost/);assert.match(html,/From 5\(b\), 7/);
 assert.ok(html.includes(scoreLine(v))&&/5 of 9 marks · 4 marks lost/.test(html.replace(/<[^>]*>/g,'')),'the paper\'s marks, out of and lost');
 assert.equal(v.topics.some(x=>x.from.includes('9')),false,'a full-marks question adds nothing');
});

test('paper 3: a topic the desk calls secure stays in the list, marked secure beside it - never dropped (ruling 2)',()=>{
 const {paperView}=PAPER();
 const raw=[it('1',0,3,['N12'])];
 const plain=paperView(paperSession(raw)),sec=paperView(paperSession(raw,{'pct-of-amount':{topic:'pct-of-amount',secure:true}}));
 assert.deepEqual(sec.topics.map(t=>t.id),plain.topics.map(t=>t.id),'the same list');
 assert.equal(plain.topics.find(t=>t.id==='pct-of-amount').secure,false);
 assert.equal(sec.topics.find(t=>t.id==='pct-of-amount').secure,true);
 const html=drawMaths('PaperScreen',paperSession(raw,{'pct-of-amount':{topic:'pct-of-amount',secure:true}}));
 assert.equal((html.match(/data-role="maths-paper-secure"/g)??[]).length,1,'marked once, beside the topic');
 assert.match(html,/data-id="pct-of-amount"[^>]*>[\s\S]*?Secure on the desk/);
 assert.equal(drawMaths('PaperScreen',paperSession(raw)).includes('maths-paper-secure'),false);
});

test('paper 4: what the desk has no topic for is apart, under "Not on the desk yet", with its can text - and a statement past Foundation is flagged, not hidden',()=>{
 const {paperView}=PAPER(),{STATEMENTS}=STM();
 const off=STATEMENTS.find(x=>!x.touches.length&&x.foundation),beyond=STATEMENTS.find(x=>!x.touches.length&&!x.foundation);
 assert.ok(off&&beyond);
 const raw=[it('1',0,2,[off.code]),it('2',1,3,[beyond.code]),it('3',0,1,['N12'])];
 const v=paperView(paperSession(raw));
 assert.ok(v.off.some(o=>o.can===off.can&&o.lost===2&&o.from==='1'&&!o.beyond));
 assert.ok(v.off.some(o=>o.can===beyond.can&&o.beyond));
 assert.equal(v.topics.some(t=>t.name===off.can),false,'never linked to a topic');
 const html=drawMaths('PaperScreen',paperSession(raw));
 const at=html.indexOf('data-role="maths-paper-off"');
 assert.ok(at>0&&html.slice(at).includes('Not on the desk yet'),'its own block, headed plainly');
 const esc=(x)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 assert.ok(html.slice(at).includes(esc(off.can)),'the can text is shown');
 assert.match(html,/a harder statement/);assert.doesNotMatch(html,/Foundation/,'the drawn paper names no tier');
 assert.equal(html.slice(html.indexOf('maths-paper-topics'),at).includes(esc(off.can)),false,'not among the topics');
 assert.equal(drawMaths('PaperScreen',paperSession([it('3',0,1,['N12'])])).includes('maths-paper-off'),false,'no block when nothing is off the desk');
});

test('paper 5: no paper - the screen asks for the marks on the phone, and a paper with no loss says so',()=>{
 const {paperView,paperCaption}=PAPER();
 const none=drawMaths('PaperScreen',paperSession(null));
 assert.match(none,/data-role="maths-paper-empty"/);assert.match(none,/Type the marks of a paper you sat on the phone/);
 assert.equal(paperView(paperSession(null)).empty,true);
 const full=paperView(paperSession([it('1',3,3,['N12'])]));
 assert.equal(full.topics.length,0);assert.match(paperCaption(full),/No marks were lost/);
 assert.match(drawMaths('PaperScreen',paperSession([it('1',3,3,['N12'])])),/No marks were lost/);
});

test('paper 5b: a paper that lost marks on questions naming no statement never says no marks were lost',()=>{
 const {paperView,paperCaption}=PAPER(),{STATEMENTS}=STM();
 const mapped=STATEMENTS.find(x=>x.touches.length);
 const flat=(h)=>h.replace(/<[^>]*>/g,' ');
 // (a) typed with no picks, 22 of 50
 const a=[3,2,2,2,2,2,2,3,3,1].map((m,i)=>it(String(i+1),m,5,[]));
 const va=paperView(paperSession(a));
 assert.equal(va.lost,28);assert.equal(va.topics.length+va.off.length,0);
 const ha=flat(drawMaths('PaperScreen',paperSession(a)));
 assert.doesNotMatch(paperCaption(va),/No marks were lost/);assert.doesNotMatch(ha,/No marks were lost/);
 assert.match(paperCaption(va),/28 marks were lost/);assert.match(ha,/28 marks sit on questions that name no statement/);
 // (b) one mapped question with full marks, one unmapped that lost marks
 const b=[it('1',3,3,[mapped.code]),it('2',0,2,[])];
 const vb=paperView(paperSession(b));
 assert.equal(vb.lost,2);
 assert.doesNotMatch(paperCaption(vb),/No marks were lost/);assert.match(paperCaption(vb),/2 marks were lost/);
 assert.doesNotMatch(flat(drawMaths('PaperScreen',paperSession(b))),/No marks were lost/);
 // one mark reads in the singular
 const vc=paperView(paperSession([it('1',1,2,[])]));
 assert.match(paperCaption(vc),/^1 mark was lost on a question/);
 assert.match(flat(drawMaths('PaperScreen',paperSession([it('1',1,2,[])]))),/1 mark sits on a question that names no statement/);
 // (c) the control stays
 assert.match(paperCaption(paperView(paperSession([it('1',3,3,[mapped.code]) ]))),/No marks were lost/);
});

test('paper 6: no string the recovery screen renders names the board, over a sweep of papers',()=>{
 const {paperView,paperCaption}=PAPER(),{STATEMENTS}=STM();
 const BAD=/GCSE|1MA1/i;
 const papers=STATEMENTS.map((x,i)=>[it(String(i+1),0,2,[x.code])]);
 papers.push(STATEMENTS.slice(0,40).map((x,i)=>it(String(i+1),i%3,2,[x.code,STATEMENTS[(i*7)%STATEMENTS.length].code])));
 papers.push([it('1',2,2,['N1'])],[]);
 for(const raw of papers){
  const s=paperSession(raw),v=paperView(s);
  const text=drawMaths('PaperScreen',s).replace(/<[^>]*>/g,' ')+paperCaption(v);
  assert.doesNotMatch(text,BAD,JSON.stringify(raw).slice(0,80));
 }
 assert.doesNotMatch(drawMaths('PaperScreen',paperSession(null)).replace(/<[^>]*>/g,' '),BAD);
});

test('paper 7: the list shows five topics around the lamp and says when more lie either side',()=>{
 const {paperWindow}=PAPER();
 assert.deepEqual(paperWindow(3,0,5),{from:0,to:3,up:false,down:false});
 assert.deepEqual(paperWindow(12,0,5),{from:0,to:5,up:false,down:true});
 assert.deepEqual(paperWindow(12,6,5),{from:4,to:9,up:true,down:true});
 assert.deepEqual(paperWindow(12,11,5),{from:7,to:12,up:true,down:false});
 assert.deepEqual(paperWindow(0,0,5),{from:0,to:0,up:false,down:false});
});

test('paper 8: the D-pad - Down on Get ready for school opens the list, Right walks it, Back returns; the screen is Math Buddy\'s to draw',()=>{
 const K=require(path.join(root,'src/tv/keys.ts'));
 const base=secondSession(null,'prepare',{practice:null,profiles:[{id:'ema',name:'Ema',type:'elementary',age:12,system:'uk',modules:['maths']}],focus:0});
 const navs=(st)=>st.events.filter(e=>e.type==='nav');
 assert.deepEqual(K.tvKey(base,'down',K.LOCAL).events,[],'Down on the units list still does nothing');
 const p=paperSession([it('1',0,2,['N12']),it('2',0,3,['N2'])],{},0);
 assert.ok(PAPER().paperView(p).topics.length>=2);
 assert.equal(K.tvKey(p,'right',K.LOCAL).events.find(e=>e.type==='focus')?.focus,1);
 assert.deepEqual(navs(K.tvKey(p,'back',K.LOCAL)).map(e=>e.screen),['prepare']);
 assert.equal(K.paperOwns(p),true);assert.equal(K.mathsOwns(p),false,'MATHS_SCREENS is unchanged');
 assert.match(fs.readFileSync(path.join(root,'src/app/tv/page.tsx'),'utf8'),/mathsOwns\(s\) \|\| paperOwns\(s\)\) \? <MathsTV/,'the TV page hands it to Math Buddy');
});

test('M5b step 4: the slip card says its line through deskLine - the same text for a single item and for a part',()=>{
 const src=fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8');
 assert.match(src,/const said = deskLine\(items, ix,/);
 assert.doesNotMatch(src,/namedLine/);
 const {deskLine,namedLine,itemName}=require(path.join(root,'src/lib/rules/calc-word.ts'));
 const parts=[{n:1},{n:2,stem:'A story.',part:'a'},{n:3,stem:'A story.',part:'b'}];
 for(let i=0;i<parts.length;i++){const line=`Number ${parts[i].n} is right. I got something different for number ${parts[i].n}.`;
  assert.equal(deskLine(parts,i,line),namedLine(line,parts[i].n,itemName(parts,i)),'the same text, by construction');}
});

test('MK10: the drawn card of an unsure part gives the desk\'s reason under the part\'s name, never "something different"; a blank part has no answer yet',()=>{
 const W=require(path.join(root,'src/lib/rules/calc-word.ts')),K=require(path.join(root,'src/lib/rules/kinds.ts'));
 const w=W.drawWord('rectangle-perimeter',1),[a]=W.workedWord('rectangle-perimeter',1);
 const single={n:1,question:'Find f\'(2) for f(x) = x^3.',spec:{shape:'derivative-at',f:'x^3',at:2}};
 const [pa,pb]=W.wordItems(w,2);
 const judged=(bAnswer)=>K.judgeSet({topic:w.topic,items:[single,pa,pb]},[{n:1,studentAnswer:'12'},{n:2,studentAnswer:a},{n:3,studentAnswer:bAnswer}],{topic:w.topic,system:'uk',typed:true}).items;
 for(const [ans,line] of [['???',(it)=>it.said],['',()=>'Number 3 has no answer yet.']]){
  const items=judged(ans);
  assert.equal(items[2].verdict,'unsure');assert.equal(items[2].said,line(items[2]));
  const s=secondSession(null,'walk',{practice:{topic:w.topic,marked:true,items},topic:w.topic,walkIx:2,focus:2});
  const card=cardOf(drawMaths('Walk',s));
  assert.doesNotMatch(card,/something different/);
  if(ans)assert.match(card,/The desk is not sure about number 2\(b\)\. /);else assert.match(card,/Number 2\(b\) has no answer yet\./);
  assert.equal(s.practice.items[2].said,line(items[2]),'the stored line is left alone');
 }
});

test('heard 1: the drawn card of an item the desk settled from a spoken value opens with what the desk heard',async()=>{
 const reg=require(path.join(root,'src/lib/engines/registry.ts'));require(path.join(root,'src/lib/engines/text.ts'));
 const X=require(path.join(root,'src/lib/desk/explain.ts')),{reduce}=require(path.join(root,'src/lib/session/store.ts'));
 reg.useProvider('text',{name:'stub',run:async()=>({raw:JSON.stringify({reply:'Look again at the step where the 1 moved.',slip:'unclear',value:'4'})})});
 try{
  const base=secondSession(null,'walk');
  const item={n:2,question:'2x + 3 = 11',studentAnswer:'',verdict:'unsure'};
  const x=await X.explainItem(item,'I took three off and halved it and got four','linear-two-step','tv-heard',()=>true,12);
  assert.equal(x.settled.verdict,'right');
  // the route stores it the way it does: practice.settle with the reply
  const s=reduce({...base,practice:{...base.practice,items:base.practice.items.map((it)=>it.n===2?item:it)}},{type:'practice.settle',n:2,reply:x.reply,verdict:x.settled.verdict,slip:x.settled.slip,said:x.settled.said});
  const card=words(cardOf(drawMaths('Walk',{...s,walkIx:1}))).join(' ');
  assert.match(card,/The desk heard 4\./,'the drawn card names the value the desk took');
 }finally{reg.resetProviders();}
});
