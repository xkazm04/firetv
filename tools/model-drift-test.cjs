/**
 * The model-drift watch (tools/model-drift.cjs): which change in the lab bench's numbers alerts the owner, what --status
 * says about the committed records, and that a run writes one record and a derived DRIFT.md into the directory it is
 * given. No model is called: the comparisons run on hand-made records, and the end-to-end runs are the bench's replay
 * (recorded answers at the provider seam). Every record goes to a scratch directory under the OS temp dir; the
 * committed uat/drift/ is only read, and must be byte-identical afterwards. Run directly: node tools/model-drift-test.cjs
 * (the replay cases transpile desk TypeScript, so they need desk/node_modules).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {test,after}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const TOOL=path.join(__dirname,'model-drift.cjs');
const D=require('./model-drift.cjs');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'desk-model-drift-test-'));
after(()=>fs.rmSync(scratch,{recursive:true,force:true}));

/** The committed uat/drift/, file by file, before any case runs. */
const snapshot=(dir)=>{try{return Object.fromEntries(fs.readdirSync(dir).sort().map((f)=>[f,fs.readFileSync(path.join(dir,f),'utf8')]));}catch{return null;}};
const committed=snapshot(D.DRIFT);

const cli=(args,env={})=>spawnSync(process.execPath,[TOOL,...args],{encoding:'utf8',timeout:120000,env:{...process.env,DESK_DATA_DIR:'',DESK_TEXT_ENGINE:'',MODEL_DRIFT_ALLOW_LIVE:'',GITHUB_STEP_SUMMARY:'',...env}});
let n=0;
const fresh=()=>{const d=path.join(scratch,`d${++n}`);fs.mkdirSync(d);return d;};

/** A clean live record: the bench's replay numbers, every criterion passing. */
function rec(patch={},at='2026-10-05T08:00:00.000Z'){
 const r={v:1,at,mode:'live',commit:'abc1234',providers:{text:'claude-cli',vision:'ollama'},
  read:{maths:{of:10,found:10,exact:10,selects:10,error:null},essay:{of:5,found:5,exact:5,selects:5,error:null}},
  hints:{of:12,leaked:0,reasked:0,reached:0,latex:3,errors:0},retrieval:{of:9,right:8,errors:0},verdicts:{A:'pass',B:'pass',C:'pass'}};
 for(const [k,v] of Object.entries(patch)){const ks=k.split('.');let o=r;for(const x of ks.slice(0,-1))o=o[x];o[ks.at(-1)]=v;}
 return r;
}
const write=(dir,file,r)=>fs.writeFileSync(path.join(dir,file),JSON.stringify(r));

test('case 1: the same numbers twice -> no alert; a first record alerts on nothing but notes it has nothing to compare with',()=>{
 assert.deepEqual(D.compare(rec(),rec()),{alerts:[],notes:[]});
 const first=D.compare(null,rec());
 assert.deepEqual(first.alerts,[]);
 assert.match(first.notes.join('\n'),/nothing to compare/);
});

test('case 2: each drift rule fires at its threshold and not one step below it',()=>{
 const fires=(patch)=>D.compare(rec(),rec(patch)).alerts;
 assert.deepEqual(fires({'hints.leaked':1}),[],'one leak more of 12 is noise');
 assert.match(fires({'hints.leaked':2}).join('\n'),/gave the answer away.*0 -> 2 of 12/);
 assert.deepEqual(fires({'hints.reasked':1}),[]);
 assert.match(fires({'hints.reasked':2}).join('\n'),/re-asked.*0 -> 2 of 12/);
 assert.match(fires({'hints.latex':4}).join('\n'),/LaTeX.*3 -> 4 of 12/);
 assert.deepEqual(fires({'hints.latex':2}),[],'less LaTeX is better, not drift');
 assert.deepEqual(fires({'retrieval.right':7}),[]);
 assert.match(fires({'retrieval.right':6}).join('\n'),/lesson picks.*8 -> 6 of 9/);
 assert.match(fires({'read.maths.exact':9}).join('\n'),/maths page read, exact 10 -> 9 of 10/);
 assert.match(fires({'read.essay.selects':4}).join('\n'),/essay page read, selects 5 -> 4 of 5/);
 assert.deepEqual(fires({'retrieval.right':9,'hints.leaked':0,'read.maths.exact':10}),[],'an improvement never alerts');
 // the rules the README documents are the rules the code applies
 const readme=fs.readFileSync(path.join(REPO,'uat/drift/README.md'),'utf8');
 for(const r of D.RULES)assert(readme.includes(`\`${r.key}\``),`uat/drift/README.md documents ${r.key}`);
});

