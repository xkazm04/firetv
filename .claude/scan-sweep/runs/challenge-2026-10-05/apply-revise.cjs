const fs=require('fs');
const crit=JSON.parse(fs.readFileSync('critic.json','utf8'));
const hosts=['math-buddy','landing','tv-app','engines','uat','linga'];
const out=[];
for(const h of hosts){
  const f=JSON.parse(fs.readFileSync('cards/'+h+'.json','utf8'));
  for(const c of f.cards){
    const k=crit.cards.find(x=>x.host===h&&x.slot===c.slot);
    c.critic={verdict:k.verdict,ambition:k.ambition.score,grounding:k.grounding.score,falsifiability:k.falsifiability.score,deck_line:k.deck_line};
    if(k.gate_should_be&&k.gate_should_be!==c.gate){c.gate_scout=c.gate;c.gate=k.gate_should_be}
    if(k.revise){c.acceptance.push('CRITIC REVISE: '+k.revise);c.rollback+=' | critic revise applied: guess limit with cooldown is part of the card.'}
    c.id=h+'-'+(c.slot[0]);
    c.rank=+(c.impact*(k.ambition.score+k.grounding.score+k.falsifiability.score)/3).toFixed(1);
    out.push(c);
  }
}
out.sort((a,b)=>b.rank-a.rank);
fs.writeFileSync('findings.jsonl',out.map(c=>JSON.stringify({type:'finding',skill:'scan-sweep',lens:c.lens,context:c.context,title:c.title,body:c.body,evidence:c.evidence,size:c.size,effort:c.effort,impact:c.impact,risk:c.risk,result:'better',method:'gate',gate:c.gate,disposition:'backlog'})).join('\n')+'\n');
fs.writeFileSync('cards-final.json',JSON.stringify(out,null,1));
let md='# Deck - challenge-2026-10-05\n\n| # | card | size | risk | impact | gate | files | critic A/G/F | rank | verdict |\n|---|---|---|---|---|---|---|---|---|---|\n';
out.forEach((c,i)=>{md+=`| ${i+1} | **${c.id}** ${c.title} | ${c.size} | ${c.risk} | ${c.impact} | ${c.gate} | ${c.write_set.length+(c.new_files||[]).length} | ${c.critic.ambition}/${c.critic.grounding}/${c.critic.falsifiability} | ${c.rank} | ${c.critic.verdict} |\n`});
md+='\n'+out.map(c=>`- **${c.id}** - ${c.critic.deck_line}`).join('\n')+'\n';
fs.writeFileSync('deck.md',md);
console.log(md);
// wave plan: A before B within host; disjoint non-shared write sets
const shared=new Set(['desk/package.json','.claude/scan-history/scan-sweep.jsonl','.claude/scan-history/challenge-runs.jsonl']);
const files=c=>new Set([...c.write_set,...(c.new_files||[])].filter(f=>!shared.has(f)));
const waves=[];const placed={};
const order=[...out].sort((a,b)=>(a.slot[0]==='A'?0:1)-(b.slot[0]==='A'?0:1)||b.rank-a.rank);
for(const c of order){
  let w=0;
  if(c.slot[0]==='B'&&placed[c.host+'-A']!==undefined)w=placed[c.host+'-A']+1;
  for(;;w++){
    waves[w]=waves[w]||[];
    const clash=waves[w].some(o=>[...files(c)].some(f=>files(o).has(f)));
    if(!clash&&waves[w].length<4)break;
  }
  waves[w].push(c);placed[c.host+'-'+c.slot[0]]=w;
}
fs.writeFileSync('waves.json',JSON.stringify(waves.map(w=>w.map(c=>c.id)),null,1));
waves.forEach((w,i)=>console.log('wave',i+1,w.map(c=>c.id).join(', ')));
