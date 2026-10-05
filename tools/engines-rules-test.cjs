/**
 * The engine contract: the caller's schema is enforced the same way for every provider, a malformed answer is a
 * typed EngineError, and every engine is stubbed through one registry. Run with npm test in desk/ (directly:
 * node tools/engines-rules-test.cjs). No model or CLI is called; a disposable data directory under the OS temp
 * dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`eng-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
after(()=>fs.rmSync(data,{recursive:true,force:true}));

// Three 40-second windows of a real lesson id, so retrieval has something to choose between.
const LESSON='jWpiMu5LNdg';
const stamp=(s)=>`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.000`;
const cue=(s,text)=>`${stamp(s)} --> ${stamp(s+4)}\n${text}\n`;
fs.mkdirSync(path.join(data,'lessons'),{recursive:true});
fs.writeFileSync(path.join(data,'lessons',`${LESSON}.en.vtt`),['WEBVTT\n',cue(0,'welcome to equations'),cue(20,'an equation is a balance'),cue(45,'add the same to both sides'),cue(70,'subtract to undo addition'),cue(95,'divide to undo multiplication'),cue(110,'so x is alone')].join('\n'));

const load=(f)=>require(path.join(root,'src/lib',f));
const reg=()=>load('engines/registry.ts');
const engineError=()=>load('engines/types.ts').EngineError;
const stubText=(raw)=>reg().useProvider('text',{name:'stub',run:async()=>({raw})});
const isShape=(p)=>(e)=>{assert(e instanceof engineError(),`an EngineError, got ${e&&e.constructor&&e.constructor.name}: ${e&&e.message}`);assert.equal(e.kind,'shape');if(p!==undefined)assert.equal(e.path,p);return true;};
const HINT={type:'object',properties:{hint:{type:'string'}},required:['hint']};
afterEach(()=>{try{reg().resetProviders();}catch{/* the registry does not exist yet */}});

test('case 1: prose where a shape was asked for is a shape EngineError, not a string typed as the shape',async()=>{
 stubText('Sure! Here is the hint: look at x');
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',schema:HINT}),(e)=>{isShape()(e);assert.equal(e.provider,'stub');return true;});
});

test('case 2: one fence rule for every provider: a fenced JSON answer resolves to its object',async()=>{
 stubText('```json\n{"hint":"Look at x"}\n```');
 const {text}=load('engines/text.ts');
 const r=await text({system:'s',prompt:'p',schema:HINT});
 assert.deepEqual(r.json,{hint:'Look at x'});assert.equal(r.provider,'stub');
});

test('case 3: an isolated call is held to the schema too: an overlong reply names its path',async()=>{
 stubText({reply:'x'.repeat(400)});
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',isolated:true,schema:{type:'object',properties:{reply:{type:'string',maxLength:230}},required:['reply']}}),isShape('reply'));
});

test('case 4: an answer outside Linga\'s judge schema (enum, additionalProperties:false) names the field',async()=>{
 const {BANDS}=load('english/types.ts');
 const str=(maxLength,minLength=1)=>({type:'string',maxLength,minLength});
 const props={answered:{type:'string',enum:['yes','partly','no']},english:{type:'string',enum:[...BANDS,'none']},quote:str(240,0),note:str(160)};
 const judgeSchema={type:'object',additionalProperties:false,properties:props,required:Object.keys(props)};
 stubText({answered:'maybe',english:'B1',quote:'',note:'ok',extra:1});
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',isolated:true,schema:judgeSchema}),(e)=>{isShape('answered')(e);assert.match(e.message,/extra/,'the unexpected property is reported as well');return true;});
});

test('case 5: pickLesson with a non-string lesson rejects with a shape EngineError, not a TypeError',async()=>{
 stubText({lesson:42,why:'x'});
 const {pickLesson}=load('desk/pick.ts');
 await assert.rejects(pickLesson('maths','2x+3=7'),isShape('lesson'));
});

