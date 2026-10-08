/**
 * The School maths ruler after Family W5b put "Add and subtract fractions" before the linear equations, and W7 batch 1
 * made the fractions strand four units (seven topics: the big Topics ruler pans, since seven slots of 239 px are under
 * its 288 px minimum), and W7 batch 2 put the Decimals and percent strand after one-step equations (eleven topics, past
 * STRIP_AFTER: Tonight draws the strand strip - four bars, Equations twice - with the needle and the SCHOOL tick on it),
 * and W7 batch 3 put Ratio and rates and Geometry and data after it (fifteen topics, six bars, every label whole):
 *   - the needle rule: on a school path the needle (and where "Teach me something" opens Topics) is the first topic not
 *     latched secure AFTER the last latched one, else the first topic - so a learner who secured one-step equations
 *     keeps their place on two-step equations instead of being sent back to the new first unit. One rule, in
 *     library/paths.ts (`afterLastSecure`, `frontierOn`), read by the ruler (tv/rulerRows `rulerFrontier`), Tonight's
 *     strip (`stripModel`) and Topics' first focus (tv/keys `topicsFocus`). The Calculus path is unchanged;
 *   - the gap line waits for a placement (owner decision D2): the SCHOOL tick is drawn for every school system, the gap
 *     line between the needle and the tick is not, because Phase 1 has no Math placement (tv/mathsRows `mathPlaced`).
 *     The gap line's code stays; `schoolMarks` draws it once a placement exists.
 * The TV is rendered to static markup (react-dom/server) as MathsTV draws it, so the tick, the gap line and the needle
 * are read off the real component. Run with npm test in desk/ (directly: node tools/school-ruler-test.cjs). No model,
 * no server; the store writes to a scratch DESK_DATA_DIR under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-school-ruler-'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
// next/font runs only under Next: here each face module answers with its class names (as tools/tv-recap-test.cjs does)
for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}],['landing/themes/blueprint/fonts.ts',{BLUEPRINT_FONTS:'bp-fonts'}]]){
 const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}

const src=(f)=>path.join(root,'src',f);
const P=require(src('lib/library/paths.ts'));
const RR=require(src('tv/rulerRows.ts'));
const R=require(src('tv/mathsRows.ts'));
const K=require(src('tv/keys.ts'));
const store=require(src('lib/session/store.ts'));
const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
const {createElement}=require(path.join(root,'node_modules/react'));

const SCHOOL=P.topicsOf('school'),CALC=P.topicsOf('calc1');
const ids=(ts)=>ts.map((t)=>t.id);
const [E,O,F,MD,ONE,DA,DC,PO,PC,RS,UR,AR,MR,TWO,BOTH]=ids(SCHOOL);
/** A latched-secure record (the TV reads only `secure`, `estimate`, `slips`). */
const rec=(topic,secure=true,estimate=secure?1:0.4)=>({topic,seen:6,right:5,estimate,secure,lastSeen:1,slips:[]});
const skillsOf=(list)=>Object.fromEntries(list.map((id)=>[id,rec(id)]));
/** The frontier as the ruler drew it before W5b: the first topic not secure, else the last. */
const oldRuler=(topics,secure)=>{const i=topics.findIndex((t)=>!secure.includes(t.id));return i<0?topics.length-1:i;};

function seated({age=12,system='uk',type='elementary',mathPath}={}){
 store.dispatch({type:'reset'});
 store.dispatch({type:'profile.draft',patch:{id:'ruler-scratch',name:'Mia',type,age,system,modules:['maths'],...(mathPath?{mathPath}:{})}});store.dispatch({type:'profile.save'});
 return store.getSession();
}

