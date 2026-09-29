/**
 * How well the REAL text model writes Calculus specs. For each topic on the Calculus 1 path it runs the desk's own
 * generation - makeItems (desk/src/lib/desk/items.ts, the calc1 branch) with the real text engine, model 'fast' - once,
 * with a scratch learner, and reports how many of the specs the desk asked for survived the code's gate: per topic and
 * per shape, the reasons each one was refused, and the latencies. The gate proves the code around the model
 * (tools/calc-practice-test.cjs, tools/calc-course-test.cjs); this proves the model can feed it.
 *
 * NEVER in the gate and never called by a test: it costs real model calls. The Director runs it by hand:
 *
 *   CALC_YIELD_ALLOW_LIVE=1 node tools/calc-model-yield.cjs [--topics calc1-limit-idea,calc1-ftc] [--n 6] [--min-yield 0.5]
 *   node tools/calc-model-yield.cjs --stub      (the same code path against a built-in stub engine - no model, no flag)
 *
 * How it measures: the text provider the registry would use (or the stub) is wrapped at the provider registry
 * (useProvider, as the tests stub it) by a pass-through that times each call and reads what the model returned - the
 * specs asked for (the request schema's maxItems), the specs returned, and - once the reply passes the engine's accepted
 * shape (a list of objects; a reply that breaks it is refused whole, every spec in it counted so) - for each spec the
 * first gate of the desk's it fails, in the order makeCalcItems applies them: the desk's reading of a raw spec (an object, no result key, a shape
 * on the topic's list, a function - mirrored from items.ts toSpec), rules/calc wellFormed (by its why), a question
 * code can print, a question that does not state its own result (leaksCalc), not a duplicate. Breaks of the strict
 * item schema the request carried are counted too, as information: the desk accepts a spec that breaks it and judges
 * the spec itself. The set itself (kept, rounds) is makeItems' own answer, not the mirror's.
 *
 * Writes artifacts/calc-model-yield.json and .md (--stub: calc-model-yield-stub.*): per topic and per shape the yield
 * (survived / asked for a topic, survived / offered for a shape), the rejection reasons, the p50 and max seconds, and
 * totals. DESK_DATA_DIR is a fresh directory under the OS temp dir, set here - never desk/data. Exit 0 always; with
 * --min-yield Y it exits 1 when the overall yield (survived / asked) is below Y.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),Module=require('node:module');

// ------------------------------------------------------------------ arguments, and the refusal
const argv=process.argv.slice(2);
const arg=(name)=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:undefined;};
const stub=argv.includes('--stub');
const topicsArg=arg('--topics')?.split(',').map((s)=>s.trim()).filter(Boolean)??null;
const n=arg('--n')===undefined?6:Number(arg('--n'));
const minYield=arg('--min-yield')===undefined?null:Number(arg('--min-yield'));
if(!Number.isInteger(n)||n<1||n>12){console.error(`--n takes a whole number from 1 to 12 (got ${arg('--n')}).`);process.exit(2);}
if(minYield!==null&&!(minYield>=0&&minYield<=1)){console.error(`--min-yield takes a number from 0 to 1 (got ${arg('--min-yield')}).`);process.exit(2);}
if(!stub&&process.env.CALC_YIELD_ALLOW_LIVE!=='1'){console.error('Refusing to run: this makes real model calls (one to two per topic, 22 topics by default). Set CALC_YIELD_ALLOW_LIVE=1 to run it, or pass --stub to exercise the script against its built-in stub engine.');process.exit(2);}

// a fresh data directory, never desk/data: makeItems reads the scratch learner's record from it
const data=fs.mkdtempSync(path.join(os.tmpdir(),'desk-calc-yield-'));process.env.DESK_DATA_DIR=data;

// ------------------------------------------------------------------ the desk's TypeScript, as tools/calc-marking-test.cjs loads it
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This probe transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const src=(f)=>path.join(root,'src',f);
const reg=require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts'));
const {validate,stripFence}=require(src('lib/engines/shape.ts'));
const C=require(src('lib/rules/calc.ts'));
const {CALC1_SPINE}=require(src('lib/library/calculus1.spine.ts'));
const {makeItems}=require(src('lib/desk/items.ts'));

const LEARNER='calc-yield-scratch';
const topics=topicsArg??CALC1_SPINE.map((t)=>t.id);
const unknown=topics.filter((id)=>!CALC1_SPINE.some((t)=>t.id===id));
if(unknown.length){console.error(`Not calc1 topics: ${unknown.join(', ')}. The topics are: ${CALC1_SPINE.map((t)=>t.id).join(', ')}.`);process.exit(2);}
const shapesOf=(id)=>CALC1_SPINE.find((t)=>t.id===id).shapes;

// ------------------------------------------------------------------ the desk's gates, mirrored for the reasons (items.ts)
const RESULT_KEYS=['answer','solution','truth','value','result'];
const PARAMS={evaluate:['at'],derivative:[],'derivative-at':['at'],antiderivative:[],'definite-integral':['a','b'],limit:['at','side'],'critical-point':['on'],extremum:['on','kind'],'newton-step':['x0','steps']};
function point(v,limit=false){
 if(typeof v==='number')return Number.isFinite(v)?v:undefined;
 if(typeof v!=='string')return undefined;
 const t=v.trim();if(!t)return undefined;
 if(limit&&/^\+?(inf|infinity|∞)$/i.test(t))return 'inf';
 if(limit&&/^[-−](inf|infinity|∞)$/i.test(t))return '-inf';
 return /^[+-]?\d+(\.\d+)?$/.test(t)?Number(t):t;
}
/** A raw spec as the desk reads it (items.ts toSpec), or the reason it is not read at all. */
function readRaw(raw,shapes){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {why:'not an object'};
 if(RESULT_KEYS.some((k)=>k in raw))return {why:'carries a result key'};
 if(!shapes.includes(raw.shape))return {why:'shape not on the topic\'s list'};
 if(typeof raw.f!=='string'||!raw.f.trim())return {why:'no function'};
 const out={shape:raw.shape,f:raw.f.trim()};
 for(const k of PARAMS[raw.shape]){
  const v=raw[k];
  if(k==='side'){if(v==='+'||v==='-')out.side=v;}
  else if(k==='kind'||k==='steps')out[k]=v;
  else if(k==='on')out.on=Array.isArray(v)?v.map((x)=>point(x)):v;
  else out[k]=point(v,raw.shape==='limit'&&k==='at');
 }
 return {spec:out};
}
const sameKey=(q)=>q.replace(/\s+/g,'').toLowerCase();

