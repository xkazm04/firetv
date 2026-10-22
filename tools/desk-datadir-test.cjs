/**
 * The data directory is read per call, from one helper (desk/src/lib/dataDir.ts), so a test or tool that sets
 * DESK_DATA_DIR after a module was first required still writes where it said, never into desk/data.
 * Run with npm test in desk/ (directly: node tools/desk-datadir-test.cjs). No model is called; both directories are under the OS temp dir.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const tmp=(n)=>path.join(os.tmpdir(),`desk-datadir-${n}-${process.pid}-${Date.now()}`);
const first=tmp('first'),second=tmp('second');
process.env.DESK_DATA_DIR=first;
assert.ok(![first,second].some((d)=>path.resolve(d).startsWith(path.resolve(root,'data'))),'never desk/data');
after(()=>{clearInterval(globalThis.__desk.ticker);for(const d of [first,second])fs.rmSync(d,{recursive:true,force:true});});
const lib=(f)=>require(path.join(root,'src/lib',f));
// the three modules that used to freeze the directory at import are loaded while it still names `first`
const store=lib('session/store.ts'),learners=lib('session/learners.ts'),lessons=lib('library/lessons.ts');
const names=(d)=>fs.existsSync(d)?fs.readdirSync(d).filter((n)=>!n.endsWith('.tmp')):[];

test('DD1: after DESK_DATA_DIR changes, the session, the learner file and the vector cache land in the new directory',async()=>{
 fs.rmSync(first,{recursive:true,force:true});
 process.env.DESK_DATA_DIR=second;
 store.dispatch({type:'status',text:'moved'});
 learners.saveLearner(learners.blank('zed'));
 fs.mkdirSync(path.join(second,'lessons'),{recursive:true});
 fs.writeFileSync(path.join(second,'lessons','jWpiMu5LNdg.en.vtt'),'WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nwelcome to equations\n');
 lib('engines/registry.ts').useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(()=>[1,0,0])})});
 await lessons.ensureVectors();
 const into=names(second);
 for(const f of ['session.json','learners.json','embeddings.json'])assert.ok(into.includes(f),`${f} is written under the directory now set (found: ${into.join(',')})`);
 assert.deepEqual(names(first),[],'nothing is written under the directory that was set at import');
});

test('DD2: the data directory is derived in one place - no module reads DESK_DATA_DIR itself',()=>{
 const sites=[];
 const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
  if(e.isDirectory())walk(p);else if(/[.]tsx?$/.test(e.name)){
   const code=fs.readFileSync(p,'utf8').replace(/\/[*][\s\S]*?[*]\//g,'').split('\n').filter((l)=>!/^\s*\/\//.test(l)).join('\n');
   if(code.includes('DESK_DATA_DIR'))sites.push(path.relative(root,p).split(path.sep).join('/'));}}};
 walk(path.join(root,'src'));
 assert.deepEqual(sites,['src/lib/dataDir.ts'],'the files that read DESK_DATA_DIR');
});

// desk/.gitignore keeps the learners' directory out of git. Anchored to desk/data only: an unanchored `data/` also hid any
// source folder named data under src/ or public/ from git, so a new module there would never be committed.
test('DD3: git ignores desk/data and nothing else named data under desk/',(t)=>{
 const {spawnSync}=require('node:child_process');
 const ignored=(p)=>spawnSync('git',['check-ignore','-q','--no-index',p],{cwd:path.resolve(root,'..')}).status;
 if(ignored('desk/data/learners.json')===null||ignored('desk/data/learners.json')>1)return t.skip('no git here');
 assert.equal(ignored('desk/data/learners.json'),0,'desk/data/learners.json is not ignored');
 assert.equal(ignored('desk/data/texts/a/b.json'),0,'a file deep in desk/data is not ignored');
 for(const p of ['desk/src/lib/data/fixtures.ts','desk/src/data/a.tsx','desk/public/data/sample.json'])assert.equal(ignored(p),1,`${p} is ignored by git`);
});