// ------------------------------------------------------------------ 1. the needle rule
test('1: the school frontier is the first topic not secure after the last secure one - the same on the ruler, the strip and Topics',()=>{
 // W7 batch 3: fifteen topics - four fractions units, one-step equations, the four decimals and percent units, ratio and
 // rates, geometry and data, then the other two linear topics (pinned here and in maths-rules-test, maths-paths-test)
 // v2 M2b: Pythagoras' theorem and probability after them, seventeen
 assert.deepEqual(ids(SCHOOL),['frac-equivalent','frac-of-amount','frac-add-sub','frac-mul-div','linear-one-step','dec-arith','dec-convert','pct-of-amount','pct-change','ratio-share','unit-rate','area','mean-range','linear-two-step','linear-both-sides','pythagoras','probability']);
 // [secure ids, frontierOn id (undefined: none left), the ruler's topic, Teach me something's focus]
 const CASES=[
  [[],E,0,0,'a fresh learner starts on equivalent fractions'],
  [[ONE],DA,5,5,'one-step equations secure: the needle moves on to the decimals after it (W7 batch 2), not back to fractions'],
  [[F],MD,3,3,'only add and subtract fractions secure: on to multiply and divide'],
  [[E],O,1,1],
  [[E,O,F,MD],ONE,4,4,'every fractions unit secure: on to one-step equations'],
  [[O,MD],ONE,4,4,'a gap before the last secure fractions unit does not pull the needle back'],
  [[ONE,DA,DC],PO,7,7,'the conversion secure: on to a percent of an amount'],
  [[PC],RS,9,9,'percent change secure alone: on to ratio and sharing (W7 batch 3), the gaps before it left behind'],
  [[RS,UR],AR,11,11,'the ratio strand secure: on to area'],
  [[MR],TWO,13,13,'mean and range secure alone: on to two-step equations'],
  [[ONE,TWO],BOTH,14,14,'a learner who had two-step equations before W7 batch 2 keeps their place after it'],
  [[E,O,F,MD,ONE,TWO],BOTH,14,14],
  [ids(SCHOOL),undefined,16,0,'everything secure: the needle at the end, Topics on the first stop (v2 M2b: the ruler\'s last topic is index 16, was 14)'],
  [[BOTH],'pythagoras',15,15,'v2 M2b: equations with brackets secure: on to Pythagoras (was: the last topic, nothing after it)'],
  [['probability'],undefined,16,0,'the last topic secure: nothing after it'],
  [['pythagoras'],'probability',16,16,'Pythagoras secure: on to probability'],
  [[F,TWO],BOTH,14,14,'a gap before the last secure topic does not pull the needle back'],
 ];
 for(const [secure,next,ruler,focus,why] of CASES){
  const label=why??JSON.stringify(secure);
  assert.equal(P.frontierOn('school',secure)?.id,next,`frontierOn: ${label}`);
  assert.equal(RR.rulerFrontier(SCHOOL,(id)=>secure.includes(id),true),ruler,`ruler: ${label}`);
  assert.equal(K.topicsFocus({profiles:[{id:'a',mathPath:undefined}],learner:{id:'a'},skills:skillsOf(secure)}),focus,`Topics focus: ${label}`);
  const strip=RR.stripModel(SCHOOL,Object.fromEntries(SCHOOL.map((t)=>[t.id,secure.includes(t.id)?'secure':'later'])),true);
  assert.equal(strip.needle.index,next===undefined?SCHOOL.length:SCHOOL.findIndex((t)=>t.id===next),`strip: ${label}`);
 }
 // what W5b would have done without the rule: one-step equations secure sent the needle back to fractions
 assert.equal(oldRuler(SCHOOL,[ONE]),0);
 assert.equal(P.afterLastSecure([],()=>true),0);assert.equal(P.afterLastSecure(['a','b','c'],(x)=>x==='b'),2);
});

test('2: the Calculus path is unchanged - the ruler\'s first-not-secure, and the strip and Topics\' prerequisite frontier',()=>{
 const calc=ids(CALC);
 for(let n=0;n<=calc.length;n++){
  const secure=calc.slice(0,n);
  assert.equal(RR.rulerFrontier(CALC,(id)=>secure.includes(id),false),oldRuler(CALC,secure),`ruler at ${n} secure`);
  assert.equal(P.frontierOn('calc1',secure)?.id,P.nextOn('calc1',secure)?.id,`frontierOn is nextOn at ${n}`);
  const st=Object.fromEntries(calc.map((id)=>[id,secure.includes(id)?'secure':'later']));
  assert.deepEqual(RR.stripModel(CALC,st,false),RR.stripModel(CALC,st),'the strip\'s default is the course rule');
 }
 // out of order: a Calculus topic secured ahead leaves every Calculus needle where it was (pinned in maths-ruler-test too)
 let seed=7;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
 for(let k=0;k<200;k++){
  const secure=calc.filter(()=>rnd()<0.4);
  assert.equal(RR.rulerFrontier(CALC,(id)=>secure.includes(id),false),oldRuler(CALC,secure));
  assert.equal(P.frontierOn('calc1',secure)?.id,P.nextOn('calc1',secure)?.id);
 }
 const odd=[calc[15]];
 assert.equal(K.topicsFocus({profiles:[{id:'c',mathPath:'calc1'}],learner:{id:'c'},skills:skillsOf(odd)}),0,'Newton secure alone: Topics still opens at the first topic whose prereqs are met');
});