test('case 6: retrieval reads and caches under DESK_DATA_DIR and seeks to the nearest window; desk/data is untouched',async()=>{
 const deskCache=path.join(root,'data','embeddings.json');
 const before=fs.existsSync(deskCache)?fs.statSync(deskCache).mtimeMs:null;
 stubText({lesson:LESSON,why:'chosen because your problem needs …'});
 const {lessonWindows}=load('library/lessons.ts');
 const w=lessonWindows(LESSON);
 assert(w.length>=3,`the seeded transcript has at least three windows (got ${w.length})`);
 const unit=(i)=>w.map((_,j)=>j===i?1:0);
 reg().useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.length===1?[unit(2)]:texts.map((_,i)=>unit(i))})});
 const {pickLesson}=load('desk/pick.ts');
 const pick=await pickLesson('maths','2x+3=7');
 assert.equal(pick.id,LESSON);assert.equal(pick.t,w[2].t);
 assert(fs.existsSync(path.join(data,'embeddings.json')),'the vector cache is written under DESK_DATA_DIR');
 assert.equal(fs.existsSync(deskCache)?fs.statSync(deskCache).mtimeMs:null,before,'desk/data/embeddings.json is not written');
});

test('case 7: the registry names the active text provider from DESK_TEXT_ENGINE without spawning either CLI',()=>{
 const cp=require('node:child_process'),spawn=cp.spawn;let spawned=0;cp.spawn=(...a)=>{spawned++;return spawn(...a);};
 try{
  load('engines/text.ts');const {activeProvider}=reg();
  delete process.env.DESK_TEXT_ENGINE;assert.equal(activeProvider('text'),'claude-cli');
  process.env.DESK_TEXT_ENGINE='codex';assert.equal(activeProvider('text'),'codex');
  reg().useProvider('text',{name:'stub',run:async()=>({raw:'{}'})});assert.equal(activeProvider('text'),'stub');
  assert.equal(spawned,0);
 }finally{cp.spawn=spawn;delete process.env.DESK_TEXT_ENGINE;}
});

test('GUARD case 8: the CJS export patching the rules suites use still reaches the callers',async()=>{
 const engine=load('engines/text.ts'),eye=load('engines/vision.ts'),real=engine.text,realVision=eye.vision;
 try{
  engine.text=async()=>({json:{lesson:'none',why:'x'},provider:'test',ms:1});
  const {pickLesson}=load('desk/pick.ts');
  assert.equal(await pickLesson('maths','2x+3=7'),null);
  const look=async()=>({json:{items:[]},provider:'test',ms:1});eye.vision=look;assert.equal(eye.vision,look);
 }finally{engine.text=real;eye.vision=realVision;}
});

// One re-ask, only for strings past their maxLength, only when the caller asks for it (Linga's calls pass shorten).
const PLAN={type:'object',additionalProperties:false,properties:{topics:{type:'array',items:{type:'object',additionalProperties:false,properties:{why:{type:'string',maxLength:20,minLength:1},skill:{type:'string',enum:['ask','tell']}},required:['why','skill']}}},required:['topics']};
const stubSeq=(...raws)=>{const prompts=[];reg().useProvider('text',{name:'stub',run:async(req)=>{prompts.push(req.prompt);const r=raws[Math.min(prompts.length-1,raws.length-1)];if(r instanceof Error)throw r;return {raw:r};}});return prompts;};

test('case 9: an answer broken only by overlong strings is re-asked once with each overrun named, and the fitting second answer is accepted',async()=>{
 const prompts=stubSeq({topics:[{why:'x'.repeat(25),skill:'ask'},{why:'ok',skill:'tell'}]},{topics:[{why:'short now',skill:'ask'},{why:'ok',skill:'tell'}]});
 const {text}=load('engines/text.ts');
 const r=await text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true});
 assert.deepEqual(r.json.topics.map(t=>t.why),['short now','ok']);
 assert.equal(prompts.length,2,'exactly one extra call');
 assert.match(prompts[1],/^p\n/,'the re-ask keeps the original prompt');
 assert.match(prompts[1],/Shorten: topics\[0\]\.why is 25 characters, at most 20\./,'the overrun is named with its limit');
});

