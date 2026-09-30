/**
 * School numbers (desk/src/lib/rules/school.ts), Family W5a: the answer reader (readNumber), the fractions checker
 * (wellFormed, question, check), the hint leak check (leaksSchool) and the first unit's generator (gen), proven
 * offline on tables before anything is wired to the store, marking, hints or the TV. Every expected verdict and
 * reading below was decided from the mathematics and the reading rules in school.ts's header, not by running the
 * code. The gates: zero false-right, zero false-wrong, every leaking hint refused, no legit hint refused (the
 * conflicts the strict leak rule accepts are listed apart). The unsure count is reported, never targeted.
 * Pure: no store, no route, no model, no network. Run with npm test in desk/ (directly: node tools/school-rules-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const S=require(path.join(root,'src/lib/rules/school.ts'));
const T=require(path.join(root,'src/maths/typeset.ts'));

// ------------------------------------------------------------------ specs used below (value in the comment, worked by hand)
const cs=(expr,extra={})=>({shape:'compute',expr,...extra});
const A=cs('3/4 + 1/6');                 // 9/12 + 2/12 = 11/12
const AS=cs('3/4 + 1/6',{form:'simplest'});
const B=cs('5/6 - 1/4');                 // 10/12 - 3/12 = 7/12
const C=cs('1/2 + 1/4');                 // 2/4 + 1/4 = 3/4
const E=cs('3/4 + 3/4');                 // 6/4 = 3/2
const ES=cs('3/4 + 3/4',{form:'simplest'});
const F=cs('7/10 - 2/5');                // 7/10 - 4/10 = 3/10
const U=cs('3/4 + 1/2',{unit:'m'});      // 5/4 m
const N=cs('1/4 - 3/4',{allowNegative:true}); // -1/2
const G=cs('1000 + 234');                // 1234
const H=cs('999 + 1');                   // 1000
const LC=cs('2/3 + 1/5');                // 10/15 + 3/15 = 13/15
const LD=cs('1/3 + 1/6');                // 2/6 + 1/6 = 3/6 = 1/2
const K=cs('2 + 3/4');                   // 11/4
const M=cs('1000 + 1/2');                // 2001/2
const X=cs('1/3 - 1/4');                 // 4/12 - 3/12 = 1/12

// ------------------------------------------------------------------ SPELLINGS: [spec, written, system, expected, slip]
const SPELLINGS=[
 // 3/4 + 1/6 = 11/12
 [A,'11/12','uk','right'],[A,'22/24','uk','right'],[A,'33/36','us','right'],[A,' 11 / 12 ','uk','right'],[A,'x = 11/12','uk','right'],
 [A,'11/12.','uk','right'],[A,'answer: 11/12','us','right'],[A,'11/12','cz','right'],[A,'11/12','de','right'],[A,'= 11/12','de','right'],
 [A,'0.9167','uk','unsure'],[A,'0.92','uk','unsure'],[A,'0.917','us','unsure'],[A,'0.9','uk','unsure'],[A,'0,9167','cz','unsure'],
 [A,'0,9167','us','unsure'],[A,'91.67%','uk','unsure'],[A,'92%','uk','unsure'],[A,'0.95','uk','wrong'],
 [A,'5/6','uk','wrong','top-not-scaled'],[A,'4/10','uk','wrong','tops-and-bottoms'],[A,'2/5','uk','wrong','tops-and-bottoms'],
 [A,'4/12','uk','wrong','top-not-scaled'],[A,'10/12','uk','wrong','top-not-scaled'],[A,'5/12','us','wrong','top-not-scaled'],
 [A,'4/6','uk','wrong','tops-one-bottom'],[A,'2/3','uk','wrong','tops-one-bottom'],[A,'4/4','uk','wrong','tops-one-bottom'],
 [A,'-11/12','uk','wrong'],[A,'1 11/12','uk','wrong'],[A,'11/13','uk','wrong'],
 [A,'11/12 cm','uk','unsure'],[A,'idk','uk','unsure'],[A,'about a half','uk','unsure'],[A,'3/4+1/6','uk','unsure'],[A,'','uk','unsure'],
 [A,'  ','uk','unsure'],[A,'eleven twelfths','uk','unsure'],[A,'11/12 = 0.9167','uk','unsure'],[A,'1-1/2','us','unsure'],[A,'11 12','uk','unsure'],
 [A,'1/0','uk','unsure'],[A,'11:12','uk','unsure'],
 // simplest form asked
 [AS,'11/12','uk','right'],[AS,'22/24','uk','unsure'],[AS,'0.9167','uk','unsure'],[AS,'4/10','uk','wrong','tops-and-bottoms'],
 // 5/6 - 1/4 = 7/12
 [B,'7/12','uk','right'],[B,'14/24','us','right'],[B,'-7/12','uk','wrong','wrong-direction'],[B,'4/2','uk','wrong','tops-and-bottoms'],
 [B,'2','uk','wrong','tops-and-bottoms'],[B,'4/12','uk','wrong','top-not-scaled'],[B,'1/3','uk','wrong','top-not-scaled'],
 [B,'4/6','uk','wrong','tops-one-bottom'],[B,'1','uk','wrong','tops-one-bottom'],[B,'0.5833','uk','unsure'],[B,'0.58','us','unsure'],
 // 1/2 + 1/4 = 3/4
 [C,'3/4','uk','right'],[C,'0.75','uk','right'],[C,'75%','us','right'],[C,'75 %','cz','right'],[C,'6/8','uk','right'],
 [C,'0,75','cz','right'],[C,'0,75','de','right'],[C,'0,75','us','unsure'],[C,'0.75','cz','right'],[C,'0.8','uk','unsure'],
 [C,'0.7','uk','unsure'],[C,'0.76','uk','wrong'],[C,'74%','uk','wrong'],[C,'2/6','uk','wrong','tops-and-bottoms'],[C,'1/2','uk','wrong','top-not-scaled'],
 [C,'3/4 m','uk','unsure'],[C,'£0.75','uk','unsure'],[C,'.75','us','right'],[C,'0.750','uk','right'],
 // 3/4 + 3/4 = 3/2
 [E,'3/2','uk','right'],[E,'1 1/2','uk','right'],[E,'1½','uk','right'],[E,'1.5','us','right'],[E,'150%','uk','right'],[E,'6/4','uk','right'],
 [E,'1 2/4','uk','right'],[E,'1,5','cz','right'],[E,'1,5','us','unsure'],[E,'6/8','uk','wrong','tops-and-bottoms'],[E,'3/4','uk','wrong','tops-and-bottoms'],
 [E,'-1 1/2','uk','wrong'],[E,'1 1/2 kg','uk','unsure'],
 [ES,'1 1/2','uk','right'],[ES,'3/2','uk','right'],[ES,'6/4','uk','unsure'],[ES,'1 2/4','uk','unsure'],[ES,'1.5','uk','unsure'],
 // 7/10 - 2/5 = 3/10
 [F,'3/10','uk','right'],[F,'0.3','uk','right'],[F,'30%','us','right'],[F,'0,3','de','right'],[F,'0.30','uk','right'],[F,'.3','us','right'],
 [F,'-3/10','uk','wrong','wrong-direction'],[F,'5/5','uk','wrong','tops-and-bottoms'],[F,'5/10','uk','wrong','top-not-scaled'],[F,'1/2','uk','wrong','top-not-scaled'],
 // a unit asked: 3/4 + 1/2 = 5/4 m (a missing unit is not held against the value; another unit is unsure, never converted)
 [U,'5/4 m','uk','right'],[U,'1 1/4 m','uk','right'],[U,'5/4','uk','right'],[U,'1.25 m','us','right'],[U,'1,25 m','cz','right'],
 [U,'125 cm','uk','unsure'],[U,'5/4 kg','uk','unsure'],[U,'1.25 metres','uk','right'],
 // below zero allowed: 1/4 - 3/4 = -1/2
 [N,'-1/2','uk','right'],[N,'-0.5','us','right'],[N,'−1/2','uk','right'],[N,'- 1/2','uk','right'],[N,'-2/4','uk','right'],[N,'1/2','uk','wrong','wrong-direction'],
 // thousands: 1000 + 234 = 1234; 999 + 1 = 1000
 [G,'1,234','us','right'],[G,'1,234','uk','right'],[G,'1 234','cz','right'],[G,'1 234','de','right'],[G,'1.234','de','unsure'],[G,'1234','cz','right'],
 [G,'1,234.0','us','right'],[G,'1.234,0','de','right'],[G,'1 234','us','unsure'],[G,'1.234','us','wrong'],[G,'1,234','cz','wrong'],
 [H,'1.000','de','unsure'],[H,'1.000','cz','unsure'],[H,'1.000,0','de','right'],[H,'1,000','us','right'],[H,'1 000','cz','right'],[H,'1 000','uk','unsure'],[H,'1.000','us','wrong'],[H,'1,000','cz','wrong'],
 // a lone point before three digits in cz/de is unsure, never wrong: 3/4 + 3/4 = 3/2, 2 + 3/4 = 11/4, 1000 + 1/2 = 2001/2
 [E,'1.500','cz','unsure'],[E,'1.500','de','unsure'],[E,'1.500','us','right'],[E,'1.500','uk','right'],[E,'1,500','cz','right'],[E,'1,500','us','wrong'],
 [K,'2.750','cz','unsure'],[K,'2.750','de','unsure'],[K,'2.750','us','right'],[K,'2,750','cz','right'],[K,'2,75','de','right'],[K,'2.75','de','right'],[K,'2 3/4','cz','right'],
 [M,'1.000,5','cz','right'],[M,'1.000,5','de','right'],[M,'1.000,5','us','unsure'],[M,'1.000,5','uk','unsure'],[M,'1 000,5','cz','right'],[M,'1000.5','us','right'],[M,'1,000.5','uk','right'],
];

// ------------------------------------------------------------------ READER: [written, system, expected reading or null]
const num=(n,d,form,unit)=>({kind:'number',n,d,form,...(unit?{unit}:{})});
const ratio=(a,b)=>({kind:'ratio',parts:[a,b]});
const READER=[
 ['11/12','us',num(11,12,'fraction')],['-3/4','uk',num(-3,4,'fraction')],['22/24','uk',num(11,12,'fraction')],['1 1/2','us',num(3,2,'mixed')],['1 1/2','cz',num(3,2,'mixed')],
 ['1-1/2','us',null],['0.5','us',num(1,2,'decimal')],['0,5','cz',num(1,2,'decimal')],['0,5','de',num(1,2,'decimal')],['0,5','us',null],['0,5','uk',null],
 ['1,5','us',null],['1,5','de',num(3,2,'decimal')],['.5','uk',num(1,2,'decimal')],[',5','cz',num(1,2,'decimal')],
 ['25%','us',num(1,4,'percent')],['25 %','cz',num(1,4,'percent')],['12.5%','us',num(1,8,'percent')],['12,5 %','de',num(1,8,'percent')],['12,5 %','uk',null],['25 percent','uk',num(1,4,'percent')],
 ['1 000','cz',num(1000,1,'integer')],['1 000','de',num(1000,1,'integer')],['1 000','us',null],['1 000','uk',null],['1 000,5','cz',num(2001,2,'decimal')],['1 000,5','us',null],
 ['1.000','us',num(1,1,'decimal')],['1.000','uk',num(1,1,'decimal')],['1.000','cz',null],['1.000','de',null],
 ['1,000','us',num(1000,1,'integer')],['1,000','uk',num(1000,1,'integer')],['1,000','cz',num(1,1,'decimal')],['1,000','de',num(1,1,'decimal')],
 ['1.000,5','de',num(2001,2,'decimal')],['1.000,5','us',null],['12,345,678','us',num(12345678,1,'integer')],['1,00','us',null],['0.5','cz',num(1,2,'decimal')],
 ['0.500','de',num(1,2,'decimal')],['1 00','cz',null],['12.345.678','de',num(12345678,1,'integer')],['1.000 000','cz',null],
 ['12 cm','us',num(12,1,'integer','cm')],['12cm','uk',num(12,1,'integer','cm')],['2.5 m','us',num(5,2,'decimal','m')],['2,5 m','cz',num(5,2,'decimal','m')],
 ['3 cm2','uk',num(3,1,'integer','cm2')],['3 cm^2','uk',num(3,1,'integer','cm2')],['3 cm²','uk',num(3,1,'integer','cm2')],['4 m2','uk',num(4,1,'integer','m2')],
 ['5 kg','uk',num(5,1,'integer','kg')],['250 g','uk',num(250,1,'integer','g')],['1.5 l','us',num(3,2,'decimal','l')],['500 ml','uk',num(500,1,'integer','ml')],
 ['45 min','uk',num(45,1,'integer','min')],['2 h','uk',num(2,1,'integer','h')],['30 s','uk',num(30,1,'integer','s')],['2 km','uk',num(2,1,'integer','km')],['7 mm','uk',num(7,1,'integer','mm')],
 ['€5','de',num(5,1,'integer','€')],['5 €','cz',num(5,1,'integer','€')],['5€','de',num(5,1,'integer','€')],['$3.50','us',num(7,2,'decimal','$')],['£12','uk',num(12,1,'integer','£')],
 ['12 centimetres','uk',num(12,1,'integer','cm')],['3 metres','uk',num(3,1,'integer','m')],['2 hours','us',num(2,1,'integer','h')],['5 euros','de',num(5,1,'integer','€')],['10 dollars','us',num(10,1,'integer','$')],
 ['12 cms','uk',null],['12 inches','us',null],['5 $ €','us',null],
 ['x = 3/4','us',num(3,4,'fraction')],['answer: 0.25','us',num(1,4,'decimal')],['= 7','uk',num(7,1,'integer')],['x=-2','us',num(-2,1,'integer')],['3/4.','us',num(3,4,'fraction')],['12 cm.','uk',num(12,1,'integer','cm')],
 ['3:2','us',ratio({n:3,d:1},{n:2,d:1})],['3 : 2','cz',ratio({n:3,d:1},{n:2,d:1})],['1,5:1','cz',ratio({n:3,d:2},{n:1,d:1})],['-3:2','us',null],['3:2:1','us',null],['3:2 cm','uk',null],
 ['about nine','uk',null],['nine','uk',null],['3 4','uk',null],['/','uk',null],['3/','uk',null],['1/0','uk',null],['12345678901','us',null],['1e9','us',null],
 ['3/4+1/6','uk',null],['','uk',null],['   ','uk',null],['idk','uk',null],['05','us',null],['007','uk',null],['1 03/4','uk',null],
 ['1 250/500','cz',null],['1 250/500','us',null],['1 250/500','uk',null],['1 3/2','uk',null],['0 1/2','uk',null],['1½','us',num(3,2,'mixed')],['½','us',num(1,2,'fraction')],
 ['−3/4','uk',num(-3,4,'fraction')],['3/-4','uk',null],['1000000/3','uk',null],['0.1234567','us',null],['999999999','us',num(999999999,1,'integer')],['1000000000','us',null],
 ['+5','uk',num(5,1,'integer')],['--5','uk',null],
 // a lone point before three digits: 1500 by the cz/de norm, 1.5 as a calculator writes it - null there; a decimal point in us/uk
 ['1.500','cz',null],['1.500','de',null],['1.500','us',num(3,2,'decimal')],['1.500','uk',num(3,2,'decimal')],
 ['2.750','cz',null],['2.750','de',null],['2.750','us',num(11,4,'decimal')],['2.750','uk',num(11,4,'decimal')],
 ['1.000.000','cz',num(1000000,1,'integer')],['1.000.000','de',num(1000000,1,'integer')],['1.000.000','us',null],['1.000.000','uk',null],
 ['1.000,5','cz',num(2001,2,'decimal')],['1.000,5','uk',null],['1.250,75','de',num(5003,4,'decimal')],['1.25','cz',num(5,4,'decimal')],
 ['1,500','us',num(1500,1,'integer')],['1,500','cz',num(3,2,'decimal')],['5 pounds','uk',null],['£5','uk',num(5,1,'integer','£')],['25% kg','uk',null],['5 %','us',num(1,20,'percent')],['1 1/2 kg','uk',num(3,2,'mixed','kg')],['-25%','uk',num(-1,4,'percent')],
 ['3/4','xx',null],['3/4',undefined,null],
];

// ------------------------------------------------------------------ LEAKS: [spec, hint] that state or give away the answer
const LEAKS=[
 [A,'The answer is 11/12.'],[A,'So 3/4 + 1/6 = 11/12'],[A,'That makes 9/12 + 2/12 = 11/12.'],[A,'You get eleven twelfths.'],[A,'It comes to 22/24.'],
 [A,'Your answer should be about 0.9167.'],[A,'Roughly 0.92.'],[A,'That is about 91.7%.'],[A,'9 + 2 = 11, so the new top is 11.'],[A,'Eleven over twelve.'],
 [A,'You end up with 11 twelfths.'],[A,'Write it as 11/12ths.'],[A,'In Czech notation that is 0,9167.'],[A,'Nought point nine two.'],[A,'The ratio is 11:12.'],
 [A,'You get eleven-twelfths.'],[A,'The answer is 11 out of 12.'],[A,'It is 1 - 1/12.'],[A,'It is 1/12 less than 1.'],[A,'The top is 9 + 2.'],
 [A,'¹¹⁄₁₂'],[A,'That is 91 2/3 %.'],[A,'It is 0.916 recurring.'],[A,'Twenty-two twenty-fourths.'],[A,'11 parts out of 12.'],[A,'The answer is ELEVEN TWELFTHS'],
 [X,'You get one twelfth.'],[X,'The answer is 1/3 x 1/4.'],[LD,'Simplify 3/6.'],
 [B,'5/6 - 1/4 = 10/12 - 3/12 = 7/12'],[B,'Seven twelfths.'],[B,'The tops give 10 - 3 = 7.'],[B,'So it is 14/24.'],
 [LC,'Thirteen fifteenths.'],[LC,'10/15 + 3/15 = 13/15'],[LC,'You get 13 over 15.'],[LC,'About 0.867.'],
 [LD,'The answer is a half.'],[LD,'It simplifies to one half.'],[LD,'3/6, which is 1/2.'],[LD,'That is 50%.'],[LD,'It is 0.5.'],[LD,"It's half."],[LD,'The answer is one-half.'],
 [E,'One and a half.'],[E,'1 1/2'],[E,'That gives 6/4.'],[E,'It is 1.5.'],[E,'150%'],[E,'Three over two.'],[E,'1½'],[E,'One and one half.'],[E,'The part left over is 1/2.'],
 [F,'Thirty percent.'],[F,'0.3'],[F,'It is 3/10.'],[F,'7/10 - 4/10 = 3/10'],[F,'Three tenths.'],[F,'30 per cent'],
];
// ------------------------------------------------------------------ LEGIT: [spec, hint] that must not be refused
const LEGIT=[
 [A,'Find a common denominator for 3/4 and 1/6.'],[A,'Use 12 as the common denominator.'],[A,'3/4 is the same as 9/12.'],[A,'1/6 is the same as 2/12.'],
 [A,'Multiply the top and bottom of 3/4 by 3.'],[A,'Multiply the top and bottom of 1/6 by 2.'],[A,'What is the smallest number that both 4 and 6 go into?'],
 [A,'Rewrite both fractions as twelfths.'],[A,'Only add the tops once the bottoms match.'],[A,'3/4 and 1/6 have different bottoms.'],[A,'Try 24 as a common denominator, then simplify.'],
 [A,'The fraction 111/120 is not what we want.'],[A,'Think of 3/4 as 18/24.'],[A,'4 x 3 = 12 and 6 x 2 = 12.'],[A,'Check that your answer is less than 1.'],
 [B,'Write 5/6 as 10/12.'],[B,'Write 1/4 as 3/12.'],[B,'12 is a multiple of both 6 and 4.'],[B,'Take the smaller fraction away from the larger one.'],
 [B,'Subtract the tops and keep the bottom.'],[B,'10 twelfths take away 3 twelfths.'],
 [LC,'Use 15 as the common denominator.'],[LC,'2/3 is 10/15.'],[LC,'1/5 is 3/15.'],[LC,'Multiply 2/3 by 5/5.'],[LC,'3 and 5 have no common factor, so multiply them.'],[LC,'113/150 is not the answer.'],
 [LD,'Multiply the top and bottom of 1/3 by 2.'],[LD,'Rewrite 1/3 in sixths.'],[LD,'1/3 is the same as 2/6.'],[LD,'Then simplify your answer.'],
 [E,'The bottoms are already the same.'],[E,'Add the tops and keep the bottom 4.'],[E,'Your answer will be more than 1.'],[E,'Turn an improper fraction into a mixed number at the end.'],
 [F,'Write 2/5 in tenths.'],[F,'2/5 is the same as 4/10.'],[F,'Tenths make a good common denominator.'],[F,'Multiply the top and bottom of 2/5 by 2.'],
 [A,'Now add 9/12 + 2/12.'],[A,'1/6 + 3/4 is the same question.'],[A,'Your answer should be just under 1.'],[B,'5/6 - 1/4 means take 1/4 away from 5/6.'],
 [X,'Now work out 4/12 - 3/12.'],[X,'This one is tricky.'],[X,'Use 12 as the common denominator.'],[E,'It is more than one whole.'],
];
/**
 * CONFLICTS: legit hints the strict rule refuses, accepted and reported. Each names a bare whole number that is also
 * the answer's top over a working denominator (rule 4): 1/3 + 1/6 is 3/6 (top 3) and 1/2 (top 1); 3/4 + 3/4 is 6/4
 * and 3/2 (top 3). The rule cannot tell "3, the operand's bottom" from "3, the summed top", so it refuses both.
 */
