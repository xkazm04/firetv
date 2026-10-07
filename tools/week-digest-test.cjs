/**
 * THE WEEK, RECORDED (Family W9): a per-learner digest on the learner file (lib/session/learners.ts `digest`, rules/digest),
 * a separate, capped, append-only list the Sunday page reads - because the history keeps 20 lines (its cap and pin are
 * unchanged) and Linga writes no history line at all. One entry per marked set (typed and photographed alike, through
 * desk/mark.ts land), restated in place when an explanation settles an item (session/store restateMarked); one per
 * finished Linga conversation; one per Essay Master reading. Counts and ids from closed lists only: never a percent,
 * a question, an answer, a transcript or a quote. Old learner files load unchanged with no digest.
 * Run with npm test in desk/ (directly: node tools/week-digest-test.cjs). No live model is called: the text engine is
 * replaced and THROWS wherever a path must not reach it (typed marking, a Linga finish), and the vision engine is a stub
 * that reads a fixed page or throws. The data directory is disposable, under the OS temp dir; never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`desk-week-digest-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
assert.ok(!path.resolve(data).startsWith(path.resolve(root,'data')),'never desk/data');

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
const engine=require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
/** The text engine as the desk calls it: a fixture per test, or a throw where no model may be reached. */
let calls=[],answer=async()=>{throw new Error('the text engine was called');};
engine.text=(req)=>{calls.push(req);return answer(req);};
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const D=require(src('lib/rules/digest.ts'));
const S=require(src('lib/rules/school.ts'));
const {PATHS}=require(src('lib/library/paths.ts'));
const {analyseEssay}=require(src('lib/desk/essay.ts'));
const {englishCommand}=require(src('lib/english/conversation.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>{reg.resetProviders();answer=async()=>{throw new Error('the text engine was called');};});
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

let seenVision=[];
const visionThrows=()=>{seenVision=[];reg.useProvider('vision',{name:'stub',run:async(req)=>{seenVision.push(req);throw new Error('the vision engine was called');}});};
const visionReads=(items)=>{seenVision=[];reg.useProvider('vision',{name:'stub',run:async(req)=>{seenVision.push(req);return {raw:JSON.stringify({items})};}});};
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const PHOTO={image:'data:image/jpeg;base64,AAAA',w:100,h:100};
const FILE=path.join(data,'learners.json');

let LEARNER='week-digest-scratch',seats=0;
function seat(patch={}){
 LEARNER=`week-digest-scratch-${++seats}`;
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Mia',type:'elementary',age:12,system:'uk',modules:['maths','english','essay'],...patch}});store.dispatch({type:'profile.save'});
}
const UNIT='frac-add-sub';
const cs=(expr)=>({shape:'compute',expr});
const A=cs('3/4 + 1/6'),B=cs('5/6 - 1/4'),C=cs('1/2 + 1/4');
const q=(spec)=>S.question(spec).plain;
/** Six fractions items; `stretch` marks the set and each item as asked for "a step up" (Family W8). */
function setOn(specs,stretch=false){
 store.dispatch({type:'practice.set',practice:{topic:UNIT,marked:false,...(stretch?{stretch:true}:{}),items:specs.map((spec,i)=>({n:i+1,question:q(spec),spec,tier:i<3?1:2,...(stretch?{stretch:true}:{})}))}});
}
const SIX=[A,A,A,A,C,A];
/** 11/12 right; 4/10 twice wrong, tops-and-bottoms; 5/6 wrong, top-not-scaled; 0,75 unsure (uk); blank unsure. */
const TYPED=['11/12','4/10','5/6','4/10','0,75',''];
const digest=()=>learners.getLearner(LEARNER).digest;

// ------------------------------------------------------------------ 1. typed: one entry per marked set, no model
test('1: a typed set writes ONE digest entry - counts, the unit, the most frequent code-detected slip - and reaches no model',async()=>{
 seat();setOn(SIX);visionThrows();calls=[];
 const t0=Date.now(),before=learners.getLearner(LEARNER).history.length;
 const r=await post('mark',{answers:TYPED});assert.equal(r.status,200);
 assert.equal(calls.length,0,'no text call');assert.equal(seenVision.length,0,'no vision call');
 const d=digest();assert.equal(d.length,1,'one entry for one set');
 const e=d[0];
 assert.ok(e.at>=t0&&e.at<=Date.now(),'dated');
 assert.deepEqual({...e,at:0},{at:0,kind:'maths',topic:UNIT,right:1,notSure:2,total:6,slip:'tops-and-bottoms',slipN:2});
 assert.equal(e.stretch,undefined,'a usual set carries no step-up flag');
 const h=learners.getLearner(LEARNER).history;assert.equal(h.length,before+1,'the history line is written as before');
 assert.equal(h.at(-1).detail,'1 of 6 right, 2 not sure','the history line keeps its shape');
 // the session is never sent the digest
 assert.equal(store.getSession().digest,undefined,'the session carries no digest');
 assert.ok(!JSON.stringify(store.getSession()).includes('"slipN"'),'nothing of the digest is hydrated into the session');
});

// ------------------------------------------------------------------ 2. photographed: the same land, the same entry
test('2: a photographed set (vision stubbed) writes one entry the same way; the model\'s verdict and slip are never read',async()=>{
 seat();setOn(SIX);calls=[];
 visionReads(TYPED.map((a,i)=>({n:i+1,studentAnswer:a,studentWorking:'',verdict:'right',solution:'11/12',slip:'wrong-direction'})));
 const r=await post('mark',PHOTO);assert.equal(r.status,200);
 assert.equal(seenVision.length,1,'one vision call per sheet, as before');assert.equal(calls.length,0);
 const d=digest();assert.equal(d.length,1);
 assert.deepEqual({...d[0],at:0},{at:0,kind:'maths',topic:UNIT,right:1,notSure:2,total:6,slip:'tops-and-bottoms',slipN:2},'code decides, not the stub');
 // a second set on the same learner appends
 setOn(SIX);visionThrows();await post('mark',{answers:['11/12','11/12','11/12','11/12','3/4','11/12']});
 assert.equal(digest().length,2,'one entry per marked set');assert.deepEqual({...digest()[1],at:0},{at:0,kind:'maths',topic:UNIT,right:6,notSure:0,total:6});
});

// ------------------------------------------------------------------ 3. the step-up flag
test('3: a set asked for as a step up carries stretch: true; a usual one never does',async()=>{
 seat();visionThrows();
 setOn(SIX,true);await post('mark',{answers:TYPED});
 setOn(SIX);await post('mark',{answers:TYPED});
 const [up,usual]=digest();
 assert.equal(up.stretch,true);assert.equal(usual.stretch,undefined);
 assert.equal(calls.length,0);
});

// ------------------------------------------------------------------ 4. an explanation's settle restates the entry in place
test('4: an explanation that settles an unsure item restates the set\'s entry in place: same date, same flag, new counts, no new entry',async()=>{
 seat();visionThrows();setOn(SIX,true);await post('mark',{answers:TYPED});
 const [was]=digest();
 // item 5 (0,75 under uk) was unsure; the learner explains and it settles right
 store.dispatch({type:'practice.settle',n:5,reply:'You got it.',verdict:'right',said:'Number 5 is right.'});
 let d=digest();assert.equal(d.length,1,'a recount, not a new entry');
 assert.deepEqual(d[0],{...was,right:2,notSure:1},'right up by one, not sure down by one; date, step-up flag and slip kept');
 // item 6 (blank) settles wrong with a code slip: the slip count follows the items
 store.dispatch({type:'practice.settle',n:6,reply:'Look again.',verdict:'wrong',slip:'tops-and-bottoms',said:'x'});
 d=digest();assert.deepEqual({...d[0],at:0},{at:0,kind:'maths',topic:UNIT,right:2,notSure:0,total:6,stretch:true,slip:'tops-and-bottoms',slipN:3});
 // a settle with no verdict (a reply only) changes nothing
 const same=JSON.stringify(digest());store.dispatch({type:'practice.settle',n:2,reply:'ok'});assert.equal(JSON.stringify(digest()),same);
 assert.equal(learners.getLearner(LEARNER).history.at(-1).detail,'2 of 6 right','the history line is restated as before');
});

// ------------------------------------------------------------------ 5. the slip pick, pure
test('5: mathsEntry picks the most frequent code-detected slip, ties by the unit\'s list order; off-list, right-item and non-school slips never count',()=>{
 const W=(slip)=>({verdict:'wrong',slip}),R={verdict:'right'},U={verdict:'unsure'};
 const e=(items,topic=UNIT)=>{const x=D.mathsEntry(topic,items,false,1);return x.slip?[x.slip,x.slipN]:null;};
 assert.deepEqual(e([W('top-not-scaled'),W('tops-and-bottoms'),W('top-not-scaled')]),['top-not-scaled',2]);
 assert.deepEqual(e([W('wrong-direction'),W('top-not-scaled')]),['top-not-scaled',1],'a tie: the earlier on the unit\'s list (SCHOOL_UNIT_SLIPS)');
 assert.deepEqual(e([W('wrong-direction'),W('tops-and-bottoms')]),['tops-and-bottoms',1]);
 assert.equal(e([{verdict:'right',slip:'tops-and-bottoms'},U,R]),null,'a slip on a right item is not a slip');
 assert.equal(e([W('sign-lost-moving'),W('made-up'),W(''),W(undefined)]),null,'nothing off the unit\'s list');
 assert.equal(e([W('added-same')]),null,'another unit\'s slip is not this unit\'s');
 assert.equal(e([W('sign-lost-moving'),W('sign-lost-moving')],'linear-two-step'),null,'a linear topic has no code-detected school slip');
 for(const unit of Object.keys(S.SCHOOL_UNIT_SLIPS)){const list=S.SCHOOL_UNIT_SLIPS[unit];
  assert.deepEqual(e(list.map(W),unit),[list[0],1],`${unit}: all tied, the first on the list`);
  assert.deepEqual(e([...list.map(W),W(list.at(-1))],unit),[list.at(-1),2],`${unit}: the most frequent wins`);}
 assert.deepEqual(D.mathsEntry(UNIT,[R,U,{verdict:'wrong'},{}],true,7),{at:7,kind:'maths',topic:UNIT,right:1,notSure:2,total:4,stretch:true},'no verdict counts as not sure, as rightLine does');
});

// ------------------------------------------------------------------ 6. Linga and Essay
test('6: a finished Linga conversation writes one english entry (scene, skill, replies), once; the finish itself calls no model',async()=>{
 seat();
 answer=async()=>({json:{title:'A model-written title',goal:'Ask again.',opening:'Please open your books.'},provider:'test',ms:1});
 const cmd=(action,extra={})=>{const s=store.getSession();return englishCommand({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:`wd-${action}-${Math.random()}`,...extra});};
 await cmd('start',{sceneId:'teacher'});
 const last=store.getSession().conversation.turns.at(-1).id;
 answer=async()=>({json:{reply:'Of course. Page ten.',observations:[{skill:'repair',quote:'Could you say that again, please?',success:true,confidence:'clear',note:'Asked to repeat.'}]},provider:'test',ms:1});
 await cmd('turn',{text:'Could you say that again, please?',mode:'text',lastTurnId:last});
 answer=async()=>{throw new Error('the text engine was called');};calls=[];
 await cmd('finish');
 assert.equal(calls.length,0,'finishing calls no model');
 await cmd('finish').catch(()=>{});
 const d=digest();assert.equal(d.length,1,'once per conversation');
 assert.deepEqual({...d[0],at:0},{at:0,kind:'english',sceneId:'teacher',skill:'repair',turns:1});
 const text=JSON.stringify(d);
 for(const words of ['Could you say that again','Page ten','A model-written title','Please open'])assert.ok(!text.includes(words),`no ${words}`);
});

test('7: an Essay Master reading writes one essay entry - the lens and the two counts, never a sentence',async()=>{
 seat();
 answer=async()=>({json:{observations:[{n:2,support:'opinion',note:'no evidence'},{n:3,support:'context',note:'ok'}],summary:'One to fix.'},provider:'test',ms:1});
 const para='Homework should be shorter. Everyone agrees. Studies of sleep show teenagers need nine hours.';
 await analyseEssay(para,'evidence',LEARNER);
 const d=digest();assert.equal(d.length,1);
 assert.deepEqual({...d[0],at:0},{at:0,kind:'essay',lens:'evidence',sentences:3,faulty:1});
 assert.ok(!JSON.stringify(d).includes('Homework')&&!JSON.stringify(d).includes('One to fix'),'no text of the paragraph or the reading');
});

test('6 (essay-master-A case 6): the digest counts codes verdicts - observations that decide 2 of 3 faulty beat legacy verdicts that say none',async()=>{
 seat();
 answer=async()=>({json:{observations:[{n:1,side:'wanders',verdict:'strong',note:'a'},{n:2,side:'wanders',verdict:'strong',note:'b'},{n:3,side:'pushes',verdict:'strong',note:'c'}],summary:'s'},provider:'test',ms:1});
 await analyseEssay('Homework is pointless. Teachers give too much. It ruins evenings.','argument',LEARNER);
 const d=digest();assert.equal(d.length,1);
 assert.deepEqual({...d[0],at:0},{at:0,kind:'essay',lens:'argument',sentences:3,faulty:2});
 assert.equal(learners.getLearner(LEARNER).history.at(-1).detail,'2 of 3 sentences to fix');
});

// ------------------------------------------------------------------ 8. the cap
test('8: the digest keeps the last 60 entries, the oldest dropped; the history keeps its own cap of 20, unchanged',()=>{
 seat();
 for(let i=1;i<=75;i++)learners.addDigest(LEARNER,{at:1000+i,kind:'essay',lens:'structure',sentences:3,faulty:i%3});
 for(let i=1;i<=30;i++)learners.addHistory(LEARNER,{at:1000+i,kind:'writing',label:'Structure',detail:'1 of 3 sentences to fix'});
 const l=learners.getLearner(LEARNER);
 assert.equal(D.DIGEST_CAP,60);
 assert.equal(l.digest.length,60);assert.equal(l.digest[0].at,1016,'the oldest fifteen dropped');assert.equal(l.digest.at(-1).at,1075);
 assert.equal(l.history.length,20,'the history cap is its own');
 // a read of a file holding more than the cap keeps the last 60
 const book=JSON.parse(fs.readFileSync(FILE,'utf8'));
 book[LEARNER].digest=Array.from({length:90},(_,i)=>({at:5000+i,kind:'essay',lens:'language',sentences:2,faulty:0}));
 fs.writeFileSync(FILE,JSON.stringify(book));
 const r=learners.getLearner(LEARNER).digest;assert.equal(r.length,60);assert.equal(r[0].at,5030);
});

// ------------------------------------------------------------------ 9. the whitelist
test('9: cleanDigest - junk dropped whole, unknown topics, scenes, lenses and slips dropped, counts clamped whole, extra fields stripped',()=>{
 const ok={at:1700000000000,kind:'maths',topic:UNIT,right:3,notSure:1,total:6,slip:'top-not-scaled',slipN:2};
 assert.deepEqual(D.cleanDigest([ok]),[ok]);
 assert.deepEqual(D.cleanDigest('nope'),[]);assert.deepEqual(D.cleanDigest(null),[]);assert.deepEqual(D.cleanDigest({0:ok}),[]);
 const junk=[null,1,'x',[],{},{kind:'maths'},{...ok,at:0},{...ok,at:-5},{...ok,at:'1700000000000'},{...ok,at:NaN},{...ok,kind:'sums'},
  {...ok,topic:'made-up'},{...ok,topic:'constructor'},{...ok,topic:'__proto__'},{...ok,total:0},{...ok,total:'6'},
  {at:1,kind:'english',sceneId:'nowhere',skill:'repair',turns:1},{at:1,kind:'english',sceneId:'teacher',skill:'flying',turns:1},
  {at:1,kind:'english',sceneId:'teacher',skill:'repair'},{at:1,kind:'english',sceneId:'plan-XYZ',skill:'repair',turns:1},
  {at:1,kind:'english',sceneId:'Please say it again',skill:'repair',turns:1},
  {at:1,kind:'essay',lens:'grammar',sentences:3,faulty:1},{at:1,kind:'essay',lens:'structure',sentences:0,faulty:0}];
 for(const j of junk)assert.deepEqual(D.cleanDigest([j]),[],`dropped: ${JSON.stringify(j)}`);
 // clamped and whitelisted
 assert.deepEqual(D.cleanDigest([{...ok,right:9,notSure:9,slip:'top-not-scaled',slipN:9}]),[{at:ok.at,kind:'maths',topic:UNIT,right:6,notSure:0,total:6}],'right never past total; no wrong item, no slip');
 assert.deepEqual(D.cleanDigest([{...ok,right:2.7,notSure:-1,slipN:99}]),[{...ok,right:2,notSure:0,slipN:4}],'whole, not negative, slipN at most the wrong items');
 assert.deepEqual(D.cleanDigest([{...ok,slip:'added-same'}]),[{...ok,slip:undefined,slipN:undefined}].map(({slip,slipN,...x})=>x),'a slip off the unit\'s list is dropped, the entry kept');
 assert.deepEqual(D.cleanDigest([{...ok,slip:'sign-lost-moving'}]).map((x)=>x.slip),[undefined]);
 assert.deepEqual(D.cleanDigest([{...ok,stretch:'yes'}]),[ok],'stretch only when true');
 assert.deepEqual(D.cleanDigest([{...ok,stretch:true}]),[{...ok,stretch:true}]);
 const extra={...ok,question:'Work out 3/4 + 1/6.',studentAnswer:'4/10',quote:'hello',percent:50};
 assert.deepEqual(Object.keys(D.cleanDigest([extra])[0]).sort(),Object.keys(ok).sort(),'fields not on the whitelist are stripped');
 assert.deepEqual(D.cleanDigest([{at:2,kind:'english',sceneId:'plan-0a1b2c3d',skill:'negotiate',turns:4.5,title:'x'}]),[{at:2,kind:'english',sceneId:'plan-0a1b2c3d',skill:'negotiate',turns:4}],'a plan topic id is kept');
 assert.deepEqual(D.cleanDigest([{at:3,kind:'essay',lens:'argument',sentences:4,faulty:7,text:'x'}]),[{at:3,kind:'essay',lens:'argument',sentences:4,faulty:4}]);
 // every school and Calculus topic id is accepted; a topic must exist on a path
 for(const t of [...PATHS.school.topics,...PATHS.calc1.topics])assert.equal(D.cleanDigest([{...ok,topic:t.id,slip:undefined}]).length,1,t.id);
 // addDigest writes nothing it cannot trust
 seat();learners.addDigest(LEARNER,{...ok,topic:'made-up'});learners.addDigest(LEARNER,null);assert.deepEqual(digest(),[]);
});

// ------------------------------------------------------------------ 10. round trip and an old file
test('10: a round trip keeps the digest exactly; a learners.json written before W9 loads unchanged with an empty digest; the file stays valid JSON',()=>{
 seat();
 const entries=[{at:1700000000001,kind:'maths',topic:'area',right:4,notSure:0,total:6,stretch:true,slip:'area-no-half',slipN:2},
  {at:1700000000002,kind:'english',sceneId:'lost',skill:'request',turns:5},{at:1700000000003,kind:'essay',lens:'language',sentences:4,faulty:1}];
 for(const e of entries)learners.addDigest(LEARNER,e);
 assert.deepEqual(learners.getLearner(LEARNER).digest,entries);
 const raw=fs.readFileSync(FILE,'utf8');JSON.parse(raw);
 learners.saveLearner(learners.getLearner(LEARNER));assert.deepEqual(learners.getLearner(LEARNER).digest,entries,'saved again, read again');
 // an old learner, written by hand as a pre-W9 desk wrote it
 const book=JSON.parse(fs.readFileSync(FILE,'utf8'));
 const old={id:'old-learner',english:{preferences:null,notes:[],evidence:[],achievements:{},sessions:[],placement:null,plan:null,taught:[]},
  skills:{'frac-add-sub':{topic:'frac-add-sub',seen:3,right:2,estimate:0.4,secure:false,lastSeen:5,slips:['tops-and-bottoms']}},writing:{},memory:['likes fractions'],
  history:[{at:9,kind:'practice',label:'Add and subtract fractions',detail:'2 of 3 right'}]};
 book['old-learner']=old;fs.writeFileSync(FILE,JSON.stringify(book));
 const l=learners.getLearner('old-learner');
 assert.deepEqual(l.digest,[],'no digest yet');
 // Linga W10 added record fields to english; an old file loads them empty, and every other field is as it was
 const {digest:_d,...rest}=l,W10=['placements','certificates','seenIds'];
 for(const k of W10)if(k in rest.english)assert.deepEqual(rest.english[k],[],`${k} loads empty on an old file`);
 const english=Object.fromEntries(Object.entries(rest.english).filter(([k])=>!W10.includes(k)));
 assert.deepEqual({...rest,english},old,'every other field as it was');
 // writing to the old learner keeps the file valid and the others intact
 learners.addDigest('old-learner',{at:1700000000004,kind:'essay',lens:'structure',sentences:2,faulty:0});
 const after=JSON.parse(fs.readFileSync(FILE,'utf8'));
 assert.equal(after['old-learner'].digest.length,1);assert.deepEqual(after['old-learner'].skills,old.skills);
 assert.deepEqual(learners.getLearner(LEARNER).digest,entries,'another learner untouched');
});

// ------------------------------------------------------------------ 11. privacy over a simulated week
test('11: privacy - a simulated week\'s serialised digest holds no percent, no problem text, no answer, no transcript; only whitelisted keys',async()=>{
 seat();visionThrows();
 const questions=[],answers=[];
 const sets=[[SIX,TYPED],[[A,B,C,A,B,C],['11/12','7/12','3/4','2/3','1/2','0.75']],[[C,C,C,C,C,C],['3/4','2/6','3/4','75%','1 1/2','3/4']]];
 for(const [specs,typed] of sets){setOn(specs);questions.push(...specs.map(q));answers.push(...typed.filter(Boolean));assert.equal((await post('mark',{answers:typed})).status,200);}
 answer=async()=>({json:{observations:[{n:1,issues:[{kind:'vague',word:'nice'}],note:'Too vague.'}],summary:'Make it sharper.'},provider:'test',ms:1});
 const para='My summer was nice. We went to the lake.';
 await analyseEssay(para,'language',LEARNER);
 const d=digest(),text=JSON.stringify(d);
 assert.equal(d.length,4);
 assert.doesNotMatch(text,/%/,'no percent sign');
 assert.doesNotMatch(text,/percent/i);
 for(const x of questions)assert.ok(!text.includes(x),`no question text: ${x}`);
 for(const a of answers.filter((a)=>/[\/,.%\s]/.test(a)))assert.ok(!text.includes(a),`no typed answer: ${a}`);
 for(const w of ['summer','lake','vague','sharper','Work out'])assert.ok(!text.includes(w),`no ${w}`);
 const KEYS={maths:['at','kind','topic','right','notSure','total','stretch','slip','slipN'],english:['at','kind','sceneId','skill','turns'],essay:['at','kind','lens','sentences','faulty']};
 for(const e of d){for(const k of Object.keys(e))assert.ok(KEYS[e.kind].includes(k),`${e.kind}.${k} is on the whitelist`);
  for(const [k,v] of Object.entries(e))if(typeof v==='number')assert.ok(Number.isInteger(v)&&v>=0,`${k} is a whole count or a date`);}
 // every string is an id from a closed list
 const ids=new Set([...PATHS.school.topics.map((t)=>t.id),...S.SCHOOL_SLIPS.map((s)=>s.id),'maths','english','essay','structure','argument','evidence','language']);
 for(const e of d)for(const v of Object.values(e))if(typeof v==='string')assert.ok(ids.has(v),`${v} is an id`);
});

// ------------------------------------------------------------------ 12. the history's pin, untouched
test('12: GUARD - the history cap is still 20 and the digest is a separate field; no screen code reads the digest',()=>{
 const L=fs.readFileSync(src('lib/session/learners.ts'),'utf8');
 assert.match(L,/const HISTORY_CAP = 20;/);
 assert.match(L,/digest: DigestEntry\[\];/);
 const store=fs.readFileSync(src('lib/session/store.ts'),'utf8');
 assert.doesNotMatch(store,/digest: l\.digest/,'the dispatch boundary does not hydrate the digest into the session');
 for(const dir of ['tv','maths','essay','english','landing','app/phone'])for(const f of fs.readdirSync(src(dir)).filter((x)=>/\.tsx?$/.test(x)))
  assert.doesNotMatch(fs.readFileSync(src(`${dir}/${f}`),'utf8'),/\.digest\b/,`${dir}/${f} reads no digest`);
});
