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
 * over 2000 seeds, their answers worked by hand in BigInt, a rounded side judged by the rulings MK5 / D2 R1a. Run with npm
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

test('MB-B20 the top rung belongs to the two fractions units, percent change and Pythagoras only, and a bad seed is null',()=>{
 assert.deepEqual(Object.keys(S.TOP_TIER_GENERATORS).sort(),['frac-add-sub','frac-mul-div','pct-change','pythagoras']);
 assert.equal(S.topGeneratorFor('ratio-share'),null);assert.equal(S.topGeneratorFor('constructor'),null);
 for(const bad of [-1,1.5,NaN,'1',null,undefined,2**32])for(const g of [...Object.values(GENS),S.genPercentTop,S.genPythagorasTop])assert.equal(g(bad),null);
 // the registered top rungs are the generators themselves, a money amount in the learner's own currency (MB-B4)
 for(let seed=0;seed<200;seed++){
  assert.deepEqual(S.TOP_TIER_GENERATORS.pythagoras(seed,'cz'),S.genPythagorasTop(seed));
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

test('MB-B20 the fixed sentence after a second leak: a reverse percentage and a change in turns get their own (never the forward method), a rounded side the unit\'s; none leaks',()=>{
 const words=(s)=>s.trim().split(/\s+/).length;
 assert.deepEqual(Object.keys(S.TOP_WITHHELD).sort(),['pct-before','pct-steps']);
 for(const line of Object.values(S.TOP_WITHHELD)){assert.ok(words(line)<=25,line);assert.doesNotMatch(line,/\d/,line);assert.match(line,/The answer is yours to work out\.$/);}
 for(let seed=0;seed<SEEDS;seed++){
  const p=S.genPercentTop(seed),h=pctByHand(p.expr),line=S.withheldSchool(p);
  assert.equal(line,S.TOP_WITHHELD[h.form==='before'?'pct-before':'pct-steps'],p.expr);
  assert.equal(S.leaksSchool(p,line),false,`${p.expr}: ${line}`);
  const y=S.genPythagorasTop(seed);
  assert.equal(S.withheldSchool(y),S.SCHOOL_WITHHELD.pythagoras);assert.equal(S.leaksSchool(y,S.SCHOOL_WITHHELD.pythagoras),false,y.expr);
 }
 assert.equal(S.withheldSchool({shape:'percent-change',expr:'increase 60 by 15%'}),S.SCHOOL_WITHHELD['pct-change'],'a tier-1/2 change keeps the unit\'s line');
});

test('MB-B20 a side of one metre is printed in the singular and read back',()=>{
 const spec={shape:'pythagoras',expr:'ladder 3 1 dp1',unit:'m'};
 assert.ok(S.wellFormed(spec).ok);
 const q=S.question(spec,'uk').plain;
 assert.match(q,/its foot 1 metre from the wall/);assert.doesNotMatch(q,/\b1 metres\b/);
 for(const sys of SYSTEMS)assert.deepEqual(S.specFromQuestion(S.question(spec,sys).plain,sys),spec,sys);
});
