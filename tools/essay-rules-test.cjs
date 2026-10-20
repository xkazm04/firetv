/**
 * Essay Master's offline rules: the sentence splitter, and the sentence-number anchoring that
 * keeps a model's highlight on a sentence that exists. Run with npm test in desk/ (directly:
 * node tools/essay-rules-test.cjs). No model is called; a disposable data directory, never desk/data.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'desk-essay-rules-'));
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
 structure:{faulty:{job:'link'},strong:{job:'evidence',supports:0},neutral:{job:'context'}},
 argument:{faulty:{side:'wanders'},strong:{side:'pushes'},neutral:{side:'neutral'}},
 evidence:{faulty:{support:'opinion'},strong:{support:'checkable',backs:0},neutral:{support:'context'}},
};
// the sentences a fixture did not name, answered neutral only so the reading is whole: analyseEssay below leaves their entries out of the verdicts
const filler=new Set();
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
 // E7: a reading must answer every sentence it judges, so a fixture that names only some gets a neutral observation for the rest
 if(req.use==='essay-read'&&Array.isArray(observations)){
  const para=/Judge only paragraph \d+ of \d+: sentences (\d+) to (\d+)/.exec(req.prompt);
  for(const [n] of text){
   if(para&&(n<Number(para[1])||n>Number(para[2])))continue;
   if(!observations.some(o=>o&&o.n===n)){observations.push({n,note:'ok',...field({verdict:'neutral'})});filler.add(n);}
  }
 }
 return {...r,json:{...rest,observations}};
};
let answer,seen=[];engine.text=(req)=>{seen.push(req);return Promise.resolve(answer(req)).then(r=>asObservations(req,r));};
const {NOT_EVERY_SENTENCE}=require(path.join(root,'src/lib/desk/essay.ts'));
const deskEssayModule=require(path.join(root,'src/lib/desk/essay.ts'));
const analyseEssay=async(...args)=>{filler.clear();const a=await deskEssayModule.analyseEssay(...args);return {...a,verdicts:a.verdicts.filter(v=>!filler.has(v.n))};};
const {getLearner,addHistory,recordWriting,recordAttempt}=require(path.join(root,'src/lib/session/learners.ts'));
const {lensStandings,writingTotals}=require(path.join(root,'src/tv/writingRows.ts'));
const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
test('GUARD: the disposable data directory is under the OS temp dir, never inside the tree (repo law)',()=>{
 const rel=path.relative(require('node:os').tmpdir(),process.env.DESK_DATA_DIR);
 assert.ok(rel&&!rel.startsWith('..')&&!path.isAbsolute(rel),process.env.DESK_DATA_DIR);
});
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
test('UD-19: below ENGLISH_MIN_WORDS a Czech-majority reading is not English; a short English one still is',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 for(const t of ['Je škola důležitá?','Škola začíná','Žáci nemají rádi úkoly, protože jsou pro ně příliš dlouhé a nudné, ale učitelé je stejně dávají.'])assert.equal(R.paragraphIsEnglish(t),false,t);
 for(const t of ['Hello there','Slavoj Žižek','Is school important?'])assert.equal(R.paragraphIsEnglish(t),true,t);
});
test('UD-18: LINK needs a word boundary: Some children walk to school is a claim, So it goes is a link',()=>{
 assert.equal(splitSentences('Some children walk to school.')[0].role,'claim');
 assert.equal(splitSentences('Therefore, children should walk.')[0].role,'link');
 assert.equal(splitSentences('So children should walk.')[0].role,'link');
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
 assert.match(lines[1],/^2\. "Research found that teenagers fall asleep later\." {2}\[7 words, first-pass role: evidence\]$/,'the sentence quoted as data, the desk\'s note beside it');
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
 assert.equal(a.sentences.length,3);assert.equal(a.summary,'1 of 3 sentences to fix. Start with sentence 3: '+a.verdicts[1].note,'E9: the summary is code\'s line, never the model\'s');assert.equal(a.type,'structure');
 assert.equal(a.text,THREE,'the learner\'s own text is returned unchanged, not the collapsed one');
});
test('a single-sentence paragraph admits verdict 1 and nothing else',async()=>{
 answer=reply({verdicts:[{n:1,verdict:'faulty',note:'no evidence'},{n:2,verdict:'faulty',note:'there is no sentence 2'}],summary:'One claim only.'});
 const a=await analyseEssay('Homework is pointless.','evidence','essay-anon');
 assert.deepEqual(a.verdicts.map(v=>v.n),[1]);
});
test('verdicts the model malformed never reach the screen, and never throw',async()=>{
 for(const verdicts of [undefined,null,'not an array',[{n:'1',verdict:'strong',note:'a string number'}],[{verdict:'strong',note:'no number at all'}]]){
  answer=obsReply(verdicts);
  // E7: an answer no sentence of which can be read is a reading of no sentence, so it fails and counts nothing
  await assert.rejects(analyseEssay(THREE,'language','essay-anon'),{message:NOT_EVERY_SENTENCE},JSON.stringify(verdicts));
 }
});
// ---- the fix: how to rephrase a faulty sentence, as a named move and a pattern with [slots] - never the sentence rewritten ----
const SIX='Many students arrive at school exhausted. Research found that the body clock shifts later. An early start therefore cuts into sleep. Of course, a lot of teenagers just stay up on their phones, so it is really their own fault. Schools that moved the start saw attendance rise. A later start is a way of teaching them when they can learn.';
const CONCEDE={move:'Concede, then turn it back',pattern:'Although [the other side], [why your claim still holds].'};
test('a faulty verdict keeps a valid fix, trimmed, and the verdict itself is untouched',async()=>{
 answer=reply({verdicts:[{n:4,verdict:'faulty',note:'This argues the other side.',fix:{move:'  Concede,  then turn it back ',pattern:' Although [the other side],\n [why your claim still holds]. '}}],summary:'s'});
 const a=await analyseEssay(SIX,'argument','essay-fix');
 assert.equal(a.sentences.length,6);
 assert.deepEqual(a.verdicts,[{n:4,verdict:'faulty',note:'This sentence wanders from the side the paragraph takes.',fix:CONCEDE}],'whitespace collapses; move and pattern survive as given');
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
  assert.equal(a.verdicts[0].note,'This sentence wanders from the side the paragraph takes.','a faulty verdict speaks the check line, not the model note');
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
  assert.deepEqual(a.verdicts,[{n:4,verdict:'faulty',note:'This sentence wanders from the side the paragraph takes.'}],JSON.stringify(fix));
 }
});
test('cleanFix is the one rule: the TV and the engine read the same shape',()=>{
 const {cleanFix}=require(path.join(root,'src/lib/rules/essay.ts'));
 assert.deepEqual(cleanFix(CONCEDE,'Of course, a lot of teenagers just stay up on their phones.'),CONCEDE);
 assert.deepEqual(cleanFix({move:'Claim, then evidence',pattern:'[Your claim]. For example, [the evidence].'}),{move:'Claim, then evidence',pattern:'[Your claim]. For example, [the evidence].'},'a pattern may open on a slot');
 assert.equal(cleanFix(undefined),undefined);
});
test('cleanFix refuses a frame that hands over a neighbour sentence, a sentence in a slot, or new content (recert-3/L1-daniel-15-EM2-2, L1-eliska-12-EM1-1)',()=>{
 const {cleanFix}=require(path.join(root,'src/lib/rules/essay.ts'));
 const mv='Name the source',walk='Walking also makes children happier than going by car.';
 const mine=['Phones stop students listening in class.',walk,'Teachers should collect phones at the door.'];
 const fix=(pattern)=>cleanFix({move:mv,pattern},mine);
 assert.equal(fix('Phones stop students listening [how many]'),undefined,'a 4-word run of a neighbour sentence');
 assert.equal(fix('[Phones stop students listening, so they lose marks in tests].'),undefined,'a whole sentence in a slot');
 assert.equal(fix('[They lose marks in tests.]'),undefined,'a slot ending in terminal punctuation');
 assert.equal(fix('A survey found that [number] of children walk.'),undefined,'a new-content clause');
 assert.equal(fix('Research by [source] shows that [claim].'),undefined,'a new-content clause');
 for(const pattern of ['Because [reason], [claim].','Although [the other side], [why your claim still holds].','According to [who], [what they found].','This shows [the link back].','[Your claim], for example [the evidence], so this shows [the link back].','First, [your strongest argument], then [the next one].','So [what the introduction promised], because [what you showed].','[Who] says [what they found].'])
  assert.deepEqual(fix(pattern),{move:mv,pattern},pattern);
});
test('with no fix of its own, a faulty sentence falls back to its lens\'s playbook lesson: a named move and a slotted pattern',()=>{
 const {PLAYBOOK,ESSAY_TYPES,playFor,SPLIT}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const {cleanFix}=require(path.join(root,'src/lib/rules/essay.ts'));
 for(const p of [...PLAYBOOK,SPLIT]){
  assert.equal(cleanFix({move:'Stand in move',pattern:p.pattern})?.pattern,p.pattern,`${p.id}: the pattern passes the rule a model's pattern must pass`);
  const n=p.move.split(/\s+/).length;assert.ok(n>=2&&n<=7,`${p.id}: the move is named in a few words (${n}); Paragraph's is the brief's own seven`);
 }
 assert.equal(PLAYBOOK.find(p=>p.id==='para').move,'Claim, then evidence, then the link back','Paragraph\'s move is its own line');
 for(const t of ESSAY_TYPES)assert.ok(t.id==='language'?playFor(t.id)===SPLIT:PLAYBOOK.includes(playFor(t.id)),`${t.id} names a playbook lesson (Language: the split move)`);
 assert.equal(playFor('argument').id,'thesis');assert.equal(playFor('structure').id,'para');
 assert.equal(playFor('no-such-lens').id,'para','an unknown lens still gets a move, never an empty slot');assert.equal(playFor(null).id,'para');
});
test('L1-eliska-12-EM2-1: every playbook pattern, filled in plain words, is one sentence and goes through revise unrefused',()=>{
 const {PLAYBOOK,ESSAY_TYPES,playFor}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const {revise,splitSentences,joinSentences,paragraphStats}=require(path.join(root,'src/lib/rules/essay.ts'));
 const base=splitSentences('Many students are tired. Sleep is important. Schools start early.');
 const reading={text:joinSentences(base),type:'structure',sentences:base,stats:paragraphStats(base),verdicts:[],summary:''};
 const fallbacks=new Set([...PLAYBOOK,playFor('language'),...ESSAY_TYPES.map(t=>playFor(t.id)),playFor('no-such-lens'),playFor(null)]);
 for(const p of fallbacks){
  const filled=p.pattern.replace(/\[[^\]]+\]/g,'the school day').replace(/^[a-z]/,c=>c.toUpperCase());
  assert.equal(splitSentences(filled).length,1,`${p.id}: "${filled}" counts as one sentence by the splitter revise uses`);
  const r=revise(reading,2,filled);
  assert.equal(r.ok,true,`${p.id}: revise takes the filled pattern${r.ok?'':' ('+r.error+')'}`);
 }
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
 assert.deepEqual(item.required,['n','note','side'],'the deciding field of the lens is required; fix is optional: a model that omits it still answers inside the schema');
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

test('L1-eliska-12-EM2-3: a dictated middle sentence (lower case, no full stop) is accepted, tidied, numbered and recounted',()=>{
 const {revise}=rules();
 const before=R3(),r=revise(before,2,'  according to a 2019 study,   teenagers fall asleep two hours later ');
 assert.equal(r.ok,true,r.error);
 assert.equal(r.reading.sentences[1].text,STUDY);
 assert.deepEqual(r.reading.sentences.map(x=>x.n),[1,2,3]);
 assert.deepEqual(r.reading.stats,paragraphStats(r.reading.sentences));
 assert.equal(r.reading.text,`${before.sentences[0].text} ${STUDY} ${before.sentences[2].text}`);
 assert.deepEqual(revise(before,2,STUDY).reading,r.reading,'a well formed rewrite is unchanged by the tidy');
 assert.equal(revise(before,2,'research found that teenagers fall asleep later').ok,false,'unchanged still compares up to case and spacing');
 assert.match(revise(before,2,'it is bad. Very bad').error,/sentences/i,'two sentences still refused');
});
test('L1-eliska-12-EM2-3: a remaining round-trip refusal names the sentence and says what to change',()=>{
 const {revise}=rules();
 for(const t of ['2019 was a hot year','(or so they say)']){
  const r=revise(R3(),2,t);
  assert.equal(r.ok,false,t);
  assert.match(r.error,/^Sentence 2 /);assert.match(r.error,/capital letter/);assert.match(r.error,/full stop/);
  assert.doesNotMatch(r.error,/would not stay one sentence/);
 }
});
test('rewrite case 2: revise refuses a rewrite that is not one new sentence, in the desk\'s words, before any model is asked',async()=>{
 const {revise}=rules();
 const refusals=[[2,'It is bad. Very bad.'],[2,'   '],[2,''],[2,'  research found that TEENAGERS   fall asleep later. '],[4,STUDY],[0,STUDY],[2,'research found that teenagers fall asleep later']];
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
 assert.equal(a.sentences[1].text,STUDY);assert.equal(a.summary,'0 of 3 sentences to fix.','E9-5: the summary is restated from the verdicts as they now stand');assert.equal(RE.summaryLine(a),a.summary);assert.equal(a.type,'evidence');
 const {system,prompt}=seen[0];
 assert.match(system,/sentence 2 alone/i,'the model is asked for sentence 2 alone');
 assert.match(system,/Lens for this reading: Evidence/);
 assert.match(system,/Never rewrite their sentences/);
 for(const [k,x] of a.sentences.entries())assert.ok(prompt.includes(`${k+1}. ${JSON.stringify(x.text)}`),`the whole numbered paragraph: ${x.n}`);
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
 const COPY={move:'Name the source',pattern:'According to a 2019 [source], [what they found].'};
 answer=reply({verdicts:[{n:2,verdict:'faulty',note:'Which study?',fix:COPY}]});
 const a=await reviseSentence(R3(),2,STUDY);
 const v=a.verdicts.find(x=>x.n===2);
 assert.equal(v.verdict,'faulty');assert.equal(v.note,'This only asserts; nothing here is checkable.','the check line, not the model note');
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

test('recap M2 (L1-barbora-43-EM4-2): the recap names a piece a piece, as the Sunday line does, never "one reading"',()=>{
 const {recapRows,recapLine}=require(path.join(root,'src/tv/recapRows.ts'));
 const line=(...details)=>{
  dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
  const s=getSession();s.history=details.map((detail,i)=>({at:Date.now()-1000*(10-i),kind:'writing',label:'Argument',detail}));
  return recapLine(recapRows(s,Date.now()).find(t=>t.app==='essay'));
 };
 const both=line('2 of 5 sentences to fix','3 of 14 sentences to fix, 3 paragraphs');
 assert.match(both,/one paragraph reading and one piece/);
 assert.doesNotMatch(both,/two readings/);
 const lone=line('3 of 14 sentences to fix, 3 paragraphs');
 assert.match(lone,/^Essay Master - one piece/);
 assert.doesNotMatch(lone,/one reading/);
 assert.match(line('2 of 5 sentences to fix'),/one reading/,'a lone paragraph keeps its plain line');
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
});

test('rewrite case 7:rewriteState reads the verdict, and the TV inks the move from it, not from the status line',()=>{
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

test('EssayTV EM1/EM3 rows: provider, connectors, not-checked line, piece wait line, x-ray topic',()=>{
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.ok(/data-role="essay-provider"[^]*?read by/.test(tv),'the table figures say which engine read the text');
 assert.ok(/x.connectors??.join\(", "\)/.test(tv)&&/data-role="essay-connectors"/.test(tv),'each table row draws its connectors');
 assert.ok(tv.includes('The desk reads structure, argument, evidence and word choice, not grammar or spelling.')&&/data-role="essay-not-checked"/.test(tv),'the table says what is not checked');
 assert.ok(tv.includes('Verdicts land when the whole piece is read.${piece ? ` ${pieceReadingLine(piece)}`'),'the piece wait line says verdicts wait, and how far it is');
 assert.ok(/pieceReadingLine/.test(tv.match(/import \{[^}]*\} from "@\/lib\/rules\/essay"/)[0]),'the wait line uses rules/essay pieceReadingLine');
 // the x-ray model paragraph never shares a topic with the phone's sample paragraph
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 const ph=phone.match(/const ESSAY_PLACEHOLDER = "([^"]*)"/)[1].toLowerCase();
 const stripped=tv.replace(/\/\*[\s\S]*?\*\//g,'');
 const x=stripped.slice(stripped.indexOf('const XRAY:'),stripped.indexOf('export function Xray'));
 const xt=[...x.matchAll(/\["([^"]*)"/g)].map(m=>m[1]).join('').toLowerCase();
 assert.ok(/octopus/.test(xt),'the x-ray sample is on octopuses, a topic no school sets');
 const words=w=>new Set(w.match(/[a-z]{5,}/g)||[]);
 const shared=[...words(xt)].filter(w=>words(ph).has(w));
 assert.deepEqual(shared,[],'the x-ray shares no content word with the phone placeholder');
 assert.ok(!/sleep|school|student|teen|tired|exhaust/.test(xt),'the x-ray is not on the phone sample topic');
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
 assert.deepEqual(paragraphsOf('Later school starts\n\n'+P1),[P1],'a title-only first line before a blank line is a title (titleOf), kept out of the paragraphs (EM3-1)');
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
test('essayFileProblem: a .docx, by name or by MIME type, is pointed to the PC page; a .jpg is not',()=>{
 const W='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
 for(const f of [{name:'essay.docx',type:W,size:900},{name:'Essay.DOCX',type:'',size:900},{name:'essay',type:W,size:900}]){const m=essayFileProblem(f);assert.match(m,/PC page/,JSON.stringify(f));assert.match(m,/\/drop/);assert.match(m,/\.txt and \.md/);assert.doesNotMatch(m,/—|–/);}
 assert.doesNotMatch(essayFileProblem({name:'page.jpg',type:'image/jpeg',size:900}),/PC page|\/drop/);
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
 // changed by E3-b: the refusal now goes through refusedWithLine, which answers 400 and says the line on the status line
 assert.match(src.slice(at,at+200),/refusedWithLine\(tooLong\)/);
 assert.match(src,/function refusedWithLine[\s\S]{0,200}status: 400/);
});
test('the analyse route refuses a body that is not a reading - not JSON, null, no kind, an unknown kind, no text - with a 400 in desk words: no run, no failed job, no model call',async()=>{
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 const asked=seen.length;answer=()=>{throw new Error('no model may be asked');};
 const raw=(body)=>require(path.join(root,'src/app/api/analyse/route.ts')).POST(new Request('http://desk/api/analyse',{method:'POST',body}));
 for(const body of ['not json','null','[]','{}','{"kind":"bogus","text":"A paragraph."}','{"kind":"english"}','{"kind":"english","sentence":42}','{"kind":"english","sentence":"   "}','{"kind":"essay","type":"evidence"}','{"kind":"essay","text":42,"type":"evidence"}','{"kind":"essay","text":"  ","type":"evidence"}']){
  let r;try{r=await raw(body);}catch(e){assert.fail(`${body}: the route threw ${e.constructor.name} (a 500)`);}
  assert.equal(r.status,400,body);deskWorded((await r.json()).error);
  assert.equal(getSession().jobs?.analyse,undefined,`${body}: no analyse job was started`);
 }
 assert.equal(seen.length,asked,'no model call');
});
test('a piece sent to be kept while a reading is running is refused BUSY before it is kept: no piece on the shelf for a reading that never ran',async()=>{
 const texts=require(path.join(root,'src/lib/session/texts.ts'));
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});texts.markNoticed('ema');
 let open;const gate=new Promise((r)=>{open=r;});answer=async()=>{await gate;throw new Error('held');};
 const first=analyse({kind:'essay',text:'Schools should start later. Teenagers sleep late.',type:'evidence'});
 for(let i=0;i<50&&getSession().jobs?.analyse?.phase!=='running';i++)await new Promise((r)=>setImmediate(r));
 assert.equal(getSession().jobs?.analyse?.phase,'running');
 const had=texts.listPieces('ema').length;
 for(let k=0;k<2;k++){
  const r=await analyse({kind:'piece',text:'First paragraph is here and it is in English.\n\nSecond paragraph is also English text.',type:'evidence',keep:true,format:'essay'});
  assert.equal(r.status,409);deskWorded((await r.json()).error);
 }
 assert.equal(texts.listPieces('ema').length,had,'two refused sends kept no piece');
 open();await first;
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
 assert.match(s.away.ema.essay.summary,/^1 of 3 sentences to fix\. Start with sentence 2: /);
 assert.equal(s.away.ema.essayType,'evidence');
 assert.equal(getLearner('ema').history.length,before+1,'her history holds the one reading');
 dispatch({type:'learner.set',id:'ema'});
 assert.match(getSession().essay.summary,/^1 of 3 sentences to fix\. Start with sentence 2: /);
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
 assert.deepEqual(splitSentences('No full stop here\n\nNext paragraph starts.').map(x=>x.text),['Next paragraph starts.'],'a title line is no sentence (EM3-2)');
 assert.deepEqual(splitSentences('No full stop here\n\nNext one\n\nLast paragraph starts.').map(x=>x.text),['Next one','Last paragraph starts.'],'only the first line can be a title');
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
 assert.equal(R.revise(reading,5,'and so the start should move.').ok,true,'dictated lowercase is capitalised, so it no longer fuses with the sentence before it');
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
// the deciding field that reads as neutral on each lens: a whole answer for a fixture that only needs the request
const FULL_FIELD={structure:{job:'none'},argument:{side:'neutral'},evidence:{support:'context'},language:{issues:[]}};
const verdictsOf=(a)=>a.verdicts.map(v=>[v.n,v.verdict]);

test('essay-master-A case 1: Structure - only the FIRST unsupported claim is faulty; a claim with a marked evidence sentence after it is strong; the legacy verdict is ignored',async()=>{
 answer=obsReply([1,2,3].map(n=>({n,job:'claim',verdict:'strong'})));
 const a=await analyseEssay('Homework is pointless. Teachers give too much. It ruins evenings.','structure','oa-1');
 assert.deepEqual(verdictsOf(a),[[1,'faulty'],[2,'neutral'],[3,'neutral']],'one unsupported claim is named, the rest are not piled on');
 answer=obsReply([{n:1,job:'claim',verdict:'faulty'},{n:2,job:'evidence',supports:1,verdict:'faulty'},{n:3,job:'claim',verdict:'faulty'}]);
 // E1: the evidence now names claim 1 (supports:1); without the link claim 1 would be neutral, never strong by position
 const b=await analyseEssay('Homework is pointless. Research found that pupils lose sleep. It ruins evenings.','structure','oa-1');
 assert.deepEqual(verdictsOf(b),[[1,'strong'],[2,'strong'],[3,'faulty']],'claim 1 has marked evidence after it; claim 3 is the first without');
 answer=obsReply([{n:1,job:'claim'},{n:2,job:'evidence',supports:0}]);
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
 answer=obsReply([{n:1,issues:[],note:'long'}]);
 const b=await analyseEssay(long,'language','oa-3');
 assert.deepEqual(verdictsOf(b),[[1,'faulty']],'no observed issue, faulty by length alone');
 assert.match(b.verdicts[0].note,/36 words/);
 const edge=`The ${Array(LONG_SENTENCE_WORDS-2).fill('long').join(' ')} end.`;
 assert.equal((await analyseEssay(edge,'language','oa-3')).verdicts.filter(v=>v.verdict==='faulty').length,0,'exactly at the limit is fine');
 answer=obsReply([{n:1,issues:[{kind:'vague',word:'important'}],note:''}]);
 const c=await analyseEssay('Sleep is important.','language','oa-3');
 assert.deepEqual(verdictsOf(c),[[1,'faulty']]);
 assert.match(c.verdicts[0].note,/important/,'an empty note becomes the failed check\'s line');
});
test('essay-master-A case 4: Evidence - checkable is strong only with an EVIDENCE marker or a number; an opinion with nothing checkable after it is faulty',async()=>{
 answer=obsReply([{n:1,support:'checkable',backs:0,note:'x'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Teenagers are just lazy.','evidence','oa-4')),[[1,'neutral']],'never strong without a marker');
 answer=obsReply([{n:1,support:'checkable',backs:0,note:'x'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Research found that teenagers fall asleep later.','evidence','oa-4')),[[1,'strong']]);
 answer=obsReply([{n:1,support:'opinion',note:'x'}]);
 assert.deepEqual(verdictsOf(await analyseEssay('Teenagers are just lazy.','evidence','oa-4')),[[1,'faulty']]);
 answer=obsReply([{n:1,support:'opinion',note:'x'},{n:2,support:'checkable',backs:0,note:'y'}]);
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
 assert.deepEqual({...l.digest.at(-1),at:0},{at:0,kind:'essay',lens:'argument',sentences:3,faulty:2,paragraphs:1});
});
test('essay-master-A case 7: the prompt no longer asks for a verdict; the withholding rules are still in it verbatim',async()=>{
 const {NEVER_REWRITE,PATTERN_RULE}=deskEssay();
 for(const lens of ['structure','argument','evidence','language']){
  seen=[];answer=obsReply([1,2,3].map(n=>({n,note:'x',...FULL_FIELD[lens]})));
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
 seen=[];answer=obsReply([{n:2,support:'checkable',backs:0}]);
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
  // E7: observations the desk cannot read leave every sentence unanswered: the reading fails and counts nothing
  await assert.rejects(analyseEssay(THREE,'structure','oa-8'),{message:NOT_EVERY_SENTENCE},JSON.stringify(observations));
 }
 for(const [lens,bad] of [['structure',{job:'boss'}],['argument',{side:'sideways'}],['evidence',{support:'vibes'}],['language',{issues:'many'}]]){
  // E7: an unknown value is an unreadable sentence, and a reading with one fails whole; the same value on a rewrite already did
  answer=obsReply([1,2,3].map(n=>({n,...(n===1?bad:FULL_FIELD[lens]),note:'x',fix:CONCEDE})));
  await assert.rejects(analyseEssay(THREE,lens,'oa-8'),{message:NOT_EVERY_SENTENCE},`${lens}: an unknown value leaves its sentence unanswered`);
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
 answer=obsReply([{n:2,support:'checkable',backs:0,note:'Strong: names the study.'}]);
 const r=await reviseSentence(R3(),2,STUDY);
 assert.equal(r.verdicts.find(v=>v.n===2).note,'Names the study.');
});
// Essay recert-2 row 1 (L1-barbora-43-EM1-1, L1-eliska-12-EM1-3, EM1-2, L1-daniel-15-EM2-2): a strong or neutral note is the
// model's words on the TV, so it passes the guard a pattern passes; one that hands over a sentence falls back, never shown
test('C1: every note passes one guard: a note that supplies a sentence falls back to the check\'s line, or to none',async()=>{
 const TWO='Sleep matters a lot for teenagers. In 2019 a study found that pupils who slept nine hours got better marks.';
 const one=async(lens,o,n=1)=>{answer=obsReply([1,2].map(k=>k===n?{n:k,...o}:{n:k,...FULL_FIELD[lens],note:'x'}));const a=await analyseEssay(TWO,lens,'oa-ghost');const v=a.verdicts.find(v=>v.n===n);return [v.verdict,v.note,a.summary];};
 // a strong note quoting a 4-word run of the learner's own sentence falls back
 assert.deepEqual((await one('argument',{side:'pushes',note:'Good: "sleep matters a lot" takes a side.'})).slice(0,2),['strong','']);
 // a run from ANOTHER sentence of the text counts too: the whole text is the learner's
 assert.deepEqual((await one('argument',{side:'pushes',note:'Add that pupils who slept nine hours did better.'})).slice(0,2),['strong','']);
 // a neutral note that supplies a full new sentence falls back; the summary never carries it
 const [verdict,note,summary]=await one('evidence',{support:'context',note:'Write: Teenagers who go to bed early feel calmer at school.'});
 assert.deepEqual([verdict,note],['neutral','']);
 assert.ok(!summary.includes('calmer'),summary);
 // a clean strong note is kept as written
 assert.deepEqual((await one('argument',{side:'pushes',note:'This claim takes a clear side.'})).slice(0,2),['strong','This claim takes a clear side.']);
 // a quoted frame (quotes around [slots]) is teaching, not a sentence: kept
 const FRAME='Try "In [year], [a source] found that [a result], so it is clear that [the claim]."';
 assert.deepEqual((await one('argument',{side:'pushes',note:FRAME})).slice(0,2),['strong',FRAME]);
 // a faulty sentence's note is the check's own line whatever the model wrote
 assert.deepEqual((await one('argument',{side:'wanders',note:'Write: Teenagers who go to bed early feel calmer at school.'})).slice(0,2),['faulty','This sentence wanders from the side the paragraph takes.']);
 // the guard itself: the copied run cleanFix refuses in a pattern, the declarative outside a frame, and what passes
 const {suppliesSentence,guardNote}=rules();
 const S=['Walking also makes children happier than going by car.'];
 assert.equal(suppliesSentence('Write: Walking also makes children happier, because a 2020 survey found 7 in 10 walkers feel calm at school.',S),true,'E8 of the L1 run');
 assert.equal(suppliesSentence('Phones stop students listening, so they lose marks in tests.',S),true,'a new declarative, no quote, no slot');
 assert.equal(suppliesSentence("'Phones stop students listening, so they lose marks in tests.'",S),true,'quotes alone are no frame: a quoted sentence is still handed over');
 assert.equal(suppliesSentence('Which survey backs how much happier walkers are?',S),false,'a question hands over nothing');
 for(const ok of ['A clear claim.','Strong evidence: the study names its year.','Good use of a number.','Your "happier than" needs a reason after it.'])
  assert.equal(suppliesSentence(ok,S),false,ok);
 assert.equal(guardNote('Walking also makes children happier.',S,'The check.'),'The check.');
 assert.equal(guardNote('A clear claim.',S,'The check.'),'A clear claim.');
});

// ---- E1 (council rulings 2026-10-09 section 6): under Structure an evidence observation names the claim it backs ----
const RE=require(path.join(root,'src/lib/rules/essay.ts'));
const UNI='School uniforms are good. In 2019 a study found 70% of pupils saved time. Uniforms also look smart.';
const uniOf=(obs,text=UNI)=>{const ss=RE.splitSentences(text);return RE.decideVerdicts('structure',ss,new Set(ss.map(s=>s.n)),obs);};
const uniPairs=(obs,text)=>uniOf(obs,text).map(v=>[v.n,v.verdict]);
const claimEvClaim=(supports)=>[{n:1,job:'claim'},{n:2,job:'evidence',...(supports===undefined?{}:{supports})},{n:3,job:'claim'}];
test('E1-a: the evidence names the claim it backs; the planted claim before it is the faulty one',()=>{
 assert.deepEqual(uniPairs(claimEvClaim(3)),[[1,'faulty'],[2,'strong'],[3,'strong']],'supports 3: claim 3 strong, claim 1 faulty');
 assert.deepEqual(uniPairs(claimEvClaim(1)),[[1,'strong'],[2,'strong'],[3,'faulty']],'supports 1: claim 1 strong, claim 3 faulty');
 assert.equal(uniOf(claimEvClaim(3)).find(v=>v.n===1).note,'This claim has no evidence after it that a reader can check.','the faulty line is today\'s check line');
});
test('E1-a: with no link the claim before the evidence is neutral, never strong by position',()=>{
 assert.deepEqual(uniPairs(claimEvClaim()),[[1,'neutral'],[2,'strong'],[3,'faulty']]);
});
test('E1-a: a supports that names the evidence itself, a context sentence or a number outside the reading is no link',()=>{
 const same=uniPairs(claimEvClaim());
 for(const bad of [2,99,0,-1,1.5,'1','3',null,true]) assert.deepEqual(uniPairs(claimEvClaim(bad)),same,`supports ${JSON.stringify(bad)} is no link`);
 const ctx=[{n:1,job:'claim'},{n:2,job:'evidence',supports:3},{n:3,job:'context'}];
 assert.deepEqual(uniPairs(ctx),[[1,'neutral'],[2,'strong'],[3,'neutral']],'sentence 3 is context, not a claim: no link');
 for(const v of uniOf(claimEvClaim(2))) assert.equal('supports' in v,false,'no kept link on a refused one');
});
test('E1-a: three bare claims are as before (repro2 J): 1 faulty, 2 and 3 neutral',()=>{
 assert.deepEqual(uniPairs([1,2,3].map(n=>({n,job:'claim'}))),[[1,'faulty'],[2,'neutral'],[3,'neutral']]);
});
test('E1-a: a claim named by a strong claim is strong, one level only; one named by a claim that is not strong is not',()=>{
 const T='Schools should change. Homework is pointless. In 2019 a study found 70% of pupils lose sleep.';
 assert.deepEqual(uniPairs([{n:1,job:'claim'},{n:2,job:'claim',supports:1},{n:3,job:'evidence',supports:2}],T),[[1,'strong'],[2,'strong'],[3,'strong']]);
 assert.deepEqual(uniPairs([{n:1,job:'claim'},{n:2,job:'claim',supports:1},{n:3,job:'evidence'}],T),[[1,'faulty'],[2,'neutral'],[3,'strong']],'claim 2 is not strong, so claim 1 is not strong through it');
 const L='Schools should change. Homework is pointless. Tests are unfair. In 2019 a study found 70% of pupils lose sleep.';
 assert.deepEqual(uniPairs([{n:1,job:'claim'},{n:2,job:'claim',supports:1},{n:3,job:'claim',supports:2},{n:4,job:'evidence',supports:3}],L),
  [[1,'faulty'],[2,'strong'],[3,'strong'],[4,'strong']],'no chains: 2 is named by strong claim 3, but 1 is named only by 2, which is strong one level down');
});
test('E1-b: a verdict keeps the link its observation carried, only an accepted one',()=>{
 const v=uniOf(claimEvClaim(3));
 assert.equal(v.find(x=>x.n===2).supports,3);
 assert.equal(v.find(x=>x.n===1).supports,undefined);
 assert.equal('supports' in uniOf([{n:1,job:'claim'},{n:2,job:'claim',supports:1},{n:3,job:'context'}]).find(x=>x.n===1),false);
 assert.equal(uniOf([{n:1,job:'claim'},{n:2,job:'claim',supports:1},{n:3,job:'context'}]).find(x=>x.n===2).supports,1,'a claim backing an earlier claim keeps its link');
});
test('E1-b: a Structure rewrite of a claim is ruled against the kept links of the first reading',()=>{
 const ss=RE.splitSentences(UNI), first=uniOf(claimEvClaim(1));
 const ctx=RE.contextObservations('structure',ss,1,first);
 assert.deepEqual(ctx.find(o=>o.n===2),{n:2,job:'evidence',supports:1},'the kept link rides with its job');
 const ruled=(c)=>RE.decideVerdicts('structure',ss,new Set([1]),[{n:1,job:'claim'},...c]).find(v=>v.n===1).verdict;
 assert.equal(ruled(ctx),'strong','the evidence named claim 1 in the first reading, so the rewrite stays strong');
 assert.equal(ruled(RE.contextObservations('structure',ss,1)),'neutral','without a kept link the context evidence backs nothing code can see');
 assert.equal(ruled(RE.contextObservations('structure',ss,1,uniOf(claimEvClaim(3)))),'faulty','a link kept to another claim does not back this one: the evidence is known to back claim 3');
 assert.deepEqual(RE.contextObservations('evidence',ss,1),[{n:2,support:'checkable'}],'other lenses are unchanged');
});
test('E1-b: reviseSentence rules a Structure rewrite against the links the first reading kept (wired through the reading\'s verdicts)',async()=>{
 const {reviseSentence}=deskEssay(),ss=splitSentences(UNI);
 const reading=(verdicts)=>({text:UNI,type:'structure',sentences:ss,stats:paragraphStats(ss),verdicts,summary:'s',provider:'test'});
 const kept=uniOf(claimEvClaim(1));
 answer=obsReply([{n:1,job:'claim',note:'Clearer.'}]);
 const a=await reviseSentence(reading(kept),1,'School uniforms are a good idea.');
 assert.equal(a.verdicts.find(v=>v.n===1).verdict,'strong','the evidence named claim 1 in the first reading');
 assert.equal(a.verdicts.find(v=>v.n===2).supports,1,'the other verdicts, and their links, are kept');
 const b=await reviseSentence(reading(kept.map(({supports,...v})=>v)),1,'School uniforms are a good idea.');
 assert.equal(b.verdicts.find(v=>v.n===1).verdict,'neutral','with no kept link the evidence backs nothing code can see');
 const schema=seen.at(-1).schema.properties.observations.items.properties;
 assert.deepEqual(schema.supports,{type:'integer'},'the Structure observation can carry supports');
 assert.match(seen.at(-1).system,/add supports: the number of the claim it backs/);
});

test('rewrite link: a rewrite that leaves out the link its lens needs fails the run, like the first pass; 0 and an integer link rule',async()=>{
 const {reviseSentence}=deskEssay(),ss=splitSentences(UNI);
 const reading=(type,verdicts=[])=>({text:UNI,type,sentences:ss,stats:paragraphStats(ss),verdicts,summary:'s',provider:'test'});
 const ev='In 2020 a survey found 80% of pupils saved time.';
 const ruling=async(type,obs)=>{answer=obsReply([obs]);try{return (await reviseSentence(reading(type),2,ev)).verdicts.find(v=>v.n===2).verdict;}catch(e){return 'threw: '+e.message;}};
 assert.match(await ruling('structure',{n:2,job:'evidence'}),/^threw: no observation came back for sentence 2/,'Structure evidence with no supports');
 assert.match(await ruling('evidence',{n:2,support:'checkable'}),/^threw: no observation came back for sentence 2/,'Evidence checkable with no backs');
 assert.notEqual((await ruling('structure',{n:2,job:'evidence',supports:0})).slice(0,5),'threw','supports 0 is an answer');
 assert.notEqual((await ruling('evidence',{n:2,support:'checkable',backs:0})).slice(0,5),'threw','backs 0 is an answer');
 assert.notEqual((await ruling('structure',{n:2,job:'evidence',supports:1})).slice(0,5),'threw','an integer link rules');
 assert.notEqual((await ruling('evidence',{n:2,support:'checkable',backs:1})).slice(0,5),'threw','an integer link rules');
});

// ---- EM-B21 (council rulings 2026-10-09 section 6, E3): a sentence may open with any capital, not only A-Z ----
test('EM-B21: splitSentences splits before a capital outside A-Z and before an opening low quote; English text is unchanged',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 assert.equal(R.splitSentences('Školy začínají brzy. Žáci jsou unavení. Émile Zola disagreed. So we wait.').length,4,'2 on the base');
 assert.equal(R.splitSentences('Many critics praise the novel. Émile Zola disagreed with them.').length,2);
 assert.equal(R.splitSentences('Řekl to dnes. „Ne,“ odpověděla.').length,2,'a low opening quote begins a sentence');
 assert.equal(R.splitSentences('It rained. then we left. Émile agreed.').length,2,'a lower-case opener still does not split');
 assert.equal(R.splitSentences('Dr. Šimek agreed.').length,1,'the abbreviation join is unchanged');
});
test('EM-B21: planFill accepts an opening capital outside A-Z and still refuses a lower-case opening',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const plan={lens:'structure',slots:['','','']};
 for(const t of ['Školy by neměly telefony úplně zakazovat.','Žáci se tak učí sebekázni.','Česká školní inspekce v roce 2023 uvedla, že 45 % škol zakazuje telefony.','„Ne,“ řekla učitelka.'])assert.equal(R.planFill(plan,0,t).ok,true,t);
 const low=R.planFill(plan,0,'školy by neměly telefony zakazovat.');assert.equal(low.ok,false);assert.match(low.error,/Start it with a capital/);
});

// ---- E3-a (council rulings 2026-10-09 section 6): one pure rule says, with no model, whether a paragraph reads as English ----
const CZ_R4='Telefony by ve škole měly zůstat povolené. Někteří učitelé tvrdí, že rozptylují, avšak bez nich se žáci nenaučí sebekázni. Proto je lepší je regulovat.';
const CZ_R7='Telefony by ve škole měly zůstat povolené. Podle výzkumu Univerzity Karlovy se žáci s jasnými pravidly soustředí lépe. To ukazuje, že zákaz není nutný.';
const CZ_R4_PLAIN='Telefony by ve skole mely zustat povolene. Nekteri ucitele tvrdi, ze rozptyluji, avsak bez nich se zaci nenauci sebekazni. Proto je lepsi je regulovat.';
test('E3-a: the rule says not English for the Czech paragraphs of the L1 run (R4, R7, R4 without diacritics)',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 for(const [k,t] of [['R4',CZ_R4],['R7',CZ_R7],['R4 without diacritics',CZ_R4_PLAIN]])assert.equal(R.paragraphIsEnglish(t),false,k);
 assert.equal(R.NOT_ENGLISH_LINE,'Essay Master reads English writing. This paragraph is not in English, so the desk did not read it.');
});
test('E3-a: the rule says English for accented names inside English, for a short paragraph, and for empty or odd input',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 for(const t of ['Many critics praise the novel. Émile Zola disagreed with them.','Slavoj Žižek would call that ideology. Most of my classmates would not agree.','Hello there',''])assert.equal(R.paragraphIsEnglish(t),true,JSON.stringify(t));
 for(const t of [undefined,null,42,{}])assert.equal(R.paragraphIsEnglish(t),true,String(t));
});
test('E3-a: every English paragraph the two essay suites use reads as English; floors set on this corpus',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const corpus=[THREE,SIX,FIVE,STUDY,CLAIM,EVID,LINK,UNI,'The school day starts too early. Research found that teenagers fall asleep later.','A later start would help. Therefore the start should move.','In conclusion, the bell should ring at nine.',
  'Schools start too early. Teenagers are tired.','Research found that teens sleep later. This is bad.','Therefore school should start at nine.',
  'Phones should be banned in class. They distract everyone.','A 2020 study found 40% of lessons were interrupted. This shows phones cost time.','In conclusion, phones should be banned. Teachers agree.',
  'Homework is pointless. Pupils are busy.','One good sentence. And another one.','Many critics praise the novel. Émile Zola disagreed with them.','Slavoj Žižek would call that ideology. Most of my classmates would not agree.'];
 let low=1,high=0;
 for(const t of corpus){const r=R.englishReading(t);if(r.words>=R.ENGLISH_MIN_WORDS){low=Math.min(low,r.english);}high=Math.max(high,r.czech);assert.equal(R.paragraphIsEnglish(t),true,t.slice(0,40));}
 console.log(`# E3-a corpus: ${corpus.length} English paragraphs, lowest English share ${low.toFixed(2)}, highest Czech signal ${high.toFixed(2)}; floors english<${R.ENGLISH_FLOOR}, czech>=${R.CZECH_FLOOR}, words>=${R.ENGLISH_MIN_WORDS}`);
 const cz=[CZ_R4,CZ_R7,CZ_R4_PLAIN].map(R.englishReading);
 assert(Math.max(...cz.map(r=>r.english))<R.ENGLISH_FLOOR,'every Czech text is under the English floor; the lowest English text (below the floor too) is kept English by the Czech signal, the two floors act together');
 assert(Math.min(...cz.map(r=>r.czech))>=R.CZECH_FLOOR&&high<R.CZECH_FLOOR,'the Czech floor sits between the English corpus and the Czech texts');
});

// ---- E4, E4-a (council rulings 2026-10-09 section 6): a paragraph the desk did not rule is said and drawn as such ----
test('E4-a: paragraphState gives one state per paragraph: pending while the piece is read, then read, not-read (failed) or not-english',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const P=(read,failed=[],notEnglish)=>({paragraphs:4,read,failed,...(notEnglish?{notEnglish}:{})});
 for(const para of [0,1,2,3])assert.equal(R.paragraphState(P([0]),para),'pending','being read: every paragraph is pending, the one back included');
 assert.equal(R.paragraphState(P([0],[1],[2]),3),'pending','one paragraph still out');
 const done=P([0,3],[1],[2]);
 assert.deepEqual([0,1,2,3].map(k=>R.paragraphState(done,k)),['read','not-read','not-english','read']);
 assert.equal(R.paragraphState(undefined,0),'read','a one-paragraph reading has no piece and is drawn as read');
 assert.equal(R.paragraphPending(done,1),false,'a failed paragraph is never pending once the piece is done (E4)');
 assert.equal(R.paragraphPending(P([0]),0),true);
});
test('E4-a: the forensic caption is a rule: a sentence of a paragraph that was not ruled gets "Not read" and the paragraph\'s line, never Neutral',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const done={paragraphs:3,read:[0],failed:[1],notEnglish:[2]};
 assert.deepEqual(R.unruledCaption(done,1),{label:'Not read',text:'Paragraph 2 did not come back. Send it again from the phone.'});
 assert.deepEqual(R.unruledCaption(done,2),{label:'Not read',text:'Paragraph 3 is not in English, so the desk did not read it.'});
 assert.equal(R.unruledCaption(done,0),null);
 assert.equal(R.unruledCaption({paragraphs:3,read:[0],failed:[]},1),null,'while the piece is read nothing is "not read" yet');
 assert.equal(R.unruledCaption(undefined,0),null);
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.match(tv,/unruledCaption\(/,'the page asks the rule');
 assert.equal((tv.match(/data-state=\{/g)||[]).length,2,'the map and the rail carry a data attribute naming the state');
 assert.equal((tv.match(/paragraphState\(/g)||[]).length,2);
});
test('E4-a: ruledSentences leaves out the sentences of failed and not-English paragraphs; unruledLines names them in paragraph order',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const ss=R.splitSentences('One here. Two here.\n\nThree here.\n\nFour here. Five here.');
 const piece={paragraphs:3,read:[0],failed:[2],notEnglish:[1]};
 assert.deepEqual(R.ruledSentences(ss,piece).map(s=>s.n),[1,2]);
 assert.deepEqual(R.unruledLines(piece),['Paragraph 2 is not in English, so the desk did not read it.','Paragraph 3 did not come back. Send it again from the phone.']);
 assert.deepEqual(R.ruledSentences(ss,undefined).map(s=>s.n),[1,2,3,4,5]);
});

// ---- E2-b (council rulings 2026-10-09 section 6): one rule says whether a piece is still being read ----
test('E2-b: pieceBeingRead is true while read, failed and not-English paragraphs number fewer than the paragraphs; the reading line counts the paragraphs back plus one, at most N',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const P=(read,failed=[],notEnglish)=>({paragraphs:4,read,failed,...(notEnglish?{notEnglish}:{})});
 assert.equal(R.pieceBeingRead(undefined),false,'no piece, nothing is being read');
 assert.equal(R.pieceBeingRead(P([])),true);
 assert.equal(R.pieceBeingRead(P([0],[1])),true);
 assert.equal(R.pieceBeingRead(P([0],[1],[2])),true,'three of four are back');
 assert.equal(R.pieceBeingRead(P([0,3],[1],[2])),false,'read + failed + not English make four');
 assert.equal(R.pieceBeingRead(P([0,1,2,3])),false);
 assert.equal(R.pieceReadingLine(P([])),'Reading paragraph 1 of 4.');
 assert.equal(R.pieceReadingLine(P([0],[1],[2])),'Reading paragraph 4 of 4.');
 assert.equal(R.pieceReadingLine({paragraphs:2,read:[0,1],failed:[]}),'Reading paragraph 2 of 2.','at most N');
 assert.equal(R.REWRITE_WHILE_READING,'The desk is still reading your piece. Rewrite a sentence once every paragraph is read.');
 for(const [file,n] of [['app/api/analyse/route.ts',1],['app/phone/page.tsx',1],['essay/EssayTV.tsx',1]]){
  const src=fs.readFileSync(path.join(root,'src',file),'utf8');
  assert((src.match(/pieceBeingRead\(/g)||[]).length>=n,file+' asks the rule');
 }
});

test('E4-b: rewriteUnruledLine gives the paragraph\'s not-read or not-English line for a sentence of an unruled paragraph, and null otherwise',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const piece={paragraphs:3,read:[0],failed:[1],notEnglish:[2]};
 const reading={piece,sentences:[{n:1,para:0},{n:2,para:1},{n:3,para:2}]};
 assert.equal(R.rewriteUnruledLine(reading,2),'Paragraph 2 did not come back. Send it again from the phone.');
 assert.equal(R.rewriteUnruledLine(reading,3),'Paragraph 3 is not in English, so the desk did not read it.');
 assert.equal(R.rewriteUnruledLine(reading,1),null,'a read paragraph');
 assert.equal(R.rewriteUnruledLine({sentences:reading.sentences},2),null,'a reading with no piece');
 assert.equal(R.rewriteUnruledLine(reading,9),null,'an n the reading does not have');
 assert.equal(R.rewriteUnruledLine(null,1),null);
});

test('E4-c: the rail draws a paragraph that was not ruled from the stylesheet (data-state not-read and not-english, opacity .4), not from an inline opacity',()=>{
 const css=fs.readFileSync(path.join(root,'src/design/essay-specimen.css'),'utf8');
 assert.match(css,/\.em-r\[data-state="not-read"\][^{]*\{[^}]*opacity:\s*\.4\b/);
 assert.match(css,/\.em-r\[data-state="not-english"\][^{]*\{[^}]*opacity:\s*\.4\b/);
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.doesNotMatch(tv,/opacity:\s*0?\.4/,'no inline opacity on the rail row');
 assert.equal((tv.match(/data-state=\{/g)||[]).length,2,'the data-state count stays 2');
});

// ---- E3-a, recert-7 rows kristyna-17 EM1-1 / EM1-5 and helena-46 EM1-4: shared function words, short Czech without diacritics, German ----
test('E3-a: Czech made of words shared with English (my, a, to, do) is not English; short plain Czech and German are refused too',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const czShared=['My a to, co do toho dáváme, je pro nás důležité, ale my to na světě neumíme říct, a proto to děláme tak, jak to umíme.',
  'My to do toho dáme a to je pro nás ten největší cíl, ale my to na to nemáme.',
  'My to do školy nosíme a to by mělo být dobré, protože my to chceme.'];
 const czShort=['Telefony by mely byt zakazany','Skola je dulezita','Ucitele a zaci maji pravidla','Je to tak'];
 const de=['Die Schule sollte später beginnen, weil die Kinder müde sind und nicht lernen können.','Handys sind in der Schule nicht erlaubt und das ist auch gut so.','Das ist nicht gut'];
 for(const t of [...czShared,...czShort,...de])assert.equal(R.paragraphIsEnglish(t),false,t);
 for(const t of czShared)assert(R.englishReading(t).english<R.ENGLISH_FLOOR,'shared words do not count as English: '+t);
 assert.equal(R.englishReading('Das ist nicht gut und der Hund').german>0.5,true);
 for(const t of ['My teacher said that to do the work is a duty.','Tell me what you think. It is a good plan to do.','The die is cast.','Hello there','Phones and school do not mix.'])assert.equal(R.paragraphIsEnglish(t),true,t);
});

// ---- E3-c: the stage says a refusal line the desk gave before any run, labelled 'Not read'
const ER=require(path.join(root,'src/lib/rules/essay.ts'));
const KEYS=require(path.join(root,'src/tv/keys.ts'));
const LINE_ENGLISH='Essay Master reads English writing. This paragraph is not in English, so the desk did not read it.';
const LINE_LONG='That paragraph is too long to read in one go. Split it in two and send one part at a time (up to 4000 characters).';
const LINE_EMPTY='There is nothing to read. Write or send a piece first.';
const LINE_PIECE_BIG='That piece is too long to read in one go. Keep it under 100 KB.';
const LINE_PARAS='That is 31 paragraphs. The desk reads up to 30 at a time: send it in parts.';
const LINE_PARA_LONG='Paragraph 2 is too long to read in one go. Split it in two (up to 4000 characters each).';
const bigPara='a'.repeat(4001);
const refusals=()=>[
 ['not english',ER.NOT_ENGLISH_LINE],
 ['too long',ER.essayTooLong(bigPara)],
 ['empty piece',ER.pieceProblem('')],
 ['piece too big',ER.pieceProblem('a '.repeat(ER.PIECE_MAX_CHARS))],
 ['too many paragraphs',ER.pieceProblem(Array.from({length:ER.PIECE_PARAGRAPHS_MAX+1},(_,i)=>`Paragraph ${i}.`).join('\n\n'))],
 ['a paragraph over the cap',ER.pieceProblem('Short one.\n\n'+bigPara)],
];
test('E3-c guard: the refusal lines are byte for byte what they were at 3b97c46d',()=>{
 const got=refusals().map(r=>r[1]);
 assert.deepEqual(got,[LINE_ENGLISH,LINE_LONG,LINE_EMPTY,LINE_PIECE_BIG,LINE_PARAS,LINE_PARA_LONG]);
});
test('E3-c: refusalCaption captions a refusal dispatched as one, and reads no wording',()=>{
 for(const [n,l] of refusals()){
  assert.deepEqual(ER.refusalCaption({status:l,essayRefused:l}),{label:'Not read',text:l},n);
  assert.equal(ER.refusalCaption({status:l}),null,n+': the same words, not dispatched as a refusal, are not one');
  assert.equal(ER.refusalCaption({status:'something later',essayRefused:l}),null,n+': a later status ends it');
 }
 assert.deepEqual(ER.refusalCaption({status:'That is 7 paragraphs and change.',essayRefused:'That is 7 paragraphs and change.'}),{label:'Not read',text:'That is 7 paragraphs and change.'},'a new refusal line needs no recogniser');
 for(const x of [KEYS.planStatus(0),KEYS.rewriteStatus(2),'structure lens chosen \u2014 paste or dictate the paragraph on the phone','reading your paragraph \u2014 structure lens…','reading your piece, 3 paragraphs \u2014 argument lens…','',null,undefined,42])
  assert.equal(ER.refusalCaption({status:x}),null,String(x));
});
test('E3-c: the analyse route dispatches an essay refusal as one; the English sentence refusal and a plain status are not',async()=>{
 const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 const res=await analyse({kind:'piece',text:''});assert.equal(res.status,400);
 assert.deepEqual(ER.refusalCaption(getSession()),{label:'Not read',text:ER.pieceProblem('')});
 dispatch({type:'status',text:'structure lens chosen'});assert.equal(getSession().essayRefused,undefined);assert.equal(ER.refusalCaption(getSession()),null);
 const long=await analyse({kind:'english',sentence:'word '.repeat(2000)});
 assert.equal(long.status,400,'the sentence is over the cap');assert.match(getSession().status,/Send one sentence at a time/);
 assert.equal(getSession().essayRefused,undefined,'an English sentence refusal is not an essay refusal');
});
{
 for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){
  const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
}
function drawEssay(name,s,extra){
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server')),{createElement}=require(path.join(root,'node_modules/react'));
 const E=require(path.join(root,'src/essay/EssayTV.tsx'));
 return renderToStaticMarkup(createElement(E[name],{s,focus:-1,...extra}));
}
const capOf=(html)=>{const m=/<div class="em-cap[^"]*"><div class="em-lbl">([^<]*)<\/div><p>([^<]*)<\/p>/.exec(html);return m&&{label:m[1],text:m[2]};};
test('E3-c: EssayType and EssayPlan caption a refusal line, a running job still wins, a plan status is unchanged',()=>{
 const {getSession}=require(path.join(root,'src/lib/session/store.ts'));
 const base=getSession();
 for(const name of ['EssayType','EssayPlan']){
  const s={...base,jobs:{},status:ER.NOT_ENGLISH_LINE,essayRefused:ER.NOT_ENGLISH_LINE};
  assert.deepEqual(capOf(drawEssay(name,s)),{label:'Not read',text:ER.NOT_ENGLISH_LINE},name);
  const running={...s,jobs:{analyse:{id:'j',phase:'running',startedAt:Date.now(),key:'essay'}}};
  assert.equal(capOf(drawEssay(name,running)).label,'Reading',name);
 }
 const plain=capOf(drawEssay('EssayPlan',{...base,jobs:{},status:''}));
 assert.deepEqual(capOf(drawEssay('EssayPlan',{...base,jobs:{},status:KEYS.planStatus(0)})),plain);
});

// ---- essay full r1 rework, part 1: E5 the Evidence lens rules an opinion by a link the model names; E6 the words under a faulty verdict are code's ----
const EV_A='Schools should start later in the morning. Uniforms also make students less creative. Research found that teenagers who start at 8:45 sleep 34 minutes more. Therefore a later start would help students learn.';
const UNBACKED='No checkable sentence here backs this opinion.',OPINION='This only asserts; nothing here is checkable.';
const evRule=(text,obs)=>{const ss=RE.splitSentences(text);return RE.decideVerdicts('evidence',ss,new Set(ss.map(s=>s.n)),obs);};
const evObs=(backs)=>[{n:1,support:'opinion'},{n:2,support:'opinion'},{n:3,support:'checkable',...(backs===undefined?{}:{backs})},{n:4,support:'opinion'}];
test('E5-1: the Evidence lens rules an opinion by the link a checkable sentence names, not by its position',()=>{
 const v=evRule(EV_A,evObs(1));
 assert.deepEqual(v.map(x=>[x.n,x.verdict]),[[1,'neutral'],[2,'faulty'],[3,'strong'],[4,'neutral']]);
 assert.equal(v[1].note,UNBACKED);
 assert.equal(v.find(x=>x.verdict==='faulty').n,2,'sentence 2 is the first faulty sentence');
 assert.equal(v[2].supports,1,'the accepted link rides on the verdict as supports');
});
test('E5-2: a paragraph whose checkable sentence names no opinion marks nothing',()=>{
 const v=evRule(EV_A,evObs());
 assert.deepEqual(v.map(x=>[x.n,x.verdict]),[[1,'neutral'],[2,'neutral'],[3,'strong'],[4,'neutral']]);
 assert.ok(!v.some(x=>x.verdict==='faulty'));
});
test('E5-3: a paragraph with no marked checkable sentence marks every opinion',()=>{
 const t='Schools start too early. Uniforms hurt creativity. Nobody likes homework.';
 const v=evRule(t,[1,2,3].map(n=>({n,support:'opinion'})));
 assert.deepEqual(v.map(x=>[x.verdict,x.note]),[1,2,3].map(()=>['faulty',OPINION]));
});
test('E5-4: a backs that names the sentence itself, a context or checkable sentence, a number outside the paragraph or another paragraph is no link',()=>{
 const none=(obs,text=EV_A)=>assert.ok(!evRule(text,obs).some(x=>x.verdict==='faulty'||x.supports!==undefined),JSON.stringify(obs));
 none([{n:1,support:'opinion'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:3},{n:4,support:'opinion'}]);
 none([{n:1,support:'context'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:1},{n:4,support:'opinion'}]);
 none([{n:1,support:'checkable'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:1},{n:4,support:'opinion'}]);
 none(evObs(9));none(evObs(1.5));none(evObs('1'));
 const two='Schools start too early. Uniforms hurt creativity.\n\nResearch found that 34 minutes more sleep helps. Homework is dull.';
 const cross=evRule(two,[{n:1,support:'opinion'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:1},{n:4,support:'opinion'}]);
 assert.deepEqual(cross.map(x=>[x.n,x.verdict,x.supports]),[[1,'faulty',undefined],[2,'faulty',undefined],[3,'strong',undefined],[4,'neutral',undefined]],'no link across paragraphs: paragraph 1 has no marked checkable sentence, paragraph 2 has one with no link');
 const bad=evRule(EV_A,[{n:1,support:'opinion'},{n:2,support:'opinion'},{n:3,support:'opinion',backs:1},{n:4,support:'opinion'}]);
 assert.ok(bad.every(x=>x.verdict==='faulty'&&x.supports===undefined),'an opinion sentence carries no link');
});
test('E5-5: a piece of two paragraphs has its own first unbacked opinion in each',()=>{
 const t='Schools start too early. Uniforms hurt creativity. Research found that 34 minutes more sleep helps.\n\nHomework is dull. Phones are bad. A study measured 20% more focus without them.';
 const ss=RE.splitSentences(t);assert.deepEqual(ss.map(s=>s.para),[0,0,0,1,1,1]);
 const obs=[{n:1,support:'opinion'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:1},{n:4,support:'opinion'},{n:5,support:'opinion'},{n:6,support:'checkable',backs:4}];
 const v=RE.decideVerdicts('evidence',ss,new Set(ss.map(s=>s.n)),obs);
 assert.deepEqual(v.filter(x=>x.verdict==='faulty').map(x=>x.n),[2,5]);
 assert.deepEqual(v.filter(x=>x.verdict==='faulty').map(x=>x.note),[UNBACKED,UNBACKED]);
});
test('E5 (c): a marked checkable sentence with no link between an opinion and the next opinion makes that opinion neutral; later unbacked opinions are neutral',()=>{
 const t='Schools start too early. Research found that 34 minutes more sleep helps. Uniforms hurt creativity. Phones are bad. A study measured 20% more focus without them. Homework is dull. Therefore it all holds.';
 const ss=RE.splitSentences(t);
 const obs=[{n:1,support:'opinion'},{n:2,support:'checkable',backs:1},{n:3,support:'opinion'},{n:4,support:'opinion'},{n:5,support:'checkable'},{n:6,support:'opinion'},{n:7,support:'opinion'}];
 const v=RE.decideVerdicts('evidence',ss,new Set(ss.map(s=>s.n)),obs);
 assert.deepEqual(v.map(x=>[x.n,x.verdict]),[[1,'neutral'],[2,'strong'],[3,'faulty'],[4,'neutral'],[5,'strong'],[6,'neutral'],[7,'neutral']],'3 is the first unbacked; 4 is blind to what 5 backs; later ones are neutral');
});
test('E5-6: a rewrite of the backed opinion stays backed through the kept link, and the schema and prompt ask for backs',()=>{
 const ss=RE.splitSentences(EV_A),first=RE.decideVerdicts('evidence',ss,new Set([1,2,3,4]),evObs(1));
 const ctx=RE.contextObservations('evidence',ss,1,first);
 assert.deepEqual(ctx.find(o=>o.n===3),{n:3,support:'checkable',backs:1},'the kept link rides with the sentence');
 assert.equal(ctx.find(o=>o.n===4),undefined);
 const ruled=RE.decideVerdicts('evidence',ss,new Set([1]),[{n:1,support:'opinion'},...ctx]).find(v=>v.n===1);
 assert.equal(ruled.verdict,'neutral','backed through the kept link');
 const src=fs.readFileSync(path.join(root,'src/lib/desk/essay.ts'),'utf8');
 assert.match(src,/evidence: \{ support: \{ type: "string", enum: \[\.\.\.SUPPORTS\] \}, backs: \{ type: "integer" \} \}/);
 assert.match(src,/For a checkable sentence that backs an opinion in the same paragraph, add backs: the number of that opinion\./);
});
test('UD-12: a rewrite that is still only an opinion is not ruled neutral by a context that lost its opinions',()=>{
 const t='Schools start too early. A survey found 80% of pupils walk to school. Research found that 34 minutes more sleep helps.';
 const ss=RE.splitSentences(t),first=RE.decideVerdicts('evidence',ss,new Set([1,2,3]),[{n:1,support:'opinion'},{n:2,support:'checkable'},{n:3,support:'checkable',backs:1}]);
 assert.deepEqual(first.map(v=>v.verdict),['neutral','strong','strong']);
 const next=ss.map(s=>s.n===2?{...s,text:'Walking is just much nicer for everybody.'}:s);
 const ctx=RE.contextObservations('evidence',next,2,first);
 assert.deepEqual(ctx.find(o=>o.n===1),{n:1,support:'opinion'},'the opinion the reading ruled comes back as an opinion');
 const ruled=RE.decideVerdicts('evidence',next,new Set([2]),[{n:2,support:'opinion'},...ctx]).find(v=>v.n===2);
 assert.notEqual(ruled.verdict,'neutral','an opinion with no checkable sentence behind it does not hold');
 assert.equal(RE.rewriteState({...ruled,was:{text:ss[1].text,verdict:'strong'}}),'still');
});
const BODY='Schools should start later in the morning.';
const noteOf=(lens,text,o)=>{const ss=RE.splitSentences(text);return RE.decideVerdicts(lens,ss,new Set(ss.map(s=>s.n)),o.map(x=>({note:'Great use of evidence.',...x})));};
test('E6-1: under a faulty verdict the note is the failed check line, never the model note',()=>{
 const praise='Great use of evidence.';
 const cases=[
  ['structure',BODY,[{n:1,job:'claim'}],'This claim has no evidence after it that a reader can check.'],
  ['structure','Therefore it holds.',[{n:1,job:'link'}],'This links back to nothing: no evidence comes before it.'],
  ['argument',BODY,[{n:1,side:'wanders'}],'This sentence wanders from the side the paragraph takes.'],
  ['argument',BODY,[{n:1,side:'against',turnsBack:false}],"It takes the other side but never turns back: a turn needs a word like 'but' or 'although'."],
  ['evidence',BODY,[{n:1,support:'opinion'}],OPINION],
  ['language','It is a bad thing to do.',[{n:1,issues:[{kind:'vague',word:'bad'}]}],"'bad' is doing too little here; say what you mean."],
  ['language','It is a good thing to do, a good thing.',[{n:1,issues:[{kind:'repeated',word:'good'}]}],"'good' is used again here; say it once or find another word."],
  ['language',Array(37).fill('word').join(' ')+'.',[{n:1,issues:[]}],'This sentence runs to 37 words; split it.'],
 ];
 for(const [lens,text,obs,line] of cases){
  const v=noteOf(lens,text,obs);
  assert.equal(v.length,1);assert.equal(v[0].verdict,'faulty',lens+' '+line);
  assert.equal(v[0].note,line);assert.notEqual(v[0].note,praise);
 }
 assert.equal(noteOf('evidence',EV_A,evObs(1)).find(x=>x.verdict==='faulty').note,UNBACKED);
});
test('E6-1 guard: every faulty verdict of every lens carries a check line, and none keeps the model note',()=>{
 const spread=[
  ['structure',EV_A,[{n:1,job:'claim'},{n:2,job:'claim'},{n:3,job:'evidence'},{n:4,job:'link'}]],
  ['structure','Therefore it holds. Schools start early.',[{n:1,job:'link'},{n:2,job:'claim'}]],
  ['argument',EV_A,[{n:1,side:'wanders'},{n:2,side:'against'},{n:3,side:'against',turnsBack:true},{n:4,side:'pushes'}]],
  ['evidence',EV_A,evObs(1)],['evidence',EV_A,[{n:1,support:'opinion'},{n:2,support:'opinion'}]],
  ['language','It is bad. It is good good.',[{n:1,issues:[{kind:'vague',word:'bad'}]},{n:2,issues:[{kind:'repeated',word:'good'}]}]],
 ];
 let faulty=0;
 for(const [lens,text,obs] of spread){
  for(const x of noteOf(lens,text,obs).filter(x=>x.verdict==='faulty')){faulty++;assert.ok(x.note.trim(),`${lens} ${x.n}: a faulty verdict has a check line`);assert.notEqual(x.note,'Great use of evidence.');}
 }
 assert.ok(faulty>=6,'the spread reaches the faulty paths');
});
test('E6-2: strong and neutral verdicts keep the model note',()=>{
 const v=noteOf('argument','Schools should start later. Uniforms are cheap. Sleep matters.',[{n:1,side:'pushes'},{n:2,side:'neutral'},{n:3,side:'pushes',note:'Clear.'}]);
 assert.deepEqual(v.map(x=>[x.verdict,x.note]),[['strong','Great use of evidence.'],['neutral','Great use of evidence.'],['strong','Clear.']]);
});
test('E6-3 (changed by E9): summaryLine is code\'s line from the verdicts alone, for one paragraph, a piece and an empty reading',()=>{
 const sl=RE.summaryLine,s3=[{n:1},{n:2},{n:3}],f=(n)=>Array.from({length:n},(_,i)=>({n:i+1,verdict:'faulty',note:'x'}));
 assert.equal(sl({sentences:s3,verdicts:f(2),summary:'Good start.'}),'2 of 3 sentences to fix. Start with sentence 1: x','the model summary is never read');
 assert.equal(sl({sentences:[{n:1}],verdicts:[{n:1,verdict:'faulty',note:''}],summary:'Tighten it.'}),'1 of 1 sentence to fix. Start with sentence 1.','an empty note leaves no colon');
 assert.equal(sl({sentences:s3,verdicts:[],summary:'Great.'}),'0 of 3 sentences to fix.','none to fix: the head alone');
 assert.equal(sl({sentences:s3,verdicts:[{n:3,verdict:'faulty',note:'c'},{n:2,verdict:'faulty',note:'b'}]}),'2 of 3 sentences to fix. Start with sentence 2: b','the first faulty sentence in sentence order');
 const pc=[{n:1,para:0},{n:2,para:0},{n:3,para:1}];
 assert.equal(sl({sentences:pc,verdicts:[{n:3,verdict:'faulty',note:'c'}],summary:'Model.',piece:{paragraphs:2,read:[0,1],failed:[]}}),'1 of 3 sentences to fix across 2 paragraphs. Start with paragraph 2, sentence 3: c');
 assert.equal(sl({sentences:pc,verdicts:[],summary:'Model.',piece:{paragraphs:2,read:[0,1],failed:[]}}),'0 of 3 sentences to fix across 2 paragraphs.');
 assert.equal(sl({sentences:pc,verdicts:[],summary:'Model.',piece:{paragraphs:2,read:[0],failed:[]}}),'Reading paragraph 2 of 2.','E2-b is unchanged');
 assert.equal(sl({sentences:[],verdicts:[],summary:'In short.'}),'','no sentences: nothing');
 assert.equal(sl({summary:'In short.'}),'');
});
test('E6-4: the TV caption and the spoken line both draw summaryLine',()=>{
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8'),sp=fs.readFileSync(path.join(root,'src/lib/desk/spoken.ts'),'utf8');
 assert.match(tv,/label: `Last verdict[^\n]*text: summaryLine\(a\)/);
 assert.match(sp,/summaryLine\(s\.essay\)/);
 const {spokenLine}=require(path.join(root,'src/lib/desk/spoken.ts'));
 assert.equal(spokenLine({screen:'forensic',essay:{sentences:[{n:1},{n:2}],verdicts:[{n:1,verdict:'faulty',note:'x'}],summary:'Fine.'}}),'1 of 2 sentences to fix. Start with sentence 1: x');
});

// ---- E7 (essay full r1 craft-1): a reading that leaves a judged sentence unanswered fails and records nothing ----
test('E7-1: unanswered() names the judged sentences with no readable observation, ascending, first observation wins',()=>{
 const {unanswered}=rules();
 const ok={structure:{job:'claim'},argument:{side:'pushes'},evidence:{support:'checkable',backs:0},language:{issues:[]}};
 const bad={structure:{job:'boss'},argument:{side:'sideways'},evidence:{support:'vibes'},language:{issues:'many'}};
 const judged=new Set([3,1,2]);
 for(const lens of Object.keys(ok)){
  assert.deepEqual(unanswered(lens,judged,[]),[1,2,3],`${lens}: nothing answered`);
  assert.deepEqual(unanswered(lens,judged,undefined),[1,2,3],`${lens}: not a list`);
  assert.deepEqual(unanswered(lens,judged,[{n:1,...ok[lens]},{n:3,...ok[lens]}]),[2],`${lens}: 1 and 3 answered`);
  assert.deepEqual(unanswered(lens,judged,[{n:1,...ok[lens]},{n:2,...ok[lens]},{n:3,...ok[lens]}]),[],`${lens}: all answered`);
  assert.deepEqual(unanswered(lens,judged,[{n:1,...bad[lens]},{n:1,...ok[lens]},{n:2,...ok[lens]},{n:3,...ok[lens]}]),[1],`${lens}: the first observation for 1 is unreadable, a later readable one does not rescue it`);
  assert.deepEqual(unanswered(lens,judged,[{n:1,...ok[lens]},{n:2,...ok[lens]},{n:9,...ok[lens]}]),[3],`${lens}: an observation outside judged does not count`);
  assert.deepEqual(unanswered(lens,judged,[{n:'1',...ok[lens]},null,'x',{...ok[lens]}]),[1,2,3],`${lens}: no numeric n is no answer`);
 }
});
const e7Snapshot=(id)=>JSON.stringify(getLearner(id));
const E7_THREE='Homework should be shorter. Everyone agrees. Studies of sleep show teenagers need nine hours.';
test('E7-2: a reading that answers only sentences 2 and 3 fails with NOT_EVERY_SENTENCE and records nothing',async()=>{
 const id='e7-partial',before=e7Snapshot(id);
 answer=obsReply([{n:2,support:'opinion',note:'no evidence'},{n:3,support:'context',note:'ok'}]);
 const log=console.error,lines=[];console.error=(...a)=>lines.push(a.join(' '));
 try{await assert.rejects(analyseEssay(E7_THREE,'evidence',id),(e)=>e.constructor.name==='DeskSaid'&&e.message===NOT_EVERY_SENTENCE);}finally{console.error=log;}
 assert.equal(e7Snapshot(id),before,'the history, the writing estimate and the digest are unchanged');
 assert.equal(lines.length,1,'one server line');assert.match(lines[0],/evidence/);assert.match(lines[0],/\b1\b/);
 assert.ok(!lines[0].includes('Homework')&&!lines[0].includes('no evidence'),'no sentence text and no note in the line');
});
test('E7-3: observations: [] is not a clean reading - it fails and records nothing',async()=>{
 const id='e7-empty',before=e7Snapshot(id);
 for(const lens of ['structure','argument','evidence','language']){
  answer=obsReply([]);
  const log=console.error;console.error=()=>{};
  try{await assert.rejects(analyseEssay(E7_THREE,lens,id),{message:NOT_EVERY_SENTENCE},lens);}finally{console.error=log;}
 }
 assert.equal(e7Snapshot(id),before);
});
test('E7-6 (guard): a full answer records exactly as before',async()=>{
 const id='e7-full';
 answer=obsReply([{n:1,support:'context',note:'ok'},{n:2,support:'opinion',note:'no evidence'},{n:3,support:'context',note:'ok'}]);
 const a=await analyseEssay(E7_THREE,'evidence',id);
 assert.deepEqual(a.verdicts.map(v=>[v.n,v.verdict]),[[1,'neutral'],[2,'faulty'],[3,'neutral']]);
 const l=getLearner(id);
 assert.equal(l.history.at(-1).detail,'1 of 3 sentences to fix');assert.equal(l.writing.evidence.seen,1);
});
test('E7-7: the request makes full coverage reachable - each lens requires its own deciding field beside n and note',async()=>{
 const src=fs.readFileSync(path.join(root,'src/lib/desk/essay.ts'),'utf8');
 assert.match(src,/const DECIDING[^=]*=\s*\{\s*structure: "job", argument: "side", evidence: "support", language: "issues"\s*\}/);
 assert.match(src,/required: \["n", "note", DECIDING\[lens\.id\]\]/);
 // the lens maps are keyed by the lens ids (a lens with no fields does not compile), so no lens falls back to Structure's
 for(const map of ['DECIDING','OBSERVED','OBSERVE'])assert.match(src,new RegExp(`const ${map}: Record<AnalysisType,`),map);
 assert.doesNotMatch(src,/\?\? (DECIDING|OBSERVED|OBSERVE)\.structure/);
 assert.match(src,/give issues: \[\]/);assert.match(src,/Give one observation for every sentence you are asked to judge\./);
 for(const [lens,field] of [['structure','job'],['argument','side'],['evidence','support'],['language','issues']]){
  seen=[];answer=obsReply([1,2,3].map(n=>({n,note:'x',...FULL_FIELD[lens]})));
  await analyseEssay(E7_THREE,lens,'e7-schema');
  assert.deepEqual(seen[0].schema.properties.observations.items.required,['n','note',field],`${lens}: the deciding field is required`);
 }
});

// ---- E8 (essay full r1 robustness-1): a failed save after a rewrite is logged and said; the rewrite still succeeds ----
/** Fail the learners.json writes only (the rename over the book throws EPERM); returns the restore. Never desk/data. */
function failLearnerWrites(){
 const real=fs.renameSync;
 fs.renameSync=function(from,to,...rest){
  if(String(to).endsWith('learners.json'))throw Object.assign(new Error(`EPERM: operation not permitted, rename '${from}' -> '${to}'`),{code:'EPERM'});
  return real.call(this,from,to,...rest);
 };
 return ()=>{fs.renameSync=real;};
}
const E8_FIVE='The school day starts too early. Research found that teenagers fall asleep later. Teenagers are just lazy. A 2019 study measured their sleep. Therefore the start should move.';
async function e8Read(){
 dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});
 const id=getSession().learner.id;
 answer=faults([2,3]);
 const first=await analyseEssay(E8_FIVE,'evidence',id);dispatch({type:'essay.set',analysis:first});
 return id;
}
const e8Rewrite=async()=>{
 answer=reply({verdicts:[{n:2,verdict:'strong',note:'It names its source now.'}]});
 const errs=[],e0=console.error;console.error=(...a)=>errs.push(a.join(' '));
 try{const r=await analyse({kind:'rewrite',n:2,text:STUDY});return {r,errs};}finally{console.error=e0;}
};
test('E8-1: a rewrite whose save fails answers 200, shows the new verdict, says REWRITE_NOT_SAVED and logs one line',async()=>{
 const {REWRITE_NOT_SAVED}=deskEssay();deskWorded(REWRITE_NOT_SAVED);
 const id=await e8Read();const line=getLearner(id).history.at(-1).detail;
 const restore=failLearnerWrites();let out;try{out=await e8Rewrite();}finally{restore();}
 assert.equal(out.r.status,200);
 assert.equal(getSession().essay.verdicts.find(v=>v.n===2).verdict,'strong','the new verdict is on the desk');
 assert.equal(getSession().status,REWRITE_NOT_SAVED);assert.equal(getSession().jobs.analyse.phase,'done');
 assert.equal(out.errs.length,1,'one server line');assert.match(out.errs[0],/rewrite/);assert.ok(!out.errs[0].includes('study')&&!out.errs[0].includes('teenagers'),'no learner text');
 assert.equal(getLearner(id).history.at(-1).detail,line,'the file still holds the old count');
});
test('E8-2: a rewrite with learners.json unreadable answers 200 and says LEARNER_UNREAD_RUN',async()=>{
 const {LEARNER_UNREAD_RUN}=require(path.join(root,'src/lib/session/store.ts'));
 const id=await e8Read();
 const file=path.join(process.env.DESK_DATA_DIR,'learners.json');const had=fs.existsSync(file)?fs.readFileSync(file):null;
 fs.writeFileSync(file,'not a book');
 let out;try{out=await e8Rewrite();}finally{if(had)fs.writeFileSync(file,had);else fs.rmSync(file,{force:true});}
 assert.equal(out.r.status,200);assert.equal(getSession().status,LEARNER_UNREAD_RUN);
 assert.equal(getSession().essay.verdicts.find(v=>v.n===2).verdict,'strong');
 assert.equal(out.errs.filter(l=>/essay rewrite/.test(l)).length,1,'one line for the save of the rewrite; other readers of the book log their own');
});
test('E8-4 (guard): with the file writable a rewrite says today\'s status and logs nothing',async()=>{
 const {REWRITE_NOT_SAVED}=deskEssay();
 const id=await e8Read();const out=await e8Rewrite();
 assert.equal(out.r.status,200);assert.equal(getSession().status,'sentence 2 holds now');assert.notEqual(getSession().status,REWRITE_NOT_SAVED);
 assert.equal(out.errs.length,0,'no log line');assert.equal(getLearner(id).history.at(-1).detail,'1 of 5 sentences to fix, 1 fixed');
});
test('E8-5: reviseSentence with no callback and a failing save still resolves',async()=>{
 const {reviseSentence}=deskEssay();
 const id=await e8Read();
 answer=reply({verdicts:[{n:2,verdict:'strong',note:'ok'}]});
 const restore=failLearnerWrites(),e0=console.error;console.error=()=>{};
 try{const a=await reviseSentence(getSession().essay,2,STUDY,undefined,id);assert.equal(a.verdicts.find(v=>v.n===2).verdict,'strong');}finally{console.error=e0;restore();}
});

