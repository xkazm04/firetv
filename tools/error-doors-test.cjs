/**
 * The error doors, walked over the whole of desk/src rather than over a hand-kept list (architect 2026-10-15,
 * error-handling scan). Three gates, each with a canary that proves the predicate still bites:
 *   1. the engine seam is the only way to reach a model: no provider object, no registry lookup, no child process and
 *      no model host outside lib/engines (a bypass skips the deadline, the meter row and the typed EngineError);
 *   2. a route that reaches a model is one this file knows by name, so a new one is added on purpose, beside the test
 *      that proves it answers a failed engine in desk words (probe P5: a new route returning a raw 500 was unseen);
 *   3. a catch that reaches no door and says nothing is a shrink-only ratchet: today's list is the allowlist, a new one
 *      fails, a fixed one must leave the list (probe P1: a new empty catch was unseen).
 * No model is called; nothing is written. Run with npm test in desk/ (directly: node tools/error-doors-test.cjs).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
const src=path.join(root,'src');
// never desk/data: anything that reaches the session writes under a scratch directory
const data=path.join(os.tmpdir(),`error-doors-${process.pid}`);process.env.DESK_DATA_DIR=data;
require('node:test').after(()=>fs.rmSync(data,{recursive:true,force:true}));
const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]);
const rel=(f)=>path.relative(root,f).split(path.sep).join('/');
const files=walk(src).map(f=>({file:rel(f),text:fs.readFileSync(f,'utf8')}));
const ENGINES='src/lib/engines/';

// ---- 1. the seam
const PROVIDERS=['claudeCli','codexCli','codexText','ollamaVision','ollamaEmbed','piper','elevenlabs'];
const BYPASS=[
 [new RegExp(`import[^;]*\\b(${PROVIDERS.join('|')})\\b[^;]*from\\s*["'][^"']*engines/`),'imports a provider object instead of its engine'],
 [/import[^;]*\b(provider|useProvider)\b[^;]*from\s*["'][^"']*engines\/registry["']/,'looks a provider up in the registry'],
 [/from\s*["'](node:)?child_process["']|require\(\s*["'](node:)?child_process["']\s*\)/,'starts a child process'],
 [/fetch\([^)]*(:11434|elevenlabs\.io|api\.anthropic\.com|api\.openai\.com)/,'fetches a model host'],
];
const bypasses=(text)=>BYPASS.filter(([re])=>re.test(text)).map(([,why])=>why);
test('seam canary: each bypass shape is caught by its predicate, and an engine call is not',()=>{
 assert.deepEqual(bypasses('import { claudeCli } from "../engines/text";'),['imports a provider object instead of its engine']);
 assert.deepEqual(bypasses('import { provider } from "@/lib/engines/registry";'),['looks a provider up in the registry']);
 assert.deepEqual(bypasses('import { spawn } from "node:child_process";'),['starts a child process']);
 assert.deepEqual(bypasses('await fetch("http://127.0.0.1:11434/api/generate",{method:"POST"})'),['fetches a model host']);
 assert.deepEqual(bypasses('import { text } from "@/lib/engines/text";'),[]);
});
test('the engine seam is the only way to a model: nothing outside lib/engines bypasses it',()=>{
 const found=files.filter(f=>!f.file.startsWith(ENGINES)).flatMap(f=>bypasses(f.text).map(why=>`${f.file}: ${why}`));
 assert.deepEqual(found,[],'call text(), vision(), embed(), speak() or listen() instead: they carry the deadline, the meter row and the EngineError');
});

// ---- 2. routes that reach a model
// Each is named with the suite that drives it; adding a route here is the moment to give that suite a failing-engine case
// (desk words, never a raw 500 or an exception's text) if it has none.
const MODEL_ROUTES={
 'analyse':'desk-jobs-rules-test.cjs','explain':'desk-jobs-rules-test.cjs','hint':'desk-jobs-rules-test.cjs','mark':'desk-jobs-rules-test.cjs',
 'practice':'desk-jobs-rules-test.cjs','read':'desk-jobs-rules-test.cjs','session/retry':'desk-jobs-rules-test.cjs','worked':'desk-jobs-rules-test.cjs',
 'english':'linga-rules-test.cjs','listen':'linga-rules-test.cjs','speak':'linga-rules-test.cjs',
 'memory':'tv-recap-test.cjs','second':'maths-second-test.cjs','smoke':'engines-rules-test.cjs',
};
const REACHES=/from\s*["']@\/lib\/(engines|desk|english)\//;
test('every route that reaches a model is known here by name, with the suite that drives it',()=>{
 const routes=files.filter(f=>/^src\/app\/api\/.+\/route\.ts$/.test(f.file)&&REACHES.test(f.text)).map(f=>f.file.replace(/^src\/app\/api\//,'').replace(/\/route\.ts$/,'')).sort();
 assert.deepEqual(routes,Object.keys(MODEL_ROUTES).sort(),'a new model route: add it to MODEL_ROUTES with the suite that sends it a failing engine');
 for(const [name,suite] of Object.entries(MODEL_ROUTES)){
  const body=fs.readFileSync(path.join(__dirname,suite),'utf8');
  assert(body.includes(`'${name}'`)||body.includes(`"${name}"`)||body.includes(`api/${name}`),`${suite} names the ${name} route`);
 }
});

// ---- 3. silent catches, a shrink-only ratchet
// A catch body "says something" when it rethrows, returns or assigns a value the caller reads, logs, dispatches, sets
// state, or carries a comment saying why nothing more is owed. An empty body with no comment is silent.
const strip=(t)=>t.replace(/(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,'""');
function silentCatches(text){
 const out=[],t=strip(text),lines=t.split('\n');
 // a body parse that falls back (req.json().catch(() => null)) is answered by the 400 after it, so it is not counted
 const re=/catch\s*(\([^)]*\))?\s*\{\s*\}|(?<!\.json\(\))\.catch\(\s*\(\s*\)\s*=>\s*(\{\s*\}|undefined|null|void 0)\s*\)/g;
 for(const [i,line] of lines.entries()){re.lastIndex=0;let m;while((m=re.exec(line)))out.push(i+1);}
 return out;
}
// Pinned 2026-10-15 from the dry run (node tools/error-doors-test.cjs --list). Each entry is file:count; a fixed site lowers
// its count (and the test then asks for the lower number), a new silent catch anywhere fails.
const SILENT={
 'src/app/api/session/stream/route.ts':1,
 'src/app/phone/page.tsx':5,
 'src/app/tv/page.tsx':4,
 'src/essay/EssayTV.tsx':2,
 'src/landing/themes/blueprint/Blueprint.tsx':2,
 'src/landing/themes/paper/Paper.tsx':1,
 'src/lib/engines/call.ts':1,
 'src/lib/engines/codex.ts':1,
 'src/lib/engines/health.ts':1,
 'src/lib/engines/text.ts':1,
 'src/lib/library/lessons.ts':1,
 'src/lib/session/learners.ts':1,
 'src/lib/session/pairing.ts':2,
 'src/lib/session/store.ts':5,
 'src/tv/screens.tsx':1,
};
test('silent-catch canary: an empty catch and an empty .catch are seen; a commented or routed one is not',()=>{
 assert.equal(silentCatches('try { x(); } catch {}').length,1);
 assert.equal(silentCatches('try { x(); } catch (e) {}').length,1);
 assert.equal(silentCatches('p.catch(() => {})').length,1);
 assert.equal(silentCatches('p.catch(() => null)').length,1);
 assert.equal(silentCatches('const b = await req.json().catch(() => null);').length,0);
 assert.equal(silentCatches('try { x(); } catch { /* the file is optional */ }').length,0);
 assert.equal(silentCatches('try { x(); } catch (e) { console.error(e); }').length,0);
 assert.equal(silentCatches('const s = "catch {}";').length,0);
});
test('silent catches only shrink: no new one, and a fixed one leaves the list',()=>{
 const now={};for(const f of files){const n=silentCatches(f.text).length;if(n)now[f.file]=n;}
 if(process.argv.includes('--list')){console.log(JSON.stringify(now,null,1));return;}
 const grown=Object.entries(now).filter(([f,n])=>n>(SILENT[f]??0)).map(([f,n])=>`${f}: ${n} silent (allowed ${SILENT[f]??0}) at lines ${silentCatches(files.find(x=>x.file===f).text).join(', ')}`);
 assert.deepEqual(grown,[],'route the failure to a door (console.error, a status, a response) or say in a comment why nothing is owed');
 const shrunk=Object.entries(SILENT).filter(([f,n])=>(now[f]??0)<n).map(([f,n])=>`${f}: ${now[f]??0} now, ${n} pinned`);
 assert.deepEqual(shrunk,[],'a silent catch was fixed: lower its pin in SILENT so it cannot come back');
});

