/**
 * The Calculus 1 baseline (desk/src/lib/library/calculus1.ts): can Math Buddy's reader set a university Calculus I
 * course without breaking the TV? Offline - no model, no server, no store. For every example in the corpus, as the
 * plain text our prompts ask the models for and as the TeX the reader may fall back to:
 *   - parseMath never throws;
 *   - every letter and digit of the input survives into flatten, in order (nothing dropped);
 *   - no backslash and no `frac` / `sqrt` command text reaches the rendered nodes;
 *   - the line fits where the TV puts it: a question or a working line in its fixed row (two squares, three when
 *     isTall - the same helper MathsTV uses for data-tall), a page line's widest unbreakable piece inside its
 *     wrapping row, a caption's longest word inside the taped card;
 *   - and what verify.ts (the one check the desk makes in code) can read of it.
 * Each example DECLARES its observed status (render, renderTex, check) and this suite asserts declared === observed,
 * so a typesetter improvement or regression forces the baseline to be re-declared: a ratchet.
 *
 * The fit is an ESTIMATE from the stylesheet's own em values (design/maths-lamplight.css: 48 px squares, print 46 /
 * 52 px, hand 72 px, scripts max(.6em, 28px), fraction parts max(.78em, 28px)) and average glyph widths; the real
 * boxes are measured by tools/maths-calculus-live.cjs against the running TV. Run with npm test in desk/.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const CALC_FILE=path.join(root,'src/lib/library/calculus1.ts');
const T=require(path.join(root,'src/maths/typeset.ts'));
const V=require(path.join(root,'src/lib/desk/verify.ts'));
const {CALCULUS_1}=require(CALC_FILE);
const TOPICS=CALCULUS_1.topics;
const ALL=TOPICS.flatMap(t=>t.examples.map(e=>({...e,topic:t.id})));

// ------------------------------------------------------------------ where each kind is set on the TV

/**
 * question: a printed row on the practice sheet (52 px) and the marked sheet (46 px) - fixed height, one line; the
 * larger practice size is the one measured. working: the learner's hand, 72 px, one fixed row per line. page: a
 * printed row on the Page screen, which wraps (`.mb-row.q.wrap`): only an unbreakable piece can overflow. caption:
 * the desk's sentence in the taped card (34 px Manrope, prose, never typeset). Widths are the room on the paper:
 * 1130 px paper less the 144 px margin; a wrapping row also keeps 150 px clear on the right; the card is 534 px less
 * its 34 px padding each side.
 */
const CTX={
 question:{voice:'print',f:52,row:true,w:986},
 working:{voice:'hand',f:72,row:true,w:986},
 page:{voice:'print',f:46,row:false,w:836},
 caption:{prose:true,f:34,w:466},
};
/**
 * A glyph box at line-height 1 is a whole em, and a digit's ink is about .7 of it, so an estimate up to a quarter
 * square (12 px) over the row still keeps the ink inside the row. A limit set under lim beside a fraction estimates
 * at 148-154 px against the 144 px row: inside the tolerance, and the live test is the one that measures it.
 */
const SQ=48,TOL=12;

// ------------------------------------------------------------------ the estimate: widths and heights in px

