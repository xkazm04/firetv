"use client";
import { useState } from "react";
import type { Event, Session } from "@/lib/session/store";
import { defaultPreferences, eligibleScenes, ENGLISH_SCENES, ENGLISH_SKILLS, PROGRESS_LABEL, recommendScene } from "@/lib/english/curriculum";
import { ABOUT_QUESTIONS, BAND_CAN, BAND_NAME, isBand, MAX_TASKS, PLAN_MAX, TOPIC_ASK_MAX } from "@/lib/english/placement";
import { BANDS, type Band, type Conversation, type EnglishLearning, type EnglishPreferences, type LevelCheck, type Placement } from "@/lib/english/types";
import { helpOf, lingaHome, lingaView, offeredActions, phonePanel, type ViewAction } from "@/lib/english/view";
import { ReplyBox } from "./ReplyBox";
import { useEnglish } from "./useEnglish";

type Run=(action:string,extra?:Record<string,unknown>)=>Promise<boolean>;
const KIND_WORD={say:"Say it",listen:"Listen and answer",choose:"Choose the reply"} as const;
const VERDICT_WORD={pass:"at this level",partial:"nearly there",fail:"not yet"} as const;
const skillName=(id:string)=>ENGLISH_SKILLS.find(x=>x.id===id)?.name??"";