test('case 3: hard alerts need no previous record - an answer on the TV, an errored pipeline, a failing kill criterion',()=>{
 assert.match(D.compare(null,rec({'hints.reached':1})).alerts.join('\n'),/withholding: on 1 of 12/);
 assert.match(D.compare(null,rec({'read.maths.error':'ollama is not running'})).alerts.join('\n'),/unmeasured: the maths page read failed \(ollama is not running\)/);
 assert.match(D.compare(null,rec({'hints.errors':12})).alerts.join('\n'),/unmeasured: 12 of 12/);
 assert.match(D.compare(null,rec({'retrieval.errors':1})).alerts.join('\n'),/unmeasured: 1 of 9 lesson picks/);
 assert.match(D.compare(null,rec({'verdicts.B':'fail'})).alerts.join('\n'),/kill criterion B \(hints\) fails/);
 assert.match(D.compare(rec(),rec({'verdicts.B':'fail'})).alerts.join('\n'),/kill criterion B \(hints\) went from pass to fail/);
});

test('case 4: a provider or model change is a note beside the alerts, never an alert on its own',()=>{
 const r=D.compare(rec(),rec({'providers.text':'codex'}));
 assert.deepEqual(r.alerts,[]);
 assert.deepEqual(r.notes,['provider text: claude-cli -> codex']);
 const both=D.compare(rec(),rec({'providers.text':'codex','hints.leaked':3}));
 assert.equal(both.alerts.length,1);
 assert.deepEqual(both.notes,['provider text: claude-cli -> codex'],'the note names the likely cause of the alert');
});

test('case 5: readRecords keeps only <day>-<n>.json records, oldest first; nextName numbers a day\'s runs',()=>{
 const d=fresh();
 write(d,'2026-10-05-1.json',rec({},'2026-10-05T08:00:00.000Z'));
 write(d,'2026-09-28-1.json',rec({},'2026-09-28T08:00:00.000Z'));
 write(d,'2026-10-05-2.json',rec({},'2026-10-05T09:00:00.000Z'));
 fs.writeFileSync(path.join(d,'README.md'),'# not a record');
 fs.writeFileSync(path.join(d,'DRIFT.md'),'# derived');
 fs.writeFileSync(path.join(d,'2026-10-06-1.json'),'{ not json');
 assert.deepEqual(D.readRecords(d).map((r)=>r.file),['2026-09-28-1.json','2026-10-05-1.json','2026-10-05-2.json']);
 assert.equal(D.nextName(d,'2026-10-05T10:00:00.000Z'),'2026-10-05-3.json');
 assert.equal(D.nextName(d,'2026-10-07T10:00:00.000Z'),'2026-10-07-1.json');
 assert.deepEqual(D.readRecords(path.join(d,'missing')),[]);
});

test('case 6: statusOf - never measured, replay-only, fresh and clean, stale, and a newest record that alerted',()=>{
 const now=Date.parse('2026-10-12T08:00:00.000Z');
 const none=D.statusOf([],{now,maxAge:21});
 assert.equal(none.ok,false);assert.match(none.problems.join('\n'),/never measured/);
 const replayOnly=D.statusOf([{...rec(),mode:'replay',file:'2026-10-05-1.json'}],{now,maxAge:21});
 assert.equal(replayOnly.ok,false,'a replay measures the harness, not a model');assert.match(replayOnly.problems.join('\n'),/never measured/);
 const clean=D.statusOf([{...rec(),file:'2026-10-05-1.json'}],{now,maxAge:21});
 assert.equal(clean.ok,true,clean.problems.join('\n'));assert.equal(Math.round(clean.ageDays),7);
 const stale=D.statusOf([{...rec(),file:'2026-10-05-1.json'}],{now:Date.parse('2026-10-30T08:00:00.000Z'),maxAge:21});
 assert.equal(stale.ok,false);assert.match(stale.problems.join('\n'),/stale: .* 25 days old \(limit 21\)/);
 assert.equal(D.statusOf([{...rec(),file:'2026-10-05-1.json'}],{now:Date.parse('2026-10-30T08:00:00.000Z')}).ok,true,'no --max-age, no age limit');
 const drifted=D.statusOf([{...rec({},'2026-10-04T08:00:00.000Z'),file:'2026-10-04-1.json'},{...rec({'hints.leaked':2}),file:'2026-10-05-1.json'}],{now,maxAge:21});
 assert.equal(drifted.ok,false);assert.match(drifted.problems.join('\n'),/2026-10-05-1\.json alerted: drift: .*0 -> 2 of 12/);
 const unparsable=D.statusOf([{...rec({},'yesterday'),file:'2026-10-05-1.json'}],{now,maxAge:21});
 assert.equal(unparsable.ok,false,'a record whose date cannot be read is never fresh');
});

