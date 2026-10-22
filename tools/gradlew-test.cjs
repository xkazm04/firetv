/**
 * tools/gradlew.cjs starts the root Gradle wrapper wherever the caller stands and whatever the host's command lookup
 * does. Each case copies the script into a scratch "repository" whose wrapper is a stub that prints its arguments and
 * exits 7, then runs it the way the manifest, AGENTS.md and CI do. The scratch root has a space in its path, and the
 * child gets NoDefaultCurrentDirectoryInExePath=1: with it set, cmd.exe does not look in the current directory for a
 * bare command name, so a wrapper started as plain `gradlew.bat` is "not recognized" and Gradle never starts.
 * No Gradle, no JDK, no network. Run directly: node tools/gradlew-test.cjs
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const SCRIPT=path.join(__dirname,'gradlew.cjs');
const win=process.platform==='win32';

/** A scratch repo root (with a space in its path) holding tools/gradlew.cjs and a stub wrapper. */
function scratch(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gradlew test '));
 fs.mkdirSync(path.join(root,'tools'));
 fs.copyFileSync(SCRIPT,path.join(root,'tools','gradlew.cjs'));
 fs.writeFileSync(path.join(root,'gradlew.bat'),'@echo off\r\necho STUB %*\r\nexit /b 7\r\n');
 fs.writeFileSync(path.join(root,'gradlew'),'#!/bin/sh\necho "STUB $*"\nexit 7\n',{mode:0o755});
 return root;
}
const env={...process.env,NoDefaultCurrentDirectoryInExePath:'1'};
const run=(root,cwd,args)=>spawnSync(process.execPath,[path.join(root,'tools','gradlew.cjs'),...args],{cwd,env,encoding:'utf8'});

test('case 1: the wrapper starts from the repo root with NoDefaultCurrentDirectoryInExePath set, and its exit code is kept',()=>{
 const root=scratch();
 try{
  const r=run(root,root,[':core:test','--console=plain']);
  assert.match(r.stdout,/STUB :core:test --console=plain/,`the wrapper did not start: ${(r.stdout+r.stderr).trim()}`);
  assert.equal(r.status,7,'the wrapper\'s exit code was not passed through');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('case 2: the wrapper starts from another directory too (it runs at the repo root, not the caller\'s)',()=>{
 const root=scratch(),elsewhere=fs.mkdtempSync(path.join(os.tmpdir(),'gradlew-elsewhere-'));
 try{
  const r=run(root,elsewhere,['--version']);
  assert.match(r.stdout,/STUB --version/,`the wrapper did not start: ${(r.stdout+r.stderr).trim()}`);
  assert.equal(r.status,7);
 }finally{fs.rmSync(root,{recursive:true,force:true});fs.rmSync(elsewhere,{recursive:true,force:true});}
});

test('case 3: on Windows the wrapper is named by its absolute path, never as a bare command name',()=>{
 const src=fs.readFileSync(SCRIPT,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
 assert.doesNotMatch(src,/spawnSync\(\s*["']gradlew\.bat["']/,'gradlew.cjs spawns a bare "gradlew.bat", which cmd only finds through the current directory');
});
