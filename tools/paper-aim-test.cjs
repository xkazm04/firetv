/**
 * Practice from a paper aims at what was lost (BACKLOG MB-B40). Select on a recovery row (MB-B9, RP1) carries the unit
 * into the session as the paper's aim (Session.paperAim); a set asked for on that unit from Get ready for school is then
 * written with the paper's lost statements as its aim: on a model-written equations unit the statements, the learner's
 * age and school system go into the prompt as data; on a code-written unit (cycle 14) a statement that picks some of a
 * tier's forms (rules/school paperSteer) steers half the draw to them. The set carries the codes it was written for
 * (Practice.aim) so the taped card can say what it aims at, and only those. A set opened any other way is asked for
 * exactly as before, byte for byte on the code-written units.
 * Run with npm test in desk/ (directly: node tools/paper-aim-test.cjs). No model is called - the text engine is a stub
 * that records the request - and the data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
const data=path.join(os.tmpdir(),`desk-paper-aim-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;

const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const K=require(src('tv/keys.ts'));
const {prepareStops}=require(src('tv/prepareRows.ts'));
const {paperView}=require(src('tv/paperRows.ts'));
const {STATEMENTS}=require(src('lib/library/gcse.ts'));
const SR=require(src('lib/rules/school.ts'));
const {makeSchoolItems}=require(src('lib/desk/items.ts'));
const crypto=require('node:crypto');
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});

/** The text engine answers six one-step equations, each with its true answer; every request is kept. */
let seen=[];
const QS=[['x + 3 = 7','4'],['x - 2 = 5','7'],['3x = 12','4'],['x/2 = 6','12'],['x + 9 = 4','-5'],['5x = -15','-3'],['x - 8 = 1','9'],['2x = 9','9/2'],['x + 1 = 0','-1']];
const stubText=()=>{seen=[];reg.useProvider('text',{name:'stub',run:async(req)=>{seen.push(req);return {raw:JSON.stringify({items:QS.map(([question,answer])=>({question,answer}))})};}});};
const post=(body)=>route('practice').POST(new Request('http://desk/api/practice',{method:'POST',body:JSON.stringify(body)}));
const S=()=>store.getSession();
let seats=0,LEARNER='';
/** A fresh 14-year-old at school in the UK system, seated, with a paper that lost marks on A17 (equations) and N2 (fractions). */
function seat(extra={}){
 LEARNER=`paper-aim-${++seats}`;
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:LEARNER,name:'Owen',type:'elementary',age:14,system:'uk',modules:['maths'],...extra}});store.dispatch({type:'profile.save'});
 store.dispatch({type:'paper.enter',rows:[{q:'1',marks:0,outOf:4,codes:['A17']},{q:'2',marks:1,outOf:3,codes:['N2']}]});
}
const can=(code)=>STATEMENTS.find((x)=>x.code===code).can;
/** The keys the TV would press: the session as it is, the TV's local state as given. */
const press=(k,local=K.LOCAL)=>{const r=K.tvKey(S(),k,local);for(const e of r.events)store.dispatch(e);return {...r,local:{...local,...r.local}};};
/** Walk the recovery list to `topicId` and press Select: the TV is then on Get ready for school with the question open. */
function fromPaper(topicId){
 const ix=paperView(S()).topics.findIndex((t)=>t.id===topicId);assert.ok(ix>=0,`${topicId} is on the recovery list`);
 store.dispatch({type:'focus',focus:ix});
 return press('select');
}

/**
 * The equations prompt for this learner as it was before MB-B40, byte for byte: a set asked for any other way is
 * asked for exactly as before (captured from the base commit 743d1074).
 */
const BEFORE="Topic: One-step equations\nOne operation stands between x and its value, so you undo that one operation on both sides.\n\nThe desk has recorded no mistakes for this student on this topic. Spread the questions evenly across the usual ways this topic goes wrong.\n\nWrite 9 practice questions on this topic.\nRules:\n- Every question must be solvable by hand in under a minute.\n- Vary the shape: different arrangements of the terms, some with negatives, some with the x-term on the right.\n- Every answer must be an integer or a simple fraction with a small denominator. No decimals, no surds.\n- Order them so they get harder across the set: the first is the gentlest, the last is the hardest.\n- State the answer you get for each; it will be checked.";

