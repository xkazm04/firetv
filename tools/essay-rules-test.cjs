/**
 * Essay Master's offline rules: the sentence splitter, and the sentence-number anchoring that
 * keeps a model's highlight on a sentence that exists. Run with npm test in desk/ (directly:
 * node tools/essay-rules-test.cjs). No model is called; a disposable data directory, never desk/data.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
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
