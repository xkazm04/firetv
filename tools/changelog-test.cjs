/**
 * The changelog (CHANGELOG.md) keeps its shape: one section per product plus the harness, each opening with
 * `### Unreleased`, then dated milestones `### YYYY-MM-DD: ...`, newest first. Every relative link in it resolves, so
 * a renamed doc cannot silently break the routing. The Definition of Done and the PR template still ask for the line.
 * Reads files only: no model, no network, nothing written. Run directly: node tools/changelog-test.cjs.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const REPO=path.resolve(__dirname,'..');
const FILE=path.join(REPO,'CHANGELOG.md');
const SECTIONS=['Study Desk','Telestrator','Repo and agent harness'];
const src=fs.readFileSync(FILE,'utf8');
const lines=src.split(/\r?\n/);

/** The `## ` sections in order, each with its `### ` headings. */
function sections(){
 const out=[];let cur=null;
 for(const l of lines){
  if(/^## /.test(l)){cur={name:l.slice(3).trim(),heads:[]};out.push(cur);}
  else if(/^### /.test(l)&&cur)cur.heads.push(l.slice(4).trim());
 }
 return out;
}
const isDay=(s)=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return false;const d=new Date(`${s}T00:00:00Z`);return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;};

test('case 1: one section per product and the harness, in that order, and no other',()=>{
 assert.deepEqual(sections().map((s)=>s.name),SECTIONS);
});

test('case 2: every section opens with ### Unreleased, then dated milestones newest first',()=>{
 for(const s of sections()){
  assert.equal(s.heads[0],'Unreleased',`${s.name}: the first ### heading is Unreleased`);
  assert(s.heads.length>1,`${s.name}: at least one dated milestone`);
  const days=[];
  for(const h of s.heads.slice(1)){
   const m=/^(\S+): \S.*$/.exec(h);
   assert(m,`${s.name}: "### ${h}" is "### YYYY-MM-DD: what landed"`);
   assert(isDay(m[1]),`${s.name}: "${m[1]}" is a real calendar date`);
   days.push(m[1]);
  }
  for(let i=1;i<days.length;i++)assert(days[i]<days[i-1],`${s.name}: ${days[i-1]} comes before ${days[i]}, newest first, one heading per day`);
 }
 // the Unreleased block is not empty: it says what is pending, or "Nothing yet."
 for(const s of SECTIONS){
  const at=lines.indexOf(`## ${s}`),un=lines.indexOf('### Unreleased',at);
  const body=[];for(let i=un+1;i<lines.length&&!/^##/.test(lines[i]);i++)if(lines[i].trim())body.push(lines[i]);
  assert(body.length>0,`${s}: Unreleased says something, if only "Nothing yet."`);
 }
});

test('case 3: every relative link resolves to a file or directory in the repository',()=>{
 const links=[...src.matchAll(/\]\(([^)\s]+)\)/g)].map((m)=>m[1]);
 const local=links.filter((t)=>!/^[a-z][a-z0-9+.-]*:/i.test(t)&&!t.startsWith('#'));
 assert(local.length>=20,`the changelog routes to its docs (${local.length} relative links)`);
 const broken=local.filter((t)=>!fs.existsSync(path.join(REPO,decodeURIComponent(t.split('#')[0]))));
 assert.deepEqual(broken,[],'every relative link in CHANGELOG.md resolves');
});

test('case 4: the Definition of Done and the PR template still ask for the changelog line',()=>{
 assert.match(fs.readFileSync(path.join(REPO,'CONTRIBUTING.md'),'utf8'),/CHANGELOG\.md/);
 assert.match(fs.readFileSync(path.join(REPO,'.github/pull_request_template.md'),'utf8'),/CHANGELOG\.md/);
});
