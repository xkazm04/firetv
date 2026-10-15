/**
 * MB-B20, a step up that steps up: the TOP rung of the two fractions units (rules/school genMixedAddSub, genMixedMulDiv,
 * TOP_TIER_GENERATORS). Tier 3 holds mixed numbers ("1 3/4 + 2 1/3", "3 5/6 ÷ 7/10") and, on an odd seed, a word problem
 * from the closed STORIES list ("A ribbon is 5 3/11 metres long and 3 1/2 metres is cut off. How much ribbon is left?").
 * Property over 2000 seeds per unit: every item is well formed, belongs to its own unit, carries a mixed number, prints in
 * all four systems and reads back to its own spec, never leaks its answer, and is judged right on its answer worked here
 * BY HAND (improper fractions, BigInt) in every system - and wrong one top off. Plus the reader and the leak rule on mixed
 * numbers, and the stories' shape rule. The top rungs of percent change (genPercentTop: the amount before a change, two
 * changes in turn, a change over the years; a money story on every odd seed) and Pythagoras (genPythagorasTop: sides with
 * a decimal, the answer rounded to the places asked; a ladder, a screen or a field on every odd seed) take the same property
 * over 2000 seeds, their answers worked by hand in BigInt, a rounded side judged by the rulings MK5 / D2 R1a; so does the
 * top rung of probability (genProbabilityTop: two dice, a coin with a dice or a spinner, two counters without replacement;
 * socks, sweets or a coin-and-dice game on every odd seed), its fraction right in any equal form. Run with npm
 * test in desk/ (directly: node tools/school-toprung-test.cjs). Pure: no model, no store, no filesystem.
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

test('MB-B20 the top rung belongs to the two fractions units, percent change, Pythagoras and probability only, and a bad seed is null',()=>{
 assert.deepEqual(Object.keys(S.TOP_TIER_GENERATORS).sort(),['frac-add-sub','frac-mul-div','pct-change','probability','pythagoras']);
 assert.equal(S.topGeneratorFor('ratio-share'),null);assert.equal(S.topGeneratorFor('constructor'),null);
 for(const bad of [-1,1.5,NaN,'1',null,undefined,2**32])for(const g of [...Object.values(GENS),S.genPercentTop,S.genPythagorasTop,S.genProbabilityTop])assert.equal(g(bad),null);
 // the registered top rungs are the generators themselves, a money amount in the learner's own currency (MB-B4)
 for(let seed=0;seed<200;seed++){
  assert.deepEqual(S.TOP_TIER_GENERATORS.pythagoras(seed,'cz'),S.genPythagorasTop(seed));
  assert.deepEqual(S.TOP_TIER_GENERATORS.probability(seed,'cz'),S.genProbabilityTop(seed));
  const raw=S.genPercentTop(seed);
  for(const [sys,own] of [['cz','Kč'],['de','€'],['uk','£']]){
   const got=S.TOP_TIER_GENERATORS['pct-change'](seed,sys);
   assert.deepEqual(got,['€','£','$'].includes(raw.unit)?{...raw,unit:own}:raw,`${sys} ${seed}`);
   assert.ok(S.wellFormed(got).ok);
  }
  assert.deepEqual(S.TOP_TIER_GENERATORS['pct-change'](seed),raw,'no system: as drawn');
 }
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

// ------------------------------------------------------------------ MB-B20, the top rung of percent change and Pythagoras

const isqrt=(n)=>{if(n<2n)return n;let x=n,y=(x+1n)/2n;while(y<x){x=y;y=(x+n/x)/2n;}return x;};
/** A percent change worked by hand from its expr: the reverse, two changes, or the years; [N, D] in lowest terms. */
function pctByHand(expr){
 const m=/^(?:([a-z]+) )?(?:before (increase|decrease) (\d+) by (\d+)%|(increase|decrease) (\d+) by (\d+)%(?: then (increase|decrease) by (\d+)%| for (\d) years))$/.exec(expr);assert.ok(m,expr);
 const B=BigInt,f=(v,p)=>[100n+(v==='increase'?B(p):-B(p)),100n];
 let N,D;
 if(m[2]){const [a,b]=f(m[2],m[4]);N=B(m[3])*b;D=a;}
 else if(m[8]){const [a,b]=f(m[5],m[7]),[c,d]=f(m[8],m[9]);N=B(m[6])*a*c;D=b*d;}
 else{const [a,b]=f(m[5],m[7]);N=B(m[6]);D=1n;for(let i=0;i<Number(m[10]);i++){N*=a;D*=b;}}
 const g=gcd(N,D);return {story:m[1],form:m[2]?'before':m[8]?'then':'years',N:N/g,D:D/g};
}
/** A value to two places at most as a learner writes it: '450', '176.4', '2405.7'. */
function plainOf({N,D}){
 for(const k of [0,1,2]){const s=10n**BigInt(k);if((N*s)%D===0n){if(k===0)return String((N*s)/D);const v=String((N*s)/D).padStart(k+1,'0');return `${v.slice(0,-k)}.${v.slice(-k)}`;}}
 assert.fail(`${N}/${D} is not to the cent`);
}
/** The side worked by hand: the sides in tenths squared (BigInt), then √ rounded half up to `dp` places, as a string. */
function sideByHand(expr){
 const m=/^(longest|shorter|ladder|screen|field) ([\d.]+) ([\d.]+) dp([12])$/.exec(expr);assert.ok(m,expr);
 const t=(s)=>BigInt(Math.round(Number(s)*10)),x=t(m[2]),y=t(m[3]),dp=Number(m[4]);
 const find=m[1]==='ladder'||m[1]==='shorter'?'shorter':'longest',S100=find==='longest'?x*x+y*y:x*x-y*y;
 const at=(k)=>{const M=S100*10n**BigInt(2*k-2),f=isqrt(M);const r=(2n*f+1n)**2n<=4n*M?f+1n:f;const s=String(r).padStart(k+1,'0');return `${s.slice(0,-k)}.${s.slice(-k)}`;};
 return {story:['ladder','screen','field'].includes(m[1])?m[1]:undefined,find,dp,x,y,S100,answer:at(dp),finer:at(dp+1),exact:isqrt(S100)**2n===S100};
}
const comma=(s,sys)=>(sys==='cz'||sys==='de'?s.replace('.',','):s);

