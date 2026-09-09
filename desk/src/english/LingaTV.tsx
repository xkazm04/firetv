"use client";
import { useEffect, useState } from "react";
import type { Event, Screen, Session } from "@/lib/session/store";
import { defaultPreferences, eligibleScenes, ENGLISH_SCENES, ENGLISH_SKILLS, PROGRESS_LABEL, PROGRESS_ORDER, recommendScene } from "@/lib/english/curriculum";
import { useEnglish } from "./useEnglish";
import { useEnglishAudio } from "./useEnglishAudio";

type Action={label:string;help:string;go:()=>void;disabled?:boolean};
export function LingaTV({s,post,voice}:{s:Session;post:(e:Event)=>Promise<void>;voice:boolean}){
  const {run,busy,error}=useEnglish(s),[menu,setMenu]=useState(false),[sceneIndex,setSceneIndex]=useState(0),[chapter,setChapter]=useState(0);
  const p=s.profiles.find(p=>p.id===s.learner.id),l=s.englishLearning,prefs=l.preferences??defaultPreferences(p);
  const scenes=eligibleScenes(p,prefs),recommended=recommendScene(p,l),c=s.conversation;
  const home=s.screen==="linga"||s.screen==="tonight";
  const audioStatus=useEnglishAudio(c,voice,!home&&["linga-talk","linga-coach"].includes(s.screen)&&!menu);
  const waiting=busy||!!c?.pending;
  useEffect(()=>{setMenu(false);setSceneIndex(0);setChapter(0);},[s.learner.id]);
  const nav=(screen:Screen)=>{setMenu(false);post({type:"nav",screen,focus:screen==="linga-talk"?-1:0});};
  const cmd=(action:string,extra:Record<string,unknown>={})=>{void run(action,extra);};
  const hasReply=!!c?.turns.some(t=>t.role==="learner");
  let tag="Tonight",title="English you can use",caption="",captionTag="Your mission",hero:React.ReactNode=null,actions:Action[]=[];
  if(home){
    const resume=c&&c.phase!=="finished"&&c.turns.length>0;
    title=resume?c.title:recommended.name;
    caption=resume?"Your conversation is waiting. Carry on from the last question.":recommended.goal;
    hero=<><div className="linga-kicker">{resume?"Continue your rehearsal":!l.preferences?"Start with support · adjust on your phone":`${prefs.level} · ${prefs.creativity}`}</div><h1>{title}</h1><div className="linga-subtitle">{ENGLISH_SKILLS.find(x=>x.id===(resume?c.focusSkill:recommended.skill))?.name}</div><img className="linga-mascot" src="/brand/linga.png" alt="" /></>;
    actions=[{label:resume?"Carry on talking":"Start talking",help:caption,go:()=>cmd(resume?"resume":"start",{sceneId:recommended.id,replace:true})},{label:"Choose a situation",help:"Choose a goal and practise it in a conversation.",go:()=>nav("linga-scenes")}];
  }else if(s.screen==="linga-scenes"){
    const scene=scenes[sceneIndex%scenes.length];tag=`Situation ${sceneIndex%scenes.length+1} of ${scenes.length}`;title=scene.name;caption=scene.goal;
    hero=<><div className="linga-kicker">{scene.partner} · {scene.minutes} minutes</div><h1>{title}</h1><div className="linga-subtitle">{ENGLISH_SKILLS.find(x=>x.id===scene.skill)?.name}</div><SceneArt kind={scene.id}/></>;
    actions=[{label:"Start this situation",help:scene.goal,go:()=>cmd("start",{sceneId:scene.id,replace:true})},{label:"Next situation",help:scenes[(sceneIndex+1)%scenes.length].goal,go:()=>setSceneIndex(i=>(i+1)%scenes.length)}];
  }else if(s.screen==="linga-map"){
    const skill=ENGLISH_SKILLS[chapter],progress=l.achievements[skill.id]??"not-tried";
    const typed=l.evidence.filter(e=>e.skill===skill.id&&e.mode==="text").length;
    tag=`Chapter ${chapter+1} of 8`;title=skill.name;caption=skill.goal;
    hero=<><div className="linga-kicker">Speaking progress · {PROGRESS_LABEL[progress]}</div><h1>{title}</h1><ProgressTrack progress={progress}/>{typed>0&&<div className="linga-subtitle">{typed} written practice observations · speaking assessed separately</div>}</>;
    actions=[{label:"Previous chapter",help:ENGLISH_SKILLS[(chapter+7)%8].goal,go:()=>setChapter(x=>(x+7)%8)},{label:"Next chapter",help:ENGLISH_SKILLS[(chapter+1)%8].goal,go:()=>setChapter(x=>(x+1)%8)}];
  }else if(c&&s.screen==="linga-coach"&&c.coaching){
    tag="One useful change";title="Coach";caption=c.coaching.note;captionTag="Coach";
    hero=<div className="linga-comparison"><section><div className="linga-kicker">You said</div><div className="linga-quote">“{c.coaching.before}”</div></section><section><div className="linga-kicker">One way to try it</div><div className="linga-quote">“{c.coaching.after}”</div></section></div>;
    actions=[{label:"Replay the moment",help:"Try the same intention with a new question. The first retry is supported practice.",go:()=>cmd("replay")},{label:"Finish for today",help:"Save this rehearsal and see what you practised.",go:()=>cmd("finish")}];
  }else if(c&&s.screen==="linga-recap"){
    tag="Your rehearsal";title="Take it somewhere new";
    const attempts=c.turns.filter(t=>t.role==="learner"),spoken=attempts.filter(t=>t.mode==="speech").length;
    const progress=l.achievements[c.focusSkill]??"not-tried";
    hero=<><div className="linga-kicker">{c.title}</div><h1>{title}</h1><ProgressTrack progress={progress}/><div className="linga-subtitle">{spoken} spoken · {attempts.length-spoken} written replies</div></>;
    caption=attempts.length?`Next, try ${recommendScene(p,l).name.toLowerCase()}. Your notes and learning map are on the phone.`:"You explored the scene. Try a reply next time; no speaking progress was recorded.";
    actions=[{label:"Another situation",help:"Choose a fresh context for your next conversation.",go:()=>nav("linga-scenes")},{label:"Learning map",help:"See saved evidence for each ability; printing is on the phone.",go:()=>nav("linga-map")}];
  }else if(c){
    tag=c.phase==="replay"?"Try it again":"Conversation";title=c.goal;
    const currentScene=ENGLISH_SCENES.find(x=>x.id===c.sceneId)!;
    caption=c.pending?"Take a moment. Your partner is preparing the next turn.":c.paused?"The scene is paused. Resume when you are ready.":c.capture?"Listening on your phone. Stop when you are ready to review your words.":c.cue||c.turns.at(-1)?.text||"Preparing a situation that fits your goal.";
    captionTag=c.cue?"A little support":c.pending?"Preparing":c.capture?"Your turn":c.partner;
    if(c.quizOpen){
      hero=<><div className="linga-kicker">A little support · recognition practice</div><h1 className="linga-smaller">{currentScene.quiz.question}</h1><div className="linga-choices">{currentScene.quiz.options.map((x,i)=><div key={x}><small>0{i+1}</small>{x}</div>)}</div></>;
      actions=currentScene.quiz.options.map((x,i)=>({label:`Option ${i+1}`,help:x,go:()=>cmd("choice",{option:i})}));
    }else{
      hero=<><div className="linga-kicker">{c.title}</div><h1 className="linga-smaller">{title}</h1><div className="linga-speaker"><span className="linga-wave">▂ ▆ ▃ ▇ ▂</span>{c.partner}</div><SceneArt kind={c.sceneId}/></>;
      actions=!c.turns.length&&!c.pending?[{label:"Retry the scene",help:"Try preparing this situation again.",go:()=>cmd("start",{sceneId:c.sceneId,replace:true})},{label:"Choose another",help:"Choose a different situation.",go:()=>nav("linga-scenes")}]:c.paused?[{label:"Resume",help:"Return to the last question. Your words are kept.",go:()=>cmd("pause")},{label:"Finish rehearsal",help:"End here and keep your learning evidence.",go:()=>cmd("finish")}]:[{label:c.pending?"Cancel & go back":"Give me a cue",help:c.pending?"Cancel the pending reply and keep the conversation for later.":"Get a phrase starter, then try your own reply on the phone.",go:()=>cmd(c.pending?"leave":"cue")},{label:hasReply?"Pause & coach":"Choose a phrase",help:hasReply?"Work on one useful change, then replay this moment.":"Compare two phrases before returning to speaking.",go:()=>cmd(hasReply?"coach":"quiz"),disabled:waiting}];
    }
  }else{caption="Choose a situation to begin.";hero=<h1>A place to practise</h1>;actions=[{label:"Choose a situation",help:caption,go:()=>nav("linga-scenes")}];}
  if(menu){tag="Your controls";captionTag="Your choice";hero=<><div className="linga-kicker">Linga</div><h1>Make it work for you</h1><div className="linga-menu-list">{["Back to the scene","Learning map","Choose a situation","Phone setup","Sentence help",...(c&&c.phase!=="finished"?["Finish rehearsal"]:[])].map((name,i)=><div key={name} data-selected={s.focus===i}>{String(i+1).padStart(2,"0")} / {name}</div>)}</div></>;
    actions=[{label:"Back to the scene",help:"Return to where you were.",go:()=>{setMenu(false);post({type:"focus",focus:-1});}},{label:"Learning map",help:"Explore the abilities you can practise and your speaking progress.",go:()=>nav("linga-map")},{label:"Choose a situation",help:"Choose a new scene; your existing evidence stays saved.",go:()=>nav("linga-scenes")},{label:"Phone setup",help:"Open Linga on the phone to set your interests, goals and learning preferences.",go:()=>post({type:"nav",screen:"pair",from:s.screen})},{label:"Sentence help",help:"Open Say it on the phone for help with a particular sentence.",go:()=>nav("sentence")},...(c&&c.phase!=="finished"?[{label:"Finish rehearsal",help:"End this scene and save a recap.",go:()=>{setMenu(false);cmd("finish");}}]:[])];
    caption=actions[Math.max(0,s.focus)]?.help??actions[0].help;
  }
  const focus=s.focus;
  const showHelp=focus>=0&&!waiting&&!c?.capture;
  if(showHelp&&actions[focus])caption=actions[focus].help;
  if(error||c?.error&&!home){caption=error||c!.error;captionTag="Try again";}
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLElement&&e.target.closest(".bar"))return;
      const k=e.key;if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter","Escape","Backspace","m","M"," "].includes(k))return;
      e.preventDefault();
      if(k==="m"||k==="M"){setMenu(v=>!v);post({type:"focus",focus:0});return;}
      if(k==="Escape"||k==="Backspace"){if(menu){setMenu(false);post({type:"focus",focus:-1});}else if(home)post({type:"nav",screen:"landing",focus:1});else if(c&&s.screen==="linga-talk")cmd("leave");else nav("linga");return;}
      if(k===" "){if(c)cmd("pause");return;}
      if(k==="ArrowUp"&&home&&!menu){post({type:"nav",screen:"learner",from:"linga"});return;}
      if(k.startsWith("Arrow")){const delta=k==="ArrowRight"||k==="ArrowDown"?1:-1;post({type:"focus",focus:focus<0?0:(focus+delta+actions.length)%actions.length});return;}
      const a=actions[Math.max(0,focus)];if(a&&!a.disabled&&(!waiting||a.label.startsWith("Cancel")))a.go();
    };
    addEventListener("keydown",handler);return()=>removeEventListener("keydown",handler);
  });
  return <div className="linga-tv" data-view={menu?"menu":s.screen}>
    <div className={`band ${home?"band-left-thin":s.screen==="linga-coach"?"band-divider":"band-rule"}`}/>
    <header className="linga-top"><b>Linga</b><span>{s.learner.name}</span><em>{tag}</em></header>
    <main className="linga-hero">{hero}</main>
    <div className="linga-caption"><span className="linga-kicker">{captionTag}</span><div aria-live="polite">{caption}</div></div>
    <nav className={`linga-actions ${menu?"linga-menu-actions":""}`} aria-label="Linga actions">{actions.map((a,i)=><button className="btn" key={a.label} data-focused={focus===i} disabled={a.disabled||(waiting&&!a.label.startsWith("Cancel"))} onMouseEnter={()=>post({type:"focus",focus:i})} onMouseLeave={()=>{if(s.screen==="linga-talk")post({type:"focus",focus:-1});}} onClick={a.go}>{menu?"Select · ":""}{a.label}</button>)}</nav>
    <footer className="linga-footer"><span>{waiting?"Preparing a reply…":c?.capture?"Phone microphone active":audioStatus||"TV shows · Phone speaks"}</span><button onClick={()=>{setMenu(v=>!v);post({type:"focus",focus:0});}}>Menu · M</button>{c&&!home&&<button onClick={()=>cmd("repeat")}>Repeat audio</button>}</footer>
  </div>;
}
function ProgressTrack({progress}:{progress:import("@/lib/english/types").Progress}){return <div className="linga-track">{PROGRESS_ORDER.map((id,i)=><div key={id} data-reached={i<=PROGRESS_ORDER.indexOf(progress)}><i/>{PROGRESS_LABEL[id]}</div>)}</div>;}
function SceneArt({kind}:{kind:string}){return <svg className="linga-scene-art" viewBox="0 0 240 220" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path opacity=".35" d="M10 190H225M25 20H200V175H25ZM42 43H180M42 65H135"/>{kind==="rover"?<><path d="M40 125H160L180 165H25ZM95 125V80H145V125M120 80V53L163 40"/><circle cx="60" cy="175" r="17"/><circle cx="150" cy="175" r="17"/></>:kind==="date"?<path d="M40 120H95V151H40ZM95 126H112V141H95M132 120H180V151H132ZM180 126H194V141H180M65 104V85M151 104V85M28 163H210"/>:<path d="M65 101H166V166H65ZM83 128L96 141 126 113M139 127H152M82 153H150"/>}</svg>;}
