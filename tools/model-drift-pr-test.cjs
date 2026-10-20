/**
 * The pre-merge drift check (tools/model-drift-pr.cjs): which pull requests owe a live record, when that record is
 * judged good enough against the base's newest live record, and that the live surface is the bench's real import graph.
 * No model is called and nothing is written: the verdicts run on hand-made records with a stubbed history, and the
 * surface is read from the working tree. Run directly: node tools/model-drift-pr-test.cjs (no desk/node_modules needed).
 * .github/workflows/model-drift-pr.yml runs it on every pull request, before the check itself.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const TOOL=path.join(__dirname,'model-drift-pr.cjs');
const P=require('./model-drift-pr.cjs');

const SURFACE=['desk/src/lib/engines/','tools/lab-bench.cjs','desk/src/lib/desk/hint.ts','desk/src/lib/rules/maths.ts'];
/** A clean live record, as tools/model-drift-test.cjs builds one. */
function rec(patch={},at='2026-10-05T08:00:00.000Z',file='2026-10-05-1.json'){
 const r={v:1,at,mode:'live',commit:'abc1234',providers:{text:'claude-cli',vision:'ollama'},
  read:{maths:{of:10,found:10,exact:10,selects:10,error:null}},
  hints:{of:12,leaked:0,reasked:0,reached:0,latex:0,errors:0},retrieval:{of:9,right:8,errors:0},verdicts:{A:'pass',B:'pass',C:'pass'}};
 for(const [k,v] of Object.entries(patch)){const ks=k.split('.');let o=r;for(const x of ks.slice(0,-1))o=o[x];o[ks.at(-1)]=v;}
 return {...r,file,path:'uat/drift/'+file};
}
const fresh=()=>[];
const check=(o)=>P.prCheckOf({surface:SURFACE,changed:[],added:[],base:[],staleOf:fresh,...o});

test('case 1: a pull request that leaves the live surface alone owes no model call',()=>{
 const r=check({changed:['docs/AI_HARNESS.md','desk/src/tv/screens.tsx','desk/src/lib/desk/essay.ts']});
 assert.equal(r.ok,true);
 assert.deepEqual(r.touched,[]);
 assert.deepEqual(r.problems,[]);
});

test('case 2: a prompt change with no live record fails, and a replay record does not count as one',()=>{
 const none=check({changed:['desk/src/lib/desk/hint.ts']});
 assert.equal(none.ok,false);
 assert.match(none.problems.join('\n'),/no live record.*hint\.ts.*model-drift\.ps1/);
 const replay=check({changed:['desk/src/lib/engines/text.ts','uat/drift/2026-10-06-1.json'],added:[rec({mode:'replay'},'2026-10-06T08:00:00.000Z','2026-10-06-1.json')]});
 assert.equal(replay.ok,false);
 assert.match(replay.problems.join('\n'),/no live record/);
});

test('case 3: a fresh live record that holds the baseline passes',()=>{
 const base=[rec()],mine=rec({},'2026-10-06T08:00:00.000Z','2026-10-06-1.json');
 const r=check({changed:['desk/src/lib/desk/hint.ts',mine.path],added:[mine],base});
 assert.equal(r.ok,true,r.problems.join('\n'));
 assert.equal(r.record.file,'2026-10-06-1.json');
 assert.equal(r.baseline.file,'2026-10-05-1.json');
});