test(`MB-B20 pct-change: ${SEEDS} seeds - a reverse, two changes or the years, its own unit, a story on every odd seed, printed and read back in all four systems, no leak, judged right by a hand-worked answer`,()=>{
 const stories=new Set(),forms=new Set();
 for(let seed=0;seed<SEEDS;seed++){
  const spec=S.genPercentTop(seed);
  assert.deepEqual(S.genPercentTop(seed),spec,'pure: same seed, same spec');
  assert.ok(S.wellFormed(spec).ok,JSON.stringify(spec));
  assert.equal(S.unitOf(spec),'pct-change',spec.expr);
  const h=pctByHand(spec.expr);forms.add(h.form);
  assert.equal(!!S.storyOf(spec),seed%2===1,`${spec.expr}: a word problem on an odd seed only`);
  if(h.story){stories.add(h.story);assert.equal(S.storyOf(spec),h.story);assert.ok(['€','£'].includes(spec.unit),'a story is money');}
  else forms.add(`bare ${h.form}`);
  const ans=plainOf(h),cents=/\.\d$/.test(ans)?`${ans}0`:ans;
  for(const sys of SYSTEMS){
   const q=S.question(spec,sys);assert.ok(q&&q.plain&&q.tex,`${spec.expr} prints in ${sys}`);
   assert.deepEqual(S.specFromQuestion(q.plain,sys),spec,`${sys}: ${q.plain} reads back`);
   assert.equal(S.leaksSchool(spec,q.plain),false,`${sys}: ${q.plain} does not give its answer away`);
   assert.doesNotMatch(q.plain,/\{|\}/,'every placeholder filled');
   if(h.D===1n)assert.ok(!(q.plain.match(/\d+/g)||[]).includes(String(h.N)),q.plain);
   for(const w of [ans,cents])assert.equal(S.check(spec,comma(w,sys),sys).verdict,'right',`${sys}: ${comma(w,sys)} for ${q.plain}`);
   assert.equal(S.check(spec,`${comma(cents,sys)} ${spec.unit}`,sys).verdict,'right',`${sys}: with its unit`);
   assert.equal(S.check(spec,comma(plainOf({N:h.N+h.D,D:h.D}),sys),sys).verdict,'wrong',`${sys}: one more is wrong`);
   assert.equal(S.check(spec,`${comma(ans,sys)}%`,sys).verdict,'unsure',`${sys}: an amount as a percentage is unsure`);
  }
  const shown=S.workedAnswer(spec,'uk');assert.ok(shown,spec.expr);assert.equal(S.check(spec,shown,'uk').verdict,'right');
  assert.ok(shown.replace(/[^\d.]/g,'')===cents||shown.replace(/[^\d.]/g,'')===ans,`${spec.expr}: ${shown}`);
 }
 assert.deepEqual([...stories].sort(),['bike','car','rise','sale','savings']);
 for(const f of ['before','then','years'])assert.ok(forms.has(`bare ${f}`),`a bare ${f}`);
});

test(`MB-B20 pythagoras: ${SEEDS} seeds - sides with decimals or a word problem, the answer rounded to the places asked, printed and read back in all four systems, no leak, judged by the rounding rulings`,()=>{
 const stories=new Set();let decimalSides=0,shorter=0,two=0;
 for(let seed=0;seed<SEEDS;seed++){
  const spec=S.genPythagorasTop(seed);
  assert.deepEqual(S.genPythagorasTop(seed),spec,'pure: same seed, same spec');
  assert.ok(S.wellFormed(spec).ok,JSON.stringify(spec));
  assert.equal(S.unitOf(spec),'pythagoras',spec.expr);
  const h=sideByHand(spec.expr);
  assert.equal(h.exact,false,`${spec.expr}: the side is no whole number, nor any exact decimal`);
  assert.equal(!!S.storyOf(spec),seed%2===1,`${spec.expr}: a word problem on an odd seed only`);
  if(h.story){stories.add(h.story);assert.equal(h.dp,1);}
  else{assert.ok(/\./.test(spec.expr.split(' dp')[0]),`${spec.expr}: a side with a decimal`);decimalSides++;}
  if(h.find==='shorter')shorter++;if(h.dp===2)two++;
  assert.doesNotMatch(h.answer,/0$/,'the rounded side ends in no zero');assert.ok(Number(h.answer)>=1);
  for(const sys of SYSTEMS){
   const q=S.question(spec,sys);assert.ok(q&&q.plain&&q.tex,`${spec.expr} prints in ${sys}`);
   assert.match(q.plain,h.dp===1?/Give your answer to 1 decimal place\.$/:/Give your answer to 2 decimal places\.$/);
   assert.deepEqual(S.specFromQuestion(q.plain,sys),spec,`${sys}: ${q.plain} reads back`);
   assert.equal(S.leaksSchool(spec,q.plain),false,`${sys}: ${q.plain} does not give its answer away`);
   const unitWord=spec.unit==='m'?'metres':spec.unit;
   for(const w of [h.answer,h.finer,`${h.answer} ${spec.unit}`,`${h.answer} ${unitWord}`])
    assert.equal(S.check(spec,comma(w,sys),sys).verdict,'right',`${sys}: ${comma(w,sys)} for ${q.plain}`);
   // the leak rule refuses the side and any finer rounding of it
   for(const w of [h.answer,h.finer])assert.equal(S.leaksSchool(spec,`The side is ${comma(w,sys)} ${spec.unit}.`),true,`${sys}: ${w} leaks`);
   // two units of the last place off is no rounding: wrong; a fraction is unsure
   // (two units up, or three when two would end in a zero, which the old path reads at one place fewer)
   const up=(n)=>(Number(h.answer)+n*10**-h.dp).toFixed(h.dp),off=/0$/.test(up(2))?up(3):up(2);
   assert.equal(S.check(spec,comma(off,sys),sys).verdict,'wrong',`${sys}: ${off} is wrong`);
   assert.equal(S.check(spec,'1/3',sys).verdict,'unsure');
  }
  const shown=S.workedAnswer(spec,'uk');assert.ok(shown,spec.expr);
  assert.ok(shown===`${h.answer} ${spec.unit}`||shown===h.answer,`${spec.expr}: ${shown}`);
 }
 assert.deepEqual([...stories].sort(),['field','ladder','screen']);
 assert.ok(decimalSides===SEEDS/2&&shorter>SEEDS/8&&two>SEEDS/8,`${decimalSides} ${shorter} ${two}`);
});

