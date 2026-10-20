/**
 * The doctor gate (scripts/doctor-gate.mjs) gives the PR's agent-contract check one meaning: red when any doctor
 * finding fails outside the waivers, green otherwise, with a warning when a waiver no longer has a failure to excuse.
 * Its --claims mode holds every committed `verified: true` to the capability run on the same tree. Every case feeds
 * the script a hand-made doctor --json output in a scratch directory; the real .ai/manifest.yaml is only read. No
 * network, no model, no install. Run directly: node tools/doctor-gate-test.cjs
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {test,after}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const GATE=path.join(REPO,'scripts','doctor-gate.mjs');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'doctor-gate-test-'));
after(()=>fs.rmSync(scratch,{recursive:true,force:true}));

const gate=(args)=>spawnSync(process.execPath,[GATE,...args],{cwd:REPO,encoding:'utf8',timeout:60000,env:{...process.env,GITHUB_STEP_SUMMARY:''}});
let n=0;
const put=(name,text)=>{const f=path.join(scratch,`${++n}-${name}`);fs.writeFileSync(f,text);return f;};
/** A doctor output: the human readout, then the --json summary as the last line. */
const doctorOut=(findings)=>put('doctor.out',
 '\n.ai conformance - /repo\n\n  FAIL  something\n\nConformance: 80%\n'+
 JSON.stringify({score:80,fails:findings.filter((f)=>f.level==='fail').length,warns:findings.filter((f)=>f.level==='warn').length,unchecked:0,scored:findings.length,findings})+'\n');
const f=(check,level,msg=check)=>({check,level,msg});
const BASE=[f('structure','pass'),f('pointer.memory','pass'),f('control.prepush.lint.backing','warn')];
const PREPUSH=f('control.prepush','fail','prePush controls declared but NO local hook');

test('case 1: only the waived control.prepush fails, so the gate is green',()=>{
 const r=gate([doctorOut([...BASE,PREPUSH])]);
 assert.equal(r.status,0,r.stderr);
 assert.match(r.stdout,/waived \(0011\)/);
 assert.doesNotMatch(r.stdout,/::warning::/);
});

test('case 2: any other fail turns the gate red and is named',()=>{
 const r=gate([doctorOut([...BASE,PREPUSH,f('guardrail.never-commit','fail','GUARDRAIL VIOLATION')])]);
 assert.equal(r.status,1);
 assert.match(r.stderr,/guardrail\.never-commit/);
 assert.doesNotMatch(r.stderr,/control\.prepush/);
});

test('case 3: a failed capability run is not waived',()=>{
 const r=gate([doctorOut([...BASE,PREPUSH,f('capability.test.run','fail','capability "test" FAILED')])]);
 assert.equal(r.status,1);
 assert.match(r.stderr,/capability\.test\.run/);
});

test('case 4: a waiver with nothing left to excuse warns, and the gate stays green',()=>{
 const r=gate([doctorOut(BASE)]);
 assert.equal(r.status,0,r.stderr);
 assert.match(r.stdout,/::warning::The waiver for control\.prepush/);
});

test('case 5: an output with no --json summary is red, never a silent pass',()=>{
 const r=gate([put('crashed.out','\n.ai conformance - /repo\nTypeError: boom\n')]);
 assert.equal(r.status,1);
 assert.match(r.stderr,/No doctor --json summary/);
});

test('case 6: every waiver names a memory entry that exists',()=>{
 const r=gate(['--waivers']);
 assert.equal(r.status,0,r.stderr);
 const waivers=JSON.parse(r.stdout);
 const memory=fs.readdirSync(path.join(REPO,'.ai','memory'));
 assert(Object.keys(waivers).length>0);
 for(const [check,w] of Object.entries(waivers)){
  assert(memory.some((m)=>m.startsWith(`${w.memory}-`)),`${check}: .ai/memory/${w.memory}-*.md exists`);
  assert(w.why&&w.why.length>10,`${check}: the waiver says why`);
 }
});

/** A committed manifest in the doctor's one-line-per-capability shape. */
const manifest=(caps)=>put('manifest.yaml','schema: ai-manifest\ncapabilities:\n'+
 Object.entries(caps).map(([k,v])=>`  ${k}: { command: "echo ${k}, verified: true", verified: ${v} }`).join('\n')+'\n\npaths:\n  memory: .ai/memory/\n');
const ran=(results)=>doctorOut([...BASE,...Object.entries(results).map(([k,ok])=>f(`capability.${k}.run`,ok?'pass':'fail'))]);

test('case 7: claims - a committed true that held, and a false that passed, are green with a notice',()=>{
 const r=gate([ran({test:true,build:true}),'--claims',manifest({test:true,build:false})]);
 assert.equal(r.status,0,r.stderr);
 assert.match(r.stdout,/::notice::"build" passed/);
 assert.doesNotMatch(r.stdout,/::notice::"test"/);
});

test('case 8: claims - a committed true whose capability failed or never ran is a broken claim',()=>{
 const failed=gate([ran({test:false,build:true}),'--claims',manifest({test:true,build:false})]);
 assert.equal(failed.status,1);
 assert.match(failed.stdout,/::error::"test" is committed as verified: true/);
 const missing=gate([ran({build:true}),'--claims',manifest({test:true,build:true})]);
 assert.equal(missing.status,1);
 assert.match(missing.stderr,/test/);
});

test('case 9: claims - a doctor that did not --run proves nothing',()=>{
 const r=gate([doctorOut(BASE),'--claims',manifest({test:true})]);
 assert.equal(r.status,1);
 assert.match(r.stderr,/ran no capability/);
});

test('case 10: claims - the real manifest is read: every capability gets a committed flag',()=>{
 const real=path.join(REPO,'.ai','manifest.yaml');
 const names=[...fs.readFileSync(real,'utf8').matchAll(/^ {2}([\w-]+):\s*\{\s*command:/gm)].map((m)=>m[1]);
 assert(names.length>=5,'the manifest declares its capabilities');
 const r=gate([ran(Object.fromEntries(names.map((k)=>[k,true]))),'--claims',real]);
 assert.equal(r.status,0,r.stderr);
 for(const k of names)assert.match(r.stdout,new RegExp(`\\| ${k} \\| (true|false) \\| pass \\|`),`${k} is in the claims table`);
});
