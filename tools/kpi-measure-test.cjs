/**
 * The tools that read and guard the gate: the KPI tool's artefact reading, where a learner book that was not found
 * is never a zero, and the worktree preflight that gets desk/node_modules in place before the gate runs. Run with
 * npm test in desk/ (directly: node tools/kpi-measure-test.cjs). Fixture checkouts live in a disposable directory,
 * never desk/data — and no fixture here ever names a real node_modules, let alone removes one.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const {findLearnerBook,learnerEvidence}=require('./kpi-measure.cjs');
const preflight=require('./worktree-preflight.cjs');
const scratch=path.resolve(__dirname,'../artifacts/kpi-measure',String(Date.now()));
const checkout=(name,book)=>{const dir=path.join(scratch,name);fs.mkdirSync(path.join(dir,'desk/data'),{recursive:true});if(book!==undefined)fs.writeFileSync(path.join(dir,'desk/data/learners.json'),typeof book==='string'?book:JSON.stringify(book));return dir;};
const ONE={ema:{id:'ema',skills:{},memory:[]}};

test('no book anywhere is no reading: null, not 0, and it says where it looked',()=>{
 const wt=checkout('bare-worktree'),main=checkout('bare-main');
 const where=findLearnerBook({env:{},checkout:wt,main});
 assert.equal(where.file,null);
 assert.deepEqual(where.tried,[path.join(wt,'desk/data','learners.json'),path.join(main,'desk/data','learners.json')]);
 const r=learnerEvidence(where);
 assert.equal(r.found,false);assert.strictEqual(r.reading,null,'a missing file can never be recorded as a measurement');
 assert.strictEqual(r.learners,null);assert.strictEqual(r.history,null);
});
test('a book with a learner and no history is a real 0, and is told apart from no book',()=>{
 const main=checkout('main-with-learner',ONE),wt=checkout('worktree-without-data');
 const r=learnerEvidence(findLearnerBook({env:{},checkout:wt,main}));
 assert.equal(r.found,true);assert.equal(r.readable,true);assert.equal(r.source,'main checkout','a worktree reads the operator checkout it was cut from');
 assert.strictEqual(r.reading,0);assert.equal(r.learners,1);assert.equal(r.withWriting,0);
});
test('this checkout\'s own book wins over the main checkout\'s, and the main checkout is not tried twice',()=>{
 const main=checkout('main-own',ONE),wt=checkout('worktree-own',{a:{id:'a',history:[{kind:'writing'},{kind:'practice'}]}});
 const r=learnerEvidence(findLearnerBook({env:{},checkout:wt,main}));
 assert.equal(r.source,'this checkout');assert.equal(r.reading,2);assert.equal(r.withWriting,1);
 assert.equal(findLearnerBook({env:{},checkout:main,main}).tried.length,1,'run from the main checkout, there is one place to look');
});
test('DESK_DATA_DIR is the answer when set: a missing book there does not fall through to another',()=>{
 const main=checkout('main-behind-env',ONE),wt=checkout('worktree-env');
 const where=findLearnerBook({env:{DESK_DATA_DIR:path.join(scratch,'nowhere')},checkout:wt,main});
 assert.equal(where.file,null);assert.deepEqual(where.tried,[path.join(scratch,'nowhere','learners.json')]);
 assert.equal(learnerEvidence(findLearnerBook({env:{DESK_DATA_DIR:path.join(main,'desk/data')},checkout:wt,main})).source,'DESK_DATA_DIR');
});
test('a book that is not a learner book is no reading either',()=>{
 for(const bad of ['{not json','[1,2]','null']){
  const r=learnerEvidence(findLearnerBook({env:{},checkout:checkout(`bad-${bad.length}-${bad[0]}`,bad),main:null}));
  assert.equal(r.found,true);assert.equal(r.readable,false);assert.strictEqual(r.reading,null,`${bad} reads as no reading`);
 }
});

// The worktree preflight. Every path below is inside the disposable scratch directory: the fixtures' node_modules
// are three files deep, the only link made points scratch at scratch, and nothing outside scratch is read or written.
const links=[];
after(()=>{for(const l of links.reverse()){try{fs.unlinkSync(l);}catch{try{fs.rmdirSync(l);}catch{/* scratch is disposable */}}}});
const install=(name,{typescript=true,other=false}={})=>{
 const dir=path.join(scratch,name),modules=path.join(dir,'desk/node_modules');
 if(typescript){fs.mkdirSync(path.join(modules,'typescript'),{recursive:true});fs.writeFileSync(path.join(modules,'typescript/package.json'),'{"name":"typescript"}');}
 else if(other){fs.mkdirSync(path.join(modules,'react'),{recursive:true});fs.writeFileSync(path.join(modules,'react/package.json'),'{"name":"react"}');}
 else fs.mkdirSync(modules,{recursive:true});
 return {dir,modules};
};
const bare=name=>{const dir=path.join(scratch,name);fs.mkdirSync(path.join(dir,'desk'),{recursive:true});return dir;};
const never=()=>{throw new Error('the preflight linked over an install that was already there');};
// The gate's own log must stay readable, so what the preflight would say is collected and read here, not printed.
const said=()=>{const lines=[];return {lines,log:m=>lines.push(m),error:m=>lines.push(m)};};

