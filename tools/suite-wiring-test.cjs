/**
 * Every suite in tools/ (every tools/*-test.cjs on disk, not a list someone keeps) is run by something: the desk gate's
 * `rulesSuites` in desk/package.json, a workflow step (comments stripped: a step a comment describes runs nothing), or
 * its own header declares it a live run kept out of every gate. A suite nothing runs is a test nobody
 * learns from when it goes red. UNWIRED names the suites known to run nowhere today, each with its reason; an entry
 * whose suite is wired (or gone) fails, so the list only shrinks. Reads files only: no network, no model.
 * Run directly: node tools/suite-wiring-test.cjs
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const read=(...p)=>fs.readFileSync(path.join(REPO,...p),'utf8');

/** Suites known to run nowhere today, and why. Wire one, then delete its entry. */
const UNWIRED={
 'engine-degraded-test.cjs':'its harness-drills.yml job was unwired at fc866ead: the "read: a page with nothing on it" row fails on the current desk (502, the fixture expects 200)',
 'worktree-preflight-test.cjs':'added 2026-10-16 (e265ccd7) and never listed in desk/package.json rulesSuites or a workflow; pure, 7/7 green; listing it is the desk-tooling owner\'s edit of a shared file',
};

const code=(yaml)=>yaml.split(/\r?\n/).filter((l)=>!/^\s*#/.test(l)).map((l)=>l.replace(/\s+#\s.*$/,'')).join('\n');
const suites=()=>fs.readdirSync(path.join(REPO,'tools')).filter((f)=>/-test\.cjs$/.test(f)).sort();
const rulesSuites=()=>new Set(JSON.parse(read('desk','package.json')).rulesSuites||[]);
const workflowText=()=>fs.readdirSync(path.join(REPO,'.github','workflows')).filter((f)=>/\.ya?ml$/.test(f)).map((f)=>code(read('.github','workflows',f))).join('\n');
/** A live-model suite says so in its header comment, and says it is never part of a gate. */
const declaredLive=(f)=>{if(!fs.existsSync(path.join(REPO,'tools',f)))return false;const head=(/^\/\*\*([\s\S]*?)\*\//.exec(read('tools',f))||[,''])[1];return /never part of a gate/i.test(head)&&/live|real model|real-model/i.test(head);};
const runBy=(f,rules,wf)=>rules.has(f)?'rulesSuites':new RegExp(`node\\s+(?:\\.\\./)?tools/${f.replace(/[.]/g,'[.]')}\\b`).test(wf)?'workflow':declaredLive(f)?'live (declared)':null;

test('case 1: the ground truth is found, so the check cannot pass on an empty list',()=>{
 const all=suites(),rules=rulesSuites();
 assert.ok(all.length>50,`only ${all.length} tools/*-test.cjs found`);
 assert.ok(rules.size>50,`only ${rules.size} rulesSuites found in desk/package.json`);
});

test('case 2: every tools/*-test.cjs is run by the desk gate, a workflow, or is a declared live run, beyond UNWIRED',()=>{
 const rules=rulesSuites(),wf=workflowText();
 const orphans=suites().filter((f)=>!runBy(f,rules,wf)&&!Object.hasOwn(UNWIRED,f));
 assert.deepEqual(orphans,[],'these suites run nowhere: list each in rulesSuites (before harness-rules-test.cjs) or a workflow');
});

test('case 3: every UNWIRED entry still names a suite that exists, runs nowhere and has a reason',()=>{
 const rules=rulesSuites(),wf=workflowText();
 for(const [f,why] of Object.entries(UNWIRED)){
  assert.ok(fs.existsSync(path.join(REPO,'tools',f)),`UNWIRED lists ${f}, which does not exist; delete its entry`);
  assert.equal(runBy(f,rules,wf),null,`UNWIRED lists ${f}, which now runs (${runBy(f,rules,wf)}); delete its entry`);
  assert.ok(why.length>40,`UNWIRED's entry for ${f} gives no reason`);
 }
});

test('case 4: the matcher reads a workflow step and ignores a commented one',()=>{
 const wf=code('steps:\n  # - run: node tools/a-test.cjs\n  - run: node tools/b-test.cjs\n');
 assert.equal(runBy('a-test.cjs',new Set(),wf),null);
 assert.equal(runBy('b-test.cjs',new Set(),wf),'workflow');
});
