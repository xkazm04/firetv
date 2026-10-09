/**
 * THE SUNDAY PAGE (Family W9): the parent's week in words, written by code from the learner's own digest (rules/week
 * sundayPage + sundayWords, over rules/digest), no model. A fixed week gives fixed words (snapshotted below as literals);
 * an empty week is exactly "Nothing this week."; one everyday act per school unit (DO_IT, all 15 ids of the real path);
 * the slip line only for a slip seen twice or more; at most three units then "and N more"; a step up only when a
 * step-up set was marked; never a percent sign, a ranking, praise, another learner, a question or an answer; the same
 * inputs give the same words; every line within LINE_WORDS and the page within PAGE_WORDS. Through the store: the page
 * is the seated learner's only, assembled on the server, and only its lines reach a phone (never the digest, never
 * the TV or a guest).
 * Run with npm test in desk/ (directly: node tools/week-rules-test.cjs). No model is called (the engines throw); the
 * data directory is disposable, under the OS temp dir; never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
const {transpile,options}=require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-week-rules-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
const engine=require(src('lib/engines/text.ts'));require(src('lib/engines/vision.ts'));
let calls=0;engine.text=()=>{calls++;throw new Error('the text engine was called');};
for(const kind of ['text','vision','embed'])reg.useProvider(kind,{name:'stub',run:async()=>{calls++;throw new Error(`the ${kind} engine was called`);}});
const W=require(src('lib/rules/week.ts'));
const D=require(src('lib/rules/digest.ts'));
const S=require(src('lib/rules/school.ts'));
const {PATHS}=require(src('lib/library/paths.ts'));
const {ENGLISH_SCENES}=require(src('lib/english/curriculum.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const {view}=require(src('lib/session/pairing.ts'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});

/** Local time on a day of September 2026 (the 27th is a Sunday): the page's week is local-midnight based, like the recap. */
const at=(day,h,m=0)=>new Date(2026,8,day,h,m).getTime();
const NOW=at(27,21);
const M=(day,h,topic,right,total,extra={})=>({at:at(day,h),kind:'maths',topic,right,notSure:0,total,...extra});
const E=(day,h,sceneId,skill,turns)=>({at:at(day,h),kind:'english',sceneId,skill,turns});
const R=(day,h,lens,sentences,faulty)=>({at:at(day,h),kind:'essay',lens,sentences,faulty});
const H=(day,h,problems,hints=0,second=0)=>({at:at(day,h),kind:'homework',problems,hints,second});
const P=(day,h,questions)=>({at:at(day,h),kind:'paper',questions});
const MIA={name:'Mia'};
const learnerOf=(digest,english={plan:null})=>({digest:D.cleanDigest(digest),english});
const words=(l,p=MIA,now=NOW)=>W.sundayWords(W.sundayPage(learnerOf(l.digest??l,l.english),p,now));
const texts=(lines)=>lines.map((x)=>x.head?`# ${x.text}`:x.text);

/** A full week: four units (one a step up), a slip three times, two Linga conversations, three readings; and two entries outside the week. */
const WEEK=[
 M(20,20,'pct-change',6,6),                                                      // Sunday before: outside the week
 M(21,19,'frac-add-sub',3,6,{notSure:1,slip:'tops-and-bottoms',slipN:2}),
 M(22,18,'frac-add-sub',5,6,{slip:'tops-and-bottoms',slipN:1}),
 E(22,19,'teacher','repair',4),
 M(23,18,'ratio-share',4,6,{stretch:true}),
 R(24,19,'structure',5,2),
 E(25,18,'lost','request',6),
 R(25,19,'argument',4,1),
 M(26,20,'area',6,6),
 M(26,20,'mean-range',2,6,{notSure:1,slip:'stat-median',slipN:1},),
 R(27,17,'structure',4,0),
 M(28,9,'unit-rate',6,6),                                                        // after now: outside the week
];
WEEK[9].at=at(26,20,30);
const FULL=[
 'Mia worked on seven evenings.',
 '# Math Buddy',
 'Add and subtract fractions: 5 of 6 right, last set.',
 'Mean and range: 2 of 6 right, last set.',
 'And two more units.',
 'A step up taken in Ratio and sharing.',
 '# One thing to look at',
 'The most common slip, three times: added the tops and the bottoms.',
 '# Linga',
 'Two conversations: The lost jacket · Say that again, please.',
 '# Essay Master',
 'Three paragraph readings, through Structure and Argument.',
 '# One thing to try together',
 'While cooking, ask them how much half a cup and a quarter cup make.',
];