test('the donor search takes a checkout whose desk/node_modules really has the compiler, and skips one that does not',()=>{
 const empty=install('donor-a-empty',{typescript:false}),real=install('donor-b-real');
 assert.equal(preflight.usable(empty.modules),false,'no typescript in it is no donor');
 assert.equal(preflight.usable(real.modules),true);
 const donor=preflight.findDonor({env:{},checkout:bare('worktree-needing-modules'),main:null,levels:1});
 assert.equal(donor.modules,real.modules,'the empty one comes first alphabetically and must still be passed over');
 assert.match(donor.source,/^sibling checkout /);
});
test('DESK_NODE_MODULES is the answer when set, and an unusable one does not fall through to a sibling',()=>{
 install('donor-for-env');const wt=bare('worktree-env-modules');
 assert.equal(preflight.findDonor({env:{DESK_NODE_MODULES:path.join(scratch,'donor-for-env/desk/node_modules')},checkout:wt,main:null,levels:1}).source,'DESK_NODE_MODULES');
 assert.equal(preflight.findDonor({env:{DESK_NODE_MODULES:path.join(scratch,'nowhere/node_modules')},checkout:wt,main:null,levels:1}),null);
});
test('desk/node_modules already in place is left exactly alone: no search, no link, nothing removed',()=>{
 const own=install('checkout-with-its-own');
 const r=preflight.ensure({env:{},checkout:own.dir,main:null,levels:1,link:never});
 const o=said();assert.equal(r.action,'present');assert.equal(preflight.run(r,o),0);
 assert.deepEqual(o.lines,[],'a checkout that is already installed hears nothing from the preflight');
 assert.equal(fs.lstatSync(own.modules).isSymbolicLink(),false,'a real install is still a real directory');
 assert.equal(fs.readFileSync(path.join(own.modules,'typescript/package.json'),'utf8'),'{"name":"typescript"}');
});
test('a missing desk/node_modules is linked to the donor, and the link is what the gate then reads',()=>{
 install('donor-to-link-from');const wt=bare('worktree-to-link');
 const dest=path.join(wt,'desk/node_modules');links.push(dest);
 const r=preflight.ensure({env:{},checkout:wt,main:null,levels:1});
 assert.equal(r.action,'linked');assert.equal(preflight.usable(r.donor.modules),true,'it only ever links to an install that has the compiler');
 assert.equal(fs.lstatSync(dest).isSymbolicLink(),true,'a link, not a copy');
 assert.equal(fs.realpathSync(dest),fs.realpathSync(r.donor.modules),'the link points at the donor it named');
 assert.equal(preflight.usable(dest),true,'tsc and the rules suites find the compiler through it');
 const o=said();assert.equal(preflight.run(r,o),0);
 assert.equal(o.lines.length,1,'one line, not a stack');assert.match(o.lines[0],/^desk\/node_modules was missing — linked it to /);
 assert.equal(preflight.ensure({env:{},checkout:wt,main:null,levels:1,link:never}).action,'present','a second run is a no-op');
});
test('no donor anywhere is one instruction and a non-zero exit, never a stack',()=>{
 const r=preflight.ensure({env:{},checkout:bare('worktree-alone'),main:null,levels:0});
 const o=said();assert.equal(r.action,'unavailable');assert.equal(preflight.run(r,o),1);
 assert.match(r.reason,/no checkout near /);
 assert.equal(o.lines.length,1,'one line, not a stack');assert.match(o.lines[0],/Run `npm install` in desk\/, then `npm test`\.$/);
});
test('a real directory in the way is reported, never deleted — an install is the operator\'s, not ours',()=>{
 const half=install('checkout-half-installed',{typescript:false,other:true});install('donor-for-half');
 const r=preflight.ensure({env:{},checkout:half.dir,main:null,levels:1,link:never});
 const o=said();assert.equal(r.action,'blocked');assert.equal(preflight.run(r,o),1);
 assert.equal(o.lines.length,1);assert.match(o.lines[0],/has no typescript in it\. Run `npm install` in desk\/, then `npm test`\.$/);
 assert.equal(fs.readFileSync(path.join(half.modules,'react/package.json'),'utf8'),'{"name":"react"}','what was there is still there');
});

