/**
 * The demo seeder (desk/scripts/seed-demo.mjs, npm run seed:demo) refuses, before it starts a desk or writes a byte:
 * a desk/data directory (this desk's or any checkout's, where real learners live), a directory that is not empty
 * unless --force, and one that holds .git even with --force. Each case runs the seeder as a process and checks its
 * exit and that nothing was written. No desk is started, no network, no model.
 * Run with npm test in desk/ (directly: node tools/seed-demo-test.cjs).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const {spawnSync}=require('node:child_process');
const DESK=path.resolve(__dirname,'../desk'),SEED=path.join(DESK,'scripts','seed-demo.mjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'seed-demo-test-'));
after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
const run=(...a)=>spawnSync(process.execPath,[SEED,...a],{cwd:DESK,encoding:'utf8',timeout:30000});
const snapshot=(d)=>fs.existsSync(d)?fs.readdirSync(d).sort().map((n)=>[n,fs.statSync(path.join(d,n)).mtimeMs]):null;

test('SD1: this desk\'s own desk/data is refused, and is left exactly as it was (or still absent)',()=>{
 const real=path.join(DESK,'data'),before=snapshot(real);
 for(const arg of [real,path.join(real,'sub'),'data']){
  const r=run('--data',arg);
  assert.equal(r.status,2,`exit for ${arg}: ${r.stderr}`);
  assert.match(r.stderr,/refusing .*desk[\\/]data/i);
 }
 assert.deepEqual(snapshot(real),before,'desk/data untouched');
});

test('SD2: any checkout\'s desk/data is refused, even when it does not exist yet, and nothing is created',()=>{
 const other=path.join(tmp,'firetv','desk','data');
 const r=run('--data',other);
 assert.equal(r.status,2,r.stderr);
 assert.match(r.stderr,/desk\/data directory|desk\\data|desk.data/i);
 assert.equal(fs.existsSync(path.join(tmp,'firetv')),false,'nothing written');
});

test('SD3: a directory that is not empty is refused without --force, and its file is untouched',()=>{
 const d=path.join(tmp,'full');fs.mkdirSync(d);fs.writeFileSync(path.join(d,'session.json'),'{"keep":true}');
 const r=run('--data',d);
 assert.equal(r.status,2,r.stderr);
 assert.match(r.stderr,/not empty/);
 assert.match(r.stderr,/--force/);
 assert.equal(fs.readFileSync(path.join(d,'session.json'),'utf8'),'{"keep":true}');
});

test('SD4: --force does not empty a directory holding .git or package.json',()=>{
 for(const marker of ['.git','package.json']){
  const d=path.join(tmp,`repo-${marker.replace('.','')}`);fs.mkdirSync(d);fs.writeFileSync(path.join(d,marker),'x');fs.writeFileSync(path.join(d,'keep.txt'),'k');
  const r=run('--data',d,'--force');
  assert.equal(r.status,2,r.stderr);
  assert.match(r.stderr,/not a data directory/);
  assert.deepEqual(fs.readdirSync(d).sort(),[marker,'keep.txt'].sort());
 }
});

test('SD5: no --data, a filesystem root and an unknown option are refused',()=>{
 assert.equal(run().status,2);
 assert.match(run().stderr,/--data <dir> is required/);
 assert.equal(run('--data',path.parse(tmp).root,'--force').status,2);
 assert.equal(run('--data',path.join(tmp,'x'),'--stick').status,2);
 assert.equal(run('--data',path.join(tmp,'x'),'--port','3000').status,2);
 assert.equal(fs.existsSync(path.join(tmp,'x')),false);
});