// ---- E9 (essay full r2, craft-2): code writes the summary from the verdicts it decided; the model is not asked for one ----
test('E9-1: a Structure paragraph code rules 2 of 2 faulty is summarised by code, whatever the model said (a, summaryLine and the spoken line)',async()=>{
 const TWO='Schools should start later. Therefore the start should move.';
 answer=reply({verdicts:[{n:1,verdict:'faulty',note:'x'},{n:2,verdict:'faulty',note:'y'}],summary:'Excellent work, this paragraph is clear and convincing.'});
 const a=await analyseEssay(TWO,'structure','essay-anon');
 assert.deepEqual(a.verdicts.map(v=>v.verdict),['faulty','faulty']);
 const want='2 of 2 sentences to fix. Start with sentence 1: '+a.verdicts[0].note;
 const {spokenLine}=require(path.join(root,'src/lib/desk/spoken.ts'));
 assert.equal(a.summary,want);assert.equal(RE.summaryLine(a),want);assert.equal(spokenLine({screen:'forensic',essay:a}),want);
 for(const t of [a.summary,RE.summaryLine(a),spokenLine({screen:'forensic',essay:a})])assert.doesNotMatch(t,/Excellent/);
});
test('E9-3: the essay-read request asks for no summary: no summary property in the schema, no summary sentence in the system text',async()=>{
 seen=[];answer=reply({verdicts:[{n:1,verdict:'faulty',note:'x'},{n:2,verdict:'neutral',note:'y'}],summary:'s'});
 await analyseEssay('Schools should start later. Therefore the start should move.','structure','essay-anon');
 assert.equal(seen.length,1);
 assert.ok(!('summary' in seen[0].schema.properties),'no summary property');
 assert.ok(!seen[0].schema.required.includes('summary'),'and none required');
 assert.doesNotMatch(seen[0].system,/summary sentence/);assert.match(seen[0].system,/Plain text, to be read aloud\./);
});
test('E9-7: desk/essay.ts no longer parses a summary or asks for one',()=>{
 const src=fs.readFileSync(path.join(root,'src/lib/desk/essay.ts'),'utf8');
 assert.doesNotMatch(src,/Start with paragraph \(\d\+\)/,'the kept-summary regex is gone');
 assert.doesNotMatch(src,/summary sentence/);assert.doesNotMatch(src,/summaries/);
});
// ---- UAT 2026-10-17 recert: EM3-1 (thesis and conclusion) and EM1-1 (PEEL's Explain) are not false faults ----
const ESSAY4='Schools should start later.\n\nSleep matters for learning. Research found that teenagers gain 34 minutes of sleep.\n\nHomework is too long. It ruins evenings.\n\nSo schools should change.';
test('EM3-1: the thesis and the conclusion of a four-paragraph essay with body evidence are not faulty; Start with lands in a body paragraph',()=>{
 const ss=RE.splitSentences(ESSAY4);assert.deepEqual(ss.map(s=>s.para),[0,1,1,2,2,3]);
 const obs=[{n:1,job:'claim'},{n:2,job:'claim'},{n:3,job:'evidence',supports:2},{n:4,job:'claim'},{n:5,job:'claim'},{n:6,job:'link'}];
 const v=RE.decideVerdicts('structure',ss,new Set(ss.map(s=>s.n)),obs);
 assert.deepEqual(v.map(x=>[x.n,x.verdict]),[[1,'neutral'],[2,'strong'],[3,'strong'],[4,'faulty'],[5,'neutral'],[6,'strong']]);
 assert.match(RE.summaryLine({sentences:ss,verdicts:v,piece:{paragraphs:4,read:[0,1,2,3],failed:[]}}),/Start with paragraph 3, sentence 4/);
 const ev=RE.decideVerdicts('evidence',ss,new Set(ss.map(s=>s.n)),[{n:1,support:'opinion'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:2},{n:4,support:'opinion'},{n:5,support:'opinion'},{n:6,support:'opinion'}]);
 assert.deepEqual(ev.map(x=>[x.n,x.verdict]),[[1,'neutral'],[2,'neutral'],[3,'strong'],[4,'faulty'],[5,'faulty'],[6,'neutral']],'a body paragraph with no evidence is still faulty');
 const bare=RE.decideVerdicts('evidence',ss,new Set(ss.map(s=>s.n)),ss.map(s=>({n:s.n,support:'opinion'})));
 assert.ok(bare.every(x=>x.verdict==='faulty'),'no marked evidence anywhere: every opinion stays faulty');
});
test('EM1-1: a PEEL Explain sentence that explains or links back is not a fault; a bare closing claim still is',()=>{
 const peel='Schools should start later. Research found that teenagers gain 34 minutes of sleep. This means pupils concentrate better in the first lesson.';
 const ss=RE.splitSentences(peel),all=new Set(ss.map(s=>s.n));
 const st=RE.decideVerdicts('structure',ss,all,[{n:1,job:'claim'},{n:2,job:'evidence',supports:1},{n:3,job:'claim'}]);
 assert.ok(!st.some(x=>x.verdict==='faulty'),JSON.stringify(st));
 const ev=RE.decideVerdicts('evidence',ss,all,[{n:1,support:'opinion'},{n:2,support:'checkable',backs:1},{n:3,support:'opinion'}]);
 assert.ok(!ev.some(x=>x.verdict==='faulty'),JSON.stringify(ev));
 const bare=RE.splitSentences('Mornings are awful. Schools should start later. Research found that teenagers gain 34 minutes of sleep.');
 const f=RE.decideVerdicts('evidence',bare,new Set([1,2,3]),[{n:1,support:'opinion'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:2}]);
 assert.equal(f.find(x=>x.n===1).verdict,'faulty','an opinion with no marked evidence before it is still unbacked (L1-eliska-12-EM1-5: after evidence, any opinion is its Explain)');
 assert.ok(f.every(x=>x.verdict!=='faulty'||x.note===RE.decideVerdicts('evidence',bare,new Set([1,2,3]),[{n:1,support:'opinion',note:'Write: Mornings hurt.'},{n:2,support:'opinion'},{n:3,support:'checkable',backs:2}]).find(y=>y.n===x.n).note),'a faulty note is code\'s line whatever the model said');
});
test('EM1-1: a clean four-sentence PEEL has no fault under Evidence or Structure; an Explain with no evidence before it is still faulted',()=>{
 const peel='Children should walk to school. A 2020 survey found that walkers scored higher on focus tests. This shows that walking helps them focus. That is why more children should walk.';
 const ss=RE.splitSentences(peel),all=new Set(ss.map(s=>s.n));
 const st=RE.decideVerdicts('structure',ss,all,[{n:1,job:'claim'},{n:2,job:'evidence',supports:1},{n:3,job:'claim'},{n:4,job:'link'}]);
 assert.ok(!st.some(x=>x.verdict==='faulty'),JSON.stringify(st));
 const ev=RE.decideVerdicts('evidence',ss,all,[{n:1,support:'opinion'},{n:2,support:'checkable',backs:1},{n:3,support:'opinion'},{n:4,support:'opinion'}]);
 assert.ok(!ev.some(x=>x.verdict==='faulty'),JSON.stringify(ev));
 const none=RE.splitSentences('Children should walk to school. This shows that walking helps them focus.');
 const f=RE.decideVerdicts('evidence',none,new Set([1,2]),[{n:1,support:'opinion'},{n:2,support:'opinion'}]);
 assert.equal(f.find(x=>x.n===2).verdict,'faulty','an Explain with no evidence before it is still unbacked');
});
test('EM2-2: a rewrite that is still opinion does not hold because a neighbour is labelled evidence; real backing or a checkable rewrite still holds',()=>{
 const t='Schools start too early. Pupils are tired all day. I found out that my brother sleeps badly.';
 const ss=RE.splitSentences(t);
 const ctx=RE.contextObservations('evidence',ss,2);
 const ruled=RE.decideVerdicts('evidence',ss,new Set([2]),[{n:2,support:'opinion'},{n:1,support:'opinion'},...ctx.filter(o=>o.n===3)]).find(v=>v.n===2);
 assert.equal(ruled.verdict,'faulty');
 assert.equal(RE.rewriteState({...ruled,was:{text:'x',verdict:'faulty'}}),'still');
 const real=RE.decideVerdicts('evidence',ss,new Set([2]),[{n:2,support:'opinion'},{n:3,support:'checkable',backs:2}]).find(v=>v.n===2);
 assert.equal(real.verdict,'neutral','a kept link that backs it still holds');
 const chk=RE.decideVerdicts('evidence',ss,new Set([2]),[{n:2,support:'checkable'}]).find(v=>v.n===2);
 assert.notEqual(chk.verdict,'faulty');
});