// ---- 4. a checker's own defect reaches the log; the learner's verdict does not change
test('checkerFault: an Unreadable is the expected verdict and says nothing; any other throw is logged once per site and message',()=>{
 require('./ts-load.cjs');
 const {checkerFault,Unreadable}=require(path.join(src,'lib/rules/fault.ts'));
 const said=[],was=console.error;console.error=(...a)=>said.push(a.join(' '));
 try{
  checkerFault('canary',new Unreadable());
  checkerFault('canary',new TypeError('x is undefined'));checkerFault('canary',new TypeError('x is undefined'));
  checkerFault('canary',new RangeError('Division by zero'));
 }finally{console.error=was;}
 assert.deepEqual(said,['[rules] checker fault in canary: TypeError: x is undefined','[rules] checker fault in canary: RangeError: Division by zero']);
 // the parsers throw the shared class, so a parse failure in school.ts or calc-expr.ts is never logged as a fault
 for(const f of ['school.ts','calc-expr.ts']){const t=fs.readFileSync(path.join(src,'lib/rules',f),'utf8');assert(!/class Unreadable/.test(t),`${f} uses the Unreadable from fault.ts`);}
});

// ---- 5. the outermost door: a request that throws past its handler, and a screen that crashes while it draws
test('crash door: onRequestError logs where and what (never the body); /api/fault logs short labels only and answers 204',async()=>{
 require('./ts-load.cjs');
 const said=[],was=console.error;console.error=(...a)=>said.push(a.join(' '));
 try{
  const {onRequestError}=require(path.join(src,'instrumentation.ts'));
  await onRequestError(Object.assign(new TypeError('boom'),{digest:'d1'}),{path:'/api/mark',method:'POST',headers:{}},{routerKind:'App Router',routePath:'/api/mark',routeType:'route'});
  const {POST}=require(path.join(src,'app/api/fault/route.ts'));
  const r=await POST(new Request('http://desk/api/fault',{method:'POST',body:JSON.stringify({where:'/tv <x=42>',name:'TypeError',digest:'abc123'})}));
  assert.equal(r.status,204);
  const bad=await POST(new Request('http://desk/api/fault',{method:'POST',body:'7'}));
  assert.equal(bad.status,400);
 }finally{console.error=was;}
 assert.match(said[0],/^\[crash\] POST \/api\/mark \(route \/api\/mark\): TypeError: boom/);assert.match(said[0],/digest d1/);
 assert.equal(said[1],'[crash] screen /tvx42: TypeError digest abc123','labels keep only word characters, slashes, dots, colons and dashes');
 assert(fs.existsSync(path.join(src,'app/global-error.tsx')),'a screen that crashes while drawing has a last screen');
 assert.doesNotMatch(fs.readFileSync(path.join(src,'app/global-error.tsx'),'utf8'),/error\.message|\{error\}|String\(error\)/,'the last screen never shows the error text');
});
test('the last screen reloads the page itself: Next 16 names the boundary prop retry, so a reset() call would be undefined',()=>{
 const t=fs.readFileSync(path.join(src,'app/global-error.tsx'),'utf8');
 assert.doesNotMatch(t,/\breset\b/,'no reset prop');assert.match(t,/location\.reload\(\)/);
});