// ------------------------------------------------------------------ 2. the gap line waits for a placement
test('3: schoolMarks - the tick with a school year, the gap line only with a placement; Phase 1 has no Math placement',()=>{
 assert.deepEqual(RR.schoolMarks(null,false),{tick:false,gap:false},'a course, or no age: nothing');
 assert.deepEqual(RR.schoolMarks(null,true),{tick:false,gap:false});
 for(const e of [-1,0,1,3,4])assert.deepEqual(RR.schoolMarks(e,false),{tick:true,gap:false},`exp ${e}: the tick, no gap line`);
 assert.deepEqual(RR.schoolMarks(3,true),{tick:true,gap:true},'the machinery is kept for a placement');
 assert.equal(R.mathPlaced(store.getSession()),false);assert.equal(R.mathPlaced(),false);
});

/** Tonight or Topics as MathsTV draws it for this session. */
function draw(s){const {MathsTV}=require(src('maths/MathsTV.tsx'));const q=console.error;console.error=()=>{};try{return renderToStaticMarkup(createElement(MathsTV,{s,busy:false}));}finally{console.error=q;}}
const leftOf=(html,cls)=>{const m=new RegExp(`class="${cls}"[^>]*style="left:\\s*([\\d.]+)px`).exec(html);return m?Number(m[1]):null;};

/** The strip's states as MathsTV hands them (only 'secure' is read). */
const stripStates=(secure)=>Object.fromEntries(SCHOOL.map((t)=>[t.id,secure.includes(t.id)?'secure':'later']));

