const fs=require('fs');const crit=require('./critic.json');
for(const x of crit.cards.filter(c=>c.verdict==='revise')){
  const f=`cards/${x.host}.json`;const d=JSON.parse(fs.readFileSync(f,'utf8'));
  const card=d.cards.find(c=>c.slot.startsWith(x.slot[0])&&c.title===x.title)||d.cards.find(c=>c.slot[0]===x.slot[0]);
  card.critic_revise=x.revise;card.acceptance.push('CRITIC REVISE (binding): '+x.revise);
  fs.writeFileSync(f,JSON.stringify(d,null,2));console.log('revised',x.host,x.slot);
}
const rows=[];for(const x of crit.cards){const d=JSON.parse(fs.readFileSync(`cards/${x.host}.json`,'utf8'));const c=d.cards.find(c=>c.title===x.title);
 const mean=(x.ambition.score+x.grounding.score+x.falsifiability.score)/3;rows.push({x,c,mean,rank:c.impact*mean});}
rows.sort((a,b)=>b.rank-a.rank);
let md='# Deck - challenge-2026-09-25\n\n| # | card | size | risk | impact | gate | files | critic A/G/F | rank | verdict |\n|---|---|---|---|---|---|---|---|---|---|\n';
rows.forEach((r,i)=>md+=`| ${i+1} | **${r.x.host} ${r.x.slot[0]}** ${r.c.title} | ${r.c.size} | ${r.c.risk} | ${r.c.impact} | ${r.c.gate} | ${r.c.write_set.length} | ${r.x.ambition.score}/${r.x.grounding.score}/${r.x.falsifiability.score} | ${r.rank.toFixed(1)} | ${r.x.verdict} |\n`);
md+='\n'+rows.map(r=>`- **${r.x.host} ${r.x.slot[0]}** - ${r.x.deck_line}`).join('\n')+'\n';
fs.writeFileSync('deck.md',md);console.log(md);