// ---- 6. unreadable is not absent: the twin's state and the text shelf
test('a twin.json the desk cannot read is put aside and said, never taken for "none" and written over',()=>{
 require('./ts-load.cjs');
 const {twinState,excludedOf,saveTwinState}=require(path.join(src,'lib/twin/state.ts'));
 const dir=path.join(data,'texts','L1');fs.mkdirSync(dir,{recursive:true});
 saveTwinState('L1',{cardId:'card-1',createdAt:'2026-10-01T00:00:00Z',excluded:['t-aaaaaaaaaaaa']});
 assert.deepEqual(excludedOf('L1'),['t-aaaaaaaaaaaa']);
 assert.deepEqual(fs.readdirSync(dir),['twin.json'],'the save leaves no temporary file');
 fs.writeFileSync(path.join(dir,'twin.json'),'{"cardId":"card-1","excluded":["t-aaaa');
 const said=[],was=console.error;console.error=(...a)=>said.push(a.join(' '));
 let st;try{assert.deepEqual(excludedOf('L1'),[]);st=twinState('L1');}finally{console.error=was;}
 assert.notEqual(st.cardId,'card-1');
 assert(said.some(l=>/desk twin: .*twin\.json was not used, it is not readable JSON/.test(l)),'the unreadable file reaches the log');
 const bad=fs.readdirSync(dir).filter(f=>f.startsWith('twin.json.bad-'));
 assert.equal(bad.length,1,'the unreadable file is put aside beside itself');
 assert.equal(fs.readFileSync(path.join(dir,bad[0]),'utf8'),'{"cardId":"card-1","excluded":["t-aaaa','byte for byte');
});
test('a kept piece the desk cannot read is left off the shelf and said; a missing folder is an empty shelf and says nothing',()=>{
 require('./ts-load.cjs');
 const {listPieces,getPiece}=require(path.join(src,'lib/session/texts.ts'));
 const said=[],was=console.error;console.error=(...a)=>said.push(a.join(' '));
 try{
  assert.deepEqual(listPieces('L2'),[]);assert.deepEqual(said,[],'no folder yet is not a failure');
  const dir=path.join(data,'texts','L2');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'t-bbbbbbbbbbbb.json'),'{"id":"t-bbbb');
  assert.deepEqual(listPieces('L2'),[]);assert.equal(getPiece('L2','t-bbbbbbbbbbbb'),null);
 }finally{console.error=was;}
 assert.equal(said.length,1,'said once, not once per read');assert.match(said[0],/desk texts: .*t-bbbbbbbbbbbb\.json is not readable JSON, so it is left off the shelf/);
 assert.equal(fs.readFileSync(path.join(data,'texts','L2','t-bbbbbbbbbbbb.json'),'utf8'),'{"id":"t-bbbb','and left as it was');
});
