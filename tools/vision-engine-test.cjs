/**
 * The vision engine's second and third providers (DESK_VISION_ENGINE=claude-cli | codex), held to the same contract as
 * ollama: the choice rule, the caller's schema, the typed errors, and the temp dir each call leaves nothing of. Run with
 * npm test in desk/ (directly: node tools/vision-engine-test.cjs). No CLI is started: node:child_process.spawn is replaced
 * by a scripted child for the whole suite, and a disposable data directory under the OS temp dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`vis-${Date.now()}`);process.env.DESK_DATA_DIR=data;fs.mkdirSync(data,{recursive:true});
for(const k of ['DESK_VISION_ENGINE','CLAUDE_VISION_MODEL','CLAUDE_BEST_MODEL','UAT_CODEX_MODEL'])delete process.env[k];
after(()=>fs.rmSync(data,{recursive:true,force:true}));

// ---- the scripted child: every spawn in this suite lands here, none reaches a real binary
const cp=require('node:child_process'),realSpawn=cp.spawn;
let script=null;const spawns=[];
cp.spawn=(cmd,args,opts)=>{
 const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();
 const seen={cmd,args,opts,input:'',cwdExisted:!!(opts&&opts.cwd&&fs.existsSync(opts.cwd)),killed:false};spawns.push(seen);
 let closed=false;const close=(code)=>{if(!closed){closed=true;child.emit('close',code);}};
 child.kill=()=>{seen.killed=true;setImmediate(()=>close(null));return true;};
 child.stdin=new EventEmitter();
 child.stdin.end=(input)=>{seen.input=String(input??'');setImmediate(async()=>{
  const r=script?await script(seen):{hang:true};
  if(r.hang)return;
  if(r.error){child.emit('error',new Error(r.error));return;}
  if(r.stdout)child.stdout.emit('data',r.stdout);
  if(r.stderr)child.stderr.emit('data',r.stderr);
  close(r.code??0);
 });};
 return child;
};
after(()=>{cp.spawn=realSpawn;});

const load=(f)=>require(path.join(root,'src/lib',f));
const reg=()=>load('engines/registry.ts');
const EngineError=()=>load('engines/types.ts').EngineError;
const eye=()=>load('engines/vision.ts');
afterEach(()=>{script=null;spawns.length=0;delete process.env.DESK_VISION_ENGINE;try{reg().resetProviders();}catch{}});

const JPEG=fs.readFileSync(path.join(root,'public/samples/maths.jpg')).toString('base64');
const PNG='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const ITEMS={type:'object',properties:{items:{type:'array',items:{type:'object',properties:{number:{type:'integer'},text:{type:'string'},y:{type:'number'},x:{type:'number'}},required:['number','text','y','x']}}},required:['items']};
const READ={items:[{number:1,text:'2x+3=7',y:0.2,x:0.1}]};
/** The stream-json the CLI prints: an init line, the assistant's turn, then the result envelope last. */
const stream=(envelope)=>[JSON.stringify({type:'system',subtype:'init',tools:[]}),JSON.stringify({type:'assistant',message:{content:[{type:'text',text:'…'}]}}),JSON.stringify({type:'result',subtype:'success',is_error:false,stop_reason:'end_turn',total_cost_usd:0.015,usage:{input_tokens:2,output_tokens:22,cache_read_input_tokens:0,cache_creation_input_tokens:3644},...envelope})].join('\n')+'\n';
const answering=(result,extra={})=>async()=>({stdout:stream({result:typeof result==='string'?result:JSON.stringify(result),...extra})});
const ask=(o={})=>eye().vision({imageBase64:JPEG,prompt:'List the problems.',schema:ITEMS,use:'test',...o});
const kindIs=(kind,provider)=>(e)=>{assert(e instanceof EngineError(),`an EngineError, got ${e&&e.constructor&&e.constructor.name}: ${e&&e.message}`);assert.equal(e.kind,kind,e.message);if(provider)assert.equal(e.provider,provider);return true;};
const gone=async(dir)=>{for(let i=0;i<50&&fs.existsSync(dir);i++)await new Promise(r=>setTimeout(r,10));return !fs.existsSync(dir);};

test('case 1: DESK_VISION_ENGINE picks the vision provider; unset or blank stays ollama; nothing is started',()=>{
 const {activeProvider}=reg();eye();
 assert.equal(activeProvider('vision'),'ollama');
 process.env.DESK_VISION_ENGINE='  ';assert.equal(activeProvider('vision'),'ollama');
 for(const name of ['claude-cli','codex','ollama']){process.env.DESK_VISION_ENGINE=name;assert.equal(activeProvider('vision'),name);assert.equal(reg().provider('vision').name,name);}
 assert.deepEqual([...eye().VISION_ENGINES].sort(),['claude-cli','codex','ollama']);
 reg().useProvider('vision',{name:'stub',run:async()=>({raw:READ})});assert.equal(activeProvider('vision'),'stub','a test stub still wins over the env');
 assert.equal(spawns.length,0);
});

