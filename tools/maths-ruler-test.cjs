/**
 * Math Buddy's ruler, as numbers (desk/src/tv/rulerRows.ts): the school ruler (eleven topics since W7 batch 2) keeps its formulas and pans on Topics,
 * a long path (Calculus 1, 22 topics in six strands) pans under the lamp with the focused topic in view and its strand
 * labels clamped to their strands, and Tonight draws a long path as one bar per strand with the learner's needle at
 * the frontier. Run with npm test in desk/ (directly: node tools/maths-ruler-test.cjs). Pure: no store, no browser.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const opts={module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true};
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:opts}).outputText,file);
const ROWS=path.join(root,'src/tv/rulerRows.ts');
// loaded per test, so a missing module fails each case on its own
const RR=()=>require(ROWS);
const paths=()=>require(path.join(root,'src/lib/library/paths.ts'));
const school=()=>paths().topicsOf('school'),calc=()=>paths().topicsOf('calc1');
/** States with the first `n` topics of the list latched secure, the rest later (the model reads only 'secure'). */
const firstSecure=(topics,n)=>Object.fromEntries(topics.map((t,i)=>[t.id,i<n?'secure':'later']));

// ---------------------------------------------------------------- 1. the school ruler is drawn as it was

test('ruler model 1: N = 15 (the school path since W7 batch 3) - the small ruler keeps today\'s formulas; the big Topics ruler pans',()=>{
 const {rulerModel,needleX,flagX,clampLabel,TRACK,PAD,MIN_SPAN,FOCUS_SPAN,STRIP_AFTER}=RR();
 assert.equal(TRACK,1728,'the ruler is the stage less its two 96 px safe margins');assert.equal(PAD,26,'26 px each end, the 52 px margins');
 // W5b put 'Add and subtract fractions' first in its own strand; W7 batch 1 made the Fractions strand four units; W7
 // batch 2 put the Decimals and percent strand after one-step equations; W7 batch 3 put Ratio and rates and Geometry and
 // data after it: fifteen topics, six strands (Equations twice).
 // (1728 - 52) / 15 = 111.7 px is under MIN_SPAN (288), so the big ruler pans as Calculus 1 does; past STRIP_AFTER (8)
 // Tonight draws the strand strip, not the small ruler (tools/school-ruler-test.cjs draws it), so these formulas are the model's own
 const topics=school(),N=topics.length;assert.equal(N,15);assert.ok(N>STRIP_AFTER);
 const span=(1728-26*2)/N;
 const STRANDS=['Fractions','Equations','Decimals and percent','Ratio and rates','Geometry and data','Equations'],FROM=[0,4,5,9,11,13];
 assert.ok(span<MIN_SPAN,'fifteen boxes are narrower than the big ruler\'s minimum slot');
 for(let focus=0;focus<N;focus++){
  const m=rulerModel(topics,firstSecure(topics,1),focus,true);
  assert.equal(m.pan,true,`focus ${focus}: the Topics ruler pans`);assert.equal(m.topics[focus].sw,FOCUS_SPAN,'the focused slot is the wide one');
  assert.equal(m.trackWidth,26*2+(N-1)*MIN_SPAN+FOCUS_SPAN);
  const f=m.topics[focus];assert.ok(f.sx-m.offset>=0&&f.sx+f.sw-m.offset<=1728,`focus ${focus}: the focused topic is on the stage`);
  assert.deepEqual(m.strands.map((s)=>s.name),STRANDS);
  for(const g of m.strands)assert.equal(g.label,clampLabel(g.name,g.labelW),`${g.name}: its label fits its strand`);
  assert.equal(needleX(m,1,0.5),m.topics[1].sx+0.5*m.topics[1].sw,'the needle is part way through its slot');
 }
 for(const big of [false])for(const focus of [undefined,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]){
  const m=rulerModel(topics,firstSecure(topics,1),focus,big);
  assert.equal(m.span,span,'span = (1728 - 52) / N');
  assert.equal(m.trackWidth,1728);assert.equal(m.offset,0,'nothing to pan');assert.equal(m.pan,false);
  assert.deepEqual(m.more,{l:false,r:false},'no chevron');
  m.topics.forEach((t,i)=>{
   assert.equal(t.id,topics[i].id);
   assert.equal(t.x,26+i*span+6,`box ${i} left`);assert.equal(t.w,span-12,`box ${i} width`);
   assert.equal(t.sx-1.5,26+i*span-1.5,`tick ${i}`);
  });
  assert.equal(m.end-1.5,26+N*span-1.5,'the end tick');
  assert.deepEqual(m.strands.map((s)=>s.name),STRANDS);
  m.strands.forEach((g,i)=>{assert.equal(g.labelX,26+FROM[i]*span+20,`${g.name} starts at slot ${FROM[i]}`);assert.equal(g.label,clampLabel(g.name,g.labelW));});
  assert.equal(m.strands[0].label,'Fractions','the fractions strand over the first four slots, unclamped');
  for(const [fr,fill] of [[0,0],[0,0.4],[1,0.7],[2,1],[3,1],[5,0.5],[6,1],[9,0.3],[10,1],[12,0.5],[14,1]])assert.equal(needleX(m,fr,fill),26+(fr+fill)*span,`needle at ${fr}+${fill}`);
  for(const exp of [-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16])assert.equal(flagX(m,exp),26+Math.max(0,Math.min(N,exp))*span,`school tick at ${exp}`);
 }
 assert.equal(rulerModel(topics,{},0,true).topics[1].state,'later','a topic with no state is later');
 assert.equal(rulerModel(topics,firstSecure(topics,1),0,true).topics[0].state,'secure');
});

