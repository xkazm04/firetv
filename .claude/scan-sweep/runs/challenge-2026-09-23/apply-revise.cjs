const fs=require('fs');const crit=require('./critic.json');
const rows=[];
for(const f of fs.readdirSync('cards')){const p='cards/'+f;const j=JSON.parse(fs.readFileSync(p,'utf8'));
 for(const c of j.cards){const v=crit.cards.find(x=>x.host===j.host&&x.slot===c.slot);
  c.critic={verdict:v.verdict,ambition:v.ambition.score,grounding:v.grounding.score,falsifiability:v.falsifiability.score,deck_line:v.deck_line};
  if(v.verdict==='revise'){c.critic_revise=v.revise;
   if(j.host==='engines'&&c.slot==='B'){c.write_set=c.write_set.filter(w=>!/lib\/session\/jobs\.ts|lib\/desk\/work\.ts/.test(w));c.depends_on=['desk-pipelines A'];}
   if(j.host==='uat'&&c.slot==='A'){c.read_deps=['desk/src/lib/english/view.ts'];c.depends_on=['linga A'];}}
  const mean=(v.ambition.score+v.grounding.score+v.falsifiability.score)/3;
  rows.push({id:j.host+' '+c.slot[0],title:c.title,size:c.size,risk:c.risk,impact:c.impact,gate:c.gate,ws:c.write_set.length,mean:+mean.toFixed(2),rank:+(c.impact*mean).toFixed(1),verdict:v.verdict,line:v.deck_line});}
 fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');}
rows.sort((a,b)=>b.rank-a.rank);
let md='# Deck - challenge-2026-09-23\n\n| # | card | size | risk | impact | gate | files | critic | rank | verdict |\n|---|---|---|---|---|---|---|---|---|---|\n';
rows.forEach((r,i)=>md+=`| ${i+1} | **${r.id}** ${r.title} | ${r.size} | ${r.risk} | ${r.impact} | ${r.gate} | ${r.ws} | ${r.mean} | ${r.rank} | ${r.verdict} |\n`);
md+='\n';rows.forEach(r=>md+=`- **${r.id}** - ${r.line}\n`);
fs.writeFileSync('deck.md',md);console.log(md);
