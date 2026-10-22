/**
 * SECURITY.md is a working policy, not the template it was scaffolded from: it carries no placeholder, it names a private
 * reporting channel and a response time, and every guardrail it ticks is one the repository actually runs. A ticked
 * line that cites a missing file, or claims an SBOM, provenance, SAST or pinned actions with no workflow doing it, fails.
 * This lives here rather than in .ai/doctor.mjs, which is a generated reference runner. Reads files only: no network.
 * Run directly: node tools/security-policy-test.cjs
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const read=(...p)=>fs.readFileSync(path.join(REPO,...p),'utf8');
const has=(p)=>fs.existsSync(path.join(REPO,p));
const policy=read('SECURITY.md');

/** The body of one `## heading` section, up to the next `## `. */
function section(text,heading){
 const lines=text.split(/\r?\n/),start=lines.findIndex((l)=>l.trim().toLowerCase()==='## '+heading.toLowerCase());
 if(start<0)return null;
 let end=start+1;while(end<lines.length&&!/^##\s/.test(lines[end]))end++;
 return lines.slice(start+1,end).join('\n');
}
/** Checklist items, each with its wrapped continuation lines: { ticked, text }. */
function checklist(text){
 const out=[];
 for(const line of text.split(/\r?\n/)){
  const m=line.match(/^- \[( |x|X)\]\s*(.*)$/);
  if(m){out.push({ticked:m[1]!==' ',text:m[2]});continue;}
  const last=out[out.length-1];
  if(last&&/^\s{2,}\S/.test(line))last.text+=' '+line.trim();
  else if(!line.trim()||/^\S/.test(line))out.push(null);
 }
 return out.filter(Boolean);
}
/** Repository paths a line cites in backticks. */
const cited=(text)=>[...text.matchAll(/`([^`\s]+)`/g)].map((m)=>m[1]).filter((p)=>/^(\.github|\.ai|scripts|tools|desk|deathride|tv-app|core|companion)\//.test(p)||/^[A-Z][\w-]*\.md$/.test(p));
/** A workflow's YAML with its comments removed: a step a comment describes (or one that was unwired) runs nothing. */
const code=(yaml)=>yaml.split(/\r?\n/).filter((l)=>!/^\s*#/.test(l)).map((l)=>l.replace(/\s+#\s.*$/,'')).join('\n');
const workflows=()=>fs.readdirSync(path.join(REPO,'.github','workflows')).filter((f)=>/\.ya?ml$/.test(f)).map((f)=>({f,text:code(read('.github','workflows',f))}));
/** The events a workflow's `on:` block names. */
const triggersOf=(text)=>{const m=/^on:\s*\n((?:[ \t]+.*\n?)*)/m.exec(text);return m?[...m[1].matchAll(/^ {2}(\w+):/gm)].map((x)=>x[1]):[];};
const anyWorkflow=(re)=>workflows().some((w)=>re.test(w.text));

test('case 1: no template placeholder is left',()=>{
 assert.doesNotMatch(policy,/\bTODO\b|\bTBD\b|\bFIXME\b/,'SECURITY.md still has a TODO marker');
 assert.doesNotMatch(policy,/<!--/,'SECURITY.md still has a template comment');
 assert.doesNotMatch(policy,/fill in for this repo/i,'SECURITY.md still has the template sentence');
});

test('case 2: a reporter has a private channel and a response time',()=>{
 const s=(section(policy,'Reporting a vulnerability')??'').replace(/\s+/g,' ');
 assert.ok(s.trim(),'no "## Reporting a vulnerability" section');
 assert.match(s,/security\/advisories\/new|private vulnerability reporting|mailto:/i,'the reporting section names no private channel');
 assert.match(s,/\b\d+\s*(business\s+)?(days?|hours?)\b/i,'the reporting section gives no response time');
 assert.match(s,/not open a public issue|do not (file|open) .*public/i,'the reporting section does not keep the report out of public issues');
});

test('case 3: the guardrails list has ticked and open lines, each ticked one citing files that exist',()=>{
 const items=checklist(section(policy,'Automated guardrails we run')??'');
 assert.ok(items.some((i)=>i.ticked),'no guardrail is ticked');
 for(const i of items.filter((x)=>x.ticked)){
  const paths=cited(i.text);
  assert.ok(paths.length,`a ticked guardrail cites no file that runs it: ${i.text.slice(0,80)}`);
  for(const p of paths)assert.ok(has(p),`a ticked guardrail cites ${p}, which does not exist`);
 }
});

test('case 4: a ticked claim is one a workflow actually makes',()=>{
 const items=checklist(section(policy,'Automated guardrails we run')??'');
 const ticked=(re)=>items.some((i)=>i.ticked&&re.test(i.text));
 if(ticked(/\bSBOM\b/))assert.ok(anyWorkflow(/actions\/attest-sbom@/),'SBOM is ticked but no workflow runs actions/attest-sbom');
 if(ticked(/provenance/i))assert.ok(anyWorkflow(/actions\/attest-build-provenance@/),'provenance is ticked but no workflow attests it');
 if(ticked(/\bSAST\b|CodeQL|Semgrep/))assert.ok(anyWorkflow(/github\/codeql-action|semgrep/i),'SAST is ticked but no workflow runs CodeQL or Semgrep');
 if(ticked(/gitleaks|trufflehog|secret scanning of history/i))assert.ok(anyWorkflow(/gitleaks|trufflehog/i),'history secret scanning is ticked but no workflow runs it');
 if(ticked(/graphs?\b[^.]{0,60}\b(?:are|is) submitted|dependency-submission/i))assert.ok(anyWorkflow(/dependency-submission@/),'a submitted dependency graph is ticked but no workflow runs dependency-submission');
 for(const i of items.filter((x)=>x.ticked&&/every pull request/i.test(x.text))){
  const cites=cited(i.text).filter((p)=>p.startsWith('.github/workflows/'));
  assert.ok(cites.some((p)=>has(p)&&triggersOf(code(read(p))).includes('pull_request')),`"${i.text.slice(0,70)}" claims every pull request, but none of ${cites.join(', ')||'(no workflow cited)'} runs on pull_request`);
 }
 if(ticked(/\bDependabot\b/))assert.ok(has('.github/dependabot.yml'),'Dependabot is ticked but .github/dependabot.yml is missing');
 if(ticked(/pinned/i)){
  const floating=workflows().flatMap((w)=>[...w.text.matchAll(/^\s*-?\s*uses:\s*[\w.-]+\/[\w.-]+(?:\/[^@\s]+)?@([^\s#]+)/gm)].filter((m)=>!/^[0-9a-f]{40}$/.test(m[1])).map((m)=>`${w.f}: ${m[0].trim()}`));
  assert.deepEqual(floating,[],'pinned actions are ticked but these refs still float');
 }
});

test('case 5: the reader of the checklist is told where the check lives',()=>{
 assert.match(policy,/tools\/security-policy-test\.cjs/);
 assert.ok(anyWorkflow(/node tools\/security-policy-test\.cjs/),'no workflow runs this suite');
});

test('case 6: the doctor\'s never-commit guardrail sees every secret file AGENTS.md names (desk/.env.local, keys, keystores)',()=>{
 const os=require('node:os'),{execFileSync}=require('node:child_process');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'never-commit-'));
 try{
  fs.mkdirSync(path.join(tmp,'.ai'));
  for(const f of ['doctor.mjs','manifest.yaml','guardrails.yaml'])fs.copyFileSync(path.join(REPO,'.ai',f),path.join(tmp,'.ai',f));
  const seeded=['desk/.env.local','desk/.env','deathride/app/release.jks','tv-app/upload.keystore','.env.local'];
  for(const f of seeded){fs.mkdirSync(path.dirname(path.join(tmp,f)),{recursive:true});fs.writeFileSync(path.join(tmp,f),'SECRET=1\n');}
  const git=(...a)=>execFileSync('git',a,{cwd:tmp,stdio:['ignore','pipe','pipe'],encoding:'utf8'});
  git('init','-q');git('add','-f','--',...seeded);
  let out='';
  try{out=execFileSync(process.execPath,['.ai/doctor.mjs','--json'],{cwd:tmp,encoding:'utf8',stdio:['ignore','pipe','pipe'],env:{...process.env,ASCENT_CONFORMANCE_URL:'',ASCENT_CONFORMANCE_TOKEN:''}});}
  catch(e){out=String(e.stdout||'');}
  const summary=JSON.parse(out.trim().split(/\r?\n/).filter((l)=>l.startsWith('{')).pop());
  const g=summary.findings.find((f)=>f.check==='guardrail.never-commit');
  assert.ok(g,'the doctor emitted no guardrail.never-commit finding');
  assert.equal(g.level,'fail',`the doctor passed a tree that tracks ${seeded.join(', ')}: ${g.message||g.msg}`);
  for(const f of seeded)assert.match(g.message||g.msg,new RegExp('(^|[ :,])'+f.replace(/[.]/g,'[.]')+'(,|$)'),`the never-commit guardrail does not see ${f}`);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
