/**
 * learners.json is written atomically, and saveLearner fails the way saveEnglish does (idea f9a735ed).
 * Run with npm test in desk/ (directly: node tools/learners-save-test.cjs). No model is called. The data directory is
 * disposable, under the OS temp dir; never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const base=path.join(os.tmpdir(),`desk-learners-save-${process.pid}-${Date.now()}`);
const data=path.join(base,'data');
process.env.DESK_DATA_DIR=data;
assert.ok(!path.resolve(data).startsWith(path.resolve(root,'data')),'never desk/data');
fs.mkdirSync(data,{recursive:true});
const L=require(path.join(root,'src/lib/session/learners.ts'));
const FILE=path.join(data,'learners.json');
const quiet=(f)=>{const e=console.error;console.error=()=>{};try{return f();}finally{console.error=e;}};
const temps=()=>fs.readdirSync(data).filter((f)=>f!=='learners.json');
after(()=>fs.rmSync(base,{recursive:true,force:true}));

test('a save writes a valid book and leaves no temp file behind',()=>{
  const l=L.getLearner('ann');l.memory=['likes fractions'];
  L.saveLearner(l);
  const book=JSON.parse(fs.readFileSync(FILE,'utf8'));
  assert.deepEqual(book.ann.memory,['likes fractions']);
  L.recordAttempt('bob','frac-add-sub',true);
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(FILE,'utf8'))).sort(),['ann','bob']);
  L.saveEnglish('ann',L.getLearner('ann').english);
  assert.deepEqual(temps(),[]);
});

test('a failed write leaves the previous learners.json byte-identical and saveLearner throws',()=>{
  const before=fs.readFileSync(FILE);
  // the rename fails (as a locked or read-only target does on Windows)
  const real=fs.renameSync;fs.renameSync=()=>{throw Object.assign(new Error('EPERM: simulated'),{code:'EPERM'});};
  try{
    const l=L.getLearner('ann');l.memory=['changed'];
    assert.throws(()=>L.saveLearner(l),/could not be written, so progress was not saved/);
    assert.throws(()=>L.saveEnglish('ann',l.english),/could not be written/);
    assert.throws(()=>L.addMemory('ann','more'),/could not be written/);
  }finally{fs.renameSync=real;}
  assert.ok(before.equals(fs.readFileSync(FILE)),'learners.json byte-identical');
  assert.deepEqual(temps(),[],'the temp file is removed');
});

test('a data dir that is a regular file makes saveLearner throw',()=>{
  const code=`
    process.env.DESK_DATA_DIR=${JSON.stringify(path.join(base,'blocker','sub'))};
    const fs=require('node:fs'),ts=require(${JSON.stringify(path.join(root,'node_modules/typescript'))});
    require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
    const L=require(${JSON.stringify(path.join(root,'src/lib/session/learners.ts'))});
    try{L.saveLearner(L.getLearner('x'));console.log('NOTHROW');}catch(e){console.log('THREW '+e.message);}`;
  fs.writeFileSync(path.join(base,'blocker'),'a file, not a dir');
  const out=require('node:child_process').spawnSync(process.execPath,['-e',code],{encoding:'utf8'});
  assert.match(out.stdout,/^THREW learners\.json could not be written/,out.stdout+out.stderr);
  assert.equal(fs.readFileSync(path.join(base,'blocker'),'utf8'),'a file, not a dir');
});

test('an unreadable learners.json makes saveLearner throw and is left as it is',()=>{
  const junk='{"ann": not json';
  fs.writeFileSync(FILE,junk);
  quiet(()=>{
    assert.throws(()=>L.saveLearner(L.getLearner('ann')),/could not be read, so progress was not saved/);
    assert.throws(()=>L.saveEnglish('ann',L.getLearner('ann').english),/could not be read/);
    assert.throws(()=>L.recordAttempt('ann','frac-add-sub',true),/could not be read/);
  });
  assert.equal(fs.readFileSync(FILE,'utf8'),junk);
  assert.deepEqual(temps(),[]);
});