const CONFLICTS=[
 [LD,'6 is a multiple of 3, so use sixths.'],
 [LD,'Step 1: find a common denominator.'],
 [E,'Add the tops: 3 and 3.'],
];

// ------------------------------------------------------------------ the tests

test('every spec the tables use is well formed', () => {
 for (const s of [A,AS,B,C,E,ES,F,U,N,G,H,K,M,LC,LD,X]) assert.deepEqual(S.wellFormed(s),{ok:true},s.expr);
});

test('wellFormed refuses what the desk cannot find exactly or what makes a poor question', () => {
 const bad=[
  [cs('3/4'),'nothing to work out'],[cs('3/0 + 1'),'divides by zero'],[cs('1/2 ÷ 0'),'divides by zero'],[cs('3/4 - 5/6'),'zero or negative'],
  [cs('3/4 + 1/6',{form:'decimal'}),'no exact decimal'],[cs('2000 + 1'),'larger than a school question'],[cs('1/200 + 1'),"bottom is 1, or larger"],
  [cs('3/1 + 1'),"bottom is 1, or larger"],[{shape:'evaluate',f:'x'},'not one of the desk'],[{...A,answer:'11/12'},'no answer field'],
  [cs('3/4 + 1/6',{unit:'inch'}),'unit is not'],[cs('x + 1'),'cannot read'],[cs('3/4 + 1/6 + 1/2 + 1/3 + 1/5 + 1/7'),'more operations'],
  [cs('3/4 + 1/6',{form:'lowest'}),'form is not'],[cs('3/4 + 1/6',{allowNegative:false}),'allowNegative'],[cs('(1+2)/3'),'cannot read'],[cs('0.1234 + 1'),'more places'],
  [null,'not one of'],['3/4 + 1/6','not one of'],[cs(''),'cannot read'],[cs(42),'cannot read'],
 ];
 for (const [s,why] of bad){const w=S.wellFormed(s);assert.equal(w.ok,false,JSON.stringify(s));assert.ok(w.why.includes(why),`${JSON.stringify(s)}: ${w.why}`);}
 assert.deepEqual(S.wellFormed(cs('3/4 - 5/6',{allowNegative:true})),{ok:true});
 assert.deepEqual(S.wellFormed(cs('1/2 + 1/4',{form:'decimal'})),{ok:true});
 assert.deepEqual(S.wellFormed(cs('3/4 ÷ 2/3')),{ok:true});
 assert.deepEqual(S.wellFormed(cs('(1/2 + 1/3) × 6')),{ok:true});
});

test('question prints the spec as plain text and TeX, never the answer, and the TeX typesets', () => {
 assert.deepEqual(S.question(A),{plain:'Work out 3/4 + 1/6.',tex:'\\text{Work out } \\frac{3}{4} + \\frac{1}{6}.'});
 assert.deepEqual(S.question(AS),{plain:'Work out 3/4 + 1/6. Give your answer in its simplest form.',tex:'\\text{Work out } \\frac{3}{4} + \\frac{1}{6}. \\text{ Give your answer in its simplest form.}'});
 assert.equal(S.question(cs('3/4 ÷ 2/3')).plain,'Work out 3/4 ÷ 2/3.');
 assert.equal(S.question(U).plain,'Work out 3/4 + 1/2. Give your answer in m.');
 assert.equal(S.question(null),null);assert.equal(S.question({shape:'compute',expr:'x'}),null);
 // '/' binds only two whole numbers: 3/4 ÷ 2/3 is (3/4) ÷ (2/3) = 9/8, never 3/4/2/3 = 1/8
 assert.equal(S.check(cs('3/4 ÷ 2/3'),'9/8','uk').verdict,'right');
 assert.equal(S.check(cs('3/4 ÷ 2/3'),'1/8','uk').verdict,'wrong');
 for (const s of [A,AS,B,C,E,F,U,cs('3/4 ÷ 2/3'),cs('(1/2 + 1/3) × 6')]){
  const q=S.question(s);
  assert.ok(!S.leaksSchool(s,q.plain),`the question itself is not a leak: ${q.plain}`);
  const nodes=T.parseMath(q.tex),flat=T.flatten(nodes);
  for (const d of s.expr.match(/\d+/g)) assert.ok(flat.includes(d),`${q.tex} keeps ${d}: ${flat}`);
  let fracs=0;T.walk(nodes,(n)=>{if(n.t==='frac')fracs++;});
  assert.equal(fracs,(s.expr.match(/\d+\/\d+/g)||[]).length,`${q.tex} stacks every fraction`);
 }
});