export function LingaPhone({s,post,onSentence}:{s:Session;post:(e:Event)=>Promise<void>;onSentence:()=>void}){
  const {run,busy,error}=useEnglish(s),c=s.conversation;
  const profile=s.profiles.find(p=>p.id===s.learner.id),learning=s.englishLearning;
  const lc=s.check&&s.check.learnerId===s.learner.id?s.check:null;
  const [panel,setPanel]=useState<"talk"|"settings"|"map">("talk");
  const [prefs,setPrefs]=useState<EnglishPreferences>(learning.preferences??defaultPreferences(profile));
  const [notes,setNotes]=useState(learning.notes.join("\n"));
  const [message,setMessage]=useState("");
  const pending=busy||!!c?.pending;
  const scene=c?.scene??ENGLISH_SCENES.find(x=>x.id===c?.sceneId);
  const save=async()=>{if(await run("preferences",{preferences:prefs,notes:notes.split("\n").map(n=>n.trim()).filter(Boolean)})){setMessage("Your learning preferences are saved. They apply to your next situation.");setPanel("talk");}};
  const currentQuestion=c?.turns.at(-1)?.text;
  // what the phone may draw beyond its own panel's fixed controls comes from the Linga screen model (lib/english/view.ts)
  const offered=offeredActions(lingaView(s)),offer=(id:string)=>offered.find(a=>a.id===id);
  const cue=offer("cue"),quiz=offer("quiz"),panelOf=phonePanel(s);
  return <div className="pscreen linga-phone">
    <h3>Linga · {s.learner.name}</h3>
    <div className="linga-buttons"><button className="pbtn" data-secondary={panel!=="talk"} onClick={()=>setPanel("talk")}>Talk</button><button className="pbtn" data-secondary={panel!=="settings"} onClick={()=>{setPrefs(learning.preferences??defaultPreferences(profile));setNotes(learning.notes.join("\n"));setPanel("settings");}}>Set up</button><button className="pbtn" data-secondary={panel!=="map"} onClick={()=>setPanel("map")}>My map</button></div>
    {panel==="settings"&&<>
      <p>Choose what feels useful. English level, imagination and social challenge are separate.</p>
      <label>Your level<select value={isBand(prefs.level)?prefs.level:"A1"} onChange={e=>setPrefs({...prefs,level:e.target.value as Band})}>{BANDS.map(b=><option key={b} value={b}>{b} · {BAND_NAME[b]}</option>)}</select></label>
      <p className="linga-note">{learning.placement?.source==="check"?`Linga found ${learning.placement.band}. Changing it here makes it your own pick.`:"Not sure? Find your level with Linga from the Talk tab."}</p>
      <label>Interests<input value={prefs.interest} maxLength={160} placeholder="Games, music, travel, making things…" onChange={e=>setPrefs({...prefs,interest:e.target.value})}/></label>
      <label>What would you like to practise?<input value={prefs.goal} maxLength={160} placeholder="An interview, meeting people, school…" onChange={e=>setPrefs({...prefs,goal:e.target.value})}/></label>
      <label>Creativity<select value={prefs.creativity} onChange={e=>setPrefs({...prefs,creativity:e.target.value as EnglishPreferences["creativity"]})}><option value="familiar">Familiar situations</option><option value="playful">Playful details</option><option value="surprising">A harmless surprise</option></select></label>
      <label>Social challenge<select value={prefs.challenge} onChange={e=>setPrefs({...prefs,challenge:e.target.value as EnglishPreferences["challenge"]})}><option value="supportive">A supportive partner</option><option value="realistic">Everyday reactions</option><option value="stretch">More challenging follow-up questions</option></select></label>
      <label>Coaching preference<select value={prefs.correction} onChange={e=>setPrefs({...prefs,correction:e.target.value as EnglishPreferences["correction"]})}><option value="as-needed">Stop me to fix a mistake or teach a word</option><option value="pauses">Only coach me when I ask</option></select></label>
      {profile?.type==="other"&&profile.age===undefined&&<label className="linga-check"><input type="checkbox" checked={prefs.adultConfirmed} onChange={e=>setPrefs({...prefs,adultConfirmed:e.target.checked})}/><span>I am 18 or older. Include adult social situations.</span></label>}
      <label>What helps you learn? (one note per line)<textarea value={notes} maxLength={1900} placeholder="Give me time to think. Use short examples." onChange={e=>setNotes(e.target.value)}/></label>
      <p className="linga-note">Up to eight short notes. You can edit or remove them here. Preferences are remembered; raw microphone audio is not saved by this app.</p>
      <button className="pbtn" data-signal="true" disabled={pending} onClick={save}>Save preferences</button>
    </>}
    {panel==="map"&&<>
      <p>Your speaking evidence is separate from written and multiple-choice practice. These are learning indicators, not a certified level.</p>
      {ENGLISH_SKILLS.map(skill=>{const all=learning.evidence.filter(e=>e.skill===skill.id);return <div className="linga-skill" key={skill.id}><b>{skill.name}</b><small>Speaking: {PROGRESS_LABEL[learning.achievements[skill.id]??"not-tried"]}</small><small>{all.filter(e=>e.mode==="text").length} written · {all.filter(e=>e.mode==="choice").length} choice observations</small></div>;})}
      <a href={`/english/print?learner=${encodeURIComponent(s.learner.id)}`} target="_blank" rel="noreferrer">Open printable learning map</a>
      <details><summary>Things Linga taught you</summary><div className="linga-transcript">{learning.taught.slice(-12).reverse().map(m=><p key={m.id}><b>{m.title} · {m.kind==="fix"?"a fix":"a word"}</b>{m.kind==="fix"?<>“{m.said}” → “{m.better}”</>:<>“{m.said}”: {m.better}</>}<br/>{m.why}</p>)}{!learning.taught.length&&<p>Nothing yet. Linga stops a conversation when one thing is worth keeping.</p>}</div></details>
      <details><summary>Recent evidence</summary><div className="linga-transcript">{learning.evidence.slice(-12).reverse().map(e=><p key={e.id}><b>{skillName(e.skill)} · {e.mode} · {e.supported?"with support":"without a supplied phrase"}</b>“{e.quote}”<br/>{e.note}</p>)}{!learning.evidence.length&&<p>Nothing recorded yet. Start with a conversation.</p>}</div></details>
    </>}
    {panel==="talk"&&<>
      {panelOf==="check"&&lc?<CheckPanel lc={lc} run={run} busy={busy} hasPlan={!!learning.plan} leave={offered.find(a=>a.run.command?.action==="check-leave")}/>
      :panelOf==="moment"&&c?<MomentPanel c={c} run={run} busy={pending}/>
      :panelOf==="start"||!c?<StartPanel s={s} learning={learning} run={run} busy={pending} list={!!offer("pick-situation")}/>
      :<>
        <p><b>{c.title}</b><br/>{c.goal}</p>
        <div className="linga-status" aria-live="polite">{c.pending?"Your partner is preparing a reply…":c.paused?"Paused. Resume when you are ready.":c.phase==="coaching"?c.coaching?.note:currentQuestion||"Preparing your scene…"}</div>
        {c.error&&<p className="linga-error" role="alert">{c.error}</p>}
        {c.paused?<button className="pbtn" data-signal="true" onClick={()=>run("resume")}>Resume conversation</button>:c.phase==="coaching"?<>
          <p>One way to try it: “{c.coaching?.after}”</p><button className="pbtn" data-signal="true" disabled={pending} onClick={()=>run("replay")}>Replay with a new question</button>
        </>:<>
          {c.cue&&<p><b>{helpOf(c).tag}</b><br/>{c.cue}</p>}
          {c.quizOpen&&scene&&<><p>{scene.quiz.question}</p>{scene.quiz.options.map((x,i)=><button className="pbtn" data-secondary="true" key={x} disabled={pending} onClick={()=>run("choice",{option:i})}>{x}</button>)}</>}
          <ReplyBox ready={!!currentQuestion} busy={pending} question={c.turns.at(-1)?.id} stopWhen={c.paused||!!c.pending} onCapture={active=>run("capture",{active})}
            onSend={(text,mode,question,attempt)=>run("turn",{text,mode,lastTurnId:question,commandId:attempt})} note="Recorded as written practice. Edited transcripts also stay separate from speaking evidence."/>
          <div className="linga-buttons">{cue&&<button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("cue")}>{cue.label}</button>}{quiz&&<button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("quiz")}>{quiz.label}</button>}</div>
          <button className="pbtn" data-secondary="true" disabled={pending||!c.turns.some(t=>t.role==="learner")} onClick={()=>run("coach")}>Pause & coach</button>
        </>}
        <div className="linga-buttons"><button className="pbtn" data-secondary="true" onClick={()=>run(c.pending?"leave":"repeat")}>{c.pending?"Cancel pending turn":"Repeat audio"}</button><button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("finish")}>Finish rehearsal</button></div>
        {!c.turns.length&&!c.pending&&<button className="pbtn" onClick={()=>run("start",{sceneId:c.sceneId,replace:true})}>Retry preparing scene</button>}
        <details><summary>Conversation transcript</summary><div className="linga-transcript">{c.turns.map(t=><p key={t.id} data-role={t.role}><b>{t.role==="learner"?`You · ${t.mode==="speech"?"spoken":"written"}`:c.partner}</b>{t.text}</p>)}</div></details>
      </>}
      <button className="pbtn" data-secondary="true" onClick={()=>post({type:"subject",subject:"english"}).then(()=>post({type:"nav",screen:"linga"}))}>Linga on the TV</button>
      <button className="pbtn" data-secondary="true" onClick={onSentence}>Help with a sentence</button>
    </>}
    {error&&<p className="linga-error" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  </div>;
}

