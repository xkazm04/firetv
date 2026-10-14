/**
 * MB-B20, a step up that steps up: the TOP rung of the two fractions units (rules/school genMixedAddSub, genMixedMulDiv,
 * TOP_TIER_GENERATORS). Tier 3 holds mixed numbers ("1 3/4 + 2 1/3", "3 5/6 ÷ 7/10") and, on an odd seed, a word problem
 * from the closed STORIES list ("A ribbon is 5 3/11 metres long and 3 1/2 metres is cut off. How much ribbon is left?").
 * Property over 2000 seeds per unit: every item is well formed, belongs to its own unit, carries a mixed number, prints in
 * all four systems and reads back to its own spec, never leaks its answer, and is judged right on its answer worked here
 * BY HAND (improper fractions, BigInt) in every system - and wrong one top off. Plus the reader and the leak rule on mixed
 * numbers, and the stories' shape rule. Run with npm test in desk/ (directly: node tools/school-toprung-test.cjs). Pure: no
 * model, no store, no filesystem.
 */
const path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
require('./ts-load.cjs');
const S=require(path.resolve(__dirname,'../desk/src/lib/rules/school.ts'));

const SYSTEMS=['us','uk','cz','de'];
const SEEDS=2000;
const GENS={'frac-add-sub':S.genMixedAddSub,'frac-mul-div':S.genMixedMulDiv};
const gcd=(a,b)=>(b===0n?(a<0n?-a:a):gcd(b,a%b));
/** The value of an expr worked by hand: an optional story id, then two operands (w a/b or a/b) and + - × ÷; [N, D] in lowest terms. */
function byHand(expr){
 const m=/^(?:([a-z]+) )?(?:(\d+) )?(\d+)\/(\d+) ([-+×÷]) (?:(\d+) )?(\d+)\/(\d+)$/.exec(expr);assert.ok(m,expr);
 const B=BigInt,b=B(m[4]),d=B(m[8]),a=B(m[2]||0)*b+B(m[3]),c=B(m[6]||0)*d+B(m[7]);
 const [N,D]={'+':[a*d+c*b,b*d],'-':[a*d-c*b,b*d],'×':[a*c,b*d],'÷':[a*d,b*c]}[m[5]];
 const g=gcd(N,D);return {story:m[1],N:N/g,D:D/g,bottoms:[b,d],mixed:!!(m[2]||m[6])};
}
/** The answer written as a learner would: improper, mixed (when over one), whole (when whole). */
function writings({N,D}){
 const out=[`${N}/${D}`];
 if(D===1n)out.push(String(N));else if(N>D)out.push(`${N/D} ${N%D}/${D}`);
 return out;
}

/** The value as a decimal with one to three places when it has one (and is not whole), else null: '2.75', '4.125'. */
function decimalOf({N,D}){
 if(D===1n)return null;
 for(const k of [1,2,3]){const s=10n**BigInt(k);if((N*s)%D===0n){const v=String((N*s)/D).padStart(k+1,'0');return `${v.slice(0,-k)}.${v.slice(-k)}`;}}
 return null;
}

