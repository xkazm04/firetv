import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const folder='tracks/candidates',out='evidence/tracks/r3/final-revisions';await mkdir(out,{recursive:true});
const reject=['foundry-5-c','salt-2-c','foundry-2-b','switchback-2-b'];
const manifest=await readFile(`${folder}/manifest.csv`,'utf8');await writeFile(`${out}/manifest-before.csv`,manifest);
for(const id of reject)await copyFile(`${folder}/recipes/${id}.csv`,`${out}/${id}-duplicate.csv`);
await writeFile(`${folder}/manifest.csv`,manifest.split(/\r?\n/).filter(l=>!reject.includes(l.split(',')[0])).join('\n'));
const widen=['scrap-4-b','foundry-6-a','foundry-6-c','foundry-7-a','foundry-7-b','foundry-7-c','salt-1-c','salt-5-c','salt-6-a','salt-6-c','salt-7-a','salt-7-b'];
const scale={'scrap-7-c':1.18,'foundry-4-b':1.16,'foundry-4-c':1.2,'foundry-6-c':1.35};
for(const id of new Set([...widen,...Object.keys(scale)])){
 const recipe=await readFile(`${folder}/recipes/${id}.csv`,'utf8');await writeFile(`${out}/${id}-before.csv`,recipe);
 const revised=recipe.trim().split(/\r?\n/).map((line,i)=>{if(!i)return line;const r=line.split(',');if(r[0]==='anchor'){if(widen.includes(id))r[4]=String(Math.max(4.15,+r[4]));if(scale[id])r[2]=String(+r[2]*scale[id])}return r.join(',')}).join('\n')+'\n';await writeFile(`${folder}/recipes/${id}.csv`,revised);
}
await writeFile(`${out}/reasons.json`,JSON.stringify({reject,reason:'Global outline similarities appeared after pacing revisions; regenerate against all retained outlines.',widen,scale,scaleReason:'Actual six-car lap winner was too early; lengthen road, preserve laps.'},null,2));
