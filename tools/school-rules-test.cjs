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
test(`W7 SPELLINGS equivalent fractions: ${EQ_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('EQ_SPELLINGS equivalent fractions',EQ_SPELLINGS,'frac-equivalent'));});
test(`W7 SPELLINGS a fraction of an amount: ${OF_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('OF_SPELLINGS a fraction of an amount',OF_SPELLINGS,'frac-of-amount'));});
test(`W7 SPELLINGS multiply and divide fractions: ${MD_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('MD_SPELLINGS multiply and divide fractions',MD_SPELLINGS,'frac-mul-div'));});
test('W7 SLIPS: every slip on the closed list belongs to exactly one unit, carries no value, and every unit\'s list is detected',()=>{
 const units=Object.keys(S.SCHOOL_UNIT_SLIPS);
 assert.deepEqual(units.sort(),['frac-add-sub','frac-equivalent','frac-mul-div','frac-of-amount']);
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