test('MB-B20 the rounding rulings on a rounded side (MK5 / D2 R1a, the school rounding rule as the old path), and its slips',()=>{
 const spec={shape:'pythagoras',expr:'longest 4 6 dp1',unit:'cm'}; // the root of 52 = 7.2111...
 assert.equal(S.wellFormed({shape:'pythagoras',expr:'longest 4 6',unit:'cm'}).ok,false,'tier 1/2 asks for whole sides only, as before');
 const v=(a,sys='uk')=>S.check(spec,a,sys);
 for(const a of ['7.2','7.21','7.211','7.2 cm','x = 7.2','c = 7.21 cm'])assert.equal(v(a).verdict,'right',a);
 assert.equal(v('7,2','cz').verdict,'right');assert.equal(v('7,2','uk').verdict,'unsure','a comma is no decimal in uk');
 // a correct rounding of fewer than two figures, or a whole number, is never wrong: unsure
 assert.equal(v('7').verdict,'unsure');
 // not a correct rounding: within one unit of its last place (trailing zeros aside) unsure, else wrong
 for(const a of ['7.3','7.20','7.22'])assert.equal(v(a).verdict,'unsure',a);
 for(const a of ['7.1','7.4','8.2','7.23'])assert.equal(v(a).verdict,'wrong',a);
 assert.equal(v('36/5').verdict,'unsure','a fraction: the question asks for a decimal');
 assert.equal(v('720%').verdict,'unsure');assert.equal(v('7.2 kg').verdict,'unsure');
 assert.deepEqual([v('52').slip,v('10').slip],['pyth-no-root','pyth-sides-added']);
 const sh={shape:'pythagoras',expr:'shorter 6 4 dp1',unit:'cm'}; // the root of 20 = 4.472...
 assert.equal(S.check(sh,'4.5','uk').verdict,'right');assert.equal(S.check(sh,'4.47','uk').verdict,'right');
 assert.deepEqual(['7.2','20','52'].map((a)=>S.check(sh,a,'uk').slip),['pyth-squares-added','pyth-no-root','pyth-squares-added']);
 // bounds: an exact side, a rounded side ending in a zero, a side past 100, a trailing zero, a shorter side not shorter
 for(const bad of ['longest 3 4 dp1','longest 1.5 2 dp1','longest 4 6 dp3','longest 101 6 dp1','longest 4.0 6 dp1','shorter 4 6 dp1'])
  assert.equal(S.wellFormed({shape:'pythagoras',expr:bad,unit:'cm'}).ok,false,bad);
 assert.equal(S.wellFormed({shape:'pythagoras',expr:'ladder 6 2.5 dp1',unit:'cm'}).ok,false);assert.ok(S.wellFormed({shape:'pythagoras',expr:'ladder 6 2.5 dp1',unit:'m'}).ok);
 // the leak rule: the side, a finer rounding, a value within a tenth, the squared total under a root (in any system)
 const ROOT='√';
 for(const hint of ['It comes to about 7.2 cm.','Roughly 7.21.','Close to 7.3.',`The side is ${ROOT}52.`,'Take the square root of 52.','Odmocni 52.'])assert.equal(S.leaksSchool(spec,hint),true,hint);
 for(const hint of ['Square both sides: 16 and 36.','Add the squares: 16 + 36 = 52.','Then take the square root of the total.','Round at the end, not before.'])assert.equal(S.leaksSchool(spec,hint),false,hint);
 const dec={shape:'pythagoras',expr:'longest 2.5 6.3 dp2',unit:'m'}; // 6.25 + 39.69 = 45.94
 assert.equal(S.leaksSchool(dec,'The square root of 45,94 is the side.'),true,'a decimal comma total under a root');
});

test('MB-B20 the reverse, the two changes and the years on percent change: values, bounds and the leak rule',()=>{
 const pc=(expr,unit)=>({shape:'percent-change',expr,...(unit?{unit}:{})}),val=(spec)=>S.workedAnswer(spec,'uk');
 assert.equal(val(pc('before increase 540 by 20%','€')),'€450');
 assert.equal(val(pc('increase 200 by 10% then decrease by 20%')),'176');
 assert.equal(val(pc('savings increase 800 by 5% for 2 years','£')),'£882');
 assert.equal(val(pc('sale before decrease 540 by 10%','Kč')),'600 Kč');
 for(const bad of [pc('before increase 540 by 7%'),pc('increase 333 by 3% for 5 years'),pc('rise before decrease 540 by 10%','€'),pc('savings increase 800 by 5% for 2 years','kg'),pc('sale before decrease 540 by 10%'),pc('increase 200 by 10% for 6 years'),pc('before decrease 540 by 100%'),pc('march before increase 540 by 20%','€')])
  assert.equal(S.wellFormed(bad).ok,false,JSON.stringify(bad));
 // the tier-1/2 expr is read exactly as before
 assert.ok(S.wellFormed(pc('increase 60 by 15%','€')).ok);assert.equal(S.storyOf(pc('increase 60 by 15%','€')),null);
 const spec=pc('before increase 540 by 20%','€');
 for(const hint of ['It was €450.','Divide 540 by 1.2 to get it.','540 ÷ 1.2 = 450.'])assert.equal(S.leaksSchool(spec,hint),true,hint);
 for(const hint of ['The new price is 120% of the old one.','Think of 540 as 120% of the price before.','Do not take 20% off the new price.'])assert.equal(S.leaksSchool(spec,hint),false,hint);
 // the stories: one situation and one question, no number word
 for(const [id,st] of [...Object.entries(S.PCT_STORIES),...Object.entries(S.PYTH_STORIES)]){
  assert.match(st.text,/^[A-Z][^?]*\?$/,id);
  assert.doesNotMatch(st.text,/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|half|quarter|third|once|twice)\b|\d/i,id);
 }
});