/** Finding the level, the verdict and the topic handshake, as the phone holds them. */
function CheckPanel({lc,run,busy,hasPlan,leave}:{lc:LevelCheck;run:Run;busy:boolean;hasPlan:boolean;leave?:ViewAction}){
  const [topic,setTopic]=useState("");
  const pending=busy||!!lc.pending;
  const status=lc.pending&&<div className="linga-status" aria-live="polite">Linga is thinking… this can take a little while.</div>;
  const problem=lc.error&&!lc.pending&&<p className="linga-error" role="alert">{lc.error}</p>;
  // Stop for now / Not now, as the view offers it (on the TV row, or as the phone's own through the tasks and the topics)
  const stop=leave&&<button className="pbtn" data-secondary="true" onClick={()=>run("check-leave")}>{leave.label}</button>;
  if(lc.stage==="about"){
    const q=lc.turns.at(-1),answered=lc.turns.filter(t=>t.role==="learner").length;
    return <>
      <p><b>Find your level</b><br/>Question {Math.min(answered+1,ABOUT_QUESTIONS)} of {ABOUT_QUESTIONS}. Answer in English or in your own language; both tell Linga something.</p>
      {status}{problem}
      {q?.role==="tutor"&&!lc.pending&&<div className="linga-status">{q.text}</div>}
      {!lc.turns.length&&!lc.pending&&<button className="pbtn" data-signal="true" onClick={()=>run("check-retry")}>Try again</button>}
      {q?.role==="tutor"&&<ReplyBox ready={!lc.pending} busy={pending} question={q.id} onSend={(text,mode,question,attempt)=>run("check-answer",{text,mode,lastTurnId:question,commandId:attempt})}/>}
      {answered>0&&<details><summary>What you said so far</summary><div className="linga-transcript">{lc.turns.map(t=><p key={t.id} data-role={t.role==="learner"?"learner":"partner"}><b>{t.role==="learner"?"You":"Linga"}</b>{t.text}</p>)}</div></details>}
      {stop}
    </>;
  }
  if(lc.stage==="tasks"){
    const t=lc.task;
    return <>
      <p><b>Find your level</b><br/>Task {Math.min(lc.tasks.length+1,MAX_TASKS)} of up to {MAX_TASKS}. Some are easy and some are hard; that is how Linga finds your level.</p>
      {status}{problem}
      {!t&&!lc.pending&&<button className="pbtn" data-signal="true" onClick={()=>run("check-retry")}>Try again</button>}
      {t&&<>
        <div className="linga-status"><b>{KIND_WORD[t.kind]}</b><br/>{t.kind==="listen"?<>Listen to the TV, then answer: {t.prompt}</>:t.prompt}</div>
        {t.kind==="listen"&&(t.revealed?<p>“{t.line}”</p>:<div className="linga-buttons"><button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("check-repeat")}>Hear it again</button><button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("check-reveal")}>Show the words</button></div>)}
        {t.kind==="choose"
          ?t.options.map((x,i)=><button className="pbtn" data-secondary="true" key={x} disabled={pending} onClick={()=>run("check-task",{taskId:t.id,option:i})}>{x}</button>)
          :<ReplyBox key={t.id} ready={!lc.pending} busy={pending} onSend={(text,mode,_q,attempt)=>run("check-task",{taskId:t.id,text,mode,commandId:attempt})}/>}
        <button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("check-task",{taskId:t.id,skip:true})}>I don&apos;t know</button>
      </>}
      {stop}
    </>;
  }
  if(lc.stage==="verdict"&&lc.placement)return <VerdictPanel placement={lc.placement} run={run} busy={pending} hasPlan={false}/>;
  if(lc.stage==="plan"&&lc.askGoal)return <>
    <p><b>Your topics</b><br/>What would you like to practise in English? A situation you want to handle, or something you enjoy talking about. Any language is fine.</p>
    {status}{problem}
    <ReplyBox ready busy={pending} onSend={(text,_mode,_q,attempt)=>run("plan-goal",{text,commandId:attempt})}/>
    <button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("plan-goal",{skip:true})}>Let Linga pick</button>
    {stop}
  </>;
  return <>
    <p><b>Your topics</b><br/>Conversations picked for your level and interests. Swap any you don&apos;t want, or add your own.</p>
    {status}{problem}
    {!lc.topics.length&&!lc.pending&&<button className="pbtn" data-signal="true" onClick={()=>run("check-retry")}>Try again</button>}
    {lc.topics.map(t=><div className="linga-skill" key={t.id}><b>{t.title}</b><small>{skillName(t.skill)} · {t.partner}</small><small>{t.why}</small><button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("plan-swap",{topicId:t.id})}>Swap</button></div>)}
    {lc.topics.length<PLAN_MAX&&<label>Add a topic in your own words<textarea value={topic} maxLength={TOPIC_ASK_MAX} placeholder="Ordering food on holiday, talking about football…" onChange={e=>setTopic(e.target.value)}/><small className="linga-note">{topic.length} of {TOPIC_ASK_MAX} characters</small></label>}
    {topic.trim()&&<button className="pbtn" disabled={pending} onClick={async()=>{if(await run("plan-add",{text:topic}))setTopic("");}}>Add this topic</button>}
    {lc.topics.length>0&&<button className="pbtn" data-signal="true" disabled={pending} onClick={()=>run("plan-agree")}>Agree to these topics</button>}
    <button className="pbtn" data-secondary="true" disabled={pending} onClick={()=>run("plan-renew")}>All new topics</button>
    {hasPlan&&<p className="linga-note">Agreeing replaces your current plan.</p>}
    {stop}
  </>;
}

