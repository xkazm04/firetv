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
/** The W7 batch 3 units, after them (ratio, rates, area, mean and range). */
const B3_UNITS=['ratio-share','unit-rate','area','mean-range'];
/** The v2 M2b units beyond the school path (tables at the end of this file). */
const M2B_UNITS=['pythagoras'];
test(`W7 SPELLINGS equivalent fractions: ${EQ_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('EQ_SPELLINGS equivalent fractions',EQ_SPELLINGS,'frac-equivalent'));});
test(`W7 SPELLINGS a fraction of an amount: ${OF_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('OF_SPELLINGS a fraction of an amount',OF_SPELLINGS,'frac-of-amount'));});
test(`W7 SPELLINGS multiply and divide fractions: ${MD_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{Object.assign(W7_SLIPS,spellings('MD_SPELLINGS multiply and divide fractions',MD_SPELLINGS,'frac-mul-div'));});
test('W7 SLIPS: every slip on the closed list belongs to exactly one unit, carries no value, and every unit\'s list is detected',()=>{
 const units=Object.keys(S.SCHOOL_UNIT_SLIPS);
 // W7 batch 2 adds the decimals and percent units, batch 3 the last four, each with its own closed list (tables at the end of this file)
 assert.deepEqual(units.sort(),['frac-add-sub','frac-equivalent','frac-mul-div','frac-of-amount',...B2_UNITS,...B3_UNITS,...M2B_UNITS].sort());
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
  // 10% of 60 = 6: 600 is both 10 × 60 and 60 ÷ 0.1 - named the whole-number slip (found by the live capture); 60 ÷ 10 is the answer itself
  [po('10% of 60'),'6','uk','right'],[po('10% of 60'),'600','uk','wrong','pct-times-whole'],[po('10% of 60'),'54','uk','wrong','pct-rest'],
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

// ================================================================== Family W7 batch 3: ratio, rates, area, mean and range
// Each unit's own shape. As before, every expected verdict below was worked by hand from the mathematics first (the value
// and each slip's value are in the comments), then run. The gates are the batch-1 gates: zero false-right, zero
// false-wrong, every slip of the unit detected at least twice, every leak refused, no legit hint refused (the conflicts
// the strict rule accepts are listed apart).

// ------------------------------------------------------------------ ratio and sharing
const ra=(expr,unit)=>({shape:'ratio',expr,...(unit?{unit}:{})});
const RS1=ra('12:18');            // 2:3. the other way round 3:2
const RS2=ra('15:25');            // 3:5. the other way round 5:3
const RS3=ra('8:20');             // 2:5. the other way round 5:2
const RS4=ra('14:35');            // 2:5 (the common factor 7)
const RH1=ra('60 in 2:3');        // 5 parts of 12: 24 and 36. each 60/2, 60/3 = 30, 20; the ratio's numbers 2, 3; by the difference 60/1 = 60 a part: 120, 180
const RH2=ra('45 in 4:5','€');    // 9 parts of 5: €20 and €25. each 45/4 = 11.25, 45/5 = 9; numbers 4, 5; by the difference 45/1: 180, 225
const RH3=ra('70 in 2:5','kg');   // 7 parts of 10: 20 kg and 50 kg. each 35, 14; numbers 2, 5; by the difference 70/3 = 23.33..: 46.67, 116.67
const RM1=ra('2:3 = ?:15');       // 2 × 15 / 3 = 10. added the difference 2 + (15 - 3) = 14; the other way 3 × 15 / 2 = 22.5 (not whole: none)
const RM2=ra('4:5 = 12:?');       // 5 × 12 / 4 = 15. added the difference 5 + (12 - 4) = 13; the other way 4 × 12 / 5 = 9.6 (none)
const RM3=ra('3:6 = ?:18');       // 3 × 18 / 6 = 9. added the difference 3 + (18 - 6) = 15; the other way 6 × 18 / 3 = 36
const RM4=ra('2:5 = 8:?');        // 5 × 8 / 2 = 20. added the difference 5 + (8 - 2) = 11; the other way 2 × 8 / 5 = 3.2 (none)

// ------------------------------------------------------------------ unit rates and direct proportion
const rt=(expr,unit)=>({shape:'rate',expr,unit});
const RC1=rt('5 pens cost 3.50, 8','€');    // 70c a pen: €5.60. wrong way 5 ÷ 3.50 × 8 = 80/7 (11.43); multiplied 3.50 × 5 × 8 = 140; by the number asked 3.50 ÷ 8 × 5 = 2.1875
const RC2=rt('12 kg cost 30, 1','€');       // €2.50 a kg. wrong way 12 ÷ 30 = 0.4; multiplied 30 × 12 = 360 (by the number asked is the same: not pushed)
const RC3=rt('4 books cost 18, 7','£');     // £4.50 a book: £31.50. wrong way 4 ÷ 18 × 7 = 14/9 (1.56); multiplied 504; by the number asked 18 ÷ 7 × 4 = 72/7 (10.29)
const RC4=rt('6 cups cost 9, 10','€');      // €1.50 a cup: €15. wrong way 6 ÷ 9 × 10 = 20/3 (6.67); multiplied 540; by the number asked 9 ÷ 10 × 6 = 5.4
const RD1=rt('240 km in 3 h, 5','km');      // 80 km an hour: 400 km. wrong way 3 ÷ 240 × 5 = 1/16; multiplied 3600; by the number asked 240 ÷ 5 × 3 = 144
const RD2=rt('150 km in 4 h, 1','km');      // 37.5 km. wrong way 4 ÷ 150 = 2/75 (0.027); multiplied 600
const RD3=rt('90 km in 2 h, 7','km');       // 45 km an hour: 315 km. wrong way 2 ÷ 90 × 7 = 7/45 (0.16); multiplied 1260; by the number asked 90 ÷ 7 × 2 = 180/7 (25.71)

// ------------------------------------------------------------------ area of rectangles, triangles and composite shapes
const ar=(expr,unit='cm2')=>({shape:'area',expr,unit});
const AR1=ar('rectangle 7 by 4');                // 28 cm2. the lengths added 11, the perimeter 22
const AR2=ar('rectangle 12 by 9','m2');          // 108 m2. added 21, perimeter 42
const AR3=ar('rectangle 7.5 by 4');              // 30 cm2. added 11.5, perimeter 23
const AT1=ar('triangle base 10 height 6');       // 30 cm2. added 16; not halved 60
const AT2=ar('triangle base 5 height 3');        // 7.5 cm2. added 8; not halved 15
const AT3=ar('triangle base 9 height 7');        // 31.5 cm2. added 16; not halved 63
const AC1=ar('rectangles 8 by 3 and 4 by 2');    // 24 + 8 = 32 cm2. the four sides added 17, the two perimeters 34; one rectangle 24 or 8
const AC2=ar('rectangles 6 by 5 and 9 by 7');    // 30 + 63 = 93 cm2. added 27, perimeters 54; one rectangle 30 or 63

// ------------------------------------------------------------------ mean and range
const st=(expr)=>({shape:'stat',expr});
const SM1=st('mean 4, 7, 9, 10');          // 30 / 4 = 7.5. not divided 30; the wrong count 30/3 = 10, 30/5 = 6; the middle (7 + 9)/2 = 8, and 7, 9
const SM2=st('mean 2, 9, 4, 6, 4');        // 25 / 5 = 5 (the count: the generator never draws it). not divided 25; the wrong count 6.25, 25/6 (4.17); the middle 4
const SM3=st('mean 12, 17, 11, 14');       // 54 / 4 = 13.5. not divided 54; the wrong count 18, 10.8; the middle 13, and 12, 14
const SM4=st('mean 4, 8, 6, 15, 3, 9');    // 45 / 6 = 7.5. not divided 45; the wrong count 9, 45/7 (6.43); the middle 7, and 6, 8
const SR1=st('range 12, 5, 9, 20, 7');     // 20 - 5 = 15. the largest 20; the wrong way round 5 - 20 = -15
const SR2=st('range 31, 18, 52, 27');      // 52 - 18 = 34. the largest 52; -34
const SR3=st('range 9, 3, 6, 11');         // 11 - 3 = 8. the largest 11; -8
const B3_SPELLINGS={
 'ratio-share':[
  // 12:18 in its simplest form = 2:3: a ratio in lowest terms is right; an equal ratio not in lowest terms is unsure
  [RS1,'2:3','uk','right'],[RS1,'2 : 3','uk','right'],[RS1,'2 to 3','uk','right'],[RS1,'answer: 2:3','uk','right'],[RS1,'2:3.','uk','right'],[RS1,'2:3','cz','right'],
  [RS1,'4:6','uk','unsure'],[RS1,'12:18','uk','unsure'],[RS1,'6:9','uk','unsure'],[RS1,'1:1.5','uk','unsure'],
  [RS1,'2/3','uk','unsure'],[RS1,'0.67','uk','unsure'],[RS1,'2 and 3','uk','unsure'],[RS1,'','uk','unsure'],[RS1,'two to three','uk','unsure'],[RS1,'2:3 cm','uk','unsure'],[RS1,'2:3:4','uk','unsure'],
  [RS1,'3:2','uk','wrong','ratio-swapped'],[RS1,'18:12','uk','wrong','ratio-swapped'],[RS1,'2:5','uk','wrong'],[RS1,'1:3','uk','wrong'],[RS1,'-2:3','uk','wrong'],
  [RS2,'3:5','uk','right'],[RS2,'5:3','uk','wrong','ratio-swapped'],[RS2,'6:10','uk','unsure'],[RS2,'3:4','uk','wrong'],[RS2,'1:5','uk','wrong'],
  [RS3,'2:5','uk','right'],[RS3,'2 : 5','de','right'],[RS3,'5:2','uk','wrong','ratio-swapped'],[RS3,'4:10','uk','unsure'],
  // 60 shared in 2:3 = 24 and 36, in that order: the other order listed with 'and' is unsure, written as a ratio it is wrong
  [RH1,'24 and 36','uk','right'],[RH1,'24:36','uk','right'],[RH1,'24 : 36','uk','right'],[RH1,'24 & 36','uk','right'],[RH1,'24 and 36.','uk','right'],[RH1,'24.0 and 36','uk','right'],
  [RH1,'36 and 24','uk','unsure'],[RH1,'36:24','uk','wrong','ratio-swapped'],
  [RH1,'30 and 20','uk','wrong','ratio-split-each'],[RH1,'20 and 30','uk','wrong','ratio-split-each'],[RH1,'2 and 3','uk','wrong','ratio-as-amounts'],[RH1,'2:3','uk','wrong','ratio-as-amounts'],
  [RH1,'120 and 180','uk','wrong','ratio-by-difference'],[RH1,'12 and 48','uk','wrong'],[RH1,'25 and 35','uk','wrong'],
  // one number never answers a share: unsure, whether it is a share, a single part, or a list read as one number (cz)
  [RH1,'24','uk','unsure'],[RH1,'36','uk','unsure'],[RH1,'12','uk','unsure'],[RH1,'60','uk','unsure'],[RH1,'24, 36','uk','unsure'],[RH1,'24,36','cz','unsure'],
  [RH1,'24 kg and 36 kg','uk','unsure'],[RH1,'€24 and €36','uk','unsure'],[RH1,'40% and 60%','uk','unsure'],[RH1,'twenty-four and thirty-six','uk','unsure'],
  // €45 shared in 4:5 = €20 and €25: a missing sign is not held against it, another currency is unsure
  [RH2,'€20 and €25','uk','right'],[RH2,'20 and 25','uk','right'],[RH2,'20 € and 25 €','de','right'],[RH2,'€20 and 25','uk','right'],[RH2,'£20 and £25','uk','unsure'],
  [RH2,'25:20','uk','wrong','ratio-swapped'],[RH2,'11.25 and 9','uk','wrong','ratio-split-each'],[RH2,'11,25 and 9','cz','wrong','ratio-split-each'],[RH2,'4 and 5','uk','wrong','ratio-as-amounts'],
  [RH2,'5 and 4','uk','wrong','ratio-as-amounts'],[RH2,'180 and 225','uk','wrong','ratio-by-difference'],[RH2,'20 and 26','uk','wrong'],
  // 70 kg shared in 2:5 = 20 kg and 50 kg; a rounding of a slip's non-terminating amount names it
  [RH3,'20 kg and 50 kg','uk','right'],[RH3,'20:50','uk','right'],[RH3,'50 and 20','uk','unsure'],[RH3,'20 g and 50 g','uk','unsure'],
  [RH3,'35 and 14','uk','wrong','ratio-split-each'],[RH3,'46.67 and 116.67','uk','wrong','ratio-by-difference'],[RH3,'2:5','uk','wrong','ratio-as-amounts'],
  // 2:3 = ?:15 -> 10: a ratio (or fraction) that completes the given one is read as its missing term
  [RM1,'10','uk','right'],[RM1,'10.0','uk','right'],[RM1,'x = 10','uk','right'],[RM1,'10:15','uk','right'],[RM1,'10/15','uk','right'],[RM1,'20/2','uk','right'],
  [RM1,'14','uk','wrong','ratio-added-same'],[RM1,'14:15','uk','wrong','ratio-added-same'],[RM1,'9','uk','wrong'],[RM1,'-10','uk','wrong'],
  [RM1,'4:6','uk','unsure'],[RM1,'2:3','uk','unsure'],[RM1,'10:16','uk','unsure'],[RM1,'2/3','uk','unsure'],[RM1,'10 and 15','uk','unsure'],[RM1,'','uk','unsure'],
  [RM1,'ten','uk','unsure'],[RM1,'10%','uk','unsure'],[RM1,'10 cm','uk','unsure'],
  // 4:5 = 12:? -> 15
  [RM2,'15','uk','right'],[RM2,'12:15','uk','right'],[RM2,'12/15','uk','right'],[RM2,'13','uk','wrong','ratio-added-same'],[RM2,'12:13','uk','wrong','ratio-added-same'],[RM2,'16','uk','wrong'],[RM2,'8:10','uk','unsure'],
  // 3:6 = ?:18 -> 9
  [RM3,'9','uk','right'],[RM3,'9:18','uk','right'],[RM3,'15','uk','wrong','ratio-added-same'],[RM3,'36','uk','wrong','ratio-swapped'],[RM3,'36:18','uk','wrong','ratio-swapped'],[RM3,'1:2','uk','unsure'],
  // 2:5 = 8:? -> 20
  [RM4,'20','uk','right'],[RM4,'8:20','uk','right'],[RM4,'11','uk','wrong','ratio-added-same'],[RM4,'8:11','uk','wrong','ratio-added-same'],[RM4,'21','uk','wrong'],
 ],
 'unit-rate':[
  // 8 pens at 5 for €3.50 = €5.60: any written form of the value is right, a missing sign is not held against it
  [RC1,'5.60','uk','right'],[RC1,'€5.60','uk','right'],[RC1,'5.6','uk','right'],[RC1,'€5.6','uk','right'],[RC1,'5,60 €','de','right'],[RC1,'5,6','cz','right'],[RC1,'5.60 euros','uk','right'],[RC1,'x = 5.60','uk','right'],
  // another unit, a percent, the cents written bare (560 for €5.60: the answer in cents, or not - never guessed), words: unsure
  [RC1,'£5.60','uk','unsure'],[RC1,'5.60 kg','uk','unsure'],[RC1,'5.60%','uk','unsure'],[RC1,'560','uk','unsure'],[RC1,'560p','uk','unsure'],[RC1,'five euros sixty','uk','unsure'],[RC1,'','uk','unsure'],
  [RC1,'5.5','uk','wrong'],[RC1,'5.61','uk','wrong'],[RC1,'6','uk','wrong'],[RC1,'0.70','uk','wrong'],
  [RC1,'11.43','uk','wrong','rate-wrong-way'],[RC1,'11.4','uk','wrong','rate-wrong-way'],[RC1,'140','uk','wrong','rate-multiplied'],[RC1,'€140','uk','wrong','rate-multiplied'],
  [RC1,'2.19','uk','wrong','rate-other-quantity'],[RC1,'2.1875','uk','wrong','rate-other-quantity'],
  // 1 kg at 12 for €30 = €2.50
  [RC2,'2.50','uk','right'],[RC2,'€2.50','uk','right'],[RC2,'2.5','uk','right'],[RC2,'2,50','cz','right'],[RC2,'2,50','uk','unsure'],[RC2,'250','uk','unsure'],
  [RC2,'0.4','uk','wrong','rate-wrong-way'],[RC2,'0.40','uk','wrong','rate-wrong-way'],[RC2,'360','uk','wrong','rate-multiplied'],[RC2,'2','uk','wrong'],[RC2,'3','uk','wrong'],[RC2,'2.6','uk','wrong'],
  // 7 books at 4 for £18 = £31.50
  [RC3,'£31.50','uk','right'],[RC3,'31.5','uk','right'],[RC3,'1.56','uk','wrong','rate-wrong-way'],[RC3,'504','uk','wrong','rate-multiplied'],[RC3,'10.29','uk','wrong','rate-other-quantity'],
  [RC3,'£4.50','uk','wrong'],[RC3,'3150','uk','unsure'],[RC3,'€31.50','uk','unsure'],[RC3,'31','uk','wrong'],[RC3,'32','uk','wrong'],
  // 10 cups at 6 for €9 = €15
  [RC4,'15','uk','right'],[RC4,'€15.00','uk','right'],[RC4,'6.67','uk','wrong','rate-wrong-way'],[RC4,'540','uk','wrong','rate-multiplied'],[RC4,'5.4','uk','wrong','rate-other-quantity'],
  [RC4,'1500','uk','unsure'],[RC4,'15%','uk','unsure'],[RC4,'1.5','uk','wrong'],
  // 240 km in 3 hours, 5 hours = 400 km: another unit is unsure, never converted; a bare number that differs is wrong
  [RD1,'400','uk','right'],[RD1,'400 km','uk','right'],[RD1,'400km','uk','right'],[RD1,'400 kilometres','uk','right'],[RD1,'400 m','uk','unsure'],[RD1,'400 km/h','uk','unsure'],
  [RD1,'3600','uk','wrong','rate-multiplied'],[RD1,'144','uk','wrong','rate-other-quantity'],[RD1,'0.0625','uk','wrong','rate-wrong-way'],[RD1,'80','uk','wrong'],[RD1,'401','uk','wrong'],[RD1,'4000','uk','wrong'],
  // 150 km in 4 hours, 1 hour = 37.5 km: a whole number is an exact claim
  [RD2,'37.5','uk','right'],[RD2,'37.5 km','uk','right'],[RD2,'37,5 km','de','right'],[RD2,'75/2','uk','right'],[RD2,'37 1/2','uk','right'],[RD2,'38','uk','wrong'],[RD2,'37','uk','wrong'],
  [RD2,'0.027','uk','wrong','rate-wrong-way'],[RD2,'600','uk','wrong','rate-multiplied'],[RD2,'375','uk','wrong'],
  // 90 km in 2 hours, 7 hours = 315 km
  [RD3,'315','uk','right'],[RD3,'1260','uk','wrong','rate-multiplied'],[RD3,'25.71','uk','wrong','rate-other-quantity'],[RD3,'0.16','uk','wrong','rate-wrong-way'],[RD3,'45','uk','wrong'],
 ],
 'area':[
  // 7 cm by 4 cm = 28 cm2: the number alone or with its square unit is right; a length unit (28 cm) or another square unit
  // is unsure, never wrong - the desk does not teach units by marking them wrong; a bare number that differs is wrong
  [AR1,'28','uk','right'],[AR1,'28 cm2','uk','right'],[AR1,'28cm2','uk','right'],[AR1,'28 cm^2','uk','right'],[AR1,'28 cm²','uk','right'],[AR1,'28 square centimetres','uk','right'],[AR1,'x = 28','uk','right'],[AR1,'28.0','uk','right'],
  [AR1,'28 cm','uk','unsure'],[AR1,'28 m2','uk','unsure'],[AR1,'28 m','uk','unsure'],[AR1,'0.28 m2','uk','unsure'],[AR1,'28%','uk','unsure'],[AR1,'twenty-eight','uk','unsure'],[AR1,'','uk','unsure'],
  [AR1,'28 cm3','uk','unsure'],[AR1,'28 square cm','uk','unsure'],[AR1,'22 cm','uk','unsure'],
  [AR1,'11','uk','wrong','area-added-sides'],[AR1,'22','uk','wrong','area-added-sides'],[AR1,'14','uk','wrong'],[AR1,'27','uk','wrong'],[AR1,'29','uk','wrong'],
  // 12 m by 9 m = 108 m2
  [AR2,'108','uk','right'],[AR2,'108 m2','uk','right'],[AR2,'108 m²','uk','right'],[AR2,'108 square metres','uk','right'],[AR2,'108 cm2','uk','unsure'],[AR2,'42 m','uk','unsure'],
  [AR2,'21','uk','wrong','area-added-sides'],[AR2,'42','uk','wrong','area-added-sides'],[AR2,'54','uk','wrong'],
  // 7.5 cm by 4 cm = 30 cm2
  [AR3,'30','uk','right'],[AR3,'30 cm2','uk','right'],[AR3,'11.5','uk','wrong','area-added-sides'],[AR3,'23','uk','wrong','area-added-sides'],[AR3,'28','uk','wrong'],[AR3,'32','uk','wrong'],
  // a triangle, base 10 cm, height 6 cm = 30 cm2
  [AT1,'30','uk','right'],[AT1,'30 cm2','uk','right'],[AT1,'60','uk','wrong','area-no-half'],[AT1,'60 cm2','uk','wrong','area-no-half'],[AT1,'16','uk','wrong','area-added-sides'],[AT1,'15','uk','wrong'],[AT1,'30 cm','uk','unsure'],
  // base 5 cm, height 3 cm = 7.5 cm2: a whole number is an exact claim (8 is wrong, and it is what the lengths added give)
  [AT2,'7.5','uk','right'],[AT2,'7.5 cm2','uk','right'],[AT2,'7,5','cz','right'],[AT2,'15/2','uk','right'],[AT2,'7 1/2','uk','right'],[AT2,'7,5','uk','unsure'],
  [AT2,'15','uk','wrong','area-no-half'],[AT2,'8','uk','wrong','area-added-sides'],[AT2,'7','uk','wrong'],[AT2,'7.4','uk','wrong'],
  // base 9 cm, height 7 cm = 31.5 cm2
  [AT3,'31.5','uk','right'],[AT3,'63','uk','wrong','area-no-half'],[AT3,'16','uk','wrong','area-added-sides'],[AT3,'31','uk','wrong'],[AT3,'32','uk','wrong'],[AT3,'31.5 m2','uk','unsure'],
  // rectangles 8 cm by 3 cm and 4 cm by 2 cm = 32 cm2
  [AC1,'32','uk','right'],[AC1,'32 cm2','uk','right'],[AC1,'24','uk','wrong','area-one-part'],[AC1,'8','uk','wrong','area-one-part'],[AC1,'17','uk','wrong','area-added-sides'],[AC1,'34','uk','wrong','area-added-sides'],
  [AC1,'16','uk','wrong'],[AC1,'192','uk','wrong'],[AC1,'32 cm','uk','unsure'],
  // rectangles 6 cm by 5 cm and 9 cm by 7 cm = 93 cm2
  [AC2,'93','uk','right'],[AC2,'93 cm²','uk','right'],[AC2,'30','uk','wrong','area-one-part'],[AC2,'63','uk','wrong','area-one-part'],[AC2,'27','uk','wrong','area-added-sides'],[AC2,'54','uk','wrong','area-added-sides'],[AC2,'33','uk','wrong'],
 ],
 'mean-range':[
  // the mean of 4, 7, 9, 10 = 7.5 in any written form; a unit, a percent, words are unsure; a whole number is an exact claim
  [SM1,'7.5','uk','right'],[SM1,'7,5','cz','right'],[SM1,'15/2','uk','right'],[SM1,'7 1/2','uk','right'],[SM1,'x = 7.5','uk','right'],[SM1,'7.50','uk','right'],
  [SM1,'7,5','uk','unsure'],[SM1,'7.5 cm','uk','unsure'],[SM1,'7.5%','uk','unsure'],[SM1,'seven and a half','uk','unsure'],[SM1,'','uk','unsure'],
  [SM1,'30','uk','wrong','stat-not-divided'],[SM1,'10','uk','wrong','stat-wrong-count'],[SM1,'6','uk','wrong','stat-wrong-count'],[SM1,'8','uk','wrong','stat-median'],
  [SM1,'9','uk','wrong','stat-median'],[SM1,'7','uk','wrong','stat-median'],[SM1,'7.4','uk','wrong'],[SM1,'-7.5','uk','wrong'],
  // 2, 9, 4, 6, 4 -> 5
  [SM2,'5','uk','right'],[SM2,'5.0','uk','right'],[SM2,'25','uk','wrong','stat-not-divided'],[SM2,'6.25','uk','wrong','stat-wrong-count'],[SM2,'4.17','uk','wrong','stat-wrong-count'],
  [SM2,'4','uk','wrong','stat-median'],[SM2,'6','uk','wrong'],[SM2,'5 kg','uk','unsure'],
  // 12, 17, 11, 14 -> 13.5
  [SM3,'13.5','uk','right'],[SM3,'27/2','uk','right'],[SM3,'13,5','de','right'],[SM3,'54','uk','wrong','stat-not-divided'],[SM3,'18','uk','wrong','stat-wrong-count'],[SM3,'10.8','uk','wrong','stat-wrong-count'],
  [SM3,'13','uk','wrong','stat-median'],[SM3,'12','uk','wrong','stat-median'],[SM3,'14','uk','wrong','stat-median'],[SM3,'13.4','uk','wrong'],
  // 4, 8, 6, 15, 3, 9 -> 7.5
  [SM4,'7.5','uk','right'],[SM4,'45','uk','wrong','stat-not-divided'],[SM4,'9','uk','wrong','stat-wrong-count'],[SM4,'6.43','uk','wrong','stat-wrong-count'],[SM4,'7','uk','wrong','stat-median'],
  [SM4,'8','uk','wrong','stat-median'],[SM4,'6','uk','wrong','stat-median'],[SM4,'7.5 m','uk','unsure'],
  // the range of 12, 5, 9, 20, 7 = 15: the smallest less the largest is below zero and is the slip, never unsure
  [SR1,'15','uk','right'],[SR1,'15.0','uk','right'],[SR1,'x = 15','uk','right'],[SR1,'20','uk','wrong','range-largest'],[SR1,'-15','uk','wrong','range-backwards'],[SR1,'−15','uk','wrong','range-backwards'],
  [SR1,'5','uk','wrong'],[SR1,'16','uk','wrong'],[SR1,'15%','uk','unsure'],[SR1,'15 cm','uk','unsure'],[SR1,'fifteen','uk','unsure'],[SR1,'','uk','unsure'],[SR1,'5 to 20','uk','unsure'],[SR1,'5-20','uk','unsure'],
  // 31, 18, 52, 27 -> 34
  [SR2,'34','uk','right'],[SR2,'52','uk','wrong','range-largest'],[SR2,'-34','uk','wrong','range-backwards'],[SR2,'18','uk','wrong'],[SR2,'35','uk','wrong'],
  // 9, 3, 6, 11 -> 8
  [SR3,'8','uk','right'],[SR3,'8.0','uk','right'],[SR3,'11','uk','wrong','range-largest'],[SR3,'-8','uk','wrong','range-backwards'],[SR3,'3','uk','wrong'],
 ],
};
const B3_LEAKS={
 'ratio-share':[
  [RS1,'The answer is 2:3.'],[RS1,'It simplifies to 2 : 3.'],[RS1,'Two to three.'],[RS1,'Divide both by 6 to get 2 and 3.'],[RS1,'12 ÷ 6 = 2'],[RS1,'As a fraction that is 2/3.'],
  [RS2,'You get 3:5.'],[RS2,'15 ÷ 5 = 3 and 25 ÷ 5 = 5'],[RS2,'It is 3 to 5.'],
  [RH1,'The shares are 24 and 36.'],[RH1,'12 × 2 = 24'],[RH1,'60 ÷ 5 × 3'],[RH1,'Two parts make 24.'],[RH1,'It is 24:36.'],[RH1,'60 - 24 = 36'],[RH1,'thirty-six'],[RH1,'Twenty-four and thirty-six.'],
  [RH2,'€20 and €25'],[RH2,'5 lots of 4 is 20.'],[RH2,'Each part is €5, so four parts is €20.'],
  [RM1,'The missing number is 10.'],[RM1,'2:3 = 10:15'],[RM1,'Multiply 2 by 5.'],[RM1,'It is ten.'],[RM1,'15 ÷ 3 × 2'],
 ],
 'unit-rate':[
  [RC1,'The answer is €5.60.'],[RC1,'It costs 5.60.'],[RC1,'0.70 × 8 = 5.60'],[RC1,'70p × 8 = 560p'],[RC1,'Eight pens cost five euros sixty.'],[RC1,'3.50 ÷ 5 × 8'],[RC1,'About 5.6.'],
  [RC1,'560 cents'],[RC1,'7 × 8 = 56'],
  [RC2,'One kg costs €2.50.'],[RC2,'30 ÷ 12 = 2.5'],[RC2,'Two euros fifty.'],[RC2,'It is 2.50.'],
  [RD1,'You go 400 km.'],[RD1,'80 × 5 = 400'],[RD1,'240 ÷ 3 × 5'],[RD1,'Four hundred kilometres.'],[RD1,'80 km each hour, so 400 km.'],
  [RD2,'The speed is 37.5 km an hour.'],[RD2,'150 ÷ 4 = 37.5'],
  [RC3,'£31.50'],[RC3,'4.50 × 7'],
 ],
 'area':[
  [AR1,'The area is 28 cm2.'],[AR1,'It is 28.'],[AR1,'Twenty-eight square centimetres.'],[AR1,'7 × 4 = 28'],[AR1,'You get 28 cm².'],
  [AT1,'The area is 30.'],[AT1,'10 × 6 ÷ 2'],[AT1,'60 ÷ 2 = 30'],[AT1,'Half of 60 is 30.'],[AT1,'Half of 60.'],
  [AT2,'It is 7.5.'],[AT2,'Seven and a half.'],[AT2,'15 ÷ 2'],
  [AC1,'24 + 8 = 32'],[AC1,'24 + 8'],[AC1,'The total is 32 cm2.'],[AC1,'Thirty-two.'],
  [AR3,'7.5 × 4 = 30'],
 ],
 'mean-range':[
  [SM1,'The mean is 7.5.'],[SM1,'30 ÷ 4 = 7.5'],[SM1,'30 ÷ 4'],[SM1,'Seven and a half.'],[SM1,'Divide 30 by 4 to get 7.5.'],[SM1,'About 7.5.'],[SM1,'7 1/2'],[SM1,'15/2'],
  [SM2,'The mean is 5.'],[SM2,'25 ÷ 5'],
  [SR1,'The range is 15.'],[SR1,'20 - 5 = 15'],[SR1,'20 - 5'],[SR1,'20 take away 5'],[SR1,'Fifteen.'],
  [SR2,'52 - 18'],[SR2,'It is 34.'],
 ],
};
const B3_LEGIT={
 'ratio-share':[
  [RS1,'Find a number that goes into both 12 and 18.'],[RS1,'Divide both numbers by the same number.'],[RS1,'Both are even, so you can halve them first: 6:9.'],
  [RS1,'The highest common factor of 12 and 18 is 6.'],[RS1,'Keep dividing until nothing but 1 goes into both.'],[RS1,'12:18 is the same as 6:9.'],[RS1,'Divide 12 and 18 by 6.'],
  [RS4,'Both numbers are in the seven times table.'],[RS4,'Divide both by 7.'],[RS4,'What is the biggest number that goes into 14 and 35?'],[RS2,'What is the biggest number that goes into 15 and 25?'],
  [RH1,'Add the parts of the ratio first.'],[RH1,'There are 2 + 3 = 5 parts.'],[RH1,'Divide 60 by 5 to find one part.'],[RH1,'One part is 12.'],[RH1,'Then multiply one part by each number of the ratio.'],
  [RH1,'Your two answers should add up to 60.'],[RH1,'The first share is smaller than the second.'],[RH1,'Check the two amounts are in the ratio 2:3.'],
  [RH2,'Add 4 and 5 to get 9 parts.'],[RH2,'45 ÷ 9 = 5'],[RH2,'Keep the euro sign in your answers.'],
  [RM1,'What do you multiply 3 by to get 15?'],[RM1,'3 × 5 = 15'],[RM1,'Do the same to the 2.'],[RM1,'Multiply both numbers by the same number.'],
  [RM2,'What was 4 multiplied by to make 12?'],[RM2,'4 × 3 = 12'],
 ],
 'unit-rate':[
  [RC1,'Find the cost of one pen first.'],[RC1,'Divide €3.50 by 5.'],[RC1,'One pen costs 70p.'],[RC1,'One pen costs €0.70.'],[RC1,'Then multiply by 8.'],
  [RC1,'Eight pens cost more than five pens.'],[RC1,'Your answer should be more than €3.50.'],[RC1,'Work in pence: €3.50 is 350p.'],[RC1,'Is the answer more or less than €3.50?'],
  [RC2,'Divide 30 by 12.'],[RC2,'Divide the cost by the number of kilograms.'],[RC2,'The price of 1 kg is less than €30.'],
  [RD1,'Find how far you go in one hour first.'],[RD1,'Divide 240 by 3.'],[RD1,'In one hour you go 80 km.'],[RD1,'Then multiply by 5.'],[RD1,'Five hours is longer than three hours, so you go further.'],
  [RD2,'Divide 150 by 4.'],[RD2,'150 ÷ 4'],
  [RC3,'Find the price of one book first.'],[RC3,'£18 ÷ 4 = £4.50'],[RC4,'Find the cost of one cup: divide €9 by 6.'],
 ],
 'area':[
  [AR1,'Multiply the length by the width.'],[AR1,'Area is length times width.'],[AR1,'Multiply 7 by 4.'],[AR1,'7 × 4'],[AR1,'Adding 7 and 4 gives the distance round, not the area.'],
  [AR1,'Count the squares: 7 rows of 4.'],[AR1,'Your answer is in cm2.'],[AR1,'Your answer is in square centimetres.'],
  [AT1,'Multiply the base by the height, then halve it.'],[AT1,'10 × 6 = 60'],[AT1,'A triangle is half of a rectangle.'],[AT1,'The height is 6 cm.'],[AT1,'Halve 60.'],
  [AT2,'Multiply 5 by 3 and then halve.'],[AT2,'Half of an odd number ends in .5.'],
  [AC1,'Find the area of each rectangle first.'],[AC1,'8 × 3 = 24'],[AC1,'4 × 2 = 8'],[AC1,'Then add the two areas.'],[AC1,'The first rectangle is 24 cm2.'],
  [AR2,'Multiply 12 by 9.'],[AR2,'Your answer is in square metres.'],[AR3,'Multiply 7.5 by 4.'],[AR3,'7 × 4 = 28 and half of 4 is 2.'],
 ],
 'mean-range':[
  [SM1,'Add the numbers, then divide by how many there are.'],[SM1,'Add them up first.'],[SM1,'4 + 7 + 9 + 10 = 30'],[SM1,'The total is 30.'],[SM1,'There are 4 numbers.'],
  [SM1,'Divide the total by 4.'],[SM1,'Your mean will be between 4 and 10.'],[SM1,'The mean does not have to be a whole number.'],
  [SM3,'Add the four numbers first.'],[SM3,'12 + 17 + 11 + 14 = 54'],[SM3,'Now divide 54 by the number of values.'],
  [SR1,'Find the largest and the smallest numbers.'],[SR1,'The largest is 20.'],[SR1,'The smallest is 5.'],[SR1,'Subtract the smallest from the largest.'],
  [SR1,'Put the numbers in order first: 5, 7, 9, 12, 20.'],[SR1,'The range is never negative.'],[SR2,'The largest number is 52 and the smallest is 18.'],
  [SM1,'Count the numbers: there are four.'],[SM4,'Count the numbers: there are 6.'],[SM3,'The middle two numbers are 12 and 14.'],[SR3,'Look for the biggest and the smallest.'],
 ],
};
/**
 * B3 CONFLICTS: legit hints the strict rule refuses, accepted and reported. A ratio's lowest parts leak alone (2 and 3
 * for 12:18), so a step numbered with one of them is refused, as the fractions' simplify rule refuses "Step 4" for 3/4;
 * and where the common factor is an answer part (15:25 is 3:5 by the factor 5), naming the factor is refused too. The
 * generator never draws that case (an answer part above 1 never divides its scale factor).
 */
const B3_CONFLICTS=[
 [RS1,'Step 2: divide both numbers by the same number.'],[RS2,'Both numbers are in the five times table.'],[RS2,'Divide both by 5.'],
 // a rate's answer in cents or pence is the answer too (560 for €5.60), so whole-number working that makes it is refused
 [RC1,'Multiply 70 by 8, then write it in euros.'],
 // a mean equal to the count (2, 9, 4, 6, 4 has five numbers and a mean of 5): naming the count names the answer; the
 // generator never draws that case
 [SM2,'Add them and divide by 5.'],[SM2,'There are five numbers in the list.'],
];

/** The references: each unit's answer by hand, with this file's own gcd, never the module's evaluator. */
const B3REF={
 'ratio-share':(s)=>{
  if(s.shape!=='ratio')return null;
  let m=/^(\d+):(\d+)$/.exec(s.expr);
  if(m){const [a,b]=[+m[1],+m[2]],g=refGcd(a,b);return {kind:'simplify',a,b,g,p:a/g,q:b/g,truth:`${a/g}:${b/g}`,off:`${a/g+1}:${b/g}`,nums:[a,b]};}
  m=/^(\d+) in (\d+):(\d+)$/.exec(s.expr);
  if(m){const [T,a,b]=[+m[1],+m[2],+m[3]],k=T/(a+b);return {kind:'share',T,a,b,k,s1:k*a,s2:k*b,truth:`${k*a} and ${k*b}`,off:`${k*a+1} and ${k*b}`,nums:[T,a,b]};}
  m=/^(\d+):(\d+) = (\?|\d+):(\?|\d+)$/.exec(s.expr);
  if(m){const [a,b]=[+m[1],+m[2]],first=m[3]==='?',known=+(first?m[4]:m[3]),ans=first?a*known/b:b*known/a,factor=first?known/b:known/a;return {kind:'missing',a,b,known,first,ans,factor,truth:`${ans}`,off:`${ans+1}`,nums:[a,b,known]};}
  return null;
 },
 // a cost in whole cents, a distance in half kilometres: integers throughout
 'unit-rate':(s)=>{
  if(s.shape!=='rate')return null;
  let m=/^(\d+) ([a-z]+) cost (\d+)(?:\.(\d\d))?, (\d+)$/.exec(s.expr);
  if(m){const q1=+m[1],cents=Number(m[3])*100+Number(m[4]??0),q2=+m[5],tc=cents*q2/q1;assert.ok(Number.isInteger(tc),`${s.expr}: to the cent`);
   const money=(c)=>(c%100===0?String(c/100):(c/100).toFixed(2));return {measure:'cost',q1,q2,cents,each:cents/q1,truth:money(tc),off:money(tc+100),nums:[q1,q2]};}
  m=/^(\d+) km in (\d+) h, (\d+)$/.exec(s.expr);
  if(m){const D=+m[1],h1=+m[2],h2=+m[3],half=2*D*h2/h1;assert.ok(Number.isInteger(half),`${s.expr}: to the half km`);
   const km=(h)=>(h%2===0?String(h/2):`${(h-1)/2}.5`);return {measure:'distance',D,h1,h2,speed2:2*D/h1,truth:km(half),off:km(half+2),nums:[D,h1,h2]};}
  return null;
 },
 // sides in halves, the area in eighths: integers throughout
 'area':(s)=>{
  if(s.shape!=='area')return null;
  const h=(x)=>Math.round(Number(x)*2),eighths=(e)=>{const v=e/8;return Number.isInteger(v)?String(v):String(v).replace(/0+$/,'');};
  let m=/^rectangle (\d+(?:\.5)?) by (\d+(?:\.5)?)$/.exec(s.expr);
  if(m){const e=2*h(m[1])*h(m[2]);return {fig:'rectangle',sides:[+m[1],+m[2]],truth:eighths(e),off:eighths(e+8),nums:[+m[1],+m[2]]};}
  m=/^triangle base (\d+(?:\.5)?) height (\d+(?:\.5)?)$/.exec(s.expr);
  if(m){const e=h(m[1])*h(m[2]);return {fig:'triangle',sides:[+m[1],+m[2]],truth:eighths(e),off:eighths(e+8),nums:[+m[1],+m[2]]};}
  m=/^rectangles (\d+) by (\d+) and (\d+) by (\d+)$/.exec(s.expr);
  if(m){const [a,b,c,d]=m.slice(1).map(Number),e=8*(a*b+c*d);return {fig:'composite',sides:[a,b,c,d],truth:eighths(e),off:eighths(e+8),nums:[a,b,c,d]};}
  return null;
 },
 // the mean in hundredths, by hand
 'mean-range':(s)=>{
  const m=/^(mean|range) (\d+(?:, \d+)+)$/.exec(s.expr);if(!m||s.shape!=='stat')return null;
  const xs=m[2].split(', ').map(Number),n=xs.length,total=xs.reduce((a,b)=>a+b,0),max=Math.max(...xs),min=Math.min(...xs);
  if(m[1]==='range')return {stat:'range',xs,n,truth:String(max-min),off:String(max-min+1),nums:xs};
  const h=total*100/n;assert.ok(Number.isInteger(h),`${s.expr}: two places at most`);
  const fmt=(x)=>(x%100===0?String(x/100):(x/100).toFixed(2).replace(/0$/,''));
  const sorted=[...xs].sort((a,b)=>a-b),median=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
  return {stat:'mean',xs,n,total,median,truth:fmt(h),off:fmt(h+100),nums:xs};
 },
};
const B3GEN={'ratio-share':S.genRatio,'unit-rate':S.genRate,'area':S.genArea,'mean-range':S.genStat};
/** Each unit's tier, as school.ts documents it, asserted on the reference reading. */
const B3_TIER={
 'ratio-share':(s,r,tier)=>{
  if(tier===1){
   assert.ok(r.kind==='simplify'||r.kind==='missing',`tier 1 is equal ratios: ${s.expr}`);assert.equal(s.unit,undefined);
   if(r.kind==='simplify'){assert.ok(r.p<=9&&r.q<=9&&r.p!==r.q&&r.g>=2&&r.g<=9,s.expr);assert.ok((r.p===1||r.g%r.p!==0)&&(r.q===1||r.g%r.q!==0),`no answer part divides the factor: ${s.expr}`);}
   else{assert.ok(Number.isInteger(r.factor)&&r.factor>=2&&r.factor<=6,`scaled up by 2..6: ${s.expr}`);assert.ok(r.a>=2&&r.b>=2&&r.a<=9&&r.b<=9&&refGcd(r.a,r.b)===1,s.expr);assert.notEqual(r.ans,r.factor);assert.ok(r.ans<=60&&r.known<=60);}
  }else{
   assert.equal(r.kind,'share',`tier 2 shares: ${s.expr}`);assert.ok(r.a>=2&&r.b>=2&&r.a<=9&&r.b<=9&&r.a!==r.b&&refGcd(r.a,r.b)===1,s.expr);
   assert.ok(Number.isInteger(r.k)&&r.k>=2&&r.T<=500,s.expr);assert.ok(![r.T,r.a,r.b].includes(r.s1)&&![r.T,r.a,r.b].includes(r.s2),'no share is printed');
   if(s.unit!==undefined)assert.ok(['€','£','kg','g','m','ml','l','min'].includes(s.unit),s.unit);
  }
  if(r.kind==='missing')assert.ok(!r.nums.includes(r.ans),'the question does not print its answer');
 },
 'unit-rate':(s,r,tier)=>{
  assert.notEqual(r.q1??r.h1,r.q2??r.h2,'the asked number is not the given one');assert.ok(!r.nums.includes(Number(r.truth)),'the question does not print its answer');
  if(r.measure==='cost'){
   assert.ok(['€','£'].includes(s.unit),`a cost in euros or pounds: ${s.unit}`);assert.ok(Number.isInteger(r.each),`${s.expr}: a price a pen to the cent`);
   if(tier===1)assert.ok(r.each%100===0&&r.each>=200&&r.each<=1200&&r.q1>=2&&r.q1<=10&&r.q2<=12,`tier 1: a whole price for one: ${s.expr}`);
   else assert.ok(r.each%100!==0&&r.each>=5&&r.each<=995&&r.q1>=2&&r.q1<=12&&r.q2<=15,`tier 2: a price for one that is not whole: ${s.expr}`);
  }else{
   assert.equal(s.unit,'km');
   if(tier===1)assert.ok(r.speed2%10===0&&r.speed2>=40&&r.speed2<=180&&r.h1>=2&&r.h1<=5&&r.h2<=8,`tier 1: a whole speed, a multiple of 5: ${s.expr}`);
   else assert.ok(r.speed2%2===1&&r.speed2>=41&&r.speed2<=191&&[2,4,6,8].includes(r.h1)&&r.h2<=9,`tier 2: a speed ending in a half: ${s.expr}`);
  }
 },
 'area':(s,r,tier)=>{
  const [a,b,c,d]=r.sides,whole=(x)=>Number.isInteger(x);
  assert.ok(!r.nums.includes(Number(r.truth)),'the question does not print its answer');
  if(tier===1){
   if(r.fig==='rectangle')assert.ok(whole(a)&&whole(b)&&a>=2&&a<=12&&b>=2&&b<=12&&['cm2','m2'].includes(s.unit),`tier 1 rectangle: ${s.expr}`);
   else assert.ok(r.fig==='triangle'&&whole(a)&&whole(b)&&a>=2&&a<=16&&b>=2&&b<=12&&(a*b)%2===0&&s.unit==='cm2',`tier 1 triangle, a whole area: ${s.expr}`);
  }else if(r.fig==='composite')assert.ok([a,b,c,d].every((x)=>whole(x)&&x>=2&&x<=9)&&a*b!==c*d&&s.unit==='cm2',`tier 2 two rectangles: ${s.expr}`);
  else if(r.fig==='triangle')assert.ok(whole(a)&&whole(b)&&a>=3&&a<=15&&b>=3&&b<=11&&(a*b)%2===1&&s.unit==='cm2',`tier 2 triangle, a half: ${s.expr}`);
  else assert.ok(!whole(a)&&a>=2.5&&a<=11.5&&whole(b)&&b%2===0&&b>=2&&b<=12&&['cm2','m2'].includes(s.unit),`tier 2 rectangle, a half side: ${s.expr}`);
 },
 'mean-range':(s,r,tier)=>{
  assert.ok(!r.nums.includes(Number(r.truth)),'the list does not print its answer');
  if(tier===1)assert.ok((r.n===4||r.n===5)&&r.xs.every((x)=>x>=1&&x<=20)&&(r.stat==='range'||Number.isInteger(Number(r.truth))),`tier 1: four or five numbers 1..20, a whole mean: ${s.expr}`);
  else if(r.stat==='mean')assert.ok(r.n>=4&&r.n<=6&&r.xs.every((x)=>x>=2&&x<=60)&&!Number.isInteger(Number(r.truth)),`tier 2: a mean that is not whole: ${s.expr}`);
  else assert.ok(r.n===6&&r.xs.every((x)=>x>=2&&x<=99),`tier 2: the range of six numbers 2..99: ${s.expr}`);
  if(r.stat==='mean'){assert.notEqual(r.median,Number(r.truth),'the mean is not the middle value');assert.notEqual(r.n,Number(r.truth),'the mean is not the count');}
 },
};

for (const unit of B3_UNITS){
 test(`W7c SPELLINGS ${unit}: ${B3_SPELLINGS[unit].length} written answers, zero false-right, zero false-wrong`,()=>{spellings(`B3_SPELLINGS ${unit}`,B3_SPELLINGS[unit],unit);});
 test(`W7c LEAKS ${unit}: ${B3_LEAKS[unit].length} hints that give the answer away are refused; ${B3_LEGIT[unit].length} legit hints pass`,()=>{
  const leaks=B3_LEAKS[unit],legit=B3_LEGIT[unit];
  const missed=leaks.filter(([s,h])=>!S.leaksSchool(s,h)).map(([s,h])=>`${JSON.stringify(s)} | ${h}`);
  const flagged=legit.filter(([s,h])=>S.leaksSchool(s,h)).map(([s,h])=>`${JSON.stringify(s)} | ${h}`);
  const specs=new Set([...leaks,...legit].map(([s])=>JSON.stringify(s)));
  console.log(`# W7c LEAKS ${unit}: ${leaks.length} (missed ${missed.length}), LEGIT ${legit.length} (flagged ${flagged.length}), specs ${specs.size}`);
  assert.deepEqual(missed,[],'every leaking hint is caught');
  assert.deepEqual(flagged,[],'no legit hint is flagged');
  assert.ok(leaks.length>=15&&legit.length>=20&&specs.size>=3);
  for (const [s] of [...leaks,...legit]) assert.equal(S.unitOf(s),unit,`${JSON.stringify(s)} is a ${unit} spec`);
 });
 test(`W7c GENERATOR ${unit}: seeds 1..200 for tiers 1 and 2 give well-formed, distinct items of the documented tier, judged right by a reference`,()=>{
  const g=B3GEN[unit],ref=B3REF[unit],counts={};
  assert.equal(S.SCHOOL_GENERATORS[unit],S.generatorFor(unit));
  for (const tier of [1,2]){
   const seen=new Set();
   for (let seed=1;seed<=200;seed++){
    const s=g(seed,tier);
    assert.ok(s,`seed ${seed} tier ${tier}`);assert.deepEqual(g(seed,tier),s,'same seed, same spec');
    assert.deepEqual(S.generatorFor(unit)(seed,tier),s,'the registered generator is this one');
    assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));assert.equal(S.unitOf(s),unit);
    const r=ref(s);assert.ok(r,`the reference reads ${JSON.stringify(s)}`);
    B3_TIER[unit](s,r,tier);
    const q=S.question(s).plain;
    for (const sys of S.SCHOOL_SYSTEMS){
     assert.equal(S.check(s,r.truth,sys).verdict,'right',`${q} = ${r.truth} (${sys})`);
     assert.equal(S.check(s,r.off,sys).verdict,'wrong',`${q} != ${r.off} (${sys})`);
    }
    assert.ok(S.leaksSchool(s,`The answer is ${r.truth}.`),`the answer leaks: ${q}`);
    assert.ok(!S.leaksSchool(s,q),`the question does not: ${q}`);
    assert.ok(!S.leaksSchool(s,S.withheldSchool(s)),'the withheld line leaks nothing');
    assert.deepEqual(S.specFromQuestion(q),s,`${q} reads back to its spec`);
    seen.add(JSON.stringify(s));
   }
   counts[tier]=seen.size;
  }
  console.log(`# W7c GENERATOR ${unit} distinct specs over seeds 1..200: tier 1 ${counts[1]}, tier 2 ${counts[2]}`);
  assert.ok(counts[1]>=100&&counts[2]>=100,'seeds spread');
  for (const bad of [-1,1.5,NaN,'1',null,undefined,2**32]) assert.equal(g(bad,1),null);
  for (const bad of [0,3,'1',null,1.5]) assert.equal(g(1,bad),null);
 });
}
test('W7c CONFLICTS: the strict leak rule refuses these legit hints, and that cost is accepted and reported',()=>{
 for (const [s,h] of B3_CONFLICTS) assert.equal(S.leaksSchool(s,h),true,`${JSON.stringify(s)} | ${h}`);
 console.log(`# W7c accepted conflicts ${B3_CONFLICTS.length}`);
});

