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

test('a still\'s box holds the stage widened by the layer\'s whole slide, clipped to what is drawn',()=>{
 for(const d of [0.1,0.34,0.6,1.25]){
  const b=rules.stillBox(d,600),s=rules.slide(d);
  assert.ok(b.x<=Math.max(-1400,-s),`d ${d}: left edge ${b.x} would show in a slide of ${s}`);
  assert.ok(b.x+b.w>=Math.min(3300,1920+s),`d ${d}: right edge would show`);
  assert.ok(b.x>=-1400&&b.x+b.w<=3300,'no wider than the drawing');
  assert.equal(b.y,560,'the top is the drawing\'s top less the shadow margin');
  assert.ok(b.y+b.h>=1080,'it reaches the stage\'s bottom');
 }
 assert.equal(rules.slide(0.1),288,'a layer slides at least 15 % of the stage');
 assert.equal(rules.stillBox(0.1,-500).y,-120,'never above the sky\'s rect');
});

test('the bitmap scale follows the device, rounded up to a quarter, and never under 0.25 or over 2',()=>{
 assert.equal(rules.quantScale(1),1);
 assert.equal(rules.quantScale(0.85),1);
 assert.equal(rules.quantScale(0.5),0.5);
 assert.equal(rules.quantScale(0.01),0.25);
 assert.equal(rules.quantScale(9),2);
 assert.equal(rules.quantScale(NaN),1);
 const p=rules.stillPixels({x:0,y:0,w:2000,h:500},1,'hill');
 assert.deepEqual([p.w,p.h],[1000,250],'half the device\'s resolution');
 assert.equal(rules.stillBytes(p),1000*250*4);
});

test('the Math Buddy stills fit in 12 MB on the stick (1 device px a stage px)',()=>{
 const tops={'maths-sky':-120,'maths-hill-34':585,'maths-hill-60':700,'maths-front':470};
 const ds={'maths-sky':0.1,'maths-hill-34':0.34,'maths-hill-60':0.6,'maths-front':1.25};
 const kinds={'maths-sky':'sky','maths-hill-34':'hill','maths-hill-60':'hill','maths-front':'hero'};
 const bytes=Object.keys(tops).reduce((s,id)=>s+rules.stillBytes(rules.stillPixels(rules.stillBox(ds[id],tops[id]),1,kinds[id])),0);
 assert.ok(bytes<12*1048576,`${(bytes/1048576).toFixed(1)} MB`);
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
