/**
 * EC1 sample: LIVE, claude CLI only, not a rules suite - never listed in rulesSuites, never run in a gate.
 *
 * It measures what a real hint, lesson pick and practice set cost through the claude CLI on the subscription, by
 * reading the usage ledger (engines/meter.ts) the calls leave. Usage: node tools/econ-sample.cjs <out-dir>
 * (run from desk/; the ledger and a scratch data dir go to a fresh temp dir OUTSIDE the repo, then the rows are
 * copied verbatim to <out-dir>/ec1-sample-2026-10-10.jsonl). Workload, all on the fast model, at most 20 claude
 * calls: hint stage 1, hint stage 2 and the lesson pick on the three HL13 probe problems (POST /api/hint, driven as
 * tools/withhold-rules-test.cjs case 16 drives it, with the real text provider), then two practice sets through
 * makeItems (one school topic, one Calculus 1 topic). Embed and vision are stubbed, never live.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const outDir=path.resolve(process.argv[2]||path.join(__dirname,'../docs/economics'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'desk-econ-sample-'));
if(path.relative(path.resolve(__dirname,'..'),tmp).startsWith('..')===false)throw new Error('the scratch dir must be outside the repo');
process.env.DESK_DATA_DIR=tmp;process.env.DESK_USAGE_FILE=path.join(tmp,'usage.jsonl');
delete process.env.DESK_TEXT_ENGINE;delete process.env.ANTHROPIC_API_KEY;delete process.env.DESK_USAGE_MAX_BYTES;
const load=(f)=>require(path.join(root,'src/lib',f));
const reg=load('engines/registry.ts');
const MAX=20;
const rows=()=>fs.existsSync(process.env.DESK_USAGE_FILE)?fs.readFileSync(process.env.DESK_USAGE_FILE,'utf8').split('\n').filter(Boolean).map((l)=>JSON.parse(l)):[];
const live=()=>rows().filter((r)=>r.kind==='text'&&String(r.provider).startsWith('claude-cli'));
const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));
function guard(){if(live().length>=MAX)throw new Error(`stopped at ${MAX} claude calls`);}

(async()=>{
 reg.useProvider('embed',{name:'stub',run:async(req)=>({raw:req.texts.map(()=>[1,0])})});
 reg.useProvider('vision',{name:'stub',run:async()=>{throw new Error('vision is not live in the sample');}});
 const store=load('session/store.ts');
 const hintRoute=require(path.join(root,'src/app/api/hint/route.ts'));
 const {pickLesson}=load('desk/pick.ts');
 const {makeItems}=load('desk/items.ts');
 const probes=[
  {id:'word',problem:'Sara has some sweets. She gives away 7 and has 12 left. How many did she start with?',system:undefined},
  {id:'cz',problem:'Řeš rovnici: 0,5x + 2 = 7',system:'cz'},
  {id:'der',problem:'Find the derivative of f(x) = x^2 at x = 3.',system:undefined},
 ];
 for(const p of probes){
  guard();
  store.dispatch({type:'reset'});
  store.dispatch({type:'profile.draft',patch:{id:`sample-${p.id}`,name:'Sample',type:'high-school',age:16,...(p.system?{system:p.system}:{})}});store.dispatch({type:'profile.save'});
  const pg={id:`pg-${p.id}`,subject:'maths',title:'Sheet',img:'',w:100,h:100};
  store.dispatch({type:'page.reading',page:pg});store.dispatch({type:'page.read',id:pg.id,items:[{n:1,text:p.problem,cx:0,cy:0,band:[0,10],key:`k-${p.id}`}],readMs:1,provider:'test'});
  const post=(body)=>hintRoute.POST(new Request('http://desk/api/hint',{method:'POST',body:JSON.stringify(body)}));
  const before=rows().filter((r)=>r.use==='lesson-pick').length;
  let res=await post({});console.log(p.id,'stage 1',res.status);
  guard();res=await post({stage:2});console.log(p.id,'stage 2',res.status);
  // the route's lesson job is background work: wait for it to end
  for(let i=0;i<120&&store.getSession().jobs?.lesson?.phase==='running';i++)await sleep(500);
  if(rows().filter((r)=>r.use==='lesson-pick').length===before){
   // the route skips the library for a school or Calculus task; the pick is still measured, called directly
   guard();try{await pickLesson('maths',p.problem,p.system);}catch(e){console.log(p.id,'pick failed:',e.message);}
  }
 }
 for(const topic of ['linear-one-step','calc1-limit-idea']){
  guard();
  try{const r=await makeItems(topic,'sample-practice',3);console.log(topic,'items',r.items.length,'tries',r.tries);}catch(e){console.log(topic,'failed:',e.message);}
 }
 fs.mkdirSync(outDir,{recursive:true});
 fs.copyFileSync(process.env.DESK_USAGE_FILE,path.join(outDir,'ec1-sample-2026-10-10.jsonl'));
 console.log('claude calls',live().length,'rows',rows().length);
 clearInterval(globalThis.__desk?.ticker);
 fs.rmSync(tmp,{recursive:true,force:true});
 process.exit(0);
})().catch((e)=>{console.error(e);process.exit(1);});