function VerdictPanel({placement,run,busy,hasPlan}:{placement:Placement;run:Run;busy:boolean;hasPlan:boolean}){
  const self=placement.source==="self";
  return <>
    <div className="linga-band"><b>{placement.band}</b><span>{BAND_NAME[placement.band]}</span></div>
    <p>{placement.summary||BAND_CAN[placement.band]}</p>
    <p className="linga-note">{self?"You chose this level yourself.":`Linga's read from your answers, not a certificate.${placement.confidence==="low"?" Your answers were mixed, so try the check again another day for a firmer read.":placement.confidence==="high"?" Your answers agreed with each other.":""}`}</p>
    {placement.focus&&!self&&<p><b>Next to practise:</b> {placement.focus}</p>}
    {placement.summary&&<p className="linga-note">{BAND_CAN[placement.band]}</p>}
    <button className="pbtn" data-signal="true" disabled={busy} onClick={()=>run(hasPlan?"plan-open":"plan-propose")}>See my topics</button>
    <button className="pbtn" data-secondary="true" disabled={busy} onClick={()=>run("check-start")}>{self?"Find my level with Linga":"Find my level again"}</button>
    {placement.tasks.length>0&&!self&&<details><summary>What Linga saw</summary><div className="linga-transcript">{placement.tasks.map(t=><p key={t.id}><b>{t.band} · {KIND_WORD[t.kind]} · {VERDICT_WORD[t.verdict]}</b>{t.prompt}<br/>{t.response?`“${t.response}”`:"Skipped"}<br/>{t.note}</p>)}</div></details>}
  </>;
}

