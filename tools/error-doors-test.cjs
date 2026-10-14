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
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
const src=path.join(root,'src');
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
 'src/lib/desk/hint.ts':1,
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