test('aim 1: Select on a recovery row carries the unit as the paper\'s aim; Back and Menu do not',()=>{
 seat();
 const r=fromPaper('linear-one-step');
 const ix=prepareStops(S()).findIndex((u)=>u.id==='linear-one-step');
 assert.deepEqual(r.events,[{type:'nav',screen:'prepare',focus:ix,aim:'linear-one-step'}]);
 assert.equal(S().screen,'prepare');assert.equal(S().paperAim,'linear-one-step');
 for(const k of ['back','menu']){
  seat();store.dispatch({type:'focus',focus:0});
  const b=press(k);
  assert.ok(b.events.every((e)=>e.aim===undefined),`${k} carries no aim`);assert.equal(S().paperAim??null,null);
 }
});

test('aim 2: the aim lasts while Get ready for school and its worked lesson are open, and nowhere else',()=>{
 seat();fromPaper('linear-one-step');
 // focus moves and the lesson round trip keep it
 store.dispatch({type:'focus',focus:0});assert.equal(S().paperAim,'linear-one-step');
 store.dispatch({type:'nav',screen:'worked',focus:0});assert.equal(S().paperAim,'linear-one-step');
 store.dispatch({type:'nav',screen:'prepare',focus:3});assert.equal(S().paperAim,'linear-one-step');
 // leaving for Tonight clears it, and coming back through the door does not bring it back
 store.dispatch({type:'nav',screen:'tonight',focus:0});assert.equal(S().paperAim,null);
 store.dispatch({type:'nav',screen:'prepare',focus:0});assert.equal(S().paperAim,null);
 // a new paper, a learner switch and the set itself clear it
 fromPaper('linear-one-step');store.dispatch({type:'paper.enter',rows:[{q:'1',marks:0,outOf:2,codes:['A17']}]});assert.equal(S().paperAim,null);
 fromPaper('linear-one-step');
 store.dispatch({type:'profile.draft',patch:{id:`${LEARNER}-b`,name:'Nela',type:'elementary',age:12,system:'cz',modules:['maths']}});store.dispatch({type:'profile.save'});
 assert.equal(S().paperAim,null,'a learner switch clears it');
 // the first event of a new evening clears it, as it clears the evening log (store dayed)
 const st={...S(),screen:'prepare',paperAim:'linear-one-step',log:{...S().log,problems:['p'],day:'2000-01-01'}};
 assert.equal(store.reduce(st,{type:'focus',focus:0}).paperAim,null,'a new evening clears it');
 assert.equal(store.reduce({...st,log:{...st.log,day:undefined,started:null,problems:[]}},{type:'focus',focus:0}).paperAim,'linear-one-step','the same evening keeps it');
});

test('aim 3: the aimed equations set - the lost statement, the age and the school system reach the prompt as data; the set carries the aim',async()=>{
 seat();fromPaper('linear-one-step');stubText();
 const res=await post({topic:'linear-one-step'});assert.equal(res.status,200,await res.clone().text());
 assert.ok(seen.length>=1);
 const p=seen[0].prompt;
 assert.ok(p.includes(can('A17')),'the lost statement, in the spec\'s own words');
 assert.ok(!p.includes(can('N2')),'a statement that lost marks on another unit is not this set\'s aim');
 assert.match(p,/\b14\b/,'the age');
 const y=require(src('lib/rules/stretch.ts')).learnerYear({age:14,system:'uk'});
 assert.ok(p.includes(`Year ${y} of school in England`),'the school year by the desk\'s own rule, in the learner\'s own system');
 // the paper's question labels, marks and codes never reach the prompt: the aim is a statement, never the question
 assert.ok(!/\bA17\b|\bN2\b|\d+\s*marks?\b|\bout of\b/i.test(p),'no code and no mark count');
 // the old prompt is still there underneath, unchanged
 for(const line of BEFORE.split('\n').filter(Boolean))assert.ok(p.includes(line),`kept: ${line}`);
 const pr=S().practice;assert.ok(pr);assert.deepEqual(pr.aim,['A17']);assert.equal(S().paperAim,null,'the set consumed the aim');
});

/** The same set asked for now with no aim (cycle 13): the learner section - age, school year, system - after the topic, the rest byte for byte. */
const UNAIMED_AT=BEFORE.indexOf('The desk has recorded');
const UNAIMED=()=>BEFORE.slice(0,UNAIMED_AT)+`The student is 14, in Year ${require(src('lib/rules/stretch.ts')).learnerYear({age:14,system:'uk'})} of school in England. Pitch the questions there.\n\n`+BEFORE.slice(UNAIMED_AT);

