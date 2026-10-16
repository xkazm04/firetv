/**
 * MB-B35 (ask e78baa5a, 2026-10-16: Mark snapped sheets): a learner's own snapped maths page is marked from a photo of
 * their working by the same code judge a desk set uses. An item the page reads as a spec (rules/kinds readQuestion) is
 * judged right, wrong or not sure; an item that does not read is not sure, never wrong; the desk never states an answer.
 * Run with npm run test:rules in desk/ (directly: node tools/page-marking-test.cjs). Stubbed vision only: no model is
 * called, and a real photo has never been read by this path (MB-B17). The data directory is disposable, under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-page-marking-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));require(src('lib/engines/embed.ts'));require(src('lib/engines/vision.ts'));
const store=require(src('lib/session/store.ts'));
const learners=require(src('lib/session/learners.ts'));
const route=(name)=>require(src(`app/api/${name}/route.ts`));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});
afterEach(()=>reg.resetProviders());
reg.useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0])})});
const post=(name,body)=>route(name).POST(new Request(`http://desk/api/${name}`,{method:'POST',body:JSON.stringify(body)}));
const IMG='data:image/jpeg;base64,AAAA';
let seenVision=[];
const stubVision=(f)=>{seenVision=[];reg.useProvider('vision',{name:'stub',run:async(req)=>{seenVision.push(req);return {raw:JSON.stringify(await f(req))};}});};
const noModel=()=>{seenVision=[];reg.useProvider('vision',{name:'stub',run:async(req)=>{seenVision.push(req);throw new Error('a refused request must not call a model');}});reg.useProvider('text',{name:'stub',run:async()=>{throw new Error('no text model');}});};
const stringsIn=(o)=>typeof o==='string'?[o]:o&&typeof o==='object'?Object.values(o).flatMap(stringsIn):[];
const item=(n,text)=>({n,text,cx:0,cy:0,band:[n*10,n*10+10],key:`k${n}`});
const CALC=[item(1,'Differentiate 3x^2 + 2x'),item(2,'Find the integral of 2x'),item(3,'Evaluate the limit as x approaches 0 of sin(3x)/x'),item(4,'Solve 2x + 3 = 11')];
function seat(id,extra={}){store.dispatch({type:'profile.draft',patch:{id,name:id,type:'high-school',age:17,modules:['maths'],...extra}});store.dispatch({type:'profile.save'});}
function withPage(items,pid='maths-1'){
 store.dispatch({type:'page.reading',page:{id:pid,subject:'maths',title:'Sheet 4',img:'',w:100,h:100}});
 store.dispatch({type:'page.read',id:pid,items,readMs:1,provider:'test'});return pid;
}
const lines=(id)=>learners.getLearner(id).history;
const page=(id='maths-1')=>store.getSession().pages.find((p)=>p.id===id);
const settle=async()=>{for(let i=0;i<20;i++)await new Promise((r)=>setImmediate(r));};

test('1: three items that read and one that does not give 1 right, 1 to look at, 2 to talk through; no answer is shown',async()=>{
 store.dispatch({type:'reset'});seat('page-calc',{mathPath:'calc1'});const pid=withPage(CALC);
 stubVision(()=>({items:[
  {n:1,studentAnswer:'6x + 2',studentWorking:'3x^2 -> 6x\n2x -> 2',slip:'unclear'},
  {n:2,studentAnswer:'x^2/2 + C',studentWorking:'',slip:'power-off-by-one'},
  {n:3,studentAnswer:'?',studentWorking:'',slip:'unclear'},
  {n:4,studentAnswer:'4',studentWorking:'',slip:'unclear'}]}));
 const before=lines('page-calc').length;
 const r=await post('mark',{page:pid,image:IMG});
 assert.equal(r.status,200);const b=await r.json();
 assert.deepEqual([b.right,b.wrong,b.unsure],[1,1,2]);
 const m=page(pid).marked;assert.ok(m);
 assert.deepEqual(m.items.map((i)=>i.verdict),['right','wrong','unsure','unsure']);
 assert.equal(m.items[1].slip,'power-off-by-one');
 // the item the reader does not read is not sure, never wrong, and the model was asked about the three that read only
 assert.equal(seenVision.length,1);
 assert.doesNotMatch(seenVision[0].prompt,/Solve 2x/);
 // the desk states no answer: nothing it says carries the derivative
 assert.doesNotMatch(stringsIn(m.items.map((i)=>i.said)).join(' | '),/6x/);
 // the page's own items are untouched, and the history line says it was the learner's own sheet
 assert.deepEqual(page(pid).items,CALC);
 const h=lines('page-calc');assert.equal(h.length,before+1);
 assert.equal(h.at(-1).kind,'homework');assert.equal(h.at(-1).detail,'own sheet: 1 of 4 right, 2 not sure');
 assert.equal(require(src('tv/pageLines.ts')).markedLine(m.items),'Your sheet: 1 right, 1 to look at, 2 to talk through.');
});

test('2: a second mark of the same page is refused before any model call',async()=>{
 store.dispatch({type:'reset'});seat('page-twice',{mathPath:'calc1'});const pid=withPage(CALC);
 stubVision(()=>({items:[{n:1,studentAnswer:'6x + 2',studentWorking:'',slip:'unclear'}]}));
 assert.equal((await post('mark',{page:pid,image:IMG})).status,200);
 const n=lines('page-twice').length;
 noModel();
 const r=await post('mark',{page:pid,image:IMG});
 assert.equal(r.status,409);assert.equal(seenVision.length,0);assert.equal(lines('page-twice').length,n);
 // the other refusals are also before any model call
 assert.equal((await post('mark',{page:'nope',image:IMG})).status,409);
 assert.equal((await post('mark',{page:pid,answers:['1']})).status,400);
 const bare=withPage([item(1,'Solve 2x + 3 = 11')],'maths-2');
 const r2=await post('mark',{page:bare,image:IMG});assert.equal(r2.status,400);assert.equal(seenVision.length,0);
 assert.equal(page(bare).marked,undefined);
});

test('3: a mark with nobody at the desk is refused, and a desk set still needs a set',async()=>{
 store.dispatch({type:'reset'});noModel();
 assert.equal((await post('mark',{page:'maths-1',image:IMG})).status,409);
 assert.equal(seenVision.length,0);
 seat('page-set');
 const r=await post('mark',{image:IMG});
 assert.equal(r.status,400);assert.equal((await r.json()).error,'Start a practice set first.');
});

test('4: a learner switch while the mark runs lands it on the owner\'s page in the away slot, never on the seated learner',async()=>{
 store.dispatch({type:'reset'});seat('page-other');seat('page-owner',{mathPath:'calc1'});const pid=withPage(CALC);
 let release;const gate=new Promise((res)=>{release=res;});
 stubVision(async()=>{await gate;return {items:[{n:1,studentAnswer:'6x + 2',studentWorking:'',slip:'unclear'}]};});
 const running=post('mark',{page:pid,image:IMG});
 await settle();
 store.dispatch({type:'learner.set',id:'page-other'});
 release();
 const r=await running;
 assert.equal(r.status,200);
 const s=store.getSession();
 assert.equal(s.learner.id,'page-other');assert.ok(!s.pages.some((p)=>p.marked),'nothing on the seated learner');
 const away=s.away['page-owner'].pages.find((p)=>p.id===pid);
 assert.ok(away&&away.marked&&away.marked.items[0].verdict==='right');
 assert.ok(lines('page-owner').at(-1).detail.startsWith('own sheet: 1 of 4 right'));
 assert.ok(!lines('page-other').some((h)=>String(h.detail).startsWith('own sheet')));
});

test('5: a page read again while the mark ran is MOVED_ON and nothing is recorded',async()=>{
 store.dispatch({type:'reset'});seat('page-gone',{mathPath:'calc1'});const pid=withPage(CALC);
 let release;const gate=new Promise((res)=>{release=res;});
 stubVision(async()=>{await gate;return {items:[{n:1,studentAnswer:'6x + 2',studentWorking:'',slip:'unclear'}]};});
 const n=lines('page-gone').length;
 const running=post('mark',{page:pid,image:IMG});
 await settle();
 // the same page read again in place drops its items for a moment, so it is no longer the page that was marked
 store.dispatch({type:'page.reading',page:{id:pid,subject:'maths',title:'Sheet 4',img:'',w:100,h:100}});
 release();
 const r=await running;
 assert.equal(r.status,409);assert.equal(page(pid).marked,undefined);assert.equal(lines('page-gone').length,n);
});

test('6: a cz learner\'s decimal comma is read, and the cz system reaches the judge',async()=>{
 store.dispatch({type:'reset'});seat('page-cz',{system:'cz'});
 const pid=withPage([item(1,'Work out 0,5 + 0,25'),item(2,'Work out 0,5 + 0,25')]);
 stubVision(()=>({items:[{n:1,studentAnswer:'0,75',studentWorking:'0,5 + 0,25'},{n:2,studentAnswer:'0,76',studentWorking:''}]}));
 const r=await post('mark',{page:pid,image:IMG});assert.equal(r.status,200);
 assert.deepEqual(page(pid).marked.items.map((i)=>i.verdict),['right','wrong']);
 assert.match(seenVision[0].prompt,/school maths questions/);
});

test('7: a desk set is still read and marked by its own path',async()=>{
 const M=require(src('lib/desk/mark.ts'));
 store.dispatch({type:'reset'});seat('page-set2',{mathPath:'calc1'});
 const practice={topic:'calc1-rules',marked:false,items:[{n:1,question:'Differentiate 3x^2 + 2x',spec:{shape:'derivative',f:'3x^2 + 2x'}}]};
 stubVision(()=>({items:[{n:1,studentAnswer:'6x + 2',studentWorking:'',slip:'unclear'}]}));
 const r=await M.markSet('AAAA',practice,'page-set2',()=>true);
 assert.equal(r.landed,true);assert.equal(r.items[0].verdict,'right');
 assert.match(seenVision[0].prompt,/Calculus/);
});
