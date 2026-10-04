import {readFile,writeFile,readdir} from 'node:fs/promises';
const folder='tracks/candidates';
const limits=Object.fromEntries((await readFile('tracks/outline-thresholds.csv','utf8')).trim().split(/\r?\n/).slice(1).map(l=>{const [k,v]=l.split(',');return [k,Number(v)]}));
const text=await readFile(`${folder}/manifest.csv`,'utf8'),lines=text.trim().split(/\r?\n/),keys=lines.shift().split(',');
const manifest=lines.map(l=>Object.fromEntries(l.split(',').map((v,i)=>[keys[i],v])));
const courses=[];
const owner=JSON.parse(await readFile(`${folder}/owner-decisions.json`,'utf8'));
let bossBalance=null;try{bossBalance=JSON.parse(await readFile(`${folder}/scrap-boss-balance.json`,'utf8'))}catch{}
let broadDuel=null;try{broadDuel=JSON.parse(await readFile(`${folder}/crown-7-a-duel-broad.json`,'utf8'))}catch{}
let finalProof=false;try{const complete=JSON.parse(await readFile(`${folder}/proof-final/_complete.json`,'utf8'));finalProof=complete.candidates===manifest.length+1&&complete.trials===(manifest.length+1)*72}catch{}
for(const row of manifest) {
 const d=JSON.parse(await readFile(`${folder}/drafts/${row.candidate}.json`,'utf8'));delete d.csv;delete d.recipe;d.manifest=row;
 for(const proofFolder of finalProof?['proof-final']:[`proof-12${d.role==='arena'?'-traversal':''}`,`proof-1${d.role==='arena'?'-traversal':''}`])try{const proof=JSON.parse(await readFile(`${folder}/${proofFolder}/${row.candidate}.json`,'utf8'));if(d.proofDigest&&proof.digest!==d.proofDigest)continue;d.proof=proof;d.proofFile=`../candidates/${proofFolder}/${row.candidate}.json`;break}catch{}
 if(d.role==='arena')try{const duel=JSON.parse(await readFile(`${folder}/${d.id}-duel.json`,'utf8'));if(duel.digest===d.proofDigest)d.duelProof=duel}catch{}
 if(d.role==='arena')d.broadDuel=broadDuel;
 d.technicalFlags=[...(d.proof?.flags||[]),...d.shape.gates.filter(g=>g.status!=='pass').map(g=>`shape: ${g.metric}`)];if(d.role==='arena'&&(!d.duelProof||d.duelProof.timeouts))d.technicalFlags.push(d.duelProof?`actual duel unresolved: ${d.duelProof.timeouts}/${d.duelProof.trials.length}`:'actual duel proof pending');
 d.technicalStatus=d.proof?.seeds===12?(d.technicalFlags.length?'flagged':'proved'):'pending';
 d.ownerKeep=owner.keeps.includes(d.id);d.assignment=owner.assignment[d.slot]===d.id?'Campaign':owner.alternates.includes(d.id)?'Practice alternate':'Owner review';d.bossBalance=bossBalance?.candidates[d.id]||null;courses.push(d);
}
const legacy=JSON.parse(await readFile('tracks/atlas/shapes.json','utf8')),runoff=legacy.courses.find(c=>c.id==='runoff');
courses.push({id:'switchback-4-runoff',slot:'switchback-4',role:'accepted',tier:3,laps:6,oldLaps:6,family:'Owner accepted original',course:runoff.course,before:runoff.course,shape:runoff.shape,gates:[],geometry:{lint:[]},accepted:true});
try{courses.at(-1).proof=JSON.parse(await readFile(`${folder}/${finalProof?'proof-final':'proof-12'}/switchback-4-runoff.json`,'utf8'));courses.at(-1).proofFile=`../candidates/${finalProof?'proof-final':'proof-12'}/switchback-4-runoff.json`}catch{}
courses.sort((a,b)=>['scrap','foundry','salt','switchback','crown'].indexOf(a.slot.replace(/-\d+$/,''))-['scrap','foundry','salt','switchback','crown'].indexOf(b.slot.replace(/-\d+$/,'')) || a.slot.localeCompare(b.slot) || a.id.localeCompare(b.id));
function normalized(s){const ps=s.outline.filter((_,i)=>i%4===0),x=ps.reduce((s,p)=>s+p[0],0)/64,y=ps.reduce((s,p)=>s+p[1],0)/64,r=Math.sqrt(ps.reduce((s,p)=>s+(p[0]-x)**2+(p[1]-y)**2,0)/64);return ps.map(p=>[(p[0]-x)/r,(p[1]-y)/r])}
const prepared=courses.filter(c=>!c.accepted).map(c=>({id:c.id,points:normalized(c.shape),turns:Array.from({length:64},(_,i)=>c.shape.turningSignature.slice(i*4,i*4+4).reduce((a,b)=>a+b,0))}));
const pairs=[];
for(let ai=0;ai<prepared.length;ai++)for(let bi=ai+1;bi<prepared.length;bi++) {
 const a=prepared[ai],b=prepared[bi];let outline=Infinity,turning=Infinity;
 for(const reverse of [-1,1])for(const mirror of [-1,1])for(let shift=0;shift<64;shift++) {
  let dot=0,cross=0,diff=0;
  for(let i=0;i<64;i++){const j=(shift+reverse*i+128)%64,p=a.points[i],q=b.points[j];dot+=p[0]*q[0]+p[1]*q[1]*mirror;cross+=p[0]*q[1]*mirror-p[1]*q[0];diff+=Math.abs(a.turns[i]-b.turns[j]*mirror*reverse)}
  outline=Math.min(outline,Math.sqrt(Math.max(0,2-2*Math.hypot(dot,cross)/64)));turning=Math.min(turning,diff/(2*Math.PI));
 }
 pairs.push({a:a.id,b:b.id,outlineDistance:outline,turningDistance:turning,similar:outline<limits.outlineDistance||turning<limits.turningDistance});
}
for(const c of courses)if(!c.accepted)c.nearest=pairs.filter(p=>p.a===c.id||p.b===c.id).sort((a,b)=>a.outlineDistance-b.outlineDistance)[0]||null;
let hunterEvidence=null;try{hunterEvidence=JSON.parse(await readFile(`${folder}/hunter-evidence.json`,'utf8'));hunterEvidence.episodes=hunterEvidence.episodes.filter(e=>courses.some(c=>c.id===e.candidate&&c.proofDigest===e.digest))}catch{}
let activeHunterEvidence=null;try{activeHunterEvidence=JSON.parse(await readFile(`${folder}/hunter-active-evidence.json`,'utf8'));const log=await readFile('evidence/tracks/r3-hunter-active.log','utf8');activeHunterEvidence.checkedTrials=[...log.matchAll(/HUNTER \S+ \d+ episodes in (\d+) six-car trials/g)].reduce((n,m)=>n+Number(m[1]),0)}catch{}
const result={version:'owner-applied-v2',freshFinalProof:finalProof,generated:new Date().toISOString(),expectedCandidates:manifest.length,expectedSlots:35,pendingSlots:owner.pending,candidates:courses,pairs,outlineThresholds:limits,hunterEvidence,activeHunterEvidence,
 truth:'Recorded owner Keeps are installed; three duplicate Keeps remain practice alternates. Rejected and unreviewed proposals are archived outside the active library. Scrap-7 replacement and finale repair status are recorded in the apply notes. Runoff remains unchanged, including its measured baseline flag. Human feel and Stick evidence remain separate from simulation.'};