test('aim 4: a set asked for any other way carries no aim section - the prompt before MB-B40 plus the learner section every set now carries',async()=>{
 // Topics, the door's Get ready for school, and Get ready for school on another unit than the aimed one
 seat();stubText();
 store.dispatch({type:'nav',screen:'topics',focus:0});
 const res=await post({topic:'linear-one-step'});assert.equal(res.status,200);
 const p=seen[0].prompt;
 assert.equal(p,UNAIMED(),'the base prompt with the learner section after the topic, and nothing else');
 assert.equal(S().practice.aim,undefined);
 seat();fromPaper('frac-add-sub');stubText();
 const ix=prepareStops(S()).findIndex((u)=>u.id==='linear-one-step');store.dispatch({type:'focus',focus:ix});
 const r2=await post({topic:'linear-one-step'});assert.equal(r2.status,200);
 assert.equal(seen[0].prompt,UNAIMED(),'the aim belongs to its own unit only');
 assert.equal(S().practice.aim,undefined);
});

test('aim 5: a code-written unit from the paper - no engine call; a statement that steers nothing leaves the set unaimed, one that steers is carried',async()=>{
 // N2 is all of adding and subtracting fractions: no form to pick, so the usual draw and no aim on the card (cycle 14)
 seat();fromPaper('frac-add-sub');stubText();
 const res=await post({topic:'frac-add-sub'});assert.equal(res.status,200);
 assert.equal(seen.length,0,'no model call');
 assert.equal(S().practice.aim,undefined,'the card claims no aim the set did not take');assert.equal(S().practice.items.length,6);
 // R4 (ratio notation, simplest form) on ratio-share steers the draw to simplifying, and the set says so
 seat();store.dispatch({type:'paper.enter',rows:[{q:'3',marks:0,outOf:3,codes:['R4']},{q:'4',marks:0,outOf:2,codes:['R5']}]});
 fromPaper('ratio-share');stubText();
 const r2=await post({topic:'ratio-share'});assert.equal(r2.status,200,await r2.clone().text());
 assert.equal(seen.length,0,'no model call');
 const pr=S().practice;assert.deepEqual(pr.aim,['R4'],'only the statement that steered: R5 is all of tier 2 already');
 assert.equal(pr.items.length,6);
 assert.ok(pr.items.filter((it)=>SR.formOf('ratio-share',it.spec)==='simplify').length>=3,'half the set simplifies a ratio');
});

test('aim 7: the map from a paper\'s statements to a unit\'s forms - pinned to the generators and to the statements, decided in code',()=>{
 // every form list is what the unit's generator draws at that tier, no more and no fewer
 for(const [u,tiers] of Object.entries(SR.SCHOOL_UNIT_FORMS))for(const t of [1,2]){
  const got=new Set();for(let k=0;k<600;k++){const f=SR.formOf(u,SR.generatorFor(u)(k,t));assert.ok(f,`${u} tier ${t} seed ${k} has a form`);got.add(f);}
  assert.deepEqual([...got].sort(),[...tiers[t]].sort(),`${u} tier ${t}`);
 }
 // every mapped statement is a real one that touches its unit, and names forms of that unit
 for(const [u,by] of Object.entries(SR.STATEMENT_FORMS))for(const [c,forms] of Object.entries(by)){
  const st=STATEMENTS.find((x)=>x.code===c);assert.ok(st&&st.touches.includes(u),`${c} touches ${u}`);
  const all=new Set([...SR.SCHOOL_UNIT_FORMS[u][1],...SR.SCHOOL_UNIT_FORMS[u][2]]);for(const f of forms)assert.ok(all.has(f),`${c}: ${f}`);
 }
 const steer=(u,c,t=[1,2])=>SR.paperSteer(u,c,t);
 assert.deepEqual(steer('dec-convert',['N10']),{forms:{1:['fraction-decimal','decimal-fraction'],2:['fraction-decimal','decimal-fraction']},codes:['N10']});
 assert.deepEqual(steer('area',['G17']),{forms:{2:['composite']},codes:['G17']},'composites are tier 2 only');
 assert.equal(steer('dec-convert',['N10','R9']),null,'the two together are every conversion: nothing to pick');
 assert.equal(steer('ratio-share',['R5']),null,'not mapped: sharing is the whole of tier 2');
 assert.deepEqual(steer('ratio-share',['R5','R4']),{forms:{1:['simplify']},codes:['R4']});
 assert.equal(steer('area',['G17'],[1]),null,'a tier the set does not draw steers nothing');
 for(const [u,c] of [['frac-add-sub',['N2']],['pct-change',['R9']],['probability',['P4']],['mean-range',['S4']],['area',['nope',7,null]],['constructor',['N10']],['dec-convert',undefined]])assert.equal(steer(u,c),null,`${u} ${c}`);
});