test(`SPELLINGS: ${SPELLINGS.length} written answers, zero false-right, zero false-wrong, unsure reported`, () => {
 let falseRight=0,falseWrong=0,unsure=0;const miss=[];
 const bySlip={};
 for (const [spec,written,sys,want,slip] of SPELLINGS){
  const got=S.check(spec,written,sys);
  if (got.verdict==='right'&&want!=='right'){falseRight++;miss.push(`FALSE-RIGHT ${spec.expr} | ${JSON.stringify(written)} ${sys}: want ${want}`);}
  if (got.verdict==='wrong'&&want!=='wrong'){falseWrong++;miss.push(`FALSE-WRONG ${spec.expr} | ${JSON.stringify(written)} ${sys}: want ${want}`);}
  if (got.verdict!==want&&got.verdict==='unsure') miss.push(`over-unsure ${spec.expr} | ${JSON.stringify(written)} ${sys}: want ${want}`);
  if (got.verdict==='unsure') unsure++;
  if (want==='wrong'&&got.verdict==='wrong'&&(got.slip??null)!==(slip??null)) miss.push(`slip ${spec.expr} | ${written}: want ${slip??'none'} got ${got.slip??'none'}`);
  if (got.slip) bySlip[got.slip]=(bySlip[got.slip]||0)+1;
  assert.equal(typeof got.why,'string');assert.ok(!/\d/.test(got.why),'a why carries no value');
 }
 const fractions=SPELLINGS.filter(([s])=>/\//.test(s.expr)).length;
 console.log(`# SPELLINGS rows ${SPELLINGS.length} (fractions family ${fractions}): false-right ${falseRight}, false-wrong ${falseWrong}, unsure ${unsure} (${(100*unsure/SPELLINGS.length).toFixed(1)}%)`);
 console.log(`# slips detected: ${JSON.stringify(bySlip)}`);
 assert.ok(fractions>=60,'at least 60 rows for the fractions add/sub family');
 assert.equal(falseRight,0,miss.join('\n'));
 assert.equal(falseWrong,0,miss.join('\n'));
 assert.deepEqual(miss,[],'every row as decided, slips included');
 // each unit's own slips are counted in its own table (W7 units below); these are add and subtract fractions'
 for (const id of S.SCHOOL_UNIT_SLIPS['frac-add-sub']) assert.ok((bySlip[id]||0)>=2,`slip ${id} detected at least twice`);
});

test('check: odd specs and answers are unsure, never a throw', () => {
 for (const spec of [null,undefined,{},{shape:'compute'},cs('3/0 + 1'),cs('3/4 - 5/6'),42,'3/4 + 1/6']) assert.equal(S.check(spec,'11/12','uk').verdict,'unsure');
 for (const a of [null,undefined,11/12,{},[],true]) assert.equal(S.check(A,a,'uk').verdict,'unsure');
 assert.equal(S.check(A,'11/12','xx').verdict,'unsure');
 assert.equal(S.check(A,'11/12').verdict,'unsure');
 assert.equal(S.check(A,'11/12','uk').form,'fraction');
});

test(`READER: ${READER.length} readings across the four systems`, () => {
 const bad=[];
 for (const [w,sys,want] of READER){
  const got=S.readNumber(w,sys);
  let ok;
  if (want===null) ok=got===null;
  else if (want.kind==='ratio') ok=!!got&&got.kind==='ratio'&&JSON.stringify(got.parts)===JSON.stringify(want.parts);
  else ok=!!got&&got.kind==='number'&&got.value.n===want.n&&got.value.d===want.d&&got.form===want.form&&(got.unit??null)===(want.unit??null);
  if (!ok) bad.push(`${JSON.stringify(w)} ${sys}: want ${JSON.stringify(want)} got ${JSON.stringify(got)}`);
 }
 console.log(`# READER rows ${READER.length}, null expected ${READER.filter(r=>r[2]===null).length}, mismatches ${bad.length}`);
 assert.deepEqual(bad,[]);
 assert.equal(S.readNumber('22/24','uk').lowest,false);assert.equal(S.readNumber('11/12','uk').lowest,true);
 assert.equal(S.readNumber('4/1','uk').lowest,false);assert.equal(S.readNumber('1 2/4','uk').lowest,false);
 assert.equal(S.readNumber('0.9170','uk').places,4);
});

test(`LEAKS: ${LEAKS.length} hints that give the answer away are all refused; ${LEGIT.length} legit hints pass`, () => {
 const missed=LEAKS.filter(([s,h])=>!S.leaksSchool(s,h)).map(([s,h])=>`${s.expr} | ${h}`);
 const flagged=LEGIT.filter(([s,h])=>S.leaksSchool(s,h)).map(([s,h])=>`${s.expr} | ${h}`);
 const specs=new Set([...LEAKS,...LEGIT].map(([s])=>s.expr));
 console.log(`# LEAKS ${LEAKS.length} (missed ${missed.length}), LEGIT ${LEGIT.length} (flagged ${flagged.length}), specs ${specs.size}, accepted conflicts ${CONFLICTS.length}`);
 assert.deepEqual(missed,[],'every leaking hint is caught');
 assert.deepEqual(flagged,[],'no legit hint is flagged');
 assert.ok(LEAKS.length>=20&&LEGIT.length>=25&&specs.size>=3);
});

test('CONFLICTS: the strict leak rule refuses these legit hints, and that cost is accepted and reported', () => {
 for (const [s,h] of CONFLICTS) assert.equal(S.leaksSchool(s,h),true,`${s.expr} | ${h}`);
});

test('leaksSchool: odd inputs are false, the same input gives the same answer', () => {
 for (const h of [null,undefined,42,{},'','   ']) assert.equal(S.leaksSchool(A,h),false);
 for (const s of [null,{},cs('3/0 + 1'),'3/4 + 1/6']) assert.equal(S.leaksSchool(s,'The answer is 11/12.'),false);
 for (const [s,h] of [...LEAKS,...LEGIT]) assert.equal(S.leaksSchool(s,h),S.leaksSchool(s,h));
});

// ------------------------------------------------------------------ the generator, against a reference written here
/** The reference: a/b op c/d by hand, in lowest terms, with its own gcd - not the module's evaluator. */
const refGcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
function reference(expr){
 const m=/^(\d+)\/(\d+) ([+-]) (\d+)\/(\d+)$/.exec(expr);
 if(!m)return null;
 const [a,b,op,c,d]=[+m[1],+m[2],m[3],+m[4],+m[5]];
 const n=op==='+'?a*d+c*b:a*d-c*b,den=b*d,g=refGcd(n,den);
 return {a,b,c,d,op,n:n/g,den:den/g};
}

test('GENERATOR: seeds 1..200 for tiers 1 and 2 give well-formed, distinct, correctly judged items', () => {
 const counts={};
 for (const tier of [1,2]){
  const seen=new Set();
  for (let seed=1;seed<=200;seed++){
   const s=S.gen(seed,tier);
   assert.ok(s&&s.shape==='compute',`seed ${seed} tier ${tier}`);
   assert.deepEqual(S.gen(seed,tier),s,'same seed, same spec');
   assert.deepEqual(S.wellFormed(s),{ok:true},s.expr);
   const r=reference(s.expr);
   assert.ok(r,`the expression is a/b ± c/d: ${s.expr}`);
   assert.ok(r.a>0&&r.a<r.b&&r.c>0&&r.c<r.d,`both proper: ${s.expr}`);
   assert.equal(refGcd(r.a,r.b),1);assert.equal(refGcd(r.c,r.d),1);
   assert.ok(r.b<=12&&r.d<=12&&r.b>=2&&r.d>=2,`denominators 2..12: ${s.expr}`);
   if (tier===1) assert.ok(r.b===r.d||r.b%r.d===0||r.d%r.b===0,`tier 1 same or one-multiple: ${s.expr}`);
   else assert.ok(r.b!==r.d&&r.b%r.d!==0&&r.d%r.b!==0,`tier 2 unlike: ${s.expr}`);
   assert.ok(r.n>0,`positive: ${s.expr}`);assert.ok(r.den>1,`not a whole number: ${s.expr}`);
   const same=(p,q,x,y)=>p*y===q*x;
   assert.ok(!same(r.n,r.den,r.a,r.b)&&!same(r.n,r.den,r.c,r.d),`the answer is not an operand: ${s.expr}`);
   const truth=`${r.n}/${r.den}`;
   for (const sys of S.SCHOOL_SYSTEMS){
    assert.equal(S.check(s,truth,sys).verdict,'right',`${s.expr} = ${truth} (${sys})`);
    assert.equal(S.check(s,`${r.n+1}/${r.den}`,sys).verdict,'wrong',`${s.expr} != ${r.n+1}/${r.den}`);
    const rd=S.readNumber(truth,sys);assert.equal(rd.form,'fraction');
   }
   assert.equal(S.question(s).plain,`Work out ${s.expr}.`);
   assert.ok(S.leaksSchool(s,`The answer is ${truth}.`),`the answer leaks: ${s.expr}`);
   assert.ok(!S.leaksSchool(s,S.question(s).plain),`the question does not: ${s.expr}`);
   seen.add(s.expr);
  }
  counts[tier]=seen.size;
 }
 console.log(`# GENERATOR distinct specs over seeds 1..200: tier 1 ${counts[1]}, tier 2 ${counts[2]}`);
 assert.ok(counts[1]>=100&&counts[2]>=100,'seeds spread');
 for (const bad of [-1,1.5,NaN,'1',null,undefined,2**32]) assert.equal(S.gen(bad,1),null);
 for (const bad of [0,3,'1',null,1.5]) assert.equal(S.gen(1,bad),null);
});

// ------------------------------------------------------------------ purity and robustness
test('PURITY: 300 random strings and odd values never throw; odd values give null, unsure or false; same input, same output', () => {
 let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const alphabet=['0','1','2','3','4','5','9','/','.',',',' ','%',':','-','−','+','=','x','a','e','n','c','m','€','$','£','½','²','(',')',' ','\n','cm','kg','half',' and '];
 const strings=[];
 for (let i=0;i<300;i++){let s='';const len=Math.floor(rnd()*24);for(let k=0;k<len;k++)s+=alphabet[Math.floor(rnd()*alphabet.length)];strings.push(s);}
 strings.push('9'.repeat(400),'/'.repeat(100),'1 '.repeat(100),'one '.repeat(200),'a'.repeat(5000));
 const odd=[null,undefined,0,1,-1,NaN,Infinity,1.5,true,false,{},[],[1,2],{shape:'compute'},()=>1,Symbol('s'),BigInt(3)];
 const verdicts=new Set(['right','wrong','unsure']);
 for (const s of strings){
  for (const sys of S.SCHOOL_SYSTEMS){
   const r=S.readNumber(s,sys);
   assert.ok(r===null||(typeof r==='object'&&(r.kind==='number'||r.kind==='ratio')),JSON.stringify(s));
   assert.deepEqual(S.readNumber(s,sys),r);
   const v=S.check(A,s,sys);assert.ok(verdicts.has(v.verdict));assert.deepEqual(S.check(A,s,sys),v);
  }
  const l=S.leaksSchool(A,s);assert.equal(typeof l,'boolean');assert.equal(S.leaksSchool(A,s),l);
  const w=S.wellFormed(cs(s));assert.equal(typeof w.ok,'boolean');
  const q=S.question(cs(s));assert.ok(q===null||typeof q.plain==='string');
 }
 for (const o of odd){
  for (const sys of [...S.SCHOOL_SYSTEMS,o]) assert.equal(S.readNumber(o,sys),null);
  assert.equal(S.readNumber('3/4',o),null);
  assert.equal(S.check(A,o,'uk').verdict,'unsure');assert.equal(S.check(o,'11/12','uk').verdict,'unsure');
  assert.equal(S.leaksSchool(A,o),false);assert.equal(S.leaksSchool(o,'11/12'),false);
  assert.equal(S.wellFormed(o).ok,false);assert.equal(S.question(o),null);
  if (!(Number.isInteger(o)&&o>=0)) assert.equal(S.gen(o,1),null); // 0 and 1 are seeds
  if (o!==1&&o!==2) assert.equal(S.gen(1,o),null); // 1 and 2 are tiers
 }
});

// ================================================================== Family W7 batch 1: three more fractions units
// "Equivalent fractions" (missing, simplify), "A fraction of an amount" (fraction-of), "Multiply and divide fractions"
// (compute a/b × c/d, a/b ÷ c/d). As above: every expected verdict was worked by hand from the mathematics first (the
// value and each slip's value are in the comments), and the gates are zero false-right, zero false-wrong, every slip
// of the unit detected at least twice, every leak refused, no legit hint refused (conflicts listed apart).
const ms=(expr)=>({shape:'missing',expr}),sm=(expr)=>({shape:'simplify',expr}),fo=(expr,unit)=>({shape:'fraction-of',expr,...(unit?{unit}:{})});

/** One unit's spellings table through check: the W5a counts, and each of the unit's slips at least twice. */
function spellings(label,rows,unit){
 let falseRight=0,falseWrong=0,unsure=0;const miss=[],bySlip={};
 for (const [spec,written,sys,want,slip] of rows){
  const got=S.check(spec,written,sys);
  if (got.verdict==='right'&&want!=='right'){falseRight++;miss.push(`FALSE-RIGHT ${spec.expr} | ${JSON.stringify(written)} ${sys}: want ${want}`);}
  if (got.verdict==='wrong'&&want!=='wrong'){falseWrong++;miss.push(`FALSE-WRONG ${spec.expr} | ${JSON.stringify(written)} ${sys}: want ${want}`);}
  if (got.verdict!==want&&got.verdict==='unsure') miss.push(`over-unsure ${spec.expr} | ${JSON.stringify(written)} ${sys}: want ${want}`);
  if (got.verdict==='unsure') unsure++;
  if (want==='wrong'&&got.verdict==='wrong'&&(got.slip??null)!==(slip??null)) miss.push(`slip ${spec.expr} | ${written}: want ${slip??'none'} got ${got.slip??'none'}`);
  if (got.slip) bySlip[got.slip]=(bySlip[got.slip]||0)+1;
  assert.equal(typeof got.why,'string');assert.ok(!/\d/.test(got.why),'a why carries no value');
 }
 console.log(`# ${label}: ${rows.length} rows, false-right ${falseRight}, false-wrong ${falseWrong}, unsure ${unsure} (${(100*unsure/rows.length).toFixed(1)}%), slips ${JSON.stringify(bySlip)}`);
 assert.ok(rows.length>=40,`${label}: at least 40 rows`);
 assert.equal(falseRight,0,miss.join('\n'));assert.equal(falseWrong,0,miss.join('\n'));
 assert.deepEqual(miss,[],'every row as decided, slips included');
 for (const id of S.SCHOOL_UNIT_SLIPS[unit]) assert.ok((bySlip[id]||0)>=2,`${label}: slip ${id} detected at least twice`);
 for (const v of ['right','wrong','unsure']) assert.ok(rows.some((r)=>r[3]===v),`${label} has ${v} rows`);
 return bySlip;
}

// ------------------------------------------------------------------ equivalent fractions
const M1=ms('3/4 = ?/12');   // 3 x 12 / 4 = 9. added-same 3 + (12 - 4) = 11; one part 3; wrong factor 3 x 12 = 36, 3 x 4 / 12 = 1
const M3=ms('3/4 = 15/?');   // 4 x 15 / 3 = 20. added-same 4 + (15 - 3) = 16; one part 4; wrong factor 4 x 15 = 60 (4 x 3 / 15 not whole)
const M4=ms('12/16 = ?/4');  // 12 x 4 / 16 = 3. added-same 12 + 4 - 16 = 0 (none); one part 12; wrong factor 48 (both ways)
const M5=ms('6/8 = ?/12');   // 6 x 12 / 8 = 9. added-same 6 + 4 = 10; one part 6; wrong factor 72, 6 x 8 / 12 = 4
const M6=ms('10/15 = 2/?');  // 15 x 2 / 10 = 3. added-same 15 + (2 - 10) = 7; one part 15; wrong factor 30, 15 x 10 / 2 = 75
const S1=sm('18/24');        // 3/4. common factors 2, 3, 6: one part 9/24, 18/12, 6/24, 18/8, 3/24, 18/4; wrong factor 9/8, 6/12 (a÷3, b÷2)
const S2=sm('15/20');        // 3/4. common factor 5: one part 3/20, 15/4
const S3=sm('8/12');         // 2/3. common factors 2, 4: one part 4/12, 8/6, 2/12, 8/3
const EQ_SPELLINGS=[
 // 3/4 = ?/12 -> 9; a fraction that completes the given one is read as its missing top (9/12 is 9, 11/12 is 11)
 [M1,'9','uk','right'],[M1,'9.0','us','right'],[M1,'x = 9','uk','right'],[M1,'9/12','uk','right'],[M1,'18/2','uk','right'],[M1,'9,0','cz','right'],[M1,'= 9','de','right'],
 [M1,'11','uk','wrong','added-same'],[M1,'11/12','uk','wrong','added-same'],[M1,'3','uk','wrong','one-part-only'],[M1,'3/12','uk','wrong','one-part-only'],
 [M1,'36','uk','wrong','wrong-factor'],[M1,'1','uk','wrong','wrong-factor'],[M1,'8','uk','wrong'],[M1,'10/12','uk','wrong'],[M1,'-9','uk','wrong'],[M1,'8.9','uk','wrong'],[M1,'9/13','uk','wrong'],
 [M1,'3/4','uk','unsure'],[M1,'6/8','uk','unsure'],[M1,'0.75','uk','unsure'],[M1,'75%','us','unsure'],[M1,'9 cm','uk','unsure'],[M1,'nine','uk','unsure'],[M1,'','uk','unsure'],
 [M1,'9/12 = 3/4','uk','unsure'],[M1,'9:12','uk','unsure'],[M1,'9,0','us','unsure'],
 // 3/4 = 15/? -> 20; 15/20 completes it (bottom 20)
 [M3,'20','uk','right'],[M3,'15/20','uk','right'],[M3,'20.00','us','right'],[M3,'16','uk','wrong','added-same'],[M3,'15/16','uk','wrong','added-same'],
 [M3,'4','uk','wrong','one-part-only'],[M3,'15/4','uk','wrong','one-part-only'],[M3,'60','uk','wrong','wrong-factor'],[M3,'12','uk','wrong'],[M3,'3/4','uk','unsure'],[M3,'0,75','de','unsure'],
 // 12/16 = ?/4 -> 3; 3/4 completes it; 12/4 is 12 over 4 (one part) or the value 3 (right): not guessed
 [M4,'3','uk','right'],[M4,'3/4','uk','right'],[M4,'12','uk','wrong','one-part-only'],[M4,'48','uk','wrong','wrong-factor'],[M4,'48/4','uk','wrong','wrong-factor'],
 [M4,'0','uk','wrong'],[M4,'12/4','uk','unsure'],[M4,'0.75','uk','unsure'],
 // 6/8 = ?/12 -> 9
 [M5,'9','uk','right'],[M5,'9/12','uk','right'],[M5,'10','uk','wrong','added-same'],[M5,'6','uk','wrong','one-part-only'],[M5,'4','uk','wrong','wrong-factor'],[M5,'72','uk','wrong','wrong-factor'],
 [M5,'8','uk','wrong'],[M5,'3/4','uk','unsure'],[M5,'6/8','uk','unsure'],
 // 10/15 = 2/? -> 3; 2/3 completes it
 [M6,'3','uk','right'],[M6,'2/3','uk','right'],[M6,'7','uk','wrong','added-same'],[M6,'15','uk','wrong','one-part-only'],[M6,'2/15','uk','wrong','one-part-only'],
 [M6,'30','uk','wrong','wrong-factor'],[M6,'75','uk','wrong','wrong-factor'],[M6,'5','uk','wrong'],
 // simplify 18/24 -> 3/4 in lowest terms; an equal value in another form is unsure (the form asks for more)
 [S1,'3/4','uk','right'],[S1,'x = 3/4','us','right'],[S1,'3 / 4','uk','right'],[S1,'9/12','uk','unsure'],[S1,'6/8','uk','unsure'],[S1,'18/24','uk','unsure'],
 [S1,'0.75','uk','unsure'],[S1,'75%','uk','unsure'],[S1,'0,75','cz','unsure'],[S1,'9/24','uk','wrong','one-part-only'],[S1,'18/12','uk','wrong','one-part-only'],
 [S1,'3/24','uk','wrong','one-part-only'],[S1,'1 1/2','uk','wrong','one-part-only'],[S1,'6/12','uk','wrong','wrong-factor'],[S1,'9/8','uk','wrong','wrong-factor'],[S1,'1/2','uk','wrong','wrong-factor'],
 [S1,'2/3','uk','wrong'],[S1,'4/5','uk','wrong'],[S1,'0.7','uk','unsure'],[S1,'0.8','uk','unsure'],[S1,'0.76','uk','wrong'],[S1,'3/4 cm','uk','unsure'],[S1,'three quarters','uk','unsure'],[S1,'','uk','unsure'],
 [S2,'3/4','uk','right'],[S2,'3/20','uk','wrong','one-part-only'],[S2,'15/4','uk','wrong','one-part-only'],[S2,'3 3/4','uk','wrong','one-part-only'],[S2,'5/4','uk','wrong'],[S2,'12/16','uk','unsure'],
 [S3,'2/3','uk','right'],[S3,'4/6','uk','unsure'],[S3,'4/12','uk','wrong','one-part-only'],[S3,'8/6','uk','wrong','one-part-only'],[S3,'0.67','uk','unsure'],[S3,'0.6667','uk','unsure'],[S3,'0.6','uk','unsure'],
];

// ------------------------------------------------------------------ a fraction of an amount
const O1=fo('3/5 of 40');           // 24. upside down 40 ÷ 3 x 5 = 200/3 (66.67); one part 8; not divided 120; the rest 2/5 of 40 = 16
const O2=fo('3/4 of 60','kg');      // 45 kg. upside down 80; one part 15 (the rest is 15 too: one part is named first); not divided 180
const O4=fo('5/8 of 72','€');       // €45. upside down 576/5 = 115.2; one part 9; not divided 360; the rest 27
const O5=fo('3/10 of 50','m');      // 15 m. upside down 500/3 (166.67); one part 5; not divided 150; the rest 35
const O6=fo('4/9 of 36');           // 16. upside down 81; one part 4; not divided 144; the rest 20
const O7=fo('3/4 of 10');           // 15/2 = 7.5. upside down 40/3; one part 5/2; not divided 30
const OF_SPELLINGS=[
 [O1,'24','uk','right'],[O1,'24.0','us','right'],[O1,'x = 24','uk','right'],[O1,'120/5','uk','right'],[O1,'24,0','de','right'],
 [O1,'66.67','uk','wrong','of-upside-down'],[O1,'66.7','uk','wrong','of-upside-down'],[O1,'200/3','uk','wrong','of-upside-down'],[O1,'66 2/3','uk','wrong','of-upside-down'],
 [O1,'8','uk','wrong','of-one-part'],[O1,'120','uk','wrong','of-not-divided'],[O1,'16','uk','wrong','of-rest'],[O1,'25','uk','wrong'],[O1,'-24','uk','wrong'],
 [O1,'24 kg','uk','unsure'],[O1,'twenty-four','uk','unsure'],[O1,'','uk','unsure'],[O1,'3/5 of 40','uk','unsure'],[O1,'24:1','uk','unsure'],[O1,'24,0','uk','unsure'],[O1,'2 4','uk','unsure'],
 [O2,'45 kg','uk','right'],[O2,'45kg','uk','right'],[O2,'45','uk','right'],[O2,'45 kilograms','uk','right'],[O2,'45 g','uk','unsure'],[O2,'45000 g','uk','unsure'],[O2,'45 m','uk','unsure'],
 [O2,'80 kg','uk','wrong','of-upside-down'],[O2,'15 kg','uk','wrong','of-one-part'],[O2,'180 kg','uk','wrong','of-not-divided'],[O2,'180','uk','wrong','of-not-divided'],[O2,'44','uk','wrong'],
 [O4,'€45','uk','right'],[O4,'45 €','de','right'],[O4,'45 euros','uk','right'],[O4,'45,00 €','cz','right'],[O4,'€45.00','us','right'],[O4,'£45','uk','unsure'],[O4,'45,00','uk','unsure'],
 [O4,'€9','uk','wrong','of-one-part'],[O4,'€360','uk','wrong','of-not-divided'],[O4,'€27','uk','wrong','of-rest'],[O4,'27','uk','wrong','of-rest'],
 [O4,'115.2','uk','wrong','of-upside-down'],[O4,'115,2 €','cz','wrong','of-upside-down'],
 [O5,'15 m','uk','right'],[O5,'15 metres','uk','right'],[O5,'1500 cm','uk','unsure'],[O5,'35 m','uk','wrong','of-rest'],[O5,'5 m','uk','wrong','of-one-part'],
 [O5,'150','uk','wrong','of-not-divided'],[O5,'166.67 m','uk','wrong','of-upside-down'],[O5,'166,7','de','wrong','of-upside-down'],
 [O6,'16','uk','right'],[O6,'4','uk','wrong','of-one-part'],[O6,'81','uk','wrong','of-upside-down'],[O6,'144','uk','wrong','of-not-divided'],[O6,'20','uk','wrong','of-rest'],
 [O7,'7.5','uk','right'],[O7,'7 1/2','uk','right'],[O7,'15/2','uk','right'],[O7,'7,5','cz','right'],[O7,'7,5','uk','unsure'],
 [O7,'2.5','uk','wrong','of-one-part'],[O7,'30','uk','wrong','of-not-divided'],[O7,'13.33','uk','wrong','of-upside-down'],[O7,'7.4','uk','wrong'],
];

// ------------------------------------------------------------------ multiply and divide fractions
const P1=cs('2/3 × 3/4');   // 6/12 = 1/2. added 2/3 + 3/4 = 17/12 and (2+3)/(3+4) = 5/7; bottoms added 6/7
const P2=cs('3/5 × 2/7');   // 6/35. added 31/35 and 5/12; bottoms added 6/12 = 1/2
const P3=cs('4/9 × 3/8');   // 12/72 = 1/6. added 59/72 and 7/17; bottoms added 12/17
const PS=cs('2/3 × 3/4',{form:'simplest'});
const D1=cs('3/4 ÷ 1/2');   // 3/4 × 2/1 = 3/2. added after the flip 3/4 + 2 = 11/4; kept 3/8; first flipped 4/3 × 1/2 = 2/3; bottoms added 6/5
const D2=cs('2/5 ÷ 3/4');   // 2/5 × 4/3 = 8/15. added 2/5 + 4/3 = 26/15; kept 6/20 = 3/10; first flipped 15/8; bottoms added 8/8 = 1
const D3=cs('5/6 ÷ 2/3');   // 5/6 × 3/2 = 15/12 = 5/4. added 7/3; kept 10/18 = 5/9; first flipped 12/15 = 4/5; bottoms added 15/8
const MD_SPELLINGS=[
 [P1,'1/2','uk','right'],[P1,'6/12','uk','right'],[P1,'0.5','uk','right'],[P1,'50%','us','right'],[P1,'0,5','de','right'],[P1,'3/6','uk','right'],[P1,'0,5','uk','unsure'],
 [P1,'17/12','uk','wrong','added-not-multiplied'],[P1,'1 5/12','uk','wrong','added-not-multiplied'],[P1,'5/7','uk','wrong','added-not-multiplied'],
 [P1,'6/7','uk','wrong','bottoms-added'],[P1,'12/14','uk','wrong','bottoms-added'],[P1,'8/9','uk','wrong'],[P1,'1/3','uk','wrong'],[P1,'-1/2','uk','wrong'],
 [P1,'1/2 m','uk','unsure'],[P1,'a half','uk','unsure'],[P1,'','uk','unsure'],[P1,'2/3 × 3/4','uk','unsure'],[P1,'1:2','uk','unsure'],[P1,'0.49','uk','wrong'],[P1,'0.51','uk','wrong'],
 [P2,'6/35','uk','right'],[P2,'12/70','uk','right'],[P2,'0.1714','uk','unsure'],[P2,'0.17','uk','unsure'],[P2,'31/35','uk','wrong','added-not-multiplied'],[P2,'5/12','uk','wrong','added-not-multiplied'],
 [P2,'1/2','uk','wrong','bottoms-added'],[P2,'6/12','uk','wrong','bottoms-added'],[P2,'6/35 cm','uk','unsure'],[P2,'5/35','uk','wrong'],
 [P3,'1/6','uk','right'],[P3,'12/72','uk','right'],[P3,'0.1667','uk','unsure'],[P3,'59/72','uk','wrong','added-not-multiplied'],[P3,'12/17','uk','wrong','bottoms-added'],[P3,'7/17','uk','wrong','added-not-multiplied'],
 [PS,'1/2','uk','right'],[PS,'6/12','uk','unsure'],[PS,'0.5','uk','unsure'],[PS,'5/7','uk','wrong','added-not-multiplied'],
 [D1,'3/2','uk','right'],[D1,'1 1/2','uk','right'],[D1,'1.5','us','right'],[D1,'6/4','uk','right'],[D1,'1,5','cz','right'],[D1,'150%','uk','right'],[D1,'1.50','uk','right'],[D1,'1,5','us','unsure'],
 [D1,'3/8','uk','wrong','kept-second'],[D1,'0.375','uk','wrong','kept-second'],[D1,'2/3','uk','wrong','flipped-first'],[D1,'4/6','uk','wrong','flipped-first'],
 [D1,'11/4','uk','wrong','added-not-multiplied'],[D1,'2 3/4','uk','wrong','added-not-multiplied'],[D1,'6/5','uk','wrong','bottoms-added'],[D1,'1.2','uk','wrong','bottoms-added'],
 [D1,'1/2','uk','wrong'],[D1,'-3/2','uk','wrong'],[D1,'1 1/2 kg','uk','unsure'],
 [D2,'8/15','uk','right'],[D2,'16/30','uk','right'],[D2,'0.533','uk','unsure'],[D2,'0.53','uk','unsure'],[D2,'3/10','uk','wrong','kept-second'],[D2,'6/20','uk','wrong','kept-second'],
 [D2,'15/8','uk','wrong','flipped-first'],[D2,'1 7/8','uk','wrong','flipped-first'],[D2,'26/15','uk','wrong','added-not-multiplied'],[D2,'1','uk','wrong','bottoms-added'],[D2,'8/8','uk','wrong','bottoms-added'],[D2,'8/16','uk','wrong'],
 [D3,'5/4','uk','right'],[D3,'1 1/4','uk','right'],[D3,'1.25','uk','right'],[D3,'15/12','uk','right'],[D3,'5/9','uk','wrong','kept-second'],[D3,'10/18','uk','wrong','kept-second'],
 [D3,'4/5','uk','wrong','flipped-first'],[D3,'0.8','uk','wrong','flipped-first'],[D3,'7/3','uk','wrong','added-not-multiplied'],[D3,'15/8','uk','wrong','bottoms-added'],[D3,'1.875','uk','wrong','bottoms-added'],
];

const W7_SLIPS={};
/** The W7 batch 2 units whose tables are at the end of this file (decimals and percent). */
const B2_UNITS=['dec-arith','dec-convert','pct-of-amount','pct-change'];
test(`W7 SPELLINGS equivalent fractions: ${EQ_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('EQ_SPELLINGS equivalent fractions',EQ_SPELLINGS,'frac-equivalent'));});
test(`W7 SPELLINGS a fraction of an amount: ${OF_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('OF_SPELLINGS a fraction of an amount',OF_SPELLINGS,'frac-of-amount'));});
test(`W7 SPELLINGS multiply and divide fractions: ${MD_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('MD_SPELLINGS multiply and divide fractions',MD_SPELLINGS,'frac-mul-div'));});
test('W7 SLIPS: every slip on the closed list belongs to exactly one unit, carries no value, and every unit\'s list is detected',()=>{
 const units=Object.keys(S.SCHOOL_UNIT_SLIPS);
 // W7 batch 2 adds the decimals and percent units, each with its own closed list (tables at the end of this file)
 assert.deepEqual(units.sort(),['frac-add-sub','frac-equivalent','frac-mul-div','frac-of-amount',...B2_UNITS].sort());
 const listed=units.flatMap((u)=>S.SCHOOL_UNIT_SLIPS[u]);
 assert.equal(new Set(listed).size,listed.length,'no slip id is on two units');
 assert.deepEqual([...listed].sort(),S.SCHOOL_SLIPS.map((s)=>s.id).sort(),'the closed list is exactly the units\' lists');
 for (const s of S.SCHOOL_SLIPS){assert.doesNotMatch(s.name+s.says+s.points,/\d/,s.id);assert.match(s.says,/^[A-Z][^]*\.$/,s.id);}
 for (const u of units){const order=S.SCHOOL_SLIPS.map((s)=>s.id).filter((id)=>S.SCHOOL_UNIT_SLIPS[u].includes(id));assert.deepEqual([...S.SCHOOL_UNIT_SLIPS[u]],order,`${u}: in SCHOOL_SLIPS order`);}
});

// ------------------------------------------------------------------ W7 wellFormed and question
test('W7 wellFormed: each new shape reads only its one printed spelling and refuses what makes a poor question',()=>{
 for (const s of [M1,M3,M4,M5,M6,S1,S2,S3,O1,O2,O4,O5,O6,O7,P1,P2,P3,PS,D1,D2,D3]) assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));
 const bad=[
  [ms('3/4 = ?/13'),'No whole number'],[ms('3/4 = 10/?'),'No whole number'],[ms('3/4 = ?/4'),'nothing to work out'],[ms('3/4 = 3/?'),'nothing to work out'],
  [ms('3/4 = ?/?'),'cannot read'],[ms('3/4 = 9/12'),'cannot read'],[ms('?/4 = 9/12'),'cannot read'],[ms('3/4=?/12'),'cannot read'],[ms('3/1 = ?/12'),'bottom is 1'],
  [ms('3/4 = ?/400'),'bottom is 1, or larger'],[ms('1/2 = 60/?'),'bottom is 1, or larger'],[{...M1,form:'simplest'},'does not take'],[{...M1,unit:'kg'},'does not take'],[{...M1,answer:'9'},'no answer field'],
  [sm('3/4'),'already in its simplest form'],[sm('24/18'),'not a proper fraction'],[sm('18/18'),'not a proper fraction'],[sm('18 /24'),'cannot read'],[sm('0/4'),'cannot read'],[sm('2/200'),'bottom is 1, or larger'],
  [{...S1,allowNegative:true},'does not take'],[sm('18/24 + 1'),'cannot read'],
  [fo('5/3 of 40'),'not a proper fraction'],[fo('3/5 of 40.5'),'cannot read'],[fo('3/5 of 0'),'cannot read'],[fo('3/5 of 20000'),'cannot read'],[fo('3/1 of 40'),'bottom is 1'],
  [fo('3/5 of 40','inch'),'unit is not'],[{...O1,form:'decimal'},'does not take'],[fo('3/5 x 40'),'cannot read'],[fo('3/5 of x'),'cannot read'],
  [cs('3/4 ÷ 0'),'divides by zero'],[{shape:'fraction',expr:'3/4'},'not one of'],
 ];
 for (const [s,why] of bad){const w=S.wellFormed(s);assert.equal(w.ok,false,JSON.stringify(s));assert.ok(w.why.includes(why),`${JSON.stringify(s)}: ${w.why}`);}
});

test('W7 question: each shape prints its question in plain text and TeX, never its answer, the TeX typesets, and it reads back to its spec',()=>{
 const P=[
  [M1,'Fill in the missing number: 3/4 = ?/12.',2],[M3,'Fill in the missing number: 3/4 = 15/?.',2],[S1,'Write 18/24 in its simplest form.',1],
  [O1,'Find 3/5 of 40.',1],[O2,'Find 3/4 of 60 kg.',1],[O4,'Find 5/8 of €72.',1],[O5,'Find 3/10 of 50 metres.',1],[fo('1/4 of 8','l'),'Find 1/4 of 8 litres.',1],[fo('2/3 of 60','min'),'Find 2/3 of 60 minutes.',1],
  [P1,'Work out 2/3 × 3/4.',2],[D1,'Work out 3/4 ÷ 1/2.',2],[PS,'Work out 2/3 × 3/4. Give your answer in its simplest form.',2],
 ];
 for (const [s,plain,fracs] of P){
  const q=S.question(s);
  assert.equal(q.plain,plain);
  assert.ok(!S.leaksSchool(s,q.plain),`the question itself is not a leak: ${q.plain}`);
  for (const line of [q.plain,q.tex]){
   let fr=0;T.walk(T.parseMath(line),(n)=>{if(n.t==='frac')fr++;});
   assert.equal(fr,fracs,`${line} stacks ${fracs} fraction(s), the gap too`);
  }
  assert.deepEqual(S.specFromQuestion(q.plain),s,`${q.plain} reads back to its spec`);
 }
 // the gap is stacked as a fraction part, legible where the number would stand
 const gap=[];T.walk(T.parseMath(S.question(M1).plain),(n)=>{if(n.t==='frac')gap.push(n);});
 assert.deepEqual(gap[1].num,[{t:'ord',v:'?'}]);assert.deepEqual(gap[1].den,[{t:'num',v:'12'}]);
});

// ------------------------------------------------------------------ W7 leak and legit tables
const W7_LEAKS={
 'frac-equivalent':[
  [M1,'The missing number is 9.'],[M1,'It is nine.'],[M1,'3/4 = 9/12'],[M1,'Nine twelfths.'],[M1,'Multiply 3 by 3.'],[M1,'3 x 3 = 9'],[M1,'12 ÷ 4 × 3'],
  [M1,'Three times three.'],[M1,'The top becomes 9.'],[M1,'You get 9 over 12.'],[M1,'It is 36 ÷ 4.'],[M1,'The answer is 9.0'],[M1,'Write 9 on top.'],
  [M3,'The bottom is 20.'],[M3,'Multiply 4 by 5.'],[M3,'15/20'],[M3,'It is 4 x 5.'],[M3,'Twenty.'],[M3,'fifteen twentieths'],
  [S1,'It simplifies to 3/4.'],[S1,'Three quarters.'],[S1,'18 ÷ 6 = 3'],[S1,'The top is 3 and the bottom is 4.'],[S1,'That is 0.75.'],[S1,'75%'],
  [S1,'Divide 24 by 6 to get 4.'],[S1,'three-quarters'],[S1,'3:4'],[S1,'It is the same as 3 over 4.'],
  [S2,'Divide 15 by 5.'],[S2,'It is 3/4.'],[S2,'The answer is 0.75'],[S2,'You get three quarters'],
  [M5,'6/8 = 9/12'],[M5,'The answer is nine'],[M5,'12 × 3 ÷ 4'],
 ],
 'frac-of-amount':[
  [O1,'The answer is 24.'],[O1,'Twenty-four.'],[O1,'8 x 3 = 24'],[O1,'8 × 3'],[O1,'Three lots of 8.'],[O1,'Multiply 8 by 3.'],[O1,'40 ÷ 5 × 3'],[O1,'120 ÷ 5'],
  [O1,'It is 24.0'],[O1,'You get twenty four.'],[O1,'That makes 24 in total.'],[O1,'Three groups of eight.'],
  [O2,'You get 45 kg.'],[O2,'15 x 3 = 45'],[O2,'forty-five kilograms'],[O2,'60 ÷ 4 × 3'],
  [O4,'It is €45.'],[O4,'9 × 5'],[O4,'45 euros'],[O4,'72 ÷ 8 × 5'],
  [O5,'5 x 3'],[O5,'Fifteen metres.'],[O5,'150 ÷ 10'],[O7,'It is 7.5.'],[O7,'Seven and a half.'],[O7,'2.5 x 3'],
 ],
 'frac-mul-div':[
  [P1,'The answer is 1/2.'],[P1,'It is a half.'],[P1,'6/12'],[P1,'Six twelfths.'],[P1,'2 x 3 = 6 and 3 x 4 = 12'],[P1,'0.5'],[P1,'50%'],[P1,'Multiply the tops: 2 x 3 = 6.'],
  [P1,'It simplifies to one half.'],[P1,'The top is 6.'],
  [D1,'3/4 × 2/1 = 6/4'],[D1,'One and a half.'],[D1,'1.5'],[D1,'You get 3/2.'],[D1,'It is 1 1/2.'],[D1,'3 x 2 = 6'],[D1,'6 over 4'],[D1,'150%'],[D1,'three halves'],
  [D2,'It is 8/15.'],[D2,'Eight fifteenths.'],[D2,'2/5 × 4/3 = 8/15'],[D2,'2 x 4 = 8 and 5 x 3 = 15'],[D2,'0.533'],[D2,'16/30'],
  [P2,'3 x 2 = 6 and 5 x 7 = 35'],[P2,'Six thirty-fifths.'],[P2,'The answer is 6/35.'],[P2,'Multiply 3 by 2 for the top.'],
 ],
};
const W7_LEGIT={
 'frac-equivalent':[
  [M1,'What do you multiply 4 by to get 12?'],[M1,'4 x 3 = 12, so the bottom was multiplied by 3.'],[M1,'Do the same to the top as you did to the bottom.'],[M1,'The bottom went from 4 to 12.'],
  [M1,'Multiply the top by the same number.'],[M1,'4 goes into 12 three times.'],[M1,'12 is 4 times 3.'],[M1,'Equal fractions come from multiplying top and bottom by the same number.'],
  [M1,'Check: the new fraction should still be three quarters.'],
  [M3,'What was 3 multiplied by to make 15?'],[M3,'3 x 5 = 15'],[M3,'Do the same to the bottom.'],[M3,'The top was multiplied by 5.'],
  [S1,'Find a number that goes into both 18 and 24.'],[S1,'Both are even, so you can start by halving.'],[S1,'Divide the top and the bottom by the same number.'],
  [S1,'6 goes into both 18 and 24.'],[S1,'Try dividing both by 2 first: 9/12.'],[S1,'The highest common factor of 18 and 24 is 6.'],[S1,'9/12 can be simplified again.'],
  [S1,'Keep going until nothing but 1 goes into both.'],[S1,'Divide both by 6.'],
  [S2,'Both 15 and 20 are in the five times table.'],[S2,'Divide the top and the bottom by 5.'],[S2,'What is the biggest number that goes into 15 and 20?'],
  [M5,'The bottom goes from 8 to 12, which is not a whole times bigger.'],[M5,'Simplify 6/8 first, then scale up.'],[M5,'6/8 is the same as 3/4.'],[M5,'Then multiply 3/4 by 3/3.'],
 ],
 'frac-of-amount':[
  [O1,'Divide 40 by 5 first.'],[O1,'40 ÷ 5 = 8'],[O1,'One fifth of 40 is 8.'],[O1,'Find 1/5 of 40, then take 3 of those.'],[O1,'Then multiply by 3.'],
  [O1,'The bottom tells you how many equal parts.'],[O1,'Split 40 into 5 equal groups.'],[O1,'3/5 of 40 means 3 lots of a fifth of 40.'],[O1,'Your answer should be less than 40.'],
  [O1,'What is 40 divided by 5?'],[O1,'The top is 3, so you need 3 parts.'],[O1,'Work out 3/5 × 40.'],[O1,'Divide 40 by 5, then multiply by 3.'],
  [O2,'Divide 60 kg by 4.'],[O2,'A quarter of 60 is 15.'],[O2,'Keep the kg in your answer.'],[O2,'60 ÷ 4 = 15'],
  [O4,'Find one eighth of €72.'],[O4,'Then take 5 of those parts.'],[O4,'72 ÷ 8 = 9'],[O4,'Share €72 into 8 equal parts.'],
  [O5,'50 ÷ 10 = 5'],[O5,'Find a tenth first.'],[O5,'The answer is in metres.'],
 ],
 'frac-mul-div':[
  [P1,'Multiply the tops together and the bottoms together.'],[P1,'The 3 on top and the 3 underneath cancel.'],[P1,'Cancel before you multiply.'],[P1,'Then simplify your answer.'],
  [P1,'Now work out 2/3 × 3/4.'],[P1,'The bottoms multiply to 12.'],[P1,'3 x 4 = 12 on the bottom.'],[P1,'Your answer will be smaller than both fractions.'],
  [D1,'Turn the fraction you divide by upside down.'],[D1,'1/2 becomes 2/1.'],[D1,'Then multiply 3/4 by 2/1.'],[D1,'Dividing by a half is the same as doubling.'],
  [D1,'Keep, change, flip.'],[D1,'Your answer will be bigger than 3/4.'],[D1,'Now work out 3/4 ÷ 1/2.'],[D1,'How many halves fit into 3/4?'],
  [D2,'Flip 3/4 to get 4/3.'],[D2,'Now multiply 2/5 by 4/3.'],[D2,'Keep 2/5 as it is.'],[D2,'Multiply the tops, then the bottoms.'],
  [P2,'Nothing cancels here.'],[P2,'Check whether anything cancels first.'],
 ],
};
/**
 * W7 CONFLICTS: legit hints the strict rule refuses, accepted and reported. Simplify refuses a bare whole number equal
 * to the answer's top or bottom, so for 18/24 (3/4) "divisible by 3" and "Step 4" are refused (the generator never
 * draws such an item: its answer's top and bottom never divide the scale factor). A multiplication with a top of 1
 * makes the other top the answer's top (3/8 × 1/7 = 3/56), so naming that top alone is refused, as in W5a rule 4.
 */
const W7_CONFLICTS=[
 [S1,'Both 18 and 24 are divisible by 3.'],[S1,'Step 4: check your answer.'],[cs('3/8 × 1/7'),'The tops are 3 and 1.'],
];

for (const unit of ['frac-equivalent','frac-of-amount','frac-mul-div']){
 test(`W7 LEAKS ${unit}: ${W7_LEAKS[unit].length} hints that give the answer away are refused; ${W7_LEGIT[unit].length} legit hints pass`,()=>{
  const leaks=W7_LEAKS[unit],legit=W7_LEGIT[unit];
  const missed=leaks.filter(([s,h])=>!S.leaksSchool(s,h)).map(([s,h])=>`${s.expr} | ${h}`);
  const flagged=legit.filter(([s,h])=>S.leaksSchool(s,h)).map(([s,h])=>`${s.expr} | ${h}`);
  const specs=new Set([...leaks,...legit].map(([s])=>JSON.stringify(s)));
  console.log(`# W7 LEAKS ${unit}: ${leaks.length} (missed ${missed.length}), LEGIT ${legit.length} (flagged ${flagged.length}), specs ${specs.size}`);
  assert.deepEqual(missed,[],'every leaking hint is caught');
  assert.deepEqual(flagged,[],'no legit hint is flagged');
  assert.ok(leaks.length>=15&&legit.length>=20&&specs.size>=3);
  for (const [s] of [...leaks,...legit]) assert.equal(S.unitOf(s),unit,`${s.expr} is a ${unit} spec`);
 });
}
test('W7 CONFLICTS: the strict leak rule refuses these legit hints, and that cost is accepted and reported',()=>{
 for (const [s,h] of W7_CONFLICTS) assert.equal(S.leaksSchool(s,h),true,`${s.expr} | ${h}`);
 console.log(`# W7 accepted conflicts ${W7_CONFLICTS.length}`);
});