// ------------------------------------------------------------------ 1. a fixed week gives fixed words
test('1: a fixed full week gives fixed words, in the page\'s order; the rows behind them are counts and names',()=>{
 const page=W.sundayPage(learnerOf(WEEK),MIA,NOW);
 assert.equal(page.empty,false);assert.equal(page.evenings,7);
 assert.deepEqual(page.units.map((u)=>[u.id,u.sets,u.right,u.total,u.stretch]),[['frac-add-sub',2,5,6,false],['mean-range',1,2,6,false],['area',1,6,6,false],['ratio-share',1,4,6,true]],'most sets first, then the most recent; the last set\'s count');
 assert.deepEqual(page.slip,{id:'tops-and-bottoms',name:'Added the tops and the bottoms',times:3});
 assert.deepEqual(page.english,{conversations:2,scenes:['The lost jacket','Say that again, please']});
 assert.deepEqual(page.essay,{readings:3,pieces:0,lenses:['Structure','Argument']});
 assert.equal(page.tryIt,W.DO_IT['frac-add-sub'],'the unit worked most');
 assert.deepEqual(texts(W.sundayWords(page)),FULL);
 assert.ok(W.pageWords(W.sundayWords(page))<=W.PAGE_WORDS);
 assert.equal(calls,0,'no model');
});

test('2: a thin week (one unit) and the empty week',()=>{
 const thin=[M(24,18,'area',3,6,{slip:'area-no-half',slipN:2}),M(24,19,'area',4,6,{notSure:1})];
 assert.deepEqual(texts(words(thin)),[
  'Mia worked on one evening.',
  '# Math Buddy',
  'Area of rectangles, triangles and composite shapes: 4 of 6 right, last set.',
  '# One thing to look at',
  'The most common slip, twice: the half left out.',
  '# One thing to try together',
  'Measure a rug together and work out its area.',
 ]);
 // nothing in the window: exactly the two words, and nothing else
 for(const l of [[],[M(20,20,'area',6,6)],[M(28,9,'area',6,6)],[{at:NOW-8*86400000,kind:'essay',lens:'language',sentences:3,faulty:0}]]){
  const lines=words(l);
  assert.deepEqual(lines,[{section:'week',text:'Nothing this week.'}]);
  assert.equal(W.sundayPage(learnerOf(l),MIA,NOW).tryIt,null,'no act on an empty week');
 }
 assert.equal(W.WEEK_EMPTY,'Nothing this week.');
 // the window: local midnight six days back is in, a minute before it is out
 const edge=[{...M(21,0,'area',6,6)},{...M(20,23,'frac-add-sub',6,6)}];edge[1].at=at(20,23,59);
 assert.deepEqual(W.sundayPage(learnerOf(edge),MIA,NOW).units.map((u)=>u.id),['area']);
});

