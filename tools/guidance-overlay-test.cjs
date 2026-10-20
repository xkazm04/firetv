/**
 * Every separate build in this repository carries its own guidance overlay. A top-level directory that is its own
 * Gradle build (it has a settings.gradle[.kts]) or its own npm project with a gate (its package.json declares a
 * `test` script) is gated from that directory, so an agent opening it needs a local AGENTS.md that names that gate
 * and defers to the root AGENTS.md (the canonical guidance, `guidance.canonical` in .ai/manifest.yaml), plus a
 * CLAUDE.md that loads it. Today that is desk/ and deathride/. Reads files only: no model, no network, nothing
 * written. Run directly: node tools/guidance-overlay-test.cjs
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const read=(...p)=>fs.readFileSync(path.join(REPO,...p),'utf8');
const has=(...p)=>fs.existsSync(path.join(REPO,...p));

/** The top-level directories that are a build of their own, with the kind of build each is. */
function buildRoots(){
 const out=[];
 for(const e of fs.readdirSync(REPO,{withFileTypes:true})){
  if(!e.isDirectory()||e.name.startsWith('.')||e.name==='node_modules')continue;
  if(has(e.name,'settings.gradle.kts')||has(e.name,'settings.gradle'))out.push({dir:e.name,kind:'gradle'});
  else if(has(e.name,'package.json')){
   let pkg={};try{pkg=JSON.parse(read(e.name,'package.json'));}catch{}
   if(pkg.scripts&&typeof pkg.scripts.test==='string')out.push({dir:e.name,kind:'npm'});
  }
 }
 return out;
}
const roots=buildRoots();

test('case 1: the root AGENTS.md is the canonical guidance the overlays defer to',()=>{
 assert.match(read('.ai','manifest.yaml'),/^\s*canonical:\s*AGENTS\.md\s*$/m);
 assert.ok(has('AGENTS.md'));
});

test('case 2: the separate builds are found, so the overlay check cannot pass on an empty list',()=>{
 const dirs=roots.map((r)=>r.dir);
 assert.ok(dirs.includes('deathride'),'deathride/ (its own Gradle build) was not found: '+dirs.join(', '));
 assert.ok(dirs.includes('desk'),'desk/ (its own npm gate) was not found: '+dirs.join(', '));
});

test('case 3: every separate build has an AGENTS.md that defers to the root file',()=>{
 for(const {dir} of roots){
  assert.ok(has(dir,'AGENTS.md'),`${dir}/ is a separate build with no ${dir}/AGENTS.md overlay`);
  assert.match(read(dir,'AGENTS.md'),/\]\(\.\.\/AGENTS\.md\)/,`${dir}/AGENTS.md does not link the root ../AGENTS.md as its authority`);
 }
});

test('case 4: every separate build has a CLAUDE.md that loads its AGENTS.md',()=>{
 for(const {dir} of roots){
  assert.ok(has(dir,'CLAUDE.md'),`${dir}/ has no CLAUDE.md, so Claude Code never reads ${dir}/AGENTS.md`);
  assert.match(read(dir,'CLAUDE.md'),/^@AGENTS\.md\s*$/m,`${dir}/CLAUDE.md does not import @AGENTS.md`);
 }
});

test('case 5: an overlay names the gate that runs from its own directory',()=>{
 for(const {dir,kind} of roots){
  const body=read(dir,'AGENTS.md');
  if(kind==='gradle')assert.match(body,/gradlew(\.bat)? :[\w-]+:test/,`${dir}/AGENTS.md never names its own wrapper's test task`);
  else assert.match(body,/npm (--prefix \S+ )?test|`npm test`/,`${dir}/AGENTS.md never names its npm test gate`);
 }
});

test('case 6: the root AGENTS.md points to every overlay',()=>{
 const root=read('AGENTS.md');
 for(const {dir} of roots)assert.ok(root.includes(`${dir}/AGENTS.md`),`AGENTS.md never mentions ${dir}/AGENTS.md`);
});

test('case 7: a separate Gradle build is never wired into the root build',()=>{
 const settings=has('settings.gradle.kts')?read('settings.gradle.kts'):'';
 for(const {dir,kind} of roots){
  if(kind!=='gradle')continue;
  assert.doesNotMatch(settings,new RegExp(`include(Build)?\\([^)]*["':]${dir}\\b`),`the root settings.gradle.kts includes ${dir}/`);
 }
});