// ---------------------------------------------------------------- 2. a long path pans under the lamp

test('ruler model 2: N = 22 pans - offsets at focus 0, 10 and 21 clamp to 0, the middle and trackWidth - 1728; the focused topic stays on the stage',()=>{
 const {rulerModel,MIN_SPAN,FOCUS_SPAN,HALF}=RR();
 assert.ok(MIN_SPAN>=288,'a name of up to three lines at >= 34 px fits a slot');
 assert.equal(HALF,864);
 const topics=calc(),N=topics.length;assert.equal(N,22);
 const st=firstSecure(topics,0);
 const m0=rulerModel(topics,st,0,true),m10=rulerModel(topics,st,10,true),m21=rulerModel(topics,st,21,true);
 for(const m of [m0,m10,m21]){
  assert.equal(m.pan,true);assert.equal(m.span,MIN_SPAN);
  assert.ok(m.trackWidth>1728);
  assert.equal(m.trackWidth,26*2+(N-1)*MIN_SPAN+FOCUS_SPAN,'every slot, the focused one wider, and the two end margins');
  const last=m.topics[N-1];assert.equal(last.sx+last.sw+26,m.trackWidth,'the track ends 26 px after its last slot');
  assert.equal(m.topics[0].sx,26);
  for(let i=1;i<N;i++)assert.equal(m.topics[i].sx,m.topics[i-1].sx+m.topics[i-1].sw,'slots abut');
 }
 assert.equal(m0.offset,0,'focus 0: the start of the track');
 assert.deepEqual(m0.more,{l:false,r:true});
 const f10=m10.topics[10];
 assert.equal(m10.offset,f10.sx+f10.sw/2-864,'focus 10: the focused slot centred under the lamp');
 assert.ok(m10.offset>0&&m10.offset<m10.trackWidth-1728);
 assert.deepEqual(m10.more,{l:true,r:true});
 assert.equal(m21.offset,m21.trackWidth-1728,'focus 21: the end of the track, no gap after it');
 assert.deepEqual(m21.more,{l:true,r:false});
 for(let f=0;f<N;f++){
  const m=rulerModel(topics,st,f,true),t=m.topics[f];
  assert.equal(t.sw,FOCUS_SPAN,`focus ${f}: the focused slot is the wide one`);
  assert.ok(m.topics.every((x,i)=>i===f||x.sw===MIN_SPAN));
  assert.ok(m.offset>=0&&m.offset<=m.trackWidth-1728,`focus ${f}: no gap at either end`);
  assert.ok(t.x-m.offset>=0&&t.x+t.w-m.offset<=1728,`focus ${f}: the focused box is inside the ruler window (${t.x-m.offset}..${t.x+t.w-m.offset})`);
 }
 assert.equal(rulerModel(topics,st,99,true).offset,m21.offset,'a focus past the end is the last topic');
 assert.equal(rulerModel(topics,st,undefined,false).pan,false,'the small ruler never pans');
});