/** Each unit's printed questions, and the specs wellFormed must refuse with the reason's words. */
const B3_PRINTS={
 'ratio-share':[
  [RS1,'Write 12:18 in its simplest form.'],[RH1,'Share 60 in the ratio 2:3.'],[RH2,'Share €45 in the ratio 4:5.'],[RH3,'Share 70 kg in the ratio 2:5.'],
  [ra('60 in 2:3','m'),'Share 60 metres in the ratio 2:3.'],[ra('60 in 2:3','$'),'Share 60 dollars in the ratio 2:3.'],
  [RM1,'Fill in the missing number: 2:3 = ?:15.'],[RM2,'Fill in the missing number: 4:5 = 12:?.'],
 ],
 'unit-rate':[
  [RC1,'5 pens cost €3.50. What do 8 pens cost?'],[RC2,'12 kg cost €30. What does 1 kg cost?'],[RC3,'4 books cost £18. What do 7 books cost?'],
  [RD1,'240 km in 3 hours. How far in 5 hours?'],[RD2,'150 km in 4 hours. How far in 1 hour?'],[rt('3 pens cost 2.40, 1','£'),'3 pens cost £2.40. What does 1 pen cost?'],
 ],
 'area':[
  [AR1,'Find the area of a rectangle 7 cm by 4 cm.'],[AR2,'Find the area of a rectangle 12 metres by 9 metres.'],[AR3,'Find the area of a rectangle 7.5 cm by 4 cm.'],
  [AT1,'Find the area of a triangle, base 10 cm, height 6 cm.'],[AC1,'Find the total area of rectangles 8 cm by 3 cm and 4 cm by 2 cm.'],
 ],
 'mean-range':[
  [SM1,'Work out the mean of 4, 7, 9 and 10.'],[SR1,'Find the range of 12, 5, 9, 20 and 7.'],[SM4,'Work out the mean of 4, 8, 6, 15, 3 and 9.'],[SR3,'Find the range of 9, 3, 6 and 11.'],
 ],
};
const B3_BAD={
 'ratio-share':[
  [ra('2:3'),'already in its simplest form'],[ra('12:12'),'the same'],[ra('0:18'),'cannot read'],[ra('12:18:24'),'cannot read'],[ra('1.2:1.8'),'cannot read'],[ra('12 : 18'),'cannot read'],
  [ra('12:18','kg'),'does not take'],[ra('2:3 = ?:15','€'),'does not take'],[{...RS1,form:'simplest'},'does not take'],[{...RS1,answer:'2:3'},'no answer field'],
  [ra('61 in 2:3'),'whole shares'],[ra('60 in 4:6'),'simplest form'],[ra('60 in 3:3'),'the same'],[ra('5 in 2:3'),'print its own answer'],[ra('2000 in 2:3'),'larger'],[ra('60 in 2:3:5'),'cannot read'],
  [ra('2:3 = ?:16'),'No whole number'],[ra('2:3 = ?:3'),'keeps the given number'],[ra('2:3 = ?:?'),'cannot read'],[ra('2:3 = 10:15'),'cannot read'],[ra('2:4 = ?:8'),'print its own answer'],
  [ra('60 in 2:3','parsec'),'unit is not'],
 ],
 'unit-rate':[
  [rt('1 pens cost 3.50, 8','€'),'already gives'],[rt('5 pens cost 3.50, 5','€'),'same number'],[rt('5 pens cost 3.50, 8','km'),'euros or pounds'],[rt('240 km in 3 h, 5','€'),'euros or pounds'],
  [{shape:'rate',expr:'5 pens cost 3.50, 8'},'euros or pounds'],[rt('5 pens cost 3.5, 8','€'),'cannot read'],[rt('5 sweets cost 3.50, 8','€'),'cannot read'],[rt('3 pens cost 1, 1','€'),'two decimal places'],
  [rt('4 pens cost 8, 2','€'),'print its own answer'],[rt('5 pens cost 0, 8','€'),'zero'],[rt('5 pens cost 2000, 8','€'),'larger'],[rt('240 km in 3 hours, 5','km'),'cannot read'],
  [{...RC1,answer:'5.60'},'no answer field'],[{...RC1,form:'decimal'},'does not take'],[rt('5 pens cost 3.50, 8','parsec'),'unit is not'],
 ],
 'area':[
  [ar('rectangle 7 by 4','cm'),'square unit'],[{shape:'area',expr:'rectangle 7 by 4'},'square unit'],[ar('rectangle 0 by 4'),'zero'],[ar('rectangle 7.25 by 4'),'cannot read'],[ar('square 5'),'cannot read'],
  [ar('triangle 10 by 6'),'cannot read'],[ar('rectangle 999 by 999'),'larger'],[ar('rectangle 2000 by 4'),'cannot read'],[ar('triangle base 2.5 height 3.5'),'two decimal places'],
  [{...AR1,answer:28},'no answer field'],[{...AR1,form:'decimal'},'does not take'],[ar('rectangle 7 by 4','parsec'),'unit is not'],[ar('rectangles 8 by 3'),'cannot read'],
 ],
 'mean-range':[
  [st('mean 1, 2, 4'),'two decimal places'],[st('range 5, 5, 5'),'the same'],[st('mean 4, 7'),'cannot read'],[st('mean 4, 7, 9, 10, 1, 2, 3, 4, 5, 6, 7'),'cannot read'],[st('median 4, 7, 9'),'cannot read'],
  [st('mean 4.5, 7, 9'),'cannot read'],[st('mean 4,7,9'),'cannot read'],[st('mean 04, 7, 9'),'cannot read'],[{...SM1,unit:'cm'},'does not take'],[{...SM1,answer:'7.5'},'no answer field'],[st('mean 1000, 7, 9'),'cannot read'],
 ],
};
for (const unit of B3_UNITS){
 test(`W7c question and wellFormed ${unit}: each item prints plain text and TeX, never its answer, keeps every number through the typesetter, reads back to its spec; poor questions are refused with a reason`,()=>{
  for (const [s,plain] of B3_PRINTS[unit]){
   assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));
   const q=S.question(s);
   assert.equal(q.plain,plain);assert.ok(!S.leaksSchool(s,q.plain),`the question itself is not a leak: ${q.plain}`);
   for (const line of [q.plain,q.tex]){
    let fr=0;T.walk(T.parseMath(line),(x)=>{if(x.t==='frac')fr++;});
    assert.equal(fr,0,`${line}: nothing is stacked`);
    const flat=T.flatten(T.parseMath(line));
    for (const d of s.expr.match(/\d+(?:\.\d+)?/g)) assert.ok(flat.includes(d),`${line} keeps ${d}: ${flat}`);
    for (const r of s.expr.match(/\d+:\d+/g)??[]) assert.ok(flat.replace(/\s/g,'').includes(r),`${line} keeps the ratio ${r}: ${flat}`);
   }
   assert.deepEqual(S.specFromQuestion(q.plain),s,`${q.plain} reads back to its spec`);
  }
  for (const [s,why] of B3_BAD[unit]){const w=S.wellFormed(s);assert.equal(w.ok,false,JSON.stringify(s));assert.ok(w.why.includes(why),`${JSON.stringify(s)}: ${w.why}`);}
 });
}