test('case 4: a live record that drifted against the base fails, naming the baseline',()=>{
 const base=[rec()],mine=rec({'hints.leaked':2},'2026-10-06T08:00:00.000Z','2026-10-06-1.json');
 const r=check({changed:['desk/src/lib/desk/hint.ts',mine.path],added:[mine],base});
 assert.equal(r.ok,false);
 assert.match(r.problems.join('\n'),/2026-10-06-1\.json alerted against the base's newest live record 2026-10-05-1\.json: drift: .*0 -> 2/);
});

test('case 5: the first live record is judged on the hard alerts alone',()=>{
 const clean=rec({},'2026-10-06T08:00:00.000Z','2026-10-06-1.json');
 assert.equal(check({changed:['tools/lab-bench.cjs',clean.path],added:[clean]}).ok,true);
 const leaked=rec({'hints.reached':1},'2026-10-06T08:00:00.000Z','2026-10-06-1.json');
 const r=check({changed:['tools/lab-bench.cjs',leaked.path],added:[leaked]});
 assert.equal(r.ok,false);
 assert.match(r.problems.join('\n'),/with no baseline yet: withholding/);
});

test('case 6: the record must have measured this code: a later surface edit, an unknown commit or no commit fails',()=>{
 const mine=rec({},'2026-10-06T08:00:00.000Z','2026-10-06-1.json'),changed=['desk/src/lib/desk/hint.ts',mine.path];
 const stale=check({changed,added:[mine],base:[rec()],staleOf:(c)=>(assert.equal(c,'abc1234'),['desk/src/lib/desk/hint.ts'])});
 assert.equal(stale.ok,false);
 assert.match(stale.problems.join('\n'),/stale: desk\/src\/lib\/desk\/hint\.ts changed after abc1234/);
 const lost=check({changed,added:[mine],base:[rec()],staleOf:()=>null});
 assert.match(lost.problems.join('\n'),/this history does not hold/);
 const nameless=check({changed,added:[{...mine,commit:null}],base:[rec()]});
 assert.match(nameless.problems.join('\n'),/names no commit/);
});

test('case 7: with two added records the newest is judged',()=>{
 const a=rec({'hints.leaked':3},'2026-10-06T08:00:00.000Z','2026-10-06-1.json'),b=rec({},'2026-10-06T09:00:00.000Z','2026-10-06-2.json');
 const r=check({changed:['desk/src/lib/desk/hint.ts',a.path,b.path],added:[a,b],base:[rec()]});
 assert.equal(r.ok,true,r.problems.join('\n'));
 assert.equal(r.record.file,'2026-10-06-2.json');
});

test('case 8: a committed record is append-only, touched surface or not',()=>{
 const r=check({changed:['uat/drift/2026-10-05-1.json']});
 assert.equal(r.ok,false);
 assert.match(r.problems.join('\n'),/append-only: .*2026-10-05-1\.json/);
 assert.equal(check({changed:['uat/drift/DRIFT.md','uat/drift/README.md']}).ok,true);
});

test('case 9: parseRecords keeps only drift records, oldest first',()=>{
 const t=(r)=>JSON.stringify(r);
 const got=P.parseRecords([
  {file:'uat/drift/2026-10-06-1.json',text:t(rec({},'2026-10-06T08:00:00.000Z'))},
  {file:'uat/drift/README.md',text:'# not a record'},
  {file:'uat/drift/2026-10-05-1.json',text:t(rec())},
  {file:'uat/drift/2026-10-07-1.json',text:'{not json'},
 ]);
 assert.deepEqual(got.map((r)=>r.file),['2026-10-05-1.json','2026-10-06-1.json']);
 assert.equal(got[0].path,'uat/drift/2026-10-05-1.json');
});

test('case 10: importsOf reads runtime imports only, across lines and on a shared line',()=>{
 const src=[
  'import { text } from "../engines/text";',
  'import type { Subject } from "../session/store";',
  'import {',
  '  leaks,',
  '  type Settled,',
  '} from "../rules/maths";',
  'import type { A } from "@/lib/session/store";import { SYLLABUS } from "./syllabus";',
  'export type { Lesson } from "./lessons.data";',
  'export * from "./vtt";',
  'import path from "node:path";',
  'const later = await import("./lazy");',
 ].join('\n');
 assert.deepEqual(P.importsOf(src).sort(),['../engines/text','../rules/maths','./lazy','./syllabus','./vtt','node:path'].sort());
});

test('case 11: closureOf follows relative and @/ imports, resolves .ts and index.ts, and survives a cycle',()=>{
 const files={
  'desk/src/lib/desk/hint.ts':'import { a } from "../rules/a";\nimport x from "react";',
  'desk/src/lib/rules/a.ts':'import { b } from "@/lib/rules/b";\nimport { h } from "../desk/hint";',
  'desk/src/lib/rules/b/index.ts':'import type { T } from "../t";',
  'desk/src/lib/rules/t.ts':'',
 };
 const got=P.closureOf(['desk/src/lib/desk/hint.ts','desk/src/lib/desk/gone.ts'],{read:(f)=>files[f],isFile:(f)=>f in files});
 assert.deepEqual(got,['desk/src/lib/desk/hint.ts','desk/src/lib/rules/a.ts','desk/src/lib/rules/b/index.ts']);
});

test('case 12: the real surface is the bench\'s own import graph',()=>{
 const entries=P.benchEntries(fs.readFileSync(path.join(REPO,'tools/lab-bench.cjs'),'utf8'));
 assert.ok(entries.length>=5,`the bench loads ${entries.length} desk modules`);
 for(const e of entries) assert.ok(fs.statSync(path.join(REPO,e)).isFile(),`the bench loads ${e}, which must exist`);
 const surface=P.surfaceOf();
 for(const f of [...entries,'desk/src/lib/engines/text.ts','desk/src/lib/engines/vision.ts','tools/lab-bench.cjs','tools/lab-corpus.cjs'])
  assert.ok(P.onSurface(f,surface),`${f} is on the live surface`);
 for(const s of surface) if(!s.endsWith('/')) assert.ok(fs.statSync(path.join(REPO,s)).isFile(),`${s} exists`);
 // What the hint writer imports at run time widens the surface; what it imports as a type does not.
 assert.ok(P.onSurface('desk/src/lib/rules/school.ts',surface));
 for(const f of ['docs/AI_HARNESS.md','desk/src/tv/screens.tsx','desk/src/lib/session/store.ts'])
  assert.equal(P.onSurface(f,surface),false,`${f} is off the live surface`);
});

test('case 13: the CLI refuses without --base, lists the surface, and passes an empty diff',()=>{
 const run=(args)=>spawnSync(process.execPath,[TOOL,...args],{cwd:REPO,encoding:'utf8',timeout:60000,env:{...process.env,GITHUB_STEP_SUMMARY:''}});
 const bare=run([]);
 assert.equal(bare.status,2);
 assert.match(bare.stderr,/usage/);
 const listed=run(['--surface']);
 assert.equal(listed.status,0);
 assert.ok(listed.stdout.split(/\r?\n/).includes('desk/src/lib/desk/hint.ts'));
 const same=run(['--base','HEAD','--head','HEAD']);
 assert.equal(same.status,0,same.stdout+same.stderr);
 assert.match(same.stdout,/0 changed file\(s\), 0 on the live surface\nok: the live surface is untouched/);
});