// ------------------------------------------------------------------ W7 generators, against references written here
/** The references: each unit's answer by hand, with this file's own gcd, never the module's evaluator. */
const W7REF={
 'frac-equivalent':(s)=>{
  let m=/^(\d+)\/(\d+) = (\?|\d+)\/(\?|\d+)$/.exec(s.expr);
  if(s.shape==='missing'&&m){const [a,b]=[+m[1],+m[2]];const top=m[3]==='?';const known=+(top?m[4]:m[3]);const ans=top?a*known/b:b*known/a;const factor=top?known/b:known/a;return {kind:'missing',a,b,known,top,ans,factor,truth:`${ans}`,nums:[a,b,known]};}
  m=/^(\d+)\/(\d+)$/.exec(s.expr);
  if(s.shape==='simplify'&&m){const [a,b]=[+m[1],+m[2]],g=refGcd(a,b);return {kind:'simplify',a,b,g,p:a/g,q:b/g,truth:`${a/g}/${b/g}`,nums:[a,b]};}
  return null;
 },
 'frac-of-amount':(s)=>{const m=/^(\d+)\/(\d+) of (\d+)$/.exec(s.expr);if(!m||s.shape!=='fraction-of')return null;const [a,b,N]=[+m[1],+m[2],+m[3]];return {a,b,N,ans:a*N/b,truth:`${a*N/b}`,nums:[a,b,N]};},
 'frac-mul-div':(s)=>{const m=/^(\d+)\/(\d+) ([×÷]) (\d+)\/(\d+)$/.exec(s.expr);if(!m||s.shape!=='compute')return null;const [a,b,op,c,d]=[+m[1],+m[2],m[3],+m[4],+m[5]];const [n,den]=op==='×'?[a*c,b*d]:[a*d,b*c];const g=refGcd(n,den);return {a,b,op,c,d,n:n/g,den:den/g,truth:`${n/g}/${den/g}`,nums:[a,b,c,d]};},
};
const W7GEN={'frac-equivalent':S.genEquivalent,'frac-of-amount':S.genOfAmount,'frac-mul-div':S.genMulDiv};
const W7_DISTINCT={};
for (const unit of Object.keys(W7GEN)){
 test(`W7 GENERATOR ${unit}: seeds 1..200 for tiers 1 and 2 give well-formed, distinct items of the documented tier, judged right by a reference`,()=>{
  const g=W7GEN[unit],ref=W7REF[unit],counts={};
  assert.equal(S.SCHOOL_GENERATORS[unit],S.generatorFor(unit));assert.equal(typeof S.generatorFor(unit),'function');
  for (const tier of [1,2]){
   const seen=new Set();let simplify=0;
   for (let seed=1;seed<=200;seed++){
    const s=g(seed,tier);
    assert.ok(s,`seed ${seed} tier ${tier}`);assert.deepEqual(g(seed,tier),s,'same seed, same spec');
    assert.deepEqual(S.generatorFor(unit)(seed,tier),s,'the registered generator is this one');
    assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));
    assert.equal(S.unitOf(s),unit);
    const r=ref(s);assert.ok(r,`the reference reads ${JSON.stringify(s)}`);
    const q=S.question(s).plain;
    // the tier, as documented in school.ts
    if (unit==='frac-equivalent'){
     if (tier===1){assert.equal(r.kind,'missing');assert.ok(Number.isInteger(r.factor)&&r.factor>=2&&r.factor<=6,`scaled up by 2..6: ${s.expr}`);assert.ok(r.a>=2&&r.a<r.b&&r.b<=10&&refGcd(r.a,r.b)===1,s.expr);assert.ok(r.ans<=60&&r.known<=60,s.expr);}
     else if (r.kind==='simplify'){simplify++;const k=r.g;assert.ok(r.q<=12&&r.b<=100,s.expr);assert.ok((r.p===1||k%r.p!==0)&&k%r.q!==0,`no answer number divides the factor: ${s.expr}`);}
     else {assert.ok(r.factor<1,`scaled down: ${s.expr}`);assert.equal(r.known,r.top?r.b*r.factor:r.a*r.factor);}
     if (r.kind==='missing'){assert.ok(Number.isInteger(r.ans)&&r.ans>=1,s.expr);assert.notEqual(r.ans,r.factor,'the answer is never the scale factor');assert.ok(!r.nums.includes(r.ans),`the question does not print its answer: ${q}`);}
    }
    if (unit==='frac-of-amount'){
     assert.ok(r.a>=2&&r.a<r.b&&refGcd(r.a,r.b)===1&&r.N%r.b===0,s.expr);assert.ok(Number.isInteger(r.ans));assert.ok(!r.nums.includes(r.ans),`${q} does not print its answer`);
     if (tier===1){assert.ok(r.b<=10&&r.N/r.b>=2&&r.N/r.b<=10,s.expr);assert.equal(s.unit,undefined,'no unit at tier 1');}
     else {assert.ok(r.b<=12&&r.N/r.b>=3&&r.N/r.b<=25,s.expr);assert.ok(['kg','g','km','m','cm','l','ml','min','€','£','$'].includes(s.unit),`a unit at tier 2: ${s.unit}`);}
    }
    if (unit==='frac-mul-div'){
     assert.equal(r.op,tier===1?'×':'÷',`tier ${tier} ${tier===1?'multiplies':'divides'}`);assert.ok(r.b<=10&&r.d<=10&&r.a<r.b&&r.c<r.d,s.expr);
     assert.ok(r.den>1,`not a whole number: ${s.expr}`);
     const same=(p,qq,x,y)=>p*y===qq*x;assert.ok(!same(r.n,r.den,r.a,r.b)&&!same(r.n,r.den,r.c,r.d)&&!same(r.n,r.den,r.d,r.c),`the answer is not an operand: ${s.expr}`);
    }
    for (const sys of S.SCHOOL_SYSTEMS){
     assert.equal(S.check(s,r.truth,sys).verdict,'right',`${s.expr} = ${r.truth} (${sys})`);
     const off=/\//.test(r.truth)?r.truth.replace(/^(\d+)/,(x)=>String(+x+1)):String(+r.truth+1);
     assert.equal(S.check(s,off,sys).verdict,'wrong',`${s.expr} != ${off} (${sys})`);
    }
    assert.ok(S.leaksSchool(s,`The answer is ${r.truth}.`),`the answer leaks: ${s.expr}`);
    assert.ok(!S.leaksSchool(s,q),`the question does not: ${q}`);
    assert.ok(!S.leaksSchool(s,S.withheldSchool(s)),'the withheld line leaks nothing');
    seen.add(JSON.stringify(s));
   }
   counts[tier]=seen.size;
   if (unit==='frac-equivalent'&&tier===2) assert.ok(simplify>=100&&simplify<=160,`two in three tier-2 items simplify (${simplify} of 200)`);
  }
  W7_DISTINCT[unit]=counts;
  console.log(`# W7 GENERATOR ${unit} distinct specs over seeds 1..200: tier 1 ${counts[1]}, tier 2 ${counts[2]}`);
  assert.ok(counts[1]>=100&&counts[2]>=100,'seeds spread');
  for (const bad of [-1,1.5,NaN,'1',null,undefined,2**32]) assert.equal(g(bad,1),null);
  for (const bad of [0,3,'1',null,1.5]) assert.equal(g(1,bad),null);
 });
}

