/**
 * The desk boundary check (tools/desk-boundaries.cjs) holds the layering desk/AGENTS.md states: engines are a leaf
 * behind their entry modules, rules reach no engine or Node built-in, only engines spawn, only the session writes.
 * Each case builds a small desk/src tree in a scratch directory and proves one rule fires on it (and stays quiet on the
 * legal neighbour); the last cases run it on the real desk, which must raise nothing beyond the OWED breaks, each of
 * which must still fire. No network, no model, no install.
 * Run directly: node tools/desk-boundaries-test.cjs
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const B=require('./desk-boundaries.cjs');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'desk-boundaries-test-'));
after(()=>fs.rmSync(scratch,{recursive:true,force:true}));

let n=0;
/** A scratch repo holding `files` ({ 'lib/x.ts': source }) under desk/src/. Returns its root. */
const tree=(files)=>{
 const root=path.join(scratch,String(++n));
 for(const [rel,src] of Object.entries(files)){const f=path.join(root,'desk','src',rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,src);}
 return root;
};
/** The problems a scratch tree raises, with no write allow-list and no owed break unless one is given. */
const run=(files,allow={},owed=[])=>B.check(tree(files),{allow,owed}).problems;
const rules=(ps)=>ps.map((p)=>`${p.rule} ${p.file.replace('desk/src/','')}`).sort();
/** The minimal legal desk: an engine with an internal helper, a rule, a pipeline that calls the engine, a session. */
const LEGAL={
 'lib/engines/types.ts':'export class EngineError extends Error {}\n',
 'lib/engines/registry.ts':'import { EngineError } from "./types";\nexport const provider = () => EngineError;\n',
 'lib/engines/text.ts':'import { spawn } from "node:child_process";\nimport { mkdtemp } from "node:fs/promises";\nimport { provider } from "./registry";\nexport const text = () => [spawn, mkdtemp, provider];\n',
 'lib/rules/maths.ts':'import type { Session } from "../session/store";\nimport { topic } from "../library/paths";\nexport const settle = (s: Session) => topic(s);\n',
 'lib/library/paths.ts':'import type { Session } from "@/lib/session/store";import { SYLLABUS } from "./syllabus";\nexport const topic = (s: unknown) => SYLLABUS[0];\n',
 'lib/library/syllabus.ts':'export const SYLLABUS = ["a"];\n',
 'lib/desk/hint.ts':'import { text } from "../engines/text";\nimport { EngineError, type Provider } from "../engines/types";\nimport type { provider } from "../engines/registry";\nimport { settle } from "@/lib/rules/maths";\nexport const hint = () => [text, EngineError, settle];\n',
 'lib/session/store.ts':'import { mkdirSync, writeFileSync } from "node:fs";\nimport { settle } from "../rules/maths";\nexport type Session = { id: string };\nexport const save = () => { mkdirSync("d"); writeFileSync("d/s.json", "{}"); return settle; };\n',
 'app/api/smoke/route.ts':'import { existsSync, readFileSync } from "node:fs";\nimport { text } from "@/lib/engines/text";\nexport const GET = () => [existsSync, readFileSync, text];\n',
};

test('case 1: the legal desk raises nothing',()=>{
 assert.deepEqual(run(LEGAL),[]);
});

test('case 2: an engine that loads a rule, a pipeline or the session breaks engines-leaf',()=>{
 const ps=run({...LEGAL,'lib/engines/vision.ts':'import { settle } from "../rules/maths";\nexport const vision = () => settle;\n'});
 assert.deepEqual(rules(ps),['engines-leaf lib/engines/vision.ts']);
 assert.match(ps[0].detail,/desk\/src\/lib\/rules\/maths\.ts/);
});

test('case 3: loading the registry, the deadline wrapper or a new engine file from outside breaks engine-internal; a type import does not',()=>{
 const ps=run({...LEGAL,
  'lib/engines/call.ts':'export const call = 1;\n',
  'lib/desk/read.ts':'import { provider } from "../engines/registry";\nexport const read = provider;\n',
  'lib/english/check.ts':'import {\n  call,\n} from "@/lib/engines/call";\nexport const check = call;\n',
  'lib/desk/typed.ts':'import type { provider } from "../engines/registry";\nexport type P = typeof provider;\n',
 });
 assert.deepEqual(rules(ps),['engine-internal lib/desk/read.ts','engine-internal lib/english/check.ts']);
});

test('case 4: a rule that reaches an engine through another module breaks rules-pure, and the chain is named',()=>{
 const ps=run({...LEGAL,'lib/library/syllabus.ts':'import { text } from "../engines/text";\nexport const SYLLABUS = [text];\n'});
 assert.deepEqual(rules(ps),['rules-pure lib/rules/maths.ts']);
 assert.match(ps[0].detail,/rules\/maths\.ts -> desk\/src\/lib\/library\/paths\.ts -> desk\/src\/lib\/library\/syllabus\.ts -> desk\/src\/lib\/engines\/text\.ts/);
});

test('case 5: a rule that loads a Node built-in breaks rules-pure; a type-only import of the session does not',()=>{
 const ps=run({...LEGAL,'lib/rules/week.ts':'import type { Session } from "../session/store";\nimport { readFileSync } from "fs";\nexport const week = (s: Session) => readFileSync;\n'});
 assert.deepEqual(rules(ps),['rules-pure lib/rules/week.ts']);
 assert.match(ps[0].detail,/Node built-in fs/);
});

test('case 6: a process started outside the engines breaks spawn-in-engines',()=>{
 const ps=run({...LEGAL,'lib/desk/ocr.ts':'import { execFile } from "node:child_process";\nexport const ocr = execFile;\n'});
 assert.deepEqual(rules(ps),['spawn-in-engines lib/desk/ocr.ts']);
});