test('MB-B20 the fixed sentence after a second leak: a reverse percentage, a change in turns and two events get their own (never the unit\'s method), a rounded side the unit\'s; none leaks',()=>{
 const words=(s)=>s.trim().split(/\s+/).length;
 assert.deepEqual(Object.keys(S.TOP_WITHHELD).sort(),['pct-before','pct-steps','prob-and','prob-draw','prob-least']);
 for(const line of Object.values(S.TOP_WITHHELD)){assert.ok(words(line)<=25,line);assert.doesNotMatch(line,/\d/,line);assert.match(line,/The answer is yours to work out\.$/);}
 for(let seed=0;seed<SEEDS;seed++){
  const p=S.genPercentTop(seed),h=pctByHand(p.expr),line=S.withheldSchool(p);
  assert.equal(line,S.TOP_WITHHELD[h.form==='before'?'pct-before':'pct-steps'],p.expr);
  assert.equal(S.leaksSchool(p,line),false,`${p.expr}: ${line}`);
  const y=S.genPythagorasTop(seed);
  assert.equal(S.withheldSchool(y),S.SCHOOL_WITHHELD.pythagoras);assert.equal(S.leaksSchool(y,S.SCHOOL_WITHHELD.pythagoras),false,y.expr);
 }
 assert.equal(S.withheldSchool({shape:'percent-change',expr:'increase 60 by 15%'}),S.SCHOOL_WITHHELD['pct-change'],'a tier-1/2 change keeps the unit\'s line');
 // MB-B20: a top-rung probability item gets its own line by kind (never the unit's one-draw-from-a-bag line); none leaks; a single draw keeps the unit's
 for(let seed=0;seed<SEEDS;seed++){
  const p=S.genProbabilityTop(seed),h=probByHand(p.expr),line=S.withheldSchool(p);
  assert.equal(line,S.TOP_WITHHELD[h.form==='dice-least'?'prob-least':h.form.startsWith('draw')?'prob-draw':'prob-and'],p.expr);
  assert.equal(S.leaksSchool(p,line),false,`${p.expr}: ${line}`);
 }
 for(const line of ['prob-and','prob-draw','prob-least'].map((k)=>S.TOP_WITHHELD[k]))assert.doesNotMatch(line,/\b(?:one|two|three|four|five|six|half|first|second)\b/i,line);
 assert.equal(S.withheldSchool({shape:'probability',expr:'bag red 3, blue 5, green 2 ask red'}),S.SCHOOL_WITHHELD.probability,'a single draw keeps the unit\'s line');
});

/** The top rung's own slip worked by hand: the percent of the new amount (a reverse), the percentages added (two changes, the years); null at zero or below. */
function pctSlipByHand(expr){
 const m=/^(?:([a-z]+) )?(?:before (increase|decrease) (\d+) by (\d+)%|(increase|decrease) (\d+) by (\d+)%(?: then (increase|decrease) by (\d+)%| for (\d) years))$/.exec(expr);assert.ok(m,expr);
 const sg=(v,p)=>(v==='increase'?BigInt(p):-BigInt(p));
 let id,base,pct;
 if(m[2]){id='pct-of-new';base=BigInt(m[3]);pct=-sg(m[2],m[4]);}
 else if(m[8]){id='pct-added';base=BigInt(m[6]);pct=sg(m[5],m[7])+sg(m[8],m[9]);}
 else{id='pct-added';base=BigInt(m[6]);pct=BigInt(m[10])*sg(m[5],m[7]);}
 const N=base*(100n+pct),D=100n;if(N<=0n)return null;
 const g=gcd(N,D);return {id,N:N/g,D:D/g};
}

test('MB-B20 the top rung names its own slips: the percent taken of the new amount and the percentages added, never the forward list\'s',()=>{
 const M=require(path.resolve(__dirname,'../desk/src/lib/rules/maths.ts'));
 const pc=(expr,unit)=>({shape:'percent-change',expr,...(unit?{unit}:{})}),slipOf=(spec,a)=>S.check(spec,a,'uk');
 assert.deepEqual(S.SCHOOL_TOP_SLIPS['pct-change'],['pct-of-new','pct-added']);
 // the commonest: 20% off a price after a 20% rise (432 for 450), 10% on after a 10% sale (594 for 600)
 const off=slipOf(pc('before increase 540 by 20%','€'),'€432');assert.deepEqual([off.verdict,off.slip],['wrong','pct-of-new']);
 assert.equal(slipOf(pc('before increase 540 by 20%','€'),'432').slip,'pct-of-new');
 assert.equal(slipOf(pc('sale before decrease 540 by 10%','€'),'€594').slip,'pct-of-new');
 // the percentages added: +10% then -20% as -10% (180 for 176), 5% for two years as 10% simple (880 for 882), up and down the same as no change
 assert.equal(slipOf(pc('increase 200 by 10% then decrease by 20%'),'180').slip,'pct-added');
 assert.equal(slipOf(pc('savings increase 800 by 5% for 2 years','£'),'£880').slip,'pct-added');
 assert.equal(slipOf(pc('increase 200 by 10% then decrease by 10%'),'200').slip,'pct-added');
 // a value no slip gives stays the plain wrong; the answer stays right; the forward slips are not this rung's
 for(const a of ['500','648','108'])assert.deepEqual([slipOf(pc('before increase 540 by 20%','€'),a).verdict,slipOf(pc('before increase 540 by 20%','€'),a).slip],['wrong',undefined],a);
 assert.equal(slipOf(pc('before increase 540 by 20%','€'),'450').verdict,'right');
 // a decrease past nothing is no amount: 50% off for three years added is no slip
 assert.equal(pctSlipByHand('decrease 800 by 50% for 3 years'),null);
 // the usual change is as it was
 assert.equal(slipOf(pc('increase 60 by 15%','€'),'51').slip,'change-wrong-way');
 assert.deepEqual(M.slipsFor('pct-change').map((s)=>s.id),[...S.SCHOOL_UNIT_SLIPS['pct-change']],'the unit\'s list (and the explain prompt) is unchanged');
 // the desk's line is the slip's own words, no value; a model's pick of a top slip is never taken
 const says=(id)=>S.SCHOOL_SLIPS.find((s)=>s.id===id).says;
 assert.deepEqual(M.settleSpec(3,pc('before increase 540 by 20%','€'),'€432',undefined,'pct-change'),{verdict:'wrong',slip:'pct-of-new',said:says('pct-of-new')});
 assert.deepEqual(M.settleSpec(4,pc('increase 200 by 10% then decrease by 20%'),'180','pct-of-new','pct-change'),{verdict:'wrong',slip:'pct-added',said:says('pct-added')});
 assert.equal(M.settled(5,false,'pct-added','pct-change').slip,undefined,'a pick not named by code');
 assert.equal(M.slip('pct-of-new','pct-change').name,'Took the percent of the new amount');
 // property: every seed's own slip, worked by hand, is named; its line never leaks the item's answer
 let named=0;
 for(let seed=0;seed<SEEDS;seed++){
  const p=S.genPercentTop(seed),h=pctSlipByHand(p.expr),t=pctByHand(p.expr);
  if(!h||(h.N===t.N&&h.D===t.D))continue;
  const v=S.check(p,plainOf(h),'uk');
  assert.deepEqual([v.verdict,v.slip],['wrong',h.id],`${p.expr}: ${plainOf(h)}`);named++;
  assert.equal(S.leaksSchool(p,says(h.id)),false,p.expr);
 }
 assert.ok(named>SEEDS*0.9,`named on ${named} of ${SEEDS}`);
});

