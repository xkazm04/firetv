import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {inflateRawSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const csv=text=>{const lines=text.trim().split(/\r?\n/),keys=lines.shift().split(',');return lines.filter(Boolean).map(l=>Object.fromEntries(l.split(',').map((v,i)=>[keys[i],v])))};
function unzip(bytes){const result={},end=bytes.lastIndexOf(Buffer.from([0x50,0x4b,0x05,0x06]));assert.ok(end>=0);let at=bytes.readUInt32LE(end+16);for(let i=0;i<bytes.readUInt16LE(end+10);i++){assert.equal(bytes.readUInt32LE(at),0x02014b50);const method=bytes.readUInt16LE(at+10),size=bytes.readUInt32LE(at+20),n=bytes.readUInt16LE(at+28),extra=bytes.readUInt16LE(at+30),comment=bytes.readUInt16LE(at+32),local=bytes.readUInt32LE(at+42),name=bytes.subarray(at+46,at+46+n).toString(),start=local+30+bytes.readUInt16LE(local+26)+bytes.readUInt16LE(local+28),data=bytes.subarray(start,start+size);result[name]=(method===8?inflateRawSync(data):data).toString();at+=46+n+extra+comment}return result}
const campaign=csv(await readFile('core/src/main/resources/data/campaign.csv','utf8')),manifest=csv(await readFile('tracks/candidates/manifest.csv','utf8')),assignments=csv(await readFile('tracks/candidates/candidate-assignments.csv','utf8'));
assert.equal(campaign.length,35);assert.equal(manifest.length,102);assert.equal(assignments.length,103);assert.deepEqual([...new Set(assignments.map(r=>r.event))].sort(),campaign.map(r=>r.id).sort());
for(const event of campaign)assert.equal(manifest.filter(r=>r.slot===event.id).length,event.id==='switchback-4'?0:3,event.id);
assert.equal(new Set(manifest.map(r=>r.candidate)).size,102);
let trials=0,branches=0,junctions=0;const flags=[];
for(const row of manifest){
 const id=row.candidate,proofFolder=row.role==='arena'?'proof-12-traversal':'proof-12',d=JSON.parse(await readFile(`tracks/candidates/drafts/${id}.json`,'utf8')),p=JSON.parse(await readFile(`tracks/candidates/${proofFolder}/${id}.json`,'utf8')),zip=unzip(await readFile(`tracks/candidates/bundles/${id}.zip`));
 assert.equal(p.digest,d.proofDigest,id+' stale proof');assert.equal(p.sixCarTrials,72);assert.ok(p.repeatHashMatches);assert.deepEqual(d.geometry.lint,[]);assert.ok(d.shape.gates.every(g=>g.status==='pass'));assert.ok(d.gates.every(g=>g.status==='pass'));if(p.flags.length)flags.push({id,flags:p.flags});
 const event=csv(zip['campaign-row.csv'])[0],original=campaign.find(e=>e.id===row.slot);assert.equal(event.id,original.id);assert.equal(event.course,id);for(const key of Object.keys(original).filter(k=>!['course','laps'].includes(k)))assert.equal(event[key],original[key]);
 assert.equal(csv(zip['tracks-row.csv'])[0].id,id);assert.equal(csv(zip['track-pools-row.csv'])[0].course,id);assert.equal(csv(zip[`tracks/${id}-race.csv`])[0].laps,String(d.laps));assert.equal(csv(zip['course-pacing-rows.csv']).length,5);assert.ok(csv(zip['course-pacing-rows.csv']).every(r=>r.course===id));assert.equal(csv(zip['event-pacing-row.csv'])[0].event,row.slot);
 assert.equal(zip[`tracks/${id}.csv`],d.csv.nodes);assert.equal(zip[`tracks/${id}-spots.csv`],d.csv.spots);assert.equal(zip['design-recipe.csv'],d.recipe);assert.ok(zip['README.txt'].includes(d.proofDigest));
 const raw=gunzipSync(await readFile(`tracks/candidates/${proofFolder}/${id}-trials.ndjson.gz`)).toString().trim().split('\n').map(JSON.parse);assert.equal(raw.length,72);assert.equal(new Set(raw.map(t=>t.seed)).size,12);assert.equal(new Set(raw.map(t=>t.rotation)).size,6);assert.ok(raw.every(t=>t.assignments.length===6&&t.assignments.every(a=>a.human===false)));assert.ok(raw.every(t=>t.configuration.laps===d.laps));
 if(row.role==='arena'){const duel=JSON.parse(await readFile(`tracks/candidates/${id}-duel.json`,'utf8'));assert.equal(duel.digest,d.proofDigest);assert.equal(duel.trials.length,12);assert.ok(duel.trials.every(t=>t.entrants===2&&t.cars.every(c=>!c.human)));if(duel.timeouts)flags.push({id,flags:[`actual duel unresolved: ${duel.timeouts}/12`]})}
 trials+=raw.length;branches+=d.course.branches.length;junctions+=d.course.junctions.length;
}
assert.ok(branches>0,'Library needs an actual split route');assert.ok(junctions>0,'Library needs an actual declared crossing');
const result={pass:true,candidates:manifest.length,stableEvents:campaign.length,trials,branches,junctions,technicalFlags:flags,campaignSha256:createHash('sha256').update(await readFile('core/src/main/resources/data/campaign.csv')).digest('hex')};
await writeFile('evidence/tracks/r3/candidate-contract.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