// ------------------------------------------------------------------ 3. the one act, per unit
test('3: DO_IT has one everyday act for each of the 17 school topics (the real path); plain, short, no percent sign, no digit, no brand, no em dash',()=>{
 const ids=PATHS.school.topics.map((t)=>t.id);
 assert.equal(ids.length,PATHS.school.topics.length);
 assert.deepEqual(Object.keys(W.DO_IT).sort(),[...ids].sort(),'exactly the school path\'s ids');
 const BRANDS=/\b(ikea|tesco|lidl|aldi|walmart|amazon|coca|pepsi|lego|mcdonald|starbucks|nutella|nike|apple store|google|netflix|kaufland|albert|billa)\b/i;
 const all=[...Object.values(W.DO_IT),...Object.values(W.DO_IT_ELSE)];
 assert.equal(new Set(all).size,all.length,'each line its own');
 for(const line of all){
  assert.doesNotMatch(line,/%/,line);assert.doesNotMatch(line,/\d/,`${line}: no figure`);
  assert.doesNotMatch(line,BRANDS,line);assert.doesNotMatch(line,/[—–]/,`${line}: no em or en dash`);
  assert.doesNotMatch(line,/[€$£]|\b(euro|pound|dollar|crown)s?\b/i,`${line}: no money amount`);
  assert.doesNotMatch(line,/\b(great|well done|good job|amazing|excellent|proud|points?|streaks?|score)\b/i,`${line}: no praise, no score`);
  assert.match(line,/^[A-Z][^.!?]*[.]$/,`${line}: one sentence`);
  assert.ok(W.wordsIn(line)<=W.LINE_WORDS,`${line}: ${W.wordsIn(line)} words`);
 }
 // each unit's act is the one the page offers when that unit was worked most
 for(const id of ids)assert.equal(W.sundayPage(learnerOf([M(24,18,id,3,6)]),MIA,NOW).tryIt,W.DO_IT[id],id);
 // a week with no school unit: by what was done
 assert.equal(W.sundayPage(learnerOf([E(24,18,'teacher','repair',3)]),MIA,NOW).tryIt,W.DO_IT_ELSE.english);
 assert.equal(W.sundayPage(learnerOf([R(24,18,'structure',3,1)]),MIA,NOW).tryIt,W.DO_IT_ELSE.essay);
 assert.equal(W.sundayPage(learnerOf([E(24,18,'teacher','repair',3),R(24,19,'structure',3,1),R(25,19,'structure',3,1)]),MIA,NOW).tryIt,W.DO_IT_ELSE.essay,'more readings than conversations');
 assert.equal(W.sundayPage(learnerOf([E(24,18,'teacher','repair',3),R(24,19,'structure',3,1)]),MIA,NOW).tryIt,W.DO_IT_ELSE.english,'a tie: Linga');
 assert.equal(W.sundayPage(learnerOf([M(24,18,'calc1-functions',3,6)]),MIA,NOW).tryIt,W.DO_IT_ELSE.any,'a course topic has no act of its own');
});

// ------------------------------------------------------------------ 4. the slip line, the units line, the step up
test('4: the slip line only for a slip seen twice or more; at most three units then "and N more"; a step up only when a step-up set was marked',()=>{
 const once=[M(24,18,'frac-add-sub',4,6,{slip:'tops-and-bottoms',slipN:1}),M(25,18,'frac-add-sub',4,6,{slip:'wrong-direction',slipN:1})];
 assert.ok(!words(once).some((l)=>l.section==='look'),'two different slips once each: no slip line');
 assert.ok(words([M(24,18,'frac-add-sub',4,6,{slip:'wrong-direction',slipN:1}),M(25,18,'frac-add-sub',4,6,{slip:'wrong-direction',slipN:1})]).some((l)=>l.text==='The most common slip, twice: subtracted the wrong way round.'));
 // a tie on the week: rules/school's table order
 const tie=[M(24,18,'frac-add-sub',2,6,{slip:'wrong-direction',slipN:2}),M(25,18,'area',2,6,{slip:'area-added-sides',slipN:2}),M(25,19,'frac-add-sub',2,6,{slip:'tops-and-bottoms',slipN:2})];
 assert.equal(W.sundayPage(learnerOf(tie),MIA,NOW).slip.id,'tops-and-bottoms','table order: the earlier slip');
 // units: 1, 2, 3 named; 4 and 5 add "and N more"
 const five=['frac-equivalent','frac-of-amount','dec-arith','pct-of-amount','unit-rate'].map((id,i)=>M(21+i,18,id,3,6));
 for(const n of [1,2,3,4,5]){
  const lines=words(five.slice(0,n)),named=lines.filter((l)=>l.section==='maths'&&/right, last set\.$/.test(l.text));
  assert.equal(named.length,Math.min(n,3),`${n} units: named`);
  const more=lines.filter((l)=>/^And (one more unit|\w+ more units)\.$/.test(l.text));
  assert.deepEqual(more.map((l)=>l.text),n>3?[n===4?'And one more unit.':'And two more units.']:[],`${n} units: the rest`);
 }
 assert.ok(!words(five).some((l)=>/step up/i.test(l.text)),'no step-up set: no step-up words');
 const two=[M(24,18,'area',6,6,{stretch:true}),M(25,18,'ratio-share',6,6,{stretch:true})];
 assert.ok(words(two).some((l)=>l.text==='A step up taken in two units.'));
 assert.equal(words([M(24,18,'area',6,6,{stretch:true})]).filter((l)=>/step up/i.test(l.text)).length,1);
 assert.ok(words([M(24,18,'linear-both-sides',6,6,{stretch:true})]).some((l)=>l.text==='A step up taken in Equations with brackets and x on both sides.'));
 assert.ok(!words([M(24,18,'area',6,6,{stretch:true}),M(25,18,'area',6,6)]).some((l)=>/step up taken this week/.test(l.text)),'one unit: named');
});