/**
 * Captured from c4f39c53, before cycle 14: the draws of every code-written unit at every rung - with no aim in three
 * systems on seven seeds, and aimed at the newest two of the unit's slips in two systems on two seeds (an aimed draw scans
 * far more seeds, so its grid is smaller). A set opened without a paper is byte-identical. Recaptured at eea3fa97 without
 * probability's step-up sets, which gained a top rung after cycle 14 (MB-B20) and moved by design; every other row is as
 * c4f39c53 drew it.
 */
const PLAIN_FP='c196d8bbe89e39eeeed3cf0bf1eba554b47e45a7ced01ea85e571b95668aa5fe',SLIPS_FP='ec6b23846ee1c72265197a4b917bd185e271f96497fab8162a22de37493f6fc5';
function fingerprint(slipsOn,paper){
 const h=crypto.createHash('sha256');
 const systems=slipsOn?[undefined,'cz']:[undefined,'cz','uk'],seeds=slipsOn?[0,42]:[0,1,7,42,999,123456,4294967295-3];
 for(const u of Object.keys(SR.SCHOOL_GENERATORS))for(const mix of ['easier','standard','harder'])for(const sys of systems)for(const seed of seeds){
  if(u==='probability'&&mix==='harder')continue;
  const aim=slipsOn?[...SR.SCHOOL_UNIT_SLIPS[u]].reverse().slice(0,2):[];
  const r=paper===undefined?makeSchoolItems(u,6,seed,mix,mix==='harder',aim,sys):makeSchoolItems(u,6,seed,mix,mix==='harder',aim,sys,paper(u));
  if(paper!==undefined)assert.equal(r.aim,undefined,`${u}: no aim when nothing steered`);
  h.update(JSON.stringify(r.items)+'\n');}
 return h.digest('hex');
}

test('aim 8: a set with no paper aim - or one that steers nothing - is drawn byte for byte as before cycle 14',()=>{
 assert.equal(fingerprint(false),PLAIN_FP,'the usual draw');
 assert.equal(fingerprint(true),SLIPS_FP,'the slip-aimed draw');
 // a paper that steers nothing: no statement, a whole-unit statement, every form of the unit, an unknown code
 const idle=(u)=>u==='dec-convert'?['N10','R9']:u==='ratio-share'?['R5','N11']:u==='area'?['nope']:['N2','R9','S4','G20','P4'];
 assert.equal(fingerprint(false,()=>[]),PLAIN_FP);assert.equal(fingerprint(false,idle),PLAIN_FP);
 assert.equal(fingerprint(true,idle),SLIPS_FP,'the slips still aim a set the paper does not steer');
});

test('aim 9: a steered set - half from the forms the paper lost, the tier mix and six distinct questions kept, seeded, before the slips',()=>{
 const cases=[['dec-convert',['N10']],['dec-convert',['R9']],['ratio-share',['R4']],['area',['G16']],['area',['G17']],['area',['G16','G17']]];
 for(const [u,codes] of cases)for(const mix of ['easier','standard','harder'])for(const seed of [0,3,42,77777]){
  const r=makeSchoolItems(u,6,seed,mix,false,[],'uk',codes),plain=makeSchoolItems(u,6,seed,mix,false,[],'uk');
  assert.deepEqual(r,{...makeSchoolItems(u,6,seed,mix,false,[],'uk',codes),ms:r.ms},'seeded: the same draw twice');
  assert.equal(r.items.length,6);assert.equal(new Set(r.items.map((i)=>i.question)).size,6,'six distinct');
  assert.deepEqual(r.items.map((i)=>i.tier).sort(),plain.items.map((i)=>i.tier).sort(),'the rung\'s tier mix');
  const steer=SR.paperSteer(u,codes,[...new Set(plain.items.map((i)=>i.tier))]);
  const hits=r.items.filter((i)=>steer.forms[i.tier]?.includes(SR.formOf(u,i.spec))).length;
  // half the set, or every slot of the steered tiers when they hold fewer (a harder ratio set has two tier-1 items)
  const room=plain.items.filter((i)=>steer.forms[i.tier]).length;
  assert.ok(hits>=Math.min(3,room),`${u} ${codes} ${mix} ${seed}: ${hits} aimed of ${room}`);
  assert.deepEqual(r.aim,steer.codes,'the set names the statements it was drawn for');
 }
 // the paper comes before the learner's slips: with both, the draw is the paper's
 const both=makeSchoolItems('area',6,5,'standard',false,['area-no-half'],'uk',['G17']),paperOnly=makeSchoolItems('area',6,5,'standard',false,[],'uk',['G17']);
 assert.deepEqual(both.items,paperOnly.items);assert.deepEqual(both.aim,['G17']);
});