test('case 7: a file written outside the session and the engines breaks state-in-session, named import or namespace',()=>{
 const ps=run({...LEGAL,
  'lib/desk/cache.ts':'import { readFileSync, writeFileSync } from "node:fs";\nexport const keep = () => writeFileSync("x", readFileSync("y"));\n',
  'lib/library/notes.ts':'import * as fs from "node:fs";\nexport const keep = () => fs.mkdirSync("x");\n',
  'lib/library/index.ts':'import fsp from "node:fs/promises";\nexport const look = () => fsp.readFile("x");\n',
 });
 assert.deepEqual(rules(ps),['state-in-session lib/desk/cache.ts','state-in-session lib/library/notes.ts']);
});

test('case 8: an allow-list entry excuses a reasoned writer, and a stale or missing entry is reported',()=>{
 const files={...LEGAL,'lib/library/lessons.ts':'import { writeFileSync } from "node:fs";\nexport const cache = () => writeFileSync("e.json", "{}");\n'};
 assert.deepEqual(run(files,{'desk/src/lib/library/lessons.ts':'derived cache'}),[]);
 const stale=run(LEGAL,{'desk/src/lib/library/paths.ts':'once wrote','desk/src/lib/library/gone.ts':'deleted'});
 assert.deepEqual(rules(stale),['state-in-session lib/library/gone.ts','state-in-session lib/library/paths.ts']);
});

test('case 9: fsWritesOf reads named, renamed, namespace, promises and require forms, and ignores reads',()=>{
 assert.deepEqual(B.fsWritesOf('import { existsSync, readFileSync } from "node:fs";'),[]);
 assert.deepEqual(B.fsWritesOf('import { writeFileSync as save, type Stats } from "fs";'),['writeFileSync']);
 assert.deepEqual(B.fsWritesOf('import fs from "node:fs";\nfs.readFileSync("a"); fs.appendFileSync("b", "c");'),['appendFileSync']);
 assert.deepEqual(B.fsWritesOf('import { promises as p } from "node:fs";\nawait p.rm("x");'),['rm']);
 assert.deepEqual(B.fsWritesOf('const { renameSync: mv } = require("node:fs");'),['renameSync']);
 assert.deepEqual(B.fsWritesOf('import type { WriteStream } from "node:fs";\nimport { writeFileSync } from "./disk";'),[]);
});

test('case 10: every entry module and every allow-listed writer exists in the real desk',()=>{
 const REPO=path.resolve(__dirname,'..');
 for(const f of B.ENTRY)assert.ok(fs.existsSync(path.join(REPO,f)),`ENTRY lists ${f}, which does not exist`);
 for(const [f,why] of Object.entries(B.WRITE_ALLOW)){
  assert.ok(fs.existsSync(path.join(REPO,f)),`WRITE_ALLOW lists ${f}, which does not exist`);
  assert.ok(why.length>20,`WRITE_ALLOW's entry for ${f} gives no reason`);
 }
});

test('case 11: the real desk keeps its layering, beyond the breaks OWED names',()=>{
 const r=B.check();
 assert.ok(r.files>50,`only ${r.files} source files found under desk/src/`);
 assert.deepEqual(r.problems.map((p)=>`${p.rule}: ${p.file} ${p.detail}`),[]);
 assert.equal(r.owed.length,B.OWED.length,'every OWED entry matches exactly one break on the real desk');
});

test('case 12: an owed break is reported, not failed; a new break of the same file still fails; an owed entry with no break left fails',()=>{
 const files={...LEGAL,'lib/rules/zip.ts':'import { inflateRawSync } from "node:zlib";\nexport const unzip = (b: Buffer) => inflateRawSync(b);\n'};
 const owed=[{rule:'rules-pure',file:'desk/src/lib/rules/zip.ts',detail:'node:zlib',why:'a parser, not a decision; moving it out of rules/ is the open question'}];
 const r=B.check(tree(files),{allow:{},owed});
 assert.deepEqual(r.problems,[]);
 assert.deepEqual(r.owed.map((p)=>`${p.rule} ${p.file.replace('desk/src/','')}`),['rules-pure lib/rules/zip.ts']);
 const worse={...files,'lib/rules/zip.ts':'import { inflateRawSync } from "node:zlib";\nimport { readFileSync } from "node:fs";\nexport const unzip = (p: string) => inflateRawSync(readFileSync(p));\n'};
 assert.deepEqual(rules(run(worse,{},owed)),['rules-pure lib/rules/zip.ts']);
 const gone=run(LEGAL,{},[{rule:'engines-leaf',file:'desk/src/lib/engines/text.ts',detail:'dataDir',why:'fixed since'}]);
 assert.deepEqual(gone.map((p)=>`${p.rule} ${p.file.replace('desk/src/','')} ${/no longer fires/.test(p.detail)}`),['engines-leaf lib/engines/text.ts true']);
});

test('case 13: every OWED entry names a rule, a file that exists and a reason',()=>{
 const REPO=path.resolve(__dirname,'..'),RULES=['engines-leaf','engine-internal','rules-pure','spawn-in-engines','state-in-session'];
 for(const o of B.OWED){
  assert.ok(RULES.includes(o.rule),`OWED names an unknown rule ${o.rule}`);
  assert.ok(fs.existsSync(path.join(REPO,o.file)),`OWED lists ${o.file}, which does not exist`);
  assert.ok(o.detail&&o.why&&o.why.length>20,`OWED's entry for ${o.file} gives no detail or no reason`);
 }
});
