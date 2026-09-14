/**
 * The KPI tool's artefact reading: a learner book that was not found is never a zero. Run with npm test in desk/
 * (directly: node tools/kpi-measure-test.cjs). Fixture checkouts live in a disposable directory, never desk/data.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const {findLearnerBook,learnerEvidence}=require('./kpi-measure.cjs');
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
