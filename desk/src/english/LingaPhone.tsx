"use client";
import { useEffect, useRef, useState } from "react";
import type { Event, Session } from "@/lib/session/store";
import { defaultPreferences, eligibleScenes, ENGLISH_SCENES, ENGLISH_SKILLS, PROGRESS_LABEL, recommendScene } from "@/lib/english/curriculum";
import type { EnglishPreferences } from "@/lib/english/types";
import { requestId, useEnglish } from "./useEnglish";

interface Recognition {
  lang:string;continuous:boolean;interimResults:boolean;
  onresult:((event:{results:ArrayLike<{isFinal:boolean;[index:number]:{transcript:string}}>})=>void)|null;
  onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;
  start:()=>void;stop:()=>void;abort:()=>void;
}
type SpeechWindow=Window&{SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};

export function LingaPhone({s,post,onSentence}:{s:Session;post:(e:Event)=>Promise<void>;onSentence:()=>void}){
  const {run,busy,error,setError}=useEnglish(s),c=s.conversation;
  const profile=s.profiles.find(p=>p.id===s.learner.id),learning=s.englishLearning;
  const [panel,setPanel]=useState<"talk"|"settings"|"map">(learning.preferences||c?"talk":"settings");
  const [prefs,setPrefs]=useState<EnglishPreferences>(learning.preferences??defaultPreferences(profile));
  const [notes,setNotes]=useState(learning.notes.join("\n"));
  const [draft,setDraft]=useState(""),[mode,setMode]=useState<"speech"|"text">("text"),[confirmed,setConfirmed]=useState(false);
  const [listening,setListening]=useState(false),[micAvailable,setMicAvailable]=useState(false),[micReason,setMicReason]=useState("");
  const [message,setMessage]=useState("");
  const recognition=useRef<Recognition|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),mounted=useRef(true),pendingId=useRef("");
  const questionId=useRef<string|undefined>(undefined);
  const pending=busy||!!c?.pending;
  const scene=ENGLISH_SCENES.find(x=>x.id===c?.sceneId);
  useEffect(()=>{
    mounted.current=true;
    const w=window as SpeechWindow;
    const ok=!!(w.SpeechRecognition||w.webkitSpeechRecognition)&&window.isSecureContext;
    setMicAvailable(ok);setMicReason(!window.isSecureContext?"Voice needs HTTPS on a phone (localhost also works). You can type your reply here.":!ok?"This browser does not support speech recognition. Type a reply instead.":"");
    return()=>{mounted.current=false;if(timer.current)clearTimeout(timer.current);const r=recognition.current;if(r){r.onend=null;r.onerror=null;r.onresult=null;r.abort();}if(r)void fetch("/api/english",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"capture",active:false,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:requestId()}),keepalive:true});};
  // This component is keyed by learner and episode; capture never follows a different learner.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{
    if(!c?.paused&&c?.phase!=="finished"&&!c?.pending)return;
    if(recognition.current)recognition.current.stop();
  },[c?.paused,c?.phase,c?.pending]);
  const changeDraft=(value:string)=>{if(!draft)questionId.current=c?.turns.at(-1)?.id;setDraft(value);setMode("text");setConfirmed(false);pendingId.current="";};
  const stop=()=>{recognition.current?.stop();};
  const startMic=async()=>{
    if(!c||pending||listening)return;
    setError("");setMessage("");
    if(!(await run("capture",{active:true})))return;
    if(!mounted.current)return;
    const w=window as SpeechWindow,Ctor=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!Ctor)return;
    const rec=new Ctor();recognition.current=rec;rec.lang="en-US";rec.continuous=true;rec.interimResults=true;
    questionId.current=c.turns.at(-1)?.id;pendingId.current="";setDraft("");setMode("speech");setConfirmed(false);setListening(true);
    rec.onresult=e=>{if(!mounted.current)return;const text=Array.from(e.results).map(r=>r[0].transcript).join(" ").trim();setDraft(text.slice(0,1200));};
    rec.onerror=e=>{if(mounted.current)setMessage(e.error==="not-allowed"?"Microphone permission was denied. You can enable it in your browser, or type a reply.":"The browser could not hear that reliably. Please retry or type your reply.");};
    rec.onend=()=>{if(timer.current)clearTimeout(timer.current);recognition.current=null;if(mounted.current){setListening(false);void run("capture",{active:false});}};
    try{rec.start();timer.current=setTimeout(()=>rec.stop(),45000);}catch{recognition.current=null;setListening(false);setMessage("The microphone could not start. Type your reply or try again.");void run("capture",{active:false});}
  };
  const send=async()=>{
    if(!c||!draft.trim()||listening||pending)return;
    if(mode==="speech"&&!confirmed){setMessage("Confirm that the words match what you said before sending.");return;}
    const id=pendingId.current||requestId();pendingId.current=id;
    if(await run("turn",{text:draft,mode,lastTurnId:questionId.current??c.turns.at(-1)?.id,commandId:id})){setDraft("");setMode("text");setConfirmed(false);pendingId.current="";questionId.current=undefined;setMessage("");}
  };
  const save=async()=>{if(await run("preferences",{preferences:prefs,notes:notes.split("\n").map(n=>n.trim()).filter(Boolean)})){setMessage("Your learning preferences are saved. They apply to your next situation.");setPanel("talk");}};
  const currentQuestion=c?.turns.at(-1)?.text;
  return <div className="pscreen linga-phone">
    <h3>Linga · {s.learner.name}</h3>
    <div className="linga-buttons"><button className="pbtn" disabled={listening} data-secondary={panel!=="talk"} onClick={()=>setPanel("talk")}>Talk</button><button className="pbtn" disabled={listening} data-secondary={panel!=="settings"} onClick={()=>{setPrefs(learning.preferences??defaultPreferences(profile));setNotes(learning.notes.join("\n"));setPanel("settings");}}>Set up</button><button className="pbtn" disabled={listening} data-secondary={panel!=="map"} onClick={()=>setPanel("map")}>My map</button></div>
    {panel==="settings"&&<>
      <p>Choose what feels useful. English comfort, imagination and social challenge are separate.</p>
      <label>Comfort in English<select value={prefs.level} onChange={e=>setPrefs({...prefs,level:e.target.value as EnglishPreferences["level"]})}><option value="beginner">Starting out · give me support</option><option value="developing">I can hold a short conversation</option><option value="confident">I want more nuanced practice</option></select></label>
      <label>Interests<input value={prefs.interest} maxLength={160} placeholder="Games, music, travel, making things…" onChange={e=>setPrefs({...prefs,interest:e.target.value})}/></label>
      <label>What would you like to practise?<input value={prefs.goal} maxLength={160} placeholder="An interview, meeting people, school…" onChange={e=>setPrefs({...prefs,goal:e.target.value})}/></label>
      <label>Creativity<select value={prefs.creativity} onChange={e=>setPrefs({...prefs,creativity:e.target.value as EnglishPreferences["creativity"]})}><option value="familiar">Familiar situations</option><option value="playful">Playful details</option><option value="surprising">A harmless surprise</option></select></label>
      <label>Social challenge<select value={prefs.challenge} onChange={e=>setPrefs({...prefs,challenge:e.target.value as EnglishPreferences["challenge"]})}><option value="supportive">A supportive partner</option><option value="realistic">Everyday reactions</option><option value="stretch">More challenging follow-up questions</option></select></label>
      <label>Coaching preference<select value={prefs.correction} onChange={e=>setPrefs({...prefs,correction:e.target.value as EnglishPreferences["correction"]})}><option value="pauses">Coach me at a pause</option><option value="as-needed">Help me as we go</option></select></label>
      {profile?.type==="other"&&profile.age===undefined&&<label className="linga-check"><input type="checkbox" checked={prefs.adultConfirmed} onChange={e=>setPrefs({...prefs,adultConfirmed:e.target.checked})}/><span>I am 18 or older. Include adult social situations.</span></label>}
      <label>What helps you learn? (one note per line)<textarea value={notes} maxLength={1900} placeholder="Give me time to think. Use short examples." onChange={e=>setNotes(e.target.value)}/></label>
      <p className="linga-note">Up to eight short notes. You can edit or remove them here. Preferences are remembered; raw microphone audio is not saved by this app.</p>
      <button className="pbtn" data-signal="true" disabled={pending} onClick={save}>Save preferences</button>
    </>}
    {panel==="map"&&<>
      <p>Your speaking evidence is separate from written and multiple-choice practice. These are learning indicators, not a certified level.</p>
      {ENGLISH_SKILLS.map(skill=>{const all=learning.evidence.filter(e=>e.skill===skill.id);return <div className="linga-skill" key={skill.id}><b>{skill.name}</b><small>Speaking: {PROGRESS_LABEL[learning.achievements[skill.id]??"not-tried"]}</small><small>{all.filter(e=>e.mode==="text").length} written · {all.filter(e=>e.mode==="choice").length} choice observations</small></div>;})}
      <a href={`/english/print?learner=${encodeURIComponent(s.learner.id)}`} target="_blank" rel="noreferrer">Open printable learning map</a>
      <details><summary>Recent evidence</summary><div className="linga-transcript">{learning.evidence.slice(-12).reverse().map(e=><p key={e.id}><b>{ENGLISH_SKILLS.find(x=>x.id===e.skill)?.name} · {e.mode} · {e.supported?"with support":"without a supplied phrase"}</b>“{e.quote}”<br/>{e.note}</p>)}{!learning.evidence.length&&<p>Nothing recorded yet. Start with a conversation.</p>}</div></details>
    </>}
    {panel==="talk"&&<>
      {!c||c.phase==="finished"?<>
        {c?.phase==="finished"&&<p className="linga-status">Rehearsal saved. Your map shows the evidence you collected.</p>}
        <p>Recommended: <b>{recommendScene(profile,learning).name}</b></p>
        <button className="pbtn" data-signal="true" disabled={pending} onClick={()=>run("start",{sceneId:recommendScene(profile,learning).id,replace:true})}>Start talking</button>
        <label>Or choose a situation<select defaultValue="" onChange={e=>{if(e.target.value)void run("start",{sceneId:e.target.value,replace:true});e.target.value="";}} disabled={pending}><option value="">Choose…</option>{eligibleScenes(profile,prefs).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      </>:<>
        <p><b>{c.title}</b><br/>{c.goal}</p>
        <div className="linga-status" aria-live="polite">{c.pending?"Your partner is preparing a reply…":c.paused?"Paused. Resume when you are ready.":listening?"Listening… tap Stop to review your words.":c.phase==="coaching"?c.coaching?.note:currentQuestion||"Preparing your scene…"}</div>
        {c.error&&<p className="linga-error" role="alert">{c.error}</p>}
        {c.paused?<button className="pbtn" data-signal="true" onClick={()=>run("resume")}>Resume conversation</button>:c.phase==="coaching"?<>
          <p>One way to try it: “{c.coaching?.after}”</p><button className="pbtn" data-signal="true" disabled={pending} onClick={()=>run("replay")}>Replay with a new question</button>
        </>:<>
          {c.cue&&<p>{c.cue}</p>}
          {c.quizOpen&&scene&&<><p>{scene.quiz.question}</p>{scene.quiz.options.map((x,i)=><button className="pbtn" data-secondary="true" key={x} disabled={pending} onClick={()=>run("choice",{option:i})}>{x}</button>)}</>}
          {micAvailable?<><button className="pbtn" data-signal="true" disabled={pending||!currentQuestion} aria-pressed={listening} onClick={listening?stop:startMic}>{listening?"Stop & review":"Speak a reply"}</button><p className="linga-note">Your browser may send speech to its recognition service. Tap to begin; review the transcript before sending.</p></>:<p className="linga-note">{micReason}</p>}
          <label>{mode==="speech"?"Check what the microphone heard":"Your reply"}<textarea value={draft} maxLength={1200} disabled={listening||pending} placeholder="Speak or type your own reply…" onChange={e=>changeDraft(e.target.value)}/></label>
          {mode==="speech"&&draft&&!listening&&<label className="linga-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>These are the words I said.</span></label>}
          {mode==="text"&&draft&&<p className="linga-note">Recorded as written practice. Edited transcripts also stay separate from speaking evidence.</p>}
          <button className="pbtn" disabled={pending||listening||!draft.trim()||mode==="speech"&&!confirmed} onClick={send}>Send reply</button>
          <div className="linga-buttons"><button className="pbtn" data-secondary="true" disabled={pending||listening} onClick={()=>run("cue")}>Give me a cue</button><button className="pbtn" data-secondary="true" disabled={pending||listening} onClick={()=>run("quiz")}>Choose a phrase</button></div>
          <button className="pbtn" data-secondary="true" disabled={pending||listening||!c.turns.some(t=>t.role==="learner")} onClick={()=>run("coach")}>Pause & coach</button>
        </>}
        <div className="linga-buttons"><button className="pbtn" data-secondary="true" disabled={listening} onClick={()=>run(c.pending?"leave":"repeat")}>{c.pending?"Cancel pending turn":"Repeat audio"}</button><button className="pbtn" data-secondary="true" disabled={pending||listening} onClick={()=>run("finish")}>Finish rehearsal</button></div>
        {!c.turns.length&&!c.pending&&<button className="pbtn" onClick={()=>run("start",{sceneId:c.sceneId,replace:true})}>Retry preparing scene</button>}
        <details><summary>Conversation transcript</summary><div className="linga-transcript">{c.turns.map(t=><p key={t.id} data-role={t.role}><b>{t.role==="learner"?`You · ${t.mode==="speech"?"spoken":"written"}`:c.partner}</b>{t.text}</p>)}</div></details>
      </>}
      <button className="pbtn" data-secondary="true" onClick={()=>post({type:"subject",subject:"english"}).then(()=>post({type:"nav",screen:"linga"}))}>Linga on the TV</button>
      <button className="pbtn" data-secondary="true" onClick={onSentence}>Help with a sentence</button>
    </>}
    {error&&<p className="linga-error" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  </div>;
}