test('W7 PURITY: random strings through check and leaksSchool on every new shape never throw and give the same answer twice',()=>{
 let seed=777;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const alphabet=['0','1','2','3','4','9','/','.',',',' ','%',':','-','?','=','x','×','÷','of','kg','€','half',' and ','by','lots of'];
 const specs=[M1,M3,S1,O1,O4,P1,D1];
 for (let i=0;i<300;i++){
  let s='';const len=Math.floor(rnd()*20);for(let k=0;k<len;k++)s+=alphabet[Math.floor(rnd()*alphabet.length)];
  for (const sp of specs){
   for (const sys of S.SCHOOL_SYSTEMS){const v=S.check(sp,s,sys);assert.ok(['right','wrong','unsure'].includes(v.verdict));assert.deepEqual(S.check(sp,s,sys),v);}
   const l=S.leaksSchool(sp,s);assert.equal(typeof l,'boolean');assert.equal(S.leaksSchool(sp,s),l);
  }
  assert.ok(S.specFromQuestion(s)===null||S.wellFormed(S.specFromQuestion(s)).ok);
 }
 for (const o of [null,undefined,0,{},[],{shape:'missing'},{shape:'simplify',expr:42},{shape:'fraction-of',expr:'3/5 of 40',unit:'parsec'}]){
  assert.equal(S.check(o,'9','uk').verdict,'unsure');assert.equal(S.leaksSchool(o,'9'),false);assert.equal(S.question(o),null);assert.equal(S.unitOf(o),null);
 }
});

// ================================================================== Family W7 batch 2: decimals and percent
// "Add, subtract and multiply decimals" (compute with decimal operands, money allowed). Every expected verdict below was
// worked by hand from the arithmetic first (the value and each slip's value are in the comments), then run. The gates
// are the batch-1 gates: zero false-right, zero false-wrong, every slip of the unit detected at least twice, every leak
// refused, no legit hint refused (the conflicts the strict rule accepts are listed apart).

// ------------------------------------------------------------------ add, subtract and multiply decimals
const DA1=cs('4.35 + 2.8');              // 7.15. lined up by last digits 435 + 28 = 463 -> 4.63; the point left out 715
const DA2=cs('7.5 - 2.25');              // 5.25. lined up 75 - 225 < 0 (none); the point left out 525
const DA3=cs('8.45 - 2.3');              // 6.15. lined up 845 - 23 = 822 -> 8.22; the point left out 615
const DA4=cs('3.6 × 0.4');               // 1.44. the point by the wrong count 0.144, 14.4; the point left out 144
const DA5=cs('2.45 × 1.3');              // 3.185. the wrong count 0.3185, 31.85, 318.5; the point left out 3185
const DA6=cs('4.35 + 2.80',{unit:'€'});  // €7.15. same places, so no lining-up slip; the point left out 715
const DA7=cs('3.45 × 4',{unit:'£'});     // £13.80. the wrong count 1.38, 138; the point left out 1380
const DA8=cs('12.6 + 0.75');             // 13.35. lined up 126 + 75 = 201 -> 2.01; the point left out 1335
const DA9=cs('0.7 × 0.3');               // 0.21. the wrong count 0.021, 2.1; the point left out 21

// ------------------------------------------------------------------ fractions, decimals and percent (convert)
const cv=(expr,to)=>({shape:'convert',expr,to});
const CV1=cv('3/8','decimal');     // 0.375. upside down 8/3 = 2.666..; ten times 3.75, 0.0375; top dot bottom 3.8
const CV2=cv('7/20','decimal');    // 0.35. upside down 20/7 = 2.857..; ten times 3.5, 0.035; top dot bottom 7.20 = 7.2
const CV3=cv('7/20','percent');    // 35%. upside down 20/7 (285.7%); unscaled 0.35%; wrong way 0.0035%; ten times 3.5%, 350%
const CV4=cv('0.35','fraction');   // 7/20. upside down 20/7; ten times 35/10 = 7/2, 35/1000 = 7/200
const CV5=cv('0.6','percent');     // 60%. unscaled 0.6%; wrong way 0.006%; ten times 6%, 600%
const CV6=cv('35%','decimal');     // 0.35. unscaled 35; wrong way 3500; ten times 3.5, 0.035
const CV7=cv('35%','fraction');    // 7/20. upside down 20/7 (100/35); unscaled 35 (35/1); ten times 7/2, 7/200
const CV8=cv('12.5%','fraction');  // 1/8. upside down 8; unscaled 12.5 = 25/2; ten times 5/4, 1/80
const CV9=cv('5/4','percent');     // 125%. upside down 4/5 (80%); unscaled 1.25%; wrong way 0.0125%; ten times 12.5%, 1250%

// ------------------------------------------------------------------ a percent of an amount
const po=(expr,unit)=>({shape:'percent-of',expr,...(unit?{unit}:{})});
const PO1=po('35% of 80');          // 28. divided 80 ÷ 35 = 2.2857.., 80 ÷ 0.35 = 228.57..; as a whole 35 × 80 = 2800; ten percent 8; the rest 52
const PO2=po('15% of 60','€');      // €9. divided 4, 400; as a whole 900; ten percent 6; the rest 51
const PO3=po('12.5% of 40','kg');   // 5 kg. divided 3.2, 320; as a whole 500; ten percent 4; the rest 35
const PO4=po('30% of 140');         // 42. divided 4.666.., 466.66..; as a whole 4200; ten percent 14; the rest 98
const PO5=po('75% of 60');          // 45. divided 0.8, 80; as a whole 4500; ten percent 6; the rest 15
const PO6=po('54% of 130','£');     // £70.20. divided 2.4074.., 240.7407..; as a whole 7020; ten percent 13; the rest 59.8
const PO7=po('5% of 20');           // 1. divided 4, 400; as a whole 100; ten percent 2; the rest 19

