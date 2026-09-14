/** Math Buddy's offline rules. Run with npm test in desk/ (directly: node tools/maths-rules-test.cjs). No model is called; a disposable data directory, never desk/data. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/maths-rules',String(Date.now()));
const {verify,evaluate}=require(path.join(root,'src/lib/desk/verify.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts')),eye=require(path.join(root,'src/lib/engines/vision.ts'));
let answer,seen=[];engine.text=(req)=>{seen.push(req);return answer(req);};
let looked;eye.vision=(req)=>looked(req);
const {makeItems}=require(path.join(root,'src/lib/desk/items.ts'));
const {markSet}=require(path.join(root,'src/lib/desk/mark.ts'));
const {hint}=require(path.join(root,'src/lib/desk/hint.ts'));
const {explain}=require(path.join(root,'src/lib/desk/explain.ts'));
const {slip}=require(path.join(root,'src/lib/rules/maths.ts'));
const {getLearner}=require(path.join(root,'src/lib/session/learners.ts'));
const reply=(json)=>async()=>({json,provider:'test',ms:1});

test('verify accepts a value that satisfies the equation and rejects one that does not',()=>{
 assert(verify('2x+3=11','4'));assert(!verify('2x+3=11','5'));
 assert(verify('x+5=2','-3'));assert(verify('2x=7','7/2'));assert(!verify('2x=7','3'));
 assert(verify('3x=1','1/3'));assert(!verify('3x=1','0.33'));
 assert(verify('7=2x-3','5'));assert(verify('4(x-2)=2x+6','7'));
});
test('verify reads implicit multiplication, powers and the characters a camera produces',()=>{
 assert(verify('3(x-1)=6','3'));assert(verify('(x+1)(x-2)=0','2'));assert(verify('(x+1)(x-2)=0','-1'));
 assert(verify('x²=9','-3'));assert(verify('x^2=9','3'));assert(verify('2x^2=18','3'));assert(verify('-x^2=-9','3'));
 assert(verify('2x − 3 = 5','4'));assert(verify('3×x=12','4'));assert(verify('x÷2=4','8'));assert(verify('2[x+1]=8','3'));
 assert.equal(evaluate('2^3^2',0),512);assert.equal(evaluate('.5x',4),2);assert.equal(evaluate('2(3)',0),6);
});
test('verify never throws on input it cannot read and never says yes to it',()=>{
 for(const [eq,v] of [['2x+3','4'],['x=1=1','1'],['2x+=11','4'],['2(x+3=11','4'],['2x+3=11',''],['2x+3=11','x = 4'],['2x+3=11','four'],['1/x=1','0'],['y=4','4'],[undefined,'4'],['x=4',null]])assert.equal(verify(eq,v),false,`${eq} with ${v}`);
 for(const e of ['','  ','2+','()','.','1/0','x$'])assert.equal(evaluate(e,1),null,e);
});
test('a generated item whose stated answer is wrong never reaches the practice set',async()=>{
 answer=reply({items:[{question:'2x+3=11',answer:'4'},{question:'x-5=2',answer:'3'},{question:'3x = 18',answer:'x = 6'},{question:'2x+3 = 11',answer:'4'},{question:'x/2=4',answer:''},{question:'x+1=10',answer:'9'}]});
 const r=await makeItems('linear-one-step','maths-items',3);
 assert.deepEqual(r.items.map(i=>[i.n,i.question,i.answer]),[[1,'2x+3=11','4'],[2,'3x = 18','6'],[3,'x+1=10','9']]);
 assert.equal(r.tries,1);
});

const sheet={topic:'linear-one-step',marked:false,items:[['2x+3=11','4'],['x-5=2','7'],['3x=18','6'],['x+1=10','9'],['5x=35','7'],['x/2=4','8']].map(([question,answer],ix)=>({n:ix+1,question,answer}))};
const marks=[
 {n:1,studentAnswer:'4',studentWorking:'2x=8',verdict:'right',solution:'4',slip:'sign-lost-moving'},
 {n:2,studentAnswer:'x = -3',studentWorking:'x=2-5',verdict:'wrong',solution:'7',slip:'sign-lost-moving'},
 {n:3,studentAnswer:'5',studentWorking:'',verdict:'wrong',solution:'6',slip:'bracket-first-term-only'},
 {n:4,studentAnswer:'9',studentWorking:'',verdict:'right',solution:'8',slip:'unclear'},
 {n:5,studentAnswer:'6',studentWorking:'',verdict:'right',solution:'7',slip:'unclear'},
];
test('marking believes the substitution, and says nothing when the marker and the substitution disagree',async()=>{
 looked=reply({items:marks});
 const r=await markSet('img',sheet,'maths-mark');
 assert.deepEqual(r.items.map(i=>i.verdict),['right','wrong','wrong','unsure','unsure','unsure']);assert.equal(r.unsure,3);
 assert.equal(r.items[0].said,'Number 1 is right.');assert.equal(r.items[0].slip,undefined);
 assert.equal(r.items[1].studentAnswer,'-3');assert.equal(r.items[1].slip,'sign-lost-moving');assert.equal(r.items[1].said,slip('sign-lost-moving').says);
 assert.equal(r.items[2].slip,undefined,'a slip from another topic is dropped');assert.match(r.items[2].said,/How did you get there\?/);
 for(const i of r.items.slice(3)){assert.equal(i.slip,undefined);assert.match(i.said,/How did you get there\?/);}
});
test('no marked line carries a value, and only settled items reach the learner record',async()=>{
 looked=reply({items:marks});
 const r=await markSet('img',sheet,'maths-record');
 for(const i of r.items){const numbers=(i.said.match(/-?\d+(\/\d+)?/g)??[]).filter(v=>v!==String(i.n));assert.deepEqual(numbers,[],`item ${i.n} said: ${i.said}`);}
 const me=getLearner('maths-record'),rec=me.skills['linear-one-step'];
 assert.equal(rec.seen,3);assert.equal(rec.right,1);assert.deepEqual(rec.slips,['sign-lost-moving']);
 assert.equal(me.history.at(-1).detail,'1 of 6 right');
 looked=reply({items:'not json'});const blank=await markSet('img',sheet,'maths-blank');
 assert.equal(blank.unsure,6);assert.equal(getLearner('maths-blank').skills['linear-one-step'],undefined);
});
test('hints withhold the answer and the second hint must go one step further',async()=>{
 seen=[];answer=reply({hint:'Look at what is added to 2x.',what_to_try_next:'Undo it on both sides.'});
 const h1=await hint('maths','2x+3=11',{});
 assert.equal(h1.hint,'Look at what is added to 2x.');assert.equal(h1.next,'Undo it on both sides.');
 await hint('maths','2x+3=11',{previous:h1.hint,askedQ:'where do I start?'});
 const [first,second]=seen;
 for(const r of seen)assert.match(r.system,/never state the final answer, never write the completed solution/);
 assert.match(first.prompt,/Give the FIRST hint/);assert.doesNotMatch(first.prompt,/ONE STEP FURTHER/);
 assert.match(second.prompt,/«Look at what is added to 2x\.»/);assert.match(second.prompt,/ONE STEP FURTHER/);assert.match(second.prompt,/still stop short of the answer/);
 assert.match(second.prompt,/The student asked: "where do I start\?"/);
});
test('the reply to an explanation withholds the verdict and keeps only this topic\'s slips',async()=>{
 seen=[];answer=reply({reply:'  Look again at the line where the 5 moved.  ',slip:'sign-lost-moving'});
 const kept=await explain('x-5=2','I took five away','linear-one-step','maths-explain');
 assert.equal(kept.reply,'Look again at the line where the 5 moved.');assert.equal(kept.slip,'sign-lost-moving');
 assert.match(seen[0].system,/never state the final answer, never give the completed line, never say whether they are right or wrong/);
 for(const s of ['bracket-first-term-only','unclear','made-up'])(answer=reply({reply:'Check that step.',slip:s}),assert.equal((await explain('x-5=2','','linear-one-step','maths-explain')).slip,undefined,s));
});