test('case 2: an unknown DESK_VISION_ENGINE is refused as unreachable, and the engine check names it',async()=>{
 process.env.DESK_VISION_ENGINE='gemini';
 assert.throws(()=>reg().provider('vision'),kindIs('unreachable'));
 const rows=await load('engines/health.ts').engineStatus(500);const v=rows.find(r=>r.kind==='vision');
 assert.equal(v.provider,'gemini');assert.equal(v.ok,false);assert.match(v.say,/no provider named gemini/);
 assert.equal(spawns.length,0);
});

test('case 3: claude-cli reads the page inline: no tool, no file, stream-json in and out, the schema in the instructions',async()=>{
 process.env.DESK_VISION_ENGINE='claude-cli';script=answering(READ);
 const r=await ask();
 assert.deepEqual(r.json,READ);assert.equal(r.provider,'claude-cli/sonnet');
 assert.equal(spawns.length,1);const s=spawns[0],a=s.args;
 assert.equal(a[a.indexOf('--tools')+1],'','the model gets no tool at all');
 for(const f of ['--allowedTools','--allowed-tools','--add-dir','--dangerously-skip-permissions','--permission-mode','--json-schema'])assert(!a.includes(f),`no ${f}`);
 for(const f of ['-p','--no-session-persistence','--safe-mode','--strict-mcp-config','--disable-slash-commands','--verbose'])assert(a.includes(f),`has ${f}`);
 assert.equal(a[a.indexOf('--input-format')+1],'stream-json');assert.equal(a[a.indexOf('--output-format')+1],'stream-json');
 assert.equal(a[a.indexOf('--model')+1],'sonnet');
 assert(a[a.indexOf('--system-prompt')+1].includes(JSON.stringify(ITEMS)),'the schema is written into the instructions');
 const msg=JSON.parse(s.input.trim());assert.equal(msg.type,'user');
 const [img,txt]=msg.message.content;
 assert.deepEqual(img,{type:'image',source:{type:'base64',media_type:'image/jpeg',data:JPEG}});
 assert.deepEqual(txt,{type:'text',text:'List the problems.'});
 assert(!a.some(x=>x.includes(JPEG.slice(0,64))),'the image never rides on argv');
 assert.equal(s.opts.env.MAX_THINKING_TOKENS,'0','hidden reasoning is off');assert.equal(s.opts.shell,undefined,'no shell');
 assert(s.cwdExisted,'the CLI ran in its own temp dir');assert(await gone(s.opts.cwd),'and the temp dir is removed after');
});

test('case 4: CLAUDE_VISION_MODEL picks the model, and a PNG is sent as one',async()=>{
 process.env.DESK_VISION_ENGINE='claude-cli';process.env.CLAUDE_VISION_MODEL='opus';script=answering(READ);
 try{
  const r=await ask({imageBase64:PNG});assert.equal(r.provider,'claude-cli/opus');
  const a=spawns[0].args;assert.equal(a[a.indexOf('--model')+1],'opus');
  assert.equal(JSON.parse(spawns[0].input).message.content[0].source.media_type,'image/png');
 }finally{delete process.env.CLAUDE_VISION_MODEL;}
});

test('case 5: claude-cli is held to the caller\'s schema: prose and a wrong shape are shape errors, a fenced answer resolves',async()=>{
 process.env.DESK_VISION_ENGINE='claude-cli';
 script=answering('I can see two problems on this page.');
 await assert.rejects(ask(),kindIs('shape','claude-cli/sonnet'));
 script=answering({items:[{number:'one',text:'x',y:0,x:0}]});
 await assert.rejects(ask(),(e)=>{kindIs('shape')(e);assert.equal(e.path,'items[0].number');return true;});
 script=answering('```json\n'+JSON.stringify(READ)+'\n```');
 assert.deepEqual((await ask()).json,READ);
});

test('case 6: claude-cli failures are typed the way text\'s are, and every one leaves no temp dir',async()=>{
 process.env.DESK_VISION_ENGINE='claude-cli';
 const cases=[
  [async()=>({error:'spawn claude ENOENT'}),'unreachable'],
  [async()=>({code:1,stderr:'Not logged in'}),'exit'],
  [answering(READ,{stop_reason:'max_tokens'}),'cutoff'],
  [answering(READ,{stop_reason:'refusal'}),'declined'],
  [answering(READ,{is_error:true,subtype:'error_during_execution',stop_reason:null}),'exit'],
  [async()=>({stdout:JSON.stringify({type:'system',subtype:'init'})+'\n'}),'exit'],
  [async()=>({stdout:'not json at all'}),'exit'],
 ];
 for(const [s,kind] of cases){
  spawns.length=0;script=s;
  await assert.rejects(ask(),kindIs(kind,'claude-cli/sonnet'));
  assert(await gone(spawns[0].opts.cwd),`${kind}: the temp dir is removed`);
 }
});