test('L1-helena-46-EM1-1: the Language fallback for a faulty sentence with no fix is a language move, never Claim, then evidence, then the link back',()=>{
 const {playFor,PLAYBOOK}=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const {taught,cleanFix}=require(path.join(root,'src/lib/rules/essay.ts'));
 const lang=playFor('language');
 const t=taught({verdict:'faulty',fix:undefined},{move:lang.move,pattern:lang.pattern});
 assert.equal(t.own,false,'it is the fallback, not the reading own fix');
 assert.equal(t.fix.move,'One idea per sentence');
 assert.notEqual(t.fix.move,PLAYBOOK.find(p=>p.id==='para').move);assert.doesNotMatch(t.fix.pattern,/evidence|claim/i);
 assert.deepEqual(cleanFix(t.fix),t.fix,'a slotted pattern with none of the learner words');
 for(const lens of ['structure','evidence'])assert.equal(playFor(lens).id,'para',lens+' keeps its fallback');assert.equal(playFor('argument').id,'thesis');
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.ok(tv.includes('t.from.id === "split" ? "language" : "playbook"'),'the TV labels the Language fallback as a language move');
});

// ---- who is writing and what the paragraph answers (recert-5/L1-kristyna-17-EM1-2, L1-helena-46-EM1-2, L1-kristyna-17-EM1-4)
test('READER: an Adult-mode reading names an adult writer, no age and no "student"; a teen is named by real age or as a teenager',async()=>{
 const V=require(path.join(root,'src/lib/rules/voice.ts'));
 const sys=async(age,reader)=>{seen=[];answer=()=>({json:{observations:[]}});await analyseEssay('Homework is pointless.','evidence','essay-reader',age,reader).catch(()=>{});return seen[0].system;};
 const adult=await sys(undefined,{mode:'adult'});
 assert.match(adult,/writing tutor for an adult writer\./);
 assert.doesNotMatch(adult,/student|\d+-year-old|teenager/i,'adult prompt: no age, no student');
 const adult30=await sys(30,{mode:'adult'});
 assert.doesNotMatch(adult30,/student|\d+-year-old|teenager/i);
 const k=await sys(17,{});
 assert.match(k,/writing tutor for a 17-year-old\./);assert.doesNotMatch(k,/15-year-old/);
 assert.match(await sys(undefined,{}),/writing tutor for a teenager\./);
 assert.match(await sys(18,{}),/for an 18-year-old\./);
});
test('READER: a given task reaches the prompt as data labelled as the task; none given adds no row',async()=>{
 const run=async(reader)=>{seen=[];answer=()=>({json:{observations:[]}});await analyseEssay('Homework is pointless.','evidence','essay-reader',17,reader).catch(()=>{});return seen[0];};
 const withTask=await run({task:'Discuss whether homework should be abolished.'});
 assert.match(withTask.prompt,/The task the writing answers[^\n]*\n?[^\n]*Discuss whether homework should be abolished\./);
 assert.match(withTask.system,/task the writing answers is given beside the sentences as data/);
 const none=await run({});
 assert.doesNotMatch(none.prompt,/The task the writing answers/);assert.doesNotMatch(none.system,/task the writing answers/);
});
test('READER: voiceOf (maths, english, and the essay hint) is byte-identical to before; only the essay reading voice names the teen by age',()=>{
 const V=require(path.join(root,'src/lib/rules/voice.ts'));
 assert.deepEqual(V.voiceOf('maths'),{band:'teen',who:'a 15-year-old',manner:''});
 assert.deepEqual(V.voiceOf('english'),{band:'teen',who:'a Czech teenager',manner:''});
 assert.equal(V.voiceOf('maths',17).who,'a 17-year-old');
 assert.equal(V.voiceOf('essay').who,'a 15-year-old','the essay hint voice still reads 15');
 assert.equal(V.voiceOf('essay',17).who,'a 15-year-old');
 assert.equal(V.essayReadingVoice(17).who,'a 17-year-old');assert.equal(V.essayReadingVoice().who,'a teenager');assert.equal(V.essayReadingVoice(30,'adult').who,'an adult writer');
 assert.equal(V.essayReadingVoice(12,'adult').who,'an adult writer');
 assert.equal(V.essayReadingVoice(12).who,'a learner aged 11 to 13','the young essay voice is untouched');
});
test('L1-helena-46-EM5-6: phone-kept pieces with different typed titles and a picked file without one come back with distinct titles; the file name fills the Name field',()=>{
 const texts=require(path.join(root,'src/lib/session/texts.ts'));
 texts.deleteAll('em56');
 const a=texts.addPiece('em56',{text:'Hi Anna,\n\nThe slides are ready for Friday.\n\nEma',source:'paste',format:'email',title:'Note to Anna'});
 const b=texts.addPiece('em56',{text:'Hi Ben,\n\nCould you send Monday notes?\n\nEma',source:'paste',format:'email',title:'  Note to Ben  '});
 const c=texts.addPiece('em56',{text:'Dear Cara,\n\nThank you for the book.\n\nEma',source:'file',format:'email',title:'thank-you-draft'});
 assert.ok(a.ok&&b.ok&&c.ok);
 const titles=texts.listPieces('em56').map((x)=>x.title).sort();
 assert.deepEqual(titles,['Note to Anna','Note to Ben','thank-you-draft']);
 texts.deleteAll('em56');
 const phone=fs.readFileSync(path.join(root,'src/app/phone/page.tsx'),'utf8');
 assert.match(phone,/setSource\("file"\);[^\n]*setPieceTitle\(f\.name\.replace\(/,'a picked file names the piece by its file name without the extension');
});
test('EM3-1: the forensic page names the paragraph it is on and leads with where to start, naming what "start" means',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const sen=[{n:1,para:0},{n:2,para:0},{n:3,para:1},{n:4,para:1}],piece={paragraphs:2,read:[0,1],failed:[]};
 assert.equal(R.forensicPlace(sen,2,piece),'Paragraph 2 of 2 · Sentence 3 of 4');
 assert.equal(R.forensicPlace([{n:1},{n:2}],1),'Sentence 2 of 2','one paragraph keeps the plain crumb');
 const v=[{n:4,verdict:'faulty',note:'x'},{n:3,verdict:'faulty',note:'y'}];
 assert.equal(R.forensicLead({sentences:sen,verdicts:v,piece}),'Start with paragraph 2, sentence 3: the earliest to fix.');
 assert.equal(R.forensicLead({sentences:sen,verdicts:[],piece}),'');
 assert.equal(R.forensicLead({sentences:sen,verdicts:v,piece:{paragraphs:3,read:[0],failed:[]}}),'Reading paragraph 2 of 3.','while the piece is read the page says how far it has got');
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.match(tv,/place=\{forensicPlace\(/);assert.match(tv,/data-role="essay-lead"/);
});
test('EM3-3: a run that starts "reading your piece" is a piece from the first second, a paragraph run is not',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 assert.equal(R.readingAPiece(undefined,'reading your piece, 4 paragraphs — structure lens…'),true);
 assert.equal(R.readingAPiece(undefined,'reading your paragraph — structure lens…'),false);
 assert.equal(R.readingAPiece({paragraphs:2,read:[],failed:[]},undefined),true);
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.match(tv,/readingAPiece\(a\?\.piece, job\.start\)/);
});

// ---- E3-d, recert-8 rows kristyna-17 EM1-5 / EM1-1 and helena-46 EM1-4: a probe set the language check is measured on ----
const LANG_PROBES={
 cz:[
  'Podle mého názoru by školní den měl začínat později, protože studenti jsou ráno unavení a nemohou se soustředit na výuku.',
  'Mobilní telefony ve škole způsobují, že se žáci méně věnují učitelům a více času tráví na sociálních sítích.',
  'Domácí úkoly jsou pro děti důležité, ale nesmí jich být příliš mnoho, jinak nemají čas na koníčky a rodinu.',
  'Myslím si, že každý člověk by se měl učit cizí jazyky, protože je to užitečné při cestování i v práci.',
  'Velkým problémem dnešní doby je nedostatek spánku u teenagerů, který vede ke špatným výsledkům ve škole.',
  'Když jsem byla malá, chodila jsem se svou babičkou na procházky do lesa a sbírala jsme houby.',
  'Přestože si mnoho lidí myslí opak, čtení knih není ztráta času, ale jedna z nejlepších investic do vlastního vzdělání.',
  'Škola by měla žáky učit nejen fakta, ale také to, jak samostatně přemýšlet a řešit problémy.',
  'Sport je důležitou součástí života, protože nás udržuje zdravé a učí nás pracovat v týmu.',
  'V dnešní společnosti hraje internet velkou roli a těžko si dovedeme představit, jak bychom bez něj žili.',
  'Podle meho nazoru by skolni den mel zacinat pozdeji, protoze studenti jsou rano unaveni a nemohou se soustredit na vyuku.',
  'Mobilni telefony ve skole zpusobuji, ze se zaci mene venuji ucitelum a vice casu traveji na socialnich sitich.',
  'Domaci ukoly jsou pro deti dulezite, ale nesmi jich byt prilis mnoho, jinak nemaji cas na konicky a rodinu.',
  'Myslim si, ze kazdy clovek by se mel ucit cizi jazyky, protoze je to uzitecne pri cestovani i v praci.',
  'Velkym problemem dnesni doby je nedostatek spanku u teenageru, ktery vede ke spatnym vysledkum ve skole.',
  'Kdyz jsem byla mala, chodila jsem se svou babickou na prochazky do lesa a sbirala jsme houby.',
  'Prestoze si mnoho lidi mysli opak, cteni knih neni ztrata casu, ale jedna z nejlepsich investic do vlastniho vzdelani.',
  'Skola by mela zaky ucit nejen fakta, ale take to, jak samostatne premyslet a resit problemy.',
  'Sport je dulezitou soucasti zivota, protoze nas udrzuje zdrave a uci nas pracovat v tymu.',
  'V dnesni spolecnosti hraje internet velkou roli a tezko si dovedeme predstavit, jak bychom bez nej zili.',
  'Nektere deti travi u pocitace cely den a pak se divi, ze jsou unavene a nemaji dobre znamky.',
  'Uciteli by meli zaky chvalit casteji, protoze pochvala je motivuje k lepsim vykonum.',
  'Myslim, ze uniforma ve skole by byla dobry napad, ale mnoho zaku s tim nesouhlasi.',
  'Telefony by mely byt zakazany',
  'Skola je dulezita',
  'Ucitele a zaci maji pravidla',
  'Je to tak, jak rikam',
  'Škola začíná příliš brzy',
  'Děti mají rády hry',
  'Podle me je to spatne',
  'Moje škola má novou knihovnu, kde se můžeme učit i po vyučování, a to je podle mě skvělé.',
  'Můj názor je, že social media jsou pro teenagery nebezpečná, protože tam často vidí fake news a cyberbullying.',
  'Podle mě je dnes důležité umět dobře anglicky, protože většina internetu, například YouTube a Wikipedia, je v angličtině.',
  'Myslim si, ze online learning ma sve vyhody, ale zaci potrebuji take osobni kontakt s ucitelem a spoluzaky.',
  'Moc se mi libi, jak nas ucitel vysvetluje grammar, ale testy jsou vzdycky moc tezke a nemam na ne cas.',
  'Za me je smartphone uzitecny, ale mel by se pouzivat jen o prestavkach, ne behem hodiny.',
 ],
 other:[
  'Die Schule sollte später beginnen, weil die Kinder morgens müde sind und nicht richtig lernen können.',
  'Ich finde, dass Handys im Unterricht nichts zu suchen haben, weil sie die Schüler ablenken.',
  'Hausaufgaben sind wichtig, aber es sollten nicht zu viele sein.',
  'Szkoła powinna zaczynać się później, ponieważ uczniowie są rano zmęczeni i nie mogą się skupić na lekcjach.',
  'Uważam, że telefony komórkowe w szkole są potrzebne, ale nie powinny przeszkadzać w nauce.',
  'Moim zdaniem czytanie książek jest bardzo ważne dla rozwoju każdego człowieka.',
  "L'école devrait commencer plus tard, parce que les élèves sont fatigués le matin et ne peuvent pas se concentrer.",
  'Je pense que les téléphones portables ne sont pas utiles en classe, mais ils sont très pratiques pour les élèves.',
  'La escuela debería empezar más tarde porque los estudiantes están cansados por la mañana y no pueden concentrarse.',
  'Creo que los teléfonos móviles en clase son un problema para los alumnos y también para los profesores.',
  'Je pense que le sport est important pour la santé',
  'Los deberes son muy importantes para los niños',
 ],
 en:[
  'I think school should start later, because students are tired in the morning and cannot concentrate on the lesson.',
  'Mobile phones in class are a problem, but they can also help students look up facts and work together.',
  'Homework is important for children, but there must not be too much of it, or they have no time for hobbies.',
  'Reading books is not a waste of time; it is one of the best investments a person can make in their own education.',
  'Sport is an important part of life because it keeps us healthy and teaches us to work in a team.',
  'When I was little, I went for walks in the forest with my grandmother and we picked mushrooms.',
  'The internet plays a big role in our society, and it is hard to imagine how we would live without it.',
  'Many critics praise the novel, but Émile Zola disagreed with them and wrote that it was a failure.',
  'Slavoj Žižek would call that ideology, and most of my classmates would not agree with him.',
  'School is important',
  'Phones should be banned',
  'I like the library in Brno, which my sister visits on Saturdays, and then we go to Praha by train.',
  'In his book Die Verwandlung, Kafka writes that Gregor woke up as a bug, and the family did not know what to do.',
  'My teacher said that to do the work is a duty, but he also said that we should not do it in a hurry.',
  'The author says "Ich weiß nicht" in the third chapter, and this shows that the hero is lost in the city.',
  'If a student has a problem, he or she can ask a teacher, who will be glad to help and to explain it again.',
 ],
};
test('E3-d: over the probe set the language check refuses non-English at >= 0.95 and refuses no English',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 assert(LANG_PROBES.cz.length>=30&&LANG_PROBES.other.length>=10&&LANG_PROBES.en.length>=16);
 const refused=(a)=>a.filter(t=>!R.paragraphIsEnglish(t));
 const nonEn=[...LANG_PROBES.cz,...LANG_PROBES.other];
 const miss=nonEn.filter(t=>R.paragraphIsEnglish(t));
 const cz=refused(LANG_PROBES.cz).length,ot=refused(LANG_PROBES.other).length,en=refused(LANG_PROBES.en);
 console.log(`# E3-d probes: Czech refused ${cz}/${LANG_PROBES.cz.length}, other ${ot}/${LANG_PROBES.other.length}, English refused ${en.length}/${LANG_PROBES.en.length}`);
 assert(1-miss.length/nonEn.length>=0.95,'non-English refusal under 0.95; leaked: '+JSON.stringify(miss));
 assert.deepEqual(en,[],'English refused');
});

const R3_FOREIGN=["Moje sestra chodi do osme tridy a kazde rano vstava v sest hodin.","V lete jsme jeli k babicce na chalupu a cely tyden prselo.","Muj nejlepsi kamarad hraje fotbal a kazdy vikend ma zapas.","Jidelna je mala, takze se u obedu vzdycky tvori dlouha fronta.","Driv jsme chodili do skoly pesky, ale ted nas vozi rodice autem.","Skolni uniformy by podle me zhorsily naladu v tride.","To je pravda.","Děkuji za pomoc.","Ano, souhlasím s tebou.","Ja nevim.","Skola zacina v osm.","Mam hlad a zizen.","Dekuji za pomoc.","Ano, souhlasim s tebou.","Die Schule beginnt jeden Morgen um acht Uhr.","Meine Schwester geht gern ins Kino und liest viele Bücher.","Ich bin müde.","Kannst du mir helfen?","Moja siostra chodzi do szóstej klasy i bardzo lubi matematykę.","Penso che i telefoni cellulari dovrebbero essere vietati durante le lezioni.","Ik vind dat mobiele telefoons tijdens de les niet gebruikt mogen worden."];
const R3_ENGLISH=["My dog is old, but he still runs to the door when I come home from school.","To be honest, I do not think that a ban on phones would solve the problem.","So many students do their homework on the bus that the driver has started to complain.","A lot of teenagers go to bed late on a school night and then cannot get up on time.","On the other hand, a ban could make students want their phones even more.","Ten to one, the teacher will set a test on Friday.","By the time we arrived, the match had already started and the crowd was loud.","Not every pupil has a quiet room at home, so the library matters to them.","Schools could offer breakfast, which would help pupils concentrate in the morning.","Phones distract students.","Rain ruined the picnic.","Pizza tastes great.","Cats sleep often.","My mum and my dad both think that I should read more books than I do now.","It is not fair that we have to wear a blazer even in the summer heat.","Students who walk to school arrive calmer, and teachers say they listen better.","No one told us that the trip was cancelled until we were already on the platform.","He said that he would come, but he did not, and nobody knows why.","The museum was free on Sunday, so we went there after lunch with my cousins.","Reading aloud helps younger children, particularly when the story is funny."].concat(['Ten to one','To be honest','Anna and Tom','Phones distract students.','Tea or coffee?']);
test('E3-d round 3: the recert-9 freshProbe leaks (plain-letter Czech, short Czech, German, Polish, Italian, Dutch) are refused; English built to collide with the lists is not',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 for(const t of R3_FOREIGN)assert.equal(R.paragraphIsEnglish(t),false,t);
 for(const t of R3_ENGLISH)assert.equal(R.paragraphIsEnglish(t),true,t);
});