test('case 10: a break that is not a length overrun is not re-asked: the first rejection stands, one call',async()=>{
 const prompts=stubSeq({topics:[{why:'x'.repeat(25),skill:'sing'}]},{topics:[{why:'fine',skill:'ask'}]});
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true}),(e)=>{isShape('topics[0].why')(e);assert.match(e.message,/sing/);return true;});
 assert.equal(prompts.length,1,'no re-ask when an enum is broken too');
 const plain=stubSeq({topics:[{why:'x'.repeat(25),skill:'ask'}]},{topics:[{why:'fine',skill:'ask'}]});
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true}),isShape('topics[0].why'));
 assert.equal(plain.length,1,'no re-ask without shorten');
});

test('case 11: a second answer that still fails, or a re-ask that errors, ends in the original rejection',async()=>{
 const {text}=load('engines/text.ts');
 const long={topics:[{why:'x'.repeat(25),skill:'ask'}]};
 const prompts=stubSeq(long,{topics:[{why:'y'.repeat(30),skill:'ask'},{why:'z'.repeat(40),skill:'tell'}]});
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true}),(e)=>{isShape('topics[0].why')(e);assert.match(e.message,/25 characters, at most 20/);assert.doesNotMatch(e.message,/30 characters|topics\[1\]/);return true;});
 assert.equal(prompts.length,2,'at most one extra call');
 const again=stubSeq(long,new (engineError())('timeout','stub','too slow'));
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true}),(e)=>{isShape('topics[0].why')(e);assert.match(e.message,/25 characters/);return true;});
 assert.equal(again.length,2);
});

test('case 12: thinking:false gives the claude child MAX_THINKING_TOKENS=0; any other request leaves the environment as it is',()=>{
 const {childEnv}=load('engines/text.ts');
 const prior=process.env.MAX_THINKING_TOKENS;delete process.env.MAX_THINKING_TOKENS;
 try{
  assert.equal(childEnv({thinking:false}).MAX_THINKING_TOKENS,'0');
  assert.equal(childEnv({}).MAX_THINKING_TOKENS,undefined);
  assert.equal(childEnv({thinking:true}).MAX_THINKING_TOKENS,undefined);
  assert.equal(childEnv({thinking:false}).PATH??childEnv({thinking:false}).Path,process.env.PATH??process.env.Path,'the rest of the environment is kept');
 }finally{if(prior!==undefined)process.env.MAX_THINKING_TOKENS=prior;}
});

// One call core (engines/call.ts): a deadline, an abort signal and a typed error for every provider.
const KINDS=['text','vision','embed','speak','listen'];
const ASK={
 text:(o)=>load('engines/text.ts').text({system:'s',prompt:'p',...o}),
 vision:(o)=>load('engines/vision.ts').vision({imageBase64:'aGk=',prompt:'p',...o}),
 embed:(o)=>load('engines/embed.ts').embed({texts:['a'],...o}),
 speak:(o)=>load('engines/voice.ts').speak({text:'hello',...o}),
 listen:(o)=>load('engines/listen.ts').listen(new Blob(['x']),'a.webm',o),
};
const ANSWER={text:{hint:'x'},vision:{items:[]},embed:[[1]],speak:Buffer.from('x'),listen:{text:'hi'}};
const sentinel=(ms)=>new Promise((_,rej)=>setTimeout(()=>rej(new Error(`still pending after ${ms} ms: the call hung`)),ms).unref());
const within=(p,ms=1000)=>Promise.race([p,sentinel(ms)]);

test('case 13: a provider that never settles ends in an EngineError timeout within the deadline, for all five kinds',async()=>{
 for(const k of KINDS){
  reg().useProvider(k,{name:'stub',run:()=>new Promise(()=>{})});
  const t0=Date.now();
  await assert.rejects(within(ASK[k]({timeoutMs:25})),(e)=>{assert(e instanceof engineError(),`${k}: an EngineError, got ${e&&e.message}`);assert.equal(e.kind,'timeout',k);assert.equal(e.provider,'stub',k);return true;});
  assert(Date.now()-t0<1000,`${k} rejected promptly`);
  reg().resetProviders(k);
 }
});