test('MB-B20 a side of one metre is printed in the singular and read back',()=>{
 const spec={shape:'pythagoras',expr:'ladder 3 1 dp1',unit:'m'};
 assert.ok(S.wellFormed(spec).ok);
 const q=S.question(spec,'uk').plain;
 assert.match(q,/its foot 1 metre from the wall/);assert.doesNotMatch(q,/\b1 metres\b/);
 for(const sys of SYSTEMS)assert.deepEqual(S.specFromQuestion(S.question(spec,sys).plain,sys),spec,sys);
});

// ------------------------------------------------------------------ MB-B20, the top rung of probability

/** A top-rung probability worked by hand from its expr: two dice, a coin with a dice or a spinner, two counters without replacement; [N, D] in lowest terms, and `raw` before cancelling. */
function probByHand(expr){
 const m=/^(?:(socks|sweets|game) )?(.+)$/.exec(expr),body=m[2],B=BigInt;
 const dice=(e)=>(e==='even'||e==='odd'?[3n,6n]:e.startsWith('over ')?[6n-B(e.slice(5)),6n]:[1n,6n]);
 const bag=(t)=>Object.fromEntries(t.split(', ').map((x)=>{const [c,n]=x.split(' ');return [c,B(n)];}));
 const sum=(s)=>Object.values(s).reduce((x,y)=>x+y,0n);
 let N,D,form,d;
 if((d=/^dice least (.+)$/.exec(body))){const [a,b]=dice(d[1]);N=b*b-(b-a)*(b-a);D=b*b;form='dice-least';}
 else if((d=/^dice (\S+|over \d) and (\S+|over \d)$/.exec(body))){const [a,b]=dice(d[1]),[c,e]=dice(d[2]);N=a*c;D=b*e;form='dice-and';}
 else if((d=/^coin (heads|tails) and dice (.+)$/.exec(body))){const [a,b]=dice(d[2]);N=a;D=2n*b;form='coin-dice';}
 else if((d=/^coin (heads|tails) and spinner (.+) ask (\w+)$/.exec(body))){const s=bag(d[2]);N=s[d[3]];D=2n*sum(s);form='coin-spin';}
 else if((d=/^draw (.+) both (\w+)$/.exec(body))){const s=bag(d[1]),t=sum(s);N=s[d[2]]*(s[d[2]]-1n);D=t*(t-1n);form='draw-both';}
 else if((d=/^draw (.+) (\w+) then (\w+)$/.exec(body))){const s=bag(d[1]),t=sum(s);N=s[d[2]]*s[d[3]];D=t*(t-1n);form='draw-then';}
 else assert.fail(expr);
 const g=gcd(N,D);return {story:m[1],form,N:N/g,D:D/g,raw:[N,D]};
}
/** The fraction as a terminating decimal and a percent, when it is one: ['0.25', '25%'] for 1/4; else []. */
function exactForms({N,D}){
 for(const k of [1,2,3,4]){
  const s=10n**BigInt(k);if((N*s)%D!==0n)continue;
  const v=String((N*s)/D).padStart(k+1,'0'),dec=`${v.slice(0,-k)}.${v.slice(-k)}`;
  const p=String((N*s*100n)/D).padStart(k+1,'0'),pct=k<=2?String((N*100n)/D):`${p.slice(0,-k).replace(/^0+(?=\d)/,'')}.${p.slice(-k)}`.replace(/\.?0+$/,'');
  return [dec,`${pct}%`];
 }
 return [];
}