// ------------------------------------------------------------------ percent increase and decrease
const pc=(expr,unit)=>({shape:'percent-change',expr,...(unit?{unit}:{})});
const PC1=pc('increase 60 by 15%');        // 69. the change alone 9; the wrong way 51; the percent as a number 60 + 15 = 75
const PC2=pc('decrease 80 by 25%','€');    // €60. the change 20; the wrong way 100; as a number 55
const PC3=pc('increase 240 by 12.5%');     // 270. the change 30; the wrong way 210; as a number 252.5
const PC4=pc('decrease 250 by 12%','kg');  // 220 kg. the change 30; the wrong way 280; as a number 238
const PC5=pc('increase 50 by 35%','£');    // £67.50. the change 17.5; the wrong way 32.5; as a number 85
const PC6=pc('decrease 140 by 30%');       // 98. the change 42; the wrong way 182; as a number 110
const PC7=pc('increase 80 by 100%');       // 160. the change 80; the wrong way 0; as a number 180
const B2_SPELLINGS={
 'dec-arith':[
  // 4.35 + 2.8 = 7.15: an equal value in any form is right; a rounding is unsure; a whole number is an exact claim
  [DA1,'7.15','uk','right'],[DA1,'7.150','us','right'],[DA1,'7,15','cz','right'],[DA1,'7,15','de','right'],[DA1,'x = 7.15','uk','right'],[DA1,'143/20','uk','right'],[DA1,'7 3/20','uk','right'],
  [DA1,'7,15','uk','unsure'],[DA1,'7.2','uk','unsure'],[DA1,'7.1','uk','unsure'],[DA1,'7.15 cm','uk','unsure'],[DA1,'seven point one five','uk','unsure'],[DA1,'','uk','unsure'],[DA1,'4.35 + 2.8','uk','unsure'],
  [DA1,'4.63','uk','wrong','dec-lined-up'],[DA1,'4,63','cz','wrong','dec-lined-up'],[DA1,'715','uk','wrong','dec-point-dropped'],[DA1,'7','uk','wrong'],[DA1,'7.16','uk','wrong'],[DA1,'-7.15','uk','wrong'],[DA1,'0.715','uk','wrong'],
  // 7.5 - 2.25 = 5.25
  [DA2,'5.25','uk','right'],[DA2,'5.250','uk','right'],[DA2,'21/4','uk','right'],[DA2,'5 1/4','uk','right'],[DA2,'5,25','de','right'],[DA2,'5.2','uk','unsure'],[DA2,'5.3','uk','unsure'],
  [DA2,'525','uk','wrong','dec-point-dropped'],[DA2,'5.26','uk','wrong'],[DA2,'-5.25','uk','wrong'],[DA2,'4.75','uk','wrong'],
  // 8.45 - 2.3 = 6.15
  [DA3,'6.15','uk','right'],[DA3,'6.1','uk','unsure'],[DA3,'8.22','uk','wrong','dec-lined-up'],[DA3,'615','uk','wrong','dec-point-dropped'],[DA3,'6.42','uk','wrong'],
  // 3.6 × 0.4 = 1.44
  [DA4,'1.44','uk','right'],[DA4,'1,44','cz','right'],[DA4,'36/25','uk','right'],[DA4,'1 11/25','uk','right'],[DA4,'144%','uk','right'],[DA4,'1.4','uk','unsure'],[DA4,'1.5','uk','unsure'],[DA4,'1,44','us','unsure'],[DA4,'1.44 m','uk','unsure'],
  [DA4,'14.4','uk','wrong','dec-point-product'],[DA4,'0.144','uk','wrong','dec-point-product'],[DA4,'144','uk','wrong','dec-point-dropped'],[DA4,'4','uk','wrong'],[DA4,'12.4','uk','wrong'],
  // 2.45 × 1.3 = 3.185; in cz a lone point before three digits is not guessed, in uk a comma before three digits groups thousands
  [DA5,'3.185','uk','right'],[DA5,'3,185','cz','right'],[DA5,'3.185','cz','unsure'],[DA5,'3.19','uk','unsure'],[DA5,'3.18','uk','unsure'],[DA5,'3.2','uk','unsure'],[DA5,'3.185 kg','uk','unsure'],
  [DA5,'31.85','uk','wrong','dec-point-product'],[DA5,'0.3185','uk','wrong','dec-point-product'],[DA5,'318.5','uk','wrong','dec-point-product'],[DA5,'3185','uk','wrong','dec-point-dropped'],[DA5,'3,185','uk','wrong','dec-point-dropped'],
  // €4.35 + €2.80 = €7.15: a missing sign is not held against the value; another currency is unsure, never converted
  [DA6,'€7.15','uk','right'],[DA6,'7.15','uk','right'],[DA6,'7,15 €','de','right'],[DA6,'7.15 €','de','right'],[DA6,'7.15 euros','uk','right'],[DA6,'€ 7.15','uk','right'],
  [DA6,'7,15 €','uk','unsure'],[DA6,'£7.15','uk','unsure'],[DA6,'€7.2','uk','unsure'],[DA6,'715p','uk','unsure'],[DA6,'€715','uk','wrong','dec-point-dropped'],[DA6,'€7','uk','wrong'],
  // £3.45 × 4 = £13.80
  [DA7,'£13.80','uk','right'],[DA7,'13.8','uk','right'],[DA7,'£13.8','uk','right'],[DA7,'€13.80','uk','unsure'],
  [DA7,'£138','uk','wrong','dec-point-product'],[DA7,'£1.38','uk','wrong','dec-point-product'],[DA7,'1380','uk','wrong','dec-point-dropped'],[DA7,'£13.00','uk','wrong'],[DA7,'12.80','uk','wrong'],
  // 12.6 + 0.75 = 13.35
  [DA8,'13.35','uk','right'],[DA8,'13.4','uk','unsure'],[DA8,'13.3','uk','unsure'],[DA8,'2.01','uk','wrong','dec-lined-up'],[DA8,'1335','uk','wrong','dec-point-dropped'],
  // 0.7 × 0.3 = 0.21
  [DA9,'0.21','uk','right'],[DA9,'.21','us','right'],[DA9,'21/100','uk','right'],[DA9,'21%','uk','right'],[DA9,'0.2','uk','unsure'],[DA9,'0,21','uk','unsure'],
  [DA9,'2.1','uk','wrong','dec-point-product'],[DA9,'0.021','uk','wrong','dec-point-product'],[DA9,'21','uk','wrong','dec-point-dropped'],[DA9,'1.0','uk','wrong'],
 ],
 'dec-convert':[
  // 3/8 as a decimal = 0.375: the value in another form is unsure (the form asks for more), a rounding unsure
  [CV1,'0.375','uk','right'],[CV1,'.375','us','right'],[CV1,'0,375','cz','right'],[CV1,'0,375','de','right'],[CV1,'x = 0.375','uk','right'],
  [CV1,'3/8','uk','unsure'],[CV1,'37.5%','uk','unsure'],[CV1,'6/16','uk','unsure'],[CV1,'0.38','uk','unsure'],[CV1,'0.37','uk','unsure'],[CV1,'0.4','uk','unsure'],[CV1,'0,375','uk','unsure'],
  [CV1,'nought point three seven five','uk','unsure'],[CV1,'','uk','unsure'],[CV1,'0.375 kg','uk','unsure'],
  [CV1,'3.8','uk','wrong','conv-top-dot-bottom'],[CV1,'3.75','uk','wrong','conv-ten-times'],[CV1,'0.0375','uk','wrong','conv-ten-times'],[CV1,'2.667','uk','wrong','conv-flipped'],[CV1,'2.67','uk','wrong','conv-flipped'],
  [CV1,'0.365','uk','wrong'],[CV1,'0.5','uk','wrong'],[CV1,'-0.375','uk','wrong'],
  // 7/20 as a decimal = 0.35
  [CV2,'0.35','uk','right'],[CV2,'0.350','uk','right'],[CV2,'35%','uk','unsure'],[CV2,'0.3','uk','unsure'],[CV2,'0.4','uk','unsure'],
  [CV2,'7.2','uk','wrong','conv-top-dot-bottom'],[CV2,'7.20','uk','wrong','conv-top-dot-bottom'],[CV2,'3.5','uk','wrong','conv-ten-times'],[CV2,'2.86','uk','wrong','conv-flipped'],
  // 7/20 as a percentage = 35%: the percentage's number without its sign is unsure, never wrong
  [CV3,'35%','uk','right'],[CV3,'35 %','cz','right'],[CV3,'35 percent','uk','right'],[CV3,'35.0%','uk','right'],[CV3,'35','uk','unsure'],[CV3,'0.35','uk','unsure'],[CV3,'7/20','uk','unsure'],
  [CV3,'0.35%','uk','wrong','conv-not-scaled'],[CV3,'0,35 %','cz','wrong','conv-not-scaled'],[CV3,'0.0035%','uk','wrong','conv-wrong-way'],[CV3,'3.5%','uk','wrong','conv-ten-times'],[CV3,'350%','uk','wrong','conv-ten-times'],
  [CV3,'285.7%','uk','wrong','conv-flipped'],[CV3,'36%','uk','wrong'],[CV3,'34.5%','uk','wrong'],
  // 0.35 as a fraction in its simplest form = 7/20: an unreduced equal fraction is unsure
  [CV4,'7/20','uk','right'],[CV4,'7 / 20','uk','right'],[CV4,'35/100','uk','unsure'],[CV4,'14/40','uk','unsure'],[CV4,'0.35','uk','unsure'],[CV4,'35%','uk','unsure'],
  [CV4,'20/7','uk','wrong','conv-flipped'],[CV4,'2 6/7','uk','wrong','conv-flipped'],[CV4,'35/10','uk','wrong','conv-ten-times'],[CV4,'7/2','uk','wrong','conv-ten-times'],[CV4,'35/1000','uk','wrong','conv-ten-times'],
  [CV4,'3/5','uk','wrong'],[CV4,'7/100','uk','wrong'],
  // 0.6 as a percentage = 60%
  [CV5,'60%','uk','right'],[CV5,'60 %','de','right'],[CV5,'60','uk','unsure'],[CV5,'0.6','uk','unsure'],[CV5,'3/5','uk','unsure'],
  [CV5,'0.6%','uk','wrong','conv-not-scaled'],[CV5,'0,6 %','de','wrong','conv-not-scaled'],[CV5,'0.006%','uk','wrong','conv-wrong-way'],[CV5,'6%','uk','wrong','conv-ten-times'],[CV5,'600%','uk','wrong','conv-ten-times'],
  // 35% as a decimal = 0.35: the sign taken off unscaled is the slip here (the question asks for a decimal)
  [CV6,'0.35','uk','right'],[CV6,'0,35','de','right'],[CV6,'.35','uk','right'],[CV6,'7/20','uk','unsure'],[CV6,'35%','uk','unsure'],[CV6,'0.3','uk','unsure'],[CV6,'0,35','uk','unsure'],
  [CV6,'35','uk','wrong','conv-not-scaled'],[CV6,'3500','uk','wrong','conv-wrong-way'],[CV6,'3.5','uk','wrong','conv-ten-times'],[CV6,'0.035','uk','wrong','conv-ten-times'],
  // 35% as a fraction = 7/20
  [CV7,'7/20','uk','right'],[CV7,'35/100','uk','unsure'],[CV7,'0.35','uk','unsure'],
  [CV7,'20/7','uk','wrong','conv-flipped'],[CV7,'100/35','uk','wrong','conv-flipped'],[CV7,'35','uk','wrong','conv-not-scaled'],[CV7,'35/1','uk','wrong','conv-not-scaled'],[CV7,'7/2','uk','wrong','conv-ten-times'],
  // 12.5% as a fraction = 1/8
  [CV8,'1/8','uk','right'],[CV8,'12.5/100','uk','unsure'],[CV8,'125/1000','uk','unsure'],[CV8,'0.125','uk','unsure'],
  [CV8,'8','uk','wrong','conv-flipped'],[CV8,'8/1','uk','wrong','conv-flipped'],[CV8,'12.5','uk','wrong','conv-not-scaled'],[CV8,'25/2','uk','wrong','conv-not-scaled'],[CV8,'1/80','uk','wrong','conv-ten-times'],[CV8,'5/4','uk','wrong','conv-ten-times'],
  // 5/4 as a percentage = 125%
  [CV9,'125%','uk','right'],[CV9,'1.25','uk','unsure'],[CV9,'125','uk','unsure'],[CV9,'1 1/4','uk','unsure'],
  [CV9,'1.25%','uk','wrong','conv-not-scaled'],[CV9,'12.5%','uk','wrong','conv-ten-times'],[CV9,'1250%','uk','wrong','conv-ten-times'],[CV9,'80%','uk','wrong','conv-flipped'],[CV9,'0.0125%','uk','wrong','conv-wrong-way'],
 ],
 'pct-of-amount':[
  // 35% of 80 = 28: an amount with a percent sign is unsure (28%, and 2800% - equal in value, never right)
  [PO1,'28','uk','right'],[PO1,'28.0','uk','right'],[PO1,'28.00','us','right'],[PO1,'x = 28','uk','right'],[PO1,'28%','uk','unsure'],[PO1,'2800%','uk','unsure'],[PO1,'28 kg','uk','unsure'],
  [PO1,'twenty-eight','uk','unsure'],[PO1,'','uk','unsure'],[PO1,'28:1','uk','unsure'],
  [PO1,'2.29','uk','wrong','pct-divided'],[PO1,'2.286','uk','wrong','pct-divided'],[PO1,'228.57','uk','wrong','pct-divided'],[PO1,'16/7','uk','wrong','pct-divided'],[PO1,'2800','uk','wrong','pct-times-whole'],
  [PO1,'8','uk','wrong','pct-ten-stopped'],[PO1,'52','uk','wrong','pct-rest'],[PO1,'27','uk','wrong'],[PO1,'28.5','uk','wrong'],[PO1,'-28','uk','wrong'],[PO1,'0.28','uk','wrong'],[PO1,'45','uk','wrong'],
  // 15% of €60 = €9
  [PO2,'€9','uk','right'],[PO2,'9','uk','right'],[PO2,'9 €','de','right'],[PO2,'€9.00','uk','right'],[PO2,'9 euros','uk','right'],[PO2,'£9','uk','unsure'],[PO2,'9%','uk','unsure'],
  [PO2,'€4','uk','wrong','pct-divided'],[PO2,'400','uk','wrong','pct-divided'],[PO2,'€900','uk','wrong','pct-times-whole'],[PO2,'€6','uk','wrong','pct-ten-stopped'],[PO2,'€51','uk','wrong','pct-rest'],[PO2,'€10','uk','wrong'],[PO2,'€45','uk','wrong'],
  // 12.5% of 40 kg = 5 kg: another unit is unsure, never converted
  [PO3,'5 kg','uk','right'],[PO3,'5','uk','right'],[PO3,'5 kilograms','uk','right'],[PO3,'5,0 kg','cz','right'],[PO3,'5000 g','uk','unsure'],
  [PO3,'3.2 kg','uk','wrong','pct-divided'],[PO3,'320','uk','wrong','pct-divided'],[PO3,'500 kg','uk','wrong','pct-times-whole'],[PO3,'4 kg','uk','wrong','pct-ten-stopped'],[PO3,'35 kg','uk','wrong','pct-rest'],[PO3,'5.5','uk','wrong'],
  // 30% of 140 = 42
  [PO4,'42','uk','right'],[PO4,'42%','uk','unsure'],[PO4,'4.67','uk','wrong','pct-divided'],[PO4,'466.67','uk','wrong','pct-divided'],[PO4,'4200','uk','wrong','pct-times-whole'],[PO4,'14','uk','wrong','pct-ten-stopped'],[PO4,'98','uk','wrong','pct-rest'],[PO4,'43','uk','wrong'],
  // 75% of 60 = 45
  [PO5,'45','uk','right'],[PO5,'0.8','uk','wrong','pct-divided'],[PO5,'80','uk','wrong','pct-divided'],[PO5,'4500','uk','wrong','pct-times-whole'],[PO5,'6','uk','wrong','pct-ten-stopped'],[PO5,'15','uk','wrong','pct-rest'],[PO5,'44','uk','wrong'],
  // 54% of £130 = £70.20: a whole number is an exact claim (70 is wrong), a comma is a decimal only in cz and de
  [PO6,'£70.20','uk','right'],[PO6,'70.2','uk','right'],[PO6,'£70.2','uk','right'],[PO6,'70,2','cz','right'],[PO6,'70,2','uk','unsure'],[PO6,'70','uk','wrong'],[PO6,'70.3','uk','wrong'],
  [PO6,'£59.80','uk','wrong','pct-rest'],[PO6,'£13','uk','wrong','pct-ten-stopped'],[PO6,'7020','uk','wrong','pct-times-whole'],[PO6,'2.41','uk','wrong','pct-divided'],[PO6,'240.74','uk','wrong','pct-divided'],
  // 5% of 20 = 1: 100% (equal in value) is unsure, never right
  [PO7,'1','uk','right'],[PO7,'1.0','uk','right'],[PO7,'100%','uk','unsure'],[PO7,'4','uk','wrong','pct-divided'],[PO7,'400','uk','wrong','pct-divided'],[PO7,'100','uk','wrong','pct-times-whole'],
  [PO7,'2','uk','wrong','pct-ten-stopped'],[PO7,'19','uk','wrong','pct-rest'],[PO7,'0.05','uk','wrong'],[PO7,'1.5','uk','wrong'],
 ],
 'pct-change':[
  // 60 increased by 15% = 69: the new amount in any number form is right; an amount with a percent sign is unsure
  [PC1,'69','uk','right'],[PC1,'69.0','uk','right'],[PC1,'69.00','us','right'],[PC1,'x = 69','uk','right'],[PC1,'69%','uk','unsure'],[PC1,'6900%','uk','unsure'],[PC1,'69 kg','uk','unsure'],
  [PC1,'sixty-nine','uk','unsure'],[PC1,'','uk','unsure'],
  [PC1,'9','uk','wrong','change-only'],[PC1,'9.0','uk','wrong','change-only'],[PC1,'51','uk','wrong','change-wrong-way'],[PC1,'75','uk','wrong','change-as-number'],
  [PC1,'70','uk','wrong'],[PC1,'68','uk','wrong'],[PC1,'-69','uk','wrong'],[PC1,'0.69','uk','wrong'],[PC1,'15','uk','wrong'],
  // €80 decreased by 25% = €60
  [PC2,'€60','uk','right'],[PC2,'60','uk','right'],[PC2,'60 €','de','right'],[PC2,'€60.00','uk','right'],[PC2,'60 euros','uk','right'],[PC2,'£60','uk','unsure'],[PC2,'60%','uk','unsure'],
  [PC2,'€20','uk','wrong','change-only'],[PC2,'20','uk','wrong','change-only'],[PC2,'€100','uk','wrong','change-wrong-way'],[PC2,'100','uk','wrong','change-wrong-way'],[PC2,'€55','uk','wrong','change-as-number'],[PC2,'€61','uk','wrong'],
  // 240 increased by 12.5% = 270
  [PC3,'270','uk','right'],[PC3,'270.0','uk','right'],[PC3,'30','uk','wrong','change-only'],[PC3,'210','uk','wrong','change-wrong-way'],[PC3,'252.5','uk','wrong','change-as-number'],
  [PC3,'252,5','cz','wrong','change-as-number'],[PC3,'252,5','uk','unsure'],[PC3,'271','uk','wrong'],
  // 250 kg decreased by 12% = 220 kg: another unit is unsure, never converted
  [PC4,'220 kg','uk','right'],[PC4,'220','uk','right'],[PC4,'220000 g','uk','unsure'],[PC4,'220 m','uk','unsure'],
  [PC4,'30 kg','uk','wrong','change-only'],[PC4,'280 kg','uk','wrong','change-wrong-way'],[PC4,'238 kg','uk','wrong','change-as-number'],[PC4,'221 kg','uk','wrong'],
  // £50 increased by 35% = £67.50: a whole number is an exact claim (68 is wrong), another currency unsure
  [PC5,'£67.50','uk','right'],[PC5,'67.5','uk','right'],[PC5,'£67.5','uk','right'],[PC5,'67,5','cz','right'],[PC5,'67,50 €','cz','unsure'],
  [PC5,'£17.50','uk','wrong','change-only'],[PC5,'17.5','uk','wrong','change-only'],[PC5,'£32.50','uk','wrong','change-wrong-way'],[PC5,'£85','uk','wrong','change-as-number'],
  [PC5,'£67','uk','wrong'],[PC5,'£68','uk','wrong'],[PC5,'£67.6','uk','wrong'],
  // 140 decreased by 30% = 98
  [PC6,'98','uk','right'],[PC6,'98%','uk','unsure'],[PC6,'42','uk','wrong','change-only'],[PC6,'182','uk','wrong','change-wrong-way'],[PC6,'110','uk','wrong','change-as-number'],[PC6,'99','uk','wrong'],
  // 80 increased by 100% = 160
  [PC7,'160','uk','right'],[PC7,'160%','uk','unsure'],[PC7,'80','uk','wrong','change-only'],[PC7,'0','uk','wrong','change-wrong-way'],[PC7,'180','uk','wrong','change-as-number'],[PC7,'200%','uk','wrong'],
 ],
};
const B2_LEAKS={
 'dec-arith':[
  [DA1,'The answer is 7.15.'],[DA1,'You get seven point one five.'],[DA1,'4.35 + 2.8 = 7.15'],[DA1,'It comes to 7.150.'],[DA1,'715, then put the point back.'],[DA1,'About 7.2.'],
  [DA1,'In Czech notation that is 7,15.'],[DA1,'4.35 + 2.80 = 7.15'],[DA1,'That is 143/20.'],[DA1,'Seven and three twentieths.'],[DA1,'715 hundredths.'],
  [DA2,'It is 5.25.'],[DA2,'Five and a quarter.'],[DA2,'525 hundredths'],
  [DA4,'It is 1.44.'],[DA4,'36 × 4 = 144, then count the places.'],[DA4,'One point four four.'],[DA4,'The answer is 1,44.'],[DA4,'3.6 × 0.4 = 1.44'],[DA4,'Roughly 1.4.'],[DA4,'0.4 lots of 3.6 is 1.44'],
  [DA7,'It is £13.80.'],[DA7,'345 × 4 = 1380'],[DA7,'13.8'],[DA7,'Thirteen pounds eighty.'],[DA7,'£13 and 80p'],[DA7,'138, then put the point in.'],
  [DA9,'0.21'],[DA9,'7 × 3 = 21'],[DA9,'Twenty-one hundredths.'],
 ],
 'dec-convert':[
  [CV1,'It is 0.375.'],[CV1,'3 ÷ 8 = 0.375'],[CV1,'It is 375 thousandths.'],[CV1,'About 0.38'],[CV1,'That is 37.5%.'],[CV1,'Nought point three seven five.'],[CV1,'The digits are 375.'],
  [CV1,'In Czech that is 0,375.'],[CV1,'3/8 = 375/1000'],
  [CV3,'It is 35%.'],[CV3,'35'],[CV3,'thirty-five percent'],[CV3,'7/20 = 35/100'],[CV3,'7 × 5 = 35'],[CV3,'That is 0.35.'],[CV3,'thirty-five hundredths'],[cv('3/8','percent'),'The number is 37.5.'],
  [CV4,'It is 7/20.'],[CV4,'seven twentieths'],[CV4,'The bottom is 20.'],[CV4,'The top is 7 and the bottom is 20.'],[CV4,'35 ÷ 5 = 7'],[CV4,'7:20'],
  [CV6,'It is 0.35.'],[CV6,'Thirty-five hundredths.'],[CV6,'35 ÷ 100 = 0.35'],[CV6,'0,35'],
  [CV5,'That is 60%.'],[CV5,'sixty percent'],[CV5,'60'],
 ],
 'pct-of-amount':[
  [PO1,'The answer is 28.'],[PO1,'twenty-eight'],[PO1,'8 × 3.5'],[PO1,'35 × 80 = 2800'],[PO1,'80 ÷ 100 × 35'],[PO1,'24 + 4'],[PO1,'It comes to 28.0.'],
  [PO1,'Thirty percent is 24 and five percent is 4, so 28.'],[PO1,'35 lots of 0.8'],[PO1,'0.8 × 35'],
  [PO2,'It is €9.'],[PO2,'nine euros'],[PO2,'6 + 3 = 9'],[PO2,'0.15 × 60 = 9'],
  [PO6,'£70.20'],[PO6,'seventy pounds twenty'],[PO6,'It is about 70.2.'],[PO6,'1.3 × 54'],
  [PO3,'5 kg'],[PO3,'40 ÷ 8'],[PO3,'Five kilograms.'],
 ],
 'pct-change':[
  [PC1,'The new amount is 69.'],[PC1,'sixty-nine'],[PC1,'60 + 9'],[PC1,'60 + 9 = 69'],[PC1,'60 ÷ 100 × 115'],[PC1,'60 × 115 = 6900'],[PC1,'It comes to 69.0.'],[PC1,'Add 9 to 60 to get 69.'],
  [PC2,'It is €60.'],[PC2,'80 - 20 = 60'],[PC2,'sixty euros'],[PC2,'0.75 × 80 = 60'],[PC2,'80 take away 20'],
  [PC5,'£67.50'],[PC5,'sixty-seven pounds fifty'],[PC5,'50 + 17.5'],[PC5,'1.35 × 50 = 67.5'],
  [PC4,'220 kg'],[PC4,'250 - 30'],
 ],
};
const B2_LEGIT={
 'dec-arith':[
  [DA1,'Line up the decimal points.'],[DA1,'Write 2.8 as 2.80 so both have two places.'],[DA1,'Add the hundredths first.'],[DA1,'Estimate first: about 4 + 3.'],[DA1,'The answer is a bit more than 7.'],
  [DA1,'Now work out 4.35 + 2.80.'],[DA1,'2.8 is the same as 2.80.'],[DA1,'0.35 + 0.8 = 1.15, so carry the 1.'],[DA1,'4 + 2 = 6 for the whole numbers.'],[DA1,'Put a zero after the 8.'],
  [DA4,'Ignore the points and multiply.'],[DA4,'Count the digits after the points: there are two.'],[DA4,'The answer will be less than 3.6.'],[DA4,'0.4 is less than 1, so the answer is smaller than 3.6.'],[DA4,'Think of 0.4 as 4 tenths.'],
  [DA4,'Now work out 3.6 × 0.4.'],[DA7,'Multiply the pounds and the pence separately.'],[DA7,'£3 × 4 = £12.'],[DA7,'45p × 4 is 180p.'],[DA7,'Keep the £ sign in your answer.'],[DA7,'Your answer should be in pounds and pence.'],
  [DA3,'Write 2.3 as 2.30 before you subtract.'],[DA3,'Take away the hundredths first.'],[DA3,'Check by adding your answer to 2.3.'],[DA9,'There are two digits after the points in the question.'],
 ],
 'dec-convert':[
  [CV1,'Divide 3 by 8.'],[CV1,'3/8 is 3 ÷ 8.'],[CV1,'Use short division: 8 into 3.000.'],[CV1,'3/8 is the same as 6/16.'],[CV1,'Think of 1/8 first.'],[CV1,'Half of a quarter is an eighth.'],
  [CV1,'Your answer is less than a half.'],[CV1,'Now work out 3 ÷ 8.'],
  [CV3,'Write 7/20 with a bottom of 100.'],[CV3,'What do you multiply 20 by to make 100?'],[CV3,'Multiply the top and the bottom by the same number.'],[CV3,'A percentage is a number of hundredths.'],
  [CV3,'Now work out 7 ÷ 20.'],
  [CV4,'Write 0.35 as hundredths first.'],[CV4,'0.35 is 35 hundredths.'],[CV4,'Simplify 35/100.'],[CV4,'Divide the top and the bottom by 5.'],[CV4,'35 and 100 are both in the five times table.'],
  [CV6,'Divide 35 by 100.'],[CV6,'Move the point two places to the left.'],[CV6,'A percentage is out of a hundred.'],
  [CV5,'Multiply 0.6 by 100.'],[CV5,'How many hundredths make 0.6?'],[CV7,'Write 35% as a fraction over 100 first.'],[CV7,'35% is 0.35.'],[CV7,'Then simplify.'],
 ],
 'pct-of-amount':[
  [PO1,'Find 10% first.'],[PO1,'10% of 80 is 8.'],[PO1,'5% is half of 10%.'],[PO1,'30% is three lots of 10%.'],[PO1,'Now work out 35% of 80.'],[PO1,'Write 35% as 0.35 and multiply by 80.'],
  [PO1,'0.35 × 80'],[PO1,'Find 1% of 80 by dividing by 100.'],[PO1,'Your answer should be less than 40, since 35% is less than half.'],[PO1,'Split 35% into 30% and 5%.'],[PO1,'A percentage means out of a hundred.'],
  [PO2,'10% of €60 is €6.'],[PO2,'5% is half of that.'],[PO2,'Keep the euro sign in your answer.'],[PO2,'Find 10% and 5%, then add them.'],
  [PO3,'12.5% is an eighth.'],[PO3,'Find a quarter first, then halve it.'],[PO3,'Your answer is in kilograms.'],
  [PO6,'Find 50% and 4% of £130.'],[PO6,'1% of £130 is £1.30.'],[PO6,'Your answer will be a bit more than half of £130.'],
 ],
 'pct-change':[
  [PC1,'Find 15% of 60 first.'],[PC1,'15% of 60 is 9.'],[PC1,'10% of 60 is 6, and 5% is half of that.'],[PC1,'Then add the change on to 60.'],[PC1,'Multiply 60 by 1.15.'],
  [PC1,'An increase makes the amount bigger.'],[PC1,'Now work out 60 × 1.15.'],[PC1,'115% of 60 is the same thing.'],
  [PC2,'Take 25% off 80.'],[PC2,'25% is a quarter.'],[PC2,'A quarter of 80 is 20.'],[PC2,'Then take that away from €80.'],[PC2,'Multiply 80 by 0.75.'],[PC2,'Your answer is less than €80.'],
  [PC4,'Find 10% and 2% of 250 kg.'],[PC4,'12% of 250 is 30.'],[PC4,'Keep the kg in your answer.'],[PC4,'Take the change off, because it is a decrease.'],
  [PC5,'35% of £50 is £17.50.'],[PC5,'Then add it to £50.'],
 ],
};
/**
 * B2 CONFLICTS: legit hints the strict rule refuses, accepted and reported. A decimal's answer written without its point
 * is the answer (rule 4 for decimals: "715, then put the point back"), so the whole-number working that gives exactly
 * those digits is refused too, even as a first move ("multiply 36 by 4" makes 144, the digits of 1.44).
 */