test('EM3-1/EM3-2 (recert-9): a title line is kept apart from the paragraphs and the sentences',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const p1='Phones distract students. They check them in class.',p2='Some teachers disagree. They allow phones.';
 for(const sep of ['\n\n','\n']){
  const t='Phones in School'+sep+p1+'\n\n'+p2;
  assert.deepEqual(R.paragraphsOf(t),[p1,p2],JSON.stringify(sep));
  assert.equal(R.titleOf(t),'Phones in School');
  const ss=R.splitSentences(t);
  assert.equal(ss.length,4);assert.equal(ss[0].text,'Phones distract students.');assert.equal(ss[0].n,1);
 }
 // a title above a single paragraph: one paragraph, sentence 1 is not the title
 assert.deepEqual(R.paragraphsOf('My Dog\nMy dog is old. He runs.'),['My dog is old. He runs.'.replace('My dog','My dog')]);
 assert.equal(R.splitSentences('My Dog\nMy dog is old. He runs.')[0].text,'My dog is old.');
 // not titles
 assert.equal(R.titleOf('Phones distract students.\n\nThey check them in class.'),null);
 assert.equal(R.titleOf('Phones should be banned'),null);
 assert.equal(R.titleOf('Should phones be banned?\n\nPhones distract.'),null);
 assert.deepEqual(R.paragraphsOf('Should phones be banned?\n\nPhones distract.'),['Should phones be banned?','Phones distract.']);
 assert.equal(R.titleOf('# Phones\n\nPhones distract.'),null);
 assert.equal(R.titleOf('one two three four five six seven eight nine ten eleven twelve thirteen\n\nPhones distract.'),null);
 // a hard-wrapped paragraph is not cut in two
 assert.equal(R.titleOf('I think that phones in school are a problem for\nmany students because they distract.'),null);
 // no-title texts are unchanged
 assert.deepEqual(R.paragraphsOf('A. b\n\nC d.'),['A. b','C d.']);
 assert.deepEqual(R.paragraphsOf('One line.\nTwo line.'),['One line. Two line.']);
 assert.deepEqual(R.paragraphsOf(''),[]);assert.deepEqual(R.paragraphsOf(5),[]);
});