test('case 14: the provider is handed { signal }: aborted after a timeout, not after a fast success',async()=>{
 for(const k of KINDS){
  let seen;
  reg().useProvider(k,{name:'stub',run:(req,ctx)=>{seen=ctx&&ctx.signal;return new Promise(()=>{});}});
  await assert.rejects(within(ASK[k]({timeoutMs:25})),()=>true);
  assert(seen&&typeof seen.aborted==='boolean',`${k}: run received a signal`);
  assert.equal(seen.aborted,true,`${k}: aborted on the deadline`);
  let fast;
  reg().useProvider(k,{name:'stub',run:async(req,ctx)=>{fast=ctx&&ctx.signal;return {raw:ANSWER[k]};}});
  await within(ASK[k]({timeoutMs:5000}));
  assert(fast&&typeof fast.aborted==='boolean',`${k}: run received a signal on success`);
  assert.equal(fast.aborted,false,`${k}: not aborted after success`);
  reg().resetProviders(k);
 }
});

test('case 15: a provider that throws a plain Error is an EngineError exit with the first line; an EngineError passes through untouched',async()=>{
 for(const k of KINDS){
  reg().useProvider(k,{name:'stub',run:async()=>{throw new Error('spawn piper ENOENT\n  at x');}});
  await assert.rejects(within(ASK[k]({})),(e)=>{assert(e instanceof engineError(),`${k}: an EngineError, got ${e&&e.constructor&&e.constructor.name}`);assert.equal(e.kind,'exit',k);assert.equal(e.provider,'stub',k);assert.equal(e.message,'spawn piper ENOENT',k);return true;});
  const typed=new (engineError())('unreachable','stub','x');
  reg().useProvider(k,{name:'stub',run:async()=>{throw typed;}});
  await assert.rejects(within(ASK[k]({})),(e)=>{assert.equal(e,typed,`${k}: the same object`);assert.equal(e.kind,'unreachable',k);return true;});
  reg().resetProviders(k);
 }
});

test('case 16: deadlineFor takes the request, else the kind\'s default, floored by the provider\'s own',()=>{
 const {DEADLINE_MS,deadlineFor}=load('engines/call.ts');
 for(const k of KINDS)assert(Number.isFinite(DEADLINE_MS[k])&&DEADLINE_MS[k]>0,`${k} has a deadline`);
 assert.equal(deadlineFor('text',{name:'p'},{}),DEADLINE_MS.text);
 assert.equal(deadlineFor('text',{name:'p',deadlineMs:240000},{timeoutMs:90000}),240000);
 assert.equal(deadlineFor('vision',{name:'p'},{timeoutMs:5000}),5000);
 assert.equal(load('engines/codex.ts').codexCli.deadlineMs,240000);
 assert.equal(load('engines/text.ts').claudeCli.deadlineMs,undefined);
 assert.equal(deadlineFor('text',load('engines/codex.ts').codexCli,{timeoutMs:90000}),240000,'codex floor survives the move');
});

test('case 17: a shorten re-ask that never settles ends in the first shape rejection, after exactly two provider calls',async()=>{
 let calls=0;
 reg().useProvider('text',{name:'stub',run:async()=>{calls++;if(calls===1)return {raw:{topics:[{why:'x'.repeat(25),skill:'ask'}]}};return new Promise(()=>{});}});
 const {text}=load('engines/text.ts');
 await assert.rejects(within(text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true,timeoutMs:30})),(e)=>{isShape('topics[0].why')(e);assert.match(e.message,/25 characters/);return true;});
 assert.equal(calls,2);
});