test('case 7: a claude-cli read past its deadline is a timeout, the child is killed, and the temp dir is removed',async()=>{
 process.env.DESK_VISION_ENGINE='claude-cli';script=async()=>({hang:true});
 await assert.rejects(ask({timeoutMs:60}),kindIs('timeout'));
 const s=spawns[0];assert(await gone(s.opts.cwd),'the temp dir is removed');assert.equal(s.killed,true,'the child is killed on the deadline');
});

test('case 8: a failed claude-cli read still books what the envelope said it spent; an answer books it at the subscription price',async()=>{
 process.env.DESK_VISION_ENGINE='claude-cli';
 const file=path.join(data,`usage-${Date.now()}.jsonl`),was=process.env.DESK_USAGE_FILE;process.env.DESK_USAGE_FILE=file;
 try{
  script=answering(READ);await ask();
  script=answering(READ,{stop_reason:'max_tokens'});await assert.rejects(ask(),kindIs('cutoff'));
  const rows=fs.readFileSync(file,'utf8').trim().split('\n').map(l=>JSON.parse(l));
  assert.equal(rows.length,2);
  for(const r of rows){assert.equal(r.kind,'vision');assert.equal(r.provider,'claude-cli/sonnet');assert.equal(r.basis,'subscription');assert.equal(r.marginalUsd,0);assert.equal(r.tokens.output,22);assert.equal(r.notionalUsd,0.015);}
  assert.deepEqual([rows[0].ok,rows[1].error],[true,'cutoff']);
 }finally{if(was===undefined)delete process.env.DESK_USAGE_FILE;else process.env.DESK_USAGE_FILE=was;}
});

test('case 9: codex gets the page as a temp file (--image=), the schema in the message, and the file is gone after',async()=>{
 process.env.DESK_VISION_ENGINE='codex';
 let seenFile=null,bytes=null;
 script=async(s)=>{
  const img=s.args.find(x=>x.startsWith('--image='));seenFile=img&&img.slice('--image='.length);
  bytes=seenFile&&fs.existsSync(seenFile)?fs.readFileSync(seenFile):null;
  fs.writeFileSync(s.args[s.args.indexOf('-o')+1],JSON.stringify(READ));
  return {code:0};
 };
 const r=await ask();
 assert.deepEqual(r.json,READ);assert.match(r.provider,/^codex\//);
 const a=spawns[0].args;
 assert(seenFile&&seenFile.endsWith('.jpg'),'a JPEG is written as .jpg');assert(seenFile.startsWith(os.tmpdir()),'under the OS temp dir');
 assert.deepEqual(bytes,Buffer.from(JPEG,'base64'),'the file holds the page bytes');
 assert(!a.includes('--output-schema'),'no decoder schema: the page schemas have optional parts');
 assert.equal(a[a.length-1],'-','the message still comes in on stdin, after the image');
 assert(spawns[0].input.includes(JSON.stringify(ITEMS)),'the schema is in the message');
 assert(await gone(path.dirname(seenFile)),'the image and its dir are removed');
});

test('case 10: a failing codex read is typed and still removes its image',async()=>{
 process.env.DESK_VISION_ENGINE='codex';
 let seenFile=null;
 script=async(s)=>{seenFile=s.args.find(x=>x.startsWith('--image=')).slice(8);return {code:2,stderr:'model not found'};};
 await assert.rejects(ask(),kindIs('exit'));
 assert(await gone(path.dirname(seenFile)),'the image dir is removed');
 script=async(s)=>{fs.writeFileSync(s.args[s.args.indexOf('-o')+1],'the page shows sums');return {code:0};};
 await assert.rejects(ask(),kindIs('shape'));
});

test('case 11: the engine check names the chosen vision provider and its probe says what to fix, without starting it',async()=>{
 process.env.DESK_VISION_ENGINE='claude-cli';
 const v=(await load('engines/health.ts').engineStatus(1500)).find(r=>r.kind==='vision');
 assert.equal(v.provider,'claude-cli');assert.equal(typeof v.ok,'boolean');
 assert.match(v.say,v.ok?/is installed \(vision model sonnet\)/:/not on PATH: install the Claude CLI, or set CLAUDE_BIN/);
 assert.equal(spawns.length,0,'a probe starts nothing');
});