// ---- L1-helena-46-EM5-1: the curtain on a kept piece in Adult mode ----
test('L1-helena-46-EM5-1: Adult mode with a kept piece draws no sentence text on the lens home, the forensic page or the Table; School mode and an un-kept paragraph still do',()=>{
 const {getSession}=require(path.join(root,'src/lib/session/store.ts'));
 const base=getSession();
 const WORDS=['Moonlight quarterly figures slipped, so Acme must renegotiate.','Clients ought to hear this before Friday.'];
 const reading=(pieceId)=>({text:WORDS.join(' '),type:'structure',sentences:WORDS.map((text,i)=>({n:i+1,text,words:text.split(/\s+/).length,role:'claim',para:0})),stats:{sentences:2},verdicts:[{n:1,verdict:'faulty',note:'x'},{n:2,verdict:'neutral',note:'y'}],summary:'',...(pieceId?{piece:{paragraphs:1,read:[0],failed:[],pieceId}}:{})});
 const at=(profile,pieceId)=>({...base,jobs:{},status:'',screen:'forensic',focus:0,profiles:[profile],learner:{id:profile.id,name:profile.name},englishLearning:undefined,essay:reading(pieceId)});
 const adult={id:'hel',name:'Helena',type:'other',age:46,mode:'adult',modules:['essay']},school={id:'sam',name:'Sam',type:'high-school',age:15,modules:['essay']};
 const draws=(s)=>({home:drawEssay('EssayType',{...s,screen:'essaytype'}),page:drawEssay('Forensic',s,{table:false}),table:drawEssay('Forensic',s,{table:true})});
 for(const [k,html] of Object.entries(draws(at(adult,'p1')))){
  assert.doesNotMatch(html,/Moonlight|Acme|Clients ought/,`${k}: no sentence text on the TV`);
  assert.match(html,/PC page/,`${k}: says where the words are`);
 }
 const tableHtml=draws(at(adult,'p1')).table;
 assert.match(tableHtml,/Sentence 1/,'the table row keeps its sentence number');
 for(const [k,html] of Object.entries(draws(at(school,'p1')))) assert.match(html,/Moonlight|Clients ought/,`School mode ${k} shows the text as ever`);
 for(const [k,html] of Object.entries(draws(at(adult,undefined)))) assert.match(html,/Moonlight|Clients ought/,`an un-kept paragraph ${k} shows the text as ever`);
});