test('case 7: --status reads the directory it is given, prints the problem, and exits 1 or 0',()=>{
 const empty=fresh();
 const a=cli(['--status','--max-age','21','--dir',empty]);
 assert.equal(a.status,1,a.stderr);assert.match(a.stdout,/never measured/);
 const ok=fresh();
 write(ok,'2026-10-05-1.json',rec({},new Date(Date.now()-2*86400000).toISOString()));
 const b=cli(['--status','--max-age','21','--dir',ok]);
 assert.equal(b.status,0,b.stdout+b.stderr);assert.match(b.stdout,/ok: no alert, within 21 days/);
 const c=cli(['--status','--max-age','1','--dir',ok]);
 assert.equal(c.status,1);assert.match(c.stdout,/stale/);
 assert.equal(cli(['--status','--max-age','soon','--dir',ok]).status,2);
});

test('case 8 GUARD: --live refuses without MODEL_DRIFT_ALLOW_LIVE=1, and a replay refuses to write into uat/drift/',()=>{
 const d=fresh();
 const live=cli(['--live','--dir',d]);
 assert.equal(live.status,2,live.stdout);assert.match(live.stderr,/MODEL_DRIFT_ALLOW_LIVE=1/);
 assert.deepEqual(fs.readdirSync(d),[],'a refused run writes nothing');
 const nodir=cli(['--replay']);
 assert.equal(nodir.status,2);assert.match(nodir.stderr,/never goes into uat\/drift/);
 const into=cli(['--replay','--dir',D.DRIFT]);
 assert.equal(into.status,2);
 assert.equal(cli([]).status,2,'no mode, no run');
});

test('case 9: two replay runs -> two records and DRIFT.md; the second, whose model states x = 6 and x = 20, alerts and exits 1',()=>{
 const d=fresh();
 const first=cli(['--replay','--dir',d]);
 assert.equal(first.status,0,first.stdout+first.stderr);
 assert.match(first.stdout,/no alert/);
 const leaky=path.join(scratch,'leaky.json');
 fs.writeFileSync(leaky,JSON.stringify({hints:{
  'Solve for x: 3x - 7 = 11':{hint1:{hint:'x = 6',what_to_try_next:'Check it by substituting.'}},
  'Solve: x/4 + 3 = 8':{hint1:{hint:'x = 20',what_to_try_next:'Check it by substituting.'}},
 }}));
 const second=cli(['--replay',leaky,'--dir',d]);
 assert.equal(second.status,1,second.stdout+second.stderr);
 const recs=D.readRecords(d);
 assert.equal(recs.length,2);
 assert.deepEqual(recs.map((r)=>r.mode),['replay','replay']);
 assert.deepEqual(recs[0].alerts,[]);
 assert.deepEqual([recs[0].hints.leaked,recs[1].hints.leaked],[0,2]);
 assert.equal(recs[1].against,recs[0].file);
 assert.match(recs[1].alerts.join('\n'),/drift: maths problems whose hint gave the answer away \(first ask\) 0 -> 2 of 12/);
 assert.match(recs[1].alerts.join('\n'),/kill criterion B \(hints\) went from pass to fail/);
 assert.equal(recs[1].hints.reached,0,'the gate still kept both answers off the TV');
 // the record keeps counts, never the model's words
 assert.doesNotMatch(fs.readFileSync(path.join(d,recs[1].file),'utf8'),/x = 6|substituting/);
 const view=fs.readFileSync(path.join(d,'DRIFT.md'),'utf8');
 assert.match(view,new RegExp(`## Newest: ${recs[1].file.replace(/\./g,'\\.')} \\(compared with`));
 assert.match(view,/- ALERT drift: maths problems/);
 // a replay is never a live measurement
 const s=cli(['--status','--dir',d]);
 assert.equal(s.status,1);assert.match(s.stdout,/never measured/);
});

test('case 10 GUARD: the committed uat/drift/ is byte-identical after every case',()=>{
 assert.deepEqual(snapshot(D.DRIFT),committed);
});