const glyph=(ch)=>/[0-9]/.test(ch)?.56:/[A-Z]/.test(ch)?.66:/[a-z]/.test(ch)?.48:/[.,;:'!|′il]/.test(ch)?.28:.62;
const chars=(v,f,voice)=>[...String(v)].reduce((a,c)=>a+glyph(c),0)*f*(voice==='hand'?.82:1);
const scriptSize=(f)=>Math.max(.6*f,28);
const partSize=(f,small)=>Math.max((small?.7:.78)*f,28);
const isLim=(n)=>n.t==='fn'&&n.v==='lim'&&n.sub;
function nodeW(n,f,voice){
 let w;
 switch(n.t){
  case 'num':case 'var':case 'ord':case 'sym':w=chars(n.v,f,voice);break;
  case 'text':w=chars(n.v,f,voice)*(voice==='hand'?.8:1);break;
  case 'fn':w=chars(n.v,f,voice)+(voice==='hand'?.2:.1)*f;break;
  case 'bin':w=.62*f+2*(voice==='hand'?.26:.22)*f;break;
  case 'rel':w=.62*f+.56*f;break;
  case 'punct':w=.34*f;break;
  case 'open':case 'close':w=.34*f*(n.big?1.16:1);break;
  case 'int':w=.5*f;break;
  case 'op':w=.62*1.3*f+.04*f;break;
  case 'sp':w=n.w*f;break;
  case 'frac':{const p=partSize(f,n.small);w=Math.max(listW(n.num,p,voice),listW(n.den,p,voice))+.28*p+.24*f;break;}
  case 'grp':w=listW(n.body,f,voice);break;
  case 'sqrt':w=.46*f+listW(n.body,f,voice)+.14*f;break;
  default:w=.6*f;
 }
 const s=scriptSize(f);
 if(isLim(n))return Math.max(w,listW(n.sub,s,voice))+.16*f;
 if(n.sup&&n.sub)return w+Math.max(listW(n.sup,s,voice),listW(n.sub,s,voice));
 if(n.sup)w+=listW(n.sup,s,voice);
 if(n.sub)w+=listW(n.sub,s,voice);
 return w;
}
const listW=(nodes,f,voice)=>nodes.reduce((a,n)=>a+nodeW(n,f,voice),0);

/**
 * How far a node reaches above (a) and below (b) the baseline. A box is its line (line-height 1: .78 above, .22
 * below); `vertical-align` and `top` in em are the element's OWN size (a script's raise is .64em of the script).
 */
function nodeExt(n,f,voice){
 let a=.78*f,b=.22*f;
 switch(n.t){
  case 'open':case 'close':if(n.big){a*=1.16;b*=1.16;}break;
  case 'int':if(voice==='print'){a=1.08*f;b=.42*f;}else{a=1.12*f;b=.44*f;}break;
  case 'op':a=.78*1.3*f-.14*1.3*f;b=.22*1.3*f+.14*1.3*f;break;
  case 'sp':a=0;b=0;break;
  // a fraction's box is centred on half the x-height (vertical-align: middle), then lifted by `top` in its own em
  case 'frac':{const p=partSize(f,n.small),tot=listH(n.num,p,voice)+listH(n.den,p,voice)+.24*p,c=.25*f+(voice==='print'?.06:.1)*p;a=c+tot/2;b=tot/2-c;break;}
  case 'grp':({a,b}=listExt(n.body,f,voice));break;
  case 'sqrt':{const e=listExt(n.body,f,voice);a=e.a+.15*f-.12*f;b=Math.max(e.b,.22*f)+.12*f;break;}
 }
 const s=scriptSize(f);
 if(isLim(n)){a=Math.max(a,.78*f);b=.22*f+.1*s+listH(n.sub,s,voice);}
 else if(n.sup&&n.sub){let tot=listH(n.sup,s,voice)+.12*s+listH(n.sub,s,voice);if(n.t==='int')tot=Math.max(tot,1.5*f);if(n.t==='op')tot=Math.max(tot,1.36*f);const c=.25*f;a=Math.max(a,c+tot/2);b=Math.max(b,tot/2-c);}
 else{
  if(n.sup){const r=(n.t==='close'?(voice==='print'?.86:1):(voice==='print'?.74:.64))*s,e=listExt(n.sup,s,voice);a=Math.max(a,r+e.a);b=Math.max(b,e.b-r);}
  if(n.sub){const d=.34*s,e=listExt(n.sub,s,voice);b=Math.max(b,d+e.b);a=Math.max(a,e.a-d);}
 }
 return {a,b};
}
function listExt(nodes,f,voice){let a=0,b=0;for(const n of nodes){const e=nodeExt(n,f,voice);a=Math.max(a,e.a);b=Math.max(b,e.b);}if(!nodes.length){a=.78*f;b=.22*f;}return {a,b};}
const listH=(nodes,f,voice)=>{const e=listExt(nodes,f,voice);return e.a+e.b;};

/**
 * The widest piece a wrapping row cannot break. MathText sets a number, a letter, a word, a function name, a bracket
 * and a comma as plain inline spans, so a run of them with nothing between is one word to the browser (TeX's 80
 * digits, one span each, are one run like plain's one span); an operator, a space, a fraction, a root, a sign or
 * anything carrying a script is an inline-block, and the line may break beside it.
 */
function widestPiece(nodes,f,voice){
 const INLINE=new Set(['num','var','ord','text','fn','open','close','punct','sym']);
 let widest=0,run=0;
 for(const n of nodes){
  const w=nodeW(n,f,voice);
  if(INLINE.has(n.t)&&!n.sup&&!n.sub){run+=w;widest=Math.max(widest,run);}
  else{run=0;widest=Math.max(widest,w);}
 }
 return widest;
}

// ------------------------------------------------------------------ what is observed of one line

const UNI={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ˣ':'x','ⁿ':'n','₀':'0','₁':'1','₂':'2','₃':'3','ₙ':'n','½':'12','¼':'14','¾':'34','⅓':'13'};
/** Words the plain reader turns into signs (√, ∫, ∑, π, ∞, Greek) - they leave no letters, and that is not a drop. */
const PLAIN_SIGNS=/(?<![a-zA-Z])(sqrt|cbrt|int|sum|prod|infinity|inf|pi|alpha|beta|gamma|delta|epsilon|theta|lambda|rho|sigma|tau|phi|omega|Gamma|Delta|Theta|Lambda|Sigma|Phi|Omega)(?![a-zA-Z])/g;
function expected(src,tex){
 let s=[...src].map(c=>UNI[c]??c).join('');
 // an environment's name ({cases}) is how TeX says "lay this out", not a character of the maths
 s=tex?s.replace(/\\(begin|end)\{[^}]*\}/g,' ').replace(/\\[a-zA-Z]+/g,' ').replace(/\\./g,' '):s.replace(PLAIN_SIGNS,' ');
 return s.replace(/[^0-9a-zA-Z]/g,'');
}
const alnum=(s)=>s.replace(/[^0-9a-zA-Z]/g,'');
function subsequence(needle,hay){let i=0;for(const c of hay)if(c===needle[i])i++;return i===needle.length;}
function leaves(nodes){const out=[];T.walk(nodes,n=>{if('v' in n)out.push(n);});return out;}
/**
 * An unspaced slash left between two pieces of maths in the PLAIN form: a fraction the reader did not stack
 * (`sin(x)/cos(x)`). A slash beside a word is a unit (`cm^3/s`), and a slash in TeX is the author's own choice.
 */
function slashKept(nodes){
 let kept=false;
 const maths=(n)=>n&&n.t!=='sp'&&n.t!=='text'&&n.t!=='punct';
 const scan=(list)=>{list.forEach((n,k)=>{if(n.t==='ord'&&n.v==='/'&&maths(list[k-1])&&maths(list[k+1]))kept=true;
  if(n.t==='frac'){scan(n.num);scan(n.den);}if(n.t==='grp'||n.t==='sqrt')scan(n.body);if(n.sup)scan(n.sup);if(n.sub)scan(n.sub);});};
 scan(nodes);return kept;
}

/** The reasons one line of one form breaks or degrades where `kind` puts it. */
function lineReasons(line,kind,tex){
 const breaks=new Set(),degrades=new Set(),ctx=CTX[kind];
 let nodes;
 try{nodes=T.parseMath(line);T.flatten(nodes);T.isTall(nodes);}catch{breaks.add('throws');return {breaks,degrades};}
 if(!subsequence(expected(line,tex),alnum(T.flatten(nodes))))breaks.add('dropped');
 const ls=leaves(nodes);
 if(ls.some(n=>String(n.v).includes('\\'))||ls.some(n=>n.t==='text'&&/^(d|t)?frac$|^sqrt$/.test(n.v)))breaks.add('raw-tex');
 if(tex&&T.looksTex(line)){
  const cmds=new Set([...line.matchAll(/\\([a-zA-Z]+)/g)].map(m=>m[1]));
  if(ls.some(n=>n.t==='text'&&cmds.has(n.v)))degrades.add('unknown-tex');
  if(/\\begin\{cases\}/.test(line))degrades.add('cases-one-line');
  if(/(?<!\^\{?)\\circ(?![a-zA-Z])/.test(line))degrades.add('circ-as-degree');
 }
 if(!tex&&/[_^][A-Za-z]{2,}/.test(line))degrades.add('script-one-letter');
 if(!tex&&slashKept(nodes))degrades.add('slash');
 if(ctx.prose){
  const longest=Math.max(0,...line.split(/\s+/).map(w=>[...w].length*.58*ctx.f));
  if(longest>ctx.w)degrades.add('too-wide');
 }else if(ctx.row){
  const rowH=(T.isTall(nodes)?3:2)*SQ;
  if(listH(nodes,ctx.f,ctx.voice)>rowH+TOL)degrades.add('too-tall');
  if(listW(nodes,ctx.f,ctx.voice)>ctx.w)degrades.add('too-wide');
 }else if(widestPiece(nodes,ctx.f,ctx.voice)>ctx.w)degrades.add('too-wide');
 return {breaks,degrades};
}
/** One form of an example (every line of a working): 'renders', 'degrades:<reasons>' or 'breaks:<reasons>'. */
function renderStatus(src,kind,tex){
 const breaks=new Set(),degrades=new Set();
 for(const line of String(src).split('\n')){const r=lineReasons(line,kind,tex);r.breaks.forEach(x=>breaks.add(x));r.degrades.forEach(x=>degrades.add(x));}
 if(breaks.size)return 'breaks:'+[...breaks].sort().join(',');
 if(degrades.size)return 'degrades:'+[...degrades].sort().join(',');
 return 'renders';
}
/**
 * What verify.ts can read: every line is one equation of arithmetic in x (both sides evaluate), and a question's
 * stated answer substitutes into it and holds. Anything else the desk cannot check in code.
 */
function checkStatus(ex){
 const eq=(line)=>line.includes(':')?line.slice(line.lastIndexOf(':')+1):line;
 const readable=(line)=>{const sides=eq(line).split('=');return sides.length===2&&V.evaluate(sides[0],1)!==null&&V.evaluate(sides[1],1)!==null;};
 const lines=ex.plain.split('\n');
 if(!lines.every(readable))return 'none';
 if(ex.kind==='question'&&ex.answer!==undefined)return V.substitute(eq(lines[0]),ex.answer)===true?'code':'none';
 return 'code';
}
const observe=(ex)=>({render:renderStatus(ex.plain,ex.kind,false),renderTex:ex.tex===undefined?undefined:renderStatus(ex.tex,ex.kind,true),check:checkStatus(ex)});

// ------------------------------------------------------------------ the corpus itself

test('1: the spine - 22 topics, sessions 1-28 each exactly once, unique ids, a prerequisite DAG, one-sentence blurbs',()=>{
 assert.equal(TOPICS.length,22);
 assert.deepEqual(CALCULUS_1.nonTopicSessions,[8,9,21,22,28],'the review and midterm sessions');
 const seen=[...TOPICS.flatMap(t=>t.sessions),...CALCULUS_1.nonTopicSessions].sort((a,b)=>a-b);
 assert.deepEqual(seen,Array.from({length:28},(_,i)=>i+1),'sessions 1-28, each once');
 const ids=[...TOPICS.map(t=>t.id),...ALL.map(e=>e.id)];
 assert.equal(new Set(ids).size,ids.length,'every topic and example id is unique');
 const before=new Set();
 for(const t of TOPICS){
  assert.match(t.id,/^calc1-[a-z0-9-]+$/,t.id);
  for(const p of t.prereq)assert.ok(before.has(p),`${t.id}: prereq ${p} is an earlier topic (so the graph has no cycle)`);
  before.add(t.id);
  assert.ok(t.sections.every(s=>/^\d+\.\d+$/.test(s)),`${t.id}: sections are Stewart section numbers`);
  assert.match(t.blurb,/^[A-Z][^.!?]*[.!?]$/,`${t.id}: the blurb is one sentence`);
  assert.ok(t.name&&t.strand,t.id);
  assert.ok(t.examples.length>=4,`${t.id} has at least four examples`);
  for(const e of t.examples){
   assert.ok(['question','working','caption','page'].includes(e.kind),e.id);
   assert.ok(typeof e.plain==='string'&&e.plain.trim(),e.id);
   assert.ok(!/\\/.test(e.plain),`${e.id}: the plain form carries no TeX`);
   assert.ok(e.kind!=='caption'||e.tex===undefined,`${e.id}: a caption is prose, it has no TeX form`);
  }
 }
 assert.equal(CALCULUS_1.source.url,'https://www.math.columbia.edu/programs-math/undergraduate-program/calculus-classes/calculus-i/calculus-1-sample-syllabus');
 assert.match(CALCULUS_1.source.textbook,/Stewart.*Early Transcendentals.*9/);
});

test('2: calculus1.ts is client-safe - no Node module, so a TV screen may import it',()=>{
 const src=fs.readFileSync(CALC_FILE,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
 assert.doesNotMatch(src,/from\s+["'](node:|fs|path|os|child_process)/,'no Node import');
 assert.doesNotMatch(src,/require\(/,'no require');
});

test('3: the stress shapes are all in the corpus',()=>{
 const forms=ALL.flatMap(e=>[e.plain,e.tex??'']);
 const has=(re)=>forms.some(s=>re.test(s));
 const nested=ALL.some(e=>[e.plain,e.tex].filter(Boolean).some(s=>s.split('\n').some(l=>{let deep=false;T.walk(T.parseMath(l),n=>{if(n.t==='frac'){let inner=false;T.walk([...n.num,...n.den],m=>{if(m.t==='frac')inner=true;});if(inner)deep=true;}});return deep;})));
 assert.ok(nested,'a nested fraction');
 for(const [what,re] of [['sin(x)/x',/sin\(x\)\/x|\\frac\{\\sin x\}\{x\}/],['ln(x)/x',/ln\(x\)\/x|\\frac\{\\ln x\}\{x\}/],['a limit arrow',/->|\\to/],
  ['a one-sided limit',/->0\+|->0-|\\to 0\^\+/],['a limit at infinity',/->infinity|\\to \\infty/],['e^(2x)',/e\^\(2x\)|e\^\{2x\}/],['x^(-1/2)',/x\^\(-1\/2\)|x\^\{-1\/2\}/],
  ['a cube root',/cbrt|\\sqrt\[3\]/],['an absolute value',/\|[^|]+\||\\lvert/],["f'(x)",/f'\(x\)/],["f''(x)",/f''\(x\)/],['dy/dx',/dy\/dx|\\frac\{dy\}\{dx\}/],
  ['d^2y/dx^2',/d\^2y\/dx\^2|\\frac\{d\^2y\}\{dx\^2\}/],['an integral with limits',/int_|\\int_/],['an evaluation bar',/\]_[0-9a-z(]/],['a Riemann sum',/sum_\(i=1\)\^n|\\sum_\{i=1\}/],
  ['a piecewise definition',/\bif\b|\\begin\{cases\}/],['an inequality',/<=|>=|\\le\b|\\ge\b/],['an interval',/\[-?\d+, ?\d+\]/],['delta',/delta|\\delta/],['epsilon',/epsilon|\\varepsilon|\\epsilon/],['theta',/theta|\\theta/],
  ['an 80-digit token',/\d{80}/]])assert.ok(has(re),what);
 assert.ok(ALL.some(e=>e.kind==='working'&&e.plain.split('\n').some(l=>l.length>=60)),'a working line of 60 characters or more');
 const big=ALL.find(e=>/\d{80}/.test(e.plain));
 const n=10n**40n,sum=(n*(n+1n)/2n).toString();
 assert.equal(sum.length,80);assert.ok(big.plain.includes(sum),'the 80-digit token is n(n + 1)/2 at n = 10^40, exactly');
});

test('4: withholding - no caption carries the final value of a question it sits beside',()=>{
 // spacing around signs never hides a value ("x - 2" is "x-2"), but a word space stays, so "to x-2" still has its boundary
 const norm=(s)=>s.replace(/π/g,'pi').replace(/[−–]/g,'-').replace(/\s*([-+*/=^(),<>])\s*/g,'$1').replace(/\s+/g,' ').trim().toLowerCase();
 for(const t of TOPICS){
  const answers=t.examples.filter(e=>e.kind==='question'&&e.answer!==undefined).flatMap(e=>[e.answer,...e.answer.split(/,\s+/)]);
  assert.ok(answers.length,`${t.id} has a question with its answer`);
  for(const c of t.examples.filter(e=>e.kind==='caption')){
   for(const a of answers){
    // a value is whole: not inside a longer number or word (a sentence's full stop after it still counts)
    const re=new RegExp('(?<![0-9a-z]|\\d\\.)'+norm(a).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![0-9a-z]|\\.\\d)');
    assert.doesNotMatch(norm(c.plain),re,`${c.id} gives away "${a}"`);
   }
  }
  assert.ok(t.examples.some(e=>e.kind==='caption'),`${t.id} has a caption`);
 }
});

const OBS=ALL.map(e=>({e,o:observe(e)}));

test('5: the ratchet - every example\'s declared status is what the reader does today',()=>{
 const off=[];
 for(const {e,o} of OBS){
  if(e.render!==o.render)off.push(`${e.id} render: declared ${e.render}, observed ${o.render}`);
  if(e.renderTex!==o.renderTex)off.push(`${e.id} renderTex: declared ${e.renderTex}, observed ${o.renderTex}`);
  if(e.check!==o.check)off.push(`${e.id} check: declared ${e.check}, observed ${o.check}`);
 }
 assert.equal(off.length,0,'re-declare the baseline:\n'+off.join('\n'));
});

test('6: the ratchet has teeth - a seeded break, degrade and check are each observed',()=>{
 assert.equal(renderStatus('\\frac{1}{','question',true).startsWith('breaks:'),true,'an unclosed TeX fraction leaves its backslash on the TV');
 assert.match(renderStatus('x \\in \\mathbb{R}','question',true),/unknown-tex/);
 assert.match(renderStatus('\\frac{1 + \\frac{1}{1 + \\frac{1}{x}}}{2}','working',true),/too-tall/);
 assert.match(renderStatus('9'.repeat(80),'page',false),/too-wide/);
 assert.equal(renderStatus('3x - 7 = 11','question',false),'renders');
 assert.equal(checkStatus({kind:'question',plain:'3x - 7 = 11',answer:'6'}),'code');
 assert.equal(checkStatus({kind:'question',plain:'3x - 7 = 11',answer:'5'}),'none','an answer that does not hold is not checked');
});

test('7: the school corpus (Family W5b) - every fractions question the generator prints renders on the practice sheet, fractions stacked',()=>{
 // desk/src/lib/rules/school.ts prints each question itself (plain and TeX); the practice sheet sets the plain form.
 // Seeds 0..99 at both tiers: every form renders where a question sits (no drop, no raw TeX, inside its row), with
 // both operands and nothing else stacked, so a fraction's numerals are set at the fraction-part size (max(.78em, 28px)).
 const S=require(path.join(root,'src/lib/rules/school.ts'));
 const off=[];let n=0;
 for(const tier of [1,2])for(let seed=0;seed<100;seed++){
  const q=S.question(S.gen(seed,tier));n++;
  for(const [form,line,tex] of [['plain',q.plain,false],['tex',q.tex,true]]){
   const st=renderStatus(line,'question',tex);
   if(st!=='renders')off.push(`${tier}/${seed} ${form} ${line}: ${st}`);
   let fr=0;T.walk(T.parseMath(line),(x)=>{if(x.t==='frac')fr++;});
   if(fr!==2)off.push(`${tier}/${seed} ${form} ${line}: ${fr} stacked fractions`);
  }
 }
 assert.equal(n,200);
 assert.equal(off.length,0,'a school question that does not set cleanly:\n'+off.join('\n'));
});

test('7b: the W7 school corpus - every question the three new generators print renders on the practice sheet, its fractions (and a missing number\'s gap) stacked',()=>{
 // equivalent fractions: 'Fill in the missing number: 3/4 = ?/12.' stacks two (the gap '?' over 12), 'Write 18/24 in its simplest form.' one;
 // a fraction of an amount one ('Find 3/5 of 40 kg.', 'Find 3/4 of €60.'); multiply and divide two ('Work out 2/3 × 3/4.')
 const S=require(path.join(root,'src/lib/rules/school.ts'));
 const want=(sp)=>sp.shape==='simplify'||sp.shape==='fraction-of'?1:2;
 const off=[];let n=0;
 for(const g of [S.genEquivalent,S.genOfAmount,S.genMulDiv])for(const tier of [1,2])for(let seed=0;seed<100;seed++){
  const sp=g(seed,tier),q=S.question(sp);n++;
  for(const [form,line,tex] of [['plain',q.plain,false],['tex',q.tex,true]]){
   const st=renderStatus(line,'question',tex);
   if(st!=='renders')off.push(`${sp.shape} ${tier}/${seed} ${form} ${line}: ${st}`);
   let fr=0,gap=0;T.walk(T.parseMath(line),(x)=>{if(x.t==='frac'){fr++;if([...x.num,...x.den].some((y)=>y.t==='ord'&&y.v==='?'))gap++;}});
   if(fr!==want(sp))off.push(`${sp.shape} ${tier}/${seed} ${form} ${line}: ${fr} stacked fractions`);
   if(sp.shape==='missing'&&gap!==1)off.push(`${tier}/${seed} ${form} ${line}: the gap is not a stacked fraction part`);
   // every number and a fraction of an amount's unit survive the typesetter (a plain '$' would be read as TeX and dropped)
   const flat=T.flatten(T.parseMath(line));
   for(const d of sp.expr.match(/\d+/g))if(!flat.includes(d))off.push(`${line}: ${d} is lost`);
   if(sp.unit&&!/[€£]|kg|grams|km|metres|cm|litres|ml|minutes|dollars/.test(flat))off.push(`${line}: the unit ${sp.unit} is lost (${flat})`);
  }
 }
 assert.equal(n,600);
 assert.equal(off.length,0,'a W7 school question that does not set cleanly:\n'+off.join('\n'));
});

test('7c: the W7 batch-2 school corpus - every decimals and percent question the new generators print renders on the practice sheet, every number, point, percent sign and unit kept',()=>{
 // decimals: 'Work out 4.35 + 2.8.', 'Work out €4.35 + €2.80.', 'Work out £3.45 × 4.' (no fraction stacked; a decimal is one number, its point kept)
 const S=require(path.join(root,'src/lib/rules/school.ts'));
 // conversions: 'Write 3/8 as a decimal.' stacks the given fraction; 'Write 35% as a simplified fraction.' stacks none
 // a percent of an amount: 'Find 35% of €80.', 'Find 12.5% of 240 kg.' (no fraction; the % sign and the unit kept)
 // a percent change: 'Increase €60 by 15%.', 'Decrease 250 kg by 12%.'
 const GENS=[[S.genDecimal,()=>0],[S.genConvert,(sp)=>(/\//.test(sp.expr)?1:0)],[S.genPercentOf,()=>0],[S.genPercentChange,()=>0]];
 const off=[];let n=0;
 for(const [g,fracs] of GENS)for(const tier of [1,2])for(let seed=0;seed<100;seed++){
  const sp=g(seed,tier),q=S.question(sp);n++;
  for(const [form,line,tex] of [['plain',q.plain,false],['tex',q.tex,true]]){
   const st=renderStatus(line,'question',tex);
   if(st!=='renders')off.push(`${sp.shape} ${tier}/${seed} ${form} ${line}: ${st}`);
   let fr=0;T.walk(T.parseMath(line),(x)=>{if(x.t==='frac')fr++;});
   if(fr!==fracs(sp))off.push(`${sp.shape} ${tier}/${seed} ${form} ${line}: ${fr} stacked fractions`);
   const flat=T.flatten(T.parseMath(line));
   for(const d of sp.expr.match(/\d+(?:\.\d+)?/g))if(!flat.includes(d))off.push(`${line}: ${d} is lost (${flat})`);
   if(/%/.test(sp.expr)&&!flat.includes('%'))off.push(`${line}: the percent sign is lost (${flat})`);
   if(sp.unit&&!/[€£]|kg|grams|km|metres|cm|litres|ml|minutes|dollars/.test(flat))off.push(`${line}: the unit ${sp.unit} is lost (${flat})`);
  }
 }
 assert.equal(n,GENS.length*200);
 assert.equal(off.length,0,'a W7 batch-2 school question that does not set cleanly:\n'+off.join('\n'));
});

test('7d: the W7 batch-3 school corpus - every ratio, rate, area and mean or range question renders on the practice sheet with every number, ratio and unit kept; a long row is fitted, never under 40 px',()=>{
 // ratio: 'Write 12:18 in its simplest form.', 'Share €60 in the ratio 2:3.', 'Fill in the missing number: 2:3 = ?:15.' - no
 // fraction stacked, the ratio's colon kept between its numbers; rates: '5 pens cost €3.50. What do 8 pens cost?', '240 km in
 // 3 hours. How far in 5 hours?'. A row wider than the paper at 52 px is not a break: the
 // sheet fits it (MathsTV fitRows, tv/mathsRows fitRow) down in 2 px steps, and this batch holds it at 40 px or more.
 const S=require(path.join(root,'src/lib/rules/school.ts'));
 const GENS=[S.genRatio,S.genRate];
 const off=[];let n=0,fitted=0,smallest=52;
 for(const g of GENS)for(const tier of [1,2])for(let seed=0;seed<100;seed++){
  const sp=g(seed,tier),q=S.question(sp);n++;
  for(const [form,line,tex] of [['plain',q.plain,false],['tex',q.tex,true]]){
   const st=renderStatus(line,'question',tex);
   if(st==='degrades:too-wide'){
    const px=Math.floor(52*CTX.question.w/listW(T.parseMath(line),52,'print'));
    if(form==='plain'){fitted++;smallest=Math.min(smallest,px);}
    if(px<40)off.push(`${sp.shape} ${tier}/${seed} ${form} ${line}: fits only at ${px} px`);
   }else if(st!=='renders')off.push(`${sp.shape} ${tier}/${seed} ${form} ${line}: ${st}`);
   let fr=0;T.walk(T.parseMath(line),(x)=>{if(x.t==='frac')fr++;});
   if(fr!==0)off.push(`${sp.shape} ${tier}/${seed} ${form} ${line}: ${fr} stacked fractions`);
   const flat=T.flatten(T.parseMath(line)),bare=flat.replace(/\s/g,'');
   for(const d of sp.expr.match(/\d+(?:\.\d+)?/g))if(!flat.includes(d))off.push(`${line}: ${d} is lost (${flat})`);
   for(const r of sp.expr.match(/\d+:\d+/g)??[])if(!bare.includes(r))off.push(`${line}: the ratio ${r} is lost (${flat})`);
   if(sp.unit&&!/[€£]|kg|grams|km|metres|cm|litres|ml|minutes|dollars/.test(flat))off.push(`${line}: the unit ${sp.unit} is lost (${flat})`);
  }
 }
 console.log(`# 7d: ${n} batch-3 questions, ${fitted} fitted below 52 px, the smallest at ${smallest} px`);
 assert.equal(n,GENS.length*200);
 assert.equal(off.length,0,'a W7 batch-3 school question that does not set cleanly:\n'+off.join('\n'));
});

after(()=>{
 // the baseline table: topic x example -> render (plain | tex), check
 const pad=(s,n)=>String(s).padEnd(n);
 const lines=['','Calculus 1 baseline (render plain | render tex | verify.ts check)'];
 for(const t of TOPICS){
  lines.push(`s${t.sessions.join('-')} ${t.id}`);
  for(const {e,o} of OBS.filter(x=>x.e.topic===t.id))lines.push(`  ${pad(e.id,8)} ${pad(e.kind,8)} ${pad(o.render,34)} | ${pad(o.renderTex??'-',34)} | ${o.check}`);
 }
 const c={renders:0,degrades:0,breaks:0};
 for(const {o} of OBS)for(const s of [o.render,o.renderTex])if(s)c[s.split(':')[0]]++;
 lines.push(`forms: ${c.renders} render, ${c.degrades} degrade, ${c.breaks} break; examples the desk can check in code: ${OBS.filter(x=>x.o.check==='code').length} of ${OBS.length}`);
 // CALC_DEBUG=1: every line of every form that does not simply render, with the estimate behind it
 if(process.env.CALC_DEBUG)for(const {e,o} of OBS)for(const [form,src,st] of [['plain',e.plain,o.render],['tex',e.tex,o.renderTex]]){
  if(!src||st==='renders')continue;const ctx=CTX[e.kind];
  for(const l of src.split('\n')){const n=T.parseMath(l);lines.push(`  ${e.id} ${form} ${ctx.prose?'':`h ${listH(n,ctx.f,ctx.voice).toFixed(1)}/${(T.isTall(n)?3:2)*SQ} w ${(ctx.row?listW(n,ctx.f,ctx.voice):widestPiece(n,ctx.f,ctx.voice)).toFixed(0)}/${ctx.w}`} ${[...lineReasons(l,e.kind,form==='tex').degrades].join(',')} :: ${l}`);}
 }
 console.log(lines.join('\n'));
});