test(`MB-B20 probability: ${SEEDS} seeds - two events, its own unit, a story on every odd seed, printed and read back in all four systems, no leak, judged right by a hand-worked fraction in any equal form`,()=>{
 const stories=new Set(),forms=new Set();
 for(let seed=0;seed<SEEDS;seed++){
  const spec=S.genProbabilityTop(seed);
  assert.deepEqual(S.genProbabilityTop(seed),spec,'pure: same seed, same spec');
  assert.ok(S.wellFormed(spec).ok,JSON.stringify(spec));
  assert.equal(S.unitOf(spec),'probability',spec.expr);
  assert.equal(spec.unit,undefined,'a probability has no unit');
  const h=probByHand(spec.expr);
  assert.ok(h.N>0n&&h.N<h.D,`${spec.expr}: strictly between nothing and a whole`);
  assert.equal(!!S.storyOf(spec),seed%2===1,`${spec.expr}: a word problem on an odd seed only`);
  if(h.story){stories.add(h.story);assert.equal(S.storyOf(spec),h.story);}else forms.add(h.form);
  const right=[`${h.N}/${h.D}`,`${h.N*3n}/${h.D*3n}`,`${h.raw[0]}/${h.raw[1]}`,...exactForms(h)];
  for(const sys of SYSTEMS){
   const q=S.question(spec,sys);assert.ok(q&&q.plain&&q.tex,`${spec.expr} prints in ${sys}`);
   assert.ok(q.plain.length<=200,`${q.plain}: short enough to read back`);
   assert.doesNotMatch(q.plain,/\{|\}/,'every placeholder filled');assert.ok(!q.tex.includes('/'),q.tex);
   assert.deepEqual(S.specFromQuestion(q.plain,sys),spec,`${sys}: ${q.plain} reads back`);
   assert.equal(S.leaksSchool(spec,q.plain),false,`${sys}: ${q.plain} does not give its answer away`);
   for(const w of right)assert.equal(S.check(spec,comma(w,sys),sys).verdict,'right',`${sys}: ${comma(w,sys)} for ${q.plain}`);
   assert.equal(S.check(spec,`${h.N+h.D}/${h.D}`,sys).verdict,'wrong',`${sys}: a whole more is wrong`);
   assert.equal(S.check(spec,`${h.N}/${h.D} cm`,sys).verdict,'unsure','a unit the question did not ask for');
  }
  const shown=S.workedAnswer(spec,'uk');assert.ok(shown,spec.expr);assert.equal(S.check(spec,shown,'uk').verdict,'right');
  for(const leak of [`It comes to ${h.N}/${h.D}.`,`The answer is ${h.raw[0]}/${h.raw[1]}.`])assert.equal(S.leaksSchool(spec,leak),true,`${spec.expr}: ${leak}`);
 }
 assert.deepEqual([...stories].sort(),['game','socks','sweets']);
 assert.deepEqual([...forms].sort(),['coin-dice','coin-spin','dice-and','dice-least','draw-both','draw-then']);
});

test('MB-B20 the probability top rung: values, the judge on equal forms and roundings, bounds, stories and the leak rule',()=>{
 const pb=(expr)=>({shape:'probability',expr}),val=(spec)=>S.workedAnswer(spec,'uk'),v=(spec,a,sys='uk')=>S.check(spec,a,sys).verdict;
 assert.equal(val(pb('dice 6 and even')),'1/12');
 assert.equal(val(pb('dice least 6')),'11/36');
 assert.equal(val(pb('coin heads and dice over 4')),'1/6');
 assert.equal(val(pb('coin tails and spinner red 3, blue 5 ask red')),'3/16');
 assert.equal(val(pb('draw red 3, blue 5 both red')),'3/28');
 assert.equal(val(pb('draw red 3, blue 5, green 2 red then blue')),'1/6');
 assert.equal(val(pb('socks draw black 4, white 6 both white')),'1/3');
 // any equal form is right, as on tiers 1 and 2 and the fractions top rung (no simplest form asked); a rounding is unsure
 const two=pb('draw red 3, blue 5 both red'); // 6/56 = 3/28
 for(const a of ['3/28','6/56','12/112'])assert.equal(v(two,a),'right',a);
 for(const a of ['0.107','0.11','10.7%'])assert.equal(v(two,a),'unsure',a);
 assert.equal(v(two,'9/64'),'wrong','with replacement is wrong');
 const dice=pb('dice 6 and even'); // 1/12
 assert.equal(v(dice,'0.083'),'unsure');assert.equal(v(dice,'0,083','cz'),'unsure');assert.equal(v(dice,'1/12','cz'),'right');
 assert.equal(v(pb('dice least even'),'0.75'),'right');assert.equal(v(pb('dice least even'),'75%'),'right');
 // bounds: certain or impossible, a colour not in the bag, the same colour twice, a story that does not fit, four colours
 for(const bad of ['dice 7 and even','dice over 5 and even','draw red 1, blue 5 both red','draw red 3, blue 5 both green','draw red 3, blue 5 red then red',
  'coin heads and spinner red 3 ask red','draw red 12, blue 12 both red','socks draw red 4, white 6 both white','sweets draw red 3, green 5 both red','game coin heads and spinner red 3, blue 5 ask red',
  'socks draw white 6, black 4 both white','draw red 1, blue 1, green 1, pink 1 both red','march dice 6 and even'])
  assert.equal(S.wellFormed(pb(bad)).ok,false,bad);
 // the tier-1/2 probability specs read exactly as before
 assert.ok(S.wellFormed(pb('bag red 3, blue 5, green 2 ask red')).ok);assert.equal(S.storyOf(pb('bag red 3, blue 5, green 2 ask red')),null);
 assert.equal(S.workedAnswer(pb('complement red 0.35'),'uk'),'0.65');
 // the reader: a top-rung question read back, the case free; a change in its words is refused
 assert.deepEqual(S.specFromQuestion('A fair coin is flipped and a fair dice is rolled. Find the probability of heads and a 6.','uk'),pb('coin heads and dice 6'));
 assert.deepEqual(S.specFromQuestion('a bag has 3 red and 5 blue counters. a counter is taken at random without replacement, then another is taken. find the probability that both are red','uk'),pb('draw red 3, blue 5 both red'));
 for(const t of ['A fair coin is flipped and a fair dice is rolled. Find the probability of heads and a 7.','A bag has 3 red and 5 blue counters. A counter is taken at random with replacement, then another is taken. Find the probability that both are red.'])
  assert.equal(S.specFromQuestion(t,'uk'),null,t);
 // the leak rule: the answer in any form, and the last multiplication that makes it; each event's chance and the counts are steps
 for(const hint of ['That gives 3/28.','It is 6/56.','3/8 × 2/7 = 6/56.','Multiply 3/8 by 2/7 to get it.'])assert.equal(S.leaksSchool(two,hint),true,hint);
 for(const hint of ['The first is red with chance 3/8.','After that, 2 red are left of 7.','Multiply the two chances.'])assert.equal(S.leaksSchool(two,hint),false,hint);
 // the stories: one situation and one question, no number word
 for(const [id,st] of Object.entries(S.PROB_STORIES)){
  assert.match(st.text,/^[A-Z][^?]*\?$/,id);
  assert.doesNotMatch(st.text,/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|half|quarter|third|once|twice)\b|\d/i,id);
 }
});

