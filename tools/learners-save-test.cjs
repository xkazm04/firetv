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
after(()=>{if(globalThis.__desk)clearInterval(globalThis.__desk.ticker);fs.rmSync(base,{recursive:true,force:true});});

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

// ---------------------------------------------------------------- v2 M5b: the papers a learner sat

const RAW=[{q:'1',marks:1,outOf:3,codes:['N2']},{q:'2(a)',marks:2,outOf:2,codes:['A1']},{q:'3',marks:0,outOf:4,codes:['ZZ9']},{q:'bad',marks:'x',outOf:2,codes:['N1']}];

test('papers 1: a paper round-trips - the cleaned paper and its date, kept on the learner, the recovery not stored',()=>{
  fs.writeFileSync(FILE,'{}');
  const p=L.addPaper('pam',RAW,1234);
  assert.equal(p.at,1234);
  assert.deepEqual(p.items.map(x=>x.q),['1','2(a)']);
  assert.deepEqual(p.unmapped.map(x=>x.q),['3'],'an item with only an unknown code is kept apart');
  const back=L.getLearner('pam');
  assert.deepEqual(back.papers,[p]);
  const stored=JSON.parse(fs.readFileSync(FILE,'utf8')).pam.papers;
  assert.deepEqual(Object.keys(stored[0]).sort(),['at','items','unmapped'],'the paper and its date; no recovery beside them');
  assert.equal(L.addPaper('pam',[{q:'x',marks:9,outOf:1,codes:[]}]),null,'a paper with no surviving row is not kept');
  assert.equal(L.getLearner('pam').papers.length,1);
  for(let i=0;i<7;i++)L.addPaper('pam',RAW,2000+i);
  assert.equal(L.getLearner('pam').papers.length,L.PAPERS_CAP,'the newest few are kept');
  assert.deepEqual(L.getLearner('pam').papers.at(-1).at,2006);
});

test('papers 2: a malformed stored paper is read as none, never guessed',()=>{
  const good={at:5,items:[{q:'1',marks:1,outOf:3,codes:['N2']}],unmapped:[]};
  const bad=[
    {at:5,items:[{q:'1',marks:4,outOf:3,codes:['N2']}],unmapped:[]},            // marks over out of
    {at:5,items:[{q:'1',marks:1,outOf:3,codes:['NOPE']}],unmapped:[]},           // an unknown code
    {at:5,items:[{q:'1',marks:1,outOf:3,codes:[]}],unmapped:[]},                 // an item with no code is not an item
    {at:5,items:[{q:'1',marks:1,outOf:3,codes:['N2']},{q:'1',marks:0,outOf:1,codes:['N1']}],unmapped:[]}, // a repeated label
    {at:5,items:[{q:'1',marks:1,outOf:3,codes:['N2','N2']}],unmapped:[]},        // a code twice: not what cleanPaper keeps
    {at:5,items:[],unmapped:[]},                                                 // nothing
    {items:good.items,unmapped:[]},{at:'5',items:good.items,unmapped:[]},{at:5,items:'x',unmapped:[]},'junk',7,null,[],
  ];
  fs.writeFileSync(FILE,JSON.stringify({ann:{id:'ann',papers:[...bad,good]}}));
  const l=L.getLearner('ann');
  assert.deepEqual(l.papers,[good],'only the paper that reads back cleanly stays');
  fs.writeFileSync(FILE,JSON.stringify({ann:{id:'ann',papers:'not a list'}}));
  assert.equal(L.getLearner('ann').papers,undefined);
});

test('papers 3: an older record without the field reads exactly as before',()=>{
  const old={id:'old',skills:{},writing:{},memory:['a'],history:[],digest:[]};
  fs.writeFileSync(FILE,JSON.stringify({old}));
  const l=L.getLearner('old');
  assert.equal('papers' in l,false,'no field until a paper is entered');
  const rest=l;
  assert.deepEqual(rest.memory,['a']);
  assert.deepEqual(Object.keys(rest).sort(),['digest','english','history','id','memory','skills','writing']);
  L.addMemory('old','b');
  assert.deepEqual(L.getLearner('old').memory,['a','b']);
  assert.equal('papers' in L.getLearner('old'),false);
});

test('papers 4: a paper typed on the phone goes through the session door - kept cleaned on the learner, the TV on its list, nothing kept for a paper with no row',()=>{
  fs.writeFileSync(FILE,'{}');
  const S=require(path.join(root,'src/lib/session/store.ts'));
  S.dispatch({type:'reset'});
  S.dispatch({type:'paper.enter',rows:RAW});
  assert.equal(S.getSession().screen==='paper',false,'no one at the desk: nothing is kept for no one');
  S.dispatch({type:'profile.draft',patch:{id:'mia',name:'Mia',type:'elementary',age:12,system:'uk',modules:['maths'],}});S.dispatch({type:'profile.save'});
  assert.equal(S.getSession().learner.id,'mia');
  S.dispatch({type:'paper.enter',rows:[{q:'x',marks:9,outOf:1,codes:[]}]});
  assert.notEqual(S.getSession().screen,'paper','a paper with no row left is not kept, and the TV stays put');
  assert.match(S.getSession().status,/kept no question/);
  assert.equal(L.getLearner('mia').papers,undefined);
  S.dispatch({type:'paper.enter',rows:RAW});
  const s=S.getSession();
  assert.equal(s.screen,'paper');
  assert.deepEqual(s.paper.items.map(x=>x.q),['1','2(a)']);
  assert.deepEqual(s.paper,L.getLearner('mia').papers.at(-1),'the session carries the learner\'s latest paper');
  assert.equal(JSON.stringify(s).includes('"topics"'),false,'the recovery is recomputed, never stored or sent');
});
