/**
 * The tools that read and guard the gate: the KPI tool's artefact reading, where a learner book that was not found
 * is never a zero, and the worktree preflight that gets desk/ and tools/node_modules in place before the gate runs. Run with
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
test('tools/node_modules is its own target: linked from a donor that has Playwright, never from one that only has desk\'s compiler',()=>{
 const T=preflight.TOOLS;
 install('tools-donor-a-desk-only');
 const dir=path.join(scratch,'tools-donor-b-real'),modules=path.join(dir,'tools/node_modules');
 fs.mkdirSync(path.join(modules,'playwright'),{recursive:true});fs.writeFileSync(path.join(modules,'playwright/package.json'),'{"name":"playwright"}');
 const wt=bare('tools-worktree');fs.mkdirSync(path.join(wt,'tools'),{recursive:true});
 const dest=path.join(wt,'tools/node_modules');links.push(dest);
 assert.deepEqual(preflight.TARGETS.map(t=>t.dir),['desk','tools'],'the pretest makes sure of both installs the gate reads');
 assert.equal(preflight.usable(modules,T),true);assert.equal(preflight.usable(modules),false,'Playwright is no compiler: the desk target still asks for typescript');
 const r=preflight.ensure({env:{},checkout:wt,main:null,levels:1,target:T});
 assert.equal(r.action,'linked');assert.equal(r.donor.modules,modules,'a checkout with only desk installed is passed over');
 assert.equal(fs.realpathSync(dest),fs.realpathSync(modules));
 const o=said();assert.equal(preflight.run(r,o),0);assert.match(o.lines[0],/^tools\/node_modules was missing — linked it to .*\. Remove the link and run `npm install` in tools\/ for an install of its own\.$/);
 assert.equal(preflight.ensure({env:{},checkout:wt,main:null,levels:1,target:T,link:never}).action,'present','a second run is a no-op');
 const alone=preflight.ensure({env:{TOOLS_NODE_MODULES:path.join(scratch,'nowhere')},checkout:bare('tools-worktree-alone'),main:null,levels:1,target:T});
 const o2=said();assert.equal(preflight.run(alone,o2),1);assert.match(o2.lines[0],/^tools\/node_modules cannot run the gate: .*with playwright in it\. Run `npm install` in tools\/, then `npm test`\.$/);
});