test('5: Linga and Essay Master lines when present: scene names (authored, or the plan topic\'s own title), readings and lenses; none otherwise',()=>{
 const plan={at:1,band:'A2',topics:[{id:'plan-0a1b2c3d',title:'Planning a class trip',goal:'g',why:'w',skill:'negotiate',audience:'all',partner:'p',premise:'x',cue:'c',quiz:{question:'q',options:['a','b'],correct:0}}]};
 const l={digest:[E(24,18,'plan-0a1b2c3d','negotiate',5),E(25,18,'plan-99999999','relate',2),E(26,18,'teacher','repair',3),E(26,19,'teacher','repair',1)],english:{plan}};
 const lines=words(l);
 assert.ok(lines.some((x)=>x.text==='Four conversations: Say that again, please · Planning a class trip.'),texts(lines).join(' | '));
 assert.ok(words([E(24,18,'plan-99999999','relate',2)]).some((x)=>x.text==='One conversation.'),'a scene the desk cannot name is counted, not named');
 assert.ok(words([R(24,18,'language',3,1)]).some((x)=>x.text==='One paragraph reading, through Language.'));
 const all=words([R(21,18,'language',3,1),R(22,18,'evidence',3,1),R(23,18,'argument',3,1),R(24,18,'structure',3,1)]);
 assert.ok(all.some((x)=>x.text==='Four paragraph readings, through Structure, Argument, Evidence and Language.'),'lenses in the desk\'s order');
 const maths=words([M(24,18,'area',6,6)]);
 assert.ok(!maths.some((x)=>x.section==='english'||x.section==='essay'),'no Linga or Essay lines without them');
 assert.ok(!words([E(24,18,'teacher','repair',3)]).some((x)=>x.section==='maths'||x.section==='look'),'no maths lines without maths');
 // every authored scene name fits a line
 for(const s of ENGLISH_SCENES){const x=words([E(24,18,s.id,s.skill,3)]).find((y)=>y.section==='english'&&!y.head);assert.equal(x.text,`One conversation: ${s.name}.`);}
 // many long names: as many as fit, then "and N more"
 const long={digest:ENGLISH_SCENES.map((s,i)=>E(21+(i%7),10+i,s.id,s.skill,2)),english:{plan:null}};
 const ln=words(long).find((y)=>y.section==='english'&&!y.head).text;
 assert.match(ln,/, and \w+ more\.$/);assert.ok(W.wordsIn(ln)<=W.LINE_WORDS,ln);
});