// ------------------------------------------------------------------ the stub engine (--stub): valid and bad specs mixed
/** Valid raw specs per shape, as the model is asked to write them (points as strings). */
const VALID={
 evaluate:[{f:'x^2 + 3x',at:'2'},{f:'sin(x) + 1',at:'pi/6'},{f:'e^(2x)',at:'ln(3)'}],
 derivative:[{f:'x^3 + 2x'},{f:'sin(x^2)'},{f:'ln(x)/x'}],
 'derivative-at':[{f:'x^3 - 2x',at:'2'},{f:'sqrt(x)',at:'4'},{f:'x e^x',at:'0'}],
 antiderivative:[{f:'3x^2 + 4x'},{f:'cos(3x)'},{f:'e^(2x)'}],
 'definite-integral':[{f:'x^2',a:'0',b:'3'},{f:'sin(x)',a:'0',b:'pi/2'},{f:'2x + 1',a:'1',b:'4'}],
 limit:[{f:'sin(5x)/x',at:'0',side:''},{f:'(x^2 - 9)/(x - 3)',at:'3',side:''},{f:'(3x^2 - x)/(2x^2 + 5)',at:'inf',side:''}],
 'critical-point':[{f:'x^2 - 6x + 2',on:['0','5']},{f:'x^2 + 4x',on:['-5','0']},{f:'20x - x^2',on:['0','20']}],
 extremum:[{f:'x(12 - x)',on:['0','12'],kind:'max'},{f:'x + 9/x',on:['1','5'],kind:'min'},{f:'x^3 - 3x',on:['-2','0'],kind:'max'}],
 'newton-step':[{f:'x^2 - 5',x0:'2',steps:1},{f:'cos(x) - x',x0:'1',steps:1},{f:'x^3 - 2x - 5',x0:'3',steps:1}],
};
/** Bad raw specs of a shape: degenerate, unreadable, a result key, off the list, a +C, a duplicate. */
const bad=(shape)=>{const v=VALID[shape][0];return [
 {shape,f:'x - x',...(shape==='evaluate'||shape==='derivative-at'?{at:'1'}:{})},
 {...v,shape,f:'x^^2'},
 {...v,shape,answer:'42'},
 {shape:'tangent-line',f:'x^2'},
 {...v,shape,f:'x^2 + C'},
 {...v,shape},
];};
let stubCalls=0,stubBad=0;
const STUB={name:'stub',run:async(req)=>{
 stubCalls++;
 const item=req.schema?.properties?.specs?.items,want=req.schema?.properties?.specs?.maxItems??9;
 const shapes=item?.properties?.shape?.enum??[];
 // one topic's reply is not a list at all: the run fails, and the probe says why
 if(shapes.length===1&&shapes[0]==='newton-step')return {raw:JSON.stringify({specs:'none'})};
 const fill=(o)=>{const x={...o};for(const [k,p] of Object.entries(item?.properties??{}))if(!(k in x))x[k]=Array.isArray(p.enum)?p.enum[0]:p.type==='integer'?(k==='difficulty'?3:0):p.type==='array'?['0','1']:'0';return x;};
 const out=[];
 for(let i=0;i<want;i++){
  const shape=shapes[i%shapes.length];
  // one in three is bad, each kind in turn across the whole run
  if(i%3===2){out.push(bad(shape)[stubBad++%6]);continue;}
  const v=VALID[shape][(Math.floor(i/shapes.length)+stubCalls)%3];
  out.push(fill({shape,...v,difficulty:1+(i%5)}));
 }
 return {raw:JSON.stringify({specs:out})};
}};