/** The top rung's own slip worked by hand: the two chances added (dice, a coin with a dice or a spinner), or the first counter put back; null for at least one. */
function probSlipByHand(expr){
 const body=expr.replace(/^(?:socks|sweets|game) /,''),B=BigInt;
 const dice=(e)=>(e==='even'||e==='odd'?[3n,6n]:e.startsWith('over ')?[6n-B(e.slice(5)),6n]:[1n,6n]);
 const bag=(t)=>Object.fromEntries(t.split(', ').map((x)=>{const [c,n]=x.split(' ');return [c,B(n)];}));
 const sum=(s)=>Object.values(s).reduce((x,y)=>x+y,0n);
 let id,N,D,d;
 if(/^dice least /.test(body))return null;
 if((d=/^dice (\S+|over \d) and (\S+|over \d)$/.exec(body))){const [a,b]=dice(d[1]),[c,e]=dice(d[2]);id='prob-added';N=a*e+c*b;D=b*e;}
 else if((d=/^coin (heads|tails) and dice (.+)$/.exec(body))){const [a,b]=dice(d[2]);id='prob-added';N=b+2n*a;D=2n*b;}
 else if((d=/^coin (heads|tails) and spinner (.+) ask (\w+)$/.exec(body))){const s=bag(d[2]),t=sum(s);id='prob-added';N=t+2n*s[d[3]];D=2n*t;}
 else if((d=/^draw (.+) both (\w+)$/.exec(body))){const s=bag(d[1]),t=sum(s);id='prob-replaced';N=s[d[2]]**2n;D=t*t;}
 else if((d=/^draw (.+) (\w+) then (\w+)$/.exec(body))){const s=bag(d[1]),t=sum(s);id='prob-replaced';N=s[d[2]]*s[d[3]];D=t*t;}
 const g=gcd(N,D);return {id,N:N/g,D:D/g};
}

test('MB-B20 the probability top rung names its own slips: the chances added, the first counter put back, never the single-draw list\'s',()=>{
 const M=require(path.resolve(__dirname,'../desk/src/lib/rules/maths.ts'));
 const pb=(expr)=>({shape:'probability',expr}),got=(spec,a)=>{const v=S.check(spec,a,'uk');return [v.verdict,v.slip];};
 assert.deepEqual(S.SCHOOL_TOP_SLIPS.probability,['prob-added','prob-replaced']);
 // the commonest: heads and a 6 as a half plus a sixth (2/3 for 1/12); both red put back (9/64 for 3/28), in any equal form
 assert.deepEqual(got(pb('coin heads and dice 6'),'2/3'),['wrong','prob-added']);
 assert.deepEqual(got(pb('coin heads and dice 6'),'4/6'),['wrong','prob-added']);
 assert.deepEqual(got(pb('dice 6 and even'),'4/6'),['wrong','prob-added']);
 assert.deepEqual(got(pb('coin tails and spinner red 3, blue 5 ask red'),'7/8'),['wrong','prob-added']);
 assert.deepEqual(got(pb('draw red 3, blue 5 both red'),'9/64'),['wrong','prob-replaced']);
 assert.deepEqual(got(pb('draw red 3, blue 5 both red'),'0.140625'),['wrong','prob-replaced']);
 assert.deepEqual(got(pb('sweets draw red 5, green 4 green then red'),'20/81'),['wrong','prob-replaced']);
 // a value no slip gives stays the plain wrong; the answer stays right; at least one names none; the single-draw slips are not this rung's
 assert.deepEqual(got(pb('draw red 3, blue 5 both red'),'3/8'),['wrong',undefined]);
 assert.deepEqual(got(pb('draw red 3, blue 5 both red'),'3/28'),['right',undefined]);
 assert.deepEqual(got(pb('dice least 6'),'1/3'),['wrong',undefined]);
 assert.deepEqual(M.slipsFor('probability').map((s)=>s.id),[...S.SCHOOL_UNIT_SLIPS.probability],'the unit\'s list (and the explain prompt) is unchanged');
 assert.equal(S.check(pb('bag red 3, blue 5, green 2 ask red'),'3','uk').slip,'prob-count-alone','a single draw is judged as before');
 // the desk's line is the slip's own words, no value; a model's pick of a top slip is never taken
 const says=(id)=>S.SCHOOL_SLIPS.find((s)=>s.id===id).says;
 assert.deepEqual(M.settleSpec(2,pb('draw red 3, blue 5 both red'),'9/64',undefined,'probability'),{verdict:'wrong',slip:'prob-replaced',said:says('prob-replaced')});
 assert.equal(M.settled(5,false,'prob-added','probability').slip,undefined,'a pick not named by code');
 assert.equal(M.slip('prob-replaced','probability').name,'Put the first one back');
 // property: every seed's own slip, worked by hand, is named; its line never leaks the item's answer
 let named=0;
 for(let seed=0;seed<SEEDS;seed++){
  const p=S.genProbabilityTop(seed),h=probSlipByHand(p.expr),t=probByHand(p.expr);
  if(!h||(h.N===t.N&&h.D===t.D))continue;
  assert.deepEqual(got(p,`${h.N}/${h.D}`),['wrong',h.id],`${p.expr}: ${h.N}/${h.D}`);named++;
  assert.equal(S.leaksSchool(p,says(h.id)),false,p.expr);
 }
 assert.ok(named>SEEDS*0.8,`named on ${named} of ${SEEDS}`);
});

