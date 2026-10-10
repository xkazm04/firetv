/**
 * The economics instrument: every engine call leaves one row in the usage ledger (engines/meter.ts), success or
 * failure, with the provider, the try, the time, the CLI envelope's usage and the price book's marginal cost, and
 * never a prompt, an answer, an image or a learner. Run with npm test in desk/ (directly: node tools/econ-rules-test.cjs).
 * No model is called - every engine is stubbed at the provider seam; a disposable data directory under the OS temp
 * dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after,afterEach,beforeEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=fs.mkdtempSync(path.join(os.tmpdir(),'desk-econ-'));
process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;delete process.env.DESK_USAGE_FILE;delete process.env.DESK_USAGE_MAX_BYTES;
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});

const load=(f)=>require(path.join(root,'src/lib',f));
const reg=load('engines/registry.ts');
const {text,usageOf}=load('engines/text.ts');
load('engines/embed.ts');load('engines/vision.ts');load('engines/voice.ts');load('engines/listen.ts');
const {PRICE_BOOK}=load('engines/prices.ts');
const {EngineError}=load('engines/types.ts');
const LEDGER=path.join(data,'usage.jsonl');
const rows=(f=LEDGER)=>fs.existsSync(f)?fs.readFileSync(f,'utf8').split('\n').filter(Boolean).map((l)=>JSON.parse(l)):[];
beforeEach(()=>{fs.rmSync(LEDGER,{force:true});fs.rmSync(path.join(data,'usage.1.jsonl'),{force:true});});
afterEach(()=>{reg.resetProviders();delete process.env.DESK_USAGE_FILE;delete process.env.DESK_USAGE_MAX_BYTES;});
const stub=(name,raw='{"hint":"x"}',extra={})=>reg.useProvider('text',{name,run:async()=>({raw,...extra})});

test('case a: a stub call writes one row with use, provider, try 1, ok and ms, and the prompt is nowhere in the file',async()=>{
 stub('stub');
 await text({system:'SYSTEM-SECRET-TEXT',prompt:'PROMPT-SECRET-TEXT',use:'hint'});
 const r=rows();assert.equal(r.length,1);
 assert.equal(r[0].v,1);assert.equal(r[0].use,'hint');assert.equal(r[0].provider,'stub');assert.equal(r[0].try,1);assert.equal(r[0].ok,true);assert.equal(r[0].error,null);
 assert.equal(r[0].kind,'text');assert.equal(typeof r[0].ms,'number');assert(!Number.isNaN(Date.parse(r[0].at)));assert.equal(r[0].tokens,null);assert.equal(r[0].notionalUsd,null);
 const file=fs.readFileSync(LEDGER,'utf8');
 assert(!file.includes('PROMPT-SECRET-TEXT')&&!file.includes('SYSTEM-SECRET-TEXT')&&!file.includes('"hint":"x"'));
});

test('case a2: a call with no use label has use null; a provider that reports usage has it on the row',async()=>{
 stub('claude-cli/haiku','{"hint":"x"}',{provider:'claude-cli/haiku',usage:{tokens:{input:3,output:4,cacheRead:null,cacheWrite:5},notionalUsd:0.01}});
 await text({system:'s',prompt:'p'});
 const [r]=rows();assert.equal(r.use,null);assert.equal(r.provider,'claude-cli/haiku');
 assert.deepEqual(r.tokens,{input:3,output:4,cacheRead:null,cacheWrite:5});assert.equal(r.notionalUsd,0.01);
 assert.equal(r.basis,'subscription');assert.equal(r.marginalUsd,0);
});

test('case b: a throwing provider is ok false / exit; a provider past its timeout is ok false / timeout',async()=>{
 reg.useProvider('text',{name:'stub',run:async()=>{throw new Error('boom\nsecond line');}});
 await assert.rejects(()=>text({system:'s',prompt:'p'}),(e)=>e instanceof EngineError&&e.kind==='exit'&&e.message==='boom');
 reg.useProvider('text',{name:'slow',run:()=>new Promise(()=>{})});
 await assert.rejects(()=>text({system:'s',prompt:'p',timeoutMs:30}),(e)=>e instanceof EngineError&&e.kind==='timeout');
 reg.useProvider('text',{name:'gone',run:async()=>{throw new EngineError('unreachable','gone','no');}});
 await assert.rejects(()=>text({system:'s',prompt:'p'}));
 const r=rows();assert.equal(r.length,3);
 assert.deepEqual([r[0].ok,r[0].error,r[0].provider],[false,'exit','stub']);
 assert.deepEqual([r[1].ok,r[1].error,r[1].provider],[false,'timeout','slow']);
 assert.deepEqual([r[2].ok,r[2].error],[false,'unreachable']);
 assert(!fs.readFileSync(LEDGER,'utf8').includes('boom'));
});

test('case c: a shorten re-ask gives two rows, try 1 and try 2, with the same use',async()=>{
 let n=0;
 reg.useProvider('text',{name:'stub',run:async()=>({raw:JSON.stringify({hint:n++===0?'far too long a hint':'ok'})})});
 const r=await text({system:'s',prompt:'p',use:'hint',shorten:true,schema:{type:'object',properties:{hint:{type:'string',maxLength:5}},required:['hint']}});
 assert.equal(r.json.hint,'ok');
 const w=rows();assert.equal(w.length,2);
 assert.deepEqual(w.map((x)=>x.try),[1,2]);assert.deepEqual(w.map((x)=>x.use),['hint','hint']);
});

test('case d: usageOf keeps the four token classes distinct; a missing class is null, not 0; nothing reported is null',()=>{
 const full=usageOf({type:'result',total_cost_usd:0.0123,usage:{input_tokens:11,output_tokens:22,cache_read_input_tokens:33,cache_creation_input_tokens:44}});
 assert.deepEqual(full,{tokens:{input:11,output:22,cacheRead:33,cacheWrite:44},notionalUsd:0.0123});
 const bare=usageOf({usage:{input_tokens:5,output_tokens:6}});
 assert.deepEqual(bare,{tokens:{input:5,output:6,cacheRead:null,cacheWrite:null},notionalUsd:null});
 assert.deepEqual(usageOf({result:'x'}),{tokens:null,notionalUsd:null});
 assert.deepEqual(usageOf(null),{tokens:null,notionalUsd:null});
 assert.equal(usageOf({usage:{input_tokens:0,output_tokens:0}}).tokens.input,0);
});

test('case e: every registered provider has a book entry; an unpriced provider row has marginalUsd null',async()=>{
 const names=reg.registeredProviders();
 for(const n of ['claude-cli','codex','ollama','piper','elevenlabs','gravitone'])assert(names.includes(n),`${n} is registered`);
 for(const n of names)assert(PRICE_BOOK.providers[n],`${n} has a book entry`);
 assert.equal(PRICE_BOOK.asOf,'2026-10-10');
 assert.deepEqual([PRICE_BOOK.providers['claude-cli'].basis,PRICE_BOOK.providers['claude-cli'].marginalUsd],['subscription',0]);
 assert.deepEqual([PRICE_BOOK.providers.ollama.basis,PRICE_BOOK.providers.ollama.marginalUsd],['local',0]);
 for(const n of names.filter((x)=>!['claude-cli','ollama'].includes(x)))assert.deepEqual([PRICE_BOOK.providers[n].basis,PRICE_BOOK.providers[n].marginalUsd],['unpriced',null],n);
 stub('codex');await text({system:'s',prompt:'p'});
 stub('claude-cliX/haiku');await text({system:'s',prompt:'p'});
 const r=rows();assert.deepEqual([r[0].basis,r[0].marginalUsd],['unpriced',null]);
 assert.deepEqual([r[1].basis,r[1].marginalUsd],['unpriced',null]);
});

test('case f: an unwritable ledger path leaves the call resolving, with one console.error',async()=>{
 process.env.DESK_USAGE_FILE=path.join(data,'no','such','dir','usage.jsonl');
 const errs=[],orig=console.error;console.error=(...a)=>errs.push(a.join(' '));
 try{stub('stub');const a=await text({system:'s',prompt:'p'});await text({system:'s',prompt:'p'});assert.deepEqual(a.json,{hint:'x'});}finally{console.error=orig;}
 assert.equal(errs.length,1);assert(/usage ledger/.test(errs[0]));
});

test('case g: past the cap the ledger rotates to usage.1.jsonl, replacing the older copy',async()=>{
 process.env.DESK_USAGE_MAX_BYTES='600';
 stub('stub');
 for(let i=0;i<12;i++)await text({system:'s',prompt:'p'});
 const old=path.join(data,'usage.1.jsonl');
 assert(fs.existsSync(old));
 const kept=rows().length+rows(old).length;
 assert(rows().length>0&&rows().length<12&&kept<=12);
 assert(fs.statSync(LEDGER).size<=600+400);
 fs.writeFileSync(old,'STALE\n');fs.writeFileSync(LEDGER,'x'.repeat(700)+'\n');
 await text({system:'s',prompt:'p'});
 assert(fs.readFileSync(old,'utf8').startsWith('xxx'));assert.equal(rows().length,1);
});