// ------------------------------------------------------------------ the pass-through: every call timed and read
const inner=stub?STUB:reg.provider('text');
let current=null;
reg.useProvider('text',{name:inner.name,run:async(req)=>{
 const t0=Date.now();
 const call={ms:0,asked:req.schema?.properties?.specs?.maxItems??null,returned:0,error:null};
 try{
  // CALC_YIELD_THINKING=off asks the real engine to answer without hidden reasoning (TextRequest.thinking: false), to
  // measure speed against yield before items.ts asks for it
  const out=await inner.run(process.env.CALC_YIELD_THINKING==='off'?{...req,thinking:false}:req);
  call.ms=Date.now()-t0;
  if(current)read(current,req,out);
  return out;
 }catch(e){call.ms=Date.now()-t0;call.error=String(e&&e.message||e).slice(0,200);throw e;}
 finally{if(current){current.calls.push(call);if(call.asked)current.asked+=call.asked;}}
}});

/** What one model answer held, spec by spec, in the order the desk's gates meet them. */
function read(rec,req,out){
 let value=out?.raw;
 if(typeof value==='string'){try{value=JSON.parse(stripFence(value));}catch{rec.reasons['the reply is not JSON']=(rec.reasons['the reply is not JSON']??0)+1;return;}}
 const specs=Array.isArray(value?.specs)?value.specs:null;
 if(!specs){rec.reasons['the reply holds no list of specs']=(rec.reasons['the reply holds no list of specs']??0)+1;return;}
 const item=req.schema?.properties?.specs?.items;
 // the engine holds the whole reply to the accepted shape (items.ts CALC_ACCEPT: a list of objects) before the desk
 // sees one spec: a reply that breaks it refuses the whole round, so none of its specs reaches a gate
 const accept=req.accept??req.schema;
 if(accept&&validate(value,accept).length){
  rec.returned+=specs.length;
  const why='the reply broke the accepted shape (the whole round refused)';
  rec.reasons[why]=(rec.reasons[why]??0)+specs.length;
  for(const raw of specs){const shape=raw&&typeof raw==='object'&&typeof raw.shape==='string'?raw.shape:'(none)';(rec.byShape[shape]??=({offered:0,survived:0,kept:0})).offered++;}
  return;
 }
 for(const raw of specs){
  rec.returned++;
  const shape=raw&&typeof raw==='object'&&typeof raw.shape==='string'?raw.shape:'(none)';
  const by=rec.byShape[shape]??=({offered:0,survived:0,kept:0});
  by.offered++;
  if(item&&validate(raw,item).length)rec.strictBreaks++;
  const why=gate(rec,raw);
  if(why){rec.reasons[why]=(rec.reasons[why]??0)+1;continue;}
  rec.survived++;by.survived++;
 }
}
/** The first gate of the desk's this raw spec fails, or null when it survives them all. */
function gate(rec,raw){
 const r=readRaw(raw,rec.shapes);
 if(r.why)return `read: ${r.why}`;
 const w=C.wellFormed(r.spec);
 if(!w.ok)return `wellFormed: ${w.why}`;
 const q=C.question(r.spec);
 if(!q)return 'question: code cannot print it';
 if(C.leaksCalc(r.spec,q.plain))return 'question: it states its own result';
 const k=sameKey(q.plain);
 if(rec.seen.has(k))return 'duplicate of a spec already kept';
 rec.seen.add(k);
 return null;
}