const B2_CONFLICTS=[
 [DA4,'Multiply 36 by 4 first.'],[DA9,'7 × 3 is a times-table fact.'],
 // a conversion to a decimal or a percentage refuses a fraction over 10, 100 or 1000: it is the answer spelled as hundredths
 [CV6,'35% means 35 out of 100.'],[CV5,'0.6 is six tenths.'],
 // a percent of an amount refuses the percent times the amount as whole numbers: 2800 is 28 with the point left out
 [PO1,'Multiply 35 by 80, then divide by 100.'],
 // a percent change refuses the amount times (100 ± p) as whole numbers: 6900 is 69 with the point left out
 [PC1,'Work out 60 × 115, then divide by 100.'],
];

/** The references: each unit's answer by hand in whole hundredths or thousandths, never the module's evaluator. */
const decUnits=(s)=>{const [w,f='']=s.split('.');return {n:Number(w+f),p:f.length};};
const B2REF={
 'dec-arith':(s)=>{
  const m=/^(\d+(?:\.\d+)?) ([-+×]) (\d+(?:\.\d+)?)$/.exec(s.expr);if(!m||s.shape!=='compute')return null;
  const a=decUnits(m[1]),b=decUnits(m[3]),op=m[2];
  let n,p;if(op==='×'){n=a.n*b.n;p=a.p+b.p;}else{p=Math.max(a.p,b.p);const x=a.n*10**(p-a.p),y=b.n*10**(p-b.p);n=op==='+'?x+y:x-y;}
  const text=(n/10**p).toFixed(p);return {a:m[1],b:m[3],op,pa:a.p,pb:b.p,n,p,truth:text,nums:[m[1],m[3]]};
 },
 'dec-convert':(s)=>{
  if(s.shape!=='convert')return null;
  let n,d,from,places=0;const f=/^(\d+)\/(\d+)$/.exec(s.expr),dm=/^(\d+)\.(\d+)$/.exec(s.expr),pm=/^(\d+)(?:\.(\d))?%$/.exec(s.expr);
  if(f){[n,d]=[+f[1],+f[2]];from='fraction';}
  else if(dm){n=Number(dm[1]+dm[2]);d=10**dm[2].length;from='decimal';places=dm[2].length;}
  else if(pm){const fr=pm[2]??'';n=Number(pm[1]+fr);d=100*10**fr.length;from='percent';places=fr.length;}
  else return null;
  const g=refGcd(n,d);n/=g;d/=g;
  /** n/d written as a decimal by hand: the fewest places that make it exact. */
  const dec=(a,b)=>{let k=0;while((a*10**k)%b!==0)k++;const u=String(a*10**k/b).padStart(k+1,'0');return k?`${u.slice(0,-k)}.${u.slice(-k)}`:u;};
  const truth=s.to==='decimal'?dec(n,d):s.to==='percent'?`${dec(100*n,d)}%`:`${n}/${d}`;
  const off=s.to==='decimal'?dec(n+d,d):s.to==='percent'?`${dec(100*(n+d),d)}%`:`${n+d}/${d}`;
  return {n,d,from,to:s.to,places,truth,off};
 },
 'pct-of-amount':(s)=>{
  const m=/^(\d+(?:\.5)?)% of (\d+)$/.exec(s.expr);if(!m||s.shape!=='percent-of')return null;
  const tenths=Math.round(Number(m[1])*10),N=Number(m[2]);
  // p% of N in hundredths: p × N, or (tenths of a percent) × N ÷ 10
  const h=tenths*N/10;assert.ok(Number.isInteger(h),`${s.expr}: at most two places`);
  const fmt=(x)=>{const t=(x/100).toFixed(2);return t.replace(/\.?0+$/,'');};
  return {p:Number(m[1]),half:/\.5$/.test(m[1]),N,truth:fmt(h),off:fmt(h+100)};
 },
 'pct-change':(s)=>{
  const m=/^(increase|decrease) (\d+) by (\d+(?:\.5)?)%$/.exec(s.expr);if(!m||s.shape!=='percent-change')return null;
  const up=m[1]==='increase',B=Number(m[2]),tenths=Math.round(Number(m[3])*10);
  // the new amount in hundredths: B × (1000 ± p in tenths) ÷ 10
  const h=B*(up?1000+tenths:1000-tenths)/10;assert.ok(Number.isInteger(h),`${s.expr}: at most two places`);
  const fmt=(x)=>{const t=(x/100).toFixed(2);return t.replace(/\.?0+$/,'');};
  return {up,B,p:Number(m[3]),half:/\.5$/.test(m[3]),truth:fmt(h),off:fmt(h+100)};
 },
};
const B2GEN={'dec-arith':S.genDecimal,'dec-convert':S.genConvert,'pct-of-amount':S.genPercentOf,'pct-change':S.genPercentChange};
/** Each unit's tier, as school.ts documents it, asserted on the reference reading. */
const B2_TIER={
 'dec-arith':(s,r,tier)=>{
  const money=s.unit!==undefined;
  if(money)assert.ok(['€','£'].includes(s.unit),`money in euros or pounds: ${s.unit}`);
  if(tier===1){assert.ok(r.op==='+'||r.op==='-',`tier 1 adds or subtracts: ${s.expr}`);if(money)assert.ok(r.pa===2&&r.pb===2,'money to the penny');else assert.ok(r.pa>=1&&r.pa<=2&&r.pb>=1&&r.pb<=2&&!/0$/.test(r.a)&&!/0$/.test(r.b),s.expr);}
  else if(money){assert.equal(r.op,'×');assert.ok(r.pa===2&&r.pb===0&&+r.b>=3&&+r.b<=9,`money times a count 3..9: ${s.expr}`);}
  else{assert.equal(r.op,'×');assert.ok(r.pb===1&&(r.pa===1||r.pa===2)&&+r.a<=19.9&&+r.b<=4.9,`a decimal by a one-place decimal: ${s.expr}`);}
  assert.ok(Number(r.truth)>0&&!Number.isInteger(Number(r.truth)),`a decimal answer: ${s.expr} = ${r.truth}`);
 },
 'dec-convert':(s,r,tier)=>{
  assert.notEqual(r.from,r.to,'another form than the one given');assert.ok(r.d>1,'never a whole number');
  let d=r.d;while(d%2===0)d/=2;while(d%5===0)d/=5;assert.equal(d,1,`terminating: ${s.expr}`);
  if(r.from==='fraction')assert.equal(s.expr,`${r.n}/${r.d}`,'a fraction given in lowest terms');
  if(r.from==='decimal')assert.ok(r.places<=3&&!/0$/.test(s.expr),s.expr);
  if(r.from==='percent')assert.ok(r.places<=1&&!/\.0%$/.test(s.expr),s.expr);
  if(tier===1)assert.ok(100%r.d===0&&r.n<r.d,`tier 1: a bottom that goes into a hundred, below one: ${s.expr}`);
  else assert.ok(([8,16,40,80].includes(r.d)&&r.n<r.d)||(r.n>r.d&&r.n<3*r.d&&[2,4,5,8,10,20].includes(r.d)),`tier 2: eighths to eightieths, or between 1 and 3: ${s.expr}`);
 },
 'pct-of-amount':(s,r,tier)=>{
  const FRIENDLY=[5,10,20,25,30,40,50,60,70,75,80,90];
  if(tier===1){assert.ok(FRIENDLY.includes(r.p)&&r.N%20===0&&r.N<=400&&s.unit===undefined,`tier 1: a friendly percent of a multiple of 20, no unit: ${s.expr}`);assert.ok(Number.isInteger(Number(r.truth)),'a whole answer');}
  else{assert.ok(r.half?r.p<40&&r.N%20===0:!FRIENDLY.includes(r.p)&&r.p<100&&r.N%10===0,`tier 2: ${s.expr}`);assert.ok(r.N<=500&&s.unit!==undefined,`tier 2 carries a unit: ${JSON.stringify(s)}`);assert.ok(!/\.\d\d/.test(r.truth),'at most one place');}
  assert.notEqual(Number(r.truth),r.N);assert.notEqual(Number(r.truth),r.p);
 },
 'pct-change':(s,r,tier)=>{
  const FRIENDLY=[5,10,20,25,30,40,50,60,70,75,80,90];
  if(tier===1){assert.ok(FRIENDLY.includes(r.p)&&r.B%20===0&&r.B<=400&&s.unit===undefined,`tier 1: a friendly percent of a multiple of 20, no unit: ${s.expr}`);assert.ok(Number.isInteger(Number(r.truth)),'a whole answer');}
  else{assert.ok(r.half?r.p<20&&r.B%20===0:!FRIENDLY.includes(r.p)&&r.p<=60&&r.B%10===0,`tier 2: ${s.expr}`);assert.ok(r.B<=500&&s.unit!==undefined,`tier 2 carries a unit: ${JSON.stringify(s)}`);assert.ok(!/\.\d\d/.test(r.truth),'at most one place');}
  assert.ok(Number(r.truth)>0);assert.notEqual(Number(r.truth),r.B);assert.notEqual(Number(r.truth),r.p);
 },
};