test('L1-eliska-12-EM1-1: planFit keeps its article, and a young faulty note holds none of the adult words',()=>{
 const {planSlots,planFit}=PLAN();
 assert.equal(planFit(planSlots(PARA),1,CLAIM),'That reads as a claim. This slot wants your evidence: something a reader can check.');
 const ss=RE.splitSentences('It is a bad thing to do.');
 const FAULTY=[
  ['structure','Teenagers sleep late.',[{n:1,job:'claim'}]],
  ['structure','Therefore it holds.',[{n:1,job:'link'}]],
  ['argument','Teenagers sleep late.',[{n:1,side:'wanders'}]],
  ['argument','Teenagers sleep late.',[{n:1,side:'against',turnsBack:false}]],
  ['evidence','Teenagers sleep late.',[{n:1,support:'opinion'}]],
  ['language','It is a bad thing to do.',[{n:1,issues:[{kind:'vague',word:'bad'}]}]],
  ['language','It is a good thing to do, a good thing.',[{n:1,issues:[{kind:'repeated',word:'good'}]}]],
  ['language',Array(37).fill('word').join(' ')+'.',[{n:1,issues:[]}]],
 ];
 const ADULT=/assert|checkable|unsupported|evidence|links back|turns? back|turn needs|wanders|split it/i;
 for(const [lens,text,obs] of FAULTY){
  const sen=RE.splitSentences(text),all=new Set(sen.map(s=>s.n));
  const teen=RE.decideVerdicts(lens,sen,all,obs),unknown=RE.decideVerdicts(lens,sen,all,obs,'teen'),young=RE.decideVerdicts(lens,sen,all,obs,'young');
  assert.equal(young[0].verdict,'faulty',lens+' young is faulty');
  assert.equal(teen[0].verdict,'faulty');
  assert.deepEqual(unknown,teen,'an explicit teen band is the default');
  assert.notEqual(young[0].note,teen[0].note,lens+': young has its own wording');
  assert.doesNotMatch(young[0].note,ADULT,'no adult word in: '+young[0].note);
 }
 const young=RE.decideVerdicts('evidence',RE.splitSentences('Teenagers sleep late.'),new Set([1]),[{n:1,support:'opinion'}],'young');
 assert.equal(young[0].note,'This says what you think, but gives nothing a reader could check.');
 const kept=[{n:1,note:young[0].note}];
 assert.deepEqual(RE.contextObservations('evidence',RE.splitSentences('Teenagers sleep late. Ok.'),2,kept),[{n:1,support:'opinion'}],'a young opinion note still reads as a ruled opinion');
});
test('L1-eliska-12-EM1-5: an Explain with no connector after marked evidence is not faulty; an opinion with no evidence before it still is',()=>{
 const P='Cars should be banned near schools. A 2021 study found that 40% of pupils live within one mile. Cleaner air helps pupils concentrate in lessons. The council should act now.';
 const obs=[{n:1,support:'opinion'},{n:2,support:'checkable',backs:1},{n:3,support:'opinion'},{n:4,support:'opinion'}];
 const v=evRule(P,obs);
 assert.notEqual(v.find(x=>x.n===3).verdict,'faulty','the connector-less Explain is neutral');
 assert.equal(v.some(x=>x.verdict==='faulty'),false,'a well-formed PEEL paragraph has no faulty mark');
 const bare=evRule('Cars should be banned near schools. Cleaner air helps pupils concentrate in lessons.',[{n:1,support:'opinion'},{n:2,support:'opinion'}]);
 assert.equal(bare.find(x=>x.n===2).verdict,'faulty','an opinion with no evidence before it stays faulty');
});
test('L1-eliska-12-EM1-6: cleanFix refuses a frame whose literal words state content, whatever the verb',()=>{
 const {cleanFix}=require(path.join(root,'src/lib/rules/essay.ts'));
 const fix=(pattern)=>cleanFix({move:'Name the source',pattern});
 assert.equal(fix('Teenagers sleep [how many] hours.'),undefined);
 assert.equal(fix('Councils ban cars outside schools [where].'),undefined);
 assert.equal(fix('Schools start early in the [time]'),undefined);
 assert.deepEqual(fix('Because [reason], [claim].'),{move:'Name the source',pattern:'Because [reason], [claim].'});
});