// ------------------------------------------------------------------ 6. privacy and the stance
test('6: privacy and the stance - no percent sign, no praise, ranking or comparison, no item text, no other learner; lines and page within their limits; deterministic',()=>{
 const ITEMS=['Work out 3/4 + 1/6.','35% of 80','11/12','4/10'];
 const fixtures=[WEEK,[M(24,18,'area',3,6)],[],[E(24,18,'teacher','repair',3)],[R(24,18,'structure',3,1)],
  // a worst case: every school unit, step ups everywhere, every lens, every scene, slips
  [...PATHS.school.topics.map((t,i)=>M(21+(i%7),8+i,t.id,i%7,6,{stretch:true,...(S.SCHOOL_UNIT_SLIPS[t.id]?{slip:S.SCHOOL_UNIT_SLIPS[t.id][0],slipN:3}:{})})),
   ...ENGLISH_SCENES.map((s,i)=>E(21+(i%7),9+i,s.id,s.skill,3)),...['structure','argument','evidence','language'].map((x,i)=>R(22+i,20,x,5,2))]];
 for(const f of fixtures){
  const lines=words(f),all=lines.map((l)=>l.text).join('\n');
  assert.doesNotMatch(all,/%/,'no percent sign anywhere');
  assert.doesNotMatch(all,/\d\s*percent|percent(age)? (right|correct)|percentage/i,'no percentage score (a unit\'s name may say percent)');
  assert.doesNotMatch(all,/\b(great|well done|good job|amazing|excellent|proud|trophy|points?|streaks?|scores?|rank|best|worst|behind|ahead|sibling|brother|sister|year \d|years old|age)\b/i,'no praise, ranking or comparison');
  assert.doesNotMatch(all,/[—–]/,'no em dash');
  for(const x of ITEMS)assert.ok(!all.includes(x),`no item text: ${x}`);
  for(const l of lines){assert.ok(W.wordsIn(l.text)<=W.LINE_WORDS,`${W.wordsIn(l.text)} words: ${l.text}`);assert.deepEqual(Object.keys(l).filter((k)=>!['section','head','text'].includes(k)),[],'a line is its words only');}
  assert.ok(W.pageWords(lines)<=W.PAGE_WORDS,`${W.pageWords(lines)} words`);
  // deterministic: the same inputs, the same words; the digest's order does not matter
  assert.deepEqual(words(f),lines);
  assert.deepEqual(words([...f].reverse()),lines,'order of entries on the file');
 }
 const worst=words(fixtures[5]);
 assert.ok(worst.some((l)=>/^And \w+ more units\.$/.test(l.text)),'a busy week is trimmed by detail, not by section');
 for(const s of ['maths','look','english','essay','try'])assert.ok(worst.some((l)=>l.section===s),`${s} kept`);
 // the name is the profile's; with none, a neutral word, never an id
 assert.match(words(WEEK,{name:'  '})[0].text,/^Your learner worked on/);
 assert.match(words(WEEK,null)[0].text,/^Your learner worked on/);
});

// ------------------------------------------------------------------ MB-B14: homework sheets and papers on the page
test('MB-B14: the homework line comes first in Math Buddy, the paper line last; the heading shows for either alone; a homework-only week is not empty',()=>{
 assert.deepEqual(texts(words([H(23,18,6),H(24,18,4),H(25,18,5)])),['Mia worked on three evenings.','# Math Buddy','Three homework sheets.','# One thing to try together',W.DO_IT_ELSE.any]);
 assert.ok(words([H(24,18,6,1)]).some((l)=>l.text==='One homework sheet, 1 hint.'));
 assert.ok(words([H(24,18,6,3,1),H(25,18,4,2,1)]).some((l)=>l.text==='Two homework sheets, 5 hints, 2 needed a second.'));
 assert.deepEqual(texts(words([P(24,18,20)])),['Mia worked on one evening.','# Math Buddy','One practice paper typed in.','# One thing to try together',W.DO_IT_ELSE.any]);
 assert.ok(words([P(24,18,20),P(25,18,8)]).some((l)=>l.text==='Two practice papers typed in.'));
 const both=words([H(22,18,6,2),M(23,18,'area',4,6,{stretch:true}),P(24,18,20)]).filter((l)=>l.section==='maths').map((l)=>l.text);
 assert.deepEqual(both.slice(0,2),['Math Buddy','One homework sheet, 2 hints.'],'homework before the units');
 assert.equal(both.at(-1),'One practice paper typed in.','the paper after the unit and step-up lines');
 assert.equal(both.filter((t)=>t==='Math Buddy').length,1,'one heading');
 // evenings: a homework evening counts as any other
 assert.equal(W.sundayPage(learnerOf([H(21,18,3),M(22,18,'area',3,6),H(22,19,3)]),MIA,NOW).evenings,2);
 // counts only: no percent, no praise, no em dash
 for(const l of words([H(21,18,9,40,9),H(22,18,9,0,0),P(23,18,30)]))assert.doesNotMatch(l.text,/%|[—–]|(great|well done|good job|score|percent)/i,l.text);
 assert.equal(calls,0);
});