test('ruler model 3: strand labels sit at their strand\'s start and clamp to its width, with an ellipsis, never over the next strand',()=>{
 const {rulerModel,clampLabel,LABEL_CH}=RR();
 const topics=calc();
 const m=rulerModel(topics,{},0,true);
 assert.deepEqual(m.strands.map(g=>g.name),['Functions','Limits','Derivatives','Applications of derivatives','Integrals','Applications of integrals']);
 for(const g of m.strands){
  const first=m.topics.find(t=>topics.find(x=>x.id===t.id).strand===g.name);
  assert.equal(g.x,first.sx,`${g.name} starts at its first topic`);
  assert.equal(g.labelX,g.x+20);
  assert.ok(g.label.length*LABEL_CH<=g.labelW,`${g.name}: "${g.label}" fits its ${g.labelW} px`);
  assert.ok(g.labelX+g.labelW<=g.x+g.w,'inside its strand');
 }
 const one=m.strands.find(g=>g.name==='Applications of integrals');
 assert.ok(one.label.endsWith('…')&&one.label.length<'Applications of integrals'.length,`the one-topic strand clamps: ${one.label}`);
 assert.equal(m.strands.find(g=>g.name==='Derivatives').label,'Derivatives','a label that fits is left whole');
 for(let i=1;i<m.strands.length;i++)assert.ok(m.strands[i-1].labelX+m.strands[i-1].labelW<=m.strands[i].labelX,'labels do not overlap');
 // focused, the one-topic strand is wide enough for its whole name
 assert.equal(rulerModel(topics,{},21,true).strands.at(-1).label,'Applications of integrals');
 assert.equal(clampLabel('Equations',1000),'Equations');
 assert.equal(clampLabel('Applications of derivatives',10*LABEL_CH),'Applicati…','ten characters\' room: nine and the ellipsis');
 assert.equal(clampLabel('Applications of derivatives',3*LABEL_CH),'Ap…');
 assert.ok(!/\s…$/.test(clampLabel('Applications of derivatives',14*LABEL_CH)),'no space before the ellipsis');
});

test('ruler model 4: the focused name is fitted from 44 px down to 34 px in 2 px steps, never under 34 (fitName)',()=>{
 const {fitName,NAME_SIZES}=RR();
 assert.deepEqual(NAME_SIZES,[44,42,40,38,36,34]);
 assert.equal(fitName(()=>true),44,'fits at once');
 assert.equal(fitName((px)=>px<=40),40);
 assert.equal(fitName(()=>false),34,'nothing fits: the 34 px floor, never under');
 let asked=[];fitName((px)=>{asked.push(px);return px<=38;});
 assert.deepEqual(asked,[44,42,40,38],'largest first, stops at the first that fits');
});

// ---------------------------------------------------------------- 3. Tonight: a long path is one bar per strand

test('strip 1: segment widths follow the topic counts, none under 96 px nor under the room its label needs whole in two lines, and sum to the strip',()=>{
 const {stripModel,labelNeed,STRIP_AFTER,MIN_SEG,STRIP_LINES,STRIP_INSET,STRIP_CH}=RR();
 assert.equal(STRIP_AFTER,8);assert.equal(MIN_SEG,96);assert.equal(STRIP_LINES,2);assert.equal(STRIP_INSET,36);assert.equal(STRIP_CH,17);
 const topics=calc(),m=stripModel(topics,{});
 assert.equal(m.width,1728-52);assert.equal(m.x0,26);
 assert.deepEqual(m.segments.map(g=>g.count),[3,3,6,4,5,1]);
 assert.equal(m.segments.reduce((a,g)=>a+g.w,0),m.width,'the widths sum to the strip');
 assert.equal(m.segments[0].x,26);
 for(let i=1;i<m.segments.length;i++)assert.equal(m.segments[i].x,m.segments[i-1].x+m.segments[i-1].w,'segments abut');
 for(const g of m.segments){assert.ok(g.w>=96,`${g.name}: ${g.w} px`);assert.ok(Number.isInteger(g.w)&&Number.isInteger(g.x));}
 const [f,,d]=m.segments;
 assert.ok(Math.abs(d.w/f.w-2)<0.02,'six topics are twice three');
 // Family W7 batch 3: every label stands whole, in at most two lines of whole words, each within its bar - the one-topic
 // "Applications of integrals" bar, 96 px before, takes the room its two lines need (it read "Ap…")
 for(const g of m.segments){
  assert.ok(g.w>=Math.ceil(labelNeed(g.name,STRIP_CH))+36,`${g.name}: ${g.w} px holds its label`);
  assert.equal(g.label,g.name,`${g.name}: whole`);assert.equal(g.lines.join(' '),g.name);assert.ok(g.lines.length<=2);
  for(const l of g.lines)assert.ok(l.length*STRIP_CH<=g.labelW,`${g.name}: "${l}" fits ${g.labelW} px`);
  assert.ok(g.labelX+g.labelW<=g.x+g.w);
 }
 assert.deepEqual(m.segments.at(-1).lines,['Applications','of integrals']);
 assert.equal(labelNeed('Equations'),9*16);assert.equal(labelNeed('Geometry and data'),8*16,'GEOMETRY / AND DATA');assert.equal(labelNeed('Applications of derivatives'),14*16);
});