// ---- recert-12 rework: EM1-6 the English-only line, EM1-2 the first guess is named, EM1-1 Adult mode's words ----
const seatOf=(p)=>{const {getSession}=require(path.join(root,'src/lib/session/store.ts'));return {...getSession(),jobs:{},status:'',essay:null,learner:{id:'p1',name:'Sam'},profiles:[{id:'p1',name:'Sam',type:'other',modules:['essay'],...p}]};};
const textOf=(html)=>html.replace(/<[^>]*>/g,' ').replace(/&#x27;|&#39;/g,"'").replace(/\s+/g,' ');
test('EM1-6: englishOnlyLine speaks for a system outside uk and us only',()=>{
 assert.equal(ER.englishOnlyLine('cz'),'Essay Master reads English writing.');
 assert.equal(ER.englishOnlyLine('de'),'Essay Master reads English writing.');
 for(const x of ['uk','us',undefined])assert.equal(ER.englishOnlyLine(x),null,String(x));
 assert.equal(ER.englishOnlyFor(seatOf({system:'cz'})),'Essay Master reads English writing.');
 assert.equal(ER.englishOnlyFor(seatOf({system:'uk'})),null);
 assert.equal(ER.englishOnlyFor({learner:null,profiles:[]}),null);
});
test('EM1-6: the lens home and the plan caption say it once for a cz profile, not for a uk one',()=>{
 const E=require(path.join(root,'src/essay/EssayTV.tsx'));void E;
 const KEYS2=require(path.join(root,'src/tv/keys.ts'));
 for(const [sys,want] of [['cz',1],['uk',0]]){
  const s=seatOf({system:sys});
  const stops=KEYS2.lensStops(s);
  const lensAt=stops.findIndex(x=>x&&x!=='last'&&x!=='plan'),planAt=stops.indexOf('plan');
  assert.ok(lensAt>=0&&planAt>=0,'both stops exist');
  for(const f of [lensAt,planAt]){
   const n=(textOf(drawEssay('EssayType',s,{focus:f})).match(/Essay Master reads English writing\./g)||[]).length;
   assert.equal(n,want,sys+' focus '+f);
  }
 }
});
test('EM1-2: the crumb, Its job and the table call the regex role a first guess',()=>{
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.match(tv,/first guess: \{sn\.role\}/);assert.match(tv,/Its job · first guess/);assert.match(tv,/<span>First guess<\/span>/);
 assert.ok(!/<span>Role<\/span>/.test(tv)&&!/· \{sn\.role\}<\/span>/.test(tv));
});
test('EM1-1: Adult mode hears messages and emails on the lens home, the plan and the playbook; family keeps the school words',()=>{
 const KEYS2=require(path.join(root,'src/tv/keys.ts'));
 const adult=seatOf({mode:'adult'}),fam=seatOf({mode:'family'});
 const stops=KEYS2.lensStops(adult);
 const lensAt=stops.findIndex(x=>x&&x!=='last'&&x!=='plan'),planAt=stops.indexOf('plan');
 const home=(s)=>textOf(drawEssay('EssayType',s,{focus:lensAt})),plan=(s)=>textOf(drawEssay('EssayType',s,{focus:planAt}));
 assert.match(home({...adult,essayType:stops[lensAt].id}),/one message or email on the phone/);
 assert.match(plan(adult),/Write the message yourself/);
 assert.ok(!/paragraph/i.test(capOf(drawEssay('EssayType',adult,{focus:planAt})).text),'no paragraph in the adult plan caption');
 assert.match(plan(fam),/Write the paragraph yourself: one sentence for each slot, on the phone\./);
 assert.match(home({...fam,essayType:stops[lensAt].id}),/one paragraph on the phone\./);
 const L=require(path.join(root,'src/lib/library/lessons.data.ts'));
 for(const p of L.PLAYBOOK){
  assert.match(textOf(drawEssay('Playbook',{...adult},{focus:0})),/./);
  assert.equal(ER.playbookLine(p.id,p.line,false),p.line,p.id+' family line unchanged');
  assert.notEqual(ER.playbookLine(p.id,p.line,true),p.line,p.id+' adult line differs');
  assert.ok(!/introduction|student|school/i.test(ER.playbookLine(p.id,p.line,true)),p.id);
 }
 const para=KEYS2.PLAYBOOK_STOPS.find(x=>x.id==='para'),pi=KEYS2.PLAYBOOK_STOPS.indexOf(para);
 assert.match(textOf(drawEssay('Playbook',adult,{focus:pi})),/In a message or an email/);
 assert.match(textOf(drawEssay('Playbook',fam,{focus:pi})),/Claim, then evidence, then the link back\./);
 assert.match(textOf(drawEssay('Xray',{...adult,focus:pi})),/In a message or an email/);
});
test('L1-helena-46-EM1-1: an adult profile draws no paragraph at the lens home, the wait and failure captions, the plan and the playbook stop; family still does',()=>{
 const KEYS2=require(path.join(root,'src/tv/keys.ts'));
 const L=require(path.join(root,'src/lib/library/lessons.data.ts'));
 const adult=seatOf({mode:'adult'}),fam=seatOf({mode:'family'});
 const stops=KEYS2.lensStops(adult),argAt=stops.findIndex(x=>x&&x.id==='argument');
 assert.ok(argAt>=0);
 const job=(phase,extra)=>({analyse:{id:'j',phase,key:'essay',startedAt:Date.now(),...extra}});
 const PARA=/paragraph/i;
 const planOf=(s,extra)=>({...s,essayPlan:{lens:'structure',slots:['a','b','c']},...extra});
 const surfaces=(s)=>({
  argument:capOf(drawEssay('EssayType',s,{focus:argAt})).text,
  wait:capOf(drawEssay('EssayType',{...s,jobs:job('running')},{focus:argAt})).text,
  fail:capOf(drawEssay('EssayType',{...s,jobs:job('failed')},{focus:argAt})).text,
  planWait:capOf(drawEssay('EssayPlan',planOf(s,{jobs:job('running')}))).text,
  planFail:capOf(drawEssay('EssayPlan',planOf(s,{jobs:job('failed')}))).text,
  planRead:capOf(drawEssay('EssayPlan',planOf(s,{focus:3}))).text,
 });
 const A=surfaces(adult),F=surfaces(fam);
 assert.match(A.argument,/Does the message take a side/);
 for(const [k,t] of Object.entries(A)) assert.ok(!PARA.test(t),'adult '+k+': '+t);
 for(const k of ['argument','wait','fail','planWait','planFail','planRead']) assert.match(F[k],PARA,'family '+k);
 const pi=KEYS2.PLAYBOOK_STOPS.findIndex(x=>x.id==='para');
 for(const name of ['Playbook','Xray']){
  const a=textOf(drawEssay(name,name==='Xray'?{...adult,focus:pi}:adult,{focus:pi})),f=textOf(drawEssay(name,name==='Xray'?{...fam,focus:pi}:fam,{focus:pi}));
  assert.ok(!/Unit 0?2 · Paragraph/.test(a)&&!/Playbook · Paragraph/.test(a),name+' adult title');
  assert.match(a,/Message/);assert.match(f,/Paragraph/);
 }
 assert.match(textOf(drawEssay('Playbook',adult,{focus:pi})),/Unit 2 · Message/);
 assert.match(textOf(drawEssay('Playbook',fam,{focus:pi})),/Unit 2 · Paragraph/);
 assert.equal(ER.playbookTitle('para','Paragraph',false),'Paragraph');assert.equal(ER.playbookTitle('thesis','Thesis',true),'Thesis');
});
test('L1-helena-46-EM1-1: the plan heading and the empty lens home label say message for an adult, and keep paragraph for a child seat',()=>{
 const KEYS2=require(path.join(root,'src/tv/keys.ts'));
 const adult=seatOf({mode:'adult'}),fam=seatOf({mode:'family'});
 const stops=KEYS2.lensStops(adult),lensAt=stops.findIndex(x=>x&&x!=='last'&&x!=='plan');
 const home=(s)=>textOf(drawEssay('EssayType',{...s,essay:undefined},{focus:lensAt})),plan=(s)=>textOf(drawEssay('EssayPlan',{...s,essayPlan:{lens:'structure',slots:['a','b','c']}}));
 assert.match(home(adult),/First message/);assert.ok(!/paragraph/i.test(home(adult)),'adult lens home: '+home(adult));
 assert.match(plan(adult),/Your message, one sentence at a time/);assert.ok(!/paragraph/i.test(plan(adult).replace(/Your plan.*$/,'')||''),'adult plan heading');
 assert.match(home(fam),/First paragraph/);assert.match(plan(fam),/Your paragraph, one sentence at a time/);
});

test('L1-daniel-15-EM3-2: the title is not a paragraph or a sentence, and the forensic page shows it only when there is one',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const body='Phones distract students. They check them in class.';
 const t='Phones in School\n\n'+body;
 assert.deepEqual(R.paragraphsOf(t),[body]);
 assert.equal(R.splitSentences(t).length,2);assert.equal(R.splitSentences(t)[0].text,'Phones distract students.');
 assert.equal(R.forensicTitle({text:t}),'Phones in School');
 assert.equal(R.forensicTitle({text:body}),null);
 assert.equal(R.forensicTitle(null),null);
 assert.equal(R.forensicTitle({text:'Should phones be banned?\n\n'+body}),null,'a question line stays as readTitle decides');
 const tv=fs.readFileSync(path.join(root,'src/essay/EssayTV.tsx'),'utf8');
 assert.match(tv,/title=\{forensicTitle\(a\)\}/);assert.match(tv,/\{title && <div className="em-lbl" data-role="essay-title">/);
 const route=fs.readFileSync(path.join(root,'src/app/api/analyse/route.ts'),'utf8');
 assert.equal((route.match(/task: taskFor\(body\)/g)||[]).length,2,'both paths take the task from taskFor');
 assert.match(route,/taskOf\(body\.task\) \?\? taskOf\(titleOf\(body\.text\)\)/);
});
test('L1-daniel-15-EM2-2: a rewrite of a claim first ruled neutral as a later unsupported claim stays neutral; the first unsupported claim stays faulty',()=>{
 const T='Homework is pointless. Teachers give too much. It ruins evenings.',ss=RE.splitSentences(T);
 const all=[1,2,3].map(n=>({n,job:'claim'}));
 const first=RE.decideVerdicts('structure',ss,new Set([1,2,3]),all);
 assert.deepEqual(first.map(v=>[v.n,v.verdict]),[[1,'faulty'],[2,'neutral'],[3,'neutral']]);
 const redo=(n)=>RE.decideVerdicts('structure',ss,new Set([n]),[{n,job:'claim'},...RE.contextObservations('structure',ss,n,first)]).find(v=>v.n===n);
 assert.equal(redo(2)?.verdict??'neutral','neutral','(a) the later bare claim rewritten alone is neutral, as in the first reading');
 assert.equal(redo(3)?.verdict??'neutral','neutral','(a) the last claim too');
 assert.equal(redo(1).verdict,'faulty','(b) the first unsupported claim, rewritten and still bare, stays faulty');
 // (c) the other neutral rulings hold for a rewritten sentence: a claim closing after marked evidence
 const E='Homework is pointless. Research found that 70% of pupils lose sleep. Teachers give too much. Therefore it ruins evenings.',es=RE.splitSentences(E);
 const eo=[{n:1,job:'claim'},{n:2,job:'evidence'},{n:3,job:'claim'},{n:4,job:'claim'}];
 const efirst=RE.decideVerdicts('structure',es,new Set([1,2,3,4]),eo);
 const e4=RE.decideVerdicts('structure',es,new Set([4]),[{n:4,job:'claim'},...RE.contextObservations('structure',es,4,efirst)]).find(v=>v.n===4);
 assert.equal(e4?.verdict??'neutral',(efirst.find(v=>v.n===4)?.verdict??'neutral'),'(c) a rewritten closing claim is ruled as in the first reading');
});

test('L1-kristyna-17-EM1-1 refusal arm: short plain-letter Czech is refused, short English is not; the tuning set is pinned whole and the held-out set at its measured rate',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const tuning=JSON.parse(fs.readFileSync(path.join(__dirname,'essay-tuning-czech-short.json'),'utf8'));
 const held=JSON.parse(fs.readFileSync(path.join(__dirname,'essay-heldout-czech-short.json'),'utf8'));
 for(const t of tuning.czech)assert.equal(R.paragraphIsEnglish(t),false,t);
 for(const t of tuning.english)assert.equal(R.paragraphIsEnglish(t),true,t);
 // the held-out file is never tuned on: its sha256 must still be the one pinned with it, and the rate below is what was measured once, after the rule was final
 const sha=require('node:crypto').createHash('sha256').update(JSON.stringify({czech:held.czech,english:held.english})).digest('hex');
 assert.equal(sha,held.sha256,'the held-out file was edited');
 const cz=held.czech.filter(t=>!R.paragraphIsEnglish(t)),en=held.english.filter(t=>!R.paragraphIsEnglish(t));
 console.log(`# EM1-1 held-out: Czech refused ${cz.length}/${held.czech.length}, English refused ${en.length}/${held.english.length}`);
 assert.equal(cz.length,53,'held-out Czech refused (45 of 53 before the second round, 53 of 53 after; the second round did not tune on this file)');
 assert.equal(held.czech.length,53);
 assert.deepEqual(en,[],'no short English is refused');
 for(const t of ['Hello there','Tim ran home.','Slavoj Žižek','Mama made soup.'])assert.equal(R.paragraphIsEnglish(t),true,t);
});