for(const [unit,gen] of Object.entries(GENS)){
 test(`MB-B20 ${unit}: ${SEEDS} seeds - a mixed number, its own unit, a story on every odd seed, printed and read back in all four systems, no leak, judged right by a hand-worked answer`,()=>{
  const stories=new Set();let bare=0,story=0;
  for(let seed=0;seed<SEEDS;seed++){
   const spec=gen(seed);
   assert.deepEqual(gen(seed),spec,'pure: same seed, same spec');
   assert.ok(S.wellFormed(spec).ok,JSON.stringify(spec));
   assert.equal(S.unitOf(spec),unit,`${spec.expr}: its own unit`);
   const h=byHand(spec.expr);
   assert.ok(h.mixed,`${spec.expr}: a mixed number`);
   assert.equal(!!S.storyOf(spec),seed%2===1,`${spec.expr}: a word problem on an odd seed only`);
   if(h.story){story++;stories.add(h.story);assert.equal(S.storyOf(spec),h.story);}else bare++;
   // the level: a common bottom of 36 at most on add and subtract; a bare product's answer bottom 60 at most, a story's 12
   if(unit==='frac-add-sub'){const [b,d]=h.bottoms;assert.ok((b*d)/gcd(b,d)<=36n,spec.expr);assert.notEqual(h.D,1n,'a fractions answer');}
   else assert.ok(h.story?h.D<=12n:h.D<=60n&&h.D!==1n,spec.expr);
   if(h.story==='rope')assert.equal(h.D,1n,'a rope is cut into a whole number of pieces');
   for(const sys of SYSTEMS){
    const q=S.question(spec,sys);assert.ok(q&&q.plain&&q.tex,`${spec.expr} prints in ${sys}`);
    assert.deepEqual(S.specFromQuestion(q.plain,sys),spec,`${sys}: ${q.plain} reads back`);
    assert.equal(S.leaksSchool(spec,q.plain),false,`${sys}: ${q.plain} does not give its answer away`);
    // the answer is not a number the question prints, and the TeX prints every mixed number as a whole part before a stacked fraction
    if(h.D===1n)assert.ok(!(q.plain.match(/\d+/g)||[]).includes(String(h.N)),q.plain);
    for(const [,w,n,d] of spec.expr.matchAll(/(\d+) (\d+)\/(\d+)/g))assert.ok(q.tex.includes(`${w}\\frac{${n}}{${d}}`),q.tex);
    assert.ok(!q.tex.includes('/'),`no flat slash in the TeX: ${q.tex}`);
    for(const w of writings(h)){
     assert.equal(S.check(spec,w,sys).verdict,'right',`${sys}: ${w} for ${q.plain}`);
     if(spec.unit)assert.equal(S.check(spec,`${w} ${spec.unit}`,sys).verdict,'right',`${sys}: ${w} ${spec.unit}`);
    }
    assert.equal(S.check(spec,`${h.N+1n}/${h.D}`,sys).verdict,'wrong',`${sys}: one top off is wrong`);
    // a value with a short exact decimal, written in the system's own way: a decimal comma in cz and de is right there and
    // never right in us or uk (where '2,75' is no decimal)
    const dec=decimalOf(h);
    if(dec){
     const comma=dec.replace('.',','),cz=sys==='cz'||sys==='de';
     assert.equal(S.check(spec,cz?comma:dec,sys).verdict,'right',`${sys}: ${cz?comma:dec}`);
     if(!cz)assert.notEqual(S.check(spec,comma,sys).verdict,'right',`${sys}: ${comma} is not a decimal here`);
    }
   }
   // the worked answer code would show agrees with the hand
   const shown=S.workedAnswer(spec,'uk');assert.ok(shown,spec.expr);
   assert.ok(writings(h).some((w)=>shown===w||shown===`${w} ${spec.unit}`),`${spec.expr}: ${shown}`);
  }
  assert.equal(story,SEEDS/2);assert.equal(bare,SEEDS/2);
  assert.deepEqual([...stories].sort(),unit==='frac-add-sub'?['apples','juice','ribbon','walk']:['rice','rope']);
 });
}

test('MB-B20 the top rung belongs to the two fractions units only, and a bad seed is null',()=>{
 assert.deepEqual(Object.keys(S.TOP_TIER_GENERATORS).sort(),['frac-add-sub','frac-mul-div']);
 assert.equal(S.topGeneratorFor('pct-change'),null);assert.equal(S.topGeneratorFor('constructor'),null);
 for(const bad of [-1,1.5,NaN,'1',null,undefined,2**32])for(const g of Object.values(GENS))assert.equal(g(bad),null);
 // tiers 1 and 2 are untouched: the unit generators still refuse tier 3
 assert.equal(S.gen(1,3),null);assert.equal(S.genMulDiv(1,3),null);
});