test('GUARD case 18: a stub that answers at once resolves with its provider and ms for all five kinds',async()=>{
 for(const k of KINDS){
  reg().useProvider(k,{name:'stub',run:async()=>({raw:ANSWER[k]})});
  const r=await within(ASK[k]({}));
  assert.equal(r.provider,'stub',k);assert.equal(typeof r.ms,'number',k);
  reg().resetProviders(k);
 }
});

// The engine check (engines/health.ts, GET /api/smoke): which provider would run, whether it answers, what to fix.
const health=()=>load('engines/health.ts');
// the route reads the caller's role through pairing.ts, which loads the session store and its ticker
after(()=>{if(globalThis.__desk&&globalThis.__desk.ticker)clearInterval(globalThis.__desk.ticker);});
const nap=(ms)=>new Promise((r)=>setTimeout(r,ms));
const LIVE={text:{ok:'yes'},vision:{title:'t'},embed:[[1]],speak:Buffer.from('x'),listen:{text:'hi'}};
/** A stub for every kind with a probe and a run, both counted; `over[kind]` replaces fields (probe: null drops it). */
const stubAll=(over={},delay=0)=>{
 const n={run:{},probe:{}};
 for(const k of KINDS){
  n.run[k]=0;n.probe[k]=0;
  const p={name:'stub',run:async()=>{n.run[k]++;if(delay)await nap(delay);return {raw:LIVE[k]};},probe:async()=>{n.probe[k]++;return {ok:true,say:'fine'};},...(over[k]||{})};
  if(over[k]&&over[k].probe===null)delete p.probe;
  reg().useProvider(k,p);
 }
 return n;
};

test('case 19: the status asks each kind\'s active provider for its probe: five rows in order, no run()',async()=>{
 const n=stubAll();
 const rows=await health().engineStatus();
 assert.deepEqual(rows.map(r=>r.kind),['text','vision','embed','speak','listen']);
 for(const r of rows){assert.equal(r.provider,'stub',r.kind);assert.equal(r.ok,true,r.kind);assert.equal(r.say,'fine',r.kind);assert.equal(typeof r.ms,'number',r.kind);}
 for(const k of KINDS){assert.equal(n.run[k],0,`${k}: no run() call`);assert.equal(n.probe[k],1,`${k}: one probe`);}
});

test('case 20: a probe that never answers is one not-ok row at the budget; the others are unaffected and the round is parallel',async()=>{
 stubAll({listen:{probe:()=>new Promise(()=>{})}});
 const t0=Date.now();
 const rows=await health().engineStatus(30);
 assert(Date.now()-t0<500,`returned in ${Date.now()-t0} ms`);
 const listen=rows.find(r=>r.kind==='listen');
 assert.equal(listen.ok,false);assert.match(listen.say,/did not answer/);
 for(const r of rows.filter(r=>r.kind!=='listen'))assert.equal(r.ok,true,r.kind);
});

test('case 21: a provider with no probe is ok:null and says how to find out; never ok:true on no evidence',async()=>{
 stubAll({embed:{probe:null}});
 const rows=await health().engineStatus();
 const embedRow=rows.find(r=>r.kind==='embed');
 assert.equal(embedRow.ok,null);assert.match(embedRow.say,/\?live=1/);
 assert.equal(embedRow.provider,'stub');
});

test('case 22: the real ollama probes read /api/tags: a missing model says what to pull, an unreachable host says what to start',async()=>{
 const real=globalThis.fetch,host=(process.env.OLLAMA_HOST||'http://127.0.0.1:11434').replace(/\/$/,'');
 try{
  globalThis.fetch=async(url)=>{
   if(String(url).endsWith('/api/tags'))return new Response(JSON.stringify({models:[{name:'nomic-embed-text:latest'}]}),{status:200});
   throw new Error('connect ECONNREFUSED');
  };
  let rows=await health().engineStatus(1500);
  const by=(k)=>rows.find(r=>r.kind===k);
  assert.equal(by('vision').provider,'ollama');assert.equal(by('vision').ok,false);assert.match(by('vision').say,/ollama pull qwen3\.8:27b/);
  assert.equal(by('embed').ok,true);
  globalThis.fetch=async()=>{throw new Error('connect ECONNREFUSED');};
  rows=await health().engineStatus(1500);
  for(const k of ['vision','embed']){assert.equal(by(k).ok,false,k);assert(by(k).say.includes(host),`${k}: names the host`);assert.match(by(k).say,/ollama serve/,k);}
 }finally{globalThis.fetch=real;}
});