test('L1-helena-46-EM1-4 second round: the eight leaks of recert-18 are refused; the r2 held-out set is pinned at its measured rate and short English is not refused',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 // tuned on these eight (recert-18 rows 1 and 5); not a held-out figure
 for(const t of ['Sneh uz roztal.','Pozdravuj sestru.','Autobus ujel.','Telefon mi dosel.','Ucitel nas pochvalil.','Dej mi vedet.','Pojd s nami ven.','Pomuzes mi s ukolem?'])assert.equal(R.paragraphIsEnglish(t),false,t);
 for(const t of ['Tim ran home.','Pan is a cat.','Jan has a dog.','Ted went out.','Dan likes pizza.','Kim called me.','Anna sat down.','Pavel is my friend.','Emil ran home.','Hotel opened.','April rain.','Koala sleeps.'])assert.equal(R.paragraphIsEnglish(t),true,t);
 const held=JSON.parse(fs.readFileSync(path.join(__dirname,'essay-heldout-czech-short-r2.json'),'utf8'));
 const sha=require('node:crypto').createHash('sha256').update(JSON.stringify({czech:held.czech,english:held.english})).digest('hex');
 assert.equal(sha,held.sha256,'the r2 held-out file was edited');
 const cz=held.czech.filter(t=>!R.paragraphIsEnglish(t)),en=held.english.filter(t=>!R.paragraphIsEnglish(t));
 console.log(`# EM1-4 r2 held-out: Czech refused ${cz.length}/${held.czech.length}, English refused ${en.length}/${held.english.length}`);
 assert.equal(held.czech.length,60);
 // r2 is now TUNED ON (round 3 read its eight leaks and tuned the rule on them): 60 of 60 is no longer a held-out figure; the blind figure is the r3 file below
 assert.equal(cz.length,60,'r2 held-out Czech refused (60 of 60 after round 3, 52 of 60 before it; r2 was tuned on in round 3, so this is not evidence)');
 assert.deepEqual(en,[],'no short English is refused');
});

// ---- L1-eliska-12-EM1-4 (recert-18): the planted-claim fix must not hang on optional link fields ----
test('L1-eliska-12-EM1-4: Structure on the planted-claim paragraph (P2) with no supports is refused, never ruled',async()=>{
 const claimEv=(ev)=>[{n:1,job:'claim',note:'x'},{n:2,job:'evidence',note:'x',...ev},{n:3,job:'claim',note:'x'}];
 for(const ev of [{},{supports:null},{supports:'3'},{supports:2.5}]){
  answer=obsReply(claimEv(ev));
  await assert.rejects(analyseEssay(P2,'structure','el-4'),{message:NOT_EVERY_SENTENCE},`links absent ${JSON.stringify(ev)}: no verdict, so the true topic sentence 1 is never marked`);
 }
 answer=obsReply(claimEv({supports:3}));
 const linked=verdictsOf(await analyseEssay(P2,'structure','el-4'));
 assert.deepEqual(linked,[[1,'faulty'],[2,'strong'],[3,'strong']],'the linked path is unchanged: the claim the evidence does not back is the faulty one');
 answer=obsReply(claimEv({supports:0}));
 const none=verdictsOf(await analyseEssay(P2,'structure','el-4'));
 assert.notDeepEqual(none.find(v=>v[0]===1),[1,'faulty'],'supports 0 (backs nothing) is an answer, and the topic sentence is not marked');
});
test('L1-eliska-12-EM1-4: Evidence on the planted-claim paragraph (P2) with no backs is refused, never ruled neutral',async()=>{
 const obs=(ev)=>[{n:1,support:'opinion',note:'x'},{n:2,support:'checkable',note:'x',...ev},{n:3,support:'opinion',note:'x'}];
 for(const ev of [{},{backs:null},{backs:'3'},{backs:1.5}]){
  answer=obsReply(obs(ev));
  await assert.rejects(analyseEssay(P2,'evidence','el-4'),{message:NOT_EVERY_SENTENCE},`links absent ${JSON.stringify(ev)}: refused, the planted claim is not passed as neutral`);
 }
 answer=obsReply(obs({backs:3}));
 const linked=verdictsOf(await analyseEssay(P2,'evidence','el-4'));
 assert.deepEqual(linked.find(v=>v[0]===1),[1,'faulty'],'the linked path: the opinion nothing backs is faulty');
 assert.notEqual(linked.find(v=>v[0]===3)[1],'faulty','the opinion the evidence backs is not');
 answer=obsReply(obs({backs:0}));
 await analyseEssay(P2,'evidence','el-4');
});
test('L1-eliska-12-EM1-4: unanswered() counts a missing link on an evidence-job or checkable sentence, and only there',()=>{
 const {unanswered}=rules(),j=new Set([1,2]);
 assert.deepEqual(unanswered('structure',j,[{n:1,job:'claim'},{n:2,job:'evidence'}]),[2]);
 assert.deepEqual(unanswered('structure',j,[{n:1,job:'claim'},{n:2,job:'evidence',supports:0}]),[]);
 assert.deepEqual(unanswered('structure',j,[{n:1,job:'claim'},{n:2,job:'context'}]),[]);
 assert.deepEqual(unanswered('evidence',j,[{n:1,support:'opinion'},{n:2,support:'checkable'}]),[2]);
 assert.deepEqual(unanswered('evidence',j,[{n:1,support:'opinion'},{n:2,support:'checkable',backs:1}]),[]);
 assert.deepEqual(unanswered('argument',j,[{n:1,side:'pushes'},{n:2,side:'neutral'}]),[]);
});

test('L1-helena-46-EM1-4 round 3: the eight r2 leaks are tuned cases; the r3 blind set is pinned at its measured rate and short English is not refused',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 // tuned on these eight (recert-19 r2 leaks); not a held-out figure
 for(const t of ['Mama uklizi pokoj.','Deda sekal drevo.','Nechapu ten priklad.','Boli me noha.','Nebavi me to.','Mrzne a fouka.','Pojedu k babicce.','Neumim plavat.'])assert.equal(R.paragraphIsEnglish(t),false,t);
 for(const t of ['Mama made soup.','Hello there','Jan has a dog.','Eva lives in Brno.','Vitamin D helps.'])assert.equal(R.paragraphIsEnglish(t),true,t);
 const held=JSON.parse(fs.readFileSync(path.join(__dirname,'essay-heldout-czech-short-r3.json'),'utf8'));
 const sha=require('node:crypto').createHash('sha256').update(JSON.stringify({czech:held.czech,english:held.english})).digest('hex');
 assert.equal(sha,held.sha256,'the r3 held-out file was edited');
 assert.equal(sha,'ad2017a6678efe1a906d5949ea66e5e1b6e83daf1f29f2baa5622496c82488ab');
 const cz=held.czech.filter(t=>!R.paragraphIsEnglish(t)),en=held.english.filter(t=>!R.paragraphIsEnglish(t));
 console.log(`# EM1-4 r3 held-out: Czech refused ${cz.length}/${held.czech.length}, English refused ${en.length}/${held.english.length}`);
 assert.equal(held.czech.length,60);
 assert.equal(held.english.length,45);
 // blind figure in round 3; r3 is TUNED ON from round 4 (its three leaks were read), so the current count is 60 of 60 and is no longer a held-out figure, measured once after the rule was final (55 of 60 before the rule); the rule was not tuned on this file
 assert.equal(cz.length,60,'r3 TUNED Czech refused (60 of 60 after round 4; 57 of 60 blind in round 3)');
 assert.deepEqual(en,[],'no short English is refused');
});

test('L1-helena-46-EM1-4 round 4: the r4 blind set is pinned at its measured rate; r3 is tuned',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 // tuned on these (the three r3 leaks); not a held-out figure
 for(const t of ['Snim o prazdninach','Prelozte tu vetu','Nemohu najit klice'])assert.equal(R.paragraphIsEnglish(t),false,t);
 const held=JSON.parse(fs.readFileSync(path.join(__dirname,'essay-heldout-czech-short-r4.json'),'utf8'));
 const sha=require('node:crypto').createHash('sha256').update(JSON.stringify({czech:held.czech,english:held.english})).digest('hex');
 assert.equal(sha,held.sha256,'the r4 held-out file was edited');
 const cz=held.czech.filter(t=>!R.paragraphIsEnglish(t)),en=held.english.filter(t=>!R.paragraphIsEnglish(t));
 console.log(`# EM1-4 r4 held-out: Czech refused ${cz.length}/${held.czech.length}, English refused ${en.length}/${held.english.length}`);
 assert.equal(held.czech.length,59);
 assert.equal(held.english.length,45);
 // r4 is TUNED from round 5 (the letter-run profile of rules/essayLang learnt from it, and its english[15] was the case fixed): 54 of 59 before round 4, 55 of 59 blind after it, 59 of 59 tuned after round 5
 assert.ok(cz.length>=55,'r4 TUNED Czech refused is no lower than the round-4 figure (55 of 59)');
 // L1-helena-46-EM1-9: the one r4 English line refused in rounds 3 and 4 (english[15], named by its hash only) is English now, and no other is refused
 assert.equal(require('node:crypto').createHash('sha256').update(held.english[15],'utf8').digest('hex'),'aab59657a72c339de214c8918ffcbc28490326c7d42acb73e74141c37daaeb71');
 assert.equal(R.paragraphIsEnglish(held.english[15]),true,'r4 english[15] is not refused');
 assert.deepEqual(en.map(t=>held.english.indexOf(t)),[],'r4 English refused is 0 of 45');
 for(const f of ['essay-heldout-czech-short-r2.json','essay-heldout-czech-short-r3.json']){const h=JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'));assert.deepEqual(h.english.filter(t=>!R.paragraphIsEnglish(t)),[],f+' English is not refused');}
});

test('L1-helena-46-EM1-9 round 5: the letter-run profile is trainProfile() on the training sets (never r5), and no English line of a tuning or older held-out set is refused',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts')),L=require(path.join(root,'src/lib/rules/essayLang.ts'));
 const j=(f)=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'));
 const short=['essay-tuning-czech-short.json','essay-heldout-czech-short.json','essay-heldout-czech-short-r2.json','essay-heldout-czech-short-r3.json','essay-heldout-czech-short-r4.json'].map(j),big=j('essay-heldout-r3.json');
 const profile=L.trainProfile([...short.flatMap(s=>s.czech),...big.czPlain,...big.czShort],[...short.flatMap(s=>s.english),...big.en]);
 assert.equal(L.PROFILE,profile,'PROFILE in rules/essayLang.ts is not the one these sets train: regenerate it, never hand-edit it');
 for(const s of short){assert.deepEqual(s.english.filter(t=>!R.paragraphIsEnglish(t)),[],s.purpose.slice(0,40)+': English is not refused');assert.deepEqual(s.czech.filter(t=>R.paragraphIsEnglish(t)).length,0,s.purpose.slice(0,40)+': Czech is refused');}
 assert.deepEqual(big.en.filter(t=>!R.paragraphIsEnglish(t)),[],'essay-heldout-r3 English is not refused');
 for(const k of ['czPlain','czShort','de','it','nl','pl'])assert.equal(big[k].filter(t=>R.paragraphIsEnglish(t)).length,0,'essay-heldout-r3 '+k+' is refused');
 // the profile leans: English lines below 0, Czech above, and it reads no list
 assert.ok(L.czechLean('We had soup for lunch')<0);assert.ok(L.czechLean('Mame doma kocku')>0);assert.equal(L.czechLean(''),0);assert.equal(L.czechLean(null),0);
 // a refusal another language makes is never lifted by the Czech/English profile; a two-word name stays to the word lists
 assert.equal(R.paragraphIsEnglish('Ich bin heute sehr müde.'),false);
 for(const t of ['Slavoj Žižek','Tim ran home.','Hello there'])assert.equal(R.paragraphIsEnglish(t),true,t);
});

test('L1-helena-46-EM1-4 round 5: the r5 BLIND set is pinned at its measured rate (60 of 60 Czech refused, 0 of 45 English); r4 is tuned',()=>{
 const R=require(path.join(root,'src/lib/rules/essay.ts'));
 const held=JSON.parse(fs.readFileSync(path.join(__dirname,'essay-heldout-czech-short-r5.json'),'utf8'));
 const sha=require('node:crypto').createHash('sha256').update(JSON.stringify({czech:held.czech,english:held.english})).digest('hex');
 assert.equal(sha,held.sha256,'the r5 held-out file was edited');
 assert.equal(sha,'b44e9ce80a16f0e108d8553ebc9fd223f41800751b09e53ef2a6463162e6dd91');
 assert.equal(held.czech.length,60);
 assert.equal(held.english.length,45);
 const cz=held.czech.filter(t=>!R.paragraphIsEnglish(t)),en=held.english.filter(t=>!R.paragraphIsEnglish(t));
 console.log(`# EM1-4 r5 BLIND: Czech refused ${cz.length}/${held.czech.length}, English refused ${en.length}/${held.english.length}`);
 // BLIND: committed alone in befc9a06 before the round-5 profile (d97ec7b9), measured once after it was final; the round-4 word-list rule gives 57 of 60 and 1 of 45 on it. Never tuned on.
 assert.equal(cz.length,60,'r5 BLIND Czech refused (60 of 60)');
 assert.deepEqual(en.map(t=>held.english.indexOf(t)),[],'r5 BLIND English refused is 0 of 45');
});