test('strip 2: each segment fills by its share of secure topics, and the needle stands at the frontier for 0, 7, 15 and 22 secure',()=>{
 const {stripModel}=RR();
 const topics=calc();
 const at=(n)=>stripModel(topics,firstSecure(topics,n));
 const m0=at(0);
 assert.ok(m0.segments.every(g=>g.secure===0&&g.share===0));
 assert.deepEqual([m0.needle.index,m0.needle.x,m0.needle.at],[0,26,'start'],'nothing secure: the first topic, the start of the strip');
 const m7=at(7);
 assert.deepEqual(m7.segments.map(g=>g.secure),[3,3,1,0,0,0]);
 assert.equal(m7.segments[2].share,1/6);
 const d=m7.segments[2];
 assert.equal(m7.needle.index,7,'calc1-rules, the first topic not secure whose prereqs are');
 assert.equal(m7.needle.x,d.x+d.w*1/6,'one sixth into Derivatives, where its fill ends');assert.equal(m7.needle.at,'mid');
 const m15=at(15);
 assert.deepEqual(m15.segments.map(g=>g.secure),[3,3,6,3,0,0]);
 const a=m15.segments[3];
 assert.equal(topics[m15.needle.index].id,'calc1-newton');
 assert.equal(m15.needle.x,a.x+a.w*3/4);
 const m22=at(22);
 assert.ok(m22.segments.every(g=>g.share===1));
 assert.deepEqual([m22.needle.index,m22.needle.x,m22.needle.at],[22,26+1676,'end'],'every topic secure: the end of the strip');
 // the frontier is read from the prerequisites, not the order: a later topic secure out of order does not move it
 const odd={...firstSecure(topics,0),'calc1-newton':'secure'};
 assert.equal(stripModel(topics,odd).needle.index,0);
 assert.equal(stripModel(topics,odd).segments[3].secure,1,'but it is counted in its strand\'s fill');
});

// ---------------------------------------------------------------- 4. pure: no session module

test('ruler model 5: rulerRows.ts imports no session module, no filesystem, and MathsTV draws its ruler from it',()=>{
 const out=ts.transpileModule(fs.readFileSync(ROWS,'utf8'),{compilerOptions:opts}).outputText;
 assert.doesNotMatch(out,/require\([^)]*lib\/session\//,'no session module at runtime');
 assert.doesNotMatch(out,/require\([^)]*(node:)?fs['"]/,'no filesystem');
 assert.doesNotMatch(out,/require\([^)]*learners/);
 for(const k of Object.keys(require.cache))if(/session[\\/](store|learners)\.ts$/.test(k))delete require.cache[k];
 RR();
 assert.ok(!Object.keys(require.cache).some(k=>/session[\\/](store|learners)\.ts$/.test(k)),'loading rulerRows pulled the store in');
 const strip=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'`\\])\/\/.*$/gm,'$1');
 const tv=strip(fs.readFileSync(path.join(root,'src/maths/MathsTV.tsx'),'utf8'));
 assert.match(tv,/import \{[^}]*rulerModel[^}]*\} from "@\/tv\/rulerRows"/,'MathsTV takes the ruler from tv/rulerRows.ts');
 assert.match(tv,/stripModel\(/,'and Tonight\'s strip');
 assert.doesNotMatch(tv,/span = \(W - PAD \* 2\) \/ N/,'no second copy of the formula in the TV');
});