test('case 23: a live check runs text, vision, embed and speak side by side, listen as a probe; a failure is a typed row with no engine text',async()=>{
 const n=stubAll({},40);
 const t0=Date.now();
 const r=await health().engineCheck({live:true,sample:'aGk='});
 const took=Date.now()-t0;
 assert(took<120,`parallel: ${took} ms (the serial sum is 160)`);
 assert.deepEqual(r.map(x=>x.kind),['text','vision','embed','speak','listen']);
 for(const k of ['text','vision','embed','speak']){assert.equal(n.run[k],1,`${k} ran`);const row=r.find(x=>x.kind===k);assert.equal(row.ok,true,k);assert.equal(row.provider,'stub',k);assert(row.ms>=30,`${k} reports the engine's ms (${row.ms})`);}
 assert.equal(n.run.listen,0,'listen is not run');assert.equal(n.probe.listen,1);
 assert.equal(r.find(x=>x.kind==='listen').say,'fine');
 // a failing engine: the row names the kind of failure, the detail goes to the log
 reg().resetProviders();
 const EE=engineError();
 stubAll({text:{run:async()=>{throw new EE('timeout','stub','sk-live-123 upstream said no');}}});
 const logged=[],orig=console.error;console.error=(...a)=>logged.push(a.map(String).join(' '));
 let bad;try{bad=await health().engineCheck({live:true,sample:'aGk='});}finally{console.error=orig;}
 const row=bad.find(x=>x.kind==='text');
 assert.equal(row.ok,false);assert.equal(row.error.kind,'timeout');assert.equal(typeof row.error.say,'string');assert(row.error.say.length>0);
 assert.equal(JSON.stringify(bad).includes('sk-live-123'),false,'no engine text in the result');
 assert(logged.some(l=>l.includes('sk-live-123')),'the detail is in the server log');
 assert.equal(bad.filter(x=>x.ok===true).length,4,'the other rows are unaffected');
});

test('case 24: GET /api/smoke is a probe round for the TV and in-process callers, a 403 for a phone, a live run only on ?live=1',async()=>{
 fs.writeFileSync(path.join(data,'sample.jpg'),'x');
 const route=require(path.join(root,'src/app/api/smoke/route.ts'));
 const ask=(q,role)=>route.GET(new Request(`http://desk/api/smoke${q}`,{headers:role?{'x-desk-role':role}:{}}));
 let n=stubAll();
 let r=await ask('');
 assert.equal(r.status,200);let body=await r.json();
 assert.equal(body.engines.length,5);assert.equal(body.live,false);
 for(const k of KINDS){assert.equal(n.run[k],0,`${k}: no run()`);}
 const probed=KINDS.reduce((s,k)=>s+n.probe[k],0);assert.equal(probed,5);
 for(const role of ['phone','guest']){
  for(const q of ['','?live=1']){
   r=await ask(q,role);assert.equal(r.status,403,`${role}${q}`);
  }
 }
 assert.equal(KINDS.reduce((s,k)=>s+n.probe[k],0),5,'a refused phone touched no probe');
 assert.equal(KINDS.reduce((s,k)=>s+n.run[k],0),0,'a refused phone ran nothing');
 r=await ask('',  'tv');assert.equal(r.status,200);
 reg().resetProviders();n=stubAll();
 r=await ask('?live=1','tv');assert.equal(r.status,200);body=await r.json();
 assert.equal(body.live,true);assert.equal(body.engines.length,5);
 for(const k of ['text','vision','embed','speak'])assert.equal(n.run[k],1,`${k} ran live`);
 assert.equal(n.run.listen,0);
});