// ------------------------------------------------------------------ the run
const pct=(xs,p)=>{if(!xs.length)return null;const s=[...xs].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(p*(s.length-1)+0.5))];};
const sec=(ms)=>ms===null?'-':(ms/1000).toFixed(1);
const ratio=(a,b)=>b?a/b:null;
const fmt=(r)=>r===null?'-':`${(100*r).toFixed(0)}%`;

(async()=>{
 console.log(`# calc-model-yield: ${stub?'STUB engine (no model)':`live text engine '${inner.name}', model 'fast'`}; ${topics.length} topic(s), sets of ${n}; data ${data}`);
 const runs=[];
 for(const topic of topics){
  const rec={topic,shapes:shapesOf(topic),ok:false,error:null,kept:0,rounds:0,ms:0,asked:0,returned:0,survived:0,strictBreaks:0,reasons:{},byShape:{},calls:[],seen:new Set()};
  current=rec;
  const t0=Date.now();
  try{
   const made=await makeItems(topic,LEARNER,n);
   rec.kept=made.items.length;rec.rounds=made.tries;rec.ok=made.items.length>0;
   if(!rec.ok)rec.error=`no spec survived in ${made.tries} rounds`;
   for(const it of made.items){const by=rec.byShape[it.spec.shape]??=({offered:0,survived:0,kept:0});by.kept++;}
  }catch(e){rec.error=String(e&&e.message||e).slice(0,200);rec.rounds=rec.calls.length;}
  rec.ms=Date.now()-t0;current=null;
  delete rec.seen;
  runs.push(rec);
  console.log(`  ${topic.padEnd(26)} ${rec.ok?'set ':'FAIL'} kept ${rec.kept}/${n}  rounds ${rec.rounds}  survived ${rec.survived}/${rec.asked}  ${sec(rec.ms)} s${rec.error?`  - ${rec.error}`:''}`);
 }

 // per shape, over every topic that offered it
 const shapes={};
 for(const r of runs)for(const [sh,b] of Object.entries(r.byShape)){
  const s=shapes[sh]??=({offered:0,survived:0,kept:0,seconds:[]});
  s.offered+=b.offered;s.survived+=b.survived;s.kept+=b.kept;s.seconds.push(r.ms);
 }
 const reasons={};for(const r of runs)for(const [k,v] of Object.entries(r.reasons))reasons[k]=(reasons[k]??0)+v;
 const callMs=runs.flatMap((r)=>r.calls.map((c)=>c.ms)),runMs=runs.map((r)=>r.ms);
 const totals={topics:runs.length,sets:runs.filter((r)=>r.ok).length,failed:runs.filter((r)=>!r.ok).length,asked:0,returned:0,survived:0,kept:0,strictBreaks:0,calls:callMs.length};
 for(const r of runs)for(const k of ['asked','returned','survived','kept','strictBreaks'])totals[k]+=r[k];
 totals.yield=ratio(totals.survived,totals.asked);
 totals.secondsPerTopic={p50:pct(runMs,0.5)/1000,max:Math.max(0,...runMs)/1000};
 totals.secondsPerCall={p50:callMs.length?pct(callMs,0.5)/1000:null,max:callMs.length?Math.max(...callMs)/1000:null};

 const report={when:new Date().toISOString(),engine:stub?'stub':inner.name,model:'fast',n,topics:runs.map((r)=>({...r,yield:ratio(r.survived,r.asked)})),
  shapes:Object.fromEntries(Object.entries(shapes).map(([k,s])=>[k,{offered:s.offered,survived:s.survived,kept:s.kept,yield:ratio(s.survived,s.offered),seconds:{p50:pct(s.seconds,0.5)/1000,max:Math.max(...s.seconds)/1000}}])),
  reasons:Object.fromEntries(Object.entries(reasons).sort((a,b)=>b[1]-a[1])),totals};

 // the table
 console.log('\n## per shape (survived / offered; seconds are the topic runs that offered it)');
 for(const [k,s] of Object.entries(report.shapes))console.log(`  ${k.padEnd(18)} ${String(s.survived).padStart(3)}/${String(s.offered).padEnd(3)} ${fmt(s.yield).padStart(4)}  kept ${s.kept}  p50 ${s.seconds.p50.toFixed(1)} s  max ${s.seconds.max.toFixed(1)} s`);
 console.log('\n## why specs were refused');
 for(const [k,v] of Object.entries(report.reasons))console.log(`  ${String(v).padStart(4)}  ${k}`);
 console.log(`\n## totals: ${totals.sets}/${totals.topics} sets made (${totals.failed} failed); survived ${totals.survived} of ${totals.asked} asked (yield ${fmt(totals.yield)}), ${totals.returned} returned, ${totals.kept} kept; ${totals.strictBreaks} broke the strict item schema; ${totals.calls} calls, p50 ${sec(totals.secondsPerCall.p50===null?null:totals.secondsPerCall.p50*1000)} s, max ${sec(totals.secondsPerCall.max===null?null:totals.secondsPerCall.max*1000)} s per call; p50 ${totals.secondsPerTopic.p50.toFixed(1)} s, max ${totals.secondsPerTopic.max.toFixed(1)} s per topic`);

 // the artifacts
 const out=path.join(repo,'artifacts');fs.mkdirSync(out,{recursive:true});
 const base=path.join(out,stub?'calc-model-yield-stub':'calc-model-yield');
 fs.writeFileSync(`${base}.json`,JSON.stringify(report,null,1));
 const md=[`# Calculus model yield - ${report.when}`,'',`Engine: ${report.engine} (model 'fast'), sets of ${n}. Yield is survived / asked for a topic, survived / offered for a shape.`,'',
  '| topic | shapes | set | kept | rounds | asked | returned | survived | yield | seconds | error |','|---|---|---|---|---|---|---|---|---|---|---|',
  ...report.topics.map((r)=>`| ${r.topic} | ${r.shapes.join(', ')} | ${r.ok?'yes':'no'} | ${r.kept}/${n} | ${r.rounds} | ${r.asked} | ${r.returned} | ${r.survived} | ${fmt(r.yield)} | ${sec(r.ms)} | ${r.error??''} |`),
  '','| shape | offered | survived | kept | yield | p50 s | max s |','|---|---|---|---|---|---|---|',
  ...Object.entries(report.shapes).map(([k,s])=>`| ${k} | ${s.offered} | ${s.survived} | ${s.kept} | ${fmt(s.yield)} | ${s.seconds.p50.toFixed(1)} | ${s.seconds.max.toFixed(1)} |`),
  '','| refused because | count |','|---|---|',...Object.entries(report.reasons).map(([k,v])=>`| ${k} | ${v} |`),
  '',`**Totals:** ${totals.sets}/${totals.topics} sets made, ${totals.failed} failed; survived ${totals.survived} of ${totals.asked} asked (yield ${fmt(totals.yield)}); ${totals.returned} returned; ${totals.kept} kept; ${totals.strictBreaks} broke the strict item schema; ${totals.calls} model calls.`,''].join('\n');
 fs.writeFileSync(`${base}.md`,md);
 console.log(`\nwrote ${path.relative(repo,base)}.json and .md`);

 fs.rmSync(data,{recursive:true,force:true});
 const low=minYield!==null&&(totals.yield??0)<minYield;
 if(low)console.log(`overall yield ${fmt(totals.yield)} is below --min-yield ${minYield}`);
 // the session store keeps a ticker alive; the probe is done
 process.exit(low?1:0);
})().catch((e)=>{console.error(e);process.exit(1);});