test('W7c PURITY: random strings through check and leaksSchool on every batch-3 spec never throw and give the same answer twice',()=>{
 let seed=5151;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const alphabet=['0','1','2','3','4','6','9',':','.',',',' ','%','/','-','€','£','x','=','and','&','to','kg','cm','cm2','?','of',' by '];
 const specs=Object.values(B3_SPELLINGS).flat().map((r)=>r[0]).filter((s,i,all)=>all.findIndex((x)=>JSON.stringify(x)===JSON.stringify(s))===i);
 for (let i=0;i<300;i++){
  let s='';const len=Math.floor(rnd()*20);for(let k=0;k<len;k++)s+=alphabet[Math.floor(rnd()*alphabet.length)];
  for (const sp of specs){
   for (const sys of S.SCHOOL_SYSTEMS){const v=S.check(sp,s,sys);assert.ok(['right','wrong','unsure'].includes(v.verdict));assert.deepEqual(S.check(sp,s,sys),v);}
   const l=S.leaksSchool(sp,s);assert.equal(typeof l,'boolean');assert.equal(S.leaksSchool(sp,s),l);
  }
  const got=S.specFromQuestion(s);assert.ok(got===null||S.wellFormed(got).ok);
 }
});

test('W7c typeset: a square unit typed flat after an amount prints with its power - 28 cm2 and 12 m2 as cm² and m², never beside a number 2',()=>{
 const sq=(line)=>{const out=[];T.walk(T.parseMath(line),(x)=>{if(x.t==='text'&&x.sup)out.push(`${x.v}^${T.flatten(x.sup)}`);});return out;};
 for (const [line,want] of [['28 cm2',['cm^2']],['12 m2',['m^2']],['7.5 cm2',['cm^2']],['28 cm^2',['cm^2']],['28 cm²',['cm^2']],['8 cm3',['cm^3']],['28 cm2.',['cm^2']],['x = 28 cm2',['cm^2']]]) assert.deepEqual(sq(line),want,line);
 for (const line of ['cm2','2 cm23','3 m 2','28 cm 2','28 cm25']) assert.deepEqual(sq(line),[],line);
});

