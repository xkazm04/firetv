/**
 * Math Buddy's second go (challenge-2026-10-05 math-buddy-B): a ringed item takes ONE typed answer on the phone, code judges it
 * (rules/kinds judgeItem, the same judge marking uses), and the item's ring wears a tick - the first attempt stays the record.
 * Run with npm test in desk/ (directly: node tools/maths-second-test.cjs). The store and the learner file write to a scratch
 * DESK_DATA_DIR under the OS temp dir, never desk/data; the vision and text engines are stubbed to throw: a second go is
 * judged in code and never calls a model.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-maths-second-'));
const DATA=process.env.DESK_DATA_DIR;
const src=(f)=>path.join(root,'src',f);
const engine=require(src('lib/engines/text.ts')),eye=require(src('lib/engines/vision.ts'));
let modelCalls=0;
engine.text=()=>{modelCalls++;throw new Error('text: a second go must not call a model');};
eye.vision=()=>{modelCalls++;throw new Error('vision: a second go must not call a model');};
const store=()=>require(src('lib/session/store.ts'));
const maths=()=>require(src('lib/rules/maths.ts'));
const post=(f,body)=>require(src(f)).POST(new Request('http://desk/api',{method:'POST',body:JSON.stringify(body)}));
const second=(body)=>post('app/api/second/route.ts',body);
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(DATA,{recursive:true,force:true});});

const ID='second-scratch',TOPIC='linear-one-step';
const Q=['x+3=7','x-5=2','3x=18','x/2=4','x+1=10','5x=35'];
/** A marked set as the desk keeps it: item 2 ('x-5=2') is the wrong one, item 4 too; the rest are right. */
const markedSet=(patch={})=>({topic:TOPIC,marked:true,items:Q.map((question,ix)=>{
 const wrong=ix===1||ix===3;
 return {n:ix+1,question,studentAnswer:wrong?'5':String(ix+2),studentWorking:'x = '+(wrong?'5':String(ix+2)),verdict:wrong?'wrong':'right',...(wrong?{slip:'sign-lost-moving'}:{}),said:`Number ${ix+1}.`,...(patch[ix+1]??{})};
})});
const seat=(practice,extra={})=>{
 store();
 globalThis.__desk.session={...store().fresh(),learner:{id:ID,name:'Ema'},profiles:[{id:ID,name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']}],
  screen:'walk',walkIx:1,subject:'maths',joined:true,practice,topic:practice?practice.topic:null,...extra};
};
const item=(n)=>store().getSession().practice.items.find((i)=>i.n===n);
const learners=()=>{const f=path.join(DATA,'learners.json');return fs.existsSync(f)?fs.readFileSync(f,'utf8'):null;};
const plain=(t)=>typeof t==='string'&&t.trim().length>=12&&/[.?!]$/.test(t.trim());

test('case 1: secondProblem - null for a wrong item with no second go; a plain desk sentence for right, unsure and a spent go',()=>{
 const {secondProblem}=maths();
 assert.equal(typeof secondProblem,'function','rules/maths exports secondProblem');
 assert.equal(secondProblem({n:2,question:'x-5=2',verdict:'wrong'}),null);
 for(const it of [{n:1,question:'x+3=7',verdict:'right'},{n:4,question:'x/2=4',verdict:'unsure'},{n:2,question:'x-5=2',verdict:'wrong',second:'right'},{n:2,question:'x-5=2',verdict:'wrong',second:'wrong'},{n:3,question:'3x=18'}]){
  const t=secondProblem(it);
  assert.ok(plain(t),`a plain sentence for ${JSON.stringify(it)}: ${t}`);
  assert.ok(!/\d{2,}|x\s*=/.test(t),'no value in it');
 }
});

test('case 3: a typed second go on a wrong item is judged in code, no model: the session holds second, the learner file is untouched',async()=>{
 const before=learners(),calls=modelCalls;
 seat(markedSet());
 const ok=await second({n:2,answer:'7'});
 assert.equal(ok.status,200);
 const body=await ok.json();
 assert.deepEqual(body,{ok:true},'no verdict word, no value in the body');
 assert.equal(item(2).second,'right');
 assert.equal(item(2).verdict,'wrong','the first attempt stays');
 seat(markedSet());
 const no=await second({n:2,answer:'5'});
 assert.equal(no.status,200);assert.deepEqual(await no.json(),{ok:true});
 assert.equal(item(2).second,'wrong');
 assert.equal(learners(),before,'learners.json is byte-identical (skills, history, digest)');
 assert.equal(modelCalls,calls,'no model was asked');
});

test('case 4: a refusal gives a plain desk sentence and changes nothing; an unreadable answer does not spend the go',async()=>{
 const refuse=async(label,practice,body,statuses=[400,409])=>{
  seat(practice);const was=JSON.stringify(store().getSession().practice);
  const r=await second(body);const j=await r.json();
  assert.ok(statuses.includes(r.status),`${label}: ${r.status}`);
  assert.ok(plain(j.error),`${label}: a plain sentence, got ${JSON.stringify(j)}`);
  assert.equal(JSON.stringify(store().getSession().practice),was,`${label}: nothing changed`);
 };
 await refuse('blank',markedSet(),{n:2,answer:'   '});
 await refuse('missing answer',markedSet(),{n:2});
 await refuse('unreadable',markedSet(),{n:2,answer:'seven'});
 await refuse('too long',markedSet(),{n:2,answer:'1'.repeat(require(src('lib/rules/maths.ts')).TYPED_ANSWER_MAX+1)});
 await refuse('no marked set',{...markedSet(),marked:false},{n:2,answer:'7'});
 await refuse('no set at all',null,{n:2,answer:'7'});
 await refuse('a right item',markedSet(),{n:1,answer:'4'});
 await refuse('an unknown item',markedSet(),{n:9,answer:'4'});
 await refuse('a spent go',markedSet({2:{second:'wrong'}}),{n:2,answer:'7'});
 await refuse('a spent go that held',markedSet({2:{second:'right'}}),{n:2,answer:'7'});
 // an unreadable answer is not the go: 'seven', then '7'
 seat(markedSet());
 assert.equal((await second({n:2,answer:'seven'})).status,400);assert.equal(item(2).second,undefined);
 assert.equal((await second({n:2,answer:'7'})).status,200);assert.equal(item(2).second,'right');
});

test('case 5: a screen can never post a second-go verdict - only the route that checked the answer can',async()=>{
 seat(markedSet());
 const r=await post('app/api/session/route.ts',{type:'practice.second',n:2,verdict:'right'});
 assert.equal(r.status,403);
 assert.equal(item(2).second,undefined,'nothing landed');
});

/** Marking landed on the learner's record, as the typed path does it: 1, 3 and 5 right; 2, 4 and 6 wrong. */
const landed=()=>{
 const {markTyped}=require(src('lib/desk/mark.ts'));
 const r=markTyped(['4','5','6','1','9','1'],{topic:TOPIC,marked:false,items:Q.map((question,ix)=>({n:ix+1,question}))},ID,()=>true,'uk');
 assert.equal(r.landed,true);
 assert.deepEqual(r.items.map((i)=>i.verdict),['right','wrong','right','wrong','right','wrong']);
 return {topic:TOPIC,marked:true,items:r.items};
};

test('GUARD case 8: with item 2 fixed, Tonight\'s Marked hero, the history line and the digest entry still read the first attempt',()=>{
 const rows=require(src('tv/mathsRows.ts'));
 const {mathsEntry}=require(src('lib/rules/digest.ts'));
 const practice=landed();
 const fixed={...practice,items:practice.items.map((it)=>it.n===2?{...it,second:'right'}:it)};
 seat(practice);const plainCard=rows.continueCard(store().getSession());
 seat(fixed);const s=store().getSession();
 assert.match(plainCard.d,/3 of 6 right/);
 assert.equal(rows.continueCard(s).d,plainCard.d,"Tonight's Marked hero reads '3 of 6 right' either way");
 assert.equal(maths().rightLine(s.practice.items),'3 of 6 right');
 assert.deepEqual(mathsEntry(TOPIC,s.practice.items,false,1),mathsEntry(TOPIC,practice.items,false,1),'the same digest entry');
});

test('case 8b: a second go never calls recordAttempt - the whole learner record is as marking left it',async()=>{
 const {getLearner}=require(src('lib/session/learners.ts'));
 const practice=landed();
 seat(practice);
 const seen=getLearner(ID).skills[TOPIC].seen,record=JSON.stringify(getLearner(ID));
 assert.equal((await second({n:2,answer:'7'})).status,200);
 assert.equal(item(2).second,'right');
 assert.equal(getLearner(ID).skills[TOPIC].seen,seen,'skills[topic].seen unchanged: a second go is practice, not evidence');
 assert.equal(JSON.stringify(getLearner(ID)),record,'skills, history and digest are as marking left them');
 assert.match(require(src('tv/mathsRows.ts')).continueCard(store().getSession()).d,/3 of 6 right/);
});