await writeFile('tracks/atlas/candidates.json',JSON.stringify(result));await writeFile('tracks/atlas/candidates-data.js',`window.TRACK_CANDIDATES=${JSON.stringify(result)};\n`);
await writeFile(`${folder}/outline-pairs.json`,JSON.stringify(pairs));
// The decision review retains rejected outlines and links to their archived bytes.
const archive='../excluded/owner-2026-10-04/rejected';
const archivedReview=await readFile('tracks/excluded/owner-2026-10-04/scrap-7-review-before.js','utf8');
const prior=JSON.parse(archivedReview.slice(archivedReview.indexOf('=')+1).trim().replace(/;$/, ''));
const boss=['scrap-7-d','scrap-7-e','scrap-7-f'].map(id=>{
 const c=structuredClone(courses.find(c=>c.id===id)||prior.candidates.find(c=>c.id===id));
 delete c.provisional;
 c.ownerDecision=owner.keeps.includes(id)?'Keep':'Reject';c.decisionFinal=true;
 if(c.ownerDecision==='Reject'){c.archived=true;c.archiveBase=archive;c.assignment='Archived owner Reject';c.ownerKeep=false;c.proofFile=`${archive}/proof-final/${id}.json`;}
 return c;
});
const review={...result,candidates:boss,expectedCandidates:3,expectedSlots:1,pendingSlots:[],pairs:prior.pairs,hunterEvidence:null,activeHunterEvidence:null,
 truth:'Owner decision recorded 2026-10-04: scrap-7-e (staggered-bays) Keep and assigned; scrap-7-d and scrap-7-f Reject and archived. Three laps, tier 1, Ash Yards. First place remains required for boss promotion. Boss balance is flagged: Rookie 4/32, Club 2/32, Pro 0/32 first-place wins. The archived alternatives retain their historical measurements.'};
await writeFile('tracks/atlas/scrap-7-data.js',`window.TRACK_CANDIDATES=${JSON.stringify(review)};\n`);
console.log(JSON.stringify({candidates:manifest.length,slots:new Set(courses.map(c=>c.slot)).size,similar:pairs.filter(p=>p.similar).length,proved:courses.filter(c=>c.technicalStatus==='proved').length}));
