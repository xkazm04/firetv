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
 for (const s of S.SCHOOL_SLIPS) assert.ok((bySlip[s.id]||0)>=2,`slip ${s.id} detected at least twice`);
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
