/**
 * The paper landing's pre-rendered stills (desk/src/landing/themes/paper/stills/): which world layers are drawn once into a
 * bitmap and which stay live, the box a bitmap holds (a sliding world never shows a cut edge), its scale and what the
 * bitmaps cost in GPU memory. Pure: no DOM, no server, no model. Run directly: node tools/landing-stills-test.cjs.
 */
const path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const {src}=require('./ts-load.cjs');
const rules=require(path.join(src,'landing/themes/paper/stills/rules.ts'));
const worlds=require(path.join(src,'landing/themes/paper/worlds.tsx'));
const {stillStats}=require(path.join(src,'landing/themes/paper/stills/Still.tsx'));

/** The still ids a layer's node shows: a <Still id> at its top, or inside its top-level fragment. */
function stillsOf(node){
 const out=[],walk=(n,depth)=>{if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(c=>walk(c,depth));return;}
  if(n.type&&n.type.name==='Still'){out.push(n.props.id);return;}
  if(depth<1&&n.props&&n.props.children)walk(n.props.children,depth+1);};
 walk(node,0);return out;}

const MATHS={app:'maths',n:2,m:6,fresh:false};
const EMPTY=null;

test('the Math Buddy world draws its sky, both hills and its front hill and cliffs as stills; the staircase stays live',()=>{
 const L=worlds.worldFor(MATHS);
 const by=(k,d)=>L.find(l=>l.k===k&&l.d===d);
 assert.deepEqual(stillsOf(by('sky',0.1).node),['maths-sky']);
 assert.deepEqual(stillsOf(by('hill',0.34).node),['maths-hill-34']);
 assert.deepEqual(stillsOf(by('hill',0.6).node),['maths-hill-60']);
 assert.deepEqual(stillsOf(by('hero',1.25).node),['maths-front']);
 // the steps lit by the marked set, the clouds that drift and the floating symbols are live
 assert.deepEqual(stillsOf(by('hero',1).node),[]);
 assert.deepEqual(stillsOf(by('soft',0.22).node),[]);
 assert.deepEqual(stillsOf(by('hero',0.48).node),[]);
});

test('Linga and Essay Master draw their sky, hills and front as stills; what moves or carries the session stays live',()=>{
 const en=(over)=>worlds.worldFor({app:'english',resume:false,next:false,...over});
 const ids=(L)=>L.map(l=>[l.k,l.d,stillsOf(l.node)]);
 assert.deepEqual(ids(en({})),[['sky',0.1,['english-sky']],['soft',0.22,[]],['hill',0.34,['english-hill-34']],['hill',0.6,['english-hill-60']],
  ['hero',0.86,['english-door']],['hero',1,[]],['hero',1.12,['english-counter']],['hero',1.3,[]],['hero',1.25,['english-front']]]);
 assert.deepEqual(stillsOf(en({next:true})[0].node),['english-sky-night'],'tonight: the sky with the moon (its stars stay live)');
 const es=worlds.worldFor({app:'essay',sent:2,paras:2});
 assert.deepEqual(ids(es),[['sky',0.1,['essay-sky']],['soft',0.22,[]],['hill',0.34,['essay-hill-34']],['hill',0.6,['essay-hill-60']],
  ['hero',0.92,[]],['hero',1,[]],['hero',1.12,[]],['hero',1.25,['essay-front']]]);
});

test('a still is the same bitmap whatever the session says: the Math Buddy stills do not change with steps lit',()=>{
 const a=worlds.worldFor({app:'maths',n:0,m:6,fresh:true}),b=worlds.worldFor({app:'maths',n:6,m:6,fresh:false});
 const ids=(L)=>L.flatMap(l=>stillsOf(l.node));
 assert.deepEqual(ids(a),ids(b));
});

test('the empty desk shares the Math Buddy hills, not a second bitmap of the same drawing',()=>{
 const ids=worlds.worldFor(EMPTY).flatMap(l=>stillsOf(l.node));
 assert.ok(ids.includes('maths-hill-34')&&ids.includes('maths-hill-60'));
});

test('every declared still has one id',()=>{
 assert.deepEqual(rules.duplicateIds(stillStats().declared),[]);
 assert.deepEqual(rules.duplicateIds(['a','b','a']),['a']);
});