for (const unit of B2_UNITS){
 test(`W7b SPELLINGS ${unit}: ${B2_SPELLINGS[unit].length} written answers, zero false-right, zero false-wrong`,()=>{spellings(`B2_SPELLINGS ${unit}`,B2_SPELLINGS[unit],unit);});
 test(`W7b LEAKS ${unit}: ${B2_LEAKS[unit].length} hints that give the answer away are refused; ${B2_LEGIT[unit].length} legit hints pass`,()=>{
  const leaks=B2_LEAKS[unit],legit=B2_LEGIT[unit];
  const missed=leaks.filter(([s,h])=>!S.leaksSchool(s,h)).map(([s,h])=>`${JSON.stringify(s)} | ${h}`);
  const flagged=legit.filter(([s,h])=>S.leaksSchool(s,h)).map(([s,h])=>`${JSON.stringify(s)} | ${h}`);
  const specs=new Set([...leaks,...legit].map(([s])=>JSON.stringify(s)));
  console.log(`# W7b LEAKS ${unit}: ${leaks.length} (missed ${missed.length}), LEGIT ${legit.length} (flagged ${flagged.length}), specs ${specs.size}`);
  assert.deepEqual(missed,[],'every leaking hint is caught');
  assert.deepEqual(flagged,[],'no legit hint is flagged');
  assert.ok(leaks.length>=15&&legit.length>=20&&specs.size>=3);
  for (const [s] of [...leaks,...legit]) assert.equal(S.unitOf(s),unit,`${JSON.stringify(s)} is a ${unit} spec`);
 });
 test(`W7b GENERATOR ${unit}: seeds 1..200 for tiers 1 and 2 give well-formed, distinct items of the documented tier, judged right by a reference`,()=>{
  const g=B2GEN[unit],ref=B2REF[unit],counts={};
  assert.equal(S.SCHOOL_GENERATORS[unit],S.generatorFor(unit));
  for (const tier of [1,2]){
   const seen=new Set();
   for (let seed=1;seed<=200;seed++){
    const s=g(seed,tier);
    assert.ok(s,`seed ${seed} tier ${tier}`);assert.deepEqual(g(seed,tier),s,'same seed, same spec');
    assert.deepEqual(S.generatorFor(unit)(seed,tier),s,'the registered generator is this one');
    assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));assert.equal(S.unitOf(s),unit);
    const r=ref(s);assert.ok(r,`the reference reads ${JSON.stringify(s)}`);
    B2_TIER[unit](s,r,tier);
    const q=S.question(s).plain;
    const off=r.off??((r.n+10**r.p)/10**r.p).toFixed(r.p);
    for (const sys of ['uk','us']){
     assert.equal(S.check(s,r.truth,sys).verdict,'right',`${q} = ${r.truth} (${sys})`);
     assert.equal(S.check(s,off,sys).verdict,'wrong',`${q} != ${off}`);
    }
    for (const sys of ['cz','de']) assert.equal(S.check(s,r.truth.replace('.',','),sys).verdict,'right',`${q} = ${r.truth} with a decimal comma (${sys})`);
    assert.ok(S.leaksSchool(s,`The answer is ${r.truth}.`),`the answer leaks: ${q}`);
    assert.ok(!S.leaksSchool(s,q),`the question does not: ${q}`);
    assert.ok(!S.leaksSchool(s,S.withheldSchool(s)),'the withheld line leaks nothing');
    assert.deepEqual(S.specFromQuestion(q),s,`${q} reads back to its spec`);
    seen.add(JSON.stringify(s));
   }
   counts[tier]=seen.size;
  }
  console.log(`# W7b GENERATOR ${unit} distinct specs over seeds 1..200: tier 1 ${counts[1]}, tier 2 ${counts[2]}`);
  assert.ok(counts[1]>=100&&counts[2]>=100,'seeds spread');
  for (const bad of [-1,1.5,NaN,'1',null,undefined,2**32]) assert.equal(g(bad,1),null);
  for (const bad of [0,3,'1',null,1.5]) assert.equal(g(1,bad),null);
 });
}
test('W7b CONFLICTS: the strict leak rule refuses these legit hints, and that cost is accepted and reported',()=>{
 for (const [s,h] of B2_CONFLICTS) assert.equal(S.leaksSchool(s,h),true,`${JSON.stringify(s)} | ${h}`);
 console.log(`# W7b accepted conflicts ${B2_CONFLICTS.length}`);
});

test('W7b question: each new item prints plain text and TeX, never its answer, keeps every number through the typesetter, and reads back to its spec',()=>{
 const P=[
  [DA1,'Work out 4.35 + 2.8.'],[DA4,'Work out 3.6 × 0.4.'],[DA6,'Work out €4.35 + €2.80.'],[DA7,'Work out £3.45 × 4.'],[DA2,'Work out 7.5 - 2.25.'],
  // a dollar is never printed as '$' (TeX's delimiter): a money sum in dollars names its unit after it
  [cs('4.35 + 2.80',{unit:'$'}),'Work out 4.35 + 2.80. Give your answer in dollars.'],
  [CV1,'Write 3/8 as a decimal.'],[CV3,'Write 7/20 as a percentage.'],[CV4,'Write 0.35 as a simplified fraction.'],[CV6,'Write 35% as a decimal.'],[CV8,'Write 12.5% as a simplified fraction.'],
  [PO1,'Find 35% of 80.'],[PO2,'Find 15% of €60.'],[PO3,'Find 12.5% of 40 kg.'],[po('20% of 60','$'),'Find 20% of 60 dollars.'],[po('25% of 80','m'),'Find 25% of 80 metres.'],
  [PC1,'Increase 60 by 15%.'],[PC2,'Decrease €80 by 25%.'],[PC3,'Increase 240 by 12.5%.'],[PC4,'Decrease 250 kg by 12%.'],[pc('increase 60 by 15%','$'),'Increase 60 dollars by 15%.'],
 ];
 for (const [s,plain] of P){
  const q=S.question(s);
  assert.equal(q.plain,plain);assert.ok(!S.leaksSchool(s,q.plain),`the question itself is not a leak: ${q.plain}`);
  for (const line of [q.plain,q.tex]){
   let fr=0;T.walk(T.parseMath(line),(x)=>{if(x.t==='frac')fr++;});
   assert.equal(fr,/\//.test(s.expr)?1:0,`${line}: a given fraction is stacked, nothing else`);
   const flat=T.flatten(T.parseMath(line));
   if (/%/.test(s.expr)) assert.ok(flat.includes(/[\d.]+%/.exec(s.expr)[0]),`${line} keeps ${s.expr}: ${flat}`);
   for (const d of s.expr.match(/\d+(?:\.\d+)?/g)) assert.ok(flat.includes(d),`${line} keeps ${d}: ${flat}`);
   if (s.shape==='compute'&&(s.unit==='€'||s.unit==='£')) assert.equal(flat.split(s.unit).length-1,s.expr.includes('×')?1:2,`${line}: the sign before each amount`);
   if (s.unit&&s.shape!=='compute') assert.match(flat,/[€£]|kg|metres|dollars/,`${line}: the unit is kept`);
  }
 }
 assert.deepEqual(S.specFromQuestion('Work out €4.35 + €2.80.'),DA6);assert.deepEqual(S.specFromQuestion('Work out £3.45 × 4.'),DA7);
 for (const s of [CV1,CV3,CV4,CV6,CV8,PO1,PO2,PO3,PC1,PC2,PC3,PC4]) assert.deepEqual(S.specFromQuestion(S.question(s).plain),s);
 assert.equal(S.question(cs('4.35 + 2.80',{unit:'€',form:'decimal'})).plain,'Work out 4.35 + 2.80. Give your answer as a decimal.','a form asked keeps the old wording');
});

test('W7b wellFormed: each batch-2 shape reads only its one printed spelling and refuses what makes a poor question; `to` belongs to a conversion alone',()=>{
 for (const s of [CV1,CV2,CV3,CV4,CV5,CV6,CV7,CV8,CV9]) assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));
 const bad=[
  [cv('1/3','decimal'),'no exact decimal'],[cv('2/3','percent'),'no exact decimal'],[cv('0.35','decimal'),'already in the form'],[cv('35%','percent'),'already in the form'],[cv('3/8','fraction'),'already in the form'],
  [cv('6/8','decimal'),'simplest form'],[cv('0.50','fraction'),'does not end in a zero'],[cv('12.0%','decimal'),'does not end in a zero'],[cv('100%','decimal'),'whole number'],[cv('3/1','decimal'),'bottom is 1'],
  [cv('3/8','ratio'),'form is not'],[cv('3/8'),'form is not'],[cv('0,35','fraction'),'cannot read'],[cv('12.25%','fraction'),'cannot read'],[cv('0.3535','fraction'),'cannot read'],[cv('x/8','decimal'),'cannot read'],
  [cv('35/2','decimal'),'larger'],[{...CV1,unit:'kg'},'does not take'],[{...CV1,form:'decimal'},'does not take'],[{...CV1,answer:'0.375'},'no answer field'],
  [cs('3/4 + 1/6',{to:'decimal'}),'does not take'],[{shape:'missing',expr:'3/4 = ?/12',to:'decimal'},'does not take'],
  // a percent of an amount: above nothing and below the whole, a whole amount to 1000, an answer to two places that the question does not print
  [po('100% of 80'),'above nothing'],[po('0% of 80'),'above nothing'],[po('150% of 80'),'above nothing'],[po('35% of 0'),'cannot read'],[po('35% of 2000'),'larger'],
  [po('12.5% of 7'),'two decimal places'],[po('20% of 100'),'print its own answer'],[po('12.0% of 80'),'does not end in a zero'],[po('35.25% of 80'),'cannot read'],[po('35 % of 80'),'cannot read'],
  [{...PO1,to:'decimal'},'does not take'],[{...PO1,form:'decimal'},'does not take'],[po('35% of 80','inch'),'unit is not'],[{...PO1,answer:28},'no answer field'],
 ];
 for (const s of [PO1,PO2,PO3,PO4,PO5,PO6,PO7,PC1,PC2,PC3,PC4,PC5,PC6,PC7]) assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));
 // a percent change: up by at most the whole, down by less than it, never a reverse percentage (it has no spelling here)
 const badChange=[
  [pc('decrease 80 by 100%'),'less than the whole'],[pc('increase 80 by 150%'),'at most the whole'],[pc('increase 80 by 0%'),'above nothing'],[pc('increase 2000 by 10%'),'larger'],
  [pc('increase 7 by 12.5%'),'two decimal places'],[pc('decrease 100 by 50%'),'print its own answer'],[pc('increase 60 by 15.0%'),'does not end in a zero'],[pc('increase 60 by 15'),'cannot read'],
  [pc('Increase 60 by 15%'),'cannot read'],[pc('raise 60 by 15%'),'cannot read'],[pc('increase 60.5 by 15%'),'cannot read'],[pc('69 after increase by 15%'),'cannot read'],
  [{...PC1,to:'decimal'},'does not take'],[pc('increase 60 by 15%','inch'),'unit is not'],[{...PC1,answer:69},'no answer field'],
 ];
 for (const [s,why] of badChange){const w=S.wellFormed(s);assert.equal(w.ok,false,JSON.stringify(s));assert.ok(w.why.includes(why),`${JSON.stringify(s)}: ${w.why}`);}
 for (const [s,why] of bad){const w=S.wellFormed(s);assert.equal(w.ok,false,JSON.stringify(s));assert.ok(w.why.includes(why),`${JSON.stringify(s)}: ${w.why}`);}
});

test('W7b PURITY: random strings through check and leaksSchool on every batch-2 spec never throw and give the same answer twice',()=>{
 let seed=4242;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const alphabet=['0','1','3','5','7','.',',',' ','%','/','-','€','£','$','x','×','÷','=','of','by','point','hundredths','percent',' and ','p','kg'];
 const specs=[DA1,DA6,DA7,CV1,CV3,CV4,CV6,PO1,PO2,PO6,PC1,PC2,PC5];
 for (let i=0;i<300;i++){
  let s='';const len=Math.floor(rnd()*20);for(let k=0;k<len;k++)s+=alphabet[Math.floor(rnd()*alphabet.length)];
  for (const sp of specs){
   for (const sys of S.SCHOOL_SYSTEMS){const v=S.check(sp,s,sys);assert.ok(['right','wrong','unsure'].includes(v.verdict));assert.deepEqual(S.check(sp,s,sys),v);}
   const l=S.leaksSchool(sp,s);assert.equal(typeof l,'boolean');assert.equal(S.leaksSchool(sp,s),l);
  }
  const got=S.specFromQuestion(s);assert.ok(got===null||S.wellFormed(got).ok);
 }
});
