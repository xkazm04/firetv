/**
 * Essay Master's offline rules: the sentence splitter, and the sentence-number anchoring that
 * keeps a model's highlight on a sentence that exists. Run with npm test in desk/ (directly:
 * node tools/essay-rules-test.cjs). No model is called; a disposable data directory, never desk/data.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=path.resolve(__dirname,'../artifacts/essay-rules',String(Date.now()));
const {splitSentences,paragraphStats}=require(path.join(root,'src/lib/rules/essay.ts'));
const engine=require(path.join(root,'src/lib/engines/text.ts'));
/**
 * The model observes, code rules (rules/essay decideVerdicts). Most fixtures below were written when the model gave the
 * verdict, and still say what they want in those words: this turns each wanted verdict into the observation that makes the
 * rule decide it for that lens and sentence, so the stubs speak the new schema and the assertions stay as they were.
 * Only a reply with a `verdicts` list is turned; a reply with `observations` goes through untouched (the cases that pin
 * the rule send observations directly, with a legacy `verdict` beside them to show it is ignored).
 */
const WANTED={
 structure:{faulty:{job:'link'},strong:{job:'evidence'},neutral:{job:'context'}},
 argument:{faulty:{side:'wanders'},strong:{side:'pushes'},neutral:{side:'neutral'}},
 evidence:{faulty:{support:'opinion'},strong:{support:'checkable'},neutral:{support:'context'}},
};
const asObservations=(req,r)=>{
 if(!r||!r.json||!('verdicts' in r.json)||!req.schema?.properties?.observations)return r;
 const lens=(/Lens for this reading: (\w+)/.exec(req.system)||[])[1]?.toLowerCase();
 const text=new Map([...req.prompt.matchAll(/^(\d+)\. (.*?) {2}\[\d+ words/gm)].map(m=>[Number(m[1]),m[2]]));
 const {verdicts,...rest}=r.json;
 const field=(e)=>{
  if(lens==='language'){const w=(text.get(e.n)||'').match(/[A-Za-z']+/)?.[0]||'';return e.verdict==='faulty'?{issues:[{kind:'vague',word:w}]}:['strong','neutral'].includes(e.verdict)?{issues:[]}:{issues:'unreadable'};}
  return WANTED[lens]?.[e.verdict]||{bogus:true};
 };
 const observations=Array.isArray(verdicts)?verdicts.map(e=>{
  if(!e||typeof e!=='object')return e;
  const {verdict,...keep}=e;
  return {...keep,...field(e)};
 }):verdicts;
 return {...r,json:{...rest,observations}};
};
let answer,seen=[];engine.text=(req)=>{seen.push(req);return Promise.resolve(answer(req)).then(r=>asObservations(req,r));};
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
 const item=schema.properties.observations.items;
 assert.deepEqual(item.required,['n','note'],'fix is optional: a model that omits it still answers inside the schema');
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
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 const id=getSession().learner.id;
 assert.deepEqual(getSession().writing,{},'a learner who never wrote has no lens measured');
 answer=faults([]);
 const a=await analyseEssay(THREE,'structure',id);
 dispatch({type:'essay.set',analysis:a});
 const s=getSession();
 assert.equal(s.writing.structure.seen,1);assert.equal(s.writing.structure.estimate,0.3);
 assert.equal(s.history.filter(h=>h.kind==='writing').at(-1).label,'Structure');
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 assert.equal(getSession().writing.structure.seen,1,'reset wipes the session, not the learner record');
});
test('essay.at walks the forensic page over sentences that exist, and a new reading starts again at its first faulty one',async()=>{
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
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
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
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
test('WD10a: the Writing KPI accepts the one-save withHistory shape and refuses an applier that is never saved',()=>{
 const fake=path.join(process.env.DESK_DATA_DIR,'fake-desk-wd10a'),put=(f,t)=>{fs.mkdirSync(path.dirname(path.join(fake,f)),{recursive:true});fs.writeFileSync(path.join(fake,f),t);};
 const learners=fs.readFileSync(path.join(root,'src/lib/session/learners.ts'),'utf8'),essay=fs.readFileSync(path.join(root,'src/lib/desk/essay.ts'),'utf8');
 put('src/lib/session/learners.ts',learners);
 put('src/lib/desk/essay.ts','export function record(learnerId, lens) {\n  addHistory(learnerId, { at: Date.now(), kind: "writing", label: lens.name, detail: "" });\n}\n');
 assert.equal(kpi.writingPersisted(fake).essayWrites,true,'the old addHistory shape still counts');
 put('src/lib/desk/essay.ts',essay.split('saveLearner(').join('noSave('));
 const unsaved=kpi.writingPersisted(fake);
 assert.equal(unsaved.essayWrites,false,'a withHistory applier that is never saved is not persistence');
 assert.equal(unsaved.persisted,false);
 put('src/lib/desk/essay.ts',essay);
 assert.equal(kpi.writingPersisted(fake).essayWrites,true,'the current essay.ts counts');
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

// ---- rewrite one sentence in place: re-judged alone, and the move inks only if it holds ----
const rules=()=>require(path.join(root,'src/lib/rules/essay.ts'));
const deskEssay=()=>require(path.join(root,'src/lib/desk/essay.ts'));
const analyse=(body)=>require(path.join(root,'src/app/api/analyse/route.ts')).POST(new Request('http://desk/api/analyse',{method:'POST',body:JSON.stringify(body)}));
const deskWorded=(line)=>{assert.equal(typeof line,'string');assert(line.length>0);assert(!/\b\w*Error:|undefined|NaN/.test(line),`not desk-worded: ${line}`);};
/** THREE as the desk read it through the Evidence lens: 1 strong, 2 faulty (no fix of its own), 3 neutral. */
const R3=(verdicts=[{n:1,verdict:'strong',note:'A clear side.'},{n:2,verdict:'faulty',note:'Whose research?'},{n:3,verdict:'neutral',note:'Fine.'}])=>{const s=splitSentences(THREE);return {text:THREE,type:'evidence',sentences:s,stats:paragraphStats(s),verdicts,summary:'One source is missing.',provider:'test'};};
const STUDY='According to a 2019 study, teenagers fall asleep two hours later.';
const OLD2='Research found that teenagers fall asleep later.';

test('rewrite case 1: revise puts one sentence in place, recomputed in code, and the paragraph around it keeps its numbers',()=>{
 const {revise}=rules();
 const before=R3(),r=revise(before,2,STUDY);
 assert.equal(r.ok,true,r.error);
 const a=r.reading;
 assert.deepEqual(a.sentences.map(x=>x.n),[1,2,3],'the numbering stands');
 assert.deepEqual(a.sentences[1],{...splitSentences(STUDY)[0],n:2},'sentence 2 is the rewrite: role, words and connectors from the rule, not carried over');
 assert.equal(a.sentences[1].text,STUDY);assert.equal(a.sentences[1].words,11);assert.equal(a.sentences[1].role,'evidence');
 assert.deepEqual(a.sentences[0],before.sentences[0]);assert.deepEqual(a.sentences[2],before.sentences[2]);
 assert.deepEqual(a.stats,paragraphStats(a.sentences),'the stats are recounted');
 assert.equal(a.text,`${before.sentences[0].text} ${STUDY} ${before.sentences[2].text}`,'the text is rebuilt from the sentences');
 assert.deepEqual(splitSentences(a.text).map(x=>x.text),a.sentences.map(x=>x.text),'and splits back into the same sentences');
 assert.deepEqual(a.verdicts,before.verdicts,'revise decides no verdict');
 assert.equal(before.sentences[1].text,OLD2,'the reading it was given is not mutated');
 const b=revise(before,3,'Research shows the start should move.').reading;
 assert.equal(b.sentences[2].role,'evidence');
 assert.deepEqual([b.stats.evidence,b.stats.links],[2,0],'the evidence count follows the new sentence');
});

test('rewrite case 2: revise refuses a rewrite that is not one new sentence, in the desk\'s words, before any model is asked',async()=>{
 const {revise}=rules();
 const refusals=[[2,'It is bad. Very bad.'],[2,'   '],[2,''],[2,'  research found that TEENAGERS   fall asleep later. '],[4,STUDY],[0,STUDY],[2,'teenagers fall asleep two hours later.']];
 for(const [n,text] of refusals){const r=revise(R3(),n,text);assert.equal(r.ok,false,`${n} ${JSON.stringify(text)}`);deskWorded(r.error);}
 assert.match(revise(R3(),2,'It is bad. Very bad.').error,/one sentence/i);
 assert.match(revise(R3(),4,STUDY).error,/no sentence 4/i);
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});dispatch({type:'essay.set',analysis:R3()});
 seen=[];answer=reply({verdicts:[{n:2,verdict:'strong',note:'x'}]});
 for(const [n,text] of refusals){const res=await analyse({kind:'rewrite',n,text});assert.equal(res.status,400,`${n} ${JSON.stringify(text)}`);deskWorded((await res.json()).error);}
 assert.equal((await analyse({kind:'rewrite',n:'two',text:STUDY})).status,400,'a sentence number that is not a number');
 assert.equal(seen.length,0,'no engine call for a refused rewrite');
 assert.equal(getSession().essay.sentences[1].text,OLD2,'the desk is unchanged');
 assert.equal(getSession().jobs.analyse,undefined,'no run was started');
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 assert.equal((await analyse({kind:'rewrite',n:2,text:STUDY})).status,400,'no paragraph on the desk: nothing to rewrite in');
 assert.equal(seen.length,0);
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
});

test('rewrite case 3: reviseSentence re-judges sentence n alone, in its paragraph, against the move it was taught; the other verdicts are kept by code',async()=>{
 const {reviseSentence}=deskEssay(),{playFor}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const before=R3();
 seen=[];answer=reply({verdicts:[{n:1,verdict:'faulty',note:'the model changed its mind'},{n:2,verdict:'strong',note:'It names its source now.'},{n:3,verdict:'strong',note:'also changed'}]});
 const a=await reviseSentence(before,2,STUDY);
 assert.equal(seen.length,1,'one model call');
 assert.deepEqual(a.verdicts.find(v=>v.n===1),before.verdicts[0],'verdict 1 is kept, not asked');
 assert.deepEqual(a.verdicts.find(v=>v.n===3),before.verdicts[2],'verdict 3 is kept, not asked');
 assert.deepEqual(a.verdicts.map(v=>v.n),[1,2,3],'one verdict per sentence, in order');
 const v2=a.verdicts.find(v=>v.n===2);
 assert.equal(v2.verdict,'strong');assert.equal(v2.note,'It names its source now.');
 assert.deepEqual(v2.was,{text:OLD2,verdict:'faulty'},'verdict 2 remembers the sentence it replaced');
 assert.equal(a.sentences[1].text,STUDY);assert.equal(a.summary,before.summary);assert.equal(a.type,'evidence');
 const {system,prompt}=seen[0];
 assert.match(system,/sentence 2 alone/i,'the model is asked for sentence 2 alone');
 assert.match(system,/Lens for this reading: Evidence/);
 assert.match(system,/Never rewrite their sentences/);
 for(const [k,x] of a.sentences.entries())assert.ok(prompt.includes(`${k+1}. ${x.text}`),`the whole numbered paragraph: ${x.n}`);
 assert.ok(prompt.includes(playFor('evidence').move),'the move the page taught (the playbook, when the verdict had no fix of its own)');
 assert.ok(prompt.includes(OLD2),'the sentence before the rewrite');
 // a verdict with its own fix: that move is the one asked about, and it rides on `was` so the TV can ink it
 const FIX={move:'Name the source',pattern:'According to [who], [what they found].'};
 seen=[];answer=reply({verdicts:[{n:2,verdict:'strong',note:'ok'}]});
 const b=await reviseSentence(R3([{n:2,verdict:'faulty',note:'Whose?',fix:FIX}]),2,STUDY);
 assert.ok(seen[0].prompt.includes(FIX.move));
 assert.deepEqual(b.verdicts,[{n:2,verdict:'strong',note:'ok',was:{text:OLD2,verdict:'faulty',fix:FIX}}]);
 // a second rewrite of the same sentence still remembers the first reading of it
 seen=[];answer=reply({verdicts:[{n:2,verdict:'strong',note:'again'}]});
 const c=await reviseSentence(b,2,'A 2019 study found that teenagers fall asleep two hours later.');
 assert.deepEqual(c.verdicts[0].was,b.verdicts[0].was);
 // a model that does not answer for sentence n fails the run; it never invents a verdict
 answer=reply({verdicts:[{n:1,verdict:'strong',note:'x'}]});
 await assert.rejects(reviseSentence(before,2,STUDY));
 answer=reply({verdicts:[{n:2,verdict:'great',note:'x'}]});
 await assert.rejects(reviseSentence(before,2,STUDY));
});

test('rewrite case 4: a rewrite judged still faulty keeps a fix only when it passes cleanFix against the NEW sentence',async()=>{
 const {reviseSentence}=deskEssay();
 const COPY={move:'Name the source',pattern:'[Who] says teenagers fall asleep two hours later.'};
 answer=reply({verdicts:[{n:2,verdict:'faulty',note:'Which study?',fix:COPY}]});
 const a=await reviseSentence(R3(),2,STUDY);
 const v=a.verdicts.find(x=>x.n===2);
 assert.equal(v.verdict,'faulty');assert.equal(v.note,'Which study?');
 assert.equal(v.fix,undefined,'four of the rewrite\'s own words in the pattern: the fix is dropped, the verdict stays');
 const {cleanFix}=rules();assert.deepEqual(cleanFix(COPY,OLD2),COPY,'against the old sentence the same pattern would have passed');
 const FAIR={move:'Name the source',pattern:'According to [who], [what they found].'};
 answer=reply({verdicts:[{n:2,verdict:'faulty',note:'Which study?',fix:FAIR}]});
 assert.deepEqual((await reviseSentence(R3(),2,STUDY)).verdicts.find(x=>x.n===2).fix,FAIR,'a clean pattern stays');
 answer=reply({verdicts:[{n:2,verdict:'strong',note:'ok',fix:FAIR}]});
 assert.equal((await reviseSentence(R3(),2,STUDY)).verdicts.find(x=>x.n===2).fix,undefined,'no fix on a verdict that holds');
});

test('rewrite case 5: POST /api/analyse kind rewrite lands on the desk as essay.revised - the TV stays on the sentence, and nothing is added to the learner record',async()=>{
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 const id=getSession().learner.id;
 answer=faults([2]);
 const first=await analyseEssay(THREE,'evidence',id);dispatch({type:'essay.set',analysis:first});
 dispatch({type:'essay.at',n:2});dispatch({type:'nav',screen:'forensic',focus:0});
 const history=getLearner(id).history.length,writing=JSON.stringify(getLearner(id).writing);
 assert.equal(getSession().history.length,history);
 answer=reply({verdicts:[{n:2,verdict:'strong',note:'It names its source now.'}]});
 const res=await analyse({kind:'rewrite',n:2,text:STUDY});
 assert.equal(res.status,200);
 const s=getSession();
 assert.equal(s.essay.sentences[1].text,STUDY);
 assert.equal(s.essay.verdicts.find(v=>v.n===2).was.verdict,'faulty');
 assert.equal(s.essayAt,2,'the TV stays on the sentence that was rewritten');
 assert.equal(s.screen,'forensic');
 assert.equal(s.jobs.analyse.phase,'done');assert.equal(s.jobs.analyse.key,'sentence:2');
 assert.equal(getLearner(id).history.length,history,'a rewrite is not another paragraph read');
 assert.equal(JSON.stringify(getLearner(id).writing),writing,'and not another attempt on the lens');
 assert.equal(s.history.length,history);
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
});

test('recap M1: a rewrite restates the reading\'s own history line - one reading, "1 of 5 to fix" and "1 fixed"',async()=>{
 const {recapRows,recapLine}=require(path.join(root,'src/tv/recapRows.ts'));
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 const id=getSession().learner.id,FIVE='The school day starts too early. Research found that teenagers fall asleep later. Teenagers are just lazy. A 2019 study measured their sleep. Therefore the start should move.';
 answer=faults([2,3]);
 const first=await analyseEssay(FIVE,'evidence',id);dispatch({type:'essay.set',analysis:first});
 const essayLines=()=>getLearner(id).history.filter(h=>h.kind==='writing'),was=essayLines().length;
 const tile=()=>({...recapRows(getSession(),Date.now()).find(t=>t.app==='essay')}),last=()=>{const t=tile();return {...t,readings:t.readings.slice(-1)};};
 assert.deepEqual(last().readings.map(r=>[r.against,r.of,r.fixed]),[[2,5,undefined]],'read: 2 of 5');
 answer=reply({verdicts:[{n:2,verdict:'strong',note:'It names its source now.'}]});
 assert.equal((await analyse({kind:'rewrite',n:2,text:STUDY})).status,200);
 assert.equal(essayLines().length,was,'the history holds one essay line for the reading');
 assert.equal(essayLines().at(-1).detail,'1 of 5 sentences to fix, 1 fixed');
 assert.deepEqual(last().readings.map(r=>[r.against,r.of,r.fixed]),[[1,5,1]],'1 of 5 and 1 fixed');
 assert.match(recapLine(last()),/1 of 5 sentences to fix, 1 fixed tonight/);
 assert.equal(getSession().history.filter(h=>h.kind==='writing').length,was,'the session reads the restated line');
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
});

test('rewrite case 7: rewriteState reads the verdict, and the TV inks the move from it, not from the status line',()=>{
 const {rewriteState}=rules();
 assert.equal(typeof rewriteState,'function');
 assert.equal(rewriteState(undefined),'none');
 assert.equal(rewriteState({n:2,verdict:'faulty',note:'x'}),'none','no rewrite yet');
 assert.equal(rewriteState({n:2,verdict:'strong',note:'x'}),'none');
 const was={text:OLD2,verdict:'faulty'};
 assert.equal(rewriteState({n:2,verdict:'strong',note:'x',was}),'holds');
 assert.equal(rewriteState({n:2,verdict:'neutral',note:'x',was}),'holds');
 assert.equal(rewriteState({n:2,verdict:'faulty',note:'x',was}),'still');
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.match(tv,/rewriteState\(/,'EssayTV asks the rule');
 const inked=[...tv.matchAll(/\binked=\{([^}]*)\}/g)].map(m=>m[1]);
 assert.ok(inked.length>=2,'Page and Move take inked');
 for(const x of inked)assert.doesNotMatch(x,/\blit\b|status|rewriteStatus/,`inked={${x}} is not derived from the status line`);
 const derived=tv.match(/const (\w+) = [^;]*rewriteStatus\(/);
 if(derived)for(const x of inked)assert.doesNotMatch(x,new RegExp(`\\b${derived[1]}\\b`),'the lit phone chip and the ink are two things');
});

test('specimen door: OK is offered only while the last-paragraph card is the focus',()=>{
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 const start=tv.indexOf('function LastParagraph');
 const end=tv.indexOf('function useCommit');
 assert.ok(start>0&&end>start);
 const body=tv.slice(start,end).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 const doors=[...body.matchAll(/<div className="em-door">([\s\S]*?)<\/div>/g)].map(m=>m[1]);
 assert.equal(doors.length,2,'the card has a door when a sentence needs a look, and when nothing does');
 for(const d of doors)assert.match(d,/\{focused && <span className="em-key">OK<\/span>\}/,'Select on a lens chooses the lens; the card must not advertise OK until it is the focus');
});

test('essay icons: every svg in EssayTV is hidden from the accessibility tree',()=>{
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 const stripped=tv.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 const tags=[...stripped.matchAll(/<svg\b[^>]*>/g)].map(m=>m[0]);
 const bare=tags.filter(t=>!/aria-hidden=/.test(t));
 assert.equal(bare.length,0,`${bare.length} of ${tags.length} svg tags omit aria-hidden: ${bare[0]??''}`);
 assert.ok(tags.length>=18,'the icon set and the drawn marks are all in this file');
});

test('x-ray rows: every playbook structure names rows the model paragraph actually has',()=>{
 const {PLAYBOOK}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 const stripped=tv.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 const at=stripped.indexOf('const XRAY_ROWS'),end=stripped.indexOf('export function Xray');
 assert.ok(at>0&&end>at);
 const block=stripped.slice(at,end);
 const lit=block.match(/const XRAY_ROWS[^=]*=\s*(\{[\s\S]*?\});/);
 assert.ok(lit,'XRAY_ROWS is a literal map');
 const rows=Function(`"use strict"; return (${lit[1]});`)();
 const roles=(block.match(/role:\s*"/g)||[]).length;
 assert.equal(roles,3,'the model paragraph is claim, evidence, link');
 const ids=PLAYBOOK.map(p=>p.id);
 assert.deepEqual(Object.keys(rows).sort(),[...ids].sort(),'a structure with no row list would light every sentence');
 for(const id of ids){
  assert.ok(rows[id].length>0,id);
  for(const i of rows[id])assert.ok(Number.isInteger(i)&&i>=0&&i<roles,`${id} lights row ${i}, and the paragraph has ${roles}`);
 }
});

// ---- W3: text in, one paragraph at a time (paragraphsOf, the file check, the length cap) ----
const {paragraphsOf,essayFileProblem,essayTooLong,ESSAY_FILE_MAX_BYTES,ESSAY_PARAGRAPH_MAX_CHARS}=require(path.join(root,'src/lib/rules/essay.ts'));
const P1='Many students are tired. Sleep is important. Schools start early. This is bad.';
const P2='Homework takes hours. Research found that teenagers sleep less. Therefore it should shrink.';
const P3='In conclusion, the school day should start later.';

test('paragraphsOf: one paragraph in is one paragraph out, and it reads exactly as before',()=>{
 assert.deepEqual(paragraphsOf(P1),[P1]);
 // the same reading input as today: the sentences of the paragraph are the sentences of the text as it was sent
 for(const p of [P1,P2,THREE,'No full stop here','Dr. Smith agreed. "Now," he said.','  padded   with   spaces.  '])
  assert.deepEqual(splitSentences(paragraphsOf(p)[0]),splitSentences(p),JSON.stringify(p));
 // a single paragraph broken over lines reads the same too
 const wrapped='The school day starts too early.\nResearch found that teenagers\nfall asleep later.\nTherefore the start should move.';
 assert.deepEqual(splitSentences(paragraphsOf(wrapped)[0]),splitSentences(wrapped));
 assert.equal(paragraphsOf(wrapped).length,1,'a text with no blank line is one paragraph');
});
test('paragraphsOf: blank lines split, in order; two and three paragraphs',()=>{
 assert.deepEqual(paragraphsOf(P1+'\n\n'+P2),[P1,P2]);
 assert.deepEqual(paragraphsOf([P1,P2,P3].join('\n\n')),[P1,P2,P3]);
 assert.deepEqual(paragraphsOf([P1,P2,P3].join('\n\n\n\n\n')),[P1,P2,P3],'a long run of blank lines is one break');
});
test('paragraphsOf: CRLF, lone CR, and lines that hold only spaces or tabs are blank lines',()=>{
 assert.deepEqual(paragraphsOf(P1+'\r\n\r\n'+P2+'\r\n\r\n'+P3),[P1,P2,P3]);
 assert.deepEqual(paragraphsOf(P1+'\r\r'+P2),[P1,P2]);
 assert.deepEqual(paragraphsOf(P1+'\n   \n'+P2),[P1,P2]);
 assert.deepEqual(paragraphsOf(P1+'\n \t \n\t\n'+P2),[P1,P2]);
 assert.deepEqual(paragraphsOf(P1+'\r\n  \r\n'+P2),[P1,P2]);
 assert.deepEqual(paragraphsOf(P1+'\n'+String.fromCharCode(0x2028)+'\n'+P2),[P1,P2],'a Unicode line separator is a line break');
});
test('paragraphsOf: leading and trailing blanks go; empty and whitespace-only text is no paragraphs',()=>{
 assert.deepEqual(paragraphsOf('\n\n  \n'+P1+'\n\n\n'),[P1]);
 assert.deepEqual(paragraphsOf('   '+P1+'   '),[P1]);
 for(const e of ['','   ','\n','\n\n\n','\r\n \r\n',' \t \n \t '])assert.deepEqual(paragraphsOf(e),[],JSON.stringify(e));
});
test('paragraphsOf: never throws; a non-string gives []',()=>{
 for(const v of [undefined,null,0,42,NaN,true,{},[],['a'],()=>1,Symbol('x'),{toString:()=>'x'}])assert.deepEqual(paragraphsOf(v),[],String(typeof v));
 assert.doesNotThrow(()=>paragraphsOf(String.fromCharCode(0)+'\ud800 lone surrogate \n\n '+String.fromCharCode(0xfffd)));
});
test('paragraphsOf: inner line breaks become single spaces',()=>{
 assert.deepEqual(paragraphsOf('One line.\nTwo lines.\r\nThree lines.'),['One line. Two lines. Three lines.']);
 assert.deepEqual(paragraphsOf('First part\n   continues here.\n\nSecond.'),['First part continues here.','Second.']);
 for(const p of paragraphsOf(P1+'\n'+P2+'\n\n'+P3))assert.doesNotMatch(p,/[\r\n]/);
});
test('paragraphsOf: a very long single paragraph stays one',()=>{
 const long=(P1+' ').repeat(400).trim();
 assert.ok(long.length>ESSAY_PARAGRAPH_MAX_CHARS);
 assert.deepEqual(paragraphsOf(long),[long],'the splitter never cuts a paragraph by length; the cap is the route\'s job');
 assert.equal(paragraphsOf('word '.repeat(50000)).length,1);
});
test('paragraphsOf: a markdown heading is its own item; that is the whole rule for titles',()=>{
 assert.deepEqual(paragraphsOf('# Later school starts\n\n'+P1),['# Later school starts',P1],'a title, a blank line, a paragraph');
 assert.deepEqual(paragraphsOf('## Why\n'+P1+'\n\n'+P2),['## Why',P1,P2],'a heading never fuses with the lines under it');
 assert.deepEqual(paragraphsOf(P1+'\n### Next part\n'+P2),[P1,'### Next part',P2],'nor with the lines above it');
 assert.deepEqual(paragraphsOf('Later school starts\n\n'+P1),['Later school starts',P1],'a title-only first line before a blank line is an item of its own');
 assert.deepEqual(paragraphsOf('#hashtag is not a heading. It is one paragraph.'),['#hashtag is not a heading. It is one paragraph.']);
});

test('essayFileProblem: .txt and .md are fine; a .docx, a .jpg and other types are refused in one plain sentence',()=>{
 for(const f of [{name:'essay.txt',type:'text/plain',size:900},{name:'Essay.TXT',type:'text/plain',size:900},{name:'draft.md',type:'text/markdown',size:900},
  {name:'draft.md',type:'',size:900},{name:'draft.md',type:'application/octet-stream',size:900},{name:'a.md',type:'text/x-markdown',size:1}])
  assert.equal(essayFileProblem(f),null,JSON.stringify(f));
 const refused=[
  {name:'essay.docx',type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',size:900},
  {name:'essay.docx',type:'',size:900},{name:'page.jpg',type:'image/jpeg',size:900},{name:'page.png',type:'image/png',size:900},
  {name:'essay.pdf',type:'application/pdf',size:900},{name:'essay',type:'text/plain',size:900},{name:'essay.txt.exe',type:'text/plain',size:900},
  {name:'essay.txt',type:'image/jpeg',size:900},{name:'essay.md',type:'application/pdf',size:900},{name:'',type:'',size:900}];
 for(const f of refused){const m=essayFileProblem(f);assert.equal(typeof m,'string',JSON.stringify(f));assert.match(m,/\.txt and \.md/);assert.doesNotMatch(m,/—|–/,'no dashes in copy');}
});
test('essayFileProblem: a file over the limit, an empty file and a size that is not a number are refused',()=>{
 assert.equal(ESSAY_FILE_MAX_BYTES,100*1024);
 assert.equal(essayFileProblem({name:'a.txt',type:'text/plain',size:ESSAY_FILE_MAX_BYTES}),null,'exactly at the limit is fine');
 assert.match(essayFileProblem({name:'a.txt',type:'text/plain',size:ESSAY_FILE_MAX_BYTES+1}),/too big/);
 assert.match(essayFileProblem({name:'a.md',type:'text/markdown',size:5*1024*1024}),/too big/);
 assert.match(essayFileProblem({name:'a.txt',type:'text/plain',size:0}),/empty/);
 for(const size of [undefined,null,'900',NaN,-1,Infinity])assert.equal(typeof essayFileProblem({name:'a.txt',type:'text/plain',size}),'string',String(size));
 assert.doesNotThrow(()=>essayFileProblem(undefined));assert.doesNotThrow(()=>essayFileProblem(null));assert.doesNotThrow(()=>essayFileProblem({}));
});
test('essayFileProblem: the text itself is checked once it is read: NUL bytes, a run of replacement marks, nothing but blanks',()=>{
 const ok={name:'a.txt',type:'text/plain',size:900};
 assert.equal(essayFileProblem(ok,P1+'\n\n'+P2),null);
 assert.equal(essayFileProblem(ok,'Café and naïve, a smart “quote”.'),null,'ordinary non-ASCII text is fine');
 assert.match(essayFileProblem(ok,'PK'+String.fromCharCode(3,4,0)+'binary'),/plain text/,'a NUL byte');
 assert.match(essayFileProblem(ok,'x'+String.fromCharCode(0xfffd).repeat(8)+'y'),/plain text/,'a binary file decoded as text is mostly replacement marks');
 assert.equal(essayFileProblem(ok,'One stray mark '+String.fromCharCode(0xfffd)+' in a real essay.'),null,'one bad character does not refuse a real essay');
 assert.match(essayFileProblem(ok,'   \n\n  \t '),/empty/);
 assert.match(essayFileProblem(ok,''),/empty/);
});

test('essayTooLong: a paragraph over the cap is refused with a sentence that says split it; at the cap it passes',()=>{
 assert.equal(ESSAY_PARAGRAPH_MAX_CHARS,4000);
 assert.equal(essayTooLong('a'.repeat(ESSAY_PARAGRAPH_MAX_CHARS)),null);
 assert.equal(essayTooLong(P1),null);
 assert.equal(essayTooLong(''),null);
 const m=essayTooLong('a'.repeat(ESSAY_PARAGRAPH_MAX_CHARS+1));
 assert.equal(typeof m,'string');assert.match(m,/Split it/);assert.match(m,/4000/);assert.doesNotMatch(m,/—|–/);
 for(const v of [undefined,null,5,{},[]])assert.equal(essayTooLong(v),null,'not text: not this check\'s business');
});
test('the analyse route asks essayTooLong before it starts a run, on the essay branch only, and refuses with a 400',()=>{
 const src=fs.readFileSync(path.join(root,'src/app/api/analyse/route.ts'),'utf8');
 const at=src.indexOf('essayTooLong(body.text)');
 assert.ok(at>0,'the route checks the cap');
 assert.ok(at>src.indexOf('body.kind === "rewrite"'),'after the english and rewrite branches, so those are not capped');
 assert.ok(at<src.indexOf('runJob("analyse", async () => {\n    dispatch({ type: "essay.type"'),'before the essay run starts');
 assert.match(src.slice(at,at+200),/status: 400/);
});
test('the phone page: no essay in the capture picker, no essay sample, the file picker takes .txt and .md, and it uses the pure rules',()=>{
 const src=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 const capture=src.slice(src.indexOf('{screen === "capture" && ('),src.indexOf('{screen === "practice" && s'));
 assert.ok(capture.length>2000,'the capture panel was found');
 assert.doesNotMatch(capture,/Essay Master/,'the capture panel offers no Essay Master');
 assert.doesNotMatch(capture,/value="essay"/);
 assert.doesNotMatch(src.slice(0,src.indexOf('/** The TV\'s screens')),/id: "essay"/,'no essay page among the samples');
 assert.match(src,/type="file" accept="\.txt,\.md,/);
 assert.match(src,/essayFileProblem\(f\)/);assert.match(src,/paragraphsOf\(/);assert.match(src,/essayTooLong\(/);
 assert.doesNotMatch(src,/FormData|\/api\/upload/,'a picked file is read in the browser, never uploaded');
});

test('seat case 6: a reading that finishes after the desk was handed to another learner lands in the asker\'s slot, not on the new learner\'s desk',async()=>{
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 const before=getLearner('ema').history.length;
 let release;
 answer=()=>new Promise((r)=>{release=()=>r({json:{verdicts:[{n:1,verdict:'strong',note:'ok'},{n:2,verdict:'faulty',note:'x'},{n:3,verdict:'neutral',note:'ok'}],summary:'Ema\'s reading.'},provider:'test',ms:1});});
 const pending=analyse({kind:'essay',text:THREE,type:'evidence'});
 while(!release)await new Promise((r)=>setTimeout(r,5));
 dispatch({type:'learner.set',id:'jakub'});
 release();
 const res=await pending;
 assert.equal(res.status,200);
 const s=getSession();
 assert.equal(s.learner.id,'jakub');
 assert.equal(s.essay,null,'nothing of Ema\'s on Jakub\'s desk');
 assert.equal(s.essayType,null);
 assert.equal(s.screen,'landing','the TV stays on the landing');
 assert.equal(s.away.ema.essay.summary,'Ema\'s reading.');
 assert.equal(s.away.ema.essayType,'evidence');
 assert.equal(getLearner('ema').history.length,before+1,'her history holds the one reading');
 dispatch({type:'learner.set',id:'ema'});
 assert.equal(getSession().essay.summary,'Ema\'s reading.');
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
});

// ---- Essay plan slots (challenge essay-master-B): the Paragraph's three slots, filled in the learner's own words ----
const PLAN=()=>require(path.join(root,'src/lib/rules/essay.ts'));
const {PLAYBOOK:PB}=require(path.join(root,'src/lib/library/lessons.data.ts'));
const PARA=PB.find(p=>p.id==='para');
const CLAIM='Schools should start later.',EVID='Research found that teenagers fall asleep two hours later.',LINK='A later start fits how they sleep.';
const plan3=(...slots)=>({lens:'structure',slots:[...slots,...Array(3-slots.length).fill('')]});

test('plan case 1: planSlots derives the slots and their roles from the pattern, never a hand list',()=>{
 const {planSlots}=PLAN();
 assert.deepEqual(planSlots(PARA),[{label:'Your claim',role:'claim'},{label:'the evidence',role:'evidence'},{label:'the link back',role:'link'}]);
 const turned=planSlots({pattern:'This shows [the link back]. [Your claim]. For example, [the evidence].'});
 assert.deepEqual(turned.map(x=>x.role),['link','claim','evidence'],'a reordered pattern gives the new order');
 assert.deepEqual(turned.map(x=>x.label),['the link back','Your claim','the evidence']);
 assert.deepEqual(planSlots({pattern:'no slots here.'}),[]);
});

test('plan case 2: planFill refuses a blank, two sentences, a leftover bracket and an over-long text, and leaves the plan unchanged',()=>{
 const {planFill,ESSAY_PARAGRAPH_MAX_CHARS}=PLAN();
 const p=plan3(CLAIM),before=JSON.stringify(p);
 const long='A'+'a'.repeat(ESSAY_PARAGRAPH_MAX_CHARS)+'.';
 for(const [text,re] of [['   ',/first/i],['It is early. It is dark.',/2 sentences/],['The [evidence] goes here.',/bracket/i],[long,/too long/i],['no capital and no stop',/capital|full stop/i]]){
  const r=planFill(p,1,text);assert.equal(r.ok,false,text.slice(0,30));assert.match(r.error,re,text.slice(0,30));
 }
 assert.equal(planFill(p,7,CLAIM).ok,false,'no such slot');
 assert.equal(JSON.stringify(p),before,'the plan passed in is never changed');
 const ok=planFill(p,1,'  '+EVID.replace(' that ',' that   ')+' ');
 assert.equal(ok.ok,true);assert.deepEqual(ok.plan.slots,[CLAIM,EVID,''],'stored as written, spaces normalised');
 assert.equal(ok.plan.lens,'structure');
});

test('plan case 3: planFit comments on a role mismatch and never blocks the ink',()=>{
 const {planSlots,planFill,planFit}=PLAN();
 const slots=planSlots(PARA);
 assert.equal(planFit(slots,0,EVID),'That reads as evidence. This slot wants your claim: the side you take.');
 assert.equal(planFit(slots,1,EVID),null);
 assert.equal(planFit(slots,0,CLAIM),null);
 assert.equal(planFill(plan3(),0,EVID).ok,true,'the slot inks because it is written, whatever the comment says');
 assert.equal(planFit(slots,9,EVID),null);
});

test('plan case 4: a phone-posted essay.slot fills the slot, moves focus to the first empty one, and a refusal changes nothing',()=>{
 dispatch({type:'reset'});
 dispatch({type:'essay.slot',i:0,text:CLAIM});
 assert.equal(getSession().essayPlan,undefined,'no learner: nothing is written for no one');
 dispatch({type:'learner.set',id:'ema'});
 dispatch({type:'essay.slot',i:0,text:CLAIM});
 assert.equal(getSession().essayPlan,undefined,'no plan open: nothing to fill');
 dispatch({type:'essay.plan',lens:'evidence'});dispatch({type:'nav',screen:'essayplan',focus:0});
 assert.deepEqual(getSession().essayPlan,{lens:'evidence',slots:['','','']});
 dispatch({type:'essay.slot',i:1,text:EVID});
 let s=getSession();
 assert.deepEqual(s.essayPlan.slots,['',EVID,'']);assert.equal(s.focus,0,'focus on the first empty slot');
 const kept=JSON.stringify(s.essayPlan);
 dispatch({type:'essay.slot',i:2,text:'Two. Sentences.'});dispatch({type:'essay.slot',i:2,text:'[the link back]'});
 assert.equal(JSON.stringify(getSession().essayPlan),kept,'a refused text leaves essayPlan untouched');
 dispatch({type:'essay.slot',i:0,text:CLAIM});
 assert.equal(getSession().focus,2);
 dispatch({type:'essay.slot',i:2,text:LINK});
 assert.equal(getSession().focus,3,'all written: focus on Read it');
 const route=fs.readFileSync(path.join(root,'src/app/api/session/route.ts'),'utf8');
 assert.doesNotMatch(route.split('SERVER_ONLY')[1].split('};')[0],/essay\.slot|essay\.plan/,'the phone may post a slot');
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
});

test('plan case 6: planText is the learner\'s sentences only and splits back into exactly the slots',()=>{
 const {planText,splitSentences}=PLAN();
 const p=plan3(CLAIM,EVID,LINK),t=planText(p);
 assert.equal(t,[CLAIM,EVID,LINK].join(' '));
 assert.doesNotMatch(t,/For example,|This shows/);
 assert.deepEqual(splitSentences(t).map(x=>x.text),p.slots);
 assert.equal(planText(plan3(CLAIM,'',LINK)),CLAIM+' '+LINK,'an empty slot adds nothing');
 const own=plan3(CLAIM,'For example, sleep studies agree.',LINK);
 assert.match(planText(own),/^Schools should start later\. For example, sleep studies agree\./,'a frame word the learner wrote stays');
});

// ---- the reading core keeps paragraphs (adult plan D1; v2 decisions 2026-10-07 E1) ----
{
const R=require(path.join(root,'src/lib/rules/essay.ts'));
const PIECE='# Sleep and school\n\nThe school day starts too early. Research found that teenagers fall asleep later.\n\nA later start would help.\nTherefore the start should move.\n\nIn conclusion, the bell should ring at nine.';
test('D1: a one-paragraph text reads exactly as before: no para field, same numbers and texts',()=>{
 const s=splitSentences(THREE);
 assert(s.every(x=>!('para' in x)),'a single paragraph carries no para');
 assert.deepEqual(s.map(x=>x.text),['The school day starts too early.','Research found that teenagers fall asleep later.','Therefore the start should move.']);
 assert.deepEqual(splitSentences('One line.\nSame paragraph, next line.').map(x=>x.para),[undefined,undefined],'a single line break is not a new paragraph');
 assert.equal(R.numberedLines(s).includes('Paragraph'),false,'the prompt for one paragraph is unchanged');
});
test('D1: a piece keeps its paragraphs; numbering runs on; no sentence crosses a break',()=>{
 const s=splitSentences(PIECE);
 assert.deepEqual(s.map(x=>x.n),[1,2,3,4,5,6]);
 assert.deepEqual(s.map(x=>x.para),[0,1,1,2,2,3]);
 assert.equal(s[0].text,'# Sleep and school','a heading is its own paragraph, never fused to the first sentence');
 assert.equal(R.paragraphCount(s),4);
 assert.equal(R.joinSentences(s),'# Sleep and school\n\nThe school day starts too early. Research found that teenagers fall asleep later.\n\nA later start would help. Therefore the start should move.\n\nIn conclusion, the bell should ring at nine.');
 const lines=R.numberedLines(s);
 assert.match(lines,/^Paragraph 1:\n1\. # Sleep/);assert.match(lines,/\n\nParagraph 2:\n2\. The school day/);assert.match(lines,/\nParagraph 4:\n6\. In conclusion/);
 // before D1, a paragraph that ended with no full stop ran into the next one
 assert.deepEqual(splitSentences('No full stop here\n\nNext paragraph starts.').map(x=>x.text),['No full stop here','Next paragraph starts.']);
});
test('D1: three paragraphs keep their breaks through a rewrite; a rewrite still must stay one sentence',()=>{
 const reading={text:PIECE,type:'structure',sentences:splitSentences(PIECE),stats:{},verdicts:[],summary:''};
 const r=R.revise(reading,4,'A start at nine would let them sleep.');
 assert(r.ok,r.error);
 assert.deepEqual(r.reading.sentences.map(x=>x.para),[0,1,1,2,2,3],'the rewritten sentence keeps its paragraph');
 assert.equal(r.reading.text.split('\n\n').length,4,'the breaks survive the rebuild');
 assert.equal(r.reading.sentences[3].text,'A start at nine would let them sleep.');
 const twice=R.revise(r.reading,6,'The bell should ring at nine instead.');
 assert(twice.ok);assert.equal(twice.reading.text.split('\n\n').length,4,'and a second rewrite');
 assert.equal(R.revise(reading,2,'two. Sentences here.').ok,false);
 assert.equal(R.revise(reading,5,'and so the start should move.').ok,false,'inside a paragraph a lowercase start would fuse with the sentence before it, as before D1');
});
test('D1: a piece is read with paragraphs named in the prompt; verdicts still anchor by number',async()=>{
 seen=[];answer=reply({verdicts:[{n:6,verdict:'faulty',note:'Restates.'},{n:9,verdict:'faulty',note:'none'}],summary:'ok'});
 const a=await analyseEssay(PIECE,'structure','ema',15);
 assert.match(seen.at(-1).prompt,/piece, 4 paragraphs/);assert.match(seen.at(-1).prompt,/Paragraph 3:/);
 assert.deepEqual(a.verdicts.map(v=>v.n),[6],'a number past the end is dropped, as before');
 assert.deepEqual(a.sentences.map(x=>x.para),[0,1,1,2,2,3]);
});
}

// ---- the model observes, code rules (challenge essay-master-A): every verdict is decided in rules/essay ----
// These send observations directly. Where a legacy `verdict` rides beside one it is there to show it is ignored.
const obsReply=(observations)=>reply({observations,summary:'s'});
const verdictsOf=(a)=>a.verdicts.map(v=>[v.n,v.verdict]);

test('essay-master-A case 1: Structure - only the FIRST unsupported claim is faulty; a claim with a marked evidence sentence after it is strong; the legacy verdict is ignored',async()=>{
 answer=obsReply([1,2,3].map(n=>({n,job:'claim',verdict:'strong'})));
 const a=await analyseEssay('Homework is pointless. Teachers give too much. It ruins evenings.','structure','oa-1');
 assert.deepEqual(verdictsOf(a),[[1,'faulty'],[2,'neutral'],[3,'neutral']],'one unsupported claim is named, the rest are not piled on');
 answer=obsReply([{n:1,job:'claim',verdict:'faulty'},{n:2,job:'evidence',verdict:'faulty'},{n:3,job:'claim',verdict:'faulty'}]);
 const b=await analyseEssay('Homework is pointless. Research found that pupils lose sleep. It ruins evenings.','structure','oa-1');
 assert.deepEqual(verdictsOf(b),[[1,'strong'],[2,'strong'],[3,'faulty']],'claim 1 has marked evidence after it; claim 3 is the first without');
 answer=obsReply([{n:1,job:'claim'},{n:2,job:'evidence'}]);
 const c=await analyseEssay('Homework is pointless. Teachers give too much.','structure','oa-1');
 assert.deepEqual(verdictsOf(c),[[1,'faulty'],[2,'neutral']],'evidence with no EVIDENCE marker does not support a claim');
 assert.equal(a.verdicts[0].note,'This claim has no evidence after it that a reader can check.','no note from the model: the failed check\'s own line');
});
test('essay-master-A case 2: Argument - a turn the model claims is refused unless the sentence holds a contrast connector',async()=>{
 answer=obsReply([{n:1,side:'against',turnsBack:true,note:'x'}]);
 const a=await analyseEssay('Some people say early starts build discipline.','argument','oa-2');
 assert.deepEqual(verdictsOf(a),[[1,'faulty']],'no contrast connector, so no turn');
 const b=await analyseEssay('Some say early starts build discipline, but tired pupils learn less.','argument','oa-2');
 assert.deepEqual(verdictsOf(b),[[1,'strong']]);
 answer=obsReply([{n:1,side:'against',turnsBack:false,note:'x'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Some say early starts build discipline, but tired pupils learn less.','argument','oa-2')),[[1,'faulty']],'a connector alone is not a turn the model saw');
});
test('essay-master-A case 3: Language - a vague word must be in the sentence; length is counted by code',async()=>{
 const {LONG_SENTENCE_WORDS}=rules();
 answer=obsReply([{n:1,issues:[{kind:'vague',word:'important'}],note:'vague'}]);
 const a=await analyseEssay('Sleep matters.','language','oa-3');
 assert.deepEqual(verdictsOf(a),[[1,'neutral']],'the word is not in the sentence: the issue is dropped');
 const long=`The ${Array(LONG_SENTENCE_WORDS-1).fill('long').join(' ')} end.`;
 assert.equal(splitSentences(long)[0].words,LONG_SENTENCE_WORDS+1,'a 36-word sentence');
 answer=obsReply([]);
 const b=await analyseEssay(long,'language','oa-3');
 assert.deepEqual(verdictsOf(b),[[1,'faulty']],'no observed issue, faulty by length alone');
 assert.match(b.verdicts[0].note,/36 words/);
 const edge=`The ${Array(LONG_SENTENCE_WORDS-2).fill('long').join(' ')} end.`;
 assert.equal((await analyseEssay(edge,'language','oa-3')).verdicts.length,0,'exactly at the limit is fine');
 answer=obsReply([{n:1,issues:[{kind:'vague',word:'important'}],note:''}]);
 const c=await analyseEssay('Sleep is important.','language','oa-3');
 assert.deepEqual(verdictsOf(c),[[1,'faulty']]);
 assert.match(c.verdicts[0].note,/important/,'an empty note becomes the failed check\'s line');
});
test('essay-master-A case 4: Evidence - checkable is strong only with an EVIDENCE marker or a number; an opinion with nothing checkable after it is faulty',async()=>{
 answer=obsReply([{n:1,support:'checkable',note:'x'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Teenagers are just lazy.','evidence','oa-4')),[[1,'neutral']],'never strong without a marker');
 answer=obsReply([{n:1,support:'checkable',note:'x'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Research found that teenagers fall asleep later.','evidence','oa-4')),[[1,'strong']]);
 answer=obsReply([{n:1,support:'opinion',note:'x'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Teenagers are just lazy.','evidence','oa-4')),[[1,'faulty']]);
 answer=obsReply([{n:1,support:'opinion',note:'x'},{n:2,support:'checkable',note:'y'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Teenagers are just lazy. A 2019 study measured their sleep.','evidence','oa-4')),[[1,'neutral'],[2,'strong']],'an opinion with checkable support after it is not left bare');
});
test('essay-master-A case 5: a rewrite is decided by the same rule - the move stays hatched until the check passes',async()=>{
 const {reviseSentence}=deskEssay();
 const text='Homework is pointless. Some people say early starts build discipline. Pupils need their evenings.';
 const s=splitSentences(text);
 const reading={text,type:'argument',sentences:s,stats:paragraphStats(s),verdicts:[{n:2,verdict:'faulty',note:'No turn.'}],summary:'s',provider:'test'};
 answer=obsReply([{n:2,verdict:'strong',side:'against',turnsBack:false,note:'x'}]);
 const still=await reviseSentence(reading,2,'Some say early starts build discipline.');
 assert.equal(still.verdicts.find(v=>v.n===2).verdict,'faulty','the stub said strong; the observation decides');
 assert.equal(rules().rewriteState(still.verdicts.find(v=>v.n===2)),'still');
 answer=obsReply([{n:2,verdict:'faulty',side:'against',turnsBack:true,note:'ok'}]);
 const holds=await reviseSentence(reading,2,'Although some say early starts build discipline, pupils need their evenings.');
 assert.equal(holds.verdicts.find(v=>v.n===2).verdict,'strong');
 assert.equal(rules().rewriteState(holds.verdicts.find(v=>v.n===2)),'holds');
 // a missing or unreadable observation for sentence n still fails the run: it never becomes a neutral 'holds'
 for(const observations of [[],[{n:1,side:'pushes'}],[{n:2,note:'x'}],[{n:2,side:'great'}],'nope',undefined]){
  answer=obsReply(observations);
  await assert.rejects(reviseSentence(reading,2,'Some say early starts build discipline.'),/no observation/,JSON.stringify(observations));
 }
});
test('essay-master-A case 6: the learner record counts code\'s verdicts, not the legacy ones',async()=>{
 answer=obsReply([{n:1,side:'wanders',verdict:'strong'},{n:2,side:'wanders',verdict:'strong'},{n:3,side:'pushes',verdict:'strong'}]);
 const a=await analyseEssay(THREE,'argument','oa-6');
 assert.deepEqual(verdictsOf(a),[[1,'faulty'],[2,'faulty'],[3,'strong']]);
 const l=getLearner('oa-6');
 assert.equal(l.history.at(-1).detail,'2 of 3 sentences to fix');
 assert.equal(l.writing.argument.right,0,'two of three faulty is not under a quarter');
 assert.deepEqual({...l.digest.at(-1),at:0},{at:0,kind:'essay',lens:'argument',sentences:3,faulty:2});
});
test('essay-master-A case 7: the prompt no longer asks for a verdict; the withholding rules are still in it verbatim',async()=>{
 const {NEVER_REWRITE,PATTERN_RULE}=deskEssay();
 for(const lens of ['structure','argument','evidence','language']){
  seen=[];answer=obsReply([]);
  await analyseEssay(THREE,lens,'oa-7');
  const {system,schema}=seen[0];
  assert.doesNotMatch(system,/'faulty' for a real problem/);
  assert.doesNotMatch(system,/one verdict per sentence/i);
  assert.ok(system.includes(NEVER_REWRITE)&&system.includes(PATTERN_RULE),`${lens}: NEVER_REWRITE and PATTERN_RULE verbatim`);
  assert.equal(schema.properties.verdicts,undefined,'the schema has no verdicts list');
  const item=schema.properties.observations.items;
  assert.equal('verdict' in item.properties,false,`${lens}: no verdict property on a sentence`);
  assert.equal(JSON.stringify(schema).includes('"verdict"'),false);
 }
 seen=[];answer=obsReply([{n:2,support:'checkable'}]);
 const {reviseSentence}=deskEssay();
 await reviseSentence(R3(),2,STUDY);
 assert.doesNotMatch(seen[0].system,/'strong' if it now does its job/);
 assert.equal('verdict' in seen[0].schema.properties.observations.items.properties,false);
});
test('essay-master-A case 8 (GUARD): observations that cannot be read are neutral, never throw, and a fix rides only on a code-faulty sentence',async()=>{
 const junk=[
  [{n:9,job:'claim'},{n:0,job:'claim'},{n:-1,job:'claim'},{n:'1',job:'claim'},{job:'claim'},null,'x',7],
  'not an array',undefined,null,{n:1},
 ];
 for(const observations of junk){
  answer=obsReply(observations);
  const a=await analyseEssay(THREE,'structure','oa-8');
  assert.deepEqual(a.verdicts,[],JSON.stringify(observations));
 }
 for(const [lens,bad] of [['structure',{job:'boss'}],['argument',{side:'sideways'}],['evidence',{support:'vibes'}],['language',{issues:'many'}]]){
  answer=obsReply([{n:1,...bad,note:'x',fix:CONCEDE}]);
  const a=await analyseEssay(THREE,lens,'oa-8');
  assert.deepEqual(a.verdicts,[{n:1,verdict:'neutral',note:'x'}],`${lens}: an unknown value is neutral, with its fix dropped`);
 }
 // a fix on a sentence code rules neutral or strong is dropped; on a faulty one it stays
 answer=obsReply([{n:1,side:'pushes',fix:CONCEDE,note:'a'},{n:2,side:'wanders',fix:CONCEDE,note:'b'},{n:3,side:'neutral',fix:CONCEDE,note:'c'}]);
 const b=await analyseEssay(THREE,'argument','oa-8');
 assert.deepEqual(b.verdicts.map(v=>[v.n,v.verdict,'fix' in v]),[[1,'strong',false],[2,'faulty',true],[3,'neutral',false]]);
});
test('a note never carries a verdict label: the verdict is code\'s',async()=>{
 const one=async(lens,o)=>{answer=obsReply([{n:1,...o}]);const a=await analyseEssay('Sleep matters a lot.',lens,'oa-label');return [a.verdicts[0].verdict,a.verdicts[0].note];};
 assert.deepEqual(await one('evidence',{support:'context',note:'Strong: a named place, year, start times and 34 minutes make this easy to check.'}),['neutral','A named place, year, start times and 34 minutes make this easy to check.']);
 for(const [said,kept] of [['faulty - it says x','It says x'],['NEUTRAL — y','Y'],['Weak: z','Z'],['ok: w','W']])
  assert.deepEqual(await one('argument',{side:'pushes',note:said}),['strong',kept],said);
 assert.deepEqual(await one('argument',{side:'wanders',note:'Strong:'}),['faulty','This sentence wanders from the side the paragraph takes.']);
 assert.deepEqual(await one('argument',{side:'pushes',note:'Strong:'}),['strong','']);
 for(const note of ['Strongly worded, but no source.','Good use of a number.','Strong evidence: the study names its year.','This is a strong claim.','Fine-grained detail would help.'])
  assert.equal((await one('argument',{side:'pushes',note}))[1],note,note);
 const {reviseSentence}=deskEssay();
 answer=obsReply([{n:2,support:'checkable',note:'Strong: names the study.'}]);
 const r=await reviseSentence(R3(),2,STUDY);
 assert.equal(r.verdicts.find(v=>v.n===2).note,'Names the study.');
});
