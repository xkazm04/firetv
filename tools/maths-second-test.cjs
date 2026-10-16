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
require('./ts-load.cjs');
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

test('case 1: secondProblem - null for a wrong item with no second go; a plain desk sentence for right, unmarked and a spent go; null for unsure (X7 door)',()=>{
 const {secondProblem}=maths();
 assert.equal(typeof secondProblem,'function','rules/maths exports secondProblem');
 assert.equal(secondProblem({n:2,question:'x-5=2',verdict:'wrong'}),null);
 for(const it of [{n:1,question:'x+3=7',verdict:'right'},{n:2,question:'x-5=2',verdict:'wrong',second:'right'},{n:2,question:'x-5=2',verdict:'wrong',second:'wrong'},{n:3,question:'3x=18'}]){
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

/** X7 door (ask d6d87220, lite r2 value-1): an unsure item takes ONE entered answer on /api/second, judged in code; an explanation never settles it. */
test('X7 door: secondProblem lets an unsure item through; a settled one is refused with a desk sentence',()=>{
 const {secondProblem}=maths();
 assert.equal(secondProblem({n:4,question:'x/2=4',verdict:'unsure'}),null);
 for(const it of [{n:4,verdict:'right'},{n:4,verdict:'wrong',second:'wrong'}])assert.ok(plain(secondProblem(it)),JSON.stringify(it));
});
test('X7 door: an unsure item settles RIGHT from the entered answer, by the code judge, no model; the answer is not kept; a second entry is refused',async()=>{
 const calls=modelCalls;
 seat(markedSet({4:{verdict:'unsure',slip:undefined,studentAnswer:'?',said:'The desk is not sure about number 4. How did you get there?'}}),{walkIx:3});
 const ok=await second({n:4,answer:'8'});
 assert.equal(ok.status,200);assert.deepEqual(await ok.json(),{ok:true});
 assert.equal(item(4).verdict,'right');assert.equal(item(4).second,undefined);
 assert.ok(!JSON.stringify(store().getSession()).includes('"answer"'));
 const again=await second({n:4,answer:'8'});
 assert.equal(again.status,409);assert.ok(plain((await again.json()).error),'the second entry is refused in a desk sentence');
 assert.equal(modelCalls,calls);
});
test('X7 door: an unsure item entered WRONG settles wrong and spends its one go (stricter reading): a further entry is refused',async()=>{
 seat(markedSet({4:{verdict:'unsure',slip:undefined,said:'The desk is not sure about number 4. How did you get there?'}}),{walkIx:3});
 assert.equal((await second({n:4,answer:'5'})).status,200);
 assert.equal(item(4).verdict,'wrong');assert.equal(item(4).second,'wrong','the entry was its go');
 const r=await second({n:4,answer:'8'});
 assert.equal(r.status,409);assert.ok(plain((await r.json()).error));assert.equal(item(4).second,'wrong');
});
test('X7 door: an unreadable entry does not spend the unsure item\'s go; a wrong item keeps exactly one second go',async()=>{
 seat(markedSet({4:{verdict:'unsure'}}),{walkIx:3});
 assert.equal((await second({n:4,answer:'eight'})).status,400);assert.equal(item(4).verdict,'unsure');
 assert.equal((await second({n:4,answer:'8'})).status,200);assert.equal(item(4).verdict,'right');
 seat(markedSet());
 assert.equal((await second({n:2,answer:'5'})).status,200);assert.equal(item(2).second,'wrong');
 assert.equal((await second({n:2,answer:'7'})).status,409,'a wrong item: one go only');
});
test('X7 door: an explanation still never settles an unsure item - only the entered answer does',async()=>{
 seat(markedSet({4:{verdict:'unsure'}}),{walkIx:3});
 store().dispatch({type:'practice.settle',n:4,reply:'Look at the line.'});
 assert.equal(item(4).verdict,'unsure','a reply alone leaves it unsure');
 assert.equal((await second({n:4,answer:'8'})).status,200);assert.equal(item(4).verdict,'right');
});
test('X7 door: the explain closing lines name the door that exists and carry no value (craft-2)',()=>{
 const X=require(src('lib/desk/explain.ts'));
 for(const l of [X.ENTER_LINE.en,X.ENTER_LINE.cz,X.NOT_HEARD_LINE.en,X.NOT_HEARD_LINE.cz]){assert.ok(/phone|telefon/.test(l),l);assert.ok(!/\d/.test(l),l);}
});

test('value-2 (lite r3, nela-12 C3): a linear item reads the learner\'s decimal comma - cz "0,5" on 2x=1 is right, "0,4" is wrong (judged, not refused); uk keeps "0,5" unread',()=>{
 const {enteredGo}=require(src('lib/desk/mark.ts'));
 const go=(a,sys)=>enteredGo({n:1,question:'2x=1'},a,'linear-one-step',sys);
 assert.equal(go('0,5','cz')?.verdict,'right');
 assert.equal(go('0,4','cz')?.verdict,'wrong');
 assert.equal(go('0.5','cz')?.verdict,'right');
 assert.equal(go('1/2','cz')?.verdict,'right');
 assert.equal(go('x = 0,5','cz')?.verdict,'right');
 assert.equal(go('0,5','de')?.verdict,'right');
 assert.equal(go('0,5','uk'),null,'uk: today\'s result - the comma is not read, the go is not spent');
 assert.equal(go('0.5','uk')?.verdict,'right');
});

test('robustness-1 (lite r3): an entered settle whose learner-file write fails does not answer ok - the route says so in the desk\'s own sentence (SETTLE_NOT_SAVED)',async()=>{
 const real=fs.renameSync;let tried=0;
 const errs=[],e0=console.error;
 // a history line marking wrote, so the settle has a line to restate (the write is what fails)
 seat(markedSet({4:{verdict:'unsure',slip:undefined,studentAnswer:'?',said:'The desk is not sure about number 4. How did you get there?'}}),{walkIx:3});
 const L=require(src('lib/session/learners.ts'));
 L.saveLearner(L.withHistory(L.getLearner(ID),{at:Date.now(),kind:'practice',label:require(src('lib/library/paths.ts')).topicIn(TOPIC)?.name??TOPIC,detail:'3 of 6 right, 1 not sure'}));
 fs.renameSync=function(from,to,...rest){
  if(String(to).endsWith('learners.json')){tried++;throw Object.assign(new Error(`EPERM: operation not permitted, rename '${from}' -> '${to}'`),{code:'EPERM'});}
  return real.call(this,from,to,...rest);
 };
 console.error=(...a)=>errs.push(a.join(' '));
 let r,j;
 try{r=await second({n:4,answer:'8'});j=await r.json();}finally{fs.renameSync=real;console.error=e0;}
 assert.ok(tried>0,'the restate tried to write the learner file');
 assert.notEqual(j.ok,true,'the route does not answer ok when the save failed');
 assert.ok(r.status>=500,`a failure status, got ${r.status}`);
 assert.equal(j.error,store().SETTLE_NOT_SAVED,'it names the failed save');
 assert.equal(item(4).verdict,'right','the item is settled on the desk, as the sentence says');
});

test('value-1 / craft-1 (lite r3): an unsure item entered wrong never reads as a "second go" - not in the TV line, not in the refusal; a ringed item\'s real second go still does',async()=>{
 const {secondLine}=require(src('tv/sheetRows.ts'));
 const SECOND=/second go/i;
 seat(markedSet({4:{verdict:'unsure',slip:undefined,said:'The desk is not sure about number 4. How did you get there?'}}),{walkIx:3});
 const r=await second({n:4,answer:'9'});
 assert.equal(r.status,200);
 assert.equal(item(4).verdict,'wrong');
 const line=secondLine(item(4));
 assert.ok(line&&plain(line),`the TV still says something plain: ${line}`);
 assert.doesNotMatch(line,SECOND,'the TV line');
 const again=await second({n:4,answer:'8'});
 assert.equal(again.status,409);
 const refusal=(await again.json()).error;
 assert.ok(plain(refusal));assert.doesNotMatch(refusal,SECOND,'the refusal');
 assert.match(refusal,/typed answer/,'it names the one typed answer');
 // a ringed item's real second go keeps its wording, on the TV and in the refusal
 seat(markedSet(),{walkIx:1});
 assert.equal((await second({n:2,answer:'5'})).status,200);
 assert.equal(item(2).second,'wrong');
 assert.equal(secondLine(item(2)),'Not yet. Tell the desk how you got there.');
 const ringed=(await (await second({n:2,answer:'7'})).json()).error;
 assert.match(ringed,/second go/,'the ringed item\'s refusal still says second go');
 // the phone: an entered item's panel and aria-label carry the same words (the page is a screen, so its source is the pin)
 const page=fs.readFileSync(src('app/phone/page.tsx'),'utf8');
 assert.match(page,/item\.entered/,'the phone tells an entered item from a ringed one');
 assert.match(page,/"answer" : "second go"/,'the aria-label names an unsure entry an answer, a ringed retry a second go');
});