test('a still\'s box holds the stage widened by the layer\'s whole slide, clipped to what is drawn and what its shadow reaches',()=>{
 const hills={x:-1400,y:600,w:4700,h:800};
 for(const d of [0.1,0.34,0.6,1.25]){
  const b=rules.stillBox(d,hills),s=rules.slide(d);
  assert.ok(b.x<=Math.max(-1400,-s),`d ${d}: left edge ${b.x} would show in a slide of ${s}`);
  assert.ok(b.x+b.w>=Math.min(3300,1920+s),`d ${d}: right edge would show`);
  assert.ok(b.x>=-1400&&b.x+b.w<=3300,'no wider than the drawing');
  assert.equal(b.y,528,'the top is the drawing\'s top less what a blur reaches');
  assert.equal(b.y+b.h,1120,'it stops at the stage\'s bottom (and its margin)');
 }
 assert.equal(rules.slide(0.1),288,'a layer slides at least 15 % of the stage');
 assert.equal(rules.stillBox(0.1,{x:-460,y:-500,w:2840,h:1700}).y,-120,'never above the sky\'s rect');
 // a small drawing (the Linga doorway) keeps a small box: its outline and its glow's reach
 const door=rules.stillBox(0.86,{x:890,y:465,w:530,h:595});
 assert.deepEqual(door,{x:818,y:393,w:674,h:727});
});

test('the bitmap scale follows the device, rounded up to a quarter, and never under 0.25 or over 1 (the stick reports DPR 4 on a 1080p surface)',()=>{
 assert.equal(rules.quantScale(1),1);
 assert.equal(rules.quantScale(0.85),1);
 assert.equal(rules.quantScale(0.5),0.5);
 assert.equal(rules.quantScale(0.01),0.25);
 assert.equal(rules.quantScale(2),1);
 assert.equal(rules.quantScale(9),1);
 assert.equal(rules.quantScale(NaN),1);
 const p=rules.stillPixels({x:0,y:0,w:2000,h:500},1,'hill');
 assert.deepEqual([p.w,p.h],[1000,250],'half the device\'s resolution');
 assert.equal(rules.stillBytes(p),1000*250*4);
});

test('every world\'s stills fit in 40 MB on the stick (1 device px a stage px), all three worlds and the night sky',()=>{
 const sky={x:-460,y:-120,w:2840,h:1320},hill=(top)=>({x:-1400,y:top,w:4700,h:1400-top});
 const all=[['sky',0.1,sky],['sky',0.1,sky],['sky',0.1,sky],['sky',0.1,sky],
  ...[585,595,595].flatMap(t=>[['hill',0.34,hill(t)],['hill',0.6,hill(t+110)],['hero',1.25,hill(470)]]),
  ['hero',0.86,{x:890,y:465,w:530,h:595},true],['hero',1.12,{x:492,y:766,w:1116,h:334},true]];
 const bytes=all.reduce((s,[k,d,b,sharp])=>s+rules.stillBytes(rules.stillPixels(rules.stillBox(d,b),1,k,sharp)),0);
 assert.ok(bytes<40*1048576,`${(bytes/1048576).toFixed(1)} MB`);
});

test('a still asked for again while its bake is in flight (a world remounted mid-bake) is baked once',async()=>{
 // the queue with no DOM: each idle slot is held here, and a bake that starts (createElementNS) is counted, then fails
 const S=require(path.join(src,'landing/themes/paper/stills/Still.tsx'));
 const idles=[];let started=0;const was={window:global.window,document:global.document};
 global.window={requestIdleCallback:(cb)=>{idles.push(cb);return idles.length;}};
 global.document={createElementNS:()=>{started++;throw new Error('no DOM here');}};
 try{
  let done=0;const id='essay-front';
  S.requestStill(id,()=>done++);
  assert.equal(idles.length,1,'its bake waits for an idle slot');
  S.requestStill(id,()=>done++); // every lamp move remounts the worlds (WorldSet keys), so its Still asks again
  for(let i=0;i<10&&idles.length;i++){idles.shift()();await new Promise((r)=>setTimeout(r,0));}
  assert.equal(started,1,`the still was baked ${started} times for one bitmap`);
  assert.equal(done,2,'both askers hear it settle');
 }finally{global.window=was.window;global.document=was.document;}
});

test('the baked shadow is the one design/desk-landing.css casts, its blur a radius (deviation = half)',()=>{
 const css=require('node:fs').readFileSync(path.join(src,'design/desk-landing.css'),'utf8');
 for(const k of ['hill','hero','soft']){
  const at=css.indexOf(`data-k="${k}"]`),rule=css.slice(at,css.indexOf('}',at));
  const args=rule.slice(rule.indexOf('drop-shadow(')+12).split(' rgba(');
  const [dx,dy,blur]=args[0].trim().split(/\s+/).map(parseFloat),op=parseFloat(args[1].split(',')[3]);
  const m=[null,dx,dy,blur,op];
  assert.ok(at>=0&&m.slice(1).every(Number.isFinite),`the ${k} shadow is in the CSS`);
  const sh=rules.SHADOW[k];
  assert.deepEqual([sh.dx,sh.dy,sh.blur,sh.opacity],[Number(m[1]),Number(m[2]),Number(m[3]),Number(m[4])],`${k} matches the CSS`);
 }
 assert.equal(rules.SHADOW.sky,null);
 assert.equal(rules.stdDeviation(10),5);
});