test('aim 6: the taped card says what the set aims at, in at most 25 words, with no number; a set with no aim draws as before',()=>{
 const R=require(src('tv/mathsRows.ts'));
 assert.equal(typeof R.aimLine,'function');
 const line=R.aimLine({topic:'linear-one-step',items:[],marked:false,aim:['A17']});
 assert.match(line,/^Aimed at what the paper lost: /);
 assert.ok(line.toLowerCase().includes(can('A17').toLowerCase()));
 assert.ok(line.split(/\s+/).length<=25,line);
 assert.equal(R.aimLine({topic:'linear-one-step',items:[],marked:false}),null);
 assert.equal(R.aimLine({topic:'linear-one-step',items:[],marked:false,aim:['nope']}),null,'an unknown code says nothing');
 // every statement the desk can aim at fits, alone and with any second one
 const onDesk=STATEMENTS.filter((x)=>x.touches.length).map((x)=>x.code);
 for(const a of onDesk)for(const b of onDesk){const l=R.aimLine({topic:'x',items:[],marked:false,aim:a===b?[a]:[a,b]});assert.ok(l.split(/\s+/).length<=25,`${a} ${b}: ${l}`);
  // no number of the desk's own: a digit only where the statement's own words carry one ("the 0-1 probability scale")
  let rest=l;for(const c of [a,b])rest=rest.split(can(c).charAt(0).toLowerCase()+can(c).slice(1)).join('');
  assert.ok(!/\d/.test(rest),`no number: ${l}`);}
 // drawn on the Practice card, inside the caption slot
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server')),{createElement}=require(path.join(root,'node_modules/react'));
 const M=require(src('maths/MathsTV.tsx'));
 const base={subject:'maths',screen:'practice',focus:0,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,learner:{id:'o',name:'Owen'},profiles:[],draft:null,timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,english:null,essay:null,topic:'linear-one-step',walkIx:0,skills:{},history:[],jobs:{},status:'',log:{started:null,minutes:0,problems:[],hard:[],hints:0}};
 const items=[1,2,3,4,5,6].map((n)=>({n,question:`x + ${n} = ${n+3}`}));
 const aimed=renderToStaticMarkup(createElement(M.PracticeScreen,{s:{...base,practice:{topic:'linear-one-step',items,marked:false,aim:['A17']}}}));
 const plain=renderToStaticMarkup(createElement(M.PracticeScreen,{s:{...base,practice:{topic:'linear-one-step',items,marked:false}}}));
 const card=(h)=>h.slice(h.indexOf('data-role="maths-hint"'),h.indexOf('</aside>'));
 assert.ok(card(aimed).includes('data-role="maths-practice-aim"'),'the aim sits in the taped card');
 assert.ok(!plain.includes('maths-practice-aim'),'no aim, no line');
 assert.equal(aimed.replace(/<div class="aim"[^>]*>.*?<\/div>/,''),plain,'otherwise the screen is unchanged');
 const css=fs.readFileSync(src('design/maths-lamplight.css'),'utf8');
 const rule=/\.mb-card \.aim\s*\{([^}]*)\}/.exec(css);assert.ok(rule,'the line has its rule');
 const px=/font-size:\s*(\d+)px/.exec(rule[1]);assert.ok(px&&Number(px[1])>=28,'and nothing under 28 px');
});