// ------------------------------------------------------------------ 7. through the store: this learner's only, lines only, phone only
test('7: the store assembles the seated learner\'s page on the server; a phone gets only its lines, never the digest; the TV and a guest get none; another learner\'s week never shows',()=>{
 store.dispatch({type:'reset'});
 for(const [id,name] of [['week-a','Ada'],['week-b','Ben']]){store.dispatch({type:'profile.draft',patch:{id,name,type:'elementary',age:12,system:'uk',modules:['maths','english','essay']}});store.dispatch({type:'profile.save'});}
 const now=Date.now(),day=86400000;
 learners.addDigest('week-a',{at:now-day,kind:'maths',topic:'area',right:5,notSure:0,total:6,slip:'area-no-half',slipN:1});
 learners.addDigest('week-a',{at:now-2*day,kind:'maths',topic:'area',right:2,notSure:0,total:6,slip:'area-no-half',slipN:2});
 learners.addDigest('week-b',{at:now-day,kind:'essay',lens:'argument',sentences:4,faulty:2});
 store.dispatch({type:'learner.set',id:'week-a'});
 let s=store.getSession();
 assert.ok(Array.isArray(s.week)&&s.week[0].text.startsWith('Ada worked on'),'Ada\'s page');
 assert.ok(s.week.some((l)=>l.text.startsWith('Area of rectangles')),'her unit');
 assert.ok(!JSON.stringify(s.week).includes('Ben')&&!s.week.some((l)=>l.section==='essay'),'nothing of Ben\'s');
 assert.deepEqual(s.week,W.sundayWords(W.sundayPage(learners.getLearner('week-a'),{name:'Ada'},now)).map((x)=>x),'the pure assembler\'s lines, as they are');
 const phone=view(s,'phone'),tv=view(s,'tv'),guest=view(s,'guest');
 assert.deepEqual(phone.week,s.week,'the phone gets the lines');
 assert.equal(tv.week,undefined,'the TV is not sent the parent\'s page');assert.equal(guest.week,undefined,'nor a guest');
 const sent=JSON.stringify(phone);
 for(const k of ['"digest"','"slipN"','"notSure"','area-no-half','"topic":"area"'])assert.ok(!sent.includes(k),`the phone is never sent ${k}`);
 // Ben sits down: his page replaces hers
 store.dispatch({type:'learner.set',id:'week-b'});s=store.getSession();
 assert.ok(s.week[0].text.startsWith('Ben worked on one evening'));assert.ok(!JSON.stringify(s.week).includes('Ada')&&!s.week.some((l)=>l.section==='maths'),'nothing of Ada\'s');
 // no one seated: none
 store.dispatch({type:'reset'});assert.equal(store.getSession().week,null);
 // a session that ends redraws the page from the record as it now stands
 store.dispatch({type:'profile.draft',patch:{id:'week-c',name:'Cy',type:'elementary',age:12,modules:['maths']}});store.dispatch({type:'profile.save'});
 assert.deepEqual(store.getSession().week,[{section:'week',text:'Nothing this week.'}]);
 learners.addDigest('week-c',{at:Date.now(),kind:'maths',topic:'frac-equivalent',right:6,notSure:0,total:6});
 store.dispatch({type:'session.end'});
 assert.equal(store.getSession().week[0].text,'Cy worked on one evening.');
 assert.equal(calls,0,'no model call anywhere in the page');
});

// ------------------------------------------------------------------ 8. the phone draws it, and rules/week stays pure
test('8: GUARD - the phone\'s Recap panel draws This week from the session\'s lines under tonight\'s recap; rules/week imports no session module at run time and no engine',()=>{
 const phone=fs.readFileSync(src('app/phone/page.tsx'),'utf8');
 assert.match(phone,/<WeekPage lines=\{s\.learner \? s\.week : null\} \/>/,'the seated learner\'s lines, none with no one seated');
 assert.match(phone,/<b>This week<\/b>/);assert.match(phone,/data-role="phone-week"/);
 assert.ok(phone.indexOf('data-role="phone-recap"')<phone.indexOf('<WeekPage'),'under tonight\'s recap');
 assert.match(phone,/WEEK_EMPTY/,'the empty week is the rule\'s own two words');
 assert.doesNotMatch(phone,/\.digest\b/,'the phone never reads a digest');
 const out=transpile(fs.readFileSync(src('lib/rules/week.ts'),'utf8'),{compilerOptions:{module:options.compilerOptions.module,target:options.compilerOptions.target}}).outputText;
 assert.doesNotMatch(out,/require\([^)]*(session\/(store|learners)|engines\/|desk\/)/,'pure: no store, learners file, engine or pipeline at run time');
 assert.doesNotMatch(fs.readFileSync(src('lib/rules/week.ts'),'utf8'),/—/,'no em dash in the page\'s copy');
});