test('MB-B20 the reader: a mixed number reads as a fraction operand in a bare sum or a story; a poor one is refused',()=>{
 const cs=(expr,extra={})=>({shape:'compute',expr,...extra});
 for(const [text,want] of [
  ['1 3/4 + 2 1/3',cs('1 3/4 + 2 1/3')],['Work out 3 1/2 - 1 3/4.',cs('3 1/2 - 1 3/4')],['What is 2 1/4 × 1 2/3?',cs('2 1/4 × 1 2/3')],
  ['4 1/2 divided by 3/4',cs('4 1/2 ÷ 3/4')],['5/6 + 1 1/4',cs('5/6 + 1 1/4')],['Work out 1 1/2 + 3/4. Give your answer in its simplest form.',cs('1 1/2 + 3/4',{form:'simplest'})],
  ['A walk is 1 3/4 km to the lake and 2 1/3 km back. How far is the whole walk?',cs('walk 1 3/4 + 2 1/3',{unit:'km'})],
  ['a rope 4 1/2 metres long is cut into pieces 3/4 metres long. how many pieces are there',cs('rope 4 1/2 ÷ 3/4')],
  // refused: a fraction part that is not proper, a whole part of 0, a hyphen, a story with the wrong operation in it, a third operand
  ['1 3/2 + 1/4',null],['0 1/2 + 1/4',null],['1-1/2 + 1/4',null],['1 1/2 + 1 1/2 + 1/2',null],['1 1/2 + 2',null],
  ['A walk is 3 3/4 km to the lake and 1 1/4 km back. How far is the whole walk? Give your answer in metres.',null],
  ['A walk is three km to the lake and 2 1/3 km back. How far is the whole walk?',null],
 ]){
  const got=S.specFromQuestion(text,'uk');
  assert.deepEqual(got,want,text);
  if(want)assert.ok(S.wellFormed(got).ok);
 }
});

test('MB-B20 a story must fit its expression: its operation, two fractions or mixed numbers, its own unit, no form',()=>{
 const ok=(spec)=>S.wellFormed(spec).ok;
 assert.ok(ok({shape:'compute',expr:'walk 1 3/4 + 2 1/3',unit:'km'}));
 assert.ok(ok({shape:'compute',expr:'rope 4 1/2 ÷ 3/4'}));
 for(const bad of [
  {shape:'compute',expr:'walk 3 3/4 - 1 1/4',unit:'km'},{shape:'compute',expr:'walk 1 3/4 + 2 1/3'},{shape:'compute',expr:'walk 1 3/4 + 2 1/3',unit:'kg'},
  {shape:'compute',expr:'walk 1 3/4 + 2 1/3',unit:'km',form:'simplest'},{shape:'compute',expr:'rope 4 1/2 ÷ 3/4',unit:'m'},{shape:'compute',expr:'walk 1 + 2',unit:'km'},
  {shape:'compute',expr:'walk 1 3/4 + 2 1/3 + 1/2',unit:'km'},{shape:'compute',expr:'march 1 3/4 + 2 1/3',unit:'km'},{shape:'compute',expr:'1 0/4 + 1/2'},{shape:'compute',expr:'1 5/4 + 1/2'},
 ])assert.equal(ok(bad),false,JSON.stringify(bad));
 assert.equal(S.storyOf({shape:'compute',expr:'1 3/4 + 2/3'}),null);assert.equal(S.storyOf('junk'),null);
 // every story says one situation and asks one question, with no number word in it (the leak check reads words as numbers)
 for(const [id,st] of Object.entries(S.STORIES)){
  assert.match(st.text,/^[A-Z][^?]*\{A\}[^?]*\{B\}[^?]*\?$/,id);
  assert.doesNotMatch(st.text,/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|half|quarter|third)\b|\d/i,id);
 }
});

test('MB-B20 the leak rule on a mixed-number item: the answer in any form and its fractional part leak; the operands as improper fractions and the whole parts are steps',()=>{
 const spec={shape:'compute',expr:'1 3/4 + 2 1/3'}; // 49/12 = 4 1/12
 for(const hint of ['The answer is 4 1/12.','It comes to 49/12.','You get about 4.08.','Then add 1/12 to the whole parts.','Add the wholes and the fractions: 3 + 13/12.'])
  assert.equal(S.leaksSchool(spec,hint),true,hint);
 for(const hint of ['Write each as an improper fraction: 7/4 + 7/3.','Add the whole parts first: 1 + 2.','Make the bottoms the same: 21/12 and 28/12.'])
  assert.equal(S.leaksSchool(spec,hint),false,hint);
 const rope={shape:'compute',expr:'rope 4 1/2 ÷ 3/4'}; // 6 pieces
 assert.equal(S.leaksSchool(rope,'That makes 6 pieces.'),true);
 assert.equal(S.leaksSchool(rope,'Write the rope as 9/2 and turn 3/4 over.'),false);
});
