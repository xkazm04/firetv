"use client";
import { useSession } from "@/tv/useSession";
import { ENGLISH_SKILLS, PROGRESS_LABEL, recommendScene } from "@/lib/english/curriculum";
export default function EnglishPrint(){
  const {s}=useSession();if(!s)return <main className="linga-print">Loading your learning map…</main>;
  const requested=typeof window!=="undefined"?new URLSearchParams(window.location.search).get("learner"):null;
  if(requested&&requested!==s.learner.id)return <main className="linga-print"><h1>The learner changed</h1><p>Open the map again from the correct learner’s phone screen.</p></main>;
  const l=s.englishLearning,p=s.profiles.find(p=>p.id===s.learner.id),last=l.sessions.at(-1);
  return <main className="linga-print"><div className="no-print"><button onClick={()=>window.print()}>Print learning map</button></div><p>LINGA / ENGLISH YOU CAN USE</p><h1>{s.learner.name}’s conversation map</h1><p>{new Date().toLocaleDateString("en-GB")} · {l.preferences?.goal||"Build confidence in everyday English"}</p><table><thead><tr><th>Ability</th><th>Speaking</th><th>Other practice</th></tr></thead><tbody>{ENGLISH_SKILLS.map(skill=>{const e=l.evidence.filter(e=>e.skill===skill.id);return <tr key={skill.id}><td><b>{skill.name}</b><br/>{skill.goal}</td><td>{PROGRESS_LABEL[l.achievements[skill.id]??"not-tried"]}</td><td>{e.filter(e=>e.mode==="text").length} written<br/>{e.filter(e=>e.mode==="choice").length} choices</td></tr>;})}</tbody></table><h2>Next practice</h2><p>{recommendScene(p,l).name}: {recommendScene(p,l).goal}<br/>Ask for clarification when a question is unclear.<br/>Try one useful phrase in a different setting.</p>{last&&<p>Last rehearsal: {last.title} · {last.turns} learner replies.</p>}<footer>Not tried → With help → On your own → Used elsewhere.<br/>Based on saved practice evidence, with text and choice observations separate from speaking. Not a pronunciation score or certified CEFR level. No raw audio is stored by this app.</footer></main>;
}