// ------------------------------------------------------------------ v2 M2b: the units beyond the school path - Pythagoras' theorem
// Each expected verdict worked by hand first (the answer and each slip's value are in the comments). The unit is not on the path
// yet: the sweep (tools/gcse-units-test.cjs) decides whether it ships.
const py=(expr,unit='cm')=>({shape:'pythagoras',expr,unit});
const PA=py('longest 6 8');        // 10 cm. sides added 14; squares added, no root 100
const PB=py('shorter 10 6');       // 8 cm. sides added 16; squares taken away, no root 64; squares added 136
const PC=py('longest 5 12','mm');  // 13 mm. added 17; no root 169
const PD=py('shorter 13 5','m');   // 12 m. added 18; no root 144; squares added 194
const PE=py('longest 9 12');       // 15 cm. added 21; no root 225
const PF=py('shorter 17 8');       // 15 cm. added 25; no root 225; squares added 353
const PG=py('longest 30 40','m');  // 50 m. added 70; no root 2500
const PH=py('shorter 25 7');       // 24 cm. added 32; no root 576; squares added 674
const PYTH_SPELLINGS=[
 // 6 and 8 -> 10: the number alone or with its own length unit is right, in any equal form
 [PA,'10','uk','right'],[PA,'10 cm','uk','right'],[PA,'10cm','uk','right'],[PA,'10 centimetres','uk','right'],[PA,'x = 10','uk','right'],[PA,'10.0','us','right'],[PA,'10,0','cz','right'],[PA,'= 10','de','right'],[PA,'20/2','uk','right'],[PA,'10.','uk','right'],
 [PA,'14','uk','wrong','pyth-sides-added'],[PA,'14 cm','uk','wrong','pyth-sides-added'],[PA,'100','uk','wrong','pyth-no-root'],[PA,'100 cm','uk','wrong','pyth-no-root'],
 [PA,'9','uk','wrong'],[PA,'11','uk','wrong'],[PA,'-10','uk','wrong'],[PA,'9.9','uk','wrong'],[PA,'6','uk','wrong'],[PA,'48','uk','wrong'],[PA,'28','uk','wrong'],
 [PA,'10 m','uk','unsure'],[PA,'10 mm','uk','unsure'],[PA,'100 cm2','uk','unsure'],[PA,'10%','uk','unsure'],[PA,'5:10','uk','unsure'],[PA,'ten','uk','unsure'],[PA,'','uk','unsure'],[PA,'about 10','uk','unsure'],[PA,'10,0','uk','unsure'],[PA,'√100','uk','unsure'],[PA,'10 or 14','uk','unsure'],
 // 10 and 6 -> a shorter side 8
 [PB,'8','uk','right'],[PB,'8 cm','uk','right'],[PB,'8.0','uk','right'],[PB,'8,0','de','right'],[PB,'16','uk','wrong','pyth-sides-added'],[PB,'64','uk','wrong','pyth-no-root'],[PB,'136','uk','wrong','pyth-squares-added'],
 [PB,'10','uk','wrong'],[PB,'4','uk','wrong'],[PB,'8 m','uk','unsure'],[PB,'80%','uk','unsure'],
 // 5 mm and 12 mm -> 13 mm
 [PC,'13','uk','right'],[PC,'13 mm','uk','right'],[PC,'13 millimetres','uk','right'],[PC,'13 cm','uk','unsure'],[PC,'17','uk','wrong','pyth-sides-added'],[PC,'169','uk','wrong','pyth-no-root'],[PC,'12','uk','wrong'],
 // the longest side 13 m and a shorter side 5 m -> 12 m
 [PD,'12','uk','right'],[PD,'12 m','uk','right'],[PD,'12 metres','uk','right'],[PD,'12 metre','uk','right'],[PD,'12 km','uk','unsure'],[PD,'18','uk','wrong','pyth-sides-added'],[PD,'144','uk','wrong','pyth-no-root'],[PD,'194','uk','wrong','pyth-squares-added'],[PD,'8','uk','wrong'],
 // 9 and 12 -> 15
 [PE,'15','uk','right'],[PE,'15 cm','uk','right'],[PE,'21','uk','wrong','pyth-sides-added'],[PE,'225','uk','wrong','pyth-no-root'],[PE,'3','uk','wrong'],
 // 17 and 8 -> 15: the unrooted c² - b² is 225
 [PF,'15','uk','right'],[PF,'25','uk','wrong','pyth-sides-added'],[PF,'225','uk','wrong','pyth-no-root'],[PF,'353','uk','wrong','pyth-squares-added'],[PF,'15.5','uk','wrong'],
 // 30 m and 40 m -> 50 m; 2500 written with a thousands mark
 [PG,'50','uk','right'],[PG,'50 m','uk','right'],[PG,'70','uk','wrong','pyth-sides-added'],[PG,'2500','uk','wrong','pyth-no-root'],[PG,'2,500','uk','wrong','pyth-no-root'],[PG,'2 500','cz','wrong','pyth-no-root'],[PG,'2500 m2','uk','unsure'],
 // 25 and 7 -> 24
 [PH,'24','uk','right'],[PH,'32','uk','wrong','pyth-sides-added'],[PH,'576','uk','wrong','pyth-no-root'],[PH,'674','uk','wrong','pyth-squares-added'],[PH,'25','uk','wrong'],
];
const PYTH_LEAKS=[
 [PA,'The answer is 10 cm.'],[PA,'It is 10.'],[PA,'Ten centimetres.'],[PA,'The square root of 100 is 10.'],[PA,'So the longest side is 10'],[PA,'√100 = 10'],[PA,'20 ÷ 2'],[PA,'Half of 20.'],[PA,'5 × 2'],[PA,'10.0 cm'],[PA,'It comes to 1000%.'],
 [PB,'The missing side is 8.'],[PB,'Eight centimetres.'],[PB,'It is 8 cm.'],[PB,'16 ÷ 2'],[PB,'The square root of 64 is 8.'],
 [PC,'It is 13 mm.'],[PC,'Thirteen.'],[PD,'It is 12 metres.'],[PD,'The root of 144 is 12.'],[PE,'It is 15.'],[PG,'The longest side is 50 m.'],[PH,'The other side is 24 cm.'],
];
const PYTH_LEGIT=[
 [PA,'Square both shorter sides.'],[PA,'Square 6 and 8 and add them.'],[PA,'6 × 6 = 36'],[PA,'8 × 8 = 64'],[PA,'36 + 64 = 100'],[PA,'Then take the square root of the total.'],[PA,'Add the squares of the two shorter sides.'],
 [PA,'The longest side is opposite the right angle.'],[PA,'Your answer is in cm.'],[PA,'The longest side is longer than both of the others.'],[PA,'Adding 6 and 8 does not use the squares.'],[PA,'The sum of the squares is 100.'],
 [PB,'Square the longest side and the shorter side.'],[PB,'10 × 10 = 100'],[PB,'6 × 6 = 36'],[PB,'100 - 36 = 64'],[PB,'Take the square of the shorter side away from the square of the longest.'],[PB,'The missing side is shorter than the longest side, 10 cm.'],
 [PC,'5 × 5 = 25'],[PC,'12 × 12 = 144'],[PC,'25 + 144 = 169'],[PC,'Your answer is in mm.'],
 [PD,'13 × 13 = 169'],[PD,'5 × 5 = 25'],[PD,'169 - 25 = 144'],[PD,'Your answer is in metres.'],
 [PE,'9 × 9 = 81'],[PE,'12 × 12 = 144'],[PE,'81 + 144 = 225'],[PH,'25 × 25 = 625'],[PH,'7 × 7 = 49'],[PH,'625 - 49 = 576'],
];
const PYTH_PRINTS=[
 [PA,'A right-angled triangle has shorter sides 6 cm and 8 cm. Find the longest side.'],
 [PB,'A right-angled triangle has longest side 10 cm and a shorter side 6 cm. Find the other shorter side.'],
 [PC,'A right-angled triangle has shorter sides 5 mm and 12 mm. Find the longest side.'],
 [PD,'A right-angled triangle has longest side 13 metres and a shorter side 5 metres. Find the other shorter side.'],
 [PG,'A right-angled triangle has shorter sides 30 metres and 40 metres. Find the longest side.'],
];
const PYTH_BAD=[
 [py('longest 6 7'),'not a whole number'],[py('shorter 10 7'),'not a whole number'],[py('shorter 6 10'),'not longer'],[py('shorter 6 6'),'not longer'],[py('longest 75 100'),'longer than a school question'],[py('shorter 101 20'),'longer than a school question'],
 [py('longest 6 8','kg'),'mm, cm or metres'],[py('longest 6 8','cm2'),'mm, cm or metres'],[py('longest 6 8','km'),'mm, cm or metres'],[{shape:'pythagoras',expr:'longest 6 8'},'mm, cm or metres'],
 [py('longest 0 8'),'cannot read'],[py('longest 6.0 8'),'cannot read'],[py('longest 6 8 10'),'cannot read'],[py('hypotenuse 6 8'),'cannot read'],[py('longest 06 8'),'cannot read'],[py('longest 1000 8'),'cannot read'],
 [{...PA,answer:10},'no answer field'],[{...PA,form:'decimal'},'does not take'],[{...PA,to:'decimal'},'does not take'],
];
/** The slip values a hand-worked reference gives for a Pythagoras spec: integers throughout (Math.round on a root is checked by squaring). */
function pyRef(s){
 const m=/^(longest|shorter) (\d+) (\d+)$/.exec(s.expr);if(!m||s.shape!=='pythagoras')return null;
 const x=+m[2],y=+m[3],root=(n)=>{const r=Math.round(Math.sqrt(n));assert.equal(r*r,n,`${s.expr}: a whole root`);return r;};
 if(m[1]==='longest'){const t=root(x*x+y*y);return {find:'longest',x,y,truth:t,slips:{'pyth-sides-added':x+y,'pyth-no-root':x*x+y*y},nums:[x,y]};}
 const t=root(x*x-y*y);return {find:'shorter',x,y,truth:t,slips:{'pyth-sides-added':x+y,'pyth-no-root':x*x-y*y,'pyth-squares-added':x*x+y*y},nums:[x,y]};
}
test(`M2b SPELLINGS Pythagoras: ${PYTH_SPELLINGS.length} written answers, zero false-right, zero false-wrong`,()=>{spellings('PYTH_SPELLINGS',PYTH_SPELLINGS,'pythagoras');});
test(`M2b LEAKS Pythagoras: ${PYTH_LEAKS.length} hints that give the answer away are refused; ${PYTH_LEGIT.length} legit hints pass`,()=>{
 const missed=PYTH_LEAKS.filter(([s,h])=>!S.leaksSchool(s,h)).map(([s,h])=>`${s.expr} | ${h}`);
 const flagged=PYTH_LEGIT.filter(([s,h])=>S.leaksSchool(s,h)).map(([s,h])=>`${s.expr} | ${h}`);
 console.log(`# M2b LEAKS Pythagoras: ${PYTH_LEAKS.length} (missed ${missed.length}), LEGIT ${PYTH_LEGIT.length} (flagged ${flagged.length})`);
 assert.deepEqual(missed,[]);assert.deepEqual(flagged,[]);
 for (const [s] of [...PYTH_LEAKS,...PYTH_LEGIT]) assert.equal(S.unitOf(s),'pythagoras');
});
test('M2b question and wellFormed Pythagoras: one plain sentence, the hyphen kept through the typesetter, never the answer, read back to its spec; poor questions refused with a reason',()=>{
 for (const [s,plain] of PYTH_PRINTS){
  assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));
  const q=S.question(s);assert.equal(q.plain,plain);assert.ok(!S.leaksSchool(s,q.plain),`the question itself is not a leak: ${q.plain}`);
  for (const line of [q.plain,q.tex]){
   const flat=T.flatten(T.parseMath(line));
   assert.ok(flat.includes('right-angled'),`${line}: the hyphen is a hyphen, not a minus: ${flat}`);
   for (const d of s.expr.match(/\d+/g)) assert.ok(flat.includes(d),`${line} keeps ${d}`);
   assert.ok(/ (cm|mm|metres)\b/.test(flat),`${line} keeps its unit: ${flat}`);
  }
  assert.deepEqual(S.specFromQuestion(q.plain),s,`${q.plain} reads back to its spec`);
 }
 for (const [s,why] of PYTH_BAD){const w=S.wellFormed(s);assert.equal(w.ok,false,JSON.stringify(s));assert.ok(w.why.includes(why),`${JSON.stringify(s)}: ${w.why}`);}
 for (const t of ['A right-angled triangle has shorter sides 6 cm and 8 m. Find the longest side.','A right-angled triangle has shorter sides 6 and 8. Find the longest side.','A right-angled triangle has shorter sides 6 cm and 7 cm. Find the longest side.',
  'A right-angled triangle has shorter sides 6.5 cm and 8 cm. Find the longest side.','A triangle has shorter sides 6 cm and 8 cm. Find the longest side.','A right-angled triangle has shorter sides 6 cm and 8 cm. Find the hypotenuse.',
  'A right-angled triangle has longest side 6 cm and a shorter side 10 cm. Find the other shorter side.','Find the longest side of a right-angled triangle with shorter sides 6 cm and 8 cm.','A ladder 10 m long leans against a wall. How high up does it reach?'])
  assert.equal(S.specFromQuestion(t),null,t);
 assert.deepEqual(S.specFromQuestion('A right angled triangle has shorter sides 6 centimetres and 8 centimetres. Find the longest side.'),PA,'right angled, centimetres');
 assert.deepEqual(S.specFromQuestion('a right-angled triangle has longest side 10 cm and one shorter side 6 cm. find the other shorter side'),PB,'one shorter side, lower case');
});
test('M2b GENERATOR Pythagoras: seeds 1..300 for tiers 1 and 2 give well-formed, distinct items of the documented tier, judged right by a reference, every slip reachable',()=>{
 const counts={},units=new Set(),slipsSeen={};
 for (const tier of [1,2]){
  const seen=new Set();
  for (let seed=1;seed<=300;seed++){
   const s=S.genPythagoras(seed,tier);
   assert.ok(s,`seed ${seed} tier ${tier}`);assert.deepEqual(S.genPythagoras(seed,tier),s,'same seed, same spec');
   assert.deepEqual(S.wellFormed(s),{ok:true},JSON.stringify(s));assert.equal(S.unitOf(s),'pythagoras');
   const r=pyRef(s);assert.ok(r,JSON.stringify(s));units.add(s.unit);assert.ok(['mm','cm','m'].includes(s.unit));
   if(tier===1)assert.ok(r.find==='longest'&&r.truth<=50,`tier 1: the longest side from the two shorter, at most 50: ${s.expr}`);
   else assert.ok(r.find==='shorter'&&r.x<=100&&r.y<r.x,`tier 2: a shorter side: ${s.expr}`);
   assert.ok(!r.nums.includes(r.truth),'the question does not print its answer');
   const q=S.question(s).plain;
   for (const sys of S.SCHOOL_SYSTEMS){
    assert.equal(S.check(s,String(r.truth),sys).verdict,'right',`${q} = ${r.truth} (${sys})`);
    assert.equal(S.check(s,String(r.truth+1),sys).verdict,'wrong',`${q} != ${r.truth+1} (${sys})`);
    for (const [id,v] of Object.entries(r.slips)){const got=S.check(s,String(v),sys);assert.deepEqual([got.verdict,got.slip],['wrong',id],`${q}: ${v} is ${id} (${sys})`);slipsSeen[id]=(slipsSeen[id]||0)+1;}
   }
   assert.ok(S.leaksSchool(s,`The answer is ${r.truth}.`),`the answer leaks: ${q}`);assert.ok(!S.leaksSchool(s,q),`the question does not: ${q}`);assert.ok(!S.leaksSchool(s,S.withheldSchool(s)),'the withheld line leaks nothing');
   assert.deepEqual(S.specFromQuestion(q),s,`${q} reads back to its spec`);
   assert.ok(T.flatten(T.parseMath(q)).includes('right-angled'));
   seen.add(JSON.stringify(s));
  }
  counts[tier]=seen.size;
 }
 console.log(`# M2b GENERATOR Pythagoras distinct specs over seeds 1..300: tier 1 ${counts[1]}, tier 2 ${counts[2]}; units ${[...units].sort()}`);
 assert.ok(counts[1]>=60&&counts[2]>=150,'seeds spread');
 assert.deepEqual([...units].sort(),['cm','m','mm']);
 assert.deepEqual(Object.keys(slipsSeen).sort(),[...S.SCHOOL_UNIT_SLIPS.pythagoras].sort());
 for (const bad of [-1,1.5,NaN,'1',null,undefined,2**32]) assert.equal(S.genPythagoras(bad,1),null);
 for (const bad of [0,3,'1',null,1.5]) assert.equal(S.genPythagoras(1,bad),null);
});
test('M2b Pythagoras: the unit has a withheld line with no digit or number word, its slips carry no value, and nothing here is on the path or in the generators yet',()=>{
 const line=S.SCHOOL_WITHHELD.pythagoras;assert.ok(line&&!/\d/.test(line));
 assert.equal(S.withheldSchool(PA),line);assert.equal(S.withheldSchool(PH),line);
 for (const id of S.SCHOOL_UNIT_SLIPS.pythagoras){const sl=S.SCHOOL_SLIPS.find((x)=>x.id===id);assert.ok(sl&&!/\d/.test(sl.name+sl.says+sl.points)&&/^[A-Z][^]*\.$/.test(sl.says),id);}
 for (const sh of ['pythagoras']) assert.ok(S.SCHOOL_SHAPES.includes(sh));
 assert.equal(S.slipValue(PA,'pyth-sides-added'),'14');assert.equal(S.slipValue(PA,'pyth-no-root'),'100');assert.equal(S.slipValue(PA,'pyth-squares-added'),null,'a longest-side item shows no squares-added slip');
 assert.equal(S.slipValue(PB,'pyth-squares-added'),'136');assert.equal(S.slipValue(PB,'area-no-half'),null,'another unit\'s slip');
 assert.equal(S.slipValue(py('longest 6 7'),'pyth-no-root'),null,'a spec that is not well formed shows nothing');
 assert.deepEqual(Object.keys(S.GCSE_GENERATORS).sort(),['pythagoras']);
});
test('M2b PURITY Pythagoras: random strings through check and leaksSchool never throw and give the same answer twice',()=>{
 let seed=2024;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const alphabet=['0','1','2','4','6','8','.',',',' ','%','/','-','x','=','cm','m','mm','cm2','metres','√','²','^2',':','and','or','The answer is ','square root of '];
 for (let i=0;i<300;i++){
  let s='';const len=Math.floor(rnd()*14);for(let k=0;k<len;k++)s+=alphabet[Math.floor(rnd()*alphabet.length)];
  for (const sp of [PA,PB,PC,PD]){
   for (const sys of S.SCHOOL_SYSTEMS){const v=S.check(sp,s,sys);assert.ok(['right','wrong','unsure'].includes(v.verdict));assert.deepEqual(S.check(sp,s,sys),v);}
   const l=S.leaksSchool(sp,s);assert.equal(typeof l,'boolean');assert.equal(S.leaksSchool(sp,s),l);
  }
  const got=S.specFromQuestion(s);assert.ok(got===null||S.wellFormed(got).ok);
 }
});
test('M2b typeset: a hyphen between two words stays a hyphen, and a minus between numbers or letters is still a minus',()=>{
 const kinds=(line)=>T.parseMath(line).filter((x)=>x.t==='bin'||x.v==='-').map((x)=>`${x.t}:${x.v}`);
 assert.deepEqual(kinds('A right-angled triangle'),['ord:-']);assert.deepEqual(kinds('well-known and right-angled'),['ord:-','ord:-']);
 assert.deepEqual(kinds('6 - 4'),['bin:−']);assert.deepEqual(kinds('x-y'),['bin:−']);assert.deepEqual(kinds('x - 4'),['bin:−']);assert.deepEqual(kinds('right - angled'),['bin:−']);
 assert.equal(T.flatten(T.parseMath('A right-angled triangle')),'A right-angled triangle');
});