/** A value in hundredths rounded half up to k places (1 or 2), as text: 4594n at 1 is '45.9'. */
const hundredthsAt=(N100,k)=>{const r=k===2?N100:(N100+5n)/10n,s=String(r).padStart(k+1,'0');return `${s.slice(0,-k)}.${s.slice(-k)}`;};
/** A square root in hundredths' squares rounded half up to k places: rootAt(5200n,1) is '7.2' (√52). */
const rootAt=(S100,k)=>{const M=S100*10n**BigInt(2*k-2),f=isqrt(M),r=(2n*f+1n)**2n<=4n*M?f+1n:f,s=String(r).padStart(k+1,'0');return `${s.slice(0,-k)}.${s.slice(-k)}`;};

test('MB-B20 cycle 17 the Pythagoras top rung names the squares added and the root not taken by the right answer\'s own rounding rule, the unit\'s own slips',()=>{
 const M=require(path.resolve(__dirname,'../desk/src/lib/rules/maths.ts'));
 const py=(expr,unit='cm')=>({shape:'pythagoras',expr,unit}),got=(spec,a,sys='uk')=>{const v=S.check(spec,a,sys);return [v.verdict,v.slip];};
 // the unit's own two slips, reused: on the unit's list as before, never on a top-rung list
 assert.deepEqual(S.SCHOOL_UNIT_SLIPS.pythagoras,['pyth-sides-added','pyth-no-root','pyth-squares-added']);
 assert.deepEqual(M.slipsFor('pythagoras').map((s)=>s.id),[...S.SCHOOL_UNIT_SLIPS.pythagoras],'the unit\'s list (and the explain prompt) is unchanged');
 assert.equal(Object.prototype.hasOwnProperty.call(S.SCHOOL_TOP_SLIPS,'pythagoras'),false);
 const says=(id)=>S.SCHOOL_SLIPS.find((s)=>s.id===id).says;
 for(const id of ['pyth-squares-added','pyth-no-root']){
  assert.doesNotMatch(says(id),/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|half|quarter|third|once|twice)\b|\d/i,id);
  assert.ok(says(id).split(/\s+/).length<=25,id);
 }
 // a shorter side from the squares added: rooted and rounded at the places written (√52 for √20), or not rooted at all
 const sh=py('shorter 6 4 dp1');
 for(const a of ['7.2','7.21','52','x = 7.2 cm'])assert.deepEqual(got(sh,a),['wrong','pyth-squares-added'],a);
 assert.deepEqual(got(sh,'7,2','cz'),['wrong','pyth-squares-added']);
 assert.deepEqual(got(sh,'20'),['wrong','pyth-no-root']);
 for(const a of ['7.20','7.3','7'])assert.equal(got(sh,a)[1],undefined,`${a} is no correct rounding of √52 at its places`);
 // the root not taken: exact, or correctly rounded at its written places, trailing zeros counted (46.72 to a tenth is 46.7)
 const lg=py('longest 2.4 6.4 dp1');
 for(const a of ['46.72','46.7'])assert.deepEqual(got(lg,a),['wrong','pyth-no-root'],a);
 assert.equal(got(lg,'46.8')[1],undefined,'within a tenth is no rounding of it');
 assert.deepEqual(got(py('longest 2.5 6.3 dp2','m'),'45.9'),['wrong','pyth-no-root']);
 assert.equal(got(py('longest 2.5 6.3 dp2','m'),'46.0')[1],undefined,'46.0 is a tenth: 45.94 to a tenth is 45.9');
 // two slips that give one answer name none (1.1 + 0.8 and 1.85 both 1.9); the slip's own exact value still names it
 assert.deepEqual(got(py('longest 1.1 0.8 dp1'),'1.9'),['wrong',undefined]);
 assert.deepEqual(got(py('longest 1.1 0.8 dp1'),'1.85'),['wrong','pyth-no-root']);
 // a slip that rounds to the right answer at the places asked is never named (1.12 and √1.12 both 1.1)
 assert.deepEqual(got(py('shorter 1.6 1.2 dp1'),'1.12'),['wrong',undefined]);
 assert.equal(got(py('shorter 1.6 1.2 dp1'),'1.1')[0],'right');
 // the desk's line is the slip's own words; the unit's slip is taken without the top-rung flag
 assert.deepEqual(M.settleSpec(2,sh,'7.2',undefined,'pythagoras'),{verdict:'wrong',slip:'pyth-squares-added',said:says('pyth-squares-added')});
 assert.equal(M.settled(2,false,'pyth-no-root','pythagoras').slip,'pyth-no-root');
 // a tier 1/2 item is judged as before
 assert.deepEqual(got(py('shorter 10 6'),'136'),['wrong','pyth-squares-added']);assert.deepEqual(got(py('longest 6 8'),'100'),['wrong','pyth-no-root']);
 // property: every seed's two slips, worked by hand at the places asked, are named when they stand alone; no line leaks
 let squares=0,root=0;
 for(let seed=0;seed<SEEDS;seed++){
  const spec=S.genPythagorasTop(seed),h=sideByHand(spec.expr),dp=h.dp,X2=h.x*h.x,Y2=h.y*h.y;
  const slips=[['pyth-sides-added',hundredthsAt(10n*(h.x+h.y),dp)],['pyth-no-root',hundredthsAt(h.S100,dp)]];
  if(h.find==='shorter')slips.push(['pyth-squares-added',rootAt(X2+Y2,dp)],['pyth-squares-added',hundredthsAt(X2+Y2,dp)]);
  for(const [id,w] of slips){
   if(id==='pyth-sides-added')continue;
   const alone=w!==h.answer&&slips.every(([id2,w2])=>id2===id||w2!==w);
   const unit=spec.unit==='m'?'metres':spec.unit;
   assert.deepEqual(got(spec,`${w} ${unit}`),['wrong',alone?id:undefined],`${spec.expr}: ${w}`);
   if(alone)id==='pyth-no-root'?root++:squares++;
   assert.equal(S.leaksSchool(spec,says(id)),false,spec.expr);
  }
 }
 assert.ok(root>SEEDS*0.9&&squares>SEEDS*0.3,`the root not taken on ${root}, the squares added on ${squares} of ${SEEDS}`);
});