// Coverage is a load, not a mention. A module a tools file only names - in a comment, or as a file it reads as text -
// is not under test; only a require() or an import of it is. The texts below are fixtures, never files on disk.
const {coveredBy}=require('./kpi-measure.cjs');
const src=(file,text)=>({file,text});
const V='src/lib/desk/verify.ts';
test('a module named only in a comment is not covered',()=>{
 assert.deepEqual(coveredBy([src('tools/line.cjs',"// see src/lib/desk/verify.ts for the rules\nconst x=1;\n")],V),[],'a line comment is not a load');
 assert.deepEqual(coveredBy([src('tools/block.cjs',"/**\n * Tests for require(path.join(root,'src/lib/desk/verify.ts')) will come later.\n */\nconst x=1;\n")],V),[],'a require written inside a block comment is not a load');
 assert.deepEqual(coveredBy([src('tools/tail.cjs',"const a=require('node:fs'); // TODO src/lib/desk/verify.ts\n")],V),[],'a trailing comment on a line that requires something else is not a load of this module');
});
test('a module read as text, not loaded, is not covered',()=>{
 assert.deepEqual(coveredBy([src('tools/scan.cjs',"const t=fs.readFileSync(path.join(root,'src/lib/desk/verify.ts'),'utf8');\n")],V),[]);
});
test('a module that is required or imported is covered (guard)',()=>{
 const hits=coveredBy([
  src('tools/req.cjs',"const {verify}=require(path.join(root,'src/lib/desk/verify.ts'));\n"),
  src('tools/url.cjs',"const u='http://example.test/a';const {verify}=require(path.join(root, 'src/lib/desk/verify.ts'));\n"),
  src('tools/esm.mjs',"import { verify } from '@/lib/desk/verify';\n"),
  src('tools/dyn.mjs',"const m=await import('../desk/src/lib/desk/verify.ts');\n"),
  src('tools/other.cjs',"const {makeItems}=require(path.join(root,'src/lib/desk/items.ts'));\n"),
 ],V);
 assert.deepEqual(hits,['tools/req.cjs','tools/url.cjs','tools/esm.mjs','tools/dyn.mjs'],'a // inside a string is not a comment, and a require of another module is not this one');
});
test('the maths core reading on this tree is unchanged: every credited module is loaded by a real suite (guard)',()=>{
 const k=require('./kpi-measure.cjs'),sources=k.testSources();
 for(const m of ['src/lib/desk/verify.ts','src/lib/desk/items.ts','src/lib/rules/maths.ts','src/lib/library/syllabus.ts'])
  assert.ok(coveredBy(sources,m).includes('tools/maths-rules-test.cjs'),`${m} is loaded by maths-rules-test`);
 for(const m of ['src/lib/rules/essay.ts','src/lib/desk/essay.ts'])
  assert.ok(coveredBy(sources,m).includes('tools/essay-rules-test.cjs'),`${m} is loaded by essay-rules-test`);
});

// One copy of where the operator's checkout is: the KPI tool and the preflight must never disagree about it.
test('kpi-measure and the preflight resolve the same main checkout, from one shared helper',()=>{
 const checkoutPath=path.join(__dirname,'checkout.cjs');
 assert.ok(fs.existsSync(checkoutPath),'tools/checkout.cjs holds mainCheckout and same');
 const shared=require(checkoutPath),kpi=require('./kpi-measure.cjs');
 assert.equal(kpi.mainCheckout,shared.mainCheckout,'kpi-measure uses the shared mainCheckout');
 assert.equal(preflight.mainCheckout,shared.mainCheckout,'the preflight uses the shared mainCheckout');
 assert.equal(kpi.same,shared.same);assert.equal(preflight.same,shared.same);
 const main=shared.mainCheckout();
 assert.ok(main,'this repo is a git checkout');
 assert.equal(kpi.mainCheckout(),preflight.mainCheckout());
 assert.ok(shared.same(main,path.resolve(main.toUpperCase()))===(process.platform==='win32'),'same() ignores case on Windows only');
 const strip=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
 for(const f of ['kpi-measure.cjs','worktree-preflight.cjs']){
  const code=strip(fs.readFileSync(path.join(__dirname,f),'utf8'));
  assert.doesNotMatch(code,/function\s+mainCheckout\b/,`${f} keeps no copy of mainCheckout`);
  assert.doesNotMatch(code,/const\s+same\s*=/,`${f} keeps no copy of same`);
 }
});