test('4: on the TV, for a 12-year-old in each school system: the SCHOOL tick is drawn, the gap line is not, the needle at the frontier (Tonight the strand strip, Topics panning)',()=>{
 // Topics pans with fifteen topics and opens at the frontier (the decimals after one-step equations, stop 5, as Teach me
 // something does): the focused slot is FOCUS_SPAN wide, every other MIN_SPAN, from PAD; so slot 5 starts at 26 + 5 x 288 = 1466
 // the SCHOOL tick for a 12-year-old: us Grade 7, uk Year 8, cz 7. ročník are past 14 topics (all but the last); de Klasse 7 all 15
 const EXP={us:14,uk:14,cz:14,de:15};
 for(const system of ['us','uk','cz','de']){
  const exp=P.expectedOn('school',system,12);assert.equal(exp,EXP[system],`${system}: a 12-year-old is past ${EXP[system]} topics`);
  for(const screen of ['tonight','topics']){
   const focus=screen==='topics'?5:0;
   assert.equal(K.topicsFocus({profiles:[{id:'a'}],learner:{id:'a'},skills:skillsOf([ONE])}),5,'Topics opens on the decimals after one-step equations');
   const s={...seated({system}),screen,focus,skills:skillsOf([ONE])};
   const html=draw(s);
   assert.match(html,/data-role="maths-ruler"/,`${system} ${screen}: the ruler`);
   assert.doesNotMatch(html,/mb-gapline/,`${system} ${screen}: no gap line (D2: no placement in Phase 1)`);
   if(screen==='tonight'){
    // fifteen topics are past STRIP_AFTER: Tonight draws one bar per strand, the tick and the needle on it
    assert.match(html,/class="mb-ruler strip"/,`${system}: Tonight's ruler is the strand strip`);assert.equal((html.match(/class="mb-seg"/g)||[]).length,7,'seven bars (v2 M2b: a second Geometry and data bar; six before)');
    assert.doesNotMatch(html,/…/,`${system}: every strand label whole`);
    const strip=RR.stripModel(SCHOOL,stripStates([ONE]),true),flag=RR.stripFlag(strip,exp);
    assert.match(html,/class="mb-flag"[^>]*>.*?<div class="mc">School<\/div>/,`${system} tonight: the SCHOOL tick is drawn (D2)`);
    assert.equal(leftOf(html,'mb-flag'),flag.x,`${system} tonight: the tick after ${exp} topics`);
    assert.equal(/class="mb-flag" data-end="true"/.test(html),false,`${system}: the pill is turned inward only at the strip's end, and v2 M2b moved the end past a 12-year-old (de's pill was turned at fifteen of fifteen)`);
    assert.equal(leftOf(html,'mb-marker'),strip.needle.x,`${system} tonight: the needle at the decimals, not at fractions`);
    assert.equal(strip.needle.index,5);assert.doesNotMatch(html,/data-pan="true"/);
   }else{
    const m=RR.rulerModel(SCHOOL,{},5,true);
    assert.equal(m.pan,true,'the big ruler pans');assert.match(html,/data-pan="true"/);
    // the tick is drawn only while it is on the stage: at stop 5 a 12-year-old's tick (after 14 or 15 topics) is past the window
    const at=RR.flagX(m,exp),seen=RR.flagOnStage(m,at).seen;
    assert.equal(/class="mb-flag"/.test(html),seen,`${system} topics: the tick drawn only on the stage`);assert.equal(seen,false);
    assert.equal(leftOf(html,'mb-marker'),1466,`${system} topics: the needle at the start of the decimals, not at fractions`);
    for(const t of SCHOOL)assert.ok(html.includes(t.name.replace(/'/g,'&#x27;')),`${t.name} is on the ruler`);
   }
  }
 }
 // a fresh learner: the needle at the start of the ruler (equivalent fractions), the tick still drawn, no gap line
 const fresh=draw({...seated({system:'uk'}),screen:'topics',focus:0,skills:{}});
 assert.equal(leftOf(fresh,'mb-marker'),26);assert.doesNotMatch(fresh,/class="mb-flag"/,'the tick is past the window on the first stop (4a)');assert.doesNotMatch(fresh,/mb-gapline/);
 const freshTonight=draw({...seated({system:'uk'}),screen:'tonight',focus:0,skills:{}});
 assert.equal(leftOf(freshTonight,'mb-marker'),26);assert.match(freshTonight,/class="mb-flag"/,'Tonight draws the tick');assert.doesNotMatch(freshTonight,/mb-gapline/);
 // with add and subtract secure and multiply and divide in progress, the strip's needle stands at multiply and divide
 const inProgress=draw({...seated({system:'cz'}),screen:'tonight',focus:0,skills:{[F]:rec(F),[MD]:rec(MD,false,0.5)}});
 assert.equal(leftOf(inProgress,'mb-marker'),RR.stripAt(RR.stripModel(SCHOOL,stripStates([F]),true),3));
 // "other" has no school year: no tick, no gap line (as before)
 const other=draw({...seated({type:'other',age:30}),screen:'topics',focus:0,skills:{}});
 assert.doesNotMatch(other,/class="mb-flag"/);assert.doesNotMatch(other,/mb-gapline/);
 // a Calculus learner: no tick, no gap line, and the ruler pans (as before)
 const calc=draw({...seated({type:'other',age:19,mathPath:'calc1'}),screen:'topics',focus:0,skills:{}});
 assert.doesNotMatch(calc,/class="mb-flag"/);assert.doesNotMatch(calc,/mb-gapline/);assert.match(calc,/data-pan="true"/);
});

test('4a: flagOnStage - on a panning ruler the SCHOOL tick is drawn only while it is on the stage, its pill turned inward near an edge; a ruler that does not pan draws it always',()=>{
 const small=RR.rulerModel(SCHOOL,{},undefined,false);
 for(const x of [26,900,1702])assert.deepEqual(RR.flagOnStage(small,x),{seen:true,edge:null});
 const at0=RR.rulerModel(SCHOOL,{},0,true);assert.equal(at0.offset,0);
 assert.deepEqual(RR.flagOnStage(at0,RR.flagX(at0,14)),{seen:false,edge:null},'Topics on the first stop: a UK 12-year-old\'s tick (x 4410) is past the window, not drawn half');
 assert.deepEqual(RR.flagOnStage(at0,1700),{seen:true,edge:'r'});assert.deepEqual(RR.flagOnStage(at0,40),{seen:true,edge:'l'});assert.deepEqual(RR.flagOnStage(at0,864),{seen:true,edge:null});
 const html=draw({...seated({system:'uk'}),screen:'topics',focus:0,skills:{}});
 assert.doesNotMatch(html,/class="mb-flag"/,'no pill cut by the window');assert.match(html,/data-role="maths-more"/,'the chevron says there is more');
 const at14=draw({...seated({system:'uk'}),screen:'topics',focus:14,skills:{}});
 assert.match(at14,/class="mb-flag"[^>]*>.*?<div class="mc">School<\/div>/,'panned to the end, the tick is drawn');
 const m14=RR.rulerModel(SCHOOL,{},14,true);assert.equal(leftOf(at14,'mb-flag'),RR.flagX(m14,14),'before the last topic, both sides');
});

test('4b: the focused name is fitted whole on the big ruler whether it pans or not (fifteen school topics: the Topics ruler pans, the focused slot 640 px)',()=>{
 const tv=fs.readFileSync(src('maths/MathsTV.tsx'),'utf8');
 assert.match(tv,/useNameFit\(m\.pan \|\| !!big,/,'the fit runs on the big ruler, panning or not');
 assert.match(tv,/ref=\{big \? win : undefined\}/,'the non-panning big ruler carries the fit');
 assert.ok((1728-52)/SCHOOL.length<RR.MIN_SPAN,'fifteen slots would be under the minimum, so the big ruler pans');
 for(let f=0;f<SCHOOL.length;f++){const m=RR.rulerModel(SCHOOL,{},f,true);assert.equal(m.pan,true);assert.equal(m.topics[f].sw,RR.FOCUS_SPAN,`${SCHOOL[f].name}: the wide slot`);}
 assert.ok(SCHOOL.length>RR.STRIP_AFTER,'W7 batch 2: past eight topics Tonight draws the strand strip, not a box per topic');
});

test('5: the first evening\'s title is the path\'s own name, and a learner with one-step equations secure counts one of seventeen',()=>{
 assert.match(draw({...seated(),screen:'tonight',focus:0,skills:{}}),/School maths, from the first/);
 assert.match(draw({...seated(),screen:'tonight',focus:0,skills:skillsOf([ONE])}),/One of 17 topics/);
});

test('6: the strand strip at seventeen topics - seven bars (Equations twice, Geometry and data twice), every label whole in at most two lines, each inked by its share of secure topics, the needle at the frontier, the SCHOOL tick by stripFlag',()=>{
 const S0=RR.stripModel(SCHOOL,stripStates([]),true);
 assert.deepEqual(S0.segments.map((g)=>[g.name,g.count]),[['Fractions',4],['Equations',1],['Decimals and percent',4],['Ratio and rates',2],['Geometry and data',2],['Equations',2],['Geometry and data',2]]);
 // widths share the 1676 px by topic count, whole pixels, and tile the strip - except the one-topic Equations bar, which
 // takes the 189 px its label needs whole (W7 batch 3: at 112 px by its share it read "Equati…"), the rest sharing what is left.
 // v2 M2b: at seventeen topics the two-topic Equations bar and the Ratio and rates bar fall under their labels' need too (189 px,
 // 'Equations' whole), so three bars are held at 189 px and the other four share what is left; the Geometry and data bars take 185 px
 assert.equal(S0.segments.reduce((a,g)=>a+g.w,0),1728-52);
 const one=S0.segments[1];assert.equal(one.w,Math.ceil(RR.labelNeed('Equations',RR.STRIP_CH))+RR.STRIP_INSET,'the one-topic bar is as wide as its label');assert.equal(one.w,189);
 assert.deepEqual(S0.segments.map((g)=>g.w),[370,189,369,189,185,189,185],'measured: the labels\' floors hold, the rest share what is left');
 S0.segments.forEach((g,i)=>{assert.ok(g.w>=RR.MIN_SEG,`${g.name} at least ${RR.MIN_SEG} px`);assert.ok(g.w>=Math.ceil(RR.labelNeed(g.name,RR.STRIP_CH))+RR.STRIP_INSET,`${g.name}: room for its label`);if(i)assert.equal(g.x,S0.segments[i-1].x+S0.segments[i-1].w);});
 for(const g of S0.segments){
  assert.equal(g.label,g.name,`${g.name}: whole, never clamped`);assert.equal(g.lines.join(' '),g.name);assert.ok(g.lines.length<=RR.STRIP_LINES);
  for(const l of g.lines)assert.ok(l.length*RR.STRIP_CH<=g.labelW,`${g.name}: "${l}" fits ${g.labelW} px`);
 }
 assert.deepEqual(S0.segments.map((g)=>g.lines),[['Fractions'],['Equations'],['Decimals and','percent'],['Ratio and','rates'],['Geometry','and data'],['Equations'],['Geometry','and data']]);
 // inked by share: fractions all secure and one-step; the conversion alone of the four; nothing after
 const S1=RR.stripModel(SCHOOL,stripStates([E,O,F,MD,ONE,DC]),true);
 assert.deepEqual(S1.segments.map((g)=>g.share),[1,1,0.25,0,0,0,0]);
 assert.equal(S1.needle.index,7,'the frontier after the last secure (the conversion): a percent of an amount');
 assert.equal(S1.needle.x,S1.segments[2].x+S1.segments[2].w*2/4,'two of four into the decimals and percent bar');
 const S2=RR.stripModel(SCHOOL,stripStates(ids(SCHOOL)),true);assert.deepEqual([S2.needle.index,S2.needle.at,S2.needle.x],[17,'end',26+1676]);
 const S4=RR.stripModel(SCHOOL,stripStates([PC,RS]),true);assert.deepEqual(S4.segments.map((g)=>g.share),[0,0,0.25,0.5,0,0,0]);
 assert.equal(S4.needle.index,10,'ratio secure: unit rates');assert.equal(S4.needle.x,S4.segments[3].x+S4.segments[3].w/2,'half way into the ratio and rates bar');
 const S3=RR.stripModel(SCHOOL,stripStates([ONE]),true);assert.equal(S3.needle.x,S3.segments[2].x,'one-step secure: the needle at the start of the decimals bar');
 // stripAt: before topic k, in the bar that holds it; the end past the last
 for(let k=0;k<=17;k++){const x=RR.stripAt(S0,k);if(k<17){const idx=[0,0,0,0,1,2,2,2,2,3,3,4,4,5,5,6,6][k],g=S0.segments[idx],before=[0,4,5,9,11,13,15][idx];assert.equal(x,g.x+g.w*(k-before)/g.count,`k ${k}`);}else assert.equal(x,26+1676);}
 // the tick for a 12-year-old in each system (v2 M2b: de's, after 15 of 17, is no longer at the end); a 13-year-old in uk is past all
 // seventeen, so the tick is at the end with its pill turned inward; none is cut at either end
 for(const [sys,exp,edge,age] of [['us',14,null,12],['uk',14,null,12],['cz',14,null,12],['de',15,null,12],['uk',17,'r',13]]){
  const f=RR.stripFlag(S0,P.expectedOn('school',sys,age));assert.equal(f.x,RR.stripAt(S0,exp),sys);assert.equal(f.edge,edge,`${sys}: the pill turned only at the end`);
 }
 assert.deepEqual(RR.stripFlag(S0,0),{x:26,edge:'l'},'a tick at the start turns right');assert.deepEqual(RR.stripFlag(S0,-1),{x:26,edge:'l'});assert.equal(RR.stripFlag(S0,99).edge,'r');
 // the Calculus strip is unchanged by the refactor: the needle rule reads stripAt too
 const C0=RR.stripModel(CALC,Object.fromEntries(CALC.map((t,i)=>[t.id,i<7?'secure':'later'])));
 const d=C0.segments[2];assert.equal(C0.needle.x,d.x+d.w*1/6,'one sixth into Derivatives, as maths-ruler-test pins');
});

// ------------------------------------------------------------------ Family W8: three doors, Get ready for school, the second ink line
const PR=require(src('tv/prepareRows.ts'));
/** Tonight, Topics or Get ready for school as MathsTV draws it, with the two-cell question's lit cell (`ask`). */
function drawW8(s,ask=null){const {MathsTV}=require(src('maths/MathsTV.tsx'));const q=console.error;console.error=()=>{};try{return renderToStaticMarkup(createElement(MathsTV,{s,busy:false,ask}));}finally{console.error=q;}}
const count=(html,re)=>(html.match(re)||[]).length;
const textOf=(html)=>html.replace(/<[^>]*>/g,' ');
/** Each topic box on the ruler, by the name it carries: its markup. */
const boxes=(html)=>Object.fromEntries(html.split('class="mb-topic"').slice(1).map((chunk)=>[/<div class="mb-tn">([^<]*)</.exec(chunk)?.[1],chunk.split('class="mb-tl"')[0]]));

test('W8 1: Tonight draws three doors for a school learner (beside the continue card as a column, on the first evening as a row) and two for a Calculus learner, as before',()=>{
 const fresh={...seated({system:'uk'}),screen:'tonight',focus:2,skills:{}};
 const html=draw(fresh);
 assert.match(html,/class="mb-doors wide three"/);assert.equal(count(html,/class="mb-door"/g),3);
 assert.ok(['I have homework','Teach me something','Get ready for school'].every((t)=>html.includes(`<div class="dt">${t}</div>`)));
 assert.ok(html.indexOf('I have homework')<html.indexOf('Teach me something')&&html.indexOf('Teach me something')<html.indexOf('Get ready for school'),'the doors in their stop order');
 assert.match(html,/data-focused="true"[^>]*>(?:(?!class="mb-door").)*Get ready for school/,'the lamp on the third door');
 assert.ok(html.includes(PR.PREPARE_DOOR),'its caption');
 const withSet={...fresh,focus:3,practice:{topic:'frac-add-sub',marked:false,items:[{n:1,question:'Work out 1/2 + 1/4.'}]}};
 const col=draw(withSet);assert.match(col,/class="mb-doors three"/,'beside the continue card: the column of three');assert.equal(count(col,/class="mb-door"/g),3);
 // a Calculus learner: two doors, the classes and words they always had
 const calc={...seated({type:'other',age:19,mathPath:'calc1'}),screen:'tonight',focus:1,skills:{}};
 const c=draw(calc);assert.match(c,/class="mb-doors wide"/);assert.doesNotMatch(c,/three|Get ready for school/);assert.equal(count(c,/class="mb-door"/g),2);
 assert.match(draw({...calc,focus:2,practice:withSet.practice}),/class="mb-doors"/);
});

test('W8 2: Get ready for school lists the units by strand with the learner\'s own year word and nothing else of the path - one thing lit - in every school system',()=>{
 const W={us:'Grade',uk:'Year',cz:'ročník',de:'Klasse'};
 for(const system of ['us','uk','cz','de']){
  const s={...seated({system}),screen:'prepare',focus:4,skills:skillsOf([ONE,F])};
  const html=draw(s);
  assert.match(html,/data-role="maths-prepare"/,system);
  const heads=[...html.matchAll(/class="mb-pstrand"[^>]*><span[^>]*>([^<]*)</g)].map((m)=>m[1]);
  assert.deepEqual(heads,['Fractions','Equations','Decimals and percent','Ratio and rates','Geometry and data'],`${system}: strands in order`);
  const cards=[...html.matchAll(/class="mb-unit2"[^>]*><div class="nm">([^<]*)<\/div><div class="yr">([^<]*)</g)].map((m)=>[m[1].replace(/&#x27;/g,"'"),m[2]]);
  const units=PR.prepareStops(s);
  assert.deepEqual(cards.map((c)=>c[0]),units.map((u)=>u.name),`${system}: every unit, strand by strand`);
  cards.forEach(([name,yr],i)=>{assert.equal(yr,PR.SYS_WORD[system](units[i].year),`${system} ${name}`);assert.ok(yr.includes(W[system]));});
  // nothing of the path: no ruler, no state word, no needle, no SCHOOL tick, no gap line
  assert.doesNotMatch(html,/maths-ruler|mb-marker|mb-flag|mb-gapline|mb-groove|mb-ink2/,`${system}: no ruler`);
  assert.doesNotMatch(textOf(html),/\b(Secure|In progress|Not started|School)\b/,`${system}: no state word, no SCHOOL tick`);
  assert.equal(count(html,/data-focused="true"/g),1,`${system}: one thing lit`);
  assert.match(html,new RegExp(`data-focused="true"[^>]*><div class="nm">${units[4].name}<`),'the lamp on the focused unit');
 }
 // the question: two cells, "The usual" lit, the unit held and not lit; then "A step up"
 const s={...seated({system:'uk'}),screen:'prepare',focus:2,skills:{}};
 for(const ask of [0,1]){
  const html=drawW8(s,ask),name=PR.prepareStops(s)[2].name;
  assert.equal(count(html,/class="mb-cell2"/g),2);assert.equal(count(html,/data-focused="true"/g),1,'one thing lit: the cell');
  assert.match(html,new RegExp(`class="mb-cell2" data-id="${ask?'stretch':'usual'}" data-focused="true"`));
  assert.match(html,new RegExp(`data-held="true"[^>]*><div class="nm">${name}<`),'the unit is held under the question');
  assert.ok(html.includes(PR.choiceLine(ask)),'the lit cell\'s sentence');
  assert.doesNotMatch(textOf(html.split('class="mb-lede')[1].split('data-role="maths-prepare"')[0]),/[0-9]/,'no number anywhere on the question');
 }
 // a Calculus learner has no units here (and no door to reach it)
 const calc=draw({...seated({type:'other',age:19,mathPath:'calc1'}),screen:'prepare',focus:0,skills:{}});
 assert.doesNotMatch(calc,/mb-unit2|mb-cell2/);
});

test('W8 3: the second ink line is drawn exactly for a latched step-up record - on the Topics ruler, the strand strip and the topic\'s detail - never a digit, and static',()=>{
 const up=(topic,usual,latched)=>({topic,seen:usual?6:0,right:usual?6:0,estimate:usual?0.9:0,secure:usual,lastSeen:1,slips:[],stretch:{seen:6,right:latched?6:3,estimate:latched?0.9:0.5,secure:latched,lastSeen:1}});
 // usual-secure only (add and subtract), step-up only (area), both (ratio), a step-up not latched (unit rates)
 const skills={[F]:rec(F),[AR]:up(AR,false,true),[RS]:up(RS,true,true),[UR]:up(UR,false,false)};
 const name=(id)=>SCHOOL.find((t)=>t.id===id).name;
 for(const focus of [2,9,11]){
  const html=draw({...seated({system:'uk'}),screen:'topics',focus,skills});
  const b=boxes(html);
  for(const t of SCHOOL)assert.equal(/data-role="maths-stretch"/.test(b[t.name]??''),[AR,RS].includes(t.id),`focus ${focus}: ${t.name}`);
  assert.equal(count(html,/class="mb-ink2"/g),2);
  // the usual record decides the groove: area's usual record has nothing seen, so its groove is unseen, and its word Not started
  assert.match(b[name(AR)],/data-s="unseen"/);assert.match(b[name(RS)],/data-s="secure"/);assert.match(b[name(UR)],/data-s="unseen"/);
 }
 // the detail: the focused topic's kicker carries the small picture when its step-up has latched
 const onArea=draw({...seated({system:'uk'}),screen:'topics',focus:11,skills}),onRate=draw({...seated({system:'uk'}),screen:'topics',focus:10,skills});
 assert.match(onArea,/class="mb-lede"[\s\S]*?class="mb-stepped" data-role="maths-stretch"/);assert.doesNotMatch(onRate.split('class="mb-lede"')[1].split('data-role="maths-ruler"')[0],/mb-stepped/);
 assert.match(onArea,/Not started/,'the word stays about the usual record');
 // the strip on Tonight: a second line under a bar, as long as its share; none where no step-up has latched
 const t=draw({...seated({system:'uk'}),screen:'tonight',focus:0,skills});
 const segs=t.split('class="mb-seg"').slice(1);
 const ink=segs.map((g)=>{const m=/class="mb-ink2" data-role="maths-stretch" style="right:auto;width:calc\(\(100% - 24px\) \* ([\d.]+)\)"/.exec(g);return m?Number(m[1]):0;});
 assert.deepEqual(ink,[0,0,0,0.5,0.5,0,0],'Ratio and rates: ratio latched, unit rates not; Geometry and data: area (v2 M2b: seven bars, the second Geometry and data bar none)');
 // never a digit in the mark's own text, and the Tonight title counts the usual records only
 for(const html of [t,onArea])for(const m of html.matchAll(/data-role="maths-stretch"[^>]*>([\s\S]*?)<\/(?:div|span)>/g))assert.doesNotMatch(textOf(m[1]),/[0-9]/);
 assert.match(t,/Two of 17 topics <em>secure/,'add and subtract and ratio: the usual records');
 // static: no animation on the line, and reduced motion stills everything else
 const css=fs.readFileSync(src('design/maths-lamplight.css'),'utf8');
 const rules=[...css.matchAll(/([^{}]*mb-ink2[^{}]*)\{([^}]*)\}/g)];
 assert.ok(rules.length>=2);for(const r of rules)assert.doesNotMatch(r[2],/animation|transition/,`static: ${r[1].trim()}`);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\) \{\s*\.maths-tv \*, \.maths-tv \*::before, \.maths-tv \*::after \{ animation: none !important; transition: none !important; \}/);
 assert.match(css,/\.mb-ink2 \{[^}]*background: var\(--mb-sky\)/,'the lamp\'s sky token');
});

test('W8 4: a set asked from Get ready for school keeps the screen while it is written (topic.open with stay), and lands on the practice sheet',()=>{
 const s=seated({system:'uk'});
 store.dispatch({type:'nav',screen:'prepare',focus:6});
 store.dispatch({type:'topic.open',topic:'pct-change',stay:true});
 let n=store.getSession();assert.deepEqual([n.screen,n.focus,n.topic,n.subject],['prepare',6,'pct-change','maths']);
 store.dispatch({type:'topic.open',topic:'pct-change'});n=store.getSession();
 assert.deepEqual([n.screen,n.focus],['topics',8],'Topics as before');
 store.dispatch({type:'practice.set',practice:{topic:'pct-change',marked:false,stretch:true,items:[{n:1,question:'Increase 60 by 15%.',stretch:true}]}});
 assert.equal(store.getSession().screen,'practice');assert.equal(store.getSession().practice.stretch,true);
 assert.ok(s.learner);
});