function SelfLevel({run,busy,start}:{run:Run;busy:boolean;start:Band}){
  const [band,setBand]=useState<Band>(start);
  return <details><summary>Or pick my level myself</summary>
    <label>Your level<select value={band} onChange={e=>setBand(e.target.value as Band)}>{BANDS.map(b=><option key={b} value={b}>{b} · {BAND_NAME[b]}</option>)}</select></label>
    <p className="linga-note">{BAND_CAN[band]}</p>
    <button className="pbtn" disabled={busy} onClick={()=>run("level-self",{band})}>Use {band}</button>
  </details>;
}

/** Linga home on the phone: the same six states the TV decides (lib/english/view.ts). */
function StartPanel({s,learning,run,busy,list}:{s:Session;learning:EnglishLearning;run:Run;busy:boolean;list:boolean}){
  const profile=s.profiles.find(p=>p.id===s.learner.id),c=s.conversation,prefs=learning.preferences??defaultPreferences(profile);
  const next=recommendScene(profile,learning),placement=learning.placement,home=lingaHome(s);
  const pick=list&&<label>Or choose a situation<select defaultValue="" onChange={e=>{if(e.target.value)void run("start",{sceneId:e.target.value,replace:true});e.target.value="";}} disabled={busy}><option value="">Choose…</option>{eligibleScenes(profile,prefs,learning).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>;
  const level=placement&&<p className="linga-note">Your level: <b>{placement.band} · {BAND_NAME[placement.band]}</b>{placement.source==="self"?" · self-chosen":""}</p>;
  const planned=<div className="linga-buttons"><button className="pbtn" data-secondary="true" disabled={busy} onClick={()=>run("plan-open")}>My topics</button><button className="pbtn" data-secondary="true" disabled={busy} onClick={()=>run("check-start")}>Find my level again</button></div>;
  let body;
  switch(home){
    case "resume":body=<>
      <p>Your conversation <b>{c?.title}</b> is waiting. Carry on from the last question.</p>
      <button className="pbtn" data-signal="true" disabled={busy} onClick={()=>run("resume")}>Carry on talking</button>
      {pick}
    </>;break;
    case "check-part-way":body=<>
      <p><b>Find your level</b><br/>You stopped part way. Carry on from where you were.</p>
      <button className="pbtn" data-signal="true" disabled={busy} onClick={()=>run("check-resume")}>Carry on</button>
      <button className="pbtn" data-secondary="true" disabled={busy} onClick={()=>run("check-start")}>Start again</button>
    </>;break;
    case "no-placement":body=<>
      <p><b>Let&apos;s find your level</b><br/>Three questions about you, then a few short tasks. About seven minutes. Answer in English or your own language.</p>
      <button className="pbtn" data-signal="true" disabled={busy} onClick={()=>run("check-start")}>Find my level</button>
      <SelfLevel run={run} busy={busy} start={isBand(prefs.level)?prefs.level:"A1"}/>
      {pick}
    </>;break;
    case "no-plan":body=<>
      <VerdictPanel placement={placement!} run={run} busy={busy} hasPlan={false}/>
      {pick}
    </>;break;
    case "plan-done":body=<>
      {level}
      <p><b>Every topic talked through</b><br/>Ask Linga for a fresh set of conversations, or go back to one you enjoyed.</p>
      <button className="pbtn" data-signal="true" disabled={busy} onClick={()=>run("plan-propose")}>New topics</button>
      <button className="pbtn" data-secondary="true" disabled={busy} onClick={()=>run("start",{sceneId:next.id,replace:true})}>Talk again: {next.name}</button>
      {pick}{planned}
    </>;break;
    case "next-topic":body=<>
      {level}
      <p>Next topic: <b>{next.name}</b><br/>{next.goal}</p>
      <button className="pbtn" data-signal="true" disabled={busy} onClick={()=>run("start",{sceneId:next.id,replace:true})}>Start talking</button>
      {pick}{planned}
    </>;break;
  }
  return <>
    {c?.phase==="finished"&&<>
      <p className="linga-status">Rehearsal saved. Your map shows the evidence you collected.</p>
      {(c.moments??[]).length>0&&<div className="linga-transcript"><b>From this rehearsal</b>{c.moments.map(m=><p key={m.id}>{m.kind==="fix"?<>“{m.said}” → “{m.better}”</>:<>“{m.said}”: {m.better}</>}<br/><small>{m.why}</small></p>)}</div>}
    </>}
    {body}
  </>;
}

function MomentPanel({c,run,busy}:{c:Conversation;run:Run;busy:boolean}){
  const m=c.moment!;
  return <>
    <p><b>{m.kind==="fix"?"One thing to fix":"A word for this scene"}</b></p>
    <div className="linga-status">{m.kind==="fix"?<>You said “{m.said}”<br/>Try “{m.better}”</>:<>You wanted to say “{m.said}”<br/>In English: “{m.better}”</>}</div>
    <p>{m.why}</p>
    <button className="pbtn" data-signal="true" disabled={busy} onClick={()=>run("moment-done")}>Back to the conversation</button>
  </>;
}
