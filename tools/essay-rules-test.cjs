/**
 * Essay Master's offline rules: the sentence splitter, and the sentence-number anchoring that
 * keeps a model's highlight on a sentence that exists. Run with npm test in desk/ (directly:
 * node tools/essay-rules-test.cjs). No model is called; a disposable data directory, never desk/data.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/essay-rules',String(Date.now()));
const {splitSentences,paragraphStats}=require(path.join(root,'src/lib/rules/essay.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts'));
let answer,seen=[];engine.text=(req)=>{seen.push(req);return answer(req);};
const {analyseEssay}=require(path.join(root,'src/lib/desk/essay.ts'));
const {getLearner,addHistory,recordWriting,recordAttempt}=require(path.join(root,'src/lib/session/learners.ts'));
const {lensStandings,writingTotals}=require(path.join(root,'src/tv/writingRows.ts'));
const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
after(()=>clearInterval(globalThis.__desk.ticker));
const reply=(json)=>async()=>({json,provider:'test',ms:1});

const THREE='The school day starts too early. Research found that teenagers fall asleep later. Therefore the start should move.';

test('the splitter numbers sentences from one, and the last number is the count',()=>{
 const s=splitSentences(THREE);
 assert.deepEqual(s.map(x=>x.n),[1,2,3],'numbers are 1-based, not array indices');
 assert.equal(s.at(-1).n,s.length,'the last sentence number is the count, never one more or one less');
 assert.equal(s[0].text,'The school day starts too early.');
 assert.equal(s[2].text,'Therefore the start should move.','the final sentence keeps its full stop and is not dropped');
});
test('one sentence, and no sentence, are both counted honestly',()=>{
 assert.deepEqual(splitSentences('Homework is pointless.').map(x=>[x.n,x.words]),[[1,3]]);
 assert.deepEqual(splitSentences('No full stop here').map(x=>[x.n,x.text]),[[1,'No full stop here']],'an unterminated sentence is still sentence 1');
 for(const empty of ['','   ','\n\n  \t'])assert.deepEqual(splitSentences(empty),[],`${JSON.stringify(empty)} is no sentences at all, not one empty one`);
 assert.deepEqual(paragraphStats([]),{sentences:0,words:0,avgWords:0,claims:0,evidence:0,links:0,connectors:0},'an empty paragraph never divides by zero');
});
test('a sentence ends at . ! or ? followed by a capital, and nowhere else',()=>{
 assert.equal(splitSentences('Is it fair? No! It is not.').length,3,'? and ! end sentences too');
 assert.equal(splitSentences('It rained. then we left.').length,1,'a lower-case word after a stop is not a new sentence');
 assert.equal(splitSentences('He agreed. "Now," he replied.').length,2,'a quote mark may open the next sentence');
 assert.equal(splitSentences('It costs 4.50 pounds.').length,1,'a decimal point does not end a sentence');
 // These two were pinned as known limits (an abbreviation split, a closing quote hid the end); both now hold.
 assert.equal(splitSentences('Dr. Smith agreed.').length,1,'an abbreviation before a capital does not split');
 assert.deepEqual(splitSentences('She said "Go." Then she left.').map(x=>x.text),['She said "Go."','Then she left.'],'a closing quote after the stop still ends the sentence');
});
test('abbreviations do not end a sentence, and the numbering after them stays true',()=>{
 for(const [para,texts] of [
  ['Mr. Jones and Mrs. Jones came. They sat down.',['Mr. Jones and Mrs. Jones came.','They sat down.']],
  ['Ms. Lee asked Prof. Brown. He agreed.',['Ms. Lee asked Prof. Brown.','He agreed.']],
  ['We walked down St. Mary Street. It was late.',['We walked down St. Mary Street.','It was late.']],
  ['Bring pens, paper etc. Also a ruler. Then sit.',['Bring pens, paper etc. Also a ruler.','Then sit.']],
  ['Some cities, e.g. Paris, are busy. Others, i.e. London, are too.',['Some cities, e.g. Paris, are busy.','Others, i.e. London, are too.']],
  ['Cats eg. Tom sleep. Dogs ie. Rex bark. Cats vs. Dogs.',['Cats eg. Tom sleep.','Dogs ie. Rex bark.','Cats vs. Dogs.']],
  ['DR. SMITH came. He left.',['DR. SMITH came.','He left.']],
 ]){
  const s=splitSentences(para);
  assert.deepEqual(s.map(x=>x.text),texts,para);
  assert.deepEqual(s.map(x=>x.n),texts.map((_,i)=>i+1),`${para}: numbering follows the real sentences`);
 }
 assert.equal(splitSentences('He met the Doctor. Smith agreed.').length,2,'a full word is not an abbreviation');
 assert.equal(splitSentences('It was the first. Then the rest.').length,2,'a word merely ending in st is not St.');
 assert.equal(splitSentences('I saw a tie. Then a coat.').length,2,'a word merely ending in ie is not ie.');
 assert.deepEqual(splitSentences('We spoke to Dr.').map(x=>x.text),['We spoke to Dr.'],'an abbreviation at the very end is still one sentence');
});
test('a closing quote or bracket after the stop still ends the sentence',()=>{
 for(const [para,texts] of [
  ['She said "Go!" Then she left.',['She said "Go!"','Then she left.']],
  ['He asked "Why?" Nobody knew.',['He asked "Why?"','Nobody knew.']],
  ['She said “Go.” Then she left.',['She said “Go.”','Then she left.']],
  ["He called it 'fair.' Few agreed.",["He called it 'fair.'",'Few agreed.']],
  ['She wrote ‘done.’ It was not.',['She wrote ‘done.’','It was not.']],
  ['The data was clear (see the report.) Then it changed.',['The data was clear (see the report.)','Then it changed.']],
  ['It was noted [in 2020.] Later it grew.',['It was noted [in 2020.]','Later it grew.']],
  ['She said "Go." "Now," he replied.',['She said "Go."','"Now," he replied.']],
 ]){
  const s=splitSentences(para);
  assert.deepEqual(s.map(x=>x.text),texts,para);
  assert.equal(s.at(-1).n,texts.length,`${para}: the last number is the count`);
 }
 assert.equal(splitSentences('She said "go." then she left.').length,1,'a lower-case word after the quote is still not a new sentence');
});
test('a fixed split moves a highlight onto the sentence it was meant for',async()=>{
 answer=reply({verdicts:[{n:2,verdict:'faulty',note:'no evidence'},{n:3,verdict:'faulty',note:'there is no third sentence'}],summary:'s'});
 const a=await analyseEssay('Dr. Smith says school starts too early. Nobody checked.','evidence','essay-anon');
 assert.equal(a.sentences.length,2);
 assert.deepEqual(a.verdicts.map(v=>v.n),[2],'sentence 2 is "Nobody checked." — a split after Dr. would have made it 3');
 assert.equal(a.sentences[1].text,'Nobody checked.');
});
test('line breaks collapse, so a pasted paragraph is measured as one paragraph',()=>{
 const s=splitSentences('The first point.\n\n   The second   point spans\nlines.');
 assert.deepEqual(s.map(x=>x.text),['The first point.','The second point spans lines.']);
 assert.deepEqual(s.map(x=>x.words),[3,5],'words are counted after the whitespace collapses');
});
test('roles and connectors are counted from the text, and the stats add up',()=>{
 const s=splitSentences(THREE);
 assert.deepEqual(s.map(x=>x.role),['claim','evidence','link']);
 assert.deepEqual(s[1].connectors,[],'no connector word in that sentence');
 assert.deepEqual(splitSentences('It works because it is simple, however it is slow.')[0].connectors,['because','however']);
 assert.deepEqual(splitSentences('It works BECAUSE it is simple.')[0].connectors,['because'],'connectors are matched case-insensitively and reported lower-case');
 const st=paragraphStats(s);
 assert.equal(st.sentences,3);assert.equal(st.claims+st.evidence+st.links,st.sentences,'every sentence has exactly one role');
 assert.equal(st.words,s.reduce((a,x)=>a+x.words,0));assert.equal(st.avgWords,Math.round((st.words/3)*10)/10);
});

test('the paragraph reaches the model numbered from one, with every sentence present',async()=>{
 seen=[];answer=reply({verdicts:[],summary:'ok'});
 await analyseEssay(THREE,'structure','essay-anon');
 const lines=seen[0].prompt.split('\n').filter(l=>/^\d+\. /.test(l));
 assert.deepEqual(lines.map(l=>Number(l.split('.')[0])),[1,2,3]);
 assert.match(seen[0].prompt,/3 sentences/);
 assert.match(lines[1],/^2\. Research found that teenagers fall asleep later\. {2}\[7 words, first-pass role: evidence\]$/);
});
test('a verdict can only land on a sentence number that exists',async()=>{
 answer=reply({verdicts:[
  {n:0,verdict:'faulty',note:'before the first sentence'},
  {n:1,verdict:'strong',note:'the claim is clear'},
  {n:3,verdict:'faulty',note:'the link asserts'},
  {n:4,verdict:'faulty',note:'one past the last sentence'},
  {n:-1,verdict:'faulty',note:'negative'},
  {n:99,verdict:'neutral',note:'far out of range'},
 ],summary:'A clear paragraph.'});
 const a=await analyseEssay(THREE,'structure','essay-anon');
 assert.deepEqual(a.verdicts.map(v=>v.n),[1,3],'0 and length+1 are both off the end; only 1..3 survive');
 assert.equal(a.sentences.length,3);assert.equal(a.summary,'A clear paragraph.');assert.equal(a.type,'structure');
 assert.equal(a.text,THREE,'the learner\'s own text is returned unchanged, not the collapsed one');
});
test('a single-sentence paragraph admits verdict 1 and nothing else',async()=>{
 answer=reply({verdicts:[{n:1,verdict:'faulty',note:'no evidence'},{n:2,verdict:'faulty',note:'there is no sentence 2'}],summary:'One claim only.'});
 const a=await analyseEssay('Homework is pointless.','evidence','essay-anon');
 assert.deepEqual(a.verdicts.map(v=>v.n),[1]);
});
test('verdicts the model malformed never reach the screen, and never throw',async()=>{
 for(const verdicts of [undefined,null,'not an array',[{n:'1',verdict:'strong',note:'a string number'}],[{verdict:'strong',note:'no number at all'}]]){
  answer=reply({verdicts,summary:'s'});
  const a=await analyseEssay(THREE,'language','essay-anon');
  assert.deepEqual(a.verdicts,[],JSON.stringify(verdicts));
 }
});
// ---- the fix: how to rephrase a faulty sentence, as a named move and a pattern with [slots] - never the sentence rewritten ----
const SIX='Many students arrive at school exhausted. Research found that the body clock shifts later. An early start therefore cuts into sleep. Of course, a lot of teenagers just stay up on their phones, so it is really their own fault. Schools that moved the start saw attendance rise. A later start is a way of teaching them when they can learn.';
const CONCEDE={move:'Concede, then turn it back',pattern:'Although [the other side], [why your claim still holds].'};
test('a faulty verdict keeps a valid fix, trimmed, and the verdict itself is untouched',async()=>{
 answer=reply({verdicts:[{n:4,verdict:'faulty',note:'This argues the other side.',fix:{move:'  Concede,  then turn it back ',pattern:' Although [the other side],\n [why your claim still holds]. '}}],summary:'s'});
 const a=await analyseEssay(SIX,'argument','essay-fix');
 assert.equal(a.sentences.length,6);
 assert.deepEqual(a.verdicts,[{n:4,verdict:'faulty',note:'This argues the other side.',fix:CONCEDE}],'whitespace collapses; move and pattern survive as given');
});
test('a fix on a strong or neutral verdict is dropped, and the verdict stays',async()=>{
 answer=reply({verdicts:[{n:1,verdict:'strong',note:'clear side',fix:CONCEDE},{n:3,verdict:'neutral',note:'',fix:CONCEDE},{n:4,verdict:'faulty',note:'other side',fix:CONCEDE}],summary:'s'});
 const a=await analyseEssay(SIX,'argument','essay-fix');
 assert.deepEqual(a.verdicts.map(v=>[v.n,v.verdict,'fix' in v]),[[1,'strong',false],[3,'neutral',false],[4,'faulty',true]]);
});
test('a fix without a [slot] is dropped - a rewritten sentence is not a pattern',async()=>{
 for(const pattern of [
  'Although some teenagers do stay up on their phones, even those who switch off early are not sleepy until after midnight.',
  'Although the other side, why your claim still holds.',
  'Although [], [why].',
 ]){
  answer=reply({verdicts:[{n:4,verdict:'faulty',note:'other side',fix:{move:'Concede, then turn it back',pattern}}],summary:'s'});
  const a=await analyseEssay(SIX,'argument','essay-fix');
  assert.equal(a.verdicts.length,1,'the verdict is never lost with its fix');
  assert.equal(a.verdicts[0].fix,undefined,pattern);
  assert.equal(a.verdicts[0].note,'other side');
 }
});
test('a pattern that is the learner\'s sentence around a slot, or mostly words, is dropped',async()=>{
 for(const pattern of [
  'Of course, a lot of teenagers just stay up on their phones, so [why your claim still holds].',
  'Although many people think that teenagers are lazy and never go to bed on time, [why].',
  'Although [the other side] ] [why].',
  'Although [the other side, [why your claim still holds].',
 ]){
  answer=reply({verdicts:[{n:4,verdict:'faulty',note:'x',fix:{move:'Concede, then turn it back',pattern}}],summary:'s'});
  assert.equal((await analyseEssay(SIX,'argument','essay-fix')).verdicts[0].fix,undefined,pattern);
 }
});
test('a malformed fix never reaches the screen and never throws',async()=>{
 for(const fix of [null,'Concede, then turn it back','[a], [b]',42,[CONCEDE],{move:'Concede'},{pattern:CONCEDE.pattern},{move:7,pattern:CONCEDE.pattern},{move:CONCEDE.move,pattern:['[a]']},
  {move:'Concede',pattern:CONCEDE.pattern},{move:'One two three four five six seven',pattern:CONCEDE.pattern},{move:'Concede [then] turn',pattern:CONCEDE.pattern},
  {move:CONCEDE.move,pattern:'Although ['+'x'.repeat(55)+'], ['+'y'.repeat(55)+'], and ['+'z'.repeat(55)+'].'}]){
  answer=reply({verdicts:[{n:4,verdict:'faulty',note:'x',fix}],summary:'s'});
  const a=await analyseEssay(SIX,'argument','essay-fix');
  assert.deepEqual(a.verdicts,[{n:4,verdict:'faulty',note:'x'}],JSON.stringify(fix));
 }
});
test('cleanFix is the one rule: the TV and the engine read the same shape',()=>{
 const {cleanFix}=require(path.join(root,'src/lib/rules/essay.ts'));
 assert.deepEqual(cleanFix(CONCEDE,'Of course, a lot of teenagers just stay up on their phones.'),CONCEDE);
 assert.deepEqual(cleanFix({move:'Claim, then evidence',pattern:'[Your claim]. For example, [the evidence].'}),{move:'Claim, then evidence',pattern:'[Your claim]. For example, [the evidence].'},'a pattern may open on a slot');
 assert.equal(cleanFix(undefined),undefined);
});
test('with no fix of its own, a faulty sentence falls back to its lens\'s playbook lesson: a named move and a slotted pattern',()=>{
 const {PLAYBOOK,ESSAY_TYPES,playFor}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const {cleanFix}=require(path.join(root,'src/lib/rules/essay.ts'));
 for(const p of PLAYBOOK){
  assert.equal(cleanFix({move:'Stand in move',pattern:p.pattern})?.pattern,p.pattern,`${p.id}: the pattern passes the rule a model's pattern must pass`);
  const n=p.move.split(/\s+/).length;assert.ok(n>=2&&n<=7,`${p.id}: the move is named in a few words (${n}); Paragraph's is the brief's own seven`);
 }
 assert.equal(PLAYBOOK.find(p=>p.id==='para').move,'Claim, then evidence, then the link back','Paragraph\'s move is its own line');
 for(const t of ESSAY_TYPES)assert.ok(PLAYBOOK.includes(playFor(t.id)),`${t.id} names a playbook lesson`);
 assert.equal(playFor('argument').id,'thesis');assert.equal(playFor('structure').id,'para');
 assert.equal(playFor('no-such-lens').id,'para','an unknown lens still gets a move, never an empty slot');assert.equal(playFor(null).id,'para');
});
test('the model is asked for a fix only on a faulty verdict, as a move and a slotted pattern, never a rewrite',async()=>{
 seen=[];answer=reply({verdicts:[],summary:'s'});
 await analyseEssay(THREE,'argument','essay-anon');
 const {system,schema}=seen[0];
 assert.match(system,/For a 'faulty' verdict only, add a fix/);
 assert.match(system,/never their sentence rewritten/);
 assert.match(system,/\[slot\]/);
 assert.match(system,/No fix on strong or neutral verdicts/);
 const item=schema.properties.verdicts.items;
 assert.deepEqual(item.required,['n','verdict','note'],'fix is optional: a model that omits it still answers inside the schema');
 assert.deepEqual(item.properties.fix.required,['move','pattern']);
 assert.equal(item.properties.fix.properties.pattern.maxLength,undefined,'no length limit in the schema: an over-long fix loses the fix, not the reading');
});

test('an unknown lens falls back to the first one rather than failing the reading',async()=>{
 seen=[];answer=reply({verdicts:[],summary:'s'});
 await analyseEssay(THREE,'no-such-lens','essay-anon');
 assert.match(seen[0].system,/Lens for this reading: Structure/);
});

test('a reading is written to the learner record as one writing episode',async()=>{
 answer=reply({verdicts:[{n:1,verdict:'strong',note:'clear'},{n:2,verdict:'faulty',note:'asserts'},{n:3,verdict:'faulty',note:'no link'}],summary:'s'});
 const before=Date.now();
 await analyseEssay(THREE,'argument','essay-record');
 const h=getLearner('essay-record').history;
 assert.equal(h.length,1,'one reading is one episode, not one per sentence');
 assert.equal(h[0].kind,'writing');
 assert.equal(h[0].label,'Argument','the lens that was read, by its display name');
 assert.equal(h[0].detail,'2 of 3 sentences to fix','the counts the reading produced, not invented ones');
 assert(h[0].at>=before&&h[0].at<=Date.now());
});
test('the writing episode counts only faults that survived the anchoring',async()=>{
 answer=reply({verdicts:[{n:1,verdict:'faulty',note:'real'},{n:9,verdict:'faulty',note:'no such sentence'},{n:2,verdict:'neutral',note:'fine'}],summary:'s'});
 await analyseEssay(THREE,'evidence','essay-anchored');
 assert.equal(getLearner('essay-anchored').history.at(-1).detail,'1 of 3 sentences to fix','a verdict off the end is not a fault to fix');
 answer=reply({verdicts:[{n:1,verdict:'faulty',note:'no evidence'}],summary:'s'});
 await analyseEssay('Homework is pointless.','evidence','essay-anchored');
 assert.equal(getLearner('essay-anchored').history.at(-1).detail,'1 of 1 sentence to fix','one sentence is singular');
});
test('a paragraph with no sentences in it is not an episode',async()=>{
 answer=reply({verdicts:[],summary:'s'});
 await analyseEssay('   ','structure','essay-empty');
 assert.deepEqual(getLearner('essay-empty').history,[]);
});
test('writing episodes sit beside Math Buddy\'s in one record, newest last',async()=>{
 addHistory('essay-mixed',{at:1,kind:'practice',label:'Linear equations',detail:'4 of 6 right'});
 answer=reply({verdicts:[{n:1,verdict:'faulty',note:'x'}],summary:'s'});
 await analyseEssay(THREE,'language','essay-mixed');
 const h=getLearner('essay-mixed').history;
 assert.deepEqual(h.map(e=>e.kind),['practice','writing'],'the maths episode is untouched and the writing one is appended');
 assert.deepEqual(h.filter(e=>e.kind==='homework'||e.kind==='practice').map(e=>e.label),['Linear equations'],'Math Buddy\'s home rows never pick up a writing episode');
});
test('a writing episode survives a round trip through learners.json, an unknown kind does not',()=>{
 const file=path.join(process.env.DESK_DATA_DIR,'learners.json');
 fs.mkdirSync(process.env.DESK_DATA_DIR,{recursive:true});
 const book=JSON.parse(fs.readFileSync(file,'utf8'));
 book['essay-disk']={id:'essay-disk',skills:{},memory:[],history:[
  {at:5,kind:'writing',label:'Structure',detail:'1 of 4 sentences to fix'},
  {at:6,kind:'homework',label:'Sheet 3',detail:'6 problems read'},
  {at:7,kind:'nonsense',label:'From a later version',detail:''},
 ]};
 fs.writeFileSync(file,JSON.stringify(book));
 const h=getLearner('essay-disk').history;
 assert.deepEqual(h.map(e=>e.kind),['writing','homework','practice'],'writing reads back as writing; a kind this version does not know falls back to practice');
 assert.equal(h[0].detail,'1 of 4 sentences to fix');
});

// ---- the measured writing estimate: one attempt per reading, on its lens ----
const FIVE='The start is early. Research found teenagers sleep late. A study measured it. Pupils are tired. Therefore it should move.';
const faults=(ns)=>reply({verdicts:ns.map(n=>({n,verdict:'faulty',note:'x'})),summary:'s'});

test('a reading is one attempt on its lens, right when under a quarter of the sentences are faulty',async()=>{
 for(const [id,para,ns,right] of [
  ['w-clean3',THREE,[],true],
  ['w-one3',THREE,[1],false],
  ['w-one5',FIVE,[2],true],
  ['w-two5',FIVE,[2,4],false],
  ['w-one4','One is here. Two is here. Three is here. Four is here.',[3],false],
 ]){
  answer=faults(ns);
  await analyseEssay(para,'structure',id);
  const r=getLearner(id).writing.structure;
  assert.equal(r.seen,1,`${id}: one reading is one attempt`);
  assert.equal(r.right,right?1:0,`${id}: ${ns.length} faulty is ${right?'right':'not right'}`);
  assert.equal(r.estimate,right?0.3:0,`${id}: the estimate moves 30% toward the outcome, as Math Buddy's does`);
  assert.equal(r.topic,'structure','keyed by the lens id, not its display name');
 }
});
test('only faults that survived the anchoring count against the estimate',async()=>{
 answer=faults([7,8,9]);
 await analyseEssay(THREE,'evidence','w-anchored');
 assert.equal(getLearner('w-anchored').writing.evidence.right,1,'verdicts off the end are not faults');
});
test('improvement is readable: faults thinning out over the readings raise the estimate',async()=>{
 const trail=[];
 for(const ns of [[1,2,3],[1,2],[1],[],[],[]]){answer=faults(ns);await analyseEssay(THREE,'argument','w-improving');trail.push(getLearner('w-improving').writing.argument.estimate);}
 for(const ns of [[1,2,3],[1,2],[1,2],[1,3],[2,3],[1,2,3]]){answer=faults(ns);await analyseEssay(THREE,'argument','w-flat');}
 assert.deepEqual(trail.slice(0,3),[0,0,0],'faulty readings leave it at nothing');
 assert(trail[3]<trail[4]&&trail[4]<trail[5],'clean readings raise it, reading after reading');
 assert(getLearner('w-improving').writing.argument.estimate>getLearner('w-flat').writing.argument.estimate,'the improving learner no longer looks like the one who never improved');
 assert.equal(getLearner('w-flat').writing.argument.estimate,0);
});
test('a lens goes secure on Math Buddy\'s terms and never goes back',async()=>{
 let r;answer=faults([]);
 for(let k=0;k<5;k++){await analyseEssay(THREE,'language','w-secure');r=getLearner('w-secure').writing.language;}
 assert.equal(r.secure,false,'five clean readings reach 0.83, not yet 0.85');
 await analyseEssay(THREE,'language','w-secure');r=getLearner('w-secure').writing.language;
 assert.equal(r.seen,6);assert(r.estimate>=0.85);assert.equal(r.secure,true);
 answer=faults([1,2,3]);
 for(let k=0;k<5;k++)await analyseEssay(THREE,'language','w-secure');
 r=getLearner('w-secure').writing.language;
 assert(r.estimate<0.85,'the estimate still falls');assert.equal(r.secure,true,'secure is latched');
});
test('each lens is its own record, and no lens ever shows up among the maths skills',async()=>{
 recordAttempt('w-mixed','linear-one-step',true);
 answer=faults([]);await analyseEssay(THREE,'structure','w-mixed');
 answer=faults([1,2]);await analyseEssay(THREE,'evidence','w-mixed');
 const l=getLearner('w-mixed');
 assert.deepEqual(Object.keys(l.writing).sort(),['evidence','structure']);
 assert.equal(l.writing.structure.right,1);assert.equal(l.writing.evidence.right,0);
 assert.deepEqual(Object.keys(l.skills),['linear-one-step'],'Math Buddy\'s topic counts never include a lens');
});
test('no sentences is no attempt, and recordWriting refuses one directly',async()=>{
 answer=faults([]);await analyseEssay('  ','structure','w-empty');
 assert.deepEqual(getLearner('w-empty').writing,{});
 assert.equal(recordWriting('w-empty','structure',0,0),null);
 assert.equal(recordWriting('w-empty','',3,0),null);
 assert.deepEqual(getLearner('w-empty').writing,{});
});
test('learners.json without a writing record loads, and a malformed one is cleaned',()=>{
 const file=path.join(process.env.DESK_DATA_DIR,'learners.json');
 const book=JSON.parse(fs.readFileSync(file,'utf8'));
 book['w-old']={id:'w-old',skills:{},memory:[],history:[]};
 book['w-bad']={id:'w-bad',skills:{},memory:[],history:[],writing:{structure:{seen:'3',right:2,estimate:7,secure:'yes'}}};
 book['w-list']={id:'w-list',skills:{},memory:[],history:[],writing:['structure']};
 fs.writeFileSync(file,JSON.stringify(book));
 assert.deepEqual(getLearner('w-old').writing,{},'written before writing was measured');
 assert.deepEqual(getLearner('w-bad').writing.structure,{topic:'structure',seen:3,right:2,estimate:1,secure:false,lastSeen:0,slips:[]});
 assert.deepEqual(getLearner('w-list').writing,{},'a list is not a record');
 assert.deepEqual(getLearner('nobody-yet').writing,{});
});

// ---- what the TV reads: the session carries the record, and Essay Master's lens cards stand on it ----
test('a reading reaches the session: the episode and the lens estimate both rehydrate on essay.set',async()=>{
 dispatch({type:'reset'});
 const id=getSession().learner.id;
 assert.deepEqual(getSession().writing,{},'a learner who never wrote has no lens measured');
 answer=faults([]);
 const a=await analyseEssay(THREE,'structure',id);
 dispatch({type:'essay.set',analysis:a});
 const s=getSession();
 assert.equal(s.writing.structure.seen,1);assert.equal(s.writing.structure.estimate,0.3);
 assert.equal(s.history.filter(h=>h.kind==='writing').at(-1).label,'Structure');
 dispatch({type:'reset'});
 assert.equal(getSession().writing.structure.seen,1,'reset wipes the session, not the learner record');
});
test('essay.at walks the forensic page over sentences that exist, and a new reading starts again at its first faulty one',async()=>{
 dispatch({type:'reset'});
 assert.equal(getSession().essayAt,null,'a fresh desk has no sentence chosen');
 answer=reply({verdicts:[{n:4,verdict:'faulty',note:'x',fix:CONCEDE}],summary:'s'});
 const a=await analyseEssay(SIX,'argument',getSession().learner.id);
 dispatch({type:'essay.set',analysis:a});
 assert.equal(getSession().essayAt,null,'essay.set opens on the default');
 assert.equal(getSession().essay.verdicts[0].fix.move,CONCEDE.move,'the fix rides into the session with its verdict');
 dispatch({type:'essay.at',n:2});assert.equal(getSession().essayAt,2);
 dispatch({type:'essay.at',n:7});assert.equal(getSession().essayAt,null,'a sentence the paragraph lacks is the default');
 dispatch({type:'essay.at',n:5});dispatch({type:'essay.at',n:null});assert.equal(getSession().essayAt,null);
 dispatch({type:'essay.at',n:3});dispatch({type:'essay.set',analysis:a});assert.equal(getSession().essayAt,null,'a new reading forgets the old place');
 dispatch({type:'reset'});
});
test('the lens cards: one standing per lens, in the order the TV draws them',()=>{
 const empty=lensStandings([],{});
 assert.deepEqual(empty.map(l=>l.id),['structure','argument','evidence','language']);
 assert(empty.every(l=>l.seen===0&&l.estimate===0&&!l.secure&&l.lastAt===null),'nothing read is nothing drawn, never an invented bar');
 assert.deepEqual(lensStandings(undefined,undefined).map(l=>l.lastAt),[null,null,null,null],'a session from before either field existed still draws');
 const writing={evidence:{topic:'evidence',seen:6,right:6,estimate:0.88,secure:true,lastSeen:5000,slips:[]}};
 const history=[
  {at:2000,kind:'writing',label:'Structure',detail:'1 of 3 sentences to fix'},
  {at:9000,kind:'homework',label:'Structure',detail:'a maths sheet that happens to share the name'},
  {at:3000,kind:'writing',label:'Evidence',detail:'0 of 3 sentences to fix'},
 ];
 const [structure,argument,evidence]=lensStandings(history,writing);
 assert.deepEqual(structure,{id:'structure',name:'Structure',seen:0,estimate:0,secure:false,lastAt:2000},'an episode from before the lens was measured still says when it was read — and only a writing episode counts');
 assert.equal(argument.lastAt,null);
 assert.deepEqual(evidence,{id:'evidence',name:'Evidence',seen:6,estimate:0.88,secure:true,lastAt:5000},'the newer of the record and the episodes');
 assert.deepEqual(writingTotals(lensStandings(history,writing),history),{read:6,secure:1},'the uncapped record outcounts the capped history');
 assert.deepEqual(writingTotals(lensStandings(history,{}),history),{read:2,secure:0},'with no record yet the episodes are the count');
});

// The Writing KPI (tools/kpi-measure.cjs) reads this storage shape. Pinned here, so a change to the shape fails beside the code that changed it.
const kpi=require('./kpi-measure.cjs');
test('the Writing KPI sees stage 6 as it landed: a "writing" history kind that the essay reading appends',()=>{
 assert.deepEqual(kpi.writingPersisted(root),{persisted:true,kindDeclared:true,essayWrites:true});
 const fake=path.join(process.env.DESK_DATA_DIR,'fake-desk'),put=(f,t)=>{fs.mkdirSync(path.dirname(path.join(fake,f)),{recursive:true});fs.writeFileSync(path.join(fake,f),t);};
 const learners=fs.readFileSync(path.join(root,'src/lib/session/learners.ts'),'utf8'),essay=fs.readFileSync(path.join(root,'src/lib/desk/essay.ts'),'utf8');
 put('src/lib/session/learners.ts',learners.replace(/ \| "writing"/,''));put('src/lib/desk/essay.ts',essay);
 assert.deepEqual(kpi.writingPersisted(fake),{persisted:false,kindDeclared:false,essayWrites:true},'a kind the record does not declare is not persistence');
 put('src/lib/session/learners.ts',learners);put('src/lib/desk/essay.ts',essay.replace(/kind: "writing"/,'kind: "practice"'));
 assert.deepEqual(kpi.writingPersisted(fake),{persisted:false,kindDeclared:true,essayWrites:false},'a kind nothing appends is not persistence either');
});
test('the Writing KPI counts a learner with a writing episode, from the book a real reading wrote',()=>{
 const file=path.join(process.env.DESK_DATA_DIR,'learners.json');
 const r=kpi.learnerEvidence({file,source:'DESK_DATA_DIR',tried:[file]});
 const book=JSON.parse(fs.readFileSync(file,'utf8'));
 const writers=Object.values(book).filter(l=>(l.history||[]).some(h=>h.kind==='writing')).length;
 assert(writers>=3,'the readings above wrote writing episodes for several learners');
 assert.equal(r.withWriting,writers,'a writing record is an episode in the history, not a `writing` field');
 assert.equal(r.reading,Object.values(book).reduce((n,l)=>n+(l.history||[]).length,0));
});
